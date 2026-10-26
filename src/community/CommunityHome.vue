<template>
  <div class="community-page">
    <!-- 古典地理学会 × 皇家天文观测院风格 Hero -->
    <section class="community-hero baroque-frame">
      <div class="community-wrap community-hero-inner">
        <div>
          <div class="community-hero-badge">
            <span class="baroque-gem">✦</span>
            <span>GEOGRAPHICAL SCHOLARLY GUILD / 地理学术共同体</span>
          </div>
          <h1>格物致知 · 经纬探索<br><em class="baroque-gold-text">在这里，讨论地理。</em></h1>
          <p class="community-lead">
            面向自然地理、人文经济地理、GIS 遥感与中学地学教育。提出真问题，交换实测证据，让每一次学术探讨都成为沉淀的科学认知。
          </p>

          <form class="community-search baroque-search" @submit.prevent="runSearch">
            <label class="sr-only" for="community-query">搜索学术讨论与问答</label>
            <input
              id="community-query"
              v-model="queryInput"
              placeholder="搜索季风环流、DEM高程、喀斯特成因、考研真题、野外断层……"
              maxlength="100"
            />
            <button class="baroque-btn baroque-btn-brass" type="submit">检 索</button>
          </form>

          <div class="community-hero-actions">
            <a class="baroque-btn baroque-btn-primary" href="#compose" @click.prevent="focusCompose">发起学术讨论 ✍</a>
            <router-link class="baroque-btn baroque-btn-brass" to="/experiments">三维地理实验 ↗</router-link>
            <router-link class="baroque-btn" to="/groups">社群交流群导航 📜</router-link>
            <router-link v-if="isAdmin" class="baroque-btn" to="/community/manage">管委会后台</router-link>
          </div>
        </div>

        <aside class="community-hero-aside baroque-frame" aria-label="地理学精神">
          <div class="armillary-seal" aria-hidden="true">
            <svg viewBox="0 0 120 120" class="armillary-svg">
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 2" />
              <ellipse cx="60" cy="60" rx="54" ry="20" fill="none" stroke="currentColor" stroke-width="1.2" transform="rotate(-30 60 60)" />
              <ellipse cx="60" cy="60" rx="54" ry="20" fill="none" stroke="currentColor" stroke-width="1.2" transform="rotate(30 60 60)" />
              <circle cx="60" cy="60" r="28" fill="none" stroke="#c5a059" stroke-width="1.5" />
              <line x1="6" y1="60" x2="114" y2="60" stroke="#c5a059" stroke-width="1.5" />
              <line x1="60" y1="6" x2="60" y2="114" stroke="#c5a059" stroke-width="1.5" />
            </svg>
          </div>
          <span class="community-coordinate">35°00′ N · 103°00′ E</span>
          <strong>立足大地<br />仰望星河<br />经纬同道</strong>
          <p>从一条有深度的问题开始。</p>
        </aside>
      </div>
    </section>

    <!-- 地理学前沿热点聚合专栏 -->
    <section v-if="hotTopics.length" class="community-wrap hot-topics-bar baroque-frame" aria-labelledby="hot-topics-title">
      <div class="hot-topics-header">
        <span class="baroque-corner-ornament">❖</span>
        <h3 id="hot-topics-title">地学前沿观察与热点聚焦</h3>
        <span class="hot-topics-subtitle">TOPICAL GEOGRAPHY DISCUSSIONS</span>
      </div>
      <div class="hot-topics-grid">
        <article v-for="topic in hotTopics" :key="topic.id" class="hot-topic-card" @click="filterByTag(topic.tag)">
          <span class="topic-tag">{{ topic.tag }}</span>
          <h4>{{ topic.title }}</h4>
          <p>{{ topic.summary }}</p>
          <div class="topic-foot">
            <small>{{ topic.stats }}</small>
            <span class="topic-link">参与探讨 →</span>
          </div>
        </article>
      </div>
    </section>

    <div class="community-wrap community-layout">
      <!-- 讨论主栏 -->
      <div class="community-main">
        <!-- 运行模式状态横幅 -->
        <aside v-if="isDemoMode" class="demo-mode-banner" aria-label="运行模式提示">
          <div class="demo-banner-content">
            <span class="demo-banner-tag">✦ 学术演示模式</span>
            <span>当前云端账号服务暂未连接，已自动载入高保真地理学术讨论样例；发帖及交互将在本地浏览器即时生效。</span>
          </div>
          <div class="demo-banner-actions">
            <button class="baroque-btn baroque-btn-sm" type="button" :disabled="loading" @click="retryOnline">
              {{ loading ? '连接中…' : '连接云端服务' }}
            </button>
          </div>
        </aside>

        <div class="community-section-heading">
          <div>
            <p class="community-eyebrow">THE SCHOLARLY FORUM / 论坛交流</p>
            <h2>{{ searchQuery ? `检索：“${searchQuery}”` : selectedCategoryName ? `${selectedCategoryName} 分区` : selectedTag ? `标签 #${selectedTag}` : '全部学术讨论与问答' }}</h2>
          </div>
          <button v-if="searchQuery || selectedCategory || kind || selectedTag" class="community-clear baroque-btn baroque-btn-sm" type="button" @click="clearFilters">清除全部筛选</button>
        </div>

        <!-- 筛选与排序控制器 -->
        <div class="community-toolbar">
          <div class="community-filters" aria-label="讨论类型">
            <button type="button" :class="['baroque-filter-btn', { active: kind === '' }]" @click="setKind('')">全部动态</button>
            <button type="button" :class="['baroque-filter-btn', { active: kind === 'question' }]" @click="setKind('question')">❓ 学术问答</button>
            <button type="button" :class="['baroque-filter-btn', { active: kind === 'discussion' }]" @click="setKind('discussion')">💬 经验探讨</button>
          </div>
          <div class="community-sort" aria-label="排序规则">
            <button type="button" :class="['baroque-sort-btn', { active: sortMode === 'newest' }]" @click="setSort('newest')">最新发布</button>
            <button type="button" :class="['baroque-sort-btn', { active: sortMode === 'popular' }]" @click="setSort('popular')">最受关注 🔥</button>
          </div>
        </div>

        <!-- 骨架屏加载状态 -->
        <div v-if="loading && !posts.length" class="skeleton-stack" aria-busy="true">
          <div v-for="i in 3" :key="i" class="skeleton-card" style="margin-bottom: 16px">
            <div class="skeleton-box skeleton-line skeleton-line-short"></div>
            <div class="skeleton-box skeleton-line skeleton-line-title"></div>
            <div class="skeleton-box skeleton-line"></div>
          </div>
        </div>

        <p v-else-if="error && !posts.length" class="community-state community-error" role="alert">
          {{ error }}
          <br />
          <button class="baroque-btn baroque-btn-sm" style="margin-top: 12px" @click="loadPosts">重新尝试</button>
        </p>
        <p v-else-if="!posts.length" class="community-state">暂无符合条件的学术讨论。欢迎在此留下你的深刻发问。</p>

        <div v-else class="community-post-list">
          <article v-for="post in posts" :key="post.id" class="community-post-card baroque-frame">
            <div class="community-post-meta">
              <span class="category-pill">{{ post.category }}</span>
              <span :class="['kind-pill', post.kind === 'question' ? 'kind-question' : 'kind-discussion']">
                {{ post.kind === 'question' ? '学术问答' : '学术交流' }}
              </span>
              <span v-if="post.acceptedReplyId" class="accepted-pill">✓ 最佳答案已采纳</span>
              <span v-if="post.linkedExperiment" class="experiment-pill">🔬 附带 3D 实验</span>
              <span v-if="post.evidenceId" class="evidence-badge" style="margin-left: 4px">📊 挂载实测证据</span>
            </div>

            <h3 class="post-title">
              <router-link :to="`/community/post/${post.id}`">{{ post.title }}</router-link>
            </h3>

            <p class="post-excerpt">{{ post.excerpt }}</p>

            <!-- 标签列表 -->
            <div v-if="post.tags && post.tags.length" class="post-tags-row">
              <span v-for="t in post.tags" :key="t" class="post-tag-item" @click.stop="filterByTag(t)">#{{ t }}</span>
            </div>

            <div class="community-post-foot">
              <span class="author-info">
                <router-link v-if="post.authorId" :to="`/community/user/${post.authorId}`" class="author-link" @click.stop>
                  👤 {{ post.author }}
                </router-link>
                <span v-else>👤 {{ post.author }}</span>
                <span class="post-date">· {{ formatDate(post.createdAt) }}</span>
              </span>

              <div class="post-stats-right">
                <span class="stat-badge">赞同 {{ post.likeCount || 0 }}</span>
                <span class="stat-badge">回复 {{ post.replyCount || 0 }}</span>
              </div>
            </div>
          </article>
        </div>

        <button v-if="posts.length === 20" class="community-more baroque-btn baroque-btn-brass" type="button" @click="nextPage">翻阅更多讨论</button>

        <!-- 撰写与发起讨论板块 -->
        <section id="compose" ref="composeRef" class="community-compose baroque-frame" aria-labelledby="compose-title">
          <div class="community-section-heading">
            <div>
              <p class="community-eyebrow">INSCRIBE TO THE GUILD</p>
              <h2 id="compose-title">发起一场学术探讨</h2>
            </div>
          </div>
          <p v-if="!user && !isDemoMode" class="community-state">登录后即可提出问题、分享经验和发表见解。<a :href="`${accountOrigin}/#/account`">登录 / 注册 ↗</a></p>
          <form v-else class="community-compose-form" @submit.prevent="createPost">
            <div class="community-form-row">
              <label>讨论类型
                <select v-model="draft.kind">
                  <option value="question">提出科学问答 (寻找同行解答)</option>
                  <option value="discussion">经验与学术交流 (分享观察见闻)</option>
                </select>
              </label>
              <label>学科分区
                <select v-model.number="draft.categoryId" required>
                  <option disabled value="">请选择专业领域分区</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                </select>
              </label>
            </div>

            <label>议题标题
              <input v-model.trim="draft.title" required maxlength="120" placeholder="用一句话清晰阐明你的核心地理学术问题或讨论主题" />
            </label>

            <!-- 公式快捷助手工具栏 -->
            <div class="editor-assist-bar">
              <span class="assist-label">地学公式助手：</span>
              <button
                v-for="item in GEO_FORMULA_PRESETS"
                :key="item.name"
                type="button"
                class="formula-chip"
                :title="item.desc"
                @click="insertFormulaToDraft(item.latex)"
              >
                {{ item.name }}
              </button>
            </div>

            <label>正文内容 (支持学术描述、野外观察数据、定理依据，支持 $公式$ 与 $$块级公式$$)
              <textarea v-model.trim="draft.body" required maxlength="10000" rows="7" placeholder="提供完整的地貌背景、空间尺度、观测数据或已尝试的计算推导。请尊重科学求证精神，并注明引用来源与数据出处。" />
            </label>

            <div class="community-form-row">
              <label>学科标签 (英文逗号或空格隔开)
                <input v-model.trim="tagsInput" maxlength="60" placeholder="如：地貌学, 喀斯特, 遥感解译, 考研真题" />
              </label>
              <label>挂载站内 3D 实验 (可选)
                <select v-model="draft.linkedExperiment">
                  <option value="">不挂载实验模型</option>
                  <option value="fault-model">断层模型（挤压造山与断裂）</option>
                  <option value="thermal-circulation">热力环流与风向动力学</option>
                  <option value="water-cycle-3d">三维水循环与陆地径流</option>
                  <option value="moon-phases">月相与日地月空间几何</option>
                  <option value="earth-system">地球内部圈层与构造</option>
                  <option value="stream-table">水土冲刷微缩实验台</option>
                </select>
              </label>
              <label>挂载探究实测证据卡 (可选)
                <select v-model="draft.evidenceId">
                  <option value="">不挂载实测证据卡</option>
                  <option v-for="ev in STANDARD_EVIDENCES" :key="ev.id" :value="ev.id">
                    [{{ ev.taskTitle }}] {{ ev.title }}
                  </option>
                </select>
              </label>
            </div>

            <p v-if="submitError" class="community-error" role="alert">{{ submitError }}</p>
            <div class="form-submit-row">
              <button class="baroque-btn baroque-btn-primary" type="submit" :disabled="submitting">
                {{ submitting ? '正在呈交讨论…' : '发布学术探讨 ✦' }}
              </button>
            </div>
          </form>
        </section>
      </div>

      <!-- 侧边栏：巴洛克学术分区与快捷社群 -->
      <aside class="community-sidebar">
        <!-- 专业分区 -->
        <section class="community-side-block baroque-frame">
          <div class="side-block-header">
            <span class="baroque-corner-ornament">⚜</span>
            <h2>专业分区</h2>
          </div>
          <p v-if="!categories.length" class="community-side-note">正在载入学科分区……</p>
          <div class="category-menu">
            <button
              v-for="category in categories"
              :key="category.id"
              class="community-category baroque-cat-btn"
              type="button"
              :class="{ active: selectedCategory === category.id }"
              :aria-pressed="selectedCategory === category.id"
              @click="setCategory(category.id)"
            >
              <div class="cat-left">
                <span class="cat-name">{{ category.name }}</span>
                <small class="cat-desc">{{ category.description }}</small>
              </div>
              <span class="cat-arrow">→</span>
            </button>
          </div>
        </section>

        <!-- 社群 QQ 导航微卡 -->
        <section class="community-side-block baroque-frame group-side-promo">
          <div class="side-block-header">
            <span class="baroque-corner-ornament">📜</span>
            <h2>学术交流群</h2>
          </div>
          <p class="side-promo-desc">找同行、聊科研、备考研、磨教案。社群信息在核实公开展示授权后收录；也欢迎先在站内公开讨论。</p>
          <router-link to="/groups" class="baroque-btn baroque-btn-sm baroque-btn-brass promo-btn">
            浏览全部社群导航 →
          </router-link>
        </section>

        <!-- 3D 实验室与数据探究快捷入口 -->
        <section class="community-side-block baroque-frame">
          <div class="side-block-header">
            <span class="baroque-corner-ornament">🧭</span>
            <h2>地学互动入口</h2>
          </div>
          <div class="side-link-list">
            <router-link to="/experiments" class="side-exp-link">
              <span>🔬 3D 虚拟地理实验室</span>
              <small>29+ 项动力学交互仿真</small>
            </router-link>
            <router-link to="/resources" class="side-exp-link">
              <span>📚 开放地理科学数据馆</span>
              <small>DEM、ERA5、矢量底图</small>
            </router-link>
            <router-link to="/geo-labs" class="side-exp-link">
              <span>🛰 真实遥感数据探究</span>
              <small>珠峰DEM剖面、MODIS对比</small>
            </router-link>
            <router-link to="/calendar" class="side-exp-link">
              <span>⏳ 空间地学时空历法</span>
              <small>天象预测与全球地震实录</small>
            </router-link>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { accountEnabled, accountOrigin, apiRequest, authClient } from '../account/client.js'
import { mockCategories, mockHotTopics, mockPosts } from './mockData.js'
import { toast } from '../utils/toast.js'
import { GEO_FORMULA_PRESETS } from '../utils/mathFormula.js'
import { STANDARD_EVIDENCES } from '../inquiry/evidenceCatalog.js'

const router = useRouter()
const route = useRoute()
const categories = ref([])
const posts = ref([])
const hotTopics = ref([])
const user = ref(null)
const isAdmin = ref(false)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const submitError = ref('')
const queryInput = ref('')
const searchQuery = ref('')
const selectedCategory = ref(null)
const selectedTag = ref('')
const kind = ref(route.path === '/questions' ? 'question' : '')
const sortMode = ref('newest')
const page = ref(1)
const composeRef = ref(null)
const tagsInput = ref('')
const isDemoMode = ref(false)

const draft = reactive({
  kind: 'question',
  categoryId: '',
  title: '',
  body: '',
  linkedExperiment: '',
  evidenceId: ''
})

function insertFormulaToDraft(latex) {
  const snippet = ` $${latex}$ `
  draft.body += snippet
}

let stream

const formatDate = value => {
  try {
    return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
  } catch {
    return String(value)
  }
}

const selectedCategoryName = computed(() => {
  if (!selectedCategory.value) return ''
  const cat = categories.value.find(c => c.id === selectedCategory.value)
  return cat ? cat.name : ''
})

function getLocalDemoPosts() {
  try {
    const raw = localStorage.getItem('local_community_posts')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalDemoPost(newPost) {
  try {
    const list = getLocalDemoPosts()
    list.unshift(newPost)
    localStorage.setItem('local_community_posts', JSON.stringify(list))
  } catch {
    // ignore
  }
}

async function loadPosts(append = false) {
  loading.value = true
  error.value = ''
  try {
    if (!isDemoMode.value && accountEnabled) {
      const params = new URLSearchParams({ page: String(page.value) })
      if (searchQuery.value) params.set('q', searchQuery.value)
      if (selectedCategory.value) params.set('category', String(selectedCategory.value))
      if (kind.value) params.set('kind', kind.value)
      if (selectedTag.value) params.set('tag', selectedTag.value)
      if (sortMode.value === 'popular') params.set('sort', 'popular')
      const result = await apiRequest(`/api/community/posts?${params}`)
      posts.value = append ? [...posts.value, ...result.posts] : result.posts
      return
    }
  } catch {
    isDemoMode.value = true
  }

  // 离线/演示降级处理
  isDemoMode.value = true
  const localList = getLocalDemoPosts()
  let pool = [...localList, ...mockPosts]

  if (selectedCategory.value) {
    pool = pool.filter(p => p.category_id === selectedCategory.value)
  }
  if (kind.value) {
    pool = pool.filter(p => p.kind === kind.value)
  }
  if (selectedTag.value) {
    pool = pool.filter(p => p.tags && p.tags.includes(selectedTag.value))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    pool = pool.filter(p => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q))
  }
  if (sortMode.value === 'popular') {
    pool.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
  }

  // 映射统一卡片字段
  posts.value = pool.map(p => ({
    ...p,
    category: p.category || p.categoryName || '地学学术',
    excerpt: p.excerpt || (p.body ? p.body.slice(0, 120) + '…' : '')
  }))
  loading.value = false
}

function resetAndLoad() { page.value = 1; void loadPosts() }
function runSearch() { searchQuery.value = queryInput.value.trim(); resetAndLoad() }
function clearFilters() { queryInput.value = ''; searchQuery.value = ''; selectedCategory.value = null; selectedTag.value = ''; kind.value = ''; resetAndLoad() }
function setCategory(id) { selectedCategory.value = selectedCategory.value === id ? null : id; resetAndLoad() }
function setKind(value) { kind.value = value; resetAndLoad() }
function setSort(mode) { sortMode.value = mode; resetAndLoad() }
function filterByTag(tag) { selectedTag.value = tag; resetAndLoad() }
function nextPage() { page.value += 1; void loadPosts(true) }
function focusCompose() { composeRef.value?.scrollIntoView({ behavior: 'smooth' }); composeRef.value?.querySelector('input')?.focus({ preventScroll: true }) }

async function retryOnline() {
  isDemoMode.value = false
  await initCommunity()
}

async function createPost() {
  if (!draft.title.trim() || !draft.body.trim()) {
    submitError.value = '请填写完整的标题和探讨内容。'
    return
  }
  submitting.value = true
  submitError.value = ''
  try {
    const tags = tagsInput.value.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean)
    const payload = {
      ...draft,
      tags
    }

    if (!isDemoMode.value && accountEnabled) {
      const result = await apiRequest('/api/community/posts', { method: 'POST', body: JSON.stringify(payload) })
      toast.success('学术探讨已成功发布！')
      await router.push(`/community/post/${result.id}`)
      return
    }

    // 演示/离线模式本地持久化
    const newId = Date.now()
    const catObj = categories.value.find(c => c.id === Number(draft.categoryId))
    const localPost = {
      id: newId,
      title: draft.title,
      body: draft.body,
      kind: draft.kind,
      category_id: Number(draft.categoryId) || 1,
      categoryName: catObj ? catObj.name : '地理学综合交流',
      tags,
      linked_experiment: draft.linkedExperiment || null,
      evidenceId: draft.evidenceId || null,
      author: {
        id: 'me',
        name: user.value?.name || '我 (本地研究者)',
        title: '青年地学探索者'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likesCount: 1,
      bookmarksCount: 0,
      repliesCount: 0,
      replies: []
    }
    saveLocalDemoPost(localPost)
    toast.success('【演示模式】探讨已暂存于本地，可在列表中查看')
    draft.title = ''
    draft.body = ''
    tagsInput.value = ''
    draft.linkedExperiment = ''
    draft.evidenceId = ''
    await loadPosts()
  } catch (cause) {
    submitError.value = cause.message
  } finally {
    submitting.value = false
  }
}

watch(() => route.path, (newPath) => {
  if (newPath === '/questions') {
    kind.value = 'question'
    resetAndLoad()
  } else if (newPath === '/community') {
    kind.value = ''
    resetAndLoad()
  }
})

async function initCommunity() {
  if (!accountEnabled) {
    isDemoMode.value = true
    categories.value = mockCategories
    hotTopics.value = mockHotTopics
    draft.categoryId = String(mockCategories[0].id)
    await loadPosts()
    return
  }

  try {
    const [categoryResult, sessionResult, hotTopicResult] = await Promise.allSettled([
      apiRequest('/api/community/categories'),
      authClient.getSession(),
      apiRequest('/api/community/hot-topics')
    ])
    if (categoryResult.status === 'fulfilled' && categoryResult.value?.categories?.length) {
      categories.value = categoryResult.value.categories
      isDemoMode.value = false
    } else {
      categories.value = mockCategories
      isDemoMode.value = true
    }

    if (sessionResult.status === 'fulfilled') {
      user.value = sessionResult.value.data?.user || null
    }

    if (hotTopicResult.status === 'fulfilled' && hotTopicResult.value?.topics?.length) {
      hotTopics.value = hotTopicResult.value.topics
    } else {
      hotTopics.value = mockHotTopics
    }

    if (user.value) {
      const me = await apiRequest('/api/community/me').catch(() => null)
      isAdmin.value = Boolean(me?.isAdmin)
    }

    if (!draft.categoryId && categories.value.length) {
      draft.categoryId = String(categories.value[0].id)
    }

    await loadPosts()

    if (!isDemoMode.value && typeof EventSource !== 'undefined') {
      try {
        stream = new EventSource(`${accountOrigin}/api/community/stream`)
        stream.addEventListener('community', () => { if (page.value === 1) void loadPosts() })
      } catch {
        // ignore stream errors in demo environments
      }
    }
  } catch {
    isDemoMode.value = true
    categories.value = mockCategories
    hotTopics.value = mockHotTopics
    if (!draft.categoryId && categories.value.length) {
      draft.categoryId = String(categories.value[0].id)
    }
    await loadPosts()
  }
}

onMounted(initCommunity)
onBeforeUnmount(() => stream?.close())
</script>

<style scoped>
/* 继承并深化全局巴洛克与古典地理学会视觉系统 */
.community-page {
  padding-bottom: 90px;
}

.community-hero {
  background: radial-gradient(circle at 75% 30%, #172d4a 0%, #0c1c30 50%, #050d18 100%);
  color: #f7f5ed;
  padding: 64px 0 54px;
  margin-bottom: 36px;
  border-bottom: 2px solid rgba(197, 160, 89, 0.4);
  box-shadow: var(--shadow-md);
}

.community-hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  gap: 40px;
  align-items: center;
}

.community-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  letter-spacing: 0.16em;
  font-weight: 700;
  color: #d8c28e;
  margin-bottom: 14px;
}

.baroque-gem {
  color: #c5a059;
}

.community-hero h1 {
  font-size: clamp(34px, 4.5vw, 56px);
  line-height: 1.15;
  margin: 0 0 18px;
  font-family: Georgia, 'Playfair Display', 'Songti SC', serif;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #ffffff;
}

.baroque-gold-text {
  font-style: normal;
  background: linear-gradient(135deg, #f4e5c3 0%, #d8b776 50%, #b88d3e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.community-lead {
  font-size: 16px;
  line-height: 1.8;
  color: #c9d6df;
  max-width: 640px;
  margin: 0 0 28px;
}

.community-search {
  display: flex;
  gap: 8px;
  max-width: 640px;
  margin-bottom: 26px;
}

.community-search input {
  flex: 1;
  min-height: 44px;
  padding: 0 16px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(197, 160, 89, 0.4);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  color: #ffffff;
  font-size: 14px;
}

.community-search input::placeholder {
  color: #8fa5b8;
}

.community-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.community-hero-aside {
  padding: 28px;
  border-radius: var(--radius-box);
  background: rgba(10, 25, 45, 0.65);
  border: 1px solid rgba(197, 160, 89, 0.35);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.armillary-seal {
  width: 90px;
  height: 90px;
  color: #9bb7d4;
  margin-bottom: 12px;
}

.armillary-svg {
  width: 100%;
  height: 100%;
}

.community-coordinate {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #c5a059;
  margin-bottom: 8px;
}

.community-hero-aside strong {
  font-size: 20px;
  line-height: 1.4;
  color: #ffffff;
  font-family: Georgia, 'Playfair Display', serif;
  margin-bottom: 8px;
}

.community-hero-aside p {
  margin: 0;
  font-size: 13px;
  color: #9ab4c8;
}

/* 热点聚合条 */
.hot-topics-bar {
  margin-bottom: 36px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-box);
  padding: 24px 28px;
  box-shadow: var(--shadow-sm);
}

.hot-topics-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.baroque-corner-ornament {
  color: #c5a059;
  font-size: 15px;
}

.hot-topics-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--geo-ocean-deep);
}

.hot-topics-subtitle {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 10.5px;
  letter-spacing: 0.12em;
  color: var(--text-faint);
  margin-left: 6px;
}

.hot-topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.hot-topic-card {
  padding: 16px;
  border-radius: var(--radius-card);
  background: var(--bg-soft);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s var(--geo-flow-ease), border-color 0.2s, box-shadow 0.2s;
}

.hot-topic-card:hover {
  transform: translateY(-2px);
  border-color: #c5a059;
  background: #ffffff;
  box-shadow: var(--shadow-sm);
}

.topic-tag {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--geo-ocean);
  margin-bottom: 6px;
  display: inline-block;
}

.hot-topic-card h4 {
  margin: 0 0 8px;
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--geo-ocean-deep);
}

.hot-topic-card p {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-muted);
  margin: 0 0 12px;
  flex: 1;
}

.topic-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: var(--text-faint);
  border-top: 1px dashed rgba(0,0,0,0.06);
  padding-top: 8px;
}

.topic-link {
  color: var(--geo-ocean);
  font-weight: 700;
}

/* 社区主体布局 */
.community-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr);
  gap: 36px;
}

.community-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.baroque-filter-btn {
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--geo-btn-transition);
}

.baroque-filter-btn.active {
  background: var(--geo-ocean);
  color: #ffffff;
  border-color: var(--geo-ocean);
  box-shadow: var(--geo-btn-primary-shadow);
}

.baroque-sort-btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-faint);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.baroque-sort-btn.active {
  color: var(--geo-ocean);
  background: var(--geo-ocean-surface);
  border-color: var(--border);
}

/* 帖子卡片 */
.community-post-card {
  padding: 24px;
  margin-bottom: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s var(--geo-flow-ease), box-shadow 0.2s, border-color 0.2s;
}

.community-post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--geo-ocean);
}

.community-post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.category-pill {
  font-size: 11px;
  font-weight: 700;
  color: var(--geo-ocean);
  background: var(--geo-ocean-surface);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(26,68,108,0.12);
}

.kind-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
}

.kind-question {
  background: #fdf5e9;
  color: #b37318;
  border: 1px solid rgba(179,115,24,0.2);
}

.kind-discussion {
  background: #edf5f0;
  color: var(--geo-green-deep);
  border: 1px solid rgba(45,106,79,0.2);
}

.accepted-pill {
  font-size: 11px;
  font-weight: 700;
  background: #eef8f0;
  color: #2e7d5b;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(46,125,91,0.25);
}

.experiment-pill {
  font-size: 11px;
  font-weight: 700;
  background: #f0f4fa;
  color: var(--geo-ocean);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(26,68,108,0.18);
}

.post-title {
  margin: 0 0 10px;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.4;
}

.post-title a {
  color: var(--geo-ocean-deep);
  text-decoration: none;
}

.post-title a:hover {
  color: var(--geo-ocean);
  text-decoration: underline;
}

.post-excerpt {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-muted);
  margin: 0 0 14px;
}

.post-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.post-tag-item {
  font-size: 11.5px;
  color: var(--text-muted);
  background: var(--bg-soft);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.post-tag-item:hover {
  color: var(--geo-ocean);
  background: var(--geo-ocean-surface);
}

.community-post-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  color: var(--text-faint);
  border-top: 1px dashed var(--border);
  padding-top: 12px;
}

.author-link {
  color: var(--geo-ocean);
  text-decoration: none;
  font-weight: 600;
}

.author-link:hover {
  text-decoration: underline;
}

.post-stats-right {
  display: flex;
  gap: 12px;
}

.stat-badge {
  font-size: 12px;
  color: var(--text-muted);
}

/* 侧边栏 */
.community-side-block {
  padding: 24px;
  margin-bottom: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.side-block-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 10px;
}

.side-block-header h2 {
  margin: 0;
  font-size: 16.5px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.category-menu {
  display: grid;
  gap: 6px;
}

.baroque-cat-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: var(--bg-soft);
  cursor: pointer;
  text-align: left;
  transition: var(--geo-btn-transition);
}

.baroque-cat-btn:hover {
  background: var(--geo-ocean-surface);
  border-color: var(--border);
}

.baroque-cat-btn.active {
  background: var(--geo-ocean-surface);
  border-color: var(--geo-ocean);
}

.cat-left {
  display: flex;
  flex-direction: column;
}

.cat-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.cat-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.cat-arrow {
  color: var(--text-faint);
  font-size: 13px;
}

.group-side-promo {
  border-color: rgba(197, 160, 89, 0.4);
}

.side-promo-desc {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-muted);
  margin: 0 0 14px;
}

.group-mini-list {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.group-mini-item {
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-soft);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.group-mini-item strong {
  font-size: 12.5px;
  color: var(--geo-ocean-deep);
}

.group-mini-item span {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: #c5a059;
  font-weight: 700;
}

.promo-btn {
  width: 100%;
  text-align: center;
  display: block;
  text-decoration: none;
}

.side-link-list {
  display: grid;
  gap: 8px;
}

.side-exp-link {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-soft);
  text-decoration: none;
  border: 1px solid var(--border);
  transition: var(--geo-btn-transition);
}

.side-exp-link:hover {
  background: var(--geo-ocean-surface);
  border-color: var(--geo-ocean);
  transform: var(--geo-btn-elevate);
}

.side-exp-link span {
  font-size: 13px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.side-exp-link small {
  font-size: 11px;
  color: var(--text-muted);
}

/* 发起讨论表单 */
.community-compose {
  margin-top: 48px;
  padding: 32px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-box);
  box-shadow: var(--shadow-sm);
}

.community-compose-form {
  display: grid;
  gap: 16px;
}

.community-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.community-compose label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--geo-ocean);
}

.form-submit-row {
  margin-top: 8px;
}

@media (max-width: 860px) {
  .community-hero-inner {
    grid-template-columns: 1fr;
  }
  .community-hero-aside {
    display: none;
  }
  .community-layout {
    grid-template-columns: 1fr;
  }
  .community-form-row {
    grid-template-columns: 1fr;
  }
}
</style>
