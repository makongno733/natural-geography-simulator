<template>
  <div class="library">
    <header class="library-head">
      <div class="eyebrow">CURRICULUM ATLAS · 教材知识库</div>
      <h1>从章节走向地理理解</h1>
      <p>按人教版高中五册浏览知识草案。内容源于教研文档整理，尚待逐条教研复核；初中四册缺少本批源文件。</p>
      <div class="summary"><span>5 册高中资料</span><span>89 个章节与探究条目</span><span>81 个知识点草案</span></div>
    </header>

    <div class="library-layout">
      <aside class="library-nav" aria-label="教材章节目录">
        <label for="book-picker">教材分册</label>
        <select id="book-picker" :value="bookCode" @change="selectBook($event.target.value)">
          <option v-for="item in manifest.books" :key="item.code" :value="item.code">{{ item.book }}</option>
        </select>
        <label for="knowledge-search">检索本册知识</label>
        <input id="knowledge-search" v-model.trim="search" type="search" placeholder="章节、概念、关键词" />
        <div v-if="!search" class="chapter-groups">
          <section v-for="group in groups" :key="group.unit">
            <button type="button" class="group-toggle" :aria-expanded="expanded[group.unit] !== false" @click="expanded[group.unit] = expanded[group.unit] === false">
              <span>{{ group.unit }}</span><span aria-hidden="true">{{ expanded[group.unit] === false ? '＋' : '－' }}</span>
            </button>
            <div v-if="expanded[group.unit] !== false">
              <router-link v-for="chapter in group.chapters" :key="chapter.id" :to="knowledgeRoute({ book: bookCode, chapter: chapter.id })" class="chapter-link" :class="{ active: chapter.id === selectedChapter?.id }">{{ chapter.title }}</router-link>
            </div>
          </section>
        </div>
        <div v-else class="search-results" aria-live="polite">
          <span>{{ searchResults.length }} 条结果</span>
          <router-link v-for="item in searchResults" :key="item.id" :to="knowledgeRoute({ book: bookCode, chapter: item.chapterId, point: item.pointId })">{{ item.title }}<small>{{ item.type }}</small></router-link>
        </div>
      </aside>

      <main class="library-main" v-if="data && selectedChapter">
        <nav class="crumb" aria-label="当前位置"><router-link to="/">首页</router-link><span> / </span><span>{{ data.textbook.name }}</span><span> / </span><span>{{ selectedChapter.unit }}</span></nav>
        <div class="status">资料状态：待教研复核 · 印刷页码未核验</div>
        <h2>{{ selectedChapter.title }}</h2>
        <p class="chapter-summary">{{ selectedChapter.summary }}</p>
        <div class="chapter-meta"><span>{{ selectedChapter.unit }}</span><span>{{ selectedChapter.pointIds.length }} 个关联知识点</span></div>
        <router-link v-if="selectedChapter.site" class="lesson-link" :to="sectionPath(selectedChapter.site)">打开现有课程与交互实验 <span aria-hidden="true">↗</span></router-link>

        <div class="point-list" v-if="chapterPoints.length">
          <article v-for="point in chapterPoints" :key="point.id" :id="point.id" class="point-card" :class="{ focused: point.id === selectedPointId }">
            <div class="point-top"><span>{{ point.id }}</span><span>待教研复核</span></div>
            <h3>{{ point.name }}</h3>
            <p class="point-definition">{{ point.definition }}</p>
            <details><summary>展开原理、机制与案例</summary>
              <div class="point-body">
                <p v-if="point.explanation">{{ point.explanation }}</p>
                <section v-if="point.principles"><h4>地理原理</h4><p>{{ point.principles }}</p></section>
                <section v-if="point.mechanism"><h4>形成机制</h4><p>{{ point.mechanism }}</p></section>
                <section v-if="point.factors"><h4>影响因素</h4><p>{{ point.factors }}</p></section>
                <section v-if="point.distribution"><h4>空间分布</h4><p>{{ point.distribution }}</p></section>
                <section v-if="point.cases"><h4>典型案例</h4><p>{{ point.cases }}</p></section>
                <section v-if="point.misconceptions?.length"><h4>易错辨析</h4><ul><li v-for="item in point.misconceptions" :key="item">{{ item }}</li></ul></section>
                <div class="source">交付包所列整理依据：{{ point.source }}。本站未取得逐项原文页码及完整教研复核记录，不代表教材或课标原文。
                  <template v-if="point.reviewReferences?.length"><br />已复核的具体修正参考：<a v-for="reference in point.reviewReferences" :key="reference.url" :href="reference.url" target="_blank" rel="noopener noreferrer">{{ reference.title }} ↗</a></template>
                </div>
              </div>
            </details>
          </article>
        </div>
        <p v-else class="empty">此条目暂无可核对的知识点。</p>
        <div class="chapter-actions"><router-link v-if="previous" :to="knowledgeRoute({ book: bookCode, chapter: previous.id })">← 上一条</router-link><router-link v-if="next" :to="knowledgeRoute({ book: bookCode, chapter: next.id })">下一条 →</router-link></div>
      </main>

      <aside class="library-context" v-if="data && selectedChapter" aria-label="本节知识导航">
        <h3>本节知识</h3>
        <button v-for="point in chapterPoints" :key="point.id" type="button" @click="focusPoint(point.id)">{{ point.name }}</button>
        <template v-if="prerequisites.length"><h3>前置知识 · 待复核</h3><router-link v-for="item in prerequisites" :key="item.id" :to="knowledgeRoute({ book: item.book, chapter: item.chapter, point: item.id })">{{ item.name }}</router-link></template>
        <p class="context-note">关联仅作学习线索，待逐条核实后才能用于正式教学推荐。</p>
      </aside>
    </div>
    <p v-if="loading" class="loading">正在加载本册资料…</p>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadKnowledgeBook, manifest, knowledgeRoute } from './loader.js'

const route = useRoute()
const router = useRouter()
const bookCode = computed(() => manifest.books.some((book) => book.code === route.query.book) ? route.query.book : 'BX1')
const data = ref(null)
const loading = ref(false)
const search = ref('')
const expanded = ref({})
const selectedPointId = computed(() => route.query.point || '')
let generation = 0
watch(bookCode, async (code) => {
  const current = ++generation
  loading.value = true
  data.value = null
  const loaded = await loadKnowledgeBook(code)
  if (current !== generation) return
  data.value = loaded
  loading.value = false
  search.value = ''
}, { immediate: true })
const selectedChapter = computed(() => data.value?.chapters.find((item) => item.id === route.query.chapter) || data.value?.chapters[0] || null)
const chapterPoints = computed(() => selectedChapter.value?.pointIds.map((id) => data.value.points.find((point) => point.id === id)).filter(Boolean) || [])
const groups = computed(() => {
  const map = new Map()
  for (const chapter of data.value?.chapters || []) {
    if (!map.has(chapter.unit)) map.set(chapter.unit, [])
    map.get(chapter.unit).push(chapter)
  }
  return [...map].map(([unit, chapters]) => ({ unit, chapters }))
})
const searchResults = computed(() => {
  const query = search.value.toLocaleLowerCase()
  if (!query || !data.value) return []
  const results = []
  for (const chapter of data.value.chapters) {
    if (`${chapter.title} ${chapter.unit} ${chapter.summary}`.toLocaleLowerCase().includes(query)) results.push({ id: chapter.id, title: chapter.title, type: chapter.unit, chapterId: chapter.id })
  }
  for (const point of data.value.points) {
    if (`${point.name} ${point.definition} ${point.terms.join(' ')}`.toLocaleLowerCase().includes(query)) {
      const chapter = data.value.chapters.find((item) => item.pointIds.includes(point.id))
      if (chapter) results.push({ id: point.id, title: point.name, type: chapter.unit, chapterId: chapter.id, pointId: point.id })
    }
  }
  return results
})
const selectedIndex = computed(() => data.value?.chapters.findIndex((item) => item.id === selectedChapter.value?.id) ?? -1)
const previous = computed(() => data.value?.chapters[selectedIndex.value - 1])
const next = computed(() => data.value?.chapters[selectedIndex.value + 1])
const prerequisites = computed(() => {
  if (!data.value) return []
  const ids = new Set(data.value.prerequisites.filter((edge) => chapterPoints.value.some((point) => point.id === edge.target_knowledge_point_id)).flatMap((edge) => edge.prerequisite_knowledge_point_ids))
  return [...ids].map((id) => {
    const point = data.value.points.find((item) => item.id === id)
    const chapter = data.value.chapters.find((item) => item.pointIds.includes(id))
    return point && chapter ? { id, name: point.name, book: bookCode.value, chapter: chapter.id } : null
  }).filter(Boolean)
})
function selectBook(code) { router.push(knowledgeRoute({ book: code })) }
function sectionPath(site) { return `/${site.grade}/${site.book}/${site.chapter}/${site.section}` }
async function focusPoint(id) {
  await router.push(knowledgeRoute({ book: bookCode.value, chapter: selectedChapter.value.id, point: id }))
  await nextTick()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
watch([selectedChapter, selectedPointId], async ([chapter, id]) => {
  if (!chapter || !id) return
  await nextTick()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})
</script>

<style scoped>
.library-head h1 { color: #fff; }
.library-context button { display: block; width: 100%; text-align: left; background: none; border: 0; color: #3d554e; padding: 8px 10px; line-height: 1.45; font-size: 13px; cursor: pointer; }
.library-context button:hover { background: #edf4ef; }
.source a { display: inline-block; margin: 3px 12px 0 0; color: #285948; }
.library{max-width:1440px;margin:auto;padding:28px 24px 80px;color:var(--text)}
.library-head{background:#102d34;color:#fff;padding:clamp(28px,5vw,70px);border-radius:5px;margin-bottom:24px;background-image:radial-gradient(circle at 90% 5%,#386b67 0,transparent 42%)}
.eyebrow{font-size:12px;letter-spacing:.18em;color:#c4decf;font-weight:700}.library-head h1{font-size:clamp(30px,4vw,54px);margin:16px 0}.library-head p{max-width:760px;line-height:1.8;color:#d8e5e3}.summary{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.summary span{border:1px solid #73948d;padding:6px 12px;font-size:12px}
.library-layout{display:grid;grid-template-columns:260px minmax(0,1fr) 210px;gap:28px;align-items:start}.library-nav,.library-context{position:sticky;top:90px;max-height:calc(100vh - 110px);overflow:auto}.library-nav{border-top:2px solid #27483c;padding-top:16px}.library-nav label{display:block;font-weight:700;font-size:12px;margin:0 0 8px}.library-nav select,.library-nav input{width:100%;padding:10px;border:1px solid #bac9c1;border-radius:3px;background:white;color:#173b35;margin-bottom:18px}.chapter-groups section{border-top:1px solid #d7e1db}.group-toggle{display:flex;justify-content:space-between;gap:10px;width:100%;padding:12px 0;background:none;border:0;text-align:left;color:#173b35;font-weight:700;cursor:pointer}.chapter-link,.search-results a,.library-context a{display:block;text-decoration:none;color:#3d554e;padding:8px 10px;line-height:1.45;font-size:13px}.chapter-link.active{background:#e5efe8;color:#174a3a;border-left:3px solid #326450}.chapter-link:hover,.search-results a:hover,.library-context a:hover{background:#edf4ef}.search-results>span{display:block;font-size:12px;color:#687972;margin-bottom:8px}.search-results small{display:block;color:#76847e}.library-main{min-width:0}.crumb{font-size:12px;color:#738078;margin-bottom:20px}.crumb a{color:#2d6150}.status{display:inline-block;color:#875528;background:#fbf1df;padding:6px 10px;font-size:12px;font-weight:700}.library-main h2{font-size:clamp(26px,3vw,38px);color:#183b35;margin:16px 0}.chapter-summary{font-size:16px;line-height:1.9;color:#394d47}.chapter-meta{display:flex;gap:16px;color:#738078;font-size:12px;margin:18px 0}.lesson-link{display:inline-block;background:#255849;color:white;padding:12px 18px;text-decoration:none;margin:0 0 28px}.lesson-link:hover{background:#173c32}.point-list{display:grid;gap:18px}.point-card{border:1px solid #d4e0d8;background:#fff;padding:24px;scroll-margin-top:100px}.point-card.focused{border-color:#2e6953}.point-top{display:flex;justify-content:space-between;gap:10px;font-size:11px;color:#8b6849}.point-card h3{font-size:23px;color:#183b35;margin:12px 0}.point-definition{line-height:1.8;font-size:16px}.point-card details{border-top:1px solid #e2e9e4;margin-top:20px;padding-top:16px}.point-card summary{cursor:pointer;color:#285948;font-weight:700}.point-body{line-height:1.85;color:#394d47}.point-body h4{color:#1e473b;margin:18px 0 4px}.point-body p{margin:4px 0 12px}.source{border-top:1px solid #e2e9e4;padding-top:15px;margin-top:20px;font-size:12px;color:#7e6a55}.library-context{border-left:1px solid #d5e1d8;padding-left:16px}.library-context h3{font-size:13px;color:#1c4c3e;margin:0 0 10px}.library-context h3:not(:first-child){margin-top:28px}.context-note{font-size:12px;line-height:1.7;color:#718078}.chapter-actions{display:flex;justify-content:space-between;margin-top:28px}.chapter-actions a{color:#255849;text-decoration:none;font-weight:700}.loading,.empty{padding:30px;color:#667a6e}
@media(max-width:1050px){.library-layout{grid-template-columns:230px minmax(0,1fr)}.library-context{position:static;grid-column:2;max-height:none;display:flex;flex-wrap:wrap;gap:4px}.library-context h3,.context-note{width:100%}}
@media(max-width:700px){.library{padding:12px 12px 50px}.library-layout{display:block}.library-nav{position:static;max-height:300px;overflow:auto;margin-bottom:22px}.library-context{margin-top:30px}.library-head{padding:28px 22px}.point-card{padding:18px}}
</style>
