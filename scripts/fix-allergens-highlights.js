/**
 * 最终修补脚本 — 按类别+关键词规则,批量补齐过敏原和亮点标签
 * 幂等 — 只加不减
 */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// ========= 过敏原分类规则 =========
function deriveAllergens(ing) {
  const id = ing.id;
  const nameEn = (ing.nameEn || '').toLowerCase();
  const nameZh = ing.nameZh || '';
  const key = id + ' ' + nameEn + ' ' + nameZh;
  const out = new Set(ing.allergens || []);

  // 海鲜: 所有 category=seafood 的条目,加上 category=dried 里明显海产品
  if (ing.category === 'seafood') out.add('allergen_seafood');
  if (ing.category === 'dried' && /shrimp|scallop|squid|seafood|虾|鱿|贝|瑶柱|虾米/.test(key)) out.add('allergen_seafood');

  // 乳制品: 所有 egg_dairy 中不是"蛋"的条目
  if (ing.category === 'egg_dairy') {
    const isEgg = /\begg\b|鸡蛋|鸭蛋|鹌鹑蛋|皮蛋/.test(key);
    if (!isEgg) out.add('allergen_dairy');
    else out.add('allergen_egg');
  }

  // 奶油/酸奶 (有时分类成 seasoning 或 other)
  if (/\bmilk\b|cheese|yogurt|cream|butter|奶|酪/.test(key) &&
      !/coconut_milk|coconut milk|椰浆|soy milk|杏仁奶|almond_milk|oat milk|燕麦奶/.test(key)) {
    out.add('allergen_dairy');
  }

  // 大豆: id 含 soy/tofu/edamame/tempeh/doubanjiang/miso 等
  if (/tofu|soy|edamame|tempeh|miso|natto|豆腐|豆瓣|味噌|大豆|黄豆|豆浆|豆皮|腐乳|纳豆/.test(key)) {
    out.add('allergen_soy');
  }
  // 但排除"绿豆 mung_bean"、"红豆"、"花豆"等非大豆类
  if (/mung_bean|red_bean|adzuki|kidney_bean|chickpea|lentil|扁豆|绿豆|红豆|鹰嘴豆|花豆|四季豆|green_bean|snow_pea|豌豆|毛豆.+\bedamame\b/.test(key)) {
    if (!/tofu|soy|tempeh|miso/.test(key)) out.delete('allergen_soy');
  }
  // edamame 就是毛豆,确实是大豆
  if (id === 'edamame') out.add('allergen_soy');

  // 坚果: dried 类+明显坚果名
  if (/almond|walnut|pecan|cashew|pistachio|hazelnut|macadamia|pine_nut|chestnut|peanut|brazil_nut|杏仁|核桃|腰果|开心果|榛子|松子|板栗|花生/.test(key)) {
    out.add('allergen_nut');
  }

  // 麸质: 含小麦/大麦/黑麦/燕麦(商业)
  if (/\bwheat\b|\bbread\b|pasta|flour|noodle|udon|ramen|dumpling|wonton|breadcrumb|cake|cookie|cracker|oats|barley|rye|seitan|gluten|面粉|面包|面条|馄饨|饺子|意面|麸|燕麦|大麦/.test(key)) {
    // 排除米制、玉米、无麸质类
    if (!/\brice_noodle|\brice_cake|米粉|米面|米饼|玉米|corn|buckwheat|荞麦|紫菜|海苔|quinoa/.test(key)) {
      out.add('allergen_gluten');
    }
  }

  // 芝麻
  if (/sesame|tahini|芝麻/.test(key)) out.add('allergen_sesame');

  // 蛋类 (除了已经在 egg_dairy 处理的) — 用 \b 边界防止 eggplant 误命中
  if (/\begg\b|quail_egg|salted_egg|preserved_egg|century_egg|鸡蛋|鸭蛋|鹌鹑蛋|咸鸭蛋|皮蛋/.test(key)) {
    out.add('allergen_egg');
  }
  // eggplant (茄子) 不是蛋
  if (/eggplant|茄子/.test(key)) out.delete('allergen_egg');

  return [...out].sort();
}

// ========= 营养亮点规则 =========
function deriveHighlights(ing) {
  const n = ing.nutrition;
  const out = new Set(ing.highlights || []);

  // 高纤维 (≥ 6g/100g,USDA 定义)
  if (n.fiber >= 6) out.add('high_fiber');
  // 高蛋白 (≥ 20g/100g,肉蛋奶豆常见阈值)
  if (n.protein >= 20) out.add('high_protein');
  // 低卡 (≤ 40 kcal/100g,主要针对蔬菜)
  if (n.calories <= 40 && (ing.category === 'vegetable' || ing.category === 'fruit')) out.add('low_calorie');
  // 低脂 (仅对肉/海鲜/蛋奶有意义: 脂肪 < 3g 且卡路里 > 50)
  if (n.fat < 3 && n.calories > 50 && ['meat','seafood','egg_dairy'].includes(ing.category)) {
    out.add('low_fat');
  }

  return [...out].sort();
}

// ========= Season 归一化 (南半球/NZ) =========
const SEASON_MAP = {
  spring: ['9', '10', '11'],
  summer: ['12', '1', '2'],
  autumn: ['3', '4', '5'],
  winter: ['6', '7', '8'],
};
function normalizeSeason(seasons) {
  if (!Array.isArray(seasons) || seasons.length === 0) return [];
  const out = new Set();
  for (const s of seasons) {
    if (SEASON_MAP[s]) SEASON_MAP[s].forEach(m => out.add(m));
    else if (/^(1[0-2]|[1-9])$/.test(s)) out.add(s);
  }
  return [...out].sort((a, b) => Number(a) - Number(b));
}

// ========= 执行 =========
let changed = 0, seasonFixed = 0;
const log = [];
for (const ing of data) {
  const beforeA = JSON.stringify(ing.allergens || []);
  const beforeH = JSON.stringify(ing.highlights || []);
  const beforeS = JSON.stringify(ing.season || []);

  ing.allergens = deriveAllergens(ing);
  ing.highlights = deriveHighlights(ing);
  ing.season = normalizeSeason(ing.season);

  const afterA = JSON.stringify(ing.allergens);
  const afterH = JSON.stringify(ing.highlights);
  const afterS = JSON.stringify(ing.season);

  if (beforeA !== afterA || beforeH !== afterH) {
    changed++;
    const diffs = [];
    if (beforeA !== afterA) diffs.push('A:' + afterA);
    if (beforeH !== afterH) diffs.push('H:' + afterH);
    log.push(`${ing.id}: ${diffs.join(' ')}`);
  }
  if (beforeS !== afterS) seasonFixed++;
}

// 字段排序
const reordered = data.map(i => ({
  id: i.id, nameZh: i.nameZh, nameEn: i.nameEn, category: i.category,
  nutrition: i.nutrition, priceNZD: i.priceNZD, unit: i.unit,
  allergens: i.allergens || [], warnings: i.warnings || [], highlights: i.highlights || [],
  supermarkets: i.supermarkets || ['countdown'], season: i.season || [],
}));

fs.writeFileSync(FILE, JSON.stringify(reordered, null, 2) + '\n', 'utf8');
console.log(`✅ ${changed} 条 allergens/highlights 改动, ${seasonFixed} 条 season 归一`);
log.slice(0, 40).forEach(l => console.log('  ' + l));
if (log.length > 40) console.log('  ... 还有 ' + (log.length - 40) + ' 条');
