/**
 * 加更多 2 人份主食 + 面类主食
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));
const ingredients = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'ingredients.json'), 'utf8'));
const validIng = new Set(ingredients.map(i => i.id));

const base = (cuisine = 'chinese', regional = 'homestyle') => ({
  cuisine, regionalCuisine: regional, status: 'reviewed', cookingMethod: 'staple',
});

const NEW = [
  // ========== 面类主食 ==========
  {
    ...base(), id: 'noodle_2p_soy_sauce', nameZh: '葱油拌面(2人份)', nameEn: 'Scallion Oil Noodles 2p',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'basic', prepTime: 5, cookTime: 10, servings: 2,
    description: '上海经典, 简单浓香。',
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 30, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 30, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 25, unit: 'ml' },
      { ingredientId: 'dark_soy', amount: 5, unit: 'ml' },
      { ingredientId: 'sugar', amount: 8, unit: 'g' },
    ],
    steps: ['葱切段', '锅冷油下葱小火慢慢熬至焦黄', '生抽老抽糖混合葱油', '面条煮熟过水', '拌酱和葱油'],
    tags: ['主食', '快手菜'],
  },
  {
    ...base(), id: 'noodle_2p_zhajiang', nameZh: '炸酱面(2人份)', nameEn: 'Zhajiang Noodles 2p',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'medium', minCookingLevel: 'intermediate', prepTime: 10, cookTime: 20, servings: 2,
    description: '北京风味, 浓香肉酱。',
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 200, unit: 'g' },
      { ingredientId: 'sweet_bean_paste', amount: 60, unit: 'g' },
      { ingredientId: 'cucumber', amount: 100, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
    ],
    steps: ['锅热油炒肉末出油', '加甜面酱炒香', '加少水煮 10 分钟成酱', '面条煮熟过凉', '黄瓜切丝铺面上, 浇酱拌匀'],
    tags: ['主食', '北方'],
  },
  {
    ...base(), id: 'noodle_2p_dandan', nameZh: '担担面(2人份)', nameEn: 'Dan Dan Noodles 2p',
    flavors: ['spicy', 'salty', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'medium', minCookingLevel: 'intermediate', prepTime: 10, cookTime: 12, servings: 2,
    description: '川式麻辣面。',
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 100, unit: 'g' },
      { ingredientId: 'pickled_mustard', amount: 30, unit: 'g' },
      { ingredientId: 'sesame_paste', amount: 20, unit: 'g' },
      { ingredientId: 'chili_oil', amount: 20, unit: 'ml' },
      { ingredientId: 'sichuan_pepper', amount: 2, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 20, unit: 'ml' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
    ],
    steps: ['肉末加榨菜炒散', '碗加芝麻酱辣油花椒粉生抽冲热水', '面条煮熟入碗', '盖肉末撒葱花'],
    tags: ['主食', '川菜'],
  },
  {
    ...base(), id: 'noodle_2p_beef_noodle', nameZh: '红烧牛肉面(2人份)', nameEn: 'Braised Beef Noodles 2p',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'medium', minCookingLevel: 'intermediate', prepTime: 15, cookTime: 90, servings: 2,
    description: '汤浓肉烂, 经典国民面。',
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'beef_shank', amount: 250, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 25, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 25, unit: 'ml' },
      { ingredientId: 'sugar', amount: 8, unit: 'g' },
      { ingredientId: 'ginger', amount: 15, unit: 'g' },
      { ingredientId: 'star_anise', amount: 2, unit: 'piece' },
      { ingredientId: 'bok_choy', amount: 100, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
    ],
    steps: ['牛肉切块焯水', '炒糖色下牛肉煸炒加豆瓣酱姜八角', '加水炖 1 小时', '面条煮熟入碗加青菜淋牛肉汤'],
    tags: ['主食', '家常'],
  },
  {
    ...base('chinese', 'sichuan'), id: 'noodle_2p_chongqing', nameZh: '重庆小面(2人份)', nameEn: 'Chongqing Noodles 2p',
    flavors: ['spicy', 'salty', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'basic', prepTime: 5, cookTime: 10, servings: 2,
    description: '川渝麻辣面食代表。',
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'chili_oil', amount: 25, unit: 'ml' },
      { ingredientId: 'sichuan_pepper', amount: 2, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 20, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 5, unit: 'ml' },
      { ingredientId: 'pickled_mustard', amount: 30, unit: 'g' },
      { ingredientId: 'peanut', amount: 20, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
    ],
    steps: ['碗底加生抽辣油花椒醋葱花榨菜花生碎', '冲热水或骨汤搅匀', '面条煮熟入碗'],
    tags: ['主食', '川菜', '快手菜'],
  },
  {
    ...base('chinese', 'cantonese'), id: 'noodle_2p_cantonese_wonton', nameZh: '云吞面(2人份)', nameEn: 'Cantonese Wonton Noodle 2p',
    flavors: ['umami', 'light'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'medium', minCookingLevel: 'intermediate', prepTime: 30, cookTime: 10, servings: 2,
    description: '港式经典。',
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'shrimp', amount: 150, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 80, unit: 'g' },
      { ingredientId: 'flour', amount: 100, unit: 'g' },
      { ingredientId: 'bok_choy', amount: 100, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
    ],
    steps: ['虾仁剁碎和肉末调馅', '面粉擀皮包馅', '高汤煮开下云吞 4 分钟', '面条入碗加青菜淋汤'],
    tags: ['主食', '粤菜'],
  },
  {
    ...base(), id: 'noodle_2p_cold_sesame', nameZh: '麻酱凉面(2人份)', nameEn: 'Cold Sesame Noodles 2p',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'basic', prepTime: 8, cookTime: 8, servings: 2,
    description: '夏日凉面, 麻酱浓郁。',
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'sesame_paste', amount: 40, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 25, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 15, unit: 'ml' },
      { ingredientId: 'sugar', amount: 8, unit: 'g' },
      { ingredientId: 'cucumber', amount: 80, unit: 'g' },
      { ingredientId: 'carrot', amount: 50, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
    ],
    steps: ['麻酱加水稀释', '加生抽醋糖蒜泥', '面条煮熟过凉', '黄瓜胡萝卜切丝铺面上', '浇麻酱拌匀'],
    tags: ['主食', '快手菜', '夏季'],
  },
  {
    ...base('asian_other', 'japanese'), id: 'noodle_2p_udon_simple', nameZh: '日式素乌冬(2人份)', nameEn: 'Simple Udon 2p',
    flavors: ['umami', 'light'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'basic', prepTime: 5, cookTime: 10, servings: 2,
    description: '清汤乌冬, 简单暖心。',
    ingredients: [
      { ingredientId: 'udon_noodles', amount: 300, unit: 'g' },
      { ingredientId: 'kombu', amount: 5, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 25, unit: 'ml' },
      { ingredientId: 'mirin', amount: 15, unit: 'ml' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
    ],
    steps: ['昆布泡水做高汤', '加生抽味醂调味', '乌冬煮 3 分钟入碗', '淋热汤打入溏心蛋', '撒葱'],
    tags: ['主食', '日式', '清淡'],
  },
  {
    ...base('asian_other', 'japanese'), id: 'noodle_2p_yakisoba', nameZh: '日式炒面(2人份)', nameEn: 'Yakisoba 2p',
    flavors: ['salty', 'umami', 'sweet'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'basic', prepTime: 8, cookTime: 8, servings: 2,
    description: '日式酱炒面。',
    ingredients: [
      { ingredientId: 'udon_noodles', amount: 300, unit: 'g' },
      { ingredientId: 'cabbage', amount: 100, unit: 'g' },
      { ingredientId: 'carrot', amount: 50, unit: 'g' },
      { ingredientId: 'pork_belly', amount: 100, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 20, unit: 'ml' },
      { ingredientId: 'oyster_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
    ],
    steps: ['面条焯水松散', '锅热油炒猪肉胡萝卜白菜', '下面条翻炒', '加生抽蚝油糖炒匀'],
    tags: ['主食', '日式'],
  },
  {
    ...base('asian_other', 'korean'), id: 'noodle_2p_jjajangmyeon', nameZh: '韩式炸酱面(2人份)', nameEn: 'Korean Jjajangmyeon 2p',
    flavors: ['salty', 'umami', 'sweet'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'medium', minCookingLevel: 'intermediate', prepTime: 10, cookTime: 20, servings: 2,
    description: '韩式黑酱面。',
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'pork_belly', amount: 150, unit: 'g' },
      { ingredientId: 'onion', amount: 100, unit: 'g' },
      { ingredientId: 'potato', amount: 80, unit: 'g' },
      { ingredientId: 'cabbage', amount: 80, unit: 'g' },
      { ingredientId: 'sweet_bean_paste', amount: 50, unit: 'g' },
      { ingredientId: 'sugar', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
    ],
    steps: ['蔬菜切丁猪肉切丁', '锅热油炒甜面酱出香', '加肉蔬炒香', '加水煮 8 分钟', '面条煮熟入盘浇酱'],
    tags: ['主食', '韩式'],
  },

  // ========== 更多 2 人份主食 (饭/饼) ==========
  {
    ...base('chinese', 'cantonese'), id: 'staple_2p_soy_sauce_chicken_rice', nameZh: '豉油鸡饭(2人份)', nameEn: 'Soy Sauce Chicken Rice 2p',
    flavors: ['salty', 'umami', 'sweet'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'medium', minCookingLevel: 'intermediate', prepTime: 10, cookTime: 30, servings: 2,
    description: '粤式经典烧腊饭。',
    ingredients: [
      { ingredientId: 'rice', amount: 160, unit: 'g' },
      { ingredientId: 'chicken_thigh', amount: 250, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 30, unit: 'ml' },
      { ingredientId: 'dark_soy', amount: 8, unit: 'ml' },
      { ingredientId: 'sugar', amount: 15, unit: 'g' },
      { ingredientId: 'ginger', amount: 10, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'bok_choy', amount: 80, unit: 'g' },
    ],
    steps: ['鸡腿用豉油糖姜葱腌 30 分钟', '锅煮鸡腿 20 分钟', '米饭煮熟', '青菜焯水', '鸡腿切片配饭'],
    tags: ['主食', '粤菜'],
  },
  {
    ...base(), id: 'staple_2p_egg_fried_rice', nameZh: '蛋炒饭(2人份)', nameEn: 'Egg Fried Rice 2p',
    flavors: ['salty'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner', prepTime: 3, cookTime: 8, servings: 2,
    description: '简单经典。',
    ingredients: [
      { ingredientId: 'rice', amount: 250, unit: 'g' },
      { ingredientId: 'egg', amount: 3, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 8, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['蛋打散', '锅热油炒蛋至半熟', '下米饭翻炒散', '加葱花生抽盐'],
    tags: ['主食', '快手菜'],
  },
  {
    ...base(), id: 'staple_2p_yangzhou_fried_rice', nameZh: '扬州炒饭(2人份)', nameEn: 'Yangzhou Fried Rice 2p',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'basic', prepTime: 8, cookTime: 10, servings: 2,
    description: '料丰富的经典炒饭。',
    ingredients: [
      { ingredientId: 'rice', amount: 250, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'shrimp', amount: 80, unit: 'g' },
      { ingredientId: 'ham', amount: 50, unit: 'g' },
      { ingredientId: 'corn', amount: 50, unit: 'g' },
      { ingredientId: 'green_bean', amount: 30, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['豌豆玉米焯水', '蛋炒散盛出', '锅炒虾仁火腿', '下米饭炒散', '加豌豆玉米和蛋拌匀', '加葱生抽盐'],
    tags: ['主食'],
  },
  {
    ...base(), id: 'staple_2p_egg_pancake', nameZh: '鸡蛋葱花饼(2人份)', nameEn: 'Egg Scallion Pancake 2p',
    flavors: ['salty'], mealTypes: ['breakfast', 'lunch', 'dinner'],
    difficulty: 'easy', minCookingLevel: 'basic', prepTime: 5, cookTime: 6, servings: 2,
    description: '简单家常饼。',
    ingredients: [
      { ingredientId: 'flour', amount: 150, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 20, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['面粉加蛋葱花盐温水调糊', '平底锅小油摊薄煎两面金黄'],
    tags: ['主食', '快手菜'],
  },
  {
    ...base(), id: 'staple_2p_pork_dumplings', nameZh: '猪肉白菜饺子(2人份)', nameEn: 'Pork Cabbage Dumplings 2p',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'],
    difficulty: 'medium', minCookingLevel: 'intermediate', prepTime: 60, cookTime: 10, servings: 2,
    description: '北方经典饺子。',
    ingredients: [
      { ingredientId: 'flour', amount: 250, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 200, unit: 'g' },
      { ingredientId: 'cabbage', amount: 200, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 4, unit: 'g' },
    ],
    steps: ['面团醒 30 分钟', '白菜切碎挤水', '肉葱姜剁碎调馅', '擀皮包饺子', '水开下饺子煮熟'],
    tags: ['主食', '北方'],
  },
  {
    ...base(), id: 'staple_2p_xiaolongbao', nameZh: '小笼包(2人份)', nameEn: 'Soup Dumpling 2p',
    flavors: ['umami', 'salty'], mealTypes: ['breakfast', 'lunch', 'dinner'],
    difficulty: 'hard', minCookingLevel: 'advanced', prepTime: 180, cookTime: 12, servings: 2,
    description: '上海经典小笼。',
    ingredients: [
      { ingredientId: 'flour', amount: 150, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 200, unit: 'g' },
      { ingredientId: 'pork_skin', amount: 80, unit: 'g' },
      { ingredientId: 'ginger', amount: 8, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 12, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 8, unit: 'ml' },
      { ingredientId: 'sugar', amount: 4, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 8, unit: 'g' },
    ],
    steps: ['猪皮熬汤冷冻成冻', '冻切丁拌肉馅', '面团擀薄皮包馅捏褶', '蒸 10 分钟'],
    tags: ['主食', '江浙'],
  },
];

const skipped = [];
const valid = NEW.filter(r => {
  const bad = r.ingredients.filter(ri => !validIng.has(ri.ingredientId));
  if (bad.length > 0) { skipped.push({ name: r.nameZh, missing: bad.map(i => i.ingredientId) }); return false; }
  return true;
});
if (skipped.length > 0) skipped.forEach(s => console.log(`⚠ ${s.name}: ${s.missing.join(', ')}`));

const existingIds = new Set(recipes.map(r => r.id));
const toAdd = valid.filter(r => !existingIds.has(r.id));
console.log(`新增 ${toAdd.length} 道 2 人份面/主食`);
toAdd.forEach(r => console.log(`  + ${r.nameZh}`));

if (process.argv.includes('--write')) {
  recipes.push(...toAdd);
  fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2));
  console.log(`\n✓ 写入, 总数 ${recipes.length}`);
}
