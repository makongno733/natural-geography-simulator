<template>
  <div class="ev-shell">
    <nav class="ev-breadcrumb">
      <router-link to="/">首页</router-link>
      <span> &gt; </span>
      <router-link to="/experiments">地学实验</router-link>
      <span> &gt; </span>
      <router-link :to="`/experiments/${category}`">{{ categoryLabel }}</router-link>
      <span> &gt; </span>
      <strong>{{ exp?.name || '' }}</strong>
    </nav>
    <h2 class="ev-title">{{ exp?.name || '' }}</h2>

    <!-- 3D experiment: self-contained component -->
    <component :is="expComponent" v-if="expComponent && exp?.type === '3d'" />

    <!-- Tutorial experiment: TutorialTemplate with steps -->
    <TutorialTemplate v-if="exp?.type === 'tutorial'" :steps="tutorialSteps" />

    <section class="ev-concepts" v-if="exp?.concepts?.length">
      <h4>涉及知识点</h4>
      <div class="concept-list">
        <span v-for="c in exp.concepts" :key="c" class="concept-tag">{{ c }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import modules, { categoryLabels } from './modules/index.js'
import TutorialTemplate from './components/TutorialTemplate.vue'

const route = useRoute()
const category = computed(() => route.params.category)
const experimentId = computed(() => route.params.experiment)
const exp = computed(() => modules.find(m => m.category === category.value && m.id === experimentId.value))
const categoryLabel = computed(() => categoryLabels[category.value] || category.value)

const expComponent = ref(null)
const tutorialSteps = ref([])

async function loadContent() {
  expComponent.value = null
  tutorialSteps.value = []
  if (!exp.value) return

  const mod = await exp.value.component()

  if (exp.value.type === '3d') {
    expComponent.value = defineAsyncComponent(() => Promise.resolve(mod.default || mod))
  } else {
    tutorialSteps.value = mod.steps || mod.default?.steps || []
  }
}

watch(() => exp.value?.id, loadContent, { immediate: true })
</script>

<style scoped>
.ev-shell { padding: 20px 20px 40px; max-width: 1100px; margin: 0 auto; }
.ev-breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 12px; }
.ev-breadcrumb a { color: var(--muted); text-decoration: none; }
.ev-breadcrumb a:hover { color: var(--red); }
.ev-title { font-size: clamp(22px, 4.5vw, 30px); color: var(--ink); margin: 0 0 20px; }
.ev-concepts { margin-top: 28px; }
.ev-concepts h4 { font-size: 14px; color: var(--muted); margin: 0 0 8px; }
.concept-list { display: flex; flex-wrap: wrap; gap: 6px; }
.concept-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 3px;
  background: rgba(158, 36, 38, 0.07);
  color: var(--red);
}
</style>
