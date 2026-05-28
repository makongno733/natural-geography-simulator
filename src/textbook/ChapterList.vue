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
        :to="'/' + gradeId + '/' + bookId + '/' + ch.id + '/' + ch.sections[0].id"
        class="card"
      >
        <div class="card-title">{{ ch.id }} {{ ch.title }}</div>
        <div class="card-desc">{{ ch.sections.length }} 节 · {{ ch.sections.map(s => s.title).join('、') }}</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { grades } from './data/index.js'

const route = useRoute()
const gradeId = computed(() => route.params.grade)
const bookId = computed(() => route.params.book)
const currentBook = computed(() => {
  const grade = grades.find(g => g.id === gradeId.value)
  return grade?.books.find(b => b.id === bookId.value)
})
</script>

<style scoped>
.page-shell {
  max-width: 1000px;
  margin: 0 auto;
  padding: 22px 20px 40px;
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
}
.breadcrumb a { color: var(--red); text-decoration: none; }
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
  border: 1px solid var(--brown);
  border-left: 4px solid var(--red);
  border-radius: var(--radius-card);
  padding: 16px;
  background: linear-gradient(90deg, rgba(173, 20, 25, 0.045), rgba(255, 255, 255, 0.96) 18%);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.card:hover {
  transform: translateY(-2px);
  border-color: var(--red);
  box-shadow: var(--shadow-hover);
}
.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--red);
  margin-bottom: 4px;
}
.card-desc { font-size: 12px; color: var(--muted); line-height: 1.6; }
</style>
