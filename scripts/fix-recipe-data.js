/**
 * 批量修复菜谱数据问题
 * 1. 无效flavor映射到合法值
 * 2. 无效cookingMethod映射到合法值
 * 3. 修正常见食材错误（肠粉用面粉、锅包肉用五花肉等）
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const recipes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'recipes-all.json'), 'utf8'));
const ings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const ingIds = new Set(ings.map(i => i.id));

// flavor 映射: 不合法 → 合法
const FLAVOR_MAP = {
  smooth: 'light', juicy: 'umami', savory: 'salty', crispy: 'umami',
  aromatic: 'umami', creamy: 'light', plain: 'light', buttery: 'umami',
  fluffy: 'light', fruity: 'sweet', crunchy: 'umami', comforting: 'umami',
  tangy: 'sour', fresh: 'light', sweet_sour: 'sweet', rich: 'umami',
  fermented: 'umami', garlicky: 'umami', peppery: 'spicy', nourishing: 'light',
  warm: 'umami', hearty: 'umami', smoky: 'umami', nutty: 'umami',
  refreshing: 'light', cheesy: 'umami', briny: 'salty', herby: 'light',
  numbing: 'spicy', chewy: 'umami', milky: 'light', ginger: 'spicy',
  mild_spicy: 'spicy', mild: 'light', fragrant: 'umami', simple: 'light',
  mixed: 'umami', healthy: 'light',
};

// cookingMethod 映射
const METHOD_MAP = {
  pan_fry: 'deep_fry',  // 煎归类到煎炸
  simmer: 'stew',        // 慢煮归类到炖
  bake: 'roast',         // 烤箱
  grill: 'roast',        // 烤
};

// 食材修正规则: { 菜名匹配, 删除食材[], 添加食材[{id, amount, unit}] }
const INGREDIENT_FIXES = [
  // 肠粉应该用粘米粉(rice_flour 不存在则用 starch+vermicelli 替代)
  // 但用户要求"原汁原味"——这里只在食材库有对应食材时修
  {
    match: r => /肠粉/.test(r.nameZh),
    fix: r => {
      // 删除 flour
      r.ingredients = r.ingredients.filter(i => i.ingredientId !== 'flour');
      // 添加 rice_flour 和 wheat_starch（如果缺失）
      const ids = new Set(r.ingredients.map(i => i.ingredientId));
      if (!ids.has('rice_flour')) r.ingredients.unshift({ ingredientId: 'rice_flour', amount: 100, unit: 'g' });
      if (!ids.has('wheat_starch')) r.ingredients.splice(1, 0, { ingredientId: 'wheat_starch', amount: 50, unit: 'g' });
    },
  },
  // 锅包肉用里脊不是五花肉
  {
    match: r => r.nameZh === '锅包肉',
    fix: r => {
      r.ingredients = r.ingredients.map(i =>
        i.ingredientId === 'pork_belly' ? { ...i, ingredientId: 'pork_loin' } : i
      );
    },
  },
  // 鱼香肉丝传统应该用里脊不是肉末
  {
    match: r => r.nameZh === '鱼香肉丝',
    fix: r => {
      r.ingredients = r.ingredients.map(i =>
        i.ingredientId === 'pork_mince' ? { ...i, ingredientId: 'pork_loin' } : i
      );
    },
  },
];

let fixedFlavors = 0;
let fixedMethods = 0;
let fixedIngs = 0;

for (const r of recipes) {
  // 修 flavors
  if (r.flavors) {
    const newFlavors = [];
    for (const f of r.flavors) {
      if (FLAVOR_MAP[f]) {
        if (!newFlavors.includes(FLAVOR_MAP[f])) newFlavors.push(FLAVOR_MAP[f]);
        fixedFlavors++;
      } else if (['sour','sweet','bitter','spicy','salty','umami','light'].includes(f)) {
        if (!newFlavors.includes(f)) newFlavors.push(f);
      }
    }
    if (newFlavors.length === 0) newFlavors.push('umami'); // 兜底
    r.flavors = newFlavors;
  }

  // 修 cookingMethod
  if (METHOD_MAP[r.cookingMethod]) {
    r.cookingMethod = METHOD_MAP[r.cookingMethod];
    fixedMethods++;
  }

  // 修食材
  for (const rule of INGREDIENT_FIXES) {
    if (rule.match(r)) {
      const before = JSON.stringify(r.ingredients);
      rule.fix(r);
      if (JSON.stringify(r.ingredients) !== before) fixedIngs++;
    }
  }
}

fs.writeFileSync(path.join(DATA_DIR, 'recipes-all.json'), JSON.stringify(recipes, null, 2));

console.log('修复 flavor:', fixedFlavors, '次');
console.log('修复 cookingMethod:', fixedMethods, '道');
console.log('修复食材:', fixedIngs, '道');

// 验证
const VALID_FLAVORS = new Set(['sour','sweet','bitter','spicy','salty','umami','light']);
const VALID_METHODS = new Set(['stir_fry','braise','stew','steam','boil','cold_dish','deep_fry','roast','dry_pot','soup','staple']);

let invalidF = 0, invalidM = 0;
for (const r of recipes) {
  for (const f of r.flavors || []) if (!VALID_FLAVORS.has(f)) invalidF++;
  if (!VALID_METHODS.has(r.cookingMethod)) invalidM++;
}
console.log('\n=== 验证 ===');
console.log('剩余无效flavor:', invalidF);
console.log('剩余无效cookingMethod:', invalidM);

// 检查待新增食材
const missing = new Map();
for (const r of recipes) {
  for (const ri of r.ingredients) {
    if (!ingIds.has(ri.ingredientId)) {
      const e = missing.get(ri.ingredientId) || { count: 0, samples: [] };
      e.count++;
      if (e.samples.length < 3) e.samples.push(r.nameZh);
      missing.set(ri.ingredientId, e);
    }
  }
}
console.log('\n=== 待新增食材 ===');
console.log('数量:', missing.size);
for (const [id, info] of [...missing.entries()].sort((a,b) => b[1].count - a[1].count)) {
  console.log('  ' + id + ' (' + info.count + '道): ' + info.samples.join(', '));
}
