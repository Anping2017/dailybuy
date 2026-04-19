/**
 * 添加常见简单主食到菜谱库
 * 米饭/馒头/花卷/红薯/玉米/大饼/粥等
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));

const COMMON_BASE = {
  cuisine: 'chinese',
  regionalCuisine: 'homestyle',
  cookingMethod: 'staple',
  difficulty: 'easy',
  minCookingLevel: 'beginner',
  status: 'reviewed',
};

const NEW_STAPLES = [
  // ============ 米饭类 ============
  {
    id: 'staple_plain_rice',
    nameZh: '白米饭',
    nameEn: 'Steamed White Rice',
    description: '最基础的主食，电饭煲一键搞定，配任何菜都合适。',
    flavors: ['light'],
    mealTypes: ['lunch', 'dinner'],
    prepTime: 3,
    cookTime: 25,
    servings: 4,
    ingredients: [
      { ingredientId: 'rice', amount: 300, unit: 'g' },
    ],
    steps: [
      '大米淘洗 2-3 次，沥干',
      '加水到米的 1.2 倍位置（约 360ml）',
      '电饭煲选「煮饭」模式，约 25 分钟',
      '跳保温后焖 10 分钟再开盖，米粒更松软',
    ],
    tags: ['主食', '快手菜', '新手友好'],
  },
  {
    id: 'staple_two_rice',
    nameZh: '二米饭',
    nameEn: 'Mixed Rice (White & Millet)',
    description: '大米加小米，营养更均衡，颜色金黄好看。',
    flavors: ['light'],
    mealTypes: ['lunch', 'dinner'],
    prepTime: 5,
    cookTime: 30,
    servings: 4,
    ingredients: [
      { ingredientId: 'rice', amount: 200, unit: 'g' },
      { ingredientId: 'millet', amount: 100, unit: 'g' },
    ],
    steps: [
      '大米和小米分别淘洗',
      '混合后加 1.2 倍水',
      '电饭煲煮饭模式 30 分钟',
      '焖 10 分钟开盖',
    ],
    tags: ['主食', '杂粮', '健康'],
  },
  {
    id: 'staple_brown_rice',
    nameZh: '糙米饭',
    nameEn: 'Brown Rice',
    description: '高纤维高营养，适合控糖人群和健身。',
    flavors: ['light'],
    mealTypes: ['lunch', 'dinner'],
    prepTime: 30,
    cookTime: 35,
    servings: 4,
    ingredients: [
      { ingredientId: 'brown_rice', amount: 300, unit: 'g' },
    ],
    steps: [
      '糙米提前浸泡 30 分钟（缩短煮制时间）',
      '加 1.4 倍水（糙米吸水多）',
      '电饭煲杂粮饭模式或煮 35 分钟',
      '焖 10 分钟，口感更软',
    ],
    tags: ['主食', '杂粮', '健康', '减脂'],
  },
  {
    id: 'staple_mixed_grain_rice',
    nameZh: '杂粮饭',
    nameEn: 'Multi-grain Rice',
    description: '大米、糙米、小米、燕麦混合，全谷物搭配，膳食纤维丰富。',
    flavors: ['light'],
    mealTypes: ['lunch', 'dinner'],
    prepTime: 30,
    cookTime: 35,
    servings: 4,
    ingredients: [
      { ingredientId: 'rice', amount: 150, unit: 'g' },
      { ingredientId: 'brown_rice', amount: 80, unit: 'g' },
      { ingredientId: 'millet', amount: 50, unit: 'g' },
      { ingredientId: 'oats', amount: 30, unit: 'g' },
    ],
    steps: [
      '糙米浸泡 30 分钟',
      '所有米类一起淘洗',
      '加水到米的 1.3 倍位置',
      '电饭煲杂粮饭模式或煮 35 分钟',
      '焖 10 分钟开盖',
    ],
    tags: ['主食', '杂粮', '高纤维', '健康'],
  },

  // ============ 粥类 ============
  {
    id: 'staple_plain_porridge',
    nameZh: '白粥',
    nameEn: 'Plain Rice Porridge',
    description: '清淡养胃，配咸菜或小菜都好。煮得绵软是关键。',
    flavors: ['light'],
    mealTypes: ['breakfast', 'dinner'],
    prepTime: 5,
    cookTime: 60,
    servings: 3,
    ingredients: [
      { ingredientId: 'rice', amount: 100, unit: 'g' },
    ],
    steps: [
      '大米淘洗，加 1500ml 清水',
      '大火烧开后转小火，慢熬 50 分钟',
      '期间搅动几次防粘底',
      '出锅前撒少许盐（可选）',
    ],
    tags: ['主食', '养胃', '清淡', '快手菜'],
  },
  {
    id: 'staple_millet_porridge',
    nameZh: '小米粥',
    nameEn: 'Millet Porridge',
    description: '养胃健脾，金黄黏稠的小米粥是产妇和病后调养的首选。',
    flavors: ['light'],
    mealTypes: ['breakfast', 'dinner'],
    prepTime: 5,
    cookTime: 40,
    servings: 3,
    ingredients: [
      { ingredientId: 'millet', amount: 120, unit: 'g' },
    ],
    steps: [
      '小米淘洗 1 次（多洗会损失营养）',
      '冷水下锅，加 1500ml',
      '大火煮开后转小火 30 分钟',
      '关火后焖 10 分钟，粥油会浮起',
    ],
    tags: ['主食', '养胃', '清淡'],
  },
  {
    id: 'staple_oat_porridge',
    nameZh: '燕麦粥',
    nameEn: 'Oat Porridge',
    description: '高纤低脂，控糖减脂的早餐首选，可加水果或牛奶。',
    flavors: ['light', 'sweet'],
    mealTypes: ['breakfast'],
    prepTime: 2,
    cookTime: 8,
    servings: 1,
    ingredients: [
      { ingredientId: 'oats', amount: 50, unit: 'g' },
      { ingredientId: 'milk', amount: 200, unit: 'ml' },
    ],
    steps: [
      '小锅倒入 200ml 牛奶煮开',
      '加入燕麦片',
      '小火煮 5-8 分钟，搅拌至浓稠',
      '可加蜂蜜、坚果、水果',
    ],
    tags: ['主食', '健康', '减脂', '快手菜'],
  },
  {
    id: 'staple_pumpkin_porridge',
    nameZh: '南瓜粥',
    nameEn: 'Pumpkin Porridge',
    description: '南瓜的甘甜融入米粥，清甜暖胃，金黄诱人。',
    flavors: ['sweet', 'light'],
    mealTypes: ['breakfast', 'dinner'],
    prepTime: 10,
    cookTime: 45,
    servings: 3,
    ingredients: [
      { ingredientId: 'rice', amount: 80, unit: 'g' },
      { ingredientId: 'pumpkin', amount: 250, unit: 'g' },
    ],
    steps: [
      '南瓜去皮去籽切小块',
      '大米淘洗加 1500ml 水煮开',
      '转小火煮 20 分钟后加入南瓜',
      '继续煮 20 分钟至南瓜软烂',
      '搅拌均匀，让南瓜融入粥中',
    ],
    tags: ['主食', '清淡', '养胃'],
  },
  {
    id: 'staple_red_bean_porridge',
    nameZh: '红豆粥',
    nameEn: 'Red Bean Porridge',
    description: '补血养颜，秋冬温补佳品。红豆要提前浸泡才能煮烂。',
    flavors: ['sweet', 'light'],
    mealTypes: ['breakfast', 'dinner'],
    prepTime: 240,
    cookTime: 60,
    servings: 3,
    ingredients: [
      { ingredientId: 'rice', amount: 80, unit: 'g' },
      { ingredientId: 'red_bean', amount: 80, unit: 'g' },
      { ingredientId: 'sugar', amount: 20, unit: 'g' },
    ],
    steps: [
      '红豆提前浸泡 4 小时以上（或前一晚泡）',
      '红豆下锅加足量水煮 40 分钟至开花',
      '加入大米继续煮 20 分钟',
      '加糖调味，搅匀',
    ],
    tags: ['主食', '补血', '养胃'],
  },

  // ============ 馒头/饼类 ============
  {
    id: 'staple_plain_mantou',
    nameZh: '白馒头',
    nameEn: 'Steamed White Buns',
    description: '北方常见主食，松软暄白，配粥配菜都好。',
    flavors: ['light'],
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    prepTime: 90,
    cookTime: 20,
    servings: 4,
    ingredients: [
      { ingredientId: 'flour', amount: 500, unit: 'g' },
      { ingredientId: 'sugar', amount: 10, unit: 'g' },
    ],
    steps: [
      '500g 面粉加 5g 酵母、10g 糖、260ml 温水揉成光滑面团',
      '盖湿布发酵 1 小时至 2 倍大',
      '排气揉匀，分成 8 等份搓圆',
      '二次发酵 20 分钟',
      '冷水上锅，大火蒸 15 分钟，关火焖 5 分钟再开盖',
    ],
    tags: ['主食'],
  },
  {
    id: 'staple_huajuan',
    nameZh: '葱花花卷',
    nameEn: 'Steamed Scallion Rolls',
    description: '面香葱香交融，比馒头多一份咸鲜。',
    flavors: ['salty', 'light'],
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    prepTime: 90,
    cookTime: 20,
    servings: 4,
    ingredients: [
      { ingredientId: 'flour', amount: 500, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 30, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '500g 面粉加 5g 酵母、260ml 温水揉成光滑面团，发酵 1 小时',
      '葱花切碎，与盐和油拌匀',
      '面团擀成大长方形薄片，刷油撒葱花',
      '从长边卷起，切成段，每两段叠起用筷子压一下',
      '二次发酵 20 分钟，冷水上锅蒸 15 分钟',
    ],
    tags: ['主食', '北方'],
  },
  {
    id: 'staple_homemade_pancake',
    nameZh: '家常烙饼',
    nameEn: 'Homemade Flatbread',
    description: '北方主食，外脆内软，可单吃也可卷菜。',
    flavors: ['light', 'salty'],
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    prepTime: 30,
    cookTime: 15,
    servings: 3,
    ingredients: [
      { ingredientId: 'flour', amount: 300, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 20, unit: 'ml' },
      { ingredientId: 'salt', amount: 3, unit: 'g' },
    ],
    steps: [
      '面粉加 180ml 温水和 3g 盐，揉成软面团醒 30 分钟',
      '分成 3 等份，每份擀成薄片',
      '刷一层油，撒少许盐，从一边卷起再盘成圆饼',
      '擀成薄饼，平底锅小火两面烙至金黄',
    ],
    tags: ['主食', '北方'],
  },

  // ============ 蒸/烤类（红薯/玉米） ============
  {
    id: 'staple_steamed_sweet_potato',
    nameZh: '蒸红薯',
    nameEn: 'Steamed Sweet Potato',
    description: '甘甜软糯，原味保留最多，简单又健康。',
    flavors: ['sweet', 'light'],
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    prepTime: 5,
    cookTime: 20,
    servings: 3,
    ingredients: [
      { ingredientId: 'sweet_potato', amount: 600, unit: 'g' },
    ],
    steps: [
      '红薯洗净，不去皮（皮的纤维健康）',
      '切成 2cm 厚的滚刀块（更快熟）',
      '水开后上锅蒸 20 分钟',
      '筷子轻松扎透即可',
    ],
    tags: ['主食', '健康', '减脂', '快手菜'],
  },
  {
    id: 'staple_roasted_sweet_potato',
    nameZh: '烤红薯',
    nameEn: 'Oven-roasted Sweet Potato',
    description: '烤箱版烤红薯，外焦里软流糖心，街边味道。',
    flavors: ['sweet'],
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    prepTime: 5,
    cookTime: 60,
    servings: 3,
    ingredients: [
      { ingredientId: 'sweet_potato', amount: 600, unit: 'g' },
    ],
    steps: [
      '红薯洗净擦干，整个不切',
      '烤盘铺锡纸防滴糖',
      '烤箱 200°C 烤 50-60 分钟，期间翻面 1 次',
      '筷子能扎透就好，皮焦但里面流糖心',
    ],
    tags: ['主食', '健康'],
  },
  {
    id: 'staple_steamed_corn',
    nameZh: '蒸玉米',
    nameEn: 'Steamed Corn on the Cob',
    description: '一根玉米饱腹又解馋，老少咸宜。',
    flavors: ['sweet', 'light'],
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    prepTime: 3,
    cookTime: 15,
    servings: 3,
    ingredients: [
      { ingredientId: 'corn', amount: 600, unit: 'g' },
    ],
    steps: [
      '玉米剥掉外层粗叶，留 1-2 层嫩叶（保水保香）',
      '冷水下锅，水没过玉米',
      '大火煮开后中火煮 15 分钟',
      '取出后立刻用冷水冲一下，颗粒更紧实',
    ],
    tags: ['主食', '健康', '快手菜'],
  },
];

// 检查重复 id
const existingIds = new Set(recipes.map(r => r.id));
const toAdd = NEW_STAPLES.filter(r => {
  if (existingIds.has(r.id)) {
    console.log(`⚠ 跳过已存在: ${r.id} (${r.nameZh})`);
    return false;
  }
  return true;
}).map(r => ({ ...COMMON_BASE, ...r }));

console.log(`新增 ${toAdd.length} 道简单主食`);
toAdd.forEach(r => console.log(`  + ${r.nameZh}`));

if (process.argv.includes('--write')) {
  recipes.push(...toAdd);
  fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2));
  console.log(`\n✓ 写入 ${RECIPES_PATH} (总数 ${recipes.length})`);
} else {
  console.log(`\n(dry-run, 加 --write 才会保存)`);
}
