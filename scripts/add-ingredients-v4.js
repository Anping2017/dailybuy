/**
 * v4 食材补充：点心/饮品/甜品相关
 */
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const ings = JSON.parse(fs.readFileSync(p, 'utf8'));
const existing = new Set(ings.map(i => i.id));

const NEW = [
  // 咖啡
  { id: 'coffee_beans', nameZh: '咖啡豆', nameEn: 'Coffee Beans', category: 'dried', nutrition: { calories: 200, protein: 13, fat: 15, carbs: 35, fiber: 25 }, priceNZD: 20, unit: 'kg', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'espresso', nameZh: '浓缩咖啡', nameEn: 'Espresso Shot', category: 'seasoning', nutrition: { calories: 2, protein: 0.1, fat: 0, carbs: 0.4, fiber: 0 }, priceNZD: 3, unit: '份', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'instant_coffee', nameZh: '速溶咖啡粉', nameEn: 'Instant Coffee', category: 'dried', nutrition: { calories: 7, protein: 0.3, fat: 0, carbs: 1.2, fiber: 0 }, priceNZD: 12, unit: '瓶', allergens: [], warnings: [], highlights: [], season: ['all'] },
  // 茶叶
  { id: 'matcha_powder', nameZh: '抹茶粉', nameEn: 'Matcha Powder', category: 'dried', nutrition: { calories: 324, protein: 31, fat: 5, carbs: 39, fiber: 38 }, priceNZD: 25, unit: '罐', allergens: [], warnings: [], highlights: ['high_fiber'], season: ['all'] },
  { id: 'tea_black', nameZh: '红茶', nameEn: 'Black Tea', category: 'dried', nutrition: { calories: 1, protein: 0, fat: 0, carbs: 0.3, fiber: 0 }, priceNZD: 10, unit: '包', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'tea_green', nameZh: '绿茶', nameEn: 'Green Tea', category: 'dried', nutrition: { calories: 1, protein: 0, fat: 0, carbs: 0.2, fiber: 0 }, priceNZD: 10, unit: '包', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'tea_oolong', nameZh: '乌龙茶', nameEn: 'Oolong Tea', category: 'dried', nutrition: { calories: 1, protein: 0, fat: 0, carbs: 0.2, fiber: 0 }, priceNZD: 12, unit: '包', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'tea_jasmine', nameZh: '茉莉花茶', nameEn: 'Jasmine Tea', category: 'dried', nutrition: { calories: 1, protein: 0, fat: 0, carbs: 0.2, fiber: 0 }, priceNZD: 12, unit: '包', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'tea_puer', nameZh: '普洱茶', nameEn: 'Pu-erh Tea', category: 'dried', nutrition: { calories: 1, protein: 0, fat: 0, carbs: 0.2, fiber: 0 }, priceNZD: 15, unit: '饼', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'tea_earl_grey', nameZh: '伯爵茶', nameEn: 'Earl Grey Tea', category: 'dried', nutrition: { calories: 1, protein: 0, fat: 0, carbs: 0.3, fiber: 0 }, priceNZD: 12, unit: '包', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'tea_tieguanyin', nameZh: '铁观音', nameEn: 'Tieguanyin Oolong', category: 'dried', nutrition: { calories: 1, protein: 0, fat: 0, carbs: 0.2, fiber: 0 }, priceNZD: 18, unit: '包', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'tea_longjing', nameZh: '龙井茶', nameEn: 'Longjing Green Tea', category: 'dried', nutrition: { calories: 1, protein: 0, fat: 0, carbs: 0.2, fiber: 0 }, priceNZD: 20, unit: '罐', allergens: [], warnings: [], highlights: [], season: ['all'] },
  // 花草
  { id: 'chamomile', nameZh: '甘菊', nameEn: 'Chamomile', category: 'dried', nutrition: { calories: 1, protein: 0, fat: 0, carbs: 0.3, fiber: 0 }, priceNZD: 8, unit: '包', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'chrysanthemum', nameZh: '菊花', nameEn: 'Chrysanthemum Flower', category: 'dried', nutrition: { calories: 25, protein: 2.5, fat: 0.5, carbs: 4, fiber: 3 }, priceNZD: 8, unit: '包', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'osmanthus', nameZh: '桂花', nameEn: 'Osmanthus Flower', category: 'dried', nutrition: { calories: 15, protein: 1, fat: 0.2, carbs: 3, fiber: 2 }, priceNZD: 15, unit: '瓶', allergens: [], warnings: [], highlights: [], season: ['3','4','9','10'] },
  // 巧克力/可可
  { id: 'chocolate_dark', nameZh: '黑巧克力', nameEn: 'Dark Chocolate', category: 'dried', nutrition: { calories: 598, protein: 7.8, fat: 43, carbs: 46, fiber: 11 }, priceNZD: 15, unit: 'kg', allergens: [], warnings: ['high_sugar', 'high_fat'], highlights: [], season: ['all'] },
  { id: 'chocolate_white', nameZh: '白巧克力', nameEn: 'White Chocolate', category: 'dried', nutrition: { calories: 539, protein: 5.9, fat: 32, carbs: 59, fiber: 0 }, priceNZD: 12, unit: 'kg', allergens: ['allergen_dairy'], warnings: ['high_sugar', 'high_fat'], highlights: [], season: ['all'] },
  { id: 'cocoa_powder', nameZh: '可可粉', nameEn: 'Cocoa Powder', category: 'seasoning', nutrition: { calories: 228, protein: 19.6, fat: 14, carbs: 58, fiber: 33 }, priceNZD: 8, unit: '罐', allergens: [], warnings: [], highlights: ['high_fiber'], season: ['all'] },
  // 烘焙
  { id: 'baking_powder', nameZh: '泡打粉', nameEn: 'Baking Powder', category: 'seasoning', nutrition: { calories: 53, protein: 0, fat: 0, carbs: 28, fiber: 0 }, priceNZD: 5, unit: '罐', allergens: [], warnings: ['high_sodium'], highlights: [], season: ['all'] },
  { id: 'baking_soda', nameZh: '小苏打', nameEn: 'Baking Soda', category: 'seasoning', nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }, priceNZD: 3, unit: '包', allergens: [], warnings: ['high_sodium'], highlights: [], season: ['all'] },
  { id: 'yeast', nameZh: '酵母', nameEn: 'Yeast', category: 'seasoning', nutrition: { calories: 325, protein: 40, fat: 7.6, carbs: 41, fiber: 27 }, priceNZD: 6, unit: '包', allergens: [], warnings: [], highlights: ['high_protein'], season: ['all'] },
  { id: 'gelatin', nameZh: '明胶/吉利丁', nameEn: 'Gelatin', category: 'dried', nutrition: { calories: 335, protein: 86, fat: 0.1, carbs: 0, fiber: 0 }, priceNZD: 8, unit: '包', allergens: [], warnings: [], highlights: ['high_protein'], season: ['all'] },
  { id: 'heavy_cream', nameZh: '重奶油', nameEn: 'Heavy Cream', category: 'egg_dairy', nutrition: { calories: 340, protein: 2.8, fat: 36, carbs: 2.8, fiber: 0 }, priceNZD: 6, unit: '盒', allergens: ['allergen_dairy'], warnings: ['high_fat'], highlights: [], season: ['all'] },
  { id: 'cake_flour', nameZh: '低筋面粉', nameEn: 'Cake Flour', category: 'grain', nutrition: { calories: 362, protein: 8.5, fat: 0.8, carbs: 78, fiber: 2.5 }, priceNZD: 5, unit: '包', allergens: ['allergen_gluten'], warnings: [], highlights: [], season: ['all'] },
  { id: 'bread_flour', nameZh: '高筋面粉', nameEn: 'Bread Flour', category: 'grain', nutrition: { calories: 361, protein: 13, fat: 1.2, carbs: 73, fiber: 2.7 }, priceNZD: 5, unit: '包', allergens: ['allergen_gluten'], warnings: [], highlights: [], season: ['all'] },
  { id: 'custard_powder', nameZh: '卡士达粉', nameEn: 'Custard Powder', category: 'seasoning', nutrition: { calories: 380, protein: 1, fat: 0.5, carbs: 94, fiber: 0 }, priceNZD: 6, unit: '罐', allergens: ['allergen_gluten'], warnings: [], highlights: [], season: ['all'] },
  // 糖水/中式点心
  { id: 'sago', nameZh: '西米', nameEn: 'Sago', category: 'grain', nutrition: { calories: 355, protein: 0.2, fat: 0, carbs: 88, fiber: 0.5 }, priceNZD: 6, unit: '包', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'tapioca_pearl', nameZh: '珍珠粉圆', nameEn: 'Tapioca Pearls', category: 'grain', nutrition: { calories: 358, protein: 0.2, fat: 0, carbs: 89, fiber: 0.9 }, priceNZD: 8, unit: '包', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'grass_jelly', nameZh: '仙草冻', nameEn: 'Grass Jelly', category: 'dried', nutrition: { calories: 23, protein: 0.2, fat: 0, carbs: 5.6, fiber: 0.2 }, priceNZD: 5, unit: '罐', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'snow_pear', nameZh: '雪梨', nameEn: 'Snow Pear', category: 'fruit', nutrition: { calories: 57, protein: 0.4, fat: 0.1, carbs: 15, fiber: 3.1 }, priceNZD: 4, unit: 'kg', allergens: [], warnings: [], highlights: ['high_fiber'], season: ['9','10','11','12'] },
  { id: 'black_sesame', nameZh: '黑芝麻', nameEn: 'Black Sesame', category: 'dried', nutrition: { calories: 573, protein: 18, fat: 50, carbs: 23, fiber: 12 }, priceNZD: 12, unit: 'kg', allergens: ['allergen_sesame'], warnings: [], highlights: ['high_fiber'], season: ['all'] },
  { id: 'purple_sweet_potato', nameZh: '紫薯', nameEn: 'Purple Sweet Potato', category: 'vegetable', nutrition: { calories: 86, protein: 1.6, fat: 0.1, carbs: 20, fiber: 3 }, priceNZD: 5, unit: 'kg', allergens: [], warnings: [], highlights: ['high_fiber'], season: ['all'] },
  // 水果
  { id: 'passion_fruit', nameZh: '百香果', nameEn: 'Passion Fruit', category: 'fruit', nutrition: { calories: 97, protein: 2.2, fat: 0.7, carbs: 23, fiber: 10 }, priceNZD: 15, unit: 'kg', allergens: [], warnings: [], highlights: ['high_fiber'], season: ['3','4','5'] },
  { id: 'yuzu', nameZh: '柚子/香橙', nameEn: 'Yuzu', category: 'fruit', nutrition: { calories: 50, protein: 0.8, fat: 0.3, carbs: 13, fiber: 1.9 }, priceNZD: 8, unit: 'kg', allergens: [], warnings: [], highlights: [], season: ['10','11','12'] },
  // 其他
  { id: 'sparkling_water', nameZh: '气泡水', nameEn: 'Sparkling Water', category: 'seasoning', nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }, priceNZD: 3, unit: '瓶', allergens: [], warnings: [], highlights: [], season: ['all'] },
  { id: 'cornstarch', nameZh: '玉米淀粉', nameEn: 'Cornstarch', category: 'grain', nutrition: { calories: 381, protein: 0.3, fat: 0, carbs: 91, fiber: 0.9 }, priceNZD: 4, unit: '包', allergens: [], warnings: [], highlights: [], season: ['all'] },
];

let added = 0;
for (const n of NEW) {
  if (!existing.has(n.id)) { ings.push(n); added++; console.log('+', n.id, n.nameZh); }
  else console.log('=', n.id, '(exists)');
}
fs.writeFileSync(p, JSON.stringify(ings, null, 2));
console.log(`\n添加 ${added}，总数 ${ings.length}`);
