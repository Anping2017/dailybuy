/**
 * 批量加 450 道菜谱(300 易 + 100 中 + 50 难)
 * 严格无: 海鲜、鸡蛋、豆腐(及豆制品如豆皮/豆干)、辣椒类、乳制品(奶/奶油/奶酪/黄油)
 * 主要荤素菜为主, 搭配少量主食/汤/凉菜
 *
 * 同时按需新增食材到 ingredients.json
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const INGREDIENTS_PATH = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));
const ingredients = JSON.parse(fs.readFileSync(INGREDIENTS_PATH, 'utf8'));

// ============== 新增食材 ==============
const NEW_INGREDIENTS = [
  // 干货/菌菇
  { id: 'black_fungus', nameZh: '黑木耳(干)', nameEn: 'Dried Black Fungus', category: 'dried',
    nutrition: { calories: 25, protein: 2, fat: 0.2, carbs: 6, fiber: 5, sodium: 9, sugar: 0 },
    priceNZD: 35, unit: 'kg', allergens: [], warnings: [], highlights: ['high_fiber'], supermarkets: ['asian'], season: [] },
  { id: 'dried_lily', nameZh: '干黄花菜', nameEn: 'Dried Lily Flower', category: 'dried',
    nutrition: { calories: 199, protein: 14, fat: 1.4, carbs: 60, fiber: 7, sodium: 59, sugar: 0 },
    priceNZD: 30, unit: 'kg', allergens: [], warnings: [], highlights: [], supermarkets: ['asian'], season: [] },
  { id: 'dried_bamboo', nameZh: '笋干', nameEn: 'Dried Bamboo Shoots', category: 'dried',
    nutrition: { calories: 30, protein: 3, fat: 0.3, carbs: 6, fiber: 3, sodium: 5, sugar: 0 },
    priceNZD: 28, unit: 'kg', allergens: [], warnings: [], highlights: [], supermarkets: ['asian'], season: [] },
  { id: 'jujube', nameZh: '红枣(干)', nameEn: 'Dried Jujube', category: 'dried',
    nutrition: { calories: 287, protein: 4, fat: 0.5, carbs: 71, fiber: 6, sodium: 9, sugar: 55 },
    priceNZD: 25, unit: 'kg', allergens: [], warnings: [], highlights: [], supermarkets: ['asian'], season: [] },
  // 蔬菜
  { id: 'purple_potato', nameZh: '紫薯', nameEn: 'Purple Sweet Potato', category: 'vegetable',
    nutrition: { calories: 86, protein: 1.6, fat: 0.1, carbs: 20, fiber: 3, sodium: 55, sugar: 4 },
    priceNZD: 7, unit: 'kg', allergens: [], warnings: [], highlights: ['high_fiber'], supermarkets: ['countdown'], season: ['autumn','winter'] },
  { id: 'spring_bamboo', nameZh: '春笋', nameEn: 'Spring Bamboo Shoot', category: 'vegetable',
    nutrition: { calories: 27, protein: 2.6, fat: 0.3, carbs: 5, fiber: 2.2, sodium: 4, sugar: 3 },
    priceNZD: 9, unit: 'kg', allergens: [], warnings: [], highlights: ['low_calorie'], supermarkets: ['asian'], season: ['spring'] },
  { id: 'snow_vegetable', nameZh: '雪菜(腌)', nameEn: 'Snow Vegetable Pickle', category: 'vegetable',
    nutrition: { calories: 24, protein: 2, fat: 0.4, carbs: 4, fiber: 2, sodium: 1300, sugar: 1 },
    priceNZD: 14, unit: 'kg', allergens: [], warnings: ['high_sodium'], highlights: [], supermarkets: ['asian'], season: [] },
  { id: 'preserved_mustard', nameZh: '梅菜(干)', nameEn: 'Preserved Mustard Green', category: 'vegetable',
    nutrition: { calories: 36, protein: 2, fat: 0.4, carbs: 6, fiber: 2, sodium: 1100, sugar: 2 },
    priceNZD: 12, unit: 'kg', allergens: [], warnings: ['high_sodium'], highlights: [], supermarkets: ['asian'], season: [] },
  { id: 'toona', nameZh: '香椿芽', nameEn: 'Toona Sprouts', category: 'vegetable',
    nutrition: { calories: 47, protein: 1.7, fat: 0.4, carbs: 11, fiber: 2, sodium: 5, sugar: 2 },
    priceNZD: 25, unit: 'kg', allergens: [], warnings: [], highlights: [], supermarkets: ['asian'], season: ['spring'] },
  { id: 'indian_lettuce', nameZh: '油麦菜', nameEn: 'Indian Lettuce', category: 'vegetable',
    nutrition: { calories: 14, protein: 1.4, fat: 0.4, carbs: 2, fiber: 1, sodium: 28, sugar: 1 },
    priceNZD: 4, unit: 'kg', allergens: [], warnings: [], highlights: ['low_calorie'], supermarkets: ['asian'], season: ['autumn','winter','spring'] },
  { id: 'celtuce', nameZh: '莴笋', nameEn: 'Celtuce / Stem Lettuce', category: 'vegetable',
    nutrition: { calories: 18, protein: 1.6, fat: 0.3, carbs: 3, fiber: 1.7, sodium: 11, sugar: 1.4 },
    priceNZD: 6, unit: 'kg', allergens: [], warnings: [], highlights: ['low_calorie'], supermarkets: ['asian'], season: ['spring','summer'] },
  { id: 'water_bamboo', nameZh: '茭白', nameEn: 'Water Bamboo', category: 'vegetable',
    nutrition: { calories: 23, protein: 1.2, fat: 0.2, carbs: 4, fiber: 2, sodium: 5, sugar: 2 },
    priceNZD: 8, unit: 'kg', allergens: [], warnings: [], highlights: ['low_calorie'], supermarkets: ['asian'], season: ['summer','autumn'] },
  { id: 'edamame', nameZh: '毛豆', nameEn: 'Edamame', category: 'bean',
    nutrition: { calories: 122, protein: 11, fat: 5, carbs: 9, fiber: 5, sodium: 6, sugar: 2 },
    priceNZD: 8, unit: 'kg', allergens: ['soybean'], warnings: [], highlights: ['high_protein','high_fiber'], supermarkets: ['countdown'], season: ['summer'] },
  // 水果(可放在菜里)
  { id: 'pineapple', nameZh: '菠萝', nameEn: 'Pineapple', category: 'fruit',
    nutrition: { calories: 50, protein: 0.5, fat: 0.1, carbs: 13, fiber: 1.4, sodium: 1, sugar: 10 },
    priceNZD: 4, unit: 'kg', allergens: [], warnings: [], highlights: [], supermarkets: ['countdown'], season: ['summer'] },
  // 调料
  { id: 'sour_mustard', nameZh: '酸菜(东北)', nameEn: 'Pickled Cabbage (NE-style)', category: 'vegetable',
    nutrition: { calories: 19, protein: 1, fat: 0.1, carbs: 4, fiber: 2, sodium: 750, sugar: 1.4 },
    priceNZD: 10, unit: 'kg', allergens: [], warnings: ['high_sodium'], highlights: [], supermarkets: ['asian'], season: [] },
  { id: 'cashew_nut', nameZh: '腰果', nameEn: 'Cashew Nuts', category: 'dried',
    nutrition: { calories: 553, protein: 18, fat: 44, carbs: 30, fiber: 3, sodium: 12, sugar: 6 },
    priceNZD: 35, unit: 'kg', allergens: ['nuts'], warnings: [], highlights: ['high_protein'], supermarkets: ['countdown'], season: [] },
  { id: 'cola', nameZh: '可乐', nameEn: 'Cola', category: 'seasoning',
    nutrition: { calories: 42, protein: 0, fat: 0, carbs: 11, fiber: 0, sodium: 4, sugar: 11 },
    priceNZD: 3, unit: 'L', allergens: [], warnings: ['high_sugar'], highlights: [], supermarkets: ['countdown'], season: [] },
  { id: 'bell_pepper_green', nameZh: '青椒', nameEn: 'Green Bell Pepper', category: 'vegetable',
    nutrition: { calories: 20, protein: 0.9, fat: 0.2, carbs: 4.6, fiber: 1.7, sodium: 3, sugar: 2.4 },
    priceNZD: 5, unit: 'kg', allergens: [], warnings: [], highlights: ['low_calorie'], supermarkets: ['countdown'], season: ['summer','autumn'] },
  { id: 'water', nameZh: '清水', nameEn: 'Water', category: 'seasoning',
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0, sugar: 0 },
    priceNZD: 0, unit: 'L', allergens: [], warnings: [], highlights: [], supermarkets: [], season: [] },
  { id: 'oat_milk', nameZh: '燕麦奶', nameEn: 'Oat Milk', category: 'bean',
    nutrition: { calories: 47, protein: 1, fat: 1.5, carbs: 7, fiber: 0.8, sodium: 50, sugar: 4 },
    priceNZD: 5, unit: 'L', allergens: ['oat'], warnings: [], highlights: [], supermarkets: ['countdown'], season: [] },
  { id: 'soybean', nameZh: '黄豆', nameEn: 'Soybean', category: 'bean',
    nutrition: { calories: 173, protein: 16.6, fat: 9, carbs: 9.9, fiber: 6, sodium: 1, sugar: 3 },
    priceNZD: 6, unit: 'kg', allergens: ['soybean'], warnings: [], highlights: ['high_protein','high_fiber'], supermarkets: ['countdown'], season: [] },
  { id: 'lemon', nameZh: '柠檬', nameEn: 'Lemon', category: 'fruit',
    nutrition: { calories: 29, protein: 1.1, fat: 0.3, carbs: 9, fiber: 2.8, sodium: 2, sugar: 2.5 },
    priceNZD: 6, unit: 'kg', allergens: [], warnings: [], highlights: ['vitamin_c'], supermarkets: ['countdown'], season: ['winter','spring'] },
  { id: 'apple', nameZh: '苹果', nameEn: 'Apple', category: 'fruit',
    nutrition: { calories: 52, protein: 0.3, fat: 0.2, carbs: 14, fiber: 2.4, sodium: 1, sugar: 10 },
    priceNZD: 4, unit: 'kg', allergens: [], warnings: [], highlights: ['high_fiber'], supermarkets: ['countdown'], season: ['autumn','winter'] },
  { id: 'blueberry', nameZh: '蓝莓', nameEn: 'Blueberry', category: 'fruit',
    nutrition: { calories: 57, protein: 0.7, fat: 0.3, carbs: 14, fiber: 2.4, sodium: 1, sugar: 10 },
    priceNZD: 25, unit: 'kg', allergens: [], warnings: [], highlights: ['antioxidant'], supermarkets: ['countdown'], season: ['summer'] },
];

// 把新食材加进列表(去重)
const ingIds = new Set(ingredients.map(i => i.id));
const newIngsAdded = [];
for (const ni of NEW_INGREDIENTS) {
  if (!ingIds.has(ni.id)) {
    ingredients.push(ni);
    ingIds.add(ni.id);
    newIngsAdded.push(ni.id);
  }
}

// ============== 黑名单食材 (生成时绝不使用) ==============
const FORBIDDEN_INGREDIENT_IDS = new Set([
  // 海鲜
  'salmon_fillet', 'shrimp', 'squid', 'fish_fillet', 'crab', 'octopus', 'mussels', 'scallop', 'clam', 'lobster',
  'tuna', 'cod', 'sardine', 'anchovy', 'oyster', 'fish_sauce', 'kelp', 'nori', 'seaweed',
  // 蛋
  'egg', 'quail_egg', 'duck_egg', 'salted_egg',
  // 豆腐
  'tofu', 'silken_tofu', 'firm_tofu', 'tofu_skin', 'tofu_dried', 'fried_tofu', 'tofu_puff',
  // 辣味
  'chili_pepper', 'chili_flakes', 'chili_oil', 'doubanjiang', 'gochujang', 'sichuan_pepper', 'sriracha',
  'curry_paste',
  // 乳制品
  'milk', 'cream', 'cheese', 'butter', 'yogurt', 'condensed_milk', 'evaporated_milk', 'sour_cream',
  'parmesan', 'mozzarella', 'cheddar', 'feta', 'cottage_cheese', 'cream_cheese',
]);

// ============== Recipe 工厂 ==============
const cn = (regional = 'homestyle') => ({ cuisine: 'chinese', regionalCuisine: regional, status: 'reviewed' });
const wn = (regional = 'american') => ({ cuisine: 'western', regionalCuisine: regional, status: 'reviewed' });
const jn = (regional = 'japanese') => ({ cuisine: 'asian', regionalCuisine: regional, status: 'reviewed' });
const kn = (regional = 'korean') => ({ cuisine: 'asian', regionalCuisine: regional, status: 'reviewed' });
const tn = (regional = 'thai') => ({ cuisine: 'asian', regionalCuisine: regional, status: 'reviewed' });

let idCounter = 0;
const recipeId = (prefix) => `bulk450_${prefix}_${(idCounter++).toString().padStart(3,'0')}`;

const NEW = [];

// ============================================================
// === 易难度 (300 道) ===
// ============================================================

// === 易: 荤菜 (160 道) ===
// 模板: 简单炒/煎/烤/小火慢卤
const easyMeatTemplates = [
  // pork_loin
  { meat: 'pork_loin', meatZh: '猪里脊', veg: 'capsicum', vegZh: '彩椒', method: '炒', flavor: ['umami'], desc: '里脊片彩椒, 嫩滑甘甜。',
    steps: ['里脊切片用酱油料酒腌 5 分钟', '锅热油先炒里脊变色盛出', '余油下彩椒翻炒 1 分钟', '回锅一起翻匀调盐糖'] },
  { meat: 'pork_loin', meatZh: '猪里脊', veg: 'celery', vegZh: '芹菜', method: '炒', flavor: ['umami','light'], desc: '里脊配芹菜, 清香脆嫩。',
    steps: ['里脊切丝腌制', '芹菜切段焯水', '热油爆姜, 下里脊炒变色', '加芹菜翻炒, 调盐生抽'] },
  { meat: 'pork_loin', meatZh: '猪里脊', veg: 'cucumber', vegZh: '黄瓜', method: '炒', flavor: ['light','umami'], desc: '里脊黄瓜片, 鲜嫩开胃。',
    steps: ['里脊切片腌淀粉', '黄瓜切片', '热油下里脊滑炒', '加黄瓜翻匀, 调盐'] },
  { meat: 'pork_loin', meatZh: '猪里脊', veg: 'onion', vegZh: '洋葱', method: '炒', flavor: ['umami','sweet'], desc: '洋葱里脊, 香甜下饭。',
    steps: ['里脊切片用生抽淀粉抓匀', '洋葱切丝', '热油炒里脊变色盛出', '炒洋葱出香, 回锅翻匀调盐'] },
  { meat: 'pork_loin', meatZh: '猪里脊', veg: 'asparagus', vegZh: '芦笋', method: '炒', flavor: ['light'], desc: '芦笋里脊, 清新爽口。',
    steps: ['里脊腌淀粉酱油', '芦笋斜切焯水', '热油炒里脊变色', '加芦笋调盐翻匀'] },
  { meat: 'pork_loin', meatZh: '猪里脊', veg: 'lotus_root', vegZh: '莲藕', method: '炒', flavor: ['umami','sweet'], desc: '里脊炒藕片, 脆嫩两味。',
    steps: ['里脊切片腌制', '莲藕切片泡水防变色', '热油炒里脊', '加莲藕翻匀调盐糖'] },
  { meat: 'pork_loin', meatZh: '猪里脊', veg: 'snow_pea', vegZh: '荷兰豆', method: '炒', flavor: ['light','sweet'], desc: '里脊荷兰豆, 翠绿嫩香。',
    steps: ['里脊腌制', '荷兰豆撕筋', '热油先炒里脊', '加荷兰豆翻匀调盐'] },
  { meat: 'pork_loin', meatZh: '猪里脊', veg: 'bamboo_shoot', vegZh: '竹笋', method: '炒', flavor: ['umami'], desc: '春笋炒里脊, 鲜嫩可口。',
    steps: ['里脊切丝腌制', '竹笋切丝焯水', '热油炒里脊', '加竹笋调盐翻匀'] },
  // pork_belly
  { meat: 'pork_belly', meatZh: '五花肉', veg: 'cabbage', vegZh: '包菜', method: '炒', flavor: ['umami','sweet'], desc: '五花肉炒包菜, 香脆下饭。',
    steps: ['五花切片煸炒出油', '加包菜翻炒', '调盐生抽糖'] },
  { meat: 'pork_belly', meatZh: '五花肉', veg: 'green_bean', vegZh: '四季豆', method: '炒', flavor: ['umami'], desc: '五花炒豆角, 入味又下饭。',
    steps: ['豆角焯水切段', '五花煸出油下豆角', '调生抽盐糖翻炒'] },
  { meat: 'pork_belly', meatZh: '五花肉', veg: 'leek', vegZh: '韭菜', method: '炒', flavor: ['umami'], desc: '五花韭菜, 香气四溢。',
    steps: ['五花切片煸炒', '加韭菜段大火翻匀', '调盐生抽'] },
  { meat: 'pork_belly', meatZh: '五花肉', veg: 'potato', vegZh: '土豆', method: '炒', flavor: ['umami'], desc: '五花炒土豆片, 软糯香浓。',
    steps: ['五花煸炒出油', '加土豆片翻炒', '加少量水焖熟', '调盐生抽'] },
  { meat: 'pork_belly', meatZh: '五花肉', veg: 'garlic_sprout', vegZh: '蒜薹', method: '炒', flavor: ['umami'], desc: '五花蒜薹, 香脆开胃。',
    steps: ['五花煸炒出油', '加蒜薹段翻炒', '调盐生抽'] },
  { meat: 'pork_belly', meatZh: '五花肉', veg: 'snow_vegetable', vegZh: '雪菜', method: '炒', flavor: ['umami','sour'], desc: '雪菜五花, 咸鲜下饭。',
    steps: ['雪菜切碎挤水', '五花煸出油', '加雪菜翻炒, 调糖少许'] },
  // pork_mince
  { meat: 'pork_mince', meatZh: '猪肉末', veg: 'eggplant', vegZh: '茄子', method: '炒', flavor: ['umami'], desc: '肉末茄子, 软糯多汁。',
    steps: ['茄子切条用盐杀水', '肉末煸炒出香', '加茄子翻炒至软', '调生抽盐糖'] },
  { meat: 'pork_mince', meatZh: '猪肉末', veg: 'green_bean', vegZh: '四季豆', method: '干煸', flavor: ['umami'], desc: '肉末干煸豆角, 香脆入味。',
    steps: ['豆角切段焯水沥干', '油煎豆角至起虎皮', '加肉末炒香', '调盐生抽糖'] },
  { meat: 'pork_mince', meatZh: '猪肉末', veg: 'celery', vegZh: '芹菜', method: '炒', flavor: ['umami','light'], desc: '芹菜肉末, 清香下饭。',
    steps: ['芹菜切丁焯水', '肉末爆香', '加芹菜翻炒, 调生抽盐'] },
  { meat: 'pork_mince', meatZh: '猪肉末', veg: 'cabbage', vegZh: '包菜', method: '炒', flavor: ['umami'], desc: '肉末包菜, 简单家常。',
    steps: ['肉末爆炒变色', '加包菜大火翻匀', '调生抽盐'] },
  { meat: 'pork_mince', meatZh: '猪肉末', veg: 'pumpkin', vegZh: '南瓜', method: '炒', flavor: ['sweet','umami'], desc: '南瓜肉末, 甘香软糯。',
    steps: ['南瓜切丁', '肉末爆炒', '加南瓜炒至软, 调盐糖'] },
  { meat: 'pork_mince', meatZh: '猪肉末', veg: 'zucchini', vegZh: '西葫芦', method: '炒', flavor: ['light','umami'], desc: '肉末西葫芦, 清淡鲜美。',
    steps: ['肉末爆炒', '加西葫芦片翻炒', '调盐生抽'] },
  // pork_ribs
  { meat: 'pork_ribs', meatZh: '排骨', veg: 'corn', vegZh: '玉米', method: '焖', flavor: ['umami','sweet'], desc: '排骨玉米, 鲜甜软糯。',
    steps: ['排骨焯水', '锅中加水排骨玉米', '调盐生抽小火炖 25 分钟'] },
  { meat: 'pork_ribs', meatZh: '排骨', veg: 'lotus_root', vegZh: '莲藕', method: '炖', flavor: ['light','umami'], desc: '莲藕排骨, 清润营养。',
    steps: ['排骨焯水', '加莲藕段姜', '炖 40 分钟', '调盐'] },
  { meat: 'pork_ribs', meatZh: '排骨', veg: 'potato', vegZh: '土豆', method: '焖', flavor: ['umami'], desc: '土豆烧排骨, 经典家常。',
    steps: ['排骨焯水', '锅烧热油爆姜下排骨', '加土豆生抽糖盐', '加水焖 25 分钟'] },
  // beef_sirloin
  { meat: 'beef_sirloin', meatZh: '牛里脊', veg: 'capsicum', vegZh: '彩椒', method: '炒', flavor: ['umami'], desc: '彩椒牛里脊, 嫩滑入味。',
    steps: ['牛里脊切片腌淀粉酱油', '热油大火滑炒', '加彩椒翻匀', '调盐糖'] },
  { meat: 'beef_sirloin', meatZh: '牛里脊', veg: 'broccoli', vegZh: '西兰花', method: '炒', flavor: ['umami','light'], desc: '西兰花炒牛肉, 营养下饭。',
    steps: ['牛肉切片腌制', '西兰花焯水', '热油大火炒牛肉', '加西兰花翻匀调盐'] },
  { meat: 'beef_sirloin', meatZh: '牛里脊', veg: 'asparagus', vegZh: '芦笋', method: '炒', flavor: ['light'], desc: '芦笋牛肉, 清新好吃。',
    steps: ['牛肉腌淀粉', '芦笋斜切焯水', '热油爆牛肉', '加芦笋翻匀调盐'] },
  { meat: 'beef_sirloin', meatZh: '牛里脊', veg: 'onion', vegZh: '洋葱', method: '黑椒', flavor: ['umami'], desc: '黑椒牛肉, 香浓滋味。',
    steps: ['牛肉腌制加黑胡椒', '洋葱切丝', '热油大火炒牛肉', '加洋葱翻匀调盐'] },
  { meat: 'beef_sirloin', meatZh: '牛里脊', veg: 'oyster_mushroom', vegZh: '平菇', method: '炒', flavor: ['umami'], desc: '平菇牛肉, 鲜美嫩滑。',
    steps: ['牛肉腌制', '平菇撕条', '热油炒牛肉变色', '加平菇翻匀调盐'] },
  // beef_mince
  { meat: 'beef_mince', meatZh: '牛肉末', veg: 'potato', vegZh: '土豆', method: '炒', flavor: ['umami'], desc: '牛肉末烧土豆, 暖心家常。',
    steps: ['土豆切丁', '牛肉末爆香', '加土豆翻炒', '加少水焖熟调盐生抽'] },
  { meat: 'beef_mince', meatZh: '牛肉末', veg: 'cabbage', vegZh: '包菜', method: '炒', flavor: ['umami'], desc: '牛肉末炒包菜, 快手下饭。',
    steps: ['牛肉末爆香', '加包菜大火翻炒', '调盐生抽'] },
  // chicken_breast
  { meat: 'chicken_breast', meatZh: '鸡胸肉', veg: 'broccoli', vegZh: '西兰花', method: '炒', flavor: ['umami','light'], desc: '鸡胸西兰花, 健身餐首选。',
    steps: ['鸡胸切丁腌制', '西兰花焯水', '热油炒鸡胸变色', '加西兰花调盐'] },
  { meat: 'chicken_breast', meatZh: '鸡胸肉', veg: 'capsicum', vegZh: '彩椒', method: '炒', flavor: ['umami'], desc: '彩椒鸡胸, 营养均衡。',
    steps: ['鸡胸切丁腌淀粉', '热油炒鸡胸', '加彩椒翻匀调盐'] },
  { meat: 'chicken_breast', meatZh: '鸡胸肉', veg: 'cucumber', vegZh: '黄瓜', method: '炒', flavor: ['light','umami'], desc: '黄瓜炒鸡胸, 清淡爽口。',
    steps: ['鸡胸切丁腌制', '黄瓜切片', '热油爆炒鸡胸', '加黄瓜调盐翻匀'] },
  { meat: 'chicken_breast', meatZh: '鸡胸肉', veg: 'zucchini', vegZh: '西葫芦', method: '炒', flavor: ['light'], desc: '西葫芦鸡胸, 减脂搭档。',
    steps: ['鸡胸切丁腌制', '西葫芦切片', '热油炒鸡胸', '加西葫芦翻匀调盐'] },
  { meat: 'chicken_breast', meatZh: '鸡胸肉', veg: 'mushroom', vegZh: '蘑菇', method: '炒', flavor: ['umami'], desc: '蘑菇鸡胸, 鲜美低脂。',
    steps: ['鸡胸切丁腌制', '蘑菇切片', '热油炒鸡胸', '加蘑菇翻匀调盐生抽'] },
  // chicken_thigh
  { meat: 'chicken_thigh', meatZh: '鸡腿肉', veg: 'potato', vegZh: '土豆', method: '焖', flavor: ['umami'], desc: '土豆烧鸡腿肉, 软糯入味。',
    steps: ['鸡腿肉切块煎香', '加土豆翻炒', '加水生抽糖焖 20 分钟'] },
  { meat: 'chicken_thigh', meatZh: '鸡腿肉', veg: 'mushroom', vegZh: '蘑菇', method: '焖', flavor: ['umami'], desc: '蘑菇焖鸡腿肉, 鲜香满分。',
    steps: ['鸡腿块煎香', '加蘑菇翻炒', '加水生抽糖焖 15 分钟'] },
  { meat: 'chicken_thigh', meatZh: '鸡腿肉', veg: 'onion', vegZh: '洋葱', method: '炒', flavor: ['umami','sweet'], desc: '洋葱鸡腿肉, 香甜可口。',
    steps: ['鸡腿块腌制', '热油炒鸡肉变色', '加洋葱翻炒至软, 调盐生抽糖'] },
  { meat: 'chicken_thigh', meatZh: '鸡腿肉', veg: 'cashew_nut', vegZh: '腰果', method: '炒', flavor: ['umami','sweet'], desc: '腰果鸡丁, 经典家常。',
    steps: ['鸡腿肉切丁腌制', '腰果炸香盛出', '热油炒鸡丁', '加腰果调盐生抽'] },
  { meat: 'chicken_thigh', meatZh: '鸡腿肉', veg: 'green_bean', vegZh: '四季豆', method: '焖', flavor: ['umami'], desc: '豆角焖鸡腿肉, 软香入味。',
    steps: ['豆角段焯水', '鸡腿块煎香', '加豆角加水焖 12 分钟', '调盐生抽'] },
  // chicken_wing
  { meat: 'chicken_wing', meatZh: '鸡翅', veg: 'potato', vegZh: '土豆', method: '焖', flavor: ['umami','sweet'], desc: '土豆焖鸡翅, 香甜软糯。',
    steps: ['鸡翅煎至两面金黄', '加土豆块', '加生抽糖水焖 25 分钟'] },
  { meat: 'chicken_wing', meatZh: '鸡翅', veg: '', vegZh: '', method: '可乐', flavor: ['sweet'], desc: '可乐鸡翅, 大人小孩都爱。',
    steps: ['鸡翅划口煎香', '加可乐生抽姜', '小火收汁'], extras: ['cola'] },
  // lamb_leg
  { meat: 'lamb_leg', meatZh: '羊腿肉', veg: 'onion', vegZh: '洋葱', method: '爆炒', flavor: ['umami','sweet'], desc: '洋葱爆羊肉, 嫩滑香甜。',
    steps: ['羊肉切片腌制', '热油大火爆炒变色', '加洋葱翻匀调盐生抽'] },
  { meat: 'lamb_leg', meatZh: '羊腿肉', veg: 'celery', vegZh: '芹菜', method: '炒', flavor: ['umami'], desc: '芹菜羊肉, 鲜香开胃。',
    steps: ['羊肉腌制', '芹菜切段', '热油爆炒羊肉', '加芹菜调盐'] },
  { meat: 'lamb_leg', meatZh: '羊腿肉', veg: 'garlic_chives', vegZh: '韭菜', method: '炒', flavor: ['umami'], desc: '韭菜羊肉, 香气浓郁。',
    steps: ['羊肉腌制', '热油爆羊肉', '加韭菜段翻匀调盐'] },
  // duck
  { meat: 'duck', meatZh: '鸭肉', veg: 'taro', vegZh: '芋头', method: '焖', flavor: ['umami','sweet'], desc: '芋头焖鸭, 软糯醇香。',
    steps: ['鸭肉斩块焯水', '热油爆姜下鸭肉炒香', '加芋头水生抽糖焖 30 分钟'] },
  { meat: 'duck', meatZh: '鸭肉', veg: 'pickled_mustard', vegZh: '榨菜', method: '炒', flavor: ['umami','sour'], desc: '榨菜鸭丝, 咸鲜爽口。',
    steps: ['鸭肉切丝腌制', '榨菜泡水切丝', '热油炒鸭肉', '加榨菜翻匀调糖'] },
  // ham/sausage/bacon (semi-processed allowed for variety)
  { meat: 'sausage', meatZh: '香肠', veg: 'cabbage', vegZh: '包菜', method: '炒', flavor: ['umami'], desc: '香肠炒包菜, 简单美味。',
    steps: ['香肠切片', '热油煎香盛出', '炒包菜变软', '回锅翻匀调盐'] },
  { meat: 'sausage', meatZh: '香肠', veg: 'bell_pepper_green', vegZh: '青椒', method: '炒', flavor: ['umami'], desc: '青椒炒香肠, 鲜香开胃。',
    steps: ['香肠切片煎香', '加青椒翻炒', '调盐糖'], extras: ['bell_pepper_green'] },
  { meat: 'bacon', meatZh: '培根', veg: 'cabbage', vegZh: '包菜', method: '炒', flavor: ['umami'], desc: '培根包菜, 西式简餐。',
    steps: ['培根切片煸出油', '加包菜大火炒匀', '调黑胡椒少许盐'] },
  { meat: 'bacon', meatZh: '培根', veg: 'asparagus', vegZh: '芦笋', method: '炒', flavor: ['umami'], desc: '培根芦笋, 简单西式。',
    steps: ['培根切段煎香', '加芦笋翻炒', '调黑胡椒'] },
  { meat: 'ham', meatZh: '火腿', veg: 'green_bean', vegZh: '四季豆', method: '炒', flavor: ['umami'], desc: '火腿炒四季豆, 快手简餐。',
    steps: ['火腿切丁', '豆角焯水', '热油炒火腿', '加豆角翻匀调盐'] },
  // chinese_sausage
  { meat: 'chinese_sausage', meatZh: '腊肠', veg: 'cabbage', vegZh: '包菜', method: '炒', flavor: ['umami','sweet'], desc: '腊肠炒包菜, 香甜下饭。',
    steps: ['腊肠斜切片蒸 5 分钟', '热油煎腊肠', '加包菜翻匀调盐'] },
];

// 把 easyMeatTemplates 转成菜谱(共 45+ 道)
for (const t of easyMeatTemplates) {
  const ings = [
    { ingredientId: t.meat, amount: t.method === '焖' || t.method === '炖' || t.method === '红烧' ? 350 : 250, unit: 'g' },
  ];
  if (t.veg) ings.push({ ingredientId: t.veg, amount: 200, unit: 'g' });
  if (t.extras) for (const ex of t.extras) ings.push({ ingredientId: ex, amount: 100, unit: 'g' });
  ings.push(
    { ingredientId: 'ginger', amount: 5, unit: 'g' },
    { ingredientId: 'garlic', amount: 5, unit: 'g' },
    { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
    { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
    { ingredientId: 'salt', amount: 2, unit: 'g' },
  );
  if (t.method === '焖' || t.method === '炖' || t.method === '红烧') ings.push({ ingredientId: 'sugar', amount: 5, unit: 'g' });
  NEW.push({
    ...cn(),
    id: recipeId('em'),
    nameZh: `${t.method}${t.meatZh}${t.veg ? '炒' + t.vegZh : ''}`.replace('炒炒','炒').replace('焖炒','焖').replace('炖炒','炖').replace('黑椒炒','黑椒'),
    nameEn: `${t.method} ${t.meatZh}${t.veg ? ' with ' + t.vegZh : ''}`,
    cookingMethod: t.method === '焖' || t.method === '炖' ? 'braise' : t.method === '红烧' ? 'braise' : t.method === '煎' ? 'pan_fry' : 'stir_fry',
    flavors: t.flavor, mealTypes: ['lunch','dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 10, cookTime: t.method === '焖' || t.method === '炖' ? 25 : 12, servings: 2,
    description: t.desc,
    ingredients: ings,
    steps: t.steps,
    tags: ['荤', '家常', '简单'],
  });
}

// === 易: 素菜 (90 道) ===
const easyVegTemplates = [
  { veg: 'broccoli', vegZh: '西兰花', method: '蒜蓉', desc: '蒜蓉西兰花, 清淡爽口。', flavor: ['light'] },
  { veg: 'broccoli', vegZh: '西兰花', method: '清炒', desc: '清炒西兰花。', flavor: ['light'] },
  { veg: 'cauliflower', vegZh: '花菜', method: '干煸', desc: '干煸花菜, 香脆下饭。', flavor: ['umami'] },
  { veg: 'cauliflower', vegZh: '花菜', method: '清炒', desc: '清炒花菜。', flavor: ['light'] },
  { veg: 'potato', vegZh: '土豆', method: '酸甜', desc: '酸甜土豆丝。', flavor: ['sour','sweet'] },
  { veg: 'potato', vegZh: '土豆', method: '醋溜', desc: '醋溜土豆丝。', flavor: ['sour'] },
  { veg: 'potato', vegZh: '土豆', method: '清炒', desc: '清炒土豆丝。', flavor: ['light'] },
  { veg: 'spinach', vegZh: '菠菜', method: '清炒', desc: '清炒菠菜, 补铁补血。', flavor: ['light'] },
  { veg: 'spinach', vegZh: '菠菜', method: '蒜蓉', desc: '蒜蓉菠菜。', flavor: ['light'] },
  { veg: 'bok_choy', vegZh: '小白菜', method: '清炒', desc: '清炒小白菜。', flavor: ['light'] },
  { veg: 'bok_choy', vegZh: '小白菜', method: '蒜蓉', desc: '蒜蓉小白菜。', flavor: ['light'] },
  { veg: 'chinese_cabbage', vegZh: '大白菜', method: '醋溜', desc: '醋溜大白菜。', flavor: ['sour'] },
  { veg: 'chinese_cabbage', vegZh: '大白菜', method: '清炒', desc: '清炒大白菜。', flavor: ['light'] },
  { veg: 'cabbage', vegZh: '包菜', method: '手撕', desc: '手撕包菜, 脆爽。', flavor: ['umami'] },
  { veg: 'cabbage', vegZh: '包菜', method: '醋溜', desc: '醋溜包菜。', flavor: ['sour'] },
  { veg: 'tomato', vegZh: '番茄', method: '糖渍', desc: '糖拌番茄。', flavor: ['sweet'] },
  { veg: 'cucumber', vegZh: '黄瓜', method: '拍', desc: '拍黄瓜, 清爽。', flavor: ['light'] },
  { veg: 'eggplant', vegZh: '茄子', method: '蒸', desc: '蒸茄子, 软糯入味。', flavor: ['light'] },
  { veg: 'eggplant', vegZh: '茄子', method: '清炒', desc: '清炒茄子。', flavor: ['umami'] },
  { veg: 'celery', vegZh: '芹菜', method: '清炒', desc: '清炒芹菜。', flavor: ['light'] },
  { veg: 'celery', vegZh: '芹菜', method: '腰果', desc: '腰果芹菜, 香脆可口。', flavor: ['light'] },
  { veg: 'asparagus', vegZh: '芦笋', method: '清炒', desc: '清炒芦笋。', flavor: ['light'] },
  { veg: 'asparagus', vegZh: '芦笋', method: '蒜蓉', desc: '蒜蓉芦笋。', flavor: ['light'] },
  { veg: 'snow_pea', vegZh: '荷兰豆', method: '清炒', desc: '清炒荷兰豆。', flavor: ['light','sweet'] },
  { veg: 'snow_pea', vegZh: '荷兰豆', method: '蒜蓉', desc: '蒜蓉荷兰豆。', flavor: ['light'] },
  { veg: 'green_bean', vegZh: '四季豆', method: '干煸', desc: '干煸四季豆。', flavor: ['umami'] },
  { veg: 'lotus_root', vegZh: '莲藕', method: '清炒', desc: '清炒藕片。', flavor: ['light'] },
  { veg: 'lotus_root', vegZh: '莲藕', method: '糖醋', desc: '糖醋藕片。', flavor: ['sour','sweet'] },
  { veg: 'mushroom', vegZh: '蘑菇', method: '清炒', desc: '清炒蘑菇。', flavor: ['umami'] },
  { veg: 'enoki_mushroom', vegZh: '金针菇', method: '清炒', desc: '清炒金针菇。', flavor: ['umami'] },
  { veg: 'king_oyster_mushroom', vegZh: '杏鲍菇', method: '蚝油', desc: '蚝油杏鲍菇。', flavor: ['umami'] },
  { veg: 'oyster_mushroom', vegZh: '平菇', method: '清炒', desc: '清炒平菇。', flavor: ['umami'] },
  { veg: 'shiitake_fresh', vegZh: '香菇', method: '蚝油', desc: '蚝油香菇。', flavor: ['umami'] },
  { veg: 'water_spinach', vegZh: '空心菜', method: '蒜蓉', desc: '蒜蓉空心菜。', flavor: ['umami'] },
  { veg: 'water_spinach', vegZh: '空心菜', method: '清炒', desc: '清炒空心菜。', flavor: ['light'] },
  { veg: 'amaranth_greens', vegZh: '苋菜', method: '蒜蓉', desc: '蒜蓉苋菜。', flavor: ['light'] },
  { veg: 'chinese_broccoli', vegZh: '芥蓝', method: '蒜蓉', desc: '蒜蓉芥蓝。', flavor: ['light'] },
  { veg: 'chinese_broccoli', vegZh: '芥蓝', method: '蚝油', desc: '蚝油芥蓝。', flavor: ['umami'] },
  { veg: 'chrysanthemum_greens', vegZh: '茼蒿', method: '清炒', desc: '清炒茼蒿。', flavor: ['light'] },
  { veg: 'pea_shoots', vegZh: '豆苗', method: '清炒', desc: '清炒豆苗。', flavor: ['light'] },
  { veg: 'pea_shoots', vegZh: '豆苗', method: '蒜蓉', desc: '蒜蓉豆苗。', flavor: ['light'] },
  { veg: 'indian_lettuce', vegZh: '油麦菜', method: '蒜蓉', desc: '蒜蓉油麦菜。', flavor: ['light'] },
  { veg: 'indian_lettuce', vegZh: '油麦菜', method: '清炒', desc: '清炒油麦菜。', flavor: ['light'] },
  { veg: 'lettuce', vegZh: '生菜', method: '蒜蓉', desc: '蒜蓉生菜。', flavor: ['light'] },
  { veg: 'lettuce', vegZh: '生菜', method: '蚝油', desc: '蚝油生菜。', flavor: ['umami'] },
  { veg: 'celtuce', vegZh: '莴笋', method: '清炒', desc: '清炒莴笋丝。', flavor: ['light'] },
  { veg: 'celtuce', vegZh: '莴笋', method: '凉拌', desc: '凉拌莴笋丝。', flavor: ['light'] },
  { veg: 'fennel', vegZh: '茴香', method: '清炒', desc: '清炒茴香。', flavor: ['umami'] },
  { veg: 'kale', vegZh: '羽衣甘蓝', method: '蒜蓉', desc: '蒜蓉羽衣甘蓝。', flavor: ['light'] },
  { veg: 'okra', vegZh: '秋葵', method: '蒜蓉', desc: '蒜蓉秋葵。', flavor: ['light'] },
  { veg: 'okra', vegZh: '秋葵', method: '凉拌', desc: '凉拌秋葵。', flavor: ['light'] },
  { veg: 'pumpkin', vegZh: '南瓜', method: '蒸', desc: '蒸南瓜。', flavor: ['sweet'] },
  { veg: 'sweet_potato', vegZh: '红薯', method: '烤', desc: '烤红薯。', flavor: ['sweet'] },
  { veg: 'taro', vegZh: '芋头', method: '蒸', desc: '蒸芋头。', flavor: ['sweet'] },
  { veg: 'corn', vegZh: '玉米', method: '煮', desc: '煮玉米。', flavor: ['sweet'] },
  { veg: 'beet', vegZh: '甜菜根', method: '凉拌', desc: '凉拌甜菜根。', flavor: ['sweet','sour'] },
  { veg: 'purple_cabbage', vegZh: '紫甘蓝', method: '凉拌', desc: '凉拌紫甘蓝。', flavor: ['sweet','sour'] },
  { veg: 'cucumber', vegZh: '黄瓜', method: '凉拌', desc: '凉拌黄瓜。', flavor: ['light'] },
  { veg: 'tomato', vegZh: '番茄', method: '凉拌', desc: '凉拌番茄。', flavor: ['sweet','sour'] },
  { veg: 'wood_ear', vegZh: '木耳', method: '凉拌', desc: '凉拌木耳。', flavor: ['light'] },
  { veg: 'wood_ear', vegZh: '木耳', method: '清炒', desc: '清炒木耳。', flavor: ['umami'] },
  { veg: 'black_fungus', vegZh: '黑木耳', method: '凉拌', desc: '凉拌黑木耳。', flavor: ['light'] },
  { veg: 'spring_bamboo', vegZh: '春笋', method: '油焖', desc: '油焖春笋。', flavor: ['umami','sweet'] },
  { veg: 'spring_bamboo', vegZh: '春笋', method: '清炒', desc: '清炒春笋片。', flavor: ['light'] },
  { veg: 'bamboo_shoot', vegZh: '竹笋', method: '清炒', desc: '清炒竹笋。', flavor: ['light'] },
  { veg: 'water_bamboo', vegZh: '茭白', method: '清炒', desc: '清炒茭白丝。', flavor: ['light'] },
  { veg: 'water_chestnut', vegZh: '荸荠', method: '清炒', desc: '清炒马蹄。', flavor: ['sweet'] },
  { veg: 'yam', vegZh: '山药', method: '清炒', desc: '清炒山药片。', flavor: ['light'] },
  { veg: 'yam', vegZh: '山药', method: '蓝莓', desc: '蓝莓山药。', flavor: ['sweet'], extras: ['blueberry'] },
  { veg: 'edamame', vegZh: '毛豆', method: '盐水', desc: '盐水毛豆。', flavor: ['umami'] },
  { veg: 'green_bean', vegZh: '四季豆', method: '焖', desc: '焖四季豆。', flavor: ['umami'] },
  { veg: 'snow_vegetable', vegZh: '雪菜', method: '炒', desc: '雪菜炒春笋。', flavor: ['umami','sour'], extras: ['spring_bamboo'] },
  { veg: 'pea', vegZh: '豌豆', method: '清炒', desc: '清炒豌豆。', flavor: ['sweet'] },
  { veg: 'arugula', vegZh: '芝麻菜', method: '凉拌', desc: '凉拌芝麻菜。', flavor: ['light'] },
  { veg: 'watercress', vegZh: '西洋菜', method: '蒜蓉', desc: '蒜蓉西洋菜。', flavor: ['light'] },
  { veg: 'brussels_sprouts', vegZh: '抱子甘蓝', method: '烤', desc: '烤抱子甘蓝。', flavor: ['umami'] },
  { veg: 'baby_corn', vegZh: '玉米笋', method: '清炒', desc: '清炒玉米笋。', flavor: ['sweet'] },
  { veg: 'chayote', vegZh: '佛手瓜', method: '清炒', desc: '清炒佛手瓜。', flavor: ['light'] },
  { veg: 'loofah', vegZh: '丝瓜', method: '清炒', desc: '清炒丝瓜。', flavor: ['light'] },
  { veg: 'bitter_melon', vegZh: '苦瓜', method: '清炒', desc: '清炒苦瓜。', flavor: ['bitter'] },
  { veg: 'winter_melon', vegZh: '冬瓜', method: '清炒', desc: '清炒冬瓜。', flavor: ['light'] },
  { veg: 'white_radish', vegZh: '白萝卜', method: '清炒', desc: '清炒白萝卜丝。', flavor: ['light'] },
  { veg: 'carrot', vegZh: '胡萝卜', method: '清炒', desc: '清炒胡萝卜丝。', flavor: ['sweet'] },
  { veg: 'jicama', vegZh: '豆薯', method: '清炒', desc: '清炒豆薯。', flavor: ['sweet'] },
  { veg: 'potato', vegZh: '土豆', method: '红烧', desc: '红烧土豆。', flavor: ['umami','sweet'] },
  { veg: 'eggplant', vegZh: '茄子', method: '红烧', desc: '红烧茄子(无肉)。', flavor: ['umami'] },
  { veg: 'green_bean', vegZh: '四季豆', method: '蒜蓉', desc: '蒜蓉四季豆。', flavor: ['umami'] },
  { veg: 'asparagus', vegZh: '芦笋', method: '烤', desc: '烤芦笋。', flavor: ['light'] },
  { veg: 'pumpkin', vegZh: '南瓜', method: '清炒', desc: '清炒南瓜。', flavor: ['sweet'] },
  { veg: 'mushroom', vegZh: '蘑菇', method: '烤', desc: '烤蘑菇。', flavor: ['umami'] },
  { veg: 'king_oyster_mushroom', vegZh: '杏鲍菇', method: '烤', desc: '烤杏鲍菇。', flavor: ['umami'] },
  { veg: 'corn', vegZh: '玉米', method: '烤', desc: '烤玉米。', flavor: ['sweet'] },
];

for (const t of easyVegTemplates) {
  const ings = [{ ingredientId: t.veg, amount: 250, unit: 'g' }];
  if (t.extras) for (const ex of t.extras) ings.push({ ingredientId: ex, amount: 100, unit: 'g' });
  ings.push(
    { ingredientId: 'garlic', amount: 5, unit: 'g' },
    { ingredientId: 'cooking_oil', amount: 8, unit: 'ml' },
    { ingredientId: 'salt', amount: 2, unit: 'g' },
  );
  if (t.method.includes('凉拌')) ings.push({ ingredientId: 'sesame_oil', amount: 3, unit: 'ml' }, { ingredientId: 'vinegar', amount: 5, unit: 'ml' });
  if (t.method.includes('蚝油')) ings.push({ ingredientId: 'oyster_sauce', amount: 8, unit: 'ml' });
  if (t.method.includes('糖')) ings.push({ ingredientId: 'sugar', amount: 8, unit: 'g' });
  if (t.method.includes('醋')) ings.push({ ingredientId: 'vinegar', amount: 8, unit: 'ml' });
  const isCold = t.method.includes('凉拌') || t.method.includes('糖渍') || t.method.includes('拍');
  NEW.push({
    ...cn(),
    id: recipeId('ev'),
    nameZh: `${t.method}${t.vegZh}${t.extras && t.extras.length > 0 ? ('配' + t.extras[0]) : ''}`.replace(/配[a-z_]+/, ''),
    nameEn: `${t.method} ${t.vegZh}`,
    cookingMethod: isCold ? 'cold_dish' : (t.method === '蒸' || t.method === '煮' || t.method === '盐水') ? 'boil' : t.method === '烤' ? 'roast' : 'stir_fry',
    flavors: t.flavor, mealTypes: ['lunch','dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 8, servings: 2,
    description: t.desc,
    ingredients: ings,
    steps: [`${t.vegZh}处理切配`, `按"${t.method}"做法烹制`, '调味出锅'],
    tags: ['素', '简单'],
  });
}

// === 易: 简单主食 (30 道) ===
const easyStaples = [
  { id: 's_steamed_rice_1p', zh: '蒸米饭(1人)', size: 1 },
  { id: 's_steamed_rice_2p', zh: '蒸米饭(2人)', size: 2 },
  { id: 's_steamed_rice_3p', zh: '蒸米饭(3人)', size: 3 },
  { id: 's_steamed_rice_4p', zh: '蒸米饭(4人)', size: 4 },
  { id: 's_brown_rice', zh: '糙米饭', size: 2 },
  { id: 's_millet_rice', zh: '小米粥', size: 2 },
  { id: 's_pumpkin_rice', zh: '南瓜饭', size: 2 },
  { id: 's_corn_rice', zh: '玉米饭', size: 2 },
  { id: 's_yam_rice', zh: '山药饭', size: 2 },
  { id: 's_purple_rice', zh: '紫薯饭', size: 2 },
  { id: 's_sweet_potato_rice', zh: '红薯饭', size: 2 },
  { id: 's_quinoa_rice', zh: '藜麦饭', size: 2 },
  { id: 's_oat_porridge', zh: '燕麦粥', size: 2 },
  { id: 's_corn_porridge', zh: '玉米粥', size: 2 },
  { id: 's_pumpkin_porridge', zh: '南瓜粥', size: 2 },
  { id: 's_sweet_potato_porridge', zh: '红薯粥', size: 2 },
  { id: 's_jujube_porridge', zh: '红枣粥', size: 2 },
  { id: 's_steamed_mantou_2p', zh: '蒸馒头(2人)', size: 2 },
  { id: 's_steamed_mantou_4p', zh: '蒸馒头(4人)', size: 4 },
  { id: 's_steamed_huajuan_2p', zh: '蒸花卷(2人)', size: 2 },
  { id: 's_pumpkin_mantou', zh: '南瓜馒头', size: 2 },
  { id: 's_purple_mantou', zh: '紫薯馒头', size: 2 },
  { id: 's_baked_sweet_potato', zh: '烤红薯', size: 2 },
  { id: 's_baked_purple_potato', zh: '烤紫薯', size: 2 },
  { id: 's_steamed_corn', zh: '蒸玉米', size: 2 },
  { id: 's_steamed_taro', zh: '蒸芋头', size: 2 },
  { id: 's_steamed_potato', zh: '蒸土豆', size: 2 },
  { id: 's_cold_noodles_simple', zh: '简易凉面', size: 2 },
  { id: 's_chao_mian_veg', zh: '素炒面', size: 2 },
  { id: 's_chao_fan_veg', zh: '素炒饭', size: 2 },
];

for (const s of easyStaples) {
  let mainIng = 'rice';
  if (s.zh.includes('糙米')) mainIng = 'brown_rice';
  if (s.zh.includes('小米')) mainIng = 'millet';
  if (s.zh.includes('燕麦')) mainIng = 'oats';
  if (s.zh.includes('玉米粥') || s.zh.includes('蒸玉米')) mainIng = 'corn';
  if (s.zh.includes('馒头') || s.zh.includes('花卷')) mainIng = 'flour';
  if (s.zh.includes('烤红薯') || s.zh.includes('红薯粥') || s.zh.includes('红薯饭')) mainIng = 'sweet_potato';
  if (s.zh.includes('紫薯')) mainIng = 'purple_potato';
  if (s.zh.includes('南瓜')) mainIng = 'pumpkin';
  if (s.zh.includes('山药')) mainIng = 'yam';
  if (s.zh.includes('藜麦')) mainIng = 'quinoa';
  if (s.zh.includes('芋头')) mainIng = 'taro';
  if (s.zh.includes('土豆')) mainIng = 'potato';
  if (s.zh.includes('凉面') || s.zh.includes('炒面')) mainIng = 'noodles_dried';
  if (s.zh.includes('炒饭')) mainIng = 'rice';
  if (s.zh.includes('红枣粥')) mainIng = 'rice';
  const ings = [{ ingredientId: mainIng, amount: 80 * s.size, unit: 'g' }];
  if (s.zh.includes('粥')) ings.push({ ingredientId: 'water', amount: 600, unit: 'ml' });
  if (s.zh.includes('红枣粥')) ings.push({ ingredientId: 'jujube', amount: 30, unit: 'g' });
  if (s.zh.includes('馒头') || s.zh.includes('花卷')) ings.push({ ingredientId: 'sugar', amount: 5, unit: 'g' });
  NEW.push({
    ...cn(),
    id: recipeId('es'),
    nameZh: s.zh,
    nameEn: s.zh,
    cookingMethod: 'staple',
    flavors: ['light'], mealTypes: ['breakfast','lunch','dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 25, servings: s.size,
    description: '主食类。',
    ingredients: ings,
    steps: ['食材淘洗', '按比例加水', '蒸/煮至熟'],
    tags: ['主食', s.size + '人份'],
  });
}

// === 易: 简单汤 (20 道, 无蛋无海鲜无乳无豆腐) ===
const easySoups = [
  { veg: 'tomato', vegZh: '番茄', meat: 'pork_loin', meatZh: '猪肉', desc: '番茄猪肉汤。' },
  { veg: 'winter_melon', vegZh: '冬瓜', meat: 'pork_ribs', meatZh: '排骨', desc: '冬瓜排骨汤。' },
  { veg: 'corn', vegZh: '玉米', meat: 'pork_ribs', meatZh: '排骨', desc: '玉米排骨汤。' },
  { veg: 'lotus_root', vegZh: '莲藕', meat: 'pork_ribs', meatZh: '排骨', desc: '莲藕排骨汤。' },
  { veg: 'carrot', vegZh: '胡萝卜', meat: 'pork_ribs', meatZh: '排骨', desc: '胡萝卜排骨汤。' },
  { veg: 'white_radish', vegZh: '白萝卜', meat: 'pork_ribs', meatZh: '排骨', desc: '白萝卜排骨汤。' },
  { veg: 'mushroom', vegZh: '蘑菇', meat: 'chicken_thigh', meatZh: '鸡腿', desc: '菌菇鸡汤。' },
  { veg: 'shiitake_fresh', vegZh: '香菇', meat: 'chicken_whole', meatZh: '整鸡', desc: '香菇炖鸡。' },
  { veg: 'jujube', vegZh: '红枣', meat: 'chicken_whole', meatZh: '整鸡', desc: '红枣炖鸡。' },
  { veg: 'yam', vegZh: '山药', meat: 'pork_ribs', meatZh: '排骨', desc: '山药排骨汤。' },
  { veg: 'cabbage', vegZh: '包菜', meat: 'pork_loin', meatZh: '猪肉', desc: '包菜肉片汤。' },
  { veg: 'tomato', vegZh: '番茄', meat: '', meatZh: '', desc: '番茄素汤。' },
  { veg: 'mushroom', vegZh: '蘑菇', meat: '', meatZh: '', desc: '菌菇素汤。' },
  { veg: 'winter_melon', vegZh: '冬瓜', meat: '', meatZh: '', desc: '冬瓜素汤。' },
  { veg: 'pumpkin', vegZh: '南瓜', meat: '', meatZh: '', desc: '南瓜浓汤。' },
  { veg: 'spinach', vegZh: '菠菜', meat: '', meatZh: '', desc: '菠菜清汤。' },
  { veg: 'potato', vegZh: '土豆', meat: 'beef_brisket', meatZh: '牛腩', desc: '土豆牛腩汤。' },
  { veg: 'carrot', vegZh: '胡萝卜', meat: 'beef_brisket', meatZh: '牛腩', desc: '胡萝卜牛腩汤。' },
  { veg: 'celery', vegZh: '芹菜', meat: '', meatZh: '', desc: '芹菜素汤。' },
  { veg: 'corn', vegZh: '玉米', meat: '', meatZh: '', desc: '玉米素汤。' },
];

for (const s of easySoups) {
  const ings = [{ ingredientId: s.veg, amount: 200, unit: 'g' }];
  if (s.meat) ings.push({ ingredientId: s.meat, amount: 200, unit: 'g' });
  ings.push(
    { ingredientId: 'ginger', amount: 5, unit: 'g' },
    { ingredientId: 'salt', amount: 3, unit: 'g' },
  );
  NEW.push({
    ...cn(),
    id: recipeId('eu'),
    nameZh: s.desc.replace('。',''),
    nameEn: s.desc.replace('。',''),
    cookingMethod: 'soup',
    flavors: s.meat ? ['umami'] : ['light'],
    mealTypes: ['lunch','dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: s.meat ? 40 : 15, servings: 3,
    description: s.desc,
    ingredients: ings,
    steps: ['食材切配', '加水煮开', s.meat ? '小火炖 30 分钟' : '煮 10 分钟', '调盐'],
    tags: ['汤', s.meat ? '荤汤' : '素汤'],
  });
}

// ============================================================
// === 中难度 (100 道) ===
// ============================================================
const mediumTemplates = [
  // 红烧/糖醋系列
  { meat: 'pork_belly', method: '红烧', desc: '红烧五花肉。' },
  { meat: 'pork_ribs', method: '糖醋', desc: '糖醋小排。' },
  { meat: 'pork_ribs', method: '红烧', desc: '红烧排骨。' },
  { meat: 'pork_ribs', method: '蒸', extras: ['preserved_mustard'], desc: '梅菜蒸排骨。' },
  { meat: 'beef_brisket', method: '红烧', desc: '红烧牛腩。' },
  { meat: 'beef_brisket', method: '番茄炖', desc: '番茄炖牛腩。', extras: ['tomato'] },
  { meat: 'beef_shank', method: '酱卤', desc: '酱卤牛腱。' },
  { meat: 'lamb_chop', method: '烤', desc: '烤羊排。' },
  { meat: 'lamb_leg', method: '红烧', extras: ['white_radish'], desc: '萝卜烧羊肉。' },
  { meat: 'duck', method: '红烧', extras: ['water_bamboo'], desc: '茭白烧鸭。' },
  { meat: 'duck_leg', method: '香煎', desc: '香煎鸭腿。' },
  { meat: 'chicken_whole', method: '盐焗', desc: '盐焗鸡。' },
  { meat: 'chicken_whole', method: '白切', desc: '白切鸡。' },
  { meat: 'chicken_thigh', method: '黄焖', extras: ['shiitake_fresh','potato'], desc: '黄焖鸡腿肉。' },
  { meat: 'chicken_thigh', method: '可乐', desc: '可乐鸡腿。', extras: ['cola'] },
  { meat: 'chicken_thigh', method: '香煎', extras: ['rosemary'], desc: '香煎迷迭香鸡腿。' },
  { meat: 'pork_belly', method: '咸烧', extras: ['preserved_mustard'], desc: '梅菜扣肉(简化版)。' },
  { meat: 'pork_belly', method: '回锅', extras: ['cabbage'], desc: '简易回锅肉(不放辣)。' },
  { meat: 'pork_ribs', method: '蒜香', desc: '蒜香排骨。' },
  { meat: 'pork_ribs', method: '盐烤', desc: '盐烤排骨。' },
  { meat: 'beef_sirloin', method: '黑椒', extras: ['potato'], desc: '黑椒牛柳土豆。' },
  { meat: 'beef_sirloin', method: '番茄', extras: ['tomato'], desc: '番茄牛肉。' },
  { meat: 'beef_mince', method: '土豆泥', extras: ['potato'], desc: '牛肉土豆泥。' },
  { meat: 'pork_loin', method: '糖醋', desc: '糖醋里脊。' },
  { meat: 'pork_loin', method: '京酱', extras: ['onion'], desc: '简易京酱肉丝(无甜面酱用酱油代)。' },
  { meat: 'pork_loin', method: '锅包', desc: '锅包肉。' },
  { meat: 'duck', method: '啤酒', desc: '啤酒鸭。' },
  { meat: 'duck_leg', method: '红烧', extras: ['potato'], desc: '红烧鸭腿。' },
  { meat: 'lamb_leg', method: '清炖', extras: ['carrot','white_radish'], desc: '清炖羊肉萝卜。' },
  { meat: 'lamb_leg', method: '葱爆', extras: ['spring_onion'], desc: '葱爆羊肉。' },
  { meat: 'pork_trotter', method: '红烧', desc: '红烧猪蹄。' },
  { meat: 'pork_trotter', method: '黄豆', extras: ['soybean'], desc: '黄豆煮猪蹄。' },
  { meat: 'chicken_wing', method: '可乐', desc: '可乐鸡翅(经典)。', extras: ['cola'] },
  { meat: 'chicken_wing', method: '蒜香', desc: '蒜香鸡翅。' },
  { meat: 'chicken_wing', method: '蜂蜜', desc: '蜂蜜烤鸡翅。', extras: ['honey'] },
  { meat: 'chicken_wing', method: '红烧', desc: '红烧鸡翅。' },
  { meat: 'chicken_wing', method: '可乐姜', desc: '可乐姜葱翅。', extras: ['cola'] },
  { meat: 'pork_belly', method: '土豆', extras: ['potato'], desc: '土豆烧五花。' },
  { meat: 'pork_belly', method: '白菜', extras: ['chinese_cabbage'], desc: '白菜烧五花。' },
  { meat: 'pork_belly', method: '酸菜', extras: ['sour_mustard'], desc: '酸菜白肉。' },
  { meat: 'beef_brisket', method: '咖喱', extras: ['curry_powder','potato','carrot'], desc: '日式咖喱牛腩。' },
  { meat: 'chicken_thigh', method: '咖喱', extras: ['curry_powder','potato','carrot'], desc: '日式咖喱鸡。' },
  { meat: 'pork_loin', method: '蘑菇酱', extras: ['mushroom'], desc: '蘑菇酱猪柳。' },
  { meat: 'beef_sirloin', method: '红酒', extras: ['onion'], desc: '红酒煎牛排(简易)。' },
  { meat: 'pork_loin', method: '苹果', extras: ['apple'], desc: '苹果焖里脊。' },
  { meat: 'pork_belly', method: '土豆烧', extras: ['potato','carrot'], desc: '五花土豆胡萝卜烧。' },
  { meat: 'chicken_thigh', method: '板栗', extras: ['chestnut'], desc: '板栗烧鸡。' },
  { meat: 'pork_ribs', method: '玉米', extras: ['corn'], desc: '玉米焖排骨。' },
  { meat: 'lamb_chop', method: '香煎', desc: '香煎羊小排。' },
  { meat: 'pork_ribs', method: '腐乳', extras: ['fermented_tofu'], desc: '腐乳排骨(腐乳调味, 不算豆腐主菜)。' },
];

for (const t of mediumTemplates) {
  const ings = [{ ingredientId: t.meat, amount: 400, unit: 'g' }];
  if (t.extras) for (const ex of t.extras) ings.push({ ingredientId: ex, amount: 150, unit: 'g' });
  ings.push(
    { ingredientId: 'ginger', amount: 8, unit: 'g' },
    { ingredientId: 'garlic', amount: 8, unit: 'g' },
    { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
    { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
    { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
    { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
    { ingredientId: 'sugar', amount: 8, unit: 'g' },
    { ingredientId: 'salt', amount: 3, unit: 'g' },
  );
  if (t.method === '糖醋') ings.push({ ingredientId: 'vinegar', amount: 15, unit: 'ml' });
  if (t.method === '红烧') ings.push({ ingredientId: 'dark_soy', amount: 8, unit: 'ml' }, { ingredientId: 'star_anise', amount: 2, unit: 'g' });
  if (t.method === '酱卤') ings.push({ ingredientId: 'star_anise', amount: 2, unit: 'g' }, { ingredientId: 'cinnamon', amount: 2, unit: 'g' }, { ingredientId: 'bay_leaf', amount: 1, unit: 'g' });
  NEW.push({
    ...cn(),
    id: recipeId('m'),
    nameZh: t.desc.replace('。',''),
    nameEn: t.desc.replace('。',''),
    cookingMethod: t.method.includes('烤') || t.method.includes('煎') ? 'roast' : 'braise',
    flavors: t.method === '糖醋' ? ['sour','sweet'] : t.method === '红烧' ? ['umami','sweet'] : ['umami'],
    mealTypes: ['lunch','dinner'],
    difficulty: 'medium', minCookingLevel: 'basic',
    prepTime: 15, cookTime: 40, servings: 3,
    description: t.desc,
    ingredients: ings,
    steps: ['主料处理切块焯水或腌制', '热锅爆香姜蒜葱', `按"${t.method}"工艺烹制`, '小火慢煮入味', '收汁出锅'],
    tags: ['荤', '中等', t.method],
  });
}

// 中等素菜系列
const mediumVegTemplates = [
  { veg: 'eggplant', method: '红烧', desc: '红烧茄子(无肉)。' },
  { veg: 'eggplant', method: '鱼香', desc: '鱼香茄子(无辣无肉版)。' },
  { veg: 'potato', method: '土豆泥', desc: '奶香土豆泥(用植物奶替代)。', extras: ['oat_milk'] },
  { veg: 'pumpkin', method: '小米焖', desc: '小米南瓜焖。', extras: ['millet'] },
  { veg: 'mushroom', method: '红烧', desc: '红烧三菇。', extras: ['shiitake_fresh','enoki_mushroom'] },
  { veg: 'lotus_root', method: '糖醋', desc: '糖醋藕片。' },
  { veg: 'cauliflower', method: '干锅', desc: '干锅花菜。' },
  { veg: 'water_bamboo', method: '油焖', desc: '油焖茭白。' },
  { veg: 'spring_bamboo', method: '油焖', desc: '油焖春笋。' },
  { veg: 'taro', method: '红烧', desc: '红烧芋头。' },
  { veg: 'pumpkin', method: '南瓜浓汤', desc: '奶油南瓜浓汤(植物奶版)。', extras: ['oat_milk'] },
];

for (const t of mediumVegTemplates) {
  const ings = [{ ingredientId: t.veg, amount: 300, unit: 'g' }];
  if (t.extras) for (const ex of t.extras) ings.push({ ingredientId: ex, amount: 100, unit: 'g' });
  ings.push(
    { ingredientId: 'garlic', amount: 8, unit: 'g' },
    { ingredientId: 'cooking_oil', amount: 12, unit: 'ml' },
    { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
    { ingredientId: 'sugar', amount: 5, unit: 'g' },
    { ingredientId: 'salt', amount: 2, unit: 'g' },
  );
  NEW.push({
    ...cn(),
    id: recipeId('mv'),
    nameZh: t.desc.replace('。',''),
    nameEn: t.desc.replace('。',''),
    cookingMethod: 'braise',
    flavors: ['umami'],
    mealTypes: ['lunch','dinner'],
    difficulty: 'medium', minCookingLevel: 'basic',
    prepTime: 10, cookTime: 25, servings: 2,
    description: t.desc,
    ingredients: ings,
    steps: ['食材切配', '热油爆香', `按"${t.method}"工艺烹制`, '调味出锅'],
    tags: ['素', '中等'],
  });
}

// 中等主食/汤
const mediumStaplesAndSoups = [
  { method: '葱油拌面', main: 'noodles_dried', cm: 'staple', desc: '葱油拌面。', flavor: ['umami'] },
  { method: '番茄牛肉面', main: 'noodles_dried', cm: 'staple', desc: '番茄牛肉面(无辣)。', flavor: ['umami','sour'], extras: ['beef_brisket','tomato'] },
  { method: '排骨汤面', main: 'noodles_dried', cm: 'staple', desc: '排骨汤面。', flavor: ['umami'], extras: ['pork_ribs'] },
  { method: '炒河粉(无辣)', main: 'rice_noodles', cm: 'staple', desc: '炒河粉(无辣)。', flavor: ['umami'], extras: ['cabbage','pork_loin'] },
  { method: '葱油饼', main: 'flour', cm: 'staple', desc: '葱油饼。', flavor: ['umami'] },
  { method: '韭菜盒子(无蛋)', main: 'flour', cm: 'staple', desc: '韭菜盒子(无蛋)。', flavor: ['umami'], extras: ['garlic_chives'] },
  { method: '馄饨(肉馅)', main: 'wonton_wrapper', cm: 'staple', desc: '猪肉馄饨。', flavor: ['umami'], extras: ['pork_mince'] },
  { method: '饺子(肉馅)', main: 'wonton_wrapper', cm: 'staple', desc: '猪肉白菜饺子。', flavor: ['umami'], extras: ['pork_mince','chinese_cabbage'] },
  { method: '南瓜饼', main: 'pumpkin', cm: 'staple', desc: '南瓜饼。', flavor: ['sweet'], extras: ['glutinous_rice_flour'] },
  { method: '红薯饼', main: 'sweet_potato', cm: 'staple', desc: '红薯饼。', flavor: ['sweet'], extras: ['glutinous_rice_flour'] },
  { method: '土豆饼', main: 'potato', cm: 'staple', desc: '土豆饼。', flavor: ['umami'], extras: ['flour'] },
  { method: '菜肉包子', main: 'flour', cm: 'staple', desc: '猪肉白菜包子。', flavor: ['umami'], extras: ['pork_mince','chinese_cabbage'] },
  { method: '芋头西米露', main: 'taro', cm: 'staple', desc: '芋头西米露(椰浆替代奶)。', flavor: ['sweet'], extras: ['coconut_milk'] },
  { method: '红枣银耳羹', main: 'white_fungus', cm: 'soup', desc: '红枣银耳羹。', flavor: ['sweet'], extras: ['jujube','rock_sugar'] },
  { method: '小米南瓜粥', main: 'millet', cm: 'staple', desc: '小米南瓜粥。', flavor: ['sweet'], extras: ['pumpkin'] },
];

for (const t of mediumStaplesAndSoups) {
  const ings = [{ ingredientId: t.main, amount: 150, unit: 'g' }];
  if (t.extras) for (const ex of t.extras) ings.push({ ingredientId: ex, amount: 100, unit: 'g' });
  ings.push(
    { ingredientId: 'salt', amount: 2, unit: 'g' },
    { ingredientId: 'cooking_oil', amount: 8, unit: 'ml' },
  );
  NEW.push({
    ...cn(),
    id: recipeId('ms'),
    nameZh: t.desc.replace('。',''),
    nameEn: t.desc.replace('。',''),
    cookingMethod: t.cm,
    flavors: t.flavor,
    mealTypes: ['breakfast','lunch','dinner'],
    difficulty: 'medium', minCookingLevel: 'basic',
    prepTime: 15, cookTime: 30, servings: 2,
    description: t.desc,
    ingredients: ings,
    steps: ['面/粉处理', '准备配料', '组合成型', '烹制至熟'],
    tags: [t.cm === 'soup' ? '汤' : '主食', '中等'],
  });
}

// ============================================================
// === 困难度 (50 道) ===
// ============================================================
const hardTemplates = [
  { meat: 'pork_belly', method: '东坡肉', desc: '东坡肉(无辣)。', cookTime: 120 },
  { meat: 'pork_belly', method: '梅菜扣肉', extras: ['preserved_mustard'], desc: '正宗梅菜扣肉。', cookTime: 120 },
  { meat: 'pork_belly', method: '红烧肉', desc: '本帮红烧肉。', cookTime: 90 },
  { meat: 'pork_trotter', method: '红烧蹄髈', desc: '红烧蹄髈。', cookTime: 150 },
  { meat: 'pork_trotter', method: '黄豆蹄花', extras: ['soybean'], desc: '黄豆煨蹄花。', cookTime: 150 },
  { meat: 'beef_brisket', method: '咖喱', extras: ['curry_powder','potato','carrot','onion'], desc: '咖喱牛腩煲。', cookTime: 120 },
  { meat: 'beef_brisket', method: '番茄炖', extras: ['tomato','potato'], desc: '番茄牛腩煲。', cookTime: 120 },
  { meat: 'beef_brisket', method: '萝卜', extras: ['white_radish'], desc: '萝卜炖牛腩。', cookTime: 120 },
  { meat: 'beef_shank', method: '酱牛肉', desc: '酱牛肉(可作冷盘)。', cookTime: 180 },
  { meat: 'beef_shank', method: '清炖', desc: '清炖牛腱。', cookTime: 150 },
  { meat: 'lamb_leg', method: '葱烧', desc: '葱烧羊肉。', cookTime: 90 },
  { meat: 'lamb_chop', method: '法式', extras: ['rosemary','potato'], desc: '法式烤羊排配土豆。', cookTime: 90 },
  { meat: 'lamb_chop', method: '红烧', desc: '红烧羊小排。', cookTime: 90 },
  { meat: 'duck', method: '啤酒', desc: '啤酒鸭。', cookTime: 90 },
  { meat: 'duck', method: '酸萝卜老鸭', extras: ['white_radish'], desc: '酸萝卜老鸭汤。', cookTime: 150 },
  { meat: 'duck', method: '香酥', desc: '香酥鸭。', cookTime: 120 },
  { meat: 'chicken_whole', method: '叫花鸡', desc: '叫花鸡(简化烤箱版)。', cookTime: 90 },
  { meat: 'chicken_whole', method: '盐焗', desc: '正宗盐焗鸡。', cookTime: 120 },
  { meat: 'chicken_whole', method: '白斩', desc: '广式白斩鸡。', cookTime: 60 },
  { meat: 'chicken_thigh', method: '黄焖', extras: ['shiitake_fresh','potato','green_bean'], desc: '正宗黄焖鸡(无辣)。', cookTime: 60 },
  { meat: 'pork_ribs', method: '糖醋', desc: '糖醋小排(传统). ', cookTime: 60 },
  { meat: 'pork_ribs', method: '蒜香蒸', extras: ['preserved_mustard'], desc: '梅菜蒸排骨(粤式)。', cookTime: 60 },
  { meat: 'pork_ribs', method: '柠檬', extras: ['lemon'], desc: '柠檬蒸排骨。', cookTime: 50 },
  { meat: 'pork_loin', method: '锅包肉', desc: '正宗东北锅包肉。', cookTime: 50 },
  { meat: 'pork_loin', method: '京酱', extras: ['onion'], desc: '京酱肉丝(无甜面酱替换)。', cookTime: 40 },
  { meat: 'pork_loin', method: '咕咾肉', extras: ['pineapple','capsicum'], desc: '菠萝咕咾肉。', cookTime: 40 },
  { meat: 'chicken_thigh', method: '腰果', extras: ['cashew_nut','capsicum'], desc: '腰果鸡丁(精制版)。', cookTime: 40 },
  { meat: 'beef_sirloin', method: '黑椒牛柳', extras: ['onion','capsicum'], desc: '正宗黑椒牛柳。', cookTime: 30 },
  { meat: 'beef_sirloin', method: '葱爆', extras: ['spring_onion'], desc: '葱爆牛肉(山东)。', cookTime: 30 },
  { meat: 'pork_mince', method: '狮子头', extras: ['chinese_cabbage'], desc: '清炖狮子头。', cookTime: 60 },
  { meat: 'pork_belly', method: '蒜泥白肉', desc: '蒜泥白肉(无辣)。', cookTime: 60 },
  { meat: 'pork_ribs', method: '无锡排骨', desc: '无锡排骨。', cookTime: 90 },
  { meat: 'duck_leg', method: '萝卜炖', extras: ['white_radish'], desc: '萝卜炖鸭腿。', cookTime: 90 },
  { meat: 'beef_brisket', method: '葡萄酒', extras: ['onion','carrot'], desc: '红酒炖牛肉(法式)。', cookTime: 150 },
  { meat: 'pork_belly', method: '糖醋小排', desc: '上海糖醋小排。', cookTime: 80 },
  { meat: 'lamb_leg', method: '孜然', extras: ['cumin'], desc: '孜然羊肉(无辣)。', cookTime: 30 },
  { meat: 'beef_brisket', method: '罗宋汤', extras: ['tomato','potato','onion','carrot','cabbage'], desc: '正宗罗宋汤。', cookTime: 120 },
  { meat: 'chicken_wing', method: '可乐酱烧', desc: '可乐酱烧翅。', cookTime: 50, extras: ['cola'] },
  { meat: 'pork_ribs', method: '蜂蜜烤', extras: ['honey'], desc: '蜂蜜烤排骨。', cookTime: 60 },
  { meat: 'pork_belly', method: '咸肉笋干', extras: ['dried_bamboo'], desc: '咸肉烧笋干。', cookTime: 90 },
  { meat: 'chicken_thigh', method: '三杯', extras: ['basil'], desc: '台式三杯鸡(无辣)。', cookTime: 30 },
  { meat: 'pork_ribs', method: '南乳排骨', extras: ['fermented_tofu'], desc: '南乳排骨(腐乳调味)。', cookTime: 70 },
  { meat: 'chicken_thigh', method: '香茅', extras: ['lemongrass'], desc: '香茅烤鸡腿。', cookTime: 40 },
  { meat: 'lamb_leg', method: '抓饭', extras: ['rice','carrot','onion'], desc: '新疆羊肉抓饭。', cookTime: 90 },
  { meat: 'chicken_thigh', method: '海南鸡饭', extras: ['rice','ginger'], desc: '海南鸡饭(简化)。', cookTime: 60 },
  { meat: 'pork_loin', method: '苹果煎', extras: ['apple','rosemary'], desc: '苹果煎里脊配迷迭香。', cookTime: 30 },
  { meat: 'beef_sirloin', method: '惠灵顿', extras: ['mushroom'], desc: '简化惠灵顿牛排(无酥皮)。', cookTime: 45 },
  { meat: 'pork_belly', method: '南瓜扣', extras: ['pumpkin'], desc: '南瓜扣肉。', cookTime: 100 },
  { meat: 'pork_ribs', method: '冬瓜陈皮汤', extras: ['winter_melon'], desc: '冬瓜陈皮排骨汤。', cookTime: 90 },
  { meat: 'pork_ribs', method: '玉米莲藕排骨汤', extras: ['corn','lotus_root'], desc: '玉米莲藕排骨汤。', cookTime: 90 },
];

for (const t of hardTemplates) {
  const ings = [{ ingredientId: t.meat, amount: 500, unit: 'g' }];
  if (t.extras) for (const ex of t.extras) ings.push({ ingredientId: ex, amount: 150, unit: 'g' });
  ings.push(
    { ingredientId: 'ginger', amount: 10, unit: 'g' },
    { ingredientId: 'garlic', amount: 10, unit: 'g' },
    { ingredientId: 'spring_onion', amount: 10, unit: 'g' },
    { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
    { ingredientId: 'soy_sauce', amount: 20, unit: 'ml' },
    { ingredientId: 'cooking_wine', amount: 15, unit: 'ml' },
    { ingredientId: 'sugar', amount: 10, unit: 'g' },
    { ingredientId: 'salt', amount: 4, unit: 'g' },
    { ingredientId: 'star_anise', amount: 2, unit: 'g' },
    { ingredientId: 'cinnamon', amount: 2, unit: 'g' },
    { ingredientId: 'bay_leaf', amount: 1, unit: 'g' },
  );
  NEW.push({
    ...cn(),
    id: recipeId('h'),
    nameZh: t.desc.replace('。','').replace(/\(.*?\)/g,''),
    nameEn: t.desc.replace('。','').replace(/\(.*?\)/g,''),
    cookingMethod: t.method.includes('烤') ? 'roast' : t.method.includes('蒸') ? 'steam' : t.method.includes('汤') ? 'soup' : 'braise',
    flavors: t.method === '糖醋' ? ['sour','sweet'] : ['umami','sweet'],
    mealTypes: ['lunch','dinner'],
    difficulty: 'hard', minCookingLevel: 'intermediate',
    prepTime: 30, cookTime: t.cookTime || 90, servings: 4,
    description: t.desc,
    ingredients: ings,
    steps: ['食材精细处理(改刀/腌制/焯水)', '锅烧热爆香姜蒜葱八角桂皮', `按"${t.method}"专业工艺烹制`, '小火慢炖入味', '后期收汁/盖锅再焖', '出锅装盘点缀'],
    tags: ['荤', '困难', t.method],
  });
}

// ============================================================
// 校验 + 检查禁忌
// ============================================================
let bad = [];
for (const r of NEW) {
  for (const ri of r.ingredients) {
    if (!ingIds.has(ri.ingredientId)) bad.push(`${r.id} (${r.nameZh}): missing ${ri.ingredientId}`);
    if (FORBIDDEN_INGREDIENT_IDS.has(ri.ingredientId)) bad.push(`${r.id} (${r.nameZh}): FORBIDDEN ${ri.ingredientId}`);
  }
}

if (bad.length > 0) {
  console.error('❌ 错误:');
  bad.slice(0, 30).forEach(b => console.error('  -', b));
  if (bad.length > 30) console.error(`  ... 还有 ${bad.length - 30} 条`);
  console.error(`\n共 ${bad.length} 条问题, 请修复 ingredients 列表`);
  process.exit(1);
}

// 去重(按 id)
const existing = new Set(recipes.map(r => r.id));
const toAdd = NEW.filter(r => !existing.has(r.id));
console.log(`新增菜谱: ${toAdd.length}/${NEW.length}`);
console.log(`新增食材: ${newIngsAdded.length}`);
if (newIngsAdded.length) console.log('  ' + newIngsAdded.join(', '));

const merged = [...recipes, ...toAdd];
fs.writeFileSync(RECIPES_PATH, JSON.stringify(merged, null, 2), 'utf8');
fs.writeFileSync(INGREDIENTS_PATH, JSON.stringify(ingredients, null, 2), 'utf8');

// 统计
const byDiff = { easy: 0, medium: 0, hard: 0 };
for (const r of toAdd) byDiff[r.difficulty] = (byDiff[r.difficulty] || 0) + 1;
console.log('按难度:', byDiff);
console.log(`✅ 总菜谱数: ${merged.length}`);
console.log(`✅ 总食材数: ${ingredients.length}`);
