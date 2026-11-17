const eventTypes = [
  [/^Super Typhoon\s+(.+)$/i, '超强台风 ·'],
  [/^Tropical Storm\s+(.+)$/i, '热带风暴 ·'],
  [/^Tropical Cyclone\s+(.+)$/i, '热带气旋 ·'],
  [/^Typhoon\s+(.+)$/i, '台风 ·'],
  [/^Hurricane\s+(.+)$/i, '飓风 ·'],
  [/^Storm\s+(.+)$/i, '风暴 ·'],
  [/^Iceberg\s+(.+)$/i, '冰山 ·'],
  [/^Wildfire\s+(.+)$/i, '野火 ·'],
  [/^Prescribed Fire\s+(.+)$/i, '计划烧除 ·'],
  [/^Volcano\s+(.+)$/i, '火山活动 ·'],
]

const COMPASS_MAP = {
  N: '正北',
  S: '正南',
  E: '正东',
  W: '正西',
  NE: '东北',
  NW: '西北',
  SE: '东南',
  SW: '西南',
  NNE: '北东北',
  ENE: '东东北',
  ESE: '东东南',
  SSE: '南东南',
  SSW: '南西南',
  WSW: '西南偏西',
  WNW: '西北偏西',
  NNW: '北西北',
}

const REGION_MAP = {
  'Solomon Islands': '所罗门群岛',
  'Papua New Guinea': '巴布亚新几内亚',
  'New Zealand': '新西兰',
  'Philippines': '菲律宾',
  'Indonesia': '印度尼西亚',
  'Vanuatu': '瓦努阿图',
  'Japan': '日本',
  'Tonga': '汤加',
  'Fiji': '斐济',
  'Chile': '智利',
  'Peru': '秘鲁',
  'Mexico': '墨西哥',
  'Russia': '俄罗斯',
  'Alaska': '美国阿拉斯加',
  'California': '美国加利福尼亚',
  'Taiwan': '中国台湾',
  'China': '中国',
  'Iceland': '冰岛',
  'Greece': '希腊',
  'Turkey': '土耳其',
  'United States': '美国',
  'Canada': '加拿大',
  'Australia': '澳大利亚',
  'Brazil': '巴西',
  'Hawaii': '美国夏威夷',
  'Kamchatka': '勘察加半岛'
}

function localizePlace(rawPlace) {
  const parts = rawPlace.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const region = parts[parts.length - 1]
    const localPlace = parts.slice(0, -1).join(', ')
    if (REGION_MAP[region]) {
      return `${REGION_MAP[region]} ${localPlace}`
    }
  }
  if (REGION_MAP[rawPlace.trim()]) {
    return REGION_MAP[rawPlace.trim()]
  }
  return rawPlace.trim()
}

export function eventDisplayTitle(title) {
  if (!title || typeof title !== 'string') return title || ''

  for (const [pattern, label] of eventTypes) {
    const match = title.match(pattern)
    if (match) return `${label} ${match[1]}`
  }

  // Match USGS earthquake titles like: "M6.4 地震 · 30 km WSW of Lata, Solomon Islands"
  const eqMatch = title.match(/^(M[\d.]+\s*地震\s*·\s*)(\d+)\s*km\s+([NESW]{1,3})\s+of\s+(.+)$/i)
  if (eqMatch) {
    const [, prefix, dist, dirRaw, placeRaw] = eqMatch
    const dir = COMPASS_MAP[dirRaw.toUpperCase()] || dirRaw
    const place = localizePlace(placeRaw)
    return `${place}${dir}约 ${dist} 公里 · ${prefix.replace(/\s*·\s*$/, '')}`
  }

  return title
}

/**
 * 格式化带明确时区的日期时间字符串（默认展示北京时间 UTC+8 并附注 UTC，避免裸露 ISO/UTC 字符串）
 */
export function formatEventTimeWithTz(isoValue) {
  if (!isoValue) return '时间待核实'
  const date = new Date(isoValue)
  if (Number.isNaN(date.getTime())) return '时间待核实'
  try {
    const cnText = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
    return `${cnText}（北京时间 UTC+8）`
  } catch {
    return date.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
  }
}

/**
 * 清理事件摘要中裸露的长链接（如 NASA EONET / GDACS URL）和原始 UTC 字符串
 */
export function cleanEventSummary(rawSummary, topic = {}) {
  const category = topic.tag || topic.category || '自然地理事件'
  if (!rawSummary || typeof rawSummary !== 'string') {
    return `来自国际对地观测与地质监测机构的${category}记录，位置与强度可能随监测更新而修订。`
  }

  // 移除裸露的 http(s):// 长链接
  let text = rawSummary
    .replace(/https?:\/\/[^\s)）]+/gi, '')
    .replace(/\(\s*\)/g, '')
    .trim()

  // 将 "2026-11-16 14:00 UTC" 之类原始 UTC 字符串替换为易读中文时间说明
  text = text.replace(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})(?::\d{2})?\s*UTC/gi, (_m, d, t) => {
    const iso = `${d}T${t}:00Z`
    return formatEventTimeWithTz(iso)
  })

  // 如果原本整条摘要只是一个 URL（被清空后为空或过短），生成清晰可读的中文说明
  if (text.length < 8) {
    return `官方机构收录的${category}监测记录；事件影响范围与强度可能随最新观测修订，可点击下方链接核对原始数据。`
  }

  return text
}

/**
 * 提取容易扫读的事件地点说明
 */
export function extractEventPlace(topic = {}) {
  const title = String(topic.title || '')
  const eqMatch = title.match(/(\d+)\s*km\s+([NESW]{1,3})\s+of\s+(.+)$/i)
  if (eqMatch) {
    const [, dist, dirRaw, placeRaw] = eqMatch
    const dir = COMPASS_MAP[dirRaw.toUpperCase()] || dirRaw
    return `${localizePlace(placeRaw)}${dir}约 ${dist} 公里`
  }
  for (const [en, zh] of Object.entries(REGION_MAP)) {
    if (title.toLowerCase().includes(en.toLowerCase())) {
      return `${zh}及周边区域`
    }
  }
  const tag = topic.tag || topic.category || ''
  if (tag.includes('风暴') || tag.includes('台风')) return '热带/副热带洋面与沿岸（详见原始轨迹）'
  if (tag.includes('冰')) return '高纬极地海域（详见卫星坐标）'
  return '全球遥感/台网监测区（详见原始记录坐标）'
}

/**
 * 根据事件类型生成引导学生思考的可讨论地理问题
 */
export function buildEventDiscussionQuestion(topic = {}) {
  const tag = String(topic.tag || topic.category || topic.title || '')
  if (tag.includes('地震') || /^M\d/i.test(tag)) {
    return '可讨论问题：这次地震位于哪条板块边界附近？震级与震源深度对周边地形和聚落安全意味着什么？'
  }
  if (tag.includes('风暴') || tag.includes('台风') || tag.includes('气旋')) {
    return '可讨论问题：该气旋生成于哪片温暖洋面？海表温度、地转偏向力与副热带高压如何影响它的路径？'
  }
  if (tag.includes('火山')) {
    return '可讨论问题：该火山处于怎样的板块构造环境？火山灰与气溶胶会如何影响局地大气受热过程？'
  }
  if (tag.includes('野火') || tag.includes('火')) {
    return '可讨论问题：近期当地的气温、降水与风向条件如何促使野火蔓延？燃烧对局地碳循环与水土保持有何影响？'
  }
  if (tag.includes('洪水') || tag.includes('内涝')) {
    return '可讨论问题：强降水、地形汇流与地表下渗条件在这场洪水中分别起了什么作用？'
  }
  return '可讨论问题：这一自然地理事件反映了哪些圈层之间的相互作用？还需要哪些观测数据进一步核实？'
}

/**
 * 区分“来源事件线索”、“编辑选题”或“用户讨论”的易懂标签
 */
export function getEventOriginBadge(topic = {}) {
  if (topic.postId) {
    return { label: '💬 已开启社区讨论', type: 'discussion' }
  }
  if (topic.isEditorial) {
    return { label: '📌 编辑精选选题', type: 'editorial' }
  }
  const src = String(topic.sourceUrl || '').includes('usgs.gov')
    ? 'USGS 地震台网线索'
    : 'NASA EONET 遥感事件线索'
  return { label: `📡 ${src}`, type: 'clue' }
}
