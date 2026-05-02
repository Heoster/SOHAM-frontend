'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AudioLines,
  CheckCircle2,
  FileText,
  History,
  LockKeyhole,
  MessageSquare,
  ScanSearch,
  ShieldCheck,
  UserRound,
  Waves,
  Cpu,
  Globe,
  Zap,
  Image as ImageIcon,
  Brain,
  Code2,
  Search,
  Mic,
  BookOpen,
  Users,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type CoreMode } from '@/components/landing/soham-core';
import { DesktopLandingHeader, MobileLandingHeader } from '@/components/landing/landing-header';
import { DesktopLandingHero, MobileLandingHero } from '@/components/landing/landing-hero';
import { DEVELOPER_INFO } from '@/lib/developer-info';
import { useAuth } from '@/hooks/use-auth';
import { idbGet, idbSet } from '@/lib/indexed-db';

const NeuralLatticeBackground = dynamic(
  () => import('@/components/landing/neural-lattice-background').then((mod) => mod.NeuralLatticeBackground),
  { ssr: false }
);

const heroFeatures = [
  {
    mode: 'chat' as CoreMode,
    title: '35+ AI Models, One Chat',
    description: 'Groq, Cerebras, Gemini, DeepSeek, HuggingFace — all in one place. Auto mode picks the best model for every query.',
    icon: MessageSquare,
  },
  {
    mode: 'pdf' as CoreMode,
    title: 'PDF Analyzer',
    description: 'Upload any PDF up to 5MB. Ask questions, get summaries, extract key points — powered by Gemini 2.5 Flash.',
    icon: FileText,
  },
  {
    mode: 'vision' as CoreMode,
    title: 'Image Math Solver',
    description: 'Snap a photo of any equation — handwritten or printed. Get step-by-step solutions instantly.',
    icon: ScanSearch,
  },
  {
    mode: 'voice' as CoreMode,
    title: 'Voice Both Ways',
    description: 'Speak to SOHAM with Groq Whisper STT. Hear responses with 6 voice options via Groq Orpheus TTS. Free.',
    icon: AudioLines,
  },
];

const allFeatures = [
  {
    icon: Cpu,
    title: '35+ AI Models',
    description: 'Groq (Llama 4, GPT-OSS 120B), Cerebras (Qwen 3 235B, GLM 4.7), Google (Gemini 2.5 Pro/Flash), HuggingFace (DeepSeek R1), OpenRouter (NVIDIA Nemotron, Arcee Trinity 400B). All free.',
    badge: 'Core',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Brain,
    title: 'Smart Auto-Routing',
    description: 'Intent detector classifies every query into 13 types. Auto mode routes coding to DeepSeek, long docs to Gemini, speed queries to Groq — automatically.',
    badge: 'Intelligence',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Globe,
    title: 'Real-Time Web Search',
    description: 'DuckDuckGo + GNews + Open-Meteo + CricAPI + CoinGecko + Alpha Vantage. Auto-triggers on news, weather, sports, finance, and factual queries. Returns AI-synthesized answers with citations.',
    badge: 'Live Data',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  {
    icon: ImageIcon,
    title: 'Free Image Generation',
    description: 'Pollinations.ai FLUX (primary) + Cloudflare Workers AI + HuggingFace FLUX.1-schnell fallback. Fast (~5s), free, unlimited. Just describe what you want.',
    badge: 'Creative',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
  },
  {
    icon: Mic,
    title: 'Voice Input & Output',
    description: 'Groq Whisper V3 Turbo for speech-to-text. Groq Orpheus TTS with 6 voices: troy, diana, hannah, autumn, austin, daniel. Vocal direction: [cheerful], [whisper], [laughs].',
    badge: 'Voice',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    icon: Code2,
    title: '13 Specialized Skills',
    description: 'Translation (50+ languages), Grammar Check, Quiz Generator, Recipe Generator, Sentiment Analysis, Fact-Check, Dictionary, Text Classification — all with dedicated AI pipelines.',
    badge: 'Skills',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
  {
    icon: FileText,
    title: 'PDF & Document Analysis',
    description: 'Upload PDFs up to 5MB. Ask questions, get summaries, extract key points. Powered by Gemini 2.5 Flash with 1M token context window.',
    badge: 'Documents',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    icon: Search,
    title: 'Slash Commands',
    description: '/solve /summarize /search /news /weather /sports /finance /translate /grammar /quiz /recipe /joke /define /factcheck /sentiment /classify — 16 commands.',
    badge: 'Commands',
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-First & Open Source',
    description: 'Conversations stored locally in your browser only. No data selling. No training on your chats. GDPR compliant. MIT License. Code on GitHub.',
    badge: 'Privacy',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
  },
];

const trustStats = [
  { label: 'AI Models', value: '35+' },
  { label: 'Countries', value: DEVELOPER_INFO.projectStats.countriesReached },
  { label: 'Uptime', value: DEVELOPER_INFO.projectStats.uptime },
  { label: 'Price', value: '$0 Forever' },
];

const workflowCards = [
  {
    title: 'One workspace for chat, documents, and visual problem solving',
    text: 'SOHAM keeps AI chat, PDF analysis, image math solving, web search, and voice on connected routes — one system instead of switching between 5 different tools.',
    image: '/Multi-Chat.png',
    href: '/ai-services',
  },
  {
    title: 'Auto-routing picks the right model for every query',
    text: 'The intent detector classifies your message into 13 types and routes it to the best model automatically. Coding → DeepSeek R1. Long docs → Gemini 2.5 Flash. Speed → Groq Llama. You never have to think about it.',
    image: '/search.png',
    href: '/chat',
  },
];

const comparisonRows = [
  ['Price', '100% free — all 35+ models, image gen, voice, PDF', 'ChatGPT Plus = $20/mo for advanced features'],
  ['AI Models', '35+ models from 5 providers in one place', 'Locked to OpenAI models only'],
  ['Image Generation', 'Free, unlimited via FLUX + Cloudflare + HuggingFace', 'Requires Plus ($20/mo), limited generations'],
  ['Web Search', 'Auto-triggers, always free, DuckDuckGo + 5 data sources', 'Requires Plus, Microsoft Bing only'],
  ['Voice (STT + TTS)', 'Free — Groq Whisper + Orpheus TTS, 6 voices', 'Advanced Voice requires Plus'],
  ['PDF Analysis', 'Free — upload up to 5MB, ask anything', 'Requires Plus for file uploads'],
  ['Privacy', 'Local storage, no training on your chats, open source', 'Trains on chats by default (opt-out available)'],
  ['Community', 'Live community board at /community', 'No community feature'],
];

const securityRows = [
  'Conversations stored in your browser only — never on SOHAM servers.',
  'No data selling. No training on your conversations. GDPR compliant.',
  'Firebase authentication, HTTPS in transit, per-IP rate limiting on all API routes.',
  'Open source under MIT License — verify every claim yourself on GitHub.',
];

const sectionVariant = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] },
};

export function LandingPageShell({ isMobile }: { isMobile: boolean }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeMode, setActiveMode] = useState<CoreMode>('general');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [shouldRender3D, setShouldRender3D] = useState(!isMobile);

  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      router.push(user ? '/chat' : '/login');
      return;
    }

    // Read visit flag from IndexedDB asynchronously
    idbGet<string>('hasVisitedBefore').then((hasVisitedBefore) => {
      if (user && hasVisitedBefore) {
        router.push('/chat');
      } else if (!hasVisitedBefore) {
        idbSet('hasVisitedBefore', 'true');
      }
    });
  }, [user, loading, router]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const deviceNavigator = navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
      };
      deviceMemory?: number;
    };
    const connection = deviceNavigator.connection;
    const memory = deviceNavigator.deviceMemory ?? 4;

    const update3DPreference = () => {
      const compactViewport = window.innerWidth < 768;
      const reducedMotion = mediaQuery.matches;
      const saveData = connection?.saveData === true;
      const slowNetwork = ['slow-2g', '2g'].includes(connection?.effectiveType ?? '');
      const lowMemory = memory <= 4;

      setShouldRender3D(!(compactViewport || reducedMotion || saveData || slowNetwork || lowMemory));
    };

    update3DPreference();
    mediaQuery.addEventListener('change', update3DPreference);
    window.addEventListener('resize', update3DPreference, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', update3DPreference);
      window.removeEventListener('resize', update3DPreference);
    };
  }, []);

  return (
    <div className="neural-obsidian min-h-screen bg-background text-foreground">
      {shouldRender3D ? (
        <NeuralLatticeBackground />
      ) : (
        <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(0,242,255,0.07),transparent_30%),radial-gradient(circle_at_bottom,rgba(112,0,255,0.11),transparent_34%),linear-gradient(180deg,#050505,#0a0a15_48%,#050505)]" />
      )}

      {isMobile ? (
        <MobileLandingHeader
          isScrolled={isScrolled}
          mobileNavOpen={mobileNavOpen}
          onToggleMobileNav={() => setMobileNavOpen((open) => !open)}
        />
      ) : (
        <DesktopLandingHeader isScrolled={isScrolled} />
      )}

      <main>
        {isMobile ? (
          <MobileLandingHero
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            heroFeatures={heroFeatures}
            trustStats={trustStats}
            sectionVariant={sectionVariant}
          />
        ) : (
          <DesktopLandingHero
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            heroFeatures={heroFeatures}
            trustStats={trustStats}
            sectionVariant={sectionVariant}
          />
        )}

        <motion.section {...sectionVariant} className="liquid-section border-y border-white/10">
          <div className={`mx-auto grid w-full max-w-7xl gap-3 px-4 py-5 sm:px-6 ${isMobile ? 'grid-cols-2' : 'sm:grid-cols-4'}`}>
            {[
              '35+ AI Models Free',
              'Image Generation Free',
              'Voice Input & Output Free',
              'No Signup Required',
            ].map((item) => (
              <div key={item} className="stat-glow-chip">
                {item}
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── All Features Grid ── */}
        <motion.section {...sectionVariant} className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mb-10 max-w-3xl">
            <p className="section-kicker">Everything Included — Always Free</p>
            <h2 className="section-title">More than ChatGPT Plus, at $0</h2>
            <p className="section-copy">
              SOHAM gives you 35+ AI models, real-time web search, free image generation, voice both ways,
              PDF analysis, and 13 specialized skills — all free, no credit card, no subscription.
            </p>
          </div>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {allFeatures.map((f) => (
              <div key={f.title} className="feature-plane">
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${f.bg}`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-semibold text-white">{f.title}</p>
                  <span className={`rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider ${f.color}`}>{f.badge}</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{f.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/chat">
              <Button size="lg" className="h-12 border-0 bg-[linear-gradient(135deg,#5b6cff,#AEE124_52%,#93E1F4)] px-8 text-slate-950 hover:opacity-95">
                Try All Features Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.section>

        <motion.section {...sectionVariant} className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mb-8 max-w-3xl">
            <p className="section-kicker">How It Works</p>
            <h2 className="section-title">One workspace, every AI tool you need</h2>
            <p className="section-copy">
              SOHAM is not a wrapper around one model. It's a full AI workspace with smart routing,
              live data, voice, documents, and image generation — all connected.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {workflowCards.map((card, index) => (
              <motion.div
                key={card.title}
                whileHover={isMobile ? undefined : { rotateX: -5, rotateY: index % 2 === 0 ? 6 : -6, y: -8 }}
                transition={{ duration: 0.24 }}
                className="workflow-card"
              >
                <Link href={card.href}>
                  <div className={`relative overflow-hidden rounded-[24px] border border-white/10 ${isMobile ? 'aspect-[4/3]' : 'aspect-[1.05/1]'}`}>
                    <Image src={card.image} alt={card.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(5,5,5,0.88))]" />
                    <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#050505]/55 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-100">
                      Product route
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xl font-semibold text-white">{card.title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{card.text}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section {...sectionVariant} className="liquid-section border-y border-white/10">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <p className="section-kicker">SOHAM vs ChatGPT</p>
              <h2 className="section-title">More features. Zero cost. No paywalls.</h2>
              <p className="section-copy">
                ChatGPT Plus costs $20/month for image gen, voice, and advanced models.
                SOHAM gives you all of that — plus 35+ models from 5 providers — completely free.
              </p>
            </div>

            <div className="comparison-surface">
              <div className="comparison-head">
                <span>Feature</span>
                <span>SOHAM ✅</span>
                <span>ChatGPT</span>
              </div>
              {comparisonRows.map(([label, soham, other]) => (
                <div key={label} className="comparison-row">
                  <span className="font-medium text-slate-100">{label}</span>
                  <span className="text-slate-200">{soham}</span>
                  <span className="text-slate-400">{other}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section {...sectionVariant} className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="panel-card">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.16em] text-slate-300">
                <UserRound className="h-3.5 w-3.5" />
                Company Context
              </div>
              <h2 className="section-title !text-3xl">Built by a 16-year-old from India</h2>
              <p className="mt-4 text-sm leading-8 text-slate-300">
                SOHAM is built by <strong className="text-white">Heoster (Harsh)</strong>, age 16, from Khatauli, UP, India.
                He founded CODEEX-AI in 2024 with one mission: make advanced AI completely free for every student.
              </p>
              <p className="mt-4 text-sm leading-8 text-slate-400">{DEVELOPER_INFO.mission}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/soham">
                  <Button variant="outline" className="border-white/15 bg-white/6 text-slate-100 hover:bg-white/10">
                    About SOHAM
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="border-white/15 bg-white/6 text-slate-100 hover:bg-white/10">
                    About CODEEX-AI
                  </Button>
                </Link>
              </div>
            </div>

            <div className="panel-card">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.16em] text-slate-300">
                <LockKeyhole className="h-3.5 w-3.5" />
                Security
              </div>
              <h2 className="section-title !text-3xl">Privacy-first. Open source. No data selling.</h2>
              <p className="mt-4 text-sm leading-8 text-slate-300">
                Your conversations never leave your browser. SOHAM doesn't train on your chats,
                doesn't sell your data, and the entire codebase is open source on GitHub under MIT License.
              </p>
              <div className="mt-5 grid gap-3">
                {securityRows.map((item) => (
                  <div key={item} className="security-row">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-cyan-200" />
                    <p className="text-sm leading-7 text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/privacy">
                  <Button variant="outline" className="border-white/15 bg-white/6 text-slate-100 hover:bg-white/10">
                    Privacy & Data Security
                  </Button>
                </Link>
                <Link href="/terms">
                  <Button variant="outline" className="border-white/15 bg-white/6 text-slate-100 hover:bg-white/10">
                    Terms of Service
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section {...sectionVariant} className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="cta-surface">
            <div>
              <p className="section-kicker">Start Now — It's Free</p>
              <h2 className="section-title">35+ AI models. $0. No credit card.</h2>
              <p className="section-copy max-w-2xl">
                Chat, image generation, voice, PDF analysis, web search, and 13 specialized skills.
                Everything ChatGPT Plus charges $20/month for — free forever on SOHAM.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-200" />
                  35+ models from Groq, Cerebras, Google, HuggingFace
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-200" />
                  Privacy-first, open source, GDPR compliant
                </span>
                <span className="inline-flex items-center gap-2">
                  <Waves className="h-4 w-4 text-cyan-200" />
                  Voice, PDF, image gen, web search — all free
                </span>
              </div>
            </div>

            <div className={`flex flex-col gap-3 ${isMobile ? 'w-full' : ''}`}>
              <Link href="/login">
                <Button size="lg" className={`h-12 border-0 bg-[linear-gradient(135deg,#5b6cff,#AEE124_52%,#93E1F4)] px-7 text-slate-950 hover:opacity-95 ${isMobile ? 'w-full' : ''}`}>
                  Start Free — No Signup Needed
                </Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" variant="outline" className={`h-12 border-white/15 bg-white/6 px-7 text-slate-100 hover:bg-white/10 ${isMobile ? 'w-full' : ''}`}>
                  Read FAQ
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-white/10 bg-[#050505]/70 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row">
            <div className="flex items-center gap-3">
              <Image src="/FINALSOHAM.png" alt="SOHAM logo" width={34} height={34} />
              <div>
                <p className="text-sm font-semibold text-slate-100">SOHAM</p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Production AI Workspace</p>
              </div>
            </div>
            <div className={`grid gap-3 text-sm ${isMobile ? 'grid-cols-1 w-full' : 'sm:grid-cols-2 lg:grid-cols-5'}`}>
              <Link href="/chat" className="text-slate-300 hover:text-white">AI Chat</Link>
              <Link href="/ai-services" className="text-slate-300 hover:text-white">AI Services</Link>
              <Link href="/pdf-analyzer" className="text-slate-300 hover:text-white">PDF Analyzer</Link>
              <Link href="/visual-math" className="text-slate-300 hover:text-white">Image Math</Link>
              <Link href="/faq" className="text-slate-300 hover:text-white">FAQ</Link>
              <Link href="/community" className="text-slate-300 hover:text-white">Community</Link>
              <Link href="/documentation" className="text-slate-300 hover:text-white">Documentation</Link>
              <Link href="/contact" className="text-slate-300 hover:text-white">Contact</Link>
              <Link href="/privacy" className="text-slate-300 hover:text-white">Privacy</Link>
              <Link href="/about" className="text-slate-300 hover:text-white">About</Link>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} CODEEX-AI. All rights reserved.</p>
            <p className="mt-1">Self Organising Hyper Adaptive Machine</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .neural-obsidian {
          background:
            radial-gradient(circle at top left, rgba(91, 108, 255, 0.14), transparent 24%),
            radial-gradient(circle at top right, rgba(147, 225, 244, 0.16), transparent 26%),
            radial-gradient(circle at bottom left, rgba(174, 225, 36, 0.1), transparent 22%),
            linear-gradient(180deg, hsl(var(--background)) 0%, color-mix(in srgb, hsl(var(--background)) 82%, #0b1013) 45%, hsl(var(--background)) 100%);
        }

        .glass-heading {
          background: linear-gradient(135deg, #ffffff, #5b6cff 22%, #AEE124 56%, #93E1F4 88%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 30px rgba(147, 225, 244, 0.1);
          filter: drop-shadow(0 8px 26px rgba(91, 108, 255, 0.16));
        }

        .feature-plane {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, hsl(var(--card) / 0.86), hsl(var(--card) / 0.58));
          backdrop-filter: blur(22px);
          border-radius: 28px;
          padding: 1.35rem;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.22);
          transform-style: preserve-3d;
        }

        .core-shell {
          position: relative;
          min-height: 600px;
          perspective: 1600px;
        }

        .core-backdrop {
          position: absolute;
          border-radius: 999px;
          filter: blur(48px);
          opacity: 0.8;
        }

        .core-backdrop-a {
          top: 8%;
          left: 12%;
          height: 180px;
          width: 180px;
          background: rgba(0, 242, 255, 0.18);
        }

        .core-backdrop-b {
          right: 10%;
          bottom: 12%;
          height: 220px;
          width: 220px;
          background: rgba(112, 0, 255, 0.22);
        }

        .glass-orb-panel {
          position: relative;
          z-index: 1;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(30px);
          border-radius: 36px;
          padding: 1.5rem;
          box-shadow: 0 40px 120px rgba(0, 0, 0, 0.28);
        }

        .info-glass-card {
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 22px;
          padding: 1rem;
        }

        .liquid-section {
          position: relative;
          background:
            radial-gradient(circle at top left, rgba(91, 108, 255, 0.09), transparent 28%),
            radial-gradient(circle at bottom right, rgba(147, 225, 244, 0.12), transparent 30%),
            radial-gradient(circle at center right, rgba(174, 225, 36, 0.08), transparent 24%),
            linear-gradient(180deg, hsl(var(--card) / 0.5), hsl(var(--background) / 0.2));
        }

        .liquid-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.05), transparent 35%);
          mix-blend-mode: screen;
          opacity: 0.7;
          pointer-events: none;
        }

        .stat-glow-chip {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: hsl(var(--card) / 0.72);
          border-radius: 999px;
          padding: 0.9rem 1rem;
          text-align: center;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #d9e4ff;
          backdrop-filter: blur(14px);
        }

        .section-kicker {
          font-size: 0.72rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #95a3c3;
        }

        .section-title {
          margin-top: 0.75rem;
          font-family: var(--font-manrope);
          font-size: clamp(2rem, 3vw, 3.4rem);
          line-height: 1.02;
          font-weight: 600;
          color: #fff;
        }

        .section-copy {
          margin-top: 1rem;
          font-size: 0.98rem;
          line-height: 1.9;
          color: #bcc6df;
        }

        .workflow-card {
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: linear-gradient(180deg, hsl(var(--card) / 0.86), hsl(var(--card) / 0.62));
          border-radius: 32px;
          box-shadow: 0 26px 70px rgba(0, 0, 0, 0.24);
          backdrop-filter: blur(18px);
          transform-style: preserve-3d;
        }

        .comparison-surface {
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, hsl(var(--card) / 0.86), hsl(var(--card) / 0.62));
          border-radius: 30px;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.24);
          backdrop-filter: blur(20px);
        }

        .comparison-head,
        .comparison-row {
          display: grid;
          grid-template-columns: 1.05fr 1fr 1fr;
          gap: 1rem;
          padding: 1rem 1.25rem;
        }

        .comparison-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8897b7;
        }

        .comparison-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.92rem;
        }

        .comparison-row:last-child {
          border-bottom: none;
        }

        .panel-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, hsl(var(--card) / 0.86), hsl(var(--card) / 0.62));
          border-radius: 32px;
          padding: 1.75rem;
          box-shadow: 0 26px 70px rgba(0, 0, 0, 0.22);
          backdrop-filter: blur(18px);
        }

        .security-row {
          display: flex;
          gap: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: hsl(var(--card) / 0.7);
          border-radius: 22px;
          padding: 1rem;
        }

        .cta-surface {
          display: grid;
          gap: 2rem;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background:
            radial-gradient(circle at top left, rgba(91, 108, 255, 0.14), transparent 35%),
            radial-gradient(circle at center, rgba(174, 225, 36, 0.08), transparent 28%),
            radial-gradient(circle at bottom right, rgba(147, 225, 244, 0.16), transparent 35%),
            linear-gradient(180deg, hsl(var(--card) / 0.86), hsl(var(--card) / 0.62));
          border-radius: 36px;
          padding: 2rem;
          box-shadow: 0 32px 90px rgba(0, 0, 0, 0.26);
          backdrop-filter: blur(22px);
        }

        .hero-logo-panel {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: linear-gradient(180deg, hsl(var(--card) / 0.9), hsl(var(--card) / 0.62));
          border-radius: 36px;
          padding: 1.5rem;
          box-shadow: 0 32px 90px rgba(0, 0, 0, 0.24);
          backdrop-filter: blur(20px);
        }

        .hero-logo-panel__glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(60px);
          opacity: 0.28;
          pointer-events: none;
        }

        .hero-logo-panel__glow--orange {
          top: -20px;
          left: -20px;
          height: 180px;
          width: 180px;
          background: #5b6cff;
        }

        .hero-logo-panel__glow--green {
          top: 30%;
          right: 14%;
          height: 180px;
          width: 180px;
          background: #AEE124;
        }

        .hero-logo-panel__glow--blue {
          right: -10px;
          bottom: -10px;
          height: 220px;
          width: 220px;
          background: #93E1F4;
        }

        @media (max-width: 767px) {
          .comparison-head,
          .comparison-row {
            grid-template-columns: 1fr;
          }

          .comparison-head span:nth-child(3),
          .comparison-row span:nth-child(3) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}


