# AI 辅助分析 - Claude Code 工作流

## 背景

前端「AI 辅助分析」模式下（`recommendMode: 'ai_assist'`），用户每生成一份周计划都会同时写入 `pending_analysis_plans` 表（或 localStorage）。
本脚本让 Claude Code 拉取这些方案，**站在用户视角**给出健康/营养/搭配的完整建议报告，回填到 `ai_report` 字段，前端展示在 `/plan/report/[id]`。

## 报告原则

**报告对象**：普通用户家庭，不懂代码、不关心系统优化。

**报告内容**：
1. **健康医学角度** — 基于 `profile.members` 的 healthConditions 和 dietaryRestrictions
   - 糖尿病: 提醒高 GI 食材、餐后血糖管理
   - 高血压: 钠摄入提醒、推荐高钾食材
   - 痛风: 高嘌呤菜的提醒
   - 孕期/老人/小孩: 各自专项注意

2. **营养学角度** — 基于本周菜谱的整体营养构成
   - 蛋白质摄入: 是否足够、来源是否多样（红肉/白肉/海鲜/植物蛋白）
   - 蔬菜摄入: 颜色多样性、深绿色叶菜比例、膳食纤维
   - 碳水/脂肪比例: 是否过高过低
   - 维生素/矿物质: 是否覆盖（铁、钙、维生素 A/C/D、Omega-3）
   - 加工程度: 加工肉/盐糖/添加剂

3. **搭配合理性** — 基于本周菜的口感和文化搭配
   - 同一蛋白质重复频率
   - 同一蔬菜重复频率
   - 烹饪方式多样性（避免一周全是炒菜）
   - 菜系平衡度
   - 季节适配性

**给用户的建议**:
- 用人话写，不用术语堆砌
- 给具体的菜替换建议（比如「周三晚餐的红烧肉可以换成清蒸鱼，更适合高血压家人」）
- 如果整体很合理，就大方说「这周方案搭配很均衡」
- 不超过 600 字

## 工作流

### 1. 拉取待分析数据

**A. Supabase（推荐）**
```bash
curl "https://keccexevpizstvxrkjjz.supabase.co/rest/v1/pending_analysis_plans?status=eq.pending&order=created_at.desc&limit=10" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

**B. 从 admin 页面导出**
打开 `/admin/pending-analysis` → 点「导出待分析」→ 得到 JSON 文件

### 2. Claude Code 分析 prompt 模板

```
我提供一份用户周计划 JSON（含 profile + basicPlan）。请站在普通用户家庭的角度，写一份完整的健康/营养/搭配建议报告。

【输出格式】

## 整体评价
（一句话总结这周方案是否健康均衡）

## 健康角度
（基于成员的健康状况，给出具体的提醒和建议。如果没有特殊健康状况，简单说"全家健康状况良好，无特别注意事项"）

## 营养角度
- 蛋白质来源: ...
- 蔬菜搭配: ...
- 碳水/主食: ...
- 缺什么: ...（比如缺深绿色蔬菜、缺Omega-3）

## 搭配合理性
- 蛋白质轮换: ...（比如"周一周三都是鸡肉，建议周三换牛肉"）
- 烹饪方式: ...
- 文化搭配: ...

## 给你的具体建议
1. ...（具体到某餐某菜）
2. ...
3. ...

【约束】
- 全部用中文，亲切口语，不要术语堆砌
- 不超过 600 字
- 给的建议要 actionable，不要模糊
- 如果某项很好，就大方说"做得很好"
```

### 3. 回填结果

**A. Supabase 方式**
```bash
curl -X PATCH "https://keccexevpizstvxrkjjz.supabase.co/rest/v1/pending_analysis_plans?id=eq.ana_xxx" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "status":"analyzed",
    "ai_report":"## 整体评价\n...\n\n## 健康角度\n...",
    "analyzed_at":"2026-04-19T00:00:00Z"
  }'
```

回填后状态变 `analyzed`，前端 `/plan` 页 30s 内会自动检测到并显示「📊 AI 分析报告已就绪」横幅，用户点击进入 `/plan/report/[id]`。

### 4. 自动化（未来）

写一个 `scripts/auto-analyze.js`（node）：
- 每 N 小时跑一次
- 调 Supabase 查 pending 记录
- 调 Claude Code / Claude API 分析（公司免费 subscription）
- 回填结果

## 表结构

```sql
pending_analysis_plans (
  id text primary key,
  profile jsonb,        -- 用户偏好快照
  basic_plan jsonb,     -- 原始生成的 WeeklyPlan
  device_id text,
  status text,          -- pending | analyzing | analyzed | applied | skipped
  ai_report text,       -- ★ 这就是用户看到的完整报告
  optimized_plan jsonb, -- 可选: 替换建议
  analyzed_at timestamptz,
  created_at timestamptz
);
```
