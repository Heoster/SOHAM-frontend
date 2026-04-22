/**
 * Cloudflare Workers AI — Image Generation API Route
 *
 * POST /api/generate-image-cf
 *
 * Body:
 *   {
 *     prompt:       string   (required)
 *     aspect_ratio: string   (optional, default "1:1")
 *     num_steps:    number   (optional, default 4)
 *     model:        string   (optional, default "@cf/black-forest-labs/flux-1-schnell")
 *     userId:       string   (optional, for rate-limiting / logging)
 *   }
 *
 * Response (success):
 *   {
 *     success:     true
 *     imageUrl:    string   (base64 data URL)
 *     model:       string
 *     provider:    "cloudflare"
 *   }
 *
 * Response (error):
 *   { success: false, error: string }
 *
 * Required env vars:
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_AI_API_TOKEN
 *
 * Optional env var:
 *   CLOUDFLARE_AI_GATEWAY_ID   — routes through AI Gateway for caching / analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { cfGenerateImage } from '@/lib/cloudflare-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Allowed image models on Cloudflare Workers AI
const ALLOWED_MODELS = new Set([
  '@cf/black-forest-labs/flux-1-schnell',
  '@cf/stabilityai/stable-diffusion-xl-base-1.0',
  '@cf/lykon/dreamshaper-8-lcm',
  '@cf/runwayml/stable-diffusion-v1-5-img2img',
]);

const DEFAULT_MODEL = '@cf/black-forest-labs/flux-1-schnell';

export async function POST(request: NextRequest) {
  try {
    // ── Validate credentials are configured ──────────────────────────────────
    if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_AI_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Cloudflare AI is not configured on this server.' },
        { status: 503 }
      );
    }

    // ── Parse body ───────────────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'prompt is required.' },
        { status: 400 }
      );
    }

    const aspectRatio =
      typeof body.aspect_ratio === 'string' ? body.aspect_ratio : '1:1';

    const numSteps =
      typeof body.num_steps === 'number'
        ? Math.min(Math.max(body.num_steps, 1), 8) // clamp 1–8
        : 4;

    const requestedModel =
      typeof body.model === 'string' && ALLOWED_MODELS.has(body.model)
        ? body.model
        : DEFAULT_MODEL;

    // ── Generate ─────────────────────────────────────────────────────────────
    const result = await cfGenerateImage(
      { prompt, aspect_ratio: aspectRatio, num_steps: numSteps },
      requestedModel
    );

    return NextResponse.json({
      success: true,
      imageUrl: result.imageBase64,
      model: result.model,
      provider: 'cloudflare',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[CF Image API]', message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ── GET — health / capability check ──────────────────────────────────────────
export async function GET() {
  const configured =
    !!process.env.CLOUDFLARE_ACCOUNT_ID && !!process.env.CLOUDFLARE_AI_API_TOKEN;

  return NextResponse.json({
    available: configured,
    provider: 'cloudflare-workers-ai',
    defaultModel: DEFAULT_MODEL,
    supportedModels: [...ALLOWED_MODELS],
    gatewayEnabled: !!process.env.CLOUDFLARE_AI_GATEWAY_ID,
  });
}
