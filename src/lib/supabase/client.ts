import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 环境变量未配置，使用 localStorage 模式');
}

/** 获取设备 ID (localStorage 持久; 迁移到 IndexedDB 可更稳定) */
function getDeviceIdSync(): string {
  if (typeof window === 'undefined') return 'server';
  const KEY = 'dailybuy_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    // 优先用 crypto.randomUUID(); 回退用时间戳
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try { localStorage.setItem(KEY, id); } catch { /* 无痕模式写失败, 使用内存 id */ }
  }
  return id;
}

// 创建 client 时带上 x-device-id header, RLS 据此过滤
// 注: server-side render 时 getDeviceIdSync() 返回 'server', Supabase 查询会过滤为空
//     实际数据同步都在客户端进行, 不影响功能
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          'x-device-id': getDeviceIdSync(),
        },
      },
    })
  : null;

export function isSupabaseEnabled(): boolean {
  return supabase !== null;
}
