'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Users, TrendingUp, Plus, ChevronRight, Flame, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { fetchSubs, type CommunitySub } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

const PLACEHOLDER_SUBS: CommunitySub[] = [
  { id: '1', slug: 'general',        name: 'General',        description: 'General discussion about SOHAM and AI.', icon: '💬', banner: null, member_count: 1200, created_at: '' },
  { id: '2', slug: 'tips',           name: 'Tips & Tricks',  description: 'Share prompts, workflows, and power-user tips.', icon: '💡', banner: null, member_count: 890, created_at: '' },
  { id: '3', slug: 'showcase',       name: 'Showcase',       description: 'Show off your AI experiments.', icon: '🎨', banner: null, member_count: 654, created_at: '' },
  { id: '4', slug: 'help',           name: 'Help & Support', description: 'Ask questions and get help.', icon: '🙋', banner: null, member_count: 432, created_at: '' },
  { id: '5', slug: 'feature-ideas',  name: 'Feature Ideas',  description: 'Suggest new features for SOHAM.', icon: '🚀', banner: null, member_count: 321, created_at: '' },
  { id: '6', slug: 'announcements',  name: 'Announcements',  description: 'Official updates from the SOHAM team.', icon: '📢', banner: null, member_count: 1500, created_at: '' },
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
    <aside className="space-y-3 w-full">

      {/* Create CTA */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="h-16 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent" />
        <div className="px-4 pb-4 -mt-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-12 w-12 rounded-xl border-4 border-background bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xl shadow-sm">
              🌐
            </div>
            <div className="pt-2">
              <p className="text-sm font-bold">Home Feed</p>
              <p className="text-xs text-muted-foreground">Your SOHAM community</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Share tips, ask questions, and connect with other SOHAM users. Every post helps build a knowledge base for everyone.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild size="sm" className="w-full gap-2 rounded-full">
              <Link href="/community/create">
                <Plus className="h-4 w-4" /> Create Post
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="w-full gap-2 rounded-full">
              <Link href="/community/communities">
                <Users className="h-4 w-4" /> Browse Communities
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Top communities */}
      <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Top Communities</h3>
          </div>
        </div>
        <div className="space-y-0.5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))
            : subs.slice(0, 6).map((sub, i) => (
                <Link
                  key={sub.slug}
                  href={`/community/c/${sub.slug}`}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors group',
                    activeSub === sub.slug
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-base">
                    {sub.icon ?? '🌐'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                      c/{sub.slug}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users className="h-2.5 w-2.5" />
                      {formatCount(sub.member_count)} members
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold shrink-0 w-5 text-right">
                    #{i + 1}
                  </span>
                </Link>
              ))}
        </div>
        <Link
          href="/community/communities"
          className="flex items-center gap-1 text-xs text-primary hover:underline font-medium pt-1"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Community rules */}
      <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Community Rules</h3>
        </div>
        <div className="space-y-2">
          {[
            { n: 1, rule: 'Be respectful and kind to everyone' },
            { n: 2, rule: 'No spam, ads, or self-promotion' },
            { n: 3, rule: 'Stay on topic for each community' },
            { n: 4, rule: 'No hate speech or harassment' },
            { n: 5, rule: 'Mark spoilers appropriately' },
          ].map(({ n, rule }) => (
            <div key={n} className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
                {n}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-2xl border border-border/60 bg-card/50 p-3 space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {[
            { label: 'Help', href: '/faq' },
            { label: 'Contact', href: '/contact' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              {label}
            </Link>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          SOHAM Community · Built by Heoster · CODEEX-AI
        </p>
      </div>
    </aside>
  );
}
