<template>
  <div class="page-shell">
    <nav class="breadcrumb" aria-label="路径导航">
      <router-link to="/">首页</router-link>
      <span class="sep">/</span>
      <router-link :to="'/' + gradeId">{{ gradeId }}地理</router-link>
      <span class="sep">/</span>
      <span class="current">{{ bookId }}</span>
    </nav>

    <header class="book-banner">
      <div class="book-badge">
        <span>CHAPTER INDEX / 章节目录</span>
      </div>
      <h1 class="book-title">{{ bookId }} · 课程章节目录</h1>
      <p class="book-desc">
        共 {{ currentBook.chapters.length }} 个学习章节。按顺序研读，或选择感兴趣的主题进入讲义、图表与关联实验。
      </p>
    </header>

    <div class="chapter-list">
      <router-link
        v-for="ch in currentBook.chapters"
        :key="ch.id"
        :to="{ name: 'chapter', params: { grade: gradeId, book: bookId, chapter: ch.id } }"
        class="chapter-item sheen-card"
      >
        <div class="chapter-num-col">
          <span class="chapter-num">{{ ch.id }}</span>
        </div>
        <div class="chapter-main">
          <h2 class="chapter-title">{{ ch.title }}</h2>
          <div class="section-pills">
            <span
              v-for="(s, idx) in ch.sections"
              :key="s.id || idx"
              class="sec-pill"
            >
              {{ s.title }}
            </span>
          </div>
        </div>
        <span class="chapter-enter" aria-hidden="true">开始学习 →</span>
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
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.sep {
  color: var(--text-faint);
}

.current {
  color: var(--geo-ocean-deep);
  font-weight: 600;
}

.book-banner {
  margin-bottom: 32px;
  padding: 32px 0;
  border-top: 2px solid #244739;
  border-bottom: 1px solid var(--border);
}

.book-badge {
  display: inline-flex;
  padding: 0;
  font-size: 11px;
  letter-spacing: .12em;
  font-weight: 600;
  color: var(--geo-ocean);
  margin-bottom: 10px;
}

.book-title {
  margin: 0 0 8px;
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 800;
  color: var(--geo-ocean-deep);
}

.book-desc {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--border);
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 10px;
  background: #ffffff;
  border-bottom: 1px solid var(--border);
  text-decoration: none;
  color: var(--text);
  transition: background .2s ease;
}
.chapter-item:hover { background: #edf3ee; }
.chapter-item:focus-visible { outline: 3px solid #315b4d; outline-offset: -3px; }

.chapter-num-col {
  flex: none;
}

.chapter-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #e4ede6;
  color: var(--geo-ocean);
  border-radius: 0;
  font-size: 15px;
  font-weight: 800;
}

.chapter-main {
  flex: 1;
  min-width: 0;
}

.chapter-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.section-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sec-pill {
  font-size: 12px;
  color: var(--text-muted);
  border-left: 2px solid #adbfaf;
  padding: 1px 8px;
}

.chapter-enter {
  flex: none;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--geo-ocean);
  white-space: nowrap;
}

@media (max-width: 680px) {
  .page-shell {
    padding: 18px 14px 32px;
  }
  .chapter-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }
  .chapter-enter {
    align-self: flex-end;
  }
}
</style>
