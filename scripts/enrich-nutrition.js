/**
 * 为所有菜谱预计算每份营养 + 警告/亮点标签
 *
 * 写入字段:
 *   - perServing: { calories, protein, fat, carbs, fiber, sodium, sugar }
 *   - nutritionWarnings: ['high_sodium' | 'high_sugar' | 'high_fat' | 'high_calorie' | 'high_carb' | ...]
 *   - nutritionHighlights: ['high_protein' | 'high_fiber' | 'low_calorie' | ...]
 *   - nutritionAllergens: ['allergen_dairy' | ...] — 聚合自食材的 allergens
 *   - nutritionFlags: ['high_purine' | 'processed' | 'contains_alcohol'] — 聚合自食材的 warnings
 */
const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const ingredients = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const ingMap = new Map(ingredients.map(i => [i.id, i]));

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
  if (ri.unit === 'pack') return ri.amount * 250;
  if (ri.unit === 'bunch') return ri.amount * 200;
  if (ri.unit === 'slice') return ri.amount * 30;
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

// ============================================================
// 每份警告阈值(基于 1 餐的合理上限)
// ============================================================
const PER_SERVING_THRESHOLDS = {
  // 热量
  high_calorie: { field: 'calories', op: '>=', value: 800 },     // 单餐过高
  low_calorie: { field: 'calories', op: '<=', value: 200 },      // 仅作零食/配菜
  // 钠
  high_sodium: { field: 'sodium', op: '>=', value: 800 },         // WHO 建议 <2000mg/日,单餐 ≤666mg 理想
  // 糖
  high_sugar: { field: 'sugar', op: '>=', value: 20 },             // 糖尿病单餐警戒
  // 脂肪
  high_fat: { field: 'fat', op: '>=', value: 35 },                // 占总热量 ~40%
  // 碳水
  high_carb: { field: 'carbs', op: '>=', value: 75 },             // 糖尿病警戒
  // 蛋白(亮点)
  high_protein: { field: 'protein', op: '>=', value: 25 },        // 健身/营养充足
};

const HIGHLIGHT_THRESHOLDS = {
  high_protein: { field: 'protein', op: '>=', value: 25 },
  high_fiber: { field: 'fiber', op: '>=', value: 6 },
  low_fat: { field: 'fat', op: '<=', value: 10 },
  low_calorie: { field: 'calories', op: '<=', value: 250 },
};

function checkThreshold(t, ps) {
  const v = ps[t.field];
  if (t.op === '>=') return v >= t.value;
  if (t.op === '<=') return v <= t.value;
  return false;
}

function calcPerServing(recipe) {
  const t = { calories:0, protein:0, fat:0, carbs:0, fiber:0, sodium:0, sugar:0 };
  for (const ri of recipe.ingredients) {
    const ing = ingMap.get(ri.ingredientId);
    if (!ing) continue;
    const g = toGrams(ri) * consumedRatio(recipe, ing);
    const r = g / 100;
    t.calories += ing.nutrition.calories * r;
    t.protein += ing.nutrition.protein * r;
    t.fat += ing.nutrition.fat * r;
    t.carbs += ing.nutrition.carbs * r;
    t.fiber += ing.nutrition.fiber * r;
    t.sodium += ing.nutrition.sodium * r;
    t.sugar += ing.nutrition.sugar * r;
  }
  const s = recipe.servings || 1;
  return {
    calories: Math.round(t.calories / s),
    protein: Math.round(t.protein / s * 10) / 10,
    fat: Math.round(t.fat / s * 10) / 10,
    carbs: Math.round(t.carbs / s * 10) / 10,
    fiber: Math.round(t.fiber / s * 10) / 10,
    sodium: Math.round(t.sodium / s),
    sugar: Math.round(t.sugar / s * 10) / 10,
  };
}

function aggregateIngredientFlags(recipe) {
  const allergens = new Set();
  const flags = new Set();   // warnings 类: high_purine / processed / contains_alcohol / high_cholesterol
  const ingHighlights = new Set();

  for (const ri of recipe.ingredients) {
    const ing = ingMap.get(ri.ingredientId);
    if (!ing) continue;
    (ing.allergens || []).forEach(a => allergens.add(a));
    (ing.warnings || []).forEach(w => {
      // 食材级 high_sodium/sugar/fat/gi 我们用 perServing 重算; 其他保留
      if (!['high_sodium', 'high_sugar', 'high_fat', 'high_gi'].includes(w)) flags.add(w);
    });
    (ing.highlights || []).forEach(h => ingHighlights.add(h));
  }
  return {
    allergens: [...allergens].sort(),
    flags: [...flags].sort(),
    ingredientHighlights: [...ingHighlights].sort(),
  };
}

const FILES = [
  'recipes-all.json',
  'recipes.json', 'recipes-chinese-1.json', 'recipes-chinese-2.json',
  'recipes-international.json', 'recipes-hot-1.json', 'recipes-hot-2.json',
  'recipes-hot-3.json', 'recipes-mega-3.json', 'recipes-quality-b.json',
  'recipes-quality-c.json', 'recipes-quality-d.json', 'recipes-quality-e.json',
];

let totalProcessed = 0;
const stats = { warningCounts: {}, highlightCounts: {}, allergenCounts: {} };

for (const file of FILES) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) continue;
  const recipes = JSON.parse(fs.readFileSync(fp, 'utf8'));
  for (const r of recipes) {
    if (!r.ingredients || !r.servings) continue;
    const ps = calcPerServing(r);
    r.perServing = ps;

    // 营养警告
    const warnings = [];
    for (const [name, t] of Object.entries(PER_SERVING_THRESHOLDS)) {
      if (name === 'high_protein' || name === 'low_calorie') continue; // 这些是亮点
      if (checkThreshold(t, ps)) warnings.push(name);
    }
    r.nutritionWarnings = warnings;

    // 营养亮点
    const highlights = [];
    for (const [name, t] of Object.entries(HIGHLIGHT_THRESHOLDS)) {
      if (checkThreshold(t, ps)) highlights.push(name);
    }
    r.nutritionHighlights = highlights;

    // 聚合食材级 flags
    const agg = aggregateIngredientFlags(r);
    r.allergens = agg.allergens;             // 过敏原(聚合食材)
    r.dietaryFlags = agg.flags;              // 高嘌呤/加工/酒精/胆固醇 (聚合食材)
    // 把食材亮点合并进菜谱亮点
    agg.ingredientHighlights.forEach(h => { if (!highlights.includes(h)) r.nutritionHighlights.push(h); });

    // 统计
    warnings.forEach(w => stats.warningCounts[w] = (stats.warningCounts[w]||0)+1);
    r.nutritionHighlights.forEach(h => stats.highlightCounts[h] = (stats.highlightCounts[h]||0)+1);
    agg.allergens.forEach(a => stats.allergenCounts[a] = (stats.allergenCounts[a]||0)+1);

    totalProcessed++;
  }
  fs.writeFileSync(fp, JSON.stringify(recipes, null, 2));
  console.log(`✏  ${file}: ${recipes.length} 条已富集`);
}

console.log(`\n✅ 共富集 ${totalProcessed} 条菜谱`);
console.log('\n营养警告分布:');
Object.entries(stats.warningCounts).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log('  ' + k.padEnd(15) + v));
console.log('\n营养亮点分布:');
Object.entries(stats.highlightCounts).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log('  ' + k.padEnd(15) + v));
console.log('\n过敏原分布:');
Object.entries(stats.allergenCounts).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log('  ' + k.padEnd(20) + v));
