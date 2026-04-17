const fs = require('fs');
const path = require('path');

const ALLOWED = new Set([
  'chicken_breast','chicken_thigh','chicken_wing','chicken_whole','pork_belly','pork_mince','pork_loin','pork_ribs',
  'beef_sirloin','beef_mince','beef_shank','lamb_leg','salmon_fillet','shrimp','squid','fish_fillet','snapper','cod',
  'egg','salted_egg','tofu','dried_tofu','tofu_puff','dried_tofu_skin','edamame','sausage','duck_leg',
  'rice','glutinous_rice','noodles_dried','vermicelli','rice_noodles','rice_flour','wheat_starch','flour','oats','cornmeal','millet','wonton_wrapper',
  'potato','broccoli','bok_choy','chinese_cabbage','tomato','capsicum','carrot','onion','garlic','ginger','spring_onion',
  'mushroom','dried_mushroom','spinach','eggplant','cucumber','zucchini','sweet_potato','corn','green_bean','celery',
  'bean_sprouts','white_radish','lettuce','chili_pepper','pumpkin','cabbage','leek','snow_pea','asparagus','lotus_root','cauliflower','yam','taro',
  'soy_sauce','light_soy','dark_soy','cooking_oil','sesame_oil','oyster_sauce','sugar','rock_sugar','vinegar','white_vinegar','black_vinegar',
  'doubanjiang','starch','cooking_wine','salt','white_pepper','five_spice','chili_flakes','tomato_paste','bean_paste',
  'sichuan_pepper','star_anise','cumin','bay_leaf','milk','cheese','butter','goji_berry','red_date','wood_ear','dried_shrimp'
]);

// Map invalid ingredient ids to allowed ones
const INGREDIENT_MAP = {
  mung_bean: 'edamame',
  cilantro: 'spring_onion',
  fermented_tofu: 'doubanjiang',
  chili_oil: 'chili_flakes',
  dried_chili: 'chili_pepper',
  sesame_seed: 'sesame_oil',
  raisin: 'goji_berry',
  paprika: 'chili_flakes',
  rice_vinegar: 'vinegar',
  cinnamon: 'star_anise',
  garlic_chives: 'leek',
  pork_liver: 'pork_belly',
  sea_cucumber: 'mushroom',
  chicken_stock: 'cooking_wine',
  dried_noodles_rice: 'vermicelli',
  black_pepper: 'white_pepper',
  bread: 'flour',
  soy_sauce: 'light_soy'
};

function mapId(id) {
  if (ALLOWED.has(id)) return id;
  if (INGREDIENT_MAP[id]) return INGREDIENT_MAP[id];
  return null; // drop
}

function dedupeIngredients(arr) {
  const seen = new Map();
  for (const ing of arr) {
    const id = mapId(ing.ingredientId);
    if (!id) continue;
    const key = id;
    if (seen.has(key)) {
      // keep larger amount of same unit; otherwise just keep first
      const prev = seen.get(key);
      if (prev.unit === ing.unit && typeof prev.amount === 'number' && typeof ing.amount === 'number') {
        if (ing.amount > prev.amount) seen.set(key, { ingredientId: id, amount: ing.amount, unit: ing.unit });
      }
    } else {
      seen.set(key, { ingredientId: id, amount: ing.amount, unit: ing.unit });
    }
  }
  return [...seen.values()];
}

// Authentic recipe overrides keyed by id
const OVERRIDES = {};

function steps(...arr) { return arr; }
function ing(ingredientId, amount, unit) { return { ingredientId, amount, unit }; }

module.exports = { ALLOWED, INGREDIENT_MAP, mapId, dedupeIngredients, OVERRIDES, steps, ing };
