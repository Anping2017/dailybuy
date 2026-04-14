'use client';

import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Check, Minus, ShoppingCart, Home, Trash2 } from 'lucide-react';
import type { IngredientCategory } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  meat: '肉类', seafood: '海鲜', egg_dairy: '蛋奶', vegetable: '蔬菜',
  fruit: '水果', grain: '谷物/主食', bean: '豆类', seasoning: '调料',
  oil: '油脂', dried: '干货', other: '其他',
};

export default function ShoppingPage() {
  const { shoppingList, toggleOwned, togglePurchased, removeShoppingItem, removeMultipleShoppingItems } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'to_buy' | 'owned'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  if (!shoppingList || shoppingList.items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="w-16 h-16 text-muted mx-auto mb-4" />
        <p className="text-muted font-medium">清单为空</p>
        <p className="text-sm text-muted mt-1">去「菜谱规划」生成菜谱后，食材会自动加入这里</p>
      </div>
    );
  }

  let items = shoppingList.items;
  if (filter === 'to_buy') items = items.filter(i => !i.isOwned && !i.isPurchased);
  if (filter === 'owned') items = items.filter(i => i.isOwned);

  // 按分类分组
  const groups = new Map<IngredientCategory, typeof items>();
  for (const item of items) {
    const list = groups.get(item.category) || [];
    list.push(item);
    groups.set(item.category, list);
  }

  const toBuyCount = shoppingList.items.filter(i => !i.isOwned && !i.isPurchased).length;
  const purchasedCount = shoppingList.items.filter(i => i.isPurchased).length;
  const ownedCount = shoppingList.items.filter(i => i.isOwned).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">采购清单</h1>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">${shoppingList.totalEstimatedCost.toFixed(2)}</p>
          <p className="text-xs text-muted">预估总价</p>
        </div>
      </div>

      {/* 进度 */}
      <div className="bg-card border border-border rounded-lg p-3">
        <div className="flex justify-between text-sm mb-2">
          <span>采购进度</span>
          <span className="font-medium">{purchasedCount}/{toBuyCount + purchasedCount}</span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${toBuyCount + purchasedCount > 0 ? (purchasedCount / (toBuyCount + purchasedCount)) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 过滤器 */}
      <div className="flex gap-2">
        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label={`全部 (${shoppingList.items.length})`} />
        <FilterBtn active={filter === 'to_buy'} onClick={() => setFilter('to_buy')} label={`待买 (${toBuyCount})`} />
        <FilterBtn active={filter === 'owned'} onClick={() => setFilter('owned')} label={`已有 (${ownedCount})`} />
        {selected.size > 0 && (
          <button onClick={() => { removeMultipleShoppingItems([...selected]); setSelected(new Set()); }}
            className="ml-auto px-3 py-1.5 bg-danger text-white rounded-full text-xs font-medium">
            删除 {selected.size} 项
          </button>
        )}
      </div>

      {/* 分组列表 */}
      {Array.from(groups.entries()).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-muted mb-2">
            {CATEGORY_LABELS[category] || category}
          </h3>
          <div className="space-y-1">
            {categoryItems.map(item => (
              <div
                key={item.ingredientId}
                className={`bg-card border border-border rounded-lg p-3 flex items-center gap-3 transition ${
                  item.isPurchased ? 'opacity-50' : ''
                } ${item.isOwned ? 'border-dashed' : ''}`}
              >
                {/* 批量选择 */}
                <input type="checkbox" checked={selected.has(item.ingredientId)}
                  onChange={() => { const n = new Set(selected); n.has(item.ingredientId) ? n.delete(item.ingredientId) : n.add(item.ingredientId); setSelected(n); }}
                  className="w-4 h-4 accent-primary flex-shrink-0" />
                {/* 购买勾选 */}
                <button
                  onClick={() => togglePurchased(item.ingredientId)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                    item.isPurchased
                      ? 'bg-primary border-primary text-white'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  {item.isPurchased && <Check className="w-3.5 h-3.5" />}
                </button>

                {/* 食材信息 */}
                <div className={`flex-1 min-w-0 ${item.isPurchased || item.isOwned ? 'line-through-animated' : ''}`}>
                  <p className="font-medium text-sm">{item.ingredientName}</p>
                  <p className="text-xs text-muted">{item.ingredientNameEn}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {item.totalAmount}{item.unit} &middot; 用于: {item.fromRecipes.join(', ')}
                  </p>
                </div>

                {/* 价格和操作 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-medium">${item.estimatedPrice.toFixed(2)}</span>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => toggleOwned(item.ingredientId)}
                      title={item.isOwned ? '取消已有' : '标记为家里已有'}
                      className={`p-1 rounded transition ${
                        item.isOwned ? 'text-primary bg-primary-light' : 'text-muted hover:text-primary'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeShoppingItem(item.ingredientId)}
                      title="删除"
                      className="p-1 rounded text-muted hover:text-danger transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
        active ? 'bg-primary text-white' : 'bg-card border border-border text-foreground'
      }`}
    >
      {label}
    </button>
  );
}
