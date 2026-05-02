'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, X, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchSubs, type CommunitySub } from '@/lib/supabase-client';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const PLACEHOLDER_SUBS: CommunitySub[] = [
  { id: '1', slug: 'general',        name: 'General',        description: 'General discussion about SOHAM and AI.',                  icon: '💬', banner: null, member_count: 1200, created_at: '' },
  { id: '2', slug: 'tips',           name: 'Tips & Tricks',  description: 'Share prompts, workflows, and power-user tips.',           icon: '💡', banner: null, member_count: 890,  created_at: '' },
  { id: '3', slug: 'showcase',       name: 'Showcase',       description: 'Show off your AI experiments and creative outputs.',       icon: '🎨', banner: null, member_count: 654,  created_at: '' },
  { id: '4', slug: 'help',           name: 'Help & Support', description: 'Ask questions and get help from the community.',           icon: '🙋', banner: null, member_count: 432,  created_at: '' },
  { id: '5', slug: 'feature-ideas',  name: 'Feature Ideas',  description: 'Suggest and vote on new features for SOHAM.',             icon: '🚀', banner: null, member_count: 321,  created_at: '' },
  { id: '6', slug: 'announcements',  name: 'Announcements',  description: 'Official updates and release notes from the SOHAM team.', icon: '📢', banner: null, member_count: 1500, created_at: '' },
];

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function CommunitiesPage() {
  const [subs, setSubs] = useState<CommunitySub[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchSubs().then((data) => {
      setSubs(data.length > 0 ? data : PLACEHOLDER_SUBS);
      setLoading(false);
    });
  }, []);

  const filtered = subs.filter(
    (s) =>
      !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.slug.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">All Communities</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search communities…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          : filtered.map((sub) => (
              <Link
                key={sub.slug}
                href={`/community/c/${sub.slug}`}
                className="group rounded-xl border bg-card p-4 space-y-2 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl">
                      {sub.icon ?? '🌐'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                        c/{sub.slug}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {formatCount(sub.member_count)} members
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 h-7 text-xs" onClick={(e) => e.preventDefault()}>
                    Join
                  </Button>
                </div>
                {sub.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{sub.description}</p>
                )}
              </Link>
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border bg-card py-12 text-center">
          <p className="font-semibold">No communities found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
