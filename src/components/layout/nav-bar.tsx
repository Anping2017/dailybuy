'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, Library, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: '首页', icon: Home },
  { href: '/plan', label: '本周', icon: UtensilsCrossed },
  { href: '/recipes', label: '菜谱库', icon: Library },
  { href: '/shopping', label: '清单', icon: ShoppingCart },
  { href: '/profile', label: '设置', icon: User },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-lg mx-auto flex justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center py-2 px-4 text-xs transition-colors',
                active ? 'text-primary' : 'text-muted hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
