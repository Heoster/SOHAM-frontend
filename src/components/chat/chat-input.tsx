'use client';

import {useForm, type SubmitHandler} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Send, Mic, Image as ImageIcon, Camera, Paperclip} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/utils';
import {ImageUpload} from './image-upload';
import {CameraCapture} from './camera-capture';
import {AudioRecorder} from './audio-recorder';
import {useIsMobile} from '@/hooks/use-mobile';
import {useToast} from '@/hooks/use-toast';

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type ChatFormValues = z.infer<typeof chatSchema>;

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  userId?: string; // Add userId prop
}

export function ChatInput({onSendMessage, isLoading, userId = 'anonymous'}: ChatInputProps) {
  const isMobile = useIsMobile();
  const {toast} = useToast();
  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      message: '',
    },
  });

  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = () => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.2
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const SpeechRecognition =
      window.webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API is not supported by this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      playSound();
      setIsListening(true);
    };

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onSendMessage(transcript);
      }
    };

    recognition.onerror = event => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.abort();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, [onSendMessage]);

  useEffect(() => {
    if (isVoiceChatActive && !isLoading && !isListening) {
      // Only start if recognition exists and is not already running
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Only log if it's not the expected "already started" error
          if (e instanceof Error && !e.message.includes('already')) {
            console.error('Speech recognition error:', e);
          }
        }
      }
    } else if (!isVoiceChatActive || isLoading) {
      // Safely abort if recognition is active
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors
        }
      }
    }
  }, [isVoiceChatActive, isLoading, isListening]);

  const handleVoiceButtonClick = () => {
    setIsVoiceChatActive(prev => !prev);
  };

  const analyzeUploadedImage = async (payload: {
    url: string;
    path: string;
    imageDataUri: string;
    contentType?: string;
  }) => {
    setIsAnalyzingImage(true);

    try {
      const response = await fetch('/api/ai/image-solver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageDataUri: payload.imageDataUri,
          problemType: 'general',
          preferredModel: 'gemini-2.5-flash',
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Image analysis failed');
      }
      if (!data.isSolvable && data.recognizedContent === 'Unable to process image') {
        throw new Error(data.solution || 'Image analysis failed');
      }

      onSendMessage(
        [
          `I uploaded an image: ${payload.url}`,
          `Vision model used: ${data.modelUsed || 'gemini-2.5-flash via Google Gemini 2.5 Flash (free tier)'}`,
          `Recognized content: ${data.recognizedContent}`,
          `Initial analysis: ${data.solution}`,
          'Use this uploaded image context for my next requests.',
        ].join('\n\n')
      );
    } catch (error) {
      toast({
        title: 'Image analysis failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzingImage(false);
      setShowImageUpload(false);
      setShowCamera(false);
    }
  };

  const handleImageUpload = async (payload: {
    url: string;
    path: string;
    imageDataUri: string;
    contentType?: string;
  }) => {
    await analyzeUploadedImage(payload);
  };

  const handleCameraCapture = async (payload: {
    url: string;
    path: string;
    imageDataUri: string;
    contentType?: string;
  }) => {
    await analyzeUploadedImage(payload);
  };

  const handleAudioTranscription = (text: string) => {
    onSendMessage(text);
    setShowAudioRecorder(false);
  };

  const onSubmit: SubmitHandler<ChatFormValues> = data => {
    onSendMessage(data.message);
    form.reset();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Upload Image</h3>
            <ImageUpload
              userId={userId}
              onImageUploaded={handleImageUpload}
              onCancel={() => setShowImageUpload(false)}
            />
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Take Photo</h3>
            <CameraCapture
              userId={userId}
              onImageCaptured={handleCameraCapture}
              onCancel={() => setShowCamera(false)}
            />
          </div>
        </div>
      )}

      {/* Audio Recorder Modal */}
      {showAudioRecorder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Record Audio</h3>
            <AudioRecorder
              onTranscribed={handleAudioTranscription}
              onCancel={() => setShowAudioRecorder(false)}
            />
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="message"
            render={({field}) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="rounded-3xl border bg-background shadow-sm">
                    <Textarea
                      placeholder={
                        isVoiceChatActive
                          ? 'Voice chat is active...'
                          : 'Ask me anything...'
                      }
                      rows={1}
                      className={cn(
                        'min-h-[56px] max-h-36 resize-none border-0 bg-transparent text-sm md:text-base py-4 pl-4 pr-4 shadow-none focus-visible:ring-0',
                        'transition-all duration-200',
                        isVoiceChatActive && 'border-destructive'
                      )}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading || isVoiceChatActive || isAnalyzingImage}
                      {...field}
                    />
                    <div className={cn(
                      'flex items-center justify-between gap-2 border-t px-2 pb-2 pt-2',
                      isMobile ? 'flex-wrap' : 'flex-nowrap'
                    )}>
                      <div className="flex items-center gap-1">
                      {/* Image Upload Button */}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl transition-all"
                        disabled={isLoading || isVoiceChatActive || isAnalyzingImage}
                        onClick={() => setShowImageUpload(true)}
                        title="Upload image"
                      >
                        <ImageIcon className="h-4 w-4" />
                        <span className="sr-only">Upload image</span>
                      </Button>

                      {/* Camera Button */}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl transition-all"
                        disabled={isLoading || isVoiceChatActive || isAnalyzingImage}
                        onClick={() => setShowCamera(true)}
                        title="Take photo"
                      >
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Take photo</span>
                      </Button>

                      {/* Audio Recorder Button */}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl transition-all"
                        disabled={isLoading || isVoiceChatActive || isAnalyzingImage}
                        onClick={() => setShowAudioRecorder(true)}
                        title="Record audio"
                      >
                        <Paperclip className="h-4 w-4" />
                        <span className="sr-only">Record audio</span>
                      </Button>

                      {/* Voice Chat Button */}
                      <Button
                        type="button"
                        size="icon"
                        variant={isVoiceChatActive ? 'destructive' : 'ghost'}
                        className={cn(
                          'h-9 w-9 rounded-xl transition-all',
                          isListening && 'animate-pulse scale-110'
                        )}
                        disabled={!recognitionRef.current}
                        onClick={handleVoiceButtonClick}
                        aria-pressed={isVoiceChatActive}
                        title={isVoiceChatActive ? 'Stop voice chat' : 'Start voice chat'}
                      >
                        <Mic className="h-4 w-4" />
                        <span className="sr-only">
                          {isVoiceChatActive ? 'Stop voice chat' : 'Start voice chat'}
                        </span>
                      </Button>
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <span className="hidden text-xs text-muted-foreground md:inline">
                          {isAnalyzingImage ? 'Analyzing image...' : 'Enter to send'}
                        </span>
                        <Button
                          type="submit"
                          className="h-9 rounded-xl px-4 shadow-sm"
                          disabled={isLoading || !form.formState.isValid || isVoiceChatActive || isAnalyzingImage}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
}
