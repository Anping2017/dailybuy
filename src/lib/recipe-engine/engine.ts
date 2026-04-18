/**
 * 菜谱推荐引擎 v2
 * 多菜组合 + 荤素搭配 + 热量控制 + 已有食材优先
 */
import type {
  Recipe, Ingredient, UserProfile, FamilyMember,
  MealType, DayOfWeek, MealSlot, MealRecipe, DishRole,
  WeeklyPlan, ShoppingItem, ShoppingList,
  HealthCondition, DietaryRestriction, IngredientCategory, HealthTag,
  NutritionHighlight,
  CookingLevel, DifficultyLevel,
} from '@/types';
import { calcRecipeNutrition, calcRecipeCost } from '@/lib/nutrition/calculator';
import { getReviewedRecipes, getAllRecipes, getAllIngredients, getIngredient as getIngredientById } from '@/lib/data/recipe-repository';
import healthRulesData from '@/data/health-rules.json';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ============================================================
// 健康过滤 (保留原有逻辑)
// ============================================================

interface ConditionRule { blockedTags: HealthTag[]; preferredHighlights?: NutritionHighlight[]; }
interface RestrictionRule { blockedCategories?: IngredientCategory[]; blockedIngredients?: string[]; blockedTags?: HealthTag[]; }

// 幼儿/儿童自动屏蔽酒精(无需显式配置)
const CHILD_AGE_GROUPS = new Set(['toddler', 'child']);

function getBlockedTags(members: FamilyMember[]): Set<HealthTag> {
  const tags = new Set<HealthTag>();
  for (const m of members) {
    for (const c of m.healthConditions) {
      if (c === 'none') continue;
      const rule = (healthRulesData.conditions as Record<string, ConditionRule>)[c];
      if (rule?.blockedTags) rule.blockedTags.forEach(t => tags.add(t as HealthTag));
    }
    for (const r of m.dietaryRestrictions) {
      const rule = (healthRulesData.restrictions as Record<string, RestrictionRule>)[r];
      if (rule?.blockedTags) rule.blockedTags.forEach(t => tags.add(t as HealthTag));
    }
    // 幼儿/儿童 → 自动规避酒精
    if (CHILD_AGE_GROUPS.has(m.ageGroup)) {
      tags.add('contains_alcohol' as HealthTag);
    }
  }
  return tags;
}

/** 按用户健康状况收集"偏好的营养亮点",用于正向加权评分 */
function getPreferredHighlights(members: FamilyMember[]): Set<NutritionHighlight> {
  const hs = new Set<NutritionHighlight>();
  for (const m of members) {
    for (const c of m.healthConditions) {
      if (c === 'none') continue;
      const rule = (healthRulesData.conditions as Record<string, ConditionRule>)[c];
      if (rule?.preferredHighlights) rule.preferredHighlights.forEach(h => hs.add(h));
    }
  }
  return hs;
}

/** 菜谱亮点加权: 每个匹配的亮点 +1(去重,按食材计算) */
function scoreRecipeHighlights(recipe: Recipe, preferred: Set<NutritionHighlight>): number {
  if (preferred.size === 0) return 0;
  const hit = new Set<NutritionHighlight>();
  for (const ri of recipe.ingredients) {
    const ing = getIngredientById(ri.ingredientId);
    if (!ing) continue;
    for (const h of (ing.highlights || [])) {
      if (preferred.has(h)) hit.add(h);
    }
  }
  return hit.size * 2; // 每命中 1 个偏好亮点 +2 分
}

/**
 * 根据家庭健康目标调整菜谱评分 (需求4)
 * cutting 减脂: +低热量低脂高纤 -油炸 -肥肉
 * bulking 增肌: +高蛋白 +肉类
 * wellness 养生: +低脂高纤 -油炸 -辣
 */
function scoreRecipeByGoals(recipe: Recipe, members: FamilyMember[]): number {
  if (!members.length) return 0;
  // 聚合家庭目标: 有几个成员偏向某目标
  const counts: Record<string, number> = { cutting: 0, bulking: 0, wellness: 0 };
  for (const m of members) {
    const g = m.fitnessGoal || 'maintain';
    if (g !== 'maintain') counts[g] = (counts[g] || 0) + 1;
  }
  const total = members.length;

  let score = 0;

  // 收集食材亮点
  const ingHighlights = new Set<NutritionHighlight>();
  for (const ri of recipe.ingredients) {
    const ing = getIngredientById(ri.ingredientId);
    if (!ing) continue;
    for (const h of (ing.highlights || [])) ingHighlights.add(h);
  }

  // 减脂: 偏好低热量/低脂/高纤; 惩罚 deep_fry 和高脂肥肉食材
  if (counts.cutting > 0) {
    const w = counts.cutting / total;
    if (ingHighlights.has('low_calorie')) score += 4 * w;
    if (ingHighlights.has('low_fat')) score += 3 * w;
    if (ingHighlights.has('high_fiber')) score += 3 * w;
    if (recipe.cookingMethod === 'deep_fry') score -= 6 * w;
    if (recipe.cookingMethod === 'cold_dish') score += 2 * w;
    // 肥肉/培根/香肠的菜扣分
    const fatIds = new Set(['pork_belly', 'bacon', 'sausage', 'lamb_chop']);
    const hitsFat = recipe.ingredients.some(ri => fatIds.has(ri.ingredientId));
    if (hitsFat) score -= 4 * w;
  }

  // 增肌: 偏好高蛋白 + 肉类荤菜; 惩罚纯素菜和高油炸
  if (counts.bulking > 0) {
    const w = counts.bulking / total;
    if (ingHighlights.has('high_protein')) score += 5 * w;
    if (isMeatDish(recipe)) score += 3 * w;
    if (inferRole(recipe) === 'main_veg' && !ingHighlights.has('high_protein')) score -= 2 * w;
  }

  // 养生: 偏好低脂/高纤; 惩罚 deep_fry/辣
  if (counts.wellness > 0) {
    const w = counts.wellness / total;
    if (ingHighlights.has('low_fat')) score += 3 * w;
    if (ingHighlights.has('high_fiber')) score += 3 * w;
    if (recipe.cookingMethod === 'steam' || recipe.cookingMethod === 'boil') score += 2 * w;
    if (recipe.cookingMethod === 'deep_fry') score -= 6 * w;
    if (recipe.flavors.includes('spicy')) score -= 3 * w;
  }

  return score;
}

function getBlockedCategories(members: FamilyMember[]): Set<IngredientCategory> {
  const cats = new Set<IngredientCategory>();
  for (const m of members) {
    for (const r of m.dietaryRestrictions) {
      const rule = (healthRulesData.restrictions as Record<string, RestrictionRule>)[r];
      if (rule?.blockedCategories) rule.blockedCategories.forEach(c => cats.add(c as IngredientCategory));
    }
  }
  return cats;
}

function getBlockedIngredientIds(members: FamilyMember[]): Set<string> {
  const ids = new Set<string>();
  for (const m of members) {
    for (const r of m.dietaryRestrictions) {
      const rule = (healthRulesData.restrictions as Record<string, RestrictionRule>)[r];
      if (rule?.blockedIngredients) rule.blockedIngredients.forEach(id => ids.add(id));
    }
  }
  return ids;
}

export function isRecipeSafe(recipe: Recipe, profile: UserProfile): boolean {
  const blockedTags = getBlockedTags(profile.members);
  const blockedCats = getBlockedCategories(profile.members);
  const blockedIds = getBlockedIngredientIds(profile.members);
  // Profile 长期排除食材（需求6）
  const userExcluded = new Set(profile.excludeIngredients || []);

  for (const ri of recipe.ingredients) {
    if (blockedIds.has(ri.ingredientId)) return false;
    if (userExcluded.has(ri.ingredientId)) return false;
    const ingredient = getIngredientById(ri.ingredientId);
    if (!ingredient) continue;
    if (blockedCats.has(ingredient.category)) return false;
    // 过敏原+警告标签都可能被 blockedTags 命中(例如糖尿病屏蔽 high_gi, 无乳糖屏蔽 allergen_dairy)
    for (const tag of (ingredient.allergens || [])) {
      if (blockedTags.has(tag)) return false;
    }
    for (const tag of (ingredient.warnings || [])) {
      if (blockedTags.has(tag)) return false;
    }
  }
  return true;
}

// ============================================================
// 厨艺等级
// ============================================================

const COOKING_LEVEL_ORDER: Record<CookingLevel, number> = {
  beginner: 0, basic: 1, intermediate: 2, advanced: 3, expert: 4,
};

function canCook(userLevel: CookingLevel, recipeLevel: CookingLevel): boolean {
  return COOKING_LEVEL_ORDER[userLevel] >= COOKING_LEVEL_ORDER[recipeLevel];
}

// ============================================================
// 菜谱分类: 判断一道菜的角色
// ============================================================

const MEAT_CATEGORIES: Set<IngredientCategory> = new Set(['meat', 'seafood']);

/** 判断菜是否为荤菜 */
function isMeatDish(recipe: Recipe): boolean {
  return recipe.ingredients.some(ri => {
    const ing = getIngredientById(ri.ingredientId);
    return ing && MEAT_CATEGORIES.has(ing.category);
  });
}

/** 推断菜在一餐中的角色 */
function inferRole(recipe: Recipe): DishRole {
  if (recipe.cookingMethod === 'soup') return 'soup';
  if (recipe.cookingMethod === 'staple') return 'staple';
  if (recipe.cookingMethod === 'cold_dish') return 'cold';
  if (isMeatDish(recipe)) return 'main_meat';
  return 'main_veg';
}

// ============================================================
// 过滤 + 排序
// ============================================================

/** 获取符合用户条件的菜谱（自动放宽保证有结果） */
export function getFilteredRecipes(profile: UserProfile, mealType?: MealType): Recipe[] {
  const all = getReviewedRecipes();

  const strict = all.filter(r => {
    if (mealType && !r.mealTypes.includes(mealType)) return false;
    if (profile.cuisinePreference.length > 0 && !profile.cuisinePreference.includes(r.cuisine)) return false;
    if (profile.regionalPreference?.length > 0 && !profile.regionalPreference.includes(r.regionalCuisine)) return false;
    if (profile.acceptedDifficulty?.length > 0 && !profile.acceptedDifficulty.includes(r.difficulty)) return false;
    if (profile.preferredCookingMethods?.length > 0 && !profile.preferredCookingMethods.includes(r.cookingMethod)) return false;
    if (profile.cookingLevel && !canCook(profile.cookingLevel, r.minCookingLevel)) return false;
    return isRecipeSafe(r, profile);
  });

  if (strict.length >= 5) return strict;

  // 放宽: 去掉地域+做法限制
  const relaxed = all.filter(r => {
    if (mealType && !r.mealTypes.includes(mealType)) return false;
    if (profile.cuisinePreference.length > 0 && !profile.cuisinePreference.includes(r.cuisine)) return false;
    if (profile.cookingLevel && !canCook(profile.cookingLevel, r.minCookingLevel)) return false;
    return isRecipeSafe(r, profile);
  });

  if (relaxed.length >= 5) return relaxed;

  return all.filter(r => {
    if (mealType && !r.mealTypes.includes(mealType)) return false;
    return isRecipeSafe(r, profile);
  });
}

/**
 * 计算一份菜(按 familySize 份)的预估热量
 * recipe 的原始热量是按 recipe.servings 算的，这里缩放到 familySize 份
 */
function calcRecipeCalForFamily(recipe: Recipe, familySize: number): number {
  const total = calcRecipeNutrition(recipe).totalCalories;
  return Math.round(total * (familySize / recipe.servings));
}

/**
 * 计算每餐的热量预算 (家庭总和)
 * 热量按早/午/晚 25%/40%/35% 分配，只计划哪几餐就在这几餐里按比例归一
 * 需求1核心: 选菜时据此限制超标
 */
export function getMealCalorieBudget(profile: UserProfile, mealType: MealType): number {
  // 1) 家庭每日总目标(基于 members.dailyCalorieTarget, 家庭大小 >成员数时按均值补齐)
  const membersCount = Math.max(1, profile.members.length);
  const avgTarget = profile.members.reduce((s, m) => s + m.dailyCalorieTarget, 0) / membersCount;
  const householdDaily = profile.members.reduce((s, m) => s + m.dailyCalorieTarget, 0)
    + avgTarget * Math.max(0, profile.familySize - membersCount);

  // 2) 按实际开启的餐次归一分配
  const defaultWeights: Record<MealType, number> = { breakfast: 0.25, lunch: 0.40, dinner: 0.35 };
  const active = profile.mealsPerDay;
  if (!active.includes(mealType)) return 0;
  const totalWeight = active.reduce((s, m) => s + (defaultWeights[m] || 0.33), 0) || 1;
  const ratio = (defaultWeights[mealType] || 0.33) / totalWeight;
  return Math.round(householdDaily * ratio);
}

/** 排序: 口味匹配 + 已有食材匹配 + 用户偏好 + 健康亮点 + 反馈调整 + 热量预算 */
function scoreRecipe(
  recipe: Recipe,
  profile: UserProfile,
  ownedIngredients: string[],
  getPreference?: (id: string) => number,
  getFeedback?: (r: Recipe) => number,
  /** 本餐剩余热量预算(kcal, familySize 份) — 超过会扣分 */
  remainingCal?: number,
): number {
  let score = 0;

  // 口味匹配
  if (profile.flavorPreference?.length > 0) {
    score += recipe.flavors.filter(f => profile.flavorPreference.includes(f)).length * 2;
  }

  // 已有食材匹配
  if (ownedIngredients.length > 0) {
    const ownedSet = new Set(ownedIngredients);
    score += recipe.ingredients.filter(ri => ownedSet.has(ri.ingredientId)).length * 3;
  }

  // 用户历史偏好
  if (getPreference) {
    score += getPreference(recipe.id) * 0.5;
  }

  // 细粒度反馈调整（不喜欢食材/口味/不方便/太复杂）
  if (getFeedback) {
    score += getFeedback(recipe);
  }

  // 营养亮点加权(根据家庭健康状况偏好)
  const preferred = getPreferredHighlights(profile.members);
  score += scoreRecipeHighlights(recipe, preferred);

  // 家庭健康目标调整 (减脂/增肌/养生) - 需求4
  score += scoreRecipeByGoals(recipe, profile.members);

  // 热量预算控制 (需求1)
  // remainingCal = 本餐剩余可用热量, dishCal = 本菜预计热量
  // 如果 dishCal > remainingCal, 严重扣分; 如果只剩少量预算而菜热量很大, 扣分递增
  if (remainingCal !== undefined && remainingCal > 0) {
    const dishCal = calcRecipeCalForFamily(recipe, profile.familySize);
    if (dishCal > remainingCal * 1.5) score -= 15;             // 超预算 50% → -15
    else if (dishCal > remainingCal * 1.2) score -= 8;         // 超预算 20% → -8
    else if (dishCal > remainingCal) score -= 3;                // 刚好超 → -3
    else if (dishCal < remainingCal * 0.4 && remainingCal > 300) score += 2;  // 还剩很多预算 → 偏好稍大的菜
    else if (dishCal <= remainingCal) score += 1;              // 刚好在预算内 → +1
  } else if (remainingCal !== undefined && remainingCal <= 0) {
    // 预算已用完, 强烈惩罚任何菜 → 几乎全扣分
    const dishCal = calcRecipeCalForFamily(recipe, profile.familySize);
    score -= Math.min(25, dishCal / 50);  // 菜越大扣越多
  }

  // 加随机扰动 (0-1) 保证多样性
  score += Math.random();

  return score;
}

/** 从候选池中选一道(评分最高的前N个中随机) */
function pickBest(
  pool: Recipe[],
  usedIds: Set<string>,
  profile: UserProfile,
  ownedIngredients: string[],
  getPreference?: (id: string) => number,
  getFeedback?: (r: Recipe) => number,
  remainingCal?: number,
): Recipe | null {
  let available = pool.filter(r => !usedIds.has(r.id));
  if (available.length === 0) available = pool;
  if (available.length === 0) return null;

  const scored = available
    .map(r => ({ recipe: r, score: scoreRecipe(r, profile, ownedIngredients, getPreference, getFeedback, remainingCal) }))
    .sort((a, b) => b.score - a.score);

  // 热量控制: 如果有预算且剩余很少，只从 top 15% 选；否则 top 30%
  const tight = remainingCal !== undefined && remainingCal > 0 && remainingCal < 400;
  const topPct = tight ? 0.15 : 0.3;
  const topCount = Math.max(1, Math.ceil(scored.length * topPct));
  return scored[Math.floor(Math.random() * topCount)].recipe;
}

// ============================================================
// 多菜组合生成 (核心)
// ============================================================

// ============================================================
// 标准菜量规则: 以热菜(荤+素)为主，汤/主食/凉菜/水果可选
// ============================================================

interface MealComposition {
  meatCount: number;   // 荤菜数
  vegCount: number;    // 素菜(热菜)数
}

/**
 * 标准菜量: 人数 → 热菜数(荤+素搭配)
 * 核心原则: 热菜为主，荤素搭配
 */
function getHotDishComposition(familySize: number, mealType: MealType): MealComposition {
  if (mealType === 'breakfast') {
    return { meatCount: 0, vegCount: 1 };
  }
  // 午餐/晚餐标准
  if (familySize <= 1) return { meatCount: 1, vegCount: 1 };
  if (familySize <= 2) return { meatCount: 1, vegCount: 1 };
  if (familySize <= 3) return { meatCount: 2, vegCount: 1 };
  if (familySize <= 4) return { meatCount: 2, vegCount: 2 };
  if (familySize <= 5) return { meatCount: 2, vegCount: 2 };
  return { meatCount: 3, vegCount: 2 }; // 6人+
}

/**
 * 热量缺口预留比例
 * 不推荐的品类仍预留热量空间，给出建议量
 */
const CALORIE_RESERVE = {
  staple: 0.30,    // 主食预留30%热量
  fruit: 0.05,     // 水果预留5%热量
  soup: 0.05,      // 汤预留5%热量
};

/** 主食关键词映射 */
const STAPLE_KEYWORDS: Record<string, string[]> = {
  rice: ['饭', '炒饭', '盖浇', 'rice', 'fried rice'],
  noodles: ['面', '粉', 'noodle', 'pasta', 'spaghetti'],
  bread: ['面包', '吐司', 'bread', 'toast', 'sandwich'],
  congee: ['粥', 'congee', 'porridge'],
  mantou: ['馒头', '饼', '包子', 'bun', 'pancake'],
};

/** 组合一餐的菜谱
 *
 * 规则:
 * - 热菜(荤+素): 每餐必推，按人数标准化，不受可选品类影响
 * - 主食: 仅午晚餐，开启后额外推荐，不占热菜名额
 * - 汤: 仅午晚餐，开启后额外推荐，不占热菜名额
 * - 凉菜: 仅午晚餐，开启后影响热菜配比(减1道热菜或选低热量热菜)，不是每餐都推
 * - 水果: 不在此处推荐，由 generateWeeklyPlan 单独生成每日水果方案
 */
/**
 * 获取每餐菜品数量配置
 * 优先级: 用户自定义 > 按人数自动
 */
function getMealPlan(profile: UserProfile, mealType: MealType) {
  // 用户启用了自定义
  if (profile.customMealComposition?.enabled) {
    const c = profile.customMealComposition[mealType];
    return {
      meatCount: c.meatCount,
      vegCount: c.vegCount,
      soupCount: c.soupCount,
      stapleCount: c.stapleCount,
      coldDishCount: c.coldDishCount,
    };
  }

  // 默认：按人数自动推算 + 开关控制
  const hot = getHotDishComposition(profile.familySize, mealType);
  const isLunchOrDinner = mealType === 'lunch' || mealType === 'dinner';
  return {
    meatCount: hot.meatCount,
    vegCount: hot.vegCount,
    soupCount: (profile.includeSoup && isLunchOrDinner) ? 1 : 0,
    stapleCount: ((profile.stapleMode || 'off') !== 'off' && (mealType === 'breakfast' || isLunchOrDinner)) ? 1 : 0,
    coldDishCount: (profile.includeColdDish && isLunchOrDinner) ? 1 : 0, // 自定义模式不做间隔推荐
  };
}

function composeMeal(
  profile: UserProfile,
  mealType: MealType,
  usedIds: Set<string>,
  ownedIngredients: string[],
  mealIndex: number,
  getPreference?: (id: string) => number,
  getFeedback?: (r: Recipe) => number,
): MealRecipe[] {
  const allCandidates = getFilteredRecipes(profile, mealType);
  const plan = getMealPlan(profile, mealType);

  const meatPool = allCandidates.filter(r => inferRole(r) === 'main_meat');
  const vegPool = allCandidates.filter(r => inferRole(r) === 'main_veg');
  const coldPool = allCandidates.filter(r => inferRole(r) === 'cold');
  const soupPool = allCandidates.filter(r => inferRole(r) === 'soup');
  const staplePool = allCandidates.filter(r => inferRole(r) === 'staple');

  const result: MealRecipe[] = [];

  // 非自定义模式下，凉菜按隔餐推荐
  const useCustom = profile.customMealComposition?.enabled === true;
  let coldCount = plan.coldDishCount;
  if (!useCustom && coldCount > 0 && mealIndex % 2 !== 0) coldCount = 0;

  // 如果凉菜被添加，默认模式下减1道素菜（自定义模式不减）
  let adjustedMeat = plan.meatCount;
  let adjustedVeg = plan.vegCount;
  if (!useCustom && coldCount > 0 && (adjustedMeat + adjustedVeg) > 1) {
    if (adjustedVeg > 0) adjustedVeg--;
    else adjustedMeat--;
  }

  const minDishes = adjustedMeat + adjustedVeg;

  // 需求1: 每餐热量预算跟踪
  const mealBudget = getMealCalorieBudget(profile, mealType);
  let accumulatedCal = 0;
  const remainingBudget = () => mealBudget > 0 ? Math.max(0, mealBudget - accumulatedCal) : undefined;
  const trackPick = (r: Recipe) => { accumulatedCal += calcRecipeCalForFamily(r, profile.familySize); };

  // === 荤菜 ===
  for (let i = 0; i < adjustedMeat; i++) {
    const r = pickBest(meatPool, usedIds, profile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (r) { result.push({ recipeId: r.id, role: 'main_meat' }); usedIds.add(r.id); trackPick(r); }
  }

  // === 素菜 ===
  for (let i = 0; i < adjustedVeg; i++) {
    const r = pickBest(vegPool, usedIds, profile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (r) { result.push({ recipeId: r.id, role: 'main_veg' }); usedIds.add(r.id); trackPick(r); }
  }

  // === 补充: 热菜不够时从全池补 ===
  const hotDishPool = allCandidates.filter(r => {
    const role = inferRole(r);
    return role === 'main_meat' || role === 'main_veg';
  });
  while (result.length < minDishes && hotDishPool.length > 0) {
    const r = pickBest(hotDishPool, usedIds, profile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (!r) break;
    result.push({ recipeId: r.id, role: isMeatDish(r) ? 'main_meat' : 'main_veg' });
    usedIds.add(r.id);
    trackPick(r);
  }

  // === 凉菜 ===
  for (let i = 0; i < coldCount; i++) {
    const r = pickBest(coldPool, usedIds, profile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (r) { result.push({ recipeId: r.id, role: 'cold' }); usedIds.add(r.id); trackPick(r); }
  }

  // === 汤 ===
  for (let i = 0; i < plan.soupCount; i++) {
    const r = pickBest(soupPool, usedIds, profile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (r) { result.push({ recipeId: r.id, role: 'soup' }); usedIds.add(r.id); trackPick(r); }
  }

  // === 主食 ===
  if (plan.stapleCount > 0 && staplePool.length > 0) {
    let filtered = staplePool;
    const stapleMode = profile.stapleMode || 'off';
    if (stapleMode === 'fixed' && profile.staplePreference?.length > 0 && !profile.staplePreference.includes('any')) {
      const keywords = (profile.staplePreference || []).flatMap(p => STAPLE_KEYWORDS[p] || []);
      const preferred = staplePool.filter(r =>
        keywords.some(k => r.nameZh.includes(k) || r.nameEn.toLowerCase().includes(k.toLowerCase()))
      );
      if (preferred.length > 0) filtered = preferred;
    }
    for (let i = 0; i < plan.stapleCount; i++) {
      const r = pickBest(filtered, usedIds, profile, ownedIngredients, getPreference, getFeedback, remainingBudget());
      if (r) { result.push({ recipeId: r.id, role: 'staple' }); usedIds.add(r.id); trackPick(r); }
    }
  }

  // fallback
  if (result.length === 0) {
    const r = pickBest(allCandidates, usedIds, profile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (r) { result.push({ recipeId: r.id, role: isMeatDish(r) ? 'main_meat' : 'main_veg' }); usedIds.add(r.id); trackPick(r); }
  }

  return result;
}

// ============================================================
// 智能周规划 (AI模式: 像营养师一样从周维度整体规划)
// ============================================================

/** 获取菜谱的主要蛋白质来源 */
function getProteinSource(recipe: Recipe): string {
  const proteinPriority = ['beef_sirloin','beef_mince','lamb_leg','pork_belly','pork_mince','pork_ribs','pork_loin',
    'chicken_breast','chicken_thigh','chicken_wing','salmon_fillet','shrimp','squid','fish_fillet','egg','tofu'];
  for (const p of proteinPriority) {
    if (recipe.ingredients.some(ri => ri.ingredientId === p)) return p;
  }
  return 'other';
}

/** 蛋白质来源归类 (牛/羊/猪/鸡/鱼虾/蛋豆) */
function getProteinCategory(source: string): string {
  if (source.startsWith('beef')) return 'beef';
  if (source === 'lamb_leg') return 'lamb';
  if (source.startsWith('pork')) return 'pork';
  if (source.startsWith('chicken')) return 'chicken';
  if (['salmon_fillet','shrimp','squid','fish_fillet'].includes(source)) return 'seafood';
  if (['egg','tofu'].includes(source)) return 'egg_tofu';
  return 'other';
}

/** 获取菜谱的主要蔬菜 */
function getMainVegetable(recipe: Recipe): string {
  const vegIds = recipe.ingredients
    .filter(ri => { const i = getIngredientById(ri.ingredientId); return i && i.category === 'vegetable'; })
    .map(ri => ri.ingredientId);
  // 排除葱姜蒜等调味蔬菜
  const seasoning = new Set(['garlic','ginger','spring_onion','onion','chili_pepper']);
  const mainVeg = vegIds.filter(id => !seasoning.has(id));
  return mainVeg[0] || vegIds[0] || 'none';
}

/** 智能选菜: 蛋白质轮换+蔬菜不重复+做法多样+用户偏好 */
function smartPick(
  pool: Recipe[],
  usedIds: Set<string>,
  recentProteins: string[],
  recentVegs: string[],
  recentMethods: string[],
  profile: UserProfile,
  ownedIngredients: string[],
  getPreference?: (id: string) => number,
  getFeedback?: (r: Recipe) => number,
  remainingCal?: number,
): Recipe | null {
  const available = pool.filter(r => !usedIds.has(r.id));
  if (available.length === 0) return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;

  const preferredHighlights = getPreferredHighlights(profile.members);

  // 评分: 避免最近重复 + 口味匹配 + 已有食材 + 健康亮点 + 热量预算
  const scored = available.map(r => {
    let score = 10; // 基础分

    // 蛋白质来源不与最近2餐重复 (+5)
    const pCat = getProteinCategory(getProteinSource(r));
    if (pCat !== 'other' && !recentProteins.includes(pCat)) score += 5;
    if (pCat !== 'other' && recentProteins.includes(pCat)) score -= 3;

    // 蔬菜不与最近2餐重复 (+3)
    const veg = getMainVegetable(r);
    if (veg !== 'none' && !recentVegs.includes(veg)) score += 3;
    if (veg !== 'none' && recentVegs.includes(veg)) score -= 2;

    // 做法不与最近2餐重复 (+2)
    if (!recentMethods.includes(r.cookingMethod)) score += 2;
    if (recentMethods.includes(r.cookingMethod)) score -= 1;

    // 口味匹配
    if (profile.flavorPreference?.length > 0) {
      score += r.flavors.filter(f => profile.flavorPreference.includes(f)).length;
    }

    // 已有食材优先
    if (ownedIngredients.length > 0) {
      const ownedSet = new Set(ownedIngredients);
      score += r.ingredients.filter(ri => ownedSet.has(ri.ingredientId)).length * 2;
    }

    // 用户历史偏好
    if (getPreference) {
      score += getPreference(r.id) * 0.5;
    }

    // 细粒度反馈调整（不喜欢食材/口味/不方便/太复杂）
    if (getFeedback) {
      score += getFeedback(r);
    }

    // 营养亮点加权(根据家庭健康状况偏好)
    score += scoreRecipeHighlights(r, preferredHighlights);

    // 家庭健康目标调整 (减脂/增肌/养生)
    score += scoreRecipeByGoals(r, profile.members);

    // 热量预算 (需求1)
    if (remainingCal !== undefined && remainingCal > 0) {
      const dishCal = calcRecipeCalForFamily(r, profile.familySize);
      if (dishCal > remainingCal * 1.5) score -= 15;
      else if (dishCal > remainingCal * 1.2) score -= 8;
      else if (dishCal > remainingCal) score -= 3;
      else if (dishCal < remainingCal * 0.4 && remainingCal > 300) score += 2;
      else if (dishCal <= remainingCal) score += 1;
    } else if (remainingCal !== undefined && remainingCal <= 0) {
      const dishCal = calcRecipeCalForFamily(r, profile.familySize);
      score -= Math.min(25, dishCal / 50);
    }

    // 随机扰动
    score += Math.random() * 2;

    return { recipe: r, score };
  }).sort((a, b) => b.score - a.score);

  // 从前20%中随机选，保证质量的同时增加多样性
  const topCount = Math.max(1, Math.ceil(scored.length * 0.2));
  return scored[Math.floor(Math.random() * topCount)].recipe;
}

/** AI智能周规划 */
function generateSmartPlan(
  profile: UserProfile,
  ownedIngredients: string[],
  planDays: number,
  activeDays: DayOfWeek[],
  getPreference?: (id: string) => number,
  getFeedback?: (r: Recipe) => number,
): MealSlot[] {
  const allCandidates = getFilteredRecipes(profile);
  const isLunchDinner = (mt: MealType) => mt === 'lunch' || mt === 'dinner';

  // 分池
  const meatPool = allCandidates.filter(r => inferRole(r) === 'main_meat');
  const vegPool = allCandidates.filter(r => inferRole(r) === 'main_veg');
  const coldPool = allCandidates.filter(r => inferRole(r) === 'cold');
  const soupPool = allCandidates.filter(r => inferRole(r) === 'soup');
  const staplePool = allCandidates.filter(r => inferRole(r) === 'staple');

  const usedIds = new Set<string>();
  const slots: MealSlot[] = [];

  // 追踪最近的选择(用于避免连续重复)
  const recentProteins: string[] = [];
  const recentVegs: string[] = [];
  const recentMethods: string[] = [];

  // 统计本周蛋白质来源分布(保证周维度均衡)
  const weekProteinCount: Record<string, number> = {};

  let mealIndex = 0;

  for (const day of activeDays) {
    for (const mealType of profile.mealsPerDay) {
      const plan = getMealPlan(profile, mealType);
      const recipes: MealRecipe[] = [];
      const ld = isLunchDinner(mealType);
      const useCustom = profile.customMealComposition?.enabled === true;

      // 凉菜间隔推荐(仅默认模式)
      let coldCount = plan.coldDishCount;
      if (!useCustom && coldCount > 0 && mealIndex % 3 !== 0) coldCount = 0;

      let adjMeat = plan.meatCount;
      let adjVeg = plan.vegCount;
      if (!useCustom && coldCount > 0 && (adjMeat + adjVeg) > 1) {
        if (adjVeg > 0) adjVeg--; else adjMeat--;
      }

      // 需求1: 本餐热量预算
      const mealBudget = getMealCalorieBudget(profile, mealType);
      let accumulatedCal = 0;
      const remaining = () => mealBudget > 0 ? Math.max(0, mealBudget - accumulatedCal) : undefined;
      const track = (r: Recipe) => { accumulatedCal += calcRecipeCalForFamily(r, profile.familySize); };

      // === 荤菜: 智能选(考虑蛋白质轮换) ===
      for (let i = 0; i < adjMeat; i++) {
        // 如果某类蛋白质本周已经用太多次，降低其优先级
        const adjustedMeatPool = meatPool.filter(r => {
          const pCat = getProteinCategory(getProteinSource(r));
          return (weekProteinCount[pCat] || 0) < Math.ceil(planDays * 0.5); // 同一蛋白质不超过一半天数
        });
        const pool = adjustedMeatPool.length >= 3 ? adjustedMeatPool : meatPool;

        const r = smartPick(pool, usedIds, recentProteins, recentVegs, recentMethods, profile, ownedIngredients, getPreference, getFeedback, remaining());
        if (r) {
          recipes.push({ recipeId: r.id, role: 'main_meat' });
          usedIds.add(r.id);
          track(r);
          const pCat = getProteinCategory(getProteinSource(r));
          recentProteins.push(pCat);
          if (recentProteins.length > 2) recentProteins.shift();
          weekProteinCount[pCat] = (weekProteinCount[pCat] || 0) + 1;
          recentMethods.push(r.cookingMethod);
          if (recentMethods.length > 2) recentMethods.shift();
        }
      }

      // === 素菜: 智能选(考虑蔬菜不重复) ===
      for (let i = 0; i < adjVeg; i++) {
        const r = smartPick(vegPool, usedIds, recentProteins, recentVegs, recentMethods, profile, ownedIngredients, getPreference, getFeedback, remaining());
        if (r) {
          recipes.push({ recipeId: r.id, role: 'main_veg' });
          usedIds.add(r.id);
          track(r);
          const veg = getMainVegetable(r);
          recentVegs.push(veg);
          if (recentVegs.length > 3) recentVegs.shift();
          recentMethods.push(r.cookingMethod);
          if (recentMethods.length > 2) recentMethods.shift();
        }
      }

      // === 凉菜 ===
      for (let i = 0; i < coldCount; i++) {
        const r = smartPick(coldPool, usedIds, recentProteins, recentVegs, recentMethods, profile, ownedIngredients, getPreference, getFeedback, remaining());
        if (r) { recipes.push({ recipeId: r.id, role: 'cold' }); usedIds.add(r.id); track(r); }
      }

      // === 汤 ===
      for (let i = 0; i < plan.soupCount; i++) {
        const r = smartPick(soupPool, usedIds, recentProteins, recentVegs, recentMethods, profile, ownedIngredients, getPreference, getFeedback, remaining());
        if (r) { recipes.push({ recipeId: r.id, role: 'soup' }); usedIds.add(r.id); track(r); }
      }

      // === 主食 ===
      if (plan.stapleCount > 0 && staplePool.length > 0) {
        let filtered = staplePool;
        const stapleMode = profile.stapleMode || 'off';
        if (stapleMode === 'fixed' && profile.staplePreference?.length > 0 && !profile.staplePreference.includes('any')) {
          const keywords = (profile.staplePreference || []).flatMap(p => STAPLE_KEYWORDS[p] || []);
          const preferred = staplePool.filter(r => keywords.some(k => r.nameZh.includes(k) || r.nameEn.toLowerCase().includes(k.toLowerCase())));
          if (preferred.length > 0) filtered = preferred;
        }
        for (let i = 0; i < plan.stapleCount; i++) {
          const r = smartPick(filtered, usedIds, [], [], [], profile, ownedIngredients, getPreference, getFeedback, remaining());
          if (r) { recipes.push({ recipeId: r.id, role: 'staple' }); usedIds.add(r.id); track(r); }
        }
      }

      // fallback
      if (recipes.length === 0) {
        const r = smartPick(allCandidates, usedIds, recentProteins, recentVegs, recentMethods, profile, ownedIngredients, getPreference, getFeedback, remaining());
        if (r) { recipes.push({ recipeId: r.id, role: isMeatDish(r) ? 'main_meat' : 'main_veg' }); usedIds.add(r.id); track(r); }
      }

      slots.push({ day, mealType, recipes, servings: profile.familySize });
      mealIndex++;
    }
  }

  return slots;
}

// ============================================================
// 生成周计划
// ============================================================

export function generateWeeklyPlan(
  profile: UserProfile,
  ownedIngredients: string[] = [],
  getPreference?: (id: string) => number,
  getFeedback?: (r: Recipe) => number,
): WeeklyPlan {
  const planDays = Math.min(7, Math.max(1, profile.planDays || 7));
  const activeDays = DAYS.slice(0, planDays);

  let slots: MealSlot[];

  if (profile.recommendMode === 'ai_queue' || profile.recommendMode === 'ai_online') {
    // AI智能模式: 周维度整体规划，蛋白质轮换+蔬菜不重复+做法多样
    slots = generateSmartPlan(profile, ownedIngredients, planDays, activeDays, getPreference, getFeedback);
  } else {
    // 基础模式: 逐餐随机
    const usedIds = new Set<string>();
    slots = [];
    let mealIndex = 0;
    for (const day of activeDays) {
      for (const mealType of profile.mealsPerDay) {
        const recipes = composeMeal(profile, mealType, usedIds, ownedIngredients, mealIndex, getPreference, getFeedback);
        mealIndex++;
        slots.push({ day, mealType, recipes, servings: profile.familySize });
      }
    }
  }

  let totalCalories = 0;
  let totalCost = 0;
  for (const slot of slots) {
    for (const mr of (slot.recipes || [])) {
      const recipe = getAllRecipes().find(r => r.id === mr.recipeId);
      if (!recipe) continue;
      const nutr = calcRecipeNutrition(recipe);
      totalCalories += Math.round(nutr.totalCalories * (slot.servings / recipe.servings));
      totalCost += calcRecipeCost(recipe) * (slot.servings / recipe.servings);
    }
  }

  const now = new Date();
  const mondayOffset = now.getDay() === 0 ? -6 : 1 - now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  // 按目标热量占比分配菜品热量
  // 菜是按 familySize 份做的，总热量已包含所有人的量
  // 分配逻辑: 如果有N个成员档案，按各自目标热量占比分配
  //          如果 familySize > members.length，多出的人按平均分
  const actualPersons = Math.max(profile.familySize, profile.members.length);
  const dishCaloriesPerDay = planDays > 0 ? Math.round(totalCalories / planDays) : 0;

  // 构建完整的成员列表（补齐到 familySize）
  const effectiveMembers = [...profile.members];
  while (effectiveMembers.length < profile.familySize) {
    // 补齐的成员使用所有成员的平均热量目标
    const avgTarget = Math.round(profile.members.reduce((s, m) => s + m.dailyCalorieTarget, 0) / profile.members.length);
    effectiveMembers.push({
      id: `auto_${effectiveMembers.length}`,
      name: `家人${effectiveMembers.length + 1}`,
      gender: 'male' as const,
      ageGroup: 'adult' as const,
      healthConditions: ['none' as const],
      dietaryRestrictions: [],
      dailyCalorieTarget: avgTarget,
    });
  }

  const totalDailyTarget = effectiveMembers.reduce((sum, m) => sum + m.dailyCalorieTarget, 0);

  const memberAdvice = effectiveMembers.map(member => {
    const ag = member.ageGroup || 'adult';

    // 该成员占家庭总目标热量的比例
    const ratio = totalDailyTarget > 0 ? member.dailyCalorieTarget / totalDailyTarget : 1 / effectiveMembers.length;
    const memberDishCalories = Math.round(dishCaloriesPerDay * ratio);

    // 按年龄段+性别微调 每餐 主食建议量
    const baseStaplePerMeal = ag === 'toddler' ? 50 : ag === 'child' ? 80
      : ag === 'preteen' ? 120 : ag === 'teen' ? 150
      : ag === 'young_adult' ? 150 : ag === 'adult' ? 150
      : ag === 'middle_age' ? 120 : 100;
    const genderFactor = member.gender === 'female' ? 0.85 : 1;
    const adjStaplePerMeal = Math.round(baseStaplePerMeal * genderFactor);
    // 全天主食 = 每餐 × 规划的餐数 (未规划的餐次也算，因为也要吃主食)
    const totalMealsPerDay = 3; // 一天3餐都需要主食
    const adjStapleGrams = adjStaplePerMeal * totalMealsPerDay;
    const stapleCalories = Math.round(adjStapleGrams * 1.3); // 米饭~130kcal/100g

    // 水果建议 (全天总量，不按餐分)
    const fruitGrams = ag === 'toddler' ? 100 : ag === 'child' ? 150
      : ag === 'senior' || ag === 'middle_age' ? 150 : 200;
    const fruitCalories = Math.round(fruitGrams * 0.5); // 水果平均~50kcal/100g

    // 跳过的餐次建议
    // 三餐热量比例: 早25% 午40% 晚35%
    const allMeals: Array<{ type: 'breakfast' | 'lunch' | 'dinner'; label: string; ratio: number }> = [
      { type: 'breakfast', label: '早餐', ratio: 0.25 },
      { type: 'lunch', label: '午餐', ratio: 0.40 },
      { type: 'dinner', label: '晚餐', ratio: 0.35 },
    ];
    const skippedMeals = allMeals
      .filter(m => !profile.mealsPerDay.includes(m.type))
      .map(m => {
        // 该餐总热量 = 目标 * 比例
        const totalMealCal = Math.round(member.dailyCalorieTarget * m.ratio);
        // 减去该餐中主食/水果/汤的建议热量（已经单独给了建议）
        const mealStaple = (profile.stapleMode || 'off') === 'off' ? Math.round(stapleCalories / profile.mealsPerDay.length) : 0;
        const mealFruit = !profile.includeFruit ? Math.round(fruitCalories / 3) : 0; // 水果按3餐平摊
        const mealSoup = !profile.includeSoup ? 15 : 0; // 汤按单餐~15kcal
        const suggestedCalories = Math.max(0, totalMealCal - mealStaple - mealFruit - mealSoup);
        return {
          mealType: m.type as 'breakfast' | 'lunch' | 'dinner',
          label: m.label,
          suggestedCalories,
        };
      });

    // 热量缺口 = 个人目标 - 菜品热量 - 跳过餐次的建议热量
    const skippedTotal = skippedMeals.reduce((s, m) => s + m.suggestedCalories, 0);
    const gap = Math.max(0, member.dailyCalorieTarget - memberDishCalories - skippedTotal);

    return {
      memberId: member.id,
      memberName: member.name,
      ageGroup: ag,
      gender: member.gender || 'male' as const,
      dailyTarget: member.dailyCalorieTarget,
      dishCalories: memberDishCalories,
      staplePerMeal: adjStaplePerMeal,
      stapleGrams: adjStapleGrams,
      stapleCalories,
      fruitGrams,
      fruitCalories,
      skippedMeals,
      gap,
    };
  });

  // 水果推荐 (开启时生成每周2-5种水果方案)
  let fruitPlan: { fruits: { fruitId: string; fruitName: string; caloriesPer100g: number }[]; memberDaily: { memberName: string; dailyGrams: number; dailyCalories: number }[] } | undefined;
  if (profile.includeFruit) {
    // 不能直接吃的水果（调味用、脂肪类）
    const EXCLUDE_FRUITS = new Set(['lemon', 'avocado']);
    const edibleFruits = getAllIngredients().filter(i => i.category === 'fruit' && !EXCLUDE_FRUITS.has(i.id));

    /**
     * 营养学水果推荐原则:
     * 1. 每日摄入量: 成人200-350g, 儿童150-200g, 幼儿100-150g (中国居民膳食指南)
     * 2. 颜色多样化: 不同颜色水果提供不同营养素
     *    - 红色(草莓/樱桃): 花青素、维C
     *    - 黄橙色(芒果/橙子/桃): 胡萝卜素、维A
     *    - 绿色(猕猴桃): 维C、叶酸
     *    - 白色(梨/香蕉): 钾、膳食纤维
     * 3. 每周建议4-6种轮换，保证营养多样性
     * 4. 每天1-2种即可，不必每天都换
     * 5. 优先当季水果
     * 6. 糖尿病人群应避免高糖水果(葡萄/芒果/西瓜)
     */

    // 按营养特征分组，每组至少选1种保证多样性
    const groups: Record<string, typeof edibleFruits> = {
      high_vc: edibleFruits.filter(f => ['orange','kiwi','strawberry','mandarin'].includes(f.id)),
      berries: edibleFruits.filter(f => ['blueberry','cherry','strawberry','grape'].includes(f.id)),
      tropical: edibleFruits.filter(f => ['mango','dragon_fruit','banana'].includes(f.id)),
      common: edibleFruits.filter(f => ['apple','pear','peach','plum'].includes(f.id)),
      melon: edibleFruits.filter(f => ['watermelon','cantaloupe'].includes(f.id)),
    };

    // 当前月份(新西兰时区)
    const currentMonth = String(new Date().getMonth() + 1);

    // 优先当季水果
    const inSeason = edibleFruits.filter(f => f.season && f.season.length > 0 && f.season.includes(currentMonth));
    const offSeason = edibleFruits.filter(f => !f.season || f.season.length === 0 || !f.season.includes(currentMonth));

    // 每组随机选1种(优先当季)，再补充到4-6种
    const selected = new Set<string>();
    const selectedFruits: typeof edibleFruits = [];

    for (const [, group] of Object.entries(groups)) {
      if (group.length === 0) continue;
      // 优先选当季的
      const seasonalInGroup = group.filter(f => inSeason.some(s => s.id === f.id));
      const pool = seasonalInGroup.length > 0 ? seasonalInGroup : group;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!selected.has(pick.id)) {
        selected.add(pick.id);
        selectedFruits.push(pick);
      }
    }

    // 补充: 先从当季剩余中选，再从非当季中选
    const targetCount = Math.min(edibleFruits.length, 4 + Math.floor(Math.random() * 3)); // 4-6种
    const remainingSeasonal = inSeason.filter(f => !selected.has(f.id)).sort(() => Math.random() - 0.5);
    const remainingOff = offSeason.filter(f => !selected.has(f.id)).sort(() => Math.random() - 0.5);
    const remaining = [...remainingSeasonal, ...remainingOff];

    while (selectedFruits.length < targetCount && remaining.length > 0) {
      const pick = remaining.pop()!;
      selected.add(pick.id);
      selectedFruits.push(pick);
    }

    // 每位成员的每日水果建议量 (中国居民膳食指南)
    function getMemberFruitG(ageGroup: string, gender: string): number {
      const base = ageGroup === 'toddler' ? 100 : ageGroup === 'child' ? 150
        : ageGroup === 'preteen' ? 200 : ageGroup === 'teen' ? 250
        : ageGroup === 'young_adult' ? 300 : ageGroup === 'adult' ? 250
        : ageGroup === 'middle_age' ? 200 : 200;
      return gender === 'female' ? Math.round(base * 0.9) : base;
    }

    // 水果列表(共用)
    const avgCalPer100g = Math.round(selectedFruits.reduce((s, f) => s + f.nutrition.calories, 0) / selectedFruits.length);

    fruitPlan = {
      fruits: selectedFruits.map(f => ({
        fruitId: f.id,
        fruitName: f.nameZh,
        caloriesPer100g: f.nutrition.calories,
      })),
      memberDaily: effectiveMembers.map(m => {
        const totalG = getMemberFruitG(m.ageGroup, m.gender || 'male');
        return {
          memberName: m.name,
          dailyGrams: totalG,
          dailyCalories: Math.round(totalG * avgCalPer100g / 100),
        };
      }),
    };
  }

  return {
    id: `plan_${Date.now()}`,
    weekStart: monday.toISOString().split('T')[0],
    slots,
    totalCalories,
    totalCost: Math.round(totalCost * 100) / 100,
    memberAdvice,
    fruitPlan,
    createdAt: now.toISOString(),
  };
}

// ============================================================
// 采购清单生成
// ============================================================

function getUnitGrams(ingredient: Ingredient): number {
  switch (ingredient.unit) {
    case 'kg': return 1000;
    case 'litre': return 1000;
    case 'dozen': return 600;
    case 'bottle': return 500;
    case 'pack': return 250;
    case 'bunch': return 200;
    case 'piece': return 200;
    case 'loaf': return 600;
    default: return 500;
  }
}

export function generateShoppingList(plan: WeeklyPlan, ownedIngredients: string[] = []): ShoppingList {
  const allRecipesList = getAllRecipes();
  const recipeMap = new Map(allRecipesList.map(r => [r.id, r]));
  const ownedSet = new Set(ownedIngredients);

  const itemMap = new Map<string, ShoppingItem>();

  for (const slot of plan.slots) {
    for (const mr of (slot.recipes || [])) {
      const recipe = recipeMap.get(mr.recipeId);
      if (!recipe) continue;

      const ratio = slot.servings / recipe.servings;

      for (const ri of recipe.ingredients) {
        const ingredient = getIngredientById(ri.ingredientId);
        if (!ingredient) continue;

        const amount = ri.amount * ratio;
        const existing = itemMap.get(ri.ingredientId);

        if (existing) {
          existing.totalAmount += amount;
          existing.estimatedPrice += (amount / getUnitGrams(ingredient)) * ingredient.priceNZD;
          if (!existing.fromRecipes.includes(recipe.nameZh)) {
            existing.fromRecipes.push(recipe.nameZh);
          }
        } else {
          itemMap.set(ri.ingredientId, {
            ingredientId: ri.ingredientId,
            ingredientName: ingredient.nameZh,
            ingredientNameEn: ingredient.nameEn,
            totalAmount: amount,
            unit: ri.unit,
            estimatedPrice: (amount / getUnitGrams(ingredient)) * ingredient.priceNZD,
            category: ingredient.category,
            isOwned: ownedSet.has(ri.ingredientId),
            isPurchased: false,
            fromRecipes: [recipe.nameZh],
          });
        }
      }
    }
  }

  const items = Array.from(itemMap.values()).map(item => ({
    ...item,
    totalAmount: Math.round(item.totalAmount),
    estimatedPrice: Math.round(item.estimatedPrice * 100) / 100,
  }));

  const categoryOrder: Record<string, number> = {
    meat: 0, seafood: 1, egg_dairy: 2, vegetable: 3, fruit: 4,
    grain: 5, bean: 6, seasoning: 7, oil: 8, dried: 9, other: 10,
  };
  items.sort((a, b) => (categoryOrder[a.category] ?? 10) - (categoryOrder[b.category] ?? 10));

  const totalCost = items.filter(i => !i.isOwned).reduce((sum, i) => sum + i.estimatedPrice, 0);

  return {
    id: `list_${Date.now()}`,
    weeklyPlanId: plan.id,
    items,
    totalEstimatedCost: Math.round(totalCost * 100) / 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
