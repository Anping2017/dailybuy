import { NextResponse } from 'next/server';
import { getAllIngredients, getAllRecipes } from '@/lib/data/recipe-repository';
import { auditIngredients } from '@/lib/data/ingredient-audit';

export async function GET() {
  const ingredients = getAllIngredients();
  const recipes = getAllRecipes();
  const report = auditIngredients(ingredients, recipes);
  return NextResponse.json(report);
}
