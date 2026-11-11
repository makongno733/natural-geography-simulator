import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('../server/database.mjs', async () => {
  const Database = (await import('better-sqlite3')).default
  return { database: new Database(':memory:') }
})

import { database } from '../server/database.mjs'
import { migrateCommunity, setupCommunityRoutes } from '../server/community.mjs'

const routes = new Map()
const app = {
  get(path, ...handlers) { routes.set(`GET ${path}`, handlers.at(-1)) },
  post(path, ...handlers) { routes.set(`POST ${path}`, handlers.at(-1)) },
  patch(path, ...handlers) { routes.set(`PATCH ${path}`, handlers.at(-1)) }
}
function call(method, path, { params = {}, query = {}, body = {}, userId = 'user-1' } = {}) {
  let status = 200
  let payload
  const res = {
    status(code) { status = code; return this },
    json(value) { payload = value; return this }
  }
  routes.get(`${method} ${path}`)({ params, query, body, accountUser: { id: userId } }, res)
  return { status, payload }
}

beforeAll(() => {
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE user (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE user_role (user_id TEXT PRIMARY KEY, role TEXT NOT NULL);
    INSERT INTO user VALUES ('user-1', '提问者'), ('user-2', '回答者'), ('admin-1', '管理员');
    INSERT INTO user_role VALUES ('admin-1', 'admin');
  `)
  migrateCommunity()
  migrateCommunity()
  setupCommunityRoutes(app, { requireOrigin() {}, requireUser() {} })
})

describe('community API with SQLite', () => {
  it('lets only an admin add and disable a category', () => {
    expect(call('POST', '/api/community/moderation/categories', {
      body: { slug: 'field-notes', name: '野外笔记' }
    }).status).toBe(403)
    const created = call('POST', '/api/community/moderation/categories', {
      userId: 'admin-1', body: { slug: 'field-notes', name: '野外笔记' }
    })
    expect(created.status).toBe(201)
    expect(call('PATCH', '/api/community/moderation/categories/:id', {
      userId: 'admin-1', params: { id: created.payload.id }, body: { active: false }
    }).status).toBe(200)
    expect(call('GET', '/api/community/categories').payload.categories.find(category => category.slug === 'field-notes')).toBeUndefined()
  })

  it('seeds editable categories and persists a question with searchable Chinese text', () => {
    expect(call('GET', '/api/community/categories').payload.categories).toHaveLength(9)
    const created = call('POST', '/api/community/posts', {
      body: { categoryId: 1, kind: 'question', title: '季风环流如何形成', body: '请解释夏季风与海陆热力差异。' }
    })
    expect(created.status).toBe(201)
    expect(call('GET', '/api/community/posts', { query: { q: '季风环流' } }).payload.posts[0].id).toBe(created.payload.id)
    expect(call('GET', '/api/community/posts', { query: { q: '季风' } }).payload.posts[0].id).toBe(created.payload.id)
  })

  it('keeps the previous public version when a discussion is edited', () => {
    const created = call('POST', '/api/community/posts', {
      body: { categoryId: 1, kind: 'discussion', title: '原题目', body: '原观点' }
    })
    const id = created.payload.id
    const updated = call('PATCH', '/api/community/posts/:id', {
      params: { id }, body: { title: '修订题目', body: '修订观点' }
    })
    expect(updated.payload.revisionRecorded).toBe(true)
    const revisions = call('GET', '/api/community/posts/:id/revisions', { params: { id } })
    expect(revisions.payload.revisions).toMatchObject([
      { revisionNo: 1, title: '原题目', body: '原观点', editor: '提问者' }
    ])
    expect(call('PATCH', '/api/community/posts/:id', {
      params: { id }, body: { title: '修订题目', body: '修订观点' }
    }).payload.revisionRecorded).toBe(false)
    expect(call('GET', '/api/community/posts/:id/revisions', { params: { id } }).payload.revisions).toHaveLength(1)
  })

  it('rejects an unrelated parent reply and allows a reply in the same discussion', () => {
    const postId = call('GET', '/api/community/posts').payload.posts[0].id
    expect(call('POST', '/api/community/posts/:id/replies', {
      params: { id: postId }, userId: 'user-2', body: { body: '先比较陆地和海洋的升温速度。' }
    }).status).toBe(201)
    expect(call('POST', '/api/community/posts/:id/replies', {
      params: { id: postId }, userId: 'user-2', body: { body: '补充', parentId: 9999 }
    }).status).toBe(400)
    expect(call('GET', '/api/community/posts/:id', { params: { id: postId } }).payload.replies).toHaveLength(1)
  })

  it('pushes a live event when a new discussion is published', () => {
    const messages = []
    let close
    const req = { on(event, handler) { if (event === 'close') close = handler } }
    const res = {
      set() { return this },
      flushHeaders() {},
      write(message) { messages.push(message) }
    }
    routes.get('GET /api/community/stream')(req, res)
    const created = call('POST', '/api/community/posts', {
      userId: 'user-2',
      body: { categoryId: 4, kind: 'discussion', title: '空间分析入门经验', body: '欢迎分享开源数据与练习方法。' }
    })
    expect(created.status).toBe(201)
    expect(messages.some(message => message.includes(`"postId":${created.payload.id}`))).toBe(true)
    close()
  })

  it('limits moderation to an admin and hides reported content', () => {
    const postId = call('GET', '/api/community/posts').payload.posts[0].id
    const report = call('POST', '/api/community/reports', { body: { postId, reason: '测试举报' } })
    expect(report.status).toBe(201)
    expect(call('GET', '/api/community/moderation/reports').status).toBe(403)
    expect(call('POST', '/api/community/moderation/reports/:id', {
      params: { id: report.payload.id }, userId: 'admin-1', body: { action: 'hide' }
    }).status).toBe(200)
    expect(call('GET', '/api/community/posts').payload.posts).not.toContainEqual(expect.objectContaining({ id: postId }))
  })

  it('accepts bounded event-correction reports and exposes them only to admins', () => {
    const topic = database.prepare(`INSERT INTO community_hot_topic
      (title, category, summary, stats, tag, external_id, source_url, occurred_at, fetched_at)
      VALUES ('待核对事件', '事件', '摘要', '', '事件', 'EONET_22', 'https://eonet.gsfc.nasa.gov/api/v3/events/EONET_22', ?, ?)`)
      .run(new Date().toISOString(), new Date().toISOString())
    const id = Number(topic.lastInsertRowid)
    expect(call('GET', '/api/community/hot-topics/:id/revisions', { params: { id } }).payload.revisions).toEqual([])
    const feedback = call('POST', '/api/community/hot-topics/:id/feedback', {
      params: { id }, body: { reason: '事件位置可能有误' }
    })
    expect(feedback.status).toBe(201)
    expect(call('POST', '/api/community/hot-topics/:id/feedback', {
      params: { id }, body: { reason: '重复反馈' }
    }).status).toBe(409)
    expect(call('GET', '/api/community/moderation/event-feedback').status).toBe(403)
    const queue = call('GET', '/api/community/moderation/event-feedback', { userId: 'admin-1' })
    expect(queue.payload.feedback).toMatchObject([{ topicId: id, reason: '事件位置可能有误', status: 'open' }])
    expect(call('POST', '/api/community/moderation/event-feedback/:id', {
      params: { id: feedback.payload.id }, userId: 'admin-1',
      body: { action: 'resolve', resolutionNote: '已对照来源记录' }
    }).payload.status).toBe('resolved')
  })
})
