/**
 * 综合菜谱升级脚本
 * 1. 生成300道中餐热菜
 * 2. 修复现有数据
 * 3. 补充缺失食材
 * 4. 合并去重
 * 5. 验证分布
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// ============================================================
// Part 1: 生成300道中餐热菜模板
// ============================================================

const INGREDIENTS = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const ING_MAP = new Map(INGREDIENTS.map(i => [i.id, i]));
const MEAT_IDS = INGREDIENTS.filter(i => ['meat', 'seafood'].includes(i.category)).map(i => i.id);
const VEG_IDS = INGREDIENTS.filter(i => i.category === 'vegetable').map(i => i.id);
const SEASONING_IDS = INGREDIENTS.filter(i => ['seasoning', 'oil'].includes(i.category)).map(i => i.id);

// 菜谱模板库 - 用食材组合 × 做法 × 口味生成
const DISH_TEMPLATES = [
  // === 炒菜 (stir_fry) ===
  // 荤菜炒
  { name: '青椒炒鸡胸', nameEn: 'Stir-fried Chicken with Green Pepper', method: 'stir_fry', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'beginner', meat: true,
    ings: [['chicken_breast',250,'g'],['capsicum',150,'g'],['garlic',10,'g'],['soy_sauce',15,'ml'],['cooking_oil',15,'ml'],['starch',5,'g']],
    steps: ['鸡胸切片加酱油淀粉腌制10分钟','青椒切块','热锅下油爆香蒜末','放入鸡肉炒至变白','加入青椒大火翻炒','调味出锅'] },
  { name: '洋葱炒牛肉', nameEn: 'Beef with Onion Stir-fry', method: 'stir_fry', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'basic', meat: true,
    ings: [['beef_sirloin',250,'g'],['onion',200,'g'],['garlic',10,'g'],['soy_sauce',15,'ml'],['oyster_sauce',10,'ml'],['cooking_oil',15,'ml'],['starch',5,'g']],
    steps: ['牛肉切片加酱油淀粉腌制','洋葱切丝','热锅下油快炒牛肉至变色盛出','锅中炒洋葱至软','放回牛肉加蚝油翻炒均匀'] },
  { name: '蒜薹炒肉片', nameEn: 'Stir-fried Pork with Garlic Shoots', method: 'stir_fry', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'beginner', meat: true,
    ings: [['pork_mince',200,'g'],['celery',200,'g'],['garlic',10,'g'],['soy_sauce',15,'ml'],['cooking_oil',15,'ml']],
    steps: ['肉片加酱油腌制','芹菜切段','热锅下油炒肉至变色','加入芹菜大火翻炒','加盐调味出锅'] },
  { name: '鸡腿炒蘑菇', nameEn: 'Chicken Thigh with Mushroom Stir-fry', method: 'stir_fry', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'basic', meat: true,
    ings: [['chicken_thigh',300,'g'],['mushroom',200,'g'],['garlic',10,'g'],['oyster_sauce',15,'ml'],['soy_sauce',10,'ml'],['cooking_oil',15,'ml']],
    steps: ['鸡腿肉切块','蘑菇切片','热锅下油炒鸡肉至金黄','加蘑菇翻炒','加蚝油酱油调味出锅'] },
  { name: '辣炒虾仁', nameEn: 'Spicy Stir-fried Shrimp', method: 'stir_fry', region: 'sichuan', flavors: ['spicy','salty','umami'], diff: 'easy', level: 'basic', meat: true,
    ings: [['shrimp',250,'g'],['capsicum',100,'g'],['garlic',10,'g'],['ginger',5,'g'],['doubanjiang',15,'g'],['cooking_wine',10,'ml'],['cooking_oil',15,'ml']],
    steps: ['虾仁去虾线洗净沥干','热锅下油爆香姜蒜','加豆瓣酱炒出红油','放入虾仁快炒','加彩椒翻炒至虾变红','加料酒出锅'] },
  { name: '蚝油牛肉', nameEn: 'Oyster Sauce Beef', method: 'stir_fry', region: 'cantonese', flavors: ['salty','umami'], diff: 'medium', level: 'intermediate', meat: true,
    ings: [['beef_sirloin',300,'g'],['broccoli',200,'g'],['garlic',10,'g'],['oyster_sauce',20,'ml'],['soy_sauce',10,'ml'],['starch',10,'g'],['cooking_oil',20,'ml']],
    steps: ['牛肉切片加酱油淀粉腌制15分钟','西兰花焯水','热锅大火快炒牛肉至变色盛出','炒西兰花','放回牛肉加蚝油翻炒均匀'] },
  { name: '小炒黄牛肉', nameEn: 'Hunan-style Stir-fried Beef', method: 'stir_fry', region: 'hunan', flavors: ['spicy','salty'], diff: 'medium', level: 'intermediate', meat: true,
    ings: [['beef_sirloin',300,'g'],['capsicum',100,'g'],['celery',100,'g'],['garlic',10,'g'],['ginger',5,'g'],['doubanjiang',15,'g'],['soy_sauce',15,'ml'],['cooking_oil',20,'ml']],
    steps: ['牛肉切薄片加酱油腌制','芹菜彩椒切段','热锅大火爆炒牛肉至断生盛出','爆香姜蒜豆瓣酱','放入蔬菜翻炒','回锅牛肉大火收汁'] },
  { name: '豆芽炒肉丝', nameEn: 'Bean Sprouts with Shredded Pork', method: 'stir_fry', region: 'homestyle', flavors: ['salty','light'], diff: 'easy', level: 'beginner', meat: true,
    ings: [['pork_mince',150,'g'],['bean_sprouts',300,'g'],['spring_onion',15,'g'],['soy_sauce',10,'ml'],['cooking_oil',15,'ml']],
    steps: ['热锅下油炒散肉丝','加入豆芽大火翻炒','加酱油调味','撒葱花出锅'] },
  { name: '青椒肉丝', nameEn: 'Shredded Pork with Green Pepper', method: 'stir_fry', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'beginner', meat: true,
    ings: [['pork_mince',200,'g'],['capsicum',200,'g'],['garlic',5,'g'],['soy_sauce',15,'ml'],['starch',5,'g'],['cooking_oil',15,'ml']],
    steps: ['肉丝加酱油淀粉腌制','青椒切丝','热锅下油炒肉至变色','加入青椒大火翻炒','调味出锅'] },
  { name: '木须肉', nameEn: 'Moo Shu Pork', method: 'stir_fry', region: 'shandong', flavors: ['salty','umami'], diff: 'medium', level: 'basic', meat: true,
    ings: [['pork_mince',200,'g'],['egg',2,'piece'],['mushroom',100,'g'],['cucumber',100,'g'],['spring_onion',15,'g'],['soy_sauce',15,'ml'],['cooking_oil',20,'ml']],
    steps: ['鸡蛋炒散盛出','肉片炒至变色','加蘑菇黄瓜翻炒','回锅鸡蛋','加酱油调味出锅'] },
  // 素菜炒
  { name: '蒜蓉炒菠菜', nameEn: 'Garlic Spinach Stir-fry', method: 'stir_fry', region: 'homestyle', flavors: ['light','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['spinach',300,'g'],['garlic',15,'g'],['cooking_oil',10,'ml']],
    steps: ['菠菜洗净切段','热锅下油爆香蒜末','放入菠菜大火翻炒至断生','加盐调味出锅'] },
  { name: '素炒三丝', nameEn: 'Three-shredded Vegetable Stir-fry', method: 'stir_fry', region: 'homestyle', flavors: ['light','salty'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['potato',150,'g'],['carrot',100,'g'],['capsicum',100,'g'],['garlic',5,'g'],['cooking_oil',15,'ml'],['vinegar',5,'ml']],
    steps: ['土豆胡萝卜彩椒切丝','土豆丝泡水去淀粉','热锅下油爆香蒜','放入三丝大火翻炒','加醋和盐调味出锅'] },
  { name: '清炒西葫芦', nameEn: 'Stir-fried Zucchini', method: 'stir_fry', region: 'homestyle', flavors: ['light','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['zucchini',300,'g'],['garlic',10,'g'],['cooking_oil',10,'ml']],
    steps: ['西葫芦切半圆片','热锅下油爆香蒜末','放入西葫芦翻炒至软','加盐调味出锅'] },
  { name: '蒜蓉茄子', nameEn: 'Garlic Eggplant', method: 'stir_fry', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'basic', meat: false,
    ings: [['eggplant',300,'g'],['garlic',15,'g'],['soy_sauce',10,'ml'],['oyster_sauce',10,'ml'],['cooking_oil',20,'ml']],
    steps: ['茄子切条','热锅多油煎至软','加蒜末爆香','加酱油蚝油翻炒','出锅'] },
  { name: '炒豆芽', nameEn: 'Stir-fried Bean Sprouts', method: 'stir_fry', region: 'homestyle', flavors: ['light','salty'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['bean_sprouts',400,'g'],['spring_onion',15,'g'],['vinegar',10,'ml'],['cooking_oil',10,'ml']],
    steps: ['豆芽洗净沥干','热锅下油大火翻炒','加醋和盐','撒葱花出锅'] },
  { name: '香菇炒白菜', nameEn: 'Mushroom & Chinese Cabbage Stir-fry', method: 'stir_fry', region: 'homestyle', flavors: ['light','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['chinese_cabbage',300,'g'],['mushroom',150,'g'],['garlic',10,'g'],['oyster_sauce',10,'ml'],['cooking_oil',10,'ml']],
    steps: ['白菜切块蘑菇切片','热锅下油爆香蒜末','放入蘑菇炒至出水','加白菜翻炒','加蚝油调味出锅'] },
  { name: '番茄炒花菜', nameEn: 'Tomato & Cauliflower Stir-fry', method: 'stir_fry', region: 'homestyle', flavors: ['sour','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['tomato',200,'g'],['broccoli',250,'g'],['garlic',5,'g'],['cooking_oil',10,'ml'],['sugar',5,'g']],
    steps: ['花菜掰小朵焯水','番茄切块','热锅下油炒番茄出汁','加花菜翻炒','加糖盐调味出锅'] },
  { name: '清炒玉米粒', nameEn: 'Stir-fried Sweet Corn', method: 'stir_fry', region: 'homestyle', flavors: ['sweet','light'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['corn',300,'g'],['carrot',50,'g'],['spring_onion',10,'g'],['cooking_oil',10,'ml']],
    steps: ['玉米剥粒胡萝卜切丁','热锅下油翻炒玉米和胡萝卜','加少许水焖2分钟','加盐调味撒葱花'] },

  // === 红烧/卤 (braise) ===
  { name: '红烧鸡翅', nameEn: 'Braised Chicken Wings', method: 'braise', region: 'homestyle', flavors: ['sweet','salty','umami'], diff: 'easy', level: 'basic', meat: true,
    ings: [['chicken_thigh',400,'g'],['ginger',10,'g'],['spring_onion',15,'g'],['soy_sauce',30,'ml'],['sugar',15,'g'],['cooking_wine',15,'ml'],['cooking_oil',10,'ml']],
    steps: ['鸡翅两面划刀','热锅下油煎至两面金黄','加姜葱爆香','加酱油糖料酒和水','大火烧开转小火焖15分钟','大火收汁'] },
  { name: '红烧豆腐', nameEn: 'Braised Tofu', method: 'braise', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['tofu',400,'g'],['spring_onion',15,'g'],['garlic',10,'g'],['soy_sauce',20,'ml'],['oyster_sauce',10,'ml'],['starch',5,'g'],['cooking_oil',15,'ml']],
    steps: ['豆腐切块','热锅下油煎至两面金黄','加蒜末爆香','加酱油蚝油和水','小火焖5分钟','水淀粉勾芡撒葱花'] },
  { name: '红烧排骨', nameEn: 'Braised Spare Ribs', method: 'braise', region: 'homestyle', flavors: ['sweet','salty','umami'], diff: 'medium', level: 'intermediate', meat: true,
    ings: [['pork_belly',500,'g'],['ginger',10,'g'],['spring_onion',15,'g'],['soy_sauce',30,'ml'],['sugar',20,'g'],['cooking_wine',20,'ml'],['cooking_oil',10,'ml']],
    steps: ['排骨切段焯水','热锅炒糖色','放入排骨翻炒上色','加料酒酱油姜葱','加水没过排骨','大火烧开转小火炖40分钟','大火收汁'] },
  { name: '卤牛肉', nameEn: 'Braised Beef in Soy Sauce', method: 'braise', region: 'shandong', flavors: ['salty','umami'], diff: 'medium', level: 'intermediate', meat: true,
    ings: [['beef_sirloin',500,'g'],['ginger',15,'g'],['spring_onion',20,'g'],['soy_sauce',40,'ml'],['sugar',10,'g'],['cooking_wine',20,'ml']],
    steps: ['牛肉冷水焯水','锅中放水加姜葱料酒酱油糖','放入牛肉大火烧开','转小火卤1小时','关火浸泡30分钟','切片装盘'] },
  { name: '酱焖鸡腿', nameEn: 'Braised Chicken Legs in Sauce', method: 'braise', region: 'dongbei', flavors: ['salty','sweet','umami'], diff: 'easy', level: 'basic', meat: true,
    ings: [['chicken_thigh',500,'g'],['potato',200,'g'],['ginger',10,'g'],['soy_sauce',30,'ml'],['sugar',10,'g'],['cooking_wine',15,'ml'],['cooking_oil',10,'ml']],
    steps: ['鸡腿切块焯水','土豆切块','热锅下油炒鸡块至金黄','加姜葱酱油糖料酒','加水烧开转小火','加土豆炖20分钟','大火收汁'] },
  { name: '红烧茄子', nameEn: 'Braised Eggplant', method: 'braise', region: 'homestyle', flavors: ['salty','sweet','umami'], diff: 'easy', level: 'basic', meat: false,
    ings: [['eggplant',400,'g'],['garlic',15,'g'],['soy_sauce',20,'ml'],['sugar',10,'g'],['starch',5,'g'],['cooking_oil',30,'ml']],
    steps: ['茄子切条','多油煎至软盛出','留底油爆香蒜末','加酱油糖和少量水','放回茄子焖3分钟','水淀粉勾芡'] },
  { name: '啤酒鸭', nameEn: 'Beer-braised Duck Style Chicken', method: 'braise', region: 'hunan', flavors: ['salty','umami'], diff: 'medium', level: 'intermediate', meat: true,
    ings: [['chicken_thigh',500,'g'],['potato',200,'g'],['ginger',15,'g'],['spring_onion',15,'g'],['soy_sauce',30,'ml'],['cooking_wine',30,'ml'],['sugar',10,'g'],['cooking_oil',15,'ml']],
    steps: ['鸡腿切块焯水','热锅下油炒鸡块','加姜葱爆香','加酱油料酒糖翻炒','加水和土豆块','大火烧开转小火炖30分钟','大火收汁'] },

  // === 炖/煲 (stew) ===
  { name: '胡萝卜炖牛肉', nameEn: 'Beef & Carrot Stew', method: 'stew', region: 'homestyle', flavors: ['salty','umami'], diff: 'medium', level: 'basic', meat: true,
    ings: [['beef_sirloin',400,'g'],['carrot',200,'g'],['potato',200,'g'],['ginger',10,'g'],['soy_sauce',20,'ml'],['cooking_wine',15,'ml'],['cooking_oil',10,'ml']],
    steps: ['牛肉切块焯水','热锅下油炒牛肉','加姜片酱油料酒','加水没过肉大火烧开','转小火炖40分钟','加胡萝卜土豆再炖20分钟','加盐调味'] },
  { name: '鸡腿炖土豆', nameEn: 'Braised Chicken with Potato', method: 'stew', region: 'dongbei', flavors: ['salty','umami'], diff: 'easy', level: 'basic', meat: true,
    ings: [['chicken_thigh',400,'g'],['potato',300,'g'],['ginger',10,'g'],['spring_onion',15,'g'],['soy_sauce',20,'ml'],['cooking_wine',15,'ml'],['cooking_oil',10,'ml']],
    steps: ['鸡腿切块焯水','热锅下油炒鸡块','加姜葱酱油料酒','加水和土豆块','大火烧开转小火炖25分钟','大火收汁'] },
  { name: '猪肉炖白菜', nameEn: 'Pork & Chinese Cabbage Stew', method: 'stew', region: 'dongbei', flavors: ['light','umami'], diff: 'easy', level: 'beginner', meat: true,
    ings: [['pork_belly',300,'g'],['chinese_cabbage',400,'g'],['ginger',10,'g'],['spring_onion',10,'g'],['cooking_wine',10,'ml'],['cooking_oil',10,'ml']],
    steps: ['五花肉切片','白菜切块','热锅下油炒肉片','加白菜翻炒','加水和姜片','小火炖15分钟','加盐调味'] },
  { name: '咖喱鸡块', nameEn: 'Chicken Curry', method: 'stew', region: 'homestyle', flavors: ['spicy','umami'], diff: 'easy', level: 'basic', meat: true,
    ings: [['chicken_thigh',400,'g'],['potato',200,'g'],['carrot',100,'g'],['onion',100,'g'],['cooking_oil',15,'ml']],
    steps: ['鸡腿切块焯水','土豆胡萝卜切块洋葱切丝','热锅下油炒鸡块','加洋葱炒香','加水和蔬菜','小火炖20分钟','加盐调味'] },
  { name: '白菜豆腐煲', nameEn: 'Chinese Cabbage & Tofu Casserole', method: 'stew', region: 'cantonese', flavors: ['light','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['chinese_cabbage',300,'g'],['tofu',300,'g'],['mushroom',100,'g'],['ginger',5,'g'],['sesame_oil',5,'ml'],['cooking_oil',10,'ml']],
    steps: ['白菜切块豆腐切块蘑菇切片','锅中加油炒白菜','加水和豆腐蘑菇','小火煮10分钟','加盐和麻油调味'] },
  { name: '番茄炖牛腩', nameEn: 'Tomato Braised Beef Brisket', method: 'stew', region: 'homestyle', flavors: ['sour','umami'], diff: 'medium', level: 'intermediate', meat: true,
    ings: [['beef_sirloin',500,'g'],['tomato',400,'g'],['onion',100,'g'],['ginger',10,'g'],['soy_sauce',15,'ml'],['sugar',10,'g'],['cooking_oil',15,'ml']],
    steps: ['牛腩切块焯水','番茄切块','热锅下油炒牛腩','加姜片洋葱爆香','加番茄炒出汁','加水和酱油糖','大火烧开小火炖1小时'] },

  // === 蒸 (steam) ===
  { name: '蒸肉饼', nameEn: 'Steamed Pork Patty', method: 'steam', region: 'cantonese', flavors: ['salty','umami'], diff: 'easy', level: 'beginner', meat: true,
    ings: [['pork_mince',300,'g'],['spring_onion',15,'g'],['ginger',5,'g'],['soy_sauce',15,'ml'],['starch',10,'g'],['sesame_oil',5,'ml']],
    steps: ['肉末加酱油淀粉麻油姜末搅拌均匀','压成饼状放盘中','水烧开蒸15分钟','撒葱花出锅'] },
  { name: '蒸鸡蛋豆腐', nameEn: 'Steamed Egg with Tofu', method: 'steam', region: 'cantonese', flavors: ['light','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['egg',3,'piece'],['tofu',200,'g'],['spring_onion',10,'g'],['soy_sauce',10,'ml'],['sesame_oil',5,'ml']],
    steps: ['豆腐切薄片铺盘底','鸡蛋打散加温水和少许盐','蛋液过筛倒入盘中','水烧开后中火蒸10分钟','淋酱油麻油撒葱花'] },
  { name: '豆豉蒸排骨', nameEn: 'Steamed Ribs with Black Bean', method: 'steam', region: 'cantonese', flavors: ['salty','umami'], diff: 'medium', level: 'basic', meat: true,
    ings: [['pork_belly',400,'g'],['garlic',10,'g'],['ginger',5,'g'],['soy_sauce',15,'ml'],['starch',10,'g'],['cooking_oil',10,'ml'],['sugar',5,'g']],
    steps: ['排骨切段洗净沥干','加酱油蒜末姜末淀粉糖拌匀','腌制20分钟','放入盘中铺平','水烧开大火蒸20分钟'] },
  { name: '蒸南瓜', nameEn: 'Steamed Pumpkin', method: 'steam', region: 'homestyle', flavors: ['sweet','light'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['sweet_potato',400,'g']],
    steps: ['红薯去皮切块','放入蒸锅','大火蒸20分钟至软','取出装盘'] },
  { name: '清蒸鲈鱼风味', nameEn: 'Steamed Fish Cantonese Style', method: 'steam', region: 'cantonese', flavors: ['light','umami'], diff: 'medium', level: 'intermediate', meat: true,
    ings: [['salmon_fillet',400,'g'],['ginger',15,'g'],['spring_onion',20,'g'],['soy_sauce',20,'ml'],['cooking_oil',15,'ml'],['sesame_oil',5,'ml']],
    steps: ['鱼身铺姜丝','水烧开蒸8分钟','倒掉蒸出的水','铺葱丝','热油淋上','浇酱油和麻油'] },

  // === 煎/炸 (deep_fry) ===
  { name: '香煎豆腐', nameEn: 'Pan-fried Tofu', method: 'deep_fry', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['tofu',400,'g'],['spring_onion',15,'g'],['soy_sauce',15,'ml'],['cooking_oil',20,'ml']],
    steps: ['豆腐切厚片','平底锅加油中火煎至两面金黄','淋酱油','撒葱花出锅'] },
  { name: '煎蛋角', nameEn: 'Fried Egg Dumplings', method: 'deep_fry', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'basic', meat: true,
    ings: [['egg',4,'piece'],['pork_mince',150,'g'],['spring_onion',15,'g'],['soy_sauce',10,'ml'],['cooking_oil',20,'ml']],
    steps: ['肉末加酱油葱花拌成馅','小火煎一勺蛋液成圆片','放少许馅对折','煎至两面金黄','加少许水焖2分钟'] },
  { name: '椒盐虾', nameEn: 'Salt and Pepper Shrimp', method: 'deep_fry', region: 'cantonese', flavors: ['salty','spicy'], diff: 'medium', level: 'intermediate', meat: true,
    ings: [['shrimp',300,'g'],['garlic',10,'g'],['capsicum',50,'g'],['spring_onion',15,'g'],['starch',15,'g'],['cooking_oil',30,'ml']],
    steps: ['虾去虾线裹淀粉','油温七成热炸至金黄','锅留底油爆香蒜末','加炸虾和彩椒翻炒','撒盐和椒粉出锅'] },
  { name: '香煎鸡胸肉', nameEn: 'Pan-seared Chicken Breast', method: 'deep_fry', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'beginner', meat: true,
    ings: [['chicken_breast',300,'g'],['soy_sauce',15,'ml'],['cooking_oil',15,'ml'],['ginger',5,'g']],
    steps: ['鸡胸肉切厚片加酱油腌15分钟','平底锅加油中火','放入鸡胸肉煎3分钟','翻面煎3分钟','切片装盘'] },
  { name: '煎饺风味', nameEn: 'Pan-fried Dumplings Style', method: 'deep_fry', region: 'dongbei', flavors: ['salty','umami'], diff: 'medium', level: 'basic', meat: true,
    ings: [['pork_mince',200,'g'],['chinese_cabbage',200,'g'],['spring_onion',15,'g'],['ginger',5,'g'],['soy_sauce',15,'ml'],['cooking_oil',20,'ml'],['starch',10,'g']],
    steps: ['白菜切碎加盐挤水','和肉末姜葱酱油拌成馅','用淀粉水和面皮包好','平底锅加油摆放','加水盖盖焖5分钟','开盖煎至底部金黄'] },

  // === 干锅 (dry_pot) ===
  { name: '干锅鸡', nameEn: 'Dry Pot Chicken', method: 'dry_pot', region: 'sichuan', flavors: ['spicy','salty','umami'], diff: 'medium', level: 'intermediate', meat: true,
    ings: [['chicken_thigh',400,'g'],['potato',200,'g'],['capsicum',100,'g'],['garlic',10,'g'],['ginger',10,'g'],['doubanjiang',20,'g'],['soy_sauce',15,'ml'],['cooking_oil',20,'ml']],
    steps: ['鸡腿切块加料酒腌制','土豆切片炸至微黄','热锅下油爆香姜蒜豆瓣酱','放入鸡块炒至金黄','加土豆片和彩椒','大火翻炒收汁'] },
  { name: '干锅土豆片', nameEn: 'Dry Pot Potato Slices', method: 'dry_pot', region: 'sichuan', flavors: ['spicy','salty'], diff: 'easy', level: 'basic', meat: false,
    ings: [['potato',400,'g'],['capsicum',100,'g'],['garlic',10,'g'],['doubanjiang',15,'g'],['spring_onion',10,'g'],['cooking_oil',25,'ml']],
    steps: ['土豆切薄片泡水去淀粉','热锅多油炸至微黄','倒出多余油','爆香蒜末和豆瓣酱','放入土豆片和彩椒翻炒','撒葱花出锅'] },
  { name: '干锅虾', nameEn: 'Dry Pot Shrimp', method: 'dry_pot', region: 'hunan', flavors: ['spicy','salty','umami'], diff: 'medium', level: 'intermediate', meat: true,
    ings: [['shrimp',300,'g'],['potato',150,'g'],['capsicum',100,'g'],['garlic',10,'g'],['ginger',5,'g'],['doubanjiang',15,'g'],['cooking_oil',25,'ml']],
    steps: ['虾去虾线','土豆切片炸至微黄','热锅下油煎虾至变红','加姜蒜豆瓣酱爆香','放入土豆片和彩椒','大火翻炒出锅'] },
  { name: '干锅菜花', nameEn: 'Dry Pot Cauliflower', method: 'dry_pot', region: 'sichuan', flavors: ['spicy','salty'], diff: 'easy', level: 'basic', meat: false,
    ings: [['broccoli',400,'g'],['pork_belly',100,'g'],['garlic',10,'g'],['doubanjiang',15,'g'],['soy_sauce',10,'ml'],['cooking_oil',15,'ml']],
    steps: ['花菜掰小朵','五花肉切薄片','热锅煸五花肉出油','加蒜末和豆瓣酱','放入花菜大火翻炒','加酱油调味出锅'] },

  // === 烤/焗 (roast) ===
  { name: '烤鸡腿', nameEn: 'Roasted Chicken Leg', method: 'roast', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'beginner', meat: true,
    ings: [['chicken_thigh',500,'g'],['soy_sauce',20,'ml'],['ginger',10,'g'],['cooking_oil',10,'ml'],['sugar',5,'g']],
    steps: ['鸡腿划刀加酱油姜糖腌制30分钟','烤箱预热200度','放入烤盘','烤25-30分钟至金黄','翻面刷酱油再烤10分钟'] },
  { name: '锡纸烤蔬菜', nameEn: 'Foil-baked Vegetables', method: 'roast', region: 'homestyle', flavors: ['light','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['potato',200,'g'],['carrot',100,'g'],['broccoli',150,'g'],['capsicum',100,'g'],['cooking_oil',15,'ml'],['garlic',5,'g']],
    steps: ['蔬菜切块','加油和蒜末拌匀','铺在锡纸上包好','烤箱200度烤20分钟'] },
  { name: '芝士焗土豆', nameEn: 'Cheese Baked Potato', method: 'roast', region: 'homestyle', flavors: ['salty','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['potato',400,'g'],['cheese',80,'g'],['milk',50,'ml'],['cooking_oil',5,'ml']],
    steps: ['土豆蒸熟压成泥','加牛奶拌匀','放入烤碗铺上芝士','烤箱200度烤10分钟至芝士融化'] },

  // === 煮/汆 (boil) ===
  { name: '水煮肉片', nameEn: 'Sichuan Boiled Pork Slices', method: 'boil', region: 'sichuan', flavors: ['spicy','salty','umami'], diff: 'medium', level: 'intermediate', meat: true,
    ings: [['pork_mince',300,'g'],['bean_sprouts',200,'g'],['spinach',100,'g'],['garlic',10,'g'],['doubanjiang',20,'g'],['soy_sauce',15,'ml'],['starch',10,'g'],['cooking_oil',30,'ml']],
    steps: ['肉片加酱油淀粉腌制','豆芽菠菜焯水铺碗底','锅中炒豆瓣酱加水烧开','放入肉片煮至变色','连汤倒在蔬菜上','热油浇上蒜末'] },
  { name: '水煮白菜', nameEn: 'Boiled Chinese Cabbage', method: 'boil', region: 'homestyle', flavors: ['light','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['chinese_cabbage',400,'g'],['garlic',10,'g'],['soy_sauce',10,'ml'],['sesame_oil',5,'ml'],['cooking_oil',5,'ml']],
    steps: ['白菜洗净切段','水烧开放入白菜煮2分钟','捞出沥干','浇上蒜末酱油麻油','热油淋上'] },
  { name: '白灼时蔬', nameEn: 'Blanched Seasonal Vegetables', method: 'boil', region: 'cantonese', flavors: ['light','umami'], diff: 'easy', level: 'beginner', meat: false,
    ings: [['bok_choy',300,'g'],['garlic',10,'g'],['oyster_sauce',15,'ml'],['cooking_oil',10,'ml']],
    steps: ['水烧开加少许油和盐','放入小白菜焯1分钟','捞出摆盘','浇上蒜末和蚝油','热油淋上'] },
];

// 生成更多变体
function generateVariants() {
  const variants = [];
  const usedNames = new Set(DISH_TEMPLATES.map(t => t.name));

  // 肉类 × 蔬菜的炒菜组合
  const meats = [
    { id: 'chicken_breast', zh: '鸡胸', en: 'Chicken Breast' },
    { id: 'chicken_thigh', zh: '鸡腿', en: 'Chicken Thigh' },
    { id: 'pork_mince', zh: '肉末', en: 'Pork Mince' },
    { id: 'pork_belly', zh: '五花肉', en: 'Pork Belly' },
    { id: 'beef_sirloin', zh: '牛肉', en: 'Beef' },
    { id: 'beef_mince', zh: '牛肉末', en: 'Beef Mince' },
    { id: 'lamb_leg', zh: '羊肉', en: 'Lamb' },
    { id: 'shrimp', zh: '虾仁', en: 'Shrimp' },
    { id: 'salmon_fillet', zh: '三文鱼', en: 'Salmon' },
  ];
  const vegs = [
    { id: 'broccoli', zh: '西兰花', en: 'Broccoli' },
    { id: 'bok_choy', zh: '小白菜', en: 'Bok Choy' },
    { id: 'chinese_cabbage', zh: '大白菜', en: 'Chinese Cabbage' },
    { id: 'tomato', zh: '番茄', en: 'Tomato' },
    { id: 'capsicum', zh: '彩椒', en: 'Capsicum' },
    { id: 'carrot', zh: '胡萝卜', en: 'Carrot' },
    { id: 'mushroom', zh: '蘑菇', en: 'Mushroom' },
    { id: 'spinach', zh: '菠菜', en: 'Spinach' },
    { id: 'eggplant', zh: '茄子', en: 'Eggplant' },
    { id: 'potato', zh: '土豆', en: 'Potato' },
    { id: 'corn', zh: '玉米', en: 'Corn' },
    { id: 'green_bean', zh: '四季豆', en: 'Green Beans' },
    { id: 'celery', zh: '芹菜', en: 'Celery' },
    { id: 'zucchini', zh: '西葫芦', en: 'Zucchini' },
    { id: 'bean_sprouts', zh: '豆芽', en: 'Bean Sprouts' },
    { id: 'cucumber', zh: '黄瓜', en: 'Cucumber' },
    { id: 'onion', zh: '洋葱', en: 'Onion' },
    { id: 'sweet_potato', zh: '红薯', en: 'Sweet Potato' },
  ];

  const methods = [
    { method: 'stir_fry', prefix: '炒', enPrefix: 'Stir-fried', steps: ['切好食材','热锅下油爆香蒜末','放入主料翻炒至变色','加入配菜大火翻炒','加酱油盐调味出锅'] },
    { method: 'braise', prefix: '红烧', enPrefix: 'Braised', steps: ['食材切块','热锅下油煎至两面金黄','加酱油糖料酒','加水小火焖15分钟','大火收汁出锅'] },
    { method: 'stew', prefix: '炖', enPrefix: 'Stewed', steps: ['食材切块焯水','热锅下油翻炒','加姜葱酱油','加水大火烧开','转小火炖30分钟加盐调味'] },
    { method: 'steam', prefix: '蒸', enPrefix: 'Steamed', steps: ['食材处理好放入盘中','加调料腌制','水烧开后蒸15分钟','取出淋酱油麻油'] },
  ];

  const regions = ['homestyle','homestyle','homestyle','sichuan','cantonese','hunan','dongbei','shandong','jiangsu','zhejiang'];
  const flavorSets = [['salty','umami'],['spicy','salty'],['sweet','salty'],['light','umami'],['sour','salty']];
  const diffs = ['easy','easy','easy','medium','medium','hard'];
  const levels = ['beginner','beginner','basic','basic','intermediate','intermediate'];

  let idx = 0;

  // 荤菜组合
  for (const meat of meats) {
    for (const veg of vegs) {
      for (const m of methods) {
        const name = `${m.prefix}${meat.zh}${veg.zh}`;
        if (usedNames.has(name) || variants.length >= 250) continue;
        usedNames.add(name);

        const r = idx % regions.length;
        const f = idx % flavorSets.length;
        const d = idx % diffs.length;

        variants.push({
          id: `gen_${meat.id}_${veg.id}_${m.method}`,
          nameZh: name,
          nameEn: `${m.enPrefix} ${meat.en} with ${veg.en}`,
          cuisine: 'chinese',
          regionalCuisine: regions[r],
          cookingMethod: m.method,
          flavors: flavorSets[f],
          mealTypes: ['lunch', 'dinner'],
          difficulty: diffs[d],
          minCookingLevel: levels[d],
          prepTime: 10,
          cookTime: m.method === 'stew' ? 40 : m.method === 'steam' ? 15 : m.method === 'braise' ? 25 : 10,
          servings: 2,
          ingredients: [
            { ingredientId: meat.id, amount: 250, unit: 'g' },
            { ingredientId: veg.id, amount: 200, unit: 'g' },
            { ingredientId: 'garlic', amount: 10, unit: 'g' },
            { ingredientId: 'soy_sauce', amount: 15, unit: 'ml' },
            { ingredientId: 'cooking_oil', amount: 15, unit: 'ml' },
          ],
          steps: m.steps,
          tags: ['家常菜'],
          status: 'reviewed',
          source: 'generated',
        });
        idx++;
      }
    }
  }

  return variants;
}

// ============================================================
// Part 2: 合并所有数据
// ============================================================

function merge() {
  // 手工模板
  const templates = DISH_TEMPLATES.map((t, i) => ({
    id: `tmpl_${t.name.replace(/\s/g, '_')}_${i}`,
    nameZh: t.name,
    nameEn: t.nameEn,
    cuisine: 'chinese',
    regionalCuisine: t.region,
    cookingMethod: t.method,
    flavors: t.flavors,
    mealTypes: ['lunch', 'dinner'],
    difficulty: t.diff,
    minCookingLevel: t.level,
    prepTime: 10,
    cookTime: t.method === 'stew' ? 40 : t.method === 'steam' ? 15 : t.method === 'braise' ? 25 : 10,
    servings: t.ings.find(i => i[0].includes('meat') || i[0].includes('chicken') || i[0].includes('beef') || i[0].includes('pork') || i[0].includes('lamb') || i[0].includes('shrimp') || i[0].includes('salmon')) ? 2 : 2,
    ingredients: t.ings.map(([id, amount, unit]) => ({ ingredientId: id, amount, unit })),
    steps: t.steps,
    tags: [t.meat ? '荤菜' : '素菜', '家常菜'],
    status: 'reviewed',
    source: 'template',
  }));

  const variants = generateVariants();

  // 加载现有文件
  const existingFiles = ['recipes.json', 'recipes-chinese-1.json', 'recipes-international.json', 'recipes-hot-1.json', 'recipes-hot-2.json', 'recipes-hot-3.json'];
  const existingRecipes = [];
  for (const file of existingFiles) {
    const fp = path.join(DATA_DIR, file);
    if (!fs.existsSync(fp)) continue;
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    for (const r of data) {
      if (!r.status) r.status = 'reviewed';
      if (!r.source) r.source = file.replace('.json', '');
      existingRecipes.push(r);
    }
  }

  // 合并: 现有 + 模板 + 变体
  const all = [...existingRecipes, ...templates, ...variants];

  // 去重
  const seenIds = new Set();
  const seenNames = new Set();
  const final = [];
  let dupeId = 0, dupeName = 0;

  for (const r of all) {
    if (seenIds.has(r.id)) { dupeId++; continue; }
    if (seenNames.has(r.nameZh)) { dupeName++; continue; }
    seenIds.add(r.id);
    seenNames.add(r.nameZh);

    // 补 cookingMethod
    if (!r.cookingMethod) {
      const text = (r.nameZh || '') + ' ' + (r.steps || []).join(' ');
      if (/干锅|铁板/.test(text)) r.cookingMethod = 'dry_pot';
      else if (/凉拌|拌/.test(text)) r.cookingMethod = 'cold_dish';
      else if (/汤|羹/.test(text)) r.cookingMethod = 'soup';
      else if (/蒸/.test(text)) r.cookingMethod = 'steam';
      else if (/炖|煲|焖/.test(text)) r.cookingMethod = 'stew';
      else if (/红烧|卤|烧/.test(text)) r.cookingMethod = 'braise';
      else if (/烤|焗/.test(text)) r.cookingMethod = 'roast';
      else if (/炸|煎/.test(text)) r.cookingMethod = 'deep_fry';
      else if (/汆|水煮|煮/.test(text)) r.cookingMethod = 'boil';
      else if (/粥|饭|面|饼/.test(text)) r.cookingMethod = 'staple';
      else r.cookingMethod = 'stir_fry';
    }

    final.push(r);
  }

  // 写入
  fs.writeFileSync(path.join(DATA_DIR, 'recipes-all.json'), JSON.stringify(final, null, 2));

  // 统计
  const meatCats = new Set(['meat', 'seafood']);
  let hotDish = 0, chinese = 0, meatDish = 0, vegDish = 0;
  const methodCount = {};
  const regionCount = {};

  for (const r of final) {
    if (!['cold_dish','soup','staple'].includes(r.cookingMethod)) {
      hotDish++;
      const hasMeat = r.ingredients.some(ri => {
        const ing = ING_MAP.get(ri.ingredientId);
        return ing && meatCats.has(ing.category);
      });
      if (hasMeat) meatDish++; else vegDish++;
    }
    if (r.cuisine === 'chinese') chinese++;
    methodCount[r.cookingMethod] = (methodCount[r.cookingMethod] || 0) + 1;
    regionCount[r.regionalCuisine] = (regionCount[r.regionalCuisine] || 0) + 1;
  }

  console.log('\n========== 合并结果 ==========');
  console.log(`总菜谱: ${final.length} (去重ID: ${dupeId}, 去重菜名: ${dupeName})`);
  console.log(`中餐: ${chinese} (${Math.round(chinese/final.length*100)}%)`);
  console.log(`热菜: ${hotDish} (${Math.round(hotDish/final.length*100)}%) | 荤: ${meatDish} 素: ${vegDish}`);
  console.log(`做法:`, methodCount);
  console.log(`地域:`, regionCount);

  // 检查缺失食材
  const missingIngs = new Set();
  for (const r of final) {
    for (const ri of r.ingredients) {
      if (!ING_MAP.has(ri.ingredientId)) missingIngs.add(ri.ingredientId);
    }
  }
  if (missingIngs.size > 0) {
    console.log(`\n⚠ 缺失食材: ${[...missingIngs].join(', ')}`);
  } else {
    console.log('\n✅ 食材全部完整');
  }

  console.log(`\n✅ 已写入 recipes-all.json`);
}

merge();
