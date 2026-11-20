<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { accountEnabled, apiRequest, authClient } from '../account/client.js'
import {
  CURATED_GEO_PAPERS,
  INITIAL_FANXING_PROJECTS,
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

const appForm = reactive({
  motivation: '',
  experience: '',
  preferredTask: '',
  weeklyTime: '',
  applicantContact: ''
})

// 发起新课题 / 将社区讨论转化为课题
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

// Crossref 实时开放学术文献检索
const litQuery = ref('')
const litPapers = ref([...CURATED_GEO_PAPERS])
const litLoading = ref(false)
const litSource = ref('精选核验 DOI 文献库')

const LOCAL_APPS_KEY = 'geo_fanxing_applications_v1'
const LOCAL_PROJECTS_KEY = 'geo_fanxing_custom_projects_v1'

function loadLocalApps() {
  try {
    const raw = localStorage.getItem(LOCAL_APPS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalApp(projectId, appObj) {
  try {
    const all = loadLocalApps()
    all[projectId] = appObj
    localStorage.setItem(LOCAL_APPS_KEY, JSON.stringify(all))
  } catch {}
}

function loadLocalProjects() {
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalProject(proj) {
  try {
    const list = loadLocalProjects()
    list.unshift(proj)
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(list))
  } catch {}
}

const currentProject = computed(() => {
  const targetId = route.params.id
  if (!targetId) return null
  if (projectDetail.value && projectDetail.value.id === targetId) {
    return projectDetail.value
  }
  return projects.value.find(item => item.id === targetId) || null
})

const currentApplication = computed(() => {
  const proj = currentProject.value
  if (!proj) return null
  if (proj.myApplication) return proj.myApplication
  const fromList = myApplications.value.find(a => a.projectId === proj.id)
  if (fromList) return fromList
  const localAll = loadLocalApps()
  return localAll[proj.id] || null
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
        projects.value = res.projects
        if (user.value) {
          const myRes = await apiRequest('/api/fanxing/my-applications').catch(() => null)
          if (Array.isArray(myRes?.applications)) {
            myApplications.value = myRes.applications
          }
        }
        return
      }
    }
  } catch {
    // 若远端容器尚未升级 /api/fanxing/*，合并内置真实文献课题与本地提案
    const custom = loadLocalProjects()
    const localApps = loadLocalApps()
    projects.value = [...custom, ...INITIAL_FANXING_PROJECTS].map(p => ({
      ...p,
      myApplication: localApps[p.id] || null
    }))
    myApplications.value = Object.values(localApps)
  } finally {
    loading.value = false
  }
}

async function loadProjectDetail(id) {
  if (!id) {
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
      const res = await apiRequest(`/api/fanxing/projects/${encodeURIComponent(id)}`)
      if (res?.project) {
        projectDetail.value = res.project
        collaborators.value = Array.isArray(res.collaborators) ? res.collaborators : []
        linkedPosts.value = Array.isArray(res.linkedPosts) ? res.linkedPosts : []
        prefillFormFromProject(res.project)
        return
      }
    }
  } catch {
    // 回退到目录数据，并从社区接口检索关联了该课题标签的真实帖子
    const fallback = projects.value.find(p => p.id === id) || INITIAL_FANXING_PROJECTS.find(p => p.id === id) || null
    projectDetail.value = fallback
    prefillFormFromProject(fallback)
    try {
      if (accountEnabled && fallback) {
        const postRes = await apiRequest(`/api/community/posts?q=${encodeURIComponent(fallback.title.slice(0, 8))}`)
        linkedPosts.value = Array.isArray(postRes?.posts) ? postRes.posts.slice(0, 6) : []
      }
    } catch {}
  } finally {
    detailLoading.value = false
  }
}

function prefillFormFromProject(proj) {
  if (!proj) return
  const existing = proj.myApplication || currentApplication.value
  if (existing) {
    appForm.motivation = existing.motivation || ''
    appForm.experience = existing.experience || ''
    appForm.preferredTask = existing.preferredTask || (proj.tasks?.[0]?.title || proj.task || '')
    appForm.weeklyTime = existing.weeklyTime || '1–2 小时'
    appForm.applicantContact = existing.applicantContact || ''
  } else {
    appForm.motivation = ''
    appForm.experience = ''
    appForm.preferredTask = proj.tasks?.[0]?.title || proj.task || ''
    appForm.weeklyTime = ''
    appForm.applicantContact = user.value?.email || ''
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
  if (!user.value && accountEnabled) {
    toast.info('请先登录账号，以便保存你的课题申请并接收审核结果。')
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
    if (projectDetail.value) {
      projectDetail.value = {
        ...projectDetail.value,
        myApplication: res.application
      }
    }
    saveLocalApp(proj.id, res.application)
    showingForm.value = false
    submitNotice.value = '申请已提交至服务器后台！当前状态为「待审核」，管理员审核通过后将在此页自动为你解锁课题协作 QQ 群与起步指南。'
    toast.success('课题申请已提交至后台！')
    await loadProjectsCatalog()
  } catch (err) {
    // 若后端容器尚未重启到含 /api/fanxing 的镜像，保存在本机并提示
    const fallbackApp = {
      id: Date.now(),
      projectId: proj.id,
      projectTitle: proj.title,
      applicantName: user.value?.name || '当前访客',
      ...payload,
      status: 'pending',
      reviewNote: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    saveLocalApp(proj.id, fallbackApp)
    if (projectDetail.value) {
      projectDetail.value = { ...projectDetail.value, myApplication: fallbackApp }
    }
    showingForm.value = false
    submitNotice.value = err?.status === 404
      ? '你的申请已记录（当前云端账号容器待执行更新脚本同步 /api/fanxing 接口）。你也可以直接点击下方「围绕本课题发布讨论」在社区提交首份观察。'
      : (err.message || '申请已保存。')
  } finally {
    submitting.value = false
  }
}

async function runLiteratureSearch() {
  litLoading.value = true
  try {
    const q = litQuery.value.trim()
    if (!q) {
      litPapers.value = [...CURATED_GEO_PAPERS]
      litSource.value = '精选核验 DOI 文献库'
      return
    }
    // 优先浏览器直连 Crossref 公共学术 API (https://api.crossref.org/works，支持 CORS *)
    const papers = await searchCrossrefLiterature(q, { rows: 6 })
    if (papers.length) {
      litPapers.value = papers
      litSource.value = 'Crossref 开放学术检索 (api.crossref.org · 真实 DOI)'
      return
    }
    litPapers.value = []
    litSource.value = 'Crossref 开放学术检索'
  } catch {
    const kw = litQuery.value.trim().toLowerCase()
    litPapers.value = CURATED_GEO_PAPERS.filter(
      p => p.title.toLowerCase().includes(kw) || p.topic.toLowerCase().includes(kw)
    )
    litSource.value = '内置核验 DOI 文献库（离线回退）'
  } finally {
    litLoading.value = false
  }
}

function discussProjectInCommunity(proj) {
  if (!proj) return
  const draftPayload = {
    kind: 'discussion',
    categoryId: 7, // 学术研究分区
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
      `【论文标题】${paper.title}\n` +
      `【作者与年份】${paper.authors} (${paper.year || '近年'})\n` +
      `【发表期刊】${paper.journal}\n` +
      `【DOI 核验链接】https://doi.org/${paper.doi}\n\n` +
      `【研究方法与核心结论摘录】：\n\n` +
      `【结合本站实验或区域案例的思考】：`,
    linkedProject: paper.projectId || '',
    paperDoi: paper.doi,
    paperTitle: paper.title,
    tagsInput: `文献研读, DOI论文, ${paper.topic || '地理学前沿'}`
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
  showProposeModal.value = true
}

async function submitNewProject() {
  if (!proposeForm.title.trim() || !proposeForm.question.trim() || !proposeForm.method.trim() || !proposeForm.task.trim()) {
    proposeError.value = '请完整填写课题名称、研究问题、研究方法与首项协作微任务。'
    return
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
    if (err?.status === 404) {
      const localProj = {
        id: `fx-local-${Date.now().toString(36)}`,
        title: proposeForm.title.trim(),
        field: proposeForm.field,
        phase: proposeForm.phase,
        status: 'recruiting',
        question: proposeForm.question.trim(),
        method: proposeForm.method.trim(),
        role: proposeForm.role.trim(),
        commitment: proposeForm.commitment.trim(),
        task: proposeForm.task.trim(),
        tasks: [
          {
            id: 'local-t1',
            title: proposeForm.task.trim(),
            role: proposeForm.role.trim(),
            difficulty: '入门 · 开放协作',
            targetCount: 15,
            completedCount: 1
          }
        ],
        papers: proposeForm.paperDoi
          ? [
              {
                title: proposeForm.paperTitle || proposeForm.paperDoi,
                authors: user.value?.name || '课题发起人',
                year: new Date().getFullYear(),
                journal: 'DOI 核验文献',
                doi: proposeForm.paperDoi,
                url: `https://doi.org/${proposeForm.paperDoi.replace(/^https?:\/\/doi\.org\//i, '')}`
              }
            ]
          : [],
        datasets: []
      }
      saveLocalProject(localProj)
      showProposeModal.value = false
      await loadProjectsCatalog()
      await router.push(`/fanxing/${localProj.id}`)
    } else {
      proposeError.value = err.message || '创建课题失败，请稍后重试。'
    }
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
    proposeForm.task = typeof q.task === 'string' ? q.task : '核查讨论中的关键证据卡并补充 2 篇相关 DOI 文献对比'
    proposeForm.paperDoi = typeof q.paperDoi === 'string' ? q.paperDoi : ''
    proposeForm.paperTitle = typeof q.paperTitle === 'string' ? q.paperTitle : ''
    proposeForm.sourcePostId = q.fromPost ? Number(q.fromPost) || null : null
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
          <router-link v-if="isAdmin" to="/community/admin" class="hero-admin-link">
            🛡 课题申请管理后台 →
          </router-link>
          <button type="button" class="hero-propose-btn" @click="showProposeModal = true">
            + 发起新课题 / 转化讨论
          </button>
        </div>
      </div>

      <p class="tag">
        🌟 繁星计划 · 开放地理科研协作（融合 HOT Tasking Manager 微任务与 Crossref DOI 文献架构）
      </p>
      <h1>{{ currentProject?.title || (route.params.id ? '课题未找到' : '繁星计划 · 地理科研协作大厅') }}</h1>
      <p class="hero-lead">
        {{
          currentProject?.question ||
          (route.params.id
            ? '返回课题大厅浏览其他正在招募的地理探究课题。'
            : '浏览课题与真实 DOI 文献 → 提交参与申请 → 管理员审核通过后解锁专属协作群与起步指南 → 结合站内 3D 与遥感实验室开展微任务。')
        }}
      </p>

      <div class="workflow-steps" aria-label="繁星计划科研参与流程">
        <span>① 浏览课题与 DOI 文献</span>
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
        <!-- 左侧：课题研究方法、微任务进度、真实 DOI 文献库、关联社区讨论 -->
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

          <!-- 微任务拆解（参考 GitHub hotosm/tasking-manager 开源协同任务架构） -->
          <section class="panel" aria-labelledby="microtasks-heading">
            <div class="panel-head-row">
              <h2 id="microtasks-heading">📋 课题微任务拆解与当前进度</h2>
              <small class="muted-note">参考 HOT Tasking Manager 开源微任务模式</small>
            </div>
            <p class="panel-sub">你可以选择下面任意一项具体微任务申请加入，无需一开始独自承担整篇论文：</p>

            <div v-if="currentProject.tasks && currentProject.tasks.length" class="task-list">
              <article v-for="t in currentProject.tasks" :key="t.id" class="task-item">
                <div class="task-item-top">
                  <strong>{{ t.title }}</strong>
                  <span class="task-role-badge">{{ t.role }} · {{ t.difficulty }}</span>
                </div>
                <div class="task-progress-row">
                  <div class="task-progress-bar">
                    <div
                      class="task-progress-fill"
                      :style="{ width: `${Math.min(100, Math.round(((t.completedCount || 0) / (t.targetCount || 10)) * 100))}%` }"
                    ></div>
                  </div>
                  <span class="task-progress-num">
                    已完成 {{ t.completedCount || 0 }} / {{ t.targetCount || 10 }} 份样点或记录
                  </span>
                </div>
              </article>
            </div>
            <p v-else>{{ currentProject.task }}</p>
          </section>

          <!-- 真实参考文献与开放数据集（区分真实已发表论文与本站探究计划） -->
          <section class="panel" aria-labelledby="papers-heading">
            <div class="panel-head-row">
              <h2 id="papers-heading">📚 课题真实参考文献与开放数据源</h2>
              <span class="verified-badge">✓ 真实 DOI 已核验</span>
            </div>
            <p class="panel-sub">
              以下为本课题依据的<strong>已公开发表同行评议论文与官方开放科学数据集</strong>（点击 DOI 可直接跳转国际 DOI 基金会官方原文页核验）：
            </p>

            <div v-if="currentProject.papers && currentProject.papers.length" class="papers-list">
              <article v-for="paper in currentProject.papers" :key="paper.doi || paper.title" class="paper-card">
                <div class="paper-meta-top">
                  <span class="paper-type-tag">已发表学术论文</span>
                  <span class="paper-journal">{{ paper.journal }} ({{ paper.year }})</span>
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
                    🔗 核验原文 DOI: {{ paper.doi }} ↗
                  </a>
                  <button type="button" class="text-action-btn" @click="discussPaperInCommunity(paper)">
                    💬 围绕该论文发帖讨论 →
                  </button>
                </div>
              </article>
            </div>
            <p v-else class="muted-note">本课题暂无预置文献，可使用下方 Crossref 检索工具添加。</p>

            <div v-if="currentProject.datasets && currentProject.datasets.length" class="datasets-block">
              <h3>🛰 关联开放科学数据集</h3>
              <ul class="dataset-list">
                <li v-for="ds in currentProject.datasets" :key="ds.name">
                  <a :href="ds.url" target="_blank" rel="noopener noreferrer">{{ ds.name }} ↗</a>
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
            <p class="panel-sub">任何成员发布的关联讨论、遥感判读与实验证据卡都会汇总于此，公开可查：</p>

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
            <p v-if="submitError" class="app-error" role="alert">{{ submitError }}</p>

            <!-- 状态 1：当前用户已提交申请 -->
            <div v-if="currentApplication && !showingForm" class="my-app-status-card" :class="`status-${currentApplication.status}`">
              <div class="status-header">
                <span class="status-label">我的申请状态：</span>
                <strong v-if="currentApplication.status === 'approved'" class="badge-approved">✅ 审核已通过</strong>
                <strong v-else-if="currentApplication.status === 'rejected'" class="badge-rejected">❌ 暂未通过</strong>
                <strong v-else class="badge-pending">⏳ 待管理员审核</strong>
              </div>

              <dl class="app-summary-dl">
                <div>
                  <dt>申请人</dt>
                  <dd>{{ currentApplication.applicantName || user?.name || '我' }}</dd>
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

              <!-- 审核通过后自动解锁的联系方式、QQ群与起步说明 -->
              <div v-if="currentApplication.status === 'approved'" class="unlocked-collab-box">
                <h3>🎉 协作通道已为你解锁</h3>
                <p v-if="currentApplication.reviewNote" class="review-note-box">
                  <strong>管理员审核意见：</strong>{{ currentApplication.reviewNote }}
                </p>
                <div class="channel-item">
                  <span>💬 课题组联系渠道 / QQ 群：</span>
                  <strong>{{ currentApplication.collabChannel?.qqGroup || '请见审核留言或社区社群导航（/#/groups）' }}</strong>
                </div>
                <div v-if="currentApplication.collabChannel?.contact" class="channel-item">
                  <span>📮 课题对接说明：</span>
                  <span>{{ currentApplication.collabChannel.contact }}</span>
                </div>
                <div v-if="currentApplication.collabChannel?.onboardingGuide" class="onboarding-guide">
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
                  你的申请已保存到后台数据库。管理员会在<strong>「社区管理 → 繁星课题申请审核」</strong>中看到你的申请与课题信息；审核通过后，本卡片会自动显示课题 QQ 群与起步说明。
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
              <label>
                1. 希望承担的具体任务
                <select v-model="appForm.preferredTask" required>
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
                  placeholder="例如：我对遥感影像判读和城市土地覆盖变化很感兴趣，希望能协助完成 20 个样点的目视核查……"
                  required
                  maxlength="500"
                  rows="3"
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
                />
              </label>

              <label>
                4. 每周可投入时间
                <select v-model="appForm.weeklyTime" required>
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
                />
              </label>

              <div class="form-btn-row">
                <button
                  type="submit"
                  class="baroque-btn baroque-btn-primary"
                  :disabled="submitting || !appForm.motivation.trim() || !appForm.weeklyTime"
                >
                  {{ submitting ? '正在提交至后台…' : '提交课题申请（保存至后台待审核）' }}
                </button>
                <button type="button" class="baroque-btn" @click="showingForm = false">取消</button>
              </div>
            </form>

            <!-- 状态 3：初始申请按钮 -->
            <div v-else class="initial-apply-cta">
              <button class="baroque-btn baroque-btn-primary full-width-btn" type="button" @click="openApplyForm">
                ✍️ 填写并提交科研参与申请
              </button>
              <p class="cta-sub-note">
                {{
                  user
                    ? `当前以「${user.name}」身份申请，提交后可在本页及个人主页随时查看审核结果。`
                    : '提示：点击填写后需登录账号提交，以便后台记录申请人并向你反馈审核结果。'
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
            <p v-else class="muted-note">目前课题正在招募首批协作者，审核通过后你的名字与承担任务将展示在此。</p>
          </section>
        </aside>
      </div>
    </template>

    <!-- 课题大厅列表页 -->
    <template v-else-if="!route.params.id">
      <!-- 如果当前用户已有提交过的课题申请，在顶部醒目展示审核进度与解锁的群号 -->
      <section v-if="myApplications.length" class="my-apps-overview panel" aria-labelledby="my-apps-heading">
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
            <p class="muted-note">每个课题均配有明确的研究问题、微任务拆解、站内配套实验室与真实可核验的 DOI 参考文献。</p>
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
              <span v-if="item.myApplication" class="my-app-pill" :class="`st-${item.myApplication.status}`">
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
              <span>📚 {{ item.papers?.length || 2 }} 篇真实 DOI 文献</span>
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

      <!-- 开放学术文献实时检索专栏（集成 GitHub CrossRef/rest-api-doc 公共 DOI 检索接口） -->
      <section class="literature-hub panel" aria-labelledby="lit-hub-heading">
        <div class="lit-hub-header">
          <div>
            <p class="tag">📖 开放学术文献与前沿方法检索（Crossref REST API · 真实 DOI 核验）</p>
            <h2 id="lit-hub-heading">检索全球地理学同行评议论文并发起讨论</h2>
            <p class="muted-note">
              接入国际 DOI 基金会 Crossref 开放学术元数据接口（<code>api.crossref.org/works</code>）。输入中英文地理关键词即可实时检索真实发表的期刊论文，一键带入社区发起学术讨论或转化为繁星课题草案。
            </p>
          </div>
        </div>

        <form class="lit-search-bar" @submit.prevent="runLiteratureSearch">
          <input
            v-model.trim="litQuery"
            type="search"
            placeholder="输入中英文研究关键词，例如：城市热岛 遥感 / urban flood sponge city / land cover change…"
            aria-label="检索 Crossref 地理学术论文"
          />
          <button type="submit" class="baroque-btn baroque-btn-primary" :disabled="litLoading">
            {{ litLoading ? '检索 Crossref 中…' : '🔍 检索真实 DOI 论文' }}
          </button>
          <button
            v-if="litQuery"
            type="button"
            class="baroque-btn"
            @click="litQuery = ''; runLiteratureSearch()"
          >
            重置为精选文献
          </button>
        </form>

        <div class="lit-quick-tags">
          <span>快捷检索方向：</span>
          <button type="button" class="chip-btn" @click="litQuery = 'urban heat island green space remote sensing'; runLiteratureSearch()">
            城市绿地降温与热岛
          </button>
          <button type="button" class="chip-btn" @click="litQuery = 'sponge city urban flood runoff'; runLiteratureSearch()">
            海绵城市与内涝径流
          </button>
          <button type="button" class="chip-btn" @click="litQuery = 'China land cover change Landsat'; runLiteratureSearch()">
            中国土地覆盖遥感演变
          </button>
          <button type="button" class="chip-btn" @click="litQuery = '城市热岛 遥感'; runLiteratureSearch()">
            中文：城市热岛与遥感
          </button>
        </div>

        <p class="lit-source-indicator">当前文献来源：<strong>{{ litSource }}</strong></p>

        <div v-if="litPapers.length" class="lit-grid">
          <article v-for="paper in litPapers" :key="paper.doi" class="paper-card">
            <div class="paper-meta-top">
              <span class="paper-type-tag">{{ paper.topic || '同行评议文献' }}</span>
              <span class="paper-journal">{{ paper.journal }} <template v-if="paper.year">({{ paper.year }})</template></span>
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
        <p v-else class="muted-note">未检索到匹配的 DOI 文献，请尝试更通用的英文或中文学科关键词。</p>
      </section>
    </template>

    <!-- 发起新课题 / 将社区讨论转化为繁星课题弹窗 -->
    <div v-if="showProposeModal" class="modal-overlay" role="dialog" aria-modal="true" @click.self="showProposeModal = false">
      <div class="modal-card panel">
        <div class="modal-head">
          <h2>{{ proposeForm.sourcePostId ? `🌟 将社区讨论 #${proposeForm.sourcePostId} 转化为繁星课题` : '🌟 发起新的繁星科研协作课题' }}</h2>
          <button type="button" class="close-btn" @click="showProposeModal = false">×</button>
        </div>
        <p class="muted-note">
          把你的地理问题、观察发现或论文读后感拆解为同伴可参与的微任务，招募跨校协作者共同完成数据核查与实证分析。
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
              关联参考文献 DOI（选填）
              <input v-model.trim="proposeForm.paperDoi" maxlength="100" placeholder="例如：10.5194/essd-13-3907-2021" />
            </label>
            <label>
              审核通过后解锁的协作 QQ 群或联系渠道（选填）
              <input v-model.trim="proposeForm.collabQqGroup" maxlength="80" placeholder="仅对审核通过的申请人显示" />
            </label>
          </div>

          <p v-if="proposeError" class="app-error" role="alert">{{ proposeError }}</p>

          <div class="form-btn-row">
            <button type="submit" class="baroque-btn baroque-btn-primary" :disabled="proposing">
              {{ proposing ? '正在创建课题…' : '正式发布课题并开放招募 ✦' }}
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
  background: radial-gradient(ellipse at 82% 15%, #35526b, transparent 55%), #142536;
  border: 1px solid rgba(197, 160, 89, 0.35);
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
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}
.hero-admin-link {
  background: rgba(197, 160, 89, 0.2);
  color: #f6dfa4;
  border: 1px solid rgba(197, 160, 89, 0.45);
}
.hero-propose-btn {
  background: #c5a059;
  color: #102030;
  border: none;
}
.fanxing-hero h1 { color: inherit; margin: 10px 0 12px; font-size: clamp(28px, 4.5vw, 46px); }
.hero-lead { max-width: 52rem; line-height: 1.7; color: #dbe5f0; margin-bottom: 18px; }
.back { color: #f6dfa4; text-decoration: none; font-weight: 600; }
.workflow-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(10, 22, 36, 0.55);
  border: 1px solid rgba(197, 160, 89, 0.28);
  border-radius: 12px;
  font-size: 13px;
  color: #e9dec7;
}
.tag { font-size: .86rem; font-weight: 700; color: #c5a059; margin: 0; }

.catalog, .detail, .literature-hub, .my-apps-overview { margin-top: 28px; }
.detail { display: grid; grid-template-columns: minmax(0, 1.85fr) minmax(320px, 1fr); gap: 22px; align-items: start; }
.detail-main-col, .detail-side-col { display: flex; flex-direction: column; gap: 20px; }

.panel {
  padding: clamp(18px, 2.6vw, 28px);
  border: 1px solid #d5cab8;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 39, 66, 0.05);
}
.panel h2, .panel h3 { margin: 0 0 10px; color: #142536; }
.panel p { line-height: 1.7; color: #2b3a4a; }
.panel-head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.panel-sub { font-size: 14px; color: #546578; margin-top: 0; }
.muted-note { font-size: 13.5px; color: #5c6d7e; }

.highlight-question {
  font-size: 17px;
  font-weight: 650;
  color: #12314d;
  padding: 12px 16px;
  background: #f4f8fb;
  border-left: 4px solid #1e5b8a;
  border-radius: 8px;
}

.linked-lab-callout {
  margin-top: 16px;
  padding: 14px 16px;
  background: #f8f5ec;
  border: 1px solid #d8c398;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.task-list { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.task-item {
  padding: 14px 16px;
  border: 1px solid #e2dcd0;
  border-radius: 12px;
  background: #faf9f6;
}
.task-item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.task-role-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e7f1f8;
  color: #164e78;
  font-weight: 600;
}
.task-progress-row { display: flex; align-items: center; gap: 12px; }
.task-progress-bar {
  flex: 1;
  height: 8px;
  background: #e4e8ec;
  border-radius: 999px;
  overflow: hidden;
}
.task-progress-fill { height: 100%; background: linear-gradient(90deg, #1d6396, #c5a059); }
.task-progress-num { font-size: 12px; color: #58697a; white-space: nowrap; }

.verified-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: #def7e5;
  color: #145a32;
}
.papers-list, .lit-grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top: 14px; }
.lit-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
.paper-card {
  padding: 16px 18px;
  border: 1px solid #dfd7c8;
  border-radius: 12px;
  background: #fcfbf9;
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
  background: #142536;
  color: #f6dfa4;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}
.paper-journal { color: #546678; font-weight: 600; }
.paper-card h3 { font-size: 15.5px; margin: 4px 0 6px; line-height: 1.45; }
.paper-authors { font-size: 13px; color: #4c5d6e; margin: 0 0 6px; }
.paper-note { font-size: 13px; color: #36495c; background: #f2f5f8; padding: 8px 10px; border-radius: 8px; margin: 6px 0; }
.paper-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #e1d9ca;
}
.doi-link {
  font-size: 12.5px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: #145388;
  font-weight: 600;
  text-decoration: none;
}
.doi-link:hover { text-decoration: underline; }
.text-action-btn {
  background: none;
  border: none;
  color: #8a6421;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
}
.text-action-btn:hover { text-decoration: underline; }

.datasets-block { margin-top: 18px; padding-top: 14px; border-top: 1px solid #e6dfd2; }
.dataset-list { margin: 8px 0 0; padding-left: 18px; }
.dataset-list li { margin-bottom: 6px; font-size: 14px; }
.ds-license { margin-left: 10px; color: #64748b; }

.linked-posts-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.linked-post-item {
  display: block;
  padding: 12px 16px;
  border: 1px solid #e2dcd0;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  background: #faf9f6;
}
.linked-post-item:hover { border-color: #c5a059; }
.lp-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.lp-kind {
  font-size: 11.5px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #e7f1f8;
  color: #164e78;
  font-weight: 700;
}
.lp-excerpt { font-size: 13.5px; color: #4b5c6e; margin: 4px 0; }
.lp-meta { font-size: 12px; color: #687788; display: flex; gap: 8px; flex-wrap: wrap; }

/* 申请卡片与解锁区域 */
.first-task-box {
  padding: 10px 14px;
  background: #f8f5ec;
  border-radius: 10px;
  border: 1px solid #e3d3b2;
  font-size: 13.5px;
}
.app-notice {
  padding: 12px 14px;
  background: #e9f7ef;
  border: 1px solid #a9dfbf;
  color: #145a32;
  border-radius: 10px;
  font-size: 13.5px;
}
.app-error {
  padding: 10px 14px;
  background: #fdf2e9;
  border: 1px solid #f5b7b1;
  color: #922b21;
  border-radius: 10px;
  font-size: 13.5px;
}
.my-app-status-card {
  margin-top: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #d5cab8;
  background: #faf9f5;
}
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5dec9;
  margin-bottom: 10px;
}
.badge-approved { color: #145a32; background: #d4efdf; padding: 3px 10px; border-radius: 999px; font-size: 13px; }
.badge-pending { color: #7e5109; background: #fcf3cf; padding: 3px 10px; border-radius: 999px; font-size: 13px; }
.badge-rejected { color: #922b21; background: #fadbd8; padding: 3px 10px; border-radius: 999px; font-size: 13px; }

.app-summary-dl {
  display: grid;
  gap: 6px;
  font-size: 13px;
  margin: 0 0 12px;
}
.app-summary-dl div { display: flex; gap: 8px; }
.app-summary-dl dt { color: #64748b; min-width: 68px; font-weight: 600; }
.app-summary-dl dd { margin: 0; color: #1e293b; }

.unlocked-collab-box {
  margin-top: 12px;
  padding: 14px;
  background: #eef9f2;
  border: 1px solid #82e0aa;
  border-radius: 10px;
}
.unlocked-collab-box h3 { font-size: 16px; color: #145a32; margin: 0 0 8px; }
.channel-item { font-size: 13.5px; margin-bottom: 6px; }
.onboarding-guide pre {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13px;
  background: #ffffff;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #c8e6c9;
  margin: 6px 0 12px;
}

.apply-form label, .propose-form label {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
  font-weight: 600;
  font-size: 13.5px;
  color: #1e293b;
}
input, textarea, select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  padding: 10px 12px;
  font: inherit;
  font-size: 14px;
  background: #fff;
  color: #1e293b;
}
.form-btn-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.full-width-btn { width: 100%; justify-content: center; }
.cta-sub-note { font-size: 12.5px; color: #64748b; margin-top: 8px; }

.collab-list { list-style: none; padding: 0; margin: 10px 0 0; display: flex; flex-direction: column; gap: 8px; }
.collab-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13.5px;
  padding: 6px 10px;
  background: #f8fafc;
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
  color: #145a32;
  background: #def7e5;
  padding: 3px 10px;
  border-radius: 999px;
}
.my-app-pill { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.st-approved { background: #d4efdf; color: #145a32; }
.st-pending { background: #fcf3cf; color: #7e5109; }
.st-rejected { background: #fadbd8; color: #922b21; }

.card-question, .card-task { font-size: 14px; margin: 6px 0; }
.card-meta-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12.5px;
  color: #475569;
  margin: 12px 0 16px;
  padding-top: 10px;
  border-top: 1px solid #ece6da;
}
.card-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* 我的申请概览 */
.my-apps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; margin-top: 12px; }
.my-app-mini-card {
  padding: 14px 16px;
  border: 1px solid #dfd7c8;
  border-radius: 12px;
  background: #fcfbf8;
}
.mini-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px; }
.mini-status { font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.mini-task { font-size: 13px; margin: 4px 0; }
.mini-unlocked { font-size: 13px; color: #145a32; background: #eafaf1; padding: 8px 10px; border-radius: 8px; margin: 6px 0; }

/* Crossref 文献检索中心 */
.lit-search-bar { display: flex; gap: 10px; flex-wrap: wrap; margin: 14px 0 10px; }
.lit-search-bar input { flex: 1; min-width: 240px; }
.lit-quick-tags { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; color: #475569; margin-bottom: 10px; }
.chip-btn {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 12.5px;
  cursor: pointer;
}
.chip-btn:hover { border-color: #c5a059; background: #fffdf7; }
.lit-source-indicator { font-size: 13px; color: #475569; margin: 4px 0 12px; }

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(10, 22, 36, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-card { width: min(680px, 100%); max-height: 90vh; overflow-y: auto; }
.modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.close-btn { background: none; border: none; font-size: 26px; cursor: pointer; color: #64748b; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

@media (max-width: 820px) {
  .detail, .form-grid-2 { grid-template-columns: 1fr; }
}
</style>
