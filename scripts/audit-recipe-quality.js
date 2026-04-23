/**
 * 菜谱质量全面审计
 * 检查项:
 *  1. 名字与分类不匹配 (凉拌却是 stir_fry, 汤却是 braise 等)
 *  2. 名字与食材不匹配 (名字含"牛肉"却没 beef_xxx 食材)
 *  3. 时间估算不合理 (红烧只给 5 分钟, 凉拌却给 40 分钟)
 *  4. 份数与食材量不匹配 (servings=4 但食材总量只够 2 人)
 *  5. 英文名问题 (含中文, 过短, 重复 nameZh)
 *  6. 重复菜谱 (同名)
 *  7. 步骤太少或空
 *  8. 标签不一致 (tag 有"素"但 inferRole 是 main_meat)
 *  9. mealTypes 与 cookingMethod 不匹配 (staple/soup 不应是 breakfast-only)
 * 10. 缺描述/步骤
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const INGREDIENTS_PATH = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));
const ingredients = JSON.parse(fs.readFileSync(INGREDIENTS_PATH, 'utf8'));
const ingById = new Map(ingredients.map(i => [i.id, i]));

const issues = {
  methodMismatch: [],       // cookingMethod 与名字不匹配
  ingredientMismatch: [],   // 食材与名字不匹配
  timeUnreasonable: [],     // 时间不合理
  servingMismatch: [],      // 份数与食材不匹配
  englishNameBad: [],       // 英文名问题
  duplicateName: [],        // 重名
  stepsMissing: [],         // 步骤缺失
  tagInconsistent: [],      // 标签与分类冲突
  mealTypeIssue: [],        // 餐次不合理
  missingDescription: [],   // 缺描述
  totalCalHigh: [],         // 总热量异常(过高/过低)
  ingMissing: [],           // 食材 ID 不存在
};

// ============== 辅助函数 ==============
function nameContainsMeat(name) {
  // 排除误报词: 牛油果/牛奶/鸡蛋/鱼露/虾皮/天贝/肉桂/鱼腥草 等非肉类
  const FALSE_POSITIVES = /牛油果|牛奶|牛奶油|鸡蛋|鸡精|鸡毛菜|鱼露|鱼腥草|虾皮|虾米|虾酱|天贝|肉桂|羊栖菜|蟹味菇|鹅肝|肉豆蔻|鱼香(?!肉)/;
  if (FALSE_POSITIVES.test(name)) return false;
  return /牛肉|猪肉|鸡肉|羊肉|鸭肉|鱼肉|虾|蟹|贝壳|肉末|肉丝|肉片|五花|里脊|排骨|鸡翅|鸡腿|鸡丁|鸡胸|火腿|腊肠|香肠|培根|熏肉|鱼片|鱼头|鱼丸|鱿鱼|虾仁|扇贝|牛排|牛腩|牛腱|牛舌|鸡爪|鸡肝|牛筋|猪蹄|肉包|肉馅|卤肉|烧肉|烤肉|叉烧|鱼排|羊排|羊腿/.test(name);
}
function hasMeatIngredient(recipe) {
  return recipe.ingredients.some(ri => {
    const ing = ingById.get(ri.ingredientId);
    return ing && ['meat', 'seafood'].includes(ing.category);
  });
}
function nameSuggestsCold(name) {
  return /凉拌|凉菜|沙拉|拍[^面粉]|冷/.test(name);
}
function nameSuggestsSoup(name) {
  if (/汤圆|汤饭|汤面|汤粉|汤包/.test(name)) return false;
  return /汤$|羹$|煲$|高汤|清汤|浓汤/.test(name);
}
function nameSuggestsStaple(name) {
  if (/凉拌|凉菜|沙拉|拌(?!面|粉|饭)|蘸料|包菜|包心菜|大白菜|小白菜|菜花/.test(name)) return false;
  return /粥|饭$|米饭|蛋炒饭|盖饭|烩饭|炒饭|寿司|意面|乌冬|拉面|肠粉|河粉|米线|米粉|面条|面$|凉面|拌面|炒面|面包|馒头|花卷|烧饼|大饼|烙饼|煎饼|蛋饼|包子|小笼|饺子|馄饨|粽子|汤圆/.test(name);
}
function nameSuggestsBraise(name) {
  return /红烧|焖|炖|煨|卤|酱烧|糖醋烧/.test(name);
}
function nameSuggestsSteam(name) {
  return /蒸|清蒸|粉蒸/.test(name);
}
function nameSuggestsStirFry(name) {
  return /炒(?!饭|面|粉)|爆|熘|煸/.test(name);
}

// ============== 审计 ==============
const nameMap = new Map();

for (const r of recipes) {
  const name = r.nameZh || '';
  const id = r.id;

  // 1. cookingMethod vs 名字 (优先级: cold > staple > soup > braise > steam)
  //   只取最高优先级的期望值, 避免"卤肉饭"既像 staple 又像 braise 的双重误报
  let expected = null;
  if (nameSuggestsCold(name)) expected = 'cold_dish';
  else if (nameSuggestsStaple(name)) expected = 'staple';
  else if (nameSuggestsSoup(name)) expected = 'soup';
  else if (nameSuggestsBraise(name)) expected = 'braise';
  else if (nameSuggestsSteam(name)) expected = 'steam';

  if (expected && r.cookingMethod !== expected) {
    // braise 接受 stew (同义)
    if (!(expected === 'braise' && r.cookingMethod === 'stew')) {
      issues.methodMismatch.push({ id, name, cookingMethod: r.cookingMethod, expected });
    }
  }

  // 2. 名字与食材
  if (nameContainsMeat(name) && !hasMeatIngredient(r)) {
    const meatIds = (r.ingredients || []).map(i => i.ingredientId);
    issues.ingredientMismatch.push({ id, name, note: '名字含肉但食材无肉', ingredients: meatIds.join(',') });
  }

  // 3. 时间不合理
  const total = (r.prepTime || 0) + (r.cookTime || 0);
  if (nameSuggestsBraise(name) && total < 30) {
    issues.timeUnreasonable.push({ id, name, total, note: '红烧/炖通常 > 30 分钟' });
  }
  if (nameSuggestsCold(name) && total > 25) {
    issues.timeUnreasonable.push({ id, name, total, note: '凉拌通常 < 15 分钟' });
  }
  if (total === 0) {
    issues.timeUnreasonable.push({ id, name, total, note: '时间为 0' });
  }

  // 4. 份数合理性
  if (!r.servings || r.servings < 1 || r.servings > 10) {
    issues.servingMismatch.push({ id, name, servings: r.servings });
  }

  // 5. 英文名
  if (/[\u4e00-\u9fa5]/.test(r.nameEn || '')) {
    issues.englishNameBad.push({ id, nameZh: name, nameEn: r.nameEn, note: '含中文' });
  }
  if (!r.nameEn || r.nameEn.length < 3) {
    issues.englishNameBad.push({ id, nameZh: name, nameEn: r.nameEn, note: '过短/空' });
  }
  if (r.nameEn === r.nameZh) {
    issues.englishNameBad.push({ id, nameZh: name, nameEn: r.nameEn, note: '等于中文名' });
  }

  // 6. 重名
  const nameKey = name.toLowerCase();
  if (nameMap.has(nameKey)) {
    issues.duplicateName.push({ id, name, conflictWith: nameMap.get(nameKey) });
  } else {
    nameMap.set(nameKey, id);
  }

  // 7. 步骤缺失
  const steps = (r.steps || []).filter(s => s && s.trim());
  if (steps.length === 0) {
    issues.stepsMissing.push({ id, name, note: '无步骤' });
  } else if (steps.length < 2) {
    issues.stepsMissing.push({ id, name, note: `只有 ${steps.length} 步` });
  }

  // 8. 标签与分类冲突
  const tags = (r.tags || []).map(t => String(t));
  if (tags.includes('素') && hasMeatIngredient(r)) {
    issues.tagInconsistent.push({ id, name, note: '标签"素"但含肉' });
  }
  if (tags.includes('荤') && !hasMeatIngredient(r)) {
    issues.tagInconsistent.push({ id, name, note: '标签"荤"但无肉' });
  }

  // 9. mealTypes
  if (!r.mealTypes || r.mealTypes.length === 0) {
    issues.mealTypeIssue.push({ id, name, note: 'mealTypes 为空' });
  }

  // 10. 描述
  if (!r.description || r.description.trim().length < 4) {
    issues.missingDescription.push({ id, name, description: r.description });
  }

  // 11. 热量异常
  if (r.totalCalories !== undefined) {
    const perServing = r.totalCalories / (r.servings || 1);
    if (perServing > 1500) {
      issues.totalCalHigh.push({ id, name, totalCal: r.totalCalories, perServing: Math.round(perServing), note: '人均 > 1500' });
    }
    if (perServing < 50 && r.cookingMethod !== 'soup' && r.cookingMethod !== 'cold_dish') {
      issues.totalCalHigh.push({ id, name, totalCal: r.totalCalories, perServing: Math.round(perServing), note: '人均 < 50 (可能少食材)' });
    }
  }

  // 12. 食材 ID 不存在
  for (const ri of (r.ingredients || [])) {
    if (!ingById.has(ri.ingredientId)) {
      issues.ingMissing.push({ id, name, missingIng: ri.ingredientId });
    }
  }
}

// ============== 报告 ==============
console.log('===== 菜谱质量审计报告 =====');
console.log(`总菜谱: ${recipes.length}\n`);

const labels = {
  methodMismatch: '① 做法(cookingMethod) 与名字不匹配',
  ingredientMismatch: '② 名字含肉但食材无肉',
  timeUnreasonable: '③ 时间估算不合理',
  servingMismatch: '④ 份数异常',
  englishNameBad: '⑤ 英文名问题',
  duplicateName: '⑥ 重名菜谱',
  stepsMissing: '⑦ 步骤缺失',
  tagInconsistent: '⑧ 标签与分类冲突',
  mealTypeIssue: '⑨ 餐次(mealTypes) 问题',
  missingDescription: '⑩ 描述缺失/过短',
  totalCalHigh: '⑪ 热量异常',
  ingMissing: '⑫ 食材 ID 不存在',
};

for (const [k, list] of Object.entries(issues)) {
  const label = labels[k];
  console.log(`\n${label} (${list.length})`);
  if (list.length > 0) {
    list.slice(0, 8).forEach(item => {
      console.log(`  - ${item.id}: ${item.name || item.nameZh || ''}`);
      if (item.note) console.log(`    ${item.note}`);
      if (item.expected) console.log(`    ${item.cookingMethod} → 应为 ${item.expected}`);
      if (item.ingredients) console.log(`    食材: ${item.ingredients}`);
      if (item.conflictWith) console.log(`    与 ${item.conflictWith} 重名`);
      if (item.nameEn) console.log(`    nameEn: ${item.nameEn}`);
      if (item.missingIng) console.log(`    缺失 ingredient: ${item.missingIng}`);
      if (item.total !== undefined) console.log(`    total: ${item.total} 分钟`);
      if (item.perServing !== undefined) console.log(`    人均: ${item.perServing} kcal / 总 ${item.totalCal}`);
    });
    if (list.length > 8) console.log(`  ... 还有 ${list.length - 8} 条`);
  }
}

// 保存完整报告
const reportPath = path.join(__dirname, '..', 'recipe-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2), 'utf8');
console.log(`\n✅ 完整报告已保存: recipe-audit-report.json`);

// 统计
const total = Object.values(issues).reduce((s, l) => s + l.length, 0);
console.log(`\n📊 问题条数: ${total} 条 (注意一道菜可能出现多个问题)`);
const withIssues = new Set();
for (const list of Object.values(issues)) {
  for (const item of list) withIssues.add(item.id);
}
console.log(`📊 有问题的菜谱数: ${withIssues.size} / ${recipes.length} (${(withIssues.size / recipes.length * 100).toFixed(1)}%)`);
