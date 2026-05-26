<template>
  <div class="sandbox-shell">
    <ModulePanel
      :modules="modules" :active-module-id="activeModuleId" :params="params"
      :river-types="riverTypes" :active-type="activeType"
      @select="(id) => $emit('select', id)"
      @update:params="(p) => $emit('update:params', p)"
      @select-type="(t) => $emit('selectType', t)"
      @tool="(t) => $emit('tool', t)" />
    <SceneViewport
      :evolution-stage="evolutionStage"
      :climate-metrics="climateMetrics"
      :auto-rotating="autoRotating"
      @scene-ready="(el) => $emit('sceneReady', el)" />
    <InfoPanel
      :knowledge="currentKnowledge" :state="state"
      :climate-metrics="climateMetrics"
      :stream-power="streamPower"
      :evolution-stage="evolutionStage"
      :evolution-stages="evolutionStages"
      @import="$emit('import')" @export="$emit('export')" />
  </div>
</template>

<script setup>
import ModulePanel from './ModulePanel.vue'
import SceneViewport from './SceneViewport.vue'
import InfoPanel from './InfoPanel.vue'
defineProps({
  modules: Array, activeModuleId: String, params: Object,
  currentKnowledge: Object, state: Object,
  riverTypes: Array, activeType: String,
  climateMetrics: Object, streamPower: Object,
  evolutionStage: Object, evolutionStages: Array,
  autoRotating: Boolean
})
defineEmits(['select','update:params','tool','sceneReady','import','export','selectType'])
</script>
