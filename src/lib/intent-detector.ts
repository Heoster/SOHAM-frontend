/**
 * Intent Detection Brain
 * Intelligently detects user intent for search, image generation, etc.
 * Uses pattern matching, training examples, and recent conversation context.
 */

import {INTENT_TRAINING_DATA, SEARCH_VS_SOLVE_DISAMBIGUATION} from './intent-training-data';

export type IntentType =
  | 'WEB_SEARCH'
  | 'IMAGE_GENERATION'
  | 'CHAT'
  | 'CODE_GENERATION'
  | 'EXPLANATION';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface IntentScore {
  intent: IntentType;
  score: number;
}

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  extractedQuery: string;
  reasoning: string;
  ranking?: IntentScore[];
  contextWindow?: string[];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter(token => token.length > 2);
}

function overlapScore(a: string, b: string): number {
  const aTokens = new Set(tokenize(a));
  const bTokens = new Set(tokenize(b));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) overlap++;
  }
  return overlap / Math.max(aTokens.size, bTokens.size);
}

function buildContextWindow(history: ConversationTurn[], latestMessage: string): string[] {
  const recentTurns = history.slice(-6).map(turn => turn.content.trim()).filter(Boolean);
  return [...recentTurns, latestMessage.trim()].filter(Boolean);
}

function resolveContextualMessage(message: string, history: ConversationTurn[]): string {
  const trimmed = message.trim();
  const shortFollowUp = trimmed.split(/\s+/).length <= 6;
  const needsContext = /\b(this|that|it|same|again|more|continue|also|why|how about|what about)\b/i.test(trimmed) || shortFollowUp;
  if (!needsContext) return trimmed;

  const lastUserTurn = [...history].reverse().find(turn => turn.role === 'user' && turn.content.trim().length > 0);
  if (!lastUserTurn) return trimmed;

  return `${lastUserTurn.content.trim()} ${trimmed}`.trim();
}

/**
 * Determines if a query requires real-time / current web data.
 * Used to auto-trigger web search even without explicit search keywords.
 */
export function requiresWebSearch(message: string): boolean {
  const lower = message.toLowerCase();
  const explicitSolveSignals = [
    /\b(solve|calculate|simplify|evaluate|integrate|differentiate|factorize|derive|prove)\b/,
    /\b(equation|expression|formula|matrix|determinant|polynomial|integral|derivative)\b/,
  ];

  if (explicitSolveSignals.some(pattern => pattern.test(lower))) {
    return false;
  }

  const timeSensitive = [
    /\b(today|tonight|yesterday|this (week|month|year)|right now|currently|at the moment|as of|latest|recent|newest|breaking|live)\b/,
    /\b(news|headlines|update|announcement|release|launch|event|match|score|result|weather|forecast|stock|price|rate|trend)\b/,
    /\b(who (is|are|was|were) (the )?(current|new|latest|now))\b/,
    /\b(what (is|are) (the )?(current|latest|new|today'?s?))\b/,
    /\b(when (is|was|did|does|do))\b/,
    /\b(how much (does|is|are|did))\b/,
    /\b(is .+ (still|open|available|alive|working|running))\b/,
  ];

  const factualLookup = [
    /\b(who (invented|created|founded|discovered|wrote|made|built|designed))\b/,
    /\b(what (year|date|time|place|country|city) (was|is|did|does))\b/,
    /\b(where (is|are|was|were) .+ (located|based|from|born|founded))\b/,
    /\b(population of|capital of|currency of|president of|prime minister of|vice president of|ceo of|founder of)\b/,
    /\b(definition of|meaning of|what does .+ mean)\b/,
  ];

  return [...timeSensitive, ...factualLookup].some(pattern => pattern.test(lower));
}

function scoreExamples(intent: IntentType, message: string): number {
  const examples = INTENT_TRAINING_DATA[intent] ?? [];
  const best = examples.reduce((max, example) => Math.max(max, overlapScore(example, message)), 0);

  if (intent === 'WEB_SEARCH' || intent === 'EXPLANATION') {
    const disambiguationBest = SEARCH_VS_SOLVE_DISAMBIGUATION
      .filter(example => example.intent === intent)
      .reduce((max, example) => Math.max(max, overlapScore(example.query, message)), 0);
    return Math.max(best, disambiguationBest);
  }

  return best;
}

/**
 * Intent Detector Service
 * Uses pattern matching, example scoring, and conversation context.
 */
export class IntentDetector {
  detect(message: string, history: ConversationTurn[] = []): IntentResult {
    const contextualMessage = resolveContextualMessage(message, history);
    const contextWindow = buildContextWindow(history, contextualMessage);
    const lowerMessage = contextualMessage.toLowerCase().trim();

    const searchResult = this.detectWebSearch(lowerMessage, contextualMessage);
    const imageResult = this.detectImageGeneration(lowerMessage, contextualMessage);
    const codeResult = this.detectCodeGeneration(lowerMessage, contextualMessage);
    const explainResult = this.detectExplanation(lowerMessage, contextualMessage);
    const chatScore = Math.max(scoreExamples('CHAT', contextualMessage), 0.55);

    const ranking: IntentScore[] = [
      {intent: 'WEB_SEARCH' as IntentType, score: searchResult.confidence},
      {intent: 'IMAGE_GENERATION' as IntentType, score: imageResult.confidence},
      {intent: 'CODE_GENERATION' as IntentType, score: codeResult.confidence},
      {intent: 'EXPLANATION' as IntentType, score: explainResult.confidence},
      {intent: 'CHAT' as IntentType, score: chatScore},
    ].sort((a, b) => b.score - a.score);

    const top = ranking[0];
    let chosen: IntentResult;

    switch (top.intent) {
      case 'WEB_SEARCH':
        chosen = searchResult;
        break;
      case 'IMAGE_GENERATION':
        chosen = imageResult;
        break;
      case 'CODE_GENERATION':
        chosen = codeResult;
        break;
      case 'EXPLANATION':
        chosen = explainResult;
        break;
      default:
        chosen = {
          intent: 'CHAT',
          confidence: top.score,
          extractedQuery: contextualMessage,
          reasoning: 'General conversation based on context and example match',
        };
        break;
    }

    return {
      ...chosen,
      confidence: Math.max(chosen.confidence, top.score),
      ranking,
      contextWindow,
    };
  }

  private detectWebSearch(_lowerMessage: string, originalMessage: string): IntentResult {
    const patternWeights = [
      { regex: /^(search|google|bing|find|lookup|look up)\s+(for|about|on)?\s*(.+)/i, weight: 0.98 },
      { regex: /^web\s+search\s+(.+)/i, weight: 0.98 },
      { regex: /^(can you|could you|please)\s+(search|find|look up|get|fetch)/i, weight: 0.9 },
      { regex: /(latest|current|recent|newest|today'?s?|this week'?s?)\s+(news|updates?|information|data|stats?|trends?)/i, weight: 0.92 },
      { regex: /\b(current|latest|today|live|price|weather|score|news|rate)\b/i, weight: 0.8 },
      { regex: /\b(vice president of|prime minister of|president of|ceo of)\b/i, weight: 0.86 },
    ];

    let maxConfidence = requiresWebSearch(originalMessage) ? 0.88 : 0;
    let extractedQuery = originalMessage;
    let matchedPattern = maxConfidence > 0 ? 'requiresWebSearch' : 'none';

    for (const pattern of patternWeights) {
      const match = originalMessage.match(pattern.regex);
      if (match && pattern.weight > maxConfidence) {
        maxConfidence = pattern.weight;
        matchedPattern = pattern.regex.source;
        extractedQuery = (match[3] || match[1] || originalMessage).trim();
      }
    }

    maxConfidence = Math.max(maxConfidence, 0.4 + scoreExamples('WEB_SEARCH', originalMessage));

    return {
      intent: 'WEB_SEARCH',
      confidence: Math.min(maxConfidence, 0.99),
      extractedQuery,
      reasoning: `Search intent from ${matchedPattern}`,
    };
  }

  private detectImageGeneration(_lowerMessage: string, originalMessage: string): IntentResult {
    const patterns = [
      { regex: /^(generate|create|make|draw|paint|design|produce)\s+(an?|the)?\s*(image|picture|photo|illustration|artwork|graphic)\s+(of|showing|depicting|with)?\s*(.+)/i, weight: 0.98 },
      { regex: /^(draw|paint|sketch|illustrate|render)\s+me\s+(.+)/i, weight: 0.92 },
      { regex: /^(image|picture|photo|illustration)\s+(of|showing|depicting)\s+(.+)/i, weight: 0.95 },
      { regex: /\b(photo-?realistic|artistic|anime|sketch|cartoon|3d|watercolor|digital art)\b/i, weight: 0.84 },
    ];

    let maxConfidence = 0;
    let extractedQuery = originalMessage;
    let matchedPattern = 'none';

    for (const pattern of patterns) {
      const match = originalMessage.match(pattern.regex);
      if (match && pattern.weight > maxConfidence) {
        maxConfidence = pattern.weight;
        matchedPattern = pattern.regex.source;
        extractedQuery = (match[5] || match[3] || match[2] || originalMessage).trim();
      }
    }

    maxConfidence = Math.max(maxConfidence, 0.32 + scoreExamples('IMAGE_GENERATION', originalMessage));

    return {
      intent: 'IMAGE_GENERATION',
      confidence: Math.min(maxConfidence, 0.99),
      extractedQuery,
      reasoning: `Image intent from ${matchedPattern}`,
    };
  }

  private detectCodeGeneration(_lowerMessage: string, originalMessage: string): IntentResult {
    const patterns = [
      { regex: /^(write|create|generate|make|build)\s+(a|an|the)?\s*(function|class|component|script|program|code|api|endpoint)/i, weight: 0.94 },
      { regex: /^(code|implement|develop)\s+(a|an|the)?\s*(.+)/i, weight: 0.88 },
      { regex: /(python|javascript|typescript|react|node|java|c\+\+|rust|go|sql)\s+(code|function|class|script|component)/i, weight: 0.9 },
    ];

    let maxConfidence = 0;

    for (const pattern of patterns) {
      if (pattern.regex.test(originalMessage)) {
        maxConfidence = Math.max(maxConfidence, pattern.weight);
      }
    }

    maxConfidence = Math.max(maxConfidence, 0.3 + scoreExamples('CODE_GENERATION', originalMessage));

    return {
      intent: 'CODE_GENERATION',
      confidence: Math.min(maxConfidence, 0.99),
      extractedQuery: originalMessage,
      reasoning: 'Detected code generation request',
    };
  }

  private detectExplanation(_lowerMessage: string, originalMessage: string): IntentResult {
    const patterns = [
      { regex: /^(explain|describe|define|clarify)\s+(.+)/i, weight: 0.88 },
      { regex: /^(teach me|help me understand|tell me about)\s+(.+)/i, weight: 0.84 },
      { regex: /^(how does|how do|why does|why do)\s+(.+)/i, weight: 0.82 },
    ];

    let maxConfidence = 0;

    for (const pattern of patterns) {
      if (pattern.regex.test(originalMessage)) {
        maxConfidence = Math.max(maxConfidence, pattern.weight);
      }
    }

    maxConfidence = Math.max(maxConfidence, 0.34 + scoreExamples('EXPLANATION', originalMessage));

    if (requiresWebSearch(originalMessage) && !/\b(explain|teach|understand|why|how)\b/i.test(originalMessage)) {
      maxConfidence = Math.min(maxConfidence, 0.58);
    }

    return {
      intent: 'EXPLANATION',
      confidence: Math.min(maxConfidence, 0.99),
      extractedQuery: originalMessage,
      reasoning: 'Detected explanation request',
    };
  }
}

let intentDetector: IntentDetector | null = null;

export function getIntentDetector(): IntentDetector {
  if (!intentDetector) {
    intentDetector = new IntentDetector();
  }
  return intentDetector;
}
