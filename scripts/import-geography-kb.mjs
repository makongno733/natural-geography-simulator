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
const matchSite = (chapter, book) => {
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
  }))
  const edges = relations.prerequisite_relations.filter((item) => knowledge.some((point) => point.id === item.target_knowledge_point_id))
  const data = { textbook: { id: textbookId, name: sourceBook.name, publisher: sourceBook.publisher, edition: sourceBook.edition }, chapters: entries, points: knowledge, prerequisites: edges }
  await writeFile(resolve(output, `${code}.json`), `${JSON.stringify(data, null, 2)}\n`)
  manifest.push({ code, book: name, chapters: entries.length, mappedSections: entries.filter((item) => item.site).length, points: knowledge.length })
}
await writeFile(resolve(output, 'manifest.json'), `${JSON.stringify({ generatedFrom: 'Geography-Knowledge-Base (2026-10-13)', reviewStatus: '待教研复核', counts: { textbooks: textbooks.length, highSchoolTextbooks: 5, chapters: chapters.length, knowledgePoints: points.length, visualProposals: visuals.length, interactiveProposals: modules.length, prerequisiteRelations: relations.prerequisite_relations.length }, corrections, books: manifest }, null, 2)}\n`)
console.log(JSON.stringify(manifest, null, 2))
