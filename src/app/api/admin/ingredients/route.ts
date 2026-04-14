import { NextRequest, NextResponse } from 'next/server';
import { getAllIngredients } from '@/lib/data/recipe-repository';
import { getAllRecipes } from '@/lib/data/recipe-repository';
import type { IngredientCategory } from '@/types';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const search = sp.get('search') || '';
  const category = sp.get('category') as IngredientCategory | null;

  let ingredients = getAllIngredients();

  if (search) {
    const q = search.toLowerCase();
    ingredients = ingredients.filter(i =>
      i.nameZh.includes(q) || i.nameEn.toLowerCase().includes(q) || i.id.includes(q)
    );
  }
  if (category) {
    ingredients = ingredients.filter(i => i.category === category);
  }

  // 统计每个食材被多少菜谱引用
  const allRecipes = getAllRecipes();
  const usageCount = new Map<string, number>();
  for (const r of allRecipes) {
    for (const ri of r.ingredients) {
      usageCount.set(ri.ingredientId, (usageCount.get(ri.ingredientId) || 0) + 1);
    }
  }

  const result = ingredients.map(i => ({
    ...i,
    recipeCount: usageCount.get(i.id) || 0,
  }));

  return NextResponse.json({
    ingredients: result,
    total: result.length,
    stats: {
      total: getAllIngredients().length,
      byCategory: getAllIngredients().reduce((acc, i) => {
        acc[i.category] = (acc[i.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
  });
}
