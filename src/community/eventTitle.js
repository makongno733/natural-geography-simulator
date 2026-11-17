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
