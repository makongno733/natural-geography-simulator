import { database } from './database.mjs'
import { sendSystemMail } from './auth.mjs'
import { siteOrigin } from './config.mjs'
import {
  CURATED_GEO_PAPERS,
  INITIAL_FANXING_PROJECTS,
  normalizeAndValidateDoi,
  searchCrossrefLiterature
} from '../src/fanxing/catalog.js'

const clean = (value, max) =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null

const positiveId = value =>
  /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null

const isAdmin = userId =>
  Boolean(userId && database.prepare("SELECT 1 FROM user_role WHERE user_id = ? AND role = 'admin'").get(userId))

function safeParseJson(raw, fallback = []) {
  if (!raw) return fallback
  if (Array.isArray(raw) || typeof raw === 'object') return raw
  try {
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function sanitizeTasks(rawTasks) {
  const list = Array.isArray(rawTasks) ? rawTasks : []
  return list.map(t => ({
    id: t.id || 'task-1',
    title: t.title || '',
    role: t.role || '课题协作者',
    difficulty: t.difficulty || '入门 · 开放参与',
    plannedTarget: t.plannedTarget || (t.targetCount ? `规划任务量：${t.targetCount} 份记录` : '规划任务：按课题指南提交观察或文献记录')
  }))
}

export function migrateFanxing() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS fanxing_project (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      field TEXT NOT NULL,
      phase TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'recruiting' CHECK(status IN ('recruiting', 'active', 'completed', 'hidden')),
      question TEXT NOT NULL,
      method TEXT NOT NULL,
      role TEXT NOT NULL,
      commitment TEXT NOT NULL,
      task TEXT NOT NULL,
      linked_lab_url TEXT NOT NULL DEFAULT '',
      linked_lab_title TEXT NOT NULL DEFAULT '',
      tasks_json TEXT NOT NULL DEFAULT '[]',
      papers_json TEXT NOT NULL DEFAULT '[]',
      datasets_json TEXT NOT NULL DEFAULT '[]',
      collab_qq_group TEXT NOT NULL DEFAULT '',
      collab_contact TEXT NOT NULL DEFAULT '',
      onboarding_guide TEXT NOT NULL DEFAULT '',
      source_post_id INTEGER DEFAULT NULL,
      creator_id TEXT DEFAULT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fanxing_application (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL REFERENCES fanxing_project(id),
      user_id TEXT NOT NULL REFERENCES user(id),
      applicant_name TEXT NOT NULL,
      applicant_contact TEXT NOT NULL DEFAULT '',
      motivation TEXT NOT NULL,
      experience TEXT NOT NULL DEFAULT '',
      preferred_task TEXT NOT NULL DEFAULT '',
      weekly_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      review_note TEXT NOT NULL DEFAULT '',
      reviewed_by TEXT DEFAULT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(project_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS fanxing_app_project ON fanxing_application(project_id, status);
    CREATE INDEX IF NOT EXISTS fanxing_app_user ON fanxing_application(user_id, updated_at DESC);
  `)

  const appCols = database.prepare('PRAGMA table_info(fanxing_application)').all().map(c => c.name)
  if (!appCols.includes('notified_at')) {
    database.exec('ALTER TABLE fanxing_application ADD COLUMN notified_at TEXT DEFAULT NULL;')
  }
  if (!appCols.includes('notification_status')) {
    database.exec("ALTER TABLE fanxing_application ADD COLUMN notification_status TEXT NOT NULL DEFAULT 'in_app';")
  }

  const now = new Date().toISOString()
  const insertProject = database.prepare(`
    INSERT OR IGNORE INTO fanxing_project (
      id, title, field, phase, status, question, method, role, commitment, task,
      linked_lab_url, linked_lab_title, tasks_json, papers_json, datasets_json,
      collab_qq_group, collab_contact, onboarding_guide, created_at, updated_at
    ) VALUES (
      @id, @title, @field, @phase, @status, @question, @method, @role, @commitment, @task,
      @linkedLabUrl, @linkedLabTitle, @tasksJson, @papersJson, @datasetsJson,
      @collabQqGroup, @collabContact, @onboardingGuide, @now, @now
    )
  `)
  const syncSeededMeta = database.prepare(`
    UPDATE fanxing_project
    SET tasks_json = @tasksJson, papers_json = @papersJson
    WHERE id = @id AND creator_id IS NULL
  `)

  database.transaction(() => {
    for (const proj of INITIAL_FANXING_PROJECTS) {
      const tasksJson = JSON.stringify(sanitizeTasks(proj.tasks || []))
      const papersJson = JSON.stringify(proj.papers || [])
      insertProject.run({
        id: proj.id,
        title: proj.title,
        field: proj.field,
        phase: proj.phase,
        status: proj.status || 'recruiting',
        question: proj.question,
        method: proj.method,
        role: proj.role,
        commitment: proj.commitment,
        task: proj.task,
        linkedLabUrl: proj.linkedLabUrl || '',
        linkedLabTitle: proj.linkedLabTitle || '',
        tasksJson,
        papersJson,
        datasetsJson: JSON.stringify(proj.datasets || []),
        collabQqGroup: process.env.FANXING_DEFAULT_QQ_GROUP || '请查看管理员审核留言或站内社区社群导航（/#/groups）',
        collabContact: '课题协调组（审核通过后可直接在课题关联讨论区提交第 1 份样点/文献记录，或按审核留言入群对接）',
        onboardingGuide:
          `1. 阅读本课题下方附带的真实 DOI 参考文献与研究方法；\n` +
          `2. 点击「打开课题配套实验室」完成首轮观察或文献摘录，生成可复现证据卡；\n` +
          `3. 点击「围绕本课题发布讨论/提交阶段记录」，系统会自动挂载本课题标识。`,
        now
      })
      // 同步清理旧库中预设课题可能残留的虚构 completedCount
      syncSeededMeta.run({ id: proj.id, tasksJson, papersJson })
    }
  })()
}

function formatProjectRow(row, { currentUserId = null, callerIsAdmin = false } = {}) {
  if (!row) return null
  const applicantCount = database
    .prepare('SELECT COUNT(*) AS n FROM fanxing_application WHERE project_id = ?')
    .get(row.id)?.n || 0
  const approvedCount = database
    .prepare("SELECT COUNT(*) AS n FROM fanxing_application WHERE project_id = ? AND status = 'approved'")
    .get(row.id)?.n || 0

  let linkedDiscussionsCount = 0
  try {
    linkedDiscussionsCount = database
      .prepare("SELECT COUNT(*) AS n FROM community_post WHERE (linked_project_id = ? OR id = ?) AND status = 'published'")
      .get(row.id, row.source_post_id || -1)?.n || 0
  } catch {}

  let myApplication = null
  if (currentUserId) {
    const appRow = database
      .prepare(`
        SELECT id, project_id AS projectId, user_id AS userId, applicant_name AS applicantName,
               applicant_contact AS applicantContact, motivation, experience,
               preferred_task AS preferredTask, weekly_time AS weeklyTime,
               status, review_note AS reviewNote, notified_at AS notifiedAt,
               notification_status AS notificationStatus, created_at AS createdAt, updated_at AS updatedAt
        FROM fanxing_application
        WHERE project_id = ? AND user_id = ?
      `)
      .get(row.id, currentUserId)
    if (appRow) {
      const canSeeCollab = appRow.status === 'approved' || callerIsAdmin || row.creator_id === currentUserId
      myApplication = {
        ...appRow,
        notifiedAt: appRow.notifiedAt || null,
        notificationStatus: appRow.notificationStatus || 'in_app',
        collabChannel: canSeeCollab
          ? {
              qqGroup: row.collab_qq_group || '',
              contact: row.collab_contact || '',
              onboardingGuide: row.onboarding_guide || '',
              reviewNote: appRow.reviewNote || ''
            }
          : null
      }
    }
  }

  return {
    id: row.id,
    title: row.title,
    field: row.field,
    phase: row.phase,
    status: row.status,
    question: row.question,
    method: row.method,
    role: row.role,
    commitment: row.commitment,
    task: row.task,
    linkedLabUrl: row.linked_lab_url || '',
    linkedLabTitle: row.linked_lab_title || '',
    tasks: sanitizeTasks(safeParseJson(row.tasks_json, [])),
    papers: safeParseJson(row.papers_json, []),
    datasets: safeParseJson(row.datasets_json, []),
    sourcePostId: row.source_post_id || null,
    creatorId: row.creator_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    applicantCount,
    approvedCount,
    linkedDiscussionsCount,
    myApplication
  }
}

export function setupFanxingRoutes(
  app,
  { requireOrigin, requireUser, optionalUser = (_req, _res, next) => next(), mailSender = sendSystemMail }
) {
  // 1. 获取所有繁星课题列表
  app.get('/api/fanxing/projects', optionalUser, (req, res) => {
    const currentUserId = req.accountUser?.id || null
    const callerIsAdmin = isAdmin(currentUserId)
    const rows = database
      .prepare("SELECT * FROM fanxing_project WHERE status != 'hidden' ORDER BY created_at ASC")
      .all()
    const projects = rows.map(row => formatProjectRow(row, { currentUserId, callerIsAdmin }))
    res.json({ projects })
  })

  // 2. 获取单个课题详情
  app.get('/api/fanxing/projects/:id', optionalUser, (req, res) => {
    const id = clean(req.params.id, 80)
    if (!id) return res.status(404).json({ error: '课题不存在' })
    const row = database.prepare("SELECT * FROM fanxing_project WHERE id = ? AND status != 'hidden'").get(id)
    if (!row) return res.status(404).json({ error: '课题不存在' })

    const currentUserId = req.accountUser?.id || null
    const callerIsAdmin = isAdmin(currentUserId)
    const project = formatProjectRow(row, { currentUserId, callerIsAdmin })

    const collaborators = database
      .prepare(`
        SELECT a.user_id AS userId, a.applicant_name AS name, a.preferred_task AS preferredTask,
               a.updated_at AS joinedAt
        FROM fanxing_application a
        WHERE a.project_id = ? AND a.status = 'approved'
        ORDER BY a.updated_at DESC LIMIT 30
      `)
      .all(id)

    let linkedPosts = []
    try {
      linkedPosts = database
        .prepare(`
          SELECT p.id, p.kind, p.title, substr(p.body, 1, 140) AS excerpt,
                 p.created_at AS createdAt, p.evidence_card AS evidenceId,
                 p.compare_url AS compareUrl, p.paper_doi AS paperDoi, p.paper_title AS paperTitle,
                 u.name AS author, p.author_id AS authorId,
                 (SELECT COUNT(*) FROM community_reply r WHERE r.post_id = p.id AND r.status = 'published') AS replyCount
          FROM community_post p
          JOIN user u ON u.id = p.author_id
          WHERE p.status = 'published' AND (p.linked_project_id = ? OR p.id = ?)
          ORDER BY p.created_at DESC LIMIT 20
        `)
        .all(id, row.source_post_id || -1)
    } catch {}

    res.json({
      project,
      collaborators,
      linkedPosts
    })
  })

  // 3. 提交或更新科研课题参与申请（真实写入 SQLite，防重复发信，并向管理员发送通知邮件）
  app.post('/api/fanxing/projects/:id/apply', requireOrigin, requireUser, async (req, res) => {
    const projectId = clean(req.params.id, 80)
    if (!projectId) return res.status(404).json({ error: '课题不存在' })
    const projectRow = database
      .prepare("SELECT * FROM fanxing_project WHERE id = ? AND status != 'hidden'")
      .get(projectId)
    if (!projectRow) return res.status(404).json({ error: '课题不存在' })

    const motivation = clean(req.body?.motivation, 600)
    const experience = clean(req.body?.experience, 600) || '零基础 / 愿意按起步指南学习'
    const preferredTask = clean(req.body?.preferredTask, 160) || projectRow.task.slice(0, 120)
    const weeklyTime = clean(req.body?.weeklyTime, 60)
    const applicantContact = typeof req.body?.applicantContact === 'string'
      ? req.body.applicantContact.trim().slice(0, 120)
      : ''

    if (!motivation || !weeklyTime) {
      return res.status(400).json({ error: '请填写参与动机并选择每周可投入时间' })
    }

    const existing = database
      .prepare('SELECT * FROM fanxing_application WHERE project_id = ? AND user_id = ?')
      .get(projectId, req.accountUser.id)

    const now = new Date().toISOString()
    if (existing) {
      if (existing.status === 'approved') {
        return res.status(409).json({ error: '你的申请已审核通过，无需重复提交' })
      }
      // 60 秒内相同内容防抖：不重复发送管理员邮件
      const isRecentDuplicate =
        existing.status === 'pending' &&
        existing.motivation === motivation &&
        existing.experience === experience &&
        existing.preferred_task === preferredTask &&
        existing.weekly_time === weeklyTime &&
        (existing.applicant_contact || '') === applicantContact &&
        (existing.applicant_name || '') === (req.accountUser.name || '地理探索者') &&
        Date.now() - Date.parse(existing.updated_at || '') < 60_000

      if (isRecentDuplicate) {
        const updatedProject = formatProjectRow(projectRow, {
          currentUserId: req.accountUser.id,
          callerIsAdmin: isAdmin(req.accountUser.id)
        })
        return res.status(200).json({
          status: 'pending',
          deduplicated: true,
          adminNotified: false,
          application: updatedProject.myApplication
        })
      }

      database
        .prepare(`
          UPDATE fanxing_application
          SET applicant_name = ?, applicant_contact = ?, motivation = ?, experience = ?,
              preferred_task = ?, weekly_time = ?, status = 'pending', updated_at = ?
          WHERE id = ?
        `)
        .run(
          req.accountUser.name || '地理探索者',
          applicantContact,
          motivation,
          experience,
          preferredTask,
          weeklyTime,
          now,
          existing.id
        )
    } else {
      database
        .prepare(`
          INSERT INTO fanxing_application (
            project_id, user_id, applicant_name, applicant_contact,
            motivation, experience, preferred_task, weekly_time,
            status, review_note, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', '', ?, ?)
        `)
        .run(
          projectId,
          req.accountUser.id,
          req.accountUser.name || '地理探索者',
          applicantContact,
          motivation,
          experience,
          preferredTask,
          weeklyTime,
          now,
          now
        )
    }

    // 异步/安全通知管理员有新科研申请（邮件失败不影响申请保存）
    let adminNotified = false
    try {
      const adminRows = database
        .prepare("SELECT u.email FROM user_role r JOIN user u ON u.id = r.user_id WHERE r.role = 'admin'")
        .all()
      const adminEmails = [...new Set(adminRows.map(r => r.email).filter(Boolean))]
      if (process.env.ADMIN_NOTIFY_EMAIL) adminEmails.push(process.env.ADMIN_NOTIFY_EMAIL)
      for (const adminEmail of adminEmails) {
        const sent = await mailSender({
          to: adminEmail,
          subject: `【繁星计划新科研申请】${req.accountUser.name || '新申请人'} 申请参与「${projectRow.title}」`,
          text:
            `收到新的繁星计划科研课题参与申请：\n\n` +
            `申请课题：${projectRow.title} (${projectId})\n` +
            `申请人：${req.accountUser.name || '地理探索者'} (${req.accountUser.email || ''})\n` +
            `预留联系：${applicantContact || '未填写'}\n` +
            `认领微任务：${preferredTask}\n` +
            `每周可投入：${weeklyTime}\n` +
            `参与动机：${motivation}\n` +
            `相关经验：${experience}\n\n` +
            `请前往管理后台审核并开放协作群号：${siteOrigin}/#/community/manage`
        })
        if (sent) adminNotified = true
      }
    } catch {}

    const updatedProject = formatProjectRow(projectRow, {
      currentUserId: req.accountUser.id,
      callerIsAdmin: isAdmin(req.accountUser.id)
    })

    res.status(201).json({
      status: 'pending',
      adminNotified,
      application: updatedProject.myApplication
    })
  })

  // 4. 查询当前登录用户的所有课题申请与审核结果
  app.get('/api/fanxing/my-applications', requireUser, (req, res) => {
    const rows = database
      .prepare(`
        SELECT a.id, a.project_id AS projectId, a.user_id AS userId, a.applicant_name AS applicantName,
               a.applicant_contact AS applicantContact, a.motivation, a.experience,
               a.preferred_task AS preferredTask, a.weekly_time AS weeklyTime,
               a.status, a.review_note AS reviewNote, a.notified_at AS notifiedAt,
               a.notification_status AS notificationStatus, a.created_at AS createdAt, a.updated_at AS updatedAt,
               p.title AS projectTitle, p.field AS projectField, p.phase AS projectPhase,
               p.collab_qq_group AS collabQqGroup, p.collab_contact AS collabContact,
               p.onboarding_guide AS onboardingGuide
        FROM fanxing_application a
        JOIN fanxing_project p ON p.id = a.project_id
        WHERE a.user_id = ?
        ORDER BY a.updated_at DESC
      `)
      .all(req.accountUser.id)

    const applications = rows.map(r => ({
      id: r.id,
      userId: r.userId,
      projectId: r.projectId,
      projectTitle: r.projectTitle,
      projectField: r.projectField,
      projectPhase: r.projectPhase,
      applicantName: r.applicantName,
      applicantContact: r.applicantContact,
      motivation: r.motivation,
      experience: r.experience,
      preferredTask: r.preferredTask,
      weeklyTime: r.weeklyTime,
      status: r.status,
      reviewNote: r.reviewNote,
      notifiedAt: r.notifiedAt || null,
      notificationStatus: r.notificationStatus || 'in_app',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      collabChannel:
        r.status === 'approved'
          ? {
              qqGroup: r.collabQqGroup,
              contact: r.collabContact,
              onboardingGuide: r.onboardingGuide,
              reviewNote: r.reviewNote
            }
          : null
    }))

    res.json({ applications })
  })

  // 5. 发起新课题 / 引用公开社区讨论发起课题
  app.post('/api/fanxing/projects', requireOrigin, requireUser, (req, res) => {
    const title = clean(req.body?.title, 100)
    const field = clean(req.body?.field, 40) || '地理综合探究'
    const phase = clean(req.body?.phase, 30) || '研究设计'
    const question = clean(req.body?.question, 300)
    const method = clean(req.body?.method, 1000)
    const role = clean(req.body?.role, 60) || '数据与文献协作者'
    const commitment = clean(req.body?.commitment, 60) || '每周约 1–2 小时 · 欢迎新手'
    const task = clean(req.body?.task, 400)
    const collabQqGroup = typeof req.body?.collabQqGroup === 'string' ? req.body.collabQqGroup.trim().slice(0, 80) : ''
    const collabContact = typeof req.body?.collabContact === 'string' ? req.body.collabContact.trim().slice(0, 160) : ''

    if (!title || !question || !method || !task) {
      return res.status(400).json({ error: '请完整填写课题名称、研究问题、研究方法与首项协作任务' })
    }

    // 校验引用的来源帖子是否存在且为公开状态，且禁止越权篡改他人帖子的关联字段
    let sourcePost = null
    let sourcePostId = null
    if (req.body?.sourcePostId !== undefined && req.body?.sourcePostId !== null && req.body?.sourcePostId !== '') {
      sourcePostId = positiveId(req.body.sourcePostId)
      if (!sourcePostId) {
        return res.status(400).json({ error: '引用的来源讨论 ID 无效' })
      }
      sourcePost = database
        .prepare("SELECT id, author_id, status FROM community_post WHERE id = ? AND status = 'published'")
        .get(sourcePostId)
      if (!sourcePost) {
        return res.status(404).json({ error: '引用的来源讨论不存在或未公开' })
      }
    }

    // 严格校验 DOI 格式，绝不伪造论文作者或发表年份
    const rawDoi = typeof req.body?.paperDoi === 'string' ? req.body.paperDoi.trim() : ''
    let validatedDoi = null
    if (rawDoi) {
      validatedDoi = normalizeAndValidateDoi(rawDoi)
      if (!validatedDoi) {
        return res.status(400).json({ error: 'DOI 格式无效，应以 10.xxxx/ 开头（例如 10.5194/essd-13-3907-2021）' })
      }
    }
    const paperTitle = typeof req.body?.paperTitle === 'string' ? req.body.paperTitle.trim().slice(0, 200) : ''
    const paperAuthors = typeof req.body?.paperAuthors === 'string' ? req.body.paperAuthors.trim().slice(0, 160) : ''
    const paperJournal = typeof req.body?.paperJournal === 'string' ? req.body.paperJournal.trim().slice(0, 120) : ''
    const paperYear = Number.isInteger(Number(req.body?.paperYear)) && Number(req.body.paperYear) >= 1900 && Number(req.body.paperYear) <= 2100
      ? Number(req.body.paperYear)
      : null

    const recent = database
      .prepare('SELECT COUNT(*) AS n FROM fanxing_project WHERE creator_id = ? AND created_at > ?')
      .get(req.accountUser.id, new Date(Date.now() - 3600000).toISOString())?.n || 0
    if (recent >= 3) {
      return res.status(429).json({ error: '发起课题过于频繁，请稍后再试' })
    }

    const id = `fx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const now = new Date().toISOString()

    const tasks = [
      {
        id: `${id}-t1`,
        title: task,
        role,
        difficulty: '入门 · 开放协作',
        plannedTarget: '规划任务：开放认领与阶段观察记录提交'
      }
    ]

    let papers = []
    if (validatedDoi) {
      const knownCurated = CURATED_GEO_PAPERS.find(p => p.doi.toLowerCase() === validatedDoi.toLowerCase())
      if (knownCurated) {
        papers = [knownCurated]
      } else {
        papers = [
          {
            title: paperTitle || `DOI 关联文献 (${validatedDoi})`,
            authors: paperAuthors || '请点击 DOI 链接至原出版页核对作者',
            year: paperYear,
            journal: paperJournal || 'DOI 注册出版物（待核对原出版信息）',
            workType: 'unknown',
            workTypeLabel: 'DOI 关联出版物',
            doi: validatedDoi,
            url: `https://doi.org/${validatedDoi}`,
            note: '由课题发起人提供的 DOI 文献线索，请点击链接至原出版平台核对全文与同行评议状态。'
          }
        ]
      }
    }

    const canUpdateSourcePost =
      sourcePost && (sourcePost.author_id === req.accountUser.id || isAdmin(req.accountUser.id))

    database.transaction(() => {
      database
        .prepare(`
          INSERT INTO fanxing_project (
            id, title, field, phase, status, question, method, role, commitment, task,
            linked_lab_url, linked_lab_title, tasks_json, papers_json, datasets_json,
            collab_qq_group, collab_contact, onboarding_guide, source_post_id, creator_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'recruiting', ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          id,
          title,
          field,
          phase,
          question,
          method,
          role,
          commitment,
          task,
          '/geo-labs/satellite',
          '真实数据与 3D 地理探究实验室',
          JSON.stringify(tasks),
          JSON.stringify(papers),
          collabQqGroup || '审核通过后由课题发起人或管理员在审核留言中提供',
          collabContact || `课题发起人：${req.accountUser.name}`,
          `1. 阅读课题研究问题与方法；\n2. 完成首项任务「${task}」；\n3. 在课题关联讨论区发布你的观察证据卡或文献笔记。`,
          sourcePostId,
          req.accountUser.id,
          now,
          now
        )

      database
        .prepare(`
          INSERT OR IGNORE INTO fanxing_application (
            project_id, user_id, applicant_name, applicant_contact,
            motivation, experience, preferred_task, weekly_time,
            status, review_note, reviewed_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, '课题发起人', '课题立项与协调', ?, '2 小时以上', 'approved', '课题发起人自动加入', ?, ?, ?)
        `)
        .run(id, req.accountUser.id, req.accountUser.name || '课题发起人', collabContact, task, req.accountUser.id, now, now)

      // 仅当发起人是原讨论作者本人或管理员时，才在原帖上回写 linked_project_id；他人引用仅保存在新课题的 source_post_id
      if (canUpdateSourcePost) {
        try {
          database
            .prepare('UPDATE community_post SET linked_project_id = ? WHERE id = ?')
            .run(id, sourcePostId)
        } catch {}
      }
    })()

    const createdRow = database.prepare('SELECT * FROM fanxing_project WHERE id = ?').get(id)
    res.status(201).json({
      project: formatProjectRow(createdRow, {
        currentUserId: req.accountUser.id,
        callerIsAdmin: isAdmin(req.accountUser.id)
      }),
      sourcePostLinked: Boolean(canUpdateSourcePost)
    })
  })

  // 6. 管理员后台：查看所有繁星课题申请列表
  app.get('/api/fanxing/moderation/applications', requireUser, (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    const rows = database
      .prepare(`
        SELECT a.id, a.project_id AS projectId, a.user_id AS userId,
               a.applicant_name AS applicantName, a.applicant_contact AS applicantContact,
               a.motivation, a.experience, a.preferred_task AS preferredTask,
               a.weekly_time AS weeklyTime, a.status, a.review_note AS reviewNote,
               a.notified_at AS notifiedAt, a.notification_status AS notificationStatus,
               a.created_at AS createdAt, a.updated_at AS updatedAt,
               p.title AS projectTitle, p.collab_qq_group AS collabQqGroup,
               u.email AS applicantEmail
        FROM fanxing_application a
        JOIN fanxing_project p ON p.id = a.project_id
        LEFT JOIN user u ON u.id = a.user_id
        ORDER BY CASE a.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, a.updated_at DESC
        LIMIT 200
      `)
      .all()
    res.json({ applications: rows })
  })

  // 7. 管理员后台：审核通过或拒绝课题申请，幂等防重复发信，并向申请人发送审核结果通知邮件
  app.post('/api/fanxing/moderation/applications/:id', requireOrigin, requireUser, async (req, res) => {
    if (!isAdmin(req.accountUser.id)) return res.status(403).json({ error: '没有管理权限' })
    const id = positiveId(req.params.id)
    const action = req.body?.action
    if (!id || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: '无效的审核操作' })
    }
    const appRow = database.prepare('SELECT * FROM fanxing_application WHERE id = ?').get(id)
    if (!appRow) return res.status(404).json({ error: '申请记录不存在' })

    const nextStatus = action === 'approve' ? 'approved' : 'rejected'
    const reviewNote = typeof req.body?.reviewNote === 'string' && req.body.reviewNote.trim()
      ? req.body.reviewNote.trim().slice(0, 400)
      : nextStatus === 'approved'
        ? '审核已通过！欢迎按课题起步指南开展首项微任务，并在社区关联讨论区提交观察记录。'
        : '感谢申请，当前阶段名额或任务方向暂不匹配，欢迎先在社区参与公开讨论。'
    const collabQqGroup = typeof req.body?.collabQqGroup === 'string' ? req.body.collabQqGroup.trim().slice(0, 80) : ''

    const currentProjectRow = database.prepare('SELECT * FROM fanxing_project WHERE id = ?').get(appRow.project_id)

    // 幂等保护：若已处于相同审核状态、审核意见相同、群号未变且邮件已发送过，则不重复发邮件
    const sameGroup = !collabQqGroup || collabQqGroup === (currentProjectRow?.collab_qq_group || '')
    if (appRow.status === nextStatus && appRow.review_note === reviewNote && sameGroup && appRow.notification_status === 'email_sent') {
      return res.json({
        id,
        status: nextStatus,
        reviewNote,
        emailNotified: false,
        deduplicated: true,
        notificationStatus: appRow.notification_status,
        notifiedAt: appRow.notified_at
      })
    }

    const now = new Date().toISOString()
    database.transaction(() => {
      database
        .prepare(`
          UPDATE fanxing_application
          SET status = ?, review_note = ?, reviewed_by = ?, updated_at = ?
          WHERE id = ?
        `)
        .run(nextStatus, reviewNote, req.accountUser.id, now, id)

      if (collabQqGroup) {
        database
          .prepare('UPDATE fanxing_project SET collab_qq_group = ?, updated_at = ? WHERE id = ?')
          .run(collabQqGroup, now, appRow.project_id)
      }
    })()

    const projectRow = database.prepare('SELECT * FROM fanxing_project WHERE id = ?').get(appRow.project_id)
    const applicantUser = database.prepare('SELECT email, name FROM user WHERE id = ?').get(appRow.user_id)

    let emailNotified = false
    if (applicantUser?.email && projectRow) {
      const subject =
        nextStatus === 'approved'
          ? `【繁星计划审核通过】欢迎加入「${projectRow.title}」科研课题组`
          : `【繁星计划申请进度更新】关于「${projectRow.title}」的审核反馈`

      const text =
        nextStatus === 'approved'
          ? `${applicantUser.name || appRow.applicant_name}，你好！\n\n` +
            `你申请参与的地理共同体繁星计划课题「${projectRow.title}」已通过审核！\n\n` +
            `• 认领微任务：${appRow.preferred_task}\n` +
            `• 管理员审核留言：${reviewNote}\n` +
            `• 课题协作 QQ 群 / 联系渠道：${projectRow.collab_qq_group}\n` +
            `• 课题对接说明：${projectRow.collab_contact}\n\n` +
            `【新手起步指南】\n${projectRow.onboarding_guide}\n\n` +
            `你随时可以打开课题主页查看协作指引并提交首份观察记录：\n${siteOrigin}/#/fanxing/${projectRow.id}`
          : `${applicantUser.name || appRow.applicant_name}，你好！\n\n` +
            `感谢你申请参与繁星计划课题「${projectRow.title}」。\n` +
            `当前审核状态：暂未通过\n` +
            `管理员反馈：${reviewNote}\n\n` +
            `你可以补充信息后重新提交申请，或浏览其他开放课题：\n${siteOrigin}/#/fanxing/${projectRow.id}`

      try {
        emailNotified = Boolean(await mailSender({ to: applicantUser.email, subject, text }))
      } catch {
        emailNotified = false
      }
    }

    const notificationStatus = emailNotified ? 'email_sent' : 'in_app'
    database
      .prepare('UPDATE fanxing_application SET notified_at = ?, notification_status = ? WHERE id = ?')
      .run(now, notificationStatus, id)

    res.json({
      id,
      status: nextStatus,
      reviewNote,
      emailNotified,
      notificationStatus,
      notifiedAt: now
    })
  })

  // 8. 学术文献检索接口（代理 Crossref REST API，支持排序与年份过滤，并带精选回退）
  app.get('/api/fanxing/literature', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120) : ''
    const sort = req.query.sort === 'newest' ? 'newest' : 'relevance'
    const fromYear = typeof req.query.fromYear === 'string' && /^\d{4}$/.test(req.query.fromYear) ? req.query.fromYear : null
    const onlyJournalArticles = req.query.onlyJournal === '1'
    if (!q) {
      return res.json({ papers: CURATED_GEO_PAPERS, source: 'curated-doi-catalog', sort })
    }
    try {
      const papers = await searchCrossrefLiterature(q, { rows: 6, sort, fromYear, onlyJournalArticles })
      res.json({ papers, source: 'crossref-api', query: q, sort, fromYear })
    } catch {
      const kw = q.toLowerCase()
      const filtered = CURATED_GEO_PAPERS.filter(
        p => p.title.toLowerCase().includes(kw) || p.topic.toLowerCase().includes(kw) || p.authors.toLowerCase().includes(kw)
      )
      res.json({
        papers: filtered,
        source: 'curated-fallback',
        query: q,
        sort
      })
    }
  })
}
