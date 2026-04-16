/**
 * 补丁脚本 — 对已迁移的食材库做二次修正:
 * 1. 回填首轮迁移中被丢掉的标签(因为当时类型定义没覆盖)
 * 2. 基于营养阈值自动补 high_sodium / high_fat / high_sugar
 * 3. 幂等 — 重复运行不会重复添加标签
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// ==========================================================================
// 1. 按 ID 回填首轮迁移丢失的标签
// ==========================================================================
const PATCHES = {
  // 加工肉类(WHO I类致癌物)
  ham:              { warnings: ['processed'], allergens: [] },
  chinese_sausage:  { warnings: ['processed'], allergens: [] },
  salami:           { warnings: ['processed'], allergens: [] },
  smoked_salmon:    { warnings: ['processed'], allergens: ['allergen_seafood'] },
  bacon:            { warnings: ['processed'], allergens: [] }, // 原数据已有 high_fat+high_sodium
  sausage:          { warnings: ['processed'], allergens: [] },

  // 豆制品
  tempeh:           { allergens: ['allergen_soy'], highlights: ['high_protein', 'high_fiber'] },

  // 全谷物
  brown_rice:       { highlights: ['whole_grain', 'high_fiber'] },
  buckwheat:        { highlights: ['whole_grain', 'high_fiber'] },
  barley:           { allergens: ['allergen_gluten'], highlights: ['whole_grain', 'high_fiber'] },

  // 深色蔬菜
  kale:             { highlights: ['high_vitamin', 'high_fiber', 'high_iron'] },
  watercress:       { highlights: ['high_vitamin', 'low_calorie'] },

  // 含酒精烹饪料
  shaoxing_wine:    { warnings: ['contains_alcohol', 'high_sodium'] },
  sake:             { warnings: ['contains_alcohol'] },

  // 坚果(之前用 allergen_nuts 复数,规范为 allergen_nut)
  almond:           { allergens: ['allergen_nut'], warnings: ['high_fat'], highlights: ['high_protein'] },
  pistachio:        { allergens: ['allergen_nut'], warnings: ['high_fat'], highlights: ['high_protein'] },
  hazelnut:         { allergens: ['allergen_nut'], warnings: ['high_fat'] },
  macadamia:        { allergens: ['allergen_nut'], warnings: ['high_fat'] },
  pine_nut:         { allergens: ['allergen_nut'], warnings: ['high_fat'] },
};

// ==========================================================================
// 2. 基于营养阈值,对所有条目自动补 warnings
// ==========================================================================
function autoThresholdWarnings(ing) {
  const n = ing.nutrition;
  const warns = new Set(ing.warnings || []);
  // 不对纯调味料过度报警 — 它们每次用量极小
  const isSeasoning = ing.category === 'seasoning' || ing.category === 'oil';

  // 高钠: ≥ 600mg/100g (但盐/酱油这类调味料本身就是高钠,仍应标)
  if (n.sodium >= 600) warns.add('high_sodium');
  // 高糖: ≥ 20g/100g
  if (n.sugar >= 20) warns.add('high_sugar');
  // 高脂: ≥ 20g/100g (调味料/油脂同样标记)
  if (n.fat >= 20) warns.add('high_fat');

  return warns;
}

// ==========================================================================
// 执行
// ==========================================================================
const stats = { patched: 0, autoWarn: [] };

for (const ing of data) {
  const before = JSON.stringify({a: ing.allergens, w: ing.warnings, h: ing.highlights});

  // 1. ID 补丁
  if (PATCHES[ing.id]) {
    const p = PATCHES[ing.id];
    const allergens = new Set([...(ing.allergens || []), ...(p.allergens || [])]);
    const warnings  = new Set([...(ing.warnings || []),  ...(p.warnings || [])]);
    const highlights= new Set([...(ing.highlights || []),...(p.highlights || [])]);
    ing.allergens = [...allergens].sort();
    ing.warnings  = [...warnings].sort();
    ing.highlights= [...highlights].sort();
  }

  // 2. 阈值自动补 warnings
  const beforeWarn = new Set(ing.warnings || []);
  const afterWarn = autoThresholdWarnings(ing);
  for (const w of afterWarn) {
    if (!beforeWarn.has(w)) stats.autoWarn.push(`${ing.id}: +${w}`);
  }
  ing.warnings = [...afterWarn].sort();

  const after = JSON.stringify({a: ing.allergens, w: ing.warnings, h: ing.highlights});
  if (before !== after) stats.patched++;
}

// 重新排序字段,保持一致性
const reordered = data.map(i => ({
  id: i.id,
  nameZh: i.nameZh,
  nameEn: i.nameEn,
  category: i.category,
  nutrition: i.nutrition,
  priceNZD: i.priceNZD,
  unit: i.unit,
  allergens: i.allergens || [],
  warnings: i.warnings || [],
  highlights: i.highlights || [],
  supermarkets: i.supermarkets || ['countdown'],
  season: i.season || [],
}));

fs.writeFileSync(FILE, JSON.stringify(reordered, null, 2) + '\n', 'utf8');

console.log(`✅ 补丁完成: ${stats.patched} 条改动, 阈值自动补标 ${stats.autoWarn.length} 次\n`);
if (stats.autoWarn.length) console.log('— 阈值自动补:\n  ' + stats.autoWarn.join('\n  '));
