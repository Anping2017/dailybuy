/**
 * 审计菜谱数据完整性 + 分布
 * 找出: 字段缺失/标签不全的菜, 各维度分布(看看是否某些维度的菜偏少)
 */
const fs = require('fs');
const path = require('path');

const recipes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'recipes-all.json'), 'utf8'));
const ingredients = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'ingredients.json'), 'utf8'));
const ingMap = new Map(ingredients.map(i => [i.id, i]));

console.log(`总菜谱数: ${recipes.length}\n`);

// ======== 1. 字段缺失检查 ========
console.log('===== 1. 字段缺失/不全 =====');
const missing = {
  cookingMethod: [],
  mealTypes: [],
  flavors: [],
  difficulty: [],
  minCookingLevel: [],
  ingredients: [],
  steps: [],
  servings: [],
  cuisine: [],
  regionalCuisine: [],
};
for (const r of recipes) {
  if (!r.cookingMethod) missing.cookingMethod.push(r.nameZh);
  if (!r.mealTypes || r.mealTypes.length === 0) missing.mealTypes.push(r.nameZh);
  if (!r.flavors || r.flavors.length === 0) missing.flavors.push(r.nameZh);
  if (!r.difficulty) missing.difficulty.push(r.nameZh);
  if (!r.minCookingLevel) missing.minCookingLevel.push(r.nameZh);
  if (!r.ingredients || r.ingredients.length === 0) missing.ingredients.push(r.nameZh);
  if (!r.steps || r.steps.length === 0) missing.steps.push(r.nameZh);
  if (!r.servings) missing.servings.push(r.nameZh);
  if (!r.cuisine) missing.cuisine.push(r.nameZh);
  if (!r.regionalCuisine) missing.regionalCuisine.push(r.nameZh);
}
for (const [field, list] of Object.entries(missing)) {
  if (list.length > 0) console.log(`  缺 ${field}: ${list.length} 道${list.length <= 5 ? ` (${list.join(', ')})` : ''}`);
}

// ======== 2. status 分布 ========
console.log('\n===== 2. status 分布 =====');
const statusCount = {};
for (const r of recipes) {
  const s = r.status || 'no_status';
  statusCount[s] = (statusCount[s] || 0) + 1;
}
console.log(' ', statusCount, '\n  注: 推荐引擎 getReviewedRecipes 只返回 status=reviewed 或没有 status');

// ======== 3. 餐次分布 ========
console.log('\n===== 3. 餐次覆盖 =====');
const mealCount = { breakfast: 0, lunch: 0, dinner: 0, none: 0 };
for (const r of recipes) {
  if (!r.mealTypes || r.mealTypes.length === 0) { mealCount.none++; continue; }
  for (const m of r.mealTypes) mealCount[m] = (mealCount[m] || 0) + 1;
}
console.log(' ', mealCount);

// ======== 4. 菜系/地域分布 ========
console.log('\n===== 4. 菜系分布 =====');
const cuisineCount = {};
const regionalCount = {};
for (const r of recipes) {
  cuisineCount[r.cuisine || 'none'] = (cuisineCount[r.cuisine || 'none'] || 0) + 1;
  regionalCount[r.regionalCuisine || 'none'] = (regionalCount[r.regionalCuisine || 'none'] || 0) + 1;
}
console.log('  cuisine:', cuisineCount);
console.log('  regional:', regionalCount);

// ======== 5. 做法分布 ========
console.log('\n===== 5. 做法(cookingMethod)分布 =====');
const methodCount = {};
for (const r of recipes) {
  methodCount[r.cookingMethod || 'none'] = (methodCount[r.cookingMethod || 'none'] || 0) + 1;
}
console.log(' ', methodCount);

// ======== 6. 口味分布 ========
console.log('\n===== 6. 口味标签分布 =====');
const flavorCount = {};
for (const r of recipes) {
  for (const f of (r.flavors || [])) flavorCount[f] = (flavorCount[f] || 0) + 1;
}
console.log(' ', flavorCount);

// ======== 7. 角色推断分布(模拟 inferRole) ========
const STAPLE_RE = /粥|饭|面|饼|包|馒头|饺|馄饨|抄手|米线|河粉|烩饭|盖饭|炒饭|拌面|凉面|寿司|意面|意大利面|乌冬|拉面|肠粉|粉丝|米粉|汉堡|三明治|吐司|薯条|馕|花卷|烧麦|凉皮|凉粉/;
const BEV_RE = /(?<!汤|羹)(茶$|奶茶|果汁|柠檬水|咖啡|拿铁|卡布奇诺|摩卡|奶昔|思慕雪|气泡水|苏打|可乐|柚子蜜|蜂蜜水|姜茶|柠水)/;
function inferRole(r) {
  if (BEV_RE.test(r.nameZh) && !/汤|羹/.test(r.nameZh)) return 'drink';
  if (r.cookingMethod === 'staple' || STAPLE_RE.test(r.nameZh)) return 'staple';
  if (r.cookingMethod === 'soup') return 'soup';
  if (r.cookingMethod === 'cold_dish') return 'cold';
  const meatCats = new Set(['meat', 'seafood']);
  const isMeat = (r.ingredients || []).some(ri => {
    const ing = ingMap.get(ri.ingredientId);
    return ing && meatCats.has(ing.category);
  });
  return isMeat ? 'main_meat' : 'main_veg';
}
console.log('\n===== 7. 角色分布(inferRole) =====');
const roleCount = { main_meat: 0, main_veg: 0, soup: 0, staple: 0, cold: 0, drink: 0 };
for (const r of recipes) {
  roleCount[inferRole(r)]++;
}
console.log(' ', roleCount);

// ======== 8. 总热量分布(找低卡菜分布) ========
console.log('\n===== 8. 热量分布(低卡菜数量) =====');
const calBuckets = { '<200': 0, '200-400': 0, '400-600': 0, '600-1000': 0, '>1000': 0, unknown: 0 };
for (const r of recipes) {
  let total = 0;
  if (r.ingredients) {
    for (const ri of r.ingredients) {
      const ing = ingMap.get(ri.ingredientId);
      if (ing && ing.nutrition) {
        total += (ing.nutrition.calories / 100) * ri.amount;
      }
    }
  }
  if (total === 0) calBuckets.unknown++;
  else if (total < 200) calBuckets['<200']++;
  else if (total < 400) calBuckets['200-400']++;
  else if (total < 600) calBuckets['400-600']++;
  else if (total < 1000) calBuckets['600-1000']++;
  else calBuckets['>1000']++;
}
console.log(' ', calBuckets);

// ======== 9. 模拟用户筛选: 不辣 + 不海鲜 + 简单/中等难度 ========
console.log('\n===== 9. 模拟用户限制(不辣+不海鲜+不困难) =====');
const blockedIngs = new Set(['doubanjiang','chili_pepper','chili_flakes','sichuan_pepper','curry_paste','kimchi','dried_shrimp','fish_sauce']);
const blockedCats = new Set(['seafood']);
let pass = 0;
const passing = [];
for (const r of recipes) {
  if (r.difficulty === 'hard') continue;
  if (!r.flavors || !r.mealTypes) continue;
  const hasBlockedIng = (r.ingredients || []).some(ri => {
    const ing = ingMap.get(ri.ingredientId);
    return blockedIngs.has(ri.ingredientId) || (ing && blockedCats.has(ing.category));
  });
  if (hasBlockedIng) continue;
  pass++;
  if (passing.length < 5) passing.push(r.nameZh);
}
console.log(`  通过筛选: ${pass} 道 (示例: ${passing.join(', ')})`);

// ======== 10. 没有 flavor 标签的菜 ========
const noFlavor = recipes.filter(r => !r.flavors || r.flavors.length === 0);
if (noFlavor.length > 0) {
  console.log(`\n===== 10. 没有 flavor 标签的菜: ${noFlavor.length} 道 =====`);
  console.log('  ' + noFlavor.slice(0, 10).map(r => r.nameZh).join(', ') + (noFlavor.length > 10 ? ` ... 等${noFlavor.length}道` : ''));
}

// ======== 11. 中餐家常菜+午晚 (最常见的过滤场景) ========
console.log('\n===== 11. 中餐+午晚餐 可推荐池 =====');
const lunchPool = recipes.filter(r =>
  r.cuisine === 'chinese' &&
  r.mealTypes && (r.mealTypes.includes('lunch') || r.mealTypes.includes('dinner'))
);
console.log(`  总数 ${lunchPool.length}`);
const lunchByRegion = {};
for (const r of lunchPool) {
  lunchByRegion[r.regionalCuisine || 'none'] = (lunchByRegion[r.regionalCuisine || 'none'] || 0) + 1;
}
console.log('  按地域:', lunchByRegion);

const lunchByRole = { main_meat: 0, main_veg: 0, soup: 0, staple: 0, cold: 0, drink: 0 };
for (const r of lunchPool) {
  lunchByRole[inferRole(r)]++;
}
console.log('  按角色:', lunchByRole);
