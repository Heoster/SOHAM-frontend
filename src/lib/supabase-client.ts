/**
 * Lightweight Supabase REST client for the UI (no SDK dependency).
 * Uses the public anon key — safe for browser use with RLS enabled.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://scilkcnqnfusynzviutq.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CommunitySub {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  banner: string | null;
  member_count: number;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  title: string | null;
  sub_slug: string | null;
  likes: number;
  dislikes: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: string;
  tags: string[];
  user_id: string | null;
}

export interface PostComment {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_name: string;
  user_id: string | null;
  content: string;
  likes: number;
  created_at: string;
  replies?: PostComment[];
}

export interface PostReport {
  id: string;
  post_id: string;
  reason: string;
  reporter_fingerprint: string;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra,
  };
}

async function sbFetch(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...init, cache: 'no-store' });
}

// ── Sub-communities ───────────────────────────────────────────────────────────

/** Fetch all sub-communities */
export async function fetchSubs(): Promise<CommunitySub[]> {
  // If anon key is not configured, return empty (caller uses placeholder)
  if (!SUPABASE_ANON_KEY) return [];
  try {
    const res = await sbFetch(
      `${SUPABASE_URL}/rest/v1/community_subs?select=*&order=member_count.desc`,
      { headers: headers() }
    );
    // 401 = key not configured or RLS blocking — return empty silently
    if (!res.ok) return [];
    return (await res.json()) as CommunitySub[];
  } catch {
    return [];
  }
}

/** Fetch a single sub-community by slug */
export async function fetchSub(slug: string): Promise<CommunitySub | null> {
  try {
    const res = await sbFetch(
      `${SUPABASE_URL}/rest/v1/community_subs?slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as CommunitySub[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// ── Posts ─────────────────────────────────────────────────────────────────────

/** Fetch posts — newest first, pinned posts always at top */
export async function fetchPosts(limit = 50): Promise<CommunityPost[]> {
  try {
    const res = await sbFetch(
      `${SUPABASE_URL}/rest/v1/community_posts?select=*&order=is_pinned.desc,created_at.desc&limit=${limit}`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    return (await res.json()) as CommunityPost[];
  } catch {
    return [];
  }
}

/** Fetch posts for a specific sub-community */
export async function fetchPostsBySub(slug: string, sort: 'newest' | 'top' | 'trending' = 'newest', limit = 50): Promise<CommunityPost[]> {
  try {
    let order = 'is_pinned.desc,created_at.desc';
    let extra = '';
    if (sort === 'top') order = 'is_pinned.desc,likes.desc';
    if (sort === 'trending') {
      const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
      extra = `&created_at=gte.${since}`;
      order = 'likes.desc';
    }
    const res = await sbFetch(
      `${SUPABASE_URL}/rest/v1/community_posts?select=*&sub_slug=eq.${encodeURIComponent(slug)}${extra}&order=${order}&limit=${limit}`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    return (await res.json()) as CommunityPost[];
  } catch {
    return [];
  }
}

/** Fetch a single post by id */
export async function fetchPost(id: string): Promise<CommunityPost | null> {
  try {
    const res = await sbFetch(
      `${SUPABASE_URL}/rest/v1/community_posts?id=eq.${id}&limit=1`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as CommunityPost[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** Fetch posts by a specific user */
export async function fetchPostsByUser(userId: string, limit = 50): Promise<CommunityPost[]> {
  try {
    const res = await sbFetch(
      `${SUPABASE_URL}/rest/v1/community_posts?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=${limit}`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    return (await res.json()) as CommunityPost[];
  } catch {
    return [];
  }
}

/** Fetch top posts by likes */
export async function fetchTopPosts(limit = 50): Promise<CommunityPost[]> {
  try {
    const res = await sbFetch(
      `${SUPABASE_URL}/rest/v1/community_posts?select=*&order=is_pinned.desc,likes.desc&limit=${limit}`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    return (await res.json()) as CommunityPost[];
  } catch {
    return [];
  }
}

/** Fetch trending posts (most liked in last 48 hours) */
export async function fetchTrendingPosts(limit = 50): Promise<CommunityPost[]> {
  try {
    const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const res = await sbFetch(
      `${SUPABASE_URL}/rest/v1/community_posts?select=*&created_at=gte.${since}&order=likes.desc&limit=${limit}`,
      { headers: headers() }
    );
    if (!res.ok) return fetchTopPosts(limit); // fallback
    const rows = (await res.json()) as CommunityPost[];
    return rows.length > 0 ? rows : fetchTopPosts(limit);
  } catch {
    return [];
  }
}

/** Fetch posts filtered by tag */
export async function fetchPostsByTag(tag: string, limit = 50): Promise<CommunityPost[]> {
  try {
    const res = await sbFetch(
      `${SUPABASE_URL}/rest/v1/community_posts?select=*&tags=cs.{${encodeURIComponent(tag)}}&order=created_at.desc&limit=${limit}`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    return (await res.json()) as CommunityPost[];
  } catch {
    return [];
  }
}

/** Create a new community post */
export async function createPost(
  post: Omit<CommunityPost, 'id' | 'likes' | 'dislikes' | 'comment_count' | 'is_pinned' | 'created_at'>
): Promise<CommunityPost | null> {
  try {
    const res = await sbFetch(`${SUPABASE_URL}/rest/v1/community_posts`, {
      method: 'POST',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify({ ...post, likes: 0, dislikes: 0, comment_count: 0, is_pinned: false }),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as CommunityPost[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** Atomically increment likes */
export async function likePost(postId: string): Promise<boolean> {
  try {
    const res = await sbFetch(`${SUPABASE_URL}/rest/v1/rpc/increment_post_likes`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ post_id: postId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Atomically decrement likes (undo upvote) */
export async function unlikePost(postId: string): Promise<boolean> {
  try {
    const res = await sbFetch(`${SUPABASE_URL}/rest/v1/rpc/decrement_post_likes`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ post_id: postId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Atomically increment dislikes */
export async function dislikePost(postId: string): Promise<boolean> {
  try {
    const res = await sbFetch(`${SUPABASE_URL}/rest/v1/rpc/increment_post_dislikes`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ post_id: postId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Delete own post */
export async function deletePost(postId: string): Promise<boolean> {
  try {
    const res = await sbFetch(
      `${SUPABASE_URL}/rest/v1/community_posts?id=eq.${postId}`,
      { method: 'DELETE', headers: headers() }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ── Comments ──────────────────────────────────────────────────────────────────

/** Fetch comments for a post */
export async function fetchComments(postId: string): Promise<PostComment[]> {
  try {
    const res = await sbFetch(
      `${SUPABASE_URL}/rest/v1/community_comments?post_id=eq.${postId}&order=created_at.asc&limit=50`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    return (await res.json()) as PostComment[];
  } catch {
    return [];
  }
}

/** Add a comment to a post */
export async function addComment(
  comment: Omit<PostComment, 'id' | 'created_at' | 'likes' | 'replies'>
): Promise<PostComment | null> {
  try {
    const res = await sbFetch(`${SUPABASE_URL}/rest/v1/community_comments`, {
      method: 'POST',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify(comment),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as PostComment[];
    // Increment comment count on the post
    await sbFetch(`${SUPABASE_URL}/rest/v1/rpc/increment_comment_count`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ post_id: comment.post_id }),
    });
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// ── Reports ───────────────────────────────────────────────────────────────────

/** Report a post for moderation */
export async function reportPost(
  postId: string,
  reason: string,
  fingerprint: string
): Promise<boolean> {
  try {
    const res = await sbFetch(`${SUPABASE_URL}/rest/v1/community_reports`, {
      method: 'POST',
      headers: headers({ Prefer: 'return=minimal' }),
      body: JSON.stringify({
        post_id: postId,
        reason,
        reporter_fingerprint: fingerprint,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
