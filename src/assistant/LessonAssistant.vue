<template>
  <div class="assistant-root">
    <section v-if="open" class="assistant-panel" aria-label="课程助手">
      <header><div><strong>课程助手</strong><span>{{ accountEnabled ? '查找章节 · AI 问答' : '查找章节' }}</span></div><button type="button" aria-label="关闭课程助手" @click="open = false">×</button></header>
      <div class="assistant-body">
        <p>输入主题查找章节。AI 回答为机器生成，未经教师人工核验；备课与课堂使用前请核对原章节和可靠来源。不要输入学生姓名等个人信息。</p>
        <form @submit.prevent="search()">
          <input v-model.trim="query" autofocus maxlength="300" placeholder="例如：水循环为什么发生？" aria-label="搜索或提问课程主题" />
          <div class="assistant-actions"><button type="submit">查找章节</button><button v-if="accountEnabled" type="button" :disabled="aiLoading" @click="ask">{{ aiLoading ? '回答中…' : '问 AI' }}</button></div>
        </form>
        <div v-if="aiAnswer || aiError || aiNotice" class="assistant-answer" aria-live="polite">
          <strong>{{ aiError ? 'AI 暂不可用 · 未生成回答' : aiNotice ? '服务提示 · 非地理结论' : 'AI 生成回答 · 未经人工核验' }}</strong>
          <p>{{ aiError || aiNotice || aiAnswer }}</p>
          <template v-if="aiAnswer">
            <p class="hint">可能存在事实、章节归属或推理错误，不代表教材审定或教师认可。</p>
            <template v-if="aiSources.length">
              <strong class="hint">关键词匹配的候选章节</strong>
              <p>供自行核对，不是逐条验证的引用；不保证每章支撑上述结论。</p>
              <ul class="assistant-sources"><li v-for="source in aiSources" :key="source.route"><a :href="source.route" @click="open = false">{{ source.title }} →</a></li></ul>
            </template>
            <p v-else class="hint">未提供候选章节，无法据此核对地理结论；网站导航说明也不是地理事实来源。</p>
            <button type="button" class="comment-link" aria-controls="assistant-feedback" :aria-expanded="feedbackOpen" @click="feedbackOpen = !feedbackOpen">反馈 / 请求核对</button>
            <div v-if="feedbackOpen" id="assistant-feedback">
              <p>本回答尚未提交反馈。可自愿在现有社区发起核对讨论，由讨论的编辑、纠错 / 举报及修订记录机制跟进；这不等于已完成事实核验。</p>
              <label for="assistant-feedback-text">只填写愿意公开的片段与核对来源（最多 500 字，勿含个人信息）</label>
              <textarea id="assistant-feedback-text" v-model.trim="feedbackText" maxlength="500" rows="3" />
              <button type="button" class="comment-link" @click="copyFeedback">复制核对片段</button>
              <p v-if="feedbackError" role="alert">{{ feedbackError }}</p>
              <p v-if="feedbackStatus" role="status">{{ feedbackStatus }}</p>
              <router-link :to="{ path: '/community', hash: '#compose' }" @click="open = false">前往社区，自行确认后发布 →</router-link>
              <p>不会自动发送提问、回答或草稿；复制不等于提交，社区发布后内容将公开。</p>
            </div>
          </template>
        </div>
        <section v-if="searched" class="assistant-search" aria-label="本地章节搜索" aria-live="polite">
          <strong>本地章节搜索 · 非 AI 回答</strong>
          <p>仅按章节标题匹配，不保证能回答问题；待复核章节需以章节页标识为准。</p>
          <p v-if="searchError" role="alert">{{ searchError }}</p>
          <p v-else-if="searchLoading" role="status">正在查找章节…</p>
          <p v-else-if="!results.length" class="hint">没有找到匹配章节，试试更短的关键词。</p>
          <ul v-if="results.length">
            <li v-for="item in results" :key="item.key"><router-link :to="item.to" @click="open = false"><strong>{{ item.title }}</strong><small>{{ item.context }}</small></router-link></li>
          </ul>
        </section>
        <button v-if="isSection && accountEnabled" type="button" class="comment-link" @click="goComments">查看本节评论 →</button>
      </div>
    </section>
    <button class="assistant-fab" type="button" :aria-expanded="open" :aria-label="accountEnabled ? '打开 AI 课程助手' : '打开章节搜索助手'" @click="open = !open">
      <span class="assistant-fab-globe" aria-hidden="true"><img :src="earthJpeg" alt="" width="62" height="62" /></span>
      <span class="assistant-fab-label" aria-hidden="true">{{ accountEnabled ? 'AI 助手' : '章节搜索' }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getGrades } from '../textbook/data/catalogLoader.js'
import { accountEnabled } from '../account/config.js'
import { apiRequest } from '../account/api.js'
import earthJpeg from '../assets/geo-verified/earth-apollo17.jpg'

const route = useRoute()
const open = ref(false)
const query = ref('')
const searched = ref(false)
const results = ref([])
const searchLoading = ref(false)
const searchError = ref('')
const aiLoading = ref(false)
const aiAnswer = ref('')
const aiError = ref('')
const aiNotice = ref('')
const aiSources = ref([])
const feedbackOpen = ref(false)
const feedbackText = ref('')
const feedbackStatus = ref('')
const feedbackError = ref('')
const isSection = computed(() => route.name === 'section')
let aiRequestId = 0
let searchRequestId = 0
let aiController
let disposed = false

function resetResults() {
  aiRequestId++
  searchRequestId++
  aiController?.abort()
  aiLoading.value = false
  aiAnswer.value = ''
  aiError.value = ''
  aiNotice.value = ''
  aiSources.value = []
  searched.value = false
  searchLoading.value = false
  searchError.value = ''
  results.value = []
  feedbackOpen.value = false
  feedbackText.value = ''
  feedbackStatus.value = ''
  feedbackError.value = ''
}

async function searchChapters(question) {
  const requestId = ++searchRequestId
  searched.value = true
  searchLoading.value = true
  searchError.value = ''
  results.value = []
  const term = question.toLowerCase()
  try {
    if (!term) return
    const grades = await getGrades()
    const matches = []
    for (const grade of grades) for (const book of grade.books) for (const chapter of book.chapters) for (const section of chapter.sections) {
      const title = `${chapter.title} ${section.title}`
      if (!title.toLowerCase().includes(term)) continue
      matches.push({
        key: [grade.id, book.id, chapter.id, section.id].join('|'),
        title: section.title,
        context: `${grade.id} · ${book.id} · ${chapter.title}`,
        score: (section.title.toLowerCase() === term ? 0 : section.title.toLowerCase().includes(term) ? 1 : 2)
          + (grade.id === '大学' ? 3 : 0),
        to: { name: 'section', params: { grade: grade.id, book: book.id, chapter: chapter.id, section: section.id } }
      })
    }
    if (requestId === searchRequestId && !disposed) {
      results.value = matches.sort((a, b) => a.score - b.score).slice(0, 6)
    }
  } catch (error) {
    if (requestId === searchRequestId && !disposed) {
      searchError.value = error.message || '本地章节目录暂时无法读取，请稍后重试。'
    }
  } finally {
    if (requestId === searchRequestId && !disposed) searchLoading.value = false
  }
}

async function search() {
  const question = query.value
  resetResults()
  await searchChapters(question)
}

async function copyFeedback() {
  const requestId = aiRequestId
  feedbackStatus.value = ''
  feedbackError.value = ''
  if (!feedbackText.value) {
    feedbackError.value = '请自行填写愿意分享的核对片段，不会自动复制整段回答。'
    return
  }
  try {
    await navigator.clipboard.writeText(feedbackText.value)
    if (requestId !== aiRequestId || disposed) return
    feedbackStatus.value = '片段已复制到剪贴板，尚未提交；请在社区检查并确认后发布。'
  } catch {
    if (requestId !== aiRequestId || disposed) return
    feedbackError.value = '无法访问剪贴板；可手动选中片段复制，尚未提交反馈。'
  }
}

function goComments() {
  open.value = false
  document.getElementById('lesson-comments')?.scrollIntoView({ behavior: 'smooth' })
}

async function ask() {
  if (!query.value || aiLoading.value) return
  const question = query.value
  resetResults()
  const requestId = ++aiRequestId
  aiController = new AbortController()
  aiLoading.value = true
  try {
    const contextInfo = {
      routeName: route.name,
      params: route.params
    }
    const response = await apiRequest('/api/assistant/ask', {
      method: 'POST',
      body: JSON.stringify({ question, contextInfo }),
      timeout: 30_000,
      signal: aiController.signal
    })
    if (requestId !== aiRequestId || disposed) return
    if (typeof response?.answer !== 'string' || !response.answer.trim() ||
        (response.answerKind && !['ai-generated', 'service-message'].includes(response.answerKind)) ||
        (response.sources !== undefined && (!Array.isArray(response.sources) || response.sources.some(source =>
          typeof source?.title !== 'string' || !source.title.trim() ||
          typeof source.route !== 'string' || !/^#\/(?!\/)/.test(source.route))))) {
      throw new Error('AI 返回格式无效，本次没有可展示的回答。')
    }
    if (response.answerKind === 'service-message') aiNotice.value = response.answer
    else {
      aiAnswer.value = response.answer
      aiSources.value = response.sources || []
    }
  } catch (error) {
    if (requestId !== aiRequestId || disposed) return
    aiError.value = error.message || 'AI 服务暂时无法连接，请稍后重试。'
    await searchChapters(question)
  } finally {
    if (requestId === aiRequestId && !disposed) aiLoading.value = false
  }
}

watch(query, resetResults, { flush: 'sync' })
watch(() => route.fullPath, resetResults)
watch(feedbackText, () => { feedbackStatus.value = ''; feedbackError.value = '' })
onBeforeUnmount(() => { disposed = true; resetResults() })
</script>

<style scoped>
.assistant-root { position: fixed; right: 22px; bottom: 22px; z-index: 80; }
.assistant-fab { box-sizing: border-box; display: flex; align-items: center; gap: 8px; height: 66px; padding: 3px 15px 3px 3px; border: 1px solid rgba(173, 215, 250, .85); border-radius: 999px; background: #06172e; box-shadow: 0 0 0 3px rgba(26, 84, 148, .18), 0 10px 28px rgba(4, 27, 61, .36); color: #fff; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease; }
.assistant-fab:hover { transform: translateY(-3px); box-shadow: 0 0 0 4px rgba(26, 84, 148, .24), 0 15px 32px rgba(4, 27, 61, .4); }
.assistant-fab:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
.assistant-fab-globe { display: block; flex: 0 0 58px; width: 58px; height: 58px; overflow: hidden; border-radius: 50%; }
.assistant-fab-globe img { display: block; width: 100%; height: 100%; object-fit: cover; }
.assistant-fab-label { white-space: nowrap; font-weight: 700; font-size: 14px; line-height: 1.2; letter-spacing: .02em; }
.assistant-panel { position: absolute; right: 0; bottom: 74px; width: min(360px, calc(100vw - 30px)); max-height: min(540px, calc(100vh - 120px)); overflow: auto; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-box); box-shadow: var(--shadow-lg); }
header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; background: var(--geo-ocean-surface); border-bottom: 1px solid var(--border); }
header div { display: grid; gap: 3px; } header span { color: var(--text-muted); font-size: 12px; } header button { border: 0; background: none; font-size: 24px; cursor: pointer; color: var(--text-muted); }
.assistant-body { padding: 18px; }
.assistant-body p { margin: 0 0 14px; line-height: 1.6; color: var(--text-muted); }
form { display: grid; gap: 8px; } input, textarea { min-width: 0; width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font: inherit; } .assistant-actions { display: flex; gap: 8px; } form button { min-height: 38px; border: 0; border-radius: var(--radius-pill); padding: 0 16px; background: var(--geo-ocean); color: #fff; font: inherit; font-weight: 700; cursor: pointer; box-shadow: var(--geo-btn-primary-shadow); transition: var(--geo-btn-transition); } form button:hover:not(:disabled) { background: var(--geo-ocean-deep); transform: var(--geo-btn-elevate); box-shadow: var(--geo-btn-primary-hover-shadow); } form button:disabled { opacity: .65; cursor: wait; }
.assistant-answer { margin-top: 16px; padding: 14px; border-radius: var(--radius-card); background: var(--geo-ocean-surface); color: var(--text); border: 1px solid rgba(26,68,108,0.12); }
.assistant-answer strong { display: block; margin-bottom: 6px; font-size: 13px; }
.assistant-answer p { margin: 0; color: inherit; white-space: pre-wrap; }
.assistant-sources { margin-top: 8px; }
.assistant-sources a { color: var(--accent); text-decoration: none; font-size: 12px; }
.assistant-search { margin-top: 16px; }
#assistant-feedback { display: grid; gap: 8px; font-size: 12px; }
#assistant-feedback a { color: var(--accent); }
#assistant-feedback [role="alert"] { color: var(--text); font-weight: 700; }
ul { padding: 0; list-style: none; } li { border-bottom: 1px solid var(--border); } li a { display: grid; gap: 4px; padding: 10px 0; color: var(--text); text-decoration: none; } li small { color: var(--text-muted); }
.comment-link { border: 0; padding: 8px 0; color: var(--accent); background: none; cursor: pointer; font: inherit; }
.hint { margin-top: 14px !important; }
@media (max-width: 650px) {
  .assistant-root { right: 10px; bottom: 10px; }
  .assistant-fab { width: 46px; height: 46px; padding: 2px; justify-content: center; }
  .assistant-fab-globe { flex-basis: 40px; width: 40px; height: 40px; }
  .assistant-fab-label { display: none; }
  .assistant-panel { bottom: 56px; }
}
</style>
