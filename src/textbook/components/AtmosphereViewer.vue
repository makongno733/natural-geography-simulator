<template>
  <section class="atmo-viewer">
    <div class="atmo-toolbar">
      <div class="atmo-tabs">
        <button
          v-for="(tab, i) in tabs"
          :key="i"
          :class="['atmo-tab', { active: activeTab === i }]"
          @click="activeTab = i"
        >
          {{ tab }}
        </button>
      </div>
      <div class="atmo-mode">
        <span class="mode-label">模式</span>
        <button
          :class="['mode-btn', { active: currentMode === 'simple' }]"
          @click="setMode('simple')"
        >高中</button>
        <button
          :class="['mode-btn', { active: currentMode === 'professional' }]"
          @click="setMode('professional')"
        >大学</button>
      </div>
    </div>
    <div ref="sceneContainer" class="atmo-canvas"></div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import AtmosphereScene from '../../lib/atmosphereScene.js'

const props = defineProps({
  mode: { type: String, default: 'simple' },
  defaultTab: { type: Number, default: 0 },
})

const tabs = ['垂直分层', '大气组成', '受热过程', '三圈环流']
const activeTab = ref(props.defaultTab || 0)
const currentMode = ref(props.mode)
const sceneContainer = ref(null)
let scene = null
let running = true

function setMode(m) {
  currentMode.value = m
  if (scene) scene.setMode(m)
}

watch(activeTab, (val) => {
  if (scene) scene.setTheme(val)
})

function handleResize() {
  if (scene) scene.resize()
}

onMounted(() => {
  scene = new AtmosphereScene(sceneContainer.value, currentMode.value)
  scene.setTheme(activeTab.value)
  running = true

  function loop() {
    if (!running) return
    scene.render()
    requestAnimationFrame(loop)
  }
  loop()

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  running = false
  window.removeEventListener('resize', handleResize)
  if (scene) scene.dispose()
})
</script>

<style scoped>
.atmo-viewer {
  border: 1px solid #e2c9b4;
  border-radius: 10px;
  background: rgba(255,255,255,0.94);
  overflow: hidden;
  margin-bottom: 16px;
}
.atmo-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e2c9b4;
  background: #fcf9f5;
}
.atmo-tabs {
  display: flex;
  gap: 2px;
}
.atmo-tab {
  border: none;
  background: transparent;
  padding: 5px 14px;
  font-size: 13px;
  color: #6b3b32;
  cursor: pointer;
  border-radius: 6px;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.atmo-tab:hover { background: #f5ede8; }
.atmo-tab.active {
  background: #b01217;
  color: #fff;
  font-weight: 600;
}
.atmo-mode {
  display: flex;
  align-items: center;
  gap: 4px;
}
.mode-label {
  font-size: 11px;
  color: #b85a4d;
  margin-right: 2px;
}
.mode-btn {
  border: 1px solid #e2c9b4;
  background: #fff;
  padding: 3px 10px;
  font-size: 11px;
  color: #6b3b32;
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
}
.mode-btn.active {
  background: #b01217;
  color: #fff;
  border-color: #b01217;
}
.atmo-canvas {
  width: 100%;
  height: 400px;
  display: block;
}
@media (max-width: 720px) {
  .atmo-canvas { height: 280px; }
  .atmo-toolbar { flex-wrap: wrap; gap: 6px; }
}
</style>
