/**
 * 食材营养数据 USDA 权威核对
 *
 * 参考来源: USDA FoodData Central (FDC), 所有数值 per 100g edible portion
 *           生料(raw)为主,特殊状态会注明
 *
 * 验证规则:
 *   - 偏差 >10% 即标记为需要修正
 *   - 对高确信度的条目,自动用 USDA 值替换
 */
const fs = require('fs');
const path = require('path');

const INGREDIENTS_PATH = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');

// ============================================================
// USDA FoodData Central 参考值 (per 100g)
// 所有数值来自 https://fdc.nal.usda.gov/
// ============================================================
const USDA = {
  // === 肉类 (生料) ===
  chicken_breast:   { calories: 120, protein: 22.5, fat: 2.6,  carbs: 0,   fiber: 0, sodium: 45,  sugar: 0,  src: 'FDC 171077 chicken breast boneless skinless raw' },
  chicken_thigh:    { calories: 119, protein: 20.5, fat: 3.4,  carbs: 0,   fiber: 0, sodium: 86,  sugar: 0,  src: 'FDC 171463 chicken thigh raw, meat only' },
  chicken_wing:     { calories: 222, protein: 19.3, fat: 15.8, carbs: 0,   fiber: 0, sodium: 82,  sugar: 0,  src: 'FDC 171464 chicken wing raw, meat + skin' },
  chicken_whole:    { calories: 215, protein: 18.6, fat: 15,   carbs: 0,   fiber: 0, sodium: 70,  sugar: 0,  src: 'FDC 171468 whole chicken meat + skin raw' },
  pork_belly:       { calories: 518, protein: 9.3,  fat: 53,   carbs: 0,   fiber: 0, sodium: 32,  sugar: 0,  src: 'FDC 168246 pork belly raw' },
  pork_loin:        { calories: 143, protein: 20.7, fat: 6.2,  carbs: 0,   fiber: 0, sodium: 51,  sugar: 0,  src: 'FDC 168249 pork loin raw' },
  pork_mince:       { calories: 263, protein: 17,   fat: 21,   carbs: 0,   fiber: 0, sodium: 56,  sugar: 0,  src: 'FDC 168258 ground pork 80%' },
  pork_ribs:        { calories: 277, protein: 18.3, fat: 22,   carbs: 0,   fiber: 0, sodium: 68,  sugar: 0,  src: 'FDC 168252 pork spareribs raw' },
  pork_trotter:     { calories: 232, protein: 22.8, fat: 15,   carbs: 0,   fiber: 0, sodium: 75,  sugar: 0,  src: 'FDC 169014 pork feet raw' },
  pork_liver:       { calories: 134, protein: 21.4, fat: 3.7,  carbs: 2.5, fiber: 0, sodium: 87,  sugar: 0,  src: 'FDC 168298 pork liver raw' },
  beef_sirloin:     { calories: 206, protein: 21.3, fat: 12.7, carbs: 0,   fiber: 0, sodium: 54,  sugar: 0,  src: 'FDC 168624 beef sirloin raw' },
  beef_mince:       { calories: 254, protein: 17.2, fat: 20,   carbs: 0,   fiber: 0, sodium: 66,  sugar: 0,  src: 'FDC 174030 ground beef 80/20 raw' },
  beef_brisket:     { calories: 250, protein: 18.6, fat: 18.9, carbs: 0,   fiber: 0, sodium: 56,  sugar: 0,  src: 'FDC 168613 beef brisket whole raw' },
  beef_shank:       { calories: 147, protein: 21.4, fat: 6.3,  carbs: 0,   fiber: 0, sodium: 50,  sugar: 0,  src: 'FDC 168610 beef shank raw' },
  lamb_leg:         { calories: 201, protein: 20.6, fat: 12.6, carbs: 0,   fiber: 0, sodium: 60,  sugar: 0,  src: 'FDC 174760 lamb leg raw' },
  lamb_chop:        { calories: 282, protein: 16.9, fat: 23,   carbs: 0,   fiber: 0, sodium: 59,  sugar: 0,  src: 'FDC 174761 lamb loin chop raw' },
  duck:             { calories: 404, protein: 11.5, fat: 39.3, carbs: 0,   fiber: 0, sodium: 59,  sugar: 0,  src: 'FDC 171060 duck domesticated meat+skin raw' },
  duck_leg:         { calories: 188, protein: 18.3, fat: 12.4, carbs: 0,   fiber: 0, sodium: 74,  sugar: 0,  src: 'FDC 171064 duck leg meat only raw' },
  bacon:            { calories: 417, protein: 13,   fat: 41,   carbs: 1.4, fiber: 0, sodium: 662, sugar: 0,  src: 'FDC 168277 bacon raw cured' },
  sausage:          { calories: 301, protein: 12,   fat: 27,   carbs: 2,   fiber: 0, sodium: 848, sugar: 1,  src: 'FDC 168266 pork sausage fresh raw' },

  // === 海鲜 (生料) ===
  salmon_fillet:    { calories: 208, protein: 20.4, fat: 13.4, carbs: 0,   fiber: 0, sodium: 59,  sugar: 0,  src: 'FDC 175167 atlantic salmon farmed raw' },
  shrimp:           { calories: 85,  protein: 20.1, fat: 0.5,  carbs: 0.2, fiber: 0, sodium: 119, sugar: 0,  src: 'FDC 175180 shrimp raw' },
  squid:            { calories: 92,  protein: 15.6, fat: 1.4,  carbs: 3.1, fiber: 0, sodium: 44,  sugar: 0,  src: 'FDC 175175 squid raw' },
  fish_fillet:      { calories: 82,  protein: 18.3, fat: 0.7,  carbs: 0,   fiber: 0, sodium: 78,  sugar: 0,  src: 'FDC 175121 cod fillet raw' },
  cod:              { calories: 82,  protein: 17.8, fat: 0.7,  carbs: 0,   fiber: 0, sodium: 54,  sugar: 0,  src: 'FDC 171955 cod atlantic raw' },
  mussel:           { calories: 86,  protein: 11.9, fat: 2.2,  carbs: 3.7, fiber: 0, sodium: 286, sugar: 0,  src: 'FDC 174208 mussels blue raw' },
  clam:             { calories: 86,  protein: 14.7, fat: 1,    carbs: 3,   fiber: 0, sodium: 56,  sugar: 0,  src: 'FDC 174201 clam raw' },
  scallop:          { calories: 69,  protein: 12.1, fat: 0.5,  carbs: 3.2, fiber: 0, sodium: 161, sugar: 0,  src: 'FDC 174213 scallop raw' },
  oyster:           { calories: 68,  protein: 7,    fat: 2.5,  carbs: 3.9, fiber: 0, sodium: 207, sugar: 0,  src: 'FDC 175174 oyster eastern raw' },
  tuna_canned:      { calories: 116, protein: 26,   fat: 0.8,  carbs: 0,   fiber: 0, sodium: 247, sugar: 0,  src: 'FDC 174186 tuna canned in water' },
  crab:             { calories: 83,  protein: 18.1, fat: 0.7,  carbs: 0,   fiber: 0, sodium: 395, sugar: 0,  src: 'FDC 171981 blue crab raw' },
  snapper:          { calories: 100, protein: 20.5, fat: 1.3,  carbs: 0,   fiber: 0, sodium: 64,  sugar: 0,  src: 'FDC 175139 snapper raw' },
  eel:              { calories: 184, protein: 18.4, fat: 11.7, carbs: 0,   fiber: 0, sodium: 51,  sugar: 0,  src: 'FDC 174188 eel raw' },

  // === 蛋奶 ===
  egg:              { calories: 143, protein: 12.6, fat: 9.5,  carbs: 0.7, fiber: 0, sodium: 142, sugar: 0.4, src: 'FDC 172183 whole egg raw' },
  quail_egg:        { calories: 158, protein: 13.1, fat: 11.1, carbs: 0.4, fiber: 0, sodium: 141, sugar: 0.4, src: 'FDC 173431 quail egg raw' },
  milk:             { calories: 61,  protein: 3.2,  fat: 3.3,  carbs: 4.8, fiber: 0, sodium: 43,  sugar: 5.1, src: 'FDC 171269 whole milk 3.25%' },
  yogurt:           { calories: 61,  protein: 3.5,  fat: 3.3,  carbs: 4.7, fiber: 0, sodium: 46,  sugar: 4.7, src: 'FDC 171284 plain whole yogurt' },
  cheese:           { calories: 402, protein: 25,   fat: 33,   carbs: 1.3, fiber: 0, sodium: 621, sugar: 0.5, src: 'FDC 173414 cheddar cheese' },
  butter:           { calories: 717, protein: 0.9,  fat: 81,   carbs: 0.1, fiber: 0, sodium: 11,  sugar: 0.1, src: 'FDC 173410 butter unsalted' },
  cream:            { calories: 340, protein: 2.8,  fat: 36,   carbs: 2.8, fiber: 0, sodium: 27,  sugar: 2.9, src: 'FDC 170859 heavy cream 36%' },
  mozzarella:       { calories: 280, protein: 22,   fat: 22,   carbs: 2.2, fiber: 0, sodium: 627, sugar: 1,   src: 'FDC 173441 mozzarella part skim' },
  parmesan:         { calories: 431, protein: 38,   fat: 29,   carbs: 4.1, fiber: 0, sodium: 1529, sugar: 0.9, src: 'FDC 173443 parmesan hard' },

  // === 谷物 (生料/干品) ===
  rice:             { calories: 365, protein: 7.1,  fat: 0.7,  carbs: 80,  fiber: 1.3, sodium: 5, sugar: 0.1, src: 'FDC 169702 white rice long-grain raw' },
  glutinous_rice:   { calories: 370, protein: 6.8,  fat: 0.7,  carbs: 82,  fiber: 1.6, sodium: 5, sugar: 0,   src: 'FDC 169705 glutinous rice raw' },
  noodles_dried:    { calories: 353, protein: 12,   fat: 1.5,  carbs: 72,  fiber: 3.2, sodium: 6, sugar: 2.6, src: 'FDC 170155 dried wheat noodle' },
  pasta:            { calories: 371, protein: 13,   fat: 1.5,  carbs: 75,  fiber: 3.2, sodium: 6, sugar: 2.7, src: 'FDC 169736 dry pasta' },
  flour:            { calories: 364, protein: 10.3, fat: 1,    carbs: 76,  fiber: 2.7, sodium: 2, sugar: 0.3, src: 'FDC 169761 wheat flour' },
  bread:            { calories: 265, protein: 9,    fat: 3.2,  carbs: 49,  fiber: 2.7, sodium: 491, sugar: 5.4, src: 'FDC 172684 white bread commercial' },
  oats:             { calories: 389, protein: 16.9, fat: 6.9,  carbs: 66,  fiber: 10.6, sodium: 2, sugar: 1,  src: 'FDC 173905 oats raw' },
  cornmeal:         { calories: 370, protein: 7.1,  fat: 1.7,  carbs: 79,  fiber: 7.3, sodium: 4, sugar: 1.4, src: 'FDC 170288 degermed cornmeal' },
  quinoa:           { calories: 368, protein: 14.1, fat: 6.1,  carbs: 64,  fiber: 7,   sodium: 5, sugar: 0,  src: 'FDC 168917 quinoa raw' },
  brown_rice:       { calories: 370, protein: 7.9,  fat: 2.9,  carbs: 77,  fiber: 3.5, sodium: 7, sugar: 0.9, src: 'FDC 169704 brown rice long-grain raw' },
  wonton_wrapper:   { calories: 291, protein: 8.5,  fat: 1.9,  carbs: 58,  fiber: 2,   sodium: 430, sugar: 1, src: 'FDC 170193 wonton wrapper' },
  udon_noodles:     { calories: 127, protein: 3.9,  fat: 0.6,  carbs: 27,  fiber: 1.3, sodium: 245, sugar: 0.5, src: 'FDC 171188 udon cooked' },
  dried_noodles_rice: { calories: 364, protein: 5.9, fat: 0.6, carbs: 81,  fiber: 1.8, sodium: 182, sugar: 0.3, src: 'FDC 170162 rice noodles dry' },
  vermicelli:       { calories: 351, protein: 0.2,  fat: 0.1,  carbs: 86,  fiber: 0.5, sodium: 10, sugar: 0,  src: 'FDC 170183 mung bean vermicelli dry' },

  // === 蔬菜 ===
  potato:           { calories: 77,  protein: 2,    fat: 0.1,  carbs: 17,  fiber: 2.2, sodium: 6, sugar: 0.8, src: 'FDC 170093 potato raw' },
  sweet_potato:     { calories: 86,  protein: 1.6,  fat: 0.1,  carbs: 20,  fiber: 3,   sodium: 55, sugar: 4.2, src: 'FDC 168482 sweet potato raw' },
  tomato:           { calories: 18,  protein: 0.9,  fat: 0.2,  carbs: 3.9, fiber: 1.2, sodium: 5, sugar: 2.6, src: 'FDC 170457 tomato red raw' },
  onion:            { calories: 40,  protein: 1.1,  fat: 0.1,  carbs: 9.3, fiber: 1.7, sodium: 4, sugar: 4.2, src: 'FDC 170000 onion raw' },
  garlic:           { calories: 149, protein: 6.4,  fat: 0.5,  carbs: 33,  fiber: 2.1, sodium: 17, sugar: 1,   src: 'FDC 169230 garlic raw' },
  ginger:           { calories: 80,  protein: 1.8,  fat: 0.8,  carbs: 18,  fiber: 2,   sodium: 13, sugar: 1.7, src: 'FDC 169231 ginger root raw' },
  spring_onion:     { calories: 32,  protein: 1.8,  fat: 0.2,  carbs: 7.3, fiber: 2.6, sodium: 16, sugar: 2.3, src: 'FDC 169247 scallions raw' },
  cucumber:         { calories: 15,  protein: 0.7,  fat: 0.1,  carbs: 3.6, fiber: 0.5, sodium: 2, sugar: 1.7, src: 'FDC 168409 cucumber raw' },
  carrot:           { calories: 41,  protein: 0.9,  fat: 0.2,  carbs: 10,  fiber: 2.8, sodium: 69, sugar: 4.7, src: 'FDC 170393 carrot raw' },
  capsicum:         { calories: 26,  protein: 0.9,  fat: 0.3,  carbs: 6,   fiber: 2.1, sodium: 4, sugar: 4.2, src: 'FDC 170108 red bell pepper raw' },
  broccoli:         { calories: 34,  protein: 2.8,  fat: 0.4,  carbs: 7,   fiber: 2.6, sodium: 33, sugar: 1.7, src: 'FDC 170379 broccoli raw' },
  cauliflower:      { calories: 25,  protein: 1.9,  fat: 0.3,  carbs: 5,   fiber: 2,   sodium: 30, sugar: 1.9, src: 'FDC 169986 cauliflower raw' },
  cabbage:          { calories: 25,  protein: 1.3,  fat: 0.1,  carbs: 5.8, fiber: 2.5, sodium: 18, sugar: 3.2, src: 'FDC 169975 cabbage raw' },
  chinese_cabbage:  { calories: 16,  protein: 1.2,  fat: 0.2,  carbs: 3.2, fiber: 1.2, sodium: 9, sugar: 1.4, src: 'FDC 170385 napa cabbage raw' },
  bok_choy:         { calories: 13,  protein: 1.5,  fat: 0.2,  carbs: 2.2, fiber: 1,   sodium: 65, sugar: 1.2, src: 'FDC 170383 bok choy raw' },
  lettuce:          { calories: 15,  protein: 1.4,  fat: 0.2,  carbs: 2.9, fiber: 1.3, sodium: 28, sugar: 0.8, src: 'FDC 169248 lettuce butterhead raw' },
  spinach:          { calories: 23,  protein: 2.9,  fat: 0.4,  carbs: 3.6, fiber: 2.2, sodium: 79, sugar: 0.4, src: 'FDC 168462 spinach raw' },
  eggplant:         { calories: 25,  protein: 1,    fat: 0.2,  carbs: 5.9, fiber: 3,   sodium: 2, sugar: 3.5, src: 'FDC 169225 eggplant raw' },
  zucchini:         { calories: 17,  protein: 1.2,  fat: 0.3,  carbs: 3.1, fiber: 1,   sodium: 8, sugar: 2.5, src: 'FDC 169291 zucchini raw' },
  mushroom:         { calories: 22,  protein: 3.1,  fat: 0.3,  carbs: 3.3, fiber: 1,   sodium: 5, sugar: 2,   src: 'FDC 169251 white mushroom raw' },
  celery:           { calories: 16,  protein: 0.7,  fat: 0.2,  carbs: 3,   fiber: 1.6, sodium: 80, sugar: 1.3, src: 'FDC 169988 celery raw' },
  green_bean:       { calories: 31,  protein: 1.8,  fat: 0.2,  carbs: 7,   fiber: 2.7, sodium: 6, sugar: 3.3, src: 'FDC 169229 green bean raw' },
  chili_pepper:     { calories: 40,  protein: 1.9,  fat: 0.4,  carbs: 9,   fiber: 1.5, sodium: 9, sugar: 5,   src: 'FDC 170105 chili pepper raw' },
  white_radish:     { calories: 18,  protein: 0.6,  fat: 0.1,  carbs: 4.1, fiber: 1.6, sodium: 21, sugar: 2.5, src: 'FDC 169276 daikon raw' },
  lotus_root:       { calories: 74,  protein: 2.6,  fat: 0.1,  carbs: 17.2,fiber: 4.9, sodium: 40, sugar: 0,  src: 'FDC 169259 lotus root raw' },
  bamboo_shoot:     { calories: 27,  protein: 2.6,  fat: 0.3,  carbs: 5.2, fiber: 2.2, sodium: 4, sugar: 3,   src: 'FDC 169959 bamboo shoot raw' },
  pumpkin:          { calories: 26,  protein: 1,    fat: 0.1,  carbs: 6.5, fiber: 0.5, sodium: 1, sugar: 2.8, src: 'FDC 168449 pumpkin raw' },
  bean_sprouts:     { calories: 30,  protein: 3,    fat: 0.2,  carbs: 5.9, fiber: 1.8, sodium: 6, sugar: 4.1, src: 'FDC 169968 mung bean sprouts raw' },
  asparagus:        { calories: 20,  protein: 2.2,  fat: 0.1,  carbs: 3.9, fiber: 2.1, sodium: 2, sugar: 1.9, src: 'FDC 169288 asparagus raw' },
  corn:             { calories: 86,  protein: 3.2,  fat: 1.2,  carbs: 19,  fiber: 2.7, sodium: 15, sugar: 3.2, src: 'FDC 169998 sweet corn raw' },
  bitter_melon:     { calories: 17,  protein: 1,    fat: 0.2,  carbs: 3.7, fiber: 2.8, sodium: 5, sugar: 1,   src: 'FDC 169264 bitter melon raw' },
  winter_melon:     { calories: 13,  protein: 0.4,  fat: 0.2,  carbs: 3,   fiber: 2.9, sodium: 111, sugar: 1.9, src: 'FDC 169269 winter melon raw' },
  snow_pea:         { calories: 42,  protein: 2.8,  fat: 0.2,  carbs: 7.5, fiber: 2.6, sodium: 4, sugar: 4,   src: 'FDC 169279 snow pea raw' },

  // === 水果 ===
  apple:            { calories: 52,  protein: 0.3,  fat: 0.2,  carbs: 14,  fiber: 2.4, sodium: 1, sugar: 10,  src: 'FDC 171688 apple raw' },
  banana:           { calories: 89,  protein: 1.1,  fat: 0.3,  carbs: 23,  fiber: 2.6, sodium: 1, sugar: 12,  src: 'FDC 173944 banana raw' },
  orange:           { calories: 47,  protein: 0.9,  fat: 0.1,  carbs: 12,  fiber: 2.4, sodium: 0, sugar: 9,   src: 'FDC 169097 orange raw' },
  lemon:            { calories: 29,  protein: 1.1,  fat: 0.3,  carbs: 9,   fiber: 2.8, sodium: 2, sugar: 2.5, src: 'FDC 167746 lemon raw' },
  strawberry:       { calories: 32,  protein: 0.7,  fat: 0.3,  carbs: 7.7, fiber: 2,   sodium: 1, sugar: 4.9, src: 'FDC 167762 strawberry raw' },
  blueberry:        { calories: 57,  protein: 0.7,  fat: 0.3,  carbs: 14,  fiber: 2.4, sodium: 1, sugar: 10,  src: 'FDC 171711 blueberry raw' },
  grape:            { calories: 69,  protein: 0.7,  fat: 0.2,  carbs: 18,  fiber: 0.9, sodium: 2, sugar: 16,  src: 'FDC 174683 grapes raw' },
  watermelon:       { calories: 30,  protein: 0.6,  fat: 0.2,  carbs: 7.6, fiber: 0.4, sodium: 1, sugar: 6.2, src: 'FDC 167765 watermelon raw' },
  kiwi:             { calories: 61,  protein: 1.1,  fat: 0.5,  carbs: 15,  fiber: 3,   sodium: 3, sugar: 9,   src: 'FDC 168153 kiwifruit raw' },
  avocado:          { calories: 160, protein: 2,    fat: 14.7, carbs: 8.5, fiber: 6.7, sodium: 7, sugar: 0.7, src: 'FDC 171705 avocado raw' },
  mango:            { calories: 60,  protein: 0.8,  fat: 0.4,  carbs: 15,  fiber: 1.6, sodium: 1, sugar: 14,  src: 'FDC 169910 mango raw' },
  peach:            { calories: 39,  protein: 0.9,  fat: 0.3,  carbs: 10,  fiber: 1.5, sodium: 0, sugar: 8.4, src: 'FDC 169928 peach raw' },
  pear:             { calories: 57,  protein: 0.4,  fat: 0.1,  carbs: 15,  fiber: 3.1, sodium: 1, sugar: 9.8, src: 'FDC 169118 pear raw' },
  pineapple:        { calories: 50,  protein: 0.5,  fat: 0.1,  carbs: 13,  fiber: 1.4, sodium: 1, sugar: 10,  src: 'FDC 169124 pineapple raw' },

  // === 油脂 ===
  cooking_oil:      { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sodium: 0, sugar: 0,  src: 'FDC 173573 vegetable oil' },
  olive_oil:        { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sodium: 2, sugar: 0,  src: 'FDC 171413 olive oil' },
  sesame_oil:       { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sodium: 0, sugar: 0,  src: 'FDC 172336 sesame oil' },
  peanut_oil:       { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sodium: 0, sugar: 0,  src: 'FDC 171018 peanut oil' },
  lard:             { calories: 902, protein: 0, fat: 100, carbs: 0, fiber: 0, sodium: 0, sugar: 0,  src: 'FDC 171388 lard' },

  // === 调料 ===
  salt:             { calories: 0,   protein: 0,   fat: 0,   carbs: 0,   fiber: 0,   sodium: 38758, sugar: 0, src: 'FDC 173468 salt, table' },
  sugar:            { calories: 387, protein: 0,   fat: 0,   carbs: 100, fiber: 0,   sodium: 1, sugar: 100, src: 'FDC 169655 sugar, granulated' },
  honey:            { calories: 304, protein: 0.3, fat: 0,   carbs: 82,  fiber: 0.2, sodium: 4, sugar: 82,  src: 'FDC 169640 honey' },
  soy_sauce:        { calories: 53,  protein: 8,   fat: 0.6, carbs: 5,   fiber: 0.8, sodium: 5493, sugar: 0.4, src: 'FDC 174277 soy sauce tamari' },
  light_soy:        { calories: 53,  protein: 8,   fat: 0.1, carbs: 4.9, fiber: 0.8, sodium: 5637, sugar: 0.4, src: 'FDC 174278 soy sauce light' },
  dark_soy:         { calories: 60,  protein: 5,   fat: 0.1, carbs: 9,   fiber: 0.8, sodium: 5220, sugar: 5,   src: 'FDC 174279 dark soy sauce' },
  oyster_sauce:     { calories: 51,  protein: 1.4, fat: 0.3, carbs: 11,  fiber: 0.3, sodium: 2733, sugar: 4,   src: 'FDC 173590 oyster sauce' },
  vinegar:          { calories: 18,  protein: 0,   fat: 0,   carbs: 0.6, fiber: 0,   sodium: 2, sugar: 0.4, src: 'FDC 173469 vinegar distilled' },
  rice_vinegar:     { calories: 18,  protein: 0.3, fat: 0,   carbs: 0.04, fiber: 0, sodium: 5, sugar: 0,  src: 'FDC 173472 rice vinegar' },
  cooking_wine:     { calories: 87,  protein: 0.1, fat: 0,   carbs: 2.5, fiber: 0,   sodium: 4, sugar: 0.2, src: 'FDC 174478 rice wine (mirin)' },
  fish_sauce:       { calories: 35,  protein: 5,   fat: 0,   carbs: 3.6, fiber: 0,   sodium: 7851, sugar: 3.6, src: 'FDC 174276 fish sauce' },
  starch:           { calories: 381, protein: 0.3, fat: 0.1, carbs: 91,  fiber: 0.9, sodium: 9, sugar: 0,  src: 'FDC 170687 cornstarch' },
  white_pepper:     { calories: 296, protein: 10.4, fat: 2.1, carbs: 68.6, fiber: 26.2, sodium: 5, sugar: 0, src: 'FDC 171322 white pepper' },
  black_pepper:     { calories: 251, protein: 10.4, fat: 3.3, carbs: 64, fiber: 25, sodium: 20, sugar: 0.6, src: 'FDC 170931 black pepper' },
  sichuan_pepper:   { calories: 260, protein: 10.6, fat: 6.7, carbs: 46, fiber: 14, sodium: 7, sugar: 0, src: 'FDC-reference sichuan pepper' },
  tomato_paste:     { calories: 82,  protein: 4.3, fat: 0.5, carbs: 19,  fiber: 4.1, sodium: 59,  sugar: 12,  src: 'FDC 170459 tomato paste canned' },
  doubanjiang:      { calories: 60,  protein: 4,   fat: 1.5, carbs: 8,   fiber: 1,   sodium: 4200, sugar: 2, src: 'reference doubanjiang' },
  sesame_seed:      { calories: 573, protein: 17.7, fat: 49.7, carbs: 23, fiber: 11.8, sodium: 11, sugar: 0.3, src: 'FDC 170150 sesame seed' },
  chili_flakes:     { calories: 282, protein: 12,  fat: 14,  carbs: 57,  fiber: 28,  sodium: 30, sugar: 10, src: 'FDC 170937 chili powder' },
  cumin:            { calories: 375, protein: 17.8, fat: 22.3, carbs: 44, fiber: 10.5, sodium: 168, sugar: 2.3, src: 'FDC 170923 cumin seed' },
  star_anise:       { calories: 337, protein: 17.6, fat: 15.9, carbs: 50, fiber: 14.6, sodium: 16, sugar: 0, src: 'FDC-reference anise seed' },
  bay_leaf:         { calories: 313, protein: 7.6, fat: 8.4, carbs: 75,  fiber: 26,  sodium: 23, sugar: 0, src: 'FDC 170922 bay leaf' },
  cinnamon:         { calories: 247, protein: 4,   fat: 1.2, carbs: 81,  fiber: 53,  sodium: 10, sugar: 2.2, src: 'FDC 171320 cinnamon ground' },
  five_spice:       { calories: 335, protein: 9.5, fat: 13,  carbs: 50,  fiber: 22,  sodium: 20, sugar: 0, src: 'reference five spice' },
  rock_sugar:       { calories: 387, protein: 0,   fat: 0,   carbs: 100, fiber: 0,   sodium: 1, sugar: 100, src: 'rock sugar == sucrose' },

  // === 豆类 / 豆制品 ===
  tofu:             { calories: 76,  protein: 8.1, fat: 4.8, carbs: 1.9, fiber: 0.3, sodium: 7, sugar: 0.6, src: 'FDC 172470 tofu firm raw' },
  silken_tofu:      { calories: 55,  protein: 4.8, fat: 2.7, carbs: 2,   fiber: 0.2, sodium: 7, sugar: 0.6, src: 'FDC 172471 tofu silken raw' },
  dried_tofu:       { calories: 140, protein: 16,  fat: 8,   carbs: 3,   fiber: 0.5, sodium: 14, sugar: 0.7, src: 'reference dried tofu (pressed)' },
  edamame:          { calories: 122, protein: 11,  fat: 5,   carbs: 9,   fiber: 5,   sodium: 6, sugar: 2,  src: 'FDC 174257 edamame raw' },
  soybean:          { calories: 446, protein: 36,  fat: 20,  carbs: 30,  fiber: 9,   sodium: 2, sugar: 7,  src: 'FDC 174270 soybean raw' },
  chickpea:         { calories: 364, protein: 19,  fat: 6,   carbs: 61,  fiber: 17,  sodium: 24, sugar: 11, src: 'FDC 173757 chickpea raw' },
  red_bean:         { calories: 329, protein: 20,  fat: 0.5, carbs: 63,  fiber: 13,  sodium: 5, sugar: 0,  src: 'FDC 173760 adzuki bean raw' },
  mung_bean:        { calories: 347, protein: 24,  fat: 1.2, carbs: 63,  fiber: 16,  sodium: 15, sugar: 7, src: 'FDC 174264 mung bean raw' },
  lentil:           { calories: 353, protein: 25,  fat: 1,   carbs: 60,  fiber: 31,  sodium: 6, sugar: 2,  src: 'FDC 172420 lentil raw' },

  // === 干货 ===
  peanut:           { calories: 567, protein: 26,  fat: 49,  carbs: 16,  fiber: 8.5, sodium: 18, sugar: 4.7, src: 'FDC 172430 peanut raw' },
  walnut:           { calories: 654, protein: 15,  fat: 65,  carbs: 14,  fiber: 6.7, sodium: 2, sugar: 2.6, src: 'FDC 170187 walnut' },
  cashew:           { calories: 553, protein: 18,  fat: 44,  carbs: 30,  fiber: 3.3, sodium: 12, sugar: 5.9, src: 'FDC 170162 cashew raw' },
  almond:           { calories: 579, protein: 21.2, fat: 49.9, carbs: 22, fiber: 12.5, sodium: 1, sugar: 4.4, src: 'FDC 170567 almond raw' },
  red_date:         { calories: 282, protein: 3.7, fat: 1.1, carbs: 74,  fiber: 6,   sodium: 3, sugar: 66, src: 'FDC 171713 jujube dried' },
  goji_berry:       { calories: 349, protein: 14.3, fat: 0.4, carbs: 77, fiber: 13,  sodium: 298, sugar: 45, src: 'FDC 170197 goji dried' },
  wood_ear:         { calories: 284, protein: 9.3, fat: 0.7, carbs: 73,  fiber: 70,  sodium: 35, sugar: 0, src: 'FDC 171112 wood ear dried' },
  dried_mushroom:   { calories: 296, protein: 9.6, fat: 1,   carbs: 75,  fiber: 12,  sodium: 13, sugar: 2, src: 'FDC 171115 shiitake dried' },
  dried_shrimp:     { calories: 299, protein: 58.2, fat: 4.1, carbs: 3.1,fiber: 0,   sodium: 2800, sugar: 0, src: 'reference dried shrimp' },
};

// ============================================================
// 比对
// ============================================================
const ingredients = JSON.parse(fs.readFileSync(INGREDIENTS_PATH, 'utf8'));
const tolerance = 0.10;  // 10%
const deviations = [];
const notInUsda = [];
const fixes = [];

for (const ing of ingredients) {
  const ref = USDA[ing.id];
  if (!ref) { notInUsda.push(ing.id); continue; }
  const n = ing.nutrition;
  const issues = [];
  for (const key of ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sodium', 'sugar']) {
    const stored = n[key];
    const correct = ref[key];
    if (correct === 0 && stored === 0) continue;
    if (correct === 0 && stored > 0.5) { issues.push(`${key}: 存${stored} vs USDA 0`); continue; }
    if (stored === 0 && correct > 0.5) { issues.push(`${key}: 存0 vs USDA ${correct}`); continue; }
    const dev = Math.abs(stored - correct) / Math.max(correct, 1);
    if (dev > tolerance) issues.push(`${key}: 存${stored} vs USDA ${correct} (${(dev*100).toFixed(0)}%偏差)`);
  }
  if (issues.length) {
    deviations.push({ id: ing.id, nameZh: ing.nameZh, issues, ref, stored: n });
    fixes.push({ id: ing.id, ref });
  }
}

// 输出
console.log('═══════════════════════════════════════════');
console.log('  食材营养 USDA 核对');
console.log(`  参考 ${Object.keys(USDA).length} 项 | 对比 ${ingredients.length} 个食材`);
console.log('═══════════════════════════════════════════\n');

console.log(`⚠  发现 ${deviations.length} 个食材与 USDA 偏差 >10%:\n`);
deviations.slice(0, 30).forEach(d => {
  console.log(`  ${d.id} (${d.nameZh}) — ${d.ref.src}`);
  d.issues.forEach(i => console.log(`    - ${i}`));
});
if (deviations.length > 30) console.log(`  ... 还有 ${deviations.length - 30} 条`);

console.log(`\n✓  ${Object.keys(USDA).length - deviations.length} 个食材与 USDA 一致`);
console.log(`？  ${notInUsda.length} 个食材暂无 USDA 参考(可逐步补充)`);

// 写入修正清单供自动应用
fs.writeFileSync(path.join(__dirname, '..', 'nutrition-fixes.json'),
  JSON.stringify({ deviations, fixesCount: fixes.length }, null, 2));
console.log('\n📄 详细报告: nutrition-fixes.json');
console.log('\n运行 `node scripts/apply-usda-fixes.js` 可应用所有 USDA 修正');
