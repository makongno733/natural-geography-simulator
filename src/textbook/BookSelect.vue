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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { grades } from './data/index.js'

const route = useRoute()
const gradeId = computed(() => route.params.grade)
const currentGrade = computed(() => grades.find(g => g.id === gradeId.value))
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.card {
  display: block;
  text-decoration: none;
  border: 1px solid #e2c9b4;
  border-radius: 12px;
  padding: 18px 16px;
  text-align: center;
  background: rgba(255,255,255,0.94);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}
.card:hover {
  transform: translateY(-2px);
  border-color: #b01217;
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #b01217;
  margin-bottom: 4px;
}
.card-desc { font-size: 12px; color: #b85a4d; }
</style>
