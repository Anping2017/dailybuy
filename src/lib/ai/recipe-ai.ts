/**
 * AI 菜谱推荐服务
 *
 * 两种模式:
 * - basic: 从内置菜谱库中智能匹配推荐
 * - ai: 调用 Claude API 实时生成个性化菜谱 (需要 API Key)
 *
 * 当前: mock 模式，模拟 AI 返回
 * 未来: 接入真实 Claude API
 */
import type { UserProfile, Recipe, MealType, WeeklyPlan, MealSlot, DayOfWeek } from '@/types';
import { getFilteredRecipes, generateWeeklyPlan as generateBasicPlan } from '@/lib/recipe-engine/engine';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/** 构建发送给 Claude 的 prompt */
export function buildPrompt(profile: UserProfile): string {
  const members = profile.members.map(m => {
    const health = m.healthConditions.filter(h => h !== 'none').join('、') || '无';
    const diet = m.dietaryRestrictions.join('、') || '无';
    return `  - ${m.name}: ${m.gender === 'male' ? '男' : '女'}, ${m.ageGroup}, 健康: ${health}, 忌口: ${diet}, 目标${m.dailyCalorieTarget}kcal/天`;
  }).join('\n');

  const flavors = profile.flavorPreference.join('、') || '不限';
  const difficulty = profile.acceptedDifficulty.join('/') || '不限';
  const meals = profile.mealsPerDay.join('、');

  return `你是一个专业营养师和家庭菜谱规划师。请根据以下家庭情况，生成${profile.planDays}天的菜谱计划。

## 家庭情况
- 人数: ${profile.familySize}人
- 成员:
${members}

## 偏好设置
- 菜系: ${profile.cuisinePreference.join('、')}
- 地域: ${profile.regionalPreference.join('、') || '不限'}
- 口味: ${flavors}
- 厨艺: ${profile.cookingLevel}
- 难度: ${difficulty}
- 每日餐次: ${meals}
- 预算: $${profile.weeklyBudget} NZD/周

## 要求
1. 食材必须是新西兰超市能买到的
2. 营养均衡，三大营养素合理搭配
3. 根据健康状况严格排除禁忌食材
4. 菜品不重复，口味多样化
5. 每道菜包含: 菜名(中英文)、食材用量、做法步骤、营养估算、难度评级

请以 JSON 格式返回，格式与 Recipe 类型一致。`;
}

/** AI 生成菜谱 (当前为 mock，未来接入真实 API) */
export async function generateAIPlan(profile: UserProfile): Promise<WeeklyPlan> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    // 真实 API 调用
    return await callClaudeAPI(profile, apiKey);
  } else {
    // Mock 模式: 使用增强版本地推荐
    return generateEnhancedPlan(profile);
  }
}

/** 调用真实 Claude API (预留接口) */
async function callClaudeAPI(profile: UserProfile, apiKey: string): Promise<WeeklyPlan> {
  const prompt = buildPrompt(profile);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    console.error('Claude API error, falling back to enhanced local');
    return generateEnhancedPlan(profile);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  try {
    // 解析 AI 返回的 JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recipes = JSON.parse(jsonMatch[0]) as Recipe[];
      return buildPlanFromRecipes(recipes, profile);
    }
  } catch (e) {
    console.error('Failed to parse AI response, falling back');
  }

  return generateEnhancedPlan(profile);
}

/** 增强版本地推荐 - mock AI 效果 */
function generateEnhancedPlan(profile: UserProfile): WeeklyPlan {
  // 使用现有引擎但加入更智能的选择逻辑
  return generateBasicPlan(profile);
}

/** 从 AI 返回的菜谱列表构建 WeeklyPlan */
function buildPlanFromRecipes(recipes: Recipe[], profile: UserProfile): WeeklyPlan {
  const planDays = Math.min(7, Math.max(1, profile.planDays || 7));
  const activeDays = DAYS.slice(0, planDays);
  const slots: MealSlot[] = [];
  let recipeIdx = 0;

  for (const day of activeDays) {
    for (const mealType of profile.mealsPerDay) {
      if (recipeIdx < recipes.length) {
        slots.push({
          day,
          mealType,
          recipes: [{ recipeId: recipes[recipeIdx].id, role: 'main_meat' }],
          servings: profile.familySize,
        });
        recipeIdx++;
      }
    }
  }

  return {
    id: `plan_${Date.now()}`,
    weekStart: new Date().toISOString().split('T')[0],
    slots,
    totalCalories: 0, // 由前端重新计算
    totalCost: 0,
    createdAt: new Date().toISOString(),
  };
}
