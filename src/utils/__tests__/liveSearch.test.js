import { expect, it } from 'vitest'
import { deriveHotTopicTags } from '../topicTags.js'
import { searchEventTopics } from '../liveSearch.js'

const alaska = { id: 1, title: 'M4.2 地震 · Point MacKenzie, Alaska', tag: '地震',
  summary: '事件记录时间（北京时间 UTC+8）。可以讨论板块边界。',
  sourceUrl: 'https://earthquake.usgs.gov/earthquakes/eventpage/abc' }
it('never treats display timezone or generated discussion questions as event locations', () => {
  const iceberg = { ...alaska, title: 'Iceberg A84', tag: '海湖冰', summary: '北京时间 UTC+8；可与北京、阿拉斯加对比。' }
  expect(deriveHotTopicTags(iceberg).filter(t => t.dimension === 'region')).toEqual([])
  expect(deriveHotTopicTags({ ...alaska, title: 'M3.9 地震 · Commerce, CA' }).map(t => t.label)).toContain('美国加州')
  expect(deriveHotTopicTags({ ...alaska, title: '北京西山地震' }).map(t => t.label)).toContain('北京')
})
it('finds the original event using every displayed region/type/source tag and its translated title', () => {
  for (const tag of deriveHotTopicTags(alaska)) {
    expect(searchEventTopics([alaska], tag.query).map(t => t.id), tag.label).toEqual(['event-1'])
  }
  expect(searchEventTopics([alaska], ' #阿拉斯加 ')[0].sourceUrl).toBe(alaska.sourceUrl)
  expect(searchEventTopics([alaska], 'point mackenzie')[0].id).toBe('event-1')
})
it('excludes samples and unsafe or unrecognized source links', () => {
  for (const sourceUrl of ['javascript:alert(1)', 'https://earthquake.usgs.gov.evil.test/a', 'https://name:pass@earthquake.usgs.gov/a', 'http://earthquake.usgs.gov/a']) {
    expect(searchEventTopics([{ ...alaska, sourceUrl }], '地震')).toEqual([])
  }
  expect(searchEventTopics([{ ...alaska, isSample: true }], '地震')).toEqual([])
})
it('finds an iceberg by its source tag without indexing the display timezone as Beijing', () => {
  const iceberg = { id: 2, title: 'Iceberg A84', tag: '海湖冰', summary: '事件记录时间（北京时间 UTC+8）。', sourceUrl: 'https://eonet.gsfc.nasa.gov/api/v3/events/EONET_12618' }
  for (const tag of deriveHotTopicTags(iceberg)) expect(searchEventTopics([iceberg], tag.query)).toHaveLength(1)
  expect(searchEventTopics([iceberg], '北京')).toEqual([])
})
