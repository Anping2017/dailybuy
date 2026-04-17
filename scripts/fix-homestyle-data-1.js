// Recipes index 0-89
const I = (id, amount, unit) => ({ ingredientId: id, amount, unit });

module.exports = {
  // 0 番茄炒蛋
  tomato_egg: {
    ingredients: [I('tomato',300,'g'), I('egg',3,'piece'), I('spring_onion',10,'g'), I('sugar',5,'g'), I('salt',2,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '番茄300g顶部划十字，烫水30秒去皮，切2cm滚刀块；葱花备用',
      '鸡蛋3个打入碗中，加1g盐、5ml清水搅打均匀至起小泡',
      '热锅下15ml油烧至七成热，倒入蛋液不要立即翻动，待边缘凝起再用铲子推散成大块嫩蛋盛出',
      '锅中留底油下番茄翻炒2分钟出红汁，加5g糖、1g盐继续炒1分钟让番茄出沙',
      '倒回炒蛋大火快速翻匀30秒让蛋裹上番茄汁，撒葱花出锅装盘'
    ]
  },
  // 1 西兰花炒鸡肉
  stir_fry_broccoli_chicken: {
    ingredients: [I('chicken_breast',200,'g'), I('broccoli',300,'g'), I('garlic',15,'g'), I('light_soy',10,'ml'), I('oyster_sauce',15,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',20,'ml'), I('salt',2,'g')],
    steps: [
      '鸡胸肉200g切薄片，加5ml生抽、10ml料酒、5g淀粉、少许清水抓匀腌10分钟',
      '西兰花掰成小朵，盐水浸泡10分钟后冲洗；蒜切末',
      '锅中烧开水加1g盐和几滴油，西兰花焯1分钟捞出过冷水沥干',
      '热锅下15ml油，鸡肉片下锅滑炒至变白盛出',
      '锅中留油爆香蒜末，倒入西兰花翻炒30秒，加15ml蚝油、5ml生抽',
      '回锅鸡肉大火翻炒1分钟，3g淀粉加水勾薄芡收汁出锅'
    ]
  },
  // 2 红烧肉
  braised_pork_belly: {
    ingredients: [I('pork_belly',500,'g'), I('rock_sugar',40,'g'), I('dark_soy',10,'ml'), I('light_soy',20,'ml'), I('cooking_wine',30,'ml'), I('ginger',15,'g'), I('spring_onion',20,'g'), I('star_anise',2,'piece'), I('bay_leaf',2,'piece'), I('cooking_oil',15,'ml')],
    steps: [
      '五花肉500g冷水下锅加姜片葱段料酒，焯水5分钟撇去浮沫，捞出切3cm见方块',
      '冷锅放15ml油加40g冰糖小火慢炒，待冰糖完全融化变成枣红色冒密集小泡',
      '迅速倒入肉块快速翻炒30秒让每块裹满糖色',
      '加入30ml料酒、20ml生抽、10ml老抽炒匀上色',
      '加八角、香叶、姜片葱段，倒入开水没过肉面',
      '大火烧开转小火加盖炖50分钟，开盖后转大火收汁至浓稠出锅'
    ]
  },
  // 3 蛋炒饭
  egg_fried_rice: {
    ingredients: [I('rice',300,'g'), I('egg',3,'piece'), I('spring_onion',20,'g'), I('carrot',60,'g'), I('light_soy',10,'ml'), I('salt',2,'g'), I('cooking_oil',25,'ml'), I('white_pepper',1,'g')],
    steps: [
      '隔夜米饭300g用手抓散无结块；胡萝卜切小丁；葱白葱绿分开切碎',
      '鸡蛋3个打散加1g盐拌匀',
      '热锅下15ml油烧至冒烟，倒入蛋液炒散成碎金黄色蛋粒盛出',
      '锅中加10ml油下胡萝卜丁葱白炒香30秒',
      '倒入米饭中火翻炒2分钟至粒粒分开发出沙沙声',
      '回锅鸡蛋，沿锅边淋10ml生抽，加1g盐、白胡椒，撒葱绿翻匀出锅'
    ]
  },
  // 4 酸辣土豆丝
  stir_fry_potato_silk: {
    ingredients: [I('potato',400,'g'), I('chili_pepper',20,'g'), I('garlic',15,'g'), I('sichuan_pepper',2,'g'), I('white_vinegar',20,'ml'), I('salt',3,'g'), I('cooking_oil',25,'ml'), I('spring_onion',10,'g')],
    steps: [
      '土豆400g去皮切0.2cm细丝，浸入清水搓洗去淀粉，捞出沥干',
      '干辣椒剪段去籽，蒜切末，葱切碎',
      '锅中烧开水加几滴油，土豆丝焯15秒立刻捞出过冷水，保持脆爽',
      '热锅下25ml油，下花椒小火炸出香味后捞出弃用',
      '转大火下干辣椒、蒜末爆香5秒',
      '倒入土豆丝快速翻炒30秒，沿锅边淋20ml白醋，加3g盐继续翻炒1分钟，撒葱花出锅'
    ]
  },
  // 5 红薯粥
  sweet_potato_congee: {
    ingredients: [I('rice',100,'g'), I('sweet_potato',300,'g'), I('rock_sugar',15,'g')],
    steps: [
      '大米100g淘洗两次，加5ml油拌匀腌10分钟（防溢锅且粥更软糯）',
      '红薯300g去皮切2cm滚刀块，浸入清水防氧化',
      '锅中加1500ml清水大火烧开，倒入大米搅动一次防粘底',
      '盖盖转中小火煮20分钟至米粒开花',
      '加入红薯块继续煮15分钟至红薯软烂、粥变浓稠',
      '加15g冰糖搅至融化，关火焖5分钟即可盛出'
    ]
  },
  // 6 四季豆炒肉
  green_bean_pork: {
    ingredients: [I('green_bean',300,'g'), I('pork_mince',150,'g'), I('garlic',15,'g'), I('chili_pepper',10,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('salt',2,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '四季豆300g撕去筋，掰成3cm段，盐水浸泡5分钟后沥干',
      '猪肉末150g加5ml料酒、5ml生抽抓匀腌5分钟；蒜切末，干辣椒切段',
      '锅中烧开水加少许盐和油，四季豆焯3分钟（务必煮熟，避免中毒）捞出沥干',
      '热锅下20ml油，下肉末中火煸炒至变色出油',
      '加蒜末干辣椒爆香，淋5ml料酒、10ml生抽炒匀',
      '倒入四季豆大火翻炒2分钟，加2g盐调味，翻匀至四季豆起皱出锅'
    ]
  },
  // 7 拍黄瓜
  cucumber_salad: {
    ingredients: [I('cucumber',400,'g'), I('garlic',20,'g'), I('black_vinegar',15,'ml'), I('light_soy',10,'ml'), I('sesame_oil',10,'ml'), I('sugar',5,'g'), I('salt',3,'g'), I('chili_flakes',3,'g')],
    steps: [
      '黄瓜400g洗净去头尾，用刀面拍裂（拍而不切，更入味）',
      '拍裂的黄瓜切3cm段，放盆中加2g盐拌匀腌10分钟',
      '腌出的水分倒掉（去除苦水使口感更脆）',
      '蒜捣成泥，加10ml生抽、15ml陈醋、5g糖、1g盐调成料汁',
      '料汁淋在黄瓜上，撒3g辣椒粉，淋10ml热油激出香味',
      '加10ml香油拌匀，冷藏15分钟更入味后装盘'
    ]
  },
  // 8 五香茶叶蛋
  homestyle_tea_egg: {
    ingredients: [I('egg',10,'piece'), I('dark_soy',30,'ml'), I('light_soy',30,'ml'), I('star_anise',3,'piece'), I('bay_leaf',3,'piece'), I('sichuan_pepper',3,'g'), I('five_spice',5,'g'), I('salt',8,'g'), I('rock_sugar',20,'g'), I('ginger',15,'g')],
    steps: [
      '鸡蛋10个冷水下锅，加1勺盐，中火煮8分钟至全熟',
      '煮好的蛋立即过冷水，用勺背轻敲蛋壳出现均匀裂纹（不要剥掉）',
      '锅中加1500ml清水，加入八角、香叶、花椒、五香粉、姜片、冰糖煮开',
      '加30ml生抽、30ml老抽、8g盐搅匀',
      '放入敲裂的鸡蛋大火煮10分钟让裂纹吸色',
      '关火盖盖浸泡至少6小时（最好过夜），让茶汤渗入蛋白形成花纹再食用'
    ]
  },
  // 9 现磨豆浆 (use oats+milk substitute since no soybean - keep classic format)
  homestyle_fresh_soy_milk: {
    ingredients: [I('oats',80,'g'), I('milk',200,'ml'), I('rock_sugar',20,'g'), I('sesame_oil',2,'ml')],
    steps: [
      '燕麦80g用清水浸泡2小时至软胀，沥干',
      '泡好的燕麦倒入破壁机，加800ml清水',
      '高速打浆3分钟至细腻无颗粒',
      '过滤豆浆机出口的浆液到锅中（去渣使口感顺滑）',
      '锅中大火煮开后转小火继续煮5分钟（务必煮透）',
      '加入20g冰糖搅至融化，盛入碗中加200ml热牛奶混匀即可饮用'
    ]
  },
  // 10 白粥配油条
  homestyle_plain_congee: {
    ingredients: [I('rice',150,'g'), I('flour',200,'g'), I('egg',1,'piece'), I('milk',100,'ml'), I('cooking_oil',500,'ml'), I('salt',3,'g'), I('sugar',5,'g')],
    steps: [
      '大米150g淘洗，加2000ml清水浸泡30分钟',
      '冷水入锅大火烧开转小火熬45分钟，期间搅动几次防止粘底',
      '面粉200g加3g盐、5g糖、1个鸡蛋、100ml温牛奶揉成软面团，盖保鲜膜醒2小时',
      '醒好的面团擀成1cm厚长条，切2cm宽小条，两条叠起用筷子在中间压一下',
      '锅中倒油烧至180℃，捏住面条两头拉长下入油锅，立即用筷子翻动让油条均匀膨胀',
      '炸至金黄酥脆约2分钟捞出沥油，搭配煮好的白粥趁热食用'
    ]
  },
  // 11 丝瓜蛋花汤
  homestyle_loofah_egg_soup: {
    ingredients: [I('zucchini',300,'g'), I('egg',2,'piece'), I('ginger',5,'g'), I('spring_onion',10,'g'), I('salt',3,'g'), I('white_pepper',1,'g'), I('sesame_oil',5,'ml'), I('cooking_oil',10,'ml')],
    steps: [
      '丝瓜（用西葫芦替代）300g去皮切滚刀块；姜切丝，葱切花',
      '鸡蛋2个打散加少许盐拌匀',
      '热锅下10ml油爆香姜丝，下西葫芦块翻炒1分钟',
      '加入800ml热水大火煮开，转中火煮5分钟至西葫芦变软',
      '加3g盐、1g白胡椒粉调味',
      '关火前缓缓淋入蛋液，用勺背轻轻推开形成蛋花，淋5ml香油撒葱花出锅'
    ]
  },
  // 12 佛手瓜炒肉片
  homestyle_chayote_pork: {
    ingredients: [I('zucchini',300,'g'), I('pork_loin',150,'g'), I('chili_pepper',15,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',5,'g'), I('salt',2,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '佛手瓜（用西葫芦替代）300g去皮切薄片；猪里脊150g切薄片',
      '肉片加5ml生抽、10ml料酒、5g淀粉抓匀腌10分钟',
      '蒜切末，红辣椒切圈',
      '热锅下15ml油烧热，下肉片快速滑炒至变色盛出',
      '锅中留油下蒜末辣椒爆香，倒入瓜片翻炒2分钟至断生',
      '回锅肉片，加10ml生抽、2g盐大火翻炒1分钟出锅'
    ]
  },
  // 13 茼蒿豆腐汤
  homestyle_tonghao_tofu_soup: {
    ingredients: [I('spinach',250,'g'), I('tofu',300,'g'), I('dried_shrimp',10,'g'), I('ginger',5,'g'), I('salt',3,'g'), I('white_pepper',1,'g'), I('sesame_oil',5,'ml'), I('cooking_oil',10,'ml')],
    steps: [
      '茼蒿（用菠菜替代）250g洗净去根切段；豆腐300g切2cm方块',
      '虾皮10g用温水浸泡5分钟去腥，捞出沥干',
      '热锅下10ml油爆香姜丝、虾皮出香味',
      '加入800ml热水煮开，下豆腐块煮3分钟',
      '加3g盐、1g白胡椒调味',
      '下菠菜段煮30秒至变软，淋5ml香油出锅'
    ]
  },
  // 14 腐竹烧肉
  homestyle_fuzhu_braised_pork: {
    ingredients: [I('pork_belly',400,'g'), I('dried_tofu_skin',100,'g'), I('star_anise',2,'piece'), I('bay_leaf',2,'piece'), I('ginger',15,'g'), I('garlic',10,'g'), I('spring_onion',15,'g'), I('dark_soy',10,'ml'), I('light_soy',20,'ml'), I('cooking_wine',20,'ml'), I('rock_sugar',25,'g'), I('cooking_oil',15,'ml')],
    steps: [
      '腐竹100g用温水浸泡3小时至完全泡软，切5cm段沥干',
      '五花肉400g切2.5cm方块，冷水下锅加姜葱料酒焯水5分钟去腥',
      '炒锅下15ml油加25g冰糖小火炒糖色至枣红冒泡',
      '倒入肉块翻炒上色，加八角、香叶、姜片、蒜瓣爆香',
      '加20ml料酒、20ml生抽、10ml老抽炒匀，加开水没过肉面',
      '大火煮开转小火炖30分钟，下腐竹继续炖15分钟，开盖大火收汁至浓稠出锅'
    ]
  },
  // 15 干煎带鱼
  homestyle_pan_fry_hairtail: {
    ingredients: [I('fish_fillet',400,'g'), I('flour',50,'g'), I('ginger',15,'g'), I('spring_onion',15,'g'), I('cooking_wine',20,'ml'), I('salt',5,'g'), I('white_pepper',2,'g'), I('cooking_oil',60,'ml')],
    steps: [
      '带鱼（用鱼柳替代）400g切8cm段，去内脏洗净沥干',
      '鱼段用5g盐、2g白胡椒、20ml料酒、姜葱抓匀腌制20分钟',
      '腌好的鱼擦干水分，均匀拍上一层薄面粉',
      '平底锅下60ml油烧至七成热',
      '鱼段下锅中火煎2分钟不要翻动，待底部金黄结壳再翻面',
      '另一面继续煎2分钟至两面金黄酥脆，捞出沥油装盘'
    ]
  },
  // 16 黄花鱼豆腐汤
  homestyle_yellow_croaker_tofu: {
    ingredients: [I('fish_fillet',400,'g'), I('tofu',300,'g'), I('ginger',15,'g'), I('spring_onion',15,'g'), I('cooking_wine',15,'ml'), I('salt',4,'g'), I('white_pepper',2,'g'), I('cooking_oil',30,'ml'), I('chili_pepper',5,'g')],
    steps: [
      '黄花鱼（用鱼柳替代）400g处理干净，鱼身两面打浅花刀',
      '鱼用5ml料酒、姜片抹匀腌10分钟去腥；豆腐300g切2cm方块',
      '热锅下30ml油烧热，下鱼煎至两面金黄盛出',
      '锅中留底油爆香姜片葱白',
      '加入1000ml热水（必须用热水汤色才会奶白），下鱼大火煮10分钟至汤色变白',
      '加豆腐块煮5分钟，加4g盐、2g白胡椒、10ml料酒调味，撒葱花出锅'
    ]
  },
  // 17 蒜蓉炒苋菜
  homestyle_garlic_amaranth: {
    ingredients: [I('spinach',400,'g'), I('garlic',25,'g'), I('salt',3,'g'), I('sugar',2,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '苋菜（用菠菜替代）400g择洗干净沥干，菜梗较粗的对半切开',
      '大蒜25g去皮拍碎切末（要够多才香）',
      '热锅下20ml油烧至七成热',
      '下一半蒜末爆香至微黄',
      '倒入菜叶大火快速翻炒1分钟至叶子塌身',
      '加3g盐、2g糖调味，下剩余生蒜末翻炒30秒立即出锅（保持鲜亮）'
    ]
  },
  // 18 萝卜烧鱿鱼
  braised_squid_radish: {
    ingredients: [I('squid',300,'g'), I('white_radish',400,'g'), I('ginger',10,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',15,'ml'), I('cooking_wine',10,'ml'), I('sugar',5,'g'), I('cooking_oil',20,'ml'), I('salt',2,'g')],
    steps: [
      '鱿鱼300g去皮去内脏，鱿鱼身切花刀后切片，焯水10秒卷起捞出',
      '白萝卜400g去皮切3cm滚刀块，焯水3分钟去辣味',
      '热锅下20ml油爆香姜片蒜片',
      '下萝卜块翻炒2分钟，加15ml生抽、15ml蚝油、5g糖、10ml料酒炒匀',
      '加300ml热水煮开，转中小火炖15分钟至萝卜软透',
      '下鱿鱼花大火翻炒1分钟（不可久煮，否则发硬），收汁出锅'
    ]
  },
  // 19 芹菜炒鱿鱼
  stir_fry_squid_celery: {
    ingredients: [I('squid',300,'g'), I('celery',250,'g'), I('carrot',60,'g'), I('garlic',15,'g'), I('ginger',10,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('salt',3,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '鱿鱼300g内侧打十字花刀切3cm块，焯水10秒立即过冷水（保持脆嫩）',
      '芹菜250g去叶撕筋切4cm段，胡萝卜切菱形片',
      '锅中烧水加少许盐和油，芹菜胡萝卜焯30秒过冷水',
      '热锅下20ml油爆香姜蒜',
      '下鱿鱼花大火翻炒30秒，加10ml料酒去腥',
      '下芹菜胡萝卜，加15ml生抽、3g盐大火翻炒1分钟出锅'
    ]
  },
  // 20 鱼片豆腐汤
  fish_fillet_tofu_soup: {
    ingredients: [I('fish_fillet',300,'g'), I('tofu',300,'g'), I('ginger',10,'g'), I('spring_onion',10,'g'), I('egg',1,'piece'), I('starch',10,'g'), I('cooking_wine',10,'ml'), I('salt',3,'g'), I('white_pepper',2,'g'), I('sesame_oil',5,'ml')],
    steps: [
      '鱼片300g切3mm薄片，加5ml料酒、1g盐、1个蛋清、10g淀粉抓匀腌10分钟（上浆使鱼肉滑嫩）',
      '豆腐300g切2cm方块；姜切丝，葱切花',
      '锅中烧1000ml水加姜丝、5ml料酒煮开',
      '下豆腐煮3分钟使豆腐入味',
      '关小火，鱼片一片片下入锅中，待全部下锅再轻推开（避免粘连）',
      '中火煮2分钟至鱼片打卷变白，加3g盐、2g白胡椒，淋5ml香油撒葱花出锅'
    ]
  },
  // 21 莲藕排骨汤
  lotus_root_pork_rib_soup: {
    ingredients: [I('pork_ribs',500,'g'), I('lotus_root',400,'g'), I('ginger',15,'g'), I('spring_onion',15,'g'), I('cooking_wine',20,'ml'), I('salt',5,'g'), I('white_pepper',2,'g'), I('goji_berry',5,'g')],
    steps: [
      '排骨500g冷水下锅加姜葱料酒焯水5分钟，捞出冲洗干净',
      '莲藕400g去皮切3cm滚刀块（粉藕煲汤更好）',
      '排骨与1500ml热水同入砂锅，加姜片葱段、10ml料酒大火煮开',
      '撇去浮沫转小火炖40分钟',
      '下莲藕块继续炖30分钟至排骨脱骨、莲藕粉糯',
      '加5g盐、2g白胡椒调味，撒枸杞焖2分钟，撒葱花出锅'
    ]
  },
  // 22 红烧冬瓜
  braised_winter_melon: {
    ingredients: [I('winter_melon',500,'g'), I('garlic',15,'g'), I('light_soy',15,'ml'), I('dark_soy',5,'ml'), I('oyster_sauce',15,'ml'), I('sugar',5,'g'), I('starch',8,'g'), I('spring_onion',10,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '冬瓜500g去皮去瓤切2cm厚方块；蒜切末，葱切花',
      '冬瓜块两面用刀划浅十字花刀（更入味）',
      '热锅下25ml油烧热，下冬瓜块煎至两面金黄盛出',
      '锅留底油下蒜末爆香，加15ml生抽、5ml老抽、15ml蚝油、5g糖炒匀',
      '加200ml热水煮开，下冬瓜块大火转小火焖煮8分钟至冬瓜透明',
      '8g淀粉加水勾芡，大火收汁至浓稠裹住冬瓜，撒葱花出锅'
    ]
  },
  // 23 木耳炒蛋
  wood_ear_scrambled_egg: {
    ingredients: [I('wood_ear',15,'g'), I('egg',4,'piece'), I('garlic',10,'g'), I('spring_onion',10,'g'), I('light_soy',10,'ml'), I('salt',2,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '干木耳15g用冷水浸泡2小时充分泡发（不可用热水），撕成小朵焯水1分钟',
      '鸡蛋4个打散加1g盐拌匀；蒜切末，葱切花',
      '热锅下15ml油烧至冒烟，倒入蛋液炒至凝固成大块盛出',
      '锅中加10ml油下蒜末爆香',
      '倒入木耳大火翻炒1分钟（注意木耳遇热可能炸油，需小心）',
      '回锅鸡蛋，加10ml生抽、1g盐翻炒30秒，撒葱花出锅'
    ]
  },
  // 24 木耳肉片
  wood_ear_pork_stirfry: {
    ingredients: [I('pork_loin',200,'g'), I('wood_ear',15,'g'), I('carrot',80,'g'), I('garlic',10,'g'), I('ginger',5,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',20,'ml'), I('salt',2,'g')],
    steps: [
      '猪里脊200g切薄片，加5ml生抽、10ml料酒、5g淀粉、少许水抓匀腌15分钟',
      '干木耳15g冷水泡发2小时，撕小朵焯水1分钟',
      '胡萝卜切菱形片，蒜姜切片',
      '热锅下15ml油烧热，下肉片滑炒至变色盛出',
      '锅留油爆香姜蒜，下胡萝卜片翻炒1分钟，下木耳翻炒30秒',
      '回锅肉片，加10ml生抽、2g盐，3g淀粉加水勾薄芡，翻匀出锅'
    ]
  },
  // 25 油豆腐烧白菜
  tofu_puff_braised_cabbage: {
    ingredients: [I('tofu_puff',200,'g'), I('chinese_cabbage',400,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',15,'ml'), I('salt',2,'g'), I('cooking_oil',20,'ml'), I('starch',8,'g')],
    steps: [
      '油豆腐200g对半切开，开水浸泡2分钟去油（汤汁更清）',
      '大白菜400g洗净，菜帮和菜叶分开，菜帮斜刀切片，菜叶切大片',
      '热锅下20ml油下蒜末爆香',
      '下白菜帮翻炒2分钟至边缘透明',
      '加300ml热水、15ml生抽、15ml蚝油、油豆腐煮开',
      '下白菜叶煮3分钟至软，加2g盐，淀粉勾芡收汁出锅'
    ]
  },
  // 26 肉末粉丝煲
  vermicelli_pork_pot: {
    ingredients: [I('vermicelli',80,'g'), I('pork_mince',200,'g'), I('doubanjiang',15,'g'), I('garlic',15,'g'), I('ginger',10,'g'), I('light_soy',15,'ml'), I('spring_onion',15,'g'), I('cooking_oil',25,'ml'), I('cooking_wine',10,'ml')],
    steps: [
      '粉丝80g温水浸泡20分钟至软（不要全泡软，下锅再煮）',
      '猪肉末200g加5ml料酒、5ml生抽抓匀；蒜姜切末',
      '砂锅下25ml油烧热，下肉末中火煸炒至变色出油',
      '加15g豆瓣酱、姜蒜末爆出红油',
      '加400ml开水、10ml生抽、5ml料酒煮开',
      '下泡软的粉丝，盖盖小火焖煮5分钟至粉丝吸饱汤汁，撒葱花上桌'
    ]
  },
  // 27 荷兰豆炒香菇
  snow_pea_mushroom_stirfry: {
    ingredients: [I('snow_pea',250,'g'), I('shiitake_fresh',150,'g'), I('carrot',60,'g'), I('garlic',10,'g'), I('oyster_sauce',15,'ml'), I('salt',2,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '荷兰豆250g撕去两边筋，洗净沥干',
      '鲜香菇150g去蒂切片；胡萝卜切菱形片；蒜切片',
      '锅中烧水加少许盐，荷兰豆焯30秒过冷水（保持翠绿脆嫩）',
      '热锅下20ml油爆香蒜片，下香菇片翻炒1分钟出香',
      '下胡萝卜片翻炒30秒，下荷兰豆大火翻炒1分钟',
      '加15ml蚝油、2g盐翻匀，沿锅边淋少许水翻炒30秒出锅'
    ]
  },
  // 28 培根芦笋卷
  asparagus_bacon_roll: {
    ingredients: [I('asparagus',300,'g'), I('bacon',120,'g'), I('black_pepper',2,'g'), I('cooking_oil',15,'ml'), I('garlic',10,'g'), I('light_soy',5,'ml')],
    steps: [
      '芦笋300g削去根部老皮，切成与培根等长（约8cm）的段',
      '锅中烧水加少许盐，芦笋焯1分钟过冷水沥干',
      '取一片培根，包卷3-4根芦笋，用牙签固定',
      '平底锅下15ml油，培根卷接缝朝下下锅中火煎2分钟定型',
      '翻面继续煎2分钟，每面煎至培根金黄出油',
      '撒2g黑胡椒，加蒜末爆香，淋5ml生抽翻一下出锅，取出牙签装盘'
    ]
  },
  // 29 韭黄炒蛋
  leek_egg_stirfry: {
    ingredients: [I('leek',250,'g'), I('egg',4,'piece'), I('salt',3,'g'), I('light_soy',5,'ml'), I('cooking_oil',25,'ml'), I('white_pepper',1,'g')],
    steps: [
      '韭黄250g洗净沥干，切3cm段，葱白和叶分开放',
      '鸡蛋4个打散加1g盐、1g白胡椒拌匀',
      '热锅下15ml油烧至冒烟，倒入蛋液不要立即翻动',
      '待蛋液边缘凝起立即用铲子推散成大块嫩蛋盛出（不要全炒老）',
      '锅中加10ml油烧热，下韭黄白色部分大火翻炒30秒',
      '下韭黄绿色部分和炒蛋，加2g盐、5ml生抽快速翻炒30秒立即出锅'
    ]
  },
  // 30 南瓜小米粥
  pumpkin_congee: {
    ingredients: [I('pumpkin',300,'g'), I('millet',100,'g'), I('rice',30,'g'), I('rock_sugar',15,'g')],
    steps: [
      '小米100g、大米30g淘洗干净，用清水浸泡20分钟',
      '南瓜300g去皮去瓤切2cm滚刀块',
      '锅中加1500ml清水大火烧开，倒入小米和大米搅动一次',
      '盖盖转中小火煮20分钟至米开花',
      '加入南瓜块继续煮15分钟，期间不时搅拌防粘底',
      '加15g冰糖搅至融化，关火焖5分钟使粥更稠出锅'
    ]
  },
  // 31 干香菇炖鸡
  dried_mushroom_chicken_stew: {
    ingredients: [I('chicken_thigh',500,'g'), I('dried_mushroom',30,'g'), I('ginger',15,'g'), I('spring_onion',15,'g'), I('light_soy',20,'ml'), I('dark_soy',5,'ml'), I('cooking_wine',20,'ml'), I('star_anise',2,'piece'), I('rock_sugar',15,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '干香菇30g用温水浸泡1小时至完全泡软，去蒂切大块（泡香菇水留用）',
      '鸡腿500g剁3cm块，冷水下锅加姜葱料酒焯水3分钟去血沫',
      '热锅下20ml油，下15g冰糖小火炒糖色至枣红',
      '下鸡块翻炒上色，加八角、姜片葱段爆香',
      '加20ml生抽、5ml老抽、20ml料酒翻炒均匀',
      '加香菇和泡菇水（过滤后）没过鸡块，大火煮开转小火炖30分钟，开盖大火收汁出锅'
    ]
  },
  // 32 腐竹炒肉
  dried_tofu_skin_stir_fry: {
    ingredients: [I('dried_tofu_skin',100,'g'), I('pork_loin',200,'g'), I('capsicum',100,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',10,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '腐竹100g冷水浸泡3小时至完全泡软无硬芯，切4cm段',
      '猪里脊200g切薄片，加5ml生抽、10ml料酒、5g淀粉、少许水抓匀腌15分钟',
      '青红椒切菱形片；蒜切片',
      '热锅下15ml油烧热，下肉片滑炒至变色盛出',
      '锅留油爆香蒜片，下腐竹翻炒1分钟',
      '下青椒翻炒30秒，回锅肉片，加10ml生抽、10ml蚝油翻炒1分钟出锅'
    ]
  },
  // 33 番茄炒虾
  homestyle_tomato_shrimp: {
    ingredients: [I('shrimp',300,'g'), I('tomato',300,'g'), I('garlic',15,'g'), I('ginger',5,'g'), I('tomato_paste',30,'g'), I('sugar',8,'g'), I('cooking_wine',10,'ml'), I('salt',3,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '虾300g剪去虾须开背去虾线，加5ml料酒、姜片腌5分钟',
      '番茄300g顶部划十字烫水去皮，切小块；蒜切末',
      '热锅下15ml油烧热，下虾仁煎至两面变红卷起盛出',
      '锅留油下蒜末爆香，下番茄块翻炒2分钟出红汁',
      '加30g番茄酱、8g糖、3g盐继续炒1分钟出沙',
      '回锅虾仁，加50ml清水大火翻炒2分钟让虾裹满酱汁出锅'
    ]
  },
  // 34 鸡蛋豆腐煲
  homestyle_egg_tofu: {
    ingredients: [I('tofu',400,'g'), I('egg',2,'piece'), I('shiitake_fresh',80,'g'), I('spring_onion',15,'g'), I('oyster_sauce',15,'ml'), I('light_soy',10,'ml'), I('starch',10,'g'), I('cooking_oil',30,'ml')],
    steps: [
      '豆腐400g切1.5cm厚方块，撒少许盐静置5分钟出水',
      '鸡蛋2个打散；香菇切片；葱切花',
      '豆腐两面拍上一层薄淀粉，平底锅下20ml油煎至两面金黄盛出',
      '锅中加10ml油下香菇片翻炒1分钟',
      '砂锅或炒锅，铺豆腐、香菇，淋15ml蚝油、10ml生抽、150ml热水煮开',
      '将蛋液均匀淋在锅中，盖盖小火焖2分钟至蛋液凝固，撒葱花出锅'
    ]
  },
  // 35 蒜蓉蒸南瓜
  homestyle_steamed_pumpkin: {
    ingredients: [I('pumpkin',400,'g'), I('garlic',30,'g'), I('chili_pepper',10,'g'), I('light_soy',15,'ml'), I('cooking_oil',30,'ml'), I('spring_onion',10,'g')],
    steps: [
      '南瓜400g去皮去瓤切0.5cm薄片，整齐摆入盘中',
      '大蒜30g切末，红椒切碎',
      '热锅下30ml油烧至五成热，下一半蒜末小火炒至微黄盛出',
      '蒜末加剩余生蒜末、红椒、15ml生抽、少许糖盐拌成蒜蓉酱',
      '蒜蓉酱均匀铺在南瓜片上',
      '蒸锅水开后大火蒸10分钟至南瓜软透，撒葱花淋少许热油激香出锅'
    ]
  },
  // 36 冬瓜烧肉
  homestyle_braised_winter_melon_pork: {
    ingredients: [I('winter_melon',400,'g'), I('pork_belly',200,'g'), I('garlic',10,'g'), I('ginger',10,'g'), I('light_soy',15,'ml'), I('dark_soy',5,'ml'), I('oyster_sauce',10,'ml'), I('spring_onion',10,'g'), I('cooking_oil',15,'ml'), I('rock_sugar',10,'g')],
    steps: [
      '冬瓜400g去皮去瓤切3cm滚刀块；五花肉200g切1.5cm片',
      '冷锅下15ml油，下五花肉中小火煸炒至两面金黄出油',
      '加10g冰糖炒糖色，下姜蒜末爆香',
      '加15ml生抽、5ml老抽、10ml蚝油翻炒上色',
      '下冬瓜块翻炒2分钟，加300ml热水煮开',
      '转中小火炖15分钟至冬瓜透明软糯，大火收汁，撒葱花出锅'
    ]
  },
  // 37 油豆腐粉丝汤
  homestyle_tofu_puff_stew: {
    ingredients: [I('tofu_puff',150,'g'), I('vermicelli',80,'g'), I('spinach',150,'g'), I('spring_onion',10,'g'), I('salt',3,'g'), I('sesame_oil',5,'ml'), I('white_pepper',1,'g'), I('chicken_stock',1000,'ml')],
    steps: [
      '粉丝80g温水浸泡20分钟至软；油豆腐150g对半切开开水烫1分钟去油',
      '菠菜150g择洗切段；葱切花',
      '锅中加1000ml鸡汤大火烧开',
      '下油豆腐煮3分钟入味',
      '下泡软的粉丝煮3分钟',
      '下菠菜煮30秒，加3g盐、1g白胡椒、5ml香油，撒葱花出锅'
    ]
  },
  // 38 蜜汁烤鸡翅
  homestyle_roast_chicken_wing: {
    ingredients: [I('chicken_wing',500,'g'), I('light_soy',30,'ml'), I('cooking_wine',15,'ml'), I('sugar',20,'g'), I('garlic',15,'g'), I('ginger',10,'g'), I('five_spice',3,'g'), I('cooking_oil',15,'ml'), I('oyster_sauce',15,'ml')],
    steps: [
      '鸡翅500g洗净，正反面各划两刀深至骨头（更入味）',
      '腌料：30ml生抽、15ml料酒、20g糖、15ml蚝油、3g五香粉、姜蒜末拌匀',
      '鸡翅入腌料抓匀，覆保鲜膜冷藏腌制至少2小时（最好过夜）',
      '烤箱预热200℃；烤盘铺锡纸，刷一层油，鸡翅整齐摆入',
      '烤箱中层200℃烤15分钟，取出翻面，刷上腌料汁',
      '继续烤15分钟至表皮金黄，最后5分钟刷蜂蜜水（糖+水）使其上色发亮即可出炉'
    ]
  },
  // 39 蒜蓉烤茄子
  homestyle_roast_eggplant: {
    ingredients: [I('eggplant',400,'g'), I('garlic',30,'g'), I('chili_pepper',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',10,'ml'), I('cooking_oil',25,'ml'), I('spring_onion',10,'g')],
    steps: [
      '长茄子400g洗净擦干，整根直接放在烤箱网架上',
      '烤箱220℃烤25分钟至茄皮焦黑、茄肉软烂',
      '取出稍凉，从中间剖开但不切断，茄肉用刀划成长条',
      '蒜30g切末，红椒切圈，葱切花',
      '热锅下25ml油爆香蒜末和红椒，加15ml生抽、10ml蚝油拌成蒜蓉汁',
      '蒜蓉汁均匀浇在茄子上，撒葱花，再回烤箱200℃烤5分钟即可'
    ]
  },
  // 40 烤五花肉
  homestyle_roast_pork_belly: {
    ingredients: [I('pork_belly',500,'g'), I('light_soy',20,'ml'), I('cooking_wine',20,'ml'), I('cumin',10,'g'), I('chili_flakes',8,'g'), I('garlic',15,'g'), I('sugar',10,'g'), I('cooking_oil',10,'ml'), I('salt',5,'g')],
    steps: [
      '五花肉500g切0.8cm厚片',
      '腌料：20ml生抽、20ml料酒、10g糖、5g盐、5g孜然粉、4g辣椒粉、蒜末抓匀',
      '五花肉与腌料抓匀，冷藏腌制1小时',
      '烤箱预热200℃；烤盘铺锡纸刷油，五花肉单层平铺',
      '200℃烤15分钟，取出翻面撒上剩余孜然粉和辣椒粉',
      '继续烤10分钟至表面金黄微焦、油脂渗出，蘸蒜末蘸料食用'
    ]
  },
  // 41 红薯炒肉片
  homestyle_stir_fry_sweet_potato: {
    ingredients: [I('sweet_potato',300,'g'), I('pork_loin',150,'g'), I('capsicum',80,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',5,'g'), I('salt',3,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '红薯300g去皮切0.3cm薄片，浸入清水防氧化',
      '猪里脊150g切薄片，加5ml生抽、10ml料酒、5g淀粉腌10分钟；青椒切片',
      '锅中烧水，红薯片焯1分钟（半熟）捞出沥干',
      '热锅下25ml油烧热，下肉片滑炒至变色盛出',
      '锅留油下蒜片爆香，下红薯片翻炒2分钟',
      '回锅肉片，下青椒、10ml生抽、3g盐翻炒1分钟出锅'
    ]
  },
  // 42 玉米冬瓜排骨汤
  homestyle_corn_rib_soup: {
    ingredients: [I('pork_ribs',500,'g'), I('corn',300,'g'), I('winter_melon',300,'g'), I('ginger',15,'g'), I('spring_onion',15,'g'), I('cooking_wine',15,'ml'), I('salt',5,'g')],
    steps: [
      '排骨500g冷水下锅加姜葱料酒焯水5分钟，捞出冲洗干净',
      '玉米300g切3cm段；冬瓜300g去皮去瓤切3cm块',
      '排骨入砂锅加1500ml热水、姜片葱段、5ml料酒大火煮开',
      '撇去浮沫转小火炖30分钟',
      '加玉米段继续炖20分钟',
      '加冬瓜块炖15分钟至冬瓜透明，加5g盐调味，撒葱花出锅'
    ]
  },
  // 43 玉米炒虾仁
  homestyle_stir_fry_corn_pine_nut: {
    ingredients: [I('corn',250,'g'), I('shrimp',200,'g'), I('cucumber',150,'g'), I('carrot',80,'g'), I('cooking_wine',10,'ml'), I('salt',3,'g'), I('starch',8,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '虾仁200g开背去虾线，加5ml料酒、1g盐、5g淀粉、1g白胡椒抓匀腌10分钟',
      '玉米250g剥粒；黄瓜、胡萝卜切1cm丁',
      '锅中烧水，玉米粒、胡萝卜丁焯1分钟过冷水沥干',
      '热锅下15ml油烧热，下虾仁滑炒至变红卷起盛出',
      '锅留油下胡萝卜玉米翻炒1分钟',
      '下黄瓜丁、虾仁，加2g盐翻炒30秒，3g淀粉加水勾薄芡出锅'
    ]
  },
  // 44 菠菜豆腐汤
  homestyle_spinach_tofu_soup: {
    ingredients: [I('spinach',250,'g'), I('tofu',300,'g'), I('egg',1,'piece'), I('ginger',5,'g'), I('salt',3,'g'), I('sesame_oil',5,'ml'), I('white_pepper',1,'g')],
    steps: [
      '菠菜250g择洗后切4cm段，焯水30秒去草酸，过冷水沥干',
      '豆腐300g切1.5cm方块；鸡蛋1个打散',
      '锅中加800ml清水加姜片煮开',
      '下豆腐块煮5分钟使豆腐入味',
      '加3g盐、1g白胡椒，缓缓淋入蛋液形成蛋花',
      '下菠菜煮30秒，淋5ml香油出锅'
    ]
  },
  // 45 肉末蒸豆腐
  homestyle_steamed_tofu_with_pork: {
    ingredients: [I('tofu',400,'g'), I('pork_mince',150,'g'), I('spring_onion',15,'g'), I('light_soy',20,'ml'), I('oyster_sauce',10,'ml'), I('ginger',10,'g'), I('cooking_wine',10,'ml'), I('cooking_oil',15,'ml')],
    steps: [
      '嫩豆腐400g切1.5cm方块整齐摆盘，撒少许盐静置5分钟',
      '猪肉末150g加10ml生抽、10ml料酒、姜末、少许油抓匀腌10分钟',
      '热锅下15ml油，下肉末中火煸炒至变色出油',
      '加10ml生抽、10ml蚝油炒匀，关火备用',
      '蒸锅水开后将豆腐入锅大火蒸8分钟，倒掉盘中析出的水',
      '炒好的肉末铺在豆腐上继续蒸3分钟，撒葱花淋少许热油激香出锅'
    ]
  },
  // 46 鸡蛋炒粉丝
  homestyle_egg_fried_vermicelli: {
    ingredients: [I('vermicelli',100,'g'), I('egg',3,'piece'), I('cabbage',200,'g'), I('spring_onion',15,'g'), I('light_soy',15,'ml'), I('salt',2,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '粉丝100g温水浸泡20分钟至软，沥干',
      '卷心菜200g切丝；鸡蛋3个打散加少许盐；葱切花',
      '热锅下15ml油烧热，倒入蛋液炒至凝固成块盛出',
      '锅中加10ml油下卷心菜大火翻炒2分钟至塌身',
      '下泡软的粉丝、15ml生抽、2g盐翻炒2分钟',
      '回锅鸡蛋，撒葱花翻匀出锅'
    ]
  },
  // 47 凉拌藕片
  cold_lotus_root_salad: {
    ingredients: [I('lotus_root',400,'g'), I('chili_pepper',10,'g'), I('garlic',15,'g'), I('white_vinegar',20,'ml'), I('light_soy',10,'ml'), I('sugar',5,'g'), I('sesame_oil',10,'ml'), I('spring_onion',10,'g')],
    steps: [
      '莲藕400g去皮切0.3cm薄片，立刻浸入加白醋的清水中防氧化',
      '锅中烧水加少许白醋（保持藕片洁白），藕片焯2分钟至断生',
      '焯好的藕片立即过冷水浸凉，沥干装盘',
      '蒜捣成泥，红椒切碎，葱切花',
      '蒜泥、红椒、20ml白醋、10ml生抽、5g糖、10ml香油拌匀成料汁',
      '料汁淋在藕片上拌匀，冷藏15分钟更入味后撒葱花上桌'
    ]
  },
  // 48 凉拌木耳黄瓜
  cold_wood_ear_salad: {
    ingredients: [I('wood_ear',20,'g'), I('cucumber',300,'g'), I('garlic',15,'g'), I('chili_pepper',10,'g'), I('black_vinegar',20,'ml'), I('light_soy',10,'ml'), I('sesame_oil',10,'ml'), I('sugar',3,'g')],
    steps: [
      '干木耳20g冷水泡发2小时（不可用热水），撕小朵',
      '锅中烧水，木耳焯水2分钟（确保彻底煮熟）捞出过冷水',
      '黄瓜300g洗净，用刀面拍裂切3cm段，加少许盐腌5分钟去水',
      '蒜捣成泥，红椒切圈',
      '蒜泥、红椒、20ml陈醋、10ml生抽、3g糖、10ml香油拌匀',
      '木耳与黄瓜放入大碗，倒入料汁拌匀，冷藏10分钟入味装盘'
    ]
  },
  // 49 凉拌腐竹
  cold_tofu_skin_salad: {
    ingredients: [I('dried_tofu_skin',100,'g'), I('celery',150,'g'), I('carrot',80,'g'), I('garlic',15,'g'), I('chili_flakes',5,'g'), I('black_vinegar',15,'ml'), I('light_soy',10,'ml'), I('sesame_oil',10,'ml'), I('sugar',3,'g')],
    steps: [
      '腐竹100g冷水浸泡3小时至完全泡软无硬芯（充分泡发），切4cm段',
      '芹菜150g去叶撕筋切4cm段；胡萝卜切丝',
      '锅中烧水加少许盐，腐竹焯1分钟、芹菜胡萝卜焯30秒，分别过冷水沥干',
      '蒜捣泥，与5g辣椒粉一起放小碗中',
      '锅中烧10ml油至冒烟，浇在蒜泥辣椒粉上激出香味',
      '加15ml陈醋、10ml生抽、3g糖、10ml香油拌匀，与腐竹芹菜胡萝卜拌匀装盘'
    ]
  },
  // 50 盐水毛豆
  salt_edamame: {
    ingredients: [I('edamame',500,'g'), I('star_anise',2,'piece'), I('bay_leaf',2,'piece'), I('sichuan_pepper',5,'g'), I('salt',15,'g'), I('garlic',15,'g'), I('chili_pepper',10,'g')],
    steps: [
      '毛豆500g用剪刀剪去两端（更易入味），加1勺盐反复揉搓3分钟',
      '揉搓后冲洗干净，沥干水分',
      '锅中加1500ml清水，加八角、香叶、花椒、拍碎的蒜瓣、干辣椒、15g盐大火煮开',
      '煮开后转小火继续煮5分钟让香料出味',
      '下毛豆大火煮5分钟（保持翠绿不要久煮）',
      '关火盖盖浸泡至少30分钟（最好2小时）入味，捞出装盘可冷藏后食用'
    ]
  },
  // 51 凉拌香干
  cold_dried_tofu_salad: {
    ingredients: [I('dried_tofu',300,'g'), I('celery',150,'g'), I('carrot',60,'g'), I('garlic',10,'g'), I('chili_pepper',8,'g'), I('light_soy',15,'ml'), I('black_vinegar',10,'ml'), I('sesame_oil',10,'ml'), I('sugar',3,'g')],
    steps: [
      '香干300g切0.3cm细丝',
      '芹菜150g去叶撕筋切4cm段；胡萝卜切细丝',
      '锅中烧水加少许盐和油，香干、芹菜、胡萝卜分别焯30秒过冷水沥干',
      '蒜捣泥，红椒切圈',
      '蒜泥、红椒、15ml生抽、10ml陈醋、3g糖、10ml香油调成料汁',
      '所有食材放入大碗，倒入料汁拌匀冷藏10分钟入味装盘'
    ]
  },
  // 52 凉拌粉丝
  cold_vermicelli_salad: {
    ingredients: [I('vermicelli',100,'g'), I('cucumber',150,'g'), I('carrot',60,'g'), I('garlic',15,'g'), I('chili_flakes',5,'g'), I('black_vinegar',15,'ml'), I('light_soy',15,'ml'), I('sesame_oil',10,'ml'), I('sugar',5,'g')],
    steps: [
      '粉丝100g开水浸泡10分钟至软透，过冷水沥干用剪刀剪短',
      '黄瓜、胡萝卜切细丝',
      '蒜捣成泥放小碗，加5g辣椒粉',
      '锅中烧10ml油至冒烟，浇在蒜泥辣椒粉上激香',
      '加15ml陈醋、15ml生抽、5g糖、10ml香油拌匀成料汁',
      '粉丝与黄瓜胡萝卜丝放大碗，倒入料汁拌匀装盘'
    ]
  },
  // 53 香菇青菜
  shiitake_bok_choy: {
    ingredients: [I('shiitake_fresh',150,'g'), I('bok_choy',400,'g'), I('garlic',15,'g'), I('oyster_sauce',15,'ml'), I('light_soy',5,'ml'), I('starch',5,'g'), I('cooking_oil',20,'ml'), I('salt',2,'g')],
    steps: [
      '鲜香菇150g去蒂切片；青菜400g洗净对半剖开',
      '锅中烧水加少许盐和油，青菜焯30秒过冷水保持翠绿',
      '青菜整齐围绕摆在盘中（菜心朝外）',
      '热锅下20ml油爆香蒜片，下香菇片大火翻炒2分钟出香',
      '加15ml蚝油、5ml生抽、2g盐、100ml热水煮1分钟',
      '5g淀粉加水勾芡至浓稠，将香菇连汁浇在青菜中央上桌'
    ]
  },
  // 54 韭菜炒豆干
  chives_dried_tofu_stirfry: {
    ingredients: [I('leek',200,'g'), I('dried_tofu',250,'g'), I('garlic',10,'g'), I('chili_pepper',8,'g'), I('light_soy',15,'ml'), I('salt',2,'g'), I('cooking_oil',25,'ml')],
    steps: [
      '韭菜200g洗净切4cm段，韭白和韭叶分开',
      '香干250g切0.5cm厚条',
      '热锅下15ml油烧热，下香干条煎至两面微黄盛出',
      '锅中加10ml油爆香蒜末和红椒',
      '下韭白翻炒30秒，回锅香干翻炒1分钟',
      '加15ml生抽、2g盐，下韭叶大火翻炒30秒立即出锅'
    ]
  },
  // 55 茄子豆腐煲
  eggplant_tofu_pot: {
    ingredients: [I('eggplant',300,'g'), I('tofu',300,'g'), I('pork_mince',100,'g'), I('garlic',15,'g'), I('doubanjiang',15,'g'), I('light_soy',15,'ml'), I('sugar',5,'g'), I('cooking_oil',40,'ml'), I('spring_onion',10,'g')],
    steps: [
      '茄子300g切3cm滚刀块，盐水浸泡5分钟（防变黑且少吸油）',
      '豆腐300g切2cm方块，平底锅下20ml油煎至两面金黄盛出',
      '茄子沥干，锅中加20ml油下茄子煎至变软出油盛出',
      '锅留底油下肉末炒散，加15g豆瓣酱、蒜末爆出红油',
      '砂锅依次铺豆腐、茄子，倒入炒好的肉末',
      '加200ml热水、15ml生抽、5g糖煮开，转小火焖8分钟收汁，撒葱花上桌'
    ]
  },
  // 56 肉丝炒豆芽
  pork_shred_bean_sprout: {
    ingredients: [I('bean_sprouts',300,'g'), I('pork_loin',150,'g'), I('chili_pepper',10,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',5,'g'), I('vinegar',5,'ml'), I('cooking_oil',20,'ml')],
    steps: [
      '猪里脊150g切细丝，加5ml生抽、10ml料酒、5g淀粉抓匀腌10分钟',
      '绿豆芽300g洗净掐去两端（豆芽更脆）；红椒切丝；蒜切片',
      '热锅下15ml油烧热，下肉丝滑炒至变色盛出',
      '锅留油爆香蒜片红椒',
      '下豆芽大火翻炒1分钟（保持脆嫩）',
      '回锅肉丝，沿锅边淋5ml醋、加10ml生抽，大火翻炒30秒出锅'
    ]
  },
  // 57 黄瓜炒肉片
  cucumber_pork_stirfry: {
    ingredients: [I('cucumber',300,'g'), I('pork_loin',200,'g'), I('garlic',10,'g'), I('chili_pepper',8,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',5,'g'), I('salt',2,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '猪里脊200g切薄片，加5ml生抽、10ml料酒、5g淀粉抓匀腌10分钟',
      '黄瓜300g洗净切0.3cm斜片；蒜切片，红椒切圈',
      '热锅下15ml油烧热，下肉片滑炒至变色盛出',
      '锅留底油爆香蒜片红椒',
      '下黄瓜片大火翻炒30秒（不可久炒，保持脆爽）',
      '回锅肉片，加10ml生抽、2g盐翻炒30秒立即出锅'
    ]
  },
  // 58 西葫芦炒虾仁
  stir_fry_shrimp_zucchini: {
    ingredients: [I('zucchini',300,'g'), I('shrimp',200,'g'), I('garlic',10,'g'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('salt',3,'g'), I('cooking_oil',20,'ml'), I('white_pepper',1,'g')],
    steps: [
      '虾仁200g开背去虾线，加5ml料酒、1g盐、1g白胡椒、5g淀粉抓匀腌10分钟',
      '西葫芦300g洗净切0.3cm薄片',
      '热锅下15ml油烧热，下虾仁滑炒至变红卷起盛出',
      '锅留油爆香蒜片',
      '下西葫芦大火翻炒2分钟至边缘透明',
      '回锅虾仁，加3g盐翻炒30秒，3g淀粉加水勾薄芡出锅'
    ]
  },
  // 59 洋葱炒牛肉
  onion_beef_stirfry: {
    ingredients: [I('beef_sirloin',250,'g'), I('onion',200,'g'), I('capsicum',100,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',15,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',25,'ml'), I('black_pepper',2,'g')],
    steps: [
      '牛肉250g逆纹切薄片，加5ml生抽、10ml料酒、5g淀粉、5ml油、2g黑胡椒抓匀腌15分钟',
      '洋葱200g切宽丝；青椒切片；蒜切片',
      '热锅下20ml油烧至冒烟，下牛肉大火快速翻炒至变色盛出',
      '锅留油下蒜片洋葱大火翻炒1分钟出香',
      '下青椒翻炒30秒',
      '回锅牛肉，加10ml生抽、15ml蚝油、3g淀粉加水勾薄芡，大火翻匀出锅'
    ]
  },
  // 60 蘑菇烧豆腐
  mushroom_braised_tofu: {
    ingredients: [I('mushroom',200,'g'), I('tofu',400,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',15,'ml'), I('sugar',5,'g'), I('starch',8,'g'), I('cooking_oil',30,'ml'), I('spring_onion',10,'g')],
    steps: [
      '豆腐400g切2cm方块，撒盐静置5分钟出水',
      '蘑菇200g洗净切片；蒜切片，葱切花',
      '平底锅下20ml油，豆腐块下锅煎至两面金黄盛出',
      '锅中加10ml油下蒜片爆香，下蘑菇翻炒2分钟',
      '加15ml生抽、15ml蚝油、5g糖、200ml热水煮开',
      '回锅煎好的豆腐煮5分钟入味，淀粉勾芡收汁，撒葱花出锅'
    ]
  },
  // 61 咖喱鸡腿饭
  curry_chicken_thigh_rice: {
    ingredients: [I('chicken_thigh',400,'g'), I('potato',200,'g'), I('carrot',150,'g'), I('onion',150,'g'), I('rice',300,'g'), I('butter',20,'g'), I('cooking_oil',20,'ml'), I('salt',3,'g'), I('milk',100,'ml')],
    steps: [
      '鸡腿肉400g切3cm块；土豆胡萝卜切2cm滚刀块；洋葱切丁',
      '大米300g洗净加适量水煮成米饭备用',
      '热锅下20ml油，下鸡腿肉煎至两面金黄盛出',
      '锅中加20g黄油融化，下洋葱炒至透明，加土豆胡萝卜翻炒2分钟',
      '加500ml热水煮开，回锅鸡块，加咖喱块（家中常备品，约80g）小火炖15分钟',
      '加100ml牛奶搅匀煮3分钟使咖喱浓稠丝滑，加3g盐调味，浇在米饭上即可'
    ]
  },
  // 62 日式蒸蛋豆腐
  japanese_steamed_tofu_egg: {
    ingredients: [I('egg',3,'piece'), I('tofu',200,'g'), I('shrimp',80,'g'), I('shiitake_fresh',50,'g'), I('light_soy',10,'ml'), I('salt',2,'g'), I('chicken_stock',300,'ml'), I('spring_onion',10,'g')],
    steps: [
      '鸡蛋3个打散加2g盐、300ml温热鸡汤搅匀，过筛去除泡沫（口感更细嫩）',
      '嫩豆腐200g切1.5cm小方块；虾仁80g开背；香菇切薄片',
      '碗底铺豆腐块、香菇片、虾仁',
      '缓缓倒入过筛后的蛋液，覆盖一层耐热保鲜膜（防止水汽滴入）',
      '蒸锅水开后转小火（避免大火使蛋羹起蜂窝），蒸15分钟',
      '关火焖2分钟揭开，淋10ml生抽撒葱花即可上桌'
    ]
  },
  // 63 五花肉烧豆腐
  pork_belly_braised_tofu: {
    ingredients: [I('pork_belly',250,'g'), I('tofu',400,'g'), I('garlic',10,'g'), I('ginger',10,'g'), I('light_soy',20,'ml'), I('dark_soy',5,'ml'), I('cooking_wine',10,'ml'), I('rock_sugar',15,'g'), I('cooking_oil',15,'ml'), I('spring_onion',10,'g')],
    steps: [
      '五花肉250g切1cm片；豆腐400g切2cm方块',
      '平底锅下15ml油，豆腐煎至两面金黄盛出',
      '锅中下五花肉小火煸炒至两面金黄出油',
      '加15g冰糖炒糖色，下姜蒜爆香，加20ml生抽、5ml老抽、10ml料酒炒匀',
      '加300ml热水煮开，下煎好的豆腐',
      '中小火炖15分钟使豆腐吸饱汤汁，大火收汁，撒葱花出锅'
    ]
  },
  // 64 圆白菜炒肉
  cabbage_pork_stirfry: {
    ingredients: [I('cabbage',400,'g'), I('pork_loin',150,'g'), I('garlic',10,'g'), I('chili_pepper',8,'g'), I('light_soy',15,'ml'), I('vinegar',5,'ml'), I('cooking_wine',10,'ml'), I('cooking_oil',20,'ml'), I('salt',2,'g')],
    steps: [
      '猪里脊150g切薄片，加5ml生抽、10ml料酒、5g淀粉抓匀腌10分钟',
      '卷心菜400g洗净，用手撕成大片（手撕比刀切更入味）',
      '蒜切片，干辣椒切段',
      '热锅下15ml油烧热，下肉片滑炒至变色盛出',
      '锅留油爆香蒜片干辣椒，下卷心菜大火翻炒2分钟至塌身',
      '回锅肉片，沿锅边淋5ml醋、10ml生抽、加2g盐翻炒1分钟出锅'
    ]
  },
  // 65 番茄肉酱面
  tomato_meat_sauce_noodle: {
    ingredients: [I('noodles_dried',200,'g'), I('beef_mince',200,'g'), I('tomato',300,'g'), I('onion',100,'g'), I('garlic',10,'g'), I('tomato_paste',60,'g'), I('cooking_oil',20,'ml'), I('salt',3,'g'), I('sugar',5,'g'), I('black_pepper',2,'g')],
    steps: [
      '番茄300g顶部划十字烫水去皮切丁；洋葱蒜切末',
      '热锅下20ml油，下牛肉末炒散至变色出油',
      '加洋葱末蒜末翻炒2分钟出香',
      '加番茄丁、60g番茄酱小火炒5分钟出红汁，加5g糖、3g盐、2g黑胡椒',
      '加200ml热水小火煮10分钟至浓稠成肉酱',
      '另起锅煮意面（挂面）8分钟至软硬适中，捞出装盘，淋上肉酱拌匀食用'
    ]
  },
  // 66 莲藕炒肉片
  lotus_root_pork_stirfry: {
    ingredients: [I('lotus_root',300,'g'), I('pork_loin',150,'g'), I('chili_pepper',10,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',5,'g'), I('salt',2,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '莲藕300g去皮切0.3cm薄片，浸入清水加少许白醋（防氧化）',
      '猪里脊150g切薄片，加5ml生抽、10ml料酒、5g淀粉抓匀腌10分钟',
      '热锅下15ml油烧热，下肉片滑炒至变色盛出',
      '锅留底油爆香蒜片红椒',
      '下藕片大火翻炒2分钟（保持脆爽）',
      '回锅肉片，加10ml生抽、2g盐翻炒1分钟出锅'
    ]
  },
  // 67 冬瓜丸子汤
  winter_melon_meatball_soup: {
    ingredients: [I('pork_mince',250,'g'), I('winter_melon',400,'g'), I('egg',1,'piece'), I('starch',15,'g'), I('ginger',10,'g'), I('spring_onion',15,'g'), I('cooking_wine',10,'ml'), I('salt',5,'g'), I('white_pepper',2,'g'), I('sesame_oil',5,'ml')],
    steps: [
      '猪肉末250g加1个蛋清、15g淀粉、10ml料酒、3g盐、姜末葱末顺一个方向搅打至上劲',
      '冬瓜400g去皮去瓤切0.3cm薄片',
      '锅中加1000ml清水加姜片煮开',
      '一手抓肉馅从虎口挤出丸子，另一手用勺子刮入锅中（手法熟练后丸子大小均匀）',
      '丸子全部下锅后大火煮3分钟，撇去浮沫',
      '下冬瓜片煮5分钟至透明，加2g盐、2g白胡椒，淋5ml香油撒葱花出锅'
    ]
  },
  // 68 牛肉炖萝卜
  beef_radish_stew: {
    ingredients: [I('beef_shank',500,'g'), I('white_radish',500,'g'), I('ginger',20,'g'), I('spring_onion',20,'g'), I('star_anise',2,'piece'), I('bay_leaf',2,'piece'), I('cooking_wine',20,'ml'), I('salt',5,'g'), I('light_soy',15,'ml')],
    steps: [
      '牛腱子500g切3cm块，冷水下锅加姜葱料酒焯水5分钟，捞出冲洗干净',
      '白萝卜500g去皮切3cm滚刀块',
      '砂锅加1500ml热水，放入牛肉、姜片葱段、八角、香叶、15ml生抽',
      '大火煮开转小火炖60分钟至牛肉用筷子能轻松扎透',
      '加白萝卜继续炖30分钟至萝卜软透',
      '加5g盐调味再炖5分钟，撒葱花出锅'
    ]
  },
  // 69 炸鱿鱼圈
  fried_squid_ring: {
    ingredients: [I('squid',400,'g'), I('flour',100,'g'), I('starch',50,'g'), I('egg',2,'piece'), I('salt',3,'g'), I('white_pepper',3,'g'), I('cooking_oil',500,'ml'), I('cooking_wine',10,'ml')],
    steps: [
      '鱿鱼400g洗净去内脏，切1.5cm宽圈，用厨房纸吸干水分',
      '鱿鱼圈用10ml料酒、3g盐、2g白胡椒抓匀腌10分钟',
      '面糊：100g面粉、50g淀粉、2个鸡蛋、1g白胡椒、150ml清水搅匀至顺滑无颗粒',
      '锅中倒油烧至170℃（筷子下锅冒小泡）',
      '鱿鱼圈裹满面糊抖掉多余，单个下锅炸2分钟至浮起金黄捞出',
      '油温升至190℃，复炸30秒至外壳酥脆，捞出沥油装盘'
    ]
  },
  // 70 萝卜丝炒肉
  radish_pork_stirfry: {
    ingredients: [I('white_radish',400,'g'), I('pork_loin',150,'g'), I('garlic',10,'g'), I('chili_pepper',8,'g'), I('light_soy',15,'ml'), I('cooking_wine',10,'ml'), I('starch',5,'g'), I('salt',3,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '白萝卜400g去皮切0.3cm细丝，加3g盐腌10分钟出水后挤干',
      '猪里脊150g切细丝，加5ml生抽、10ml料酒、5g淀粉抓匀腌10分钟',
      '热锅下15ml油烧热，下肉丝滑炒至变色盛出',
      '锅留底油爆香蒜末红椒',
      '下萝卜丝大火翻炒2分钟至变软',
      '回锅肉丝，加10ml生抽翻炒1分钟出锅'
    ]
  },
  // 71 卤蛋红烧肉
  braised_pork_with_egg: {
    ingredients: [I('pork_belly',500,'g'), I('egg',6,'piece'), I('rock_sugar',40,'g'), I('dark_soy',10,'ml'), I('light_soy',20,'ml'), I('cooking_wine',30,'ml'), I('ginger',15,'g'), I('star_anise',2,'piece'), I('cooking_oil',15,'ml')],
    steps: [
      '鸡蛋6个冷水下锅煮8分钟，过冷水剥壳备用',
      '五花肉500g切3cm块，冷水下锅加姜葱料酒焯水5分钟',
      '冷锅下15ml油加40g冰糖小火炒糖色至枣红',
      '下肉块翻炒上色，加八角姜片爆香',
      '加30ml料酒、20ml生抽、10ml老抽炒匀，加开水没过肉',
      '大火煮开转小火炖40分钟，放入剥壳鸡蛋继续炖20分钟，开盖大火收汁出锅'
    ]
  },
  // 72 彩椒炒鸡丁
  bell_pepper_chicken_dice: {
    ingredients: [I('chicken_breast',250,'g'), I('capsicum',200,'g'), I('onion',80,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',10,'ml'), I('cooking_wine',10,'ml'), I('starch',8,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '鸡胸肉250g切1.5cm丁，加5ml生抽、10ml料酒、5g淀粉、少许油抓匀腌15分钟',
      '红黄青椒共200g切2cm块；洋葱切块；蒜切片',
      '热锅下15ml油烧热，下鸡丁大火滑炒至变白盛出',
      '锅留油下蒜片洋葱爆香',
      '下彩椒翻炒30秒（保持脆爽）',
      '回锅鸡丁，加10ml生抽、10ml蚝油翻炒1分钟出锅'
    ]
  },
  // 73 肉酿油豆腐
  meat_stuffed_tofu_puff: {
    ingredients: [I('tofu_puff',300,'g'), I('pork_mince',200,'g'), I('egg',1,'piece'), I('spring_onion',15,'g'), I('ginger',10,'g'), I('light_soy',20,'ml'), I('oyster_sauce',15,'ml'), I('starch',10,'g'), I('cooking_oil',15,'ml'), I('cooking_wine',10,'ml')],
    steps: [
      '猪肉末200g加1个鸡蛋、10g淀粉、10ml生抽、10ml料酒、姜末葱末顺时针搅打上劲',
      '油豆腐300g用筷子在中间戳一个洞（不要戳穿）',
      '将肉馅塞入油豆腐内压实',
      '砂锅下15ml油爆香姜片，整齐摆入酿好的油豆腐',
      '加300ml热水、10ml生抽、15ml蚝油煮开',
      '中小火焖15分钟至肉馅熟透汤汁浓稠，撒葱花上桌'
    ]
  },
  // 74 红焖羊肉
  red_braised_lamb: {
    ingredients: [I('lamb_leg',500,'g'), I('white_radish',300,'g'), I('ginger',20,'g'), I('spring_onion',20,'g'), I('star_anise',2,'piece'), I('bay_leaf',2,'piece'), I('cumin',5,'g'), I('dark_soy',10,'ml'), I('light_soy',20,'ml'), I('rock_sugar',20,'g'), I('cooking_wine',30,'ml'), I('cooking_oil',20,'ml')],
    steps: [
      '羊腿肉500g切3cm块，冷水下锅加姜葱料酒焯水5分钟，撇沫捞出',
      '白萝卜300g切3cm滚刀块（去羊膻味）',
      '热锅下20ml油加20g冰糖炒糖色至枣红',
      '下羊肉翻炒上色，加八角香叶孜然姜片爆香',
      '加30ml料酒、20ml生抽、10ml老抽翻炒，加热水没过羊肉',
      '大火煮开转小火炖60分钟，加白萝卜继续炖30分钟，大火收汁出锅'
    ]
  },
  // 75 奶油玉米浓汤
  cream_corn_soup: {
    ingredients: [I('corn',400,'g'), I('milk',300,'ml'), I('cream',100,'ml'), I('butter',30,'g'), I('flour',15,'g'), I('onion',80,'g'), I('salt',3,'g'), I('black_pepper',2,'g'), I('chicken_stock',500,'ml')],
    steps: [
      '玉米400g剥粒，留少许装饰，其余打成细腻玉米浆',
      '洋葱80g切碎',
      '锅中30g黄油融化，下洋葱碎炒至透明出香',
      '加15g面粉小火炒1分钟成面糊（注意不要焦）',
      '缓缓倒入500ml鸡汤搅匀至无颗粒，加玉米浆煮5分钟',
      '加300ml牛奶、100ml淡奶油、3g盐、2g黑胡椒煮3分钟，撒玉米粒装饰出锅'
    ]
  },
  // 76 蒜炒南瓜
  garlic_pumpkin_stirfry: {
    ingredients: [I('pumpkin',400,'g'), I('garlic',20,'g'), I('chili_pepper',8,'g'), I('light_soy',10,'ml'), I('salt',3,'g'), I('cooking_oil',25,'ml'), I('spring_onion',10,'g')],
    steps: [
      '南瓜400g去皮去瓤切0.5cm薄片（薄片更易熟）',
      '蒜20g切末（要够多才香），干辣椒切段，葱切花',
      '热锅下25ml油烧至七成热',
      '下蒜末和干辣椒爆香至蒜微黄',
      '下南瓜片大火翻炒3分钟至边缘软透',
      '加10ml生抽、3g盐翻炒1分钟，撒葱花出锅'
    ]
  },
  // 77 油豆腐炒粉丝
  tofu_puff_vermicelli_stirfry: {
    ingredients: [I('tofu_puff',200,'g'), I('vermicelli',80,'g'), I('chinese_cabbage',150,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('oyster_sauce',10,'ml'), I('cooking_oil',20,'ml'), I('spring_onion',10,'g')],
    steps: [
      '粉丝80g温水浸泡20分钟至软；油豆腐200g开水烫1分钟去油切条',
      '白菜150g切丝；蒜切末',
      '热锅下20ml油下蒜末爆香',
      '下白菜丝翻炒1分钟至塌身',
      '下油豆腐、粉丝、加200ml热水、15ml生抽、10ml蚝油煮开',
      '中火焖煮5分钟至粉丝吸饱汤汁，撒葱花出锅'
    ]
  },
  // 78 芦笋炒蘑菇
  asparagus_mushroom_stirfry: {
    ingredients: [I('asparagus',250,'g'), I('mushroom',200,'g'), I('garlic',10,'g'), I('oyster_sauce',15,'ml'), I('salt',2,'g'), I('cooking_oil',20,'ml'), I('butter',10,'g')],
    steps: [
      '芦笋250g削去根部老皮切4cm段',
      '蘑菇200g切片；蒜切片',
      '锅中烧水加少许盐和油，芦笋焯1分钟过冷水沥干',
      '热锅下20ml油下10g黄油融化',
      '下蒜片蘑菇大火翻炒2分钟出香',
      '下芦笋翻炒1分钟，加15ml蚝油、2g盐翻炒30秒出锅'
    ]
  },
  // 79 番茄蛋花汤
  tomato_egg_drop_soup: {
    ingredients: [I('tomato',300,'g'), I('egg',2,'piece'), I('spring_onion',10,'g'), I('salt',3,'g'), I('white_pepper',1,'g'), I('sesame_oil',5,'ml'), I('starch',10,'g'), I('cooking_oil',10,'ml')],
    steps: [
      '番茄300g顶部划十字烫水去皮切丁；鸡蛋2个打散',
      '热锅下10ml油下番茄丁翻炒2分钟出红汁',
      '加800ml热水大火煮开',
      '加3g盐、1g白胡椒调味',
      '10g淀粉加水勾薄芡',
      '关小火缓缓淋入蛋液形成蛋花，淋5ml香油撒葱花出锅'
    ]
  },
  // 80 青椒土豆片
  green_pepper_potato_slice: {
    ingredients: [I('potato',300,'g'), I('capsicum',150,'g'), I('garlic',10,'g'), I('chili_pepper',5,'g'), I('light_soy',15,'ml'), I('white_vinegar',5,'ml'), I('salt',3,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '土豆300g去皮切0.3cm薄片，浸水洗去淀粉',
      '青椒150g去籽切菱形片；蒜切片，干辣椒切段',
      '锅中烧水，土豆片焯1分钟（半熟）捞出沥干',
      '热锅下20ml油下蒜片干辣椒爆香',
      '下土豆片翻炒2分钟，下青椒翻炒1分钟',
      '沿锅边淋5ml白醋、10ml生抽、加3g盐翻炒30秒出锅'
    ]
  },
  // 81 莲藕蒸肉饼
  lotus_root_steamed_meat: {
    ingredients: [I('pork_mince',300,'g'), I('lotus_root',200,'g'), I('egg',1,'piece'), I('spring_onion',15,'g'), I('ginger',10,'g'), I('light_soy',20,'ml'), I('starch',10,'g'), I('cooking_wine',10,'ml'), I('cooking_oil',10,'ml')],
    steps: [
      '莲藕200g去皮擦成细丝，挤干水分',
      '猪肉末300g加莲藕丝、1个鸡蛋、10g淀粉、20ml生抽、10ml料酒、姜末葱末顺时针搅打至上劲',
      '将肉馅捏成扁平圆饼摆入盘中（厚约1.5cm）',
      '蒸锅水开后将肉饼入锅大火蒸20分钟',
      '蒸好的肉饼倒掉多余汁水',
      '另起锅烧10ml油至冒烟，淋在肉饼上撒葱花激香即可'
    ]
  },
  // 82 鸡肉玉米汤
  chicken_corn_soup: {
    ingredients: [I('chicken_breast',200,'g'), I('corn',300,'g'), I('egg',1,'piece'), I('starch',15,'g'), I('ginger',5,'g'), I('salt',3,'g'), I('white_pepper',2,'g'), I('sesame_oil',5,'ml'), I('chicken_stock',1000,'ml')],
    steps: [
      '鸡胸肉200g切细丁，加少许盐、淀粉、清水抓匀',
      '玉米300g剥粒，一半打成玉米浆',
      '锅中加1000ml鸡汤煮开，下玉米粒和玉米浆煮5分钟',
      '加姜末，下鸡丁煮3分钟至断生',
      '加3g盐、2g白胡椒，15g淀粉加水勾芡至浓稠',
      '关小火淋入打散的蛋液成蛋花，淋5ml香油出锅'
    ]
  },
  // 83 韭菜炒豆腐
  chives_tofu_stirfry: {
    ingredients: [I('leek',200,'g'), I('tofu',300,'g'), I('garlic',10,'g'), I('light_soy',15,'ml'), I('salt',2,'g'), I('cooking_oil',25,'ml'), I('chili_pepper',8,'g')],
    steps: [
      '豆腐300g切1cm方块，撒少许盐静置5分钟出水',
      '韭菜200g切4cm段（韭白韭叶分开）；蒜切末，红椒切圈',
      '平底锅下20ml油，豆腐煎至两面金黄盛出',
      '锅中加5ml油爆香蒜末红椒，下韭白翻炒30秒',
      '回锅煎豆腐，加15ml生抽、2g盐翻炒1分钟',
      '下韭叶大火翻炒30秒立即出锅'
    ]
  },
  // 84 三文鱼炒饭
  salmon_fried_rice: {
    ingredients: [I('salmon_fillet',200,'g'), I('rice',300,'g'), I('egg',2,'piece'), I('spring_onion',15,'g'), I('carrot',60,'g'), I('light_soy',15,'ml'), I('salt',3,'g'), I('cooking_oil',25,'ml'), I('butter',10,'g'), I('black_pepper',2,'g')],
    steps: [
      '三文鱼200g切1.5cm丁，撒1g盐、1g黑胡椒腌5分钟',
      '隔夜米饭300g用手抓散；胡萝卜切小丁；葱切花；鸡蛋打散',
      '平底锅下10g黄油融化，下三文鱼丁煎至外焦里嫩盛出',
      '锅中加15ml油烧热，下蛋液炒散盛出',
      '锅中加10ml油下胡萝卜翻炒1分钟，倒入米饭翻炒2分钟至粒粒分明',
      '回锅鸡蛋三文鱼，加15ml生抽、2g盐、1g黑胡椒翻匀，撒葱花出锅'
    ]
  },
  // 85 南瓜红薯粥
  pumpkin_sweet_potato_congee: {
    ingredients: [I('rice',100,'g'), I('pumpkin',200,'g'), I('sweet_potato',200,'g'), I('rock_sugar',15,'g'), I('millet',30,'g')],
    steps: [
      '大米100g、小米30g淘洗加5ml油拌匀腌10分钟（防溢锅）',
      '南瓜200g、红薯200g去皮切2cm滚刀块',
      '锅中加1500ml清水大火烧开，下大米小米搅动一次防粘底',
      '盖盖转小火煮20分钟至米开花',
      '加南瓜红薯继续煮20分钟至软烂',
      '加15g冰糖搅至融化，关火焖5分钟即可盛出'
    ]
  },
  // 86 青椒炒土豆丝
  green_pepper_potato_shred: {
    ingredients: [I('potato',300,'g'), I('capsicum',150,'g'), I('garlic',10,'g'), I('chili_pepper',5,'g'), I('white_vinegar',10,'ml'), I('salt',3,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '土豆300g去皮切0.2cm细丝，浸水搓洗去淀粉',
      '青椒150g去籽切细丝；蒜切片',
      '锅中烧水加几滴油，土豆丝焯15秒过冷水保持脆爽',
      '热锅下20ml油下蒜片干辣椒爆香',
      '下土豆丝大火翻炒1分钟',
      '下青椒丝，沿锅边淋10ml白醋、加3g盐翻炒1分钟出锅'
    ]
  },
  // 87 红烧肉末豆腐
  braised_pork_mince_tofu: {
    ingredients: [I('tofu',400,'g'), I('pork_mince',150,'g'), I('garlic',10,'g'), I('ginger',5,'g'), I('doubanjiang',15,'g'), I('light_soy',15,'ml'), I('starch',8,'g'), I('cooking_oil',25,'ml'), I('spring_onion',10,'g')],
    steps: [
      '豆腐400g切1.5cm方块，盐水浸泡5分钟去豆腥（焯水也可）',
      '猪肉末150g加5ml料酒抓匀；蒜姜切末',
      '热锅下25ml油下肉末炒散至变色出油',
      '加15g豆瓣酱、姜蒜末小火炒出红油',
      '加300ml热水、15ml生抽煮开，下豆腐块',
      '中小火焖8分钟入味，8g淀粉加水勾芡收汁，撒葱花出锅'
    ]
  },
  // 88 醋溜白菜
  vinegar_cabbage: {
    ingredients: [I('chinese_cabbage',500,'g'), I('garlic',10,'g'), I('chili_pepper',5,'g'), I('white_vinegar',20,'ml'), I('sugar',10,'g'), I('light_soy',10,'ml'), I('salt',2,'g'), I('cooking_oil',20,'ml'), I('starch',5,'g')],
    steps: [
      '白菜500g洗净，菜帮切0.3cm斜刀片，菜叶撕大片（菜帮菜叶分开）',
      '蒜切片，干辣椒切段',
      '料汁：20ml白醋、10g糖、10ml生抽、5g淀粉、50ml清水调匀',
      '热锅下20ml油下蒜片干辣椒爆香',
      '下白菜帮大火翻炒1分钟，下白菜叶翻炒30秒至塌身',
      '倒入料汁大火翻炒30秒至汁浓稠裹住白菜，加2g盐翻匀出锅'
    ]
  },
  // 89 蘑菇炒青菜
  mushroom_bok_choy: {
    ingredients: [I('mushroom',200,'g'), I('bok_choy',400,'g'), I('garlic',10,'g'), I('oyster_sauce',15,'ml'), I('light_soy',5,'ml'), I('salt',2,'g'), I('cooking_oil',20,'ml')],
    steps: [
      '青菜400g洗净对半剖开，蘑菇200g切片，蒜切片',
      '锅中烧水加少许盐和油，青菜焯30秒过冷水沥干，整齐摆盘',
      '热锅下20ml油下蒜片爆香',
      '下蘑菇片大火翻炒2分钟出香',
      '加15ml蚝油、5ml生抽、2g盐、80ml热水煮1分钟',
      '将蘑菇连汁浇在青菜上即可上桌'
    ]
  },
};
