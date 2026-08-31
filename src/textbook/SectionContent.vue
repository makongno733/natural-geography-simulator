<template>
  <div v-if="sectionData && !loading" class="page-shell">
    <div class="breadcrumb">
      <router-link to="/">首页</router-link>
      <span class="sep">></span>
      <router-link :to="'/' + gradeId">{{ gradeId }}</router-link>
      <span class="sep">></span>
      <router-link :to="'/' + gradeId + '/' + bookId">{{ bookId }}</router-link>
      <span class="sep">></span>
      <router-link :to="{ name: 'chapter', params: { grade: gradeId, book: bookId, chapter: chapterId } }">
        {{ chapterId }} {{ chapterData.title }}
      </router-link>
      <span class="sep">></span>
      <span>{{ sectionId }}</span>
    </div>

    <template v-if="!showMindMap && !showDataViz">
    <div class="content-layout">
      <aside class="sidebar">
        <h3 class="sidebar-title">{{ chapterId }} {{ chapterData.title }}</h3>
        <ul class="section-list">
          <li v-for="sec in chapterData.sections" :key="sec.id">
            <router-link
              :to="'/' + gradeId + '/' + bookId + '/' + chapterId + '/' + sec.id"
              :class="{ active: sec.id === sectionId }"
            >
              {{ sec.id }} {{ sec.title }}
            </router-link>
          </li>
        </ul>
      </aside>

      <main class="content">
        <h2 class="section-title">{{ sectionId }} {{ sectionData.title }}</h2>
        <TextbookExperimentCard
          v-if="experimentLink"
          :link="experimentLink"
          :textbook="textbookContext"
        />
        <p v-if="!studentLearning" class="read-time">课堂速览：约 1 分钟讲完小结，3D 模型负责展开过程。</p>

        <StudentLearningView
          v-if="studentLearning"
          :learning="studentLearning"
          :section-title="sectionData.title"
          :chapter-title="chapterData.title"
          :local-tools="learningTools"
          @open-tool="openLearningTool"
        />
        <template v-else>
        <section class="lesson-brief">
          <div class="brief-copy">
            <span class="brief-label">课后小结</span>
            <p>{{ classroomSummary }}</p>
          </div>
          <div v-if="learningTools.length" class="brief-actions">
            <button v-if="isGrouped" class="primary-action" @click="showMindMap = true">打开思维导图</button>
            <button v-if="dataVizType" class="ghost-action" @click="showDataViz = true">数据可视化</button>
          </div>
        </section>

        <section v-if="!isGrouped" class="mindmap-card">
          <div class="mindmap-center">
            <strong>{{ sectionData.title }}</strong>
            <span>{{ chapterData.title }}</span>
          </div>
          <div class="mindmap-branches">
            <div v-for="branch in mindMapBranches" :key="branch.title" class="mindmap-branch">
              <h3>{{ branch.title }}</h3>
              <ul>
                <li v-for="item in branch.items" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>
        </section>

        <section v-if="isGrouped" class="concept-defs">
          <div v-for="(concepts, groupName) in conceptDefinitions" :key="groupName" class="concept-group">
            <button
              type="button"
              class="concept-group-title"
              :aria-expanded="!collapsedGroups[groupName]"
              @click="toggleGroup(groupName)"
            >
              <span class="group-dot" :style="{ background: groupAccent(groupName) }"></span>
              <span class="group-name">{{ groupName }}</span>
              <span class="group-count">{{ conceptCount(concepts) }}</span>
              <span class="group-arrow" aria-hidden="true">{{ collapsedGroups[groupName] ? '▸' : '▾' }}</span>
            </button>
            <div v-show="!collapsedGroups[groupName]" class="concept-items">
              <div v-for="(defs, conceptName) in concepts" :key="conceptName" class="concept-item">
                <div class="concept-item-name">{{ conceptName }}</div>
                <div class="concept-item-body">{{ defs[gradeLevel] || defs['高中'] || defs['初中'] }}</div>
              </div>
            </div>
          </div>
        </section>
        <section v-else-if="conceptEntries.length" class="concept-defs">
          <h3 class="concept-group-title">核心概念</h3>
          <div v-for="[name, defs] in conceptEntries" :key="name" class="concept-item">
            <div class="concept-item-name">{{ name }}</div>
            <div class="concept-item-body">{{ defs[gradeLevel] || defs['高中'] || defs['初中'] }}</div>
          </div>
        </section>
        </template>

        <section v-if="figures.length" class="section-figures" aria-label="关键图表">
          <h3 class="figures-title">关键图表</h3>
          <figure v-for="(fig, figIndex) in figures" :key="fig.id" class="figure-card">
            <div class="figure-images" :class="'figure-count-' + fig.images.length">
              <img
                v-for="(key, imageIndex) in fig.images"
                :key="key"
                :src="resolveFigure(key)"
                :alt="fig.caption"
                decoding="async"
                :loading="isFirstFigure(figIndex, imageIndex) ? 'eager' : 'lazy'"
                :fetchpriority="isFirstFigure(figIndex, imageIndex) ? 'high' : undefined"
              />
            </div>
            <figcaption class="figure-caption">{{ fig.caption }}</figcaption>
          </figure>
        </section>

        <div class="section-nav">
          <router-link
            v-if="prevSection"
            :to="'/' + gradeId + '/' + bookId + '/' + chapterId + '/' + prevSection.id"
            class="nav-link prev"
          >← 上一节</router-link>
          <span v-else></span>
          <router-link
            v-if="nextSection"
            :to="'/' + gradeId + '/' + bookId + '/' + chapterId + '/' + nextSection.id"
            class="nav-link next"
          >下一节 →</router-link>
        </div>
      </main>
    </div>
  </template>

  <!-- 思维导图视图 -->
  <MindMapViewer
    v-else-if="showMindMap && isGrouped"
    :conceptDefinitions="conceptDefinitions"
    :sectionTitle="sectionData?.title || ''"
    :chapterTitle="chapterData?.title || ''"
    :gradeLevel="gradeLevel"
    @close="closeTeachingTool"
  />

  <DataVizViewer v-else-if="showDataViz && dataVizType" :type="dataVizType" :title="sectionData?.title || '数据可视化'" @close="closeTeachingTool" />

  </div>

  <div v-else-if="loading" class="page-shell not-found">
    <p>加载中...</p>
  </div>
  <div v-else-if="!sectionData" class="page-shell not-found">
    <p>未找到该节内容</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, defineAsyncComponent, h } from 'vue'
import { useRoute } from 'vue-router'
import { getSection, getChapter } from './data/catalogLoader.js'
import { loadSectionContent } from './data/contentLoader.js'
import StudentLearningView from './components/StudentLearningView.vue'
import TextbookExperimentCard from './components/TextbookExperimentCard.vue'
import AsyncModuleError from './components/AsyncModuleError.vue'
import { normalizeStudentLearning } from './utils/studentLearningSchema.js'
import { loadFigureAssets } from './data/figureAssets/loader.js'
import { getSectionExperimentLink } from './data/experimentLinks.js'

const asyncTool = (loader, moduleName = '教学互动工具') => defineAsyncComponent({
  loader,
  errorComponent: (props) => h(AsyncModuleError, { ...props, moduleName }),
  delay: 0,
  timeout: 10000,
})

const MindMapViewer = asyncTool(() => import('./components/MindMapViewer.vue'), '思维导图')
const DataVizViewer = asyncTool(() => import('./components/DataVizViewer.vue'), '数据可视化')

const route = useRoute()
const gradeId = computed(() => route.params.grade)
const bookId = computed(() => route.params.book)
const chapterId = computed(() => route.params.chapter)
const sectionId = computed(() => route.params.section)
const textbookContext = computed(() => ({
  grade: gradeId.value,
  book: bookId.value,
  chapter: chapterId.value,
  section: sectionId.value,
}))
const experimentLink = computed(() => getSectionExperimentLink(textbookContext.value))

const loading = ref(true)
const showDataViz = ref(false)
const showMindMap = ref(false)
// 必修二 data visualization chapters
const dataVizType = computed(() => {
  if (gradeId.value !== '高中' || bookId.value !== '必修第二册') return null
  const map = { '第一章':'pyramid', '第二章':'urban', '第三章':'triangle', '第四章':'transport', '第五章':'sustain' }
  return map[chapterId.value] || null
})
const learningTools = computed(() => [
  isGrouped.value && { id: 'mindmap', label: '打开思维导图', primary: true },
  dataVizType.value && { id: 'data-viz', label: '打开数据可视化' },
].filter(Boolean))

function openLearningTool(id) {
  if (id === 'mindmap') showMindMap.value = true
  if (id === 'data-viz') showDataViz.value = true
}

function closeTeachingTool() {
  showDataViz.value = false
  showMindMap.value = false
}

const chapterData = ref(null)
const sectionData = ref(null)

const teachingKeyPoints = computed(() =>
  extraContent.value?.keyPoints ||
  sectionData.value?.content?.keyPoints ||
  []
)
const classroomSummary = computed(() => {
  const overview = studentLearning.value?.overview
  if (overview) return overview
  const chapterTitle = chapterData.value?.title || '本章'
  const sectionTitle = sectionData.value?.title || '本节'
  const conceptNames = conceptEntries.value.slice(0, 3).map(([n]) => n).join('、') || '核心概念、过程机制、区域应用'
  return `本节放在”${chapterTitle}”的知识框架下理解，重点抓住”${sectionTitle}”中的${conceptNames}，并沿着”条件—过程—结果—应用”的顺序解释相关地理机制。课堂上先阅读概念定义建立知识框架，再用思维导图完成知识收束。`
})
const mindMapBranches = computed(() => {
  if (isGrouped.value && conceptDefinitions.value) {
    return Object.entries(conceptDefinitions.value).map(([group, concepts]) => ({
      title: group,
      items: Object.keys(concepts).slice(0, 6)
    })).filter(b => b.items.length)
  }
  const fallbackPoints = teachingKeyPoints.value.slice(0, 4)
  return [
    { title: '核心概念', items: fallbackPoints },
    { title: '过程机制', items: fallbackPoints },
    { title: '空间层次', items: [chapterData.value?.title, sectionData.value?.title].filter(Boolean) },
    { title: '判读迁移', items: ['读图', '解释', '迁移'] },
  ].filter(branch => branch.items?.length)
})

const gradeLevel = computed(() => {
  if (gradeId.value === '初中') return '初中'
  return '高中'
})

const isGrouped = computed(() => {
  const defs = conceptDefinitions.value
  if (!defs) return false
  const keys = Object.keys(defs)
  if (keys.length === 0) return false
  return typeof defs[keys[0]] === 'object' && !('初中' in (defs[keys[0]] || {}) || '高中' in (defs[keys[0]] || {}))
})

const conceptDefinitions = computed(() => {
  if (!loadedContent.value) return null
  return loadedContent.value.conceptDefinitions || null
})

const conceptEntries = computed(() => {
  const defs = conceptDefinitions.value
  if (!defs) return []
  return Object.entries(defs)
})

const figures = computed(() => {
  const list = loadedContent.value?.figures
  return Array.isArray(list) ? list : []
})
const figureAssets = ref({})
const resolveFigure = (key) => figureAssets.value[key] || ''
const isFirstFigure = (figIndex, imageIndex) => figIndex === 0 && imageIndex === 0

const GROUP_ACCENTS = {
  核心概念: '#b01217',
  过程机制: '#2f6fb2',
  空间规律: '#4a7c4a',
  典型案例: '#c8822a',
  易错辨析: '#7b4fa0',
}
const groupAccent = (name) => GROUP_ACCENTS[name] || '#5c6b7a'
const conceptCount = (concepts) => Object.keys(concepts || {}).length

const collapsedGroups = reactive({})
function toggleGroup(name) {
  collapsedGroups[name] = !collapsedGroups[name]
}

const loadedContent = ref(null)

watch(conceptDefinitions, (defs) => {
  Object.keys(collapsedGroups).forEach((k) => delete collapsedGroups[k])
  const names = defs ? Object.keys(defs) : []
  names.forEach((name) => {
    collapsedGroups[name] = name !== '核心概念'
  })
}, { immediate: true })

const studentLearning = computed(() =>
  normalizeStudentLearning(loadedContent.value?.studentLearning)
)

const extraContent = computed(() => {
  if (!loadedContent.value) return null
  if (gradeId.value === '大学') {
    // Section-level content: has body, keyPoints
    return loadedContent.value
  }
  // Chapter-level content: has fullText, keyPoints
  return loadedContent.value
})

let loadGeneration = 0

watch([gradeId, bookId, chapterId, sectionId], async () => {
  const generation = ++loadGeneration
  const ids = {
    grade: gradeId.value,
    book: bookId.value,
    chapter: chapterId.value,
    section: sectionId.value,
  }

  closeTeachingTool()
  chapterData.value = null
  sectionData.value = null
  loadedContent.value = null
  figureAssets.value = {}
  loading.value = true

  try {
    const [chapter, section] = await Promise.all([
      getChapter(ids.grade, ids.book, ids.chapter),
      getSection(ids.grade, ids.book, ids.chapter, ids.section),
    ])
    if (generation !== loadGeneration) return

    const [content, assets] = await Promise.all([
      loadSectionContent(ids.grade, ids.book, ids.chapter, ids.section).catch(() => null),
      loadFigureAssets(ids.grade, ids.book).catch(() => ({})),
    ])

    if (generation !== loadGeneration) return
    chapterData.value = chapter
    sectionData.value = section
    loadedContent.value = content
    figureAssets.value = assets
  } finally {
    if (generation === loadGeneration) loading.value = false
  }
}, { immediate: true })

const prevSection = computed(() => {
  if (!chapterData.value) return null
  const idx = chapterData.value.sections.findIndex(s => s.id === sectionId.value)
  return idx > 0 ? chapterData.value.sections[idx - 1] : null
})
const nextSection = computed(() => {
  if (!chapterData.value) return null
  const idx = chapterData.value.sections.findIndex(s => s.id === sectionId.value)
  return idx < chapterData.value.sections.length - 1 ? chapterData.value.sections[idx + 1] : null
})
</script>

<style scoped>
.page-shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: 22px 20px 44px;
}
.breadcrumb {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 20px;
  padding: 7px 12px;
  background: rgba(255,255,255,0.82);
  border-radius: var(--radius-sm);
  border: 1px solid var(--brown-light);
  display: inline-block;
  line-height: 1.6;
}
.breadcrumb a { color: var(--red); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }
.sep { margin: 0 8px; color: var(--brown-dark); }

.content-layout {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 18px;
  align-items: start;
}

.sidebar {
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-box);
  background: var(--surface);
  padding: 14px;
  position: sticky;
  top: 20px;
  box-shadow: var(--shadow-sm);
}
.sidebar-title {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--red);
  font-weight: 700;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--brown-light);
}
.section-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.section-list li { margin-bottom: 4px; }
.section-list a {
  display: block;
  padding: 7px 10px;
  text-decoration: none;
  color: var(--text);
  font-size: 13px;
  border-radius: 999px;
  transition: background var(--transition);
}
.section-list a:hover { background: var(--brown-light); }
.section-list a.active {
  background: var(--red);
  color: #fff;
  font-weight: 600;
}

.content {
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  min-width: 0;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-box);
  background: rgba(255, 255, 255, 0.88);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}
.content :deep([data-student-learning-view]) {
  max-width: 860px;
  margin-inline: auto;
}
.section-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: var(--red);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--brown-light);
}
.read-time {
  margin: -8px 0 14px;
  font-size: 12px;
  color: var(--text-muted);
}
.lesson-brief {
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: stretch;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid rgba(31, 111, 235, 0.22);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(250, 252, 255, 0.98), rgba(238, 244, 254, 0.95)),
    radial-gradient(circle at 0 0, rgba(31, 111, 235, 0.08), transparent 36%);
}
.brief-copy {
  min-width: 0;
}
.brief-label {
  display: inline-flex;
  margin-bottom: 8px;
  border: 1px solid rgba(31, 111, 235, 0.24);
  border-radius: 999px;
  padding: 3px 9px;
  font-size: 12px;
  font-weight: 700;
  color: var(--red);
  background: rgba(255, 255, 255, 0.72);
}
.brief-copy p {
  margin: 0;
  color: var(--text);
  font-size: 16px;
  line-height: 1.88;
  text-align: justify;
}
.brief-actions {
  display: grid;
  align-content: start;
  gap: 6px;
  width: 150px;
}
.primary-action,
.ghost-action {
  min-height: 40px;
  border: 1px solid var(--accent);
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  background: var(--surface);
  cursor: pointer;
  box-shadow: none;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
}
.primary-action {
  position: relative;
  overflow: hidden;
  color: #fff;
  border-color: var(--accent-strong);
  background: var(--gem-flecks), var(--gem);
  box-shadow: var(--gem-glow), var(--gem-inner);
}
.primary-action::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 45%;
  background-image: var(--rainbow-sweep);
  transform: translateX(-140%) skewX(-14deg);
  transition: transform 0.55s ease;
  pointer-events: none;
}
.primary-action:hover {
  background: var(--gem-flecks), var(--gem-deep);
  border-color: #154aa8;
  box-shadow: 0 6px 20px rgba(31, 111, 235, 0.42), var(--gem-inner);
}
.primary-action:hover::after {
  transform: translateX(340%) skewX(-14deg);
}
.ghost-action:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
}
.primary-action:focus-visible,
.ghost-action:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
}
.section-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--brown);
}
.nav-link {
  text-decoration: none;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  transition: background var(--transition), border-color var(--transition);
}
.nav-link:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
  text-decoration: none;
}
.not-found { text-align: center; padding: 60px 20px; }
.not-found a { color: var(--accent); }

.concept-defs {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--brown-light);
}
.concept-group {
  margin-bottom: 18px;
  border: 1px solid rgba(31, 111, 235, 0.14);
  border-radius: 14px;
  padding: 8px 12px;
  background: rgba(248, 251, 255, 0.55);
}
.concept-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin: 0;
  padding: 4px 2px 8px;
  border: none;
  border-bottom: 1px solid rgba(31, 111, 235, 0.12);
  background: transparent;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}
.concept-group-title:hover .group-name { color: var(--red); }
.group-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: none;
}
.group-name { flex: 1; }
.group-count {
  font-size: 12px;
  font-weight: 600;
  color: #5c6b7a;
  background: rgba(31, 111, 235, 0.08);
  border-radius: 999px;
  padding: 1px 8px;
}
.group-arrow {
  color: #5c6b7a;
  font-size: 13px;
  width: 12px;
  text-align: center;
}
.concept-items {
  padding-top: 8px;
}
.concept-item {
  margin-bottom: 11px;
}
.concept-item-name {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--button-green-ink);
  padding-left: 4px;
  margin-bottom: 2px;
}
.concept-item-body {
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.92;
  color: var(--text);
  text-align: justify;
  white-space: pre-line;
}

.section-figures {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--brown-light);
}
.figures-title {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 700;
  color: var(--red);
}
.figure-card {
  margin: 0 0 18px;
  padding: 12px;
  border: 1px solid rgba(31, 111, 235, 0.16);
  border-radius: 14px;
  background: rgba(248, 251, 255, 0.6);
}
.figure-images {
  display: grid;
  gap: 10px;
  justify-items: center;
}
.figure-images img {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  display: block;
}
.figure-count-2 { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.figure-count-4 { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
.figure-caption {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 960px) {
  .content-layout { grid-template-columns: 180px 1fr; gap: 14px; }
  .lesson-brief {
    grid-template-columns: 1fr;
  }
  .brief-actions {
    width: auto;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  .mindmap-card {
    grid-template-columns: 1fr;
  }
  .mindmap-card::before {
    display: none;
  }
  .mindmap-branches {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .page-shell { padding: 14px 10px 32px; }
  .content-layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .content { padding: 16px 12px; }
  .mindmap-branches {
    grid-template-columns: 1fr;
  }
}
</style>
