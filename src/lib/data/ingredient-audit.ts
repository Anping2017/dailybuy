/**
 * 食材库审计 — 服务端 + CLI 共用
 * 检查 broken refs / 孤立 / 数据完整性 / 营养异常 / 重名 / 价格异常
 */
import type { Ingredient, Recipe } from '@/types';

export interface IngredientAuditReport {
  total: number;
  recipeCount: number;
  brokenRefs: { id: string; recipes: string[] }[];
  orphaned: { id: string; nameZh: string; category: string }[];
  dataIssues: {
    noNutrition: string[];
    noPrice: string[];
    noUnit: string[];
    noCategory: string[];
    noNameZh: string[];
    noNameEn: string[];
    noSupermarkets: string[];
  };
  nutritionIssues: {
    calZero: { id: string; name: string }[];
    calHigh: { id: string; name: string; cal: number }[];
    noFiber: { id: string; name: string }[];
  };
  priceIssues: {
    zero: { id: string; name: string }[];
    veryHigh: { id: string; name: string; price: number }[];
  };
  duplicateNames: { name: string; ids: string[] }[];
  catDist: Record<string, number>;
  totalIssueCount: number;
}

/** 在内存中执行审计 (不读写文件; UI/API 调用) */
export function auditIngredients(
  ingredients: Ingredient[],
  recipes: Recipe[],
): IngredientAuditReport {
  const ingById = new Map(ingredients.map(i => [i.id, i]));

  // ① broken refs
  const brokenMap = new Map<string, string[]>();
  for (const r of recipes) {
    for (const ri of r.ingredients || []) {
      if (!ingById.has(ri.ingredientId)) {
        const list = brokenMap.get(ri.ingredientId) || [];
        list.push(r.id);
        brokenMap.set(ri.ingredientId, list);
      }
    }
  }
  const brokenRefs = Array.from(brokenMap.entries()).map(([id, recs]) => ({ id, recipes: recs }));

  // ② orphaned
  const usedIds = new Set<string>();
  for (const r of recipes) for (const ri of r.ingredients || []) usedIds.add(ri.ingredientId);
  const orphaned = ingredients
    .filter(i => !usedIds.has(i.id))
    .map(i => ({ id: i.id, nameZh: i.nameZh, category: i.category }));

  // ③ 数据完整性
  const dataIssues = {
    noNutrition: [] as string[], noPrice: [] as string[], noUnit: [] as string[],
    noCategory: [] as string[], noNameZh: [] as string[], noNameEn: [] as string[],
    noSupermarkets: [] as string[],
  };
  for (const i of ingredients) {
    if (!i.nutrition || typeof i.nutrition !== 'object') dataIssues.noNutrition.push(i.id);
    if (i.priceNZD === undefined || i.priceNZD === null) dataIssues.noPrice.push(i.id);
    if (!i.unit) dataIssues.noUnit.push(i.id);
    if (!i.category) dataIssues.noCategory.push(i.id);
    if (!i.nameZh) dataIssues.noNameZh.push(i.id);
    if (!i.nameEn) dataIssues.noNameEn.push(i.id);
    const sm = (i as Ingredient & { supermarkets?: string[] }).supermarkets;
    if (!sm || sm.length === 0) dataIssues.noSupermarkets.push(i.id);
  }

  // ④ 营养异常
  const nutritionIssues = {
    calZero: [] as { id: string; name: string }[],
    calHigh: [] as { id: string; name: string; cal: number }[],
    noFiber: [] as { id: string; name: string }[],
  };
  for (const i of ingredients) {
    const n = i.nutrition;
    if (!n) continue;
    const isOilOrSeasoning = i.category === 'oil' || i.category === 'seasoning';
    if (n.calories === 0 && !isOilOrSeasoning && i.id !== 'water') {
      nutritionIssues.calZero.push({ id: i.id, name: i.nameZh });
    }
    if (n.calories > 800 && i.category !== 'oil') {
      nutritionIssues.calHigh.push({ id: i.id, name: i.nameZh, cal: n.calories });
    }
    if (n.fiber === 0 && (i.category === 'vegetable' || i.category === 'fruit') && n.calories > 30) {
      nutritionIssues.noFiber.push({ id: i.id, name: i.nameZh });
    }
  }

  // ⑤ 价格异常
  const priceIssues = {
    zero: [] as { id: string; name: string }[],
    veryHigh: [] as { id: string; name: string; price: number }[],
  };
  for (const i of ingredients) {
    if (i.priceNZD === 0) priceIssues.zero.push({ id: i.id, name: i.nameZh });
    if (i.priceNZD > 100) priceIssues.veryHigh.push({ id: i.id, name: i.nameZh, price: i.priceNZD });
  }

  // ⑥ 重名
  const nameMap = new Map<string, string>();
  const duplicateNames: { name: string; ids: string[] }[] = [];
  for (const i of ingredients) {
    if (nameMap.has(i.nameZh)) {
      const existing = duplicateNames.find(d => d.name === i.nameZh);
      if (existing) existing.ids.push(i.id);
      else duplicateNames.push({ name: i.nameZh, ids: [nameMap.get(i.nameZh)!, i.id] });
    } else {
      nameMap.set(i.nameZh, i.id);
    }
  }

  // ⑦ category 分布
  const catDist: Record<string, number> = {};
  for (const i of ingredients) catDist[i.category] = (catDist[i.category] || 0) + 1;

  const totalIssueCount =
    brokenRefs.length +
    Object.values(dataIssues).reduce((s, v) => s + v.length, 0) +
    nutritionIssues.calZero.length + nutritionIssues.calHigh.length + nutritionIssues.noFiber.length +
    priceIssues.zero.length + duplicateNames.length;

  return {
    total: ingredients.length,
    recipeCount: recipes.length,
    brokenRefs,
    orphaned,
    dataIssues,
    nutritionIssues,
    priceIssues,
    duplicateNames,
    catDist,
    totalIssueCount,
  };
}
