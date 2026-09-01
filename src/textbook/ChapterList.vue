<template>
  <div class="page-shell">
    <div class="breadcrumb">
      <router-link to="/">首页</router-link>
      <span class="sep">></span>
      <router-link :to="'/' + gradeId">{{ gradeId }}</router-link>
      <span class="sep">></span>
      <span>{{ bookId }}</span>
    </div>
    <div class="card-grid">
      <router-link
        v-for="ch in currentBook.chapters"
        :key="ch.id"
        :to="{ name: 'chapter', params: { grade: gradeId, book: bookId, chapter: ch.id } }"
        class="card sheen-card"
      >
        <div class="card-title">{{ ch.id }} {{ ch.title }}</div>
        <div class="card-desc">{{ ch.sections.length }} 节 · {{ ch.sections.map(s => s.title).join('、') }}</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getBook } from './data/catalogLoader.js'

const route = useRoute()
const gradeId = computed(() => route.params.grade)
const bookId = computed(() => route.params.book)
const currentBook = ref({ chapters: [] })

watch(
  [gradeId, bookId],
  async ([nextGradeId, nextBookId]) => {
    currentBook.value = (await getBook(nextGradeId, nextBookId)) || { chapters: [] }
  },
  { immediate: true }
)
</script>

<style scoped>
.page-shell {
  max-width: 1000px;
  margin: 0 auto;
  padding: 22px 20px 40px;
}
.breadcrumb {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
  padding: 7px 14px;
  background: var(--surface);
  border-radius: var(--radius-pill);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  display: inline-block;
}
.breadcrumb a { color: var(--accent); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }
.sep { margin: 0 8px; color: var(--text-faint); }
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.card {
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  display: block;
  text-decoration: none;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  padding: 16px 16px 16px 18px;
  background: var(--surface);
  cursor: pointer;
  box-shadow: var(--shadow-sm), inset 3px 0 0 var(--accent);
  transition: background var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.card:hover {
  background: var(--accent-softer);
  border-color: var(--accent);
  box-shadow: var(--shadow-hover), inset 3px 0 0 var(--accent);
}
.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}
.card-desc { font-size: 12px; color: var(--text-muted); line-height: 1.6; }
</style>
