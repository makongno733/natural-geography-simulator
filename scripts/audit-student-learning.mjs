import { readFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const requiredLessons = {
  第一章: ['第一节', '第二节', '第三节', '第四节'],
  第二章: ['第一节', '第二节'],
  第三章: ['第一节', '第二节', '第三节'],
  第四章: ['第一节', '第二节'],
  第五章: ['第一节', '第二节'],
  第六章: ['第一节', '第二节', '第三节', '第四节'],
}

const forbiddenPatterns = [
  '学生回答',
  '教师小结',
  '概念界定—成因机制—案例验证—应用迁移',
  '用 2 句话解释本节最核心',
  '。。',
  '\\n',
]

function isNonEmpty(value) {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return value !== null && typeof value === 'object' && Object.keys(value).length > 0
}

function collectStrings(value, strings = []) {
  if (typeof value === 'string') {
    strings.push(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, strings))
  } else if (value !== null && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStrings(item, strings))
  }
  return strings
}

export function auditStudentLearning(data) {
  const errors = []
  let auditedSections = 0

  for (const [chapter, sections] of Object.entries(requiredLessons)) {
    for (const section of sections) {
      const label = `${chapter} ${section}`
      const lesson = data?.[chapter]?.[section]

      if (!lesson || typeof lesson !== 'object' || Array.isArray(lesson)) {
        errors.push(`${label}: 缺少节次`)
        continue
      }

      auditedSections += 1

      for (const field of ['objectives', 'overview', 'knowledgeBlocks']) {
        if (!isNonEmpty(lesson[field])) {
          errors.push(`${label}: 缺少非空 ${field}`)
        }
      }

      if (Object.hasOwn(lesson, 'practice') && !Array.isArray(lesson.practice)) {
        errors.push(`${label}: practice 必须为数组`)
      }

      const hasOptionalContent = ['mechanismChains', 'caseStudies', 'misconceptions']
        .some((field) => isNonEmpty(lesson[field]))
        || (Array.isArray(lesson.practice) && lesson.practice.length > 0)

      if (!hasOptionalContent) {
        errors.push(`${label}: mechanismChains、caseStudies、misconceptions、practice 至少一项必须非空`)
      }

      if (!isNonEmpty(lesson.memoryTips) && !isNonEmpty(lesson.answerTemplates)) {
        errors.push(`${label}: memoryTips、answerTemplates 至少一项必须非空`)
      }

      if (Array.isArray(lesson.practice)) {
        lesson.practice.forEach((practice, index) => {
          for (const field of ['question', 'answer', 'explanation', 'knowledgePoint']) {
            if (!isNonEmpty(practice?.[field])) {
              errors.push(`${label}: 第 ${index + 1} 道练习缺少非空 ${field}`)
            }
          }
        })
      }

      for (const text of collectStrings(lesson)) {
        for (const pattern of forbiddenPatterns) {
          if (text.includes(pattern)) {
            errors.push(`${label}: 包含禁止文本模式 ${JSON.stringify(pattern)}`)
          }
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    auditedSections,
    requiredSections: Object.values(requiredLessons).flat().length,
    errors,
  }
}

async function runCli() {
  const defaultPath = fileURLToPath(
    new URL('../src/textbook/data/高中/必修第一册/student-learning.json', import.meta.url),
  )
  const jsonPath = process.argv[2] ?? defaultPath

  try {
    const data = JSON.parse(await readFile(jsonPath, 'utf8'))
    const result = auditStudentLearning(data)

    if (result.ok) {
      console.log(`Student learning audit passed: ${result.auditedSections}/${result.requiredSections} sections`)
      return
    }

    console.error(`Student learning audit failed: ${result.errors.length} error(s)`)
    result.errors.forEach((error) => console.error(`- ${error}`))
    process.exitCode = 1
  } catch (error) {
    console.error(`Student learning audit failed: ${error.message}`)
    process.exitCode = 1
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await runCli()
}
