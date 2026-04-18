'use client';

import { useEffect, useState, useCallback } from 'react';
import { Brain, CheckCircle, XCircle, RefreshCw, Download, ChevronRight } from 'lucide-react';
import { listPendingAnalysis, updatePendingAnalysis, type PendingAnalysisPlan } from '@/lib/supabase/pending';
import { getRecipe } from '@/lib/nutrition/calculator';

export default function PendingAnalysisPage() {
  const [items, setItems] = useState<PendingAnalysisPlan[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'analyzed' | 'applied' | 'skipped'>('pending');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await listPendingAnalysis();
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => filter === 'all' ? true : i.status === filter);

  const handleStatus = async (id: string, status: 'applied' | 'skipped') => {
    await updatePendingAnalysis(id, { status });
    setItems(items.map(i => i.id === id ? { ...i, status } : i));
  };

  const exportJson = () => {
    // 导出待分析的方案，供 Claude Code 读取分析
    const pendingOnly = filtered.filter(i => i.status === 'pending');
    const blob = new Blob([JSON.stringify(pendingOnly, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6" /> 待分析方案队列
        </h1>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1 text-sm px-3 py-1.5 border border-border rounded hover:bg-card">
            <RefreshCw className="w-3.5 h-3.5" /> 刷新
          </button>
          <button onClick={exportJson} className="flex items-center gap-1 text-sm px-3 py-1.5 border border-border rounded hover:bg-card">
            <Download className="w-3.5 h-3.5" /> 导出待分析
          </button>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
        <p className="font-medium text-primary">工作流</p>
        <ol className="text-xs text-muted mt-1 space-y-0.5 list-decimal list-inside">
          <li>用户选「AI 队列分析」模式生成周计划 → 本页出现 pending 记录</li>
          <li>导出 pending JSON，用 Claude Code 本地分析（prompt 在 <code>scripts/analyze-plan.md</code>）</li>
          <li>分析结果回填 ai_report + optimized_plan → 状态变 analyzed</li>
          <li>此页确认「应用」或「跳过」</li>
        </ol>
      </div>

      <div className="flex gap-2 text-xs">
        {(['all', 'pending', 'analyzed', 'applied', 'skipped'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full border transition ${filter === s ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary/50'}`}>
            {s === 'all' ? '全部' : s === 'pending' ? '待分析' : s === 'analyzed' ? '已分析' : s === 'applied' ? '已应用' : '已跳过'}
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
          {filtered.map(item => {
            const slotCount = item.basicPlan?.slots?.length || 0;
            const recipeIds = (item.basicPlan?.slots || []).flatMap(s => (s.recipes || []).map(r => r.recipeId));
            const uniqueRecipes = Array.from(new Set(recipeIds));
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-background/50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">方案 {item.id.slice(-8)}</span>
                      <StatusPill status={item.status} />
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {new Date(item.createdAt).toLocaleString('zh-CN')} ·
                      {slotCount} 餐 · {uniqueRecipes.length} 道菜 ·
                      {item.profile.familySize}人 · 预算 ${item.profile.weeklyBudget}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted flex-shrink-0 mt-0.5 transition ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border space-y-3 pt-3">
                    <div>
                      <p className="text-xs font-medium mb-1">本次方案菜品</p>
                      <div className="flex flex-wrap gap-1">
                        {uniqueRecipes.map(rid => {
                          const r = getRecipe(rid);
                          return (
                            <span key={rid} className="text-[11px] bg-background border border-border px-1.5 py-0.5 rounded">
                              {r?.nameZh || rid}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {item.aiReport && (
                      <div>
                        <p className="text-xs font-medium mb-1">AI 分析报告</p>
                        <div className="bg-background rounded p-2 text-xs whitespace-pre-wrap">{item.aiReport}</div>
                      </div>
                    )}

                    <details>
                      <summary className="text-xs text-muted cursor-pointer">用户档案</summary>
                      <pre className="text-[10px] bg-background p-2 rounded mt-1 overflow-auto max-h-40">
                        {JSON.stringify(item.profile, null, 2)}
                      </pre>
                    </details>

                    {item.status === 'analyzed' && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleStatus(item.id, 'applied')}
                          className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-primary/90"
                        >
                          <CheckCircle className="w-3 h-3" /> 应用优化方案
                        </button>
                        <button
                          onClick={() => handleStatus(item.id, 'skipped')}
                          className="flex items-center gap-1 text-xs border border-border px-3 py-1.5 rounded hover:bg-background"
                        >
                          <XCircle className="w-3 h-3" /> 跳过
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: PendingAnalysisPlan['status'] }) {
  const map: Record<PendingAnalysisPlan['status'], { label: string; cls: string }> = {
    pending: { label: '待分析', cls: 'bg-yellow-100 text-yellow-700' },
    analyzing: { label: '分析中', cls: 'bg-blue-100 text-blue-700' },
    analyzed: { label: '已分析', cls: 'bg-purple-100 text-purple-700' },
    applied: { label: '已应用', cls: 'bg-green-100 text-green-700' },
    skipped: { label: '已跳过', cls: 'bg-gray-100 text-gray-600' },
  };
  const cfg = map[status];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded ${cfg.cls}`}>{cfg.label}</span>;
}
