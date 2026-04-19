/**
 * 菜谱并发审计脚本（worker_threads 并行）
 *
 * 运行：node scripts/audit-recipes.js
 *   参数：--file=recipes-all.json  指定审计单个文件（默认合并所有源）
 *        --out=reports/audit.json  自定义输出路径
 *        --workers=N               强制 worker 数量（默认 = CPU 核数）
 *
 * 检查维度：
 *   ERROR（阻塞）
 *     E1 必填字段缺失
 *     E2 枚举值非法
 *     E3 食材 ID 不存在
 *     E4 ingredients 为空 / steps 为空
 *   WARN（质量）
 *     W1 名字与 cookingMethod 不一致（炒饭→steam 等）
 *     W2 dishRole 与 cookingMethod/name 冲突
 *     W3 staple 无 stapleCategory
 *     W4 isVegetarian 与 ingredients 冲突
 *     W5 description 缺失/过短/过长/用了 fallback
 *     W6 steps 数量异常（<3 或 >25）
 *     W7 mealTypes 与菜品明显不符（早餐出现红烧类主菜等）
 *     W8 难度 / 最低厨艺等级与步骤数不匹配
 *   INFO（建议）
 *     I1 菜名重复（不同 ID）
 *     I2 近似重复（相同主料 + 做法 + 相似名字）
 *     I3 使用通用食材而非特定食材（如 pork 而非 pork_belly）
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { validateRecipe, buildValidationContext } = require('./lib/recipe-validator');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const REPORT_DIR = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

// -------------------- Worker 入口（校验逻辑在 lib/recipe-validator.js） --------------------

if (!isMainThread) {
  const { chunk, ingredientIdsArr, ingCatById, nameCount, idByName } = workerData;
  const ctx = {
    ingredientIds: new Set(ingredientIdsArr),
    ingCatById,
    nameCount,
    idByName,
  };
  const results = [];
  for (const recipe of chunk) {
    const { id, nameZh, issues } = validateRecipe(recipe, ctx);
    results.push({ id, nameZh, source: recipe.source, issues });
  }
  parentPort.postMessage(results);
  return;
}

// -------------------- 主线程逻辑 --------------------

function parseArgs() {
  const args = { file: null, out: null, workers: os.cpus().length };
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--file=')) args.file = a.slice(7);
    else if (a.startsWith('--out=')) args.out = a.slice(6);
    else if (a.startsWith('--workers=')) args.workers = parseInt(a.slice(10), 10);
  }
  return args;
}

async function runWorker(chunk, sharedData) {
  return new Promise((resolve, reject) => {
    const w = new Worker(__filename, { workerData: { chunk, ...sharedData } });
    w.once('message', resolve);
    w.once('error', reject);
    w.once('exit', code => { if (code !== 0) reject(new Error('worker exit ' + code)); });
  });
}

// 源文件清单 — 用于孤儿检测
const SOURCE_FILES = [
  'recipes-desserts-drinks.json',
  'recipes-quality-e.json', 'recipes-quality-d.json', 'recipes-quality-c.json',
  'recipes-quality-b.json', 'recipes-chinese-2.json', 'recipes-mega-3.json',
  'recipes-international.json', 'recipes-chinese-1.json',
  'recipes-hot-1.json', 'recipes-hot-2.json', 'recipes-hot-3.json',
  'recipes.json', 'recipes-legacy.json',
];

/** 检查 recipes-all.json 里是否有不在任何源文件中的 id（旁路写入） */
function detectOrphans(allRecipes) {
  const sourceIds = new Set();
  for (const f of SOURCE_FILES) {
    const p = path.join(DATA_DIR, f);
    if (!fs.existsSync(p)) continue;
    const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const r of arr) sourceIds.add(r.id);
  }
  return allRecipes.filter(r => !sourceIds.has(r.id));
}

async function main() {
  const args = parseArgs();
  const ingredients = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
  const ingredientIds = ingredients.map(i => i.id);
  const ingCatById = Object.fromEntries(ingredients.map(i => [i.id, i.category]));

  // 加载所有菜谱（默认从 recipes-all.json，若指定 --file 则用该文件）
  let recipes;
  if (args.file) {
    recipes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, args.file), 'utf8'));
  } else {
    const allPath = path.join(DATA_DIR, 'recipes-all.json');
    if (!fs.existsSync(allPath)) throw new Error('recipes-all.json 不存在，请先运行 merge-recipes.js');
    recipes = JSON.parse(fs.readFileSync(allPath, 'utf8'));

    // 孤儿检测：recipes-all.json 里的 id 必须都能在源文件中找到
    const orphans = detectOrphans(recipes);
    if (orphans.length > 0) {
      console.error(`\n⚠ 发现 ${orphans.length} 条孤儿菜谱（在 recipes-all.json 但不在任何源文件）:`);
      for (const r of orphans.slice(0, 5)) console.error(`  - ${r.id} / ${r.nameZh}`);
      if (orphans.length > 5) console.error(`  ... 还有 ${orphans.length - 5} 条`);
      console.error('\n💡 修复方法：');
      console.error('  1. 把孤儿菜谱移到相应源文件，或');
      console.error('  2. 运行 node scripts/extract-legacy-recipes.js 抽到 recipes-legacy.json');
      console.error('  3. 重新运行 npm run recipes:check\n');
      // strict 模式直接退出
      if (process.argv.includes('--strict') || process.env.AUDIT_STRICT === '1') {
        process.exit(1);
      }
    }
  }

  // 菜名重复统计
  const nameCount = {};
  const idByName = {};
  for (const r of recipes) {
    nameCount[r.nameZh] = (nameCount[r.nameZh] || 0) + 1;
    (idByName[r.nameZh] = idByName[r.nameZh] || []).push(r.id);
  }

  // 切片并发
  const WORKER_COUNT = Math.max(1, Math.min(args.workers, os.cpus().length));
  const chunkSize = Math.ceil(recipes.length / WORKER_COUNT);
  const chunks = [];
  for (let i = 0; i < recipes.length; i += chunkSize) chunks.push(recipes.slice(i, i + chunkSize));

  const shared = { ingredientIdsArr: ingredientIds, ingCatById, nameCount, idByName };
  const t0 = Date.now();
  console.log(`🔍 并发审计 ${recipes.length} 道菜，${chunks.length} 个 worker...`);
  const resultsByChunk = await Promise.all(chunks.map(c => runWorker(c, shared)));
  const allResults = resultsByChunk.flat();
  const ms = Date.now() - t0;

  // 统计
  const counts = { ERROR: 0, WARN: 0, INFO: 0 };
  const byCode = {};
  for (const r of allResults) {
    for (const i of r.issues) {
      counts[i.level] = (counts[i.level] || 0) + 1;
      byCode[i.code] = (byCode[i.code] || 0) + 1;
    }
  }

  const withIssues = allResults.filter(r => r.issues.length > 0);
  const withErrors = allResults.filter(r => r.issues.some(i => i.level === 'ERROR'));
  const withWarns = allResults.filter(r => r.issues.some(i => i.level === 'WARN'));

  const report = {
    generatedAt: new Date().toISOString(),
    durationMs: ms,
    workerCount: chunks.length,
    scanned: recipes.length,
    totals: counts,
    byCode,
    recipesWithErrors: withErrors.length,
    recipesWithWarnings: withWarns.length,
    recipesClean: recipes.length - withIssues.length,
    items: withIssues,  // 完整明细
  };

  const outPath = args.out ? path.resolve(args.out) : path.join(REPORT_DIR, 'audit-recipes.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`\n========== 审计完成 (${ms}ms) ==========`);
  console.log(`  扫描: ${recipes.length}`);
  console.log(`  ERROR: ${counts.ERROR || 0}`);
  console.log(`  WARN:  ${counts.WARN || 0}`);
  console.log(`  INFO:  ${counts.INFO || 0}`);
  console.log('\n按代码分布:');
  const codeOrder = ['E1', 'E2', 'E3', 'E4', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'I1', 'I2', 'I3', 'I4'];
  for (const c of codeOrder) if (byCode[c]) console.log(`  ${c}: ${byCode[c]}`);
  console.log('\n菜谱级别:');
  console.log(`  有 ERROR:    ${withErrors.length}`);
  console.log(`  有 WARN:     ${withWarns.length}`);
  console.log(`  完全干净:    ${recipes.length - withIssues.length}`);
  console.log(`\n📄 完整报告: ${outPath}`);

  if (withErrors.length > 0) {
    console.log('\n⚠ ERROR 前 10 例:');
    for (const r of withErrors.slice(0, 10)) {
      const errs = r.issues.filter(i => i.level === 'ERROR').map(i => `${i.code}:${i.msg}`).join('; ');
      console.log(`  ${r.id}(${r.nameZh}) ${errs}`);
    }
  }

  // CI 模式：有 ERROR 则以非零退出码退出，供 pre-commit / CI 阻塞
  const strict = process.argv.includes('--strict') || process.env.AUDIT_STRICT === '1';
  if (strict && withErrors.length > 0) {
    console.error(`\n❌ 审计失败（strict 模式）: ${withErrors.length} 道菜含 ERROR`);
    process.exit(1);
  }
  // 默认模式下有 ERROR 也返回 1，便于 CI 捕获
  if (withErrors.length > 0) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exit(1); });
