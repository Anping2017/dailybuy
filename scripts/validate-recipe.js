/**
 * 单条菜谱校验 CLI — 供自定义菜谱/新菜入库前使用
 *
 * 用法：
 *   node scripts/validate-recipe.js path/to/recipe.json
 *   cat recipe.json | node scripts/validate-recipe.js
 *   node scripts/validate-recipe.js --id=homestyle_xxx  (从 recipes-all.json 取)
 *
 * 退出码：0 = 无 ERROR（可入库）/ 1 = 有 ERROR
 * 支持 --json 以 JSON 格式输出结果（供 API/前端消费）
 */
const fs = require('fs');
const path = require('path');
const { validateRecipe, buildValidationContext } = require('./lib/recipe-validator');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', d => data += d);
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function loadRecipe() {
  const args = process.argv.slice(2);
  const idArg = args.find(a => a.startsWith('--id='));
  const fileArg = args.find(a => !a.startsWith('--'));

  if (idArg) {
    const id = idArg.slice(5);
    const all = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'recipes-all.json'), 'utf8'));
    const recipe = all.find(r => r.id === id);
    if (!recipe) throw new Error(`未找到 id=${id} 的菜谱`);
    return recipe;
  }
  if (fileArg) {
    const abs = path.isAbsolute(fileArg) ? fileArg : path.resolve(process.cwd(), fileArg);
    return JSON.parse(fs.readFileSync(abs, 'utf8'));
  }
  // 从 stdin 读取
  const content = await readStdin();
  if (!content.trim()) throw new Error('无输入：请提供文件路径、--id=XXX 或从 stdin 输入 JSON');
  return JSON.parse(content);
}

async function main() {
  const jsonOutput = process.argv.includes('--json');
  let recipe;
  try {
    recipe = await loadRecipe();
  } catch (e) {
    console.error('❌', e.message);
    process.exit(2);
  }

  // 构造上下文：加载全库菜谱（用于重名检测）和食材（用于 ID 检查）
  const ingredients = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
  let allRecipes = [];
  try {
    allRecipes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'recipes-all.json'), 'utf8'));
  } catch { /* 可选 */ }

  const ctx = buildValidationContext({ recipes: allRecipes, ingredients });
  const result = validateRecipe(recipe, ctx);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\n🔍 校验：${result.id}  《${result.nameZh}》\n`);
    console.log('分类建议:');
    console.log(`  dishRole       = ${result.classification.dishRole}`);
    console.log(`  isVegetarian   = ${result.classification.isVegetarian}`);
    console.log(`  dishStyle      = ${result.classification.dishStyle}`);
    console.log(`  stapleCategory = ${result.classification.stapleCategory || '(N/A)'}`);

    if (result.issues.length === 0) {
      console.log('\n✅ 通过全部检查，无 issues');
    } else {
      const errs = result.issues.filter(i => i.level === 'ERROR');
      const warns = result.issues.filter(i => i.level === 'WARN');
      const infos = result.issues.filter(i => i.level === 'INFO');
      console.log(`\n问题汇总: ERROR=${errs.length} WARN=${warns.length} INFO=${infos.length}`);
      for (const i of errs) console.log(`  ❌ ${i.code}: ${i.msg}`);
      for (const i of warns) console.log(`  ⚠  ${i.code}: ${i.msg}`);
      for (const i of infos) console.log(`  ℹ  ${i.code}: ${i.msg}`);
    }
  }

  // 退出码：有 ERROR → 1，否则 → 0
  const hasError = result.issues.some(i => i.level === 'ERROR');
  process.exit(hasError ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
