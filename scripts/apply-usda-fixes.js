/**
 * 把食材营养值按 USDA FoodData Central 校准
 * 读 verify-nutrition-usda.js 的参考表并应用到 ingredients.json
 * 只覆盖 nutrition 字段,不动 allergens/warnings/highlights/season 等
 */
const fs = require('fs');
const path = require('path');

// 重新引入 USDA 表 (从验证脚本导出)
const verifyScript = fs.readFileSync(path.join(__dirname, 'verify-nutrition-usda.js'), 'utf8');
// 抽取 USDA 对象(粗暴但有效)
const match = verifyScript.match(/const USDA = (\{[\s\S]+?\n\});/);
if (!match) throw new Error('无法从 verify-nutrition-usda.js 抽取 USDA 参考表');
const USDA = eval('(' + match[1] + ')');

const INGREDIENTS_PATH = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const ingredients = JSON.parse(fs.readFileSync(INGREDIENTS_PATH, 'utf8'));

let applied = 0;
const changes = [];

for (const ing of ingredients) {
  const ref = USDA[ing.id];
  if (!ref) continue;
  const old = ing.nutrition;
  const needsUpdate = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sodium', 'sugar']
    .some(k => Math.abs((old[k] || 0) - ref[k]) / Math.max(ref[k], 1) > 0.10);
  if (!needsUpdate) continue;

  const next = {
    calories: ref.calories,
    protein: ref.protein,
    fat: ref.fat,
    carbs: ref.carbs,
    fiber: ref.fiber,
    sodium: ref.sodium,
    sugar: ref.sugar,
  };
  changes.push({ id: ing.id, name: ing.nameZh, before: { cal: old.calories, prot: old.protein, fat: old.fat, na: old.sodium }, after: { cal: next.calories, prot: next.protein, fat: next.fat, na: next.sodium } });
  ing.nutrition = next;
  applied++;
}

fs.writeFileSync(INGREDIENTS_PATH, JSON.stringify(ingredients, null, 2) + '\n', 'utf8');

console.log(`✅ 已按 USDA 校正 ${applied} 个食材\n`);
console.log('— 样本(前 20):');
changes.slice(0, 20).forEach(c => {
  console.log(`  ${c.id}(${c.name}): ${c.before.cal}→${c.after.cal}kcal | 蛋白 ${c.before.prot}→${c.after.prot}g | 脂肪 ${c.before.fat}→${c.after.fat}g | 钠 ${c.before.na}→${c.after.na}mg`);
});
