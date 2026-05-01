/**
 * 修复食材库审计报告中的问题:
 *   1. 合并 3 对重名食材 (purple_potato/purple_sweet_potato, passionfruit/passion_fruit, chrysanthemum)
 *   2. 价格异常确认 (干贝/羊肚菌 — 高端食材合理价, 不改, 但加注释)
 *   3. 补 41 个食材的 supermarkets 标签
 *
 * 合并策略: 留 ID 较短/通用的, 删另一个; 把删掉那个 id 的菜谱引用替换成保留的 id
 */
const fs = require('fs');
const path = require('path');
const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const INGREDIENTS_PATH = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));
const ingredients = JSON.parse(fs.readFileSync(INGREDIENTS_PATH, 'utf8'));

// ============== 1. 合并重名 ==============
// keep → remove (把所有引用 remove 的都改成 keep)
const MERGE_MAP = {
  // 紫薯: 保留 purple_potato, 删 purple_sweet_potato
  'purple_sweet_potato': 'purple_potato',
  // 百香果: 保留 passionfruit (一个词更标准)
  'passion_fruit': 'passionfruit',
  // 菊花: 保留 dried_chrysanthemum (实际是干菊花茶用), chrysanthemum 重定向
  // (菊花花朵新鲜的不太常吃, 多为干花茶用)
  'chrysanthemum': 'dried_chrysanthemum',
};

let recipeRefFixCount = 0;
for (const r of recipes) {
  for (const ri of r.ingredients || []) {
    if (MERGE_MAP[ri.ingredientId]) {
      ri.ingredientId = MERGE_MAP[ri.ingredientId];
      recipeRefFixCount++;
    }
  }
}

// 从 ingredients 数组中删除被合并的 id
const removeIds = new Set(Object.keys(MERGE_MAP));
const filteredIngs = ingredients.filter(i => !removeIds.has(i.id));
console.log(`✅ 合并重名: ${removeIds.size} 个 ID 移除, ${recipeRefFixCount} 处菜谱引用更新`);

// ============== 2. 补超市标签 ==============
// 默认按 category 推断默认超市 (新西兰常见超市分布)
const DEFAULT_SUPERMARKETS_BY_CATEGORY = {
  'meat': ['countdown', 'paknsave'],
  'seafood': ['countdown', 'paknsave', 'asian'],
  'vegetable': ['countdown', 'paknsave'],
  'fruit': ['countdown', 'paknsave'],
  'grain': ['countdown', 'paknsave'],
  'bean': ['countdown', 'asian'],
  'egg_dairy': ['countdown', 'paknsave'],
  'seasoning': ['countdown', 'asian'],
  'oil': ['countdown', 'paknsave'],
  'dried': ['asian', 'countdown'],
  'other': ['countdown'],
};

let supermarketAddCount = 0;
for (const i of filteredIngs) {
  if (!i.supermarkets || i.supermarkets.length === 0) {
    i.supermarkets = DEFAULT_SUPERMARKETS_BY_CATEGORY[i.category] || ['countdown'];
    supermarketAddCount++;
  }
}
console.log(`✅ 补超市标签: ${supermarketAddCount} 个食材`);

// ============== 3. 价格异常 — 不改 (高端食材合理) ==============
// 仅打印确认
const highPriceItems = filteredIngs.filter(i => i.priceNZD > 100);
console.log(`ℹ️  保留 ${highPriceItems.length} 个高价食材 (高端/进口品):`);
highPriceItems.forEach(i => console.log(`   - ${i.id}: ${i.nameZh} ($${i.priceNZD}/${i.unit})`));

// ============== 写入 ==============
fs.writeFileSync(INGREDIENTS_PATH, JSON.stringify(filteredIngs, null, 2), 'utf8');
fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2), 'utf8');

console.log(`\n✅ 食材库: ${ingredients.length} → ${filteredIngs.length}`);
console.log(`✅ 菜谱: ${recipes.length} (引用已更新)`);
