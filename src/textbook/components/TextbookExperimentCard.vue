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

const relatedInquiry = computed(() => {
  const expId = props.link?.primary?.experimentId
  if (['infiltration', 'water-cycle-3d', 'disaster-sandbox', 'stream-table', 'soil-erosion'].includes(expId)) {
    return { id: 'urban-flood', title: '城市为什么会“看海”？' }
  }
  if (['map-projection', 'geologic-time', 'stratigraphy'].includes(expId)) {
    return { id: 'landscape-variation', title: '同一地点为什么呈现不同景观？' }
  }
  if (['human-environment', 'spatial-network'].includes(expId)) {
    return { id: 'human-environment-decision', title: '重工业搬迁与生态红线决策' }
  }
  return null
})

const OBSERVATION_QUESTIONS = Object.freeze({
  'solar-motion': '同一地点（如北京 40°N），切换夏至与冬至，观察正午太阳高度角 H（73.4° vs 26.6°）、日出日落方位与正午竿影长度如何变化？',
  seasons: '地球绕日公转时地轴空间指向保持不变，切换夏至与冬至，太阳直射点纬度和晨昏线倾角发生了什么变化？',
  'thermal-circulation': '同在海边，切换白昼与夜晚，近地面高低压与水平风向（海风 vs 陆风）为什么会发生反转？',
  'water-cycle-3d': '保持降雨强度不变，切换硬化地面与植被下垫面，地表径流与地下下渗比例会发生怎样的消长？',
  'fault-model': '水平挤压与水平拉张分别会形成逆断层（地垒/断块山）还是正断层（地堑/裂谷）？'
})

const drivingQuestion = computed(() => {
  const expId = props.link?.primary?.experimentId
  return OBSERVATION_QUESTIONS[expId] || '进入 3D 实验室切换关键条件，观察空间结构与关键读数的同步变化。'
})

function saveScrollBeforeEnter() {
  try {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const tb = props.textbook || {}
      const key = [tb.grade, tb.book, tb.chapter, tb.section].filter(Boolean).join('|')
      sessionStorage.setItem('geo_textbook_return_state', JSON.stringify({
        key,
        scrollY: Math.round(window.scrollY || 0),
        ts: Date.now()
      }))
    }
  } catch {}
}

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
      <p class="experiment-eyebrow">配套 3D 实验 · 带着问题去观察</p>
      <h3 id="experiment-card-title">{{ link.primary.title }}</h3>
      <p class="experiment-purpose">{{ link.primary.purpose }}</p>
      <p class="experiment-driving-q">
        <strong>🎯 进场观察问题：</strong>{{ drivingQuestion }}
      </p>
    </div>

    <div class="experiment-actions">
      <router-link
        data-primary-experiment
        class="primary-experiment"
        :to="primaryRoute"
        @click="saveScrollBeforeEnter"
        @pointerenter="warmPrimary"
        @focusin="warmPrimary"
        @touchstart="warmPrimary"
      >
        进入{{ link.primary.title }}
      </router-link>

      <router-link
        v-if="relatedInquiry"
        class="inquiry-hub-link"
        :to="`/inquiry?task=${relatedInquiry.id}`"
        @click="saveScrollBeforeEnter"
      >
        🌟 探究中心：{{ relatedInquiry.title }} ➔
      </router-link>

      <div v-if="relatedExperiments.length" class="related-experiments" aria-label="相关实验">
        <span>相关实验</span>
        <router-link
          v-for="item in relatedExperiments"
          :key="`${item.reference.experimentId}:${item.reference.presetId}`"
          data-related-experiment
          :to="item.route"
          @click="saveScrollBeforeEnter"
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
.experiment-driving-q {
  margin: 8px 0 0;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(2, 132, 199, 0.08);
  border-left: 3px solid var(--geo-ocean, #0284c7);
  font-size: 13px;
  line-height: 1.5;
  color: var(--geo-ocean-deep, #0c4a6e);
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
  outline: none;
  box-shadow: var(--geo-focus-ring);
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
  color: var(--geo-ocean);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.inquiry-hub-link {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #0369a1;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 999px;
  padding: 4px 10px;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s;
}
.inquiry-hub-link:hover {
  background: #e0f2fe;
  color: #0284c7;
}

@media (max-width: 720px) {
  .experiment-card { grid-template-columns: 1fr; }
}
</style>
