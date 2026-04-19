'use client';

import type { Recipe, Allergen } from '@/types';

// 中文标签字典 — 与 ingredient 详情页保持一致
const WARNING_LABELS: Record<string, string> = {
  high_sodium: '高钠', high_sugar: '高糖', high_fat: '高脂',
  high_carb: '高碳水', high_calorie: '高热量', high_gi: '高升糖',
};
const HIGHLIGHT_LABELS: Record<string, string> = {
  high_protein: '高蛋白', high_fiber: '高纤维', low_fat: '低脂', low_calorie: '低卡',
  whole_grain: '全谷物', high_iron: '高铁', high_iodine: '高碘', high_zinc: '高锌',
  high_vitamin_a: '高维A', high_vitamin: '富维生素',
};
const FLAG_LABELS: Record<string, string> = {
  high_purine: '高嘌呤', processed: '加工肉', contains_alcohol: '含酒精',
  high_cholesterol: '高胆固醇',
};
const ALLERGEN_LABELS: Record<Allergen, string> = {
  allergen_gluten: '麸质', allergen_dairy: '乳制品', allergen_nut: '坚果',
  allergen_sesame: '芝麻', allergen_seafood: '海鲜', allergen_egg: '蛋', allergen_soy: '大豆',
};

export interface NutritionBadgesProps {
  recipe: Pick<Recipe, 'nutritionWarnings' | 'nutritionHighlights' | 'dietaryFlags' | 'allergens'>;
  /** compact: 列表/卡片模式,只显示前 3 个最关键的徽章 */
  compact?: boolean;
  /** 是否显示过敏原 */
  showAllergens?: boolean;
}

/** 徽章排序优先级 — 警告 > 标记 > 亮点 > 过敏原 */
function rankBadges(props: NutritionBadgesProps) {
  const out: { kind: 'warn' | 'flag' | 'high' | 'allergen'; tag: string; label: string }[] = [];
  // 警告(红): 最重要
  for (const t of props.recipe.nutritionWarnings || []) {
    out.push({ kind: 'warn', tag: t, label: WARNING_LABELS[t] || t });
  }
  // 食材聚合标记(橙): 嘌呤/加工/酒精
  for (const t of props.recipe.dietaryFlags || []) {
    out.push({ kind: 'flag', tag: t, label: FLAG_LABELS[t] || t });
  }
  // 营养亮点(绿)
  for (const t of props.recipe.nutritionHighlights || []) {
    out.push({ kind: 'high', tag: t, label: HIGHLIGHT_LABELS[t] || t });
  }
  // 过敏原(灰橙)
  if (props.showAllergens !== false) {
    for (const t of props.recipe.allergens || []) {
      out.push({ kind: 'allergen', tag: t, label: '含' + (ALLERGEN_LABELS[t] || t) });
    }
  }
  return out;
}

const COLOR: Record<'warn' | 'flag' | 'high' | 'allergen', string> = {
  warn: 'bg-red-50 text-red-600 border-red-100',
  flag: 'bg-orange-50 text-orange-700 border-orange-100',
  high: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  allergen: 'bg-amber-50 text-amber-700 border-amber-100',
};

export function NutritionBadges(props: NutritionBadgesProps) {
  const all = rankBadges(props);
  if (all.length === 0) return null;
  const items = props.compact ? all.slice(0, 3) : all;

  return (
    <div className="flex flex-wrap gap-1">
      {items.map(b => (
        <span
          key={b.kind + ':' + b.tag}
          className={`text-[10px] px-1.5 py-0.5 rounded border ${COLOR[b.kind]}`}
        >
          {b.label}
        </span>
      ))}
      {props.compact && all.length > 3 && (
        <span className="text-[10px] px-1 py-0.5 text-muted">+{all.length - 3}</span>
      )}
    </div>
  );
}

/** 每份营养简要展示 — 卡片用 */
export function PerServingMini({ recipe }: { recipe: Pick<Recipe, 'perServing'> }) {
  const ps = recipe.perServing;
  if (!ps) return null;
  return (
    <span className="text-xs text-muted">
      <span className="text-accent font-medium">{ps.calories}</span>kcal · 蛋白
      <span className="font-medium">{ps.protein}</span>g · 脂
      <span className="font-medium">{ps.fat}</span>g
    </span>
  );
}

/** 每份营养完整面板 — 详情页用 */
export function PerServingPanel({ recipe }: { recipe: Pick<Recipe, 'perServing'> }) {
  const ps = recipe.perServing;
  if (!ps) return null;
  const totalMacros = ps.protein + ps.fat + ps.carbs || 1;
  const pP = Math.round((ps.protein / totalMacros) * 100);
  const fP = Math.round((ps.fat / totalMacros) * 100);
  const cP = 100 - pP - fP;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-semibold text-sm">每份营养</h3>
        <span className="text-2xl font-bold text-accent">{ps.calories}<span className="text-sm font-normal text-muted ml-1">kcal</span></span>
      </div>
      {/* 三大宏量素 — 横条 */}
      <div className="flex h-2 rounded-full overflow-hidden mb-1.5">
        <div className="bg-blue-400" style={{ width: `${pP}%` }} title={`蛋白 ${pP}%`} />
        <div className="bg-yellow-400" style={{ width: `${fP}%` }} title={`脂肪 ${fP}%`} />
        <div className="bg-green-400" style={{ width: `${cP}%` }} title={`碳水 ${cP}%`} />
      </div>
      <div className="flex justify-between text-[11px] text-muted mb-3">
        <span>蛋白 {ps.protein}g ({pP}%)</span>
        <span>脂肪 {ps.fat}g ({fP}%)</span>
        <span>碳水 {ps.carbs}g ({cP}%)</span>
      </div>
      {/* 钠/糖/纤维 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Cell label="钠" value={`${ps.sodium}mg`} warn={ps.sodium >= 800} />
        <Cell label="糖" value={`${ps.sugar}g`} warn={ps.sugar >= 20} />
        <Cell label="膳食纤维" value={`${ps.fiber}g`} highlight={ps.fiber >= 6} />
      </div>
    </div>
  );
}

function Cell({ label, value, warn, highlight }: { label: string; value: string; warn?: boolean; highlight?: boolean }) {
  const cls = warn ? 'text-red-600' : highlight ? 'text-emerald-600' : 'text-foreground';
  return (
    <div>
      <p className={`text-sm font-semibold ${cls}`}>{value}</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}
