/**
 * proxy.ts — shared helper for UI API routes that forward to the Express backend.
 *
 * All AI work lives in ../server. UI routes are thin proxies only.
 */

import { NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:8080';
const API_KEY = process.env.SOHAM_API_KEY;
const TIMEOUT_MS = 30000;

/**
 * Forward a JSON body to the backend and return the response as-is.
 */
export async function proxyToServer(
  backendPath: string,
  body: unknown,
  method: 'POST' | 'GET' = 'POST'
): Promise<NextResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${SERVER_URL}${backendPath}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
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
