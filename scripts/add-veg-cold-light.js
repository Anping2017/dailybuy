/**
 * 大批量补充薄弱品类:
 * 1. 素菜 (低卡为主, 小炒 + 蒸 + 凉拌)
 * 2. 凉菜 (拌菜)
 * 3. 简单早餐
 * 目标: +50 道菜, 提升推荐多样性
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));

const BASE = {
  cuisine: 'chinese',
  regionalCuisine: 'homestyle',
  status: 'reviewed',
};

const NEW = [
  // ============ 简单素菜小炒 (低卡) ============
  {
    id: 'veg_garlic_spinach', nameZh: '蒜蓉菠菜', nameEn: 'Garlic Spinach', cookingMethod: 'stir_fry',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 4, servings: 2,
    description: '焯水后大火快炒，蒜香突出，菠菜翠绿。',
    ingredients: [
      { ingredientId: 'spinach', amount: 300, unit: 'g' },
      { ingredientId: 'garlic', amount: 15, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['菠菜洗净，开水焯30秒捞出沥干', '蒜切末', '锅热油爆香蒜末', '下菠菜大火翻炒30秒，加盐出锅'],
    tags: ['素菜', '低卡', '快手菜', '健康'],
  },
  {
    id: 'veg_stirfry_zucchini', nameZh: '清炒西葫芦', nameEn: 'Stir-fried Zucchini', cookingMethod: 'stir_fry',
    flavors: ['light', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 5, servings: 2,
    description: '清淡爽口的家常小菜。',
    ingredients: [
      { ingredientId: 'zucchini', amount: 350, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['西葫芦切片', '蒜切末', '锅热油爆香蒜', '下西葫芦中火翻炒3分钟，加盐'],
    tags: ['素菜', '低卡', '快手菜'],
  },
  {
    id: 'veg_stirfry_celery_drytofu', nameZh: '芹菜炒香干', nameEn: 'Celery & Dried Tofu Stir-fry', cookingMethod: 'stir_fry',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 8, cookTime: 5, servings: 2,
    description: '芹菜清香配香干嚼劲，下饭神器。',
    ingredients: [
      { ingredientId: 'celery', amount: 250, unit: 'g' },
      { ingredientId: 'dried_tofu', amount: 150, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['芹菜去筋切段，香干切片', '焯水芹菜30秒沥干', '锅热油，下蒜爆香', '下香干翻炒，加生抽', '加芹菜大火炒1分钟，调盐'],
    tags: ['素菜', '低卡', '下饭菜'],
  },
  {
    id: 'veg_dry_pot_cauliflower', nameZh: '干锅花菜', nameEn: 'Dry Pot Cauliflower', cookingMethod: 'stir_fry',
    flavors: ['salty', 'umami', 'spicy'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 10, cookTime: 10, servings: 3,
    description: '花菜煸到焦边，干香十足，下饭一绝。',
    ingredients: [
      { ingredientId: 'broccoli', amount: 400, unit: 'g' },
      { ingredientId: 'garlic', amount: 15, unit: 'g' },
      { ingredientId: 'dried_chili', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['花菜掰小朵', '不放水干锅小火慢慢煸到焦边变色', '加油、蒜、干辣椒爆香', '加生抽和盐翻炒均匀'],
    tags: ['素菜', '下饭菜'],
  },
  {
    id: 'veg_stirfry_cabbage_vinegar', nameZh: '醋熘白菜', nameEn: 'Vinegar Cabbage Stir-fry', cookingMethod: 'stir_fry',
    flavors: ['sour', 'salty'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 5, cookTime: 5, servings: 3,
    description: '酸辣开胃，清爽下饭。',
    ingredients: [
      { ingredientId: 'cabbage', amount: 400, unit: 'g' },
      { ingredientId: 'vinegar', amount: 15, unit: 'ml' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['白菜切片', '锅热油', '下白菜大火快炒', '加醋糖生抽，炒至断生'],
    tags: ['素菜', '低卡', '快手菜', '下饭菜'],
  },
  {
    id: 'veg_stirfry_eggplant_garlic', nameZh: '蒜泥茄子', nameEn: 'Garlic Eggplant', cookingMethod: 'steam',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 12, servings: 2,
    description: '茄子蒸软淋蒜汁，少油低脂。',
    ingredients: [
      { ingredientId: 'eggplant', amount: 350, unit: 'g' },
      { ingredientId: 'garlic', amount: 20, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 5, unit: 'ml' },
      { ingredientId: 'sugar', amount: 3, unit: 'g' },
    ],
    steps: ['茄子切长条', '上锅蒸10分钟至软', '蒜剁泥', '蒜泥+生抽+醋+糖+香油拌匀', '淋茄子上'],
    tags: ['素菜', '低卡', '清淡', '健康'],
  },
  {
    id: 'veg_lettuce_oyster', nameZh: '蚝油生菜', nameEn: 'Oyster Sauce Lettuce', cookingMethod: 'boil',
    flavors: ['umami', 'salty'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 3, cookTime: 3, servings: 2,
    description: '焯水淋蚝油，3 分钟一道菜。',
    ingredients: [
      { ingredientId: 'lettuce', amount: 300, unit: 'g' },
      { ingredientId: 'oyster_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'garlic', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
    ],
    steps: ['生菜洗净掰大块', '锅烧水加几滴油，焯30秒捞出', '锅热油爆香蒜，加蚝油兑少许水煮开', '淋生菜上'],
    tags: ['素菜', '低卡', '快手菜', '清淡'],
  },
  {
    id: 'veg_garlic_bok_choy', nameZh: '蒜蓉小白菜', nameEn: 'Garlic Bok Choy', cookingMethod: 'stir_fry',
    flavors: ['salty', 'light'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 3, cookTime: 4, servings: 2,
    description: '清香爽口，配饭配粥都好。',
    ingredients: [
      { ingredientId: 'bok_choy', amount: 300, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['小白菜洗净', '蒜切末', '锅热油爆香蒜', '下小白菜大火翻炒2分钟，加盐'],
    tags: ['素菜', '低卡', '快手菜'],
  },
  {
    id: 'veg_stirfry_greenbean', nameZh: '干煸四季豆', nameEn: 'Dry-fried Green Beans', cookingMethod: 'stir_fry',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 5, cookTime: 8, servings: 3,
    description: '干香入味，外皮有褶皱才正宗。',
    ingredients: [
      { ingredientId: 'green_bean', amount: 350, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['四季豆掐头去尾掰段', '少油中火煸炒5分钟至外皮起皱', '加蒜末爆香', '调生抽和盐'],
    tags: ['素菜', '下饭菜'],
  },
  {
    id: 'veg_kelp_braise', nameZh: '红烧海带结', nameEn: 'Braised Kelp Knots', cookingMethod: 'braise',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 10, cookTime: 25, servings: 3,
    description: '海带富含碘和矿物质，红烧入味。',
    ingredients: [
      { ingredientId: 'kelp', amount: 300, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 20, unit: 'ml' },
      { ingredientId: 'sugar', amount: 8, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
      { ingredientId: 'star_anise', amount: 1, unit: 'piece' },
    ],
    steps: ['海带泡发洗净打结', '锅热油下姜片八角爆香', '加海带和水没过', '加生抽糖小火炖20分钟收汁'],
    tags: ['素菜', '低卡', '健康', '高碘'],
  },
  {
    id: 'veg_stirfry_woodear_egg', nameZh: '木耳炒鸡蛋', nameEn: 'Wood Ear Mushroom & Egg', cookingMethod: 'stir_fry',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner', 'breakfast'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 30, cookTime: 5, servings: 2,
    description: '木耳富含膳食纤维，配滑蛋下饭。',
    ingredients: [
      { ingredientId: 'wood_ear', amount: 80, unit: 'g' },
      { ingredientId: 'egg', amount: 3, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 8, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['木耳泡发30分钟撕小朵', '鸡蛋打散', '锅热油倒蛋液炒散盛出', '下木耳和葱花翻炒', '回锅鸡蛋调味'],
    tags: ['素菜', '健康'],
  },
  {
    id: 'veg_kingoyster_blackpepper', nameZh: '黑椒杏鲍菇', nameEn: 'Black Pepper King Oyster Mushroom', cookingMethod: 'stir_fry',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 5, cookTime: 8, servings: 2,
    description: '杏鲍菇煎出焦边，黑椒提味，肉感十足。',
    ingredients: [
      { ingredientId: 'king_oyster_mushroom', amount: 350, unit: 'g' },
      { ingredientId: 'bell_pepper', amount: 80, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'oyster_sauce', amount: 8, unit: 'ml' },
      { ingredientId: 'sugar', amount: 3, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
      { ingredientId: 'black_pepper', amount: 3, unit: 'g' },
    ],
    steps: ['杏鲍菇切厚片', '锅煎至两面金黄', '加彩椒翻炒', '调生抽蚝油糖黑椒'],
    tags: ['素菜', '低卡', '健康'],
  },
  {
    id: 'veg_enoki_garlic_steam', nameZh: '蒜蓉粉丝金针菇', nameEn: 'Garlic Vermicelli Enoki', cookingMethod: 'steam',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 10, cookTime: 10, servings: 2,
    description: '简单蒸菜，蒜香浓郁。',
    ingredients: [
      { ingredientId: 'enoki_mushroom', amount: 300, unit: 'g' },
      { ingredientId: 'vermicelli', amount: 50, unit: 'g' },
      { ingredientId: 'garlic', amount: 25, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
    ],
    steps: ['粉丝泡软铺盘底', '金针菇放上面', '蒜剁泥用油爆香', '蒜油浇金针菇上加生抽', '上锅蒸8分钟撒葱花'],
    tags: ['素菜', '低卡', '健康'],
  },
  {
    id: 'veg_steamed_egg_custard', nameZh: '水蒸蛋', nameEn: 'Steamed Egg Custard', cookingMethod: 'steam',
    flavors: ['light', 'umami'], mealTypes: ['breakfast', 'lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 12, servings: 2,
    description: '滑嫩如布丁，老人小孩都爱。',
    ingredients: [
      { ingredientId: 'egg', amount: 3, unit: 'piece' },
      { ingredientId: 'soy_sauce', amount: 5, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
    ],
    steps: ['鸡蛋打散加 1.5 倍温水搅匀', '过筛去泡', '盖保鲜膜上锅中小火蒸10分钟', '出锅淋生抽和香油，撒葱花'],
    tags: ['素菜', '低卡', '清淡', '快手菜', '老人小孩'],
  },
  {
    id: 'veg_tomato_egg_simple', nameZh: '番茄炒蛋(简版)', nameEn: 'Tomato Egg Simple', cookingMethod: 'stir_fry',
    flavors: ['sour', 'sweet', 'umami'], mealTypes: ['breakfast', 'lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 5, servings: 2,
    description: '国民第一菜，简单到手残党也能做。',
    ingredients: [
      { ingredientId: 'tomato', amount: 250, unit: 'g' },
      { ingredientId: 'egg', amount: 3, unit: 'piece' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
    ],
    steps: ['番茄切块', '鸡蛋打散', '锅热油先炒蛋至大块盛出', '锅再下油，炒番茄出汁', '加糖和盐，回锅鸡蛋翻匀'],
    tags: ['素菜', '快手菜', '老人小孩'],
  },

  // ============ 凉菜 ============
  {
    id: 'cold_smashed_cucumber', nameZh: '拍黄瓜', nameEn: 'Smashed Cucumber Salad', cookingMethod: 'cold_dish',
    flavors: ['sour', 'salty', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 8, cookTime: 0, servings: 2,
    description: '拍碎更入味，夏天必备。',
    ingredients: [
      { ingredientId: 'cucumber', amount: 300, unit: 'g' },
      { ingredientId: 'garlic', amount: 15, unit: 'g' },
      { ingredientId: 'vinegar', amount: 15, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'sugar', amount: 3, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['黄瓜拍碎切段', '加盐腌5分钟出水沥干', '蒜剁泥', '加生抽醋糖香油拌匀'],
    tags: ['凉菜', '素菜', '低卡', '快手菜'],
  },
  {
    id: 'cold_seaweed_salad', nameZh: '凉拌海带丝', nameEn: 'Cold Kelp Salad', cookingMethod: 'cold_dish',
    flavors: ['sour', 'salty', 'spicy'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 10, cookTime: 5, servings: 2,
    description: '酸辣爽口，开胃下饭。',
    ingredients: [
      { ingredientId: 'kelp', amount: 250, unit: 'g' },
      { ingredientId: 'garlic', amount: 15, unit: 'g' },
      { ingredientId: 'dried_chili', amount: 5, unit: 'g' },
      { ingredientId: 'vinegar', amount: 15, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'sugar', amount: 3, unit: 'g' },
    ],
    steps: ['海带丝焯水2分钟过凉', '蒜剁泥', '辣椒切丝', '所有调料拌匀'],
    tags: ['凉菜', '素菜', '低卡', '健康'],
  },
  {
    id: 'cold_tofu_century_egg', nameZh: '皮蛋豆腐', nameEn: 'Century Egg Tofu', cookingMethod: 'cold_dish',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 0, servings: 2,
    description: '凉凉滑滑，一道老幼皆宜的凉菜。',
    ingredients: [
      { ingredientId: 'tofu', amount: 300, unit: 'g' },
      { ingredientId: 'century_egg', amount: 2, unit: 'piece' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'vinegar', amount: 5, unit: 'ml' },
    ],
    steps: ['豆腐切块装盘', '皮蛋切瓣摆豆腐上', '淋生抽香油醋', '撒葱花'],
    tags: ['凉菜', '素菜', '低卡', '快手菜'],
  },
  {
    id: 'cold_celery_peanut', nameZh: '芹菜花生米', nameEn: 'Celery & Peanut Salad', cookingMethod: 'cold_dish',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 10, cookTime: 5, servings: 2,
    description: '芹菜清爽花生酥脆，下酒下饭都好。',
    ingredients: [
      { ingredientId: 'celery', amount: 250, unit: 'g' },
      { ingredientId: 'peanut', amount: 80, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'vinegar', amount: 10, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['花生煮熟或炸熟去皮', '芹菜切丁焯水30秒过凉', '蒜剁泥', '所有材料拌匀'],
    tags: ['凉菜', '素菜', '健康'],
  },
  {
    id: 'cold_woodear_salad', nameZh: '凉拌木耳', nameEn: 'Cold Wood Ear Salad', cookingMethod: 'cold_dish',
    flavors: ['sour', 'salty', 'spicy'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 30, cookTime: 3, servings: 2,
    description: '清爽爽脆，富含膳食纤维。',
    ingredients: [
      { ingredientId: 'wood_ear', amount: 100, unit: 'g' },
      { ingredientId: 'garlic', amount: 15, unit: 'g' },
      { ingredientId: 'dried_chili', amount: 3, unit: 'g' },
      { ingredientId: 'vinegar', amount: 15, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'cilantro', amount: 10, unit: 'g' },
    ],
    steps: ['木耳泡发30分钟', '焯水2分钟过凉', '蒜剁泥, 辣椒切碎', '所有调料拌匀, 撒香菜'],
    tags: ['凉菜', '素菜', '低卡', '健康'],
  },
  {
    id: 'cold_tofu_skin_salad', nameZh: '凉拌豆腐皮', nameEn: 'Cold Tofu Skin Salad', cookingMethod: 'cold_dish',
    flavors: ['salty', 'umami'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 10, cookTime: 3, servings: 2,
    description: '蛋白质丰富的素凉菜。',
    ingredients: [
      { ingredientId: 'dried_tofu_skin', amount: 200, unit: 'g' },
      { ingredientId: 'cucumber', amount: 100, unit: 'g' },
      { ingredientId: 'carrot', amount: 50, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'vinegar', amount: 10, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
    ],
    steps: ['豆腐皮切丝焯水30秒过凉', '黄瓜胡萝卜切丝', '蒜剁泥', '所有材料调料拌匀'],
    tags: ['凉菜', '素菜', '高蛋白', '健康'],
  },
  {
    id: 'cold_lotus_root_vinegar', nameZh: '糖醋藕片', nameEn: 'Sweet & Sour Lotus Root', cookingMethod: 'cold_dish',
    flavors: ['sour', 'sweet'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 10, cookTime: 5, servings: 2,
    description: '酸甜爽脆，清新解腻。',
    ingredients: [
      { ingredientId: 'lotus_root', amount: 300, unit: 'g' },
      { ingredientId: 'vinegar', amount: 20, unit: 'ml' },
      { ingredientId: 'sugar', amount: 15, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['藕去皮切薄片', '焯水2分钟过凉', '加糖醋盐拌匀腌10分钟'],
    tags: ['凉菜', '素菜', '低卡'],
  },
  {
    id: 'cold_shredded_cabbage_vinegar', nameZh: '醋拌包菜丝', nameEn: 'Cabbage Vinegar Slaw', cookingMethod: 'cold_dish',
    flavors: ['sour', 'salty'], mealTypes: ['lunch', 'dinner'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 0, servings: 2,
    description: '生吃也爽口，开胃。',
    ingredients: [
      { ingredientId: 'cabbage', amount: 300, unit: 'g' },
      { ingredientId: 'vinegar', amount: 15, unit: 'ml' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
    ],
    steps: ['包菜切细丝加盐腌5分钟出水沥干', '加糖醋香油拌匀'],
    tags: ['凉菜', '素菜', '低卡', '快手菜'],
  },

  // ============ 简单早餐 ============
  {
    id: 'breakfast_oatmeal_banana', nameZh: '燕麦香蕉牛奶', nameEn: 'Oatmeal with Banana & Milk', cookingMethod: 'boil',
    flavors: ['sweet', 'light'], mealTypes: ['breakfast'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 2, cookTime: 5, servings: 1,
    description: '快手营养早餐，3 分钟搞定。',
    ingredients: [
      { ingredientId: 'oats', amount: 50, unit: 'g' },
      { ingredientId: 'milk', amount: 200, unit: 'ml' },
      { ingredientId: 'banana', amount: 1, unit: 'piece' },
      { ingredientId: 'honey', amount: 10, unit: 'g' },
    ],
    steps: ['燕麦加牛奶煮5分钟至浓稠', '香蕉切片', '盛碗加香蕉淋蜂蜜'],
    tags: ['素菜', '低卡', '快手菜', '健康', '减脂'],
  },
  {
    id: 'breakfast_avocado_toast', nameZh: '牛油果烤吐司', nameEn: 'Avocado Toast', cookingMethod: 'roast',
    flavors: ['salty', 'light'], mealTypes: ['breakfast'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 3, cookTime: 3, servings: 1,
    description: '健康咖啡馆早餐风。',
    ingredients: [
      { ingredientId: 'bread', amount: 60, unit: 'g' },
      { ingredientId: 'avocado', amount: 100, unit: 'g' },
      { ingredientId: 'salt', amount: 1, unit: 'g' },
      { ingredientId: 'lemon', amount: 10, unit: 'g' },
    ],
    steps: ['吐司烤至金黄', '牛油果碾成泥加柠檬汁和盐', '涂吐司上'],
    tags: ['素菜', '健康', '快手菜'],
  },
  {
    id: 'breakfast_yogurt_fruit', nameZh: '酸奶水果碗', nameEn: 'Yogurt Fruit Bowl', cookingMethod: 'cold_dish',
    flavors: ['sweet', 'sour', 'light'], mealTypes: ['breakfast'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 0, servings: 1,
    description: '无需开火，5 分钟营养早餐。',
    ingredients: [
      { ingredientId: 'yogurt', amount: 200, unit: 'g' },
      { ingredientId: 'banana', amount: 1, unit: 'piece' },
      { ingredientId: 'apple', amount: 0.5, unit: 'piece' },
      { ingredientId: 'oats', amount: 20, unit: 'g' },
      { ingredientId: 'honey', amount: 10, unit: 'g' },
    ],
    steps: ['酸奶倒碗里', '水果切丁铺上', '撒燕麦淋蜂蜜'],
    tags: ['素菜', '低卡', '快手菜', '健康'],
  },
  {
    id: 'breakfast_milk_egg', nameZh: '牛奶煮鸡蛋', nameEn: 'Milk with Boiled Egg', cookingMethod: 'boil',
    flavors: ['light'], mealTypes: ['breakfast'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 1, cookTime: 8, servings: 1,
    description: '最朴实的早餐组合。',
    ingredients: [
      { ingredientId: 'milk', amount: 250, unit: 'ml' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
    ],
    steps: ['鸡蛋冷水下锅煮8分钟', '牛奶热到温热', '鸡蛋去壳搭配牛奶'],
    tags: ['素菜', '快手菜', '高蛋白'],
  },
  {
    id: 'breakfast_pancake_simple', nameZh: '简易煎蛋三明治', nameEn: 'Quick Egg Sandwich', cookingMethod: 'staple',
    flavors: ['salty', 'umami'], mealTypes: ['breakfast'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 3, cookTime: 5, servings: 1,
    description: '5 分钟营养早餐。',
    ingredients: [
      { ingredientId: 'bread', amount: 80, unit: 'g' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
      { ingredientId: 'lettuce', amount: 30, unit: 'g' },
      { ingredientId: 'tomato', amount: 30, unit: 'g' },
      { ingredientId: 'cheese', amount: 20, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 1, unit: 'g' },
    ],
    steps: ['吐司烤热', '锅煎一个鸡蛋撒盐', '番茄生菜切片', '芝士+鸡蛋+生菜+番茄夹两片吐司'],
    tags: ['快手菜'],
  },
];

const existingIds = new Set(recipes.map(r => r.id));
const toAdd = NEW.filter(r => {
  if (existingIds.has(r.id)) {
    console.log(`⚠ 跳过已存在: ${r.id}`);
    return false;
  }
  return true;
}).map(r => ({ ...BASE, ...r }));

console.log(`新增 ${toAdd.length} 道菜:`);
toAdd.forEach(r => console.log(`  + ${r.nameZh}`));

if (process.argv.includes('--write')) {
  recipes.push(...toAdd);
  fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2));
  console.log(`\n✓ 写入(总数 ${recipes.length})`);
} else {
  console.log('(dry-run, 加 --write 才会保存)');
}
