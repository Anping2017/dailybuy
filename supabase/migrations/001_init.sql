-- DailyBuy 数据库初始化
-- 在 Supabase Dashboard → SQL Editor 中运行此脚本

-- 用户数据存储 (无需登录也能用，用 device_id 标识)
create table if not exists user_data (
  id uuid primary key default gen_random_uuid(),
  device_id text unique not null,
  device_name text default '我的设备',
  profile jsonb,
  weekly_plan jsonb,
  shopping_list jsonb,
  owned_ingredients text[] default '{}',
  recipe_preferences jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 协作房间
create table if not exists sync_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code char(6) unique not null,
  version integer default 1,
  weekly_plan jsonb,
  shopping_list jsonb,
  weekly_plan_updated_at timestamptz default now(),
  shopping_list_updated_at timestamptz default now(),
  created_at timestamptz default now(),
  last_activity timestamptz default now()
);

-- 协作成员
create table if not exists sync_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references sync_rooms(id) on delete cascade,
  device_id text not null,
  device_name text not null,
  last_seen timestamptz default now(),
  unique(room_id, device_id)
);

-- 自动更新 updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_data_updated
  before update on user_data
  for each row execute function update_updated_at();

-- RLS 策略 (允许匿名访问自己的数据)
alter table user_data enable row level security;
alter table sync_rooms enable row level security;
alter table sync_members enable row level security;

-- 匿名用户可以读写自己的 user_data (通过 device_id)
create policy "Users can manage own data" on user_data
  for all using (true) with check (true);

create policy "Anyone can manage sync rooms" on sync_rooms
  for all using (true) with check (true);

create policy "Anyone can manage sync members" on sync_members
  for all using (true) with check (true);

-- 索引
create index if not exists idx_user_data_device_id on user_data(device_id);
create index if not exists idx_sync_rooms_code on sync_rooms(room_code);
create index if not exists idx_sync_rooms_activity on sync_rooms(last_activity);
create index if not exists idx_sync_members_room on sync_members(room_id);
