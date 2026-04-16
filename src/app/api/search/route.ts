import { NextRequest, NextResponse } from 'next/server';
import { parseQuery, searchRecipes } from '@/lib/search/nl-parser';
import { getReviewedRecipes } from '@/lib/data/recipe-repository';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json() as { query: string };
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: '请输入搜索内容' }, { status: 400 });
    }

    const parsed = parseQuery(query);
    const recipes = getReviewedRecipes();
    const results = searchRecipes(recipes, parsed, query).slice(0, 50);

    return NextResponse.json({
      query,
      parsed,
      results: results.map(r => ({
        id: r.recipe.id,
        nameZh: r.recipe.nameZh,
        nameEn: r.recipe.nameEn,
        cuisine: r.recipe.cuisine,
        regionalCuisine: r.recipe.regionalCuisine,
        cookingMethod: r.recipe.cookingMethod,
        difficulty: r.recipe.difficulty,
        prepTime: r.recipe.prepTime,
        cookTime: r.recipe.cookTime,
        flavors: r.recipe.flavors,
        score: r.score,
        matches: r.matches,
      })),
      total: results.length,
    });
  } catch (e) {
    console.error('Search error:', e);
    return NextResponse.json({ error: '搜索失败' }, { status: 500 });
  }
}
