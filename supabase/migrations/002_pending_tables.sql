-- 待新增菜谱请求队列 (需求1: 搜索无结果记录)
create table if not exists public.pending_recipe_requests (
  id text primary key,
  query text not null,
  parsed_dims jsonb,
  exclude_ingredients text[] default '{}',
  device_id text not null,
  status text default 'pending' check (status in ('pending','added','ignored')),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_pending_requests_status on public.pending_recipe_requests(status);
create index if not exists idx_pending_requests_created on public.pending_recipe_requests(created_at desc);

-- 待分析方案队列 (需求2: AI队列分析)
create table if not exists public.pending_analysis_plans (
  id text primary key,
  profile jsonb not null,
  basic_plan jsonb not null,
  device_id text not null,
  status text default 'pending' check (status in ('pending','analyzing','analyzed','applied','skipped')),
  ai_report text,
  optimized_plan jsonb,
  analyzed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_pending_analysis_status on public.pending_analysis_plans(status);
create index if not exists idx_pending_analysis_created on public.pending_analysis_plans(created_at desc);

-- Row Level Security: 允许 anon 读写自己设备的记录（简化方案，生产环境应接 auth）
alter table public.pending_recipe_requests enable row level security;
alter table public.pending_analysis_plans enable row level security;

-- 允许所有人读(admin后台能看到全部)
create policy "public read pending_recipe_requests" on public.pending_recipe_requests for select using (true);
create policy "public insert pending_recipe_requests" on public.pending_recipe_requests for insert with check (true);
create policy "public update pending_recipe_requests" on public.pending_recipe_requests for update using (true);

create policy "public read pending_analysis_plans" on public.pending_analysis_plans for select using (true);
create policy "public insert pending_analysis_plans" on public.pending_analysis_plans for insert with check (true);
create policy "public update pending_analysis_plans" on public.pending_analysis_plans for update using (true);
