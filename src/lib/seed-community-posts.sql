-- ============================================================
-- Seed: SOHAM release & pipeline discussion posts
-- All content kept under 1000 characters (check constraint)
-- Run in Supabase SQL editor
-- ============================================================

insert into community_posts (user_name, content, tags, likes, comment_count, is_pinned, created_at)
values

-- Post 1: Release announcement (pinned, short)
(
  'Heoster',
  '🚀 SOHAM v2.0 is live — May 4, 2026!

What''s new:
• 35+ AI models: Cerebras Qwen 3 235B, DeepSeek R1, Gemini 2.5 Flash
• Rebuilt chat UI — input always visible, mobile-first
• Community board (you''re here!)
• New /faq and /contact pages with full SEO
• Rate limiting, CSP headers, input sanitization on all API routes
• Supabase memory + cross-device chat history

Big thanks to Vidhan, Avineet, Vansh, Aayush, Varun, Pankaj, Masum, Sachin and the whole testing crew. Drop your thoughts below 👇',
  array['announcement', 'showcase'],
  47,
  12,
  true,
  '2026-05-04 10:00:00+00'
),

-- Post 2a: Pipeline part 1
(
  'Heoster',
  '🔧 How SOHAM picks the right model automatically — Part 1

Every message goes through two steps before reaching any AI:

1. Intent Detector — classifies your query into ~15 intents: math, coding, search, image-gen, translate, summarize, and more. Uses fast keyword + pattern matching, no extra API call.

2. Query Classifier — scores the query against model strengths. Coding → DeepSeek R1. Long docs → Gemini 2.5 Flash. Speed → Groq Llama 3.1 8B. General → Cerebras Qwen 3 235B.

This is why Auto mode almost always picks the right model without you having to think about it. Part 2 covers the adapter layer and fallback chain 👇',
  array['tip', 'coding'],
  38,
  9,
  false,
  '2026-05-04 11:30:00+00'
),

-- Post 2b: Pipeline part 2
(
  'Heoster',
  '🔧 How SOHAM picks the right model — Part 2

Continuing from Part 1 (intent + classification):

3. Adapter Layer — each provider (Groq, Google, Cerebras, HuggingFace, OpenRouter) has its own adapter normalising request/response format. The rest of the app never knows which model ran.

4. Fallback Chain — if the primary model fails or rate-limits, the orchestrator retries with the next best option automatically. Zero downtime for you.

5. Memory Injection — prior context from Supabase/Upstash is injected into the system prompt before the request goes out, so SOHAM remembers you across sessions.

Questions about any specific step? Ask below.',
  array['tip', 'coding', 'showcase'],
  29,
  7,
  false,
  '2026-05-04 11:45:00+00'
),

-- Post 3: Roadmap discussion
(
  'Heoster',
  '💬 What should SOHAM build next? Vote by commenting your pick:

A) Native Android & iOS app
B) Real-time collaborative chat — share a session with a friend
C) SOHAM API for developers
D) Custom AI personas / personalities
E) File uploads beyond PDF (Word, spreadsheets, code files)
F) Voice-first mode — full conversation, no keyboard needed

I read every comment. Most-requested features go straight to the top of the backlog.

Bug or idea not on the list? Use /contact or drop it below — every report gets read.',
  array['feature-request', 'question', 'announcement'],
  61,
  24,
  false,
  '2026-05-04 13:00:00+00'
);
