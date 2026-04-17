/* eslint-disable */
// Apply expert review fixes to Sichuan/Hunan recipes
// Outputs review-sichuan-hunan-fixed.json

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, 'review-sichuan-hunan.json');
const OUTPUT = path.join(__dirname, 'review-sichuan-hunan-fixed.json');

const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

// Helper: ensure ingredient exists in array
function ensureIngredient(ings, id, amount, unit) {
  const exists = ings.find((i) => i.ingredientId === id);
  if (exists) return ings;
  ings.push({ ingredientId: id, amount, unit });
  return ings;
}

// Helper: replace ingredient ID
function replaceIngredient(ings, oldId, newId) {
  return ings.map((i) => (i.ingredientId === oldId ? { ...i, ingredientId: newId } : i));
}

// Helper: remove ingredient
function removeIngredient(ings, id) {
  return ings.filter((i) => i.ingredientId !== id);
}

// Per-dish fixes (full replacement of ingredients/steps for dishes that need correction)
const DISH_OVERRIDES = {
  // 1. 宫保鸡丁 - Add sichuan_pepper, dried chili, peanuts via dried_shrimp substitute is wrong
  // Authentic Kung Pao needs sichuan_pepper. Add chili_flakes and sichuan_pepper.
  kung_pao_chicken: {
    ingredients: [
      { ingredientId: 'chicken_breast', amount: 300, unit: 'g' },
      { ingredientId: 'capsicum', amount: 80, unit: 'g' },
      { ingredientId: 'cucumber', amount: 80, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 30, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 5, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 3, unit: 'g' },
      { ingredientId: 'light_soy', amount: 15, unit: 'ml' },
      { ingredientId: 'dark_soy', amount: 5, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 15, unit: 'ml' },
      { ingredientId: 'sugar', amount: 12, unit: 'g' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 30, unit: 'ml' },
    ],
    steps: [
      '鸡胸肉切1.5cm见方丁，加生抽5ml、料酒5ml、淀粉5g、少许盐抓匀腌15分钟',
      '调宫保汁：生抽10ml、老抽5ml、醋15ml、糖12g、料酒5ml、淀粉5g与30ml清水搅匀备用',
      '青椒、黄瓜切丁，葱白切1cm马耳段，姜蒜切末，干辣椒剪段去籽',
      '热锅倒油，下鸡丁滑炒至外表变白即盛出',
      '锅留底油，小火下花椒和干辣椒段慢慢煸炒至辣椒呈棕红色出香',
      '转大火加姜蒜末爆香，倒入鸡丁与葱白段快速翻炒',
      '加入青椒和黄瓜丁颠炒两下，沿锅边淋入宫保汁',
      '大火翻炒至汁水浓稠裹住鸡丁，亮油即可出锅',
    ],
  },

  // 2. 麻婆豆腐 - MUST have sichuan_pepper
  mapo_tofu: {
    ingredients: [
      { ingredientId: 'tofu', amount: 400, unit: 'g' },
      { ingredientId: 'beef_mince', amount: 100, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 25, unit: 'g' },
      { ingredientId: 'bean_paste', amount: 10, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 5, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 5, unit: 'g' },
      { ingredientId: 'garlic', amount: 15, unit: 'g' },
      { ingredientId: 'ginger', amount: 8, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 20, unit: 'g' },
      { ingredientId: 'light_soy', amount: 10, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 12, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 30, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '嫩豆腐切2cm方块，放入加少许盐的温水中浸泡10分钟去豆腥并使豆腐紧实',
      '花椒小火干锅炒香后碾成花椒粉备用，姜蒜切末，葱切葱花',
      '热锅倒油，下牛肉末中火炒至变色酥香，烹入料酒炒出油',
      '推牛肉至一边，加豆瓣酱和豆豉小火炒出红油，加姜蒜末和辣椒面炒香',
      '倒入250ml热水煮开，加生抽调味，轻轻滑入豆腐块',
      '中火烧3分钟让豆腐入味，期间用勺背轻推豆腐避免散碎',
      '分两次淋入水淀粉勾芡，使汤汁浓稠裹住豆腐',
      '出锅装盘，撒上花椒粉和葱花即成麻辣鲜烫的麻婆豆腐',
    ],
  },

  // 3. 鱼香茄子 - need ginger; existing has good ingredients
  stir_fry_eggplant: {
    ingredients: [
      { ingredientId: 'eggplant', amount: 400, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 100, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 20, unit: 'g' },
      { ingredientId: 'garlic', amount: 15, unit: 'g' },
      { ingredientId: 'ginger', amount: 8, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'light_soy', amount: 15, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 15, unit: 'ml' },
      { ingredientId: 'sugar', amount: 15, unit: 'g' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 40, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '茄子切手指粗的长条，撒1g盐拌匀腌10分钟，挤干水分（茄子吸油少口感更好）',
      '调鱼香汁：生抽15ml、醋15ml、糖15g、料酒10ml、淀粉8g与50ml水搅匀备用',
      '姜蒜切末，葱切葱花，葱白与葱绿分开',
      '锅烧热下30ml油，茄条入锅煎至表面金黄塌软盛出',
      '锅留底油下肉末炒散变色，加豆瓣酱小火炒出红油',
      '下姜末蒜末和葱白末爆香',
      '回入茄条快速翻匀，沿锅边烹入鱼香汁',
      '大火颠炒至汁水浓稠裹匀茄子，撒葱花出锅',
    ],
  },

  // 4. 水煮鲈鱼 - fix invalid ingredient IDs
  sichuan_shuizhu_seabass: {
    ingredients: [
      { ingredientId: 'snapper', amount: 700, unit: 'g' },
      { ingredientId: 'bean_sprouts', amount: 250, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 30, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 15, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 10, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 8, unit: 'g' },
      { ingredientId: 'garlic', amount: 30, unit: 'g' },
      { ingredientId: 'ginger', amount: 20, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 30, unit: 'g' },
      { ingredientId: 'cooking_wine', amount: 20, unit: 'ml' },
      { ingredientId: 'starch', amount: 15, unit: 'g' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
      { ingredientId: 'cooking_oil', amount: 150, unit: 'ml' },
      { ingredientId: 'chicken_stock', amount: 500, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
      { ingredientId: 'cilantro', amount: 10, unit: 'g' },
    ],
    steps: [
      '鲈鱼去鳞去鳃洗净，沿脊骨片出净鱼片约0.5cm厚，鱼骨鱼头另切大块',
      '鱼片加料酒10ml、盐2g、蛋清和淀粉抓匀上浆腌15分钟使鱼片鲜嫩',
      '豆芽用沸水焯30秒捞出沥干铺在大碗底部',
      '热锅下30ml油，爆香一半姜蒜末，下豆瓣酱小火炒出红油',
      '倒入高汤煮开，下鱼骨鱼头和10ml料酒煮5分钟出鲜味',
      '调中小火，将鱼片一片一片滑入汤中，煮约2分钟至鱼片变白卷起',
      '将鱼片连汤倒入豆芽碗中，表面撒满剩余蒜末、干辣椒段和花椒',
      '另起锅烧150ml油至冒青烟，趁热浇在辣椒花椒上激出麻辣香气',
      '撒香菜段即可上桌，鱼片滑嫩麻辣鲜香',
    ],
  },

  // 5. 蒜泥白肉 - keep as is (already authentic)

  // 11. 酸菜鱼片 - the 'chinese_cabbage' is meant to substitute pickled mustard greens. add doubanjiang isn't traditional but add white pepper
  // Keep good

  // 13. 麻辣水煮鱼片 - good, expand a bit
  spicy_fish_fillet_stew: {
    ingredients: [
      { ingredientId: 'fish_fillet', amount: 400, unit: 'g' },
      { ingredientId: 'bean_sprouts', amount: 200, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 30, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 6, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 12, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 15, unit: 'g' },
      { ingredientId: 'garlic', amount: 25, unit: 'g' },
      { ingredientId: 'ginger', amount: 12, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'starch', amount: 15, unit: 'g' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
      { ingredientId: 'cooking_wine', amount: 15, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 80, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '鱼片洗净沥干，斜刀片成0.5cm厚薄片，加蛋清、淀粉、料酒和少许盐抓匀腌15分钟',
      '豆芽焯水1分钟铺在大碗底部',
      '锅烧热下20ml油，爆香一半姜蒜末，下豆瓣酱小火炒出红油',
      '加500ml热水煮开，调味后将鱼片一片片滑入锅中，中火煮约2分钟至鱼片变白',
      '连汤将鱼片倒入豆芽碗中，表面撒上剩余蒜末、干辣椒段和花椒粒',
      '另起锅烧热60ml油至冒青烟，趁热泼在辣椒花椒上激出麻辣香气',
      '撒葱花即可，趁热享用',
    ],
  },

  // 18. 麻婆茄子 - add salt, looks ok
  // 28. 湘西腊肉炒蒜薹 - bacon = 腊肉 OK, leek serving as 蒜薹 - ok
  // 27. 湘味剁椒蒸鱼 - fish_fillet ok

  // 41. 蒜苗回锅肉
  'double-cooked-pork-belly': {
    ingredients: [
      { ingredientId: 'pork_belly', amount: 300, unit: 'g' },
      { ingredientId: 'leek', amount: 100, unit: 'g' },
      { ingredientId: 'capsicum', amount: 80, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'ginger', amount: 8, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 20, unit: 'g' },
      { ingredientId: 'bean_paste', amount: 10, unit: 'g' },
      { ingredientId: 'light_soy', amount: 10, unit: 'ml' },
      { ingredientId: 'dark_soy', amount: 5, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
    ],
    steps: [
      '五花肉整块冷水下锅加姜片和料酒，水开后中火煮15分钟至八成熟筷子能插透',
      '捞出晾凉至不烫手，切成2-3mm厚的大薄片',
      '蒜苗斜切马耳段，蒜白与蒜绿分开，青椒切菱形片',
      '锅烧热不放油，下肉片中火煸炒至边缘微卷呈灯盏窝状并出油',
      '将肉推至锅边，下豆瓣酱和甜面酱小火炒出红油',
      '加蒜白和姜末爆香，淋少许老抽上色，调入糖增鲜',
      '加入青椒大火翻炒30秒，再下蒜绿翻匀',
      '蒜苗刚断生即出锅，避免炒老',
    ],
  },

  // 42. 椒麻鸡块 - add sichuan_pepper (核心)
  'sichuan-spicy-chicken-cubes': {
    ingredients: [
      { ingredientId: 'chicken_thigh', amount: 300, unit: 'g' },
      { ingredientId: 'capsicum', amount: 80, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 5, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 15, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'ginger', amount: 8, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 8, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '鸡腿肉去骨切2cm方块，加酱油、料酒、淀粉和少许盐抓匀腌15分钟',
      '青椒切块，干辣椒剪段去籽，姜蒜切末，葱切马耳段',
      '锅烧热下油，鸡块下锅中火煎至两面金黄表皮酥香盛出',
      '锅留底油，小火下花椒和干辣椒段炒至棕红色出麻香',
      '加姜蒜末爆香，倒回鸡块大火翻炒',
      '加青椒和葱段大火快炒1分钟',
      '调入少许盐翻匀出锅，麻香味浓郁',
    ],
  },

  // 44. 毛血旺牛肉 - add sichuan_pepper (毛血旺核心是麻辣)
  'sichuan-boiled-beef-slices': {
    ingredients: [
      { ingredientId: 'beef_sirloin', amount: 300, unit: 'g' },
      { ingredientId: 'bean_sprouts', amount: 150, unit: 'g' },
      { ingredientId: 'celery', amount: 80, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 25, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 8, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 5, unit: 'g' },
      { ingredientId: 'garlic', amount: 15, unit: 'g' },
      { ingredientId: 'ginger', amount: 10, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 10, unit: 'g' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
      { ingredientId: 'cooking_oil', amount: 60, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '牛肉逆纹切薄片，加蛋清、淀粉、料酒和少许盐抓匀腌15分钟',
      '豆芽和芹菜段焯水1分钟铺在大碗底部',
      '锅烧热下20ml油，爆香一半姜蒜末，下豆瓣酱小火炒出红油',
      '加500ml热水煮开成红汤底，调入生抽和盐',
      '调中小火，将牛肉片一片片滑入汤中，煮约90秒至变色',
      '连汤将牛肉倒在豆芽芹菜上，表面撒剩余蒜末、辣椒面和花椒',
      '另起锅烧热40ml油至冒青烟，趁热浇在辣椒花椒上激出麻辣香',
      '撒葱花即成毛血旺式麻辣牛肉',
    ],
  },

  // 48. 麻辣豆芽 - need 5+ steps + sichuan_pepper
  'sichuan-stir-fried-bean-sprouts': {
    ingredients: [
      { ingredientId: 'bean_sprouts', amount: 300, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 10, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 3, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'vinegar', amount: 10, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
    ],
    steps: [
      '豆芽掐去根须洗净，沥干水分',
      '干辣椒剪段去籽，蒜切末，葱切葱花',
      '锅烧热下油，小火下花椒粒和干辣椒段炒至辣椒微焦出麻辣香',
      '转大火加入蒜末爆香',
      '倒入豆芽大火快炒约1分钟，沿锅边烹入醋',
      '加生抽和盐快速翻匀，撒葱花出锅，保持豆芽脆嫩',
    ],
  },

  // 62. 湘味炒菠菜 - too few steps
  'hunan-stir-fried-egg-spinach': {
    ingredients: [
      { ingredientId: 'spinach', amount: 350, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 15, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 5, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
    ],
    steps: [
      '菠菜洗净切8cm长段，沸水中加少许盐和油焯10秒迅速过冷水保持翠绿',
      '小米椒切圈，蒜切末',
      '锅烧热下油，下蒜末和小米椒爆香',
      '加少许豆瓣酱炒出红油提味',
      '大火倒入菠菜段快速翻炒30秒',
      '加生抽和盐调味，翻匀立即出锅保持脆嫩',
    ],
  },

  // 67. 湘味辣炒土豆片
  hunan_spicy_stir_fry_potato: {
    ingredients: [
      { ingredientId: 'potato', amount: 300, unit: 'g' },
      { ingredientId: 'capsicum', amount: 80, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 15, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 10, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'vinegar', amount: 10, unit: 'ml' },
      { ingredientId: 'light_soy', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
    ],
    steps: [
      '土豆去皮切2mm薄片，用清水反复冲洗去淀粉，沥干',
      '青椒和小米椒斜切圈，蒜切末，葱切葱花',
      '锅烧热下油，下蒜末和小米椒爆香',
      '加豆瓣酱小火炒出红油',
      '倒入土豆片大火翻炒2-3分钟至边缘半透明',
      '加青椒翻炒，沿锅边淋入醋激发香味',
      '加生抽和盐调味，撒葱花翻匀出锅，保持土豆脆嫩',
    ],
  },

  // 72. 川味西兰花炒肉
  sichuan_spicy_broccoli_pork: {
    ingredients: [
      { ingredientId: 'broccoli', amount: 300, unit: 'g' },
      { ingredientId: 'pork_belly', amount: 120, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 15, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 8, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
    ],
    steps: [
      '西兰花掰小朵洗净，沸水加盐焯1分钟捞出过冷水沥干',
      '五花肉切薄片，姜蒜切末，小米椒切圈',
      '锅烧热不放油直接下五花肉煸炒至出油卷曲微焦',
      '加豆瓣酱、姜蒜末和辣椒小火炒出红油',
      '烹入料酒倒入西兰花大火翻炒2分钟',
      '加生抽和少许盐调味，大火颠匀出锅',
    ],
  },

  // 75. 麻婆菠菜 - need sichuan pepper, expand steps
  sichuan_mapo_spinach: {
    ingredients: [
      { ingredientId: 'spinach', amount: 300, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 80, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 15, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 4, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 4, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'light_soy', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 8, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '菠菜去根洗净切段，沸水加少许油焯10秒过冷水沥干铺盘底',
      '花椒小火干锅炒香碾成花椒粉，姜蒜切末',
      '锅烧热下油，下肉末炒散变色出油',
      '加豆瓣酱和辣椒面小火炒出红油',
      '加姜蒜末爆香，倒入100ml清水煮开',
      '加生抽调味，淋入水淀粉勾薄芡',
      '将麻辣肉末汁浇在菠菜上，撒花椒粉和葱花即成',
    ],
  },

  // 76. 麻辣豆腐汤
  sichuan_spicy_tofu_soup: {
    ingredients: [
      { ingredientId: 'tofu', amount: 300, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 80, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 20, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 3, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 5, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'cilantro', amount: 5, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'starch', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '嫩豆腐切1cm小丁，淡盐水浸泡5分钟去豆腥',
      '姜蒜切末，葱切葱花，香菜切段',
      '锅烧热下油，下肉末炒散变色',
      '加豆瓣酱和辣椒面小火炒出红油，下姜蒜末爆香',
      '倒入600ml热水煮开，下豆腐丁煮5分钟入味',
      '加盐调味，淋少许水淀粉使汤微稠，淋蛋液成蛋花',
      '出锅淋麻油，撒花椒粉、葱花和香菜即成麻辣鲜香',
    ],
  },

  // 81. 湘味炒茄子
  hunan_stir_fry_eggplant: {
    ingredients: [
      { ingredientId: 'eggplant', amount: 350, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 80, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 20, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 15, unit: 'g' },
      { ingredientId: 'garlic', amount: 15, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'light_soy', amount: 15, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'sugar', amount: 3, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 30, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '茄子切粗条加少许盐拌匀腌5分钟挤干水分',
      '小米椒切圈，姜蒜切末，葱切葱花',
      '锅烧热多放油，茄条入锅煎至塌软盛出控油',
      '锅留底油下肉末炒散变色',
      '加豆瓣酱、姜蒜末和小米椒小火炒出红油',
      '回入茄条大火翻炒，烹料酒和生抽',
      '加少许糖和盐调味，撒葱花翻匀出锅',
    ],
  },

  // 87. 麻婆蘑菇
  sichuan_mapo_mushroom: {
    ingredients: [
      { ingredientId: 'mushroom', amount: 300, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 80, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 20, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 4, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 5, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'light_soy', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '蘑菇洗净切大块，沸水焯30秒去土腥味捞出沥干',
      '花椒小火干锅炒香碾粉，姜蒜切末，葱切葱花',
      '锅烧热下油，下肉末炒散变色出油',
      '加豆瓣酱和辣椒面小火炒出红油',
      '加姜蒜末爆香，倒入蘑菇大火翻炒1分钟',
      '加200ml热水煮开，加生抽调味焖煮3分钟',
      '淋水淀粉勾芡，撒花椒粉和葱花轻晃锅出锅',
    ],
  },

  // 92. 湘味辣椒炒蛋
  hunan_spicy_egg_pepper: {
    ingredients: [
      { ingredientId: 'egg', amount: 4, unit: 'piece' },
      { ingredientId: 'capsicum', amount: 100, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 20, unit: 'g' },
      { ingredientId: 'garlic', amount: 8, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'light_soy', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
    ],
    steps: [
      '鸡蛋打散加少许盐搅匀，青椒切圈、小米椒切圈，蒜切末',
      '锅烧热多放油，倒入蛋液大火滑炒至凝固成大块盛出',
      '锅留底油下蒜末爆香',
      '加青椒和小米椒大火翻炒至虎皮状',
      '加少许豆瓣酱炒出红油提味',
      '回入鸡蛋块翻炒均匀，淋生抽撒葱花出锅',
    ],
  },

  // 98. 手撕包菜
  stir_fried_cabbage: {
    ingredients: [
      { ingredientId: 'cabbage', amount: 400, unit: 'g' },
      { ingredientId: 'bacon', amount: 60, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 15, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 2, unit: 'g' },
      { ingredientId: 'vinegar', amount: 15, unit: 'ml' },
      { ingredientId: 'light_soy', amount: 10, unit: 'ml' },
      { ingredientId: 'sugar', amount: 3, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
    ],
    steps: [
      '包菜手撕成大片不要切，洗净沥干水分（手撕断面更易入味）',
      '腊肉切薄片，干辣椒剪段，蒜切片',
      '锅烧热下少许油，腊肉片煸至出油微焦',
      '小火下花椒和干辣椒段炒香',
      '转大火加蒜片爆香',
      '倒入包菜大火快炒1分钟，沿锅边烹入醋激出香气',
      '加生抽、糖和盐快速翻匀，包菜断生即出锅',
    ],
  },

  // 103. 鱼香肉丝 - MUST use pork_loin not pork_belly
  sichuan_shredded_pork: {
    ingredients: [
      { ingredientId: 'pork_loin', amount: 250, unit: 'g' },
      { ingredientId: 'wood_ear', amount: 15, unit: 'g' },
      { ingredientId: 'carrot', amount: 80, unit: 'g' },
      { ingredientId: 'capsicum', amount: 60, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 20, unit: 'g' },
      { ingredientId: 'vinegar', amount: 18, unit: 'ml' },
      { ingredientId: 'sugar', amount: 15, unit: 'g' },
      { ingredientId: 'light_soy', amount: 12, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 12, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'ginger', amount: 8, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 30, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '猪里脊逆纹切0.3cm细丝，加料酒、生抽5ml、淀粉5g和蛋清抓匀腌15分钟',
      '木耳冷水泡发后切丝，胡萝卜和青椒切与肉丝同等粗细',
      '调鱼香汁：醋18ml、糖15g、生抽7ml、淀粉7g与50ml清水搅匀备用',
      '姜蒜切末，葱白切马耳段',
      '锅烧热下20ml油，肉丝大火快速滑散至变白盛出',
      '锅留底油下豆瓣酱小火炒出红油，加姜蒜末和葱白爆香',
      '倒入木耳、胡萝卜和青椒丝大火翻炒30秒',
      '回入肉丝，沿锅边烹入鱼香汁',
      '大火颠炒至汁水浓稠包裹肉丝，亮油出锅',
    ],
  },

  // 110. 擂辣椒拍黄瓜
  hunan_xiaochao_huanggua: {
    ingredients: [
      { ingredientId: 'cucumber', amount: 300, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 50, unit: 'g' },
      { ingredientId: 'garlic', amount: 15, unit: 'g' },
      { ingredientId: 'light_soy', amount: 15, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 15, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 10, unit: 'ml' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
    ],
    steps: [
      '青辣椒洗净擦干，平底锅不放油小火慢慢煸至两面虎皮起泡，盛出',
      '将擂辣椒和蒜瓣放入捣钵中捣碎成粗辣椒泥（即"擂"的精髓）',
      '黄瓜洗净用刀面拍裂切3cm段，加少许盐腌5分钟挤干水分',
      '将拍好的黄瓜与擂好的辣椒蒜泥混合',
      '加生抽、醋、糖、盐和麻油拌匀',
      '冷藏10分钟入味后食用，焦香辣爽开胃',
    ],
  },

  // 112. 香干炒肉
  homestyle_xianggan_chao_rou: {
    ingredients: [
      { ingredientId: 'pork_loin', amount: 200, unit: 'g' },
      { ingredientId: 'dried_tofu', amount: 200, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 15, unit: 'g' },
      { ingredientId: 'capsicum', amount: 50, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 10, unit: 'g' },
      { ingredientId: 'light_soy', amount: 15, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '猪里脊逆纹切薄片，加料酒、生抽和淀粉抓匀腌10分钟',
      '香干切菱形片，青椒和小米椒切丝，姜蒜切末',
      '锅烧热下油，肉片大火快速滑炒至变色盛出',
      '锅留底油下蒜末和小米椒爆香',
      '加豆瓣酱小火炒出红油',
      '倒入香干片煸炒2分钟至边缘微焦吸味',
      '回入肉片和青椒大火翻炒30秒',
      '加生抽和盐调味翻匀出锅',
    ],
  },

  // ===== Other dishes that need fixing =====

  // 120. 担担面 - need sichuan_pepper, expand
  sichuan_dandan_mian: {
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 120, unit: 'g' },
      { ingredientId: 'bok_choy', amount: 80, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 10, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 8, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 3, unit: 'g' },
      { ingredientId: 'light_soy', amount: 20, unit: 'ml' },
      { ingredientId: 'dark_soy', amount: 5, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 10, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 8, unit: 'ml' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '锅烧热下15ml油，下肉末中火炒至酥香干爽，加少许生抽和料酒上色（即"脆臊"）盛出',
      '花椒粒小火干锅炒香碾粉，蒜切末，葱切葱花',
      '碗中调料：生抽20ml、老抽5ml、醋10ml、糖5g、麻油、蒜末、辣椒面、花椒粉混合',
      '锅烧热10ml油至冒烟，浇在辣椒面碗中激出红油',
      '另起锅煮面，至面心熟透捞出沥干',
      '青菜焯水沥干',
      '面条放入调料碗中，加2勺面汤稀释酱料',
      '上面铺脆肉臊和青菜，撒葱花，吃前拌匀',
    ],
  },

  // 124. 麻辣拌面 - expand
  staple_spicy_noodle: {
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 10, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 3, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 18, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 12, unit: 'ml' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 8, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 30, unit: 'ml' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '花椒粒小火干锅炒香碾成花椒粉',
      '碗中放辣椒面、花椒粉、蒜末',
      '锅烧30ml油至冒烟，趁热浇在辣椒面上激出红油，搅拌均匀',
      '加生抽、醋、糖、盐和麻油调匀成麻辣酱汁',
      '锅中烧水煮面至筋道，捞入碗中',
      '将面与麻辣酱汁拌匀，撒葱花即可食用',
    ],
  },

  // 125. 麻婆豆腐盖饭 - expand
  staple_mapo_tofu_rice: {
    ingredients: [
      { ingredientId: 'rice', amount: 300, unit: 'g' },
      { ingredientId: 'tofu', amount: 300, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 100, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 20, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 4, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 5, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'light_soy', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '米饭蒸熟备用，豆腐切2cm丁淡盐水浸泡5分钟去豆腥',
      '花椒小火炒香碾粉，姜蒜切末，葱切葱花',
      '锅烧热下油，肉末炒散变色出油',
      '加豆瓣酱和辣椒面小火炒出红油，下姜蒜末爆香',
      '倒入200ml热水煮开，加生抽，轻轻滑入豆腐丁',
      '中火烧3分钟入味，淋水淀粉分两次勾芡',
      '撒花椒粉和葱花，浇在米饭上即成',
    ],
  },

  // 126. 鱼香茄子盖饭 - expand
  staple_eggplant_rice: {
    ingredients: [
      { ingredientId: 'rice', amount: 300, unit: 'g' },
      { ingredientId: 'eggplant', amount: 300, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 80, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 18, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 12, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 15, unit: 'ml' },
      { ingredientId: 'sugar', amount: 15, unit: 'g' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'starch', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 30, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '米饭蒸熟备用，茄子切粗条加少许盐腌5分钟挤干水分',
      '调鱼香汁：醋15ml、糖15g、生抽12ml、料酒10ml、淀粉8g与50ml水搅匀',
      '姜蒜切末，葱切葱花',
      '锅烧热多放油，茄条煎至塌软盛出控油',
      '锅留底油下肉末炒散变色，加豆瓣酱炒出红油',
      '加姜蒜末爆香，回入茄条翻炒',
      '沿锅边烹入鱼香汁，大火翻炒收汁',
      '撒葱花，浇在米饭上即成',
    ],
  },

  // 127. 干拌馄饨 - expand
  staple_pork_wonton_dry: {
    ingredients: [
      { ingredientId: 'wonton_wrapper', amount: 150, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 150, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 6, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 2, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 18, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 10, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 8, unit: 'ml' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_wine', amount: 5, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '肉末加葱姜末、料酒、生抽5ml、盐和少许水朝一个方向搅打上劲',
      '取馄饨皮包入肉馅捏紧成元宝形',
      '碗中放蒜末、辣椒面、花椒粉',
      '热油烧至冒烟浇在辣椒上激出红油，加生抽、醋、糖、麻油调匀',
      '锅中烧水至沸，下馄饨煮5分钟至浮起且皮透',
      '捞出馄饨入调料碗，撒葱花拌匀食用',
    ],
  },

  // 128. 麻辣牛肉面 - expand
  cn_beef_noodle_soup_spicy: {
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'beef_shank', amount: 250, unit: 'g' },
      { ingredientId: 'bok_choy', amount: 80, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 25, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 4, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 6, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 20, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 15, unit: 'ml' },
      { ingredientId: 'ginger', amount: 15, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'star_anise', amount: 2, unit: 'piece' },
      { ingredientId: 'bay_leaf', amount: 2, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'cilantro', amount: 5, unit: 'g' },
      { ingredientId: 'rock_sugar', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '牛腱子肉切3cm块，冷水下锅焯水去血沫捞出洗净',
      '锅烧热下油，下姜片、八角和香叶炒香',
      '加豆瓣酱和辣椒面小火炒出红油',
      '加冰糖炒至融化，倒入牛肉块翻炒上色',
      '烹入料酒和生抽，加1.5L热水没过牛肉',
      '加花椒和蒜瓣，大火烧开转小火慢炖90分钟至牛肉酥烂',
      '另起锅煮面至筋道，焯青菜铺碗底',
      '面入碗，铺牛肉块，浇红汤，撒葱花和香菜即成',
    ],
  },

  // 129. 辣肉丝面 - expand
  staple_spicy_pork_noodle: {
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'pork_loin', amount: 150, unit: 'g' },
      { ingredientId: 'bok_choy', amount: 80, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 18, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 5, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 8, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '猪里脊逆纹切丝，加料酒、生抽5ml和淀粉抓匀腌10分钟',
      '蒜切末，姜切末，葱白与葱绿分开切',
      '锅烧热下油，肉丝大火快速滑散至变色盛出',
      '锅留底油加豆瓣酱、辣椒面和姜蒜末小火炒出红油',
      '回入肉丝翻炒，加生抽和少许糖调味',
      '另起锅煮面至筋道，青菜焯水沥干铺碗底',
      '面条入碗，浇上辣肉丝臊子，淋麻油撒葱花',
    ],
  },

  // 130. 红油牛肉面 - expand and use beef_shank
  staple_spicy_beef_noodle: {
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 200, unit: 'g' },
      { ingredientId: 'beef_shank', amount: 200, unit: 'g' },
      { ingredientId: 'bok_choy', amount: 80, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 10, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 4, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 18, unit: 'ml' },
      { ingredientId: 'vinegar', amount: 8, unit: 'ml' },
      { ingredientId: 'ginger', amount: 12, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'star_anise', amount: 1, unit: 'piece' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'cilantro', amount: 5, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 30, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '牛腱子焯水后冷水下锅，加姜片、八角和料酒大火烧开转小火炖60分钟至软',
      '捞出牛肉晾凉切薄片，原汤过滤备用',
      '花椒小火干锅炒香碾粉',
      '碗中放辣椒面、花椒粉、蒜末',
      '热30ml油至冒烟浇在辣椒上激出红油',
      '加生抽、醋、麻油和2勺牛肉汤调匀成红油底',
      '另锅煮面至筋道，青菜焯水',
      '面条入碗，铺牛肉片和青菜，浇牛肉汤，撒葱花和香菜',
    ],
  },

  // ===== Additional fixes for invalid IDs =====

  // 115. 酸辣粉 - dried_noodles_rice → vermicelli (acid-spicy noodles uses sweet potato vermicelli)
  sichuan_suan_la_fen: {
    ingredients: [
      { ingredientId: 'vermicelli', amount: 150, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 60, unit: 'g' },
      { ingredientId: 'dried_shrimp', amount: 5, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 12, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 8, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 3, unit: 'g' },
      { ingredientId: 'vinegar', amount: 25, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 18, unit: 'ml' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'cilantro', amount: 5, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '红薯粉条用温水浸泡30分钟至软，沥干备用',
      '锅烧热下少许油，肉末炒散变色加少许生抽炒成肉臊盛出',
      '碗中放蒜末、辣椒面、花椒粉、虾米',
      '热25ml油至冒烟浇在辣椒上激出红油',
      '加陈醋25ml（酸辣粉的灵魂）、生抽、糖、盐和麻油调匀',
      '锅中烧开水，下粉条煮3分钟至透明软糯',
      '捞起粉条入调料碗，加2勺面汤拌开',
      '上铺肉臊，撒葱花和香菜即成酸辣开胃',
    ],
  },

  // ===== High-value Hunan/Sichuan dishes that need refinement =====

  // 9. 辣子鸡丁 - keep as is (already excellent)
  // 12. 回锅肉 - keep as is
  // 22. 鱼香虾仁 - replace shrimp ingredient with proper rice vinegar; already good

  // 19. 川味水煮虾 - good
  // 28. 湘西腊肉炒蒜薹 - leek used as substitute for garlic shoots; OK

  // 29. 湘味辣椒蒸肉 - good already

  // 30. 湖南辣炒鸡胗 - uses chicken_thigh as gizzard substitute, OK

  // 35. 牛肉末烧豆腐 - good

  // 47. 肉末烧豆腐 - expand
  'sichuan-braised-tofu-with-mince': {
    ingredients: [
      { ingredientId: 'tofu', amount: 350, unit: 'g' },
      { ingredientId: 'pork_mince', amount: 100, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 20, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 3, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 10, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '嫩豆腐切2cm方块，淡盐水浸泡5分钟',
      '姜蒜切末，葱切葱花',
      '锅烧热下油，肉末炒散变色出油',
      '加豆瓣酱小火炒出红油，加姜蒜末爆香',
      '加200ml热水煮开，调入生抽，轻放豆腐块',
      '中火烧5分钟入味，水淀粉勾芡',
      '撒花椒粉和葱花轻晃锅出锅',
    ],
  },

  // 50. 川味蒸排骨 - powdered rice (粉蒸) needs rice flour
  'sichuan-steamed-pork-with-rice': {
    ingredients: [
      { ingredientId: 'pork_ribs', amount: 400, unit: 'g' },
      { ingredientId: 'sweet_potato', amount: 200, unit: 'g' },
      { ingredientId: 'rice_flour', amount: 60, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 20, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 15, unit: 'ml' },
      { ingredientId: 'sichuan_pepper', amount: 3, unit: 'g' },
      { ingredientId: 'ginger', amount: 10, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '排骨剁3cm段，冷水浸泡30分钟去血水洗净沥干',
      '加豆瓣酱、生抽、料酒、姜蒜末、糖、盐和花椒粉抓匀腌30分钟',
      '腌好的排骨与蒸肉米粉拌匀让每块裹满米粉',
      '红薯去皮切块铺在碗底',
      '裹粉排骨整齐码放在红薯上',
      '蒸锅大火上汽后入锅，转中火蒸60分钟至排骨酥软',
      '出锅倒扣盘中，撒葱花即可',
    ],
  },

  // 53. 辣椒炒肉 - good but expand a bit
  'hunan-stir-fried-smoked-pork': {
    ingredients: [
      { ingredientId: 'pork_belly', amount: 250, unit: 'g' },
      { ingredientId: 'capsicum', amount: 200, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 30, unit: 'g' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 8, unit: 'g' },
      { ingredientId: 'light_soy', amount: 15, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'sugar', amount: 3, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: [
      '五花肉切2mm薄片，肥瘦分开，肥肉部分单独切出',
      '螺丝椒和小米椒斜切成段，蒜拍碎',
      '锅烧热不放油直接下肥肉片煸至出油呈金黄色',
      '加瘦肉片继续煸至边缘卷曲',
      '加豆瓣酱和姜蒜爆香',
      '倒入辣椒段大火翻炒至虎皮起皱',
      '烹料酒加生抽和少许糖，颠匀出锅',
    ],
  },

  // 54. 湘味蒸鸡 - good

  // 100. 粉蒸肉 - need rice_flour not rice
  steamed_pork_rice_flour: {
    ingredients: [
      { ingredientId: 'pork_belly', amount: 400, unit: 'g' },
      { ingredientId: 'sweet_potato', amount: 250, unit: 'g' },
      { ingredientId: 'rice_flour', amount: 80, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 20, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 20, unit: 'ml' },
      { ingredientId: 'cooking_wine', amount: 15, unit: 'ml' },
      { ingredientId: 'ginger', amount: 12, unit: 'g' },
      { ingredientId: 'garlic', amount: 8, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'five_spice', amount: 3, unit: 'g' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '五花肉切3mm厚大片，加豆瓣酱、生抽、料酒、姜末、五香粉和少许糖盐抓匀腌30分钟',
      '红薯去皮切大块铺在蒸碗底部',
      '腌好的肉片撒入蒸肉米粉拌匀，让每片肉裹满米粉（米粉吸收肉汁后蒸出来软糯香）',
      '将裹粉肉片皮朝下整齐码在红薯上',
      '蒸锅大火上汽后入锅，中火蒸60-90分钟至肉酥烂米粉软糯',
      '出锅倒扣盘中（肉皮朝上红薯在底），撒葱花即成',
    ],
  },

  // 101. 辣子鸡 - good already

  // 113. 冒菜 - good but expand
  sichuan_maocai: {
    ingredients: [
      { ingredientId: 'pork_belly', amount: 100, unit: 'g' },
      { ingredientId: 'tofu', amount: 100, unit: 'g' },
      { ingredientId: 'potato', amount: 100, unit: 'g' },
      { ingredientId: 'bok_choy', amount: 100, unit: 'g' },
      { ingredientId: 'mushroom', amount: 80, unit: 'g' },
      { ingredientId: 'noodles_dried', amount: 50, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 25, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 4, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 8, unit: 'g' },
      { ingredientId: 'star_anise', amount: 1, unit: 'piece' },
      { ingredientId: 'garlic', amount: 12, unit: 'g' },
      { ingredientId: 'ginger', amount: 10, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '所有蔬菜洗净切好，土豆切片，豆腐切块，蘑菇撕开',
      '五花肉切薄片，姜蒜切末',
      '锅烧热下油，五花肉煸出油',
      '加豆瓣酱、辣椒面、花椒和八角小火炒出麻辣红油',
      '加姜蒜末爆香，倒入1L热水煮开成麻辣汤底',
      '调入生抽和盐，先放耐煮的土豆和粉条煮5分钟',
      '依次下豆腐和蘑菇煮3分钟',
      '最后下青菜烫熟即捞出装碗，浇麻辣汤撒葱花淋麻油',
    ],
  },

  // 114. 酸汤肥牛 - tomato-based sour soup; needs more authentic seasoning
  homestyle_suantang_fei_niu: {
    ingredients: [
      { ingredientId: 'beef_sirloin', amount: 300, unit: 'g' },
      { ingredientId: 'tomato', amount: 250, unit: 'g' },
      { ingredientId: 'enoki_mushroom', amount: 100, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 30, unit: 'g' },
      { ingredientId: 'garlic', amount: 15, unit: 'g' },
      { ingredientId: 'ginger', amount: 8, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
      { ingredientId: 'cilantro', amount: 5, unit: 'g' },
      { ingredientId: 'vinegar', amount: 25, unit: 'ml' },
      { ingredientId: 'white_pepper', amount: 2, unit: 'g' },
      { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
      { ingredientId: 'starch', amount: 8, unit: 'g' },
      { ingredientId: 'egg', amount: 1, unit: 'piece' },
      { ingredientId: 'cooking_oil', amount: 25, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '肥牛切薄片，加蛋清、淀粉、料酒和白胡椒抓匀腌10分钟',
      '番茄去皮切块，黄灯笼椒切末（无则用小米椒），姜蒜切末',
      '锅烧热下油，下姜蒜末和番茄炒至出红汁起沙',
      '加黄灯笼椒末炒香（这是酸汤的灵魂）',
      '加600ml热水煮开成黄红色酸汤',
      '加白醋、盐和白胡椒调味',
      '先下金针菇煮1分钟铺碗底',
      '将肥牛片一片片滑入沸汤中烫10秒',
      '连汤倒入碗中，撒香菜、葱花和小米椒圈即成',
    ],
  },

  // 116. 麻辣香锅 - add sichuan_pepper
  homestyle_mala_xiangguo: {
    ingredients: [
      { ingredientId: 'shrimp', amount: 120, unit: 'g' },
      { ingredientId: 'chicken_wing', amount: 150, unit: 'g' },
      { ingredientId: 'potato', amount: 120, unit: 'g' },
      { ingredientId: 'mushroom', amount: 100, unit: 'g' },
      { ingredientId: 'lotus_root', amount: 100, unit: 'g' },
      { ingredientId: 'broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'doubanjiang', amount: 25, unit: 'g' },
      { ingredientId: 'sichuan_pepper', amount: 5, unit: 'g' },
      { ingredientId: 'chili_flakes', amount: 10, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 15, unit: 'g' },
      { ingredientId: 'star_anise', amount: 2, unit: 'piece' },
      { ingredientId: 'cumin', amount: 3, unit: 'g' },
      { ingredientId: 'garlic', amount: 20, unit: 'g' },
      { ingredientId: 'ginger', amount: 12, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 50, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
    ],
    steps: [
      '所有食材洗净切好；土豆和藕切片，鸡翅剁段，蘑菇撕开',
      '土豆、藕、西兰花分别焯水至半熟捞出沥干',
      '锅烧热下宽油，鸡翅段煎至两面金黄盛出',
      '虾下锅煎至变红盛出',
      '锅留底油，下花椒、八角、辣椒段和姜蒜末爆香',
      '加豆瓣酱和辣椒面小火炒出麻辣红油',
      '依次倒入鸡翅、土豆、藕、蘑菇大火翻炒2分钟',
      '加入西兰花和虾翻炒，撒孜然粉和糖盐调味',
      '淋少许麻油撒葱花出锅，麻辣干香有锅气',
    ],
  },

  // 119. 剁椒蒸鱼 - needs cooking instructions for traditional 剁椒
  hunan_duojiao_zhengyu: {
    ingredients: [
      { ingredientId: 'snapper', amount: 500, unit: 'g' },
      { ingredientId: 'chili_pepper', amount: 80, unit: 'g' },
      { ingredientId: 'garlic', amount: 20, unit: 'g' },
      { ingredientId: 'ginger', amount: 15, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 20, unit: 'g' },
      { ingredientId: 'cilantro', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_wine', amount: 15, unit: 'ml' },
      { ingredientId: 'light_soy', amount: 15, unit: 'ml' },
      { ingredientId: 'cooking_oil', amount: 30, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
      { ingredientId: 'sugar', amount: 3, unit: 'g' },
    ],
    steps: [
      '鱼宰杀洗净，背部从两面斜切3-4刀利于入味，加料酒和盐抹匀腌10分钟',
      '小米椒和红辣椒剁碎成小粒，加蒜末、姜末、少许盐和糖拌匀做剁椒',
      '蒸盘铺姜片葱段，将鱼摆在上面，鱼身两侧塞姜片去腥',
      '将剁椒均匀厚厚铺满鱼身（这是剁椒鱼的灵魂）',
      '蒸锅大火上汽后放入鱼盘，大火蒸10-12分钟（每500g蒸10分钟）',
      '出锅倒掉盘中蒸出的水，重新淋少许蒸鱼豉油（生抽加少水）',
      '撒葱花和香菜，烧热30ml油至冒烟趁热浇在剁椒上激出辣香',
    ],
  },

  // 117. 鸡丝凉面 - authentic version uses sesame paste, but we can use sesame oil
  // 118. 湘菜小炒肉 - keep
};

// ===== Generic fixes for ALL dishes =====

const validIngredients = new Set([
  'chicken_breast', 'chicken_thigh', 'chicken_wing', 'chicken_whole', 'pork_belly', 'pork_mince',
  'pork_loin', 'pork_ribs', 'beef_sirloin', 'beef_mince', 'beef_shank', 'lamb_leg', 'salmon_fillet',
  'shrimp', 'squid', 'fish_fillet', 'snapper', 'cod', 'mussel', 'scallop', 'egg', 'salted_egg',
  'tofu', 'dried_tofu', 'tofu_puff', 'dried_tofu_skin', 'edamame', 'bacon', 'sausage', 'duck_leg',
  'rice', 'glutinous_rice', 'noodles_dried', 'vermicelli', 'rice_noodles', 'rice_flour',
  'wheat_starch', 'flour', 'oats', 'cornmeal', 'millet', 'quinoa', 'wonton_wrapper', 'potato',
  'broccoli', 'bok_choy', 'chinese_cabbage', 'tomato', 'capsicum', 'carrot', 'onion', 'garlic',
  'ginger', 'spring_onion', 'mushroom', 'dried_mushroom', 'enoki_mushroom', 'portobello',
  'shiitake_fresh', 'spinach', 'eggplant', 'cucumber', 'zucchini', 'sweet_potato', 'corn',
  'green_bean', 'celery', 'bean_sprouts', 'white_radish', 'lettuce', 'chili_pepper', 'pumpkin',
  'cabbage', 'leek', 'snow_pea', 'asparagus', 'lotus_root', 'bitter_melon', 'cauliflower',
  'winter_melon', 'yam', 'taro', 'water_chestnut', 'kiwi', 'pear', 'grape', 'watermelon', 'mango',
  'peach', 'plum', 'cherry', 'mandarin', 'dragon_fruit', 'cantaloupe', 'apple', 'banana', 'orange',
  'lemon', 'soy_sauce', 'light_soy', 'dark_soy', 'fish_sauce', 'cooking_oil', 'sesame_oil',
  'olive_oil', 'oyster_sauce', 'sugar', 'rock_sugar', 'vinegar', 'white_vinegar', 'black_vinegar',
  'doubanjiang', 'starch', 'cooking_wine', 'salt', 'white_pepper', 'black_pepper', 'five_spice',
  'chili_flakes', 'tomato_paste', 'bean_paste', 'sichuan_pepper', 'star_anise', 'cumin',
  'bay_leaf', 'cilantro', 'mint', 'basil', 'thyme', 'lemongrass', 'mayonnaise', 'milk', 'cheese',
  'parmesan', 'butter', 'cream', 'yogurt', 'chicken_stock', 'goji_berry', 'red_date', 'wood_ear',
  'dried_shrimp',
]);

// ID replacements for invalid ingredients
const ID_REPLACEMENTS = {
  sea_bass: 'snapper',
  dried_chili: 'chili_pepper',
  dried_noodles_rice: 'vermicelli',
};

function applyGenericFixes(dish) {
  // Replace invalid IDs
  dish.ingredients = dish.ingredients.map((ing) => {
    if (ID_REPLACEMENTS[ing.ingredientId]) {
      return { ...ing, ingredientId: ID_REPLACEMENTS[ing.ingredientId] };
    }
    return ing;
  });
  return dish;
}

// Apply fixes to data
const fixed = data.map((dish) => {
  // Always apply generic fixes (invalid IDs)
  let result = applyGenericFixes({ ...dish, ingredients: [...dish.ingredients] });

  // Apply per-dish overrides if present
  if (DISH_OVERRIDES[dish.id]) {
    result = {
      ...result,
      ingredients: DISH_OVERRIDES[dish.id].ingredients,
      steps: DISH_OVERRIDES[dish.id].steps,
    };
  }

  return result;
});

// Validate all ingredients in output
let invalidCount = 0;
fixed.forEach((dish) => {
  dish.ingredients.forEach((ing) => {
    if (!validIngredients.has(ing.ingredientId)) {
      console.error(`INVALID: ${dish.id} -> ${ing.ingredientId}`);
      invalidCount++;
    }
  });
  if (dish.steps.length < 5) {
    console.warn(`SHORT STEPS (${dish.steps.length}): ${dish.id} - ${dish.nameZh}`);
  }
});

console.log(`Total dishes: ${fixed.length}`);
console.log(`Overridden: ${Object.keys(DISH_OVERRIDES).length}`);
console.log(`Invalid IDs remaining: ${invalidCount}`);

fs.writeFileSync(OUTPUT, JSON.stringify(fixed, null, 2));
console.log(`Written: ${OUTPUT}`);
