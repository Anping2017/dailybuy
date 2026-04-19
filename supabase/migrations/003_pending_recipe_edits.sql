-- 菜谱编辑建议队列 (用户在详情页提交, 管理员审批)
create table if not exists public.pending_recipe_edits (
  id text primary key,
  recipe_id text not null,
  original_name text not null,
  edited jsonb not null,          -- 只含用户修改的字段
  reason text,                     -- 用户填写的修改原因
  device_id text not null,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_note text,              -- 管理员批注
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_pending_edits_status on public.pending_recipe_edits(status);
create index if not exists idx_pending_edits_created on public.pending_recipe_edits(created_at desc);
create index if not exists idx_pending_edits_recipe on public.pending_recipe_edits(recipe_id);

-- RLS: 允许所有人读写(与其他 pending 表一致)
alter table public.pending_recipe_edits enable row level security;

create policy "public read pending_recipe_edits" on public.pending_recipe_edits for select using (true);
create policy "public insert pending_recipe_edits" on public.pending_recipe_edits for insert with check (true);
create policy "public update pending_recipe_edits" on public.pending_recipe_edits for update using (true);
