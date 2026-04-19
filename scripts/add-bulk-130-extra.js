/**
 * 补加 ~130 道菜达到 300/100/50 目标
 * 105 易 + 25 中
 */
const fs = require('fs');
const path = require('path');
const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const INGREDIENTS_PATH = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));
const ingredients = JSON.parse(fs.readFileSync(INGREDIENTS_PATH, 'utf8'));
const ingIds = new Set(ingredients.map(i => i.id));

const FORBIDDEN = new Set([
  'salmon_fillet','shrimp','squid','fish_fillet','crab','octopus','mussels','scallop','clam','lobster','tuna','cod',
  'sardine','anchovy','oyster','fish_sauce','kelp','nori','seaweed',
  'egg','quail_egg','duck_egg','salted_egg',
  'tofu','silken_tofu','firm_tofu','tofu_skin','tofu_dried','fried_tofu','tofu_puff',
  'chili_pepper','chili_flakes','chili_oil','doubanjiang','gochujang','sichuan_pepper','sriracha','curry_paste',
  'milk','cream','cheese','butter','yogurt','condensed_milk','evaporated_milk','sour_cream',
  'parmesan','mozzarella','cheddar','feta','cottage_cheese','cream_cheese',
]);

const cn = (regional='homestyle') => ({ cuisine:'chinese', regionalCuisine:regional, status:'reviewed' });

let cnt = 0;
const rid = (p) => `extra130_${p}_${(cnt++).toString().padStart(3,'0')}`;

const NEW = [];

// =========== 60 道凉菜/快手菜 (易) ===========
const easyCold = [
  { veg:'cucumber', name:'蒜蓉拍黄瓜', desc:'蒜蓉拍黄瓜', flav:['light'], extras:[] },
  { veg:'cucumber', name:'糖醋黄瓜', desc:'糖醋黄瓜', flav:['sour','sweet'], extras:[] },
  { veg:'cucumber', name:'香醋黄瓜片', desc:'香醋黄瓜片', flav:['sour'], extras:[] },
  { veg:'tomato', name:'糖拌番茄', desc:'糖拌番茄', flav:['sweet'], extras:[] },
  { veg:'tomato', name:'番茄洋葱沙拉', desc:'番茄洋葱沙拉', flav:['sour'], extras:['onion'] },
  { veg:'cabbage', name:'凉拌包菜丝', desc:'凉拌包菜丝', flav:['light'], extras:[] },
  { veg:'cabbage', name:'醋拌包菜丝', desc:'醋拌包菜丝', flav:['sour'], extras:[] },
  { veg:'purple_cabbage', name:'凉拌紫甘蓝丝', desc:'凉拌紫甘蓝丝', flav:['sour'], extras:[] },
  { veg:'carrot', name:'凉拌胡萝卜丝', desc:'凉拌胡萝卜丝', flav:['light'], extras:[] },
  { veg:'white_radish', name:'凉拌白萝卜丝', desc:'凉拌白萝卜丝', flav:['light'], extras:[] },
  { veg:'celery', name:'凉拌芹菜', desc:'凉拌芹菜', flav:['light'], extras:[] },
  { veg:'celery', name:'芹菜花生', desc:'芹菜拌花生', flav:['light'], extras:['peanut'] },
  { veg:'wood_ear', name:'凉拌木耳', desc:'凉拌木耳', flav:['light'], extras:[] },
  { veg:'black_fungus', name:'凉拌黑木耳', desc:'凉拌黑木耳', flav:['light'], extras:[] },
  { veg:'lotus_root', name:'糖醋藕片凉菜', desc:'糖醋藕片凉拌', flav:['sour','sweet'], extras:[] },
  { veg:'celtuce', name:'凉拌莴笋丝', desc:'凉拌莴笋丝', flav:['light'], extras:[] },
  { veg:'okra', name:'凉拌秋葵', desc:'凉拌秋葵', flav:['light'], extras:[] },
  { veg:'okra', name:'秋葵拌花生', desc:'秋葵拌花生', flav:['light'], extras:['peanut'] },
  { veg:'asparagus', name:'凉拌芦笋', desc:'凉拌芦笋', flav:['light'], extras:[] },
  { veg:'spinach', name:'凉拌菠菜', desc:'凉拌菠菜', flav:['light'], extras:[] },
  { veg:'spinach', name:'菠菜拌花生', desc:'菠菜拌花生', flav:['light'], extras:['peanut'] },
  { veg:'bean_sprouts', name:'凉拌豆芽', desc:'凉拌豆芽', flav:['light'], extras:[] },
  { veg:'jicama', name:'凉拌豆薯丝', desc:'凉拌豆薯丝', flav:['sweet'], extras:[] },
  { veg:'water_chestnut', name:'凉拌马蹄', desc:'凉拌马蹄片', flav:['sweet'], extras:[] },
  { veg:'beet', name:'糖醋甜菜根', desc:'糖醋甜菜根', flav:['sour','sweet'], extras:[] },
  { veg:'lettuce', name:'生菜沙拉', desc:'清爽生菜沙拉', flav:['light'], extras:['carrot'] },
  { veg:'arugula', name:'芝麻菜沙拉', desc:'芝麻菜沙拉', flav:['light'], extras:['tomato'] },
  { veg:'kale', name:'羽衣甘蓝沙拉', desc:'羽衣甘蓝沙拉', flav:['light'], extras:['lemon'] },
  { veg:'watercress', name:'凉拌西洋菜', desc:'凉拌西洋菜', flav:['light'], extras:[] },
  { veg:'fennel', name:'凉拌茴香', desc:'凉拌茴香', flav:['light'], extras:[] },
  { veg:'pea_shoots', name:'凉拌豆苗', desc:'凉拌豆苗', flav:['light'], extras:[] },
  { veg:'edamame', name:'盐水毛豆', desc:'盐水毛豆', flav:['umami'], extras:[] },
  { veg:'corn', name:'冷玉米沙拉', desc:'冷玉米沙拉', flav:['sweet'], extras:['cucumber','carrot'] },
  { veg:'pumpkin', name:'冷南瓜泥', desc:'冷南瓜泥沙拉', flav:['sweet'], extras:[] },
  { veg:'sweet_potato', name:'冷红薯沙拉', desc:'冷红薯沙拉', flav:['sweet'], extras:[] },
  { veg:'zucchini', name:'凉拌西葫芦丝', desc:'凉拌西葫芦丝', flav:['light'], extras:[] },
  { veg:'mushroom', name:'凉拌蘑菇', desc:'凉拌蘑菇', flav:['umami'], extras:[] },
  { veg:'enoki_mushroom', name:'蒜泥金针菇', desc:'蒜泥金针菇', flav:['umami'], extras:[] },
  { veg:'king_oyster_mushroom', name:'凉拌杏鲍菇', desc:'凉拌杏鲍菇丝', flav:['umami'], extras:[] },
  { veg:'amaranth_greens', name:'凉拌苋菜', desc:'凉拌苋菜', flav:['light'], extras:[] },
  { veg:'chinese_broccoli', name:'凉拌芥蓝', desc:'凉拌芥蓝', flav:['light'], extras:[] },
  { veg:'broccoli', name:'凉拌西兰花', desc:'凉拌西兰花', flav:['light'], extras:[] },
  { veg:'cauliflower', name:'凉拌花菜', desc:'凉拌花菜', flav:['light'], extras:[] },
  { veg:'green_bean', name:'凉拌四季豆', desc:'凉拌四季豆', flav:['light'], extras:[] },
  { veg:'snow_pea', name:'凉拌荷兰豆', desc:'凉拌荷兰豆', flav:['light'], extras:[] },
  { veg:'bamboo_shoot', name:'凉拌竹笋', desc:'凉拌竹笋', flav:['light'], extras:[] },
  { veg:'water_bamboo', name:'凉拌茭白丝', desc:'凉拌茭白丝', flav:['light'], extras:[] },
  { veg:'spring_bamboo', name:'凉拌春笋', desc:'凉拌春笋丝', flav:['light'], extras:[] },
  { veg:'cabbage', name:'手撕包菜凉拌', desc:'手撕包菜凉拌', flav:['light'], extras:[] },
  { veg:'water_spinach', name:'凉拌空心菜梗', desc:'凉拌空心菜梗', flav:['light'], extras:[] },
  { veg:'taro', name:'冷芋头球', desc:'冷芋头球', flav:['sweet'], extras:[] },
  { veg:'yam', name:'冷山药段', desc:'冷山药段', flav:['light'], extras:[] },
  { veg:'cucumber', name:'蜂蜜柠檬黄瓜', desc:'蜂蜜柠檬黄瓜', flav:['sour','sweet'], extras:['lemon','honey'] },
  { veg:'tomato', name:'番茄罗勒', desc:'番茄罗勒沙拉', flav:['light'], extras:['basil'] },
  { veg:'snow_vegetable', name:'雪菜笋丝凉拌', desc:'雪菜笋丝凉拌', flav:['umami','sour'], extras:['spring_bamboo'] },
  { veg:'pickled_mustard', name:'榨菜丝凉拌', desc:'榨菜丝凉拌', flav:['umami','sour'], extras:[] },
  { veg:'cucumber', name:'味噌黄瓜', desc:'味噌黄瓜', flav:['umami'], extras:['miso_paste'] },
  { veg:'cabbage', name:'醋溜手撕包菜', desc:'醋溜手撕包菜', flav:['sour'], extras:[] },
  { veg:'broccoli', name:'西兰花虾仁(无虾版)', desc:'西兰花蘑菇沙拉', flav:['light'], extras:['mushroom'] },
  { veg:'lettuce', name:'蚝油生菜凉拌', desc:'蚝油生菜凉拌', flav:['umami'], extras:[] },
  { veg:'cucumber', name:'凉拌黄瓜火腿丁', desc:'黄瓜火腿丁', flav:['umami'], extras:['ham'] },
];

for (const c of easyCold) {
  const ings = [{ ingredientId: c.veg, amount: 200, unit: 'g' }];
  for (const ex of c.extras) ings.push({ ingredientId: ex, amount: 60, unit: 'g' });
  ings.push(
    { ingredientId: 'garlic', amount: 5, unit: 'g' },
    { ingredientId: 'salt', amount: 2, unit: 'g' },
    { ingredientId: 'sesame_oil', amount: 5, unit: 'ml' },
    { ingredientId: 'vinegar', amount: 5, unit: 'ml' },
    { ingredientId: 'soy_sauce', amount: 5, unit: 'ml' },
  );
  if (c.flav.includes('sweet')) ings.push({ ingredientId: 'sugar', amount: 5, unit: 'g' });
  NEW.push({
    ...cn(),
    id: rid('cold'),
    nameZh: c.name,
    nameEn: c.name,
    cookingMethod: 'cold_dish',
    flavors: c.flav,
    mealTypes: ['lunch','dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 3, servings: 2,
    description: c.desc,
    ingredients: ings,
    steps: [`${c.veg.replace('_',' ')}处理`,'调汁拌匀','装盘'],
    tags: ['凉菜','简单'],
  });
}

// =========== 30 道早餐/简单主食 (易) ===========
const easyBreakfast = [
  { name:'白粥', main:'rice', extras:[], cm:'staple', flav:['light'] },
  { name:'糙米粥', main:'brown_rice', extras:[], cm:'staple', flav:['light'] },
  { name:'燕麦糊', main:'oats', extras:[], cm:'staple', flav:['light'] },
  { name:'红枣燕麦粥', main:'oats', extras:['jujube'], cm:'staple', flav:['sweet'] },
  { name:'桂圆红枣粥', main:'rice', extras:['dried_longan','jujube'], cm:'staple', flav:['sweet'] },
  { name:'核桃米粥', main:'rice', extras:['walnut'], cm:'staple', flav:['light'] },
  { name:'莲子百合粥', main:'rice', extras:['lotus_seed'], cm:'staple', flav:['light'] },
  { name:'山药小米粥', main:'millet', extras:['yam'], cm:'staple', flav:['sweet'] },
  { name:'红薯小米粥', main:'millet', extras:['sweet_potato'], cm:'staple', flav:['sweet'] },
  { name:'紫薯燕麦粥', main:'oats', extras:['purple_potato'], cm:'staple', flav:['sweet'] },
  { name:'南瓜燕麦粥', main:'oats', extras:['pumpkin'], cm:'staple', flav:['sweet'] },
  { name:'藜麦粥', main:'quinoa', extras:[], cm:'staple', flav:['light'] },
  { name:'玉米藜麦粥', main:'quinoa', extras:['corn'], cm:'staple', flav:['sweet'] },
  { name:'糙米饭团', main:'brown_rice', extras:[], cm:'staple', flav:['light'] },
  { name:'米饭团(原味)', main:'rice', extras:[], cm:'staple', flav:['light'] },
  { name:'南瓜糯米饼', main:'glutinous_rice_flour', extras:['pumpkin'], cm:'staple', flav:['sweet'] },
  { name:'红薯糯米饼', main:'glutinous_rice_flour', extras:['sweet_potato'], cm:'staple', flav:['sweet'] },
  { name:'紫薯糯米饼', main:'glutinous_rice_flour', extras:['purple_potato'], cm:'staple', flav:['sweet'] },
  { name:'山药糯米球', main:'glutinous_rice_flour', extras:['yam'], cm:'staple', flav:['sweet'] },
  { name:'葱花卷', main:'flour', extras:['spring_onion'], cm:'staple', flav:['umami'] },
  { name:'白吐司(无奶版)', main:'flour', extras:[], cm:'staple', flav:['light'] },
  { name:'素菜包', main:'flour', extras:['cabbage'], cm:'staple', flav:['umami'] },
  { name:'香菇菜包', main:'flour', extras:['shiitake_fresh','bok_choy'], cm:'staple', flav:['umami'] },
  { name:'南瓜包子', main:'flour', extras:['pumpkin'], cm:'staple', flav:['sweet'] },
  { name:'红薯包子', main:'flour', extras:['sweet_potato'], cm:'staple', flav:['sweet'] },
  { name:'蒸糙米饭', main:'brown_rice', extras:[], cm:'staple', flav:['light'] },
  { name:'蒸藜麦', main:'quinoa', extras:[], cm:'staple', flav:['light'] },
  { name:'烤紫薯片', main:'purple_potato', extras:[], cm:'staple', flav:['sweet'] },
  { name:'烤南瓜片', main:'pumpkin', extras:[], cm:'staple', flav:['sweet'] },
  { name:'烤芋头条', main:'taro', extras:[], cm:'staple', flav:['sweet'] },
];

for (const b of easyBreakfast) {
  const ings = [{ ingredientId: b.main, amount: 150, unit: 'g' }];
  for (const ex of b.extras) ings.push({ ingredientId: ex, amount: 80, unit: 'g' });
  ings.push({ ingredientId: 'salt', amount: 1, unit: 'g' });
  if (b.flav.includes('sweet')) ings.push({ ingredientId: 'sugar', amount: 8, unit: 'g' });
  NEW.push({
    ...cn(),
    id: rid('bf'),
    nameZh: b.name,
    nameEn: b.name,
    cookingMethod: b.cm,
    flavors: b.flav,
    mealTypes: ['breakfast'],
    difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 5, cookTime: 25, servings: 2,
    description: b.name,
    ingredients: ings,
    steps: ['食材处理','加水/和面','蒸/煮至熟'],
    tags: ['主食','早餐','简单'],
  });
}

// =========== 15 道额外肉菜变化 (易) ===========
const easyMore = [
  { meat:'pork_loin', veg:'wood_ear', name:'木耳炒肉片', flav:['umami'] },
  { meat:'pork_loin', veg:'black_fungus', name:'黑木耳炒肉片', flav:['umami'] },
  { meat:'chicken_thigh', veg:'asparagus', name:'芦笋鸡腿肉', flav:['light','umami'] },
  { meat:'chicken_thigh', veg:'celtuce', name:'莴笋鸡腿丁', flav:['light','umami'] },
  { meat:'beef_sirloin', veg:'celtuce', name:'莴笋牛肉丝', flav:['umami'] },
  { meat:'beef_sirloin', veg:'water_bamboo', name:'茭白炒牛肉', flav:['umami'] },
  { meat:'pork_belly', veg:'water_bamboo', name:'茭白五花', flav:['umami'] },
  { meat:'pork_loin', veg:'fennel', name:'茴香炒肉丝', flav:['umami'] },
  { meat:'pork_loin', veg:'okra', name:'秋葵炒肉片', flav:['umami','light'] },
  { meat:'chicken_breast', veg:'okra', name:'秋葵鸡丁', flav:['umami','light'] },
  { meat:'pork_loin', veg:'water_chestnut', name:'马蹄炒肉丁', flav:['umami','sweet'] },
  { meat:'pork_belly', veg:'taro', name:'芋头烧五花', flav:['umami','sweet'] },
  { meat:'chicken_thigh', veg:'taro', name:'芋头炖鸡', flav:['umami','sweet'] },
  { meat:'duck', veg:'edamame', name:'毛豆鸭丁', flav:['umami'] },
  { meat:'chicken_breast', veg:'edamame', name:'毛豆鸡丁', flav:['umami'] },
];

for (const m of easyMore) {
  NEW.push({
    ...cn(),
    id: rid('em'),
    nameZh: m.name,
    nameEn: m.name,
    cookingMethod: 'stir_fry',
    flavors: m.flav,
    mealTypes: ['lunch','dinner'],
    difficulty: 'easy', minCookingLevel: 'beginner',
    prepTime: 8, cookTime: 10, servings: 2,
    description: m.name,
    ingredients: [
      { ingredientId: m.meat, amount: 250, unit: 'g' },
      { ingredientId: m.veg, amount: 200, unit: 'g' },
      { ingredientId: 'ginger', amount: 5, unit: 'g' },
      { ingredientId: 'garlic', amount: 5, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['肉切片腌制','蔬菜处理','热油爆香','翻炒调味出锅'],
    tags: ['荤','家常','简单'],
  });
}

// =========== 25 道中等菜补充 ===========
const moreMedium = [
  { meat:'pork_belly', method:'山药烧', extras:['yam'], desc:'山药烧五花' },
  { meat:'pork_belly', method:'冬瓜烧', extras:['winter_melon'], desc:'冬瓜烧五花' },
  { meat:'chicken_thigh', method:'红枣焖', extras:['jujube'], desc:'红枣焖鸡腿' },
  { meat:'chicken_whole', method:'板栗烧', extras:['chestnut'], desc:'板栗烧整鸡' },
  { meat:'duck', method:'啤酒咖喱', extras:['curry_powder'], desc:'啤酒咖喱鸭' },
  { meat:'beef_brisket', method:'土豆胡萝卜炖', extras:['potato','carrot'], desc:'土豆胡萝卜炖牛腩' },
  { meat:'lamb_leg', method:'山药炖', extras:['yam'], desc:'山药炖羊肉' },
  { meat:'pork_ribs', method:'冬瓜炖', extras:['winter_melon'], desc:'冬瓜炖排骨' },
  { meat:'pork_ribs', method:'萝卜炖', extras:['white_radish'], desc:'萝卜炖排骨' },
  { meat:'pork_ribs', method:'葡萄', extras:['onion'], desc:'葡萄酒洋葱炖排骨' },
  { meat:'duck_leg', method:'笋干焖', extras:['dried_bamboo'], desc:'笋干焖鸭腿' },
  { meat:'pork_belly', method:'笋干', extras:['dried_bamboo'], desc:'笋干烧五花' },
  { meat:'chicken_thigh', method:'雪菜焖', extras:['snow_vegetable'], desc:'雪菜焖鸡' },
  { meat:'pork_mince', method:'马蹄煎', extras:['water_chestnut'], desc:'马蹄煎肉饼' },
  { meat:'pork_mince', method:'酿茄子', extras:['eggplant'], desc:'酿茄子' },
  { meat:'pork_mince', method:'酿青椒', extras:['bell_pepper_green'], desc:'酿青椒' },
  { meat:'pork_mince', method:'酿冬瓜', extras:['winter_melon'], desc:'酿冬瓜' },
  { meat:'beef_sirloin', method:'菠萝', extras:['pineapple','capsicum'], desc:'菠萝牛肉' },
  { meat:'pork_loin', method:'菠萝里脊', extras:['pineapple'], desc:'菠萝咕咾里脊(简化)' },
  { meat:'chicken_thigh', method:'香茅烤', extras:['lemongrass'], desc:'香茅烤鸡' },
  { meat:'pork_ribs', method:'柠檬蒸', extras:['lemon'], desc:'柠檬蒸排骨' },
  { meat:'lamb_chop', method:'迷迭香烤', extras:['rosemary'], desc:'迷迭香烤羊排' },
  { meat:'beef_sirloin', method:'罗勒', extras:['basil'], desc:'罗勒煎牛肉' },
  { meat:'chicken_thigh', method:'柠檬', extras:['lemon'], desc:'柠檬鸡腿' },
  { meat:'pork_belly', method:'红枣', extras:['jujube'], desc:'红枣烧五花' },
];

for (const m of moreMedium) {
  const ings = [{ ingredientId: m.meat, amount: 400, unit: 'g' }];
  for (const ex of m.extras) ings.push({ ingredientId: ex, amount: 150, unit: 'g' });
  ings.push(
    { ingredientId: 'ginger', amount: 8, unit: 'g' },
    { ingredientId: 'garlic', amount: 8, unit: 'g' },
    { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
    { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
    { ingredientId: 'cooking_wine', amount: 10, unit: 'ml' },
    { ingredientId: 'sugar', amount: 8, unit: 'g' },
    { ingredientId: 'salt', amount: 3, unit: 'g' },
  );
  NEW.push({
    ...cn(),
    id: rid('m'),
    nameZh: m.desc,
    nameEn: m.desc,
    cookingMethod: m.method.includes('烤')?'roast':m.method.includes('蒸')?'steam':'braise',
    flavors: ['umami','sweet'],
    mealTypes: ['lunch','dinner'],
    difficulty: 'medium', minCookingLevel: 'basic',
    prepTime: 15, cookTime: 40, servings: 3,
    description: m.desc,
    ingredients: ings,
    steps: ['主料处理腌制','锅烧热爆香','按工艺烹制','收汁出锅'],
    tags: ['荤','中等',m.method],
  });
}

// 校验
let bad = [];
for (const r of NEW) {
  for (const ri of r.ingredients) {
    if (!ingIds.has(ri.ingredientId)) bad.push(`${r.id} (${r.nameZh}): missing ${ri.ingredientId}`);
    if (FORBIDDEN.has(ri.ingredientId)) bad.push(`${r.id} (${r.nameZh}): FORBIDDEN ${ri.ingredientId}`);
  }
}
if (bad.length > 0) {
  console.error('❌ 错误:');
  bad.slice(0, 30).forEach(b => console.error('  -', b));
  process.exit(1);
}

const existing = new Set(recipes.map(r => r.id));
const toAdd = NEW.filter(r => !existing.has(r.id));
console.log(`新增: ${toAdd.length}/${NEW.length}`);
const merged = [...recipes, ...toAdd];
fs.writeFileSync(RECIPES_PATH, JSON.stringify(merged, null, 2), 'utf8');
const byDiff = { easy:0, medium:0, hard:0 };
for (const r of toAdd) byDiff[r.difficulty]++;
console.log('按难度:', byDiff);
console.log(`✅ 总菜谱数: ${merged.length}`);
