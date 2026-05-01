'use client';
import { adminFetch } from '@/lib/admin-auth';

import { useEffect, useState } from 'react';
import { AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

interface MissingItem {
  id: string;
  count: number;
  usedIn: string[];
}

export default function PendingIngredientsPage() {
  const [data, setData] = useState<{ missing: MissingItem[]; total: number } | null>(null);
  const [aiStatus, setAiStatus] = useState<string>('');

  useEffect(() => {
    adminFetch('/api/admin/ingredients/pending').then(r => r.json()).then(setData);
  }, []);

  const handleAIGenerate = async () => {
    if (!data || data.missing.length === 0) return;
    setAiStatus('请求中...');
    const res = await adminFetch('/api/admin/ingredients/pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredientIds: data.missing.map(m => m.id) }),
    });
    const result = await res.json();
    setAiStatus(result.message || '完成');
  };

  if (!data) return <p className="text-muted">扫描中...</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">待新增食材</h1>
          <p className="text-sm text-muted">菜谱中引用但食材库中不存在的食材</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => adminFetch('/api/admin/ingredients/pending').then(r => r.json()).then(setData)}
            className="flex items-center gap-1 px-3 py-2 border border-border rounded-lg text-sm hover:border-primary/50 transition">
            <RefreshCw className="w-4 h-4" /> 重新扫描
          </button>
          <button onClick={handleAIGenerate}
            className="flex items-center gap-1 px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition">
            <Sparkles className="w-4 h-4" /> AI批量生成
          </button>
        </div>
      </div>

      {aiStatus && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-sm text-accent">
          {aiStatus}
        </div>
      )}

      {data.total === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">&#10003;</div>
          <p className="text-lg font-medium text-primary">食材库完整</p>
          <p className="text-sm text-muted mt-1">所有菜谱引用的食材都已存在于食材库中</p>
        </div>
      ) : (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">发现 {data.total} 个缺失食材</p>
              <p className="text-xs text-muted">这些食材在菜谱中被引用但食材库中不存在，会导致营养计算不准确。点击"AI批量生成"可自动补充（需配置API Key）。</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="p-3 text-left">食材ID</th>
                  <th className="p-3 text-right w-20">引用数</th>
                  <th className="p-3 text-left">被哪些菜谱引用</th>
                </tr>
              </thead>
              <tbody>
                {data.missing.map(item => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-mono text-red-500">{item.id}</td>
                    <td className="p-3 text-right">{item.count}</td>
                    <td className="p-3 text-muted text-xs">{item.usedIn.join('、')}{item.count > 5 ? '...' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
