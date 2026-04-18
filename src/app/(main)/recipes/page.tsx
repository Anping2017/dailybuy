'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, Star, Sparkles, ChevronRight, Clock, X, Edit, Trash2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getAllRecipes } from '@/lib/data/recipe-repository';
import type { Recipe, CuisineType, MealType, DifficultyLevel, CookingMethod, FlavorPreference, RegionalCuisine } from '@/types';
import { RecipeDetailSheet } from '@/components/recipe/recipe-detail-sheet';
import { AddToPlanSheet } from '@/components/recipe/add-to-plan-sheet';
import { RecipeEditSheet } from '@/components/recipe/recipe-edit-sheet';

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

type Tab = 'all' | 'favorites' | 'mine';

export default function RecipesPage() {
  const { profile, toggleFavorite } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterCuisine, setFilterCuisine] = useState<CuisineType | 'all'>('all');
  const [filterMeal, setFilterMeal] = useState<MealType | 'all'>('all');
  const [filterMethod, setFilterMethod] = useState<CookingMethod | 'all'>('all');
  const [filterDiff, setFilterDiff] = useState<DifficultyLevel | 'all'>('all');
  const [filterFlavor, setFilterFlavor] = useState<FlavorPreference | 'all'>('all');

  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [addToPlanRecipe, setAddToPlanRecipe] = useState<Recipe | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | 'new' | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const allCombined: Recipe[] = useMemo(() => {
    if (!mounted) return [];
    return [...(profile.customRecipes || []), ...getAllRecipes()];
  }, [mounted, profile.customRecipes]);

  const favoriteIds = useMemo(() => new Set(profile.favoriteRecipes || []), [profile.favoriteRecipes]);

  const filtered = useMemo(() => {
    if (!mounted) return [];
    let pool = allCombined;
    if (tab === 'favorites') pool = pool.filter(r => favoriteIds.has(r.id));
    if (tab === 'mine') pool = pool.filter(r => r.isCustom);

    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(r => r.nameZh.toLowerCase().includes(q) || r.nameEn.toLowerCase().includes(q));
    }
    if (filterCuisine !== 'all') pool = pool.filter(r => r.cuisine === filterCuisine);
    if (filterMeal !== 'all') pool = pool.filter(r => r.mealTypes.includes(filterMeal));
    if (filterMethod !== 'all') pool = pool.filter(r => r.cookingMethod === filterMethod);
    if (filterDiff !== 'all') pool = pool.filter(r => r.difficulty === filterDiff);
    if (filterFlavor !== 'all') pool = pool.filter(r => r.flavors.includes(filterFlavor));

    return pool.slice(0, 200);  // 限制渲染数
  }, [mounted, allCombined, favoriteIds, tab, search, filterCuisine, filterMeal, filterMethod, filterDiff, filterFlavor]);

  if (!mounted) return null;

  const activeFilters = [
    filterCuisine !== 'all', filterMeal !== 'all', filterMethod !== 'all',
    filterDiff !== 'all', filterFlavor !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterCuisine('all'); setFilterMeal('all'); setFilterMethod('all');
    setFilterDiff('all'); setFilterFlavor('all');
  };

  return (
    <div className="space-y-3 pb-8">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">菜谱库</h1>
        <div className="flex gap-2">
          <Link href="/search" className="flex items-center gap-1 text-xs px-3 py-1.5 border border-border rounded-lg hover:border-primary hover:text-primary transition">
            <Sparkles className="w-3.5 h-3.5" /> 智能搜
          </Link>
          <button
            onClick={() => setEditRecipe('new')}
            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            <Plus className="w-3.5 h-3.5" /> 新建
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['all','favorites','mine'] as Tab[]).map(t => {
          const label = t === 'all' ? `全部 (${allCombined.length})`
            : t === 'favorites' ? `⭐ 收藏 (${(profile.favoriteRecipes || []).length})`
            : `我的 (${(profile.customRecipes || []).length})`;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm border-b-2 -mb-px transition ${
                tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 收藏开关提示（仅在收藏 tab）*/}
      {tab === 'favorites' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-amber-800">
              {profile.favoritesInRandom !== false ? '✓ 收藏菜谱会优先出现在本周规划' : '⊘ 收藏不参与随机推荐'}
            </span>
            <Link href="/profile" className="text-primary hover:underline">设置</Link>
          </div>
        </div>
      )}

      {/* 搜索 + 筛选 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索菜名..."
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-card focus:border-primary outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`relative flex items-center gap-1 px-3 py-2 border rounded-lg text-sm transition ${
            activeFilters > 0 || showFilter ? 'border-primary text-primary bg-primary/5' : 'border-border'
          }`}
        >
          <Filter className="w-4 h-4" />
          {activeFilters > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full text-[10px] flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* 筛选面板 */}
      {showFilter && (
        <div className="bg-card border border-border rounded-lg p-3 space-y-3">
          <FilterRow label="菜系">
            <FilterChip active={filterCuisine === 'all'} onClick={() => setFilterCuisine('all')}>全部</FilterChip>
            {(Object.keys(CUISINE_LABELS) as CuisineType[]).map(k => (
              <FilterChip key={k} active={filterCuisine === k} onClick={() => setFilterCuisine(k)}>{CUISINE_LABELS[k]}</FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="餐次">
            <FilterChip active={filterMeal === 'all'} onClick={() => setFilterMeal('all')}>全部</FilterChip>
            {(Object.keys(MEAL_LABELS) as MealType[]).map(k => (
              <FilterChip key={k} active={filterMeal === k} onClick={() => setFilterMeal(k)}>{MEAL_LABELS[k]}</FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="做法">
            <FilterChip active={filterMethod === 'all'} onClick={() => setFilterMethod('all')}>全部</FilterChip>
            {(Object.keys(METHOD_LABELS) as CookingMethod[]).map(k => (
              <FilterChip key={k} active={filterMethod === k} onClick={() => setFilterMethod(k)}>{METHOD_LABELS[k]}</FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="难度">
            <FilterChip active={filterDiff === 'all'} onClick={() => setFilterDiff('all')}>全部</FilterChip>
            {(Object.keys(DIFF_LABELS) as DifficultyLevel[]).map(k => (
              <FilterChip key={k} active={filterDiff === k} onClick={() => setFilterDiff(k)}>{DIFF_LABELS[k]}</FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="口味">
            <FilterChip active={filterFlavor === 'all'} onClick={() => setFilterFlavor('all')}>全部</FilterChip>
            {(Object.keys(FLAVOR_LABELS) as FlavorPreference[]).map(k => (
              <FilterChip key={k} active={filterFlavor === k} onClick={() => setFilterFlavor(k)}>{FLAVOR_LABELS[k]}</FilterChip>
            ))}
          </FilterRow>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="text-xs text-primary hover:underline">清除筛选</button>
          )}
        </div>
      )}

      {/* 列表 */}
      <p className="text-xs text-muted">{filtered.length} 道菜{filtered.length === 200 && '（已限 200）'}</p>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p>没有匹配的菜谱</p>
          {tab === 'favorites' && <p className="text-xs mt-1">点击菜谱旁的 ⭐ 加入收藏</p>}
          {tab === 'mine' && <p className="text-xs mt-1">点右上角"+ 新建"创建你自己的菜谱</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favoriteIds.has(recipe.id)}
              onToggleFav={() => toggleFavorite(recipe.id)}
              onClick={() => setDetailRecipe(recipe)}
            />
          ))}
        </div>
      )}

      {/* 详情弹窗 */}
      {detailRecipe && (
        <RecipeDetailSheet
          recipe={detailRecipe}
          isFavorite={favoriteIds.has(detailRecipe.id)}
          onClose={() => setDetailRecipe(null)}
          onToggleFav={() => toggleFavorite(detailRecipe.id)}
          onAddToPlan={() => { setAddToPlanRecipe(detailRecipe); setDetailRecipe(null); }}
          onEdit={detailRecipe.isCustom ? () => { setEditRecipe(detailRecipe); setDetailRecipe(null); } : undefined}
        />
      )}

      {/* 添加到本周弹窗 */}
      {addToPlanRecipe && (
        <AddToPlanSheet
          recipe={addToPlanRecipe}
          onClose={() => setAddToPlanRecipe(null)}
        />
      )}

      {/* 编辑/新建菜谱弹窗 */}
      {editRecipe && (
        <RecipeEditSheet
          initial={editRecipe === 'new' ? null : editRecipe}
          onClose={() => setEditRecipe(null)}
        />
      )}
    </div>
  );
}

function RecipeCard({ recipe, isFavorite, onToggleFav, onClick }: {
  recipe: Recipe; isFavorite: boolean; onToggleFav: () => void; onClick: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:border-primary/50 transition flex items-start gap-3">
      <button onClick={onClick} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">{recipe.nameZh}</h3>
          {recipe.isCustom && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">自定义</span>}
        </div>
        <p className="text-xs text-muted mt-0.5">{recipe.nameEn}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted">
          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {recipe.prepTime + recipe.cookTime}分钟</span>
          <span>{METHOD_LABELS[recipe.cookingMethod] || recipe.cookingMethod}</span>
          <span>{DIFF_LABELS[recipe.difficulty]}</span>
          <span>{recipe.flavors.slice(0,2).map(f => FLAVOR_LABELS[f]).join('/')}</span>
        </div>
      </button>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <button
          onClick={onToggleFav}
          title={isFavorite ? '取消收藏' : '收藏'}
          className={`p-1 rounded transition ${isFavorite ? 'text-yellow-500' : 'text-muted hover:text-yellow-500'}`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button onClick={onClick} className="text-muted">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
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
