// Main runner: merges all parts and generates review-international-fixed.json
const fs = require('fs');
const path = require('path');

const part1 = require('./fix-international-part1.js');
const part2 = require('./fix-international-part2.js');
const part3 = require('./fix-international-part3.js');
const part4 = require('./fix-international-part4.js');

const RECIPE_DATA = { ...part1, ...part2, ...part3, ...part4 };

// Allowed ingredient IDs
const ALLOWED = new Set([
  'chicken_breast', 'chicken_thigh', 'chicken_wing', 'chicken_whole',
  'pork_belly', 'pork_mince', 'pork_loin', 'pork_ribs',
  'beef_sirloin', 'beef_mince', 'lamb_leg',
  'salmon_fillet', 'shrimp', 'squid', 'fish_fillet', 'snapper', 'cod', 'tuna_canned',
  'mussel', 'scallop',
  'egg', 'tofu', 'bacon', 'sausage',
  'rice', 'noodles_dried', 'pasta', 'vermicelli', 'rice_noodles',
  'flour', 'oats', 'bread', 'wonton_wrapper',
  'potato', 'broccoli', 'bok_choy', 'chinese_cabbage', 'tomato', 'capsicum', 'carrot',
  'onion', 'garlic', 'ginger', 'spring_onion', 'mushroom', 'dried_mushroom', 'portobello',
  'shiitake_fresh', 'spinach', 'eggplant', 'cucumber', 'zucchini', 'sweet_potato',
  'corn', 'green_bean', 'celery', 'bean_sprouts', 'lettuce', 'chili_pepper',
  'pumpkin', 'cabbage', 'leek', 'snow_pea', 'asparagus',
  'kiwi', 'mango', 'lemon', 'orange', 'banana',
  'soy_sauce', 'light_soy', 'dark_soy', 'fish_sauce', 'cooking_oil', 'sesame_oil', 'olive_oil',
  'oyster_sauce', 'sugar', 'vinegar', 'white_vinegar', 'black_vinegar', 'mirin', 'sake',
  'cooking_wine', 'salt', 'white_pepper', 'black_pepper', 'tomato_paste',
  'cilantro', 'mint', 'basil', 'thyme', 'rosemary', 'oregano', 'lemongrass',
  'mayonnaise', 'milk', 'cheese', 'parmesan', 'mozzarella', 'butter', 'cream', 'yogurt',
  'chicken_stock', 'beef_stock', 'miso', 'kimchi', 'gochujang', 'curry_paste', 'coconut_milk',
  // white_radish isn't in allowed list per spec - remove
]);

// Adjust: white_radish was used in some recipes - actually NOT in allowed list
// Let's check what IS valid and what needs replacement
const INPUT_PATH = path.join(__dirname, 'review-international.json');
const OUTPUT_PATH = path.join(__dirname, 'review-international-fixed.json');

const input = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));

const output = input.map(recipe => {
  const override = RECIPE_DATA[recipe.id];
  if (override) {
    // Filter out any not-allowed ingredients and replace
    const filteredIngredients = override.ingredients.map(ing => {
      if (!ALLOWED.has(ing.ingredientId)) {
        // map white_radish -> carrot as fallback
        if (ing.ingredientId === 'white_radish') {
          return { ...ing, ingredientId: 'carrot' };
        }
        console.warn(`[${recipe.id}] Unknown ingredient: ${ing.ingredientId}`);
        return null;
      }
      return ing;
    }).filter(Boolean);
    return {
      ...recipe,
      ingredients: filteredIngredients,
      steps: override.steps,
    };
  }
  console.warn(`[MISSING] Recipe not in database: ${recipe.id} (${recipe.nameZh})`);
  return recipe;
});

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
console.log(`\nWrote ${output.length} recipes to ${OUTPUT_PATH}`);

// Stats
const total = input.length;
const covered = input.filter(r => RECIPE_DATA[r.id]).length;
const missing = input.filter(r => !RECIPE_DATA[r.id]);
console.log(`Coverage: ${covered}/${total} (${((covered / total) * 100).toFixed(1)}%)`);
if (missing.length > 0) {
  console.log('\nMissing recipes:');
  missing.forEach(r => console.log(`  ${r.id} | ${r.nameZh} | ${r.regionalCuisine}`));
}
