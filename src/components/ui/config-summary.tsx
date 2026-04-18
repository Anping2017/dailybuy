'use client';

import { useAppStore } from '@/lib/store';
import type { CookingLevel, FlavorPreference } from '@/types';

const LEVEL: Record<CookingLevel, string> = {
  beginner: '小白', basic: '入门', intermediate: '家常', advanced: '进阶', expert: '大厨',
};
const FLAVOR: Record<FlavorPreference, string> = {
  sour: '酸', sweet: '甜', bitter: '苦', spicy: '辣', salty: '咸', umami: '鲜', light: '清淡',
};

export function ConfigSummary() {
  const profile = useAppStore(s => s.profile);

  const people = profile.familySize;
  const days = profile.planDays || 7;
  const meals = profile.mealsPerDay.length;
  const level = LEVEL[profile.cookingLevel] || '家常';
  const flavors = (profile.flavorPreference || []).map(f => FLAVOR[f]).join('') || '不限';

  return (
    <p className="text-xs text-muted">
      {people}人·{days}天×{meals}餐·{level}·{flavors}
    </p>
  );
}
