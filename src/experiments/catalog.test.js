import { describe, expect, it } from 'vitest'
import {
  buildExperimentRoute,
  getExperiment,
  getExperimentPreset,
  listExperiments,
} from './catalog.js'

describe('experiment catalog', () => {
  it('keeps component loaders lazy and resolves registered experiments', () => {
    const item = getExperiment('thermal-circulation')
    expect(item.name).toBe('热力环流模拟实验')
    expect(typeof item.load).toBe('function')
    expect(listExperiments().length).toBeGreaterThanOrEqual(22)
  })

  it('rejects unknown presets instead of silently falling back', () => {
    expect(getExperimentPreset('thermal-circulation', 'thermal-cell')).toMatchObject({
      id: 'thermal-cell',
    })
    expect(getExperimentPreset('thermal-circulation', 'missing')).toBeNull()
  })

  it('builds a route that preserves the full textbook source', () => {
    expect(buildExperimentRoute({
      experimentId: 'thermal-circulation',
      presetId: 'thermal-cell',
      textbook: { grade: '高中', book: '必修第一册', chapter: '第二章', section: '第二节' },
    })).toEqual({
      name: 'experiment-view',
      params: { category: 'meteorology', experiment: 'thermal-circulation' },
      query: { preset: 'thermal-cell', grade: '高中', book: '必修第一册', chapter: '第二章', section: '第二节' },
    })
  })
})
