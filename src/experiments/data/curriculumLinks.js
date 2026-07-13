import modules from '../modules/index.js'

export const curriculumLinks = [
  { grade: '初中', book: '七年级上册', chapter: '第一章', section: '第一节', experimentIds: ['kepler-laws'] },
  { grade: '初中', book: '七年级上册', chapter: '第一章', section: '第三节', experimentIds: ['solar-motion', 'seasons'] },
  { grade: '初中', book: '七年级上册', chapter: '第三章', section: '第三节', experimentIds: ['fault-model', 'stratigraphy'] },
  { grade: '初中', book: '八年级上册', chapter: '第二章', section: '第二节', experimentIds: ['thermal-circulation', 'coriolis', 'cloud-bottle', 'weather-instruments'] },
  { grade: '初中', book: '八年级上册', chapter: '第二章', section: '第三节', experimentIds: ['stream-table', 'sediment-transport'] },
  { grade: '初中', book: '八年级上册', chapter: '第三章', section: '第二节', experimentIds: ['soil-erosion', 'infiltration'] },
  { grade: '初中', book: '八年级上册', chapter: '第三章', section: '第三节', experimentIds: ['water-cycle', 'groundwater', 'infiltration'] },

  { grade: '高中', book: '必修第一册', chapter: '第一章', section: '第一节', experimentIds: ['kepler-laws'] },
  { grade: '高中', book: '必修第一册', chapter: '第一章', section: '第三节', experimentIds: ['stratigraphy'] },
  { grade: '高中', book: '必修第一册', chapter: '第二章', section: '第二节', experimentIds: ['thermal-circulation', 'coriolis'] },
  { grade: '高中', book: '必修第一册', chapter: '第三章', section: '第一节', experimentIds: ['water-cycle', 'infiltration', 'groundwater'] },
  { grade: '高中', book: '必修第一册', chapter: '第三章', section: '第三节', experimentIds: ['coriolis'] },
  { grade: '高中', book: '必修第一册', chapter: '第四章', section: '第一节', experimentIds: ['stream-table', 'sediment-transport', 'fault-model'] },
  { grade: '高中', book: '必修第一册', chapter: '第四章', section: '第二节', experimentIds: ['stratigraphy'] },
  { grade: '高中', book: '必修第一册', chapter: '第五章', section: '第二节', experimentIds: ['infiltration', 'soil-erosion'] },

  { grade: '高中', book: '选择性必修1', chapter: '第一章', section: '第一节', experimentIds: ['solar-motion', 'seasons', 'kepler-laws'] },
  { grade: '高中', book: '选择性必修1', chapter: '第一章', section: '第二节', experimentIds: ['solar-motion', 'seasons', 'moon-phases', 'eclipse'] },
  { grade: '高中', book: '选择性必修1', chapter: '第二章', section: '第一节', experimentIds: ['fault-model', 'stratigraphy'] },
  { grade: '高中', book: '选择性必修1', chapter: '第二章', section: '第二节', experimentIds: ['fault-model'] },
  { grade: '高中', book: '选择性必修1', chapter: '第二章', section: '第三节', experimentIds: ['stream-table', 'sediment-transport'] },
  { grade: '高中', book: '选择性必修1', chapter: '第三章', section: '第一节', experimentIds: ['thermal-circulation', 'coriolis', 'cloud-bottle', 'weather-instruments'] },
  { grade: '高中', book: '选择性必修1', chapter: '第三章', section: '第二节', experimentIds: ['thermal-circulation', 'coriolis'] },
  { grade: '高中', book: '选择性必修1', chapter: '第三章', section: '第三节', experimentIds: ['thermal-circulation', 'coriolis'] },
  { grade: '高中', book: '选择性必修1', chapter: '第四章', section: '第一节', experimentIds: ['water-cycle', 'groundwater', 'infiltration'] },
  { grade: '高中', book: '选择性必修1', chapter: '第四章', section: '第二节', experimentIds: ['coriolis'] },
  { grade: '高中', book: '选择性必修1', chapter: '第四章', section: '第三节', experimentIds: ['thermal-circulation', 'coriolis', 'water-cycle'] },

  { grade: '高中', book: '选择性必修2', chapter: '第二章', section: '第二节', experimentIds: ['soil-erosion', 'infiltration'] },
  { grade: '高中', book: '选择性必修2', chapter: '第四章', section: '第一节', experimentIds: ['stream-table', 'sediment-transport', 'water-cycle'] },

  { grade: '高中', book: '选择性必修3', chapter: '第二章', section: '第三节', experimentIds: ['soil-erosion', 'infiltration'] },
  { grade: '高中', book: '选择性必修3', chapter: '第三章', section: '第二节', experimentIds: ['groundwater'] },
]

const validGrades = new Set(curriculumLinks.map((link) => link.grade))
const booksByGrade = curriculumLinks.reduce((result, link) => {
  if (!result[link.grade]) result[link.grade] = []
  if (!result[link.grade].includes(link.book)) result[link.grade].push(link.book)
  return result
}, {})

function matchesSection(link, grade, book, chapter, section) {
  return link.grade === grade && link.book === book && link.chapter === chapter && link.section === section
}

export function isLinkedCurriculumSection(grade, book, chapter, section) {
  return curriculumLinks.some((link) => matchesSection(link, grade, book, chapter, section))
}

export function getExperimentsForSection(grade, book, chapter, section) {
  const ids = curriculumLinks
    .filter((link) => matchesSection(link, grade, book, chapter, section))
    .flatMap((link) => link.experimentIds)
  const idSet = new Set(ids)
  return modules.filter((experiment) => idSet.has(experiment.id))
}

export function getCurriculumRefsForExperiment(experimentId) {
  return curriculumLinks
    .filter((link) => link.experimentIds.includes(experimentId))
    .map(({ experimentIds, ...ref }) => ref)
}

export function getExperimentFilterOptions() {
  return {
    grades: [...validGrades],
    booksByGrade: Object.fromEntries(
      Object.entries(booksByGrade).map(([grade, books]) => [grade, [...books]])
    ),
  }
}

function isKnownBook(grade, book) {
  if (!book) return false
  if (grade && validGrades.has(grade)) return booksByGrade[grade]?.includes(book) || false
  return Object.values(booksByGrade).some((books) => books.includes(book))
}

export function filterExperiments(filters = {}) {
  const search = String(filters.search || '').trim().toLocaleLowerCase('zh-CN')
  const grade = validGrades.has(filters.grade) ? filters.grade : ''
  const book = isKnownBook(grade, filters.book) ? filters.book : ''
  const category = modules.some((item) => item.category === filters.category) ? filters.category : ''
  const type = modules.some((item) => item.type === filters.type) ? filters.type : ''

  const curriculumIds = grade || book
    ? new Set(curriculumLinks
      .filter((link) => (!grade || link.grade === grade) && (!book || link.book === book))
      .flatMap((link) => link.experimentIds))
    : null

  return modules.filter((experiment) => {
    const searchable = [experiment.name, experiment.description, ...(experiment.concepts || [])]
      .join(' ')
      .toLocaleLowerCase('zh-CN')
    return (!search || searchable.includes(search))
      && (!curriculumIds || curriculumIds.has(experiment.id))
      && (!category || experiment.category === category)
      && (!type || experiment.type === type)
  })
}
