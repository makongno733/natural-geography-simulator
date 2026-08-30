<template>
  <AsyncChapter3DViewer :recipe="recipe" @close="emit('close')" />
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { getExperimentPreset } from '../../catalog.js'

const props = defineProps({
  preset: { type: Object, default: () => ({}) },
  textbook: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['close'])
const route = useRoute()

const AsyncChapter3DViewer = defineAsyncComponent(() => import('../../../textbook/components/Chapter3DViewer.vue'))

const activePreset = computed(() => props.preset.id
  ? props.preset
  : getExperimentPreset(route.params.experiment, route.query.preset) || {})

const recipe = computed(() => {
  const preset = activePreset.value
  const params = preset.params || {}
  const labels = preset.labels || {}
  return {
    theme: params.theme || 'system',
    terrain: params.terrain || 'network',
    title: preset.title || '地理系统概念网络',
    subtitle: preset.purpose || '核心要素、过程和空间关系',
    nodes: params.nodes || labels.nodes || [],
    flows: params.flows || labels.flows || [],
    layers: params.layers || labels.layers || [],
    metrics: params.metrics || labels.metrics || [],
    grade: props.textbook.grade || '高中',
    book: props.textbook.book || '系统专题',
    chapter: props.textbook.chapter || '概念网络',
    chapterTitle: props.textbook.chapterTitle || preset.title || '地理系统',
    section: props.textbook.section || '',
    sectionTitle: props.textbook.sectionTitle || '',
  }
})
</script>
