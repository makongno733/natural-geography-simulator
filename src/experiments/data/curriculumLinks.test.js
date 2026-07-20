import { describe, expect, it } from 'vitest'
import { grades } from '../../textbook/data/index.js'
import modules from '../modules/index.js'
import {
  curriculumLinks,
  filterExperiments,
  getCurriculumRefsForExperiment,
  getExperimentFilterOptions,
  getExperimentsForSection,
  isLinkedCurriculumSection,
} from './curriculumLinks.js'

function catalogHas(ref) {
  const grade = grades.find((item) => item.id === ref.grade)
  const book = grade?.books.find((item) => item.id === ref.book)
  const chapter = book?.chapters.find((item) => item.id === ref.chapter)
  return Boolean(chapter?.sections.some((item) => item.id === ref.section))
}

describe('curriculum experiment links', () => {
  it('references only real experiments and real junior/senior sections', () => {
    const experimentIds = new Set(modules.map((item) => item.id))

    for (const link of curriculumLinks) {
      expect(['初中', '高中']).toContain(link.grade)
      expect(catalogHas(link)).toBe(true)
      expect(link.experimentIds.length).toBeGreaterThan(0)
      expect(new Set(link.experimentIds).size).toBe(link.experimentIds.length)
      link.experimentIds.forEach((id) => expect(experimentIds.has(id)).toBe(true))
    }
  })

  it('returns only exact matches for a section', () => {
    expect(
      getExperimentsForSection('高中', '必修第一册', '第二章', '第二节').map((item) => item.id)
    ).toEqual(['thermal-circulation', 'coriolis'])

    expect(
      getExperimentsForSection('高中', '必修第一册', '第二章', '第一节')
    ).toEqual([])
  })

  it('omits rejected experiment relationships while preserving the other section experiments', () => {
    const requiredOne = getExperimentsForSection(
      '高中', '必修第一册', '第五章', '第二节'
    ).map((item) => item.id)
    expect(requiredOne).not.toContain('potato-core')
    expect(requiredOne).toEqual(expect.arrayContaining(['infiltration', 'soil-erosion']))

    const electiveThreeResources = getExperimentsForSection(
      '高中', '选择性必修3', '第二章', '第三节'
    ).map((item) => item.id)
    expect(electiveThreeResources).not.toContain('potato-core')
    expect(electiveThreeResources).toEqual(expect.arrayContaining(['soil-erosion', 'infiltration']))

    const electiveThreeEnvironment = getExperimentsForSection(
      '高中', '选择性必修3', '第三章', '第二节'
    ).map((item) => item.id)
    expect(electiveThreeEnvironment).not.toContain('water-cycle')
    expect(electiveThreeEnvironment).toContain('groundwater')
  })

  it('supports reverse lookup and stable generated options', () => {
    const refs = getCurriculumRefsForExperiment('water-cycle')
    expect(refs).toContainEqual(expect.objectContaining({
      grade: '高中',
      book: '必修第一册',
      chapter: '第三章',
      section: '第一节',
    }))

    expect(getExperimentFilterOptions()).toEqual(expect.objectContaining({
      grades: ['初中', '高中'],
      booksByGrade: expect.objectContaining({
        初中: expect.arrayContaining(['七年级上册', '八年级上册']),
        高中: expect.arrayContaining(['必修第一册', '选择性必修1']),
      }),
    }))
  })

  it('recognizes only sections present in the explicit relationship index', () => {
    expect(isLinkedCurriculumSection('高中', '必修第一册', '第二章', '第二节')).toBe(true)
    expect(isLinkedCurriculumSection('高中', '伪造教材', '第二章', '第二节')).toBe(false)
  })

  it('searches metadata and combines all filters with AND semantics', () => {
    expect(filterExperiments({ search: '水循环' }).map((item) => item.id)).toContain('water-cycle')
    expect(filterExperiments({ search: '凝结' }).map((item) => item.id)).toContain('cloud-bottle')

    expect(filterExperiments({
      grade: '高中',
      book: '必修第一册',
      category: 'meteorology',
      type: '3d',
    }).map((item) => item.id)).toEqual(['thermal-circulation', 'coriolis'])
  })

  it('trims search text and treats unknown filter values as all', () => {
    expect(filterExperiments({ search: '  月相  ' }).map((item) => item.id)).toContain('moon-phases')
    expect(filterExperiments({ grade: '不存在' })).toHaveLength(modules.length)
  })
})
