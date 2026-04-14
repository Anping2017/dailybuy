import type { Gender, AgeGroup } from '@/types';
import healthRulesData from '@/data/health-rules.json';

const defaults = healthRulesData.dailyCalorieDefaults as Record<Gender, Record<AgeGroup, number>>;

/** 根据性别和年龄获取推荐每日热量 */
export function getRecommendedCalories(gender: Gender, ageGroup: AgeGroup): number {
  return defaults[gender]?.[ageGroup] ?? 2000;
}
