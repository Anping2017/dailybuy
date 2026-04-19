/**
 * 一次性：把 recipes-all.json 里无 source 字段的孤儿菜谱
 * 抽到 recipes-legacy.json 以纳入统一流水线
 *
 * 执行完后 recipes-legacy.json 会被 merge-recipes.js 一并处理。
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const allPath = path.join(DATA_DIR, 'recipes-all.json');
const all = JSON.parse(fs.readFileSync(allPath, 'utf8'));

// 源文件 id 集合
const SOURCE_FILES = [
  'recipes-quality-e.json','recipes-quality-d.json','recipes-quality-c.json',
  'recipes-quality-b.json','recipes-chinese-2.json','recipes-mega-3.json',
  'recipes-international.json','recipes-chinese-1.json',
  'recipes-hot-1.json','recipes-hot-2.json','recipes-hot-3.json','recipes.json',
];
const sourceIds = new Set();
for (const f of SOURCE_FILES) {
  const arr = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
  for (const r of arr) sourceIds.add(r.id);
}

const orphans = all.filter(r => !sourceIds.has(r.id));
console.log(`发现孤儿菜谱: ${orphans.length}`);

// 给孤儿标 source=legacy
for (const r of orphans) {
  if (!r.source) r.source = 'legacy';
}

const outPath = path.join(DATA_DIR, 'recipes-legacy.json');
fs.writeFileSync(outPath, JSON.stringify(orphans, null, 2));
console.log(`✅ 写入 ${orphans.length} 条到 recipes-legacy.json`);
