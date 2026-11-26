import { describe, it, expect } from 'vitest'
import {
  queryGlobalGeography,
  normalizeSearchQuery,
  isExactTitleOrConceptMatch,
  EXPERIMENT_INDEX,
  getAllStaticSearchPools
} from '../globalSearchIndex.js'
import { getExperiment } from '../../experiments/catalog.js'
import {
  normalizeTopicTagName,
  derivePostTags,
  deriveHotTopicTags,
  derivePaperTags
} from '../topicTags.js'

describe('Global Geography Search Index & Wikipedia-style Matching', () => {
  it('returns empty array when query is empty or whitespace', () => {
    expect(queryGlobalGeography('')).toEqual([])
    expect(queryGlobalGeography('   ')).toEqual([])
  })

  it('normalizes leading hash signs, extra spaces, and case sensitivity', () => {
    expect(normalizeSearchQuery('  #热力环流  ')).toBe('热力环流')
    expect(normalizeSearchQuery('＃DEM   高程')).toBe('DEM 高程')
    const lowerDem = queryGlobalGeography('dem')
    const upperDem = queryGlobalGeography('  #DEM  ')
    expect(lowerDem.length).toBeGreaterThan(0)
    expect(lowerDem[0].id).toBe(upperDem[0].id)
  })

  it('flags exact title / core concept matches and ranks experiment first', () => {
    const results = queryGlobalGeography('热力环流')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].title).toContain('热力环流')
    expect(results[0].category).toBe('地理实验室')
    expect(results[0].exactMatch).toBe(true)
    expect(isExactTitleOrConceptMatch(results[0], '热力环流')).toBe(true)
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

  it('searches across Fanxing citizen science projects, DOI literature, and open resources', () => {
    const fanxingResults = queryGlobalGeography('徐州')
    expect(fanxingResults.some(r => r.typeKey === 'fanxing' && r.route.includes('/fanxing/xuzhou-land-cover'))).toBe(true)

    const spongeResults = queryGlobalGeography('海绵城市', { limit: 25 })
    expect(spongeResults.some(r => r.typeKey === 'inquiry')).toBe(true)
    expect(spongeResults.some(r => r.typeKey === 'curriculum')).toBe(true)
    expect(spongeResults.some(r => r.typeKey === 'fanxing')).toBe(true)

    const era5Results = queryGlobalGeography('ERA5')
    expect(era5Results.some(r => r.typeKey === 'resource' && r.route === '/resources')).toBe(true)
  })

  it('supports filtering by real content typeKey', () => {
    const onlyCurriculum = queryGlobalGeography('水循环', { typeFilter: 'curriculum', limit: 20 })
    expect(onlyCurriculum.length).toBeGreaterThan(0)
    expect(onlyCurriculum.every(r => r.typeKey === 'curriculum')).toBe(true)
  })

  it('does not present sample posts or unrelated non-matching queries as search results', () => {
    expect(queryGlobalGeography('741295810')).toEqual([])
    expect(queryGlobalGeography('全国高校地理学研讨与学者共同体')).toEqual([])
    expect(queryGlobalGeography('火星极冠冰川消融999')).toEqual([])
  })

  it('limits result count up to default 12 items', () => {
    const results = queryGlobalGeography('地理')
    expect(results.length).toBeLessThanOrEqual(12)
  })

  it('Q06: every experiment search index route resolves to a valid catalog experiment or standalone 3D sandbox route', () => {
    const validStandaloneExperimentRoutes = new Set(['/earth3d', '/earth3d?mode=professional', '/disasters', '/map', '/geo'])
    for (const item of EXPERIMENT_INDEX) {
      if (item.route.startsWith('/experiments/')) {
        const parts = item.route.split('/').filter(Boolean)
        expect(parts).toHaveLength(3)
        const [, category, expId] = parts
        const catalogEntry = getExperiment(expId)
        expect(catalogEntry, `Experiment ${item.id} -> ${item.route} not found in catalog.js`).not.toBeNull()
        expect(catalogEntry.category).toBe(category)
      } else {
        expect(validStandaloneExperimentRoutes.has(item.route), `Unexpected standalone route: ${item.route}`).toBe(true)
      }
    }

    const soilResults = queryGlobalGeography('土壤剖面')
    expect(soilResults[0].id).toBe('exp-soil-profile')
    expect(soilResults[0].route).toBe('/experiments/systems/soil-profile-3d')

    const celestialResults = queryGlobalGeography('天球坐标')
    expect(celestialResults[0].id).toBe('exp-celestial')
    expect(celestialResults[0].route).toBe('/earth3d?mode=professional')

    for (const poolItem of getAllStaticSearchPools()) {
      expect(typeof poolItem.route).toBe('string')
      expect(poolItem.route.startsWith('/')).toBe(true)
    }
  })
})

describe('Structured Homepage Topic Tag Derivation', () => {
  it('normalizes synonym tags, strips leading hashes, and truncates overly long tag strings', () => {
    expect(normalizeTopicTagName(' #dem ')).toBe('DEM高程')
    expect(normalizeTopicTagName('喀斯特')).toBe('喀斯特地貌')
    expect(normalizeTopicTagName('这是一个超过十八个字符的超长地理测试标签字符串')).toHaveLength(18)
  })

  it('derives deduplicated tags for community posts from user tags, linked experiments, and verified regions', () => {
    const post = {
      title: '关于青藏高原 30m DEM 填洼与水文连通性的探讨',
      tags: ['dem', 'DEM高程', '水文连通性'],
      linkedExperiment: 'stream-table',
      evidenceId: 'ev-urban-sponge'
    }
    const tags = derivePostTags(post)
    const labels = tags.map(t => t.label)
    expect(labels).toContain('DEM高程')
    expect(labels.filter(l => l === 'DEM高程')).toHaveLength(1)
    expect(labels).toContain('流水侵蚀水槽实验')
    expect(labels).toContain('青藏高原')
  })

  it('derives accurate event type, discipline, verified region, and source method tags for NASA/USGS events without fabricating locations', () => {
    const eqTopic = {
      id: 'sample-usgs-1',
      title: 'M6.4 地震 · 30 km WSW of Lata, Solomon Islands',
      tag: '地震',
      sourceUrl: 'https://earthquake.usgs.gov/earthquakes/eventpage/us123'
    }
    const eqTags = deriveHotTopicTags(eqTopic).map(t => t.label)
    expect(eqTags).toContain('地震监测')
    expect(eqTags).toContain('构造地质与地震')
    expect(eqTags).toContain('所罗门群岛')
    expect(eqTags).toContain('USGS地震台网测报')

    const unknownPlaceEvent = {
      id: 'eonet-99',
      title: 'Wildfire 2026',
      tag: '野火',
      sourceUrl: 'https://eonet.gsfc.nasa.gov/api/v3/events/EONET_99'
    }
    const fireTags = deriveHotTopicTags(unknownPlaceEvent)
    expect(fireTags.some(t => t.dimension === 'region')).toBe(false)
    expect(fireTags.map(t => t.label)).toContain('NASA EONET事件记录')
  })

  it('derives discipline, dataset/method, and verified region tags for curated DOI papers', () => {
    const clcdPaper = {
      doi: '10.5194/essd-13-3907-2021',
      title: 'The 30 m annual land cover dataset and its dynamics in China from 1990 to 2019 (CLCD)',
      topic: '遥感与土地覆盖',
      projectId: 'xuzhou-land-cover',
      workTypeLabel: '期刊论文（精选文献）'
    }
    const tags = derivePaperTags(clcdPaper).map(t => t.label)
    expect(tags).toContain('遥感与土地覆盖')
    expect(tags).toContain('CLCD 30m数据集')
    expect(tags).toContain('中国区域研究')
    expect(tags).toContain('期刊论文')
  })
})
