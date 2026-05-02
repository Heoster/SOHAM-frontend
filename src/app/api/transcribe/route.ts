/**
 * Audio Transcription API — proxies to backend /api/voice/transcribe
 *
 * The backend expects JSON with { audioBase64, mimeType }.
 * This route accepts multipart/form-data (file upload) and converts it.
 */

import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:8080';
const SOHAM_API_KEY = process.env.SOHAM_API_KEY;

const backendHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SOHAM_API_KEY}`,
};

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let audioBase64: string;
    let mimeType: string;
    let language: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Accept file upload and convert to base64 for the backend
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      language = formData.get('language') as string | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No audio file provided' },
          { status: 400 }
        );
      }

      const validTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid audio format. Supported: webm, mp3, wav, m4a' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      audioBase64 = Buffer.from(arrayBuffer).toString('base64');
      mimeType = file.type;
    } else {
      // Accept JSON directly
      const body = await request.json();
      audioBase64 = body.audioBase64;
      mimeType = body.mimeType || 'audio/webm';
      language = body.language || null;

      if (!audioBase64) {
        return NextResponse.json(
          { success: false, error: 'audioBase64 is required' },
          { status: 400 }
        );
      }
    }

    const upstream = await fetch(`${SERVER_URL}/api/voice/transcribe`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify({ audioBase64, mimeType, language }),
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error('Transcription proxy error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 502 }
    );
  }
}
