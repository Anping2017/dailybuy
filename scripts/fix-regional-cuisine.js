/**
 * 修复 regionalCuisine 字段中不在类型定义里的错值
 * 类型定义: sichuan, cantonese, shandong, jiangsu, hunan, fujian, dongbei,
 *           zhejiang, anhui, yunnan, xinjiang, taiwanese, homestyle,
 *           italian, american, french, japanese, korean, southeast_asian
 */
const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '..', 'src', 'data', 'recipes-all.json');
const recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));

const MAPPING = {
  shanghai: 'jiangsu',          // 上海菜归江浙
  jiangzhe: 'jiangsu',          // 江浙
  northern: 'homestyle',        // 北方笼统 → 家常
  hubei: 'homestyle',           // 湖北菜
  southern: 'cantonese',        // 南方笼统 → 粤菜
  lanzhou: 'xinjiang',          // 兰州 → 西北
  mediterranean: 'italian',     // 地中海 → 意式
  vietnamese: 'southeast_asian', // 越南菜 → 东南亚
};

let fixed = 0;
const sample = [];
for (const r of recipes) {
  if (MAPPING[r.regionalCuisine]) {
    if (sample.length < 8) sample.push(`${r.nameZh}: ${r.regionalCuisine} → ${MAPPING[r.regionalCuisine]}`);
    r.regionalCuisine = MAPPING[r.regionalCuisine];
    fixed++;
  }
}

console.log(`修复 ${fixed} 道菜的 regionalCuisine`);
sample.forEach(s => console.log('  ' + s));

if (process.argv.includes('--write')) {
  fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2));
  console.log(`✓ 写入 ${RECIPES_PATH}`);
} else {
  console.log('(dry-run, 加 --write 才会保存)');
}
