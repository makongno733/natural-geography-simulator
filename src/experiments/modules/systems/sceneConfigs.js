// Pure scene-configuration layer for the two dedicated system sandboxes.
//
// The catalog and experiment-link registry resolve presets by id; these
// functions turn a preset (id + params) into the concrete node / flow /
// stock / feedback / threshold data that the 3D engine modules consume.
// Nothing here touches Three.js or the DOM so the configs stay unit-testable.

const node = (id, label) => Object.freeze({ id, label })
const flow = (from, to, label, weight = 0.8) => Object.freeze({ from, to, label, weight })
const stock = (id, label, value = 0.6) => Object.freeze({ id, label, value })
const transfer = (from, to, label, kind = 'demand') => Object.freeze({ from, to, label, kind })
const feedback = (from, to, label, sign = 'negative') => Object.freeze({ from, to, label, sign })
const threshold = (id, label, limit = 0.7) => Object.freeze({ id, label, limit })

const SPATIAL_PALETTE = Object.freeze(['#5aa9ff', '#ff8c42', '#8ed081', '#f9c74f', '#b39ddb', '#4dd0e1'])

const SPATIAL_NETWORK_DEFS = Object.freeze({
  'regional-connections': Object.freeze({
    title: '区域联系',
    nodes: Object.freeze([node('region-node', '区域节点'), node('transport-hub', '交通枢纽'), node('industrial-base', '产业基地'), node('market', '市场')]),
    flows: Object.freeze([flow('region-node', 'transport-hub', '人流', 0.8), flow('transport-hub', 'industrial-base', '物流', 0.95), flow('industrial-base', 'market', '信息流', 0.7), flow('market', 'region-node', '需求反馈', 0.55)]),
  }),
  'population-distribution': Object.freeze({
    title: '人口分布',
    nodes: Object.freeze([node('plain-coast', '平原沿海'), node('urban-agglomeration', '城市集聚'), node('resource-env', '资源环境'), node('economy-opportunity', '经济机会')]),
    flows: Object.freeze([flow('resource-env', 'plain-coast', '承载力', 0.8), flow('plain-coast', 'urban-agglomeration', '人口集聚', 0.9), flow('urban-agglomeration', 'economy-opportunity', '就业吸引', 0.75), flow('economy-opportunity', 'urban-agglomeration', '空间差异', 0.65)]),
  }),
  'population-system': Object.freeze({
    title: '人口系统',
    nodes: Object.freeze([node('population-size', '人口规模'), node('age-structure', '年龄结构'), node('migration', '迁移'), node('capacity', '环境容量')]),
    flows: Object.freeze([flow('population-size', 'age-structure', '出生死亡', 0.85), flow('age-structure', 'migration', '迁入迁出', 0.7), flow('migration', 'population-size', '规模变化', 0.75), flow('capacity', 'population-size', '容量约束', 0.6)]),
  }),
  'urban-system': Object.freeze({
    title: '城镇系统',
    nodes: Object.freeze([node('central-city', '中心城区'), node('residential', '居住区'), node('industrial', '工业区'), node('suburb', '郊区')]),
    flows: Object.freeze([flow('residential', 'central-city', '通勤', 0.9), flow('central-city', 'suburb', '服务流', 0.7), flow('suburb', 'industrial', '地租外溢', 0.6), flow('industrial', 'central-city', '功能回流', 0.65)]),
  }),
  'industry-location': Object.freeze({
    title: '产业区位',
    nodes: Object.freeze([node('raw-material', '原料'), node('market', '市场'), node('labor', '劳动力'), node('transport', '交通')]),
    flows: Object.freeze([flow('raw-material', 'transport', '投入', 0.85), flow('transport', 'market', '产出', 0.9), flow('labor', 'transport', '人力投入', 0.7), flow('market', 'labor', '效益反馈', 0.6)]),
  }),
  'transport-network': Object.freeze({
    title: '交通网络',
    nodes: Object.freeze([node('port', '港口'), node('railway', '铁路'), node('airport', '机场'), node('city', '城市')]),
    flows: Object.freeze([flow('port', 'railway', '货流', 0.95), flow('railway', 'city', '客流', 0.85), flow('city', 'airport', '高端客流', 0.7), flow('airport', 'port', '时效货流', 0.6)]),
  }),
  'regional-system': Object.freeze({
    title: '区域系统',
    nodes: Object.freeze([node('natural-env', '自然环境'), node('population', '人口'), node('industry', '产业'), node('institution', '制度')]),
    flows: Object.freeze([flow('natural-env', 'population', '要素交换', 0.75), flow('population', 'industry', '劳动力供给', 0.8), flow('industry', 'institution', '制度反馈', 0.6), flow('institution', 'natural-env', '治理约束', 0.55)]),
  }),
  'city-industry-region': Object.freeze({
    title: '城市产业区域',
    nodes: Object.freeze([node('central-city', '中心城市'), node('industrial-park', '产业园区'), node('hinterland', '腹地'), node('innovation-node', '创新节点')]),
    flows: Object.freeze([flow('central-city', 'industrial-park', '产业链', 0.85), flow('industrial-park', 'hinterland', '辐射带动', 0.7), flow('hinterland', 'central-city', '资源供给', 0.65), flow('innovation-node', 'industrial-park', '技术流', 0.8)]),
  }),
  'regional-coordination': Object.freeze({
    title: '区域协调',
    nodes: Object.freeze([node('upstream', '上游'), node('downstream', '下游'), node('export-region', '调出区'), node('import-region', '调入区')]),
    flows: Object.freeze([flow('upstream', 'downstream', '资源调配', 0.85), flow('export-region', 'import-region', '利益协调', 0.7), flow('downstream', 'export-region', '补偿机制', 0.6), flow('import-region', 'upstream', '需求传导', 0.55)]),
  }),
  'regional-development': Object.freeze({
    title: '区域发展',
    nodes: Object.freeze([node('core-area', '核心区'), node('periphery', '外围区'), node('resource', '资源'), node('industry', '产业')]),
    flows: Object.freeze([flow('core-area', 'periphery', '辐射带动', 0.85), flow('resource', 'industry', '要素流动', 0.75), flow('periphery', 'core-area', '要素回流', 0.6), flow('industry', 'periphery', '空间转移', 0.65)]),
  }),
})

const HUMAN_ENVIRONMENT_DEFS = Object.freeze({
  'resource-system': Object.freeze({
    title: '资源系统',
    stocks: Object.freeze([stock('resource-base', '资源禀赋', 0.7), stock('development', '开发利用', 0.55), stock('consumption', '消费需求', 0.5), stock('environment-pressure', '环境压力', 0.35)]),
    flows: Object.freeze([transfer('resource-base', 'development', '资源投入', 'supply'), transfer('development', 'consumption', '产品供给', 'supply'), transfer('consumption', 'environment-pressure', '废弃物输出', 'emission')]),
    feedbacks: Object.freeze([feedback('environment-pressure', 'resource-base', '环境约束', 'negative'), feedback('consumption', 'development', '需求拉动', 'positive')]),
    thresholds: Object.freeze([threshold('carrying-capacity', '承载力', 0.72), threshold('sustainability', '可持续性', 0.6)]),
  }),
  'sustainable-development': Object.freeze({
    title: '可持续发展',
    stocks: Object.freeze([stock('resource-base', '自然资本', 0.65), stock('economy', '经济', 0.6), stock('society', '社会', 0.55), stock('ecology', '生态', 0.5), stock('policy', '政策', 0.5)]),
    flows: Object.freeze([transfer('resource-base', 'economy', '资源投入', 'supply'), transfer('economy', 'society', '绿色转型', 'supply'), transfer('society', 'ecology', '治理反馈', 'emission')]),
    feedbacks: Object.freeze([feedback('economy', 'ecology', '增长-生态', 'negative'), feedback('policy', 'economy', '政策引导', 'positive')]),
    thresholds: Object.freeze([threshold('carbon-cap', '碳排上限', 0.68), threshold('equity-floor', '公平底线', 0.55)]),
  }),
  'natural-zonation': Object.freeze({
    title: '自然地带性',
    stocks: Object.freeze([stock('resource-base', '水热基础', 0.7), stock('heat', '热量', 0.65), stock('moisture', '水分', 0.6), stock('soil', '土壤', 0.55), stock('vegetation', '植被', 0.5)]),
    flows: Object.freeze([transfer('heat', 'vegetation', '纬度变化', 'supply'), transfer('moisture', 'vegetation', '海拔变化', 'supply'), transfer('soil', 'vegetation', '立地条件', 'supply')]),
    feedbacks: Object.freeze([feedback('vegetation', 'moisture', '水热-植被', 'negative')]),
    thresholds: Object.freeze([threshold('temperature', '温度阈值', 0.66), threshold('precipitation', '降水阈值', 0.62)]),
  }),
  'regional-resource': Object.freeze({
    title: '区域资源',
    stocks: Object.freeze([stock('resource-base', '资源禀赋', 0.7), stock('eco-fragility', '生态脆弱性', 0.45), stock('industry', '产业', 0.55), stock('governance', '治理', 0.5)]),
    flows: Object.freeze([transfer('resource-base', 'industry', '开发', 'supply'), transfer('industry', 'eco-fragility', '生态压力', 'emission'), transfer('governance', 'eco-fragility', '修复', 'supply')]),
    feedbacks: Object.freeze([feedback('eco-fragility', 'resource-base', '开发-退化', 'negative'), feedback('governance', 'resource-base', '治理恢复', 'positive')]),
    thresholds: Object.freeze([threshold('resource-floor', '资源量下限', 0.7), threshold('resilience', '恢复力', 0.58)]),
  }),
  'ecosystem-services': Object.freeze({
    title: '生态系统服务',
    stocks: Object.freeze([stock('resource-base', '生态本底', 0.72), stock('provisioning', '供给服务', 0.6), stock('regulating', '调节服务', 0.6), stock('cultural', '文化服务', 0.5), stock('supporting', '支撑服务', 0.65)]),
    flows: Object.freeze([transfer('resource-base', 'provisioning', '生态服务', 'supply'), transfer('resource-base', 'regulating', '调节服务', 'supply'), transfer('provisioning', 'cultural', '人类需求', 'demand')]),
    feedbacks: Object.freeze([feedback('provisioning', 'resource-base', '服务-需求', 'negative')]),
    thresholds: Object.freeze([threshold('service-value', '服务价值', 0.7), threshold('footprint', '生态足迹', 0.64)]),
  }),
  'resource-security': Object.freeze({
    title: '资源安全',
    stocks: Object.freeze([stock('resource-base', '资源基础', 0.75), stock('energy', '能源', 0.6), stock('farmland', '耕地', 0.6), stock('reserve', '储备', 0.5), stock('supply-chain', '供应链', 0.55)]),
    flows: Object.freeze([transfer('resource-base', 'energy', '开采', 'supply'), transfer('resource-base', 'farmland', '供给', 'supply'), transfer('energy', 'supply-chain', '调配', 'demand'), transfer('reserve', 'supply-chain', '储备缓冲', 'supply')]),
    feedbacks: Object.freeze([feedback('reserve', 'resource-base', '储备-风险', 'negative'), feedback('supply-chain', 'resource-base', '供应链风险', 'negative')]),
    thresholds: Object.freeze([threshold('self-sufficiency', '自给率', 0.68), threshold('reserve-level', '储备量', 0.6)]),
  }),
  'environmental-security': Object.freeze({
    title: '环境安全',
    stocks: Object.freeze([stock('resource-base', '环境容量', 0.6), stock('pollution-source', '污染源', 0.45), stock('eco-redline', '生态红线', 0.55), stock('climate-change', '气候变化', 0.4), stock('security', '安全', 0.5)]),
    flows: Object.freeze([transfer('pollution-source', 'resource-base', '风险传导', 'emission'), transfer('resource-base', 'security', '安全阈值', 'demand'), transfer('eco-redline', 'security', '生态修复', 'supply'), transfer('climate-change', 'security', '气候风险', 'emission')]),
    feedbacks: Object.freeze([feedback('pollution-source', 'resource-base', '污染-韧性', 'negative'), feedback('eco-redline', 'resource-base', '红线保护', 'positive')]),
    thresholds: Object.freeze([threshold('concentration-limit', '浓度限值', 0.66), threshold('resilience', '韧性', 0.58)]),
  }),
  'environmental-governance': Object.freeze({
    title: '环境治理',
    stocks: Object.freeze([stock('resource-base', '生态本底', 0.62), stock('policy-tool', '政策工具', 0.55), stock('enterprise', '企业', 0.5), stock('public', '公众', 0.5), stock('ecosystem', '生态系统', 0.6)]),
    flows: Object.freeze([transfer('policy-tool', 'enterprise', '规划', 'supply'), transfer('enterprise', 'ecosystem', '排放', 'emission'), transfer('public', 'enterprise', '监督', 'demand'), transfer('ecosystem', 'resource-base', '反馈', 'supply')]),
    feedbacks: Object.freeze([feedback('ecosystem', 'policy-tool', '治理-改善', 'positive'), feedback('enterprise', 'ecosystem', '排放-退化', 'negative')]),
    thresholds: Object.freeze([threshold('execution', '执行力', 0.62), threshold('coordination', '协同度', 0.56)]),
  }),
})

const NODE_RADIUS = 2.1
const NODE_BASE_Y = 0.62

function circularPositions(count) {
  const positions = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(angle) * NODE_RADIUS
    const y = NODE_BASE_Y + Math.sin(i * 2.4) * 0.1
    const z = Math.sin(angle) * NODE_RADIUS * 0.72
    positions.push([x, y, z])
  }
  return positions
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function flowWidth(weight, intensity) {
  const scale = 0.7 + clamp(intensity ?? 0.6, 0, 1) * 0.6
  return clamp(0.018 + weight * 0.07 * scale, 0.018, 0.14)
}

function resolveSpatialNodes(def, params) {
  if (def?.nodes?.length) return def.nodes
  const labels = params.nodes || ['要素一', '要素二', '要素三', '要素四']
  return labels.map((label, index) => node(`node-${index}`, label))
}

function resolveSpatialFlows(def, nodeDefs, params) {
  if (def?.flows?.length) return def.flows
  const labels = params.flows || ['联系']
  return nodeDefs.map((source, index) => {
    const target = nodeDefs[(index + 1) % nodeDefs.length]
    return flow(source.id, target.id, labels[index % labels.length], 0.8)
  })
}

export function getSpatialNetworkConfig(preset = {}) {
  const id = preset?.id || 'spatial-network'
  const params = preset?.params || {}
  const def = SPATIAL_NETWORK_DEFS[id]
  const intensity = params.intensity ?? 0.6

  const nodeDefs = resolveSpatialNodes(def, params)
  const flowDefs = resolveSpatialFlows(def, nodeDefs, params)
  const positions = circularPositions(nodeDefs.length)

  const nodes = nodeDefs.map((entry, index) => Object.freeze({
    id: entry.id,
    label: entry.label,
    position: Object.freeze(positions[index]),
  }))

  const flows = flowDefs.map((entry) => Object.freeze({
    from: entry.from,
    to: entry.to,
    label: entry.label,
    weight: entry.weight,
    width: flowWidth(entry.weight, intensity),
  }))

  return Object.freeze({
    id,
    kind: 'spatial-network',
    title: preset?.title || def?.title || '空间网络系统',
    subtitle: preset?.purpose || '核心要素、过程和空间关系',
    nodes: Object.freeze(nodes),
    flows: Object.freeze(flows),
    camera: Object.freeze({ preset: 'orbit' }),
    palette: SPATIAL_PALETTE,
    intensity,
  })
}

function resolveHumanStocks(def, params) {
  if (def?.stocks?.length) return def.stocks
  const labels = params.nodes || ['资源基础', '开发', '需求', '环境']
  return labels.map((label, index) => stock(index === 0 ? 'resource-base' : `stock-${index}`, label, 0.6))
}

function resolveHumanFlows(def, stocks) {
  if (def?.flows?.length) return def.flows
  return stocks.length > 1 ? [transfer(stocks[0].id, stocks[1].id, '资源流', 'supply')] : []
}

function resolveHumanFeedbacks(def, stocks) {
  if (def?.feedbacks?.length) return def.feedbacks
  return [feedback(stocks[0].id, stocks[0].id, '系统反馈', 'negative')]
}

function resolveHumanThresholds(def) {
  if (def?.thresholds?.length) return def.thresholds
  return [threshold('carrying-capacity', '承载力', 0.7)]
}

export function getHumanEnvironmentConfig(preset = {}) {
  const id = preset?.id || 'human-environment'
  const params = preset?.params || {}
  const def = HUMAN_ENVIRONMENT_DEFS[id]
  const pressure = params.pressure ?? 0.6
  const pressureScale = 0.7 + clamp(pressure, 0, 1) * 0.4

  const stockDefs = resolveHumanStocks(def, params)
  const stocks = stockDefs.map((entry, index) => Object.freeze({
    id: entry.id,
    label: entry.label,
    value: clamp(entry.value * pressureScale, 0.12, 1),
    index,
  }))

  const flows = resolveHumanFlows(def, stocks).map((entry) => Object.freeze({ ...entry }))
  const feedbacks = resolveHumanFeedbacks(def, stocks).map((entry) => Object.freeze({ ...entry }))
  const thresholds = resolveHumanThresholds(def).map((entry) => Object.freeze({ ...entry, pressure }))

  return Object.freeze({
    id,
    kind: 'human-environment',
    title: preset?.title || def?.title || '人地关系系统',
    subtitle: preset?.purpose || '资源存量、需求排放与系统反馈',
    stocks: Object.freeze(stocks),
    flows: Object.freeze(flows),
    feedbacks: Object.freeze(feedbacks),
    thresholds: Object.freeze(thresholds),
    camera: Object.freeze({ preset: 'orbit' }),
    pressure,
  })
}

export const spatialNetworkPresetIds = Object.freeze(Object.keys(SPATIAL_NETWORK_DEFS))
export const humanEnvironmentPresetIds = Object.freeze(Object.keys(HUMAN_ENVIRONMENT_DEFS))
