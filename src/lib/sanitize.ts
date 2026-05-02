/**
 * Input sanitization utilities.
 * Strips dangerous characters and patterns before storing or displaying user content.
 * No external dependency — pure string manipulation.
 */

/** Strip HTML tags and dangerous characters from user text */
export function sanitizeText(input: string): string {
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script-like patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Normalize whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Collapse excessive newlines
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

/** Sanitize a display name — letters, numbers, spaces, hyphens, underscores only */
export function sanitizeName(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 60);
}

/** Sanitize a tag — lowercase alphanumeric and hyphens only */
export function sanitizeTag(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 30);
}

/** Sanitize an array of tags */
export function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t): t is string => typeof t === 'string')
    .map(sanitizeTag)
    .filter(Boolean)
    .slice(0, 4);
}

/** Basic profanity / spam signal check — returns true if content looks suspicious */
export function looksLikeSpam(text: string): boolean {
  const lower = text.toLowerCase();
  const spamPatterns = [
    /\b(buy now|click here|free money|make money fast|earn \$|casino|viagra|crypto pump)\b/i,
    /https?:\/\/[^\s]{50,}/,   // very long URLs
    /(.)\1{8,}/,                // repeated character spam (aaaaaaaaaa)
    /[A-Z]{20,}/,               // ALL CAPS spam
  ];
  return spamPatterns.some((p) => p.test(lower));
}

/** Validate that a string is a safe UUID */
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Truncate text to a max length, appending ellipsis if needed */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}
