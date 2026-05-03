'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronUp, ChevronDown, MessageSquare, Share2, Trash2, Flag,
  Pin, Clock, Tag, MoreHorizontal, ExternalLink, Bookmark,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { likePost, unlikePost, dislikePost, deletePost, type CommunityPost } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ── Helpers ───────────────────────────────────────────────────────────────────

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-rose-500', 'bg-indigo-500',
    'bg-amber-500', 'bg-cyan-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function formatScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Vote column ───────────────────────────────────────────────────────────────

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
      if (v === null) delete stored[id]; else stored[id] = v;
      localStorage.setItem('soham_votes', JSON.stringify(stored));
    } catch {}
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemo) { toast({ title: 'Example post', description: 'Voting disabled on demo posts.' }); return; }
    if (vote === 'up') {
      setVote(null); setLikes(l => l - 1); saveVote(postId, null); await unlikePost(postId);
    } else {
      if (vote === 'down') setDislikes(d => d - 1);
      setVote('up'); setLikes(l => l + 1); saveVote(postId, 'up'); await likePost(postId);
    }
  };

  const handleDownvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemo) { toast({ title: 'Example post', description: 'Voting disabled on demo posts.' }); return; }
    if (vote === 'down') {
      setVote(null); setDislikes(d => d - 1); saveVote(postId, null);
    } else {
      if (vote === 'up') setLikes(l => l - 1);
      setVote('down'); setDislikes(d => d + 1); saveVote(postId, 'down'); await dislikePost(postId);
    }
  };

  const score = likes - dislikes;

  return (
    <div className={cn('flex items-center', vertical ? 'flex-col gap-0.5' : 'flex-row gap-1')}>
      <button
        onClick={handleUpvote}
        className={cn(
          'rounded-md p-1 transition-all hover:scale-110',
          vote === 'up'
            ? 'text-orange-500 bg-orange-500/10'
            : 'text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10'
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="h-5 w-5" strokeWidth={vote === 'up' ? 2.5 : 2} />
      </button>
      <span className={cn(
        'text-xs font-bold min-w-[1.75rem] text-center tabular-nums',
        vote === 'up' ? 'text-orange-500' : vote === 'down' ? 'text-blue-500' : 'text-foreground/80'
      )}>
        {formatScore(score)}
      </span>
      <button
        onClick={handleDownvote}
        className={cn(
          'rounded-md p-1 transition-all hover:scale-110',
          vote === 'down'
            ? 'text-blue-500 bg-blue-500/10'
            : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10'
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="h-5 w-5" strokeWidth={vote === 'down' ? 2.5 : 2} />
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

  return (
    <article
      id={`post-${post.id}`}
      onClick={() => linkable && router.push(`/community/post/${post.id}`)}
      className={cn(
        'group flex rounded-xl border border-border/60 bg-card overflow-hidden scroll-mt-20 transition-all duration-150',
        linkable && 'cursor-pointer hover:border-primary/40 hover:shadow-sm hover:bg-card/80',
        post.is_pinned && 'border-primary/40 bg-primary/[0.015]'
      )}
    >
      {/* ── Vote column ── */}
      <div className="flex flex-col items-center justify-start gap-0 bg-muted/20 px-2 py-3 w-11 shrink-0 border-r border-border/40">
        <VoteButtons
          postId={post.id}
          initialLikes={post.likes}
          initialDislikes={post.dislikes ?? 0}
          isDemo={isDemo}
          vertical
        />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0 px-3 py-3 space-y-2">

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          {post.is_pinned && (
            <span className="flex items-center gap-1 text-primary font-semibold uppercase tracking-wider text-[10px]">
              <Pin className="h-2.5 w-2.5" /> Pinned
            </span>
          )}
          {post.sub_slug && (
            <>
              <Link
                href={`/community/c/${post.sub_slug}`}
                onClick={e => e.stopPropagation()}
                className="font-bold text-foreground/90 hover:text-primary transition-colors"
              >
                c/{post.sub_slug}
              </Link>
              <span className="text-border">·</span>
            </>
          )}
          <span>Posted by</span>
          <Link
            href={`/community/u/${encodeURIComponent(post.user_name)}`}
            onClick={e => e.stopPropagation()}
            className="hover:text-foreground hover:underline transition-colors"
          >
            u/{post.user_name}
          </Link>
          <span className="text-border">·</span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo(post.created_at)}
          </span>
          {isDemo && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">Example</Badge>
          )}
        </div>

        {/* Title */}
        {post.title && (
          <h2 className={cn(
            'font-semibold leading-snug text-foreground',
            compact ? 'text-sm' : 'text-base'
          )}>
            {post.title}
          </h2>
        )}

        {/* Body */}
        <p className={cn(
          'text-sm leading-relaxed text-foreground/75 whitespace-pre-wrap break-words',
          compact && !post.title && 'line-clamp-3',
          compact && post.title && 'line-clamp-2'
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
                onClick={e => e.stopPropagation()}
              >
                <Badge
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5 gap-1 h-5 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer rounded-full"
                >
                  <Tag className="h-2.5 w-2.5" />{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-0.5 pt-1 border-t border-border/30">
          <Link
            href={`/community/post/${post.id}`}
            onClick={e => e.stopPropagation()}
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
                  onClick={e => e.stopPropagation()}
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
                  <Link href={`/community/post/${post.id}`} onClick={e => e.stopPropagation()}>
                    <ExternalLink className="h-3.5 w-3.5 mr-2" /> Open post
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isOwner ? (
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete post
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href={`/community/post/${post.id}?report=1`} onClick={e => e.stopPropagation()} className="text-orange-500 focus:text-orange-500">
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
