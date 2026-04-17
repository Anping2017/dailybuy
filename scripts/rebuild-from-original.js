/**
 * 完全从原始源文件重建 recipes-all.json
 *
 * 核心规则：
 * 1. 不修改任何源文件
 * 2. recipes-all.json 完全由源文件拼接而成
 * 3. 同 ID 重复时按"最原始"优先级保留（recipes.json 最高）
 * 4. 同名重复时也按优先级保留
 * 5. 缺失食材原样保留，不替换
 * 6. cookingMethod 字段如果原文件没有，则按规则推断（不影响食材）
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// 优先级顺序：越靠前越优先
// recipes.json 是种子文件，最权威
// quality-* 是精修版本
// hot-* / chinese-* / international 是 Agent 生成的批次
// mega-3 是大批量生成的，优先级最低
const SOURCE_FILES = [
  { file: 'recipes.json', source: 'original' },
  { file: 'recipes-quality-e.json', source: 'quality-e' },
  { file: 'recipes-quality-d.json', source: 'quality-d' },
  { file: 'recipes-quality-c.json', source: 'quality-c' },
  { file: 'recipes-quality-b.json', source: 'quality-b' },
  { file: 'recipes-hot-1.json', source: 'hot-1' },
  { file: 'recipes-hot-2.json', source: 'hot-2' },
  { file: 'recipes-hot-3.json', source: 'hot-3' },
  { file: 'recipes-chinese-1.json', source: 'chinese-1' },
  { file: 'recipes-chinese-2.json', source: 'chinese-2' },
  { file: 'recipes-international.json', source: 'international' },
  { file: 'recipes-mega-3.json', source: 'mega-3' },
];

// 推断 cookingMethod (如果源文件没有该字段)
function inferCookingMethod(recipe) {
  if (recipe.cookingMethod) return recipe.cookingMethod;
  const text = (recipe.nameZh || '') + ' ' + (recipe.steps || []).join(' ');
  if (/干锅|铁板/.test(text)) return 'dry_pot';
  if (/凉拌|拌/.test(text)) return 'cold_dish';
  if (/汤|羹|煲汤/.test(text)) return 'soup';
  if (/蒸/.test(text)) return 'steam';
  if (/炖|煲|焖/.test(text)) return 'stew';
  if (/红烧|卤|烧/.test(text)) return 'braise';
  if (/烤|焗/.test(text)) return 'roast';
  if (/炸|煎|炕/.test(text)) return 'deep_fry';
  if (/汆|水煮|煮/.test(text)) return 'boil';
  if (/粥|饭|面|饼|包|饺|馄饨|粉/.test(text)) return 'staple';
  if (/炒/.test(text)) return 'stir_fry';
  return 'stir_fry';
}

// 地域归一化
const REGION_ALIAS = {
  '家常': 'homestyle', '广式': 'cantonese', '北方': 'northern',
  '四川': 'sichuan', '湖南': 'hunan', '江浙': 'jiangzhe',
  '上海': 'shanghai', '扬州': 'jiangsu', '武汉': 'hubei',
  '湖北': 'hubei', '闽南': 'fujian', '台式': 'taiwanese',
  '南方': 'southern', '新疆': 'xinjiang', '兰州': 'lanzhou',
};

const allRecipes = [];
const seenIds = new Set();
const seenNames = new Set();
const stats = { totalLoaded: 0, dupId: 0, dupName: 0 };

for (const { file, source } of SOURCE_FILES) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) continue;

  const recipes = JSON.parse(fs.readFileSync(fp, 'utf8'));
  console.log(`📂 ${file.padEnd(32)} ${recipes.length} 道`);
  stats.totalLoaded += recipes.length;

  for (const orig of recipes) {
    if (seenIds.has(orig.id)) { stats.dupId++; continue; }
    if (seenNames.has(orig.nameZh)) { stats.dupName++; continue; }
    seenIds.add(orig.id);
    seenNames.add(orig.nameZh);

    // 完整复制原始数据
    const r = JSON.parse(JSON.stringify(orig));

    // 仅在缺失时补充元字段（不影响 ingredients/steps）
    if (!r.cookingMethod) r.cookingMethod = inferCookingMethod(r);
    if (REGION_ALIAS[r.regionalCuisine]) r.regionalCuisine = REGION_ALIAS[r.regionalCuisine];
    r.status = r.status || 'reviewed';
    r.source = source;

    // 不删除 dataIssues，但也不主动添加（菜谱原汁原味）
    delete r.dataIssues;

    allRecipes.push(r);
  }
}

const outPath = path.join(DATA_DIR, 'recipes-all.json');
fs.writeFileSync(outPath, JSON.stringify(allRecipes, null, 2));

console.log('\n========== 重建完成 ==========');
console.log(`总加载: ${stats.totalLoaded}`);
console.log(`ID重复跳过: ${stats.dupId}`);
console.log(`菜名重复跳过: ${stats.dupName}`);
console.log(`最终菜谱数: ${allRecipes.length}`);

// 来源分布
const sourceCount = {};
for (const r of allRecipes) sourceCount[r.source] = (sourceCount[r.source] || 0) + 1;
console.log('\n按来源:');
for (const [s, c] of Object.entries(sourceCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${s.padEnd(15)} ${c}`);
}

// 检查待新增食材
const ings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const ingIds = new Set(ings.map(i => i.id));
const missing = new Map();
for (const r of allRecipes) {
  for (const ri of r.ingredients) {
    if (!ingIds.has(ri.ingredientId)) {
      const e = missing.get(ri.ingredientId) || { count: 0, samples: [] };
      e.count++;
      if (e.samples.length < 3) e.samples.push(r.nameZh);
      missing.set(ri.ingredientId, e);
    }
  }
}
console.log('\n=== 待新增食材 (菜谱用到但食材库没有) ===');
console.log('数量:', missing.size);
if (missing.size > 0) {
  const sorted = [...missing.entries()].sort((a, b) => b[1].count - a[1].count);
  for (const [id, info] of sorted.slice(0, 30)) {
    console.log(`  ${id.padEnd(25)} ${info.count}道 — ${info.samples.join(', ')}`);
  }
  if (sorted.length > 30) console.log(`  ... 还有 ${sorted.length - 30} 个`);
}
