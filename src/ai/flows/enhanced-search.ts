'use server';

/**
 * Enhanced Web Search — DuckDuckGo + multi-provider AI synthesis
 */

import { searchDuckDuckGo, formatResultsForAI } from '@/lib/duckduckgo';
import { generateWithFallback } from '../multi-provider-router';

export interface EnhancedSearchInput {
  query: string;
  preferredModel?: string;
}

export interface EnhancedSearchOutput {
  answer: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  modelUsed?: string;
}

const SYSTEM_PROMPT = `You are a precise research assistant. Answer the user's question using the web search results provided.

Rules:
- Lead with a direct, factual answer in the first sentence
- Use bullet points or numbered lists for multi-part answers
- Cite sources inline as [Source N] when referencing specific facts
- If results are insufficient, say so clearly and answer from general knowledge
- Keep the response focused and under 400 words unless detail is essential
- Never fabricate URLs or statistics not present in the results`;

export async function enhancedSearch(input: EnhancedSearchInput): Promise<EnhancedSearchOutput> {
  const { query, preferredModel } = input;

  // 1. Fetch search results (with built-in timeout + HTML fallback)
  let searchContext = '';
  let sources: Array<{ title: string; url: string; snippet: string }> = [];

  try {
    const ddgResponse = await searchDuckDuckGo(query);

    if (ddgResponse.results.length > 0 || ddgResponse.abstract) {
      searchContext = formatResultsForAI(ddgResponse);
      // Only include sources that have a real URL
      sources = ddgResponse.results
        .filter(r => r.url && !r.url.includes('duckduckgo.com'))
        .slice(0, 6);
    }
  } catch (err) {
    console.warn('[enhancedSearch] DDG failed, proceeding without search context:', err);
  }

  // 2. Build prompt
  const userPrompt = searchContext
    ? `Answer this question using the search results below.\n\nQuestion: ${query}\n\n${searchContext}`
    : `Answer this question as accurately as possible: ${query}`;

  // 3. Generate AI answer
  try {
    const response = await generateWithFallback({
      prompt: userPrompt,
      systemPrompt: SYSTEM_PROMPT,
      preferredModelId: preferredModel,
      category: 'general',
      params: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });

    return {
      answer: response.text,
      sources: sources.length > 0 ? sources : undefined,
      modelUsed: response.modelUsed,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Search synthesis failed: ${msg}`);
  }
}
