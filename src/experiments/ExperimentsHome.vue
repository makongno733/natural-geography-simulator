<template>
  <div class="exp-home">
    <header class="exp-hero">
      <div class="exp-badge">
        <span>🔬 地学探究实验中心</span>
      </div>
      <h1 class="exp-heading">地理数字化实验室</h1>
      <p class="exp-lead">运用物理模型与数值模拟，推演大气、水文、地貌与天体运行的空间动力学规律</p>
    </header>

    <div class="exp-grid">
      <router-link
        v-for="category in categories"
        :key="category.id"
        :to="`/experiments/${category.id}`"
        :class="['exp-card', 'sheen-card', `exp-card-${category.id}`]"
      >
        <div class="exp-card-icon">{{ category.icon }}</div>
        <div class="exp-card-title">{{ category.label }}</div>
        <div class="exp-card-desc">{{ category.desc }}</div>
        <span class="exp-card-enter">进入实验模块 →</span>
      </router-link>
    </div>

    <section class="exp-filter" aria-labelledby="textbook-filter-title">
      <div class="filter-head">
        <h2 id="textbook-filter-title">按教材章节快速定位实验</h2>
        <span class="filter-tip">与课本知识点紧密同步，支持直观课前探究与课后推演</span>
      </div>

      <div class="filter-controls">
        <label>
          <span class="ctrl-label">学段选择</span>
          <select v-model="selectedGrade" data-grade-filter>
            <option value="">全部学段</option>
            <option v-for="grade in curriculumGrades" :key="grade.id" :value="grade.id">{{ grade.id }}</option>
          </select>
        </label>
        <label>
          <span class="ctrl-label">配套教材</span>
          <select v-model="selectedBook" data-book-filter :disabled="!selectedGrade">
            <option value="">全部教材</option>
            <option v-for="book in selectedGradeData?.books || []" :key="book.id" :value="book.id">{{ book.id }}</option>
          </select>
        </label>
        <label>
          <span class="ctrl-label">关联章节</span>
          <select v-model="selectedChapter" data-chapter-filter :disabled="!selectedBook">
            <option value="">全部章节</option>
            <option v-for="chapter in selectedBookData?.chapters || []" :key="chapter.id" :value="chapter.id">{{ chapter.id }}</option>
          </select>
        </label>
      </div>

      <div class="experiment-results" aria-live="polite">
        <router-link
          v-for="experiment in filteredExperiments"
          :key="experiment.id"
          :to="`/experiments/${experiment.category}/${experiment.id}`"
          :data-experiment-result="experiment.id"
          class="experiment-result sheen-card"
        >
          <span class="res-title">{{ experiment.name }}</span>
          <small class="res-desc">{{ experiment.description }}</small>
        </router-link>
        <div v-if="!filteredExperiments.length" class="empty-state">
          <span>当前教材范围暂无直接关联实验，请选择其他章节或上方学科模块浏览。</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { listExperiments } from './catalog.js'
import { getTextbooksForExperiment } from '../textbook/data/experimentLinks.js'
import { grades } from '../textbook/data/index.js'

const categories = [
  { id: 'meteorology', icon: '🌤️', label: '气象与气候学', desc: '热力环流 · 地转偏向力 · 云与降水模拟' },
  { id: 'hydrology', icon: '💧', label: '水文与流水地貌', desc: '河谷冲淤 · 地下水运移 · 自然水循环' },
  { id: 'geology', icon: '⛏️', label: '地质与地表形态', desc: '褶皱断层构造 · 沉积地层 · 矿物鉴定' },
  { id: 'astronomy', icon: '🔭', label: '地球运动与天体', desc: '月相变化 · 四季昼夜交替 · 行星视运动' },
]

const curriculumGrades = grades.filter(grade => grade.id === '初中' || grade.id === '高中')
const selectedGrade = ref('')
const selectedBook = ref('')
const selectedChapter = ref('')
const selectedGradeData = computed(() => curriculumGrades.find(grade => grade.id === selectedGrade.value) || null)
const selectedBookData = computed(() => selectedGradeData.value?.books.find(book => book.id === selectedBook.value) || null)

watch(selectedGrade, () => {
  selectedBook.value = ''
  selectedChapter.value = ''
})
watch(selectedBook, () => {
  selectedChapter.value = ''
})

const filteredExperiments = computed(() => listExperiments().filter(experiment => getTextbooksForExperiment(experiment.id).some(context => (
  (!selectedGrade.value || context.grade === selectedGrade.value)
  && (!selectedBook.value || context.book === selectedBook.value)
  && (!selectedChapter.value || context.chapter === selectedChapter.value)
))))
</script>

<style scoped>
.exp-home {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 20px 48px;
}

.exp-hero {
  text-align: center;
  margin-bottom: 36px;
}

.exp-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: var(--geo-ocean-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--geo-ocean);
  margin-bottom: 12px;
}

.exp-heading {
  font-size: clamp(28px, 5vw, 38px);
  color: var(--geo-ocean-deep);
  margin: 0 0 10px;
  font-weight: 800;
}

.exp-lead {
  max-width: 650px;
  margin: 0 auto;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.6;
}

.exp-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin: 0 auto 44px;
}

.exp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  border-radius: var(--radius-card);
  padding: 26px 18px 20px;
  text-align: center;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid var(--border);
}

.exp-card-meteorology { border-top: 4px solid #1f6feb; }
.exp-card-hydrology { border-top: 4px solid #00897b; }
.exp-card-geology { border-top: 4px solid #8d6e63; }
.exp-card-astronomy { border-top: 4px solid #5c6bc0; }

.exp-card-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.exp-card-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
  margin-bottom: 6px;
}

.exp-card-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
  flex: 1;
  margin-bottom: 16px;
}

.exp-card-enter {
  font-size: 12px;
  font-weight: 600;
  color: var(--geo-ocean);
}

.exp-filter {
  padding: 24px 22px;
  border: 1px solid var(--border);
  border-radius: var(--radius-box);
  background: #ffffff;
  box-shadow: var(--shadow-sm);
}

.filter-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 14px;
}

.filter-head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.filter-tip {
  font-size: 12.5px;
  color: var(--text-muted);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 22px;
}

.filter-controls label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
  flex: 1;
  min-width: 180px;
}

.ctrl-label {
  font-weight: 600;
  color: var(--geo-ocean);
}

.filter-controls select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-soft);
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
}

.filter-controls select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.experiment-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.experiment-result {
  display: grid;
  gap: 6px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  text-decoration: none;
  background: var(--bg-soft);
}

.res-title {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.res-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.45;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13.5px;
  background: var(--bg-soft);
  border-radius: var(--radius-sm);
}

@media (max-width: 900px) {
  .exp-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .exp-home {
    padding: 20px 14px 32px;
  }
  .exp-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .filter-controls {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
