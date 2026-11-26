/**
 * 全站地理知识、3D 实验、真实数据、创新探究、教材章节、繁星课题、开放资源与社区讨论统一检索索引
 * 支持维基百科式精确词条/标题直达（Exact Title Match）、中文关键词/标签匹配、大小写与多余空格归一化、自然问句意图识别与分类筛选。
 */
import { INITIAL_FANXING_PROJECTS, CURATED_GEO_PAPERS } from '../fanxing/catalog.js'
import { mockResources } from '../community/mockData.js'

// 全部 29 个地理实验与动手模型索引
export const EXPERIMENT_INDEX = [
  {
    id: 'exp-thermal',
    type: '实验',
    typeKey: 'experiment',
    badge: '大气与气候',
    title: '热力环流与风向动力学模拟（海陆风 / 山谷风 / 城市热岛）',
    desc: '冷热下垫面受热不均、垂直对流、等压面高凸低凹与近地面气压梯度力演变',
    keywords: '海风为什么吹向陆地 陆风为什么吹向海洋 白天海边吹什么风 夜晚山谷吹什么风 山风 谷风 城市热岛效应 郊区风 大气受热过程 气压高低 热力环流 海陆风 山谷风',
    tags: ['热力环流', '海陆风', '山谷风', '城市热岛', '大气运动'],
    route: '/experiments/meteorology/thermal-circulation'
  },
  {
    id: 'exp-coriolis',
    type: '实验',
    typeKey: 'experiment',
    badge: '大气与气候',
    title: '地转偏向力（科里奥利力）与风向偏转模拟',
    desc: '南北半球水平运动物体偏转规律、三圈环流风带与气旋反气旋旋转方向',
    keywords: '为什么北半球向右偏 南半球向左偏 台风旋转方向 科氏力 地球自转偏向 气旋逆时针 顺时针 地转偏向力 科里奥利力',
    tags: ['地转偏向力', '科里奥利力', '地球自转', '气旋偏转'],
    route: '/experiments/meteorology/coriolis'
  },
  {
    id: 'exp-climate-chart',
    type: '实验',
    typeKey: 'experiment',
    badge: '大气与气候',
    title: '气温曲线与降水量柱状图交互判读（以温定带、以水定型）',
    desc: '热带雨林、季风、地中海、温带海洋性与大陆性气候成因与分布对比',
    keywords: '气候类型怎么判断 夏雨型 冬雨型 地中海气候为什么夏天干燥 温带季风 亚热带季风 气温降水量图',
    tags: ['气候类型判读', '地中海气候', '季风气候', '以温定带'],
    route: '/experiments/meteorology/climate-chart'
  },
  {
    id: 'exp-atmosphere-system',
    type: '实验',
    typeKey: 'experiment',
    badge: '大气与气候',
    title: '大气垂直分层、三圈环流、季风与锋面气旋三维沙盒',
    desc: '对流层平流层结构、行星风带、东亚南亚季风、冷锋暖锋与厄尔尼诺海气耦合',
    keywords: '对流层为什么越往越冷 平流层臭氧 气压带风带季节移动 冷锋过境天气 暖锋 准静止锋 梅雨 厄尔尼诺 拉尼娜 沃克环流 三圈环流 季风环流 副热带高压',
    tags: ['三圈环流', '季风环流', '锋面气旋', '厄尔尼诺', '大气分层'],
    route: '/experiments/systems/atmosphere-system'
  },
  {
    id: 'exp-stream',
    type: '实验',
    typeKey: 'experiment',
    badge: '流水地貌',
    title: '流水地貌冲刷与微缩水槽实验',
    desc: '河流溯源侵蚀、下蚀侧蚀、冲积扇多期叠置、V形谷与河曲牛轭湖发育',
    keywords: '凹岸侵蚀凸岸堆积 河流为什么会弯曲 牛轭湖是怎么形成的 山前冲积扇 洪积扇 河口三角洲 峡谷 流水地貌 水槽实验',
    tags: ['流水地貌', '冲积扇', '牛轭湖', '河流侵蚀', '实验探究'],
    route: '/experiments/hydrology/stream-table'
  },
  {
    id: 'exp-groundwater',
    type: '实验',
    typeKey: 'experiment',
    badge: '水循环与水文',
    title: '地下水运移、含水层与承压水井水位模拟',
    desc: '潜水与承压水补给排泄、达西定律渗透流速、过度开采漏斗与地下水位变化',
    keywords: '自流井为什么能喷水 地下水漏斗 地面沉降 隔水层 潜水面 承压水',
    tags: ['地下水', '承压水', '达西定律', '水文过程'],
    route: '/experiments/hydrology/groundwater'
  },
  {
    id: 'exp-sediment',
    type: '实验',
    typeKey: 'experiment',
    badge: '流水地貌',
    title: '河流泥沙搬运、分选与流速沉积实验',
    desc: '不同粒径砾石砂粒粉砂粘土的起动流速、搬运方式与河口三角洲机械分选',
    keywords: '为什么上游是鹅卵石下游是细沙 沉积物分选性 流速与粒径 搬运能力 泥沙分选',
    tags: ['泥沙分选', '沉积作用', '河流搬运', '流水地貌'],
    route: '/experiments/hydrology/sediment-transport'
  },
  {
    id: 'exp-water-cycle-3d',
    type: '实验',
    typeKey: 'experiment',
    badge: '水循环与水文',
    title: '三维水循环与流域水文过程模拟',
    desc: '海陆间大循环、蒸发水汽输送降水、地表径流下渗与地下径流动态平衡',
    keywords: '水循环有哪些环节 人类活动影响哪个水循环环节 地表径流 下渗 蒸发 蒸腾 海陆间循环 陆地内循环 水循环',
    tags: ['水循环', '地表径流', '下渗', '海陆间循环'],
    route: '/experiments/systems/water-cycle-3d'
  },
  {
    id: 'exp-fault',
    type: '实验',
    typeKey: 'experiment',
    badge: '地质构造',
    title: '地壳断层与褶皱地质构造受力模型',
    desc: '背斜向斜、正断层、逆断层、走滑断层受力机制与华山庐山块状山、渭河地堑',
    keywords: '背斜为什么变成山谷 向斜为什么成山 地形倒置 断块山 地垒 地堑 找油找水 隧道选址 褶皱山 断层 褶皱',
    tags: ['断层构造', '褶皱背斜向斜', '地形倒置', '地垒地堑'],
    route: '/experiments/geology/fault-model'
  },
  {
    id: 'exp-stratigraphy',
    type: '实验',
    typeKey: 'experiment',
    badge: '地质构造',
    title: '沉积地层叠置、岩层新老关系与不整合接触模拟',
    desc: '地层层序律、化石定年、岩浆侵入穿切关系与地质剖面演化历史反演',
    keywords: '怎么判断岩层新老顺序 岩浆侵入在前还是断层在前 角度不整合 平行不整合 地层层序',
    tags: ['沉积地层', '岩层新老', '不整合接触', '地质剖面'],
    route: '/experiments/geology/stratigraphy'
  },
  {
    id: 'exp-soil-erosion',
    type: '实验',
    typeKey: 'experiment',
    badge: '地质与水土',
    title: '坡面水土流失、植被覆盖与黄土高原护坡实验',
    desc: '对比坡度、降雨强度与植被覆盖度对土壤侵蚀量和泥沙流失的控制效果',
    keywords: '黄土高原千沟万壑 植树造林保持水土 梯田 坡度与水土流失 土壤侵蚀',
    tags: ['水土流失', '黄土高原', '植被护坡', '土壤侵蚀'],
    route: '/experiments/geology/soil-erosion'
  },
  {
    id: 'exp-soil-profile',
    type: '实验',
    typeKey: 'experiment',
    badge: '土壤与生物',
    title: '三维土壤剖面分层与成土过程探索（森林土 / 黑土 / 红壤）',
    desc: '有机质层、腐殖质层、淋溶层、淀积层、母质层与母岩结构观察',
    keywords: '东北黑土为什么肥沃 南方红壤为什么偏酸瘦 土壤剖面有哪几层 成土因素 淋溶层 淀积层',
    tags: ['土壤剖面', '黑土与红壤', '成土过程', '淋溶淀积'],
    route: '/experiments/systems/soil-profile-3d'
  },
  {
    id: 'exp-landform-sandbox',
    type: '实验',
    typeKey: 'experiment',
    badge: '地表形态',
    title: '典型地貌三维沙盘（喀斯特 / 河流 / 风沙 / 海岸 / 冰川地貌）',
    desc: '峰林溶洞、新月形沙丘、海蚀崖海蚀柱、冰斗角峰U形谷与内力外力演变',
    keywords: '溶洞钟乳石石笋怎么形成的 天坑 峰丛 孤峰 雅丹地貌 沙丘迎风坡缓背风坡陡 峡湾 冰碛丘陵 喀斯特 喀斯特地貌',
    tags: ['喀斯特地貌', '风沙沙丘', '冰川峡湾', '海岸地貌'],
    route: '/experiments/systems/landform-sandbox'
  },
  {
    id: 'exp-moon',
    type: '实验',
    typeKey: 'experiment',
    badge: '天体运动',
    title: '月相变化与日地月空间几何关系',
    desc: '朔望月、新月上弦月满月下弦月、月球公转相位与地面中天观测视角',
    keywords: '为什么月亮有圆缺变化 上上上西西 下下下东东 农历初七初八 十五满月 潮汐 月相',
    tags: ['月相变化', '朔望月', '上弦月下弦月', '潮汐引力'],
    route: '/experiments/astronomy/moon-phases'
  },
  {
    id: 'exp-solar',
    type: '实验',
    typeKey: 'experiment',
    badge: '地球运动',
    title: '正午太阳高度角与昼夜长短模拟器',
    desc: '输入纬度与节气日期，动态推求太阳直射点、晨昏线、太阳视运动轨迹与昼长',
    keywords: '为什么夏天白天长冬天白天短 夏至正午影子最短 冬至影子最长 太阳从哪个方向升起 极昼极夜 楼间距采光 正午太阳高度 太阳视运动 建筑采光',
    tags: ['正午太阳高度', '太阳视运动', '昼夜长短', '建筑采光'],
    route: '/experiments/astronomy/solar-motion'
  },
  {
    id: 'exp-seasons',
    type: '实验',
    typeKey: 'experiment',
    badge: '地球运动',
    title: '黄赤交角、地球公转与四季五带变化模拟',
    desc: '二分二至日地球公转轨道位置、太阳直射点南北移动与全球热量带划分',
    keywords: '如果黄赤交角变大热带寒带怎么变 春分秋分夏至冬至 地球公转产生四季 回归线 极圈 黄赤交角',
    tags: ['黄赤交角', '地球公转', '四季五带', '二分二至'],
    route: '/experiments/astronomy/seasons'
  },
  {
    id: 'exp-eclipse',
    type: '实验',
    typeKey: 'experiment',
    badge: '天体运动',
    title: '日食与月食（本影 / 半影 / 伪本影）三维光学模拟',
    desc: '日全食、日环食、日偏食与月全食红月亮成因及黄白交角条件',
    keywords: '为什么不是每个月都有日食月食 日全食日环食区别 红月亮怎么来的 日食 月食',
    tags: ['日食与月食', '红月亮', '本影半影', '天体掩食'],
    route: '/experiments/astronomy/eclipse'
  },
  {
    id: 'exp-kepler',
    type: '实验',
    typeKey: 'experiment',
    badge: '天体运动',
    title: '开普勒行星运动三定律与椭圆轨道面积速度模拟',
    desc: '近日点与远日点公转速度变化、轨道偏心率与周期半长轴关系验证',
    keywords: '为什么地球1月初近日点公转最快 7月初远日点最慢 行星轨道定律 开普勒定律',
    tags: ['开普勒定律', '近日点远日点', '公转速度', '行星轨道'],
    route: '/experiments/astronomy/kepler-laws'
  },
  {
    id: 'exp-celestial',
    type: '实验',
    typeKey: 'experiment',
    badge: '天体运动',
    title: '天球坐标系、北极星仰角与周日视运动三维模型',
    desc: '地平圈、子午圈、天赤道、黄道面与不同纬度星空周日旋转规律',
    keywords: '为什么北极星仰角等于当地地理纬度 恒星周日视运动 赤经赤纬 天球坐标',
    tags: ['天球坐标系', '北极星仰角', '周日视运动'],
    route: '/earth3d?mode=professional'
  },
  {
    id: 'exp-earth',
    type: '实验',
    typeKey: 'experiment',
    badge: '地球圈层',
    title: '地球三维圈层与深部构造沙盒',
    desc: '地壳、地幔、地核、莫霍面、古登堡面、软流层与地震波传播速度',
    keywords: '横波纵波怎么区分地球内部圈层 岩石圈包括哪些 软流层岩浆发源地 莫霍面 古登堡面',
    tags: ['地球内部圈层', '莫霍面与古登堡面', '地震波', '软流层'],
    route: '/earth3d'
  },
  {
    id: 'exp-disasters',
    type: '实验',
    typeKey: 'experiment',
    badge: '防灾减灾',
    title: '自然灾害过程模拟（泥石流 / 滑坡 / 洪涝 / 震源地震波）',
    desc: '地形坡度、暴雨激发与防灾工程措施对地质气象灾害发生风险的影响',
    keywords: '泥石流发生条件 遇到泥石流往哪跑 滑坡 堰塞湖 震级与烈度区别 地震 自然灾害',
    tags: ['自然灾害', '泥石流滑坡', '地震波', '防灾减灾'],
    route: '/disasters'
  },
  {
    id: 'exp-map-projection',
    type: '实验',
    typeKey: 'experiment',
    badge: '地图与空间',
    title: '地图投影变形分析（墨卡托圆柱投影 / 圆锥投影 / 方位投影）',
    desc: '地球曲面展平的面积、角度、距离变形椭圆（底索指示线）对比',
    keywords: '为什么世界地图上格陵兰岛看起来比澳大利亚还大 墨卡托投影等角变形 高纬度面积放大 地图投影',
    tags: ['地图投影', '墨卡托投影', '底索变形椭圆'],
    route: '/map'
  },
  {
    id: 'exp-geologic-time',
    type: '实验',
    typeKey: 'experiment',
    badge: '地球历史',
    title: '地质年代表与地球生命海陆演化交互标尺',
    desc: '冥古宙、太古宙、元古宙、显生宙（古生代、中生代、新生代）生物与造山演化',
    keywords: '恐龙在哪个地质年代灭绝 三叶虫 寒武纪生命大爆发 成煤期 联合古陆 地质年代',
    tags: ['地质年代表', '寒武纪', '中生代恐龙', '海陆演化'],
    route: '/geo'
  },
  {
    id: 'exp-human-env',
    type: '实验',
    typeKey: 'experiment',
    badge: '人文地理',
    title: '人地关系、产业区位与城镇化空间模拟',
    desc: '农业区位、工业布局、生态保护红线与区域可持续发展权衡',
    keywords: '工厂建在什么风向和河流上下游 城市功能分区 商业区住宅区工业区 产业区位 城镇化',
    tags: ['人文地理', '产业区位', '城市功能分区', '人地协调'],
    route: '/experiments/systems/human-environment'
  },
  {
    id: 'exp-spatial-network',
    type: '实验',
    typeKey: 'experiment',
    badge: '人文地理',
    title: '交通网络、中心地理论与城市群空间流模拟',
    desc: '交通可达性、门槛人口、服务范围六边形网络与区域经济要素流动',
    keywords: '城市等级越高数量越少服务范围越大 交通运输布局影响 中心地理论',
    tags: ['中心地理论', '交通网络', '城市群空间流'],
    route: '/experiments/systems/spatial-network'
  },
  {
    id: 'exp-cloud-bottle',
    type: '实验',
    typeKey: 'experiment',
    badge: '动手实验教程',
    title: '瓶中造云：绝热膨胀降温与凝结核成云动手实验',
    desc: '用塑料瓶、温水与烟雾演示气压下降绝热冷却达到露点凝结成云',
    keywords: '云是怎么形成的 为什么空气上升会降温成云致雨 凝结核 绝热冷却',
    tags: ['绝热降温', '凝结核成云', '动手地理实验'],
    route: '/experiments/meteorology/cloud-bottle'
  },
  {
    id: 'exp-infiltration',
    type: '实验',
    typeKey: 'experiment',
    badge: '动手实验教程',
    title: '不同地表材质与土壤下渗速率对比动手实验',
    desc: '对比沙土、壤土、粘土及硬化路面的雨水下渗快慢与地表产流',
    keywords: '哪种路面积水更严重 水泥地和草地哪个下渗快 透水砖 城市内涝动手实验 土壤下渗',
    tags: ['土壤下渗', '透水铺装', '城市内涝', '动手实验'],
    route: '/experiments/hydrology/infiltration'
  },
  {
    id: 'exp-mineral-id',
    type: '实验',
    typeKey: 'experiment',
    badge: '动手实验教程',
    title: '常见矿物与三大类岩石肉眼鉴定实验（莫氏硬度 / 条痕 / 解理）',
    desc: '石英、长石、云母、方解石鉴定及花岗岩、玄武岩、石灰岩、片麻岩识别',
    keywords: '怎么鉴别石头矿物 岩浆岩沉积岩变质岩 气孔构造 层理构造 化石 矿物鉴定',
    tags: ['矿物岩石鉴定', '三大类岩石', '莫氏硬度'],
    route: '/experiments/geology/mineral-id'
  }
]

// 核心地学探究、真实数据实验室、日历与开放资源索引
export const LAB_INDEX = [
  {
    id: 'lab-urban-flood',
    type: '探究',
    typeKey: 'inquiry',
    badge: '海绵城市课题',
    title: '城市为什么会“看海”？——同一场雨哪种路面积水更严重（内涝水动力与海绵城市对照探究）',
    desc: '固定 50 mm/h 暴雨与 60 分钟历时，并排对比水泥/沥青路面（44.4 m³/s）、天然林地（11.7 m³/s）与海绵透水铺装的径流削峰效果，生成可复现科学证据卡',
    keywords: '同一场雨哪种路面积水更严重 城市内涝 海绵城市 水泥地积水 下渗 径流峰值 暴雨淹水 透水铺装',
    tags: ['城市内涝', '海绵城市', '透水铺装', '暴雨产流对照'],
    route: '/inquiry?task=urban-flood&mode=compare&rain=50&duration=60&slope=2&surfaceA=concrete&surfaceB=vegetation'
  },
  {
    id: 'lab-terrain',
    type: '探究',
    typeKey: 'inquiry',
    badge: '真实高程 DEM',
    title: '珠峰与喜马拉雅真实 DEM 数字高程模型与地形剖面探究',
    desc: 'Copernicus 真实网格地形渲染，高程剖面提取、起伏度与坡度分析',
    keywords: '珠穆朗玛峰地形剖面 海拔高度 数字高程模型 等高线起伏 DEM高程 青藏高原 空间分析',
    tags: ['DEM高程', '珠峰地形剖面', '青藏高原', '空间分析'],
    route: '/geo-labs/terrain'
  },
  {
    id: 'lab-satellite',
    type: '探究',
    typeKey: 'inquiry',
    badge: '多时相遥感',
    title: '同一地点两天的地球：多时相卫星遥感影像卷帘对比（NASA GIBS / MODIS）',
    desc: '滑动或点按对比真实卫星影像波段，查看日期、地点、分辨率与数据缺口，观察湖泊水位涨落与积雪变化',
    keywords: '卫星图对比 遥感影像 洞庭湖 鄱阳湖 亚马孙 喜马拉雅积雪 云层遮挡 多时相遥感 卫星遥感',
    tags: ['多时相遥感', 'MODIS卫星影像', '鄱阳湖水位', '卫星遥感'],
    route: '/geo-labs/satellite'
  },
  {
    id: 'lab-remote-ai',
    type: '探究',
    typeKey: 'inquiry',
    badge: '遥感 AI 解译',
    title: 'Prithvi EO 2.0 多光谱遥感地物分类与模型边界辨析',
    desc: '对比原始卫星观测像元与 AI 模型推断结果，理解遥感解译的不确定性',
    keywords: '遥感地物识别 人工智能遥感 洪泛区识别 土地覆盖 卫星遥感',
    tags: ['遥感AI解译', '多光谱分类', '洪泛区识别'],
    route: '/geo-labs/ai'
  },
  {
    id: 'lab-landscape',
    type: '探究',
    typeKey: 'inquiry',
    badge: '真实数据课题',
    title: '同一地点为什么呈现不同景观？——鄱阳湖丰枯水期多源证据探究',
    desc: '结合遥感水位、气象降水与地形高程证据卡，区分观测事实与因果推论',
    keywords: '鄱阳湖洪水一片枯水一线 湖泊面积季节变化 季风降水与水位 长江中下游',
    tags: ['鄱阳湖湿地', '丰枯水期对比', '长江中下游', '多源证据'],
    route: '/inquiry?task=landscape-variation'
  },
  {
    id: 'lab-decision',
    type: '探究',
    typeKey: 'inquiry',
    badge: '区域决策课题',
    title: '重工业搬迁还是就地升级？——人地关系与生态红线多目标决策探究',
    desc: '综合权衡就业经济、大气水源污染控制与生态红线约束的区域发展方案',
    keywords: '工业区位选择 环境污染与产业转型 可持续发展决策 生态保护红线',
    tags: ['工业区位决策', '生态保护红线', '区域转型'],
    route: '/inquiry?task=human-environment-decision'
  },
  {
    id: 'lab-calendar',
    type: '探究',
    typeKey: 'inquiry',
    badge: '日历与地震实录',
    title: '地理事件日历：二十四节气、天象预测与 USGS 全球地震记录',
    desc: '按月查看流星雨、日月食、节气物候观察与美国地质调查局（USGS）实测地震',
    keywords: '最近地震 节气时间 流星雨 日历 地震监测 USGS',
    tags: ['地理事件日历', 'USGS地震监测', '二十四节气'],
    route: '/calendar'
  },
  {
    id: 'lab-resources',
    type: '资源',
    typeKey: 'resource',
    badge: '开放科学数据',
    title: '地理数据与开放资源馆（DEM 高程 / ERA5 气象再分析 / 遥感底图）',
    desc: '查找带明确开放许可的全球地形、气候再分析、土地覆盖与水系矢量数据集',
    keywords: '地理数据下载 NASA 数据 气象数据 地形数据 DEM ERA5 Landsat',
    tags: ['开放地理数据', 'DEM高程', 'ERA5再分析', 'Landsat遥感'],
    route: '/resources'
  },
  {
    id: 'lab-practice',
    type: '探究',
    typeKey: 'inquiry',
    badge: '互动练习',
    title: '地理互动练习：正午太阳高度计算、经纬网定位与国家地理知识卡',
    desc: '即时反馈的地球运动计算、空间坐标判读与世界区域特征练习',
    keywords: '地理做题 测试 经纬度练习 太阳高度计算题',
    tags: ['太阳高度计算', '经纬网定位', '互动测评'],
    route: '/practice'
  }
]

// 课程教材、重点小节、知识库与宇宙物理章节索引
export const CURRICULUM_INDEX = [
  {
    id: 'curr-sec-thermal',
    type: '教学',
    typeKey: 'curriculum',
    badge: '高中必修一 · 第二章第二节',
    title: '教材精读：《大气受热过程和大气运动》——热力环流、海陆风、山谷风与风的形成',
    desc: '解释太阳辐射—地面辐射—大气逆辐射受热过程，以及受热不均引起的热力环流（白天海风吹向陆地、夜晚陆风吹向海洋）与水平气压梯度力',
    keywords: '海风为什么吹向陆地 陆风 海陆风 山谷风 城市热岛 热力环流 等压面 大气受热过程 保温作用',
    tags: ['大气受热过程', '热力环流', '海陆风', '高中必修一'],
    route: '/高中/必修第一册/第二章/第二节'
  },
  {
    id: 'curr-sec-water-cycle',
    type: '教学',
    typeKey: 'curriculum',
    badge: '高中必修一 · 第三章第一节',
    title: '教材精读：《水循环》——蒸发、降水、下渗、地表径流与城市内涝防治（海绵城市）',
    desc: '剖析海陆间水循环环节，理解城市路面硬化如何减少下渗、增大地表径流峰值，以及海绵城市透水铺装的水文调节原理',
    keywords: '同一场雨哪种路面积水更严重 城市内涝 海绵城市 水循环 下渗 地表径流 地下径流',
    tags: ['水循环', '城市内涝', '海绵城市', '高中必修一'],
    route: '/高中/必修第一册/第三章/第一节'
  },
  {
    id: 'curr-sec-landform',
    type: '教学',
    typeKey: 'curriculum',
    badge: '高中必修一 · 第四章第一节',
    title: '教材精读：《常见地貌类型》——喀斯特地貌、河流地貌、风沙地貌与海岸地貌',
    desc: '溶洞钟乳石峰林成因、冲积扇与河曲牛轭湖、沙丘风向判读与海蚀海积地貌识别',
    keywords: '喀斯特 溶洞 钟乳石 冲积扇 牛轭湖 风沙地貌 海岸地貌 冰川地貌 流水地貌',
    tags: ['喀斯特地貌', '流水地貌', '风沙海岸地貌', '高中必修一'],
    route: '/高中/必修第一册/第四章/第一节'
  },
  {
    id: 'curr-sec-earth-motion',
    type: '教学',
    typeKey: 'curriculum',
    badge: '选择性必修1 · 第一章',
    title: '教材精读：《地球的运动》——自转地转偏向力、公转黄赤交角、正午太阳高度与昼夜长短',
    desc: '昼夜交替与时差、沿地表水平运动物体的偏转（北右南左）、太阳直射点回归运动与四季五带',
    keywords: '为什么北半球向右偏 为什么夏天白天长 正午太阳高度 昼夜长短 黄赤交角 晨昏线 地球运动',
    tags: ['地球运动', '正午太阳高度', '地转偏向力', '选择性必修1'],
    route: '/高中/选择性必修1/第一章/第二节'
  },
  {
    id: 'curr-sec-tectonics',
    type: '教学',
    typeKey: 'curriculum',
    badge: '选择性必修1 · 第二章第二节',
    title: '教材精读：《构造地貌的形成》——褶皱（背斜向斜）、断层与板块运动',
    desc: '解析背斜成谷向斜成山的地形倒置机制、断块山与地堑谷，以及板块生长边界与消亡边界地貌',
    keywords: '背斜为什么成谷 向斜为什么成山 断层 褶皱 板块构造 地震带 环太平洋地震带',
    tags: ['构造地貌', '褶皱与断层', '板块运动', '选择性必修1'],
    route: '/高中/选择性必修1/第二章/第二节'
  },
  {
    id: 'curr-bx1',
    type: '教学',
    typeKey: 'curriculum',
    badge: '高中必修第一册',
    title: '高中必修一《自然地理基础》：宇宙中的地球、大气、水循环、地貌、植被与土壤、自然灾害',
    desc: '人教版高中地理必修第一册全章节课文精读、知识导图与配套 3D 实验',
    keywords: '高一地理 必修一 自然地理',
    tags: ['高中必修一', '自然地理基础'],
    route: '/高中/必修第一册'
  },
  {
    id: 'curr-bx2',
    type: '教学',
    typeKey: 'curriculum',
    badge: '高中必修第二册',
    title: '高中必修二《人文地理》：人口分布迁移、乡村与城镇、产业区位、交通运输、环境与发展',
    desc: '胡焕庸线、城镇化进程、农业工业服务业区位因素与人地协调发展',
    keywords: '人文地理 人口迁移 城镇化 农业区位 工业区位 必修二',
    tags: ['高中必修二', '人文地理', '城镇化与区位'],
    route: '/高中/必修第二册'
  },
  {
    id: 'curr-xb1',
    type: '教学',
    typeKey: 'curriculum',
    badge: '选择性必修1',
    title: '高中选择性必修1《自然地理基础》：地球运动、地表形态塑造、大气运动、水体运动、整体性与差异性',
    desc: '晨昏线、内力外力构造地貌、三圈环流与锋面气旋、洋流与厄尔尼诺、地域分异规律',
    keywords: '选必一 洋流 锋面气旋 三圈环流 自然带 垂直地带性 季风 副热带高压',
    tags: ['选择性必修1', '三圈环流', '洋流与地域分异'],
    route: '/高中/选择性必修1'
  },
  {
    id: 'curr-xb2',
    type: '教学',
    typeKey: 'curriculum',
    badge: '选择性必修2',
    title: '高中选择性必修2《区域发展》：区域类型、生态脆弱区治理、资源枯竭型城市转型、产业转移与跨区域调配',
    desc: '黄土高原水土保持、鲁尔区转型、长三角大都市辐射、南水北调与西气东输',
    keywords: '选必二 荒漠化 水土流失 资源跨区域调配 产业转移 黄土高原 徐州 长三角',
    tags: ['选择性必修2', '区域发展', '生态脆弱区治理'],
    route: '/高中/选择性必修2'
  },
  {
    id: 'curr-xb3',
    type: '教学',
    typeKey: 'curriculum',
    badge: '选择性必修3',
    title: '高中选择性必修3《资源、环境与国家安全》：耕地粮食安全、能源矿产、海洋空间、碳减排与生态安全',
    desc: '自然环境服务功能、战略性矿产资源、国家安全红线与全球气候变化应对',
    keywords: '选必三 粮食安全 能源安全 碳达峰碳中和 生态保护红线',
    tags: ['选择性必修3', '资源环境安全', '碳中和'],
    route: '/高中/选择性必修3'
  },
  {
    id: 'curr-cz-7a',
    type: '教学',
    typeKey: 'curriculum',
    badge: '初中七年级上册',
    title: '初中地理七年级上册：地球和地图、陆地和海洋、天气与气候、居民与聚落',
    desc: '经纬网与等高线地形图、七大洲四大洋与板块运动、世界气候类型分布',
    keywords: '初一地理 等高线 经纬网 大洲大洋 七年级',
    tags: ['初中七年级', '等高线与经纬网', '世界气候'],
    route: '/初中/七年级上册'
  },
  {
    id: 'curr-cz-7b',
    type: '教学',
    typeKey: 'curriculum',
    badge: '初中七年级下册',
    title: '初中地理七年级下册：亚洲、日本、东南亚、印度、俄罗斯、中东、欧洲西部、撒哈拉以南非洲、澳大利亚、美国、巴西、极地',
    desc: '世界大洲与主要国家区域自然环境、资源分布与人文经济特征',
    keywords: '世界地理 国家地理 亚洲 欧洲 非洲 极地 日本 俄罗斯 东南亚',
    tags: ['初中七年级', '世界区域地理', '极地与大洲'],
    route: '/初中/七年级下册'
  },
  {
    id: 'curr-cz-8a',
    type: '教学',
    typeKey: 'curriculum',
    badge: '初中八年级上册',
    title: '初中地理八年级上册：中国疆域与人口民族、地形地势与气候河流、自然资源与经济发展',
    desc: '中国三级地势阶梯、季风气候、长江黄河流域治理、土地水资源与工农业交通',
    keywords: '初二地理 中国地理 长江 黄河 季风区 地势阶梯 八年级',
    tags: ['初中八年级', '中国地理', '长江黄河与季风'],
    route: '/初中/八年级上册'
  },
  {
    id: 'curr-cz-8b',
    type: '教学',
    typeKey: 'curriculum',
    badge: '初中八年级下册',
    title: '初中地理八年级下册：中国四大地理区域（北方、南方、西北、青藏地区）与秦岭—淮河线',
    desc: '东北三省、黄土高原、北京、长三角、港澳珠三角、塔里木盆地、三江源地区',
    keywords: '秦岭淮河 四大地理区域 青藏高原 西北干旱 黄土高原 长三角 华北平原',
    tags: ['初中八年级', '四大地理区域', '秦岭淮河與青藏高原'],
    route: '/初中/八年级下册'
  },
  {
    id: 'curr-uni',
    type: '教学',
    typeKey: 'curriculum',
    badge: '大学自然地理学',
    title: '大学《自然地理学》：地球、地壳、大气圈与气候、海洋与陆地水、地貌、土壤圈、生物群落与综合研究',
    desc: '高校自然地理核心章节体系与中学教材跨学段映射索引',
    keywords: '伍光和 自然地理学 大学地理 圈层相互作用',
    tags: ['大学自然地理学', '地球表层系统'],
    route: '/大学/自然地理学'
  },
  {
    id: 'curr-knowledge',
    type: '教学',
    typeKey: 'curriculum',
    badge: '知识库',
    title: '地理结构化知识库：核心概念定义、因果机制链与易错辨析',
    desc: '按章节快速检索初高中地理核心概念、原理机制与读图要点',
    keywords: '地理概念 易错点 知识点总结 核心素养 教学设计',
    tags: ['结构化知识库', '因果机制链', '易错辨析'],
    route: '/knowledge'
  },
  {
    id: 'curr-cosmos',
    type: '教学',
    typeKey: 'curriculum',
    badge: '宇宙与物理',
    title: '宇宙与物理知识中心（天体距离阶梯 / 哈勃红移与膨胀宇宙 / 相对论光锥 / 标准模型粒子图谱 / 弦理论 D1–D11）',
    desc: '从月亮视差、宇宙尺度因子 a(t) 与 FLRW 度规，到世界面、对偶网络与理论物理前沿',
    keywords: '狭义相对论 广义相对论 宇宙膨胀 红移 夸克 弦理论 黑洞',
    tags: ['宇宙与理论物理', '相对论与红移', '弦理论'],
    route: '/cosmos'
  },
  {
    id: 'curr-cosmology',
    type: '教学',
    typeKey: 'curriculum',
    badge: '宇宙学交互课',
    title: '宇宙学交互课：哈勃定律、光谱红移、尺度因子与热大爆炸演化时间轴',
    desc: '拖动尺度因子观察光波伸长，理解宇宙膨胀证据与模型边界',
    keywords: '哈勃常数 大爆炸宇宙学 微波背景辐射 CMB',
    tags: ['宇宙学交互课', '哈勃红移', 'CMB微波背景'],
    route: '/cosmology'
  }
]

// 繁星计划科研课题与精选 DOI 论文索引（真实可跳转至 /fanxing/:id）
export const FANXING_INDEX = [
  ...INITIAL_FANXING_PROJECTS.map(proj => ({
    id: `fanxing-${proj.id}`,
    type: '课题',
    typeKey: 'fanxing',
    badge: `繁星计划 · ${proj.field}`,
    title: `繁星课题：《${proj.title}》`,
    desc: `${proj.question}（招募：${proj.role} · 阶段：${proj.phase}）`,
    keywords: `${proj.title} ${proj.field} ${proj.question} ${proj.method} ${proj.task} 繁星计划 科研课题 ${(proj.papers || []).map(p => `${p.title} ${p.doi}`).join(' ')}`,
    tags: ['繁星课题', proj.field, proj.phase],
    route: `/fanxing/${proj.id}`
  })),
  ...CURATED_GEO_PAPERS.map(paper => ({
    id: `paper-${paper.doi}`,
    type: '课题',
    typeKey: 'fanxing',
    badge: `DOI 文献 · ${paper.journal} (${paper.year})`,
    title: `${paper.title} (${paper.topic})`,
    desc: `作者：${paper.authors} · DOI: ${paper.doi} · 关联课题方向：${paper.topic}`,
    keywords: `${paper.title} ${paper.authors} ${paper.journal} ${paper.doi} ${paper.topic} DOI文献 论文 文献研读`,
    tags: [paper.topic, 'DOI文献', paper.journal],
    route: paper.projectId ? `/fanxing/${paper.projectId}` : '/fanxing'
  }))
]

// 开放地理数据资源馆索引（真实对应 /resources 中的各条核实数据集）
export const RESOURCE_INDEX = mockResources.map(res => ({
  id: `res-${res.id}`,
  type: '资源',
  typeKey: 'resource',
  badge: `${res.category} · ${res.format}`,
  title: res.title,
  desc: `${res.description}（分辨率/尺度：${res.scale} · 许可：${res.license}）`,
  keywords: `${res.title} ${res.category} ${res.format} ${res.scale} ${res.description} ${res.license} 开放资源 数据集`,
  tags: [res.category, res.format, '开放科学数据'],
  route: '/resources'
}))

/**
 * 常见自然问法、现象描述与学科概念同义词映射规则
 */
const INTENT_SYNONYM_RULES = [
  {
    pattern: /(海风|陆风|海陆风|吹向陆地|吹向海洋|海边.*风|山风|谷风|山谷风|热岛|受热不均|等压面|热力环流)/i,
    terms: ['热力环流', '海陆风', '山谷风', '城市热岛', '大气受热过程'],
    boostIds: ['exp-thermal', 'curr-sec-thermal', 'exp-atmosphere-system', 'fanxing-city-heat']
  },
  {
    pattern: /(看海|积水|内涝|淹水|水泥|沥青|透水|海绵城市|下渗|径流|同一场雨|路面)/i,
    terms: ['城市内涝', '海绵城市', '下渗', '地表径流', '水循环'],
    boostIds: ['lab-urban-flood', 'exp-infiltration', 'exp-water-cycle-3d', 'curr-sec-water-cycle', 'fanxing-sponge-city-runoff']
  },
  {
    pattern: /(向右偏|向左偏|北右南左|偏转|科里奥利|科氏力|地转偏向|台风旋转|气旋旋转)/i,
    terms: ['地转偏向力', '科里奥利力', '偏转', '气旋'],
    boostIds: ['exp-coriolis', 'curr-sec-earth-motion', 'exp-atmosphere-system']
  },
  {
    pattern: /(溶洞|钟乳石|石笋|天坑|峰林|峰丛|喀斯特|石灰岩地貌|沙丘|雅丹|海蚀|冰斗|角峰|峡湾)/i,
    terms: ['喀斯特', '典型地貌', '溶洞', '风沙', '冰川'],
    boostIds: ['exp-landform-sandbox', 'curr-sec-landform']
  },
  {
    pattern: /(背斜|向斜|断层|褶皱|地垒|地堑|地形倒置|找油|隧道|华山|庐山|渭河)/i,
    terms: ['断层', '褶皱', '背斜', '向斜', '构造地貌'],
    boostIds: ['exp-fault', 'curr-sec-tectonics', 'exp-stratigraphy']
  },
  {
    pattern: /(影子|白天长|白天短|昼长|夜长|夏至|冬至|春分|秋分|太阳高度|太阳直射|极昼|极夜|黄赤交角)/i,
    terms: ['正午太阳高度', '昼夜长短', '黄赤交角', '四季'],
    boostIds: ['exp-solar', 'exp-seasons', 'curr-sec-earth-motion', 'lab-practice']
  },
  {
    pattern: /(牛轭湖|冲积扇|洪积扇|三角洲|河流弯曲|凹岸|凸岸|溯源侵蚀|V形谷)/i,
    terms: ['流水地貌', '冲积扇', '牛轭湖', '侵蚀'],
    boostIds: ['exp-stream', 'exp-sediment', 'curr-sec-landform']
  },
  {
    pattern: /(月相|月牙|满月|上弦月|下弦月|朔望月|日食|月食|红月亮)/i,
    terms: ['月相', '日食', '月食', '朔望月'],
    boostIds: ['exp-moon', 'exp-eclipse']
  },
  {
    pattern: /(卫星图|遥感|鄱阳湖|洞庭湖|咸海|丰水期|枯水期|两天的地球|徐州|土地覆盖|clcd|landsat)/i,
    terms: ['多时相遥感', '卫星', '鄱阳湖', 'MODIS', '土地覆盖'],
    boostIds: ['lab-satellite', 'lab-landscape', 'lab-remote-ai', 'fanxing-xuzhou-land-cover']
  }
]

const QUESTION_STOP_WORDS_RE = /(为什么|为何|怎么|如何|是什么|有哪些|有什么|什么时候|在哪里|哪种|哪个|会|能|的|了|吗|呢|吧|呀|啊|请问|一下)/g

/**
 * 归一化搜索词：处理大小写、全角半角符号、前导 # 标签符号与多余空格
 */
export function normalizeSearchQuery(raw) {
  if (!raw || typeof raw !== 'string') return ''
  return raw
    .trim()
    .replace(/^[#＃]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractQueryTerms(raw) {
  const normalized = normalizeSearchQuery(raw).toLowerCase()
  const cleaned = normalized
    .replace(/[？?！!，,。、；;：“”""''（）()【】\[\]—\-·#＃]/g, ' ')
    .replace(QUESTION_STOP_WORDS_RE, ' ')
    .trim()

  const spaceTokens = cleaned.split(/\s+/).filter(Boolean)
  return spaceTokens.length ? spaceTokens : [normalized]
}

/**
 * 判断条目是否构成“维基百科式精确标题/核心词条匹配”（Exact Title / Concept Entry Match）
 */
export function isExactTitleOrConceptMatch(item, rawQuery) {
  const q = normalizeSearchQuery(rawQuery).toLowerCase()
  if (!q || q.length < 2) return false
  const titleLower = String(item.title || '').toLowerCase()
  if (titleLower === q) return true
  // 标题以该词条开头，或书名号/破折号前的主词条完全匹配（如“热力环流”、“水循环”、“地球的运动”）
  const coreTitleSegments = titleLower
    .replace(/^【[^】]+】/, '')
    .replace(/^教材精读：|^繁星课题：/, '')
    .split(/[（(—\-：:·/]/, 3)
    .map(s => s.replace(/[《》“”"']/g, '').trim())
    .filter(Boolean)
  if (coreTitleSegments.some(seg => seg === q)) return true
  if (Array.isArray(item.tags) && item.tags.some(t => String(t).toLowerCase() === q)) {
    return titleLower.includes(q)
  }
  return false
}

/**
 * 获取全部静态可检索条目池
 */
export function getAllStaticSearchPools() {
  return [
    ...EXPERIMENT_INDEX.map(item => ({ ...item, category: '地理实验室', typePriority: 4 })),
    ...LAB_INDEX.map(item => ({
      ...item,
      category: item.typeKey === 'resource' ? '开放资源馆' : '真实数据探究',
      typePriority: 3
    })),
    ...CURRICULUM_INDEX.map(item => ({ ...item, category: '教材与知识库', typePriority: 2 })),
    ...FANXING_INDEX.map(item => ({ ...item, category: '繁星科研课题', typePriority: 2 })),
    ...RESOURCE_INDEX.map(item => ({ ...item, category: '开放资源馆', typePriority: 1 }))
  ]
}

/**
 * 聚合执行全站多源检索
 * @param {string} rawQuery 检索关键词、标签或自然问句
 * @param {Object} options 可选配置：{ limit: 12, typeFilter: 'all' }
 * @returns {Array} 匹配的结果项（包含 exactMatch 标记）
 */
export function queryGlobalGeography(rawQuery, options = {}) {
  const limit = Number.isFinite(options.limit) ? options.limit : 12
  const typeFilter = options.typeFilter || 'all'

  const normalizedQuery = normalizeSearchQuery(rawQuery)
  if (!normalizedQuery) return []
  const q = normalizedQuery.toLowerCase()
  const baseTokens = extractQueryTerms(q)

  // 检查是否命中自然问句/同义词意图规则
  const matchedRules = INTENT_SYNONYM_RULES.filter(rule => rule.pattern.test(q))
  const boostedIdMap = new Map()
  const expandedTerms = new Set()

  for (const rule of matchedRules) {
    rule.terms.forEach(t => expandedTerms.add(t.toLowerCase()))
    rule.boostIds.forEach((id, idx) => {
      const bonus = 140 - idx * 20
      if (!boostedIdMap.has(id) || boostedIdMap.get(id) < bonus) {
        boostedIdMap.set(id, bonus)
      }
    })
  }

  let allPools = getAllStaticSearchPools()
  if (typeFilter && typeFilter !== 'all') {
    allPools = allPools.filter(item => item.typeKey === typeFilter || item.type === typeFilter)
  }

  const scored = []

  for (const item of allPools) {
    const titleLower = item.title.toLowerCase()
    const descLower = item.desc.toLowerCase()
    const badgeLower = item.badge.toLowerCase()
    const kwLower = (item.keywords || '').toLowerCase()
    const tagsLower = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : ''
    const haystack = `${titleLower} ${descLower} ${badgeLower} ${kwLower} ${tagsLower}`

    let score = 0
    const exactMatch = isExactTitleOrConceptMatch(item, normalizedQuery)

    // 0. 维基百科式精确词条匹配高优置顶（但不破坏自然问句意图直达榜首实验）
    if (exactMatch) {
      score += 115
    }

    // 1. 意图直达加分（确保最相关的实验排在最前面）
    if (boostedIdMap.has(item.id)) {
      score += boostedIdMap.get(item.id)
    }

    // 2. 完整输入或分词精确匹配
    if (titleLower.includes(q)) score += 100
    else if (tagsLower.includes(q)) score += 90
    else if (kwLower.includes(q)) score += 80
    else if (descLower.includes(q) || badgeLower.includes(q)) score += 60

    // 3. 去停用词后的核心词元匹配
    let matchedTokenCount = 0
    for (const tok of baseTokens) {
      if (!tok) continue
      if (haystack.includes(tok)) {
        matchedTokenCount += 1
        score += titleLower.includes(tok) ? 40 : tagsLower.includes(tok) ? 35 : kwLower.includes(tok) ? 30 : 20
      } else if (matchedRules.length > 0 && tok.length >= 4) {
        let bigramHits = 0
        for (let i = 0; i <= tok.length - 2; i++) {
          const bg = tok.slice(i, i + 2)
          if (bg.trim().length === 2 && haystack.includes(bg)) {
            bigramHits += 1
          }
        }
        if (bigramHits >= 2) {
          matchedTokenCount += 1
          score += bigramHits * 12
        }
      }
    }

    // 4. 同义词扩展词匹配
    for (const syn of expandedTerms) {
      if (haystack.includes(syn)) {
        score += titleLower.includes(syn) ? 25 : 15
      }
    }

    if (!matchedRules.length && matchedTokenCount < baseTokens.length) {
      continue
    }

    if (score > 0) {
      scored.push({
        ...item,
        exactMatch,
        _score: score + item.typePriority * 2
      })
    }
  }

  scored.sort((a, b) => b._score - a._score)

  return scored.slice(0, limit).map(({ _score, typePriority, ...rest }) => rest)
}
