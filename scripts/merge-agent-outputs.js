/**
 * 合并 Agent 审查输出到 recipes-all.json
 * 只更新 ingredients 和 steps 字段，保留其他元数据
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const SCRIPTS_DIR = __dirname;

// 检查所有可能的agent输出
const AGENT_FILES = [
  'review-sichuan-hunan-fixed.json',
  'review-cantonese-fixed.json',
  'review-northern-fixed.json',
  'review-jiangzhe-fujian-fixed.json',
  'review-international-fixed.json',
  'review-homestyle-fixed.json',
];

const allRecipes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'recipes-all.json'), 'utf8'));
const recipeMap = new Map(allRecipes.map(r => [r.id, r]));

let totalUpdated = 0;
const updatedDetails = [];

for (const file of AGENT_FILES) {
  const fp = path.join(SCRIPTS_DIR, file);
  if (!fs.existsSync(fp)) {
    console.log('⏳ 未完成:', file);
    continue;
  }

  const fixed = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let fileCount = 0;

  for (const f of fixed) {
    const orig = recipeMap.get(f.id);
    if (!orig) continue;

    // 只更新 ingredients 和 steps
    let changed = false;
    if (JSON.stringify(orig.ingredients) !== JSON.stringify(f.ingredients)) {
      orig.ingredients = f.ingredients;
      changed = true;
    }
    if (JSON.stringify(orig.steps) !== JSON.stringify(f.steps)) {
      orig.steps = f.steps;
      changed = true;
    }
    if (changed) {
      fileCount++;
      totalUpdated++;
    }
  }

  console.log('✅ 已合并:', file.padEnd(40), '更新', fileCount, '/', fixed.length, '道');
  updatedDetails.push({ file, total: fixed.length, updated: fileCount });
}

fs.writeFileSync(path.join(DATA_DIR, 'recipes-all.json'), JSON.stringify(allRecipes, null, 2));

console.log('\n========== 总计 ==========');
console.log('总更新菜谱:', totalUpdated, '道');

// 检查待新增食材
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
for (const [id, info] of [...missing.entries()].sort((a, b) => b[1].count - a[1].count)) {
  console.log('  ' + id + ' (' + info.count + '道): ' + info.samples.join(', '));
}
