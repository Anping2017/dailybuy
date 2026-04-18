import type { Gender, AgeGroup, FitnessGoal } from '@/types';
import healthRulesData from '@/data/health-rules.json';

const defaults = healthRulesData.dailyCalorieDefaults as Record<Gender, Record<AgeGroup, number>>;

/** 根据性别和年龄获取推荐每日热量 */
export function getRecommendedCalories(gender: Gender, ageGroup: AgeGroup): number {
  return defaults[gender]?.[ageGroup] ?? 2000;
}

/**
 * Mifflin-St Jeor 公式计算基础代谢率 (BMR kcal/day)
 * 比 Harris-Benedict 更准确。
 */
export function calcBMR(gender: Gender, ageGroup: AgeGroup, height: number, weight: number): number {
  // 年龄代入每段中位数
  const ageMid: Record<AgeGroup, number> = {
    toddler: 2, child: 6, preteen: 11, teen: 15,
    young_adult: 24, adult: 40, middle_age: 58, senior: 70,
  };
  const age = ageMid[ageGroup];
  // 男: 10W + 6.25H - 5A + 5
  // 女: 10W + 6.25H - 5A - 161
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/** 活动系数 (默认中等,做饭人群假设 1.4) */
const ACTIVITY_FACTOR = 1.4;

/**
 * 根据健康目标推荐每日热量
 * 有身高体重 → 用 BMR × 1.4 + 目标调整
 * 无身高体重 → 以年龄性别默认值 + 目标调整
 */
export function getTargetCaloriesByGoal(
  gender: Gender,
  ageGroup: AgeGroup,
  goal: FitnessGoal,
  height?: number,
  weight?: number,
): number {
  const base = height && weight
    ? Math.round(calcBMR(gender, ageGroup, height, weight) * ACTIVITY_FACTOR)
    : getRecommendedCalories(gender, ageGroup);

  const adjust: Record<FitnessGoal, number> = {
    cutting: -400,   // 减脂: 赤字 400 kcal
    maintain: 0,
    bulking: 400,    // 增肌: 盈余 400 kcal
    wellness: -200,  // 养生: 略低 200 kcal (老人/慢病)
  };
  return Math.max(1000, base + adjust[goal]);  // 不低于 1000 kcal
}

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  cutting: '🏃 减脂',
  maintain: '⚖️ 维持',
  bulking: '💪 增肌',
  wellness: '🌿 养生',
};

export const GOAL_DESC: Record<FitnessGoal, string> = {
  cutting: '热量赤字 -400，少油腻',
  maintain: '标准热量，均衡饮食',
  bulking: '热量盈余 +400，蛋白质加量',
  wellness: '清淡少盐少油，适合慢病/老人',
};
