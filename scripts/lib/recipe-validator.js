/**
 * 菜谱校验器（单条/批量通用）
 *
 * 导出的 API:
 *   validateRecipe(recipe, context)   — 返回 { issues: [{level, code, msg}], classify: {...} }
 *   buildValidationContext({recipes?, ingredients?})  — 构造上下文
 *   mergeIssues(byCode)  — 辅助统计
 *
 * 用途：
 *   - 审计脚本 scripts/audit-recipes.js 使用
 *   - 自定义菜谱前端校验（通过编译 ESM 或直接在 Node.js API 端点调用）
 *   - CI / pre-commit 钩子
 */
const { classify } = require('./recipe-classifier');

const VALID_COOKING_METHODS = new Set([
  'stir_fry', 'braise', 'stew', 'steam', 'boil', 'cold_dish', 'deep_fry',
  'roast', 'dry_pot', 'soup', 'staple', 'pan_fry', 'simmer', 'grill', 'bake',
]);
const VALID_DIFFICULTY = new Set(['easy', 'medium', 'hard', 'expert']);
const VALID_LEVELS = new Set(['beginner', 'basic', 'intermediate', 'advanced', 'expert']);
const VALID_MEAL = new Set(['breakfast', 'lunch', 'dinner']);
const VALID_CUISINE = new Set(['chinese', 'western', 'asian_other', 'fusion']);
const VALID_DISH_ROLE = new Set(['main_meat', 'main_veg', 'soup', 'staple', 'cold', 'drink', 'snack', 'side']);
const VALID_STAPLE_CAT = new Set(['rice', 'noodles', 'bread', 'congee', 'mantou']);
const VALID_DISH_STYLE = new Set(['meat', 'veg', 'egg']);

const REQUIRED_FIELDS = [
  'id', 'nameZh', 'nameEn', 'cuisine', 'regionalCuisine',
  'cookingMethod', 'flavors', 'mealTypes', 'difficulty',
  'minCookingLevel', 'ingredients', 'steps',
];

const GENERIC_TO_SPECIFIC = {
  pork: ['pork_belly', 'pork_loin', 'pork_rib', 'pork_mince', 'pork_shoulder'],
  beef: ['beef_sirloin', 'beef_brisket', 'beef_shank', 'beef_mince', 'beef_ribeye'],
  chicken: ['chicken_breast', 'chicken_thigh', 'chicken_wing', 'chicken_leg', 'chicken_whole'],
  fish: ['cod', 'salmon', 'yellow_croaker', 'mandarin_fish', 'tilapia', 'grass_carp'],
  meat: ['pork_belly', 'beef_sirloin', 'chicken_breast'],
};

const NAME_SPECIFIC_INGREDIENT = [
  { keywords: ['红烧肉', '东坡肉', '梅菜扣肉'], expect: ['pork_belly'], label: '应使用五花肉', skipIf: ['肉末', '肉丝', '肉片', '肉馅', '饭', '面', '豆腐'] },
  { keywords: ['宫保鸡丁', '辣子鸡', '口水鸡', '白斩鸡'], expect: ['chicken_breast', 'chicken_thigh', 'chicken_leg'], label: '应使用具体部位鸡肉' },
  { keywords: ['水煮牛肉', '黑椒牛柳'], expect: ['beef_sirloin', 'beef_ribeye'], label: '应使用牛里脊/牛柳' },
  { keywords: ['糖醋排骨', '红烧排骨', '蒜蓉粉丝蒸排骨'], expect: ['pork_rib', 'pork_ribs'], label: '应使用排骨' },
  { keywords: ['清蒸鲈鱼', '红烧鲈鱼'], expect: ['sea_bass'], label: '应使用鲈鱼' },
  { keywords: ['松鼠鳜鱼', '臭鳜鱼'], expect: ['mandarin_fish'], label: '应使用鳜鱼', skipIf: ['式', '风味', '改良'] },
];

/**
 * 构造一个上下文对象，供批量/单条校验共用
 * @param {object} opts
 * @param {Recipe[]} opts.recipes — 可选，用于菜名重复(I1)检测
 * @param {Ingredient[]} opts.ingredients — 可选，用于食材 ID 检查(E3) + isVegetarian 冲突(W4)
 */
function buildValidationContext({ recipes = [], ingredients = [] } = {}) {
  const ingredientIds = new Set(ingredients.map(i => i.id));
  const ingCatById = Object.fromEntries(ingredients.map(i => [i.id, i.category]));
  const nameCount = {};
  const idByName = {};
  for (const r of recipes) {
    if (!r.nameZh) continue;
    nameCount[r.nameZh] = (nameCount[r.nameZh] || 0) + 1;
    (idByName[r.nameZh] = idByName[r.nameZh] || []).push(r.id);
  }
  return { ingredientIds, ingCatById, nameCount, idByName };
}

/**
 * 校验单条菜谱
 * @param {Recipe} recipe
 * @param {object} ctx — buildValidationContext 产物（空对象也可，按需降级）
 * @returns {{issues: Array<{level, code, msg}>, classification: {dishRole, isVegetarian, stapleCategory, dishStyle}}}
 */
function validateRecipe(recipe, ctx = {}) {
  const {
    ingredientIds = new Set(),
    ingCatById = {},
    nameCount = {},
    idByName = {},
  } = ctx;
  const issues = [];
  const id = recipe.id || '(no-id)';

  // --- ERROR: 必填字段 ---
  for (const f of REQUIRED_FIELDS) {
    const v = recipe[f];
    if (v === undefined || v === null || v === '' ||
        (Array.isArray(v) && v.length === 0)) {
      issues.push({ level: 'ERROR', code: 'E1', msg: `缺失字段: ${f}` });
    }
  }

  // --- ERROR: 枚举值 ---
  if (recipe.cookingMethod && !VALID_COOKING_METHODS.has(recipe.cookingMethod))
    issues.push({ level: 'ERROR', code: 'E2', msg: `非法 cookingMethod: ${recipe.cookingMethod}` });
  if (recipe.difficulty && !VALID_DIFFICULTY.has(recipe.difficulty))
    issues.push({ level: 'ERROR', code: 'E2', msg: `非法 difficulty: ${recipe.difficulty}` });
  if (recipe.minCookingLevel && !VALID_LEVELS.has(recipe.minCookingLevel))
    issues.push({ level: 'ERROR', code: 'E2', msg: `非法 minCookingLevel: ${recipe.minCookingLevel}` });
  if (recipe.cuisine && !VALID_CUISINE.has(recipe.cuisine))
    issues.push({ level: 'ERROR', code: 'E2', msg: `非法 cuisine: ${recipe.cuisine}` });
  if (recipe.dishRole && !VALID_DISH_ROLE.has(recipe.dishRole))
    issues.push({ level: 'ERROR', code: 'E2', msg: `非法 dishRole: ${recipe.dishRole}` });
  if (recipe.stapleCategory && !VALID_STAPLE_CAT.has(recipe.stapleCategory))
    issues.push({ level: 'ERROR', code: 'E2', msg: `非法 stapleCategory: ${recipe.stapleCategory}` });
  if (recipe.dishStyle && !VALID_DISH_STYLE.has(recipe.dishStyle))
    issues.push({ level: 'ERROR', code: 'E2', msg: `非法 dishStyle: ${recipe.dishStyle}` });
  for (const m of recipe.mealTypes || []) {
    if (!VALID_MEAL.has(m)) issues.push({ level: 'ERROR', code: 'E2', msg: `非法 mealType: ${m}` });
  }

  // --- ERROR: 食材 ID 不存在 ---
  if (ingredientIds.size > 0) {
    for (const ing of recipe.ingredients || []) {
      if (!ingredientIds.has(ing.ingredientId)) {
        issues.push({ level: 'ERROR', code: 'E3', msg: `食材不存在: ${ing.ingredientId}` });
      }
    }
  }

  const name = recipe.nameZh || '';

  // --- WARN: 名字与 cookingMethod 一致性 ---
  if (recipe.cookingMethod) {
    const isBowlStaple = /盖饭|盖浇|卤肉饭|牛肉面|红烧肉面|咖喱饭|炒饭|炒面|焖饭/.test(name);
    // 凉菜/小炒类糖醋菜 —— 真实做法是快炒/凉拌，不应强求 braise
    const isColdOrStirFrySweetSour = recipe.dishRole === 'cold'
      || recipe.cookingMethod === 'cold_dish'
      || recipe.cookingMethod === 'stir_fry'
      || recipe.cookingMethod === 'deep_fry';

    if (/炒饭/.test(name) && !['staple', 'stir_fry'].includes(recipe.cookingMethod))
      issues.push({ level: 'WARN', code: 'W1', msg: `炒饭应为 staple/stir_fry，实为 ${recipe.cookingMethod}` });
    if (/凉拌|沙拉/.test(name) && recipe.cookingMethod !== 'cold_dish')
      issues.push({ level: 'WARN', code: 'W1', msg: `凉拌/沙拉应为 cold_dish，实为 ${recipe.cookingMethod}` });
    if (/^蒸|^清蒸/.test(name) && !['steam', 'staple'].includes(recipe.cookingMethod))
      issues.push({ level: 'WARN', code: 'W1', msg: `蒸类建议 cookingMethod=steam` });
    if (/汤$|羹$/.test(name) && !/^蒸|汤圆|汤饭|汤面|汤粉|汤包/.test(name)
        && !['soup', 'stew', 'simmer', 'steam'].includes(recipe.cookingMethod))
      issues.push({ level: 'WARN', code: 'W1', msg: `汤/羹应为 soup/stew/simmer，实为 ${recipe.cookingMethod}` });
    // 红烧/糖醋/卤 — 排除主食碗、凉菜、快炒/油炸（糖醋里脊等小炒糖醋菜做法正当）
    if (/^红烧|^糖醋|^卤/.test(name) && !isBowlStaple && !isColdOrStirFrySweetSour
        && !['braise', 'stew', 'deep_fry'].includes(recipe.cookingMethod))
      issues.push({ level: 'WARN', code: 'W1', msg: `红烧/糖醋/卤应为 braise/stew` });
  }

  // --- WARN: staple 必须有 stapleCategory ---
  if (recipe.dishRole === 'staple' && !recipe.stapleCategory) {
    issues.push({ level: 'WARN', code: 'W3', msg: 'staple 菜谱缺 stapleCategory' });
  }

  // --- WARN: isVegetarian 与 ingredients 冲突 ---
  if (recipe.isVegetarian === true && Object.keys(ingCatById).length > 0) {
    const hasMeat = (recipe.ingredients || []).some(ri => {
      const cat = ingCatById[ri.ingredientId];
      return cat === 'meat' || cat === 'seafood';
    });
    if (hasMeat) issues.push({ level: 'WARN', code: 'W4', msg: 'isVegetarian=true 但含肉/海鲜' });
  }

  // --- WARN: description ---
  const desc = recipe.description || '';
  if (!desc) issues.push({ level: 'WARN', code: 'W5', msg: '缺 description' });
  else if (desc.length < 20) issues.push({ level: 'WARN', code: 'W5', msg: `description 过短 (${desc.length}字)` });
  else if (desc.length > 200) issues.push({ level: 'WARN', code: 'W5', msg: `description 过长 (${desc.length}字)` });
  else if (/精心烹饪，?口感/.test(desc)) issues.push({ level: 'INFO', code: 'I4', msg: 'description 为 fallback 模板' });

  // --- WARN: steps 数量 ---
  const stepCount = (recipe.steps || []).length;
  if (stepCount > 0 && stepCount < 3) issues.push({ level: 'WARN', code: 'W6', msg: `步骤过少 (${stepCount})` });
  else if (stepCount > 25) issues.push({ level: 'WARN', code: 'W6', msg: `步骤过多 (${stepCount})` });
  const shortSteps = (recipe.steps || []).filter(s => typeof s === 'string' && s.length < 6).length;
  if (stepCount >= 3 && shortSteps / stepCount > 0.8)
    issues.push({ level: 'WARN', code: 'W6', msg: `绝大多数步骤过短（${shortSteps}/${stepCount}）` });

  // --- WARN: mealTypes 合理性 ---
  if ((recipe.mealTypes || []).includes('breakfast')) {
    if (/佛跳墙|松鼠鳜鱼|红烧肉|东坡|大盘鸡|烤全|烤乳猪|梅菜扣肉|水煮|毛血旺|九转大肠/.test(name))
      issues.push({ level: 'WARN', code: 'W7', msg: '重工菜不宜标为早餐' });
    const breakfastException = /小笼包|生煎|烧卖|肠粉|灌汤包|葱油饼/.test(name);
    if (!breakfastException && (recipe.difficulty === 'hard' || recipe.difficulty === 'expert'))
      issues.push({ level: 'WARN', code: 'W7', msg: `${recipe.difficulty} 难度不宜标为早餐` });
  }

  // --- WARN: 难度 vs 步骤数 ---
  if (recipe.difficulty === 'easy' && stepCount > 12)
    issues.push({ level: 'WARN', code: 'W8', msg: 'easy 难度但步骤>12' });
  if ((recipe.difficulty === 'hard' || recipe.difficulty === 'expert') && stepCount < 5)
    issues.push({ level: 'WARN', code: 'W8', msg: `${recipe.difficulty} 难度但步骤<5` });

  // --- INFO: 菜名重复 ---
  if (name && nameCount[name] > 1) {
    const otherIds = (idByName[name] || []).filter(x => x !== id);
    if (otherIds.length > 0)
      issues.push({ level: 'INFO', code: 'I1', msg: `菜名重复: 另见 ${otherIds.slice(0, 3).join(',')}` });
  }

  // --- INFO: 通用食材 → 具体食材建议 ---
  for (const rule of NAME_SPECIFIC_INGREDIENT) {
    if (rule.keywords.some(k => name.includes(k))) {
      if (rule.skipIf && rule.skipIf.some(s => name.includes(s))) continue;
      const expectList = Array.isArray(rule.expect) ? rule.expect : [rule.expect];
      const hasExpected = (recipe.ingredients || []).some(ri => expectList.includes(ri.ingredientId));
      if (!hasExpected)
        issues.push({ level: 'INFO', code: 'I3', msg: `${rule.label}（期望 ${expectList.join('/')}）` });
    }
  }
  for (const ri of recipe.ingredients || []) {
    if (GENERIC_TO_SPECIFIC[ri.ingredientId]) {
      issues.push({ level: 'INFO', code: 'I3', msg: `使用了通用食材 ${ri.ingredientId}，可替换为更具体的: ${GENERIC_TO_SPECIFIC[ri.ingredientId].slice(0, 3).join('/')}` });
    }
  }

  // 同时产出分类建议（供 admin UI 直接显示 "建议 dishRole=X"）
  const classification = classify(recipe);

  return { id, nameZh: name, issues, classification };
}

/** 摘要：按 level/code 聚合 issues */
function summarize(results) {
  const totals = { ERROR: 0, WARN: 0, INFO: 0 };
  const byCode = {};
  for (const r of results) {
    for (const i of r.issues) {
      totals[i.level] = (totals[i.level] || 0) + 1;
      byCode[i.code] = (byCode[i.code] || 0) + 1;
    }
  }
  return { totals, byCode };
}

module.exports = {
  validateRecipe,
  buildValidationContext,
  summarize,
  // 原始枚举导出，方便前端复用
  VALID_COOKING_METHODS,
  VALID_DIFFICULTY,
  VALID_LEVELS,
  VALID_MEAL,
  VALID_CUISINE,
  VALID_DISH_ROLE,
  VALID_STAPLE_CAT,
  VALID_DISH_STYLE,
  REQUIRED_FIELDS,
};
