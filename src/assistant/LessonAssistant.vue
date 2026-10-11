<template>
  <div class="assistant-root">
    <section v-if="open" class="assistant-panel" aria-label="课程助手">
      <header><div><strong>课程助手</strong><span>{{ accountEnabled ? '查找章节 · 参与讨论' : '查找章节' }}</span></div><button type="button" aria-label="关闭课程助手" @click="open = false">×</button></header>
      <div class="assistant-body">
        <p>想学什么地理知识？输入主题，我帮你找到相关章节。</p>
        <form @submit.prevent="search"><input v-model.trim="query" autofocus placeholder="例如：水循环、季风、地貌" aria-label="搜索课程主题" /><button type="submit">查找</button></form>
        <p v-if="searched && !results.length" class="hint">没有找到匹配章节，试试更短的关键词。</p>
        <ul v-if="results.length">
          <li v-for="item in results" :key="item.key"><router-link :to="item.to" @click="open = false"><strong>{{ item.title }}</strong><small>{{ item.context }}</small></router-link></li>
        </ul>
        <button v-if="isSection && accountEnabled" type="button" class="comment-link" @click="goComments">查看本节评论 →</button>
      </div>
    </section>
    <button class="assistant-fab" type="button" :aria-expanded="open" aria-label="打开课程助手" @click="open = !open">找课程</button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getGrades } from '../textbook/data/catalogLoader.js'
import { accountEnabled } from '../account/config.js'

const route = useRoute()
const open = ref(false)
const query = ref('')
const searched = ref(false)
const results = ref([])
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
</script>

<style scoped>
.assistant-root { position: fixed; right: 22px; bottom: 22px; z-index: 80; }
.assistant-fab { min-width: 74px; min-height: 44px; padding: 8px 14px; border: 1px solid #638172; border-radius: 3px; background: #244739; color: #fff; box-shadow: 0 5px 18px rgba(15,43,32,.16); font-family:inherit; font-size:13px; font-weight:700; line-height:1.2; cursor: pointer; }
.assistant-fab:hover { background:#315b49; }
.assistant-fab:focus-visible { outline:3px solid #244739; outline-offset:3px; }
.assistant-panel { position: absolute; right: 0; bottom: 74px; width: min(360px, calc(100vw - 30px)); max-height: min(540px, calc(100vh - 120px)); overflow: auto; background: #fff; border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 20px 60px rgba(24,70,150,.2); }
header { display: flex; align-items: center; justify-content: space-between; padding: 18px; background: var(--accent-soft); }
header div { display: grid; gap: 3px; } header span { color: var(--text-muted); font-size: 12px; } header button { border: 0; background: none; font-size: 24px; cursor: pointer; }
.assistant-body { padding: 18px; }
.assistant-body p { margin: 0 0 14px; line-height: 1.6; color: var(--text-muted); }
form { display: flex; gap: 8px; } input { min-width: 0; flex: 1; padding: 9px; border: 1px solid var(--border); border-radius: 8px; font: inherit; } form button { border: 0; border-radius: 8px; padding: 0 12px; background: var(--accent); color: #fff; cursor: pointer; }
ul { padding: 0; list-style: none; } li { border-bottom: 1px solid var(--border); } li a { display: grid; gap: 4px; padding: 10px 0; color: var(--text); text-decoration: none; } li small { color: var(--text-muted); }
.comment-link { border: 0; padding: 8px 0; color: var(--accent); background: none; cursor: pointer; font: inherit; }
.hint { margin-top: 14px !important; }
</style>
