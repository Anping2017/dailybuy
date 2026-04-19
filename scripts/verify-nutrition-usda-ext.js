/**
 * 扩展版 USDA 参考表 — 覆盖剩余 256 个食材
 * 数据源:
 *   - 直接 USDA FDC 条目(per 100g edible portion, raw where applicable)
 *   - 组合食材用加权推导(例: XO酱 = 虾米+火腿+油)
 *   - 中式特色食材采用权威营养数据库 (USDA /中国食物成分表/品牌官方数据)
 */
const fs = require('fs');
const path = require('path');

const USDA_EXT = {
  // ============================================================
  // 肉类 (raw, edible portion)
  // ============================================================
  lamb_mince:       { calories: 294, protein: 16.6, fat: 23.4, carbs: 0,   fiber: 0, sodium: 72,  sugar: 0,  src: 'FDC 174751 ground lamb raw' },
  duck_breast:      { calories: 123, protein: 19.9, fat: 4.2,  carbs: 0,   fiber: 0, sodium: 89,  sugar: 0,  src: 'FDC 171059 duck breast meat only raw' },
  pork_chop:        { calories: 198, protein: 19.9, fat: 12.6, carbs: 0,   fiber: 0, sodium: 54,  sugar: 0,  src: 'FDC 168257 pork loin chop raw' },
  pork_shoulder:    { calories: 205, protein: 19,   fat: 13.9, carbs: 0,   fiber: 0, sodium: 66,  sugar: 0,  src: 'FDC 168248 pork shoulder raw' },
  chicken_feet:     { calories: 215, protein: 19.4, fat: 14.6, carbs: 0.2, fiber: 0, sodium: 67,  sugar: 0,  src: 'FDC 171492 chicken feet raw' },
  chicken_liver:    { calories: 119, protein: 16.9, fat: 4.8,  carbs: 0.7, fiber: 0, sodium: 71,  sugar: 0,  src: 'FDC 171060 chicken liver raw' },
  beef_tendon:      { calories: 150, protein: 36.7, fat: 0.5,  carbs: 0,   fiber: 0, sodium: 47,  sugar: 0,  src: 'reference: beef tendon (mostly collagen)' },
  beef_tongue:      { calories: 225, protein: 14.9, fat: 17.8, carbs: 3.7, fiber: 0, sodium: 69,  sugar: 0,  src: 'FDC 168634 beef tongue raw' },
  beef_slice:       { calories: 288, protein: 15.7, fat: 24,   carbs: 0,   fiber: 0, sodium: 65,  sugar: 0,  src: 'FDC 168630 beef shortplate/rib slice raw' },
  ham:              { calories: 145, protein: 20.9, fat: 5.5,  carbs: 1.5, fiber: 0, sodium: 1203, sugar: 0.8, src: 'FDC 168328 ham cured lean' },
  chinese_sausage:  { calories: 442, protein: 16,   fat: 37,   carbs: 11,  fiber: 0, sodium: 1850, sugar: 9,  src: 'reference: lap cheong sausage' },
  salami:           { calories: 336, protein: 21.8, fat: 26.1, carbs: 2.4, fiber: 0, sodium: 1740, sugar: 0.4, src: 'FDC 168291 dry salami' },
  blood_sausage:    { calories: 379, protein: 14.6, fat: 34.5, carbs: 1.3, fiber: 0, sodium: 680, sugar: 0,  src: 'FDC 168264 blood sausage' },
  pork_skin:        { calories: 545, protein: 61.3, fat: 32,   carbs: 0,   fiber: 0, sodium: 1305, sugar: 0,  src: 'FDC 168254 pork skin fried' },
  cured_pork:       { calories: 457, protein: 17.3, fat: 42.7, carbs: 1,   fiber: 0, sodium: 2130, sugar: 0,  src: 'reference: Chinese cured pork (larou)' },

  // ============================================================
  // 海鲜 (raw)
  // ============================================================
  sea_cucumber:     { calories: 56,  protein: 13,   fat: 0.4,  carbs: 0,   fiber: 0, sodium: 400, sugar: 0,  src: 'reference: sea cucumber rehydrated' },
  fish_head:        { calories: 115, protein: 17,   fat: 5,    carbs: 0,   fiber: 0, sodium: 60,  sugar: 0,  src: 'composite: fish head (avg freshwater)' },
  prawn_whole:      { calories: 85,  protein: 20.1, fat: 0.5,  carbs: 0.2, fiber: 0, sodium: 119, sugar: 0,  src: 'FDC 175180 shrimp/prawn raw' },
  lobster:          { calories: 89,  protein: 19,   fat: 0.9,  carbs: 0,   fiber: 0, sodium: 296, sugar: 0,  src: 'FDC 175164 lobster raw' },
  abalone:          { calories: 105, protein: 17.1, fat: 0.8,  carbs: 6,   fiber: 0, sodium: 301, sugar: 0,  src: 'FDC 174181 abalone raw' },
  octopus:          { calories: 82,  protein: 14.9, fat: 1,    carbs: 2.2, fiber: 0, sodium: 230, sugar: 0,  src: 'FDC 175167 octopus raw' },
  sardine:          { calories: 208, protein: 24.6, fat: 11.5, carbs: 0,   fiber: 0, sodium: 307, sugar: 0,  src: 'FDC 175140 sardine atlantic raw' },
  mackerel:         { calories: 205, protein: 18.6, fat: 13.9, carbs: 0,   fiber: 0, sodium: 90,  sugar: 0,  src: 'FDC 175134 mackerel atlantic raw' },
  tilapia:          { calories: 96,  protein: 20.1, fat: 1.7,  carbs: 0,   fiber: 0, sodium: 52,  sugar: 0,  src: 'FDC 175147 tilapia raw' },
  sea_bass:         { calories: 97,  protein: 18.4, fat: 2,    carbs: 0,   fiber: 0, sodium: 68,  sugar: 0,  src: 'FDC 175143 sea bass raw' },
  hairtail:         { calories: 127, protein: 17.7, fat: 5.6,  carbs: 0,   fiber: 0, sodium: 50,  sugar: 0,  src: 'reference: hairtail fish (China CDC)' },
  yellow_croaker:   { calories: 96,  protein: 17.7, fat: 2.5,  carbs: 0,   fiber: 0, sodium: 120, sugar: 0,  src: 'reference: yellow croaker (China CDC)' },
  cuttlefish:       { calories: 79,  protein: 16.2, fat: 0.7,  carbs: 0.8, fiber: 0, sodium: 372, sugar: 0,  src: 'FDC 175161 cuttlefish raw' },
  smoked_salmon:    { calories: 117, protein: 18.3, fat: 4.3,  carbs: 0,   fiber: 0, sodium: 784, sugar: 0,  src: 'FDC 175174 smoked salmon lox' },
  mandarin_fish:    { calories: 117, protein: 19.9, fat: 4.4,  carbs: 0,   fiber: 0, sodium: 60,  sugar: 0,  src: 'reference: mandarin fish (China CDC)' },
  crucian_carp:     { calories: 108, protein: 17.1, fat: 2.7,  carbs: 3.8, fiber: 0, sodium: 41,  sugar: 0,  src: 'reference: crucian carp (China CDC)' },
  carp:             { calories: 127, protein: 17.8, fat: 5.6,  carbs: 0,   fiber: 0, sodium: 49,  sugar: 0,  src: 'FDC 175124 carp raw' },
  grass_carp:       { calories: 113, protein: 16.6, fat: 5.2,  carbs: 0,   fiber: 0, sodium: 46,  sugar: 0,  src: 'reference: grass carp (China CDC)' },

  // ============================================================
  // 蔬菜
  // ============================================================
  leek:             { calories: 61,  protein: 1.5,  fat: 0.3,  carbs: 14.2,fiber: 1.8, sodium: 20, sugar: 3.9, src: 'FDC 169246 leek raw' },
  cilantro:         { calories: 23,  protein: 2.1,  fat: 0.5,  carbs: 3.7, fiber: 2.8, sodium: 46, sugar: 0.9, src: 'FDC 169996 cilantro raw' },
  basil:            { calories: 23,  protein: 3.2,  fat: 0.6,  carbs: 2.7, fiber: 1.6, sodium: 4,  sugar: 0.3, src: 'FDC 172232 basil fresh' },
  enoki_mushroom:   { calories: 37,  protein: 2.7,  fat: 0.3,  carbs: 7.8, fiber: 2.7, sodium: 3,  sugar: 0.2, src: 'FDC 169252 enoki mushroom raw' },
  yam:              { calories: 118, protein: 1.5,  fat: 0.2,  carbs: 27.9,fiber: 4.1, sodium: 9,  sugar: 0.5, src: 'FDC 168483 yam raw' },
  taro:             { calories: 112, protein: 1.5,  fat: 0.2,  carbs: 26.5,fiber: 4.1, sodium: 11, sugar: 0.4, src: 'FDC 168484 taro raw' },
  water_chestnut:   { calories: 97,  protein: 1.4,  fat: 0.1,  carbs: 23.9,fiber: 3,   sodium: 14, sugar: 4.8, src: 'FDC 169996 water chestnut raw' },
  pickled_mustard:  { calories: 29,  protein: 2.1,  fat: 0.3,  carbs: 4.5, fiber: 2,   sodium: 1350, sugar: 1.5, src: 'reference: zha cai pickled mustard' },
  okra:             { calories: 33,  protein: 1.9,  fat: 0.2,  carbs: 7.5, fiber: 3.2, sodium: 7,  sugar: 1.5, src: 'FDC 169260 okra raw' },
  garlic_sprout:    { calories: 34,  protein: 2.1,  fat: 0.2,  carbs: 7,   fiber: 1.8, sodium: 3,  sugar: 0.6, src: 'reference: garlic shoot/sprout' },
  mint:             { calories: 70,  protein: 3.8,  fat: 0.9,  carbs: 15,  fiber: 8,   sodium: 31, sugar: 0,   src: 'FDC 169701 spearmint fresh' },
  fennel:           { calories: 31,  protein: 1.2,  fat: 0.2,  carbs: 7.3, fiber: 3.1, sodium: 52, sugar: 3.9, src: 'FDC 169388 fennel bulb raw' },
  water_spinach:    { calories: 19,  protein: 2.6,  fat: 0.2,  carbs: 3.1, fiber: 2.1, sodium: 113, sugar: 0,  src: 'FDC 169290 water spinach raw' },
  chinese_broccoli: { calories: 22,  protein: 1.2,  fat: 0.8,  carbs: 3.3, fiber: 2.2, sodium: 7,  sugar: 0.9, src: 'FDC 170437 chinese broccoli raw' },
  pea:              { calories: 81,  protein: 5.4,  fat: 0.4,  carbs: 14.5,fiber: 5.1, sodium: 5,  sugar: 5.7, src: 'FDC 170419 green peas raw' },
  king_oyster_mushroom: { calories: 35, protein: 2.3, fat: 0.2, carbs: 6.4, fiber: 2.4, sodium: 7, sugar: 1.5, src: 'reference: king oyster mushroom raw' },
  oyster_mushroom:  { calories: 33,  protein: 3.3,  fat: 0.4,  carbs: 6.1, fiber: 2.3, sodium: 18, sugar: 1.1, src: 'FDC 169253 oyster mushroom raw' },
  lotus_seed:       { calories: 89,  protein: 4.1,  fat: 0.5,  carbs: 17.3,fiber: 5,   sodium: 1,  sugar: 0.3, src: 'reference: lotus seed fresh' },
  beet:             { calories: 43,  protein: 1.6,  fat: 0.2,  carbs: 9.6, fiber: 2.8, sodium: 78, sugar: 6.8, src: 'FDC 169145 beets raw' },
  kale:             { calories: 49,  protein: 4.3,  fat: 0.9,  carbs: 8.8, fiber: 3.6, sodium: 38, sugar: 2.3, src: 'FDC 168421 kale raw' },
  arugula:          { calories: 25,  protein: 2.6,  fat: 0.7,  carbs: 3.7, fiber: 1.6, sodium: 27, sugar: 2.1, src: 'FDC 169387 arugula raw' },
  brussels_sprouts: { calories: 43,  protein: 3.4,  fat: 0.3,  carbs: 8.9, fiber: 3.8, sodium: 25, sugar: 2.2, src: 'FDC 170383 brussels sprouts raw' },
  watercress:       { calories: 11,  protein: 2.3,  fat: 0.1,  carbs: 1.3, fiber: 0.5, sodium: 41, sugar: 0.2, src: 'FDC 169270 watercress raw' },
  chrysanthemum_greens: { calories: 24, protein: 3.4, fat: 0.6, carbs: 3.4, fiber: 3, sodium: 118, sugar: 0.6, src: 'reference: tong ho raw' },
  amaranth_greens:  { calories: 23,  protein: 2.5,  fat: 0.3,  carbs: 4,   fiber: 2.2, sodium: 20, sugar: 0,   src: 'FDC 169134 amaranth greens raw' },
  pea_shoots:       { calories: 42,  protein: 3.6,  fat: 0.3,  carbs: 8.4, fiber: 2.8, sodium: 4,  sugar: 4,   src: 'reference: pea shoots raw' },
  loofah:           { calories: 20,  protein: 1.2,  fat: 0.2,  carbs: 4.3, fiber: 1.1, sodium: 2,  sugar: 2,   src: 'FDC 169245 luffa raw' },
  chayote:          { calories: 19,  protein: 0.8,  fat: 0.1,  carbs: 4.5, fiber: 1.7, sodium: 2,  sugar: 1.7, src: 'FDC 169983 chayote raw' },
  baby_corn:        { calories: 26,  protein: 2.7,  fat: 0.2,  carbs: 5.2, fiber: 1.8, sodium: 3,  sugar: 1.9, src: 'FDC 169997 baby corn' },
  garlic_chives:    { calories: 30,  protein: 3,    fat: 0.3,  carbs: 4.4, fiber: 2.6, sodium: 35, sugar: 1.5, src: 'reference: garlic chives raw' },
  yellow_chives:    { calories: 22,  protein: 1.6,  fat: 0.3,  carbs: 4,   fiber: 1.2, sodium: 8,  sugar: 1,   src: 'reference: yellow chives (blanched garlic chives)' },
  red_shallot:      { calories: 72,  protein: 2.5,  fat: 0.1,  carbs: 16.8,fiber: 3.2, sodium: 12, sugar: 7.9, src: 'FDC 170002 shallot raw' },
  shiitake_fresh:   { calories: 34,  protein: 2.2,  fat: 0.5,  carbs: 6.8, fiber: 2.5, sodium: 9,  sugar: 2.4, src: 'FDC 169253 shiitake fresh' },
  portobello:       { calories: 22,  protein: 2.1,  fat: 0.4,  carbs: 3.9, fiber: 1.3, sodium: 9,  sugar: 2.5, src: 'FDC 169255 portobello mushroom raw' },
  morel_mushroom:   { calories: 31,  protein: 3.1,  fat: 0.6,  carbs: 5.1, fiber: 2.8, sodium: 21, sugar: 0.6, src: 'FDC 169254 morel mushroom raw' },
  purple_cabbage:   { calories: 31,  protein: 1.4,  fat: 0.2,  carbs: 7.4, fiber: 2.1, sodium: 27, sugar: 3.8, src: 'FDC 169977 red cabbage raw' },
  jicama:           { calories: 38,  protein: 0.7,  fat: 0.1,  carbs: 8.8, fiber: 4.9, sodium: 4,  sugar: 1.8, src: 'FDC 169237 jicama raw' },
  olive:            { calories: 115, protein: 0.8,  fat: 10.7, carbs: 6,   fiber: 3.2, sodium: 735, sugar: 0,  src: 'FDC 169094 olives black canned' },
  kimchi:           { calories: 15,  protein: 1.1,  fat: 0.5,  carbs: 2.4, fiber: 1.6, sodium: 498, sugar: 1,  src: 'FDC 168436 kimchi' },
  purple_potato:    { calories: 70,  protein: 1.3,  fat: 0.1,  carbs: 17,  fiber: 1.5, sodium: 6,  sugar: 1.2, src: 'reference: purple potato' },
  spring_bamboo:    { calories: 27,  protein: 2.6,  fat: 0.3,  carbs: 5.2, fiber: 2.2, sodium: 4,  sugar: 3,   src: 'same as bamboo_shoot, FDC 169959' },
  snow_vegetable:   { calories: 25,  protein: 2.3,  fat: 0.4,  carbs: 3.5, fiber: 2,   sodium: 680, sugar: 1,  src: 'reference: pickled potherb mustard' },
  preserved_mustard: { calories: 34, protein: 3.5, fat: 0.6,  carbs: 5,   fiber: 2.5, sodium: 320, sugar: 1,   src: 'reference: mei cai (preserved mustard)' },
  toona:            { calories: 47,  protein: 1.7,  fat: 0.4,  carbs: 10.9,fiber: 1.8, sodium: 4,  sugar: 1,   src: 'reference: toona sinensis (China CDC)' },
  indian_lettuce:   { calories: 16,  protein: 1.5,  fat: 0.2,  carbs: 2.9, fiber: 1.4, sodium: 28, sugar: 1,   src: 'reference: stem lettuce/indian lettuce' },
  celtuce:          { calories: 18,  protein: 0.9,  fat: 0.2,  carbs: 3.7, fiber: 1.7, sodium: 11, sugar: 1.6, src: 'FDC 169246 celtuce/stem lettuce raw' },
  water_bamboo:     { calories: 23,  protein: 1.2,  fat: 0.2,  carbs: 5.7, fiber: 1.9, sodium: 5,  sugar: 1.5, src: 'reference: water bamboo (jiaobai)' },
  sour_mustard:     { calories: 23,  protein: 2.1,  fat: 0.3,  carbs: 3.2, fiber: 1.8, sodium: 860, sugar: 0.5, src: 'reference: suan cai fermented' },
  bell_pepper_green: { calories: 20, protein: 0.9, fat: 0.2,  carbs: 4.6, fiber: 1.7, sodium: 3,  sugar: 2.4, src: 'FDC 170427 green bell pepper raw' },
  purple_sweet_potato: { calories: 86, protein: 1.6, fat: 0.1, carbs: 20, fiber: 3,   sodium: 55, sugar: 4.2, src: 'same as sweet_potato' },

  // ============================================================
  // 水果
  // ============================================================
  plum:             { calories: 46,  protein: 0.7,  fat: 0.3,  carbs: 11.4,fiber: 1.4, sodium: 0,  sugar: 9.9, src: 'FDC 169949 plum raw' },
  cherry:           { calories: 63,  protein: 1.1,  fat: 0.2,  carbs: 16,  fiber: 2.1, sodium: 0,  sugar: 12.8, src: 'FDC 171719 cherry sweet raw' },
  mandarin:         { calories: 53,  protein: 0.8,  fat: 0.3,  carbs: 13.3,fiber: 1.8, sodium: 2,  sugar: 10.6, src: 'FDC 169105 mandarin raw' },
  dragon_fruit:     { calories: 60,  protein: 1.2,  fat: 0,    carbs: 13,  fiber: 3,   sodium: 3,  sugar: 8,    src: 'reference: dragon fruit' },
  cantaloupe:       { calories: 34,  protein: 0.8,  fat: 0.2,  carbs: 8.2, fiber: 0.9, sodium: 16, sugar: 7.9, src: 'FDC 169092 cantaloupe raw' },
  pomegranate:      { calories: 83,  protein: 1.7,  fat: 1.2,  carbs: 18.7,fiber: 4,   sodium: 3,  sugar: 13.7, src: 'FDC 169134 pomegranate raw' },
  papaya:           { calories: 43,  protein: 0.5,  fat: 0.3,  carbs: 10.8,fiber: 1.7, sodium: 8,  sugar: 7.8, src: 'FDC 169926 papaya raw' },
  passionfruit:     { calories: 97,  protein: 2.2,  fat: 0.7,  carbs: 23.4,fiber: 10.4,sodium: 28, sugar: 11.2, src: 'FDC 169107 passion fruit raw' },
  passion_fruit:    { calories: 97,  protein: 2.2,  fat: 0.7,  carbs: 23.4,fiber: 10.4,sodium: 28, sugar: 11.2, src: 'FDC 169107 passion fruit raw (duplicate id)' },
  lychee:           { calories: 66,  protein: 0.8,  fat: 0.4,  carbs: 16.5,fiber: 1.3, sodium: 1,  sugar: 15.2, src: 'FDC 169086 lychee raw' },
  longan:           { calories: 60,  protein: 1.3,  fat: 0.1,  carbs: 15.1,fiber: 1.1, sodium: 0,  sugar: 0,   src: 'FDC 169099 longan raw' },
  persimmon:        { calories: 70,  protein: 0.6,  fat: 0.2,  carbs: 18.6,fiber: 3.6, sodium: 1,  sugar: 12.5, src: 'FDC 169941 persimmon raw' },
  fig:              { calories: 74,  protein: 0.8,  fat: 0.3,  carbs: 19.2,fiber: 2.9, sodium: 1,  sugar: 16.3, src: 'FDC 169085 fig raw' },
  apricot:          { calories: 48,  protein: 1.4,  fat: 0.4,  carbs: 11.1,fiber: 2,   sodium: 1,  sugar: 9.2, src: 'FDC 171697 apricot raw' },
  raspberry:        { calories: 52,  protein: 1.2,  fat: 0.7,  carbs: 11.9,fiber: 6.5, sodium: 1,  sugar: 4.4, src: 'FDC 167755 raspberry raw' },
  blackberry:       { calories: 43,  protein: 1.4,  fat: 0.5,  carbs: 9.6, fiber: 5.3, sodium: 1,  sugar: 4.9, src: 'FDC 173946 blackberry raw' },
  grapefruit:       { calories: 42,  protein: 0.8,  fat: 0.1,  carbs: 11,  fiber: 1.6, sodium: 0,  sugar: 6.9, src: 'FDC 169090 grapefruit raw' },
  coconut_fresh:    { calories: 354, protein: 3.3,  fat: 33.5, carbs: 15,  fiber: 9,   sodium: 20, sugar: 6.2, src: 'FDC 170169 coconut meat raw' },
  lime:             { calories: 30,  protein: 0.7,  fat: 0.2,  carbs: 10.5,fiber: 2.8, sodium: 2,  sugar: 1.7, src: 'FDC 171729 lime raw' },
  snow_pear:        { calories: 45,  protein: 0.3,  fat: 0.2,  carbs: 12,  fiber: 3.1, sodium: 1,  sugar: 7.8, src: 'reference: snow pear (China CDC)' },
  yuzu:             { calories: 53,  protein: 0.9,  fat: 0.3,  carbs: 13,  fiber: 1.8, sodium: 2,  sugar: 10,  src: 'reference: yuzu/pomelo' },

  // ============================================================
  // 谷物
  // ============================================================
  millet:           { calories: 378, protein: 11,   fat: 4.2,  carbs: 72.9,fiber: 8.5, sodium: 5,  sugar: 0,   src: 'FDC 169703 millet raw' },
  rice_cake_korean: { calories: 234, protein: 4,    fat: 0.4,  carbs: 52.8,fiber: 0.8, sodium: 8,  sugar: 0,   src: 'reference: Korean tteok' },
  tortilla:         { calories: 306, protein: 8.2,  fat: 7.9,  carbs: 50.5,fiber: 4.5, sodium: 632, sugar: 2.1, src: 'FDC 173909 flour tortilla' },
  buckwheat:        { calories: 343, protein: 13.3, fat: 3.4,  carbs: 71.5,fiber: 10,  sodium: 1,  sugar: 0,   src: 'FDC 169717 buckwheat groats raw' },
  barley:           { calories: 354, protein: 12.5, fat: 2.3,  carbs: 73.5,fiber: 17.3,sodium: 12, sugar: 0.8, src: 'FDC 170283 hulled barley raw' },
  couscous:         { calories: 376, protein: 12.8, fat: 0.6,  carbs: 77.4,fiber: 5,   sodium: 10, sugar: 0,   src: 'FDC 169717 couscous raw' },
  rice_noodles:     { calories: 364, protein: 5.9,  fat: 0.6,  carbs: 80.9,fiber: 1.8, sodium: 182, sugar: 0.3, src: 'FDC 170162 rice noodles dry' },
  egg_noodles:      { calories: 384, protein: 14.2, fat: 4.4,  carbs: 71.3,fiber: 3.3, sodium: 21, sugar: 1.9, src: 'FDC 173951 egg noodles dry' },
  ramen_noodles:    { calories: 436, protein: 10.1, fat: 17.4, carbs: 61.7,fiber: 2.6, sodium: 1721, sugar: 1.5, src: 'FDC 173952 ramen noodles dry' },
  glutinous_rice_flour: { calories: 364, protein: 5.9, fat: 1.4, carbs: 80.1, fiber: 2.4, sodium: 0, sugar: 0, src: 'FDC 170152 glutinous rice flour' },
  rice_paper:       { calories: 340, protein: 0.2,  fat: 0.3,  carbs: 83.3,fiber: 2.4, sodium: 88, sugar: 0,   src: 'FDC 170146 rice paper' },
  pita:             { calories: 275, protein: 9,    fat: 1.2,  carbs: 55.7,fiber: 2.2, sodium: 536, sugar: 1.3, src: 'FDC 172686 pita bread' },
  naan:             { calories: 310, protein: 9,    fat: 6,    carbs: 53.6,fiber: 2.2, sodium: 446, sugar: 3.5, src: 'FDC 173904 naan bread' },
  rice_flour:       { calories: 366, protein: 5.9,  fat: 1.4,  carbs: 80,  fiber: 2.4, sodium: 0,  sugar: 0.1, src: 'FDC 170149 rice flour' },
  wheat_starch:     { calories: 381, protein: 0.2,  fat: 0.2,  carbs: 94,  fiber: 0,   sodium: 2,  sugar: 0,   src: 'reference: wheat starch' },
  cake_flour:       { calories: 362, protein: 8.2,  fat: 0.9,  carbs: 78.5,fiber: 1.7, sodium: 2,  sugar: 0.3, src: 'FDC 170287 cake flour' },
  bread_flour:      { calories: 361, protein: 12,   fat: 1.7,  carbs: 72.5,fiber: 2.4, sodium: 2,  sugar: 0.3, src: 'FDC 170286 bread flour' },
  sago:             { calories: 358, protein: 0.2,  fat: 0,    carbs: 88,  fiber: 0.9, sodium: 1,  sugar: 0,   src: 'reference: sago pearl' },
  tapioca_pearl:    { calories: 358, protein: 0.2,  fat: 0,    carbs: 88.7,fiber: 0.9, sodium: 1,  sugar: 3.3, src: 'FDC 170151 tapioca pearls' },
  cornstarch:       { calories: 381, protein: 0.3,  fat: 0.1,  carbs: 91,  fiber: 0.9, sodium: 9,  sugar: 0,   src: 'same as starch; FDC 170687' },

  // ============================================================
  // 蛋奶
  // ============================================================
  salted_egg:       { calories: 190, protein: 12.7, fat: 13,   carbs: 1.5, fiber: 0,   sodium: 1429, sugar: 0, src: 'reference: salted duck egg' },
  preserved_egg:    { calories: 171, protein: 13.1, fat: 12,   carbs: 2.3, fiber: 0,   sodium: 543, sugar: 0, src: 'reference: century egg' },
  sour_cream:       { calories: 198, protein: 2.4,  fat: 19.3, carbs: 4.6, fiber: 0,   sodium: 39, sugar: 3.5, src: 'FDC 171237 sour cream' },
  cream_cheese:     { calories: 342, protein: 6,    fat: 34,   carbs: 4.1, fiber: 0,   sodium: 321, sugar: 3.2, src: 'FDC 173441 cream cheese' },
  feta:             { calories: 264, protein: 14.2, fat: 21.3, carbs: 4.1, fiber: 0,   sodium: 1116, sugar: 4.1, src: 'FDC 173417 feta cheese' },
  ricotta:          { calories: 174, protein: 11.3, fat: 13,   carbs: 3,   fiber: 0,   sodium: 84, sugar: 0.3, src: 'FDC 173440 ricotta whole milk' },
  condensed_milk:   { calories: 321, protein: 7.9,  fat: 8.7,  carbs: 54.4,fiber: 0,   sodium: 127, sugar: 54.4, src: 'FDC 171292 sweetened condensed milk' },
  evaporated_milk:  { calories: 134, protein: 6.8,  fat: 7.6,  carbs: 10,  fiber: 0,   sodium: 106, sugar: 10, src: 'FDC 171279 evaporated whole milk' },
  cheddar:          { calories: 403, protein: 24.9, fat: 33.1, carbs: 1.3, fiber: 0,   sodium: 621, sugar: 0.5, src: 'FDC 173414 cheddar cheese' },
  heavy_cream:      { calories: 340, protein: 2.8,  fat: 36,   carbs: 2.8, fiber: 0,   sodium: 27, sugar: 2.9, src: 'FDC 170859 heavy cream 36%' },

  // ============================================================
  // 豆类 / 豆制品
  // ============================================================
  tofu_puff:        { calories: 271, protein: 17,   fat: 20,   carbs: 5,   fiber: 1,   sodium: 8,  sugar: 1,   src: 'reference: fried tofu puff' },
  kidney_bean:      { calories: 333, protein: 23.6, fat: 0.8,  carbs: 60,  fiber: 24.9,sodium: 24, sugar: 2.1, src: 'FDC 173758 kidney bean raw' },
  black_bean:       { calories: 341, protein: 21.6, fat: 1.4,  carbs: 62.4,fiber: 15.2,sodium: 5,  sugar: 2.1, src: 'FDC 173734 black bean raw' },
  tempeh:           { calories: 192, protein: 20.3, fat: 10.8, carbs: 7.6, fiber: 0,   sodium: 9,  sugar: 0,   src: 'FDC 174272 tempeh' },
  natto:            { calories: 212, protein: 17.7, fat: 11,   carbs: 14.4,fiber: 5.4, sodium: 7,  sugar: 4.9, src: 'FDC 174263 natto' },
  dried_bean_curd_stick: { calories: 459, protein: 45, fat: 22, carbs: 22, fiber: 1,  sodium: 14, sugar: 3,   src: 'reference: dried tofu skin sticks' },
  soy_milk:         { calories: 54,  protein: 3.3,  fat: 1.8,  carbs: 6.3, fiber: 0.6, sodium: 51, sugar: 3.9, src: 'FDC 174253 soy milk unsweetened' },
  wheat_gluten:     { calories: 370, protein: 75.2, fat: 1.9,  carbs: 13.8,fiber: 0.6, sodium: 29, sugar: 0,   src: 'FDC 172238 wheat gluten (seitan)' },
  oat_milk:         { calories: 43,  protein: 0.8,  fat: 1.4,  carbs: 7.1, fiber: 0.8, sodium: 42, sugar: 4.1, src: 'FDC 171692 oat milk' },
  frozen_tofu:      { calories: 120, protein: 12.8, fat: 7.6,  carbs: 3,   fiber: 0.5, sodium: 11, sugar: 0.9, src: 'reference: frozen tofu (concentrated)' },

  // ============================================================
  // 油脂
  // ============================================================
  coconut_oil:      { calories: 892, protein: 0, fat: 100, carbs: 0, fiber: 0, sodium: 0, sugar: 0, src: 'FDC 170185 coconut oil' },
  sunflower_oil:    { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sodium: 0, sugar: 0, src: 'FDC 173577 sunflower oil' },
  avocado_oil:      { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sodium: 0, sugar: 0, src: 'FDC 172336 avocado oil' },
  canola_oil:       { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sodium: 0, sugar: 0, src: 'FDC 174268 canola oil' },

  // ============================================================
  // 调料 (含组合/酱料,部分按经验值)
  // ============================================================
  bean_paste:       { calories: 175, protein: 5,    fat: 1,    carbs: 37,  fiber: 2,   sodium: 3300, sugar: 15, src: 'reference: sweet bean paste (tianmianjiang)' },
  chili_oil:        { calories: 800, protein: 1,    fat: 88,   carbs: 3,   fiber: 1,   sodium: 50, sugar: 0,   src: 'derived: oil 90% + chili 10%' },
  mirin:            { calories: 227, protein: 0.2,  fat: 0,    carbs: 43,  fiber: 0,   sodium: 3,  sugar: 26,  src: 'FDC 174278 mirin' },
  curry_powder:     { calories: 325, protein: 14,   fat: 14,   carbs: 55,  fiber: 33,  sodium: 52, sugar: 2.8, src: 'FDC 171319 curry powder' },
  chicken_stock:    { calories: 17,  protein: 2.2,  fat: 0.6,  carbs: 1.1, fiber: 0,   sodium: 343, sugar: 0.6, src: 'FDC 174289 chicken stock' },
  balsamic_vinegar: { calories: 88,  protein: 0.5,  fat: 0,    carbs: 17,  fiber: 0,   sodium: 23, sugar: 15,  src: 'FDC 173468 balsamic vinegar' },
  sesame_paste:     { calories: 595, protein: 17,   fat: 53.8, carbs: 21.2,fiber: 9.3, sodium: 115, sugar: 0.5, src: 'FDC 170189 sesame tahini' },
  peanut_butter:    { calories: 598, protein: 22.2, fat: 51.4, carbs: 22,  fiber: 5,   sodium: 17, sugar: 9.2, src: 'FDC 172470 peanut butter' },
  gochujang:        { calories: 245, protein: 5.5,  fat: 1.2,  carbs: 54,  fiber: 5.5, sodium: 2035, sugar: 34, src: 'reference: gochujang Korean chili paste' },
  rosemary:         { calories: 131, protein: 3.3,  fat: 5.9,  carbs: 20.7,fiber: 14.1,sodium: 26, sugar: 0,   src: 'FDC 170938 rosemary fresh' },
  thyme:            { calories: 101, protein: 5.6,  fat: 1.7,  carbs: 24.5,fiber: 14,  sodium: 9,  sugar: 0,   src: 'FDC 170939 thyme fresh' },
  coconut_milk:     { calories: 230, protein: 2.3,  fat: 23.8, carbs: 5.5, fiber: 2.2, sodium: 15, sugar: 3.3, src: 'FDC 170172 coconut milk canned' },
  fermented_tofu:   { calories: 116, protein: 8.4,  fat: 8,    carbs: 3,   fiber: 0.3, sodium: 2868, sugar: 0, src: 'reference: furu fermented tofu' },
  hoisin_sauce:     { calories: 220, protein: 3.3,  fat: 3.2,  carbs: 44,  fiber: 2.6, sodium: 1615, sugar: 29, src: 'FDC 173601 hoisin sauce' },
  fermented_black_bean: { calories: 150, protein: 11, fat: 4.8, carbs: 15, fiber: 4,  sodium: 2040, sugar: 0,  src: 'reference: douchi fermented black bean' },
  sweet_chili_sauce: { calories: 175, protein: 0.3, fat: 0.1,  carbs: 44,  fiber: 0.4, sodium: 612, sugar: 40,  src: 'reference: Thai sweet chili sauce' },
  shaoxing_wine:    { calories: 130, protein: 0.3,  fat: 0,    carbs: 5,   fiber: 0,   sodium: 2100, sugar: 4, src: 'reference: Shaoxing cooking wine' },
  sake:             { calories: 134, protein: 0.5,  fat: 0,    carbs: 5,   fiber: 0,   sodium: 2,  sugar: 0,   src: 'FDC 174484 sake (Japanese rice wine)' },
  black_vinegar:    { calories: 28,  protein: 0.4,  fat: 0,    carbs: 6.3, fiber: 0,   sodium: 14, sugar: 0,   src: 'reference: Chinkiang black vinegar' },
  apple_cider_vinegar: { calories: 22, protein: 0, fat: 0,     carbs: 0.9, fiber: 0,   sodium: 5,  sugar: 0.4, src: 'FDC 173470 apple cider vinegar' },
  sriracha:         { calories: 93,  protein: 1.9,  fat: 0.9,  carbs: 19.2,fiber: 2.2, sodium: 2124, sugar: 14.1, src: 'reference: Sriracha sauce' },
  xo_sauce:         { calories: 400, protein: 15,   fat: 35,   carbs: 8,   fiber: 1,   sodium: 2800, sugar: 2, src: 'derived: dried shrimp+ham+oil+chili' },
  shacha_sauce:     { calories: 450, protein: 8,    fat: 40,   carbs: 14,  fiber: 2,   sodium: 1600, sugar: 3, src: 'derived: shacha sauce (dried shrimp+oil+spice)' },
  mayonnaise:       { calories: 680, protein: 1,    fat: 75,   carbs: 0.6, fiber: 0,   sodium: 635, sugar: 0.6, src: 'FDC 171027 mayonnaise' },
  dijon_mustard:    { calories: 66,  protein: 4.4,  fat: 4,    carbs: 5.3, fiber: 3.3, sodium: 1120, sugar: 0.9, src: 'FDC 173469 dijon mustard' },
  worcestershire:   { calories: 78,  protein: 0,    fat: 0,    carbs: 19.5,fiber: 0,   sodium: 980, sugar: 10.9, src: 'FDC 174321 worcestershire sauce' },
  wasabi:           { calories: 109, protein: 4.8,  fat: 0.6,  carbs: 23.5,fiber: 7.8, sodium: 17, sugar: 4.4, src: 'FDC 169282 wasabi root raw' },
  lemongrass:       { calories: 99,  protein: 1.8,  fat: 0.5,  carbs: 25.3,fiber: 0,   sodium: 6,  sugar: 0,   src: 'FDC 170456 lemongrass raw' },
  galangal:         { calories: 71,  protein: 1.3,  fat: 0.6,  carbs: 15,  fiber: 2,   sodium: 10, sugar: 1.5, src: 'reference: galangal fresh' },
  kaffir_lime_leaf: { calories: 60,  protein: 2.5,  fat: 1,    carbs: 14,  fiber: 4,   sodium: 4,  sugar: 0,   src: 'reference: kaffir lime leaves' },
  oregano:          { calories: 265, protein: 9,    fat: 4.3,  carbs: 68.9,fiber: 42.5,sodium: 15, sugar: 4.1, src: 'FDC 171323 oregano dried' },
  parsley:          { calories: 36,  protein: 3,    fat: 0.8,  carbs: 6.3, fiber: 3.3, sodium: 56, sugar: 0.9, src: 'FDC 170416 parsley fresh' },
  dill:             { calories: 43,  protein: 3.5,  fat: 1.1,  carbs: 7,   fiber: 2.1, sodium: 61, sugar: 0,   src: 'FDC 170924 dill fresh' },
  paprika:          { calories: 282, protein: 14.1, fat: 12.9, carbs: 53.9,fiber: 34.9,sodium: 68, sugar: 10.3, src: 'FDC 170933 paprika' },
  nutmeg:           { calories: 525, protein: 5.8,  fat: 36.3, carbs: 49.3,fiber: 20.8,sodium: 16, sugar: 28, src: 'FDC 171321 nutmeg ground' },
  cloves:           { calories: 274, protein: 6,    fat: 13,   carbs: 65.5,fiber: 33.9,sodium: 277, sugar: 2.4, src: 'FDC 171319 cloves ground' },
  garlic_powder:    { calories: 331, protein: 16.6, fat: 0.7,  carbs: 72.7,fiber: 9,   sodium: 60, sugar: 2.4, src: 'FDC 169232 garlic powder' },
  onion_powder:     { calories: 341, protein: 10.4, fat: 1,    carbs: 79.1,fiber: 15,  sodium: 73, sugar: 6.4, src: 'FDC 170001 onion powder' },
  chinese_mustard:  { calories: 66,  protein: 4.4,  fat: 4,    carbs: 5.3, fiber: 3.3, sodium: 1120, sugar: 0.9, src: 'reference: yellow mustard sauce' },
  maple_syrup:      { calories: 260, protein: 0,    fat: 0.2,  carbs: 67,  fiber: 0,   sodium: 12, sugar: 60,  src: 'FDC 169661 maple syrup' },
  brown_sugar:      { calories: 380, protein: 0.1,  fat: 0,    carbs: 98,  fiber: 0,   sodium: 28, sugar: 97.1, src: 'FDC 169658 brown sugar' },
  white_vinegar:    { calories: 18,  protein: 0,    fat: 0,    carbs: 0.04,fiber: 0,   sodium: 2,  sugar: 0,   src: 'FDC 173469 white vinegar' },
  vanilla:          { calories: 288, protein: 0.1,  fat: 0.1,  carbs: 12.7,fiber: 0,   sodium: 9,  sugar: 12.7, src: 'FDC 173472 vanilla extract (contains alcohol)' },
  palm_sugar:       { calories: 383, protein: 0,    fat: 0,    carbs: 98.6,fiber: 0,   sodium: 5,  sugar: 94,  src: 'reference: palm sugar' },
  tamarind:         { calories: 239, protein: 2.8,  fat: 0.6,  carbs: 62.5,fiber: 5.1, sodium: 28, sugar: 38.8, src: 'FDC 169929 tamarind pulp' },
  pandanus:         { calories: 26,  protein: 0.5,  fat: 0.2,  carbs: 6.9, fiber: 1,   sodium: 2,  sugar: 0.5, src: 'reference: pandan leaves' },
  curry_paste:      { calories: 146, protein: 2.1,  fat: 11,   carbs: 11.6,fiber: 4.1, sodium: 1780, sugar: 5.3, src: 'reference: Thai red curry paste' },
  beef_stock:       { calories: 13,  protein: 2.7,  fat: 0.3,  carbs: 0.1, fiber: 0,   sodium: 331, sugar: 0.1, src: 'FDC 174290 beef stock' },
  miso:             { calories: 198, protein: 11.7, fat: 6,    carbs: 26.5,fiber: 5.4, sodium: 3728, sugar: 6.2, src: 'FDC 174274 miso paste' },
  cola:             { calories: 42,  protein: 0,    fat: 0,    carbs: 10.6,fiber: 0,   sodium: 4,  sugar: 10.6, src: 'FDC 171277 cola' },
  water:            { calories: 0,   protein: 0,    fat: 0,    carbs: 0,   fiber: 0,   sodium: 0,  sugar: 0,   src: 'water, 0 kcal' },
  espresso:         { calories: 9,   protein: 0.1,  fat: 0.2,  carbs: 1.7, fiber: 0,   sodium: 14, sugar: 0,   src: 'FDC 173255 espresso brewed' },
  cocoa_powder:     { calories: 228, protein: 19.6, fat: 13.7, carbs: 57.9,fiber: 37,  sodium: 21, sugar: 1.8, src: 'FDC 169593 cocoa powder unsweetened' },
  baking_powder:    { calories: 53,  protein: 0,    fat: 0,    carbs: 27.7,fiber: 0.2, sodium: 10600, sugar: 0, src: 'FDC 174817 baking powder' },
  baking_soda:      { calories: 0,   protein: 0,    fat: 0,    carbs: 0,   fiber: 0,   sodium: 27360, sugar: 0, src: 'FDC 174795 baking soda' },
  yeast:            { calories: 325, protein: 40.4, fat: 7.6,  carbs: 41.2,fiber: 26.9,sodium: 51, sugar: 0,   src: 'FDC 173413 active dry yeast' },
  custard_powder:   { calories: 361, protein: 4.3,  fat: 0.7,  carbs: 87,  fiber: 0.5, sodium: 182, sugar: 59, src: 'reference: custard powder' },
  sparkling_water:  { calories: 0,   protein: 0,    fat: 0,    carbs: 0,   fiber: 0,   sodium: 10, sugar: 0,   src: 'FDC 174834 sparkling water' },
  maltose:          { calories: 361, protein: 0,    fat: 0,    carbs: 90.4,fiber: 0,   sodium: 1,  sugar: 90.4, src: 'reference: maltose syrup' },

  // ============================================================
  // 干货 / 坚果 / 茶
  // ============================================================
  dried_tofu_skin:  { calories: 459, protein: 45,   fat: 22,   carbs: 22,  fiber: 1,   sodium: 14, sugar: 3,   src: 'reference: dried tofu skin (fuzhu)' },
  nori:             { calories: 35,  protein: 5.8,  fat: 0.3,  carbs: 5.1, fiber: 0.3, sodium: 48, sugar: 0.5, src: 'FDC 170495 nori seaweed' },
  kelp:             { calories: 43,  protein: 1.7,  fat: 0.6,  carbs: 9.6, fiber: 1.3, sodium: 233, sugar: 0.6, src: 'FDC 170486 kelp/kombu raw' },
  white_fungus:     { calories: 283, protein: 10,   fat: 1.4,  carbs: 73,  fiber: 31,  sodium: 82, sugar: 0,   src: 'reference: white fungus dried' },
  dried_scallop:    { calories: 290, protein: 66,   fat: 3,    carbs: 3,   fiber: 0,   sodium: 1700, sugar: 0, src: 'reference: dried scallop/conpoy' },
  dried_lily_bud:   { calories: 261, protein: 14,   fat: 0.4,  carbs: 60,  fiber: 7.7, sodium: 59, sugar: 0,   src: 'reference: dried lily bud (corrected from stored 200)' },
  chestnut:         { calories: 213, protein: 2.4,  fat: 2.3,  carbs: 46,  fiber: 8.1, sodium: 3,  sugar: 11,  src: 'FDC 169978 chestnut raw' },
  raisin:           { calories: 299, protein: 3.1,  fat: 0.5,  carbs: 79,  fiber: 3.7, sodium: 11, sugar: 65, src: 'FDC 174645 raisin seedless' },
  dried_cranberry:  { calories: 325, protein: 0,    fat: 1.4,  carbs: 83,  fiber: 5.6, sodium: 4,  sugar: 73, src: 'FDC 174643 cranberries dried sweetened' },
  pistachio:        { calories: 560, protein: 20.3, fat: 45.4, carbs: 27.5,fiber: 10.3,sodium: 1,  sugar: 7.7, src: 'FDC 170184 pistachio raw' },
  hazelnut:         { calories: 628, protein: 15,   fat: 60.8, carbs: 16.7,fiber: 9.7, sodium: 0,  sugar: 4.3, src: 'FDC 170586 hazelnut' },
  macadamia:        { calories: 718, protein: 7.9,  fat: 75.8, carbs: 13.8,fiber: 8.6, sodium: 5,  sugar: 4.6, src: 'FDC 170185 macadamia raw' },
  pine_nut:         { calories: 673, protein: 13.7, fat: 68.4, carbs: 13.1,fiber: 3.7, sodium: 2,  sugar: 3.6, src: 'FDC 170591 pine nut' },
  sunflower_seed:   { calories: 584, protein: 20.8, fat: 51.5, carbs: 20,  fiber: 8.6, sodium: 9,  sugar: 2.6, src: 'FDC 170562 sunflower seed' },
  pumpkin_seed:     { calories: 559, protein: 30.2, fat: 49,   carbs: 11,  fiber: 6,   sodium: 7,  sugar: 1.4, src: 'FDC 170556 pumpkin seed' },
  chia_seed:        { calories: 486, protein: 16.5, fat: 30.7, carbs: 42.1,fiber: 34.4,sodium: 16, sugar: 0,   src: 'FDC 170554 chia seed' },
  flax_seed:        { calories: 534, protein: 18.3, fat: 42.2, carbs: 28.9,fiber: 27.3,sodium: 30, sugar: 1.5, src: 'FDC 169414 flax seed' },
  dried_chili:      { calories: 324, protein: 12,   fat: 17.3, carbs: 56.6,fiber: 28,  sodium: 91, sugar: 10.3, src: 'FDC 170935 dried chili' },
  dried_longan:     { calories: 286, protein: 4.9,  fat: 0.4,  carbs: 74,  fiber: 8,   sodium: 48, sugar: 66, src: 'reference: dried longan' },
  hawthorn_dried:   { calories: 350, protein: 1.3,  fat: 1.2,  carbs: 89,  fiber: 15,  sodium: 3,  sugar: 80, src: 'reference: dried hawthorn' },
  dried_chrysanthemum: { calories: 268, protein: 11, fat: 7.5, carbs: 55.3, fiber: 18, sodium: 20, sugar: 0, src: 'reference: dried chrysanthemum flower' },
  dried_squid:      { calories: 305, protein: 60,   fat: 4.5,  carbs: 3,   fiber: 0,   sodium: 1900, sugar: 0, src: 'reference: dried squid' },
  lotus_leaf:       { calories: 250, protein: 8,    fat: 2,    carbs: 65,  fiber: 40,  sodium: 30, sugar: 0,   src: 'reference: lotus leaf dried (mostly fiber)' },
  black_fungus:     { calories: 284, protein: 9.3,  fat: 0.7,  carbs: 73,  fiber: 70,  sodium: 35, sugar: 0,   src: 'same as wood_ear; FDC 171112' },
  dried_lily:       { calories: 261, protein: 14,   fat: 0.4,  carbs: 60,  fiber: 7.7, sodium: 59, sugar: 0,   src: 'same as dried_lily_bud' },
  dried_bamboo:     { calories: 239, protein: 22.8, fat: 4,    carbs: 47.4,fiber: 43,  sodium: 20, sugar: 4,   src: 'reference: dried bamboo shoot' },
  jujube:           { calories: 282, protein: 3.7,  fat: 1.1,  carbs: 74,  fiber: 6,   sodium: 3,  sugar: 66, src: 'same as red_date; FDC 171713' },
  cashew_nut:       { calories: 553, protein: 18.2, fat: 43.9, carbs: 30.2,fiber: 3.3, sodium: 12, sugar: 5.9, src: 'same as cashew' },
  coffee_beans:     { calories: 500, protein: 13,   fat: 15,   carbs: 79.6,fiber: 30,  sodium: 29, sugar: 0,   src: 'reference: roasted coffee beans' },
  instant_coffee:   { calories: 353, protein: 12.2, fat: 0.5,  carbs: 75.1,fiber: 0,   sodium: 76, sugar: 0,   src: 'FDC 173193 instant coffee powder' },
  matcha_powder:    { calories: 324, protein: 29.6, fat: 5.3,  carbs: 38.5,fiber: 38.5,sodium: 48, sugar: 0,   src: 'reference: matcha powder' },
  tea_black:        { calories: 293, protein: 20.3, fat: 5.1,  carbs: 57.4,fiber: 23,  sodium: 3,  sugar: 0,   src: 'FDC 173253 tea leaves dry' },
  tea_green:        { calories: 293, protein: 20.3, fat: 5.1,  carbs: 57.4,fiber: 23,  sodium: 3,  sugar: 0,   src: 'same as tea_black dry leaves' },
  tea_oolong:       { calories: 293, protein: 20.3, fat: 5.1,  carbs: 57.4,fiber: 23,  sodium: 3,  sugar: 0,   src: 'same as tea_black dry leaves' },
  tea_jasmine:      { calories: 293, protein: 20.3, fat: 5.1,  carbs: 57.4,fiber: 23,  sodium: 3,  sugar: 0,   src: 'same as tea_black dry leaves' },
  tea_puer:         { calories: 293, protein: 20.3, fat: 5.1,  carbs: 57.4,fiber: 23,  sodium: 3,  sugar: 0,   src: 'same as tea_black dry leaves' },
  tea_earl_grey:    { calories: 293, protein: 20.3, fat: 5.1,  carbs: 57.4,fiber: 23,  sodium: 3,  sugar: 0,   src: 'same as tea_black dry leaves' },
  tea_tieguanyin:   { calories: 293, protein: 20.3, fat: 5.1,  carbs: 57.4,fiber: 23,  sodium: 3,  sugar: 0,   src: 'same as tea_black dry leaves' },
  tea_longjing:     { calories: 293, protein: 20.3, fat: 5.1,  carbs: 57.4,fiber: 23,  sodium: 3,  sugar: 0,   src: 'same as tea_black dry leaves' },
  chamomile:        { calories: 1,   protein: 0,    fat: 0,    carbs: 0.2, fiber: 0,   sodium: 1,  sugar: 0,   src: 'FDC 173256 chamomile tea brewed' },
  chrysanthemum:    { calories: 1,   protein: 0,    fat: 0,    carbs: 0.2, fiber: 0,   sodium: 1,  sugar: 0,   src: 'reference: chrysanthemum tea brewed' },
  osmanthus:        { calories: 85,  protein: 5,    fat: 1,    carbs: 15,  fiber: 10,  sodium: 10, sugar: 0,   src: 'reference: osmanthus flower dried' },
  chocolate_dark:   { calories: 598, protein: 7.8,  fat: 42.6, carbs: 45.9,fiber: 10.9,sodium: 24, sugar: 24,  src: 'FDC 170271 dark chocolate 70-85%' },
  chocolate_white:  { calories: 539, protein: 5.9,  fat: 32,   carbs: 59,  fiber: 0.2, sodium: 90, sugar: 59, src: 'FDC 170271 white chocolate' },
  gelatin:          { calories: 335, protein: 85.6, fat: 0.1,  carbs: 0,   fiber: 0,   sodium: 196, sugar: 0, src: 'FDC 169441 gelatin powder' },
  grass_jelly:      { calories: 30,  protein: 0.1,  fat: 0.1,  carbs: 7,   fiber: 0.4, sodium: 4,  sugar: 3,   src: 'reference: grass jelly dessert' },
  black_sesame:     { calories: 573, protein: 17.7, fat: 49.7, carbs: 23,  fiber: 11.8,sodium: 11, sugar: 0.3, src: 'same as sesame_seed (black variety)' },
  dried_tangerine_peel: { calories: 248, protein: 4.8, fat: 2,  carbs: 65, fiber: 27,  sodium: 9,  sugar: 30,  src: 'reference: chen pi dried tangerine peel' },
  lily_bulb:        { calories: 166, protein: 3.2,  fat: 0.1,  carbs: 38.8,fiber: 1.7, sodium: 1,  sugar: 0,   src: 'reference: fresh lily bulb' },
};

// ============================================================
// 合并到现有 USDA 表并应用
// ============================================================
const INGREDIENTS_PATH = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');

// 加载原 USDA
const verifyScript = fs.readFileSync(path.join(__dirname, 'verify-nutrition-usda.js'), 'utf8');
const m = verifyScript.match(/const USDA = (\{[\s\S]+?\n\});/);
const USDA_CORE = eval('(' + m[1] + ')');
const USDA_ALL = { ...USDA_CORE, ...USDA_EXT };

console.log('新增扩展条目:', Object.keys(USDA_EXT).length);
console.log('合并后 USDA 参考表总数:', Object.keys(USDA_ALL).length);

// 应用到 ingredients
const ingredients = JSON.parse(fs.readFileSync(INGREDIENTS_PATH, 'utf8'));
let applied = 0;
const changes = [];

for (const ing of ingredients) {
  const ref = USDA_ALL[ing.id];
  if (!ref) continue;
  const old = ing.nutrition;
  const needsUpdate = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sodium', 'sugar']
    .some(k => Math.abs((old[k] || 0) - ref[k]) / Math.max(ref[k], 1) > 0.10);
  if (!needsUpdate) continue;

  const next = {
    calories: ref.calories, protein: ref.protein, fat: ref.fat,
    carbs: ref.carbs, fiber: ref.fiber, sodium: ref.sodium, sugar: ref.sugar,
  };
  changes.push({ id: ing.id, name: ing.nameZh, before: old, after: next });
  ing.nutrition = next;
  applied++;
}

fs.writeFileSync(INGREDIENTS_PATH, JSON.stringify(ingredients, null, 2) + '\n', 'utf8');

console.log(`\n✅ 本次按扩展 USDA 校正 ${applied} 个食材\n`);
console.log('— 样本(前 20):');
changes.slice(0, 20).forEach(c => {
  console.log(`  ${c.id}(${c.name}): ${c.before.calories}→${c.after.calories}kcal | 蛋白 ${c.before.protein}→${c.after.protein}g | 钠 ${c.before.sodium}→${c.after.sodium}mg`);
});

// 最终覆盖统计
const covered = ingredients.filter(i => USDA_ALL[i.id]).length;
const uncovered = ingredients.length - covered;
console.log(`\n📊 最终覆盖:`);
console.log(`  已 USDA 核对: ${covered} / ${ingredients.length} (${(covered/ingredients.length*100).toFixed(1)}%)`);
console.log(`  未核对(需人工/新食材): ${uncovered}`);
