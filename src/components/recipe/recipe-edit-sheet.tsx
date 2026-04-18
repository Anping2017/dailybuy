'use client';

import { useState, useMemo } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getAllIngredients } from '@/lib/data/recipe-repository';
import type { Recipe, CuisineType, RegionalCuisine, MealType, DifficultyLevel, CookingMethod, FlavorPreference, CookingLevel, RecipeIngredient } from '@/types';

const CUISINE_LABELS: Record<CuisineType, string> = {
  chinese: '中餐', western: '西餐', asian_other: '亚洲', fusion: '混合',
};
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '早餐', lunch: '午餐', dinner: '晚餐',
};
const DIFF_LABELS: Record<DifficultyLevel, string> = {
  easy: '简单', medium: '中等', hard: '困难',
};
const METHOD_LABELS: Record<CookingMethod, string> = {
  stir_fry: '炒', braise: '红烧', stew: '炖', steam: '蒸', boil: '煮',
  cold_dish: '凉拌', deep_fry: '煎炸', roast: '烤', dry_pot: '干锅', soup: '汤', staple: '主食',
};
const FLAVOR_LABELS: Record<FlavorPreference, string> = {
  sour: '酸', sweet: '甜', bitter: '苦', spicy: '辣',
  salty: '咸', umami: '鲜', light: '清淡',
};

export function RecipeEditSheet({ initial, onClose }: {
  initial: Recipe | null;
  onClose: () => void;
}) {
  const { upsertCustomRecipe } = useAppStore();
  const isNew = !initial;

  const [nameZh, setNameZh] = useState(initial?.nameZh || '');
  const [nameEn, setNameEn] = useState(initial?.nameEn || '');
  const [cuisine, setCuisine] = useState<CuisineType>(initial?.cuisine || 'chinese');
  const [mealTypes, setMealTypes] = useState<MealType[]>(initial?.mealTypes || ['lunch','dinner']);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initial?.difficulty || 'easy');
  const [cookingMethod, setCookingMethod] = useState<CookingMethod>(initial?.cookingMethod || 'stir_fry');
  const [flavors, setFlavors] = useState<FlavorPreference[]>(initial?.flavors || []);
  const [prepTime, setPrepTime] = useState(initial?.prepTime || 10);
  const [cookTime, setCookTime] = useState(initial?.cookTime || 15);
  const [servings, setServings] = useState(initial?.servings || 2);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(initial?.ingredients || []);
  const [steps, setSteps] = useState<string[]>(initial?.steps || ['']);
  const [ingInput, setIngInput] = useState('');

  const allIng = useMemo(() => getAllIngredients(), []);
  const ingSuggestions = useMemo(() => {
    if (!ingInput.trim()) return [];
    const q = ingInput.toLowerCase();
    return allIng
      .filter(i => !ingredients.some(ri => ri.ingredientId === i.id))
      .filter(i => i.nameZh.includes(ingInput) || i.nameEn.toLowerCase().includes(q))
      .slice(0, 6);
  }, [ingInput, ingredients, allIng]);

  const handleSave = () => {
    if (!nameZh.trim()) { alert('请填写菜名'); return; }
    if (ingredients.length === 0) { alert('请至少添加一种食材'); return; }
    if (mealTypes.length === 0) { alert('请选择至少一个餐次'); return; }

    const recipe: Recipe = {
      id: initial?.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      nameZh: nameZh.trim(),
      nameEn: nameEn.trim() || nameZh.trim(),
      cuisine,
      regionalCuisine: (initial?.regionalCuisine || 'homestyle') as RegionalCuisine,
      cookingMethod,
      flavors,
      mealTypes,
      difficulty,
      minCookingLevel: (initial?.minCookingLevel || 'basic') as CookingLevel,
      prepTime,
      cookTime,
      servings,
      ingredients,
      steps: steps.filter(s => s.trim()),
      tags: initial?.tags || [],
      status: 'reviewed',
      isCustom: true,
      customCreatedAt: initial?.customCreatedAt || new Date().toISOString(),
    };
    upsertCustomRecipe(recipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[95dvh] sm:max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className="font-semibold">{isNew ? '新建菜谱' : '编辑菜谱'}</h2>
          <button onClick={onClose} className="text-muted"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 名称 */}
          <div>
            <label className="text-xs text-muted block mb-1">菜名 <span className="text-danger">*</span></label>
            <input type="text" value={nameZh} onChange={e => setNameZh(e.target.value)}
              placeholder="如: 我家私房红烧肉"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">英文名 (可选)</label>
            <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)}
              placeholder="如: Family Braised Pork"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background" />
          </div>

          {/* 菜系 */}
          <div>
            <label className="text-xs text-muted block mb-1">菜系</label>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(CUISINE_LABELS) as CuisineType[]).map(k => (
                <Chip key={k} active={cuisine === k} onClick={() => setCuisine(k)}>{CUISINE_LABELS[k]}</Chip>
              ))}
            </div>
          </div>

          {/* 餐次 */}
          <div>
            <label className="text-xs text-muted block mb-1">适合餐次 (多选)</label>
            <div className="flex gap-1">
              {(Object.keys(MEAL_LABELS) as MealType[]).map(k => (
                <Chip key={k} active={mealTypes.includes(k)} onClick={() => {
                  setMealTypes(mealTypes.includes(k) ? mealTypes.filter(x => x !== k) : [...mealTypes, k]);
                }}>{MEAL_LABELS[k]}</Chip>
              ))}
            </div>
          </div>

          {/* 做法 */}
          <div>
            <label className="text-xs text-muted block mb-1">做法</label>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(METHOD_LABELS) as CookingMethod[]).map(k => (
                <Chip key={k} active={cookingMethod === k} onClick={() => setCookingMethod(k)}>{METHOD_LABELS[k]}</Chip>
              ))}
            </div>
          </div>

          {/* 难度 */}
          <div>
            <label className="text-xs text-muted block mb-1">难度</label>
            <div className="flex gap-1">
              {(Object.keys(DIFF_LABELS) as DifficultyLevel[]).map(k => (
                <Chip key={k} active={difficulty === k} onClick={() => setDifficulty(k)}>{DIFF_LABELS[k]}</Chip>
              ))}
            </div>
          </div>

          {/* 口味 */}
          <div>
            <label className="text-xs text-muted block mb-1">口味标签 (多选)</label>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(FLAVOR_LABELS) as FlavorPreference[]).map(k => (
                <Chip key={k} active={flavors.includes(k)} onClick={() => {
                  setFlavors(flavors.includes(k) ? flavors.filter(x => x !== k) : [...flavors, k]);
                }}>{FLAVOR_LABELS[k]}</Chip>
              ))}
            </div>
          </div>

          {/* 时间 + 份数 */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted block mb-1">备料(分)</label>
              <input type="number" value={prepTime} onChange={e => setPrepTime(Number(e.target.value) || 0)}
                className="w-full border border-border rounded px-2 py-1.5 text-sm bg-background" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">烹饪(分)</label>
              <input type="number" value={cookTime} onChange={e => setCookTime(Number(e.target.value) || 0)}
                className="w-full border border-border rounded px-2 py-1.5 text-sm bg-background" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">几人份</label>
              <input type="number" value={servings} onChange={e => setServings(Number(e.target.value) || 1)}
                className="w-full border border-border rounded px-2 py-1.5 text-sm bg-background" />
            </div>
          </div>

          {/* 食材 */}
          <div>
            <label className="text-xs text-muted block mb-1">食材 <span className="text-danger">*</span></label>
            <div className="space-y-1 mb-2">
              {ingredients.map((ri, i) => {
                const ing = allIng.find(x => x.id === ri.ingredientId);
                return (
                  <div key={i} className="flex items-center gap-2 bg-background rounded p-1.5">
                    <span className="text-sm flex-1">{ing?.nameZh || ri.ingredientId}</span>
                    <input
                      type="number"
                      value={ri.amount}
                      onChange={e => {
                        const next = [...ingredients];
                        next[i] = { ...ri, amount: Number(e.target.value) || 0 };
                        setIngredients(next);
                      }}
                      className="w-16 border border-border rounded px-1 py-0.5 text-xs"
                    />
                    <select
                      value={ri.unit}
                      onChange={e => {
                        const next = [...ingredients];
                        next[i] = { ...ri, unit: e.target.value };
                        setIngredients(next);
                      }}
                      className="border border-border rounded px-1 py-0.5 text-xs bg-card"
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="个">个</option>
                      <option value="片">片</option>
                      <option value="勺">勺</option>
                      <option value="把">把</option>
                    </select>
                    <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="text-muted hover:text-danger">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="relative">
              <input
                type="text"
                value={ingInput}
                onChange={e => setIngInput(e.target.value)}
                placeholder="搜索食材添加..."
                className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background"
              />
              {ingSuggestions.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 bg-card border border-border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                  {ingSuggestions.map(ing => (
                    <button
                      key={ing.id}
                      onClick={() => {
                        setIngredients([...ingredients, { ingredientId: ing.id, amount: 100, unit: 'g' }]);
                        setIngInput('');
                      }}
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

          {/* 做法步骤 */}
          <div>
            <label className="text-xs text-muted block mb-1">做法步骤</label>
            <div className="space-y-1">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-xs text-muted pt-2 w-5">{i + 1}.</span>
                  <textarea
                    value={step}
                    onChange={e => {
                      const next = [...steps];
                      next[i] = e.target.value;
                      setSteps(next);
                    }}
                    rows={2}
                    placeholder="描述这一步..."
                    className="flex-1 border border-border rounded px-2 py-1 text-sm bg-background resize-none"
                  />
                  {steps.length > 1 && (
                    <button onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="text-muted hover:text-danger pt-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setSteps([...steps, ''])} className="mt-1 flex items-center gap-1 text-xs text-primary">
              <Plus className="w-3 h-3" /> 添加步骤
            </button>
          </div>
        </div>

        {/* 保存 */}
        <div className="p-3 border-t border-border flex-shrink-0 bg-card flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm">
            取消
          </button>
          <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition">
            <Save className="w-4 h-4" /> 保存
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded-full text-xs border transition ${
        active ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary/50'
      }`}
    >
      {children}
    </button>
  );
}
