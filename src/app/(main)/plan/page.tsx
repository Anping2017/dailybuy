'use client';

import { useAppStore, getPreferenceScore, getFeedbackAdjustment, getRecentCookPenalty } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RefreshCw, X, Flame, ShoppingCart, Check, Sparkles, Share2, Copy, CheckCheck, CalendarDays, List, ChevronRight, Package, ChevronDown, Save, Archive, Trash2 } from 'lucide-react';
import { getRecipe, calcRecipeNutrition, calcRecipeCost } from '@/lib/nutrition/calculator';
import { getFilteredRecipes, generateWeeklyPlan, generateShoppingList, getMealCalorieBudget } from '@/lib/recipe-engine/engine';
import { getIngredient, getAllIngredients, getAllRecipes } from '@/lib/data/recipe-repository';
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
  drink: '饮品', snack: '点心',
};
const ROLE_COLORS: Record<DishRole, string> = {
  main_meat: 'bg-red-100 text-red-700', main_veg: 'bg-green-100 text-green-700',
  soup: 'bg-blue-100 text-blue-700', staple: 'bg-yellow-100 text-yellow-700',
  side: 'bg-gray-100 text-gray-600', cold: 'bg-cyan-100 text-cyan-700',
  drink: 'bg-purple-100 text-purple-700', snack: 'bg-pink-100 text-pink-700',
};

export default function PlanPage() {
  const router = useRouter();
  const { profile, setProfile, weeklyPlan, shoppingList, setWeeklyPlan, setShoppingList, removeMealSlot, replaceSingleRecipe, ownedIngredients, addOwnedIngredient, removeOwnedIngredient, clearOwnedIngredients, addRecipeToShoppingList, removeRecipeFromShoppingList, recordAction, recordSwapReason, savedPlans, saveCurrentPlan, loadSavedPlan, deleteSavedPlan, toggleRecipeCompleted, moveRecipeToDay, togglePurchased, removeRecipeFromSlot, markSavedPlanViewed, markAllSavedPlansViewed, duplicateSavedPlan } = useAppStore();
  const [showClearOwnedConfirm, setShowClearOwnedConfirm] = useState(false);
  const [previewSavedId, setPreviewSavedId] = useState<string | null>(null);
  // 未查看的方案数(用于角标; 查看后清零)
  const unviewedSavedCount = savedPlans.filter(p => !p.viewed).length;
  const [moveTarget, setMoveTarget] = useState<{ recipeId: string; fromDay: DayOfWeek; mealType: MealType } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ recipeId: string; mealType: MealType; day: DayOfWeek; name: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showWeekShare, setShowWeekShare] = useState(false);
  const [weekShareCopied, setWeekShareCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'calendar'>('day');
  const [swapTarget, setSwapTarget] = useState<{ recipeId: string; mealType: MealType; role: DishRole; day: DayOfWeek } | null>(null);
  const [showOwnedPanel, setShowOwnedPanel] = useState(false);
  const [ingSearch, setIngSearch] = useState('');
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const d = new Date().getDay();
    return DAYS[d === 0 ? 6 : d - 1];
  });

  // 带原因的换菜(精细版)
  // 原因分类:
  //   - just_want_different/too_complex: 只影响本次换菜, 不写入长期 userFeedback
  //   - dislike_ingredient/dislike_flavor: 只影响本次换菜, 用 excludeIds/excludeFlavors 参数
  //   - inconvenient_ingredient: 记录到 userFeedback (30天降权)
  const handleSwapWithReason = (
    targetRecipeId: string,
    mealType: MealType,
    role: DishRole,
    day: DayOfWeek,
    reason: import('@/types').SwapReason,
    specifics?: { ingredientIds?: string[]; flavors?: string[] },
  ) => {
    const oldRecipe = getRecipe(targetRecipeId);
    // 只对"不方便获取"做长期记录(30天), 其他原因只本次有效
    if (reason === 'inconvenient_ingredient' && specifics?.ingredientIds?.length && oldRecipe) {
      recordSwapReason(targetRecipeId, 'inconvenient_ingredient', {
        ...oldRecipe,
        // 只记录用户勾选的具体食材(不要所有食材)
        ingredients: oldRecipe.ingredients.filter(ri => specifics.ingredientIds!.includes(ri.ingredientId)),
      });
    }
    // 同角色候选池, 本次换菜的临时 filter
    const pool = getFilteredRecipes(profile, mealType);
    const meal = weeklyPlan?.slots.find(s => s.day === day && s.mealType === mealType);
    const excludeIngIds = new Set<string>();
    if ((reason === 'dislike_ingredient' || reason === 'inconvenient_ingredient') && specifics?.ingredientIds) {
      specifics.ingredientIds.forEach(id => excludeIngIds.add(id));
    }
    const excludeFlavors = new Set<string>();
    if (reason === 'dislike_flavor' && specifics?.flavors) {
      specifics.flavors.forEach(f => excludeFlavors.add(f));
    }
    // 本周已选菜谱 ID 集合(避免一周内重复, 即使是别的餐次)
    const thisWeekIds = new Set<string>();
    for (const slot of (weeklyPlan?.slots || [])) {
      for (const mr of (slot.recipes || [])) {
        if (mr.recipeId !== targetRecipeId) thisWeekIds.add(mr.recipeId);  // 排除目标菜本身(允许换回原菜的角色但 r.id 检查会拒绝原菜)
      }
    }
    const sameRole = pool.filter(r => {
      if (r.id === targetRecipeId) return false;
      if ((meal?.recipes || []).some(m => m.recipeId === r.id)) return false;
      if (thisWeekIds.has(r.id)) return false;  // 本周不重复
      // 本次换菜: 排除含勾选食材的菜
      if (excludeIngIds.size > 0 && r.ingredients.some(ri => excludeIngIds.has(ri.ingredientId))) return false;
      // 本次换菜: 排除含勾选口味的菜
      if (excludeFlavors.size > 0 && (r.flavors || []).some(f => excludeFlavors.has(f))) return false;
      // 烹饪太复杂: 本次只选 easy/medium
      if (reason === 'too_complex' && r.difficulty === 'hard') return false;
      const rRole = r.cookingMethod === 'soup' ? 'soup' : r.cookingMethod === 'staple' ? 'staple' : r.cookingMethod === 'cold_dish' ? 'cold' : (r.ingredients.some(ri => { const ing = getIngredient(ri.ingredientId); return ing && ['meat','seafood'].includes(ing.category); }) ? 'main_meat' : 'main_veg');
      return rRole === role;
    });
    if (sameRole.length === 0) { setSwapTarget(null); return; }
    const scored = sameRole
      .map(r => ({ r, s: getFeedbackAdjustment(r) + (getPreferenceScore(r.id) + getRecentCookPenalty(r.id)) * 0.5 + Math.random() * 3 }))
      .sort((a, b) => b.s - a.s);
    const topN = Math.max(1, Math.ceil(scored.length * 0.3));
    const pick = scored[Math.floor(Math.random() * topN)].r;
    recordAction(targetRecipeId, 'rejected', reason);
    recordAction(pick.id, 'swapped_in');
    replaceSingleRecipe(day, mealType, targetRecipeId, pick.id, role);

    // 如果原菜在采购清单中，自动同步到新菜
    if (oldRecipe && shoppingList?.items.some(i => i.fromRecipes.includes(oldRecipe.nameZh))) {
      removeRecipeFromShoppingList(targetRecipeId);
      const slot = weeklyPlan?.slots.find(s => s.day === day && s.mealType === mealType);
      addRecipeToShoppingList(pick.id, slot?.servings || profile.familySize);
    }

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
    // 偏好打分 = 历史反馈分 + 短期烹饪衰减(越近做过越扣分)
    const prefWithRecency = (id: string) => getPreferenceScore(id) + getRecentCookPenalty(id);
    const plan = generateWeeklyPlan(profile, ownedIngredients || [], prefWithRecency, getFeedbackAdjustment);

    // AI 辅助分析模式: 把本次方案写入队列, 把分析 id 关联到 plan
    if (profile.recommendMode === 'ai_assist') {
      import('@/lib/supabase/pending').then(({ savePendingAnalysis }) => {
        savePendingAnalysis(profile, plan).then(id => {
          if (id) setWeeklyPlan({ ...plan, aiAnalysisId: id });
        }).catch(() => { /* 静默失败 */ });
      });
    }

    setWeeklyPlan(plan);
    if (profile.autoAddToShoppingList) {
      setShoppingList(generateShoppingList(plan, ownedIngredients || []));
    } else {
      setShoppingList({ id: `list_${Date.now()}`, weeklyPlanId: plan.id, items: [], totalEstimatedCost: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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

  // 今日合计 (家庭总 + 人均) - 跨所有餐次
  // 核心原则: 烹制量 = slot.servings 份; 每道菜热量 = recipe.totalCalories × (slot.servings / recipe.servings)
  // 带饭模式晚餐: engine 已选 servings≈2×familySize 的菜, slot.servings=2×familySize
  //    → 缩放因子 = 1 (不再额外 ×2, 避免双倍叠加)
  // 非带饭: slot.servings = familySize, 若 recipe.servings ≠ familySize, 按比例缩放
  const familySize = Math.max(1, profile.familySize);
  const calcDishCal = (recipeTotalCal: number, recipeServings: number, slotServings: number) => {
    const rs = Math.max(1, recipeServings || 1);
    const ss = Math.max(1, slotServings || familySize);
    return Math.round(recipeTotalCal * (ss / rs));
  };
  let dayTotalCal = 0;
  let dayTotalCost = 0;
  for (const slot of daySlots) {
    for (const mr of (slot.recipes || [])) {
      const r = getRecipe(mr.recipeId);
      if (r) {
        const n = calcRecipeNutrition(r);
        const cal = calcDishCal(n.totalCalories, r.servings, slot.servings);
        dayTotalCal += cal;
        dayTotalCost += calcRecipeCost(r) * (slot.servings / Math.max(1, r.servings || 1));
      }
    }
  }
  const dayPerPerson = Math.round(dayTotalCal / familySize);
  // 家庭目标
  // 家庭目标: 只含启用成员 + 额外占位人按启用成员均值(禁用的成员不计入任何计算)
  // 每个启用成员按 skipMeals 扣除相应比例(不吃早餐扣 25%, 午餐 40%, 晚餐 35%)
  const activeMembers = profile.members.filter(m => m.enabled !== false);
  const enrolledMembers = activeMembers.length > 0 ? activeMembers : profile.members;
  const mealRatios = { breakfast: 0.25, lunch: 0.40, dinner: 0.35 };
  const memberEffectiveTarget = (m: typeof enrolledMembers[number]) => {
    const skipRatio = (m.skipMeals || []).reduce((s, meal) => s + (mealRatios[meal] || 0), 0);
    return m.dailyCalorieTarget * (1 - skipRatio);
  };
  const activeTargetSum = enrolledMembers.reduce((s, m) => s + memberEffectiveTarget(m), 0);
  const avgEffective = enrolledMembers.length > 0 ? activeTargetSum / enrolledMembers.length : 2000;
  const householdTarget = activeTargetSum
    + Math.max(0, familySize - enrolledMembers.length) * avgEffective;

  return (
    <div className="space-y-4">
      {profile.recommendMode === 'ai_assist' && weeklyPlan.aiAnalysisId && (
        <AiReportBanner analysisId={weeklyPlan.aiAnalysisId} />
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
            <button onClick={() => setShowSaveDialog(true)}
              title="保存当前方案"
              className="px-2 py-1.5 border border-border rounded-lg text-muted hover:text-primary hover:border-primary transition">
              <Save className="w-4 h-4" />
            </button>
            <button onClick={() => { setShowSavedPlans(true); }}
              title={unviewedSavedCount > 0 ? `我保存的方案 (${unviewedSavedCount} 未查看)` : '我保存的方案'}
              className="relative px-2 py-1.5 border border-border rounded-lg text-muted hover:text-primary hover:border-primary transition">
              <Archive className="w-4 h-4" />
              {/* #6b: 只有未查看的方案有角标; 查看后自动隐藏 */}
              {unviewedSavedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full text-[10px] flex items-center justify-center animate-pulse">
                  {unviewedSavedCount}
                </span>
              )}
            </button>
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
              <>
                <div className="flex items-center justify-between mt-2 mb-1">
                  <span className="text-xs text-muted">已设 {ownedIngredients.length} 项</span>
                  <button
                    onClick={() => setShowClearOwnedConfirm(true)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" /> 一键清除
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
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
              </>
            )}
          </div>
        )}
      </div>

      {/* 清除已有食材确认弹窗 */}
      {showClearOwnedConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowClearOwnedConfirm(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" /> 清除已有食材?
            </h3>
            <p className="text-sm text-muted mb-4">
              将移除全部 <span className="font-medium">{ownedIngredients.length}</span> 项"家里已有的食材"。
              <br /><span className="text-xs text-amber-600 mt-1 inline-block">💡 此操作不可撤销, 但不影响采购清单。</span>
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearOwnedConfirm(false)} className="flex-1 py-2.5 border border-border rounded-lg text-sm">取消</button>
              <button
                onClick={() => { clearOwnedIngredients(); setShowClearOwnedConfirm(false); }}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}

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
        {/* 今日合计卡 - 显示在所有餐次最上方 */}
        {daySlots.length > 0 && profile.calorieEnabled !== false && (
          <div className="bg-accent/5 border border-accent/30 rounded-lg p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold">今日合计</span>
              </div>
              <div className="text-xs">
                <span className="font-medium text-accent">{dayTotalCal}</span>
                <span className="text-muted"> kcal · 人均 </span>
                <span className="font-medium text-accent">{dayPerPerson}</span>
                <span className="text-muted"> kcal</span>
                {profile.budgetEnabled !== false && (
                  <>
                    <span className="text-muted"> · </span>
                    <span className="font-medium text-primary">${dayTotalCost.toFixed(2)}</span>
                  </>
                )}
              </div>
            </div>
            {(() => {
              // 数据源: weeklyPlan.memberAdvice (与 Dashboard 完全一致, 由营养学 engine 统一计算)
              // 避免两处计算不同导致数据不一致
              const memberAdvice = weeklyPlan.memberAdvice || [];
              const target = Math.round(householdTarget);

              // 1) 未规划餐次缺口: 汇总所有成员的 skippedMeals
              // 带饭模式: 午餐由晚餐剩菜补, 不算缺口
              const skippedByMeal: Record<string, { label: string; cal: number }> = {};
              for (const adv of memberAdvice) {
                const list = profile.lunchboxMode
                  ? (adv.skippedMeals || []).filter(m => m.mealType !== 'lunch')
                  : (adv.skippedMeals || []);
                for (const sm of list) {
                  if (!skippedByMeal[sm.mealType]) skippedByMeal[sm.mealType] = { label: sm.label, cal: 0 };
                  skippedByMeal[sm.mealType].cal += sm.suggestedCalories;
                }
              }
              const mealItems = Object.values(skippedByMeal).map(x => ({ label: x.label, cal: Math.round(x.cal) }));

              // 2) 未开启品类缺口: 汇总所有成员的 stapleCalories/fruitCalories/soupCalories
              //    同 Dashboard: advStaple = adv.stapleCalories; advFruit = adv.fruitCalories; advSoup = adv.soupCalories
              const categoryItems: { label: string; cal: number }[] = [];
              const sumStaple = memberAdvice.reduce((s, a) => s + (a.stapleCalories || 0), 0);
              const sumFruit = memberAdvice.reduce((s, a) => s + (a.fruitCalories || 0), 0);
              const sumSoup = memberAdvice.reduce((s, a) => s + (a.soupCalories || 0), 0);
              if ((profile.stapleMode || 'off') === 'off' && sumStaple > 0) categoryItems.push({ label: '主食', cal: sumStaple });
              if (!profile.includeFruit && sumFruit > 0) categoryItems.push({ label: '水果', cal: sumFruit });
              if (!profile.includeSoup && sumSoup > 0) categoryItems.push({ label: '汤', cal: sumSoup });

              const totalMealGap = mealItems.reduce((s, i) => s + i.cal, 0);
              const totalCatGap = categoryItems.reduce((s, i) => s + i.cal, 0);
              const totalEstimated = dayTotalCal + totalMealGap + totalCatGap;
              const diff = Math.abs(totalEstimated - target);
              const diffPct = target > 0 ? (diff / target * 100) : 0;
              const statusColor = diffPct <= 10 ? 'text-green-700' : diffPct <= 20 ? 'text-amber-700' : 'text-red-600';

              if (mealItems.length === 0 && categoryItems.length === 0 && diffPct <= 10) {
                return (
                  <p className="text-[11px] text-green-700 mt-1.5">
                    ✓ 达标: {dayTotalCal} / 目标 {target} kcal (偏差 {Math.round(diffPct)}%)
                  </p>
                );
              }

              // 每项显示 "家庭~X (人均 Y)" - 与 Dashboard 的 per-member 数据保持可对照
              const perPerson = (v: number) => Math.round(v / familySize);
              return (
                <div className="text-[11px] mt-1.5 space-y-0.5">
                  {mealItems.length > 0 && (
                    <p className="text-muted">⚠ 未规划餐次(自补): {mealItems.map(i => `${i.label}家庭~${i.cal}(人均${perPerson(i.cal)})`).join('、')} kcal</p>
                  )}
                  {categoryItems.length > 0 && (
                    <p className="text-muted">ℹ 未开启品类(自补): {categoryItems.map(i => `${i.label}家庭~${i.cal}(人均${perPerson(i.cal)})`).join('、')} kcal</p>
                  )}
                  <p className={`mt-0.5 font-medium ${statusColor}`}>
                    估算全天 <span className="font-bold">{totalEstimated}</span> / 目标 <span className="font-bold">{target}</span> kcal (偏差 {Math.round(diffPct)}%)
                  </p>
                  {diffPct > 20 && (
                    <p className="text-[10px] text-red-500">
                      💡 偏差较大, 考虑调整: {totalEstimated < target ? '加菜/加量/开主食' : '减菜/减量/关某品类'}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {MEAL_ORDER.filter(m => profile.mealsPerDay.includes(m)).map(mealType => {
          const slot = daySlots.find(s => s.mealType === mealType);
          if (!slot || (slot.recipes || []).length === 0) {
            return (
              <div key={mealType} className="bg-card border border-dashed border-border rounded-lg p-4">
                <p className="text-sm text-muted">{MEAL_LABELS[mealType]} - 未安排</p>
              </div>
            );
          }

          // 餐次总热量: 各菜热量 = recipe.totalCalories × (slot.servings / recipe.servings)
          // 带饭模式: engine 的 budget 已包含晚餐 + 明日午餐的量, 选出的菜品总热量自动 ~2× 正常晚餐
          //   slot.servings = familySize (不再 ×2), 不需要额外缩放
          const isLunchboxDinner = !!profile.lunchboxMode && mealType === 'dinner';
          let mealCalories = 0;
          let mealCost = 0;
          for (const mr of (slot.recipes || [])) {
            const r = getRecipe(mr.recipeId);
            if (r) {
              const n = calcRecipeNutrition(r);
              mealCalories += calcDishCal(n.totalCalories, r.servings, slot.servings);
              mealCost += calcRecipeCost(r) * (slot.servings / Math.max(1, r.servings || 1));
            }
          }
          const perPersonCal = Math.round(mealCalories / familySize);
          // 本餐目标直接用 engine 的 getMealCalorieBudget, 确保 UI 与引擎选菜口径一致
          //   带饭模式晚餐: 目标 = 日目标 - 早餐 - 缺口 (engine 已处理)
          //   非带饭: 按比例归一 - 缺口
          const manualMode = profile.customMealComposition?.enabled;
          const mealTargetCal = Math.max(200, getMealCalorieBudget(profile, mealType));
          // 对比实际烹制 vs 目标
          const mealRatio = mealTargetCal > 0 ? mealCalories / mealTargetCal : 1;
          // 推荐倍率: 让 mealCalories × N ≈ mealTargetCal
          let suggestMultiplier = 1;
          if (manualMode && profile.calorieEnabled !== false && mealRatio < 0.7 && mealCalories > 0) {
            suggestMultiplier = Math.max(1.5, Math.round((mealTargetCal / mealCalories) * 2) / 2);
            if (suggestMultiplier > 3) suggestMultiplier = 3;
          }

          return (
            <div key={mealType} className="bg-card border border-border rounded-lg p-4">
              {/* 餐次标题 - 明确总/人均 */}
              <div className="mb-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">{MEAL_LABELS[mealType]}</span>
                    {isLunchboxDinner && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300">
                        🍱 带饭
                      </span>
                    )}
                    {(profile.calorieEnabled !== false || profile.budgetEnabled !== false) && (
                      <span className="text-xs text-muted flex items-center gap-1">
                        {profile.calorieEnabled !== false && (
                          <>
                            <Flame className="w-3 h-3 text-accent" />
                            {familySize}人共 {mealCalories} / 目标 {mealTargetCal} kcal · 人均 {perPersonCal}
                          </>
                        )}
                        {profile.budgetEnabled !== false && (
                          <>{profile.calorieEnabled !== false && ' · '}${mealCost.toFixed(2)}</>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                {isLunchboxDinner && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    💡 带饭模式: 晚餐目标已自动包含次日午餐(=日目标-早餐-未开启品类自补), 多做的部分装饭盒作明日午餐。
                  </p>
                )}
                {suggestMultiplier > 1 && !isLunchboxDinner && (
                  <p className="text-[11px] text-blue-700 mt-1">
                    💡 热量偏低: 建议本餐所有菜谱按 ×{suggestMultiplier} 的量烹制(调料按比例适度增加), 即可达到本餐目标 ~{mealTargetCal} kcal。
                  </p>
                )}
                {slot.reducedDishes && slot.reducedDishes > 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    ⚖️ 为控制热量, 自动减了 {slot.reducedDishes} 道菜
                  </p>
                )}
              </div>

              {/* 每道菜 */}
              <div className="space-y-2">
                {(slot.recipes || []).map(mr => {
                  const recipe = getRecipe(mr.recipeId);
                  if (!recipe) return null;
                  const nutr = calcRecipeNutrition(recipe);
                  // 食材不缩放: 这道菜做出来就是配方总热量
                  // 带饭模式晚餐: 本菜按 slotMult(=2)倍计; 显示 ×2 标识
                  // 单菜显示热量 = recipe.totalCalories × (slot.servings / recipe.servings)
                  const dishTotal = calcDishCal(nutr.totalCalories, recipe.servings, slot.servings);
                  const perPerson = Math.round(dishTotal / familySize);
                  // servings 不匹配提示 (带饭模式保留该提示, 因菜谱可能正好匹配 familySize)
                  const servingMismatch = recipe.servings !== familySize
                    && Math.abs(recipe.servings - familySize) > 1;
                  const isInList = shoppingList?.items.some(i => i.fromRecipes.includes(recipe.nameZh));

                  return (
                    <div key={mr.recipeId} className="bg-background hover:bg-primary/5 border border-transparent hover:border-primary/30 rounded-lg p-3 transition group cursor-pointer"
                      onClick={(e) => {
                        // 整张卡可点跳详情，但避免点子按钮时触发
                        if ((e.target as HTMLElement).closest('button, a')) return;
                        window.location.href = `/recipe/${mr.recipeId}`;
                      }}
                    >
                      {/* 顶部: 标签(一行) + 右侧操作按钮 */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${ROLE_COLORS[mr.role]}`}>
                            {ROLE_LABELS[mr.role]}
                          </span>
                          {mr.completed && (
                            <span className="text-[10px] px-1 py-0 rounded bg-green-100 text-green-700 border border-green-300">已完成</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {profile.calorieEnabled !== false && (
                            <span className={`text-xs font-medium ${mr.completed ? 'text-muted line-through' : 'text-accent'}`} title={`${familySize} 人分 = 人均 ${perPerson}${isLunchboxDinner ? ' (含明日午餐)' : ''}`}>
                              共 {dishTotal} · 人均 {perPerson}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              const nowCompleted = !mr.completed;
                              toggleRecipeCompleted(selectedDay, mealType, mr.recipeId);
                              if (nowCompleted) {
                                for (const ri of recipe.ingredients) {
                                  const item = shoppingList?.items.find(it => it.ingredientId === ri.ingredientId && it.fromRecipes.includes(recipe.nameZh));
                                  if (item && !item.isPurchased) togglePurchased(ri.ingredientId);
                                }
                              }
                            }}
                            className={`transition ${mr.completed ? 'text-green-600' : 'text-muted hover:text-green-600'}`}
                            title={mr.completed ? '已完成 (点击撤销)' : '标记已完成'}>
                            <CheckCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setMoveTarget({ recipeId: mr.recipeId, fromDay: selectedDay, mealType })}
                            className="text-muted hover:text-primary transition" title="换到另一天做">
                            <CalendarDays className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSwapTarget({ recipeId: mr.recipeId, mealType, role: mr.role, day: selectedDay })}
                            className="text-muted hover:text-primary transition" title="换一道">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ recipeId: mr.recipeId, mealType, day: selectedDay, name: recipe.nameZh })}
                            className="text-muted hover:text-red-500 transition" title="从今日餐次中删除">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 菜名: 独占一行 */}
                      <div className="mt-1.5">
                        <Link href={`/recipe/${mr.recipeId}`} className={`font-medium text-[15px] group-hover:text-primary transition inline-flex items-center gap-1 ${mr.completed ? 'line-through text-muted' : ''}`}>
                          {recipe.nameZh}
                          <ChevronRight className="w-3.5 h-3.5 text-muted opacity-50 group-hover:opacity-100 group-hover:text-primary transition" />
                        </Link>
                        <p className="text-xs text-muted mt-0.5">{recipe.nameEn}</p>
                      </div>

                      {/* 食材标签 - 完整罗列 + 自动换行 */}
                      <div className={`flex flex-wrap gap-1 mt-2 ${mr.completed ? 'opacity-50' : ''}`}>
                        {recipe.ingredients.map(ri => {
                          const ing = getIngredient(ri.ingredientId);
                          return ing ? (
                            <Link key={ri.ingredientId} href={`/ingredient/${ri.ingredientId}`}
                              className={`text-[11px] bg-card px-1.5 py-0.5 rounded hover:bg-primary-light transition whitespace-nowrap ${mr.completed ? 'line-through text-muted' : ''}`}>
                              {ing.nameZh}
                            </Link>
                          ) : null;
                        })}
                      </div>

                      {/* 份数不匹配提示 */}
                      {servingMismatch && (
                        <p className="text-[10px] text-amber-600 mt-1">
                          📌 菜按 {recipe.servings} 人份做，家里 {familySize} 人分
                        </p>
                      )}

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

      {/* 换菜原因弹窗 */}
      {swapTarget && (() => {
        const targetRecipe = getRecipe(swapTarget.recipeId);
        if (!targetRecipe) return null;
        return (
          <SwapReasonDialog
            recipe={targetRecipe}
            role={swapTarget.role}
            onClose={() => setSwapTarget(null)}
            onPick={(reason, specifics) => handleSwapWithReason(swapTarget.recipeId, swapTarget.mealType, swapTarget.role, swapTarget.day, reason, specifics)}
            onPickSpecific={(newRecipeId) => {
              recordAction(swapTarget.recipeId, 'rejected', 'just_want_different');
              recordAction(newRecipeId, 'swapped_in');
              replaceSingleRecipe(swapTarget.day, swapTarget.mealType, swapTarget.recipeId, newRecipeId, swapTarget.role);
              if (targetRecipe && shoppingList?.items.some(i => i.fromRecipes.includes(targetRecipe.nameZh))) {
                removeRecipeFromShoppingList(swapTarget.recipeId);
                const slot = weeklyPlan?.slots.find(s => s.day === swapTarget.day && s.mealType === swapTarget.mealType);
                addRecipeToShoppingList(newRecipeId, slot?.servings || profile.familySize);
              }
              setSwapTarget(null);
            }}
            onAddPermanentExclude={(ingredientIds) => {
              // 加入 profile.excludeIngredients (去重)
              const current = new Set(profile.excludeIngredients || []);
              ingredientIds.forEach(id => current.add(id));
              setProfile({ excludeIngredients: Array.from(current) });
            }}
          />
        );
      })()}

      {/* 换日弹窗: 选择菜谱要移动到的目标日 */}
      {moveTarget && (() => {
        const targetRecipe = getRecipe(moveTarget.recipeId);
        if (!targetRecipe) return null;
        const planDays = weeklyPlan?.slots.map(s => s.day) || [];
        const uniqueDays = Array.from(new Set(planDays));
        // 按周序排列
        const orderedDays = DAYS.filter(d => uniqueDays.includes(d));
        return (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setMoveTarget(null)}>
            <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold mb-1">换到哪一天做</h3>
              <p className="text-xs text-muted mb-3">把「{targetRecipe.nameZh}」({MEAL_LABELS[moveTarget.mealType]})移到另一天的同餐次</p>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {orderedDays.filter(d => d !== moveTarget.fromDay).map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      moveRecipeToDay(moveTarget.fromDay, moveTarget.mealType, moveTarget.recipeId, d);
                      // 自动跳到目标日查看
                      setSelectedDay(d);
                      setMoveTarget(null);
                    }}
                    className="w-full text-left px-3 py-2.5 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition"
                  >
                    <div className="text-sm font-medium">{DAY_LABELS[d]}</div>
                    <div className="text-[11px] text-muted mt-0.5">
                      {(weeklyPlan?.slots.find(s => s.day === d && s.mealType === moveTarget.mealType)?.recipes.length || 0)} 道菜 (移动后会加到这里)
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setMoveTarget(null)} className="w-full mt-3 py-2.5 border border-border rounded-lg text-sm">取消</button>
            </div>
          </div>
        );
      })()}

      {/* 删除菜谱确认弹窗 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" /> 确定删除?
            </h3>
            <p className="text-sm text-muted mb-4">
              将从 <span className="font-medium">{DAY_LABELS[deleteTarget.day]} · {MEAL_LABELS[deleteTarget.mealType]}</span> 移除「{deleteTarget.name}」。
              <br /><span className="text-xs text-amber-600 mt-1 inline-block">💡 对应食材不会自动从采购清单移除, 请手动处理。</span>
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-border rounded-lg text-sm">取消</button>
              <button
                onClick={() => {
                  removeRecipeFromSlot(deleteTarget.day, deleteTarget.mealType, deleteTarget.recipeId);
                  setDeleteTarget(null);
                }}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 保存方案弹窗 */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowSaveDialog(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">保存当前方案</h3>
            <p className="text-xs text-muted mb-3">保存后可随时调用这份规划</p>
            <input
              type="text"
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="方案名称(如: 工作日家常 / 周末聚餐)"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => setShowSaveDialog(false)} className="flex-1 py-2.5 border border-border rounded-lg text-sm">
                取消
              </button>
              <button
                onClick={() => {
                  saveCurrentPlan(saveName || `方案 ${new Date().toLocaleDateString('zh-CN')}`);
                  setSaveName('');
                  setShowSaveDialog(false);
                }}
                className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 保存的方案列表弹窗 */}
      {showSavedPlans && (() => {
        // 打开弹窗时自动标记所有为已查看(角标消失)
        if (unviewedSavedCount > 0) setTimeout(() => markAllSavedPlansViewed(), 500);
        return (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowSavedPlans(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-md flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">我的方案 ({savedPlans.length})</h3>
              <button onClick={() => setShowSavedPlans(false)} className="text-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {savedPlans.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted">还没有保存的方案</p>
              ) : (
                <div className="divide-y divide-border">
                  {savedPlans.map(s => (
                    <div key={s.id} className="p-3 hover:bg-background/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* 点名字展开预览(文字版) */}
                          <button onClick={() => { markSavedPlanViewed(s.id); setPreviewSavedId(previewSavedId === s.id ? null : s.id); }}
                            className="text-left font-medium text-sm hover:text-primary transition flex items-center gap-1">
                            {s.name}
                            {!s.viewed && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" title="未查看" />}
                            <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${previewSavedId === s.id ? 'rotate-180' : ''}`} />
                          </button>
                          <p className="text-xs text-muted">
                            {new Date(s.createdAt).toLocaleString('zh-CN')} · {s.weeklyPlan.slots.length} 餐
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => { duplicateSavedPlan(s.id); }}
                            className="text-muted hover:text-primary p-1"
                            title="复制方案"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`加载「${s.name}」会替换当前方案, 继续?`)) {
                                loadSavedPlan(s.id);
                                setShowSavedPlans(false);
                              }
                            }}
                            className="text-xs bg-primary text-white px-2 py-1 rounded"
                          >
                            加载
                          </button>
                          <button
                            onClick={() => { if (confirm(`删除方案「${s.name}」?`)) deleteSavedPlan(s.id); }}
                            className="text-muted hover:text-danger p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {/* 文字版预览 */}
                      {previewSavedId === s.id && (
                        <div className="mt-2 bg-background rounded p-2 text-[11px] space-y-1 max-h-60 overflow-y-auto">
                          {s.weeklyPlan.slots.map((slot, idx) => (
                            <div key={idx}>
                              <span className="font-medium text-primary">{DAY_LABELS[slot.day] || slot.day} · {MEAL_LABELS[slot.mealType]}</span>
                              <span className="text-muted">({slot.servings}人份)</span>:
                              <span className="ml-1">
                                {slot.recipes.map(mr => {
                                  const r = getRecipe(mr.recipeId);
                                  return r?.nameZh || '?';
                                }).join('、')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

/** 换菜原因选择弹窗 */
/** AI 分析报告横幅 (需求1: AI 辅助分析) */
function AiReportBanner({ analysisId }: { analysisId: string }) {
  const [status, setStatus] = useState<'pending' | 'analyzing' | 'analyzed' | 'applied' | 'skipped' | null>(null);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { getPendingAnalysis } = await import('@/lib/supabase/pending');
      const a = await getPendingAnalysis(analysisId);
      if (!cancelled && a) setStatus(a.status);
    };
    load();
    // 每 30 秒刷一次状态(轻量轮询)
    const tid = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(tid); };
  }, [analysisId]);

  if (!status) return null;

  const ready = status === 'analyzed' || status === 'applied';

  return (
    <Link
      href={`/plan/report/${analysisId}`}
      className={`block rounded-lg p-3 text-xs transition ${
        ready
          ? 'bg-purple-50 border border-purple-200 hover:bg-purple-100'
          : 'bg-primary/5 border border-primary/20'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-base ${ready ? '' : 'animate-pulse'}`}>{ready ? '📊' : '🤖'}</span>
          <div className="min-w-0">
            <p className={`font-medium ${ready ? 'text-purple-700' : 'text-primary'}`}>
              {ready ? 'AI 分析报告已就绪' : 'AI 分析中...'}
            </p>
            <p className="text-muted truncate">
              {ready ? '点击查看健康/营养/搭配的完整建议' : '已提交分析，稍后回来查看完整报告'}
            </p>
          </div>
        </div>
        {ready && <ChevronRight className="w-4 h-4 text-purple-700 flex-shrink-0" />}
      </div>
    </Link>
  );
}

const FLAVOR_ZH: Record<string, string> = {
  sour: '酸', sweet: '甜', bitter: '苦', spicy: '辣',
  salty: '咸', umami: '鲜', light: '清淡',
};

function SwapReasonDialog({ recipe, role, onClose, onPick, onPickSpecific, onAddPermanentExclude }: {
  recipe: import('@/types').Recipe;
  role: DishRole;
  onClose: () => void;
  onPick: (reason: import('@/types').SwapReason, specifics?: { ingredientIds?: string[]; flavors?: string[] }) => void;
  onPickSpecific: (recipeId: string) => void;
  onAddPermanentExclude: (ingredientIds: string[]) => void;  // 把食材加入 profile.excludeIngredients
}) {
  const [step, setStep] = useState<'main' | 'ingredients' | 'flavors' | 'inconvenient' | 'library'>('main');
  const [selectedIngs, setSelectedIngs] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [inconvenientPersist, setInconvenientPersist] = useState<'short' | 'long'>('short');  // 不方便: 短期(30天)/长期(永久排除)
  const [librarySearch, setLibrarySearch] = useState('');
  const [sameRoleOnly, setSameRoleOnly] = useState(true);

  const options: Array<{ reason: import('@/types').SwapReason; icon: string; label: string; desc: string; next?: 'ingredients' | 'flavors' | 'inconvenient' }> = [
    { reason: 'just_want_different', icon: '🔄', label: '只是想换一个', desc: '本次推荐换一道，不影响后续' },
    { reason: 'dislike_ingredient', icon: '🥕', label: '不喜欢某个食材', desc: '本次排除该食材菜', next: 'ingredients' },
    { reason: 'dislike_flavor', icon: '👅', label: '不喜欢这个口味', desc: '本次少推同类口味', next: 'flavors' },
    { reason: 'inconvenient_ingredient', icon: '🛒', label: '食材不方便获取', desc: '本次排除 + 30天降权', next: 'inconvenient' },
    { reason: 'too_complex', icon: '⏱️', label: '烹饪太复杂', desc: '本次换简单的菜' },
  ];

  const ingList = recipe.ingredients.map(ri => {
    const ing = getIngredient(ri.ingredientId);
    return { id: ri.ingredientId, name: ing?.nameZh || ri.ingredientId };
  });

  // 菜谱库搜索结果 (限 50 条)
  const libraryResults = (() => {
    if (step !== 'library') return [];
    const all = [...getAllRecipes()].filter(r => r.id !== recipe.id);
    let filtered = all;
    if (sameRoleOnly) {
      // 按相同 role 过滤 (粗糙判断: meat/seafood 含即 meat, soup cookingMethod = soup, staple 名字判断)
      filtered = filtered.filter(r => {
        if (role === 'soup') return r.cookingMethod === 'soup' || /汤|羹/.test(r.nameZh);
        if (role === 'staple') return r.cookingMethod === 'staple';
        if (role === 'main_meat' || role === 'main_veg') {
          const isMeat = r.ingredients.some(ri => {
            const ing = getIngredient(ri.ingredientId);
            return ing && (ing.category === 'meat' || ing.category === 'seafood');
          });
          return role === 'main_meat' ? isMeat : !isMeat;
        }
        return true;
      });
    }
    if (librarySearch.trim()) {
      const q = librarySearch.toLowerCase();
      filtered = filtered.filter(r => r.nameZh.toLowerCase().includes(q) || r.nameEn.toLowerCase().includes(q));
    }
    return filtered.slice(0, 50);
  })();

  const handlePickMain = (opt: typeof options[number]) => {
    // 无二级选择的直接执行
    if (!opt.next) {
      onPick(opt.reason);
      return;
    }
    setStep(opt.next);
  };

  const handleConfirmSpecifics = () => {
    if (step === 'ingredients') {
      if (selectedIngs.length === 0) return;
      onPick('dislike_ingredient', { ingredientIds: selectedIngs });
    } else if (step === 'flavors') {
      if (selectedFlavors.length === 0) return;
      onPick('dislike_flavor', { flavors: selectedFlavors });
    } else if (step === 'inconvenient') {
      if (selectedIngs.length === 0) return;
      if (inconvenientPersist === 'long') {
        // 长期: 加入 profile.excludeIngredients(永久排除)
        onAddPermanentExclude(selectedIngs);
      }
      // 同时执行本次换菜(短期/长期都要换菜); 长期时不再写30天feedback(已永久排除)
      onPick('inconvenient_ingredient', { ingredientIds: selectedIngs });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-t-2xl sm:rounded-2xl border border-border w-full max-w-sm overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="min-w-0">
            {step !== 'main' && (
              <button onClick={() => { setStep('main'); setSelectedIngs([]); setSelectedFlavors([]); }} className="text-xs text-primary mb-1">← 返回</button>
            )}
            <p className="text-xs text-muted">换菜原因</p>
            <p className="font-semibold text-sm truncate">{recipe.nameZh}</p>
          </div>
          <button onClick={onClose} className="text-muted text-xl leading-none">×</button>
        </div>

        {step === 'main' && (
          <div className="flex-1 overflow-y-auto">
            {/* 顶部: 直接从菜谱库选 */}
            <button
              onClick={() => setStep('library')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-primary/5 hover:bg-primary/10 transition text-left border-b border-border"
            >
              <span className="text-xl">📚</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">从菜谱库选一道</p>
                <p className="text-xs text-muted">浏览 1300+ 菜谱指定换成谁</p>
              </div>
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>
            <div className="divide-y divide-border">
              <p className="px-4 pt-3 pb-1 text-[11px] text-muted">— 或告诉我们原因，系统智能推荐 —</p>
              {options.map(o => (
                <button
                  key={o.reason}
                  onClick={() => handlePickMain(o)}
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
          </div>
        )}

        {step === 'library' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-border space-y-2">
              <input
                type="text"
                value={librarySearch}
                onChange={e => setLibrarySearch(e.target.value)}
                placeholder="搜索菜名..."
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                autoFocus
              />
              <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameRoleOnly}
                  onChange={e => setSameRoleOnly(e.target.checked)}
                  className="accent-primary"
                />
                只显示同角色菜 ({ROLE_LABELS[role]})
              </label>
            </div>
            <div className="flex-1 overflow-y-auto">
              {libraryResults.length === 0 ? (
                <p className="text-center text-sm text-muted py-8">没有匹配的菜谱</p>
              ) : (
                <div className="divide-y divide-border">
                  {libraryResults.map(r => (
                    <button
                      key={r.id}
                      onClick={() => onPickSpecific(r.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-background/50 transition"
                    >
                      <p className="text-sm font-medium">{r.nameZh}</p>
                      <p className="text-xs text-muted">{r.nameEn} · {r.cookingMethod}</p>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-center text-xs text-muted py-2">共 {libraryResults.length} 道{libraryResults.length === 50 && '(限前 50)'}</p>
            </div>
          </div>
        )}

        {(step === 'ingredients' || step === 'inconvenient') && (
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm font-medium mb-1">选择哪个食材？</p>
            <p className="text-xs text-muted mb-3">
              {step === 'ingredients' ? '本次换菜会避开含勾选食材的菜' : '本次换菜避开'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ingList.map(ing => {
                const active = selectedIngs.includes(ing.id);
                return (
                  <button
                    key={ing.id}
                    onClick={() => setSelectedIngs(active ? selectedIngs.filter(x => x !== ing.id) : [...selectedIngs, ing.id])}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${active ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    {ing.name}
                  </button>
                );
              })}
            </div>

            {/* 不方便获取: 长期/短期 选择 */}
            {step === 'inconvenient' && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs font-medium mb-2">这次不方便, 还是长期都不方便?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setInconvenientPersist('short')}
                    className={`flex-1 p-2 rounded border text-xs text-left transition ${inconvenientPersist === 'short' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <p className="font-medium">⏱ 短期(本次)</p>
                    <p className="text-muted">只本次换菜, 不影响后续</p>
                  </button>
                  <button
                    onClick={() => setInconvenientPersist('long')}
                    className={`flex-1 p-2 rounded border text-xs text-left transition ${inconvenientPersist === 'long' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <p className="font-medium">🚫 长期(永久排除)</p>
                    <p className="text-muted">加入设置→长期排除食材</p>
                  </button>
                </div>
              </div>
            )}

            {step === 'ingredients' && (
              <p className="text-[10px] text-muted mt-3 leading-relaxed">
                💡 这是一次性反馈, 只影响本次换菜。如果长期不吃这种食材, 建议去<Link href="/profile" className="text-primary underline">偏好设置</Link>的「长期排除食材」添加, 效果更稳定。
              </p>
            )}
          </div>
        )}

        {step === 'flavors' && (
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm font-medium mb-1">不喜欢哪个口味？</p>
            <p className="text-xs text-muted mb-3">本次换菜会避开这些口味的菜</p>
            <div className="flex flex-wrap gap-1.5">
              {(recipe.flavors || []).map(f => {
                const active = selectedFlavors.includes(f);
                return (
                  <button
                    key={f}
                    onClick={() => setSelectedFlavors(active ? selectedFlavors.filter(x => x !== f) : [...selectedFlavors, f])}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${active ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    {FLAVOR_ZH[f] || f}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted mt-3 leading-relaxed">
              💡 这是一次性反馈。如果某口味长期不吃，建议在<Link href="/profile" className="text-primary underline">偏好设置</Link>的「口味偏好」调整。
            </p>
          </div>
        )}

        {step !== 'main' && (
          <div className="border-t border-border p-3 bg-card">
            <button
              onClick={handleConfirmSpecifics}
              disabled={
                ((step === 'ingredients' || step === 'inconvenient') && selectedIngs.length === 0) ||
                (step === 'flavors' && selectedFlavors.length === 0)
              }
              className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-40 transition"
            >
              确认换菜
            </button>
          </div>
        )}
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
