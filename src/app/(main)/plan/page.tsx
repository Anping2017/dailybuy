'use client';

import { useAppStore, getPreferenceScore, getFeedbackAdjustment } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RefreshCw, X, Flame, ShoppingCart, Check, Sparkles, Share2, Copy, CheckCheck, CalendarDays, List, ChevronRight, Package, ChevronDown } from 'lucide-react';
import { getRecipe, calcRecipeNutrition, calcRecipeCost } from '@/lib/nutrition/calculator';
import { getFilteredRecipes, generateWeeklyPlan, generateShoppingList } from '@/lib/recipe-engine/engine';
import { getIngredient, getAllIngredients } from '@/lib/data/recipe-repository';
import { ConfigSummary } from '@/components/ui/config-summary';
import Link from 'next/link';
import type { DayOfWeek, MealType, DishRole } from '@/types';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: '周一', tuesday: '周二', wednesday: '周三', thursday: '周四',
  friday: '周五', saturday: '周六', sunday: '周日',
};
const MEAL_LABELS: Record<string, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };
const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner'];
const ROLE_LABELS: Record<DishRole, string> = {
  main_meat: '荤菜', main_veg: '素菜', soup: '汤', staple: '主食', side: '配菜', cold: '凉菜',
};
const ROLE_COLORS: Record<DishRole, string> = {
  main_meat: 'bg-red-100 text-red-700', main_veg: 'bg-green-100 text-green-700',
  soup: 'bg-blue-100 text-blue-700', staple: 'bg-yellow-100 text-yellow-700',
  side: 'bg-gray-100 text-gray-600', cold: 'bg-cyan-100 text-cyan-700',
};

export default function PlanPage() {
  const router = useRouter();
  const { profile, weeklyPlan, shoppingList, setWeeklyPlan, setShoppingList, removeMealSlot, replaceSingleRecipe, ownedIngredients, addOwnedIngredient, removeOwnedIngredient, addRecipeToShoppingList, removeRecipeFromShoppingList, recordAction, recordSwapReason } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [showWeekShare, setShowWeekShare] = useState(false);
  const [weekShareCopied, setWeekShareCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'calendar'>('day');
  const [swapTarget, setSwapTarget] = useState<{ recipeId: string; mealType: MealType; role: DishRole; day: DayOfWeek } | null>(null);
  const [showOwnedPanel, setShowOwnedPanel] = useState(false);
  const [ingSearch, setIngSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const d = new Date().getDay();
    return DAYS[d === 0 ? 6 : d - 1];
  });

  // 带原因的换菜(需求3)
  const handleSwapWithReason = (targetRecipeId: string, mealType: MealType, role: DishRole, day: DayOfWeek, reason: import('@/types').SwapReason) => {
    const oldRecipe = getRecipe(targetRecipeId);
    // 先记录反馈(细粒度)
    if (oldRecipe) recordSwapReason(targetRecipeId, reason, oldRecipe);
    // 同角色候选池(反馈会在scoreRecipe中生效)
    const pool = getFilteredRecipes(profile, mealType);
    const meal = weeklyPlan?.slots.find(s => s.day === day && s.mealType === mealType);
    const sameRole = pool.filter(r => {
      if (r.id === targetRecipeId) return false;
      if ((meal?.recipes || []).some(m => m.recipeId === r.id)) return false;
      const rRole = r.cookingMethod === 'soup' ? 'soup' : r.cookingMethod === 'staple' ? 'staple' : r.cookingMethod === 'cold_dish' ? 'cold' : (r.ingredients.some(ri => { const ing = getIngredient(ri.ingredientId); return ing && ['meat','seafood'].includes(ing.category); }) ? 'main_meat' : 'main_veg');
      return rRole === role;
    });
    if (sameRole.length === 0) { setSwapTarget(null); return; }
    // 用 feedback 评分从前 30% 随机选
    const scored = sameRole
      .map(r => ({ r, s: getFeedbackAdjustment(r) + getPreferenceScore(r.id) * 0.5 + Math.random() * 3 }))
      .sort((a, b) => b.s - a.s);
    const topN = Math.max(1, Math.ceil(scored.length * 0.3));
    const pick = scored[Math.floor(Math.random() * topN)].r;
    recordAction(targetRecipeId, 'rejected', reason);
    recordAction(pick.id, 'swapped_in');
    replaceSingleRecipe(day, mealType, targetRecipeId, pick.id, role);
    setSwapTarget(null);
  };

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleGenerate = () => {
    // 只有菜谱存在超过1小时，才算用户真正接受了这些菜
    // 短时间内反复点"重新规划"不积分（换着玩）
    if (weeklyPlan) {
      const planAgeMs = Date.now() - new Date(weeklyPlan.createdAt).getTime();
      const ONE_HOUR = 60 * 60 * 1000;
      if (planAgeMs > ONE_HOUR) {
        for (const slot of weeklyPlan.slots) {
          for (const mr of (slot.recipes || [])) {
            recordAction(mr.recipeId, 'accepted');
          }
        }
      }
    }
    const plan = generateWeeklyPlan(profile, ownedIngredients || [], getPreferenceScore, getFeedbackAdjustment);
    setWeeklyPlan(plan);
    if (profile.autoAddToShoppingList) {
      setShoppingList(generateShoppingList(plan, ownedIngredients || []));
    } else {
      setShoppingList({ id: `list_${Date.now()}`, weeklyPlanId: plan.id, items: [], totalEstimatedCost: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    // 需求2: AI 队列分析模式 → 把本次方案写入待分析队列
    if (profile.recommendMode === 'ai_queue') {
      import('@/lib/supabase/pending').then(({ savePendingAnalysis }) => {
        savePendingAnalysis(profile, plan).catch(() => { /* 静默失败 */ });
      });
    }
  };

  if (!weeklyPlan) {
    return (
      <div className="text-center py-16">
        <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-lg font-bold mb-2">开始规划你的菜谱</h2>
        <p className="text-sm text-muted mb-6">根据你的口味和家庭情况，智能推荐每日菜品</p>
        <button onClick={handleGenerate}
          className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-primary/90 transition">
          一键生成菜谱
        </button>
      </div>
    );
  }

  const planDays = Math.min(7, Math.max(1, profile.planDays || 7));
  // 从今天开始顺序排
  const todayJsIdx = new Date().getDay();
  const todayDayIdx = todayJsIdx === 0 ? 6 : todayJsIdx - 1;
  const activeDays: DayOfWeek[] = [];
  for (let i = 0; i < planDays; i++) {
    activeDays.push(DAYS[(todayDayIdx + i) % 7]);
  }
  const daySlots = weeklyPlan.slots.filter(s => s.day === selectedDay);

  return (
    <div className="space-y-4">
      {profile.recommendMode === 'ai_queue' && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs">
          <span className="font-medium text-primary">🤖 AI 队列分析模式</span>
          <span className="text-muted ml-2">本次方案已提交分析队列，Claude 分析完后你会在后台看到优化建议</span>
        </div>
      )}
      <div>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold flex-shrink-0">{planDays === 7 ? '规划菜谱' : `${planDays}天规划`}</h1>
          <div className="flex gap-1.5">
            {/* 视图切换 */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('day')}
                title="日视图"
                className={`px-2 py-1.5 transition ${viewMode === 'day' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'}`}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('calendar')}
                title="周日历"
                className={`px-2 py-1.5 transition ${viewMode === 'calendar' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'}`}>
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => setShowWeekShare(true)}
              title="分享规划"
              className="px-2 py-1.5 border border-border rounded-lg text-muted hover:text-primary hover:border-primary transition">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={handleGenerate}
              title="重新规划"
              className="px-2 py-1.5 border border-border rounded-lg text-muted hover:text-primary hover:border-primary transition">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <ConfigSummary />
      </div>

      {/* 家里有什么食材 - 可折叠 */}
      <div className="bg-card border border-border rounded-lg">
        <button
          onClick={() => setShowOwnedPanel(!showOwnedPanel)}
          className="w-full flex items-center justify-between p-3 hover:bg-background/50 transition"
        >
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-primary" />
            <span className="font-medium">家里有什么食材</span>
            <span className="text-xs text-muted">优先推荐{ownedIngredients.length > 0 ? ` · 已设 ${ownedIngredients.length} 项` : ''}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted transition-transform ${showOwnedPanel ? 'rotate-180' : ''}`} />
        </button>
        {showOwnedPanel && (
          <div className="p-3 pt-0 border-t border-border">
            <div className="relative mt-3">
              <input type="text" placeholder="搜索食材名..." value={ingSearch}
                onChange={e => setIngSearch(e.target.value)}
                className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background" />
              {ingSearch.length > 0 && (() => {
                const allIng = getAllIngredients();
                const results = allIng.filter(i =>
                  !ownedIngredients.includes(i.id) &&
                  (i.nameZh.includes(ingSearch) || i.nameEn.toLowerCase().includes(ingSearch.toLowerCase()))
                ).slice(0, 8);
                if (results.length === 0) return null;
                return (
                  <div className="absolute z-10 top-full left-0 right-0 bg-card border border-border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                    {results.map(ing => (
                      <button key={ing.id} onClick={() => { addOwnedIngredient(ing.id); setIngSearch(''); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-background flex justify-between">
                        <span>{ing.nameZh}</span>
                        <span className="text-xs text-muted">{ing.nameEn}</span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
            {ownedIngredients.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {ownedIngredients.map(id => {
                  const ing = getIngredient(id);
                  return ing ? (
                    <span key={id} className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs px-2 py-0.5 rounded-full">
                      {ing.nameZh}
                      <button onClick={() => removeOwnedIngredient(id)}><X className="w-3 h-3" /></button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 日历视图 */}
      {viewMode === 'calendar' && (
        <WeekCalendarView
          weeklyPlan={weeklyPlan}
          activeDays={activeDays}
          profile={profile}
          onDayClick={(day) => { setSelectedDay(day); setViewMode('day'); }}
        />
      )}

      {/* 列表视图 */}
      {viewMode === 'day' && <>

      {/* 星期选择器 */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {activeDays.map(day => (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition ${
              selectedDay === day ? 'bg-primary text-white' : 'bg-card border border-border hover:border-primary/50'
            }`}>
            {DAY_LABELS[day]}
          </button>
        ))}
      </div>

      {/* 当日菜谱 */}
      <div className="space-y-4">
        {MEAL_ORDER.filter(m => profile.mealsPerDay.includes(m)).map(mealType => {
          const slot = daySlots.find(s => s.mealType === mealType);
          if (!slot || (slot.recipes || []).length === 0) {
            return (
              <div key={mealType} className="bg-card border border-dashed border-border rounded-lg p-4">
                <p className="text-sm text-muted">{MEAL_LABELS[mealType]} - 未安排</p>
              </div>
            );
          }

          // 计算这一餐的总热量
          let mealCalories = 0;
          let mealCost = 0;
          for (const mr of (slot.recipes || [])) {
            const r = getRecipe(mr.recipeId);
            if (r) {
              const n = calcRecipeNutrition(r);
              mealCalories += Math.round(n.totalCalories * (slot.servings / r.servings));
              mealCost += calcRecipeCost(r) * (slot.servings / r.servings);
            }
          }

          return (
            <div key={mealType} className="bg-card border border-border rounded-lg p-4">
              {/* 餐次标题 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">{MEAL_LABELS[mealType]}</span>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Flame className="w-3 h-3 text-accent" />{mealCalories} kcal{profile.budgetEnabled !== false && ` · $${mealCost.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* 每道菜 */}
              <div className="space-y-2">
                {(slot.recipes || []).map(mr => {
                  const recipe = getRecipe(mr.recipeId);
                  if (!recipe) return null;
                  const nutr = calcRecipeNutrition(recipe);
                  const perServing = Math.round(nutr.totalCalories / recipe.servings);
                  const isInList = shoppingList?.items.some(i => i.fromRecipes.includes(recipe.nameZh));

                  return (
                    <div key={mr.recipeId} className="bg-background hover:bg-primary/5 border border-transparent hover:border-primary/30 rounded-lg p-3 transition group cursor-pointer"
                      onClick={(e) => {
                        // 整张卡可点跳详情，但避免点子按钮时触发
                        if ((e.target as HTMLElement).closest('button, a')) return;
                        window.location.href = `/recipe/${mr.recipeId}`;
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${ROLE_COLORS[mr.role]}`}>
                              {ROLE_LABELS[mr.role]}
                            </span>
                            <Link href={`/recipe/${mr.recipeId}`} className="font-medium text-sm group-hover:text-primary transition">
                              {recipe.nameZh}
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5 text-muted opacity-50 group-hover:opacity-100 group-hover:text-primary transition" />
                          </div>
                          <p className="text-xs text-muted mt-0.5">{recipe.nameEn}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-accent font-medium">{perServing} kcal</span>
                          <button
                            onClick={() => setSwapTarget({ recipeId: mr.recipeId, mealType, role: mr.role, day: selectedDay })}
                            className="text-muted hover:text-primary transition" title="换一道">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 食材标签 */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recipe.ingredients.slice(0, 5).map(ri => {
                          const ing = getIngredient(ri.ingredientId);
                          return ing ? (
                            <Link key={ri.ingredientId} href={`/ingredient/${ri.ingredientId}`}
                              className="text-[11px] bg-card px-1.5 py-0.5 rounded hover:bg-primary-light transition">
                              {ing.nameZh}
                            </Link>
                          ) : null;
                        })}
                        {recipe.ingredients.length > 5 && (
                          <span className="text-[11px] text-muted">+{recipe.ingredients.length - 5}</span>
                        )}
                      </div>

                      {/* 加入清单 - 已加入时显示可点击移除的标签 */}
                      <div className="flex items-center gap-2 mt-2">
                        {isInList ? (
                          <button
                            onClick={() => removeRecipeFromShoppingList(mr.recipeId)}
                            title="点击从采购清单移除"
                            className="flex items-center gap-1 text-xs pl-2 pr-1.5 py-1 rounded-full bg-primary/10 border border-primary text-primary hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition"
                          >
                            <Check className="w-3 h-3 group-hover/btn:hidden" />
                            <span>已加入清单</span>
                            <span className="ml-0.5 w-3.5 h-3.5 inline-flex items-center justify-center rounded-full bg-current/20 hover:bg-red-200">
                              <X className="w-2.5 h-2.5" />
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => { addRecipeToShoppingList(mr.recipeId, slot.servings); recordAction(mr.recipeId, 'added_to_list'); }}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-border text-muted hover:border-primary hover:text-primary transition"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            加入清单
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 水果推荐 (开启时显示) */}
      {weeklyPlan.fruitPlan && weeklyPlan.fruitPlan.fruits?.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm text-green-800 mb-1">本周水果推荐</h3>
          <p className="text-xs text-green-600 mb-3">共{weeklyPlan.fruitPlan.fruits.length}种，每天任选1-2种 · 优先当季</p>

          {/* 水果列表 + 一键换 */}
          <div className="space-y-1 mb-3">
            {weeklyPlan.fruitPlan.fruits.map(f => (
              <div key={f.fruitId} className="flex items-center justify-between text-sm">
                <span>{f.fruitName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600">{f.caloriesPer100g}kcal/100g</span>
                  <button onClick={() => {
                    const EXCLUDE = new Set(['lemon','avocado']);
                    const allFruits = getAllIngredients().filter(i => i.category === 'fruit' && !EXCLUDE.has(i.id));
                    const currentIds = new Set(weeklyPlan.fruitPlan!.fruits.map(x => x.fruitId));
                    const pool = allFruits.filter(i => !currentIds.has(i.id));
                    if (pool.length === 0) return;
                    const pick = pool[Math.floor(Math.random() * pool.length)];
                    const newFruits = weeklyPlan.fruitPlan!.fruits.map(x =>
                      x.fruitId === f.fruitId ? { fruitId: pick.id, fruitName: pick.nameZh, caloriesPer100g: pick.nutrition.calories } : x
                    );
                    setWeeklyPlan({ ...weeklyPlan, fruitPlan: { ...weeklyPlan.fruitPlan!, fruits: newFruits } });
                  }} className="text-green-600 hover:text-green-800 transition" title="换一种">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 每人每日建议总量 */}
          <div className="border-t border-green-200 pt-2">
            <p className="text-xs text-green-700 font-medium mb-1">每人每日建议量</p>
            <div className="flex flex-wrap gap-x-4 text-xs text-green-600">
              {(weeklyPlan.fruitPlan.memberDaily || []).map(md => (
                <span key={md.memberName}>{md.memberName}: {md.dailyGrams}g（约{md.dailyCalories}kcal）</span>
              ))}
            </div>
          </div>
        </div>
      )}

      </>}

      {/* 周菜谱分享弹窗 */}
      {showWeekShare && weeklyPlan && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowWeekShare(false)}>
          <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[90dvh] sm:max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h3 className="font-semibold">分享规划菜谱</h3>
              <button onClick={() => setShowWeekShare(false)} className="text-muted"><X className="w-5 h-5" /></button>
            </div>
            {/* 滚动内容 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-background rounded-lg p-3 text-xs whitespace-pre-wrap font-mono">
                {generateWeekText(weeklyPlan, profile)}
              </div>
            </div>
            {/* 按钮始终贴底 */}
            <div className="flex gap-3 p-4 border-t border-border flex-shrink-0 bg-card">
              <button onClick={async () => {
                await navigator.clipboard.writeText(generateWeekText(weeklyPlan, profile));
                setWeekShareCopied(true);
                setTimeout(() => setWeekShareCopied(false), 2000);
              }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm hover:border-primary transition">
                {weekShareCopied ? <><CheckCheck className="w-4 h-4 text-primary" /> 已复制</> : <><Copy className="w-4 h-4" /> 复制文本</>}
              </button>
              <button onClick={async () => {
                if (navigator.share) {
                  await navigator.share({ title: '规划菜谱', text: generateWeekText(weeklyPlan, profile) });
                } else {
                  await navigator.clipboard.writeText(generateWeekText(weeklyPlan, profile));
                  setWeekShareCopied(true);
                  setTimeout(() => setWeekShareCopied(false), 2000);
                }
              }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition">
                <Share2 className="w-4 h-4" /> 分享
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 换菜原因弹窗 (需求3) */}
      {swapTarget && (
        <SwapReasonDialog
          recipeName={getRecipe(swapTarget.recipeId)?.nameZh || ''}
          onClose={() => setSwapTarget(null)}
          onPick={(reason) => handleSwapWithReason(swapTarget.recipeId, swapTarget.mealType, swapTarget.role, swapTarget.day, reason)}
        />
      )}
    </div>
  );
}

/** 换菜原因选择弹窗 */
function SwapReasonDialog({ recipeName, onClose, onPick }: {
  recipeName: string;
  onClose: () => void;
  onPick: (reason: import('@/types').SwapReason) => void;
}) {
  const options: Array<{ reason: import('@/types').SwapReason; icon: string; label: string; desc: string }> = [
    { reason: 'just_want_different', icon: '🔄', label: '只是想换一个', desc: '不扣分，随机推荐' },
    { reason: 'dislike_ingredient', icon: '🥕', label: '不喜欢这个食材', desc: '后续减少含此食材的菜' },
    { reason: 'dislike_flavor', icon: '👅', label: '不喜欢这个口味', desc: '后续减少同类口味' },
    { reason: 'inconvenient_ingredient', icon: '🛒', label: '食材不方便获取', desc: '后续减少含此食材' },
    { reason: 'too_complex', icon: '⏱️', label: '烹饪太复杂', desc: '后续推荐简单菜' },
  ];
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-t-2xl sm:rounded-2xl border border-border w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border">
          <p className="text-xs text-muted">换菜原因</p>
          <p className="font-semibold text-sm truncate">{recipeName}</p>
        </div>
        <div className="divide-y divide-border">
          {options.map(o => (
            <button
              key={o.reason}
              onClick={() => onPick(o.reason)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background transition text-left"
            >
              <span className="text-xl">{o.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{o.label}</p>
                <p className="text-xs text-muted">{o.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-3 text-sm text-muted border-t border-border hover:bg-background transition">
          取消
        </button>
      </div>
    </div>
  );
}

/** 周日历视图组件 */
function WeekCalendarView({ weeklyPlan, activeDays, profile, onDayClick }: {
  weeklyPlan: import('@/types').WeeklyPlan;
  activeDays: DayOfWeek[];
  profile: import('@/types').UserProfile;
  onDayClick: (day: DayOfWeek) => void;
}) {
  const dayZh: Record<string, string> = { monday:'周一', tuesday:'周二', wednesday:'周三', thursday:'周四', friday:'周五', saturday:'周六', sunday:'周日' };
  const mealZh: Record<string, string> = { breakfast:'早', lunch:'午', dinner:'晚' };
  const roleColors: Record<string, string> = {
    main_meat: 'bg-red-100 text-red-700', main_veg: 'bg-green-100 text-green-700',
    soup: 'bg-blue-100 text-blue-700', staple: 'bg-yellow-100 text-yellow-700',
    cold: 'bg-cyan-100 text-cyan-700', side: 'bg-gray-100 text-gray-600',
  };

  const today = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()];
  const mealOrder: MealType[] = ['breakfast', 'lunch', 'dinner'];

  return (
    <div className="space-y-2">
      {activeDays.map(day => {
        const slots = weeklyPlan.slots.filter(s => s.day === day);
        const sorted = [...slots].sort((a, b) => mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType));
        const isToday = day === today;

        return (
          <div key={day}
            className={`bg-card border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition ${
              isToday ? 'border-primary border-2' : 'border-border'
            }`}
            onClick={() => onDayClick(day)}>

            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-bold ${isToday ? 'text-primary' : ''}`}>
                {dayZh[day]}
              </span>
              {isToday && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">今天</span>}
            </div>

            {sorted.length === 0 ? (
              <p className="text-xs text-muted">未安排</p>
            ) : (
              <div className="space-y-1.5">
                {sorted.map(slot => (
                  <div key={slot.mealType}>
                    <span className="text-[10px] text-muted">{mealZh[slot.mealType]}</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {(slot.recipes || []).map(mr => {
                        const recipe = getRecipe(mr.recipeId);
                        if (!recipe) return null;
                        return (
                          <span key={mr.recipeId} className={`text-[11px] px-1.5 py-0.5 rounded ${roleColors[mr.role] || 'bg-gray-100'}`}>
                            {recipe.nameZh}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** 生成周菜谱纯文本 */
function generateWeekText(plan: import('@/types').WeeklyPlan, profile: import('@/types').UserProfile): string {
  const dayZh: Record<string, string> = { monday:'周一', tuesday:'周二', wednesday:'周三', thursday:'周四', friday:'周五', saturday:'周六', sunday:'周日' };
  const mealZh: Record<string, string> = { breakfast:'早餐', lunch:'午餐', dinner:'晚餐' };
  const roleZh: Record<string, string> = { main_meat:'荤', main_veg:'素', soup:'汤', staple:'主食', cold:'凉', side:'配' };

  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  let text = `📋 规划菜谱（${profile.familySize}人）\n\n`;

  for (const day of days) {
    const slots = plan.slots.filter(s => s.day === day);
    if (slots.length === 0) continue;
    text += `${dayZh[day]}:\n`;
    const sorted = [...slots].sort((a, b) => ['breakfast','lunch','dinner'].indexOf(a.mealType) - ['breakfast','lunch','dinner'].indexOf(b.mealType));
    for (const slot of sorted) {
      const dishes = (slot.recipes || []).map(mr => {
        const r = getRecipe(mr.recipeId);
        return r ? `[${roleZh[mr.role] || ''}]${r.nameZh}` : '';
      }).filter(Boolean).join(' + ');
      text += `  ${mealZh[slot.mealType]}: ${dishes}\n`;
    }
    text += '\n';
  }

  const planDays = Math.min(7, profile.planDays || 7);
  text += `日均热量: ${Math.round(plan.totalCalories / planDays)}kcal\n`;
  text += `预估花费: $${plan.totalCost.toFixed(2)} NZD\n\n`;
  text += `—— 来自 DailyBuy 智能买菜规划`;

  return text;
}
