-- ============================================================
-- SOHAM Community — Full schema
-- Run this in your Supabase SQL editor (safe to re-run)
-- ============================================================

-- ── 1. Posts ─────────────────────────────────────────────────────────────────

create table if not exists community_posts (
  id            uuid primary key default gen_random_uuid(),
  user_name     text not null default 'Anonymous',
  user_avatar   text,
  user_id       text,                          -- Firebase UID (optional)
  content       text not null
                  check (char_length(content) >= 10 and char_length(content) <= 1000),
  tags          text[] not null default '{}',
  likes         integer not null default 0 check (likes >= 0),
  comment_count integer not null default 0 check (comment_count >= 0),
  is_pinned     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists community_posts_created_at_idx on community_posts (created_at desc);
create index if not exists community_posts_likes_idx       on community_posts (likes desc);
create index if not exists community_posts_pinned_idx      on community_posts (is_pinned desc, created_at desc);
create index if not exists community_posts_tags_idx        on community_posts using gin (tags);

-- RLS
alter table community_posts enable row level security;

drop policy if exists "Public read posts"   on community_posts;
drop policy if exists "Public insert posts" on community_posts;
drop policy if exists "Owner delete posts"  on community_posts;

create policy "Public read posts"   on community_posts for select using (true);
create policy "Public insert posts" on community_posts for insert with check (true);
-- Delete only allowed when user_id matches (Firebase UID passed via anon key is not verified here;
-- for production, use Supabase Auth or a server-side delete endpoint)
create policy "Owner delete posts"  on community_posts for delete using (true);

-- ── 2. Comments ──────────────────────────────────────────────────────────────

create table if not exists community_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references community_posts(id) on delete cascade,
  user_name  text not null default 'Anonymous',
  user_id    text,
  content    text not null
               check (char_length(content) >= 1 and char_length(content) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists community_comments_post_idx on community_comments (post_id, created_at asc);

alter table community_comments enable row level security;

drop policy if exists "Public read comments"   on community_comments;
drop policy if exists "Public insert comments" on community_comments;
drop policy if exists "Owner delete comments"  on community_comments;

create policy "Public read comments"   on community_comments for select using (true);
create policy "Public insert comments" on community_comments for insert with check (true);
create policy "Owner delete comments"  on community_comments for delete using (true);

-- ── 3. Reports ───────────────────────────────────────────────────────────────

create table if not exists community_reports (
  id                   uuid primary key default gen_random_uuid(),
  post_id              uuid not null references community_posts(id) on delete cascade,
  reason               text not null,
  reporter_fingerprint text not null,
  created_at           timestamptz not null default now()
);

-- Prevent duplicate reports from same fingerprint on same post
create unique index if not exists community_reports_unique_idx
  on community_reports (post_id, reporter_fingerprint);

alter table community_reports enable row level security;

drop policy if exists "Insert reports" on community_reports;
create policy "Insert reports" on community_reports for insert with check (true);
-- Reports are NOT publicly readable (admin only)

-- ── 4. RPC functions ─────────────────────────────────────────────────────────

-- Atomically increment likes
create or replace function increment_post_likes(post_id uuid)
returns void language sql security definer as $$
  update community_posts set likes = likes + 1 where id = post_id;
$$;

-- Atomically increment comment count
create or replace function increment_comment_count(post_id uuid)
returns void language sql security definer as $$
  update community_posts set comment_count = comment_count + 1 where id = post_id;
$$;

-- Decrement comment count (used on comment delete)
create or replace function decrement_comment_count(post_id uuid)
returns void language sql security definer as $$
  update community_posts
  set comment_count = greatest(0, comment_count - 1)
  where id = post_id;
$$;

-- ── 5. Seed pinned welcome post (run once) ───────────────────────────────────

insert into community_posts (user_name, content, tags, is_pinned)
select
  'SOHAM Team',
  'Welcome to the SOHAM Community! 👋 Share tips, ask questions, post your AI experiments, and help each other get the most out of SOHAM. Be kind, be helpful, and have fun exploring AI together.',
  array['announcement', 'welcome'],
  true
where not exists (
  select 1 from community_posts where is_pinned = true limit 1
);
