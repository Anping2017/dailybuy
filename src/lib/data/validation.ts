/**
 * 菜谱数据校验
 */
import type { Recipe } from '@/types';
import { getAllRecipes, getIngredient } from './recipe-repository';

export interface ValidationIssue {
  recipeId: string;
  recipeName: string;
  type: 'missing_field' | 'invalid_ingredient' | 'duplicate_name' | 'abnormal_data';
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export function validateRecipe(recipe: Recipe): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const base = { recipeId: recipe.id, recipeName: recipe.nameZh };

  // 必填字段
  const required = ['nameZh', 'nameEn', 'cuisine', 'regionalCuisine', 'cookingMethod', 'difficulty', 'minCookingLevel'] as const;
  for (const f of required) {
    if (!recipe[f]) {
      issues.push({ ...base, type: 'missing_field', field: f, message: `缺失: ${f}`, severity: 'error' });
    }
  }
  if (!recipe.ingredients?.length) {
    issues.push({ ...base, type: 'missing_field', field: 'ingredients', message: '无食材', severity: 'error' });
  }
  if (!recipe.steps?.length) {
    issues.push({ ...base, type: 'missing_field', field: 'steps', message: '无步骤', severity: 'warning' });
  }
  if (!recipe.flavors?.length) {
    issues.push({ ...base, type: 'missing_field', field: 'flavors', message: '无口味标签', severity: 'warning' });
  }

  // 食材ID校验
  for (const ing of recipe.ingredients || []) {
    if (!getIngredient(ing.ingredientId)) {
      issues.push({ ...base, type: 'invalid_ingredient', field: ing.ingredientId, message: `无效食材: ${ing.ingredientId}`, severity: 'error' });
    }
  }

  // 异常数据
  if (recipe.servings <= 0) {
    issues.push({ ...base, type: 'abnormal_data', field: 'servings', message: '份数<=0', severity: 'error' });
  }
  if (recipe.prepTime < 0 || recipe.cookTime < 0) {
    issues.push({ ...base, type: 'abnormal_data', field: 'time', message: '时间<0', severity: 'error' });
  }

  return issues;
}

export function validateAllRecipes(): ValidationIssue[] {
  const all = getAllRecipes();
  const issues: ValidationIssue[] = [];

  // 单道菜校验
  for (const r of all) {
    issues.push(...validateRecipe(r));
  }

  // 菜名重复检测
  const nameCount = new Map<string, string[]>();
  for (const r of all) {
    const ids = nameCount.get(r.nameZh) || [];
    ids.push(r.id);
    nameCount.set(r.nameZh, ids);
  }
  for (const [name, ids] of nameCount) {
    if (ids.length > 1) {
      for (const id of ids) {
        issues.push({
          recipeId: id, recipeName: name,
          type: 'duplicate_name', message: `菜名重复: "${name}" (${ids.length}个)`,
          severity: 'warning',
        });
      }
    }
  }

  return issues;
}

export function getValidationStats(issues: ValidationIssue[]) {
  return {
    total: issues.length,
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    byType: {
      missing_field: issues.filter(i => i.type === 'missing_field').length,
      invalid_ingredient: issues.filter(i => i.type === 'invalid_ingredient').length,
      duplicate_name: issues.filter(i => i.type === 'duplicate_name').length,
      abnormal_data: issues.filter(i => i.type === 'abnormal_data').length,
    },
  };
}
