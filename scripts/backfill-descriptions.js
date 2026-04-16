/**
 * Phase A: 描述补全脚本
 * 为所有缺 description 的菜谱生成 50-120 字中文介绍
 *
 * 策略：基于 metadata（菜名/菜系/做法/口味/主料/用餐场景）
 *      用模板 + 变体组合生成，避免千篇一律
 *
 * 原则：
 * - 不改 ID、不改食材、不改步骤
 * - 只为 description 字段为空/缺失的菜谱补齐
 * - recipes-all.json 会通过后续 merge 重新生成，这里修改源文件
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const ingredients = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const INGREDIENT_NAME = Object.fromEntries(ingredients.map(i => [i.id, i.nameZh]));

// 源文件列表（跳过 recipes-all.json — 它是生成文件）
const FILES = [
  'recipes-quality-e.json', 'recipes-quality-d.json', 'recipes-quality-c.json',
  'recipes-quality-b.json', 'recipes-chinese-2.json', 'recipes-mega-3.json',
  'recipes-international.json', 'recipes-chinese-1.json',
  'recipes-hot-1.json', 'recipes-hot-2.json', 'recipes-hot-3.json',
  'recipes.json',
];

// 做法 → 中文 + 风格描述
const METHOD_INFO = {
  stir_fry: { zh: '快炒', verb: '旺火翻炒', feel: '镬气十足' },
  boil: { zh: '水煮', verb: '清水煮制', feel: '清爽利落' },
  braise: { zh: '红烧', verb: '慢火收汁', feel: '色泽红亮、咸香浓郁' },
  stew: { zh: '炖煮', verb: '小火慢炖', feel: '软烂入味' },
  roast: { zh: '烧烤', verb: '烤箱烘烤', feel: '外焦里嫩' },
  steam: { zh: '清蒸', verb: '隔水蒸制', feel: '原汁原味' },
  deep_fry: { zh: '油炸', verb: '高温油炸', feel: '金黄酥脆' },
  dry_pot: { zh: '干锅', verb: '干煸入锅', feel: '香辣过瘾' },
  cold_dish: { zh: '凉拌', verb: '调味凉拌', feel: '清爽开胃' },
  staple: { zh: '主食', verb: '精心烹制', feel: '饱腹满足' },
  soup: { zh: '汤羹', verb: '文火慢煨', feel: '鲜美滋润' },
  pan_fry: { zh: '香煎', verb: '小火慢煎', feel: '外香内嫩' },
  simmer: { zh: '煨煮', verb: '文火煨制', feel: '汤浓味厚' },
  grill: { zh: '炭烤', verb: '明火炙烤', feel: '焦香诱人' },
  bake: { zh: '烘焙', verb: '烤箱烘焙', feel: '香气四溢' },
};

// 地方菜系 → 中文
const REGION_NAME = {
  homestyle: '家常',
  cantonese: '粤式',
  sichuan: '川菜',
  hunan: '湘菜',
  jiangsu: '苏菜',
  zhejiang: '浙菜',
  shanghai: '上海本帮',
  anhui: '徽菜',
  shandong: '鲁菜',
  fujian: '闽菜',
  taiwanese: '台式',
  northern: '北方风味',
  dongbei: '东北风味',
  southern: '南方风味',
  jiangzhe: '江浙',
  hubei: '湖北',
  xinjiang: '新疆风味',
  yunnan: '云南风味',
  lanzhou: '兰州',
  italian: '意式',
  french: '法式',
  american: '美式',
  mediterranean: '地中海风味',
  japanese: '日式',
  korean: '韩式',
  southeast_asian: '东南亚风味',
  vietnamese: '越南风味',
  thai: '泰式',
  indian: '印度风味',
  mexican: '墨西哥风味',
};

// 口味 → 中文
const FLAVOR_NAME = {
  salty: '咸香', sweet: '甘甜', sour: '酸爽', spicy: '香辣', umami: '鲜美',
  light: '清淡', rich: '浓郁', fresh: '清新', savory: '醇厚', fragrant: '芬芳',
  numbing: '麻辣', tangy: '酸甜', smoky: '烟熏', crispy: '酥脆', tender: '软嫩',
  creamy: '奶香', garlicky: '蒜香', herbaceous: '香草', citrusy: '柠香', nutty: '坚果香',
  bitter: '微苦', mellow: '绵柔', aromatic: '香气扑鼻',
};

// 餐次
const MEAL_NAME = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '小食', dessert: '甜品' };

// 难度
const DIFF_NAME = { easy: '简单快手', medium: '中等难度', hard: '讲究火候', expert: '技法考究' };

// 生成描述的主函数
function generateDescription(recipe) {
  const parts = [];

  // 1. 地域/类型定位
  const region = REGION_NAME[recipe.regionalCuisine];
  const method = METHOD_INFO[recipe.cookingMethod];

  // 2. 开头句：菜系 + 类型
  const openers = [];
  if (region) {
    if (recipe.mealTypes && recipe.mealTypes.includes('breakfast')) {
      openers.push(`${region}风味的经典早餐`);
    } else if (method && method.zh === '汤羹') {
      openers.push(`${region}经典汤品`);
    } else if (method && method.zh === '凉拌') {
      openers.push(`${region}风味凉菜`);
    } else if (method && method.zh === '主食') {
      openers.push(`${region}特色主食`);
    } else if (recipe.difficulty === 'hard' || recipe.difficulty === 'expert') {
      openers.push(`${region}宴客名菜`);
    } else {
      openers.push(`${region}家常好味`);
    }
  } else {
    openers.push('人气家常菜');
  }

  // 3. 技法 + 主料
  const topIngredients = (recipe.ingredients || [])
    .slice(0, 3)
    .map(i => INGREDIENT_NAME[i.ingredientId])
    .filter(Boolean);

  if (method && topIngredients.length > 0) {
    const ingList = topIngredients.slice(0, 2).join('配');
    parts.push(`${openers[0]}。以${ingList}为主料，${method.verb}而成`);
  } else if (method) {
    parts.push(`${openers[0]}。采用${method.zh}技法烹制`);
  } else {
    parts.push(openers[0] + '。精心烹饪');
  }

  // 4. 口味 + 风格
  const flavorText = (recipe.flavors || [])
    .slice(0, 3)
    .map(f => FLAVOR_NAME[f])
    .filter(Boolean)
    .join('、');

  if (flavorText && method) {
    parts.push(`${method.feel}，口感${flavorText}`);
  } else if (flavorText) {
    parts.push(`口感${flavorText}`);
  } else if (method) {
    parts.push(method.feel);
  }

  // 5. 场景/难度收尾
  const tailOptions = [];
  if (recipe.difficulty === 'easy' && recipe.cookTime && recipe.cookTime <= 20) {
    tailOptions.push('新手友好，快手完成');
  } else if (recipe.difficulty === 'easy') {
    tailOptions.push('操作简便，零失败');
  } else if (recipe.difficulty === 'hard' || recipe.difficulty === 'expert') {
    tailOptions.push('工序讲究，宴请体面');
  }

  if (recipe.mealTypes && recipe.mealTypes.length > 0) {
    const meals = recipe.mealTypes.map(m => MEAL_NAME[m]).filter(Boolean).join('/');
    if (meals && !parts[0].includes(meals)) tailOptions.push(`适合${meals}享用`);
  }

  if ((recipe.tags || []).includes('下饭')) tailOptions.push('极致下饭');
  else if ((recipe.tags || []).includes('家常')) tailOptions.push('家常百搭');
  else if ((recipe.tags || []).includes('宴客')) tailOptions.push('宴客撑场');
  else if ((recipe.tags || []).includes('快手')) tailOptions.push('快手搞定');

  if (tailOptions.length > 0) {
    parts.push(tailOptions[0]);
  }

  let desc = parts.join('，') + '。';

  // 控制长度 50–150 字
  if (desc.length > 150) desc = desc.slice(0, 148) + '。';
  return desc;
}

function run() {
  let totalBackfilled = 0;
  let totalExisting = 0;
  let totalRecipes = 0;

  for (const file of FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) continue;

    const recipes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let fileBackfilled = 0;
    let fileExisting = 0;

    for (const recipe of recipes) {
      totalRecipes++;
      if (recipe.description && recipe.description.trim().length > 0) {
        fileExisting++;
        totalExisting++;
      } else {
        recipe.description = generateDescription(recipe);
        fileBackfilled++;
        totalBackfilled++;
      }
    }

    if (fileBackfilled > 0) {
      fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2));
      console.log(`✏  ${file.padEnd(32)} 已有 ${fileExisting}, 新增 ${fileBackfilled}`);
    } else {
      console.log(`✓  ${file.padEnd(32)} 全部已有描述 (${fileExisting})`);
    }
  }

  console.log('\n========== 描述补全结果 ==========');
  console.log(`总菜谱扫描: ${totalRecipes}`);
  console.log(`原有描述: ${totalExisting}`);
  console.log(`新补描述: ${totalBackfilled}`);
  console.log(`覆盖率: 100% (${totalExisting + totalBackfilled}/${totalRecipes})`);
}

run();
