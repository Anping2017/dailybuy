/**
 * 补充菜谱待新增的食材到食材库
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const ings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const existingIds = new Set(ings.map(i => i.id));

const newIngredients = [
  {
    id: 'curry_paste',
    nameZh: '咖喱酱',
    nameEn: 'Curry Paste',
    category: 'seasoning',
    nutrition: { calories: 150, protein: 3, fat: 12, carbs: 8, fiber: 2.5, sodium: 1850, sugar: 2 },
    priceNZD: 5.99,
    unit: 'bottle',
    allergens: [],
    warnings: ['high_sodium', 'high_fat'],
    highlights: [],
    supermarkets: ['countdown', 'paknsave', 'newworld', 'asian_grocery'],
    season: [],
  },
  {
    id: 'kimchi',
    nameZh: '韩式泡菜',
    nameEn: 'Kimchi',
    category: 'vegetable',
    nutrition: { calories: 15, protein: 1.1, fat: 0.5, carbs: 2.4, fiber: 1.6, sodium: 670, sugar: 0.8 },
    priceNZD: 6.99,
    unit: 'pack',
    allergens: [],
    warnings: ['high_sodium'],
    highlights: ['high_fiber', 'low_calorie'],
    supermarkets: ['countdown', 'paknsave', 'newworld', 'asian_grocery'],
    season: [],
  },
  {
    id: 'beef_stock',
    nameZh: '牛肉高汤',
    nameEn: 'Beef Stock',
    category: 'seasoning',
    nutrition: { calories: 20, protein: 3, fat: 0.5, carbs: 1, fiber: 0, sodium: 450, sugar: 0.5 },
    priceNZD: 3.99,
    unit: 'bottle',
    allergens: [],
    warnings: ['high_sodium'],
    highlights: ['low_calorie', 'high_protein'],
    supermarkets: ['countdown', 'paknsave', 'newworld'],
    season: [],
  },
  {
    id: 'miso',
    nameZh: '味噌',
    nameEn: 'Miso Paste',
    category: 'seasoning',
    nutrition: { calories: 199, protein: 12, fat: 6, carbs: 26, fiber: 5.4, sodium: 3728, sugar: 6.2 },
    priceNZD: 8.99,
    unit: 'bottle',
    allergens: ['allergen_soy'],
    warnings: ['high_sodium'],
    highlights: ['high_protein', 'high_fiber'],
    supermarkets: ['countdown', 'newworld', 'asian_grocery'],
    season: [],
  },
  {
    id: 'rice_flour',
    nameZh: '粘米粉',
    nameEn: 'Rice Flour',
    category: 'grain',
    nutrition: { calories: 366, protein: 6, fat: 1.4, carbs: 80, fiber: 2.4, sodium: 0, sugar: 0.1 },
    priceNZD: 3.49,
    unit: 'pack',
    allergens: [],
    warnings: ['high_gi'],
    highlights: ['whole_grain'],
    supermarkets: ['countdown', 'paknsave', 'asian_grocery'],
    season: [],
  },
  {
    id: 'wheat_starch',
    nameZh: '澄粉',
    nameEn: 'Wheat Starch',
    category: 'grain',
    nutrition: { calories: 360, protein: 0.3, fat: 0.2, carbs: 89, fiber: 0.2, sodium: 2, sugar: 0 },
    priceNZD: 3.99,
    unit: 'pack',
    allergens: ['allergen_gluten'],
    warnings: ['high_gi'],
    highlights: [],
    supermarkets: ['asian_grocery', 'countdown'],
    season: [],
  },
];

let added = 0;
for (const ni of newIngredients) {
  if (!existingIds.has(ni.id)) {
    ings.push(ni);
    added++;
  }
}

fs.writeFileSync(path.join(DATA_DIR, 'ingredients.json'), JSON.stringify(ings, null, 2));
console.log('新增', added, '个食材, 食材库总计', ings.length);

// 验证所有菜谱食材都已覆盖
const recipes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'recipes-all.json'), 'utf8'));
const allIngIds = new Set(ings.map(i => i.id));
const missing = new Set();
for (const r of recipes) {
  for (const ri of r.ingredients) {
    if (!allIngIds.has(ri.ingredientId)) missing.add(ri.ingredientId);
  }
}
console.log('待新增食材:', missing.size === 0 ? '无 ✓' : [...missing].join(', '));
