/**
 * 批量修复菜谱里 piece 单位错配在调料/油上的问题
 * 把 "X piece star_anise" 之类换算成实际克数
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const ingredients = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const ingMap = new Map(ingredients.map(i => [i.id, i]));

// 单个的实际克重(植物干料)
const PIECE_TO_GRAMS = {
  // 干香料
  star_anise: 0.3,        // 八角 1 个 ≈ 0.3g
  bay_leaf: 0.1,          // 香叶 1 片 ≈ 0.1g
  cinnamon: 5,            // 肉桂 1 段 ≈ 5g
  lemongrass: 15,         // 香茅 1 根 ≈ 15g
  kaffir_lime_leaf: 0.5,  // 青柠叶 1 片 ≈ 0.5g
  cloves: 0.05,           // 丁香 1 粒 ≈ 0.05g
  // 干货
  dried_mushroom: 3,      // 干香菇 1 朵 ≈ 3g
  dried_shiitake: 3,
  wood_ear: 1,            // 木耳干 1 朵 ≈ 1g
  dried_lily_bud: 0.3,    // 黄花菜干 1 根 ≈ 0.3g
  red_date: 5,            // 红枣 1 颗 ≈ 5g
  goji_berry: 0.2,        // 枸杞 1 粒 ≈ 0.2g
  chestnut: 8,            // 板栗 1 颗 ≈ 8g
  walnut: 4,              // 核桃 1 颗(去壳)≈ 4g
  // 蔬菜小颗粒
  garlic: 5,              // 大蒜 1 瓣 ≈ 5g
  ginger: 10,             // 生姜 1 片 ≈ 10g
  spring_onion: 15,       // 葱 1 根 ≈ 15g (虽然不太用 piece)
  chili_pepper: 5,        // 辣椒 1 根 ≈ 5g
};

// 所有源文件 + 主合并文件
const FILES = [
  'recipes-all.json',
  'recipes.json',
  'recipes-chinese-1.json',
  'recipes-chinese-2.json',
  'recipes-international.json',
  'recipes-hot-1.json',
  'recipes-hot-2.json',
  'recipes-hot-3.json',
  'recipes-mega-3.json',
  'recipes-quality-b.json',
  'recipes-quality-c.json',
  'recipes-quality-d.json',
  'recipes-quality-e.json',
];

let totalFixed = 0;
const sample = [];

for (const file of FILES) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) continue;
  const recipes = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let fileFixed = 0;

  for (const r of recipes) {
    if (!r.ingredients) continue;
    for (const ri of r.ingredients) {
      const ing = ingMap.get(ri.ingredientId);
      if (!ing) continue;
      if (ri.unit !== 'piece') continue;
      // 只处理已知的小颗粒/干货/调料,或调料/油默认 1g
      const known = PIECE_TO_GRAMS[ri.ingredientId];
      if (known === undefined && ing.category !== 'seasoning' && ing.category !== 'oil' && ing.category !== 'dried') continue;

      const perPiece = known ?? (ing.category === 'dried' ? 5 : 1);
      const newGrams = Math.round(ri.amount * perPiece * 10) / 10;
      if (sample.length < 8) sample.push(`${file}:${r.id} ${ri.ingredientId} ${ri.amount}piece → ${newGrams}g`);
      ri.amount = newGrams;
      ri.unit = 'g';
      fileFixed++;
      totalFixed++;
    }
  }

  if (fileFixed > 0) {
    fs.writeFileSync(fp, JSON.stringify(recipes, null, 2));
    console.log(`✏  ${file}: 修复 ${fileFixed} 处`);
  }
}

console.log(`\n✅ 共修复 ${totalFixed} 处单位错配`);
console.log('示例:');
sample.forEach(s => console.log('  ' + s));
