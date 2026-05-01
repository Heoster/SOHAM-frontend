'use client';

import {type Chat, type Settings, type Message} from '@/lib/types';
import {ChatInput} from '@/components/chat/chat-input';
import {ChatMessages} from '@/components/chat/chat-messages';
import {ExamplePrompts} from '@/components/chat/example-prompts';
import {useState, useRef, useEffect, useCallback} from 'react';
import {useAuth} from '@/hooks/use-auth';
import {hybridTTS} from '@/lib/hybrid-tts';
import {VoiceFilter} from '@/lib/voice-filter';

/** Quick client-side check — mirrors the server intent detector for UI feedback only */
function looksLikeImageRequest(msg: string): boolean {
  return /\b(generate|create|make|draw|paint|design|produce|sketch|illustrate|render)\b.*(image|picture|photo|illustration|artwork|painting|drawing)/i.test(msg)
    || /\b(draw|paint|sketch|illustrate|render)\s+me\b/i.test(msg)
    || /\b(image|picture|photo|illustration)\s+(of|showing|depicting)\b/i.test(msg)
    || /\bi\s+(want|need|would like)\s+(an?|the)?\s*(image|picture|photo|illustration|drawing|painting|sketch)\b/i.test(msg)
    || /\b(can you|could you|please)\s+(generate|create|make|draw|paint|design|produce)\b/i.test(msg);
}

interface ChatPanelProps {
  chat: Chat;
  settings: Settings;
  messages: Message[];
  addMessage: (
    chatId: string,
    message: Omit<Message, 'id' | 'createdAt'>,
    newTitle?: string
  ) => void;
}

function cleanResponseHeaders(text: string): string {
  return text
    .replace(/^#{1,6}\s+(.+)$/gm, '**$1**')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Call the same-origin Next.js proxy so Vercel can forward requests to Render securely. */
async function callBackend(
  message: string,
  history: Array<{role: 'user' | 'assistant'; content: string}>,
  settings: Settings,
  userId?: string
): Promise<{
  content: string;
  modelUsed?: string;
  autoRouted?: boolean;
  imageUrl?: string;
  imageProvider?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/chat-direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        settings: {
          model: settings.model,
          tone: settings.tone,
          technicalLevel: settings.technicalLevel,
        },
        userId,
      }),
      signal: AbortSignal.timeout(120000), // 2 min — image gen can take 30s
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { content: data?.message || data?.error || `Request failed (HTTP ${res.status})`, error: 'true' };
    }

    return {
      content: data.content || '',
      modelUsed: data.modelUsed,
      autoRouted: data.autoRouted,
      imageUrl: data.imageUrl || undefined,
      imageProvider: data.imageProvider || undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { content: `Sorry, I couldn't reach the AI server. ${msg}`, error: 'true' };
  }
}

export function ChatPanel({
  chat,
  settings,
  messages,
  addMessage,
}: ChatPanelProps) {
  const [isLoadingFromAI, setIsLoadingFromAI] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {user} = useAuth();

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const isLoading = isLoadingFromAI || isSpeaking;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleSendMessage = useCallback(
    async (messageContent: string) => {
      if (isLoading || !user) return;
      setIsLoadingFromAI(true);

      if (looksLikeImageRequest(messageContent)) {
        setIsGeneratingImage(true);
      }

      const isNewChat = messages.length === 0;
      const newTitle = isNewChat
        ? messageContent.substring(0, 30) + (messageContent.length > 30 ? '...' : '')
        : undefined;

      addMessage(chat.id, {role: 'user', content: messageContent}, newTitle);

      // Build history — filter leading assistant messages (Google API requirement)
      const historyMessages = messages.map(({role, content}) => ({role, content}));
      const firstUserIndex = historyMessages.findIndex(m => m.role === 'user');
      const filteredHistory = firstUserIndex >= 0 ? historyMessages.slice(firstUserIndex) : [];
      const updatedHistory = [
        ...filteredHistory,
        {role: 'user' as const, content: messageContent},
      ];

      const response = await callBackend(
        messageContent,
        updatedHistory,
        settingsRef.current,
        user.uid
      );

      setIsGeneratingImage(false);

      const assistantContent = response.error
        ? response.content
        : cleanResponseHeaders(response.content);

      addMessage(chat.id, {
        role: 'assistant',
        content: assistantContent,
        modelUsed: response.modelUsed,
        autoRouted: response.autoRouted,
        imageUrl: response.imageUrl,
        imageProvider: response.imageProvider,
      });

      setIsLoadingFromAI(false);
      setIsGeneratingImage(false);

      // Extract and store memories asynchronously
      if (user.uid && assistantContent && !response.error) {
        fetch('/api/extract-memories', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            userMessage: messageContent,
            assistantMessage: assistantContent,
            userId: user.uid,
          }),
        }).catch(() => {});
      }

      if (settingsRef.current.enableSpeech && assistantContent && !response.error) {
        setIsSpeaking(true);

        const filteredText = VoiceFilter.filterForTTS(assistantContent, {
          removeRepetition: true,
          normalizeText: true,
          addPauses: true,
          fixPronunciation: true,
        });

        if (filteredText.length < 3) {
          setIsSpeaking(false);
          return;
        }

        const voiceMap: Record<string, string> = {
          'Algenib': 'en-US-AriaNeural',
          'Enceladus': 'en-US-GuyNeural',
          'Achernar': 'en-US-JennyNeural',
          'Heka': 'en-IN-NeerjaNeural',
        };

        const selectedVoice = voiceMap[settingsRef.current.voice] || settingsRef.current.voice || 'en-US-AriaNeural';

        hybridTTS.speak({
          text: filteredText,
          voice: selectedVoice,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    },
    [isLoading, user, messages, addMessage, chat.id]
  );

  const stopSpeaking = useCallback(() => {
    hybridTTS.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const handleRegenerateMessage = useCallback(
    async (messageId: string) => {
      if (isLoading || !user) return;

      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1 || messageIndex === 0) return;

      const userMessage = messages[messageIndex - 1];
      if (!userMessage || userMessage.role !== 'user') return;

      setIsLoadingFromAI(true);

      try {
        const response = await callBackend(
          userMessage.content,
          messages.slice(0, messageIndex).map(m => ({role: m.role, content: m.content})),
          settingsRef.current,
          user.uid
        );

        addMessage(chat.id, {
          role: 'assistant',
          content: response.error ? response.content : cleanResponseHeaders(response.content),
          modelUsed: response.modelUsed,
          autoRouted: response.autoRouted,
          imageUrl: response.imageUrl,
          imageProvider: response.imageProvider,
        });
      } catch (error) {
        console.error('Failed to regenerate message:', error);
      } finally {
        setIsLoadingFromAI(false);
      }
    },
    [isLoading, user, messages, chat.id, addMessage]
  );

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.06),transparent_28%)]">
      <ChatMessages
        messages={messages}
        isLoading={isLoadingFromAI}
        className="flex-1 min-h-0"
        onRegenerateMessage={handleRegenerateMessage}
        settings={settings}
      />

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <Image
                src="/FINALSOHAM.png"
                alt="SOHAM Logo"
                width={80}
                height={80}
                className="relative rounded-2xl shadow-2xl border border-white/10"
                priority
              />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {getTimeGreeting()}, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'User'}</span>
            </h2>
          </div>
          <ExamplePrompts onSendMessage={handleSendMessage} />
        </div>
      )}

      <div className="shrink-0 border-t bg-background/95 px-3 py-3 backdrop-blur md:px-4 md:py-4">
        {isSpeaking && (
          <div className="mb-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span>Speaking...</span>
              <button
                onClick={stopSpeaking}
                className="ml-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
              >
                Stop
              </button>
            </div>
          </div>
        )}
        {isGeneratingImage && !isSpeaking && (
          <div className="mb-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span>Generating image…</span>
            </div>
          </div>
        )}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} userId={user?.uid} />
        <div className="px-1 pt-2 text-center text-[11px] text-muted-foreground md:text-xs">
          <p>
            Try commands like{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-semibold">/solve</code>{' '}
            or{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-semibold">/summarize</code>.
          </p>
          <p className="mt-1">SOHAM by CODEEX-AI.</p>
        </div>
      </div>
    </div>
  );
}
