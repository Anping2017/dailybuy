/**
 * 统一数据访问层
 * 当前: 从 recipes-all.json 静态加载
 * 未来: 替换为 Supabase 查询
 */
import type { Recipe, Ingredient, RecipeStatus, MealType, CuisineType, CookingMethod } from '@/types';
import recipesData from '@/data/recipes-all.json';
import ingredientsData from '@/data/ingredients.json';

// --- 内存缓存 ---
const allRecipes = recipesData as Recipe[];
const recipeMap = new Map<string, Recipe>(allRecipes.map(r => [r.id, r]));

const allIngredients = ingredientsData as Ingredient[];
const ingredientMap = new Map<string, Ingredient>(allIngredients.map(i => [i.id, i]));

// --- 用户自定义菜谱缓存(由 store 同步) ---
let customCache: Recipe[] = [];
export function registerCustomRecipes(recipes: Recipe[]): void {
  customCache = recipes;
}

// --- 菜谱查询 ---

export function getRecipe(id: string): Recipe | undefined {
  return recipeMap.get(id) || customCache.find(r => r.id === id);
}

export function getAllRecipes(): Recipe[] {
  return allRecipes;
}

/** 仅返回已审核的菜谱（用于推荐引擎） */
export function getReviewedRecipes(): Recipe[] {
  return allRecipes.filter(r => r.status === 'reviewed' || !r.status);
}

/** 仅返回非禁用的菜谱 */
export function getActiveRecipes(): Recipe[] {
  return allRecipes.filter(r => r.status !== 'disabled');
}

export function getRecipeCount(): number {
  return allRecipes.length;
}

export interface RecipeQueryOptions {
  status?: RecipeStatus;
  cuisine?: CuisineType;
  mealType?: MealType;
  cookingMethod?: CookingMethod;
  search?: string;
  hasIssues?: boolean;
  page?: number;
  pageSize?: number;
}

export interface RecipeQueryResult {
  recipes: Recipe[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function queryRecipes(opts: RecipeQueryOptions = {}): RecipeQueryResult {
  let filtered = [...allRecipes];

  if (opts.status) {
    filtered = filtered.filter(r => r.status === opts.status);
  }
  if (opts.cuisine) {
    filtered = filtered.filter(r => r.cuisine === opts.cuisine);
  }
  if (opts.mealType) {
    filtered = filtered.filter(r => r.mealTypes.includes(opts.mealType!));
  }
  if (opts.cookingMethod) {
    filtered = filtered.filter(r => r.cookingMethod === opts.cookingMethod);
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    filtered = filtered.filter(r =>
      r.nameZh.toLowerCase().includes(q) ||
      r.nameEn.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  }
  if (opts.hasIssues) {
    filtered = filtered.filter(r => r.dataIssues && r.dataIssues.length > 0);
  }

  const total = filtered.length;
  const page = opts.page || 1;
  const pageSize = opts.pageSize || 20;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;

  return {
    recipes: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

// --- 菜谱统计 ---
export function getRecipeStats() {
  const stats = {
    total: allRecipes.length,
    reviewed: 0,
    pending: 0,
    disabled: 0,
    withIssues: 0,
    byCuisine: {} as Record<string, number>,
    byMethod: {} as Record<string, number>,
    byMeal: { breakfast: 0, lunch: 0, dinner: 0 } as Record<string, number>,
  };

  for (const r of allRecipes) {
    if (r.status === 'reviewed') stats.reviewed++;
    else if (r.status === 'disabled') stats.disabled++;
    else stats.pending++;

    if (r.dataIssues && r.dataIssues.length > 0) stats.withIssues++;

    stats.byCuisine[r.cuisine] = (stats.byCuisine[r.cuisine] || 0) + 1;
    stats.byMethod[r.cookingMethod] = (stats.byMethod[r.cookingMethod] || 0) + 1;
    for (const m of r.mealTypes) {
      stats.byMeal[m] = (stats.byMeal[m] || 0) + 1;
    }
  }

  return stats;
}

// --- 食材查询 ---

export function getIngredient(id: string): Ingredient | undefined {
  return ingredientMap.get(id);
}

export function getAllIngredients(): Ingredient[] {
  return allIngredients;
}

// --- 写入操作 (本地JSON，未来替换Supabase) ---

export function updateRecipeInMemory(id: string, updates: Partial<Recipe>): Recipe | null {
  const recipe = recipeMap.get(id);
  if (!recipe) return null;

  Object.assign(recipe, updates);
  return recipe;
}
