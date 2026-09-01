<template>
  <div class="map-page">
    <div class="map-top">
      <router-link to="/" class="map-back">← 返回首页</router-link>
      <h1 class="map-title">地图投影教学系统</h1>
      <p class="map-sub">点击投影类型 → 观察球体如何展开为平面地图</p>
      <div class="map-quick-controls">
        <button class="quick-btn" @click="toggleRotate">{{ rotating ? '暂停旋转' : '自动旋转' }}</button>
        <button class="quick-btn" @click="zoomBy(0.9)">放大</button>
        <button class="quick-btn" @click="zoomBy(1.1)">缩小</button>
        <button class="quick-btn" @click="resetAll">复位</button>
      </div>
    </div>
    <div class="map-body">
      <div ref="canvasRef" class="map-canvas"></div>
      <div class="map-controls">
        <button :class="['reset-btn', { active: current === 'reset' }]" @click="switchProj('reset')">🌍 原始状态</button>
        <div v-for="cat in categories" :key="cat" class="cat-group">
          <h3 class="cat-title">{{ cat }}</h3>
          <div class="btn-grid">
            <button v-for="p in getCat(cat)" :key="p.id"
              :class="['proj-btn', { active: current === p.id }]"
              @click="switchProj(p.id)"
              :title="p.en"
            >{{ p.name }}<span class="tag">{{ p.prop }}</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BaseScene } from '../engine/core/BaseScene.js'
import { MapProjectionModule, PROJECTIONS, CATS } from '../engine/modules/MapProjectionModule.js'

const canvasRef = ref(null)
const current = ref('reset')
const rotating = ref(false)
let engine = null
let resizeHandler = null

const categories = CATS

function getCat(cat) { return PROJECTIONS.filter(p => p.cat === cat) }

function switchProj(id) {
  current.value = id
  if (engine) engine.setParams({ projection: id })
}

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

function resetAll() {
  rotating.value = false
  current.value = 'reset'
  engine?.setAutoRotate(false)
  engine?.setParams({ projection: 'reset' })
  engine?.resetCamera('orbit')
}

onMounted(async () => {
  await nextTick()
  if (!canvasRef.value) return
  engine = new BaseScene(canvasRef.value, { bg: 0xf5f0e8, mode: 'simple', lightPreset: 'studio', autoRotate: false, shadows: false })
  engine.loadModule(MapProjectionModule, { mode: 'simple', projection: 'reset' })
  engine.setAutoRotate(false)
  resizeHandler = () => engine?.resize()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  engine?.dispose()
})
</script>

<style scoped>
.map-page { min-height: 100vh; background: var(--bg-soft); }
.map-top { text-align: center; padding: 20px 16px 8px; }
.map-back { color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 600; }
.map-title { margin: 8px 0 4px; font-size: 22px; color: var(--text); font-weight: 700; }
.map-sub { margin: 0; font-size: 13px; color: var(--text-muted); }
.map-quick-controls {
  margin-top: 8px;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}
.quick-btn {
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--text);
  padding: 4px 10px;
  font-size: 11px;
  cursor: pointer;
}
.quick-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-softer);
}
.map-body { display: flex; height: calc(100vh - 120px); }
.map-canvas { flex: 1; position: relative; overflow: hidden; min-width: 0; background: var(--bg-soft); }
.map-controls {
  width: 300px; overflow-y: auto; padding: 12px;
  background: var(--surface); border-left: 1px solid var(--glass-border);
  -webkit-backdrop-filter: var(--blur); backdrop-filter: var(--blur);
}
.reset-btn {
  display: block; width: 100%; padding: 10px; border: 2px solid var(--accent); border-radius: var(--radius-sm);
  background: var(--surface); color: var(--accent); font-size: 14px; font-weight: 700;
  cursor: pointer; margin-bottom: 14px; transition: background var(--transition), color var(--transition);
}
.reset-btn:hover, .reset-btn.active { background: var(--accent); color: var(--accent-ink); }
.cat-group { margin-bottom: 14px; }
.cat-title { margin: 0 0 6px; font-size: 11px; color: var(--text-faint); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); padding-bottom: 4px; }
.btn-grid { display: flex; flex-wrap: wrap; gap: 3px; }
.proj-btn {
  padding: 5px 8px; border: 1px solid var(--border); border-radius: 4px;
  background: var(--surface-soft); color: var(--text-muted); font-size: 11px; cursor: pointer;
  display: flex; align-items: center; gap: 3px; transition: background var(--transition), border-color var(--transition), color var(--transition);
}
.proj-btn:hover { border-color: var(--accent); color: var(--text); background: var(--accent-softer); }
.proj-btn.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.tag { font-size: 9px; padding: 1px 4px; border-radius: 2px; background: var(--accent-soft); color: var(--text-faint); }
.proj-btn.active .tag { background: rgba(255,255,255,0.2); color: var(--accent-ink); }
@media (max-width: 720px) {
  .map-body { flex-direction: column; }
  .map-canvas { height: 50vh; }
  .map-controls { width: 100%; height: 45vh; }
  .map-title { font-size: 18px; }
}
</style>
