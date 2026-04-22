/**
 * DuckDuckGo Search Integration
 * Uses the Instant Answer API + HTML scraping fallback for richer results.
 */

const DDG_API_URL = 'https://api.duckduckgo.com/';
const DDG_HTML_URL = 'https://html.duckduckgo.com/html/';
const FETCH_TIMEOUT_MS = 8000;

export interface DuckDuckGoResult {
  title: string;
  url: string;
  snippet: string;
}

export interface DuckDuckGoSearchResponse {
  results: DuckDuckGoResult[];
  query: string;
  abstract?: string;
  abstractSource?: string;
  abstractUrl?: string;
}

interface DdgApiResponse {
  Abstract?: string;
  AbstractSource?: string;
  AbstractURL?: string;
  Answer?: string;
  Heading?: string;
  Results?: Array<{ Text?: string; FirstURL?: string }>;
  RelatedTopics?: Array<{ Text?: string; FirstURL?: string; Topics?: Array<{ Text?: string; FirstURL?: string }> }>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

/** Parse the Instant Answer API response */
function parseInstantAnswer(data: DdgApiResponse, query: string): DuckDuckGoSearchResponse {
  const results: DuckDuckGoResult[] = [];

  // Direct results
  for (const r of data.Results ?? []) {
    if (r.FirstURL && r.Text) {
      results.push({ title: stripHtml(r.Text).split(' - ')[0], url: r.FirstURL, snippet: stripHtml(r.Text) });
    }
  }

  // Related topics (flat + nested)
  for (const t of data.RelatedTopics ?? []) {
    if (t.FirstURL && t.Text) {
      results.push({ title: stripHtml(t.Text).split(' - ')[0], url: t.FirstURL, snippet: stripHtml(t.Text) });
    }
    for (const sub of t.Topics ?? []) {
      if (sub.FirstURL && sub.Text) {
        results.push({ title: stripHtml(sub.Text).split(' - ')[0], url: sub.FirstURL, snippet: stripHtml(sub.Text) });
      }
    }
  }

  // Prepend the Answer if present
  if (data.Answer) {
    results.unshift({ title: data.Heading || query, url: data.AbstractURL || '', snippet: stripHtml(data.Answer) });
  }

  return {
    results: deduplicateResults(results).slice(0, 10),
    query,
    abstract: data.Abstract || undefined,
    abstractSource: data.AbstractSource || undefined,
    abstractUrl: data.AbstractURL || undefined,
  };
}

/** Scrape DuckDuckGo HTML endpoint as fallback for richer organic results */
async function scrapeHtmlResults(query: string): Promise<DuckDuckGoResult[]> {
  const body = new URLSearchParams({ q: query, b: '', kl: '' });
  const res = await fetchWithTimeout(DDG_HTML_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (compatible; SOHAM-Search/1.0)',
    },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`DDG HTML ${res.status}`);
  const html = await res.text();

  const results: DuckDuckGoResult[] = [];
  // Match result blocks: <a class="result__a" href="...">title</a> ... <a class="result__snippet">snippet</a>
  const blockRe = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null && results.length < 10) {
    const url = m[1].startsWith('//') ? 'https:' + m[1] : m[1];
    const title = stripHtml(m[2]);
    const snippet = stripHtml(m[3]);
    if (title && url && !url.includes('duckduckgo.com')) {
      results.push({ title, url, snippet });
    }
  }
  return results;
}

function deduplicateResults(results: DuckDuckGoResult[]): DuckDuckGoResult[] {
  const seen = new Set<string>();
  return results.filter(r => {
    const key = r.url || r.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Search DuckDuckGo — tries Instant Answer API first, falls back to HTML scraping.
 */
export async function searchDuckDuckGo(query: string): Promise<DuckDuckGoSearchResponse> {
  const encoded = encodeURIComponent(query.trim());

  // 1. Try Instant Answer API
  try {
    const res = await fetchWithTimeout(
      `${DDG_API_URL}?q=${encoded}&format=json&no_html=1&skip_disambig=1`
    );
    if (res.ok) {
      const data = await res.json() as DdgApiResponse;
      const parsed = parseInstantAnswer(data, query);
      if (parsed.results.length >= 3 || parsed.abstract) return parsed;
    }
  } catch (e) {
    console.warn('[DDG] Instant Answer API failed:', e);
  }

  // 2. Fallback: HTML scraping
  try {
    const scraped = await scrapeHtmlResults(query);
    return { results: scraped, query };
  } catch (e) {
    console.warn('[DDG] HTML scrape failed:', e);
  }

  return { results: [], query };
}

export function encodeSearchQuery(query: string): string {
  return encodeURIComponent(query.trim());
}

/**
 * Format search results into a compact string for the AI prompt.
 */
export function formatResultsForAI(response: DuckDuckGoSearchResponse): string {
  const parts: string[] = [`Search query: "${response.query}"\n`];

  if (response.abstract) {
    parts.push(`Summary (${response.abstractSource ?? 'web'}): ${response.abstract}`);
    if (response.abstractUrl) parts.push(`Source: ${response.abstractUrl}`);
    parts.push('');
  }

  if (response.results.length > 0) {
    parts.push('Search Results:');
    response.results.forEach((r, i) => {
      parts.push(`${i + 1}. ${r.title}\n   ${r.snippet}\n   URL: ${r.url}`);
    });
  }

  return parts.join('\n');
}
