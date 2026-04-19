'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertTriangle, Flame } from 'lucide-react';
import type { Recipe, NutritionPer100g, RecipeStatus, CuisineType, RegionalCuisine, DifficultyLevel, CookingMethod, CookingLevel, FlavorPreference, MealType } from '@/types';
import type { ValidationIssue } from '@/lib/data/validation';
import { getIngredient } from '@/lib/data/recipe-repository';
import { NutritionBadges, PerServingPanel } from '@/components/recipe/nutrition-badges';

interface RecipeDetail {
  recipe: Recipe;
  nutrition: NutritionPer100g & { totalCalories: number };
  cost: number;
  issues: ValidationIssue[];
}

const CUISINE_ZH: Record<CuisineType, string> = {
  chinese: '中餐', western: '西餐', asian_other: '亚洲其他', fusion: '混合',
};
const REGIONAL_ZH: Record<string, string> = {
  homestyle: '家常菜', sichuan: '川菜', cantonese: '粤菜', shandong: '鲁菜', jiangsu: '苏菜/淮扬',
  hunan: '湘菜', fujian: '闽菜', dongbei: '东北菜', zhejiang: '浙菜', anhui: '徽菜',
  yunnan: '云南菜', xinjiang: '新疆菜', taiwanese: '台湾菜',
  italian: '意式', american: '美式', french: '法式',
  japanese: '日式', korean: '韩式', southeast_asian: '东南亚',
};
const METHOD_ZH: Record<string, string> = {
  stir_fry: '炒菜', braise: '红烧/卤', stew: '炖/煲', steam: '蒸', boil: '煮/汆',
  cold_dish: '凉拌', deep_fry: '炸/煎', roast: '烤/焗', dry_pot: '干锅', soup: '汤羹', staple: '主食',
};
const DIFF_ZH: Record<DifficultyLevel, string> = { easy: '简单', medium: '中等', hard: '困难' };
const LEVEL_ZH: Record<CookingLevel, string> = {
  beginner: '厨房小白', basic: '入门级', intermediate: '家常级', advanced: '进阶级', expert: '大厨级',
};
const FLAVOR_ZH: Record<FlavorPreference, string> = {
  sour: '酸', sweet: '甜', bitter: '苦', spicy: '辣', salty: '咸', umami: '鲜', light: '清淡',
};
const MEAL_ZH: Record<MealType, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<RecipeDetail | null>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/admin/recipes/${params.id}`).then(r => r.json()).then(setData);
    }
  }, [params.id]);

  const handleStatus = async (status: RecipeStatus) => {
    await fetch(`/api/admin/recipes/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setData(prev => prev ? { ...prev, recipe: { ...prev.recipe, status } } : null);
  };

  if (!data) return <p className="text-muted">加载中...</p>;

  const { recipe, nutrition, cost, issues } = data;
  const perServing = Math.round(nutrition.totalCalories / (recipe.servings || 1));

  return (
    <div className="max-w-4xl space-y-6">
      {/* 返回 */}
      <Link href="/admin/recipes" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> 返回列表
      </Link>

      {/* 头部 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{recipe.nameZh}</h1>
          <p className="text-muted">{recipe.nameEn}</p>
          <p className="text-xs text-muted mt-1">ID: {recipe.id} · 来源: {recipe.source || '原始'}</p>
        </div>
        <div className="flex gap-2">
          <StatusBtn label="审核通过" status="reviewed" current={recipe.status} onClick={handleStatus} color="bg-green-500" />
          <StatusBtn label="待审核" status="pending" current={recipe.status} onClick={handleStatus} color="bg-yellow-500" />
          <StatusBtn label="禁用" status="disabled" current={recipe.status} onClick={handleStatus} color="bg-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左栏: 菜谱信息 */}
        <div className="space-y-4">
          {/* 基本信息 */}
          <Section title="基本信息">
            <InfoRow label="菜系" value={CUISINE_ZH[recipe.cuisine as CuisineType] || recipe.cuisine} />
            <InfoRow label="地域" value={REGIONAL_ZH[recipe.regionalCuisine] || recipe.regionalCuisine} />
            <InfoRow label="做法" value={METHOD_ZH[recipe.cookingMethod] || recipe.cookingMethod} />
            <InfoRow label="口味" value={recipe.flavors?.map(f => FLAVOR_ZH[f as FlavorPreference] || f).join('、')} />
            <InfoRow label="难度" value={DIFF_ZH[recipe.difficulty as DifficultyLevel] || recipe.difficulty} />
            <InfoRow label="最低厨艺" value={LEVEL_ZH[recipe.minCookingLevel as CookingLevel] || recipe.minCookingLevel} />
            <InfoRow label="餐次" value={recipe.mealTypes?.map(m => MEAL_ZH[m as MealType] || m).join('、')} />
            <InfoRow label="份数" value={`${recipe.servings}人份`} />
            <InfoRow label="时间" value={`准备${recipe.prepTime}分 + 烹饪${recipe.cookTime}分`} />
            <InfoRow label="标签" value={recipe.tags?.join('、')} />
          </Section>

          {/* 食材 */}
          <Section title="食材列表">
            <div className="space-y-1">
              {recipe.ingredients.map((ing, i) => {
                const ingredient = getIngredient(ing.ingredientId);
                return (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                    {ingredient ? (
                      <Link href={`/admin/ingredients/${ing.ingredientId}`} className="text-primary hover:underline">
                        {ingredient.nameZh}
                      </Link>
                    ) : (
                      <span className="text-red-500">{ing.ingredientId} (未知)</span>
                    )}
                    <span className="text-muted">{ing.amount} {ing.unit}</span>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* 步骤 */}
          <Section title="做法步骤">
            <ol className="space-y-1 text-sm list-decimal list-inside">
              {recipe.steps.map((step, i) => (
                <li key={i} className="py-1">{step}</li>
              ))}
            </ol>
          </Section>
        </div>

        {/* 右栏: 营养+问题 */}
        <div className="space-y-4">
          {/* 健康标签(警告/亮点/过敏原) */}
          <Section title="健康分类">
            <NutritionBadges recipe={recipe} />
            {(!recipe.nutritionWarnings && !recipe.nutritionHighlights && !recipe.dietaryFlags && !recipe.allergens) && (
              <p className="text-xs text-muted">未预计算 — 重跑 enrich-nutrition.js 生成</p>
            )}
          </Section>

          {/* 每份营养面板(预计算优先) */}
          {recipe.perServing && <PerServingPanel recipe={recipe} />}

          {/* 营养信息(运行时计算,可与预计算对照) */}
          <Section title={recipe.perServing ? "运行时全量营养(对照用)" : "营养信息(计算值)"}>
            <div className="grid grid-cols-2 gap-3">
              <NutrBox label="总热量" value={`${nutrition.totalCalories} kcal`} highlight />
              <NutrBox label="每份热量" value={`${perServing} kcal`} />
              <NutrBox label="蛋白质" value={`${nutrition.protein}g`} />
              <NutrBox label="脂肪" value={`${nutrition.fat}g`} />
              <NutrBox label="碳水" value={`${nutrition.carbs}g`} />
              <NutrBox label="纤维" value={`${nutrition.fiber}g`} />
              <NutrBox label="钠" value={`${nutrition.sodium}mg`} />
              <NutrBox label="糖" value={`${nutrition.sugar}g`} />
            </div>
            <div className="mt-3 p-3 bg-background rounded-lg">
              <p className="text-sm font-medium">预估成本: <span className="text-primary">${cost.toFixed(2)} NZD</span></p>
            </div>
          </Section>

          {/* 三大营养素比例 */}
          <Section title="三大营养素比例">
            <MacroBar protein={nutrition.protein} fat={nutrition.fat} carbs={nutrition.carbs} />
          </Section>

          {/* 数据问题 */}
          {issues.length > 0 && (
            <Section title={`数据问题 (${issues.length})`}>
              <div className="space-y-1">
                {issues.map((issue, i) => (
                  <div key={i} className={`flex items-start gap-2 text-sm p-2 rounded ${
                    issue.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {issues.length === 0 && (
            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg text-green-700 text-sm">
              <CheckCircle className="w-5 h-5" /> 数据校验通过，无问题
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b border-border last:border-0">
      <span className="text-muted">{label}</span>
      <span>{value || '-'}</span>
    </div>
  );
}

function NutrBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-2 rounded-lg text-center ${highlight ? 'bg-accent/10' : 'bg-background'}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className={`font-bold ${highlight ? 'text-accent' : ''}`}>{value}</p>
    </div>
  );
}

function MacroBar({ protein, fat, carbs }: { protein: number; fat: number; carbs: number }) {
  const total = protein + fat + carbs || 1;
  const pP = Math.round((protein / total) * 100);
  const fP = Math.round((fat / total) * 100);
  const cP = 100 - pP - fP;
  return (
    <div>
      <div className="flex h-4 rounded-full overflow-hidden">
        <div className="bg-blue-400 flex items-center justify-center text-white text-[10px]" style={{ width: `${pP}%` }}>{pP}%</div>
        <div className="bg-yellow-400 flex items-center justify-center text-white text-[10px]" style={{ width: `${fP}%` }}>{fP}%</div>
        <div className="bg-green-400 flex items-center justify-center text-white text-[10px]" style={{ width: `${cP}%` }}>{cP}%</div>
      </div>
      <div className="flex justify-between text-xs text-muted mt-1">
        <span>蛋白质 {protein.toFixed(1)}g</span>
        <span>脂肪 {fat.toFixed(1)}g</span>
        <span>碳水 {carbs.toFixed(1)}g</span>
      </div>
    </div>
  );
}

function StatusBtn({ label, status, current, onClick, color }: {
  label: string; status: RecipeStatus; current?: RecipeStatus; onClick: (s: RecipeStatus) => void; color: string;
}) {
  const active = current === status;
  return (
    <button
      onClick={() => onClick(status)}
      className={`px-3 py-1.5 rounded text-xs font-medium transition ${
        active ? `${color} text-white` : 'border border-border text-muted hover:border-primary'
      }`}
    >
      {label}
    </button>
  );
}
