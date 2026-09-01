<template>
  <div class="exp-home">
    <h1 class="exp-heading">地学实验</h1>
    <p class="exp-lead">选择学科，开始交互式实验</p>
    <div class="exp-grid">
      <router-link v-for="category in categories" :key="category.id" :to="`/experiments/${category.id}`" :class="['exp-card', 'sheen-card', `exp-card-${category.id}`]">
        <div class="exp-card-icon">{{ category.icon }}</div>
        <div class="exp-card-title">{{ category.label }}</div>
        <div class="exp-card-desc">{{ category.desc }}</div>
      </router-link>
    </div>

    <section class="exp-filter" aria-labelledby="textbook-filter-title">
      <h2 id="textbook-filter-title">按教材查找实验</h2>
      <div class="filter-controls">
        <label>学段
          <select v-model="selectedGrade" data-grade-filter>
            <option value="">全部学段</option>
            <option v-for="grade in curriculumGrades" :key="grade.id" :value="grade.id">{{ grade.id }}</option>
          </select>
        </label>
        <label>教材
          <select v-model="selectedBook" data-book-filter :disabled="!selectedGrade">
            <option value="">全部教材</option>
            <option v-for="book in selectedGradeData?.books || []" :key="book.id" :value="book.id">{{ book.id }}</option>
          </select>
        </label>
        <label>章节
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
          <span>{{ experiment.name }}</span>
          <small>{{ experiment.description }}</small>
        </router-link>
        <p v-if="!filteredExperiments.length">当前教材范围暂无关联实验。</p>
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
  { id: 'meteorology', icon: '🌤', label: '气象学实验', desc: '热力环流 · 科里奥利力 · 云与降水' },
  { id: 'hydrology', icon: '💧', label: '水文学实验', desc: '流水地貌 · 地下水 · 水循环' },
  { id: 'geology', icon: '⛏', label: '地质实验', desc: '断层褶皱 · 地层 · 矿物鉴定' },
  { id: 'astronomy', icon: '🔭', label: '天文学实验', desc: '月相 · 四季 · 行星运动' },
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
.exp-home { padding: 40px 20px 34px; }
.exp-heading { text-align: center; font-size: clamp(28px, 6vw, 44px); color: var(--text); margin: 0 0 8px; font-weight: 800; }
.exp-lead { text-align: center; color: var(--muted); font-size: 15px; margin: 0 0 32px; }
.exp-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; max-width: 780px; margin: 0 auto; }
.exp-card { -webkit-backdrop-filter: var(--blur); backdrop-filter: var(--blur); display: flex; flex-direction: column; align-items: center; width: 180px; text-decoration: none; border-radius: 22px; padding: 28px 20px 22px; text-align: center; cursor: pointer; box-shadow: var(--shadow-sm); transition: box-shadow var(--transition), border-color var(--transition); }
.exp-card:hover { box-shadow: var(--shadow-hover); }
.exp-card-meteorology { background: linear-gradient(180deg, #e3f2fd, #d6e9ff); border: 1px solid #90caf9; }
.exp-card-hydrology { background: linear-gradient(180deg, #e0f2f1, #cdeae8); border: 1px solid #80cbc4; }
.exp-card-geology { background: linear-gradient(180deg, #e8edf3, #d3dce6); border: 1px solid #aebfce; }
.exp-card-astronomy { background: linear-gradient(180deg, #ede7f6, #dcd1ef); border: 1px solid #b39ddb; }
.exp-card-icon { font-size: 40px; margin-bottom: 10px; }
.exp-card-title { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.exp-card-desc { font-size: 11px; color: var(--text-muted); line-height: 1.5; }
.exp-card-meteorology .exp-card-title { color: #1565c0; }
.exp-card-hydrology .exp-card-title { color: #00695c; }
.exp-card-geology .exp-card-title { color: #3d5a6e; }
.exp-card-astronomy .exp-card-title { color: #4527a0; }
.exp-filter { -webkit-backdrop-filter: var(--blur); backdrop-filter: var(--blur); max-width: 900px; margin: 42px auto 0; padding: 20px; border: 1px solid var(--border); border-radius: var(--radius-card); background: var(--card-bg); }
.exp-filter h2 { margin: 0 0 16px; font-size: 20px; color: var(--text); }
.filter-controls { display: flex; flex-wrap: wrap; gap: 12px; }
.filter-controls label { display: grid; gap: 4px; font-size: 13px; color: var(--muted); }
.filter-controls select { min-width: 150px; padding: 6px 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--text); }
.experiment-results { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 18px; }
.experiment-result { -webkit-backdrop-filter: var(--blur); backdrop-filter: var(--blur); display: grid; gap: 4px; padding: 12px; border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text); text-decoration: none; background: var(--surface); }
.experiment-result:hover { box-shadow: var(--shadow-hover); border-color: var(--accent); }
.experiment-result small { color: var(--muted); line-height: 1.4; }
@media (max-width: 720px) { .exp-home { padding: 16px 10px 24px; }.exp-heading { font-size: 24px; }.exp-lead { font-size: 13px; margin-bottom: 20px; }.exp-grid { gap: 10px; }.exp-card { width: 140px; padding: 16px 10px 14px; }.exp-card-icon { font-size: 28px; }.exp-card-title { font-size: 16px; }.exp-card-desc { font-size: 10px; } }
</style>
