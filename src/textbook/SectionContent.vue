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

        <div v-if="extraContent?.keyPoints?.length || sectionData.content.keyPoints.length" class="key-points">
          <h3 class="block-title">核心知识点</h3>
          <ul>
            <li v-for="(pt, i) in (extraContent?.keyPoints || sectionData.content.keyPoints)" :key="i">{{ pt }}</li>
          </ul>
        </div>

        <!-- 大学深度参考（中学章节→大学对应内容） -->
        <div v-if="collegeRef" class="college-link">
          <span class="college-icon">📖</span>
          <router-link :to="'/' + collegeRef.grade + '/' + collegeRef.book + '/' + collegeRef.chapter + '/' + collegeRef.section">
            大学深度参考：{{ collegeRef.chapter }} {{ collegeRef.chapterTitle }} · {{ collegeRef.section }} {{ collegeRef.sectionTitle }}
          </router-link>
        </div>

        <!-- 中学关联（大学章节→中学对应内容） -->
        <div v-if="sectionData.sourceRef" class="college-link">
          <span class="college-icon">📘</span>
          <router-link :to="'/' + sectionData.sourceRef.grade + '/' + sectionData.sourceRef.book + '/' + sectionData.sourceRef.chapter + '/' + sectionData.sourceRef.section">
            关联中学教材：{{ sectionData.sourceRef.grade }} · {{ sectionData.sourceRef.book }} · {{ sectionData.sourceRef.chapter }} · {{ sectionData.sourceRef.section }}
          </router-link>
        </div>

        <div class="body-text">
          <template v-if="extraContent?.body">{{ extraContent.body }}</template>
          <template v-else-if="extraContent?.fullText"><pre class="chapter-text">{{ extraContent.fullText }}</pre></template>
          <p v-else>{{ sectionData.content.body }}</p>
        </div>

        <div class="reserved-slot" v-if="!sectionData.content.interactive">
          <span class="slot-label">3D 互动预留位</span>
        </div>
        <div class="reserved-slot" v-if="!sectionData.content.ppt">
          <span class="slot-label">PPT 课件预留位</span>
        </div>

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
  </div>
  <div v-else class="page-shell not-found">
    <p>未找到该节内容</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { grades, findSection, findChapter, findCollegeRef } from './data/index.js'
import { loadSectionContent } from './data/contentLoader.js'

const route = useRoute()
const gradeId = computed(() => route.params.grade)
const bookId = computed(() => route.params.book)
const chapterId = computed(() => route.params.chapter)
const sectionId = computed(() => route.params.section)

const chapterData = computed(() => findChapter(gradeId.value, bookId.value, chapterId.value))
const sectionData = computed(() => findSection(gradeId.value, bookId.value, chapterId.value, sectionId.value))
const collegeRef = computed(() =>
  gradeId.value !== '大学'
    ? findCollegeRef(gradeId.value, bookId.value, chapterId.value, sectionId.value)
    : null
)

const loadedContent = ref(null)
const contentReady = ref(false)

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
  contentReady.value = false
  loadedContent.value = null
  const content = await loadSectionContent(gradeId.value, bookId.value, chapterId.value, sectionId.value)
  loadedContent.value = content
  contentReady.value = true
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
.block-title {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--muted);
}
.key-points {
  background: linear-gradient(180deg, #fff7e8, #fffdf8);
  border: 1px solid var(--brown);
  border-left: 4px solid var(--red);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  margin-bottom: 16px;
}
.key-points ul { margin: 0; padding-left: 18px; }
.key-points li { font-size: 14px; line-height: 1.7; color: #333; }
.college-link {
  border: 1px solid var(--brown);
  background: #fff9ef;
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 13px;
}
.college-icon { margin-right: 6px; }
.college-link a {
  color: #8b6914;
  text-decoration: none;
  font-weight: 600;
}
.college-link a:hover { text-decoration: underline; }
.body-text {
  font-size: 15px;
  line-height: 1.92;
  color: #2f201d;
  margin-bottom: 16px;
}
.chapter-text {
  font-family: inherit;
  font-size: 15px;
  line-height: 1.92;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  color: #2f201d;
}
.reserved-slot {
  border: 1px dashed var(--brown-dark);
  border-radius: var(--radius-sm);
  padding: 20px;
  text-align: center;
  margin-bottom: 12px;
  background: rgba(255,255,255,0.5);
  transition: background var(--transition);
}
.reserved-slot:hover {
  background: rgba(242,226,210,0.15);
}
.slot-label {
  font-size: 12px;
  color: var(--muted);
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
  color: var(--red);
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border: 1px solid var(--brown);
  border-radius: var(--radius-sm);
  background: #fffaf3;
  transition: background var(--transition), border-color var(--transition);
}
.nav-link:hover {
  background: rgba(183,55,44,0.06);
  border-color: var(--red);
  text-decoration: none;
}
.not-found { text-align: center; padding: 60px 20px; }
.not-found a { color: #b01217; }

@media (max-width: 960px) {
  .content-layout { grid-template-columns: 180px 1fr; gap: 14px; }
}
@media (max-width: 720px) {
  .content-layout { grid-template-columns: 1fr; }
}
</style>
