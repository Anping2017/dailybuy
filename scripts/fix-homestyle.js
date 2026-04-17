// Fix homestyle recipes - use real traditional recipes
const fs = require('fs');
const path = require('path');

const VALID_INGREDIENTS = new Set([
  'chicken_breast','chicken_thigh','chicken_wing','chicken_whole','pork_belly','pork_mince','pork_loin','pork_ribs',
  'beef_sirloin','beef_mince','beef_shank','lamb_leg','salmon_fillet','shrimp','squid','fish_fillet','snapper','cod',
  'mussel','scallop','egg','salted_egg','tofu','dried_tofu','tofu_puff','dried_tofu_skin','edamame','bacon','sausage',
  'duck_leg','rice','glutinous_rice','noodles_dried','vermicelli','rice_noodles','rice_flour','wheat_starch','flour',
  'oats','cornmeal','millet','bread','wonton_wrapper','potato','broccoli','bok_choy','chinese_cabbage','tomato',
  'capsicum','carrot','onion','garlic','ginger','spring_onion','mushroom','dried_mushroom','enoki_mushroom','portobello',
  'shiitake_fresh','spinach','eggplant','cucumber','zucchini','sweet_potato','corn','green_bean','celery','bean_sprouts',
  'white_radish','lettuce','chili_pepper','pumpkin','cabbage','leek','snow_pea','asparagus','lotus_root','bitter_melon',
  'cauliflower','winter_melon','yam','taro','water_chestnut','kiwi','pear','grape','mango','peach','apple','banana',
  'orange','soy_sauce','light_soy','dark_soy','cooking_oil','sesame_oil','oyster_sauce','sugar','rock_sugar','vinegar',
  'white_vinegar','black_vinegar','doubanjiang','starch','cooking_wine','salt','white_pepper','black_pepper','five_spice',
  'chili_flakes','tomato_paste','bean_paste','sichuan_pepper','star_anise','cumin','bay_leaf','milk','cheese','butter',
  'cream','yogurt','chicken_stock','goji_berry','red_date','wood_ear','dried_shrimp'
]);

const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'review-homestyle.json'), 'utf8'));

// Recipe database: keyed by id -> { ingredients, steps }
const FIXES = {};

module.exports = { src, FIXES, VALID_INGREDIENTS };

// This file is a skeleton. The recipe data is loaded from fix-homestyle-data-*.js
const dataFiles = ['fix-homestyle-data-1.js','fix-homestyle-data-2.js','fix-homestyle-data-3.js','fix-homestyle-data-4.js'];
for (const f of dataFiles) {
  const fp = path.join(__dirname, f);
  if (fs.existsSync(fp)) {
    const mod = require('./' + f);
    Object.assign(FIXES, mod);
  }
}

if (require.main === module) {
  // Build output
  const out = src.map(r => {
    const fix = FIXES[r.id];
    if (!fix) {
      console.warn('MISSING fix for:', r.id, r.nameZh);
      return r;
    }
    // validate ingredient IDs
    for (const ing of fix.ingredients) {
      if (!VALID_INGREDIENTS.has(ing.ingredientId)) {
        throw new Error(`Invalid ingredientId "${ing.ingredientId}" in ${r.id} (${r.nameZh})`);
      }
    }
    if (fix.steps.length < 5) {
      throw new Error(`Steps <5 in ${r.id} (${r.nameZh}): ${fix.steps.length}`);
    }
    return { ...r, ingredients: fix.ingredients, steps: fix.steps };
  });

  // Check missing
  const missing = src.filter(r => !FIXES[r.id]).map(r => ({id:r.id, nameZh:r.nameZh}));
  if (missing.length) {
    console.log('MISSING', missing.length, 'recipes');
    fs.writeFileSync(path.join(__dirname, 'fix-homestyle-missing.json'), JSON.stringify(missing, null, 2));
  }

  fs.writeFileSync(
    path.join(__dirname, 'review-homestyle-fixed.json'),
    JSON.stringify(out, null, 2),
    'utf8'
  );
  console.log('Wrote', out.length, 'recipes. Missing:', missing.length);
}
