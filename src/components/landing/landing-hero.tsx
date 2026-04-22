'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
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
  sectionVariant: {
    initial: { opacity: number; y: number };
    whileInView: { opacity: number; y: number };
    viewport: { once: boolean; amount: number };
    transition: { duration: number; ease: [number, number, number, number] };
  };
}

function ProductSnapshot({
  activeMode,
  setActiveMode,
  heroFeatures,
  trustStats,
  compact = false,
}: {
  activeMode: CoreMode;
  setActiveMode: (mode: CoreMode) => void;
  heroFeatures: HeroFeature[];
  trustStats: TrustStat[];
  compact?: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="hero-logo-panel">
        <div className="hero-logo-panel__glow hero-logo-panel__glow--orange" />
        <div className="hero-logo-panel__glow hero-logo-panel__glow--green" />
        <div className="hero-logo-panel__glow hero-logo-panel__glow--blue" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#93E1F4]">
                SOHAM Workspace
              </p>
              <p className={`${compact ? 'mt-2 text-xl leading-tight' : 'mt-2 text-2xl'} font-semibold text-white`}>
                A single product surface for actual tasks
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-200">
              {activeMode}
            </span>
          </div>

          <div className={`grid gap-4 ${compact ? 'md:grid-cols-1' : 'lg:grid-cols-[220px_1fr]'}`}>
            <div className={`relative flex items-center justify-center rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] ${compact ? 'p-5' : 'p-8'}`}>
              <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,#5b6cff22,transparent_52%),radial-gradient(circle_at_bottom,#93E1F422,transparent_56%)]" />
              <Image
                src="/FINALSOHAM.png"
                alt="SOHAM colored logo"
                width={220}
                height={220}
                priority
                className={`relative z-10 h-auto w-full object-contain drop-shadow-[0_24px_60px_rgba(0,0,0,0.38)] ${compact ? 'max-w-[112px]' : 'max-w-[170px]'}`}
              />
            </div>

            <div className="grid gap-3">
              {heroFeatures.map((feature) => {
                const Icon = feature.icon;
                const isActive = activeMode === feature.mode;

                return (
                  <button
                    key={feature.title}
                    type="button"
                    className={`rounded-[22px] border px-4 py-4 text-left transition-all ${
                      isActive
                        ? 'border-white/20 bg-white/10 shadow-[0_18px_48px_rgba(0,0,0,0.24)]'
                        : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                    }`}
                    onMouseEnter={() => setActiveMode(feature.mode)}
                    onFocus={() => setActiveMode(feature.mode)}
                    onMouseLeave={() => !compact && setActiveMode('general')}
                    onClick={() => setActiveMode(activeMode === feature.mode && compact ? 'general' : feature.mode)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-[#93E1F4]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">{feature.title}</p>
                        <p className={`mt-1 text-slate-300 ${compact ? 'text-[13px] leading-5' : 'text-sm leading-6'}`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
            {(compact ? trustStats.slice(0, 2) : trustStats).map((stat) => (
              <div key={stat.label} className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
                <p className="mt-2 text-sm font-medium text-slate-100">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
            <LockKeyhole className="h-3.5 w-3.5 text-[#AEE124]" />
            Data handling
          </div>
          <p className="text-lg font-semibold text-white">Local chat storage stays visible as a trust feature</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Users can see that chat history is handled locally on the device while account-gated tools use protected
            routes for document and workspace access.
          </p>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-[#5b6cff]" />
            App structure
          </div>
          <p className="text-lg font-semibold text-white">Fast routes, protected tools, and one consistent system</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Chat, AI Services, PDF Analyzer, and Image Math Solver are part of one route structure, so the product
            feels like a workspace instead of a collection of isolated screens.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DesktopLandingHero({
  activeMode,
  setActiveMode,
  heroFeatures,
  trustStats,
  sectionVariant,
}: HeroProps) {
  return (
    <section className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:pt-20">
      <div {...sectionVariant} className="relative z-10">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#93E1F4]/25 bg-[#93E1F4]/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#dff8ff]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Production AI workspace
        </div>

        <div className="flex items-center gap-4">
          <Image
            src="/FINALSOHAM.png"
            alt="SOHAM colored logo"
            width={84}
            height={84}
            priority
            className="h-16 w-16 rounded-[18px] bg-white/5 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:h-20 sm:w-20"
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">SOHAM</p>
            <p className="mt-1 text-sm uppercase tracking-[0.18em] text-slate-500">by CODEEX-AI</p>
          </div>
        </div>

        <h1 className="mt-7 font-[family:var(--font-manrope)] text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
          One workspace for chat, PDFs, and image solving.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
          SOHAM is the product from CODEEX-AI. It combines protected chat, PDF analysis, image math solving,
          voice access, and multi-model routing into a product that is designed for regular use on desktop and phone.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/login">
            <Button
              size="lg"
              className="h-12 border-0 bg-[linear-gradient(135deg,#5b6cff,#AEE124_52%,#93E1F4)] px-7 text-slate-950 shadow-[0_20px_50px_rgba(147,225,244,0.18)] hover:opacity-95"
            >
              Open SOHAM
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/documentation">
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/15 bg-white/6 px-7 text-slate-100 backdrop-blur-md hover:bg-white/10"
            >
              View Documentation
            </Button>
          </Link>
        </div>
        <p className="mt-3 text-sm text-slate-400">Protected routes for core tools. Free to start. Built for repeat use.</p>
      </div>

      <div {...sectionVariant} className="relative z-10">
        <ProductSnapshot
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          heroFeatures={heroFeatures}
          trustStats={trustStats}
        />
      </div>
    </section>
  );
}

export function MobileLandingHero({
  activeMode,
  setActiveMode,
  heroFeatures,
  trustStats,
  sectionVariant,
}: HeroProps) {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-6">
      <div {...sectionVariant} className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#93E1F4]/25 bg-[#93E1F4]/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#dff8ff]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Production AI workspace
        </div>

        <div className="flex items-center gap-3">
          <Image
            src="/FINALSOHAM.png"
            alt="SOHAM colored logo"
            width={58}
            height={58}
            priority
            className="h-14 w-14 rounded-[16px] bg-white/5 p-2"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">SOHAM</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">by CODEEX-AI</p>
          </div>
        </div>

        <h1 className="mt-5 max-w-[11ch] font-[family:var(--font-manrope)] text-[2.35rem] font-semibold leading-[0.92] text-white">
          Chat, docs, and solving in one mobile-ready workspace.
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
          Open chat, analyze a PDF, or solve from an image in a route structure that is compact on a phone and still
          feels like one product.
        </p>

        <div className="mt-6 grid gap-3">
          <Link href="/login">
            <Button className="h-12 w-full border-0 bg-[linear-gradient(135deg,#5b6cff,#AEE124_52%,#93E1F4)] text-slate-950 hover:opacity-95">
              Open SOHAM
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/ai-services">
            <Button variant="outline" className="h-11 w-full border-white/15 bg-white/6 text-slate-100 hover:bg-white/10">
              View AI Services
            </Button>
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-400">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">35+ models</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Protected tools</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Phone-first flows</span>
        </div>

        <div className="mt-6">
          <ProductSnapshot
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            heroFeatures={heroFeatures}
            trustStats={trustStats}
            compact
          />
        </div>
      </div>
    </section>
  );
}
