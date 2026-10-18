/**
 * 地理创新探究中心 - 核心状态管理与持久化模块
 * 支持本地离线存储、匿名草稿无缝漫游、提交版本控制、量规评价与导出分享
 */

import { reactive, computed, watch } from 'vue'
import { INQUIRY_TASKS, RUBRIC_DIMENSIONS } from './inquiryData.js'
import { apiRequest } from '../account/api.js'
import { accountEnabled } from '../account/config.js'

const STORAGE_KEY = 'geo-inquiry-hub-v2'
const REVIEW_STORAGE_KEY = 'geo-inquiry-reviews-v2'
let storageScope = 'anonymous'

function scopedKey(key) {
  return storageScope === 'anonymous' ? key : `${key}:${storageScope}`
}

function createDefaultDraft(taskId) {
  const task = INQUIRY_TASKS.find(t => t.id === taskId) || INQUIRY_TASKS[0]
  return {
    taskId: task.id,
    gradeLevel: task.defaultGrade || '高中',
    studentName: '匿名探究学生',
    status: 'draft', // draft | submitted | reviewed
    versionCount: 1,
    priorConceptions: '',
    initialHypothesis: '', // V1 初始假说
    variablesSetup: {
      independent: '',
      dependent: '',
      controlled: []
    },
    evidenceCards: [], // { id, timestamp, title, params: {}, observation: '', inference: '', confidence: 3, source: '', snapshot: '' }
    causalExplanation: '',
    counterExamples: '',
    modelLimitationsNotes: '',
    revisedConclusion: '', // V2 修订结论
    nextQuestions: '',
    aiFeedbackHistory: [], // { timestamp, prompt, advice, sourceTips: [] }
    isSubmitted: false,
    submittedAt: null,
    updatedAt: new Date().toISOString()
  }
}

// 内存反应式状态
export const inquiryState = reactive({
  activeTaskId: 'urban-flood',
  activeTab: 'workbench', // workbench | tasks | teacher | showcase | demo
  userRole: 'student', // student | teacher | demo
  userName: '探究学员',
  userId: 'local-anonymous-user',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncStatus: 'synced', // synced | saving | error | offline
  // 任务草稿字典：taskId -> draft
  drafts: {},
  // 历史版本快照字典：taskId -> [snapshots]
  versionHistory: {},
  // 教师评分字典：submissionId -> review
  reviews: {},
  // 课堂展示墙条目 (已脱敏)
  showcaseList: [],
  storageReady: false
})

// 初始化与本地加载
export async function initInquiryStore() {
  if (typeof window === 'undefined') return
  clearTimeout(saveTimeout)
  inquiryState.storageReady = false
  inquiryState.drafts = {}
  inquiryState.versionHistory = {}
  inquiryState.reviews = {}
  inquiryState.showcaseList = []
  inquiryState.activeTaskId = 'urban-flood'
  storageScope = 'anonymous'
  if (accountEnabled) {
    try {
      const session = await apiRequest('/api/auth/get-session')
      if (session?.user?.id) storageScope = `user:${session.user.id}`
    } catch {
      // Anonymous drafts retain their own local scope when the account service is unavailable.
    }
  }
  try {
    const raw = window.localStorage.getItem(scopedKey(STORAGE_KEY))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        if (parsed.drafts) inquiryState.drafts = parsed.drafts
        if (parsed.versionHistory) inquiryState.versionHistory = parsed.versionHistory
        if (parsed.activeTaskId) inquiryState.activeTaskId = parsed.activeTaskId
      }
    }
  } catch (err) {
    console.warn('[InquiryStore] Local storage read error:', err)
  }

  // 确保所有内置任务都有对应的默认草稿
  for (const task of INQUIRY_TASKS) {
    if (!inquiryState.drafts[task.id]) {
      inquiryState.drafts[task.id] = createDefaultDraft(task.id)
    }
  }

  // 读取教师批注
  try {
    const rawRev = window.localStorage.getItem(scopedKey(REVIEW_STORAGE_KEY))
    if (rawRev) {
      const parsedRev = JSON.parse(rawRev)
      if (parsedRev && typeof parsedRev === 'object') {
        inquiryState.reviews = parsedRev
      }
    }
  } catch (err) {
    console.warn('[InquiryStore] Review storage read error:', err)
  }
  inquiryState.storageReady = true

  // 监听网络状态
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => { inquiryState.isOnline = true })
    window.addEventListener('offline', () => { inquiryState.isOnline = false })
  }
}

// 保存当前草稿到本地存储
let saveTimeout = null
export function persistStore() {
  if (typeof window === 'undefined' || !inquiryState.storageReady) return
  inquiryState.syncStatus = 'saving'
  clearTimeout(saveTimeout)
  const draftKey = scopedKey(STORAGE_KEY)
  const reviewKey = scopedKey(REVIEW_STORAGE_KEY)
  saveTimeout = setTimeout(() => {
    try {
      const payload = {
        drafts: inquiryState.drafts,
        versionHistory: inquiryState.versionHistory,
        activeTaskId: inquiryState.activeTaskId
      }
      window.localStorage.setItem(draftKey, JSON.stringify(payload))
      window.localStorage.setItem(reviewKey, JSON.stringify(inquiryState.reviews))
      inquiryState.syncStatus = 'synced'
    } catch (err) {
      console.warn('[InquiryStore] Local storage write error:', err)
      inquiryState.syncStatus = 'error'
    }
  }, 300)
}

// 获取当前任务的草稿
export function getCurrentDraft() {
  const taskId = inquiryState.activeTaskId
  if (!inquiryState.drafts[taskId]) {
    inquiryState.drafts[taskId] = createDefaultDraft(taskId)
  }
  return inquiryState.drafts[taskId]
}

// 当前选中的任务对象
export const currentTask = computed(() => {
  return INQUIRY_TASKS.find(t => t.id === inquiryState.activeTaskId) || INQUIRY_TASKS[0]
})

// 添加一条实验证据卡
export function addEvidenceCard(cardData) {
  const draft = getCurrentDraft()
  const newCard = {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    title: cardData.title || `观测记录 #${draft.evidenceCards.length + 1}`,
    params: cardData.params || {},
    observation: cardData.observation || '', // 我观察到的客观数据/形态
    inference: cardData.inference || '', // 我推断的成因/趋势
    confidence: cardData.confidence || 3, // 1~5 星
    source: cardData.source || '交互仿真模型实测',
    snapshot: cardData.snapshot || '', // SVG/Canvas 截图或关键图表数据
    tag: cardData.tag || '控制实验'
  }
  draft.evidenceCards.unshift(newCard)
  draft.updatedAt = new Date().toISOString()
  persistStore()
  return newCard
}

// 移除证据卡
export function removeEvidenceCard(cardId) {
  const draft = getCurrentDraft()
  const idx = draft.evidenceCards.findIndex(c => c.id === cardId)
  if (idx !== -1) {
    draft.evidenceCards.splice(idx, 1)
    draft.updatedAt = new Date().toISOString()
    persistStore()
  }
}

// 创建版本快照 (例如在修改猜想前后)
export function createVersionSnapshot(changeSummary = '自动版本保存') {
  const draft = getCurrentDraft()
  const taskId = draft.taskId
  if (!inquiryState.versionHistory[taskId]) {
    inquiryState.versionHistory[taskId] = []
  }
  const versionNum = (inquiryState.versionHistory[taskId].length) + 1
  const snapshot = {
    versionNum,
    timestamp: new Date().toISOString(),
    changeSummary,
    initialHypothesis: draft.initialHypothesis,
    revisedConclusion: draft.revisedConclusion,
    causalExplanation: draft.causalExplanation,
    evidenceCount: draft.evidenceCards.length,
    fullData: JSON.parse(JSON.stringify(draft))
  }
  inquiryState.versionHistory[taskId].push(snapshot)
  draft.versionCount = versionNum
  persistStore()
  return snapshot
}

// 提交当前探究报告（连通真实服务端 API，处理未登录、断网与会话过期）
export async function submitCurrentInquiry(options = {}) {
  const draft = getCurrentDraft()
  createVersionSnapshot('提交最终探究成果')

  // 若未启用账号 API 服务（静态或离线模式）
  if (!accountEnabled) {
    draft.isSubmitted = true
    draft.status = 'local-draft'
    draft.submittedAt = new Date().toISOString()
    draft.updatedAt = draft.submittedAt
    persistStore()
    return {
      ok: true,
      status: 'offline-saved',
      versionCount: draft.versionCount,
      message: '当前运行于离线单机模式：探究报告已完整保存在本机浏览器草稿箱中（未连接教师服务）。'
    }
  }

  // 尝试向云端 API 提交
  try {
    const payload = {
      taskId: draft.taskId,
      classCode: options.classCode || draft.classCode || 'CLASS-DEFAULT',
      gradeLevel: draft.gradeLevel,
      initialHypothesis: draft.initialHypothesis,
      revisedConclusion: draft.revisedConclusion,
      causalExplanation: draft.causalExplanation,
      counterExamples: draft.counterExamples,
      modelLimitationsNotes: draft.modelLimitationsNotes,
      variablesSetup: draft.variablesSetup,
      evidenceCards: draft.evidenceCards,
      nextQuestions: draft.nextQuestions,
      showcaseConsent: Boolean(options.showcaseConsent || draft.showcaseConsent),
      status: 'submitted'
    }

    const data = await apiRequest('/api/inquiry/submissions', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    draft.isSubmitted = true
    draft.status = 'submitted'
    draft.submittedAt = data.updatedAt || new Date().toISOString()
    draft.updatedAt = draft.submittedAt
    draft.versionCount = data.versionCount || draft.versionCount
    inquiryState.syncStatus = 'synced'
    persistStore()

    return {
      ok: true,
      status: 'submitted',
      versionCount: draft.versionCount,
      message: data.assignedToClass
        ? `✓ 成功提交至任课教师工作台（版本 V${draft.versionCount}，时间：${new Date(draft.submittedAt).toLocaleTimeString()}）`
        : `✓ 已保存云端（版本 V${draft.versionCount}）。管理员分配班级后，任课教师才能查看。`
    }
  } catch (err) {
    const errMsg = err.message || ''
    inquiryState.syncStatus = 'error'

    // 针对不同错误给出精准提示
    if (errMsg.includes('请先登录') || errMsg.includes('401')) {
      return {
        ok: false,
        status: 'unauthenticated',
        message: '未登录学生账号：探究报告已安全保存在本地。若需正式提交给任课教师批阅，请先在右上角登录学生账号。'
      }
    }

    if (errMsg.includes('Failed to fetch') || !inquiryState.isOnline) {
      return {
        ok: false,
        status: 'offline',
        message: '网络连接异常：探究报告已安全保存在本机浏览器。待网络恢复后可直接再次点击提交。'
      }
    }

    return {
      ok: false,
      status: 'error',
      message: `提交受阻（${errMsg}）。本地探究记录完好无损，请检查网络或稍后重试。`
    }
  }
}

// 从服务端同步拉取云端草稿（具备冲突保护，绝不静默覆盖本地未保存作品）
export async function syncCloudDraft(taskId = inquiryState.activeTaskId) {
  if (!accountEnabled || typeof window === 'undefined') return null
  try {
    const data = await apiRequest('/api/inquiry/submissions')
    const cloudSubs = data?.submissions || []
    const cloudSub = cloudSubs.find(s => s.task_id === taskId)
    if (!cloudSub) return null

    const localDraft = inquiryState.drafts[taskId]
    const localTime = new Date(localDraft?.updatedAt || 0).getTime()
    const cloudTime = new Date(cloudSub.updated_at || 0).getTime()

    // 若云端更新且本地无冲突
    if (cloudTime > localTime) {
      let parsedVars = {}
      let parsedCards = []
      try { parsedVars = JSON.parse(cloudSub.variables_setup || '{}') } catch {}
      try { parsedCards = JSON.parse(cloudSub.evidence_records || '[]') } catch {}

      // 如果本地有未提交的差异文本，保留本地并记录冲突提示
      if (localDraft && localDraft.initialHypothesis && localDraft.initialHypothesis !== cloudSub.initial_hypothesis) {
        localDraft.cloudConflictNotice = `检测到云端存在更新记录（${new Date(cloudTime).toLocaleTimeString()}），已为您保留本地最新编辑。`
        return { conflict: true }
      }

      inquiryState.drafts[taskId] = {
        ...localDraft,
        taskId,
        gradeLevel: cloudSub.grade_level,
        status: cloudSub.status,
        versionCount: cloudSub.version_count,
        initialHypothesis: cloudSub.initial_hypothesis,
        revisedConclusion: cloudSub.revised_conclusion,
        causalExplanation: cloudSub.causal_explanation,
        counterExamples: cloudSub.counter_examples,
        modelLimitationsNotes: cloudSub.model_limitations,
        variablesSetup: parsedVars,
        evidenceCards: parsedCards,
        nextQuestions: cloudSub.next_questions,
        isSubmitted: cloudSub.status === 'submitted' || cloudSub.status === 'reviewed',
        updatedAt: cloudSub.updated_at
      }
      persistStore()
      return { synced: true }
    }
  } catch (err) {
    // 离线或未登录时不影响本地操作
    return null
  }
}

export async function syncStudentReviews() {
  if (!accountEnabled) return []
  const data = await apiRequest('/api/inquiry/reviews')
  const seenTasks = new Set()
  for (const row of data.reviews || []) {
    if (seenTasks.has(row.task_id)) continue
    seenTasks.add(row.task_id)
    let scores = {}
    try { scores = JSON.parse(row.scores || '{}') } catch {}
    inquiryState.reviews[row.task_id] = {
      taskId: row.task_id,
      submissionId: row.submission_id,
      teacherName: row.teacher_name,
      scores,
      totalWeightedScore: row.total_score,
      feedbackComment: row.feedback_comment,
      overrideAiAdvice: row.override_ai_advice,
      updatedAt: row.updated_at
    }
  }
  persistStore()
  return data.reviews || []
}

// 教师评分与反馈保存
export async function saveTeacherReview(taskId, reviewData) {
  const review = {
    taskId,
    submissionId: reviewData.submissionId || '',
    teacherName: reviewData.teacherName || '地理教研组',
    scores: reviewData.scores || {},
    totalWeightedScore: calculateWeightedScore(reviewData.scores || {}),
    feedbackComment: reviewData.feedbackComment || '',
    overrideAiAdvice: reviewData.overrideAiAdvice || '',
    isShowcased: Boolean(reviewData.isShowcased),
    isDemo: Boolean(reviewData.isDemo),
    updatedAt: new Date().toISOString()
  }
  // 若连接了服务端，同步调用教师批阅 API
  if (accountEnabled && !reviewData.isDemo) {
      await apiRequest('/api/inquiry/reviews', {
        method: 'POST',
        body: JSON.stringify({
          submissionId: reviewData.submissionId,
          taskId,
          scores: reviewData.scores,
          totalScore: review.totalWeightedScore,
          feedbackComment: review.feedbackComment,
          overrideAiAdvice: review.overrideAiAdvice,
          isShowcased: review.isShowcased
        })
      })
  }

  inquiryState.reviews[taskId] = review
  if (reviewData.isDemo) updateShowcaseEntry(taskId, review)
  persistStore()
  return review
}

function calculateWeightedScore(scores) {
  let total = 0
  for (const dim of RUBRIC_DIMENSIONS) {
    const val = scores[dim.id] || 0
    total += (val / 4) * dim.weight
  }
  return Math.round(total * 10) / 10
}

function updateShowcaseEntry(taskId, review) {
  const draft = inquiryState.drafts[taskId]
  if (!draft) return
  const existingIdx = inquiryState.showcaseList.findIndex(item => item.taskId === taskId)
  if (review.isShowcased) {
    const entry = {
      id: `showcase-${taskId}`,
      taskId,
      taskTitle: INQUIRY_TASKS.find(t => t.id === taskId)?.title || '',
      pseudonym: review.isDemo ? '演示样例学员 01号（演示数据）' : '授权展示学员（已脱敏）',
      gradeLevel: draft.gradeLevel,
      initialHypothesis: draft.initialHypothesis,
      revisedConclusion: draft.revisedConclusion,
      causalExplanation: draft.causalExplanation,
      counterExamples: draft.counterExamples,
      evidenceHighlights: (draft.evidenceCards || []).slice(0, 3),
      teacherScore: review.totalWeightedScore,
      teacherComment: review.feedbackComment,
      showcasedAt: new Date().toISOString(),
      isDemo: Boolean(review.isDemo)
    }
    if (existingIdx !== -1) {
      inquiryState.showcaseList[existingIdx] = entry
    } else {
      inquiryState.showcaseList.unshift(entry)
    }
  } else if (existingIdx !== -1) {
    inquiryState.showcaseList.splice(existingIdx, 1)
  }
}

// 预载入示范/演示数据 (用于发布会演练与评测)
export function loadExemplaryDraft(taskId) {
  const task = INQUIRY_TASKS.find(t => t.id === taskId)
  if (!task || !task.exemplaryWork) return
  const draft = getCurrentDraft()
  const ex = task.exemplaryWork
  draft.studentName = ex.author
  draft.initialHypothesis = ex.initialHypothesis
  draft.variablesSetup = {
    independent: '地表材质类型（水泥硬化路面 vs 天然林地草甸 vs 海绵透水铺装）',
    dependent: '地表径流峰值流量、产流历时与下渗积水量',
    controlled: ['降雨强度（暴雨50mm/h）', '降雨历时（60min）', '地形坡度（平地2°）']
  }
  draft.causalExplanation = ex.evidenceSummary
  draft.revisedConclusion = ex.revisedConclusion
  draft.counterExamples = ex.counterExampleAnalysis
  draft.modelLimitationsNotes = task.modelLimitations.join('\n')
  draft.nextQuestions = '在极端强对流暴雨云团快速移动且伴随大风时，海绵城市雨水花园的植物倒伏会否堵塞溢流口？需要怎样的工程巡检规程？'

  // 注入两张高标准示范证据卡
  draft.evidenceCards = [
    {
      id: `ev-demo-1`,
      timestamp: new Date().toISOString(),
      title: '工况一：水泥硬化路面暴雨产流响应',
      params: { 降雨强度: '50 mm/h', 地表材质: '普通水泥路面', 历时: '60 min', 下渗率: '5%' },
      observation: '产流历时仅8分钟即达到洪峰；地表积水深达115mm；径流系数测定为0.88。',
      inference: '硬化路面切断了自然土壤孔隙下渗，雨水几乎全部转化为瞬时地表超渗产流，极易诱发下沉立交桥积水。',
      confidence: 5,
      source: '城市暴雨下渗模拟台（单变量实验）',
      tag: '水泥硬化'
    },
    {
      id: `ev-demo-2`,
      timestamp: new Date().toISOString(),
      title: '工况二：海绵透水铺装与下沉绿地复合削峰',
      params: { 降雨强度: '50 mm/h', 地表材质: '透水铺装+雨水花园', 历时: '60 min', 下渗率: '55%' },
      observation: '产流历时延缓至26分钟；洪峰流量削减48%，积水滞蓄于碎石层未漫出路面。',
      inference: '透水砖与碎石垫层发挥了“渗、蓄、滞”作用，拉平了洪水历时曲线，避免了管网瞬间过载。',
      confidence: 5,
      source: '海绵城市水循环仿真测试',
      tag: '海绵改造'
    }
  ]
  createVersionSnapshot('载入教研示范成果数据')
  persistStore()
}

// 导出为格式化 Markdown
export function exportReportAsMarkdown(taskId = inquiryState.activeTaskId) {
  const task = INQUIRY_TASKS.find(t => t.id === taskId) || INQUIRY_TASKS[0]
  const draft = inquiryState.drafts[taskId] || createDefaultDraft(taskId)
  const review = inquiryState.reviews[taskId]

  let md = `# 地理创新探究成果报告：${task.title}\n\n`
  md += `> **探究任务**：${task.title}  \n`
  md += `> **学段分类**：${draft.gradeLevel}  \n`
  md += `> **探究人**：${draft.studentName}  \n`
  md += `> **完成时间**：${draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : '未提交'}  \n`
  md += `> **状态**：${draft.status === 'reviewed' ? '已获教师评价' : draft.isSubmitted ? '已提交' : '进行中草稿'}  \n\n`

  md += `## 一、驱动问题与探究起点\n`
  md += `**驱动问题**：${task.drivingQuestion}\n\n`

  md += `## 二、初始认知与原猜想 (Version 1)\n`
  md += `${draft.initialHypothesis || '（尚未记录初始猜想）'}\n\n`

  md += `## 三、变量控制与实验设计\n`
  md += `- **自变量**：${draft.variablesSetup?.independent || '未指定'}\n`
  md += `- **因变量**：${draft.variablesSetup?.dependent || '未指定'}\n`
  md += `- **控制变量**：${(draft.variablesSetup?.controlled || []).join('、') || '未指定'}\n\n`

  md += `## 四、关键实验证据链条 (${draft.evidenceCards.length} 条有效记录)\n`
  if (draft.evidenceCards.length === 0) {
    md += `*暂无记录的实验证据卡*\n\n`
  } else {
    draft.evidenceCards.forEach((c, idx) => {
      md += `### 证据 ${idx + 1}：${c.title}\n`
      md += `- **记录时间**：${new Date(c.timestamp).toLocaleTimeString()}（来源：${c.source}）\n`
      md += `- **实验参数**：${Object.entries(c.params || {}).map(([k, v]) => `${k}=${v}`).join(', ') || '标准条件'}\n`
      md += `- **【客观观察】**：${c.observation || '无具体观察值'}\n`
      md += `- **【合理解释】**：${c.inference || '无具体推断'}\n`
      md += `- **证据可信度**：${'★'.repeat(c.confidence)}${'☆'.repeat(5 - c.confidence)}\n\n`
    })
  }

  md += `## 五、因果机制解释\n`
  md += `${draft.causalExplanation || '（尚未撰写因果解释）'}\n\n`

  md += `## 六、反例思考与科学模型局限\n`
  md += `### 1. 例外条件与反例\n${draft.counterExamples || '（尚未探讨反例）'}\n\n`
  md += `### 2. 仿真模型的简化假设与边界\n${draft.modelLimitationsNotes || '（尚未记录模型局限）'}\n\n`

  md += `## 七、基于证据修订后的结论 (Version 2)\n`
  md += `${draft.revisedConclusion || '（尚未形成最终修订结论）'}\n\n`

  md += `## 八、延伸追问与迁移设想\n`
  md += `${draft.nextQuestions || '（暂无延伸追问）'}\n\n`

  if (review) {
    md += `---\n\n## 教师评价与量规鉴定\n`
    md += `> **评价教师**：${review.teacherName}  \n`
    md += `> **综合量规得分**：**${review.totalWeightedScore}** / 100 分  \n`
    md += `> **教师具体反馈**：${review.feedbackComment}\n\n`
  }

  return md
}

// 导出为可直接打印或预览的独立 HTML 格式
export function exportReportAsHtml(taskId = inquiryState.activeTaskId) {
  const md = exportReportAsMarkdown(taskId)
  const task = INQUIRY_TASKS.find(t => t.id === taskId) || INQUIRY_TASKS[0]
  // 简易渲染为美观排版的独立 HTML
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${task.title} - 地理创新探究成果报告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Serif SC", serif; line-height: 1.8; color: #1f2937; max-width: 860px; margin: 40px auto; padding: 0 24px; background: #fafaf8; }
    h1 { font-size: 26px; border-bottom: 2px solid #0f3b5b; padding-bottom: 12px; color: #0f3b5b; }
    h2 { font-size: 20px; color: #1e3a8a; margin-top: 32px; border-left: 4px solid #3b82f6; padding-left: 10px; }
    h3 { font-size: 16px; color: #374151; margin-top: 20px; }
    blockquote { background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 18px; margin: 16px 0; border-radius: 4px; }
    ul { padding-left: 20px; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    @media print { body { background: white; margin: 0; padding: 0; } }
  </style>
</head>
<body>
  ${md.replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\n\n/gim, '<p></p>')}
</body>
</html>`
}
