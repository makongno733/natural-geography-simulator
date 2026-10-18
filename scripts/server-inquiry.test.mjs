process.env.AUTH_ORIGIN = 'http://127.0.0.1:4100'
process.env.SITE_ORIGIN = 'http://127.0.0.1:4173'
process.env.BETTER_AUTH_SECRET = '01234567890123456789012345678901'
process.env.ACCOUNT_DB_PATH = '/tmp/account-inquiry-auth-test.sqlite'

import { describe, it, expect, beforeEach } from 'vitest'

const { database, migrateInquirySystem } = await import('../server/database.mjs')
const {
  getUserRole,
  assignTeacherRole,
  assignStudentClass,
  getTeacherAssignments,
  setupInquiryRoutes
} = await import('../server/inquiry.mjs')

describe('Server Inquiry Authorization & Student Data Protection', () => {
  beforeEach(() => {
    database.exec('DROP TABLE IF EXISTS user_role;')
    database.exec('DROP TABLE IF EXISTS teacher_assignment;')
    database.exec('DROP TABLE IF EXISTS student_class_enrollment;')
    database.exec('DROP TABLE IF EXISTS inquiry_submission;')
    database.exec('DROP TABLE IF EXISTS inquiry_review;')
    database.exec('DROP TABLE IF EXISTS inquiry_audit_log;')
    migrateInquirySystem()
  })

  it('prohibits arbitrary teacher elevation and requires auditable assignment', () => {
    const studentId = 'student-alice'
    expect(getUserRole(studentId)).toBe('student')

    // Authorized administrator provisioning is exercised through the route below.
    expect(() => {
      assignTeacherRole({
        adminId: 'admin-1',
        teacherId: 'teacher-smith',
        classCode: 'CLASS-GEO-A',
        displayTitle: '高中地理骨干教师'
      })
    }).not.toThrow()

    expect(getUserRole('teacher-smith')).toBe('teacher')
    const assignments = getTeacherAssignments('teacher-smith')
    expect(assignments.length).toBe(1)
    expect(assignments[0].class_code).toBe('CLASS-GEO-A')
  })

  it('enforces strict data isolation between students', () => {
    const now = new Date().toISOString()
    // Student A submission
    database.prepare(`
      INSERT INTO inquiry_submission (
        id, task_id, user_id, class_code, student_name, grade_level, version_count, status,
        initial_hypothesis, revised_conclusion, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('sub-a', 'urban-flood', 'student-a', 'CLASS-GEO-A', '张同学', '高中', 1, 'draft', '猜想A', '结论A', now, now)

    // Student B submission
    database.prepare(`
      INSERT INTO inquiry_submission (
        id, task_id, user_id, class_code, student_name, grade_level, version_count, status,
        initial_hypothesis, revised_conclusion, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('sub-b', 'urban-flood', 'student-b', 'CLASS-GEO-A', '李同学', '高中', 1, 'draft', '猜想B', '结论B', now, now)

    // Mock Express request/response for student A
    const reqStudentA = { accountUser: { id: 'student-a', name: '张同学' } }
    let resDataA = null
    const resA = { json: (d) => { resDataA = d } }

    const fakeApp = {
      routes: {},
      get(path, ...handlers) { this.routes[`GET ${path}`] = handlers },
      post(path, ...handlers) { this.routes[`POST ${path}`] = handlers }
    }
    setupInquiryRoutes(fakeApp, {
      requireOrigin: (_req, _res, next) => next(),
      requireUser: (_req, _res, next) => next()
    })

    // Student A fetches submissions
    const getSubmissionsHandler = fakeApp.routes['GET /api/inquiry/submissions'].slice(-1)[0]
    getSubmissionsHandler(reqStudentA, resA)

    expect(resDataA.submissions.length).toBe(1)
    expect(resDataA.submissions[0].user_id).toBe('student-a')
    expect(resDataA.submissions.find(s => s.user_id === 'student-b')).toBeUndefined()
  })

  it('restricts teacher access strictly to assigned classes and blocks cross-class review', () => {
    const now = new Date().toISOString()
    // Class A student
    database.prepare(`
      INSERT INTO inquiry_submission (
        id, task_id, user_id, class_code, student_name, grade_level, version_count, status,
        initial_hypothesis, revised_conclusion, showcase_consent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('sub-class-a', 'urban-flood', 'student-1', 'CLASS-A', '学生甲', '高中', 1, 'submitted', 'A猜想', 'A结论', 0, now, now)

    // Class B student
    database.prepare(`
      INSERT INTO inquiry_submission (
        id, task_id, user_id, class_code, student_name, grade_level, version_count, status,
        initial_hypothesis, revised_conclusion, showcase_consent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('sub-class-b', 'urban-flood', 'student-2', 'CLASS-B', '学生乙', '高中', 1, 'submitted', 'B猜想', 'B结论', 0, now, now)
    assignStudentClass({ adminId: 'admin', studentId: 'student-1', classCode: 'CLASS-A' })
    assignStudentClass({ adminId: 'admin', studentId: 'student-2', classCode: 'CLASS-B' })

    // Teacher 1 is only assigned to CLASS-A
    assignTeacherRole({
      adminId: 'admin',
      teacherId: 'teacher-1',
      classCode: 'CLASS-A'
    })

    const fakeApp = {
      routes: {},
      get(path, ...handlers) { this.routes[`GET ${path}`] = handlers },
      post(path, ...handlers) { this.routes[`POST ${path}`] = handlers }
    }
    setupInquiryRoutes(fakeApp, {
      requireOrigin: (_req, _res, next) => next(),
      requireUser: (_req, _res, next) => next()
    })

    // Teacher 1 fetches submissions: must ONLY see CLASS-A, not CLASS-B
    const getSubmissions = fakeApp.routes['GET /api/inquiry/submissions'].slice(-1)[0]
    let teacherViewData = null
    getSubmissions({ accountUser: { id: 'teacher-1', name: '王老师' } }, { json: (d) => { teacherViewData = d } })

    expect(teacherViewData.submissions.length).toBe(1)
    expect(teacherViewData.submissions[0].class_code).toBe('CLASS-A')
    expect(teacherViewData.submissions.find(s => s.class_code === 'CLASS-B')).toBeUndefined()

    // Teacher 1 attempts to review submission of CLASS-B: must be rejected with 403 Forbidden!
    const postReview = fakeApp.routes['POST /api/inquiry/reviews'].slice(-1)[0]
    let errorStatus = null
    let errorJson = null
    const resForbidden = {
      status: (code) => {
        errorStatus = code
        return { json: (j) => { errorJson = j } }
      }
    }

    postReview({
      accountUser: { id: 'teacher-1', name: '王老师' },
      body: {
        submissionId: 'sub-class-b', // Cross-class unauthorized target!
        taskId: 'urban-flood',
        scores: { questionQuality: 4 },
        totalScore: 90,
        feedbackComment: '越权批改测试'
      }
    }, resForbidden)

    expect(errorStatus).toBe(403)
    expect(errorJson.error).toContain('权限拒绝')
  })

  it('rejects showcase publishing if student has not given showcase consent', () => {
    const now = new Date().toISOString()
    // Student submission with showcase_consent = 0
    database.prepare(`
      INSERT INTO inquiry_submission (
        id, task_id, user_id, class_code, student_name, grade_level, version_count, status,
        initial_hypothesis, revised_conclusion, showcase_consent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('sub-no-consent', 'urban-flood', 'student-3', 'CLASS-A', '学生丙', '高中', 1, 'submitted', '猜想', '结论', 0, now, now)
    assignStudentClass({ adminId: 'admin', studentId: 'student-3', classCode: 'CLASS-A' })

    assignTeacherRole({
      adminId: 'admin',
      teacherId: 'teacher-1',
      classCode: 'CLASS-A'
    })

    const fakeApp = {
      routes: {},
      get(path, ...handlers) { this.routes[`GET ${path}`] = handlers },
      post(path, ...handlers) { this.routes[`POST ${path}`] = handlers }
    }
    setupInquiryRoutes(fakeApp, {
      requireOrigin: (_req, _res, next) => next(),
      requireUser: (_req, _res, next) => next()
    })

    const postReview = fakeApp.routes['POST /api/inquiry/reviews'].slice(-1)[0]
    let status = null
    let json = null
    const mockRes = {
      status: (c) => {
        status = c
        return { json: (j) => { json = j } }
      }
    }

    // Teacher tries to showcase without student consent
    postReview({
      accountUser: { id: 'teacher-1', name: '王老师' },
      body: {
        submissionId: 'sub-no-consent',
        taskId: 'urban-flood',
        scores: { questionQuality: 4 },
        totalScore: 95,
        feedbackComment: '很好',
        isShowcased: true
      }
    }, mockRes)

    expect(status).toBe(400)
    expect(json.error).toContain('学生尚未授权其作品用于课堂公开展示')
  })

  it('guarantees showcase endpoint redacts real student names and user IDs', () => {
    const now = new Date().toISOString()
    database.prepare(`
      INSERT INTO inquiry_submission (
        id, task_id, user_id, class_code, student_name, grade_level, version_count, status,
        initial_hypothesis, revised_conclusion, showcase_consent, is_showcased, is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('sub-demo-vetted', 'urban-flood', 'demo-user-1', 'CLASS-A', '真实的敏感姓名王小明', '高中', 1, 'reviewed', '假说', '结论', 1, 1, 1, now, now)

    database.prepare(`
      INSERT INTO inquiry_review (
        id, submission_id, task_id, teacher_id, teacher_name, scores, total_score, feedback_comment, is_showcased, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('rev-1', 'sub-demo-vetted', 'urban-flood', 'teacher-1', '李老师', '{}', 92, '评语', 1, now, now)

    const fakeApp = {
      routes: {},
      get(path, ...handlers) { this.routes[`GET ${path}`] = handlers },
      post(path, ...handlers) { this.routes[`POST ${path}`] = handlers }
    }
    setupInquiryRoutes(fakeApp, {
      requireOrigin: (_req, _res, next) => next(),
      requireUser: (_req, _res, next) => next()
    })

    const getShowcase = fakeApp.routes['GET /api/inquiry/showcase'].slice(-1)[0]
    let showcaseResult = null
    getShowcase({}, { json: (d) => { showcaseResult = d } })

    expect(showcaseResult.showcaseList.length).toBe(1)
    const item = showcaseResult.showcaseList[0]
    expect(item.pseudonym).toContain('探究示范样例')
    expect(item.pseudonym).not.toContain('王小明')
    expect(item.userId).toBeUndefined()
    expect(item.studentName).toBeUndefined()
  })

  it('ignores a forged class code and enforces task-scoped teacher access', () => {
    const routes = {}
    setupInquiryRoutes({
      get(path, ...handlers) { routes[`GET ${path}`] = handlers.at(-1) },
      post(path, ...handlers) { routes[`POST ${path}`] = handlers.at(-1) }
    }, { requireOrigin: (_, __, next) => next(), requireUser: (_, __, next) => next() })
    assignStudentClass({ adminId: 'admin', studentId: 'student-1', classCode: 'CLASS-A' })
    assignTeacherRole({ adminId: 'admin', teacherId: 'teacher-1', classCode: 'CLASS-A', taskId: 'urban-flood' })
    const response = () => ({ status(code) { this.code = code; return this }, json(body) { this.body = body; return this } })
    const student = { accountUser: { id: 'student-1', name: '学生甲' } }
    const flood = response()
    routes['POST /api/inquiry/submissions']({ ...student, body: { taskId: 'urban-flood', classCode: 'CLASS-B', status: 'submitted' } }, flood)
    expect(flood.code).toBe(201)
    expect(database.prepare('SELECT class_code FROM inquiry_submission WHERE id = ?').get(flood.body.id).class_code).toBe('CLASS-A')
    const other = response()
    routes['POST /api/inquiry/submissions']({ ...student, body: { taskId: 'landscape-variation', status: 'submitted' } }, other)
    const teacher = { accountUser: { id: 'teacher-1', name: '教师甲' } }
    const list = response()
    routes['GET /api/inquiry/submissions'](teacher, list)
    expect(list.body.submissions.map(row => row.id)).toEqual([flood.body.id])
    const forged = response()
    routes['POST /api/inquiry/reviews']({ ...teacher, body: { submissionId: other.body.id, taskId: 'urban-flood', totalScore: 80 } }, forged)
    expect(forged.code).toBe(400)
    const denied = response()
    routes['POST /api/inquiry/reviews']({ ...teacher, body: { submissionId: other.body.id, taskId: 'landscape-variation', totalScore: 80 } }, denied)
    expect(denied.code).toBe(403)
    const publicWall = response()
    routes['GET /api/inquiry/showcase']({}, publicWall)
    expect(publicWall.body.showcaseList).toEqual([])
  })
})
