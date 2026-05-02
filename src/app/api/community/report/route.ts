/**
 * POST /api/community/report — report a post for moderation
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, LIMITS } from '@/lib/rate-limiter';
import { isValidUUID } from '@/lib/sanitize';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://scilkcnqnfusynzviutq.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const VALID_REASONS = ['spam', 'harassment', 'misinformation', 'inappropriate', 'other'] as const;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, LIMITS.communityReport);

  if (!rl.success) {
    return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const post_id = String(body.post_id ?? '');
  const reason = String(body.reason ?? '');
  const fingerprint = ip; // use IP as fingerprint for dedup

  if (!isValidUUID(post_id)) {
    return NextResponse.json({ error: 'INVALID_POST_ID' }, { status: 400 });
  }
  if (!VALID_REASONS.includes(reason as any)) {
    return NextResponse.json({ error: 'INVALID_REASON' }, { status: 400 });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/community_reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ post_id, reason, reporter_fingerprint: fingerprint }),
    });

    // 409 = duplicate (already reported) — treat as success
    if (res.ok || res.status === 409) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 502 });
  } catch (e) {
    console.error('[community/report]', e);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
