/**
 * 食材数据迁移脚本
 *
 * 一次性完成:
 * 1. 拆分 healthTags → { allergens, warnings, highlights }
 * 2. 补齐漏标的 high_sugar / high_sodium / high_fat
 * 3. 修正 GI 与 purine 不一致
 * 4. 统一 season 为南半球(NZ)月份数字
 * 5. 清理非法标签
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const raw = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

// ==========================================================================
// 标签分类表
// ==========================================================================
const WARNINGS = new Set([
  'high_gi', 'high_purine', 'high_sodium', 'high_fat', 'high_sugar', 'high_cholesterol',
]);
const ALLERGENS = new Set([
  'allergen_gluten', 'allergen_dairy', 'allergen_nut', 'allergen_sesame',
  'allergen_seafood', 'allergen_egg', 'allergen_soy',
]);
const HIGHLIGHTS = new Set([
  'high_fiber', 'high_protein', 'high_iron', 'high_iodine',
  'high_zinc', 'high_vitamin_a', 'low_fat', 'low_calorie',
]);
// 重命名 / 合并
const RENAME = {
  allergen_shellfish: 'allergen_seafood', // 合并贝类到海鲜
};
// 删除(非客观健康标签)
const DROP = new Set([
  'heart_healthy',       // 主观判断
  'natural_sweetener',   // 营销语,蜂蜜是高糖
  'gluten_free',         // 这是"无"不是"有",用 allergen_gluten 的反义判断即可
  'high_collagen',       // 不是临床公认的健康指标
]);

// ==========================================================================
// 数据纠错表 — 明确需要补标/移除的条目
// ==========================================================================
const ADD_WARNINGS = {
  // 漏标 high_sugar (糖 ≥ 20g/100g)
  honey: ['high_sugar'],
  red_date: ['high_sugar'],
  goji_berry: ['high_sugar'],
  gochujang: ['high_sugar'],
  hoisin_sauce: ['high_sugar'],
  mirin: ['high_sugar'],
  // 漏标 high_sodium (钠 ≥ 600mg/100g)
  mozzarella: ['high_sodium'],
  // 漏标 high_fat (脂肪 ≥ 20g/100g)
  pork_mince: ['high_fat'],
  chili_oil: ['high_fat'],
  cumin: ['high_fat'],
  sesame_seed: ['high_fat'],
  walnut: ['high_fat'],
  cashew: ['high_fat'],
  peanut: ['high_fat'],
  sesame_paste: ['high_fat'],
  peanut_butter: ['high_fat'],
  soybean: ['high_fat'],
  dried_tofu_skin: ['high_fat'],
  // 漏标 high_gi (GI ≥ 70)
  watermelon: ['high_gi'],
  pumpkin: ['high_gi'],
  // 漏标 high_purine (红肉统一)
  lamb_chop: ['high_purine'],
  beef_brisket: ['high_purine'],
  beef_shank: ['high_purine'],
};
const REMOVE_WARNINGS = {
  // 成熟香蕉 GI ≈ 51,属中低 GI,移除误标
  banana: ['high_gi'],
};

// ==========================================================================
// 季节归一 — 南半球(NZ) 月份映射
// ==========================================================================
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
    else console.warn(`⚠️  未知 season 值: ${s}`);
  }
  return [...out].sort((a, b) => Number(a) - Number(b));
}

// ==========================================================================
// 执行迁移
// ==========================================================================
const stats = { processed: 0, droppedTags: [], renamed: [], added: [], removed: [], seasonFixed: 0 };

for (const ing of data) {
  const oldTags = ing.healthTags || [];
  const allergens = new Set();
  const warnings = new Set();
  const highlights = new Set();

  for (let tag of oldTags) {
    if (RENAME[tag]) {
      stats.renamed.push(`${ing.id}: ${tag} → ${RENAME[tag]}`);
      tag = RENAME[tag];
    }
    if (DROP.has(tag)) {
      stats.droppedTags.push(`${ing.id}: dropped ${tag}`);
      continue;
    }
    if (ALLERGENS.has(tag)) allergens.add(tag);
    else if (WARNINGS.has(tag)) warnings.add(tag);
    else if (HIGHLIGHTS.has(tag)) highlights.add(tag);
    else console.warn(`⚠️  未分类的标签: ${ing.id} → ${tag}`);
  }

  // 补标
  (ADD_WARNINGS[ing.id] || []).forEach(t => {
    if (!warnings.has(t)) {
      warnings.add(t);
      stats.added.push(`${ing.id}: +${t}`);
    }
  });
  // 移除
  (REMOVE_WARNINGS[ing.id] || []).forEach(t => {
    if (warnings.delete(t)) stats.removed.push(`${ing.id}: -${t}`);
  });

  // 季节归一
  const newSeason = normalizeSeason(ing.season);
  const seasonChanged = JSON.stringify(newSeason) !== JSON.stringify(ing.season || []);
  if (seasonChanged) stats.seasonFixed++;

  // 按固定顺序重写字段,保持 JSON 结构稳定
  delete ing.healthTags;
  ing.allergens = [...allergens].sort();
  ing.warnings = [...warnings].sort();
  ing.highlights = [...highlights].sort();
  ing.supermarkets = ing.supermarkets || ['countdown'];
  ing.season = newSeason;

  stats.processed++;
}

// 重新排序每条记录的键,保证输出可读
const reordered = data.map(i => ({
  id: i.id,
  nameZh: i.nameZh,
  nameEn: i.nameEn,
  category: i.category,
  nutrition: i.nutrition,
  priceNZD: i.priceNZD,
  unit: i.unit,
  allergens: i.allergens,
  warnings: i.warnings,
  highlights: i.highlights,
  supermarkets: i.supermarkets,
  season: i.season,
}));

fs.writeFileSync(FILE, JSON.stringify(reordered, null, 2) + '\n', 'utf8');

console.log('\n✅ 迁移完成');
console.log(`   处理条目: ${stats.processed}`);
console.log(`   合并重命名: ${stats.renamed.length}`);
console.log(`   删除标签: ${stats.droppedTags.length}`);
console.log(`   新增警告: ${stats.added.length}`);
console.log(`   移除警告: ${stats.removed.length}`);
console.log(`   季节字段修正: ${stats.seasonFixed}`);

if (stats.renamed.length) console.log('\n— 重命名:\n  ' + stats.renamed.join('\n  '));
if (stats.droppedTags.length) console.log('\n— 删除:\n  ' + stats.droppedTags.join('\n  '));
if (stats.added.length) console.log('\n— 新增警告:\n  ' + stats.added.join('\n  '));
if (stats.removed.length) console.log('\n— 移除警告:\n  ' + stats.removed.join('\n  '));
