'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type CoreMode } from '@/components/landing/soham-core';

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

export function DesktopLandingHero({ heroFeatures, trustStats, sectionVariant }: HeroProps) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pt-16 pb-20">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

        {/* ── Left: Copy ── */}
        <div className="space-y-8">
          {/* Founder badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-slate-300">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Built by Heoster, age 16 · Khatauli, India · CODEEX-AI
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white lg:text-6xl">
              The free AI that does{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
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

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/chat">
              <Button
                size="lg"
                className="h-11 bg-white px-6 text-slate-900 font-semibold hover:bg-white/90 shadow-lg shadow-white/10"
              >
                Start chatting free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button
                size="lg"
                variant="ghost"
                className="h-11 px-6 text-slate-300 hover:text-white hover:bg-white/8"
              >
                See how it works
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
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
                Tested by {TESTERS.length}+ friends · 100+ countries · 99.9% uptime
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Open source · MIT License · Privacy-first · No data selling
            </p>
          </div>
        </div>

        {/* ── Right: Feature cards ── */}
        <div className="space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {trustStats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/8 bg-white/4 p-4 text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feature cards */}
          {heroFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/15 transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{f.description}</p>
                </div>
                <div className="ml-auto shrink-0">
                  <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                    Free
                  </span>
                </div>
              </div>
            );
          })}

          {/* SOHAM logo card */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-gradient-to-r from-blue-500/8 to-purple-500/8 p-4">
            <Image src="/FINALSOHAM.png" alt="SOHAM" width={40} height={40} className="rounded-xl" />
            <div>
              <p className="text-sm font-semibold text-white">SOHAM by CODEEX-AI</p>
              <p className="text-xs text-slate-400">Self Organising Hyper Adaptive Machine</p>
            </div>
            <Link href="/chat" className="ml-auto">
              <Button size="sm" className="h-8 bg-white text-slate-900 hover:bg-white/90 text-xs font-semibold">
                Open <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MobileLandingHero({ heroFeatures, trustStats, sectionVariant }: HeroProps) {
  return (
    <section className="px-4 pt-8 pb-12 space-y-8">

      {/* Founder badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300">
        <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        Built by Heoster, 16 · CODEEX-AI · India
      </div>

      {/* Headline */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white">
          The free AI that does{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
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
          <Button className="w-full h-11 bg-white text-slate-900 font-semibold hover:bg-white/90">
            Start free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/faq">
          <Button variant="outline" className="h-11 border-white/15 bg-white/5 text-slate-200 hover:bg-white/10">
            FAQ
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {trustStats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/8 bg-white/4 p-3 text-center">
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Feature list */}
      <div className="space-y-2">
        {FREE_BULLETS.map((b) => (
          <div key={b} className="flex items-center gap-2.5 text-sm text-slate-300">
            <Check className="h-3.5 w-3.5 shrink-0 text-green-400" />
            {b}
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="space-y-2.5">
        {heroFeatures.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white">
                <Icon className="h-4.5 w-4.5" />
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
            <div
              key={name}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#060608] bg-gradient-to-br from-blue-500 to-purple-600 text-[9px] font-bold text-white"
            >
              {name[0]}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">Tested by {TESTERS.length}+ friends · 100+ countries</p>
      </div>
    </section>
  );
}
