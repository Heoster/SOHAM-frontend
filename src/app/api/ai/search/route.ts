import { NextRequest, NextResponse } from 'next/server';
import { proxyToServer } from '@/lib/proxy';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.query || typeof body.query !== 'string' || !body.query.trim()) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  return proxyToServer('/api/ai/search', body);
}
