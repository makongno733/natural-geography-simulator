import { database, migrateGeoEvents } from './database.mjs'

export const EARTHQUAKE_FEED = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson'
const SYNC_INTERVAL_MS = 60 * 60 * 1000
const RETENTION_MS = 366 * 24 * 60 * 60 * 1000
let pendingSync = null

function chinaPlace(place) {
  return /(?:,\s*(?:China|Taiwan|Hong Kong|Macau))$/i.test(place || '')
}

migrateGeoEvents()

export function normalizeEarthquake(feature, fetchedAt) {
  const p = feature?.properties
  const coordinates = feature?.geometry?.coordinates
  const [longitude, latitude, depthKm] = Array.isArray(coordinates) ? coordinates : []
  if (!feature?.id || !p || !Number.isFinite(p.mag) || !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) || !Number.isFinite(p.time) || !Number.isFinite(p.updated) ||
      longitude < 73 || longitude > 135 || latitude < 18 || latitude > 54 ||
      !chinaPlace(p.place) ||
      !/^https:\/\/earthquake\.usgs\.gov\//.test(p.url || '')) return null
  return {
    id: `usgs:${feature.id}`,
    occurredAt: new Date(p.time).toISOString(),
    updatedAt: new Date(p.updated).toISOString(),
    magnitude: p.mag,
    place: String(p.place || '震中位置未命名').slice(0, 160),
    longitude,
    latitude,
    depthKm: Number.isFinite(depthKm) ? depthKm : null,
    sourceUrl: p.url,
    fetchedAt
  }
}

export async function syncEarthquakes() {
  if (pendingSync) return pendingSync
  pendingSync = (async () => {
    const fetchedAt = new Date().toISOString()
    const response = await fetch(EARTHQUAKE_FEED, { signal: AbortSignal.timeout(12000) })
    if (!response.ok) throw new Error(`USGS HTTP ${response.status}`)
    const payload = await response.json()
    if (!Array.isArray(payload.features)) throw new Error('USGS feed format changed')
    const upsert = database.prepare(`INSERT INTO geo_earthquake
      (id, occurred_at, updated_at, magnitude, place, longitude, latitude, depth_km, source_url, fetched_at)
      VALUES (@id, @occurredAt, @updatedAt, @magnitude, @place, @longitude, @latitude, @depthKm, @sourceUrl, @fetchedAt)
      ON CONFLICT(id) DO UPDATE SET updated_at=excluded.updated_at, magnitude=excluded.magnitude,
      place=excluded.place, longitude=excluded.longitude, latitude=excluded.latitude,
      depth_km=excluded.depth_km, source_url=excluded.source_url, fetched_at=excluded.fetched_at`)
    database.transaction(() => {
      for (const feature of payload.features) {
        const event = normalizeEarthquake(feature, fetchedAt)
        if (event) upsert.run(event)
      }
      database.prepare('DELETE FROM geo_earthquake WHERE occurred_at < ?')
        .run(new Date(Date.now() - RETENTION_MS).toISOString())
      database.prepare(`INSERT INTO geo_event_sync (source, fetched_at, status) VALUES ('usgs', ?, 'ok')
        ON CONFLICT(source) DO UPDATE SET fetched_at=excluded.fetched_at, status=excluded.status`).run(fetchedAt)
    })()
  })().finally(() => { pendingSync = null })
  return pendingSync
}

export async function getGeoEvents() {
  const sync = database.prepare("SELECT fetched_at AS fetchedAt FROM geo_event_sync WHERE source = 'usgs'").get()
  let refreshError = false
  if (!sync || Date.now() - Date.parse(sync.fetchedAt) > SYNC_INTERVAL_MS) {
    try { await syncEarthquakes() } catch (error) {
      console.error('USGS calendar sync failed:', error)
      refreshError = true
    }
  }
  const latest = database.prepare("SELECT fetched_at AS fetchedAt FROM geo_event_sync WHERE source = 'usgs'").get()
  const earthquakes = database.prepare(`SELECT id, occurred_at AS occurredAt, updated_at AS updatedAt,
    magnitude, place, longitude, latitude, depth_km AS depthKm, source_url AS sourceUrl
    FROM geo_earthquake WHERE occurred_at >= ? AND
      (place LIKE '%, China' OR place LIKE '%, Taiwan' OR place LIKE '%, Hong Kong' OR place LIKE '%, Macau')
    ORDER BY occurred_at DESC LIMIT 1000`)
    .all(new Date(Date.now() - RETENTION_MS).toISOString())
  return { earthquakes, fetchedAt: latest?.fetchedAt || null, refreshError, source: EARTHQUAKE_FEED }
}

export function startGeoEventSync() {
  getGeoEvents().catch(error => console.error('Calendar initial sync failed:', error))
  const timer = setInterval(() => {
    getGeoEvents().catch(error => console.error('Calendar periodic sync failed:', error))
  }, SYNC_INTERVAL_MS)
  timer.unref()
}
