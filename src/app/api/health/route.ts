/**
 * GET /api/health
 * Returns health status of both the Next.js app and the Express backend.
 */

import { NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:8080';
const SOHAM_API_KEY = process.env.SOHAM_API_KEY || 'soham-secret-key-2025';

export async function GET() {
  let backendStatus: 'ok' | 'unreachable' = 'unreachable';
  let backendData: Record<string, unknown> = {};

  try {
    const res = await fetch(`${SERVER_URL}/api/health`, {
      headers: { 'Authorization': `Bearer ${SOHAM_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      backendStatus = 'ok';
      backendData = await res.json().catch(() => ({}));
    }
  } catch {
    backendStatus = 'unreachable';
  }

  return NextResponse.json({
    status: backendStatus === 'ok' ? 'ok' : 'degraded',
    frontend: 'ok',
    backend: backendStatus,
    backendUrl: SERVER_URL,
    backendDetails: backendData,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
}
