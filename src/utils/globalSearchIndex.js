/**
 * 全站地理知识、3D 实验、真实数据、创新探究、教材章节与宇宙物理统一检索索引
 */

// 全部 29 个地理实验与动手模型索引
export const EXPERIMENT_INDEX = [
  {
    id: 'exp-thermal',
    type: '实验',
    badge: '大气与气候',
    title: '热力环流与风向动力学模拟（海陆风 / 山谷风 / 城市热岛）',
    desc: '冷热下垫面受热不均、垂直对流、等压面高凸低凹与近地面气压梯度力演变',
    route: '/experiments/meteorology/thermal-circulation'
  },
  {
    id: 'exp-coriolis',
    type: '实验',
    badge: '大气与气候',
    title: '地转偏向力（科里奥利力）与风向偏转模拟',
    desc: '南北半球水平运动物体偏转规律、三圈环流风带与气旋反气旋旋转方向',
    route: '/experiments/meteorology/coriolis'
  },
  {
    id: 'exp-climate-chart',
    type: '实验',
    badge: '大气与气候',
    title: '气温曲线与降水量柱状图交互判读（以温定带、以水定型）',
    desc: '热带雨林、季风、地中海、温带海洋性与大陆性气候成因与分布对比',
    route: '/experiments/meteorology/climate-chart'
  },
  {
    id: 'exp-atmosphere-system',
    type: '实验',
    badge: '大气与气候',
    title: '大气垂直分层、三圈环流、季风与锋面气旋三维沙盒',
    desc: '对流层平流层结构、行星风带、东亚南亚季风、冷锋暖锋与厄尔尼诺海气耦合',
    route: '/experiments/systems/atmosphere-system'
  },
  {
    id: 'exp-stream',
    type: '实验',
    badge: '流水地貌',
    title: '流水地貌冲刷与微缩水槽实验',
    desc: '河流溯源侵蚀、下蚀侧蚀、冲积扇多期叠置、V形谷与河曲牛轭湖发育',
    route: '/experiments/hydrology/stream-table'
  },
  {
    id: 'exp-groundwater',
    type: '实验',
    badge: '水循环与水文',
    title: '地下水运移、含水层与承压水井水位模拟',
    desc: '潜水与承压水补给排泄、达西定律渗透流速、过度开采漏斗与地下水位变化',
    route: '/experiments/hydrology/groundwater'
  },
  {
    id: 'exp-sediment',
    type: '实验',
    badge: '流水地貌',
    title: '河流泥沙搬运、分选与流速沉积实验',
    desc: '不同粒径砾石砂粒粉砂粘土的起动流速、搬运方式与河口三角洲机械分选',
    route: '/experiments/hydrology/sediment-transport'
  },
  {
    id: 'exp-water-cycle-3d',
    type: '实验',
    badge: '水循环与水文',
    title: '三维水循环与流域水文过程模拟',
    desc: '海陆间大循环、蒸发水汽输送降水、地表径流下渗与地下径流动态平衡',
    route: '/experiments/systems/water-cycle-3d'
  },
  {
    id: 'exp-fault',
    type: '实验',
    badge: '地质构造',
    title: '地壳断层与褶皱地质构造受力模型',
    desc: '背斜向斜、正断层、逆断层、走滑断层受力机制与华山庐山块状山、渭河地堑',
    route: '/experiments/geology/fault-model'
  },
  {
    id: 'exp-stratigraphy',
    type: '实验',
    badge: '地质构造',
    title: '沉积地层叠置、岩层新老关系与不整合接触模拟',
    desc: '地层层序律、化石定年、岩浆侵入穿切关系与地质剖面演化历史反演',
    route: '/experiments/geology/stratigraphy'
  },
  {
    id: 'exp-soil-erosion',
    type: '实验',
    badge: '地质与水土',
    title: '坡面水土流失、植被覆盖与黄土高原护坡实验',
    desc: '对比坡度、降雨强度与植被覆盖度对土壤侵蚀量和泥沙流失的控制效果',
    route: '/experiments/geology/soil-erosion'
  },
  {
    id: 'exp-soil-profile',
    type: '实验',
    badge: '土壤与生物',
    title: '三维土壤剖面分层与成土过程探索（森林土 / 黑土 / 红壤）',
    desc: '有机质层、腐殖质层、淋溶层、淀积层、母质层与母岩结构观察',
    route: '/experiments/systems/soil-profile'
  },
  {
    id: 'exp-landform-sandbox',
    type: '实验',
    badge: '地表形态',
    title: '典型地貌三维沙盘（喀斯特 / 河流 / 风沙 / 海岸 / 冰川地貌）',
    desc: '峰林溶洞、新月形沙丘、海蚀崖海蚀柱、冰斗角峰U形谷与内力外力演变',
    route: '/experiments/systems/landform-sandbox'
  },
  {
    id: 'exp-moon',
    type: '实验',
    badge: '天体运动',
    title: '月相变化与日地月空间几何关系',
    desc: '朔望月、新月上弦月满月下弦月、月球公转相位与地面中天观测视角',
    route: '/experiments/astronomy/moon-phases'
  },
  {
    id: 'exp-solar',
    type: '实验',
    badge: '地球运动',
    title: '正午太阳高度角与昼夜长短模拟器',
    desc: '输入纬度与节气日期，动态推求太阳直射点、晨昏线、太阳视运动轨迹与昼长',
    route: '/experiments/astronomy/solar-motion'
  },
  {
    id: 'exp-seasons',
    type: '实验',
    badge: '地球运动',
    title: '黄赤交角、地球公转与四季五带变化模拟',
    desc: '二分二至日地球公转轨道位置、太阳直射点南北移动与全球热量带划分',
    route: '/experiments/astronomy/seasons'
  },
  {
    id: 'exp-eclipse',
    type: '实验',
    badge: '天体运动',
    title: '日食与月食（本影 / 半影 / 伪本影）三维光学模拟',
    desc: '日全食、日环食、日偏食与月全食红月亮成因及黄白交角条件',
    route: '/experiments/astronomy/eclipse'
  },
  {
    id: 'exp-kepler',
    type: '实验',
    badge: '天体运动',
    title: '开普勒行星运动三定律与椭圆轨道面积速度模拟',
    desc: '近日点与远日点公转速度变化、轨道偏心率与周期半长轴关系验证',
    route: '/experiments/astronomy/kepler-laws'
  },
  {
    id: 'exp-celestial',
    type: '实验',
    badge: '天体运动',
    title: '天球坐标系、北极星仰角与周日视运动三维模型',
    desc: '地平圈、子午圈、天赤道、黄道面与不同纬度星空周日旋转规律',
    route: '/experiments/systems/celestial-sphere'
  },
  {
    id: 'exp-earth',
    type: '实验',
    badge: '地球圈层',
    title: '地球三维圈层与深部构造沙盒',
    desc: '地壳、地幔、地核、莫霍面、古登堡面、软流层与地震波传播速度',
    route: '/earth3d'
  },
  {
    id: 'exp-disasters',
    type: '实验',
    badge: '防灾减灾',
    title: '自然灾害过程模拟（泥石流 / 滑坡 / 洪涝 / 震源地震波）',
    desc: '地形坡度、暴雨激发与防灾工程措施对地质气象灾害发生风险的影响',
    route: '/disasters'
  },
  {
    id: 'exp-map-projection',
    type: '实验',
    badge: '地图与空间',
    title: '地图投影变形分析（墨卡托圆柱投影 / 圆锥投影 / 方位投影）',
    desc: '地球曲面展平的面积、角度、距离变形椭圆（底索指示线）对比',
    route: '/map'
  },
  {
    id: 'exp-geologic-time',
    type: '实验',
    badge: '地球历史',
    title: '地质年代表与地球生命海陆演化交互标尺',
    desc: '冥古宙、太古宙、元古宙、显生宙（古生代、中生代、新生代）生物与造山演化',
    route: '/geo'
  },
  {
    id: 'exp-human-env',
    type: '实验',
    badge: '人文地理',
    title: '人地关系、产业区位与城镇化空间模拟',
    desc: '农业区位、工业布局、生态保护红线与区域可持续发展权衡',
    route: '/experiments/systems/human-environment'
  },
  {
    id: 'exp-spatial-network',
    type: '实验',
    badge: '人文地理',
    title: '交通网络、中心地理论与城市群空间流模拟',
    desc: '交通可达性、门槛人口、服务范围六边形网络与区域经济要素流动',
    route: '/experiments/systems/spatial-network'
  },
  {
    id: 'exp-cloud-bottle',
    type: '实验',
    badge: '动手实验教程',
    title: '瓶中造云：绝热膨胀降温与凝结核成云动手实验',
    desc: '用塑料瓶、温水与烟雾演示气压下降绝热冷却达到露点凝结成云',
    route: '/experiments/meteorology/cloud-bottle'
  },
  {
    id: 'exp-infiltration',
    type: '实验',
    badge: '动手实验教程',
    title: '不同地表材质与土壤下渗速率对比动手实验',
    desc: '对比沙土、壤土、粘土及硬化路面的雨水下渗快慢与地表产流',
    route: '/experiments/hydrology/infiltration'
  },
  {
    id: 'exp-mineral-id',
    type: '实验',
    badge: '动手实验教程',
    title: '常见矿物与三大类岩石肉眼鉴定实验（莫氏硬度 / 条痕 / 解理）',
    desc: '石英、长石、云母、方解石鉴定及花岗岩、玄武岩、石灰岩、片麻岩识别',
    route: '/experiments/geology/mineral-id'
  }
]

// 核心地学探究、真实数据实验室、日历与开放资源索引
export const LAB_INDEX = [
  {
    id: 'lab-terrain',
    type: '探究',
    badge: '真实高程 DEM',
    title: '珠峰与喜马拉雅真实 DEM 数字高程模型与地形剖面探究',
    desc: 'Copernicus 真实网格地形渲染，高程剖面提取、起伏度与坡度分析',
    route: '/geo-labs/terrain'
  },
  {
    id: 'lab-satellite',
    type: '探究',
    badge: '多时相遥感',
    title: '鄱阳湖与咸海湖泊水体变化多时相卫星遥感对比（NASA GIBS / MODIS）',
    desc: '滑动对比真实卫星影像波段，观察季节水位涨落与湖泊时空变化',
    route: '/geo-labs/satellite'
  },
  {
    id: 'lab-remote-ai',
    type: '探究',
    badge: '遥感 AI 解译',
    title: 'Prithvi EO 2.0 多光谱遥感地物分类与模型边界辨析',
    desc: '对比原始卫星观测像元与 AI 模型推断结果，理解遥感解译的不确定性',
    route: '/geo-labs/ai'
  },
  {
    id: 'lab-urban-flood',
    type: '探究',
    badge: '海绵城市课题',
    title: '城市为什么会“看海”？——城市内涝水动力与地表下渗探究',
    desc: '控制降雨强度与地表材质变量，对比透水铺装、绿地与沥青路面的径流削峰效果',
    route: '/inquiry?task=urban-flood'
  },
  {
    id: 'lab-landscape',
    type: '探究',
    badge: '真实数据课题',
    title: '同一地点为什么呈现不同景观？——鄱阳湖丰枯水期多源证据探究',
    desc: '结合遥感水位、气象降水与地形高程证据卡，区分观测事实与因果推论',
    route: '/inquiry?task=landscape-variation'
  },
  {
    id: 'lab-decision',
    type: '探究',
    badge: '区域决策课题',
    title: '重工业搬迁还是就地升级？——人地关系与生态红线多目标决策探究',
    desc: '综合权衡就业经济、大气水源污染控制与生态红线约束的区域发展方案',
    route: '/inquiry?task=human-environment-decision'
  },
  {
    id: 'lab-calendar',
    type: '探究',
    badge: '日历与地震实录',
    title: '地理事件日历：二十四节气、天象预测与 USGS 全球地震记录',
    desc: '按月查看流星雨、日月食、节气物候观察与美国地质调查局（USGS）实测地震',
    route: '/calendar'
  },
  {
    id: 'lab-resources',
    type: '探究',
    badge: '开放科学数据',
    title: '地理数据与开放资源馆（DEM 高程 / ERA5 气象再分析 / 遥感底图）',
    desc: '查找带明确开放许可的全球地形、气候再分析、土地覆盖与水系矢量数据集',
    route: '/resources'
  },
  {
    id: 'lab-practice',
    type: '探究',
    badge: '互动练习',
    title: '地理互动练习：正午太阳高度计算、经纬网定位与国家地理知识卡',
    desc: '即时反馈的地球运动计算、空间坐标判读与世界区域特征练习',
    route: '/practice'
  }
]

// 课程教材、知识库与宇宙物理章节索引
export const CURRICULUM_INDEX = [
  {
    id: 'curr-bx1',
    type: '教学',
    badge: '高中必修第一册',
    title: '高中必修一《自然地理基础》：宇宙中的地球、大气、水循环、地貌、植被与土壤、自然灾害',
    desc: '人教版高中地理必修第一册全章节课文精读、知识导图与配套 3D 实验',
    route: '/高中/必修第一册'
  },
  {
    id: 'curr-bx2',
    type: '教学',
    badge: '高中必修第二册',
    title: '高中必修二《人文地理》：人口分布迁移、乡村与城镇、产业区位、交通运输、环境与发展',
    desc: '胡焕庸线、城镇化进程、农业工业服务业区位因素与人地协调发展',
    route: '/高中/必修第二册'
  },
  {
    id: 'curr-xb1',
    type: '教学',
    badge: '选择性必修1',
    title: '高中选择性必修1《自然地理基础》：地球运动、地表形态塑造、大气运动、水体运动、整体性与差异性',
    desc: '晨昏线、内力外力构造地貌、三圈环流与锋面气旋、洋流与厄尔尼诺、地域分异规律',
    route: '/高中/选择性必修1'
  },
  {
    id: 'curr-xb2',
    type: '教学',
    badge: '选择性必修2',
    title: '高中选择性必修2《区域发展》：区域类型、生态脆弱区治理、资源枯竭型城市转型、产业转移與跨区域调配',
    desc: '黄土高原水土保持、鲁尔区转型、长三角大都市辐射、南水北调与西气东输',
    route: '/高中/选择性必修2'
  },
  {
    id: 'curr-xb3',
    type: '教学',
    badge: '选择性必修3',
    title: '高中选择性必修3《资源、环境与国家安全》：耕地粮食安全、能源矿产、海洋空间、碳减排与生态安全',
    desc: '自然环境服务功能、战略性矿产资源、国家安全红线与全球气候变化应对',
    route: '/高中/选择性必修3'
  },
  {
    id: 'curr-cz-7a',
    type: '教学',
    badge: '初中七年级上册',
    title: '初中地理七年级上册：地球和地图、陆地和海洋、天气与气候、居民与聚落',
    desc: '经纬网与等高线地形图、七大洲四大洋与板块运动、世界气候类型分布',
    route: '/初中/七年级上册'
  },
  {
    id: 'curr-cz-7b',
    type: '教学',
    badge: '初中七年级下册',
    title: '初中地理七年级下册：亚洲、日本、东南亚、印度、俄罗斯、中东、欧洲西部、撒哈拉以南非洲、澳大利亚、美国、巴西、极地',
    desc: '世界大洲与主要国家区域自然环境、资源分布与人文经济特征',
    route: '/初中/七年级下册'
  },
  {
    id: 'curr-cz-8a',
    type: '教学',
    badge: '初中八年级上册',
    title: '初中地理八年级上册：中国疆域与人口民族、地形地势与气候河流、自然资源与经济发展',
    desc: '中国三级地势阶梯、季风气候、长江黄河流域治理、土地水资源与工农业交通',
    route: '/初中/八年级上册'
  },
  {
    id: 'curr-cz-8b',
    type: '教学',
    badge: '初中八年级下册',
    title: '初中地理八年级下册：中国四大地理区域（北方、南方、西北、青藏地区）与秦岭—淮河线',
    desc: '东北三省、黄土高原、北京、长三角、港澳珠三角、塔里木盆地、三江源地区',
    route: '/初中/八年级下册'
  },
  {
    id: 'curr-uni',
    type: '教学',
    badge: '大学自然地理学',
    title: '大学《自然地理学》：地球、地壳、大气圈与气候、海洋与陆地水、地貌、土壤圈、生物群落与综合研究',
    desc: '高校自然地理核心章节体系与中学教材跨学段映射索引',
    route: '/大学/自然地理学'
  },
  {
    id: 'curr-knowledge',
    type: '教学',
    badge: '知识库',
    title: '地理结构化知识库：核心概念定义、因果机制链与易错辨析',
    desc: '按章节快速检索初高中地理核心概念、原理机制与读图要点',
    route: '/knowledge'
  },
  {
    id: 'curr-cosmos',
    type: '教学',
    badge: '宇宙与物理',
    title: '宇宙与物理知识中心（天体距离阶梯 / 哈勃红移与膨胀宇宙 / 相对论光锥 / 标准模型粒子图谱 / 弦理论 D1–D11）',
    desc: '从月亮视差、宇宙尺度因子 a(t) 与 FLRW 度规，到世界面、对偶网络与理论物理前沿',
    route: '/cosmos'
  },
  {
    id: 'curr-cosmology',
    type: '教学',
    badge: '宇宙学交互课',
    title: '宇宙学交互课：哈勃定律、光谱红移、尺度因子与热大爆炸演化时间轴',
    desc: '拖动尺度因子观察光波伸长，理解宇宙膨胀证据与模型边界',
    route: '/cosmology'
  }
]

/**
 * 聚合执行全站多源快速检索
 * @param {string} rawQuery 检索关键词
 * @returns {Array} 匹配的结果项
 */
export function queryGlobalGeography(rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return []
  const q = rawQuery.trim().toLowerCase()
  const tokens = q.split(/\s+/).filter(Boolean)

  const matchItem = (item) => {
    const haystack = `${item.title} ${item.desc} ${item.badge}`.toLowerCase()
    return tokens.every(tok => haystack.includes(tok))
  }

  const results = []

  // 1. 匹配地理实验
  for (const exp of EXPERIMENT_INDEX) {
    if (matchItem(exp)) {
      results.push({ ...exp, category: '地理实验室' })
    }
  }

  // 2. 匹配探究与遥感数据实验室
  for (const lab of LAB_INDEX) {
    if (matchItem(lab)) {
      results.push({ ...lab, category: '真实数据探究' })
    }
  }

  // 3. 匹配课程教材
  for (const curr of CURRICULUM_INDEX) {
    if (matchItem(curr)) {
      results.push({ ...curr, category: '教材与知识库' })
    }
  }

  return results.slice(0, 12)
}
