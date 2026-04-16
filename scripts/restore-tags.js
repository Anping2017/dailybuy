/**
 * 恢复脚本 — 从 git HEAD 的 committed ingredients.json 把 healthTags 按新 schema 补回当前文件
 * 只在当前条目的 allergens/warnings/highlights 未覆盖时补充,不会覆盖现有已分类标签
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FILE = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const committedRaw = execSync('git show HEAD:src/data/ingredients.json', { cwd: path.join(__dirname, '..') }).toString();
const committed = JSON.parse(committedRaw);
const current = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const ALLERGENS = new Set(['allergen_gluten','allergen_dairy','allergen_nut','allergen_sesame','allergen_seafood','allergen_egg','allergen_soy']);
const WARNINGS = new Set(['high_gi','high_purine','high_sodium','high_fat','high_sugar','high_cholesterol']);
const HIGHLIGHTS = new Set(['high_fiber','high_protein','high_iron','high_iodine','high_zinc','high_vitamin_a','low_fat','low_calorie']);

// 重命名(复数 → 单数,合并贝类 → 海鲜)
const RENAME = {
  allergen_shellfish: 'allergen_seafood',
  allergen_nuts: 'allergen_nut',
};
// 丢弃
const DROP = new Set(['heart_healthy','natural_sweetener','gluten_free','high_collagen']);

const committedMap = new Map(committed.map(i => [i.id, i]));

let restored = 0;
const changes = [];

for (const cur of current) {
  const old = committedMap.get(cur.id);
  if (!old || !Array.isArray(old.healthTags) || !old.healthTags.length) continue;

  const curAllergens = new Set(cur.allergens || []);
  const curWarnings = new Set(cur.warnings || []);
  const curHighlights = new Set(cur.highlights || []);

  const added = [];

  for (let tag of old.healthTags) {
    if (DROP.has(tag)) continue;
    if (RENAME[tag]) tag = RENAME[tag];

    if (ALLERGENS.has(tag) && !curAllergens.has(tag)) { curAllergens.add(tag); added.push('a:'+tag); }
    else if (WARNINGS.has(tag) && !curWarnings.has(tag)) { curWarnings.add(tag); added.push('w:'+tag); }
    else if (HIGHLIGHTS.has(tag) && !curHighlights.has(tag)) { curHighlights.add(tag); added.push('h:'+tag); }
  }

  if (added.length) {
    cur.allergens = [...curAllergens].sort();
    cur.warnings = [...curWarnings].sort();
    cur.highlights = [...curHighlights].sort();
    restored++;
    changes.push(`${cur.id}: ${added.join(', ')}`);
  }
}

// 处理数据纠错(audit 时识别的)
const REMOVE_WARN = { banana: ['high_gi'] }; // 成熟香蕉 GI 低
for (const [id, tags] of Object.entries(REMOVE_WARN)) {
  const cur = current.find(i => i.id === id);
  if (!cur) continue;
  const before = cur.warnings.length;
  cur.warnings = cur.warnings.filter(t => !tags.includes(t));
  if (cur.warnings.length !== before) changes.push(`${id}: 移除 ${tags.join(',')}`);
}

// 字段排序
const reordered = current.map(i => ({
  id: i.id, nameZh: i.nameZh, nameEn: i.nameEn, category: i.category,
  nutrition: i.nutrition, priceNZD: i.priceNZD, unit: i.unit,
  allergens: i.allergens || [], warnings: i.warnings || [], highlights: i.highlights || [],
  supermarkets: i.supermarkets || ['countdown'], season: i.season || [],
}));

fs.writeFileSync(FILE, JSON.stringify(reordered, null, 2) + '\n', 'utf8');

console.log(`✅ 恢复 ${restored} 个条目的标签, ${changes.length} 处改动`);
changes.forEach(c => console.log('  ' + c));
