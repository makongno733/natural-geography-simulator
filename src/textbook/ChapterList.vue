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
  padding: 16px 20px;
}
.breadcrumb {
  font-size: 13px;
  color: #b85a4d;
  margin-bottom: 16px;
}
.breadcrumb a { color: #b01217; text-decoration: none; }
.sep { margin: 0 6px; color: #e2c9b4; }
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.card {
  display: block;
  text-decoration: none;
  border: 1px solid #e2c9b4;
  border-radius: 12px;
  padding: 16px;
  background: rgba(255,255,255,0.94);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}
.card:hover {
  transform: translateY(-1px);
  border-color: #b01217;
}
.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #b01217;
  margin-bottom: 4px;
}
.card-desc { font-size: 12px; color: #b85a4d; line-height: 1.6; }
</style>
