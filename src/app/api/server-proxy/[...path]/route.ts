/**
 * /api/server-proxy/[...path]
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js catch-all route that proxies requests to the Express backend.
 *
 * Frontend calls:  POST /api/server-proxy/chat
 * This proxies to: POST http://localhost:8080/api/chat
 *
 * This lets the frontend call the Express server without CORS issues,
 * and without exposing the backend URL to the client.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:8080';
const SOHAM_API_KEY = process.env.SOHAM_API_KEY || 'soham-secret-key-2025';
const TIMEOUT_MS = 120000;

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  const path = params.path.join('/');
  const targetUrl = `${SERVER_URL}/api/${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SOHAM_API_KEY}`,
  };

  // Forward Authorization header if present
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      signal: controller.signal,
    });

    const data = await upstream.json().catch(() => ({}));

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Backend unreachable';
    const isTimeout = message.includes('abort') || message.includes('timed out');
    return NextResponse.json(
      { success: false, error: isTimeout ? 'TIMEOUT' : 'PROXY_ERROR', message },
      { status: isTimeout ? 504 : 502 }
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
