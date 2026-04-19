/**
 * 待处理队列: 搜索无结果 / AI 分析待处理菜谱
 * 数据存储优先级: Supabase(已配置时) → localStorage(fallback)
 *
 * 需要先在 Supabase Dashboard 执行 supabase/migrations/20260419_pending_tables.sql
 * 如果未创建表也能正常工作，数据会存在 localStorage 中
 */
import { supabase, isSupabaseEnabled } from './client';
import { getDeviceId } from './sync';
import type { UserProfile, WeeklyPlan } from '@/types';

// ============================================================
// 需求1: 搜索无结果请求
// ============================================================

export interface PendingRecipeRequest {
  id: string;
  query: string;
  parsedDims?: unknown;
  excludeIngredients?: string[];
  deviceId: string;
  createdAt: string;
  status: 'pending' | 'added' | 'ignored';
  note?: string;
}

const LS_REQUESTS = 'dailybuy_pending_requests';

/** 客户端: 保存搜索无结果请求 */
export async function savePendingRequest(
  query: string,
  parsedDims?: unknown,
  excludeIngredients?: string[]
): Promise<boolean> {
  const record: PendingRecipeRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    query,
    parsedDims,
    excludeIngredients: excludeIngredients || [],
    deviceId: typeof window !== 'undefined' ? getDeviceId() : 'server',
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  // 优先 Supabase
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from('pending_recipe_requests').insert({
      id: record.id,
      query: record.query,
      parsed_dims: record.parsedDims || null,
      exclude_ingredients: record.excludeIngredients,
      device_id: record.deviceId,
      status: 'pending',
    });
    if (!error) return true;
    console.warn('Supabase 待新增菜谱写入失败(表可能未创建):', error.message);
  }

  // Fallback: localStorage
  if (typeof window !== 'undefined') {
    const all = listPendingRequestsLocal();
    all.unshift(record);
    // 保留最近 200 条
    localStorage.setItem(LS_REQUESTS, JSON.stringify(all.slice(0, 200)));
    return true;
  }
  return false;
}

export function listPendingRequestsLocal(): PendingRecipeRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_REQUESTS) || '[]');
  } catch { return []; }
}

/** 读取所有待处理请求(合并 Supabase + localStorage) */
export async function listPendingRequests(): Promise<PendingRecipeRequest[]> {
  const local = listPendingRequestsLocal();
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from('pending_recipe_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error && data) {
      const cloud: PendingRecipeRequest[] = data.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        query: r.query as string,
        parsedDims: r.parsed_dims,
        excludeIngredients: (r.exclude_ingredients as string[]) || [],
        deviceId: r.device_id as string,
        createdAt: r.created_at as string,
        status: (r.status as 'pending' | 'added' | 'ignored') || 'pending',
        note: r.note as string | undefined,
      }));
      // 合并去重
      const seen = new Set(cloud.map(c => c.id));
      return [...cloud, ...local.filter(l => !seen.has(l.id))];
    }
  }
  return local;
}

/** 更新请求状态 */
export async function updatePendingRequest(
  id: string,
  updates: { status?: 'pending' | 'added' | 'ignored'; note?: string }
): Promise<boolean> {
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase
      .from('pending_recipe_requests')
      .update(updates)
      .eq('id', id);
    if (!error) return true;
  }
  if (typeof window !== 'undefined') {
    const all = listPendingRequestsLocal();
    const idx = all.findIndex(r => r.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...updates };
      localStorage.setItem(LS_REQUESTS, JSON.stringify(all));
      return true;
    }
  }
  return false;
}

// ============================================================
// 需求2: AI 队列分析方案
// ============================================================

export interface PendingAnalysisPlan {
  id: string;
  profile: UserProfile;
  basicPlan: WeeklyPlan;              // 基础库生成的原始方案
  deviceId: string;
  createdAt: string;
  status: 'pending' | 'analyzing' | 'analyzed' | 'applied' | 'skipped';
  aiReport?: string;                  // Claude Code 分析后填入
  optimizedPlan?: WeeklyPlan;         // 优化后的方案
  analyzedAt?: string;
}

const LS_ANALYSIS = 'dailybuy_pending_analysis';

export async function savePendingAnalysis(
  profile: UserProfile,
  basicPlan: WeeklyPlan
): Promise<string | null> {
  const id = `ana_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record: PendingAnalysisPlan = {
    id,
    profile,
    basicPlan,
    deviceId: typeof window !== 'undefined' ? getDeviceId() : 'server',
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from('pending_analysis_plans').insert({
      id: record.id,
      profile: record.profile,
      basic_plan: record.basicPlan,
      device_id: record.deviceId,
      status: 'pending',
    });
    if (!error) return id;
    console.warn('Supabase 待分析方案写入失败(表可能未创建):', error.message);
  }

  if (typeof window !== 'undefined') {
    const all = listPendingAnalysisLocal();
    all.unshift(record);
    localStorage.setItem(LS_ANALYSIS, JSON.stringify(all.slice(0, 100)));
    return id;
  }
  return null;
}

/** 根据 ID 获取单个待分析方案 */
export async function getPendingAnalysis(id: string): Promise<PendingAnalysisPlan | null> {
  // 先 localStorage
  const local = listPendingAnalysisLocal().find(p => p.id === id);
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from('pending_analysis_plans')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!error && data) {
      const r = data as Record<string, unknown>;
      return {
        id: r.id as string,
        profile: r.profile as UserProfile,
        basicPlan: r.basic_plan as WeeklyPlan,
        deviceId: r.device_id as string,
        createdAt: r.created_at as string,
        status: (r.status as PendingAnalysisPlan['status']) || 'pending',
        aiReport: r.ai_report as string | undefined,
        optimizedPlan: r.optimized_plan as WeeklyPlan | undefined,
        analyzedAt: r.analyzed_at as string | undefined,
      };
    }
  }
  return local || null;
}

export function listPendingAnalysisLocal(): PendingAnalysisPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_ANALYSIS) || '[]');
  } catch { return []; }
}

export async function listPendingAnalysis(): Promise<PendingAnalysisPlan[]> {
  const local = listPendingAnalysisLocal();
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from('pending_analysis_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error && data) {
      const cloud: PendingAnalysisPlan[] = data.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        profile: r.profile as UserProfile,
        basicPlan: r.basic_plan as WeeklyPlan,
        deviceId: r.device_id as string,
        createdAt: r.created_at as string,
        status: (r.status as PendingAnalysisPlan['status']) || 'pending',
        aiReport: r.ai_report as string | undefined,
        optimizedPlan: r.optimized_plan as WeeklyPlan | undefined,
        analyzedAt: r.analyzed_at as string | undefined,
      }));
      const seen = new Set(cloud.map(c => c.id));
      return [...cloud, ...local.filter(l => !seen.has(l.id))];
    }
  }
  return local;
}

export async function updatePendingAnalysis(
  id: string,
  updates: Partial<Pick<PendingAnalysisPlan, 'status' | 'aiReport' | 'optimizedPlan' | 'analyzedAt'>>
): Promise<boolean> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.aiReport !== undefined) dbUpdates.ai_report = updates.aiReport;
  if (updates.optimizedPlan !== undefined) dbUpdates.optimized_plan = updates.optimizedPlan;
  if (updates.analyzedAt !== undefined) dbUpdates.analyzed_at = updates.analyzedAt;

  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase
      .from('pending_analysis_plans')
      .update(dbUpdates)
      .eq('id', id);
    if (!error) return true;
  }
  if (typeof window !== 'undefined') {
    const all = listPendingAnalysisLocal();
    const idx = all.findIndex(r => r.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...updates };
      localStorage.setItem(LS_ANALYSIS, JSON.stringify(all));
      return true;
    }
  }
  return false;
}

// ============================================================
// 需求3: 菜谱编辑建议 (用户可编辑, 进入审批队列)
// ============================================================

import type { Recipe } from '@/types';

export interface PendingRecipeEdit {
  id: string;
  recipeId: string;           // 目标菜谱 ID
  originalName: string;        // 原菜名(便于列表显示)
  edited: Partial<Recipe>;     // 用户编辑的字段(只含改动)
  reason?: string;             // 用户填写的修改原因
  deviceId: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerNote?: string;
}

const LS_RECIPE_EDITS = 'dailybuy_pending_recipe_edits';

export async function savePendingRecipeEdit(
  recipeId: string,
  originalName: string,
  edited: Partial<Recipe>,
  reason?: string,
): Promise<boolean> {
  const record: PendingRecipeEdit = {
    id: `edit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    recipeId,
    originalName,
    edited,
    reason,
    deviceId: typeof window !== 'undefined' ? getDeviceId() : 'server',
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from('pending_recipe_edits').insert({
      id: record.id,
      recipe_id: record.recipeId,
      original_name: record.originalName,
      edited: record.edited,
      reason: record.reason || null,
      device_id: record.deviceId,
      status: 'pending',
    });
    if (!error) return true;
    console.warn('Supabase 待审编辑写入失败(表可能未创建):', error.message);
  }

  if (typeof window !== 'undefined') {
    const all = listPendingRecipeEditsLocal();
    all.unshift(record);
    localStorage.setItem(LS_RECIPE_EDITS, JSON.stringify(all.slice(0, 200)));
    return true;
  }
  return false;
}

export function listPendingRecipeEditsLocal(): PendingRecipeEdit[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_RECIPE_EDITS) || '[]');
  } catch { return []; }
}

export async function listPendingRecipeEdits(): Promise<PendingRecipeEdit[]> {
  const local = listPendingRecipeEditsLocal();
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from('pending_recipe_edits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error && data) {
      const cloud: PendingRecipeEdit[] = data.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        recipeId: r.recipe_id as string,
        originalName: r.original_name as string,
        edited: r.edited as Partial<Recipe>,
        reason: r.reason as string | undefined,
        deviceId: r.device_id as string,
        createdAt: r.created_at as string,
        status: (r.status as 'pending' | 'approved' | 'rejected') || 'pending',
        reviewerNote: r.reviewer_note as string | undefined,
      }));
      const seen = new Set(cloud.map(c => c.id));
      return [...cloud, ...local.filter(l => !seen.has(l.id))];
    }
  }
  return local;
}

export async function updatePendingRecipeEdit(
  id: string,
  updates: { status?: 'pending' | 'approved' | 'rejected'; reviewerNote?: string }
): Promise<boolean> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.reviewerNote !== undefined) dbUpdates.reviewer_note = updates.reviewerNote;

  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase
      .from('pending_recipe_edits')
      .update(dbUpdates)
      .eq('id', id);
    if (!error) return true;
  }
  if (typeof window !== 'undefined') {
    const all = listPendingRecipeEditsLocal();
    const idx = all.findIndex(r => r.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...updates };
      localStorage.setItem(LS_RECIPE_EDITS, JSON.stringify(all));
      return true;
    }
  }
  return false;
}
