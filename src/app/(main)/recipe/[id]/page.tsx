'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flame, Clock, DollarSign, ShoppingCart, Check, ChefHat, ChevronLeft, ChevronRight, X, Share2, Copy, CheckCheck, CalendarPlus, Edit3 } from 'lucide-react';
import { AddToPlanSheet } from '@/components/recipe/add-to-plan-sheet';
import { getRecipe, calcRecipeNutrition, calcRecipeCost } from '@/lib/nutrition/calculator';
import { getIngredient } from '@/lib/data/recipe-repository';
import { useAppStore, getPreferenceScore } from '@/lib/store';
import { NutritionBadges, PerServingPanel } from '@/components/recipe/nutrition-badges';
import { savePendingRecipeEdit } from '@/lib/supabase/pending';
import type { DifficultyLevel, CookingMethod, Recipe } from '@/types';

const DIFF_LABELS: Record<DifficultyLevel, string> = { easy: '简单', medium: '中等', hard: '困难' };
const METHOD_LABELS: Record<CookingMethod, string> = {
  stir_fry: '炒菜', braise: '红烧/卤', stew: '炖/煲', steam: '蒸', boil: '煮/汆',
  cold_dish: '凉拌', deep_fry: '炸/煎', roast: '烤/焗', dry_pot: '干锅/铁板', soup: '汤羹', staple: '主食',
};

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { shoppingList, addRecipeToShoppingList, removeRecipeFromShoppingList, recordAction, profile } = useAppStore();
  const [cookingMode, setCookingMode] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showAddToPlan, setShowAddToPlan] = useState(false);
  const [showEditSuggest, setShowEditSuggest] = useState(false);
  const [editSubmitState, setEditSubmitState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  // 支持 ?cook=1 自动开烹饪模式（菜谱库点"开始烹饪"跳转）
  useEffect(() => {
    if (searchParams.get('cook') === '1') setCookingMode(true);
  }, [searchParams]);

  const recipeId = decodeURIComponent(params.id as string);
  // 先查用户自定义菜谱，再查内置菜谱
  const customRecipe = (profile.customRecipes || []).find(r => r.id === recipeId);
  const recipe = customRecipe || getRecipe(recipeId);
  if (!recipe) return <div className="text-center py-16 text-muted">菜谱不存在</div>;

  const nutr = calcRecipeNutrition(recipe);
  const cost = calcRecipeCost(recipe);
  const perServing = Math.round(nutr.totalCalories / recipe.servings);
  const isInList = shoppingList?.items.some(i => i.fromRecipes.includes(recipe.nameZh));
  const prefScore = getPreferenceScore(recipeId);

  const total = nutr.protein + nutr.fat + nutr.carbs || 1;
  const pP = Math.round((nutr.protein / total) * 100);
  const fP = Math.round((nutr.fat / total) * 100);
  const cP = 100 - pP - fP;

  return (
    <div className="space-y-4 pb-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> 返回菜谱
      </button>

      {/* 标题 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{recipe.nameZh}</h1>
          <p className="text-sm text-muted">{recipe.nameEn}</p>
          {prefScore > 5 && <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">常做的菜</span>}
          {prefScore > 0 && prefScore <= 5 && <span className="inline-block mt-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">做过几次</span>}
          {prefScore < -3 && <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">不太喜欢</span>}
        </div>
        {/* 用户自定义菜谱不需要提建议 (用户可直接编辑自己的) */}
        {!customRecipe && (
          <button
            onClick={() => setShowEditSuggest(true)}
            title="提交编辑建议 (经审批后生效)"
            className="flex-shrink-0 flex items-center gap-1 px-2 py-1 border border-border rounded-lg text-xs text-muted hover:border-primary hover:text-primary transition"
          >
            <Edit3 className="w-3.5 h-3.5" /> 建议修改
          </button>
        )}
      </div>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2">
        <Tag label={METHOD_LABELS[recipe.cookingMethod] || recipe.cookingMethod} />
        <Tag label={DIFF_LABELS[recipe.difficulty]} />
        <Tag label={`${recipe.prepTime + recipe.cookTime}分钟`} />
        <Tag label={`${recipe.servings}人份`} />
        {recipe.tags?.map(t => <Tag key={t} label={t} />)}
      </div>

      {/* 健康标签 — 警告(红) + 标记(橙) + 亮点(绿) + 过敏原(琥珀) */}
      <NutritionBadges recipe={recipe} />

      {/* 营养概览 - calorieEnabled=false 时整块隐藏 */}
      {profile.calorieEnabled !== false && (
        <>
          {/* 优先用预计算的 perServing 数据,显示更详细的"每份"营养面板 */}
          {recipe.perServing ? (
            <>
              <PerServingPanel recipe={recipe} />
              <div className="grid grid-cols-2 gap-2 text-xs text-muted">
                <span>原配方 {recipe.servings} 人份 · 总 {Math.round(nutr.totalCalories)} kcal</span>
                <span className="text-right">预估成本 ${cost.toFixed(2)} · {recipe.prepTime + recipe.cookTime} 分钟</span>
              </div>
            </>
          ) : (
            // 回退到 runtime 计算(老菜谱 / 自定义未跑过 enrich)
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="grid grid-cols-4 gap-2 text-center mb-3">
                <div>
                  <p className="text-xl font-bold text-accent">{Math.round(nutr.totalCalories)}</p>
                  <p className="text-xs text-muted">kcal/总</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-accent">{perServing}</p>
                  <p className="text-xs text-muted">kcal/人</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">${cost.toFixed(2)}</p>
                  <p className="text-xs text-muted">预估成本</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{recipe.prepTime + recipe.cookTime}</p>
                  <p className="text-xs text-muted">分钟</p>
                </div>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden mb-2">
                <div className="bg-blue-400" style={{ width: `${pP}%` }} />
                <div className="bg-yellow-400" style={{ width: `${fP}%` }} />
                <div className="bg-green-400" style={{ width: `${cP}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>蛋白 {nutr.protein.toFixed(1)}g ({pP}%)</span>
                <span>脂肪 {nutr.fat.toFixed(1)}g ({fP}%)</span>
                <span>碳水 {nutr.carbs.toFixed(1)}g ({cP}%)</span>
              </div>
              <p className="text-[10px] text-muted mt-1.5">原配方 {recipe.servings} 人份共 {Math.round(nutr.totalCalories)} kcal · 每人 {perServing} kcal</p>
            </div>
          )}
        </>
      )}

      {/* 食材 */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3">食材清单</h3>
        <div className="space-y-2">
          {recipe.ingredients.map(ri => {
            const ing = getIngredient(ri.ingredientId);
            return (
              <Link key={ri.ingredientId} href={`/ingredient/${ri.ingredientId}`}
                className="flex justify-between items-center text-sm py-1 hover:text-primary transition">
                <span>{ing?.nameZh || ri.ingredientId}</span>
                <span className="text-muted">{ri.amount} {ri.unit}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 主操作: 加入规划 + 开始烹饪 */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setShowAddToPlan(true)}
          className="flex items-center justify-center gap-1.5 py-2.5 border border-primary text-primary rounded-lg text-sm hover:bg-primary/5 transition">
          <CalendarPlus className="w-4 h-4" /> 加入规划
        </button>
        <button onClick={() => setCookingMode(true)}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition">
          <ChefHat className="w-4 h-4" /> 开始烹饪
        </button>
      </div>

      {/* 步骤 */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3">做法步骤</h3>
        <ol className="space-y-2">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">{i + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 烹饪模式 */}
      {cookingMode && (
        <CookingMode
          recipeName={recipe.nameZh}
          steps={recipe.steps}
          ingredients={recipe.ingredients.map(ri => {
            const ing = getIngredient(ri.ingredientId);
            return `${ing?.nameZh || ri.ingredientId} ${ri.amount}${ri.unit}`;
          })}
          onClose={() => setCookingMode(false)}
        />
      )}

      {/* 底部操作 */}
      <div className="flex gap-3">
        <button onClick={() => {
          if (isInList) { removeRecipeFromShoppingList(recipe.id); }
          else { addRecipeToShoppingList(recipe.id, profile.familySize); recordAction(recipe.id, 'added_to_list'); }
        }}
          className={`flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition ${
            isInList ? 'bg-primary/10 text-primary border border-primary' : 'bg-primary text-white'
          }`}>
          {isInList ? <><Check className="w-4 h-4" /> 已加入清单</> : <><ShoppingCart className="w-4 h-4" /> 加入清单</>}
        </button>
        <button onClick={() => setShowShare(true)}
          className="px-4 py-3 rounded-lg border border-border text-muted hover:text-primary hover:border-primary transition">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* 分享弹窗 */}
      {showShare && (
        <ShareModal
          recipe={recipe}
          nutrition={nutr}
          cost={cost}
          perServing={perServing}
          onClose={() => setShowShare(false)}
        />
      )}

      {showAddToPlan && (
        <AddToPlanSheet recipe={recipe} onClose={() => setShowAddToPlan(false)} />
      )}

      {/* 建议修改 弹窗 (提交后进入审批队列) */}
      {showEditSuggest && (
        <EditSuggestModal
          recipe={recipe}
          submitState={editSubmitState}
          onSubmit={async (edited, reason) => {
            setEditSubmitState('submitting');
            const ok = await savePendingRecipeEdit(recipe.id, recipe.nameZh, edited, reason);
            setEditSubmitState(ok ? 'done' : 'error');
            if (ok) setTimeout(() => { setShowEditSuggest(false); setEditSubmitState('idle'); }, 1500);
          }}
          onClose={() => { setShowEditSuggest(false); setEditSubmitState('idle'); }}
        />
      )}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return <span className="text-xs bg-background px-2 py-1 rounded-full">{label}</span>;
}

/** 分享弹窗 */
function ShareModal({ recipe, nutrition, cost, perServing, onClose }: {
  recipe: { id: string; nameZh: string; nameEn: string; ingredients: { ingredientId: string; amount: number; unit: string }[]; steps: string[]; servings: number; prepTime: number; cookTime: number };
  nutrition: { totalCalories: number; protein: number; fat: number; carbs: number };
  cost: number;
  perServing: number;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  // 生成纯文本菜谱
  const generateText = () => {
    const ings = recipe.ingredients.map(ri => {
      const ing = getIngredient(ri.ingredientId);
      return `  ${ing?.nameZh || ri.ingredientId} ${ri.amount}${ri.unit}`;
    }).join('\n');

    const steps = recipe.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n');

    return `【${recipe.nameZh}】${recipe.nameEn}
${recipe.servings}人份 · ${recipe.prepTime + recipe.cookTime}分钟 · ${perServing}kcal/人

食材:
${ings}

做法:
${steps}

营养(总): ${nutrition.totalCalories}kcal · 蛋白${nutrition.protein}g · 脂肪${nutrition.fat}g · 碳水${nutrition.carbs}g
预估成本: $${cost.toFixed(2)} NZD

—— 来自 DailyBuy 智能买菜规划`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: recipe.nameZh,
        text: generateText(),
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">分享菜谱</h3>
          <button onClick={onClose} className="text-muted"><X className="w-5 h-5" /></button>
        </div>

        {/* 预览 */}
        <div className="bg-background rounded-lg p-3 text-xs max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
          {generateText()}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm hover:border-primary transition">
            {copied ? <><CheckCheck className="w-4 h-4 text-primary" /> 已复制</> : <><Copy className="w-4 h-4" /> 复制文本</>}
          </button>
          <button onClick={handleNativeShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition">
            <Share2 className="w-4 h-4" /> 分享
          </button>
        </div>
      </div>
    </div>
  );
}

/** 烹饪模式 - 全屏大字步骤展示 */
function CookingMode({ recipeName, steps, ingredients, onClose }: {
  recipeName: string;
  steps: string[];
  ingredients: string[];
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = 食材准备页
  const totalSteps = steps.length;

  // 键盘控制: 左右箭头翻页, ESC退出
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      setCurrentStep(s => Math.min(totalSteps - 1, s + 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setCurrentStep(s => Math.max(-1, s - 1));
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [totalSteps, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    // 锁定滚动
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  // 触摸滑动
  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      if (diff < 0) setCurrentStep(s => Math.min(totalSteps - 1, s + 1)); // 左滑下一步
      else setCurrentStep(s => Math.max(-1, s - 1)); // 右滑上一步
    }
  };

  const isFirst = currentStep === -1;
  const isLast = currentStep === totalSteps - 1;
  const progress = ((currentStep + 2) / (totalSteps + 1)) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-foreground text-background flex flex-col"
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      {/* 顶栏 */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm opacity-70">{recipeName}</span>
        <button onClick={onClose} className="p-2 hover:opacity-70 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 进度条 */}
      <div className="h-1 bg-background/20 mx-4 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* 主内容 */}
      <div className="flex-1 flex items-center justify-center px-8">
        {isFirst ? (
          // 食材准备页
          <div className="text-center max-w-md">
            <p className="text-lg opacity-50 mb-4">准备食材</p>
            <div className="space-y-2 text-left">
              {ingredients.map((ing, i) => (
                <p key={i} className="text-xl">{ing}</p>
              ))}
            </div>
          </div>
        ) : (
          // 步骤页
          <div className="text-center max-w-lg">
            <p className="text-6xl font-bold text-primary mb-8">{currentStep + 1}</p>
            <p className="text-2xl leading-relaxed">{steps[currentStep]}</p>
          </div>
        )}
      </div>

      {/* 底栏 */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => setCurrentStep(s => Math.max(-1, s - 1))}
          disabled={isFirst}
          className="flex items-center gap-1 text-sm opacity-70 disabled:opacity-20 transition">
          <ChevronLeft className="w-5 h-5" /> 上一步
        </button>

        <span className="text-xs opacity-50">
          {isFirst ? '准备食材' : `${currentStep + 1} / ${totalSteps}`}
          <span className="block text-[10px] mt-0.5">左右滑动 或 方向键翻页</span>
        </span>

        {isLast ? (
          <button onClick={onClose}
            className="flex items-center gap-1 text-sm bg-primary text-white px-4 py-2 rounded-lg">
            完成
          </button>
        ) : (
          <button
            onClick={() => setCurrentStep(s => Math.min(totalSteps - 1, s + 1))}
            className="flex items-center gap-1 text-sm opacity-70 transition">
            {isFirst ? '开始' : '下一步'} <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/** 建议修改弹窗: 用户可修改关键字段, 提交到审批队列 */
function EditSuggestModal({ recipe, submitState, onSubmit, onClose }: {
  recipe: Recipe;
  submitState: 'idle' | 'submitting' | 'done' | 'error';
  onSubmit: (edited: Partial<Recipe>, reason: string) => void;
  onClose: () => void;
}) {
  const [nameZh, setNameZh] = useState(recipe.nameZh);
  const [nameEn, setNameEn] = useState(recipe.nameEn);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(recipe.difficulty);
  const [prepTime, setPrepTime] = useState(recipe.prepTime);
  const [cookTime, setCookTime] = useState(recipe.cookTime);
  const [servings, setServings] = useState(recipe.servings);
  const [description, setDescription] = useState(recipe.description || '');
  const [steps, setSteps] = useState<string>((recipe.steps || []).join('\n'));
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    // 只提交有改动的字段
    const edited: Partial<Recipe> = {};
    if (nameZh !== recipe.nameZh) edited.nameZh = nameZh;
    if (nameEn !== recipe.nameEn) edited.nameEn = nameEn;
    if (difficulty !== recipe.difficulty) edited.difficulty = difficulty;
    if (prepTime !== recipe.prepTime) edited.prepTime = prepTime;
    if (cookTime !== recipe.cookTime) edited.cookTime = cookTime;
    if (servings !== recipe.servings) edited.servings = servings;
    if (description !== (recipe.description || '')) edited.description = description;
    const newSteps = steps.split('\n').map(s => s.trim()).filter(Boolean);
    if (JSON.stringify(newSteps) !== JSON.stringify(recipe.steps || [])) edited.steps = newSteps;

    if (Object.keys(edited).length === 0) {
      alert('没有任何修改');
      return;
    }
    onSubmit(edited, reason);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Edit3 className="w-4 h-4 text-primary" /> 建议修改此菜谱</h3>
          <button onClick={onClose} className="text-muted"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-muted">提交后将进入管理员审批队列, 批准后此菜谱自动更新。</p>

          <div>
            <label className="text-xs text-muted block mb-1">中文名</label>
            <input type="text" value={nameZh} onChange={e => setNameZh(e.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm bg-background" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">英文名</label>
            <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm bg-background" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">描述</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full border border-border rounded px-3 py-2 text-sm bg-background" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted block mb-1">难度</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full border border-border rounded px-2 py-2 text-sm bg-background">
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">准备(分)</label>
              <input type="number" value={prepTime} onChange={e => setPrepTime(Number(e.target.value) || 0)}
                className="w-full border border-border rounded px-2 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">烹饪(分)</label>
              <input type="number" value={cookTime} onChange={e => setCookTime(Number(e.target.value) || 0)}
                className="w-full border border-border rounded px-2 py-2 text-sm bg-background" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">几人份</label>
            <input type="number" value={servings} onChange={e => setServings(Number(e.target.value) || 1)}
              className="w-full border border-border rounded px-3 py-2 text-sm bg-background" min={1} max={12} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">步骤(每行一步)</label>
            <textarea value={steps} onChange={e => setSteps(e.target.value)} rows={6}
              className="w-full border border-border rounded px-3 py-2 text-sm bg-background font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">修改原因(可选)</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
              placeholder="例: 用时更准确/步骤更清晰/菜名应改为XX"
              className="w-full border border-border rounded px-3 py-2 text-sm bg-background" />
          </div>
        </div>
        <div className="p-4 border-t border-border flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm" disabled={submitState === 'submitting'}>
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitState === 'submitting' || submitState === 'done'}
            className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
          >
            {submitState === 'submitting' ? '提交中...' : submitState === 'done' ? '✓ 已提交审批' : submitState === 'error' ? '❌ 失败, 重试' : '提交建议'}
          </button>
        </div>
      </div>
    </div>
  );
}
