'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, UtensilsCrossed, AlertTriangle, Apple, Sparkles, Inbox, Brain, Menu, X, Edit3, Lock, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAdminToken, setAdminToken, clearAdminToken, verifyAdminToken } from '@/lib/admin-auth';

const NAV = [
  { href: '/admin', label: '概览', icon: LayoutDashboard, exact: true },
  { href: '/admin/recipes', label: '菜谱管理', icon: UtensilsCrossed },
  { href: '/admin/recipes/audit', label: '菜谱审计', icon: ShieldCheck },
  { href: '/admin/ingredients', label: '食材管理', icon: Apple },
  { href: '/admin/ingredients/audit', label: '食材审计', icon: ShieldCheck },
  { href: '/admin/ingredients/pending', label: '待新增食材', icon: Sparkles },
  { href: '/admin/pending-requests', label: '待新增菜谱', icon: Inbox },
  { href: '/admin/pending-recipe-edits', label: '菜谱修改建议', icon: Edit3 },
  { href: '/admin/pending-analysis', label: '待分析方案', icon: Brain },
  { href: '/admin/validation', label: '数据校验', icon: AlertTriangle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  // 路由切换时自动关闭抽屉
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // 启动时验证 sessionStorage 中的 token
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getAdminToken();
      if (!token) {
        if (!cancelled) { setAuthed(false); setAuthChecking(false); }
        return;
      }
      const ok = await verifyAdminToken(token);
      if (cancelled) return;
      if (!ok) clearAdminToken();
      setAuthed(ok);
      setAuthChecking(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted">验证中...</p>
      </div>
    );
  }

  if (!authed) {
    return <AdminLoginGate onSuccess={() => setAuthed(true)} />;
  }

  const handleLogout = () => {
    clearAdminToken();
    setAuthed(false);
  };

  const currentLabel = NAV.find(n => n.exact ? pathname === n.href : pathname.startsWith(n.href))?.label || '后台';

  return (
    <div className="flex min-h-screen bg-background">
      {/* 桌面侧边栏 (md+) */}
      <aside className="hidden md:flex w-56 bg-card border-r border-border flex-col flex-shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg">DailyBuy Admin</h1>
              <p className="text-xs text-muted">菜谱后台管理</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Link href="/dashboard" className="text-xs text-muted hover:text-primary border border-border rounded px-2 py-1 transition">
                返回前台
              </Link>
              <button
                onClick={handleLogout}
                title="退出登录"
                className="text-xs text-muted hover:text-red-500 border border-border rounded px-2 py-1 flex items-center gap-1 transition"
              >
                <LogOut className="w-3 h-3" /> 登出
              </button>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition',
                  active ? 'bg-primary text-white' : 'text-foreground hover:bg-background'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 移动端顶部栏 (md以下) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border flex items-center gap-2 px-3 h-14">
        <button onClick={() => setDrawerOpen(true)} className="p-2 -ml-2">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-base flex-1 truncate">{currentLabel}</h1>
        <Link href="/dashboard" className="text-xs text-muted border border-border rounded px-2 py-1">
          返回前台
        </Link>
      </div>

      {/* 移动端抽屉 */}
      {drawerOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h1 className="font-bold text-lg">DailyBuy Admin</h1>
                <p className="text-xs text-muted">后台管理</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {NAV.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition',
                      active ? 'bg-primary text-white' : 'text-foreground hover:bg-background'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      {/* 主内容 */}
      <main className="flex-1 p-3 md:p-6 overflow-auto pt-17 md:pt-6 mt-14 md:mt-0 min-w-0">
        {children}
      </main>
    </div>
  );
}

/** 后台登录页 — 输入 ADMIN_TOKEN 验证后存 sessionStorage */
function AdminLoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('请输入 token');
      return;
    }
    setSubmitting(true);
    setError(null);
    const ok = await verifyAdminToken(token.trim());
    setSubmitting(false);
    if (ok) {
      setAdminToken(token.trim());
      onSuccess();
    } else {
      setError('Token 无效或服务端未配置 ADMIN_TOKEN');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-lg">后台管理登录</h1>
        </div>
        <p className="text-xs text-muted mb-4">请输入 Admin Token (在服务端 ADMIN_TOKEN 环境变量中配置)</p>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="粘贴 token..."
            autoFocus
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background font-mono"
          />
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded px-2 py-1.5">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {submitting ? '验证中...' : '登录'}
          </button>
        </form>
        <div className="mt-4 pt-4 border-t border-border text-[11px] text-muted space-y-1">
          <p>💡 Token 验证通过后存 sessionStorage, 关闭浏览器自动失效</p>
          <p>🔒 服务端通过 X-Admin-Token header 校验, 不正确返回 401</p>
        </div>
      </div>
    </div>
  );
}
