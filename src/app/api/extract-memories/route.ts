/**
 * Memory Extraction API — proxies to backend /api/memory/extract
 *
 * Called asynchronously after conversations to extract and store memories
 * without blocking the chat flow.
 */

import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:8080';
const SOHAM_API_KEY = process.env.SOHAM_API_KEY;

const backendHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SOHAM_API_KEY}`,
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, assistantResponse, userId } = body;

    if (!userMessage || !assistantResponse || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: userMessage, assistantResponse, userId' },
        { status: 400 }
      );
    }

    const upstream = await fetch(`${SERVER_URL}/api/memory/extract`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify({
        userId,
        userMessage,
        assistantMessage: assistantResponse,
      }),
    });

    const data = await upstream.json().catch(() => ({ success: true, extracted: 0 }));
    return NextResponse.json(data, { status: upstream.ok ? 200 : upstream.status });
  } catch (error) {
    console.error('[Memory Extraction API] Error:', error);
    // Return success to avoid blocking the chat flow
    return NextResponse.json(
      {
        success: true,
        extracted: 0,
        message: 'Memory extraction skipped due to error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}
