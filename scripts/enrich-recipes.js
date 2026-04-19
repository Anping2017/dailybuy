/**
 * 菜谱字段补齐脚本
 * 为所有源文件的菜谱注入显式分类字段：
 *   dishRole / isVegetarian / stapleCategory / dishStyle
 *
 * 这些字段原本在 engine.ts 里 runtime 推断，现改为预计算以便：
 * 1. 审计/前端过滤可以直接读取
 * 2. 新菜谱入库必须通过分类检查
 */
const fs = require('fs');
const path = require('path');
const { classify } = require('./lib/recipe-classifier');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const SOURCES = [
  'recipes-desserts-drinks.json',
  'recipes-quality-e.json', 'recipes-quality-d.json', 'recipes-quality-c.json',
  'recipes-quality-b.json', 'recipes-chinese-2.json', 'recipes-mega-3.json',
  'recipes-international.json', 'recipes-chinese-1.json',
  'recipes-hot-1.json', 'recipes-hot-2.json', 'recipes-hot-3.json',
  'recipes.json',
  'recipes-legacy.json',  // 老脚本产生的孤儿菜谱（最低优先级）
];

function run() {
  let totalRecipes = 0;
  let roleChanges = { unchanged: 0, added: 0, updated: 0 };
  let byRole = {};
  let byStaple = {};

  for (const file of SOURCES) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) continue;

    const recipes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let fileDelta = 0;

    for (const recipe of recipes) {
      totalRecipes++;
      const c = classify(recipe);

      const wasEmpty = !recipe.dishRole && !recipe.isVegetarian && !recipe.dishStyle;
      const changed = recipe.dishRole !== c.dishRole
        || recipe.isVegetarian !== c.isVegetarian
        || recipe.dishStyle !== c.dishStyle
        || recipe.stapleCategory !== c.stapleCategory;

      recipe.dishRole = c.dishRole;
      recipe.isVegetarian = c.isVegetarian;
      recipe.dishStyle = c.dishStyle;
      recipe.stapleCategory = c.stapleCategory;

      if (wasEmpty) roleChanges.added++;
      else if (changed) roleChanges.updated++;
      else roleChanges.unchanged++;

      byRole[c.dishRole] = (byRole[c.dishRole] || 0) + 1;
      if (c.stapleCategory) byStaple[c.stapleCategory] = (byStaple[c.stapleCategory] || 0) + 1;

      if (wasEmpty || changed) fileDelta++;
    }

    fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2));
    console.log(`✏  ${file.padEnd(32)} ${recipes.length} 道，本次变更 ${fileDelta}`);
  }

  console.log('\n========== 字段补齐结果 ==========');
  console.log(`扫描菜谱: ${totalRecipes}`);
  console.log(`新增字段: ${roleChanges.added}`);
  console.log(`更新字段: ${roleChanges.updated}`);
  console.log(`无变化:   ${roleChanges.unchanged}`);
  console.log('\n按 dishRole 分布:');
  for (const [r, c] of Object.entries(byRole).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${r.padEnd(12)} ${c}`);
  }
  console.log('\n主食细分 (stapleCategory):');
  for (const [s, c] of Object.entries(byStaple).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${s.padEnd(12)} ${c}`);
  }
}

run();
