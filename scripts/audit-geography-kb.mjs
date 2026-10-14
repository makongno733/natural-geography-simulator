import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const directory = process.argv[2]
if (!directory) throw new Error('用法: node scripts/audit-geography-kb.mjs <Geography-Knowledge-Base目录>')
const read = async (name) => JSON.parse(await readFile(resolve(directory, `${name}.json`), 'utf8'))
const [textbooks, chapters, points, relations, visuals, modules] = await Promise.all(
  ['textbooks', 'chapters', 'knowledge-points', 'knowledge-relations', 'visual-assets', 'interactive-modules'].map(read),
)
const issues = []
const knownSourceCorrections = []
const correctedPointIds = {
  'SEC-XB2-04-05|KP-BX1-03-01': 'KP-BX1-011',
  'SEC-XB3-02-05|KP-BX1-05-02': 'KP-BX1-017',
}
const pointIds = new Set()
const chapterIds = new Set()
const textbookIds = new Set(textbooks.map((item) => item.id))
const requiredPointFields = [
  'id', 'name', 'domain', 'education_stage', 'textbook_chapter', 'core_definition', 'full_explanation',
  'geographic_principles', 'formation_mechanism', 'influencing_factors', 'spatial_distribution',
  'typical_cases', 'key_terms', 'common_misconceptions', 'prerequisite_knowledge', 'follow_up_knowledge',
  'textbook_pages', 'curriculum_standard_requirements', 'source_basis', 'audit_status',
]
const hasValue = (value) => value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)
for (const point of points) {
  if (!point.id || pointIds.has(point.id)) issues.push(`知识点 ID 重复或缺失: ${point.id}`)
  pointIds.add(point.id)
  for (const field of requiredPointFields) if (!hasValue(point[field])) issues.push(`${point.id}: ${field} 缺失`)
}
for (const chapter of chapters) {
  if (!chapter.id || chapterIds.has(chapter.id)) issues.push(`章节 ID 重复或缺失: ${chapter.id}`)
  chapterIds.add(chapter.id)
  if (!textbookIds.has(chapter.textbook_id)) issues.push(`${chapter.id}: 教材 ${chapter.textbook_id} 不存在`)
  for (const id of chapter.core_knowledge_points || []) {
    // 原始交付的两处错误由导入器显式修正，审计仍如实记录。
    if (!pointIds.has(id)) {
      const message = `${chapter.id}: 知识点 ${id} 不存在`
      const replacement = correctedPointIds[`${chapter.id}|${id}`]
      if (pointIds.has(replacement)) knownSourceCorrections.push(`${message}；导入时修正为 ${replacement}`)
      else issues.push(message)
    }
  }
  for (const id of chapter.related_chapters || []) if (!chapters.some((item) => item.id === id)) issues.push(`${chapter.id}: 关联章节 ${id} 不存在`)
}
const relationCounts = Object.fromEntries(Object.entries(relations).map(([key, items]) => [key, items.length]))
for (const [group, items] of Object.entries(relations)) {
  for (const [index, item] of items.entries()) {
    const ids = JSON.stringify(item).match(/KP-[A-Z]+\d-\d+/g) || []
    for (const id of ids) if (!pointIds.has(id)) issues.push(`${group}[${index}]: 知识点 ${id} 不存在`)
  }
}
for (const item of [...visuals, ...modules]) {
  const id = item.id || item.module_id
  if (!pointIds.has(item.related_knowledge_point_id)) issues.push(`${id}: 知识点 ${item.related_knowledge_point_id} 不存在`)
  for (const related of item.related_knowledge_points_list || []) if (!pointIds.has(related)) issues.push(`${id}: 知识点 ${related} 不存在`)
}
const report = {
  counts: { textbooks: textbooks.length, chapters: chapters.length, points: points.length, visualProposals: visuals.length, interactiveProposals: modules.length, relations: relationCounts, relationTotal: Object.values(relationCounts).reduce((a, b) => a + b, 0) },
  caveats: ['字段非空与引用有效不能证明科学准确、教材版本和版权授权。', '初中四册没有正文源文件；印刷页码与课标逐字对照未核实。'],
  knownSourceCorrections,
  issues,
}
console.log(JSON.stringify(report, null, 2))
if (issues.length) process.exitCode = 1
