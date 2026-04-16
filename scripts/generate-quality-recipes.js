/**
 * 高质量菜谱批量生成器
 * 每道菜有独特步骤、丰富食材、真实用量
 * 不替换任何食材ID，允许菜谱中有待新增食材
 */
const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// 加载现有菜谱用于去重
const existing = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'recipes-all.json'), 'utf8'));
const existingNames = new Set(existing.map(r => r.nameZh));
const existingIds = new Set(existing.map(r => r.id));

const recipes = [];

// ============================================================
// 菜谱模板库 - 每道菜独立步骤和食材
// ============================================================

const RECIPES_DATA = [
  // === 川菜经典 ===
  { id:'sichuan_twice_cooked_pork', name:'回锅肉', en:'Twice Cooked Pork', region:'sichuan', method:'stir_fry', flavors:['spicy','salty'], diff:'medium', level:'intermediate', time:[15,10],
    ings:[['pork_belly',300,'g'],['cabbage',200,'g'],['capsicum',100,'g'],['garlic',10,'g'],['ginger',5,'g'],['doubanjiang',20,'g'],['soy_sauce',10,'ml'],['cooking_wine',10,'ml'],['cooking_oil',15,'ml'],['sugar',5,'g']],
    steps:['五花肉整块冷水下锅煮至八成熟捞出晾凉','切成薄片约3mm厚','包菜撕块彩椒切片','锅不放油中火煸肉片至出油微卷','推到一边下豆瓣酱炒出红油','加蒜末姜末爆香','放入蔬菜大火翻炒至断生加酱油糖调味'],
    tags:['川菜经典','下饭菜'] },

  { id:'sichuan_mapo_doufu', name:'正宗麻婆豆腐', en:'Authentic Mapo Tofu', region:'sichuan', method:'braise', flavors:['spicy','salty','umami'], diff:'medium', level:'basic', time:[10,15],
    ings:[['tofu',400,'g'],['pork_mince',100,'g'],['doubanjiang',25,'g'],['sichuan_pepper',3,'g'],['garlic',15,'g'],['ginger',5,'g'],['spring_onion',15,'g'],['light_soy',10,'ml'],['starch',10,'g'],['cooking_oil',20,'ml'],['chili_flakes',5,'g']],
    steps:['嫩豆腐切2cm方块开水加盐焯2分钟沥干','花椒小火焙香碾碎备用','热锅下油炒散肉末至变色','加豆瓣酱小火炒出红油','加蒜末姜末辣椒面翻炒','加水煮开轻轻放入豆腐小火煮5分钟','水淀粉分两次勾芡撒花椒粉和葱花'],
    tags:['川菜经典','下饭菜','豆腐'] },

  { id:'sichuan_kung_pao_shrimp', name:'宫保虾球', en:'Kung Pao Shrimp', region:'sichuan', method:'stir_fry', flavors:['sweet','sour','spicy'], diff:'medium', level:'intermediate', time:[15,8],
    ings:[['shrimp',300,'g'],['capsicum',80,'g'],['carrot',50,'g'],['spring_onion',20,'g'],['garlic',10,'g'],['ginger',5,'g'],['vinegar',15,'ml'],['sugar',15,'g'],['light_soy',15,'ml'],['starch',10,'g'],['cooking_wine',10,'ml'],['cooking_oil',20,'ml']],
    steps:['虾去壳去虾线加料酒淀粉腌制10分钟','调碗汁酱油醋糖淀粉水混合','彩椒胡萝卜切丁葱切段','热锅宽油快速滑炒虾仁至变色捞出','锅留底油爆香葱姜蒜','下蔬菜丁翻炒','回锅虾仁倒入碗汁大火翻匀出锅'],
    tags:['宴客菜','高蛋白'] },

  { id:'sichuan_fish_flavor_shred', name:'鱼香肉丝', en:'Yu Xiang Shredded Pork', region:'sichuan', method:'stir_fry', flavors:['sweet','sour','spicy','salty'], diff:'medium', level:'intermediate', time:[15,8],
    ings:[['pork_loin',250,'g'],['wood_ear',30,'g'],['carrot',80,'g'],['bamboo_shoot',80,'g'],['spring_onion',15,'g'],['garlic',15,'g'],['ginger',10,'g'],['doubanjiang',15,'g'],['vinegar',15,'ml'],['sugar',15,'g'],['light_soy',10,'ml'],['starch',10,'g'],['cooking_oil',25,'ml']],
    steps:['里脊切丝加酱油淀粉料酒腌制','木耳泡发切丝胡萝卜切丝','调鱼香汁酱油醋糖淀粉水','热锅下油滑炒肉丝至变色盛出','锅中爆香豆瓣酱姜蒜末','下配菜丝翻炒至断生','回锅肉丝倒鱼香汁大火翻炒收汁撒葱花'],
    tags:['川菜经典','下饭菜'] },

  { id:'sichuan_boiled_fish', name:'水煮鱼片', en:'Sichuan Boiled Fish', region:'sichuan', method:'boil', flavors:['spicy','salty','umami'], diff:'hard', level:'advanced', time:[20,15],
    ings:[['fish_fillet',400,'g'],['bean_sprouts',200,'g'],['celery',100,'g'],['garlic',20,'g'],['ginger',10,'g'],['doubanjiang',25,'g'],['sichuan_pepper',5,'g'],['chili_flakes',10,'g'],['light_soy',15,'ml'],['starch',15,'g'],['cooking_oil',40,'ml'],['cooking_wine',15,'ml'],['egg',1,'piece']],
    steps:['鱼片切薄片加蛋清淀粉料酒盐腌15分钟','豆芽芹菜焯水铺碗底','锅中下油炒豆瓣酱和花椒至出香','加水烧开放入鱼片煮至变白约2分钟','连汤倒入铺好蔬菜的碗中','碗面铺蒜末辣椒面花椒','另起锅烧热油淋在蒜末辣椒上滋啦冒烟'],
    tags:['川菜硬菜','宴客菜','鱼'] },

  { id:'sichuan_dry_pot_chicken', name:'干锅鸡', en:'Dry Pot Chicken', region:'sichuan', method:'dry_pot', flavors:['spicy','salty','umami'], diff:'medium', level:'intermediate', time:[15,15],
    ings:[['chicken_thigh',500,'g'],['potato',150,'g'],['capsicum',100,'g'],['onion',80,'g'],['garlic',15,'g'],['ginger',10,'g'],['doubanjiang',20,'g'],['light_soy',15,'ml'],['cooking_wine',15,'ml'],['sugar',5,'g'],['cooking_oil',25,'ml'],['sichuan_pepper',3,'g']],
    steps:['鸡腿切块加料酒姜片腌10分钟','土豆切厚片过油炸至微黄','锅中下油爆香花椒姜蒜和豆瓣酱','放入鸡块中火煸炒至金黄','加酱油糖翻炒上色','放入土豆片洋葱彩椒','大火翻炒2分钟收干汤汁出锅'],
    tags:['干锅','硬菜'] },

  // === 粤菜经典 ===
  { id:'cantonese_white_cut_chicken', name:'白切鸡', en:'White Cut Chicken', region:'cantonese', method:'boil', flavors:['light','umami'], diff:'medium', level:'intermediate', time:[10,40],
    ings:[['chicken_thigh',600,'g'],['ginger',30,'g'],['spring_onion',30,'g'],['cooking_wine',20,'ml'],['sesame_oil',10,'ml'],['light_soy',20,'ml'],['salt',3,'g']],
    steps:['整鸡腿洗净','锅中烧开水加姜葱料酒','放入鸡腿大火烧开转最小火浸泡25分钟','关火加盖焖15分钟','捞出立即放入冰水中浸泡10分钟','斩件装盘','蘸料用姜蓉葱花加热油和酱油调制'],
    tags:['粤菜经典','宴客菜'] },

  { id:'cantonese_steamed_fish', name:'清蒸石斑鱼风味', en:'Cantonese Steamed Fish', region:'cantonese', method:'steam', flavors:['light','umami'], diff:'medium', level:'intermediate', time:[10,12],
    ings:[['fish_fillet',500,'g'],['ginger',20,'g'],['spring_onion',30,'g'],['light_soy',25,'ml'],['sesame_oil',5,'ml'],['cooking_oil',15,'ml'],['cooking_wine',10,'ml'],['sugar',3,'g']],
    steps:['鱼身两面划刀抹少许盐和料酒','盘底铺姜片葱段鱼放上面再铺姜丝','水烧开大火蒸8-10分钟','取出倒掉蒸鱼汤汁','重新铺上大量葱丝姜丝','淋上蒸鱼豉油','热锅烧油至冒烟泼在葱姜丝上'],
    tags:['粤菜经典','清蒸','健康'] },

  { id:'cantonese_char_siu_style', name:'蜜汁叉烧风味', en:'Char Siu Style Pork', region:'cantonese', method:'roast', flavors:['sweet','salty','umami'], diff:'medium', level:'intermediate', time:[240,30],
    ings:[['pork_loin',500,'g'],['light_soy',30,'ml'],['dark_soy',15,'ml'],['oyster_sauce',20,'ml'],['sugar',40,'g'],['cooking_wine',20,'ml'],['garlic',10,'g'],['ginger',5,'g'],['sesame_oil',5,'ml'],['cooking_oil',10,'ml']],
    steps:['里脊肉切长条用叉子扎密集小孔','调叉烧酱汁生抽老抽蚝油糖料酒蒜蓉混合','肉条放入酱汁中腌制至少4小时翻面几次','烤箱预热220度','肉条放烤架上烤10分钟取出刷酱汁','翻面再烤10分钟再刷酱汁','最后高温烤5分钟至表面微焦切片装盘'],
    tags:['粤菜经典','烧烤','硬菜'] },

  { id:'cantonese_wonton_soup', name:'鲜虾云吞汤', en:'Shrimp Wonton Soup', region:'cantonese', method:'boil', flavors:['light','umami'], diff:'medium', level:'basic', time:[30,10],
    ings:[['shrimp',200,'g'],['pork_mince',150,'g'],['wonton_wrapper',30,'piece'],['spring_onion',15,'g'],['ginger',5,'g'],['sesame_oil',5,'ml'],['light_soy',10,'ml'],['white_pepper',2,'g'],['salt',3,'g'],['cooking_oil',5,'ml']],
    steps:['虾仁剁碎留几颗整虾','肉末加虾碎姜末酱油麻油胡椒盐搅拌上劲','取云吞皮放馅料对角捏紧包成元宝形','锅中烧开水下云吞煮至浮起约3分钟','另起锅烧清汤加盐调味','云吞捞入汤碗撒葱花和少许麻油'],
    tags:['粤菜','汤','早餐'] },

  // === 鲁菜经典 ===
  { id:'shandong_sweet_sour_carp', name:'糖醋鲤鱼', en:'Sweet and Sour Carp', region:'shandong', method:'deep_fry', flavors:['sweet','sour'], diff:'hard', level:'advanced', time:[20,15],
    ings:[['fish_fillet',500,'g'],['starch',50,'g'],['tomato_paste',30,'g'],['sugar',40,'g'],['vinegar',30,'ml'],['light_soy',10,'ml'],['garlic',10,'g'],['ginger',5,'g'],['spring_onion',10,'g'],['cooking_oil',40,'ml'],['salt',3,'g']],
    steps:['鱼身两面斜切花刀撒盐腌10分钟','均匀裹上干淀粉抖去多余','油温七成热下鱼炸至金黄定型捞出','油温升高复炸一次至酥脆装盘','锅留底油炒番茄酱','加糖醋酱油水烧开','水淀粉勾芡至浓稠趁热浇在鱼身上'],
    tags:['鲁菜经典','宴客菜','鱼'] },

  { id:'shandong_scallion_braised_seafood', name:'葱烧海参风味豆腐', en:'Scallion Braised Tofu', region:'shandong', method:'braise', flavors:['salty','umami'], diff:'medium', level:'intermediate', time:[10,15],
    ings:[['tofu',400,'g'],['spring_onion',50,'g'],['ginger',10,'g'],['dark_soy',10,'ml'],['light_soy',15,'ml'],['oyster_sauce',15,'ml'],['sugar',5,'g'],['starch',5,'g'],['cooking_oil',20,'ml'],['sesame_oil',5,'ml']],
    steps:['豆腐切厚片煎至两面金黄盛出','大葱切段分葱白葱绿','锅中下油小火煸葱白至焦香','加姜片酱油蚝油糖和少量水','放入煎好的豆腐小火焖5分钟','水淀粉勾薄芡','放葱绿段翻匀淋麻油出锅'],
    tags:['鲁菜','红烧'] },

  // === 湘菜经典 ===
  { id:'hunan_steamed_fish_head', name:'剁椒鱼头', en:'Steamed Fish Head with Chili', region:'hunan', method:'steam', flavors:['spicy','salty','umami'], diff:'medium', level:'intermediate', time:[15,15],
    ings:[['fish_fillet',500,'g'],['chili_pepper',80,'g'],['garlic',20,'g'],['ginger',15,'g'],['spring_onion',15,'g'],['light_soy',15,'ml'],['cooking_wine',15,'ml'],['cooking_oil',15,'ml'],['salt',3,'g'],['sugar',3,'g']],
    steps:['鱼处理干净两面抹盐和料酒腌10分钟','剁椒加蒜末姜末盐糖拌匀','鱼放盘中铺上满满的剁椒酱','水烧开大火蒸12分钟','取出撒葱花','热锅烧油至冒烟淋在鱼上激发香气'],
    tags:['湘菜经典','蒸菜','宴客菜'] },

  { id:'hunan_small_fry_pork', name:'农家小炒肉', en:'Hunan Small Fried Pork', region:'hunan', method:'stir_fry', flavors:['spicy','salty'], diff:'easy', level:'basic', time:[10,8],
    ings:[['pork_belly',250,'g'],['chili_pepper',150,'g'],['garlic',10,'g'],['ginger',5,'g'],['light_soy',15,'ml'],['dark_soy',5,'ml'],['cooking_wine',10,'ml'],['cooking_oil',10,'ml'],['salt',2,'g']],
    steps:['五花肉切薄片青椒切滚刀块','锅不放油中火煸五花肉至出油微焦','推到一边下姜蒜爆香','加生抽老抽料酒翻炒上色','放入青椒大火翻炒至断生虎皮状','加盐调味出锅'],
    tags:['湘菜','下饭菜','快手菜'] },

  // === 东北菜 ===
  { id:'dongbei_pork_stew_vermicelli', name:'猪肉炖粉条', en:'Braised Pork with Vermicelli', region:'dongbei', method:'stew', flavors:['salty','umami'], diff:'easy', level:'basic', time:[15,40],
    ings:[['pork_belly',300,'g'],['vermicelli',100,'g'],['chinese_cabbage',200,'g'],['spring_onion',15,'g'],['ginger',10,'g'],['star_anise',2,'piece'],['dark_soy',10,'ml'],['light_soy',15,'ml'],['cooking_wine',15,'ml'],['cooking_oil',10,'ml'],['salt',3,'g']],
    steps:['粉条温水泡软','五花肉切块冷水焯去血沫','锅中下油炒糖色放肉块翻炒上色','加葱段姜片八角料酒','加水没过肉大火烧开转小火炖30分钟','加白菜和粉条再炖10分钟','加盐调味出锅'],
    tags:['东北菜','炖菜','冬季'] },

  { id:'dongbei_disanxian', name:'地三鲜', en:'Three Treasure Stir-fry', region:'dongbei', method:'stir_fry', flavors:['salty','umami'], diff:'medium', level:'basic', time:[15,10],
    ings:[['potato',200,'g'],['eggplant',200,'g'],['capsicum',150,'g'],['garlic',15,'g'],['light_soy',15,'ml'],['oyster_sauce',10,'ml'],['starch',10,'g'],['sugar',5,'g'],['cooking_oil',30,'ml'],['salt',2,'g']],
    steps:['土豆切滚刀块茄子切滚刀块青椒切块','土豆块过油炸至金黄捞出','茄子过油炸至软捞出','锅留底油爆香蒜末','调碗汁酱油蚝油糖淀粉水','三样食材回锅倒入碗汁大火翻炒','收汁均匀出锅'],
    tags:['东北菜经典','素菜'] },

  { id:'dongbei_guobaorou', name:'锅包肉', en:'Crispy Sweet and Sour Pork', region:'dongbei', method:'deep_fry', flavors:['sweet','sour'], diff:'hard', level:'advanced', time:[20,15],
    ings:[['pork_loin',300,'g'],['starch',80,'g'],['carrot',50,'g'],['spring_onion',15,'g'],['garlic',10,'g'],['ginger',10,'g'],['vinegar',30,'ml'],['sugar',40,'g'],['tomato_paste',15,'g'],['light_soy',10,'ml'],['cooking_oil',40,'ml'],['salt',2,'g']],
    steps:['里脊肉切大薄片用刀背拍松','加盐料酒腌10分钟','淀粉加水调成厚糊裹匀肉片','油温六成热逐片下锅炸至定型捞出','油温升高复炸至金黄酥脆','调汁白醋糖番茄酱酱油','锅中爆香葱姜胡萝卜丝倒汁烧开下肉片快速翻匀'],
    tags:['东北菜经典','宴客菜'] },

  // === 苏菜/浙菜 ===
  { id:'jiangsu_lion_head', name:'清炖蟹粉狮子头', en:'Braised Lion Head Meatball', region:'jiangsu', method:'stew', flavors:['light','umami'], diff:'hard', level:'advanced', time:[20,60],
    ings:[['pork_mince',400,'g'],['egg',1,'piece'],['spring_onion',20,'g'],['ginger',15,'g'],['chinese_cabbage',300,'g'],['starch',15,'g'],['light_soy',10,'ml'],['cooking_wine',15,'ml'],['sesame_oil',5,'ml'],['salt',3,'g'],['white_pepper',2,'g']],
    steps:['肉末加蛋液葱姜水淀粉盐胡椒搅拌上劲','手上抹油取肉团成大丸子约4个','白菜叶焯水铺在砂锅底','丸子逐个放入砂锅','加清水没过丸子加料酒','大火烧开撇浮沫转最小火炖1小时','加盐调味原锅上桌'],
    tags:['苏菜经典','宴客菜','炖菜'] },

  { id:'zhejiang_dongpo_pork', name:'东坡肉', en:'Dongpo Braised Pork', region:'zhejiang', method:'braise', flavors:['sweet','salty','umami'], diff:'hard', level:'advanced', time:[20,120],
    ings:[['pork_belly',600,'g'],['spring_onion',30,'g'],['ginger',20,'g'],['dark_soy',30,'ml'],['light_soy',20,'ml'],['cooking_wine',50,'ml'],['sugar',40,'g'],['star_anise',2,'piece'],['cooking_oil',10,'ml']],
    steps:['五花肉整块焯水刮净切5cm方块','用棉线十字绑好每块','砂锅底铺葱段姜片','肉块皮朝下整齐码放','加料酒酱油糖八角','加水至肉的三分之二','大火烧开转最小火焖2小时至酥烂','翻面皮朝上再焖30分钟收浓汤汁'],
    tags:['浙菜经典','宴客硬菜'] },

  { id:'zhejiang_west_lake_fish', name:'西湖醋鱼风味', en:'West Lake Vinegar Fish', region:'zhejiang', method:'boil', flavors:['sweet','sour'], diff:'hard', level:'advanced', time:[15,10],
    ings:[['fish_fillet',500,'g'],['ginger',20,'g'],['spring_onion',15,'g'],['vinegar',30,'ml'],['sugar',25,'g'],['light_soy',15,'ml'],['starch',10,'g'],['cooking_wine',15,'ml'],['salt',2,'g']],
    steps:['鱼处理干净两面划刀','锅中水烧开加姜葱料酒','鱼放入水中大火煮开转中火煮5分钟','轻轻捞出装盘','煮鱼汤取一勺加醋糖酱油烧开','水淀粉勾芡至透亮','浇在鱼身上撒姜丝'],
    tags:['浙菜经典','鱼','宴客菜'] },

  // === 更多家常菜 ===
  { id:'home_garlic_eggplant', name:'蒜泥茄子', en:'Garlic Mashed Eggplant', region:'homestyle', method:'steam', flavors:['light','umami'], diff:'easy', level:'beginner', time:[10,15],
    ings:[['eggplant',400,'g'],['garlic',20,'g'],['light_soy',15,'ml'],['vinegar',10,'ml'],['sesame_oil',5,'ml'],['chili_flakes',3,'g'],['sugar',3,'g'],['salt',2,'g']],
    steps:['茄子洗净对半切开放蒸锅','大火蒸15分钟至完全软烂','取出用叉子撕成条状','蒜捣成泥加酱油醋糖麻油辣椒面盐调成蒜泥汁','浇在茄子上拌匀','冷藏后食用更佳'],
    tags:['凉菜','素菜','快手菜','夏季'] },

  { id:'home_cola_chicken_wings', name:'可乐鸡翅', en:'Cola Braised Chicken Wings', region:'homestyle', method:'braise', flavors:['sweet','salty'], diff:'easy', level:'beginner', time:[10,20],
    ings:[['chicken_wing',500,'g'],['ginger',10,'g'],['spring_onion',10,'g'],['light_soy',20,'ml'],['dark_soy',10,'ml'],['cooking_wine',15,'ml'],['cooking_oil',10,'ml'],['salt',2,'g']],
    steps:['鸡翅两面划两刀冷水焯去血沫','锅中下少许油煎鸡翅至两面金黄','加姜片葱段爆香','倒入可乐没过鸡翅加生抽老抽','大火烧开转中小火焖15分钟','开大火收汁至浓稠裹在鸡翅上'],
    tags:['家常菜','快手菜','儿童爱吃'] },

  { id:'home_braised_spare_ribs', name:'糖醋排骨', en:'Sweet and Sour Spare Ribs', region:'homestyle', method:'braise', flavors:['sweet','sour'], diff:'medium', level:'basic', time:[10,30],
    ings:[['pork_ribs',500,'g'],['ginger',10,'g'],['spring_onion',10,'g'],['vinegar',25,'ml'],['sugar',30,'g'],['light_soy',20,'ml'],['dark_soy',10,'ml'],['cooking_wine',15,'ml'],['starch',10,'g'],['cooking_oil',15,'ml'],['salt',2,'g']],
    steps:['排骨剁小段冷水焯去血沫洗净','锅中下油炒糖色至琥珀色冒小泡','放入排骨翻炒均匀上色','加姜葱料酒生抽老抽','加水没过排骨大火烧开转小火焖25分钟','加醋糖调成糖醋味','大火收汁至浓稠裹匀'],
    tags:['家常经典','宴客菜'] },

  { id:'home_scrambled_egg_tomato_improved', name:'番茄滑蛋', en:'Silky Tomato Egg', region:'homestyle', method:'stir_fry', flavors:['sweet','sour','umami'], diff:'easy', level:'beginner', time:[5,8],
    ings:[['tomato',300,'g'],['egg',4,'piece'],['spring_onion',10,'g'],['sugar',10,'g'],['salt',3,'g'],['cooking_oil',20,'ml'],['sesame_oil',3,'ml']],
    steps:['番茄底部划十字开水烫30秒去皮切块','鸡蛋打散加少许盐和几滴清水搅匀','热锅多油倒入蛋液轻推至半凝固盛出','锅中加少许油下番茄块炒出汁','加糖和盐调味焖2分钟','倒回鸡蛋轻轻翻匀不要炒碎','淋麻油撒葱花出锅'],
    tags:['家常菜','快手菜','下饭菜'] },

  { id:'home_mapo_eggplant', name:'肉末烧茄子', en:'Braised Eggplant with Minced Pork', region:'homestyle', method:'braise', flavors:['salty','umami'], diff:'easy', level:'basic', time:[10,15],
    ings:[['eggplant',400,'g'],['pork_mince',100,'g'],['garlic',15,'g'],['ginger',5,'g'],['spring_onion',10,'g'],['light_soy',15,'ml'],['oyster_sauce',10,'ml'],['sugar',5,'g'],['starch',5,'g'],['cooking_oil',25,'ml'],['salt',2,'g']],
    steps:['茄子切滚刀块泡盐水5分钟防氧化沥干','热锅多油炸茄子至软盛出','锅留底油炒散肉末','加蒜末姜末爆香','加酱油蚝油糖和少量水','放回茄子焖3分钟','水淀粉勾芡撒葱花'],
    tags:['家常菜','下饭菜'] },

  { id:'home_potato_braised_chicken', name:'土豆焖鸡', en:'Braised Chicken with Potato', region:'homestyle', method:'stew', flavors:['salty','umami'], diff:'easy', level:'basic', time:[10,30],
    ings:[['chicken_thigh',500,'g'],['potato',300,'g'],['ginger',10,'g'],['spring_onion',15,'g'],['garlic',10,'g'],['light_soy',20,'ml'],['dark_soy',10,'ml'],['oyster_sauce',10,'ml'],['cooking_wine',15,'ml'],['sugar',5,'g'],['cooking_oil',15,'ml'],['salt',2,'g']],
    steps:['鸡腿切块焯水洗净土豆切块','锅中下油煸炒鸡块至金黄','加姜蒜葱爆香','加酱油蚝油料酒糖翻炒上色','加水没过鸡块烧开转中火','加土豆块一起焖20分钟','大火收汁至浓稠'],
    tags:['家常菜','一锅出'] },

  { id:'home_kung_pao_tofu', name:'宫保豆腐', en:'Kung Pao Tofu', region:'sichuan', method:'stir_fry', flavors:['sweet','sour','spicy'], diff:'easy', level:'basic', time:[10,8],
    ings:[['tofu',400,'g'],['capsicum',100,'g'],['carrot',50,'g'],['spring_onion',15,'g'],['garlic',10,'g'],['ginger',5,'g'],['vinegar',15,'ml'],['sugar',10,'g'],['light_soy',15,'ml'],['starch',10,'g'],['doubanjiang',10,'g'],['cooking_oil',20,'ml']],
    steps:['豆腐切方丁煎至六面金黄盛出','彩椒胡萝卜切丁','调碗汁醋糖酱油淀粉水','锅中爆香豆瓣酱葱姜蒜','下蔬菜丁翻炒','放回豆腐倒碗汁大火翻炒收汁'],
    tags:['素菜','下饭菜'] },

  { id:'home_steamed_egg', name:'日式茶碗蒸', en:'Japanese Style Steamed Egg', region:'homestyle', method:'steam', flavors:['light','umami'], diff:'easy', level:'beginner', time:[5,12],
    ings:[['egg',3,'piece'],['shrimp',50,'g'],['mushroom',30,'g'],['spring_onion',5,'g'],['light_soy',5,'ml'],['sesame_oil',3,'ml'],['salt',2,'g']],
    steps:['鸡蛋打散加1.5倍温水和盐搅匀','蛋液过筛两次去除气泡倒入碗中','表面覆保鲜膜用牙签扎几个孔','水烧开转中小火蒸10分钟','蒸至表面凝固放上虾仁蘑菇再蒸2分钟','淋酱油麻油撒葱花'],
    tags:['蒸菜','清淡','健康'] },

  // 更多菜谱继续...
  { id:'home_braised_pork_belly', name:'毛氏红烧肉', en:'Mao Style Braised Pork', region:'hunan', method:'braise', flavors:['sweet','salty','umami'], diff:'medium', level:'intermediate', time:[15,60],
    ings:[['pork_belly',600,'g'],['ginger',15,'g'],['spring_onion',15,'g'],['star_anise',2,'piece'],['dark_soy',20,'ml'],['light_soy',15,'ml'],['sugar',30,'g'],['cooking_wine',20,'ml'],['cooking_oil',10,'ml'],['salt',2,'g']],
    steps:['五花肉切3cm方块冷水焯去血沫','锅中放少许油加糖小火炒至琥珀色','放入肉块翻炒至均匀上色','加葱姜八角料酒','加酱油翻炒出香味','加热水没过肉大火烧开','转最小火焖1小时至肉酥烂大火收汁'],
    tags:['湘菜经典','硬菜','红烧'] },

  { id:'home_beef_stew_tomato', name:'番茄牛腩煲', en:'Tomato Beef Brisket Stew', region:'homestyle', method:'stew', flavors:['sour','umami'], diff:'medium', level:'basic', time:[15,90],
    ings:[['beef_sirloin',500,'g'],['tomato',400,'g'],['potato',200,'g'],['carrot',100,'g'],['onion',100,'g'],['ginger',15,'g'],['tomato_paste',20,'g'],['light_soy',15,'ml'],['cooking_wine',20,'ml'],['sugar',10,'g'],['cooking_oil',15,'ml'],['salt',3,'g']],
    steps:['牛腩切块冷水焯去血沫洗净','番茄开水烫去皮切块','锅中下油炒洋葱至透明','加姜片和牛腩翻炒','加料酒酱油番茄酱','加番茄块炒出汁','加水没过食材大火烧开转小火炖1小时','加土豆胡萝卜再炖30分钟加盐调味'],
    tags:['炖菜','冬季','硬菜'] },

  { id:'home_stir_fry_snow_pea_shrimp', name:'荷兰豆炒虾仁', en:'Snow Pea with Shrimp', region:'cantonese', method:'stir_fry', flavors:['light','umami'], diff:'easy', level:'basic', time:[10,5],
    ings:[['shrimp',200,'g'],['snow_pea',250,'g'],['garlic',10,'g'],['ginger',5,'g'],['cooking_wine',10,'ml'],['starch',5,'g'],['salt',2,'g'],['cooking_oil',15,'ml'],['sesame_oil',3,'ml']],
    steps:['虾仁去虾线加料酒淀粉盐腌5分钟','荷兰豆撕去两边老筋焯水30秒','热锅下油爆香蒜姜','放虾仁大火快炒至变红','加荷兰豆翻炒均匀','加盐调味淋麻油出锅'],
    tags:['快手菜','健康','低脂'] },

  { id:'home_wood_ear_scrambled_egg', name:'木耳炒蛋', en:'Wood Ear Mushroom with Egg', region:'homestyle', method:'stir_fry', flavors:['light','umami'], diff:'easy', level:'beginner', time:[15,5],
    ings:[['wood_ear',30,'g'],['egg',4,'piece'],['spring_onion',10,'g'],['garlic',5,'g'],['light_soy',5,'ml'],['salt',2,'g'],['cooking_oil',15,'ml']],
    steps:['干木耳提前温水泡发30分钟洗净撕小朵','鸡蛋打散加盐','热锅多油倒蛋液炒至凝固盛出','锅中加油炒木耳1分钟','放回鸡蛋加酱油翻炒均匀','撒葱花出锅'],
    tags:['家常菜','快手菜','素菜'] },

  { id:'home_lotus_root_pork_rib_soup', name:'莲藕排骨汤', en:'Lotus Root Pork Rib Soup', region:'homestyle', method:'soup', flavors:['light','umami'], diff:'easy', level:'beginner', time:[10,90],
    ings:[['pork_ribs',500,'g'],['lotus_root',300,'g'],['ginger',15,'g'],['spring_onion',10,'g'],['cooking_wine',15,'ml'],['salt',3,'g'],['white_pepper',2,'g']],
    steps:['排骨剁段冷水焯去血沫洗净','莲藕去皮切滚刀块','砂锅加水放排骨姜葱料酒','大火烧开撇浮沫','转小火煲1小时','加莲藕再煲30分钟','加盐和白胡椒调味'],
    tags:['汤','养生','秋冬'] },

  { id:'home_bitter_melon_egg', name:'苦瓜炒蛋', en:'Bitter Melon with Egg', region:'cantonese', method:'stir_fry', flavors:['bitter','light'], diff:'easy', level:'beginner', time:[10,5],
    ings:[['bitter_melon',250,'g'],['egg',3,'piece'],['garlic',5,'g'],['salt',3,'g'],['cooking_oil',15,'ml'],['sugar',3,'g']],
    steps:['苦瓜对半去瓤切薄片加盐腌10分钟挤去水分','鸡蛋打散加少许盐','热锅下油炒蛋至凝固盛出','锅中加油炒苦瓜至断生加少许糖','放回鸡蛋翻炒均匀','加盐调味出锅'],
    tags:['家常菜','素菜','清热','夏季'] },

  { id:'home_dried_tofu_celery', name:'芹菜香干', en:'Celery with Dried Tofu', region:'homestyle', method:'stir_fry', flavors:['salty','umami'], diff:'easy', level:'beginner', time:[10,5],
    ings:[['dried_tofu',200,'g'],['celery',200,'g'],['carrot',50,'g'],['garlic',5,'g'],['light_soy',10,'ml'],['salt',2,'g'],['cooking_oil',10,'ml'],['sesame_oil',3,'ml']],
    steps:['香干切丝芹菜切段胡萝卜切丝','热锅下油爆香蒜末','先下香干丝翻炒1分钟','加芹菜段和胡萝卜丝大火翻炒','加酱油盐调味','淋麻油出锅'],
    tags:['素菜','快手菜','便当菜'] },

  { id:'home_pumpkin_steamed', name:'南瓜蒸排骨', en:'Steamed Ribs with Pumpkin', region:'cantonese', method:'steam', flavors:['sweet','salty'], diff:'easy', level:'basic', time:[20,25],
    ings:[['pork_ribs',400,'g'],['pumpkin',300,'g'],['garlic',10,'g'],['ginger',5,'g'],['light_soy',15,'ml'],['oyster_sauce',10,'ml'],['starch',10,'g'],['cooking_wine',10,'ml'],['sugar',3,'g'],['cooking_oil',10,'ml']],
    steps:['排骨剁小段洗净沥干','加酱油蚝油淀粉料酒糖蒜末姜末拌匀腌20分钟','南瓜去皮切厚块铺盘底','腌好的排骨铺在南瓜上','水烧开大火蒸25分钟','取出撒葱花'],
    tags:['蒸菜','粤菜','一锅出'] },

  { id:'home_tofu_puff_braised', name:'油豆腐烧肉', en:'Fried Tofu Puff with Pork', region:'homestyle', method:'braise', flavors:['salty','umami'], diff:'easy', level:'basic', time:[10,20],
    ings:[['tofu_puff',200,'g'],['pork_belly',200,'g'],['ginger',10,'g'],['spring_onion',10,'g'],['light_soy',15,'ml'],['dark_soy',5,'ml'],['sugar',5,'g'],['star_anise',1,'piece'],['cooking_oil',10,'ml'],['salt',2,'g']],
    steps:['五花肉切块油豆腐对半切','锅中下油煸炒五花肉至出油','加姜葱八角爆香','加酱油糖翻炒上色','加水和油豆腐','大火烧开转小火焖15分钟','大火收汁'],
    tags:['家常菜','红烧','豆腐'] },

  { id:'home_edamame_stir_fry', name:'盐水毛豆', en:'Salt Boiled Edamame', region:'homestyle', method:'boil', flavors:['salty','light'], diff:'easy', level:'beginner', time:[5,10],
    ings:[['edamame',500,'g'],['star_anise',2,'piece'],['ginger',10,'g'],['salt',10,'g'],['sichuan_pepper',3,'g']],
    steps:['毛豆洗净剪去两头','锅中烧水加盐八角花椒姜片','水开下毛豆大火煮8分钟','关火加盖焖5分钟','捞出沥干即可食用或冷藏后吃'],
    tags:['凉菜','小食','夏季','下酒菜'] },

  { id:'home_vermicelli_crab_style', name:'蒜蓉粉丝蒸扇贝风味', en:'Steamed Vermicelli with Garlic', region:'cantonese', method:'steam', flavors:['umami','salty'], diff:'easy', level:'basic', time:[15,10],
    ings:[['vermicelli',100,'g'],['shrimp',200,'g'],['garlic',30,'g'],['spring_onion',10,'g'],['light_soy',15,'ml'],['cooking_oil',15,'ml'],['chili_flakes',3,'g'],['salt',2,'g']],
    steps:['粉丝温水泡软沥干铺在盘底','虾处理好摆在粉丝上','蒜切碎小火炒至金黄加辣椒面','将蒜蓉油铺在虾和粉丝上','水开大火蒸8分钟','取出淋酱油撒葱花'],
    tags:['蒸菜','粤菜','海鲜'] },

  { id:'home_cauliflower_dry_pot', name:'干锅花菜', en:'Dry Pot Cauliflower', region:'sichuan', method:'dry_pot', flavors:['spicy','salty'], diff:'easy', level:'basic', time:[10,10],
    ings:[['cauliflower',400,'g'],['pork_belly',100,'g'],['garlic',10,'g'],['ginger',5,'g'],['chili_pepper',30,'g'],['doubanjiang',15,'g'],['light_soy',10,'ml'],['cooking_oil',15,'ml'],['salt',2,'g']],
    steps:['花菜掰小朵洗净控干五花肉切薄片','锅不放油煸五花肉至出油微焦','加蒜姜辣椒豆瓣酱炒香','放入花菜大火翻炒3分钟','加酱油盐调味','炒至花菜边缘微焦有锅气出锅'],
    tags:['干锅','下饭菜'] },

  { id:'home_winter_melon_pork_soup', name:'冬瓜排骨汤', en:'Winter Melon Pork Rib Soup', region:'homestyle', method:'soup', flavors:['light','umami'], diff:'easy', level:'beginner', time:[10,40],
    ings:[['pork_ribs',400,'g'],['winter_melon',400,'g'],['ginger',10,'g'],['spring_onion',10,'g'],['cooking_wine',10,'ml'],['salt',3,'g'],['white_pepper',2,'g']],
    steps:['排骨焯水洗净','冬瓜去皮切大块','锅中加水放排骨姜葱料酒','大火烧开转小火煲30分钟','加冬瓜再煲15分钟至透明','加盐白胡椒调味'],
    tags:['汤','清热','夏季'] },

  { id:'home_asparagus_beef', name:'芦笋炒牛肉', en:'Asparagus with Beef', region:'cantonese', method:'stir_fry', flavors:['salty','umami'], diff:'easy', level:'basic', time:[10,5],
    ings:[['beef_sirloin',250,'g'],['asparagus',250,'g'],['garlic',10,'g'],['oyster_sauce',15,'ml'],['light_soy',10,'ml'],['starch',5,'g'],['cooking_wine',10,'ml'],['cooking_oil',15,'ml'],['salt',2,'g']],
    steps:['牛肉切片加酱油淀粉料酒腌10分钟','芦笋切去根部老皮切斜段焯水','热锅大火油滑牛肉至变色快速盛出','锅中爆香蒜末下芦笋翻炒','回锅牛肉加蚝油翻炒均匀','出锅'],
    tags:['快手菜','高蛋白','健康'] },

  { id:'home_leek_egg_dumpling', name:'韭菜鸡蛋饺', en:'Chive Egg Dumplings', region:'dongbei', method:'boil', flavors:['umami','salty'], diff:'medium', level:'basic', time:[30,10],
    ings:[['leek',300,'g'],['egg',4,'piece'],['wonton_wrapper',40,'piece'],['ginger',5,'g'],['sesame_oil',10,'ml'],['light_soy',10,'ml'],['salt',3,'g'],['cooking_oil',15,'ml']],
    steps:['鸡蛋炒碎晾凉','韭菜洗净切碎','蛋碎加韭菜碎姜末酱油麻油盐拌匀','取饺子皮放馅对折捏紧','锅中水烧开下饺子','煮至浮起加一次冷水再煮开即熟'],
    tags:['主食','饺子'] },
];

// 生成菜谱
for (const t of RECIPES_DATA) {
  if (existingNames.has(t.name) || existingIds.has(t.id)) continue;

  recipes.push({
    id: t.id,
    nameZh: t.name,
    nameEn: t.en,
    cuisine: 'chinese',
    regionalCuisine: t.region,
    cookingMethod: t.method,
    flavors: t.flavors,
    mealTypes: t.method === 'soup' ? ['dinner'] : ['lunch', 'dinner'],
    difficulty: t.diff,
    minCookingLevel: t.level,
    prepTime: t.time[0],
    cookTime: t.time[1],
    servings: t.ings.some(i => i[1] >= 500) ? 4 : 2,
    ingredients: t.ings.map(([id, amount, unit]) => ({ ingredientId: id, amount, unit })),
    steps: t.steps,
    tags: t.tags,
    status: 'reviewed',
    source: 'quality-handcrafted',
  });

  existingNames.add(t.name);
  existingIds.add(t.id);
}

// 合并到现有菜谱
const merged = [...existing, ...recipes];
fs.writeFileSync(path.join(DATA_DIR, 'recipes-all.json'), JSON.stringify(merged, null, 2));

console.log('新增手工菜谱:', recipes.length, '道');
console.log('合并后总计:', merged.length, '道');

// 检查缺失食材
const ings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ingredients.json'), 'utf8'));
const ingIds = new Set(ings.map(i => i.id));
const missing = new Set();
for (const r of recipes) {
  for (const ri of r.ingredients) {
    if (!ingIds.has(ri.ingredientId)) missing.add(ri.ingredientId);
  }
}
console.log('待新增食材:', missing.size === 0 ? '无' : [...missing].join(', '));
