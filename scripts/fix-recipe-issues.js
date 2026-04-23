/**
 * 批量修复菜谱审计报告中的可自动修复项:
 *  1. cookingMethod 与名字明显不匹配 → 按名字推断修正
 *  2. 时间估算不合理 → 按做法调整
 *  3. 份数异常 → 设为 2 (默认)
 *  4. 名字含肉但食材无肉 → 仅检测, 不自动修 (因误报多, 如"牛油果"/"牛奶"/"鱼露")
 */
const fs = require('fs');
const path = require('path');
const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));

let fixCount = { method: 0, time: 0, servings: 0 };

for (const r of recipes) {
  const name = r.nameZh || '';

  // 1. cookingMethod 修正 (按名字关键词)
  //   优先级: cold_dish > staple > soup > steam > braise
  //   排除误报: 汤圆/汤面/汤饭 不是 soup
  if (/凉拌|凉菜|沙拉|冷面/.test(name) && r.cookingMethod !== 'cold_dish') {
    r.cookingMethod = 'cold_dish';
    fixCount.method++;
  } else if (/粥|饭$|米饭|蛋炒饭|盖饭|烩饭|炒饭|寿司|意面|乌冬|拉面|肠粉|河粉|米线|米粉|面条|面$|凉面|拌面|炒面|面包|馒头|花卷|烧饼|大饼|烙饼|煎饼|蛋饼|包子|小笼|饺子|馄饨|粽子|汤圆|元宵/.test(name)
    && !/凉拌|凉菜|沙拉/.test(name)
    && r.cookingMethod !== 'staple') {
    r.cookingMethod = 'staple';
    fixCount.method++;
  } else if (/汤$|羹$|煲$|高汤|清汤|浓汤/.test(name)
    && !/汤圆|汤饭|汤面|汤粉|汤包/.test(name)
    && r.cookingMethod !== 'soup') {
    r.cookingMethod = 'soup';
    fixCount.method++;
  } else if (/清蒸|粉蒸|^蒸/.test(name) && !['steam', 'staple'].includes(r.cookingMethod)) {
    // 避免把"蒸玉米"("staple")误改
    r.cookingMethod = 'steam';
    fixCount.method++;
  } else if (/红烧|焖煮|炖煮|酱烧|卤/.test(name) && !['braise', 'stew', 'soup'].includes(r.cookingMethod)) {
    r.cookingMethod = 'braise';
    fixCount.method++;
  }

  // 2. 时间调整
  const total = (r.prepTime || 0) + (r.cookTime || 0);

  // 凉拌通常 10-15 分钟
  if (r.cookingMethod === 'cold_dish' && total > 20) {
    // 木耳泡发/章鱼煮等会导致时间长, 但总时间通常 < 25 min
    // 取合理区间 [10, 20]
    r.prepTime = Math.min(r.prepTime || 10, 10);
    r.cookTime = Math.min(r.cookTime || 5, 10);
    fixCount.time++;
  }
  // 红烧/炖 通常 30-60 分钟
  if ((r.cookingMethod === 'braise' || r.cookingMethod === 'stew') && total < 25) {
    // 至少 30 分钟(10 prep + 20+ cook)
    r.prepTime = Math.max(r.prepTime || 10, 10);
    r.cookTime = Math.max(r.cookTime || 20, 25);
    fixCount.time++;
  }
  // 时间为 0 (饮料/甜点等可能有数据缺失)
  if (total === 0) {
    r.prepTime = r.prepTime || 5;
    r.cookTime = r.cookTime || 10;
    fixCount.time++;
  }

  // 3. 份数异常 → 设为 2 (默认)
  if (!r.servings || r.servings < 1 || r.servings > 10) {
    r.servings = 2;
    fixCount.servings++;
  }
}

fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2), 'utf8');
console.log(`✅ 修复 cookingMethod: ${fixCount.method} 道`);
console.log(`✅ 修复时间: ${fixCount.time} 道`);
console.log(`✅ 修复份数: ${fixCount.servings} 道`);
console.log(`\n总计修复: ${fixCount.method + fixCount.time + fixCount.servings} 条`);
