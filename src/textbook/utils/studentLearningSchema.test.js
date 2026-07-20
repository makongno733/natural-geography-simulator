import { describe, expect, it } from 'vitest'
import { normalizeStudentLearning } from './studentLearningSchema.js'

describe('normalizeStudentLearning', () => {
  it('returns null when no learning data exists', () => {
    expect(normalizeStudentLearning(null)).toBeNull()
  })

  it('normalizes complete learning data without losing module order', () => {
    const result = normalizeStudentLearning({
      estimatedMinutes: 12,
      objectives: ['解释水循环'],
      keyFocus: ['水循环环节'],
      difficulties: ['人类活动影响'],
      overview: '水在四大圈层之间循环运动。',
      knowledgeBlocks: [{ title: '循环类型', summary: '三类循环', items: [{ name: '海陆间循环', detail: '联系海洋与陆地。' }] }],
      mechanismChains: [{ title: '水循环', steps: ['蒸发', '输送', '降水', '径流'] }],
      caseStudies: [],
      misconceptions: [],
      practice: [{ type: 'single-choice', question: '最重要的循环是？', options: ['A. 海陆间循环'], answer: 'A', explanation: '使陆地水更新。', knowledgePoint: '水循环类型' }],
      memoryTips: ['海陆最重要，海上量最大，陆地量最小。'],
      answerTemplates: [],
    })

    expect(result.estimatedMinutes).toBe(12)
    expect(result.mechanismChains[0].steps).toEqual(['蒸发', '输送', '降水', '径流'])
    expect(result.practice[0].answer).toBe('A')
  })

  it('drops invalid collection entries and supplies safe arrays', () => {
    const result = normalizeStudentLearning({ overview: '有效摘要', objectives: '错误类型', practice: [null, { question: '' }] })
    expect(result.objectives).toEqual([])
    expect(result.practice).toEqual([])
    expect(result.knowledgeBlocks).toEqual([])
  })
})
