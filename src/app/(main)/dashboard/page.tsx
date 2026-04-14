'use client';

import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CalendarDays, ShoppingCart, Flame, DollarSign, Package, X, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { getRecipe } from '@/lib/nutrition/calculator';
import { getAllIngredients } from '@/lib/data/recipe-repository';
import { ConfigSummary } from '@/components/ui/config-summary';

const DAY_LABELS: Record<string, string> = {
  monday: '周一', tuesday: '周二', wednesday: '周三', thursday: '周四',
  friday: '周五', saturday: '周六', sunday: '周日',
};
const MEAL_LABELS: Record<string, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };
const ROLE_LABELS: Record<string, string> = { main_meat: '荤', main_veg: '素', soup: '汤', staple: '主食', side: '配', cold: '凉' };

export default function DashboardPage() {
  const router = useRouter();
  const { profile, weeklyPlan, shoppingList, onboardingComplete, ownedIngredients, addOwnedIngredient, removeOwnedIngredient } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (!onboardingComplete) { router.push('/onboarding'); return null; }

  const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
  const todaySlots = weeklyPlan?.slots.filter(s => s.day === today) || [];
  const sortedSlots = [...todaySlots].sort((a, b) => {
    const order = ['breakfast', 'lunch', 'dinner'];
    return order.indexOf(a.mealType) - order.indexOf(b.mealType);
  });

  const planDays = profile.planDays || 7;
  const weekCalories = weeklyPlan?.totalCalories || 0;
  const weekCost = weeklyPlan?.totalCost || 0;
  const purchasedCount = shoppingList?.items.filter(i => i.isPurchased).length || 0;
  const totalItems = shoppingList?.items.filter(i => !i.isOwned).length || 0;

  const allIngredients = getAllIngredients();
  const searchResults = ingredientSearch.length > 0
    ? allIngredients.filter(i => i.nameZh.includes(ingredientSearch) || i.nameEn.toLowerCase().includes(ingredientSearch.toLowerCase())).slice(0, 8)
    : [];

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
          <p className="font-bold text-base">{weeklyPlan ? '我的菜谱' : '开始规划'}</p>
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

      {/* 家里有什么 */}
      <div className="bg-card border border-border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">家里有什么食材？</span>
          <span className="text-xs text-muted">优先推荐</span>
        </div>
        <div className="relative">
          <input type="text" placeholder="搜索食材名..." value={ingredientSearch}
            onChange={e => setIngredientSearch(e.target.value)}
            className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background" />
          {searchResults.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 bg-card border border-border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map(ing => (
                <button key={ing.id} onClick={() => { addOwnedIngredient(ing.id); setIngredientSearch(''); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-background flex justify-between">
                  <span>{ing.nameZh}</span>
                  <span className="text-xs text-muted">{ing.nameEn}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {(ownedIngredients || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ownedIngredients.map(id => {
              const ing = allIngredients.find(i => i.id === id);
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

      {/* 有菜谱时显示概览 */}
      {weeklyPlan && (
        <>
          {/* 数据概览 */}
          <div className="grid grid-cols-3 gap-3">
            <MiniCard icon={<Flame className="w-4 h-4 text-accent" />} label="日均热量" value={`${Math.round(weekCalories / planDays)}`} unit="kcal" />
            <MiniCard icon={<DollarSign className="w-4 h-4 text-primary" />} label="预估花费" value={`$${weekCost.toFixed(0)}`} unit="" />
            <MiniCard icon={<CalendarDays className="w-4 h-4 text-blue-500" />} label="已规划" value={`${weeklyPlan.slots.length}`} unit="餐" />
          </div>

          {/* 每位成员热量建议 */}
          {weeklyPlan.memberAdvice && weeklyPlan.memberAdvice.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">热量建议</h2>
              {weeklyPlan.memberAdvice.map(adv => {
                const advStaple = (profile.stapleMode || 'off') === 'off' ? adv.stapleCalories : 0;
                const advFruit = !profile.includeFruit ? adv.fruitCalories : 0;
                const advSoup = !profile.includeSoup ? 40 : 0;
                const advSkipped = (adv.skippedMeals || []).reduce((s, m) => s + m.suggestedCalories, 0);
                const totalWithAdvice = adv.dishCalories + advStaple + advFruit + advSoup + advSkipped;
                const pctDish = Math.round(adv.dishCalories / adv.dailyTarget * 100);
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
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" />菜品 {adv.dishCalories}</span>
                    {advSkipped > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-300 inline-block" />自理餐 {advSkipped}</span>}
                    {advStaple > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />主食 {advStaple}</span>}
                    {advFruit > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />水果 {advFruit}</span>}
                    {advSoup > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-300 inline-block" />汤 {advSoup}</span>}
                    <span>合计 {totalWithAdvice}/{adv.dailyTarget}kcal</span>
                    {finalGap > 0 && <span className="text-accent">缺口 {finalGap}</span>}
                  </div>
                  <div className="space-y-0.5 text-xs">
                    {(adv.skippedMeals || []).map(sm => (
                      <p key={sm.mealType}>🍽️ 未规划{sm.label}，建议补充约 {sm.suggestedCalories}kcal</p>
                    ))}
                    {advStaple > 0 && <p>🍚 主食: 每餐约{adv.staplePerMeal || Math.round(adv.stapleGrams/3)}g，全天{adv.stapleGrams}g（约{adv.stapleCalories}kcal/天）</p>}
                    {advFruit > 0 && <p>🍎 水果: 全天{adv.fruitGrams}g（约{adv.fruitCalories}kcal/天）</p>}
                    {advSoup > 0 && <p>🥣 清汤: 每餐一碗（约40kcal/天）</p>}
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* 今日菜谱预览 */}
          {sortedSlots.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">今日 ({DAY_LABELS[today]})</h2>
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
        </>
      )}
    </div>
  );
}

function MiniCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="font-bold text-lg">{value}<span className="text-xs font-normal text-muted">{unit}</span></p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}
