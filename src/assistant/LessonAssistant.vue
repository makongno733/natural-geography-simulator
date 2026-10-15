<template>
  <div class="assistant-root">
    <section v-if="open" class="assistant-panel" aria-label="课程助手">
      <header><div><strong>课程助手</strong><span>{{ accountEnabled ? '查找章节 · AI 问答' : '查找章节' }}</span></div><button type="button" aria-label="关闭课程助手" @click="open = false">×</button></header>
      <div class="assistant-body">
        <p>输入主题查找章节；AI 问答只回答本站地理课程和网站使用问题。</p>
        <form @submit.prevent="search">
          <input v-model.trim="query" autofocus maxlength="300" placeholder="例如：水循环为什么发生？" aria-label="搜索或提问课程主题" />
          <div class="assistant-actions"><button type="submit">查找章节</button><button v-if="accountEnabled" type="button" :disabled="aiLoading" @click="ask">{{ aiLoading ? '回答中…' : '问 AI' }}</button></div>
        </form>
        <div v-if="aiAnswer || aiError" class="assistant-answer" aria-live="polite">
          <strong>{{ aiError ? '暂时无法回答' : '课程问答' }}</strong>
          <p>{{ aiError || aiAnswer }}</p>
          <ul v-if="aiSources.length" class="assistant-sources"><li v-for="source in aiSources" :key="source.route"><a :href="source.route" @click="open = false">{{ source.title }} →</a></li></ul>
        </div>
        <p v-if="searched && !results.length" class="hint">没有找到匹配章节，试试更短的关键词。</p>
        <ul v-if="results.length">
          <li v-for="item in results" :key="item.key"><router-link :to="item.to" @click="open = false"><strong>{{ item.title }}</strong><small>{{ item.context }}</small></router-link></li>
        </ul>
        <button v-if="isSection && accountEnabled" type="button" class="comment-link" @click="goComments">查看本节评论 →</button>
      </div>
    </section>
    <button class="assistant-fab" type="button" :aria-expanded="open" aria-label="打开 AI 课程助手" @click="open = !open">
      <span class="assistant-fab-globe" aria-hidden="true"><img :src="earthJpeg" alt="" width="62" height="62" /></span>
      <span class="assistant-fab-label" aria-hidden="true">AI 助手</span>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getGrades } from '../textbook/data/catalogLoader.js'
import { accountEnabled } from '../account/config.js'
import { apiRequest } from '../account/client.js'
import earthJpeg from '../assets/geo-verified/earth-apollo17.jpg'

const route = useRoute()
const open = ref(false)
const query = ref('')
const searched = ref(false)
const results = ref([])
const aiLoading = ref(false)
const aiAnswer = ref('')
const aiError = ref('')
const aiSources = ref([])
const isSection = computed(() => route.name === 'section')

async function search() {
  searched.value = true
  const term = query.value.toLowerCase()
  if (!term) { results.value = []; return }
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
  results.value = matches.sort((a, b) => a.score - b.score).slice(0, 6)
}

function goComments() {
  open.value = false
  document.getElementById('lesson-comments')?.scrollIntoView({ behavior: 'smooth' })
}

async function ask() {
  if (!query.value || aiLoading.value) return
  aiLoading.value = true
  aiAnswer.value = ''
  aiError.value = ''
  aiSources.value = []
  try {
    const response = await apiRequest('/api/assistant/ask', {
      method: 'POST', body: JSON.stringify({ question: query.value })
    })
    aiAnswer.value = response.answer
    aiSources.value = response.sources || []
  } catch (error) {
    aiError.value = error.message || '请稍后再试'
  } finally {
    aiLoading.value = false
  }
}
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
form { display: grid; gap: 8px; } input { min-width: 0; width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font: inherit; } .assistant-actions { display: flex; gap: 8px; } form button { min-height: 38px; border: 0; border-radius: var(--radius-pill); padding: 0 16px; background: var(--geo-ocean); color: #fff; font: inherit; font-weight: 700; cursor: pointer; box-shadow: var(--geo-btn-primary-shadow); transition: var(--geo-btn-transition); } form button:hover:not(:disabled) { background: var(--geo-ocean-deep); transform: var(--geo-btn-elevate); box-shadow: var(--geo-btn-primary-hover-shadow); } form button:disabled { opacity: .65; cursor: wait; }
.assistant-answer { margin-top: 16px; padding: 14px; border-radius: var(--radius-card); background: var(--geo-ocean-surface); color: var(--text); border: 1px solid rgba(26,68,108,0.12); }
.assistant-answer strong { display: block; margin-bottom: 6px; font-size: 13px; }
.assistant-answer p { margin: 0; color: inherit; white-space: pre-wrap; }
.assistant-sources { margin-top: 8px; }
.assistant-sources a { color: var(--accent); text-decoration: none; font-size: 12px; }
ul { padding: 0; list-style: none; } li { border-bottom: 1px solid var(--border); } li a { display: grid; gap: 4px; padding: 10px 0; color: var(--text); text-decoration: none; } li small { color: var(--text-muted); }
.comment-link { border: 0; padding: 8px 0; color: var(--accent); background: none; cursor: pointer; font: inherit; }
.hint { margin-top: 14px !important; }
</style>
