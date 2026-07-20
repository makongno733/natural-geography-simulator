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
      practice: [{ type: 'single-choice', question: '最重要的循环是？', options: ['A. 海陆间循环', 'B. 海上内循环'], answer: 'A', explanation: '使陆地水更新。', knowledgePoint: '水循环类型' }],
      memoryTips: ['海陆最重要，海上量最大，陆地量最小。'],
      answerTemplates: [],
    })

    expect(result.estimatedMinutes).toBe(12)
    expect(result.mechanismChains[0].steps).toEqual(['蒸发', '输送', '降水', '径流'])
    expect(result.practice[0].answer).toBe('A')
  })

  it.each([
    {},
    [],
    { objectives: ['   '], overview: '有效摘要', knowledgeBlocks: [{ title: '知识', items: [{ name: '概念', detail: '解释' }] }] },
    { objectives: ['目标'], overview: '   ', knowledgeBlocks: [{ title: '知识', items: [{ name: '概念', detail: '解释' }] }] },
    { objectives: ['目标'], overview: '有效摘要', knowledgeBlocks: [{ title: '知识', items: [null, {}, { name: '概念', detail: '   ' }] }] },
  ])('rejects an overlay without the minimum usable contract: %j', (input) => {
    expect(normalizeStudentLearning(input)).toBeNull()
  })

  it('cleans nested knowledge items before accepting a usable overlay', () => {
    const result = normalizeStudentLearning({
      objectives: [' 解释水循环 '],
      overview: ' 水在圈层之间循环。 ',
      knowledgeBlocks: [{
        title: ' 循环环节 ',
        items: [null, { name: ' 蒸发 ', detail: ' 水由液态变为气态。 ' }, { name: '', detail: '无效' }],
      }],
    })

    expect(result.objectives).toEqual(['解释水循环'])
    expect(result.overview).toBe('水在圈层之间循环。')
    expect(result.knowledgeBlocks).toEqual([{
      title: '循环环节',
      summary: '',
      items: [{ name: '蒸发', detail: '水由液态变为气态。' }],
    }])
  })
})
