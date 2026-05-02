'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Users, TrendingUp, Plus, ChevronRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchSubs, type CommunitySub } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

const PLACEHOLDER_SUBS: CommunitySub[] = [
  { id: '1', slug: 'general',       name: 'General',       description: '', icon: '💬', banner: null, member_count: 1200, created_at: '' },
  { id: '2', slug: 'tips',          name: 'Tips & Tricks', description: '', icon: '💡', banner: null, member_count: 890,  created_at: '' },
  { id: '3', slug: 'showcase',      name: 'Showcase',      description: '', icon: '🎨', banner: null, member_count: 654,  created_at: '' },
  { id: '4', slug: 'help',          name: 'Help & Support',description: '', icon: '🙋', banner: null, member_count: 432,  created_at: '' },
  { id: '5', slug: 'feature-ideas', name: 'Feature Ideas', description: '', icon: '🚀', banner: null, member_count: 321,  created_at: '' },
  { id: '6', slug: 'announcements', name: 'Announcements', description: '', icon: '📢', banner: null, member_count: 1500, created_at: '' },
];

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function CommunitySidebar({ activeSub }: { activeSub?: string }) {
  const [subs, setSubs] = useState<CommunitySub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubs().then((data) => {
      setSubs(data.length > 0 ? data : PLACEHOLDER_SUBS);
      setLoading(false);
    });
  }, []);

  return (
    <aside className="space-y-4 w-full">
      {/* Create post CTA */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Home Feed</p>
            <p className="text-xs text-muted-foreground">Your SOHAM community</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Share tips, ask questions, and connect with other SOHAM users.
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild size="sm" className="w-full gap-2">
            <Link href="/community/create">
              <Plus className="h-4 w-4" /> Create Post
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="w-full gap-2">
            <Link href="/community/create?type=community">
              <Users className="h-4 w-4" /> Create Community
            </Link>
          </Button>
        </div>
      </div>

      {/* Top communities */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Top Communities</h3>
        </div>
        <div className="space-y-1">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))
            : subs.map((sub, i) => (
                <Link
                  key={sub.slug}
                  href={`/community/c/${sub.slug}`}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors group',
                    activeSub === sub.slug
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  <span className="text-base w-7 text-center shrink-0">{sub.icon ?? '🌐'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">c/{sub.slug}</p>
                    <p className="text-[10px] text-muted-foreground">{formatCount(sub.member_count)} members</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium shrink-0">#{i + 1}</span>
                </Link>
              ))}
        </div>
        <Link
          href="/community/communities"
          className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
        >
          View all communities <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Community rules */}
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="text-sm font-semibold">Community Rules</h3>
        {[
          '1. Be respectful and kind',
          '2. No spam or self-promotion',
          '3. Stay on topic',
          '4. No hate speech or harassment',
          '5. Mark spoilers appropriately',
        ].map((rule) => (
          <p key={rule} className="text-xs text-muted-foreground leading-relaxed">{rule}</p>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center px-2">
        SOHAM Community · Built with ❤️ by Heoster
      </p>
    </aside>
  );
}
