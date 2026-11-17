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

    <div class="ev-header-row">
      <h2 class="ev-title">{{ experiment?.name || '地学实验' }}</h2>
      <span v-if="experiment?.kind === '3d'" class="ev-sim-pill">教学仿真，非现场实测</span>
    </div>

    <section v-if="lessonContext" data-textbook-source class="ev-source" aria-label="教材来源与观察重点">
      <div class="ev-source-main">
        <div class="ev-source-top">
          <span class="ev-source-tag">📖 教材来源：{{ lessonContext.grade }} / {{ lessonContext.book }} / {{ lessonContext.chapter }} / {{ lessonContext.section }}</span>
          <span v-if="preset?.title" class="ev-preset-tag">当前预设：{{ preset.title }}</span>
        </div>
        <p class="ev-observe-focus">
          <strong>🎯 本节观察重点：</strong>{{ observationGuide.focus }}
        </p>
      </div>
      <router-link :to="returnTextbookRoute" data-return-textbook class="ev-return-btn">
        ← 返回教材（恢复阅读位置）
      </router-link>
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

    <!-- 简短观察自测与返回教材闭环卡片（检验学生是否真正看懂刚才的 3D 对照） -->
    <section
      v-if="status === 'ready' && observationGuide"
      class="ev-selfcheck-card"
      aria-labelledby="ev-selfcheck-title"
    >
      <div class="sc-head">
        <div>
          <span class="sc-kicker">✅ 10 秒观察自测 · 检验你的解释</span>
          <h3 id="ev-selfcheck-title">{{ observationGuide.checkQuestion }}</h3>
        </div>
        <router-link
          v-if="lessonContext"
          :to="returnTextbookRoute"
          class="sc-return-link"
        >
          ← 带着结论返回《{{ lessonContext.section }}》继续阅读
        </router-link>
      </div>

      <div class="sc-options" role="group" aria-label="观察自测选项">
        <button
          v-for="(opt, idx) in observationGuide.options"
          :key="idx"
          type="button"
          :class="[
            'sc-option-btn',
            {
              'is-selected': selectedAnswerIdx === idx,
              'is-correct': selectedAnswerIdx !== null && opt.correct,
              'is-wrong': selectedAnswerIdx === idx && !opt.correct
            }
          ]"
          @click="selectedAnswerIdx = idx"
        >
          <span class="opt-prefix">{{ idx === 0 ? 'A' : 'B' }}</span>
          <span>{{ opt.text }}</span>
        </button>
      </div>

      <p v-if="selectedAnswerIdx !== null" class="sc-feedback" role="status">
        <strong>{{ observationGuide.options[selectedAnswerIdx]?.correct ? '🎉 判断正确！' : '💡 再对照上方 3D 模型看看：' }}</strong>
        {{ observationGuide.explanation }}
      </p>
    </section>

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

const EXPERIMENT_OBSERVATION_GUIDES = Object.freeze({
  'solar-motion': {
    focus: '固定观测地纬度（如北京 40°N），在「夏至」与「冬至」两个条件间切换，使用「📐 正午子午面正视」观察角读取正午太阳高度角 H（73.4° vs 26.6°）、昼长与正午竿影长度的变化。',
    checkQuestion: '在北纬 40°（如北京）设计住宅楼南北间距时，为保证北楼底层全年正午都能晒到太阳，应按哪一天的正午太阳高度角计算挡光影长？',
    options: [
      { text: '冬至日（正午太阳高度 H = 26.6°，全年最低，正午北向楼影最长）', correct: true },
      { text: '夏至日（正午太阳高度 H = 73.4°，全年最高，正午北向楼影最短）', correct: false }
    ],
    explanation: '北纬 40° 位于北回归线以北，冬至日太阳直射南回归线（-23.4°），当地正午太阳高度角达到全年最小值 26.6°，物体正午影子达到全年最长（2.5m 立竿影长 5.00m）。只要冬至日正午北楼底层不被南楼影子遮挡，全年其余日期正午均可获得日照。'
  },
  seasons: {
    focus: '保持地轴北端始终指向北极星附近（倾角 23.5° 恒定），切换「夏至日」与「冬至日」，观察太阳直射点在南北回归线之间的移动及北极圈极昼/极夜的反转。',
    checkQuestion: '假如黄赤交角从 23.5° 变为 0°（地轴垂直于公转轨道面），地球上还会出现四季更替和昼夜长短变化吗？',
    options: [
      { text: '不会，太阳将终年直射赤道，全球各地终年昼夜平分（各 12 小时）', correct: true },
      { text: '仍然会，因为地球公转轨道存在近日点与远日点距离差异', correct: false }
    ],
    explanation: '地球四季更替与昼夜长短季节变化的根本原因是黄赤交角的存在且地轴空间指向不变；若黄赤交角为 0°，太阳直射点不再南北移动，全球全年昼夜等长、正午太阳高度终年不变。'
  },
  'thermal-circulation': {
    focus: '对比陆地与海洋受热快慢差异（ΔT = 8°C），点击画布右上角切换「☀️ 白昼」与「🌙 夜晚」，观察近地面高低压分布与水平风向（海风 vs 陆风）的反转。',
    checkQuestion: '晴朗夏日白天在海滨活动时，近地面盛行风向通常怎么吹？为什么？',
    options: [
      { text: '吹海风（从海洋吹向陆地），因为白天陆地升温快、空气上升形成近地低压', correct: true },
      { text: '吹陆风（从陆地吹向海洋），因为白天陆地气温高、气压也高', correct: false }
    ],
    explanation: '白天陆地比热容小、升温快，空气受热膨胀上升导致近地面形成低气压（L）；海洋升温慢、空气下沉形成近地面高气压（H），水平气压梯度力驱动近地面气流从海洋（H）吹向陆地（L），形成海风。'
  },
  default: {
    focus: '切换实验中的两个核心对照条件，从正视或俯视关键视角观察三维空间结构与定量读数的同步变化。',
    checkQuestion: '在进行地理实验对照观察时，怎样操作才能准确判断某一个地理要素的作用？',
    options: [
      { text: '控制变量法：保持其他条件不变，每次只切换一个目标条件并并排记录两组结果', correct: true },
      { text: '同时随机改变所有滑块参数，只记录最后一次看到的画面', correct: false }
    ],
    explanation: '单一变量对照是科学实证的基础：固定背景条件、只切换单一自变量，才能建立清晰的因果证据链。'
  }
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
const selectedAnswerIdx = ref(null)
let loadGeneration = 0

const categoryLabel = computed(() => categoryLabels[experiment.value?.category] || experiment.value?.category || '')
const lessonContext = computed(() => {
  const context = Object.fromEntries(['grade', 'book', 'chapter', 'section'].map(key => [key, route.query[key]]))
  return Object.values(context).every(value => typeof value === 'string' && value) && getSectionExperimentLink(context) ? context : null
})
const observationGuide = computed(() => {
  const expId = experiment.value?.id
  return EXPERIMENT_OBSERVATION_GUIDES[expId] || EXPERIMENT_OBSERVATION_GUIDES.default
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
  selectedAnswerIdx.value = null

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
.ev-shell { padding: 18px 20px 48px; max-width: 1140px; margin: 0 auto; }
.ev-breadcrumb { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ev-breadcrumb a { color: var(--geo-ocean); text-decoration: none; font-weight: 500; }
.ev-breadcrumb a:hover { text-decoration: underline; }
.ev-header-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.ev-title { font-size: clamp(22px, 3.6vw, 30px); color: var(--geo-ocean-deep); margin: 0; font-weight: 800; letter-spacing: -0.02em; }
.ev-sim-pill { background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }

.ev-source {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 14px;
  padding: 12px 16px;
  background: var(--surface);
  border: 1.5px solid rgba(2, 132, 199, 0.35);
  border-left: 4px solid var(--geo-ocean);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-xs);
  font-size: 13px;
  color: var(--text);
}
.ev-source-main { flex: 1 1 420px; min-width: 0; }
.ev-source-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
.ev-source-tag { font-weight: 700; color: var(--geo-ocean-deep); }
.ev-preset-tag { font-size: 11.5px; background: var(--bg-soft); border: 1px solid var(--border); padding: 1px 8px; border-radius: 999px; color: var(--text-muted); }
.ev-observe-focus { margin: 0; font-size: 12.5px; color: var(--text-muted); line-height: 1.5; }
.ev-return-btn {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border-radius: 999px;
  background: var(--geo-ocean);
  color: #ffffff !important;
  font-weight: 700;
  font-size: 12.5px;
  text-decoration: none;
  white-space: nowrap;
}
.ev-return-btn:hover { opacity: 0.92; text-decoration: none !important; }

/* 10 秒观察自测卡 */
.ev-selfcheck-card {
  margin-top: 18px;
  padding: 16px 20px;
  border-radius: var(--radius-card);
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 4px solid #10b981;
  box-shadow: var(--shadow-xs);
}
.sc-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.sc-kicker {
  font-size: 11.5px;
  font-weight: 700;
  color: #059669;
}
.sc-head h3 {
  margin: 3px 0 0;
  font-size: 15.5px;
  color: var(--geo-ocean-deep);
  line-height: 1.4;
}
.sc-return-link {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--geo-ocean);
  text-decoration: none;
  padding: 5px 11px;
  border-radius: 999px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
}
.sc-return-link:hover {
  background: var(--geo-ocean-surface);
}
.sc-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 8px;
}
.sc-option-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-soft);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.sc-option-btn.is-correct {
  background: #ecfdf5;
  border-color: #10b981;
  color: #065f46;
}
.sc-option-btn.is-wrong {
  background: #fef2f2;
  border-color: #f87171;
  color: #991b1b;
}
.opt-prefix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 11.5px;
  font-weight: 800;
  flex-shrink: 0;
}
.sc-feedback {
  margin: 10px 0 0;
  padding: 9px 12px;
  border-radius: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  font-size: 12.5px;
  color: #14532d;
  line-height: 1.55;
}

.ev-concepts, .ev-related, .ev-textbook-links { margin-top: 28px; }
.ev-concepts h4, .ev-related h4, .ev-textbook-links h4 { font-size: 14px; font-weight: 700; color: var(--geo-ocean-deep); margin: 0 0 10px; letter-spacing: 0.02em; }
.concept-list, .textbook-link-list { display: flex; flex-wrap: wrap; gap: 8px; }
.textbook-link-list a { font-size: 12.5px; color: var(--geo-ocean); text-decoration: none; font-weight: 600; padding: 4px 10px; border-radius: 999px; background: var(--bg-soft); border: 1px solid var(--border); transition: var(--geo-btn-transition); }
.textbook-link-list a:hover { background: var(--geo-ocean-surface); border-color: var(--geo-ocean); }
.concept-tag { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: var(--radius-pill); background: var(--geo-ocean-surface); color: var(--geo-ocean); border: 1px solid rgba(26,68,108,0.14); }
.related-grid { display: flex; gap: 14px; flex-wrap: wrap; }
.related-card { display: flex; flex-direction: column; gap: 5px; padding: 16px 18px; border-radius: var(--radius-card); background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-xs); text-decoration: none; transition: box-shadow var(--transition), border-color var(--transition), transform var(--transition); min-width: 180px; flex: 1; }
.related-card:hover { box-shadow: var(--shadow-sm); border-color: var(--geo-ocean); transform: var(--geo-btn-elevate); }
.related-name { font-size: 14.5px; font-weight: 700; color: var(--geo-ocean-deep); }
.related-shared { font-size: 11.5px; color: var(--text-muted); }
.ev-shell :deep(.angle-ticks) { color: #94a3b8 !important; font-size: 11px !important; }
@media (max-width: 768px) {
  .ev-shell :deep(:is(.aero-theme, .hydro-theme, .geo-theme, .astro-theme, .sys-theme)) {
    flex-direction: column-reverse !important;
  }
}
@media (max-width: 720px) { .ev-shell { padding: 10px 10px 28px; } .ev-breadcrumb { font-size: 11px; } .ev-title { font-size: 19px; } }
</style>
