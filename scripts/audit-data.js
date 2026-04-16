/**
 * 数据审计脚本：扫描所有菜谱 / 食材数据，输出完整报告
 * - 统计每个文件的菜谱数、重复 ID、重复菜名
 * - 汇总缺失食材 ID（按引用频率排序）
 * - 校验必填字段、食材引用、数值异常
 * - 统计食材引用频率（用于判断哪些食材是核心）
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// 所有菜谱文件（包括未合并的 mega-3 / quality-b / quality-c / chinese-2）
const RECIPE_FILES = [
  'recipes.json',
  'recipes-chinese-1.json',
  'recipes-chinese-2.json',
  'recipes-international.json',
  'recipes-hot-1.json',
  'recipes-hot-2.json',
  'recipes-hot-3.json',
  'recipes-mega-3.json',
  'recipes-quality-b.json',
  'recipes-quality-c.json',
];

// 加载食材
const ingredients = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const ingredientIds = new Set(ingredients.map(i => i.id));
const ingredientMap = new Map(ingredients.map(i => [i.id, i]));

// === 扫描 ===
const allRecipes = []; // { recipe, source }
const idMap = new Map(); // id -> [sources]
const nameMap = new Map(); // nameZh -> [sources]
const missingIngredients = new Map(); // id -> { count, usedIn: Set }
const ingredientUsage = new Map(); // id -> count

for (const file of RECIPE_FILES) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ 文件不存在，跳过: ${file}`);
    continue;
  }
  const recipes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const r of recipes) {
    allRecipes.push({ recipe: r, source: file });

    // ID 重复追踪
    if (!idMap.has(r.id)) idMap.set(r.id, []);
    idMap.get(r.id).push(file);

    // 名称重复追踪
    if (!nameMap.has(r.nameZh)) nameMap.set(r.nameZh, []);
    nameMap.get(r.nameZh).push({ file, id: r.id });

    // 食材引用统计
    for (const ing of (r.ingredients || [])) {
      ingredientUsage.set(ing.ingredientId, (ingredientUsage.get(ing.ingredientId) || 0) + 1);
      if (!ingredientIds.has(ing.ingredientId)) {
        const entry = missingIngredients.get(ing.ingredientId) || { count: 0, usedIn: new Set() };
        entry.count++;
        if (entry.usedIn.size < 5) entry.usedIn.add(`${r.nameZh}(${file})`);
        missingIngredients.set(ing.ingredientId, entry);
      }
    }
  }
}

// === 报告 ===
console.log('\n========== 📊 文件统计 ==========');
const byFile = {};
for (const { source } of allRecipes) byFile[source] = (byFile[source] || 0) + 1;
for (const f of RECIPE_FILES) {
  if (byFile[f]) console.log(`  ${f.padEnd(32)} ${byFile[f]} 道`);
}
console.log(`  ${'合计（含重复）'.padEnd(32)} ${allRecipes.length} 道`);

console.log('\n========== 🔁 重复 ID ==========');
let dupIdCount = 0;
for (const [id, sources] of idMap) {
  if (sources.length > 1) {
    dupIdCount++;
    if (dupIdCount <= 30) console.log(`  ${id} → ${sources.join(', ')}`);
  }
}
console.log(`  共 ${dupIdCount} 个重复 ID（只显示前 30 个）`);

console.log('\n========== 🔁 重复菜名 ==========');
let dupNameCount = 0;
for (const [name, entries] of nameMap) {
  if (entries.length > 1) {
    // 过滤掉同 ID 的（真正的重复文件不算）
    const ids = new Set(entries.map(e => e.id));
    if (ids.size > 1) {
      dupNameCount++;
      if (dupNameCount <= 30) console.log(`  ${name} → ${entries.map(e => `${e.id}(${e.file})`).join(', ')}`);
    }
  }
}
console.log(`  共 ${dupNameCount} 个跨 ID 菜名重复`);

console.log('\n========== 🚫 缺失食材 ID（按引用频率降序） ==========');
console.log(`  共 ${missingIngredients.size} 个缺失食材`);
const sortedMissing = [...missingIngredients.entries()].sort((a, b) => b[1].count - a[1].count);
for (const [id, info] of sortedMissing) {
  console.log(`  ${id.padEnd(28)} 被 ${String(info.count).padStart(3)} 道菜引用  e.g. ${[...info.usedIn].slice(0, 2).join('; ')}`);
}

console.log('\n========== 🧂 现有食材中从未被引用 ==========');
let unusedCount = 0;
for (const id of ingredientIds) {
  if (!ingredientUsage.has(id)) {
    unusedCount++;
    if (unusedCount <= 20) console.log(`  ${id}  (${ingredientMap.get(id).nameZh})`);
  }
}
console.log(`  共 ${unusedCount} 个未被引用食材`);

console.log('\n========== ⚠ 字段缺失 / 异常 ==========');
const REQUIRED = ['id', 'nameZh', 'nameEn', 'cuisine', 'regionalCuisine', 'flavors', 'mealTypes', 'difficulty', 'minCookingLevel', 'ingredients', 'steps'];
let issuesCount = 0;
const issuesSample = [];
for (const { recipe, source } of allRecipes) {
  const issues = [];
  for (const f of REQUIRED) {
    const v = recipe[f];
    if (v === undefined || v === null || (Array.isArray(v) && v.length === 0) || v === '') {
      issues.push(`缺: ${f}`);
    }
  }
  if (typeof recipe.servings === 'number' && recipe.servings <= 0) issues.push('servings<=0');
  if (typeof recipe.prepTime === 'number' && recipe.prepTime < 0) issues.push('prepTime<0');
  if (typeof recipe.cookTime === 'number' && recipe.cookTime < 0) issues.push('cookTime<0');
  if (issues.length > 0) {
    issuesCount++;
    if (issuesSample.length < 20) issuesSample.push({ id: recipe.id, source, issues });
  }
}
console.log(`  共 ${issuesCount} 道菜有字段问题`);
for (const s of issuesSample) console.log(`  ${s.id}(${s.source}): ${s.issues.join(', ')}`);

console.log('\n========== 📈 整体规模 ==========');
console.log(`  唯一 ID 数: ${idMap.size}`);
console.log(`  唯一菜名数: ${nameMap.size}`);
console.log(`  食材总数: ${ingredients.length}`);
console.log(`  被引用食材数: ${ingredientUsage.size}`);
console.log(`  预计合并去重后菜谱数: ${idMap.size}`);
