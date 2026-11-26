import { normalizeSearchQuery } from './globalSearchIndex.js'
import { deriveHotTopicTags } from './topicTags.js'
import { eventDisplayTitle } from '../community/eventTitle.js'

// Event destinations come from a remote feed. Only link to the known monitoring services.
export function monitoringSourceUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) return null
    if (!['earthquake.usgs.gov', 'eonet.gsfc.nasa.gov'].includes(url.hostname)) return null
    return url.href
  } catch { return null }
}

export function searchEventTopics(topics, query) {
  const q = normalizeSearchQuery(query).toLowerCase()
  if (!q || !Array.isArray(topics)) return []
  return topics.filter(topic => topic && !topic.isSample).flatMap(topic => {
    const sourceUrl = monitoringSourceUrl(topic.sourceUrl)
    if (!sourceUrl) return []
    const title = eventDisplayTitle(String(topic.title || ''))
    const tags = deriveHotTopicTags(topic).map(tag => tag.label)
    const text = `${title} ${topic.title || ''} ${topic.category || ''} ${topic.tag || ''} ${String(topic.summary || '').replace(/北京时间(?:\s*UTC\+8)?/g, '')} ${tags.join(' ')}`.toLowerCase()
    if (!q.split(/\s+/).every(term => text.includes(term))) return []
    return [{ id: `event-${topic.id}`, type: '监测事件', typeKey: 'event', category: '近期地理事件',
      badge: new URL(sourceUrl).hostname === 'earthquake.usgs.gov' ? 'USGS 监测记录' : 'NASA EONET 事件记录',
      title, desc: topic.summary || '', tags, sourceUrl,
      exactMatch: [title.toLowerCase(), String(topic.title || '').toLowerCase()].includes(q) }]
  })
}
