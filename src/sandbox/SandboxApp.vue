<template>
  <SandboxShell
    :modules="modules" :active-module-id="activeModuleId"
    :params="params" :current-knowledge="currentKnowledge" :state="state"
    :river-types="fluvialModule.getRiverTypes()" :active-type="params.activeType"
    @select="onModuleSelect" @update:params="onParamsChange"
    @select-type="onSelectType"
    @tool="onTool" @scene-ready="onSceneReady" />
</template>

<script setup>
import { reactive, ref } from 'vue'
import SandboxShell from './SandboxShell.vue'
import { createSceneEngine } from './engine/SceneEngine.js'
import { registerModule, getModule } from './modules/registry.js'
import { fluvialModule } from './modules/fluvial/index.js'
import { getFluvialEntry } from './modules/fluvial/knowledge.js'

const activeModuleId = ref('fluvial')
const currentKnowledge = ref(null)
const sceneEngine = ref(null)
registerModule(fluvialModule)
currentKnowledge.value = getFluvialEntry('erosion_cycle')

const params = reactive({
  timeline: 0.35, climate: 0.3, uplift: 0.2,
  weatherMode: 'clear', viewMode: 'terrain', activeType: 'consequent'
})
const state = reactive({
  type: '顺应河', stage: '壮年期', weather: '晴', relief: '342m'
})

updateState()

function updateState() {
  const riverNames = {
    consequent: '顺应河', subsequent: '后成河', obsequent: '偶成河',
    resequent: '再顺河', insequent: '随意河', antecedent: '先成河', superimposed: '叠置河'
  }
  const stages = ['青年期', '壮年期', '老年期']
  state.type = riverNames[params.activeType] || '—'
  state.stage = stages[Math.min(2, Math.floor(params.timeline * 3))]
  state.weather = { clear: '晴', rain: '雨', snow: '雪', cloud: '阴', fog: '雾' }[params.weatherMode] || '—'
  state.relief = `${(800 - params.timeline * 500).toFixed(0)}m`
}

function onSelectType(type) {
  params.activeType = type
  sceneEngine.value?.update({ ...params })
  currentKnowledge.value = getFluvialEntry(type)
  updateState()
}

const modules = [
  { id: 'fluvial', name: '河流地貌', icon: '🌊', locked: false },
  { id: 'structural', name: '构造地貌', icon: '🏔', locked: true },
  { id: 'glacial', name: '冰川地貌', icon: '❄️', locked: true },
  { id: 'coastal', name: '海岸地貌', icon: '🌊', locked: true },
  { id: 'aeolian', name: '风成地貌', icon: '🌪', locked: true },
  { id: 'karst', name: '岩溶地貌', icon: '🕳', locked: true },
  { id: 'volcanic', name: '火山地貌', icon: '🌋', locked: true },
  { id: 'climate', name: '气候地貌', icon: '🌍', locked: true }
]

function onModuleSelect(id) {
  activeModuleId.value = id
  const mod = getModule(id)
  if (mod && id === 'fluvial') mod.onActivate(sceneEngine.value)
}
function onParamsChange(p) {
  Object.assign(params, p)
  sceneEngine.value?.update({ ...params })
  updateState()
}
function onTool(tool) {
  if (tool === 'resetView') sceneEngine.value?.resetCamera()
  else if (tool === 'toggleSection') {
    params.viewMode = params.viewMode === 'section' ? 'terrain' : 'section'
    sceneEngine.value?.update({ ...params })
  } else if (tool === 'autoRotate') sceneEngine.value?.setPreset360()
}
function onSceneReady(hostEl) {
  sceneEngine.value = createSceneEngine(hostEl, {})
  sceneEngine.value.update({ ...params })
}
</script>
