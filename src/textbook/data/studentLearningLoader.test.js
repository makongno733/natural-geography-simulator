import { describe, expect, it } from 'vitest'
import { loadStudentLearning } from './studentLearningLoader.js'
import { loadSectionContent } from './contentLoader.js'

describe('student learning overlay', () => {
  it('loads the compulsory-one overlay by chapter and section', async () => {
    const learning = await loadStudentLearning('高中', '必修第一册', '第一章', '第一节')
    expect(learning.overview).toContain('地球')
    expect(learning.practice.length).toBeGreaterThan(0)
  })

  it('merges learning data without removing existing concepts', async () => {
    const section = await loadSectionContent('高中', '必修第一册', '第一章', '第一节')
    expect(section.studentLearning.overview).toContain('地球')
    expect(section.conceptDefinitions).toBeTruthy()
  })

  it('returns null for books without an overlay', async () => {
    expect(await loadStudentLearning('高中', '必修第二册', '第一章', '第一节')).toBeNull()
  })
})
