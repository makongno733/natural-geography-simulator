import { describe, expect, it, vi } from 'vitest'

process.env.AUTH_ORIGIN ||= 'http://127.0.0.1:4100'
process.env.SITE_ORIGIN ||= 'http://127.0.0.1:4173'
process.env.BETTER_AUTH_SECRET ||= 'test-secret-with-at-least-32-characters-123456'

vi.mock('../server/database.mjs', async () => {
  const Database = (await import('better-sqlite3')).default
  return { database: new Database(':memory:') }
})
import { database } from '../server/database.mjs'
import { migrateCommunity, setupCommunityRoutes } from '../server/community.mjs'
const { migrateFanxing } = await import('../server/fanxing.mjs')

describe('legacy community schema compatibility', () => {
  it('upgrades legacy production community_post and community_resource tables without status or newer columns, and serves all 4 public endpoints with 200', async () => {
    database.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
      INSERT INTO user (id, name, email) VALUES ('u-legacy-1', '逐影SAMA', 'makongno733@gmail.com');

      CREATE TABLE community_category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT ''
      );
      INSERT INTO community_category (id, slug, name, description)
        VALUES (1, 'general', '地理综合', '旧版分区');

      CREATE TABLE community_post (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'discussion',
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        tags_json TEXT NOT NULL DEFAULT '[]',
        linked_experiment TEXT,
        evidence_id TEXT,
        evidence_title TEXT,
        evidence_conditions TEXT,
        evidence_facts TEXT,
        accepted_reply_id INTEGER,
        status TEXT NOT NULL DEFAULT 'published',
        reply_count INTEGER NOT NULL DEFAULT 0,
        last_activity_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      INSERT INTO community_post (
        id, category_id, author_id, author_name, kind, title, body,
        last_activity_at, created_at, updated_at
      ) VALUES (
        1, 1, 'u-legacy-1', '逐影SAMA', 'discussion', '旧版生产帖子 #1', '用于验证旧库升级后不丢失且不报500',
        '2026-11-01T00:00:00Z', '2026-11-01T00:00:00Z', '2026-11-01T00:00:00Z'
      );

      CREATE TABLE community_resource (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        format TEXT NOT NULL,
        scale TEXT NOT NULL,
        license TEXT NOT NULL,
        source_url TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      INSERT INTO community_resource (
        title, category, format, scale, license, source_url, description, created_at
      ) VALUES (
        'NASADEM 30m 全球数字高程', '地形高程', 'GeoTIFF', '全球 30m', 'Public Domain',
        'https://earthdata.nasa.gov/', '旧版资源表无 status 字段', '2026-11-01T00:00:00Z'
      );

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
    migrateFanxing()

    expect(database.prepare('SELECT * FROM geo_topic_sync').all()).toEqual([{
      source: 'eonet', fetched_at: '2026-11-07T00:00:00Z',
      attempted_at: null, status: 'unknown', record_count: 0
    }])
    expect(database.prepare('SELECT * FROM community_hot_topic').get()).toMatchObject({
      title: '旧事件', summary: '原摘要', external_id: null, post_id: null
    })
    expect(database.prepare('SELECT count(*) AS n FROM community_category').get().n).toBe(9)
    expect(database.pragma('integrity_check', { simple: true })).toBe('ok')

    // 验证升级后 4 个曾报错接口均返回 200
    const routes = new Map()
    const app = Object.fromEntries(['get', 'post', 'patch', 'delete'].map(method => [
      method, (path, ...handlers) => routes.set(`${method.toUpperCase()} ${path}`, handlers)
    ]))
    const optionalUser = (_req, _res, next) => next()
    const requireUser = (_req, _res, next) => next()
    const requireOrigin = (_req, _res, next) => next()
    setupCommunityRoutes(app, { optionalUser, requireUser, requireOrigin })

    async function invokeGet(pattern, { params = {}, query = {} } = {}) {
      const handlers = routes.get(`GET ${pattern}`)
      const req = { params, query, body: {} }
      let status = 200
      let payload
      const res = {
        status(code) { status = code; return res },
        json(val) { payload = val; return res }
      }
      let idx = 0
      async function next() {
        const h = handlers[idx++]
        if (h) await h(req, res, next)
      }
      await next()
      return { status, payload }
    }

    const postsRes = await invokeGet('/api/community/posts')
    expect(postsRes.status).toBe(200)
    expect(postsRes.payload.posts.some(p => p.id === 1 && p.title === '旧版生产帖子 #1')).toBe(true)

    const post1Res = await invokeGet('/api/community/posts/:id', { params: { id: '1' } })
    expect(post1Res.status).toBe(200)
    expect(post1Res.payload.post.title).toBe('旧版生产帖子 #1')

    const userRes = await invokeGet('/api/community/users/:id', { params: { id: 'u-legacy-1' } })
    expect(userRes.status).toBe(200)
    expect(userRes.payload.user.name).toBe('逐影SAMA')

    const resourcesRes = await invokeGet('/api/community/resources')
    expect(resourcesRes.status).toBe(200)
    expect(resourcesRes.payload.resources.some(r => r.title.includes('NASADEM'))).toBe(true)
  })

  it('never misreports an unexpected SQL error on GET /api/community/posts as a 400 search keyword error', async () => {
    const routes = new Map()
    const app = Object.fromEntries(['get', 'post', 'patch', 'delete'].map(method => [
      method, (path, ...handlers) => routes.set(`${method.toUpperCase()} ${path}`, handlers)
    ]))
    const optionalUser = (_req, _res, next) => next()
    const requireUser = (_req, _res, next) => next()
    const requireOrigin = (_req, _res, next) => next()
    setupCommunityRoutes(app, { optionalUser, requireUser, requireOrigin })

    const spy = vi.spyOn(database, 'prepare').mockImplementationOnce(() => {
      throw new Error('SQLITE_ERROR: no such column: status')
    })

    const handlers = routes.get('GET /api/community/posts')
    let status = 200
    let payload
    const req = { params: {}, query: {}, body: {} }
    const res = {
      status(code) { status = code; return res },
      json(val) { payload = val; return res }
    }

    let caughtError = null
    let idx = 0
    async function next(err) {
      if (err) throw err
      const h = handlers[idx++]
      if (h) await h(req, res, next)
    }
    try {
      await next()
    } catch (err) {
      caughtError = err
    } finally {
      spy.mockRestore()
    }

    // 绝不将 schema 缺失或 SQL 异常伪装成 400 “搜索词无法检索”
    expect(status).not.toBe(400)
    expect(payload?.error).not.toBe('搜索词无法检索，请换一个关键词')
    expect(caughtError?.message).toContain('no such column: status')
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
