<template>
  <main class="search-page community-wrap" :class="`theme-${activeDesignTheme}`">
    <nav class="search-breadcrumb" aria-label="面包屑导航">
      <router-link to="/" class="search-back-link">← 返回地理共同体首页</router-link>
      <span class="crumb-sep" aria-hidden="true">/</span>
      <span class="crumb-current">全站检索与话题索引</span>
    </nav>

    <!-- 维基百科式检索主头部 -->
    <header class="search-hero-panel">
      <div class="search-hero-top">
        <div>
          <p class="search-eyebrow">GEOGRAPHY COMPENDIUM &amp; EMPIRICAL SEARCH</p>
          <h1>全站地理知识、社区讨论与科研检索</h1>
        </div>
        <div class="search-scope-note">
          覆盖：社区讨论 · 29 项 3D 实验 · 教材章节 · 繁星科研课题与 DOI 文献 · 开放数据资源 · 近期地理事件
        </div>
      </div>

      <form class="wiki-search-form" role="search" aria-label="全站搜索表单" @submit.prevent="submitSearch">
        <div class="wiki-input-group">
          <span class="wiki-search-icon" aria-hidden="true">🔍</span>
          <input
            ref="searchInputRef"
            v-model="inputKeyword"
            type="search"
            class="wiki-search-input"
            placeholder="输入地理概念、实验名称、讨论话题、标签（如：热力环流、城市内涝、DEM高程、喀斯特）…"
            aria-label="搜索关键词"
            maxlength="100"
          />
          <button
            v-if="inputKeyword"
            type="button"
            class="wiki-clear-btn"
            aria-label="清空搜索词"
            @click="clearKeyword"
          >
            ×
          </button>
        </div>
        <button type="submit" class="wiki-submit-btn">检索全站</button>
        <button type="button" class="wiki-share-btn" @click="copyShareLink">
          {{ copied ? '✓ 已复制链接' : '🔗 分享检索页' }}
        </button>
      </form>

      <!-- 热门检索词与典型标签快捷导航 -->
      <div class="search-quick-row">
        <span class="quick-label">推荐词条与话题标签：</span>
        <button
          v-for="chip in recommendedQueries"
          :key="chip"
          type="button"
          class="quick-query-chip"
          :class="{ active: activeQuery.toLowerCase() === chip.toLowerCase() }"
          @click="applyQuickQuery(chip)"
        >
          {{ chip }}
        </button>
      </div>

      <!-- 按真实可检索内容类型筛选标签栏（绝不展示未实现的空壳分类） -->
      <div class="search-type-tabs" role="tablist" aria-label="按内容类型筛选搜索结果">
        <button
          v-for="tab in typeTabs"
          :key="tab.key"
          type="button"
          role="tab"
          :aria-selected="activeType === tab.key"
          class="type-tab-btn"
          :class="{ active: activeType === tab.key }"
          @click="setTypeFilter(tab.key)"
        >
          <span>{{ tab.label }}</span>
          <span class="type-count-badge">{{ tab.count }}</span>
        </button>
      </div>
    </header>

    <p v-if="eventsLoading" role="status">正在检索近期地理事件……</p>
    <p v-if="eventsFailed" role="status">近期事件暂时无法读取，<button type="button" @click="fetchEvents(activeQuery)">重试事件检索</button></p>
    <!-- 维基百科式「精确词条匹配 / 最佳直达入口」卡片 -->
    <section
      v-if="exactMatches.length && activeQuery"
      class="exact-match-banner"
      aria-labelledby="exact-match-heading"
    >
      <div class="exact-banner-head">
        <span class="exact-pill">★ 精确词条 / 最佳直达匹配</span>
        <span id="exact-match-heading" class="exact-hint">
          找到与“<strong>{{ activeQuery }}</strong>”直接对应的核心实验或词条，可一键进入：
        </span>
      </div>
      <div class="exact-cards-grid">
        <article v-for="item in exactMatches" :key="`exact-${item.id}`" class="exact-card">
          <div class="exact-card-main">
            <div class="result-meta-line">
              <span class="result-type-badge" :class="`badge-${item.typeKey}`">{{ item.type }}</span>
              <span class="result-sub-badge">{{ item.badge }}</span>
              <span class="result-cat-label">{{ item.category }}</span>
            </div>
            <h2 class="exact-card-title">
              <a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noopener noreferrer">{{ item.title }}</a>
            <router-link v-else :to="item.route">{{ item.title }}</router-link>
            </h2>
            <p class="exact-card-desc">{{ item.desc }}</p>
            <div v-if="item.tags && item.tags.length" class="result-tags-row">
              <button
                v-for="t in item.tags"
                :key="t"
                type="button"
                class="result-tag-chip"
                @click="applyQuickQuery(t)"
              >
                #{{ t }}
              </button>
            </div>
          </div>
          <div class="exact-card-cta">
            <a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noopener noreferrer" class="direct-enter-btn">查看原始监测记录 ↗</a>
            <router-link v-else :to="item.route" class="direct-enter-btn">
              直接进入词条 / 实验 →
            </router-link>
          </div>
        </article>
      </div>
    </section>

    <!-- 状态提示：加载中、社区接口离线降级说明、空结果 -->
    <div v-if="communityLoading" class="search-status-bar" role="status">
      <span class="spinner-dot" aria-hidden="true"></span>
      <span>正在同步检索社区讨论与问答库……</span>
    </div>

    <div v-if="communityNotice" class="search-status-bar is-notice" role="status">
      <span>ℹ️ {{ communityNotice }}</span>
      <button v-if="communityFailed" type="button" class="retry-inline-btn" @click="fetchCommunityPosts(activeQuery)">
        重试社区连接
      </button>
    </div>

    <!-- 无搜索词时的分类索引总览 -->
    <section v-if="!activeQuery" class="directory-overview" aria-label="全站可检索资源分类导览">
      <div class="directory-grid">
        <div class="directory-card">
          <h3>🔬 3D 虚拟地理实验室（{{ EXPERIMENT_INDEX.length }} 项）</h3>
          <p>覆盖大气热力环流、科里奥利力、流水冲刷水槽、褶皱断层、正午太阳高度等交互动力学模型。</p>
          <div class="dir-samples">
            <button type="button" class="result-tag-chip" @click="applyQuickQuery('热力环流')">#热力环流</button>
            <button type="button" class="result-tag-chip" @click="applyQuickQuery('正午太阳高度')">#正午太阳高度</button>
            <button type="button" class="result-tag-chip" @click="applyQuickQuery('断层')">#断层与褶皱</button>
          </div>
        </div>
        <div class="directory-card">
          <h3>📖 课程教材与结构化知识库（{{ CURRICULUM_INDEX.length }} 项）</h3>
          <p>初中七八年级、高中必修一/二、选择性必修 1~3、大学自然地理学及理论物理宇宙学章节。</p>
          <div class="dir-samples">
            <button type="button" class="result-tag-chip" @click="applyQuickQuery('必修一')">#高中必修一</button>
            <button type="button" class="result-tag-chip" @click="applyQuickQuery('水循环')">#水循环</button>
            <button type="button" class="result-tag-chip" @click="applyQuickQuery('喀斯特')">#喀斯特地貌</button>
          </div>
        </div>
        <div class="directory-card">
          <h3>🌟 繁星科研课题与开放数据（{{ FANXING_INDEX.length + RESOURCE_INDEX.length }} 项）</h3>
          <p>徐州土地覆盖遥感、城市蓝绿空间降温、海绵城市暴雨径流课题及 NASA/ERA5 开放数据集。</p>
          <div class="dir-samples">
            <button type="button" class="result-tag-chip" @click="applyQuickQuery('海绵城市')">#海绵城市</button>
            <button type="button" class="result-tag-chip" @click="applyQuickQuery('DEM高程')">#DEM高程</button>
            <button type="button" class="result-tag-chip" @click="applyQuickQuery('ERA5')">#ERA5再分析</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 搜索结果列表 -->
    <section v-else class="search-results-section" aria-label="检索结果列表">
      <div class="results-summary-bar">
        <p class="results-count-text">
          检索词“<strong>{{ activeQuery }}</strong>”在<strong>{{ currentTabLabel }}</strong>下共找到
          <strong>{{ filteredResults.length }}</strong> 条真实内容
        </p>
        <div class="results-quick-actions">
          <router-link
            :to="{ path: '/', query: { q: activeQuery }, hash: '#community-feed' }"
            class="secondary-link-btn"
          >
            在首页讨论流中筛选 →
          </router-link>
          <router-link
            :to="{ path: '/', query: { compose: '1', kind: 'question', title: activeQuery }, hash: '#compose' }"
            class="primary-ask-btn"
          >
            ✍️ 把“{{ activeQuery.slice(0, 18) }}”作为新问题提问
          </router-link>
        </div>
      </div>

      <div v-if="!communityLoading && !eventsLoading && !filteredResults.length" class="empty-results-box" role="status">
        <h3>未找到与“{{ activeQuery }}”匹配的{{ currentTabLabel }}结果</h3>
        <p>建议检查拼写、尝试更简短的地理学科核心词（如“热力环流”、“内涝”、“DEM”、“太阳高度”），或切换到“全部类型”查看。</p>
        <div class="empty-actions">
          <button
            v-if="activeType !== 'all'"
            type="button"
            class="direct-enter-btn"
            @click="setTypeFilter('all')"
          >
            查看全部类型结果（共 {{ allCombinedResults.length }} 条）
          </button>
          <router-link
            :to="{ path: '/', query: { compose: '1', kind: 'question', title: activeQuery }, hash: '#compose' }"
            class="primary-ask-btn"
          >
            ✍️ 在社区发起关于“{{ activeQuery }}”的提问
          </router-link>
        </div>
      </div>

      <div v-else class="results-list">
        <article
          v-for="item in paginatedResults"
          :key="item.id"
          class="result-item-card"
          :class="{ 'is-exact-item': item.exactMatch }"
        >
          <div class="result-meta-line">
            <span class="result-type-badge" :class="`badge-${item.typeKey}`">{{ item.type }}</span>
            <span class="result-sub-badge">{{ item.badge }}</span>
            <span v-if="item.exactMatch" class="exact-inline-tag">精确匹配</span>
            <span class="result-cat-label">{{ item.category }}</span>
          </div>

          <h3 class="result-item-title">
            <a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noopener noreferrer">{{ item.title }}</a>
            <router-link v-else :to="item.route">{{ item.title }}</router-link>
          </h3>

          <p class="result-item-desc">{{ item.desc }}</p>

          <div class="result-item-footer">
            <div v-if="item.tags && item.tags.length" class="result-tags-row">
              <button
                v-for="t in item.tags"
                :key="t"
                type="button"
                class="result-tag-chip"
                @click="applyQuickQuery(t)"
              >
                #{{ t }}
              </button>
            </div>
            <a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noopener noreferrer" class="result-open-link">查看原始监测记录 ↗</a>
            <router-link v-else :to="item.route" class="result-open-link">
              打开查阅 →
            </router-link>
          </div>
        </article>

        <!-- 大量结果分页/展开控制 -->
        <div v-if="filteredResults.length > visibleCount" class="load-more-row">
          <button type="button" class="load-more-btn" @click="visibleCount += 15">
            显示更多结果（当前已显示 {{ visibleCount }} / {{ filteredResults.length }} 条）
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  queryGlobalGeography,
  normalizeSearchQuery,
  isExactTitleOrConceptMatch,
  EXPERIMENT_INDEX,
  CURRICULUM_INDEX,
  FANXING_INDEX,
  RESOURCE_INDEX
} from '../utils/globalSearchIndex.js'
import { derivePostTags } from '../utils/topicTags.js'
import { accountEnabled, apiRequest } from '../account/client.js'
import { searchEventTopics } from '../utils/liveSearch.js'
import { activeDesignTheme } from '../utils/designTheme.js'

const route = useRoute()
const router = useRouter()

const searchInputRef = ref(null)
const inputKeyword = ref('')
const activeQuery = ref('')
const activeType = ref('all')
const visibleCount = ref(20)
const copied = ref(false)

const communityPosts = ref([])
const communityLoading = ref(false)
const communityFailed = ref(false)
const communityNotice = ref('')
let fetchVersion = 0

const recommendedQueries = [
  '热力环流',
  '同一场雨哪种路面积水更严重',
  '正午太阳高度',
  '喀斯特地貌',
  'DEM高程',
  '海绵城市',
  '多时相遥感',
  '背斜为什么变成山谷',
  'ERA5'
]

function mapPostToSearchResult(post) {
  const derived = derivePostTags(post).map(t => t.label)
  const item = {
    id: `community-${post.id}`,
    type: post.kind === 'question' ? '讨论 · 问答' : '讨论 · 探讨',
    typeKey: 'community',
    badge: post.category || post.categoryName || '学术社区',
    category: '社区讨论',
    title: post.title,
    desc: post.excerpt || (post.body ? String(post.body).replace(/\s+/g, ' ').slice(0, 150) + '…' : ''),
    tags: derived,
    route: `/community/post/${post.id}`
  }
  item.exactMatch = isExactTitleOrConceptMatch(item, activeQuery.value)
  return item
}

async function fetchCommunityPosts(rawQuery) {
  const q = normalizeSearchQuery(rawQuery)
  const version = ++fetchVersion
  communityPosts.value = []
  communityFailed.value = false
  communityNotice.value = ''

  if (!q) {
    communityLoading.value = false
    return
  }

  if (!accountEnabled) {
    communityFailed.value = true
    communityNotice.value = '社区服务未配置，以下仅展示其他可检索内容。'
    return
  }

  communityLoading.value = true
  try {
    const res = await apiRequest(`/api/community/posts?${new URLSearchParams({ q })}`, { timeout: 6500 })
    if (version !== fetchVersion) return
    const remotePosts = Array.isArray(res?.posts) ? res.posts.map(p => mapPostToSearchResult(p)) : []
    communityPosts.value = remotePosts
  } catch {
    if (version !== fetchVersion) return
    communityFailed.value = true
    communityNotice.value = '云端社区检索暂未响应，以下仅展示其他可检索内容。'
  } finally {
    if (version === fetchVersion) {
      communityLoading.value = false
    }
  }
}

const eventResults = ref([])
const eventsLoading = ref(false)
const eventsFailed = ref(false)
let eventVersion = 0
async function fetchEvents(q) {
  const version = ++eventVersion
  eventResults.value = []
  eventsFailed.value = false
  eventsLoading.value = false
  if (!q || !accountEnabled) return
  eventsLoading.value = true
  try {
    const response = await apiRequest('/api/community/hot-topics', { timeout: 6500 })
    if (!Array.isArray(response?.topics)) throw new Error('Invalid event response')
    if (version === eventVersion) eventResults.value = searchEventTopics(response.topics, q)
  } catch {
    if (version === eventVersion) eventsFailed.value = true
  } finally {
    if (version === eventVersion) eventsLoading.value = false
  }
}

const staticResults = computed(() => {
  if (!activeQuery.value) return []
  return queryGlobalGeography(activeQuery.value, { limit: 60, typeFilter: 'all' })
})

const allCombinedResults = computed(() => {
  if (!activeQuery.value) return []
  // 精确匹配优先置顶，其次按社区讨论与实验/教材/课题综合呈现
  const merged = [...staticResults.value, ...communityPosts.value, ...eventResults.value]
  return merged.sort((a, b) => {
    if (Boolean(a.exactMatch) !== Boolean(b.exactMatch)) {
      return a.exactMatch ? -1 : 1
    }
    return 0
  })
})

const exactMatches = computed(() => {
  return allCombinedResults.value.filter(item => item.exactMatch).slice(0, 2)
})

const typeTabs = computed(() => {
  const all = allCombinedResults.value
  const countBy = key => all.filter(item => item.typeKey === key).length
  return [
    { key: 'all', label: '全部结果', count: all.length },
    { key: 'community', label: '社区讨论', count: countBy('community') },
    { key: 'event', label: '近期地理事件', count: countBy('event') },
    { key: 'experiment', label: '地理实验室', count: countBy('experiment') },
    { key: 'curriculum', label: '教材与知识库', count: countBy('curriculum') },
    { key: 'inquiry', label: '真实数据与探究', count: countBy('inquiry') },
    { key: 'fanxing', label: '繁星课题与文献', count: countBy('fanxing') },
    { key: 'resource', label: '开放数据资源', count: countBy('resource') }
  ]
})

const currentTabLabel = computed(() => {
  const found = typeTabs.value.find(t => t.key === activeType.value)
  return found ? found.label : '全部结果'
})

const filteredResults = computed(() => {
  if (activeType.value === 'all') return allCombinedResults.value
  return allCombinedResults.value.filter(item => item.typeKey === activeType.value)
})

const paginatedResults = computed(() => {
  return filteredResults.value.slice(0, visibleCount.value)
})

function syncFromRoute() {
  const q = normalizeSearchQuery(typeof route.query.q === 'string' ? route.query.q : typeof route.query.tag === 'string' ? route.query.tag : '')
  const type = typeof route.query.type === 'string' ? route.query.type : 'all'
  inputKeyword.value = q
  activeType.value = ['all', 'event', 'community', 'experiment', 'curriculum', 'inquiry', 'fanxing', 'resource'].includes(type) ? type : 'all'
  visibleCount.value = 20
  if (q !== activeQuery.value) {
    activeQuery.value = q
    void fetchCommunityPosts(q)
    void fetchEvents(q)
  }
}

function submitSearch() {
  const q = normalizeSearchQuery(inputKeyword.value)
  router.push({
    path: '/search',
    query: {
      ...(q ? { q } : {}),
      ...(activeType.value !== 'all' ? { type: activeType.value } : {}),
      ...(route.query.theme ? { theme: route.query.theme } : {})
    }
  })
}

function applyQuickQuery(chip) {
  const q = normalizeSearchQuery(chip)
  inputKeyword.value = q
  router.push({
    path: '/search',
    query: {
      q,
      ...(activeType.value !== 'all' ? { type: activeType.value } : {}),
      ...(route.query.theme ? { theme: route.query.theme } : {})
    }
  })
}

function setTypeFilter(typeKey) {
  activeType.value = typeKey
  visibleCount.value = 20
  router.replace({
    path: '/search',
    query: {
      ...(activeQuery.value ? { q: activeQuery.value } : {}),
      ...(typeKey !== 'all' ? { type: typeKey } : {}),
      ...(route.query.theme ? { theme: route.query.theme } : {})
    }
  })
}

function clearKeyword() {
  inputKeyword.value = ''
  // Let the route watcher invalidate pending requests and clear all result sources.
  communityPosts.value = []
  router.push({
    path: '/search',
    query: route.query.theme ? { theme: route.query.theme } : {}
  })
  searchInputRef.value?.focus()
}

async function copyShareLink() {
  if (typeof window === 'undefined') return
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}

watch(() => [route.query.q, route.query.tag, route.query.type], syncFromRoute)

onMounted(() => {
  syncFromRoute()
})
onBeforeUnmount(() => {
  fetchVersion += 1
  eventVersion += 1
})
</script>

<style scoped>
.search-page {
  padding-top: 24px;
  padding-bottom: 84px;
  max-width: 1120px;
}

.search-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13.5px;
  color: #334155;
}

.search-back-link {
  color: #0c3960;
  font-weight: 700;
  text-decoration: none;
}

.search-back-link:hover {
  text-decoration: underline;
}

.crumb-current {
  color: #475569;
  font-weight: 600;
}

.search-hero-panel {
  background: #ffffff;
  border: 1.5px solid #94a3b8;
  border-radius: 16px;
  padding: 24px 28px 18px;
  box-shadow: 0 4px 16px rgba(15, 39, 66, 0.05);
  margin-bottom: 22px;
}

.search-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.search-eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #0c3960;
  font-family: ui-monospace, SFMono-Regular, monospace;
}

.search-hero-top h1 {
  margin: 0;
  font-size: clamp(22px, 3vw, 30px);
  color: #0f233e;
}

.search-scope-note {
  font-size: 12.5px;
  color: #334155;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 5px 12px;
  border-radius: 999px;
  font-weight: 600;
}

.wiki-search-form {
  display: flex;
  gap: 10px;
  align-items: stretch;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.wiki-input-group {
  flex: 1 1 360px;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 2px solid #1e3a5f;
  border-radius: 10px;
  padding: 0 12px;
  min-height: 46px;
}

.wiki-input-group:focus-within {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.2);
}

.wiki-search-icon {
  font-size: 16px;
  margin-right: 8px;
}

.wiki-search-input {
  flex: 1;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 15px;
  color: #0f172a;
  outline: none;
  min-width: 0;
}

.wiki-search-input::-webkit-search-cancel-button,
.wiki-search-input::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}

.wiki-clear-btn {
  border: 0;
  background: #e2e8f0;
  color: #1e293b;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.wiki-submit-btn {
  padding: 0 22px;
  min-height: 46px;
  background: #0f3d68;
  border: 1.5px solid #072138;
  color: #ffffff;
  border-radius: 10px;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
}

.wiki-submit-btn:hover {
  background: #164e82;
}

.wiki-share-btn {
  padding: 0 14px;
  min-height: 46px;
  background: #f8fafc;
  border: 1.5px solid #475569;
  color: #0f233e;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
}

.search-quick-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 14px;
  border-bottom: 1px solid #cbd5e1;
  margin-bottom: 14px;
}

.quick-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #334155;
}

.quick-query-chip {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #94a3b8;
  background: #f8fafc;
  color: #0c3960;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.quick-query-chip:hover,
.quick-query-chip.active {
  background: #0f3d68;
  border-color: #072138;
  color: #ffffff;
}

.search-type-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1.5px solid #64748b;
  background: #ffffff;
  color: #1e293b;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.type-tab-btn.active {
  background: #0f3d68;
  border-color: #072138;
  color: #ffffff;
}

.type-count-badge {
  font-size: 11.5px;
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  color: inherit;
}

.type-tab-btn.active .type-count-badge {
  background: rgba(255, 255, 255, 0.22);
}

/* 精确匹配直达横幅 */
.exact-match-banner {
  background: #f0f9ff;
  border: 2px solid #0284c7;
  border-radius: 14px;
  padding: 18px 22px;
  margin-bottom: 22px;
}

.exact-banner-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.exact-pill {
  background: #0369a1;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
}

.exact-hint {
  font-size: 13.5px;
  color: #0c4a6e;
}

.exact-cards-grid {
  display: grid;
  gap: 12px;
}

.exact-card {
  background: #ffffff;
  border: 1px solid #7dd3fc;
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.exact-card-main {
  flex: 1 1 420px;
  min-width: 0;
}

.exact-card-title {
  margin: 6px 0;
  font-size: 18px;
}

.exact-card-title a {
  color: #0c3960;
  text-decoration: none;
}

.exact-card-title a:hover {
  text-decoration: underline;
}

.exact-card-desc {
  margin: 0 0 10px;
  font-size: 13.5px;
  color: #334155;
  line-height: 1.55;
}

.direct-enter-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  background: #0369a1;
  color: #ffffff;
  border: 1.5px solid #075985;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

.direct-enter-btn:hover {
  background: #075985;
}

.search-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: #f8fafc;
  border: 1px solid #94a3b8;
  border-radius: 10px;
  font-size: 13px;
  color: #1e293b;
  margin-bottom: 16px;
}

.search-status-bar.is-notice {
  background: #fffbeb;
  border-color: #d97706;
  color: #78350f;
}

.retry-inline-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #b45309;
  background: #ffffff;
  color: #78350f;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.directory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 18px;
}

.directory-card {
  background: #ffffff;
  border: 1.5px solid #94a3b8;
  border-radius: 14px;
  padding: 20px;
}

.directory-card h3 {
  margin: 0 0 8px;
  font-size: 16.5px;
  color: #0f233e;
}

.directory-card p {
  margin: 0 0 14px;
  font-size: 13.5px;
  color: #334155;
  line-height: 1.6;
}

.dir-samples {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.results-summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #cbd5e1;
}

.results-count-text {
  margin: 0;
  font-size: 14px;
  color: #1e293b;
}

.results-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.secondary-link-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1.5px solid #475569;
  background: #ffffff;
  color: #0f233e;
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
}

.primary-ask-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1.5px solid #072138;
  background: #0f3d68;
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.result-item-card {
  background: #ffffff;
  border: 1.5px solid #94a3b8;
  border-radius: 12px;
  padding: 18px 22px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.result-item-card:hover {
  border-color: #0f3d68;
  box-shadow: 0 4px 14px rgba(15, 39, 66, 0.08);
}

.result-meta-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.result-type-badge {
  font-size: 11.5px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e2e8f0;
  color: #1e293b;
}

.badge-experiment { background: #e0f2fe; color: #075985; border: 1px solid #7dd3fc; }
.badge-curriculum { background: #dcfce7; color: #14532d; border: 1px solid #86efac; }
.badge-inquiry { background: #fef3c7; color: #78350f; border: 1px solid #fcd34d; }
.badge-community { background: #ede9fe; color: #5b21b6; border: 1px solid #c4b5fd; }
.badge-fanxing { background: #fce7f3; color: #831843; border: 1px solid #f9a8d4; }
.badge-resource { background: #f1f5f9; color: #0f172a; border: 1px solid #94a3b8; }

.result-sub-badge {
  font-size: 12px;
  color: #334155;
  font-weight: 600;
}

.exact-inline-tag {
  font-size: 11px;
  font-weight: 800;
  color: #0369a1;
  background: #e0f2fe;
  padding: 1px 7px;
  border-radius: 999px;
}

.result-cat-label {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.result-item-title {
  margin: 4px 0 8px;
  font-size: 17.5px;
  line-height: 1.4;
}

.result-item-title a {
  color: #0f233e;
  text-decoration: none;
}

.result-item-title a:hover {
  color: #0369a1;
  text-decoration: underline;
}

.result-item-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
}

.result-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px dashed #cbd5e1;
}

.result-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.result-tag-chip {
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid #94a3b8;
  background: #f8fafc;
  color: #0c3960;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.result-tag-chip:hover {
  background: #e0f2fe;
  border-color: #0369a1;
}

.result-open-link {
  font-size: 13px;
  font-weight: 700;
  color: #0c3960;
  text-decoration: none;
  margin-left: auto;
}

.result-open-link:hover {
  text-decoration: underline;
}

.empty-results-box {
  background: #ffffff;
  border: 1.5px dashed #64748b;
  border-radius: 14px;
  padding: 32px 24px;
  text-align: center;
}

.empty-results-box h3 {
  margin: 0 0 8px;
  color: #0f233e;
}

.empty-results-box p {
  margin: 0 auto 18px;
  max-width: 560px;
  color: #334155;
  font-size: 14px;
}

.empty-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.load-more-row {
  text-align: center;
  margin-top: 12px;
}

.load-more-btn {
  padding: 10px 22px;
  border-radius: 999px;
  border: 1.5px solid #0f3d68;
  background: #ffffff;
  color: #0f3d68;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
}

.load-more-btn:hover {
  background: #f0f9ff;
}

@media (max-width: 640px) {
  .search-hero-panel {
    padding: 16px;
  }
  .wiki-search-form {
    flex-direction: column;
  }
  .wiki-input-group {
    flex: 1 1 auto;
  }
  .wiki-submit-btn,
  .wiki-share-btn {
    width: 100%;
  }
  .exact-card {
    flex-direction: column;
    align-items: stretch;
  }
  .direct-enter-btn {
    justify-content: center;
    width: 100%;
  }
}
</style>
