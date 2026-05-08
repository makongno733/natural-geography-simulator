<template>
  <div class="sandbox-shell">
    <ModulePanel
      :modules="modules" :active-module-id="activeModuleId" :params="params"
      @select="(id) => $emit('select', id)"
      @update:params="(p) => $emit('update:params', p)"
      @tool="(t) => $emit('tool', t)" />
    <SceneViewport @scene-ready="(el) => $emit('sceneReady', el)" />
    <InfoPanel
      :knowledge="currentKnowledge" :state="state"
      @import="$emit('import')" @export="$emit('export')" />
  </div>
</template>

<script setup>
import ModulePanel from './ModulePanel.vue'
import SceneViewport from './SceneViewport.vue'
import InfoPanel from './InfoPanel.vue'
defineProps({ modules: Array, activeModuleId: String, params: Object, currentKnowledge: Object, state: Object })
defineEmits(['select','update:params','tool','sceneReady','import','export'])
</script>

<style scoped>
.sandbox-shell {
  display: grid; grid-template-columns: 200px 1fr 240px; gap: 8px;
  padding: 8px; min-height: calc(100vh - 44px);
}
@media (max-width:980px){.sandbox-shell{grid-template-columns:1fr}}
</style>
