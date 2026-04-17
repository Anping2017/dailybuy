const fs = require('fs');
const path = require('path');
const { OVERRIDES } = require('./northern-overrides');
const { mapId, ALLOWED, dedupeIngredients } = require('./fix-northern');

// Additional allowed ingredients that show up in overrides
const EXTRA_ALLOWED = new Set(['honey']); // treat honey as an allowed optional

function sanitize(ingredients) {
  const out = [];
  const seen = new Set();
  for (const ing of ingredients) {
    let id = ing.ingredientId;
    // Drop unknown/unapproved ingredients silently or map them
    if (!ALLOWED.has(id) && !EXTRA_ALLOWED.has(id)) {
      const m = mapId(id);
      if (!m) continue;
      id = m;
    }
    // skip if not allowed even after mapping
    if (!ALLOWED.has(id) && !EXTRA_ALLOWED.has(id)) continue;
    // dedupe by id - keep first, add amounts if same unit
    if (seen.has(id)) {
      const existing = out.find(e => e.ingredientId === id);
      if (existing && existing.unit === ing.unit && typeof existing.amount === 'number' && typeof ing.amount === 'number') {
        // Keep the smaller realistic dup - actually just take the first
        continue;
      }
      continue;
    }
    seen.add(id);
    out.push({ ingredientId: id, amount: ing.amount, unit: ing.unit });
  }
  // Remove any honey references (not in canonical list)
  return out.filter(i => ALLOWED.has(i.ingredientId));
}

function main() {
  const inPath = path.join(__dirname, 'review-northern.json');
  const outPath = path.join(__dirname, 'review-northern-fixed.json');
  const data = JSON.parse(fs.readFileSync(inPath, 'utf8'));

  const fixed = data.map(recipe => {
    const override = OVERRIDES[recipe.id];
    if (override) {
      return {
        ...recipe,
        ingredients: sanitize(override.ingredients),
        steps: override.steps
      };
    }
    // fallback: just sanitize existing ingredients
    return {
      ...recipe,
      ingredients: sanitize(recipe.ingredients),
      steps: recipe.steps
    };
  });

  // Validate: every ingredient is in ALLOWED
  const problems = [];
  fixed.forEach(r => {
    r.ingredients.forEach(ing => {
      if (!ALLOWED.has(ing.ingredientId)) {
        problems.push(`${r.id}: bad ingredient ${ing.ingredientId}`);
      }
    });
    if (!Array.isArray(r.steps) || r.steps.length < 5) {
      problems.push(`${r.id}: steps too few (${r.steps && r.steps.length})`);
    }
  });

  if (problems.length) {
    console.error('Problems:');
    problems.forEach(p => console.error('  ' + p));
  } else {
    console.log('All', fixed.length, 'recipes valid.');
  }

  fs.writeFileSync(outPath, JSON.stringify(fixed, null, 2), 'utf8');
  console.log('Wrote', outPath);
  console.log('Total recipes:', fixed.length);
  console.log('Recipes with overrides applied:', fixed.filter(r => OVERRIDES[r.id]).length);
}

main();
