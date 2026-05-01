'use client';
import { adminFetch } from '@/lib/admin-auth';

import { useEffect, useState, useCallback } from 'react';
import { Apple, RefreshCw, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import type { IngredientAuditReport } from '@/lib/data/ingredient-audit';

export default function IngredientAuditPage() {
  const [report, setReport] = useState<IngredientAuditReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/ingredients/audit');
      if (res.ok) setReport(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-sm text-muted">加载中...</p>;
  if (!report) return <p className="text-sm text-red-500">加载失败</p>;

  const allClear = report.totalIssueCount === 0;

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Apple className="w-6 h-6" /> 食材库审计
        </h1>
        <button onClick={load} className="flex items-center gap-1 text-sm px-3 py-1.5 border border-border rounded hover:bg-card">
          <RefreshCw className="w-3.5 h-3.5" /> 刷新
        </button>
      </div>

      {/* 总览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Apple className="w-4 h-4 text-primary" />} label="食材总数" value={report.total} />
        <StatCard icon={<Apple className="w-4 h-4 text-muted" />} label="服务菜谱" value={report.recipeCount} />
        <StatCard
          icon={allClear ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
          label="问题项"
          value={report.totalIssueCount}
          color={allClear ? 'text-green-600' : 'text-amber-600'}
        />
        <StatCard
          icon={<AlertCircle className="w-4 h-4 text-red-500" />}
          label="Broken Refs"
          value={report.brokenRefs.length}
          color={report.brokenRefs.length > 0 ? 'text-red-600' : 'text-muted'}
        />
      </div>

      {allClear && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> 食材库完整健康, 0 问题项
        </div>
      )}

      {/* 分类分布 */}
      <Section title="分类分布">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(report.catDist).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <div key={cat} className="bg-card border border-border rounded p-2 text-sm">
              <p className="text-xs text-muted">{cat}</p>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Broken refs */}
      {report.brokenRefs.length > 0 && (
        <Section title={`🔴 Broken Refs (${report.brokenRefs.length})`} severity="error">
          <p className="text-xs text-muted mb-2">菜谱引用了, 但食材库中不存在</p>
          <div className="space-y-1">
            {report.brokenRefs.map(b => (
              <div key={b.id} className="text-sm flex items-center gap-2">
                <code className="font-mono bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{b.id}</code>
                <span className="text-xs text-muted">被 {b.recipes.length} 道菜引用 (例: {b.recipes.slice(0, 2).join(', ')})</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 数据完整性 */}
      {Object.values(report.dataIssues).some(v => v.length > 0) && (
        <Section title="数据完整性问题" severity="warn">
          <DataIssueRow label="无营养数据" items={report.dataIssues.noNutrition} />
          <DataIssueRow label="无价格" items={report.dataIssues.noPrice} />
          <DataIssueRow label="无单位" items={report.dataIssues.noUnit} />
          <DataIssueRow label="无分类" items={report.dataIssues.noCategory} />
          <DataIssueRow label="无中文名" items={report.dataIssues.noNameZh} />
          <DataIssueRow label="无英文名" items={report.dataIssues.noNameEn} />
          <DataIssueRow label="无超市标签" items={report.dataIssues.noSupermarkets} />
        </Section>
      )}

      {/* 营养异常 */}
      {(report.nutritionIssues.calZero.length + report.nutritionIssues.calHigh.length + report.nutritionIssues.noFiber.length) > 0 && (
        <Section title="营养数据异常" severity="warn">
          {report.nutritionIssues.calZero.length > 0 && (
            <p className="text-sm">热量为 0 (非调料): {report.nutritionIssues.calZero.length}</p>
          )}
          {report.nutritionIssues.calHigh.length > 0 && (
            <p className="text-sm">热量 &gt; 800 kcal/100g: {report.nutritionIssues.calHigh.map(x => `${x.name}(${x.cal})`).join(', ')}</p>
          )}
          {report.nutritionIssues.noFiber.length > 0 && (
            <p className="text-sm">蔬果纤维为 0: {report.nutritionIssues.noFiber.map(x => x.name).join(', ')}</p>
          )}
        </Section>
      )}

      {/* 重名 */}
      {report.duplicateNames.length > 0 && (
        <Section title={`重名食材 (${report.duplicateNames.length})`} severity="warn">
          {report.duplicateNames.map(d => (
            <p key={d.name} className="text-sm">
              <span className="font-medium">{d.name}</span>: {d.ids.join(' + ')}
            </p>
          ))}
        </Section>
      )}

      {/* 价格异常 */}
      {(report.priceIssues.zero.length + report.priceIssues.veryHigh.length) > 0 && (
        <Section title="价格异常" severity="info">
          {report.priceIssues.zero.length > 0 && (
            <p className="text-sm">价格为 0: {report.priceIssues.zero.map(x => x.name).join(', ')}</p>
          )}
          {report.priceIssues.veryHigh.length > 0 && (
            <div className="text-sm">
              <p className="text-muted">价格 &gt; $100 (待人工核实):</p>
              {report.priceIssues.veryHigh.map(x => (
                <p key={x.id} className="ml-2">- {x.name}: ${x.price}</p>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* 孤立食材 */}
      {report.orphaned.length > 0 && (
        <Section title={`孤立食材 (${report.orphaned.length}, 无菜谱使用)`} severity="info">
          <p className="text-xs text-muted mb-2">通常是给未来扩展菜谱准备的, 不算问题</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs">
            {report.orphaned.slice(0, 30).map(o => (
              <span key={o.id} className="text-muted">{o.nameZh} <span className="text-[10px]">({o.category})</span></span>
            ))}
          </div>
          {report.orphaned.length > 30 && <p className="text-xs text-muted mt-1">... 还有 {report.orphaned.length - 30} 个</p>}
        </Section>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color = 'text-foreground' }: { icon: React.ReactNode; label: string; value: number; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-muted">{label}</span></div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Section({ title, children, severity = 'info' }: { title: string; children: React.ReactNode; severity?: 'info' | 'warn' | 'error' }) {
  const borderColor =
    severity === 'error' ? 'border-red-300' :
    severity === 'warn' ? 'border-amber-300' :
    'border-border';
  return (
    <div className={`bg-card border ${borderColor} rounded-lg p-4`}>
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function DataIssueRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <p className="text-sm">
      <span className="font-medium">{label}</span>: {items.length} 个
      <span className="text-xs text-muted ml-2">{items.slice(0, 5).join(', ')}{items.length > 5 ? '...' : ''}</span>
    </p>
  );
}
