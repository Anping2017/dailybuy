'use client';

import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Check, ShoppingCart, Trash2, Share2, Copy, CheckCheck, X, CheckCheck as CheckAll } from 'lucide-react';
import type { IngredientCategory, ShoppingList } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  meat: '肉类', seafood: '海鲜', egg_dairy: '蛋奶', vegetable: '蔬菜',
  fruit: '水果', grain: '谷物/主食', bean: '豆类', seasoning: '调料',
  oil: '油脂', dried: '干货', other: '其他',
};

/** 生成采购清单分享文本 */
function generateShoppingText(list: ShoppingList, budgetOn: boolean): string {
  const toBuy = list.items.filter(i => !i.isOwned && !i.isPurchased);
  let text = '🛒 采购清单\n';
  if (budgetOn) text += `预估总价: $${list.totalEstimatedCost.toFixed(2)} NZD\n`;
  text += `待买 ${toBuy.length} 项\n\n`;

  // 按分类分组
  const byCategory = new Map<string, typeof toBuy>();
  for (const item of toBuy) {
    const list = byCategory.get(item.category) || [];
    list.push(item);
    byCategory.set(item.category, list);
  }
  const sortedCats = Array.from(byCategory.keys()).sort();
  for (const cat of sortedCats) {
    text += `【${CATEGORY_LABELS[cat] || cat}】\n`;
    for (const item of byCategory.get(cat)!) {
      text += `  • ${item.ingredientName} · ${Math.round(item.totalAmount)}${item.unit}`;
      if (budgetOn) text += ` · $${item.estimatedPrice.toFixed(2)}`;
      text += '\n';
    }
    text += '\n';
  }
  text += '— DailyBuy 生成';
  return text;
}

export default function ShoppingPage() {
  const { profile, shoppingList, togglePurchased, removeShoppingItem, removeMultipleShoppingItems } = useAppStore();
  const budgetOn = profile.budgetEnabled !== false;
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'to_buy' | 'purchased'>('all');
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

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
  if (filter === 'to_buy') items = items.filter(i => !i.isPurchased);
  if (filter === 'purchased') items = items.filter(i => i.isPurchased);

  // 按分类分组
  const groups = new Map<IngredientCategory, typeof items>();
  for (const item of items) {
    const list = groups.get(item.category) || [];
    list.push(item);
    groups.set(item.category, list);
  }

  const toBuyCount = shoppingList.items.filter(i => !i.isPurchased).length;
  const purchasedCount = shoppingList.items.filter(i => i.isPurchased).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">采购清单</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 border border-border rounded-lg hover:border-primary hover:text-primary transition"
          >
            <Share2 className="w-3.5 h-3.5" /> 分享
          </button>
          {budgetOn && (
            <div className="text-right">
              <p className="text-lg font-bold text-primary">${shoppingList.totalEstimatedCost.toFixed(2)}</p>
              <p className="text-xs text-muted">预估总价</p>
            </div>
          )}
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
        <FilterBtn active={filter === 'purchased'} onClick={() => setFilter('purchased')} label={`已购 (${purchasedCount})`} />
      </div>

      {/* 分组列表 */}
      {Array.from(groups.entries()).map(([category, categoryItems]) => {
        const allChecked = categoryItems.every(i => i.isPurchased);
        const someChecked = categoryItems.some(i => i.isPurchased);
        const toggleAllInCategory = () => {
          // 如果全选了就取消勾选；否则全部勾选
          const target = !allChecked;
          for (const item of categoryItems) {
            if (item.isPurchased !== target) togglePurchased(item.ingredientId);
          }
        };
        const deleteAllInCategory = () => {
          if (confirm(`确定删除「${CATEGORY_LABELS[category] || category}」分类下所有 ${categoryItems.length} 项？`)) {
            removeMultipleShoppingItems(categoryItems.map(i => i.ingredientId));
          }
        };
        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">
                {CATEGORY_LABELS[category] || category}
                <span className="text-xs text-muted ml-1">({categoryItems.length})</span>
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={toggleAllInCategory}
                  title={allChecked ? '全部取消勾选' : '全部勾选已购'}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition ${
                    allChecked ? 'bg-primary text-white border-primary' : someChecked ? 'border-primary text-primary' : 'border-border text-muted hover:border-primary'
                  }`}
                >
                  <CheckAll className="w-3 h-3" /> {allChecked ? '取消勾选' : '全部已购'}
                </button>
                <button
                  onClick={deleteAllInCategory}
                  title="删除该分类全部"
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border text-muted hover:border-danger hover:text-danger transition"
                >
                  <Trash2 className="w-3 h-3" /> 全部删除
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {categoryItems.map(item => (
                <div
                  key={item.ingredientId}
                  className={`bg-card border border-border rounded-lg p-3 flex items-center gap-3 transition ${
                    item.isPurchased ? 'opacity-50' : ''
                  }`}
                >
                  {/* 购买勾选 */}
                  <button
                    onClick={() => togglePurchased(item.ingredientId)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                      item.isPurchased
                        ? 'bg-primary border-primary text-white'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {item.isPurchased && <Check className="w-4 h-4" />}
                  </button>

                  {/* 食材信息 */}
                  <div className={`flex-1 min-w-0 ${item.isPurchased ? 'line-through-animated' : ''}`}>
                    <p className="font-medium text-sm">{item.ingredientName}</p>
                    <p className="text-xs text-muted">{item.ingredientNameEn}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {item.totalAmount}{item.unit} &middot; 用于: {item.fromRecipes.join(', ')}
                    </p>
                  </div>

                  {/* 价格和删除 */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {budgetOn && <span className="text-sm font-medium">${item.estimatedPrice.toFixed(2)}</span>}
                    <button
                      onClick={() => removeShoppingItem(item.ingredientId)}
                      title="删除"
                      className="p-2 rounded text-muted hover:text-danger transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* 分享弹窗 */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowShare(false)}>
          <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[90dvh] sm:max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h3 className="font-semibold">分享采购清单</h3>
              <button onClick={() => setShowShare(false)} className="text-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-background rounded-lg p-3 text-xs whitespace-pre-wrap font-mono">
                {generateShoppingText(shoppingList, budgetOn)}
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-border flex-shrink-0 bg-card">
              <button onClick={async () => {
                await navigator.clipboard.writeText(generateShoppingText(shoppingList, budgetOn));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm hover:border-primary transition">
                {copied ? <><CheckCheck className="w-4 h-4 text-primary" /> 已复制</> : <><Copy className="w-4 h-4" /> 复制文本</>}
              </button>
              <button onClick={async () => {
                const text = generateShoppingText(shoppingList, budgetOn);
                if (navigator.share) {
                  try { await navigator.share({ title: '采购清单', text }); } catch { /* user cancelled */ }
                } else {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition">
                <Share2 className="w-4 h-4" /> 分享
              </button>
            </div>
          </div>
        </div>
      )}
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
