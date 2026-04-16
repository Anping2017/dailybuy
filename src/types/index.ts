// ============================================================
// DailyBuy 核心类型定义
// ============================================================

// --- 食材相关 ---
export type IngredientCategory =
  | 'vegetable'   // 蔬菜
  | 'fruit'       // 水果
  | 'meat'        // 肉类
  | 'seafood'     // 海鲜
  | 'egg_dairy'   // 蛋奶
  | 'grain'       // 谷物/主食
  | 'bean'        // 豆类
  | 'seasoning'   // 调料
  | 'oil'         // 油脂
  | 'dried'       // 干货
  | 'other';

// 健康警告 — 推荐算法会用来屏蔽/降权(糖尿病、高血压、痛风等)
export type HealthWarning =
  | 'high_gi'           // 高升糖指数
  | 'high_purine'       // 高嘌呤
  | 'high_sodium'       // 高钠
  | 'high_fat'          // 高脂
  | 'high_sugar'        // 高糖
  | 'high_cholesterol'  // 高胆固醇
  | 'processed'         // 加工/腌制肉类(WHO I 类致癌物)
  | 'contains_alcohol'; // 含酒精(孕妇/儿童/肝病/清真规避)

// 过敏原 — 用于饮食禁忌硬过滤
export type Allergen =
  | 'allergen_gluten'   // 含麸质
  | 'allergen_dairy'    // 含乳制品
  | 'allergen_nut'      // 含坚果
  | 'allergen_sesame'   // 含芝麻(FAO 十大致敏原之一)
  | 'allergen_seafood'  // 含海鲜/贝类
  | 'allergen_egg'      // 含蛋
  | 'allergen_soy';     // 含大豆

// 营养亮点 — 正向标签,推荐算法可用来加权(例如给糖尿病家庭优先推荐低 GI 食材)
export type NutritionHighlight =
  | 'high_fiber'        // 高纤维
  | 'high_protein'      // 高蛋白
  | 'high_iron'         // 高铁
  | 'high_iodine'       // 高碘
  | 'high_zinc'         // 高锌
  | 'high_vitamin_a'    // 高维生素 A
  | 'high_vitamin'      // 高维生素(笼统,用于深色蔬菜等)
  | 'whole_grain'       // 全谷物
  | 'low_fat'           // 低脂
  | 'low_calorie';      // 低卡

// 向后兼容的联合类型 — 引擎的 blockedTags 需要同时包含 warnings 和 allergens
export type HealthTag = HealthWarning | Allergen;

export interface NutritionPer100g {
  calories: number;      // kcal
  protein: number;       // g
  fat: number;           // g
  carbs: number;         // g
  fiber: number;         // g
  sodium: number;        // mg
  sugar: number;         // g
}

export interface Ingredient {
  id: string;
  nameZh: string;
  nameEn: string;
  category: IngredientCategory;
  nutrition: NutritionPer100g;
  priceNZD: number;          // 参考价格 per unit
  unit: string;              // kg, piece, bunch, bottle, etc.
  allergens: Allergen[];               // 过敏原(饮食禁忌硬过滤)
  warnings: HealthWarning[];            // 健康警告(慢性病屏蔽/降权)
  highlights: NutritionHighlight[];     // 营养亮点(正向加权)
  season?: string[];         // 当季月份 ['1','2','12'] (南半球/NZ)
}

// --- 菜谱相关 ---
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type CuisineType = 'chinese' | 'western' | 'asian_other' | 'fusion';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// 地域菜系细分
export type RegionalCuisine =
  // 中餐
  | 'sichuan'      // 川菜
  | 'cantonese'    // 粤菜
  | 'shandong'     // 鲁菜
  | 'jiangsu'      // 苏菜/淮扬菜
  | 'hunan'        // 湘菜
  | 'fujian'       // 闽菜
  | 'dongbei'      // 东北菜
  | 'zhejiang'     // 浙菜
  | 'anhui'        // 徽菜
  | 'yunnan'       // 云南菜
  | 'xinjiang'     // 新疆菜
  | 'taiwanese'    // 台湾菜
  | 'homestyle'    // 家常菜(不限地域)
  // 西餐
  | 'italian'      // 意式
  | 'american'     // 美式
  | 'french'       // 法式
  // 亚洲其他
  | 'japanese'     // 日式
  | 'korean'       // 韩式
  | 'southeast_asian'; // 东南亚

// 做法/烹饪方式
export type CookingMethod =
  | 'stir_fry'    // 炒
  | 'braise'      // 红烧/卤
  | 'stew'        // 炖/煲
  | 'steam'       // 蒸
  | 'boil'        // 煮/汆
  | 'cold_dish'   // 凉拌
  | 'deep_fry'    // 炸/煎
  | 'roast'       // 烤/焗
  | 'dry_pot'     // 干锅/铁板
  | 'soup'        // 汤羹
  | 'staple';     // 主食(饭/面/粥)

// 口味偏好
export type FlavorPreference =
  | 'sour'    // 酸
  | 'sweet'   // 甜
  | 'bitter'  // 苦
  | 'spicy'   // 辣
  | 'salty'   // 咸
  | 'umami'   // 鲜
  | 'light';  // 清淡

// 主食偏好
export type StaplePreference =
  | 'rice'      // 米饭
  | 'noodles'   // 面条
  | 'bread'     // 面包
  | 'congee'    // 粥
  | 'mantou'    // 馒头/饼
  | 'any';      // 不限

// 菜在一餐中的角色
export type DishRole = 'main_meat' | 'main_veg' | 'soup' | 'staple' | 'side' | 'cold';

export interface MealRecipe {
  recipeId: string;
  role: DishRole;
}

// 厨艺等级
export type CookingLevel =
  | 'beginner'     // 厨房小白: 只会煮面、煎蛋
  | 'basic'        // 入门级: 会简单炒菜
  | 'intermediate' // 家常级: 能做大部分家常菜
  | 'advanced'     // 进阶级: 能做复杂菜式
  | 'expert';      // 大厨级: 各种菜式都能驾驭

export interface RecipeIngredient {
  ingredientId: string;
  amount: number;        // 用量
  unit: string;          // g, ml, piece, tbsp, etc.
}

export interface Recipe {
  id: string;
  nameZh: string;
  nameEn: string;
  cuisine: CuisineType;
  regionalCuisine: RegionalCuisine; // 地域菜系
  cookingMethod: CookingMethod;     // 做法
  flavors: FlavorPreference[];      // 口味标签
  mealTypes: MealType[];            // 适合的餐次
  difficulty: DifficultyLevel;
  minCookingLevel: CookingLevel;    // 需要的最低厨艺等级
  prepTime: number;                 // 分钟
  cookTime: number;                 // 分钟
  servings: number;                 // 几人份
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];                   // 标签: 快手菜, 下饭菜, etc.
  totalNutrition?: NutritionPer100g;
  totalCalories?: number;
  estimatedCost?: number;
  // 管理字段
  status?: RecipeStatus;
  source?: string;
  dataIssues?: string[];
}

export type RecipeStatus = 'pending' | 'reviewed' | 'disabled';

// --- 用户档案 ---
export type HealthCondition =
  | 'diabetes'       // 糖尿病
  | 'hypertension'   // 高血压
  | 'gout'           // 痛风
  | 'hyperlipidemia' // 高血脂
  | 'kidney_disease' // 肾病
  | 'pregnancy'      // 孕期/哺乳期
  | 'none';

export type DietaryRestriction =
  | 'vegetarian'     // 素食
  | 'vegan'          // 纯素
  | 'halal'          // 清真
  | 'no_pork'        // 不吃猪肉
  | 'no_beef'        // 不吃牛肉
  | 'no_seafood'     // 不吃海鲜
  | 'no_spicy'       // 不吃辣
  | 'lactose_free'   // 无乳糖
  | 'gluten_free'    // 无麸质
  | 'nut_free'       // 无坚果
  | 'avoid_processed'; // 规避加工食品(培根/火腿/香肠等 WHO I 类致癌物)

export type AgeGroup =
  | 'toddler'    // 幼儿 1-3岁
  | 'child'      // 儿童 4-8岁
  | 'preteen'    // 少年 9-13岁
  | 'teen'       // 青少年 14-17岁
  | 'young_adult'// 青年 18-30岁
  | 'adult'      // 中年 31-50岁
  | 'middle_age' // 中老年 51-65岁
  | 'senior';    // 老年 65+
export type Gender = 'male' | 'female';

export interface FamilyMember {
  id: string;
  name: string;
  gender: Gender;
  ageGroup: AgeGroup;
  healthConditions: HealthCondition[];
  dietaryRestrictions: DietaryRestriction[];
  dailyCalorieTarget: number;
}

export interface UserProfile {
  familySize: number;
  members: FamilyMember[];
  cuisinePreference: CuisineType[];
  regionalPreference: RegionalCuisine[];  // 地域菜系偏好
  flavorPreference: FlavorPreference[];   // 口味偏好(酸甜苦辣，多选)
  preferredCookingMethods: CookingMethod[]; // 偏好做法(多选，空=不限)
  staplePreference: StaplePreference[];    // 主食偏好(多选)
  stapleMode: 'off' | 'fixed' | 'random'; // 主食推荐模式: 不推荐|固定|随机
  includeSoup: boolean;                    // 是否推荐汤
  includeFruit: boolean;                   // 是否推荐水果
  includeColdDish: boolean;                // 是否推荐凉菜
  cookingLevel: CookingLevel;             // 厨艺等级
  acceptedDifficulty: DifficultyLevel[];  // 可接受的难度(多选)
  recommendMode: 'basic' | 'ai';           // 基础库 | AI智能推荐
  autoAddToShoppingList: boolean;          // 生成菜谱时自动加入清单
  planDays: number;                        // 规划几天 (1-7)
  mealsPerDay: MealType[];                // 每天规划哪几餐
  weeklyBudget: number;                   // NZD
}

// --- 每周计划 ---
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface MealSlot {
  day: DayOfWeek;
  mealType: MealType;
  recipes: MealRecipe[];   // 多道菜组合
  servings: number;
}

export interface SkippedMealAdvice {
  mealType: MealType;
  label: string;                 // 早餐/午餐/晚餐
  suggestedCalories: number;     // 建议热量(不含主食水果汤)
}

export interface MemberCalorieAdvice {
  memberId: string;
  memberName: string;
  ageGroup: AgeGroup;
  gender: Gender;
  dailyTarget: number;           // 每日目标热量
  dishCalories: number;          // 菜品提供的热量(按占比)
  staplePerMeal: number;          // 每餐主食克数
  stapleGrams: number;           // 全天主食克数
  stapleCalories: number;        // 全天主食热量
  fruitGrams: number;            // 建议水果克数
  fruitCalories: number;         // 水果热量
  skippedMeals: SkippedMealAdvice[]; // 未规划的餐次建议
  gap: number;                   // 剩余热量缺口
}

export interface FruitMemberDaily {
  memberName: string;
  dailyGrams: number;             // 每日建议总量
  dailyCalories: number;          // 对应热量(按均值估算)
}

export interface FruitRecommendation {
  fruitId: string;
  fruitName: string;
  caloriesPer100g: number;
}

export interface WeeklyFruitPlan {
  fruits: FruitRecommendation[];   // 本周推荐的水果(4-6种)
  memberDaily: FruitMemberDaily[]; // 每位成员的每日总量
}

export interface WeeklyPlan {
  id: string;
  weekStart: string;             // ISO date
  slots: MealSlot[];
  totalCalories: number;
  totalCost: number;
  memberAdvice?: MemberCalorieAdvice[];
  fruitPlan?: WeeklyFruitPlan;     // 本周水果推荐
  createdAt: string;
}

// --- 采购清单 ---
export interface ShoppingItem {
  ingredientId: string;
  ingredientName: string;
  ingredientNameEn: string;
  totalAmount: number;
  unit: string;
  estimatedPrice: number;
  category: IngredientCategory;
  isOwned: boolean;              // 家里已有
  isPurchased: boolean;          // 已购买
  fromRecipes: string[];         // 来自哪些菜谱
}

export interface ShoppingList {
  id: string;
  weeklyPlanId: string;
  items: ShoppingItem[];
  totalEstimatedCost: number;
  createdAt: string;
  updatedAt: string;
}

// --- 用户行为学习 ---
export type RecipeAction = 'accepted' | 'rejected' | 'swapped_in' | 'added_to_list';

export interface RecipePreference {
  recipeId: string;
  score: number;            // clamped [-10, 50]
  acceptCount: number;
  rejectCount: number;
  swapInCount: number;
  addToListCount: number;
  lastInteraction: number;  // timestamp(ms)
}

export interface RecentAction {
  recipeId: string;
  action: RecipeAction;
  timestamp: number;
}

// --- 存储层抽象 (为迁移 Supabase 准备) ---
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}
