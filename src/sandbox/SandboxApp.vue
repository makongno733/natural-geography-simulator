<template>
  <SandboxShell
    :modules="modules" :active-module-id="activeModuleId"
    :params="params" :current-knowledge="currentKnowledge" :state="state"
    :river-types="currentRiverTypes" :active-type="params.activeType"
    :climate-metrics="climateMetrics"
    :evolution-stage="evolutionStage"
    :evolution-stages="evolutionStages"
    :stream-power="streamPower"
    :auto-rotating="autoRotating"
    @select="onModuleSelect" @update:params="onParamsChange"
    @select-type="onSelectType"
    @tool="onTool" @scene-ready="onSceneReady" />
</template>

<script setup>
import { reactive, ref, computed, onBeforeUnmount } from 'vue'
import SandboxShell from './SandboxShell.vue'
import { createSceneEngine } from './engine/SceneEngine.js'
import { registerModule, getModule } from './modules/registry.js'
import { fluvialModule } from './modules/fluvial/index.js'
import { structuralModule } from './modules/structural/index.js'
import { glacialModule } from './modules/glacial/index.js'
import { coastalModule } from './modules/coastal/index.js'
import { aeolianModule } from './modules/aeolian/index.js'
import { karstModule } from './modules/karst/index.js'
import { volcanicModule } from './modules/volcanic/index.js'
import { climateModule } from './modules/climate/index.js'
import { getFluvialEntry } from './modules/fluvial/knowledge.js'

const activeModuleId = ref('fluvial')
const currentKnowledge = ref(null)
const sceneEngine = ref(null)
const autoRotating = ref(false)
const climateMetrics = ref({ years: 0, erosionWeight: 0, cumulativeErosion: '0', divideRetreat: '0' })
const streamPower = ref({ K: 0, A: 0, S: 0, E: 0 })

// Register all modules
const moduleDefs = [fluvialModule, structuralModule, glacialModule, coastalModule,
  aeolianModule, karstModule, volcanicModule, climateModule]
moduleDefs.forEach(m => registerModule(m))

currentKnowledge.value = getFluvialEntry('erosion_cycle')

const params = reactive({
  timeline: 0.35, climate: 0.3, uplift: 0.2,
  weatherMode: 'clear', viewMode: 'terrain', activeType: 'consequent',
  activeModule: 'fluvial'
})
const state = reactive({
  type: '顺应河', stage: '壮年期', weather: '晴', relief: '342m',
  drainageArea: '—', gradient: '—'
})

// Evolution stages mapped from river type order
const evolutionStages = [
  { id: 0, name: '顺应河', desc: '沿初始坡向最早形成，建立主排水方向' },
  { id: 1, name: '后成河', desc: '沿软弱构造带调整扩展，体现岩性控制' },
  { id: 2, name: '偶成河', desc: '逆向坡头蚀推进，分水岭向弱侧迁移' },
  { id: 3, name: '再顺河', desc: '地貌重组后沿新坡向再次顺坡发育' },
  { id: 4, name: '随意河', desc: '与坡向/构造线均斜交，受复合因子控制' },
  { id: 5, name: '先成河', desc: '先成河道后抬升，持续下切维持原流路' },
  { id: 6, name: '叠置河', desc: '上覆地层定型后下切至下伏构造' }
]

const evolutionStage = computed(() => {
  const idx = Math.min(evolutionStages.length - 1,
    Math.floor(params.timeline * evolutionStages.length))
  return { ...evolutionStages[idx], index: idx }
})

const riverTypeOrder = ['consequent', 'subsequent', 'obsequent', 'resequent', 'insequent', 'antecedent', 'superimposed']

// Get current module's river/feature types
const currentRiverTypes = computed(() => {
  const mod = moduleDefs.find(m => m.id === params.activeModule)
  if (mod && mod.getRiverTypes) return mod.getRiverTypes()
  return fluvialModule.getRiverTypes()
})

// All modules (all unlocked now)
const modules = [
  { id: 'fluvial', name: '河流地貌', icon: '🌊', locked: false },
  { id: 'structural', name: '构造地貌', icon: '🏔', locked: false },
  { id: 'glacial', name: '冰川地貌', icon: '❄️', locked: false },
  { id: 'coastal', name: '海岸地貌', icon: '🌊', locked: false },
  { id: 'aeolian', name: '风成地貌', icon: '🌪', locked: false },
  { id: 'karst', name: '岩溶地貌', icon: '🕳', locked: false },
  { id: 'volcanic', name: '火山地貌', icon: '🌋', locked: false },
  { id: 'climate', name: '气候地貌', icon: '🌍', locked: false }
]

import { getStructuralEntry } from './modules/structural/knowledge.js'
import { getGlacialEntry } from './modules/glacial/knowledge.js'
import { getCoastalEntry } from './modules/coastal/knowledge.js'
import { getAeolianEntry } from './modules/aeolian/knowledge.js'
import { getKarstEntry } from './modules/karst/knowledge.js'
import { getVolcanicEntry } from './modules/volcanic/knowledge.js'
import { getClimateEntry } from './modules/climate/knowledge.js'

const knowledgeAccessors = {
  fluvial: getFluvialEntry,
  structural: getStructuralEntry,
  glacial: getGlacialEntry,
  coastal: getCoastalEntry,
  aeolian: getAeolianEntry,
  karst: getKarstEntry,
  volcanic: getVolcanicEntry,
  climate: getClimateEntry
}

function getKnowledgeForType(modId, type) {
  const accessor = knowledgeAccessors[modId]
  if (!accessor) return null
  const entry = accessor(type)
  return entry || null
}

updateState()

function updateState() {
  const riverNames = {
    consequent: '顺应河', subsequent: '后成河', obsequent: '偶成河',
    resequent: '再顺河', insequent: '随意河', antecedent: '先成河', superimposed: '叠置河'
  }
  const stages = ['青年期', '壮年期', '老年期']
  state.type = riverNames[params.activeType] || params.activeType || '—'
  state.stage = stages[Math.min(2, Math.floor(params.timeline * 3))]
  state.weather = { clear: '晴', rain: '雨', snow: '雪', cloud: '阴', fog: '雾' }[params.weatherMode] || '—'
  state.relief = `${(800 - params.timeline * 500).toFixed(0)}m`
  state.drainageArea = `${(120 + params.timeline * 380).toFixed(0)} km²`
  state.gradient = `${(8.2 - params.timeline * 4.6).toFixed(1)}°`
}

function computeStreamPower() {
  const A = 0.3 + params.timeline * 0.6 + params.climate * 0.1
  const S = 0.6 - params.timeline * 0.4 + (1 - params.climate) * 0.1
  const m = 0.5
  const n = 0.8
  const K_base = { clear: 0.3, rain: 1.0, snow: 0.5, cloud: 0.35, fog: 0.4 }
  const K = K_base[params.weatherMode] || 0.3
  const E = K * Math.pow(A, m) * Math.pow(S, n)
  streamPower.value = { K, A: A.toFixed(3), S: S.toFixed(3), E: E.toFixed(5) }
}

function updateClimateMetrics() {
  if (sceneEngine.value?.computeClimateMetrics) {
    climateMetrics.value = sceneEngine.value.computeClimateMetrics()
  }
}

function updateFeatureName() {
  if (sceneEngine.value?.getCurrentFeatureName) {
    const name = sceneEngine.value.getCurrentFeatureName()
    if (name) state.type = name
  }
}

let metricsTimer = null

function startMetricsTimer() {
  stopMetricsTimer()
  metricsTimer = setInterval(() => {
    updateClimateMetrics()
    updateFeatureName()
  }, 2000)
}

function stopMetricsTimer() {
  if (metricsTimer) {
    clearInterval(metricsTimer)
    metricsTimer = null
  }
}

function onSelectType(type) {
  params.activeType = type
  sceneEngine.value?.update({ ...params })
  currentKnowledge.value = getKnowledgeForType(params.activeModule, type)
  updateState()
  computeStreamPower()
  updateClimateMetrics()
}

function onModuleSelect(id) {
  if (id === activeModuleId.value) return
  activeModuleId.value = id
  params.activeModule = id
  // Get first type for this module
  const mod = moduleDefs.find(m => m.id === id)
  const types = mod?.getRiverTypes?.() || []
  const firstType = types[0]?.id || 'consequent'
  params.activeType = firstType
  currentKnowledge.value = getKnowledgeForType(id, firstType)
  sceneEngine.value?.update({ ...params })
  updateState()
  computeStreamPower()
  updateClimateMetrics()
}

function onParamsChange(p) {
  Object.assign(params, p)
  sceneEngine.value?.update({ ...params })
  updateState()
  computeStreamPower()
  updateClimateMetrics()
}

function onTool(tool) {
  if (tool === 'resetView') {
    sceneEngine.value?.resetCamera()
    autoRotating.value = false
  } else if (tool === 'toggleSection') {
    params.viewMode = params.viewMode === 'section' ? 'terrain' : 'section'
    sceneEngine.value?.update({ ...params })
  } else if (tool === 'autoRotate') {
    sceneEngine.value?.setPreset360()
    autoRotating.value = true
  }
}

function onSceneReady(hostEl) {
  sceneEngine.value = createSceneEngine(hostEl, {})
  sceneEngine.value.update({ ...params })
  computeStreamPower()
  updateClimateMetrics()
  startMetricsTimer()
}

onBeforeUnmount(() => {
  stopMetricsTimer()
})
</script>
