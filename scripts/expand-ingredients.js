const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const ings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const existingIds = new Set(ings.map(i => i.id));

const newIngredients = [
  // === 肉类 ===
  { id: 'pork_ribs', nameZh: '排骨', nameEn: 'Pork Ribs', category: 'meat', nutrition: { calories: 250, protein: 19, fat: 19, carbs: 0, fiber: 0, sodium: 65, sugar: 0 }, priceNZD: 18.99, unit: 'kg', healthTags: [] },
  { id: 'chicken_wing', nameZh: '鸡翅', nameEn: 'Chicken Wings', category: 'meat', nutrition: { calories: 203, protein: 18, fat: 14, carbs: 0, fiber: 0, sodium: 77, sugar: 0 }, priceNZD: 10.99, unit: 'kg', healthTags: [] },
  { id: 'pork_loin', nameZh: '猪里脊', nameEn: 'Pork Loin', category: 'meat', nutrition: { calories: 143, protein: 21, fat: 6, carbs: 0, fiber: 0, sodium: 53, sugar: 0 }, priceNZD: 15.99, unit: 'kg', healthTags: [] },
  { id: 'bacon', nameZh: '培根', nameEn: 'Bacon', category: 'meat', nutrition: { calories: 541, protein: 37, fat: 42, carbs: 1, fiber: 0, sodium: 1717, sugar: 0 }, priceNZD: 8.99, unit: 'pack', healthTags: ['high_fat','high_sodium'] },
  { id: 'sausage', nameZh: '香肠/腊肠', nameEn: 'Sausage', category: 'meat', nutrition: { calories: 301, protein: 12, fat: 27, carbs: 2, fiber: 0, sodium: 900, sugar: 1 }, priceNZD: 9.99, unit: 'pack', healthTags: ['high_fat','high_sodium'] },

  // === 海鲜 ===
  { id: 'squid', nameZh: '鱿鱼', nameEn: 'Squid', category: 'seafood', nutrition: { calories: 92, protein: 15, fat: 1.4, carbs: 3.1, fiber: 0, sodium: 44, sugar: 0 }, priceNZD: 22.99, unit: 'kg', healthTags: ['allergen_seafood','high_purine'] },
  { id: 'fish_fillet', nameZh: '鱼片(白肉鱼)', nameEn: 'White Fish Fillet', category: 'seafood', nutrition: { calories: 82, protein: 18, fat: 0.7, carbs: 0, fiber: 0, sodium: 78, sugar: 0 }, priceNZD: 25.99, unit: 'kg', healthTags: ['allergen_seafood'] },
  { id: 'mussel', nameZh: '青口贝', nameEn: 'Green Mussel', category: 'seafood', nutrition: { calories: 86, protein: 12, fat: 2.2, carbs: 3.7, fiber: 0, sodium: 286, sugar: 0 }, priceNZD: 8.99, unit: 'kg', healthTags: ['allergen_seafood','high_purine'] },

  // === 蔬菜 ===
  { id: 'white_radish', nameZh: '白萝卜', nameEn: 'White Radish / Daikon', category: 'vegetable', nutrition: { calories: 18, protein: 0.7, fat: 0.1, carbs: 4, fiber: 1.6, sodium: 21, sugar: 2 }, priceNZD: 3.99, unit: 'kg', healthTags: [] },
  { id: 'lettuce', nameZh: '生菜', nameEn: 'Lettuce', category: 'vegetable', nutrition: { calories: 15, protein: 1.4, fat: 0.2, carbs: 2.9, fiber: 1.3, sodium: 28, sugar: 0.8 }, priceNZD: 3.49, unit: 'piece', healthTags: [] },
  { id: 'chili_pepper', nameZh: '辣椒', nameEn: 'Chili Pepper', category: 'vegetable', nutrition: { calories: 40, protein: 2, fat: 0.4, carbs: 8.8, fiber: 1.5, sodium: 9, sugar: 5 }, priceNZD: 14.99, unit: 'kg', healthTags: [] },
  { id: 'pumpkin', nameZh: '南瓜', nameEn: 'Pumpkin', category: 'vegetable', nutrition: { calories: 26, protein: 1, fat: 0.1, carbs: 6.5, fiber: 0.5, sodium: 1, sugar: 2.8 }, priceNZD: 3.49, unit: 'kg', healthTags: [] },
  { id: 'cabbage', nameZh: '卷心菜/包菜', nameEn: 'Cabbage', category: 'vegetable', nutrition: { calories: 25, protein: 1.3, fat: 0.1, carbs: 5.8, fiber: 2.5, sodium: 18, sugar: 3.2 }, priceNZD: 3.49, unit: 'piece', healthTags: [] },
  { id: 'leek', nameZh: '韭菜', nameEn: 'Chinese Leek / Garlic Chives', category: 'vegetable', nutrition: { calories: 30, protein: 3, fat: 0.3, carbs: 4.4, fiber: 2.6, sodium: 35, sugar: 1.5 }, priceNZD: 4.99, unit: 'bunch', healthTags: [] },
  { id: 'snow_pea', nameZh: '荷兰豆', nameEn: 'Snow Pea', category: 'vegetable', nutrition: { calories: 42, protein: 3, fat: 0.2, carbs: 7.5, fiber: 2.6, sodium: 4, sugar: 4 }, priceNZD: 5.99, unit: 'pack', healthTags: [] },
  { id: 'asparagus', nameZh: '芦笋', nameEn: 'Asparagus', category: 'vegetable', nutrition: { calories: 20, protein: 2.2, fat: 0.1, carbs: 3.9, fiber: 2.1, sodium: 2, sugar: 1.9 }, priceNZD: 5.99, unit: 'bunch', healthTags: [] },
  { id: 'lotus_root', nameZh: '莲藕', nameEn: 'Lotus Root', category: 'vegetable', nutrition: { calories: 74, protein: 2.6, fat: 0.1, carbs: 17, fiber: 4.9, sodium: 40, sugar: 0 }, priceNZD: 9.99, unit: 'kg', healthTags: [] },
  { id: 'bitter_melon', nameZh: '苦瓜', nameEn: 'Bitter Melon', category: 'vegetable', nutrition: { calories: 17, protein: 1, fat: 0.2, carbs: 3.7, fiber: 2.8, sodium: 5, sugar: 1 }, priceNZD: 6.99, unit: 'kg', healthTags: [] },
  { id: 'cauliflower', nameZh: '花菜/菜花', nameEn: 'Cauliflower', category: 'vegetable', nutrition: { calories: 25, protein: 2, fat: 0.3, carbs: 5, fiber: 2, sodium: 30, sugar: 2 }, priceNZD: 4.49, unit: 'piece', healthTags: [] },
  { id: 'winter_melon', nameZh: '冬瓜', nameEn: 'Winter Melon', category: 'vegetable', nutrition: { calories: 12, protein: 0.4, fat: 0.2, carbs: 2.6, fiber: 0.7, sodium: 111, sugar: 0 }, priceNZD: 3.99, unit: 'kg', healthTags: [] },

  // === 干货 ===
  { id: 'wood_ear', nameZh: '木耳(干)', nameEn: 'Dried Wood Ear Mushroom', category: 'dried', nutrition: { calories: 284, protein: 10, fat: 0.5, carbs: 65, fiber: 30, sodium: 35, sugar: 0 }, priceNZD: 6.99, unit: 'pack', healthTags: [] },
  { id: 'dried_tofu_skin', nameZh: '腐竹(干)', nameEn: 'Dried Tofu Skin', category: 'dried', nutrition: { calories: 459, protein: 45, fat: 22, carbs: 22, fiber: 1, sodium: 14, sugar: 3 }, priceNZD: 5.99, unit: 'pack', healthTags: ['allergen_soy'] },
  { id: 'dried_shrimp', nameZh: '虾皮/虾米', nameEn: 'Dried Shrimp', category: 'dried', nutrition: { calories: 292, protein: 56, fat: 3.7, carbs: 6.5, fiber: 0, sodium: 5057, sugar: 0 }, priceNZD: 7.99, unit: 'pack', healthTags: ['high_sodium','allergen_seafood','high_purine'] },
  { id: 'dried_mushroom', nameZh: '香菇(干)', nameEn: 'Dried Shiitake Mushroom', category: 'dried', nutrition: { calories: 296, protein: 10, fat: 1.3, carbs: 64, fiber: 11, sodium: 13, sugar: 2 }, priceNZD: 8.99, unit: 'pack', healthTags: ['high_purine'] },
  { id: 'vermicelli', nameZh: '粉丝/粉条', nameEn: 'Glass Noodles / Vermicelli', category: 'dried', nutrition: { calories: 351, protein: 0.1, fat: 0.1, carbs: 86, fiber: 0.5, sodium: 10, sugar: 0 }, priceNZD: 2.99, unit: 'pack', healthTags: ['high_gi'] },

  // === 豆类 ===
  { id: 'dried_tofu', nameZh: '豆腐干/豆干', nameEn: 'Dried Tofu / Pressed Tofu', category: 'bean', nutrition: { calories: 140, protein: 16, fat: 8, carbs: 3, fiber: 0.5, sodium: 14, sugar: 0.7 }, priceNZD: 3.99, unit: 'pack', healthTags: ['allergen_soy'] },
  { id: 'tofu_puff', nameZh: '油豆腐', nameEn: 'Fried Tofu Puff', category: 'bean', nutrition: { calories: 271, protein: 17, fat: 20, carbs: 5, fiber: 1, sodium: 8, sugar: 1 }, priceNZD: 3.49, unit: 'pack', healthTags: ['allergen_soy','high_fat'] },
  { id: 'edamame', nameZh: '毛豆', nameEn: 'Edamame', category: 'bean', nutrition: { calories: 122, protein: 11, fat: 5, carbs: 9, fiber: 5, sodium: 6, sugar: 2 }, priceNZD: 4.99, unit: 'pack', healthTags: ['allergen_soy'] },

  // === 调料 ===
  { id: 'salt', nameZh: '盐', nameEn: 'Salt', category: 'seasoning', nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 38758, sugar: 0 }, priceNZD: 1.49, unit: 'pack', healthTags: ['high_sodium'] },
  { id: 'white_pepper', nameZh: '白胡椒粉', nameEn: 'White Pepper', category: 'seasoning', nutrition: { calories: 296, protein: 10, fat: 2, carbs: 64, fiber: 26, sodium: 5, sugar: 0 }, priceNZD: 3.99, unit: 'pack', healthTags: [] },
  { id: 'five_spice', nameZh: '五香粉', nameEn: 'Five Spice Powder', category: 'seasoning', nutrition: { calories: 325, protein: 6, fat: 15, carbs: 47, fiber: 22, sodium: 20, sugar: 0 }, priceNZD: 3.49, unit: 'pack', healthTags: [] },
  { id: 'chili_flakes', nameZh: '辣椒粉/辣椒面', nameEn: 'Chili Flakes', category: 'seasoning', nutrition: { calories: 282, protein: 12, fat: 14, carbs: 30, fiber: 27, sodium: 30, sugar: 10 }, priceNZD: 3.99, unit: 'pack', healthTags: [] },
  { id: 'tomato_paste', nameZh: '番茄酱', nameEn: 'Tomato Paste / Ketchup', category: 'seasoning', nutrition: { calories: 112, protein: 1.3, fat: 0.1, carbs: 26, fiber: 0.3, sodium: 907, sugar: 22 }, priceNZD: 3.49, unit: 'bottle', healthTags: ['high_sodium','high_sugar'] },
  { id: 'light_soy', nameZh: '生抽', nameEn: 'Light Soy Sauce', category: 'seasoning', nutrition: { calories: 53, protein: 8, fat: 0.1, carbs: 4.9, fiber: 0, sodium: 5637, sugar: 0 }, priceNZD: 4.49, unit: 'bottle', healthTags: ['high_sodium','allergen_soy'] },
  { id: 'dark_soy', nameZh: '老抽', nameEn: 'Dark Soy Sauce', category: 'seasoning', nutrition: { calories: 60, protein: 5, fat: 0.1, carbs: 9, fiber: 0, sodium: 5220, sugar: 5 }, priceNZD: 4.49, unit: 'bottle', healthTags: ['high_sodium','allergen_soy'] },
  { id: 'bean_paste', nameZh: '甜面酱', nameEn: 'Sweet Bean Paste', category: 'seasoning', nutrition: { calories: 175, protein: 5, fat: 1, carbs: 37, fiber: 2, sodium: 3300, sugar: 15 }, priceNZD: 3.99, unit: 'bottle', healthTags: ['high_sodium','allergen_soy'] },
  { id: 'sichuan_pepper', nameZh: '花椒', nameEn: 'Sichuan Pepper', category: 'seasoning', nutrition: { calories: 264, protein: 10, fat: 3, carbs: 50, fiber: 18, sodium: 9, sugar: 0 }, priceNZD: 4.99, unit: 'pack', healthTags: [] },
  { id: 'star_anise', nameZh: '八角', nameEn: 'Star Anise', category: 'seasoning', nutrition: { calories: 337, protein: 18, fat: 16, carbs: 50, fiber: 15, sodium: 16, sugar: 0 }, priceNZD: 3.99, unit: 'pack', healthTags: [] },
  { id: 'cumin', nameZh: '孜然', nameEn: 'Cumin', category: 'seasoning', nutrition: { calories: 375, protein: 18, fat: 22, carbs: 44, fiber: 11, sodium: 168, sugar: 2 }, priceNZD: 3.99, unit: 'pack', healthTags: [] },

  // === 蛋奶 ===
  { id: 'butter', nameZh: '黄油', nameEn: 'Butter', category: 'egg_dairy', nutrition: { calories: 717, protein: 0.9, fat: 81, carbs: 0.1, fiber: 0, sodium: 11, sugar: 0.1 }, priceNZD: 5.99, unit: 'pack', healthTags: ['allergen_dairy','high_fat'] },
  { id: 'cream', nameZh: '淡奶油', nameEn: 'Cream', category: 'egg_dairy', nutrition: { calories: 340, protein: 2, fat: 36, carbs: 3, fiber: 0, sodium: 34, sugar: 3 }, priceNZD: 5.49, unit: 'pack', healthTags: ['allergen_dairy','high_fat'] },
  { id: 'yogurt', nameZh: '酸奶', nameEn: 'Yogurt', category: 'egg_dairy', nutrition: { calories: 61, protein: 3.5, fat: 3.3, carbs: 4.7, fiber: 0, sodium: 46, sugar: 4.7 }, priceNZD: 4.99, unit: 'pack', healthTags: ['allergen_dairy'] },

  // === 水果 ===
  { id: 'lemon', nameZh: '柠檬', nameEn: 'Lemon', category: 'fruit', nutrition: { calories: 29, protein: 1.1, fat: 0.3, carbs: 9, fiber: 2.8, sodium: 2, sugar: 2.5 }, priceNZD: 1.49, unit: 'piece', healthTags: [] },
  { id: 'orange', nameZh: '橙子', nameEn: 'Orange', category: 'fruit', nutrition: { calories: 47, protein: 0.9, fat: 0.1, carbs: 12, fiber: 2.4, sodium: 0, sugar: 9 }, priceNZD: 4.99, unit: 'kg', healthTags: [] },
  { id: 'kiwi', nameZh: '猕猴桃', nameEn: 'Kiwifruit', category: 'fruit', nutrition: { calories: 61, protein: 1.1, fat: 0.5, carbs: 15, fiber: 3, sodium: 3, sugar: 9 }, priceNZD: 4.99, unit: 'kg', healthTags: [] },
  { id: 'avocado', nameZh: '牛油果', nameEn: 'Avocado', category: 'fruit', nutrition: { calories: 160, protein: 2, fat: 15, carbs: 9, fiber: 7, sodium: 7, sugar: 0.7 }, priceNZD: 3.49, unit: 'piece', healthTags: ['high_fat'] },

  // === 谷物 ===
  { id: 'flour', nameZh: '面粉', nameEn: 'Flour', category: 'grain', nutrition: { calories: 364, protein: 10, fat: 1, carbs: 76, fiber: 2.7, sodium: 2, sugar: 0.3 }, priceNZD: 2.49, unit: 'kg', healthTags: ['allergen_gluten','high_gi'] },
  { id: 'oats', nameZh: '燕麦', nameEn: 'Oats', category: 'grain', nutrition: { calories: 389, protein: 17, fat: 7, carbs: 66, fiber: 11, sodium: 2, sugar: 1 }, priceNZD: 4.99, unit: 'kg', healthTags: ['allergen_gluten'] },
  { id: 'wonton_wrapper', nameZh: '馄饨皮/饺子皮', nameEn: 'Wonton/Dumpling Wrapper', category: 'grain', nutrition: { calories: 291, protein: 8, fat: 1, carbs: 60, fiber: 2, sodium: 430, sugar: 1 }, priceNZD: 3.49, unit: 'pack', healthTags: ['allergen_gluten','high_gi'] },
];

let added = 0;
for (const ni of newIngredients) {
  if (!existingIds.has(ni.id)) {
    if (!ni.season) ni.season = [];
    ings.push(ni);
    existingIds.add(ni.id);
    added++;
  }
}

fs.writeFileSync(path.join(DATA_DIR, 'ingredients.json'), JSON.stringify(ings, null, 2));
console.log('新增', added, '个食材, 总计', ings.length, '个');

// 按分类统计
const byCat = {};
for (const i of ings) { byCat[i.category] = (byCat[i.category]||0)+1; }
console.log('分类:', byCat);
