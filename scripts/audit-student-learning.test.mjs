import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { auditStudentLearning, requiredLessons } from './audit-student-learning.mjs'

const auditCliPath = resolve(process.cwd(), 'scripts/audit-student-learning.mjs')

function completeLesson() {
  return {
    estimatedMinutes: 18,
    objectives: ['说出测试知识目标', '解释测试知识机制'],
    overview: '本节通过完整而具体的地理情境建立知识框架，先辨认关键概念和空间位置，再沿着条件、过程与结果分析自然现象的形成机制，同时结合区域案例检验解释是否成立，最后用练习和答题模板完成迁移应用，帮助学习者形成可以复述、比较、推理并用于新情境的地理思维路径。',
    knowledgeBlocks: [
      {
        title: '测试知识块',
        summary: '用于验证最小完整节次。',
        items: [{ name: '测试知识点', detail: '说明测试知识点的含义与应用。' }],
      },
      {
        title: '测试机制块',
        summary: '用于验证知识块数量。',
        items: [{ name: '测试机制', detail: '说明条件、过程和结果之间的关系。' }],
      },
    ],
    mechanismChains: [{ title: '测试机制链', steps: ['形成条件', '发生过程', '地理结果'] }],
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
        type: 'single-choice',
        question: '测试问题是什么？',
        options: ['A. 测试选项一', 'B. 测试选项二'],
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

  test.each([
    ['objectives 中的空字符串', (lesson) => { lesson.objectives = ['有效目标', '   '] }, 'objectives'],
    ['knowledgeBlocks 中的 null 项', (lesson) => { lesson.knowledgeBlocks[0].items = [null] }, 'knowledgeBlocks'],
    ['畸形机制链', (lesson) => { lesson.mechanismChains = [{ title: '', steps: ['一步'] }] }, 'mechanismChains'],
    ['畸形案例', (lesson) => { lesson.caseStudies = [{ title: '案例', context: '', question: '问题', conclusion: '结论' }] }, 'caseStudies'],
    ['畸形易错项', (lesson) => { lesson.misconceptions = [{ wrong: '错误', reason: '', correct: '正确' }] }, 'misconceptions'],
    ['畸形记忆要点', (lesson) => { lesson.memoryTips = ['   '] }, 'memoryTips'],
    ['畸形答题模板', (lesson) => { lesson.answerTemplates = [{ title: '模板', template: '' }] }, 'answerTemplates'],
    ['非正数学习时间', (lesson) => { lesson.estimatedMinutes = 0 }, 'estimatedMinutes'],
  ])('rejects %s', (_name, mutate, expectedField) => {
    const fixture = completeFixture()
    mutate(fixture.第一章.第一节)

    const result = auditStudentLearning(fixture)

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.includes(expectedField))).toBe(true)
  })

  test.each([
    ['objectives 下限', (lesson) => { lesson.objectives = ['仅一个目标'] }, 'objectives'],
    ['objectives 上限', (lesson) => { lesson.objectives = ['一', '二', '三', '四', '五'] }, 'objectives'],
    ['knowledgeBlocks 下限', (lesson) => { lesson.knowledgeBlocks = [lesson.knowledgeBlocks[0]] }, 'knowledgeBlocks'],
    ['knowledgeBlocks 上限', (lesson) => { lesson.knowledgeBlocks = Array(5).fill(lesson.knowledgeBlocks[0]) }, 'knowledgeBlocks'],
    ['mechanismChains 上限', (lesson) => { lesson.mechanismChains = Array(4).fill({ title: '机制', steps: ['第一步', '第二步'] }) }, 'mechanismChains'],
    ['caseStudies 上限', (lesson) => { lesson.caseStudies = Array(3).fill({ title: '案例', context: '情境', question: '问题', conclusion: '结论' }) }, 'caseStudies'],
    ['misconceptions 上限', (lesson) => { lesson.misconceptions = Array(4).fill({ wrong: '错误', reason: '原因', correct: '正确' }) }, 'misconceptions'],
    ['memoryTips 上限', (lesson) => { lesson.memoryTips = ['一', '二', '三', '四'] }, 'memoryTips'],
  ])('enforces the %s quantity bound', (_name, mutate, expectedField) => {
    const fixture = completeFixture()
    mutate(fixture.第一章.第一节)

    const result = auditStudentLearning(fixture)

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.includes(expectedField))).toBe(true)
  })

  test.each([
    ['过短', '概览过短。'],
    ['过长', '地'.repeat(181)],
  ])('rejects an overview that is %s', (_name, overview) => {
    const fixture = completeFixture()
    fixture.第一章.第一节.overview = overview

    const result = auditStudentLearning(fixture)

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.includes('overview'))).toBe(true)
  })

  test('rejects an unknown practice type', () => {
    const fixture = completeFixture()
    fixture.第一章.第一节.practice[0].type = 'matching'

    const result = auditStudentLearning(fixture)

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.includes('type'))).toBe(true)
  })

  test('requires at least two non-empty options for a single-choice question', () => {
    const fixture = completeFixture()
    fixture.第一章.第一节.practice[0].options = ['A. 唯一选项', '   ']

    const result = auditStudentLearning(fixture)

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.includes('options'))).toBe(true)
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
