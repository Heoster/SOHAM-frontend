'use server';

/**
 * Web Search flow — thin wrapper around enhancedSearch for backward compatibility.
 */

import { enhancedSearch } from './enhanced-search';

export interface WebSearchInput {
  query: string;
}

export interface WebSearchOutput {
  answer: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  modelUsed?: string;
}

export async function searchTheWeb(input: WebSearchInput): Promise<WebSearchOutput> {
  try {
    return await enhancedSearch({ query: input.query });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);

    if (msg.includes('rate') || msg.includes('quota')) {
      return { answer: 'Web search is temporarily unavailable due to high demand. Please try again shortly.' };
    }

    return {
      answer: `I couldn't complete the web search: ${msg}. Try rephrasing your question.`,
    };
  }
}
