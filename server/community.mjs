import { database } from './database.mjs'
import { getHotTopics } from './hot-topics.mjs'

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
  const replyColumns = database.prepare('PRAGMA table_info(community_reply)').all().map(column => column.name)
  if (!replyColumns.includes('updated_at')) {
    database.exec('ALTER TABLE community_reply ADD COLUMN updated_at TEXT;')
  }
  database.exec('UPDATE community_reply SET updated_at = created_at WHERE updated_at IS NULL;')

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

  // 加法升级 community_group 表支持公开授权审核流
  const groupCols = database.prepare("PRAGMA table_info(community_group)").all().map(c => c.name)
  if (!groupCols.includes('status')) {
    database.exec("ALTER TABLE community_group ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';")
  }
  if (!groupCols.includes('submitted_by')) {
    database.exec("ALTER TABLE community_group ADD COLUMN submitted_by TEXT REFERENCES user(id);")
  }
  if (!groupCols.includes('authorization_note')) {
    database.exec("ALTER TABLE community_group ADD COLUMN authorization_note TEXT NOT NULL DEFAULT '';")
  }
  if (!groupCols.includes('created_at')) {
    database.exec("ALTER TABLE community_group ADD COLUMN created_at TEXT NOT NULL DEFAULT '';")
  }

  const topicColumns = database.prepare('PRAGMA table_info(community_hot_topic)').all().map(column => column.name)
  for (const [name, definition] of [
    ['external_id', 'TEXT'], ['source_url', 'TEXT'], ['occurred_at', 'TEXT'],
    ['summary_method', "TEXT NOT NULL DEFAULT 'deterministic-source-extract'"],
    ['fetched_at', 'TEXT'], ['post_id', 'INTEGER REFERENCES community_post(id)']
  ]) {
    if (!topicColumns.includes(name)) database.exec(`ALTER TABLE community_hot_topic ADD COLUMN ${name} ${definition}`)
  }
  database.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS community_hot_topic_external ON community_hot_topic(external_id);
    CREATE TABLE IF NOT EXISTS geo_topic_sync (source TEXT PRIMARY KEY, fetched_at TEXT NOT NULL);
  `)
  const syncColumns = database.prepare('PRAGMA table_info(geo_topic_sync)').all().map(column => column.name)
  for (const [name, definition] of [
    ['attempted_at', 'TEXT'], ['status', "TEXT NOT NULL DEFAULT 'unknown'"],
    ['record_count', 'INTEGER NOT NULL DEFAULT 0']
  ]) {
    if (!syncColumns.includes(name)) database.exec(`ALTER TABLE geo_topic_sync ADD COLUMN ${name} ${definition}`)
  }
  database.exec(`
    CREATE TABLE IF NOT EXISTS community_post_revision (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES community_post(id),
      revision_no INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      linked_experiment TEXT,
      editor_id TEXT NOT NULL REFERENCES user(id),
      created_at TEXT NOT NULL,
      UNIQUE(post_id, revision_no)
    );
    CREATE INDEX IF NOT EXISTS community_post_revision_post ON community_post_revision(post_id, revision_no DESC);
    CREATE TABLE IF NOT EXISTS community_reply_revision (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reply_id INTEGER NOT NULL REFERENCES community_reply(id),
      revision_no INTEGER NOT NULL,
      body TEXT NOT NULL,
      editor_id TEXT NOT NULL REFERENCES user(id),
      created_at TEXT NOT NULL,
      UNIQUE(reply_id, revision_no)
    );
    CREATE INDEX IF NOT EXISTS community_reply_revision_reply ON community_reply_revision(reply_id, revision_no DESC);
    CREATE TABLE IF NOT EXISTS community_hot_topic_revision (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      revision_no INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      summary_method TEXT NOT NULL,
      source_url TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      fetched_at TEXT NOT NULL,
      recorded_at TEXT NOT NULL,
      UNIQUE(topic_id, revision_no)
    );
    CREATE INDEX IF NOT EXISTS community_hot_topic_revision_topic ON community_hot_topic_revision(topic_id, revision_no DESC);
    CREATE TABLE IF NOT EXISTS community_event_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      topic_title TEXT NOT NULL,
      source_url TEXT NOT NULL,
      reporter_id TEXT NOT NULL REFERENCES user(id),
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'resolved', 'dismissed')),
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      resolved_by TEXT REFERENCES user(id),
      resolution_note TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS community_event_feedback_status ON community_event_feedback(status, created_at DESC);
  `)

  // 预置默认分类
  const seedCat = database.prepare('INSERT OR IGNORE INTO community_category (slug, name, description, sort_order) VALUES (?, ?, ?, ?)')
  database.transaction(() => initialCategories.forEach(([slug, name, description], index) => seedCat.run(slug, name, description, index)))()

  // 社群、热点和资源只能在来源、授权和内容核验后收录，迁移时不生成示例数据。
}

const clean = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null
const positiveId = value => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null
const isAdmin = userId => database.prepare("SELECT 1 FROM user_role WHERE user_id = ? AND role = 'admin'").get(userId) !== undefined
const nextEditTime = previous => new Date(Math.max(Date.now(), Date.parse(previous) + 1)).toISOString()
const findPublishedReply = id => id && database.prepare(`SELECT r.* FROM community_reply r
  JOIN community_post p ON p.id = r.post_id
  WHERE r.id = ? AND r.status = 'published' AND p.status = 'published'`).get(id)
const clearAcceptedReply = id => database.prepare('UPDATE community_post SET accepted_reply_id = NULL WHERE accepted_reply_id = ?').run(id)
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

export function setupCommunityRoutes(app, { requireOrigin, requireUser, optionalUser = (_req, _res, next) => next() }) {
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
  app.get('/api/community/posts', optionalUser, (req, res) => {
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
    if (req.query.hasAccepted === '1') {
      clauses.push("p.kind = 'question'")
      clauses.push("EXISTS (SELECT 1 FROM community_reply accepted WHERE accepted.id = p.accepted_reply_id AND accepted.post_id = p.id AND accepted.status = 'published')")
    }

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
      p.created_at AS createdAt, p.tags, p.linked_experiment AS linkedExperiment, p.evidence_card AS evidenceId,
      CASE WHEN EXISTS (SELECT 1 FROM community_reply r WHERE r.id = p.accepted_reply_id AND r.post_id = p.id AND r.status = 'published')
        THEN p.accepted_reply_id END AS acceptedReplyId,
      c.name AS category, c.id AS categoryId, u.name AS author, p.author_id AS authorId,
      (SELECT substr(r.body, 1, 140) FROM community_reply r WHERE r.id = p.accepted_reply_id AND r.post_id = p.id AND r.status = 'published') AS acceptedAnswerExcerpt,
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
        liked: Boolean(p.liked)
      }))
      res.json({ posts, page })
    } catch {
      res.status(400).json({ error: '搜索词无法检索，请换一个关键词' })
    }
  })

  // 4. 帖子详情（含最佳答案、楼中楼回复与点赞收藏统计）
  app.get('/api/community/posts/:id', optionalUser, (req, res) => {
    const id = positiveId(req.params.id)
    if (!id) return res.status(404).json({ error: '讨论不存在' })
    const currentUserId = req.accountUser?.id || null

    const post = database.prepare(`SELECT p.id, p.author_id AS authorId, p.category_id AS categoryId, p.kind, p.title, p.body,
      p.tags, p.linked_experiment AS linkedExperiment, p.evidence_card AS evidenceId,
      CASE WHEN EXISTS (SELECT 1 FROM community_reply r WHERE r.id = p.accepted_reply_id AND r.post_id = p.id AND r.status = 'published')
        THEN p.accepted_reply_id END AS acceptedReplyId,
      p.created_at AS createdAt, p.updated_at AS updatedAt, c.name AS category, u.name AS author,
      (SELECT COUNT(*) FROM community_post_like l WHERE l.post_id = p.id) AS likeCount,
      (SELECT COUNT(*) FROM community_post_bookmark b WHERE b.post_id = p.id) AS bookmarkCount
      ${currentUserId ? `, (SELECT 1 FROM community_post_like l WHERE l.post_id = p.id AND l.user_id = ?) AS liked,
        (SELECT 1 FROM community_post_bookmark b WHERE b.post_id = p.id AND b.user_id = ?) AS bookmarked` : ''}
      FROM community_post p JOIN community_category c ON c.id = p.category_id JOIN user u ON u.id = p.author_id
      WHERE p.id = ? AND p.status = 'published'`).get(...(currentUserId ? [currentUserId, currentUserId] : []), id)

    if (!post) return res.status(404).json({ error: '讨论不存在' })

    const replies = database.prepare(`SELECT r.id, r.parent_id AS parentId, r.body, r.created_at AS createdAt, r.updated_at AS updatedAt,
      r.author_id AS authorId, u.name AS author FROM community_reply r JOIN user u ON u.id = r.author_id
      WHERE r.post_id = ? AND r.status = 'published' ORDER BY r.created_at, r.id LIMIT 500`).all(id)

    const formattedPost = {
      ...post,
      tags: parseTags(post.tags),
      liked: Boolean(post.liked),
      bookmarked: Boolean(post.bookmarked)
    }

    const formattedReplies = replies.map(r => ({
      ...r,
      isAccepted: r.id === post.acceptedReplyId
    }))

    res.json({ post: formattedPost, replies: formattedReplies })
  })

  app.get('/api/community/posts/:id/revisions', (req, res) => {
    const id = positiveId(req.params.id)
    if (!id || !database.prepare("SELECT 1 FROM community_post WHERE id = ? AND status = 'published'").get(id)) {
      return res.status(404).json({ error: '讨论不存在' })
    }
    const revisions = database.prepare(`SELECT r.revision_no AS revisionNo, r.title, r.body, r.tags,
      r.linked_experiment AS linkedExperiment, r.created_at AS editedAt, u.name AS editor
      FROM community_post_revision r JOIN user u ON u.id = r.editor_id
      WHERE r.post_id = ? ORDER BY r.revision_no DESC LIMIT 50`).all(id)
    res.json({ revisions: revisions.map(revision => ({ ...revision, tags: parseTags(revision.tags) })) })
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
    if (req.body?.expectedUpdatedAt !== undefined && req.body.expectedUpdatedAt !== post.updated_at) {
      return res.status(409).json({ error: '讨论已被修改，请重新载入后核对再保存' })
    }

    const title = req.body?.title === undefined ? post.title : clean(req.body.title, 120)
    const body = req.body?.body === undefined ? post.body : clean(req.body.body, 10000)
    const tags = req.body?.tags === undefined ? post.tags : JSON.stringify(parseTags(req.body.tags))
    const linkedExperiment = req.body?.linkedExperiment === undefined ? post.linked_experiment : (typeof req.body.linkedExperiment === 'string' ? req.body.linkedExperiment.trim().slice(0, 60) : null)

    if (!title || !body) return res.status(400).json({ error: '标题与正文不能为空' })

    const changed = title !== post.title || body !== post.body || tags !== post.tags || linkedExperiment !== post.linked_experiment
    if (changed) {
      const revisionNo = database.prepare('SELECT COALESCE(MAX(revision_no), 0) + 1 AS next FROM community_post_revision WHERE post_id = ?')
        .get(id).next
      const now = nextEditTime(post.updated_at)
      database.transaction(() => {
        database.prepare(`INSERT INTO community_post_revision
          (post_id, revision_no, title, body, tags, linked_experiment, editor_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .run(id, revisionNo, post.title, post.body, post.tags, post.linked_experiment, req.accountUser.id, now)
        database.prepare('UPDATE community_post SET title = ?, body = ?, tags = ?, linked_experiment = ?, updated_at = ? WHERE id = ?')
          .run(title, body, tags, linkedExperiment, now, id)
      })()
    }

    announce('post_edit', id)
    res.json({ status: 'updated', revisionRecorded: changed })
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

    const now = new Date().toISOString()
    const result = database.prepare('INSERT INTO community_reply (post_id, parent_id, author_id, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(postId, parentId, req.accountUser.id, body, now, now)
    announce('reply', postId)
    res.status(201).json({ id: result.lastInsertRowid })
  })

  app.get('/api/community/replies/:id/revisions', (req, res) => {
    const reply = findPublishedReply(positiveId(req.params.id))
    if (!reply) return res.status(404).json({ error: '回复不存在' })
    const revisions = database.prepare(`SELECT r.revision_no AS revisionNo, r.body,
      r.created_at AS editedAt, u.name AS editor
      FROM community_reply_revision r JOIN user u ON u.id = r.editor_id
      WHERE r.reply_id = ? ORDER BY r.revision_no DESC LIMIT 50`).all(reply.id)
    res.json({ revisions })
  })

  app.patch('/api/community/replies/:id', requireOrigin, requireUser, (req, res) => {
    const reply = findPublishedReply(positiveId(req.params.id))
    if (!reply) return res.status(404).json({ error: '回复不存在' })
    if (reply.author_id !== req.accountUser.id && !isAdmin(req.accountUser.id)) {
      return res.status(403).json({ error: '没有权限编辑此回复' })
    }
    const body = clean(req.body?.body, 3000)
    if (!body) return res.status(400).json({ error: '回复内容须为 1 至 3000 字' })
    if (req.body?.expectedUpdatedAt !== undefined && req.body.expectedUpdatedAt !== reply.updated_at) {
      return res.status(409).json({ error: '回复已被修改，请重新载入后核对再保存' })
    }
    const changed = body !== reply.body
    if (changed) {
      const now = nextEditTime(reply.updated_at)
      database.transaction(() => {
        const revisionNo = database.prepare('SELECT COALESCE(MAX(revision_no), 0) + 1 AS next FROM community_reply_revision WHERE reply_id = ?')
          .get(reply.id).next
        database.prepare(`INSERT INTO community_reply_revision (reply_id, revision_no, body, editor_id, created_at)
          VALUES (?, ?, ?, ?, ?)`).run(reply.id, revisionNo, reply.body, req.accountUser.id, now)
        database.prepare('UPDATE community_reply SET body = ?, updated_at = ? WHERE id = ?').run(body, now, reply.id)
        clearAcceptedReply(reply.id)
      })()
      announce('reply_edit', reply.post_id)
    }
    res.json({ status: 'updated', revisionRecorded: changed })
  })

  if (typeof app.delete === 'function') {
    app.delete('/api/community/replies/:id', requireOrigin, requireUser, (req, res) => {
      const reply = findPublishedReply(positiveId(req.params.id))
      if (!reply) return res.status(404).json({ error: '回复不存在' })
      if (reply.author_id !== req.accountUser.id && !isAdmin(req.accountUser.id)) {
        return res.status(403).json({ error: '没有权限删除此回复' })
      }
      database.transaction(() => {
        database.prepare("UPDATE community_reply SET status = 'hidden', updated_at = ? WHERE id = ?")
          .run(nextEditTime(reply.updated_at), reply.id)
        clearAcceptedReply(reply.id)
      })()
      announce('reply_delete', reply.post_id)
      res.json({ status: 'deleted' })
    })
  }

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
      JOIN community_post p ON p.accepted_reply_id = r.id AND p.id = r.post_id
      WHERE r.author_id = ? AND r.status = 'published' AND p.status = 'published'`).get(userId).n
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

  // 13. 社群交流群导航 (只公开展示已审核通过并授权的社群)
  app.get('/api/community/groups', (_req, res) => {
    const rawGroups = database.prepare("SELECT id, name, category, qq_number AS qqNumber, description, tags FROM community_group WHERE status = 'approved' ORDER BY sort_order, id").all()
    const groups = rawGroups.map(g => ({
      ...g,
      tags: parseTags(g.tags)
    }))
    res.json({ groups })
  })

  // 13.1 用户申请提交社群 (需登录，待管理员审核)
  app.post('/api/community/groups/submit', requireOrigin, requireUser, (req, res) => {
    const name = clean(req.body?.name, 50)
    const category = clean(req.body?.category, 30)
    const qqNumber = typeof req.body?.qqNumber === 'string' ? req.body.qqNumber.trim() : ''
    const description = clean(req.body?.description, 200)
    const authorizationNote = clean(req.body?.authorizationNote, 200)

    if (!name || !category || !description || !authorizationNote) {
      return res.status(400).json({ error: '请完整填写社群名称、分类、简介和公开展示授权说明' })
    }
    if (!/^\d{5,12}$/.test(qqNumber)) {
      return res.status(400).json({ error: 'QQ 群号须为 5–12 位有效数字' })
    }

    const now = new Date().toISOString()
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const recent = database.prepare('SELECT COUNT(*) AS n FROM community_group WHERE submitted_by = ? AND created_at > ?')
      .get(req.accountUser.id, hourAgo)?.n || 0
    if (recent >= 3) {
      return res.status(429).json({ error: '社群申请过于频繁，请稍后再试' })
    }
    const duplicate = database.prepare("SELECT id FROM community_group WHERE qq_number = ? AND status IN ('pending', 'approved')").get(qqNumber)
    if (duplicate) return res.status(409).json({ error: '该 QQ 群已有待审核或已收录的申请' })

    const tags = JSON.stringify(parseTags(req.body?.tags))
    const result = database.prepare(`INSERT INTO community_group 
      (name, category, qq_number, description, tags, status, submitted_by, authorization_note, created_at, sort_order)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, 100)`)
      .run(name, category, qqNumber, description, tags, req.accountUser.id, authorizationNote, now)

    res.status(201).json({ id: result.lastInsertRowid, status: 'pending' })
  })

  // 13.2 管理员审核社群列表与操作
  app.get('/api/community/moderation/groups', requireOrigin, requireUser, (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    const groups = database.prepare(`SELECT g.id, g.name, g.category, g.qq_number AS qqNumber,
      g.description, g.tags, g.status, g.authorization_note AS authorizationNote, g.created_at AS createdAt,
      u.name AS submittedByAuthor
      FROM community_group g LEFT JOIN user u ON u.id = g.submitted_by
      ORDER BY CASE g.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, g.id DESC`).all()
    res.json({
      groups: groups.map(g => ({ ...g, tags: parseTags(g.tags) }))
    })
  })

  app.post('/api/community/moderation/groups/:id', requireOrigin, requireUser, (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    const id = positiveId(req.params.id)
    const action = req.body?.action
    if (!id || !['approve', 'reject'].includes(action)) return res.status(400).json({ error: '无效审核操作' })
    const status = action === 'approve' ? 'approved' : 'rejected'
    const result = database.prepare("UPDATE community_group SET status = ? WHERE id = ? AND status = 'pending'").run(status, id)
    if (result.changes === 0) return res.status(409).json({ error: '社群不存在或申请已处理' })
    res.json({ id, status })
  })

  // 14. 地理热点聚合与可核查机器摘要
  app.get('/api/community/hot-topics', async (_req, res, next) => {
    try { res.json(await getHotTopics()) } catch (error) { next(error) }
  })

  app.get('/api/community/hot-topics/:id/summary', (req, res) => {
    const id = positiveId(req.params.id)
    if (!id) return res.status(404).json({ error: '事件不存在' })
    const topic = database.prepare('SELECT * FROM community_hot_topic WHERE id = ? AND external_id IS NOT NULL').get(id)
    if (!topic) return res.status(404).json({ error: '事件不存在' })

    const sourceName = topic.external_id.startsWith('USGS_') ? '美国地质调查局 (USGS) 地震台网' : 'NASA EONET 地球观测事件系统'
    const summaryData = {
      id: topic.id,
      title: topic.title,
      category: topic.category,
      summary: topic.summary,
      sourceBasis: topic.summary_method === 'source-description'
        ? `${sourceName} 原始描述字段`
        : `${sourceName} 来源字段的规则化摘录`,
      sourceUrl: topic.source_url,
      occurredAt: topic.occurred_at,
      verifiedAt: topic.fetched_at,
      summaryMethod: topic.summary_method,
      isMachineGenerated: topic.summary_method !== 'source-description',
      isAiGenerated: false,
      generationMethod: topic.summary_method,
      confidenceLevel: 'source-linked',
      verificationNote: topic.summary_method === 'source-description'
        ? '此内容来自 NASA EONET 的原始描述字段，尚未经本平台人工核验；请以原始记录及其更新为准。'
        : '这是按来源字段生成的规则化机器摘录，尚未经本平台人工核验；不包含未经来源证实的影响或推论。'
    }
    res.json(summaryData)
  })

  app.get('/api/community/hot-topics/:id/revisions', (req, res) => {
    const id = positiveId(req.params.id)
    if (!id || !database.prepare('SELECT 1 FROM community_hot_topic WHERE id = ? AND external_id IS NOT NULL').get(id)) {
      return res.status(404).json({ error: '事件不存在' })
    }
    const revisions = database.prepare(`SELECT revision_no AS revisionNo, title, category, summary,
      summary_method AS summaryMethod, source_url AS sourceUrl, occurred_at AS occurredAt,
      fetched_at AS fetchedAt, recorded_at AS recordedAt
      FROM community_hot_topic_revision WHERE topic_id = ? ORDER BY revision_no DESC LIMIT 50`).all(id)
    res.json({ revisions })
  })

  app.post('/api/community/hot-topics/:id/feedback', requireOrigin, requireUser, (req, res) => {
    const id = positiveId(req.params.id)
    const reason = clean(req.body?.reason, 1000)
    if (!id || !reason) return res.status(400).json({ error: '请选择事件并填写纠错说明（最多 1000 字）' })
    const topic = database.prepare('SELECT id, title, source_url FROM community_hot_topic WHERE id = ? AND external_id IS NOT NULL').get(id)
    if (!topic) return res.status(404).json({ error: '事件记录不存在' })
    const since = new Date(Date.now() - 86400000).toISOString()
    const recent = database.prepare('SELECT COUNT(*) AS n FROM community_event_feedback WHERE reporter_id = ? AND created_at > ?')
      .get(req.accountUser.id, since).n
    if (recent >= 10) return res.status(429).json({ error: '今天提交的事件纠错已达上限' })
    const duplicate = database.prepare("SELECT 1 FROM community_event_feedback WHERE reporter_id = ? AND topic_id = ? AND status = 'open'")
      .get(req.accountUser.id, id)
    if (duplicate) return res.status(409).json({ error: '你已提交该事件的纠错，正在等待核对' })
    const result = database.prepare(`INSERT INTO community_event_feedback
      (topic_id, topic_title, source_url, reporter_id, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(topic.id, topic.title, topic.source_url, req.accountUser.id, reason, new Date().toISOString())
    res.status(201).json({ id: result.lastInsertRowid, status: 'open' })
  })

  app.post('/api/community/hot-topics/:id/discuss', requireOrigin, requireUser, (req, res) => {
    const id = positiveId(req.params.id)
    if (!id) return res.status(404).json({ error: '事件不存在' })
    const topic = database.prepare('SELECT * FROM community_hot_topic WHERE id = ? AND external_id IS NOT NULL').get(id)
    if (!topic) return res.status(404).json({ error: '事件不存在' })
    if (topic.post_id) {
      const post = database.prepare("SELECT id FROM community_post WHERE id = ? AND status = 'published'").get(topic.post_id)
      if (post) return res.json({ id: post.id, created: false })
      return res.status(410).json({ error: '该事件的讨论已被社区管理员隐藏' })
    }
    const recent = database.prepare('SELECT COUNT(*) AS n FROM community_post WHERE author_id = ? AND created_at > ?')
      .get(req.accountUser.id, new Date(Date.now() - 3600000).toISOString()).n
    if (recent >= 5) return res.status(429).json({ error: '发帖过于频繁，请稍后再试' })
    const category = database.prepare("SELECT id FROM community_category WHERE slug = 'physical' AND active = 1").get()
      || database.prepare('SELECT id FROM community_category WHERE active = 1 ORDER BY sort_order LIMIT 1').get()
    if (!category) return res.status(503).json({ error: '目前没有可用的社区分区' })
    const sourceName = topic.external_id.startsWith('USGS_') ? 'USGS' : 'NASA EONET'
    const body = `资料来源：${sourceName}\n原始记录：${topic.source_url}\n最近记录：${topic.occurred_at}\n\n来源摘要：${topic.summary}\n\n这是一条供社区讨论的事件线索。请核对来源中的更新，再分享你的观察、解释或疑问。`
    const now = new Date().toISOString()
    const result = database.transaction(() => {
      const existing = database.prepare('SELECT post_id FROM community_hot_topic WHERE id = ?').get(id)
      if (existing.post_id) return { id: existing.post_id, created: false }
      const post = database.prepare(`INSERT INTO community_post
        (author_id, category_id, kind, title, body, tags, created_at, updated_at)
        VALUES (?, ?, 'discussion', ?, ?, ?, ?, ?)`).run(
        req.accountUser.id, category.id, topic.title, body, JSON.stringify([topic.tag, '地理事件']), now, now)
      database.prepare('UPDATE community_hot_topic SET post_id = ? WHERE id = ?').run(post.lastInsertRowid, id)
      return { id: post.lastInsertRowid, created: true }
    })()
    if (result.created) announce('post', result.id)
    res.status(result.created ? 201 : 200).json(result)
  })

  // 15. 地理数据与学术资源开放共享
  app.get('/api/community/resources', (_req, res) => {
    const resources = database.prepare('SELECT id, title, category, format, scale, description, source_url AS sourceUrl, license FROM community_resource ORDER BY sort_order, id').all()
    res.json({ resources })
  })

  // 16. 举报与审核处理
  app.post('/api/community/reports', requireOrigin, requireUser, (req, res) => {
    const postId = req.body?.postId != null ? positiveId(req.body.postId) : null
    const replyId = req.body?.replyId != null ? positiveId(req.body.replyId) : null
    const reason = clean(req.body?.reason, 500)
    if (!reason || Boolean(postId) === Boolean(replyId) ||
      (req.body?.postId != null && !postId) || (req.body?.replyId != null && !replyId)) {
      return res.status(400).json({ error: '请选择一项内容并填写举报原因' })
    }
    const exists = postId
      ? database.prepare("SELECT 1 FROM community_post WHERE id = ? AND status = 'published'").get(postId)
      : findPublishedReply(replyId)
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
    const reports = database.prepare(`SELECT report.*, COALESCE(report.post_id, r.post_id) AS discussionId,
      CASE WHEN p.status = 'published' OR (r.status = 'published' AND parent.status = 'published')
        THEN 1 ELSE 0 END AS contentAvailable
      FROM community_report report LEFT JOIN community_post p ON p.id = report.post_id
      LEFT JOIN community_reply r ON r.id = report.reply_id LEFT JOIN community_post parent ON parent.id = r.post_id
      WHERE report.status = 'open' ORDER BY report.created_at LIMIT 100`).all()
    res.json({ reports: reports.map(report => ({ ...report, contentAvailable: Boolean(report.contentAvailable) })) })
  })

  app.get('/api/community/moderation/event-feedback', requireUser, (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    const feedback = database.prepare(`SELECT f.id, f.topic_id AS topicId, f.topic_title AS topicTitle,
      f.source_url AS sourceUrl, f.reason, f.status, f.created_at AS createdAt,
      u.name AS reporter
      FROM community_event_feedback f JOIN user u ON u.id = f.reporter_id
      WHERE f.status = 'open' ORDER BY f.created_at LIMIT 100`).all()
    res.json({ feedback })
  })

  app.post('/api/community/moderation/event-feedback/:id', requireOrigin, requireUser, (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    const id = positiveId(req.params.id)
    const action = req.body?.action
    const note = typeof req.body?.resolutionNote === 'string' ? req.body.resolutionNote.trim().slice(0, 1000) : ''
    if (!id || !['resolve', 'dismiss'].includes(action)) return res.status(400).json({ error: '无效的处理操作' })
    const result = database.prepare(`UPDATE community_event_feedback
      SET status = ?, resolved_at = ?, resolved_by = ?, resolution_note = ?
      WHERE id = ? AND status = 'open'`)
      .run(action === 'resolve' ? 'resolved' : 'dismissed', new Date().toISOString(), req.accountUser.id, note, id)
    if (!result.changes) return res.status(404).json({ error: '纠错不存在或已处理' })
    res.json({ status: action === 'resolve' ? 'resolved' : 'dismissed' })
  })

  app.post('/api/community/moderation/reports/:id', requireOrigin, requireUser, (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    const id = positiveId(req.params.id)
    if (!id || !['hide', 'dismiss'].includes(req.body?.action)) return res.status(400).json({ error: '处理操作无效' })
    const report = database.prepare("SELECT * FROM community_report WHERE id = ? AND status = 'open'").get(id)
    if (!report) return res.status(404).json({ error: '举报不存在或已处理' })
    const now = new Date().toISOString()
    const reply = report.reply_id && database.prepare('SELECT post_id FROM community_reply WHERE id = ?').get(report.reply_id)
    database.transaction(() => {
      if (req.body.action === 'hide') {
        if (report.post_id) database.prepare("UPDATE community_post SET status = 'hidden', updated_at = ? WHERE id = ?").run(now, report.post_id)
        else {
          database.prepare("UPDATE community_reply SET status = 'hidden', updated_at = ? WHERE id = ?").run(now, report.reply_id)
          clearAcceptedReply(report.reply_id)
        }
      }
      database.prepare("UPDATE community_report SET status = 'resolved', resolved_at = ?, resolved_by = ? WHERE id = ?")
        .run(now, req.accountUser.id, id)
    })()
    if (req.body.action === 'hide') announce('content_hidden', report.post_id || reply?.post_id)
    res.json({ status: 'resolved' })
  })
}
