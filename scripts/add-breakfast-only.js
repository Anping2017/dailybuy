/**
 * 新增 20 道"早餐专属"菜谱 — mealTypes 只有 ['breakfast']
 * 这些菜不会出现在午餐/晚餐推荐中
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));
const ingredients = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'ingredients.json'), 'utf8'));
const validIng = new Set(ingredients.map(i => i.id));

// 统一基础字段 — 所有菜 mealTypes 仅 breakfast
const base = (cuisine = 'chinese', regional = 'homestyle') => ({
  cuisine, regionalCuisine: regional, status: 'reviewed',
  mealTypes: ['breakfast'],  // 关键: 只在早餐推荐
});

const NEW = [
  // ========== 中式煎饼/烙饼 ==========
  {
    ...base('chinese', 'northern'),
    id: 'bf_chinese_jianbing', nameZh: '天津煎饼果子', nameEn: 'Chinese Crepe',
    cookingMethod: 'deep_fry',
    flavors: ['salty', 'umami'], difficulty: 'medium', minCookingLevel: 'intermediate',
    prepTime: 10, cookTime: 8, servings: 1,
    description: '北方经典早餐，绿豆面皮配鸡蛋薄脆酱料。',
    ingredients: [
      { ingredientId: 'flour', amount: 80, unit: 'g' },
      { ingredientId: 'mung_bean', amount: 20, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'cilantro', amount: 5, unit: 'g' },
      { ingredientId: 'sesame_seed', amount: 3, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
    ],
    steps: ['面粉和绿豆粉混合加水搅拌成糊', '平底锅薄油摊成薄皮', '打入鸡蛋抹开', '撒葱花香菜芝麻', '翻面涂甜面酱辣椒酱卷起'],
    tags: ['早餐', '北方'],
  },
  {
    ...base('chinese', 'homestyle'),
    id: 'bf_scallion_pancake', nameZh: '葱油煎饼', nameEn: 'Scallion Pancake',
    cookingMethod: 'deep_fry',
    flavors: ['salty', 'umami'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 15, cookTime: 10, servings: 2,
    description: '层次分明葱香浓郁，家常早餐。',
    ingredients: [
      { ingredientId: 'flour', amount: 250, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 40, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 30, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
    ],
    steps: ['面粉加温水揉软面团醒10分钟', '擀开涂油撒盐葱花', '卷起盘圆再擀薄', '平底锅小火煎两面金黄'],
    tags: ['早餐'],
  },
  {
    ...base('chinese', 'homestyle'),
    id: 'bf_egg_pancake', nameZh: '鸡蛋灌饼', nameEn: 'Egg-stuffed Pancake',
    cookingMethod: 'deep_fry',
    flavors: ['salty', 'umami'], difficulty: 'medium', minCookingLevel: 'intermediate',
    prepTime: 10, cookTime: 10, servings: 2,
    description: '饼皮包裹流心鸡蛋，外酥内香。',
    ingredients: [
      { ingredientId: 'flour', amount: 200, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'lettuce', amount: 50, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
    ],
    steps: ['面团醒20分钟擀成薄饼', '平底锅两面煎微黄鼓起', '从气泡处切口灌入鸡蛋液', '继续煎至鸡蛋熟', '刷酱包生菜卷起'],
    tags: ['早餐'],
  },
  {
    ...base('chinese', 'homestyle'),
    id: 'bf_corn_pancake', nameZh: '玉米煎饼', nameEn: 'Corn Pancake',
    cookingMethod: 'deep_fry',
    flavors: ['sweet', 'salty'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 8, cookTime: 6, servings: 2,
    description: '香甜松软，简单快手。',
    ingredients: [
      { ingredientId: 'corn', amount: 200, unit: 'g' },
      { ingredientId: 'flour', amount: 100, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'milk', amount: 80, unit: 'ml' },
      { ingredientId: 'sugar', amount: 15, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['玉米粒煮熟沥干', '混合面粉鸡蛋牛奶糖盐', '加玉米拌匀', '平底锅倒入面糊煎两面金黄'],
    tags: ['早餐', '快手菜'],
  },
  {
    ...base('chinese', 'homestyle'),
    id: 'bf_potato_pancake', nameZh: '土豆丝煎饼', nameEn: 'Potato Shred Pancake',
    cookingMethod: 'deep_fry',
    flavors: ['salty'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 10, cookTime: 8, servings: 2,
    description: '外脆内软，黄金诱人。',
    ingredients: [
      { ingredientId: 'potato', amount: 250, unit: 'g' },
      { ingredientId: 'flour', amount: 60, unit: 'g' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
    ],
    steps: ['土豆擦丝挤干水', '拌面粉鸡蛋葱花盐成糊', '平底锅摊饼中火两面煎金黄'],
    tags: ['早餐', '快手菜'],
  },

  // ========== 西式松饼/华夫/吐司 ==========
  {
    ...base('western', 'american'),
    id: 'bf_pancakes_maple', nameZh: '美式松饼配枫糖', nameEn: 'American Pancakes with Maple',
    cookingMethod: 'deep_fry',
    flavors: ['sweet'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 5, cookTime: 8, servings: 2,
    description: '蓬松柔软的经典美式早餐。',
    ingredients: [
      { ingredientId: 'flour', amount: 150, unit: 'g' },
      { ingredientId: 'milk', amount: 200, unit: 'ml' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'butter', amount: 20, unit: 'g' },
      { ingredientId: 'sugar', amount: 20, unit: 'g' },
      { ingredientId: 'vanilla', amount: 2, unit: 'ml' },
      { ingredientId: 'maple_syrup', amount: 30, unit: 'ml' },
    ],
    steps: ['面粉糖混合', '加牛奶鸡蛋融化黄油香草精搅匀', '静置 5 分钟', '平底锅小火舀面糊煎两面金黄', '淋枫糖浆'],
    tags: ['早餐', '西餐'],
  },
  {
    ...base('western', 'american'),
    id: 'bf_blueberry_pancakes', nameZh: '蓝莓松饼', nameEn: 'Blueberry Pancakes',
    cookingMethod: 'deep_fry',
    flavors: ['sweet'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 5, cookTime: 8, servings: 2,
    description: '松饼里夹着酸甜蓝莓。',
    ingredients: [
      { ingredientId: 'flour', amount: 150, unit: 'g' },
      { ingredientId: 'milk', amount: 200, unit: 'ml' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'butter', amount: 20, unit: 'g' },
      { ingredientId: 'sugar', amount: 20, unit: 'g' },
      { ingredientId: 'blueberry', amount: 80, unit: 'g' },
      { ingredientId: 'honey', amount: 15, unit: 'g' },
    ],
    steps: ['面粉糖混合', '加牛奶蛋融化黄油搅匀', '撒蓝莓轻拌', '平底锅小火煎', '淋蜂蜜'],
    tags: ['早餐', '西餐'],
  },
  {
    ...base('western', 'american'),
    id: 'bf_waffle_classic', nameZh: '经典华夫饼', nameEn: 'Classic Waffle',
    cookingMethod: 'roast',
    flavors: ['sweet'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 5, cookTime: 6, servings: 2,
    description: '外酥内软的格子华夫饼。',
    ingredients: [
      { ingredientId: 'flour', amount: 180, unit: 'g' },
      { ingredientId: 'milk', amount: 200, unit: 'ml' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'butter', amount: 40, unit: 'g' },
      { ingredientId: 'sugar', amount: 25, unit: 'g' },
      { ingredientId: 'maple_syrup', amount: 30, unit: 'ml' },
    ],
    steps: ['面粉糖混合', '加蛋奶融化黄油搅匀', '倒入华夫饼机烤 4 分钟', '淋枫糖浆'],
    tags: ['早餐', '西餐'],
  },
  {
    ...base('western', 'french'),
    id: 'bf_french_toast', nameZh: '法式吐司', nameEn: 'French Toast',
    cookingMethod: 'deep_fry',
    flavors: ['sweet'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 5, servings: 2,
    description: '吐司浸蛋液煎至金黄。',
    ingredients: [
      { ingredientId: 'bread', amount: 120, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'milk', amount: 100, unit: 'ml' },
      { ingredientId: 'butter', amount: 15, unit: 'g' },
      { ingredientId: 'sugar', amount: 10, unit: 'g' },
      { ingredientId: 'vanilla', amount: 2, unit: 'ml' },
      { ingredientId: 'maple_syrup', amount: 20, unit: 'ml' },
    ],
    steps: ['蛋液加奶糖香草混匀', '吐司浸泡蛋液', '平底锅黄油煎两面金黄', '淋枫糖'],
    tags: ['早餐', '西餐', '快手菜'],
  },
  {
    ...base('western', 'american'),
    id: 'bf_bacon_eggs', nameZh: '培根煎蛋', nameEn: 'Bacon & Eggs',
    cookingMethod: 'deep_fry',
    flavors: ['salty', 'umami'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 3, cookTime: 6, servings: 1,
    description: '经典美式早餐，培根配太阳蛋。',
    ingredients: [
      { ingredientId: 'bacon', amount: 60, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 1, unit: 'g' },
      { ingredientId: 'black_pepper', amount: 1, unit: 'g' },
    ],
    steps: ['培根煎至金黄取出', '锅留油打入鸡蛋煎太阳蛋', '撒盐黑椒'],
    tags: ['早餐', '西餐', '快手菜', '高蛋白'],
  },

  // ========== 蛋类早餐 ==========
  {
    ...base('chinese', 'homestyle'),
    id: 'bf_tea_egg', nameZh: '茶叶蛋', nameEn: 'Chinese Tea Egg',
    cookingMethod: 'boil',
    flavors: ['salty', 'umami'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 60, servings: 4,
    description: '浸泡入味的咸香茶香鸡蛋。',
    ingredients: [
      { ingredientId: 'egg', amount: 8, unit: 'piece' },
      { ingredientId: 'soy_sauce', amount: 30, unit: 'ml' },
      { ingredientId: 'star_anise', amount: 2, unit: 'piece' },
      { ingredientId: 'cinnamon', amount: 2, unit: 'g' },
      { ingredientId: 'bay_leaf', amount: 2, unit: 'piece' },
      { ingredientId: 'salt', amount: 5, unit: 'g' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
    ],
    steps: ['鸡蛋煮熟捞出冷水过凉', '敲出裂痕让茶香入味', '水加红茶包生抽八角桂皮香叶盐糖煮开', '下鸡蛋煮 30 分钟泡 4 小时以上'],
    tags: ['早餐'],
  },
  {
    ...base('chinese', 'homestyle'),
    id: 'bf_soy_sauce_eggs', nameZh: '日式溏心蛋', nameEn: 'Japanese Ramen Egg',
    cookingMethod: 'boil',
    flavors: ['salty', 'umami', 'sweet'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 5, cookTime: 7, servings: 2,
    description: '金黄流心, 酱香浸入蛋白。',
    ingredients: [
      { ingredientId: 'egg', amount: 4, unit: 'piece' },
      { ingredientId: 'soy_sauce', amount: 40, unit: 'ml' },
      { ingredientId: 'mirin', amount: 20, unit: 'ml' },
      { ingredientId: 'sugar', amount: 10, unit: 'g' },
    ],
    steps: ['鸡蛋室温, 水开下锅煮6分30秒', '立刻冰水过凉去壳', '生抽味醂糖煮开放凉', '鸡蛋泡腌制液 8 小时以上'],
    tags: ['早餐', '日式'],
  },
  {
    ...base('chinese', 'homestyle'),
    id: 'bf_pan_fried_eggs', nameZh: '家常煎蛋', nameEn: 'Pan-fried Eggs',
    cookingMethod: 'deep_fry',
    flavors: ['salty'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 1, cookTime: 3, servings: 1,
    description: '简单营养，2 分钟早餐。',
    ingredients: [
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 1, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 5, unit: 'ml' },
    ],
    steps: ['平底锅小油热', '打入鸡蛋小火煎', '撒盐或淋生抽'],
    tags: ['早餐', '快手菜'],
  },
  {
    ...base('chinese', 'homestyle'),
    id: 'bf_omelette_simple', nameZh: '芝士蛋卷', nameEn: 'Cheese Omelette',
    cookingMethod: 'deep_fry',
    flavors: ['salty', 'umami'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 3, cookTime: 4, servings: 1,
    description: '滑嫩蛋皮包着芝士。',
    ingredients: [
      { ingredientId: 'egg', amount: 3, unit: 'piece' },
      { ingredientId: 'cheese', amount: 40, unit: 'g' },
      { ingredientId: 'milk', amount: 20, unit: 'ml' },
      { ingredientId: 'butter', amount: 10, unit: 'g' },
      { ingredientId: 'salt', amount: 1, unit: 'g' },
      { ingredientId: 'black_pepper', amount: 1, unit: 'g' },
    ],
    steps: ['蛋加奶盐黑椒打散', '小火黄油下蛋液', '撒芝士半熟时对折', '继续小火煎 1 分钟'],
    tags: ['早餐', '西餐', '快手菜', '高蛋白'],
  },

  // ========== 包子/粥/中式 ==========
  {
    ...base('chinese', 'cantonese'),
    id: 'bf_shrimp_wonton', nameZh: '鲜虾云吞面', nameEn: 'Shrimp Wonton Noodle',
    cookingMethod: 'staple',
    flavors: ['umami', 'light'], difficulty: 'medium', minCookingLevel: 'intermediate',
    prepTime: 30, cookTime: 10, servings: 1,
    description: '港式早餐经典。',
    ingredients: [
      { ingredientId: 'flour', amount: 80, unit: 'g' },
      { ingredientId: 'shrimp', amount: 100, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 50, unit: 'g' },
      { ingredientId: 'noodles_dried', amount: 100, unit: 'g' },
      { ingredientId: 'bok_choy', amount: 80, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
    ],
    steps: ['虾仁剁碎加肉末调料成馅', '面粉和皮擀薄包馅', '高汤煮开下云吞煮 4 分钟', '下面条青菜煮 3 分钟'],
    tags: ['早餐', '粤菜'],
  },
  {
    ...base('chinese', 'cantonese'),
    id: 'bf_rice_roll', nameZh: '鸡蛋肠粉', nameEn: 'Rice Roll with Egg',
    cookingMethod: 'steam',
    flavors: ['salty', 'umami'], difficulty: 'medium', minCookingLevel: 'intermediate',
    prepTime: 10, cookTime: 8, servings: 2,
    description: '粤式经典早茶。',
    ingredients: [
      { ingredientId: 'rice_flour', amount: 150, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'soy_sauce', amount: 20, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
    ],
    steps: ['米粉加水调糊', '平盘薄抹一层蒸 1 分钟', '打入鸡蛋抹开', '再蒸 1 分钟卷起', '淋生抽香油撒葱花'],
    tags: ['早餐', '粤菜'],
  },
  {
    ...base('chinese', 'homestyle'),
    id: 'bf_eight_treasure_porridge', nameZh: '八宝粥', nameEn: 'Eight Treasure Congee',
    cookingMethod: 'staple',
    flavors: ['sweet'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 240, cookTime: 90, servings: 4,
    description: '多种谷物豆类熬成的甜粥。',
    ingredients: [
      { ingredientId: 'rice', amount: 60, unit: 'g' },
      { ingredientId: 'millet', amount: 40, unit: 'g' },
      { ingredientId: 'red_bean', amount: 40, unit: 'g' },
      { ingredientId: 'mung_bean', amount: 30, unit: 'g' },
      { ingredientId: 'peanut', amount: 30, unit: 'g' },
      { ingredientId: 'goji_berry', amount: 10, unit: 'g' },
      { ingredientId: 'sugar', amount: 30, unit: 'g' },
    ],
    steps: ['红豆绿豆提前浸泡 4 小时', '所有材料一起煮', '大火开转小火 1 小时', '最后加枸杞和糖煮 5 分钟'],
    tags: ['早餐', '健康'],
  },

  // ========== 西式早餐碗/三明治 ==========
  {
    ...base('western', 'american'),
    id: 'bf_breakfast_burrito', nameZh: '早餐卷饼', nameEn: 'Breakfast Burrito',
    cookingMethod: 'staple',
    flavors: ['salty', 'umami'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 5, cookTime: 8, servings: 1,
    description: '一个卷饼搞定主食蛋白蔬菜。',
    ingredients: [
      { ingredientId: 'flour', amount: 80, unit: 'g' },
      { ingredientId: 'egg', amount: 2, unit: 'piece' },
      { ingredientId: 'bacon', amount: 40, unit: 'g' },
      { ingredientId: 'cheese', amount: 30, unit: 'g' },
      { ingredientId: 'tomato', amount: 50, unit: 'g' },
      { ingredientId: 'lettuce', amount: 40, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 5, unit: 'ml' },
    ],
    steps: ['面皮擀薄煎软', '培根煎香', '鸡蛋炒散', '铺上芝士番茄生菜培根鸡蛋卷起'],
    tags: ['早餐', '西餐'],
  },
  {
    ...base('western', 'american'),
    id: 'bf_acai_bowl', nameZh: '莓果谷物碗', nameEn: 'Berry Granola Bowl',
    cookingMethod: 'cold_dish',
    flavors: ['sweet', 'sour'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 0, servings: 1,
    description: '无需开火的营养早餐碗。',
    ingredients: [
      { ingredientId: 'yogurt', amount: 200, unit: 'g' },
      { ingredientId: 'oats', amount: 40, unit: 'g' },
      { ingredientId: 'blueberry', amount: 60, unit: 'g' },
      { ingredientId: 'strawberry', amount: 60, unit: 'g' },
      { ingredientId: 'banana', amount: 1, unit: 'piece' },
      { ingredientId: 'honey', amount: 15, unit: 'g' },
      { ingredientId: 'almond', amount: 15, unit: 'g' },
    ],
    steps: ['酸奶倒碗底', '铺燕麦', '摆水果', '撒杏仁碎', '淋蜂蜜'],
    tags: ['早餐', '健康', '快手菜', '低卡'],
  },
  {
    ...base('western', 'american'),
    id: 'bf_overnight_oats', nameZh: '隔夜燕麦杯', nameEn: 'Overnight Oats',
    cookingMethod: 'cold_dish',
    flavors: ['sweet'], difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 0, servings: 1,
    description: '前一晚准备, 早上直接吃。',
    ingredients: [
      { ingredientId: 'oats', amount: 50, unit: 'g' },
      { ingredientId: 'milk', amount: 200, unit: 'ml' },
      { ingredientId: 'yogurt', amount: 50, unit: 'g' },
      { ingredientId: 'chia', amount: 10, unit: 'g' },
      { ingredientId: 'honey', amount: 10, unit: 'g' },
      { ingredientId: 'blueberry', amount: 50, unit: 'g' },
    ],
    steps: ['燕麦奶酸奶奇亚籽混合', '加蜂蜜', '冷藏过夜', '早上加蓝莓即食'],
    tags: ['早餐', '健康', '快手菜', '低卡'],
  },

  // ========== 中式包子蛋饺 ==========
  {
    ...base('chinese', 'cantonese'),
    id: 'bf_bbq_pork_bun', nameZh: '叉烧包', nameEn: 'BBQ Pork Bun',
    cookingMethod: 'steam',
    flavors: ['sweet', 'salty', 'umami'], difficulty: 'hard', minCookingLevel: 'advanced',
    prepTime: 120, cookTime: 15, servings: 4,
    description: '粤式经典早茶点心。',
    ingredients: [
      { ingredientId: 'flour', amount: 300, unit: 'g' },
      { ingredientId: 'pork_belly', amount: 200, unit: 'g' },
      { ingredientId: 'honey', amount: 30, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 20, unit: 'ml' },
      { ingredientId: 'oyster_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'sugar', amount: 20, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
    ],
    steps: ['猪肉用蜜汁腌料腌 1 小时烤成叉烧', '切丁炒成馅', '面团发酵包馅', '蒸 12 分钟'],
    tags: ['早餐', '粤菜'],
  },
  {
    ...base('chinese', 'jiangsu'),
    id: 'bf_soup_dumpling_xlb', nameZh: '小笼汤包', nameEn: 'Soup Dumpling',
    cookingMethod: 'steam',
    flavors: ['umami', 'salty'], difficulty: 'hard', minCookingLevel: 'advanced',
    prepTime: 180, cookTime: 12, servings: 3,
    description: '汤汁饱满的江南名点。',
    ingredients: [
      { ingredientId: 'flour', amount: 200, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 250, unit: 'g' },
      { ingredientId: 'pork_skin', amount: 100, unit: 'g' },
      { ingredientId: 'ginger', amount: 10, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
    ],
    steps: ['猪皮熬汤冷冻成冻', '冻切丁拌肉馅', '面团擀薄皮包馅捏褶', '蒸 10 分钟'],
    tags: ['早餐', '江浙'],
  },
  {
    ...base('chinese', 'homestyle'),
    id: 'bf_doujiang_classic', nameZh: '咸豆浆油条', nameEn: 'Savory Soy Milk & Youtiao',
    cookingMethod: 'soup',
    flavors: ['salty', 'umami'], difficulty: 'easy', minCookingLevel: 'basic',
    prepTime: 5, cookTime: 5, servings: 2,
    description: '上海风味咸豆浆配油条。',
    ingredients: [
      { ingredientId: 'soybean', amount: 100, unit: 'g' },
      { ingredientId: 'dried_shrimp', amount: 5, unit: 'g' },
      { ingredientId: 'pickled_mustard', amount: 30, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 5, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
      { ingredientId: 'flour', amount: 150, unit: 'g' },
    ],
    steps: ['黄豆打浆煮开', '碗底放虾皮榨菜葱花生抽醋', '冲入热豆浆使其略凝结', '配炸好的油条'],
    tags: ['早餐'],
  },
];

// 验证食材
const skipped = [];
const valid = NEW.filter(r => {
  const bad = r.ingredients.filter(ri => !validIng.has(ri.ingredientId));
  if (bad.length > 0) {
    skipped.push({ name: r.nameZh, missing: bad.map(i => i.ingredientId) });
    return false;
  }
  return true;
});

if (skipped.length > 0) {
  console.log('⚠ 跳过(食材缺失):');
  skipped.forEach(s => console.log(`  ${s.name}: ${s.missing.join(', ')}`));
}

const existingIds = new Set(recipes.map(r => r.id));
const toAdd = valid.filter(r => {
  if (existingIds.has(r.id)) { console.log(`⚠ 已存在: ${r.id}`); return false; }
  return true;
});

console.log(`\n新增 ${toAdd.length} 道早餐专属菜 (mealTypes = ['breakfast'] 仅)`);
toAdd.forEach(r => console.log(`  + ${r.nameZh}`));

if (process.argv.includes('--write')) {
  recipes.push(...toAdd);
  fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2));
  console.log(`\n✓ 写入, 总数 ${recipes.length}`);
} else {
  console.log('(dry-run)');
}
