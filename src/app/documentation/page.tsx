import type { Metadata } from 'next';
import Link from 'next/link';
import { pageSEO } from '@/lib/seo-config';
import {
  ArrowRight,
  BookOpen,
  FileText,
  MessageSquare,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Calculator,
  Cpu,
  Mic,
  Image as ImageIcon,
  Globe,
  Zap,
  Brain,
  Code2,
  Users,
  HelpCircle,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: pageSEO.documentation.title,
  description: pageSEO.documentation.description,
  keywords: pageSEO.documentation.keywords,
  alternates: { canonical: 'https://soham-ai.vercel.app/documentation' },
  openGraph: {
    title: pageSEO.documentation.title,
    description: pageSEO.documentation.description,
    url: 'https://soham-ai.vercel.app/documentation',
    type: 'website',
    siteName: 'SOHAM',
  },
};

const coreGuides = [
  {
    title: 'AI Chat & Model Selection',
    description: 'How to use 35+ AI models, what Auto mode does, how the smart fallback chain works, and when to switch models manually.',
    href: '/documentation/chat',
    icon: MessageSquare,
    badge: 'Core',
    detail: 'Groq · Cerebras · Gemini · HuggingFace · OpenRouter',
  },
  {
    title: 'PDF Analyzer',
    description: 'Upload PDFs up to 5MB. Ask questions, get summaries, extract key points. Powered by Gemini 2.5 Flash with 1M token context.',
    href: '/documentation/pdf-analysis',
    icon: FileText,
    badge: 'Core',
    detail: 'Up to 5MB · Gemini 2.5 Flash · Q&A + Summary',
  },
  {
    title: 'Image Math Solver',
    description: 'Upload a photo of any equation — handwritten or printed. Get step-by-step solutions. Works with algebra, calculus, geometry.',
    href: '/documentation/math-solver',
    icon: Calculator,
    badge: 'Core',
    detail: 'Photo upload · Step-by-step · All math types',
  },
  {
    title: 'Web Search',
    description: 'Auto-triggers on news, weather, sports, finance, and factual queries. DuckDuckGo + GNews + Open-Meteo + CricAPI + CoinGecko.',
    href: '/documentation/web-search',
    icon: Search,
    badge: 'Live Data',
    detail: 'Auto-trigger · 6 data sources · Citations',
  },
  {
    title: 'Image Generation',
    description: 'Free, unlimited image generation. Pollinations.ai FLUX (primary) + Cloudflare Workers AI + HuggingFace FLUX.1-schnell fallback.',
    href: '/documentation/image-generation',
    icon: ImageIcon,
    badge: 'Creative',
    detail: 'FLUX · Cloudflare · HuggingFace · ~5s · Free',
  },
  {
    title: 'Voice Features',
    description: 'Speech-to-text via Groq Whisper V3 Turbo. Text-to-speech via Groq Orpheus TTS with 6 voices and vocal direction tags.',
    href: '/documentation/voice',
    icon: Mic,
    badge: 'Voice',
    detail: 'Whisper V3 Turbo · 6 voices · [cheerful] [whisper]',
  },
];

const skillGuides = [
  { title: 'Translation', desc: '50+ languages, auto source detection, formal/casual tone', href: '/documentation/commands', icon: Globe },
  { title: 'Grammar Check', desc: 'Fix grammar, improve style, full rewrite mode', href: '/documentation/commands', icon: Sparkles },
  { title: 'Quiz Generator', desc: 'MCQ, True/False, Flashcards — up to 20 questions', href: '/documentation/commands', icon: Brain },
  { title: 'Sentiment Analysis', desc: 'Positive/negative/neutral, emotion breakdown, tone', href: '/documentation/commands', icon: Star },
  { title: 'Fact-Check', desc: 'Web search + AI verdict with confidence score', href: '/documentation/commands', icon: ShieldCheck },
  { title: 'Dictionary', desc: 'Definitions, IPA, synonyms, antonyms, etymology', href: '/documentation/commands', icon: BookOpen },
];

const operationsGuides = [
  {
    title: 'Quick Start',
    description: 'From landing page to first AI response in under 60 seconds. No signup required for basic use.',
    href: '/documentation/quick-start',
  },
  {
    title: 'Slash Commands',
    description: '/solve /summarize /search /news /weather /translate /grammar /quiz /recipe /joke /define /factcheck — all 16 commands.',
    href: '/documentation/commands',
  },
  {
    title: 'Settings',
    description: 'Model selection, tone, technical level, voice preferences, speech output toggle.',
    href: '/documentation/settings',
  },
  {
    title: 'Security & Privacy',
    description: 'Local chat storage, Firebase auth, no data selling, GDPR compliance, open source MIT License.',
    href: '/documentation/security',
  },
  {
    title: 'PWA Installation',
    description: 'Install SOHAM as a native-like app on Android (Chrome), iOS (Safari), Windows, and Mac.',
    href: '/documentation/pwa',
  },
  {
    title: 'API Reference',
    description: '25+ endpoints: /api/chat, /api/ai/*, /api/image/*, /api/voice/*, /api/memory/*.',
    href: '/documentation/api-reference',
  },
];

const modelProviders = [
  { name: 'Groq', models: 'Llama 4 Scout 17B, GPT-OSS 120B, Qwen3 32B, Llama 3.1 8B Instant', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { name: 'Cerebras', models: 'Qwen 3 235B, GPT-OSS 120B, GLM 4.7, Llama 3.1 8B', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { name: 'Google', models: 'Gemini 2.5 Pro, Gemini 2.5 Flash, Imagen 3, Veo 2', color: 'text-green-400', bg: 'bg-green-400/10' },
  { name: 'HuggingFace', models: 'DeepSeek R1 70B, Llama 3.3 70B, Qwen 2.5 72B, Qwen 2.5 7B', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { name: 'OpenRouter', models: 'NVIDIA Nemotron 120B, Arcee Trinity 400B, MiniMax M2.5, Gemma 3 27B', color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

export default function DocsHomePage() {
  return (
    <div className="space-y-12">

      {/* ── Hero ── */}
      <section className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-medium">SOHAM Documentation</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Everything you need to use SOHAM
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            35+ AI models, real-time web search, free image generation, voice both ways, PDF analysis,
            and 13 specialized skills. All free. All documented here.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/chat">
            <Button size="lg">
              Open Chat
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/documentation/quick-start">
            <Button size="lg" variant="outline">
              Quick Start Guide
            </Button>
          </Link>
          <Link href="/faq">
            <Button size="lg" variant="outline">
              FAQ
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'AI Models', value: '35+', icon: Cpu },
          { label: 'Specialized Skills', value: '13', icon: Brain },
          { label: 'Slash Commands', value: '16', icon: Zap },
          { label: 'Price', value: '$0', icon: Star },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <CardContent className="p-4">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── AI Models ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            35+ AI Models — 5 Providers
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Auto mode picks the best model for every query. Or choose manually from the model selector.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modelProviders.map((p) => (
            <div key={p.name} className="rounded-2xl border bg-card p-4 space-y-2">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${p.bg} ${p.color}`}>
                {p.name}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.models}</p>
            </div>
          ))}
          <div className="rounded-2xl border bg-primary/5 border-primary/20 p-4 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary">
              Auto Mode
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Intent detector classifies your query into 13 types and routes to the best model automatically.
              Coding → DeepSeek. Long docs → Gemini. Speed → Groq.
            </p>
          </div>
        </div>
      </section>

      {/* ── Core Guides ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Core Feature Guides</h2>
          <p className="text-sm text-muted-foreground mt-1">Deep dives into every major SOHAM feature.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {coreGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link key={guide.href} href={guide.href}>
                <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-primary/10 p-2 text-primary shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base">{guide.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs">{guide.badge}</Badge>
                        </div>
                        <CardDescription className="text-xs leading-relaxed">{guide.description}</CardDescription>
                        <p className="text-[10px] text-primary/70 font-medium">{guide.detail}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Specialized Skills ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            13 Specialized AI Skills
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Dedicated AI pipelines for specific tasks — not just general prompting.
            Trigger naturally in conversation or use slash commands.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skillGuides.map((s) => (
            <Link key={s.title} href={s.href}>
              <div className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:bg-card/80 h-full">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            </Link>
          ))}
          {/* Extra skills */}
          {[
            { title: 'Recipe Generator', desc: 'Full recipes with ingredients, steps, nutrition' },
            { title: 'Joke & Fun', desc: 'Jokes, puns, roasts, riddles, fun facts' },
            { title: 'Text Classification', desc: 'Auto or custom categories, multi-label support' },
            { title: 'Solve (Math/Code)', desc: 'Step-by-step math and code solutions via /solve' },
            { title: 'Summarize', desc: 'Condense any text to key points via /summarize' },
            { title: 'Fact-Check', desc: 'Web search + AI verdict with confidence score' },
            { title: 'Image Solver', desc: 'Solve equations from uploaded photos' },
          ].slice(0, 7).map((s) => (
            <Link key={s.title} href="/documentation/commands">
              <div className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:bg-card/80 h-full">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Operations ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Setup & Reference</h2>
          <p className="text-sm text-muted-foreground mt-1">Quick start, commands, settings, security, and API docs.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {operationsGuides.map((guide) => (
            <Link key={guide.href} href={guide.href}>
              <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {guide.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{guide.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Ready to start?</h2>
            <p className="text-sm text-muted-foreground max-w-lg">
              No signup required for basic use. Create a free account to save chat history and sync settings across devices.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/chat">
              <Button className="gap-2">
                Open Chat
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
