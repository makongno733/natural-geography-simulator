import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { auditStudentLearning, requiredLessons } from './audit-student-learning.mjs'

const auditCliPath = resolve(process.cwd(), 'scripts/audit-student-learning.mjs')

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

function completeFixture() {
  return Object.fromEntries(
    Object.entries(requiredLessons).map(([chapter, sections]) => [
      chapter,
      Object.fromEntries(sections.map((section) => [section, completeLesson()])),
    ]),
  )
}

function runAuditCli(data) {
  const fixtureDirectory = mkdtempSync(join(tmpdir(), 'student-learning-audit-'))
  const fixturePath = join(fixtureDirectory, 'fixture.json')

  try {
    writeFileSync(fixturePath, JSON.stringify(data), 'utf8')
    return spawnSync(process.execPath, [auditCliPath, fixturePath], { encoding: 'utf8' })
  } finally {
    rmSync(fixtureDirectory, { force: true, recursive: true })
  }
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

  test('reports a required lesson that is missing', () => {
    const fixture = completeFixture()
    delete fixture.第六章.第四节

    const result = auditStudentLearning(fixture)

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('第六章 第四节: 缺少节次')
  })

  test('requires at least one non-empty optional learning module', () => {
    const fixture = completeFixture()
    Object.assign(fixture.第一章.第一节, {
      mechanismChains: [],
      caseStudies: [],
      misconceptions: [],
      practice: [],
    })

    const result = auditStudentLearning(fixture)

    expect(result.errors).toContain(
      '第一章 第一节: mechanismChains、caseStudies、misconceptions、practice 至少一项必须非空',
    )
  })

  test('requires memory tips or answer templates', () => {
    const fixture = completeFixture()
    fixture.第一章.第一节.memoryTips = []
    fixture.第一章.第一节.answerTemplates = []

    const result = auditStudentLearning(fixture)

    expect(result.errors).toContain('第一章 第一节: memoryTips、answerTemplates 至少一项必须非空')
  })

  test('reports every required field missing from a practice question', () => {
    const fixture = completeFixture()
    fixture.第一章.第一节.practice = [{}]

    const result = auditStudentLearning(fixture)

    expect(result.errors).toEqual(
      expect.arrayContaining([
        '第一章 第一节: 第 1 道练习缺少非空 question',
        '第一章 第一节: 第 1 道练习缺少非空 answer',
        '第一章 第一节: 第 1 道练习缺少非空 explanation',
        '第一章 第一节: 第 1 道练习缺少非空 knowledgePoint',
      ]),
    )
  })

  test('rejects a non-array practice without counting it as optional content', () => {
    const fixture = completeFixture()
    Object.assign(fixture.第一章.第一节, {
      mechanismChains: [],
      caseStudies: [],
      misconceptions: [],
      practice: { question: '错误的数据形状' },
    })

    const result = auditStudentLearning(fixture)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        '第一章 第一节: practice 必须为数组',
        '第一章 第一节: mechanismChains、caseStudies、misconceptions、practice 至少一项必须非空',
      ]),
    )
  })

  test.each([
    '学生回答',
    '教师小结',
    '概念界定—成因机制—案例验证—应用迁移',
    '用 2 句话解释本节最核心',
    '。。',
    '\\n',
  ])('rejects forbidden text pattern %s', (pattern) => {
    const fixture = completeFixture()
    fixture.第一章.第一节.overview = `有效概览包含${pattern}`

    const result = auditStudentLearning(fixture)

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.includes('包含禁止文本模式'))).toBe(true)
  })

  test('accepts a complete minimal fixture', () => {
    const result = auditStudentLearning(completeFixture())

    expect(result).toMatchObject({
      ok: true,
      auditedSections: 17,
    })
    expect(result.errors).toEqual([])
  })

  test('CLI prints the required success message for a complete fixture', () => {
    const result = runAuditCli(completeFixture())

    expect(result.status).toBe(0)
    expect(result.stdout.trim()).toBe('Student learning audit passed: 17/17 sections')
    expect(result.stderr).toBe('')
  })

  test('CLI exits with status 1 and prints errors for an invalid fixture', () => {
    const fixture = completeFixture()
    delete fixture.第六章.第四节

    const result = runAuditCli(fixture)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Student learning audit failed: 1 error(s)')
    expect(result.stderr).toContain('第六章 第四节: 缺少节次')
  })
})
