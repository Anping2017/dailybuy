/**
 * 根据用户设置估算每日/每周实际会生成的热量与目标差距。
 * 用在 Profile 页的超标预警，让用户在生成前就知道设置是否合理。
 * 不涉及具体菜谱，只按"经验平均值"估算。
 */
import type { UserProfile, MealType } from '@/types';

// 经验值: 一道菜的总热量(食材不缩放, 按原配方做整份)
// 基础假设: 荤菜 ~ 700 kcal, 素菜 ~ 350 kcal, 主食 ~ 400 kcal, 汤 ~ 200 kcal, 凉菜 ~ 200 kcal
const AVG_CAL_PER_DISH = {
  meat: 700,
  veg: 350,
  staple: 400,
  soup: 200,
  cold: 200,
};

/**
 * 估算每日总热量(家庭总和)、目标、差值百分比
 */
export function estimateSettingsCalories(profile: UserProfile): {
  estimatedDaily: number;   // 家庭每日总估算 kcal
  targetDaily: number;      // 家庭每日目标 kcal
  deltaPercent: number;     // (estimated - target) / target * 100
  mealBreakdown: Record<MealType, { est: number; target: number }>;
  warn: 'ok' | 'mild' | 'high';  // ok <=115%, mild <=135%, high >135%
  hints: string[];
} {
  const familySize = Math.max(1, profile.familySize);
  const membersCount = Math.max(1, profile.members.length);
  const avgTarget = profile.members.reduce((s, m) => s + m.dailyCalorieTarget, 0) / membersCount;
  const targetDaily = profile.members.reduce((s, m) => s + m.dailyCalorieTarget, 0)
    + avgTarget * Math.max(0, familySize - membersCount);

  const isLD = (mt: MealType) => mt === 'lunch' || mt === 'dinner';
  const useCustom = profile.customMealComposition?.enabled === true;

  const mealEst = (mt: MealType): number => {
    let meatCount = 0, vegCount = 0, soupCount = 0, stapleCount = 0, coldCount = 0;
    if (useCustom && profile.customMealComposition) {
      const c = profile.customMealComposition[mt];
      meatCount = c.meatCount;
      vegCount = c.vegCount;
      soupCount = c.soupCount;
      stapleCount = c.stapleCount;
      coldCount = c.coldDishCount;
    } else {
      // 默认: 按 familySize 推算（类似 engine 的 getHotDishComposition）
      if (mt === 'breakfast') { vegCount = 1; stapleCount = (profile.stapleMode || 'off') !== 'off' ? 1 : 0; }
      else {
        meatCount = familySize >= 4 ? 2 : 1;
        vegCount = familySize >= 4 ? 2 : 1;
        if (isLD(mt)) {
          soupCount = profile.includeSoup ? 1 : 0;
          coldCount = profile.includeColdDish ? 1 : 0;
          stapleCount = (profile.stapleMode || 'off') !== 'off' ? 1 : 0;
        }
      }
    }
    // 凉菜排挤 1 素菜
    if (coldCount > 0 && (meatCount + vegCount) > 1) {
      if (vegCount > 0) vegCount--;
      else meatCount--;
    }
    // 开关过滤: 用户未打开的不生成
    if (soupCount > 0 && !profile.includeSoup) soupCount = 0;
    if (stapleCount > 0 && (profile.stapleMode || 'off') === 'off') stapleCount = 0;
    if (coldCount > 0 && !profile.includeColdDish) coldCount = 0;

    // 不再乘 familySize: 食材不缩放, 每道菜的热量就是配方总和
    const cal = meatCount * AVG_CAL_PER_DISH.meat
      + vegCount * AVG_CAL_PER_DISH.veg
      + soupCount * AVG_CAL_PER_DISH.soup
      + stapleCount * AVG_CAL_PER_DISH.staple
      + coldCount * AVG_CAL_PER_DISH.cold;
    return cal;
  };

  const mealBreakdown = {} as Record<MealType, { est: number; target: number }>;
  const mealWeights: Record<MealType, number> = { breakfast: 0.25, lunch: 0.40, dinner: 0.35 };
  const activeSum = profile.mealsPerDay.reduce((s, m) => s + mealWeights[m], 0) || 1;

  let estimatedDaily = 0;
  for (const mt of profile.mealsPerDay) {
    const est = mealEst(mt);
    const target = Math.round(targetDaily * (mealWeights[mt] / activeSum));
    mealBreakdown[mt] = { est, target };
    estimatedDaily += est;
  }

  const deltaPercent = targetDaily > 0 ? Math.round((estimatedDaily - targetDaily) / targetDaily * 100) : 0;
  const warn: 'ok' | 'mild' | 'high' =
    deltaPercent <= 15 ? 'ok' :
    deltaPercent <= 35 ? 'mild' :
    'high';

  const hints: string[] = [];
  if (deltaPercent > 35) {
    hints.push('设置大幅超标，建议减少菜品数量或关闭部分品类');
  } else if (deltaPercent > 15) {
    hints.push('设置略超目标，实际生成时系统会自动选低热量的菜');
  } else if (deltaPercent < -20) {
    hints.push('可能热量不足，考虑增加主食或荤菜');
  }

  // 具体哪餐超标
  for (const mt of profile.mealsPerDay) {
    const b = mealBreakdown[mt];
    if (b.target > 0 && (b.est - b.target) / b.target > 0.4) {
      const label = mt === 'breakfast' ? '早餐' : mt === 'lunch' ? '午餐' : '晚餐';
      hints.push(`${label}估算 ${Math.round(b.est)} kcal，目标 ${b.target} kcal`);
    }
  }

  return {
    estimatedDaily: Math.round(estimatedDaily),
    targetDaily: Math.round(targetDaily),
    deltaPercent,
    mealBreakdown,
    warn,
    hints,
  };
}
