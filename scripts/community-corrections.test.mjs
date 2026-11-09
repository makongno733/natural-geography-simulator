import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import express from 'express'

vi.mock('../server/database.mjs', async () => {
  const Database = (await import('better-sqlite3')).default
  return { database: new Database(':memory:') }
})

import { database } from '../server/database.mjs'
import { migrateCommunity, setupCommunityRoutes } from '../server/community.mjs'

const origin = 'https://local-test.invalid'
const timestamp = '2026-11-01T00:00:00.000Z'
let server
let baseUrl
let postId
let replyId

async function request(path, { method = 'GET', userId = 'author', body, requestOrigin = origin } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Origin: requestOrigin,
      ...(userId ? { 'X-Test-User': userId } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  })
  return { status: response.status, payload: await response.json() }
}

beforeAll(async () => {
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE user (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE user_role (user_id TEXT PRIMARY KEY, role TEXT NOT NULL);
    INSERT INTO user VALUES ('author', '讨论作者'), ('reply-author', '回复作者'), ('other', '其他用户'), ('admin', '管理员');
    INSERT INTO user_role VALUES ('admin', 'admin');
  `)
  migrateCommunity()
  migrateCommunity()
  const app = express()
  app.use(express.json())
  const optionalUser = (req, _res, next) => {
    req.accountUser = database.prepare('SELECT id, name FROM user WHERE id = ?').get(req.get('X-Test-User') || '') || null
    next()
  }
  setupCommunityRoutes(app, {
    optionalUser,
    requireOrigin(req, res, next) {
      if (req.get('Origin') !== origin) return res.status(403).json({ error: '请求来源不受信任' })
      next()
    },
    requireUser(req, res, next) {
      optionalUser(req, res, () => {
        if (!req.accountUser) return res.status(401).json({ error: '请先登录' })
        next()
      })
    }
  })
  server = await new Promise(resolve => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener))
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

beforeEach(() => {
  database.exec(`
    DELETE FROM community_report;
    DELETE FROM community_reply_revision;
    DELETE FROM community_post_revision;
    DELETE FROM community_post_like;
    DELETE FROM community_post_bookmark;
    UPDATE community_post SET accepted_reply_id = NULL;
    DELETE FROM community_reply;
    DELETE FROM community_post;
  `)
  postId = Number(database.prepare(`INSERT INTO community_post
    (author_id, category_id, kind, title, body, tags, linked_experiment, evidence_card, created_at, updated_at)
    VALUES ('author', 1, 'question', '原讨论标题', '原讨论观点', '["来源"]', 'fault-model', 'rainfall-observation', ?, ?)`)
    .run(timestamp, timestamp).lastInsertRowid)
  replyId = Number(database.prepare(`INSERT INTO community_reply (post_id, author_id, body, created_at, updated_at)
    VALUES (?, 'reply-author', '原回复观点', ?, ?)`).run(postId, timestamp, timestamp).lastInsertRowid)
})

afterAll(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  database.close()
})

describe('community correction permissions through HTTP middleware', () => {
  it.each([
    ['author', 200, 403],
    ['reply-author', 403, 200],
    ['other', 403, 403],
    ['admin', 200, 200],
    [null, 401, 401]
  ])('enforces independent post and reply authorship for %s', async (userId, postStatus, replyStatus) => {
    expect((await request(`/api/community/posts/${postId}`, {
      method: 'PATCH', userId, body: { title: '修订标题', body: '修订讨论' }
    })).status).toBe(postStatus)
    expect((await request(`/api/community/replies/${replyId}`, {
      method: 'PATCH', userId, body: { body: '修订回复' }
    })).status).toBe(replyStatus)
  })

  it.each([
    ['author', 403], ['reply-author', 200], ['other', 403], ['admin', 200], [null, 401]
  ])('permits reply withdrawal only by its author or an administrator: %s', async (userId, status) => {
    const result = await request(`/api/community/replies/${replyId}`, { method: 'DELETE', userId })
    expect(result.status).toBe(status)
    expect(database.prepare('SELECT status FROM community_reply WHERE id = ?').get(replyId).status)
      .toBe(status === 200 ? 'hidden' : 'published')
  })

  it('requires trusted origins for every mutation, including corrections and reply reports', async () => {
    for (const [path, method, body] of [
      [`/api/community/posts/${postId}`, 'PATCH', { body: '修改讨论' }],
      [`/api/community/replies/${replyId}`, 'PATCH', { body: '修改回复' }],
      [`/api/community/replies/${replyId}`, 'DELETE', undefined],
      ['/api/community/reports', 'POST', { replyId, reason: '待核对' }]
    ]) {
      expect((await request(path, { method, body, userId: 'admin', requestOrigin: 'https://untrusted.invalid' })).status).toBe(403)
    }
    expect(database.prepare('SELECT body FROM community_reply WHERE id = ?').get(replyId).body).toBe('原回复观点')
  })

  it('records the previous public version, editor and time, preserves attachments and skips no-op edits', async () => {
    const previousPost = database.prepare('SELECT * FROM community_post WHERE id = ?').get(postId)
    const postEdit = await request(`/api/community/posts/${postId}`, {
      method: 'PATCH', body: { title: '修订标题', body: '修订讨论', expectedUpdatedAt: timestamp }
    })
    expect(postEdit.payload.revisionRecorded).toBe(true)
    const detail = (await request(`/api/community/posts/${postId}`)).payload
    expect(detail.post).toMatchObject({ tags: ['来源'], linkedExperiment: 'fault-model', evidenceId: 'rainfall-observation' })
    expect(Date.parse(detail.post.updatedAt)).toBeGreaterThan(Date.parse(timestamp))
    const postHistory = await request(`/api/community/posts/${postId}/revisions`, { userId: null })
    expect(postHistory.payload.revisions).toMatchObject([{ revisionNo: 1, title: previousPost.title, body: previousPost.body, editor: '讨论作者' }])
    expect(postHistory.payload.revisions[0].editedAt).toBe(detail.post.updatedAt)
    expect((await request(`/api/community/posts/${postId}`, {
      method: 'PATCH', body: { title: '修订标题', body: '修订讨论', expectedUpdatedAt: detail.post.updatedAt }
    })).payload.revisionRecorded).toBe(false)

    await request(`/api/community/replies/${replyId}`, { method: 'PATCH', userId: 'reply-author', body: { body: '修订回复' } })
    await request(`/api/community/replies/${replyId}`, { method: 'PATCH', userId: 'admin', body: { body: '管理员修订回复' } })
    const replyHistory = await request(`/api/community/replies/${replyId}/revisions`, { userId: null })
    expect(replyHistory.payload.revisions).toMatchObject([
      { revisionNo: 2, body: '修订回复', editor: '管理员' },
      { revisionNo: 1, body: '原回复观点', editor: '回复作者' }
    ])
    expect(Date.parse(replyHistory.payload.revisions[0].editedAt)).toBeGreaterThan(Date.parse(replyHistory.payload.revisions[1].editedAt))
    expect((await request(`/api/community/replies/${replyId}`, {
      method: 'PATCH', userId: 'admin', body: { body: ' 管理员修订回复 ' }
    })).payload.revisionRecorded).toBe(false)
    expect(database.prepare('SELECT COUNT(*) AS count FROM community_reply_revision').get().count).toBe(2)
  })

  it('rejects stale drafts and invalid content without overwriting or recording a revision', async () => {
    await request(`/api/community/posts/${postId}`, { method: 'PATCH', body: { body: '较新观点' } })
    expect((await request(`/api/community/posts/${postId}`, {
      method: 'PATCH', body: { body: '过期观点', expectedUpdatedAt: timestamp }
    })).status).toBe(409)
    await request(`/api/community/replies/${replyId}`, { method: 'PATCH', userId: 'reply-author', body: { body: '较新回复' } })
    expect((await request(`/api/community/replies/${replyId}`, {
      method: 'PATCH', userId: 'reply-author', body: { body: '过期回复', expectedUpdatedAt: timestamp }
    })).status).toBe(409)
    for (const body of ['', '  ', '字'.repeat(3001), null]) {
      expect((await request(`/api/community/replies/${replyId}`, {
        method: 'PATCH', userId: 'reply-author', body: { body }
      })).status).toBe(400)
    }
    expect(database.prepare('SELECT body FROM community_reply WHERE id = ?').get(replyId).body).toBe('较新回复')
    expect(database.prepare('SELECT COUNT(*) AS count FROM community_reply_revision').get().count).toBe(1)
    expect(database.prepare('SELECT COUNT(*) AS count FROM community_post_revision').get().count).toBe(1)
  })

  it('does not silently retain acceptance after a substantive reply edit or withdrawal', async () => {
    database.prepare('UPDATE community_post SET accepted_reply_id = ? WHERE id = ?').run(replyId, postId)
    await request(`/api/community/replies/${replyId}`, { method: 'PATCH', userId: 'reply-author', body: { body: '原回复观点' } })
    expect(database.prepare('SELECT accepted_reply_id FROM community_post WHERE id = ?').get(postId).accepted_reply_id).toBe(replyId)
    await request(`/api/community/replies/${replyId}`, { method: 'PATCH', userId: 'reply-author', body: { body: '修订回复' } })
    expect((await request(`/api/community/posts/${postId}`)).payload.post.acceptedReplyId).toBeNull()
    database.prepare('UPDATE community_post SET accepted_reply_id = ? WHERE id = ?').run(replyId, postId)
    await request(`/api/community/replies/${replyId}`, { method: 'DELETE', userId: 'reply-author' })
    expect(database.prepare('SELECT accepted_reply_id FROM community_post WHERE id = ?').get(postId).accepted_reply_id).toBeNull()
    expect((await request('/api/community/posts?hasAccepted=1')).payload.posts).toEqual([])
  })

  it.each(['withdraw', 'moderate', 'hide-parent', 'delete-parent'])('blocks hidden/deleted content and its history for every identity: %s', async action => {
    await request(`/api/community/posts/${postId}`, { method: 'PATCH', body: { body: '修订讨论' } })
    await request(`/api/community/replies/${replyId}`, { method: 'PATCH', userId: 'reply-author', body: { body: '修订回复' } })
    if (action === 'withdraw') await request(`/api/community/replies/${replyId}`, { method: 'DELETE', userId: 'reply-author' })
    if (action === 'moderate') {
      const report = await request('/api/community/reports', { method: 'POST', body: { replyId, reason: '需要审核' } })
      await request(`/api/community/moderation/reports/${report.payload.id}`, { method: 'POST', userId: 'admin', body: { action: 'hide' } })
    }
    if (action === 'hide-parent') database.prepare("UPDATE community_post SET status = 'hidden' WHERE id = ?").run(postId)
    if (action === 'delete-parent') await request(`/api/community/posts/${postId}`, { method: 'DELETE' })
    for (const userId of [null, 'author', 'reply-author', 'other', 'admin']) {
      for (const [path, method, body] of [
        [`/api/community/replies/${replyId}/revisions`, 'GET', undefined],
        [`/api/community/replies/${replyId}`, 'PATCH', { body: '不可恢复' }],
        [`/api/community/replies/${replyId}`, 'DELETE', undefined],
        ['/api/community/reports', 'POST', { replyId, reason: '不可访问内容' }]
      ]) {
        const result = await request(path, { method, body, userId })
        expect(result.status).toBe(userId || method === 'GET' ? 404 : 401)
        expect(JSON.stringify(result.payload)).not.toMatch(/原回复观点|修订回复/)
      }
      if (action.endsWith('parent')) {
        for (const path of [`/api/community/posts/${postId}`, `/api/community/posts/${postId}/revisions`]) {
          const result = await request(path, { userId })
          expect(result.status).toBe(404)
          expect(JSON.stringify(result.payload)).not.toMatch(/原讨论观点|修订讨论/)
        }
      }
    }
    expect(database.prepare('SELECT COUNT(*) AS count FROM community_reply_revision').get().count).toBe(1)
  })

  it('ignores stale accepted IDs for already-hidden replies and posts in all public answer surfaces', async () => {
    database.prepare('UPDATE community_post SET accepted_reply_id = ? WHERE id = ?').run(replyId, postId)
    database.prepare("UPDATE community_reply SET status = 'hidden' WHERE id = ?").run(replyId)
    const detail = (await request(`/api/community/posts/${postId}`)).payload
    expect(detail.post.acceptedReplyId).toBeNull()
    expect(detail.replies).toEqual([])
    expect((await request('/api/community/posts')).payload.posts[0]).toMatchObject({ acceptedReplyId: null, acceptedAnswerExcerpt: null })
    expect((await request('/api/community/posts?hasAccepted=1')).payload.posts).toEqual([])
    database.prepare("UPDATE community_reply SET status = 'published' WHERE id = ?").run(replyId)
    database.prepare("UPDATE community_post SET status = 'hidden' WHERE id = ?").run(postId)
    expect((await request('/api/community/users/reply-author')).payload.stats.acceptedAnswersCount).toBe(0)
  })

  it('routes reply corrections to moderators with target identity but no leaked content', async () => {
    expect((await request('/api/community/reports', { method: 'POST', userId: null, body: { replyId, reason: '待核对' } })).status).toBe(401)
    const report = await request('/api/community/reports', { method: 'POST', userId: 'other', body: { replyId, reason: '请核对出处' } })
    expect(report.status).toBe(201)
    expect((await request('/api/community/reports', { method: 'POST', userId: 'other', body: { replyId, reason: '重复反馈' } })).status).toBe(409)
    expect((await request('/api/community/moderation/reports', { userId: 'other' })).status).toBe(403)
    const queue = (await request('/api/community/moderation/reports', { userId: 'admin' })).payload.reports
    expect(queue).toMatchObject([{ reply_id: replyId, post_id: null, discussionId: postId, contentAvailable: true, reason: '请核对出处' }])
    expect(JSON.stringify(queue)).not.toContain('原回复观点')
    database.prepare("UPDATE community_post SET status = 'hidden' WHERE id = ?").run(postId)
    expect((await request('/api/community/moderation/reports', { userId: 'admin' })).payload.reports[0].contentAvailable).toBe(false)
  })

  it('keeps bounded reporting and refuses malformed or absent targets', async () => {
    for (const body of [
      { postId, replyId, reason: '多个目标' },
      { postId: 'invalid', replyId, reason: '无效目标' },
      { postId: 0, replyId, reason: '无效目标' },
      { replyId, reason: ' ' },
      { replyId, reason: '字'.repeat(501) }
    ]) expect((await request('/api/community/reports', { method: 'POST', body })).status).toBe(400)
    expect((await request('/api/community/reports', { method: 'POST', body: { replyId: 999999, reason: '不存在' } })).status).toBe(404)
    for (let index = 0; index < 10; index++) {
      database.prepare('INSERT INTO community_report (reporter_id, reply_id, reason, created_at) VALUES (?, ?, ?, ?)')
        .run('other', replyId, '已有反馈', new Date().toISOString())
    }
    expect((await request('/api/community/reports', { method: 'POST', userId: 'other', body: { postId, reason: '超出上限' } })).status).toBe(429)
    expect((await request('/api/community/replies/invalid/revisions')).status).toBe(404)
    expect((await request('/api/community/replies/999999', { method: 'PATCH', body: { body: '不存在' } })).status).toBe(404)
  })

  it('backfills legacy reply timestamps without replacing bodies or existing edit times', () => {
    database.prepare('UPDATE community_reply SET updated_at = NULL WHERE id = ?').run(replyId)
    migrateCommunity()
    expect(database.prepare('SELECT body, updated_at FROM community_reply WHERE id = ?').get(replyId))
      .toEqual({ body: '原回复观点', updated_at: timestamp })
    const newer = '2026-11-02T00:00:00.000Z'
    database.prepare('UPDATE community_reply SET updated_at = ? WHERE id = ?').run(newer, replyId)
    migrateCommunity()
    expect(database.prepare('SELECT updated_at FROM community_reply WHERE id = ?').get(replyId).updated_at).toBe(newer)
  })
})
