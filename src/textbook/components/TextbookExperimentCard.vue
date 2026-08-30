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
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(210px, auto);
  gap: 18px;
  align-items: center;
  margin: 0 0 18px;
  padding: 18px;
  border: 1px solid rgba(100, 122, 63, 0.34);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(250, 253, 235, 0.98), rgba(226, 237, 195, 0.9)),
    radial-gradient(circle at 0 0, rgba(183, 55, 44, 0.08), transparent 38%);
  box-shadow: var(--shadow-sm);
}
.experiment-copy { min-width: 0; }
.experiment-eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--red);
}
.experiment-copy h3 {
  margin: 0;
  font-size: 19px;
  color: #3f502a;
}
.experiment-purpose {
  margin: 8px 0 0;
  line-height: 1.7;
  color: #4f4438;
}
.experiment-actions {
  display: grid;
  gap: 10px;
}
.primary-experiment {
  display: block;
  border-radius: 999px;
  padding: 11px 16px;
  color: #fff;
  background: linear-gradient(135deg, #7f9850, #536936);
  font-size: 14px;
  font-weight: 800;
  text-align: center;
  text-decoration: none;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), box-shadow var(--transition);
}
.primary-experiment:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
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
.related-experiments span { color: #746756; }
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
