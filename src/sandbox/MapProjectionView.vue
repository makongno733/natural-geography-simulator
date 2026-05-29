<template>
  <div class="map-page">
    <div class="map-top">
      <router-link to="/" class="map-back">← 返回首页</router-link>
      <h1 class="map-title">地图投影教学系统</h1>
      <p class="map-sub">点击投影类型 → 观察球体如何展开为平面地图</p>
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
import { MapProjectionModule, PROJECTIONS, CATEGORIES } from '../engine/modules/MapProjectionModule.js'

const canvasRef = ref(null)
const current = ref('reset')
let engine = null

const categories = CATEGORIES

function getCat(cat) { return PROJECTIONS.filter(p => p.cat === cat) }

function switchProj(id) {
  current.value = id
  if (engine) engine.setParams({ projection: id })
}

onMounted(async () => {
  await nextTick()
  if (!canvasRef.value) return
  engine = new BaseScene(canvasRef.value, { bg: 0xf5f0e8, mode: 'simple', lightPreset: 'studio', labels: false, autoRotate: false, shadows: false })
  engine.loadModule(MapProjectionModule, { mode: 'simple', projection: 'reset' })
  engine.setAutoRotate(false)
  window.addEventListener('resize', () => engine.resize())
})

onBeforeUnmount(() => { engine?.dispose() })
</script>

<style scoped>
.map-page { min-height: 100vh; background: #f5f0e8; font-family: 'Noto Serif SC', -apple-system, sans-serif; }
.map-top { text-align: center; padding: 20px 16px 8px; }
.map-back { color: #8b4513; text-decoration: none; font-size: 13px; }
.map-title { margin: 8px 0 4px; font-size: 22px; color: #333; font-weight: 700; }
.map-sub { margin: 0; font-size: 13px; color: #999; }
.map-body { display: flex; height: calc(100vh - 120px); }
.map-canvas { flex: 1; position: relative; overflow: hidden; min-width: 0; background: #f5f0e8; }
.map-controls {
  width: 300px; overflow-y: auto; padding: 12px;
  background: #fff; border-left: 1px solid #e8ddd0;
}
.reset-btn {
  display: block; width: 100%; padding: 10px; border: 2px solid #8b4513; border-radius: 8px;
  background: #fff; color: #8b4513; font-size: 14px; font-weight: 700;
  cursor: pointer; margin-bottom: 14px; transition: all 0.15s;
}
.reset-btn:hover, .reset-btn.active { background: #8b4513; color: #fff; }
.cat-group { margin-bottom: 14px; }
.cat-title { margin: 0 0 6px; font-size: 11px; color: #bbb; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
.btn-grid { display: flex; flex-wrap: wrap; gap: 3px; }
.proj-btn {
  padding: 5px 8px; border: 1px solid #ddd; border-radius: 4px;
  background: #fafafa; color: #666; font-size: 11px; cursor: pointer;
  display: flex; align-items: center; gap: 3px; transition: all 0.15s;
}
.proj-btn:hover { border-color: #8b4513; color: #333; background: #fdf5ee; }
.proj-btn.active { background: #8b4513; color: #fff; border-color: #8b4513; }
.tag { font-size: 9px; padding: 1px 4px; border-radius: 2px; background: rgba(0,0,0,0.05); color: #aaa; }
.proj-btn.active .tag { background: rgba(255,255,255,0.2); color: #fdd; }
@media (max-width: 720px) {
  .map-body { flex-direction: column; }
  .map-canvas { height: 50vh; }
  .map-controls { width: 100%; height: 45vh; }
  .map-title { font-size: 18px; }
}
</style>
