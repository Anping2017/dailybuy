'use client';

import { useState } from 'react';
import { X, Calendar, Shuffle, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Recipe, DayOfWeek, MealType, DishRole } from '@/types';

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: '周一', tuesday: '周二', wednesday: '周三', thursday: '周四',
  friday: '周五', saturday: '周六', sunday: '周日',
};
const MEAL_LABELS: Record<MealType, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };

/** 推断菜在一餐中的角色（与 engine.inferRole 同逻辑） */
function inferRole(recipe: Recipe): DishRole {
  if (recipe.cookingMethod === 'soup') return 'soup';
  if (recipe.cookingMethod === 'staple') return 'staple';
  if (recipe.cookingMethod === 'cold_dish') return 'cold';
  // 是否含肉/海鲜
  const meatIds = ['pork_belly','pork_mince','beef_sirloin','beef_mince','chicken_breast','chicken_thigh','salmon_fillet','shrimp','squid'];
  if (recipe.ingredients.some(ri => meatIds.some(m => ri.ingredientId.startsWith(m.split('_')[0])))) return 'main_meat';
  return 'main_veg';
}

export function AddToPlanSheet({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const { profile, weeklyPlan, addRecipeToMeal, replaceSingleRecipe } = useAppStore();
  const [mode, setMode] = useState<'choose' | 'random'>('choose');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!weeklyPlan) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-card rounded-2xl p-6 max-w-sm" onClick={e => e.stopPropagation()}>
          <p className="text-sm">还没有本周计划，请先去「菜谱」页生成。</p>
          <button onClick={onClose} className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm w-full">
            知道了
          </button>
        </div>
      </div>
    );
  }

  const role = inferRole(recipe);
  const activeDays = Array.from(new Set(weeklyPlan.slots.map(s => s.day))) as DayOfWeek[];
  const slot = selectedDay && selectedMeal
    ? weeklyPlan.slots.find(s => s.day === selectedDay && s.mealType === selectedMeal)
    : null;
  const sameRoleInSlot = slot ? (slot.recipes || []).filter(m => m.role === role) : [];

  const handleConfirm = () => {
    if (mode === 'random') {
      // 随机选 1 天 1 餐插入
      const eligibleSlots = weeklyPlan.slots.filter(s => {
        // 只选不重复的位置
        return !((s.recipes || []).some(m => m.recipeId === recipe.id));
      });
      if (eligibleSlots.length === 0) return;
      const pick = eligibleSlots[Math.floor(Math.random() * eligibleSlots.length)];
      addRecipeToMeal(pick.day, pick.mealType, recipe.id, role);
      setDone(true);
      setTimeout(() => onClose(), 1200);
      return;
    }
    if (!selectedDay || !selectedMeal) return;
    if (replaceTargetId) {
      replaceSingleRecipe(selectedDay, selectedMeal, replaceTargetId, recipe.id, role);
    } else {
      addRecipeToMeal(selectedDay, selectedMeal, recipe.id, role);
    }
    setDone(true);
    setTimeout(() => onClose(), 1200);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[90dvh] sm:max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-start justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted">加入本周菜谱</p>
            <p className="font-semibold text-sm truncate">{recipe.nameZh}</p>
          </div>
          <button onClick={onClose} className="text-muted ml-2"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">已加入本周菜谱</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 模式切换 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('choose')}
                  className={`flex-1 p-2.5 rounded-lg border-2 text-center text-sm transition ${
                    mode === 'choose' ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border'
                  }`}
                >
                  <Calendar className="w-4 h-4 mx-auto mb-1" />
                  指定日期
                </button>
                <button
                  onClick={() => setMode('random')}
                  className={`flex-1 p-2.5 rounded-lg border-2 text-center text-sm transition ${
                    mode === 'random' ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border'
                  }`}
                >
                  <Shuffle className="w-4 h-4 mx-auto mb-1" />
                  随机插入
                </button>
              </div>

              {mode === 'choose' && (
                <>
                  {/* 选哪天 */}
                  <div>
                    <label className="text-xs text-muted block mb-1">选择日期</label>
                    <div className="flex flex-wrap gap-1">
                      {activeDays.map(d => (
                        <button
                          key={d}
                          onClick={() => { setSelectedDay(d); setReplaceTargetId(null); }}
                          className={`px-3 py-1.5 rounded-full text-xs border transition ${
                            selectedDay === d ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {DAY_LABELS[d]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 选哪餐 */}
                  {selectedDay && (
                    <div>
                      <label className="text-xs text-muted block mb-1">选择餐次</label>
                      <div className="flex gap-1">
                        {(['breakfast','lunch','dinner'] as MealType[]).filter(mt =>
                          weeklyPlan.slots.some(s => s.day === selectedDay && s.mealType === mt)
                        ).map(mt => (
                          <button
                            key={mt}
                            onClick={() => { setSelectedMeal(mt); setReplaceTargetId(null); }}
                            className={`flex-1 px-3 py-1.5 rounded-full text-xs border transition ${
                              selectedMeal === mt ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary/50'
                            }`}
                          >
                            {MEAL_LABELS[mt]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 替换 vs 新增 */}
                  {slot && (
                    <div>
                      <label className="text-xs text-muted block mb-1">操作</label>
                      <div className="space-y-1">
                        <button
                          onClick={() => setReplaceTargetId(null)}
                          className={`w-full text-left p-2.5 rounded-lg border-2 transition ${
                            replaceTargetId === null ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <p className="text-sm font-medium">＋ 新增到本餐</p>
                          <p className="text-xs text-muted">在本餐已有菜的基础上添加这道</p>
                        </button>
                        {sameRoleInSlot.length > 0 && (
                          <p className="text-xs text-muted px-1 mt-2">或替换同角色的菜:</p>
                        )}
                        {sameRoleInSlot.map(mr => (
                          <button
                            key={mr.recipeId}
                            onClick={() => setReplaceTargetId(mr.recipeId)}
                            className={`w-full text-left p-2.5 rounded-lg border-2 transition ${
                              replaceTargetId === mr.recipeId ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                          >
                            <p className="text-xs text-muted">替换 →</p>
                            <p className="text-sm">{useResolvedRecipeName(mr.recipeId)}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {mode === 'random' && (
                <div className="bg-background border border-border rounded-lg p-3 text-sm text-muted">
                  系统会从本周可用日期中随机挑选一天一餐，把这道菜加进去。
                </div>
              )}
            </div>

            {/* 确认按钮 */}
            <div className="p-3 border-t border-border flex-shrink-0 bg-card">
              <button
                onClick={handleConfirm}
                disabled={mode === 'choose' && (!selectedDay || !selectedMeal)}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition"
              >
                {mode === 'random' ? '随机加入' : replaceTargetId ? '确认替换' : '确认新增'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** 内联辅助：解析菜谱名（避免循环导入） */
function useResolvedRecipeName(id: string): string {
  // 同步从 store 读
  const profile = useAppStore.getState().profile;
  const custom = (profile.customRecipes || []).find(r => r.id === id);
  if (custom) return custom.nameZh;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getRecipe } = require('@/lib/data/recipe-repository') as typeof import('@/lib/data/recipe-repository');
  return getRecipe(id)?.nameZh || id;
}
