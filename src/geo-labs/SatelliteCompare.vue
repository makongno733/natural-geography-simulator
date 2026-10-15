<template>
  <section class="lab-page">
    <header class="lab-intro">
      <router-link to="/geo-labs" class="back">← 地理实证实验</router-link>
      <p class="eyebrow">NASA EARTH OBSERVATION · 卫星影像</p>
      <h1>同一地点，两天的地球</h1>
      <p>移动滑杆比较两天的真实卫星影像。先描述你看见的变化，再用地理知识解释；云层、观测时间和影像分辨率也可能影响判断。</p>
    </header>

    <div class="controls">
      <label>地点
        <select v-model="placeId">
          <option v-for="place in places" :key="place.id" :value="place.id">{{ place.name }}</option>
        </select>
      </label>
      <label>左侧日期 <input v-model="dateA" type="date" min="2000-01-01" :max="today" /></label>
      <label>右侧日期 <input v-model="dateB" type="date" min="2000-01-01" :max="today" /></label>
      <button type="button" @click="renderMaps">更新影像</button>
    </div>

    <div class="map-frame">
      <div ref="mapAEl" class="map-pane"></div>
      <div ref="mapBEl" class="map-pane map-overlay" :style="{ clipPath: `inset(0 0 0 ${split}%)` }"></div>
      <div class="divider" :style="{ left: `${split}%` }" aria-hidden="true"></div>
      <span class="map-tag left">{{ dateA }}</span><span class="map-tag right">{{ dateB }}</span>
      <input v-model.number="split" class="swipe" type="range" min="0" max="100" aria-label="拖动比较两天的卫星影像" />
      <div v-if="mapError" class="map-error">{{ mapError }}</div>
    </div>
    <p class="source">影像：<a href="https://www.earthdata.nasa.gov/data/instruments/modis" target="_blank" rel="noopener">NASA MODIS Terra</a> · 通过 <a href="https://nasa-gibs.github.io/gibs-api-docs/" target="_blank" rel="noopener">NASA GIBS</a> 提供。不同日期可能因云层或数据缺口显示不完整。地图仅供定性观察。</p>

    <div class="questions">
      <h2>观察与解释</h2>
      <ol>
        <li>先指出一处能直接从影像观察到的差异，不要先猜原因。</li>
        <li>这处差异是地表变化，还是云、光照或影像质量造成的？你需要什么补充证据？</li>
        <li>如果要说明一个地理过程，至少还需要比较几个日期？</li>
      </ol>
    </div>

    <!-- 教学四要素机理与连贯性面板 -->
    <ModelPedagogyPanel
      theme="meteorology"
      :observe="pedagogy.observe"
      :change="pedagogy.change"
      :mechanism="pedagogy.mechanism"
      :limitations="pedagogy.limitations"
      :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第二章', section: '第一节' }"
      practice-link="/practice"
      @reset="split = 50"
    />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ModelPedagogyPanel from '../experiments/components/ModelPedagogyPanel.vue'

const pedagogy = {
  observe: [
    '不同日期同一地点的下垫面颜色、纹理与云层覆盖范围变化。',
    '积雪线消融退缩、大型湖泊湿地丰枯水位变化与农田植被季节性变绿。',
    '辨别真实地表变化与假象：云层阴影、传感器曝光差异与卫星扫描数据条带缺口。',
  ],
  change: [
    '选择不同地理区域（中国东部季风区、亚马孙平原雨林、喜马拉雅高山积雪、洞庭湖水体涨落）。',
    '选择两天的对比日期（支持 2000 年至今每日 NASA MODIS Terra 卫星实测影像）。',
    '左右拖动分屏对比卷帘滑杆。',
  ],
  mechanism: [
    '卫星传感器记录地表对太阳辐射的反射光谱（红、绿、蓝波段真彩色合成）。',
    '季节性水热变动驱动地表物候与水文循环：夏季气温升高导致高山积雪融化；雨带北移促成河湖水量暴涨。',
  ],
  limitations: [
    '光学卫星无法穿透浓密厚云，云层下方的地表信息缺失。',
    'MODIS Terra 空间分辨率约为 250 米至 1 公里，仅适合区域宏观观察，无法分辨单栋建筑或细小溪流。',
  ],
}

const places = [
  { id: 'china', name: '中国东部 · 云与地表', center: [112, 31], zoom: 4 },
  { id: 'amazon', name: '亚马孙 · 森林与河流', center: [-62, -4], zoom: 5 },
  { id: 'himalaya', name: '喜马拉雅 · 山地与积雪', center: [86.9, 28], zoom: 6 },
]
const placeId = ref('china')
const dateA = ref('2024-06-01')
const dateB = ref('2024-06-15')
const today = new Date().toISOString().slice(0, 10)
const split = ref(50)
const mapAEl = ref(null)
const mapBEl = ref(null)
const mapError = ref('')
let mapA
let mapB
let syncing = false
const place = computed(() => places.find(item => item.id === placeId.value) || places[0])

function tileUrl(date) {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`
}

function createMap(container, date) {
  const map = new Map({
    container,
    attributionControl: true,
    style: {
      version: 8,
      sources: { nasa: { type: 'raster', tiles: [tileUrl(date)], tileSize: 256, attribution: 'NASA ESDIS GIBS' } },
      layers: [{ id: 'nasa', type: 'raster', source: 'nasa', minzoom: 0, maxzoom: 9 }],
    },
    center: place.value.center,
    zoom: place.value.zoom,
    minZoom: 1,
    maxZoom: 9,
  })
  map.on('error', () => { mapError.value = '影像暂时无法加载，请稍后重试或换一个日期。' })
  return map
}

function sync(source, target) {
  if (syncing) return
  syncing = true
  target.jumpTo({ center: source.getCenter(), zoom: source.getZoom(), bearing: source.getBearing(), pitch: source.getPitch() })
  syncing = false
}

function renderMaps() {
  if (!mapAEl.value || !mapBEl.value) return
  if (!dateA.value || !dateB.value || dateA.value > today || dateB.value > today) {
    mapError.value = '请选择不晚于今天的有效日期。'
    return
  }
  mapError.value = ''
  mapA?.remove()
  mapB?.remove()
  mapA = createMap(mapAEl.value, dateA.value)
  mapB = createMap(mapBEl.value, dateB.value)
  mapA.on('move', () => sync(mapA, mapB))
  mapB.on('move', () => sync(mapB, mapA))
}

onMounted(renderMaps)
onBeforeUnmount(() => { mapA?.remove(); mapB?.remove() })
</script>

<style scoped>
.lab-page{max-width:1180px;margin:auto;padding:46px 24px 90px;color:var(--text)}.lab-intro{max-width:760px}.back{font-size:14px;color:var(--geo-ocean);font-weight:700;text-decoration:none}.eyebrow{margin:28px 0 8px;color:var(--geo-ocean);font-size:12px;letter-spacing:.16em;font-weight:700}.lab-intro h1{font-size:clamp(32px,5vw,54px);margin:0 0 12px;color:var(--geo-ocean-deep);font-weight:800}.lab-intro p:last-child{line-height:1.8;color:var(--text-muted)}.controls{display:flex;flex-wrap:wrap;gap:14px;align-items:end;margin:32px 0 16px}.controls label{display:grid;gap:7px;font-size:13px;font-weight:700;color:var(--geo-ocean-deep)}.controls input,.controls select{min-height:42px;padding:0 14px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);color:var(--text)}.controls button{min-height:42px;padding:0 24px;border:0;border-radius:var(--radius-pill);background:var(--geo-ocean);color:white;cursor:pointer;font-weight:700;box-shadow:var(--geo-btn-primary-shadow);transition:var(--geo-btn-transition)}.controls button:hover{background:var(--geo-ocean-deep);transform:var(--geo-btn-elevate);box-shadow:var(--geo-btn-primary-hover-shadow)}.map-frame{height:min(64vw,590px);min-height:340px;position:relative;overflow:hidden;border-radius:var(--radius-box);background:#d6e0e5;border:1px solid var(--border);box-shadow:var(--shadow-md)}.map-pane{position:absolute;inset:0}.map-overlay{z-index:2;pointer-events:none}.divider{position:absolute;top:0;bottom:0;width:3px;background:white;z-index:4;pointer-events:none;box-shadow:0 0 12px rgba(0,0,0,0.5)}.map-tag{position:absolute;z-index:5;top:15px;padding:6px 12px;border-radius:var(--radius-pill);background:rgba(15,39,66,0.85);backdrop-filter:blur(6px);color:white;font-size:12px;font-weight:600;pointer-events:none;border:1px solid rgba(255,255,255,0.2)}.map-tag.left{left:16px}.map-tag.right{right:16px}.swipe{position:absolute;z-index:6;left:0;bottom:18px;width:calc(100% - 40px);margin:0 20px;accent-color:var(--geo-ocean)}.map-error{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:10;max-width:360px;padding:18px;background:var(--surface);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);border:1px solid var(--border)}.source{font-size:12px;line-height:1.7;color:var(--text-muted);margin-top:12px}.source a{color:var(--geo-ocean)}.questions{margin-top:40px;padding:26px 32px;border-radius:var(--radius-card);background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow-xs)}.questions h2{margin:0 0 12px;color:var(--geo-ocean-deep);font-size:20px;font-weight:700}.questions li{line-height:1.9;color:var(--text)}
</style>
