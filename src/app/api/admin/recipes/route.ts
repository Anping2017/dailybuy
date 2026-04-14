import { NextRequest, NextResponse } from 'next/server';
import { queryRecipes, updateRecipeInMemory } from '@/lib/data/recipe-repository';
import type { RecipeStatus, CuisineType, MealType, CookingMethod } from '@/types';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = queryRecipes({
    page: Number(sp.get('page')) || 1,
    pageSize: Number(sp.get('pageSize')) || 20,
    search: sp.get('search') || undefined,
    status: (sp.get('status') as RecipeStatus) || undefined,
    cuisine: (sp.get('cuisine') as CuisineType) || undefined,
    mealType: (sp.get('mealType') as MealType) || undefined,
    cookingMethod: (sp.get('cookingMethod') as CookingMethod) || undefined,
    hasIssues: sp.get('hasIssues') === 'true' || undefined,
  });
  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  const { ids, status } = await req.json() as { ids: string[]; status: RecipeStatus };
  if (!ids?.length || !status) {
    return NextResponse.json({ error: 'Missing ids or status' }, { status: 400 });
  }
  for (const id of ids) {
    updateRecipeInMemory(id, { status });
  }
  return NextResponse.json({ updated: ids.length });
}
