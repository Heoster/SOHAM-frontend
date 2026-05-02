'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Send, Loader2, Flag, X, MessageSquare,
  ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  fetchPost, fetchComments, addComment, reportPost,
  type CommunityPost, type PostComment,
} from '@/lib/supabase-client';
import { PostCard, getInitials, getAvatarColor, timeAgo } from '@/components/community/post-card';
import { cn } from '@/lib/utils';

// ── Report reasons ────────────────────────────────────────────────────────────

const REPORT_REASONS = [
  { value: 'spam',           label: 'Spam or advertising' },
  { value: 'harassment',     label: 'Harassment or bullying' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'inappropriate',  label: 'Inappropriate content' },
  { value: 'other',          label: 'Other' },
];

// ── Report modal ──────────────────────────────────────────────────────────────

function ReportModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
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
          <h3 className="font-semibold flex items-center gap-2">
            <Flag className="h-4 w-4 text-destructive" /> Report Post
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-muted-foreground">Why are you reporting this post?</p>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <label
                key={r.value}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all',
                  reason === r.value ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
                )}
              >
                <input
                  type="radio" name="reason" value={r.value}
                  checked={reason === r.value} onChange={() => setReason(r.value)}
                  className="accent-primary"
                />
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

// ── Single comment ────────────────────────────────────────────────────────────

function CommentItem({
  comment, depth = 0, currentUser, postId, onReply,
}: {
  comment: PostComment;
  depth?: number;
  currentUser: { uid?: string; displayName?: string | null } | null;
  postId: string;
  onReply: (comment: PostComment) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={cn('relative', depth > 0 && 'ml-4 pl-3 border-l border-border/50')}>
      <div className="flex gap-2 py-2">
        {/* Avatar */}
        <div className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold',
          getAvatarColor(comment.user_name)
        )}>
          {getInitials(comment.user_name)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold">{comment.user_name}</span>
            <span className="text-[10px] text-muted-foreground">{timeAgo(comment.created_at)}</span>
            {comment.likes > 0 && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                {comment.likes} pts
              </Badge>
            )}
          </div>

          {/* Body */}
          {!collapsed && (
            <p className="text-sm text-foreground/80 leading-relaxed mt-0.5 break-words">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-1">
            {hasReplies && (
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                {collapsed ? `Show ${comment.replies!.length} replies` : 'Collapse'}
              </button>
            )}
            <button
              onClick={() => onReply(comment)}
              className="text-[10px] text-muted-foreground hover:text-primary transition-colors px-1.5 py-0.5 rounded"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {!collapsed && hasReplies && (
        <div>
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              currentUser={currentUser}
              postId={postId}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Comment thread ────────────────────────────────────────────────────────────

function CommentThread({
  postId, currentUser,
}: {
  postId: string;
  currentUser: { uid?: string; displayName?: string | null } | null;
}) {
  const { toast } = useToast();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<PostComment | null>(null);

  useEffect(() => {
    fetchComments(postId).then((flat) => {
      // Build tree
      const map = new Map<string, PostComment>();
      const roots: PostComment[] = [];
      flat.forEach((c) => map.set(c.id, { ...c, replies: [] }));
      map.forEach((c) => {
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id)!.replies!.push(c);
        } else {
          roots.push(c);
        }
      });
      setComments(roots);
      setLoading(false);
    });
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    const result = await addComment({
      post_id: postId,
      parent_id: replyTo?.id ?? null,
      user_name: currentUser?.displayName || 'Anonymous',
      user_id: currentUser?.uid || null,
      content: text.trim().slice(0, 500),
    });
    if (result) {
      const newComment = { ...result, replies: [] };
      if (replyTo) {
        setComments((prev) => {
          const addReply = (list: PostComment[]): PostComment[] =>
            list.map((c) =>
              c.id === replyTo.id
                ? { ...c, replies: [...(c.replies ?? []), newComment] }
                : { ...c, replies: addReply(c.replies ?? []) }
            );
          return addReply(prev);
        });
      } else {
        setComments((prev) => [...prev, newComment]);
      }
      setText('');
      setReplyTo(null);
    } else {
      toast({ title: 'Could not post comment', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-base font-bold">
          {loading ? 'Comments' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
        </h2>
      </div>

      {/* Comment input */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        {replyTo && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
            <span className="text-muted-foreground">Replying to</span>
            <span className="font-semibold">{replyTo.user_name}</span>
            <button onClick={() => setReplyTo(null)} className="ml-auto text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder={replyTo ? `Reply to ${replyTo.user_name}…` : 'Add a comment…'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            className="flex-1"
          />
          <Button type="submit" disabled={submitting || !text.trim()} className="gap-2 shrink-0">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Post</span>
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground">{text.length}/500</p>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-7 w-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border bg-card py-10 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card divide-y divide-border/50 px-4">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUser={currentUser}
              postId={postId}
              onReply={setReplyTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Post view ─────────────────────────────────────────────────────────────────

export function PostView({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    fetchPost(postId).then((data) => {
      setPost(data);
      setLoading(false);
    });
  }, [postId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-0 rounded-xl border bg-card overflow-hidden">
          <div className="w-12 bg-muted/30 shrink-0" />
          <div className="flex-1 p-4 space-y-3">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-16 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-semibold">Post not found</p>
        <p className="text-sm text-muted-foreground">This post may have been deleted.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/community">Back to Community</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showReport && <ReportModal postId={post.id} onClose={() => setShowReport(false)} />}

      {/* Back link */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
          <Link href={post.sub_slug ? `/community/c/${post.sub_slug}` : '/community'}>
            <ArrowLeft className="h-4 w-4" />
            {post.sub_slug ? `c/${post.sub_slug}` : 'Community'}
          </Link>
        </Button>
      </div>

      {/* Post card (non-linkable, full content) */}
      <PostCard
        post={post}
        currentUserId={user?.uid ?? null}
        compact={false}
        linkable={false}
      />

      {/* Comments */}
      <CommentThread postId={post.id} currentUser={user} />
    </div>
  );
}
