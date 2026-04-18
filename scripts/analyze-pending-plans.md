# 待分析方案 - Claude Code 工作流

## 背景

前端「AI 队列分析」模式下，用户生成的每份周计划都会写入 `pending_analysis_plans` 表（或 localStorage）。
本脚本让 Claude Code 拉取这些方案，做营养学和合理性分析，回填优化建议，不消耗用户 API token。

## 工作流

### 1. 拉取待分析数据

有两种来源：

**A. Supabase（推荐）**
```bash
# 用 service_role key 查询
curl "https://keccexevpizstvxrkjjz.supabase.co/rest/v1/pending_analysis_plans?status=eq.pending&order=created_at.desc" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

**B. 从 admin 页面导出**
打开 `/admin/pending-analysis` → 点「导出待分析」→ 得到 JSON 文件

### 2. Claude Code 分析 prompt

```
我提供一份用户周计划 JSON（含 profile + basicPlan）。请按营养师视角分析：

1. **营养均衡**：蛋白质/碳水/脂肪比例、蔬菜摄入、膳食纤维是否达标？
2. **健康状况匹配**：若 profile.members 中有糖尿病/高血压/痛风，现有菜是否有冲突？
3. **家庭偏好贴合度**：cuisinePreference / flavorPreference / preferredCookingMethods 是否充分体现？
4. **重复度**：同一蛋白质/做法是否一周内出现 >3 次？
5. **预算**：估算成本 vs weeklyBudget

输出：
- 「AI 分析报告」（300字以内）指出问题
- 「优化建议」具体到某餐某菜该换成什么（从 recipes-all.json 里选）
- 不修改原方案结构，只输出替换建议 JSON

{"replaceSuggestions": [{"day":"monday","mealType":"lunch","oldRecipeId":"xxx","newRecipeId":"yyy","reason":"..."}]}
```

### 3. 回填结果

**A. Supabase 方式**
```bash
curl -X PATCH "https://keccexevpizstvxrkjjz.supabase.co/rest/v1/pending_analysis_plans?id=eq.xxx" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status":"analyzed","ai_report":"...","optimized_plan":{...},"analyzed_at":"2026-04-19T00:00:00Z"}'
```

**B. 本地方式**
如果数据从 localStorage 导出，直接手动修改 JSON 后用户看不到 → 建议先把数据迁到 Supabase

### 4. 用户看到优化结果

用户打开 `/admin/pending-analysis` → 看到状态 analyzed → 点「应用优化方案」

## 自动化（未来）

写一个 `scripts/auto-analyze.js`（node）：
- 每 N 小时跑一次
- 调 Supabase 查 pending 记录
- 调 Claude Code / Claude API 分析（你用公司免费的 Claude Code subscription）
- 回填结果
- 发 webhook 给你的邮箱/Slack 告知

## 当前表结构

```sql
pending_analysis_plans (
  id text primary key,
  profile jsonb,       -- 用户偏好快照
  basic_plan jsonb,    -- 原始生成的 WeeklyPlan
  device_id text,
  status text,         -- pending | analyzing | analyzed | applied | skipped
  ai_report text,      -- Claude 分析结果
  optimized_plan jsonb,-- 替换建议
  analyzed_at timestamptz,
  created_at timestamptz
);
```
