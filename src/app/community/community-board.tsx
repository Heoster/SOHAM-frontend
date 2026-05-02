'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { fetchPosts, createPost, likePost, type CommunityPost } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  Send,
  RefreshCw,
  MessageSquare,
  Clock,
  Tag,
  User,
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTED_TAGS = [
  'tip', 'question', 'showcase', 'bug', 'feature-request',
  'prompt', 'coding', 'math', 'voice', 'pdf', 'image-gen',
];

const PLACEHOLDER_POSTS: CommunityPost[] = [
  {
    id: 'demo-1',
    user_name: 'Vidhan',
    user_avatar: null,
    content: 'Pro tip: Use /solve for math problems — it gives step-by-step solutions with the best model automatically selected. Way better than just asking normally!',
    likes: 24,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    tags: ['tip', 'math'],
    user_id: null,
  },
  {
    id: 'demo-2',
    user_name: 'Avineet',
    user_avatar: null,
    content: 'Just tried the PDF analyzer on a 40-page research paper and it answered every question perfectly. The Gemini model is incredible for long documents.',
    likes: 18,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    tags: ['showcase', 'pdf'],
    user_id: null,
  },
  {
    id: 'demo-3',
    user_name: 'Vansh',
    user_avatar: null,
    content: 'Question: Which model is best for generating creative writing? I tried a few but Auto mode keeps picking Llama 3.3 — is that the right choice?',
    likes: 7,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    tags: ['question'],
    user_id: null,
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onLike,
  likedIds,
}: {
  post: CommunityPost;
  onLike: (id: string) => void;
  likedIds: Set<string>;
}) {
  const liked = likedIds.has(post.id);

  return (
    <Card className="transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold',
                getAvatarColor(post.user_name)
              )}
            >
              {getInitials(post.user_name)}
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{post.user_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(post.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 gap-1">
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <button
            onClick={() => onLike(post.id)}
            disabled={liked}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              liked
                ? 'text-red-500 bg-red-500/10 cursor-default'
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
            )}
            aria-label={liked ? 'Already liked' : 'Like this post'}
          >
            <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current')} />
            {post.likes}
          </button>
          <span className="text-[10px] text-muted-foreground">
            {post.id.startsWith('demo-') ? 'Example post' : 'Community post'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main board ───────────────────────────────────────────────────────────────

export function CommunityBoard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(10);

  // New post form
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Load liked IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('soham_liked_posts');
      if (stored) setLikedIds(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  const saveLikedIds = (ids: Set<string>) => {
    try {
      localStorage.setItem('soham_liked_posts', JSON.stringify([...ids]));
    } catch {}
  };

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPosts(50);
      if (data.length === 0) {
        // Show placeholder posts if Supabase table is empty or not yet set up
        setPosts(PLACEHOLDER_POSTS);
      } else {
        setPosts(data);
      }
    } catch {
      setPosts(PLACEHOLDER_POSTS);
      setError('Could not load live posts — showing example posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Pre-fill author name from Firebase user
  useEffect(() => {
    if (user?.displayName && !authorName) {
      setAuthorName(user.displayName);
    }
  }, [user, authorName]);

  const handleLike = async (postId: string) => {
    if (likedIds.has(postId)) return;
    const newIds = new Set(likedIds).add(postId);
    setLikedIds(newIds);
    saveLikedIds(newIds);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
    await likePost(postId);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 4)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 10) {
      toast({ title: 'Post too short', description: 'Write at least 10 characters.', variant: 'destructive' });
      return;
    }
    if (content.length > 1000) {
      toast({ title: 'Post too long', description: 'Keep it under 1000 characters.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const newPost = await createPost({
        user_name: authorName.trim() || 'Anonymous',
        user_avatar: user?.photoURL ?? null,
        content: content.trim(),
        tags: selectedTags,
        user_id: user?.uid ?? null,
      });

      if (newPost) {
        setPosts((prev) => [newPost, ...prev]);
        setContent('');
        setSelectedTags([]);
        toast({ title: 'Posted! 🎉', description: 'Your post is now live for everyone to see.' });
      } else {
        throw new Error('Failed to create post');
      }
    } catch {
      toast({
        title: 'Could not post',
        description: 'The community board may not be set up yet. Check the SQL setup guide.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <div className="space-y-8">

      {/* ── New post form ── */}
      <section id="post-form" className="scroll-mt-20">
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Share with the Community</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Your Name
                </label>
                <Input
                  placeholder={user?.displayName || 'Anonymous'}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  maxLength={50}
                  className="max-w-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  Your Post
                </label>
                <Textarea
                  placeholder="Share a tip, ask a question, show off an AI experiment, or give feedback…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {content.length}/1000 characters
                  </p>
                  {content.length > 900 && (
                    <p className="text-xs text-orange-500">Almost at limit</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Tags <span className="text-xs text-muted-foreground font-normal">(up to 4)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                        selectedTags.includes(tag)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={submitting || content.trim().length < 10}
                  className="gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {submitting ? 'Posting…' : 'Post to Community'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Posts are public and visible to everyone.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── Posts feed ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Community Posts</h2>
            {!loading && (
              <Badge variant="secondary" className="text-xs">
                {posts.length} posts
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadPosts}
            disabled={loading}
            className="gap-2 text-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-600 dark:text-orange-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-muted" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="h-2.5 w-16 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-4/5 rounded bg-muted" />
                    <div className="h-3 w-3/5 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
              <p className="font-semibold">No posts yet</p>
              <p className="text-sm text-muted-foreground">Be the first to share something with the community!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {visiblePosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLike} likedIds={likedIds} />
              ))}
            </div>

            {visibleCount < posts.length && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((c) => c + 10)}
                  className="gap-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  Load more ({posts.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Setup note ── */}
      <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Developer note:</strong> Community posts are stored in Supabase.
            Run the SQL in <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">ui/src/lib/community-posts.sql</code> in your
            Supabase dashboard to enable live posts. Make sure{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are set in your{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">.env.local</code>.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
