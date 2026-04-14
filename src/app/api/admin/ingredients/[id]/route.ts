import { NextRequest, NextResponse } from 'next/server';
import { getIngredient, getAllRecipes } from '@/lib/data/recipe-repository';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ingredient = getIngredient(id);
  if (!ingredient) return NextResponse.json({ error: '食材不存在' }, { status: 404 });

  // 反查引用该食材的菜谱
  const relatedRecipes = getAllRecipes()
    .filter(r => r.ingredients.some(ri => ri.ingredientId === id))
    .map(r => ({ id: r.id, nameZh: r.nameZh, nameEn: r.nameEn, cuisine: r.cuisine, difficulty: r.difficulty }));

  return NextResponse.json({ ingredient, relatedRecipes });
}
