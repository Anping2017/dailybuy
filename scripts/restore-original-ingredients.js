/**
 * 恢复菜谱到原始食材配方
 * 从 12 个源文件读取原始食材，覆盖 recipes-all.json 中被修改的食材
 *
 * 规则:
 * 1. 菜谱原样保留（步骤、做法等不变）
 * 2. 食材ID完全使用源文件版本
 * 3. 不修改菜谱、不替换食材ID
 * 4. 缺失的食材会自动出现在 /admin/ingredients/pending
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// 源文件按优先级排列（与 merge-recipes.js 一致）
const SOURCE_FILES = [
  'recipes-quality-e.json',
  'recipes-quality-d.json',
  'recipes-quality-c.json',
  'recipes-quality-b.json',
  'recipes-chinese-2.json',
  'recipes-mega-3.json',
  'recipes-international.json',
  'recipes-chinese-1.json',
  'recipes-hot-1.json',
  'recipes-hot-2.json',
  'recipes-hot-3.json',
  'recipes.json',
];

// 收集所有源菜谱（按优先级，先到先得）
const sourceRecipes = new Map();
for (const f of SOURCE_FILES) {
  const fp = path.join(DATA_DIR, f);
  if (!fs.existsSync(fp)) continue;
  const recipes = JSON.parse(fs.readFileSync(fp, 'utf8'));
  for (const r of recipes) {
    if (!sourceRecipes.has(r.id)) {
      sourceRecipes.set(r.id, { source: f, recipe: r });
    }
  }
}

// 加载当前 recipes-all.json
const allRecipes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'recipes-all.json'), 'utf8'));

let restoredCount = 0;
const restored = [];

for (const r of allRecipes) {
  const orig = sourceRecipes.get(r.id);
  if (!orig) continue;

  const currentIngs = r.ingredients.map(ri => ri.ingredientId).sort().join(',');
  const origIngs = orig.recipe.ingredients.map(ri => ri.ingredientId).sort().join(',');

  if (currentIngs !== origIngs) {
    // 恢复原始食材
    r.ingredients = JSON.parse(JSON.stringify(orig.recipe.ingredients));
    restoredCount++;
    restored.push({ id: r.id, name: r.nameZh, source: orig.source });
  }
}

fs.writeFileSync(path.join(DATA_DIR, 'recipes-all.json'), JSON.stringify(allRecipes, null, 2));

console.log('恢复了', restoredCount, '道菜谱的原始食材');
if (restored.length > 0) {
  console.log('详情:');
  for (const r of restored) {
    console.log('  ' + r.name + ' (' + r.source + ')');
  }
}

// 检查缺失食材
const ings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const ingIds = new Set(ings.map(i => i.id));
const missing = new Map();
for (const r of allRecipes) {
  for (const ri of r.ingredients) {
    if (!ingIds.has(ri.ingredientId)) {
      const e = missing.get(ri.ingredientId) || { count: 0, samples: [] };
      e.count++;
      if (e.samples.length < 3) e.samples.push(r.nameZh);
      missing.set(ri.ingredientId, e);
    }
  }
}

console.log('\n=== 待新增食材 ===');
console.log('数量:', missing.size);
if (missing.size > 0) {
  const sorted = [...missing.entries()].sort((a, b) => b[1].count - a[1].count);
  for (const [id, info] of sorted) {
    console.log('  ' + id + ' (' + info.count + '道菜): ' + info.samples.join(', '));
  }
}
