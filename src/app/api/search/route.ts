import { NextRequest, NextResponse } from 'next/server';
import { parseQuery, searchRecipes } from '@/lib/search/nl-parser';
import { getReviewedRecipes } from '@/lib/data/recipe-repository';

// 输入限制 (防 DoS / 保护后端)
const MAX_QUERY_LEN = 200;
const MAX_EXCLUDE_ITEMS = 50;
const MAX_INGREDIENT_ID_LEN = 50;

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
    }
    const { query, excludeIngredients } = body as { query?: unknown; excludeIngredients?: unknown };

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: '请输入搜索内容' }, { status: 400 });
    }
    if (query.length > MAX_QUERY_LEN) {
      return NextResponse.json({ error: `搜索内容过长, 最多 ${MAX_QUERY_LEN} 字符` }, { status: 400 });
    }

    // 验证 excludeIngredients: 必须是数组, 元素为短字符串
    let sanitizedExclude: string[] = [];
    if (excludeIngredients !== undefined) {
      if (!Array.isArray(excludeIngredients)) {
        return NextResponse.json({ error: 'excludeIngredients 必须是数组' }, { status: 400 });
      }
      sanitizedExclude = excludeIngredients
        .filter((x): x is string => typeof x === 'string' && x.length > 0 && x.length <= MAX_INGREDIENT_ID_LEN)
        .slice(0, MAX_EXCLUDE_ITEMS);
    }

    const parsed = parseQuery(query);
    if (sanitizedExclude.length) {
      parsed.excludeIngredients = [
        ...(parsed.excludeIngredients || []),
        ...sanitizedExclude,
      ];
    }
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
    // 不输出完整错误, 避免潜在 PII (但记录类型)
    console.error('Search error:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: '搜索失败' }, { status: 500 });
  }
}
