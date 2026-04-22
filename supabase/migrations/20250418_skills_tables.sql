-- SOHAM Skills Tables — Run in Supabase SQL Editor
-- Adds tracking and caching tables for the new AI skills (v2)

-- ── skills_usage table ────────────────────────────────────────────────────────
-- Tracks which skills users use and how often (analytics + rate limiting)
CREATE TABLE IF NOT EXISTS skills_usage (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  skill       TEXT NOT NULL,  -- translate, sentiment, grammar, quiz, recipe, joke, dictionary, fact_check
  input_hash  TEXT,           -- SHA-256 of input for dedup/caching
  success     BOOLEAN NOT NULL DEFAULT true,
  latency_ms  INTEGER,
  model_used  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS skills_usage_user_id_idx
  ON skills_usage (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS skills_usage_skill_idx
  ON skills_usage (skill, created_at DESC);

ALTER TABLE skills_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access"
  ON skills_usage
  USING (true)
  WITH CHECK (true);

-- ── skills_rate_limits table ──────────────────────────────────────────────────
-- Per-user daily rate limits for expensive skills
CREATE TABLE IF NOT EXISTS skills_rate_limits (
  user_id TEXT NOT NULL,
  skill   TEXT NOT NULL,
  date    TEXT NOT NULL,  -- UTC date "YYYY-MM-DD"
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, skill, date)
);

ALTER TABLE skills_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access"
  ON skills_rate_limits
  USING (true)
  WITH CHECK (true);

-- Auto-clean rows older than 30 days
CREATE OR REPLACE FUNCTION cleanup_old_skills_rate_limits()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM skills_rate_limits
  WHERE date < (CURRENT_DATE - INTERVAL '30 days')::TEXT;
$$;

-- ── translation_cache table ───────────────────────────────────────────────────
-- Cache translations to avoid re-translating identical text
CREATE TABLE IF NOT EXISTS translation_cache (
  id              TEXT PRIMARY KEY,  -- SHA-256(source_lang + target_lang + text)
  source_text     TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  model_used      TEXT,
  hit_count       INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS translation_cache_target_idx
  ON translation_cache (target_language, last_used DESC);

ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access"
  ON translation_cache
  USING (true)
  WITH CHECK (true);

-- Auto-clean translations older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_translations()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM translation_cache
  WHERE last_used < NOW() - INTERVAL '90 days';
$$;

-- ── fact_check_cache table ────────────────────────────────────────────────────
-- Cache fact-check results for identical claims
CREATE TABLE IF NOT EXISTS fact_check_cache (
  id          TEXT PRIMARY KEY,  -- SHA-256(claim)
  claim       TEXT NOT NULL,
  verdict     TEXT NOT NULL,
  confidence  FLOAT NOT NULL,
  explanation TEXT NOT NULL,
  nuance      TEXT,
  sources     JSONB NOT NULL DEFAULT '[]',
  model_used  TEXT,
  hit_count   INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fact_check_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access"
  ON fact_check_cache
  USING (true)
  WITH CHECK (true);

-- Auto-clean fact checks older than 7 days (facts can change)
CREATE OR REPLACE FUNCTION cleanup_old_fact_checks()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM fact_check_cache
  WHERE last_used < NOW() - INTERVAL '7 days';
$$;
