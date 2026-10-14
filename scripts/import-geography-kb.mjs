import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { grades } from '../src/textbook/data/index.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const source = resolve(process.argv[2] || '')
if (!process.argv[2]) throw new Error('用法: node scripts/import-geography-kb.mjs <Geography-Knowledge-Base目录>')
const output = resolve(root, 'src/textbook/knowledge/data')
const read = async (name) => JSON.parse(await readFile(resolve(source, `${name}.json`), 'utf8'))
const [textbooks, chapters, points, relations, visuals, modules] = await Promise.all(
  ['textbooks', 'chapters', 'knowledge-points', 'knowledge-relations', 'visual-assets', 'interactive-modules'].map(read)
)
const bookMap = { BX1: '必修第一册', BX2: '必修第二册', XB1: '选择性必修1', XB2: '选择性必修2', XB3: '选择性必修3' }
const siteBooks = new Map(grades.find((grade) => grade.id === '高中').books.map((book) => [book.id, book]))
const ids = (items, key) => {
  const found = new Set()
  for (const item of items) {
    if (!item[key] || found.has(item[key])) throw new Error(`重复或缺失 ID: ${item[key]}`)
    found.add(item[key])
  }
  return found
}
const pointIds = ids(points, 'id')
const chapterIds = ids(chapters, 'id')
ids(textbooks, 'id'); ids(visuals, 'id'); ids(modules, 'module_id')
const corrections = { 'KP-BX1-03-01': 'KP-BX1-011', 'KP-BX1-05-02': 'KP-BX1-017' }
// 只改已查证的具体错误；原始交付文件不改动，其余内容保持待教研复核。
const contentCorrections = {
  'KP-XB1-001': {
    definition: '地球绕自转轴自西向东旋转；恒星日和平均太阳日因参照对象不同而时长不同，同一刚体的角速度各处相同而切向线速度随纬度变化。',
    explanation: '地球自西向东自转，从北极上空俯视呈逆时针，从南极上空俯视呈顺时针。以遥远恒星为参照，自转约 360° 的恒星日约为 23 小时 56 分 4 秒；以太阳为参照，平均太阳日为 24 小时。两者差异来自地球公转。刚体自转的角速度在各纬度相同，约为每小时 15.04°（以恒星日计算）；两极点的切向线速度为零，但不能说地轴两端的角速度为零。日常地方时换算使用平均太阳日的每小时 15° 近似。地表同一海拔的切向线速度随纬度升高而减小，近似与纬度余弦成正比。',
    distribution: '自转角速度在地球各处近似相同；地表切向线速度从赤道向两极减小，两极点为零。每小时 15° 是平均太阳时换算值，不是恒星参考系中的精确自转角速度。',
    factors: '切向线速度受纬度和距地轴距离影响；恒星日与太阳日的区别取决于观测参照。',
    terms: ['地球自转', '恒星日（约 23 时 56 分 4 秒）', '平均太阳日（24 小时）', '自转角速度（约 15.04°/时）', '平均太阳时换算（15°/时）', '切向线速度'],
    misconceptions: ['把 24 小时的平均太阳日当成地球相对恒星转满 360° 的周期；恒星日约为 23 小时 56 分 4 秒。', '把两极点线速度为零误写成角速度为零；刚体自转角速度不因纬度而改变。'],
    reviewReferences: [
      { title: 'NASA: Chapter 2 Reference Systems', url: 'https://science.nasa.gov/learn/basics-of-space-flight/chapter2-1/' },
      { title: 'NASA: Earth Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html' },
    ],
  },
  'KP-XB1-004': {
    definition: '地方时随经度变化；理论时区使用中央经线统一计时，现实民用时间还受法定时区与夏令时规定影响，跨国际日期变更线需调整日期。',
    explanation: '地方太阳时随经度变化，教学中的平均地方时计算采用经度差 15° 约合 1 小时、1° 约合 4 分钟。理论时区以中央经线为基准；现实中的法定时区边界、统一用时和夏令时由各地制度决定，不能一概按整齐的 15° 经度带推算民用时刻。跨国际日期变更线还需按方向调整日期。北京时间采用 UTC+8，与北京地点的当地太阳时不是同一概念；真实日出、日落和正午时刻也会受到均时差等影响。',
    principles: '平均太阳时的经度换算；法定时区与夏令时应按具体地区和日期核对。',
    distribution: '平均地方太阳时随经度连续变化；理论时区按中央经线组织，现实中的法定时区边界并不总沿 15° 经度间隔。',
    terms: ['地方太阳时', '平均太阳时', '理论区时', '法定时区', '夏令时', '国际日期变更线', '北京时间（UTC+8）'],
    cases: '在不采用夏令时的理论区时练习中，北京时间（UTC+8）10 月 1 日 10:00 对应 UTC 10 月 1 日 02:00，对应 UTC−5 时区 9 月 30 日 21:00。若换算纽约等城市的民用时间，须另查当日是否实行夏令时。',
    misconceptions: ['把理论时区边界当成各国法定时区边界；实际民用时间还取决于行政规定。', '将 UTC−5 的理论区时直接写成纽约全年时刻；纽约在实行夏令时时使用 UTC−4。', '跨国际日期变更线时忽略行进方向和日期变化。'],
    reviewReferences: [
      { title: 'USNO: The Equation of Time', url: 'https://aa.usno.navy.mil/faq/eqtime' },
      { title: 'NIST: Local Time FAQs', url: 'https://www.nist.gov/pml/time-and-frequency-division/local-time-faqs' },
    ],
  },
  'KP-XB1-003': {
    explanation: '地球不透明且持续自转，使同一地点交替进入昼半球与夜半球。在把太阳光近似为平行光、忽略大气折射和太阳视圆面的教学几何模型中，晨昏圈是昼夜半球的分界大圆，晨线表示从夜半球进入昼半球，昏线表示从昼半球进入夜半球。几何模型中赤道全年昼夜各约 12 小时，二分日昼夜近似平分；现实中的日出日落按太阳视圆面与大气折射定义，实测昼长会略多于 12 小时，钟表时刻也受经度、时区和均时差影响，不能说赤道全年恰在 6:00 日出、18:00 日落。',
    distribution: '在简化的太阳光平行光模型中，晨昏分界随地球自转相对地表移动；实际日出日落时刻还受公转、折射和观测条件影响。',
    cases: '二分日前后，几何模型给出全球多数地区近似昼夜平分；夏至日前后北极圈及其以北出现极昼，冬至日前后南极圈及其以南出现极昼。现实观测须考虑大气折射与太阳视圆面。',
    misconceptions: ['把简化模型中的 6:00 日出、18:00 日落当成赤道全年精确民用时刻。', '把几何晨昏线与真实观测的日出日落边界完全等同，忽略大气折射与太阳视圆面。'],
    reviewReferences: [
      { title: 'NOAA: Equinoxes and day length', url: 'https://vlab.noaa.gov/documents/23962491/46050193/Sept2025%283%29%2B-%2BEquinoxes%2B-%2BThe%2BBudget.pdf/fb3e2b86-6415-7c3c-62fc-b8618768e9fc?download=true&t=1761668794845' },
      { title: 'USNO: The Equation of Time', url: 'https://aa.usno.navy.mil/faq/eqtime' },
    ],
  },
  'KP-XB1-008': {
    definition: '正午太阳高度是太阳经过当地子午线、位于一天中最高位置时的高度角；当地太阳正午不一定等于法定钟表时间 12:00。',
    explanation: '在忽略大气折射、地形遮挡等因素的教学几何模型中，正午太阳高度 H = 90° − |观测地纬度 − 太阳赤纬|。同一天从太阳直射点所在纬线向南北两侧递减。由此可分析不同纬度、日期的日影方向和长度。楼间距的简单公式只适用于指定建筑朝向、平地和太阳正午的理想剖面；实际建筑日照需考虑全天时段、地形、建筑形态与当地标准。太阳能板倾角也需结合全年发电目标、散射辐射和安装条件，不能把正午光线垂直当成通用最佳值。',
    cases: '以约 40°N 为例，在简化模型中夏至日正午太阳高度约为 73.4°，冬至日约为 26.6°。这些是地理几何示例，不是住宅日照合规结论。',
    terms: ['当地太阳正午', '正午太阳高度', '太阳赤纬', 'H = 90° − 纬度差', '均时差', '日影长度', '简化日照剖面'],
    misconceptions: ['把当地太阳正午直接当成法定钟表时间 12:00；时区经度和均时差会造成偏移。', '把简化的正午影长计算当成建筑间距或太阳能板安装的完整工程标准。'],
    reviewReferences: [
      { title: 'USNO: The Equation of Time', url: 'https://aa.usno.navy.mil/faq/eqtime' },
      { title: 'USNO: Computing Approximate Solar Coordinates', url: 'https://aa.usno.navy.mil/faq/sun_approx' },
    ],
  },
  'KP-XB1-005': {
    explanation: '在地球自转参考系中，水平运动的空气和海水在北半球向运动方向右侧偏转，在南半球向左侧偏转；赤道处水平地转偏向效应为零。其大小随运动速度和纬度正弦值变化，方向与水平速度垂直。地转偏向力参与塑造大尺度风系、洋流和气旋旋转方向。河岸侵蚀与泥沙堆积还受河道弯曲、流速、流量、泥沙、潮汐和人类活动等影响，不能仅按半球判断哪一岸必定侵蚀或堆积。',
    principles: '旋转参考系中的科里奥利效应；在大尺度空气和海水运动中需与气压梯度、摩擦等作用共同分析。',
    mechanism: '从随地球旋转的参考系观察，运动物体的路径呈现随纬度和运动方向变化的偏转。',
    factors: '地球自转角速度、物体相对地表的水平运动速度和所在纬度；下垫面摩擦会改变实际运动，但不是地转偏向力大小公式的直接因子。',
    cases: '北半球热带气旋通常呈逆时针旋转，南半球通常呈顺时针旋转。崇明岛是长江河口泥沙沉积和河口水动力长期作用的结果，不能作为地转偏向力单独决定河岸冲淤的证据。',
    terms: ['地转偏向力', '科里奥利力', '北右南左赤道无', '大尺度风系', '洋流', '气旋'],
    misconceptions: ['误认为北半球所有河流都必然右岸侵蚀、左岸堆积；河流冲淤需结合局地河道形态与水沙条件分析。', '误认为地转偏向力是风的唯一成因；气压梯度力驱动空气运动，地转偏向力影响其方向。'],
    reviewReferences: [
      { title: 'NOAA: Origin of Wind', url: 'https://www.noaa.gov/jetstream/synoptic/origin-of-wind' },
      { title: 'USGS: Find-A-Feature: Meander', url: 'https://www.usgs.gov/educational-resources/find-feature-meander' },
      { title: 'Frontiers: Wetland Utilization and Adaptation Practice of Chongming Island', url: 'https://www.frontiersin.org/journals/environmental-science/articles/10.3389/fenvs.2021.627963/full' },
    ],
  },
  'KP-BX1-006': {
    explanation: '地球内部圈层可依据地震波传播速度的变化划分：莫霍面以上为地壳，莫霍面与古登堡面之间为地幔，古登堡面以下为地核。上地幔中的软流层以固态岩石为主，在漫长地质时间尺度上能够缓慢发生塑性流动；局部特殊条件下可发生部分熔融，不能把整个软流层描述为熔融岩浆层。岩石圈包括地壳和上地幔顶部较坚硬的部分。地核包括液态外核和固态内核。外部圈层包括大气圈、水圈和生物圈，各圈层相互联系。',
    reviewReferences: [
      { title: 'USGS: Are the tectonic plates floating on magma?', url: 'https://www.usgs.gov/faqs/are-tectonic-plates-floating-magma' },
    ],
  },
}
const invalid = []
for (const chapter of chapters) {
  for (const id of chapter.core_knowledge_points || []) {
    if (!pointIds.has(id) && !corrections[id]) invalid.push(`${chapter.id}: ${id}`)
  }
  for (const id of chapter.related_chapters || []) if (!chapterIds.has(id)) invalid.push(`${chapter.id}: ${id}`)
}
for (const item of [...visuals, ...modules]) {
  if (!pointIds.has(item.related_knowledge_point_id)) invalid.push(`${item.id || item.module_id}: ${item.related_knowledge_point_id}`)
}
for (const edge of relations.prerequisite_relations) {
  for (const id of [edge.target_knowledge_point_id, ...edge.prerequisite_knowledge_point_ids]) if (!pointIds.has(id)) invalid.push(`关系: ${id}`)
}
if (invalid.length) throw new Error(`悬空引用:\n${invalid.join('\n')}`)

const normalize = (value) => value.replace(/[\s，,。！？?!“”"'—－:：]/g, '')
// 逐条比对现有课程标题后确认的同义名称。不能仅凭模糊匹配自动建立映射。
const reviewedSiteMatches = {
  'SEC-BX1-03-04': ['第三章', '问题研究'],
  'SEC-BX2-02-04': ['第二章', '问题研究'],
  'SEC-XB1-01-01': ['第一章', '第一节'],
  'SEC-XB2-01-03': ['第一章', '问题研究'],
}
const matchSite = (chapter, book) => {
  const reviewed = reviewedSiteMatches[chapter.id]
  if (reviewed) {
    const unit = book.chapters.find((item) => item.id === reviewed[0])
    if (!unit?.sections.some((item) => item.id === reviewed[1])) throw new Error(`人工映射失效: ${chapter.id}`)
    return { grade: '高中', book: book.id, chapter: reviewed[0], section: reviewed[1] }
  }
  const unit = book.chapters.find((item) => chapter.unit.startsWith(item.id))
  if (!unit) return null
  const isResearch = chapter.name.includes('问题研究')
  const section = unit.sections.find((item) => {
    if (isResearch !== (item.id === '问题研究')) return false
    const title = normalize(item.title)
    const name = normalize(chapter.name.replace(/^第[一二三四五六七八九十]+章/, ''))
    return isResearch ? (title.includes(name) || name.includes(title)) : name.includes(normalize(item.id + item.title))
  })
  return section ? { grade: '高中', book: book.id, chapter: unit.id, section: section.id } : null
}

await mkdir(output, { recursive: true })
const chaptersByBook = Object.groupBy(chapters, (item) => item.textbook_id)
const pointsByBook = Object.groupBy(points, (item) => item.id.match(/^KP-([A-Z]+\d)-/)[1])
const manifest = []
const pointIndex = {}
for (const [code, name] of Object.entries(bookMap)) {
  const textbookId = `TB-G-${code}`
  const book = siteBooks.get(name)
  const sourceBook = textbooks.find((item) => item.id === textbookId)
  const entries = (chaptersByBook[textbookId] || []).map((item) => ({
    id: item.id,
    title: item.name,
    unit: item.unit,
    order: item.order,
    summary: item.main_content,
    pointIds: [...new Set(item.core_knowledge_points.map((id) => corrections[id] || id))],
    site: matchSite(item, book),
  }))
  const knowledge = (pointsByBook[code] || []).map((item) => ({
    id: item.id,
    name: item.name,
    definition: item.core_definition,
    explanation: item.full_explanation,
    principles: item.geographic_principles,
    mechanism: item.formation_mechanism,
    factors: item.influencing_factors,
    distribution: item.spatial_distribution,
    cases: item.typical_cases,
    terms: item.key_terms,
    misconceptions: item.common_misconceptions,
    curriculum: item.curriculum_standard_requirements,
    source: item.source_basis,
    sourceAuditStatus: item.audit_status,
    reviewStatus: '待教研复核',
    textbookPages: item.textbook_pages,
    ...contentCorrections[item.id],
  }))
  const edges = relations.prerequisite_relations.filter((item) => knowledge.some((point) => point.id === item.target_knowledge_point_id))
  for (const point of knowledge) {
    const chapter = entries.find((item) => item.pointIds.includes(point.id))
    if (chapter) pointIndex[point.id] = { name: point.name, book: code, chapter: chapter.id }
  }
  const data = { textbook: { id: textbookId, name: sourceBook.name, publisher: sourceBook.publisher, edition: sourceBook.edition }, chapters: entries, points: knowledge, prerequisites: edges }
  await writeFile(resolve(output, `${code}.json`), `${JSON.stringify(data, null, 2)}\n`)
  manifest.push({ code, book: name, chapters: entries.length, mappedSections: entries.filter((item) => item.site).length, points: knowledge.length })
}
await writeFile(resolve(output, 'manifest.json'), `${JSON.stringify({ generatedFrom: 'Geography-Knowledge-Base (2026-10-13)', reviewStatus: '待教研复核', counts: { textbooks: textbooks.length, highSchoolTextbooks: 5, chapters: chapters.length, knowledgePoints: points.length, visualProposals: visuals.length, interactiveProposals: modules.length, prerequisiteRelations: relations.prerequisite_relations.length }, corrections, contentCorrectionIds: Object.keys(contentCorrections), books: manifest, pointIndex }, null, 2)}\n`)
console.log(JSON.stringify(manifest, null, 2))
