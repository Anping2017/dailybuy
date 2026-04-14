import { NextResponse } from 'next/server';
import { getRecipeStats } from '@/lib/data/recipe-repository';

export async function GET() {
  return NextResponse.json(getRecipeStats());
}
