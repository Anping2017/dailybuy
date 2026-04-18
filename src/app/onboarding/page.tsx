'use client';

import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronRight, ChevronLeft, Users, Heart, UtensilsCrossed, DollarSign } from 'lucide-react';
import type {
  AgeGroup, HealthCondition, DietaryRestriction, CuisineType, MealType,
} from '@/types';

const STEPS = ['家庭', '健康', '口味', '预算'];

const AGE_LABELS: Record<AgeGroup, string> = {
  toddler: '幼儿(1-3)', child: '儿童(4-8)', preteen: '少年(9-13)', teen: '青少年(14-17)',
  young_adult: '青年(18-30)', adult: '中年(31-50)', middle_age: '中老年(51-65)', senior: '老年(65+)',
};
const HEALTH_LABELS: Record<HealthCondition, string> = {
  none: '无特殊情况', diabetes: '糖尿病', hypertension: '高血压',
  gout: '痛风', hyperlipidemia: '高血脂', kidney_disease: '肾病',
  pregnancy: '孕期/哺乳期',
};
const DIET_LABELS: Record<DietaryRestriction, string> = {
  vegetarian: '素食', vegan: '纯素', halal: '清真',
  no_pork: '不吃猪肉', no_beef: '不吃牛肉', no_lamb: '不吃羊肉', no_seafood: '不吃海鲜',
  no_spicy: '不吃辣', lactose_free: '乳糖不耐', gluten_free: '麸质过敏', nut_free: '坚果过敏',
  avoid_processed: '规避加工食品',
};
const CUISINE_LABELS: Record<CuisineType, string> = {
  chinese: '中餐', western: '西餐', asian_other: '日韩东南亚', fusion: '混合',
};
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '早餐', lunch: '午餐', dinner: '晚餐',
};

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile, addMember, updateMember, setOnboardingComplete } = useAppStore();
  const [step, setStep] = useState(0);

  const member = profile.members[0]; // 主用户

  const handleFinish = () => {
    setOnboardingComplete(true);
    router.push('/dashboard');
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col p-4">
      {/* 进度指示 */}
      <div className="flex items-center gap-2 mb-8 pt-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-full h-1.5 rounded-full transition ${
              i <= step ? 'bg-primary' : 'bg-border'
            }`} />
          </div>
        ))}
      </div>

      <div className="flex-1">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">家庭信息</h1>
              </div>
              <p className="text-sm text-muted">告诉我们您的家庭情况，以便规划合适的菜量</p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">家里几口人吃饭？</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => setProfile({ familySize: n })}
                    className={`w-12 h-12 rounded-lg border-2 font-bold transition ${
                      profile.familySize === n
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">您的年龄段</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(AGE_LABELS) as AgeGroup[]).map(ag => (
                  <Chip
                    key={ag}
                    label={AGE_LABELS[ag]}
                    active={member?.ageGroup === ag}
                    onClick={() => updateMember(member.id, { ageGroup: ag })}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">每天规划几餐？</label>
              <div className="flex gap-2">
                {(Object.keys(MEAL_LABELS) as MealType[]).map(m => (
                  <Chip
                    key={m}
                    label={MEAL_LABELS[m]}
                    active={profile.mealsPerDay.includes(m)}
                    onClick={() => {
                      const next = profile.mealsPerDay.includes(m)
                        ? profile.mealsPerDay.filter(x => x !== m)
                        : [...profile.mealsPerDay, m];
                      setProfile({ mealsPerDay: next.length > 0 ? next : ['dinner'] });
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-6 h-6 text-danger" />
                <h1 className="text-xl font-bold">健康与忌口</h1>
              </div>
              <p className="text-sm text-muted">我们会自动排除不适合的食材</p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">健康状况（可多选）</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(HEALTH_LABELS) as HealthCondition[]).map(h => (
                  <Chip
                    key={h}
                    label={HEALTH_LABELS[h]}
                    active={member?.healthConditions.includes(h)}
                    onClick={() => {
                      if (h === 'none') {
                        updateMember(member.id, { healthConditions: ['none'] });
                      } else {
                        const curr = member.healthConditions;
                        const next = curr.includes(h)
                          ? curr.filter(x => x !== h)
                          : [...curr.filter(x => x !== 'none'), h];
                        updateMember(member.id, { healthConditions: next.length > 0 ? next : ['none'] });
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">饮食限制（可多选）</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(DIET_LABELS) as DietaryRestriction[]).map(d => (
                  <Chip
                    key={d}
                    label={DIET_LABELS[d]}
                    active={member?.dietaryRestrictions.includes(d)}
                    onClick={() => {
                      const curr = member.dietaryRestrictions;
                      const next = curr.includes(d)
                        ? curr.filter(x => x !== d)
                        : [...curr, d];
                      updateMember(member.id, { dietaryRestrictions: next });
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed className="w-6 h-6 text-accent" />
                <h1 className="text-xl font-bold">口味偏好</h1>
              </div>
              <p className="text-sm text-muted">选择您喜欢的菜系，可多选</p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">偏好菜系</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CUISINE_LABELS) as CuisineType[]).map(c => (
                  <Chip
                    key={c}
                    label={CUISINE_LABELS[c]}
                    active={profile.cuisinePreference.includes(c)}
                    onClick={() => {
                      const next = profile.cuisinePreference.includes(c)
                        ? profile.cuisinePreference.filter(x => x !== c)
                        : [...profile.cuisinePreference, c];
                      setProfile({ cuisinePreference: next.length > 0 ? next : ['chinese'] });
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">每日热量目标 (kcal)</label>
              <input
                type="number"
                value={member?.dailyCalorieTarget || 2200}
                onChange={e => updateMember(member.id, { dailyCalorieTarget: Number(e.target.value) || 2000 })}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-card"
              />
              <p className="text-xs text-muted mt-1">
                建议: 成人2000-2500, 青少年1800-2200, 儿童1200-1600
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">预算</h1>
              </div>
              <p className="text-sm text-muted">设置每周买菜预算</p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">每周买菜预算 (NZD)</label>
              <input
                type="number"
                value={profile.weeklyBudget}
                onChange={e => setProfile({ weeklyBudget: Number(e.target.value) || 100 })}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-card"
              />
              <p className="text-xs text-muted mt-1">
                参考: 2人约$100-150/周, 4人约$200-300/周
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 导航按钮 */}
      <div className="flex gap-3 pt-6 pb-4">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 px-4 py-2.5 border border-border rounded-lg text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> 上一步
          </button>
        )}
        <button
          onClick={() => step < 3 ? setStep(step + 1) : handleFinish()}
          className="flex-1 flex items-center justify-center gap-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          {step < 3 ? (
            <>下一步 <ChevronRight className="w-4 h-4" /></>
          ) : (
            '开始规划'
          )}
        </button>
      </div>
    </div>
  );
}

function Chip({
  label, active, onClick,
}: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
        active
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      {label}
    </button>
  );
}
