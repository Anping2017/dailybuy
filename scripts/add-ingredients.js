/**
 * 向 ingredients.json 批量追加新食材（跳过已存在 ID）
 * 一次性脚本 — 运行后可保留供未来再次扩充
 */
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const existing = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const existingIds = new Set(existing.map(i => i.id));

const NEW_INGREDIENTS = [
  // === 肉类 8 ===
  { id: "chicken_whole", nameZh: "整鸡", nameEn: "Whole Chicken", category: "meat",
    nutrition: { calories: 215, protein: 18.6, fat: 15, carbs: 0, fiber: 0, sodium: 70, sugar: 0 },
    priceNZD: 8.99, unit: "kg", healthTags: ["high_protein"], season: [] },
  { id: "duck", nameZh: "鸭肉", nameEn: "Duck", category: "meat",
    nutrition: { calories: 337, protein: 19, fat: 28, carbs: 0, fiber: 0, sodium: 59, sugar: 0 },
    priceNZD: 14.99, unit: "kg", healthTags: ["high_fat"], season: [] },
  { id: "duck_leg", nameZh: "鸭腿", nameEn: "Duck Leg", category: "meat",
    nutrition: { calories: 211, protein: 18, fat: 15, carbs: 0, fiber: 0, sodium: 70, sugar: 0 },
    priceNZD: 15.99, unit: "kg", healthTags: [], season: [] },
  { id: "lamb_chop", nameZh: "羊排", nameEn: "Lamb Chop", category: "meat",
    nutrition: { calories: 294, protein: 25, fat: 21, carbs: 0, fiber: 0, sodium: 72, sugar: 0 },
    priceNZD: 24.99, unit: "kg", healthTags: ["high_protein", "high_fat"], season: [] },
  { id: "beef_brisket", nameZh: "牛腩", nameEn: "Beef Brisket", category: "meat",
    nutrition: { calories: 280, protein: 19, fat: 22, carbs: 0, fiber: 0, sodium: 55, sugar: 0 },
    priceNZD: 18.99, unit: "kg", healthTags: ["high_protein", "high_fat"], season: [] },
  { id: "beef_shank", nameZh: "牛腱", nameEn: "Beef Shank", category: "meat",
    nutrition: { calories: 201, protein: 22, fat: 12, carbs: 0, fiber: 0, sodium: 66, sugar: 0 },
    priceNZD: 19.99, unit: "kg", healthTags: ["high_protein"], season: [] },
  { id: "pork_trotter", nameZh: "猪蹄", nameEn: "Pork Trotter", category: "meat",
    nutrition: { calories: 256, protein: 22, fat: 19, carbs: 0, fiber: 0, sodium: 75, sugar: 0 },
    priceNZD: 7.99, unit: "kg", healthTags: ["high_collagen"], season: [] },
  { id: "pork_liver", nameZh: "猪肝", nameEn: "Pork Liver", category: "meat",
    nutrition: { calories: 134, protein: 21, fat: 3.7, carbs: 2.5, fiber: 0, sodium: 87, sugar: 0 },
    priceNZD: 6.99, unit: "kg", healthTags: ["high_iron", "high_cholesterol", "high_purine"], season: [] },

  // === 海鲜 7 ===
  { id: "oyster", nameZh: "生蚝", nameEn: "Oyster", category: "seafood",
    nutrition: { calories: 81, protein: 9.5, fat: 2.3, carbs: 4.6, fiber: 0, sodium: 106, sugar: 0 },
    priceNZD: 29.99, unit: "dozen", healthTags: ["high_purine", "allergen_shellfish", "high_zinc"], season: ["winter"] },
  { id: "cod", nameZh: "鳕鱼", nameEn: "Cod Fillet", category: "seafood",
    nutrition: { calories: 82, protein: 18, fat: 0.7, carbs: 0, fiber: 0, sodium: 54, sugar: 0 },
    priceNZD: 32.99, unit: "kg", healthTags: ["high_protein", "low_fat"], season: [] },
  { id: "tuna_canned", nameZh: "金枪鱼罐头", nameEn: "Canned Tuna", category: "seafood",
    nutrition: { calories: 116, protein: 26, fat: 0.8, carbs: 0, fiber: 0, sodium: 247, sugar: 0 },
    priceNZD: 2.99, unit: "can", healthTags: ["high_protein"], season: [] },
  { id: "eel", nameZh: "鳗鱼", nameEn: "Eel", category: "seafood",
    nutrition: { calories: 184, protein: 18.4, fat: 11.7, carbs: 0, fiber: 0, sodium: 51, sugar: 0 },
    priceNZD: 39.99, unit: "kg", healthTags: ["high_protein", "high_vitamin_a"], season: [] },
  { id: "snapper", nameZh: "红鲷鱼", nameEn: "Snapper", category: "seafood",
    nutrition: { calories: 100, protein: 20.5, fat: 1.3, carbs: 0, fiber: 0, sodium: 64, sugar: 0 },
    priceNZD: 27.99, unit: "kg", healthTags: ["high_protein", "low_fat"], season: ["autumn", "winter"] },
  { id: "sea_cucumber", nameZh: "海参", nameEn: "Sea Cucumber", category: "seafood",
    nutrition: { calories: 56, protein: 13, fat: 0.4, carbs: 0, fiber: 0, sodium: 400, sugar: 0 },
    priceNZD: 99.99, unit: "kg", healthTags: ["high_protein", "high_collagen"], season: [] },
  { id: "fish_head", nameZh: "鱼头", nameEn: "Fish Head", category: "seafood",
    nutrition: { calories: 115, protein: 17, fat: 5, carbs: 0, fiber: 0, sodium: 60, sugar: 0 },
    priceNZD: 6.99, unit: "kg", healthTags: [], season: [] },

  // === 蛋奶 5 ===
  { id: "quail_egg", nameZh: "鹌鹑蛋", nameEn: "Quail Egg", category: "egg_dairy",
    nutrition: { calories: 158, protein: 13, fat: 11, carbs: 0.4, fiber: 0, sodium: 141, sugar: 0.4 },
    priceNZD: 5.99, unit: "pack", healthTags: ["allergen_egg"], season: [] },
  { id: "salted_egg", nameZh: "咸鸭蛋", nameEn: "Salted Duck Egg", category: "egg_dairy",
    nutrition: { calories: 190, protein: 12.7, fat: 13, carbs: 6.3, fiber: 0, sodium: 1429, sugar: 0 },
    priceNZD: 1.99, unit: "piece", healthTags: ["allergen_egg", "high_sodium", "high_cholesterol"], season: [] },
  { id: "preserved_egg", nameZh: "皮蛋", nameEn: "Century Egg", category: "egg_dairy",
    nutrition: { calories: 171, protein: 13, fat: 12, carbs: 3, fiber: 0, sodium: 543, sugar: 1 },
    priceNZD: 1.99, unit: "piece", healthTags: ["allergen_egg", "high_sodium"], season: [] },
  { id: "mozzarella", nameZh: "马苏里拉", nameEn: "Mozzarella Cheese", category: "egg_dairy",
    nutrition: { calories: 280, protein: 28, fat: 17, carbs: 3.1, fiber: 0, sodium: 627, sugar: 1 },
    priceNZD: 12.99, unit: "kg", healthTags: ["allergen_dairy"], season: [] },
  { id: "parmesan", nameZh: "帕玛森干酪", nameEn: "Parmesan Cheese", category: "egg_dairy",
    nutrition: { calories: 431, protein: 38, fat: 29, carbs: 4.1, fiber: 0, sodium: 1529, sugar: 0.9 },
    priceNZD: 29.99, unit: "kg", healthTags: ["allergen_dairy", "high_sodium"], season: [] },

  // === 豆类 7 ===
  { id: "silken_tofu", nameZh: "内酯豆腐/嫩豆腐", nameEn: "Silken Tofu", category: "bean",
    nutrition: { calories: 55, protein: 4.8, fat: 2.7, carbs: 2, fiber: 0.2, sodium: 7, sugar: 0.6 },
    priceNZD: 3.49, unit: "piece", healthTags: ["high_protein", "low_calorie", "allergen_soy"], season: [] },
  { id: "chickpea", nameZh: "鹰嘴豆", nameEn: "Chickpea", category: "bean",
    nutrition: { calories: 364, protein: 19, fat: 6, carbs: 61, fiber: 17, sodium: 24, sugar: 11 },
    priceNZD: 5.99, unit: "kg", healthTags: ["high_protein", "high_fiber"], season: [] },
  { id: "red_bean", nameZh: "红豆", nameEn: "Adzuki Bean", category: "bean",
    nutrition: { calories: 329, protein: 20, fat: 0.5, carbs: 63, fiber: 13, sodium: 5, sugar: 0 },
    priceNZD: 6.99, unit: "kg", healthTags: ["high_protein", "high_fiber"], season: [] },
  { id: "mung_bean", nameZh: "绿豆", nameEn: "Mung Bean", category: "bean",
    nutrition: { calories: 347, protein: 24, fat: 1.2, carbs: 63, fiber: 16, sodium: 15, sugar: 7 },
    priceNZD: 6.99, unit: "kg", healthTags: ["high_protein", "high_fiber"], season: [] },
  { id: "kidney_bean", nameZh: "红腰豆", nameEn: "Kidney Bean", category: "bean",
    nutrition: { calories: 333, protein: 24, fat: 0.8, carbs: 60, fiber: 25, sodium: 24, sugar: 2.3 },
    priceNZD: 5.99, unit: "kg", healthTags: ["high_protein", "high_fiber"], season: [] },
  { id: "lentil", nameZh: "小扁豆", nameEn: "Lentil", category: "bean",
    nutrition: { calories: 353, protein: 25, fat: 1, carbs: 60, fiber: 31, sodium: 6, sugar: 2 },
    priceNZD: 5.99, unit: "kg", healthTags: ["high_protein", "high_fiber"], season: [] },
  { id: "soybean", nameZh: "黄豆", nameEn: "Soybean", category: "bean",
    nutrition: { calories: 446, protein: 36, fat: 20, carbs: 30, fiber: 9, sodium: 2, sugar: 7 },
    priceNZD: 4.99, unit: "kg", healthTags: ["high_protein", "allergen_soy"], season: [] },

  // === 谷物 7 ===
  { id: "glutinous_rice", nameZh: "糯米", nameEn: "Glutinous Rice", category: "grain",
    nutrition: { calories: 370, protein: 6.8, fat: 0.7, carbs: 82, fiber: 2.8, sodium: 5, sugar: 0 },
    priceNZD: 4.99, unit: "kg", healthTags: ["high_gi"], season: [] },
  { id: "cornmeal", nameZh: "玉米粉", nameEn: "Cornmeal", category: "grain",
    nutrition: { calories: 362, protein: 8, fat: 3.6, carbs: 77, fiber: 7, sodium: 35, sugar: 1.5 },
    priceNZD: 4.99, unit: "kg", healthTags: [], season: [] },
  { id: "millet", nameZh: "小米", nameEn: "Millet", category: "grain",
    nutrition: { calories: 378, protein: 11, fat: 4.2, carbs: 73, fiber: 8.5, sodium: 5, sugar: 0 },
    priceNZD: 7.99, unit: "kg", healthTags: ["high_fiber"], season: [] },
  { id: "quinoa", nameZh: "藜麦", nameEn: "Quinoa", category: "grain",
    nutrition: { calories: 368, protein: 14, fat: 6, carbs: 64, fiber: 7, sodium: 5, sugar: 0 },
    priceNZD: 12.99, unit: "kg", healthTags: ["high_protein", "high_fiber", "gluten_free"], season: [] },
  { id: "rice_cake_korean", nameZh: "韩式年糕", nameEn: "Korean Rice Cake / Tteok", category: "grain",
    nutrition: { calories: 234, protein: 4, fat: 0.4, carbs: 53, fiber: 0.8, sodium: 8, sugar: 0 },
    priceNZD: 6.99, unit: "pack", healthTags: ["high_gi"], season: [] },
  { id: "udon_noodles", nameZh: "乌冬面", nameEn: "Udon Noodles", category: "grain",
    nutrition: { calories: 127, protein: 3.9, fat: 0.6, carbs: 27, fiber: 1.3, sodium: 245, sugar: 0.5 },
    priceNZD: 4.99, unit: "pack", healthTags: ["allergen_gluten"], season: [] },
  { id: "tortilla", nameZh: "墨西哥饼", nameEn: "Tortilla", category: "grain",
    nutrition: { calories: 218, protein: 5.7, fat: 2.9, carbs: 45, fiber: 3.2, sodium: 377, sugar: 1.6 },
    priceNZD: 5.99, unit: "pack", healthTags: ["allergen_gluten"], season: [] },

  // === 蔬菜 15 ===
  { id: "yam", nameZh: "山药", nameEn: "Chinese Yam", category: "vegetable",
    nutrition: { calories: 118, protein: 1.5, fat: 0.2, carbs: 28, fiber: 4, sodium: 9, sugar: 0.5 },
    priceNZD: 7.99, unit: "kg", healthTags: ["high_fiber"], season: ["autumn", "winter"] },
  { id: "taro", nameZh: "芋头", nameEn: "Taro", category: "vegetable",
    nutrition: { calories: 112, protein: 1.5, fat: 0.2, carbs: 26, fiber: 4.1, sodium: 11, sugar: 0.4 },
    priceNZD: 5.99, unit: "kg", healthTags: ["high_fiber"], season: [] },
  { id: "water_chestnut", nameZh: "荸荠/马蹄", nameEn: "Water Chestnut", category: "vegetable",
    nutrition: { calories: 97, protein: 1.4, fat: 0.1, carbs: 24, fiber: 3, sodium: 14, sugar: 5 },
    priceNZD: 6.99, unit: "kg", healthTags: [], season: ["winter"] },
  { id: "pickled_mustard", nameZh: "榨菜", nameEn: "Preserved Mustard / Zha Cai", category: "vegetable",
    nutrition: { calories: 29, protein: 2.1, fat: 0.3, carbs: 4.5, fiber: 2, sodium: 1350, sugar: 1.5 },
    priceNZD: 1.99, unit: "pack", healthTags: ["high_sodium"], season: [] },
  { id: "okra", nameZh: "秋葵", nameEn: "Okra", category: "vegetable",
    nutrition: { calories: 33, protein: 1.9, fat: 0.2, carbs: 7.5, fiber: 3.2, sodium: 7, sugar: 1.5 },
    priceNZD: 7.99, unit: "kg", healthTags: ["high_fiber"], season: ["summer"] },
  { id: "garlic_sprout", nameZh: "蒜薹", nameEn: "Garlic Sprout", category: "vegetable",
    nutrition: { calories: 34, protein: 2.1, fat: 0.2, carbs: 7, fiber: 1.8, sodium: 3, sugar: 0.6 },
    priceNZD: 4.99, unit: "kg", healthTags: [], season: ["spring"] },
  { id: "mint", nameZh: "薄荷", nameEn: "Mint", category: "vegetable",
    nutrition: { calories: 70, protein: 3.8, fat: 0.9, carbs: 15, fiber: 8, sodium: 31, sugar: 0 },
    priceNZD: 3.49, unit: "bunch", healthTags: [], season: [] },
  { id: "fennel", nameZh: "茴香", nameEn: "Fennel", category: "vegetable",
    nutrition: { calories: 31, protein: 1.2, fat: 0.2, carbs: 7.3, fiber: 3.1, sodium: 52, sugar: 3.9 },
    priceNZD: 5.99, unit: "kg", healthTags: [], season: [] },
  { id: "water_spinach", nameZh: "空心菜", nameEn: "Water Spinach / Ong Choy", category: "vegetable",
    nutrition: { calories: 19, protein: 2.6, fat: 0.2, carbs: 3.1, fiber: 2.1, sodium: 113, sugar: 0 },
    priceNZD: 5.99, unit: "kg", healthTags: ["high_iron"], season: ["summer"] },
  { id: "chinese_broccoli", nameZh: "芥蓝", nameEn: "Chinese Broccoli / Gai Lan", category: "vegetable",
    nutrition: { calories: 22, protein: 1.2, fat: 0.8, carbs: 3.3, fiber: 2.2, sodium: 7, sugar: 0.9 },
    priceNZD: 5.99, unit: "kg", healthTags: ["high_fiber"], season: [] },
  { id: "pea", nameZh: "豌豆", nameEn: "Green Peas", category: "vegetable",
    nutrition: { calories: 81, protein: 5.4, fat: 0.4, carbs: 14, fiber: 5.1, sodium: 5, sugar: 5.7 },
    priceNZD: 4.99, unit: "kg", healthTags: ["high_fiber", "high_protein"], season: ["spring"] },
  { id: "king_oyster_mushroom", nameZh: "杏鲍菇", nameEn: "King Oyster Mushroom", category: "vegetable",
    nutrition: { calories: 35, protein: 2.3, fat: 0.2, carbs: 6.4, fiber: 2.4, sodium: 7, sugar: 1.5 },
    priceNZD: 6.99, unit: "kg", healthTags: ["high_fiber"], season: [] },
  { id: "oyster_mushroom", nameZh: "平菇", nameEn: "Oyster Mushroom", category: "vegetable",
    nutrition: { calories: 33, protein: 3.3, fat: 0.4, carbs: 6.1, fiber: 2.3, sodium: 18, sugar: 1.1 },
    priceNZD: 5.99, unit: "kg", healthTags: ["high_fiber"], season: [] },
  { id: "lotus_seed", nameZh: "莲子", nameEn: "Lotus Seed", category: "vegetable",
    nutrition: { calories: 89, protein: 4.1, fat: 0.5, carbs: 17.3, fiber: 5, sodium: 1, sugar: 0.3 },
    priceNZD: 12.99, unit: "kg", healthTags: [], season: [] },
  { id: "beet", nameZh: "甜菜根", nameEn: "Beetroot", category: "vegetable",
    nutrition: { calories: 43, protein: 1.6, fat: 0.2, carbs: 9.6, fiber: 2.8, sodium: 78, sugar: 6.8 },
    priceNZD: 4.99, unit: "kg", healthTags: ["high_fiber"], season: [] },

  // === 调味 15 ===
  { id: "balsamic_vinegar", nameZh: "意大利香醋", nameEn: "Balsamic Vinegar", category: "seasoning",
    nutrition: { calories: 88, protein: 0.5, fat: 0, carbs: 17, fiber: 0, sodium: 23, sugar: 15 },
    priceNZD: 8.99, unit: "bottle", healthTags: [], season: [] },
  { id: "rice_vinegar", nameZh: "米醋", nameEn: "Rice Vinegar", category: "seasoning",
    nutrition: { calories: 18, protein: 0.1, fat: 0, carbs: 0.04, fiber: 0, sodium: 5, sugar: 0 },
    priceNZD: 4.99, unit: "bottle", healthTags: [], season: [] },
  { id: "sesame_paste", nameZh: "芝麻酱", nameEn: "Sesame Paste / Tahini", category: "seasoning",
    nutrition: { calories: 595, protein: 17, fat: 54, carbs: 21, fiber: 9.3, sodium: 115, sugar: 0.5 },
    priceNZD: 8.99, unit: "bottle", healthTags: ["allergen_sesame"], season: [] },
  { id: "peanut_butter", nameZh: "花生酱", nameEn: "Peanut Butter", category: "seasoning",
    nutrition: { calories: 588, protein: 25, fat: 50, carbs: 20, fiber: 6, sodium: 459, sugar: 9 },
    priceNZD: 6.99, unit: "bottle", healthTags: ["allergen_nut"], season: [] },
  { id: "miso_paste", nameZh: "味噌", nameEn: "Miso Paste", category: "seasoning",
    nutrition: { calories: 199, protein: 12, fat: 6, carbs: 26, fiber: 5.4, sodium: 3728, sugar: 6.2 },
    priceNZD: 9.99, unit: "pack", healthTags: ["high_sodium", "allergen_soy"], season: [] },
  { id: "gochujang", nameZh: "韩式辣酱", nameEn: "Gochujang", category: "seasoning",
    nutrition: { calories: 245, protein: 5.5, fat: 1.2, carbs: 54, fiber: 5.5, sodium: 2035, sugar: 34 },
    priceNZD: 8.99, unit: "pack", healthTags: ["high_sodium", "allergen_soy"], season: [] },
  { id: "bay_leaf", nameZh: "香叶", nameEn: "Bay Leaf", category: "seasoning",
    nutrition: { calories: 313, protein: 7.6, fat: 8.4, carbs: 75, fiber: 26, sodium: 23, sugar: 0 },
    priceNZD: 3.99, unit: "pack", healthTags: [], season: [] },
  { id: "rosemary", nameZh: "迷迭香", nameEn: "Rosemary", category: "seasoning",
    nutrition: { calories: 131, protein: 3.3, fat: 5.9, carbs: 21, fiber: 14, sodium: 26, sugar: 0 },
    priceNZD: 3.49, unit: "bunch", healthTags: [], season: [] },
  { id: "thyme", nameZh: "百里香", nameEn: "Thyme", category: "seasoning",
    nutrition: { calories: 101, protein: 5.6, fat: 1.7, carbs: 24, fiber: 14, sodium: 9, sugar: 0 },
    priceNZD: 3.49, unit: "bunch", healthTags: [], season: [] },
  { id: "cinnamon", nameZh: "肉桂", nameEn: "Cinnamon", category: "seasoning",
    nutrition: { calories: 247, protein: 4, fat: 1.2, carbs: 81, fiber: 53, sodium: 10, sugar: 2.2 },
    priceNZD: 4.99, unit: "bottle", healthTags: [], season: [] },
  { id: "coconut_milk", nameZh: "椰浆", nameEn: "Coconut Milk", category: "seasoning",
    nutrition: { calories: 230, protein: 2.3, fat: 24, carbs: 5.5, fiber: 2.2, sodium: 15, sugar: 3.3 },
    priceNZD: 3.49, unit: "can", healthTags: ["high_fat"], season: [] },
  { id: "fermented_tofu", nameZh: "腐乳", nameEn: "Fermented Tofu", category: "seasoning",
    nutrition: { calories: 116, protein: 8.4, fat: 8, carbs: 3, fiber: 0.3, sodium: 2868, sugar: 0 },
    priceNZD: 4.99, unit: "jar", healthTags: ["high_sodium", "allergen_soy"], season: [] },
  { id: "hoisin_sauce", nameZh: "海鲜酱", nameEn: "Hoisin Sauce", category: "seasoning",
    nutrition: { calories: 220, protein: 3.3, fat: 3.2, carbs: 44, fiber: 2.6, sodium: 1615, sugar: 29 },
    priceNZD: 4.99, unit: "bottle", healthTags: ["high_sodium", "allergen_soy"], season: [] },
  { id: "fermented_black_bean", nameZh: "豆豉", nameEn: "Fermented Black Bean / Douchi", category: "seasoning",
    nutrition: { calories: 150, protein: 11, fat: 4.8, carbs: 15, fiber: 4, sodium: 2040, sugar: 0 },
    priceNZD: 4.99, unit: "pack", healthTags: ["high_sodium", "allergen_soy"], season: [] },
  { id: "sweet_chili_sauce", nameZh: "泰式甜辣酱", nameEn: "Sweet Chili Sauce", category: "seasoning",
    nutrition: { calories: 175, protein: 0.3, fat: 0.1, carbs: 44, fiber: 0.4, sodium: 612, sugar: 40 },
    priceNZD: 4.99, unit: "bottle", healthTags: ["high_sodium", "high_sugar"], season: [] },

  // === 油 2 ===
  { id: "peanut_oil", nameZh: "花生油", nameEn: "Peanut Oil", category: "oil",
    nutrition: { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sodium: 0, sugar: 0 },
    priceNZD: 11.99, unit: "L", healthTags: ["allergen_nut"], season: [] },
  { id: "lard", nameZh: "猪油", nameEn: "Lard", category: "oil",
    nutrition: { calories: 902, protein: 0, fat: 100, carbs: 0, fiber: 0, sodium: 0, sugar: 0 },
    priceNZD: 6.99, unit: "kg", healthTags: ["high_fat"], season: [] },

  // === 水果 2 ===
  { id: "pineapple", nameZh: "菠萝", nameEn: "Pineapple", category: "fruit",
    nutrition: { calories: 50, protein: 0.5, fat: 0.1, carbs: 13, fiber: 1.4, sodium: 1, sugar: 10 },
    priceNZD: 3.99, unit: "piece", healthTags: [], season: ["summer"] },
  { id: "pomegranate", nameZh: "石榴", nameEn: "Pomegranate", category: "fruit",
    nutrition: { calories: 83, protein: 1.7, fat: 1.2, carbs: 19, fiber: 4, sodium: 3, sugar: 14 },
    priceNZD: 4.99, unit: "piece", healthTags: ["high_fiber"], season: ["autumn"] },

  // === 干货 8 ===
  { id: "goji_berry", nameZh: "枸杞", nameEn: "Goji Berry", category: "dried",
    nutrition: { calories: 349, protein: 14, fat: 0.4, carbs: 77, fiber: 13, sodium: 298, sugar: 45 },
    priceNZD: 14.99, unit: "kg", healthTags: [], season: [] },
  { id: "red_date", nameZh: "红枣", nameEn: "Jujube / Red Date", category: "dried",
    nutrition: { calories: 277, protein: 1.8, fat: 0.2, carbs: 75, fiber: 6.7, sodium: 2, sugar: 66 },
    priceNZD: 9.99, unit: "kg", healthTags: [], season: [] },
  { id: "white_fungus", nameZh: "银耳", nameEn: "White Fungus / Silver Ear", category: "dried",
    nutrition: { calories: 293, protein: 10, fat: 1.4, carbs: 73, fiber: 31, sodium: 82, sugar: 0 },
    priceNZD: 12.99, unit: "kg", healthTags: ["high_fiber"], season: [] },
  { id: "dried_scallop", nameZh: "干贝/瑶柱", nameEn: "Dried Scallop / Conpoy", category: "dried",
    nutrition: { calories: 290, protein: 66, fat: 3, carbs: 3, fiber: 0, sodium: 1700, sugar: 0 },
    priceNZD: 199.99, unit: "kg", healthTags: ["high_protein", "high_purine", "high_sodium"], season: [] },
  { id: "dried_lily_bud", nameZh: "黄花菜/金针", nameEn: "Dried Lily Bud", category: "dried",
    nutrition: { calories: 200, protein: 14, fat: 0.4, carbs: 60, fiber: 7.7, sodium: 59, sugar: 0 },
    priceNZD: 15.99, unit: "kg", healthTags: [], season: [] },
  { id: "chestnut", nameZh: "板栗", nameEn: "Chestnut", category: "dried",
    nutrition: { calories: 213, protein: 2.4, fat: 2.3, carbs: 46, fiber: 8.1, sodium: 3, sugar: 11 },
    priceNZD: 9.99, unit: "kg", healthTags: ["high_fiber"], season: ["autumn"] },
  { id: "walnut", nameZh: "核桃", nameEn: "Walnut", category: "dried",
    nutrition: { calories: 654, protein: 15, fat: 65, carbs: 14, fiber: 6.7, sodium: 2, sugar: 2.6 },
    priceNZD: 24.99, unit: "kg", healthTags: ["allergen_nut", "heart_healthy"], season: [] },
  { id: "cashew", nameZh: "腰果", nameEn: "Cashew", category: "dried",
    nutrition: { calories: 553, protein: 18, fat: 44, carbs: 30, fiber: 3.3, sodium: 12, sugar: 5.9 },
    priceNZD: 29.99, unit: "kg", healthTags: ["allergen_nut"], season: [] },
];

// 应用：只追加未存在的 ID
const toAdd = [];
const skipped = [];
for (const ing of NEW_INGREDIENTS) {
  if (existingIds.has(ing.id)) {
    skipped.push(ing.id);
  } else {
    toAdd.push(ing);
    existingIds.add(ing.id);
  }
}

const merged = existing.concat(toAdd);
fs.writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2));

console.log(`📦 尝试追加: ${NEW_INGREDIENTS.length} 个新食材`);
console.log(`✅ 实际追加: ${toAdd.length}`);
if (skipped.length) console.log(`⚠ 跳过已存在 ID: ${skipped.join(', ')}`);
console.log(`📊 总食材数: ${existing.length} → ${merged.length}`);

// 按类别分组统计
const byCat = {};
for (const i of merged) byCat[i.category] = (byCat[i.category] || 0) + 1;
console.log(`\n按类别:`);
for (const [c, n] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${c.padEnd(12)} ${n}`);
}
