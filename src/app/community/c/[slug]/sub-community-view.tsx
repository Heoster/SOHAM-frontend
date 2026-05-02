'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Clock, ThumbsUp, Flame, RefreshCw, Users, PlusCircle,
  AlertCircle, Loader2, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { fetchPostsBySub, fetchSub, type CommunityPost, type CommunitySub } from '@/lib/supabase-client';
import { PostCard } from '@/components/community/post-card';
import { cn } from '@/lib/utils';

type SortMode = 'newest' | 'top' | 'trending';

const SORT_TABS: { mode: SortMode; label: string; icon: React.ElementType }[] = [
  { mode: 'newest',   label: 'New', icon: Clock    },
  { mode: 'top',      label: 'Top', icon: ThumbsUp },
  { mode: 'trending', label: 'Hot', icon: Flame    },
];

const PLACEHOLDER_SUBS: Record<string, CommunitySub> = {
  general:       { id: '1', slug: 'general',       name: 'General',        description: 'General discussion about SOHAM and AI.',                  icon: '💬', banner: null, member_count: 1200, created_at: '' },
  tips:          { id: '2', slug: 'tips',           name: 'Tips & Tricks',  description: 'Share prompts, workflows, and power-user tips.',           icon: '💡', banner: null, member_count: 890,  created_at: '' },
  showcase:      { id: '3', slug: 'showcase',       name: 'Showcase',       description: 'Show off your AI experiments and creative outputs.',       icon: '🎨', banner: null, member_count: 654,  created_at: '' },
  help:          { id: '4', slug: 'help',           name: 'Help & Support', description: 'Ask questions and get help from the community.',           icon: '🙋', banner: null, member_count: 432,  created_at: '' },
  'feature-ideas':{ id: '5', slug: 'feature-ideas', name: 'Feature Ideas',  description: 'Suggest and vote on new features for SOHAM.',             icon: '🚀', banner: null, member_count: 321,  created_at: '' },
  announcements: { id: '6', slug: 'announcements',  name: 'Announcements',  description: 'Official updates and release notes from the SOHAM team.', icon: '📢', banner: null, member_count: 1500, created_at: '' },
};

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function SubCommunityView({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [sub, setSub] = useState<CommunitySub | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [visibleCount, setVisibleCount] = useState(15);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetchSub(slug).then((data) => {
      setSub(data ?? PLACEHOLDER_SUBS[slug] ?? null);
    });
  }, [slug]);

  const loadPosts = useCallback(async (mode: SortMode = sortMode) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPostsBySub(slug, mode);
      setPosts(data);
      if (data.length === 0) setError('No posts in this community yet. Be the first!');
    } catch {
      setError('Could not load posts.');
    } finally {
      setLoading(false);
    }
  }, [slug, sortMode]);

  useEffect(() => { loadPosts(sortMode); }, [sortMode]);

  const handleDelete = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {/* Sub header */}
      {sub ? (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Banner */}
          <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent flex items-end px-4 pb-0">
          </div>
          <div className="px-4 pb-4 -mt-5">
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full border-4 border-background bg-card flex items-center justify-center text-2xl shadow-sm">
                  {sub.icon ?? '🌐'}
                </div>
                <div className="pt-4">
                  <h1 className="text-xl font-bold">{sub.name}</h1>
                  <p className="text-sm text-muted-foreground">c/{sub.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Button
                  size="sm"
                  variant={joined ? 'outline' : 'default'}
                  onClick={() => setJoined((v) => !v)}
                  className="gap-2"
                >
                  {joined ? (
                    <><CheckCircle className="h-4 w-4" /> Joined</>
                  ) : (
                    <><Users className="h-4 w-4" /> Join</>
                  )}
                </Button>
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <Link href={`/community/create?sub=${slug}`}>
                    <PlusCircle className="h-4 w-4" /> Post
                  </Link>
                </Button>
              </div>
            </div>
            {sub.description && (
              <p className="mt-3 text-sm text-muted-foreground">{sub.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <div className="text-center">
                <p className="text-sm font-bold">{formatCount(sub.member_count)}</p>
                <p className="text-[10px] text-muted-foreground">Members</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">{posts.length}</p>
                <p className="text-[10px] text-muted-foreground">Posts</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="flex gap-3">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      )}

      {/* Sort tabs */}
      <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
        <div className="flex items-center gap-0.5">
          {SORT_TABS.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => { setSortMode(mode); setVisibleCount(15); }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                sortMode === mode
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <Button
          variant="ghost" size="sm"
          onClick={() => loadPosts(sortMode)}
          disabled={loading}
          className="ml-auto gap-1.5 text-xs h-8"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-600 dark:text-orange-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-0 rounded-xl border bg-card overflow-hidden">
              <div className="w-12 bg-muted/30 shrink-0" />
              <div className="flex-1 p-3 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-16 text-center">
            <p className="font-semibold">No posts yet</p>
            <p className="text-sm text-muted-foreground">Be the first to post in c/{slug}!</p>
            <Button asChild size="sm">
              <Link href={`/community/create?sub=${slug}`}>Create a post</Link>
            </Button>
          </div>
        ) : (
          <>
            {visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
                currentUserId={user?.uid ?? null}
                compact
                linkable
              />
            ))}
            {visibleCount < posts.length && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={() => setVisibleCount((c) => c + 15)} className="gap-2">
                  <Loader2 className="h-4 w-4" />
                  Load more ({posts.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
