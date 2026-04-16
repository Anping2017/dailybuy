'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getIngredient, getAllRecipes } from '@/lib/data/recipe-repository';
import type { IngredientCategory, HealthWarning, Allergen, NutritionHighlight } from '@/types';

const CAT_LABELS: Record<IngredientCategory, string> = {
  vegetable: '蔬菜', fruit: '水果', meat: '肉类', seafood: '海鲜',
  egg_dairy: '蛋奶', grain: '谷物/主食', bean: '豆类', seasoning: '调料',
  oil: '油脂', dried: '干货', other: '其他',
};

const WARN_LABELS: Record<HealthWarning, string> = {
  high_gi: '高升糖', high_purine: '高嘌呤', high_sodium: '高钠',
  high_fat: '高脂', high_sugar: '高糖', high_cholesterol: '高胆固醇',
  processed: '加工肉', contains_alcohol: '含酒精',
};
const ALLERGEN_LABELS: Record<Allergen, string> = {
  allergen_gluten: '含麸质', allergen_dairy: '含乳制品', allergen_nut: '含坚果',
  allergen_sesame: '含芝麻', allergen_seafood: '含海鲜', allergen_egg: '含蛋', allergen_soy: '含大豆',
};
const HIGHLIGHT_LABELS: Record<NutritionHighlight, string> = {
  high_fiber: '高纤维', high_protein: '高蛋白', high_iron: '高铁',
  high_iodine: '高碘', high_zinc: '高锌', high_vitamin_a: '高维A',
  high_vitamin: '富维生素', whole_grain: '全谷物', low_fat: '低脂', low_calorie: '低卡',
};

export default function IngredientDetailPage() {
  const params = useParams();
  const router = useRouter();

  const ingredientId = decodeURIComponent(params.id as string);
  const ingredient = getIngredient(ingredientId);
  if (!ingredient) return <div className="text-center py-16 text-muted">食材不存在</div>;

  // 反查用到该食材的菜谱
  const relatedRecipes = getAllRecipes().filter(r =>
    r.ingredients.some(ri => ri.ingredientId === ingredientId)
  );

  const n = ingredient.nutrition;

  return (
    <div className="space-y-4 pb-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> 返回上页
      </button>

      <div>
        <h1 className="text-xl font-bold">{ingredient.nameZh}</h1>
        <p className="text-sm text-muted">{ingredient.nameEn}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">{CAT_LABELS[ingredient.category]}</span>
        <span className="text-xs bg-background px-2 py-1 rounded-full">${ingredient.priceNZD}/{ingredient.unit}</span>
        {ingredient.warnings.map(t => (
          <span key={t} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">{WARN_LABELS[t]}</span>
        ))}
        {ingredient.allergens.map(t => (
          <span key={t} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">{ALLERGEN_LABELS[t]}</span>
        ))}
        {ingredient.highlights.map(t => (
          <span key={t} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">{HIGHLIGHT_LABELS[t]}</span>
        ))}
      </div>

      {/* 营养成分表 */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3">营养成分 (每100g)</h3>
        <div className="grid grid-cols-2 gap-2">
          <NutrRow label="热量" value={`${n.calories} kcal`} />
          <NutrRow label="蛋白质" value={`${n.protein} g`} />
          <NutrRow label="脂肪" value={`${n.fat} g`} />
          <NutrRow label="碳水化合物" value={`${n.carbs} g`} />
          <NutrRow label="膳食纤维" value={`${n.fiber} g`} />
          <NutrRow label="钠" value={`${n.sodium} mg`} />
          <NutrRow label="糖" value={`${n.sugar} g`} />
        </div>
      </div>

      {/* 相关菜谱 */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3">用到这个食材的菜谱 ({relatedRecipes.length})</h3>
        <div className="space-y-1">
          {relatedRecipes.slice(0, 20).map(r => (
            <Link key={r.id} href={`/recipe/${r.id}`}
              className="flex justify-between items-center py-1.5 text-sm hover:text-primary transition border-b border-border last:border-0">
              <span>{r.nameZh}</span>
              <span className="text-xs text-muted">{r.difficulty === 'easy' ? '简单' : r.difficulty === 'medium' ? '中等' : '困难'}</span>
            </Link>
          ))}
          {relatedRecipes.length > 20 && <p className="text-xs text-muted mt-2">还有 {relatedRecipes.length - 20} 道菜...</p>}
        </div>
      </div>
    </div>
  );
}

function NutrRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b border-border">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
