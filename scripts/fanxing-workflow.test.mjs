import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const tempDir = mkdtempSync(join(tmpdir(), 'geo-fanxing-test-'))
process.env.ACCOUNT_DB_PATH = join(tempDir, 'account.sqlite')
process.env.AUTH_ORIGIN = 'http://127.0.0.1:4100'
process.env.SITE_ORIGIN = 'http://127.0.0.1:4173'
process.env.BETTER_AUTH_SECRET = 'test-secret-with-at-least-32-characters-123456'

const { database, migrateInquirySystem } = await import('../server/database.mjs')
const { migrateCommunity, setupCommunityRoutes } = await import('../server/community.mjs')
const { migrateFanxing, setupFanxingRoutes } = await import('../server/fanxing.mjs')

function createTestHarness() {
  const routes = new Map()
  const sentEmails = []
  let currentUser = null
  let originAllowed = true

  const app = {
    get: (path, ...handlers) => routes.set(`GET ${path}`, handlers),
    post: (path, ...handlers) => routes.set(`POST ${path}`, handlers),
    patch: (path, ...handlers) => routes.set(`PATCH ${path}`, handlers),
    delete: (path, ...handlers) => routes.set(`DELETE ${path}`, handlers)
  }
  const requireOrigin = (_req, res, next) => (originAllowed ? next() : res.status(403).json({ error: '不允许的来源' }))
  const requireUser = (req, res, next) => {
    if (!currentUser) return res.status(401).json({ error: '请先登录' })
    req.accountUser = currentUser
    next()
  }
  const optionalUser = (req, _res, next) => {
    req.accountUser = currentUser
    next()
  }
  const mailSender = async ({ to, subject, text }) => {
    sentEmails.push({ to, subject, text })
    return true
  }

  setupCommunityRoutes(app, { requireOrigin, requireUser, optionalUser })
  setupFanxingRoutes(app, { requireOrigin, requireUser, optionalUser, mailSender })

  function matchRoute(method, url) {
    const [pathname, search = ''] = url.split('?')
    for (const [key, handlers] of routes.entries()) {
      const [routeMethod, pattern] = key.split(' ')
      if (routeMethod !== method) continue
      const patternParts = pattern.split('/')
      const pathParts = pathname.split('/')
      if (patternParts.length !== pathParts.length) continue
      const params = {}
      let matched = true
      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i])
        else if (patternParts[i] !== pathParts[i]) matched = false
      }
      if (matched) return { handlers, params, query: Object.fromEntries(new URLSearchParams(search)) }
    }
    throw new Error(`No route for ${method} ${url}`)
  }

  async function call(method, url, { body = {}, user = currentUser } = {}) {
    const previousUser = currentUser
    currentUser = user
    try {
      const route = matchRoute(method, url)
      const req = { params: route.params, query: route.query, body }
      let status = 200
      let payload
      const res = {
        status(code) { status = code; return res },
        json(value) { payload = value; return res },
        set() { return res }
      }
      let index = 0
      async function next(error) {
        if (error) throw error
        const handler = route.handlers[index++]
        if (handler) await handler(req, res, next)
      }
      await next()
      return { status, payload }
    } finally {
      currentUser = previousUser
    }
  }

  return { call, sentEmails }
}

describe('Fanxing Research Application, Admin Review, Literature & Discussion-to-Project Workflow', () => {
  const student = { id: 'student-fx-1', name: '张同学', email: 'student@geo.edu.cn' }
  const admin = { id: 'admin-fx-1', name: '站主管理员', email: 'admin@geo.edu.cn' }
  let harness

  beforeAll(() => {
    database.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
    `)
    database.prepare('INSERT INTO user (id, name, email) VALUES (?, ?, ?), (?, ?, ?)')
      .run(student.id, student.name, student.email, admin.id, admin.name, admin.email)
    migrateInquirySystem()
    database.prepare("INSERT INTO user_role (user_id, role, created_at) VALUES (?, 'admin', ?)")
      .run(admin.id, new Date().toISOString())
    migrateCommunity()
    migrateFanxing()
    harness = createTestHarness()
  })

  afterAll(() => {
    database.close()
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('1. lists real Fanxing projects with verified DOI literature and micro-tasks, keeping collaboration QQ group locked before approval', async () => {
    const listRes = await harness.call('GET', '/api/fanxing/projects', { user: null })
    expect(listRes.status).toBe(200)
    expect(listRes.payload.projects.length).toBeGreaterThanOrEqual(3)

    const xuzhou = listRes.payload.projects.find(p => p.id === 'xuzhou-land-cover')
    expect(xuzhou).toBeTruthy()
    expect(xuzhou.papers.length).toBeGreaterThanOrEqual(2)
    expect(xuzhou.papers[0].doi).toBe('10.5194/essd-13-3907-2021')
    expect(xuzhou.tasks.length).toBeGreaterThanOrEqual(3)
    expect(xuzhou.myApplication).toBeNull()
  })

  it('2. saves applicant motivation, experience, preferred task, and weekly time to SQLite in pending state', async () => {
    const applyRes = await harness.call('POST', '/api/fanxing/projects/xuzhou-land-cover/apply', {
      user: student,
      body: {
        motivation: '希望参与潘安湖采煤塌陷区遥感样点目视核查，学习土地覆盖转移矩阵判读。',
        experience: '学习过高中地理与本站卫星卷帘实验室',
        preferredTask: '潘安湖与九里湖塌陷区水体扩张边界多时相样点核查',
        weeklyTime: '1–2 小时',
        applicantContact: 'QQ: 123456789'
      }
    })
    expect(applyRes.status).toBe(201)
    expect(applyRes.payload.status).toBe('pending')
    expect(applyRes.payload.adminNotified).toBe(true)
    expect(applyRes.payload.application.status).toBe('pending')
    expect(applyRes.payload.application.motivation).toContain('潘安湖')
    // 未审核通过前不暴露内部协作群号
    expect(applyRes.payload.application.collabChannel).toBeNull()
    // 管理员邮箱收到新申请通知
    expect(harness.sentEmails.some(m => m.to === 'admin@geo.edu.cn' && m.subject.includes('新科研申请'))).toBe(true)
  })

  it('3. allows admin to inspect pending application and approve it with QQ group & review note, unlocking collaboration channel for applicant', async () => {
    // 普通学生不能访问管理端接口
    const forbidden = await harness.call('GET', '/api/fanxing/moderation/applications', { user: student })
    expect(forbidden.status).toBe(403)

    // 管理员可查看申请详情
    const modList = await harness.call('GET', '/api/fanxing/moderation/applications', { user: admin })
    expect(modList.status).toBe(200)
    expect(modList.payload.applications.length).toBe(1)
    const appItem = modList.payload.applications[0]
    expect(appItem.applicantName).toBe('张同学')
    expect(appItem.applicantEmail).toBe('student@geo.edu.cn')
    expect(appItem.projectId).toBe('xuzhou-land-cover')
    expect(appItem.status).toBe('pending')

    // 管理员审核通过并设置专属 QQ 群与审核说明
    const approveRes = await harness.call('POST', `/api/fanxing/moderation/applications/${appItem.id}`, {
      user: admin,
      body: {
        action: 'approve',
        reviewNote: '审核通过！请加课题QQ群并认领第1批15个遥感样点。',
        collabQqGroup: '繁星遥感课题组 QQ群：865432109（入群备注：徐州样点-张同学）'
      }
    })
    expect(approveRes.status).toBe(200)
    expect(approveRes.payload.status).toBe('approved')
    expect(approveRes.payload.emailNotified).toBe(true)
    expect(approveRes.payload.notificationStatus).toBe('email_sent')
    // 申请人注册邮箱收到含解锁 QQ 群与起步指南的审核通过通知邮件
    expect(
      harness.sentEmails.some(
        m => m.to === 'student@geo.edu.cn' && m.subject.includes('审核通过') && m.text.includes('865432109')
      )
    ).toBe(true)

    // 申请人再次查询课题详情与个人申请列表时，自动看到已通过状态与解锁的 QQ 群
    const detailRes = await harness.call('GET', '/api/fanxing/projects/xuzhou-land-cover', { user: student })
    expect(detailRes.status).toBe(200)
    expect(detailRes.payload.project.myApplication.status).toBe('approved')
    expect(detailRes.payload.project.myApplication.collabChannel.qqGroup).toContain('865432109')
    expect(detailRes.payload.project.myApplication.reviewNote).toContain('认领第1批15个遥感样点')
    expect(detailRes.payload.collaborators.some(c => c.userId === student.id)).toBe(true)

    // 个人学术主页同步记录科研课题协作贡献
    const profileRes = await harness.call('GET', `/api/community/users/${student.id}`, { user: student })
    expect(profileRes.status).toBe(200)
    expect(profileRes.payload.stats.projectsJoinedCount).toBe(1)
    expect(profileRes.payload.fanxingParticipations[0].projectId).toBe('xuzhou-land-cover')
  })

  it('4. links community discussions to Fanxing projects and papers, and converts a discussion into a new recruiting project', async () => {
    const postRes = await harness.call('POST', '/api/community/posts', {
      user: student,
      body: {
        categoryId: 7,
        kind: 'discussion',
        title: '【样点核查报告】潘安湖湿地 2014-2024 水体边界遥感对比',
        body: '根据 CLCD 数据集与 Landsat 8 影像对比，潘安湖西侧塌陷区已转化为稳定水体与人工湿地。',
        tags: ['繁星计划', '遥感核查'],
        linkedProject: 'xuzhou-land-cover',
        paperDoi: '10.5194/essd-13-3907-2021',
        paperTitle: 'The 30 m annual land cover dataset and its dynamics in China'
      }
    })
    expect(postRes.status).toBe(201)
    const postId = postRes.payload.id

    // 课题详情页能直接看到该关联讨论
    const projDetail = await harness.call('GET', '/api/fanxing/projects/xuzhou-land-cover', { user: null })
    expect(projDetail.payload.linkedPosts.some(p => p.id === postId)).toBe(true)

    // 将讨论转化为新的繁星科研协作课题
    const convertRes = await harness.call('POST', '/api/fanxing/projects', {
      user: student,
      body: {
        title: '淮海经济区采煤塌陷湿地水体季节性波动对比',
        field: '遥感与水文生态',
        phase: '研究设计',
        question: '枯水期与丰水期塌陷区湿地水体面积差值占多大比例？',
        method: '对比冬夏两季卫星影像水体指数（MNDWI），统计季节性消落带范围。',
        role: '消落带样点判读助手',
        commitment: '每周 1–2 小时',
        task: '核查 10 个塌陷湖泊冬夏两期边界并提交证据卡',
        sourcePostId: postId,
        paperDoi: '10.5194/essd-13-3907-2021',
        collabQqGroup: '淮海湿地课题组 QQ群：778899001'
      }
    })
    expect(convertRes.status).toBe(201)
    expect(convertRes.payload.project.title).toContain('淮海经济区')
    expect(convertRes.payload.project.sourcePostId).toBe(postId)
  })

  it('5. supports user submission and admin moderation of open scientific datasets', async () => {
    const subRes = await harness.call('POST', '/api/community/resources/submit', {
      user: student,
      body: {
        title: 'China Land Cover Dataset (CLCD) 30m 年度土地覆盖数据',
        category: '对地观测卫星遥感',
        format: 'GeoTIFF',
        scale: '全国 30m 逐年',
        license: 'CC BY 4.0',
        sourceUrl: 'https://zenodo.org/records/8176941',
        description: '武汉大学杨杰、黄昕团队发布的中国 30 米年度土地覆盖公开数据集。'
      }
    })
    expect(subRes.status).toBe(201)

    const approveRes = await harness.call('POST', `/api/community/moderation/resources/${subRes.payload.id}`, {
      user: admin,
      body: { action: 'approve' }
    })
    expect(approveRes.status).toBe(200)

    const publicRes = await harness.call('GET', '/api/community/resources')
    expect(publicRes.payload.resources.some(r => r.title.includes('CLCD'))).toBe(true)
  })

  it('6. prevents non-author from overwriting source post linked_project_id, rejects nonexistent sourcePostId, rejects invalid DOI, and does not fabricate task completedCount or author/year metadata', async () => {
    const otherUser = { id: 'other-user-2', name: '李同学', email: 'li@geo.edu.cn' }
    database.prepare('INSERT OR IGNORE INTO user (id, name, email) VALUES (?, ?, ?)').run(otherUser.id, otherUser.name, otherUser.email)

    // 张同学发布原帖，关联 xuzhou-land-cover
    const authorPost = await harness.call('POST', '/api/community/posts', {
      user: student,
      body: {
        categoryId: 7,
        kind: 'discussion',
        title: '张同学的原始讨论帖',
        body: '这篇讨论属于张同学，其他用户以此发起新课题时不应覆盖本帖的 linked_project_id。',
        linkedProject: 'xuzhou-land-cover'
      }
    })
    expect(authorPost.status).toBe(201)
    const authorPostId = authorPost.payload.id

    // 1) 不存在的 sourcePostId 应被 404 拒绝
    const missingSourceRes = await harness.call('POST', '/api/fanxing/projects', {
      user: otherUser,
      body: {
        title: '引用不存在帖子的课题',
        question: '测试不存在的 sourcePostId 是否被拦截？',
        method: '对照检验法',
        task: '完成 5 个样点核查',
        sourcePostId: 999999
      }
    })
    expect(missingSourceRes.status).toBe(404)

    // 2) 非法 DOI 应被 400 拒绝
    const badDoiRes = await harness.call('POST', '/api/fanxing/projects', {
      user: otherUser,
      body: {
        title: '包含非法DOI的课题',
        question: '测试非法 DOI 格式是否被拦截？',
        method: '对照检验法',
        task: '完成 5 个样点核查',
        paperDoi: 'not-a-valid-doi',
        paperTitle: '某篇论文'
      }
    })
    expect(badDoiRes.status).toBe(400)

    // 3) 李同学引用张同学的帖子发起新课题：课题可创建并记录 sourcePostId，但不得篡改张同学原帖的 linked_project_id；也不得伪造 completedCount=1 或把发起人当论文作者
    const otherConvertRes = await harness.call('POST', '/api/fanxing/projects', {
      user: otherUser,
      body: {
        title: '李同学衍生的新课题',
        question: '在张同学讨论基础上延伸的新研究问题是什么？',
        method: '遥感影像对比',
        task: '核查 10 个新样点',
        sourcePostId: authorPostId,
        paperDoi: '10.1038/s41586-023-06000-1',
        paperTitle: 'A verified DOI paper without author metadata provided'
      }
    })
    expect(otherConvertRes.status).toBe(201)
    expect(otherConvertRes.payload.sourcePostLinked).toBe(false)
    const createdProj = otherConvertRes.payload.project
    expect(createdProj.tasks[0].completedCount).toBeUndefined()
    expect(createdProj.papers[0].authors).toBe('请点击 DOI 链接至原出版页核对作者')
    expect(createdProj.papers[0].year).toBeNull()

    // 检查张同学原帖的 linked_project_id 仍保持为 xuzhou-land-cover
    const rowAfter = database.prepare('SELECT linked_project_id FROM community_post WHERE id = ?').get(authorPostId)
    expect(rowAfter.linked_project_id).toBe('xuzhou-land-cover')
  })

  it('7. prevents duplicate moderation emails when admin clicks approve repeatedly', async () => {
    const modList = await harness.call('GET', '/api/fanxing/moderation/applications', { user: admin })
    const appItem = modList.payload.applications.find(a => a.userId === student.id && a.projectId === 'xuzhou-land-cover')
    const emailCountBefore = harness.sentEmails.length

    // 重复提交相同状态的审核通过请求，不应再次发送邮件
    const repeatApprove = await harness.call('POST', `/api/fanxing/moderation/applications/${appItem.id}`, {
      user: admin,
      body: {
        action: 'approve',
        reviewNote: appItem.reviewNote,
        collabQqGroup: appItem.collabQqGroup
      }
    })
    expect(repeatApprove.status).toBe(200)
    expect(repeatApprove.payload.deduplicated).toBe(true)
    expect(harness.sentEmails.length).toBe(emailCountBefore)
  })
})
