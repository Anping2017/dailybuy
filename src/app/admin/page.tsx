'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UtensilsCrossed, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface Stats {
  total: number; reviewed: number; pending: number; disabled: number; withIssues: number;
  byCuisine: Record<string, number>;
  byMethod: Record<string, number>;
  byMeal: Record<string, number>;
}

const METHOD_LABELS: Record<string, string> = {
  stir_fry: '炒菜', braise: '红烧/卤', stew: '炖/煲', steam: '蒸', boil: '煮/汆',
  cold_dish: '凉拌', deep_fry: '炸/煎', roast: '烤/焗', dry_pot: '干锅', soup: '汤羹', staple: '主食',
};
const CUISINE_LABELS: Record<string, string> = {
  chinese: '中餐', western: '西餐', asian_other: '亚洲其他', fusion: '混合',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/recipes/stats').then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return <p className="text-muted">加载中...</p>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">菜谱管理概览</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card icon={<UtensilsCrossed className="w-5 h-5 text-primary" />} label="总菜谱" value={stats.total} />
        <Card icon={<CheckCircle className="w-5 h-5 text-green-500" />} label="已审核" value={stats.reviewed} />
        <Card icon={<Clock className="w-5 h-5 text-yellow-500" />} label="待审核" value={stats.pending} href="/admin/recipes?status=pending" />
        <Card icon={<XCircle className="w-5 h-5 text-gray-400" />} label="已禁用" value={stats.disabled} />
        <Card icon={<AlertTriangle className="w-5 h-5 text-red-500" />} label="有问题" value={stats.withIssues} href="/admin/validation" />
      </div>

      {/* 分布 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DistCard title="菜系分布" data={stats.byCuisine} labels={CUISINE_LABELS} total={stats.total} />
        <DistCard title="做法分布" data={stats.byMethod} labels={METHOD_LABELS} total={stats.total} />
        <DistCard title="餐次分布" data={stats.byMeal} labels={{ breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }} total={stats.total} />
      </div>
    </div>
  );
}

function Card({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href?: string }) {
  const content = (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition">
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-muted">{label}</span></div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function DistCard({ title, data, labels, total }: { title: string; data: Record<string, number>; labels: Record<string, string>; total: number }) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      <div className="space-y-2">
        {sorted.map(([key, count]) => (
          <div key={key}>
            <div className="flex justify-between text-xs mb-0.5">
              <span>{labels[key] || key}</span>
              <span className="text-muted">{count} ({Math.round(count / total * 100)}%)</span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${(count / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
