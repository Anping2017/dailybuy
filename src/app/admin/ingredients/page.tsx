'use client';
import { adminFetch } from '@/lib/admin-auth';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Apple } from 'lucide-react';
import type { Ingredient, IngredientCategory } from '@/types';

interface IngredientWithCount extends Ingredient {
  recipeCount: number;
}

interface Data {
  ingredients: IngredientWithCount[];
  total: number;
  stats: { total: number; byCategory: Record<string, number> };
}

const CAT_LABELS: Record<IngredientCategory, string> = {
  vegetable: '蔬菜', fruit: '水果', meat: '肉类', seafood: '海鲜',
  egg_dairy: '蛋奶', grain: '谷物', bean: '豆类', seasoning: '调料',
  oil: '油脂', dried: '干货', other: '其他',
};

const WARN_LABELS: Record<string, string> = {
  high_gi: '高升糖', high_purine: '高嘌呤', high_sodium: '高钠', high_fat: '高脂',
  high_sugar: '高糖', high_cholesterol: '高胆固醇', processed: '加工肉', contains_alcohol: '含酒精',
};
const ALLERGEN_LABELS: Record<string, string> = {
  allergen_gluten: '麸质', allergen_dairy: '乳制品', allergen_nut: '坚果',
  allergen_sesame: '芝麻', allergen_seafood: '海鲜', allergen_egg: '蛋', allergen_soy: '大豆',
};
const HIGHLIGHT_LABELS: Record<string, string> = {
  high_fiber: '高纤', high_protein: '高蛋白', high_iron: '高铁', high_iodine: '高碘',
  high_zinc: '高锌', high_vitamin_a: '高维A', high_vitamin: '富维生素',
  whole_grain: '全谷物', low_fat: '低脂', low_calorie: '低卡',
};

export default function IngredientsAdminPage() {
  const [data, setData] = useState<Data | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (catFilter) params.set('category', catFilter);
    adminFetch(`/api/admin/ingredients?${params}`).then(r => r.json()).then(setData);
  }, [search, catFilter]);

  if (!data) return <p className="text-muted">加载中...</p>;

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">食材管理</h1>
        <span className="text-sm text-muted">共 {data.stats.total} 种食材</span>
      </div>

      {/* 分类统计 */}
      <div className="flex flex-wrap gap-2">
        <FilterBtn label={`全部 (${data.stats.total})`} active={!catFilter} onClick={() => setCatFilter('')} />
        {Object.entries(data.stats.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
          <FilterBtn key={cat} label={`${CAT_LABELS[cat as IngredientCategory] || cat} (${count})`}
            active={catFilter === cat} onClick={() => setCatFilter(cat)} />
        ))}
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" placeholder="搜索食材名..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-card" />
      </div>

      {/* 表格 */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="p-3 text-left">食材</th>
              <th className="p-3 text-left w-16">分类</th>
              <th className="p-3 text-right w-16">热量</th>
              <th className="p-3 text-right w-16">蛋白</th>
              <th className="p-3 text-right w-16">脂肪</th>
              <th className="p-3 text-right w-16">碳水</th>
              <th className="p-3 text-right w-20">预估价格</th>
              <th className="p-3 text-left w-20">标签</th>
              <th className="p-3 text-right w-16">菜谱</th>
            </tr>
          </thead>
          <tbody>
            {data.ingredients.map(ing => (
              <tr key={ing.id} className="border-b border-border last:border-0 hover:bg-background/50">
                <td className="p-3">
                  <Link href={`/admin/ingredients/${ing.id}`} className="hover:text-primary transition">
                    <p className="font-medium">{ing.nameZh}</p>
                    <p className="text-xs text-muted">{ing.nameEn}</p>
                  </Link>
                </td>
                <td className="p-3 text-xs">{CAT_LABELS[ing.category]}</td>
                <td className="p-3 text-right text-xs">{ing.nutrition.calories}</td>
                <td className="p-3 text-right text-xs">{ing.nutrition.protein}g</td>
                <td className="p-3 text-right text-xs">{ing.nutrition.fat}g</td>
                <td className="p-3 text-right text-xs">{ing.nutrition.carbs}g</td>
                <td className="p-3 text-right text-xs">${ing.priceNZD}/{ing.unit}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {(ing.warnings || []).map(t => (
                      <span key={t} className="text-[10px] bg-red-50 text-red-600 px-1 rounded">{WARN_LABELS[t] || t}</span>
                    ))}
                    {(ing.allergens || []).map(t => (
                      <span key={t} className="text-[10px] bg-orange-50 text-orange-600 px-1 rounded">{ALLERGEN_LABELS[t] || t}</span>
                    ))}
                    {(ing.highlights || []).map(t => (
                      <span key={t} className="text-[10px] bg-emerald-50 text-emerald-600 px-1 rounded">{HIGHLIGHT_LABELS[t] || t}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-right text-xs">
                  <span className={ing.recipeCount === 0 ? 'text-red-500' : ''}>{ing.recipeCount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
        active ? 'bg-primary text-white' : 'bg-card border border-border hover:border-primary/50'
      }`}>
      {label}
    </button>
  );
}
