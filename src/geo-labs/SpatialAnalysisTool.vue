<template>
  <div class="spatial-tool-panel baroque-frame">
    <div class="tool-head">
      <div class="tool-title-row">
        <span class="baroque-gem">🌐</span>
        <h3>GIS 空间大地测量与曲率分析</h3>
      </div>
      <p class="tool-subtitle">WGS-84 大圆航线真实测距、多边形球面面积反演与墨卡托投影形变校验</p>
    </div>

    <!-- 功能切换标签 -->
    <div class="tool-tabs">
      <button
        type="button"
        class="tool-tab-btn"
        :class="{ active: currentTab === 'distance' }"
        @click="currentTab = 'distance'"
      >
        大圆航线与大地球面测距
      </button>
      <button
        type="button"
        class="tool-tab-btn"
        :class="{ active: currentTab === 'area' }"
        @click="currentTab = 'area'"
      >
        球面区域面积与投影形变
      </button>
      <button
        type="button"
        class="tool-tab-btn"
        :class="{ active: currentTab === 'buffer' }"
        @click="currentTab = 'buffer'"
      >
        地理空间缓冲区 (Buffer)
      </button>
    </div>

    <!-- 1. 测距面板 -->
    <div v-if="currentTab === 'distance'" class="tool-content">
      <div class="preset-city-row">
        <span class="preset-label">典型地学航线预设：</span>
        <button
          v-for="p in distancePresets"
          :key="p.name"
          type="button"
          class="preset-chip"
          @click="applyDistancePreset(p)"
        >
          {{ p.name }}
        </button>
      </div>

      <div class="coord-inputs-grid">
        <div class="coord-col">
          <label class="coord-label">起点坐标 (经度 E, 纬度 N)</label>
          <div class="input-pair">
            <input v-model.number="distForm.lng1" type="number" step="0.01" min="-180" max="180" placeholder="经度" />
            <input v-model.number="distForm.lat1" type="number" step="0.01" min="-90" max="90" placeholder="纬度" />
          </div>
          <small class="coord-tip">{{ distForm.name1 }}</small>
        </div>

        <div class="coord-col">
          <label class="coord-label">终点坐标 (经度 E, 纬度 N)</label>
          <div class="input-pair">
            <input v-model.number="distForm.lng2" type="number" step="0.01" min="-180" max="180" placeholder="经度" />
            <input v-model.number="distForm.lat2" type="number" step="0.01" min="-90" max="90" placeholder="纬度" />
          </div>
          <small class="coord-tip">{{ distForm.name2 }}</small>
        </div>
      </div>

      <div class="analysis-result-card">
        <div class="result-metric">
          <span class="metric-label">地球曲面真实大圆航程 (Great Circle)</span>
          <span class="metric-value highlight">{{ measuredDistance.toFixed(1) }} <small>千米 (km)</small></span>
        </div>
        <div class="result-metric">
          <span class="metric-label">起飞初始航向角 (True Bearing)</span>
          <span class="metric-value">{{ measuredBearing.toFixed(1) }}° <small>(顺时针正北基准)</small></span>
        </div>
        <div class="result-note">
          <strong>大地测量学原理：</strong>
          大圆航线是地球表面两点间的最短弧长。在常规平面航海图（墨卡托投影）上表现为一条向上凸起的曲线，实际飞行节省大量里程。
        </div>
      </div>
    </div>

    <!-- 2. 面积与投影形变面板 -->
    <div v-if="currentTab === 'area'" class="tool-content">
      <div class="preset-city-row">
        <span class="preset-label">典型地学多边形区域：</span>
        <button
          v-for="p in areaPresets"
          :key="p.name"
          type="button"
          class="preset-chip"
          @click="applyAreaPreset(p)"
        >
          {{ p.name }}
        </button>
      </div>

      <div class="analysis-result-card">
        <div class="result-metric">
          <span class="metric-label">当前区域真实球面面积 (Spherical Excess)</span>
          <span class="metric-value highlight">{{ measuredArea.toFixed(1) }} <small>平方公里 (km²)</small></span>
        </div>
        <div class="result-metric">
          <span class="metric-label">墨卡托高纬平面视觉夸大倍率</span>
          <span class="metric-value warning">{{ areaDistortion.areaFactor }} <small>倍</small></span>
        </div>
        <div class="result-note">
          <strong>投影形变警示：</strong>
          {{ areaDistortion.description }}
        </div>
      </div>
    </div>

    <!-- 3. 缓冲区面板 -->
    <div v-if="currentTab === 'buffer'" class="tool-content">
      <div class="buffer-control-row">
        <label class="buffer-label">
          中心观测台站：<strong>青藏高原纳木错综合观测站 (90.98°E, 30.77°N)</strong>
        </label>
        <div class="range-row">
          <span>缓冲分析半径：<strong>{{ bufferRadius }} km</strong></span>
          <input v-model.number="bufferRadius" type="range" min="10" max="300" step="10" />
        </div>
      </div>

      <div class="analysis-result-card">
        <div class="result-metric">
          <span class="metric-label">实测缓冲区地表面积</span>
          <span class="metric-value highlight">{{ (Math.PI * bufferRadius * bufferRadius).toFixed(0) }} <small>km²</small></span>
        </div>
        <div class="result-note">
          <strong>生态红线与科学保护：</strong>
          空间缓冲区用于评估台站观测辐射半径、生态红线保护范围或地质灾害应急响应圈层。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import {
  calculateGreatCircleDistance,
  calculateInitialBearing,
  calculateSphericalArea,
  getMercatorDistortionRatio
} from '../utils/geoSpatialAnalysis.js'

const currentTab = ref('distance')

// 航线预设
const distancePresets = [
  { name: '北京 → 伦敦 (跨越亚欧)', lng1: 116.4, lat1: 39.9, name1: '北京首都国际机场', lng2: -0.12, lat2: 51.5, name2: '伦敦希思罗机场' },
  { name: '上海 → 旧金山 (跨太平洋)', lng1: 121.47, lat1: 31.23, name1: '上海浦东', lng2: -122.42, lat2: 37.77, name2: '旧金山国际机场' },
  { name: '拉萨 → 成都 (横断山脉)', lng1: 91.12, lat1: 29.65, name1: '拉萨贡嘎', lng2: 104.06, lat2: 30.67, name2: '成都双流' }
]

const distForm = reactive({
  lng1: 116.4,
  lat1: 39.9,
  name1: '北京',
  lng2: -0.12,
  lat2: 51.5,
  name2: '伦敦'
})

function applyDistancePreset(p) {
  distForm.lng1 = p.lng1
  distForm.lat1 = p.lat1
  distForm.name1 = p.name1
  distForm.lng2 = p.lng2
  distForm.lat2 = p.lat2
  distForm.name2 = p.name2
}

const measuredDistance = computed(() => {
  return calculateGreatCircleDistance([distForm.lng1, distForm.lat1], [distForm.lng2, distForm.lat2])
})

const measuredBearing = computed(() => {
  return calculateInitialBearing([distForm.lng1, distForm.lat1], [distForm.lng2, distForm.lat2])
})

// 多边形面积预设
const areaPresets = [
  {
    name: '青海湖 (中国最大内陆咸水湖)',
    lat: 36.9,
    coords: [
      [99.6, 36.5],
      [100.8, 36.6],
      [100.7, 37.2],
      [99.8, 37.1]
    ]
  },
  {
    name: '鄱阳湖湿地核心保护区',
    lat: 29.1,
    coords: [
      [116.0, 28.8],
      [116.6, 28.9],
      [116.5, 29.4],
      [115.9, 29.3]
    ]
  },
  {
    name: '格陵兰岛高纬参照测试区',
    lat: 72.0,
    coords: [
      [-45.0, 68.0],
      [-30.0, 69.0],
      [-32.0, 75.0],
      [-48.0, 74.0]
    ]
  }
]

const selectedArea = ref(areaPresets[0])

function applyAreaPreset(p) {
  selectedArea.value = p
}

const measuredArea = computed(() => {
  return calculateSphericalArea(selectedArea.value.coords)
})

const areaDistortion = computed(() => {
  return getMercatorDistortionRatio(selectedArea.value.lat)
})

// 缓冲区
const bufferRadius = ref(50)
</script>

<style scoped>
.spatial-tool-panel {
  padding: 24px 28px;
  background: var(--surface);
  border: 1px solid var(--baroque-border-gold);
  border-radius: var(--radius-box);
  margin-top: 24px;
  box-shadow: 0 4px 16px rgba(15, 39, 66, 0.06);
}

.tool-head {
  margin-bottom: 20px;
}

.tool-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tool-title-row h3 {
  margin: 0;
  font-size: 20px;
  color: var(--geo-ocean-deep);
  font-family: Georgia, 'Playfair Display', 'Songti SC', serif;
}

.tool-subtitle {
  font-size: 13.5px;
  color: var(--text-muted);
  margin: 4px 0 0;
}

.tool-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
  flex-wrap: wrap;
}

.tool-tab-btn {
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tool-tab-btn:hover {
  border-color: var(--baroque-bronze);
  color: var(--text);
}

.tool-tab-btn.active {
  background: var(--geo-ocean-deep);
  color: #f7f9fa;
  border-color: var(--baroque-bronze);
}

.preset-city-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.preset-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-faint);
}

.preset-chip {
  padding: 3px 10px;
  background: #f1f5f9;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 12px;
  color: var(--geo-ocean);
  cursor: pointer;
  transition: all 0.12s ease;
}

.preset-chip:hover {
  background: var(--geo-ocean-surface);
  border-color: var(--baroque-bronze);
}

.coord-inputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.coord-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.coord-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.input-pair {
  display: flex;
  gap: 8px;
}

.input-pair input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 13.5px;
}

.input-pair input:focus {
  outline: none;
  border-color: var(--baroque-bronze);
}

.coord-tip {
  font-size: 11.5px;
  color: var(--text-faint);
}

.analysis-result-card {
  padding: 20px 22px;
  background: #fcfbf8;
  border: 1px dashed var(--baroque-border-gold);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-metric {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: 8px;
}

.metric-label {
  font-size: 13.5px;
  color: var(--text-muted);
}

.metric-value {
  font-size: 20px;
  font-weight: 800;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: var(--geo-ocean-deep);
}

.metric-value.highlight {
  color: #c5a059;
}

.metric-value.warning {
  color: #c86446;
}

.result-note {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-muted);
  background: rgba(197, 160, 89, 0.08);
  padding: 10px 14px;
  border-radius: 4px;
}

.buffer-control-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.range-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13.5px;
}

.range-row input[type="range"] {
  flex: 1;
}

@media (max-width: 680px) {
  .coord-inputs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
