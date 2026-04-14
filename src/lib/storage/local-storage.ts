/**
 * 本地存储适配器 - 使用 localStorage
 * 未来可替换为 SupabaseStorageAdapter 实现云端存储
 */
import type { StorageAdapter } from '@/types';

class LocalStorageAdapter implements StorageAdapter {
  private prefix = 'dailybuy_';

  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this.prefix + key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  async list(prefix: string): Promise<string[]> {
    if (typeof window === 'undefined') return [];
    const fullPrefix = this.prefix + prefix;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(fullPrefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return keys;
  }
}

// 单例导出 - 未来切换为 Supabase 时只需替换此处
export const storage: StorageAdapter = new LocalStorageAdapter();
