'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, Bell, User, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/community',              icon: Home,       label: 'Home'      },
  { href: '/community/search',       icon: Search,     label: 'Search'    },
  { href: '/community/create',       icon: PlusCircle, label: 'Create'    },
  { href: '/community/notifications',icon: Bell,       label: 'Alerts'    },
  { href: '/community/profile',      icon: User,       label: 'Profile'   },
];

export function CommunityTopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 md:px-6">

        {/* Back to chat */}
        <Link
          href="/chat"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 mr-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Chat</span>
        </Link>

        {/* Logo */}
        <Link href="/community" className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Image src="/FINALSOHAM.png" alt="SOHAM" width={28} height={28} className="rounded-lg" />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-sm leading-none">SOHAM</span>
            <span className="block text-[10px] text-muted-foreground leading-none mt-0.5">Community</span>
          </div>
        </Link>

        {/* Search bar */}
        <Link
          href="/community/search"
          className="flex flex-1 items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:border-border transition-all max-w-sm"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Search posts, communities…</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5 ml-1">
          {NAV_ITEMS.filter(n => n.href !== '/community/search').map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === href || (href !== '/community' && pathname.startsWith(href))
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Create button */}
        <Button asChild size="sm" className="hidden md:flex gap-1.5 rounded-full h-8 px-4 shrink-0">
          <Link href="/community/create">
            <PlusCircle className="h-3.5 w-3.5" />
            Post
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function CommunityBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/community' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[3rem]',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
