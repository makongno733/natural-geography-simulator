<template>
  <div class="page-shell" v-if="sectionData">
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

    <template v-if="!showMindMap && !showSandbox && !showEarth3D && !showSoilProfile && !showAtmo && !showWater && !showDisaster">
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
        <p class="read-time">课堂速览：约 1 分钟讲完小结，3D 模型负责展开过程。</p>

        <section class="lesson-brief">
          <div class="brief-copy">
            <span class="brief-label">课后小结</span>
            <p>{{ classroomSummary }}</p>
          </div>
          <div class="brief-actions">
            <button v-if="isGrouped" class="primary-action" @click="showMindMap = true">打开思维导图</button>
            <button v-if="isEarthChapter" class="ghost-action" @click="showEarth3D = true">专项地球模型</button>
            <button v-if="isAtmoChapter" class="ghost-action" @click="showAtmo = true">专项大气模型</button>
            <button v-if="isWaterChapter" class="ghost-action" @click="showWater = true">专项水循环</button>
            <button v-if="isLandformChapter" class="ghost-action" @click="showSandbox = true">专项地貌沙盘</button>
            <button v-if="isSoilChapter" class="ghost-action" @click="showSoilProfile = true">专项土壤剖面</button>
            <button v-if="isDisasterChapter" class="ghost-action" @click="showDisaster = true">专项灾害模拟</button>
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
            <h3 class="concept-group-title">{{ groupName }}</h3>
            <div v-for="(defs, conceptName) in concepts" :key="conceptName" class="concept-item">
              <div class="concept-item-name">• {{ conceptName }}</div>
              <div class="concept-item-body">• {{ defs[gradeLevel] || defs['高中'] || defs['初中'] }}</div>
            </div>
          </div>
        </section>
        <section v-else-if="conceptEntries.length" class="concept-defs">
          <h3 class="concept-group-title">核心概念</h3>
          <div v-for="[name, defs] in conceptEntries" :key="name" class="concept-item">
            <div class="concept-item-name">• {{ name }}</div>
            <div class="concept-item-body">• {{ defs[gradeLevel] || defs['高中'] || defs['初中'] }}</div>
          </div>
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
    @close="showMindMap = false"
  />

  <!-- 3D 沙盘视图 -->
  <SandboxApp v-else-if="showSandbox" embedded @close="showSandbox = false" />

  <!-- 3D 地球视图 -->
  <Earth3D v-else-if="showEarth3D" />

  <!-- 3D 土壤剖面 -->
  <SoilProfilePage v-else-if="showSoilProfile" />

  <!-- 3D 大气模型视图 -->
  <AtmosphereViewer v-else-if="showAtmo" />

  <!-- 3D 水循环视图 -->
  <WaterCycleView v-else-if="showWater" @close="showWater = false" />

  <!-- 3D 灾害模拟 -->
  <DisasterSandbox v-else-if="showDisaster" embedded @close="showDisaster = false" />

  </div>

  <div v-if="loading" class="page-shell not-found">
    <p>加载中...</p>
  </div>
  <div v-else-if="!sectionData" class="page-shell not-found">
    <p>未找到该节内容</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { getSection, getChapter } from './data/catalogLoader.js'
import { loadSectionContent } from './data/contentLoader.js'

const SandboxApp = defineAsyncComponent(() => import('../sandbox/SandboxApp.vue'))
const Earth3D = defineAsyncComponent(() => import('../sandbox/Earth3D.vue'))
const SoilProfilePage = defineAsyncComponent(() => import('../soil-profile/SoilProfilePage.vue'))
const AtmosphereViewer = defineAsyncComponent(() => import('./components/AtmosphereViewer.vue'))
const MindMapViewer = defineAsyncComponent(() => import('./components/MindMapViewer.vue'))
const WaterCycleView = defineAsyncComponent(() => import('../engine/WaterCycleView.vue'))
const DisasterSandbox = defineAsyncComponent(() => import('../sandbox/DisasterSandbox.vue'))

const route = useRoute()
const gradeId = computed(() => route.params.grade)
const bookId = computed(() => route.params.book)
const chapterId = computed(() => route.params.chapter)
const sectionId = computed(() => route.params.section)

const loading = ref(true)
const showSandbox = ref(false)
const showEarth3D = ref(false)
const showSoilProfile = ref(false)
const showAtmo = ref(false)
const showWater = ref(false)
const showDisaster = ref(false)
const showMindMap = ref(false)
const isLandformChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第四章'
)
const isDisasterChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第六章'
)
const isEarthChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第一章'
)
const isAtmoChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第二章'
)
const isSoilChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第五章'
)
const isWaterChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第三章'
)

const chapterData = ref(null)
const sectionData = ref(null)

const teachingKeyPoints = computed(() =>
  extraContent.value?.keyPoints ||
  sectionData.value?.content?.keyPoints ||
  []
)
const classroomSummary = computed(() => {
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

const loadedContent = ref(null)

const extraContent = computed(() => {
  if (!loadedContent.value) return null
  if (gradeId.value === '大学') {
    // Section-level content: has body, keyPoints
    return loadedContent.value
  }
  // Chapter-level content: has fullText, keyPoints
  return loadedContent.value
})

watch([gradeId, bookId, chapterId, sectionId], async () => {
  showSandbox.value = false
  showEarth3D.value = false
  showSoilProfile.value = false
  showAtmo.value = false
  showWater.value = false
  showDisaster.value = false
  showMindMap.value = false
  loadedContent.value = null
  loading.value = true

  const [chapter, section, content] = await Promise.all([
    getChapter(gradeId.value, bookId.value, chapterId.value),
    getSection(gradeId.value, bookId.value, chapterId.value, sectionId.value),
    loadSectionContent(gradeId.value, bookId.value, chapterId.value, sectionId.value)
  ])

  chapterData.value = chapter
  sectionData.value = section
  loadedContent.value = content
  loading.value = false
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
  border: 1px solid var(--brown);
  border-radius: var(--radius-box);
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,248,238,0.95));
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
  color: #6b3b32;
  font-size: 13px;
  border-radius: 6px;
  transition: background var(--transition);
}
.section-list a:hover { background: var(--brown-light); }
.section-list a.active {
  background: var(--red);
  color: #fff;
  font-weight: 600;
}

.content {
  border: 1px solid var(--brown);
  border-radius: var(--radius-box);
  background: rgba(255,255,255,0.97);
  padding: 24px;
  box-shadow: var(--shadow-sm);
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
  color: #7a6051;
}
.lesson-brief {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: stretch;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid rgba(183, 55, 44, 0.22);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(255, 252, 245, 0.98), rgba(255, 241, 224, 0.92)),
    radial-gradient(circle at 0 0, rgba(183, 55, 44, 0.08), transparent 36%);
}
.brief-copy {
  min-width: 0;
}
.brief-label {
  display: inline-flex;
  margin-bottom: 8px;
  border: 1px solid rgba(183, 55, 44, 0.24);
  border-radius: 999px;
  padding: 3px 9px;
  font-size: 12px;
  font-weight: 700;
  color: var(--red);
  background: rgba(255, 255, 255, 0.72);
}
.brief-copy p {
  margin: 0;
  color: #32211b;
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
  border: 1px solid rgba(100, 122, 63, 0.42);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--button-green-ink);
  background: linear-gradient(180deg, rgba(246, 250, 228, 0.98), rgba(220, 232, 184, 0.94));
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.primary-action {
  color: #fdfef6;
  border-color: rgba(84, 104, 51, 0.62);
  background: linear-gradient(135deg, #7f9850, #536936);
}
.primary-action:hover,
.ghost-action:hover {
  transform: translateY(-1px);
  border-color: rgba(100, 122, 63, 0.74);
  box-shadow: var(--shadow-hover);
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
  color: var(--button-green-ink);
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border: 1px solid rgba(100, 122, 63, 0.38);
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, rgba(250, 253, 235, 0.98), rgba(223, 234, 190, 0.9));
  transition: background var(--transition), border-color var(--transition);
}
.nav-link:hover {
  background: var(--button-green);
  border-color: rgba(100, 122, 63, 0.72);
  text-decoration: none;
}
.not-found { text-align: center; padding: 60px 20px; }
.not-found a { color: #b01217; }

.concept-defs {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--brown-light);
}
.concept-group {
  margin-bottom: 18px;
}
.concept-group-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--red);
}
.concept-item {
  margin-bottom: 8px;
}
.concept-item-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--button-green-ink);
  padding-left: 4px;
}
.concept-item-body {
  padding-left: 20px;
  font-size: 13.5px;
  line-height: 1.88;
  color: #3d231b;
  text-align: justify;
  white-space: pre-line;
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
  .content-layout { grid-template-columns: 1fr; }
  .mindmap-branches {
    grid-template-columns: 1fr;
  }
}
</style>
