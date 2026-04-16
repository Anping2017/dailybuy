/**
 * v3 食材补充：Phase B/C/D 菜谱所需的关键食材
 */
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const ings = JSON.parse(fs.readFileSync(p, 'utf8'));
const existing = new Set(ings.map(i => i.id));

const NEW = [
  { id: 'tuna', nameZh: '金枪鱼罐头', nameEn: 'Canned Tuna', category: 'seafood', nutrition: { calories: 116, protein: 26, fat: 1, carbs: 0, fiber: 0 }, priceNZD: 2.5, unit: '罐', healthTags: ['high_protein', 'low_fat'], supermarkets: ['countdown', 'new_world', 'pak_n_save'], season: ['all'] },
  { id: 'pita', nameZh: '口袋面包', nameEn: 'Pita Bread', category: 'grain', nutrition: { calories: 275, protein: 9, fat: 1.2, carbs: 55, fiber: 2.2 }, priceNZD: 5, unit: '包', healthTags: [], supermarkets: ['countdown', 'new_world'], season: ['all'] },
  { id: 'naan', nameZh: '印度烤饼', nameEn: 'Naan', category: 'grain', nutrition: { calories: 310, protein: 9, fat: 6, carbs: 54, fiber: 2 }, priceNZD: 6, unit: '包', healthTags: [], supermarkets: ['countdown', 'asian_grocery'], season: ['all'] },
  { id: 'olive', nameZh: '橄榄', nameEn: 'Olives', category: 'vegetable', nutrition: { calories: 115, protein: 0.8, fat: 11, carbs: 6, fiber: 3.2 }, priceNZD: 4, unit: '罐', healthTags: ['heart_healthy'], supermarkets: ['countdown', 'new_world'], season: ['all'] },
  { id: 'vanilla', nameZh: '香草精', nameEn: 'Vanilla Extract', category: 'seasoning', nutrition: { calories: 288, protein: 0, fat: 0, carbs: 13, fiber: 0 }, priceNZD: 8, unit: '瓶', healthTags: [], supermarkets: ['countdown'], season: ['all'] },
  { id: 'palm_sugar', nameZh: '棕榈糖', nameEn: 'Palm Sugar', category: 'seasoning', nutrition: { calories: 383, protein: 0, fat: 0, carbs: 96, fiber: 0 }, priceNZD: 6, unit: '包', healthTags: [], supermarkets: ['asian_grocery'], season: ['all'] },
  { id: 'tamarind', nameZh: '罗望子', nameEn: 'Tamarind Paste', category: 'seasoning', nutrition: { calories: 239, protein: 2.8, fat: 0.6, carbs: 63, fiber: 5.1 }, priceNZD: 5, unit: '瓶', healthTags: [], supermarkets: ['asian_grocery'], season: ['all'] },
  { id: 'pandanus', nameZh: '班兰叶', nameEn: 'Pandan Leaf', category: 'seasoning', nutrition: { calories: 33, protein: 1, fat: 0.2, carbs: 7.6, fiber: 4 }, priceNZD: 3, unit: '把', healthTags: [], supermarkets: ['asian_grocery'], season: ['all'] },
];

let added = 0;
for (const n of NEW) {
  if (!existing.has(n.id)) { ings.push(n); added++; console.log('+', n.id, n.nameZh); }
  else console.log('=', n.id, '(exists)');
}
fs.writeFileSync(p, JSON.stringify(ings, null, 2));
console.log(`\n添加 ${added}，总数 ${ings.length}`);
