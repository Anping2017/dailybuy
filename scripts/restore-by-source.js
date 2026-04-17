/**
 * 按 source 字段精确恢复菜谱原始食材
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// source 字段 → 文件名映射
const SOURCE_TO_FILE = {
  'quality-e': 'recipes-quality-e.json',
  'quality-d': 'recipes-quality-d.json',
  'quality-c': 'recipes-quality-c.json',
  'quality-b': 'recipes-quality-b.json',
  'chinese-2': 'recipes-chinese-2.json',
  'mega-3': 'recipes-mega-3.json',
  'international': 'recipes-international.json',
  'chinese-1': 'recipes-chinese-1.json',
  'hot-1': 'recipes-hot-1.json',
  'hot-2': 'recipes-hot-2.json',
  'hot-3': 'recipes-hot-3.json',
  'original': 'recipes.json',
};

// 加载每个文件的菜谱（按 ID 索引）
const fileRecipes = {};
for (const [source, file] of Object.entries(SOURCE_TO_FILE)) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) continue;
  const recipes = JSON.parse(fs.readFileSync(fp, 'utf8'));
  fileRecipes[source] = new Map(recipes.map(r => [r.id, r]));
}

// 加载当前 recipes-all.json
const allRecipes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'recipes-all.json'), 'utf8'));

let restoredCount = 0;
let cantFindSource = 0;
const restored = [];
const sourcesNotFound = [];

for (const r of allRecipes) {
  const sourceFile = fileRecipes[r.source];
  if (!sourceFile) {
    sourcesNotFound.push(r.source);
    continue;
  }

  const orig = sourceFile.get(r.id);
  if (!orig) {
    cantFindSource++;
    continue;
  }

  const currentIngs = r.ingredients.map(ri => ri.ingredientId).sort().join(',');
  const origIngs = orig.ingredients.map(ri => ri.ingredientId).sort().join(',');

  if (currentIngs !== origIngs) {
    r.ingredients = JSON.parse(JSON.stringify(orig.ingredients));
    // 同时恢复步骤(确保完全原汁原味)
    if (orig.steps && orig.steps.length > 0) {
      r.steps = JSON.parse(JSON.stringify(orig.steps));
    }
    restoredCount++;
    restored.push({ id: r.id, name: r.nameZh, source: r.source });
  }
}

fs.writeFileSync(path.join(DATA_DIR, 'recipes-all.json'), JSON.stringify(allRecipes, null, 2));

console.log('恢复了', restoredCount, '道菜谱的原始食材');
console.log('找不到原始记录:', cantFindSource);

if (restored.length > 0) {
  console.log('\n详细列表:');
  for (const r of restored) {
    console.log('  [' + r.source + '] ' + r.name + ' (' + r.id + ')');
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

console.log('\n=== 待新增食材 (菜谱用到但食材库没有) ===');
console.log('数量:', missing.size);
if (missing.size > 0) {
  const sorted = [...missing.entries()].sort((a, b) => b[1].count - a[1].count);
  for (const [id, info] of sorted) {
    console.log('  ' + id + ' (' + info.count + '道菜): ' + info.samples.join(', '));
  }
}
