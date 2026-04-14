/**
 * 菜谱合并脚本
 * 合并多个JSON文件 → 去重 → 补cookingMethod → 添加status → 输出recipes-all.json
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// 加载食材ID列表用于校验
const ingredients = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const validIngredientIds = new Set(ingredients.map(i => i.id));

// 按优先级加载菜谱文件
const FILES = [
  { file: 'recipes.json', source: 'original', defaultStatus: 'reviewed' },
  { file: 'recipes-chinese-1.json', source: 'chinese-1', defaultStatus: 'reviewed' },
  { file: 'recipes-international.json', source: 'international', defaultStatus: 'reviewed' },
  { file: 'recipes-hot-1.json', source: 'hot-1', defaultStatus: 'reviewed' },
  { file: 'recipes-hot-2.json', source: 'hot-2', defaultStatus: 'reviewed' },
  { file: 'recipes-hot-3.json', source: 'hot-3', defaultStatus: 'reviewed' },
];

// cookingMethod 自动推断规则
function inferCookingMethod(recipe) {
  const text = (recipe.nameZh || '') + ' ' + (recipe.steps || []).join(' ');

  if (/干锅|铁板/.test(text)) return 'dry_pot';
  if (/凉拌|拌/.test(text)) return 'cold_dish';
  if (/汤|羹|煲汤/.test(text)) return 'soup';
  if (/蒸/.test(text)) return 'steam';
  if (/炖|煲|焖/.test(text)) return 'stew';
  if (/红烧|卤|烧/.test(text)) return 'braise';
  if (/烤|焗/.test(text)) return 'roast';
  if (/炸|煎|炕/.test(text)) return 'deep_fry';
  if (/汆|水煮|煮/.test(text)) return 'boil';
  if (/粥|饭|面|饼|包|饺|馄饨|粉/.test(text)) return 'staple';
  if (/炒/.test(text)) return 'stir_fry';

  return 'stir_fry'; // 默认
}

// 校验单道菜谱
function validateRecipe(recipe) {
  const issues = [];

  // 必填字段
  const required = ['id', 'nameZh', 'nameEn', 'cuisine', 'regionalCuisine', 'flavors', 'mealTypes', 'difficulty', 'minCookingLevel', 'ingredients', 'steps'];
  for (const f of required) {
    if (!recipe[f] || (Array.isArray(recipe[f]) && recipe[f].length === 0)) {
      issues.push(`缺失字段: ${f}`);
    }
  }

  // 食材ID校验
  for (const ing of (recipe.ingredients || [])) {
    if (!validIngredientIds.has(ing.ingredientId)) {
      issues.push(`无效食材ID: ${ing.ingredientId}`);
    }
  }

  // 异常数据
  if (recipe.servings <= 0) issues.push('份数<=0');
  if (recipe.prepTime < 0) issues.push('准备时间<0');
  if (recipe.cookTime < 0) issues.push('烹饪时间<0');

  return issues;
}

// 执行合并
function merge() {
  const allRecipes = [];
  const seenIds = new Set();
  const seenNames = new Set();
  let totalLoaded = 0;
  let duplicateIds = 0;
  let duplicateNames = 0;

  for (const { file, source, defaultStatus } of FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ 文件不存在，跳过: ${file}`);
      continue;
    }

    const recipes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`📂 加载 ${file}: ${recipes.length} 道菜`);
    totalLoaded += recipes.length;

    for (const recipe of recipes) {
      // ID去重
      if (seenIds.has(recipe.id)) {
        duplicateIds++;
        console.log(`  ⚠ ID重复，跳过: ${recipe.id} (${recipe.nameZh})`);
        continue;
      }

      // 菜名去重
      if (seenNames.has(recipe.nameZh)) {
        duplicateNames++;
        console.log(`  ⚠ 菜名重复，跳过: ${recipe.nameZh} (${recipe.id})`);
        continue;
      }

      seenIds.add(recipe.id);
      seenNames.add(recipe.nameZh);

      // 补充 cookingMethod
      if (!recipe.cookingMethod) {
        recipe.cookingMethod = inferCookingMethod(recipe);
      }

      // 添加管理字段
      recipe.status = recipe.status || defaultStatus;
      recipe.source = source;

      // 校验
      const issues = validateRecipe(recipe);
      if (issues.length > 0) {
        recipe.dataIssues = issues;
      }

      allRecipes.push(recipe);
    }
  }

  // 统计
  const stats = {
    total: allRecipes.length,
    reviewed: allRecipes.filter(r => r.status === 'reviewed').length,
    pending: allRecipes.filter(r => r.status === 'pending').length,
    withIssues: allRecipes.filter(r => r.dataIssues && r.dataIssues.length > 0).length,
    byMethod: {},
    byCuisine: {},
    byMeal: { breakfast: 0, lunch: 0, dinner: 0 },
  };

  for (const r of allRecipes) {
    stats.byMethod[r.cookingMethod] = (stats.byMethod[r.cookingMethod] || 0) + 1;
    stats.byCuisine[r.cuisine] = (stats.byCuisine[r.cuisine] || 0) + 1;
    for (const m of r.mealTypes) {
      stats.byMeal[m] = (stats.byMeal[m] || 0) + 1;
    }
  }

  // 写入
  const outPath = path.join(DATA_DIR, 'recipes-all.json');
  fs.writeFileSync(outPath, JSON.stringify(allRecipes, null, 2));

  console.log('\n========== 合并结果 ==========');
  console.log(`总加载: ${totalLoaded} | ID重复跳过: ${duplicateIds} | 菜名重复跳过: ${duplicateNames}`);
  console.log(`最终菜谱数: ${stats.total} (已审核: ${stats.reviewed}, 待审核: ${stats.pending})`);
  console.log(`有数据问题: ${stats.withIssues}`);
  console.log(`做法分布:`, stats.byMethod);
  console.log(`菜系分布:`, stats.byCuisine);
  console.log(`餐次分布:`, stats.byMeal);
  console.log(`✅ 已写入: ${outPath}`);
}

merge();
