/**
 * Community API — server-side post creation and reporting.
 * Handles sanitization, spam detection, and rate limiting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, LIMITS } from '@/lib/rate-limiter';
import { sanitizeText, sanitizeName, sanitizeTags, looksLikeSpam, isValidUUID } from '@/lib/sanitize';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://scilkcnqnfusynzviutq.supabase.co';
// Server-side: prefer service role key, fall back to anon key
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

function sbHeaders(extra: Record<string, string> = {}) {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra,
  };
}

// ── POST /api/community — create post ────────────────────────────────────────
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, LIMITS.communityPost);

  if (!rl.success) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Too many posts. Try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  // Sanitize inputs
  const content = sanitizeText(String(body.content ?? ''));
  const title = typeof body.title === 'string' ? sanitizeText(body.title).slice(0, 200) || null : null;
  const user_name = sanitizeName(String(body.user_name ?? 'Anonymous')) || 'Anonymous';
  const tags = sanitizeTags(body.tags);
  const user_id = typeof body.user_id === 'string' ? body.user_id.slice(0, 128) : null;
  const user_avatar = typeof body.user_avatar === 'string' ? body.user_avatar.slice(0, 512) : null;
  const sub_slug = typeof body.sub_slug === 'string' ? body.sub_slug.replace(/[^a-z0-9-]/g, '').slice(0, 64) || null : null;

  // Validate
  if (content.length < 10) {
    return NextResponse.json({ error: 'TOO_SHORT', message: 'Post must be at least 10 characters.' }, { status: 400 });
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: 'TOO_LONG', message: 'Post must be under 1000 characters.' }, { status: 400 });
  }
  if (looksLikeSpam(content)) {
    return NextResponse.json({ error: 'SPAM_DETECTED', message: 'Post looks like spam.' }, { status: 400 });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/community_posts`, {
      method: 'POST',
      headers: sbHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify({ title, content, user_name, tags, sub_slug, user_id, user_avatar, likes: 0, dislikes: 0, comment_count: 0, is_pinned: false }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[community POST] Supabase error:', err);
      return NextResponse.json({ error: 'DB_ERROR', message: 'Could not save post.' }, { status: 502 });
    }

    const rows = await res.json();
    return NextResponse.json({ success: true, post: rows[0] }, { status: 201 });
  } catch (e) {
    console.error('[community POST]', e);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}

// ── DELETE /api/community?id=<uuid> — delete own post ────────────────────────
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? '';
  const userId = request.nextUrl.searchParams.get('user_id') ?? '';

  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 });
  }

  try {
    // Only delete if user_id matches (or user_id is null — anonymous posts)
    const filter = userId
      ? `id=eq.${id}&user_id=eq.${encodeURIComponent(userId)}`
      : `id=eq.${id}&user_id=is.null`;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/community_posts?${filter}`, {
      method: 'DELETE',
      headers: sbHeaders(),
    });

    return NextResponse.json({ success: res.ok }, { status: res.ok ? 200 : 403 });
  } catch (e) {
    console.error('[community DELETE]', e);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
