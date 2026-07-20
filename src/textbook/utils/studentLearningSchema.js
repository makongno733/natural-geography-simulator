const strings = (value) => Array.isArray(value)
  ? value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
  : []

const objects = (value, isValid) => Array.isArray(value)
  ? value.filter((item) => item && typeof item === 'object' && isValid(item))
  : []

export function normalizeStudentLearning(input) {
  if (!input || typeof input !== 'object') return null

  return {
    estimatedMinutes: Number.isFinite(input.estimatedMinutes) ? input.estimatedMinutes : 10,
    objectives: strings(input.objectives),
    keyFocus: strings(input.keyFocus),
    difficulties: strings(input.difficulties),
    overview: typeof input.overview === 'string' ? input.overview.trim() : '',
    knowledgeBlocks: objects(input.knowledgeBlocks, (item) => typeof item.title === 'string' && item.title.trim()),
    mechanismChains: objects(input.mechanismChains, (item) => typeof item.title === 'string' && strings(item.steps).length > 1)
      .map((item) => ({ ...item, steps: strings(item.steps) })),
    caseStudies: objects(input.caseStudies, (item) => typeof item.title === 'string' && item.title.trim()),
    misconceptions: objects(input.misconceptions, (item) => typeof item.wrong === 'string' && typeof item.correct === 'string'),
    practice: objects(input.practice, (item) => typeof item.question === 'string' && item.question.trim() && typeof item.answer === 'string' && item.answer.trim()),
    memoryTips: strings(input.memoryTips),
    answerTemplates: objects(input.answerTemplates, (item) => typeof item.title === 'string' && typeof item.template === 'string'),
  }
}
