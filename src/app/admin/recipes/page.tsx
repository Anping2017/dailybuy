'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, AlertTriangle, Eye } from 'lucide-react';
import type { Recipe, RecipeStatus } from '@/types';

interface QueryResult {
  recipes: Recipe[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  reviewed: { label: '已审核', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
  pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
  disabled: { label: '已禁用', color: 'bg-gray-100 text-gray-500', icon: <XCircle className="w-3 h-3" /> },
};

const METHOD_LABELS: Record<string, string> = {
  stir_fry: '炒', braise: '烧', stew: '炖', steam: '蒸', boil: '煮',
  cold_dish: '拌', deep_fry: '炸', roast: '烤', dry_pot: '锅', soup: '汤', staple: '饭面',
};

const DIFF_LABELS: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' };

export default function RecipeListPage() {
  const [data, setData] = useState<QueryResult | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchData = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: '20' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/admin/recipes?${params}`).then(r => r.json()).then(d => {
      setData(d);
      setSelected(new Set());
    });
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBatchStatus = async (status: RecipeStatus) => {
    if (selected.size === 0) return;
    await fetch('/api/admin/recipes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], status }),
    });
    fetchData();
  };

  const toggleAll = () => {
    if (!data) return;
    if (selected.size === data.recipes.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.recipes.map(r => r.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-2xl font-bold">菜谱管理</h1>

      {/* 搜索和过滤 */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="搜索菜名..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-card"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-card"
        >
          <option value="">全部状态</option>
          <option value="reviewed">已审核</option>
          <option value="pending">待审核</option>
          <option value="disabled">已禁用</option>
        </select>

        {/* 批量操作 */}
        {selected.size > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted">已选 {selected.size}</span>
            <button onClick={() => handleBatchStatus('reviewed')} className="px-3 py-1.5 bg-green-500 text-white rounded text-xs">批量审核</button>
            <button onClick={() => handleBatchStatus('disabled')} className="px-3 py-1.5 bg-gray-400 text-white rounded text-xs">批量禁用</button>
          </div>
        )}
      </div>

      {/* 表格 */}
      {data && (
        <>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="p-3 text-left w-8">
                    <input type="checkbox" checked={selected.size === data.recipes.length && data.recipes.length > 0} onChange={toggleAll} />
                  </th>
                  <th className="p-3 text-left">菜名</th>
                  <th className="p-3 text-left w-16">做法</th>
                  <th className="p-3 text-left w-16">难度</th>
                  <th className="p-3 text-left w-16">餐次</th>
                  <th className="p-3 text-left w-20">状态</th>
                  <th className="p-3 text-left w-16">问题</th>
                  <th className="p-3 text-left w-12"></th>
                </tr>
              </thead>
              <tbody>
                {data.recipes.map(r => {
                  const st = STATUS_CONFIG[r.status || 'pending'];
                  const issueCount = r.dataIssues?.length || 0;
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="p-3"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} /></td>
                      <td className="p-3">
                        <p className="font-medium">{r.nameZh}</p>
                        <p className="text-xs text-muted">{r.nameEn}</p>
                      </td>
                      <td className="p-3 text-xs">{METHOD_LABELS[r.cookingMethod] || r.cookingMethod}</td>
                      <td className="p-3 text-xs">{DIFF_LABELS[r.difficulty]}</td>
                      <td className="p-3 text-xs">{r.mealTypes.map(m => m === 'breakfast' ? '早' : m === 'lunch' ? '午' : '晚').join('/')}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${st.color}`}>
                          {st.icon}{st.label}
                        </span>
                      </td>
                      <td className="p-3">
                        {issueCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-500">
                            <AlertTriangle className="w-3 h-3" />{issueCount}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <Link href={`/admin/recipes/${r.id}`} className="text-primary hover:underline">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">共 {data.total} 道菜 · 第 {data.page}/{data.totalPages} 页</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-2 border border-border rounded disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}
                className="p-2 border border-border rounded disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
