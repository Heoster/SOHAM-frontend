'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isScrolled: boolean;
  mobileNavOpen?: boolean;
  onToggleMobileNav?: () => void;
}

const navLinks = [
  { href: '/chat',          label: 'Chat' },
  { href: '/ai-services',   label: 'AI Services' },
  { href: '/faq',           label: 'FAQ' },
  { href: '/community',     label: 'Community' },
  { href: '/documentation', label: 'Docs' },
  { href: '/about',         label: 'About' },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <Image
        src="/FINALSOHAM.png"
        alt="SOHAM"
        width={32}
        height={32}
        priority
        className="rounded-xl"
      />
      <span className="text-base font-bold tracking-tight text-white group-hover:text-white/90 transition-colors">
        SOHAM
      </span>
    </Link>
  );
}

export function DesktopLandingHeader({ isScrolled }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'border-b border-white/8 bg-[#060608]/90 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Brand />

        <nav className="flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/6 transition-all"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-white/8"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/chat">
            <Button
              size="sm"
              className="bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-sm"
            >
              Try free
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MobileLandingHeader({ isScrolled, mobileNavOpen = false, onToggleMobileNav }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled || mobileNavOpen
          ? 'border-b border-white/8 bg-[#060608]/95 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <Brand />
        <div className="flex items-center gap-2">
          <Link href="/chat">
            <Button size="sm" className="h-8 bg-white text-slate-900 hover:bg-white/90 font-semibold text-xs px-3">
              Try free
            </Button>
          </Link>
          <button
            onClick={onToggleMobileNav}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/8 hover:text-white transition-all"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileNavOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="border-t border-white/8 bg-[#060608]/98 px-4 pb-4 pt-2">
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200 hover:bg-white/8 hover:text-white transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/login" className="mt-3 block">
            <Button variant="outline" className="w-full border-white/15 bg-transparent text-slate-200 hover:bg-white/8">
              Sign in to your account
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
