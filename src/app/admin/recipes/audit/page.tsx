'use client';
import { adminFetch } from '@/lib/admin-auth';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { UtensilsCrossed, RefreshCw, CheckCircle, AlertTriangle, AlertCircle, ExternalLink } from 'lucide-react';
import type { RecipeAuditReport } from '@/lib/data/recipe-audit';

type SectionKey =
  | 'methodMismatch' | 'ingredientMismatch' | 'timeUnreasonable' | 'servingMismatch'
  | 'englishNameBad' | 'duplicateName' | 'stepsMissing' | 'tagInconsistent'
  | 'mealTypeIssue' | 'missingDescription' | 'totalCalAbnormal' | 'ingMissing';

const SECTION_LABELS: Record<SectionKey, string> = {
  methodMismatch: '① 做法(cookingMethod)与名字不匹配',
  ingredientMismatch: '② 名字含肉但食材无肉',
  timeUnreasonable: '③ 时间估算不合理',
  servingMismatch: '④ 份数异常',
  englishNameBad: '⑤ 英文名问题',
  duplicateName: '⑥ 重名菜谱',
  stepsMissing: '⑦ 步骤缺失',
  tagInconsistent: '⑧ 标签与分类冲突',
  mealTypeIssue: '⑨ 餐次问题',
  missingDescription: '⑩ 描述缺失/过短',
  totalCalAbnormal: '⑪ 热量异常',
  ingMissing: '⑫ 食材ID不存在',
};

export default function RecipeAuditPage() {
  const [report, setReport] = useState<RecipeAuditReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/recipes/audit');
      if (res.ok) setReport(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-sm text-muted">加载中...</p>;
  if (!report) return <p className="text-sm text-red-500">加载失败</p>;

  const allClear = report.totalIssueCount === 0;
  const issuePct = report.total > 0 ? (report.withIssuesCount / report.total * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6" /> 菜谱质量审计
        </h1>
        <button onClick={load} className="flex items-center gap-1 text-sm px-3 py-1.5 border border-border rounded hover:bg-card">
          <RefreshCw className="w-3.5 h-3.5" /> 刷新
        </button>
      </div>

      {/* 总览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="菜谱总数" value={report.total} icon={<UtensilsCrossed className="w-4 h-4 text-primary" />} />
        <StatCard label="问题项" value={report.totalIssueCount} icon={
          allClear ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />
        } color={allClear ? 'text-green-600' : 'text-amber-600'} />
        <StatCard label="问题菜谱数" value={report.withIssuesCount} icon={<AlertCircle className="w-4 h-4 text-amber-500" />} />
        <StatCard label="问题率" value={Number(issuePct)} unit="%" icon={<AlertCircle className="w-4 h-4 text-muted" />} />
      </div>

      {allClear && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> 菜谱质量全部通过, 0 问题项
        </div>
      )}

      {/* 12 个分类区块 */}
      {(Object.keys(SECTION_LABELS) as SectionKey[]).map(key => {
        const items = report[key] as Array<Record<string, unknown>>;
        if (items.length === 0) return null;
        return (
          <IssueSection
            key={key}
            title={SECTION_LABELS[key]}
            items={items}
            sectionKey={key}
          />
        );
      })}
    </div>
  );
}

function StatCard({ icon, label, value, color = 'text-foreground', unit }: { icon: React.ReactNode; label: string; value: number; color?: string; unit?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-muted">{label}</span></div>
      <p className={`text-2xl font-bold ${color}`}>{value}{unit ? <span className="text-base">{unit}</span> : ''}</p>
    </div>
  );
}

function IssueSection({ title, items, sectionKey }: { title: string; items: Array<Record<string, unknown>>; sectionKey: SectionKey }) {
  const isError = sectionKey === 'ingMissing' || sectionKey === 'duplicateName';
  return (
    <div className={`bg-card border ${isError ? 'border-red-300' : 'border-amber-300'} rounded-lg p-4`}>
      <h2 className="font-semibold mb-2">{title} <span className="text-sm text-muted">({items.length})</span></h2>
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {items.slice(0, 50).map((it, idx) => (
          <div key={`${it.id}_${idx}`} className="text-sm flex items-center gap-2">
            <Link
              href={`/admin/recipes/${encodeURIComponent(String(it.id))}`}
              className="text-primary hover:underline flex items-center gap-1 min-w-0"
            >
              <code className="font-mono text-xs">{String(it.id)}</code>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-foreground">{String(it.name || it.nameZh || '')}</span>
            {it.detail !== undefined && <span className="text-xs text-muted">— {String(it.detail)}</span>}
            {it.expected !== undefined && (
              <span className="text-xs text-muted">— {String(it.cookingMethod)} → {String(it.expected)}</span>
            )}
            {it.nameEn !== undefined && (
              <span className="text-xs text-muted">— EN: {String(it.nameEn || '(空)')}</span>
            )}
          </div>
        ))}
        {items.length > 50 && (
          <p className="text-xs text-muted">... 还有 {items.length - 50} 条</p>
        )}
      </div>
    </div>
  );
}
