/**
 * SOHAM Image Generation Pipeline
 *
 * Fallback chain (April 2025):
 *   1. Cloudflare Workers AI / flux-1-schnell  — needs CF token, ~3s   ✓
 *   2. Pollinations.ai/flux                    — free, no key, ~1.6s   ✓
 *   3. HF Router/FLUX.1-schnell                — needs HF key, ~7s     ✓
 */

import { cfGenerateImage } from './cloudflare-ai';

export interface SOHAMImageRequest {
  userPrompt: string;
  userId: string;
  style?: 'realistic' | 'artistic' | 'anime' | 'sketch';
  /** Override aspect ratio, e.g. "16:9". Defaults to "1:1". */
  aspectRatio?: string;
}

export interface SOHAMImageResult {
  url: string;
  path: string;
  enhancedPrompt: string;
  provider: 'cloudflare' | 'pollinations' | 'huggingface';
  model: string;
  generationTime: number;
}

export class SOHAMImagePipeline {

  // ─── PROMPT BUILDER ───────────────────────────────────────────────────────────

  private buildPrompt(raw: string, style?: string): string {
    const guides: Record<string, string> = {
      realistic: 'Photorealistic, high detail, natural lighting, professional photography.',
      artistic:  'Artistic, painterly, expressive brushstrokes, vibrant colors.',
      anime:     'Anime art style, clean lines, cel-shaded, vibrant colors, Japanese animation aesthetic.',
      sketch:    'Pencil sketch, hand-drawn, artistic linework, monochrome or light shading.',
    };
    const guide = style ? (guides[style] ?? '') : '';
    return guide ? `${raw}. ${guide}` : raw;
  }

  // ─── PROVIDER 1: Cloudflare Workers AI (flux-1-schnell) ───────────────────────

  private async tryCloudflare(
    prompt: string,
    aspectRatio: string
  ): Promise<{ url: string; model: string }> {
    const result = await cfGenerateImage(
      { prompt, aspect_ratio: aspectRatio, num_steps: 4 },
      '@cf/black-forest-labs/flux-1-schnell'
    );
    return { url: result.imageBase64, model: 'flux-1-schnell' };
  }

  // ─── PROVIDER 2: Pollinations.ai (free, no key) ───────────────────────────────

  private buildPollinationsUrl(prompt: string): string {
    const seed = Math.floor(Math.random() * 1_000_000);
    return (
      `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
      `?model=flux&width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`
    );
  }

  private async tryPollinations(prompt: string): Promise<{ url: string; model: string }> {
    // Pollinations generates on first GET — return the URL directly.
    // No server-side download needed; the client fetches the image.
    const url = this.buildPollinationsUrl(prompt);
    return { url, model: 'flux' };
  }

  // ─── PROVIDER 3: HF Router / FLUX.1-schnell (needs HF key) ────────────────────

  private async tryHuggingFace(prompt: string): Promise<{ url: string; model: string }> {
    const hfKey = process.env.HUGGINGFACE_API_KEY;
    if (!hfKey) throw new Error('HUGGINGFACE_API_KEY not set');

    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
        signal: AbortSignal.timeout(60_000),
      }
    );

    if (!response.ok) {
      const err = await response.text().catch(() => response.statusText);
      throw new Error(`HF FLUX.1-schnell ${response.status}: ${err.substring(0, 100)}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('image')) {
      const body = await response.text();
      throw new Error(`HF returned non-image: ${body.substring(0, 100)}`);
    }

    // Convert blob to base64 data URL (works on Vercel serverless — no filesystem needed)
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = contentType.split(';')[0].trim();
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return { url: dataUrl, model: 'FLUX.1-schnell' };
  }

  // ─── MAIN ────────────────────────────────────────────────────────────────────

  async generate(request: SOHAMImageRequest): Promise<SOHAMImageResult> {
    const startTime = Date.now();
    const enhancedPrompt = this.buildPrompt(request.userPrompt, request.style);
    const aspectRatio = request.aspectRatio ?? '1:1';

    // 1. Try Cloudflare Workers AI (primary — fast, high quality)
    if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_AI_API_TOKEN) {
      try {
        const result = await this.tryCloudflare(enhancedPrompt, aspectRatio);
        return {
          url: result.url,
          path: result.url,
          enhancedPrompt,
          provider: 'cloudflare',
          model: result.model,
          generationTime: Date.now() - startTime,
        };
      } catch (err) {
        console.warn('[Image] Cloudflare AI failed:', err instanceof Error ? err.message : err);
      }
    }

    // 2. Fallback: Pollinations (free, no key)
    try {
      const result = await this.tryPollinations(enhancedPrompt);
      return {
        url: result.url,
        path: result.url,
        enhancedPrompt,
        provider: 'pollinations',
        model: result.model,
        generationTime: Date.now() - startTime,
      };
    } catch (err) {
      console.warn('[Image] Pollinations failed:', err instanceof Error ? err.message : err);
    }

    // 3. Fallback: HF Router / FLUX.1-schnell
    try {
      const result = await this.tryHuggingFace(enhancedPrompt);
      return {
        url: result.url,
        path: result.url,
        enhancedPrompt,
        provider: 'huggingface',
        model: result.model,
        generationTime: Date.now() - startTime,
      };
    } catch (err) {
      console.warn('[Image] HF FLUX.1-schnell failed:', err instanceof Error ? err.message : err);
    }

    throw new Error('All image providers failed. Please try again.');
  }
}

let pipeline: SOHAMImagePipeline | null = null;

export function getSOHAMPipeline(): SOHAMImagePipeline {
  if (!pipeline) pipeline = new SOHAMImagePipeline();
  return pipeline;
}
