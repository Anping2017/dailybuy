/**
 * 增加 10 道鸡蛋汤 (蛋汤独立分类: 介于荤汤和素汤之间)
 * 条件: 含 egg 食材, 不含红肉/海鲜
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));
const ingredients = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'ingredients.json'), 'utf8'));
const validIng = new Set(ingredients.map(i => i.id));

const cn = (regional = 'homestyle') => ({ cuisine: 'chinese', regionalCuisine: regional, status: 'reviewed' });

const NEW = [
  { ...cn(), id: 'soup_egg_tomato', nameZh: '番茄鸡蛋汤', nameEn: 'Tomato Egg Soup', cookingMethod: 'soup',
    flavors: ['sour', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 10, servings: 2,
    description: '酸鲜温暖, 国民蛋汤。',
    ingredients: [
      { ingredientId: 'tomato', amount: 200, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
    ],
    steps: ['番茄切块, 鸡蛋打散', '锅热油炒番茄出汁', '加水 600ml 煮开', '淋蛋液成蛋花, 调盐撒葱花淋香油'],
    tags: ['汤', '蛋汤', '低卡', '快手菜'],
  },
  { ...cn(), id: 'soup_egg_seaweed_flower', nameZh: '紫菜蛋花汤', nameEn: 'Seaweed Egg Drop Soup', cookingMethod: 'soup',
    flavors: ['umami', 'light'], mealTypes: ['lunch', 'dinner', 'breakfast'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 3, cookTime: 5, servings: 2,
    description: '5 分钟搞定, 鲜中带咸。',
    ingredients: [
      { ingredientId: 'nori', amount: 5, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
    ],
    steps: ['碗里放紫菜葱花盐香油', '锅烧水 500ml', '淋蛋液冲入碗中即可'],
    tags: ['汤', '蛋汤', '低卡', '快手菜'],
  },
  { ...cn(), id: 'soup_egg_loofah', nameZh: '丝瓜鸡蛋汤', nameEn: 'Luffa Egg Soup', cookingMethod: 'soup',
    flavors: ['light', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 10, servings: 2,
    description: '夏日清润蛋汤。',
    ingredients: [
      { ingredientId: 'zucchini', amount: 200, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['丝瓜去皮切块, 蛋打散', '锅热油爆姜, 下丝瓜炒 1 分钟', '加水 600ml 煮 5 分钟', '淋蛋花调盐'],
    tags: ['汤', '蛋汤', '低卡'],
  },
  { ...cn(), id: 'soup_egg_spinach', nameZh: '菠菜鸡蛋汤', nameEn: 'Spinach Egg Soup', cookingMethod: 'soup',
    flavors: ['light', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 8, servings: 2,
    description: '补铁补蛋白, 清淡养胃。',
    ingredients: [
      { ingredientId: 'spinach', amount: 200, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
    ],
    steps: ['菠菜焯水切段', '锅热油爆姜加水 600ml', '水开下菠菜淋蛋花', '调盐淋香油'],
    tags: ['汤', '蛋汤', '低卡', '补铁'],
  },
  { ...cn(), id: 'soup_egg_winter_melon', nameZh: '冬瓜鸡蛋汤', nameEn: 'Winter Melon Egg Soup', cookingMethod: 'soup',
    flavors: ['light'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 15, servings: 3,
    description: '清润利水的家常蛋汤。',
    ingredients: [
      { ingredientId: 'winter_melon', amount: 300, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
    ],
    steps: ['冬瓜去皮切片', '锅热油爆姜下冬瓜炒 2 分钟', '加水 800ml 煮 10 分钟', '淋蛋花调盐撒葱'],
    tags: ['汤', '蛋汤', '低卡', '清淡'],
  },
  { ...cn(), id: 'soup_egg_tomato_egg_drop', nameZh: '番茄蛋花汤', nameEn: 'Tomato Egg Drop Soup', cookingMethod: 'soup',
    flavors: ['sour', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 10, servings: 3,
    description: '勾薄芡的蛋花汤更顺滑。',
    ingredients: [
      { ingredientId: 'tomato', amount: 250, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'starch', amount: 10, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
    ],
    steps: ['番茄切块炒出汁', '加水 700ml 煮开', '淀粉水勾薄芡', '淋蛋花调盐撒葱淋香油'],
    tags: ['汤', '蛋汤', '低卡'],
  },
  { ...cn(), id: 'soup_egg_chinese_yam', nameZh: '山药蛋花汤', nameEn: 'Chinese Yam Egg Soup', cookingMethod: 'soup',
    flavors: ['light', 'sweet'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 8, cookTime: 15, servings: 2,
    description: '健脾养胃的温润蛋汤。',
    ingredients: [
      { ingredientId: 'yam', amount: 200, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'goji_berry', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['山药去皮切片', '加水 700ml 下姜煮 10 分钟', '加枸杞煮 1 分钟', '淋蛋花调盐'],
    tags: ['汤', '蛋汤', '低卡', '养胃'],
  },
  { ...cn('cantonese'), id: 'soup_egg_chrysanthemum', nameZh: '茼蒿鸡蛋汤', nameEn: 'Chrysanthemum Egg Soup', cookingMethod: 'soup',
    flavors: ['light', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 7, servings: 2,
    description: '茼蒿清香配蛋花。',
    ingredients: [
      { ingredientId: 'chrysanthemum_greens', amount: 200, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
    ],
    steps: ['茼蒿洗净切段', '锅热油爆姜加水 600ml', '水开下茼蒿煮 1 分钟', '淋蛋花调盐淋香油'],
    tags: ['汤', '蛋汤', '低卡', '清淡'],
  },
  { ...cn(), id: 'soup_egg_silver_ear', nameZh: '银耳蛋花汤', nameEn: 'Silver Ear Egg Soup', cookingMethod: 'soup',
    flavors: ['light', 'sweet'], mealTypes: ['lunch', 'dinner', 'breakfast'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 30, cookTime: 20, servings: 3,
    description: '滋阴润燥的甜咸蛋汤。',
    ingredients: [
      { ingredientId: 'white_fungus', amount: 30, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'goji_berry', amount: 5, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['银耳泡发撕小朵', '加水 800ml 下姜煮 15 分钟', '加枸杞煮 1 分钟', '淋蛋花调盐'],
    tags: ['汤', '蛋汤', '低卡', '润燥'],
  },
  { ...cn(), id: 'soup_egg_lettuce', nameZh: '生菜鸡蛋汤', nameEn: 'Lettuce Egg Soup', cookingMethod: 'soup',
    flavors: ['light', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 3, cookTime: 5, servings: 2,
    description: '清爽脆甜, 5 分钟蛋汤。',
    ingredients: [
      { ingredientId: 'lettuce', amount: 200, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
    ],
    steps: ['生菜撕段', '锅热油爆姜加水 500ml', '水开下生菜煮 30 秒', '淋蛋花调盐淋香油'],
    tags: ['汤', '蛋汤', '低卡', '快手菜'],
  },
];

// 校验食材 ID
let bad = [];
for (const r of NEW) {
  for (const ri of r.ingredients) {
    if (!validIng.has(ri.ingredientId)) bad.push(`${r.id}: ${ri.ingredientId}`);
  }
}
if (bad.length > 0) {
  console.error('❌ 未知食材 ID:');
  bad.forEach(b => console.error('  -', b));
  process.exit(1);
}

// 去重
const existing = new Set(recipes.map(r => r.id));
const toAdd = NEW.filter(r => !existing.has(r.id));
console.log(`新增 ${toAdd.length}/${NEW.length} 道蛋汤 (跳过 ${NEW.length - toAdd.length} 道已存在)`);

const merged = [...recipes, ...toAdd];
fs.writeFileSync(RECIPES_PATH, JSON.stringify(merged, null, 2), 'utf8');
console.log(`✅ 当前菜谱总数: ${merged.length}`);
