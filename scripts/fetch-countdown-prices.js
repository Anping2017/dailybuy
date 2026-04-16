#!/usr/bin/env node
/**
 * 从 Countdown (Woolworths NZ) 抓取食材参考价，回填 ingredients.json 的 priceNZD。
 *
 * 用法:
 *   node scripts/fetch-countdown-prices.js                # 全量抓取并写回 JSON
 *   node scripts/fetch-countdown-prices.js --dry-run      # 只生成报告，不改 JSON
 *   node scripts/fetch-countdown-prices.js --only=chicken_breast,beef_mince
 *   node scripts/fetch-countdown-prices.js --limit=20     # 只跑前 20 个
 *   node scripts/fetch-countdown-prices.js --verbose      # 打印每项详细
 *
 * 报告输出: scripts/output/countdown-prices-report.json
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
const REPORT_DIR = path.join(__dirname, 'output');
const REPORT_FILE = path.join(REPORT_DIR, 'countdown-prices-report.json');

// --- 参数 ---
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const VERBOSE = argv.includes('--verbose');
const getArg = (name) => {
  const a = argv.find(x => x.startsWith(name + '='));
  return a ? a.slice(name.length + 1) : null;
};
const ONLY = getArg('--only')?.split(',').map(s => s.trim()).filter(Boolean) || null;
const LIMIT = Number(getArg('--limit')) || null;
const DELAY_MS = Number(getArg('--delay')) || 300;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

// --- HTTP ---
async function searchCountdown(query) {
  const url = `https://www.woolworths.co.nz/api/v1/products?target=search&search=${encodeURIComponent(query)}&size=5`;
  const r = await fetch(url, {
    headers: {
      'accept': 'application/json, text/plain, */*',
      'user-agent': UA,
      'x-requested-with': 'OnlineShopping.WebApp',
    },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function cleanQuery(name) {
  return name
    .split('/')[0]            // "Kelp / Kombu" → "Kelp"
    .replace(/\(.*?\)/g, '')  // 去括号
    .replace(/\s+/g, ' ')
    .trim();
}

/** 按 category 增强查询词，提升匹配质量 */
function buildQuery(ing) {
  const base = cleanQuery(ing.nameEn);
  switch (ing.category) {
    case 'vegetable':
    case 'fruit':
      // "fresh xxx" 能有效避开湿巾、干货等干扰项
      return `fresh ${base}`;
    default:
      return base;
  }
}

// --- 归一化 ---
/**
 * 把 Countdown 产品归一化为三种 per-unit 价格:
 *   perKg    = NZD / kg
 *   perL     = NZD / L
 *   perPiece = NZD / 一个个体 (一只鸡蛋、一个苹果、一把葱)
 *
 * Countdown 字段约定:
 *   unit = 'Kg'   → salePrice 即每 kg 价
 *   unit = 'Each' → salePrice 是"一个包装"的价格（可能是 1 件或 N 件一包）
 *   size.cupMeasure + cupPrice → 已归一好的每小单位参考价 (最可靠)
 *       e.g. cupMeasure='1kg' / '100g' / '1L' / '100mL' / '1ea'
 *   size.volumeSize → 可辅助解析包装数量, e.g. '20pack', '12pk', '500g'
 */
function normalizePrice(p) {
  const cm = (p.size?.cupMeasure || '').toLowerCase().trim();
  const cp = p.size?.cupPrice ?? 0;
  const sp = p.price?.salePrice ?? 0;
  const unit = (p.unit || '').toLowerCase();
  const vs = (p.size?.volumeSize || '').toLowerCase().trim();

  let perKg = null, perL = null, perPiece = null;

  // 1) 优先用 cupPrice + cupMeasure
  if (cp > 0) {
    const m = cm.match(/^(\d*\.?\d+)\s*(kg|g|l|ml|ea|each|pk|pack)$/);
    if (m) {
      const n = parseFloat(m[1]);
      const u = m[2];
      if (n > 0) {
        if (u === 'kg') perKg = cp / n;
        else if (u === 'g') perKg = (cp / n) * 1000;
        else if (u === 'l') perL = cp / n;
        else if (u === 'ml') perL = (cp / n) * 1000;
        else if (u === 'ea' || u === 'each' || u === 'pk' || u === 'pack') perPiece = cp / n;
      }
    }
  }

  // 2) 补充: Countdown.unit='Kg' 时 salePrice 就是每 kg
  if (unit === 'kg' && perKg == null && sp > 0) perKg = sp;

  // 3) 补充: Countdown.unit='Each' 时, salePrice 是整包价, 要拆
  if (unit === 'each' && perPiece == null && sp > 0) {
    // volumeSize='20pack' / '12pk' / '6ea' → 包装数量
    const qtyMatch = vs.match(/^(\d+)\s*(pack|pk|pcs?|ea|each)$/);
    // volumeSize='500g' / '1kg' / '1L' → 重量/体积
    const weightMatch = vs.match(/^(\d*\.?\d+)\s*(kg|g|l|ml)$/);
    if (qtyMatch) {
      const qty = parseInt(qtyMatch[1], 10);
      if (qty > 0) perPiece = sp / qty;
    } else if (weightMatch && perKg == null && perL == null) {
      const n = parseFloat(weightMatch[1]);
      const u = weightMatch[2];
      if (n > 0) {
        if (u === 'kg') perKg = sp / n;
        else if (u === 'g') perKg = (sp / n) * 1000;
        else if (u === 'l') perL = sp / n;
        else if (u === 'ml') perL = (sp / n) * 1000;
      }
      perPiece = sp;
    } else {
      // 没规格信息时视为单件
      perPiece = sp;
    }
  }

  return { perKg, perL, perPiece };
}

/** 按目标 ingredient.unit 选一个合适的价格（密度统一按 1 g/mL 粗估） */
function toTargetPrice(norm, targetUnit) {
  const { perKg, perL, perPiece } = norm;
  switch (targetUnit) {
    case 'kg':    return perKg ?? perL ?? (perPiece != null ? perPiece * 5 : null); // 假设 ~200g/piece
    case 'litre': return perL ?? perKg ?? null;
    case 'dozen':
      if (perPiece != null) return perPiece * 12;
      if (perKg != null)   return perKg * 0.6; // 12 蛋 ≈ 600g
      return null;
    case 'piece':
    case 'bunch':
    case 'pack':
    case 'bottle':
    case 'loaf':
    default:
      return perPiece ?? (perKg != null ? perKg * 0.2 : null); // 约 200g/件
  }
}

function pickBest(items) {
  if (!items?.length) return null;
  // 优先: 有库存且价格 > 0
  const stocked = items.filter(i => (i.stockLevel ?? 0) >= 1 && (i.price?.salePrice ?? 0) > 0);
  return stocked[0] || items[0];
}

// --- 主流程 ---
async function main() {
  const ingredients = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  let targets = ingredients;
  if (ONLY) targets = targets.filter(i => ONLY.includes(i.id));
  if (LIMIT) targets = targets.slice(0, LIMIT);

  console.log(`Target ingredients: ${targets.length}${DRY ? ' (dry-run)' : ''}`);
  console.log('');

  const matched = [];
  const unmatched = [];

  for (let i = 0; i < targets.length; i++) {
    const ing = targets[i];
    const prefix = `[${String(i + 1).padStart(3, ' ')}/${targets.length}]`;
    try {
      const query = buildQuery(ing);
      const resp = await searchCountdown(query);
      const items = resp.products?.items || [];
      const best = pickBest(items);
      if (!best) {
        unmatched.push({ id: ing.id, nameEn: ing.nameEn, reason: 'no_results' });
        console.log(`${prefix} ${ing.nameEn.padEnd(32)} MISS (no results)`);
        continue;
      }

      const norm = normalizePrice(best);
      const newPrice = toTargetPrice(norm, ing.unit);
      if (newPrice == null || newPrice <= 0) {
        unmatched.push({
          id: ing.id, nameEn: ing.nameEn, reason: 'cannot_normalize',
          matched: best.name, cdUnit: best.unit, cdSize: best.size,
        });
        console.log(`${prefix} ${ing.nameEn.padEnd(32)} MISS (cannot normalize: ${best.name})`);
        continue;
      }

      const oldPrice = ing.priceNZD;
      const rounded = Math.round(newPrice * 100) / 100;
      const changePct = oldPrice > 0 ? Math.abs(rounded - oldPrice) / oldPrice : 0;
      const suspect = changePct > 0.5; // 变动 >50% 标记为 suspect
      const record = {
        id: ing.id,
        nameEn: ing.nameEn,
        targetUnit: ing.unit,
        oldPrice,
        newPrice: rounded,
        change: Math.round((rounded - oldPrice) * 100) / 100,
        changePct: Math.round(changePct * 100),
        suspect,
        query,
        matchedName: best.name,
        brand: best.brand,
        sku: best.sku,
        cdUnit: best.unit,
        cdVolumeSize: best.size?.volumeSize,
        cdCupPrice: best.price?.cupPrice,
        cdCupMeasure: best.size?.cupMeasure,
        cdSalePrice: best.price?.salePrice,
        url: best.sku ? `https://www.woolworths.co.nz/shop/productdetails?stockcode=${best.sku}` : null,
      };
      matched.push(record);
      if (!DRY && !suspect) ing.priceNZD = rounded; // 仅写回可信结果

      const delta = rounded - oldPrice;
      const sign = delta > 0 ? '+' : '';
      const flag = suspect ? ' ⚠' : '  ';
      const tail = VERBOSE ? `  [${best.name}]` : '';
      console.log(`${prefix}${flag}${ing.nameEn.padEnd(32)} ${String(oldPrice).padStart(7)} → ${String(rounded).padEnd(7)} (${sign}${delta.toFixed(2)})${tail}`);
    } catch (e) {
      unmatched.push({ id: ing.id, nameEn: ing.nameEn, reason: e.message });
      console.log(`${prefix} ${ing.nameEn.padEnd(32)} ERR ${e.message}`);
    }

    if (i < targets.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
  }

  // 写报告
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const suspectCount = matched.filter(m => m.suspect).length;
  const writtenCount = matched.length - suspectCount;
  const report = {
    fetchedAt: new Date().toISOString(),
    source: 'woolworths.co.nz (Countdown NZ)',
    dryRun: DRY,
    total: targets.length,
    matchedCount: matched.length,
    suspectCount,
    writtenCount,
    unmatchedCount: unmatched.length,
    matched,
    unmatched,
  };
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  // 写回 ingredients.json (跳过 suspect)
  if (!DRY && writtenCount > 0) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(ingredients, null, 2) + '\n');
  }

  console.log('');
  console.log(`${DRY ? '[dry-run] ' : ''}Matched: ${matched.length}/${targets.length}  Suspect (skipped): ${suspectCount}  Unmatched: ${unmatched.length}`);
  console.log(`Report: ${path.relative(process.cwd(), REPORT_FILE)}`);
  if (!DRY && writtenCount > 0) {
    console.log(`Updated ${writtenCount} prices in ${path.relative(process.cwd(), DATA_FILE)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
