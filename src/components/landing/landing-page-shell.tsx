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
  MessageSquare,
  ScanSearch,
  ShieldCheck,
  Cpu,
  Globe,
  Zap,
  Image as ImageIcon,
  Brain,
  Code2,
  Search,
  Mic,
  ArrowRight,
  Check,
  Github,
  Star,
  Lock,
  Sparkles,
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

// ── Data ──────────────────────────────────────────────────────────────────────

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

const trustStats = [
  { label: 'AI Models', value: '35+' },
  { label: 'Countries', value: DEVELOPER_INFO.projectStats.countriesReached },
  { label: 'Uptime', value: DEVELOPER_INFO.projectStats.uptime },
  { label: 'Price', value: '$0' },
];

const features = [
  {
    icon: Cpu,
    title: '35+ AI Models',
    desc: 'Groq (Llama 4, GPT-OSS 120B), Cerebras (Qwen 3 235B), Gemini 2.5 Pro, DeepSeek R1, NVIDIA Nemotron 120B, Arcee Trinity 400B — all free.',
    tag: 'Core',
  },
  {
    icon: Brain,
    title: 'Smart Auto-Routing',
    desc: 'Every query is classified into 13 intent types. Coding → DeepSeek. Long docs → Gemini. Speed → Groq. You never have to pick.',
    tag: 'AI',
  },
  {
    icon: Globe,
    title: 'Real-Time Web Search',
    desc: 'Auto-triggers on news, weather, sports, finance, and factual queries. DuckDuckGo + GNews + Open-Meteo + CricAPI + CoinGecko.',
    tag: 'Live',
  },
  {
    icon: ImageIcon,
    title: 'Free Image Generation',
    desc: 'Pollinations.ai FLUX + Cloudflare Workers AI + HuggingFace fallback. ~5 seconds. Unlimited. Just describe what you want.',
    tag: 'Creative',
  },
  {
    icon: Mic,
    title: 'Voice Input & Output',
    desc: 'Groq Whisper V3 Turbo for speech-to-text. Groq Orpheus TTS with 6 voices. Vocal direction: [cheerful], [whisper], [laughs].',
    tag: 'Voice',
  },
  {
    icon: FileText,
    title: 'PDF Analysis',
    desc: 'Upload PDFs up to 5MB. Ask questions, get summaries, extract key points. Gemini 2.5 Flash with 1M token context.',
    tag: 'Docs',
  },
  {
    icon: Code2,
    title: '13 Specialized Skills',
    desc: 'Translation (50+ languages), Grammar Check, Quiz Generator, Recipe Generator, Sentiment Analysis, Fact-Check, Dictionary.',
    tag: 'Skills',
  },
  {
    icon: Search,
    title: '16 Slash Commands',
    desc: '/solve /summarize /search /news /weather /translate /grammar /quiz /recipe /joke /define /factcheck /sentiment /classify and more.',
    tag: 'Commands',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-First',
    desc: 'Conversations stored locally in your browser. No data selling. No training on your chats. GDPR compliant. MIT License.',
    tag: 'Privacy',
  },
];

const comparisonRows = [
  { feature: 'Price', soham: '$0 forever', other: '$20/month (Plus)' },
  { feature: 'AI Models', soham: '35+ from 5 providers', other: 'OpenAI only' },
  { feature: 'Image Generation', soham: 'Free, unlimited', other: 'Plus only, limited' },
  { feature: 'Web Search', soham: 'Free, auto-triggers', other: 'Plus only' },
  { feature: 'Voice (STT + TTS)', soham: 'Free, 6 voices', other: 'Advanced Voice = Plus' },
  { feature: 'PDF Analysis', soham: 'Free, up to 5MB', other: 'Plus only' },
  { feature: 'Privacy', soham: 'Local storage, open source', other: 'Trains on chats by default' },
];

const privacyPoints = [
  'Conversations stored in your browser only — never on our servers',
  'No data selling. No training on your conversations. GDPR compliant.',
  'Firebase auth, HTTPS, per-IP rate limiting on all API routes',
  'Open source MIT License — verify every claim on GitHub',
];

const sectionVariant = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] },
};

// ── Shell ─────────────────────────────────────────────────────────────────────

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
    if (isStandalone) { router.push(user ? '/chat' : '/login'); return; }
    idbGet<string>('hasVisitedBefore').then((v) => {
      if (user && v) router.push('/chat');
      else if (!v) idbSet('hasVisitedBefore', 'true');
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
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };
    const conn = nav.connection;
    const mem = nav.deviceMemory ?? 4;
    const update = () => {
      setShouldRender3D(!(
        window.innerWidth < 768 || mq.matches ||
        conn?.saveData === true ||
        ['slow-2g', '2g'].includes(conn?.effectiveType ?? '') ||
        mem <= 4
      ));
    };
    update();
    mq.addEventListener('change', update);
    window.addEventListener('resize', update, { passive: true });
    return () => { mq.removeEventListener('change', update); window.removeEventListener('resize', update); };
  }, []);

  return (
    <div className="min-h-screen bg-[#060608] text-foreground">
      {/* Background */}
      {shouldRender3D ? (
        <NeuralLatticeBackground />
      ) : (
        <div className="pointer-events-none fixed inset-0 -z-20"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(147,51,234,0.10), transparent), #060608' }}
        />
      )}

      {/* Header */}
      {isMobile ? (
        <MobileLandingHeader isScrolled={isScrolled} mobileNavOpen={mobileNavOpen} onToggleMobileNav={() => setMobileNavOpen(o => !o)} />
      ) : (
        <DesktopLandingHeader isScrolled={isScrolled} />
      )}

      <main>
        {/* ── Hero ── */}
        {isMobile ? (
          <MobileLandingHero activeMode={activeMode} setActiveMode={setActiveMode} heroFeatures={heroFeatures} trustStats={trustStats} sectionVariant={sectionVariant} />
        ) : (
          <DesktopLandingHero activeMode={activeMode} setActiveMode={setActiveMode} heroFeatures={heroFeatures} trustStats={trustStats} sectionVariant={sectionVariant} />
        )}

        {/* ── Ticker bar ── */}
        <div className="border-y border-white/8 bg-white/[0.02]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-3">
            {['35+ AI Models', 'Free Image Generation', 'Voice Input & Output', 'Real-Time Web Search', 'PDF Analysis', 'No Signup Required', 'Open Source MIT'].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-1 w-1 rounded-full bg-green-400" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Features grid ── */}
        <motion.section {...sectionVariant} className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Everything included — always free</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              More than ChatGPT Plus.<br />At $0.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              ChatGPT charges $20/month for image generation, voice, and advanced models.
              SOHAM gives you all of that — plus 35+ models from 5 providers — completely free.
            </p>
          </div>

          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:border-white/15 hover:bg-white/[0.06]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-white">
                    <f.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                    {f.tag}
                  </span>
                </div>
                <p className="mb-1.5 font-semibold text-white">{f.title}</p>
                <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/chat">
              <Button size="lg" className="h-11 bg-white px-8 text-slate-900 font-semibold hover:bg-white/90 shadow-lg shadow-white/10">
                Try all features free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.section>

        {/* ── Comparison ── */}
        <motion.section {...sectionVariant} className="border-y border-white/8 bg-white/[0.015]">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className={`grid gap-12 ${isMobile ? '' : 'lg:grid-cols-2 lg:items-start'}`}>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-400">SOHAM vs ChatGPT</p>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Why pay $20/month<br />for less?
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-400">
                  ChatGPT Plus locks image generation, voice, and advanced models behind a paywall.
                  SOHAM gives you all of that — plus 35+ models from 5 different providers — for free.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/chat">
                    <Button className="h-10 bg-white text-slate-900 font-semibold hover:bg-white/90">
                      Start free
                    </Button>
                  </Link>
                  <Link href="/faq">
                    <Button variant="ghost" className="h-10 text-slate-300 hover:text-white hover:bg-white/8">
                      See FAQ
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
                {/* Table header */}
                <div className="grid grid-cols-3 border-b border-white/8 bg-white/[0.03] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <span>Feature</span>
                  <span className="text-green-400">SOHAM ✓</span>
                  <span>ChatGPT</span>
                </div>
                {comparisonRows.map((row, i) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-3 gap-2 px-5 py-3.5 text-sm ${i < comparisonRows.length - 1 ? 'border-b border-white/6' : ''}`}
                  >
                    <span className="font-medium text-slate-200">{row.feature}</span>
                    <span className="text-green-400">{row.soham}</span>
                    <span className="text-slate-500">{row.other}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Founder + Privacy ── */}
        <motion.section {...sectionVariant} className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className={`grid gap-6 ${isMobile ? '' : 'lg:grid-cols-2'}`}>

            {/* Founder card */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-base font-bold text-white">
                  H
                </div>
                <div>
                  <p className="font-semibold text-white">Heoster (Harsh)</p>
                  <p className="text-xs text-slate-400">Founder, CODEEX-AI · Age 16 · Khatauli, India</p>
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">
                Built by a student, for everyone
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                I started CODEEX-AI in 2024 because I was frustrated that the best AI tools cost money.
                I'm 16, studying PCM in Class 12, and I built SOHAM from scratch — 50,000+ lines of code,
                35+ models, 100+ countries — while balancing school.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                The mission is simple: advanced AI should be free for every student, everywhere.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/about">
                  <Button variant="ghost" size="sm" className="h-8 border border-white/10 text-slate-300 hover:text-white hover:bg-white/8 text-xs">
                    Read the story
                  </Button>
                </Link>
                <Link href={DEVELOPER_INFO.contact.github} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="h-8 border border-white/10 text-slate-300 hover:text-white hover:bg-white/8 text-xs gap-1.5">
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                  </Button>
                </Link>
              </div>
              {/* Testing team */}
              <div className="mt-5 border-t border-white/8 pt-4">
                <p className="mb-2 text-[11px] text-slate-500 uppercase tracking-wider">Tested by</p>
                <div className="flex flex-wrap gap-1.5">
                  {DEVELOPER_INFO.friends.slice(0, 8).map((f) => (
                    <span key={f.name} className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-[11px] text-slate-300">
                      {f.name}
                    </span>
                  ))}
                  <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-[11px] text-slate-400">
                    +{DEVELOPER_INFO.friends.length - 8} more
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy card */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
                <Lock className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">
                Privacy-first. Open source. No surprises.
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Your conversations never leave your browser. We don't sell data, we don't train on your chats,
                and the entire codebase is on GitHub so you can verify every claim yourself.
              </p>
              <ul className="mt-5 space-y-3">
                {privacyPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/privacy">
                  <Button variant="ghost" size="sm" className="h-8 border border-white/10 text-slate-300 hover:text-white hover:bg-white/8 text-xs">
                    Privacy Policy
                  </Button>
                </Link>
                <Link href={DEVELOPER_INFO.contact.github} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="h-8 border border-white/10 text-slate-300 hover:text-white hover:bg-white/8 text-xs gap-1.5">
                    <Star className="h-3.5 w-3.5" />
                    Star on GitHub
                  </Button>
                </Link>
              </div>
              {/* Stats */}
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/8 pt-4">
                {[
                  { v: '35+', l: 'AI Models' },
                  { v: '100+', l: 'Countries' },
                  { v: '99.9%', l: 'Uptime' },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <p className="text-lg font-bold text-white">{s.v}</p>
                    <p className="text-[10px] text-slate-500">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── CTA ── */}
        <motion.section {...sectionVariant} className="border-t border-white/8">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className={`rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 md:p-12 ${isMobile ? '' : 'flex items-center justify-between gap-10'}`}>
              <div className={isMobile ? 'mb-8' : 'max-w-xl'}>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-500/10 px-3 py-1.5 text-xs text-green-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Free forever — no credit card
                </div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Start using SOHAM now
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-400">
                  35+ AI models, image generation, voice, web search, PDF analysis.
                  Everything ChatGPT Plus charges $20/month for — free on SOHAM.
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
                  {['No signup required', 'No credit card', 'No rate limits on free tier', 'Open source'].map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-green-400" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`flex flex-col gap-3 ${isMobile ? 'w-full' : 'shrink-0'}`}>
                <Link href="/chat" className={isMobile ? 'w-full' : ''}>
                  <Button size="lg" className={`h-12 bg-white px-8 text-slate-900 font-semibold hover:bg-white/90 shadow-xl shadow-white/10 ${isMobile ? 'w-full' : ''}`}>
                    Open SOHAM — it's free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/documentation" className={isMobile ? 'w-full' : ''}>
                  <Button size="lg" variant="ghost" className={`h-12 border border-white/12 text-slate-300 hover:text-white hover:bg-white/8 ${isMobile ? 'w-full' : ''}`}>
                    Read the docs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 bg-[#040406]">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className={`flex ${isMobile ? 'flex-col gap-8' : 'items-start justify-between gap-10'}`}>
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Image src="/FINALSOHAM.png" alt="SOHAM" width={28} height={28} className="rounded-lg" />
                <span className="font-bold text-white">SOHAM</span>
              </div>
              <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                Free AI platform by CODEEX-AI.<br />
                Built by Heoster, age 16, India.
              </p>
              <p className="text-xs text-slate-600">© {new Date().getFullYear()} CODEEX-AI</p>
            </div>

            {/* Links */}
            <div className={`grid gap-x-12 gap-y-4 text-sm ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Product</p>
                {[['AI Chat', '/chat'], ['AI Services', '/ai-services'], ['PDF Analyzer', '/pdf-analyzer'], ['Image Math', '/visual-math']].map(([l, h]) => (
                  <Link key={h} href={h} className="block text-slate-400 hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Learn</p>
                {[['Documentation', '/documentation'], ['FAQ', '/faq'], ['Community', '/community'], ['Contact', '/contact']].map(([l, h]) => (
                  <Link key={h} href={h} className="block text-slate-400 hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Company</p>
                {[['About Heoster', '/about'], ['About SOHAM', '/soham'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([l, h]) => (
                  <Link key={h} href={h} className="block text-slate-400 hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Connect</p>
                {[
                  ['GitHub', DEVELOPER_INFO.contact.github],
                  ['Twitter', DEVELOPER_INFO.contact.twitter],
                  ['LinkedIn', DEVELOPER_INFO.contact.linkedin],
                  ['Email', `mailto:${DEVELOPER_INFO.contact.email}`],
                ].map(([l, h]) => (
                  <Link key={l} href={h} target="_blank" rel="noopener noreferrer" className="block text-slate-400 hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
