/**
 * Cloudflare Workers AI — Test Script
 *
 * Tests:
 *   1. Token verification  (GET /user/tokens/verify)
 *   2. Text generation     (@cf/meta/llama-3.1-8b-instruct)
 *   3. Image generation    (@cf/black-forest-labs/flux-1-schnell)
 *
 * Usage:
 *   node scripts/test-cloudflare.mjs
 *
 * Reads credentials from .env.local automatically.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Load .env.local ────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    // Grab everything after the first '=' then strip trailing inline comments
    // e.g.  TOKEN=abc123  # Optional comment  →  abc123
    const rawVal = trimmed.slice(eqIdx + 1);
    // Remove quoted wrappers if present, then strip inline # comments
    const unquoted = rawVal.replace(/^["']|["']$/g, '');
    const value = unquoted.replace(/\s+#.*$/, '').trim();
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
  console.log('✅ Loaded .env.local\n');
} else {
  console.warn('⚠️  .env.local not found — using existing environment variables\n');
}

// ── Credentials ────────────────────────────────────────────────────────────────
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN  = process.env.CLOUDFLARE_AI_API_TOKEN;
const GATEWAY_ID = process.env.CLOUDFLARE_AI_GATEWAY_ID; // optional

if (!ACCOUNT_ID || !API_TOKEN) {
  console.error('❌ Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_AI_API_TOKEN in .env.local');
  process.exit(1);
}

console.log(`Account ID : ${ACCOUNT_ID}`);
console.log(`Token      : ${API_TOKEN.slice(0, 8)}${'*'.repeat(12)}`);
console.log(`Gateway    : ${GATEWAY_ID ?? '(not set — using direct API)'}\n`);

// ── Helpers ────────────────────────────────────────────────────────────────────
const CF_BASE    = 'https://api.cloudflare.com/client/v4/accounts';
const CF_GW_BASE = 'https://gateway.ai.cloudflare.com/v1';

function buildEndpoint(model) {
  if (GATEWAY_ID) {
    return `${CF_GW_BASE}/${ACCOUNT_ID}/${GATEWAY_ID}/workers-ai/${model}`;
  }
  return `${CF_BASE}/${ACCOUNT_ID}/ai/run/${model}`;
}

function pass(label, detail = '') {
  console.log(`  ✅ PASS  ${label}${detail ? '  →  ' + detail : ''}`);
}

function fail(label, err) {
  console.log(`  ❌ FAIL  ${label}  →  ${err}`);
}

function section(title) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(60));
}

// ── TEST 1: Token Verification ─────────────────────────────────────────────────
section('TEST 1 — Token Verification');

try {
  const res = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  const json = await res.json();

  if (json.success) {
    pass('Token is valid', json.messages?.[0]?.message ?? 'active');
    console.log(`  Status  : ${json.result?.status ?? 'unknown'}`);
    console.log(`  Token ID: ${json.result?.id ?? 'n/a'}`);
  } else {
    fail('Token verification', JSON.stringify(json.errors));
  }
} catch (err) {
  fail('Token verification (network error)', err.message);
}

// ── TEST 2: Text Generation ────────────────────────────────────────────────────
section('TEST 2 — Text Generation  (@cf/meta/llama-3.1-8b-instruct)');

const TEXT_MODEL = '@cf/meta/llama-3.1-8b-instruct';

try {
  console.log('  Sending prompt: "Reply with exactly: CLOUDFLARE_OK"');
  const t0 = Date.now();

  const res = await fetch(buildEndpoint(TEXT_MODEL), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: 'Reply with exactly the text: CLOUDFLARE_OK — nothing else.',
      max_tokens: 20,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  const elapsed = Date.now() - t0;

  if (!res.ok) {
    const errText = await res.text();
    fail('Text generation', `HTTP ${res.status}: ${errText.slice(0, 200)}`);
  } else {
    const json = await res.json();
    const text = json?.result?.response ?? json?.response ?? '(empty)';
    pass('Text generation', `${elapsed}ms`);
    console.log(`  Response: "${text.trim()}"`);
  }
} catch (err) {
  fail('Text generation', err.message);
}

// ── TEST 3: Image Generation ───────────────────────────────────────────────────
section('TEST 3 — Image Generation  (@cf/black-forest-labs/flux-1-schnell)');

const IMAGE_MODEL = '@cf/black-forest-labs/flux-1-schnell';
const IMAGE_PROMPT = 'A cozy coffee shop interior with warm lighting, plants hanging from the ceiling, and a cat sleeping on a velvet armchair by the window';

try {
  console.log(`  Prompt: "${IMAGE_PROMPT.slice(0, 80)}…"`);
  console.log('  Aspect ratio: 16:9  |  Steps: 4');
  const t0 = Date.now();

  const res = await fetch(buildEndpoint(IMAGE_MODEL), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: IMAGE_PROMPT,
      aspect_ratio: '16:9',
      num_steps: 4,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  const elapsed = Date.now() - t0;

  if (!res.ok) {
    const errText = await res.text();
    fail('Image generation', `HTTP ${res.status}: ${errText.slice(0, 300)}`);
  } else {
    const contentType = res.headers.get('content-type') ?? '';
    console.log(`  Content-Type: ${contentType}`);

    if (contentType.startsWith('image/')) {
      // Raw binary response
      const buf = await res.arrayBuffer();
      const sizeKB = (buf.byteLength / 1024).toFixed(1);
      const b64 = Buffer.from(buf).toString('base64');
      const dataUrl = `data:${contentType};base64,${b64}`;

      // Save to disk for inspection
      const outDir = path.join(__dirname, '..', '.cf-test-output');
      fs.mkdirSync(outDir, { recursive: true });
      const ext = contentType.includes('jpeg') ? 'jpg' : 'png';
      const outFile = path.join(outDir, `cf-image-test.${ext}`);
      fs.writeFileSync(outFile, Buffer.from(buf));

      pass('Image generation', `${elapsed}ms  |  ${sizeKB} KB`);
      console.log(`  Saved to : ${outFile}`);
      console.log(`  Data URL : data:${contentType};base64,${b64.slice(0, 40)}…`);
    } else {
      // JSON wrapper
      const json = await res.json();
      const b64Field = json?.result?.image ?? json?.image;

      if (b64Field) {
        const buf = Buffer.from(b64Field, 'base64');
        const sizeKB = (buf.byteLength / 1024).toFixed(1);

        const outDir = path.join(__dirname, '..', '.cf-test-output');
        fs.mkdirSync(outDir, { recursive: true });
        const outFile = path.join(outDir, 'cf-image-test.png');
        fs.writeFileSync(outFile, buf);

        pass('Image generation (JSON wrapper)', `${elapsed}ms  |  ${sizeKB} KB`);
        console.log(`  Saved to : ${outFile}`);
      } else {
        fail('Image generation', `Unexpected response: ${JSON.stringify(json).slice(0, 200)}`);
      }
    }
  }
} catch (err) {
  fail('Image generation', err.message);
}

// ── Summary ────────────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(60)}`);
console.log('  Done. Check .cf-test-output/ for the generated image.');
console.log('═'.repeat(60) + '\n');
