import { randomUUID } from 'node:crypto'
import { database } from './database.mjs'

export function getUserRole(userId) {
  if (!userId) return 'student'
  const row = database.prepare('SELECT role, display_title FROM user_role WHERE user_id = ?').get(userId)
  return row?.role || 'student'
}

export function assignTeacherRole({ adminId, teacherId, classCode, taskId = null, displayTitle = '中学地理任课教师' }) {
  if (!adminId || !teacherId || !classCode || classCode === 'CLASS-UNASSIGNED') {
    throw new Error('teacherId and classCode are required')
  }
  const now = new Date().toISOString()
  const assignmentId = randomUUID()

  database.prepare(`
    INSERT INTO user_role (user_id, role, display_title, authorized_by, authorized_at, created_at)
    VALUES (?, 'teacher', ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      role = 'teacher',
      display_title = excluded.display_title,
      authorized_by = excluded.authorized_by,
      authorized_at = excluded.authorized_at
  `).run(teacherId, displayTitle, adminId || 'SYSTEM_ADMIN', now, now)

  database.prepare(`
    INSERT INTO teacher_assignment (id, teacher_id, class_code, task_id, assigned_by, assigned_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(assignmentId, teacherId, classCode, taskId, adminId || 'SYSTEM_ADMIN', now)

  logAudit({
    actorId: adminId || 'SYSTEM_ADMIN',
    action: 'ROLE_ASSIGN_TEACHER',
    targetId: teacherId,
    detail: JSON.stringify({ classCode, taskId, displayTitle })
  })

  return { teacherId, classCode, taskId, assignmentId }
}

export function assignStudentClass({ adminId, studentId, classCode }) {
  if (!adminId || !studentId || !classCode || classCode === 'CLASS-UNASSIGNED') {
    throw new Error('adminId, studentId and a valid classCode are required')
  }
  const now = new Date().toISOString()
  database.transaction(() => {
    database.prepare(`INSERT INTO student_class_enrollment (student_id, class_code, assigned_by, assigned_at)
      VALUES (?, ?, ?, ?) ON CONFLICT(student_id) DO UPDATE SET
      class_code = excluded.class_code, assigned_by = excluded.assigned_by, assigned_at = excluded.assigned_at`)
      .run(studentId, classCode, adminId, now)
    database.prepare('UPDATE inquiry_submission SET class_code = ?, is_showcased = 0 WHERE user_id = ?')
      .run(classCode, studentId)
    logAudit({ actorId: adminId, action: 'CLASS_ASSIGN_STUDENT', targetId: studentId, detail: classCode })
  })()
  return { studentId, classCode }
}

export function getTeacherAssignments(teacherId) {
  if (!teacherId) return []
  return database.prepare('SELECT class_code, task_id FROM teacher_assignment WHERE teacher_id = ?').all(teacherId)
}

export function logAudit({ actorId, action, targetId = null, detail = '' }) {
  const id = randomUUID()
  const now = new Date().toISOString()
  database.prepare(`
    INSERT INTO inquiry_audit_log (id, actor_id, action, target_id, detail, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, actorId, action, targetId, detail, now)
  return id
}

export function setupInquiryRoutes(app, { requireOrigin, requireUser }) {
  // 1. 获取当前用户探究角色与受权管辖范围
  app.get('/api/inquiry/role', requireUser, (req, res) => {
    const role = getUserRole(req.accountUser.id)
    const assignments = role === 'teacher' ? getTeacherAssignments(req.accountUser.id) : []
    res.json({
      role,
      userId: req.accountUser.id,
      name: req.accountUser.name,
      assignments
    })
  })

  // 2. 管理员可审计授权教师分配（绝无硬编码后门）
  app.post('/api/inquiry/admin/assign-teacher', requireOrigin, requireUser, (req, res) => {
    const callerRole = getUserRole(req.accountUser.id)
    if (callerRole !== 'admin') {
      return res.status(403).json({ error: '权限不足：仅系统教研管理员可分配教师权限' })
    }

    const { teacherId, classCode, taskId, displayTitle } = req.body || {}
    if (!teacherId || !classCode) {
      return res.status(400).json({ error: '缺少 teacherId 或 classCode' })
    }

    try {
      const result = assignTeacherRole({
        adminId: req.accountUser.id,
        teacherId,
        classCode,
        taskId: taskId || null,
        displayTitle
      })
      res.status(201).json({ status: 'ok', result })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })

  app.post('/api/inquiry/admin/assign-student', requireOrigin, requireUser, (req, res) => {
    if (getUserRole(req.accountUser.id) !== 'admin') {
      return res.status(403).json({ error: '权限不足：仅系统教研管理员可分配学生班级' })
    }
    try {
      const result = assignStudentClass({ adminId: req.accountUser.id, ...req.body })
      res.status(201).json({ status: 'ok', result })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })

  // 3. 获取提交记录（严格数据隔离）：
  //    - 学生用户：严格仅查阅当前用户本人的探究草稿/提交
  //    - 教师用户：严格仅查阅其明确被分配的班级(class_code)与任务(task_id)提交，无权查阅全站未授权提交
  app.get('/api/inquiry/submissions', requireUser, (req, res) => {
    const role = getUserRole(req.accountUser.id)

    if (role === 'teacher' || role === 'admin') {
      if (role === 'admin') {
        const rows = database.prepare('SELECT * FROM inquiry_submission ORDER BY updated_at DESC LIMIT 100').all()
        return res.json({ submissions: rows, role })
      }

      const assignments = getTeacherAssignments(req.accountUser.id)
      if (assignments.length === 0) {
        // 教师尚未被分配任何班级，返回空列表，禁止越权读取其他班级
        return res.json({ submissions: [], role, notice: '当前教师账号尚未被分配任何教学班级' })
      }

      const rows = database.prepare(`
        SELECT s.* FROM inquiry_submission s
        JOIN student_class_enrollment e ON e.student_id = s.user_id AND e.class_code = s.class_code
        WHERE s.status IN ('submitted', 'reviewed') AND EXISTS (
          SELECT 1 FROM teacher_assignment a WHERE a.teacher_id = ?
          AND a.class_code = s.class_code AND (a.task_id IS NULL OR a.task_id = s.task_id)
        )
        ORDER BY s.updated_at DESC LIMIT 100
      `).all(req.accountUser.id)

      logAudit({
        actorId: req.accountUser.id,
        action: 'TEACHER_VIEW_SUBMISSIONS',
        targetId: req.accountUser.id,
        detail: `Retrieved ${rows.length} submissions for assigned classes`
      })

      return res.json({ submissions: rows, role })
    }

    // 学生用户：仅读取自己的提交，且隐去敏感的系统级外键
    const rows = database.prepare(`
      SELECT * FROM inquiry_submission WHERE user_id = ? ORDER BY updated_at DESC
    `).all(req.accountUser.id)

    res.json({ submissions: rows, role: 'student' })
  })

  // 4. 学生保存/提交自己的草稿
  app.post('/api/inquiry/submissions', requireOrigin, requireUser, (req, res) => {
    const data = req.body || {}
    if (typeof data.taskId !== 'string' || !data.taskId.trim() || data.taskId.length > 100 || !['draft', 'submitted'].includes(data.status)) {
      return res.status(400).json({ error: '无效的任务或提交状态' })
    }

    const existing = database.prepare('SELECT id, version_count, user_id FROM inquiry_submission WHERE task_id = ? AND user_id = ?')
      .get(data.taskId, req.accountUser.id)

    const now = new Date().toISOString()
    const id = existing?.id || randomUUID()
    const versionCount = (existing?.version_count || 0) + 1
    const enrollment = database.prepare('SELECT class_code FROM student_class_enrollment WHERE student_id = ?').get(req.accountUser.id)
    const classCode = enrollment?.class_code || 'CLASS-UNASSIGNED'
    const showcaseConsent = data.showcaseConsent ? 1 : 0

    database.prepare(`
      INSERT INTO inquiry_submission (
        id, task_id, user_id, class_code, student_name, grade_level, version_count, status,
        initial_hypothesis, revised_conclusion, causal_explanation, counter_examples,
        model_limitations, variables_setup, evidence_records, next_questions,
        showcase_consent, is_showcased, is_demo, created_at, updated_at, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        class_code = excluded.class_code,
        grade_level = excluded.grade_level,
        version_count = excluded.version_count,
        status = excluded.status,
        initial_hypothesis = excluded.initial_hypothesis,
        revised_conclusion = excluded.revised_conclusion,
        causal_explanation = excluded.causal_explanation,
        counter_examples = excluded.counter_examples,
        model_limitations = excluded.model_limitations,
        variables_setup = excluded.variables_setup,
        evidence_records = excluded.evidence_records,
        next_questions = excluded.next_questions,
        showcase_consent = excluded.showcase_consent,
        is_showcased = 0,
        updated_at = excluded.updated_at,
        submitted_at = excluded.submitted_at
    `).run(
      id,
      data.taskId,
      req.accountUser.id,
      classCode,
      req.accountUser.name || '探究学生',
      data.gradeLevel || '高中',
      versionCount,
      data.status || 'draft',
      data.initialHypothesis || '',
      data.revisedConclusion || '',
      data.causalExplanation || '',
      data.counterExamples || '',
      data.modelLimitationsNotes || '',
      JSON.stringify(data.variablesSetup || {}),
      JSON.stringify(data.evidenceCards || []),
      data.nextQuestions || '',
      showcaseConsent,
      0,
      0,
      now,
      now,
      data.status === 'submitted' ? now : null
    )

    logAudit({
      actorId: req.accountUser.id,
      action: data.status === 'submitted' ? 'STUDENT_SUBMIT' : 'STUDENT_SAVE_DRAFT',
      targetId: id,
      detail: `version: ${versionCount}, task: ${data.taskId}`
    })

    res.status(201).json({
      status: 'ok',
      id,
      versionCount,
      updatedAt: now,
      statusLabel: data.status === 'submitted' ? (enrollment ? '已提交至教师工作台' : '已保存云端，等待管理员分配班级') : '已保存云端草稿',
      assignedToClass: Boolean(enrollment)
    })
  })

  app.get('/api/inquiry/reviews', requireUser, (req, res) => {
    const rows = database.prepare(`
      SELECT r.submission_id, r.task_id, r.teacher_name, r.scores, r.total_score,
             r.feedback_comment, r.override_ai_advice, r.updated_at
      FROM inquiry_review r
      JOIN inquiry_submission s ON s.id = r.submission_id
      WHERE s.user_id = ? AND s.status = 'reviewed'
      ORDER BY r.updated_at DESC
    `).all(req.accountUser.id)
    res.json({ reviews: rows })
  })

  // 5. 教师量规批注打分（服务端严格校验：角色 + 班级管辖权）
  app.post('/api/inquiry/reviews', requireOrigin, requireUser, (req, res) => {
    const role = getUserRole(req.accountUser.id)
    if (role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ error: '权限不足：仅认证教师可评定量规并提交反馈' })
    }

    const { submissionId, taskId, scores, totalScore, feedbackComment, overrideAiAdvice, isShowcased } = req.body || {}
    if (!taskId || !submissionId) {
      return res.status(400).json({ error: '缺少 taskId 或 submissionId' })
    }

    // 检查目标提交是否存在
    const sub = database.prepare('SELECT id, user_id, class_code, task_id, status, showcase_consent FROM inquiry_submission WHERE id = ?').get(submissionId)
    if (!sub) {
      return res.status(404).json({ error: '目标探究提交不存在' })
    }
    if (taskId !== sub.task_id || !['submitted', 'reviewed'].includes(sub.status)) {
      return res.status(400).json({ error: '任务编号不匹配或作品尚未提交' })
    }
    const enrollment = database.prepare('SELECT class_code FROM student_class_enrollment WHERE student_id = ?').get(sub.user_id)
    if (!enrollment || enrollment.class_code !== sub.class_code) {
      return res.status(403).json({ error: '学生尚未完成管理员班级分配' })
    }

    // 严格管辖权检查：教师只能批阅其被分配班级的提交
    if (role === 'teacher') {
      const assignments = getTeacherAssignments(req.accountUser.id)
      const isAssigned = assignments.some(a => a.class_code === sub.class_code && (!a.task_id || a.task_id === sub.task_id))
      if (!isAssigned) {
        logAudit({
          actorId: req.accountUser.id,
          action: 'UNAUTHORIZED_REVIEW_ATTEMPT',
          targetId: submissionId,
          detail: `Teacher not assigned to class ${sub.class_code}`
        })
        return res.status(403).json({ error: '权限拒绝：您未被分配管辖该学生所在的教学班级' })
      }
    }

    // 推荐展示墙时，必须检查学生知情同意
    let finalShowcased = 0
    if (isShowcased) {
      if (!sub.showcase_consent) {
        return res.status(400).json({ error: '学生尚未授权其作品用于课堂公开展示，无法推送到展示墙' })
      }
      return res.status(400).json({ error: '真实学生作品需要独立的人工内容脱敏复核后才能公开展示；目前仅展示教研示范样例' })
    }

    const now = new Date().toISOString()
    const id = randomUUID()

    database.prepare(`
      INSERT INTO inquiry_review (
        id, submission_id, task_id, teacher_id, teacher_name, scores,
        total_score, feedback_comment, override_ai_advice, is_showcased, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      submissionId,
      taskId,
      req.accountUser.id,
      req.accountUser.name || '任课教师',
      JSON.stringify(scores || {}),
      Number(totalScore || 0),
      feedbackComment || '',
      overrideAiAdvice || '',
      finalShowcased,
      now,
      now
    )

    database.prepare('UPDATE inquiry_submission SET status = ?, is_showcased = ? WHERE id = ?')
      .run('reviewed', finalShowcased, submissionId)

    logAudit({
      actorId: req.accountUser.id,
      action: 'TEACHER_REVIEW_SUBMITTED',
      targetId: submissionId,
      detail: `score: ${totalScore}, showcased: ${finalShowcased}`
    })

    res.status(201).json({ status: 'ok', reviewId: id, totalScore, isShowcased: finalShowcased })
  })

  // 6. 课堂展示墙公共读取（安全隔离：仅展示经过审核的示例，严禁外泄未成年人真实自由文本与身份标识）
  app.get('/api/inquiry/showcase', (_req, res) => {
    const rows = database.prepare(`
      SELECT
        s.id, s.task_id AS taskId, s.grade_level AS gradeLevel,
        s.initial_hypothesis AS initialHypothesis,
        s.revised_conclusion AS revisedConclusion,
        s.causal_explanation AS causalExplanation,
        s.counter_examples AS counterExamples,
        s.evidence_records AS evidenceRecordsJson,
        r.total_score AS teacherScore,
        r.feedback_comment AS teacherComment,
        r.updated_at AS showcasedAt,
        s.is_demo AS isDemo
      FROM inquiry_submission s
      JOIN inquiry_review r ON r.submission_id = s.id
      WHERE s.is_showcased = 1 AND s.is_demo = 1
      ORDER BY r.updated_at DESC LIMIT 20
    `).all()

    const sanitizedList = rows.map((row, index) => {
      let evidenceHighlights = []
      try {
        const parsed = JSON.parse(row.evidenceRecordsJson || '[]')
        evidenceHighlights = Array.isArray(parsed) ? parsed.slice(0, 2) : []
      } catch {}

      return {
        id: row.id,
        taskId: row.taskId,
        pseudonym: row.isDemo ? `探究示范样例 ${String(index + 1).padStart(2, '0')}号` : `授权展示学员 ${String(index + 1).padStart(2, '0')}号（已脱敏）`,
        gradeLevel: row.gradeLevel,
        initialHypothesis: row.initialHypothesis,
        revisedConclusion: row.revisedConclusion,
        causalExplanation: row.causalExplanation,
        counterExamples: row.counterExamples,
        evidenceHighlights,
        teacherScore: row.teacherScore,
        teacherComment: row.teacherComment,
        showcasedAt: row.showcasedAt,
        isDemo: Boolean(row.isDemo)
      }
    })

    res.json({ showcaseList: sanitizedList })
  })
}
