<template>
  <div class="page-shell" v-if="sectionData">
    <div class="breadcrumb">
      <router-link to="/">首页</router-link>
      <span class="sep">></span>
      <router-link :to="'/' + gradeId">{{ gradeId }}</router-link>
      <span class="sep">></span>
      <router-link :to="'/' + gradeId + '/' + bookId">{{ bookId }}</router-link>
      <span class="sep">></span>
      <span>{{ chapterId }} {{ chapterData.title }}</span>
      <span class="sep">></span>
      <span>{{ sectionId }}</span>
    </div>

    <div v-if="hasChapter3D" class="sandbox-toggle-bar chapter3d-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showChapter3D }]"
        @click="showChapter3D = false"
      >课文</button>
      <button
        :class="['sandbox-toggle', { active: showChapter3D }]"
        @click="showChapter3D = true"
      >章节3D总览</button>
      <span class="chapter3d-hint">{{ chapter3DRecipe.title }} · {{ chapter3DRecipe.subtitle }}</span>
    </div>

    <!-- 3D 沙盘切换（第四章地貌专用） -->
    <div v-if="!showChapter3D && isLandformChapter" class="sandbox-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showSandbox }]"
        @click="showSandbox = false"
      >📖 课文</button>
      <button
        :class="['sandbox-toggle', { active: showSandbox }]"
        @click="showSandbox = true"
      >🏔 3D 沙盘</button>
    </div>

    <!-- 3D 地球切换（第一章宇宙中的地球专用） -->
    <div v-if="!showChapter3D && isEarthChapter" class="sandbox-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showEarth3D }]"
        @click="showEarth3D = false"
      >📖 课文</button>
      <button
        :class="['sandbox-toggle', { active: showEarth3D }]"
        @click="showEarth3D = true"
      >🌍 3D 地球探索</button>
    </div>

    <!-- 3D 土壤剖面切换（第五章植被与土壤专用） -->
    <div v-if="!showChapter3D && isSoilChapter" class="sandbox-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showSoilProfile }]"
        @click="showSoilProfile = false"
      >📖 课文</button>
      <button
        :class="['sandbox-toggle', { active: showSoilProfile }]"
        @click="showSoilProfile = true"
      >🧪 3D 土壤剖面</button>
    </div>

    <!-- 3D 灾害模拟（第六章自然灾害专用） -->
    <div v-if="!showChapter3D && isDisasterChapter" class="sandbox-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showDisaster }]"
        @click="showDisaster = false"
      >📖 课文</button>
      <button
        :class="['sandbox-toggle', { active: showDisaster }]"
        @click="showDisaster = true"
      >🌀 3D 灾害模拟</button>
    </div>

    <!-- 3D 大气模型切换（第二章地球上的大气专用） -->
    <div v-if="!showChapter3D && isAtmoChapter" class="sandbox-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showAtmo }]"
        @click="showAtmo = false"
      >📖 课文</button>
      <button
        :class="['sandbox-toggle', { active: showAtmo }]"
        @click="showAtmo = true"
      >🌍 3D 大气模型</button>
    </div>

    <!-- 3D 水循环切换（第三章地球上的水专用） -->
    <div v-if="!showChapter3D && isWaterChapter" class="sandbox-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showWater }]"
        @click="showWater = false"
      >📖 课文</button>
      <button
        :class="['sandbox-toggle', { active: showWater }]"
        @click="showWater = true"
      >💧 3D 水循环</button>
    </div>

    <template v-if="!showChapter3D && !showSandbox && !showEarth3D && !showSoilProfile && !showAtmo && !showWater && !showDisaster">
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
            <button v-if="hasChapter3D" class="primary-action" @click="showChapter3D = true">打开章节3D</button>
            <button v-if="isEarthChapter" class="ghost-action" @click="showEarth3D = true">专项地球模型</button>
            <button v-if="isAtmoChapter" class="ghost-action" @click="showAtmo = true">专项大气模型</button>
            <button v-if="isWaterChapter" class="ghost-action" @click="showWater = true">专项水循环</button>
            <button v-if="isLandformChapter" class="ghost-action" @click="showSandbox = true">专项地貌沙盘</button>
            <button v-if="isSoilChapter" class="ghost-action" @click="showSoilProfile = true">专项土壤剖面</button>
            <button v-if="isDisasterChapter" class="ghost-action" @click="showDisaster = true">专项灾害模拟</button>
          </div>
        </section>

        <section class="mindmap-card">
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

  <!-- 通用章节 3D 总览 -->
  <Chapter3DViewer
    v-else-if="showChapter3D && chapter3DRecipe"
    :recipe="chapter3DRecipe"
    @close="showChapter3D = false"
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

  <div v-if="!sectionData" class="page-shell not-found">
    <p>未找到该节内容</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { getSection, getChapter } from './data/catalogLoader.js'
import { loadSectionContent } from './data/contentLoader.js'
import { getChapter3DRecipe } from './data/chapter3dRegistry.js'

const SandboxApp = defineAsyncComponent(() => import('../sandbox/SandboxApp.vue'))
const Earth3D = defineAsyncComponent(() => import('../sandbox/Earth3D.vue'))
const SoilProfilePage = defineAsyncComponent(() => import('../soil-profile/SoilProfilePage.vue'))
const AtmosphereViewer = defineAsyncComponent(() => import('./components/AtmosphereViewer.vue'))
const Chapter3DViewer = defineAsyncComponent(() => import('./components/Chapter3DViewer.vue'))
const WaterCycleView = defineAsyncComponent(() => import('../engine/WaterCycleView.vue'))
const DisasterSandbox = defineAsyncComponent(() => import('../sandbox/DisasterSandbox.vue'))

const route = useRoute()
const gradeId = computed(() => route.params.grade)
const bookId = computed(() => route.params.book)
const chapterId = computed(() => route.params.chapter)
const sectionId = computed(() => route.params.section)

const showSandbox = ref(false)
const showEarth3D = ref(false)
const showSoilProfile = ref(false)
const showAtmo = ref(false)
const showWater = ref(false)
const showDisaster = ref(false)
const showChapter3D = ref(false)
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

const chapter3DRecipe = computed(() => getChapter3DRecipe({
  grade: gradeId.value,
  book: bookId.value,
  chapter: chapterId.value,
  chapterTitle: chapterData.value?.title,
  section: sectionId.value,
  sectionTitle: sectionData.value?.title,
}))
const hasChapter3D = computed(() => Boolean(chapter3DRecipe.value))
const teachingKeyPoints = computed(() =>
  extraContent.value?.keyPoints ||
  sectionData.value?.content?.keyPoints ||
  []
)
const classroomSummary = computed(() => {
  const recipe = chapter3DRecipe.value
  const chapterTitle = chapterData.value?.title || recipe?.title || '本章'
  const sectionTitle = sectionData.value?.title || '本节'
  const nodes = recipe?.nodes?.slice(0, 3).join('、') || teachingKeyPoints.value.slice(0, 3).join('、') || '核心概念、过程机制、区域应用'
  const flows = recipe?.flows?.slice(0, 2).join('、') || '地理过程与人地关系'
  return `本节放在“${chapterTitle}”的知识框架下理解，重点抓住“${sectionTitle}”中的${nodes}，并沿着“条件—过程—结果—应用”的顺序解释${flows}。课堂上先用3D模型建立空间印象，再用思维导图完成知识收束。`
})
const mindMapBranches = computed(() => {
  const recipe = chapter3DRecipe.value
  const fallbackPoints = teachingKeyPoints.value.slice(0, 4)
  return [
    { title: '核心概念', items: recipe?.nodes?.slice(0, 4) || fallbackPoints },
    { title: '过程机制', items: recipe?.flows?.slice(0, 4) || fallbackPoints },
    { title: '空间层次', items: recipe?.layers?.slice(0, 4) || [chapterData.value?.title, sectionData.value?.title].filter(Boolean) },
    { title: '判读迁移', items: recipe?.metrics?.slice(0, 4) || ['读图', '解释', '迁移'] },
  ].filter(branch => branch.items?.length)
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
  showChapter3D.value = false
  loadedContent.value = null

  const [chapter, section, content] = await Promise.all([
    getChapter(gradeId.value, bookId.value, chapterId.value),
    getSection(gradeId.value, bookId.value, chapterId.value, sectionId.value),
    loadSectionContent(gradeId.value, bookId.value, chapterId.value, sectionId.value)
  ])

  chapterData.value = chapter
  sectionData.value = section

  loadedContent.value = content
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

.sandbox-toggle-bar {
  max-width: 1100px;
  margin: 0 auto 10px;
  padding: 0 20px;
  display: flex;
  gap: 2px;
}
.sandbox-toggle {
  border: 1px solid rgba(100, 122, 63, 0.38);
  border-radius: 6px 6px 0 0;
  padding: 6px 16px;
  font-size: 13px;
  background: rgba(246, 250, 228, 0.76);
  color: var(--button-green-ink);
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 1px solid transparent;
  margin-bottom: -1px;
}
.sandbox-toggle.active {
  background: linear-gradient(180deg, rgba(230, 239, 200, 0.98), rgba(203, 219, 157, 0.94));
  border-bottom-color: rgba(230, 239, 200, 0.98);
  color: var(--button-green-ink);
  font-weight: 600;
}
.sandbox-toggle:hover:not(.active) {
  background: rgba(220, 232, 184, 0.76);
}
.sandbox-toggle:not(button) {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}
.chapter3d-toggle-bar {
  align-items: center;
  gap: 6px;
  padding: 0;
}
.chapter3d-hint {
  min-width: 0;
  overflow: hidden;
  color: #7d5a4b;
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-left: 8px;
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
  .chapter3d-toggle-bar {
    flex-wrap: wrap;
  }
  .chapter3d-hint {
    width: 100%;
    padding-left: 0;
  }
}
</style>
