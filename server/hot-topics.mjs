import { database } from './database.mjs'

export const EONET_EVENTS_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=14&limit=60'
export const USGS_SIGNIFICANT_QUAKES_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson'

const REFRESH_MS = 30 * 60 * 1000
const RETRY_MS = 5 * 60 * 1000
let pendingSync

const categoryNames = new Map([
  ['severeStorms', '强风暴'], ['wildfires', '野火'], ['volcanoes', '火山活动'],
  ['floods', '洪水'], ['landslides', '滑坡'], ['drought', '干旱'],
  ['dustHaze', '沙尘与霾'], ['seaLakeIce', '海湖冰'], ['snow', '降雪'],
  ['temperatureExtremes', '极端气温'], ['waterColor', '水色变化'],
  ['earthquakes', '地震']
])

export function normalizeEonetEvent(event, fetchedAt) {
  if (!/^EONET_\d+$/.test(event?.id || '')) return null
  const title = typeof event.title === 'string' ? event.title.trim().slice(0, 120) : ''
  const geometry = Array.isArray(event.geometry) ? event.geometry : []
  const latest = geometry.filter(item => Number.isFinite(Date.parse(item?.date)))
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date)).at(-1)
  if (!title || !latest) return null
  const category = categoryNames.get(event.categories?.[0]?.id) || '自然地理事件'
  const occurredAt = new Date(latest.date).toISOString()
  const sourceUrl = `https://eonet.gsfc.nasa.gov/api/v3/events/${event.id}`
  const description = typeof event.description === 'string' ? event.description.trim().slice(0, 300) : ''
  const summary = description || `NASA EONET 收录的${category}事件，最近一次位置或状态记录为 ${occurredAt.slice(0, 16).replace('T', ' ')} UTC。事件范围与时间可能是近似值，请查看原始记录核实。`
  return { externalId: event.id, title, category, summary, sourceUrl, occurredAt, fetchedAt, tag: category }
}

export function normalizeUsgsEarthquake(feature, fetchedAt) {
  const id = feature?.id
  const props = feature?.properties
  if (!/^[A-Za-z0-9._-]{1,80}$/.test(id || '') || !props ||
      !Number.isFinite(props.mag) || !Number.isFinite(props.time) ||
      (props.type && props.type !== 'earthquake')) return null
  const occurredAt = new Date(props.time)
  if (!Number.isFinite(occurredAt.getTime())) return null
  const mag = props.mag.toFixed(1)
  const place = typeof props.place === 'string' && props.place.trim()
    ? props.place.trim().slice(0, 120) : '位置待核实'
  const title = `M${mag} 地震 · ${place}`.slice(0, 120)
  const sourceUrl = `https://earthquake.usgs.gov/earthquakes/eventpage/${encodeURIComponent(id)}`
  const summary = `USGS 显著地震目录记录：震级 M${mag}，位置 ${place}，记录时间 ${occurredAt.toISOString().slice(0, 16).replace('T', ' ')} UTC。震级与位置可能修订，请查看原始记录。`
  return {
    externalId: `USGS_${id}`,
    title,
    category: '地震',
    summary,
    sourceUrl,
    occurredAt: occurredAt.toISOString(),
    fetchedAt,
    tag: '地震'
  }
}

const sources = [
  { id: 'eonet', name: 'NASA EONET', url: EONET_EVENTS_URL, field: 'events', limit: 40, normalize: normalizeEonetEvent },
  { id: 'usgs', name: 'USGS', url: USGS_SIGNIFICANT_QUAKES_URL, field: 'features', limit: 15, normalize: normalizeUsgsEarthquake }
]

export async function syncHotTopics({ fetchImpl = fetch, now = Date.now(), sourceIds = sources.map(source => source.id) } = {}) {
  if (pendingSync) return pendingSync
  pendingSync = (async () => {
    const fetchedAt = new Date(now).toISOString()
    const upsert = database.prepare(`INSERT INTO community_hot_topic
      (title, category, summary, stats, tag, external_id, source_url, occurred_at, fetched_at)
      VALUES (@title, @category, @summary, '', @tag, @externalId, @sourceUrl, @occurredAt, @fetchedAt)
      ON CONFLICT(external_id) DO UPDATE SET title=excluded.title, category=excluded.category,
      summary=excluded.summary, tag=excluded.tag, source_url=excluded.source_url,
      occurred_at=excluded.occurred_at, fetched_at=excluded.fetched_at`)
    const outcomes = await Promise.all(sources.filter(source => sourceIds.includes(source.id)).map(async source => {
      try {
        const response = await fetchImpl(source.url, { signal: AbortSignal.timeout(8000) })
        if (!response.ok) throw new Error(`${source.name} HTTP ${response.status}`)
        const payload = await response.json()
        const records = payload?.[source.field]
        if (!Array.isArray(records)) throw new Error(`${source.name} response has no ${source.field} array`)
        const topics = records.slice(0, source.limit).map(record => source.normalize(record, fetchedAt)).filter(Boolean)
        if (records.length && !topics.length) throw new Error(`${source.name} response has no valid records`)
        if (topics.length < Math.min(records.length, source.limit)) {
          console.warn(`${source.name} skipped invalid event records`)
        }
        database.transaction(() => {
          for (const topic of topics) upsert.run(topic)
          database.prepare(`INSERT INTO geo_topic_sync (source, fetched_at, attempted_at, status, record_count)
            VALUES (?, ?, ?, 'ok', ?)
            ON CONFLICT(source) DO UPDATE SET fetched_at=excluded.fetched_at,
            attempted_at=excluded.attempted_at, status='ok', record_count=excluded.record_count`)
            .run(source.id, fetchedAt, fetchedAt, topics.length)
        })()
        return true
      } catch (error) {
        console.warn(`${source.name} sync failed:`, error.message)
        database.prepare(`INSERT INTO geo_topic_sync (source, fetched_at, attempted_at, status)
          VALUES (?, '', ?, 'error')
          ON CONFLICT(source) DO UPDATE SET attempted_at=excluded.attempted_at, status='error'`)
          .run(source.id, fetchedAt)
        return false
      }
    }))
    if (!outcomes.some(Boolean)) throw new Error('All geography event sources failed')

    database.transaction(() => {
      database.prepare('DELETE FROM community_hot_topic WHERE external_id IS NOT NULL AND occurred_at < ? AND post_id IS NULL')
        .run(new Date(now - 60 * 86400000).toISOString())
    })()

    return fetchedAt
  })().finally(() => { pendingSync = null })
  return pendingSync
}

export async function getHotTopics({ now = Date.now(), fetchImpl = fetch } = {}) {
  const rows = database.prepare(`SELECT source, fetched_at AS fetchedAt, attempted_at AS attemptedAt,
    status, record_count AS recordCount FROM geo_topic_sync`).all()
  const sourceStates = sources.map(source => {
    const row = rows.find(row => row.source === source.id)
    const fetchedAt = row?.fetchedAt || null
    const stale = !fetchedAt || !Number.isFinite(Date.parse(fetchedAt)) || now - Date.parse(fetchedAt) >= REFRESH_MS
    return { source: source.id, name: source.name, fetchedAt, attemptedAt: row?.attemptedAt || null,
      status: row?.status || 'unknown', recordCount: row?.recordCount || 0, stale }
  })
  const due = sourceStates.filter(state => {
    const attemptedAt = Date.parse(state.attemptedAt)
    return (state.stale || state.status !== 'ok') &&
      (!Number.isFinite(attemptedAt) || now - attemptedAt >= RETRY_MS)
  }).map(state => state.source)
  if (due.length && !pendingSync) {
    void syncHotTopics({ fetchImpl, now, sourceIds: due })
      .catch(error => console.error('Topic sync failed:', error.message))
  }
  const topics = database.prepare(`SELECT id, title, category, summary, tag, source_url AS sourceUrl,
    occurred_at AS occurredAt, fetched_at AS fetchedAt, post_id AS postId
    FROM community_hot_topic WHERE external_id IS NOT NULL
    ORDER BY occurred_at DESC, id DESC LIMIT 12`).all()
  const fetchedAt = sourceStates.map(state => state.fetchedAt).filter(Boolean).sort().at(-1) || null
  return { topics, fetchedAt, refreshError: sourceStates.some(state => state.status === 'error'),
    stale: sourceStates.some(state => state.stale), updating: Boolean(pendingSync),
    sources: sourceStates, source: 'NASA EONET & USGS' }
}

export function startHotTopicSync() {
  getHotTopics().catch(error => console.error('Initial topic sync failed:', error))
  const timer = setInterval(() => {
    getHotTopics().catch(error => console.error('Periodic topic sync failed:', error))
  }, 60 * 1000)
  timer.unref()
}
