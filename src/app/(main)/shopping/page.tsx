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

/** 生成消费记录分享文本（按已购的实际价格） */
function generateSpendingText(list: ShoppingList): string {
  const purchased = list.items.filter(i => i.isPurchased);
  // 用 actualPrice 优先，回退到 estimatedPrice
  const priceOf = (item: typeof purchased[number]) => (item.actualPrice !== undefined ? item.actualPrice : item.estimatedPrice);
  const total = purchased.reduce((s, i) => s + priceOf(i), 0);

  let text = '💰 消费记录\n';
  text += `日期: ${new Date().toLocaleDateString('zh-CN')}\n`;
  text += `总花费: $${total.toFixed(2)} NZD · ${purchased.length} 项\n\n`;

  // 按分类分组
  const byCategory = new Map<string, typeof purchased>();
  for (const item of purchased) {
    const list = byCategory.get(item.category) || [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  // 分类小计
  text += '【分类小计】\n';
  const sortedCats = Array.from(byCategory.keys()).sort();
  for (const cat of sortedCats) {
    const subTotal = byCategory.get(cat)!.reduce((s, i) => s + priceOf(i), 0);
    text += `  ${CATEGORY_LABELS[cat] || cat}: $${subTotal.toFixed(2)}\n`;
  }
  text += '\n';

  // 明细
  text += '【明细】\n';
  for (const cat of sortedCats) {
    text += `${CATEGORY_LABELS[cat] || cat}:\n`;
    for (const item of byCategory.get(cat)!) {
      const p = priceOf(item);
      const note = item.actualPrice !== undefined ? '' : '(估)';
      text += `  • ${item.ingredientName} · ${Math.round(item.totalAmount)}${item.unit} · $${p.toFixed(2)}${note}\n`;
    }
  }
  text += '\n— DailyBuy 生成';
  return text;
}

export default function ShoppingPage() {
  const { profile, shoppingList, togglePurchased, removeShoppingItem, removeMultipleShoppingItems, updateItemActualPrice, updateItemAmount } = useAppStore();
  const budgetOn = profile.budgetEnabled !== false;
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'to_buy' | 'purchased'>('all');
  const [showShare, setShowShare] = useState(false);
  const [showSpendShare, setShowSpendShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [allDoneNotified, setAllDoneNotified] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // 全部勾选时自动弹出消费记录分享
  useEffect(() => {
    if (!mounted || !shoppingList || shoppingList.items.length === 0) return;
    const allPurchased = shoppingList.items.every(i => i.isPurchased);
    if (allPurchased && !allDoneNotified) {
      setShowSpendShare(true);
      setAllDoneNotified(true);
    }
    if (!allPurchased && allDoneNotified) {
      setAllDoneNotified(false);
    }
  }, [mounted, shoppingList, allDoneNotified]);

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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl font-bold">采购清单</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {purchasedCount > 0 && (
            <button
              onClick={() => setShowSpendShare(true)}
              title="消费记录"
              className="flex items-center gap-1 text-xs px-3 py-1.5 border border-border rounded-lg hover:border-primary hover:text-primary transition"
            >
              💰 消费
            </button>
          )}
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
          const msg = `确定批量删除「${CATEGORY_LABELS[category] || category}」分类下所有 ${categoryItems.length} 项吗？\n\n⚠ 此操作不可恢复，请确认。`;
          if (confirm(msg)) {
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
                  title={allChecked ? '批量取消勾选' : '批量标记为已购'}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition ${
                    allChecked ? 'bg-primary text-white border-primary' : someChecked ? 'border-primary text-primary' : 'border-border text-muted hover:border-primary'
                  }`}
                >
                  <CheckAll className="w-3 h-3" /> {allChecked ? '批量取消' : '批量已购'}
                </button>
                <button
                  onClick={deleteAllInCategory}
                  title="批量删除该分类（不可恢复）"
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border text-muted hover:border-danger hover:text-danger transition"
                >
                  <Trash2 className="w-3 h-3" /> 批量删除
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
                    {item.isPurchased ? (
                      // 已购: 重量可编辑
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted">
                        <input
                          type="number"
                          value={item.totalAmount}
                          onChange={(e) => updateItemAmount(item.ingredientId, Number(e.target.value) || 0)}
                          title="实际购买数量"
                          className="w-14 border border-border rounded px-1 py-0.5 bg-background focus:border-primary outline-none"
                        />
                        <span>{item.unit}</span>
                        <span>&middot; 用于: {item.fromRecipes.join(', ')}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted mt-0.5">
                        {item.totalAmount}{item.unit} &middot; 用于: {item.fromRecipes.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* 价格和删除 */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {budgetOn && (
                      item.isPurchased ? (
                        // 已购: 实际价格可编辑
                        <div className="flex items-center">
                          <span className="text-xs text-muted mr-0.5">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.actualPrice ?? item.estimatedPrice}
                            onChange={(e) => updateItemActualPrice(item.ingredientId, Number(e.target.value) || 0)}
                            placeholder={item.estimatedPrice.toFixed(2)}
                            title="实际付款金额"
                            className="w-16 text-sm font-medium border border-border rounded px-1.5 py-0.5 bg-background focus:border-primary outline-none"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-muted" title="预估价格">${item.estimatedPrice.toFixed(2)}</span>
                      )
                    )}
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

      {/* 消费记录弹窗（全部勾选自动触发 / 手动） */}
      {showSpendShare && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowSpendShare(false)}>
          <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[90dvh] sm:max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <div>
                <h3 className="font-semibold flex items-center gap-2">🎉 全部购买完成</h3>
                <p className="text-xs text-muted mt-0.5">分享本次消费记录给家人吧</p>
              </div>
              <button onClick={() => setShowSpendShare(false)} className="text-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs text-muted mb-2">💡 已购的食材可以在清单上修改实际付款金额(默认用预估价)</p>
              <div className="bg-background rounded-lg p-3 text-xs whitespace-pre-wrap font-mono">
                {generateSpendingText(shoppingList)}
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-border flex-shrink-0 bg-card">
              <button onClick={() => setShowSpendShare(false)}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm hover:border-primary transition">
                稍后
              </button>
              <button onClick={async () => {
                await navigator.clipboard.writeText(generateSpendingText(shoppingList));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm hover:border-primary transition">
                {copied ? <><CheckCheck className="w-4 h-4 text-primary" /> 已复制</> : <><Copy className="w-4 h-4" /> 复制</>}
              </button>
              <button onClick={async () => {
                const text = generateSpendingText(shoppingList);
                if (navigator.share) {
                  try { await navigator.share({ title: '消费记录', text }); } catch { /* user cancelled */ }
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

      {/* 分享弹窗 */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowShare(false)}>
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
