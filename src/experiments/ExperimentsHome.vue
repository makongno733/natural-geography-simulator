<template>
  <div class="exp-home">
    <header class="exp-hero">
      <div class="exp-badge"><span>观察地理过程</span></div>
      <h1 class="exp-heading">让地球动起来。</h1>
      <p class="exp-lead">直接打开一个三维模型，拖动、观察，再回到教材解释看到的现象。</p>
      <router-link to="/geo-labs" class="evidence-entry">从真实地球数据进入全部模型 →</router-link>
    </header>

    <section class="quick-models" aria-labelledby="practice-link-title">
      <div class="quick-models-heading">
        <h2 id="practice-link-title">从模型走向练习</h2>
        <p>太阳高度 · 昼夜长短 · 经纬网定位 · 国家知识卡</p>
      </div>
      <router-link class="quick-model" to="/practice"><span class="quick-model-topic">初高中地理</span><strong>打开互动练习</strong><span aria-hidden="true">↗</span></router-link>
    </section>

    <section class="quick-models" aria-labelledby="quick-models-title">
      <div class="quick-models-heading">
        <h2 id="quick-models-title">从这里开始</h2>
        <p>一次点击，进入模型</p>
      </div>
      <div class="quick-model-list">
        <router-link v-for="model in quickModels" :key="model.to" :to="model.to" class="quick-model">
          <span class="quick-model-topic">{{ model.topic }}</span>
          <strong>{{ model.name }}</strong>
          <span aria-hidden="true">↗</span>
        </router-link>
      </div>
    </section>

    <h2 class="exp-categories-title">按主题继续探索</h2>
    <div class="exp-grid">
      <router-link
        v-for="(category, index) in categories"
        :key="category.id"
        :to="`/experiments/${category.id}`"
        :class="['exp-card', `exp-card-${category.id}`]"
      >
        <div class="exp-card-icon">{{ String(index + 1).padStart(2, '0') }} / {{ category.en }}</div>
        <h2 class="exp-card-title">{{ category.label }}</h2>
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
          class="experiment-result"
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
  { id: 'meteorology', en: 'ATMOSPHERE', label: '气象与气候学', desc: '热力环流 · 地转偏向力 · 云与降水模拟' },
  { id: 'hydrology', en: 'WATER', label: '水文与流水地貌', desc: '河谷冲淤 · 地下水运移 · 自然水循环' },
  { id: 'geology', en: 'LANDFORMS', label: '地质与地表形态', desc: '褶皱断层构造 · 沉积地层 · 矿物鉴定' },
  { id: 'astronomy', en: 'SPACE', label: '地球运动与天体', desc: '月相变化 · 四季昼夜交替 · 行星视运动' },
]
const quickModels = [
  { topic: '地球结构', name: '地球内部圈层', to: '/earth3d' },
  { topic: '水与地貌', name: '水循环三维演示', to: '/experiments/systems/water-cycle-3d' },
  { topic: '地表变化', name: '地貌沙盘', to: '/experiments/systems/landform-sandbox' },
  { topic: '天体运动', name: '月相变化', to: '/experiments/astronomy/moon-phases' },
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
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.exp-hero {
  text-align: left;
  margin-bottom: 34px;
  padding: 34px 0 40px;
  border-top: 2px solid #244739;
  border-bottom: 1px solid var(--border);
}

.exp-badge {
  display: inline-flex;
  align-items: center;
  padding: 0;
  font-size: 11px;
  font-weight: 600;
  color: #587365;
  letter-spacing: .14em;
  margin-bottom: 18px;
}

.exp-heading {
  font-size: clamp(38px, 5vw, 64px);
  color: var(--geo-ocean-deep);
  margin: 0 0 10px;
  font-weight: 800;
}

.exp-lead {
  max-width: 650px;
  margin: 0;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.6;
}
.evidence-entry{display:inline-block;margin-top:18px;color:#176a78;font-weight:700;text-underline-offset:4px}
.quick-models { margin:0 0 58px; padding:28px; color:#f1f3eb; background:#15352f; }
.quick-models-heading { display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:18px; }
.quick-models-heading h2 { margin:0; color:inherit; font-size:clamp(25px,3vw,36px); }
.quick-models-heading p { margin:0; color:#b9d1c5; font-size:13px; }
.quick-model-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:#628177; }
.quick-model { display:grid; grid-template-columns:1fr auto; gap:5px 10px; min-height:105px; padding:20px; color:#f3f4ee; background:#23453b; text-decoration:none; }
.quick-model:hover { background:#376150; }
.quick-model:focus-visible { outline:3px solid white; outline-offset:-4px; }
.quick-model-topic { grid-column:1/-1; color:#b8cfbd; font-size:12px; }
.quick-model strong { font-size:20px; }
.exp-categories-title { margin:0 0 18px; color:#1b3933; font-size:24px; }

.exp-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0 auto 64px;
}

.exp-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-decoration: none;
  padding: 28px 30px;
  min-height: 232px;
  text-align: left;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform .2s ease, border-color .2s ease;
}
.exp-card:hover { transform: translateY(-2px); border-color: #718f83; }
.exp-card:focus-visible, .experiment-result:focus-visible { outline: 3px solid #244739; outline-offset: 3px; }

.exp-card-meteorology { background:#dce9e9; }
.exp-card-hydrology { background:#d8e7e2; }
.exp-card-geology { background:#e8e3d5; }
.exp-card-astronomy { background:#dbe1e8; }

.exp-card-icon {
  font: 700 11px ui-monospace, monospace;
  letter-spacing: .1em;
  color: #45645c;
  margin-bottom: 34px;
}

.exp-card-title {
  font-size: clamp(20px, 2.6vw, 29px);
  font-weight: 700;
  color: var(--geo-ocean-deep);
  margin: 0 0 8px;
}

.exp-card-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
  flex: 1;
  margin-bottom: 16px;
}

.exp-card-enter {
  font-size: 13px;
  font-weight: 700;
  color: var(--geo-ocean);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.exp-filter {
  padding: 36px 0;
  border-top: 2px solid var(--geo-ocean);
}

.filter-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}

.filter-head h2 {
  margin: 0;
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 800;
  color: var(--geo-ocean-deep);
  letter-spacing: -0.02em;
}

.filter-tip {
  font-size: 13px;
  color: var(--text-muted);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
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
  font-weight: 700;
  color: var(--geo-ocean);
  font-size: 12.5px;
  letter-spacing: 0.04em;
}

.filter-controls select {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  box-sizing: border-box;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.filter-controls select:focus-visible {
  outline: none;
  border-color: var(--geo-ocean);
  box-shadow: var(--geo-focus-ring);
}

.filter-controls select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-soft);
}

.experiment-results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 24px;
}

.experiment-result {
  display: grid;
  gap: 6px;
  padding: 16px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  color: var(--text);
  text-decoration: none;
  background: var(--surface);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--transition), transform var(--transition), box-shadow var(--transition);
}
.experiment-result:hover {
  background: #ffffff;
  border-color: var(--geo-ocean);
  transform: var(--geo-btn-elevate);
  box-shadow: var(--shadow-sm);
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
  .experiment-results { grid-template-columns:1fr; }
}

@media (max-width: 600px) {
  .quick-models { padding:20px; }
  .quick-model-list { grid-template-columns:1fr; }
  .exp-home {
    padding: 20px 14px 32px;
  }
  .exp-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .exp-card { min-height:195px; }
  .filter-controls {
    flex-direction: column;
    gap: 12px;
  }
}
@media (prefers-reduced-motion: reduce) { .exp-card { transition:none; } }
</style>
