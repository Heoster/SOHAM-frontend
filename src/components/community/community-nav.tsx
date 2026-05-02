'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, Bell, User, Flame, TrendingUp, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const NAV_ITEMS = [
  { href: '/community',        icon: Home,       label: 'Home'    },
  { href: '/community/search', icon: Search,     label: 'Search'  },
  { href: '/community/create', icon: PlusCircle, label: 'Create'  },
  { href: '/community/notifications', icon: Bell, label: 'Alerts' },
  { href: '/community/profile',icon: User,       label: 'Profile' },
];

export function CommunityTopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        {/* Logo */}
        <Link href="/community" className="flex items-center gap-2 shrink-0">
          <Image src="/FINALSOHAM.png" alt="SOHAM" width={26} height={26} />
          <span className="font-bold text-base hidden sm:block">Community</span>
        </Link>

        {/* Search bar */}
        <Link
          href="/community/search"
          className="flex flex-1 items-center gap-2 rounded-full border bg-muted/50 px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors max-w-md"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span>Search communities and posts…</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Create button (desktop) */}
        <Link
          href="/community/create"
          className="hidden md:flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Post
        </Link>
      </div>
    </header>
  );
}

export function CommunityBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors',
              pathname === href
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5', pathname === href && 'fill-primary/20')} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
