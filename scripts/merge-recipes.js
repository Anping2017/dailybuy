/**
 * 菜谱合并脚本
 * 合并多个 JSON 文件 → 双重去重 (ID + nameZh) → 补 cookingMethod → 输出 recipes-all.json
 *
 * 优先级规则：靠前的文件优先级更高，同 ID 或同菜名时保留更高优先级的版本。
 *
 * 优先级顺序 (高 → 低):
 *   quality-c     — 精修菜谱 (19)
 *   quality-b     — 审核菜谱 (168)
 *   chinese-2     — 新批中餐 (114)
 *   mega-3        — 大批量 (500)
 *   international — 国际菜系 (100)
 *   chinese-1     — 旧批中餐 (100)
 *   hot-1/2/3     — 热门 (270)
 *   recipes.json  — 原始种子 (20)
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// 加载食材 ID 列表（用于校验）
const ingredients = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const validIngredientIds = new Set(ingredients.map(i => i.id));

// 按优先级排列（先加载的优先）
const FILES = [
  { file: 'recipes-quality-e.json', source: 'quality-e' },
  { file: 'recipes-quality-d.json', source: 'quality-d' },
  { file: 'recipes-quality-c.json', source: 'quality-c' },
  { file: 'recipes-quality-b.json', source: 'quality-b' },
  { file: 'recipes-chinese-2.json', source: 'chinese-2' },
  { file: 'recipes-mega-3.json', source: 'mega-3' },
  { file: 'recipes-international.json', source: 'international' },
  { file: 'recipes-chinese-1.json', source: 'chinese-1' },
  { file: 'recipes-hot-1.json', source: 'hot-1' },
  { file: 'recipes-hot-2.json', source: 'hot-2' },
  { file: 'recipes-hot-3.json', source: 'hot-3' },
  { file: 'recipes.json', source: 'original' },
];

// regionalCuisine 归一化：中文 / 俗称 → 英文 slug
// 统一分类以便筛选 / 统计 / 前端展示
const REGION_ALIAS = {
  家常: 'homestyle',
  广式: 'cantonese',
  北方: 'northern',
  四川: 'sichuan',
  湖南: 'hunan',
  江浙: 'jiangzhe',
  上海: 'shanghai',
  扬州: 'jiangsu',
  武汉: 'hubei',
  湖北: 'hubei',
  闽南: 'fujian',
  台式: 'taiwanese',
  南方: 'southern',
  新疆: 'xinjiang',
  兰州: 'lanzhou',
};

function normalizeRegion(region) {
  if (!region) return region;
  return REGION_ALIAS[region] || region;
}

// 基于菜名 / 步骤自动推断 cookingMethod
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
  return 'stir_fry';
}

// 校验菜谱，返回 issues 列表
function validateRecipe(recipe) {
  const issues = [];
  const required = ['id', 'nameZh', 'nameEn', 'cuisine', 'regionalCuisine', 'flavors', 'mealTypes', 'difficulty', 'minCookingLevel', 'ingredients', 'steps'];
  for (const f of required) {
    const v = recipe[f];
    if (v === undefined || v === null || (Array.isArray(v) && v.length === 0) || v === '') {
      issues.push(`缺失字段: ${f}`);
    }
  }
  for (const ing of (recipe.ingredients || [])) {
    if (!validIngredientIds.has(ing.ingredientId)) {
      issues.push(`无效食材ID: ${ing.ingredientId}`);
    }
  }
  if (typeof recipe.servings === 'number' && recipe.servings <= 0) issues.push('servings<=0');
  if (typeof recipe.prepTime === 'number' && recipe.prepTime < 0) issues.push('prepTime<0');
  if (typeof recipe.cookTime === 'number' && recipe.cookTime < 0) issues.push('cookTime<0');
  return issues;
}

function merge() {
  const allRecipes = [];
  const seenIds = new Set();
  const seenNames = new Set();
  const skipped = { dupId: 0, dupName: 0 };
  let totalLoaded = 0;
  const skipExamples = [];

  for (const { file, source } of FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ 文件不存在，跳过: ${file}`);
      continue;
    }
    const recipes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`📂 加载 ${file.padEnd(32)} ${recipes.length} 道`);
    totalLoaded += recipes.length;

    for (const recipe of recipes) {
      if (seenIds.has(recipe.id)) {
        skipped.dupId++;
        if (skipExamples.length < 10) skipExamples.push(`[ID重复] ${recipe.id} 在 ${source} 被跳过`);
        continue;
      }
      if (seenNames.has(recipe.nameZh)) {
        skipped.dupName++;
        if (skipExamples.length < 20) skipExamples.push(`[菜名重复] ${recipe.nameZh} (${recipe.id}/${source}) 被跳过`);
        continue;
      }
      seenIds.add(recipe.id);
      seenNames.add(recipe.nameZh);

      // 补字段
      if (!recipe.cookingMethod) recipe.cookingMethod = inferCookingMethod(recipe);
      recipe.regionalCuisine = normalizeRegion(recipe.regionalCuisine);
      recipe.status = recipe.status || 'reviewed';
      recipe.source = recipe.source || source;

      // 校验
      const issues = validateRecipe(recipe);
      if (issues.length > 0) recipe.dataIssues = issues;
      else delete recipe.dataIssues;

      allRecipes.push(recipe);
    }
  }

  // 统计
  const stats = {
    total: allRecipes.length,
    reviewed: allRecipes.filter(r => r.status === 'reviewed').length,
    pending: allRecipes.filter(r => r.status === 'pending').length,
    withIssues: allRecipes.filter(r => r.dataIssues && r.dataIssues.length > 0).length,
    byMethod: {}, byCuisine: {}, byRegion: {}, bySource: {},
    byMeal: { breakfast: 0, lunch: 0, dinner: 0 },
    byDifficulty: {},
  };
  for (const r of allRecipes) {
    stats.byMethod[r.cookingMethod] = (stats.byMethod[r.cookingMethod] || 0) + 1;
    stats.byCuisine[r.cuisine] = (stats.byCuisine[r.cuisine] || 0) + 1;
    stats.byRegion[r.regionalCuisine] = (stats.byRegion[r.regionalCuisine] || 0) + 1;
    stats.bySource[r.source] = (stats.bySource[r.source] || 0) + 1;
    stats.byDifficulty[r.difficulty] = (stats.byDifficulty[r.difficulty] || 0) + 1;
    for (const m of (r.mealTypes || [])) stats.byMeal[m] = (stats.byMeal[m] || 0) + 1;
  }

  const outPath = path.join(DATA_DIR, 'recipes-all.json');
  fs.writeFileSync(outPath, JSON.stringify(allRecipes, null, 2));

  console.log('\n========== 合并结果 ==========');
  console.log(`总加载: ${totalLoaded} | ID重复跳过: ${skipped.dupId} | 菜名重复跳过: ${skipped.dupName}`);
  console.log(`最终菜谱数: ${stats.total}`);
  console.log(`  已审核: ${stats.reviewed}, 待审核: ${stats.pending}, 有问题: ${stats.withIssues}`);
  console.log(`\n按来源:`, stats.bySource);
  console.log(`\n按菜系:`, stats.byCuisine);
  console.log(`\n按做法:`, stats.byMethod);
  console.log(`\n按难度:`, stats.byDifficulty);
  console.log(`\n按餐次:`, stats.byMeal);
  console.log(`\n地方菜系 Top 15:`);
  const topRegions = Object.entries(stats.byRegion).sort((a, b) => b[1] - a[1]).slice(0, 15);
  for (const [r, c] of topRegions) console.log(`  ${r.padEnd(20)} ${c}`);

  if (skipExamples.length > 0) {
    console.log(`\n去重示例 (前 ${skipExamples.length}):`);
    for (const ex of skipExamples) console.log(`  ${ex}`);
  }

  if (stats.withIssues > 0) {
    console.log(`\n⚠ 数据问题示例:`);
    const issueSample = allRecipes.filter(r => r.dataIssues && r.dataIssues.length > 0).slice(0, 10);
    for (const r of issueSample) console.log(`  ${r.id}(${r.source}): ${r.dataIssues.join('; ')}`);
  }

  console.log(`\n✅ 已写入: ${outPath}`);
}

merge();
