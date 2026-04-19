/**
 * Zustand 全局状态管理
 * 数据持久化到 localStorage，未来可迁移到 Supabase
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile, WeeklyPlan, ShoppingList, ShoppingItem,
  FamilyMember, MealSlot, CuisineType, MealType,
  Recipe, Ingredient, RecipeAction, RecipePreference, RecentAction,
  SwapReason, UserFeedback, SavedPlan,
} from '@/types';

interface AppState {
  // --- 用户档案 ---
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  addMember: (member: FamilyMember) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  removeMember: (id: string) => void;

  // --- 已有食材 ---
  ownedIngredients: string[];
  addOwnedIngredient: (id: string) => void;
  removeOwnedIngredient: (id: string) => void;

  // --- 周计划 ---
  weeklyPlan: WeeklyPlan | null;
  setWeeklyPlan: (plan: WeeklyPlan) => void;
  replaceSingleRecipe: (day: string, mealType: MealType, oldRecipeId: string, newRecipeId: string, role: string) => void;
  addRecipeToMeal: (day: string, mealType: MealType, recipeId: string, role: string) => void;
  removeMealSlot: (day: string, mealType: MealType) => void;

  // --- 采购清单 ---
  shoppingList: ShoppingList | null;
  setShoppingList: (list: ShoppingList) => void;
  addRecipeToShoppingList: (recipeId: string, servings: number) => void;
  removeRecipeFromShoppingList: (recipeId: string) => void;
  toggleOwned: (ingredientId: string) => void;
  togglePurchased: (ingredientId: string) => void;
  updateItemAmount: (ingredientId: string, amount: number) => void;
  updateItemActualPrice: (ingredientId: string, price: number) => void;
  removeShoppingItem: (ingredientId: string) => void;
  removeMultipleShoppingItems: (ids: string[]) => void;

  // --- 用户偏好学习 ---
  recipePreferences: Record<string, RecipePreference>;
  recentActions: RecentAction[];
  recordAction: (recipeId: string, action: RecipeAction, reason?: SwapReason) => void;

  // --- 细粒度反馈(需求3) ---
  userFeedback: UserFeedback;
  recordSwapReason: (recipeId: string, reason: SwapReason, recipe?: Recipe | null) => void;
  clearFeedback: () => void;

  // --- 菜谱库扩展 ---
  upsertCustomRecipe: (recipe: Recipe) => void;
  removeCustomRecipe: (id: string) => void;
  toggleFavorite: (recipeId: string) => void;

  // --- 保存的规划方案 ---
  savedPlans: SavedPlan[];
  saveCurrentPlan: (name: string, note?: string) => void;
  loadSavedPlan: (id: string) => void;
  deleteSavedPlan: (id: string) => void;

  // --- 引导状态 ---
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
}

const defaultProfile: UserProfile = {
  familySize: 1,
  members: [
    {
      id: 'member_1',
      name: '我',
      gender: 'male',
      ageGroup: 'young_adult',
      healthConditions: ['none'],
      dietaryRestrictions: [],
      dailyCalorieTarget: 2600,
    },
  ],
  cuisinePreference: ['chinese'],
  regionalPreference: [],
  flavorPreference: [],
  preferredCookingMethods: [],
  staplePreference: ['any'],
  stapleMode: 'off',
  includeSoup: false,
  includeFruit: false,
  includeColdDish: false,
  cookingLevel: 'intermediate',
  acceptedDifficulty: [],
  recommendMode: 'basic',
  autoAddToShoppingList: true,
  planDays: 7,
  weeklyBudget: 150,
  mealsPerDay: ['lunch', 'dinner'],
  customMealComposition: {
    enabled: false,
    breakfast: { meatCount: 0, vegCount: 1, soupCount: 0, stapleCount: 1, coldDishCount: 0 },
    lunch:     { meatCount: 1, vegCount: 1, soupCount: 0, stapleCount: 0, coldDishCount: 0 },
    dinner:    { meatCount: 1, vegCount: 1, soupCount: 0, stapleCount: 0, coldDishCount: 0 },
  },
  dailyFruitCount: 0,
  excludeIngredients: [],
  budgetEnabled: true,
  calorieEnabled: true,
  customRecipes: [],
  favoriteRecipes: [],
  favoritesInRandom: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      ownedIngredients: [],
      savedPlans: [],
      recipePreferences: {},
      recentActions: [],
      userFeedback: {
        dislikedIngredients: {},
        dislikedFlavors: {},
        inconvenientIngredients: {},
        complexityRejections: { count: 0, lastTime: 0 },
      },
      weeklyPlan: null,
      shoppingList: null,
      onboardingComplete: true,

      addOwnedIngredient: (id) =>
        set((s) => ({
          ownedIngredients: s.ownedIngredients.includes(id)
            ? s.ownedIngredients
            : [...s.ownedIngredients, id],
        })),

      removeOwnedIngredient: (id) =>
        set((s) => ({
          ownedIngredients: s.ownedIngredients.filter((x) => x !== id),
        })),

      setProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      addMember: (member) =>
        set((s) => ({
          profile: {
            ...s.profile,
            members: [...s.profile.members, member],
            familySize: s.profile.members.length + 1,
          },
        })),

      updateMember: (id, updates) =>
        set((s) => ({
          profile: {
            ...s.profile,
            members: s.profile.members.map((m) =>
              m.id === id ? { ...m, ...updates } : m
            ),
          },
        })),

      removeMember: (id) =>
        set((s) => ({
          profile: {
            ...s.profile,
            members: s.profile.members.filter((m) => m.id !== id),
            familySize: Math.max(1, s.profile.members.length - 1),
          },
        })),

      setWeeklyPlan: (plan) => set({ weeklyPlan: plan }),

      addRecipeToMeal: (day, mealType, recipeId, role) =>
        set((s) => {
          if (!s.weeklyPlan) return s;
          const slots = [...s.weeklyPlan.slots];
          const idx = slots.findIndex(slot => slot.day === day && slot.mealType === mealType);
          if (idx >= 0) {
            const slot = slots[idx];
            // 已存在则不重复添加
            if ((slot.recipes || []).some(m => m.recipeId === recipeId)) return s;
            slots[idx] = { ...slot, recipes: [...(slot.recipes || []), { recipeId, role: role as never }] };
          } else {
            slots.push({
              day: day as never,
              mealType,
              recipes: [{ recipeId, role: role as never }],
              servings: s.profile.familySize,
            });
          }
          return { weeklyPlan: { ...s.weeklyPlan, slots } };
        }),

      replaceSingleRecipe: (day, mealType, oldRecipeId, newRecipeId, role) =>
        set((s) => {
          if (!s.weeklyPlan) return s;
          const slots = s.weeklyPlan.slots.map(slot => {
            if (slot.day !== day || slot.mealType !== mealType) return slot;
            const recipes = (slot.recipes || []).map(mr =>
              mr.recipeId === oldRecipeId ? { ...mr, recipeId: newRecipeId } : mr
            );
            return { ...slot, recipes };
          });
          return { weeklyPlan: { ...s.weeklyPlan, slots } };
        }),

      removeMealSlot: (day, mealType) =>
        set((s) => {
          if (!s.weeklyPlan) return s;
          const slots = s.weeklyPlan.slots.filter(
            (slot) => !(slot.day === day && slot.mealType === mealType)
          );
          return { weeklyPlan: { ...s.weeklyPlan, slots } };
        }),

      setShoppingList: (list) => set({ shoppingList: list }),

      addRecipeToShoppingList: (recipeId, servings) =>
        set((s) => {
          // 动态导入避免循环依赖
          const { getRecipe, getIngredient } = require('@/lib/nutrition/calculator');
          const recipe = getRecipe(recipeId) as Recipe | undefined;
          if (!recipe) return s;

          const list = s.shoppingList || {
            id: `list_${Date.now()}`, weeklyPlanId: '', items: [],
            totalEstimatedCost: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          };

          const items = [...list.items];

          for (const ri of recipe.ingredients) {
            const ingredient = getIngredient(ri.ingredientId) as Ingredient | undefined;
            if (!ingredient) continue;

            // 食材按原配方量(不缩放) — 用户按菜谱做整份菜
            const amount = ri.amount;
            const existing = items.find(i => i.ingredientId === ri.ingredientId);

            if (existing) {
              existing.totalAmount += amount;
              existing.totalAmount = Math.round(existing.totalAmount);
              if (!existing.fromRecipes.includes(recipe.nameZh)) {
                existing.fromRecipes.push(recipe.nameZh);
              }
              // 重新计算价格
              const unitG = getUnitGrams(ingredient.unit);
              existing.estimatedPrice = Math.round((existing.totalAmount / unitG) * ingredient.priceNZD * 100) / 100;
            } else {
              const unitG = getUnitGrams(ingredient.unit);
              items.push({
                ingredientId: ri.ingredientId,
                ingredientName: ingredient.nameZh,
                ingredientNameEn: ingredient.nameEn,
                totalAmount: Math.round(amount),
                unit: ri.unit,
                estimatedPrice: Math.round((amount / unitG) * ingredient.priceNZD * 100) / 100,
                category: ingredient.category,
                isOwned: false,
                isPurchased: false,
                fromRecipes: [recipe.nameZh],
              });
            }
          }

          const totalEstimatedCost = items.filter(i => !i.isOwned).reduce((sum, i) => sum + i.estimatedPrice, 0);
          return {
            shoppingList: { ...list, items, totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100, updatedAt: new Date().toISOString() },
          };
        }),

      removeRecipeFromShoppingList: (recipeId) =>
        set((s) => {
          if (!s.shoppingList) return s;
          const { getRecipe } = require('@/lib/nutrition/calculator');
          const recipe = getRecipe(recipeId) as Recipe | undefined;
          if (!recipe) return s;

          let items = s.shoppingList.items.map(item => {
            const newFrom = item.fromRecipes.filter(r => r !== recipe.nameZh);
            if (newFrom.length === 0) return null; // 只被这道菜引用，删除
            return { ...item, fromRecipes: newFrom };
          }).filter(Boolean) as ShoppingItem[];

          const totalEstimatedCost = items.filter(i => !i.isOwned).reduce((sum, i) => sum + i.estimatedPrice, 0);
          return {
            shoppingList: { ...s.shoppingList, items, totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100, updatedAt: new Date().toISOString() },
          };
        }),

      toggleOwned: (ingredientId) =>
        set((s) => {
          if (!s.shoppingList) return s;
          const items = s.shoppingList.items.map((item) =>
            item.ingredientId === ingredientId
              ? { ...item, isOwned: !item.isOwned }
              : item
          );
          const totalEstimatedCost = items
            .filter((i) => !i.isOwned)
            .reduce((sum, i) => sum + i.estimatedPrice, 0);
          return {
            shoppingList: {
              ...s.shoppingList,
              items,
              totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      togglePurchased: (ingredientId) =>
        set((s) => {
          if (!s.shoppingList) return s;
          const items = s.shoppingList.items.map((item) =>
            item.ingredientId === ingredientId
              ? { ...item, isPurchased: !item.isPurchased }
              : item
          );
          return {
            shoppingList: {
              ...s.shoppingList,
              items,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      updateItemAmount: (ingredientId, amount) =>
        set((s) => {
          if (!s.shoppingList) return s;
          const items = s.shoppingList.items.map((item) =>
            item.ingredientId === ingredientId
              ? { ...item, totalAmount: amount }
              : item
          );
          return {
            shoppingList: { ...s.shoppingList, items, updatedAt: new Date().toISOString() },
          };
        }),

      updateItemActualPrice: (ingredientId, price) =>
        set((s) => {
          if (!s.shoppingList) return s;
          const items = s.shoppingList.items.map((item) =>
            item.ingredientId === ingredientId
              ? { ...item, actualPrice: price >= 0 ? price : undefined }
              : item
          );
          return {
            shoppingList: { ...s.shoppingList, items, updatedAt: new Date().toISOString() },
          };
        }),

      removeShoppingItem: (ingredientId) =>
        set((s) => {
          if (!s.shoppingList) return s;
          const items = s.shoppingList.items.filter(
            (item) => item.ingredientId !== ingredientId
          );
          const totalEstimatedCost = items
            .filter((i) => !i.isOwned)
            .reduce((sum, i) => sum + i.estimatedPrice, 0);
          return {
            shoppingList: {
              ...s.shoppingList,
              items,
              totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      removeMultipleShoppingItems: (ids) =>
        set((s) => {
          if (!s.shoppingList) return s;
          const idSet = new Set(ids);
          const items = s.shoppingList.items.filter((item) => !idSet.has(item.ingredientId));
          const totalEstimatedCost = items.filter((i) => !i.isOwned).reduce((sum, i) => sum + i.estimatedPrice, 0);
          return {
            shoppingList: { ...s.shoppingList, items, totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100, updatedAt: new Date().toISOString() },
          };
        }),

      recordAction: (recipeId, action, reason) =>
        set((s) => {
          // 权重: 如果是 rejected 但有温和原因，扣分减轻
          const baseWeights: Record<RecipeAction, number> = { accepted: 1, rejected: -3, swapped_in: 5, added_to_list: 2 };
          let actionWeight = baseWeights[action];
          if (action === 'rejected' && reason === 'just_want_different') actionWeight = 0;  // 只是想换一个不扣分
          if (action === 'rejected' && reason === 'inconvenient_ingredient') actionWeight = -1;  // 食材问题对菜谱本身扣分轻

          const prefs = { ...s.recipePreferences };
          const existing = prefs[recipeId] || { recipeId, score: 0, acceptCount: 0, rejectCount: 0, swapInCount: 0, addToListCount: 0, lastInteraction: 0 };

          // 冷却: 同一菜谱10分钟内同类行为不重复计分
          const TEN_MIN = 10 * 60 * 1000;
          const lastSameAction = s.recentActions.filter(a => a.recipeId === recipeId && a.action === action);
          if (lastSameAction.length > 0 && Date.now() - lastSameAction[lastSameAction.length - 1].timestamp < TEN_MIN) {
            // 冷却中，只记录事件不加分
            const recent = [...s.recentActions, { recipeId, action, reason, timestamp: Date.now() }];
            if (recent.length > 50) recent.shift();
            return { recentActions: recent };
          }

          const updated = { ...existing };
          updated.score = Math.max(-10, Math.min(50, updated.score + actionWeight));
          updated.lastInteraction = Date.now();
          if (action === 'accepted') updated.acceptCount++;
          if (action === 'rejected') updated.rejectCount++;
          if (action === 'swapped_in') updated.swapInCount++;
          if (action === 'added_to_list') updated.addToListCount++;
          prefs[recipeId] = updated;

          // 淘汰: 超300条时删最旧且分数接近0的
          const keys = Object.keys(prefs);
          if (keys.length > 300) {
            const removable = keys.filter(k => Math.abs(prefs[k].score) < 2)
              .sort((a, b) => prefs[a].lastInteraction - prefs[b].lastInteraction);
            for (const k of removable.slice(0, keys.length - 300)) delete prefs[k];
          }

          // recentActions FIFO 50条
          const recent = [...s.recentActions, { recipeId, action, reason, timestamp: Date.now() }];
          if (recent.length > 50) recent.shift();

          return { recipePreferences: prefs, recentActions: recent };
        }),

      recordSwapReason: (recipeId, reason, recipe) =>
        set((s) => {
          const now = Date.now();
          const fb = { ...s.userFeedback };
          const bump = (map: Record<string, { count: number; lastTime: number }>, key: string) => {
            map[key] = { count: (map[key]?.count || 0) + 1, lastTime: now };
          };

          if (reason === 'dislike_ingredient' && recipe) {
            fb.dislikedIngredients = { ...fb.dislikedIngredients };
            // 标记菜中主要食材(非调料)
            for (const ri of recipe.ingredients) {
              bump(fb.dislikedIngredients, ri.ingredientId);
            }
          }
          if (reason === 'dislike_flavor' && recipe) {
            fb.dislikedFlavors = { ...fb.dislikedFlavors };
            for (const f of recipe.flavors || []) {
              bump(fb.dislikedFlavors, f);
            }
          }
          if (reason === 'inconvenient_ingredient' && recipe) {
            fb.inconvenientIngredients = { ...fb.inconvenientIngredients };
            for (const ri of recipe.ingredients) {
              bump(fb.inconvenientIngredients, ri.ingredientId);
            }
          }
          if (reason === 'too_complex') {
            fb.complexityRejections = { count: fb.complexityRejections.count + 1, lastTime: now };
          }
          return { userFeedback: fb };
        }),

      clearFeedback: () =>
        set({
          userFeedback: {
            dislikedIngredients: {},
            dislikedFlavors: {},
            inconvenientIngredients: {},
            complexityRejections: { count: 0, lastTime: 0 },
          },
        }),

      // --- 菜谱库扩展 ---
      upsertCustomRecipe: (recipe) =>
        set((s) => {
          const list = s.profile.customRecipes || [];
          const idx = list.findIndex(r => r.id === recipe.id);
          const next = [...list];
          if (idx >= 0) next[idx] = { ...recipe, isCustom: true };
          else next.unshift({ ...recipe, isCustom: true, customCreatedAt: new Date().toISOString() });
          return { profile: { ...s.profile, customRecipes: next } };
        }),

      removeCustomRecipe: (id) =>
        set((s) => ({
          profile: {
            ...s.profile,
            customRecipes: (s.profile.customRecipes || []).filter(r => r.id !== id),
            // 同时移出收藏
            favoriteRecipes: (s.profile.favoriteRecipes || []).filter(rid => rid !== id),
          },
        })),

      toggleFavorite: (recipeId) =>
        set((s) => {
          const list = s.profile.favoriteRecipes || [];
          const next = list.includes(recipeId)
            ? list.filter(x => x !== recipeId)
            : [...list, recipeId];
          return { profile: { ...s.profile, favoriteRecipes: next } };
        }),

      // --- 保存的规划方案 ---
      saveCurrentPlan: (name, note) =>
        set((s) => {
          if (!s.weeklyPlan) return s;
          const saved: SavedPlan = {
            id: `saved_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: name.trim() || `方案 ${new Date().toLocaleDateString('zh-CN')}`,
            createdAt: new Date().toISOString(),
            weeklyPlan: s.weeklyPlan,
            shoppingList: s.shoppingList || undefined,
            note,
          };
          return { savedPlans: [saved, ...s.savedPlans] };
        }),

      loadSavedPlan: (id) =>
        set((s) => {
          const saved = s.savedPlans.find(p => p.id === id);
          if (!saved) return s;
          return {
            weeklyPlan: saved.weeklyPlan,
            shoppingList: saved.shoppingList || s.shoppingList,
          };
        }),

      deleteSavedPlan: (id) =>
        set((s) => ({ savedPlans: s.savedPlans.filter(p => p.id !== id) })),

      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
    }),
    {
      name: 'dailybuy-store',
      migrate: (persisted: unknown) => {
        const p = persisted as { profile?: { recommendMode?: string } } | null;
        // 兼容旧 recommendMode === 'ai'  → 'ai_online'
        if (p?.profile && p.profile.recommendMode === 'ai') {
          p.profile.recommendMode = 'ai_online';
        }
        // 'ai_queue' → 'ai_assist' (改名)
        if (p?.profile && p.profile.recommendMode === 'ai_queue') {
          p.profile.recommendMode = 'ai_assist';
        }
        return persisted;
      },
      version: 3,
    }
  )
);

/** 解析菜谱ID(包含静态库 + 用户自定义) */
export function resolveRecipe(id: string): Recipe | undefined {
  const custom = (useAppStore.getState().profile.customRecipes || []).find(r => r.id === id);
  if (custom) return custom;
  // 动态导入避免循环依赖
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getRecipe } = require('@/lib/data/recipe-repository') as typeof import('@/lib/data/recipe-repository');
  return getRecipe(id);
}

/** 获取菜谱偏好分(带60天半衰期时间衰减) */
export function getPreferenceScore(recipeId: string): number {
  const prefs = useAppStore.getState().recipePreferences;
  const pref = prefs[recipeId];
  if (!pref) return 0;

  const HALF_LIFE_DAYS = 60;
  const daysSince = (Date.now() - pref.lastInteraction) / 86400000;
  const decay = Math.pow(0.5, daysSince / HALF_LIFE_DAYS);
  const effective = pref.score * decay;

  return Math.abs(effective) < 0.5 ? 0 : Math.round(effective * 10) / 10;
}

/**
 * 根据用户反馈计算菜谱调整分（需求3）
 * 不喜欢食材/口味/不方便/太复杂 → 对应维度扣分
 * 3天半衰期
 */
export function getFeedbackAdjustment(recipe: Recipe): number {
  const fb = useAppStore.getState().userFeedback;
  const HALF_LIFE_DAYS = 3;  // 3天衰减一半
  let penalty = 0;

  const decayFor = (lastTime: number) => {
    if (!lastTime) return 0;
    const daysSince = (Date.now() - lastTime) / 86400000;
    return Math.pow(0.5, daysSince / HALF_LIFE_DAYS);
  };

  // 1. 不喜欢的食材：菜谱中出现即扣
  for (const ri of recipe.ingredients) {
    const e = fb.dislikedIngredients[ri.ingredientId];
    if (e) penalty -= 20 * Math.min(3, e.count) * decayFor(e.lastTime);
  }
  // 2. 不喜欢的口味
  for (const f of recipe.flavors || []) {
    const e = fb.dislikedFlavors[f];
    if (e) penalty -= 10 * Math.min(3, e.count) * decayFor(e.lastTime);
  }
  // 3. 不方便的食材：扣分较轻
  for (const ri of recipe.ingredients) {
    const e = fb.inconvenientIngredients[ri.ingredientId];
    if (e) penalty -= 10 * Math.min(3, e.count) * decayFor(e.lastTime);
  }
  // 4. 嫌复杂：hard -15, medium -5
  const cx = fb.complexityRejections;
  if (cx.count > 0) {
    const d = decayFor(cx.lastTime);
    if (recipe.difficulty === 'hard') penalty -= 15 * Math.min(3, cx.count) * d;
    else if (recipe.difficulty === 'medium') penalty -= 5 * Math.min(3, cx.count) * d;
  }

  return Math.round(penalty * 10) / 10;
}

// Supabase 自动同步: store 变更后自动推送到云端
if (typeof window !== 'undefined') {
  // 首次加载把 customRecipes 同步到 repository 缓存
  import('./data/recipe-repository').then(({ registerCustomRecipes }) => {
    registerCustomRecipes(useAppStore.getState().profile.customRecipes || []);
  });

  let syncTimeout: ReturnType<typeof setTimeout> | null = null;

  useAppStore.subscribe((state) => {
    // 保持 repository customCache 与 store 同步
    import('./data/recipe-repository').then(({ registerCustomRecipes }) => {
      registerCustomRecipes(state.profile.customRecipes || []);
    });

    // 防抖: 500ms 内的多次变更合并为一次推送
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
      try {
        const { saveUserData } = await import('./supabase/sync');
        await saveUserData({
          profile: state.profile,
          weeklyPlan: state.weeklyPlan,
          shoppingList: state.shoppingList,
          ownedIngredients: state.ownedIngredients,
          recipePreferences: state.recipePreferences,
        });
      } catch {
        // 静默失败，localStorage 仍然工作
      }
    }, 500);
  });
}

function getUnitGrams(unit: string): number {
  switch (unit) {
    case 'kg': return 1000;
    case 'litre': return 1000;
    case 'dozen': return 600;
    case 'bottle': return 500;
    case 'pack': return 250;
    case 'bunch': return 200;
    case 'piece': return 200;
    case 'loaf': return 600;
    default: return 500;
  }
}
