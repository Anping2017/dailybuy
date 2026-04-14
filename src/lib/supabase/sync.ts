/**
 * Supabase 数据同步层
 * 将 Zustand store 数据同步到 Supabase
 * 无 Supabase 配置时自动降级为纯 localStorage
 */
import { supabase, isSupabaseEnabled } from './client';

/** 获取或生成设备ID */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('dailybuy_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('dailybuy_device_id', id);
  }
  return id;
}

/** 保存用户数据到 Supabase */
export async function saveUserData(data: {
  profile?: unknown;
  weeklyPlan?: unknown;
  shoppingList?: unknown;
  ownedIngredients?: string[];
  recipePreferences?: unknown;
}): Promise<boolean> {
  if (!isSupabaseEnabled() || !supabase) return false;

  const deviceId = getDeviceId();
  if (!deviceId) return false;

  const { error } = await supabase
    .from('user_data')
    .upsert({
      device_id: deviceId,
      profile: data.profile || null,
      weekly_plan: data.weeklyPlan || null,
      shopping_list: data.shoppingList || null,
      owned_ingredients: data.ownedIngredients || [],
      recipe_preferences: data.recipePreferences || {},
    }, { onConflict: 'device_id' });

  if (error) {
    console.error('Supabase save error:', error.message);
    return false;
  }
  return true;
}

/** 从 Supabase 加载用户数据 */
export async function loadUserData(): Promise<{
  profile?: unknown;
  weeklyPlan?: unknown;
  shoppingList?: unknown;
  ownedIngredients?: string[];
  recipePreferences?: unknown;
} | null> {
  if (!isSupabaseEnabled() || !supabase) return null;

  const deviceId = getDeviceId();
  if (!deviceId) return null;

  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('device_id', deviceId)
    .single();

  if (error || !data) return null;

  return {
    profile: data.profile,
    weeklyPlan: data.weekly_plan,
    shoppingList: data.shopping_list,
    ownedIngredients: data.owned_ingredients,
    recipePreferences: data.recipe_preferences,
  };
}

/** 检查 Supabase 连接是否可用 */
export async function checkConnection(): Promise<boolean> {
  if (!isSupabaseEnabled() || !supabase) return false;

  try {
    const { error } = await supabase.from('user_data').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
