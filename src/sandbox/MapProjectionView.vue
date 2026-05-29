<template>
  <div class="map-shell">
    <header class="topbar">
      <router-link to="/" class="back-link">← 返回</router-link>
      <h1 class="title">地图投影教学</h1>
    </header>
    <div class="main-layout">
      <div ref="canvasRef" class="canvas-pane"></div>
      <aside class="side-panel">
        <div v-for="cat in categories" :key="cat" class="cat-section">
          <h3 class="cat-title">{{ cat }}投影</h3>
          <div class="proj-grid">
            <button
              v-for="p in projByCat[cat]"
              :key="p.id"
              :class="['proj-btn', { active: current === p.id }]"
              @click="switchProj(p.id)"
              :title="p.en"
            >{{ p.name }}</button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BaseScene } from '../engine/core/BaseScene.js'
import { MapProjectionModule, PROJECTIONS, CATEGORIES } from '../engine/modules/MapProjectionModule.js'

const canvasRef = ref(null)
const current = ref('mercator')
let engine = null

const categories = CATEGORIES
const projByCat = computed(() => {
  const map = {}
  CATEGORIES.forEach(c => { map[c] = PROJECTIONS.filter(p => p.category === c) })
  return map
})

function switchProj(id) {
  current.value = id
  if (engine) engine.setParams({ projection: id })
}

onMounted(async () => {
  await nextTick()
  if (!canvasRef.value) return
  engine = new BaseScene(canvasRef.value, { bg: 0x1a1a2e, mode: 'simple', lightPreset: 'studio', autoRotate: false })
  engine.loadModule(MapProjectionModule, { mode: 'simple', projection: 'mercator' })
  engine.setAutoRotate(false)
  window.addEventListener('resize', () => engine.resize())
})

onBeforeUnmount(() => {
  engine?.dispose()
})
</script>

<style scoped>
.map-shell { display: flex; flex-direction: column; height: 100vh; background: #1a1a2e; color: #ddd; font-family: -apple-system, 'Noto Sans SC', sans-serif; }
.topbar { display: flex; align-items: center; gap: 16px; padding: 10px 18px; border-bottom: 1px solid #333; background: rgba(26,26,46,0.95); }
.back-link { color: #60a5fa; text-decoration: none; font-size: 13px; }
.title { margin: 0; font-size: 1rem; color: #e0e0e0; }
.main-layout { display: flex; flex: 1; overflow: hidden; }
.canvas-pane { flex: 1; position: relative; overflow: hidden; }
.side-panel {
  width: 280px; overflow-y: auto; padding: 12px;
  background: rgba(20,20,40,0.95); border-left: 1px solid #333;
}
.cat-section { margin-bottom: 16px; }
.cat-title { font-size: 0.8rem; color: #888; margin: 0 0 6px; padding-bottom: 4px; border-bottom: 1px solid #333; }
.proj-grid { display: flex; flex-wrap: wrap; gap: 3px; }
.proj-btn {
  padding: 4px 8px; border: 1px solid #444; border-radius: 4px;
  background: transparent; color: #aaa; font-size: 0.7rem; cursor: pointer;
}
.proj-btn:hover { border-color: #60a5fa; color: #ccc; }
.proj-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
</style>
