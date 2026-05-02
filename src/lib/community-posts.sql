-- ============================================================
-- SOHAM Community — Safe migration (run in Supabase SQL editor)
-- Uses ALTER TABLE ... IF NOT EXISTS so it's safe to re-run
-- even if the table already exists from a previous version.
-- ============================================================

-- ── 1. Create posts table if it doesn't exist yet ────────────────────────────

create table if not exists community_posts (
  id            uuid primary key default gen_random_uuid(),
  user_name     text not null default 'Anonymous',
  user_avatar   text,
  user_id       text,
  content       text not null,
  tags          text[] not null default '{}',
  likes         integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ── 2. Add new columns if they don't exist (safe on existing tables) ─────────

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'community_posts' and column_name = 'comment_count'
  ) then
    alter table community_posts add column comment_count integer not null default 0;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'community_posts' and column_name = 'is_pinned'
  ) then
    alter table community_posts add column is_pinned boolean not null default false;
  end if;
end $$;

-- ── 3. Add CHECK constraints (skip if already present) ───────────────────────

do $$
begin
  if not exists (
    select 1 from information_schema.check_constraints
    where constraint_name = 'community_posts_content_length'
  ) then
    alter table community_posts
      add constraint community_posts_content_length
      check (char_length(content) >= 10 and char_length(content) <= 1000);
  end if;

  if not exists (
    select 1 from information_schema.check_constraints
    where constraint_name = 'community_posts_likes_nonneg'
  ) then
    alter table community_posts
      add constraint community_posts_likes_nonneg
      check (likes >= 0);
  end if;
end $$;

-- ── 4. Indexes ────────────────────────────────────────────────────────────────

create index if not exists community_posts_created_at_idx
  on community_posts (created_at desc);

create index if not exists community_posts_likes_idx
  on community_posts (likes desc);

create index if not exists community_posts_pinned_idx
  on community_posts (is_pinned desc, created_at desc);

create index if not exists community_posts_tags_idx
  on community_posts using gin (tags);

-- ── 5. RLS on posts ───────────────────────────────────────────────────────────

alter table community_posts enable row level security;

drop policy if exists "Public read posts"   on community_posts;
drop policy if exists "Public insert posts" on community_posts;
drop policy if exists "Owner delete posts"  on community_posts;

create policy "Public read posts"
  on community_posts for select using (true);

create policy "Public insert posts"
  on community_posts for insert with check (true);

create policy "Owner delete posts"
  on community_posts for delete using (true);

-- ── 6. Comments table ─────────────────────────────────────────────────────────

create table if not exists community_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references community_posts(id) on delete cascade,
  user_name  text not null default 'Anonymous',
  user_id    text,
  content    text not null
               check (char_length(content) >= 1 and char_length(content) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists community_comments_post_idx
  on community_comments (post_id, created_at asc);

alter table community_comments enable row level security;

drop policy if exists "Public read comments"   on community_comments;
drop policy if exists "Public insert comments" on community_comments;
drop policy if exists "Owner delete comments"  on community_comments;

create policy "Public read comments"
  on community_comments for select using (true);

create policy "Public insert comments"
  on community_comments for insert with check (true);

create policy "Owner delete comments"
  on community_comments for delete using (true);

-- ── 7. Reports table ──────────────────────────────────────────────────────────

create table if not exists community_reports (
  id                   uuid primary key default gen_random_uuid(),
  post_id              uuid not null references community_posts(id) on delete cascade,
  reason               text not null,
  reporter_fingerprint text not null,
  created_at           timestamptz not null default now()
);

create unique index if not exists community_reports_unique_idx
  on community_reports (post_id, reporter_fingerprint);

alter table community_reports enable row level security;

drop policy if exists "Insert reports" on community_reports;

create policy "Insert reports"
  on community_reports for insert with check (true);

-- ── 8. RPC functions ──────────────────────────────────────────────────────────

create or replace function increment_post_likes(post_id uuid)
returns void language sql security definer as $$
  update community_posts set likes = likes + 1 where id = post_id;
$$;

create or replace function increment_comment_count(post_id uuid)
returns void language sql security definer as $$
  update community_posts
  set comment_count = comment_count + 1
  where id = post_id;
$$;

create or replace function decrement_comment_count(post_id uuid)
returns void language sql security definer as $$
  update community_posts
  set comment_count = greatest(0, comment_count - 1)
  where id = post_id;
$$;

-- ── 9. Seed pinned welcome post (only if no pinned post exists) ───────────────

insert into community_posts (user_name, content, tags, is_pinned)
select
  'SOHAM Team',
  'Welcome to the SOHAM Community! 👋 Share tips, ask questions, post your AI experiments, and help each other get the most out of SOHAM. Be kind, be helpful, and have fun exploring AI together.',
  array['announcement', 'welcome'],
  true
where not exists (
  select 1 from community_posts where is_pinned = true limit 1
);
