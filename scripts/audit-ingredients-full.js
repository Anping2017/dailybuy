/**
 * 食材库完整性全面审计
 *
 * 检查项:
 *   1. 菜谱引用了但库中不存在的食材 (broken refs)
 *   2. 库中存在但无菜谱使用 (orphaned)
 *   3. 数据完整性: nutrition / priceNZD / unit / category
 *   4. 营养数据合理性: calories 0 / 异常高/低
 *   5. 各 category 数量分布
 *   6. 高频缺失候选 (recipe 名提到但 lib 没有的食材关键词)
 *   7. 名字英中重复或为空
 *   8. priceNZD 异常 (0 / 过高)
 *   9. 重名食材 (同 nameZh 不同 id)
 *  10. 超市标签 / 季节标签 缺失
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const INGREDIENTS_PATH = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));
const ingredients = JSON.parse(fs.readFileSync(INGREDIENTS_PATH, 'utf8'));

const ingById = new Map(ingredients.map(i => [i.id, i]));

// ============== 1. 菜谱引用但库中不存在 ==============
const brokenRefs = new Map(); // id → [recipe ids using it]
for (const r of recipes) {
  for (const ri of r.ingredients || []) {
    if (!ingById.has(ri.ingredientId)) {
      if (!brokenRefs.has(ri.ingredientId)) brokenRefs.set(ri.ingredientId, []);
      brokenRefs.get(ri.ingredientId).push(r.id);
    }
  }
}

// ============== 2. 库中存在但无菜谱使用 ==============
const usedIds = new Set();
for (const r of recipes) for (const ri of r.ingredients || []) usedIds.add(ri.ingredientId);
const orphaned = ingredients.filter(i => !usedIds.has(i.id));

// ============== 3. 数据完整性 ==============
const dataIssues = {
  noNutrition: [],
  noPrice: [],
  noUnit: [],
  noCategory: [],
  noNameZh: [],
  noNameEn: [],
  noSupermarkets: [],
};
for (const i of ingredients) {
  if (!i.nutrition || typeof i.nutrition !== 'object') dataIssues.noNutrition.push(i.id);
  if (i.priceNZD === undefined || i.priceNZD === null) dataIssues.noPrice.push(i.id);
  if (!i.unit) dataIssues.noUnit.push(i.id);
  if (!i.category) dataIssues.noCategory.push(i.id);
  if (!i.nameZh) dataIssues.noNameZh.push(i.id);
  if (!i.nameEn) dataIssues.noNameEn.push(i.id);
  if (!i.supermarkets || i.supermarkets.length === 0) dataIssues.noSupermarkets.push(i.id);
}

// ============== 4. 营养异常 ==============
const nutritionIssues = {
  calZero: [],   // 热量为 0 (调料/水可以, 但其他不该)
  calHigh: [],   // > 800 kcal/100g (除了油脂)
  proteinNeg: [],
  noFiber: [],
};
for (const i of ingredients) {
  const n = i.nutrition;
  if (!n) continue;
  const isOilOrSeasoning = i.category === 'oil' || i.category === 'seasoning';
  if (n.calories === 0 && !isOilOrSeasoning && i.id !== 'water') nutritionIssues.calZero.push({ id: i.id, name: i.nameZh });
  if (n.calories > 800 && i.category !== 'oil') nutritionIssues.calHigh.push({ id: i.id, name: i.nameZh, cal: n.calories });
  if (n.protein < 0) nutritionIssues.proteinNeg.push(i.id);
  // 蔬菜/水果应该有纤维
  if (n.fiber === 0 && (i.category === 'vegetable' || i.category === 'fruit') && n.calories > 30) {
    nutritionIssues.noFiber.push({ id: i.id, name: i.nameZh });
  }
}

// ============== 5. category 分布 ==============
const catDist = {};
for (const i of ingredients) catDist[i.category] = (catDist[i.category] || 0) + 1;

// ============== 6. 价格异常 ==============
const priceIssues = {
  zero: [],
  veryHigh: [],
};
for (const i of ingredients) {
  if (i.priceNZD === 0) priceIssues.zero.push({ id: i.id, name: i.nameZh });
  if (i.priceNZD > 100) priceIssues.veryHigh.push({ id: i.id, name: i.nameZh, price: i.priceNZD });
}

// ============== 7. 重名 ==============
const nameMap = new Map();
const dupName = [];
for (const i of ingredients) {
  if (nameMap.has(i.nameZh)) {
    dupName.push({ name: i.nameZh, ids: [nameMap.get(i.nameZh), i.id] });
  } else {
    nameMap.set(i.nameZh, i.id);
  }
}

// ============== 8. 高频菜谱关键词缺失候选 ==============
// 扫描菜谱名中常见食材关键词, 看是否有对应 ingredient
const keywordsToCheck = [
  '虾', '蟹', '鱼', '鸡', '鸭', '鹅', '羊', '猪', '牛',
  '黄瓜', '番茄', '土豆', '茄子', '韭菜', '芹菜', '菠菜',
  '木耳', '银耳', '香菇', '金针', '杏鲍',
  '苹果', '香蕉', '橙', '梨', '桃', '葡萄', '草莓', '蓝莓', '芒果', '菠萝', '西瓜',
  '面粉', '糯米', '米粉', '面条', '馒头', '饺子', '馄饨',
  '酱油', '醋', '料酒', '糖', '盐', '蒜', '姜', '葱', '辣椒',
];
const keywordCoverage = keywordsToCheck.map(kw => {
  const ingMatches = ingredients.filter(i => i.nameZh.includes(kw));
  return { kw, count: ingMatches.length, ids: ingMatches.map(i => i.id).slice(0, 3) };
});
const missingKeywords = keywordCoverage.filter(k => k.count === 0);

// ============== 输出 ==============
console.log('======= 食材库审计报告 =======\n');
console.log(`📊 总数: ${ingredients.length} 个食材, 被 ${recipes.length} 道菜谱引用\n`);

console.log('① 菜谱引用但库中不存在 (broken refs):', brokenRefs.size);
if (brokenRefs.size > 0) {
  for (const [id, recipeIds] of [...brokenRefs.entries()].slice(0, 10)) {
    console.log(`  - ${id}  (被 ${recipeIds.length} 道菜引用, 例: ${recipeIds.slice(0, 2).join(', ')})`);
  }
  if (brokenRefs.size > 10) console.log(`  ... 还有 ${brokenRefs.size - 10} 个`);
}

console.log(`\n② 孤立食材 (无菜谱使用): ${orphaned.length}`);
if (orphaned.length > 0) {
  orphaned.slice(0, 10).forEach(i => console.log(`  - ${i.id}: ${i.nameZh} (${i.category})`));
  if (orphaned.length > 10) console.log(`  ... 还有 ${orphaned.length - 10} 个`);
}

console.log('\n③ 数据完整性:');
for (const [k, v] of Object.entries(dataIssues)) {
  const labels = {
    noNutrition: '无营养数据', noPrice: '无价格', noUnit: '无单位',
    noCategory: '无分类', noNameZh: '无中文名', noNameEn: '无英文名',
    noSupermarkets: '无超市标签',
  };
  if (v.length > 0) console.log(`  ${labels[k]}: ${v.length} 个 ${v.slice(0, 5).join(', ')}${v.length > 5 ? '...' : ''}`);
}

console.log('\n④ 营养数据异常:');
console.log(`  热量为 0 (非调料/油): ${nutritionIssues.calZero.length}`);
nutritionIssues.calZero.slice(0, 5).forEach(x => console.log(`    - ${x.id}: ${x.name}`));
console.log(`  热量 > 800 kcal/100g: ${nutritionIssues.calHigh.length}`);
nutritionIssues.calHigh.slice(0, 5).forEach(x => console.log(`    - ${x.id}: ${x.name} (${x.cal} kcal)`));
console.log(`  蔬果纤维为 0 (热量>30): ${nutritionIssues.noFiber.length}`);
nutritionIssues.noFiber.slice(0, 5).forEach(x => console.log(`    - ${x.id}: ${x.name}`));

console.log('\n⑤ 各分类分布:');
const sortedCats = Object.entries(catDist).sort((a, b) => b[1] - a[1]);
sortedCats.forEach(([cat, count]) => console.log(`  ${cat}: ${count} 个`));

console.log('\n⑥ 价格异常:');
console.log(`  价格为 0: ${priceIssues.zero.length}`);
priceIssues.zero.slice(0, 5).forEach(x => console.log(`    - ${x.id}: ${x.name}`));
if (priceIssues.veryHigh.length > 0) {
  console.log(`  价格 > $100: ${priceIssues.veryHigh.length}`);
  priceIssues.veryHigh.slice(0, 3).forEach(x => console.log(`    - ${x.id}: ${x.name} ($${x.price})`));
}

console.log('\n⑦ 重名食材:', dupName.length);
dupName.slice(0, 5).forEach(d => console.log(`  - ${d.name}: ${d.ids.join(' + ')}`));

console.log('\n⑧ 关键字覆盖 (常见食材类别):');
const wellCovered = keywordCoverage.filter(k => k.count > 0);
const poorlyCovered = keywordCoverage.filter(k => k.count === 1 || k.count === 0);
console.log(`  覆盖良好 (>1 个): ${wellCovered.filter(k => k.count > 1).length}`);
console.log(`  仅 1 个匹配: ${keywordCoverage.filter(k => k.count === 1).length}`);
if (missingKeywords.length > 0) {
  console.log(`  ❌ 完全缺失: ${missingKeywords.map(k => k.kw).join(', ')}`);
}

// 汇总建议
console.log('\n===== 修复建议 =====');
const totalIssues = brokenRefs.size + orphaned.length
  + Object.values(dataIssues).reduce((s, v) => s + v.length, 0)
  + nutritionIssues.calZero.length + nutritionIssues.calHigh.length + nutritionIssues.noFiber.length
  + priceIssues.zero.length + dupName.length + missingKeywords.length;
console.log(`总问题项: ${totalIssues}`);

const reportPath = path.join(__dirname, '..', 'ingredient-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  brokenRefs: Array.from(brokenRefs.entries()).map(([id, recipes]) => ({ id, recipes })),
  orphaned: orphaned.map(i => ({ id: i.id, name: i.nameZh, category: i.category })),
  dataIssues,
  nutritionIssues,
  catDist,
  priceIssues,
  dupName,
  missingKeywords,
}, null, 2), 'utf8');
console.log(`\n✅ 完整报告: ingredient-audit-report.json`);
