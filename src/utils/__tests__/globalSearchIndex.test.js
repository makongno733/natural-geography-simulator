import { describe, it, expect } from 'vitest'
import { queryGlobalGeography } from '../globalSearchIndex.js'

describe('Global Geography Search Index', () => {
  it('returns empty array when query is empty', () => {
    expect(queryGlobalGeography('')).toEqual([])
    expect(queryGlobalGeography('   ')).toEqual([])
  })

  it('searches experiments by keyword and ranks experiment first', () => {
    const results = queryGlobalGeography('热力环流')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].title).toContain('热力环流')
    expect(results[0].category).toBe('地理实验室')
  })

  it('matches natural student questions like "海风为什么吹向陆地" and ranks thermal circulation experiment first, followed by textbook', () => {
    const results = queryGlobalGeography('海风为什么吹向陆地')
    expect(results.length).toBeGreaterThanOrEqual(2)
    expect(results[0].id).toBe('exp-thermal')
    expect(results[0].route).toBe('/experiments/meteorology/thermal-circulation')
    expect(results.some(r => r.route === '/高中/必修第一册/第二章/第二节')).toBe(true)
  })

  it('matches natural student questions for urban flooding, anticline valleys, and solar shadow length', () => {
    const floodResults = queryGlobalGeography('同一场雨哪种路面积水更严重')
    expect(floodResults.length).toBeGreaterThan(0)
    expect(floodResults[0].id).toBe('lab-urban-flood')

    const foldResults = queryGlobalGeography('背斜为什么变成山谷')
    expect(foldResults.length).toBeGreaterThan(0)
    expect(foldResults[0].id).toBe('exp-fault')

    const solarResults = queryGlobalGeography('为什么夏天白天长冬天白天短')
    expect(solarResults.length).toBeGreaterThan(0)
    expect(solarResults[0].id).toBe('exp-solar')
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

  it('does not present sample posts or unrelated non-matching queries as search results', () => {
    expect(queryGlobalGeography('741295810')).toEqual([])
    expect(queryGlobalGeography('全国高校地理学研讨与学者共同体')).toEqual([])
    expect(queryGlobalGeography('火星极冠冰川消融999')).toEqual([])
  })

  it('limits result count up to 12 items', () => {
    const results = queryGlobalGeography('地理')
    expect(results.length).toBeLessThanOrEqual(12)
  })

  it('searches across expanded experiments, junior/senior textbooks, and cosmos topics', () => {
    expect(queryGlobalGeography('喀斯特').some(r => r.route.includes('landform-sandbox'))).toBe(true)
    expect(queryGlobalGeography('七年级').some(r => r.route.includes('/初中/'))).toBe(true)
    expect(queryGlobalGeography('弦理论').some(r => r.route === '/cosmos')).toBe(true)
    expect(queryGlobalGeography('ERA5').some(r => r.route === '/resources')).toBe(true)
  })
})
