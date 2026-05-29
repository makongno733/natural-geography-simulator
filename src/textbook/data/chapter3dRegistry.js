const COMMON_FALLBACK = {
  theme: 'system',
  title: '章节综合演示',
  subtitle: '核心概念—过程—影响的三维结构图',
  terrain: 'grid',
  nodes: ['概念', '过程', '空间分布', '人地关系'],
  flows: ['要素联系', '过程演化', '区域影响'],
  layers: ['基础条件', '主导过程', '地理效应'],
  metrics: ['识图', '解释', '迁移'],
}

const RECIPES = {
  '高中|必修第一册|第一章': {
    theme: 'cosmic', title: '宇宙中的地球', subtitle: '天体系统、太阳影响、地球历史与圈层结构', terrain: 'space',
    nodes: ['可观测宇宙', '太阳系', '地月系统', '地球圈层'],
    flows: ['太阳辐射', '太阳活动', '地质年代', '圈层分异'],
    layers: ['宇宙环境', '时间尺度', '内部圈层', '外部圈层'], metrics: ['光照', '磁暴', '演化', '圈层'],
  },
  '高中|必修第一册|第二章': {
    theme: 'atmosphere', title: '地球上的大气', subtitle: '组成、垂直分层、受热过程与大气运动', terrain: 'globe',
    nodes: ['N₂/O₂/CO₂', '对流层', '平流层', '热力环流'],
    flows: ['太阳短波', '地面长波', '大气逆辐射', '水平气压梯度力'],
    layers: ['对流层', '平流层', '高层大气'], metrics: ['气温', '气压', '风向', '天气'],
  },
  '高中|必修第一册|第三章': {
    theme: 'water', title: '地球上的水', subtitle: '水循环、海水性质、海水运动与海冰问题', terrain: 'basin',
    nodes: ['蒸发', '水汽输送', '降水', '径流'], flows: ['海陆间循环', '陆地内循环', '海上内循环', '洋流输送'],
    layers: ['海洋', '大气', '陆地水', '地下水'], metrics: ['盐度', '温度', '密度', '更新'],
  },
  '高中|必修第一册|第四章': {
    theme: 'landform', title: '地貌', subtitle: '流水、喀斯特、风沙、海岸等常见地貌与观察方法', terrain: 'terrain',
    nodes: ['流水地貌', '喀斯特地貌', '风沙地貌', '海岸地貌'], flows: ['侵蚀', '搬运', '堆积', '抬升'],
    layers: ['海拔', '坡度', '坡向', '地貌组合'], metrics: ['等高线', '剖面', '尺度', '过程'],
  },
  '高中|必修第一册|第五章': {
    theme: 'ecosystem', title: '植被与土壤', subtitle: '植被类型、土壤剖面、城市内涝与下渗过程', terrain: 'soil',
    nodes: ['森林', '草原', '荒漠', '土壤剖面'], flows: ['枯落物输入', '淋溶', '腐殖质形成', '下渗'],
    layers: ['O层', 'A层', 'B层', 'C/R层'], metrics: ['水分', '有机质', '质地', '透水性'],
  },
  '高中|必修第一册|第六章': {
    theme: 'hazard', title: '自然灾害', subtitle: '气象灾害、地质灾害、防灾减灾与地理信息技术', terrain: 'hazard',
    nodes: ['台风', '暴雨洪涝', '地震', '滑坡泥石流'], flows: ['监测', '预警', '避险', '救援'],
    layers: ['致灾因子', '孕灾环境', '承灾体', '防灾能力'], metrics: ['强度', '暴露度', '脆弱性', '风险'],
  },
  '高中|必修第二册|第一章': {
    theme: 'population', title: '人口', subtitle: '人口分布、人口迁移与人口容量', terrain: 'network',
    nodes: ['人口密度', '迁入地', '迁出地', '环境承载力'], flows: ['经济吸引', '交通联系', '政策引导', '资源约束'],
    layers: ['自然条件', '经济机会', '社会文化'], metrics: ['密度', '迁移率', '容量'],
  },
  '高中|必修第二册|第二章': {
    theme: 'urban', title: '乡村和城镇', subtitle: '空间结构、城镇化与地域文化景观', terrain: 'city',
    nodes: ['商业区', '居住区', '工业区', '乡村聚落'], flows: ['通勤', '土地利用转换', '人口集聚', '文化扩散'],
    layers: ['核心区', '过渡区', '外围区'], metrics: ['地租', '交通', '人口', '景观'],
  },
  '高中|必修第二册|第三章': {
    theme: 'industry', title: '产业区位因素', subtitle: '农业、工业、服务业区位及其变化', terrain: 'production',
    nodes: ['农业基地', '工业园区', '市场', '服务中心'], flows: ['原料', '劳动力', '信息', '产品'],
    layers: ['自然因素', '社会经济', '技术变化'], metrics: ['成本', '市场', '交通', '集聚'],
  },
  '高中|必修第二册|第四章': {
    theme: 'transport', title: '交通运输布局与区域发展', subtitle: '交通布局和区域发展的双向作用', terrain: 'network',
    nodes: ['港口', '枢纽城市', '铁路', '产业带'], flows: ['客流', '物流', '资金流', '信息流'],
    layers: ['通道', '节点', '网络'], metrics: ['可达性', '运量', '时效', '腹地'],
  },
  '高中|必修第二册|第五章': {
    theme: 'environment', title: '环境与发展', subtitle: '环境问题、可持续发展与国家战略', terrain: 'balance',
    nodes: ['资源利用', '污染排放', '生态保护', '低碳转型'], flows: ['物质投入', '废弃物输出', '循环利用', '政策调控'],
    layers: ['经济', '社会', '生态'], metrics: ['碳排放', '承载力', '公平', '效率'],
  },
  '高中|选择性必修1|第一章': {
    theme: 'earthMotion', title: '地球的运动', subtitle: '自转、公转及其地理意义', terrain: 'orbit',
    nodes: ['地轴倾斜', '昼夜更替', '太阳直射点', '四季变化'], flows: ['自转', '公转', '太阳高度变化', '昼长变化'],
    layers: ['赤道面', '黄道面', '晨昏线'], metrics: ['地方时', '正午太阳高度', '昼夜长短'],
  },
  '高中|选择性必修1|第二章': {
    theme: 'tectonic', title: '地表形态的塑造', subtitle: '内力、外力、构造地貌和河流地貌', terrain: 'terrain',
    nodes: ['褶皱', '断层', '河谷', '冲积平原'], flows: ['地壳运动', '风化', '侵蚀', '堆积'],
    layers: ['岩层', '地表', '水系'], metrics: ['坡度', '岩性', '流量', '沉积'],
  },
  '高中|选择性必修1|第三章': {
    theme: 'weather', title: '大气的运动', subtitle: '天气系统、气压带风带及气候影响', terrain: 'globe',
    nodes: ['冷锋', '暖锋', '气旋', '反气旋'], flows: ['风带移动', '水汽输送', '锋面抬升', '季节迁移'],
    layers: ['近地面', '高空', '锋面'], metrics: ['气压', '风向', '降水', '气温'],
  },
  '高中|选择性必修1|第四章': {
    theme: 'ocean', title: '水的运动', subtitle: '陆地水体、洋流与海气相互作用', terrain: 'ocean',
    nodes: ['河流补给', '寒流', '暖流', 'ENSO'], flows: ['径流补给', '洋流输送', '海气热量交换', '水汽反馈'],
    layers: ['陆地水', '表层海水', '大气边界层'], metrics: ['水位', '盐度', '温度', '降水'],
  },
  '高中|选择性必修1|第五章': {
    theme: 'natureSystem', title: '自然环境的整体性与差异性', subtitle: '自然环境要素联系与地域分异规律', terrain: 'zonal',
    nodes: ['纬度地带性', '干湿度地带性', '垂直分异', '整体性'], flows: ['热量梯度', '水分梯度', '海拔梯度', '要素反馈'],
    layers: ['气候', '地貌', '水文', '土壤植被'], metrics: ['热量', '水分', '海拔', '尺度'],
  },
  '高中|选择性必修2|第一章': {
    theme: 'region', title: '区域与区域发展', subtitle: '区域类型、整体性和关联性', terrain: 'region',
    nodes: ['行政区', '自然区', '经济区', '功能区'], flows: ['要素流动', '区域联系', '边界变化', '协同发展'],
    layers: ['边界', '核心', '腹地'], metrics: ['差异', '联系', '尺度', '功能'],
  },
  '高中|选择性必修2|第二章': {
    theme: 'regionalResource', title: '资源、环境与区域发展', subtitle: '自然环境基础、生态脆弱区与资源枯竭型城市', terrain: 'fragile',
    nodes: ['资源禀赋', '生态脆弱区', '矿业城市', '转型产业'], flows: ['开发', '退化', '治理', '转型'],
    layers: ['自然基础', '产业结构', '生态压力'], metrics: ['资源量', '脆弱性', '恢复力', '转型度'],
  },
  '高中|选择性必修2|第三章': {
    theme: 'cityRegion', title: '城市、产业与区域发展', subtitle: '城市辐射、产业结构变化与区域发展', terrain: 'network',
    nodes: ['中心城市', '外围城市', '产业链', '创新节点'], flows: ['辐射带动', '产业升级', '资金流', '技术流'],
    layers: ['核心', '走廊', '外围'], metrics: ['辐射强度', '产业层级', '联系密度'],
  },
  '高中|选择性必修2|第四章': {
    theme: 'interregional', title: '区际联系与区域协调发展', subtitle: '流域协调、资源调配、产业转移和国际合作', terrain: 'corridor',
    nodes: ['上游', '下游', '调出区', '调入区'], flows: ['水流', '能源流', '产业转移', '合作网络'],
    layers: ['流域', '通道', '区域网络'], metrics: ['公平', '效率', '补偿', '协同'],
  },
  '高中|选择性必修3|第一章': {
    theme: 'environmentService', title: '自然环境与人类社会', subtitle: '自然环境服务、资源利用与环境问题', terrain: 'balance',
    nodes: ['供给服务', '调节服务', '文化服务', '支撑服务'], flows: ['资源获取', '生态调节', '人类需求', '环境反馈'],
    layers: ['自然系统', '社会系统', '经济系统'], metrics: ['服务价值', '消耗', '压力', '风险'],
  },
  '高中|选择性必修3|第二章': {
    theme: 'resourceSecurity', title: '资源安全与国家安全', subtitle: '能源、耕地、海洋空间与国家安全', terrain: 'security',
    nodes: ['能源安全', '耕地安全', '海洋空间', '供应链'], flows: ['开采', '储备', '调配', '保障'],
    layers: ['资源基础', '战略储备', '风险防控'], metrics: ['自给率', '储备量', '进口依存度', '安全阈值'],
  },
  '高中|选择性必修3|第三章': {
    theme: 'environmentSecurity', title: '环境安全与国家安全', subtitle: '环境污染、生态保护与全球气候变化', terrain: 'risk',
    nodes: ['污染源', '生态红线', '气候变化', '国家安全'], flows: ['污染扩散', '生态修复', '碳循环', '风险传导'],
    layers: ['局地环境', '区域生态', '全球变化'], metrics: ['浓度', '阈值', '碳排', '韧性'],
  },
  '高中|选择性必修3|第四章': {
    theme: 'strategy', title: '保障国家安全的资源、环境战略与行动', subtitle: '生态文明、国家战略、政策工具和国际合作', terrain: 'policy',
    nodes: ['生态文明', '国家战略', '政策工具', '国际合作'], flows: ['规划', '治理', '监督', '协作'],
    layers: ['理念', '制度', '行动'], metrics: ['治理能力', '协同度', '执行力', '国际责任'],
  },
}

function deriveSectionFocus(sectionTitle = '') {
  const title = String(sectionTitle || '')
  const rules = [
    [/宇宙环境/, { nodes: ['天体系统层级', '地球普通性', '地球特殊性'], flows: ['宇宙尺度定位', '生命条件筛选'], metrics: ['天体系统'] }],
    [/太阳/, { nodes: ['太阳辐射', '太阳活动', '地磁扰动'], flows: ['能量输入', '电离层扰动'], metrics: ['黑子', '耀斑'] }],
    [/历史|地质年代/, { nodes: ['地质年代', '生命演化', '环境变迁'], flows: ['沉积记录', '生物演替'], metrics: ['宙代纪'] }],
    [/圈层结构/, { nodes: ['地壳', '地幔', '地核', '大气圈水圈生物圈'], flows: ['圈层分异', '物质循环'], metrics: ['界面'] }],
    [/大气的组成|垂直分层/, { nodes: ['干洁空气', '水汽杂质', '对流层', '平流层'], flows: ['成分分异', '温度垂直变化'], metrics: ['N₂/O₂', 'O₃'] }],
    [/受热过程|大气运动/, { nodes: ['太阳短波', '地面长波', '大气逆辐射', '热力环流'], flows: ['辐射传输', '气压差驱动'], metrics: ['温差', '气压梯度'] }],
    [/水循环/, { nodes: ['蒸发', '水汽输送', '降水', '地表地下径流'], flows: ['海陆间循环', '水量更新'], metrics: ['循环环节'] }],
    [/海水的性质/, { nodes: ['温度', '盐度', '密度', '海冰'], flows: ['热量收支', '淡水收支'], metrics: ['盐度剖面'] }],
    [/海水的运动|洋流/, { nodes: ['风海流', '密度流', '寒流', '暖流'], flows: ['盛行风驱动', '热盐输送'], metrics: ['流向', '性质'] }],
    [/地貌类型|地貌的观察/, { nodes: ['侵蚀地貌', '堆积地貌', '坡度坡向', '等高线'], flows: ['外力塑造', '尺度观察'], metrics: ['海拔', '坡度'] }],
    [/植被/, { nodes: ['森林', '草原', '荒漠', '垂直带谱'], flows: ['水热组合', '群落演替'], metrics: ['覆盖度'] }],
    [/土壤/, { nodes: ['成土母质', '腐殖质', '淋溶', '土壤剖面'], flows: ['成土过程', '水分下渗'], metrics: ['质地', '肥力'] }],
    [/气象灾害/, { nodes: ['台风', '暴雨', '洪涝', '干旱寒潮'], flows: ['水汽辐合', '极端天气链'], metrics: ['频率', '强度'] }],
    [/地质灾害/, { nodes: ['地震', '滑坡', '泥石流', '崩塌'], flows: ['构造活动', '重力失稳'], metrics: ['坡度', '岩性'] }],
    [/防灾|地理信息技术/, { nodes: ['遥感', 'GIS', '北斗/GNSS', '预警避险'], flows: ['监测识别', '风险评估'], metrics: ['时效', '精度'] }],
    [/人口分布/, { nodes: ['平原沿海', '城市集聚', '资源环境', '经济机会'], flows: ['人口集聚', '空间差异'], metrics: ['密度'] }],
    [/人口迁移/, { nodes: ['迁出地', '迁入地', '推力', '拉力'], flows: ['劳动力流动', '社会经济反馈'], metrics: ['迁移率'] }],
    [/人口容量/, { nodes: ['资源', '科技', '消费水平', '开放程度'], flows: ['承载约束', '容量变化'], metrics: ['临界值'] }],
    [/空间结构|城镇化|城乡景观/, { nodes: ['功能区', '地租梯度', '城镇扩展', '地域文化'], flows: ['土地利用转换', '通勤联系'], metrics: ['城镇化率'] }],
    [/农业区位|工业区位|服务业区位/, { nodes: ['自然条件', '市场交通', '劳动力技术', '政策信息'], flows: ['区位选择', '产业集聚'], metrics: ['成本', '收益'] }],
    [/交通运输/, { nodes: ['交通线', '交通点', '腹地', '区域网络'], flows: ['客货流', '可达性提升'], metrics: ['运量', '时效'] }],
    [/环境问题|可持续|国家发展战略/, { nodes: ['资源短缺', '环境污染', '生态破坏', '绿色转型'], flows: ['人地矛盾', '协调发展'], metrics: ['碳排', '承载力'] }],
    [/自转|公转|地理意义/, { nodes: ['自转轴', '公转轨道', '晨昏线', '太阳直射点'], flows: ['昼夜更替', '季节变化'], metrics: ['地方时', '昼长'] }],
    [/地表形态|构造地貌|河流地貌/, { nodes: ['内力作用', '外力作用', '褶皱断层', '河谷阶地'], flows: ['抬升侵蚀', '搬运堆积'], metrics: ['岩性', '流量'] }],
    [/天气系统|气压带|风带|气候/, { nodes: ['锋面', '气旋反气旋', '三圈环流', '季风'], flows: ['空气抬升', '风带季移'], metrics: ['气压', '降水'] }],
    [/陆地水体|海.?气/, { nodes: ['河流补给', '湖泊地下水', 'ENSO', '海气热交换'], flows: ['水体互补', '海气反馈'], metrics: ['水位', 'SST'] }],
    [/整体性|地域差异性/, { nodes: ['气候', '水文', '土壤', '植被'], flows: ['要素联动', '地域分异'], metrics: ['纬度', '海拔'] }],
    [/区域/, { nodes: ['区域边界', '区域特征', '整体性', '关联性'], flows: ['要素流动', '区域比较'], metrics: ['尺度', '功能'] }],
    [/资源|生态脆弱|资源枯竭/, { nodes: ['资源禀赋', '生态压力', '产业转型', '综合治理'], flows: ['开发退化', '修复转型'], metrics: ['脆弱性'] }],
    [/城市的辐射|产业结构/, { nodes: ['中心城市', '腹地', '产业链', '创新网络'], flows: ['辐射扩散', '产业升级'], metrics: ['联系强度'] }],
    [/流域|跨区域|产业转移|国际合作/, { nodes: ['上游下游', '调出调入', '承接转出', '合作网络'], flows: ['资源调配', '利益协调'], metrics: ['协同度'] }],
    [/服务功能|自然资源|环境问题/, { nodes: ['供给服务', '调节服务', '资源利用', '环境代价'], flows: ['生态服务', '人类需求反馈'], metrics: ['生态足迹'] }],
    [/资源安全|能源安全|耕地|海洋空间/, { nodes: ['战略资源', '供应链', '储备调配', '安全阈值'], flows: ['风险传导', '保障机制'], metrics: ['自给率'] }],
    [/环境安全|污染|生态保护|气候变化/, { nodes: ['污染扩散', '生态红线', '碳循环', '全球变化'], flows: ['环境风险', '安全响应'], metrics: ['阈值', '韧性'] }],
    [/生态文明|国家战略|政策|国际合作/, { nodes: ['制度设计', '政策工具', '公众行动', '国际责任'], flows: ['治理闭环', '协同实施'], metrics: ['执行力'] }],
  ]

  const matched = rules.find(([pattern]) => pattern.test(title))
  if (matched) return matched[1]
  if (title) {
    return {
      nodes: [title, '核心概念', '过程机制'],
      flows: ['本节主题展开', '案例迁移'],
      metrics: ['读图', '解释'],
    }
  }
  return { nodes: [], flows: [], metrics: [] }
}

function mergeUnique(primary = [], fallback = [], max = 8) {
  return Array.from(new Set([...primary, ...fallback])).filter(Boolean).slice(0, max)
}

export function getChapter3DRecipe({ grade, book, chapter, chapterTitle, section, sectionTitle }) {
  if (grade !== '高中') return null
  const key = `${grade}|${book}|${chapter}`
  const recipe = RECIPES[key] || COMMON_FALLBACK
  const focus = deriveSectionFocus(sectionTitle)
  return {
    ...recipe,
    nodes: mergeUnique(focus.nodes, recipe.nodes),
    flows: mergeUnique(focus.flows, recipe.flows, 7),
    metrics: mergeUnique(focus.metrics, recipe.metrics, 5),
    grade,
    book,
    chapter,
    chapterTitle: chapterTitle || recipe.title,
    section,
    sectionTitle,
  }
}

export function hasChapter3DRecipe(context) {
  return Boolean(getChapter3DRecipe(context))
}
