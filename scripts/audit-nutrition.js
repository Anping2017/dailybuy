/**
 * 营养数据全量审计 — 三个维度并行扫描
 * A. 食材营养数据质量(Atwater 系数核验、极端值)
 * B. 菜谱数据完整性(食材引用、用量、份数)
 * C. 营养学评估(每份热量/蛋白/脂肪/钠/糖,与膳食指南对照)
 */
const fs = require('fs');
const path = require('path');

const ingredients = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src/data/ingredients.json'), 'utf8'));
const recipes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src/data/recipes-all.json'), 'utf8'));
const ingMap = new Map(ingredients.map(i => [i.id, i]));

// ============================================================
// 单位换算 (与 calculator.ts 一致)
// ============================================================
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

function calcRecipeNutr(recipe) {
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
  return t;
}

// ============================================================
// 三个并行扫描器
// ============================================================
async function scanAll() {
  const [A, B, C] = await Promise.all([
    Promise.resolve().then(() => scanIngredientQuality()),
    Promise.resolve().then(() => scanRecipeIntegrity()),
    Promise.resolve().then(() => scanNutritionExpert()),
  ]);
  return { A, B, C };
}

// === A. 食材营养数据质量 ===
function scanIngredientQuality() {
  const issues = [];
  const stats = { total: ingredients.length, atwaterOff: 0, extremeValues: 0, missingFields: 0, suspiciousZero: 0 };

  for (const ing of ingredients) {
    const n = ing.nutrition;
    if (!n) { issues.push({ id: ing.id, type: 'missing_nutrition' }); stats.missingFields++; continue; }

    // Atwater 一致性: |标注cal - (4P + 4C + 9F)| / cal > 35% (放宽以容忍纤维、酒精、香料)
    const calc = n.protein*4 + n.carbs*4 + n.fat*9;
    if (n.calories > 50 && calc > 0) {
      const dev = Math.abs(calc - n.calories) / n.calories;
      // 排除已知合理偏差类(高纤维蔬菜、含酒精料酒、香料)
      const isHighFiber = n.fiber >= 10;
      const hasAlcohol = (ing.warnings||[]).includes('contains_alcohol');
      const isSpice = ing.category === 'seasoning' && /pepper|spice|香料|花椒|八角|肉桂|孜然|香叶|百里香|迷迭香|chili_flake/.test(ing.id+ing.nameEn);
      if (dev > 0.35 && !isHighFiber && !hasAlcohol && !isSpice) {
        issues.push({ id: ing.id, name: ing.nameZh, type: 'atwater_off', stated: n.calories, calc: Math.round(calc), dev: (dev*100).toFixed(0)+'%' });
        stats.atwaterOff++;
      }
    }

    // 极端值
    if (n.calories > 900) { issues.push({ id: ing.id, name: ing.nameZh, type: 'cal_too_high', value: n.calories }); stats.extremeValues++; }
    if (n.protein > 90) { issues.push({ id: ing.id, name: ing.nameZh, type: 'protein_too_high', value: n.protein }); stats.extremeValues++; }
    if (n.fat > 100) { issues.push({ id: ing.id, name: ing.nameZh, type: 'fat_too_high', value: n.fat }); stats.extremeValues++; }
    if (n.sodium > 50000) { issues.push({ id: ing.id, name: ing.nameZh, type: 'sodium_too_high', value: n.sodium }); stats.extremeValues++; }
    if (n.sugar > 100) { issues.push({ id: ing.id, name: ing.nameZh, type: 'sugar_too_high', value: n.sugar }); stats.extremeValues++; }

    // 可疑零值: 肉类却 0 蛋白
    if (ing.category === 'meat' && n.protein === 0) { issues.push({ id: ing.id, name: ing.nameZh, type: 'meat_zero_protein' }); stats.suspiciousZero++; }
    if (ing.category === 'seafood' && n.protein === 0) { issues.push({ id: ing.id, name: ing.nameZh, type: 'seafood_zero_protein' }); stats.suspiciousZero++; }
    if (ing.category === 'fruit' && n.calories === 0) { issues.push({ id: ing.id, name: ing.nameZh, type: 'fruit_zero_cal' }); stats.suspiciousZero++; }
  }

  return { stats, issues };
}

// === B. 菜谱数据完整性 ===
function scanRecipeIntegrity() {
  const issues = [];
  const stats = { total: recipes.length, missingIngs: 0, badAmount: 0, dupeIds: 0, badServings: 0, emptyFields: 0, unitMismatch: 0 };
  const seenIds = new Set();
  const dupeIds = [];

  for (const r of recipes) {
    if (seenIds.has(r.id)) { dupeIds.push(r.id); stats.dupeIds++; }
    seenIds.add(r.id);

    if (!r.ingredients || r.ingredients.length === 0) { issues.push({ id: r.id, type: 'no_ingredients' }); stats.emptyFields++; continue; }
    if (!r.steps || r.steps.length === 0) { issues.push({ id: r.id, type: 'no_steps' }); stats.emptyFields++; }
    if (!r.servings || r.servings < 1 || r.servings > 20) { issues.push({ id: r.id, type: 'bad_servings', value: r.servings }); stats.badServings++; }

    const missing = [];
    for (const ri of r.ingredients) {
      const ing = ingMap.get(ri.ingredientId);
      if (!ing) { missing.push(ri.ingredientId); continue; }

      // 用量异常
      const g = toGrams(ri);
      if (g <= 0) { issues.push({ id: r.id, type: 'zero_amount', ing: ri.ingredientId }); stats.badAmount++; }
      // 调味料用量过大
      if ((ing.category === 'seasoning' || ing.category === 'oil') && g > 200) {
        issues.push({ id: r.id, name: r.nameZh, type: 'seasoning_too_much', ing: ri.ingredientId, grams: g });
        stats.badAmount++;
      }
      // 单菜单种食材 > 2000g
      if (g > 2000) {
        issues.push({ id: r.id, name: r.nameZh, type: 'amount_too_huge', ing: ri.ingredientId, grams: g });
        stats.badAmount++;
      }
      // 单位类型不匹配 (如 piece 用于 seasoning/oil)
      if ((ing.category === 'seasoning' || ing.category === 'oil') && ri.unit === 'piece') {
        issues.push({ id: r.id, type: 'unit_mismatch', ing: ri.ingredientId, unit: ri.unit });
        stats.unitMismatch++;
      }
    }
    if (missing.length) { issues.push({ id: r.id, name: r.nameZh, type: 'missing_ingredient', missing }); stats.missingIngs += missing.length; }
  }

  return { stats, issues, dupeIds };
}

// === C. 营养学评估 ===
function scanNutritionExpert() {
  const issues = [];
  const dist = { perServingCal: [], perServingNa: [], perServingFat: [], perServingProtein: [], macroRatios: [] };
  const stats = {
    total: recipes.length,
    calLow: 0, calHigh: 0,
    naHigh: 0,         // 单餐 >1500mg 钠
    fatHigh: 0,        // 单餐 >50g 脂肪
    proteinExtreme: 0,
    macroImbalanced: 0,
  };

  // WHO/中国膳食指南参考
  // - 一餐合理热量: 400-900 kcal
  // - 钠 < 2000mg/日 → 单餐 < 666mg 理想, < 1500mg 警戒
  // - 脂肪 25-30% 总热量,极不超过 35%
  // - 蛋白 10-35% 总热量

  for (const r of recipes) {
    if (!r.ingredients || !r.servings) continue;
    const total = calcRecipeNutr(r);
    const ps = {
      cal: total.calories / r.servings,
      protein: total.protein / r.servings,
      fat: total.fat / r.servings,
      carbs: total.carbs / r.servings,
      sodium: total.sodium / r.servings,
      sugar: total.sugar / r.servings,
    };

    dist.perServingCal.push(ps.cal);
    dist.perServingNa.push(ps.sodium);
    dist.perServingFat.push(ps.fat);
    dist.perServingProtein.push(ps.protein);

    // 热量异常
    if (ps.cal < 50) { issues.push({ id: r.id, name: r.nameZh, type: 'cal_too_low', perServing: Math.round(ps.cal), servings: r.servings }); stats.calLow++; }
    else if (ps.cal > 1200) { issues.push({ id: r.id, name: r.nameZh, type: 'cal_too_high', perServing: Math.round(ps.cal), servings: r.servings }); stats.calHigh++; }

    // 钠超标
    if (ps.sodium > 1500) { issues.push({ id: r.id, name: r.nameZh, type: 'sodium_high', perServing: Math.round(ps.sodium), dailyPercent: (ps.sodium/2000*100).toFixed(0)+'%' }); stats.naHigh++; }

    // 脂肪过多
    if (ps.fat > 50) { issues.push({ id: r.id, name: r.nameZh, type: 'fat_high', perServing: ps.fat.toFixed(1)+'g', percentOfCal: ((ps.fat*9)/ps.cal*100).toFixed(0)+'%' }); stats.fatHigh++; }

    // 蛋白极端
    if (ps.protein > 80) { issues.push({ id: r.id, name: r.nameZh, type: 'protein_extreme', perServing: ps.protein.toFixed(1)+'g' }); stats.proteinExtreme++; }
    if (ps.protein < 3 && ps.cal > 200) { issues.push({ id: r.id, name: r.nameZh, type: 'protein_too_low', perServing: ps.protein.toFixed(1)+'g', cal: Math.round(ps.cal) }); }

    // 宏量比例
    if (ps.cal > 100) {
      const pPct = (ps.protein*4)/ps.cal;
      const fPct = (ps.fat*9)/ps.cal;
      const cPct = (ps.carbs*4)/ps.cal;
      dist.macroRatios.push({ id: r.id, p: pPct, f: fPct, c: cPct });
      // 严重失衡: 脂肪 > 60%
      if (fPct > 0.60) { issues.push({ id: r.id, name: r.nameZh, type: 'fat_dominated', fatPercent: (fPct*100).toFixed(0)+'%' }); stats.macroImbalanced++; }
    }
  }

  // 分布统计 — 先过滤 NaN
  const summarize = arr => {
    const clean = arr.filter(x => Number.isFinite(x));
    const sorted = clean.slice().sort((a,b)=>a-b);
    if (!clean.length) return { min:'?', p10:'?', p50:'?', p90:'?', max:'?', mean:'?' };
    return {
      n: clean.length,
      min: sorted[0]?.toFixed(0),
      p10: sorted[Math.floor(clean.length*0.1)]?.toFixed(0),
      p50: sorted[Math.floor(clean.length*0.5)]?.toFixed(0),
      p90: sorted[Math.floor(clean.length*0.9)]?.toFixed(0),
      max: sorted[sorted.length-1]?.toFixed(0),
      mean: (clean.reduce((s,x)=>s+x,0)/clean.length).toFixed(0),
    };
  };

  const summary = {
    perServingCal: summarize(dist.perServingCal),
    perServingNa: summarize(dist.perServingNa),
    perServingFat: summarize(dist.perServingFat),
    perServingProtein: summarize(dist.perServingProtein),
  };

  return { stats, summary, issues };
}

// ============================================================
// 主流程
// ============================================================
(async () => {
  const t0 = Date.now();
  const { A, B, C } = await scanAll();
  const elapsed = Date.now() - t0;

  console.log('═══════════════════════════════════════════');
  console.log(`  审计完成 (${elapsed}ms, 并行 3 维度)`);
  console.log(`  食材: ${ingredients.length}  菜谱: ${recipes.length}`);
  console.log('═══════════════════════════════════════════');

  console.log('\n【A. 食材数据质量】');
  console.log('  Atwater 偏差大:', A.stats.atwaterOff, '条');
  console.log('  极端值:', A.stats.extremeValues, '条');
  console.log('  可疑零值:', A.stats.suspiciousZero, '条');
  if (A.issues.length) {
    console.log('  示例:');
    A.issues.slice(0, 10).forEach(i => console.log('   -', JSON.stringify(i)));
  }

  console.log('\n【B. 菜谱完整性】');
  console.log('  缺失食材引用:', B.stats.missingIngs, '次');
  console.log('  用量异常:', B.stats.badAmount, '处');
  console.log('  份数异常:', B.stats.badServings);
  console.log('  字段缺失:', B.stats.emptyFields);
  console.log('  单位类型错配:', B.stats.unitMismatch);
  console.log('  重复 ID:', B.stats.dupeIds);
  if (B.issues.length) {
    console.log('  问题前 15:');
    B.issues.slice(0, 15).forEach(i => console.log('   -', JSON.stringify(i)));
  }

  console.log('\n【C. 营养学评估 (每份)】');
  console.log('  热量分布 (kcal):', JSON.stringify(C.summary.perServingCal));
  console.log('  钠分布 (mg):    ', JSON.stringify(C.summary.perServingNa));
  console.log('  脂肪分布 (g):   ', JSON.stringify(C.summary.perServingFat));
  console.log('  蛋白分布 (g):   ', JSON.stringify(C.summary.perServingProtein));
  console.log('  --- 异常分类 ---');
  console.log('  热量过低 (<50):  ', C.stats.calLow);
  console.log('  热量过高 (>1200):', C.stats.calHigh);
  console.log('  钠超标 (>1500mg):', C.stats.naHigh);
  console.log('  脂肪过高 (>50g): ', C.stats.fatHigh);
  console.log('  蛋白极端 (>80g): ', C.stats.proteinExtreme);
  console.log('  脂肪主导 (>60% 热量):', C.stats.macroImbalanced);

  // 写完整报告供深度分析
  fs.writeFileSync(path.join(__dirname, '..', 'audit-report.json'),
    JSON.stringify({ A, B, C: { stats: C.stats, summary: C.summary, issues: C.issues } }, null, 2));
  console.log('\n📄 完整报告: audit-report.json');
})();
