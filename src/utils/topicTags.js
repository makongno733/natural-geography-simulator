/**
 * 地理共同体 · 话题标签规范化与确定性结构化推导系统
 * 覆盖三类首页话题：
 * 1. 社区讨论（Community Posts）：复用已有 tags、学科分区、关联 3D 实验、探究证据卡、繁星课题、论文 DOI。
 * 2. 近期地理事件（NASA EONET / USGS）：基于来源机构、灾害/事件分类、已核实的国家/海区地名规则推导，绝不臆造未证实的地域或结论。
 * 3. 精选/检索学术论文（Crossref DOI / Curated Papers）：基于文献类型、研究方向、发表期刊或明确的方法/数据集关键词推导。
 */

const TAG_SYNONYM_MAP = {
  dem: 'DEM高程',
  'dem高程': 'DEM高程',
  '数字高程模型': 'DEM高程',
  era5: 'ERA5再分析',
  '遥感影像': '卫星遥感',
  '多时相遥感': '多时相遥感',
  '遥感': '卫星遥感',
  '内涝': '城市内涝',
  '城市内涝': '城市内涝',
  '海绵城市': '海绵城市',
  '热岛': '城市热岛',
  '城市热岛': '城市热岛',
  '热力环流': '热力环流',
  '海陆风': '海陆风',
  '山谷风': '山谷风',
  '喀斯特': '喀斯特地貌',
  '喀斯特地貌': '喀斯特地貌',
  '正午太阳高度': '正午太阳高度',
  '太阳高度': '正午太阳高度',
  '地球运动': '地球运动',
  'doi论文': 'DOI文献',
  'doi文献': 'DOI文献',
  '文献研读': '文献研读'
}

const EXPERIMENT_TAG_MAP = {
  'solar-motion': { label: '正午太阳高度实验', dimension: 'method' },
  seasons: { label: '四季公转模拟', dimension: 'method' },
  'fault-model': { label: '褶皱断层构造模型', dimension: 'method' },
  'thermal-circulation': { label: '热力环流动力学', dimension: 'method' },
  'water-cycle-3d': { label: '三维水循环模拟', dimension: 'method' },
  'moon-phases': { label: '月相空间几何', dimension: 'method' },
  'earth-system': { label: '地球内部圈层', dimension: 'method' },
  'stream-table': { label: '流水侵蚀水槽实验', dimension: 'method' }
}

const EVIDENCE_TAG_MAP = {
  'ev-urban-sponge': { label: '暴雨径流对照证据', dimension: 'method' },
  'ev-satellite-east-asia': { label: 'MODIS多时相遥感', dimension: 'method' },
  'ev-solar-motion-solstice': { label: '二至日太阳高度对照', dimension: 'method' },
  'ev-thermal-circulation': { label: '海陆热力环流证据', dimension: 'method' }
}

const EVENT_DISCIPLINE_MAP = {
  '地震': { discipline: '构造地质与地震', eventType: '地震监测' },
  '火山活动': { discipline: '岩石圈与火山作用', eventType: '火山活动' },
  '强风暴': { discipline: '大气环流与热带气旋', eventType: '热带气旋/风暴' },
  '野火': { discipline: '陆地生态与野火监测', eventType: '野火遥感' },
  '洪水': { discipline: '陆地水文与洪涝', eventType: '洪涝过程' },
  '滑坡': { discipline: '地貌演化与地质灾害', eventType: '滑坡泥石流' },
  '干旱': { discipline: '水循环与气候异常', eventType: '干旱监测' },
  '沙尘与霾': { discipline: '大气成分与沙尘输送', eventType: '沙尘气溶胶' },
  '海湖冰': { discipline: '冰冻圈与海冰变化', eventType: '海冰/冰山' },
  '降雪': { discipline: '天气系统与寒潮降雪', eventType: '极端降雪' },
  '极端气温': { discipline: '气候变化与极端天气', eventType: '极端气温' },
  '水色变化': { discipline: '海洋与湖泊水色遥感', eventType: '水色遥感' }
}

const VERIFIED_REGION_RULES = [
  { pattern: /Solomon Islands|所罗门群岛/i, tag: '所罗门群岛', belt: '环太平洋地震带' },
  { pattern: /Papua New Guinea|巴布亚新几内亚/i, tag: '巴布亚新几内亚', belt: '环太平洋地震带' },
  { pattern: /New Zealand|新西兰/i, tag: '新西兰', belt: '西南太平洋' },
  { pattern: /Philippines|菲律宾/i, tag: '菲律宾', belt: '西北太平洋' },
  { pattern: /Indonesia|印度尼西亚/i, tag: '印度尼西亚', belt: '巽他弧构造带' },
  { pattern: /Vanuatu|瓦努阿图/i, tag: '瓦努阿图', belt: '西南太平洋' },
  { pattern: /Japan|日本/i, tag: '日本列岛', belt: '西北太平洋' },
  { pattern: /Tonga|汤加/i, tag: '汤加', belt: '西南太平洋' },
  { pattern: /Fiji|斐济/i, tag: '斐济群岛', belt: '西南太平洋' },
  { pattern: /Chile|智利/i, tag: '智利', belt: '安第斯俯冲带' },
  { pattern: /Peru|秘鲁/i, tag: '秘鲁', belt: '东太平洋沿岸' },
  { pattern: /Mexico|墨西哥/i, tag: '墨西哥', belt: '中美洲构造带' },
  { pattern: /Kamchatka|勘察加/i, tag: '勘察加半岛', belt: '西北太平洋' },
  { pattern: /Alaska|阿拉斯加/i, tag: '阿拉斯加', belt: '北太平洋构造带' },
  { pattern: /California|加利福尼亚|,\s*CA\b/i, tag: '美国加州', belt: '北美西海岸' },
  { pattern: /Hawaii|夏威夷/i, tag: '夏威夷群岛', belt: '中太平洋热点' },
  { pattern: /Iceland|冰岛/i, tag: '冰岛', belt: '大西洋中脊' },
  { pattern: /Taiwan|中国台湾/i, tag: '中国台湾', belt: '西太平洋岛弧' },
  { pattern: /青藏高原|藏东南|喜马拉雅|珠峰|珠穆朗玛/i, tag: '青藏高原', belt: null },
  { pattern: /徐州|潘安湖|九里湖/i, tag: '徐州转型区', belt: null },
  { pattern: /江淮|长江中下游|鄱阳湖|洞庭湖|长三角/i, tag: '长江中下游', belt: null },
  { pattern: /黄土高原|渭河/i, tag: '黄土高原', belt: null },
  { pattern: /北京(?!时间)/i, tag: '北京', belt: null },
  { pattern: /华北/i, tag: '华北地区', belt: null }
]

/**
 * 规范化单个标签名称：去首尾空格、去掉前导 #、合并同义词、限制合理显示长度
 */
export function normalizeTopicTagName(raw) {
  if (!raw || typeof raw !== 'string') return ''
  const cleaned = raw
    .trim()
    .replace(/^[#＃]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return ''
  const lower = cleaned.toLowerCase()
  if (TAG_SYNONYM_MAP[lower]) {
    return TAG_SYNONYM_MAP[lower]
  }
  return cleaned.length > 18 ? `${cleaned.slice(0, 17)}…` : cleaned
}

/**
 * 去重并规范化标签对象数组
 */
export function dedupeStructuredTags(tagItems, maxCount = 6) {
  const seen = new Set()
  const result = []
  for (const item of tagItems) {
    if (!item) continue
    const rawLabel = typeof item === 'string' ? item : item.label
    const label = normalizeTopicTagName(rawLabel)
    if (!label) continue
    const key = label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push({
      label,
      query: (typeof item === 'object' && item.query) ? String(item.query).trim() : label,
      dimension: (typeof item === 'object' && item.dimension) ? item.dimension : 'topic',
      title: (typeof item === 'object' && item.title) ? item.title : `按标签「${label}」筛选相关内容`
    })
    if (result.length >= maxCount) break
  }
  return result
}

/**
 * 1. 为社区讨论帖子生成有意义的结构化标签
 */
export function derivePostTags(post = {}) {
  const rawList = []

  // (a) 优先复用用户填写的已有标签
  if (Array.isArray(post.tags)) {
    for (const t of post.tags) {
      rawList.push({ label: t, query: t, dimension: 'topic' })
    }
  }

  // (b) 关联的 3D 实验或科学证据卡（研究方法维度）
  const expKey = post.linkedExperiment || post.linked_experiment
  if (expKey && EXPERIMENT_TAG_MAP[expKey]) {
    rawList.push({
      label: EXPERIMENT_TAG_MAP[expKey].label,
      query: EXPERIMENT_TAG_MAP[expKey].label.replace(/实验|模拟|模型|动力学/g, ''),
      dimension: 'method'
    })
  }
  if (post.evidenceId && EVIDENCE_TAG_MAP[post.evidenceId]) {
    rawList.push({
      label: EVIDENCE_TAG_MAP[post.evidenceId].label,
      query: EVIDENCE_TAG_MAP[post.evidenceId].label.replace(/证据|对照/g, ''),
      dimension: 'method'
    })
  }

  // (c) 标题与摘要中明确出现的已核实地理区域（不凭空猜测）
  const textSample = `${post.title || ''} ${post.excerpt || ''} ${post.body || ''}`
  for (const rule of VERIFIED_REGION_RULES) {
    if (rule.pattern.test(textSample)) {
      rawList.push({ label: rule.tag, query: rule.tag, dimension: 'region' })
      break
    }
  }

  // (d) 若标签仍不足 2 个，从标题核心地理术语中保守提取，而非贴泛化标签
  if (rawList.length < 2) {
    const keywordRules = [
      { re: /城市内涝|透水铺装|海绵城市|径流/i, label: '城市水文与内涝', query: '城市内涝', dimension: 'discipline' },
      { re: /热力环流|海陆风|山谷风|热岛/i, label: '大气热力环流', query: '热力环流', dimension: 'discipline' },
      { re: /太阳高度|昼夜长短|夏至|冬至|视运动/i, label: '地球运动与采光', query: '正午太阳高度', dimension: 'discipline' },
      { re: /DEM|遥感|MODIS|Landsat|水文连通/i, label: '遥感与空间分析', query: 'DEM', dimension: 'method' },
      { re: /流水地貌|冲积扇|牛轭湖|侵蚀/i, label: '河流地貌演化', query: '流水地貌', dimension: 'discipline' },
      { re: /背斜|向斜|断层|褶皱|板块/i, label: '构造地质与地貌', query: '断层', dimension: 'discipline' },
      { re: /厄尔尼诺|副热带高压|梅雨|季风/i, label: '海气耦合与季风', query: '季风', dimension: 'discipline' }
    ]
    for (const kr of keywordRules) {
      if (kr.re.test(textSample)) {
        rawList.push({ label: kr.label, query: kr.query, dimension: kr.dimension })
      }
    }
  }

  return dedupeStructuredTags(rawList, 6)
}

/**
 * 2. 为近期地理事件（NASA EONET / USGS）生成结构化标签（事件类型、学科方向、确证地域、监测方法）
 */
export function deriveHotTopicTags(topic = {}) {
  const rawList = []
  const rawCategory = String(topic.tag || topic.category || '自然地理事件').trim()
  // Generated summaries contain display timezones and discussion prompts, not verified locations.
  const placeText = `${topic.title || ''} ${topic.location || ''} ${topic.place || ''}`

  // (a) 事件类型与学科方向
  const mapped = EVENT_DISCIPLINE_MAP[rawCategory]
  if (mapped) {
    rawList.push({ label: mapped.eventType, query: rawCategory, dimension: 'event' })
    rawList.push({ label: mapped.discipline, query: rawCategory, dimension: 'discipline' })
  } else {
    rawList.push({ label: rawCategory, query: rawCategory, dimension: 'event' })
  }

  // (b) 仅当标题或原文中存在明确地名/震级特征时提取地域与强度标签
  const magMatch = String(topic.title || '').match(/\bM(\d+(?:\.\d+)?)\b/i)
  if (magMatch) {
    const mag = Number(magMatch[1])
    if (mag >= 7.0) {
      rawList.push({ label: `M${mag.toFixed(1)} 强震监测`, query: '地震', dimension: 'event' })
    } else if (mag >= 6.0) {
      rawList.push({ label: `M${mag.toFixed(1)} 显著地震`, query: '地震', dimension: 'event' })
    }
  }

  for (const rule of VERIFIED_REGION_RULES) {
    if (rule.pattern.test(placeText)) {
      rawList.push({ label: rule.tag, query: rule.tag, dimension: 'region' })
      break
    }
  }

  // (c) 观测与数据来源方法
  const isUsgs = String(topic.sourceUrl || '').includes('usgs.gov') || String(topic.id || '').includes('usgs')
  rawList.push({
    label: isUsgs ? 'USGS地震台网测报' : 'NASA EONET事件记录',
    query: isUsgs ? '地震' : 'NASA EONET',
    dimension: 'method'
  })

  return dedupeStructuredTags(rawList, 6)
}

/**
 * 3. 为学术论文（Crossref DOI / 精选课题文献）生成结构化标签（学科方向、研究方法/数据源、研究地域、文献类型）
 * 严格基于论文真实标题、topic 字段与期刊信息推导，绝不凭空编造结论或地域
 */
export function derivePaperTags(paper = {}) {
  const rawList = []
  const text = `${paper.title || ''} ${paper.topic || ''} ${paper.journal || ''} ${paper.note || ''}`

  // (a) 已有明确 topic 方向
  if (paper.topic) {
    rawList.push({ label: paper.topic, query: paper.topic, dimension: 'discipline' })
  }

  // (b) 从真实标题/说明中识别研究方法或数据集
  const methodRules = [
    { re: /\bCLCD\b|30\s*m\s+annual\s+land\s+cover/i, label: 'CLCD 30m数据集', query: '土地覆盖', dimension: 'method' },
    { re: /\bLandsat\b/i, label: 'Landsat遥感序列', query: '遥感', dimension: 'method' },
    { re: /\bMODIS\b/i, label: 'MODIS卫星观测', query: '遥感', dimension: 'method' },
    { re: /blue-green\s+space|cooling\s+effect|threshold-size/i, label: '蓝绿空间降温阈值', query: '城市热岛', dimension: 'method' },
    { re: /urban\s+heat\s+island|energetic\s+basis/i, label: '地表能量平衡', query: '热力环流', dimension: 'method' },
    { re: /Sponge\s+City|LID|SUDS|urban\s+drainage|runoff/i, label: 'LID雨洪产流控制', query: '海绵城市', dimension: 'method' },
    { re: /\bDEM\b|elevation|topograph/i, label: '数字高程地形分析', query: 'DEM', dimension: 'method' }
  ]
  for (const mr of methodRules) {
    if (mr.re.test(text)) {
      rawList.push({ label: mr.label, query: mr.query, dimension: mr.dimension })
    }
  }

  // (c) 仅当论文标题中明确出现国家/区域时标注地域（如 "in China"）
  if (/\bChina\b|中国/i.test(text)) {
    rawList.push({ label: '中国区域研究', query: '中国地理', dimension: 'region' })
  }

  // (d) 关联繁星课题标签
  if (paper.projectId === 'xuzhou-land-cover') {
    rawList.push({ label: '关联：徐州土地覆盖课题', query: '徐州', dimension: 'topic' })
  } else if (paper.projectId === 'city-heat') {
    rawList.push({ label: '关联：城市热环境课题', query: '城市热岛', dimension: 'topic' })
  } else if (paper.projectId === 'sponge-city-runoff') {
    rawList.push({ label: '关联：海绵城市产流课题', query: '海绵城市', dimension: 'topic' })
  }

  // (e) 文献类型标签
  const typeLabel = paper.workTypeLabel
    ? String(paper.workTypeLabel).replace(/（.*?）/g, '').trim()
    : 'DOI期刊论文'
  rawList.push({ label: typeLabel, query: 'DOI', dimension: 'type' })

  return dedupeStructuredTags(rawList, 6)
}
