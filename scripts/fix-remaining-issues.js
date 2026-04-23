/**
 * 针对审计剩余的具体菜谱做精细修复
 */
const fs = require('fs');
const path = require('path');
const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));

// ID → 修改字段
const fixes = {
  tang_papaya_milk: { cookingMethod: 'braise' },  // 木瓜炖牛奶
  soba_cold: { cookingMethod: 'cold_dish' },       // 冷荞麦面
  cn_shrimp_wonton_soup: { cookingMethod: 'staple' },  // 虾仁馄饨汤 - 主食
  intl_chicken_noodle_soup: { cookingMethod: 'staple' },
  cn_wonton_soup_2: { cookingMethod: 'staple' },
  steamed_egg: { cookingMethod: 'soup' },  // 蒸蛋羹 = 羹 = soup
  'cantonese-braised-pork-ribs': { cookingMethod: 'braise' },  // 排骨焖饭底排骨
  bulk450_ev_115: { cookingMethod: 'braise', prepTime: 10, cookTime: 25 },  // 油焖春笋

  // 时间不合理 - 红烧类延长到 30 分钟
  braised_winter_melon: { prepTime: 10, cookTime: 25 },
  homestyle_hongshao_doufu: { prepTime: 10, cookTime: 25 },
  dongbei_stewed_cabbage_tofu: { prepTime: 10, cookTime: 25 },
  homestyle_braised_salmon: { prepTime: 10, cookTime: 25 },
  braised_eggplant_mince: { prepTime: 10, cookTime: 25 },
  stew_tomato_egg_tofu: { prepTime: 10, cookTime: 25 },
  home_braised_potato_dark: { prepTime: 10, cookTime: 25 },

  // 名字 vs 食材: 意式培根蛋酱面 无培根 → 添加 bacon
  italian_carbonara: {
    ingredients_add: [{ ingredientId: 'bacon', amount: 80, unit: 'g' }],
  },
  // 西兰花虾仁(无虾版) → 改名
  extra130_cold_058: { nameZh: '西兰花蘑菇凉拌', nameEn: 'Cold Broccoli Mushroom' },

  // 空 nameEn
  extra130_bf_081: { nameEn: 'White Toast (No Dairy)' },

  // 二次审核剩余的 6 条
  bulk450_ev_123: { cookingMethod: 'braise', prepTime: 10, cookTime: 25 },  // 焖四季豆
  bulk450_eu_182: { cookingMethod: 'braise' },  // 香菇炖鸡 — 炖通常是 braise, 不是 soup
  bulk450_eu_183: { cookingMethod: 'braise' },  // 红枣炖鸡
  bulk450_m_198: { cookingMethod: 'steam' },    // 梅菜蒸排骨
  bulk450_h_293: { cookingMethod: 'steam' },    // 柠檬蒸排骨
  extra130_em_103: { cookingMethod: 'braise', prepTime: 10, cookTime: 25 },  // 芋头炖鸡
};

let count = 0;
for (const r of recipes) {
  const fix = fixes[r.id];
  if (!fix) continue;
  for (const [k, v] of Object.entries(fix)) {
    if (k === 'ingredients_add') {
      r.ingredients = [...(r.ingredients || []), ...v];
    } else {
      r[k] = v;
    }
  }
  count++;
}

fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2), 'utf8');
console.log(`✅ 精细修复 ${count} 道菜谱`);
