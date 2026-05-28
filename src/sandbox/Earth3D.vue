<template>
  <div id="app">
    <header class="topbar">
      <router-link to="/" class="back-link">← 返回</router-link>
      <div class="mode-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['mode-tab', { active: mode === tab.id }]"
          @click="switchMode(tab.id)"
        >{{ tab.label }}</button>
      </div>
      <div class="mode-hint">
        <button :class="['level-btn', { active: level === 'simple' }]" @click="setLevel('simple')">高中</button>
        <button :class="['level-btn', { active: level === 'professional' }]" @click="setLevel('professional')">大学</button>
      </div>
    </header>
    <div id="main">
      <div id="canvas-container" ref="containerRef">
        <div class="controls-hint">🖱 拖拽 · 滚轮</div>
      </div>
      <aside id="info-panel">
        <!-- Interior tab -->
        <div v-show="mode === 'simple'" class="info-content">
          <h2>🌍 地球内部圈层结构</h2>
          <p>地球内部从外到内分为四个圈层：</p>
          <ul class="layers-list">
            <li><span class="dot" style="background:#4a90d9"></span><strong>地壳</strong><span>平均厚度 17km</span></li>
            <li><span class="dot" style="background:#e67e22"></span><strong>地幔</strong><span>厚约 2900km</span></li>
            <li><span class="dot" style="background:#f39c12"></span><strong>外核</strong><span>液态铁镍，产生磁场</span></li>
            <li><span class="dot" style="background:#f1c40f"></span><strong>内核</strong><span>固态铁镍，半径 1220km</span></li>
          </ul>
          <h3>关键界面</h3>
          <p>• <strong>莫霍界面</strong> ~33km：地壳与地幔分界<br/>
          • <strong>古登堡界面</strong> ~2900km：地幔与地核分界</p>
        </div>

        <!-- Celestial tab -->
        <div v-show="mode === 'professional'" class="info-content">
          <h2>🔭 宇宙坐标系</h2>
          <p>选择坐标系查看天体坐标：</p>
          <div class="coord-btns">
            <button v-for="c in coordSystems" :key="c.id" :class="['coord-btn', { active: activeCoord === c.id }]" @click="switchCoord(c.id)">{{ c.label }}</button>
          </div>
          <div id="coord-description" v-html="coordDesc"></div>
          <div class="objects-section">
            <h3>✨ 示例天体</h3>
            <div v-for="obj in celestialObjects" :key="obj.id"
              :class="['obj-item', { selected: selectedObj === obj.id }]"
              @click="selectObj(obj.id)">
              <span class="obj-dot" :style="{background: obj.labelColor}"></span>
              <div class="obj-info">
                <strong :style="{color: selectedObj === obj.id ? '#fff' : obj.labelColor}">{{ obj.name }}</strong>
                <span class="obj-type">{{ obj.type }}</span>
              </div>
              <span class="obj-coord" v-if="currentCoords[obj.id]">{{ currentCoords[obj.id] }}</span>
            </div>
          </div>
        </div>

        <!-- Deep space tab -->
        <div v-show="mode === 'deepspace'" class="info-content" style="height:100%">
          <h2>🚀 深空探索</h2>
          <div class="space-scroll">
            <div class="zoom-levels">
              <button :class="['zoom-btn', { active: zoomLevel === 'earth' }]" @click="setZoom('earth')">🌍 地球</button>
              <button :class="['zoom-btn', { active: zoomLevel === 'solar' }]" @click="setZoom('solar')">☀️ 太阳系</button>
              <button :class="['zoom-btn', { active: zoomLevel === 'galaxy' }]" @click="setZoom('galaxy')">🌌 银河</button>
            </div>
            <h3>🌌 太阳系</h3>
            <p>行星绕太阳公转，八颗行星分为：</p>
            <p>• <span style="color:#aaa">类地行星</span>：水金地火<br/>
            • <span style="color:#d4a574">巨行星</span>：木星 土星</p>
            <h3>🛸 地火转移轨道</h3>
            <p>霍曼转移：从低轨到高轨最节能的路径</p>
            <p><strong>关键速度：</strong><br/>
            • 第一宇宙速度 <span class="coord-tag">7.9 km/s</span><br/>
            • 第二宇宙速度 <span class="coord-tag">11.2 km/s</span><br/>
            • 转移速度 <span class="coord-tag">~11.6 km/s</span></p>
            <div class="timeline-section">
              <h3>🕐 任务时间轴</h3>
              <div class="phase-markers">
                <span>①发射</span><span>②逃逸</span><span>③巡航</span><span>④捕获</span>
              </div>
              <div class="timeline-bar">
                <input type="range" min="0" max="259" :value="transferDay" @input="setTransferDay($event.target.value)" class="timeline-slider" />
              </div>
              <div class="timeline-info">
                <span>第 <strong>{{ transferDay }}</strong> 天 · {{ phaseName }}</span>
                <button class="play-btn" @click="toggleAutoPlay">{{ autoPlay ? '⏸ 暂停' : '▶ 自动飞行' }}</button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BaseScene } from '../engine/core/BaseScene.js'
import { EarthInteriorModule } from '../engine/modules/EarthInteriorModule.js'
import { CelestialSphereModule } from '../engine/modules/CelestialSphereModule.js'
import { SolarSystemModule } from '../engine/modules/SolarSystemModule.js'
import { PostProcessing } from '../engine/effects/PostProcessing.js'

const tabs = [
  { id: 'simple', label: '🌍 地球圈层' },
  { id: 'professional', label: '🔭 宇宙坐标' },
  { id: 'deepspace', label: '🚀 深空探索' },
]

const containerRef = ref(null)
const mode = ref('simple')
const level = ref('simple')
const activeCoord = ref('horizontal')
const selectedObj = ref('sirius_a')
const coordDesc = ref('')
const currentCoords = ref({})
const transferDay = ref(0)
const autoPlay = ref(false)
const zoomLevel = ref('solar')
let autoPlayTimer = null
let engine = null
let postFx = null

const phaseName = computed(() => {
  const p = transferDay.value / 259
  if (p < 0.12) return '地球轨道'
  if (p < 0.2) return '逃逸加速'
  if (p < 0.82) return '霍曼转移'
  return '火星捕获'
})

const coordSystems = [
  { id: 'horizontal', label: '地平坐标系' },
  { id: 'equatorial', label: '赤道坐标系' },
  { id: 'ecliptic', label: '黄道坐标系' },
  { id: 'galactic', label: '银道坐标系' },
]

const celestialObjects = [
  { id:'sirius_a', name:'天狼星A', type:'主序星', labelColor:'#add8ff', pos:[1.6,-0.5,1.5], color:0xadd8ff, size:0.08 },
  { id:'betelgeuse', name:'参宿四', type:'红超巨星', labelColor:'#ff6666', pos:[-1.3,1.2,1.2], color:0xff4444, size:0.14 },
  { id:'sirius_b', name:'天狼星B', type:'白矮星', labelColor:'#cccccc', pos:[1.4,-0.7,1.7], color:0xeeeeee, size:0.05 },
  { id:'cygnus_x1', name:'天鹅座X-1', type:'黑洞', labelColor:'#cc66ff', pos:[-1.0,0.8,-1.8], color:0x440044, size:0.04 },
  { id:'crab_pulsar', name:'蟹状星云脉冲星', type:'中子星', labelColor:'#00ffcc', pos:[0.3,-1.5,1.6], color:0x00ffcc, size:0.06 },
]

const descs = {
  horizontal: `<h3>🌐 地平坐标系</h3><p>基准：地平圈。高度 h(0°~90°)，方位角 A(0°~360°)。直观但随时地变化。</p>`,
  equatorial: `<h3>🌌 赤道坐标系</h3><p>基准：天赤道。赤纬 δ(-90°~+90°)，赤经 α(0h~24h)。恒星坐标固定。</p>`,
  ecliptic: `<h3>🌞 黄道坐标系</h3><p>基准：黄道面(倾斜23.44°)。黄纬 β，黄经 λ。用于行星运动。</p>`,
  galactic: `<h3>🌌 银道坐标系</h3><p>基准：银道面(倾斜62.6°)。银纬 b，银经 l。用于银河系研究。</p>`,
}

const objCoords = {
  horizontal: { sirius_a:'h=35° A=135°', betelgeuse:'h=52° A=225°', sirius_b:'h=32° A=140°', cygnus_x1:'h=30° A=300°', crab_pulsar:'h=10° A=25°' },
  equatorial: { sirius_a:'δ=-17° α=6h45m', betelgeuse:'δ=+7° α=5h55m', sirius_b:'δ=-17° α=6h45m', cygnus_x1:'δ=+35° α=19h58m', crab_pulsar:'δ=+22° α=5h35m' },
  ecliptic: { sirius_a:'β=-39° λ=103°', betelgeuse:'β=-16° λ=88°', sirius_b:'β=-39° λ=103°', cygnus_x1:'β=+5° λ=61°', crab_pulsar:'β=-17° λ=85°' },
  galactic: { sirius_a:'b=-33° l=227°', betelgeuse:'b=-14° l=210°', sirius_b:'b=-33° l=227°', cygnus_x1:'b=+4° l=72°', crab_pulsar:'b=-2° l=184°' },
}

function setLevel(l) {
  level.value = l
  if (engine) engine.setMode(l)
}

function switchCoord(id) {
  activeCoord.value = id
  coordDesc.value = descs[id] || ''
  currentCoords.value = objCoords[id] || ''
  if (engine) engine.setParams({ coordSystem: id, selectedObj: selectedObj.value })
}

function selectObj(id) {
  selectedObj.value = id
  if (engine) engine.setParams({ selectedObj: id, coordSystem: activeCoord.value })
}

function setTransferDay(val) {
  transferDay.value = parseInt(val)
  if (engine) engine.setParams({ transferProgress: val / 259 })
}

function toggleAutoPlay() {
  autoPlay.value = !autoPlay.value
  if (autoPlay.value) {
    autoPlayTimer = setInterval(() => {
      if (transferDay.value >= 259) transferDay.value = 0; else transferDay.value++
      if (engine) engine.setParams({ transferProgress: transferDay.value / 259 })
    }, 80)
  } else {
    clearInterval(autoPlayTimer); autoPlayTimer = null
  }
}

function setZoom(level) {
  zoomLevel.value = level
  if (!engine?.cameraRig) return
  const cam = engine.cameraRig.camera
  const ct = engine.cameraRig.controls.target
  switch (level) {
    case 'earth': ct.set(1.8, 0, 0); cam.position.set(1.8, 1.2, 2.5); break
    case 'solar': ct.set(2.0, 0, 0.5); cam.position.set(3, 4, 7); break
    case 'galaxy': ct.set(0, 0, 0); cam.position.set(0, 15, 20); break
  }
  engine.cameraRig.controls.update()
}

onMounted(async () => {
  await nextTick()
  if (!containerRef.value) return
  engine = new BaseScene(containerRef.value, { bg: 0x0a0a1a, mode: 'simple' })
  postFx = new PostProcessing(engine.renderManager)
  engine.loadModule(EarthInteriorModule, { mode: 'simple' })
  window.addEventListener('resize', () => engine.resize())
})

function switchMode(m) {
  mode.value = m
  if (m === 'simple') {
    engine.loadModule(EarthInteriorModule, { mode: level.value })
    engine.setAutoRotate(true)
  } else if (m === 'professional') {
    engine.loadModule(CelestialSphereModule, { mode: level.value })
    engine.setAutoRotate(false)
    coordDesc.value = descs.horizontal
    currentCoords.value = objCoords.horizontal
  } else if (m === 'deepspace') {
    engine.loadModule(SolarSystemModule, { mode: 'deepspace' })
    engine.setAutoRotate(false)
    postFx?.enableBloom({ threshold: 0.1, strength: 0.6, radius: 0.5 })
  }
  if (m !== 'deepspace') postFx?.disableBloom()
}

onBeforeUnmount(() => {
  engine?.dispose()
  if (autoPlayTimer) clearInterval(autoPlayTimer)
})
</script>

<style scoped>
#app {
  display: flex; flex-direction: column; height: calc(100vh - 80px);
  background: #0a0a1a; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
}
.topbar {
  display: flex; align-items: center; gap: 14px; padding: 10px 18px;
  border-bottom: 1px solid #333; background: rgba(10,10,30,0.95); flex-shrink: 0;
}
.back-link { color: #60a5fa; text-decoration: none; font-size: 13px; }
.mode-tabs { display: flex; gap: 2px; margin: 0 auto; }
.mode-tab {
  padding: 8px 18px; border: none; border-radius: 8px 8px 0 0;
  background: transparent; color: #666; font-size: 0.85rem; cursor: pointer;
  border-bottom: 2px solid transparent;
}
.mode-tab:hover { color: #aaa; }
.mode-tab.active { background: rgba(59,130,246,0.15); color: #60a5fa; border-bottom-color: #3b82f6; }
.mode-hint { display: flex; gap: 4px; }
.level-btn {
  padding: 4px 10px; border: 1px solid #444; border-radius: 4px;
  background: transparent; color: #888; font-size: 0.7rem; cursor: pointer;
}
.level-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
#main { display: flex; flex: 1; overflow: hidden; }
#canvas-container { flex: 1; position: relative; overflow: hidden; }
.controls-hint {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.6); padding: 4px 12px; border-radius: 6px;
  font-size: 0.75rem; color: #666; pointer-events: none;
}
#info-panel {
  width: 340px; padding: 16px; overflow-y: auto;
  background: rgba(15,15,35,0.95); border-left: 1px solid #333;
  font-size: 0.85rem; line-height: 1.7;
}
#info-panel h2 { font-size: 1rem; margin-bottom: 10px; color: #60a5fa; }
#info-panel h3 { font-size: 0.9rem; margin: 12px 0 6px; color: #93bbfd; }
.layers-list { list-style: none; }
.layers-list li { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.layers-list .dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.coord-btns { display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; }
.coord-btn {
  padding: 4px 10px; border: none; border-radius: 4px;
  background: #333; color: #aaa; font-size: 0.75rem; cursor: pointer;
}
.coord-btn.active { background: #3b82f6; color: #fff; }
.coord-tag {
  display: inline-block; background: #1e293b; padding: 1px 8px;
  border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #facc15;
}
.objects-section { margin-top: 12px; border-top: 1px solid #333; padding-top: 10px; }
.obj-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 8px;
  border-radius: 6px; cursor: pointer; border-left: 3px solid transparent;
  border-bottom: 1px solid #222; font-size: 0.8rem;
}
.obj-item:hover { background: rgba(255,255,255,0.04); }
.obj-item.selected { background: rgba(59,130,246,0.15); border-left-color: #3b82f6; }
.obj-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.obj-info { flex: 1; }
.obj-info strong { display: block; font-size: 0.82rem; }
.obj-type { color: #666; font-size: 0.7rem; }
.obj-coord { font-size: 0.65rem; background: #1e293b; padding: 1px 6px; border-radius: 4px; color: #facc15; }
.zoom-levels { display: flex; gap: 4px; margin-bottom: 12px; }
.zoom-btn {
  flex: 1; padding: 6px 4px; border: 1px solid #444; border-radius: 6px;
  background: transparent; color: #888; font-size: 0.72rem; cursor: pointer; text-align: center;
}
.zoom-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.zoom-btn:hover:not(.active) { border-color: #666; color: #ccc; }
.space-scroll { overflow-y: auto; height: calc(100% - 30px); padding-right: 4px; }
.timeline-section { margin-top: 16px; padding-top: 12px; border-top: 1px solid #333; }
.timeline-section h3 { font-size: 0.85rem; margin: 0 0 8px; color: #44ff88; }
.phase-markers { display: flex; justify-content: space-between; font-size: 0.65rem; color: #666; margin-bottom: 4px; padding: 0 2px; }
.timeline-slider { width: 100%; accent-color: #44ff88; height: 4px; cursor: pointer; }
.timeline-info { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 0.8rem; }
.timeline-info strong { color: #44ff88; font-size: 1rem; }
.play-btn {
  padding: 4px 12px; border: 1px solid #44ff88; border-radius: 4px;
  background: rgba(68,255,136,0.1); color: #44ff88; font-size: 0.75rem; cursor: pointer;
}
.play-btn:hover { background: rgba(68,255,136,0.2); }
@media (max-width: 768px) {
  #main { flex-direction: column; }
  #info-panel { width: 100%; height: 35vh; border-left: none; border-top: 1px solid #333; }
}
</style>
