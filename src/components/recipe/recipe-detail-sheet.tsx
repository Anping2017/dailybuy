'use client';

import { useAppStore } from '@/lib/store';
import { getIngredient } from '@/lib/data/recipe-repository';
import { calcRecipeNutrition } from '@/lib/nutrition/calculator';
import { Star, X, CalendarPlus, Edit, Trash2, Clock, Users } from 'lucide-react';
import type { Recipe } from '@/types';
import Link from 'next/link';

const METHOD_LABELS: Record<string, string> = {
  stir_fry: '炒', braise: '红烧', stew: '炖', steam: '蒸', boil: '煮',
  cold_dish: '凉拌', deep_fry: '煎炸', roast: '烤', dry_pot: '干锅', soup: '汤', staple: '主食',
};
const DIFF_LABELS: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' };

export function RecipeDetailSheet({ recipe, isFavorite, onClose, onToggleFav, onAddToPlan, onEdit }: {
  recipe: Recipe;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFav: () => void;
  onAddToPlan: () => void;
  onEdit?: () => void;
}) {
  const { removeCustomRecipe } = useAppStore();
  const nutrition = calcRecipeNutrition(recipe);
  const perServing = Math.round(nutrition.totalCalories / Math.max(1, recipe.servings));

  const handleDelete = () => {
    if (confirm(`确定删除自定义菜谱「${recipe.nameZh}」？此操作不可恢复。`)) {
      removeCustomRecipe(recipe.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[90dvh] sm:max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="p-4 border-b border-border flex-shrink-0 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-lg truncate">{recipe.nameZh}</h2>
              {recipe.isCustom && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">自定义</span>}
            </div>
            <p className="text-xs text-muted mt-0.5">{recipe.nameEn}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onToggleFav}
              className={`p-1.5 rounded transition ${isFavorite ? 'text-yellow-500' : 'text-muted hover:text-yellow-500'}`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button onClick={onClose} className="text-muted"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 元信息 */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.prepTime + recipe.cookTime} 分钟</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {recipe.servings} 人份</span>
            <span>{METHOD_LABELS[recipe.cookingMethod] || recipe.cookingMethod}</span>
            <span>{DIFF_LABELS[recipe.difficulty]}</span>
            <span className="text-accent">{perServing} kcal/份</span>
          </div>

          {/* 食材 */}
          <div>
            <h3 className="font-semibold text-sm mb-2">食材</h3>
            <div className="space-y-1">
              {recipe.ingredients.map(ri => {
                const ing = getIngredient(ri.ingredientId);
                return (
                  <div key={ri.ingredientId} className="flex justify-between text-sm">
                    {ing ? (
                      <Link href={`/ingredient/${ri.ingredientId}`} className="hover:text-primary">
                        {ing.nameZh}
                      </Link>
                    ) : (
                      <span className="text-muted">{ri.ingredientId}</span>
                    )}
                    <span className="text-muted">{ri.amount}{ri.unit}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 做法 */}
          {recipe.steps && recipe.steps.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">做法</h3>
              <ol className="space-y-1.5">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-primary font-medium flex-shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 标签 */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.map(t => (
                <span key={t} className="text-[11px] bg-background border border-border rounded px-1.5 py-0.5">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex gap-2 p-3 border-t border-border flex-shrink-0 bg-card">
          <Link
            href={`/recipe/${recipe.id}`}
            className="flex-1 py-2.5 border border-border rounded-lg text-sm text-center hover:border-primary transition"
          >
            完整页面
          </Link>
          {onEdit && (
            <button onClick={onEdit} className="px-3 py-2.5 border border-border rounded-lg hover:border-primary transition">
              <Edit className="w-4 h-4" />
            </button>
          )}
          {recipe.isCustom && (
            <button onClick={handleDelete} className="px-3 py-2.5 border border-border rounded-lg text-muted hover:text-danger hover:border-danger transition">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onAddToPlan}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition"
          >
            <CalendarPlus className="w-4 h-4" /> 加入本周
          </button>
        </div>
      </div>
    </div>
  );
}
