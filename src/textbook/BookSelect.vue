<template>
  <div class="page-shell">
    <nav class="breadcrumb" aria-label="路径导航">
      <router-link to="/">首页</router-link>
      <span class="sep">/</span>
      <span class="current">{{ gradeId }}地理课程</span>
    </nav>

    <header class="grade-banner">
      <div class="grade-badge">
        <span>COURSE INDEX / 课程目录</span>
      </div>
      <h1 class="grade-title">{{ gradeId }}地理教材目录</h1>
      <p class="grade-desc">
        选择分册，沿章节顺序学习地理知识，并在相关章节进入图表、案例与地理实验。
      </p>
    </header>

    <div class="card-grid">
      <router-link
        v-for="(book, index) in currentGrade.books"
        :key="book.id"
        :to="'/' + gradeId + '/' + book.id"
        class="card sheen-card"
      >
        <div class="card-spine" aria-hidden="true"></div>
        <div class="card-content">
          <div class="card-tag">{{ gradeId }} / {{ String(index + 1).padStart(2, '0') }}</div>
          <h2 class="card-title">{{ book.id }}</h2>
          <div class="card-meta">
            <span class="meta-item">共 {{ book.chapters.length }} 个教学章节</span>
          </div>
          <div class="card-link">
            <span>浏览目录与章节学习 →</span>
          </div>
        </div>
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
  max-width: 1040px;
  margin: 0 auto;
  padding: 30px 20px 50px;
}

.breadcrumb {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb a {
  color: var(--geo-ocean);
  text-decoration: none;
  font-weight: 500;
  padding: 3px 6px;
  margin: -3px -6px;
  border-radius: 5px;
  transition: color .18s ease, background .18s ease;
}

.breadcrumb a:hover {
  color: var(--geo-ocean-deep);
  background: var(--geo-ocean-surface);
}

.sep {
  color: var(--text-faint);
}

.current {
  color: var(--geo-ocean-deep);
  font-weight: 600;
}

.grade-banner {
  margin-bottom: 36px;
  padding: 32px 0 24px;
  border-top: 2px solid var(--geo-ocean);
  border-bottom: 1px solid var(--border);
}

.grade-badge {
  display: inline-flex;
  padding: 0;
  font-size: 11px;
  letter-spacing: .14em;
  font-weight: 700;
  color: var(--geo-ocean);
  margin-bottom: 10px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}

.grade-title {
  margin: 0 0 10px;
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 800;
  color: var(--geo-ocean-deep);
  letter-spacing: -0.025em;
}

.grade-desc {
  margin: 0;
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 680px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.card {
  display: flex;
  position: relative;
  text-decoration: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: border-color .2s ease, transform .2s var(--geo-flow-ease), box-shadow .2s;
}
.card:hover {
  border-color: var(--geo-ocean);
  transform: var(--geo-btn-elevate);
  box-shadow: var(--shadow-md);
}
.card:focus-visible {
  outline: 3px solid var(--geo-ocean);
  outline-offset: 3px;
}

.card-spine {
  width: 4px;
  background: linear-gradient(180deg, var(--geo-ocean) 0%, var(--geo-ocean-medium) 100%);
  flex: none;
}

.card-content {
  padding: 24px 22px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-tag {
  font-size: 11.5px;
  color: var(--geo-ocean);
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}

.card-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
  margin: 0 0 10px;
}

.card-meta {
  font-size: 13.5px;
  color: var(--text-muted);
  margin-bottom: 18px;
}

.card-link {
  margin-top: auto;
  font-size: 13px;
  font-weight: 700;
  color: var(--geo-ocean);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 600px) {
  .page-shell {
    padding: 18px 14px 32px;
  }
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
