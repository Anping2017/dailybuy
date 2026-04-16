const fs = require('fs');
const recipes = [];
const R = (id,nameZh,nameEn,reg,method,flavors,diff,level,prep,cook,serv,ings,steps,tags) => recipes.push({id,nameZh,nameEn,cuisine:"chinese",regionalCuisine:reg,cookingMethod:method,flavors,mealTypes:["lunch","dinner"],difficulty:diff,minCookingLevel:level,prepTime:prep,cookTime:cook,servings:serv,ingredients:ings,steps,tags,status:"reviewed",source:"mega-2"});
const I = (id,amt,unit) => ({ingredientId:id,amount:amt,unit});

// === SICHUAN 100 ===
R("shui-zhu-niu-rou","水煮牛肉","Sichuan Boiled Beef","sichuan","boil",["spicy","numbing","umami"],"medium","intermediate",20,15,3,
[I("beef_sirloin",300,"g"),I("bean_sprouts",150,"g"),I("celery",80,"g"),I("doubanjiang",2,"tbsp"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("garlic",5,"piece"),I("ginger",3,"piece"),I("cooking_wine",1,"tbsp"),I("starch",1,"tbsp")],
["牛肉逆纹切薄片加料酒淀粉腌15分钟","豆芽和芹菜焯水铺在碗底","锅中油热爆香豆瓣酱姜蒜末炒出红油","加清水煮沸放入牛肉片煮至变色捞出铺在菜上","碗面撒花椒粒和辣椒面","烧滚热油淋在碗面激出香味"],
["水煮系列","川菜经典","下饭菜"]);

R("shui-zhu-yu-pian","水煮鱼片","Sichuan Boiled Fish Slices","sichuan","boil",["spicy","numbing","umami"],"medium","intermediate",20,15,3,
[I("fish_fillet",400,"g"),I("bean_sprouts",200,"g"),I("doubanjiang",2,"tbsp"),I("chili_flakes",3,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("garlic",6,"piece"),I("ginger",3,"piece"),I("egg",1,"piece"),I("starch",1,"tbsp"),I("cooking_wine",1,"tbsp")],
["鱼片加蛋清淀粉料酒上浆腌10分钟","豆芽焯水铺碗底","锅中油热炒豆瓣酱至红油加水煮沸","鱼片逐片滑入锅中煮1分钟捞出铺在豆芽上","碗面撒花椒粒干辣椒面和蒜末","热油淋上激出麻辣香气"],
["水煮系列","川菜经典","宴客菜"]);

R("shui-zhu-rou-pian","水煮肉片","Sichuan Boiled Pork Slices","sichuan","boil",["spicy","numbing","umami"],"medium","intermediate",15,12,3,
[I("pork_loin",300,"g"),I("chinese_cabbage",200,"g"),I("doubanjiang",2,"tbsp"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("garlic",5,"piece"),I("ginger",3,"piece"),I("starch",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("cooking_oil",3,"tbsp")],
["猪里脊切薄片加淀粉料酒腌10分钟","白菜叶焯水铺碗底","锅中油炒豆瓣酱出红油加水煮开","肉片滑入煮至变色捞在菜上","撒花椒干辣椒面蒜末淋热油激香"],
["水煮系列","川菜经典","下饭菜"]);

R("shui-zhu-xia","水煮虾","Sichuan Boiled Shrimp","sichuan","boil",["spicy","numbing","umami"],"medium","intermediate",15,10,3,
[I("shrimp",400,"g"),I("bean_sprouts",150,"g"),I("doubanjiang",2,"tbsp"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("garlic",5,"piece"),I("ginger",3,"piece"),I("spring_onion",2,"piece"),I("cooking_wine",1,"tbsp"),I("cooking_oil",3,"tbsp")],
["虾去虾线加料酒腌10分钟","豆芽焯水铺碗底","锅中油热炒豆瓣酱出红油加水烧开","下虾煮至变红捞出铺在豆芽上","撒花椒辣椒面蒜末葱花淋热油"],
["水煮系列","海鲜","下酒菜"]);

R("shui-zhu-qie-zi","水煮茄子","Sichuan Boiled Eggplant","sichuan","boil",["spicy","numbing"],"easy","basic",10,10,2,
[I("eggplant",300,"g"),I("pork_mince",80,"g"),I("doubanjiang",1.5,"tbsp"),I("chili_flakes",1,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",4,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("cooking_oil",3,"tbsp")],
["茄子切滚刀块","锅中油热炒肉末散加豆瓣酱炒红油","加水烧开下茄子煮至软烂","捞入碗中撒花椒辣椒面蒜末","热油泼上激出香味"],
["水煮系列","素菜","下饭菜"]);

R("yu-xiang-rou-si","鱼香肉丝","Fish-Fragrant Pork Shreds","sichuan","stir_fry",["sweet","sour","spicy"],"medium","intermediate",15,8,3,
[I("pork_loin",250,"g"),I("carrot",1,"piece"),I("wood_ear",30,"g"),I("capsicum",1,"piece"),I("doubanjiang",1,"tbsp"),I("sugar",1.5,"tbsp"),I("vinegar",1.5,"tbsp"),I("light_soy",1,"tbsp"),I("starch",1,"tbsp"),I("garlic",4,"piece")],
["肉丝加淀粉生抽腌10分钟木耳泡发切丝","调鱼香汁：糖醋生抽淀粉水混合","锅中油热滑散肉丝盛出","留油炒豆瓣酱出红油加蒜末姜末","下胡萝卜丝木耳丝翻炒断生","回锅肉丝倒入鱼香汁翻炒均匀收汁"],
["鱼香系列","川菜经典","下饭菜"]);

R("yu-xiang-qie-zi","鱼香茄子","Fish-Fragrant Eggplant","sichuan","stir_fry",["sweet","sour","spicy"],"easy","basic",10,10,2,
[I("eggplant",400,"g"),I("pork_mince",80,"g"),I("doubanjiang",1,"tbsp"),I("sugar",1.5,"tbsp"),I("vinegar",1.5,"tbsp"),I("light_soy",1,"tbsp"),I("garlic",4,"piece"),I("ginger",2,"piece"),I("spring_onion",2,"piece"),I("starch",1,"tbsp")],
["茄子切滚刀块","锅中多油炸茄子至软捞出","留油炒肉末散加豆瓣酱炒红油","加姜蒜末炒香倒入鱼香汁","回锅茄子翻炒裹汁均匀撒葱花出锅"],
["鱼香系列","素菜","下饭菜"]);

R("yu-xiang-dou-fu","鱼香豆腐","Fish-Fragrant Tofu","sichuan","stir_fry",["sweet","sour","spicy"],"easy","basic",10,10,2,
[I("tofu",400,"g"),I("pork_mince",60,"g"),I("doubanjiang",1,"tbsp"),I("sugar",1.5,"tbsp"),I("vinegar",1,"tbsp"),I("light_soy",1,"tbsp"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("starch",1,"tbsp"),I("cooking_oil",2,"tbsp")],
["豆腐切方块入盐水煮2分钟捞出沥干","锅中油热下肉末炒散加豆瓣酱炒红油","加姜蒜末炒香","下豆腐块轻轻翻动","调鱼香汁浇入锅中翻匀收汁出锅"],
["鱼香系列","素菜","下饭菜"]);

R("yu-xiang-ji-si","鱼香鸡丝","Fish-Fragrant Chicken Shreds","sichuan","stir_fry",["sweet","sour","spicy"],"medium","intermediate",15,8,3,
[I("chicken_breast",250,"g"),I("carrot",1,"piece"),I("capsicum",1,"piece"),I("wood_ear",20,"g"),I("doubanjiang",1,"tbsp"),I("sugar",1.5,"tbsp"),I("vinegar",1.5,"tbsp"),I("light_soy",1,"tbsp"),I("starch",1,"tbsp"),I("garlic",4,"piece")],
["鸡胸肉切丝加淀粉料酒腌10分钟","木耳泡发切丝胡萝卜彩椒切丝","调鱼香汁备用","锅中油热滑散鸡丝盛出","留油炒豆瓣酱蒜末下配菜丝翻炒","回锅鸡丝倒鱼香汁大火翻炒收汁"],
["鱼香系列","高蛋白","下饭菜"]);

R("yu-xiang-da-xia","鱼香大虾","Fish-Fragrant Prawns","sichuan","stir_fry",["sweet","sour","spicy"],"medium","intermediate",15,10,3,
[I("shrimp",300,"g"),I("capsicum",1,"piece"),I("carrot",0.5,"piece"),I("doubanjiang",1,"tbsp"),I("sugar",1.5,"tbsp"),I("vinegar",1,"tbsp"),I("garlic",4,"piece"),I("ginger",3,"piece"),I("starch",1,"tbsp"),I("cooking_wine",1,"tbsp")],
["大虾去虾线开背加料酒腌10分钟","调鱼香汁备用","锅中油热煎虾至两面变红盛出","留油炒豆瓣酱姜蒜末出红油","下配菜丝翻炒回锅虾","倒鱼香汁翻炒收汁均匀挂汁"],
["鱼香系列","海鲜","宴客菜"]);

R("ma-la-xiang-guo","麻辣香锅","Sichuan Spicy Hot Pot Stir-fry","sichuan","stir_fry",["spicy","numbing","umami"],"medium","intermediate",20,15,4,
[I("shrimp",150,"g"),I("pork_belly",100,"g"),I("lotus_root",100,"g"),I("cauliflower",100,"g"),I("mushroom",100,"g"),I("doubanjiang",2,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("chili_flakes",2,"tbsp"),I("garlic",5,"piece"),I("sesame_oil",1,"tbsp")],
["所有食材分别焯水或炸至断生沥干","锅中油热小火炒豆瓣酱花椒干辣椒","加蒜末炒出麻辣底味","所有食材一起倒入大火翻炒","加盐调味淋麻油翻匀出锅"],
["麻辣系列","川菜经典","下酒菜"]);

R("ma-la-ji-kuai","麻辣鸡块","Mala Spicy Chicken","sichuan","stir_fry",["spicy","numbing"],"medium","intermediate",20,12,3,
[I("chicken_thigh",400,"g"),I("chili_pepper",10,"piece"),I("sichuan_pepper",1.5,"tbsp"),I("garlic",5,"piece"),I("ginger",3,"piece"),I("doubanjiang",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("sugar",0.5,"tbsp"),I("light_soy",1,"tbsp"),I("cooking_oil",3,"tbsp")],
["鸡腿剁小块加料酒姜片腌15分钟","锅中宽油炸鸡块至金黄捞出","锅留油小火炒花椒干辣椒至变色出香","加豆瓣酱蒜末炒红油","回锅鸡块加生抽糖大火翻炒","炒至汁收干辣椒裹满鸡块出锅"],
["麻辣系列","下酒菜","下饭菜"]);

R("ma-la-dou-fu","麻辣豆腐","Mala Spicy Tofu","sichuan","stir_fry",["spicy","numbing"],"easy","basic",10,10,2,
[I("tofu",400,"g"),I("pork_mince",80,"g"),I("doubanjiang",1.5,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("chili_flakes",1,"tbsp"),I("garlic",4,"piece"),I("spring_onion",2,"piece"),I("starch",1,"tbsp"),I("light_soy",1,"tbsp"),I("cooking_oil",2,"tbsp")],
["豆腐切块入盐水煮2分钟沥干","锅中油热炒肉末散加豆瓣酱出红油","加蒜末花椒粉辣椒面炒香","加少量水烧开下豆腐块小火煮3分钟","水淀粉勾芡翻匀撒葱花出锅"],
["麻辣系列","素菜","下饭菜"]);

R("ma-la-niu-jin","麻辣牛筋","Mala Beef Tendon","sichuan","braise",["spicy","numbing","umami"],"hard","advanced",30,60,4,
[I("beef_sirloin",500,"g"),I("sichuan_pepper",2,"tbsp"),I("chili_pepper",10,"piece"),I("star_anise",2,"piece"),I("ginger",5,"piece"),I("garlic",6,"piece"),I("doubanjiang",2,"tbsp"),I("dark_soy",1,"tbsp"),I("cooking_wine",2,"tbsp"),I("sugar",1,"tbsp")],
["牛筋切块焯水去血沫洗净","锅中油热炒豆瓣酱花椒干辣椒出红油","加姜蒜八角炒香下牛筋翻炒","加料酒老抽糖和足量水大火烧开","转小火炖煮60分钟至牛筋软烂","大火收汁至浓稠出锅"],
["麻辣系列","卤味","下酒菜"]);

R("ma-la-xia","麻辣小龙虾风味虾","Mala Spicy Shrimp","sichuan","stir_fry",["spicy","numbing","umami"],"medium","intermediate",15,10,3,
[I("shrimp",500,"g"),I("sichuan_pepper",1.5,"tbsp"),I("chili_pepper",8,"piece"),I("garlic",8,"piece"),I("ginger",4,"piece"),I("doubanjiang",2,"tbsp"),I("cooking_wine",2,"tbsp"),I("sugar",1,"tbsp"),I("beer",200,"ml"),I("cooking_oil",3,"tbsp")],
["虾去虾线洗净沥干","锅中油热下虾煎至变红盛出","锅中留油小火炒花椒干辣椒豆瓣酱","加姜蒜末炒出麻辣红油","回锅虾加料酒啤酒大火烧开","中火煮5分钟至入味收汁出锅"],
["麻辣系列","海鲜","夜宵"]);

R("pao-jiao-feng-zhua","泡椒凤爪","Pickled Pepper Chicken Feet","sichuan","pickle",["sour","spicy"],"medium","intermediate",20,20,4,
[I("chicken_wing",500,"g"),I("chili_pepper",10,"piece"),I("garlic",6,"piece"),I("ginger",4,"piece"),I("vinegar",3,"tbsp"),I("sugar",2,"tbsp"),I("salt",1,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("celery",50,"g")],
["鸡爪剪去指甲对半切开焯水煮15分钟","捞出冲凉水至完全冷透沥干","调泡椒水：泡椒醋糖盐花椒凉白开","鸡爪放入泡椒水中加蒜芹菜段","密封冷藏浸泡12小时以上","取出即可食用酸辣爽脆"],
["泡椒系列","凉菜","下酒菜"]);

R("pao-jiao-niu-rou","泡椒牛肉","Pickled Pepper Beef","sichuan","stir_fry",["sour","spicy","umami"],"medium","intermediate",15,8,3,
[I("beef_sirloin",300,"g"),I("chili_pepper",8,"piece"),I("capsicum",1,"piece"),I("garlic",4,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("starch",1,"tbsp"),I("sugar",0.5,"tbsp"),I("cooking_oil",3,"tbsp")],
["牛肉切薄片加生抽料酒淀粉腌10分钟","泡椒切段彩椒切块","锅中油热大火爆炒牛肉至变色盛出","锅中留油炒泡椒姜蒜出香","下彩椒翻炒回锅牛肉","加糖调味大火翻炒匀出锅"],
["泡椒系列","下饭菜","快手菜"]);

R("pao-jiao-ji-za","泡椒鸡杂","Pickled Pepper Chicken Giblets","sichuan","stir_fry",["sour","spicy"],"medium","intermediate",15,8,3,
[I("chicken_thigh",300,"g"),I("chili_pepper",8,"piece"),I("celery",80,"g"),I("garlic",4,"piece"),I("ginger",3,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("vinegar",0.5,"tbsp"),I("starch",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["鸡胗鸡心切花刀焯水沥干（用鸡腿肉替代切薄片）","泡椒切段芹菜切段","锅中油热大火爆炒鸡肉至变色盛出","留油炒泡椒姜蒜末出酸辣香","下芹菜段翻炒回锅鸡肉","加生抽醋翻炒均匀出锅"],
["泡椒系列","下酒菜","快手菜"]);

R("pao-jiao-yu-pian","泡椒鱼片","Pickled Pepper Fish Slices","sichuan","stir_fry",["sour","spicy","umami"],"medium","intermediate",15,8,3,
[I("fish_fillet",300,"g"),I("chili_pepper",6,"piece"),I("capsicum",1,"piece"),I("garlic",3,"piece"),I("ginger",3,"piece"),I("egg",1,"piece"),I("starch",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("light_soy",1,"tbsp"),I("cooking_oil",3,"tbsp")],
["鱼片加蛋清淀粉料酒上浆腌10分钟","泡椒切段彩椒切块","锅中油热滑入鱼片煎至两面微黄盛出","留油炒泡椒姜蒜出酸辣香","下彩椒翻炒回锅鱼片","轻轻翻动加生抽调味出锅"],
["泡椒系列","海鲜","下饭菜"]);

R("pao-jiao-you-yu","泡椒鱿鱼","Pickled Pepper Squid","sichuan","stir_fry",["sour","spicy"],"medium","intermediate",10,8,2,
[I("squid",300,"g"),I("chili_pepper",6,"piece"),I("capsicum",1,"piece"),I("garlic",4,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("sugar",0.5,"tbsp"),I("starch",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["鱿鱼切花刀焯水卷起捞出沥干","泡椒切段彩椒切块","锅中油热大火爆炒鱿鱼卷盛出","留油炒泡椒姜蒜出香","回锅鱿鱼加生抽糖翻炒","下彩椒块大火翻匀出锅"],
["泡椒系列","海鲜","下酒菜"]);

R("suan-cai-yu","酸菜鱼","Sichuan Pickled Vegetable Fish","sichuan","boil",["sour","spicy","umami"],"medium","intermediate",20,15,4,
[I("fish_fillet",400,"g"),I("chinese_cabbage",200,"g"),I("chili_pepper",5,"piece"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",4,"piece"),I("ginger",4,"piece"),I("egg",1,"piece"),I("starch",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("cooking_oil",3,"tbsp")],
["鱼片加蛋清淀粉料酒上浆","酸菜（用白菜替代泡制）切丝","锅中油热炒姜蒜酸菜出酸香加水烧开","鱼骨先煮10分钟出白汤","鱼片逐片滑入煮1分钟至熟","撒花椒干辣椒淋热油出锅"],
["酸菜系列","川菜经典","宴客菜"]);

R("suan-cai-fen-si-tang","酸菜粉丝汤","Pickled Cabbage Vermicelli Soup","sichuan","boil",["sour","umami"],"easy","basic",10,10,2,
[I("chinese_cabbage",200,"g"),I("vermicelli",100,"g"),I("pork_mince",80,"g"),I("chili_pepper",3,"piece"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("vinegar",1,"tbsp"),I("salt",0.5,"tbsp"),I("cooking_oil",1,"tbsp")],
["粉丝泡软酸菜切丝","锅中油热炒肉末散加酸菜翻炒出酸香","加清水烧开下粉丝煮3分钟","加生抽醋盐调味","撒干辣椒蒜末出锅"],
["酸菜系列","汤菜","快手菜"]);

R("suan-cai-chao-rou-si","酸菜炒肉丝","Stir-fried Pork with Pickled Cabbage","sichuan","stir_fry",["sour","salty"],"easy","basic",10,8,2,
[I("pork_loin",200,"g"),I("chinese_cabbage",200,"g"),I("chili_pepper",3,"piece"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("starch",0.5,"tbsp"),I("sugar",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["肉丝加生抽淀粉腌10分钟","酸菜切丝干辣椒切段","锅中油热爆炒肉丝至变色盛出","留油炒酸菜丝至出酸香","回锅肉丝加糖翻炒均匀出锅"],
["酸菜系列","下饭菜","快手菜"]);

R("suan-cai-dun-pai-gu","酸菜炖排骨","Braised Ribs with Pickled Cabbage","sichuan","braise",["sour","umami"],"medium","intermediate",15,40,4,
[I("pork_ribs",500,"g"),I("chinese_cabbage",300,"g"),I("ginger",4,"piece"),I("garlic",3,"piece"),I("star_anise",1,"piece"),I("cooking_wine",2,"tbsp"),I("light_soy",1,"tbsp"),I("salt",1,"tbsp"),I("white_pepper",0.5,"tbsp"),I("spring_onion",2,"piece")],
["排骨剁段焯水去血沫洗净","锅中油热煎排骨至微黄","加姜蒜八角炒香加料酒","加水没过排骨大火烧开转小火炖30分钟","加酸菜丝继续炖10分钟至酸香浓郁","加盐白胡椒调味撒葱花出锅"],
["酸菜系列","炖菜","下饭菜"]);

R("suan-cai-chao-ji-kuai","酸菜炒鸡块","Stir-fried Chicken with Pickled Cabbage","sichuan","stir_fry",["sour","spicy"],"medium","basic",15,12,3,
[I("chicken_thigh",300,"g"),I("chinese_cabbage",200,"g"),I("chili_pepper",4,"piece"),I("garlic",3,"piece"),I("ginger",3,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("sugar",0.5,"tbsp"),I("starch",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["鸡腿肉切块加料酒淀粉腌10分钟","酸菜切丝备用","锅中油热下鸡块煎至金黄盛出","留油炒酸菜丝至出酸香加姜蒜辣椒","回锅鸡块加生抽糖翻炒","焖2分钟至入味出锅"],
["酸菜系列","下饭菜","家常菜"]);

R("hui-guo-rou","回锅肉","Twice-Cooked Pork","sichuan","stir_fry",["spicy","salty","umami"],"medium","intermediate",15,10,3,
[I("pork_belly",400,"g"),I("capsicum",2,"piece"),I("leek",100,"g"),I("doubanjiang",1.5,"tbsp"),I("bean_paste",1,"tbsp"),I("sugar",0.5,"tbsp"),I("ginger",3,"piece"),I("garlic",3,"piece"),I("cooking_wine",1,"tbsp"),I("cooking_oil",1,"tbsp")],
["五花肉整块冷水下锅煮20分钟捞出放凉切薄片","青红椒切块蒜苗切段","锅中不加油下五花肉片煸至卷曲出油","推到一边下豆瓣酱炒出红油","加甜面酱翻炒均匀肉片上色","下蒜苗青红椒大火翻炒断生出锅"],
["回锅系列","川菜经典","下饭菜"]);

R("hui-guo-ji-kuai","回锅鸡","Twice-Cooked Chicken","sichuan","stir_fry",["spicy","salty"],"medium","intermediate",20,10,3,
[I("chicken_thigh",400,"g"),I("capsicum",2,"piece"),I("leek",80,"g"),I("doubanjiang",1.5,"tbsp"),I("bean_paste",1,"tbsp"),I("ginger",3,"piece"),I("garlic",3,"piece"),I("cooking_wine",1,"tbsp"),I("sugar",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["鸡腿肉整块煮熟放凉切片","青红椒切块蒜苗切段","锅中油热下鸡片煎至两面微黄","下豆瓣酱甜面酱炒出红油","鸡片裹上酱色","下蒜苗青椒大火翻炒出锅"],
["回锅系列","下饭菜","家常菜"]);

R("hui-guo-xia","回锅虾","Twice-Cooked Shrimp","sichuan","stir_fry",["spicy","salty","umami"],"medium","intermediate",15,10,3,
[I("shrimp",400,"g"),I("capsicum",1,"piece"),I("leek",60,"g"),I("doubanjiang",1,"tbsp"),I("bean_paste",0.5,"tbsp"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("cooking_wine",1,"tbsp"),I("sugar",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["大虾去虾线焯水变红捞出沥干","青椒切块蒜苗切段","锅中油热下虾煎至微焦","加豆瓣酱甜面酱炒出红油","虾裹上酱色加蒜苗青椒","大火翻炒断生出锅"],
["回锅系列","海鲜","下饭菜"]);

R("hui-guo-dou-fu","回锅豆腐","Twice-Cooked Tofu","sichuan","stir_fry",["spicy","salty"],"easy","basic",10,10,2,
[I("tofu",400,"g"),I("capsicum",1,"piece"),I("leek",60,"g"),I("doubanjiang",1,"tbsp"),I("bean_paste",0.5,"tbsp"),I("garlic",3,"piece"),I("sugar",0.5,"tbsp"),I("light_soy",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["豆腐切厚片煎至两面金黄盛出","青椒切块蒜苗切段","锅中留油炒豆瓣酱甜面酱出红油","回锅豆腐片轻轻翻炒上色","下蒜苗青椒翻炒断生出锅"],
["回锅系列","素菜","下饭菜"]);

R("hui-guo-la-rou","回锅腊肉","Twice-Cooked Cured Pork","sichuan","stir_fry",["spicy","salty","smoky"],"medium","intermediate",15,10,3,
[I("bacon",300,"g"),I("capsicum",2,"piece"),I("leek",80,"g"),I("doubanjiang",1,"tbsp"),I("bean_paste",0.5,"tbsp"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("cooking_wine",1,"tbsp"),I("sugar",0.5,"tbsp"),I("cooking_oil",1,"tbsp")],
["腊肉（用培根替代）切片蒜苗切段","锅中不加油下腊肉片煸至透明出油","推到一边下豆瓣酱甜面酱炒出红油","加姜蒜炒香","下青椒块翻炒","加蒜苗段大火翻炒断生出锅"],
["回锅系列","腊味","下饭菜"]);

// more sichuan
R("la-zi-ji","辣子鸡","Chongqing Chili Chicken","sichuan","deep_fry",["spicy","numbing","salty"],"medium","intermediate",20,12,3,
[I("chicken_thigh",400,"g"),I("chili_pepper",15,"piece"),I("sichuan_pepper",1.5,"tbsp"),I("garlic",4,"piece"),I("ginger",3,"piece"),I("cooking_wine",1,"tbsp"),I("light_soy",1,"tbsp"),I("starch",1,"tbsp"),I("sugar",0.5,"tbsp"),I("cooking_oil",4,"tbsp")],
["鸡腿肉切丁加料酒生抽淀粉腌15分钟","锅中宽油炸鸡丁至金黄酥脆捞出","锅留少油小火炒满锅干辣椒和花椒","至辣椒变色出香回锅鸡丁","加蒜末糖大火翻炒","炒至鸡丁干香酥脆出锅"],
["麻辣系列","川菜经典","下酒菜"]);

R("mao-xue-wang","毛血旺","Mao Xue Wang Spicy Medley","sichuan","boil",["spicy","numbing","umami"],"hard","advanced",25,20,4,
[I("pork_belly",150,"g"),I("bean_sprouts",200,"g"),I("squid",100,"g"),I("dried_tofu",100,"g"),I("doubanjiang",2,"tbsp"),I("chili_flakes",3,"tbsp"),I("sichuan_pepper",1.5,"tbsp"),I("garlic",6,"piece"),I("ginger",4,"piece"),I("cooking_oil",4,"tbsp")],
["五花肉切片鱿鱼切花刀豆干切片","豆芽焯水铺碗底","锅中油热炒豆瓣酱至红油加水烧开","下五花肉片煮至熟下鱿鱼豆干煮2分钟","所有食材捞出铺碗中","撒花椒辣椒面蒜末淋滚油激出香味"],
["川菜经典","麻辣系列","宴客菜"]);

R("kou-shui-ji","口水鸡","Sichuan Saliva Chicken","sichuan","cold_dress",["spicy","numbing","umami"],"medium","intermediate",15,20,3,
[I("chicken_thigh",400,"g"),I("sichuan_pepper",1,"tbsp"),I("chili_flakes",2,"tbsp"),I("garlic",5,"piece"),I("ginger",3,"piece"),I("light_soy",2,"tbsp"),I("vinegar",1,"tbsp"),I("sugar",1,"tbsp"),I("sesame_oil",1,"tbsp"),I("spring_onion",2,"piece")],
["鸡腿冷水下锅加姜煮15分钟关火焖10分钟","捞出冰水浸泡至凉透切块摆盘","调口水汁：生抽醋糖蒜末辣椒面花椒油麻油","将口水汁均匀淋在鸡肉上","撒葱花香菜即可上桌"],
["凉菜","川菜经典","下酒菜"]);

R("fu-qi-fei-pian","夫妻肺片","Husband Wife Lung Slices","sichuan","cold_dress",["spicy","numbing","umami"],"medium","intermediate",30,30,4,
[I("beef_sirloin",400,"g"),I("sichuan_pepper",1,"tbsp"),I("chili_flakes",2,"tbsp"),I("garlic",4,"piece"),I("light_soy",2,"tbsp"),I("sugar",1,"tbsp"),I("sesame_oil",1,"tbsp"),I("spring_onion",2,"piece"),I("star_anise",2,"piece"),I("five_spice",0.5,"tbsp")],
["牛肉整块冷水下锅加八角五香粉姜煮40分钟","捞出放凉切极薄片摆盘","调红油汁：辣椒面花椒面蒜末生抽糖麻油","热油泼辣椒面制成红油","将红油汁淋在牛肉片上撒葱花","冷藏30分钟后食用更入味"],
["凉菜","川菜经典","下酒菜"]);

R("deng-ying-niu-rou","灯影牛肉","Lantern Shadow Beef","sichuan","deep_fry",["spicy","sweet"],"hard","advanced",30,20,3,
[I("beef_sirloin",300,"g"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("sugar",1.5,"tbsp"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("sesame_oil",1,"tbsp"),I("five_spice",0.5,"tbsp"),I("cooking_oil",3,"tbsp")],
["牛肉切极薄大片加料酒五香粉腌20分钟","入烤箱或低油温炸至酥脆","锅中少油小火炒辣椒面花椒面至出香","加生抽糖调成酱汁","回锅牛肉片裹匀酱汁","淋麻油翻匀出锅"],
["川菜经典","零食","下酒菜"]);

R("gan-bian-si-ji-dou","干煸四季豆","Dry-Fried Green Beans","sichuan","stir_fry",["salty","umami","spicy"],"easy","basic",10,10,2,
[I("green_bean",400,"g"),I("pork_mince",80,"g"),I("chili_pepper",4,"piece"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("salt",0.5,"tbsp"),I("cooking_oil",3,"tbsp")],
["四季豆掐段沥干","锅中多油炸四季豆至表皮起皱捞出","锅留底油炒肉末散加姜蒜辣椒花椒","炒出香味回锅四季豆","加生抽盐大火翻炒至干香","出锅装盘"],
["川菜经典","下饭菜","素菜"]);

R("gan-bian-niu-rou-si","干煸牛肉丝","Dry-Fried Shredded Beef","sichuan","stir_fry",["spicy","salty"],"medium","intermediate",15,10,2,
[I("beef_sirloin",300,"g"),I("celery",100,"g"),I("chili_pepper",6,"piece"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("cumin",0.5,"tbsp"),I("cooking_oil",3,"tbsp")],
["牛肉切细丝加料酒生抽腌10分钟","芹菜切段干辣椒切段","锅中油热下牛肉丝中火煸炒至干香","加干辣椒花椒姜蒜末炒出香","下芹菜段翻炒断生","撒孜然粉翻匀出锅"],
["川菜经典","下饭菜","下酒菜"]);

R("bang-bang-ji","棒棒鸡","Bang Bang Chicken","sichuan","cold_dress",["spicy","numbing","nutty"],"medium","intermediate",15,20,3,
[I("chicken_breast",300,"g"),I("cucumber",1,"piece"),I("sichuan_pepper",0.5,"tbsp"),I("chili_flakes",1,"tbsp"),I("garlic",3,"piece"),I("sesame_oil",1,"tbsp"),I("light_soy",2,"tbsp"),I("sugar",1,"tbsp"),I("vinegar",1,"tbsp"),I("spring_onion",1,"piece")],
["鸡胸肉冷水下锅煮熟捞出放凉","用擀面杖拍松撕成丝","黄瓜切丝铺盘底","调棒棒酱：辣椒面花椒油蒜末生抽醋糖麻油","鸡丝铺在黄瓜上","淋上棒棒酱撒葱花"],
["凉菜","川菜经典","夏季菜"]);

R("chuan-bei-liang-fen","川北凉粉","Sichuan Clear Noodle Jelly","sichuan","cold_dress",["spicy","sour","numbing"],"easy","basic",10,5,2,
[I("starch",200,"g"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",4,"piece"),I("light_soy",2,"tbsp"),I("vinegar",2,"tbsp"),I("sugar",0.5,"tbsp"),I("sesame_oil",1,"tbsp"),I("spring_onion",1,"piece")],
["淀粉加水调成糊煮成凉粉冷却切条","调红油汁：辣椒面花椒面蒜末生抽醋糖","热油泼辣椒面制红油","凉粉条摆盘","淋上红油调料","撒葱花拌匀食用"],
["凉菜","小吃","夏季菜"]);

R("ma-po-dou-fu","麻婆豆腐","Mapo Tofu","sichuan","stir_fry",["spicy","numbing","umami"],"easy","basic",10,10,2,
[I("tofu",400,"g"),I("pork_mince",80,"g"),I("doubanjiang",1.5,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("chili_flakes",0.5,"tbsp"),I("garlic",3,"piece"),I("spring_onion",2,"piece"),I("starch",1,"tbsp"),I("light_soy",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["豆腐切块入盐水煮2分钟沥干","锅中油热炒肉末散至出油","加豆瓣酱炒出红油加蒜末辣椒面","加少量水烧开下豆腐小火煮3分钟","水淀粉勾芡撒花椒粉","翻匀撒葱花出锅"],
["川菜经典","素菜","下饭菜"]);

R("gong-bao-ji-ding","宫保鸡丁","Kung Pao Chicken","sichuan","stir_fry",["spicy","sweet","numbing"],"medium","basic",15,8,3,
[I("chicken_breast",300,"g"),I("chili_pepper",8,"piece"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("spring_onion",2,"piece"),I("light_soy",1,"tbsp"),I("vinegar",1,"tbsp"),I("sugar",1,"tbsp"),I("starch",1,"tbsp")],
["鸡丁加生抽淀粉腌10分钟","调宫保汁：醋糖生抽淀粉水","锅中油热下鸡丁滑散至变色盛出","留油小火炒干辣椒花椒至变色","加姜蒜葱白炒香回锅鸡丁","倒宫保汁大火翻炒收汁出锅"],
["川菜经典","经典名菜","下饭菜"]);

R("chuan-xiang-ji-chi","川香鸡翅","Sichuan Spicy Wings","sichuan","braise",["spicy","numbing","umami"],"medium","intermediate",15,20,3,
[I("chicken_wing",500,"g"),I("doubanjiang",1.5,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("chili_pepper",6,"piece"),I("garlic",4,"piece"),I("ginger",3,"piece"),I("dark_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("sugar",1,"tbsp"),I("cooking_oil",2,"tbsp")],
["鸡翅划刀加料酒腌10分钟","锅中油热煎鸡翅至两面金黄","加豆瓣酱花椒干辣椒姜蒜炒出红油","加老抽糖和少量水","中火烧15分钟至鸡翅入味","大火收汁至浓稠裹住鸡翅出锅"],
["麻辣系列","下酒菜","宴客菜"]);

R("yan-jian-rou","盐煎肉","Salt-Fried Pork","sichuan","stir_fry",["salty","spicy","umami"],"easy","basic",10,8,2,
[I("pork_belly",300,"g"),I("capsicum",2,"piece"),I("leek",60,"g"),I("doubanjiang",1,"tbsp"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("light_soy",0.5,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("salt",0.5,"tbsp"),I("cooking_oil",1,"tbsp")],
["五花肉切薄片青椒切块蒜苗切段","锅中不加油下肉片小火煸至出油卷曲","推到一边下豆瓣酱炒出红油","肉片裹上酱色加蒜姜","下青椒蒜苗大火翻炒","加盐调味出锅"],
["川菜经典","下饭菜","快手菜"]);

R("dou-hua-yu","豆花鱼","Tofu Pudding Fish","sichuan","boil",["spicy","numbing","umami"],"medium","intermediate",15,12,3,
[I("fish_fillet",300,"g"),I("tofu",300,"g"),I("doubanjiang",1.5,"tbsp"),I("chili_flakes",1,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",4,"piece"),I("ginger",3,"piece"),I("starch",1,"tbsp"),I("egg",1,"piece"),I("cooking_oil",3,"tbsp")],
["鱼片加蛋清淀粉上浆豆腐切小块","锅中油热炒豆瓣酱出红油加水烧开","下豆腐块煮3分钟","鱼片逐片滑入煮1分钟至熟","撒花椒辣椒面蒜末","淋热油激出香味出锅"],
["水煮系列","川菜特色","下饭菜"]);

R("xiang-la-xie","香辣蟹风味虾","Spicy Crab-Style Shrimp","sichuan","stir_fry",["spicy","numbing","umami"],"medium","intermediate",15,12,3,
[I("shrimp",500,"g"),I("doubanjiang",2,"tbsp"),I("chili_pepper",8,"piece"),I("sichuan_pepper",1,"tbsp"),I("garlic",6,"piece"),I("ginger",4,"piece"),I("onion",0.5,"piece"),I("cooking_wine",2,"tbsp"),I("sugar",1,"tbsp"),I("cooking_oil",3,"tbsp")],
["虾去虾线洗净沥干","锅中油热煎虾至两面变红盛出","留油炒豆瓣酱花椒干辣椒出红油","加姜蒜洋葱块炒香","回锅虾加料酒糖翻炒","大火收汁至酱汁浓稠出锅"],
["麻辣系列","海鲜","宴客菜"]);

R("ji-si-liang-mian","鸡丝凉面","Cold Chicken Noodles","sichuan","cold_dress",["spicy","sour","numbing"],"easy","basic",15,10,2,
[I("noodles_dried",200,"g"),I("chicken_breast",150,"g"),I("cucumber",1,"piece"),I("garlic",3,"piece"),I("chili_flakes",1,"tbsp"),I("light_soy",2,"tbsp"),I("vinegar",1,"tbsp"),I("sesame_oil",1,"tbsp"),I("sugar",0.5,"tbsp"),I("spring_onion",1,"piece")],
["面条煮熟过凉水沥干拌少许麻油","鸡胸肉煮熟撕成丝黄瓜切丝","调料汁：生抽醋蒜末辣椒面糖麻油","面条装盘铺鸡丝黄瓜丝","浇上调料汁","拌匀即食"],
["凉菜","面食","夏季菜"]);

R("chong-qing-xiao-mian","重庆小面","Chongqing Noodles","sichuan","boil",["spicy","numbing","umami"],"easy","basic",10,10,2,
[I("noodles_dried",200,"g"),I("pork_mince",80,"g"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",3,"piece"),I("light_soy",2,"tbsp"),I("vinegar",0.5,"tbsp"),I("sesame_oil",1,"tbsp"),I("spring_onion",2,"piece"),I("bok_choy",100,"g")],
["碗中放辣椒面花椒面蒜末生抽醋麻油","加2勺面汤化开调料","面条和小白菜一起煮熟","面条捞入调料碗中","炒散肉末铺在面上","撒葱花拌匀食用"],
["面食","小吃","早餐"]);

R("dan-dan-mian","担担面","Dan Dan Noodles","sichuan","boil",["spicy","numbing","umami"],"easy","basic",10,10,2,
[I("noodles_dried",200,"g"),I("pork_mince",100,"g"),I("doubanjiang",1,"tbsp"),I("chili_flakes",1,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("light_soy",2,"tbsp"),I("vinegar",0.5,"tbsp"),I("sesame_oil",1,"tbsp"),I("garlic",3,"piece"),I("spring_onion",2,"piece")],
["锅中炒肉末散加豆瓣酱炒至香酥","碗中放辣椒面花椒面蒜末生抽醋麻油","加热面汤化开调料","面条煮熟捞入碗中","铺上炒好的肉末","撒葱花拌匀"],
["面食","川菜经典","小吃"]);

R("zhong-shui-jiao","钟水饺","Zhong Dumplings","sichuan","boil",["spicy","sweet"],"medium","intermediate",30,10,3,
[I("pork_mince",300,"g"),I("wonton_wrapper",40,"piece"),I("chili_flakes",2,"tbsp"),I("light_soy",2,"tbsp"),I("sugar",1,"tbsp"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("sesame_oil",1,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("spring_onion",2,"piece")],
["肉馅加料酒姜末葱花生抽搅拌上劲","用饺子皮包成元宝形水饺","大锅水烧开下饺子煮至浮起","碗中调红油汁：辣椒油生抽糖蒜末","饺子捞入碗中","淋上红油汁拌匀"],
["小吃","川菜经典","面食"]);

R("suan-la-fen","酸辣粉","Hot and Sour Noodles","sichuan","boil",["sour","spicy","umami"],"easy","basic",10,8,2,
[I("vermicelli",200,"g"),I("pork_mince",60,"g"),I("chili_flakes",1,"tbsp"),I("vinegar",2,"tbsp"),I("light_soy",1,"tbsp"),I("garlic",3,"piece"),I("spring_onion",2,"piece"),I("sesame_oil",0.5,"tbsp"),I("starch",0.5,"tbsp"),I("cooking_oil",1,"tbsp")],
["粉丝煮软捞出","碗中放辣椒面蒜末生抽醋麻油","加热汤化开调料","锅中炒肉末至酥香","粉丝捞入碗中铺肉末","撒葱花花生碎拌匀"],
["小吃","面食","夜宵"]);

R("la-fen-tang","辣粉汤","Spicy Vermicelli Soup","sichuan","boil",["spicy","sour","umami"],"easy","basic",10,10,2,
[I("vermicelli",150,"g"),I("pork_mince",60,"g"),I("chili_flakes",1,"tbsp"),I("doubanjiang",0.5,"tbsp"),I("garlic",3,"piece"),I("vinegar",1,"tbsp"),I("light_soy",1,"tbsp"),I("egg",1,"piece"),I("spring_onion",2,"piece"),I("cooking_oil",1,"tbsp")],
["锅中油热炒肉末散加豆瓣酱炒出红油","加水烧开下粉丝煮3分钟","打入鸡蛋煮成荷包蛋","加生抽醋辣椒面调味","撒葱花出锅"],
["汤菜","小吃","快手菜"]);

R("mao-cai","冒菜","Sichuan Maocai","sichuan","boil",["spicy","numbing","umami"],"easy","basic",15,10,3,
[I("bean_sprouts",100,"g"),I("mushroom",80,"g"),I("tofu",100,"g"),I("vermicelli",80,"g"),I("bok_choy",100,"g"),I("doubanjiang",2,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("chili_flakes",1,"tbsp"),I("garlic",4,"piece"),I("cooking_oil",2,"tbsp")],
["锅中油热炒豆瓣酱花椒干辣椒出红油","加水烧开成麻辣汤底","先下豆腐蘑菇煮3分钟","再下粉丝豆芽小白菜煮2分钟","所有食材捞入碗中","浇上汤汁撒蒜末出锅"],
["小吃","麻辣系列","快手菜"]);

R("liang-ban-ji-kuai","凉拌鸡块","Cold Spiced Chicken","sichuan","cold_dress",["spicy","numbing","umami"],"easy","basic",10,20,3,
[I("chicken_thigh",400,"g"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",4,"piece"),I("light_soy",2,"tbsp"),I("vinegar",1,"tbsp"),I("sugar",0.5,"tbsp"),I("sesame_oil",1,"tbsp"),I("spring_onion",2,"piece"),I("ginger",3,"piece")],
["鸡腿冷水下锅加姜煮熟放凉剁块","调红油汁：辣椒面花椒粉蒜末生抽醋糖","热油泼辣椒面出红油","鸡块摆盘淋上红油汁","撒葱花香菜拌匀","冷藏片刻食用更佳"],
["凉菜","下酒菜","夏季菜"]);

R("chuan-wei-shao-bai","川味蒜泥白肉","Garlic White Pork Sichuan Style","sichuan","cold_dress",["spicy","garlicky","numbing"],"medium","intermediate",10,25,3,
[I("pork_belly",400,"g"),I("garlic",8,"piece"),I("chili_flakes",2,"tbsp"),I("light_soy",2,"tbsp"),I("vinegar",1,"tbsp"),I("sugar",1,"tbsp"),I("sesame_oil",1,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("cucumber",1,"piece"),I("spring_onion",1,"piece")],
["五花肉整块冷水下锅煮25分钟捞出放凉","切极薄片摆盘铺黄瓜片","蒜泥加辣椒面花椒粉生抽醋糖麻油调汁","热油泼蒜泥辣椒面激出香味","将蒜泥红油汁浇在肉片上","撒葱花即可上桌"],
["凉菜","川菜经典","下酒菜"]);

R("la-jiao-chao-rou","辣椒炒肉","Stir-fried Pork with Chilies","sichuan","stir_fry",["spicy","salty"],"easy","basic",10,8,2,
[I("pork_belly",250,"g"),I("chili_pepper",8,"piece"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("doubanjiang",0.5,"tbsp"),I("light_soy",1,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("salt",0.3,"tbsp"),I("cooking_oil",1,"tbsp")],
["五花肉切片辣椒切段","锅中不加油煸五花肉至出油","加姜蒜豆瓣酱炒香","下辣椒段大火翻炒","加生抽料酒调味","翻炒至辣椒断生虎皮微焦出锅"],
["下饭菜","快手菜","家常菜"]);

R("chuan-wei-kao-yu","川味烤鱼风味","Sichuan Grilled Fish Style","sichuan","braise",["spicy","numbing","umami"],"hard","advanced",20,25,4,
[I("fish_fillet",500,"g"),I("bean_sprouts",200,"g"),I("celery",80,"g"),I("doubanjiang",2,"tbsp"),I("chili_pepper",10,"piece"),I("sichuan_pepper",1.5,"tbsp"),I("garlic",8,"piece"),I("ginger",4,"piece"),I("cooking_wine",2,"tbsp"),I("cooking_oil",4,"tbsp")],
["鱼加料酒姜腌15分钟煎至两面金黄","豆芽芹菜焯水铺烤盘底","锅中油热炒豆瓣酱花椒干辣椒出红油","加蒜末姜末水煮成麻辣汤","鱼铺在菜上浇上麻辣汤","入烤箱200度烤15分钟或锅中焖煮"],
["川菜特色","宴客菜","海鲜"]);

R("chuan-xiang-niu-rou-gan","川香牛肉干","Sichuan Spiced Beef Jerky","sichuan","deep_fry",["spicy","sweet","numbing"],"medium","intermediate",20,25,3,
[I("beef_sirloin",400,"g"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("five_spice",0.5,"tbsp"),I("sugar",2,"tbsp"),I("light_soy",2,"tbsp"),I("cooking_wine",1,"tbsp"),I("sesame_oil",1,"tbsp"),I("ginger",3,"piece"),I("star_anise",1,"piece")],
["牛肉切条加料酒八角五香粉煮20分钟","捞出沥干撕成条","锅中少油炸牛肉条至酥干","另起锅小火炒辣椒面花椒面","加糖生抽调成酱倒入牛肉条","翻炒裹匀淋麻油出锅"],
["零食","下酒菜","川菜特色"]);

R("cong-jiao-ji-kuai","葱椒鸡","Scallion Pepper Chicken","sichuan","stir_fry",["numbing","salty","umami"],"medium","intermediate",15,10,3,
[I("chicken_thigh",400,"g"),I("spring_onion",4,"piece"),I("sichuan_pepper",1.5,"tbsp"),I("chili_pepper",4,"piece"),I("garlic",4,"piece"),I("ginger",3,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("salt",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["鸡腿肉切块加料酒姜腌10分钟","葱切大段干辣椒切段","锅中油热下鸡块煎至金黄","加花椒干辣椒蒜末炒出香","加生抽少量水焖5分钟","下大量葱段大火翻炒出锅"],
["川菜特色","下饭菜","下酒菜"]);

R("chuan-wei-la-niu-rou","川味卤牛肉","Sichuan Braised Beef","sichuan","braise",["spicy","numbing","umami"],"medium","intermediate",15,60,4,
[I("beef_sirloin",600,"g"),I("sichuan_pepper",2,"tbsp"),I("chili_pepper",8,"piece"),I("star_anise",3,"piece"),I("five_spice",1,"tbsp"),I("dark_soy",2,"tbsp"),I("light_soy",2,"tbsp"),I("sugar",1,"tbsp"),I("ginger",5,"piece"),I("cooking_wine",2,"tbsp")],
["牛肉切大块焯水去血沫","锅中加花椒八角五香粉干辣椒炒香","加老抽生抽料酒糖和足量水","下牛肉大火烧开转小火","卤煮60分钟至筷子能插透","捞出放凉切片淋卤汁上桌"],
["卤味","川菜特色","下酒菜"]);

R("xiao-chao-rou","小炒肉","Sichuan Quick-Fried Pork","sichuan","stir_fry",["spicy","salty"],"easy","basic",10,8,2,
[I("pork_loin",250,"g"),I("chili_pepper",6,"piece"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("dark_soy",0.5,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("starch",0.5,"tbsp"),I("sugar",0.3,"tbsp"),I("cooking_oil",2,"tbsp")],
["肉片加生抽淀粉腌5分钟","辣椒切斜段","锅中油热大火爆炒肉片至变色","加姜蒜末炒香","下辣椒段加老抽上色","加糖提鲜翻炒均匀出锅"],
["下饭菜","快手菜","家常菜"]);

R("cong-you-quan-bing","葱油全饼","Sichuan Scallion Flatbread","sichuan","pan_fry",["salty","aromatic"],"easy","basic",15,10,2,
[I("flour",300,"g"),I("spring_onion",4,"piece"),I("salt",1,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("cooking_oil",3,"tbsp"),I("sesame_oil",1,"tbsp")],
["面粉加温水揉成面团醒20分钟","擀成薄饼撒盐花椒粉葱花卷起","再擀成圆饼","平底锅刷油小火烙至两面金黄","刷一层麻油","切块装盘"],
["面食","小吃","早餐"]);

R("ji-dou-hua","鸡豆花","Chicken Tofu Pudding","sichuan","boil",["umami","light"],"hard","advanced",20,15,3,
[I("chicken_breast",200,"g"),I("egg",3,"piece"),I("starch",1,"tbsp"),I("salt",0.5,"tbsp"),I("white_pepper",0.3,"tbsp"),I("spring_onion",1,"piece"),I("ginger",2,"piece"),I("cooking_wine",0.5,"tbsp")],
["鸡胸肉剁成极细的蓉加蛋清淀粉搅成糊","高汤烧开转小火","鸡糊慢慢淋入汤中凝成豆花状","轻轻搅动至鸡豆花全部浮起","加盐白胡椒调味","撒葱花出锅"],
["川菜功夫菜","汤菜","宴客菜"]);

R("la-rou-chao-cai-tai","腊肉炒菜心","Stir-fried Cured Meat with Greens","sichuan","stir_fry",["salty","smoky","umami"],"easy","basic",10,8,2,
[I("bacon",200,"g"),I("bok_choy",300,"g"),I("chili_pepper",3,"piece"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("light_soy",0.5,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("cooking_oil",1,"tbsp")],
["腊肉（用培根替代）切片菜心洗净切段","锅中不加油煸腊肉至透明出油","加姜蒜干辣椒炒香","下菜心梗先翻炒1分钟","再下菜叶加料酒翻炒","加生抽调味炒至菜心断生出锅"],
["腊味","快手菜","下饭菜"]);

R("suan-la-bai-cai","酸辣白菜","Hot and Sour Cabbage","sichuan","stir_fry",["sour","spicy"],"easy","beginner",5,5,2,
[I("chinese_cabbage",400,"g"),I("chili_pepper",4,"piece"),I("garlic",3,"piece"),I("vinegar",2,"tbsp"),I("light_soy",1,"tbsp"),I("sugar",0.5,"tbsp"),I("sichuan_pepper",0.3,"tbsp"),I("starch",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["白菜叶手撕大块梗切片分开","锅中油热下花椒干辣椒爆香捞出","大火下白菜梗翻炒1分钟","下白菜叶加醋生抽糖翻炒","淋水淀粉勾薄芡","翻匀出锅"],
["快手菜","素菜","下饭菜"]);

R("dou-chi-zheng-pai-gu","豆豉蒸排骨","Steamed Ribs with Black Beans","sichuan","steam",["salty","umami"],"easy","basic",15,25,3,
[I("pork_ribs",400,"g"),I("bean_paste",1.5,"tbsp"),I("garlic",4,"piece"),I("ginger",3,"piece"),I("chili_pepper",2,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("starch",1,"tbsp"),I("sugar",0.5,"tbsp"),I("spring_onion",1,"piece")],
["排骨剁小段洗净加豆豉蒜末姜末","加生抽料酒糖淀粉拌匀腌20分钟","蒸盘铺上排骨摊平","大火蒸25分钟至排骨熟透","撒干辣椒圈和葱花","淋少许热油出锅"],
["蒸菜","川菜特色","下饭菜"]);

R("la-you-hong-su-tu-dou","辣油红酥土豆","Chili Oil Crispy Potatoes","sichuan","deep_fry",["spicy","salty","numbing"],"easy","basic",10,10,2,
[I("potato",400,"g"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",3,"piece"),I("light_soy",1,"tbsp"),I("vinegar",0.5,"tbsp"),I("spring_onion",2,"piece"),I("sesame_oil",0.5,"tbsp"),I("salt",0.5,"tbsp"),I("cooking_oil",3,"tbsp")],
["土豆切滚刀块蒸熟","锅中宽油炸土豆至外酥金黄捞出","锅留底油小火炒辣椒面花椒面蒜末","加醋生抽调成酱","回锅土豆翻炒裹匀","撒葱花淋麻油出锅"],
["小吃","下酒菜","素菜"]);

R("chuan-wei-hong-shao-rou","川味红烧肉","Sichuan Braised Pork Belly","sichuan","braise",["spicy","sweet","umami"],"medium","intermediate",15,45,4,
[I("pork_belly",500,"g"),I("doubanjiang",1,"tbsp"),I("star_anise",2,"piece"),I("sichuan_pepper",0.5,"tbsp"),I("dark_soy",1,"tbsp"),I("light_soy",1,"tbsp"),I("sugar",2,"tbsp"),I("ginger",4,"piece"),I("cooking_wine",2,"tbsp"),I("chili_pepper",3,"piece")],
["五花肉切方块焯水去血沫","锅中少油加糖炒成焦糖色","下五花肉翻炒上色","加豆瓣酱八角花椒干辣椒姜片炒香","加老抽生抽料酒和水大火烧开","转小火炖40分钟至软烂大火收汁出锅"],
["川菜特色","硬菜","下饭菜"]);

R("qing-jiao-ji-kuai","青椒鸡块","Green Pepper Chicken","sichuan","stir_fry",["spicy","salty"],"easy","basic",10,10,3,
[I("chicken_thigh",300,"g"),I("capsicum",3,"piece"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("doubanjiang",0.5,"tbsp"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("starch",0.5,"tbsp"),I("salt",0.3,"tbsp"),I("cooking_oil",2,"tbsp")],
["鸡腿肉切块加料酒淀粉腌10分钟","青椒切块","锅中油热下鸡块煎至金黄","加豆瓣酱姜蒜炒出红油","下青椒块大火翻炒","加生抽盐调味翻炒均匀出锅"],
["下饭菜","快手菜","家常菜"]);

R("la-jiao-chao-ji-dan","辣椒炒鸡蛋","Stir-fried Eggs with Chilies","sichuan","stir_fry",["spicy","salty"],"easy","beginner",5,5,2,
[I("egg",4,"piece"),I("chili_pepper",5,"piece"),I("garlic",2,"piece"),I("salt",0.5,"tbsp"),I("light_soy",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["鸡蛋打散加盐搅匀辣椒切圈","锅中油热倒入蛋液炒至半凝固盛出","留油下辣椒圈蒜末炒至虎皮","回锅鸡蛋翻炒均匀","加生抽调味出锅"],
["快手菜","下饭菜","早餐"]);

R("si-chuan-hui-guo-pai-gu","四川回锅排骨","Sichuan Twice-Cooked Ribs","sichuan","stir_fry",["spicy","salty","umami"],"medium","intermediate",20,15,3,
[I("pork_ribs",500,"g"),I("capsicum",2,"piece"),I("leek",80,"g"),I("doubanjiang",1.5,"tbsp"),I("bean_paste",1,"tbsp"),I("garlic",3,"piece"),I("ginger",3,"piece"),I("cooking_wine",1,"tbsp"),I("sugar",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["排骨焯水后煮20分钟捞出沥干","锅中油热下排骨煎至两面焦黄","加豆瓣酱甜面酱炒出红油","加蒜姜炒香","下青椒块蒜苗段大火翻炒","翻炒均匀出锅"],
["回锅系列","下饭菜","硬菜"]);

R("cong-bao-yao-hua","葱爆腰花","Scallion-Exploded Kidney Flowers","sichuan","stir_fry",["salty","umami","spicy"],"hard","advanced",15,5,2,
[I("pork_loin",300,"g"),I("spring_onion",4,"piece"),I("garlic",3,"piece"),I("ginger",3,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("vinegar",0.5,"tbsp"),I("sugar",0.5,"tbsp"),I("starch",0.5,"tbsp"),I("cooking_oil",3,"tbsp")],
["猪腰（用里脊替代）切花刀加料酒腌10分钟","调碗汁：生抽醋糖淀粉水","葱切大段姜蒜切片","锅中油热至冒烟大火爆炒腰花","加姜蒜炒匀倒入碗汁","下大葱段翻炒两下立即出锅"],
["川菜技法","下酒菜","下饭菜"]);

R("yu-xiang-xia-ren","鱼香虾仁","Fish-Fragrant Shrimp","sichuan","stir_fry",["sweet","sour","spicy"],"medium","intermediate",15,8,3,
[I("shrimp",300,"g"),I("capsicum",1,"piece"),I("carrot",0.5,"piece"),I("wood_ear",20,"g"),I("doubanjiang",1,"tbsp"),I("sugar",1.5,"tbsp"),I("vinegar",1.5,"tbsp"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("starch",1,"tbsp")],
["虾仁去虾线加淀粉料酒腌10分钟","木耳泡发切丝配菜切丝","调鱼香汁备用","锅中油热滑散虾仁变色盛出","炒豆瓣酱姜蒜出红油下配菜丝","回锅虾仁倒鱼香汁翻炒收汁"],
["鱼香系列","海鲜","下饭菜"]);

R("jiang-bao-ji-ding","酱爆鸡丁","Sauce-Exploded Chicken Dices","sichuan","stir_fry",["salty","sweet","umami"],"easy","basic",10,8,3,
[I("chicken_breast",300,"g"),I("capsicum",1,"piece"),I("onion",0.5,"piece"),I("bean_paste",2,"tbsp"),I("sugar",1,"tbsp"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("starch",1,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("cooking_oil",2,"tbsp")],
["鸡丁加淀粉料酒腌10分钟","洋葱彩椒切块","锅中油热滑散鸡丁至变白盛出","留油炒甜面酱至出香","下洋葱蒜姜翻炒","回锅鸡丁加糖翻炒裹匀加彩椒出锅"],
["下饭菜","快手菜","家常菜"]);

R("suan-la-tang","酸辣汤","Hot and Sour Soup","sichuan","boil",["sour","spicy","umami"],"easy","basic",10,10,2,
[I("tofu",100,"g"),I("egg",2,"piece"),I("wood_ear",15,"g"),I("mushroom",50,"g"),I("vinegar",3,"tbsp"),I("light_soy",1,"tbsp"),I("white_pepper",1,"tbsp"),I("starch",2,"tbsp"),I("sesame_oil",0.5,"tbsp"),I("spring_onion",1,"piece")],
["豆腐切丝木耳蘑菇切丝","锅中水烧开下豆腐丝木耳蘑菇丝煮3分钟","加醋生抽白胡椒粉调味","水淀粉勾芡搅匀","淋入蛋液搅成蛋花","淋麻油撒葱花出锅"],
["汤菜","快手菜","开胃菜"]);

R("la-rou-chao-fan","腊肉炒饭","Cured Meat Fried Rice","sichuan","stir_fry",["salty","smoky"],"easy","basic",10,8,2,
[I("rice",300,"g"),I("bacon",100,"g"),I("egg",2,"piece"),I("spring_onion",2,"piece"),I("capsicum",0.5,"piece"),I("garlic",2,"piece"),I("light_soy",1,"tbsp"),I("salt",0.3,"tbsp"),I("cooking_oil",2,"tbsp")],
["隔夜饭打散备用腊肉切丁彩椒切丁","锅中不加油煸腊肉丁出油","加蒜末炒香推到一边","另一边倒入蛋液炒散","加米饭大火翻炒均匀","加生抽盐彩椒丁炒匀撒葱花出锅"],
["主食","快手菜","家常菜"]);

R("ma-la-liang-ban-mian","麻辣凉拌面","Mala Cold Noodles","sichuan","cold_dress",["spicy","numbing","sour"],"easy","basic",10,8,2,
[I("noodles_dried",200,"g"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",3,"piece"),I("light_soy",2,"tbsp"),I("vinegar",1,"tbsp"),I("sugar",0.5,"tbsp"),I("sesame_oil",1,"tbsp"),I("spring_onion",2,"piece"),I("cucumber",0.5,"piece")],
["面条煮熟过凉水沥干","调麻辣汁：辣椒面花椒面蒜末生抽醋糖","热油泼辣椒面出红油","面条加麻油拌匀","浇上麻辣汁","加黄瓜丝葱花拌匀"],
["面食","凉菜","夏季菜"]);

R("la-rou-zheng-nan-gua","腊肉蒸南瓜","Steamed Pumpkin with Cured Meat","sichuan","steam",["sweet","salty","smoky"],"easy","basic",10,20,2,
[I("pumpkin",400,"g"),I("bacon",100,"g"),I("garlic",2,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("spring_onion",1,"piece"),I("cooking_oil",0.5,"tbsp")],
["南瓜切厚片摆盘底腊肉切片铺上","加蒜末姜丝淋生抽料酒","大火蒸20分钟至南瓜软糯","撒葱花","淋少许热油出锅"],
["蒸菜","快手菜","下饭菜"]);

R("cai-jiao-rou-si","菜椒肉丝","Pepper Pork Shreds","sichuan","stir_fry",["salty","umami"],"easy","basic",10,8,2,
[I("pork_loin",200,"g"),I("capsicum",3,"piece"),I("garlic",2,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("starch",0.5,"tbsp"),I("salt",0.3,"tbsp"),I("cooking_oil",2,"tbsp")],
["肉丝加生抽淀粉料酒腌10分钟","彩椒切丝","锅中油热大火爆炒肉丝至变色盛出","留油加姜蒜炒香下椒丝翻炒","回锅肉丝加盐翻炒均匀","出锅装盘"],
["快手菜","下饭菜","家常菜"]);

R("hong-you-chao-shou","红油抄手","Red Oil Wontons","sichuan","boil",["spicy","numbing","umami"],"medium","intermediate",25,8,3,
[I("pork_mince",200,"g"),I("wonton_wrapper",30,"piece"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",3,"piece"),I("light_soy",2,"tbsp"),I("vinegar",1,"tbsp"),I("sesame_oil",1,"tbsp"),I("spring_onion",2,"piece"),I("ginger",2,"piece")],
["肉馅加姜末葱花盐生抽搅拌上劲","用馄饨皮包成抄手","碗中放辣椒面花椒面蒜末热油泼成红油","加生抽醋麻油调匀","抄手煮熟捞入碗中","拌匀即食"],
["小吃","川菜经典","面食"]);

R("ma-la-tang","麻辣烫","Sichuan Spicy Soup","sichuan","boil",["spicy","numbing","umami"],"easy","basic",15,10,2,
[I("vermicelli",100,"g"),I("tofu",100,"g"),I("mushroom",80,"g"),I("bok_choy",100,"g"),I("bean_sprouts",80,"g"),I("doubanjiang",2,"tbsp"),I("sichuan_pepper",1,"tbsp"),I("chili_flakes",1,"tbsp"),I("garlic",4,"piece"),I("sesame_oil",1,"tbsp")],
["锅中油热炒豆瓣酱花椒辣椒面出红油","加水烧成麻辣汤底","先下豆腐蘑菇煮3分钟","再下粉丝豆芽小白菜","煮至全熟","淋麻油撒蒜末出锅"],
["小吃","麻辣系列","夜宵"]);

R("si-chuan-liang-fen","四川凉粉","Sichuan Cold Jelly Noodles","sichuan","cold_dress",["spicy","sour","numbing"],"easy","basic",15,5,2,
[I("starch",200,"g"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",4,"piece"),I("light_soy",2,"tbsp"),I("vinegar",2,"tbsp"),I("sugar",0.5,"tbsp"),I("sesame_oil",1,"tbsp"),I("spring_onion",2,"piece")],
["淀粉加水搅匀小火煮成糊倒模冷却","冷却后切粗条摆盘","调红油汁：辣椒面花椒蒜末生抽醋糖","泼热油制红油","浇在凉粉上","撒葱花拌匀食用"],
["凉菜","小吃","夏季菜"]);

R("qiang-guo-yu-kuai","呛锅鱼块","Wok-Seared Fish Blocks","sichuan","stir_fry",["spicy","numbing","umami"],"medium","intermediate",10,10,3,
[I("fish_fillet",400,"g"),I("doubanjiang",1.5,"tbsp"),I("chili_pepper",5,"piece"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",4,"piece"),I("ginger",3,"piece"),I("cooking_wine",1,"tbsp"),I("light_soy",1,"tbsp"),I("starch",1,"tbsp"),I("cooking_oil",3,"tbsp")],
["鱼块加料酒淀粉腌10分钟","锅中油热煎鱼块至两面金黄盛出","留油炒豆瓣酱花椒干辣椒出红油","加姜蒜末炒香","回锅鱼块加生抽少量水焖3分钟","大火收汁出锅"],
["川菜特色","海鲜","下饭菜"]);

R("suan-jiang-mian","蒜酱面","Garlic Sauce Noodles","sichuan","boil",["garlicky","spicy","umami"],"easy","basic",10,8,2,
[I("noodles_dried",200,"g"),I("garlic",8,"piece"),I("chili_flakes",1,"tbsp"),I("light_soy",2,"tbsp"),I("vinegar",1,"tbsp"),I("sugar",0.5,"tbsp"),I("sesame_oil",1,"tbsp"),I("spring_onion",2,"piece"),I("bok_choy",100,"g"),I("cooking_oil",1,"tbsp")],
["调蒜酱：蒜泥辣椒面生抽醋糖热油泼","面条和小白菜一起煮熟","面条捞入碗中","浇上蒜酱","加面汤少许","撒葱花拌匀食用"],
["面食","快手菜","小吃"]);

R("pao-jiao-fen-si","泡椒粉丝","Pickled Pepper Vermicelli","sichuan","stir_fry",["sour","spicy"],"easy","basic",10,8,2,
[I("vermicelli",150,"g"),I("chili_pepper",6,"piece"),I("pork_mince",60,"g"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("spring_onion",1,"piece"),I("cooking_oil",1,"tbsp")],
["粉丝泡软沥干泡椒切碎","锅中油热炒肉末散","加泡椒姜蒜末炒出酸辣香","下粉丝翻炒加生抽","炒至粉丝入味均匀","撒葱花出锅"],
["泡椒系列","快手菜","下饭菜"]);

R("ma-la-xiang-ji-chi","麻辣鸡翅","Mala Chicken Wings","sichuan","braise",["spicy","numbing"],"medium","intermediate",15,20,3,
[I("chicken_wing",500,"g"),I("sichuan_pepper",1.5,"tbsp"),I("chili_pepper",8,"piece"),I("doubanjiang",1,"tbsp"),I("garlic",4,"piece"),I("ginger",3,"piece"),I("dark_soy",1,"tbsp"),I("sugar",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("cooking_oil",2,"tbsp")],
["鸡翅划刀腌制10分钟","锅中油热煎鸡翅至金黄","加花椒干辣椒豆瓣酱炒出麻辣红油","加老抽糖料酒和少量水","中火烧15分钟至入味","大火收汁出锅"],
["麻辣系列","下酒菜","宴客菜"]);

R("chuan-bei-dong-cai-rou-si","川北冬菜肉丝","Sichuan Winter Vegetable Pork","sichuan","stir_fry",["salty","umami"],"easy","basic",10,8,2,
[I("pork_loin",200,"g"),I("chinese_cabbage",200,"g"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",0.5,"tbsp"),I("starch",0.5,"tbsp"),I("sugar",0.3,"tbsp"),I("spring_onion",1,"piece"),I("cooking_oil",2,"tbsp")],
["肉丝腌制白菜切丝","锅中油热爆炒肉丝至变色","加蒜姜炒香下白菜丝","加生抽糖翻炒","炒至白菜出水断生","撒葱花出锅"],
["快手菜","下饭菜","家常菜"]);

R("sichuan-spicy-tofu-skin","川味辣豆皮","Sichuan Spicy Tofu Skin","sichuan","cold_dress",["spicy","numbing","sour"],"easy","basic",10,5,2,
[I("dried_tofu_skin",200,"g"),I("chili_flakes",2,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",4,"piece"),I("light_soy",2,"tbsp"),I("vinegar",1,"tbsp"),I("sugar",0.5,"tbsp"),I("sesame_oil",1,"tbsp"),I("spring_onion",2,"piece"),I("cucumber",0.5,"piece")],
["豆皮煮软切宽条沥干","黄瓜切丝垫盘底铺豆皮","调麻辣汁：辣椒面花椒粉蒜末生抽醋糖","热油泼辣椒面","浇在豆皮上","撒葱花拌匀"],
["凉菜","素菜","下酒菜"]);

R("chuan-xiang-ji-tui-fan","川香鸡腿饭","Sichuan Chicken Leg Rice","sichuan","braise",["spicy","salty","umami"],"medium","basic",10,25,2,
[I("chicken_thigh",2,"piece"),I("doubanjiang",1,"tbsp"),I("chili_pepper",3,"piece"),I("garlic",3,"piece"),I("ginger",3,"piece"),I("dark_soy",1,"tbsp"),I("light_soy",1,"tbsp"),I("sugar",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("rice",200,"g")],
["鸡腿划刀煎至两面金黄","加豆瓣酱干辣椒姜蒜炒出红油","加老抽生抽糖料酒和水","中火烧20分钟至鸡腿入味","大火收汁至浓稠","米饭装盘鸡腿盖上浇汁"],
["主食","便当菜","下饭菜"]);

R("suan-cai-chao-fen-si","酸菜炒粉丝","Pickled Cabbage Fried Vermicelli","sichuan","stir_fry",["sour","salty"],"easy","basic",10,8,2,
[I("vermicelli",150,"g"),I("chinese_cabbage",200,"g"),I("pork_mince",60,"g"),I("chili_pepper",2,"piece"),I("garlic",3,"piece"),I("light_soy",1,"tbsp"),I("salt",0.3,"tbsp"),I("spring_onion",1,"piece"),I("cooking_oil",1,"tbsp")],
["粉丝泡软酸菜切丝","锅中油热炒肉末散","加酸菜丝辣椒蒜末炒出酸香","下粉丝翻炒加生抽","炒至粉丝吸味","撒葱花出锅"],
["酸菜系列","快手菜","主食"]);

R("jiao-ma-ji-kuai","椒麻鸡块","Pepper and Numbing Chicken","sichuan","cold_dress",["numbing","salty","umami"],"medium","intermediate",15,20,3,
[I("chicken_thigh",400,"g"),I("sichuan_pepper",2,"tbsp"),I("spring_onion",4,"piece"),I("garlic",4,"piece"),I("ginger",3,"piece"),I("light_soy",2,"tbsp"),I("vinegar",0.5,"tbsp"),I("sugar",0.5,"tbsp"),I("sesame_oil",1,"tbsp"),I("salt",0.5,"tbsp")],
["鸡腿冷水煮熟捞出冰水浸凉切块","花椒用油小火炸出花椒油过滤","葱花蒜末加花椒油生抽醋糖盐调汁","鸡块摆盘","淋上椒麻汁","拌匀食用"],
["凉菜","川菜经典","下酒菜"]);

R("la-zi-hua-sheng","辣子花生","Chili Peanuts Sichuan Style","sichuan","deep_fry",["spicy","salty","numbing"],"easy","basic",5,8,2,
[I("edamame",300,"g"),I("chili_pepper",10,"piece"),I("sichuan_pepper",1,"tbsp"),I("garlic",3,"piece"),I("salt",1,"tbsp"),I("sugar",0.5,"tbsp"),I("cooking_oil",3,"tbsp")],
["毛豆（替代花生）沥干","锅中油热中火炸毛豆至酥","捞出控油","锅留底油小火炒干辣椒花椒至变色","回锅毛豆加盐糖翻炒","翻匀出锅放凉更脆"],
["零食","下酒菜","小吃"]);

R("si-chuan-dong-gua-tang","四川冬瓜肉丸汤","Sichuan Winter Melon Meatball Soup","sichuan","boil",["umami","spicy","light"],"easy","basic",15,15,3,
[I("winter_melon",300,"g"),I("pork_mince",200,"g"),I("ginger",3,"piece"),I("spring_onion",2,"piece"),I("white_pepper",0.5,"tbsp"),I("light_soy",1,"tbsp"),I("starch",1,"tbsp"),I("salt",0.5,"tbsp"),I("chili_flakes",0.5,"tbsp"),I("sesame_oil",0.5,"tbsp")],
["肉馅加姜末葱花淀粉盐搅拌上劲","冬瓜去皮切薄片","锅中水烧开下冬瓜片煮3分钟","挤成肉丸逐个下入锅中","煮至肉丸浮起冬瓜透明","加白胡椒辣椒面麻油调味出锅"],
["汤菜","清淡菜","家常菜"]);

R("jiao-yan-pai-gu","椒盐排骨","Salt and Pepper Ribs Sichuan","sichuan","deep_fry",["salty","numbing","spicy"],"medium","intermediate",15,15,3,
[I("pork_ribs",500,"g"),I("sichuan_pepper",1,"tbsp"),I("salt",1,"tbsp"),I("chili_flakes",0.5,"tbsp"),I("five_spice",0.5,"tbsp"),I("garlic",3,"piece"),I("ginger",3,"piece"),I("starch",2,"tbsp"),I("cooking_wine",1,"tbsp"),I("cooking_oil",4,"tbsp")],
["排骨剁段加料酒姜腌15分钟裹淀粉","锅中宽油炸排骨至金黄酥脆","复炸一次捞出控油","锅留底油小火炒花椒面辣椒面蒜末","回锅排骨加椒盐五香粉","大火翻炒裹匀出锅"],
["下酒菜","硬菜","宴客菜"]);

R("chuan-xiang-zhu-gan","川香猪肝","Sichuan Pork Liver Style","sichuan","stir_fry",["spicy","salty","umami"],"medium","intermediate",10,5,2,
[I("pork_loin",300,"g"),I("chili_pepper",6,"piece"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",4,"piece"),I("ginger",3,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("vinegar",0.5,"tbsp"),I("starch",1,"tbsp"),I("cooking_oil",3,"tbsp")],
["里脊切极薄片（替代猪肝）加料酒淀粉腌","锅中油热至冒烟大火爆炒肉片","加花椒干辣椒姜蒜爆香","加生抽醋翻炒","炒至肉片刚熟不老","立即出锅"],
["川菜特色","下饭菜","快手菜"]);

R("ma-la-ou-pian","麻辣藕片","Mala Lotus Root Slices","sichuan","cold_dress",["spicy","numbing","sour"],"easy","basic",10,5,2,
[I("lotus_root",300,"g"),I("chili_flakes",1.5,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",3,"piece"),I("light_soy",1,"tbsp"),I("vinegar",1,"tbsp"),I("sugar",0.5,"tbsp"),I("sesame_oil",1,"tbsp"),I("spring_onion",1,"piece"),I("cooking_oil",1,"tbsp")],
["藕切薄片焯水2分钟捞出过凉水沥干","调麻辣汁：辣椒面花椒粉蒜末生抽醋糖","热油泼辣椒面出红油","藕片摆盘浇上麻辣汁","撒葱花","拌匀食用"],
["凉菜","素菜","下酒菜"]);

R("chuan-wei-zheng-ji","川味粉蒸鸡","Sichuan Steamed Chicken with Rice Powder","sichuan","steam",["spicy","umami"],"medium","intermediate",20,30,3,
[I("chicken_thigh",400,"g"),I("rice",80,"g"),I("doubanjiang",1,"tbsp"),I("chili_flakes",1,"tbsp"),I("sichuan_pepper",0.5,"tbsp"),I("garlic",3,"piece"),I("ginger",3,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("sweet_potato",200,"g")],
["大米小火炒至金黄擀碎成粗粉","鸡块加豆瓣酱辣椒面花椒粉生抽料酒腌15分钟","拌入米粉裹匀","红薯切块垫碗底铺上鸡块","大火蒸30分钟至鸡肉软烂","翻扣盘中上桌"],
["蒸菜","川菜特色","下饭菜"]);

R("leng-chi-tu-er","冷吃兔风味鸡","Cold Rabbit-Style Chicken","sichuan","deep_fry",["spicy","numbing","salty"],"medium","intermediate",15,15,3,
[I("chicken_thigh",400,"g"),I("chili_pepper",12,"piece"),I("sichuan_pepper",2,"tbsp"),I("garlic",5,"piece"),I("ginger",3,"piece"),I("light_soy",1,"tbsp"),I("cooking_wine",1,"tbsp"),I("sugar",0.5,"tbsp"),I("five_spice",0.5,"tbsp"),I("cooking_oil",4,"tbsp")],
["鸡腿肉切小丁加料酒五香粉腌15分钟","锅中宽油炸鸡丁至酥脆捞出","锅留油小火炒满干辣椒和花椒","至辣椒变色出香加蒜末","回锅鸡丁加生抽糖大火翻炒","炒至干香酥脆出锅放凉"],
["零食","下酒菜","川菜特色"]);

R("pao-jiao-bai-cai","泡椒白菜","Pickled Pepper Cabbage","sichuan","stir_fry",["sour","spicy"],"easy","beginner",5,5,2,
[I("chinese_cabbage",400,"g"),I("chili_pepper",5,"piece"),I("garlic",3,"piece"),I("vinegar",1,"tbsp"),I("light_soy",0.5,"tbsp"),I("sugar",0.5,"tbsp"),I("starch",0.5,"tbsp"),I("cooking_oil",1,"tbsp")],
["白菜切块泡椒切碎","锅中油热下泡椒蒜末爆香","大火下白菜翻炒","加醋生抽糖翻炒至断生","淋薄芡翻匀","出锅"],
["泡椒系列","快手菜","素菜"]);

R("xiang-la-gan-guo-niu-wa","香辣干锅牛蛙风味鸡","Spicy Dry Pot Bullfrog-Style Chicken","sichuan","dry_pot",["spicy","numbing","umami"],"hard","advanced",20,15,3,
[I("chicken_thigh",500,"g"),I("onion",1,"piece"),I("celery",80,"g"),I("chili_pepper",10,"piece"),I("sichuan_pepper",1.5,"tbsp"),I("doubanjiang",2,"tbsp"),I("garlic",6,"piece"),I("ginger",4,"piece"),I("cooking_wine",1,"tbsp"),I("cooking_oil",4,"tbsp")],
["鸡肉剁块加料酒腌制炸至金黄","洋葱切块芹菜切段","锅中油热炒豆瓣酱花椒干辣椒出红油","加姜蒜末炒香下洋葱块","回锅鸡块大火翻炒裹酱","加芹菜翻匀转干锅上桌"],
["干锅系列","硬菜","宴客菜"]);

R("chuan-bei-liang-mian","川北凉面","Northern Sichuan Cold Noodles","sichuan","cold_dress",["spicy","sweet","sour"],"easy","basic",10,8,2,
[I("noodles_dried",200,"g"),I("chili_flakes",1.5,"tbsp"),I("garlic",3,"piece"),I("light_soy",2,"tbsp"),I("vinegar",1,"tbsp"),I("sugar",1,"tbsp"),I("sesame_oil",1,"tbsp"),I("bean_sprouts",80,"g"),I("spring_onion",1,"piece"),I("cooking_oil",1,"tbsp")],
["面条煮熟过凉水拌麻油摊开晾凉","豆芽焯水沥干","调甜辣汁：辣椒面蒜末生抽醋糖热油泼","面条装盘铺豆芽","浇上甜辣汁","撒葱花拌匀"],
["面食","凉菜","夏季菜"]);

R("sichuan-yu-xiang-qie-he","四川鱼香茄盒","Sichuan Fish-Fragrant Eggplant Sandwich","sichuan","deep_fry",["sweet","sour","spicy"],"medium","intermediate",20,12,3,
[I("eggplant",300,"g"),I("pork_mince",150,"g"),I("doubanjiang",1,"tbsp"),I("sugar",1,"tbsp"),I("vinegar",1,"tbsp"),I("garlic",3,"piece"),I("ginger",2,"piece"),I("egg",1,"piece"),I("flour",30,"g"),I("starch",1,"tbsp")],
["茄子切厚夹刀片肉馅夹入中间","调面糊裹住茄盒","锅中宽油炸至金黄捞出","另起锅炒豆瓣酱姜蒜出红油","调鱼香汁浇在茄盒上","即可上桌"],
["鱼香系列","宴客菜","下饭菜"]);

R("hui-guo-xiang-gan","回锅香干","Twice-Cooked Dried Tofu","sichuan","stir_fry",["spicy","salty"],"easy","basic",10,8,2,
[I("dried_tofu",300,"g"),I("capsicum",2,"piece"),I("doubanjiang",1,"tbsp"),I("bean_paste",0.5,"tbsp"),I("garlic",2,"piece"),I("leek",60,"g"),I("sugar",0.3,"tbsp"),I("cooking_oil",2,"tbsp")],
["香干切厚片青椒切块蒜苗切段","锅中油热煎香干至两面微黄","加豆瓣酱甜面酱炒出红油","下蒜末青椒翻炒","加蒜苗段大火翻炒","翻匀出锅"],
["回锅系列","素菜","下饭菜"]);

R("suan-cai-ji-kuai","酸菜鸡块","Pickled Cabbage Chicken","sichuan","braise",["sour","umami","spicy"],"medium","basic",15,15,3,
[I("chicken_thigh",400,"g"),I("chinese_cabbage",200,"g"),I("chili_pepper",3,"piece"),I("ginger",3,"piece"),I("garlic",3,"piece"),I("cooking_wine",1,"tbsp"),I("light_soy",1,"tbsp"),I("salt",0.3,"tbsp"),I("spring_onion",1,"piece"),I("cooking_oil",2,"tbsp")],
["鸡块加料酒姜腌10分钟","锅中油热煎鸡块至金黄","加酸菜丝辣椒姜蒜翻炒出酸香","加水没过鸡块中火烧10分钟","加生抽盐调味大火收汁","撒葱花出锅"],
["酸菜系列","下饭菜","家常菜"]);

// Save part 1 count
fs.writeFileSync('D:/working/next/dailybuy/scripts/_mega2_recipes_p1.json', JSON.stringify(recipes));
console.log('Part 1 Sichuan:', recipes.length, 'recipes');
