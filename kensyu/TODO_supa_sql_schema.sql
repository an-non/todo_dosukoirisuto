-- Supabase schema for todo_dosukoirisuto (tasks + task_links + push_subscriptions)
-- 1) Create extensions
-- 2) Create tables
-- 3) Add foreign keys with ON DELETE CASCADE
-- 4) Enable RLS and add policies

-- Extensions (optional, but commonly needed)
create extension if not exists pgcrypto;

-- tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  notes text,
  done boolean not null default false,
  remind_at timestamptz,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_user_id on public.tasks(user_id);
create index if not exists idx_tasks_remind_at on public.tasks(remind_at);
create index if not exists idx_tasks_done on public.tasks(done);

-- task_links (graph edges)
create table if not exists public.task_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_task_id uuid not null references public.tasks(id) on delete cascade,
  to_task_id uuid not null references public.tasks(id) on delete cascade,
  relation_type text,
  created_at timestamptz not null default now()
);

create index if not exists idx_task_links_user_id on public.task_links(user_id);
create index if not exists idx_task_links_from on public.task_links(from_task_id);
create index if not exists idx_task_links_to on public.task_links(to_task_id);

-- push_subscriptions
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);

-- RLS
alter table public.tasks enable row level security;
alter table public.task_links enable row level security;
alter table public.push_subscriptions enable row level security;

-- tasks policies
drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
on public.tasks
for select
using (user_id = auth.uid());

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
on public.tasks
for insert
with check (user_id = auth.uid());

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
on public.tasks
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
on public.tasks
for delete
using (user_id = auth.uid());

-- task_links policies
drop policy if exists "task_links_select_own" on public.task_links;
create policy "task_links_select_own"
on public.task_links
for select
using (user_id = auth.uid());

drop policy if exists "task_links_insert_own" on public.task_links;
create policy "task_links_insert_own"
on public.task_links
for insert
with check (user_id = auth.uid());

drop policy if exists "task_links_update_own" on public.task_links;
create policy "task_links_update_own"
on public.task_links
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "task_links_delete_own" on public.task_links;
create policy "task_links_delete_own"
on public.task_links
for delete
using (user_id = auth.uid());

-- push_subscriptions policies
drop policy if exists "push_subscriptions_select_own" on public.push_subscriptions;
create policy "push_subscriptions_select_own"
on public.push_subscriptions
for select
using (user_id = auth.uid());

drop policy if exists "push_subscriptions_insert_own" on public.push_subscriptions;
create policy "push_subscriptions_insert_own"
on public.push_subscriptions
for insert
with check (user_id = auth.uid());

drop policy if exists "push_subscriptions_update_own" on public.push_subscriptions;
create policy "push_subscriptions_update_own"
on public.push_subscriptions
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "push_subscriptions_delete_own" on public.push_subscriptions;
create policy "push_subscriptions_delete_own"
on public.push_subscriptions
for delete
using (user_id = auth.uid());

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists trg_push_subscriptions_updated_at on public.push_subscriptions;
create trigger trg_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row execute function public.set_updated_at();

