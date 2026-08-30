import { describe, expect, it } from 'vitest'
import { grades } from './index.js'
import {
  auditExperimentCoverage,
  getSectionExperimentLink,
  getTextbooksForExperiment,
} from './experimentLinks.js'

describe('textbook experiment links', () => {
  it('maps a full section key to a curated experiment and preset', () => {
    expect(getSectionExperimentLink({
      grade: '高中', book: '必修第一册', chapter: '第三章', section: '第一节',
    })).toMatchObject({
      confidence: 'curated',
      primary: { experimentId: 'water-cycle-3d', presetId: 'water-cycle' },
    })
  })

  it('covers at least 106 of the 117 middle and high school sections', () => {
    const audit = auditExperimentCoverage(grades)

    expect(audit.total).toBe(117)
    expect(audit.curated).toBeGreaterThanOrEqual(106)
    expect(audit.invalidExperiments).toEqual([])
    expect(audit.invalidPresets).toEqual([])
    expect(audit.duplicateKeys).toEqual([])
    expect(audit.orphanKeys).toEqual([])
  })

  it('supports reverse lookup from experiment to textbooks', () => {
    expect(getTextbooksForExperiment('water-cycle-3d')).toContainEqual(expect.objectContaining({
      grade: '高中', book: '必修第一册', chapter: '第三章', section: '第一节',
    }))
  })

  it('reports duplicate raw configuration keys before building the registry', () => {
    const key = '高中|必修第一册|第三章'
    const audit = auditExperimentCoverage(grades, {
      chapterDefaults: [
        { key, primary: ['water-cycle-3d', 'water-cycle'] },
        { key, primary: ['water-cycle-3d', 'water-movement'] },
      ],
      sectionOverrides: [],
    })

    expect(audit.duplicateKeys).toEqual([key])
  })

  it('reports orphan raw configuration keys before building the registry', () => {
    const key = '高中|必修第一册|第三章|不存在的小节'
    const audit = auditExperimentCoverage(grades, {
      chapterDefaults: [],
      sectionOverrides: [{ key, primary: ['water-cycle-3d', 'water-cycle'] }],
    })

    expect(audit.orphanKeys).toEqual([key])
  })
})
