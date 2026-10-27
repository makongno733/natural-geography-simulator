import { database } from './database.mjs'

export const EONET_EVENTS_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=14&limit=60'
export const USGS_SIGNIFICANT_QUAKES_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson'

const REFRESH_MS = 30 * 60 * 1000
let pendingSync
let lastFailedAttempt = 0

const categoryNames = new Map([
  ['severeStorms', '强风暴'], ['wildfires', '野火'], ['volcanoes', '火山活动'],
  ['floods', '洪水'], ['landslides', '滑坡'], ['drought', '干旱'],
  ['dustHaze', '沙尘与霾'], ['seaLakeIce', '海湖冰'], ['snow', '降雪'],
  ['temperatureExtremes', '极端气温'], ['waterColor', '水色变化'],
  ['earthquakes', '构造地震']
])

export function normalizeEonetEvent(event, fetchedAt) {
  if (!/^EONET_\d+$/.test(event?.id || '')) return null
  const title = typeof event.title === 'string' ? event.title.trim().slice(0, 120) : ''
  const geometry = Array.isArray(event.geometry) ? event.geometry : []
  const latest = geometry.filter(item => Number.isFinite(Date.parse(item?.date))).at(-1)
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
  if (!id || !props) return null
  const mag = typeof props.mag === 'number' ? props.mag.toFixed(1) : ''
  const place = typeof props.place === 'string' ? props.place.trim() : '全球海域或未定地区'
  const title = `M${mag} 级显著构造地震 - ${place}`
  const occurredAt = Number.isFinite(props.time) ? new Date(props.time).toISOString() : new Date().toISOString()
  const sourceUrl = props.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`
  const summary = `美国地质调查局 (USGS) 监测到一次 M${mag} 级深部或浅源构造地震，震中位于 ${place}，发震时刻为 ${occurredAt.slice(0, 16).replace('T', ' ')} UTC。可结合断层构造模型探讨板块边界受力机制。`
  return {
    externalId: `USGS_${id}`,
    title,
    category: '构造地震',
    summary,
    sourceUrl,
    occurredAt,
    fetchedAt,
    tag: '构造地震'
  }
}

export async function syncHotTopics({ fetchImpl = fetch, now = Date.now() } = {}) {
  if (pendingSync) return pendingSync
  pendingSync = (async () => {
    const fetchedAt = new Date(now).toISOString()

    // 1. 同步 NASA EONET 自然事件
    try {
      const response = await fetchImpl(EONET_EVENTS_URL, { signal: AbortSignal.timeout(8000) })
      if (response.ok) {
        const payload = await response.json()
        if (Array.isArray(payload.events)) {
          const upsert = database.prepare(`INSERT INTO community_hot_topic
            (title, category, summary, stats, tag, external_id, source_url, occurred_at, fetched_at)
            VALUES (@title, @category, @summary, '', @tag, @externalId, @sourceUrl, @occurredAt, @fetchedAt)
            ON CONFLICT(external_id) DO UPDATE SET title=excluded.title, category=excluded.category,
            summary=excluded.summary, tag=excluded.tag, source_url=excluded.source_url,
            occurred_at=excluded.occurred_at, fetched_at=excluded.fetched_at`)
          database.transaction(() => {
            for (const event of payload.events.slice(0, 40)) {
              const topic = normalizeEonetEvent(event, fetchedAt)
              if (topic) upsert.run(topic)
            }
          })()
        }
      }
    } catch (eonetErr) {
      console.warn('NASA EONET sync warning:', eonetErr.message)
    }

    // 2. 同步 USGS 显著地震源
    try {
      const usgsRes = await fetchImpl(USGS_SIGNIFICANT_QUAKES_URL, { signal: AbortSignal.timeout(6000) })
      if (usgsRes.ok) {
        const usgsData = await usgsRes.json()
        if (Array.isArray(usgsData.features)) {
          const upsert = database.prepare(`INSERT INTO community_hot_topic
            (title, category, summary, stats, tag, external_id, source_url, occurred_at, fetched_at)
            VALUES (@title, @category, @summary, '', @tag, @externalId, @sourceUrl, @occurredAt, @fetchedAt)
            ON CONFLICT(external_id) DO UPDATE SET title=excluded.title, category=excluded.category,
            summary=excluded.summary, tag=excluded.tag, source_url=excluded.source_url,
            occurred_at=excluded.occurred_at, fetched_at=excluded.fetched_at`)
          database.transaction(() => {
            for (const feat of usgsData.features.slice(0, 15)) {
              const topic = normalizeUsgsEarthquake(feat, fetchedAt)
              if (topic) upsert.run(topic)
            }
          })()
        }
      }
    } catch (usgsErr) {
      console.warn('USGS sync warning:', usgsErr.message)
    }

    database.transaction(() => {
      database.prepare(`INSERT INTO geo_topic_sync (source, fetched_at) VALUES ('eonet', ?)
        ON CONFLICT(source) DO UPDATE SET fetched_at=excluded.fetched_at`).run(fetchedAt)
      database.prepare('DELETE FROM community_hot_topic WHERE external_id IS NOT NULL AND occurred_at < ? AND post_id IS NULL')
        .run(new Date(now - 60 * 86400000).toISOString())
    })()

    return fetchedAt
  })().catch(error => {
    lastFailedAttempt = Date.now()
    throw error
  }).finally(() => { pendingSync = null })
  return pendingSync
}

export async function getHotTopics() {
  const sync = database.prepare("SELECT fetched_at AS fetchedAt FROM geo_topic_sync WHERE source = 'eonet'").get()
  let refreshError = false
  if ((!sync || Date.now() - Date.parse(sync.fetchedAt) > REFRESH_MS) && Date.now() - lastFailedAttempt > 5 * 60 * 1000) {
    try { await syncHotTopics() } catch (error) {
      console.error('Topic sync failed:', error)
      refreshError = true
    }
  }
  const latest = database.prepare("SELECT fetched_at AS fetchedAt FROM geo_topic_sync WHERE source = 'eonet'").get()
  if (lastFailedAttempt > Date.parse(latest?.fetchedAt || 0)) refreshError = true
  const topics = database.prepare(`SELECT id, title, category, summary, tag, source_url AS sourceUrl,
    occurred_at AS occurredAt, fetched_at AS fetchedAt, post_id AS postId
    FROM community_hot_topic WHERE external_id IS NOT NULL
    ORDER BY occurred_at DESC, id DESC LIMIT 12`).all()
  return { topics, fetchedAt: latest?.fetchedAt || null, refreshError, source: 'NASA EONET & USGS' }
}

export function startHotTopicSync() {
  getHotTopics().catch(error => console.error('Initial topic sync failed:', error))
  const timer = setInterval(() => {
    getHotTopics().catch(error => console.error('Periodic topic sync failed:', error))
  }, REFRESH_MS)
  timer.unref()
}
