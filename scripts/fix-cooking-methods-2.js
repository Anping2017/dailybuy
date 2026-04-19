/**
 * 保守纠正 cookingMethod — 只覆盖名字有强信号的:
 *   - 凉拌/沙拉/salad → cold_dish
 *   - 饭/粥/面/饼(主食类)/寿司/肠粉/汤面 → staple (但排除"汤面" -> soup)
 *   - 名字结尾"汤" 或 "羹" → soup
 */
const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

function strongInfer(name) {
  // 主食 — 必须是名字开头/结尾/明确主食词
  if (/^凉拌|沙拉|salad/i.test(name)) return 'cold_dish';
  if (/^糖醋(?!.*肉|.*鸡|.*鱼|.*排|.*里脊|.*猪|.*虾|.*牛|.*羊|.*鸭)/.test(name)) return 'cold_dish'; // 糖醋蔬菜
  if (/汤$|羹$/.test(name)) return 'soup';
  if (/粥$|^粥|porridge|congee/i.test(name)) return 'staple';
  if (/饭$|寿司$|burrito|risotto/i.test(name)) return 'staple';
  if (/面$|拉面|乌冬|意面|spaghetti|pasta|noodle|ramen|udon|河粉|肠粉|米线|米粉/i.test(name)) return 'staple';
  if (/包$|^包子|饺子|馄饨$|饺$|肠粉$/.test(name)) return 'staple';
  if (/^炒饭|^蛋炒饭|盖饭|盖浇饭/.test(name)) return 'staple';
  if (/红薯焖饭|焖饭/.test(name)) return 'staple';
  return null;
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
    const target = strongInfer(r.nameZh || '');
    if (!target || target === r.cookingMethod) continue;
    if (samples.length < 12) samples.push(`${r.id}(${r.nameZh}): ${r.cookingMethod} → ${target}`);
    r.cookingMethod = target;
    fileFixed++;
    totalFixed++;
  }
  if (fileFixed) {
    fs.writeFileSync(fp, JSON.stringify(recipes, null, 2));
    console.log(`✏  ${file}: 修复 ${fileFixed} 处`);
  }
}

console.log(`\n✅ 共保守纠正 ${totalFixed} 处`);
samples.forEach(s => console.log('  ' + s));
