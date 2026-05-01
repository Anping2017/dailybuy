import { NextResponse } from 'next/server';
import { getAllRecipes, getAllIngredients } from '@/lib/data/recipe-repository';
import { auditRecipes } from '@/lib/data/recipe-audit';

export async function GET() {
  const recipes = getAllRecipes();
  const ingredients = getAllIngredients();
  const report = auditRecipes(recipes, ingredients);
  return NextResponse.json(report);
}
