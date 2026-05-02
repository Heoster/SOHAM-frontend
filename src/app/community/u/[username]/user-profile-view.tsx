'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Star, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { fetchPosts, type CommunityPost } from '@/lib/supabase-client';
import { PostCard, getInitials, getAvatarColor } from '@/components/community/post-card';
import { cn } from '@/lib/utils';

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function UserProfileView({ username }: { username: string }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    // Fetch all posts and filter by username (client-side since we don't have user_id here)
    fetchPosts(100).then((all) => {
      const userPosts = all.filter(
        (p) => p.user_name.toLowerCase() === username.toLowerCase()
      );
      setPosts(userPosts);
      setLoading(false);
    });
  }, [username]);

  const handleDelete = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Compute karma (sum of likes)
  const karma = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comment_count, 0);
  const isOwnProfile = user?.displayName?.toLowerCase() === username.toLowerCase();

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
        <Link href="/community">
          <ArrowLeft className="h-4 w-4" /> Community
        </Link>
      </Button>

      {/* Profile card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
        <div className="px-5 pb-5 -mt-8">
          <div className="flex items-end justify-between gap-3">
            <div className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full border-4 border-background text-white text-xl font-bold shadow-sm',
              getAvatarColor(username)
            )}>
              {getInitials(username)}
            </div>
            {isOwnProfile && (
              <Badge variant="outline" className="mb-1">Your profile</Badge>
            )}
          </div>

          <div className="mt-3 space-y-1">
            <h1 className="text-xl font-bold">u/{username}</h1>
            <p className="text-sm text-muted-foreground">SOHAM Community Member</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Star className="h-4 w-4 text-orange-500" />
                <p className="text-lg font-bold text-orange-500">{formatCount(karma)}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Karma</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{posts.length}</p>
              <p className="text-[10px] text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{totalComments}</p>
              <p className="text-[10px] text-muted-foreground">Comments</p>
            </div>
          </div>

          {/* Karma badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {karma >= 100 && (
              <Badge className="gap-1 bg-orange-500/10 text-orange-500 border-orange-500/30">
                <Star className="h-3 w-3" /> Power User
              </Badge>
            )}
            {karma >= 50 && (
              <Badge className="gap-1 bg-purple-500/10 text-purple-500 border-purple-500/30">
                <TrendingUp className="h-3 w-3" /> Contributor
              </Badge>
            )}
            {posts.length >= 5 && (
              <Badge className="gap-1 bg-blue-500/10 text-blue-500 border-blue-500/30">
                <MessageSquare className="h-3 w-3" /> Active Poster
              </Badge>
            )}
            {posts.length === 0 && (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" /> New Member
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Posts section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Posts by u/{username}
          {!loading && <Badge variant="secondary" className="text-xs">{posts.length}</Badge>}
        </h2>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-0 rounded-xl border bg-card overflow-hidden">
              <div className="w-12 bg-muted/30 shrink-0" />
              <div className="flex-1 p-3 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-12 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
            <p className="font-semibold">No posts yet</p>
            <p className="text-sm text-muted-foreground">
              {isOwnProfile ? "You haven't posted anything yet." : `${username} hasn't posted yet.`}
            </p>
            {isOwnProfile && (
              <Button asChild size="sm">
                <Link href="/community/create">Create your first post</Link>
              </Button>
            )}
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
                <Button variant="outline" onClick={() => setVisibleCount((c) => c + 10)} className="gap-2">
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
