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

    <!-- 教学四要素机理与连贯性面板 -->
    <ModelPedagogyPanel
      theme="systems"
      :observe="pedagogy.observe"
      :change="pedagogy.change"
      :mechanism="pedagogy.mechanism"
      :limitations="pedagogy.limitations"
      :real-data-lab="{ title: 'NASA 卫星投影对比与全球瓦片系统', path: '/geo-labs/satellite', desc: '真实 Web 墨卡托切片与地球全貌' }"
      :textbook-link="{ grade: '初中', book: '七年级上册', chapter: '第二章', section: '第一节' }"
      practice-link="/practice"
      @reset="switchProj('reset')"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BaseScene } from '../engine/core/BaseScene.js'
import { MapProjectionModule, PROJECTIONS, CATS } from '../engine/modules/MapProjectionModule.js'
import ModelPedagogyPanel from '../experiments/components/ModelPedagogyPanel.vue'

const pedagogy = {
  observe: [
    '正轴圆柱投影（墨卡托）：经线彼此平行等距，纬线间距随纬度升高而急剧拉大，高纬度地区面积严重夸大（如格陵兰岛在图上看起来与非洲相当，实际仅为非洲的 1/14）。',
    '圆锥投影（兰伯特）：适合中纬度沿纬线延伸的国家（如中国、美国），中纬度变形极小。',
    '方位投影：从一个切点向四周放射，适合极地两极区域地图。',
  ],
  change: [
    '点击各类投影按钮，观察球体几何网格如何拉伸或剪切展开为平面。',
    '点击“原始状态”对比球面上真实的经纬网和海陆轮廓。',
  ],
  mechanism: [
    '高斯绝妙定理：球面具有恒正的高斯曲率，而平面高斯曲率为零。由于高斯曲率是等距变换的不变量，球面不可能在没有任何变形的前提下展平为平面。',
    '三种投影性质不可兼得：等角投影（保持局部形状和方向真实，但变形面积）、等积投影（保持各地区面积比例严谨，但扭曲形状）、任意投影（折中综合平衡）。',
  ],
  limitations: [
    '模型动画采用三维顶点插值直观演示展开，不能直接用于高精度航海大地坐标求算。',
  ],
}

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
  display: block; width: 100%; padding: 10px 14px; border: 1.5px solid var(--geo-ocean); border-radius: var(--radius-pill);
  background: var(--geo-ocean-surface); color: var(--geo-ocean); font-size: 13.5px; font-weight: 700;
  cursor: pointer; margin-bottom: 14px; transition: var(--geo-btn-transition);
}
.reset-btn:hover, .reset-btn.active { background: var(--geo-ocean); color: #ffffff; border-color: var(--geo-ocean); box-shadow: var(--geo-btn-primary-shadow); }
.cat-group { margin-bottom: 14px; }
.cat-title { margin: 0 0 6px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); padding-bottom: 4px; font-weight: 700; }
.btn-grid { display: flex; flex-wrap: wrap; gap: 4px; }
.proj-btn {
  padding: 6px 10px; border: 1px solid var(--border); border-radius: var(--radius-pill);
  background: var(--surface); color: var(--text-muted); font-size: 11.5px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 4px; transition: var(--geo-btn-transition);
}
.proj-btn:hover { border-color: var(--geo-ocean); color: var(--geo-ocean); background: var(--geo-ocean-surface); }
.proj-btn.active { background: var(--geo-ocean); color: #ffffff; border-color: var(--geo-ocean); box-shadow: var(--geo-btn-primary-shadow); }
.tag { font-size: 9.5px; padding: 2px 5px; border-radius: var(--radius-pill); background: var(--geo-ocean-surface); color: var(--geo-ocean); }
.proj-btn.active .tag { background: rgba(255,255,255,0.25); color: #ffffff; }
@media (max-width: 720px) {
  .map-body { flex-direction: column; }
  .map-canvas { height: 50vh; }
  .map-controls { width: 100%; height: 45vh; }
  .map-title { font-size: 18px; }
}
</style>
