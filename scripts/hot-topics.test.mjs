import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../server/database.mjs', async () => {
  const Database = (await import('better-sqlite3')).default
  return { database: new Database(':memory:') }
})
import { database } from '../server/database.mjs'
import { migrateCommunity } from '../server/community.mjs'
import { EONET_EVENTS_URL, getHotTopics, syncHotTopics } from '../server/hot-topics.mjs'

const now = Date.parse('2026-11-07T12:00:00Z')
const event = { id: 'EONET_123', title: 'Source event', categories: [{ id: 'wildfires' }],
  geometry: [{ date: new Date(now).toISOString() }] }
const response = payload => ({ ok: true, json: async () => payload })
const success = async url => response(url === EONET_EVENTS_URL ? { events: [event] } : { features: [] })

beforeAll(() => migrateCommunity())
beforeEach(() => {
  database.exec('DELETE FROM community_hot_topic; DELETE FROM geo_topic_sync;')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

describe('source-linked geography publishing workflow', () => {
  it('fetches both sources concurrently, shares in-flight work, and serves cache immediately', async () => {
    const releases = []
    const fetchImpl = vi.fn(url => new Promise(resolve => {
      releases.push(() => resolve(response(url === EONET_EVENTS_URL ? { events: [event] } : { features: [] })))
    }))
    const cached = await getHotTopics({ now, fetchImpl })
    expect(cached.topics).toEqual([])
    expect(cached.updating).toBe(true)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    const shared = syncHotTopics({ now, fetchImpl })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    releases.forEach(release => release())
    await shared
    const updated = await getHotTopics({ now, fetchImpl })
    expect(updated.topics).toHaveLength(1)
    expect(updated.sources.every(source => source.status === 'ok' && !source.stale)).toBe(true)
    expect(updated.updating).toBe(false)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('tracks partial failure per source and preserves its last successful time and records', async () => {
    await syncHotTopics({ now, fetchImpl: success })
    const later = now + 31 * 60000
    await syncHotTopics({ now: later, fetchImpl: async url =>
      url === EONET_EVENTS_URL ? { ok: false, status: 503 } : response({ features: [] }) })
    const result = await getHotTopics({ now: later, fetchImpl: success })
    expect(result.refreshError).toBe(true)
    expect(result.topics).toHaveLength(1)
    expect(result.sources.find(source => source.source === 'eonet')).toMatchObject({
      status: 'error', fetchedAt: new Date(now).toISOString(), stale: true
    })
    expect(result.sources.find(source => source.source === 'usgs')).toMatchObject({
      status: 'ok', fetchedAt: new Date(later).toISOString(), stale: false
    })
    expect(result.updating).toBe(false)
  })

  it('persists retry backoff across restart and retries only the failed source', async () => {
    await syncHotTopics({ now, fetchImpl: async url =>
      url === EONET_EVENTS_URL ? { ok: false, status: 503 } : response({ features: [] }) })
    const fetchImpl = vi.fn(success)
    await getHotTopics({ now: now + 60000, fetchImpl })
    expect(fetchImpl).not.toHaveBeenCalled()
    const result = await getHotTopics({ now: now + 5 * 60000, fetchImpl })
    expect(result.updating).toBe(true)
    const join = syncHotTopics({ fetchImpl })
    await join
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(fetchImpl).toHaveBeenCalledWith(EONET_EVENTS_URL, expect.any(Object))
  })

  it('does not publish malformed feeds as successful and keeps prior data after total failure', async () => {
    await syncHotTopics({ now, fetchImpl: success })
    await expect(syncHotTopics({ now: now + 60000, fetchImpl: async url =>
      response(url === EONET_EVENTS_URL ? { events: [{ id: 'bad' }] } : { invalid: [] })
    })).rejects.toThrow('All geography event sources failed')
    expect(database.prepare('SELECT count(*) AS n FROM community_hot_topic').get().n).toBe(1)
    expect(database.prepare("SELECT fetched_at FROM geo_topic_sync WHERE source='eonet'").get().fetched_at)
      .toBe(new Date(now).toISOString())
    await syncHotTopics({ now: now + 5 * 60000, fetchImpl: success })
    const recovered = await getHotTopics({ now: now + 5 * 60000, fetchImpl: success })
    expect(recovered.refreshError).toBe(false)
    expect(recovered.updating).toBe(false)
    expect(recovered.sources.every(source => source.status === 'ok')).toBe(true)
    expect(recovered.topics).toHaveLength(1)
  })

  it('updates source revisions once and only expires unlinked automatic records', async () => {
    await syncHotTopics({ now, fetchImpl: success })
    await syncHotTopics({ now: now + 60000, fetchImpl: async url =>
      response(url === EONET_EVENTS_URL ? { events: [{ ...event, title: 'Revised' }] } : { features: [] }) })
    expect(database.prepare('SELECT title FROM community_hot_topic').all()).toEqual([{ title: 'Revised' }])
    database.prepare('UPDATE community_hot_topic SET occurred_at=?').run(new Date(now - 61 * 86400000).toISOString())
    await syncHotTopics({ now, fetchImpl: async () => response({ events: [], features: [] }) })
    expect(database.prepare('SELECT count(*) AS n FROM community_hot_topic').get().n).toBe(0)
  })
})
