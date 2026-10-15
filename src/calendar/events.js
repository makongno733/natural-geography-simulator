// 这些时段用于教学观察规划，不是天气、地震或景观出现的预报。
const seasonalWindows = [
  ['一月 · 冰雪与冻土', '北方可观察河湖封冻、积雪覆盖与冻融迹象；不同纬度、海拔差异很大。', '北方'],
  ['二月 · 冬末物候', '记录当地昼长、气温与植物萌动的变化；以实地观察为准。', '各地'],
  ['三月 · 春季物候', '比较不同地区开花和返青时间，讨论纬度与地形影响。', '各地'],
  ['四月 · 春季水文', '观察降水、融雪与河流水位的季节联系；不要接近危险河段。', '各地'],
  ['五月 · 植被与热量', '比较山地垂直带与平原物候；具体观赏日期取决于当年天气。', '山地及平原'],
  ['六月 · 夏季降水', '记录当地降水过程和云系，不将气候常态当作具体天气预报。', '各地'],
  ['七月 · 河流与地貌', '可用公开水文和遥感影像观察汛期地表变化；避免涉水。', '各地'],
  ['八月 · 夜空与季风', '比较城市与郊外光污染，并留意云量对观星的影响。', '各地'],
  ['九月 · 秋季物候', '记录落叶、农作物成熟和昼夜长短变化。', '各地'],
  ['十月 · 秋色与海拔', '比较不同海拔、纬度的叶色变化；并非每地同日出现。', '各地'],
  ['十一月 · 初冬观察', '观察霜冻、晨雾与气温变化；出现与否取决于当地条件。', '各地'],
  ['十二月 · 冬至前后', '用正午影长和日出方位记录季节变化。', '各地']
]

const SHOWER_SOURCE = 'https://www.timeanddate.com/astronomy/meteor-shower/list.html'
const NASA_ECLIPSE = 'https://eclipse.gsfc.nasa.gov/OH/OH2027.html'

export const astronomyEvents = [
  ['2026-10-21', '猎户座流星雨极大前后', '全国多数地区有观测机会；月光、云量与光污染会影响实际可见数量。', SHOWER_SOURCE],
  ['2026-11-17', '狮子座流星雨极大前后', '通常宜在后半夜观察；各地实际条件请临近日期再核对。', SHOWER_SOURCE],
  ['2026-12-14', '双子座流星雨极大前后', '北半球常见年度流星雨；具体高峰时刻和天气需临近核对。', SHOWER_SOURCE],
  ['2027-01-04', '象限仪座流星雨极大前后', '北方更适合观测；日期按年度预报粗略标记，精确时段需核对。', 'https://www.timeanddate.com/astronomy/meteor-shower/quadrantids.html'],
  ['2027-02-21', '半影月食（北京时间清晨）', 'NASA 预报全球有半影月食；中国能否看见取决于本地月落时间，半影变化也较难察觉。', NASA_ECLIPSE],
  ['2027-04-22', '天琴座流星雨极大前后', '全国多数地区可尝试在夜间观测；以年度预报和临近天气为准。', SHOWER_SOURCE],
  ['2027-05-06', '宝瓶座 η 流星雨极大前后', '南方通常更有利；需在临近日期核对极大时刻。', SHOWER_SOURCE],
  ['2027-08-13', '英仙座流星雨极大前后', '北半球适合观测；月光和天气可能改变实际效果。', SHOWER_SOURCE]
].map(([date, title, description, sourceUrl], index) => ({
  id: `sky-${index}`,
  date,
  title,
  description,
  sourceUrl,
  sourceName: sourceUrl === NASA_ECLIPSE ? 'NASA GSFC' : 'timeanddate 天文日历',
  type: 'astronomy',
  status: '预测',
  region: '中国部分地区至全国，按事件说明'
}))

export function seasonalEvents(year) {
  return seasonalWindows.map(([title, description, region], index) => ({
    id: `season-${year}-${index + 1}`,
    date: `${year}-${String(index + 1).padStart(2, '0')}-01`,
    title,
    description,
    sourceUrl: '',
    sourceName: '教学观察建议',
    type: 'season',
    status: '典型观察时段',
    region,
    wholeMonth: true
  }))
}

const chinaDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
})

export function toChinaDate(timestamp) {
  return chinaDate.format(new Date(timestamp))
}

export function normalizeQuakes(payload) {
  return (payload?.earthquakes || []).filter(event =>
    event && /^https:\/\/earthquake\.usgs\.gov\//.test(event.sourceUrl) &&
    Number.isFinite(event.magnitude) && !Number.isNaN(Date.parse(event.occurredAt))
  ).map(event => ({
    id: event.id,
    date: toChinaDate(event.occurredAt),
    title: `M ${event.magnitude.toFixed(1)} 地震 · ${event.place}`,
    description: `震中 ${event.latitude.toFixed(2)}°N, ${event.longitude.toFixed(2)}°E；震源深度 ${event.depthKm ?? '未提供'} km。位置和震级可能由数据源修订。`,
    sourceUrl: event.sourceUrl,
    sourceName: '美国地质调查局 USGS',
    type: 'earthquake',
    status: '已发生',
    region: '中国地区（按 USGS 地名）',
    time: new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(event.occurredAt))
  }))
}
