<template>
  <div ref="sceneContainer" class="scene-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { SoilProfileScene } from './soilScene.js'

const props = defineProps({
  mode: { type: String, default: 'simple' }
})
const emit = defineEmits(['layerClick'])

const sceneContainer = ref(null)
let scene = null

onMounted(() => {
  if (!sceneContainer.value) return
  scene = new SoilProfileScene(sceneContainer.value)
  scene.setOnLayerClick((layer, mode) => {
    emit('layerClick', { layer, mode })
  })

  const ro = new ResizeObserver(() => {
    if (scene) scene.resize()
  })
  ro.observe(sceneContainer.value)
})

watch(() => props.mode, (newMode) => {
  if (scene) scene.setMode(newMode)
})

onUnmounted(() => {
  if (scene) scene.dispose()
  scene = null
})
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;
  overflow: hidden;
}
</style>
