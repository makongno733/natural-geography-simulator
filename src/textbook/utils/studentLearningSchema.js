const cleanString = (value) => typeof value === 'string' ? value.trim() : ''

const strings = (value) => Array.isArray(value)
  ? value.map(cleanString).filter(Boolean)
  : []

const records = (value) => Array.isArray(value)
  ? value.filter((item) => item && typeof item === 'object' && !Array.isArray(item))
  : []

const cleanKnowledgeBlocks = (value) => records(value)
  .map((block) => ({
    title: cleanString(block.title),
    summary: cleanString(block.summary),
    items: records(block.items)
      .map((item) => ({ name: cleanString(item.name), detail: cleanString(item.detail) }))
      .filter((item) => item.name && item.detail),
  }))
  .filter((block) => block.title && block.items.length)

const cleanMechanismChains = (value) => records(value)
  .map((chain) => ({ ...chain, title: cleanString(chain.title), steps: strings(chain.steps) }))
  .filter((chain) => chain.title && chain.steps.length >= 2)

const cleanCaseStudies = (value) => records(value)
  .map((item) => ({
    title: cleanString(item.title),
    context: cleanString(item.context),
    question: cleanString(item.question),
    conclusion: cleanString(item.conclusion),
  }))
  .filter((item) => item.title && item.context && item.question && item.conclusion)

const cleanMisconceptions = (value) => records(value)
  .map((item) => ({
    wrong: cleanString(item.wrong),
    reason: cleanString(item.reason),
    correct: cleanString(item.correct),
  }))
  .filter((item) => item.wrong && item.reason && item.correct)

const cleanPractice = (value) => records(value)
  .map((item) => ({
    ...item,
    type: cleanString(item.type),
    question: cleanString(item.question),
    options: strings(item.options),
    answer: cleanString(item.answer),
    explanation: cleanString(item.explanation),
    knowledgePoint: cleanString(item.knowledgePoint),
    hint: cleanString(item.hint),
  }))
  .filter((item) => {
    if (!['single-choice', 'short-answer'].includes(item.type)) return false
    if (!item.question || !item.answer || !item.explanation || !item.knowledgePoint) return false
    return item.type !== 'single-choice' || item.options.length >= 2
  })

const cleanAnswerTemplates = (value) => records(value)
  .map((item) => ({ title: cleanString(item.title), template: cleanString(item.template) }))
  .filter((item) => item.title && item.template)

export function normalizeStudentLearning(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null

  const objectives = strings(input.objectives)
  const overview = cleanString(input.overview)
  const knowledgeBlocks = cleanKnowledgeBlocks(input.knowledgeBlocks)

  if (!objectives.length || !overview || !knowledgeBlocks.length) return null

  return {
    estimatedMinutes: Number.isFinite(input.estimatedMinutes) && input.estimatedMinutes > 0
      ? input.estimatedMinutes
      : 10,
    objectives,
    keyFocus: strings(input.keyFocus),
    difficulties: strings(input.difficulties),
    overview,
    knowledgeBlocks,
    mechanismChains: cleanMechanismChains(input.mechanismChains),
    caseStudies: cleanCaseStudies(input.caseStudies),
    misconceptions: cleanMisconceptions(input.misconceptions),
    practice: cleanPractice(input.practice),
    memoryTips: strings(input.memoryTips),
    answerTemplates: cleanAnswerTemplates(input.answerTemplates),
  }
}
