'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, AlertTriangle, Apple, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: '概览', icon: LayoutDashboard, exact: true },
  { href: '/admin/recipes', label: '菜谱管理', icon: UtensilsCrossed },
  { href: '/admin/ingredients', label: '食材管理', icon: Apple },
  { href: '/admin/ingredients/pending', label: '待新增食材', icon: Sparkles },
  { href: '/admin/validation', label: '数据校验', icon: AlertTriangle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* 侧边栏 */}
      <aside className="w-56 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg">DailyBuy Admin</h1>
              <p className="text-xs text-muted">菜谱后台管理</p>
            </div>
            <Link href="/dashboard" className="text-xs text-muted hover:text-primary border border-border rounded px-2 py-1 transition">
              返回前台
            </Link>
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
      {/* 主内容 */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
