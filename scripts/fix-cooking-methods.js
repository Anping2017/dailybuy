/**
 * 修复 cookingMethod 误标 — 基于菜名关键词推断
 */
const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// 关键词 → cookingMethod 推断
function inferCookingMethod(name) {
  if (/凉拌|沙拉|salad|凉菜|拌(?!面|粉|饭)/.test(name)) return 'cold_dish';
  if (/糖醋|宫保|京酱|麻婆|鱼香|椒盐|椒麻|爆炒|清炒|爆炒|火爆|快炒|小炒|炒$/.test(name)) return 'stir_fry';
  if (/红烧|卤|焖|煨|烧$|东坡|狮子头|油焖|酱烧|葱烧|酱焖|红卤/.test(name)) return 'braise';
  if (/炸|脆炸|香炸|酥炸|deep fry|tempura|tonkatsu|katsu|karaage|fried chicken|nuggets/i.test(name)) return 'deep_fry';
  if (/煎|pan fry|griddle|crispy/i.test(name)) return 'pan_fry';
  if (/炖|煲$|stew|braise/i.test(name)) return 'stew';
  if (/蒸$|清蒸|粉蒸|steam/i.test(name)) return 'steam';
  if (/烤|焗|roast|bake|grill|烧烤/.test(name)) return 'roast';
  if (/汤$|羹$|汤煲|高汤|肉骨茶|味噌汤|罗宋汤/.test(name)) return 'soup';
  if (/煮|汆|焯|川煮|涮|boil|poach/i.test(name)) return 'boil';
  if (/粥|饭$|面$|面包|包子|饺子|馄饨|寿司|肠粉/.test(name)) return 'staple';
  return null; // 不修改
}

const FILES = [
  'recipes-all.json', 'recipes.json', 'recipes-chinese-1.json', 'recipes-chinese-2.json',
  'recipes-international.json', 'recipes-hot-1.json', 'recipes-hot-2.json',
  'recipes-hot-3.json', 'recipes-mega-3.json', 'recipes-quality-b.json',
  'recipes-quality-c.json', 'recipes-quality-d.json', 'recipes-quality-e.json',
];

let totalFixed = 0;
const samples = [];

for (const file of FILES) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) continue;
  const recipes = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let fileFixed = 0;
  for (const r of recipes) {
    const inferred = inferCookingMethod(r.nameZh || '');
    if (!inferred || inferred === r.cookingMethod) continue;
    // 高确信度的修正:仅当现有 method 与名字明显冲突时
    const conflict =
      (r.cookingMethod === 'cold_dish' && /糖醋|红烧|宫保|麻婆|炸|烤|蒸|炒|煮|焖|烧$|狮子头|东坡/.test(r.nameZh)) ||
      (r.cookingMethod === 'stir_fry' && /汤$|羹$|蒸$|烤$|炸$/.test(r.nameZh)) ||
      (r.cookingMethod === 'soup' && /炒|烤|炸|蒸/.test(r.nameZh) && !/汤|羹/.test(r.nameZh)) ||
      (!r.cookingMethod);
    if (!conflict) continue;
    if (samples.length < 12) samples.push(`${r.id}(${r.nameZh}): ${r.cookingMethod} → ${inferred}`);
    r.cookingMethod = inferred;
    fileFixed++;
    totalFixed++;
  }
  if (fileFixed) {
    fs.writeFileSync(fp, JSON.stringify(recipes, null, 2));
    console.log(`✏  ${file}: 修复 ${fileFixed} 处 cookingMethod`);
  }
}

console.log(`\n✅ 共修复 ${totalFixed} 处 cookingMethod`);
samples.forEach(s => console.log('  ' + s));
