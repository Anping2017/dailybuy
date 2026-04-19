/**
 * 检查并修复菜谱数据库中错误归类的菜
 * 1. 缺 cookingMethod 字段 → 按名字推断
 * 2. cookingMethod = 'staple' 但名字不含主食关键字 → 重新分类
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));

// 主食关键字 (与 engine.isStapleByName 保持一致)
const STAPLE_RE = /粥|饭|面|饼|包|馒头|饺|馄饨|抄手|米线|河粉|烩饭|盖饭|炒饭|拌面|凉面|寿司|意面|意大利面|乌冬|拉面|肠粉|粉丝|米粉|汉堡|三明治|吐司|薯条|馕|花卷|烧麦|肠粉|凉皮|凉粉|意式饺/;

// 荤菜主料关键字 (出现这些, 通常不是主食)
const MEAT_NAME_RE = /鸡丁|鸡丝|鸡块|鸡翅|鸡腿|羊肉|牛肉|猪肉|鸭肉|虾仁|大虾|鱼片|鱼块|带鱼|肉片|排骨|里脊|腰花|肚条/;

function inferCookingMethod(name) {
  if (/汤$|羹$|高汤|清汤/.test(name)) return 'soup';
  if (/凉拌|沙拉|凉菜/.test(name)) return 'cold_dish';
  if (/红烧|卤/.test(name)) return 'braise';
  if (/炖|煲/.test(name)) return 'stew';
  if (/清蒸|蒸/.test(name)) return 'steam';
  if (/煮|白灼|汆/.test(name)) return 'boil';
  if (/烤|焗|烘/.test(name)) return 'roast';
  if (/炸|酥脆|脆皮/.test(name)) return 'deep_fry';
  if (/煎/.test(name)) return 'deep_fry';
  if (STAPLE_RE.test(name)) return 'staple';
  return 'stir_fry'; // 默认炒
}

let missingFix = 0;
let staplereFix = 0;
const fixed = [];

for (const r of recipes) {
  // 1) 缺 cookingMethod
  if (!r.cookingMethod) {
    r.cookingMethod = inferCookingMethod(r.nameZh);
    fixed.push({ id: r.id, name: r.nameZh, change: `补 cookingMethod = ${r.cookingMethod}` });
    missingFix++;
    continue;
  }
  // 2) cookingMethod = 'staple' 但名字明显是荤菜
  if (r.cookingMethod === 'staple' && !STAPLE_RE.test(r.nameZh) && MEAT_NAME_RE.test(r.nameZh)) {
    r.cookingMethod = 'stir_fry'; // 荤菜默认炒
    fixed.push({ id: r.id, name: r.nameZh, change: `staple → stir_fry (含荤菜词)` });
    staplereFix++;
  }
}

console.log(`总菜数: ${recipes.length}`);
console.log(`补 cookingMethod: ${missingFix}`);
console.log(`错标 staple 修正: ${staplereFix}`);
console.log(`\n修正示例（前 30 条）:`);
fixed.slice(0, 30).forEach(f => console.log(`  ${f.name} (${f.id}): ${f.change}`));

if (process.argv.includes('--write')) {
  fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2));
  console.log(`\n✓ 写入 ${RECIPES_PATH}`);
} else {
  console.log(`\n(dry-run, 加 --write 才会保存)`);
}
