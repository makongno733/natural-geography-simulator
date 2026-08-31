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
          class="related-card"
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
    if (experiment.value.kind === 'tutorial') tutorialSteps.value = module.default?.steps || module.steps || []
    else loadedComponent.value = module.default || module
    status.value = 'ready'
  } catch (error) {
    if (generation === loadGeneration) status.value = 'error'
  }
}

watch(() => route.fullPath, loadExperiment, { immediate: true })
</script>

<style scoped>
.ev-shell { padding: 20px 20px 40px; max-width: 1100px; margin: 0 auto; }
.ev-breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 12px; }
.ev-breadcrumb a { color: var(--muted); text-decoration: none; }
.ev-breadcrumb a:hover { color: var(--red); }
.ev-title { font-size: clamp(22px, 4.5vw, 30px); color: var(--ink); margin: 0 0 20px; }
.ev-source { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; margin: 0 0 18px; padding: 10px 12px; background: rgba(31, 111, 235, 0.08); border-radius: 4px; font-size: 13px; color: var(--ink); }
.ev-source a { color: var(--red); font-weight: 600; }
.ev-concepts, .ev-related, .ev-textbook-links { margin-top: 28px; }
.ev-concepts h4, .ev-related h4, .ev-textbook-links h4 { font-size: 14px; color: var(--muted); margin: 0 0 8px; }
.concept-list, .textbook-link-list { display: flex; flex-wrap: wrap; gap: 6px; }
.textbook-link-list a { font-size: 12px; color: var(--red); }
.concept-tag { font-size: 12px; padding: 2px 8px; border-radius: 3px; background: rgba(31, 111, 235, 0.08); color: var(--red); }
.related-grid { display: flex; gap: 12px; flex-wrap: wrap; }
.related-card { display: flex; flex-direction: column; gap: 4px; padding: 12px 16px; border-radius: var(--radius-card); background: var(--card-bg); border: 1px solid var(--brown-light); text-decoration: none; transition: box-shadow var(--transition); min-width: 180px; flex: 1; }
.related-card:hover { box-shadow: var(--shadow-hover); }
.related-name { font-size: 14px; font-weight: 600; color: var(--ink); }
.related-shared { font-size: 11px; color: var(--muted); }
@media (max-width: 720px) { .ev-shell { padding: 12px 12px 28px; } .ev-breadcrumb { font-size: 11px; } .ev-title { font-size: 20px; } }
</style>
