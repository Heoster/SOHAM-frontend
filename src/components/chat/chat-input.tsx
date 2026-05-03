'use client';

import {useForm, type SubmitHandler} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Send, Mic, Image as ImageIcon, Paperclip, X, FileImage, Scan, Wand2} from 'lucide-react';
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
    analysisType?: string;
  }) => {
    setIsAnalyzingImage(true);

    // Map analysis type to a problem type and prompt prefix
    const typeMap: Record<string, { problemType: string; prefix: string }> = {
      math:     { problemType: 'math',     prefix: 'Solve the math problem in this image step by step.' },
      ocr:      { problemType: 'ocr',      prefix: 'Extract and transcribe all text visible in this image.' },
      document: { problemType: 'document', prefix: 'Analyze and summarize this document or screenshot.' },
      creative: { problemType: 'creative', prefix: 'Describe this image creatively and suggest ideas inspired by it.' },
      general:  { problemType: 'general',  prefix: 'Analyze and describe what you see in this image.' },
    };
    const { problemType, prefix } = typeMap[payload.analysisType ?? 'general'] ?? typeMap.general;

    try {
      const response = await fetch('/api/ai/image-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUri: payload.imageDataUri,
          problemType,
          preferredModel: 'gemini-2.5-flash',
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Image analysis failed');
      if (!data.isSolvable && data.recognizedContent === 'Unable to process image') {
        throw new Error(data.solution || 'Image analysis failed');
      }

      onSendMessage(
        [
          `${prefix}`,
          `Image URL: ${payload.url}`,
          `Recognized content: ${data.recognizedContent}`,
          `Analysis: ${data.solution}`,
          'Use this image context for my follow-up questions.',
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
    }
  };

  const handleImageUpload = async (payload: {
    url: string;
    path: string;
    imageDataUri: string;
    contentType?: string;
    analysisType?: string;
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
      {/* Image Upload Modal — improved with analysis type selection */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setShowImageUpload(false)}>
          <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg border border-border shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b">
              <div>
                <h3 className="text-base font-semibold">Analyze Image</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Upload an image for AI analysis</p>
              </div>
              <button onClick={() => setShowImageUpload(false)} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <ImageUpload
                userId={userId}
                onImageUploaded={handleImageUpload}
                onCancel={() => setShowImageUpload(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Audio Recorder Modal */}
      {showAudioRecorder && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setShowAudioRecorder(false)}>
          <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md border border-border shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b">
              <h3 className="text-base font-semibold">Record Audio</h3>
              <button onClick={() => setShowAudioRecorder(false)} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <AudioRecorder
                onTranscribed={handleAudioTranscription}
                onCancel={() => setShowAudioRecorder(false)}
              />
            </div>
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
                          : isAnalyzingImage
                          ? 'Analyzing your image...'
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
                          className={cn('h-9 w-9 rounded-xl transition-all', isAnalyzingImage && 'text-primary animate-pulse')}
                          disabled={isLoading || isVoiceChatActive || isAnalyzingImage}
                          onClick={() => setShowImageUpload(true)}
                          title="Analyze image"
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span className="sr-only">Analyze image</span>
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
