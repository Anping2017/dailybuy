/**
 * 自然语言菜谱搜索解析器
 *
 * 输入: "我想吃辣的快手菜，30分钟内能做好"
 * 输出: { flavors: ['spicy'], maxTime: 30, ... }
 *
 * 当前: 本地关键词匹配
 * 未来: 可接入 Claude API 提升准确度
 */
import type {
  Recipe, CookingMethod, FlavorPreference, MealType, DifficultyLevel,
  RegionalCuisine, CuisineType, NutritionHighlight,
} from '@/types';

export interface SearchQuery {
  // 时间约束
  maxTime?: number;            // 最大总时长(分钟)
  // 营养约束
  maxCalories?: number;        // 单道菜最大热量
  // 偏好
  cookingMethods?: CookingMethod[];
  flavors?: FlavorPreference[];
  cuisines?: CuisineType[];
  regions?: RegionalCuisine[];
  mealTypes?: MealType[];
  difficulty?: DifficultyLevel[];
  highlights?: NutritionHighlight[];   // 高蛋白/高纤维等
  // 食材
  includeIngredients?: string[];   // 必须包含的食材ID
  excludeIngredients?: string[];   // 必须不包含的食材ID
  // 标签关键词(模糊匹配 tags 字段)
  tagKeywords?: string[];
  // 通用搜索词(匹配菜名)
  nameKeywords?: string[];
}

// ============================================================
// 关键词词典
// ============================================================

const TIME_PATTERNS: Array<{ re: RegExp; minutes: number }> = [
  { re: /(\d+)\s*分钟?(以)?内|不超过\s*(\d+)\s*分/, minutes: 0 }, // 动态提取
  { re: /快手|快速|简单|急/, minutes: 20 },
  { re: /半小时|30分/, minutes: 30 },
  { re: /一小时|60分/, minutes: 60 },
  { re: /1小时(以)?内/, minutes: 60 },
];

const CALORIE_PATTERNS: Array<{ re: RegExp; cal: number }> = [
  { re: /(\d+)\s*(卡|kcal|大卡)(以)?内|不超过\s*(\d+)\s*(卡|kcal)/, cal: 0 },
  { re: /低卡|低热量|轻食|减脂|减肥/, cal: 400 },
];

const COOKING_METHOD_KW: Record<CookingMethod, string[]> = {
  stir_fry: ['炒', '小炒', '爆炒'],
  braise: ['红烧', '卤', '烧'],
  stew: ['炖', '煲', '焖', '卤'],
  steam: ['蒸'],
  boil: ['煮', '汆', '水煮', '白灼'],
  cold_dish: ['凉拌', '凉菜'],
  deep_fry: ['炸', '煎', '酥'],
  roast: ['烤', '焗'],
  dry_pot: ['干锅', '铁板'],
  soup: ['汤', '羹'],
  staple: ['饭', '面', '粥', '饼', '饺', '包'],
};

const FLAVOR_KW: Record<FlavorPreference, string[]> = {
  spicy: ['辣', '麻辣', '辛辣', '香辣'],
  sweet: ['甜', '糖醋', '蜜汁'],
  sour: ['酸', '醋', '酸辣'],
  bitter: ['苦', '苦瓜'],
  salty: ['咸', '咸鲜', '酱香'],
  umami: ['鲜', '鲜美', '海味'],
  light: ['清淡', '淡', '素', '清爽', '健康'],
};

const CUISINE_KW: Record<CuisineType, string[]> = {
  chinese: ['中餐', '中式', '中国'],
  western: ['西餐', '西式'],
  asian_other: ['日料', '日式', '韩式', '泰国', '东南亚'],
  fusion: ['融合', 'fusion'],
};

const REGION_KW: Record<string, string[]> = {
  sichuan: ['川菜', '四川', '川味'],
  cantonese: ['粤菜', '广东', '广式'],
  shandong: ['鲁菜', '山东'],
  jiangsu: ['苏菜', '江苏', '淮扬'],
  hunan: ['湘菜', '湖南'],
  fujian: ['闽菜', '福建'],
  dongbei: ['东北', '东北菜'],
  homestyle: ['家常', '家常菜'],
  zhejiang: ['浙菜', '浙江'],
  anhui: ['徽菜', '安徽'],
  yunnan: ['云南'],
  xinjiang: ['新疆'],
  taiwanese: ['台湾', '台式'],
  japanese: ['日本', '日料', '日式'],
  korean: ['韩国', '韩式'],
  southeast_asian: ['东南亚', '泰国', '越南', '印尼'],
  italian: ['意大利', '意式'],
  american: ['美式', '美国'],
  french: ['法式', '法国'],
};

const MEAL_KW: Record<MealType, string[]> = {
  breakfast: ['早餐', '早饭', '早上'],
  lunch: ['午餐', '中午', '午饭'],
  dinner: ['晚餐', '晚饭', '晚上'],
};

const DIFFICULTY_KW: Record<DifficultyLevel, string[]> = {
  easy: ['简单', '容易', '新手', '入门'],
  medium: ['中等', '中难度'],
  hard: ['困难', '复杂', '挑战', '高级'],
};

const HIGHLIGHT_KW: Record<NutritionHighlight, string[]> = {
  high_protein: ['高蛋白', '增肌', '蛋白质'],
  high_fiber: ['高纤维', '纤维', '通便'],
  high_iron: ['补铁', '高铁', '贫血'],
  high_iodine: ['高碘', '海产'],
  high_zinc: ['高锌', '补锌'],
  high_vitamin_a: ['维A', '护眼'],
  high_vitamin: ['维生素', '维C'],
  whole_grain: ['全谷物', '杂粮'],
  low_fat: ['低脂', '减脂'],
  low_calorie: ['低卡', '低热量'],
};

const INGREDIENT_KW: Record<string, string[]> = {
  // 肉类
  chicken_breast: ['鸡胸', '鸡胸肉'],
  chicken_thigh: ['鸡腿', '鸡腿肉'],
  chicken_wing: ['鸡翅'],
  pork_belly: ['五花肉', '五花'],
  pork_mince: ['肉末', '猪肉末'],
  pork_loin: ['里脊', '猪里脊'],
  pork_ribs: ['排骨'],
  beef_sirloin: ['牛肉'],
  beef_mince: ['牛肉末'],
  lamb_leg: ['羊肉'],
  bacon: ['培根'],
  // 海鲜
  shrimp: ['虾', '虾仁', '大虾'],
  salmon_fillet: ['三文鱼', '鲑鱼'],
  fish_fillet: ['鱼', '鱼片'],
  squid: ['鱿鱼'],
  // 蛋豆
  egg: ['蛋', '鸡蛋'],
  tofu: ['豆腐'],
  // 蔬菜
  potato: ['土豆', '马铃薯'],
  tomato: ['番茄', '西红柿'],
  eggplant: ['茄子'],
  broccoli: ['西兰花'],
  cabbage: ['包菜', '卷心菜'],
  chinese_cabbage: ['白菜', '大白菜'],
  bok_choy: ['小白菜'],
  spinach: ['菠菜'],
  mushroom: ['蘑菇', '香菇'],
  carrot: ['胡萝卜'],
  cucumber: ['黄瓜'],
};

const NEGATION_PATTERNS = /不要|不吃|不|无|没|忌/;

// ============================================================
// 解析器
// ============================================================

export function parseQuery(input: string): SearchQuery {
  const text = input.trim();
  const result: SearchQuery = {};

  // ===== 时间提取 =====
  for (const { re, minutes } of TIME_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const dynamic = parseInt(m[1] || m[3] || '0', 10);
      result.maxTime = dynamic > 0 ? dynamic : minutes;
      break;
    }
  }

  // ===== 热量提取 =====
  for (const { re, cal } of CALORIE_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const dynamic = parseInt(m[1] || m[4] || '0', 10);
      result.maxCalories = dynamic > 0 ? dynamic : cal;
      break;
    }
  }

  // ===== 做法 =====
  const methods: CookingMethod[] = [];
  for (const [method, kws] of Object.entries(COOKING_METHOD_KW) as [CookingMethod, string[]][]) {
    if (kws.some(kw => text.includes(kw))) methods.push(method);
  }
  if (methods.length > 0) result.cookingMethods = methods;

  // ===== 口味 (支持否定: "不要辣"=排除) =====
  const flavors: FlavorPreference[] = [];
  for (const [flavor, kws] of Object.entries(FLAVOR_KW) as [FlavorPreference, string[]][]) {
    for (const kw of kws) {
      const idx = text.indexOf(kw);
      if (idx === -1) continue;
      // 检查前面5个字符是否有否定词
      const before = text.slice(Math.max(0, idx - 5), idx);
      if (NEGATION_PATTERNS.test(before)) continue;
      if (!flavors.includes(flavor)) flavors.push(flavor);
      break;
    }
  }
  if (flavors.length > 0) result.flavors = flavors;

  // ===== 菜系 =====
  const cuisines: CuisineType[] = [];
  for (const [c, kws] of Object.entries(CUISINE_KW) as [CuisineType, string[]][]) {
    if (kws.some(kw => text.includes(kw))) cuisines.push(c);
  }
  if (cuisines.length > 0) result.cuisines = cuisines;

  // ===== 地域菜系 =====
  const regions: RegionalCuisine[] = [];
  for (const [r, kws] of Object.entries(REGION_KW)) {
    if (kws.some(kw => text.includes(kw))) regions.push(r as RegionalCuisine);
  }
  if (regions.length > 0) result.regions = regions;

  // ===== 餐次 =====
  const meals: MealType[] = [];
  for (const [m, kws] of Object.entries(MEAL_KW) as [MealType, string[]][]) {
    if (kws.some(kw => text.includes(kw))) meals.push(m);
  }
  if (meals.length > 0) result.mealTypes = meals;

  // ===== 难度 =====
  const diffs: DifficultyLevel[] = [];
  for (const [d, kws] of Object.entries(DIFFICULTY_KW) as [DifficultyLevel, string[]][]) {
    if (kws.some(kw => text.includes(kw))) diffs.push(d);
  }
  if (diffs.length > 0) result.difficulty = diffs;

  // ===== 营养亮点 =====
  const highlights: NutritionHighlight[] = [];
  for (const [h, kws] of Object.entries(HIGHLIGHT_KW) as [NutritionHighlight, string[]][]) {
    if (kws.some(kw => text.includes(kw))) highlights.push(h);
  }
  if (highlights.length > 0) result.highlights = highlights;

  // ===== 食材 (支持否定) =====
  const includeIng: string[] = [];
  const excludeIng: string[] = [];
  for (const [id, kws] of Object.entries(INGREDIENT_KW)) {
    for (const kw of kws) {
      const idx = text.indexOf(kw);
      if (idx === -1) continue;
      const before = text.slice(Math.max(0, idx - 5), idx);
      if (NEGATION_PATTERNS.test(before)) {
        if (!excludeIng.includes(id)) excludeIng.push(id);
      } else {
        if (!includeIng.includes(id)) includeIng.push(id);
      }
      break;
    }
  }
  if (includeIng.length > 0) result.includeIngredients = includeIng;
  if (excludeIng.length > 0) result.excludeIngredients = excludeIng;

  return result;
}

// ============================================================
// 搜索执行器
// ============================================================

export interface SearchResult {
  recipe: Recipe;
  score: number;       // 匹配分数
  matches: string[];   // 命中的条件描述
}

export function searchRecipes(
  recipes: Recipe[],
  query: SearchQuery,
  originalText: string,
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const r of recipes) {
    let score = 0;
    const matches: string[] = [];

    // 时间硬过滤
    if (query.maxTime !== undefined) {
      const total = (r.prepTime || 0) + (r.cookTime || 0);
      if (total > query.maxTime) continue;
      score += 5;
      matches.push(`${total}分钟`);
    }

    // 餐次硬过滤
    if (query.mealTypes?.length) {
      if (!r.mealTypes.some(m => query.mealTypes!.includes(m))) continue;
      score += 3;
    }

    // 排除食材硬过滤
    if (query.excludeIngredients?.length) {
      const has = r.ingredients.some(ri => query.excludeIngredients!.includes(ri.ingredientId));
      if (has) continue;
    }

    // 菜系软匹配
    if (query.cuisines?.length && query.cuisines.includes(r.cuisine)) {
      score += 5;
      matches.push(r.cuisine);
    }

    // 地域软匹配
    if (query.regions?.length && query.regions.includes(r.regionalCuisine as RegionalCuisine)) {
      score += 5;
      matches.push(r.regionalCuisine);
    }

    // 做法软匹配
    if (query.cookingMethods?.length && query.cookingMethods.includes(r.cookingMethod)) {
      score += 4;
      matches.push(r.cookingMethod);
    }

    // 难度软匹配
    if (query.difficulty?.length && query.difficulty.includes(r.difficulty)) {
      score += 3;
      matches.push(r.difficulty);
    }

    // 口味匹配
    if (query.flavors?.length) {
      const hits = r.flavors.filter(f => query.flavors!.includes(f));
      score += hits.length * 3;
      if (hits.length > 0) matches.push(...hits);
    }

    // 包含食材匹配
    if (query.includeIngredients?.length) {
      const recipeIngIds = new Set(r.ingredients.map(ri => ri.ingredientId));
      const hits = query.includeIngredients.filter(id => recipeIngIds.has(id));
      score += hits.length * 5;
      if (hits.length > 0) matches.push(...hits);
    }

    // 名称模糊匹配(用原始文本去匹配菜名)
    const cleanText = originalText.replace(/[，。、,.\s?？!！]/g, '');
    for (let i = 0; i < cleanText.length - 1; i++) {
      const fragment = cleanText.slice(i, i + 2);
      if (fragment.length === 2 && r.nameZh.includes(fragment)) {
        score += 2;
        break;
      }
    }

    if (score > 0) {
      results.push({ recipe: r, score, matches });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/** 高级版: 调用 Claude API 解析复杂自然语言 (预留) */
export async function parseQueryWithAI(input: string): Promise<SearchQuery> {
  // TODO: 接入 Claude API
  // const response = await fetch('/api/search/parse', { method:'POST', body: JSON.stringify({ input }) });
  // return await response.json();
  return parseQuery(input);
}
