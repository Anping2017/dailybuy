/**
 * 食材库校验与修复工具
 *
 * 用法：
 *   node scripts/validate-ingredients.js                   # 仅校验
 *   node scripts/validate-ingredients.js --auto-fix        # 为菜谱引用的缺失食材自动新增占位
 *   node scripts/validate-ingredients.js --pre-add <file>  # 预检候选食材能否加入
 *   node scripts/validate-ingredients.js --merge <file>    # 预检通过后合并到食材库
 *
 * 校验内容：
 *   A. 重复检测：id、nameZh、nameEn（含 "/" 别名）
 *   B. 字段完整性：必需字段、nutrition 子字段、category 枚举
 *   C. 菜谱交叉：recipes-all.json 引用的 ingredientId 必须存在
 *   D. 未使用提示：食材库里存在但没有菜谱引用的条目（仅提示）
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const INGREDIENTS_FILE = path.join(DATA_DIR, 'ingredients.json');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes-all.json');

const CATEGORY_ENUM = new Set(['meat', 'seafood', 'vegetable', 'fruit', 'bean', 'grain', 'egg_dairy', 'seasoning', 'oil', 'dried']);
const REQUIRED_FIELDS = ['id', 'nameZh', 'nameEn', 'category', 'nutrition', 'priceNZD', 'unit'];
const NUTRITION_KEYS = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sodium', 'sugar'];
const ARRAY_FIELDS = ['allergens', 'warnings', 'highlights', 'supermarkets', 'season'];

function splitAliases(nameZh) {
  return nameZh.split(/[\/／]/).map(s => s.trim()).filter(Boolean);
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// ---------- 校验规则 ----------
function validateStructure(ingredients) {
  const errors = [];
  ingredients.forEach((ing, idx) => {
    REQUIRED_FIELDS.forEach(f => {
      if (ing[f] === undefined || ing[f] === null || ing[f] === '') {
        errors.push(`[${idx}] ${ing.id || '?'}: 缺字段 ${f}`);
      }
    });
    if (ing.category && !CATEGORY_ENUM.has(ing.category)) {
      errors.push(`[${idx}] ${ing.id}: 非法 category "${ing.category}"`);
    }
    if (ing.nutrition) {
      NUTRITION_KEYS.forEach(k => {
        if (typeof ing.nutrition[k] !== 'number') {
          errors.push(`[${idx}] ${ing.id}: nutrition.${k} 不是数字`);
        }
      });
    }
    ARRAY_FIELDS.forEach(f => {
      if (ing[f] !== undefined && !Array.isArray(ing[f])) {
        errors.push(`[${idx}] ${ing.id}: ${f} 应为数组`);
      }
    });
    if (typeof ing.priceNZD !== 'number' || ing.priceNZD < 0) {
      errors.push(`[${idx}] ${ing.id}: priceNZD 非法 (${ing.priceNZD})`);
    }
  });
  return errors;
}

function validateDuplicates(ingredients) {
  const errors = [];
  const idMap = new Map();
  const zhMap = new Map();       // 完整 nameZh
  const aliasMap = new Map();    // 别名（/ 分隔后的每一段）
  const enMap = new Map();

  ingredients.forEach(ing => {
    if (idMap.has(ing.id)) errors.push(`重复 id: "${ing.id}" (位于 ${idMap.get(ing.id)} 和 ${ing.id})`);
    else idMap.set(ing.id, ing.id);

    if (zhMap.has(ing.nameZh)) errors.push(`重复 nameZh: "${ing.nameZh}" -> [${zhMap.get(ing.nameZh)}, ${ing.id}]`);
    else zhMap.set(ing.nameZh, ing.id);

    splitAliases(ing.nameZh).forEach(alias => {
      if (aliasMap.has(alias) && aliasMap.get(alias) !== ing.id) {
        errors.push(`别名冲突: "${alias}" -> [${aliasMap.get(alias)}, ${ing.id}]`);
      } else {
        aliasMap.set(alias, ing.id);
      }
    });

    if (ing.nameEn) {
      const key = ing.nameEn.toLowerCase().trim();
      if (enMap.has(key)) errors.push(`重复 nameEn: "${ing.nameEn}" -> [${enMap.get(key)}, ${ing.id}]`);
      else enMap.set(key, ing.id);
    }
  });
  return errors;
}

function validateCrossRef(ingredients, recipes) {
  const idSet = new Set(ingredients.map(i => i.id));
  const missing = new Map();   // id -> { count, samples[] }
  const used = new Set();
  recipes.forEach(r => {
    (r.ingredients || []).forEach(ri => {
      if (!ri.ingredientId) return;
      used.add(ri.ingredientId);
      if (!idSet.has(ri.ingredientId)) {
        const entry = missing.get(ri.ingredientId) || { count: 0, samples: [] };
        entry.count++;
        if (entry.samples.length < 3) entry.samples.push(`${r.id}(${r.nameZh})`);
        missing.set(ri.ingredientId, entry);
      }
    });
  });
  const unused = ingredients.filter(i => !used.has(i.id)).map(i => i.id);
  return { missing, unused };
}

// ---------- 自动新增占位 ----------
function guessCategory(id) {
  const s = id.toLowerCase();
  if (/(pork|beef|chicken|lamb|duck|mutton|bacon|ham|sausage)/.test(s)) return 'meat';
  if (/(fish|prawn|shrimp|crab|squid|octopus|clam|mussel|oyster|scallop|salmon|tuna|carp|tilapia|sardine|eel)/.test(s)) return 'seafood';
  if (/(tofu|bean|tempeh|natto|miso|soybean)/.test(s)) return 'bean';
  if (/(egg|milk|cheese|butter|cream|yogurt)/.test(s)) return 'egg_dairy';
  if (/(rice|noodle|bread|flour|pasta|bun|wrapper|pancake|dumpling|mantou)/.test(s)) return 'grain';
  if (/(oil)$/.test(s) || /(oil_)/.test(s)) return 'oil';
  if (/(sauce|paste|vinegar|wine|powder|salt|sugar|soy_sauce|seasoning|spice|syrup|honey)/.test(s)) return 'seasoning';
  if (/(dried_|_dried)/.test(s)) return 'dried';
  if (/(apple|pear|berry|melon|grape|orange|lemon|lime|cherry|peach|plum|kiwi|banana|mango|pineapple)/.test(s)) return 'fruit';
  return 'vegetable';
}

function idToTitle(id) {
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function createPlaceholder(id) {
  return {
    id,
    nameZh: `[待补] ${id}`,
    nameEn: idToTitle(id),
    category: guessCategory(id),
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0, sugar: 0 },
    priceNZD: 0,
    unit: 'g',
    allergens: [],
    warnings: [],
    highlights: [],
    supermarkets: [],
    season: [],
    placeholder: true,
  };
}

// ---------- 模式：默认（仅校验） ----------
function cmdValidate() {
  const ingredients = loadJson(INGREDIENTS_FILE);
  const recipes = loadJson(RECIPES_FILE);

  console.log(`食材数: ${ingredients.length}，菜谱数: ${recipes.length}\n`);

  const structErrors = validateStructure(ingredients);
  const dupErrors = validateDuplicates(ingredients);
  const { missing, unused } = validateCrossRef(ingredients, recipes);
  const placeholders = ingredients.filter(i => i.placeholder);

  let pass = true;
  const report = (title, items, isError = true) => {
    console.log(`【${title}】${items.length === 0 ? '✅ 通过' : (isError ? `❌ ${items.length} 项` : `⚠ ${items.length} 项`)}`);
    items.slice(0, 20).forEach(x => console.log(`  - ${x}`));
    if (items.length > 20) console.log(`  ... 以及 ${items.length - 20} 项`);
    if (items.length > 0 && isError) pass = false;
  };

  report('A. 字段完整性', structErrors);
  report('B. 重复检测', dupErrors);
  report('C. 菜谱缺失食材', [...missing.entries()].map(([id, info]) => `${id} (${info.count} 菜谱: ${info.samples.join(', ')})`));
  report('D. 占位待审核', placeholders.map(p => `${p.id} (${p.nameZh})`), false);
  report('E. 未被引用', unused, false);

  console.log('\n' + (pass ? '✅ 校验通过' : '❌ 校验失败'));
  if (!pass && missing.size > 0) {
    console.log('\n提示：运行 `node scripts/validate-ingredients.js --auto-fix` 可为缺失食材自动新增占位条目');
  }
  return pass ? 0 : 1;
}

// ---------- 模式：--auto-fix ----------
function cmdAutoFix() {
  const ingredients = loadJson(INGREDIENTS_FILE);
  const recipes = loadJson(RECIPES_FILE);
  const { missing } = validateCrossRef(ingredients, recipes);

  if (missing.size === 0) {
    console.log('✅ 无缺失食材，无需修复');
    return 0;
  }

  console.log(`将为 ${missing.size} 个缺失食材 ID 新增占位条目：\n`);
  const newItems = [];
  for (const [id, info] of missing.entries()) {
    const p = createPlaceholder(id);
    newItems.push(p);
    console.log(`  + ${id} -> category=${p.category} (被 ${info.count} 菜谱引用)`);
  }

  const merged = [...ingredients, ...newItems];
  writeJson(INGREDIENTS_FILE, merged);
  console.log(`\n✅ 已写入 ${newItems.length} 条占位食材。请手动补全营养数据/价格（nameZh 形如 "[待补] xxx"）`);
  return 0;
}

// ---------- 模式：--pre-add <file> ----------
function cmdPreAdd(candidateFile) {
  const ingredients = loadJson(INGREDIENTS_FILE);
  const candidates = loadJson(candidateFile);
  if (!Array.isArray(candidates)) throw new Error('候选文件必须是 JSON 数组');

  console.log(`预检 ${candidates.length} 个候选食材\n`);

  // 复用校验
  const structErrors = validateStructure(candidates);
  // 候选自身去重 + 与现有库的冲突
  const allForDup = [...ingredients, ...candidates];
  const dupAll = validateDuplicates(allForDup);
  // 过滤掉纯属现有库的旧错误（理论上现有库应已干净）
  const preExistingDup = new Set(validateDuplicates(ingredients));
  const newDup = dupAll.filter(e => !preExistingDup.has(e));

  let pass = true;
  const report = (title, items) => {
    console.log(`【${title}】${items.length === 0 ? '✅' : `❌ ${items.length}`}`);
    items.forEach(x => console.log(`  - ${x}`));
    if (items.length > 0) pass = false;
  };

  report('字段完整性', structErrors);
  report('与现有库或候选内部的重复/冲突', newDup);

  console.log('\n' + (pass ? '✅ 预检通过，可运行 --merge 合并' : '❌ 预检失败，请先修复'));
  return pass ? 0 : 1;
}

// ---------- 模式：--merge <file> ----------
function cmdMerge(candidateFile) {
  if (cmdPreAdd(candidateFile) !== 0) {
    console.log('\n❌ 由于预检失败，已中止合并');
    return 1;
  }
  const ingredients = loadJson(INGREDIENTS_FILE);
  const candidates = loadJson(candidateFile);
  const merged = [...ingredients, ...candidates];
  writeJson(INGREDIENTS_FILE, merged);
  console.log(`\n✅ 已合并 ${candidates.length} 条食材（${ingredients.length} → ${merged.length}）`);
  return 0;
}

// ---------- main ----------
const args = process.argv.slice(2);
let code = 0;
if (args.length === 0) {
  code = cmdValidate();
} else if (args[0] === '--auto-fix') {
  code = cmdAutoFix();
} else if (args[0] === '--pre-add' && args[1]) {
  code = cmdPreAdd(args[1]);
} else if (args[0] === '--merge' && args[1]) {
  code = cmdMerge(args[1]);
} else {
  console.error('用法:\n  validate-ingredients.js\n  validate-ingredients.js --auto-fix\n  validate-ingredients.js --pre-add <file>\n  validate-ingredients.js --merge <file>');
  code = 2;
}
process.exit(code);
