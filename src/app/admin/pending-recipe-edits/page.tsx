'use client';

import { useEffect, useState, useCallback } from 'react';
import { Inbox, Check, X, RefreshCw, Download, ArrowRight } from 'lucide-react';
import { listPendingRecipeEdits, updatePendingRecipeEdit, type PendingRecipeEdit } from '@/lib/supabase/pending';
import { getRecipe } from '@/lib/data/recipe-repository';

export default function PendingRecipeEditsPage() {
  const [items, setItems] = useState<PendingRecipeEdit[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [applyState, setApplyState] = useState<Record<string, 'applying' | 'applied' | 'error'>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const list = await listPendingRecipeEdits();
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => filter === 'all' ? true : i.status === filter);

  const approveAndApply = async (it: PendingRecipeEdit) => {
    // 标记状态: approved, 并调用 admin API 更新菜谱
    setApplyState(s => ({ ...s, [it.id]: 'applying' }));
    try {
      const original = getRecipe(it.recipeId);
      if (!original) throw new Error('菜谱不存在');
      const merged = { ...original, ...it.edited };
      // 调用 admin recipe API
      const res = await fetch(`/api/admin/recipes/${encodeURIComponent(it.recipeId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      await updatePendingRecipeEdit(it.id, { status: 'approved' });
      setItems(items.map(i => i.id === it.id ? { ...i, status: 'approved' } : i));
      setApplyState(s => ({ ...s, [it.id]: 'applied' }));
    } catch (e) {
      console.error(e);
      setApplyState(s => ({ ...s, [it.id]: 'error' }));
    }
  };

  const reject = async (id: string, note?: string) => {
    await updatePendingRecipeEdit(id, { status: 'rejected', reviewerNote: note });
    setItems(items.map(i => i.id === id ? { ...i, status: 'rejected', reviewerNote: note } : i));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-recipe-edits-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Inbox className="w-6 h-6" /> 菜谱编辑建议审批
        </h1>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1 text-sm px-3 py-1.5 border border-border rounded hover:bg-card">
            <RefreshCw className="w-3.5 h-3.5" /> 刷新
          </button>
          <button onClick={exportJson} className="flex items-center gap-1 text-sm px-3 py-1.5 border border-border rounded hover:bg-card">
            <Download className="w-3.5 h-3.5" /> 导出 JSON
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-full border transition ${filter === f ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted'}`}>
            {f === 'pending' ? '待审批' : f === 'approved' ? '已通过' : f === 'rejected' ? '已拒绝' : '全部'}
            <span className="ml-1 text-xs">({items.filter(i => f === 'all' ? true : i.status === f).length})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted">加载中...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Inbox className="w-12 h-12 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">没有{filter === 'pending' ? '待审批' : filter === 'approved' ? '已通过' : filter === 'rejected' ? '已拒绝' : ''}的编辑建议</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(it => {
            const original = getRecipe(it.recipeId);
            const statusColor = it.status === 'approved' ? 'text-green-600' : it.status === 'rejected' ? 'text-red-500' : 'text-amber-600';
            return (
              <div key={it.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold">{it.originalName}</h3>
                    <p className="text-xs text-muted">
                      ID: {it.recipeId} · {new Date(it.createdAt).toLocaleString('zh-CN')}
                      <span className={`ml-2 font-medium ${statusColor}`}>
                        [{it.status === 'pending' ? '待审批' : it.status === 'approved' ? '✓ 已通过' : '× 已拒绝'}]
                      </span>
                    </p>
                  </div>
                  {it.status === 'pending' && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => approveAndApply(it)}
                        disabled={applyState[it.id] === 'applying'}
                        className="text-xs bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 disabled:opacity-50"
                      >
                        {applyState[it.id] === 'applying' ? '应用中...' : applyState[it.id] === 'applied' ? '✓ 已应用' : applyState[it.id] === 'error' ? '❌ 重试' : <><Check className="w-3 h-3 inline" /> 通过并应用</>}
                      </button>
                      <button
                        onClick={() => {
                          const note = prompt('拒绝原因(可选):');
                          reject(it.id, note || undefined);
                        }}
                        className="text-xs border border-border px-3 py-1.5 rounded hover:border-red-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3 inline" /> 拒绝
                      </button>
                    </div>
                  )}
                </div>

                {/* 修改原因 */}
                {it.reason && (
                  <div className="mb-3 p-2 bg-background rounded text-xs">
                    <span className="text-muted">修改原因: </span>{it.reason}
                  </div>
                )}

                {/* 变更对比 */}
                <div className="space-y-2 text-sm">
                  {Object.entries(it.edited).map(([key, newVal]) => {
                    const oldVal = original ? (original as unknown as Record<string, unknown>)[key] : undefined;
                    const oldStr = Array.isArray(oldVal) ? oldVal.join(' / ') : String(oldVal ?? '(空)');
                    const newStr = Array.isArray(newVal) ? newVal.join(' / ') : String(newVal ?? '(空)');
                    return (
                      <div key={key} className="grid grid-cols-[80px_1fr_auto_1fr] gap-2 items-start text-xs">
                        <span className="text-muted font-mono">{key}:</span>
                        <span className="text-red-500 line-through break-words">{oldStr}</span>
                        <ArrowRight className="w-3 h-3 text-muted mt-0.5" />
                        <span className="text-green-600 break-words">{newStr}</span>
                      </div>
                    );
                  })}
                </div>

                {it.reviewerNote && (
                  <p className="mt-2 text-xs text-muted">审批备注: {it.reviewerNote}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
