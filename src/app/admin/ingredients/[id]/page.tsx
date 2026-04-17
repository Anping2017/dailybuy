'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Ingredient, IngredientCategory, HealthWarning, Allergen, NutritionHighlight } from '@/types';

interface Data {
  ingredient: Ingredient;
  relatedRecipes: { id: string; nameZh: string; nameEn: string; cuisine: string; difficulty: string }[];
}

const CAT_ZH: Record<IngredientCategory, string> = {
  vegetable: '蔬菜', fruit: '水果', meat: '肉类', seafood: '海鲜',
  egg_dairy: '蛋奶', grain: '谷物/主食', bean: '豆类', seasoning: '调料',
  oil: '油脂', dried: '干货', other: '其他',
};
const WARN_ZH: Record<HealthWarning, string> = {
  high_gi: '高升糖', high_purine: '高嘌呤', high_sodium: '高钠',
  high_fat: '高脂', high_sugar: '高糖', high_cholesterol: '高胆固醇',
  processed: '加工肉', contains_alcohol: '含酒精',
};
const ALLERGEN_ZH: Record<Allergen, string> = {
  allergen_gluten: '含麸质', allergen_dairy: '含乳制品', allergen_nut: '含坚果',
  allergen_sesame: '含芝麻', allergen_seafood: '含海鲜', allergen_egg: '含蛋', allergen_soy: '含大豆',
};
const HIGHLIGHT_ZH: Record<NutritionHighlight, string> = {
  high_fiber: '高纤维', high_protein: '高蛋白', high_iron: '高铁',
  high_iodine: '高碘', high_zinc: '高锌', high_vitamin_a: '高维A',
  high_vitamin: '富维生素', whole_grain: '全谷物', low_fat: '低脂', low_calorie: '低卡',
};
const DIFF_ZH: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' };
const CUISINE_ZH: Record<string, string> = { chinese: '中餐', western: '西餐', asian_other: '亚洲', fusion: '混合' };

export default function IngredientDetailAdminPage() {
  const params = useParams();
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    if (params.id) fetch(`/api/admin/ingredients/${params.id}`).then(r => r.json()).then(setData);
  }, [params.id]);

  if (!data) return <p className="text-muted">加载中...</p>;

  const { ingredient: ing, relatedRecipes } = data;
  const n = ing.nutrition;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/ingredients" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> 返回食材列表
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{ing.nameZh}</h1>
        <p className="text-muted">{ing.nameEn}</p>
        <p className="text-xs text-muted mt-1">ID: {ing.id}</p>
      </div>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{CAT_ZH[ing.category]}</span>
        <span className="text-xs bg-background px-2 py-1 rounded-full">预估 ${ing.priceNZD}/{ing.unit}</span>
        {(ing.warnings || []).map(t => (
          <span key={t} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">{WARN_ZH[t]}</span>
        ))}
        {(ing.allergens || []).map(t => (
          <span key={t} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">{ALLERGEN_ZH[t]}</span>
        ))}
        {(ing.highlights || []).map(t => (
          <span key={t} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">{HIGHLIGHT_ZH[t]}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 营养成分 */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3">营养成分（每100g）</h3>
          <div className="space-y-2">
            <NRow label="热量" value={`${n.calories} kcal`} bar={n.calories} max={500} color="bg-accent" />
            <NRow label="蛋白质" value={`${n.protein} g`} bar={n.protein} max={40} color="bg-blue-400" />
            <NRow label="脂肪" value={`${n.fat} g`} bar={n.fat} max={50} color="bg-yellow-400" />
            <NRow label="碳水化合物" value={`${n.carbs} g`} bar={n.carbs} max={80} color="bg-green-400" />
            <NRow label="膳食纤维" value={`${n.fiber} g`} bar={n.fiber} max={10} color="bg-emerald-400" />
            <NRow label="钠" value={`${n.sodium} mg`} bar={n.sodium} max={2000} color="bg-red-300" />
            <NRow label="糖" value={`${n.sugar} g`} bar={n.sugar} max={30} color="bg-pink-400" />
          </div>
        </div>

        {/* 购买信息 */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">购买信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">预估价格</span>
                <span className="font-medium">${ing.priceNZD} NZD / {ing.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">计量单位</span>
                <span>{ing.unit}</span>
              </div>
              <p className="text-[10px] text-muted mt-2">* 价格为参考预估值，实际价格以 Countdown 为准</p>
            </div>
          </div>

          {ing.season && ing.season.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2">当季月份</h3>
              <div className="flex gap-1">
                {['1','2','3','4','5','6','7','8','9','10','11','12'].map(m => (
                  <span key={m} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    ing.season?.includes(m) ? 'bg-primary text-white' : 'bg-background text-muted'
                  }`}>{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 引用菜谱 */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3">引用该食材的菜谱（{relatedRecipes.length}道）</h3>
        {relatedRecipes.length === 0 ? (
          <p className="text-sm text-red-500">未被任何菜谱使用</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {relatedRecipes.map(r => (
              <Link key={r.id} href={`/admin/recipes/${r.id}`}
                className="flex justify-between items-center py-1.5 px-2 text-sm hover:bg-background rounded transition">
                <span>{r.nameZh}</span>
                <span className="text-xs text-muted">{CUISINE_ZH[r.cuisine] || r.cuisine} · {DIFF_ZH[r.difficulty] || r.difficulty}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NRow({ label, value, bar, max, color }: { label: string; value: string; bar: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-0.5">
        <span className="text-muted">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 bg-background rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, (bar / max) * 100)}%` }} />
      </div>
    </div>
  );
}
