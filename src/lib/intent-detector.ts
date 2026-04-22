/**
 * Intent Detection Brain
 * Intelligently detects user intent for search, image generation, etc.
 * Similar to SOHAM pipeline but for intent classification
 */

export type IntentType = 
  | 'WEB_SEARCH'
  | 'IMAGE_GENERATION'
  | 'CHAT'
  | 'CODE_GENERATION'
  | 'EXPLANATION';

/**
 * Determines if a query requires real-time / current web data.
 * Used to auto-trigger web search even without explicit search keywords.
 */
export function requiresWebSearch(message: string): boolean {
  const lower = message.toLowerCase();

  // Explicit time-sensitive signals
  const timeSensitive = [
    /\b(today|tonight|yesterday|this (week|month|year)|right now|currently|at the moment|as of|latest|recent|newest|breaking|live)\b/,
    /\b(news|headlines|update|announcement|release|launch|event|match|score|result|weather|forecast|stock|price|rate|trend)\b/,
    /\b(who (is|are|was|were) (the )?(current|new|latest|now))\b/,
    /\b(what (is|are) (the )?(current|latest|new|today'?s?))\b/,
    /\b(when (is|was|did|does|do))\b/,
    /\b(how much (does|is|are|did))\b/,
    /\b(is .+ (still|open|available|alive|working|running))\b/,
  ];

  // Factual lookup signals (things an LLM may hallucinate without search)
  const factualLookup = [
    /\b(who (invented|created|founded|discovered|wrote|made|built|designed))\b/,
    /\b(what (year|date|time|place|country|city) (was|is|did|does))\b/,
    /\b(where (is|are|was|were) .+ (located|based|from|born|founded))\b/,
    /\b(population of|capital of|currency of|president of|prime minister of|ceo of|founder of)\b/,
    /\b(definition of|meaning of|what does .+ mean)\b/,
  ];

  for (const pattern of [...timeSensitive, ...factualLookup]) {
    if (pattern.test(lower)) return true;
  }

  return false;
}

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  extractedQuery: string;
  reasoning: string;
}

/**
 * Intent Detector Service
 * Uses pattern matching and keyword analysis to detect user intent
 */
export class IntentDetector {
  /**
   * Detect intent from user message
   */
  detect(message: string): IntentResult {
    const lowerMessage = message.toLowerCase().trim();

    // Check for web search intent
    const searchResult = this.detectWebSearch(lowerMessage, message);
    if (searchResult.confidence > 0.7) {
      return searchResult;
    }

    // Check for image generation intent
    const imageResult = this.detectImageGeneration(lowerMessage, message);
    if (imageResult.confidence > 0.7) {
      return imageResult;
    }

    // Check for code generation intent
    const codeResult = this.detectCodeGeneration(lowerMessage, message);
    if (codeResult.confidence > 0.6) {
      return codeResult;
    }

    // Check for explanation intent
    const explainResult = this.detectExplanation(lowerMessage, message);
    if (explainResult.confidence > 0.6) {
      return explainResult;
    }

    // Default to chat
    return {
      intent: 'CHAT',
      confidence: 1.0,
      extractedQuery: message,
      reasoning: 'General conversation',
    };
  }

  /**
   * Detect web search intent
   */
  private detectWebSearch(_lowerMessage: string, originalMessage: string): IntentResult {
    // Auto-detect real-time / factual queries even without explicit search keywords
    if (requiresWebSearch(originalMessage)) {
      return {
        intent: 'WEB_SEARCH',
        confidence: 0.85,
        extractedQuery: originalMessage,
        reasoning: 'Query requires real-time or factual web data',
      };
    }

    const patterns = [
      // Direct search commands
      { regex: /^(search|google|bing|find|lookup|look up)\s+(for|about|on)?\s*(.+)/i, weight: 1.0 },
      { regex: /^web\s+search\s+(.+)/i, weight: 1.0 },
      
      // Information seeking
      { regex: /^(what|who|where|when|why|how)\s+(is|are|was|were|did|does|do)\s+(.+)/i, weight: 0.8 },
      { regex: /^(tell me|show me|find me)\s+(about|information on|info about|details on)\s+(.+)/i, weight: 0.9 },
      
      // Current/latest information
      { regex: /(latest|current|recent|newest|today'?s?|this week'?s?)\s+(news|updates?|information|data|stats?|trends?)/i, weight: 0.95 },
      { regex: /what'?s?\s+(new|happening|trending|going on)\s+(with|in|about|on)/i, weight: 0.9 },
      
      // Specific domains
      { regex: /(news|article|blog|post|report|study|research|paper)\s+(about|on|regarding)/i, weight: 0.85 },
      { regex: /(price|cost|review|comparison|vs|versus)\s+of/i, weight: 0.8 },
      
      // Question patterns
      { regex: /^(can you|could you|please)\s+(search|find|look up|get|fetch)/i, weight: 0.9 },
      { regex: /^(i need|i want|i'm looking for)\s+(information|details|data|facts)\s+(about|on)/i, weight: 0.85 },
      
      // Time-sensitive queries
      { regex: /(today|yesterday|this week|this month|this year|now|currently)/i, weight: 0.7 },
      { regex: /(breaking|live|real-time|up-to-date)/i, weight: 0.85 },
    ];

    let maxConfidence = 0;
    let extractedQuery = originalMessage;
    let matchedPattern = '';

    for (const pattern of patterns) {
      const match = originalMessage.match(pattern.regex);
      if (match) {
        const confidence = pattern.weight;
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          matchedPattern = pattern.regex.source;
          
          // Extract the actual query
          if (match[3]) {
            extractedQuery = match[3].trim();
          } else if (match[1]) {
            extractedQuery = match[1].trim();
          } else {
            extractedQuery = originalMessage
              .replace(/^(search|google|find|lookup|look up|web search|tell me|show me)\s+(for|about|on)?\s*/i, '')
              .trim();
          }
        }
      }
    }

    return {
      intent: 'WEB_SEARCH',
      confidence: maxConfidence,
      extractedQuery,
      reasoning: maxConfidence > 0 ? `Matched search pattern: ${matchedPattern}` : 'No search pattern matched',
    };
  }

  /**
   * Detect image generation intent
   */
  private detectImageGeneration(_lowerMessage: string, originalMessage: string): IntentResult {
    const patterns = [
      // Direct generation commands — with or without "image/picture" noun
      { regex: /^(generate|create|make|draw|paint|design|produce)\s+(an?|the)?\s*(image|picture|photo|illustration|artwork|graphic)\s+(of|showing|depicting|with)?\s*(.+)/i, weight: 1.0 },
      { regex: /^(generate|create|make|draw|paint|design|produce)\s+(?!a\s+(?:function|class|component|script|program|code|api|endpoint|list|summary|report|plan|story|poem|essay|email|message|response|answer|explanation|description|analysis|review|comparison|guide|tutorial|example|template|outline|draft|document|note|task|schedule|budget|invoice|proposal|contract|letter|resume|cv|portfolio|presentation|slide|chart|graph|table|spreadsheet|database|query|formula|equation|calculation|solution|algorithm|flowchart|diagram|wireframe|mockup|prototype|design|layout|structure|architecture|system|framework|library|module|package|plugin|extension|addon|integration|api|sdk|cli|tool|utility|helper|service|server|client|app|application|website|webpage|page|form|button|input|output|result|data|file|folder|directory|path|url|link|image|video|audio|text|string|number|boolean|array|object|json|xml|html|css|js|ts|py|java|c|cpp|go|rust|swift|kotlin|php|ruby|scala|r|matlab|sql|bash|shell|script|command|terminal|console|log|error|warning|info|debug|test|spec|mock|stub|fixture|seed|migration|schema|model|view|controller|router|middleware|handler|hook|event|listener|callback|promise|async|await|stream|buffer|cache|queue|stack|heap|tree|graph|map|set|list|tuple|pair|record|struct|enum|interface|type|class|function|method|property|field|variable|constant|parameter|argument|return|throw|catch|try|finally|import|export|require|module|package|namespace|scope|closure|prototype|inheritance|polymorphism|encapsulation|abstraction|pattern|singleton|factory|observer|decorator|strategy|command|iterator|composite|facade|proxy|adapter|bridge|flyweight|state|template|visitor|mediator|memento|chain|interpreter|builder|prototype)\b).{3,}/i, weight: 0.9 },
      { regex: /^(image|picture|photo|illustration)\s+(of|showing|depicting)\s+(.+)/i, weight: 0.95 },

      // Art style requests
      { regex: /(photo-?realistic|artistic|anime|sketch|cartoon|3d|abstract|minimalist|vintage|watercolor|oil painting|digital art)\s+(image|picture|photo|art|painting|drawing|illustration)?\s*(of|showing|depicting)?/i, weight: 0.95 },

      // "show me / I want to see" — image specifically
      { regex: /^(visualize|show me|i want to see|can you show)\s+(an?|the)?\s*(image|picture|visualization|photo|illustration)\s+(of|showing)?/i, weight: 0.9 },
      // "show me X" where X is clearly visual
      { regex: /^show me\s+(an?\s+)?(image|picture|photo|illustration|drawing|painting|sketch)\s+(of\s+)?(.+)/i, weight: 0.95 },

      // "draw me / paint me / sketch me" — natural phrasing
      { regex: /^(draw|paint|sketch|illustrate|render)\s+me\s+(.+)/i, weight: 0.95 },
      { regex: /^(draw|paint|sketch|illustrate|render)\s+(.+)/i, weight: 0.85 },

      // "I want an image of..." / "I need a picture of..."
      { regex: /^i\s+(want|need|would like)\s+(an?|the)?\s*(image|picture|photo|illustration|drawing|painting|sketch)\s+(of|showing|depicting)?\s*(.+)/i, weight: 0.95 },

      // "can you generate/create/make an image of..."
      { regex: /^(can you|could you|please)\s+(generate|create|make|draw|paint|design|produce)\s+(an?|the)?\s*(image|picture|photo|illustration|artwork|graphic)?\s*(of|showing|depicting|with)?\s*(.+)/i, weight: 0.95 },

      // Descriptive scene requests — only when clearly visual
      { regex: /^(a|an)\s+.*(landscape|portrait|scene|sunset|sunrise|mountain|ocean|city|forest|space|galaxy|painting|artwork|illustration|drawing|sketch)\s*(of|showing|depicting|with)?/i, weight: 0.8 },
    ];

    let maxConfidence = 0;
    let extractedQuery = originalMessage;
    let matchedPattern = '';

    for (const pattern of patterns) {
      const match = originalMessage.match(pattern.regex);
      if (match) {
        const confidence = pattern.weight;
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          matchedPattern = pattern.regex.source;

          // Walk capture groups from last to first, pick the longest non-trivial one
          const groups = match.slice(1).filter(Boolean);
          const subject = groups
            .reverse()
            .find(g => g.length > 3 && !/^(an?|the|of|showing|depicting|with|me|please)$/i.test(g.trim()));

          extractedQuery = subject
            ? subject.trim()
            : originalMessage
                .replace(/^(can you|could you|please)\s+/i, '')
                .replace(/^(generate|create|make|draw|paint|design|produce|illustrate|render|sketch|visualize|show me|i want to see|i want|i need|i would like)\s+/i, '')
                .replace(/^(an?|the)\s+/i, '')
                .replace(/^(image|picture|photo|illustration|artwork|graphic|drawing|painting|sketch)\s+(of|showing|depicting)?\s*/i, '')
                .trim();
        }
      }
    }

    return {
      intent: 'IMAGE_GENERATION',
      confidence: maxConfidence,
      extractedQuery,
      reasoning: maxConfidence > 0 ? `Matched image generation pattern: ${matchedPattern}` : 'No image generation pattern matched',
    };
  }

  /**
   * Detect code generation intent
   */
  private detectCodeGeneration(_lowerMessage: string, originalMessage: string): IntentResult {
    const patterns = [
      { regex: /^(write|create|generate|make|build)\s+(a|an|the)?\s*(function|class|component|script|program|code|api|endpoint)/i, weight: 0.9 },
      { regex: /^(code|implement|develop)\s+(a|an|the)?\s*(.+)/i, weight: 0.8 },
      { regex: /(python|javascript|typescript|react|node|java|c\+\+|rust|go)\s+(code|function|class|script)/i, weight: 0.85 },
    ];

    let maxConfidence = 0;
    let extractedQuery = originalMessage;

    for (const pattern of patterns) {
      if (pattern.regex.test(originalMessage)) {
        maxConfidence = Math.max(maxConfidence, pattern.weight);
      }
    }

    return {
      intent: 'CODE_GENERATION',
      confidence: maxConfidence,
      extractedQuery,
      reasoning: maxConfidence > 0 ? 'Detected code generation request' : 'No code generation pattern matched',
    };
  }

  /**
   * Detect explanation intent
   */
  private detectExplanation(_lowerMessage: string, originalMessage: string): IntentResult {
    const patterns = [
      { regex: /^(explain|describe|what is|what are|define|clarify)\s+(.+)/i, weight: 0.8 },
      { regex: /^(how does|how do|why does|why do)\s+(.+)\s+(work|function|operate)/i, weight: 0.85 },
      { regex: /^(tell me about|teach me|help me understand)\s+(.+)/i, weight: 0.8 },
    ];

    let maxConfidence = 0;
    let extractedQuery = originalMessage;

    for (const pattern of patterns) {
      if (pattern.regex.test(originalMessage)) {
        maxConfidence = Math.max(maxConfidence, pattern.weight);
      }
    }

    return {
      intent: 'EXPLANATION',
      confidence: maxConfidence,
      extractedQuery,
      reasoning: maxConfidence > 0 ? 'Detected explanation request' : 'No explanation pattern matched',
    };
  }
}

// Export singleton
let intentDetector: IntentDetector | null = null;

export function getIntentDetector(): IntentDetector {
  if (!intentDetector) {
    intentDetector = new IntentDetector();
  }
  return intentDetector;
}
