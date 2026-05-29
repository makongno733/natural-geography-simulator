<template>
  <div class="geo-page">
    <header class="geo-top">
      <router-link to="/" class="geo-back">← 返回首页</router-link>
      <h1 class="geo-title">地质年代表</h1>
      <p class="geo-sub">Geological Time Scale · 46亿年演化 · 拖动时间轴浏览</p>
      <div class="time-scrubber">
        <div class="scrub-row">
          <input type="range" min="0" :max="eras.length - 1" :value="currentEra" @input="selectEra(parseInt($event.target.value))" class="scrubber" />
          <button class="auto-btn" @click="toggleAuto">{{ playing ? '⏸' : '▶' }}</button>
        </div>
        <div class="scrub-labels">
          <span v-for="(era, i) in eras" :key="i" :class="{ active: i === currentEra }" @click="selectEra(i)">{{ era.name }}</span>
        </div>
      </div>
    </header>

    <div class="geo-body">
      <!-- 3D View -->
      <div class="geo-3d" ref="canvasRef"></div>

      <!-- Sidebar -->
      <aside class="geo-side">
        <!-- Timeline -->
        <div class="timeline-module">
          <h3>🕐 时间轴</h3>
          <div class="tl-bar">
            <button v-for="(era, i) in eras" :key="i"
              :class="['tl-btn', { active: currentEra === i }]"
              :style="{ borderColor: '#' + era.color.toString(16).padStart(6, '0') }"
              @click="selectEra(i)"
            >
              <span class="tl-dot" :style="{ background: '#' + era.color.toString(16).padStart(6, '0') }"></span>
              <span class="tl-name">{{ era.name }}</span>
              <span class="tl-en">{{ era.en }}</span>
              <span class="tl-time">{{ era.start }}{{ era.end === 0 ? '+' : '' }}Ma</span>
            </button>
          </div>
        </div>

        <!-- Current Era Info -->
        <div class="era-info" v-if="currentEraData">
          <h3 :style="{ color: '#' + currentEraData.color.toString(16).padStart(6, '0') }">{{ currentEraData.name }} · {{ currentEraData.en }}</h3>
          <p>{{ currentEraData.desc }}</p>
          <div class="fossil-box" v-if="currentEraData.fossils">
            <h4>🦴 代表生物 / 标志物</h4>
            <p>{{ currentEraData.fossils }}</p>
          </div>
        </div>
      </aside>
    </div>

    <!-- Geological Time Scale Table -->
    <div class="geo-table-wrap">
      <h2>📋 完整地质年代表</h2>
      <div class="geo-table">
        <div class="gt-header">
          <span>宙 Eon</span><span>代 Era</span><span>起始 Ma</span><span>关键事件</span>
        </div>
        <div v-for="era in eras" :key="era.name"
          :class="['gt-row', { active: currentEra === eras.indexOf(era) }]"
          @click="selectEra(eras.indexOf(era))"
        >
          <span>{{ era.eon || '—' }}</span>
          <span :style="{ color: '#' + era.color.toString(16).padStart(6, '0'), fontWeight: '700' }">{{ era.name }}</span>
          <span>{{ era.start }}</span>
          <span class="gt-desc">{{ era.desc.split('。')[0] }}。</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BaseScene } from '../engine/core/BaseScene.js'
import { GeologicTimeModule, ERAS } from '../engine/modules/GeologicTimeModule.js'

const canvasRef = ref(null)
const currentEra = ref(ERAS.length - 1)
const playing = ref(false)
const eras = ERAS
let engine = null, autoTimer = null

function toggleAuto() {
  playing.value = !playing.value
  if (playing.value) {
    autoTimer = setInterval(() => {
      currentEra.value = (currentEra.value + 1) % eras.length
      if (engine) engine.setParams({ era: currentEra.value })
    }, 1200)
  } else {
    clearInterval(autoTimer); autoTimer = null
  }
}

const currentEraData = computed(() => eras[currentEra.value] || null)

function selectEra(i) {
  currentEra.value = i
  if (engine) engine.setParams({ era: i })
}

onMounted(async () => {
  await nextTick()
  if (!canvasRef.value) return
  engine = new BaseScene(canvasRef.value, { bg: 0x1a1a2e, mode: 'simple', lightPreset: 'sunlit', autoRotate: false, shadows: true })
  engine.loadModule(GeologicTimeModule, { mode: 'simple', era: currentEra.value })
  window.addEventListener('resize', () => engine.resize())
})

onBeforeUnmount(() => { engine?.dispose(); if (autoTimer) clearInterval(autoTimer) })
</script>

<style scoped>
.geo-page { min-height: 100vh; background: #0d1117; color: #ddd; font-family: -apple-system, 'Noto Sans SC', sans-serif; }
.geo-top { text-align: center; padding: 16px; border-bottom: 1px solid #222; }
.geo-back { color: #58a6ff; text-decoration: none; font-size: 13px; }
.geo-title { margin: 6px 0 2px; font-size: 24px; color: #f0f0f0; }
.geo-sub { margin: 0; font-size: 12px; color: #666; }
.geo-body { display: flex; height: 55vh; }
.geo-3d { flex: 1; position: relative; overflow: hidden; }
.geo-side { width: 320px; overflow-y: auto; padding: 12px; background: #111; border-left: 1px solid #222; }
.timeline-module h3 { margin: 0 0 8px; font-size: 14px; color: #888; }
.tl-bar { display: flex; flex-direction: column; gap: 2px; }
.tl-btn {
  display: flex; align-items: center; gap: 8px; padding: 6px 8px;
  border: 1px solid #333; border-left-width: 3px; border-radius: 4px;
  background: transparent; cursor: pointer; transition: all 0.15s;
}
.tl-btn:hover { background: rgba(255,255,255,0.03); }
.tl-btn.active { background: rgba(255,255,255,0.06); }
.tl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.tl-name { font-size: 13px; color: #ddd; font-weight: 600; }
.tl-en { font-size: 10px; color: #666; flex: 1; }
.tl-time { font-size: 10px; color: #888; }
.time-scrubber { padding: 10px 16px 2px; }
.scrub-row { display: flex; gap: 8px; align-items: center; }
.scrubber { flex: 1; accent-color: #58a6ff; height: 4px; cursor: pointer; }
.auto-btn {
  padding: 4px 10px; border: 1px solid #58a6ff; border-radius: 4px;
  background: rgba(88,166,255,0.1); color: #58a6ff; font-size: 14px; cursor: pointer;
}
.auto-btn:hover { background: rgba(88,166,255,0.2); }
.scrub-labels { display: flex; justify-content: space-between; padding: 0 2px; }
.scrub-labels { overflow-x: auto; flex-wrap: nowrap; }
.scrub-labels span { font-size: 20px; color: #777; cursor: pointer; padding: 3px 2px; white-space: nowrap; flex-shrink: 0; font-weight: 600; }
.scrub-labels span.active { color: #58a6ff; font-weight: 700; }
.era-info { margin-top: 16px; padding: 12px; border: 1px solid #333; border-radius: 8px; background: #0a0a0f; }
.era-info h3 { margin: 0 0 8px; font-size: 14px; }
.era-info p { margin: 0; font-size: 12px; color: #aaa; line-height: 1.6; }
.fossil-box { margin-top: 12px; padding: 10px; border-top: 1px solid #222; }
.fossil-box h4 { margin: 0 0 6px; font-size: 12px; color: #ffaa44; }
.fossil-box p { font-size: 11px; color: #998; line-height: 1.5; }
.geo-table-wrap { padding: 20px; }
.geo-table-wrap h2 { margin: 0 0 12px; font-size: 16px; color: #888; }
.geo-table { border: 1px solid #222; border-radius: 8px; overflow: hidden; }
.gt-header, .gt-row { display: grid; grid-template-columns: 1fr 1.2fr 0.8fr 3fr; gap: 8px; padding: 8px 12px; font-size: 12px; }
.gt-header { background: #1a1a2e; color: #aaa; font-weight: 600; border-bottom: 1px solid #333; }
.gt-row { border-bottom: 1px solid #1a1a1a; cursor: pointer; transition: background 0.1s; }
.gt-row:hover { background: rgba(255,255,255,0.02); }
.gt-row.active { background: rgba(255,255,255,0.04); }
.gt-desc { color: #888; }
@media (max-width: 720px) {
  .geo-body { flex-direction: column; height: auto; }
  .geo-3d { height: 40vh; }
  .geo-side { width: 100%; height: auto; }
}
</style>
