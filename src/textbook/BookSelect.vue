<template>
  <div class="page-shell">
    <div class="breadcrumb">
      <router-link to="/">首页</router-link>
      <span class="sep">></span>
      <span>{{ gradeId }}</span>
    </div>
    <div class="card-grid">
      <router-link
        v-for="book in currentGrade.books"
        :key="book.id"
        :to="'/' + gradeId + '/' + book.id"
        class="card"
      >
        <div class="card-title">{{ book.id }}</div>
        <div class="card-desc">{{ book.chapters.length }} 章</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getGrade } from './data/catalogLoader.js'

const route = useRoute()
const gradeId = computed(() => route.params.grade)
const currentGrade = ref({ books: [] })

watch(
  gradeId,
  async (nextGradeId) => {
    currentGrade.value = (await getGrade(nextGradeId)) || { books: [] }
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}
.card {
  display: block;
  text-decoration: none;
  border: 1px solid var(--brown);
  border-radius: var(--radius-card);
  padding: 20px 16px;
  text-align: center;
  background: linear-gradient(180deg, #fff, #fff8f0);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.card:hover {
  transform: translateY(-3px);
  border-color: var(--red);
  box-shadow: var(--shadow-hover);
}
.card-title {
  font-size: 17px;
  font-weight: 700;
  color: #b01217;
  margin-bottom: 4px;
}
.card-desc { font-size: 12px; color: #b85a4d; }
</style>
