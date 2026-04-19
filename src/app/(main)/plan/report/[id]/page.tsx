'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Brain, Clock, Users, Calendar, Sparkles } from 'lucide-react';
import { getPendingAnalysis, type PendingAnalysisPlan } from '@/lib/supabase/pending';
import { getRecipe } from '@/lib/data/recipe-repository';

export default function PlanReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = decodeURIComponent(params.id as string);
  const [data, setData] = useState<PendingAnalysisPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await getPendingAnalysis(id);
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="text-center py-16 text-muted">加载分析报告...</div>;
  if (!data) return (
    <div className="text-center py-16">
      <p className="text-muted">报告不存在或已过期</p>
      <button onClick={() => router.back()} className="mt-3 text-primary text-sm">返回</button>
    </div>
  );

  const ready = data.status === 'analyzed' || data.status === 'applied';
  const slotCount = data.basicPlan?.slots?.length || 0;
  const recipeIds = (data.basicPlan?.slots || []).flatMap(s => (s.recipes || []).map(r => r.recipeId));
  const uniqueRecipes = Array.from(new Set(recipeIds));

  return (
    <div className="space-y-4 pb-8">
      {/* 顶部 */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI 分析报告
          </h1>
          <p className="text-xs text-muted">{new Date(data.createdAt).toLocaleString('zh-CN')}</p>
        </div>
      </div>

      {/* 状态卡 */}
      <div className={`rounded-lg p-3 text-sm ${
        ready ? 'bg-purple-50 border border-purple-200' : 'bg-primary/5 border border-primary/20'
      }`}>
        {ready ? (
          <>
            <p className="font-medium text-purple-800">✓ 分析完成</p>
            <p className="text-xs text-muted mt-0.5">AI 从健康医学、营养学、搭配合理性三个角度给出建议</p>
          </>
        ) : (
          <>
            <p className="font-medium text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" /> 等待 AI 分析中
            </p>
            <p className="text-xs text-muted mt-0.5">
              方案已提交，分析师会在 24 小时内给出报告。届时此页会显示完整建议。
            </p>
          </>
        )}
      </div>

      {/* 方案概要 */}
      <div className="bg-card border border-border rounded-lg p-3 text-sm">
        <h3 className="font-semibold mb-2 flex items-center gap-1">
          <Calendar className="w-4 h-4" /> 本次方案
        </h3>
        <div className="grid grid-cols-3 gap-2 text-xs text-muted">
          <div>
            <Users className="w-3 h-3 inline mr-1" />
            {data.profile.familySize} 人
          </div>
          <div>
            <Clock className="w-3 h-3 inline mr-1" />
            {data.profile.planDays} 天
          </div>
          <div>{slotCount} 餐 · {uniqueRecipes.length} 道菜</div>
        </div>
      </div>

      {/* 报告正文 */}
      {ready && data.aiReport && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-1">
            <Brain className="w-4 h-4 text-purple-600" /> 完整建议
          </h3>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {data.aiReport}
          </div>
        </div>
      )}

      {/* 优化方案对照 */}
      {ready && data.optimizedPlan && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm font-medium text-amber-800">💡 推荐优化的菜谱替换</p>
          <p className="text-xs text-muted mt-1">分析师建议把以下菜进行调整。具体操作可以在「规划」页换菜。</p>
          {/* TODO: 详细对比 UI 待 optimizedPlan 结构稳定后实现 */}
        </div>
      )}

      {/* 菜谱清单 */}
      <div className="bg-card border border-border rounded-lg p-3">
        <h3 className="font-semibold text-sm mb-2">本次方案菜谱清单</h3>
        <div className="flex flex-wrap gap-1">
          {uniqueRecipes.map(rid => {
            const r = getRecipe(rid);
            return (
              <Link
                key={rid}
                href={`/recipe/${rid}`}
                className="text-xs bg-background border border-border rounded px-2 py-1 hover:border-primary hover:text-primary transition"
              >
                {r?.nameZh || rid}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 用户档案信息（折叠） */}
      <details className="bg-card border border-border rounded-lg p-3">
        <summary className="text-sm font-semibold cursor-pointer">分析依据 - 你的偏好档案</summary>
        <div className="mt-3 text-xs text-muted space-y-1.5">
          <p>家庭成员: {data.profile.familySize} 人</p>
          <p>每日餐次: {data.profile.mealsPerDay.join(', ')}</p>
          {data.profile.members.map(m => (
            <p key={m.id}>
              · {m.name}: {m.gender === 'male' ? '男' : '女'} · {m.dailyCalorieTarget} kcal/天
              {m.healthConditions.filter(h => h !== 'none').length > 0 && (
                <span className="text-amber-700 ml-1">· {m.healthConditions.filter(h => h !== 'none').join(',')}</span>
              )}
              {m.dietaryRestrictions.length > 0 && (
                <span className="text-red-700 ml-1">· {m.dietaryRestrictions.join(',')}</span>
              )}
              {m.fitnessGoal && m.fitnessGoal !== 'maintain' && (
                <span className="text-primary ml-1">· {m.fitnessGoal}</span>
              )}
            </p>
          ))}
          <p>菜系偏好: {data.profile.cuisinePreference.join(', ') || '不限'}</p>
          <p>口味偏好: {data.profile.flavorPreference.join(', ') || '不限'}</p>
        </div>
      </details>
    </div>
  );
}
