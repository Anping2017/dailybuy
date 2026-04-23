-- RLS 收紧: 用户只能读/写自己设备(device_id)的数据
--
-- 原 policy using(true) 允许任何匿名用户读写任何行, 是严重安全漏洞
-- 新方案: 每次请求在 header 里带 x-device-id, Supabase 通过 request.header 过滤
--
-- 客户端需要在 supabase client 里设置 global headers:
--   auth.global.headers['x-device-id'] = getDeviceId()
--
-- 或者使用 PostgREST 的 auth.jwt.claims (需要真实 auth)

-- ============================================================
-- 1. user_data (用户个人资料/weekly plan/shopping list 等)
-- ============================================================
-- 先删除旧的宽松 policy
drop policy if exists "allow_all_user_data" on public.user_data;

-- 新 policy: 用户只能读/写自己 device_id 的行
-- 使用 current_setting('request.headers', true) 读取客户端传入的 x-device-id
create policy "user_data_read_own" on public.user_data
  for select using (
    device_id = coalesce(
      current_setting('request.headers', true)::json->>'x-device-id',
      ''
    )
  );

create policy "user_data_insert_own" on public.user_data
  for insert with check (
    device_id = coalesce(
      current_setting('request.headers', true)::json->>'x-device-id',
      ''
    )
  );

create policy "user_data_update_own" on public.user_data
  for update using (
    device_id = coalesce(
      current_setting('request.headers', true)::json->>'x-device-id',
      ''
    )
  );

-- ============================================================
-- 2. pending_recipe_requests (搜索无结果)
-- ============================================================
drop policy if exists "public read pending_recipe_requests" on public.pending_recipe_requests;
drop policy if exists "public insert pending_recipe_requests" on public.pending_recipe_requests;
drop policy if exists "public update pending_recipe_requests" on public.pending_recipe_requests;

-- 允许写入(用户创建请求)
create policy "pending_requests_insert_own" on public.pending_recipe_requests
  for insert with check (
    device_id = coalesce(
      current_setting('request.headers', true)::json->>'x-device-id',
      ''
    )
  );

-- 允许读自己的; admin 后台通过 service_role key 绕过 RLS 看全部
create policy "pending_requests_read_own" on public.pending_recipe_requests
  for select using (
    device_id = coalesce(
      current_setting('request.headers', true)::json->>'x-device-id',
      ''
    )
  );

-- ============================================================
-- 3. pending_analysis_plans (AI 分析方案)
-- ============================================================
drop policy if exists "public read pending_analysis_plans" on public.pending_analysis_plans;
drop policy if exists "public insert pending_analysis_plans" on public.pending_analysis_plans;
drop policy if exists "public update pending_analysis_plans" on public.pending_analysis_plans;

create policy "pending_analysis_insert_own" on public.pending_analysis_plans
  for insert with check (
    device_id = coalesce(
      current_setting('request.headers', true)::json->>'x-device-id',
      ''
    )
  );

create policy "pending_analysis_read_own" on public.pending_analysis_plans
  for select using (
    device_id = coalesce(
      current_setting('request.headers', true)::json->>'x-device-id',
      ''
    )
  );

-- 允许用户自己更新自己的方案 (比如应用 AI 建议)
create policy "pending_analysis_update_own" on public.pending_analysis_plans
  for update using (
    device_id = coalesce(
      current_setting('request.headers', true)::json->>'x-device-id',
      ''
    )
  );

-- ============================================================
-- 4. pending_recipe_edits (菜谱编辑建议)
-- ============================================================
drop policy if exists "public read pending_recipe_edits" on public.pending_recipe_edits;
drop policy if exists "public insert pending_recipe_edits" on public.pending_recipe_edits;
drop policy if exists "public update pending_recipe_edits" on public.pending_recipe_edits;

-- 只允许自己创建编辑建议
create policy "pending_edits_insert_own" on public.pending_recipe_edits
  for insert with check (
    device_id = coalesce(
      current_setting('request.headers', true)::json->>'x-device-id',
      ''
    )
  );

-- 只能读自己提交的建议 (admin 用 service_role 看全部)
create policy "pending_edits_read_own" on public.pending_recipe_edits
  for select using (
    device_id = coalesce(
      current_setting('request.headers', true)::json->>'x-device-id',
      ''
    )
  );

-- ============================================================
-- 5. 增加 updated_at 字段 (冲突检测基础)
-- ============================================================
-- 注: 如果字段已存在, 这个 ALTER 会失败; PostgreSQL 没有 if not exists for column
-- 手动执行时先检查

-- alter table public.user_data add column if not exists updated_at timestamptz default now();
-- alter table public.pending_recipe_requests add column if not exists updated_at timestamptz default now();

-- ============================================================
-- 部署说明
-- ============================================================
-- 1. 在 Supabase Dashboard SQL editor 执行此文件
-- 2. 客户端 supabase client 配置:
--    createClient(url, anonKey, {
--      global: { headers: { 'x-device-id': getDeviceId() } }
--    })
-- 3. Admin 端使用 service_role key (绕过 RLS) 访问所有数据
