/**
 * 加 2 人份的低卡汤和粥 (清淡为主)
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));
const ingredients = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'ingredients.json'), 'utf8'));
const validIng = new Set(ingredients.map(i => i.id));

const base = (cuisine = 'chinese', regional = 'homestyle') => ({
  cuisine, regionalCuisine: regional, status: 'reviewed',
});

const NEW = [
  // ===== 2 人份低卡汤 =====
  {
    ...base(), id: 'soup_2p_seaweed_egg', nameZh: '紫菜虾皮蛋花汤(2人份)', nameEn: 'Seaweed Shrimp Egg Soup 2p',
    cookingMethod: 'soup', flavors: ['umami', 'light'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 3, cookTime: 5, servings: 2,
    description: '快手低卡汤，2 人份。',
    ingredients: [
      { ingredientId: 'nori', amount: 10, unit: 'g' },
      { ingredientId: 'dried_shrimp', amount: 8, unit: 'g' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['水800ml烧开下虾皮', '紫菜撕碎下锅', '淋蛋花', '调盐撒葱花香油'],
    tags: ['汤', '低卡', '快手菜'],
  },
  {
    ...base(), id: 'soup_2p_tomato_egg', nameZh: '番茄蛋花汤(2人份)', nameEn: 'Tomato Egg Soup 2p',
    cookingMethod: 'soup', flavors: ['sour', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 3, cookTime: 8, servings: 2,
    description: '酸甜清爽。',
    ingredients: [
      { ingredientId: 'tomato', amount: 200, unit: 'g' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['番茄切块', '锅热油炒番茄出汁', '加水800ml煮开', '淋蛋花调盐撒葱'],
    tags: ['汤', '低卡', '快手菜'],
  },
  {
    ...base(), id: 'soup_2p_winter_melon', nameZh: '冬瓜清汤(2人份)', nameEn: 'Winter Melon Clear Soup 2p',
    cookingMethod: 'soup', flavors: ['light', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 12, servings: 2,
    description: '清热利水。',
    ingredients: [
      { ingredientId: 'winter_melon', amount: 250, unit: 'g' },
      { ingredientId: 'dried_shrimp', amount: 8, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['冬瓜切片', '水800ml下虾皮姜片煮开', '加冬瓜煮8分钟', '调盐淋香油'],
    tags: ['汤', '低卡', '清淡'],
  },
  {
    ...base(), id: 'soup_2p_radish_seaweed', nameZh: '萝卜紫菜汤(2人份)', nameEn: 'Radish Seaweed Soup 2p',
    cookingMethod: 'soup', flavors: ['light', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 12, servings: 2,
    description: '清润润燥。',
    ingredients: [
      { ingredientId: 'white_radish', amount: 200, unit: 'g' },
      { ingredientId: 'nori', amount: 10, unit: 'g' },
      { ingredientId: 'dried_shrimp', amount: 5, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['萝卜切丝', '水800ml下萝卜虾皮煮 10 分钟', '紫菜撕碎下锅煮 1 分钟', '调盐淋香油'],
    tags: ['汤', '低卡', '清淡'],
  },
  {
    ...base(), id: 'soup_2p_egg_drop_corn', nameZh: '玉米蛋花汤(2人份)', nameEn: 'Corn Egg Drop Soup 2p',
    cookingMethod: 'soup', flavors: ['sweet', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 10, servings: 2,
    description: '甜润玉米搭蛋花。',
    ingredients: [
      { ingredientId: 'corn', amount: 150, unit: 'g' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
      { ingredientId: 'starch', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['玉米粒下锅水800ml煮 8 分钟', '水淀粉勾稀芡', '淋蛋花', '调盐撒葱'],
    tags: ['汤', '低卡'],
  },
  {
    ...base(), id: 'soup_2p_tofu_seaweed', nameZh: '豆腐海带汤(2人份)', nameEn: 'Tofu Kelp Soup 2p',
    cookingMethod: 'soup', flavors: ['umami', 'light'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 12, servings: 2,
    description: '海带豆腐, 富含碘和蛋白。',
    ingredients: [
      { ingredientId: 'tofu', amount: 200, unit: 'g' },
      { ingredientId: 'kelp', amount: 80, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['豆腐切块, 海带泡软', '水800ml下海带姜煮 8 分钟', '加豆腐煮 3 分钟', '调盐淋香油'],
    tags: ['汤', '低卡', '高碘'],
  },
  {
    ...base(), id: 'soup_2p_mushroom_egg', nameZh: '香菇蛋汤(2人份)', nameEn: 'Mushroom Egg Soup 2p',
    cookingMethod: 'soup', flavors: ['umami', 'light'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 8, cookTime: 10, servings: 2,
    description: '菇香蛋香, 简单暖胃。',
    ingredients: [
      { ingredientId: 'mushroom', amount: 100, unit: 'g' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['香菇切片', '水800ml下香菇煮 5 分钟', '淋蛋花', '调盐撒葱淋香油'],
    tags: ['汤', '低卡'],
  },
  {
    ...base(), id: 'soup_2p_lotus_seed', nameZh: '银耳莲子汤(2人份)', nameEn: 'White Fungus Lotus Soup 2p',
    cookingMethod: 'soup', flavors: ['sweet'], mealTypes: ['breakfast', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'basic', prepTime: 30, cookTime: 60, servings: 2,
    description: '滋阴润肺养颜甜汤。',
    ingredients: [
      { ingredientId: 'white_fungus', amount: 15, unit: 'g' },
      { ingredientId: 'lotus_seed', amount: 30, unit: 'g' },
      { ingredientId: 'red_dates', amount: 5, unit: 'piece' },
      { ingredientId: 'goji_berry', amount: 5, unit: 'g' },
      { ingredientId: 'sugar', amount: 15, unit: 'g' },
    ],
    steps: ['银耳泡发撕小朵', '莲子去芯', '锅加水 1000ml 下银耳莲子红枣', '小火炖 50 分钟', '加枸杞糖煮 5 分钟'],
    tags: ['汤', '甜品', '滋补', '低卡'],
  },

  // ===== 2 人份低卡粥 =====
  {
    ...base(), id: 'porridge_2p_plain', nameZh: '白粥(2人份)', nameEn: 'Plain Congee 2p',
    cookingMethod: 'staple', flavors: ['light'], mealTypes: ['breakfast', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 50, servings: 2,
    description: '清淡养胃, 2 人份。',
    ingredients: [{ ingredientId: 'rice', amount: 60, unit: 'g' }],
    steps: ['大米加水 1000ml', '大火煮开转小火 45 分钟', '搅几次防糊'],
    tags: ['主食', '养胃', '清淡', '低卡'],
  },
  {
    ...base(), id: 'porridge_2p_millet', nameZh: '小米粥(2人份)', nameEn: 'Millet Congee 2p',
    cookingMethod: 'staple', flavors: ['light'], mealTypes: ['breakfast', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 30, servings: 2,
    description: '金黄养胃。',
    ingredients: [{ ingredientId: 'millet', amount: 80, unit: 'g' }],
    steps: ['小米淘洗一次', '加水 1000ml', '大火开转小火 25 分钟', '焖 5 分钟'],
    tags: ['主食', '养胃', '低卡'],
  },
  {
    ...base(), id: 'porridge_2p_pumpkin_millet', nameZh: '南瓜小米粥(2人份)', nameEn: 'Pumpkin Millet Congee 2p',
    cookingMethod: 'staple', flavors: ['sweet', 'light'], mealTypes: ['breakfast', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 5, cookTime: 35, servings: 2,
    description: '甘甜暖胃。',
    ingredients: [
      { ingredientId: 'millet', amount: 60, unit: 'g' },
      { ingredientId: 'pumpkin', amount: 150, unit: 'g' },
    ],
    steps: ['南瓜去皮切块', '小米加水煮 15 分钟', '加南瓜再煮 15 分钟'],
    tags: ['主食', '低卡', '养胃'],
  },
  {
    ...base(), id: 'porridge_2p_red_bean_oats', nameZh: '燕麦红豆粥(2人份)', nameEn: 'Oat Red Bean Congee 2p',
    cookingMethod: 'staple', flavors: ['sweet', 'light'], mealTypes: ['breakfast'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 240, cookTime: 30, servings: 2,
    description: '高纤维补血粥。',
    ingredients: [
      { ingredientId: 'oats', amount: 50, unit: 'g' },
      { ingredientId: 'red_bean', amount: 50, unit: 'g' },
      { ingredientId: 'sugar', amount: 10, unit: 'g' },
    ],
    steps: ['红豆浸泡 4 小时', '红豆加水煮 20 分钟', '加燕麦再煮 8 分钟', '加糖'],
    tags: ['主食', '健康', '低卡'],
  },
  {
    ...base(), id: 'porridge_2p_century_lean_pork', nameZh: '皮蛋瘦肉粥(2人份)', nameEn: 'Century Egg Pork Congee 2p',
    cookingMethod: 'staple', flavors: ['umami', 'salty'], mealTypes: ['breakfast', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'basic', prepTime: 10, cookTime: 50, servings: 2,
    description: '粤式经典咸粥。',
    ingredients: [
      { ingredientId: 'rice', amount: 60, unit: 'g' },
      { ingredientId: 'pork_loin', amount: 80, unit: 'g' },
      { ingredientId: 'preserved_egg', amount: 1, unit: 'piece' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
    ],
    steps: ['大米加水煮开转小火 30 分钟', '瘦肉切丝加生抽淀粉腌', '皮蛋切丁', '下瘦肉煮 5 分钟', '加皮蛋煮 3 分钟', '调盐撒葱姜淋香油'],
    tags: ['主食', '粤菜', '低卡'],
  },
  {
    ...base(), id: 'porridge_2p_mushroom_chicken', nameZh: '香菇鸡丝粥(2人份)', nameEn: 'Mushroom Chicken Congee 2p',
    cookingMethod: 'staple', flavors: ['umami', 'light'], mealTypes: ['breakfast', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'basic', prepTime: 10, cookTime: 50, servings: 2,
    description: '鲜香低卡, 病后调养。',
    ingredients: [
      { ingredientId: 'rice', amount: 60, unit: 'g' },
      { ingredientId: 'chicken_breast', amount: 80, unit: 'g' },
      { ingredientId: 'mushroom', amount: 50, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['大米加水煮 30 分钟', '鸡胸撕丝, 香菇切片', '下香菇姜煮 5 分钟', '加鸡丝煮 3 分钟调盐'],
    tags: ['主食', '低卡', '高蛋白'],
  },
  {
    ...base(), id: 'porridge_2p_seafood', nameZh: '海鲜粥(2人份)', nameEn: 'Seafood Congee 2p',
    cookingMethod: 'staple', flavors: ['umami'], mealTypes: ['breakfast', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'basic', prepTime: 10, cookTime: 50, servings: 2,
    description: '鲜美海鲜粥。',
    ingredients: [
      { ingredientId: 'rice', amount: 60, unit: 'g' },
      { ingredientId: 'shrimp', amount: 80, unit: 'g' },
      { ingredientId: 'squid', amount: 60, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: ['大米加水煮 30 分钟', '虾仁鱿鱼切丁', '下海鲜姜煮 4 分钟', '调盐撒葱'],
    tags: ['主食', '高蛋白', '低卡'],
  },
];

const skipped = [];
const valid = NEW.filter(r => {
  const bad = r.ingredients.filter(ri => !validIng.has(ri.ingredientId));
  if (bad.length > 0) {
    skipped.push({ name: r.nameZh, missing: bad.map(i => i.ingredientId) });
    return false;
  }
  return true;
});

if (skipped.length > 0) skipped.forEach(s => console.log(`⚠ ${s.name}: ${s.missing.join(', ')}`));

const existingIds = new Set(recipes.map(r => r.id));
const toAdd = valid.filter(r => !existingIds.has(r.id));
console.log(`新增 ${toAdd.length} 道 2 人份低卡汤/粥`);
toAdd.forEach(r => console.log(`  + ${r.nameZh}`));

if (process.argv.includes('--write')) {
  recipes.push(...toAdd);
  fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2));
  console.log(`\n✓ 写入, 总数 ${recipes.length}`);
}
