'use client';
import { adminFetch } from '@/lib/admin-auth';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import type { ValidationIssue } from '@/lib/data/validation';

interface ValidationData {
  issues: ValidationIssue[];
  stats: { total: number; errors: number; warnings: number; byType: Record<string, number> };
}

const TYPE_LABELS: Record<string, string> = {
  missing_field: '缺失字段',
  invalid_ingredient: '无效食材',
  duplicate_name: '菜名重复',
  abnormal_data: '异常数据',
};

export default function ValidationPage() {
  const [data, setData] = useState<ValidationData | null>(null);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    adminFetch('/api/admin/recipes/validation').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <p className="text-muted">校验中...</p>;

  const filtered = typeFilter
    ? data.issues.filter(i => i.type === typeFilter)
    : data.issues;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">数据校验报告</h1>

      {/* 统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="总问题" value={data.stats.total} color="text-foreground" />
        <StatCard label="错误" value={data.stats.errors} color="text-red-500" />
        <StatCard label="警告" value={data.stats.warnings} color="text-yellow-500" />
        <StatCard label="菜谱涉及" value={new Set(data.issues.map(i => i.recipeId)).size} color="text-muted" />
      </div>

      {/* 按类型统计 */}
      <div className="flex gap-2 flex-wrap">
        <FilterBtn label="全部" active={!typeFilter} onClick={() => setTypeFilter('')} count={data.stats.total} />
        {Object.entries(data.stats.byType).map(([type, count]) => (
          <FilterBtn key={type} label={TYPE_LABELS[type] || type} active={typeFilter === type} onClick={() => setTypeFilter(type)} count={count} />
        ))}
      </div>

      {/* 问题列表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>没有发现数据问题</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="p-3 text-left">严重程度</th>
                <th className="p-3 text-left">类型</th>
                <th className="p-3 text-left">菜谱</th>
                <th className="p-3 text-left">问题描述</th>
                <th className="p-3 text-left w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((issue, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="p-3">
                    {issue.severity === 'error' ? (
                      <span className="flex items-center gap-1 text-red-500"><XCircle className="w-4 h-4" />错误</span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-500"><AlertTriangle className="w-4 h-4" />警告</span>
                    )}
                  </td>
                  <td className="p-3 text-xs">{TYPE_LABELS[issue.type] || issue.type}</td>
                  <td className="p-3">
                    <p className="font-medium">{issue.recipeName}</p>
                    <p className="text-xs text-muted">{issue.recipeId}</p>
                  </td>
                  <td className="p-3 text-muted">{issue.message}</td>
                  <td className="p-3">
                    <Link href={`/admin/recipes/${issue.recipeId}`} className="text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 text-center">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function FilterBtn({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
        active ? 'bg-primary text-white' : 'bg-card border border-border hover:border-primary/50'
      }`}
    >
      {label} ({count})
    </button>
  );
}
