import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { auditAllSections } from './audit-textbook-content.mjs'

describe('textbook audit remediation', () => {
  it('replaces every critical/high item with a sourced draft awaiting teacher review', async () => {
    const { allResults } = auditAllSections()
    const audited = allResults.filter(result => ['Critical', 'High'].includes(result.severity))
    expect(audited).toEqual([])

    const reviewed = []
    const cache = new Map()
    for (const result of allResults) {
      const file = `src/textbook/data/${result.grade}/${result.book}/content.json`
      if (!cache.has(file)) cache.set(file, JSON.parse(await readFile(file, 'utf8')))
      const section = cache.get(file)[result.chapterId]?.sections?.[result.sectionId]
      if (section?.editorialReview) reviewed.push({ result, section })
    }

    expect(reviewed).toHaveLength(30)
    for (const { result, section } of reviewed) {
      expect(section.editorialReview.status).toBe('pending-teacher-review')
      expect(section.editorialReview.source).toMatch(/\/text\.txt$/)
      expect(section.keyPoints.length).toBeGreaterThanOrEqual(3)
      expect(section.conceptDefinitions).toEqual({})
      expect(section.body).toContain('不是人工审校结论')
      expect(section.body).not.toMatch(/概念界定—成因机制|区域背景—关键变量|用\s*2\s*句话解释本节/)
      expect(result.severity).not.toMatch(/Critical|High/)
    }

    const orphanData = JSON.parse(await readFile(
      'src/textbook/data/初中/七年级下册/content.json',
      'utf8'
    ))
    const unregisteredSection = orphanData['第九章']?.sections?.['第三节']
    expect(unregisteredSection.editorialReview.status).toBe('pending-teacher-review')
    expect(allResults.some(result =>
      result.book === '七年级下册' &&
      result.chapterId === '第九章' &&
      result.sectionId === '第三节'
    )).toBe(false)
  })
})
