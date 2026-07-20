import { describe, expect, test } from 'vitest'

import { auditStudentLearning } from './audit-student-learning.mjs'

function completeLesson() {
  return {
    objectives: ['说出测试知识目标'],
    overview: '这是一段完整的学习概览。',
    knowledgeBlocks: [
      {
        title: '测试知识块',
        summary: '用于验证最小完整节次。',
        items: ['测试知识点'],
      },
    ],
    mechanismChains: [],
    caseStudies: [],
    misconceptions: [
      {
        wrong: '错误认识',
        reason: '说明错误原因。',
        correct: '给出正确认识。',
      },
    ],
    practice: [
      {
        question: '测试问题是什么？',
        answer: '测试答案。',
        explanation: '测试解析。',
        knowledgePoint: '测试知识点',
      },
    ],
    memoryTips: ['测试记忆提示。'],
    answerTemplates: [],
  }
}

const requiredLessons = {
  第一章: ['第一节', '第二节', '第三节', '第四节'],
  第二章: ['第一节', '第二节'],
  第三章: ['第一节', '第二节', '第三节'],
  第四章: ['第一节', '第二节'],
  第五章: ['第一节', '第二节'],
  第六章: ['第一节', '第二节', '第三节', '第四节'],
}

function completeFixture() {
  return Object.fromEntries(
    Object.entries(requiredLessons).map(([chapter, sections]) => [
      chapter,
      Object.fromEntries(sections.map((section) => [section, completeLesson()])),
    ]),
  )
}

describe('auditStudentLearning', () => {
  test('reports missing core fields for an incomplete lesson', () => {
    const fixture = completeFixture()
    fixture.第一章.第一节 = {}

    const result = auditStudentLearning(fixture)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        '第一章 第一节: 缺少非空 objectives',
        '第一章 第一节: 缺少非空 overview',
        '第一章 第一节: 缺少非空 knowledgeBlocks',
      ]),
    )
  })

  test('accepts a complete minimal fixture', () => {
    const result = auditStudentLearning(completeFixture())

    expect(result).toMatchObject({
      ok: true,
      auditedSections: 17,
    })
    expect(result.errors).toEqual([])
  })
})
