/**
 * Web Search API — calls enhancedSearch directly (no external proxy needed).
 */

import { NextRequest, NextResponse } from 'next/server';
import { enhancedSearch } from '@/ai/flows/enhanced-search';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const TIMEOUT_MS = 25000;

export async function OPTIONS() {
  return NextResponse.json({ message: 'OK' }, { status: 200, headers: CORS });
}

async function runSearch(query: string, preferredModel?: string) {
  return Promise.race([
    enhancedSearch({ query: query.trim().slice(0, 500), preferredModel }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Search timed out')), TIMEOUT_MS)
    ),
  ]);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Request body must be valid JSON' },
      { status: 400, headers: CORS }
    );
  }

  const { query, preferredModel } = body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return NextResponse.json(
      { error: 'MISSING_QUERY', message: 'query is required and must be a non-empty string' },
      { status: 400, headers: CORS }
    );
  }

  try {
    const result = await runSearch(
      query as string,
      typeof preferredModel === 'string' ? preferredModel : undefined
    );
    return NextResponse.json(
      { ...result, responseTimeMs: Date.now() - startTime },
      { headers: CORS }
    );
  } catch (error) {
    console.error('[/api/web-search POST]', error);
    const message = error instanceof Error ? error.message : 'Web search failed';
    return NextResponse.json(
      { error: 'SEARCH_FAILED', message, responseTimeMs: Date.now() - startTime },
      { status: message.includes('timed out') ? 504 : 500, headers: CORS }
    );
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const query = request.nextUrl.searchParams.get('q') ?? request.nextUrl.searchParams.get('query') ?? '';

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'MISSING_QUERY', message: 'Provide a search query via ?q=your+query' },
      { status: 400, headers: CORS }
    );
  }

  try {
    const result = await runSearch(query);
    return NextResponse.json(
      { ...result, responseTimeMs: Date.now() - startTime },
      { headers: CORS }
    );
  } catch (error) {
    console.error('[/api/web-search GET]', error);
    const message = error instanceof Error ? error.message : 'Web search failed';
    return NextResponse.json(
      { error: 'SEARCH_FAILED', message, responseTimeMs: Date.now() - startTime },
      { status: message.includes('timed out') ? 504 : 500, headers: CORS }
    );
  }
}
