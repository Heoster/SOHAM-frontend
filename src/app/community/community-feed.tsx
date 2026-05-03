'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock, ThumbsUp, Flame, RefreshCw, Search, X, AlertCircle,
  PlusCircle, Loader2, TrendingUp, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import {
  fetchPosts, fetchTopPosts, fetchTrendingPosts, fetchPostsByTag,
  type CommunityPost,
} from '@/lib/supabase-client';
import { PostCard } from '@/components/community/post-card';
import { cn } from '@/lib/utils';

// ── Placeholder posts ─────────────────────────────────────────────────────────

const PLACEHOLDER_POSTS: CommunityPost[] = [
  {
    id: 'demo-1', user_name: 'Vidhan', user_avatar: null, user_id: null,
    title: 'Pro tip: Use /solve for step-by-step math solutions',
    content: 'Use /solve for math problems — it gives step-by-step solutions with the best model automatically selected. Way better than just asking normally! The auto-routing picks Gemini for complex proofs and Cerebras for quick arithmetic.',
    sub_slug: 'tips', likes: 24, dislikes: 1, comment_count: 3, is_pinned: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), tags: ['tip', 'math'],
  },
  {
    id: 'demo-2', user_name: 'Avineet', user_avatar: null, user_id: null,
    title: 'PDF Analyzer handled a 40-page research paper perfectly',
    content: 'Just tried the PDF analyzer on a 40-page research paper and it answered every question perfectly. The Gemini model is incredible for long documents. Highly recommend for academic work.',
    sub_slug: 'showcase', likes: 18, dislikes: 0, comment_count: 5, is_pinned: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(), tags: ['showcase', 'pdf'],
  },
  {
    id: 'demo-3', user_name: 'Vansh', user_avatar: null, user_id: null,
    title: 'Which model is best for creative writing?',
    content: 'Question: Which model is best for generating creative writing? I tried a few but Auto mode keeps picking Llama 3.3 — is that the right choice for fiction writing?',
    sub_slug: 'help', likes: 7, dislikes: 2, comment_count: 2, is_pinned: false,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(), tags: ['question'],
  },
  {
    id: 'demo-4', user_name: 'Aayush', user_avatar: null, user_id: null,
    title: 'FLUX.1 image generation is absolutely stunning',
    content: 'Tried the image generation with a detailed prompt: "a futuristic city at sunset with flying cars and neon lights". The result was stunning! FLUX.1 is really good for sci-fi scenes.',
    sub_slug: 'showcase', likes: 31, dislikes: 0, comment_count: 8, is_pinned: false,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(), tags: ['showcase', 'image-gen'],
  },
];

// ── Sort tabs ─────────────────────────────────────────────────────────────────

type SortMode = 'newest' | 'top' | 'trending';

const SORT_TABS: { mode: SortMode; label: string; icon: React.ElementType }[] = [
  { mode: 'newest',   label: 'New',  icon: Clock    },
  { mode: 'top',      label: 'Top',  icon: ThumbsUp },
  { mode: 'trending', label: 'Hot',  icon: Flame    },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="flex rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="w-11 bg-muted/20 border-r border-border/40 shrink-0" />
      <div className="flex-1 px-3 py-3 space-y-2.5">
        <div className="flex gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Main feed ─────────────────────────────────────────────────────────────────

export function CommunityFeed() {
  const { user } = useAuth();
  const [allPosts, setAllPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(15);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const loadPosts = useCallback(async (mode: SortMode = sortMode) => {
    setLoading(true);
    setError(null);
    try {
      let data: CommunityPost[];
      if (activeTag) data = await fetchPostsByTag(activeTag);
      else if (mode === 'top') data = await fetchTopPosts();
      else if (mode === 'trending') data = await fetchTrendingPosts();
      else data = await fetchPosts();
      setAllPosts(data.length > 0 ? data : PLACEHOLDER_POSTS);
      if (data.length === 0) setError('Showing example posts — run the SQL setup to enable live posts.');
    } catch {
      setAllPosts(PLACEHOLDER_POSTS);
      setError('Could not load live posts — showing example posts.');
    } finally {
      setLoading(false);
    }
  }, [sortMode, activeTag]);

  useEffect(() => { loadPosts(sortMode); }, [sortMode, activeTag]);

  const handleDelete = useCallback((id: string) => {
    setAllPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return allPosts;
    const q = searchQuery.toLowerCase();
    return allPosts.filter(p =>
      p.content.toLowerCase().includes(q) ||
      (p.title ?? '').toLowerCase().includes(q) ||
      p.user_name.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q))
    );
  }, [allPosts, searchQuery]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    allPosts.forEach(p => p.tags.forEach(t => s.add(t)));
    return [...s].sort();
  }, [allPosts]);

  return (
    <div className="space-y-3">

      {/* Sort + controls bar */}
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2">
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
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost" size="sm"
            onClick={() => loadPosts(sortMode)}
            disabled={loading}
            className="gap-1.5 text-xs h-8 text-muted-foreground"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button asChild size="sm" className="gap-1.5 h-8 rounded-full hidden sm:flex">
            <Link href="/community/create">
              <PlusCircle className="h-3.5 w-3.5" /> Create Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search posts, users, or tags…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 pr-9 rounded-xl border-border/60"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTag(null)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-all',
              !activeTag ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
            )}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                activeTag === tag ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/8 px-4 py-3 text-sm text-orange-600 dark:text-orange-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-2.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-card py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <TrendingUp className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-semibold">{searchQuery ? 'No posts match your search' : 'No posts yet'}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? 'Try a different search term.' : 'Be the first to share something!'}
              </p>
            </div>
            {searchQuery ? (
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>Clear search</Button>
            ) : (
              <Button asChild size="sm" className="gap-2 rounded-full">
                <Link href="/community/create"><PlusCircle className="h-4 w-4" /> Create a post</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            {visiblePosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
                currentUserId={user?.uid ?? null}
                compact
                linkable
              />
            ))}

            {visibleCount < filteredPosts.length && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount(c => c + 15)}
                  className="gap-2 rounded-full"
                >
                  <Loader2 className="h-4 w-4" />
                  Load more ({filteredPosts.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
