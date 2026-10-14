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
  const data = { textbook: { id: textbookId, name: sourceBook.name, publisher: sourceBook.publisher, edition: sourceBook.edition }, chapters: entries, points: knowledge, prerequisites: edges }
  await writeFile(resolve(output, `${code}.json`), `${JSON.stringify(data, null, 2)}\n`)
  manifest.push({ code, book: name, chapters: entries.length, mappedSections: entries.filter((item) => item.site).length, points: knowledge.length })
}
await writeFile(resolve(output, 'manifest.json'), `${JSON.stringify({ generatedFrom: 'Geography-Knowledge-Base (2026-10-13)', reviewStatus: '待教研复核', counts: { textbooks: textbooks.length, highSchoolTextbooks: 5, chapters: chapters.length, knowledgePoints: points.length, visualProposals: visuals.length, interactiveProposals: modules.length, prerequisiteRelations: relations.prerequisite_relations.length }, corrections, contentCorrectionIds: Object.keys(contentCorrections), books: manifest }, null, 2)}\n`)
console.log(JSON.stringify(manifest, null, 2))
