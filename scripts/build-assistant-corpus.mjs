import { readFile, writeFile } from 'node:fs/promises'
import { grades } from '../src/textbook/data/index.js'

const TEMPLATE_NOISE_RE = /概念界定[—-]成因机制[—-]案例验证[—-]应用迁移|区域背景[—-]关键变量[—-]变化机制[—-]地理效应[—-]应用启示|用\s*2\s*句话解释本节最核心的地理机制|说明“[^”]+”的核心概念与基本特征|详细内容待填充/

function isCleanSnippet(raw) {
  const text = String(raw || '').trim()
  if (!text) return false
  if (TEMPLATE_NOISE_RE.test(text)) return false
  if (/^(?:-\s*)+##\s+/.test(text)) return false
  return true
}

function textFrom(value, output = []) {
  if (typeof value === 'string') {
    const lines = value
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(isCleanSnippet)
    if (lines.length) output.push(lines.join('\n'))
  } else if (Array.isArray(value)) {
    for (const item of value) textFrom(item, output)
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (/^(id|type|url|href|image|images|figures|src|alt|icon|license|sourceRef|interactive|ppt)$/i.test(key)) continue
      textFrom(item, output)
    }
  }
  return output
}

const corpus = []
for (const grade of grades) {
  for (const book of grade.books) {
    let content = {}
    let studentLearning = {}
    try {
      const path = `src/textbook/data/${grade.id}/${book.id}/${grade.id === '大学' ? 'index' : 'content'}.json`
      content = JSON.parse(await readFile(path, 'utf8'))
    } catch {
      // A catalog section is still useful for navigation when content is absent.
    }
    if (grade.id !== '大学') {
      try {
        const slPath = `src/textbook/data/${grade.id}/${book.id}/student-learning.json`
        studentLearning = JSON.parse(await readFile(slPath, 'utf8'))
      } catch {
        // Optional student-learning overlay
      }
    }
    for (const chapter of book.chapters) {
      for (const section of chapter.sections) {
        const sectionContent = grade.id === '大学'
          ? content[chapter.id]?.[section.id]
          : content[chapter.id]?.sections?.[section.id]
        const slSection = studentLearning?.[chapter.id]?.[section.id] || null

        // Prioritize verified teaching structures (studentLearning, conceptDefinitions, keyPoints, clean body)
        const rawParts = []
        if (slSection) textFrom(slSection, rawParts)
        if (sectionContent?.conceptDefinitions) textFrom(sectionContent.conceptDefinitions, rawParts)
        if (sectionContent?.keyPoints) textFrom(sectionContent.keyPoints, rawParts)
        if (sectionContent?.body) textFrom(sectionContent.body, rawParts)
        if (!rawParts.length && section.content) textFrom(section.content, rawParts)

        const snippets = [...new Set(rawParts)]
        corpus.push({
          grade: grade.id,
          book: book.id,
          chapter: chapter.id,
          chapterTitle: chapter.title,
          section: section.id,
          title: section.title,
          text: snippets.join('\n').slice(0, 4500)
        })
      }
    }
  }
}

await writeFile('server/assistant-corpus.json', `${JSON.stringify(corpus)}\n`)
console.log(`课程助手索引：${corpus.length} 节`)
