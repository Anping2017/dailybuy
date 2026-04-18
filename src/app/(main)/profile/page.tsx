'use client';

import { useAppStore } from '@/lib/store';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { getAllIngredients } from '@/lib/data/recipe-repository';
import type {
  FamilyMember, HealthCondition, DietaryRestriction, CuisineType,
  AgeGroup, Gender, MealType, RegionalCuisine, FlavorPreference,
  CookingLevel, DifficultyLevel, CookingMethod, StaplePreference,
  FitnessGoal,
} from '@/types';
import { getRecommendedCalories, getTargetCaloriesByGoal, GOAL_LABELS, GOAL_DESC } from '@/lib/nutrition/calorie-defaults';
import { estimateSettingsCalories } from '@/lib/nutrition/settings-estimate';

const GENDER_LABELS: Record<Gender, string> = {
  male: '男', female: '女',
};

const AGE_LABELS: Record<AgeGroup, string> = {
  toddler: '幼儿(1-3)', child: '儿童(4-8)', preteen: '少年(9-13)', teen: '青少年(14-17)',
  young_adult: '青年(18-30)', adult: '中年(31-50)', middle_age: '中老年(51-65)', senior: '老年(65+)',
};

const HEALTH_LABELS: Record<HealthCondition, string> = {
  none: '无', diabetes: '糖尿病', hypertension: '高血压',
  gout: '痛风', hyperlipidemia: '高血脂', kidney_disease: '肾病',
  pregnancy: '孕期/哺乳期',
};

const DIET_LABELS: Record<DietaryRestriction, string> = {
  vegetarian: '素食', vegan: '纯素', halal: '清真',
  no_pork: '不吃猪肉', no_beef: '不吃牛肉', no_lamb: '不吃羊肉', no_seafood: '不吃海鲜',
  no_spicy: '不吃辣', lactose_free: '无乳糖', gluten_free: '无麸质', nut_free: '无坚果',
  avoid_processed: '规避加工食品',
};

const CUISINE_LABELS: Record<CuisineType, string> = {
  chinese: '中餐', western: '西餐', asian_other: '亚洲其他', fusion: '混合',
};

const REGIONAL_LABELS: Record<RegionalCuisine, string> = {
  homestyle: '家常菜', sichuan: '川菜', cantonese: '粤菜', shandong: '鲁菜', jiangsu: '苏菜/淮扬',
  hunan: '湘菜', fujian: '闽菜', dongbei: '东北菜', zhejiang: '浙菜', anhui: '徽菜',
  yunnan: '云南菜', xinjiang: '新疆菜', taiwanese: '台湾菜',
  italian: '意式', american: '美式', french: '法式',
  japanese: '日式', korean: '韩式', southeast_asian: '东南亚',
};

const FLAVOR_LABELS: Record<FlavorPreference, string> = {
  sour: '酸', sweet: '甜', bitter: '苦', spicy: '辣',
  salty: '咸', umami: '鲜', light: '清淡',
};

const COOKING_LEVEL_LABELS: Record<CookingLevel, string> = {
  beginner: '厨房小白', basic: '入门级', intermediate: '家常级',
  advanced: '进阶级', expert: '大厨级',
};

const COOKING_LEVEL_DESC: Record<CookingLevel, string> = {
  beginner: '煮面、煎蛋', basic: '简单炒菜',
  intermediate: '大部分家常菜', advanced: '复杂菜式', expert: '各种菜式',
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: '简单', medium: '中等', hard: '困难',
};

const COOKING_METHOD_LABELS: Record<CookingMethod, string> = {
  stir_fry: '炒菜', braise: '红烧/卤', stew: '炖/煲', steam: '蒸',
  boil: '煮/汆', cold_dish: '凉拌', deep_fry: '炸/煎', roast: '烤/焗',
  dry_pot: '干锅/铁板', soup: '汤羹', staple: '主食',
};

const STAPLE_LABELS: Record<StaplePreference, string> = {
  rice: '米饭', noodles: '面条', bread: '面包', congee: '粥', mantou: '馒头/饼', any: '不限',
};

// 地域菜系按大类分组
const REGIONAL_BY_CUISINE: Record<string, RegionalCuisine[]> = {
  chinese: ['homestyle', 'sichuan', 'cantonese', 'shandong', 'jiangsu', 'hunan', 'fujian', 'dongbei', 'zhejiang', 'anhui', 'yunnan', 'xinjiang', 'taiwanese'],
  western: ['italian', 'american', 'french'],
  asian_other: ['japanese', 'korean', 'southeast_asian'],
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '早餐', lunch: '午餐', dinner: '晚餐',
};

export default function ProfilePage() {
  const { profile, setProfile, addMember, updateMember, removeMember } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">偏好设置</h1>
        <Link href="/admin" className="text-xs text-muted hover:text-primary transition px-3 py-1.5 border border-border rounded-lg">
          后台管理
        </Link>
      </div>

      {/* 推荐模式 */}
      <Section title="推荐模式">
        <div className="space-y-2">
          <button
            onClick={() => setProfile({ recommendMode: 'basic' })}
            className={`w-full p-3 rounded-lg border-2 text-left transition ${
              profile.recommendMode === 'basic'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <p className="font-medium text-sm">🔍 基础菜谱库</p>
            <p className="text-xs text-muted mt-0.5">从1200+内置菜谱中智能匹配（即时、免费）</p>
          </button>
          <button
            onClick={() => setProfile({ recommendMode: 'ai_queue' })}
            className={`w-full p-3 rounded-lg border-2 text-left transition ${
              profile.recommendMode === 'ai_queue'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <p className="font-medium text-sm">🤖 AI 队列分析（免费）</p>
            <p className="text-xs text-muted mt-0.5">先用基础库生成，方案放入队列异步分析优化，后续更新更贴合</p>
          </button>
          <button
            onClick={() => setProfile({ recommendMode: 'ai_online' })}
            className={`w-full p-3 rounded-lg border-2 text-left transition ${
              profile.recommendMode === 'ai_online'
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <p className="font-medium text-sm">⚡ AI 在线推荐（付费）</p>
            <p className="text-xs text-muted mt-0.5">实时调用 API 生成个性化方案 + 详细菜谱说明</p>
          </button>
        </div>
        {profile.recommendMode === 'ai_online' && !process.env.NEXT_PUBLIC_HAS_API_KEY && (
          <p className="text-xs text-accent mt-2">⚠ 未配置 API Key，将回退为基础库生成</p>
        )}
      </Section>

      {/* 家庭成员 */}
      <Section title="家庭成员">
        {profile.members.map((member, idx) => (
          <MemberCard
            key={member.id}
            member={member}
            index={idx}
            onUpdate={(updates) => updateMember(member.id, updates)}
            onRemove={profile.members.length > 1 ? () => removeMember(member.id) : undefined}
          />
        ))}
        <button
          onClick={() => {
            addMember({
              id: `member_${Date.now()}`,
              name: `家人${profile.members.length + 1}`,
              gender: 'male',
              ageGroup: 'adult',
              healthConditions: ['none'],
              dietaryRestrictions: [],
              dailyCalorieTarget: getRecommendedCalories('male', 'adult'),
            });
          }}
          className="flex items-center gap-1 text-primary text-sm"
        >
          <Plus className="w-4 h-4" /> 添加家庭成员
        </button>
      </Section>

      {/* 菜系偏好 - 提到厨艺之前 */}
      <Section title="菜系偏好">
        <label className="text-sm text-muted block mb-1">大类</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {(Object.keys(CUISINE_LABELS) as CuisineType[]).map(c => (
            <ToggleChip
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

        <label className="text-sm text-muted block mb-1">地域菜系（多选，留空则不限）</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.cuisinePreference.flatMap(c => REGIONAL_BY_CUISINE[c] || []).map(r => (
            <ToggleChip
              key={r}
              label={REGIONAL_LABELS[r]}
              active={(profile.regionalPreference || []).includes(r)}
              onClick={() => {
                const next = profile.regionalPreference.includes(r)
                  ? profile.regionalPreference.filter(x => x !== r)
                  : [...profile.regionalPreference, r];
                setProfile({ regionalPreference: next });
              }}
            />
          ))}
        </div>
      </Section>

      {/* 厨艺与口味 - 基础/自定义模式 */}
      <Section title="厨艺与口味">
        <div className="flex gap-2 mb-3">
          <button onClick={() => setProfile({ cookingLevel: 'intermediate', acceptedDifficulty: [], flavorPreference: [], preferredCookingMethods: [] })}
            className={`flex-1 p-2 rounded-lg border-2 text-center text-sm font-medium transition ${
              (profile.acceptedDifficulty || []).length === 0 && (profile.flavorPreference || []).length === 0 && (profile.preferredCookingMethods || []).length === 0
                ? 'border-primary bg-primary/5 text-primary' : 'border-border'
            }`}>
            基础模式
            <p className="text-[10px] text-muted font-normal">什么都不限</p>
          </button>
          <button onClick={() => setProfile({ acceptedDifficulty: (profile.acceptedDifficulty || []).length === 0 ? ['easy','medium'] : profile.acceptedDifficulty })}
            className={`flex-1 p-2 rounded-lg border-2 text-center text-sm font-medium transition ${
              !((profile.acceptedDifficulty || []).length === 0 && (profile.flavorPreference || []).length === 0 && (profile.preferredCookingMethods || []).length === 0)
                ? 'border-primary bg-primary/5 text-primary' : 'border-border'
            }`}>
            自定义
            <p className="text-[10px] text-muted font-normal">精细调整偏好</p>
          </button>
        </div>

        {/* 自定义模式下显示细项 */}
        {!((profile.acceptedDifficulty || []).length === 0 && (profile.flavorPreference || []).length === 0 && (profile.preferredCookingMethods || []).length === 0) && (
          <>
            <label className="text-sm text-muted block mb-1">厨艺等级</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(Object.keys(COOKING_LEVEL_LABELS) as CookingLevel[]).map(l => (
                <ToggleChip key={l} label={COOKING_LEVEL_LABELS[l]}
                  active={profile.cookingLevel === l} onClick={() => setProfile({ cookingLevel: l })} />
              ))}
            </div>

            <label className="text-sm text-muted block mb-1">可接受难度（多选）</label>
            <div className="flex gap-2 mb-3">
              {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map(d => (
                <ToggleChip key={d} label={DIFFICULTY_LABELS[d]}
                  active={profile.acceptedDifficulty.includes(d)}
                  onClick={() => {
                    const next = profile.acceptedDifficulty.includes(d)
                      ? profile.acceptedDifficulty.filter(x => x !== d)
                      : [...profile.acceptedDifficulty, d];
                    setProfile({ acceptedDifficulty: next.length > 0 ? next : ['easy'] });
                  }} />
              ))}
            </div>

            <label className="text-sm text-muted block mb-1">口味偏好（多选，留空不限）</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(Object.keys(FLAVOR_LABELS) as FlavorPreference[]).map(f => (
                <ToggleChip key={f} label={FLAVOR_LABELS[f]}
                  active={profile.flavorPreference.includes(f)}
                  onClick={() => {
                    const next = profile.flavorPreference.includes(f)
                      ? profile.flavorPreference.filter(x => x !== f)
                      : [...profile.flavorPreference, f];
                    setProfile({ flavorPreference: next });
                  }} />
              ))}
            </div>

            <label className="text-sm text-muted block mb-1">偏好做法（多选，留空不限）</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(Object.keys(COOKING_METHOD_LABELS) as CookingMethod[]).map(m => (
                <ToggleChip key={m} label={COOKING_METHOD_LABELS[m]}
                  active={(profile.preferredCookingMethods || []).includes(m)}
                  onClick={() => {
                    const next = (profile.preferredCookingMethods || []).includes(m)
                      ? profile.preferredCookingMethods.filter(x => x !== m)
                      : [...profile.preferredCookingMethods, m];
                    setProfile({ preferredCookingMethods: next });
                  }} />
              ))}
            </div>
          </>
        )}
      </Section>

      {/* 基本设置 */}
      <Section title="用餐与采购">
        <label className="text-sm text-muted block mb-1">规划天数</label>
        <div className="flex gap-2 mb-3">
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <button
              key={n}
              onClick={() => setProfile({ planDays: n })}
              className={`w-10 h-10 rounded-lg border-2 font-bold text-sm transition ${
                profile.planDays === n
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {n}天
            </button>
          ))}
        </div>

        <label className="text-sm text-muted block mb-1">每日餐次（多选）</label>
        <div className="flex gap-2 mb-3">
          {(Object.keys(MEAL_LABELS) as MealType[]).map(m => (
            <ToggleChip
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
        <p className="text-xs text-muted mb-3">
          将生成 {profile.planDays} 天 × {profile.mealsPerDay.length} 餐 = {profile.planDays * profile.mealsPerDay.length} 个菜谱
        </p>

        <div className="mb-3">
          <SwitchRow
            label="预算管理"
            desc={profile.budgetEnabled === false ? '不限预算，推荐不受成本影响' : '按每周预算推荐，超支会警示'}
            value={profile.budgetEnabled !== false}
            onClick={() => setProfile({ budgetEnabled: profile.budgetEnabled === false })}
          />
          {profile.budgetEnabled !== false && (
            <div className="mt-2">
              <label className="text-sm text-muted block mb-1">每周预算 (NZD)</label>
              <input
                type="number"
                value={profile.weeklyBudget}
                onChange={e => setProfile({ weeklyBudget: Number(e.target.value) || 100 })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-muted">生成菜谱时自动加入采购清单</label>
          <button onClick={() => setProfile({ autoAddToShoppingList: !profile.autoAddToShoppingList })}
            className={`w-10 h-6 rounded-full transition ${profile.autoAddToShoppingList ? 'bg-primary' : 'bg-border'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${profile.autoAddToShoppingList ? 'translate-x-4' : ''}`} />
          </button>
        </div>
      </Section>

      {/* 可选推荐品类 - 独立卡片 */}
      <Section title="可选推荐品类">
        <div className="space-y-2">
          <SwitchRow label="推荐主食" desc={(profile.stapleMode || 'off') === 'off' ? '不推荐，留热量缺口给建议' : (profile.stapleMode || 'off') === 'fixed' ? '按偏好固定推荐' : '随机推荐'}
            value={(profile.stapleMode || 'off') !== 'off'}
            onClick={() => {
              const modes: Array<'off' | 'fixed' | 'random'> = ['off', 'fixed', 'random'];
              const idx = modes.indexOf(profile.stapleMode || 'off');
              setProfile({ stapleMode: modes[(idx + 1) % 3] });
            }} />
          {(profile.stapleMode || 'off') !== 'off' && (
            <div className="ml-4 mb-1">
              <label className="text-xs text-muted block mb-1">主食偏好</label>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(STAPLE_LABELS) as StaplePreference[]).map(s => (
                  <ToggleChip key={s} label={STAPLE_LABELS[s]} small
                    active={(profile.staplePreference || []).includes(s)}
                    onClick={() => {
                      if (s === 'any') { setProfile({ staplePreference: ['any'] }); }
                      else {
                        const curr = (profile.staplePreference || []).filter(x => x !== 'any');
                        const next = curr.includes(s) ? curr.filter(x => x !== s) : [...curr, s];
                        setProfile({ staplePreference: next.length > 0 ? next : ['any'] });
                      }
                    }} />
                ))}
              </div>
            </div>
          )}
          <SwitchRow label="推荐汤品" desc="关闭则留热量缺口并给建议量"
            value={profile.includeSoup || false} onClick={() => setProfile({ includeSoup: !profile.includeSoup })} />
          <SwitchRow label="推荐凉菜" desc="关闭则只推荐热菜"
            value={profile.includeColdDish || false} onClick={() => setProfile({ includeColdDish: !profile.includeColdDish })} />
          <SwitchRow label="推荐水果" desc="关闭则留热量缺口并给建议量"
            value={profile.includeFruit || false} onClick={() => setProfile({ includeFruit: !profile.includeFruit })} />
          <SwitchRow
            label="收藏菜谱优先推荐"
            desc={profile.favoritesInRandom !== false ? `本周规划时优先选你收藏的菜（${(profile.favoriteRecipes || []).length} 道）` : '收藏只保留在菜谱库中，不参与随机推荐'}
            value={profile.favoritesInRandom !== false}
            onClick={() => setProfile({ favoritesInRandom: profile.favoritesInRandom === false })}
          />
        </div>
      </Section>

      {/* 每餐菜品数量 - 自定义 */}
      <Section title="每餐菜品数量">
        <SwitchRow
          label="手动设置每餐数量"
          desc={profile.customMealComposition?.enabled ? '按下方数值推荐' : '按人数自动推算（2人1荤1素, 4人2荤2素）'}
          value={profile.customMealComposition?.enabled || false}
          onClick={() => setProfile({
            customMealComposition: {
              ...(profile.customMealComposition || { breakfast: {meatCount:0,vegCount:1,soupCount:0,stapleCount:1,coldDishCount:0}, lunch: {meatCount:1,vegCount:1,soupCount:0,stapleCount:0,coldDishCount:0}, dinner: {meatCount:1,vegCount:1,soupCount:0,stapleCount:0,coldDishCount:0} }),
              enabled: !(profile.customMealComposition?.enabled || false),
            },
          })}
        />

        {profile.customMealComposition?.enabled && (
          <div className="space-y-3 mt-3">
            {/* 说明提示 */}
            <div className="bg-background border border-border/50 rounded-lg p-2.5 text-xs text-muted">
              <p className="mb-1">💡 <span className="text-foreground">提示</span></p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>荤菜/素菜可直接调整</li>
                <li>主食/汤/凉菜：需要先在「可选推荐品类」里打开对应开关才会生效</li>
              </ul>
            </div>

            {(['breakfast','lunch','dinner'] as MealType[]).filter(m => profile.mealsPerDay.includes(m)).map(mealType => {
              const label = mealType === 'breakfast' ? '🌅 早餐' : mealType === 'lunch' ? '☀️ 午餐' : '🌙 晚餐';
              const c = profile.customMealComposition![mealType];
              const updateCount = (key: keyof typeof c, delta: number) => {
                const newVal = Math.max(0, Math.min(5, c[key] + delta));
                setProfile({
                  customMealComposition: {
                    ...profile.customMealComposition!,
                    [mealType]: { ...c, [key]: newVal },
                  },
                });
              };
              // 检查是否设置了某类但对应开关没开
              const stapleConflict = c.stapleCount > 0 && (profile.stapleMode || 'off') === 'off';
              const soupConflict = c.soupCount > 0 && !profile.includeSoup;
              const coldConflict = c.coldDishCount > 0 && !profile.includeColdDish;

              return (
                <div key={mealType} className="border border-border rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">{label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <CounterRow label="🥩 荤菜" count={c.meatCount} onMinus={() => updateCount('meatCount', -1)} onPlus={() => updateCount('meatCount', 1)} />
                    <CounterRow label="🥬 素菜" count={c.vegCount} onMinus={() => updateCount('vegCount', -1)} onPlus={() => updateCount('vegCount', 1)} />
                    <CounterRow label={`🍚 主食${stapleConflict ? ' ⚠' : ''}`} count={c.stapleCount} onMinus={() => updateCount('stapleCount', -1)} onPlus={() => updateCount('stapleCount', 1)} />
                    <CounterRow label={`🥣 汤${soupConflict ? ' ⚠' : ''}`} count={c.soupCount} onMinus={() => updateCount('soupCount', -1)} onPlus={() => updateCount('soupCount', 1)} />
                    <CounterRow label={`🥗 凉菜${coldConflict ? ' ⚠' : ''}`} count={c.coldDishCount} onMinus={() => updateCount('coldDishCount', -1)} onPlus={() => updateCount('coldDishCount', 1)} />
                  </div>
                  {(stapleConflict || soupConflict || coldConflict) && (
                    <p className="text-[10px] text-accent mt-2">
                      ⚠ {[stapleConflict && '主食', soupConflict && '汤', coldConflict && '凉菜'].filter(Boolean).join('/')} 开关未开启，此设置不会生效
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* 设置合理性检查 (需求1 提示) */}
      {(() => {
        const est = estimateSettingsCalories(profile);
        if (est.warn === 'ok') return null;
        const color = est.warn === 'high' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800';
        return (
          <div className={`border rounded-lg p-3 ${color}`}>
            <p className="text-sm font-medium">
              {est.warn === 'high' ? '⚠ 设置可能导致每日热量大幅超标' : 'ℹ 设置略超目标'}
            </p>
            <p className="text-xs mt-1">
              估算日均 <strong>{est.estimatedDaily}</strong> kcal · 目标 <strong>{est.targetDaily}</strong> kcal ·
              <strong className="ml-1">{est.deltaPercent > 0 ? '+' : ''}{est.deltaPercent}%</strong>
            </p>
            {est.hints.length > 0 && (
              <ul className="text-xs mt-1 list-disc list-inside space-y-0.5">
                {est.hints.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
          </div>
        );
      })()}

      {saved && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          已保存
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function MemberCard({
  member, index, onUpdate, onRemove,
}: {
  member: FamilyMember; index: number;
  onUpdate: (updates: Partial<FamilyMember>) => void;
  onRemove?: () => void;
}) {
  const gender = member.gender || 'male';
  const recommended = getRecommendedCalories(gender, member.ageGroup);

  const handleGenderChange = (g: Gender) => {
    const cal = getRecommendedCalories(g, member.ageGroup);
    onUpdate({ gender: g, dailyCalorieTarget: cal });
  };

  const handleAgeChange = (ag: AgeGroup) => {
    const cal = getRecommendedCalories(gender, ag);
    onUpdate({ ageGroup: ag, dailyCalorieTarget: cal });
  };

  return (
    <div className="border border-border rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <input
          type="text"
          value={member.name}
          onChange={e => onUpdate({ name: e.target.value })}
          className="font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
        />
        {onRemove && (
          <button onClick={onRemove} className="text-muted hover:text-danger">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <label className="text-xs text-muted block mb-1">性别</label>
      <div className="flex gap-1 mb-2">
        {(Object.keys(GENDER_LABELS) as Gender[]).map(g => (
          <ToggleChip
            key={g}
            label={GENDER_LABELS[g]}
            active={gender === g}
            onClick={() => handleGenderChange(g)}
            small
          />
        ))}
      </div>

      <label className="text-xs text-muted block mb-1">年龄段</label>
      <div className="flex flex-wrap gap-1 mb-2">
        {(Object.keys(AGE_LABELS) as AgeGroup[]).map(ag => (
          <ToggleChip
            key={ag}
            label={AGE_LABELS[ag]}
            active={member.ageGroup === ag}
            onClick={() => handleAgeChange(ag)}
            small
          />
        ))}
      </div>

      <label className="text-xs text-muted block mb-1">健康状况</label>
      <div className="flex flex-wrap gap-1 mb-2">
        {(Object.keys(HEALTH_LABELS) as HealthCondition[]).map(h => (
          <ToggleChip
            key={h}
            label={HEALTH_LABELS[h]}
            active={member.healthConditions.includes(h)}
            onClick={() => {
              if (h === 'none') {
                onUpdate({ healthConditions: ['none'] });
              } else {
                const next = member.healthConditions.includes(h)
                  ? member.healthConditions.filter(x => x !== h)
                  : [...member.healthConditions.filter(x => x !== 'none'), h];
                onUpdate({ healthConditions: next.length > 0 ? next : ['none'] });
              }
            }}
            small
          />
        ))}
      </div>

      <label className="text-xs text-muted block mb-1">饮食限制</label>
      <div className="flex flex-wrap gap-1 mb-1">
        {(Object.keys(DIET_LABELS) as DietaryRestriction[])
          // 清真已包含不吃猪肉，两项只显示一项
          .filter(d => !(d === 'no_pork' && member.dietaryRestrictions.includes('halal')))
          .map(d => (
            <ToggleChip
              key={d}
              label={DIET_LABELS[d]}
              active={member.dietaryRestrictions.includes(d)}
              onClick={() => {
                let next = member.dietaryRestrictions.includes(d)
                  ? member.dietaryRestrictions.filter(x => x !== d)
                  : [...member.dietaryRestrictions, d];
                // 选了清真自动移除重复的不吃猪肉
                if (d === 'halal' && next.includes('halal')) {
                  next = next.filter(x => x !== 'no_pork');
                }
                onUpdate({ dietaryRestrictions: next });
              }}
              small
            />
        ))}
      </div>
      {member.dietaryRestrictions.includes('halal') && (
        <p className="text-[10px] text-muted mb-2">清真已包含禁猪与禁酒精</p>
      )}

      {/* 长期排除食材 - 个人级 */}
      <label className="text-xs text-muted block mb-1">长期排除食材</label>
      <p className="text-[10px] text-muted mb-1.5">补充饮食限制，可排除具体某种食材（如鸡蛋、香菜）</p>
      <div className="mb-3">
        <ExcludeIngredientEditor
          selectedIds={member.excludeIngredients || []}
          onChange={(ids) => onUpdate({ excludeIngredients: ids })}
        />
      </div>

      {/* 身高体重(可选,用于更精准的 BMR 推算) */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-xs text-muted block mb-1">身高 (cm)</label>
          <input type="number" placeholder="可选" value={member.height || ''}
            onChange={e => onUpdate({ height: Number(e.target.value) || undefined })}
            className="w-full border border-border rounded px-2 py-1 text-sm bg-transparent" />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">体重 (kg)</label>
          <input type="number" placeholder="可选" value={member.weight || ''}
            onChange={e => onUpdate({ weight: Number(e.target.value) || undefined })}
            className="w-full border border-border rounded px-2 py-1 text-sm bg-transparent" />
        </div>
      </div>

      {/* 健康目标 - 需求4 */}
      <label className="text-xs text-muted block mb-1">健康目标</label>
      <div className="grid grid-cols-2 gap-1 mb-2">
        {(Object.keys(GOAL_LABELS) as FitnessGoal[]).map(g => {
          const active = (member.fitnessGoal || 'maintain') === g;
          const presetCal = getTargetCaloriesByGoal(gender, member.ageGroup, g, member.height, member.weight);
          return (
            <button key={g} onClick={() => onUpdate({ fitnessGoal: g, dailyCalorieTarget: presetCal })}
              className={`text-left p-2 rounded border transition ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
              <p className="text-xs font-medium">{GOAL_LABELS[g]}</p>
              <p className="text-[10px] text-muted">{GOAL_DESC[g]}</p>
              <p className="text-[10px] text-primary">≈{presetCal} kcal</p>
            </button>
          );
        })}
      </div>

      <label className="text-xs text-muted block mb-1">
        每日热量目标 (kcal)
        <span className="text-primary ml-1">基础推荐: {recommended}</span>
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={member.dailyCalorieTarget}
          onChange={e => onUpdate({ dailyCalorieTarget: Number(e.target.value) || 2000 })}
          className="flex-1 border border-border rounded px-2 py-1 text-sm bg-transparent"
        />
        {member.dailyCalorieTarget !== recommended && (
          <button
            onClick={() => onUpdate({ dailyCalorieTarget: recommended, fitnessGoal: undefined })}
            className="text-xs text-primary hover:underline whitespace-nowrap"
          >
            重置推荐
          </button>
        )}
      </div>
    </div>
  );
}

function ToggleChip({
  label, active, onClick, small,
}: {
  label: string; active: boolean; onClick: () => void; small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border transition font-medium ${
        small ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-card border-border text-foreground hover:border-primary/50'
      }`}
    >
      {label}
    </button>
  );
}

function SwitchRow({ label, desc, value, onClick }: {
  label: string; desc: string; value: boolean; onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <button onClick={onClick}
        className={`w-10 h-6 rounded-full transition flex-shrink-0 ${value ? 'bg-primary' : 'bg-border'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${value ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  );
}

function ExcludeIngredientEditor({ selectedIds, onChange }: {
  selectedIds: string[]; onChange: (ids: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const allIng = useMemo(() => getAllIngredients(), []);
  const suggestions = useMemo(() => {
    if (!input.trim()) return [];
    const q = input.toLowerCase();
    return allIng
      .filter(i => !selectedIds.includes(i.id))
      .filter(i => i.nameZh.includes(input) || i.nameEn.toLowerCase().includes(q))
      .slice(0, 8);
  }, [input, selectedIds, allIng]);

  return (
    <div>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedIds.map(id => {
            const ing = allIng.find(i => i.id === id);
            return (
              <span key={id} className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">
                {ing?.nameZh || id}
                <button onClick={() => onChange(selectedIds.filter(x => x !== id))} className="hover:text-red-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="搜索食材名添加到排除列表..."
          className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 bg-card border border-border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map(ing => (
              <button
                key={ing.id}
                onClick={() => { onChange([...selectedIds, ing.id]); setInput(''); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-background flex justify-between items-center"
              >
                <span>{ing.nameZh}</span>
                <Plus className="w-3 h-3 text-muted" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CounterRow({ label, count, onMinus, onPlus }: {
  label: string; count: number; onMinus: () => void; onPlus: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-background rounded px-2 py-1.5">
      <span className="text-xs">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onMinus}
          disabled={count <= 0}
          className="w-6 h-6 rounded border border-border text-sm disabled:opacity-30 hover:border-primary/50 transition"
        >
          −
        </button>
        <span className="text-sm font-medium w-4 text-center">{count}</span>
        <button
          onClick={onPlus}
          disabled={count >= 5}
          className="w-6 h-6 rounded border border-border text-sm disabled:opacity-30 hover:border-primary/50 transition"
        >
          +
        </button>
      </div>
    </div>
  );
}
