/**
 * Chat Direct API — proxies to backend /api/chat
 */

import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:8080';
const SOHAM_API_KEY = process.env.SOHAM_API_KEY;

const backendHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SOHAM_API_KEY}`,
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS() {
  return NextResponse.json({ message: 'OK' }, { status: 200, headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'METHOD_NOT_ALLOWED',
      message: 'This endpoint only accepts POST requests',
      usage: {
        method: 'POST',
        endpoint: '/api/chat-direct',
        contentType: 'application/json',
        body: {
          message: 'string (required)',
          history: 'array (optional)',
          settings: 'object (optional)',
          userId: 'string (optional)',
        },
      },
      documentation: '/documentation/api-reference',
    },
    { status: 405, headers: corsHeaders }
  );
}

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Invalid JSON in request body', timestamp: new Date().toISOString() },
        { status: 400, headers: corsHeaders }
      );
    }

    const { message } = body;

    if (!message || typeof message !== 'string' || !String(message).trim()) {
      return NextResponse.json(
        { error: 'MISSING_MESSAGE', message: 'Message field is required and must be a non-empty string', timestamp: new Date().toISOString() },
        { status: 400, headers: corsHeaders }
      );
    }

    const upstream = await fetch(`${SERVER_URL}/api/chat`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify(body),
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status, headers: corsHeaders });
  } catch (error) {
    console.error('[chat-direct] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'PROXY_ERROR',
        message: error instanceof Error ? error.message : 'Backend unreachable',
        timestamp: new Date().toISOString(),
      },
      { status: 502, headers: corsHeaders }
    );
  }
}
