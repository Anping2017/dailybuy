import { NextResponse } from 'next/server';
import { validateAllRecipes, getValidationStats } from '@/lib/data/validation';

export async function GET() {
  const issues = validateAllRecipes();
  const stats = getValidationStats(issues);
  return NextResponse.json({ issues, stats });
}
