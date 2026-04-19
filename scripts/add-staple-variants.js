/**
 * 加多规格基础主食 (1/2/3/4人份)
 * 让算法可以根据 familySize 选合适规格
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));

const base = {
  cuisine: 'chinese', regionalCuisine: 'homestyle', cookingMethod: 'staple',
  difficulty: 'easy', minCookingLevel: 'beginner', status: 'reviewed',
};

const NEW = [
  // 白米饭多规格
  {
    ...base, id: 'staple_rice_1p', nameZh: '白米饭(1人份)', nameEn: 'Rice 1-Serving',
    flavors: ['light'], mealTypes: ['lunch', 'dinner'],
    prepTime: 3, cookTime: 25, servings: 1,
    description: '电饭煲一键, 1 人份。',
    ingredients: [{ ingredientId: 'rice', amount: 80, unit: 'g' }],
    steps: ['大米淘洗', '加水到米的 1.2 倍', '煮饭模式 25 分钟'],
    tags: ['主食', '快手菜'],
  },
  {
    ...base, id: 'staple_rice_2p', nameZh: '白米饭(2人份)', nameEn: 'Rice 2-Serving',
    flavors: ['light'], mealTypes: ['lunch', 'dinner'],
    prepTime: 3, cookTime: 25, servings: 2,
    description: '电饭煲, 2 人份。',
    ingredients: [{ ingredientId: 'rice', amount: 160, unit: 'g' }],
    steps: ['大米淘洗', '加水到米的 1.2 倍', '煮饭模式 25 分钟'],
    tags: ['主食', '快手菜'],
  },
  {
    ...base, id: 'staple_rice_3p', nameZh: '白米饭(3人份)', nameEn: 'Rice 3-Serving',
    flavors: ['light'], mealTypes: ['lunch', 'dinner'],
    prepTime: 3, cookTime: 25, servings: 3,
    description: '电饭煲, 3 人份。',
    ingredients: [{ ingredientId: 'rice', amount: 240, unit: 'g' }],
    steps: ['大米淘洗', '加水到米的 1.2 倍', '煮饭模式 25 分钟'],
    tags: ['主食'],
  },
  // 馒头多规格
  {
    ...base, id: 'staple_mantou_2p', nameZh: '白馒头(2人份)', nameEn: 'Mantou 2-Serving',
    flavors: ['light'], mealTypes: ['breakfast', 'lunch', 'dinner'],
    prepTime: 90, cookTime: 15, servings: 2,
    description: '北方家常主食。',
    ingredients: [
      { ingredientId: 'flour', amount: 250, unit: 'g' },
      { ingredientId: 'sugar', amount: 5, unit: 'g' },
    ],
    steps: ['面粉加酵母糖温水揉团发酵 1 小时', '排气分 4 份搓圆', '二发 20 分钟蒸 12 分钟'],
    tags: ['主食'],
  },
  {
    ...base, id: 'staple_mantou_4p', nameZh: '白馒头(4人份)', nameEn: 'Mantou 4-Serving',
    flavors: ['light'], mealTypes: ['breakfast', 'lunch', 'dinner'],
    prepTime: 90, cookTime: 18, servings: 4,
    description: '一次蒸一锅。',
    ingredients: [
      { ingredientId: 'flour', amount: 500, unit: 'g' },
      { ingredientId: 'sugar', amount: 10, unit: 'g' },
    ],
    steps: ['面粉加酵母糖温水揉团发酵 1 小时', '排气分 8 份搓圆', '二发 20 分钟蒸 15 分钟'],
    tags: ['主食'],
  },
  // 花卷多规格
  {
    ...base, id: 'staple_huajuan_2p', nameZh: '葱花花卷(2人份)', nameEn: 'Scallion Roll 2p',
    flavors: ['salty', 'light'], mealTypes: ['breakfast', 'lunch', 'dinner'],
    prepTime: 90, cookTime: 15, servings: 2,
    description: '面香葱香, 2 人量。',
    ingredients: [
      { ingredientId: 'flour', amount: 250, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 15, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['面团发酵', '擀薄涂油撒葱盐', '卷起切段叠压', '二发蒸 12 分钟'],
    tags: ['主食', '北方'],
  },
  // 杂粮饭多规格
  {
    ...base, id: 'staple_grain_rice_1p', nameZh: '杂粮饭(1人份)', nameEn: 'Multi-grain 1p',
    flavors: ['light'], mealTypes: ['lunch', 'dinner'],
    prepTime: 30, cookTime: 35, servings: 1,
    description: '糙米+小米, 健康主食。',
    ingredients: [
      { ingredientId: 'rice', amount: 50, unit: 'g' },
      { ingredientId: 'brown_rice', amount: 25, unit: 'g' },
      { ingredientId: 'millet', amount: 15, unit: 'g' },
    ],
    steps: ['糙米浸泡', '所有米淘洗加 1.3 倍水', '杂粮饭模式 35 分钟'],
    tags: ['主食', '健康', '减脂'],
  },
  // 面条多规格
  {
    ...base, id: 'staple_plain_noodles_1p', nameZh: '清汤面(1人份)', nameEn: 'Plain Noodles 1p',
    flavors: ['light', 'salty'], mealTypes: ['breakfast', 'lunch', 'dinner'],
    prepTime: 2, cookTime: 6, servings: 1,
    description: '清汤面, 5 分钟搞定。',
    ingredients: [
      { ingredientId: 'noodles_dried', amount: 100, unit: 'g' },
      { ingredientId: 'spring_onion', amount: 5, unit: 'g' },
      { ingredientId: 'soy_sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'sesame_oil', amount: 3, unit: 'ml' },
      { ingredientId: 'salt', amount: 2, unit: 'g' },
    ],
    steps: ['水开下面煮5分钟', '碗加生抽香油盐冲热水', '面条入碗撒葱'],
    tags: ['主食', '快手菜', '清淡'],
  },
  // 烙饼多规格
  {
    ...base, id: 'staple_pancake_1p', nameZh: '家常烙饼(1人份)', nameEn: 'Flatbread 1p',
    flavors: ['light', 'salty'], mealTypes: ['breakfast', 'lunch', 'dinner'],
    prepTime: 30, cookTime: 8, servings: 1,
    description: '一个人的简易主食。',
    ingredients: [
      { ingredientId: 'flour', amount: 100, unit: 'g' },
      { ingredientId: 'cooking_oil', amount: 8, unit: 'ml' },
      { ingredientId: 'salt', amount: 1, unit: 'g' },
    ],
    steps: ['面粉温水揉软团醒30分钟', '擀薄刷油撒盐卷盘擀圆', '平底锅小火两面烙金黄'],
    tags: ['主食', '北方'],
  },
];

const existingIds = new Set(recipes.map(r => r.id));
const toAdd = NEW.filter(r => !existingIds.has(r.id));
console.log(`新增 ${toAdd.length} 道多规格主食`);
toAdd.forEach(r => console.log(`  + ${r.nameZh} [${r.servings}人份]`));

if (process.argv.includes('--write')) {
  recipes.push(...toAdd);
  fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2));
  console.log(`\n✓ 写入, 总数 ${recipes.length}`);
}
