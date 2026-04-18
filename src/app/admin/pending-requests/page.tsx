'use client';

import { useEffect, useState, useCallback } from 'react';
import { Inbox, Check, X, RefreshCw, Download } from 'lucide-react';
import { listPendingRequests, updatePendingRequest, type PendingRecipeRequest } from '@/lib/supabase/pending';
import { getAllIngredients } from '@/lib/data/recipe-repository';

export default function PendingRequestsPage() {
  const [items, setItems] = useState<PendingRecipeRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'added' | 'ignored'>('pending');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await listPendingRequests();
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => filter === 'all' ? true : i.status === filter);
  const allIng = getAllIngredients();
  const ingName = (id: string) => allIng.find(i => i.id === id)?.nameZh || id;

  const handleStatus = async (id: string, status: 'added' | 'ignored') => {
    await updatePendingRequest(id, { status });
    setItems(items.map(i => i.id === id ? { ...i, status } : i));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-requests-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Inbox className="w-6 h-6" /> 待新增菜谱队列
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

      <p className="text-sm text-muted">
        来自搜索页「没有找到匹配菜谱」时用户主动提交的需求。可导出 JSON 交给 Claude Code 批量新增菜谱。
      </p>

      <div className="flex gap-2 text-xs">
        {(['all', 'pending', 'added', 'ignored'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full border transition ${filter === s ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary/50'}`}>
            {s === 'all' ? '全部' : s === 'pending' ? '待处理' : s === 'added' ? '已采纳' : '已忽略'}
            <span className="ml-1 opacity-70">({items.filter(i => s === 'all' ? true : i.status === s).length})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted text-center py-12">加载中...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-center py-12">暂无数据</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(req => (
            <div key={req.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{req.query}</span>
                    <StatusPill status={req.status} />
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(req.createdAt).toLocaleString('zh-CN')} · 设备 {req.deviceId.slice(0, 8)}
                  </p>
                  {req.excludeIngredients && req.excludeIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs text-muted">排除:</span>
                      {req.excludeIngredients.map(id => (
                        <span key={id} className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                          {ingName(id)}
                        </span>
                      ))}
                    </div>
                  )}
                  {req.parsedDims ? (
                    <details className="mt-2">
                      <summary className="text-xs text-muted cursor-pointer">解析维度</summary>
                      <pre className="text-[10px] bg-background p-2 rounded mt-1 overflow-auto max-h-32">
                        {JSON.stringify(req.parsedDims, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleStatus(req.id, 'added')}
                      className="flex items-center gap-1 text-xs bg-primary text-white px-2.5 py-1.5 rounded hover:bg-primary/90"
                    >
                      <Check className="w-3 h-3" /> 已采纳
                    </button>
                    <button
                      onClick={() => handleStatus(req.id, 'ignored')}
                      className="flex items-center gap-1 text-xs border border-border px-2.5 py-1.5 rounded hover:bg-background"
                    >
                      <X className="w-3 h-3" /> 忽略
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: 'pending' | 'added' | 'ignored' }) {
  const map = {
    pending: { label: '待处理', cls: 'bg-yellow-100 text-yellow-700' },
    added: { label: '已采纳', cls: 'bg-green-100 text-green-700' },
    ignored: { label: '已忽略', cls: 'bg-gray-100 text-gray-600' },
  };
  const cfg = map[status];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded ${cfg.cls}`}>{cfg.label}</span>;
}
