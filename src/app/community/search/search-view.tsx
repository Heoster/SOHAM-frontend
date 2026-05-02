'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, Tag, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { fetchPosts, type CommunityPost } from '@/lib/supabase-client';
import { PostCard } from '@/components/community/post-card';

const POPULAR_TAGS = [
  'tip', 'question', 'showcase', 'bug', 'feature-request',
  'prompt', 'coding', 'math', 'voice', 'pdf', 'image-gen',
];

export function SearchView() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [allPosts, setAllPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams?.get('q') ?? '');
  const [activeTag, setActiveTag] = useState(searchParams?.get('tag') ?? '');
  const [visibleCount, setVisibleCount] = useState(15);

  useEffect(() => {
    fetchPosts(200).then((data) => {
      setAllPosts(data);
      setLoading(false);
    });
  }, []);

  const results = useMemo(() => {
    let posts = allPosts;
    if (activeTag) {
      posts = posts.filter((p) => p.tags.includes(activeTag));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          (p.title ?? '').toLowerCase().includes(q) ||
          p.user_name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }
    return posts;
  }, [allPosts, query, activeTag]);

  const visibleResults = results.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Search</h1>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          autoFocus
          placeholder="Search posts, users, or tags…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setVisibleCount(15); }}
          className="pl-9 pr-9 text-base"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Popular tags */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" /> Browse by tag
        </p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => { setActiveTag(activeTag === tag ? '' : tag); setVisibleCount(15); }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                activeTag === tag
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {(query || activeTag) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
              {activeTag && <> for tag <Badge variant="secondary" className="ml-1">{activeTag}</Badge></>}
              {query && <> matching <span className="font-medium text-foreground">"{query}"</span></>}
            </p>
            {(query || activeTag) && (
              <button
                onClick={() => { setQuery(''); setActiveTag(''); }}
                className="text-xs text-primary hover:underline ml-auto"
              >
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-xl border bg-card py-12 text-center">
              <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="font-semibold">No results found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term or tag.</p>
            </div>
          ) : (
            <>
              {visibleResults.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.uid ?? null}
                  compact
                  linkable
                />
              ))}
              {visibleCount < results.length && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={() => setVisibleCount((c) => c + 15)} className="gap-2">
                    <Loader2 className="h-4 w-4" />
                    Load more ({results.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Empty state */}
      {!query && !activeTag && (
        <div className="rounded-xl border bg-card py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold text-muted-foreground">Start typing to search</p>
          <p className="text-sm text-muted-foreground mt-1">Or pick a tag above to browse by topic.</p>
        </div>
      )}
    </div>
  );
}
