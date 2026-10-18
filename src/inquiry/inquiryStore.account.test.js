import { describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ userId: 'student-a', reviews: [] }))
vi.mock('../account/config.js', () => ({ accountEnabled: true }))
vi.mock('../account/api.js', () => ({
  apiRequest: vi.fn(async path => path === '/api/auth/get-session'
    ? { user: { id: session.userId } }
    : path === '/api/inquiry/reviews' ? { reviews: session.reviews } : {})
}))

const { initInquiryStore, getCurrentDraft, persistStore, syncStudentReviews, inquiryState } = await import('./inquiryStore.js')

describe('Inquiry local draft account isolation', () => {
  it('keeps drafts from different signed-in students in separate local storage keys', async () => {
    vi.useFakeTimers()
    window.localStorage.clear()
    try {
      session.userId = 'student-a'
      await initInquiryStore()
      getCurrentDraft().initialHypothesis = '学生甲的私人猜想'
      persistStore()
      vi.runAllTimers()

      session.userId = 'student-b'
      await initInquiryStore()
      expect(getCurrentDraft().initialHypothesis).toBe('')
      getCurrentDraft().initialHypothesis = '学生乙的私人猜想'
      persistStore()
      vi.runAllTimers()

      session.userId = 'student-a'
      await initInquiryStore()
      expect(getCurrentDraft().initialHypothesis).toBe('学生甲的私人猜想')
    } finally {
      vi.useRealTimers()
    }
  })

  it('uses the newest teacher review for a task', async () => {
    await initInquiryStore()
    session.reviews = [
      { task_id: 'urban-flood', submission_id: 'sub-1', teacher_name: '教师', scores: '{}', total_score: 90, feedback_comment: '最新批注', updated_at: '2026-10-18T12:00:00Z' },
      { task_id: 'urban-flood', submission_id: 'sub-1', teacher_name: '教师', scores: '{}', total_score: 70, feedback_comment: '旧批注', updated_at: '2026-10-17T12:00:00Z' }
    ]
    await syncStudentReviews()
    expect(inquiryState.reviews['urban-flood'].feedbackComment).toBe('最新批注')
  })
})
