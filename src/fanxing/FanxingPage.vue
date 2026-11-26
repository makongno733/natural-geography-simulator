<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { accountEnabled, apiRequest, authClient } from '../account/client.js'
import {
  CURATED_GEO_PAPERS,
  INITIAL_FANXING_PROJECTS,
  normalizeAndValidateDoi,
  searchCrossrefLiterature
} from './catalog.js'
import { toast } from '../utils/toast.js'

const route = useRoute()
const router = useRouter()

const user = ref(null)
const isAdmin = ref(false)
const projects = ref([...INITIAL_FANXING_PROJECTS])
const projectDetail = ref(null)
const collaborators = ref([])
const linkedPosts = ref([])
const myApplications = ref([])
const loading = ref(false)
const detailLoading = ref(false)

const query = ref('')
const showingForm = ref(false)
const submitting = ref(false)
const submitError = ref('')
const submitNotice = ref('')
const hasUnsentDraft = ref(false)

const appForm = reactive({
  motivation: '',
  experience: '',
  preferredTask: '',
  weeklyTime: '',
  applicantContact: ''
})

// 发起新课题 / 引用社区讨论发起课题
const showProposeModal = ref(false)
const proposing = ref(false)
const proposeError = ref('')
const proposeForm = reactive({
  title: '',
  field: '遥感与土地利用',
  phase: '研究设计',
  question: '',
  method: '',
  role: '数据与文献协作者',
  commitment: '每周约 1–2 小时 · 欢迎新手',
  task: '',
  paperDoi: '',
  paperTitle: '',
  collabQqGroup: '',
  collabContact: '',
  sourcePostId: null
})

// Crossref 实时开放学术文献检索（区分精选目录、实时检索与离线回退，支持日期排序与期刊筛选）
const litQuery = ref('')
const litSort = ref('relevance')
const litFromYear = ref('')
const litOnlyJournal = ref(false)
const litPapers = ref([...CURATED_GEO_PAPERS])
const litLoading = ref(false)
const litSourceMode = ref('curated') // 'curated' | 'crossref' | 'offline'

const litSourceLabel = computed(() => {
  if (litSourceMode.value === 'crossref') {
    return 'Crossref 实时检索结果（api.crossref.org · 包含期刊论文、图书章节与会议录等，请点击 DOI 至原出版页核实同行评议状态）'
  }
  if (litSourceMode.value === 'offline') {
    return '离线回退（Crossref 暂不可达，当前仅从站内精选参考论文目录中匹配）'
  }
  return '精选课题参考论文目录（内置已核对 DOI 的经典地学与遥感文献，非自动更新流）'
})

// 清理旧版可能跨账号残留的缓存键，且仅按当前登录用户 ID 隔离保存尚未发送的表单输入草稿（绝不缓存审核状态或内部 QQ 群）
const LEGACY_APPS_KEY = 'geo_fanxing_applications_v1'
const LEGACY_PROJECTS_KEY = 'geo_fanxing_custom_projects_v1'

function purgeLegacyCaches() {
  try {
    localStorage.removeItem(LEGACY_APPS_KEY)
    localStorage.removeItem(LEGACY_PROJECTS_KEY)
  } catch {}
}

function getDraftStorageKey(projectId) {
  const uid = user.value?.id || 'guest'
  return `geo_fanxing_draft_v2_${uid}_${projectId}`
}

function loadFormDraft(projectId) {
  if (!projectId) return null
  try {
    const raw = localStorage.getItem(getDraftStorageKey(projectId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (user.value?.id && parsed.userId && parsed.userId !== user.value.id) return null
    return parsed
  } catch {
    return null
  }
}

function saveFormDraft(projectId) {
  if (!projectId) return
  try {
    localStorage.setItem(
      getDraftStorageKey(projectId),
      JSON.stringify({
        userId: user.value?.id || null,
        motivation: appForm.motivation,
        experience: appForm.experience,
        preferredTask: appForm.preferredTask,
        weeklyTime: appForm.weeklyTime,
        applicantContact: appForm.applicantContact,
        savedAt: new Date().toISOString()
      })
    )
    hasUnsentDraft.value = true
  } catch {}
}

function clearFormDraft(projectId) {
  if (!projectId) return
  try {
    localStorage.removeItem(getDraftStorageKey(projectId))
  } catch {}
  hasUnsentDraft.value = false
}

const currentProject = computed(() => {
  const targetId = route.params.id
  if (!targetId) return null
  if (projectDetail.value && projectDetail.value.id === targetId) {
    return projectDetail.value
  }
  return projects.value.find(item => item.id === targetId) || null
})

// 严格以服务器确认的当前登录用户身份为准展示申请状态与已解锁群号；未登录或跨账号绝不读取任何缓存状态
const currentApplication = computed(() => {
  if (!user.value?.id) return null
  const proj = currentProject.value
  if (!proj) return null
  if (proj.myApplication && (!proj.myApplication.userId || proj.myApplication.userId === user.value.id)) {
    return proj.myApplication
  }
  const fromList = myApplications.value.find(
    a => a.projectId === proj.id && (!a.userId || a.userId === user.value.id)
  )
  return fromList || null
})

const results = computed(() => {
  const kw = query.value.trim().toLowerCase()
  if (!kw) return projects.value
  return projects.value.filter(item =>
    [item.title, item.field, item.question, item.role, item.task]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(kw))
  )
})

async function loadProjectsCatalog() {
  loading.value = true
  try {
    if (accountEnabled) {
      const res = await apiRequest('/api/fanxing/projects')
      if (Array.isArray(res?.projects) && res.projects.length) {
        projects.value = res.projects.map(p => ({
          ...p,
          myApplication: user.value?.id && p.myApplication && (!p.myApplication.userId || p.myApplication.userId === user.value.id)
            ? p.myApplication
            : null
        }))
        if (user.value?.id) {
          const myRes = await apiRequest('/api/fanxing/my-applications').catch(() => null)
          myApplications.value = Array.isArray(myRes?.applications)
            ? myRes.applications.filter(a => !a.userId || a.userId === user.value.id)
            : []
        } else {
          myApplications.value = []
        }
        return
      }
    }
  } catch {
    projects.value = INITIAL_FANXING_PROJECTS.map(p => ({ ...p, myApplication: null }))
    myApplications.value = []
  } finally {
    loading.value = false
  }
}

let projectDetailLoadVersion = 0

async function loadProjectDetail(id) {
  const requestedId = String(id ?? '')
  const currentVersion = ++projectDetailLoadVersion
  if (!requestedId) {
    projectDetail.value = null
    collaborators.value = []
    linkedPosts.value = []
    return
  }
  detailLoading.value = true
  submitError.value = ''
  submitNotice.value = ''
  try {
    if (accountEnabled) {
      const res = await apiRequest(`/api/fanxing/projects/${encodeURIComponent(requestedId)}`)
      if (currentVersion !== projectDetailLoadVersion || String(route.params.id ?? '') !== requestedId) {
        return
      }
      if (res?.project) {
        const verifiedApp =
          user.value?.id &&
          res.project.myApplication &&
          (!res.project.myApplication.userId || res.project.myApplication.userId === user.value.id)
            ? res.project.myApplication
            : null
        projectDetail.value = {
          ...res.project,
          myApplication: verifiedApp
        }
        collaborators.value = Array.isArray(res.collaborators) ? res.collaborators : []
        linkedPosts.value = Array.isArray(res.linkedPosts) ? res.linkedPosts : []
        prefillFormFromProject(projectDetail.value)
        return
      }
    }
  } catch {
    if (currentVersion !== projectDetailLoadVersion || String(route.params.id ?? '') !== requestedId) {
      return
    }
    const fallback = projects.value.find(p => p.id === requestedId) || INITIAL_FANXING_PROJECTS.find(p => p.id === requestedId) || null
    projectDetail.value = fallback ? { ...fallback, myApplication: null } : null
    prefillFormFromProject(projectDetail.value)
  } finally {
    if (currentVersion === projectDetailLoadVersion && String(route.params.id ?? '') === requestedId) {
      detailLoading.value = false
    }
  }
}

function prefillFormFromProject(proj) {
  if (!proj) return
  const existing = currentApplication.value
  const draft = loadFormDraft(proj.id)
  if (draft && (draft.motivation || draft.experience)) {
    appForm.motivation = draft.motivation || ''
    appForm.experience = draft.experience || ''
    appForm.preferredTask = draft.preferredTask || (proj.tasks?.[0]?.title || proj.task || '')
    appForm.weeklyTime = draft.weeklyTime || ''
    appForm.applicantContact = draft.applicantContact || user.value?.email || ''
    hasUnsentDraft.value = true
  } else if (existing) {
    appForm.motivation = existing.motivation || ''
    appForm.experience = existing.experience || ''
    appForm.preferredTask = existing.preferredTask || (proj.tasks?.[0]?.title || proj.task || '')
    appForm.weeklyTime = existing.weeklyTime || '1–2 小时'
    appForm.applicantContact = existing.applicantContact || ''
    hasUnsentDraft.value = false
  } else {
    appForm.motivation = ''
    appForm.experience = ''
    appForm.preferredTask = proj.tasks?.[0]?.title || proj.task || ''
    appForm.weeklyTime = ''
    appForm.applicantContact = user.value?.email || ''
    hasUnsentDraft.value = false
  }
}

function openApplyForm() {
  const proj = currentProject.value
  if (!proj) return
  prefillFormFromProject(proj)
  showingForm.value = true
  submitError.value = ''
}

async function submitApplication() {
  const proj = currentProject.value
  if (!proj) return
  if (!appForm.motivation.trim() || !appForm.weeklyTime) {
    submitError.value = '请填写参与动机并选择每周可投入时间。'
    return
  }
  // 先保存为当前用户的本地草稿，防止跳转登录或网络异常丢失输入
  saveFormDraft(proj.id)

  if (!user.value && accountEnabled) {
    toast.info('已为你暂存填写的申请草稿，请先登录账号再正式提交至服务器。')
    window.location.href = `#/account?redirect=${encodeURIComponent(route.fullPath)}`
    return
  }

  submitting.value = true
  submitError.value = ''
  submitNotice.value = ''

  const payload = {
    motivation: appForm.motivation.trim(),
    experience: appForm.experience.trim() || '零基础 / 愿意按课题起步指南学习',
    preferredTask: appForm.preferredTask.trim() || proj.task,
    weeklyTime: appForm.weeklyTime,
    applicantContact: appForm.applicantContact.trim()
  }

  try {
    const res = await apiRequest(`/api/fanxing/projects/${encodeURIComponent(proj.id)}/apply`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    clearFormDraft(proj.id)
    if (projectDetail.value) {
      projectDetail.value = {
        ...projectDetail.value,
        myApplication: res.application
      }
    }
    showingForm.value = false
    submitNotice.value = '✓ 服务器已确认接收你的申请！当前状态为「待审核」，管理员审核通过后将发送通知并在此页自动解锁课题协作 QQ 群与起步指南。'
    toast.success('课题申请已成功发送至后台！')
    await loadProjectsCatalog()
  } catch (err) {
    // 严格遵守：服务器请求失败时绝不伪造 pending 待审核状态，保持表单开启并明确标示为“本地草稿 · 尚未发送”
    showingForm.value = true
    hasUnsentDraft.value = true
    submitError.value = `申请尚未发送成功（填写内容已保存在当前浏览器的本地草稿，管理员尚未收到）。原因：${err.message || '服务器暂未响应'}。请点击下方「重新发送申请」重试。`
  } finally {
    submitting.value = false
  }
}

async function runLiteratureSearch() {
  litLoading.value = true
  try {
    const q = litQuery.value.trim()
    if (!q) {
      let list = [...CURATED_GEO_PAPERS]
      if (litFromYear.value && /^\d{4}$/.test(litFromYear.value)) {
        const minY = Number(litFromYear.value)
        list = list.filter(p => (p.year || 0) >= minY)
      }
      if (litSort.value === 'newest') {
        list.sort((a, b) => (b.year || 0) - (a.year || 0))
      }
      litPapers.value = list
      litSourceMode.value = 'curated'
      return
    }
    const papers = await searchCrossrefLiterature(q, {
      rows: 6,
      sort: litSort.value,
      fromYear: litFromYear.value || null,
      onlyJournalArticles: litOnlyJournal.value
    })
    litPapers.value = papers
    litSourceMode.value = 'crossref'
  } catch {
    const kw = litQuery.value.trim().toLowerCase()
    litPapers.value = CURATED_GEO_PAPERS.filter(
      p => p.title.toLowerCase().includes(kw) || p.topic.toLowerCase().includes(kw)
    )
    litSourceMode.value = 'offline'
  } finally {
    litLoading.value = false
  }
}

function discussProjectInCommunity(proj) {
  if (!proj) return
  const draftPayload = {
    kind: 'discussion',
    categoryId: 7,
    title: `【繁星课题协作 · ${proj.title}】阶段观察与文献笔记`,
    body:
      `【关联繁星课题】${proj.title}（#/${proj.id}）\n` +
      `【承担微任务】${currentApplication.value?.preferredTask || proj.task}\n` +
      `【核心研究问题】${proj.question}\n\n` +
      `【我的观察记录 / 文献摘录】：\n1. 样本或文献来源：\n2. 判读依据与发现：\n3. 仍存疑或需团队复核之处：`,
    linkedProject: proj.id,
    paperDoi: proj.papers?.[0]?.doi || '',
    paperTitle: proj.papers?.[0]?.title || '',
    tagsInput: `繁星计划, ${proj.field}, 课题协作`
  }
  try {
    sessionStorage.setItem('geo_pending_compose_payload', JSON.stringify(draftPayload))
  } catch {}
  router.push({
    path: '/',
    query: {
      compose: '1',
      linkedProject: proj.id
    },
    hash: '#compose'
  })
}

function discussPaperInCommunity(paper) {
  if (!paper) return
  const draftPayload = {
    kind: 'discussion',
    categoryId: 7,
    title: `【文献研读】${paper.title.slice(0, 75)}`,
    body:
      `【文献标题】${paper.title}\n` +
      `【文献类型】${paper.workTypeLabel || 'DOI 注册出版物'}\n` +
      `【作者与年份】${paper.authors} (${paper.year || '年份见原文'})\n` +
      `【来源出版物】${paper.journal}\n` +
      `【DOI 核验链接】https://doi.org/${paper.doi}\n\n` +
      `【研究方法与核心结论摘录】：\n\n` +
      `【结合本站实验或区域案例的思考】：`,
    linkedProject: paper.projectId || '',
    paperDoi: paper.doi,
    paperTitle: paper.title,
    tagsInput: `文献研读, DOI文献, ${paper.topic || '地理学研究'}`
  }
  try {
    sessionStorage.setItem('geo_pending_compose_payload', JSON.stringify(draftPayload))
  } catch {}
  router.push({
    path: '/',
    query: { compose: '1' },
    hash: '#compose'
  })
}

function openProposeWithPaper(paper) {
  proposeForm.title = ''
  proposeForm.question = ''
  proposeForm.method = ''
  proposeForm.task = ''
  proposeForm.paperDoi = paper?.doi || ''
  proposeForm.paperTitle = paper?.title || ''
  proposeForm.sourcePostId = null
  proposeError.value = ''
  showProposeModal.value = true
}

async function submitNewProject() {
  if (!proposeForm.title.trim() || !proposeForm.question.trim() || !proposeForm.method.trim() || !proposeForm.task.trim()) {
    proposeError.value = '请完整填写课题名称、研究问题、研究方法与首项协作微任务。'
    return
  }
  if (proposeForm.paperDoi.trim()) {
    const validDoi = normalizeAndValidateDoi(proposeForm.paperDoi)
    if (!validDoi) {
      proposeError.value = '关联参考文献的 DOI 格式无效，应以 10.xxxx/ 开头（例如 10.5194/essd-13-3907-2021）。'
      return
    }
    proposeForm.paperDoi = validDoi
  }

  if (!user.value && accountEnabled) {
    toast.info('请先登录账号后再发起新课题草案。')
    window.location.href = `#/account?redirect=${encodeURIComponent(route.fullPath)}`
    return
  }
  proposing.value = true
  proposeError.value = ''
  try {
    const res = await apiRequest('/api/fanxing/projects', {
      method: 'POST',
      body: JSON.stringify(proposeForm)
    })
    showProposeModal.value = false
    toast.success('新繁星课题已创建并开启招募！')
    await loadProjectsCatalog()
    if (res?.project?.id) {
      await router.push(`/fanxing/${res.project.id}`)
    }
  } catch (err) {
    // 严格遵守：创建课题失败时不伪造本地成功，保留弹窗内草稿并提示重试
    proposeError.value = `课题尚未发布成功（你填写的草案仍保留在当前表单中）。原因：${err.message || '服务器暂未响应'}。请核对后点击重试。`
  } finally {
    proposing.value = false
  }
}

function checkProposeFromQuery() {
  const q = route.query || {}
  if (q.propose === '1' || q.fromPost) {
    proposeForm.title = typeof q.title === 'string' ? q.title : ''
    proposeForm.question = typeof q.question === 'string' ? q.question : ''
    proposeForm.method = typeof q.method === 'string' ? q.method : ''
    proposeForm.task = typeof q.task === 'string' ? q.task : '核查讨论中的关键证据卡并补充相关 DOI 文献对比'
    proposeForm.paperDoi = typeof q.paperDoi === 'string' ? q.paperDoi : ''
    proposeForm.paperTitle = typeof q.paperTitle === 'string' ? q.paperTitle : ''
    proposeForm.sourcePostId = q.fromPost ? Number(q.fromPost) || null : null
    proposeError.value = ''
    showProposeModal.value = true
  }
}

watch(
  () => route.params.id,
  newId => {
    showingForm.value = false
    submitError.value = ''
    submitNotice.value = ''
    void loadProjectDetail(newId)
  }
)

watch(() => route.query, checkProposeFromQuery)

onMounted(async () => {
  purgeLegacyCaches()
  if (accountEnabled) {
    const session = await authClient.getSession().catch(() => null)
    user.value = session?.data?.user || null
    if (user.value) {
      const me = await apiRequest('/api/community/me').catch(() => null)
      isAdmin.value = Boolean(me?.isAdmin)
    }
  }
  await loadProjectsCatalog()
  if (route.params.id) {
    await loadProjectDetail(route.params.id)
  }
  checkProposeFromQuery()
})
</script>

<template>
  <main class="fanxing">
    <header class="fanxing-hero">
      <div class="fanxing-hero-top">
        <router-link :to="route.params.id ? '/fanxing' : '/'" class="back">
          ← {{ route.params.id ? '返回繁星课题大厅' : '返回地理共同体首页' }}
        </router-link>
        <div class="hero-top-actions">
          <router-link v-if="isAdmin" to="/community/manage" class="hero-admin-link">
            🛡 课题申请管理后台 →
          </router-link>
          <button type="button" class="hero-propose-btn" @click="showProposeModal = true">
            + 发起新课题 / 转化讨论
          </button>
        </div>
      </div>

      <p class="hero-tag">
        🌟 繁星计划 · 开放地理科研协作（融合 HOT Tasking Manager 微任务与 Crossref DOI 文献检索）
      </p>
      <h1>{{ currentProject?.title || (route.params.id ? '课题未找到' : '繁星计划 · 地理科研协作大厅') }}</h1>
      <p class="hero-lead">
        {{
          currentProject?.question ||
          (route.params.id
            ? '返回课题大厅浏览其他正在招募的地理探究课题。'
            : '浏览课题与 DOI 参考文献 → 提交参与申请 → 管理员审核通过后解锁专属协作群与起步指南 → 结合站内 3D 与遥感实验室开展微任务。')
        }}
      </p>

      <div class="workflow-steps" aria-label="繁星计划科研参与流程">
        <span>① 浏览课题与参考文献</span>
        <span aria-hidden="true">→</span>
        <span>② 填写动机/经验/任务并提交申请</span>
        <span aria-hidden="true">→</span>
        <span>③ 管理员后台审核</span>
        <span aria-hidden="true">→</span>
        <span>④ 通过后自动解锁 QQ 群与起步指南</span>
        <span aria-hidden="true">→</span>
        <span>⑤ 提交实证观察与文献笔记</span>
      </div>
    </header>

    <!-- 单个课题详情页 -->
    <template v-if="currentProject">
      <div class="detail">
        <!-- 左侧：课题研究方法、规划微任务、真实 DOI 文献库、关联社区讨论 -->
        <div class="detail-main-col">
          <section class="panel">
            <div class="panel-head-row">
              <p class="tag">{{ currentProject.field }} · 当前阶段：{{ currentProject.phase }}</p>
              <span class="status-pill status-recruiting">🟢 正在招募协作者</span>
            </div>

            <h2>核心研究问题</h2>
            <p class="highlight-question">{{ currentProject.question }}</p>

            <h2>研究方法与技术路线</h2>
            <p>{{ currentProject.method }}</p>

            <div v-if="currentProject.linkedLabUrl" class="linked-lab-callout">
              <div>
                <strong>🔬 配套站内互动实验室：</strong>
                <span>{{ currentProject.linkedLabTitle || '真实数据与 3D 实验室' }}</span>
              </div>
              <router-link :to="currentProject.linkedLabUrl" class="baroque-btn baroque-btn-sm">
                打开配套实验室先做一次观察 →
              </router-link>
            </div>
          </section>

          <!-- 微任务拆解（仅展示规划分工与服务器真实入组/讨论计数，不预设虚构完成数量） -->
          <section class="panel" aria-labelledby="microtasks-heading">
            <div class="panel-head-row">
              <h2 id="microtasks-heading">📋 课题规划微任务与分工说明</h2>
              <span class="real-activity-badge">
                已入组协作者 {{ collaborators.length || currentProject.approvedCount || 0 }} 人 · 已关联讨论 {{ linkedPosts.length || currentProject.linkedDiscussionsCount || 0 }} 篇
              </span>
            </div>
            <p class="panel-sub">
              参考 HOT Tasking Manager 开源微任务模式拆解。你可以选择下面任意一项规划微任务申请加入，实际产出以下方关联讨论区公开发布的观察记录为准：
            </p>

            <div v-if="currentProject.tasks && currentProject.tasks.length" class="task-list">
              <article v-for="t in currentProject.tasks" :key="t.id" class="task-item">
                <div class="task-item-top">
                  <strong>{{ t.title }}</strong>
                  <span class="task-role-badge">{{ t.role }} · {{ t.difficulty }}</span>
                </div>
                <p class="task-planned-target">
                  📌 {{ t.plannedTarget || '规划任务：按课题指南提交可复现观察证据卡或文献摘录' }}
                </p>
              </article>
            </div>
            <p v-else>{{ currentProject.task }}</p>
          </section>

          <!-- 课题参考文献与开放数据集 -->
          <section class="panel" aria-labelledby="papers-heading">
            <div class="panel-head-row">
              <h2 id="papers-heading">📚 课题参考文献与开放数据源</h2>
              <span class="verified-badge">✓ DOI 来源链接可核对</span>
            </div>
            <p class="panel-sub">
              以下为本课题参考的<strong>公开发表学术文献与官方开放科学数据集</strong>（点击 DOI 可跳转国际 DOI 基金会对应出版物页面核对原文）：
            </p>

            <div v-if="currentProject.papers && currentProject.papers.length" class="papers-list">
              <article v-for="paper in currentProject.papers" :key="paper.doi || paper.title" class="paper-card">
                <div class="paper-meta-top">
                  <span class="paper-type-tag">{{ paper.workTypeLabel || '期刊论文' }}</span>
                  <span class="paper-journal">
                    {{ paper.journal }}
                    <template v-if="paper.year">({{ paper.year }})</template>
                  </span>
                </div>
                <h3>{{ paper.title }}</h3>
                <p class="paper-authors">作者：{{ paper.authors }}</p>
                <p v-if="paper.note" class="paper-note">{{ paper.note }}</p>
                <div class="paper-actions">
                  <a
                    :href="paper.url || `https://doi.org/${paper.doi}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="doi-link"
                  >
                    🔗 核对 DOI: {{ paper.doi }} ↗
                  </a>
                  <button type="button" class="text-action-btn" @click="discussPaperInCommunity(paper)">
                    💬 围绕该文献发帖讨论 →
                  </button>
                </div>
              </article>
            </div>
            <p v-else class="muted-note">本课题暂无预置文献，可在繁星大厅使用 Crossref 检索工具查找。</p>

            <div v-if="currentProject.datasets && currentProject.datasets.length" class="datasets-block">
              <h3>🛰 关联开放科学数据集</h3>
              <ul class="dataset-list">
                <li v-for="ds in currentProject.datasets" :key="ds.name">
                  <a :href="ds.url" target="_blank" rel="noopener noreferrer" class="dataset-link">{{ ds.name }} ↗</a>
                  <small class="ds-license">许可协议：{{ ds.license }}</small>
                </li>
              </ul>
            </div>
          </section>

          <!-- 本课题关联的社区讨论与阶段观察记录 -->
          <section class="panel" aria-labelledby="linked-posts-heading">
            <div class="panel-head-row">
              <h2 id="linked-posts-heading">💬 课题关联讨论与阶段性观察记录</h2>
              <button
                type="button"
                class="baroque-btn baroque-btn-sm baroque-btn-primary"
                @click="discussProjectInCommunity(currentProject)"
              >
                ✍️ 围绕本课题发布讨论 / 提交观察记录 →
              </button>
            </div>
            <p class="panel-sub">成员发布的关联讨论、遥感判读与实验证据卡都会汇总于此，公开可查：</p>

            <div v-if="linkedPosts.length" class="linked-posts-list">
              <router-link
                v-for="p in linkedPosts"
                :key="p.id"
                :to="`/community/post/${p.id}`"
                class="linked-post-item"
              >
                <div class="lp-top">
                  <span class="lp-kind">{{ p.kind === 'question' ? '提问' : '阶段探讨' }}</span>
                  <strong>{{ p.title }}</strong>
                </div>
                <p v-if="p.excerpt" class="lp-excerpt">{{ p.excerpt }}</p>
                <div class="lp-meta">
                  <span>👤 {{ p.author }}</span>
                  <span v-if="p.paperDoi">· 📄 DOI: {{ p.paperDoi }}</span>
                  <span>· 回复 {{ p.replyCount || 0 }}</span>
                </div>
              </router-link>
            </div>
            <p v-else class="muted-note">
              暂未有直接挂载本课题的讨论帖。点击右上角「围绕本课题发布讨论」即可提交第 1 篇实证观察或文献笔记！
            </p>
          </section>
        </div>

        <!-- 右侧：申请参与科研、审核状态反馈、通过后解锁联系方式/入群说明 -->
        <aside class="detail-side-col">
          <section class="panel application-panel">
            <p class="tag">招募角色：{{ currentProject.role }}</p>
            <h2>申请参与课题协作</h2>
            <p class="commitment-line">⏱ {{ currentProject.commitment }}</p>
            <p class="first-task-box">
              <strong>加入后的首项任务：</strong>{{ currentProject.task }}
            </p>

            <p v-if="submitNotice" class="app-notice" role="status">{{ submitNotice }}</p>
            <div v-if="submitError" class="app-error" role="alert">
              <p style="margin: 0 0 8px">{{ submitError }}</p>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
                <span class="draft-status-pill">📝 本地草稿 · 尚未发送至服务器</span>
                <button type="button" class="baroque-btn baroque-btn-sm baroque-btn-primary" :disabled="submitting" @click="submitApplication">
                  🔄 重新发送申请
                </button>
              </div>
            </div>

            <!-- 状态 1：服务器已确认的当前登录用户申请记录 -->
            <div v-if="currentApplication && !showingForm" class="my-app-status-card" :class="`status-${currentApplication.status}`">
              <div class="status-header">
                <span class="status-label">我的申请状态（服务器已确认）：</span>
                <strong v-if="currentApplication.status === 'approved'" class="badge-approved">✅ 审核已通过</strong>
                <strong v-else-if="currentApplication.status === 'rejected'" class="badge-rejected">❌ 暂未通过</strong>
                <strong v-else class="badge-pending">⏳ 已提交 · 待管理员审核</strong>
              </div>

              <dl class="app-summary-dl">
                <div>
                  <dt>申请人</dt>
                  <dd>{{ currentApplication.applicantName || user?.name }}</dd>
                </div>
                <div>
                  <dt>认领任务</dt>
                  <dd>{{ currentApplication.preferredTask }}</dd>
                </div>
                <div>
                  <dt>每周投入</dt>
                  <dd>{{ currentApplication.weeklyTime }}</dd>
                </div>
                <div>
                  <dt>参与动机</dt>
                  <dd>{{ currentApplication.motivation }}</dd>
                </div>
              </dl>

              <!-- 审核通过后自动解锁的联系方式、QQ群与起步说明（仅服务器确认 approved 时显示） -->
              <div v-if="currentApplication.status === 'approved' && currentApplication.collabChannel" class="unlocked-collab-box">
                <h3>🎉 协作通道已为你解锁</h3>
                <p v-if="currentApplication.reviewNote" class="review-note-box">
                  <strong>管理员审核意见：</strong>{{ currentApplication.reviewNote }}
                </p>
                <div class="channel-item">
                  <span>💬 课题组联系渠道 / QQ 群：</span>
                  <strong>{{ currentApplication.collabChannel.qqGroup || '请见审核留言或社区社群导航（/#/groups）' }}</strong>
                </div>
                <div v-if="currentApplication.collabChannel.contact" class="channel-item">
                  <span>📮 课题对接说明：</span>
                  <span>{{ currentApplication.collabChannel.contact }}</span>
                </div>
                <div v-if="currentApplication.collabChannel.onboardingGuide" class="onboarding-guide">
                  <strong>🚀 新手起步三步曲：</strong>
                  <pre>{{ currentApplication.collabChannel.onboardingGuide }}</pre>
                </div>
                <button
                  type="button"
                  class="baroque-btn baroque-btn-primary full-width-btn"
                  @click="discussProjectInCommunity(currentProject)"
                >
                  ✍️ 立即去社区提交首篇课题观察记录 →
                </button>
              </div>

              <!-- 待审核提示 -->
              <div v-else-if="currentApplication.status === 'pending'" class="pending-help-box">
                <p>
                  你的申请已保存到服务器后台数据库。管理员会在<strong>「社区管理 → 繁星课题申请审核」</strong>中审核；通过后将发邮件通知你并在此卡片自动显示课题 QQ 群与起步说明。
                </p>
                <button type="button" class="text-action-btn" @click="openApplyForm">
                  ✏️ 修改我的申请信息
                </button>
              </div>

              <!-- 驳回后可修改重提 -->
              <div v-else class="rejected-help-box">
                <p v-if="currentApplication.reviewNote">
                  <strong>审核反馈：</strong>{{ currentApplication.reviewNote }}
                </p>
                <button type="button" class="baroque-btn baroque-btn-sm" @click="openApplyForm">
                  补充信息并重新提交申请
                </button>
              </div>
            </div>

            <!-- 状态 2：填写申请表单（含动机、相关经验、希望承担的任务、可投入时间、联系方式） -->
            <form v-else-if="showingForm" class="apply-form" @submit.prevent="submitApplication">
              <div v-if="hasUnsentDraft" class="draft-banner" role="status">
                <span>📝 当前内容为<strong>本地草稿（尚未发送至服务器）</strong>，请点击下方按钮正式提交。</span>
              </div>

              <label>
                1. 希望承担的具体任务
                <select v-model="appForm.preferredTask" required @change="saveFormDraft(currentProject.id)">
                  <option
                    v-for="t in (currentProject.tasks?.length ? currentProject.tasks : [{ id: 'default', title: currentProject.task }])"
                    :key="t.id"
                    :value="t.title"
                  >
                    {{ t.title }}
                  </option>
                </select>
              </label>

              <label>
                2. 参与动机（为什么想研究这个问题？）
                <textarea
                  v-model="appForm.motivation"
                  placeholder="例如：我对遥感影像判读和城市土地覆盖变化很感兴趣，希望能协助完成抽样网格的目视核查……"
                  required
                  maxlength="500"
                  rows="3"
                  @input="saveFormDraft(currentProject.id)"
                />
              </label>

              <label>
                3. 相关经验（零基础也欢迎如实填写）
                <textarea
                  v-model="appForm.experience"
                  placeholder="例如：学过高中/大学自然地理，用过本站的卫星卷帘实验室（或熟悉 Excel / QGIS / 文献检索）"
                  required
                  maxlength="500"
                  rows="2"
                  @input="saveFormDraft(currentProject.id)"
                />
              </label>

              <label>
                4. 每周可投入时间
                <select v-model="appForm.weeklyTime" required @change="saveFormDraft(currentProject.id)">
                  <option value="" disabled>请选择每周可投入时间</option>
                  <option value="1 小时以内">1 小时以内</option>
                  <option value="1–2 小时">1–2 小时</option>
                  <option value="2–4 小时">2–4 小时</option>
                  <option value="4 小时以上">4 小时以上</option>
                </select>
              </label>

              <label>
                5. 你的联系渠道（选填，仅课题审核管理员可见，便于通过后拉群对接）
                <input
                  v-model="appForm.applicantContact"
                  type="text"
                  maxlength="100"
                  placeholder="例如：邮箱 / QQ 号 / 微信号"
                  @input="saveFormDraft(currentProject.id)"
                />
              </label>

              <div class="form-btn-row">
                <button
                  type="submit"
                  class="baroque-btn baroque-btn-primary"
                  :disabled="submitting || !appForm.motivation.trim() || !appForm.weeklyTime"
                >
                  {{ submitting ? '正在发送至服务器…' : '提交课题申请（发送至后台审核）' }}
                </button>
                <button type="button" class="baroque-btn" @click="showingForm = false">取消</button>
              </div>
            </form>

            <!-- 状态 3：初始申请按钮 -->
            <div v-else class="initial-apply-cta">
              <div v-if="hasUnsentDraft" class="draft-banner" style="margin-bottom: 10px">
                <span>📝 你有一份<strong>尚未发送的本地申请草稿</strong>。</span>
              </div>
              <button class="baroque-btn baroque-btn-primary full-width-btn" type="button" @click="openApplyForm">
                {{ hasUnsentDraft ? '✍️ 继续编辑并发送申请草稿' : '✍️ 填写并提交科研参与申请' }}
              </button>
              <p class="cta-sub-note">
                {{
                  user
                    ? `当前以「${user.name}」身份申请，服务器确认接收后可在本页及个人主页查看审核进度。`
                    : '提示：点击可先填写草稿，正式提交时需登录账号，以便服务器记录申请人并向你发送审核结果。'
                }}
              </p>
            </div>
          </section>

          <!-- 已加入协作者名单 -->
          <section class="panel collaborators-panel">
            <h3>👥 课题协作团队（已通过审核 {{ collaborators.length || currentProject.approvedCount || 0 }} 人）</h3>
            <ul v-if="collaborators.length" class="collab-list">
              <li v-for="c in collaborators" :key="c.userId + c.joinedAt">
                <router-link :to="`/community/user/${c.userId}`">👤 {{ c.name }}</router-link>
                <small>{{ c.preferredTask }}</small>
              </li>
            </ul>
            <p v-else class="muted-note">目前课题正在招募协作者，审核通过后成员昵称与认领任务将展示在此。</p>
          </section>
        </aside>
      </div>
    </template>

    <!-- 课题大厅列表页 -->
    <template v-else-if="!route.params.id">
      <!-- 仅当当前用户已登录且服务器返回了该用户的真实申请记录时展示 -->
      <section v-if="user && myApplications.length" class="my-apps-overview panel" aria-labelledby="my-apps-heading">
        <h2 id="my-apps-heading">📬 我的繁星课题申请与审核结果</h2>
        <div class="my-apps-grid">
          <article v-for="app in myApplications" :key="app.projectId" class="my-app-mini-card">
            <div class="mini-top">
              <strong>{{ app.projectTitle || app.projectId }}</strong>
              <span class="mini-status" :class="`st-${app.status}`">
                {{ app.status === 'approved' ? '✅ 已通过' : app.status === 'rejected' ? '❌ 未通过' : '⏳ 待审核' }}
              </span>
            </div>
            <p class="mini-task">认领任务：{{ app.preferredTask }}（每周 {{ app.weeklyTime }}）</p>
            <p v-if="app.status === 'approved' && app.collabChannel" class="mini-unlocked">
              🎉 <strong>已解锁协作渠道：</strong>{{ app.collabChannel.qqGroup }}
              <span v-if="app.reviewNote"> · 审核留言：{{ app.reviewNote }}</span>
            </p>
            <router-link :to="`/fanxing/${app.projectId}`" class="text-action-btn">
              查看课题详情与协作指引 →
            </router-link>
          </article>
        </div>
      </section>

      <section class="catalog" aria-labelledby="fanxing-catalog">
        <div class="catalog-header">
          <div>
            <h2 id="fanxing-catalog">正在招募的地理科研课题</h2>
            <p class="muted-note">每个课题均配有明确的研究问题、规划微任务、站内配套实验室与可核对的 DOI 参考文献。</p>
          </div>
          <label class="search">
            <span class="sr-only">搜索课题</span>
            <input v-model="query" type="search" placeholder="搜索课题名称、研究方向、遥感/热岛/内涝或招募角色…" />
          </label>
        </div>

        <p v-if="!results.length" role="status">没有匹配的课题，试试其他关键词，或点击右上角发起新课题草案。</p>

        <div class="cards">
          <article v-for="item in results" :key="item.id" class="panel project-card">
            <div class="card-top-badges">
              <span class="tag">{{ item.field }} · {{ item.phase }}</span>
              <span v-if="user && item.myApplication" class="my-app-pill" :class="`st-${item.myApplication.status}`">
                {{
                  item.myApplication.status === 'approved'
                    ? '✓ 已加入课题组'
                    : item.myApplication.status === 'rejected'
                      ? '申请未通过'
                      : '⏳ 申请待审核'
                }}
              </span>
              <span v-else class="recruiting-pill">🟢 开放申请</span>
            </div>

            <h3>{{ item.title }}</h3>
            <p class="card-question"><strong>研究问题：</strong>{{ item.question }}</p>
            <p class="card-task"><strong>首项微任务：</strong>{{ item.task }}</p>

            <div class="card-meta-stats">
              <span>👤 招募：{{ item.role }}</span>
              <span>⏱ {{ item.commitment }}</span>
              <span>📚 {{ item.papers?.length || 2 }} 篇参考 DOI 文献</span>
            </div>

            <div class="card-actions">
              <router-link :to="{ name: 'fanxing-project', params: { id: item.id } }" class="baroque-btn baroque-btn-primary">
                查看课题详情与申请加入 →
              </router-link>
              <button type="button" class="baroque-btn" @click="discussProjectInCommunity(item)">
                💬 参与课题讨论
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- 开放学术文献实时检索专栏（区分精选目录、Crossref 实时检索与文献类型，支持按时间排序和筛选） -->
      <section class="literature-hub panel" aria-labelledby="lit-hub-heading">
        <div class="lit-hub-header">
          <div>
            <p class="tag">📖 开放学术文献检索（Crossref DOI 元数据接口）</p>
            <h2 id="lit-hub-heading">检索地理学 DOI 出版物并发起讨论</h2>
            <p class="muted-note">
              接入 Crossref 开放学术元数据接口（<code>api.crossref.org/works</code>）。<strong>提示：</strong>拥有 DOI 仅代表该出版物已在国际 DOI 系统注册（包含期刊论文、图书章节、会议论文或更正声明等），不代表本站已人工复核其同行评议质量，请点击 DOI 链接至原出版平台核实。
            </p>
          </div>
        </div>

        <form class="lit-search-bar" @submit.prevent="runLiteratureSearch">
          <input
            v-model.trim="litQuery"
            type="search"
            placeholder="输入中英文研究关键词，例如：城市热岛 遥感 / urban flood sponge city / land cover change…"
            aria-label="检索 Crossref 地理学术文献"
          />
          <select v-model="litSort" aria-label="文献排序方式" class="lit-filter-select" @change="runLiteratureSearch">
            <option value="relevance">按相关度排序</option>
            <option value="newest">按发表时间（最新优先）</option>
          </select>
          <select v-model="litFromYear" aria-label="发表年份范围" class="lit-filter-select" @change="runLiteratureSearch">
            <option value="">全部发表年份</option>
            <option value="2023">2023 年以来</option>
            <option value="2020">2020 年以来</option>
            <option value="2015">2015 年以来</option>
          </select>
          <label class="lit-checkbox-label">
            <input v-model="litOnlyJournal" type="checkbox" @change="runLiteratureSearch" />
            <span>仅看期刊论文</span>
          </label>
          <button type="submit" class="baroque-btn baroque-btn-primary" :disabled="litLoading">
            {{ litLoading ? '检索 Crossref 中…' : '🔍 检索 DOI 文献' }}
          </button>
          <button
            v-if="litQuery || litFromYear || litOnlyJournal || litSort !== 'relevance'"
            type="button"
            class="baroque-btn"
            @click="litQuery = ''; litFromYear = ''; litOnlyJournal = false; litSort = 'relevance'; runLiteratureSearch()"
          >
            重置为精选文献目录
          </button>
        </form>

        <div class="lit-quick-tags">
          <span>快捷检索方向：</span>
          <button
            type="button"
            class="chip-btn"
            :class="{ active: litQuery === 'urban heat island green space remote sensing' }"
            @click="litQuery = 'urban heat island green space remote sensing'; runLiteratureSearch()"
          >
            城市绿地降温与热岛
          </button>
          <button
            type="button"
            class="chip-btn"
            :class="{ active: litQuery === 'sponge city urban flood runoff' }"
            @click="litQuery = 'sponge city urban flood runoff'; runLiteratureSearch()"
          >
            海绵城市与内涝径流
          </button>
          <button
            type="button"
            class="chip-btn"
            :class="{ active: litQuery === 'China land cover change Landsat' }"
            @click="litQuery = 'China land cover change Landsat'; runLiteratureSearch()"
          >
            中国土地覆盖遥感演变
          </button>
          <button
            type="button"
            class="chip-btn"
            :class="{ active: litQuery === '城市热岛 遥感' }"
            @click="litQuery = '城市热岛 遥感'; runLiteratureSearch()"
          >
            中文：城市热岛与遥感
          </button>
        </div>

        <p class="lit-source-indicator">当前展示模式：<strong>{{ litSourceLabel }}</strong></p>

        <div v-if="litPapers.length" class="lit-grid">
          <article v-for="paper in litPapers" :key="paper.doi" class="paper-card">
            <div class="paper-meta-top">
              <span class="paper-type-tag">{{ paper.workTypeLabel || 'DOI 注册出版物' }}</span>
              <span class="paper-journal">
                {{ paper.journal }}
                <template v-if="paper.year">({{ paper.year }})</template>
              </span>
            </div>
            <h3>{{ paper.title }}</h3>
            <p class="paper-authors">作者：{{ paper.authors }}</p>
            <div class="paper-actions">
              <a :href="paper.url || `https://doi.org/${paper.doi}`" target="_blank" rel="noopener noreferrer" class="doi-link">
                🔗 DOI: {{ paper.doi }} ↗
              </a>
              <button type="button" class="text-action-btn" @click="discussPaperInCommunity(paper)">
                💬 带入社区讨论 →
              </button>
              <button type="button" class="text-action-btn" @click="openProposeWithPaper(paper)">
                🌟 据此发起课题 →
              </button>
            </div>
          </article>
        </div>
        <p v-else class="muted-note">未检索到符合筛选条件的 DOI 文献，请尝试放宽年份限制或更换关键词。</p>
      </section>
    </template>

    <!-- 发起新课题 / 引用社区讨论发起繁星课题弹窗 -->
    <div v-if="showProposeModal" class="modal-overlay" role="dialog" aria-modal="true" @click.self="showProposeModal = false">
      <div class="modal-card panel">
        <div class="modal-head">
          <h2>{{ proposeForm.sourcePostId ? `🌟 引用社区讨论 #${proposeForm.sourcePostId} 发起繁星课题` : '🌟 发起新的繁星科研协作课题' }}</h2>
          <button type="button" class="close-btn" aria-label="关闭弹窗" @click="showProposeModal = false">×</button>
        </div>
        <p class="muted-note">
          把你的地理问题、观察发现或文献读后感拆解为同伴可参与的微任务，招募协作者共同完成数据核查与实证分析。
        </p>

        <form class="propose-form" @submit.prevent="submitNewProject">
          <div class="form-grid-2">
            <label>
              课题名称
              <input v-model.trim="proposeForm.title" required maxlength="100" placeholder="例如：长三角城市群夏季极端降水与下垫面滞洪能力对比" />
            </label>
            <label>
              所属地理领域
              <input v-model.trim="proposeForm.field" required maxlength="40" placeholder="例如：城市水文 / 遥感解译 / 区域气候" />
            </label>
          </div>

          <label>
            核心研究问题（一句话说清要检验什么地理假设或现象）
            <input v-model.trim="proposeForm.question" required maxlength="280" placeholder="例如：不同透水铺装占比在 60mm/h 暴雨下能延缓多少分钟洪峰？" />
          </label>

          <label>
            研究思路与方法
            <textarea v-model.trim="proposeForm.method" required maxlength="900" rows="3" placeholder="说明使用什么公开数据、站内哪个 3D/遥感实验室，以及如何对比核查……" />
          </label>

          <div class="form-grid-2">
            <label>
              招募协作者角色
              <input v-model.trim="proposeForm.role" required maxlength="50" placeholder="例如：遥感样点核查助手 / 文献整理助手" />
            </label>
            <label>
              每周时间投入建议
              <input v-model.trim="proposeForm.commitment" required maxlength="50" placeholder="例如：每周约 1–2 小时 · 欢迎新手" />
            </label>
          </div>

          <label>
            加入后的第一项具体微任务
            <textarea v-model.trim="proposeForm.task" required maxlength="360" rows="2" placeholder="例如：使用站内卫星卷帘对比 10 个样点并提交 1 张可复现观察证据卡" />
          </label>

          <div class="form-grid-2">
            <label>
              关联参考文献 DOI（选填，需符合 10.xxxx/... 标准格式）
              <input v-model.trim="proposeForm.paperDoi" maxlength="100" placeholder="例如：10.5194/essd-13-3907-2021" />
            </label>
            <label>
              审核通过后解锁的协作 QQ 群或联系渠道（选填）
              <input v-model.trim="proposeForm.collabQqGroup" maxlength="80" placeholder="仅对审核通过的申请人显示" />
            </label>
          </div>

          <div v-if="proposeError" class="app-error" role="alert">
            <p style="margin: 0">{{ proposeError }}</p>
          </div>

          <div class="form-btn-row">
            <button type="submit" class="baroque-btn baroque-btn-primary" :disabled="proposing">
              {{ proposing ? '正在发送至服务器…' : '正式发布课题并开放招募 ✦' }}
            </button>
            <button type="button" class="baroque-btn" @click="showProposeModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
.fanxing { width: min(1160px, calc(100% - 32px)); margin: 24px auto 64px; }
.fanxing-hero {
  padding: clamp(24px, 4.5vw, 48px);
  border-radius: 22px;
  color: #fff8e9;
  background-color: #142536;
  background-image: radial-gradient(ellipse at 82% 15%, #35526b, transparent 55%);
  border: 1.5px solid #8a6d38;
}
.fanxing-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}
.hero-top-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.hero-admin-link, .hero-propose-btn {
  min-height: 38px;
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.hero-admin-link {
  background-color: #1e3750;
  color: #ffebb8;
  border: 1.5px solid #d4af63;
}
.hero-admin-link:hover {
  background-color: #284766;
  color: #ffffff;
}
.hero-propose-btn {
  background-color: #e6be6a;
  color: #0d1d2c;
  border: 1.5px solid #f8dfa5;
  font-weight: 800;
}
.hero-propose-btn:hover {
  background-color: #f3ce7e;
}
.fanxing-hero h1 { color: #ffffff; margin: 10px 0 12px; font-size: clamp(28px, 4.5vw, 46px); }
.hero-lead { max-width: 52rem; line-height: 1.7; color: #e2ecf5; margin-bottom: 18px; }
.back {
  color: #ffebb8;
  text-decoration: none;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(246, 223, 164, 0.45);
}
.back:hover {
  background-color: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}
.workflow-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background-color: #0c1824;
  border: 1px solid #7d6639;
  border-radius: 12px;
  font-size: 13px;
  color: #f3ead8;
  font-weight: 600;
}
.hero-tag {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffebb8;
  margin: 0;
}

/* 浅底卡片上的分类标签：深棕金文字配暖米底，对比度 > 7.5:1 (符合 WCAG AAA) */
.tag {
  display: inline-block;
  font-size: 0.84rem;
  font-weight: 700;
  color: #5c3f09;
  background-color: #f7f0df;
  border: 1px solid #b58d3d;
  padding: 3px 10px;
  border-radius: 999px;
  margin: 0;
}

.catalog, .detail, .literature-hub, .my-apps-overview { margin-top: 28px; }
.detail { display: grid; grid-template-columns: minmax(0, 1.85fr) minmax(320px, 1fr); gap: 22px; align-items: start; }
.detail-main-col, .detail-side-col { display: flex; flex-direction: column; gap: 20px; }

.panel {
  padding: clamp(18px, 2.6vw, 28px);
  border: 1.5px solid #94a3b8;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 39, 66, 0.06);
}
.panel h2, .panel h3 { margin: 0 0 10px; color: #0f233e; }
.panel p { line-height: 1.7; color: #1e293b; }
.panel-head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.panel-sub { font-size: 14px; color: #334155; margin-top: 0; }
.muted-note { font-size: 13.5px; color: #334155; }

.highlight-question {
  font-size: 17px;
  font-weight: 700;
  color: #0f2742;
  padding: 12px 16px;
  background-color: #eef5fa;
  border: 1px solid #7aa6c9;
  border-left: 4px solid #164e78;
  border-radius: 8px;
}

.linked-lab-callout {
  margin-top: 16px;
  padding: 14px 16px;
  background-color: #f8f5ec;
  border: 1.5px solid #9a7b3e;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.real-activity-badge {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f3d68;
  background-color: #e6f2fb;
  border: 1px solid #6b9ec7;
  padding: 4px 10px;
  border-radius: 999px;
}

.task-list { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.task-item {
  padding: 14px 16px;
  border: 1px solid #94a3b8;
  border-radius: 12px;
  background-color: #f8fafc;
}
.task-item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.task-role-badge {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  background-color: #e0f0fb;
  color: #0c3b60;
  border: 1px solid #6499c4;
  font-weight: 700;
}
.task-planned-target {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.verified-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background-color: #dcfce7;
  color: #14532d;
  border: 1px solid #4ade80;
}
.papers-list, .lit-grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top: 14px; }
.lit-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
.paper-card {
  padding: 16px 18px;
  border: 1.5px solid #94a3b8;
  border-radius: 12px;
  background-color: #fcfbf9;
}
.paper-meta-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  margin-bottom: 6px;
}
.paper-type-tag {
  background-color: #142536;
  color: #ffebb8;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
}
.paper-journal { color: #334155; font-weight: 700; }
.paper-card h3 { font-size: 15.5px; margin: 4px 0 6px; line-height: 1.45; color: #0f233e; }
.paper-authors { font-size: 13px; color: #334155; margin: 0 0 6px; }
.paper-note { font-size: 13px; color: #1e293b; background-color: #eef3f7; padding: 8px 10px; border-radius: 8px; margin: 6px 0; }
.paper-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #94a3b8;
}
.doi-link, .dataset-link {
  font-size: 12.5px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: #0b4a7d;
  font-weight: 700;
  text-decoration: underline;
}
.text-action-btn {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 4px 12px;
  border-radius: 999px;
  background-color: #eef5fb;
  border: 1.5px solid #3b719f;
  color: #0c3960;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
  text-decoration: none;
}
.text-action-btn:hover {
  background-color: #d9eaf8;
  border-color: #164e78;
  color: #082642;
}

.datasets-block { margin-top: 18px; padding-top: 14px; border-top: 1px solid #cbd5e1; }
.dataset-list { margin: 8px 0 0; padding-left: 18px; }
.dataset-list li { margin-bottom: 6px; font-size: 14px; }
.ds-license { margin-left: 10px; color: #334155; font-weight: 600; }

.linked-posts-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.linked-post-item {
  display: block;
  padding: 12px 16px;
  border: 1.5px solid #94a3b8;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  background-color: #f8fafc;
}
.linked-post-item:hover { border-color: #164e78; background-color: #f1f7fc; }
.lp-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.lp-kind {
  font-size: 11.5px;
  padding: 2px 7px;
  border-radius: 4px;
  background-color: #e0f0fb;
  color: #0c3b60;
  font-weight: 700;
}
.lp-excerpt { font-size: 13.5px; color: #334155; margin: 4px 0; }
.lp-meta { font-size: 12px; color: #475569; display: flex; gap: 8px; flex-wrap: wrap; font-weight: 600; }

/* 申请卡片与解锁区域 */
.first-task-box {
  padding: 10px 14px;
  background-color: #f8f5ec;
  border-radius: 10px;
  border: 1px solid #b59553;
  font-size: 13.5px;
}
.app-notice {
  padding: 12px 14px;
  background-color: #e9f7ef;
  border: 1.5px solid #2e8b57;
  color: #14532d;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
}
.app-error {
  padding: 12px 14px;
  background-color: #fdf2e9;
  border: 1.5px solid #c0392b;
  color: #7f1d1d;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  margin-bottom: 12px;
}
.draft-banner {
  padding: 10px 12px;
  background-color: #fef3c7;
  border: 1.5px solid #b45309;
  color: #78350f;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 12px;
}
.draft-status-pill {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background-color: #fef3c7;
  color: #78350f;
  border: 1px solid #b45309;
}
.my-app-status-card {
  margin-top: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 1.5px solid #94a3b8;
  background-color: #f8fafc;
}
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #cbd5e1;
  margin-bottom: 10px;
}
.badge-approved { color: #14532d; background-color: #dcfce7; border: 1px solid #22c55e; padding: 3px 10px; border-radius: 999px; font-size: 13px; }
.badge-pending { color: #78350f; background-color: #fef3c7; border: 1px solid #d97706; padding: 3px 10px; border-radius: 999px; font-size: 13px; }
.badge-rejected { color: #7f1d1d; background-color: #fee2e2; border: 1px solid #ef4444; padding: 3px 10px; border-radius: 999px; font-size: 13px; }

.app-summary-dl {
  display: grid;
  gap: 6px;
  font-size: 13px;
  margin: 0 0 12px;
}
.app-summary-dl div { display: flex; gap: 8px; }
.app-summary-dl dt { color: #334155; min-width: 68px; font-weight: 700; }
.app-summary-dl dd { margin: 0; color: #0f172a; }

.unlocked-collab-box {
  margin-top: 12px;
  padding: 14px;
  background-color: #eef9f2;
  border: 1.5px solid #2e8b57;
  border-radius: 10px;
}
.unlocked-collab-box h3 { font-size: 16px; color: #14532d; margin: 0 0 8px; }
.channel-item { font-size: 13.5px; margin-bottom: 6px; color: #0f172a; }
.onboarding-guide pre {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13px;
  background-color: #ffffff;
  color: #0f172a;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #68b888;
  margin: 6px 0 12px;
}

.apply-form label, .propose-form label {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
  font-weight: 700;
  font-size: 13.5px;
  color: #0f233e;
}
input, textarea, select {
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid #64748b;
  border-radius: 8px;
  padding: 10px 12px;
  font: inherit;
  font-size: 14px;
  background-color: #ffffff;
  color: #0f172a;
}
.form-btn-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.full-width-btn { width: 100%; justify-content: center; }
.cta-sub-note { font-size: 12.5px; color: #334155; margin-top: 8px; }

.collab-list { list-style: none; padding: 0; margin: 10px 0 0; display: flex; flex-direction: column; gap: 8px; }
.collab-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13.5px;
  padding: 6px 10px;
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

/* 课题大厅卡片 */
.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 18px;
}
.search { width: min(380px, 100%); margin: 0; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
.project-card { display: flex; flex-direction: column; justify-content: space-between; }
.card-top-badges { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px; }
.recruiting-pill, .status-recruiting {
  font-size: 12px;
  font-weight: 700;
  color: #14532d;
  background-color: #dcfce7;
  border: 1px solid #22c55e;
  padding: 3px 10px;
  border-radius: 999px;
}
.my-app-pill { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.st-approved { background-color: #dcfce7; color: #14532d; border: 1px solid #22c55e; }
.st-pending { background-color: #fef3c7; color: #78350f; border: 1px solid #d97706; }
.st-rejected { background-color: #fee2e2; color: #7f1d1d; border: 1px solid #ef4444; }

.card-question, .card-task { font-size: 14px; margin: 6px 0; }
.card-meta-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12.5px;
  color: #334155;
  font-weight: 600;
  margin: 12px 0 16px;
  padding-top: 10px;
  border-top: 1px solid #cbd5e1;
}
.card-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* 我的申请概览 */
.my-apps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; margin-top: 12px; }
.my-app-mini-card {
  padding: 14px 16px;
  border: 1.5px solid #94a3b8;
  border-radius: 12px;
  background-color: #fcfbf8;
}
.mini-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px; }
.mini-status { font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.mini-task { font-size: 13px; margin: 4px 0; }
.mini-unlocked { font-size: 13px; color: #14532d; background-color: #eafaf1; border: 1px solid #4ade80; padding: 8px 10px; border-radius: 8px; margin: 6px 0; }

/* Crossref 文献检索中心 */
.lit-search-bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 14px 0 10px; }
.lit-search-bar input[type="search"] { flex: 1; min-width: 240px; }
.lit-filter-select { width: auto; min-width: 150px; }
.lit-checkbox-label {
  display: inline-flex !important;
  align-items: center;
  gap: 6px;
  margin: 0 !important;
  padding: 8px 12px;
  border: 1.5px solid #64748b;
  border-radius: 8px;
  background-color: #f8fafc;
  font-size: 13px;
  font-weight: 700;
  color: #0f233e;
  cursor: pointer;
  white-space: nowrap;
}
.lit-checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
}
.lit-quick-tags { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; color: #334155; font-weight: 600; margin-bottom: 10px; }
.chip-btn {
  min-height: 34px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1.5px solid #64748b;
  background-color: #f8fafc;
  color: #0f233e;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
.chip-btn:hover {
  border-color: #0f3d68;
  background-color: #e6f0fa;
}
.chip-btn.active {
  background-color: #0f2742;
  border-color: #0f2742;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(15, 39, 66, 0.25);
}
.chip-btn.active::before {
  content: "✓ ";
}
.lit-source-indicator { font-size: 13px; color: #334155; margin: 4px 0 12px; }

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(10, 22, 36, 0.72);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-card { width: min(680px, 100%); max-height: 90vh; overflow-y: auto; }
.modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.close-btn {
  min-width: 36px;
  min-height: 36px;
  border-radius: 8px;
  border: 1.5px solid #64748b;
  background-color: #f8fafc;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
  color: #0f233e;
}
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

@media (max-width: 820px) {
  .detail, .form-grid-2 { grid-template-columns: 1fr; }
  .cards, .lit-grid, .my-apps-grid { grid-template-columns: 1fr; }
  .lit-search-bar input[type="search"],
  .lit-filter-select { width: 100%; min-width: 0; }
}
</style>
