import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp, LIMITS } from '@/lib/rate-limiter';

// ── Allowed origins ──────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://soham-ai.vercel.app',
  'https://codeex-ai.netlify.app',
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_SERVER_URL,
  process.env.SERVER_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter(Boolean) as string[];

// ── Security headers applied to every response ───────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking
  'X-Frame-Options': 'SAMEORIGIN',
  // Stop MIME sniffing
  'X-Content-Type-Options': 'nosniff',
  // XSS protection (legacy browsers)
  'X-XSS-Protection': '1; mode=block',
  // Referrer policy — don't leak full URL to third parties
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Permissions policy — disable unused browser features
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), payment=()',
  // HSTS — force HTTPS for 1 year (only in production)
  ...(process.env.NODE_ENV === 'production'
    ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' }
    : {}),
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    // Scripts: self + Vercel analytics + Google Analytics
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com",
    // Styles: self + inline (needed for Tailwind)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Fonts
    "font-src 'self' https://fonts.gstatic.com",
    // Images: self + data URIs + Supabase storage + Firebase + external CDNs
    "img-src 'self' data: blob: https://*.supabase.co https://*.googleapis.com https://*.googleusercontent.com https://soham-ai.vercel.app",
    // Media (audio/video)
    "media-src 'self' blob: data:",
    // API connections
    [
      "connect-src 'self'",
      'https://*.supabase.co',
      'https://soham-backend-dwpp.onrender.com',
      'https://www.google-analytics.com',
      'https://va.vercel-scripts.com',
      'https://api.groq.com',
      'https://generativelanguage.googleapis.com',
      'https://api-inference.huggingface.co',
      'https://openrouter.ai',
      'https://api.cerebras.ai',
      'wss://*.supabase.co',
    ].join(' '),
    // Workers (for PWA service worker)
    "worker-src 'self' blob:",
    // Frames
    "frame-src 'none'",
    // Object/embed
    "object-src 'none'",
    // Base URI
    "base-uri 'self'",
    // Form action
    "form-action 'self'",
  ].join('; '),
};

// ── Route-specific rate limit config ─────────────────────────────────────────
function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith('/api/chat')) return LIMITS.chat;
  if (pathname.startsWith('/api/generate-image')) return LIMITS.imageGen;
  if (pathname.startsWith('/api/tts')) return LIMITS.tts;
  if (pathname.startsWith('/api/transcribe')) return LIMITS.transcribe;
  if (pathname.startsWith('/api/web-search')) return LIMITS.webSearch;
  if (pathname.startsWith('/api/community')) return LIMITS.communityPost;
  return LIMITS.general;
}

// ── Middleware ────────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Apply security headers to ALL responses
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // 2. Handle API routes
  if (pathname.startsWith('/api/')) {
    // CORS
    const origin = request.headers.get('origin');
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Vary', 'Origin');
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');

    // Preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    // Rate limiting (skip health checks and OPTIONS)
    if (request.method !== 'OPTIONS' && !pathname.startsWith('/api/health')) {
      const ip = getClientIp(request);
      const config = getRateLimitConfig(pathname);
      const result = checkRateLimit(ip, config);

      response.headers.set('X-RateLimit-Limit', String(config.limit));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'RATE_LIMITED',
            message: 'Too many requests. Please slow down.',
            retryAfterMs: result.retryAfterMs,
            retryAfterSeconds: Math.ceil(result.retryAfterMs / 1000),
          },
          {
            status: 429,
            headers: {
              ...Object.fromEntries(response.headers.entries()),
              'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)),
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)).*)',
  ],
};
