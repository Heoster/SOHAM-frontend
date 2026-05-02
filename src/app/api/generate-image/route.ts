/**
 * Image Generation API — proxies to backend /api/image/generate
 *
 * Accepts:
 *   POST { prompt, userId, style? }
 *
 * The backend returns:
 *   { success, url, enhancedPrompt, provider, model, generationTime, rateLimitInfo }
 *
 * We normalise the response so the UI always gets { success, url, ... }
 * regardless of whether the backend returned url, imageUrl, or imageBase64.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, LIMITS } from '@/lib/rate-limiter';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:8080';
const SOHAM_API_KEY = process.env.SOHAM_API_KEY;

const backendHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SOHAM_API_KEY}`,
};

export async function POST(request: NextRequest) {
  // Rate limit: 5 image generations per minute per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, LIMITS.imageGen);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'RATE_LIMITED', message: 'Too many image requests. Try again in a minute.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { prompt, userId, style } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const upstream = await fetch(`${SERVER_URL}/api/image/generate`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify({ prompt: prompt.trim(), userId, style }),
    });

    const data = await upstream.json().catch(() => ({ success: false, error: 'Invalid response from backend' }));

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    // Normalise: backend returns 'url', ensure 'imageUrl' alias is also present
    const normalised = {
      ...data,
      url: data.url ?? data.imageUrl ?? data.imageBase64 ?? null,
      imageUrl: data.url ?? data.imageUrl ?? data.imageBase64 ?? null,
    };

    return NextResponse.json(normalised, { status: 200 });
  } catch (error) {
    console.error('Image generation proxy error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Image generation failed' },
      { status: 502 }
    );
  }
}
