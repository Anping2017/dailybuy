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
  removeMealSlot: (day: string, mealType: MealType) => void;

  // --- 采购清单 ---
  shoppingList: ShoppingList | null;
  setShoppingList: (list: ShoppingList) => void;
  addRecipeToShoppingList: (recipeId: string, servings: number) => void;
  removeRecipeFromShoppingList: (recipeId: string) => void;
  toggleOwned: (ingredientId: string) => void;
  togglePurchased: (ingredientId: string) => void;
  updateItemAmount: (ingredientId: string, amount: number) => void;
  removeShoppingItem: (ingredientId: string) => void;
  removeMultipleShoppingItems: (ids: string[]) => void;

  // --- 用户偏好学习 ---
  recipePreferences: Record<string, RecipePreference>;
  recentActions: RecentAction[];
  recordAction: (recipeId: string, action: RecipeAction) => void;

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
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      ownedIngredients: [],
      recipePreferences: {},
      recentActions: [],
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
          const ratio = servings / recipe.servings;

          for (const ri of recipe.ingredients) {
            const ingredient = getIngredient(ri.ingredientId) as Ingredient | undefined;
            if (!ingredient) continue;

            const amount = ri.amount * ratio;
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

      recordAction: (recipeId, action) =>
        set((s) => {
          const weights: Record<RecipeAction, number> = { accepted: 1, rejected: -3, swapped_in: 5, added_to_list: 2 };
          const prefs = { ...s.recipePreferences };
          const existing = prefs[recipeId] || { recipeId, score: 0, acceptCount: 0, rejectCount: 0, swapInCount: 0, addToListCount: 0, lastInteraction: 0 };

          // 冷却: 同一菜谱10分钟内同类行为不重复计分
          const TEN_MIN = 10 * 60 * 1000;
          const lastSameAction = s.recentActions.filter(a => a.recipeId === recipeId && a.action === action);
          if (lastSameAction.length > 0 && Date.now() - lastSameAction[lastSameAction.length - 1].timestamp < TEN_MIN) {
            // 冷却中，只记录事件不加分
            const recent = [...s.recentActions, { recipeId, action, timestamp: Date.now() }];
            if (recent.length > 50) recent.shift();
            return { recentActions: recent };
          }

          const updated = { ...existing };
          updated.score = Math.max(-10, Math.min(50, updated.score + weights[action]));
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
          const recent = [...s.recentActions, { recipeId, action, timestamp: Date.now() }];
          if (recent.length > 50) recent.shift();

          return { recipePreferences: prefs, recentActions: recent };
        }),

      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
    }),
    {
      name: 'dailybuy-store',
    }
  )
);

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

// Supabase 自动同步: store 变更后自动推送到云端
if (typeof window !== 'undefined') {
  let syncTimeout: ReturnType<typeof setTimeout> | null = null;

  useAppStore.subscribe((state) => {
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
