import { describe, it, expect } from 'vitest'
import { queryGlobalGeography, EXPERIMENT_INDEX, LAB_INDEX } from '../globalSearchIndex.js'

describe('Global Geography Search Index', () => {
  it('returns empty array when query is empty', () => {
    expect(queryGlobalGeography('')).toEqual([])
    expect(queryGlobalGeography('   ')).toEqual([])
  })

  it('searches experiments by keyword', () => {
    const results = queryGlobalGeography('热力环流')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].title).toContain('热力环流')
    expect(results[0].category).toBe('地理实验室')
  })

  it('searches terrain labs by keyword', () => {
    const results = queryGlobalGeography('DEM')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.title.includes('DEM') || r.desc.includes('DEM'))).toBe(true)
  })

  it('searches curriculum by keyword', () => {
    const results = queryGlobalGeography('必修一')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.category === '教材与知识库')).toBe(true)
  })

  it('searches community posts by keyword', () => {
    const results = queryGlobalGeography('水文')
    expect(results.length).toBeGreaterThan(0)
  })

  it('limits result count up to 12 items', () => {
    const results = queryGlobalGeography('地理')
    expect(results.length).toBeLessThanOrEqual(12)
  })
})
