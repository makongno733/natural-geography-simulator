import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node'
import { auth } from './auth.mjs'
import { database } from './database.mjs'
import { allowedOrigins, mailReady } from './config.mjs'
import { answerLessonQuestion } from './lesson-ai.mjs'
import { getGeoEvents, startGeoEventSync } from './geo-events.mjs'
import { setupInquiryRoutes } from './inquiry.mjs'

const app = express()
const distPath = resolve(process.env.ACCOUNT_DIST_PATH || './dist-account')
app.disable('x-powered-by')
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)), credentials: true }))
app.all('/api/auth/*splat', toNodeHandler(auth))
app.use(express.json({ limit: '16kb' }))

function requireOrigin(req, res, next) {
  if (!allowedOrigins.has(req.get('origin'))) return res.status(403).json({ error: '不允许的来源' })
  next()
}

async function requireUser(req, res, next) {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    if (!session?.user) return res.status(401).json({ error: '请先登录' })
    req.accountUser = session.user
    next()
  } catch (error) {
    next(error)
  }
}

function sectionKey(value) {
  if (typeof value !== 'string' || value.length > 240) return null
  const parts = value.split('|')
  return parts.length === 4 && parts.every((part) => part.length > 0 && part.length <= 60) ? value : null
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.get('/api/config', (_req, res) => res.json({ email: mailReady, ai: Boolean(process.env.DEEPSEEK_API_KEY) }))
app.get('/api/geo-events', async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=300')
  res.json(await getGeoEvents())
})

const aiRequests = []
app.post('/api/assistant/ask', requireOrigin, async (req, res, next) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : ''
  if (!question || question.length > 300) return res.status(400).json({ error: '问题须为 1–300 字' })
  if (!process.env.DEEPSEEK_API_KEY) return res.status(503).json({ error: '课程问答尚未启用' })
  const now = Date.now()
  while (aiRequests.length && aiRequests[0] < now - 86_400_000) aiRequests.shift()
  if (aiRequests.length >= 200 || aiRequests.filter((time) => time > now - 60_000).length >= 12) {
    return res.status(429).json({ error: '今日或当前问答次数已达上限，请稍后再试' })
  }
  aiRequests.push(now)
  try {
    res.json(await answerLessonQuestion(question))
  } catch (error) {
    if (error.message === 'DEEPSEEK_429') return res.status(503).json({ error: '课程问答暂时繁忙，请稍后再试' })
    if (error.name === 'TimeoutError') return res.status(504).json({ error: '课程问答超时，请稍后再试' })
    next(error)
  }
})

app.get('/api/comments', (req, res) => {
  const key = sectionKey(req.query.section)
  if (!key) return res.status(400).json({ error: '无效的章节' })
  const rows = database.prepare(`
    SELECT c.id, c.user_id AS userId, c.body, c.created_at AS createdAt, u.name AS author
    FROM lesson_comment c JOIN user u ON u.id = c.user_id
    WHERE c.section_key = ? AND c.deleted_at IS NULL
    ORDER BY c.created_at DESC LIMIT 50
  `).all(key)
  res.json({ comments: rows })
})

app.post('/api/comments', requireOrigin, requireUser, (req, res) => {
  const key = sectionKey(req.body?.section)
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : ''
  if (!key || !body || body.length > 1000) return res.status(400).json({ error: '评论须为 1–1000 字' })
  const recent = database.prepare(`SELECT COUNT(*) AS count FROM lesson_comment WHERE user_id = ? AND created_at > ?`)
    .get(req.accountUser.id, new Date(Date.now() - 60_000).toISOString()).count
  if (recent >= 3) return res.status(429).json({ error: '评论太频繁，请稍后再试' })
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  database.prepare('INSERT INTO lesson_comment (id, user_id, section_key, body, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, req.accountUser.id, key, body, createdAt)
  res.status(201).json({ comment: { id, userId: req.accountUser.id, body, createdAt, author: req.accountUser.name } })
})

app.delete('/api/comments/:id', requireOrigin, requireUser, (req, res) => {
  const result = database.prepare('UPDATE lesson_comment SET deleted_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
    .run(new Date().toISOString(), req.params.id, req.accountUser.id)
  if (!result.changes) return res.status(404).json({ error: '评论不存在' })
  res.status(204).end()
})

setupInquiryRoutes(app, { requireOrigin, requireUser })

app.get('/api/*splat', (_req, res) => res.status(404).json({ error: '接口不存在' }))
app.use(express.static(distPath, { index: false }))
app.get('*splat', (_req, res) => {
  const indexPath = resolve(distPath, 'account.html')
  if (!existsSync(indexPath)) return res.status(404).send('Account page is not built')
  res.sendFile(indexPath)
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: '服务暂时不可用' })
})

const bindAddress = process.env.ACCOUNT_BIND || '127.0.0.1'
app.listen(Number(process.env.ACCOUNT_PORT || 4100), bindAddress, () => {
  console.log(`Account API listening on ${bindAddress}:${process.env.ACCOUNT_PORT || 4100}`)
  startGeoEventSync()
})
