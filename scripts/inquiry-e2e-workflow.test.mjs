process.env.AUTH_ORIGIN = 'http://127.0.0.1:4100'
process.env.SITE_ORIGIN = 'http://127.0.0.1:4173'
process.env.BETTER_AUTH_SECRET = '01234567890123456789012345678901'
process.env.ACCOUNT_DB_PATH = '/tmp/account-inquiry-e2e-test.sqlite'

import { describe, it, expect, beforeEach } from 'vitest'

const { database, migrateInquirySystem } = await import('../server/database.mjs')
const {
  assignTeacherRole,
  assignStudentClass,
  setupInquiryRoutes
} = await import('../server/inquiry.mjs')

describe('Inquiry End-to-End Workflow: Multi-Account Isolation and Feedback Loop', () => {
  let fakeApp
  let routes

  beforeEach(() => {
    database.exec('DROP TABLE IF EXISTS user_role;')
    database.exec('DROP TABLE IF EXISTS teacher_assignment;')
    database.exec('DROP TABLE IF EXISTS student_class_enrollment;')
    database.exec('DROP TABLE IF EXISTS inquiry_submission;')
    database.exec('DROP TABLE IF EXISTS inquiry_review;')
    database.exec('DROP TABLE IF EXISTS inquiry_audit_log;')
    migrateInquirySystem()

    routes = {}
    fakeApp = {
      get(path, ...handlers) { routes[`GET ${path}`] = handlers },
      post(path, ...handlers) { routes[`POST ${path}`] = handlers }
    }

    setupInquiryRoutes(fakeApp, {
      requireOrigin: (_req, _res, next) => next(),
      requireUser: (req, res, next) => {
        if (!req.accountUser) return res.status(401).json({ error: '请先登录' })
        next()
      }
    })
  })

  it('runs complete multi-user flow: Student A submit -> Teacher review -> Student A revision, while Student B & Teacher 2 are strictly blocked', async () => {
    // 1. Unauthenticated user request must be rejected with 401
    const unauthReq = {}
    let unauthCode = null
    const unauthRes = { status: (c) => { unauthCode = c; return { json: () => {} } } }
    routes['GET /api/inquiry/submissions'][0](unauthReq, unauthRes, () => {})
    expect(unauthCode).toBe(401)

    // 2. Student A submits inquiry draft V1
    const studentAReq = {
      accountUser: { id: 'usr-student-a', name: '李思齐（学生A）' },
      body: {
        taskId: 'urban-flood',
        classCode: 'CLASS-GEO-1',
        gradeLevel: '高中',
        initialHypothesis: '猜想V1：下水管道太细，导致地表积水。只要加大管道直径就能彻底解决内涝。',
        causalExplanation: '水泥路面下渗率极低，雨水无法进入地下水系统。',
        variablesSetup: { independent: '地表材质', controlled: ['降雨强度50mm/h', '坡度2°'] },
        evidenceCards: [{ title: '硬化路面实验', observation: '8分钟达峰', inference: '产流极快' }],
        showcaseConsent: true,
        status: 'submitted'
      }
    }

    let postSubResult = null
    const mockPostSubRes = {
      status: (code) => {
        expect(code).toBe(201)
        return { json: (d) => { postSubResult = d } }
      }
    }

    // Call submit endpoint as Student A
    routes['POST /api/inquiry/submissions'].slice(-1)[0](studentAReq, mockPostSubRes)
    expect(postSubResult.status).toBe('ok')
    const submissionId = postSubResult.id
    expect(submissionId).toBeDefined()
    expect(postSubResult.versionCount).toBe(1)

    // 3. Student B calls /api/inquiry/submissions: MUST NOT see Student A's work
    const studentBReq = { accountUser: { id: 'usr-student-b', name: '王晓宇（学生B）' } }
    let studentBData = null
    routes['GET /api/inquiry/submissions'].slice(-1)[0](studentBReq, { json: (d) => { studentBData = d } })
    expect(studentBData.submissions).toHaveLength(0)

    // 4. Admin assigns the student to a class before teachers can access the work.
    assignStudentClass({ adminId: 'admin-head', studentId: 'usr-student-a', classCode: 'CLASS-GEO-1' })
    // Set up Teacher T1 (assigned to CLASS-GEO-1) and Teacher T2 (assigned to CLASS-GEO-99)
    assignTeacherRole({
      adminId: 'admin-head',
      teacherId: 'usr-teacher-t1',
      classCode: 'CLASS-GEO-1',
      displayTitle: '高一地理任课教师'
    })

    assignTeacherRole({
      adminId: 'admin-head',
      teacherId: 'usr-teacher-t2',
      classCode: 'CLASS-GEO-99',
      displayTitle: '高三地理教师'
    })

    // Teacher T2 (unrelated class) tries to fetch submissions: should receive 0 submissions
    let teacherT2Data = null
    routes['GET /api/inquiry/submissions'].slice(-1)[0](
      { accountUser: { id: 'usr-teacher-t2', name: '赵老师（无关教师）' } },
      { json: (d) => { teacherT2Data = d } }
    )
    expect(teacherT2Data.submissions).toHaveLength(0)

    // Teacher T2 tries to grade Student A's submission: must be rejected with 403 Forbidden!
    let t2ReviewCode = null
    let t2ReviewErr = null
    routes['POST /api/inquiry/reviews'].slice(-1)[0](
      {
        accountUser: { id: 'usr-teacher-t2', name: '赵老师' },
        body: {
          submissionId,
          taskId: 'urban-flood',
          scores: { questionQuality: 3 },
          totalScore: 75,
          feedbackComment: '越权评分'
        }
      },
      {
        status: (c) => {
          t2ReviewCode = c
          return { json: (j) => { t2ReviewErr = j } }
        }
      }
    )
    expect(t2ReviewCode).toBe(403)
    expect(t2ReviewErr.error).toContain('您未被分配管辖该学生所在的教学班级')

    // 5. Authorized Teacher T1 views submissions: sees Student A's submission
    let teacherT1Data = null
    routes['GET /api/inquiry/submissions'].slice(-1)[0](
      { accountUser: { id: 'usr-teacher-t1', name: '周老师（本班教师）' } },
      { json: (d) => { teacherT1Data = d } }
    )
    expect(teacherT1Data.submissions).toHaveLength(1)
    expect(teacherT1Data.submissions[0].student_name).toBe('李思齐（学生A）')

    // 6. Teacher T1 grades the submission with rubrics and feedback
    let teacherReviewResult = null
    routes['POST /api/inquiry/reviews'].slice(-1)[0](
      {
        accountUser: { id: 'usr-teacher-t1', name: '周老师' },
        body: {
          submissionId,
          taskId: 'urban-flood',
          scores: {
            questionQuality: 4,
            variableControl: 4,
            evidenceReliability: 4,
            causalExplanation: 3,
            counterExampleAwareness: 3,
            tradeOffBalance: 3,
            reflectionRevision: 4
          },
          totalScore: 92,
          feedbackComment: '单变量对照很标准，但因果解释中建议深化关于透水砖碎石垫层饱和极限的分析。',
          overrideAiAdvice: '重点注意：持续长历时强降雨会导致下渗饱和突变。',
          isShowcased: false
        }
      },
      {
        status: (code) => {
          expect(code).toBe(201)
          return { json: (d) => { teacherReviewResult = d } }
        }
      }
    )
    expect(teacherReviewResult.status).toBe('ok')
    expect(teacherReviewResult.totalScore).toBe(92)
    expect(teacherReviewResult.isShowcased).toBe(0)

    // 7. Student A reads their updated submission and sees teacher review status
    let studentAReadData = null
    routes['GET /api/inquiry/submissions'].slice(-1)[0](studentAReq, { json: (d) => { studentAReadData = d } })
    expect(studentAReadData.submissions[0].status).toBe('reviewed')
    expect(studentAReadData.submissions[0].is_showcased).toBe(0)

    // 8. Student A revises their hypothesis and conclusion to V2 based on teacher guidance
    const studentARevisionReq = {
      accountUser: { id: 'usr-student-a', name: '李思齐（学生A）' },
      body: {
        taskId: 'urban-flood',
        classCode: 'CLASS-GEO-1',
        gradeLevel: '高中',
        initialHypothesis: '猜想V1：下水管道太细，导致地表积水。只要加大管道直径就能彻底解决内涝。',
        revisedConclusion: '结论V2修订：城市内涝本质是地表硬化切断下渗。海绵城市通过源头削峰，但在长历时特大暴雨垫层饱和及外河顶托时仍需超标应急工程。',
        causalExplanation: '深化分析：海绵铺装下渗率达55%，但持续暴雨后碎石层饱和，必须系统统筹排涝。',
        variablesSetup: { independent: '地表材质', controlled: ['降雨强度50mm/h', '坡度2°', '历时60min'] },
        evidenceCards: [
          { title: '硬化路面实验', observation: '8分钟达峰', inference: '产流极快' },
          { title: '海绵铺装实验', observation: '26分钟达峰，削峰48%', inference: '滞留削峰有效' }
        ],
        counterExamples: '在降雨持续120分钟以上碎石储水层饱和后，削峰率由48%衰减至19%。',
        showcaseConsent: true,
        status: 'submitted'
      }
    }

    let revisionRes = null
    routes['POST /api/inquiry/submissions'].slice(-1)[0](studentARevisionReq, {
      status: (code) => {
        expect(code).toBe(201)
        return { json: (d) => { revisionRes = d } }
      }
    })
    expect(revisionRes.versionCount).toBe(2)

    // 9. Public showcase endpoint test: must have sanitized output without personal student name
    let showcaseData = null
    routes['GET /api/inquiry/showcase'].slice(-1)[0]({}, { json: (d) => { showcaseData = d } })
    expect(showcaseData.showcaseList).toHaveLength(0)
  })
})
