<template>
  <div class="geo-page">
    <header class="geo-top">
      <router-link to="/" class="geo-back">← 返回首页</router-link>
      <h1 class="geo-title">地质年代表</h1>
      <p class="geo-sub">Geological Time Scale · 46亿年演化 · 拖动时间轴浏览</p>
      <div class="geo-quick-controls">
        <button class="quick-btn" @click="toggleRotate">{{ rotating ? '暂停旋转' : '自动旋转' }}</button>
        <button class="quick-btn" @click="zoomBy(0.9)">放大</button>
        <button class="quick-btn" @click="zoomBy(1.1)">缩小</button>
        <button class="quick-btn" @click="resetView">复位</button>
      </div>
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
              :style="{ borderColor: '#' + (era.color||era.c).toString(16).padStart(6, '0') }"
              @click="selectEra(i)"
            >
              <span class="tl-dot" :style="{ background: '#' + (era.color||era.c).toString(16).padStart(6, '0') }"></span>
              <span class="tl-name">{{ era.name }}</span>
              <span class="tl-en">{{ era.en }}</span>
              <span class="tl-time">{{ era.start }}{{ era.end === 0 ? '+' : '' }}Ma</span>
            </button>
          </div>
        </div>

        <!-- Current Era Info -->
        <div class="era-info" v-if="currentEraData">
          <h3 :style="{ color: '#' + (currentEraData.color||currentEraData.c).toString(16).padStart(6, '0') }">{{ currentEraData.name }} · {{ currentEraData.en }}</h3>
          <p>{{ currentEraData.d || currentEraData.desc }}</p>
          <div class="fossil-box" v-if="currentEraData.f || currentEraData.fossils">
            <h4>🦴 代表生物 / 标志物</h4>
            <p>{{ currentEraData.f || currentEraData.fossils }}</p>
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
          <span :style="{ color: '#' + (era.color||era.c).toString(16).padStart(6, '0'), fontWeight: '700' }">{{ era.name }}</span>
          <span>{{ era.start }}</span>
          <span class="gt-desc">{{ (era.d || era.desc || '').split('。')[0] }}。</span>
        </div>
      </div>
    </div>

    <!-- 教学四要素机理与连贯性面板 -->
    <ModelPedagogyPanel
      theme="geology"
      :observe="pedagogy.observe"
      :change="pedagogy.change"
      :mechanism="pedagogy.mechanism"
      :limitations="pedagogy.limitations"
      :real-data-lab="{ title: 'Copernicus 喜马拉雅山脉古特提斯洋地层探勘', path: '/geo-labs/terrain', desc: '真实高程DEM分析青藏高原隆起与造山' }"
      :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第一章', section: '第三节' }"
      practice-link="/practice"
      @reset="resetView"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BaseScene } from '../engine/core/BaseScene.js'
import { GeologicTimeModule, ERAS } from '../engine/modules/GeologicTimeModule.js'
import ModelPedagogyPanel from '../experiments/components/ModelPedagogyPanel.vue'

const pedagogy = {
  observe: [
    '地球 46 亿年漫长历史中，前寒武纪长达近 40 亿年（占全史约 88%），生命长期处于微观单细胞阶段。',
    '寒武纪生命大爆发瞬间拉开古生代序幕，海洋无脊椎动物繁盛，其后鱼类、两栖类相继登场。',
    '二叠纪末与白垩纪末重大生物集群灭绝界线，分别终结了古生代和中生代，促成恐龙向哺乳动物与人类的主导权交替。',
  ],
  change: [
    '沿时间轴滑动或点击特定代纪，观察地球古地理海陆变迁与标志性化石物种更迭。',
    '开启自动演示巡游，沿时间螺旋鸟瞰生命演化长河。',
  ],
  mechanism: [
    '生物演化规律：由简单到复杂、由低级到高级、由水生到陆生，演化过程不可逆。',
    '环境与生物协同进化：早期蓝细菌光合产氧改变原始大气圈，促成臭氧层形成，生物方得以登上陆地繁衍。',
    '地层与化石是记录地球历史的“天然书页”：同一时代地层含有相似标准化石，古生物演化构成了全球相对定年的核心依据。',
  ],
  limitations: [
    '本表时间刻度为便观察，对前寒武纪进行了非线性几何压缩，否则显生宙仅占最后短暂一段。',
    '地质年代起止数值随国际地层委员会（ICS）最新同位素测年精度持续动态修订微调。',
  ],
}

const canvasRef = ref(null)
const currentEra = ref(ERAS.length - 1)
const playing = ref(false)
const rotating = ref(false)
const eras = ERAS
let engine = null, autoTimer = null
let resizeHandler = null

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

onMounted(async () => {
  await nextTick()
  if (!canvasRef.value) return
  try {
    engine = new BaseScene(canvasRef.value, { bg: 0x1a1a2e, mode: 'simple', lightPreset: 'sunlit' })
    engine.loadModule(GeologicTimeModule, { mode: 'simple', era: currentEra.value })
    resizeHandler = () => engine?.resize()
    window.addEventListener('resize', resizeHandler)
  } catch(e) {
    console.error('3D engine failed:', e)
  }
})

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  engine?.dispose()
  if (autoTimer) clearInterval(autoTimer)
})
</script>

<style scoped>
.geo-page { min-height: 100vh; background: #0d1117; color: #ddd; font-family: -apple-system, 'Noto Sans SC', sans-serif; }
.geo-top { text-align: center; padding: 16px; border-bottom: 1px solid #222; }
.geo-back { color: #58a6ff; text-decoration: none; font-size: 13px; }
.geo-title { margin: 6px 0 2px; font-size: 24px; color: #f0f0f0; }
.geo-sub { margin: 0; font-size: 12px; color: #666; }
.geo-quick-controls {
  margin: 8px 0 0;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}
.quick-btn {
  border: 1px solid rgba(88, 166, 255, 0.4);
  border-radius: var(--radius-pill);
  background: rgba(88, 166, 255, 0.11);
  color: #8ac0ff;
  padding: 5px 12px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--geo-btn-transition);
}
.quick-btn:hover {
  border-color: #8ac0ff;
  background: rgba(88, 166, 255, 0.22);
}
.geo-body { display: flex; height: 55vh; }
.geo-3d { flex: 1; position: relative; overflow: hidden; }
.geo-side { width: 320px; overflow-y: auto; padding: 14px; background: #11141f; border-left: 1px solid rgba(255,255,255,0.1); }
.timeline-module h3 { margin: 0 0 10px; font-size: 14px; color: #8ac0ff; font-weight: 700; }
.tl-bar { display: flex; flex-direction: column; gap: 4px; }
.tl-btn {
  display: flex; align-items: center; gap: 8px; padding: 7px 10px;
  border: 1px solid rgba(255,255,255,0.12); border-left-width: 3.5px; border-radius: var(--radius-sm);
  background: rgba(255,255,255,0.03); cursor: pointer; transition: var(--geo-btn-transition);
}
.tl-btn:hover { background: rgba(255,255,255,0.08); }
.tl-btn.active { background: rgba(88,166,255,0.15); border-color: #58a6ff; }
.tl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.tl-name { font-size: 13px; color: #edf2f7; font-weight: 600; }
.tl-en { font-size: 10px; color: #8a99ad; flex: 1; }
.tl-time { font-size: 10px; color: #a0aec0; }
.time-scrubber { padding: 12px 16px 10px; background: #0b0e17; border-top: 1px solid rgba(255,255,255,0.08); }
.scrub-row { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
.scrubber { flex: 1; accent-color: #58a6ff; height: 6px; cursor: pointer; }
.auto-btn {
  padding: 5px 14px; border: 1px solid #58a6ff; border-radius: var(--radius-pill);
  background: rgba(88,166,255,0.15); color: #8ac0ff; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: var(--geo-btn-transition);
}
.auto-btn:hover { background: rgba(88,166,255,0.28); color: #fff; }
.scrub-labels { display: flex; justify-content: space-between; padding: 0 2px; }
.scrub-labels { overflow-x: auto; flex-wrap: nowrap; }
.scrub-labels span { font-size: 12px; color: #555; cursor: pointer; padding: 0 1px; white-space: nowrap; flex-shrink: 0; }
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
