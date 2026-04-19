'use client';

import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShoppingCart, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { getRecipe, calcRecipeNutrition } from '@/lib/nutrition/calculator';
import { ConfigSummary } from '@/components/ui/config-summary';

const MEAL_LABELS: Record<string, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };
const ROLE_LABELS: Record<string, string> = { main_meat: '荤', main_veg: '素', soup: '汤', staple: '主食', side: '配', cold: '凉' };

export default function DashboardPage() {
  const router = useRouter();
  const { profile, weeklyPlan, shoppingList, onboardingComplete } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (!onboardingComplete) { router.push('/onboarding'); return null; }

  const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
  const todaySlots = weeklyPlan?.slots.filter(s => s.day === today) || [];
  const sortedSlots = [...todaySlots].sort((a, b) => {
    const order = ['breakfast', 'lunch', 'dinner'];
    return order.indexOf(a.mealType) - order.indexOf(b.mealType);
  });

  const purchasedCount = shoppingList?.items.filter(i => i.isPurchased).length || 0;
  const totalItems = shoppingList?.items.filter(i => !i.isOwned).length || 0;

  return (
    <div className="space-y-5">
      {/* 头部 */}
      <div>
        <h1 className="text-xl font-bold">DailyBuy</h1>
        <ConfigSummary />
      </div>

      {/* 主入口: 两个大卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => router.push('/plan')}
          className="bg-primary text-white rounded-xl p-5 text-left hover:bg-primary/90 transition">
          <UtensilsCrossed className="w-7 h-7 mb-2" />
          <p className="font-bold text-base">{weeklyPlan ? '规划菜谱' : '开始规划'}</p>
          <p className="text-xs opacity-80 mt-0.5">{weeklyPlan ? `${weeklyPlan.slots.length}餐已规划` : '生成每周菜谱方案'}</p>
          <ChevronRight className="w-4 h-4 mt-2 opacity-60" />
        </button>
        <button onClick={() => router.push('/shopping')}
          className="bg-card border-2 border-border rounded-xl p-5 text-left hover:border-primary/50 transition">
          <ShoppingCart className="w-7 h-7 text-primary mb-2" />
          <p className="font-bold text-base">采购清单</p>
          <p className="text-xs text-muted mt-0.5">
            {totalItems > 0 ? `${purchasedCount}/${totalItems} 已购买` : '查看需要买什么'}
          </p>
          <ChevronRight className="w-4 h-4 mt-2 text-muted" />
        </button>
      </div>

      {/* 有菜谱时显示今日菜谱 + 热量建议 */}
      {weeklyPlan && (
        <>
          {/* 今日菜谱预览 */}
          {sortedSlots.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">今日菜谱</h2>
                <button onClick={() => router.push('/plan')} className="text-xs text-primary">查看全部 →</button>
              </div>
              <div className="space-y-1.5">
                {sortedSlots.map(slot => (
                  <div key={`${slot.day}-${slot.mealType}`}
                    className="bg-card border border-border rounded-lg p-2.5 cursor-pointer hover:border-primary/50 transition"
                    onClick={() => router.push('/plan')}>
                    <span className="text-xs text-primary font-medium">{MEAL_LABELS[slot.mealType]}</span>
                    <div className="flex flex-wrap gap-x-2 mt-0.5">
                      {(slot.recipes || []).map(mr => {
                        const recipe = getRecipe(mr.recipeId);
                        if (!recipe) return null;
                        return (
                          <span key={mr.recipeId} className="text-sm">
                            <span className="text-[10px] text-muted">[{ROLE_LABELS[mr.role]}]</span>
                            {recipe.nameZh}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 每位成员热量建议 - 以今日数据为基础(需求5) */}
          {profile.calorieEnabled !== false && weeklyPlan.memberAdvice && weeklyPlan.memberAdvice.length > 0 && (() => {
            // 重新计算"今日"菜品总热量(替换 adv.dishCalories 的周平均)
            // 带饭模式晚餐: 按 slot.servings/familySize 倍率算(晚餐 ×2 留午餐)
            const fs = Math.max(1, profile.familySize || 1);
            let todayDishTotal = 0;
            for (const slot of todaySlots) {
              const mult = Math.max(1, (slot.servings || fs) / fs);
              for (const mr of (slot.recipes || [])) {
                const r = getRecipe(mr.recipeId);
                if (r) todayDishTotal += calcRecipeNutrition(r).totalCalories * mult;
              }
            }
            const totalDailyTarget = weeklyPlan.memberAdvice.reduce((s, a) => s + a.dailyTarget, 0) || 1;
            return (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">
                今日热量建议（{['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()]}）
                {profile.lunchboxMode && <span className="text-[11px] text-amber-600 ml-2 font-normal">· 带饭模式: 晚餐×2 留作明日午餐</span>}
              </h2>
              {weeklyPlan.memberAdvice.map(adv => {
                // 今日该成员的菜品热量 = 家庭今日菜品 × 该成员热量目标占比
                const ratio = adv.dailyTarget / totalDailyTarget;
                const todayDishCal = Math.round(todayDishTotal * ratio);
                const advStaple = (profile.stapleMode || 'off') === 'off' ? adv.stapleCalories : 0;
                const advFruit = !profile.includeFruit ? adv.fruitCalories : 0;
                const advSoup = !profile.includeSoup ? 40 : 0;
                // 带饭模式: 午餐由前一晚剩菜补足, 不视为"未规划缺口"
                const skippedList = profile.lunchboxMode
                  ? (adv.skippedMeals || []).filter(m => m.mealType !== 'lunch')
                  : (adv.skippedMeals || []);
                const advSkipped = skippedList.reduce((s, m) => s + m.suggestedCalories, 0);
                const totalWithAdvice = todayDishCal + advStaple + advFruit + advSoup + advSkipped;
                const pctDish = Math.round(todayDishCal / adv.dailyTarget * 100);
                const pctSkipped = Math.round(advSkipped / adv.dailyTarget * 100);
                const pctStaple = Math.round(advStaple / adv.dailyTarget * 100);
                const pctFruit = Math.round(advFruit / adv.dailyTarget * 100);
                const pctSoup = Math.round(advSoup / adv.dailyTarget * 100);
                const finalGap = Math.max(0, adv.dailyTarget - totalWithAdvice);

                return (
                <div key={adv.memberId} className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{adv.memberName}</span>
                    <span className="text-xs text-muted">{adv.gender === 'male' ? '男' : '女'} · 目标 {adv.dailyTarget}kcal</span>
                  </div>
                  <div className="h-2.5 bg-background rounded-full overflow-hidden mb-1 flex">
                    <div className="bg-accent h-full" style={{ width: `${pctDish}%` }} />
                    {pctSkipped > 0 && <div className="bg-purple-300 h-full" style={{ width: `${pctSkipped}%` }} />}
                    {pctStaple > 0 && <div className="bg-yellow-400 h-full" style={{ width: `${pctStaple}%` }} />}
                    {pctFruit > 0 && <div className="bg-green-400 h-full" style={{ width: `${pctFruit}%` }} />}
                    {pctSoup > 0 && <div className="bg-blue-300 h-full" style={{ width: `${pctSoup}%` }} />}
                  </div>
                  <div className="flex flex-wrap gap-x-3 text-[10px] text-muted mb-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" />菜品 {todayDishCal}</span>
                    {advSkipped > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-300 inline-block" />自理餐 {advSkipped}</span>}
                    {advStaple > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />主食 {advStaple}</span>}
                    {advFruit > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />水果 {advFruit}</span>}
                    {advSoup > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-300 inline-block" />汤 {advSoup}</span>}
                    <span>合计 {totalWithAdvice}/{adv.dailyTarget}kcal</span>
                    {finalGap > 0 && <span className="text-accent">缺口 {finalGap}</span>}
                  </div>
                  <div className="space-y-0.5 text-xs">
                    {skippedList.map(sm => (
                      <p key={sm.mealType}>🍽️ 未规划{sm.label}，建议补充约 {sm.suggestedCalories}kcal</p>
                    ))}
                    {profile.lunchboxMode && (
                      <p className="text-amber-600">🍱 带饭模式: 午餐用前晚剩菜 (晚餐已 ×2 烹制)</p>
                    )}
                    {advStaple > 0 && <p>🍚 主食: 每餐约{adv.staplePerMeal || Math.round(adv.stapleGrams/3)}g，全天{adv.stapleGrams}g（约{adv.stapleCalories}kcal/天）</p>}
                    {advFruit > 0 && <p>🍎 水果: 全天{adv.fruitGrams}g（约{adv.fruitCalories}kcal/天）</p>}
                    {advSoup > 0 && <p>🥣 清汤: 每餐一碗（约40kcal/天）</p>}
                  </div>
                </div>
                );
              })}
            </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
