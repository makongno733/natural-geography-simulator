import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadSectionContent } from './contentLoader.js'

const mocks = vi.hoisted(() => ({
  loadStudentLearning: vi.fn(),
}))

vi.mock('./studentLearningLoader.js', () => ({
  loadStudentLearning: mocks.loadStudentLearning,
}))

describe('textbook section content loading', () => {
  beforeEach(() => {
    mocks.loadStudentLearning.mockReset()
    mocks.loadStudentLearning.mockResolvedValue({
      overview: '不应覆盖待复核草稿的旧学习卡片。',
    })
  })

  it('does not attach student-learning overlays to pending editorial drafts', async () => {
    const section = await loadSectionContent('初中', '七年级上册', '第一章', '第二节')

    expect(section.editorialReview.status).toBe('pending-teacher-review')
    expect(section.studentLearning).toBeUndefined()
    expect(mocks.loadStudentLearning).not.toHaveBeenCalled()
  })
})
