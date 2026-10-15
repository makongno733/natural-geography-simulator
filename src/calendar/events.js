// 这些时段用于教学观察规划，不是天气、地震或景观出现的预报。
const seasonalWindows = [
  ['一月 · 冰雪与冻土', '北方可观察河湖封冻、积雪覆盖与冻融迹象；不同纬度、海拔差异很大。', '北方', '同一条河，冬天可能在上游仍流动、在低温河段结冰。沿着地图寻找纬度与海拔的变化，就能读懂这幅冰雪拼图。'],
  ['二月 · 冬末物候', '记录当地昼长、气温与植物萌动的变化；以实地观察为准。', '各地', '冬天还没有完全离开，白昼却已经慢慢变长。试着每周在同一时间拍下一棵树，留意枝条最先出现的变化。'],
  ['三月 · 春季物候', '比较不同地区开花和返青时间，讨论纬度与地形影响。', '各地', '一朵花的开放时间，也是一张气候地图。把不同城市的观察日期放在一起，看看春天如何随纬度和海拔移动。'],
  ['四月 · 春季水文', '观察降水、融雪与河流水位的季节联系；不要接近危险河段。', '各地', '春天的河流可能同时接收雨水和融雪。隔着安全距离比较水位照片，再查当天降水，追问河水从哪里来。'],
  ['五月 · 植被与热量', '比较山地垂直带与平原物候；具体观赏日期取决于当年天气。', '山地及平原', '从山脚走到山顶，温度和植被可能像换了季节。用公开照片比较同一天的山地与平原，寻找这种差别。'],
  ['六月 · 夏季降水', '记录当地降水过程和云系，不将气候常态当作具体天气预报。', '各地', '云从哪里来，雨又落在哪里？把一周的云图和雨量记录排在一起，观察夏季大气的移动。'],
  ['七月 · 河流与地貌', '可用公开水文和遥感影像观察汛期地表变化；避免涉水。', '各地', '一次涨水会改变河岸的样子。找同一河段不同日期的公开影像，比较水面和沙洲的边界。'],
  ['八月 · 夜空与季风', '比较城市与郊外光污染，并留意云量对观星的影响。', '各地', '同一片夜空，在城市和郊外呈现不同亮度。先看云量，再比较光污染，理解为什么“能看见”不只由天象决定。'],
  ['九月 · 秋季物候', '记录落叶、农作物成熟和昼夜长短变化。', '各地', '当白昼缩短，田野和树木会留下季节的线索。挑一处熟悉的地点，每周记录一次颜色与日照。'],
  ['十月 · 秋色与海拔', '比较不同海拔、纬度的叶色变化；并非每地同日出现。', '各地', '山顶和山脚的树叶不一定同时变色。把两处的照片与海拔放在一起，试着解释这段“秋色时差”。'],
  ['十一月 · 初冬观察', '观察霜冻、晨雾与气温变化；出现与否取决于当地条件。', '各地', '某个清晨有霜，隔天却没有。比较夜间最低气温、湿度和云量，找出变化的线索。'],
  ['十二月 · 冬至前后', '用正午影长和日出方位记录季节变化。', '各地', '同一根竖直的杆子，正午影子会随季节伸缩。连续测量几天，就能把地球公转画在地面上。']
]

const SHOWER_SOURCE = 'https://www.timeanddate.com/astronomy/meteor-shower/list.html'
const NASA_ECLIPSE = 'https://eclipse.gsfc.nasa.gov/OH/OH2027.html'

export const astronomyEvents = [
  ['2026-10-21', '猎户座流星雨极大前后', '全国多数地区有观测机会；月光、云量与光污染会影响实际可见数量。', SHOWER_SOURCE, '地球穿过哈雷彗星留下的微粒带，细小颗粒进入大气后划出短暂光迹。抬头看时，别只盯着猎户座：流星可能出现在天空任何方向。'],
  ['2026-11-17', '狮子座流星雨极大前后', '通常宜在后半夜观察；各地实际条件请临近日期再核对。', SHOWER_SOURCE, '每年此时，地球再次经过一片彗星尘埃轨道。肉眼看到的亮线只持续片刻，却记录着地球在太阳系中的一次相遇。'],
  ['2026-12-14', '双子座流星雨极大前后', '北半球常见年度流星雨；具体高峰时刻和天气需临近核对。', SHOWER_SOURCE, '冬夜的天空可能突然划过一道亮线。先给眼睛十几分钟适应黑暗，再比较城里和郊外能看到多少颗流星。'],
  ['2027-01-04', '象限仪座流星雨极大前后', '北方更适合观测；日期按年度预报粗略标记，精确时段需核对。', 'https://www.timeanddate.com/astronomy/meteor-shower/quadrantids.html', '年初的流星雨高峰可能比较短。把预报时段、月光和云量放在一起看，才知道今晚是否值得出门。'],
  ['2027-02-21', '半影月食（北京时间清晨）', 'NASA 预报全球有半影月食；中国能否看见取决于本地月落时间，半影变化也较难察觉。', NASA_ECLIPSE, '月球经过地球半影时，亮度变化通常很轻微。即使食发生了，也要先确认你所在城市的月亮是否还在地平线上。'],
  ['2027-04-22', '天琴座流星雨极大前后', '全国多数地区可尝试在夜间观测；以年度预报和临近天气为准。', SHOWER_SOURCE, '春夜里，地球继续沿轨道运行，遇到散布在太空中的微粒。把观测地点的云量和灯光记录下来，解释同一夜为何有人看见、有人没看见。'],
  ['2027-05-06', '宝瓶座 η 流星雨极大前后', '南方通常更有利；需在临近日期核对极大时刻。', SHOWER_SOURCE, '这场流星雨的辐射点在南方天空更容易升高。拿两座不同纬度的城市作比较，就能看到地理位置如何影响同一场天象。'],
  ['2027-08-13', '英仙座流星雨极大前后', '北半球适合观测；月光和天气可能改变实际效果。', SHOWER_SOURCE, '夏夜的流星像一封短短的宇宙来信。记下看到的时刻、方向和天空亮度，再对照不同地点的观测记录。']
].map(([date, title, description, sourceUrl, story], index) => ({
  id: `sky-${index}`,
  date,
  title,
  description,
  story,
  sourceUrl,
  sourceName: sourceUrl === NASA_ECLIPSE ? 'NASA GSFC' : 'timeanddate 天文日历',
  type: 'astronomy',
  status: '预测',
  region: '中国部分地区至全国，按事件说明'
}))

export function seasonalEvents(year) {
  return seasonalWindows.map(([title, description, region, story], index) => ({
    id: `season-${year}-${index + 1}`,
    date: `${year}-${String(index + 1).padStart(2, '0')}-01`,
    title,
    description,
    story,
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
    story: `北京时间 ${new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(event.occurredAt))}，USGS 记录到一场 ${event.magnitude.toFixed(1)} 级地震。地图上的震中是震源在地表的投影，观测数据更新后，这个点和震级还可能改变。`,
    sourceUrl: event.sourceUrl,
    sourceName: '美国地质调查局 USGS',
    type: 'earthquake',
    status: '已发生',
    region: '中国地区（按 USGS 地名）',
    time: new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(event.occurredAt))
  }))
}
