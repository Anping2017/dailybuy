/**
 * 批量修复 nameEn 中含中文的菜谱名(脱机字典翻译)
 */
const fs = require('fs');
const path = require('path');
const P = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(P, 'utf8'));

const DICT = {
  // 做法
  '炒': 'Stir-fried', '蒸': 'Steamed', '烤': 'Roasted', '焖': 'Braised', '烧': 'Braised',
  '煎': 'Pan-fried', '炸': 'Fried', '煮': 'Boiled', '炖': 'Stewed', '凉拌': 'Cold',
  '清炒': 'Plain Stir-fried', '蒜蓉': 'Garlic', '蚝油': 'Oyster Sauce', '糖醋': 'Sweet & Sour',
  '醋溜': 'Vinegar', '干煸': 'Dry-fried', '黑椒': 'Black Pepper', '红烧': 'Red-braised',
  '葱爆': 'Scallion', '手撕': 'Hand-torn', '糖拌': 'Sugar', '糖渍': 'Sugared', '拍': 'Smashed',
  '盐水': 'Salt-boiled', '油焖': 'Oil-braised', '可乐': 'Cola', '蜂蜜': 'Honey',
  '回锅': 'Twice-cooked', '爆炒': 'Blast-fried', '酱卤': 'Soy-stewed', '白切': 'White-cut',
  '盐焗': 'Salt-baked', '黄焖': 'Yellow-stewed', '锅包': 'Nabao', '京酱': 'Peking Sauce',
  '啤酒': 'Beer', '清炖': 'Clear Stew', '法式': 'French', '咖喱': 'Curry',
  '蒜香': 'Garlic', '葱油': 'Scallion Oil', '香煎': 'Pan-seared', '腐乳': 'Fermented Bean',
  '叫花': 'Beggar', '白斩': 'White-sliced', '南乳': 'Red Fermented Bean', '三杯': 'Three-cup',
  '香茅': 'Lemongrass', '柠檬': 'Lemon', '菠萝': 'Pineapple', '酿': 'Stuffed',
  '苹果': 'Apple', '红枣': 'Jujube', '板栗': 'Chestnut', '香酥': 'Crispy',
  '无锡': 'Wuxi-style', '南瓜': 'Pumpkin', '山药': 'Chinese Yam', '雪菜': 'Snow Vegetable',
  '梅菜': 'Preserved Mustard', '笋干': 'Dried Bamboo', '茴香': 'Fennel', '豆苗': 'Pea Shoots',
  '油麦菜': 'Indian Lettuce', '莴笋': 'Celtuce', '茭白': 'Water Bamboo',
  '孜然': 'Cumin', '罗宋': 'Borscht', '东坡': 'Dongpo', '红酒': 'Red Wine',
  '迷迭香': 'Rosemary', '罗勒': 'Basil', '惠灵顿': 'Wellington',
  '海南鸡饭': 'Hainan Chicken Rice', '抓饭': 'Pilaf', '冷': 'Cold', '热': 'Hot',
  '煲': 'Clay Pot', '羹': 'Thick Soup', '汤': 'Soup',
  // 蔬菜
  '彩椒': 'Bell Pepper', '青椒': 'Green Pepper', '番茄': 'Tomato', '土豆': 'Potato',
  '芹菜': 'Celery', '黄瓜': 'Cucumber', '洋葱': 'Onion', '西兰花': 'Broccoli',
  '花菜': 'Cauliflower', '芦笋': 'Asparagus', '莲藕': 'Lotus Root', '荷兰豆': 'Snow Peas',
  '竹笋': 'Bamboo Shoot', '春笋': 'Spring Bamboo', '香菇': 'Shiitake', '蘑菇': 'Mushroom',
  '金针菇': 'Enoki', '杏鲍菇': 'King Oyster', '平菇': 'Oyster Mushroom',
  '大白菜': 'Chinese Cabbage', '小白菜': 'Bok Choy', '包菜': 'Cabbage', '卷心菜': 'Cabbage',
  '菠菜': 'Spinach', '茄子': 'Eggplant', '西葫芦': 'Zucchini', '红薯': 'Sweet Potato',
  '紫薯': 'Purple Sweet Potato', '玉米': 'Corn', '四季豆': 'Green Beans',
  '豆芽': 'Bean Sprouts', '白萝卜': 'White Radish', '胡萝卜': 'Carrot', '南瓜': 'Pumpkin',
  '苦瓜': 'Bitter Melon', '冬瓜': 'Winter Melon', '芥蓝': 'Chinese Broccoli',
  '空心菜': 'Water Spinach', '生菜': 'Lettuce', '茼蒿': 'Chrysanthemum Greens',
  '苋菜': 'Amaranth', '韭菜': 'Leek / Chives', '韭黄': 'Yellow Chives', '蒜薹': 'Garlic Shoots',
  '榨菜': 'Pickled Mustard', '秋葵': 'Okra', '佛手瓜': 'Chayote', '丝瓜': 'Luffa',
  '木耳': 'Wood Ear', '黑木耳': 'Black Fungus', '银耳': 'Silver Ear',
  '豆薯': 'Jicama', '芋头': 'Taro', '荸荠': 'Water Chestnut', '马蹄': 'Water Chestnut',
  '紫甘蓝': 'Purple Cabbage', '羽衣甘蓝': 'Kale', '抱子甘蓝': 'Brussels Sprouts',
  '甜菜根': 'Beetroot', '芝麻菜': 'Arugula', '西洋菜': 'Watercress', '玉米笋': 'Baby Corn',
  '毛豆': 'Edamame', '豌豆': 'Peas',
  // 肉类
  '猪里脊': 'Pork Loin', '五花肉': 'Pork Belly', '猪肉末': 'Ground Pork', '排骨': 'Pork Ribs',
  '猪肉': 'Pork', '猪蹄': 'Pork Trotter', '猪肝': 'Pork Liver', '猪排': 'Pork Chop',
  '牛里脊': 'Beef Sirloin', '牛肉末': 'Ground Beef', '牛腩': 'Beef Brisket', '牛腱': 'Beef Shank',
  '牛肉': 'Beef', '整鸡': 'Whole Chicken', '鸡腿肉': 'Chicken Thigh', '鸡腿': 'Chicken Leg',
  '鸡胸肉': 'Chicken Breast', '鸡翅': 'Chicken Wing', '羊腿肉': 'Lamb Leg', '羊排': 'Lamb Chop',
  '羊肉': 'Lamb', '鸭肉': 'Duck', '鸭腿': 'Duck Leg', '鸭胸': 'Duck Breast',
  '腊肠': 'Chinese Sausage', '香肠': 'Sausage', '培根': 'Bacon', '火腿': 'Ham',
  '腰果': 'Cashew', '花生': 'Peanut', '核桃': 'Walnut', '板栗': 'Chestnut',
  // 主食
  '米饭': 'Rice', '饭': 'Rice', '面': 'Noodle', '粥': 'Porridge', '馒头': 'Mantou',
  '花卷': 'Huajuan', '包子': 'Bun', '饺子': 'Dumplings', '馄饨': 'Wonton',
  '饼': 'Cake/Pancake', '糯米': 'Glutinous Rice', '藜麦': 'Quinoa', '燕麦': 'Oats',
  '糙米': 'Brown Rice', '小米': 'Millet',
  // 特色标识
  '(1人)': '(1 serving)', '(2人)': '(2 servings)', '(3人)': '(3 servings)', '(4人)': '(4 servings)',
  '(无辣)': '(no spice)', '(无蛋)': '(no egg)', '(无肉)': '(no meat)', '(经典)': '(classic)',
  '(粤式)': '(Cantonese)', '(山东)': '(Shandong)', '(台式)': '(Taiwan)', '(简化)': '(simplified)',
  '(传统)': '(traditional)', '(简易版)': '(easy version)', '(精制版)': '(refined)',
  '(椰浆替代奶)': '(coconut milk substitute)', '(植物奶版)': '(plant milk version)',
  '(用植物奶替代)': '(plant milk)',
  // 蛋汤相关
  '蛋花': 'Egg Drop', '鸡蛋汤': 'Egg Soup', '银耳': 'Silver Ear', '红枣': 'Jujube',
  '桂圆': 'Longan', '莲子': 'Lotus Seed',
  // 凉拌
  '凉拌': 'Cold', '糖醋': 'Sweet & Sour', '味噌': 'Miso', '蜂蜜柠檬': 'Honey Lemon',
  '蒜泥': 'Garlic Paste',
  // 常用词
  ' with ': ' with ', '配': ' with ', '和': ' and ',
};

// 按长度降序排, 先替换长的避免子串冲突
const keys = Object.keys(DICT).sort((a, b) => b.length - a.length);

function translateName(nameEn) {
  let result = nameEn;
  for (const k of keys) {
    result = result.split(k).join(DICT[k]);
  }
  // 清理多余空格
  result = result.replace(/\s+/g, ' ').trim();
  // 如果仍含中文, 简单剔除(保留英文)
  result = result.replace(/[\u4e00-\u9fa5]+/g, match => `[${match}]`); // 标记未翻译
  // 如果被标记, 回退到英文+pinyin 或直接留下
  return result;
}

let fixedCount = 0;
for (const r of recipes) {
  if (/[\u4e00-\u9fa5]/.test(r.nameEn || '')) {
    const newName = translateName(r.nameEn);
    // 如果翻译后还有 [中文] 标记, 说明部分未翻译, 使用 nameZh 的拼音回退(简单起见用 id)
    if (/\[.*?\]/.test(newName)) {
      // 移除所有 [中文] 标记, 如果留下为空就用"Dish" + 简短描述
      const stripped = newName.replace(/\[.*?\]/g, '').trim();
      r.nameEn = stripped || `Chinese Dish`;
    } else {
      r.nameEn = newName;
    }
    fixedCount++;
  }
}

fs.writeFileSync(P, JSON.stringify(recipes, null, 2), 'utf8');
console.log(`✅ 修复 ${fixedCount} 道菜 nameEn`);
console.log('样本:');
const sample = recipes.filter(r => r.id.startsWith('bulk450_') || r.id.startsWith('gen150_') || r.id.startsWith('extra130_') || r.id.startsWith('soup_egg_')).slice(0, 8);
for (const r of sample) console.log(`  ${r.nameZh} → ${r.nameEn}`);
