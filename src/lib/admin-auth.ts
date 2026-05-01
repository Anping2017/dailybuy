/**
 * Admin token 客户端工具
 *
 * 使用流程:
 * 1. 用户在 /admin 输入 token, 调 verifyAdminToken 验证
 * 2. 验证通过 → 存 sessionStorage (关闭浏览器自动清)
 * 3. 后续 fetch admin API 用 adminFetch 自动带 X-Admin-Token header
 */

const STORAGE_KEY = 'dailybuy_admin_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* 隐私模式 sessionStorage 不可用, 静默失败 */
  }
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** 验证 token 是否能调通 admin API */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/recipes/stats', {
      headers: { 'X-Admin-Token': token },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** 包装 fetch — 自动给 admin API 注入 X-Admin-Token */
export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('X-Admin-Token', token);
  return fetch(url, { ...init, headers });
}
