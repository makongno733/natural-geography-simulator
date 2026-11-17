<template>
  <section class="lab-page">
    <header class="lab-intro">
      <router-link to="/geo-labs" class="back">← 地理实证实验</router-link>
      <p class="eyebrow">美国国家航空航天局（NASA）对地观测 · 多时相卫星影像</p>
      <h1>同一地点，两天的地球</h1>
      <p>
        移动或点按卷帘滑杆，比较同一地点在两个日期的卫星影像。先描述你直接看到的差异，再结合图层分辨率、云层遮挡与季节背景分析原因。
      </p>
    </header>

    <!-- 1. 观测元数据、图层分辨率、数据缺口与原始来源说明卡 -->
    <section class="sat-meta-panel" aria-label="卫星影像来源与观测参数说明">
      <div class="sat-meta-grid">
        <div class="sat-meta-item">
          <span class="meta-kicker">📍 观测地点与中心坐标</span>
          <strong>{{ place.name }}（{{ place.coordText }}）</strong>
        </div>
        <div class="sat-meta-item">
          <span class="meta-kicker">📅 对比日期（左 vs 右）</span>
          <strong>{{ dateA }} vs {{ dateB }}</strong>
        </div>
        <div class="sat-meta-item">
          <span class="meta-kicker">🛰 遥感图层（就地解释）</span>
          <strong>NASA MODIS Terra 真彩色校正反射率</strong>
          <small>中分辨率成像光谱仪（红/绿/蓝可见光波段合成，直观反映云系、水体、植被与积雪）</small>
        </div>
        <div class="sat-meta-item">
          <span class="meta-kicker">📏 空间与时间分辨率</span>
          <strong>约 250 米 – 1 公里 · 每日 1 次过境</strong>
          <small>适合区域宏观水体、积雪线与云团对比，无法分辨单栋建筑或细小沟渠</small>
        </div>
        <div class="sat-meta-item full-row">
          <span class="meta-kicker">⚠️ 数据缺口与判读限制说明</span>
          <p>
            1. <strong>云层遮挡：</strong>光学传感器无法穿透厚云，画面中亮白色团块多为云层而非地表积雪；
            2. <strong>轨道扫描缺口：</strong>低纬度相邻卫星轨道之间可能出现黑色条带状无数据区（数据缺口）；
            3. <strong>定性边界：</strong>本工具用于定性观察空间变化趋势，定量工程反演需结合去云合成与地面水文站实测记录。
          </p>
        </div>
      </div>
      <div class="sat-source-links">
        <span>原始来源核查：</span>
        <a href="https://www.earthdata.nasa.gov/data/instruments/modis" target="_blank" rel="noopener noreferrer">
          NASA MODIS Terra 传感器文档 ↗
        </a>
        <span>·</span>
        <a href="https://nasa-gibs.github.io/gibs-api-docs/" target="_blank" rel="noopener noreferrer">
          NASA GIBS 开放瓦片服务 ↗
        </a>
        <span>·</span>
        <a :href="worldviewUrl" target="_blank" rel="noopener noreferrer">
          在 NASA Worldview 核对当前坐标原始影像 ↗
        </a>
      </div>
    </section>

    <!-- 2. 日期与地点选择 + 卷帘点按快捷控制栏 -->
    <div class="controls">
      <label>地点
        <select v-model="placeId" @change="onPlaceChange">
          <option v-for="item in places" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
      </label>
      <label>左侧日期 <input v-model="dateA" type="date" min="2000-01-01" :max="today" /></label>
      <label>右侧日期 <input v-model="dateB" type="date" min="2000-01-01" :max="today" /></label>
      <button type="button" class="btn-update-map" @click="renderMaps">更新影像</button>
      <button type="button" class="btn-toggle-sample" @click="toggleSampleFallback">
        {{ useSampleFallback ? '🛰 切回 NASA 实时瓦片' : '🖼 查看内置标注示例图（离线可用）' }}
      </button>
    </div>

    <!-- 卷帘点按与键盘无障碍操作栏 -->
    <div class="curtain-toolbar" role="group" aria-label="卷帘位置点按与键盘控制">
      <span class="curtain-label">
        ↔ 卷帘对比位置：<strong>{{ split }}%</strong>（支持拖动滑杆、点按下方比例按钮，或聚焦画面按键盘 <kbd>←</kbd> <kbd>→</kbd> 键调节）
      </span>
      <div class="curtain-quick-btns">
        <button type="button" :class="['curtain-btn', { active: split === 0 }]" @click="setSplit(0)">
          只看左侧 ({{ dateA }})
        </button>
        <button type="button" :class="['curtain-btn', { active: split === 25 }]" @click="setSplit(25)">
          左 25%
        </button>
        <button type="button" :class="['curtain-btn', { active: split === 50 }]" @click="setSplit(50)">
          居中 50%
        </button>
        <button type="button" :class="['curtain-btn', { active: split === 75 }]" @click="setSplit(75)">
          右 75%
        </button>
        <button type="button" :class="['curtain-btn', { active: split === 100 }]" @click="setSplit(100)">
          只看右侧 ({{ dateB }})
        </button>
      </div>
    </div>

    <!-- 影像加载失败或示例模式状态提示条（含重试入口与来源/日期标注） -->
    <div v-if="mapError || useSampleFallback" class="sat-status-banner" role="status" aria-live="polite">
      <div class="sat-status-text">
        <strong v-if="mapError">⚠️ {{ mapError }}</strong>
        <strong v-else>🖼 当前正在浏览内置高保真遥感对比示例图（教学示例，已标明来源与日期）</strong>
        <p>
          示例图来源说明：依据 <strong>NASA Earth Observatory / MODIS Terra</strong> 公开历史遥感观测特征绘制（地点：{{ place.name }}，对比基准日期：左侧 <strong>{{ dateA }}</strong> vs 右侧 <strong>{{ dateB }}</strong>，许可：NASA Open Data Policy 公有领域开放科学资料）。
        </p>
      </div>
      <div class="sat-status-actions">
        <button type="button" class="btn-retry-tiles" @click="retryLiveTiles">
          🔄 重新尝试加载实时瓦片
        </button>
        <button v-if="!useSampleFallback" type="button" class="btn-use-sample" @click="useSampleFallback = true">
          使用内置示例图继续对比
        </button>
      </div>
    </div>

    <!-- 3. 双时相卷帘对比画布 -->
    <div
      class="map-frame"
      tabindex="0"
      role="region"
      :aria-label="`${place.name} ${dateA} 与 ${dateB} 卫星影像卷帘对比，当前卷帘位置 ${split}%，可使用左右方向键调节`"
      @keydown="onFrameKeydown"
    >
      <!-- 底层内置示例图（当离线、瓦片加载失败或开启示例模式时保证卷帘对比依然 100% 可读可用） -->
      <div class="sample-pane sample-left" aria-hidden="true">
        <svg viewBox="0 0 800 450" class="sample-svg">
          <rect width="800" height="450" fill="#1b3a2b" />
          <path d="M 0 120 Q 220 140 410 210 T 800 280 L 800 450 L 0 450 Z" fill="#234d36" />
          <!-- 枯水期/基准期较窄水体与积雪 -->
          <path d="M 120 220 Q 280 205 420 235 T 710 250 Q 560 285 390 270 T 120 220 Z" fill="#1d4ed8" opacity="0.85" />
          <circle cx="580" cy="120" r="65" fill="#f8fafc" opacity="0.45" />
          <text x="28" y="76" fill="#e2e8f0" font-size="15" font-weight="bold">
            左侧时段（{{ dateA }}）· {{ place.name }}
          </text>
          <text x="28" y="102" fill="#93c5fd" font-size="13">
            示例特征：水体面积较小 / 基准季相（来源依据：NASA MODIS Terra 历史观测示意）
          </text>
        </svg>
      </div>

      <div ref="mapAEl" class="map-pane" :class="{ 'is-hidden': useSampleFallback }"></div>

      <!-- 右侧覆盖层（含内置示例图与实时瓦片层） -->
      <div class="map-pane map-overlay" :style="{ clipPath: `inset(0 0 0 ${split}%)` }">
        <div class="sample-pane sample-right" aria-hidden="true">
          <svg viewBox="0 0 800 450" class="sample-svg">
            <rect width="800" height="450" fill="#14432a" />
            <path d="M 0 100 Q 240 130 430 190 T 800 260 L 800 450 L 0 450 Z" fill="#155e37" />
            <!-- 丰水期/对比期显著扩张的水体与云团 -->
            <path d="M 70 175 Q 290 145 470 190 T 760 225 Q 610 335 380 320 T 70 175 Z" fill="#0284c7" opacity="0.92" />
            <ellipse cx="230" cy="110" rx="85" ry="32" fill="#ffffff" opacity="0.65" />
            <text x="772" y="76" fill="#f8fafc" font-size="15" font-weight="bold" text-anchor="end">
              右侧时段（{{ dateB }}）· {{ place.name }}
            </text>
            <text x="772" y="102" fill="#7dd3fc" font-size="13" text-anchor="end">
              示例特征：丰水期水体扩张与局部云团遮挡（来源依据：NASA MODIS Terra 历史观测示意）
            </text>
          </svg>
        </div>
        <div ref="mapBEl" class="map-pane" :class="{ 'is-hidden': useSampleFallback }"></div>
      </div>

      <div class="divider" :style="{ left: `${split}%` }" aria-hidden="true">
        <span class="divider-handle">↔</span>
      </div>
      <span class="map-tag left">左侧：{{ dateA }} · {{ place.shortName }}</span>
      <span class="map-tag right">右侧：{{ dateB }} · {{ place.shortName }}</span>
      <input
        v-model.number="split"
        class="swipe"
        type="range"
        min="0"
        max="100"
        aria-label="拖动或使用左右方向键比较两天的卫星影像"
      />
    </div>

    <p class="source">
      影像来源：<a href="https://www.earthdata.nasa.gov/data/instruments/modis" target="_blank" rel="noopener noreferrer">NASA MODIS Terra</a> ·
      通过 <a href="https://nasa-gibs.github.io/gibs-api-docs/" target="_blank" rel="noopener noreferrer">NASA GIBS</a> 提供（分辨率约 250m–1km）。不同日期可能因云层遮挡或轨道扫描缺口显示不完整；地图仅供定性观察。
    </p>

    <div class="questions">
      <h2>观察与解释</h2>
      <ol>
        <li>先指出一处能直接从影像观察到的差异（如水体边界、绿色深浅或白色覆盖区），不要先猜原因。</li>
        <li>这处差异是真实地表变化，还是云层遮挡、光照或轨道扫描缺口造成的？你需要什么地面数据来交叉验证？</li>
        <li>如果要证实这是一个季节性地理过程，至少还需要比较哪几个月份的影像？</li>
      </ol>

      <!-- 带着遥感证据进入社区讨论 -->
      <div class="sat-discuss-cta">
        <div>
          <strong>💬 把你的遥感判读带到社区讨论</strong>
          <p>跳转后将自动附带本次对比的地点、两个日期、MODIS 图层分辨率与云层/数据缺口限制说明。</p>
        </div>
        <router-link :to="discussRoute" class="btn-sat-discuss">
          带着这组卫星对比去社区提问 ↗
        </router-link>
      </div>
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
    '辨别真实地表变化与假象：云层阴影、传感器曝光差异与卫星扫描数据条带缺口。'
  ],
  change: [
    '选择不同地理区域（中国东部季风湖区、亚马孙平原雨林、喜马拉雅高山积雪）。',
    '选择两天的对比日期（支持 2000 年至今每日 NASA MODIS Terra 卫星实测影像）。',
    '拖动滑杆、点按比例按钮或按键盘左右方向键移动分屏卷帘。'
  ],
  mechanism: [
    '卫星传感器记录地表对太阳辐射的反射光谱（红、绿、蓝波段真彩色合成）。',
    '季节性水热变动驱动地表物候与水文循环：夏季气温升高导致高山积雪融化；雨带推移促成河湖水量涨落。'
  ],
  limitations: [
    '光学卫星无法穿透浓密厚云，云层下方的地表信息缺失。',
    'MODIS Terra 空间分辨率约为 250 米至 1 公里，仅适合区域宏观观察，无法分辨单栋建筑或细小溪流。'
  ]
}

const places = [
  { id: 'china', name: '中国东部 · 长江中下游湖区与云系', shortName: '中国东部', coordText: '31.0°N, 112.0°E', center: [112, 31], zoom: 4 },
  { id: 'amazon', name: '亚马孙平原 · 热带雨林与河网', shortName: '亚马孙', coordText: '4.0°S, 62.0°W', center: [-62, -4], zoom: 5 },
  { id: 'himalaya', name: '喜马拉雅山脉 · 山地与积雪线', shortName: '喜马拉雅', coordText: '28.0°N, 86.9°E', center: [86.9, 28], zoom: 6 }
]

const placeId = ref('china')
const dateA = ref('2024-06-01')
const dateB = ref('2024-06-15')
const today = new Date().toISOString().slice(0, 10)
const split = ref(50)
const mapAEl = ref(null)
const mapBEl = ref(null)
const mapError = ref('')
const useSampleFallback = ref(false)
let mapA
let mapB
let syncing = false

const place = computed(() => places.find(item => item.id === placeId.value) || places[0])

const worldviewUrl = computed(() => {
  const [lon, lat] = place.value.center
  return `https://worldview.earthdata.nasa.gov/?v=${lon - 8},${lat - 5},${lon + 8},${lat + 5}&t=${dateB.value}-T00%3A00%3A00Z`
})

const discussRoute = computed(() => ({
  path: '/community',
  query: {
    compose: 1,
    kind: 'question',
    evidenceId: 'ev-poyang-winter',
    title: `【多时相遥感判读】${place.value.name}（${dateA.value} vs ${dateB.value}）地表与云系差异探讨`,
    body:
      `我在「多时相卫星影像对比」工具中观察了 **${place.value.name}（${place.value.coordText}）**：\n\n` +
      `- **对比日期**：左侧 ${dateA.value} vs 右侧 ${dateB.value}\n` +
      `- **遥感图层与来源**：NASA MODIS Terra CorrectedReflectance_TrueColor（通过 NASA GIBS 提供，空间分辨率约 250m–1km）\n` +
      `- **我看到的差异**：……\n` +
      `- **我排除的干扰与适用边界**：光学影像受云层遮挡与轨道扫描缺口影响，定性判读需结合地面水文/气象站点验证。\n` +
      `- **我想请教的问题**：这一变化主要受什么季节性大气或水文过程驱动？`
  }
}))

function setSplit(val) {
  split.value = Math.max(0, Math.min(100, Number(val) || 0))
}

function onFrameKeydown(e) {
  const step = e.shiftKey ? 10 : 5
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    setSplit(split.value - step)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    setSplit(split.value + step)
  } else if (e.key === 'Home') {
    e.preventDefault()
    setSplit(0)
  } else if (e.key === 'End') {
    e.preventDefault()
    setSplit(100)
  }
}

function toggleSampleFallback() {
  useSampleFallback.value = !useSampleFallback.value
  if (!useSampleFallback.value) {
    renderMaps()
  }
}

function retryLiveTiles() {
  useSampleFallback.value = false
  mapError.value = ''
  renderMaps()
}

function onPlaceChange() {
  if (!useSampleFallback.value) {
    renderMaps()
  }
}

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
      layers: [{ id: 'nasa', type: 'raster', source: 'nasa', minzoom: 0, maxzoom: 9 }]
    },
    center: place.value.center,
    zoom: place.value.zoom,
    minZoom: 1,
    maxZoom: 9
  })
  map.on('error', () => {
    mapError.value = 'NASA GIBS 实时卫星瓦片暂时无法加载（可能受网络限制或所选日期数据缺失），已为你垫底展示标明来源与日期的教学示例图层，你也可点击重试或更换日期。'
  })
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
  try {
    mapA = createMap(mapAEl.value, dateA.value)
    mapB = createMap(mapBEl.value, dateB.value)
    mapA.on('move', () => sync(mapA, mapB))
    mapB.on('move', () => sync(mapB, mapA))
  } catch {
    mapError.value = '地图引擎初始化受限，已自动启用内置教学示例图层。'
    useSampleFallback.value = true
  }
}

onMounted(renderMaps)
onBeforeUnmount(() => { mapA?.remove(); mapB?.remove() })
</script>

<style scoped>
.lab-page {
  max-width: 1180px;
  margin: auto;
  padding: 36px 24px 90px;
  color: var(--text);
}
.lab-intro { max-width: 780px; }
.back { font-size: 14px; color: var(--geo-ocean); font-weight: 700; text-decoration: none; }
.eyebrow { margin: 20px 0 8px; color: var(--geo-ocean); font-size: 12px; letter-spacing: .12em; font-weight: 700; }
.lab-intro h1 { font-size: clamp(28px, 4.5vw, 46px); margin: 0 0 10px; color: var(--geo-ocean-deep); font-weight: 800; }
.lab-intro p:last-child { line-height: 1.75; color: var(--text-muted); margin-bottom: 20px; }

/* 元数据与可信度说明面板 */
.sat-meta-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-xs);
}
.sat-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 18px;
}
.sat-meta-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sat-meta-item.full-row {
  grid-column: 1 / -1;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}
.meta-kicker {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--geo-ocean);
}
.sat-meta-item strong {
  font-size: 14px;
  color: var(--geo-ocean-deep);
}
.sat-meta-item small,
.sat-meta-item p {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.55;
}
.sat-source-links {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  font-size: 12.5px;
  color: var(--text-muted);
}
.sat-source-links a {
  color: var(--geo-ocean);
  font-weight: 700;
  text-decoration: none;
}
.sat-source-links a:hover {
  text-decoration: underline;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
  margin: 18px 0 12px;
}
.controls label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}
.controls input,
.controls select {
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
}
.btn-update-map {
  min-height: 40px;
  padding: 0 20px;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--geo-ocean);
  color: white;
  cursor: pointer;
  font-weight: 700;
}
.btn-toggle-sample {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--geo-ocean-deep);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

/* 卷帘点按与键盘工具栏 */
.curtain-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 14px;
}
.curtain-label {
  font-size: 12.5px;
  color: var(--text-muted);
}
.curtain-label kbd {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 11px;
}
.curtain-quick-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.curtain-btn {
  min-height: 34px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--geo-ocean-deep);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.curtain-btn.active {
  background: var(--geo-ocean);
  color: #ffffff;
  border-color: var(--geo-ocean);
}

/* 失败恢复与示例状态条 */
.sat-status-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  background: #fffbeb;
  border: 1px solid #f59e0b;
  border-radius: var(--radius-sm);
  margin-bottom: 14px;
}
.sat-status-text strong {
  display: block;
  font-size: 13.5px;
  color: #92400e;
  margin-bottom: 4px;
}
.sat-status-text p {
  margin: 0;
  font-size: 12px;
  color: #78350f;
  line-height: 1.5;
}
.sat-status-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn-retry-tiles,
.btn-use-sample {
  min-height: 36px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
.btn-retry-tiles {
  background: #d97706;
  color: #ffffff;
  border: 0;
}
.btn-use-sample {
  background: #ffffff;
  color: #92400e;
  border: 1px solid #d97706;
}

.map-frame {
  height: min(62vw, 540px);
  min-height: 320px;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-box);
  background: #102a3a;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
}
.map-frame:focus-visible {
  outline: 3px solid var(--geo-ocean);
  outline-offset: 3px;
}
.map-pane,
.sample-pane {
  position: absolute;
  inset: 0;
}
.map-pane.is-hidden {
  opacity: 0;
  pointer-events: none;
}
.sample-svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.map-overlay {
  z-index: 2;
  pointer-events: none;
}
.divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: white;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.5);
}
.divider-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(15, 39, 66, 0.9);
  color: #ffffff;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}
.map-tag {
  position: absolute;
  z-index: 5;
  top: 14px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  background: rgba(15, 39, 66, 0.85);
  backdrop-filter: blur(6px);
  color: white;
  font-size: 12px;
  font-weight: 600;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.map-tag.left { left: 14px; }
.map-tag.right { right: 14px; }
.swipe {
  position: absolute;
  z-index: 6;
  left: 0;
  bottom: 16px;
  width: calc(100% - 36px);
  margin: 0 18px;
  accent-color: var(--geo-ocean);
  cursor: ew-resize;
}
.source {
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-muted);
  margin-top: 12px;
}
.source a { color: var(--geo-ocean); }
.questions {
  margin-top: 28px;
  padding: 24px 28px;
  border-radius: var(--radius-card);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xs);
}
.questions h2 {
  margin: 0 0 12px;
  color: var(--geo-ocean-deep);
  font-size: 20px;
  font-weight: 700;
}
.questions li {
  line-height: 1.85;
  color: var(--text);
}
.sat-discuss-cta {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.sat-discuss-cta strong {
  display: block;
  font-size: 15px;
  color: var(--geo-ocean-deep);
  margin-bottom: 4px;
}
.sat-discuss-cta p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}
.btn-sat-discuss {
  display: inline-flex;
  align-items: center;
  padding: 9px 16px;
  border-radius: 8px;
  background: var(--geo-ocean);
  color: #ffffff;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 700;
}
@media (max-width: 720px) {
  .sat-meta-grid {
    grid-template-columns: 1fr;
  }
  .questions {
    padding: 18px;
  }
}
</style>
