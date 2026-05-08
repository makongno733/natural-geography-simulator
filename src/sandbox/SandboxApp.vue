<template>
  <SandboxShell
    :modules="modules" :active-module-id="activeModuleId"
    :params="params" :current-knowledge="currentKnowledge" :state="state"
    @select="onModuleSelect" @update:params="onParamsChange"
    @tool="onTool" @scene-ready="onSceneReady" />
</template>

<script setup>
import { reactive, ref } from 'vue'
import SandboxShell from './SandboxShell.vue'
import { createSceneEngine } from './engine/SceneEngine.js'

const activeModuleId = ref('fluvial')
const currentKnowledge = ref(null)
const sceneEngine = ref(null)

const params = reactive({
  timeline: 0.35, climate: 0.3, uplift: 0.2,
  weatherMode: 'clear', viewMode: 'terrain', activeType: 'consequent'
})
const state = reactive({
  type: '顺应河', stage: '壮年期', weather: '晴', relief: '342m'
})

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

function onModuleSelect(id) { activeModuleId.value = id }
function onParamsChange(p) { Object.assign(params, p) }
function onTool(tool) {
  if (tool === 'resetView') sceneEngine.value?.resetCamera()
  else if (tool === 'toggleSection') {
    params.viewMode = params.viewMode === 'section' ? 'terrain' : 'section'
  } else if (tool === 'autoRotate') sceneEngine.value?.setPreset360()
}
function onSceneReady(hostEl) {
  sceneEngine.value = createSceneEngine(hostEl, {})
  sceneEngine.value.update({ ...params })
}
</script>
