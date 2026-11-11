export const STANDARD_EVIDENCES = [
  {
    id: 'ev-poyang-winter',
    taskId: 'landscape-variation',
    taskTitle: '鄱阳湖水文与遥感资料核对',
    title: '鄱阳湖枯水期水面与水位资料（待核实示例）',
    category: '遥感解译与水文观测',
    evidenceType: 'observation',
    provenance: {
      status: 'unverified',
      sources: [],
      timeBasis: '',
      method: '',
      note: '原卡片没有影像记录、观测年份、水体提取方法或水位高程基准，无法核实其观测数值。当前链接为教学情境推演台，不是该记录的原始来源。'
    },
    facts: '资料待核实，不能作为真实观测证据或课堂事实引用。请补齐同一时段的影像来源、水体范围定义、提取方法及水位站记录。',
    route: '/inquiry?task=landscape-variation'
  },
  {
    id: 'ev-urban-sponge',
    taskId: 'urban-flood',
    taskTitle: '城市内涝机制与海绵城市方案探究',
    title: '透水铺装与绿地径流对比（仿真探究示例）',
    category: '地表水文动力学仿真',
    evidenceType: 'simulation',
    provenance: {
      status: 'unverified',
      sources: [],
      timeBasis: '',
      method: '',
      note: '原卡片没有工程监测出处，也未关联模型版本、参数或运行记录。目录中的数值不能归因于本站模型计算，更不能描述为现场实测或工程成效。'
    },
    facts: '仅为仿真探究主题示例，尚无可复现结果。请实际运行模型并记录版本、输入条件、输出与适用范围；模型结果不等同于真实城市效果。',
    route: '/inquiry?task=urban-flood'
  },
  {
    id: 'ev-thermal-circulation',
    taskId: 'thermal-cell',
    taskTitle: '局地受热不均与热力环流风场演化',
    title: '冷热下垫面与气流方向（仿真探究示例）',
    category: '大气动力学实验',
    evidenceType: 'simulation',
    provenance: {
      status: 'unverified',
      sources: [],
      timeBasis: '',
      method: '',
      note: '原卡片没有测量仪器、地点、日期或方法。站内热力环流模型为示意动画，未提供该高度、风速的实测记录，也不能据此认定严格线性关系。'
    },
    facts: '仅用于在教学示意中比较冷热配置与气流方向，不提供真实风速或气压梯度测量，也不代表一次已执行的实验。',
    route: '/experiments/meteorology/thermal-circulation'
  }
]

export function getEvidenceById(id) {
  if (!id) return null
  return STANDARD_EVIDENCES.find(e => e.id === id) || null
}

export function describeEvidence(evidence) {
  if (!evidence) return {
    label: '附件资料待核实',
    notice: '旧帖保留了附件 ID，但当前目录无法识别其资料与来源；不视为实测证据。',
    sources: [],
    sourceLinked: false
  }
  const provenance = evidence.provenance
  const sources = (Array.isArray(provenance?.sources) ? provenance.sources : []).filter(source => {
    try {
      const url = new URL(source.url)
      return typeof source.title === 'string' && source.title.trim() && url.protocol === 'https:' && !url.username && !url.password
    } catch {
      return false
    }
  })
  const sourceLinked = ['observation', 'simulation'].includes(evidence.evidenceType) &&
    provenance?.status === 'source-linked' && sources.length > 0 &&
    typeof provenance.timeBasis === 'string' && provenance.timeBasis.trim() &&
    typeof provenance.method === 'string' && provenance.method.trim()
  if (evidence.evidenceType === 'simulation') return {
    label: sourceLinked ? '有记录的仿真 · 非实测' : '仿真示例 · 结果待核实',
    notice: provenance?.note || '模型记录不等于现场观测或真实教学、工程成效。',
    sources,
    sourceLinked: Boolean(sourceLinked)
  }
  return {
    label: sourceLinked ? '有出处的来源记录 · 未经人工核验' : '观测示例 · 来源待核实',
    notice: provenance?.note || (sourceLinked ? '资料有来源、时间及方法记录，但不代表平台已完成人工核验。' : '缺少完整来源、时间基线或方法，不作为已核验事实。'),
    sources,
    sourceLinked: Boolean(sourceLinked)
  }
}
