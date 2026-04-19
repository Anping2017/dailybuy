/**
 * 检查每个食材覆盖了几道菜, 列出 <5 道菜的食材
 */
const fs = require('fs');
const path = require('path');

const recipes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'recipes-all.json'), 'utf8'));
const ingredients = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'ingredients.json'), 'utf8'));

console.log(`总菜谱 ${recipes.length} · 总食材 ${ingredients.length}\n`);

// 统计每个食材出现在多少道菜
const count = new Map();
for (const r of recipes) {
  for (const ri of (r.ingredients || [])) {
    count.set(ri.ingredientId, (count.get(ri.ingredientId) || 0) + 1);
  }
}

// 按食材分类整理
const byCategory = {};
for (const ing of ingredients) {
  const c = count.get(ing.id) || 0;
  if (!byCategory[ing.category]) byCategory[ing.category] = [];
  byCategory[ing.category].push({ id: ing.id, name: ing.nameZh, count: c });
}

// 输出每个分类下覆盖不足 (<5) 的食材
const filterShown = process.argv.includes('--all') ? () => true : (i) => i.count < 5;
const targetMax = process.argv.includes('--all') ? Infinity : 5;

console.log(`覆盖菜数 < ${targetMax} 的食材:\n`);
for (const [cat, list] of Object.entries(byCategory)) {
  const filtered = list.filter(filterShown).sort((a, b) => a.count - b.count);
  if (filtered.length === 0) continue;
  console.log(`【${cat}】`);
  filtered.forEach(i => console.log(`  ${i.name} (${i.id}): ${i.count} 道`));
  console.log('');
}

// 完全没出现的食材
const zeroIngredients = ingredients.filter(i => !count.has(i.id));
console.log(`\n=== 完全未被任何菜引用 ===`);
console.log(`总数: ${zeroIngredients.length}`);
const zeroByCat = {};
for (const i of zeroIngredients) {
  zeroByCat[i.category] = (zeroByCat[i.category] || []);
  zeroByCat[i.category].push(i.nameZh);
}
for (const [cat, names] of Object.entries(zeroByCat)) {
  console.log(`  ${cat}: ${names.length} 个 (${names.slice(0, 8).join(', ')}${names.length > 8 ? '...' : ''})`);
}
