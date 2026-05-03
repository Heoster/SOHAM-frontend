'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type CoreMode } from '@/components/landing/soham-core';
import { cn } from '@/lib/utils';

interface HeroFeature {
  mode: CoreMode;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TrustStat {
  label: string;
  value: string;
}

interface HeroProps {
  activeMode: CoreMode;
  setActiveMode: (mode: CoreMode) => void;
  heroFeatures: HeroFeature[];
  trustStats: TrustStat[];
  sectionVariant: object;
}

const FREE_BULLETS = [
  '35+ AI models — Groq, Gemini, Cerebras, DeepSeek',
  'Free image generation — just describe it',
  'Real-time web search with citations',
  'Voice input & output — 6 voices',
  'PDF analysis up to 5MB',
  'No credit card. No subscription. Ever.',
];

const TESTERS = ['Vidhan', 'Avineet', 'Vansh', 'Aayush', 'Varun', 'Pankaj', 'Masum', 'Sachin'];

// Simplified model list for the interactive selector
const MODEL_GROUPS = [
  { provider: 'Groq', color: 'text-orange-400', models: ['Llama 4 Scout 17B', 'GPT-OSS 120B', 'Qwen3 32B', 'Llama 3.1 8B Instant'] },
  { provider: 'Cerebras', color: 'text-blue-400', models: ['Qwen 3 235B', 'GPT-OSS 120B', 'GLM 4.7', 'Llama 3.1 8B'] },
  { provider: 'Google', color: 'text-green-400', models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Imagen 3'] },
  { provider: 'HuggingFace', color: 'text-yellow-400', models: ['DeepSeek R1 70B', 'Llama 3.3 70B', 'Qwen 2.5 72B'] },
  { provider: 'OpenRouter', color: 'text-purple-400', models: ['NVIDIA Nemotron 120B', 'Arcee Trinity 400B', 'MiniMax M2.5'] },
];

function ModelSelectorDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('Auto (Recommended)');

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-sm text-white transition-all hover:border-white/20 hover:bg-white/[0.08]"
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-medium">{selected}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">Free</span>
          <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-white/12 bg-[#0e0e12] shadow-2xl">
          <div className="px-3 py-2 border-b border-white/8">
            <button
              onClick={() => { setSelected('Auto (Recommended)'); setOpen(false); }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white hover:bg-white/8 transition-all"
            >
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Auto (Recommended)
              <span className="ml-auto text-[10px] text-slate-500">Picks best model per query</span>
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {MODEL_GROUPS.map((group) => (
              <div key={group.provider}>
                <p className={cn('px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider', group.color)}>
                  {group.provider}
                </p>
                {group.models.map((model) => (
                  <button
                    key={model}
                    onClick={() => { setSelected(model); setOpen(false); }}
                    className="flex w-full items-center gap-2 px-4 py-1.5 text-sm text-slate-300 hover:bg-white/6 hover:text-white transition-all"
                  >
                    {model}
                    <span className="ml-auto text-[10px] text-green-500">Free</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 px-4 py-2 text-[11px] text-slate-500">
            35+ models total · All free · No API key needed
          </div>
        </div>
      )}
    </div>
  );
}

export function DesktopLandingHero({ heroFeatures, trustStats }: HeroProps) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pt-14 pb-20 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">

        {/* ── Left: Copy ── */}
        <div className="space-y-7">
          {/* Founder badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-slate-300">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Built by Heoster, age 16 · Khatauli, India · CODEEX-AI
          </div>

          <div className="space-y-4">
            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.75rem)', lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              The free AI that does{' '}
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                everything
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-slate-400 max-w-lg">
              35+ AI models, image generation, voice, web search, PDF analysis — all free.
              No paywalls. No signup required to start.
            </p>
          </div>

          {/* Free bullets */}
          <ul className="space-y-2.5">
            {FREE_BULLETS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                  <Check className="h-3 w-3 text-green-400" />
                </div>
                {b}
              </li>
            ))}
          </ul>

          {/* CTAs — clear visual hierarchy */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/chat">
              <Button
                size="lg"
                className="h-11 px-6 font-semibold text-white border-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)', boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}
              >
                Start chatting free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 border-white/15 bg-transparent text-slate-300 hover:text-white hover:bg-white/8"
              >
                See how it works
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                {TESTERS.slice(0, 5).map((name) => (
                  <div
                    key={name}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#060608] bg-gradient-to-br from-blue-500 to-purple-600 text-[10px] font-bold text-white"
                  >
                    {name[0]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Tested by {TESTERS.length}+ friends · 100+ countries
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Open source MIT · Privacy-first · No data selling
            </p>
          </div>
        </div>

        {/* ── Right: Interactive panel ── */}
        <div className="space-y-3">
          {/* Stats row with live uptime indicator */}
          <div className="grid grid-cols-4 gap-2">
            {trustStats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.04] p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  {s.label === 'Uptime' && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Interactive model selector */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-300">Choose your AI model</p>
              <span className="text-[10px] text-slate-500">35+ available · all free</span>
            </div>
            <ModelSelectorDemo />
            <p className="text-[11px] text-slate-500">
              Auto mode picks the best model for each query automatically.
            </p>
          </div>

          {/* Feature cards */}
          {heroFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/15 transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{f.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                  Free
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function MobileLandingHero({ heroFeatures, trustStats }: HeroProps) {
  return (
    <section className="w-full px-4 pt-8 pb-12 space-y-7" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>

      {/* Founder badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300">
        <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        Built by Heoster, 16 · CODEEX-AI · India
      </div>

      {/* Headline — fluid font size prevents overflow */}
      <div className="space-y-3">
        <h1 style={{ fontSize: 'clamp(2rem, 9vw, 3rem)', lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
          The free AI that does{' '}
          <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            everything
          </span>
        </h1>
        <p className="text-base leading-relaxed text-slate-400">
          35+ models, image gen, voice, web search, PDF — all free. No card needed.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex gap-3">
        <Link href="/chat" className="flex-1">
          <Button
            className="w-full h-11 font-semibold text-white border-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)' }}
          >
            Start free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/faq">
          <Button variant="outline" className="h-11 border-white/15 bg-transparent text-slate-200 hover:bg-white/8">
            FAQ
          </Button>
        </Link>
      </div>

      {/* Stats with live uptime */}
      <div className="grid grid-cols-4 gap-2">
        {trustStats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.04] p-2.5 text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-base font-bold text-white">{s.value}</p>
              {s.label === 'Uptime' && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                </span>
              )}
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Interactive model selector */}
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5 space-y-2.5">
        <p className="text-xs font-semibold text-slate-300">Choose your AI model</p>
        <ModelSelectorDemo />
      </div>

      {/* Feature list */}
      <ul className="space-y-2">
        {FREE_BULLETS.map((b) => (
          <li key={b} className="flex items-center gap-2.5 text-sm text-slate-300">
            <Check className="h-3.5 w-3.5 shrink-0 text-green-400" />
            {b}
          </li>
        ))}
      </ul>

      {/* Feature cards */}
      <div className="space-y-2.5">
        {heroFeatures.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400 line-clamp-2">{f.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                Free
              </span>
            </div>
          );
        })}
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-2.5">
        <div className="flex -space-x-1.5">
          {TESTERS.slice(0, 4).map((name) => (
            <div key={name} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#060608] bg-gradient-to-br from-blue-500 to-purple-600 text-[9px] font-bold text-white">
              {name[0]}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">Tested by {TESTERS.length}+ friends · 100+ countries</p>
      </div>
    </section>
  );
}
