<template>
  <div class="climate-lab-container baroque-frame">
    <header class="climate-header">
      <span class="climate-badge">CLIMATOLOGY EVIDENCE / 气候科学分析</span>
      <h2>典型气候类型气温降水图与多区域对比分析</h2>
      <p class="climate-lead">
        根据世界气象组织 (WMO) 与中国气象科学数据，对比全球典型气候带的气温年变化曲线与降水柱状图，判读气候特征与成因机制。
      </p>
    </header>

    <!-- 台站与对比选择器 -->
    <div class="climate-selectors-row">
      <div class="station-select-box">
        <label>目标观测地 A：</label>
        <select v-model="stationAId" class="station-select">
          <option v-for="s in stations" :key="s.id" :value="s.id">
            {{ s.name }} ({{ s.climateType }})
          </option>
        </select>
      </div>

      <div class="station-select-box">
        <label>对比观测地 B (可选)：</label>
        <select v-model="stationBId" class="station-select">
          <option value="">-- 不进行对比 (单站精细视图) --</option>
          <option v-for="s in stations.filter(item => item.id !== stationAId)" :key="s.id" :value="s.id">
            {{ s.name }} ({{ s.climateType }})
          </option>
        </select>
      </div>
    </div>

    <!-- 气温与降水双轴 SVG 图表 -->
    <div class="chart-canvas-card">
      <div class="chart-title-bar">
        <h3>{{ stationA.name }} {{ stationB ? `与 ${stationB.name}` : '' }} 气温与降水量月分布图</h3>
        <div class="chart-legend">
          <span class="legend-item"><span class="legend-bar bar-a"></span>{{ stationA.name }} 降水 (mm)</span>
          <span class="legend-item"><span class="legend-line line-a"></span>{{ stationA.name }} 气温 (°C)</span>
          <template v-if="stationB">
            <span class="legend-item"><span class="legend-bar bar-b"></span>{{ stationB.name }} 降水 (mm)</span>
            <span class="legend-item"><span class="legend-line line-b"></span>{{ stationB.name }} 气温 (°C)</span>
          </template>
        </div>
      </div>

      <!-- SVG 矢量高保真渲染 -->
      <div class="svg-wrapper">
        <svg viewBox="0 0 760 380" class="climate-svg" role="img" aria-label="气温与降水双轴图表">
          <!-- 背景网格与轴线 -->
          <g class="grid-lines" opacity="0.35">
            <line v-for="y in 6" :key="y" x1="60" :y1="40 + (y - 1) * 50" x2="700" :y2="40 + (y - 1) * 50" stroke="#cbd5e1" stroke-dasharray="3 3" />
          </g>

          <!-- 左侧降水 Y 轴 (0 ~ 300 mm) -->
          <g class="axis-y-left" font-size="11" fill="#4e6074">
            <text x="50" y="45" text-anchor="end">300 mm</text>
            <text x="50" y="95" text-anchor="end">240 mm</text>
            <text x="50" y="145" text-anchor="end">180 mm</text>
            <text x="50" y="195" text-anchor="end">120 mm</text>
            <text x="50" y="245" text-anchor="end">60 mm</text>
            <text x="50" y="295" text-anchor="end">0 mm</text>
          </g>

          <!-- 右侧气温 Y 轴 (-30 ~ +40 °C) -->
          <g class="axis-y-right" font-size="11" fill="#e27d60">
            <text x="710" y="45" text-anchor="start">+40 °C</text>
            <text x="710" y="105" text-anchor="start">+25 °C</text>
            <text x="710" y="165" text-anchor="start">+10 °C</text>
            <text x="710" y="225" text-anchor="start">-5 °C</text>
            <text x="710" y="295" text-anchor="start">-20 °C</text>
          </g>

          <!-- X 轴月份 (1 ~ 12 月) -->
          <g class="axis-x" font-size="12" fill="#172433" font-weight="600">
            <text v-for="(m, i) in 12" :key="m" :x="85 + i * 52" y="320" text-anchor="middle">
              {{ m }}月
            </text>
          </g>

          <!-- 降水柱状图 A -->
          <g class="bars-a">
            <rect
              v-for="(p, i) in stationA.precip"
              :key="i"
              :x="stationB ? 70 + i * 52 : 75 + i * 52"
              :y="290 - (p / 300) * 250"
              :width="stationB ? 14 : 22"
              :height="Math.max(2, (p / 300) * 250)"
              fill="#245d92"
              opacity="0.82"
              rx="2"
            >
              <title>{{ stationA.name }} {{ i + 1 }}月降水: {{ p }} mm</title>
            </rect>
          </g>

          <!-- 降水柱状图 B (若存在) -->
          <g v-if="stationB" class="bars-b">
            <rect
              v-for="(p, i) in stationB.precip"
              :key="i"
              :x="86 + i * 52"
              :y="290 - (p / 300) * 250"
              width="14"
              :height="Math.max(2, (p / 300) * 250)"
              fill="#52b788"
              opacity="0.82"
              rx="2"
            >
              <title>{{ stationB.name }} {{ i + 1 }}月降水: {{ p }} mm</title>
            </rect>
          </g>

          <!-- 气温曲线折线 A -->
          <path
            :d="generateTempPath(stationA.temp)"
            fill="none"
            stroke="#c86446"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            v-for="(t, i) in stationA.temp"
            :key="`ta-${i}`"
            :cx="85 + i * 52"
            :cy="tempToY(t)"
            r="4"
            fill="#c86446"
            stroke="#ffffff"
            stroke-width="1.5"
          >
            <title>{{ stationA.name }} {{ i + 1 }}月气温: {{ t }} °C</title>
          </circle>

          <!-- 气温曲线折线 B (若存在) -->
          <template v-if="stationB">
            <path
              :d="generateTempPath(stationB.temp)"
              fill="none"
              stroke="#d8b773"
              stroke-width="3"
              stroke-dasharray="4 2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              v-for="(t, i) in stationB.temp"
              :key="`tb-${i}`"
              :cx="85 + i * 52"
              :cy="tempToY(t)"
              r="4"
              fill="#d8b773"
              stroke="#ffffff"
              stroke-width="1.5"
            >
              <title>{{ stationB.name }} {{ i + 1 }}月气温: {{ t }} °C</title>
            </circle>
          </template>
        </svg>
      </div>

      <div class="chart-caption">
        <span>数据基准：30年气候标准态 (1991–2020) 统计平均值 · 投影基准无形变</span>
      </div>
    </div>

    <!-- 气候成因与指标量化解说卡片 -->
    <div class="climate-interpretation-grid">
      <article class="interp-card">
        <div class="card-head">
          <span class="city-tag">{{ stationA.name }}</span>
          <h4>{{ stationA.climateType }} ({{ stationA.koppen }})</h4>
        </div>
        <div class="stat-metrics-row">
          <div><small>年平均气温</small><strong>{{ stationA.avgTemp }} °C</strong></div>
          <div><small>年降水量</small><strong>{{ stationA.annualPrecip }} mm</strong></div>
          <div><small>最冷月 / 最热月</small><strong>{{ stationA.coldest }} / {{ stationA.warmest }} °C</strong></div>
        </div>
        <p class="interp-desc"><strong>成因与特征：</strong>{{ stationA.mechanism }}</p>
      </article>

      <article v-if="stationB" class="interp-card">
        <div class="card-head">
          <span class="city-tag tag-b">{{ stationB.name }}</span>
          <h4>{{ stationB.climateType }} ({{ stationB.koppen }})</h4>
        </div>
        <div class="stat-metrics-row">
          <div><small>年平均气温</small><strong>{{ stationB.avgTemp }} °C</strong></div>
          <div><small>年降水量</small><strong>{{ stationB.annualPrecip }} mm</strong></div>
          <div><small>最冷月 / 最热月</small><strong>{{ stationB.coldest }} / {{ stationB.warmest }} °C</strong></div>
        </div>
        <p class="interp-desc"><strong>成因与特征：</strong>{{ stationB.mechanism }}</p>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const stations = [
  {
    id: 'beijing',
    name: '北京 (中国北方季风区)',
    climateType: '温带季风气候',
    koppen: 'Dwa',
    avgTemp: 12.8,
    annualPrecip: 572,
    coldest: -3.1,
    warmest: 26.7,
    temp: [-3.1, 0.3, 7.2, 15.1, 21.0, 25.1, 26.7, 25.5, 20.6, 13.5, 5.0, -1.2],
    precip: [3, 6, 10, 22, 38, 76, 172, 148, 54, 26, 12, 3],
    mechanism: '海陆热力性质差异显著。夏季受来自海洋的东南季风影响，高温多雨；冬季受来自西伯利亚-蒙古高压的西北季风控制，寒冷干燥。'
  },
  {
    id: 'rome',
    name: '罗马 (地中海沿岸)',
    climateType: '地中海气候',
    koppen: 'Csa',
    avgTemp: 15.7,
    annualPrecip: 798,
    coldest: 7.5,
    warmest: 24.6,
    temp: [7.5, 8.2, 11.0, 14.0, 18.5, 22.5, 24.6, 24.5, 21.0, 16.8, 12.0, 8.5],
    precip: [67, 73, 58, 65, 48, 34, 19, 28, 68, 115, 118, 105],
    mechanism: '受副热带高气压带与盛行西风带交替控制。夏季副热带高压北移下沉气流控制，干热少雨；冬季西风带南移带来大西洋暖湿气流，温和多雨。'
  },
  {
    id: 'london',
    name: '伦敦 (西欧温带海洋区)',
    climateType: '温带海洋性气候',
    koppen: 'Cfb',
    avgTemp: 11.3,
    annualPrecip: 602,
    coldest: 5.2,
    warmest: 19.0,
    temp: [5.2, 5.8, 8.2, 10.9, 14.3, 17.4, 19.0, 18.7, 15.8, 12.0, 8.1, 5.7],
    precip: [55, 41, 42, 44, 49, 45, 45, 49, 52, 62, 59, 59],
    mechanism: '终年盛行来自大西洋的盛行西风，沿岸受北大西洋暖流增温增湿作用显著。气温年较差小，各月降水分配均匀，多阴雨天气。'
  },
  {
    id: 'singapore',
    name: '新加坡 (赤道雨林区)',
    climateType: '热带雨林气候',
    koppen: 'Af',
    avgTemp: 27.5,
    annualPrecip: 2160,
    coldest: 26.8,
    warmest: 28.2,
    temp: [26.8, 27.3, 27.8, 28.2, 28.3, 28.1, 27.9, 27.8, 27.6, 27.5, 27.1, 26.8],
    precip: [230, 160, 170, 165, 170, 130, 150, 150, 160, 170, 250, 255],
    mechanism: '终年处于赤道低气压带控制之下，盛行强烈的赤道对流上升气流，全年皆夏，年温差不足2°C，降水丰沛且多对流雨。'
  }
]

const stationAId = ref('beijing')
const stationBId = ref('rome')

const stationA = computed(() => stations.find(s => s.id === stationAId.value) || stations[0])
const stationB = computed(() => (stationBId.value ? stations.find(s => s.id === stationBId.value) : null))

// 气温 Y 轴映射 (-20°C ~ +40°C -> 290 ~ 40)
function tempToY(t) {
  const minT = -20
  const maxT = 40
  const clamped = Math.max(minT, Math.min(maxT, t))
  const ratio = (clamped - minT) / (maxT - minT)
  return 290 - ratio * 250
}

function generateTempPath(temps) {
  return temps
    .map((t, idx) => {
      const x = 85 + idx * 52
      const y = tempToY(t)
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}
</script>

<style scoped>
.climate-lab-container {
  padding: 32px 36px;
  background: var(--surface);
  border: 1px solid var(--baroque-border-gold);
  border-radius: var(--radius-box);
  margin-top: 32px;
  box-shadow: 0 4px 20px rgba(15, 39, 66, 0.08);
}

.climate-header {
  margin-bottom: 24px;
}

.climate-badge {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: var(--baroque-bronze);
  text-transform: uppercase;
  font-family: ui-monospace, monospace;
}

.climate-header h2 {
  font-size: clamp(24px, 3.5vw, 32px);
  color: var(--geo-ocean-deep);
  margin: 6px 0 10px;
  font-family: Georgia, 'Playfair Display', 'Songti SC', serif;
}

.climate-lead {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 800px;
  margin: 0;
}

.climate-selectors-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.station-select-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.station-select-box label {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
}

.station-select {
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font: inherit;
  font-size: 14px;
  color: var(--geo-ocean-deep);
}

.station-select:focus {
  outline: none;
  border-color: var(--baroque-bronze);
}

.chart-canvas-card {
  padding: 24px;
  background: #fcfbf8;
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  margin-bottom: 24px;
}

.chart-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.chart-title-bar h3 {
  margin: 0;
  font-size: 17px;
  color: var(--geo-ocean-deep);
}

.chart-legend {
  display: flex;
  gap: 16px;
  font-size: 12.5px;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-bar {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.bar-a { background: #245d92; }
.bar-b { background: #52b788; }

.legend-line {
  display: inline-block;
  width: 16px;
  height: 3px;
  border-radius: 2px;
}

.line-a { background: #c86446; }
.line-b { background: #d8b773; }

.svg-wrapper {
  width: 100%;
  overflow-x: auto;
}

.climate-svg {
  width: 100%;
  min-width: 600px;
  height: auto;
  display: block;
}

.chart-caption {
  margin-top: 10px;
  font-size: 11.5px;
  color: var(--text-faint);
  text-align: right;
}

.climate-interpretation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.interp-card {
  padding: 20px 22px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
}

.interp-card .card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.city-tag {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  background: #245d92;
  color: #ffffff;
}

.city-tag.tag-b {
  background: #52b788;
}

.interp-card h4 {
  margin: 0;
  font-size: 16px;
  color: var(--geo-ocean-deep);
}

.stat-metrics-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}

.stat-metrics-row div {
  display: flex;
  flex-direction: column;
}

.stat-metrics-row small {
  font-size: 11px;
  color: var(--text-faint);
}

.stat-metrics-row strong {
  font-size: 15px;
  color: var(--geo-ocean-deep);
  font-family: ui-monospace, monospace;
}

.interp-desc {
  font-size: 13.5px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}
</style>
