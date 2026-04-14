import { NextRequest, NextResponse } from 'next/server';
import { getRecipe, updateRecipeInMemory } from '@/lib/data/recipe-repository';
import { calcRecipeNutrition, calcRecipeCost } from '@/lib/nutrition/calculator';
import { validateRecipe } from '@/lib/data/validation';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = getRecipe(id);
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const nutrition = calcRecipeNutrition(recipe);
  const cost = calcRecipeCost(recipe);
  const issues = validateRecipe(recipe);

  return NextResponse.json({ recipe, nutrition, cost, issues });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updates = await req.json();
  const updated = updateRecipeInMemory(id, updates);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ recipe: updated });
}
