/**
 * Text-to-Speech API — proxies to backend /api/voice/tts
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
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, LIMITS.tts);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'RATE_LIMITED', message: 'Too many TTS requests.' },
      { status: 429 }
    );
  }
  try {
    const body = await request.json();
    const { text, voice, speed } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    const upstream = await fetch(`${SERVER_URL}/api/voice/tts`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify({ text, voice, speed }),
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error('TTS proxy error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'TTS failed' },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get('text');
  const voice = searchParams.get('voice');

  if (!text) {
    return NextResponse.json(
      { success: false, error: 'Text parameter is required' },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(`${SERVER_URL}/api/voice/tts`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify({ text, voice: voice || 'troy' }),
    });

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      return NextResponse.json(err, { status: upstream.status });
    }

    const data = await upstream.json();

    // If backend returns base64 audio, decode and stream it
    if (data.audioBase64) {
      const audioBuffer = Buffer.from(data.audioBase64, 'base64');
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Disposition': 'inline; filename="speech.wav"',
        },
      });
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error('TTS proxy error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'TTS failed' },
      { status: 502 }
    );
  }
}
