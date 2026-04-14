/**
 * 营养计算引擎
 * 数据通过 recipe-repository 统一获取
 */
import type { Recipe, RecipeIngredient, NutritionPer100g, Ingredient, MealSlot } from '@/types';
import {
  getRecipe, getAllRecipes, getIngredient, getAllIngredients,
} from '@/lib/data/recipe-repository';

// 重新导出，保持对外接口不变
export { getRecipe, getAllRecipes, getIngredient, getAllIngredients };

/** 计算单个食材在特定用量下的营养 */
export function calcIngredientNutrition(
  ingredientId: string,
  amountG: number
): NutritionPer100g | null {
  const ingredient = getIngredient(ingredientId);
  if (!ingredient) return null;

  const ratio = amountG / 100;
  return {
    calories: Math.round(ingredient.nutrition.calories * ratio),
    protein: Math.round(ingredient.nutrition.protein * ratio * 10) / 10,
    fat: Math.round(ingredient.nutrition.fat * ratio * 10) / 10,
    carbs: Math.round(ingredient.nutrition.carbs * ratio * 10) / 10,
    fiber: Math.round(ingredient.nutrition.fiber * ratio * 10) / 10,
    sodium: Math.round(ingredient.nutrition.sodium * ratio),
    sugar: Math.round(ingredient.nutrition.sugar * ratio * 10) / 10,
  };
}

/** 将食材用量统一转换为克（估算） */
function toGrams(ri: RecipeIngredient): number {
  if (ri.unit === 'g' || ri.unit === 'ml') return ri.amount;
  if (ri.unit === 'piece') {
    // 粗略估算: 蛋约50g, 蔬菜约200g
    const ing = getIngredient(ri.ingredientId);
    if (ing?.category === 'egg_dairy') return ri.amount * 50;
    if (ing?.category === 'vegetable') return ri.amount * 200;
    if (ing?.category === 'fruit') return ri.amount * 150;
    return ri.amount * 100;
  }
  if (ri.unit === 'tbsp') return ri.amount * 15;
  if (ri.unit === 'tsp') return ri.amount * 5;
  if (ri.unit === 'slice') return ri.amount * 30;
  if (ri.unit === 'bunch') return ri.amount * 200;
  if (ri.unit === 'pack') return ri.amount * 250;
  if (ri.unit === 'bottle') return ri.amount * 500;
  return ri.amount;
}

/** 计算一道菜的总营养 */
export function calcRecipeNutrition(recipe: Recipe): NutritionPer100g & { totalCalories: number } {
  const totals: NutritionPer100g = {
    calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0, sugar: 0,
  };

  for (const ri of recipe.ingredients) {
    const grams = toGrams(ri);
    const nutr = calcIngredientNutrition(ri.ingredientId, grams);
    if (nutr) {
      totals.calories += nutr.calories;
      totals.protein += nutr.protein;
      totals.fat += nutr.fat;
      totals.carbs += nutr.carbs;
      totals.fiber += nutr.fiber;
      totals.sodium += nutr.sodium;
      totals.sugar += nutr.sugar;
    }
  }

  return {
    ...totals,
    totalCalories: totals.calories,
    protein: Math.round(totals.protein * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fiber: Math.round(totals.fiber * 10) / 10,
    sugar: Math.round(totals.sugar * 10) / 10,
  };
}

/** 计算一道菜每份的热量 */
export function calcPerServingCalories(recipe: Recipe): number {
  const total = calcRecipeNutrition(recipe);
  return Math.round(total.totalCalories / recipe.servings);
}

/** 计算一道菜的估算成本 */
export function calcRecipeCost(recipe: Recipe): number {
  let cost = 0;
  for (const ri of recipe.ingredients) {
    const ingredient = getIngredient(ri.ingredientId);
    if (!ingredient) continue;
    // 估算: 按比例计算价格
    const grams = toGrams(ri);
    // 粗略估算每个单位的克数来计算比例
    const unitGrams = ingredient.unit === 'kg' ? 1000
      : ingredient.unit === 'litre' ? 1000
      : ingredient.unit === 'dozen' ? 600
      : ingredient.unit === 'bottle' ? 500
      : ingredient.unit === 'pack' ? 250
      : ingredient.unit === 'bunch' ? 200
      : ingredient.unit === 'piece' ? 200
      : ingredient.unit === 'loaf' ? 600
      : 500;
    cost += (grams / unitGrams) * ingredient.priceNZD;
  }
  return Math.round(cost * 100) / 100;
}

/** 计算每日菜谱的总营养 (支持多菜 MealSlot) */
export function calcDayNutrition(slots: MealSlot[]): NutritionPer100g & { totalCalories: number } {
  const totals: NutritionPer100g & { totalCalories: number } = {
    calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0, sugar: 0,
    totalCalories: 0,
  };

  for (const slot of slots) {
    for (const mr of (slot.recipes || [])) {
      const recipe = getRecipe(mr.recipeId);
      if (!recipe) continue;
      const nutr = calcRecipeNutrition(recipe);
      const ratio = slot.servings / recipe.servings;
      totals.calories += Math.round(nutr.calories * ratio);
      totals.protein += nutr.protein * ratio;
      totals.fat += nutr.fat * ratio;
      totals.carbs += nutr.carbs * ratio;
      totals.fiber += nutr.fiber * ratio;
      totals.sodium += nutr.sodium * ratio;
      totals.sugar += nutr.sugar * ratio;
    }
  }

  totals.totalCalories = totals.calories;
  return totals;
}
