/**
 * 自动核实异常菜谱 — 主要修 servings (份数偏低导致单份过大)
 *
 * 策略:
 *   - 单份热量目标: 350-700 kcal (正餐合理范围)
 *   - 若单份 >900 kcal, 尝试增加 servings, 直到落在 [400, 800] 区间
 *   - 仅在调整幅度 ≤ +4 份时自动应用 (避免荒谬的 1人份 → 10人份)
 *   - 调整失败的菜标记 dataIssue 字段供人工复核
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const ingredients = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const ingMap = new Map(ingredients.map(i => [i.id, i]));

// 与 calculator.ts 完全一致的算法
function toGrams(ri) {
  if (ri.unit === 'g' || ri.unit === 'ml') return ri.amount;
  const ing = ingMap.get(ri.ingredientId);
  if (ri.unit === 'piece') {
    if (ing?.category === 'seasoning' || ing?.category === 'oil') return ri.amount * 1;
    if (ing?.category === 'egg_dairy') return ri.amount * 50;
    if (ing?.category === 'vegetable') return ri.amount * 200;
    if (ing?.category === 'fruit') return ri.amount * 150;
    return ri.amount * 100;
  }
  if (ri.unit === 'tbsp') return ri.amount * 15;
  if (ri.unit === 'tsp') return ri.amount * 5;
  if (ri.unit === 'slice') return ri.amount * 30;
  if (ri.unit === 'bunch') return ri.amount * 200;
  if (ri.unit === 'pack') return ri.amount * 250;
  if (ri.unit === 'bottle') return ri.amount * 500;
  return ri.amount;
}
function consumedRatio(recipe, ing) {
  if (!ing) return 1;
  const m = recipe.cookingMethod;
  if (ing.category === 'oil') {
    if (m === 'deep_fry') return 0.12;
    if (m === 'roast' || m === 'staple') return 0.5;
  }
  if (ing.category === 'seasoning' && /soy|sauce|stock|wine|vinegar|broth|酱|抽|高汤|料酒|醋/i.test(ing.id + ing.nameEn)) {
    if (m === 'braise' || m === 'stew') return 0.5;
    if (m === 'soup') return 0.7;
  }
  if (ing.id === 'salt' && (m === 'braise' || m === 'stew')) return 0.5;
  return 1;
}
function calcTotalCal(recipe) {
  let cal = 0;
  for (const ri of recipe.ingredients) {
    const ing = ingMap.get(ri.ingredientId);
    if (!ing) continue;
    const g = toGrams(ri) * consumedRatio(recipe, ing);
    cal += ing.nutrition.calories * (g / 100);
  }
  return cal;
}

const FILES = [
  'recipes-all.json',
  'recipes.json', 'recipes-chinese-1.json', 'recipes-chinese-2.json',
  'recipes-international.json', 'recipes-hot-1.json', 'recipes-hot-2.json',
  'recipes-hot-3.json', 'recipes-mega-3.json', 'recipes-quality-b.json',
  'recipes-quality-c.json', 'recipes-quality-d.json', 'recipes-quality-e.json',
];

const TARGET_MIN = 350;
const TARGET_MAX = 800;
const HARD_HIGH = 900;
const HARD_LOW = 100;

let totalAdjusted = 0, totalFlagged = 0;
const adjustedSamples = [];
const flaggedSamples = [];

for (const file of FILES) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) continue;
  const recipes = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let fileAdjusted = 0;

  for (const r of recipes) {
    if (!r.ingredients || !r.servings) continue;
    const total = calcTotalCal(r);
    const ps = total / r.servings;

    // 单份过高 → 尝试增加 servings
    if (ps > HARD_HIGH) {
      let bestServ = r.servings;
      let bestPs = ps;
      for (let s = r.servings + 1; s <= r.servings + 4; s++) {
        const newPs = total / s;
        if (newPs >= TARGET_MIN && newPs <= TARGET_MAX) { bestServ = s; bestPs = newPs; break; }
        if (newPs < HARD_HIGH && Math.abs(newPs - 600) < Math.abs(bestPs - 600)) {
          bestServ = s; bestPs = newPs;
        }
      }
      if (bestServ !== r.servings && bestPs <= HARD_HIGH) {
        if (adjustedSamples.length < 10) {
          adjustedSamples.push(`${r.id}(${r.nameZh}): ${r.servings}→${bestServ}份, 单份 ${Math.round(ps)}→${Math.round(bestPs)}kcal`);
        }
        r.servings = bestServ;
        fileAdjusted++;
        totalAdjusted++;
      } else {
        // 调不下来 → 标记
        r.dataIssues = r.dataIssues || [];
        if (!r.dataIssues.includes('cal_too_high_per_serving')) r.dataIssues.push('cal_too_high_per_serving');
        if (flaggedSamples.length < 10) flaggedSamples.push(`${r.id}(${r.nameZh}) 单份${Math.round(ps)}kcal × ${r.servings}份 — 数据需复核`);
        totalFlagged++;
      }
    }
    // 单份过低 → 尝试减少 servings
    else if (ps < HARD_LOW && total > 200) {
      let bestServ = r.servings;
      let bestPs = ps;
      for (let s = r.servings - 1; s >= 1; s--) {
        const newPs = total / s;
        if (newPs >= TARGET_MIN && newPs <= TARGET_MAX) { bestServ = s; bestPs = newPs; break; }
        if (newPs >= HARD_LOW && Math.abs(newPs - 400) < Math.abs(bestPs - 400)) {
          bestServ = s; bestPs = newPs;
        }
      }
      if (bestServ !== r.servings && bestPs >= HARD_LOW) {
        if (adjustedSamples.length < 10) {
          adjustedSamples.push(`${r.id}(${r.nameZh}): ${r.servings}→${bestServ}份, 单份 ${Math.round(ps)}→${Math.round(bestPs)}kcal`);
        }
        r.servings = bestServ;
        fileAdjusted++;
        totalAdjusted++;
      }
    }
  }

  if (fileAdjusted > 0) {
    fs.writeFileSync(fp, JSON.stringify(recipes, null, 2));
    console.log(`✏  ${file}: 调整 ${fileAdjusted} 条 servings`);
  }
}

console.log(`\n✅ 自动调整 ${totalAdjusted} 条 servings`);
console.log(`📌 仍需人工复核 ${totalFlagged} 条 (已写入 dataIssues 字段)`);
console.log('\n— 调整示例:');
adjustedSamples.forEach(s => console.log('  ' + s));
console.log('\n— 复核示例:');
flaggedSamples.forEach(s => console.log('  ' + s));
