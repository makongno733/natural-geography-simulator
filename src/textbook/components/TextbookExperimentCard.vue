<script setup>
import { computed } from 'vue'
import { buildExperimentRoute } from '../../experiments/catalog.js'
import { preloadExperiment } from '../../experiments/preload.js'

const props = defineProps({
  link: { type: Object, default: null },
  textbook: { type: Object, default: () => ({}) },
})

const routeFor = (reference) => reference
  ? buildExperimentRoute({
      experimentId: reference.experimentId,
      presetId: reference.presetId,
      textbook: props.textbook,
    })
  : null

const primaryRoute = computed(() => routeFor(props.link?.primary))
const relatedExperiments = computed(() => (props.link?.related || [])
  .slice(0, 2)
  .map(reference => ({ reference, route: routeFor(reference) }))
  .filter(item => item.route))

function warmPrimary() {
  const experimentId = props.link?.primary?.experimentId
  if (!experimentId) return

  try {
    Promise.resolve(preloadExperiment(experimentId)).catch(() => {})
  } catch {
    // Intent preloading is opportunistic; navigation remains available.
  }
}
</script>

<template>
  <section v-if="link?.primary && primaryRoute" class="experiment-card" aria-labelledby="experiment-card-title">
    <div class="experiment-copy">
      <p class="experiment-eyebrow">配套 3D 实验</p>
      <h3 id="experiment-card-title">{{ link.primary.title }}</h3>
      <p class="experiment-purpose">{{ link.primary.purpose }}</p>
    </div>

    <div class="experiment-actions">
      <router-link
        data-primary-experiment
        class="primary-experiment"
        :to="primaryRoute"
        @pointerenter="warmPrimary"
        @focusin="warmPrimary"
        @touchstart="warmPrimary"
      >
        进入{{ link.primary.title }}
      </router-link>

      <div v-if="relatedExperiments.length" class="related-experiments" aria-label="相关实验">
        <span>相关实验</span>
        <router-link
          v-for="item in relatedExperiments"
          :key="`${item.reference.experimentId}:${item.reference.presetId}`"
          data-related-experiment
          :to="item.route"
        >
          {{ item.reference.title }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.experiment-card {
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(210px, auto);
  gap: 18px;
  align-items: center;
  margin: 0 0 18px;
  padding: 16px 18px 16px 20px;
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

/* 左侧流动彩虹条（Gemini 动态彩虹） */
.experiment-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 999px 0 0 999px;
  background-image: var(--rainbow-fade-v);
  background-size: 300% 300%;
  animation: rainbow-slide 4s ease-in-out infinite;
}
.experiment-copy { min-width: 0; }
.experiment-eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
}
.experiment-copy h3 {
  margin: 0;
  font-size: 19px;
  color: var(--text);
}
.experiment-purpose {
  margin: 8px 0 0;
  line-height: 1.7;
  color: var(--text-muted);
}
.experiment-actions {
  display: grid;
  gap: 10px;
}
.primary-experiment {
  position: relative;
  overflow: hidden;
  display: block;
  border: 1px solid var(--accent-strong);
  border-radius: 999px;
  padding: 10px 16px;
  color: #fff;
  background: var(--gem-flecks), var(--gem);
  box-shadow: var(--gem-glow), var(--gem-inner);
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  transition: background var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.primary-experiment::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 45%;
  background-image: var(--rainbow-sweep);
  transform: translateX(-140%) skewX(-14deg);
  transition: transform 0.55s ease;
  pointer-events: none;
}
.primary-experiment:hover {
  background: var(--gem-flecks), var(--gem-deep);
  border-color: #154aa8;
  box-shadow: 0 6px 20px rgba(31, 111, 235, 0.42), var(--gem-inner);
}
.primary-experiment:hover::after {
  transform: translateX(340%) skewX(-14deg);
}
.primary-experiment:focus-visible,
.related-experiments a:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
}
.related-experiments {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px 9px;
  font-size: 12px;
}
.related-experiments span { color: var(--text-muted); }
.related-experiments a {
  color: var(--button-green-ink);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

@media (max-width: 720px) {
  .experiment-card { grid-template-columns: 1fr; }
}
</style>
