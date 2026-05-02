'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  fetchPosts, fetchTopPosts, fetchTrendingPosts, fetchPostsByTag,
  createPost, likePost, deletePost, fetchComments, addComment, reportPost,
  type CommunityPost, type PostComment,
} from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Heart, Send, RefreshCw, MessageSquare, Clock, Tag, User, Loader2,
  AlertCircle, Sparkles, TrendingUp, ChevronDown, Search, Pin,
  Trash2, Flag, Share2, MessageCircle, X, ChevronUp, Filter,
  ThumbsUp, Flame, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Constants ─────────────────────────────────────────────────────────────────

const SUGGESTED_TAGS = [
  'tip', 'question', 'showcase', 'bug', 'feature-request',
  'prompt', 'coding', 'math', 'voice', 'pdf', 'image-gen', 'announcement',
];

const REPORT_REASONS = [
  { value: 'spam',           label: 'Spam or advertising' },
  { value: 'harassment',     label: 'Harassment or bullying' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'inappropriate',  label: 'Inappropriate content' },
  { value: 'other',          label: 'Other' },
];

const PLACEHOLDER_POSTS: CommunityPost[] = [
  {
    id: 'demo-1', user_name: 'Vidhan', user_avatar: null, user_id: null,
    title: null, sub_slug: null, dislikes: 0,
    content: 'Pro tip: Use /solve for math problems — it gives step-by-step solutions with the best model automatically selected. Way better than just asking normally!',
    likes: 24, comment_count: 3, is_pinned: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), tags: ['tip', 'math'],
  },
  {
    id: 'demo-2', user_name: 'Avineet', user_avatar: null, user_id: null,
    title: null, sub_slug: null, dislikes: 0,
    content: 'Just tried the PDF analyzer on a 40-page research paper and it answered every question perfectly. The Gemini model is incredible for long documents.',
    likes: 18, comment_count: 5, is_pinned: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(), tags: ['showcase', 'pdf'],
  },
  {
    id: 'demo-3', user_name: 'Vansh', user_avatar: null, user_id: null,
    title: null, sub_slug: null, dislikes: 0,
    content: 'Question: Which model is best for generating creative writing? I tried a few but Auto mode keeps picking Llama 3.3 — is that the right choice?',
    likes: 7, comment_count: 2, is_pinned: false,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(), tags: ['question'],
  },
  {
    id: 'demo-4', user_name: 'Aayush', user_avatar: null, user_id: null,
    title: null, sub_slug: null, dislikes: 0,
    content: 'Tried the image generation with a detailed prompt: "a futuristic city at sunset with flying cars and neon lights". The result was stunning! FLUX.1 is really good.',
    likes: 31, comment_count: 8, is_pinned: false,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(), tags: ['showcase', 'image-gen'],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
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

function copyToClipboard(text: string) {
  if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
}

// ── Comment thread ────────────────────────────────────────────────────────────

function CommentThread({
  postId, currentUser, isDemo,
}: { postId: string; currentUser: { uid?: string; displayName?: string | null } | null; isDemo: boolean }) {
  const { toast } = useToast();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isDemo) { setLoading(false); return; }
    fetchComments(postId).then((c) => { setComments(c); setLoading(false); });
  }, [postId, isDemo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.trim().length < 1) return;
    if (isDemo) {
      toast({ title: 'Demo mode', description: 'Comments are disabled on example posts.' });
      return;
    }
    setSubmitting(true);
    const result = await addComment({
      post_id: postId,
      parent_id: null,
      user_name: currentUser?.displayName || 'Anonymous',
      user_id: currentUser?.uid || null,
      content: text.trim().slice(0, 500),
    });
    if (result) {
      setComments((prev) => [...prev, result]);
      setText('');
    } else {
      toast({ title: 'Could not post comment', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-[9px] font-bold', getAvatarColor(c.user_name))}>
                {getInitials(c.user_name)}
              </div>
              <div className="flex-1 rounded-xl bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold">{c.user_name}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Write a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          className="h-8 text-xs"
        />
        <Button type="submit" size="sm" disabled={submitting || !text.trim()} className="h-8 px-3 shrink-0">
          {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
        </Button>
      </form>
    </div>
  );
}

// ── Report modal ──────────────────────────────────────────────────────────────

function ReportModal({
  postId, onClose, isDemo,
}: { postId: string; onClose: () => void; isDemo: boolean }) {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    if (isDemo) {
      toast({ title: 'Demo mode', description: 'Reporting is disabled on example posts.' });
      onClose();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/community/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, reason }),
      });
      if (res.ok || res.status === 409) {
        toast({ title: 'Report submitted', description: 'Thank you. We will review this post.' });
      } else {
        toast({ title: 'Could not submit report', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    }
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Flag className="h-4 w-4 text-destructive" /> Report Post</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-muted-foreground">Why are you reporting this post?</p>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <label key={r.value} className={cn('flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all', reason === r.value ? 'border-primary bg-primary/5' : 'hover:border-primary/40')}>
                <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="accent-primary" />
                <span className="text-sm">{r.label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" size="sm" disabled={!reason || submitting} className="flex-1 gap-2">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flag className="h-3.5 w-3.5" />}
              Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({
  post, onLike, onDelete, likedIds, currentUserId,
}: {
  post: CommunityPost;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  likedIds: Set<string>;
  currentUserId: string | null;
}) {
  const { toast } = useToast();
  const liked = likedIds.has(post.id);
  const isOwner = !!currentUserId && currentUserId === post.user_id;
  const isDemo = post.id.startsWith('demo-');
  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/community#post-${post.id}`;
    copyToClipboard(url);
    toast({ title: 'Link copied!', description: 'Post link copied to clipboard.' });
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    if (isDemo) { toast({ title: 'Demo mode', description: 'Cannot delete example posts.' }); return; }
    const ok = await deletePost(post.id);
    if (ok) { onDelete(post.id); toast({ title: 'Post deleted.' }); }
    else toast({ title: 'Could not delete post', variant: 'destructive' });
  };

  return (
    <>
      {showReport && <ReportModal postId={post.id} onClose={() => setShowReport(false)} isDemo={isDemo} />}
      <Card id={`post-${post.id}`} className={cn('transition-all duration-200 hover:border-primary/30 hover:shadow-sm scroll-mt-20', post.is_pinned && 'border-primary/40 bg-primary/[0.02]')}>
        <CardContent className="p-5 space-y-3">
          {/* Pinned badge */}
          {post.is_pinned && (
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
              <Pin className="h-3 w-3" /> Pinned
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold', getAvatarColor(post.user_name))}>
                {getInitials(post.user_name)}
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">{post.user_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />{timeAgo(post.created_at)}
                </p>
              </div>
            </div>
            {/* Actions menu */}
            <div className="flex items-center gap-1">
              <button onClick={handleShare} title="Share" className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Share2 className="h-3.5 w-3.5" />
              </button>
              {isOwner && (
                <button onClick={handleDelete} title="Delete" className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              {!isOwner && (
                <button onClick={() => setShowReport(true)} title="Report" className="rounded-lg p-1.5 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-colors">
                  <Flag className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">{post.content}</p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 gap-1">
                  <Tag className="h-2.5 w-2.5" />{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 pt-1 border-t border-border/50">
            <button
              onClick={() => onLike(post.id)}
              disabled={liked}
              className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all', liked ? 'text-red-500 bg-red-500/10 cursor-default' : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10')}
            >
              <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current')} />
              {post.likes}
            </button>
            <button
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {post.comment_count > 0 ? post.comment_count : 'Reply'}
              {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {isDemo ? 'Example post' : 'Community post'}
            </span>
          </div>

          {/* Comments */}
          {showComments && (
            <CommentThread postId={post.id} currentUser={null} isDemo={isDemo} />
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ── New post form ─────────────────────────────────────────────────────────────

function NewPostForm({ onPosted, currentUser }: {
  onPosted: (post: CommunityPost) => void;
  currentUser: { uid?: string; displayName?: string | null; photoURL?: string | null } | null;
}) {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.displayName || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 4));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (trimmed.length < 10) {
      toast({ title: 'Too short', description: 'Write at least 10 characters.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          user_name: authorName.trim() || 'Anonymous',
          user_avatar: currentUser?.photoURL ?? null,
          user_id: currentUser?.uid ?? null,
          tags: selectedTags,
        }),
      });
      const data = await res.json();
      if (res.ok && data.post) {
        onPosted(data.post as CommunityPost);
        setContent('');
        setSelectedTags([]);
        toast({ title: 'Posted! 🎉', description: 'Your post is now live.' });
      } else if (res.status === 429) {
        toast({ title: 'Slow down!', description: 'You can post 5 times per 10 minutes.', variant: 'destructive' });
      } else if (res.status === 400 && data.error === 'SPAM_DETECTED') {
        toast({ title: 'Looks like spam', description: 'Please write a genuine post.', variant: 'destructive' });
      } else {
        throw new Error(data.message || 'Failed');
      }
    } catch {
      toast({ title: 'Could not post', description: 'Check your connection and try again.', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Share with the Community</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" /> Your Name
            </label>
            <Input
              placeholder="Anonymous"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={50}
              className="max-w-xs"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" /> Your Post
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
              <p className="text-xs text-muted-foreground">{content.length}/1000</p>
              {content.length > 900 && <p className="text-xs text-orange-500">Almost at limit</p>}
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
                  key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-all',
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
            <Button type="submit" disabled={submitting || content.trim().length < 10} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Posting…' : 'Post to Community'}
            </Button>
            <p className="text-xs text-muted-foreground">Posts are public and visible to everyone.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Main CommunityBoard export ────────────────────────────────────────────────

type SortMode = 'newest' | 'top' | 'trending';

export function CommunityBoard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [allPosts, setAllPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(10);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Load liked IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('soham_liked_posts');
      if (stored) setLikedIds(new Set(JSON.parse(stored) as string[]));
    } catch {}
  }, []);

  const saveLikedIds = useCallback((ids: Set<string>) => {
    try { localStorage.setItem('soham_liked_posts', JSON.stringify([...ids])); } catch {}
  }, []);

  const loadPosts = useCallback(async (mode: SortMode = sortMode) => {
    setLoading(true);
    setError(null);
    try {
      let data: CommunityPost[];
      if (activeTag) {
        data = await fetchPostsByTag(activeTag);
      } else if (mode === 'top') {
        data = await fetchTopPosts();
      } else if (mode === 'trending') {
        data = await fetchTrendingPosts();
      } else {
        data = await fetchPosts();
      }
      setPosts(data.length > 0 ? data : PLACEHOLDER_POSTS);
      if (data.length === 0) setError('Showing example posts — run the SQL setup to enable live posts.');
    } catch {
      setPosts(PLACEHOLDER_POSTS);
      setError('Could not load live posts — showing example posts.');
    } finally {
      setLoading(false);
    }
  }, [sortMode, activeTag]);

  // Helper to set posts (used inside loadPosts closure)
  const setPosts = (posts: CommunityPost[]) => setAllPosts(posts);

  useEffect(() => { loadPosts(sortMode); }, [sortMode, activeTag]);

  const handleLike = useCallback(async (postId: string) => {
    if (likedIds.has(postId)) return;
    const newIds = new Set(likedIds).add(postId);
    setLikedIds(newIds);
    saveLikedIds(newIds);
    setAllPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    await likePost(postId);
  }, [likedIds, saveLikedIds]);

  const handleDelete = useCallback((postId: string) => {
    setAllPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const handlePosted = useCallback((post: CommunityPost) => {
    setAllPosts((prev) => [post, ...prev]);
    setVisibleCount((c) => c + 1);
  }, []);

  // Filter + search
  const filteredPosts = useMemo(() => {
    let posts = allPosts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) => p.content.toLowerCase().includes(q) || p.user_name.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q))
      );
    }
    return posts;
  }, [allPosts, searchQuery]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allPosts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  }, [allPosts]);

  const SORT_TABS: { mode: SortMode; label: string; icon: React.ElementType }[] = [
    { mode: 'newest', label: 'Newest', icon: Clock },
    { mode: 'top',    label: 'Top',    icon: ThumbsUp },
    { mode: 'trending', label: 'Trending', icon: Flame },
  ];

  return (
    <div className="space-y-8">
      {/* ── New post form ── */}
      <section id="post-form" className="scroll-mt-20">
        <NewPostForm onPosted={handlePosted} currentUser={user} />
      </section>

      {/* ── Feed controls ── */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Community Posts</h2>
            {!loading && (
              <Badge variant="secondary" className="text-xs">{filteredPosts.length} posts</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Sort tabs */}
            <div className="flex rounded-xl border bg-muted/40 p-0.5 gap-0.5">
              {SORT_TABS.map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => { setSortMode(mode); setVisibleCount(10); }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    sortMode === mode ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => loadPosts(sortMode)} disabled={loading} className="gap-1.5 text-xs">
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search posts, users, or tags…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tag filter pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-all', !activeTag ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50')}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-all flex items-center gap-1', activeTag === tag ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50')}
              >
                <Tag className="h-2.5 w-2.5" />{tag}
              </button>
            ))}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-600 dark:text-orange-400">
            <AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-muted" />
                    <div className="space-y-1.5"><div className="h-3 w-24 rounded bg-muted" /><div className="h-2.5 w-16 rounded bg-muted" /></div>
                  </div>
                  <div className="space-y-2"><div className="h-3 w-full rounded bg-muted" /><div className="h-3 w-4/5 rounded bg-muted" /></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Search className="h-10 w-10 text-muted-foreground/40" />
              <p className="font-semibold">{searchQuery ? 'No posts match your search' : 'No posts yet'}</p>
              <p className="text-sm text-muted-foreground">{searchQuery ? 'Try a different search term or clear the filter.' : 'Be the first to share something!'}</p>
              {searchQuery && <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>Clear search</Button>}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  likedIds={likedIds}
                  currentUserId={user?.uid ?? null}
                />
              ))}
            </div>
            {visibleCount < filteredPosts.length && (
              <div className="text-center pt-2">
                <Button variant="outline" onClick={() => setVisibleCount((c) => c + 10)} className="gap-2">
                  <ChevronDown className="h-4 w-4" />
                  Load more ({filteredPosts.length - visibleCount} remaining)
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
            <strong className="text-foreground">Developer note:</strong> Run{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">ui/src/lib/community-posts.sql</code>{' '}
            in your Supabase dashboard to enable live posts. Set{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">.env.local</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
