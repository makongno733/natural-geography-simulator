import { readFile, writeFile } from 'node:fs/promises'
import { grades } from '../src/textbook/data/index.js'

function textFrom(value, output = []) {
  if (typeof value === 'string') {
    const text = value.trim()
    if (text && !text.includes('详细内容待填充')) output.push(text)
  } else if (Array.isArray(value)) {
    for (const item of value) textFrom(item, output)
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (/^(id|type|url|href|image|src|alt|icon|license|sourceRef)$/i.test(key)) continue
      textFrom(item, output)
    }
  }
  return output
}

const corpus = []
for (const grade of grades) {
  for (const book of grade.books) {
    let content = {}
    try {
      const path = `src/textbook/data/${grade.id}/${book.id}/${grade.id === '大学' ? 'index' : 'content'}.json`
      content = JSON.parse(await readFile(path, 'utf8'))
    } catch {
      // A catalog section is still useful for navigation when content is absent.
    }
    for (const chapter of book.chapters) {
      for (const section of chapter.sections) {
        const sectionContent = grade.id === '大学'
          ? content[chapter.id]?.[section.id]
          : content[chapter.id]?.sections?.[section.id]
        const snippets = [...new Set(textFrom(sectionContent || section.content))]
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
