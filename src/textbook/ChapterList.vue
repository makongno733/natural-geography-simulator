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
        class="card"
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
  color: var(--button-green-deep);
  margin-bottom: 20px;
  padding: 7px 12px;
  background: rgba(247, 250, 229, 0.84);
  border-radius: var(--radius-sm);
  border: 1px solid var(--brown-light);
  display: inline-block;
}
.breadcrumb a { color: var(--button-green-ink); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }
.sep { margin: 0 8px; color: var(--brown-dark); }
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.card {
  display: block;
  text-decoration: none;
  border: 1px solid rgba(100, 122, 63, 0.36);
  border-left: 4px solid var(--button-green-deep);
  border-radius: var(--radius-card);
  padding: 16px;
  background: linear-gradient(90deg, rgba(198, 216, 150, 0.36), rgba(253, 254, 243, 0.96) 20%);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.card:hover {
  transform: translateY(-2px);
  border-color: rgba(100, 122, 63, 0.7);
  box-shadow: var(--shadow-hover);
}
.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--button-green-ink);
  margin-bottom: 4px;
}
.card-desc { font-size: 12px; color: var(--button-green-deep); line-height: 1.6; }
</style>
