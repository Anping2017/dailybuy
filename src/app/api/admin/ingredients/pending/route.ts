import { NextRequest, NextResponse } from 'next/server';
import { getAllRecipes, getIngredient } from '@/lib/data/recipe-repository';

/** 扫描菜谱中引用但食材库中不存在的食材ID */
export async function GET() {
  const recipes = getAllRecipes();
  const missing = new Map<string, { count: number; usedIn: string[] }>();

  for (const r of recipes) {
    for (const ri of r.ingredients) {
      if (!getIngredient(ri.ingredientId)) {
        const entry = missing.get(ri.ingredientId) || { count: 0, usedIn: [] };
        entry.count++;
        if (entry.usedIn.length < 5) entry.usedIn.push(r.nameZh);
        missing.set(ri.ingredientId, entry);
      }
    }
  }

  const list = [...missing.entries()]
    .map(([id, info]) => ({ id, ...info }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ missing: list, total: list.length });
}

/** AI批量补充食材接口（预留） */
export async function POST(req: NextRequest) {
  // 预留接口: 未来接入 Claude API 自动生成缺失食材的营养数据
  // 请求体: { ingredientIds: string[] }
  // 响应: { generated: Ingredient[] }
  const { ingredientIds } = await req.json();

  // TODO: 接入 AI API
  // const prompt = `请为以下食材ID生成完整的营养数据(每100g): ${ingredientIds.join(', ')}`;
  // const response = await callClaudeAPI(prompt);

  return NextResponse.json({
    message: 'AI食材生成接口已预留，待配置API Key后启用',
    pendingIds: ingredientIds,
    status: 'not_connected',
  });
}
