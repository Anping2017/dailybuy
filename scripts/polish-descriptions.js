/**
 * I4 描述重写脚本
 * 目标：把 226 道 description 为 "...精心烹饪，口感..." 的 fallback 文案
 * 替换为基于当前正确字段（cookingMethod/flavors/ingredients/region）的变体模板
 *
 * 与 backfill-descriptions.js 的区别：
 * 1. 多模板循环（按 id 哈希挑选），避免千篇一律
 * 2. 剔除 "精心烹饪" 字样
 * 3. 按 dishRole 分路（汤/主食/凉菜/主菜）使用不同文案骨架
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const ingredients = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const ING_NAME = Object.fromEntries(ingredients.map(i => [i.id, i.nameZh]));

const SOURCES = [
  'recipes-desserts-drinks.json',
  'recipes-quality-e.json','recipes-quality-d.json','recipes-quality-c.json',
  'recipes-quality-b.json','recipes-chinese-2.json','recipes-mega-3.json',
  'recipes-international.json','recipes-chinese-1.json',
  'recipes-hot-1.json','recipes-hot-2.json','recipes-hot-3.json','recipes.json',
  'recipes-legacy.json',
];

// ---- 词库 ----
const REGION_NAME = {
  homestyle: '家常菜', cantonese: '粤菜', sichuan: '川菜', hunan: '湘菜',
  jiangsu: '苏菜', zhejiang: '浙菜', shanghai: '上海本帮菜', anhui: '徽菜',
  shandong: '鲁菜', fujian: '闽菜', taiwanese: '台菜',
  northern: '北方风味', dongbei: '东北菜', southern: '南方风味',
  jiangzhe: '江浙菜', hubei: '湖北菜', xinjiang: '新疆风味', yunnan: '云南菜',
  lanzhou: '兰州风味',
  italian: '意式', french: '法式', american: '美式',
  mediterranean: '地中海菜', japanese: '日料', korean: '韩料',
  southeast_asian: '东南亚菜', vietnamese: '越南菜', thai: '泰菜',
  indian: '印度菜', mexican: '墨西哥菜',
};

const METHOD_VERB = {
  stir_fry: ['旺火快炒', '大火爆炒', '翻炒收汁'],
  boil: ['清水汆煮', '沸水烫熟', '轻煮入味'],
  braise: ['红烧收汁', '小火慢烧', '文火收汁上色'],
  stew: ['小火慢炖', '文火煨炖', '慢炖出味'],
  roast: ['烤箱烘烤', '炭火炙烤', '明火烧烤'],
  steam: ['清蒸锁鲜', '隔水蒸透', '蒸汽蒸制'],
  deep_fry: ['高温油炸', '二次复炸', '炸至金黄'],
  dry_pot: ['干煸入味', '铁板煸炒', '干锅煸香'],
  cold_dish: ['调味凉拌', '冰镇拌制', '腌渍入味'],
  staple: ['精心烹制', '讲究配料', '层次铺陈'],
  soup: ['文火慢煨', '高汤吊味', '久熬出鲜'],
  pan_fry: ['小火慢煎', '平底锅煎香', '双面煎至焦香'],
  simmer: ['低温煨煮', '文火收浓', '慢煨出味'],
  grill: ['明火炙烤', '炭火烧烤', '烤架炙热'],
  bake: ['烤箱烘焙', '热风循环烤制', '中温烘焙'],
};

const TEXTURE = {
  stir_fry: ['锅气十足', '爽脆入味', '火候恰到好处'],
  boil: ['清爽利落', '原味保留', '汤清味鲜'],
  braise: ['色泽红亮', '酱香浓郁', '肉质酥烂'],
  stew: ['软烂入味', '汤浓味厚', '入口即化'],
  roast: ['外焦里嫩', '香气四溢', '焦香诱人'],
  steam: ['原汁原味', '鲜嫩清甜', '保留食材本味'],
  deep_fry: ['外酥内嫩', '金黄酥脆', '入口咔哧'],
  dry_pot: ['焦香过瘾', '干香麻辣', '越吃越香'],
  cold_dish: ['爽口开胃', '清凉解腻', '层次分明'],
  staple: ['饱腹实在', '主食丰足', '口感丰富'],
  soup: ['汤色清亮', '鲜美滋补', '暖胃润喉'],
  pan_fry: ['外香内嫩', '表皮焦脆', '油润不腻'],
  simmer: ['汤浓味厚', '层层入味', '耐人回味'],
  grill: ['烟熏焦香', '肉汁四溢', '脂香迷人'],
  bake: ['表皮金黄', '内里松软', '黄油香浓'],
};

const FLAVOR_NAME = {
  sour: '酸爽', sweet: '甘甜', bitter: '微苦', spicy: '香辣',
  salty: '咸香', umami: '鲜美', light: '清淡',
};

// 四种 dishRole 特有的开头和结尾
const OPENERS_MAIN = [
  '{region}经典家常做法',
  '深受欢迎的{region}代表作',
  '{region}里的下饭好手',
  '{region}家庭餐桌常客',
  '{region}里的传统味道',
];
const OPENERS_SOUP = [
  '一道滋润的{region}汤品',
  '{region}中的经典汤羹',
  '家常喝汤首选',
  '{region}餐桌上的暖心汤',
];
const OPENERS_COLD = [
  '{region}里的清爽凉菜',
  '夏日开胃必备',
  '{region}凉拌代表作',
  '一道冰镇解腻的{region}凉菜',
];
const OPENERS_STAPLE = [
  '{region}里的饱腹主食',
  '{region}特色主食',
  '一碗能吃饱的{region}主食',
  '{region}餐桌必备主食',
];

const CLOSERS_EASY = ['做法简单、新手友好', '家常操作、零失败', '快手就能端上桌', '无需厨艺基础'];
const CLOSERS_MEDIUM = ['家常做法、人人可学', '步骤清晰、易上手', '一次成功的家常菜'];
const CLOSERS_HARD = ['工艺讲究，宴客撑场', '细节到位，味道地道', '耐心成就美味', '适合周末慢做'];
const CLOSERS_SOUP = ['一碗下肚，四季皆宜', '暖胃又养生', '与主食搭配相得益彰'];
const CLOSERS_COLD = ['搭配白酒/啤酒绝配', '夏日餐桌常客', '开胃又解腻'];
const CLOSERS_STAPLE = ['一碗顶饱', '吃了就停不下来', '工作日快手午餐首选', '简单一顿就满足'];

// 用 id 的哈希作为确定性索引（同一 id 每次得到同样的模板）
function hashPick(id, arr) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return arr[Math.abs(h) % arr.length];
}

function buildDescription(recipe) {
  const region = REGION_NAME[recipe.regionalCuisine] || '家常菜';
  const method = recipe.cookingMethod;
  const verb = hashPick(recipe.id + 'v', METHOD_VERB[method] || METHOD_VERB.stir_fry);
  const texture = hashPick(recipe.id + 't', TEXTURE[method] || TEXTURE.stir_fry);
  const flavors = (recipe.flavors || []).map(f => FLAVOR_NAME[f]).filter(Boolean).slice(0, 3).join('、');

  // 主料（取前 2 个非调料食材）
  const mainIngs = (recipe.ingredients || [])
    .map(ri => ing => ri) // placeholder
    .slice(0, 5);
  const proteins = [];
  for (const ri of (recipe.ingredients || [])) {
    const name = ING_NAME[ri.ingredientId];
    if (!name) continue;
    // 跳过纯调料/油
    if (/油|盐|糖|醋|酒|酱|粉|椒|姜|蒜|葱/.test(name) && name.length <= 2) continue;
    proteins.push(name);
    if (proteins.length >= 2) break;
  }
  const mainsStr = proteins.length > 0 ? proteins.slice(0, 2).join('配') : '';

  // 开头
  let opener;
  switch (recipe.dishRole) {
    case 'soup':   opener = hashPick(recipe.id + 'o', OPENERS_SOUP); break;
    case 'cold':   opener = hashPick(recipe.id + 'o', OPENERS_COLD); break;
    case 'staple': opener = hashPick(recipe.id + 'o', OPENERS_STAPLE); break;
    default:       opener = hashPick(recipe.id + 'o', OPENERS_MAIN); break;
  }
  opener = opener.replace('{region}', region);

  // 主句
  let body;
  if (mainsStr) {
    body = `以${mainsStr}为主料，${verb}，${texture}`;
  } else {
    body = `${verb}，${texture}`;
  }
  if (flavors) body += `，口味${flavors}`;

  // 结尾
  let closer;
  if (recipe.dishRole === 'soup') {
    closer = hashPick(recipe.id + 'c', CLOSERS_SOUP);
  } else if (recipe.dishRole === 'cold') {
    closer = hashPick(recipe.id + 'c', CLOSERS_COLD);
  } else if (recipe.dishRole === 'staple') {
    closer = hashPick(recipe.id + 'c', CLOSERS_STAPLE);
  } else if (recipe.difficulty === 'hard' || recipe.difficulty === 'expert') {
    closer = hashPick(recipe.id + 'c', CLOSERS_HARD);
  } else if (recipe.difficulty === 'easy') {
    closer = hashPick(recipe.id + 'c', CLOSERS_EASY);
  } else {
    closer = hashPick(recipe.id + 'c', CLOSERS_MEDIUM);
  }

  let desc = `${opener}。${body}，${closer}。`;
  // 长度控制
  if (desc.length > 150) desc = desc.slice(0, 148) + '。';
  return desc;
}

function needsRewrite(desc) {
  if (!desc) return true;
  // 过短（<20 字）也需要重写
  if (desc.length < 20) return true;
  // fallback 模板痕迹
  return /精心烹饪，?口感|家常好味/.test(desc) || /家常家常/.test(desc);
}

function run() {
  let totalRewrite = 0;
  for (const file of SOURCES) {
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) continue;
    const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
    let changed = 0;
    for (const r of arr) {
      if (needsRewrite(r.description)) {
        r.description = buildDescription(r);
        changed++;
        totalRewrite++;
      }
    }
    if (changed > 0) {
      fs.writeFileSync(p, JSON.stringify(arr, null, 2));
      console.log(`✏  ${file.padEnd(32)} 重写 ${changed}`);
    }
  }
  console.log(`\n✅ 共重写 ${totalRewrite} 道菜的 description`);
}

run();
