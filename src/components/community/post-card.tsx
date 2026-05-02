'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronUp, ChevronDown, MessageSquare, Share2, Trash2, Flag,
  Pin, Clock, Tag, Bookmark, MoreHorizontal, ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { likePost, unlikePost, dislikePost, deletePost, type CommunityPost } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ── Helpers ───────────────────────────────────────────────────────────────────

export function timeAgo(dateStr: string): string {
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

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
    'bg-yellow-500', 'bg-cyan-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function formatScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Vote buttons ──────────────────────────────────────────────────────────────

type VoteState = 'up' | 'down' | null;

interface VoteButtonsProps {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
  isDemo?: boolean;
  vertical?: boolean;
}

export function VoteButtons({ postId, initialLikes, initialDislikes, isDemo, vertical = true }: VoteButtonsProps) {
  const { toast } = useToast();
  const [vote, setVote] = useState<VoteState>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = JSON.parse(localStorage.getItem('soham_votes') || '{}');
      return (stored[postId] as VoteState) ?? null;
    } catch { return null; }
  });
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);

  const saveVote = (id: string, v: VoteState) => {
    try {
      const stored = JSON.parse(localStorage.getItem('soham_votes') || '{}');
      if (v === null) delete stored[id];
      else stored[id] = v;
      localStorage.setItem('soham_votes', JSON.stringify(stored));
    } catch {}
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemo) { toast({ title: 'Demo post', description: 'Voting is disabled on example posts.' }); return; }
    if (vote === 'up') {
      // undo upvote
      setVote(null);
      setLikes((l) => l - 1);
      saveVote(postId, null);
      await unlikePost(postId);
    } else {
      if (vote === 'down') { setDislikes((d) => d - 1); }
      setVote('up');
      setLikes((l) => l + 1);
      saveVote(postId, 'up');
      await likePost(postId);
    }
  };

  const handleDownvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemo) { toast({ title: 'Demo post', description: 'Voting is disabled on example posts.' }); return; }
    if (vote === 'down') {
      setVote(null);
      setDislikes((d) => d - 1);
      saveVote(postId, null);
    } else {
      if (vote === 'up') { setLikes((l) => l - 1); }
      setVote('down');
      setDislikes((d) => d + 1);
      saveVote(postId, 'down');
      await dislikePost(postId);
    }
  };

  const score = likes - dislikes;

  return (
    <div className={cn('flex items-center gap-1', vertical ? 'flex-col' : 'flex-row')}>
      <button
        onClick={handleUpvote}
        className={cn(
          'rounded-md p-1.5 transition-colors',
          vote === 'up'
            ? 'text-orange-500 bg-orange-500/10'
            : 'text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10'
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <span className={cn(
        'text-xs font-bold min-w-[1.5rem] text-center',
        vote === 'up' ? 'text-orange-500' : vote === 'down' ? 'text-blue-500' : 'text-foreground'
      )}>
        {formatScore(score)}
      </span>
      <button
        onClick={handleDownvote}
        className={cn(
          'rounded-md p-1.5 transition-colors',
          vote === 'down'
            ? 'text-blue-500 bg-blue-500/10'
            : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10'
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: CommunityPost;
  onDelete?: (id: string) => void;
  currentUserId?: string | null;
  compact?: boolean;
  /** If true, clicking the card navigates to the post page */
  linkable?: boolean;
}

export function PostCard({ post, onDelete, currentUserId, compact = false, linkable = true }: PostCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isDemo = post.id.startsWith('demo-');
  const isOwner = !!currentUserId && currentUserId === post.user_id;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/community/post/${post.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    toast({ title: 'Link copied!' });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this post? This cannot be undone.')) return;
    if (isDemo) { toast({ title: 'Demo mode', description: 'Cannot delete example posts.' }); return; }
    const ok = await deletePost(post.id);
    if (ok) { onDelete?.(post.id); toast({ title: 'Post deleted.' }); }
    else toast({ title: 'Could not delete post', variant: 'destructive' });
  };

  const handleCardClick = () => {
    if (linkable) router.push(`/community/post/${post.id}`);
  };

  return (
    <article
      id={`post-${post.id}`}
      onClick={handleCardClick}
      className={cn(
        'group flex gap-0 rounded-xl border bg-card transition-all scroll-mt-20',
        linkable && 'cursor-pointer hover:border-primary/40 hover:shadow-sm',
        post.is_pinned && 'border-primary/30 bg-primary/[0.02]'
      )}
    >
      {/* Vote column */}
      <div className="flex flex-col items-center gap-0 rounded-l-xl bg-muted/30 px-2 py-3 w-12 shrink-0">
        <VoteButtons
          postId={post.id}
          initialLikes={post.likes}
          initialDislikes={post.dislikes ?? 0}
          isDemo={isDemo}
          vertical
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-3 space-y-2">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          {post.is_pinned && (
            <span className="flex items-center gap-1 text-primary font-semibold uppercase tracking-wider">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}
          {post.sub_slug && (
            <Link
              href={`/community/c/${post.sub_slug}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              c/{post.sub_slug}
            </Link>
          )}
          {post.sub_slug && <span>·</span>}
          <span>Posted by</span>
          <Link
            href={`/community/u/${encodeURIComponent(post.user_name)}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-foreground transition-colors"
          >
            u/{post.user_name}
          </Link>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {timeAgo(post.created_at)}
          </span>
          {isDemo && <Badge variant="outline" className="text-[9px] px-1.5 py-0">Example</Badge>}
        </div>

        {/* Title */}
        {post.title && (
          <h2 className={cn('font-semibold leading-snug text-foreground', compact ? 'text-sm' : 'text-base')}>
            {post.title}
          </h2>
        )}

        {/* Body */}
        <p className={cn(
          'text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words',
          compact && 'line-clamp-3'
        )}>
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/community/search?tag=${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 gap-1 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                  <Tag className="h-2.5 w-2.5" />{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 pt-1 border-t border-border/40">
          <Link
            href={`/community/post/${post.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {post.comment_count > 0 ? `${post.comment_count} Comments` : 'Comment'}
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-3.5 w-3.5 mr-2" /> Copy link
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/community/post/${post.id}`} onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="h-3.5 w-3.5 mr-2" /> Open post
                  </Link>
                </DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                )}
                {!isOwner && (
                  <DropdownMenuItem asChild>
                    <Link href={`/community/post/${post.id}?report=1`} onClick={(e) => e.stopPropagation()} className="text-orange-500 focus:text-orange-500">
                      <Flag className="h-3.5 w-3.5 mr-2" /> Report
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </article>
  );
}
