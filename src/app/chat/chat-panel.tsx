'use client';

import {type Chat, type Settings, type Message} from '@/lib/types';
import {ChatInput} from '@/components/chat/chat-input';
import {ChatMessages} from '@/components/chat/chat-messages';
import {ExamplePrompts} from '@/components/chat/example-prompts';
import {useState, useRef, useEffect, useCallback} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useAuth} from '@/hooks/use-auth';
import {hybridTTS} from '@/lib/hybrid-tts';
import {VoiceFilter} from '@/lib/voice-filter';

/** Client-side image request check — mirrors the server intent detector for UI feedback only */
function looksLikeImageRequest(msg: string): boolean {
  return (
    /\b(generate|create|make|draw|paint|design|produce|sketch|illustrate|render|visualize|depict)\b.*(image|picture|photo|illustration|artwork|painting|drawing|sketch|wallpaper|poster|logo|banner|thumbnail|avatar|portrait|landscape|scene)/i.test(msg) ||
    /\b(draw|paint|sketch|illustrate|render|visualize)\s+(me|a|an|the|this)\b/i.test(msg) ||
    /\b(image|picture|photo|illustration|pic|painting|sketch|drawing|artwork)\s+(of|showing|depicting|with|featuring)\b/i.test(msg) ||
    /\b(show|give|send)\s+me\s+(an?|the)?\s*(image|picture|photo|illustration|drawing|painting|sketch)\b/i.test(msg) ||
    /\b(i\s+)?(want|need|would like)\s+(an?|the|me\s+an?)?\s*(image|picture|photo|illustration|drawing|painting|sketch|artwork)\b/i.test(msg) ||
    /\b(photo-?realistic|photorealistic|anime|manga|cartoon|3d render|watercolor|oil painting|digital art|pixel art|concept art)\b/i.test(msg) ||
    /\b(tasveer|chitra)\s+(bana|banao|dikhao|chahiye)\b/i.test(msg) ||
    /\bgenerate\s+image\b/i.test(msg)
  );
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
    /*
     * Outer shell: fills whatever space the parent gives it.
     * flex-col + overflow-hidden so children can't blow out the height.
     * The input bar is ALWAYS the last child with shrink-0 so it is
     * never squeezed or clipped regardless of screen size.
     */
    <div className="flex flex-col w-full h-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.06),transparent_28%)]">

      {/* ── Scrollable area (messages OR welcome screen) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {messages.length === 0 ? (
          /* Welcome / empty state */
          <div className="flex flex-col items-center justify-center px-4 py-6 md:py-12 min-h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 md:mb-10 flex flex-col items-center text-center w-full max-w-lg">
              <div className="mb-5 md:mb-8 relative">
                <div className="absolute inset-0 bg-primary/15 blur-[80px] rounded-full scale-150" />
                <Image
                  src="/FINALSOHAM.png"
                  alt="SOHAM Logo"
                  width={120}
                  height={120}
                  className="relative rounded-2xl shadow-2xl border border-white/5 opacity-90 transition-transform hover:scale-105 duration-500 md:w-[180px] md:h-[180px]"
                  priority
                />
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 leading-tight">
                {getTimeGreeting()},{' '}
                <span className="text-primary">{user?.displayName?.split(' ')[0] || 'User'}</span>
              </h2>
              <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-widest max-w-xs md:max-w-sm leading-relaxed">
                Advanced adaptive AI workspace by CODEEX-AI
              </p>
            </div>

            <div className="mb-6 md:mb-10 w-full max-w-lg text-center px-2">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                <Link href="/documentation" className="hover:text-primary transition-colors">Docs</Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                <button onClick={() => window.open('mailto:support@codeex.ai')} className="hover:text-primary transition-colors">Help</button>
              </div>
            </div>

            <div className="w-full max-w-2xl px-0">
              <ExamplePrompts onSendMessage={handleSendMessage} />
            </div>
          </div>
        ) : (
          /* Chat messages — ChatMessages already has overflow-y-auto internally */
          <ChatMessages
            messages={messages}
            isLoading={isLoadingFromAI}
            className="h-full"
            onRegenerateMessage={handleRegenerateMessage}
            settings={settings}
          />
        )}
      </div>

      {/* ── Input bar — always visible, never shrinks ── */}
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
        <p className="px-1 pt-1.5 text-center text-[10px] text-muted-foreground">
          SOHAM by CODEEX-AI
        </p>
      </div>
    </div>
  );
}
