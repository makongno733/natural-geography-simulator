<template>
  <main class="exp-home">
    <header class="exp-home-header">
      <p class="exp-kicker">地理实验室</p>
      <h1 class="exp-heading">实验资源中心</h1>
      <p class="exp-lead">按教材、学科和实验形式定位可直接使用的课堂资源。</p>
    </header>

    <ExperimentFilters
      v-model="filters"
      :options="options"
      :category-labels="categoryLabels"
    />

    <section class="exp-results" aria-label="实验结果">
      <div class="exp-results-summary" aria-live="polite">
        <strong>{{ results.length }} 个实验</strong>
        <span>匹配当前筛选条件</span>
      </div>

      <div v-if="results.length" class="exp-grid">
        <router-link
          v-for="experiment in results"
          :key="experiment.id"
          :to="`/experiments/${experiment.category}/${experiment.id}`"
          :class="['experiment-card', `experiment-card-${experiment.category}`]"
          data-testid="experiment-card"
        >
          <div class="experiment-card-meta">
            <span class="experiment-category">{{ categoryLabels[experiment.category] }}</span>
            <span class="experiment-type">{{ typeLabel(experiment.type) }}</span>
          </div>
          <h2>{{ displayName(experiment) }}</h2>
          <p class="experiment-description">{{ experiment.description }}</p>
          <ul class="experiment-concepts" aria-label="核心概念">
            <li v-for="concept in experiment.concepts" :key="concept">{{ concept }}</li>
          </ul>
          <ul
            v-if="filters.grade || filters.book"
            class="experiment-curriculum"
            aria-label="匹配教材"
          >
            <li
              v-for="reference in matchingRefs(experiment.id).slice(0, 2)"
              :key="`${reference.grade}-${reference.book}-${reference.chapter}-${reference.section}`"
            >
              {{ reference.grade }} {{ reference.book }} {{ reference.chapter }} {{ reference.section }}
            </li>
          </ul>
        </router-link>
      </div>

      <div v-else class="experiment-empty" data-testid="experiment-empty">
        <strong>没有找到匹配的实验</strong>
        <span>调整搜索词或清除筛选后再试。</span>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { categoryLabels } from './modules/index.js'
import ExperimentFilters from './components/ExperimentFilters.vue'
import {
  filterExperiments,
  getCurriculumRefsForExperiment,
  getExperimentFilterOptions,
} from './data/curriculumLinks.js'

const filters = ref({ search: '', grade: '', book: '', category: '', type: '' })
const options = getExperimentFilterOptions()
const results = computed(() => filterExperiments(filters.value))

function matchingRefs(experimentId) {
  return getCurriculumRefsForExperiment(experimentId).filter((reference) =>
    (!filters.value.grade || reference.grade === filters.value.grade)
      && (!filters.value.book || reference.book === filters.value.book)
  )
}

function typeLabel(type) {
  return type === '3d' ? '3D 交互' : '图文教程'
}

function displayName(experiment) {
  return experiment.id === 'moon-phases'
    ? '月相模拟实验（月相变化演示）'
    : experiment.name
}
</script>

<style scoped>
.exp-home {
  max-width: 1120px;
  margin: 0 auto;
  padding: 34px 20px 48px;
}

.exp-home-header {
  display: grid;
  gap: 8px;
  margin-bottom: 28px;
}

.exp-kicker {
  margin: 0;
  color: var(--red);
  font-size: 13px;
  font-weight: 700;
}

.exp-heading {
  margin: 0;
  color: var(--ink);
  font-size: 30px;
  font-family: "Ma Shan Zheng", "STXingkai", "Kaiti SC", serif;
}

.exp-lead {
  max-width: 600px;
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.6;
}

.exp-results {
  margin-top: 28px;
}

.exp-results-summary {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}

.exp-results-summary strong {
  color: var(--ink);
  font-size: 16px;
}

.exp-results-summary span {
  color: var(--muted);
  font-size: 13px;
}

.exp-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.experiment-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 18px;
  color: var(--ink);
  text-decoration: none;
  background: var(--paper);
  border: 1px solid var(--brown-light);
  border-left: 4px solid var(--brown);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
}

.experiment-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.experiment-card:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 3px;
}

.experiment-card-meteorology { border-left-color: #4c8fc1; }
.experiment-card-hydrology { border-left-color: #23877b; }
.experiment-card-geology { border-left-color: #9a7256; }
.experiment-card-astronomy { border-left-color: #7660a8; }

.experiment-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 10px;
}

.experiment-category,
.experiment-type,
.experiment-concepts li,
.experiment-curriculum li {
  overflow-wrap: anywhere;
}

.experiment-category,
.experiment-type {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  line-height: 1.35;
}

.experiment-category {
  color: var(--ink);
  background: var(--paper-strong);
}

.experiment-type {
  color: var(--red);
  border: 1px solid rgba(158, 36, 38, 0.28);
}

.experiment-card h2 {
  margin: 0;
  color: var(--ink);
  font-size: 18px;
  line-height: 1.35;
}

.experiment-description {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.65;
}

.experiment-concepts,
.experiment-curriculum {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0;
  margin: 14px 0 0;
  list-style: none;
}

.experiment-concepts li {
  padding: 3px 7px;
  color: var(--ink);
  background: rgba(213, 195, 156, 0.24);
  border-radius: var(--radius-sm);
  font-size: 12px;
  line-height: 1.35;
}

.experiment-curriculum {
  padding-top: 12px;
  border-top: 1px solid var(--brown-light);
}

.experiment-curriculum li {
  width: 100%;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}

.experiment-empty {
  display: grid;
  gap: 6px;
  padding: 28px 0;
  color: var(--muted);
  border-top: 1px solid var(--brown-light);
  border-bottom: 1px solid var(--brown-light);
}

.experiment-empty strong {
  color: var(--ink);
  font-size: 16px;
}

.experiment-empty span {
  font-size: 14px;
}

@media (max-width: 759px) {
  .exp-home {
    padding: 24px 14px 36px;
  }

  .exp-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
