/**
 * 根据菜名修正 cookingMethod 错标
 * - 凡名字含 汤/羹（非主食） 且 cookingMethod 不是 soup/stew/simmer → 改为 soup
 * - 凡名字含 凉拌/沙拉/salad 且 cookingMethod 不是 cold_dish → 改为 cold_dish
 */
const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const SOURCES = [
  'recipes-desserts-drinks.json',
  'recipes-quality-e.json','recipes-quality-d.json','recipes-quality-c.json',
  'recipes-quality-b.json','recipes-chinese-2.json','recipes-mega-3.json',
  'recipes-international.json','recipes-chinese-1.json',
  'recipes-hot-1.json','recipes-hot-2.json','recipes-hot-3.json','recipes.json',
  'recipes-legacy.json',
];

let fixedSoup = 0, fixedCold = 0, fixedSteam = 0, fixedFriedRice = 0, fixedStaple = 0;
const examples = [];

for (const file of SOURCES) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) continue;
  const recipes = JSON.parse(fs.readFileSync(p, 'utf8'));
  let changed = 0;

  for (const r of recipes) {
    const name = r.nameZh || '';
    // 汤类：排除 蒸X 开头（蒸蛋羹是蒸菜不是汤）和汤圆等主食例外
    const isSoupName = (/汤$|羹$/.test(name) || name.endsWith('汤') || name.endsWith('羹'))
      && !/^蒸|^清蒸|汤圆|汤饭|汤面|汤粉|汤包/.test(name);
    const isColdName = /凉拌|沙拉|salad|醉鸡|醉鹅|卤味/.test(name);
    // 蒸类：但排除 "蒸红薯/蒸玉米/蒸南瓜" 这种作为主食的淀粉蒸物（他们是 staple）
    const isTuberStaple = /^(蒸|烤|焖)(红薯|紫薯|玉米|芋头|山药|土豆|南瓜|紫米)/.test(name);
    const isSteamName = !isTuberStaple && /^蒸|^清蒸|肉末蒸|蒸鸡蛋|蒸蛋/.test(name);
    const isFriedRice = /炒饭/.test(name);
    // 盖饭/盖浇饭/卤肉饭 等主食形态（带汁浇在饭/面上）
    const isBowlStaple = /盖饭|盖浇|卤肉饭|牛肉面|红烧肉面|咖喱饭/.test(name);

    if (isSoupName && !['soup', 'stew', 'simmer'].includes(r.cookingMethod)) {
      if (examples.length < 10) examples.push(`${name} (${r.cookingMethod} → soup)`);
      r.cookingMethod = 'soup';
      fixedSoup++; changed++;
    } else if (isColdName && r.cookingMethod !== 'cold_dish') {
      if (examples.length < 30) examples.push(`${name} (${r.cookingMethod} → cold_dish)`);
      r.cookingMethod = 'cold_dish';
      fixedCold++; changed++;
    } else if (isSteamName && r.cookingMethod !== 'steam') {
      if (examples.length < 30) examples.push(`${name} (${r.cookingMethod} → steam)`);
      r.cookingMethod = 'steam';
      fixedSteam++; changed++;
    } else if (isFriedRice && !['staple', 'stir_fry'].includes(r.cookingMethod)) {
      if (examples.length < 30) examples.push(`${name} (${r.cookingMethod} → staple)`);
      r.cookingMethod = 'staple';
      fixedFriedRice++; changed++;
    } else if (isBowlStaple && !['staple'].includes(r.cookingMethod)) {
      if (examples.length < 30) examples.push(`${name} (${r.cookingMethod} → staple)`);
      r.cookingMethod = 'staple';
      fixedStaple++; changed++;
    }
  }

  if (changed > 0) {
    fs.writeFileSync(p, JSON.stringify(recipes, null, 2));
    console.log(`✏  ${file}: ${changed} 修正`);
  }
}

console.log(`\n共修正: soup ${fixedSoup}, cold_dish ${fixedCold}, steam ${fixedSteam}, fried_rice ${fixedFriedRice}, bowl_staple ${fixedStaple}`);
console.log('示例:');
for (const e of examples) console.log('  ' + e);
