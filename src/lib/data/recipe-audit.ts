/**
 * 菜谱质量审计 — 服务端 + CLI 共用
 * 12 项检查
 */
import type { Recipe, Ingredient } from '@/types';

export interface RecipeAuditIssue {
  id: string;
  name: string;
  detail?: string;
}

export interface RecipeAuditReport {
  total: number;
  withIssuesCount: number;
  totalIssueCount: number;
  methodMismatch: { id: string; name: string; cookingMethod: string; expected: string }[];
  ingredientMismatch: RecipeAuditIssue[];
  timeUnreasonable: (RecipeAuditIssue & { total: number })[];
  servingMismatch: (RecipeAuditIssue & { servings?: number })[];
  englishNameBad: (RecipeAuditIssue & { nameZh: string; nameEn?: string })[];
  duplicateName: RecipeAuditIssue[];
  stepsMissing: RecipeAuditIssue[];
  tagInconsistent: RecipeAuditIssue[];
  mealTypeIssue: RecipeAuditIssue[];
  missingDescription: RecipeAuditIssue[];
  totalCalAbnormal: (RecipeAuditIssue & { totalCal: number; perServing: number })[];
  ingMissing: (RecipeAuditIssue & { missingIng: string })[];
}

const MEAT_CATS = new Set(['meat', 'seafood']);

function nameContainsMeat(name: string): boolean {
  const FALSE_POS = /牛油果|牛奶|牛奶油|鸡蛋|鸡精|鸡毛菜|鱼露|鱼腥草|虾皮|虾米|虾酱|天贝|肉桂|羊栖菜|蟹味菇|鹅肝|肉豆蔻|鱼香(?!肉)/;
  if (FALSE_POS.test(name)) return false;
  return /牛肉|猪肉|鸡肉|羊肉|鸭肉|鱼肉|虾|蟹|贝壳|肉末|肉丝|肉片|五花|里脊|排骨|鸡翅|鸡腿|鸡丁|鸡胸|火腿|腊肠|香肠|培根|熏肉|鱼片|鱼头|鱼丸|鱿鱼|虾仁|扇贝|牛排|牛腩|牛腱|牛舌|鸡爪|鸡肝|牛筋|猪蹄|肉包|肉馅|卤肉|烧肉|烤肉|叉烧|鱼排|羊排|羊腿/.test(name);
}
function nameSuggestsCold(name: string): boolean {
  return /凉拌|凉菜|沙拉|拍[^面粉]|冷/.test(name);
}
function nameSuggestsSoup(name: string): boolean {
  if (/汤圆|汤饭|汤面|汤粉|汤包/.test(name)) return false;
  return /汤$|羹$|煲$|高汤|清汤|浓汤/.test(name);
}
function nameSuggestsStaple(name: string): boolean {
  if (/凉拌|凉菜|沙拉|拌(?!面|粉|饭)|蘸料|包菜|包心菜|大白菜|小白菜|菜花/.test(name)) return false;
  return /粥|饭$|米饭|蛋炒饭|盖饭|烩饭|炒饭|寿司|意面|乌冬|拉面|肠粉|河粉|米线|米粉|面条|面$|凉面|拌面|炒面|面包|馒头|花卷|烧饼|大饼|烙饼|煎饼|蛋饼|包子|小笼|饺子|馄饨|粽子|汤圆/.test(name);
}
function nameSuggestsBraise(name: string): boolean {
  return /红烧|焖|炖|煨|卤|酱烧|糖醋烧/.test(name);
}
function nameSuggestsSteam(name: string): boolean {
  return /蒸|清蒸|粉蒸/.test(name);
}

export function auditRecipes(
  recipes: Recipe[],
  ingredients: Ingredient[],
): RecipeAuditReport {
  const ingById = new Map(ingredients.map(i => [i.id, i]));
  const hasMeatIng = (r: Recipe) => r.ingredients.some(ri => {
    const ing = ingById.get(ri.ingredientId);
    return ing && MEAT_CATS.has(ing.category);
  });

  const r: RecipeAuditReport = {
    total: recipes.length,
    withIssuesCount: 0,
    totalIssueCount: 0,
    methodMismatch: [],
    ingredientMismatch: [],
    timeUnreasonable: [],
    servingMismatch: [],
    englishNameBad: [],
    duplicateName: [],
    stepsMissing: [],
    tagInconsistent: [],
    mealTypeIssue: [],
    missingDescription: [],
    totalCalAbnormal: [],
    ingMissing: [],
  };

  const nameMap = new Map<string, string>();
  const withIssues = new Set<string>();
  const flag = (id: string) => withIssues.add(id);

  for (const recipe of recipes) {
    const id = recipe.id;
    const name = recipe.nameZh || '';

    // ① cookingMethod (优先级链: cold > staple > soup > braise > steam)
    let expected: string | null = null;
    if (nameSuggestsCold(name)) expected = 'cold_dish';
    else if (nameSuggestsStaple(name)) expected = 'staple';
    else if (nameSuggestsSoup(name)) expected = 'soup';
    else if (nameSuggestsBraise(name)) expected = 'braise';
    else if (nameSuggestsSteam(name)) expected = 'steam';
    if (expected && recipe.cookingMethod !== expected) {
      if (!(expected === 'braise' && recipe.cookingMethod === 'stew')) {
        r.methodMismatch.push({ id, name, cookingMethod: recipe.cookingMethod, expected });
        flag(id);
      }
    }

    // ② name vs ingredient
    if (nameContainsMeat(name) && !hasMeatIng(recipe)) {
      r.ingredientMismatch.push({ id, name, detail: '名字含肉但食材无肉' });
      flag(id);
    }

    // ③ time
    const total = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    if (nameSuggestsBraise(name) && total < 30) {
      r.timeUnreasonable.push({ id, name, total, detail: '红烧/炖通常 > 30 分钟' });
      flag(id);
    } else if (nameSuggestsCold(name) && total > 25) {
      r.timeUnreasonable.push({ id, name, total, detail: '凉拌通常 < 15 分钟' });
      flag(id);
    } else if (total === 0) {
      r.timeUnreasonable.push({ id, name, total, detail: '时间为 0' });
      flag(id);
    }

    // ④ servings
    if (!recipe.servings || recipe.servings < 1 || recipe.servings > 10) {
      r.servingMismatch.push({ id, name, servings: recipe.servings, detail: '份数异常' });
      flag(id);
    }

    // ⑤ english name
    if (/[一-龥]/.test(recipe.nameEn || '')) {
      r.englishNameBad.push({ id, nameZh: name, nameEn: recipe.nameEn, name, detail: '含中文' });
      flag(id);
    } else if (!recipe.nameEn || recipe.nameEn.length < 3) {
      r.englishNameBad.push({ id, nameZh: name, nameEn: recipe.nameEn, name, detail: '过短/空' });
      flag(id);
    } else if (recipe.nameEn === recipe.nameZh) {
      r.englishNameBad.push({ id, nameZh: name, nameEn: recipe.nameEn, name, detail: '等于中文名' });
      flag(id);
    }

    // ⑥ duplicate
    const key = name.toLowerCase();
    if (nameMap.has(key)) {
      r.duplicateName.push({ id, name, detail: `与 ${nameMap.get(key)} 重名` });
      flag(id);
    } else {
      nameMap.set(key, id);
    }

    // ⑦ steps
    const steps = (recipe.steps || []).filter(s => s && s.trim());
    if (steps.length === 0) {
      r.stepsMissing.push({ id, name, detail: '无步骤' });
      flag(id);
    } else if (steps.length < 2) {
      r.stepsMissing.push({ id, name, detail: `只有 ${steps.length} 步` });
      flag(id);
    }

    // ⑧ tag inconsistent
    const tags = (recipe.tags || []).map(t => String(t));
    if (tags.includes('素') && hasMeatIng(recipe)) {
      r.tagInconsistent.push({ id, name, detail: '标签"素"但含肉' });
      flag(id);
    }
    if (tags.includes('荤') && !hasMeatIng(recipe)) {
      r.tagInconsistent.push({ id, name, detail: '标签"荤"但无肉' });
      flag(id);
    }

    // ⑨ mealTypes
    if (!recipe.mealTypes || recipe.mealTypes.length === 0) {
      r.mealTypeIssue.push({ id, name, detail: 'mealTypes 为空' });
      flag(id);
    }

    // ⑩ description
    if (!recipe.description || recipe.description.trim().length < 4) {
      r.missingDescription.push({ id, name, detail: '描述缺失/过短' });
      flag(id);
    }

    // ⑪ totalCalories
    if (recipe.totalCalories !== undefined) {
      const perServing = recipe.totalCalories / (recipe.servings || 1);
      if (perServing > 1500) {
        r.totalCalAbnormal.push({ id, name, totalCal: recipe.totalCalories, perServing: Math.round(perServing), detail: '人均 > 1500' });
        flag(id);
      }
      if (perServing < 50 && recipe.cookingMethod !== 'soup' && recipe.cookingMethod !== 'cold_dish') {
        r.totalCalAbnormal.push({ id, name, totalCal: recipe.totalCalories, perServing: Math.round(perServing), detail: '人均 < 50' });
        flag(id);
      }
    }

    // ⑫ missing ingredients
    for (const ri of (recipe.ingredients || [])) {
      if (!ingById.has(ri.ingredientId)) {
        r.ingMissing.push({ id, name, missingIng: ri.ingredientId, detail: `缺失 ${ri.ingredientId}` });
        flag(id);
      }
    }
  }

  // count totals
  const counters = [
    r.methodMismatch, r.ingredientMismatch, r.timeUnreasonable, r.servingMismatch,
    r.englishNameBad, r.duplicateName, r.stepsMissing, r.tagInconsistent,
    r.mealTypeIssue, r.missingDescription, r.totalCalAbnormal, r.ingMissing,
  ];
  r.totalIssueCount = counters.reduce((s, arr) => s + arr.length, 0);
  r.withIssuesCount = withIssues.size;

  return r;
}
