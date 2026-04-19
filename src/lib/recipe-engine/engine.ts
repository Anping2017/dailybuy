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

interface ConditionRule {
  blockedTags?: HealthTag[];
  blockedDietaryFlags?: string[];   // 屏蔽聚合到菜谱的 dietaryFlags(processed/contains_alcohol/high_purine/high_cholesterol)
  preferredHighlights?: NutritionHighlight[];
  perMealLimits?: Partial<Record<'sodium'|'sugar'|'fat'|'carbs'|'protein'|'calories', number>>;
}
interface RestrictionRule { blockedCategories?: IngredientCategory[]; blockedIngredients?: string[]; blockedTags?: HealthTag[]; blockedDietaryFlags?: string[]; }

// 幼儿/儿童自动屏蔽酒精(无需显式配置)
const CHILD_AGE_GROUPS = new Set(['toddler', 'child']);

/** 过滤出参与规划的成员(enabled !== false) */
export function getActiveMembers(profile: UserProfile): FamilyMember[] {
  const list = profile.members.filter(m => m.enabled !== false);
  // 至少保留 1 个成员避免空集
  return list.length > 0 ? list : profile.members;
}

function getBlockedTags(members: FamilyMember[]): Set<HealthTag> {
  const tags = new Set<HealthTag>();
  for (const m of members) {
    if (m.enabled === false) continue;  // 跳过已禁用成员
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

/** 收集需要屏蔽的菜谱级 dietaryFlags(processed/high_purine/contains_alcohol/high_cholesterol) */
function getBlockedDietaryFlags(members: FamilyMember[]): Set<string> {
  const flags = new Set<string>();
  for (const m of members) {
    if (m.enabled === false) continue;
    for (const c of m.healthConditions) {
      if (c === 'none') continue;
      const rule = (healthRulesData.conditions as Record<string, ConditionRule>)[c];
      (rule?.blockedDietaryFlags || []).forEach(f => flags.add(f));
    }
    for (const r of m.dietaryRestrictions) {
      const rule = (healthRulesData.restrictions as Record<string, RestrictionRule>)[r];
      (rule?.blockedDietaryFlags || []).forEach(f => flags.add(f));
    }
    if (CHILD_AGE_GROUPS.has(m.ageGroup)) flags.add('contains_alcohol');
  }
  return flags;
}

/** 收集每餐营养上限(取所有 active 成员中最严格的) */
function getPerMealLimits(members: FamilyMember[]): Partial<Record<string, number>> {
  const limits: Record<string, number> = {};
  for (const m of members) {
    if (m.enabled === false) continue;
    for (const c of m.healthConditions) {
      if (c === 'none') continue;
      const rule = (healthRulesData.conditions as Record<string, ConditionRule>)[c];
      if (!rule?.perMealLimits) continue;
      for (const [k, v] of Object.entries(rule.perMealLimits)) {
        if (typeof v !== 'number') continue;
        // 取每个营养素最严格(最低)的限制
        limits[k] = limits[k] !== undefined ? Math.min(limits[k], v) : v;
      }
    }
  }
  return limits;
}

/** 按用户健康状况收集"偏好的营养亮点",用于正向加权评分 */
function getPreferredHighlights(members: FamilyMember[]): Set<NutritionHighlight> {
  const hs = new Set<NutritionHighlight>();
  for (const m of members) {
    if (m.enabled === false) continue;
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
  const active = members.filter(m => m.enabled !== false);
  if (!active.length) return 0;
  // 聚合家庭目标: 有几个成员偏向某目标
  const counts: Record<string, number> = { cutting: 0, bulking: 0, wellness: 0 };
  for (const m of active) {
    const g = m.fitnessGoal || 'maintain';
    if (g !== 'maintain') counts[g] = (counts[g] || 0) + 1;
  }
  const total = active.length;

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
    if (m.enabled === false) continue;
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
    if (m.enabled === false) continue;
    for (const r of m.dietaryRestrictions) {
      const rule = (healthRulesData.restrictions as Record<string, RestrictionRule>)[r];
      if (rule?.blockedIngredients) rule.blockedIngredients.forEach(id => ids.add(id));
    }
  }
  return ids;
}

export function isRecipeSafe(recipe: Recipe, profile: UserProfile): boolean {
  const blockedTags = getBlockedTags(profile.members);
  const blockedFlags = getBlockedDietaryFlags(profile.members);
  const blockedCats = getBlockedCategories(profile.members);
  const blockedIds = getBlockedIngredientIds(profile.members);
  const perMealLimits = getPerMealLimits(profile.members);
  // 长期排除食材：profile 全局 + 每个启用的成员的排除
  const userExcluded = new Set<string>(profile.excludeIngredients || []);
  for (const m of profile.members) {
    if (m.enabled === false) continue;
    for (const id of (m.excludeIngredients || [])) userExcluded.add(id);
  }

  // === 食材级硬过滤 ===
  for (const ri of recipe.ingredients) {
    if (blockedIds.has(ri.ingredientId)) return false;
    if (userExcluded.has(ri.ingredientId)) return false;
    const ingredient = getIngredientById(ri.ingredientId);
    if (!ingredient) continue;
    if (blockedCats.has(ingredient.category)) return false;
    for (const tag of (ingredient.allergens || [])) {
      if (blockedTags.has(tag)) return false;
    }
    for (const tag of (ingredient.warnings || [])) {
      if (blockedTags.has(tag)) return false;
    }
  }

  // === 菜谱级硬过滤(基于预计算字段) ===
  // 菜谱聚合的 dietaryFlags(processed/high_purine/contains_alcohol/high_cholesterol)
  if (blockedFlags.size > 0 && recipe.dietaryFlags) {
    for (const f of recipe.dietaryFlags) {
      if (blockedFlags.has(f)) return false;
    }
  }
  // 同时聚合菜谱的 allergens(食材级 allergens 已在上面查过,这里覆盖菜谱级 allergens 字段)
  if (recipe.allergens) {
    for (const a of recipe.allergens) {
      if (blockedTags.has(a)) return false;
    }
  }

  // === 每份营养硬过滤(对应病症的每餐上限) ===
  if (recipe.perServing && Object.keys(perMealLimits).length > 0) {
    const ps = recipe.perServing;
    for (const [k, lim] of Object.entries(perMealLimits)) {
      if (typeof lim !== 'number') continue;
      const v = (ps as Record<string, number>)[k];
      if (typeof v === 'number' && v > lim) return false;
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

/**
 * 判断菜是否为荤菜
 * 优先读显式字段 recipe.isVegetarian（由 scripts/enrich-recipes.js 预计算）
 * 只在字段缺失时回退到 ingredients 遍历
 */
function isMeatDish(recipe: Recipe): boolean {
  if (typeof recipe.isVegetarian === 'boolean') return !recipe.isVegetarian;
  return recipe.ingredients.some(ri => {
    const ing = getIngredientById(ri.ingredientId);
    return ing && MEAT_CATEGORIES.has(ing.category);
  });
}

/**
 * 名字含主食关键词 → 算主食(覆盖 cookingMethod 错分类)
 * 注意: 用更明确的复合词避免误伤(如"包菜/拌菜/面色"不是主食)
 */
function isStapleByName(recipe: Recipe): boolean {
  const name = recipe.nameZh || '';
  const en = (recipe.nameEn || '').toLowerCase();
  // 排除明显不是主食的(凉拌/沙拉等)
  if (/凉拌|凉菜|沙拉|拌(?!面|粉|饭)|蘸料|包菜|包心菜|大白菜|小白菜|菜花/.test(name)) return false;
  // 排除明确的甜点饼类
  if (/月饼|蛋挞|蛋黄酥|凤梨酥|奶黄包|流沙包|甜甜圈|donut/.test(name+en)) return false;
  if (/粥|饭$|米饭|蛋炒饭|盖饭|烩饭|炒饭|寿司|意面|意大利面|乌冬|拉面|肠粉|河粉|米线|米粉|面条|面$|凉面|拌面|炒面|烩面|擀面|碱面|面包|烤面包|三明治|汉堡|薯条|吐司|馒头|花卷|馕|烧饼|大饼|烙饼|煎饼|蛋饼|手抓饼|烤饼|包子|生煎|小笼|烧麦|饺子|馄饨|抄手|凉皮|凉粉|粽子|韭菜盒子|意式饺|烤红薯|蒸红薯|蒸玉米|汤圆|元宵|汤包|汤饭/.test(name)) return true;
  // 通用"X饼/X糕" — 含蔬菜/谷物名的饼/糕(中式咸味早餐),按主食处理
  if (/(?:萝卜|玉米|土豆|红薯|地瓜|韭菜|胡萝卜|卷心菜|包菜|香葱|葱油|香菜|海带|紫菜|海鲜|鸡蛋|猪肉|牛肉|虾).*?饼|(?:萝卜|玉米|土豆|红薯|地瓜|韩式).*?糕|年糕|大阪烧|韩式煎饼|韩式海鲜煎饼|海鲜煎饼|蛋抓饼|抓饼/.test(name)) return true;
  // 豆腐脑(中式早餐主食)
  if (/豆腐脑/.test(name)) return true;
  // 西式 pancake/waffle/crepe(默认主食)
  if (/松饼|华夫饼|可丽饼|班戟|墨西哥饼|tortilla|pita|naan|pancake|waffle|crepe/.test(name+en)) return true;
  // 蒸蛋糕(咸口)
  if (/蒸鸡蛋糕|蒸蛋糕|咸蛋糕/.test(name)) return true;
  return false;
}

/**
 * 主食子类型推断: 粥/饭/面/饼/馒头/包子/饺子
 * 优先读显式字段 recipe.stapleCategory（对齐 UserProfile.StaplePreference）
 * 字段缺失时回退到 nameZh 关键词匹配
 *
 * stapleCategory → subtype 映射（保持原评分语义）:
 *   congee  → porridge
 *   rice    → rice
 *   noodles → noodle
 *   bread   → pancake  (烤物/饼类统一归 pancake 评分)
 *   mantou  → bun      (馒头/包子/饺子统一归 bun 评分)
 */
function stapleSubtype(recipe: Recipe): string {
  if (recipe.stapleCategory) {
    switch (recipe.stapleCategory) {
      case 'congee': return 'porridge';
      case 'rice': return 'rice';
      case 'noodles': return 'noodle';
      case 'bread': return 'pancake';
      case 'mantou': return 'bun';
    }
  }
  const n = recipe.nameZh || '';
  if (/粥/.test(n)) return 'porridge';
  if (/饭|寿司/.test(n)) return 'rice';
  if (/面条|面$|拌面|炒面|烩面|凉面|乌冬|拉面|意面|米线|米粉|肠粉|河粉/.test(n)) return 'noodle';
  if (/馒头|花卷|馕/.test(n)) return 'mantou';
  if (/饼/.test(n)) return 'pancake';
  if (/包子|小笼|烧麦/.test(n)) return 'bun';
  if (/饺子|馄饨|抄手/.test(n)) return 'dumpling';
  if (/红薯|玉米|南瓜/.test(n)) return 'tuber';
  if (/豆浆|粽子/.test(n)) return 'other';
  return 'other';
}

/** 名字含汤关键词 → 算汤(覆盖 cookingMethod 错分类), 排除"汤圆"等主食 */
function isSoupByName(recipe: Recipe): boolean {
  const name = recipe.nameZh || '';
  // 例外: 汤圆/汤饭/汤面/汤粉 等是主食, 不是汤
  if (/汤圆|汤饭|汤面|汤粉|汤包/.test(name)) return false;
  return /汤$|羹$|煲$|高汤|清汤|浓汤|奶汤|鱼汤|肉汤|菜汤|蛋汤|味噌|罗宋|乌鸡汤|鸡汤|肉骨茶/.test(name);
}

/**
 * 蛋汤判断: 介于荤汤和素汤之间的特殊汤类
 * 优先读显式字段 recipe.dishStyle === 'egg' + dishRole === 'soup'
 * 字段缺失时回退到原推断逻辑
 */
function isEggSoup(recipe: Recipe): boolean {
  if (recipe.dishRole === 'soup' && recipe.dishStyle === 'egg') return true;
  if (recipe.dishRole && recipe.dishRole !== 'soup') return false;  // 显式非汤 → 跳过
  if (!isSoupByName(recipe) && recipe.cookingMethod !== 'soup') return false;
  const name = recipe.nameZh || '';
  const hasEggInName = /蛋花|蛋羹|鸡蛋|蛋汤/.test(name);
  const hasEggIngredient = recipe.ingredients.some(ri => ri.ingredientId === 'egg');
  if (!hasEggInName && !hasEggIngredient) return false;
  return !isMeatDish(recipe);
}

/** 名字含饮品关键词 → 算饮品(不参与正餐推荐) — 严格,排除"可乐鸡翅/豆浆油条"等 */
function isBeverage(recipe: Recipe): boolean {
  const name = recipe.nameZh || '';
  if (/汤|羹/.test(name)) return false;
  if (/鸡翅|鸡块|鸡腿|鸡肉|猪肉|牛肉|羊肉|鱼|虾|油条|包|碗|饼|意面|沙拉|烩|焖/.test(name)) return false;
  return /茶$|奶茶$|果汁$|柠檬水$|咖啡$|拿铁$|卡布奇诺|摩卡$|奶昔$|思慕雪|smoothie$|气泡水|苏打水|柚子蜜$|蜂蜜水|姜茶|柠水$|椰汁$|椰奶$|米酒$|豆浆$|豆奶$|杏仁奶$|燕麦奶$|牛奶$|酸奶$|热可可|热巧克力|hot chocolate|matcha latte|拉茶$|奶昔碗$/.test(name);
}

/** 点心/零食识别(甜点 + 油炸小食 + 糕饼类) — 不参与正餐推荐 */
function isSnack(recipe: Recipe): boolean {
  const name = recipe.nameZh || '';
  const en = (recipe.nameEn || '').toLowerCase();
  if (/猪肉|牛肉|羊肉|鸡肉|鸡翅|鸡腿|鸡块|鸡丁|鸭肉|鱼肉|鱼饼|虾饼|蒸蛋|蒸水蛋|蛋羹|肉饼|肉松|蟹/.test(name)) return false;
  if (/炸鸡|炒鸡|烤鸡|焖鸡|卤鸡/.test(name)) return false;
  if (recipe.cookingMethod === 'staple' || isStapleByName(recipe)) return false;
  if (/拔丝|糖葫芦|糖渍|蜜饯|糖霜|焦糖/.test(name)) return true;
  if (/月饼|绿豆糕|桃酥|麻花|麻团|麻球|豆沙包|凤梨酥|蛋黄酥|蛋挞$|蛋挞|奶黄包|流沙包|糯米糍|双皮奶|龟苓膏|凉糕|绿豆汤|红豆汤|银耳羹|布丁|果冻|杏仁豆腐/.test(name)) return true;
  if (/^(?!.*咸).*蛋糕|cake|曲奇|cookie|饼干|biscuit|布朗尼|brownie|cupcake|马卡龙|macaron|tiramisu|提拉米苏|cheesecake|芝士蛋糕|甜挞|甜派|tart|派$|pie|甜甜圈|donut|doughnut|司康|scone|甜可丽饼|sweet crepe|华夫$|waffle|pudding|布丁|mousse|慕斯|gelato|ice cream|冰淇淋|sorbet|sundae|圣代/.test(name + en)) return true;
  if (/蒸蛋|蒸鸡蛋|咸蛋糕/.test(name)) return false;
  if (/^(?!.*肉)(.*丸子)$|^炸丸子|薯片|爆米花|popcorn|chips$|nuggets/.test(name + en)) return true;
  return false;
}

/** 是否参与正餐规划(饮品/点心不参与) */
function isPlannable(recipe: Recipe): boolean {
  // 优先读显式字段
  if (recipe.dishRole) return recipe.dishRole !== 'drink' && recipe.dishRole !== 'snack';
  return !isBeverage(recipe) && !isSnack(recipe);
}

/**
 * 推断菜在一餐中的角色
 * 优先读显式字段 recipe.dishRole（由 scripts/enrich-recipes.js 预计算）
 * 字段缺失时回退到 regex + ingredient 遍历（向后兼容用户自定义菜谱）
 *
 * 分类体系:
 * - drink: 饮品(茶/咖啡等), 不参与规划
 * - snack: 点心零食, 不参与规划
 * - staple: 主食(粥/饭/面/饼等)
 * - soup: 汤
 * - cold: 凉菜(含荤凉菜和素凉菜, 不按荤素分)
 * - main_meat: 热的荤菜
 * - main_veg: 热的素菜
 */
function inferRole(recipe: Recipe): DishRole {
  if (recipe.dishRole) return recipe.dishRole;
  if (isBeverage(recipe)) return 'drink';
  if (isSnack(recipe)) return 'snack';
  if (recipe.cookingMethod === 'staple' || isStapleByName(recipe)) return 'staple';
  if (recipe.cookingMethod === 'soup' || isSoupByName(recipe)) return 'soup';
  if (recipe.cookingMethod === 'cold_dish') return 'cold';
  if (isMeatDish(recipe)) return 'main_meat';
  return 'main_veg';
}

// ============================================================
// 过滤 + 排序
// ============================================================

/** 获取符合用户条件的菜谱（自动放宽保证有结果） */
export function getFilteredRecipes(profile: UserProfile, mealType?: MealType): Recipe[] {
  // 合并: 内置审核菜谱 + 用户自定义菜谱
  const customRecipes = profile.customRecipes || [];
  const all = [...getReviewedRecipes(), ...customRecipes].filter(isPlannable); // 饮品/点心不参与规划

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
 * 季节性评分: 当前月份不在食材 season 列表中 → 扣分
 * (食材有 season 字段才参与评分; 没有的当作全年可买)
 * 假设南半球(NZ)
 */
function scoreSeasonality(recipe: Recipe): number {
  const month = String(new Date().getMonth() + 1);  // 1-12
  let outOfSeason = 0;
  let inSeasonHits = 0;
  for (const ri of recipe.ingredients) {
    const ing = getIngredientById(ri.ingredientId);
    if (!ing || !ing.season || ing.season.length === 0) continue;
    if (ing.season.includes(month)) inSeasonHits++;
    else outOfSeason++;
  }
  // 不当季食材每个 -1.5; 当季食材每个 +0.5 (轻量加权)
  return inSeasonHits * 0.5 - outOfSeason * 1.5;
}

/**
 * 计算一份菜(按 familySize 份)的预估热量
 * recipe 的原始热量是按 recipe.servings 算的，这里缩放到 familySize 份
 */
function calcRecipeCalForFamily(recipe: Recipe, _familySize: number): number {
  // 食材不缩放: 一道菜的总热量就是配方总热量(做整份)
  // _familySize 参数保留为兼容 API, 实际不再使用
  return Math.round(calcRecipeNutrition(recipe).totalCalories);
}

/** 成员的"参与规划"每日热量 = 原目标 - 跳过餐次的占比(25%/40%/35%) */
export function getMemberPlanningDailyCal(member: FamilyMember): number {
  const skip = member.skipMeals || [];
  const ratioMap: Record<MealType, number> = { breakfast: 0.25, lunch: 0.40, dinner: 0.35 };
  const skipRatio = skip.reduce((s, m) => s + (ratioMap[m] || 0), 0);
  return Math.max(500, Math.round(member.dailyCalorieTarget * (1 - skipRatio)));
}

/**
 * 计算每餐的热量预算 (家庭总和)
 *
 * 原则:
 *  - 3 餐比例: 25/40/35 (早/午/晚)
 *  - 只规划部分餐次时, 剩余餐次按比例归一到这几餐 (例: 只规划午+晚 → 午 53% / 晚 47%)
 *  - 跳过本餐的成员不计入本餐预算 (如: 妈妈不吃早餐 → 早餐预算 = 爸爸+孩子)
 *  - 禁用的成员(enabled=false) 完全不计入
 *  - 带饭模式(lunchboxMode): 午餐由前晚剩菜补足, 占比归一时视为 "3 餐都活跃"
 *    (避免把午餐比例再分给早/晚导致预算翻倍)
 *  - familySize > 成员数时, 多出的按平均目标计(占位成员, 无个性化配置)
 */
export function getMealCalorieBudget(profile: UserProfile, mealType: MealType): number {
  const active = profile.members.filter(m => m.enabled !== false);
  const members = active.length > 0 ? active : profile.members;
  const ratioMap: Record<MealType, number> = { breakfast: 0.25, lunch: 0.40, dinner: 0.35 };
  const avgTarget = members.length > 0
    ? members.reduce((s, m) => s + m.dailyCalorieTarget, 0) / members.length
    : 2000;
  const extraPeople = Math.max(0, profile.familySize - profile.members.length);

  // 家庭总日目标(所有启用成员 + 占位成员; 不扣 skipMeals 因为 skipMeals 影响具体餐次而非日总)
  const householdDaily = members.reduce((s, m) => s + m.dailyCalorieTarget, 0)
    + extraPeople * avgTarget;

  // 家庭未开启品类预估(营养学: 主食 25% / 水果 7% / 汤 4% × 日目标)
  // 只算启用且参与本餐的成员 (skipMeals 未跳过本餐)
  const membersForThisMeal = members.filter(m => !(m.skipMeals || []).includes(mealType));
  const thisMealHouseholdTarget = membersForThisMeal.reduce((s, m) => s + m.dailyCalorieTarget, 0)
    + extraPeople * avgTarget;
  const stapleGap = (profile.stapleMode || 'off') === 'off' ? householdDaily * 0.25 : 0;
  const fruitGap = !profile.includeFruit ? householdDaily * 0.07 : 0;
  const soupGap = !profile.includeSoup ? householdDaily * 0.04 : 0;
  const totalGaps = stapleGap + fruitGap + soupGap;

  const activeMeals = profile.mealsPerDay;
  if (!activeMeals.includes(mealType)) return 0;

  // === 带饭模式: 晚餐吸收午餐份额 + 所有品类缺口 ===
  // 用户需求: 晚餐目标 = 日目标 - 早餐 - 缺口(主食/水果/汤未开启的预估)
  //   理由: 午餐由晚餐剩菜补, 所以 dinner_cooked = 今日 dinner + 明日 lunch
  //         早餐单独吃, 其他缺口都是用户自补, 剩下的就是晚餐要规划的量
  if (profile.lunchboxMode && mealType === 'dinner') {
    const breakfastShare = activeMeals.includes('breakfast') ? householdDaily * 0.25 : 0;
    const dinnerBudget = householdDaily - breakfastShare - totalGaps;
    return Math.round(Math.max(500, dinnerBudget));
  }

  // === 带饭模式早餐: 保持 25% × 日目标 (缺口全给 dinner) ===
  if (profile.lunchboxMode && mealType === 'breakfast') {
    return Math.round(householdDaily * 0.25);
  }

  // === 非带饭模式: 按比例归一, 缺口按本餐占比扣 ===
  const effectiveWeightTotal = activeMeals.reduce((s, m) => s + (ratioMap[m] || 0.33), 0) || 1;
  const mealRatio = ratioMap[mealType] || 0.33;
  const mealShare = mealRatio / effectiveWeightTotal;
  // 本餐预算(未扣缺口): 跳餐成员不计入本餐 → 用 thisMealHouseholdTarget 代替 householdDaily
  const mealBase = thisMealHouseholdTarget * mealShare;
  // 缺口按本餐占比扣
  const mealGaps = totalGaps * mealShare;
  const budget = Math.max(300, mealBase - mealGaps);
  return Math.round(budget);
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

  // 久未推荐加权: 让常被推荐的菜分数衰减, 让冷门菜有机会
  // (用 recipePreferences 中的 lastInteraction; 如果没有记录则视为新菜 +3)
  // getPreference 调用方应已经把 getRecentCookPenalty 合并进去, 即"近期做过"会扣分
  if (getPreference) {
    const score0 = getPreference(recipe.id);
    if (score0 === 0) score += 3;  // 从没见过 → 鼓励(从 2 提升到 3, 强化新菜出现)
  }

  // 营养亮点加权(根据家庭健康状况偏好)
  const preferred = getPreferredHighlights(profile.members);
  score += scoreRecipeHighlights(recipe, preferred);

  // 家庭健康目标调整 (减脂/增肌/养生) - 需求4
  score += scoreRecipeByGoals(recipe, profile.members);

  // 收藏菜谱加权: 用户收藏 + 开启随机推荐时 +6
  if (profile.favoritesInRandom !== false && (profile.favoriteRecipes || []).includes(recipe.id)) {
    score += 6;
  }
  // 自定义菜谱稍微加权 +2 (用户自己加的菜希望多看到)
  if (recipe.isCustom) score += 2;

  // servings 匹配度: 偏向选份数与家庭人数匹配的菜，减少 "做 3 人份给 2 人吃" 的浪费
  const servingDiff = Math.abs((recipe.servings || 2) - (profile.familySize || 2));
  if (servingDiff === 0) score += 3;
  else if (servingDiff === 1) score += 1;
  else if (servingDiff === 2) score -= 2;
  else score -= 5;

  // 季节性食材评分（不当季 → 扣分）
  score += scoreSeasonality(recipe);

  // 主食多样性: 粥太容易被推荐, 其他主食类型加分
  if (inferRole(recipe) === 'staple') {
    const subtype = stapleSubtype(recipe);
    if (subtype === 'porridge') score -= 2;           // 粥降权(避免总是粥)
    else if (subtype === 'rice') score += 1;          // 米饭
    else if (subtype === 'mantou' || subtype === 'bun') score += 3;  // 馒头包子(少见)
    else if (subtype === 'pancake') score += 2;       // 各种饼
    else if (subtype === 'dumpling') score += 2;      // 饺子
    else if (subtype === 'tuber') score += 2;         // 薯类/玉米
    // noodle 保持 0
  }

  // 热量预算控制 — 仅在 profile.calorieEnabled !== false 时参与评分
  // 关闭卡路里计算时: 菜谱推荐完全不考虑热量, 纯按口味/季节/偏好等选
  if (profile.calorieEnabled !== false) {
    if (remainingCal !== undefined && remainingCal > 0) {
      const dishCal = calcRecipeCalForFamily(recipe, profile.familySize);
      if (dishCal > remainingCal * 1.5) score -= 15;
      else if (dishCal > remainingCal * 1.2) score -= 8;
      else if (dishCal > remainingCal) score -= 3;
      else if (remainingCal > 800 && dishCal > remainingCal * 0.6) score += 4;
      else if (remainingCal > 500 && dishCal > remainingCal * 0.5) score += 2;
      else if (dishCal <= remainingCal) score += 1;
    } else if (remainingCal !== undefined && remainingCal <= 0) {
      const dishCal = calcRecipeCalForFamily(recipe, profile.familySize);
      score -= Math.min(25, dishCal / 50);
    }
  }
  // else: calorieEnabled === false → 跳过所有热量相关评分

  // 加随机扰动 (0-3) 保证多样性
  score += Math.random() * 3;

  return score;
}

/** 从候选池中选一道(评分最高的前N个中随机, 大幅增加多样性) */
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

  // 热量控制: 如果有预算且剩余很少，只从 top 25% 选；否则 top 50% (扩大池子保证多样性)
  const tight = remainingCal !== undefined && remainingCal > 0 && remainingCal < 400;
  const topPct = tight ? 0.25 : 0.5;
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
 * 自由模式: 可选品类(汤/凉菜) 按人数随机数量
 * - 1-2 人: 固定 1 道 (避免菜太多)
 * - 3-4 人: 随机 1-2 道
 * - 5+ 人: 2 道
 */
function randomOptionalCount(familySize: number): number {
  if (familySize <= 2) return 1;
  if (familySize <= 4) return Math.random() < 0.5 ? 1 : 2;
  return 2;
}

/**
 * 获取每餐菜品数量配置
 * 优先级: 用户自定义 > 按人数自动
 *
 * 自由模式(默认):
 *   - 热菜(荤+素): 按人数标准化, 刚性保证
 *   - 汤/凉菜: 开启则按 "人数/2 ~ 人数" 随机数量(最多2道)
 *   - 主食: 开启则固定 1 道(大份由 servings 变体处理)
 *   - 后续 composeMeal 按当前热量缺口自动加菜/减菜, 不严格按此数量标准
 * 手动模式(customMealComposition.enabled):
 *   - 严格按用户指定数量; 热量缺口通过 UI 提示"建议 ×N 量"补足
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

  // 自由模式: 按人数自动推算 + 开关控制 (汤/凉菜按"人数/2~人数"随机)
  const hot = getHotDishComposition(profile.familySize, mealType);
  const isLunchOrDinner = mealType === 'lunch' || mealType === 'dinner';
  const fs = profile.familySize || 2;
  return {
    meatCount: hot.meatCount,
    vegCount: hot.vegCount,
    soupCount: (profile.includeSoup && isLunchOrDinner) ? randomOptionalCount(fs) : 0,
    stapleCount: ((profile.stapleMode || 'off') !== 'off' && (mealType === 'breakfast' || isLunchOrDinner)) ? 1 : 0,
    coldDishCount: (profile.includeColdDish && isLunchOrDinner) ? randomOptionalCount(fs) : 0,
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
): { recipes: MealRecipe[]; reducedDishes: number } {
  // 带饭模式: engine getMealCalorieBudget 已处理晚餐吸收午餐份额+缺口
  // 不再用 effectiveProfile×2 (改由 budget 本身驱动选菜数量)
  const effectiveProfile = profile;

  const allCandidates = getFilteredRecipes(profile, mealType);
  const plan = getMealPlan(profile, mealType);

  const meatPool = allCandidates.filter(r => inferRole(r) === 'main_meat');
  const vegPool = allCandidates.filter(r => inferRole(r) === 'main_veg');
  const allColdPool = allCandidates.filter(r => inferRole(r) === 'cold');
  const allSoupPool = allCandidates.filter(r => inferRole(r) === 'soup');
  const staplePool = allCandidates.filter(r => inferRole(r) === 'staple');

  // 凉菜/汤按用户偏好过滤(meat=只荤, veg=只素, egg=蛋汤, any=不限)
  const coldStyle = profile.coldDishStyle || 'any';
  const soupStyle = profile.soupStyle || 'any';
  const coldPool = coldStyle === 'any' ? allColdPool
    : coldStyle === 'meat' ? allColdPool.filter(r => isMeatDish(r))
    : allColdPool.filter(r => !isMeatDish(r));
  // 汤过滤: meat=荤汤(不含蛋汤), veg=纯素汤(无蛋), egg=蛋汤独立分类
  const soupPool = soupStyle === 'any' ? allSoupPool
    : soupStyle === 'meat' ? allSoupPool.filter(r => isMeatDish(r))
    : soupStyle === 'egg' ? allSoupPool.filter(r => isEggSoup(r))
    : allSoupPool.filter(r => !isMeatDish(r) && !isEggSoup(r));

  const result: MealRecipe[] = [];

  // 每餐热量预算跟踪 (带饭模式晚餐用 effectiveProfile, familySize 已 ×2)
  const mealBudget = getMealCalorieBudget(effectiveProfile, mealType);
  let accumulatedCal = 0;
  const remainingBudget = () => mealBudget > 0 ? Math.max(0, mealBudget - accumulatedCal) : undefined;
  const trackPick = (r: Recipe) => { accumulatedCal += calcRecipeCalForFamily(r, effectiveProfile.familySize); };

  // 选菜按优先级顺序: 主食 → 荤菜 → 汤 → 凉菜 → 素菜
  // (优先级反映"必保留度", 越靠前越不可能被舍弃)

  // === 1. 主食 (优先级最高) ===
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
      const r = pickBest(filtered, usedIds, effectiveProfile, ownedIngredients, getPreference, getFeedback, remainingBudget());
      if (r) { result.push({ recipeId: r.id, role: 'staple' }); usedIds.add(r.id); trackPick(r); }
    }
  }

  // === 2. 荤菜 ===
  for (let i = 0; i < plan.meatCount; i++) {
    const r = pickBest(meatPool, usedIds, effectiveProfile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (r) { result.push({ recipeId: r.id, role: 'main_meat' }); usedIds.add(r.id); trackPick(r); }
  }

  // === 3. 汤 ===
  for (let i = 0; i < plan.soupCount; i++) {
    const r = pickBest(soupPool, usedIds, effectiveProfile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (r) { result.push({ recipeId: r.id, role: 'soup' }); usedIds.add(r.id); trackPick(r); }
  }

  // === 4. 凉菜 (高于素菜) ===
  // 凉菜独立分类: 含荤凉菜+素凉菜, 优先从 cold_dish 池选; 不够时回退素菜池中的凉拌菜
  for (let i = 0; i < plan.coldDishCount; i++) {
    const fallback = vegPool.filter(r => /凉拌|凉菜|沙拉|拌(?!面|粉|饭)/.test(r.nameZh));
    const pool = coldPool.length > 0 ? coldPool : fallback;
    if (pool.length === 0) break;
    const r = pickBest(pool, usedIds, effectiveProfile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (r) { result.push({ recipeId: r.id, role: 'cold' }); usedIds.add(r.id); trackPick(r); }
  }

  // === 5. 素菜 (最低优先级) ===
  for (let i = 0; i < plan.vegCount; i++) {
    const r = pickBest(vegPool, usedIds, effectiveProfile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (r) { result.push({ recipeId: r.id, role: 'main_veg' }); usedIds.add(r.id); trackPick(r); }
  }

  // === 补充: 如果热菜数远低于预期, 从全池补荤/素 ===
  const minHotDishes = plan.meatCount + plan.vegCount;
  const currentHot = result.filter(mr => mr.role === 'main_meat' || mr.role === 'main_veg').length;
  const hotDishPool = allCandidates.filter(r => {
    const role = inferRole(r);
    return role === 'main_meat' || role === 'main_veg';
  });
  let hotFillSafety = 5;
  while (currentHot + (result.length - currentHot - (plan.stapleCount + plan.soupCount + plan.coldDishCount)) < minHotDishes && hotFillSafety > 0 && hotDishPool.length > 0) {
    hotFillSafety--;
    const r = pickBest(hotDishPool, usedIds, effectiveProfile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (!r) break;
    result.push({ recipeId: r.id, role: isMeatDish(r) ? 'main_meat' : 'main_veg' });
    usedIds.add(r.id);
    trackPick(r);
  }

  // fallback
  if (result.length === 0) {
    const r = pickBest(allCandidates, usedIds, effectiveProfile, ownedIngredients, getPreference, getFeedback, remainingBudget());
    if (r) { result.push({ recipeId: r.id, role: isMeatDish(r) ? 'main_meat' : 'main_veg' }); usedIds.add(r.id); trackPick(r); }
  }

  // 跟踪因超标被减的菜数
  let reducedDishes = 0;

  // 卡路里启用时: 缺口补菜 + 超量移除, 目标接近预算 ±15%
  // 补菜原则:
  //   1. 不补用户未开启的品类(凉菜/汤/主食不开就真不加)
  //   2. 优先选"卡路里最接近缺口"的菜, 避免补太多(如两个人推荐 6 道的情况)
  //   3. 最多补 1-2 次(视家庭规模), 不死循环补小菜
  if (profile.calorieEnabled !== false && mealBudget > 0) {
    const TARGET_LO = mealBudget * 0.85;
    const TARGET_HI = mealBudget * 1.15;
    // 家庭小的最多补 1 道, 大家庭最多 2 道
    const MAX_FILLS = profile.familySize <= 2 ? 1 : 2;
    let fillIters = 0;
    while (accumulatedCal < TARGET_LO && fillIters < MAX_FILLS) {
      fillIters++;
      const deficit = mealBudget - accumulatedCal;
      // 过滤: 排除已用, 排除用户未开启的品类 (凉菜/汤/主食)
      const fillPool = allCandidates.filter(r => {
        if (usedIds.has(r.id)) return false;
        const role = inferRole(r);
        if (role === 'cold' && !profile.includeColdDish) return false;
        if (role === 'soup' && !profile.includeSoup) return false;
        if (role === 'staple' && (profile.stapleMode || 'off') === 'off') return false;
        return true;
      });
      if (fillPool.length === 0) break;

      // 按"卡路里接近缺口"挑 top 候选, 再从中按分数选
      // 排除明显过量 (> 1.3× deficit) 的菜, 避免补一道就爆掉
      const candidates = fillPool
        .map(r => ({ r, cal: calcRecipeCalForFamily(r, profile.familySize) }))
        .filter(x => x.cal > 0 && x.cal <= deficit * 1.3)
        .sort((a, b) => Math.abs(a.cal - deficit) - Math.abs(b.cal - deficit))
        .slice(0, 5);  // 取前 5 个最接近的
      if (candidates.length === 0) break;

      // 在这 5 个候选中, 按综合分数(口味/偏好/季节等) 选最佳
      const pick = pickBest(candidates.map(x => x.r), usedIds, effectiveProfile, ownedIngredients, getPreference, getFeedback, deficit);
      if (!pick) break;
      result.push({ recipeId: pick.id, role: inferRole(pick) });
      usedIds.add(pick.id);
      trackPick(pick);
    }

    // 2) 循环超量移除: 累积超 1.15× 预算时
    // 舍弃优先级 (从高到低): 素菜 → 凉菜 → 汤 → 荤菜  (主食永不舍弃)
    const REMOVAL_PRIORITY: DishRole[] = ['main_veg', 'cold', 'soup', 'main_meat'];
    let rmSafety = 5;
    while (accumulatedCal > TARGET_HI && rmSafety > 0) {
      rmSafety--;
      let removeIdx = -1;
      for (const role of REMOVAL_PRIORITY) {
        removeIdx = result.findIndex(mr => mr.role === role);
        if (removeIdx >= 0) break;
      }
      if (removeIdx < 0) break; // 只剩主食时停止
      const removed = result.splice(removeIdx, 1)[0];
      const removedRecipe = allCandidates.find(r => r.id === removed.recipeId);
      if (removedRecipe) {
        accumulatedCal -= calcRecipeCalForFamily(removedRecipe, effectiveProfile.familySize);
        usedIds.delete(removed.recipeId);
        reducedDishes++;
      }
    }
  }

  return { recipes: result, reducedDishes };
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
      if (getPreference(r.id) === 0) score += 2;  // 从没推荐过的菜 → 鼓励
    }

    // 细粒度反馈调整（不喜欢食材/口味/不方便/太复杂）
    if (getFeedback) {
      score += getFeedback(r);
    }

    // 营养亮点加权(根据家庭健康状况偏好)
    score += scoreRecipeHighlights(r, preferredHighlights);

    // 家庭健康目标调整 (减脂/增肌/养生)
    score += scoreRecipeByGoals(r, profile.members);

    // 收藏 + 自定义加权
    if (profile.favoritesInRandom !== false && (profile.favoriteRecipes || []).includes(r.id)) score += 6;
    if (r.isCustom) score += 2;

    // servings 匹配度
    const servingDiff = Math.abs((r.servings || 2) - (profile.familySize || 2));
    if (servingDiff === 0) score += 3;
    else if (servingDiff === 1) score += 1;
    else if (servingDiff === 2) score -= 2;
    else score -= 5;

    // 季节性
    score += scoreSeasonality(r);

    // 热量预算 — 同 scoreRecipe: 关闭卡路里计算时完全跳过
    if (profile.calorieEnabled !== false) {
      if (remainingCal !== undefined && remainingCal > 0) {
        const dishCal = calcRecipeCalForFamily(r, profile.familySize);
        if (dishCal > remainingCal * 1.5) score -= 15;
        else if (dishCal > remainingCal * 1.2) score -= 8;
        else if (dishCal > remainingCal) score -= 3;
        else if (remainingCal > 800 && dishCal > remainingCal * 0.6) score += 4;
        else if (remainingCal > 500 && dishCal > remainingCal * 0.5) score += 2;
        else if (dishCal <= remainingCal) score += 1;
      } else if (remainingCal !== undefined && remainingCal <= 0) {
        const dishCal = calcRecipeCalForFamily(r, profile.familySize);
        score -= Math.min(25, dishCal / 50);
      }
    }

    // 随机扰动 — 加大保证多样性
    score += Math.random() * 4;

    return { recipe: r, score };
  }).sort((a, b) => b.score - a.score);

  // 从前35%中随机选(加大池子保证多样性, 之前 20% 太窄)
  const topCount = Math.max(1, Math.ceil(scored.length * 0.35));
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
  const allColdPool = allCandidates.filter(r => inferRole(r) === 'cold');
  const allSoupPool = allCandidates.filter(r => inferRole(r) === 'soup');
  const staplePool = allCandidates.filter(r => inferRole(r) === 'staple');

  // smartPlan 也按 coldDishStyle/soupStyle 过滤(蛋汤独立)
  const coldStyle = profile.coldDishStyle || 'any';
  const soupStyle = profile.soupStyle || 'any';
  const coldPool = coldStyle === 'any' ? allColdPool
    : coldStyle === 'meat' ? allColdPool.filter(r => isMeatDish(r))
    : allColdPool.filter(r => !isMeatDish(r));
  const soupPool = soupStyle === 'any' ? allSoupPool
    : soupStyle === 'meat' ? allSoupPool.filter(r => isMeatDish(r))
    : soupStyle === 'egg' ? allSoupPool.filter(r => isEggSoup(r))
    : allSoupPool.filter(r => !isMeatDish(r) && !isEggSoup(r));

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
      // 带饭模式: engine getMealCalorieBudget 已处理 (不再用 effectiveProfile×2)
      const effectiveProfile = profile;
      const plan = getMealPlan(profile, mealType);
      const recipes: MealRecipe[] = [];
      // 本餐热量预算(带饭模式晚餐 budget 翻倍)
      const mealBudget = getMealCalorieBudget(effectiveProfile, mealType);
      let accumulatedCal = 0;
      const remaining = () => mealBudget > 0 ? Math.max(0, mealBudget - accumulatedCal) : undefined;
      const track = (r: Recipe) => { accumulatedCal += calcRecipeCalForFamily(r, effectiveProfile.familySize); };

      // 选菜按优先级: 主食 → 荤菜 → 汤 → 凉菜 → 素菜

      // === 1. 主食 ===
      if (plan.stapleCount > 0 && staplePool.length > 0) {
        let filtered = staplePool;
        const stapleMode = profile.stapleMode || 'off';
        if (stapleMode === 'fixed' && profile.staplePreference?.length > 0 && !profile.staplePreference.includes('any')) {
          const keywords = (profile.staplePreference || []).flatMap(p => STAPLE_KEYWORDS[p] || []);
          const preferred = staplePool.filter(r => keywords.some(k => r.nameZh.includes(k) || r.nameEn.toLowerCase().includes(k.toLowerCase())));
          if (preferred.length > 0) filtered = preferred;
        }
        for (let i = 0; i < plan.stapleCount; i++) {
          const r = smartPick(filtered, usedIds, [], [], [], effectiveProfile, ownedIngredients, getPreference, getFeedback, remaining());
          if (r) { recipes.push({ recipeId: r.id, role: 'staple' }); usedIds.add(r.id); track(r); }
        }
      }

      // === 2. 荤菜 (智能选: 蛋白质轮换) ===
      for (let i = 0; i < plan.meatCount; i++) {
        const adjustedMeatPool = meatPool.filter(r => {
          const pCat = getProteinCategory(getProteinSource(r));
          return (weekProteinCount[pCat] || 0) < Math.ceil(planDays * 0.5);
        });
        const pool = adjustedMeatPool.length >= 3 ? adjustedMeatPool : meatPool;
        const r = smartPick(pool, usedIds, recentProteins, recentVegs, recentMethods, effectiveProfile, ownedIngredients, getPreference, getFeedback, remaining());
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

      // === 3. 汤 ===
      for (let i = 0; i < plan.soupCount; i++) {
        const r = smartPick(soupPool, usedIds, recentProteins, recentVegs, recentMethods, effectiveProfile, ownedIngredients, getPreference, getFeedback, remaining());
        if (r) { recipes.push({ recipeId: r.id, role: 'soup' }); usedIds.add(r.id); track(r); }
      }

      // === 4. 凉菜 ===
      for (let i = 0; i < plan.coldDishCount; i++) {
        const r = smartPick(coldPool, usedIds, recentProteins, recentVegs, recentMethods, effectiveProfile, ownedIngredients, getPreference, getFeedback, remaining());
        if (r) { recipes.push({ recipeId: r.id, role: 'cold' }); usedIds.add(r.id); track(r); }
      }

      // === 5. 素菜 (智能选: 蔬菜不重复) ===
      for (let i = 0; i < plan.vegCount; i++) {
        const r = smartPick(vegPool, usedIds, recentProteins, recentVegs, recentMethods, effectiveProfile, ownedIngredients, getPreference, getFeedback, remaining());
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

      // fallback
      if (recipes.length === 0) {
        const r = smartPick(allCandidates, usedIds, recentProteins, recentVegs, recentMethods, effectiveProfile, ownedIngredients, getPreference, getFeedback, remaining());
        if (r) { recipes.push({ recipeId: r.id, role: isMeatDish(r) ? 'main_meat' : 'main_veg' }); usedIds.add(r.id); track(r); }
      }

      // 热量预算匹配 (与 composeMeal 一致):
      //  1. 不补未开启的品类
      //  2. 选"卡路里最接近缺口"的菜, 避免补太多
      //  3. 最多补 1-2 次 (按家庭规模)
      if (profile.calorieEnabled !== false && mealBudget > 0) {
        const TARGET_LO = mealBudget * 0.85;
        const TARGET_HI = mealBudget * 1.15;
        const MAX_FILLS = profile.familySize <= 2 ? 1 : 2;
        let fillIters = 0;
        while (accumulatedCal < TARGET_LO && fillIters < MAX_FILLS) {
          fillIters++;
          const deficit = mealBudget - accumulatedCal;
          const fillPool = allCandidates.filter(r => {
            if (usedIds.has(r.id)) return false;
            const role = inferRole(r);
            if (role === 'cold' && !profile.includeColdDish) return false;
            if (role === 'soup' && !profile.includeSoup) return false;
            if (role === 'staple' && (profile.stapleMode || 'off') === 'off') return false;
            return true;
          });
          if (fillPool.length === 0) break;
          const candidates = fillPool
            .map(r => ({ r, cal: calcRecipeCalForFamily(r, effectiveProfile.familySize) }))
            .filter(x => x.cal > 0 && x.cal <= deficit * 1.3)
            .sort((a, b) => Math.abs(a.cal - deficit) - Math.abs(b.cal - deficit))
            .slice(0, 5);
          if (candidates.length === 0) break;
          const pick = smartPick(candidates.map(x => x.r), usedIds, recentProteins, recentVegs, recentMethods, effectiveProfile, ownedIngredients, getPreference, getFeedback, deficit);
          if (!pick) break;
          recipes.push({ recipeId: pick.id, role: inferRole(pick) });
          usedIds.add(pick.id);
          track(pick);
        }
        const REMOVAL_PRIORITY: DishRole[] = ['main_veg', 'cold', 'soup', 'main_meat'];
        let rmSafety = 5;
        while (accumulatedCal > TARGET_HI && rmSafety > 0) {
          rmSafety--;
          let removeIdx = -1;
          for (const role of REMOVAL_PRIORITY) {
            removeIdx = recipes.findIndex(mr => mr.role === role);
            if (removeIdx >= 0) break;
          }
          if (removeIdx < 0) break;
          const removed = recipes.splice(removeIdx, 1)[0];
          const removedRecipe = allCandidates.find(r => r.id === removed.recipeId);
          if (removedRecipe) {
            accumulatedCal -= calcRecipeCalForFamily(removedRecipe, effectiveProfile.familySize);
            usedIds.delete(removed.recipeId);
          }
        }
      }

      // 带饭模式: budget 已包含午餐份额 + 缺口, engine 选菜总卡路里已经"2× 正常晚餐"
      // slot.servings = familySize (正常), 用户烹制选出的所有菜品即覆盖 2 餐
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
  // 从今天开始按顺序排, 而不是固定 monday
  const todayJsIdx = new Date().getDay();        // 0=Sun, 1=Mon, ..., 6=Sat
  const todayDayIdx = todayJsIdx === 0 ? 6 : todayJsIdx - 1;  // 转 monday=0
  const activeDays: DayOfWeek[] = [];
  for (let i = 0; i < planDays; i++) {
    activeDays.push(DAYS[(todayDayIdx + i) % 7]);
  }

  let slots: MealSlot[];

  if (profile.recommendMode === 'ai_assist' || profile.recommendMode === 'ai_online') {
    // AI智能模式: 周维度整体规划，蛋白质轮换+蔬菜不重复+做法多样
    slots = generateSmartPlan(profile, ownedIngredients, planDays, activeDays, getPreference, getFeedback);
  } else {
    // 基础模式: 逐餐随机
    const usedIds = new Set<string>();
    slots = [];
    let mealIndex = 0;
    for (const day of activeDays) {
      for (const mealType of profile.mealsPerDay) {
        const { recipes, reducedDishes } = composeMeal(profile, mealType, usedIds, ownedIngredients, mealIndex, getPreference, getFeedback);
        mealIndex++;
        // 带饭模式: budget 已包含午餐份额 + 缺口, 总热量已"2× 正常晚餐" (通过 budget)
        // slot.servings = familySize (不 ×2), 烹制选出的全部菜品即覆盖 2 餐
        slots.push({ day, mealType, recipes, servings: profile.familySize, reducedDishes: reducedDishes > 0 ? reducedDishes : undefined });
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
  // 禁用的成员(enabled=false) 不参与任何计算
  const activeMembers = profile.members.filter(m => m.enabled !== false);
  const enrolledMembers = activeMembers.length > 0 ? activeMembers : profile.members;
  const actualPersons = Math.max(profile.familySize, enrolledMembers.length);
  const dishCaloriesPerDay = planDays > 0 ? Math.round(totalCalories / planDays) : 0;

  // 构建完整的成员列表（补齐到 familySize）- 仅用启用的成员
  const effectiveMembers = [...enrolledMembers];
  while (effectiveMembers.length < profile.familySize) {
    // 补齐的成员使用所有启用成员的平均热量目标
    const avgTarget = Math.round(enrolledMembers.reduce((s, m) => s + m.dailyCalorieTarget, 0) / Math.max(1, enrolledMembers.length));
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

    // ===== 营养学标准: 中国居民膳食指南 2022 + USDA 综合 =====
    // 统一口径: 按日目标热量的百分比 (与 getMealCalorieBudget 完全一致)
    //   主食: 25% 日目标 (约 200-300g 生重/日, 含米/面/杂粮, 中国指南)
    //   水果: 7% 日目标 (约 200-350g/日)
    //   汤: 4% 日目标 (约 2 碗清汤/日)

    // 主食克数建议(生重/每餐, 供显示): 按年龄+性别微调
    const baseStaplePerMeal = ag === 'toddler' ? 35 : ag === 'child' ? 55
      : ag === 'preteen' ? 75 : ag === 'teen' ? 95
      : ag === 'young_adult' ? 100 : ag === 'adult' ? 100
      : ag === 'middle_age' ? 85 : 70;
    const genderFactor = member.gender === 'female' ? 0.85 : 1;
    const adjStaplePerMeal = Math.round(baseStaplePerMeal * genderFactor);
    const adjStapleGrams = adjStaplePerMeal * 3;

    // 实际主食热量 = 25% × 日目标 (口径统一, 避免重复计算)
    const finalStapleCalories = Math.round(member.dailyCalorieTarget * 0.25);

    // 水果克数建议(用于显示):
    const fruitGrams = ag === 'toddler' ? 100 : ag === 'child' ? 150
      : ag === 'senior' || ag === 'middle_age' ? 180 : 250;
    const finalFruitCalories = Math.round(member.dailyCalorieTarget * 0.07);

    // 汤: 4% 日目标
    const soupCaloriesPerDay = Math.round(member.dailyCalorieTarget * 0.04);

    // ===== 跳过的餐次 =====
    // 三餐热量比例: 早25% 午40% 晚35%
    const allMeals: Array<{ type: 'breakfast' | 'lunch' | 'dinner'; label: string; ratio: number }> = [
      { type: 'breakfast', label: '早餐', ratio: 0.25 },
      { type: 'lunch', label: '午餐', ratio: 0.40 },
      { type: 'dinner', label: '晚餐', ratio: 0.35 },
    ];
    const skippedMeals = allMeals
      .filter(m => !profile.mealsPerDay.includes(m.type))
      .map(m => {
        // 该餐总热量 = 目标 × 比例
        const totalMealCal = Math.round(member.dailyCalorieTarget * m.ratio);
        // 该餐中主食/水果/汤的建议热量(已单独给了建议) → 从缺口中减去避免重复
        const mealStaple = (profile.stapleMode || 'off') === 'off' ? Math.round(finalStapleCalories / 3) : 0;
        const mealFruit = !profile.includeFruit ? Math.round(finalFruitCalories / 3) : 0;
        const mealSoup = !profile.includeSoup ? Math.round(soupCaloriesPerDay / 2) : 0;
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
      stapleCalories: finalStapleCalories,
      fruitGrams,
      fruitCalories: finalFruitCalories,
      soupCalories: soupCaloriesPerDay,  // 新增: 统一供 UI 使用
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

    // 当前月份(新西兰南半球)
    const currentMonth = String(new Date().getMonth() + 1);

    // 当季水果 = 有季节标签且包含当前月, 或没季节标签(视为全年可售如香蕉/橙子/猕猴桃)
    const inSeason = edibleFruits.filter(f => !f.season || f.season.length === 0 || f.season.includes(currentMonth));
    // 反季水果 = 有明确季节但不含当前月
    const offSeason = edibleFruits.filter(f => f.season && f.season.length > 0 && !f.season.includes(currentMonth));

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

    // 优先加当季, 用 shift() 从头取, 不够时再从非当季补
    while (selectedFruits.length < targetCount && remainingSeasonal.length > 0) {
      const pick = remainingSeasonal.shift()!;
      selected.add(pick.id);
      selectedFruits.push(pick);
    }
    while (selectedFruits.length < targetCount && remainingOff.length > 0) {
      const pick = remainingOff.shift()!;
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

      for (const ri of recipe.ingredients) {
        const ingredient = getIngredientById(ri.ingredientId);
        if (!ingredient) continue;

        // 食材按原配方量(不缩放) — 用户按菜谱做整份菜
        const amount = ri.amount;
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
