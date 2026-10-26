<template>
  <div class="community-page">
    <section class="community-hero">
      <div class="community-wrap community-hero-inner">
        <div>
          <p class="community-eyebrow">面向每一位地理学习者与实践者</p>
          <h1>在这里，讨论地理。</h1>
          <p class="community-lead">提出问题，分享野外与课堂经验，交流研究方法。让每一次讨论都成为后来者找得到的知识。</p>
          <form class="community-search" @submit.prevent="runSearch">
            <label class="sr-only" for="community-query">搜索历史讨论</label>
            <input id="community-query" v-model="queryInput" placeholder="搜索季风、遥感、考研经验……" maxlength="100" />
            <button type="submit">搜索讨论</button>
          </form>
          <div class="community-hero-actions">
            <a href="#compose" @click.prevent="focusCompose">发起讨论</a>
            <router-link to="/experiments">走进地理实验室 ↗</router-link>
            <router-link v-if="isAdmin" to="/community/manage">社区管理</router-link>
          </div>
        </div>
        <aside class="community-hero-aside" aria-label="社区理念">
          <span class="community-coordinate">35° N · 103° E</span>
          <strong>发现问题<br />交换证据<br />持续连接</strong>
          <p>从一条有价值的提问开始。</p>
        </aside>
      </div>
    </section>

    <div class="community-wrap community-layout">
      <div class="community-main">
        <div class="community-section-heading">
          <div>
            <p class="community-eyebrow">THE CONVERSATION</p>
            <h2>{{ searchQuery ? `“${searchQuery}”的讨论` : '社区讨论' }}</h2>
          </div>
          <button v-if="searchQuery || selectedCategory || kind" class="community-clear" type="button" @click="clearFilters">清除筛选</button>
        </div>

        <div class="community-filters" aria-label="讨论类型">
          <button type="button" :aria-pressed="kind === ''" @click="setKind('')">全部</button>
          <button type="button" :aria-pressed="kind === 'question'" @click="setKind('question')">问答</button>
          <button type="button" :aria-pressed="kind === 'discussion'" @click="setKind('discussion')">交流</button>
        </div>

        <p v-if="loading" class="community-state" role="status">正在加载讨论……</p>
        <p v-else-if="error" class="community-state community-error" role="alert">{{ error }}</p>
        <p v-else-if="!posts.length" class="community-state">暂时没有讨论。你可以成为第一个发起话题的人。</p>
        <div v-else class="community-post-list">
          <article v-for="post in posts" :key="post.id" class="community-post-card">
            <div class="community-post-meta"><span>{{ post.category }}</span><span>{{ post.kind === 'question' ? '问题' : '讨论' }}</span></div>
            <h3><router-link :to="`/community/post/${post.id}`">{{ post.title }}</router-link></h3>
            <p>{{ post.excerpt }}</p>
            <div class="community-post-foot"><span>{{ post.author }} · {{ formatDate(post.createdAt) }}</span><span>{{ post.replyCount }} 条回复</span></div>
          </article>
        </div>
        <button v-if="posts.length === 20" class="community-more" type="button" @click="nextPage">加载更多</button>

        <section id="compose" ref="composeRef" class="community-compose" aria-labelledby="compose-title">
          <div class="community-section-heading"><div><p class="community-eyebrow">JOIN IN</p><h2 id="compose-title">发起一场讨论</h2></div></div>
          <p v-if="!accountEnabled" class="community-state">社区账号服务尚未配置。</p>
          <p v-else-if="!user" class="community-state">登录后即可提问、分享经验和参与讨论。<a :href="`${accountOrigin}/#/account`">登录 / 注册 ↗</a></p>
          <form v-else class="community-compose-form" @submit.prevent="createPost">
            <div class="community-form-row">
              <label>类型<select v-model="draft.kind"><option value="question">提出问题</option><option value="discussion">分享讨论</option></select></label>
              <label>分区<select v-model.number="draft.categoryId" required><option disabled value="">请选择分区</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option></select></label>
            </div>
            <label>标题<input v-model.trim="draft.title" required maxlength="120" placeholder="用一句话说清楚你想讨论什么" /></label>
            <label>正文<textarea v-model.trim="draft.body" required maxlength="10000" rows="7" placeholder="补充背景、你的观察或已尝试的方法。请尊重他人，并注明引用来源。" /></label>
            <p v-if="submitError" class="community-error" role="alert">{{ submitError }}</p>
            <button type="submit" :disabled="submitting">{{ submitting ? '正在发布……' : '发布讨论' }}</button>
          </form>
        </section>
      </div>

      <aside class="community-sidebar">
        <section class="community-side-block">
          <p class="community-eyebrow">EXPLORE BY FIELD</p><h2>专业分区</h2>
          <p v-if="!categories.length" class="community-side-note">分区正在加载。</p>
          <button v-for="category in categories" :key="category.id" class="community-category" type="button" :aria-pressed="selectedCategory === category.id" @click="setCategory(category.id)">
            <span>{{ category.name }}</span><small>{{ category.description }}</small>
          </button>
        </section>
        <section class="community-side-block community-feature-block">
          <p class="community-eyebrow">MORE TO EXPLORE</p><h2>地理探索</h2>
          <router-link to="/experiments">3D 地理实验 <span>↗</span></router-link>
          <router-link to="/geo-labs">真实数据探究 <span>↗</span></router-link>
          <router-link to="/calendar">地理日历 <span>↗</span></router-link>
          <router-link to="/learning">教学资源 <span>↗</span></router-link>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { accountEnabled, accountOrigin, apiRequest, authClient } from '../account/client.js'

const router = useRouter()
const route = useRoute()
const categories = ref([])
const posts = ref([])
const user = ref(null)
const isAdmin = ref(false)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const submitError = ref('')
const queryInput = ref('')
const searchQuery = ref('')
const selectedCategory = ref(null)
const kind = ref(route.path === '/questions' ? 'question' : '')
const page = ref(1)
const composeRef = ref(null)
const draft = reactive({ kind: 'question', categoryId: '', title: '', body: '' })
let stream

const formatDate = value => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))

async function loadPosts(append = false) {
  if (!accountEnabled) { error.value = '社区账号服务尚未配置。'; return }
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({ page: String(page.value) })
    if (searchQuery.value) params.set('q', searchQuery.value)
    if (selectedCategory.value) params.set('category', String(selectedCategory.value))
    if (kind.value) params.set('kind', kind.value)
    const result = await apiRequest(`/api/community/posts?${params}`)
    posts.value = append ? [...posts.value, ...result.posts] : result.posts
  } catch (cause) { error.value = cause.message }
  finally { loading.value = false }
}
function resetAndLoad() { page.value = 1; void loadPosts() }
function runSearch() { searchQuery.value = queryInput.value.trim(); resetAndLoad() }
function clearFilters() { queryInput.value = ''; searchQuery.value = ''; selectedCategory.value = null; kind.value = ''; resetAndLoad() }
function setCategory(id) { selectedCategory.value = selectedCategory.value === id ? null : id; resetAndLoad() }
function setKind(value) { kind.value = value; resetAndLoad() }
function nextPage() { page.value += 1; void loadPosts(true) }
function focusCompose() { composeRef.value?.scrollIntoView({ behavior: 'smooth' }); composeRef.value?.querySelector('input')?.focus({ preventScroll: true }) }
async function createPost() {
  submitting.value = true; submitError.value = ''
  try {
    const result = await apiRequest('/api/community/posts', { method: 'POST', body: JSON.stringify(draft) })
    await router.push(`/community/post/${result.id}`)
  } catch (cause) { submitError.value = cause.message }
  finally { submitting.value = false }
}
onMounted(async () => {
  if (!accountEnabled) { error.value = '社区账号服务尚未配置。'; return }
  const [categoryResult, sessionResult] = await Promise.allSettled([
    apiRequest('/api/community/categories'), authClient.getSession()
  ])
  if (categoryResult.status === 'fulfilled') categories.value = categoryResult.value.categories
  if (sessionResult.status === 'fulfilled') user.value = sessionResult.value.data?.user || null
  if (user.value) {
    const me = await apiRequest('/api/community/me').catch(() => null)
    isAdmin.value = Boolean(me?.isAdmin)
  }
  await loadPosts()
  stream = new EventSource(`${accountOrigin}/api/community/stream`)
  stream.addEventListener('community', () => { if (page.value === 1) void loadPosts() })
})
onBeforeUnmount(() => stream?.close())
</script>
