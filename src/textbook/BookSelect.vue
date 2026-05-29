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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}
.card {
  display: block;
  text-decoration: none;
  border: 1px solid rgba(100, 122, 63, 0.38);
  border-radius: var(--radius-card);
  padding: 20px 16px;
  text-align: center;
  background: linear-gradient(180deg, rgba(250, 253, 235, 0.98), rgba(223, 234, 190, 0.88));
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.card:hover {
  transform: translateY(-3px);
  border-color: rgba(100, 122, 63, 0.72);
  box-shadow: var(--shadow-hover);
}
.card-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--button-green-ink);
  margin-bottom: 4px;
}
.card-desc { font-size: 12px; color: var(--button-green-deep); }
</style>
