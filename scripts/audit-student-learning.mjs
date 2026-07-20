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

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0
const isNonEmptyStringArray = (value) => Array.isArray(value)
  && value.length > 0
  && value.every(isNonEmptyString)

function isNonEmpty(value) {
  if (isNonEmptyString(value)) return true
  if (Array.isArray(value)) return value.length > 0
  return isRecord(value) && Object.keys(value).length > 0
}

function collectStrings(value, strings = []) {
  if (typeof value === 'string') {
    strings.push(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, strings))
  } else if (isRecord(value)) {
    Object.values(value).forEach((item) => collectStrings(item, strings))
  }
  return strings
}

function hasArrayBounds(value, min, max) {
  return Array.isArray(value) && value.length >= min && value.length <= max
}

export function auditStudentLearning(data) {
  const errors = []
  let auditedSections = 0

  for (const [chapter, sections] of Object.entries(requiredLessons)) {
    for (const section of sections) {
      const label = `${chapter} ${section}`
      const lesson = data?.[chapter]?.[section]

      if (!isRecord(lesson)) {
        errors.push(`${label}: 缺少节次`)
        continue
      }

      auditedSections += 1

      if (!isNonEmptyStringArray(lesson.objectives)) {
        errors.push(`${label}: 缺少非空 objectives`)
      } else if (!hasArrayBounds(lesson.objectives, 2, 4)) {
        errors.push(`${label}: objectives 必须包含 2–4 项`)
      }

      const overview = typeof lesson.overview === 'string' ? lesson.overview.trim() : ''
      if (!overview) {
        errors.push(`${label}: 缺少非空 overview`)
      } else if (overview.length < 100 || overview.length > 180) {
        errors.push(`${label}: overview 长度必须为 100–180 个字符`)
      }

      if (!Array.isArray(lesson.knowledgeBlocks) || lesson.knowledgeBlocks.length === 0) {
        errors.push(`${label}: 缺少非空 knowledgeBlocks`)
      } else {
        if (!hasArrayBounds(lesson.knowledgeBlocks, 2, 4)) {
          errors.push(`${label}: knowledgeBlocks 必须包含 2–4 项`)
        }
        lesson.knowledgeBlocks.forEach((block, index) => {
          const blockLabel = `${label}: 第 ${index + 1} 个 knowledgeBlocks`
          if (!isRecord(block) || !isNonEmptyString(block.title)) {
            errors.push(`${blockLabel} 缺少非空 title`)
          }
          if (!isRecord(block) || !Array.isArray(block.items) || block.items.length === 0) {
            errors.push(`${blockLabel} 缺少非空 items`)
          } else {
            block.items.forEach((item, itemIndex) => {
              if (!isRecord(item) || !isNonEmptyString(item.name) || !isNonEmptyString(item.detail)) {
                errors.push(`${blockLabel} 第 ${itemIndex + 1} 项必须包含非空 name 和 detail`)
              }
            })
          }
        })
      }

      if (Object.hasOwn(lesson, 'mechanismChains')) {
        if (!hasArrayBounds(lesson.mechanismChains, 1, 3)) {
          errors.push(`${label}: mechanismChains 必须为包含 1–3 项的数组`)
        } else {
          lesson.mechanismChains.forEach((chain, index) => {
            if (!isRecord(chain) || !isNonEmptyString(chain.title)
              || !Array.isArray(chain.steps) || chain.steps.length < 2
              || !chain.steps.every(isNonEmptyString)) {
              errors.push(`${label}: 第 ${index + 1} 个 mechanismChains 必须包含非空 title 和至少两个非空 steps`)
            }
          })
        }
      }

      if (Object.hasOwn(lesson, 'caseStudies')) {
        if (!hasArrayBounds(lesson.caseStudies, 0, 2)) {
          errors.push(`${label}: caseStudies 必须为包含 0–2 项的数组`)
        } else {
          lesson.caseStudies.forEach((item, index) => {
            if (!isRecord(item) || !['title', 'context', 'question', 'conclusion'].every((field) => isNonEmptyString(item[field]))) {
              errors.push(`${label}: 第 ${index + 1} 个 caseStudies 必须包含非空 title、context、question 和 conclusion`)
            }
          })
        }
      }

      if (Object.hasOwn(lesson, 'misconceptions')) {
        if (!hasArrayBounds(lesson.misconceptions, 1, 3)) {
          errors.push(`${label}: misconceptions 必须为包含 1–3 项的数组`)
        } else {
          lesson.misconceptions.forEach((item, index) => {
            if (!isRecord(item) || !['wrong', 'reason', 'correct'].every((field) => isNonEmptyString(item[field]))) {
              errors.push(`${label}: 第 ${index + 1} 个 misconceptions 必须包含非空 wrong、reason 和 correct`)
            }
          })
        }
      }

      if (!Array.isArray(lesson.practice)) {
        errors.push(`${label}: practice 必须为数组`)
      } else if (lesson.practice.length === 0) {
        errors.push(`${label}: practice 必须为非空数组`)
      } else {
        lesson.practice.forEach((practice, index) => {
          const questionLabel = `${label}: 第 ${index + 1} 道练习`
          if (!isRecord(practice)) {
            errors.push(`${questionLabel} 必须为对象`)
            return
          }
          if (!['single-choice', 'short-answer'].includes(practice.type)) {
            errors.push(`${questionLabel} type 仅支持 single-choice 或 short-answer`)
          }
          for (const field of ['question', 'answer', 'explanation', 'knowledgePoint']) {
            if (!isNonEmptyString(practice[field])) {
              errors.push(`${questionLabel}缺少非空 ${field}`)
            }
          }
          if (practice.type === 'single-choice'
            && (!Array.isArray(practice.options) || practice.options.length < 2 || !practice.options.every(isNonEmptyString))) {
            errors.push(`${questionLabel}的 single-choice options 必须至少包含两个非空选项`)
          }
        })
      }

      if (Object.hasOwn(lesson, 'memoryTips')) {
        if (!Array.isArray(lesson.memoryTips)
          || (lesson.memoryTips.length > 0
            && (!hasArrayBounds(lesson.memoryTips, 1, 3) || !lesson.memoryTips.every(isNonEmptyString)))) {
          errors.push(`${label}: memoryTips 使用时必须为包含 1–3 个非空字符串的数组`)
        }
      }

      if (Object.hasOwn(lesson, 'answerTemplates')) {
        if (!Array.isArray(lesson.answerTemplates)
          || lesson.answerTemplates.some((item) => !isRecord(item)
            || !isNonEmptyString(item.title) || !isNonEmptyString(item.template))) {
          errors.push(`${label}: answerTemplates 使用时必须包含非空 title 和 template`)
        }
      }

      if (!Number.isFinite(lesson.estimatedMinutes) || lesson.estimatedMinutes <= 0) {
        errors.push(`${label}: estimatedMinutes 必须为正有限数`)
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
