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

  // 幂等升级 community_post 表字段（加法迁移，保证绝不损坏老数据）
  const columns = database.prepare("PRAGMA table_info(community_post)").all().map(c => c.name)
  if (!columns.includes('accepted_reply_id')) {
    database.exec("ALTER TABLE community_post ADD COLUMN accepted_reply_id INTEGER REFERENCES community_reply(id);")
  }
  if (!columns.includes('tags')) {
    database.exec("ALTER TABLE community_post ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';")
  }
  if (!columns.includes('linked_experiment')) {
    database.exec("ALTER TABLE community_post ADD COLUMN linked_experiment TEXT DEFAULT NULL;")
  }
  if (!columns.includes('evidence_card')) {
    database.exec("ALTER TABLE community_post ADD COLUMN evidence_card TEXT DEFAULT NULL;")
  }

  // 扩展表：点赞、收藏、用户资料、学术交流社群、热点讨论、资源共享库
  database.exec(`
    CREATE TABLE IF NOT EXISTS community_post_like (
      post_id INTEGER NOT NULL REFERENCES community_post(id),
      user_id TEXT NOT NULL REFERENCES user(id),
      created_at TEXT NOT NULL,
      PRIMARY KEY (post_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS community_like_user ON community_post_like(user_id);

    CREATE TABLE IF NOT EXISTS community_post_bookmark (
      post_id INTEGER NOT NULL REFERENCES community_post(id),
      user_id TEXT NOT NULL REFERENCES user(id),
      created_at TEXT NOT NULL,
      PRIMARY KEY (post_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS community_bookmark_user ON community_post_bookmark(user_id);

    CREATE TABLE IF NOT EXISTS user_profile (
      user_id TEXT PRIMARY KEY REFERENCES user(id),
      title TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      institution TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_group (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      qq_number TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS community_hot_topic (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      stats TEXT NOT NULL,
      tag TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS community_resource (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      format TEXT NOT NULL,
      scale TEXT NOT NULL,
      description TEXT NOT NULL,
      source_url TEXT NOT NULL,
      license TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  // 预置默认分类
  const seedCat = database.prepare('INSERT OR IGNORE INTO community_category (slug, name, description, sort_order) VALUES (?, ?, ?, ?)')
  database.transaction(() => initialCategories.forEach(([slug, name, description], index) => seedCat.run(slug, name, description, index)))()

  // 社群、热点和资源只能在来源、授权和内容核验后收录，迁移时不生成示例数据。
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

function parseTags(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.slice(0, 5).map(t => String(t).trim().slice(0, 20)).filter(Boolean)
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, 5) : []
  } catch {
    return []
  }
}

export function setupCommunityRoutes(app, { requireOrigin, requireUser }) {
  // 1. 实时 SSE 流
  app.get('/api/community/stream', requireOrigin, (req, res) => {
    if (streams.size >= 200) return res.status(503).json({ error: '实时连接暂时已满' })
    res.set({ 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' })
    res.flushHeaders()
    res.write(': connected\n\n')
    streams.add(res)
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 25000)
    req.on('close', () => { clearInterval(heartbeat); streams.delete(res) })
  })

  // 2. 分区列表与管理
  app.get('/api/community/categories', (_req, res) => {
    res.json({ categories: database.prepare('SELECT id, slug, name, description FROM community_category WHERE active = 1 ORDER BY sort_order, id').all() })
  })

  app.get('/api/community/me', requireUser, (req, res) => {
    res.json({ isAdmin: isAdmin(req.accountUser.id), userId: req.accountUser.id })
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

  // 3. 帖子列表（支持搜索、标签筛选、分类筛选、类型筛选、排序）
  app.get('/api/community/posts', (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : ''
    const categoryId = req.query.category ? positiveId(req.query.category) : null
    if (req.query.category && !categoryId) return res.status(400).json({ error: '无效分区' })
    const kind = ['discussion', 'question'].includes(req.query.kind) ? req.query.kind : null
    const tag = typeof req.query.tag === 'string' && req.query.tag.trim() ? req.query.tag.trim().slice(0, 30) : null
    const page = Math.min(Math.max(Number.parseInt(req.query.page, 10) || 1, 1), 1000)
    const sort = req.query.sort === 'popular' ? 'popular' : 'newest'
    const currentUserId = req.accountUser?.id || null

    const clauses = ["p.status = 'published'"]
    const params = []
    if (categoryId) { clauses.push('p.category_id = ?'); params.push(categoryId) }
    if (kind) { clauses.push('p.kind = ?'); params.push(kind) }
    if (tag) { clauses.push('p.tags LIKE ?'); params.push(`%"${tag}"%`) }

    let rankJoin = ''
    let order = 'p.created_at DESC'
    if (query.length >= 3) {
      rankJoin = 'JOIN community_post_fts ON community_post_fts.rowid = p.id'
      clauses.push('community_post_fts MATCH ?')
      params.push(`"${query.replaceAll('"', '""')}"`)
      order = 'bm25(community_post_fts), p.created_at DESC'
    } else if (query) {
      clauses.push('(p.title LIKE ? OR p.body LIKE ?)')
      params.push(`%${query}%`, `%${query}%`)
    } else if (sort === 'popular') {
      order = '(likeCount * 3 + replyCount * 2) DESC, p.created_at DESC'
    }

    const sql = `SELECT p.id, p.kind, p.title, substr(p.body, 1, 160) AS excerpt,
      p.created_at AS createdAt, p.tags, p.linked_experiment AS linkedExperiment, p.evidence_card AS evidenceCard,
      p.accepted_reply_id AS acceptedReplyId, c.name AS category, c.id AS categoryId, u.name AS author,
      (SELECT COUNT(*) FROM community_reply r WHERE r.post_id = p.id AND r.status = 'published') AS replyCount,
      (SELECT COUNT(*) FROM community_post_like l WHERE l.post_id = p.id) AS likeCount,
      (SELECT COUNT(*) FROM community_post_bookmark b WHERE b.post_id = p.id) AS bookmarkCount
      ${currentUserId ? ', (SELECT 1 FROM community_post_like l WHERE l.post_id = p.id AND l.user_id = ?) AS liked' : ''}
      FROM community_post p ${rankJoin}
      JOIN community_category c ON c.id = p.category_id JOIN user u ON u.id = p.author_id
      WHERE ${clauses.join(' AND ')} ORDER BY ${order} LIMIT 20 OFFSET ?`

    try {
      const rawPosts = database.prepare(sql).all(...(currentUserId ? [currentUserId] : []), ...params, (page - 1) * 20)
      const posts = rawPosts.map(p => ({
        ...p,
        tags: parseTags(p.tags),
        evidenceCard: p.evidenceCard ? JSON.parse(p.evidenceCard) : null,
        liked: Boolean(p.liked)
      }))
      res.json({ posts, page })
    } catch {
      res.status(400).json({ error: '搜索词无法检索，请换一个关键词' })
    }
  })

  // 4. 帖子详情（含最佳答案、楼中楼回复与点赞收藏统计）
  app.get('/api/community/posts/:id', (req, res) => {
    const id = positiveId(req.params.id)
    if (!id) return res.status(404).json({ error: '讨论不存在' })
    const currentUserId = req.accountUser?.id || null

    const post = database.prepare(`SELECT p.id, p.author_id AS authorId, p.category_id AS categoryId, p.kind, p.title, p.body,
      p.tags, p.linked_experiment AS linkedExperiment, p.evidence_card AS evidenceCard, p.accepted_reply_id AS acceptedReplyId,
      p.created_at AS createdAt, c.name AS category, u.name AS author,
      (SELECT COUNT(*) FROM community_post_like l WHERE l.post_id = p.id) AS likeCount,
      (SELECT COUNT(*) FROM community_post_bookmark b WHERE b.post_id = p.id) AS bookmarkCount
      ${currentUserId ? `, (SELECT 1 FROM community_post_like l WHERE l.post_id = p.id AND l.user_id = ?) AS liked,
        (SELECT 1 FROM community_post_bookmark b WHERE b.post_id = p.id AND b.user_id = ?) AS bookmarked` : ''}
      FROM community_post p JOIN community_category c ON c.id = p.category_id JOIN user u ON u.id = p.author_id
      WHERE p.id = ? AND p.status = 'published'`).get(...(currentUserId ? [currentUserId, currentUserId] : []), id)

    if (!post) return res.status(404).json({ error: '讨论不存在' })

    const replies = database.prepare(`SELECT r.id, r.parent_id AS parentId, r.body, r.created_at AS createdAt,
      r.author_id AS authorId, u.name AS author FROM community_reply r JOIN user u ON u.id = r.author_id
      WHERE r.post_id = ? AND r.status = 'published' ORDER BY r.created_at, r.id LIMIT 500`).all(id)

    const formattedPost = {
      ...post,
      tags: parseTags(post.tags),
      evidenceCard: post.evidenceCard ? JSON.parse(post.evidenceCard) : null,
      liked: Boolean(post.liked),
      bookmarked: Boolean(post.bookmarked)
    }

    const formattedReplies = replies.map(r => ({
      ...r,
      isAccepted: r.id === post.acceptedReplyId
    }))

    res.json({ post: formattedPost, replies: formattedReplies })
  })

  // 5. 发布帖子 / 提问
  app.post('/api/community/posts', requireOrigin, requireUser, (req, res) => {
    const title = clean(req.body?.title, 120)
    const body = clean(req.body?.body, 10000)
    const categoryId = positiveId(req.body?.categoryId)
    const kind = ['discussion', 'question'].includes(req.body?.kind) ? req.body.kind : null
    const tags = JSON.stringify(parseTags(req.body?.tags))
    const linkedExperiment = typeof req.body?.linkedExperiment === 'string' && req.body.linkedExperiment.trim().length <= 60
      ? req.body.linkedExperiment.trim()
      : null
    const evidenceCard = typeof req.body?.evidenceId === 'string' && req.body.evidenceId.trim().length <= 60
      ? req.body.evidenceId.trim()
      : null

    if (!title || !body || !categoryId || !kind) return res.status(400).json({ error: '请完整填写标题、内容、分区和类型' })
    if (!database.prepare('SELECT 1 FROM community_category WHERE id = ? AND active = 1').get(categoryId)) return res.status(400).json({ error: '分区不存在' })

    const recent = database.prepare('SELECT COUNT(*) AS n FROM community_post WHERE author_id = ? AND created_at > ?')
      .get(req.accountUser.id, new Date(Date.now() - 3600000).toISOString()).n
    if (recent >= 5) return res.status(429).json({ error: '发帖过于频繁，请稍后再试' })

    const now = new Date().toISOString()
    const result = database.prepare('INSERT INTO community_post (author_id, category_id, kind, title, body, tags, linked_experiment, evidence_card, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(req.accountUser.id, categoryId, kind, title, body, tags, linkedExperiment, evidenceCard, now, now)

    announce('post', result.lastInsertRowid)
    res.status(201).json({ id: result.lastInsertRowid })
  })

  // 6. 编辑帖子
  app.patch('/api/community/posts/:id', requireOrigin, requireUser, (req, res) => {
    const id = positiveId(req.params.id)
    if (!id) return res.status(404).json({ error: '讨论不存在' })
    const post = database.prepare("SELECT * FROM community_post WHERE id = ? AND status = 'published'").get(id)
    if (!post) return res.status(404).json({ error: '讨论不存在' })

    const canEdit = post.author_id === req.accountUser.id || isAdmin(req.accountUser.id)
    if (!canEdit) return res.status(403).json({ error: '没有权限编辑此讨论' })

    const title = req.body?.title === undefined ? post.title : clean(req.body.title, 120)
    const body = req.body?.body === undefined ? post.body : clean(req.body.body, 10000)
    const tags = req.body?.tags === undefined ? post.tags : JSON.stringify(parseTags(req.body.tags))
    const linkedExperiment = req.body?.linkedExperiment === undefined ? post.linked_experiment : (typeof req.body.linkedExperiment === 'string' ? req.body.linkedExperiment.trim().slice(0, 60) : null)

    if (!title || !body) return res.status(400).json({ error: '标题与正文不能为空' })

    database.prepare('UPDATE community_post SET title = ?, body = ?, tags = ?, linked_experiment = ?, updated_at = ? WHERE id = ?')
      .run(title, body, tags, linkedExperiment, new Date().toISOString(), id)

    announce('post_edit', id)
    res.json({ status: 'updated' })
  })

  // 7. 删除帖子（软删除隐藏）
  if (typeof app.delete === 'function') {
    app.delete('/api/community/posts/:id', requireOrigin, requireUser, (req, res) => {
      const id = positiveId(req.params.id)
      if (!id) return res.status(404).json({ error: '讨论不存在' })
      const post = database.prepare('SELECT * FROM community_post WHERE id = ?').get(id)
      if (!post) return res.status(404).json({ error: '讨论不存在' })

      const canDelete = post.author_id === req.accountUser.id || isAdmin(req.accountUser.id)
      if (!canDelete) return res.status(403).json({ error: '没有权限删除此讨论' })

      database.prepare("UPDATE community_post SET status = 'hidden', updated_at = ? WHERE id = ?")
        .run(new Date().toISOString(), id)

      announce('post_delete', id)
      res.json({ status: 'deleted' })
    })
  }

  // 8. 问答采纳最佳答案
  app.post('/api/community/posts/:id/accept-reply', requireOrigin, requireUser, (req, res) => {
    const postId = positiveId(req.params.id)
    const replyId = req.body?.replyId ? positiveId(req.body.replyId) : null
    if (!postId || !replyId) return res.status(400).json({ error: '请求参数无效' })

    const post = database.prepare("SELECT * FROM community_post WHERE id = ? AND status = 'published'").get(postId)
    if (!post) return res.status(404).json({ error: '讨论不存在' })
    if (post.author_id !== req.accountUser.id) return res.status(403).json({ error: '只有提问作者可以标定最佳答案' })

    const reply = database.prepare("SELECT * FROM community_reply WHERE id = ? AND post_id = ? AND status = 'published'").get(replyId, postId)
    if (!reply) return res.status(404).json({ error: '回复不存在' })

    // 若已经采纳，再次点击则取消采纳；否则设置为该回复
    const nextAcceptedId = post.accepted_reply_id === replyId ? null : replyId
    database.prepare('UPDATE community_post SET accepted_reply_id = ? WHERE id = ?').run(nextAcceptedId, postId)

    announce('reply_accepted', postId)
    res.json({ acceptedReplyId: nextAcceptedId })
  })

  // 9. 点赞 / 赞同帖子
  app.post('/api/community/posts/:id/like', requireOrigin, requireUser, (req, res) => {
    const postId = positiveId(req.params.id)
    if (!postId) return res.status(404).json({ error: '讨论不存在' })
    if (!database.prepare("SELECT 1 FROM community_post WHERE id = ? AND status = 'published'").get(postId)) {
      return res.status(404).json({ error: '讨论不存在' })
    }

    const existing = database.prepare('SELECT 1 FROM community_post_like WHERE post_id = ? AND user_id = ?')
      .get(postId, req.accountUser.id)

    let liked = false
    if (existing) {
      database.prepare('DELETE FROM community_post_like WHERE post_id = ? AND user_id = ?').run(postId, req.accountUser.id)
      liked = false
    } else {
      database.prepare('INSERT INTO community_post_like (post_id, user_id, created_at) VALUES (?, ?, ?)')
        .run(postId, req.accountUser.id, new Date().toISOString())
      liked = true
    }

    const likeCount = database.prepare('SELECT COUNT(*) AS n FROM community_post_like WHERE post_id = ?').get(postId).n
    res.json({ liked, likeCount })
  })

  // 10. 收藏帖子
  app.post('/api/community/posts/:id/bookmark', requireOrigin, requireUser, (req, res) => {
    const postId = positiveId(req.params.id)
    if (!postId) return res.status(404).json({ error: '讨论不存在' })
    if (!database.prepare("SELECT 1 FROM community_post WHERE id = ? AND status = 'published'").get(postId)) {
      return res.status(404).json({ error: '讨论不存在' })
    }

    const existing = database.prepare('SELECT 1 FROM community_post_bookmark WHERE post_id = ? AND user_id = ?')
      .get(postId, req.accountUser.id)

    let bookmarked = false
    if (existing) {
      database.prepare('DELETE FROM community_post_bookmark WHERE post_id = ? AND user_id = ?').run(postId, req.accountUser.id)
      bookmarked = false
    } else {
      database.prepare('INSERT INTO community_post_bookmark (post_id, user_id, created_at) VALUES (?, ?, ?)')
        .run(postId, req.accountUser.id, new Date().toISOString())
      bookmarked = true
    }

    const bookmarkCount = database.prepare('SELECT COUNT(*) AS n FROM community_post_bookmark WHERE post_id = ?').get(postId).n
    res.json({ bookmarked, bookmarkCount })
  })

  // 11. 回复与评论
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

  // 12. 个人学术主页与资料
  app.get('/api/community/users/:id', (req, res) => {
    const userId = clean(req.params.id, 64)
    if (!userId) return res.status(404).json({ error: '用户不存在' })
    const user = database.prepare('SELECT id, name FROM user WHERE id = ?').get(userId)
    if (!user) return res.status(404).json({ error: '用户不存在' })

    const profile = database.prepare('SELECT title, bio, institution, location FROM user_profile WHERE user_id = ?').get(userId) || {
      title: '', bio: '', institution: '', location: ''
    }

    const postsCount = database.prepare("SELECT COUNT(*) AS n FROM community_post WHERE author_id = ? AND status = 'published'").get(userId).n
    const acceptedAnswersCount = database.prepare(`SELECT COUNT(*) AS n FROM community_reply r
      JOIN community_post p ON p.accepted_reply_id = r.id
      WHERE r.author_id = ? AND r.status = 'published'`).get(userId).n
    const likesReceived = database.prepare(`SELECT COUNT(*) AS n FROM community_post_like l
      JOIN community_post p ON p.id = l.post_id
      WHERE p.author_id = ?`).get(userId).n

    const recentPosts = database.prepare(`SELECT p.id, p.kind, p.title, p.created_at AS createdAt, c.name AS category
      FROM community_post p JOIN community_category c ON c.id = p.category_id
      WHERE p.author_id = ? AND p.status = 'published' ORDER BY p.created_at DESC LIMIT 10`).all(userId)

    res.json({
      user: {
        id: user.id,
        name: user.name,
        ...profile
      },
      stats: {
        postsCount,
        acceptedAnswersCount,
        likesReceived
      },
      recentPosts
    })
  })

  app.patch('/api/community/users/me', requireOrigin, requireUser, (req, res) => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim().slice(0, 60) : ''
    const bio = typeof req.body?.bio === 'string' ? req.body.bio.trim().slice(0, 300) : ''
    const institution = typeof req.body?.institution === 'string' ? req.body.institution.trim().slice(0, 80) : ''
    const location = typeof req.body?.location === 'string' ? req.body.location.trim().slice(0, 60) : ''

    const now = new Date().toISOString()
    database.prepare(`INSERT INTO user_profile (user_id, title, bio, institution, location, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        title = excluded.title,
        bio = excluded.bio,
        institution = excluded.institution,
        location = excluded.location,
        updated_at = excluded.updated_at`)
      .run(req.accountUser.id, title, bio, institution, location, now)

    res.json({ status: 'updated' })
  })

  // 13. 社群交流群导航
  app.get('/api/community/groups', (_req, res) => {
    const rawGroups = database.prepare('SELECT id, name, category, qq_number AS qqNumber, description, tags FROM community_group ORDER BY sort_order, id').all()
    const groups = rawGroups.map(g => ({
      ...g,
      tags: parseTags(g.tags)
    }))
    res.json({ groups })
  })

  // 14. 地理热点聚合
  app.get('/api/community/hot-topics', (_req, res) => {
    const topics = database.prepare('SELECT id, title, category, summary, stats, tag FROM community_hot_topic ORDER BY sort_order, id').all()
    res.json({ topics })
  })

  // 15. 地理数据与学术资源开放共享
  app.get('/api/community/resources', (_req, res) => {
    const resources = database.prepare('SELECT id, title, category, format, scale, description, source_url AS sourceUrl, license FROM community_resource ORDER BY sort_order, id').all()
    res.json({ resources })
  })

  // 16. 举报与审核处理
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
