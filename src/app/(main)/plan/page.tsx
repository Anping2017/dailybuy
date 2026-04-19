'use client';

import { useAppStore, getPreferenceScore, getFeedbackAdjustment } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RefreshCw, X, Flame, ShoppingCart, Check, Sparkles, Share2, Copy, CheckCheck, CalendarDays, List, ChevronRight, Package, ChevronDown, Save, Archive, Trash2 } from 'lucide-react';
import { getRecipe, calcRecipeNutrition, calcRecipeCost } from '@/lib/nutrition/calculator';
import { getFilteredRecipes, generateWeeklyPlan, generateShoppingList } from '@/lib/recipe-engine/engine';
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
  main_meat: '荤菜', main_veg: '素菜', soup: '汤', staple: '主食', side: '配菜', cold: '凉菜', drink: '饮品',
};
const ROLE_COLORS: Record<DishRole, string> = {
  main_meat: 'bg-red-100 text-red-700', main_veg: 'bg-green-100 text-green-700',
  soup: 'bg-blue-100 text-blue-700', staple: 'bg-yellow-100 text-yellow-700',
  side: 'bg-gray-100 text-gray-600', cold: 'bg-cyan-100 text-cyan-700',
  drink: 'bg-purple-100 text-purple-700',
};

export default function PlanPage() {
  const router = useRouter();
  const { profile, weeklyPlan, shoppingList, setWeeklyPlan, setShoppingList, removeMealSlot, replaceSingleRecipe, ownedIngredients, addOwnedIngredient, removeOwnedIngredient, addRecipeToShoppingList, removeRecipeFromShoppingList, recordAction, recordSwapReason, savedPlans, saveCurrentPlan, loadSavedPlan, deleteSavedPlan } = useAppStore();
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
    const sameRole = pool.filter(r => {
      if (r.id === targetRecipeId) return false;
      if ((meal?.recipes || []).some(m => m.recipeId === r.id)) return false;
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
      .map(r => ({ r, s: getFeedbackAdjustment(r) + getPreferenceScore(r.id) * 0.5 + Math.random() * 3 }))
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
    const plan = generateWeeklyPlan(profile, ownedIngredients || [], getPreferenceScore, getFeedbackAdjustment);

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
  // 食材不缩放: 按原配方做整份, 总热量 = 配方总热量
  // 人均 = 总热量 / familySize (家里几个人分这道菜)
  const familySize = Math.max(1, profile.familySize);
  let dayTotalCal = 0;
  let dayTotalCost = 0;
  for (const slot of daySlots) {
    for (const mr of (slot.recipes || [])) {
      const r = getRecipe(mr.recipeId);
      if (r) {
        const n = calcRecipeNutrition(r);
        dayTotalCal += Math.round(n.totalCalories);
        dayTotalCost += calcRecipeCost(r);
      }
    }
  }
  const dayPerPerson = Math.round(dayTotalCal / familySize);
  // 家庭目标
  const householdTarget = profile.members.reduce((s, m) => s + m.dailyCalorieTarget, 0)
    + (Math.max(0, familySize - profile.members.length))
      * (profile.members.reduce((s, m) => s + m.dailyCalorieTarget, 0) / Math.max(1, profile.members.length));

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
            <button onClick={() => setShowSavedPlans(true)}
              title="我保存的方案"
              className="relative px-2 py-1.5 border border-border rounded-lg text-muted hover:text-primary hover:border-primary transition">
              <Archive className="w-4 h-4" />
              {savedPlans.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full text-[10px] flex items-center justify-center">
                  {savedPlans.length}
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
              // 按家庭每日总目标 × 营养学建议比例估算缺口
              // 早/午/晚 25%/40%/35%; 主食/水果/汤 在总热量中各自的占比(不独立加)
              // 主食 约 30% 日热量, 水果 5%, 汤 3%
              const target = Math.round(householdTarget);
              const items: { label: string; cal: number }[] = [];
              if (!profile.mealsPerDay.includes('breakfast')) items.push({ label: '早餐', cal: Math.round(target * 0.25) });
              if (!profile.mealsPerDay.includes('lunch')) items.push({ label: '午餐', cal: Math.round(target * 0.40) });
              if (!profile.mealsPerDay.includes('dinner')) items.push({ label: '晚餐', cal: Math.round(target * 0.35) });
              // 主食/水果/汤 是每餐的补充, 不重复算(已经扣在每餐目标里)
              const sideItems: string[] = [];
              if ((profile.stapleMode || 'off') === 'off') sideItems.push('主食');
              if (!profile.includeFruit) sideItems.push('水果');
              if (!profile.includeSoup) sideItems.push('汤');

              if (items.length === 0 && sideItems.length === 0) return null;
              const totalMissing = items.reduce((s, i) => s + i.cal, 0);

              return (
                <div className="text-[10px] text-muted mt-1.5 space-y-0.5">
                  {items.length > 0 && (
                    <p>⚠ 未规划餐次(按家庭目标比例): {items.map(i => `${i.label}~${i.cal}kcal`).join('、')}</p>
                  )}
                  {sideItems.length > 0 && (
                    <p>ℹ 未开启: {sideItems.join('、')}(从每餐里自行补充)</p>
                  )}
                  {totalMissing > 0 && (
                    <p className="mt-0.5">含未规划餐家庭日目标总 <span className="text-amber-700 font-medium">{dayTotalCal + totalMissing}</span> / <span className="font-medium">{target}</span> kcal</p>
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

          // 餐次总热量 = 各菜原配方总热量之和 (做整份)
          // 人均 = 总和 / familySize
          let mealCalories = 0;
          let mealCost = 0;
          for (const mr of (slot.recipes || [])) {
            const r = getRecipe(mr.recipeId);
            if (r) {
              const n = calcRecipeNutrition(r);
              mealCalories += Math.round(n.totalCalories);
              mealCost += calcRecipeCost(r);
            }
          }
          const perPersonCal = Math.round(mealCalories / familySize);

          return (
            <div key={mealType} className="bg-card border border-border rounded-lg p-4">
              {/* 餐次标题 - 明确总/人均 */}
              <div className="mb-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">{MEAL_LABELS[mealType]}</span>
                    {(profile.calorieEnabled !== false || profile.budgetEnabled !== false) && (
                      <span className="text-xs text-muted flex items-center gap-1">
                        {profile.calorieEnabled !== false && (
                          <>
                            <Flame className="w-3 h-3 text-accent" />
                            {familySize}人共 {mealCalories} kcal · 人均 {perPersonCal}
                          </>
                        )}
                        {profile.budgetEnabled !== false && (
                          <>{profile.calorieEnabled !== false && ' · '}${mealCost.toFixed(2)}</>
                        )}
                      </span>
                    )}
                  </div>
                </div>
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
                  // 人均 = 总 / familySize (家里几个人分这道菜)
                  const dishTotal = Math.round(nutr.totalCalories);
                  const perPerson = Math.round(dishTotal / familySize);
                  const servingMismatch = recipe.servings !== familySize;
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
                          {profile.calorieEnabled !== false && (
                            <span className="text-xs text-accent font-medium" title={`${familySize} 人分 = 人均 ${perPerson}`}>
                              共 {dishTotal} kcal · 人均 {perPerson}
                            </span>
                          )}
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
              // 直接替换为指定菜
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
          />
        );
      })()}

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
      {showSavedPlans && (
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
                          <p className="font-medium text-sm truncate">{s.name}</p>
                          <p className="text-xs text-muted">
                            {new Date(s.createdAt).toLocaleString('zh-CN')} · {s.weeklyPlan.slots.length} 餐
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

function SwapReasonDialog({ recipe, role, onClose, onPick, onPickSpecific }: {
  recipe: import('@/types').Recipe;
  role: DishRole;
  onClose: () => void;
  onPick: (reason: import('@/types').SwapReason, specifics?: { ingredientIds?: string[]; flavors?: string[] }) => void;
  onPickSpecific: (recipeId: string) => void;
}) {
  const [step, setStep] = useState<'main' | 'ingredients' | 'flavors' | 'inconvenient' | 'library'>('main');
  const [selectedIngs, setSelectedIngs] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
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
              {step === 'ingredients' ? '本次换菜会避开含勾选食材的菜' : '本次换菜避开，且 30 天内降权类似菜'}
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
            <p className="text-[10px] text-muted mt-3 leading-relaxed">
              💡 <span>这是一次性反馈</span>，只影响本次换菜。如果长期不吃这种食材，建议去<Link href="/profile" className="text-primary underline">偏好设置</Link>的「长期排除食材」添加，效果更稳定。
            </p>
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
