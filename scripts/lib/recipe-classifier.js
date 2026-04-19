/**
 * 菜谱分类器（共享库）
 * 与 src/lib/recipe-engine/engine.ts 的分类逻辑保持一致
 *
 * 输出以下显式字段（由 enrich-recipes.js 写入源文件）：
 *   - dishRole:       'main_meat' | 'main_veg' | 'soup' | 'staple' | 'cold' | 'drink'
 *   - isVegetarian:   boolean  — 不含 meat/seafood 类食材
 *   - stapleCategory: 'rice'|'noodles'|'bread'|'congee'|'mantou'|null
 *   - dishStyle:      'meat'|'veg'|'egg'  — 用于汤/凉菜子过滤（UserProfile.soupStyle / coldDishStyle）
 */
const fs = require('fs');
const path = require('path');

const INGREDIENTS = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'data', 'ingredients.json'), 'utf8')
);
const ING_BY_ID = Object.fromEntries(INGREDIENTS.map(i => [i.id, i]));

const MEAT_CATEGORIES = new Set(['meat', 'seafood']);

/** 是否含肉/海鲜类食材 */
function isMeatDish(recipe) {
  return (recipe.ingredients || []).some(ri => {
    const ing = ING_BY_ID[ri.ingredientId];
    return ing && MEAT_CATEGORIES.has(ing.category);
  });
}

/** 主食关键词识别（覆盖 cookingMethod 误标） */
function isStapleByName(recipe) {
  const name = recipe.nameZh || '';
  const en = (recipe.nameEn || '').toLowerCase();
  if (/凉拌|凉菜|沙拉|拌(?!面|粉|饭)|蘸料|包菜|包心菜|大白菜|小白菜|菜花/.test(name)) return false;
  // 排除明确的甜点饼类
  if (/月饼|蛋挞|蛋黄酥|凤梨酥|奶黄包|流沙包|甜甜圈|donut/.test(name+en)) return false;
  // 标准主食关键词
  if (/粥|饭$|米饭|蛋炒饭|盖饭|烩饭|炒饭|寿司|意面|意大利面|乌冬|拉面|肠粉|河粉|米线|米粉|面条|面$|凉面|拌面|炒面|烩面|擀面|碱面|面包|烤面包|三明治|汉堡|薯条|吐司|馒头|花卷|馕|烧饼|大饼|烙饼|煎饼|蛋饼|手抓饼|烤饼|包子|生煎|小笼|烧麦|饺子|馄饨|抄手|凉皮|凉粉|粽子|韭菜盒子|意式饺|烤红薯|蒸红薯|蒸玉米|汤圆|元宵|汤包|汤饭/.test(name)) return true;
  // 通用"X饼"/"X糕" — 含蔬菜/谷物名的饼/糕(中式咸味早餐),按主食处理
  if (/(?:萝卜|玉米|土豆|红薯|地瓜|韭菜|胡萝卜|卷心菜|包菜|香葱|葱油|香菜|海带|紫菜|海鲜|鸡蛋|猪肉|牛肉|虾).*?饼|(?:萝卜|玉米|土豆|红薯|地瓜|韩式).*?糕|年糕|大阪烧|韩式煎饼|韩式海鲜煎饼|海鲜煎饼|蛋抓饼|抓饼/.test(name)) return true;
  // 豆腐脑(中式早餐主食)
  if (/豆腐脑/.test(name)) return true;
  // 西式 pancake/waffle/crepe 类(甜咸通吃,默认主食)
  if (/松饼|华夫饼|可丽饼|班戟|墨西哥饼|tortilla|pita|naan|pancake|waffle|crepe/.test(name+en)) return true;
  // 蒸蛋糕(咸口) — 区别于甜蛋糕
  if (/蒸鸡蛋糕|蒸蛋糕|咸蛋糕/.test(name)) return true;
  return false;
}

/** 汤类识别（排除 汤圆/汤饭/汤面 等主食） */
function isSoupByName(recipe) {
  const name = recipe.nameZh || '';
  if (/汤圆|汤饭|汤面|汤粉|汤包/.test(name)) return false;
  return /汤$|羹$|煲$|高汤|清汤|浓汤|奶汤|鱼汤|肉汤|菜汤|蛋汤|味噌|罗宋|乌鸡汤|鸡汤|肉骨茶/.test(name);
}

/** 饮品识别 — 严格,只匹配纯饮料,排除"可乐鸡翅/豆浆油条/奶昔碗"等正餐 */
function isBeverage(recipe) {
  const name = recipe.nameZh || '';
  if (/汤|羹/.test(name)) return false;
  // 否定关键词: 含以下词的不是饮品(优先级高)
  if (/鸡翅|鸡块|鸡腿|鸡肉|猪肉|牛肉|羊肉|鱼|虾|油条|包|碗|饼|油条|意面|沙拉|烩|焖/.test(name)) return false;
  // 严格匹配: 名字必须以茶/咖啡等结尾,或是明显的饮品名词
  return /茶$|奶茶$|果汁$|柠檬水$|咖啡$|拿铁$|卡布奇诺|摩卡$|奶昔$|思慕雪|smoothie$|气泡水|苏打水|柚子蜜$|蜂蜜水|姜茶|柠水$|椰汁$|椰奶$|米酒$|豆浆$|豆奶$|杏仁奶$|燕麦奶$|牛奶$|酸奶$|热可可|热巧克力|hot chocolate|matcha latte|拉茶$|奶昔碗$/.test(name);
}

/** 点心/零食识别(甜点 + 油炸小食 + 糕饼类) */
function isSnack(recipe) {
  const name = recipe.nameZh || '';
  const en = (recipe.nameEn || '').toLowerCase();
  // 优先排除: 含肉/海鲜/鱼/蛋的菜不是甜点(蒸蛋/鱼饼等是主菜)
  if (/猪肉|牛肉|羊肉|鸡肉|鸡翅|鸡腿|鸡块|鸡丁|鸭肉|鱼肉|鱼饼|虾饼|蒸蛋|蒸水蛋|蛋羹|肉饼|肉松|蟹/.test(name)) return false;
  // 排除带"炸鸡"等明显主菜词
  if (/炸鸡|炒鸡|烤鸡|焖鸡|卤鸡/.test(name)) return false;
  // 排除已经是主食的(面包/饼类已归 staple)
  if (isStapleByName(recipe)) return false;
  // 拔丝/糖葫芦类糖衣甜品
  if (/拔丝|糖葫芦|糖渍|蜜饯|糖霜|焦糖/.test(name)) return true;
  // 中式糕点/甜食（含糖水：红豆沙/绿豆沙/芝麻糊/西米露/双皮奶等）
  if (/月饼|绿豆糕|桃酥|麻花|麻团|麻球|豆沙包|菠萝包|奶黄包|流沙包|凤梨酥|蛋黄酥|蛋挞$|蛋挞|沙琪玛|驴打滚|糯米糍|糯米鸡|桂花糕|红豆糕|马蹄糕|青团|艾草|地瓜球|双皮奶|姜撞奶|龟苓膏|凉糕|红豆沙|绿豆沙|芝麻糊|杏仁茶|杏仁豆腐|银耳羹|银耳汤|椰汁|布丁|果冻|杨枝甘露|西米露|冰糖雪梨|糖水/.test(name)) return true;
  // 西式甜点 — 蛋糕只匹配甜口的(排除"鸡蛋糕/咸蛋糕"),crepe/可丽饼默认归点心
  if (/^(?!.*咸).*蛋糕|cake|曲奇|cookie|饼干|biscuit|布朗尼|brownie|cupcake|马卡龙|macaron|tiramisu|提拉米苏|cheesecake|芝士蛋糕|甜挞|甜派|tart|派$|pie|甜甜圈|donut|doughnut|司康|scone|甜可丽饼|sweet crepe|华夫$|waffle|pudding|布丁|mousse|慕斯|gelato|ice cream|冰淇淋|sorbet|sundae|圣代/.test(name + en)) return true;
  // 但中式蒸鸡蛋糕、蒸蛋糕(咸口) 不算甜点
  if (/蒸蛋|蒸鸡蛋|咸蛋糕/.test(name)) return false;
  // 油炸小食(非主菜的零嘴) — 排除带肉的
  if (/^(?!.*肉)(.*丸子)$|^炸丸子|薯片|爆米花|popcorn|chips$|nuggets/.test(name + en)) return true;
  return false;
}

/** 凉菜识别（含 cookingMethod + 名字） */
function isColdByName(recipe) {
  const name = recipe.nameZh || '';
  return /凉拌|凉菜|沙拉|salad|拌(?!面|粉|饭)|卤味|醉/.test(name);
}

/** 蛋汤判断 */
function isEggSoup(recipe) {
  const name = recipe.nameZh || '';
  const hasEggInName = /蛋花|蛋羹|鸡蛋|蛋汤/.test(name);
  const hasEggIngredient = (recipe.ingredients || []).some(ri => ri.ingredientId === 'egg');
  if (!hasEggInName && !hasEggIngredient) return false;
  return !isMeatDish(recipe);
}

/** 推断 dishRole（和 engine.ts 保持一致） */
function inferDishRole(recipe) {
  if (isBeverage(recipe)) return 'drink';
  if (isSnack(recipe)) return 'snack';
  if (recipe.cookingMethod === 'staple' || isStapleByName(recipe)) return 'staple';
  if (recipe.cookingMethod === 'soup' || isSoupByName(recipe)) return 'soup';
  if (recipe.cookingMethod === 'cold_dish' || isColdByName(recipe)) return 'cold';
  if (isMeatDish(recipe)) return 'main_meat';
  return 'main_veg';
}

/** 主食子类别（对齐 UserProfile.StaplePreference） */
function inferStapleCategory(recipe) {
  const n = recipe.nameZh || '';
  // 粥/糊/燕麦类
  if (/粥|糊$|congee|porridge|oatmeal/i.test(n)) return 'congee';
  // 豆腐脑/豆花
  if (/豆腐脑|豆花|豆腐羹/i.test(n)) return 'congee';
  // 饺类/包子类/馒头类 → mantou
  if (/馒头|花卷|馕|包子|生煎|小笼|烧麦|饺|馄饨|抄手|bun|dumpling|mantou|糯米球|糯米糍|艾饺/i.test(n)) return 'mantou';
  // 素菜包/菜包/肉包（≠ 生菜包 这种沙拉卷）
  if (/素菜包$|菜包$|肉包$|叉烧包/i.test(n)) return 'mantou';
  // 西式面包
  if (/面包|吐司|三明治|汉堡|薯条|bread|toast|sandwich|burger|scone|muffin|司康|玛芬|可颂|贝果|pita|naan/i.test(n)) return 'bread';
  // 饼类/糕类/烧物（中式饼 + 日式烧物 + 部分糕类）
  if (/饼|烙饼|煎饼|手抓饼|pancake|crepe|可丽饼|盒子|萝卜糕|芋头糕|松糕|鸡蛋糕|大阪烧|广岛烧|okonomiyaki/i.test(n)) return 'bread';
  // 薯类/玉米/南瓜 — 作为主食时归 rice（淀粉类根茎）
  if (/(^|\s)(蒸|烤|焖)?(红薯|紫薯|玉米|芋头|山药|土豆|南瓜)/i.test(n) && /^蒸|^烤|^焖/.test(n)) return 'rice';
  // 面条/粉（含粉丝/粉条/年糕，允许后缀如 "(2人份)"）
  if (/面条|面($|（|\(|\s)|拌面|炒面|烩面|凉面|乌冬|拉面|意面|意大利面|米线|米粉|肠粉|河粉|粉丝|粉条|年糕|noodle|pasta|spaghetti|ramen|udon/i.test(n)) return 'noodles';
  // 米饭类（放最后，匹配 饭 出现在任意位置；汤圆/元宵/西米露 糯米制品也归 rice）
  if (/饭|寿司|汤圆|元宵|西米露|rice|risotto|burrito|卷$/i.test(n)) return 'rice';
  return null;
}

/** 推断 dishStyle（荤/素/蛋，主要用于 soup/cold 子过滤） */
function inferDishStyle(recipe) {
  if (isMeatDish(recipe)) return 'meat';
  // 蛋类为主（无肉无海鲜）
  const hasEgg = (recipe.ingredients || []).some(ri => {
    const ing = ING_BY_ID[ri.ingredientId];
    return ing && (ing.category === 'egg_dairy' && /egg|蛋/.test(ing.id + ing.nameZh));
  });
  if (hasEgg) {
    // 仅当以蛋为主或为蛋汤时标 egg
    const name = recipe.nameZh || '';
    if (/蛋花|蛋羹|鸡蛋|蛋汤|炒蛋|蒸蛋|煎蛋|荷包蛋|茶叶蛋/.test(name)) return 'egg';
  }
  return 'veg';
}

/** 一次性给菜谱补齐所有分类字段（返回新对象） */
function classify(recipe) {
  const dishRole = inferDishRole(recipe);
  const isVegetarian = !isMeatDish(recipe);
  const stapleCategory = dishRole === 'staple' ? inferStapleCategory(recipe) : null;
  const dishStyle = inferDishStyle(recipe);
  return { dishRole, isVegetarian, stapleCategory, dishStyle };
}

module.exports = {
  classify,
  inferDishRole,
  inferStapleCategory,
  inferDishStyle,
  isMeatDish,
  isStapleByName,
  isSoupByName,
  isBeverage,
  isSnack,
  isColdByName,
  isEggSoup,
  ING_BY_ID,
  INGREDIENTS,
};
