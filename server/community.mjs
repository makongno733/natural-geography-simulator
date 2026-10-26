import { database } from './database.mjs'

const initialCategories = [
  ['general', '地理学综合交流', '专业交流、经验分享与日常讨论'],
  ['physical', '自然地理学', '地貌、气候、水文、土壤与生态'],
  ['human', '人文地理学', '城市、人口、经济与区域发展'],
  ['gis', 'GIS / 遥感 / 测绘', '空间数据、制图、遥感与测绘技术'],
  ['education', '地理教育', '教学设计、课堂实践与师范生交流'],
  ['graduate', '考研与升学', '院校、复习、升学与研究生生活'],
  ['research', '学术研究', '研究方法、论文与合作'],
  ['resources', '资源共享', '合法开放的教材、课程、数据与工具'],
  ['life', '地理生活', '野外实习、摄影、旅行与见闻']
]

export function migrateCommunity() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS community_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0, 1))
    );
    CREATE TABLE IF NOT EXISTS community_post (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id TEXT NOT NULL REFERENCES user(id),
      category_id INTEGER NOT NULL REFERENCES community_category(id),
      kind TEXT NOT NULL CHECK(kind IN ('discussion', 'question')),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published', 'hidden')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS community_post_feed ON community_post(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS community_post_category ON community_post(category_id, status, created_at DESC);
    CREATE INDEX IF NOT EXISTS community_post_author ON community_post(author_id, created_at DESC);
    CREATE TABLE IF NOT EXISTS community_reply (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES community_post(id),
      parent_id INTEGER REFERENCES community_reply(id),
      author_id TEXT NOT NULL REFERENCES user(id),
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published', 'hidden')),
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS community_reply_post ON community_reply(post_id, created_at);
    CREATE TABLE IF NOT EXISTS community_report (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id TEXT NOT NULL REFERENCES user(id),
      post_id INTEGER REFERENCES community_post(id),
      reply_id INTEGER REFERENCES community_reply(id),
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'resolved')),
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      resolved_by TEXT REFERENCES user(id),
      CHECK((post_id IS NOT NULL) != (reply_id IS NOT NULL))
    );
    CREATE INDEX IF NOT EXISTS community_report_status ON community_report(status, created_at DESC);
    CREATE VIRTUAL TABLE IF NOT EXISTS community_post_fts USING fts5(title, body, tokenize='trigram');
    CREATE TRIGGER IF NOT EXISTS community_post_fts_insert AFTER INSERT ON community_post BEGIN
      INSERT INTO community_post_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
    END;
    CREATE TRIGGER IF NOT EXISTS community_post_fts_update AFTER UPDATE OF title, body ON community_post BEGIN
      DELETE FROM community_post_fts WHERE rowid = old.id;
      INSERT INTO community_post_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
    END;
    CREATE TRIGGER IF NOT EXISTS community_post_fts_delete AFTER DELETE ON community_post BEGIN
      DELETE FROM community_post_fts WHERE rowid = old.id;
    END;
  `)
  const seed = database.prepare('INSERT OR IGNORE INTO community_category (slug, name, description, sort_order) VALUES (?, ?, ?, ?)')
  database.transaction(() => initialCategories.forEach(([slug, name, description], index) => seed.run(slug, name, description, index)))()
}

const clean = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null
const positiveId = value => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null
const isAdmin = userId => database.prepare("SELECT 1 FROM user_role WHERE user_id = ? AND role = 'admin'").get(userId) !== undefined
const streams = new Set()
let streamEventId = 0
function announce(type, postId) {
  const message = `id: ${++streamEventId}\nevent: community\ndata: ${JSON.stringify({ type, postId })}\n\n`
  for (const stream of streams) stream.write(message)
}

export function setupCommunityRoutes(app, { requireOrigin, requireUser }) {
  app.get('/api/community/stream', requireOrigin, (req, res) => {
    if (streams.size >= 200) return res.status(503).json({ error: '实时连接暂时已满' })
    res.set({ 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' })
    res.flushHeaders()
    res.write(': connected\n\n')
    streams.add(res)
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 25000)
    req.on('close', () => { clearInterval(heartbeat); streams.delete(res) })
  })

  app.get('/api/community/categories', (_req, res) => {
    res.json({ categories: database.prepare('SELECT id, slug, name, description FROM community_category WHERE active = 1 ORDER BY sort_order, id').all() })
  })

  app.get('/api/community/me', requireUser, (req, res) => {
    res.json({ isAdmin: isAdmin(req.accountUser.id) })
  })

  app.get('/api/community/moderation/categories', requireUser, (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    res.json({ categories: database.prepare('SELECT id, slug, name, description, sort_order AS sortOrder, active FROM community_category ORDER BY sort_order, id').all() })
  })

  app.post('/api/community/moderation/categories', requireOrigin, requireUser, (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    const slug = clean(req.body?.slug, 40)
    const name = clean(req.body?.name, 50)
    const description = typeof req.body?.description === 'string' ? req.body.description.trim().slice(0, 200) : ''
    if (!slug || !/^[a-z0-9-]+$/.test(slug) || !name) return res.status(400).json({ error: '分区名称或标识无效' })
    try {
      const result = database.prepare('INSERT INTO community_category (slug, name, description, sort_order) VALUES (?, ?, ?, ?)')
        .run(slug, name, description, Number.isSafeInteger(req.body?.sortOrder) ? req.body.sortOrder : 100)
      res.status(201).json({ id: result.lastInsertRowid })
    } catch { res.status(409).json({ error: '分区名称或标识已存在' }) }
  })

  app.patch('/api/community/moderation/categories/:id', requireOrigin, requireUser, (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    const id = positiveId(req.params.id)
    const category = id && database.prepare('SELECT * FROM community_category WHERE id = ?').get(id)
    if (!category) return res.status(404).json({ error: '分区不存在' })
    const name = req.body?.name === undefined ? category.name : clean(req.body.name, 50)
    const description = req.body?.description === undefined ? category.description : typeof req.body.description === 'string' && req.body.description.length <= 200 ? req.body.description.trim() : null
    const active = req.body?.active === undefined ? category.active : req.body.active === true ? 1 : req.body.active === false ? 0 : null
    const sortOrder = req.body?.sortOrder === undefined ? category.sort_order : Number.isSafeInteger(req.body.sortOrder) ? req.body.sortOrder : null
    if (!name || description === null || active === null || sortOrder === null) return res.status(400).json({ error: '分区信息无效' })
    try {
      database.prepare('UPDATE community_category SET name = ?, description = ?, active = ?, sort_order = ? WHERE id = ?')
        .run(name, description, active, sortOrder, id)
      res.json({ status: 'updated' })
    } catch { res.status(409).json({ error: '分区名称已存在' }) }
  })

  app.get('/api/community/posts', (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : ''
    const categoryId = req.query.category ? positiveId(req.query.category) : null
    if (req.query.category && !categoryId) return res.status(400).json({ error: '无效分区' })
    const kind = ['discussion', 'question'].includes(req.query.kind) ? req.query.kind : null
    const page = Math.min(Math.max(Number.parseInt(req.query.page, 10) || 1, 1), 1000)
    const clauses = ["p.status = 'published'"]
    const params = []
    if (categoryId) { clauses.push('p.category_id = ?'); params.push(categoryId) }
    if (kind) { clauses.push('p.kind = ?'); params.push(kind) }
    let rankJoin = ''
    let order = 'p.created_at DESC'
    if (query.length >= 3) {
      rankJoin = 'JOIN community_post_fts ON community_post_fts.rowid = p.id'
      clauses.push('community_post_fts MATCH ?')
      params.push(`"${query.replaceAll('"', '""')}"`)
      // FTS5 rank is only meaningful inside a MATCH query.
      order = 'bm25(community_post_fts), p.created_at DESC'
    } else if (query) {
      clauses.push('(p.title LIKE ? OR p.body LIKE ?)')
      params.push(`%${query}%`, `%${query}%`)
    }
    const sql = `SELECT p.id, p.kind, p.title, substr(p.body, 1, 160) AS excerpt,
      p.created_at AS createdAt, c.name AS category, c.id AS categoryId, u.name AS author,
      (SELECT COUNT(*) FROM community_reply r WHERE r.post_id = p.id AND r.status = 'published') AS replyCount
      FROM community_post p ${rankJoin}
      JOIN community_category c ON c.id = p.category_id JOIN user u ON u.id = p.author_id
      WHERE ${clauses.join(' AND ')} ORDER BY ${order} LIMIT 20 OFFSET ?`
    try { res.json({ posts: database.prepare(sql).all(...params, (page - 1) * 20), page }) }
    catch { res.status(400).json({ error: '搜索词无法检索，请换一个关键词' }) }
  })

  app.get('/api/community/posts/:id', (req, res) => {
    const id = positiveId(req.params.id)
    if (!id) return res.status(404).json({ error: '讨论不存在' })
    const post = database.prepare(`SELECT p.id, p.author_id AS authorId, p.category_id AS categoryId, p.kind, p.title, p.body,
      p.created_at AS createdAt, c.name AS category, u.name AS author
      FROM community_post p JOIN community_category c ON c.id = p.category_id JOIN user u ON u.id = p.author_id
      WHERE p.id = ? AND p.status = 'published'`).get(id)
    if (!post) return res.status(404).json({ error: '讨论不存在' })
    const replies = database.prepare(`SELECT r.id, r.parent_id AS parentId, r.body, r.created_at AS createdAt,
      r.author_id AS authorId, u.name AS author FROM community_reply r JOIN user u ON u.id = r.author_id
      WHERE r.post_id = ? AND r.status = 'published' ORDER BY r.created_at, r.id LIMIT 500`).all(id)
    res.json({ post, replies })
  })

  app.post('/api/community/posts', requireOrigin, requireUser, (req, res) => {
    const title = clean(req.body?.title, 120)
    const body = clean(req.body?.body, 10000)
    const categoryId = positiveId(req.body?.categoryId)
    const kind = ['discussion', 'question'].includes(req.body?.kind) ? req.body.kind : null
    if (!title || !body || !categoryId || !kind) return res.status(400).json({ error: '请完整填写标题、内容、分区和类型' })
    if (!database.prepare('SELECT 1 FROM community_category WHERE id = ? AND active = 1').get(categoryId)) return res.status(400).json({ error: '分区不存在' })
    const recent = database.prepare('SELECT COUNT(*) AS n FROM community_post WHERE author_id = ? AND created_at > ?')
      .get(req.accountUser.id, new Date(Date.now() - 3600000).toISOString()).n
    if (recent >= 5) return res.status(429).json({ error: '发帖过于频繁，请稍后再试' })
    const now = new Date().toISOString()
    const result = database.prepare('INSERT INTO community_post (author_id, category_id, kind, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(req.accountUser.id, categoryId, kind, title, body, now, now)
    announce('post', result.lastInsertRowid)
    res.status(201).json({ id: result.lastInsertRowid })
  })

  app.post('/api/community/posts/:id/replies', requireOrigin, requireUser, (req, res) => {
    const postId = positiveId(req.params.id)
    const parentId = req.body?.parentId ? positiveId(req.body.parentId) : null
    const body = clean(req.body?.body, 3000)
    if (!postId || !body || (req.body?.parentId && !parentId)) return res.status(400).json({ error: '回复内容无效' })
    if (!database.prepare("SELECT 1 FROM community_post WHERE id = ? AND status = 'published'").get(postId)) return res.status(404).json({ error: '讨论不存在' })
    if (parentId && !database.prepare("SELECT 1 FROM community_reply WHERE id = ? AND post_id = ? AND status = 'published'").get(parentId, postId)) return res.status(400).json({ error: '引用的回复不存在' })
    const recent = database.prepare('SELECT COUNT(*) AS n FROM community_reply WHERE author_id = ? AND created_at > ?')
      .get(req.accountUser.id, new Date(Date.now() - 60000).toISOString()).n
    if (recent >= 3) return res.status(429).json({ error: '回复过于频繁，请稍后再试' })
    const result = database.prepare('INSERT INTO community_reply (post_id, parent_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(postId, parentId, req.accountUser.id, body, new Date().toISOString())
    announce('reply', postId)
    res.status(201).json({ id: result.lastInsertRowid })
  })

  app.post('/api/community/reports', requireOrigin, requireUser, (req, res) => {
    const postId = req.body?.postId ? positiveId(req.body.postId) : null
    const replyId = req.body?.replyId ? positiveId(req.body.replyId) : null
    const reason = clean(req.body?.reason, 500)
    if (!reason || Boolean(postId) === Boolean(replyId)) return res.status(400).json({ error: '请选择一项内容并填写举报原因' })
    const exists = postId
      ? database.prepare('SELECT 1 FROM community_post WHERE id = ?').get(postId)
      : database.prepare('SELECT 1 FROM community_reply WHERE id = ?').get(replyId)
    if (!exists) return res.status(404).json({ error: '内容不存在' })
    const recent = database.prepare('SELECT COUNT(*) AS n FROM community_report WHERE reporter_id = ? AND created_at > ?')
      .get(req.accountUser.id, new Date(Date.now() - 86400000).toISOString()).n
    if (recent >= 10) return res.status(429).json({ error: '今天提交的举报已达上限' })
    const duplicate = database.prepare('SELECT 1 FROM community_report WHERE reporter_id = ? AND post_id IS ? AND reply_id IS ? AND status = ?')
      .get(req.accountUser.id, postId, replyId, 'open')
    if (duplicate) return res.status(409).json({ error: '这项内容已由你举报，正在处理' })
    const result = database.prepare('INSERT INTO community_report (reporter_id, post_id, reply_id, reason, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(req.accountUser.id, postId, replyId, reason, new Date().toISOString())
    res.status(201).json({ id: result.lastInsertRowid })
  })

  app.get('/api/community/moderation/reports', requireUser, (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    res.json({ reports: database.prepare("SELECT * FROM community_report WHERE status = 'open' ORDER BY created_at LIMIT 100").all() })
  })
  app.post('/api/community/moderation/reports/:id', requireOrigin, requireUser, (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    const id = positiveId(req.params.id)
    if (!id || !['hide', 'dismiss'].includes(req.body?.action)) return res.status(400).json({ error: '处理操作无效' })
    const report = database.prepare("SELECT * FROM community_report WHERE id = ? AND status = 'open'").get(id)
    if (!report) return res.status(404).json({ error: '举报不存在或已处理' })
    database.transaction(() => {
      if (req.body.action === 'hide') {
        if (report.post_id) database.prepare("UPDATE community_post SET status = 'hidden' WHERE id = ?").run(report.post_id)
        else database.prepare("UPDATE community_reply SET status = 'hidden' WHERE id = ?").run(report.reply_id)
      }
      database.prepare("UPDATE community_report SET status = 'resolved', resolved_at = ?, resolved_by = ? WHERE id = ?")
        .run(new Date().toISOString(), req.accountUser.id, id)
    })()
    res.json({ status: 'resolved' })
  })
}
