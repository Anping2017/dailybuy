// Recipes index 90-179
const I = (id, amount, unit) => ({ ingredientId: id, amount, unit });

module.exports = {
  // 90 胡萝卜炒肉丝
  carrot_pork_shred: {
    ingredients: [I('carrot',300,'g'), I('pork_loin',200,'g'), I('garlic',10,'g'), I('chili_pepper',5,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',5,'g'), I('salt',2,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '猪里脊200g切细丝，加5ml生抽、10ml料酒、5g淀粉抓匀腌10分钟',
      '胡萝卜300g去皮切0.3cm细丝',
      '热锅下15ml油烧热，下肉丝滑炒至变色盛出',
      '锅中加5ml油下蒜片干辣椒爆香',
      '下胡萝卜丝大火翻炒2分钟至变软出甜味',
      '回锅肉丝，加10ml生抽、2g盐翻炒1分钟出锅'
    ]
  },
  // 91 玉米炒肉丁
  corn_pork_dice: {
    ingredients: [I('corn',300,'g'), I('pork_loin',200,'g'), I('cucumber',100,'g'), I('carrot',60,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',20,'ml'), I('salt',2,'g')],
    steps: [
      '猪里脊200g切1.5cm丁，加5ml生抽、10ml料酒、5g淀粉抓匀腌10分钟',
      '玉米剥粒；黄瓜胡萝卜切1cm丁',
      '锅中烧水，玉米粒、胡萝卜丁焯1分钟过冷水沥干',
      '热锅下15ml油烧热，下肉丁滑炒至变色盛出',
      '锅留油下蒜片爆香，下玉米胡萝卜翻炒1分钟',
      '下黄瓜丁、肉丁，加10ml生抽、2g盐翻炒30秒，3g淀粉勾薄芡出锅'
    ]
  },
  // 92 葱油蒸鸡胸
  scallion_oil_steamed_chicken: {
    ingredients: [I('chicken_breast',300,'g'), I('spring_onion',30,'g'), I('ginger',15,'g'), I('cooking_wine',10,'ml'), I('salt',3,'g'), I('light_soy',20,'ml'), I('sugar',5,'g'), I('cooking_oil',30,'ml'), I('white_pepper',2,'g')],
    steps: [
      '鸡胸肉300g切1.5cm厚片，用刀背轻拍松软',
      '鸡胸用10ml料酒、姜片、3g盐、2g白胡椒抓匀腌15分钟',
      '蒸盘铺姜片葱段，鸡肉单层平铺，蒸锅水开后大火蒸10分钟',
      '蒸好的鸡肉倒掉多余汁水',
      '葱白切丝、葱绿切碎铺在鸡肉上，淋20ml生抽、5g糖',
      '锅中烧30ml油至冒烟，淋在葱丝上激出葱香即可上桌'
    ]
  },
  // 93 白菜豆腐煲
  cabbage_tofu_pot: {
    ingredients: [I('chinese_cabbage',400,'g'), I('tofu',300,'g'), I('vermicelli',60,'g'), I('shrimp',50,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('salt',3,'g'), I('cooking_oil',20,'ml'), I('white_pepper',2,'g'), I('sesame_oil',5,'ml')],
    steps: [
      '白菜400g洗净切大块；豆腐300g切2cm方块；粉丝60g温水泡软',
      '虾皮50g（用虾米代）温水泡5分钟去腥；蒜切末',
      '砂锅下20ml油下蒜末虾皮爆香',
      '下白菜帮翻炒2分钟，下白菜叶翻炒30秒',
      '加豆腐、500ml热水、15ml生抽、3g盐煮开',
      '中小火炖10分钟，下粉丝再煮5分钟，加2g白胡椒淋5ml香油上桌'
    ]
  },
  // 94 红薯炖鸡块
  sweet_potato_chicken_stew: {
    ingredients: [I('chicken_thigh',400,'g'), I('sweet_potato',300,'g'), I('ginger',15,'g'), I('garlic',10,'g'), I('light_soy',20,'ml'), I('dark_soy',5,'ml'), I('cooking_wine',15,'ml'), I('rock_sugar',15,'g'), I('star_anise',1,'piece'), I('cooking_oil',20,'ml')],
    steps: [
      '鸡腿肉400g剁3cm块，焯水3分钟去血沫',
      '红薯300g去皮切3cm滚刀块',
      '热锅下20ml油下15g冰糖小火炒糖色至枣红',
      '下鸡块翻炒上色，下姜蒜八角爆香',
      '加20ml生抽、5ml老抽、15ml料酒翻炒，加热水没过鸡块',
      '大火煮开转小火炖20分钟，下红薯继续炖15分钟，大火收汁出锅'
    ]
  },
  // 95 蒜炒菠菜
  homestyle_stir_fried_spinach: {
    ingredients: [I('spinach',400,'g'), I('garlic',20,'g'), I('chili_pepper',5,'g'), I('salt',3,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '菠菜400g择洗，切4cm段（菠菜根部留1cm更香）',
      '锅中烧水加少许盐和油，菠菜焯30秒去草酸过冷水沥干',
      '蒜20g切末（要够多才香），干辣椒切段',
      '热锅下20ml油烧热',
      '下蒜末和干辣椒爆香至蒜微黄',
      '下菠菜大火翻炒1分钟，加3g盐翻匀立即出锅'
    ]
  },
  // 96 肉末炖粉丝
  pork_mince_vermicelli_stew: {
    ingredients: [I('vermicelli',100,'g'), I('pork_mince',200,'g'), I('chinese_cabbage',150,'g'), I('garlic',10,'g'), I('ginger',5,'g'), I('light_soy',20,'ml'), I('cooking_wine',10,'ml'), I('cooking_oil',20,'ml'), I('spring_onion',10,'g'), I('white_pepper',2,'g')],
    steps: [
      '粉丝100g温水浸泡20分钟至软',
      '猪肉末200g加5ml料酒抓匀；白菜切丝；蒜姜切末',
      '热锅下20ml油下肉末炒散至变色出油',
      '加姜蒜末爆香，下白菜丝翻炒1分钟',
      '加500ml热水、20ml生抽、5ml料酒、2g白胡椒煮开',
      '下泡软粉丝煮5分钟至吸饱汤汁，撒葱花出锅'
    ]
  },
  // 97 蒜泥蒸茄子
  garlic_steamed_eggplant: {
    ingredients: [I('eggplant',400,'g'), I('garlic',30,'g'), I('chili_pepper',10,'g'), I('light_soy',20,'ml'), I('black_vinegar',10,'ml'), I('sesame_oil',10,'ml'), I('sugar',3,'g'), I('cooking_oil',15,'ml'), I('spring_onion',10,'g')],
    steps: [
      '长茄子400g洗净切8cm段，再竖切0.5cm长条',
      '蒸锅水开后将茄子条入锅大火蒸10分钟至软',
      '蒸好的茄子取出沥干，整齐摆盘',
      '蒜30g切末（一半生一半熟），红椒切碎，葱切花',
      '热锅下15ml油爆香一半蒜末和红椒，加20ml生抽、10ml陈醋、3g糖、剩余生蒜末调成蒜泥汁',
      '蒜泥汁淋在茄子上，淋10ml香油撒葱花上桌'
    ]
  },
  // 98 胡萝卜炖牛肉
  carrot_beef_stew: {
    ingredients: [I('beef_shank',500,'g'), I('carrot',400,'g'), I('potato',200,'g'), I('onion',100,'g'), I('ginger',15,'g'), I('star_anise',2,'piece'), I('bay_leaf',2,'piece'), I('dark_soy',5,'ml'), I('light_soy',20,'ml'), I('cooking_wine',20,'ml'), I('rock_sugar',15,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '牛腱子500g切3cm块，冷水下锅加姜葱料酒焯水5分钟',
      '胡萝卜400g、土豆200g切3cm滚刀块；洋葱切块',
      '热锅下20ml油下15g冰糖炒糖色，下牛肉翻炒上色',
      '加八角香叶姜片洋葱爆香，加20ml生抽、5ml老抽、20ml料酒翻炒',
      '加热水没过牛肉，大火煮开转小火炖60分钟',
      '加胡萝卜土豆继续炖30分钟至软糯，大火收汁出锅'
    ]
  },
  // 99 煎豆腐
  homestyle_fried_tofu_puff: {
    ingredients: [I('tofu',400,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',10,'ml'), I('sugar',3,'g'), I('cooking_oil',30,'ml'), I('starch',8,'g'), I('spring_onion',10,'g')],
    steps: [
      '老豆腐400g切1cm厚方块，撒少许盐静置5分钟出水，厨房纸吸干',
      '蒜切末，葱切花',
      '平底锅下30ml油烧热，豆腐块单层下锅中火煎2分钟不要翻动',
      '待底部金黄结壳再翻面，继续煎2分钟至两面金黄',
      '锅边下蒜末爆香，加15ml生抽、10ml蚝油、3g糖、80ml热水',
      '8g淀粉加水勾芡，大火收汁裹住豆腐，撒葱花出锅'
    ]
  },
  // 100 烤土豆块
  homestyle_roast_potato_wedges: {
    ingredients: [I('potato',500,'g'), I('garlic',15,'g'), I('cumin',8,'g'), I('chili_flakes',5,'g'), I('salt',5,'g'), I('cooking_oil',30,'ml'), I('black_pepper',2,'g'), I('butter',15,'g')],
    steps: [
      '土豆500g洗净不去皮，切3cm滚刀块',
      '冷水下锅加少许盐煮5分钟（半熟），捞出沥干',
      '土豆块加5g盐、8g孜然、5g辣椒粉、2g黑胡椒、蒜末、30ml油拌匀',
      '烤盘铺锡纸，土豆块单层平铺，撒15g黄油小块',
      '烤箱预热200℃，中层烤25分钟',
      '中途取出翻面，烤至表皮金黄酥脆、内里粉糯出炉'
    ]
  },
  // 101 西葫芦炒肉片
  zucchini_pork_stirfry: {
    ingredients: [I('zucchini',300,'g'), I('pork_loin',200,'g'), I('garlic',10,'g'), I('chili_pepper',8,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',5,'g'), I('salt',2,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '猪里脊200g切薄片，加5ml生抽、10ml料酒、5g淀粉抓匀腌10分钟',
      '西葫芦300g洗净切0.3cm斜片',
      '热锅下15ml油烧热，下肉片滑炒至变色盛出',
      '锅留底油爆香蒜片红椒',
      '下西葫芦大火翻炒2分钟至边缘透明',
      '回锅肉片，加10ml生抽、2g盐翻炒1分钟出锅'
    ]
  },
  // 102 干锅虾
  dry_pot_shrimp: {
    ingredients: [I('shrimp',400,'g'), I('potato',150,'g'), I('onion',100,'g'), I('capsicum',80,'g'), I('garlic',20,'g'), I('chili_pepper',15,'g'), I('doubanjiang',15,'g'), I('cumin',5,'g'), I('cooking_wine',15,'ml'), I('cooking_oil',40,'ml'), I('sugar',5,'g')],
    steps: [
      '虾400g剪须开背去线，加10ml料酒抓匀腌10分钟',
      '土豆切薄片；洋葱切块；青椒切块；蒜切片，干辣椒切段',
      '热锅下40ml油，下土豆片中火煎至两面金黄盛出',
      '锅留油下虾煎至两面变红卷起盛出',
      '锅留油下蒜片干辣椒、15g豆瓣酱炒出红油，加洋葱青椒翻炒1分钟',
      '回锅虾和土豆，加5g孜然、5g糖、5ml料酒翻炒1分钟，盛入预热干锅上桌'
    ]
  },
  // 103 肉末炒豆角
  pork_mince_green_bean: {
    ingredients: [I('green_bean',300,'g'), I('pork_mince',150,'g'), I('garlic',15,'g'), I('chili_pepper',10,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('cooking_oil',25,'ml'), I('salt',2,'g'), I('sugar',3,'g')],
    steps: [
      '豆角300g撕筋切0.5cm小段，盐水浸泡5分钟',
      '猪肉末150g加5ml料酒抓匀；蒜切末，干辣椒切段',
      '锅中烧水加少许盐和油，豆角焯3分钟（务必煮熟）捞出沥干',
      '热锅下25ml油下肉末中火煸炒至变色出油',
      '加蒜末干辣椒爆香，加10ml料酒、15ml生抽炒匀',
      '下豆角大火翻炒2分钟，加2g盐3g糖翻匀出锅'
    ]
  },
  // 104 洋葱炒蛋
  onion_egg_stirfry: {
    ingredients: [I('onion',200,'g'), I('egg',4,'piece'), I('spring_onion',10,'g'), I('light_soy',5,'ml'), I('salt',3,'g'), I('cooking_oil',25,'ml'), I('white_pepper',1,'g')],
    steps: [
      '洋葱200g切0.5cm丝；鸡蛋4个打散加1g盐拌匀',
      '热锅下15ml油烧至冒烟，倒入蛋液炒至凝固成大块盛出',
      '锅中加10ml油下洋葱大火翻炒2分钟至透明出甜味',
      '回锅鸡蛋翻炒1分钟',
      '加5ml生抽、2g盐、1g白胡椒翻匀',
      '撒葱花关火出锅'
    ]
  },
  // 105 蒸肉饼
  steamed_meat_patty: {
    ingredients: [I('pork_mince',300,'g'), I('egg',1,'piece'), I('water_chestnut',80,'g'), I('spring_onion',15,'g'), I('ginger',10,'g'), I('light_soy',20,'ml'), I('cooking_wine',10,'ml'), I('starch',10,'g'), I('cooking_oil',15,'ml'), I('salt',3,'g')],
    steps: [
      '马蹄80g去皮切碎；姜切末，葱白切末葱绿切花',
      '猪肉末300g加马蹄碎、1个鸡蛋、10g淀粉、20ml生抽、10ml料酒、3g盐、姜末葱白末顺时针搅打至上劲',
      '将肉馅平铺在盘中按压成1.5cm厚圆饼',
      '蒸锅水开后将肉饼入锅大火蒸20分钟至完全熟透',
      '蒸好的肉饼倒掉多余汁水',
      '锅中烧15ml油至冒烟，淋在肉饼上撒葱花激香即可'
    ]
  },
  // 106 干锅包菜
  dry_pot_cabbage: {
    ingredients: [I('cabbage',500,'g'), I('bacon',100,'g'), I('garlic',15,'g'), I('chili_pepper',15,'g'), I('doubanjiang',10,'g'), I('light_soy',15,'ml'), I('vinegar',10,'ml'), I('sugar',5,'g'), I('cooking_oil',25,'ml'), I('sichuan_pepper',3,'g')],
    steps: [
      '卷心菜500g用手撕成大片（手撕更入味）',
      '培根100g切1cm片；蒜切片，干辣椒切段',
      '冷锅下培根小火煸出油，加25ml油烧热',
      '下花椒小火炸出香味捞出弃用，下蒜片干辣椒、10g豆瓣酱爆香',
      '大火下卷心菜快速翻炒2分钟至边缘焦香',
      '沿锅边淋10ml醋、加15ml生抽、5g糖大火翻炒1分钟，盛入预热干锅上桌'
    ]
  },
  // 107 玉米排骨煲
  corn_pork_rib_pot: {
    ingredients: [I('pork_ribs',500,'g'), I('corn',300,'g'), I('carrot',150,'g'), I('ginger',15,'g'), I('spring_onion',15,'g'), I('cooking_wine',15,'ml'), I('salt',5,'g'), I('white_pepper',2,'g'), I('goji_berry',5,'g')],
    steps: [
      '排骨500g冷水下锅加姜葱料酒焯水5分钟，捞出冲洗',
      '玉米300g切3cm段；胡萝卜150g切3cm滚刀块',
      '砂锅加1500ml热水，下排骨、姜片葱段、5ml料酒大火煮开',
      '撇浮沫转小火炖30分钟',
      '加玉米胡萝卜继续炖30分钟至排骨脱骨',
      '加5g盐、2g白胡椒、枸杞焖2分钟，撒葱花出锅'
    ]
  },
  // 108 芹菜炒牛肉
  celery_beef_stirfry: {
    ingredients: [I('beef_sirloin',250,'g'), I('celery',300,'g'), I('carrot',60,'g'), I('garlic',10,'g'), I('ginger',5,'g'), I('light_soy',15,'ml'), I('oyster_sauce',10,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '牛肉250g逆纹切薄片，加5ml生抽、10ml料酒、5g淀粉、5ml油抓匀腌15分钟',
      '芹菜300g去叶撕筋切4cm段；胡萝卜切片',
      '锅中烧水加盐和油，芹菜胡萝卜焯30秒过冷水沥干',
      '热锅下20ml油烧至冒烟，下牛肉大火快速翻炒至变色盛出',
      '锅留油爆香姜蒜，下芹菜胡萝卜大火翻炒1分钟',
      '回锅牛肉，加10ml生抽、10ml蚝油翻炒30秒，3g淀粉勾薄芡出锅'
    ]
  },
  // 109 香菇蒸蛋
  steamed_egg_with_mushroom: {
    ingredients: [I('egg',3,'piece'), I('shiitake_fresh',80,'g'), I('spring_onion',10,'g'), I('light_soy',10,'ml'), I('salt',2,'g'), I('sesame_oil',5,'ml'), I('chicken_stock',300,'ml')],
    steps: [
      '鸡蛋3个打散加2g盐、300ml温热鸡汤搅匀，过筛去除泡沫（更细腻）',
      '香菇80g洗净去蒂切薄片',
      '碗底铺香菇片，缓缓倒入过筛蛋液',
      '碗口覆盖耐热保鲜膜（防止水汽滴入产生蜂窝）',
      '蒸锅水开后转小火（避免大火）蒸15分钟至蛋羹凝固',
      '揭膜淋10ml生抽、5ml香油，撒葱花上桌'
    ]
  },
  // 110 糖醋豆腐
  sweet_sour_tofu: {
    ingredients: [I('tofu',400,'g'), I('starch',30,'g'), I('tomato_paste',40,'g'), I('white_vinegar',25,'ml'), I('sugar',30,'g'), I('light_soy',10,'ml'), I('garlic',10,'g'), I('cooking_oil',300,'ml'), I('spring_onion',10,'g')],
    steps: [
      '老豆腐400g切2cm方块，撒少许盐静置5分钟出水，厨房纸吸干',
      '豆腐块均匀拍上一层淀粉',
      '锅中倒油烧至170℃，豆腐块下锅炸2分钟至外皮金黄酥脆，捞出沥油',
      '料汁：40g番茄酱、25ml白醋、30g糖、10ml生抽、80ml清水、10g淀粉调匀',
      '锅留10ml底油下蒜末爆香，倒入料汁小火煮至浓稠冒泡',
      '回锅炸好的豆腐快速翻匀让汁裹满每块，撒葱花出锅'
    ]
  },
  // 111 牛肉末炒豆腐
  beef_mince_tofu_stir_fry: {
    ingredients: [I('beef_mince',200,'g'), I('tofu',400,'g'), I('garlic',10,'g'), I('ginger',10,'g'), I('doubanjiang',15,'g'), I('light_soy',15,'ml'), I('starch',10,'g'), I('cooking_oil',25,'ml'), I('spring_onion',10,'g')],
    steps: [
      '豆腐400g切1.5cm方块，盐水浸泡5分钟去豆腥',
      '牛肉末200g加5ml料酒抓匀；蒜姜切末',
      '热锅下25ml油下牛肉末中火炒散至变色',
      '加15g豆瓣酱、姜蒜末小火炒出红油',
      '加300ml热水、15ml生抽煮开，下豆腐块',
      '中小火焖8分钟入味，10g淀粉加水勾芡收汁，撒葱花出锅'
    ]
  },
  // 112 胡萝卜烧牛肉
  carrot_beef_braise: {
    ingredients: [I('beef_shank',500,'g'), I('carrot',400,'g'), I('onion',150,'g'), I('ginger',15,'g'), I('star_anise',2,'piece'), I('bay_leaf',2,'piece'), I('dark_soy',5,'ml'), I('light_soy',20,'ml'), I('cooking_wine',20,'ml'), I('rock_sugar',15,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '牛腱子500g切3cm块，冷水下锅加姜葱料酒焯水5分钟',
      '胡萝卜400g切3cm滚刀块；洋葱切块',
      '热锅下20ml油下15g冰糖炒糖色至枣红',
      '下牛肉翻炒上色，加八角香叶姜片洋葱爆香',
      '加20ml生抽、5ml老抽、20ml料酒翻炒，加热水没过牛肉',
      '大火煮开转小火炖50分钟，加胡萝卜继续炖30分钟，大火收汁出锅'
    ]
  },
  // 113 炸豆腐泡
  deep_fried_tofu_puff: {
    ingredients: [I('tofu',500,'g'), I('cooking_oil',500,'ml'), I('salt',3,'g'), I('cumin',5,'g'), I('chili_flakes',5,'g')],
    steps: [
      '老豆腐500g切3cm方块，厨房纸彻底吸干表面水分（防止溅油）',
      '豆腐块撒3g盐静置15分钟出水，再次吸干',
      '锅中倒油烧至160℃中低温',
      '豆腐块逐个下锅炸5分钟至浮起、表面金黄起泡',
      '油温升至190℃高温复炸1分钟使外壳更酥脆',
      '捞出沥油，撒5g孜然5g辣椒粉装盘趁热食用'
    ]
  },
  // 114 番茄炖蛋
  egg_tomato_stew: {
    ingredients: [I('tomato',400,'g'), I('egg',4,'piece'), I('spring_onion',10,'g'), I('sugar',8,'g'), I('salt',3,'g'), I('cooking_oil',20,'ml'), I('starch',5,'g')],
    steps: [
      '番茄400g顶部划十字烫水去皮切块；鸡蛋4个打散加1g盐',
      '热锅下15ml油烧至冒烟，倒入蛋液炒至凝固成块盛出',
      '锅中加5ml油下番茄翻炒3分钟至出红汁',
      '加300ml热水、8g糖、3g盐煮开',
      '回锅鸡蛋煮3分钟入味',
      '5g淀粉加水勾薄芡，撒葱花出锅'
    ]
  },
  // 115 香菇炒油菜
  stir_fry_mushroom_bok_choy: {
    ingredients: [I('shiitake_fresh',150,'g'), I('bok_choy',400,'g'), I('garlic',10,'g'), I('oyster_sauce',15,'ml'), I('salt',2,'g'), I('cooking_oil',20,'ml'), I('starch',5,'g')],
    steps: [
      '油菜400g洗净对半剖开；香菇150g去蒂切片；蒜切片',
      '锅中烧水加盐和油，油菜焯30秒过冷水沥干',
      '油菜整齐摆盘',
      '热锅下20ml油下蒜片爆香，下香菇大火翻炒2分钟',
      '加15ml蚝油、2g盐、80ml热水煮1分钟',
      '5g淀粉加水勾芡至浓稠，将香菇连汁浇在油菜上即可'
    ]
  },
  // 116 虾仁炒西葫芦
  stir_fry_shrimp_zucchini: {
    ingredients: [I('zucchini',300,'g'), I('shrimp',200,'g'), I('garlic',10,'g'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('salt',3,'g'), I('cooking_oil',20,'ml'), I('white_pepper',1,'g')],
    steps: [
      '虾仁200g开背去虾线，加5ml料酒、1g盐、1g白胡椒、5g淀粉抓匀腌10分钟',
      '西葫芦300g洗净切0.3cm薄片；蒜切片',
      '热锅下15ml油烧热，下虾仁滑炒至变红卷起盛出',
      '锅留油下蒜片爆香',
      '下西葫芦大火翻炒2分钟至边缘透明',
      '回锅虾仁，加3g盐翻炒30秒，3g淀粉加水勾薄芡出锅'
    ]
  },
  // 117 胡萝卜烧羊肉
  carrot_lamb_braise: {
    ingredients: [I('lamb_leg',400,'g'), I('carrot',300,'g'), I('white_radish',200,'g'), I('ginger',20,'g'), I('star_anise',2,'piece'), I('bay_leaf',2,'piece'), I('cumin',5,'g'), I('dark_soy',5,'ml'), I('light_soy',20,'ml'), I('cooking_wine',30,'ml'), I('rock_sugar',15,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '羊腿肉400g切3cm块，冷水下锅加姜葱料酒焯水5分钟去膻',
      '胡萝卜白萝卜切3cm滚刀块（萝卜去羊膻）',
      '热锅下20ml油加15g冰糖炒糖色，下羊肉翻炒上色',
      '加八角香叶孜然姜片爆香，加20ml生抽、5ml老抽、30ml料酒翻炒',
      '加热水没过羊肉，大火煮开转小火炖50分钟',
      '加胡萝卜白萝卜继续炖30分钟至软烂，大火收汁出锅'
    ]
  },
  // 118 红薯鸡蛋饼
  sweet_potato_egg_pancake: {
    ingredients: [I('sweet_potato',300,'g'), I('egg',2,'piece'), I('flour',80,'g'), I('milk',50,'ml'), I('sugar',15,'g'), I('cooking_oil',25,'ml'), I('salt',1,'g')],
    steps: [
      '红薯300g去皮蒸15分钟至软透，趁热压成红薯泥',
      '红薯泥加2个鸡蛋、80g面粉、50ml牛奶、15g糖、1g盐搅匀至无颗粒',
      '面糊静置10分钟更易摊开',
      '平底锅小火预热，刷一层油',
      '舀一勺面糊倒入锅中转锅摊成圆饼',
      '小火煎2分钟至底部金黄，翻面再煎1分钟出锅切件食用'
    ]
  },
  // 119 肉末烧土豆
  pork_mince_braised_potato: {
    ingredients: [I('potato',400,'g'), I('pork_mince',200,'g'), I('garlic',10,'g'), I('ginger',5,'g'), I('doubanjiang',10,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('cooking_oil',25,'ml'), I('spring_onion',10,'g'), I('sugar',3,'g')],
    steps: [
      '土豆400g去皮切1.5cm丁，浸水洗去淀粉',
      '猪肉末200g加5ml料酒抓匀；蒜姜切末',
      '热锅下25ml油下肉末炒散至变色出油',
      '加10g豆瓣酱、姜蒜末小火炒出红油',
      '下土豆丁翻炒2分钟，加300ml热水、15ml生抽、3g糖煮开',
      '中小火焖15分钟至土豆软糯入味，大火收汁，撒葱花出锅'
    ]
  },
  // 120 炸猪排
  deep_fried_pork_chop: {
    ingredients: [I('pork_loin',400,'g'), I('egg',2,'piece'), I('flour',80,'g'), I('cornmeal',80,'g'), I('salt',5,'g'), I('black_pepper',3,'g'), I('cooking_oil',500,'ml')],
    steps: [
      '猪里脊400g切1.5cm厚大片，用刀背两面拍松',
      '猪排撒3g盐、3g黑胡椒抓匀腌15分钟',
      '猪排先沾80g面粉，再沾打散的鸡蛋液，最后裹满80g面包糠（用玉米粉代）压实',
      '锅中倒油烧至170℃',
      '猪排下锅炸3分钟至两面金黄浮起捞出',
      '油温升至190℃复炸30秒至外壳酥脆，沥油切件食用'
    ]
  },
  // 121 鸡胸肉炒西兰花
  stir_fry_chicken_broccoli: {
    ingredients: [I('chicken_breast',250,'g'), I('broccoli',300,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',15,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '鸡胸肉250g切薄片，加5ml生抽、10ml料酒、5g淀粉、5ml油抓匀腌15分钟',
      '西兰花300g掰小朵盐水泡10分钟后冲洗',
      '锅中烧水加盐和油，西兰花焯1分钟过冷水沥干',
      '热锅下15ml油烧热，下鸡片滑炒至变白盛出',
      '锅留油下蒜片爆香，下西兰花大火翻炒30秒',
      '回锅鸡片，加10ml生抽、15ml蚝油翻炒1分钟，3g淀粉勾薄芡出锅'
    ]
  },
  // 122 豆角炒鸡蛋
  stir_fry_green_bean_egg: {
    ingredients: [I('green_bean',250,'g'), I('egg',3,'piece'), I('garlic',10,'g'), I('light_soy',10,'ml'), I('salt',3,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '豆角250g撕筋切3cm段，盐水浸泡5分钟',
      '锅中烧水加盐和油，豆角焯3分钟（务必煮熟）捞出沥干',
      '鸡蛋3个打散加1g盐拌匀；蒜切末',
      '热锅下15ml油烧至冒烟，倒入蛋液炒至凝固成块盛出',
      '锅中加10ml油下蒜末爆香，下豆角翻炒1分钟',
      '回锅鸡蛋，加10ml生抽、2g盐翻炒1分钟出锅'
    ]
  },
  // 123 红薯烧鸡
  sweet_potato_braised_chicken: {
    ingredients: [I('chicken_thigh',400,'g'), I('sweet_potato',300,'g'), I('ginger',15,'g'), I('garlic',10,'g'), I('star_anise',1,'piece'), I('bay_leaf',2,'piece'), I('dark_soy',5,'ml'), I('light_soy',20,'ml'), I('cooking_wine',15,'ml'), I('rock_sugar',15,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '鸡腿肉400g剁3cm块，焯水3分钟去血沫',
      '红薯300g去皮切3cm滚刀块',
      '热锅下20ml油加15g冰糖炒糖色至枣红',
      '下鸡块翻炒上色，加八角香叶姜蒜爆香',
      '加20ml生抽、5ml老抽、15ml料酒翻炒，加热水没过鸡块',
      '大火煮开转小火炖20分钟，加红薯继续炖15分钟，大火收汁出锅'
    ]
  },
  // 124 炸鸡柳
  deep_fried_chicken_breast_strip: {
    ingredients: [I('chicken_breast',400,'g'), I('egg',2,'piece'), I('flour',80,'g'), I('cornmeal',80,'g'), I('salt',5,'g'), I('white_pepper',3,'g'), I('cooking_oil',500,'ml')],
    steps: [
      '鸡胸肉400g切1.5cm宽长条',
      '鸡柳加3g盐、3g白胡椒、10ml料酒抓匀腌15分钟',
      '鸡柳先沾80g面粉，再沾打散蛋液，最后裹满面包糠（玉米粉代）压实',
      '锅中倒油烧至170℃',
      '鸡柳下锅炸3分钟至浮起金黄捞出',
      '油温升至190℃复炸30秒至外壳酥脆，沥油装盘'
    ]
  },
  // 125 红烧三文鱼
  braised_salmon: {
    ingredients: [I('salmon_fillet',400,'g'), I('ginger',15,'g'), I('garlic',10,'g'), I('spring_onion',15,'g'), I('light_soy',20,'ml'), I('dark_soy',5,'ml'), I('cooking_wine',15,'ml'), I('rock_sugar',15,'g'), I('cooking_oil',20,'ml'), I('chili_pepper',5,'g')],
    steps: [
      '三文鱼400g切3cm厚块，用厨房纸吸干水分',
      '三文鱼用5ml料酒、姜片抹匀腌5分钟',
      '热锅下20ml油烧热，下三文鱼煎至两面微焦盛出',
      '锅留底油下姜蒜葱白红椒爆香',
      '加15g冰糖炒糖色，加20ml生抽、5ml老抽、10ml料酒、200ml热水煮开',
      '回锅三文鱼小火焖8分钟，大火收汁至浓稠，撒葱花出锅'
    ]
  },
  // 126 炸红薯丸子
  deep_fried_sweet_potato_ball: {
    ingredients: [I('sweet_potato',400,'g'), I('glutinous_rice',100,'g'), I('sugar',30,'g'), I('cooking_oil',500,'ml')],
    steps: [
      '红薯400g去皮切片蒸15分钟至软，趁热压成泥',
      '红薯泥加100g糯米粉、30g糖揉成不粘手的面团（太干加水太湿加粉）',
      '取小块面团搓成3cm圆球',
      '锅中倒油烧至150℃中低温（高温会爆裂）',
      '红薯丸子下锅炸3分钟至浮起，期间用勺子轻压使其膨胀',
      '油温升至180℃复炸1分钟至表面金黄酥脆，捞出沥油装盘'
    ]
  },
  // 127 肉末炒粉
  stir_fry_pork_mince_noodles: {
    ingredients: [I('rice_noodles',200,'g'), I('pork_mince',150,'g'), I('bean_sprouts',150,'g'), I('garlic',10,'g'), I('chili_pepper',8,'g'), I('light_soy',20,'ml'), I('oyster_sauce',10,'ml'), I('cooking_oil',25,'ml'), I('spring_onion',10,'g')],
    steps: [
      '河粉（用米粉代）200g用温水浸泡20分钟至软，沥干',
      '猪肉末150g加5ml料酒抓匀；豆芽洗净；蒜切末，红椒切圈',
      '热锅下25ml油下肉末炒散至变色出油',
      '加蒜末红椒爆香，下豆芽翻炒1分钟',
      '下泡软米粉、20ml生抽、10ml蚝油大火翻炒2分钟',
      '关火撒葱花翻匀出锅'
    ]
  },
  // 128 玉米肉末蒸蛋
  steamed_egg_pork_mince_corn: {
    ingredients: [I('egg',3,'piece'), I('pork_mince',100,'g'), I('corn',80,'g'), I('spring_onion',10,'g'), I('light_soy',15,'ml'), I('salt',2,'g'), I('sesame_oil',5,'ml'), I('chicken_stock',300,'ml')],
    steps: [
      '鸡蛋3个打散加2g盐、300ml温热鸡汤搅匀过筛',
      '玉米剥粒，焯水1分钟沥干；猪肉末加少许酱油料酒抓匀',
      '热锅下少许油炒香肉末至变色，加玉米翻炒30秒',
      '碗底铺炒好的肉末玉米，倒入过筛蛋液',
      '碗口覆盖耐热保鲜膜，蒸锅水开后小火蒸15分钟',
      '揭膜淋15ml生抽、5ml香油，撒葱花上桌'
    ]
  },
  // 129 番茄炒豆腐
  stir_fry_tomato_tofu: {
    ingredients: [I('tomato',300,'g'), I('tofu',400,'g'), I('garlic',10,'g'), I('tomato_paste',20,'g'), I('sugar',8,'g'), I('salt',3,'g'), I('cooking_oil',25,'ml'), I('starch',8,'g'), I('spring_onion',10,'g')],
    steps: [
      '老豆腐400g切1.5cm方块，撒少许盐静置5分钟出水',
      '番茄300g顶部划十字烫水去皮切块；蒜切末',
      '平底锅下20ml油，豆腐煎至两面金黄盛出',
      '锅中加5ml油下蒜末爆香，下番茄炒3分钟出红汁',
      '加20g番茄酱、8g糖、3g盐、150ml热水煮开',
      '回锅煎豆腐煮3分钟入味，淀粉勾芡，撒葱花出锅'
    ]
  },
  // 130 蚝油牛肉炒面
  homestyle_oyster_sauce_beef_noodle: {
    ingredients: [I('noodles_dried',200,'g'), I('beef_sirloin',200,'g'), I('onion',100,'g'), I('capsicum',80,'g'), I('garlic',10,'g'), I('oyster_sauce',25,'ml'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',30,'ml')],
    steps: [
      '挂面200g煮5分钟至软硬适中，过冷水沥干加少许油拌匀防粘',
      '牛肉200g逆纹切薄片，加5ml生抽、10ml料酒、5g淀粉、5ml油抓匀腌15分钟',
      '洋葱切丝；青椒切丝；蒜切片',
      '热锅下20ml油烧至冒烟，下牛肉大火快速翻炒至变色盛出',
      '锅留油下蒜片洋葱青椒翻炒1分钟',
      '下面条、25ml蚝油、10ml生抽，回锅牛肉大火翻炒2分钟出锅'
    ]
  },
  // 131 鸡肉玉米煲
  chicken_corn_pot: {
    ingredients: [I('chicken_thigh',400,'g'), I('corn',300,'g'), I('carrot',150,'g'), I('potato',200,'g'), I('ginger',15,'g'), I('cooking_wine',15,'ml'), I('light_soy',15,'ml'), I('salt',5,'g'), I('white_pepper',2,'g'), I('cooking_oil',15,'ml')],
    steps: [
      '鸡腿肉400g剁3cm块，焯水3分钟去血沫',
      '玉米切3cm段，胡萝卜土豆切3cm滚刀块',
      '砂锅下15ml油下姜片爆香',
      '下鸡块翻炒1分钟，加15ml生抽、15ml料酒翻炒上色',
      '加1200ml热水、玉米、胡萝卜、土豆煮开',
      '中小火炖40分钟至所有食材软烂，加5g盐、2g白胡椒调味出锅'
    ]
  },
  // 132 豆芽炒肉片
  bean_sprout_pork_stirfry: {
    ingredients: [I('bean_sprouts',300,'g'), I('pork_loin',150,'g'), I('garlic',10,'g'), I('chili_pepper',8,'g'), I('light_soy',15,'ml'), I('vinegar',5,'ml'), I('starch',5,'g'), I('cooking_oil',20,'ml'), I('cooking_wine',10,'ml')],
    steps: [
      '猪里脊150g切薄片，加5ml生抽、10ml料酒、5g淀粉抓匀腌10分钟',
      '绿豆芽300g洗净掐去两端（更脆）；蒜切片',
      '热锅下15ml油烧热，下肉片滑炒至变色盛出',
      '锅留底油下蒜片干辣椒爆香',
      '下豆芽大火快速翻炒1分钟（不可久炒）',
      '回锅肉片，沿锅边淋5ml醋、加10ml生抽，大火翻炒30秒出锅'
    ]
  },
  // 133 豆芽炒蛋
  bean_sprout_egg_stirfry: {
    ingredients: [I('bean_sprouts',300,'g'), I('egg',3,'piece'), I('garlic',10,'g'), I('spring_onion',10,'g'), I('light_soy',10,'ml'), I('salt',3,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '绿豆芽300g洗净掐去两端；鸡蛋3个打散加1g盐',
      '热锅下15ml油烧至冒烟，倒入蛋液炒至凝固成块盛出',
      '锅中加10ml油下蒜末爆香',
      '下豆芽大火翻炒1分钟',
      '回锅鸡蛋，加10ml生抽、2g盐翻炒30秒',
      '撒葱花翻匀出锅（保持脆嫩）'
    ]
  },
  // 134 豆芽炒豆腐
  bean_sprout_tofu_skin_stirfry: {
    ingredients: [I('bean_sprouts',250,'g'), I('dried_tofu',200,'g'), I('garlic',10,'g'), I('chili_pepper',8,'g'), I('light_soy',15,'ml'), I('salt',2,'g'), I('cooking_oil',20,'ml'), I('spring_onion',10,'g')],
    steps: [
      '绿豆芽250g洗净掐去两端；豆干200g切0.3cm丝',
      '锅中烧水加少许盐，豆干焯30秒过冷水沥干',
      '热锅下15ml油烧热，下豆干煸炒1分钟略带焦边盛出',
      '锅中加5ml油下蒜末干辣椒爆香',
      '下豆芽大火翻炒1分钟',
      '回锅豆干，加15ml生抽、2g盐翻炒30秒，撒葱花出锅'
    ]
  },
  // 135 豆腐蒸蛋
  steamed_egg_with_tofu: {
    ingredients: [I('egg',3,'piece'), I('tofu',200,'g'), I('spring_onion',10,'g'), I('light_soy',10,'ml'), I('salt',2,'g'), I('sesame_oil',5,'ml'), I('chicken_stock',300,'ml')],
    steps: [
      '鸡蛋3个打散加2g盐、300ml温热鸡汤搅匀过筛',
      '嫩豆腐200g切1.5cm小块',
      '碗底铺豆腐块，缓缓倒入过筛蛋液',
      '碗口覆盖耐热保鲜膜（防止水汽滴入）',
      '蒸锅水开后转小火蒸12分钟至蛋羹凝固',
      '揭膜淋10ml生抽、5ml香油撒葱花上桌'
    ]
  },
  // 136 锡纸烤虾
  foil_roast_shrimp: {
    ingredients: [I('shrimp',400,'g'), I('garlic',30,'g'), I('butter',30,'g'), I('cooking_wine',15,'ml'), I('salt',3,'g'), I('black_pepper',3,'g'), I('chili_flakes',5,'g'), I('spring_onion',15,'g')],
    steps: [
      '虾400g剪须开背去虾线，加15ml料酒抓匀腌10分钟',
      '蒜30g切末；30g黄油融化',
      '蒜末加融化黄油、3g盐、3g黑胡椒、5g辣椒粉拌成蒜蓉黄油',
      '锡纸铺在烤盘上，虾整齐摆放，淋上蒜蓉黄油',
      '锡纸包紧封口（保留肉汁）',
      '烤箱预热200℃，中层烤15分钟，开包撒葱花再烤2分钟出炉'
    ]
  },
  // 137 锡纸烤三文鱼
  foil_roast_salmon: {
    ingredients: [I('salmon_fillet',400,'g'), I('lemon',50,'g'), I('butter',20,'g'), I('garlic',15,'g'), I('salt',3,'g'), I('black_pepper',3,'g'), I('cooking_oil',10,'ml'), I('asparagus',150,'g')],
    steps: [
      '三文鱼柳400g洗净擦干；芦笋切4cm段；蒜切末',
      '三文鱼撒3g盐、3g黑胡椒、淋10ml油抹匀腌10分钟',
      '锡纸铺烤盘，铺一层芦笋段',
      '三文鱼放在芦笋上，撒蒜末，铺上20g黄油片，挤上柠檬汁（用50g柠檬代）',
      '锡纸包紧封口',
      '烤箱预热200℃，中层烤15分钟至三文鱼熟透出炉打开食用'
    ]
  },
  // 138 锡纸烤蘑菇
  foil_roast_mushroom: {
    ingredients: [I('mushroom',400,'g'), I('garlic',20,'g'), I('butter',25,'g'), I('salt',3,'g'), I('black_pepper',2,'g'), I('spring_onion',10,'g'), I('cooking_oil',10,'ml'), I('chili_flakes',3,'g')],
    steps: [
      '蘑菇400g洗净对半切开（大的切四瓣）',
      '蒜20g切末，葱切花',
      '锡纸铺烤盘，蘑菇平铺单层',
      '撒蒜末、3g盐、2g黑胡椒、3g辣椒粉，铺25g黄油片，淋10ml油',
      '锡纸包紧封口',
      '烤箱预热200℃中层烤20分钟，开包撒葱花再烤2分钟上桌'
    ]
  },
  // 139 锡纸烤豆腐
  foil_roast_tofu: {
    ingredients: [I('tofu',400,'g'), I('garlic',15,'g'), I('chili_flakes',8,'g'), I('cumin',8,'g'), I('light_soy',15,'ml'), I('cooking_oil',20,'ml'), I('spring_onion',15,'g'), I('sesame_oil',5,'ml')],
    steps: [
      '老豆腐400g切0.5cm厚片，撒少许盐静置5分钟出水',
      '蒜切末，葱切花；调料：8g辣椒粉、8g孜然粉、15ml生抽、20ml油、蒜末调匀',
      '锡纸铺烤盘刷一层油，豆腐片平铺',
      '一面刷上调料汁',
      '烤箱预热220℃烤10分钟，取出翻面再刷调料汁',
      '继续烤8分钟至两面金黄边缘焦香，撒葱花淋香油上桌'
    ]
  },
  // 140 锡纸烤鸡腿
  foil_roast_chicken_thigh: {
    ingredients: [I('chicken_thigh',400,'g'), I('garlic',15,'g'), I('light_soy',25,'ml'), I('oyster_sauce',15,'ml'), I('cooking_wine',15,'ml'), I('sugar',10,'g'), I('cumin',5,'g'), I('chili_flakes',5,'g'), I('cooking_oil',15,'ml'), I('ginger',10,'g')],
    steps: [
      '鸡腿400g洗净，正反面划几刀深至骨头（更入味）',
      '腌料：25ml生抽、15ml蚝油、15ml料酒、10g糖、5g孜然、5g辣椒粉、姜蒜末调匀',
      '鸡腿入腌料抓匀，覆膜冷藏腌至少2小时',
      '锡纸铺烤盘刷油，鸡腿带皮面朝上摆放',
      '烤箱预热200℃烤20分钟取出翻面刷腌料',
      '继续烤15分钟，最后5分钟刷蜂蜜水（糖+水）使其上色发亮出炉'
    ]
  },
  // 141 玉米烧排骨
  corn_braised_pork_rib: {
    ingredients: [I('pork_ribs',500,'g'), I('corn',300,'g'), I('ginger',15,'g'), I('garlic',10,'g'), I('star_anise',1,'piece'), I('dark_soy',5,'ml'), I('light_soy',20,'ml'), I('cooking_wine',20,'ml'), I('rock_sugar',20,'g'), I('cooking_oil',20,'ml'), I('spring_onion',10,'g')],
    steps: [
      '排骨500g冷水下锅加姜葱料酒焯水5分钟，捞出冲洗',
      '玉米300g切3cm段',
      '热锅下20ml油加20g冰糖小火炒糖色至枣红',
      '下排骨翻炒上色，加八角姜蒜爆香',
      '加20ml生抽、5ml老抽、20ml料酒翻炒，加热水没过排骨',
      '大火煮开转小火炖30分钟，加玉米继续炖15分钟，大火收汁撒葱花出锅'
    ]
  },
  // 142 虾仁烧豆腐
  shrimp_braised_tofu: {
    ingredients: [I('shrimp',200,'g'), I('tofu',400,'g'), I('garlic',10,'g'), I('ginger',5,'g'), I('light_soy',15,'ml'), I('oyster_sauce',15,'ml'), I('cooking_wine',10,'ml'), I('starch',10,'g'), I('cooking_oil',25,'ml'), I('spring_onion',10,'g')],
    steps: [
      '虾仁200g开背去线，加5ml料酒、姜片腌5分钟；豆腐400g切2cm方块',
      '平底锅下15ml油，豆腐煎至两面金黄盛出',
      '锅中加10ml油下蒜末爆香',
      '下虾仁滑炒至变红卷起，加15ml生抽、15ml蚝油翻炒',
      '回锅煎豆腐，加200ml热水煮开',
      '中小火焖5分钟，10g淀粉加水勾芡收汁，撒葱花出锅'
    ]
  },
  // 143 洋葱焖羊肉
  onion_braised_lamb: {
    ingredients: [I('lamb_leg',400,'g'), I('onion',300,'g'), I('ginger',15,'g'), I('star_anise',2,'piece'), I('cumin',8,'g'), I('dark_soy',5,'ml'), I('light_soy',20,'ml'), I('cooking_wine',30,'ml'), I('rock_sugar',15,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '羊腿肉400g切3cm块，冷水下锅加姜葱料酒焯水5分钟去膻',
      '洋葱300g切大块（一半炒香一半焖煮）',
      '热锅下20ml油加15g冰糖炒糖色至枣红',
      '下羊肉翻炒上色，加八角孜然姜片、一半洋葱爆香',
      '加20ml生抽、5ml老抽、30ml料酒翻炒，加热水没过羊肉',
      '大火煮开转小火炖50分钟，加剩余洋葱继续炖15分钟，大火收汁出锅'
    ]
  },
  // 144 红薯炖肉
  sweet_potato_pork_stew: {
    ingredients: [I('pork_belly',300,'g'), I('sweet_potato',400,'g'), I('ginger',15,'g'), I('garlic',10,'g'), I('star_anise',1,'piece'), I('dark_soy',5,'ml'), I('light_soy',20,'ml'), I('cooking_wine',15,'ml'), I('rock_sugar',15,'g'), I('cooking_oil',15,'ml')],
    steps: [
      '五花肉300g切2.5cm块，焯水5分钟去血沫',
      '红薯400g去皮切3cm滚刀块',
      '热锅下15ml油加15g冰糖炒糖色至枣红',
      '下肉块翻炒上色，加八角姜蒜爆香',
      '加20ml生抽、5ml老抽、15ml料酒翻炒，加热水没过肉',
      '大火煮开转小火炖30分钟，加红薯继续炖20分钟至软糯，大火收汁出锅'
    ]
  },
  // 145 蘑菇豆腐蛋花汤
  stew_egg_tofu_mushroom: {
    ingredients: [I('mushroom',150,'g'), I('tofu',300,'g'), I('egg',2,'piece'), I('spring_onion',10,'g'), I('salt',3,'g'), I('white_pepper',2,'g'), I('sesame_oil',5,'ml'), I('cooking_oil',10,'ml'), I('starch',8,'g')],
    steps: [
      '蘑菇150g切片；豆腐300g切1.5cm块；鸡蛋2个打散',
      '热锅下10ml油下蘑菇翻炒2分钟出香',
      '加900ml热水煮开，下豆腐块煮3分钟',
      '加3g盐、2g白胡椒调味',
      '8g淀粉加水勾薄芡',
      '关小火淋入蛋液成蛋花，淋5ml香油撒葱花出锅'
    ]
  },
  // 146 番茄鸡蛋炖豆腐
  stew_tomato_egg_tofu: {
    ingredients: [I('tomato',300,'g'), I('egg',3,'piece'), I('tofu',400,'g'), I('garlic',10,'g'), I('tomato_paste',20,'g'), I('sugar',8,'g'), I('salt',3,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '番茄300g顶部划十字烫水去皮切块；豆腐400g切2cm方块；鸡蛋3个打散加少许盐',
      '热锅下15ml油烧至冒烟，倒入蛋液炒至凝固成块盛出',
      '锅中加10ml油下蒜末爆香，下番茄翻炒3分钟出红汁',
      '加20g番茄酱、8g糖、3g盐、200ml热水煮开',
      '下豆腐块煮5分钟入味',
      '回锅炒蛋大火煮2分钟，撒葱花出锅'
    ]
  },
  // 147 洋葱番茄炖牛肉
  stew_tomato_onion_beef: {
    ingredients: [I('beef_shank',500,'g'), I('tomato',300,'g'), I('onion',200,'g'), I('potato',200,'g'), I('carrot',150,'g'), I('tomato_paste',40,'g'), I('star_anise',2,'piece'), I('bay_leaf',2,'piece'), I('cooking_wine',20,'ml'), I('salt',5,'g'), I('cooking_oil',25,'ml'), I('sugar',10,'g')],
    steps: [
      '牛腱子500g切3cm块，冷水下锅加姜葱料酒焯水5分钟',
      '番茄去皮切块；洋葱土豆胡萝卜切3cm块',
      '热锅下25ml油下洋葱翻炒至透明出香',
      '加番茄、40g番茄酱炒3分钟出红汁',
      '下牛肉、八角香叶、20ml料酒、10g糖、热水没过',
      '大火煮开转小火炖60分钟，加土豆胡萝卜炖30分钟，加5g盐调味出锅'
    ]
  },
  // 148 芹菜炖鸡
  celery_chicken_stew: {
    ingredients: [I('chicken_thigh',400,'g'), I('celery',300,'g'), I('carrot',150,'g'), I('ginger',15,'g'), I('garlic',10,'g'), I('light_soy',20,'ml'), I('cooking_wine',15,'ml'), I('star_anise',1,'piece'), I('cooking_oil',20,'ml'), I('salt',4,'g')],
    steps: [
      '鸡腿肉400g剁3cm块，焯水3分钟去血沫',
      '芹菜300g切4cm段；胡萝卜150g切滚刀块',
      '热锅下20ml油下姜蒜八角爆香',
      '下鸡块翻炒2分钟，加20ml生抽、15ml料酒翻炒上色',
      '加500ml热水、胡萝卜煮开',
      '中小火炖25分钟，加芹菜继续炖10分钟，加4g盐调味出锅'
    ]
  },
  // 149 彩椒炒牛肉
  bell_pepper_beef_stirfry: {
    ingredients: [I('beef_sirloin',250,'g'), I('capsicum',250,'g'), I('onion',100,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',15,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',25,'ml'), I('black_pepper',2,'g')],
    steps: [
      '牛肉250g逆纹切薄片，加5ml生抽、10ml料酒、5g淀粉、5ml油、2g黑胡椒抓匀腌15分钟',
      '红黄青椒共250g切菱形块；洋葱切块；蒜切片',
      '热锅下20ml油烧至冒烟，下牛肉大火快速翻炒至变色盛出',
      '锅留油下蒜片洋葱翻炒1分钟',
      '下彩椒大火翻炒30秒（保持脆爽）',
      '回锅牛肉，加10ml生抽、15ml蚝油翻炒30秒，3g淀粉勾薄芡出锅'
    ]
  },
  // 150 玉米炒鸡丁
  stir_fry_corn_chicken: {
    ingredients: [I('chicken_breast',250,'g'), I('corn',250,'g'), I('cucumber',100,'g'), I('carrot',60,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',20,'ml'), I('salt',2,'g')],
    steps: [
      '鸡胸肉250g切1.5cm丁，加5ml生抽、10ml料酒、5g淀粉、5ml油抓匀腌15分钟',
      '玉米剥粒；黄瓜胡萝卜切1cm丁',
      '锅中烧水，玉米粒、胡萝卜丁焯1分钟过冷水沥干',
      '热锅下15ml油烧热，下鸡丁滑炒至变白盛出',
      '锅留油下蒜片爆香，下玉米胡萝卜翻炒1分钟',
      '下黄瓜丁、鸡丁，加10ml生抽、2g盐翻炒30秒，3g淀粉勾薄芡出锅'
    ]
  },
  // 151 洋葱炒羊肉
  onion_lamb_stirfry: {
    ingredients: [I('lamb_leg',250,'g'), I('onion',200,'g'), I('capsicum',100,'g'), I('garlic',10,'g'), I('cumin',8,'g'), I('chili_flakes',5,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '羊腿肉250g逆纹切薄片，加5ml生抽、10ml料酒、5g淀粉、5ml油、5g孜然抓匀腌15分钟',
      '洋葱200g切宽丝；青椒切片；蒜切片',
      '热锅下20ml油烧至冒烟，下羊肉大火快速翻炒至变色盛出',
      '锅留油下蒜片洋葱大火翻炒1分钟出香',
      '下青椒翻炒30秒',
      '回锅羊肉，加10ml生抽、3g孜然、5g辣椒粉翻炒30秒，3g淀粉勾薄芡出锅'
    ]
  },
  // 152 油豆腐烧肉
  tofu_puff_braised_pork: {
    ingredients: [I('tofu_puff',250,'g'), I('pork_belly',300,'g'), I('ginger',10,'g'), I('garlic',10,'g'), I('star_anise',1,'piece'), I('dark_soy',5,'ml'), I('light_soy',20,'ml'), I('cooking_wine',15,'ml'), I('rock_sugar',15,'g'), I('cooking_oil',15,'ml'), I('spring_onion',10,'g')],
    steps: [
      '五花肉300g切2cm块，焯水5分钟去血沫',
      '油豆腐250g对半切开，开水烫1分钟去油',
      '热锅下15ml油加15g冰糖炒糖色至枣红',
      '下肉块翻炒上色，加八角姜蒜爆香',
      '加20ml生抽、5ml老抽、15ml料酒翻炒，加热水没过肉',
      '大火煮开转小火炖30分钟，加油豆腐继续炖15分钟，大火收汁撒葱花出锅'
    ]
  },
  // 153 炸鸡块
  deep_fried_chicken_nuggets: {
    ingredients: [I('chicken_breast',400,'g'), I('egg',2,'piece'), I('flour',100,'g'), I('cornmeal',100,'g'), I('salt',5,'g'), I('white_pepper',3,'g'), I('cooking_oil',500,'ml'), I('cooking_wine',10,'ml')],
    steps: [
      '鸡胸肉400g切3cm方块',
      '鸡块加3g盐、3g白胡椒、10ml料酒、1个鸡蛋抓匀腌15分钟',
      '鸡块先沾100g面粉，再沾打散蛋液，最后裹满面包糠（玉米粉代）压实',
      '锅中倒油烧至170℃',
      '鸡块下锅炸4分钟至浮起金黄捞出',
      '油温升至190℃复炸1分钟至外壳酥脆，沥油装盘'
    ]
  },
  // 154 炸红薯条
  deep_fried_sweet_potato_strips: {
    ingredients: [I('sweet_potato',500,'g'), I('cooking_oil',500,'ml'), I('sugar',20,'g'), I('starch',30,'g')],
    steps: [
      '红薯500g去皮切1cm粗条',
      '红薯条用清水浸泡10分钟洗去淀粉，沥干用厨房纸吸干',
      '红薯条均匀拍上一层薄淀粉',
      '锅中倒油烧至160℃中低温',
      '红薯条下锅炸4分钟至浮起捞出，油温升至190℃',
      '复炸1分钟至外脆内软，捞出沥油趁热撒糖装盘'
    ]
  },
  // 155 炸鸡蛋豆腐
  deep_fried_egg_tofu: {
    ingredients: [I('tofu',400,'g'), I('egg',2,'piece'), I('starch',50,'g'), I('flour',30,'g'), I('salt',3,'g'), I('cooking_oil',500,'ml')],
    steps: [
      '鸡蛋豆腐（用嫩豆腐代）400g切2cm方块，撒少许盐静置5分钟出水，厨房纸吸干',
      '蛋液：2个鸡蛋打散加少许盐拌匀',
      '面糊：50g淀粉、30g面粉、80ml清水调匀',
      '锅中倒油烧至170℃',
      '豆腐块先沾蛋液，再裹面糊，逐个下锅炸2分钟至外皮金黄',
      '复炸30秒至外壳酥脆，捞出沥油装盘可蘸椒盐食用'
    ]
  },
  // 156 炸玉米饼
  deep_fried_corn_cake: {
    ingredients: [I('corn',400,'g'), I('flour',150,'g'), I('egg',2,'piece'), I('milk',100,'ml'), I('sugar',30,'g'), I('cooking_oil',500,'ml')],
    steps: [
      '玉米400g剥粒，留一半玉米粒，另一半打成玉米浆',
      '玉米浆加2个鸡蛋、150g面粉、100ml牛奶、30g糖搅匀',
      '加入玉米粒拌匀成面糊',
      '锅中倒油烧至170℃',
      '用勺子舀面糊整成圆饼下入油锅炸2分钟至浮起金黄',
      '复炸30秒至外壳酥脆，捞出沥油装盘'
    ]
  },
  // 157 芝麻拌菠菜
  boiled_spinach_sesame: {
    ingredients: [I('spinach',400,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('vinegar',10,'ml'), I('sesame_oil',15,'ml'), I('sugar',3,'g'), I('salt',2,'g')],
    steps: [
      '菠菜400g择洗后切4cm段',
      '锅中烧水加少许盐和油，菠菜焯30秒过冷水（去草酸保翠绿）',
      '焯好的菠菜挤干水分装盘',
      '蒜捣成泥',
      '蒜泥、15ml生抽、10ml醋、3g糖、2g盐、15ml香油调成料汁',
      '料汁淋在菠菜上拌匀，撒少许炒熟的白芝麻装盘上桌'
    ]
  },
  // 158 凉拌豆芽
  boiled_bean_sprout_salad: {
    ingredients: [I('bean_sprouts',400,'g'), I('cucumber',150,'g'), I('garlic',15,'g'), I('chili_flakes',5,'g'), I('vinegar',15,'ml'), I('light_soy',15,'ml'), I('sesame_oil',10,'ml'), I('salt',2,'g'), I('sugar',3,'g')],
    steps: [
      '绿豆芽400g洗净掐去两端',
      '锅中烧水加少许盐和油，豆芽焯1分钟（保持脆嫩）过冷水沥干',
      '黄瓜150g切丝；蒜捣成泥',
      '豆芽与黄瓜丝放入大碗',
      '蒜泥、5g辣椒粉、15ml醋、15ml生抽、3g糖、2g盐、10ml香油拌匀成料汁',
      '料汁淋在豆芽黄瓜上拌匀，冷藏10分钟入味装盘'
    ]
  },
  // 159 清炒小白菜
  stir_fried_bok_choy: {
    ingredients: [I('bok_choy',500,'g'), I('garlic',15,'g'), I('salt',3,'g'), I('cooking_oil',20,'ml'), I('chili_pepper',5,'g')],
    steps: [
      '小白菜500g择洗干净沥干，菜根较粗的对半切开',
      '蒜15g切片，干辣椒切段',
      '热锅下20ml油烧至七成热',
      '下蒜片和干辣椒爆香至蒜微黄',
      '下小白菜大火翻炒1分钟至叶子塌身',
      '加3g盐快速翻匀立即出锅（保持鲜亮翠绿）'
    ]
  },
  // 160 蒸蛋羹
  steamed_egg_custard: {
    ingredients: [I('egg',3,'piece'), I('chicken_stock',360,'ml'), I('salt',2,'g'), I('light_soy',10,'ml'), I('sesame_oil',5,'ml'), I('spring_onion',10,'g')],
    steps: [
      '鸡蛋3个打入碗中，加2g盐充分搅打至均匀',
      '加入1.5倍鸡蛋液量的温水或鸡汤（约360ml）继续搅匀',
      '蛋液过筛2-3次去除泡沫（关键步骤，使蛋羹更细嫩光滑）',
      '碗口覆盖耐热保鲜膜，用牙签扎几个小孔',
      '蒸锅水开后转中小火（保持小火避免蜂窝），蒸12分钟',
      '揭膜淋10ml生抽、5ml香油，撒葱花上桌'
    ]
  },
  // 161 韭菜炒蛋
  scrambled_eggs_chives: {
    ingredients: [I('leek',250,'g'), I('egg',4,'piece'), I('salt',3,'g'), I('cooking_oil',25,'ml'), I('white_pepper',1,'g')],
    steps: [
      '韭菜250g洗净切3cm段（韭白韭叶分开）',
      '鸡蛋4个打散加1g盐、1g白胡椒拌匀',
      '热锅下15ml油烧至冒烟',
      '倒入蛋液不要立即翻动，待蛋液边缘凝起立即推散成大块嫩蛋盛出',
      '锅中加10ml油烧热，下韭白大火翻炒30秒',
      '下韭叶和炒蛋，加2g盐大火快速翻炒30秒立即出锅'
    ]
  },
  // 162 菠菜鸡蛋汤
  spinach_egg_soup: {
    ingredients: [I('spinach',300,'g'), I('egg',2,'piece'), I('ginger',5,'g'), I('salt',3,'g'), I('white_pepper',1,'g'), I('sesame_oil',5,'ml'), I('cooking_oil',10,'ml')],
    steps: [
      '菠菜300g择洗切4cm段，焯水30秒去草酸过冷水沥干',
      '鸡蛋2个打散；姜切丝',
      '热锅下10ml油爆香姜丝',
      '加900ml热水大火煮开',
      '加3g盐、1g白胡椒调味，关小火淋入蛋液成蛋花',
      '下菠菜煮30秒至变软，淋5ml香油出锅'
    ]
  },
  // 163 家常豆腐
  homestyle_tofu: {
    ingredients: [I('tofu',400,'g'), I('pork_loin',150,'g'), I('capsicum',80,'g'), I('garlic',10,'g'), I('ginger',5,'g'), I('doubanjiang',15,'g'), I('light_soy',15,'ml'), I('sugar',5,'g'), I('starch',8,'g'), I('cooking_oil',30,'ml'), I('spring_onion',10,'g')],
    steps: [
      '老豆腐400g切1cm厚菱形块；猪里脊150g切薄片，加酱油料酒淀粉抓匀腌10分钟',
      '青椒切菱形块；蒜姜切末',
      '平底锅下20ml油，豆腐煎至两面金黄盛出',
      '锅中加10ml油下肉片滑炒至变色，加15g豆瓣酱、姜蒜爆出红油',
      '加200ml热水、15ml生抽、5g糖煮开，下煎好的豆腐和青椒',
      '中火焖5分钟，8g淀粉加水勾芡收汁，撒葱花出锅'
    ]
  },
  // 164 紫菜蛋花汤
  egg_drop_soup: {
    ingredients: [I('egg',2,'piece'), I('dried_shrimp',5,'g'), I('spring_onion',10,'g'), I('salt',3,'g'), I('white_pepper',1,'g'), I('sesame_oil',5,'ml'), I('cooking_oil',10,'ml')],
    steps: [
      '虾米5g（代紫菜）温水浸泡5分钟去腥；鸡蛋2个打散',
      '热锅下10ml油爆香虾米',
      '加900ml热水大火煮开',
      '加3g盐、1g白胡椒调味',
      '关小火，缓缓淋入蛋液用勺背轻推形成蛋花',
      '淋5ml香油撒葱花出锅'
    ]
  },
  // 165 家常炒面
  homestyle_fried_noodles: {
    ingredients: [I('noodles_dried',250,'g'), I('pork_loin',150,'g'), I('cabbage',150,'g'), I('carrot',60,'g'), I('egg',2,'piece'), I('garlic',10,'g'), I('light_soy',20,'ml'), I('oyster_sauce',15,'ml'), I('cooking_oil',30,'ml'), I('spring_onion',10,'g')],
    steps: [
      '挂面250g煮5分钟至软硬适中，过冷水沥干加少许油拌匀防粘',
      '猪里脊150g切丝加酱油料酒淀粉腌10分钟；卷心菜切丝；胡萝卜切丝；鸡蛋打散',
      '热锅下15ml油下蛋液炒散盛出',
      '锅加10ml油下蒜末、肉丝滑炒至变色',
      '下卷心菜胡萝卜大火翻炒1分钟',
      '下面条、20ml生抽、15ml蚝油大火翻炒2分钟，回锅鸡蛋撒葱花出锅'
    ]
  },
  // 166 可乐鸡翅
  cola_chicken_wing: {
    ingredients: [I('chicken_wing',500,'g'), I('sugar',60,'g'), I('dark_soy',8,'ml'), I('light_soy',20,'ml'), I('cooking_wine',20,'ml'), I('ginger',15,'g'), I('star_anise',1,'piece'), I('cooking_oil',15,'ml'), I('spring_onion',10,'g')],
    steps: [
      '鸡翅500g正反面各划两刀深至骨头（更入味）',
      '鸡翅冷水下锅加姜葱料酒焯水3分钟，捞出冲洗擦干',
      '热锅下15ml油，下鸡翅煎至两面金黄盛出',
      '锅留底油下姜片八角爆香',
      '加60g糖、400ml热水搅至糖溶（代替可乐），加20ml生抽、8ml老抽、20ml料酒煮开',
      '回锅鸡翅大火煮开转小火焖15分钟，开盖大火收汁至浓稠裹住鸡翅，撒葱花出锅'
    ]
  },
  // 167 番茄炖牛腩
  tomato_beef_brisket_stew: {
    ingredients: [I('beef_shank',500,'g'), I('tomato',400,'g'), I('potato',200,'g'), I('carrot',150,'g'), I('onion',100,'g'), I('tomato_paste',40,'g'), I('star_anise',2,'piece'), I('bay_leaf',2,'piece'), I('cooking_wine',20,'ml'), I('rock_sugar',10,'g'), I('salt',5,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '牛腩（用牛腱代）500g切3cm块，冷水下锅加姜葱料酒焯水5分钟',
      '番茄去皮切块；土豆胡萝卜洋葱切3cm块',
      '热锅下25ml油下洋葱翻炒至透明，下番茄翻炒3分钟',
      '加40g番茄酱、10g冰糖炒出红油',
      '下牛肉、八角香叶、20ml料酒翻炒，加热水没过',
      '大火煮开转小火炖60分钟，加土豆胡萝卜炖30分钟，加5g盐调味出锅'
    ]
  },
  // 168 蘑菇炒鸡
  mushroom_chicken_stirfry: {
    ingredients: [I('chicken_thigh',300,'g'), I('mushroom',200,'g'), I('capsicum',80,'g'), I('garlic',10,'g'), I('ginger',5,'g'), I('light_soy',15,'ml'), I('oyster_sauce',15,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',20,'ml'), I('spring_onion',10,'g')],
    steps: [
      '鸡腿肉300g切2cm丁，加5ml生抽、10ml料酒、5g淀粉抓匀腌15分钟',
      '蘑菇200g切片；青椒切块；蒜姜切末',
      '热锅下20ml油烧热，下鸡丁滑炒至变色盛出',
      '锅留油下姜蒜爆香，下蘑菇大火翻炒2分钟',
      '下青椒翻炒30秒，回锅鸡丁',
      '加10ml生抽、15ml蚝油翻炒1分钟，3g淀粉勾薄芡撒葱花出锅'
    ]
  },
  // 169 番茄鸡蛋面
  tomato_egg_noodle: {
    ingredients: [I('noodles_dried',150,'g'), I('tomato',300,'g'), I('egg',2,'piece'), I('garlic',5,'g'), I('spring_onion',10,'g'), I('salt',3,'g'), I('sugar',5,'g'), I('cooking_oil',20,'ml'), I('light_soy',10,'ml')],
    steps: [
      '番茄300g顶部划十字烫水去皮切块；鸡蛋2个打散加少许盐',
      '热锅下10ml油倒入蛋液炒至凝固成块盛出',
      '锅中加10ml油下蒜末爆香，下番茄翻炒3分钟出红汁',
      '加5g糖、3g盐、10ml生抽、800ml热水煮开',
      '下挂面150g煮3分钟至软硬适中',
      '回锅鸡蛋煮1分钟，撒葱花出锅装碗'
    ]
  },
  // 170 芹菜炒豆干
  celery_dried_tofu_stirfry: {
    ingredients: [I('celery',300,'g'), I('dried_tofu',250,'g'), I('carrot',60,'g'), I('garlic',10,'g'), I('chili_pepper',8,'g'), I('light_soy',15,'ml'), I('salt',2,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '芹菜300g去叶撕筋切4cm段；豆干250g切0.5cm厚条；胡萝卜切丝',
      '锅中烧水加盐和油，芹菜胡萝卜焯30秒过冷水沥干',
      '热锅下15ml油，豆干条下锅煎1分钟略带焦边盛出',
      '锅中加5ml油下蒜末干辣椒爆香',
      '下芹菜胡萝卜大火翻炒1分钟',
      '回锅豆干，加15ml生抽、2g盐翻炒1分钟出锅'
    ]
  },
  // 171 玉米鸡蛋饼
  corn_egg_pancake: {
    ingredients: [I('corn',300,'g'), I('egg',2,'piece'), I('flour',100,'g'), I('milk',100,'ml'), I('sugar',15,'g'), I('salt',2,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '玉米300g剥粒，焯水1分钟沥干',
      '面糊：100g面粉、2个鸡蛋、100ml牛奶、15g糖、2g盐搅匀至无颗粒',
      '加入玉米粒拌匀',
      '平底锅小火预热刷一层油',
      '舀一勺面糊倒入锅中转锅摊成圆饼',
      '小火煎2分钟至底部金黄，翻面再煎1分钟出锅切件食用'
    ]
  },
  // 172 鸡蛋灌饼
  egg_stuffed_pancake: {
    ingredients: [I('flour',300,'g'), I('egg',4,'piece'), I('lettuce',60,'g'), I('spring_onion',15,'g'), I('salt',5,'g'), I('cooking_oil',40,'ml'), I('light_soy',10,'ml'), I('sesame_oil',5,'ml')],
    steps: [
      '面粉300g加3g盐、180ml温水、10ml油揉成软面团醒30分钟',
      '面团揉光滑分成4份，每份擀成薄圆饼，刷油撒葱花再卷起按扁擀薄',
      '平底锅刷油烧热，饼下锅小火煎2分钟',
      '翻面继续煎，待饼鼓起时用筷子在边缘戳一个小口',
      '把打散的鸡蛋液（每张饼1个）从小口灌入饼内，迅速封口翻面',
      '继续煎1分钟至蛋液凝固，刷酱油，放生菜叶卷起对半切开装盘'
    ]
  },
  // 173 热干面
  hot_dry_noodle: {
    ingredients: [I('noodles_dried',200,'g'), I('sesame_oil',20,'ml'), I('light_soy',20,'ml'), I('vinegar',10,'ml'), I('chili_flakes',5,'g'), I('garlic',10,'g'), I('spring_onion',15,'g'), I('sugar',5,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '碱水面（用挂面代）200g煮3分钟至8成熟（保持筋道）',
      '捞出过冷水沥干，加20ml香油拌匀防粘（关键步骤）',
      '面条摊开晾凉风干（武汉热干面传统做法）',
      '蒜捣成泥加葱花、5g辣椒粉',
      '料汁：20ml生抽、10ml醋、5g糖、20ml芝麻酱（用香油+花生酱代替，或额外加香油）调匀',
      '吃前面条入开水烫15秒沥干装碗，淋料汁、撒蒜泥葱花拌匀食用'
    ]
  },
  // 174 番茄豆腐汤
  tomato_tofu_soup: {
    ingredients: [I('tomato',300,'g'), I('tofu',300,'g'), I('egg',2,'piece'), I('garlic',5,'g'), I('tomato_paste',15,'g'), I('sugar',5,'g'), I('salt',3,'g'), I('cooking_oil',15,'ml'), I('spring_onion',10,'g')],
    steps: [
      '番茄300g顶部划十字烫水去皮切丁；豆腐300g切1.5cm块；鸡蛋打散',
      '热锅下15ml油下蒜末番茄翻炒3分钟出红汁',
      '加15g番茄酱、5g糖、800ml热水煮开',
      '下豆腐块煮5分钟入味',
      '加3g盐调味，关小火淋入蛋液成蛋花',
      '撒葱花出锅装碗'
    ]
  },
  // 175 孜然羊肉
  cumin_lamb: {
    ingredients: [I('lamb_leg',300,'g'), I('onion',100,'g'), I('capsicum',80,'g'), I('garlic',15,'g'), I('cumin',15,'g'), I('chili_flakes',8,'g'), I('light_soy',15,'ml'), I('cooking_wine',15,'ml'), I('starch',8,'g'), I('cooking_oil',30,'ml'), I('salt',3,'g')],
    steps: [
      '羊腿肉300g切2cm丁，加5ml生抽、15ml料酒、5g淀粉、5ml油、5g孜然抓匀腌20分钟',
      '洋葱100g切块；青椒切块；蒜切片',
      '热锅下25ml油烧至冒烟，下羊肉大火快速翻炒至变色盛出',
      '锅留油下蒜片洋葱大火翻炒1分钟',
      '下青椒翻炒30秒，回锅羊肉',
      '加10g孜然、8g辣椒粉、10ml生抽、3g盐大火翻炒1分钟出锅'
    ]
  },
  // 176 洋葱炒肉
  onion_pork_stirfry: {
    ingredients: [I('onion',250,'g'), I('pork_loin',200,'g'), I('capsicum',80,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',10,'ml'), I('cooking_wine',10,'ml'), I('starch',5,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '猪里脊200g切薄片，加5ml生抽、10ml料酒、5g淀粉抓匀腌10分钟',
      '洋葱250g切宽丝；青椒切片；蒜切片',
      '热锅下15ml油烧热，下肉片滑炒至变色盛出',
      '锅留油下蒜片洋葱大火翻炒1分钟出香',
      '下青椒翻炒30秒',
      '回锅肉片，加10ml生抽、10ml蚝油大火翻炒1分钟出锅'
    ]
  },
  // 177 西葫芦炒蛋
  stir_fried_zucchini_egg: {
    ingredients: [I('zucchini',300,'g'), I('egg',3,'piece'), I('garlic',10,'g'), I('salt',3,'g'), I('cooking_oil',25,'ml'), I('light_soy',5,'ml')],
    steps: [
      '西葫芦300g洗净切0.3cm薄片；鸡蛋3个打散加1g盐拌匀',
      '热锅下15ml油烧至冒烟，倒入蛋液炒至凝固成块盛出',
      '锅中加10ml油下蒜末爆香',
      '下西葫芦大火翻炒2分钟至边缘透明',
      '回锅鸡蛋翻炒1分钟',
      '加5ml生抽、2g盐翻匀出锅'
    ]
  },
  // 178 煎荷包蛋
  simple_fried_egg: {
    ingredients: [I('egg',4,'piece'), I('cooking_oil',20,'ml'), I('salt',2,'g'), I('light_soy',10,'ml'), I('white_pepper',1,'g')],
    steps: [
      '平底锅小火预热，倒入20ml油烧至五成热',
      '鸡蛋逐个打入小碗（防止破壳）',
      '将鸡蛋逐个轻轻滑入锅中，撒少许盐',
      '小火煎2分钟至蛋白凝固边缘金黄',
      '用铲子小心翻面继续煎30秒（喜欢蛋黄流心可不翻面）',
      '出锅淋10ml生抽撒1g白胡椒装盘'
    ]
  },
  // 179 土豆烧鸡
  potato_chicken_braise: {
    ingredients: [I('chicken_thigh',400,'g'), I('potato',300,'g'), I('carrot',150,'g'), I('onion',100,'g'), I('ginger',15,'g'), I('garlic',10,'g'), I('star_anise',1,'piece'), I('dark_soy',5,'ml'), I('light_soy',20,'ml'), I('cooking_wine',15,'ml'), I('rock_sugar',15,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '鸡腿肉400g剁3cm块，焯水3分钟去血沫',
      '土豆胡萝卜切3cm滚刀块；洋葱切块',
      '热锅下20ml油加15g冰糖炒糖色至枣红',
      '下鸡块翻炒上色，加八角姜蒜洋葱爆香',
      '加20ml生抽、5ml老抽、15ml料酒翻炒，加热水没过鸡块',
      '大火煮开转小火炖20分钟，加土豆胡萝卜继续炖15分钟，大火收汁出锅'
    ]
  },
};
