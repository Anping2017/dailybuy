# 菜谱数据流水线

DailyBuy 菜谱数据 **唯一正确修改方式**。偏离此流程容易产生"孤儿菜谱"（在 recipes-all.json 但不在任何源文件），后续 enrich/audit 会跳过它们。

## 架构原则

```
     源文件（14 份）             流水线           合并产出（1 份）
┌──────────────────────┐    ┌─────────────┐    ┌──────────────────┐
│ recipes-desserts-drinks │ │  enrich     │    │                  │
│ recipes-quality-e   │    │    ↓        │    │                  │
│ recipes-quality-d   │    │  merge      │ →  │ recipes-all.json │
│ ...                 │ →  │    ↓        │    │ (只读/生成物)     │
│ recipes-legacy      │    │  audit      │    │                  │
│ recipes.json        │    └─────────────┘    └──────────────────┘
└──────────────────────┘
       ↑
 手改/新增仅在此层
```

**硬规则**：
1. 新增菜谱 → 写到某个 `recipes-*.json` 源文件，**绝不直写** `recipes-all.json`
2. `recipes-all.json` 由 `npm run recipes:merge` 生成，手工改会被下次合并覆盖
3. 修改字段（如 cookingMethod、描述）→ 改源文件 → 跑 enrich + merge + audit

## 标准工作流

### 新增 1–5 条菜谱

```bash
# 1. 编辑合适的源文件
#    — 中餐经典：recipes-quality-e.json（最高优先级）
#    — 杂项批量：recipes-mega-3.json
#    — 老数据：recipes-legacy.json

# 2. 单条预检（可选，验证字段正确性）
npm run recipes:validate -- path/to/recipe.json
# 或: cat recipe.json | npm run recipes:validate

# 3. 跑完整流水线（一条龙）
npm run recipes:check
# = enrich → merge → audit:strict
```

### 修正已有菜谱

```bash
# 1. 找到在哪个源文件
grep -l "recipe_id_here" src/data/recipes-*.json

# 2. 编辑该源文件，**绝不动 recipes-all.json**
# 3. npm run recipes:check
```

### 批量生成（新脚本）

写法模板：

```js
// ❌ 错误 — 会产生孤儿菜谱
fs.writeFileSync('src/data/recipes-all.json', ...)

// ✅ 正确 — 写到源文件，让 merge 接手
fs.writeFileSync('src/data/recipes-legacy.json', ...)
// 然后手动跑 npm run recipes:check
```

## 显式分类字段（自动补齐）

`enrich-recipes.js` 会给每条菜谱补齐 4 个字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `dishRole` | `'main_meat' \| 'main_veg' \| 'soup' \| 'staple' \| 'cold' \| 'snack' \| 'drink'` | 菜品角色 |
| `isVegetarian` | `boolean` | 是否素菜（无肉/海鲜） |
| `dishStyle` | `'meat' \| 'veg' \| 'egg'` | 用于汤/凉菜子过滤 |
| `stapleCategory` | `'rice' \| 'noodles' \| 'bread' \| 'congee' \| 'mantou'` | 仅 staple 有值 |

这些字段给 `engine.ts` 直接读取，**不要手改**（下次 enrich 会覆盖）。

## 质量守护

### 审计规则（16 级）

| 代码 | 级别 | 含义 |
|---|---|---|
| E1 | ERROR | 必填字段缺失 |
| E2 | ERROR | 枚举值非法 |
| E3 | ERROR | 食材 ID 不存在 |
| E4 | ERROR | ingredients/steps 为空 |
| W1 | WARN | 名字 vs cookingMethod 冲突 |
| W3 | WARN | staple 缺 stapleCategory |
| W4 | WARN | isVegetarian=true 但含肉 |
| W5 | WARN | description 缺/过短/过长 |
| W6 | WARN | 步骤数量/长度异常 |
| W7 | WARN | mealTypes 不合理 |
| W8 | WARN | difficulty vs 步骤数不匹配 |
| I1 | INFO | 菜名跨 ID 重复 |
| I3 | INFO | 建议用更具体的食材 |
| I4 | INFO | description 是 fallback 模板 |
| **孤儿检测** | ERROR | recipes-all.json 有未在源文件出现的 id |

### pre-commit 钩子

一次性安装：
```bash
# Windows
copy scripts\hooks\pre-commit .git\hooks\pre-commit

# Unix
cp scripts/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

钩子行为：
- 检测到 `src/data/recipes-*.json` 或 `ingredients.json` 变更 → 自动跑 enrich → merge → audit:strict
- 有 ERROR 或孤儿 → 阻止提交
- 通过 → 自动 `git add` 生成的 recipes-all.json
- 跳过钩子：`git commit --no-verify`

## 脚本速查

| 命令 | 作用 | 何时用 |
|---|---|---|
| `npm run recipes:validate` | 单条校验 CLI | 新菜谱入库前预检 |
| `npm run recipes:enrich` | 补齐分类字段 | 源文件有新/改菜谱时 |
| `npm run recipes:merge` | 合并去重 | 需要刷新 recipes-all.json |
| `npm run recipes:audit` | 并发审计（report） | 快速查看数据健康度 |
| `npm run recipes:audit:strict` | 审计（有 ERROR 退 1） | CI/pre-commit 用 |
| `npm run recipes:check` | 全链路一条龙 | 默认操作，任何改动后跑一次 |

## 常见故障

### "⚠ 本次合并将丢失 N 条 recipes-all.json 里存在但不在源文件中的菜谱"

**原因**：有脚本/手动直改了 recipes-all.json

**修复**：
```bash
node scripts/extract-legacy-recipes.js   # 抽孤儿到 recipes-legacy.json
npm run recipes:check                     # 重新跑流水线
```

### "食材不存在: XXX"

**原因**：菜谱引用了 ingredients.json 里没有的食材

**修复**：要么补食材到 ingredients.json，要么改菜谱使用已有食材
