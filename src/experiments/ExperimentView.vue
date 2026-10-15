<template>
  <div class="ev-shell">
    <nav class="ev-breadcrumb" aria-label="实验导航">
      <router-link to="/">首页</router-link>
      <span> &gt; </span>
      <router-link to="/experiments">地学实验</router-link>
      <template v-if="experiment">
        <span> &gt; </span>
        <router-link :to="`/experiments/${experiment.category}`">{{ categoryLabel }}</router-link>
        <span> &gt; </span>
        <strong>{{ experiment.name }}</strong>
      </template>
    </nav>

    <h2 class="ev-title">{{ experiment?.name || '地学实验' }}</h2>

    <section v-if="lessonContext" data-textbook-source class="ev-source" aria-label="教材来源">
      <span>教材来源：{{ lessonContext.grade }} / {{ lessonContext.book }} / {{ lessonContext.chapter }} / {{ lessonContext.section }}</span>
      <router-link :to="returnTextbookRoute" data-return-textbook>返回教材</router-link>
    </section>

    <ExperimentLoadState :status="status" @retry="loadExperiment" />

    <component
      :is="loadedComponent"
      v-if="status === 'ready' && experiment?.kind === '3d' && loadedComponent"
      :preset="preset"
      :lesson-context="lessonContext"
    />

    <TutorialTemplate
      v-if="status === 'ready' && experiment?.kind === 'tutorial' && tutorialSteps.length"
      :steps="tutorialSteps"
      :pedagogy="tutorialPedagogy"
      :theme="experiment?.category"
    />

    <section v-if="!lessonContext && relatedTextbooks.length" class="ev-textbook-links" aria-label="关联教材">
      <h4>关联教材</h4>
      <div class="textbook-link-list">
        <router-link
          v-for="context in relatedTextbooks"
          :key="textbookContextKey(context)"
          :to="sectionRoute(context)"
        >
          {{ context.grade }} / {{ context.book }} / {{ context.chapter }} / {{ context.section }}
        </router-link>
      </div>
    </section>

    <section class="ev-concepts" v-if="experiment?.concepts?.length">
      <h4>涉及知识点</h4>
      <div class="concept-list">
        <span v-for="concept in experiment.concepts" :key="concept" class="concept-tag">{{ concept }}</span>
      </div>
    </section>

    <section class="ev-related" v-if="relatedExperiments.length">
      <h4>相关实验</h4>
      <div class="related-grid">
        <router-link
          v-for="related in relatedExperiments"
          :key="related.id"
          :to="`/experiments/${related.category}/${related.id}`"
          class="related-card sheen-card"
        >
          <span class="related-name">{{ related.name }}</span>
          <span class="related-shared">共享 {{ related.sharedCount }} 个知识点</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getExperiment, getExperimentPreset, listExperiments } from './catalog.js'
import TutorialTemplate from './components/TutorialTemplate.vue'
import ExperimentLoadState from './components/ExperimentLoadState.vue'
import { getSectionExperimentLink, getTextbooksForExperiment } from '../textbook/data/experimentLinks.js'

const categoryLabels = Object.freeze({
  meteorology: '气象学实验', hydrology: '水文学实验', geology: '地质实验', astronomy: '天文学实验', systems: '地理系统实验',
})

const props = defineProps({
  webglAvailable: {
    type: Function,
    default: () => {
      if (typeof document === 'undefined') return false
      const canvas = document.createElement('canvas')
      return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    },
  },
})
const route = useRoute()
const status = ref('idle')
const experiment = ref(null)
const preset = ref(null)
const loadedComponent = shallowRef(null)
const tutorialSteps = ref([])
const tutorialPedagogy = ref(null)
let loadGeneration = 0

const categoryLabel = computed(() => categoryLabels[experiment.value?.category] || experiment.value?.category || '')
const lessonContext = computed(() => {
  const context = Object.fromEntries(['grade', 'book', 'chapter', 'section'].map(key => [key, route.query[key]]))
  return Object.values(context).every(value => typeof value === 'string' && value) && getSectionExperimentLink(context) ? context : null
})
const returnTextbookRoute = computed(() => lessonContext.value ? sectionRoute(lessonContext.value) : '/experiments')
const relatedTextbooks = computed(() => experiment.value && !lessonContext.value ? getTextbooksForExperiment(experiment.value.id) : [])
const relatedExperiments = computed(() => {
  if (!experiment.value) return []
  return listExperiments()
    .filter(candidate => candidate.id !== experiment.value.id)
    .map(candidate => ({ ...candidate, sharedCount: candidate.concepts.filter(concept => experiment.value.concepts.includes(concept)).length }))
    .filter(candidate => candidate.sharedCount > 0)
    .sort((left, right) => right.sharedCount - left.sharedCount)
    .slice(0, 4)
})

function sectionRoute(context) {
  return { name: 'section', params: context }
}

function textbookContextKey(context) {
  return [context.grade, context.book, context.chapter, context.section].join('|')
}

async function loadExperiment() {
  const generation = ++loadGeneration
  const candidate = getExperiment(route.params.experiment)
  experiment.value = candidate?.category === route.params.category ? candidate : null
  preset.value = null
  loadedComponent.value = null
  tutorialSteps.value = []

  if (!experiment.value) {
    status.value = 'invalid-experiment'
    return
  }

  const requestedPreset = route.query.preset
  const presetId = requestedPreset === undefined ? experiment.value.presets[0] : requestedPreset
  const resolvedPreset = typeof presetId === 'string' ? getExperimentPreset(experiment.value.id, presetId) : null
  if (!resolvedPreset) {
    status.value = 'invalid-preset'
    return
  }

  preset.value = resolvedPreset
  if (experiment.value.kind === '3d' && !props.webglAvailable()) {
    status.value = 'webgl-unavailable'
    return
  }

  status.value = 'loading'
  try {
    const module = await experiment.value.load()
    if (generation !== loadGeneration) return
    if (experiment.value.kind === 'tutorial') {
      tutorialSteps.value = module.default?.steps || module.steps || []
      tutorialPedagogy.value = module.default?.pedagogy || module.pedagogy || null
    } else {
      loadedComponent.value = module.default || module
    }
    status.value = 'ready'
  } catch (error) {
    if (generation === loadGeneration) status.value = 'error'
  }
}

watch(() => route.fullPath, loadExperiment, { immediate: true })
</script>

<style scoped>
.ev-shell { padding: 24px 20px 48px; max-width: 1100px; margin: 0 auto; }
.ev-breadcrumb { font-size: 13px; color: var(--text-muted); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.ev-breadcrumb a { color: var(--geo-ocean); text-decoration: none; font-weight: 500; }
.ev-breadcrumb a:hover { text-decoration: underline; }
.ev-title { font-size: clamp(24px, 4.5vw, 34px); color: var(--geo-ocean-deep); margin: 0 0 20px; font-weight: 800; letter-spacing: -0.02em; }
.ev-source { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; margin: 0 0 20px; padding: 12px 18px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-card); box-shadow: var(--shadow-xs); font-size: 13.5px; color: var(--text); }
.ev-source a { color: var(--geo-ocean); font-weight: 700; text-decoration: none; }
.ev-source a:hover { text-decoration: underline; }
.ev-concepts, .ev-related, .ev-textbook-links { margin-top: 32px; }
.ev-concepts h4, .ev-related h4, .ev-textbook-links h4 { font-size: 14px; font-weight: 700; color: var(--geo-ocean-deep); margin: 0 0 10px; letter-spacing: 0.02em; }
.concept-list, .textbook-link-list { display: flex; flex-wrap: wrap; gap: 8px; }
.textbook-link-list a { font-size: 12.5px; color: var(--geo-ocean); text-decoration: none; font-weight: 600; padding: 4px 10px; border-radius: var(--radius-pill); background: var(--bg-soft); border: 1px solid var(--border); transition: var(--geo-btn-transition); }
.textbook-link-list a:hover { background: var(--geo-ocean-surface); border-color: var(--geo-ocean); }
.concept-tag { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: var(--radius-pill); background: var(--geo-ocean-surface); color: var(--geo-ocean); border: 1px solid rgba(26,68,108,0.14); }
.related-grid { display: flex; gap: 14px; flex-wrap: wrap; }
.related-card { display: flex; flex-direction: column; gap: 5px; padding: 16px 18px; border-radius: var(--radius-card); background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-xs); text-decoration: none; transition: box-shadow var(--transition), border-color var(--transition), transform var(--transition); min-width: 180px; flex: 1; }
.related-card:hover { box-shadow: var(--shadow-sm); border-color: var(--geo-ocean); transform: var(--geo-btn-elevate); }
.related-name { font-size: 14.5px; font-weight: 700; color: var(--geo-ocean-deep); }
.related-shared { font-size: 11.5px; color: var(--text-muted); }
@media (max-width: 720px) { .ev-shell { padding: 12px 12px 28px; } .ev-breadcrumb { font-size: 11px; } .ev-title { font-size: 20px; } }
</style>
