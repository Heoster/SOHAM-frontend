/**
 * server-client.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Typed HTTP client for the SOHAM Express backend (ui/server/).
 *
 * Usage:
 *   import { serverClient } from '@/lib/server-client';
 *   const result = await serverClient.chat({ message: 'Hello' });
 *
 * In browser      → calls same-origin Next.js proxy routes
 * On server       → calls the backend directly via process.env.SERVER_URL
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DIRECT_SERVER_BASE = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:8080';
const BROWSER_PROXY_BASE = '';

export function getBackendUrl(): string {
  return typeof window === 'undefined' ? DIRECT_SERVER_BASE : BROWSER_PROXY_BASE;
}

function resolvePath(path: string): string {
  if (typeof window === 'undefined') {
    return path;
  }

  return path.replace(/^\/api\//, '/api/server-proxy/');
}

const API_KEY =
  typeof window === 'undefined'
    ? process.env.SOHAM_API_KEY
    : '';

// ── Generic fetch helper ──────────────────────────────────────────────────────
async function post<T>(path: string, body: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers.Authorization = `Bearer ${API_KEY}`;
  }

  const res = await fetch(`${getBackendUrl()}${resolvePath(path)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || err.error || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers.Authorization = `Bearer ${API_KEY}`;
  }

  const res = await fetch(`${getBackendUrl()}${resolvePath(path)}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || err.error || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  userId?: string;
  settings?: {
    model?: string;
    tone?: string;
    technicalLevel?: string;
    language?: string;
  };
}

export interface ChatResponse {
  success: boolean;
  content: string;
  modelUsed?: string;
  autoRouted?: boolean;
  routingReasoning?: string;
  provider?: string;
}

export interface SearchRequest {
  query: string;
  userId?: string;
}

export interface SearchResponse {
  success: boolean;
  answer: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  modelUsed?: string;
}

export interface ImageGenRequest {
  prompt: string;
  userId?: string;
  style?: 'realistic' | 'artistic' | 'anime' | 'sketch';
  width?: number;
  height?: number;
}

export interface ImageGenResponse {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  url?: string;          // backend returns 'url' field
  provider?: string;
  model?: string;
  enhancedPrompt?: string;
  generationTime?: number;
  rateLimitInfo?: { used: number; limit: number; remaining: number; resetsAt?: string };
}

export interface TTSRequest {
  text: string;
  voice?: string;
  userId?: string;
}

export interface TTSResponse {
  success: boolean;
  audioBase64?: string;
  audioUrl?: string;
  format?: string;
}

export interface TranscribeRequest {
  audioBase64: string;
  mimeType?: string;
  userId?: string;
}

export interface TranscribeResponse {
  success: boolean;
  text: string;
  language?: string;
}

export interface SolveRequest {
  problem: string;
  type?: 'math' | 'physics' | 'chemistry' | 'general';
  userId?: string;
}

export interface SolveResponse {
  success: boolean;
  solution: string;
  steps?: string[];
  modelUsed?: string;
}

export interface SummarizeRequest {
  text: string;
  length?: 'short' | 'medium' | 'long';
  userId?: string;
}

export interface SummarizeResponse {
  success: boolean;
  summary: string;
  modelUsed?: string;
}

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  userId?: string;
}

export interface TranslateResponse {
  success: boolean;
  translatedText: string;
  detectedLanguage?: string;
  modelUsed?: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  providers: Record<string, boolean>;
  uptime: number;
  version?: string;
}

export interface MemoryExtractRequest {
  userId: string;
  userMessage: string;
  assistantMessage: string;
  metadata?: Record<string, unknown>;
}

export interface PDFAnalyzeRequest {
  pdfBase64: string;
  question?: string;
  userId?: string;
}

export interface PDFAnalyzeResponse {
  success: boolean;
  answer: string;
  summary?: string;
  modelUsed?: string;
}

export interface ImageSolverRequest {
  imageBase64: string;
  problemType?: 'math' | 'physics' | 'chemistry' | 'general';
  userId?: string;
}

export interface ImageSolverResponse {
  success: boolean;
  recognizedContent: string;
  solution: string;
  isSolvable: boolean;
  modelUsed?: string;
}

// ── Skill endpoints ───────────────────────────────────────────────────────────
export interface SentimentRequest { text: string; userId?: string }
export interface SentimentResponse { success: boolean; sentiment: string; emotion: string; score: number; modelUsed?: string }

export interface ClassifyRequest { text: string; categories?: string[]; userId?: string }
export interface ClassifyResponse { success: boolean; category: string; confidence: number; modelUsed?: string }

export interface GrammarRequest { text: string; userId?: string }
export interface GrammarResponse { success: boolean; corrected: string; changes: string[]; modelUsed?: string }

export interface QuizRequest { topic: string; count?: number; difficulty?: string; userId?: string }
export interface QuizResponse { success: boolean; questions: Array<{ question: string; options: string[]; answer: string }>; modelUsed?: string }

export interface RecipeRequest { ingredients?: string[]; cuisine?: string; dietary?: string; userId?: string }
export interface RecipeResponse { success: boolean; recipe: string; ingredients: string[]; steps: string[]; modelUsed?: string }

export interface JokeRequest { type?: 'joke' | 'pun' | 'riddle' | 'fact'; topic?: string; userId?: string }
export interface JokeResponse { success: boolean; content: string; modelUsed?: string }

export interface DictionaryRequest { word: string; userId?: string }
export interface DictionaryResponse { success: boolean; definition: string; synonyms: string[]; etymology?: string; modelUsed?: string }

export interface FactCheckRequest { claim: string; userId?: string }
export interface FactCheckResponse { success: boolean; verdict: string; explanation: string; sources?: string[]; modelUsed?: string }

// ── Client ────────────────────────────────────────────────────────────────────
export const serverClient = {
  /** Health check — verify backend is reachable */
  health: () => get<HealthResponse>('/api/health'),

  // ── Chat ──────────────────────────────────────────────────────────────────
  chat: (req: ChatRequest) => post<ChatResponse>('/api/chat', req),
  chatWithPersonality: (req: ChatRequest) => post<ChatResponse>('/api/chat/personality', req),

  // ── AI Tools ──────────────────────────────────────────────────────────────
  search: (req: SearchRequest) => post<SearchResponse>('/api/ai/search', req),
  solve: (req: SolveRequest) => post<SolveResponse>('/api/ai/solve', req),
  summarize: (req: SummarizeRequest) => post<SummarizeResponse>('/api/ai/summarize', req),
  imageSolver: (req: ImageSolverRequest) => post<ImageSolverResponse>('/api/ai/image-solver', req),
  pdfAnalyzer: (req: PDFAnalyzeRequest) => post<PDFAnalyzeResponse>('/api/ai/pdf-analyzer', req),

  // ── Image Generation ──────────────────────────────────────────────────────
  generateImage: (req: ImageGenRequest) => post<ImageGenResponse>('/api/image/generate', req),
  generateImageCF: (req: ImageGenRequest) => post<ImageGenResponse>('/api/image/generate-cf', req),

  // ── Voice ─────────────────────────────────────────────────────────────────
  tts: (req: TTSRequest) => post<TTSResponse>('/api/voice/tts', req),
  transcribe: (req: TranscribeRequest) => post<TranscribeResponse>('/api/voice/transcribe', req),

  // ── Memory ────────────────────────────────────────────────────────────────
  extractMemories: (req: MemoryExtractRequest) => post<{ success: boolean }>('/api/memory/extract', req),

  // ── Skills v2 ─────────────────────────────────────────────────────────────
  translate: (req: TranslateRequest) => post<TranslateResponse>('/api/ai/translate', req),
  sentiment: (req: SentimentRequest) => post<SentimentResponse>('/api/ai/sentiment', req),
  classify: (req: ClassifyRequest) => post<ClassifyResponse>('/api/ai/classify', req),
  grammar: (req: GrammarRequest) => post<GrammarResponse>('/api/ai/grammar', req),
  quiz: (req: QuizRequest) => post<QuizResponse>('/api/ai/quiz', req),
  recipe: (req: RecipeRequest) => post<RecipeResponse>('/api/ai/recipe', req),
  joke: (req: JokeRequest) => post<JokeResponse>('/api/ai/joke', req),
  dictionary: (req: DictionaryRequest) => post<DictionaryResponse>('/api/ai/dictionary', req),
  factCheck: (req: FactCheckRequest) => post<FactCheckResponse>('/api/ai/fact-check', req),
};

export default serverClient;
