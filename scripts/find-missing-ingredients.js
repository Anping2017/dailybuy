/**
 * 扫描所有菜谱文件，找出缺失的食材ID
 * 输出需要新增到 ingredients.json 的食材列表
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// 加载现有食材
const ingredients = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const existingIds = new Set(ingredients.map(i => i.id));

// 扫描所有菜谱文件
const recipeFiles = [
  'recipes.json',
  'recipes-chinese-1.json',
  'recipes-international.json',
  'recipes-hot-1.json',
  'recipes-hot-2.json',
  'recipes-hot-3.json',
];

const missingIds = new Map(); // id -> { count, usedIn[] }

for (const file of recipeFiles) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) continue;

  const recipes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const r of recipes) {
    for (const ri of (r.ingredients || [])) {
      if (!existingIds.has(ri.ingredientId)) {
        const entry = missingIds.get(ri.ingredientId) || { count: 0, usedIn: [] };
        entry.count++;
        if (entry.usedIn.length < 3) entry.usedIn.push(r.nameZh);
        missingIds.set(ri.ingredientId, entry);
      }
    }
  }
}

if (missingIds.size === 0) {
  console.log('✅ 所有食材ID都已存在，无需新增');
} else {
  console.log(`⚠ 发现 ${missingIds.size} 个缺失食材ID:\n`);
  for (const [id, info] of [...missingIds.entries()].sort((a, b) => b[1].count - a[1].count)) {
    console.log(`  ${id} (被${info.count}道菜引用, 如: ${info.usedIn.join(', ')})`);
  }
}
