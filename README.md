# CodeEx AI — Complete UI App

Fully independent Next.js 14 frontend + Express backend for SOHAM (Self Organising Hyper Adaptive Machine).

---

## Architecture

```
ui/
├── src/                    ← Next.js frontend (App Router)
│   ├── app/                ← Pages + API routes
│   │   ├── api/
│   │   │   ├── server-proxy/[...path]/  ← Proxies to Express backend
│   │   │   ├── health/                  ← Checks both frontend + backend
│   │   │   ├── chat-direct/             ← Direct AI chat (no Express needed)
│   │   │   ├── tts/                     ← Text-to-speech
│   │   │   ├── generate-image/          ← Image generation
│   │   │   └── ...                      ← All other API routes
│   │   ├── chat/           ← Chat page
│   │   ├── documentation/  ← 20 doc pages
│   │   └── ...             ← All 26 pages
│   ├── components/         ← All UI components
│   ├── hooks/              ← React hooks (incl. use-server.ts)
│   ├── lib/
│   │   ├── server-client.ts  ← Typed client for Express backend
│   │   └── ...               ← All utilities
│   ├── ai/                 ← Genkit AI flows + adapters
│   └── middleware.ts       ← CORS + auth middleware
│
├── server/                 ← Express backend (standalone)
│   ├── routes/             ← All API route handlers
│   ├── flows/              ← AI processing flows
│   ├── adapters/           ← Multi-provider AI (Groq, Google, etc.)
│   ├── memory/             ← RAG + memory system
│   ├── image/              ← Image generation pipeline
│   ├── voice/              ← STT + TTS services
│   ├── safety/             ← Rate limiting + safety guards
│   ├── tools/              ← Web search tools
│   ├── server.ts           ← Express entry point
│   ├── .env                ← Server environment variables
│   └── package.json        ← Server dependencies
│
├── public/                 ← Static assets + PWA files
├── supabase/               ← Database migrations
├── scripts/                ← Build + test scripts
├── docs/                   ← Documentation
├── .env.local              ← Frontend environment variables
└── package.json            ← Frontend dependencies + scripts
```

---

## Quick Start

### 1. Install dependencies

```bash
# Install both frontend and backend
npm run install:all

# Or separately:
npm install
npm run server:install
```

### 2. Configure environment

Frontend env is already set in `.env.local`.
Backend env is already set in `server/.env`.

For production, update:
- `SERVER_URL` in `.env.local` → your deployed backend URL
- `SOHAM_API_KEY` in both apps → the same shared secret
- `ALLOWED_ORIGINS` in `server/.env` → your deployed frontend URL

### 3. Run in development

```bash
# Run BOTH frontend (port 3000) + backend (port 8080) together:
npm run dev:full

# Or run separately in two terminals:
npm run dev          # Next.js on :3000
npm run server:dev   # Express on :8080
```

### 4. Build for production

```bash
# Build frontend
npm run build

# Build backend
npm run server:build

# Start both
npm start            # Next.js
npm run server:start # Express
```

---

## Frontend ↔ Backend Integration

### Option A — Next.js proxy routes (recommended for production)

The browser should call same-origin Next.js API routes on Vercel.
Those routes use `SERVER_URL` server-side and forward requests to the Express app on Render.

```typescript
// In any Next.js API route or server action:
const res = await fetch(`${process.env.SERVER_URL}/api/chat`, { ... });
```

### Option B — serverClient (recommended for components/hooks)

```typescript
import { serverClient } from '@/lib/server-client';

// In a React component:
const result = await serverClient.chat({ message: 'Hello SOHAM' });

// With loading state:
const { call, loading, error } = useServer();
const result = await call(() => serverClient.search({ query: 'latest AI news' }));
```

### Option C — Direct Next.js API routes

The `src/app/api/` routes handle many features directly (chat-direct, tts, generate-image, etc.) without needing the Express server. These use the same AI providers directly.

---

## Available Backend Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/chat` | Main chat |
| POST | `/api/chat/personality` | Chat with personality |
| POST | `/api/ai/search` | Web search + AI |
| POST | `/api/ai/solve` | Math/problem solver |
| POST | `/api/ai/summarize` | Text summarization |
| POST | `/api/ai/image-solver` | Solve from image |
| POST | `/api/ai/pdf-analyzer` | PDF analysis |
| POST | `/api/ai/translate` | Translation |
| POST | `/api/ai/sentiment` | Sentiment analysis |
| POST | `/api/ai/classify` | Text classification |
| POST | `/api/ai/grammar` | Grammar correction |
| POST | `/api/ai/quiz` | Quiz generator |
| POST | `/api/ai/recipe` | Recipe generator |
| POST | `/api/ai/joke` | Joke/fun generator |
| POST | `/api/ai/dictionary` | Word definitions |
| POST | `/api/ai/fact-check` | Fact checking |
| POST | `/api/image/generate` | Image generation |
| POST | `/api/image/generate-cf` | Cloudflare image gen |
| POST | `/api/voice/tts` | Text-to-speech |
| POST | `/api/voice/transcribe` | Speech-to-text |
| POST | `/api/memory/extract` | Memory extraction |

---

## SEO

- `src/app/robots.ts` — robots.txt with Googlebot rules
- `src/app/sitemap.ts` — XML sitemap with 30+ routes
- `src/components/seo/` — SEO components (structured data, social share, etc.)
- `src/app/layout.tsx` — Root metadata

---

## Deployment

### Frontend → Vercel / Netlify

Set these env vars in your deployment platform:
```
SERVER_URL=https://your-backend.onrender.com
SOHAM_API_KEY=match-your-render-secret
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_FIREBASE_API_KEY=...
GROQ_API_KEY=...
(all other vars from .env.local)
```

### Backend → Render / Railway / Fly.io

Set these env vars:
```
GROQ_API_KEY=...
ALLOWED_ORIGINS=https://your-frontend.vercel.app
SOHAM_API_KEY=match-your-vercel-secret
PORT=8080
(all other vars from server/.env)
```

---

## Firebase

- `firebase.json` — Firestore + Storage rules config
- `firestore.rules` — Database security rules
- `storage.rules` — File storage security rules
- `.firebaserc` — Project: `codeex-ai-v3`

Deploy rules: `firebase deploy --only firestore:rules,storage`

---

## Database

Supabase migrations in `supabase/migrations/`:
- `20250417_image_rate_limits.sql` — Image generation rate limiting
- `20250418_skills_tables.sql` — Skills feature tables

Apply: `supabase db push` or run SQL in Supabase dashboard.
