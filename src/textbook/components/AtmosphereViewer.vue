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
      <div class="atmo-controls">
        <button class="control-btn" @click="toggleRotate">{{ rotating ? '暂停旋转' : '自动旋转' }}</button>
        <button class="control-btn" @click="zoomBy(0.9)">放大</button>
        <button class="control-btn" @click="zoomBy(1.1)">缩小</button>
        <button class="control-btn" @click="resetView">复位</button>
      </div>
    </div>
    <div ref="sceneContainer" class="atmo-canvas"></div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { BaseScene } from '../../engine/core/BaseScene.js'
import { AtmosphereModule } from '../../engine/modules/AtmosphereModule.js'

const props = defineProps({
  mode: { type: String, default: 'simple' },
  defaultTab: { type: Number, default: 0 },
})

const tabs = ['垂直分层', '大气组成', '受热过程', '大气环流', '热力环流', '温室效应']
const activeTab = ref(props.defaultTab || 0)
const currentMode = ref(props.mode)
const sceneContainer = ref(null)
const rotating = ref(false)
let engine = null
let resizeHandler = null

function setMode(m) {
  currentMode.value = m
  if (engine) engine.setMode(m)
}

watch(activeTab, (val) => {
  if (engine) engine.setParams({ theme: val })
})

function toggleRotate() {
  rotating.value = !rotating.value
  engine?.setAutoRotate(rotating.value)
}

function zoomBy(ratio) {
  if (!engine?.cameraRig) return
  const camera = engine.cameraRig.camera
  camera.position.multiplyScalar(ratio)
  engine.cameraRig.controls.update()
}

function resetView() {
  rotating.value = false
  engine?.setAutoRotate(false)
  engine?.resetCamera('orbit')
}

onMounted(() => {
  engine = new BaseScene(sceneContainer.value, {
    bg: 0x0a0e27,
    mode: currentMode.value,
    lightPreset: 'sunlit',
  })
  engine.loadModule(AtmosphereModule, { mode: currentMode.value, theme: activeTab.value })
  resizeHandler = () => engine?.resize()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (engine) engine.dispose()
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
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
.atmo-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
.control-btn {
  border: 1px solid rgba(91, 66, 44, 0.28);
  border-radius: 999px;
  background: #fff;
  color: #533721;
  padding: 3px 10px;
  font-size: 11px;
  cursor: pointer;
}
.control-btn:hover {
  border-color: #8e3a2d;
  color: #8e3a2d;
}
.atmo-canvas {
  width: 100%;
  height: 400px;
  display: block;
  position: relative;
  overflow: hidden;
}
@media (max-width: 720px) {
  .atmo-canvas { height: 280px; }
  .atmo-toolbar {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
  .atmo-tabs,
  .atmo-mode,
  .atmo-controls {
    flex-wrap: wrap;
  }
}
</style>
