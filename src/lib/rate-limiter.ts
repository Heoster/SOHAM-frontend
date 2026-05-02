/**
 * In-memory rate limiter for Next.js API routes.
 * Uses a sliding window algorithm per IP address.
 * Resets automatically — no external dependency needed.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// Global store — persists across requests in the same Node.js process
const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.windowStart > 60_000 * 10) store.delete(key);
    }
  }, 300_000);
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Key prefix to namespace different limiters */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // epoch ms
  retryAfterMs: number;
}

/**
 * Check and record a rate limit hit for a given identifier (usually IP).
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.prefix ?? 'rl'}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= config.windowMs) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return {
      success: true,
      remaining: config.limit - 1,
      resetAt: now + config.windowMs,
      retryAfterMs: 0,
    };
  }

  if (entry.count >= config.limit) {
    const resetAt = entry.windowStart + config.windowMs;
    return {
      success: false,
      remaining: 0,
      resetAt,
      retryAfterMs: resetAt - now,
    };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.windowStart + config.windowMs,
    retryAfterMs: 0,
  };
}

/**
 * Extract the real client IP from a Next.js request.
 * Handles Vercel, Cloudflare, and direct connections.
 */
export function getClientIp(request: Request): string {
  const headers = request instanceof Request ? request.headers : (request as any).headers;
  return (
    headers.get?.('cf-connecting-ip') ??
    headers.get?.('x-real-ip') ??
    headers.get?.('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

// Pre-configured limiters for common use cases
export const LIMITS = {
  /** Chat API — 30 requests per minute per IP */
  chat: { limit: 30, windowMs: 60_000, prefix: 'chat' } satisfies RateLimitConfig,
  /** Image generation — 5 per minute (expensive) */
  imageGen: { limit: 5, windowMs: 60_000, prefix: 'img' } satisfies RateLimitConfig,
  /** Community posts — 5 posts per 10 minutes */
  communityPost: { limit: 5, windowMs: 600_000, prefix: 'cpost' } satisfies RateLimitConfig,
  /** Community reports — 10 per hour */
  communityReport: { limit: 10, windowMs: 3_600_000, prefix: 'crep' } satisfies RateLimitConfig,
  /** TTS — 20 per minute */
  tts: { limit: 20, windowMs: 60_000, prefix: 'tts' } satisfies RateLimitConfig,
  /** Transcription — 10 per minute */
  transcribe: { limit: 10, windowMs: 60_000, prefix: 'stt' } satisfies RateLimitConfig,
  /** Web search — 20 per minute */
  webSearch: { limit: 20, windowMs: 60_000, prefix: 'ws' } satisfies RateLimitConfig,
  /** General API — 60 per minute */
  general: { limit: 60, windowMs: 60_000, prefix: 'api' } satisfies RateLimitConfig,
} as const;
