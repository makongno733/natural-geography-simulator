import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { buildAssistantCorpus } from './build-assistant-corpus.mjs'
import { grades } from '../src/textbook/data/index.js'

describe('assistant textbook corpus', () => {
  it('excludes all sections explicitly awaiting teacher review', async () => {
    const [built, committed] = await Promise.all([
      buildAssistantCorpus(),
      readFile('server/assistant-corpus.json', 'utf8').then(JSON.parse),
    ])
    const pendingKeys = new Set()
    let expectedCorpusCount = 0
    for (const grade of grades) {
      for (const book of grade.books) {
        const path = `src/textbook/data/${grade.id}/${book.id}/${grade.id === '大学' ? 'index' : 'content'}.json`
        const content = JSON.parse(await readFile(path, 'utf8'))
        for (const chapter of book.chapters) {
          for (const section of chapter.sections) {
            const sectionContent = grade.id === '大学'
              ? content[chapter.id]?.[section.id]
              : content[chapter.id]?.sections?.[section.id]
            if (sectionContent?.editorialReview?.status === 'pending-teacher-review') {
              pendingKeys.add([grade.id, book.id, chapter.id, section.id].join('|'))
            } else {
              expectedCorpusCount++
            }
          }
        }
      }
    }

    expect(built).toHaveLength(expectedCorpusCount)
    expect(pendingKeys.size).toBe(30)
    for (const corpus of [built, committed]) {
      for (const section of corpus) {
        const key = [section.grade, section.book, section.chapter, section.section].join('|')
        expect(pendingKeys.has(key)).toBe(false)
      }
    }
    expect(committed).toEqual(built)
  })
})
