import { describe, expect, it, vi } from 'vitest'

vi.mock('../server/database.mjs', async () => {
  const Database = (await import('better-sqlite3')).default
  return { database: new Database(':memory:') }
})
import { database } from '../server/database.mjs'
import { migrateCommunity, setupCommunityRoutes } from '../server/community.mjs'

describe('legacy community schema compatibility', () => {
  it('adds per-source state idempotently without losing legacy sync or topic rows', () => {
    database.exec(`
      CREATE TABLE geo_topic_sync (source TEXT PRIMARY KEY, fetched_at TEXT NOT NULL);
      INSERT INTO geo_topic_sync VALUES ('eonet', '2026-11-07T00:00:00Z');
      CREATE TABLE community_hot_topic (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL,
        summary TEXT NOT NULL, stats TEXT NOT NULL, tag TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0
      );
      INSERT INTO community_hot_topic (title, category, summary, stats, tag)
        VALUES ('旧事件', '自然地理', '原摘要', '', '观察');
    `)
    migrateCommunity()
    migrateCommunity()
    expect(database.prepare('SELECT * FROM geo_topic_sync').all()).toEqual([{
      source: 'eonet', fetched_at: '2026-11-07T00:00:00Z',
      attempted_at: null, status: 'unknown', record_count: 0
    }])
    expect(database.prepare('SELECT * FROM community_hot_topic').get()).toMatchObject({
      title: '旧事件', summary: '原摘要', external_id: null, post_id: null
    })
    expect(database.prepare('SELECT count(*) AS n FROM community_category').get().n).toBe(9)
    expect(database.pragma('integrity_check', { simple: true })).toBe('ok')
  })

  it('wires optional identity to public reads without replacing required identity on writes', () => {
    const routes = new Map()
    const app = Object.fromEntries(['get', 'post', 'patch', 'delete'].map(method => [
      method, (path, ...handlers) => routes.set(`${method} ${path}`, handlers)
    ]))
    const optionalUser = vi.fn()
    const requireUser = vi.fn()
    const requireOrigin = vi.fn()
    setupCommunityRoutes(app, { optionalUser, requireUser, requireOrigin })
    for (const path of ['/api/community/posts', '/api/community/posts/:id']) {
      expect(routes.get(`get ${path}`)[0]).toBe(optionalUser)
    }
    expect(routes.get('post /api/community/posts').slice(0, 2)).toEqual([requireOrigin, requireUser])
    expect(routes.get('patch /api/community/posts/:id').slice(0, 2)).toEqual([requireOrigin, requireUser])
    expect(routes.get('delete /api/community/posts/:id').slice(0, 2)).toEqual([requireOrigin, requireUser])
  })
})
