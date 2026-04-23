import { NextRequest, NextResponse } from 'next/server';
import { getRecipe, updateRecipeInMemory } from '@/lib/data/recipe-repository';
import { calcRecipeNutrition, calcRecipeCost } from '@/lib/nutrition/calculator';
import { validateRecipe } from '@/lib/data/validation';

// PATCH 允许更新的字段白名单 (避免 prototype pollution / system field 覆盖)
const ALLOWED_UPDATE_FIELDS = new Set([
  'nameZh', 'nameEn', 'description', 'cuisine', 'regionalCuisine',
  'cookingMethod', 'flavors', 'mealTypes', 'difficulty', 'minCookingLevel',
  'prepTime', 'cookTime', 'servings', 'ingredients', 'steps', 'tags',
  'dishRole', 'isVegetarian', 'dishStyle', 'stapleCategory',
  'status', 'source',
]);

function sanitizeUpdates(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (ALLOWED_UPDATE_FIELDS.has(k)) out[k] = v;
  }
  return out;
}

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
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const updates = sanitizeUpdates(raw);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }
  const updated = updateRecipeInMemory(id, updates);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ recipe: updated });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 与 PATCH 相同语义, 用于 pending-recipe-edits 审批时调用
  return PATCH(req, { params });
}
