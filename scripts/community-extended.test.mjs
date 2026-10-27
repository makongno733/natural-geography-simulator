import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('../server/database.mjs', async () => {
  const Database = (await import('better-sqlite3')).default
  return { database: new Database(':memory:') }
})

import { database } from '../server/database.mjs'
import { migrateCommunity, setupCommunityRoutes } from '../server/community.mjs'
import { normalizeEonetEvent, normalizeUsgsEarthquake, syncHotTopics } from '../server/hot-topics.mjs'

const routes = new Map()
const app = {
  get(path, ...handlers) { routes.set(`GET ${path}`, handlers.at(-1)) },
  post(path, ...handlers) { routes.set(`POST ${path}`, handlers.at(-1)) },
  patch(path, ...handlers) { routes.set(`PATCH ${path}`, handlers.at(-1)) },
  delete(path, ...handlers) { routes.set(`DELETE ${path}`, handlers.at(-1)) }
}

function call(method, path, { params = {}, query = {}, body = {}, userId = 'user-1' } = {}) {
  let status = 200
  let payload
  const res = {
    status(code) { status = code; return this },
    json(value) { payload = value; return this }
  }
  const handler = routes.get(`${method} ${path}`)
  if (!handler) {
    throw new Error(`Handler not found for: ${method} ${path}`)
  }
  handler({ params, query, body, accountUser: userId ? { id: userId, name: userId === 'user-1' ? '提问者' : '其他用户' } : null }, res)
  return { status, payload }
}

beforeAll(() => {
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE user (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE user_role (user_id TEXT PRIMARY KEY, role TEXT NOT NULL);
    INSERT INTO user VALUES ('user-1', '提问者'), ('user-2', '学者小张'), ('admin-1', '管委会');
    INSERT INTO user_role VALUES ('admin-1', 'admin');
  `)
  migrateCommunity()
  migrateCommunity() // ensure idempotent
  setupCommunityRoutes(app, { requireOrigin() {}, requireUser(req, res, next) { if (!req.accountUser) return res.status(401).json({ error: '请先登录' }); if (next) next(); } })
})

describe('Extended Geography Community Platform API', () => {
  let createdPostId
  let replyId

  it('1. creates a question with tags and linked 3D experiment model', () => {
    const res = call('POST', '/api/community/posts', {
      userId: 'user-1',
      body: {
        categoryId: 2, // 自然地理
        kind: 'question',
        title: '断层与褶皱在地貌演化中的本质区别是什么？',
        body: '在野外考察时如何区分正断层、逆断层与向斜成山、背斜成谷？',
        tags: ['构造地质', '断层模型', '野外科考'],
        linkedExperiment: 'fault-model'
      }
    })
    expect(res.status).toBe(201)
    expect(res.payload.id).toBeDefined()
    createdPostId = res.payload.id

    const postDetail = call('GET', '/api/community/posts/:id', {
      params: { id: createdPostId }
    })
    expect(postDetail.status).toBe(200)
    expect(postDetail.payload.post.tags).toEqual(['构造地质', '断层模型', '野外科考'])
    expect(postDetail.payload.post.linkedExperiment).toBe('fault-model')
  })

  it('2. adds a scholarly reply and allows author to accept it as best answer', () => {
    const replyRes = call('POST', '/api/community/posts/:id/replies', {
      userId: 'user-2',
      params: { id: createdPostId },
      body: {
        body: '断层是岩层受力超过承受强度发生明显破裂位移，而褶皱是连续塑性弯曲变形。可在站内 3D 断层模型中拖动验证挤压与拉张。'
      }
    })
    expect(replyRes.status).toBe(201)
    replyId = replyRes.payload.id

    // 非作者不能采纳
    const nonAuthorAccept = call('POST', '/api/community/posts/:id/accept-reply', {
      userId: 'user-2',
      params: { id: createdPostId },
      body: { replyId }
    })
    expect(nonAuthorAccept.status).toBe(403)

    // 作者成功采纳
    const authorAccept = call('POST', '/api/community/posts/:id/accept-reply', {
      userId: 'user-1',
      params: { id: createdPostId },
      body: { replyId }
    })
    expect(authorAccept.status).toBe(200)
    expect(authorAccept.payload.acceptedReplyId).toBe(replyId)

    // 查看帖子详情确认最佳答案
    const detail = call('GET', '/api/community/posts/:id', {
      params: { id: createdPostId }
    })
    expect(detail.payload.post.acceptedReplyId).toBe(replyId)
    const acceptedReply = detail.payload.replies.find(r => r.id === replyId)
    expect(acceptedReply.isAccepted).toBe(true)
  })

  it('3. toggles like and bookmark on posts', () => {
    // 点赞
    const like1 = call('POST', '/api/community/posts/:id/like', {
      userId: 'user-2',
      params: { id: createdPostId }
    })
    expect(like1.status).toBe(200)
    expect(like1.payload.liked).toBe(true)
    expect(like1.payload.likeCount).toBe(1)

    // 重复点击取消点赞
    const like2 = call('POST', '/api/community/posts/:id/like', {
      userId: 'user-2',
      params: { id: createdPostId }
    })
    expect(like2.status).toBe(200)
    expect(like2.payload.liked).toBe(false)
    expect(like2.payload.likeCount).toBe(0)

    // 收藏
    const bookmark1 = call('POST', '/api/community/posts/:id/bookmark', {
      userId: 'user-2',
      params: { id: createdPostId }
    })
    expect(bookmark1.status).toBe(200)
    expect(bookmark1.payload.bookmarked).toBe(true)
    expect(bookmark1.payload.bookmarkCount).toBe(1)
  })

  it('4. manages user academic profile and shows public profile statistics', () => {
    // 更新个人资料
    const update = call('PATCH', '/api/community/users/me', {
      userId: 'user-2',
      body: {
        title: '北京大学城市与环境学院 · 博士生',
        bio: '主攻青藏高原冰川地貌与第四纪地质演化。',
        institution: '北京大学',
        location: '北京 / 拉萨'
      }
    })
    expect(update.status).toBe(200)

    // 读取公开主页
    const profile = call('GET', '/api/community/users/:id', {
      params: { id: 'user-2' }
    })
    expect(profile.status).toBe(200)
    expect(profile.payload.user.title).toContain('北京大学')
    expect(profile.payload.stats.acceptedAnswersCount).toBe(1)
  })

  it('5. does not publish unverified groups, invented hot-topic statistics, or unreviewed resources', async () => {
    const groups = call('GET', '/api/community/groups')
    expect(groups.status).toBe(200)
    expect(groups.payload.groups).toEqual([])

    database.prepare("INSERT INTO geo_topic_sync (source, fetched_at) VALUES ('eonet', ?)").run(new Date().toISOString())
    const topics = await new Promise((resolve, reject) => {
      routes.get('GET /api/community/hot-topics')({}, { json(payload) { resolve(payload) } }, reject)
    })
    expect(topics.topics).toEqual([])

    const resources = call('GET', '/api/community/resources')
    expect(resources.status).toBe(200)
    expect(resources.payload.resources).toEqual([])
  })

  it('binds the session user ID in list and detail queries', () => {
    const unusualUserId = "user' OR 1=1 --"
    const list = call('GET', '/api/community/posts', { userId: unusualUserId })
    expect(list.status).toBe(200)
    const detail = call('GET', '/api/community/posts/:id', {
      params: { id: createdPostId }, userId: unusualUserId
    })
    expect(detail.status).toBe(200)
    expect(detail.payload.post.liked).toBe(false)
  })

  it('6. allows post author to edit and delete their post', () => {
    const edit = call('PATCH', '/api/community/posts/:id', {
      userId: 'user-1',
      params: { id: createdPostId },
      body: {
        title: '【已解决】断层与褶皱在地貌演化中的本质区别',
        body: '感谢解答，已在站内 3D 断层模型完成实践验证。'
      }
    })
    expect(edit.status).toBe(200)

    const del = call('DELETE', '/api/community/posts/:id', {
      userId: 'user-1',
      params: { id: createdPostId }
    })
    expect(del.status).toBe(200)

    // 验证删除后列表不出现
    const list = call('GET', '/api/community/posts')
    expect(list.payload.posts.find(p => p.id === createdPostId)).toBeUndefined()
  })

  it('ingests a sourced event once and opens one persistent discussion', async () => {
    const event = {
      id: 'EONET_12345', title: 'Tropical Cyclone Test', description: null,
      categories: [{ id: 'severeStorms' }], geometry: [{ date: new Date().toISOString() }]
    }
    expect(normalizeEonetEvent({ ...event, id: 'bad-id' }, new Date().toISOString())).toBeNull()
    const fetchImpl = async () => ({ ok: true, json: async () => ({ events: [event] }) })
    await syncHotTopics({ fetchImpl })
    await syncHotTopics({ fetchImpl })
    const topics = database.prepare("SELECT * FROM community_hot_topic WHERE external_id = 'EONET_12345'").all()
    expect(topics).toHaveLength(1)
    expect(topics[0].source_url).toBe('https://eonet.gsfc.nasa.gov/api/v3/events/EONET_12345')
    const first = call('POST', '/api/community/hot-topics/:id/discuss', {
      params: { id: topics[0].id }, userId: 'user-2'
    })
    expect(first.status).toBe(201)
    const second = call('POST', '/api/community/hot-topics/:id/discuss', {
      params: { id: topics[0].id }, userId: 'user-1'
    })
    expect(second.status).toBe(200)
    expect(second.payload.id).toBe(first.payload.id)
    const detail = call('GET', '/api/community/posts/:id', { params: { id: first.payload.id } })
    expect(detail.payload.post.body).toContain(topics[0].source_url)
  })

  it('rejects invalid earthquake data and never marks total source failure as a successful refresh', async () => {
    const fetchedAt = new Date().toISOString()
    expect(normalizeUsgsEarthquake({ id: 'a', properties: { mag: null, time: Date.now() } }, fetchedAt)).toBeNull()
    const quake = normalizeUsgsEarthquake({
      id: 'us123', properties: { mag: 5.4, time: Date.now(), place: 'Test area',
        type: 'earthquake', url: 'javascript:alert(1)' }
    }, fetchedAt)
    expect(quake.sourceUrl).toBe('https://earthquake.usgs.gov/earthquakes/eventpage/us123')
    expect(quake.summary).not.toMatch(/断层|板块边界|伤亡/)
    const before = database.prepare("SELECT fetched_at FROM geo_topic_sync WHERE source = 'eonet'").get().fetched_at
    await expect(syncHotTopics({ fetchImpl: async () => ({ ok: false, status: 503 }) })).rejects.toThrow('All geography event sources failed')
    const after = database.prepare("SELECT fetched_at FROM geo_topic_sync WHERE source = 'eonet'").get().fetched_at
    expect(after).toBe(before)
  })
})
