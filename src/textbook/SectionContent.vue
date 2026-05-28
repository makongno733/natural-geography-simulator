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

        <div v-if="sectionData.content.keyPoints.length" class="key-points">
          <h3 class="block-title">核心知识点</h3>
          <ul>
            <li v-for="(pt, i) in sectionData.content.keyPoints" :key="i">{{ pt }}</li>
          </ul>
        </div>

        <div class="body-text">
          <p>{{ sectionData.content.body }}</p>
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { grades, findSection, findChapter } from './data/index.js'

const route = useRoute()
const gradeId = computed(() => route.params.grade)
const bookId = computed(() => route.params.book)
const chapterId = computed(() => route.params.chapter)
const sectionId = computed(() => route.params.section)

const chapterData = computed(() => findChapter(gradeId.value, bookId.value, chapterId.value))
const sectionData = computed(() => findSection(gradeId.value, bookId.value, chapterId.value, sectionId.value))

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
  padding: 16px 20px;
}
.breadcrumb {
  font-size: 13px;
  color: #b85a4d;
  margin-bottom: 16px;
  line-height: 1.6;
}
.breadcrumb a { color: #b01217; text-decoration: none; }
.sep { margin: 0 6px; color: #e2c9b4; }

.content-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
  align-items: start;
}

.sidebar {
  border: 1px solid #e2c9b4;
  border-radius: 10px;
  background: rgba(255,255,255,0.94);
  padding: 14px;
}
.sidebar-title {
  margin: 0 0 10px;
  font-size: 14px;
  color: #b01217;
  font-weight: 700;
}
.section-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.section-list li { margin-bottom: 4px; }
.section-list a {
  display: block;
  padding: 6px 8px;
  text-decoration: none;
  color: #365776;
  font-size: 13px;
  border-radius: 6px;
  transition: background 0.15s;
}
.section-list a:hover { background: #f5ede8; }
.section-list a.active {
  background: #b01217;
  color: #fff;
  font-weight: 600;
}

.content {
  border: 1px solid #e2c9b4;
  border-radius: 10px;
  background: rgba(255,255,255,0.94);
  padding: 20px;
}
.section-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #b01217;
}
.block-title {
  margin: 0 0 8px;
  font-size: 14px;
  color: #b85a4d;
}
.key-points {
  background: #fef7e6;
  border: 1px solid #e2c9b4;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.key-points ul { margin: 0; padding-left: 18px; }
.key-points li { font-size: 14px; line-height: 1.7; color: #333; }
.body-text {
  font-size: 14px;
  line-height: 1.8;
  color: #444;
  margin-bottom: 16px;
}
.reserved-slot {
  border: 2px dashed #e2c9b4;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  margin-bottom: 12px;
}
.slot-label {
  font-size: 12px;
  color: #b85a4d;
}
.section-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2c9b4;
}
.nav-link {
  text-decoration: none;
  color: #b01217;
  font-size: 14px;
  font-weight: 600;
}
.nav-link:hover { text-decoration: underline; }
.not-found { text-align: center; padding: 60px 20px; }
.not-found a { color: #b01217; }

@media (max-width: 720px) {
  .content-layout { grid-template-columns: 1fr; }
}
</style>
