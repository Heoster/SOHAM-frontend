-- ============================================================
-- SOHAM Community — Full Reddit-style schema
-- Run in Supabase SQL editor (safe to re-run)
-- ============================================================

-- ── Sub-communities ───────────────────────────────────────────────────────────

create table if not exists community_subs (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text not null default '',
  icon        text,
  banner      text,
  member_count integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists community_subs_slug_idx on community_subs (slug);

alter table community_subs enable row level security;
drop policy if exists "Public read subs" on community_subs;
create policy "Public read subs" on community_subs for select using (true);

-- Seed default sub-communities
insert into community_subs (slug, name, description, icon, member_count)
values
  ('general',       'General',          'General discussion about SOHAM and AI.',                    '💬', 1200),
  ('tips',          'Tips & Tricks',    'Share prompts, workflows, and power-user tips.',             '💡', 890),
  ('showcase',      'Showcase',         'Show off your AI experiments and creative outputs.',         '🎨', 654),
  ('help',          'Help & Support',   'Ask questions and get help from the community.',             '🙋', 432),
  ('feature-ideas', 'Feature Ideas',    'Suggest and vote on new features for SOHAM.',               '🚀', 321),
  ('announcements', 'Announcements',    'Official updates and release notes from the SOHAM team.',   '📢', 1500)
on conflict (slug) do nothing;

-- ── Posts table (extended) ────────────────────────────────────────────────────

create table if not exists community_posts (
  id            uuid primary key default gen_random_uuid(),
  user_name     text not null default 'Anonymous',
  user_avatar   text,
  user_id       text,
  content       text not null,
  title         text,
  sub_slug      text references community_subs(slug) on delete set null,
  tags          text[] not null default '{}',
  likes         integer not null default 0,
  dislikes      integer not null default 0,
  comment_count integer not null default 0,
  is_pinned     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Add new columns if upgrading from old schema
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='community_posts' and column_name='title') then
    alter table community_posts add column title text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='community_posts' and column_name='sub_slug') then
    alter table community_posts add column sub_slug text references community_subs(slug) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='community_posts' and column_name='dislikes') then
    alter table community_posts add column dislikes integer not null default 0;
  end if;
end $$;

create index if not exists community_posts_created_at_idx  on community_posts (created_at desc);
create index if not exists community_posts_likes_idx       on community_posts (likes desc);
create index if not exists community_posts_pinned_idx      on community_posts (is_pinned desc, created_at desc);
create index if not exists community_posts_tags_idx        on community_posts using gin (tags);
create index if not exists community_posts_sub_idx         on community_posts (sub_slug, created_at desc);
create index if not exists community_posts_user_idx        on community_posts (user_id, created_at desc);

alter table community_posts enable row level security;
drop policy if exists "Public read posts"   on community_posts;
drop policy if exists "Public insert posts" on community_posts;
drop policy if exists "Owner delete posts"  on community_posts;
create policy "Public read posts"   on community_posts for select using (true);
create policy "Public insert posts" on community_posts for insert with check (true);
create policy "Owner delete posts"  on community_posts for delete using (true);

-- ── Comments ──────────────────────────────────────────────────────────────────

create table if not exists community_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references community_posts(id) on delete cascade,
  parent_id  uuid references community_comments(id) on delete cascade,
  user_name  text not null default 'Anonymous',
  user_id    text,
  content    text not null check (char_length(content) >= 1 and char_length(content) <= 500),
  likes      integer not null default 0,
  created_at timestamptz not null default now()
);

-- Add parent_id if upgrading
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='community_comments' and column_name='parent_id') then
    alter table community_comments add column parent_id uuid references community_comments(id) on delete cascade;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='community_comments' and column_name='likes') then
    alter table community_comments add column likes integer not null default 0;
  end if;
end $$;

create index if not exists community_comments_post_idx   on community_comments (post_id, created_at asc);
create index if not exists community_comments_parent_idx on community_comments (parent_id);

alter table community_comments enable row level security;
drop policy if exists "Public read comments"   on community_comments;
drop policy if exists "Public insert comments" on community_comments;
drop policy if exists "Owner delete comments"  on community_comments;
create policy "Public read comments"   on community_comments for select using (true);
create policy "Public insert comments" on community_comments for insert with check (true);
create policy "Owner delete comments"  on community_comments for delete using (true);

-- ── Reports ───────────────────────────────────────────────────────────────────

create table if not exists community_reports (
  id                   uuid primary key default gen_random_uuid(),
  post_id              uuid not null references community_posts(id) on delete cascade,
  reason               text not null,
  reporter_fingerprint text not null,
  created_at           timestamptz not null default now()
);

create unique index if not exists community_reports_unique_idx on community_reports (post_id, reporter_fingerprint);

alter table community_reports enable row level security;
drop policy if exists "Insert reports" on community_reports;
create policy "Insert reports" on community_reports for insert with check (true);

-- ── RPC functions ─────────────────────────────────────────────────────────────

create or replace function increment_post_likes(post_id uuid)
returns void language sql security definer as $$
  update community_posts set likes = likes + 1 where id = post_id;
$$;

create or replace function decrement_post_likes(post_id uuid)
returns void language sql security definer as $$
  update community_posts set likes = greatest(0, likes - 1) where id = post_id;
$$;

create or replace function increment_post_dislikes(post_id uuid)
returns void language sql security definer as $$
  update community_posts set dislikes = dislikes + 1 where id = post_id;
$$;

create or replace function increment_comment_count(post_id uuid)
returns void language sql security definer as $$
  update community_posts set comment_count = comment_count + 1 where id = post_id;
$$;

create or replace function decrement_comment_count(post_id uuid)
returns void language sql security definer as $$
  update community_posts set comment_count = greatest(0, comment_count - 1) where id = post_id;
$$;

-- ── Seed pinned welcome post ──────────────────────────────────────────────────

insert into community_posts (user_name, content, title, tags, sub_slug, is_pinned)
select
  'SOHAM Team',
  'Welcome to the SOHAM Community! 👋 Share tips, ask questions, post your AI experiments, and help each other get the most out of SOHAM. Be kind, be helpful, and have fun exploring AI together.',
  'Welcome to the SOHAM Community!',
  array['announcement', 'welcome'],
  'announcements',
  true
where not exists (select 1 from community_posts where is_pinned = true limit 1);
