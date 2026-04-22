-- Image generation daily rate limits
-- Run this in Supabase SQL editor or via migration

CREATE TABLE IF NOT EXISTS image_rate_limits (
  user_id TEXT    NOT NULL,
  date    TEXT    NOT NULL,  -- UTC date "YYYY-MM-DD"
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Enable RLS
ALTER TABLE image_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by server-side API)
CREATE POLICY "service_role_full_access" ON image_rate_limits
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-clean rows older than 7 days (optional, keeps table small)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM image_rate_limits
  WHERE date < (CURRENT_DATE - INTERVAL '7 days')::TEXT;
$$;
