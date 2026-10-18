<template>
  <div class="urban-flood-sim" role="region" aria-label="城市降雨径流与下渗仿真模拟器">
    <div class="sim-header">
      <div class="sim-title-group">
        <span class="sim-badge">水循环 · 定性水动力学教学模型（非现场实测）</span>
        <h3>城市暴雨产流与海绵下渗仿真实验台</h3>
        <p class="sim-meta-note">教学提示：本实验台为水文推理与 Horton 下渗简化教学模型。产流历时（约8/26分钟）及削峰率（约48%）为情境设定参数，用于对比不同下渗条件，非特定城市现场工程监测数据。</p>
      </div>
      <div class="sim-actions-top">
        <button type="button" class="btn-preset" @click="applyPreset('traditional')">标准硬化城区</button>
        <button type="button" class="btn-preset" @click="applyPreset('sponge')">海绵改造试点</button>
        <button type="button" class="btn-preset" @click="applyPreset('natural')">天然植被林地</button>
      </div>
    </div>

    <div class="sim-grid">
      <!-- 控制面板 -->
      <div class="sim-controls">
        <fieldset class="control-group">
          <legend>1. 地表材质与铺装类型</legend>
          <div class="radio-cards" role="radiogroup" aria-label="地表材质">
            <label
              v-for="s in surfaces"
              :key="s.id"
              :class="['surface-card', { active: surface === s.id }]"
            >
              <input
                type="radio"
                name="surface"
                :value="s.id"
                v-model="surface"
              />
              <span class="card-icon">{{ s.icon }}</span>
              <div class="card-info">
                <strong>{{ s.name }}</strong>
                <span class="card-sub">{{ s.sub }}</span>
              </div>
            </label>
          </div>
        </fieldset>

        <div class="slider-row">
          <label class="slider-label" for="rain-slider">
            <span class="label-txt">降雨强度</span>
            <span class="label-val"><strong>{{ rainIntensity }}</strong> mm/h ({{ rainLevelName }})</span>
          </label>
          <input
            id="rain-slider"
            v-model.number="rainIntensity"
            type="range"
            min="10"
            max="120"
            step="5"
            aria-label="降雨强度"
          />
          <div class="range-marks">
            <span>中雨 20</span>
            <span>大雨 40</span>
            <span>暴雨 80</span>
            <span>特大暴雨 120</span>
          </div>
        </div>

        <div class="slider-row">
          <label class="slider-label" for="duration-slider">
            <span class="label-txt">降雨历时</span>
            <span class="label-val"><strong>{{ rainDuration }}</strong> 分钟</span>
          </label>
          <input
            id="duration-slider"
            v-model.number="rainDuration"
            type="range"
            min="15"
            max="120"
            step="15"
            aria-label="降雨历时"
          />
          <div class="range-marks">
            <span>短时 15min</span>
            <span>1小时 60min</span>
            <span>连阴雨 120min</span>
          </div>
        </div>

        <div class="slider-row">
          <label class="slider-label" for="slope-slider">
            <span class="label-txt">地表坡度</span>
            <span class="label-val"><strong>{{ slope }}°</strong> ({{ slopeDesc }})</span>
          </label>
          <input
            id="slope-slider"
            v-model.number="slope"
            type="range"
            min="1"
            max="8"
            step="1"
            aria-label="地表坡度"
          />
        </div>

        <div v-if="surface === 'sponge'" class="sponge-tuning">
          <label class="slider-label" for="sponge-depth">
            <span class="label-txt">碎石储水垫层设计厚度</span>
            <span class="label-val"><strong>{{ spongeCapacity }}</strong> mm 调蓄容量</span>
          </label>
          <input
            id="sponge-depth"
            v-model.number="spongeCapacity"
            type="range"
            min="10"
            max="45"
            step="5"
            aria-label="海绵储水容量"
          />
        </div>

        <div class="sim-capture-panel">
          <p class="capture-hint">保持其他条件不变，只改动一项（例如仅改变地表材质），点击下方生成客观对照证据：</p>
          <button type="button" class="btn-capture" @click="captureEvidence">
            📸 捕获本组实验参数为【科学证据卡】
          </button>
        </div>
      </div>

      <!-- 可视化展示区 -->
      <div class="sim-stage">
        <!-- 地表剖面水文微观动画 SVG -->
        <div class="profile-viewport">
          <svg viewBox="0 0 600 240" class="profile-svg" aria-label="地表下渗剖面水动力模拟图">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#1e293b" />
                <stop offset="100%" stop-color="#334155" />
              </linearGradient>
              <linearGradient id="concreteGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#64748b" />
                <stop offset="100%" stop-color="#475569" />
              </linearGradient>
              <linearGradient id="vegGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#15803d" />
                <stop offset="100%" stop-color="#14532d" />
              </linearGradient>
              <linearGradient id="spongeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0284c7" />
                <stop offset="100%" stop-color="#0369a1" />
              </linearGradient>
              <pattern id="rainDots" width="20" height="20" patternUnits="userSpaceOnUse">
                <line x1="5" y1="2" x2="2" y2="12" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" />
                <line x1="15" y1="8" x2="12" y2="18" stroke="#93c5fd" stroke-width="1.2" stroke-linecap="round" />
              </pattern>
            </defs>

            <!-- 天空背景 -->
            <rect x="0" y="0" width="600" height="240" fill="url(#skyGrad)" rx="8" />

            <!-- 雨水粒子动画层 -->
            <rect x="0" y="0" width="600" height="130" fill="url(#rainDots)" :opacity="rainIntensity / 100" class="rain-flow" />

            <!-- 地表土层与结构剖面 -->
            <path
              :d="`M 0 130 L 600 ${130 + slope * 3} L 600 240 L 0 240 Z`"
              fill="#27272a"
            />

            <!-- 铺装表层 -->
            <path
              :d="`M 0 130 L 600 ${130 + slope * 3} L 600 ${148 + slope * 3} L 0 148 Z`"
              :fill="surface === 'concrete' ? 'url(#concreteGrad)' : surface === 'vegetation' ? 'url(#vegGrad)' : 'url(#spongeGrad)'"
            />

            <!-- 碎石调蓄层 (海绵模式特有) -->
            <rect
              v-if="surface === 'sponge'"
              x="20"
              :y="155 + slope"
              width="560"
              height="35"
              fill="#0e7490"
              opacity="0.6"
              rx="4"
            />
            <text
              v-if="surface === 'sponge'"
              x="300"
              :y="178 + slope"
              fill="#e0f2fe"
              font-size="11"
              text-anchor="middle"
            >
              地下碎石调蓄层（透水蓄水孔隙率 35%）
            </text>

            <!-- 地表积水层 -->
            <path
              v-if="calcWaterDepth > 2"
              :d="`M 0 ${130 - Math.min(calcWaterDepth, 25)} L 600 ${130 + slope * 3 - Math.min(calcWaterDepth, 25)} L 600 ${130 + slope * 3} L 0 130 Z`"
              fill="#38bdf8"
              opacity="0.65"
            />

            <!-- 动态汇流箭头 -->
            <g v-if="calcWaterDepth > 5" stroke="#bae6fd" stroke-width="2" fill="none">
              <path d="M 120 120 Q 200 125 320 128" />
              <path d="M 360 129 Q 450 132 540 135" />
            </g>

            <!-- 下渗流箭头 -->
            <g :opacity="calcInfiltrationRatio" stroke="#4ade80" stroke-width="2" stroke-dasharray="3,3">
              <line x1="150" y1="140" x2="150" y2="200" />
              <line x1="300" y1="140" x2="300" y2="200" />
              <line x1="450" y1="140" x2="450" y2="200" />
            </g>

            <!-- 标签文字 -->
            <text x="24" y="30" fill="#f8fafc" font-size="14" font-weight="bold">
              {{ currentSurfaceName }}
            </text>
            <text x="24" y="52" fill="#94a3b8" font-size="12">
              下渗补给率：{{ Math.round(calcInfiltrationRatio * 100) }}% | 产流汇集历时：{{ calcTimeToPeak }} 分钟
            </text>
            <text x="576" y="30" fill="#f8fafc" font-size="13" text-anchor="end" font-weight="bold">
              内涝积水深度估测：{{ calcWaterDepth }} mm
            </text>
            <text x="576" y="52" :fill="riskColor" font-size="12" text-anchor="end" font-weight="bold">
              【{{ riskLevelName }}】
            </text>
          </svg>
        </div>

        <!-- 水文产流历时折线图 (Hydrograph) -->
        <div class="hydrograph-card">
          <div class="hydro-header">
            <h4>降雨-地表径流历时过程曲线 (Hydrograph)</h4>
            <div class="hydro-legend">
              <span class="legend-item"><span class="dot rain-dot"></span>降雨过程</span>
              <span class="legend-item"><span class="dot current-dot"></span>当前工况径流</span>
              <span class="legend-item"><span class="dot ref-dot"></span>传统水泥基准</span>
            </div>
          </div>
          <svg viewBox="0 0 500 130" class="hydro-svg" aria-label="水文过程曲线图">
            <!-- 坐标网格 -->
            <line x1="40" y1="110" x2="480" y2="110" stroke="#334155" stroke-width="1" />
            <line x1="40" y1="20" x2="40" y2="110" stroke="#334155" stroke-width="1" />
            <text x="40" y="125" fill="#64748b" font-size="10">0m</text>
            <text x="180" y="125" fill="#64748b" font-size="10">30m</text>
            <text x="320" y="125" fill="#64748b" font-size="10">60m</text>
            <text x="460" y="125" fill="#64748b" font-size="10">120m</text>
            <text x="10" y="24" fill="#64748b" font-size="10">流量</text>

            <!-- 传统水泥基准参照线 (灰色虚线) -->
            <path :d="refHydroPath" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" />

            <!-- 当前工况径流线 (高亮) -->
            <path :d="currentHydroPath" fill="none" :stroke="curveColor" stroke-width="2.5" />

            <!-- 洪峰标记点 -->
            <circle :cx="peakPoint.x" :cy="peakPoint.y" r="4" :fill="curveColor" />
            <text :x="peakPoint.x + 8" :y="peakPoint.y - 4" :fill="curveColor" font-size="11" font-weight="bold">
              峰值 {{ calcPeakDischarge }} m³/s
            </text>
          </svg>
          <div class="hydro-metrics">
            <div class="metric-item">
              <span class="m-label">总降雨量</span>
              <span class="m-val">{{ calcTotalPrecipitation }} mm</span>
            </div>
            <div class="metric-item">
              <span class="m-label">地表径流峰值</span>
              <span class="m-val">{{ calcPeakDischarge }} m³/s</span>
            </div>
            <div class="metric-item">
              <span class="m-label">产流洪峰延缓</span>
              <span class="m-val">+{{ Math.max(0, calcTimeToPeak - 8) }} 分钟</span>
            </div>
            <div class="metric-item highlight">
              <span class="m-label">相对硬化削峰率</span>
              <span class="m-val">{{ calcPeakReductionRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const emit = defineEmits(['capture'])

const surfaces = [
  { id: 'concrete', name: '传统水泥/沥青', sub: '高强度不透水硬化', icon: '🏢' },
  { id: 'sponge', name: '海绵透水铺装', sub: '透水砖+碎石调蓄', icon: '🧱' },
  { id: 'vegetation', name: '天然林地草甸', sub: '土壤深厚截留强', icon: '🌲' },
]

const surface = ref('concrete')
const rainIntensity = ref(50) // mm/h
const rainDuration = ref(60) // 分钟
const slope = ref(2) // 度
const spongeCapacity = ref(25) // mm

const currentSurfaceName = computed(() => {
  return surfaces.find(s => s.id === surface.value)?.name || '未选'
})

const rainLevelName = computed(() => {
  if (rainIntensity.value < 20) return '小雨'
  if (rainIntensity.value < 40) return '中到大雨'
  if (rainIntensity.value < 70) return '暴雨'
  return '特大暴雨'
})

const slopeDesc = computed(() => {
  if (slope.value <= 2) return '平缓平原区'
  if (slope.value <= 4) return '微倾坡面'
  return '陡坡汇流区'
})

// 物理与水文计算模型
const calcTotalPrecipitation = computed(() => {
  return Math.round(rainIntensity.value * (rainDuration.value / 60))
})

const calcInfiltrationRatio = computed(() => {
  if (surface.value === 'concrete') return 0.05
  if (surface.value === 'vegetation') return 0.75
  // 海绵城市：降雨历时越长，碎石层逐渐趋向饱和
  const baseRate = 0.60
  const saturationLoss = Math.min(0.35, (calcTotalPrecipitation.value / (spongeCapacity.value * 2)) * 0.25)
  return Math.max(0.18, Math.round((baseRate - saturationLoss) * 100) / 100)
})

const calcRunoffCoeff = computed(() => {
  return Math.round((1 - calcInfiltrationRatio.value) * 100) / 100
})

const calcTimeToPeak = computed(() => {
  // 坡度越陡，汇流越快；粗糙度越大，汇流越慢
  const baseTime = surface.value === 'concrete' ? 8 : surface.value === 'sponge' ? 24 : 38
  const slopePenalty = (slope.value - 1) * 2
  return Math.max(5, Math.round(baseTime - slopePenalty))
})

const calcPeakDischarge = computed(() => {
  // 教学归一化推理公式 Q = C * I * A
  const C = calcRunoffCoeff.value
  const I = rainIntensity.value
  const peak = (C * I * 0.85) * (1 + slope.value * 0.05)
  return Math.round(peak * 10) / 10
})

const refPeakDischarge = computed(() => {
  // 水泥基准的峰值
  const C = 0.95
  const I = rainIntensity.value
  const peak = (C * I * 0.85) * (1 + slope.value * 0.05)
  return Math.round(peak * 10) / 10
})

const calcPeakReductionRate = computed(() => {
  const refVal = refPeakDischarge.value
  const curVal = calcPeakDischarge.value
  if (refVal <= 0) return 0
  const rate = ((refVal - curVal) / refVal) * 100
  return Math.max(0, Math.round(rate))
})

const calcWaterDepth = computed(() => {
  // 简化的地表积水计算
  const runoffTotal = calcTotalPrecipitation.value * calcRunoffCoeff.value
  const drainageCapacity = 25 // 假设管网标准排水设计流量 (mm/h)
  const netWater = Math.max(0, runoffTotal - drainageCapacity * (rainDuration.value / 60))
  return Math.round(netWater)
})

const riskLevelName = computed(() => {
  const depth = calcWaterDepth.value
  if (depth <= 5) return '地表畅流 · 无明显积水'
  if (depth <= 25) return '道路浅层积水 · 轻度受阻'
  if (depth <= 60) return '严重积水 · 立交桥与车道受淹'
  return '城市内涝特大险情 · 需紧急避险'
})

const riskColor = computed(() => {
  const depth = calcWaterDepth.value
  if (depth <= 5) return '#4ade80'
  if (depth <= 25) return '#facc15'
  if (depth <= 60) return '#fb923c'
  return '#f87171'
})

const curveColor = computed(() => {
  if (surface.value === 'vegetation') return '#22c55e'
  if (surface.value === 'sponge') return '#38bdf8'
  return '#f43f5e'
})

// 水文过程线 SVG 路径生成
const peakPoint = computed(() => {
  const tPeak = calcTimeToPeak.value
  const x = 40 + (tPeak / 120) * 440
  const y = 110 - (calcPeakDischarge.value / 110) * 85
  return { x: Math.max(50, Math.min(460, x)), y: Math.max(25, Math.min(105, y)) }
})

const currentHydroPath = computed(() => {
  const p = peakPoint.value
  return `M 40 110 Q ${p.x * 0.7} ${p.y} ${p.x} ${p.y} T 470 108`
})

const refHydroPath = computed(() => {
  const x = 40 + (8 / 120) * 440
  const y = 110 - (refPeakDischarge.value / 110) * 85
  return `M 40 110 Q ${x * 0.7} ${y} ${x} ${y} T 470 108`
})

function applyPreset(type) {
  if (type === 'traditional') {
    surface.value = 'concrete'
    rainIntensity.value = 50
    rainDuration.value = 60
    slope.value = 2
  } else if (type === 'sponge') {
    surface.value = 'sponge'
    rainIntensity.value = 50
    rainDuration.value = 60
    slope.value = 2
    spongeCapacity.value = 25
  } else if (type === 'natural') {
    surface.value = 'vegetation'
    rainIntensity.value = 50
    rainDuration.value = 60
    slope.value = 2
  }
}

function captureEvidence() {
  const evidence = {
    title: `实验记录：${currentSurfaceName.value}（${rainIntensity.value}mm/h，历时${rainDuration.value}分）`,
    evidenceType: '教学模型推演',
    params: {
      地表材质: currentSurfaceName.value,
      降雨强度: `${rainIntensity.value} mm/h (${rainLevelName.value})`,
      降雨历时: `${rainDuration.value} 分钟`,
      地表坡度: `${slope.value}°`,
      下渗率设定: `${Math.round(calcInfiltrationRatio.value * 100)}%`
    },
    observation: `【仿真模型计算结果】设定总降水量 ${calcTotalPrecipitation.value}mm；模型计算产流历时约 ${calcTimeToPeak.value}分钟达峰；估算径流峰值流量 ${calcPeakDischarge.value} m³/s；路面积水估算约 ${calcWaterDepth.value}mm（${riskLevelName.value}）；相对水泥硬化路面模型削峰率约 ${calcPeakReductionRate.value}%。`,
    inference: `【因果推断】${surface.value === 'concrete' ? '硬化路面下渗率极低，雨水无法进入地下水系统，产流历时短，瞬时汇水洪峰过大引起积水。' : surface.value === 'sponge' ? '透水砖与碎石层有效将部分暴雨转化为地下滞留蓄水，削减洪峰，但长时间暴雨导致蓄水层饱和后削峰能力减退。' : '天然林地植被具有高截留率与深厚土壤孔隙，雨水大部分补给地下水，径流极小。'}`,
    confidence: 4,
    source: '城市下渗教学仿真模型（情境设定参数）',
    tag: currentSurfaceName.value
  }
  emit('capture', evidence)
}
</script>

<style scoped>
.urban-flood-sim {
  background: #0f172a;
  color: #f1f5f9;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #1e293b;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 16px;
}

.sim-badge {
  display: inline-block;
  font-size: 11px;
  color: #38bdf8;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.sim-title-group h3 {
  margin: 0;
  font-size: 20px;
  color: #f8fafc;
}

.sim-meta-note {
  margin: 4px 0 0;
  font-size: 11px;
  color: #94a3b8;
  max-width: 620px;
  line-height: 1.4;
}

.sim-actions-top {
  display: flex;
  gap: 8px;
}

.btn-preset {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preset:hover {
  background: #334155;
  color: #ffffff;
}

.sim-grid {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(360px, 1.4fr);
  gap: 24px;
}

.sim-controls {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #1e293b;
  padding: 20px;
  border-radius: 10px;
}

.control-group {
  border: 0;
  padding: 0;
  margin: 0;
}

.control-group legend {
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 10px;
}

.radio-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.surface-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.surface-card input {
  display: none;
}

.surface-card.active {
  border-color: #38bdf8;
  background: #082f49;
}

.card-icon {
  font-size: 22px;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-info strong {
  font-size: 14px;
  color: #f8fafc;
}

.card-sub {
  font-size: 11px;
  color: #94a3b8;
}

.slider-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.label-txt {
  color: #cbd5e1;
  font-weight: 600;
}

.label-val strong {
  color: #38bdf8;
  font-size: 15px;
}

input[type="range"] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.range-marks {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #64748b;
}

.sponge-tuning {
  background: #082f49;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px dashed #0284c7;
}

.sim-capture-panel {
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid #334155;
}

.capture-hint {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0 0 10px;
}

.btn-capture {
  width: 100%;
  background: #0284c7;
  color: #ffffff;
  border: 0;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}

.btn-capture:hover {
  background: #0369a1;
}

.sim-stage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-viewport {
  background: #020617;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #334155;
}

.profile-svg {
  display: block;
  width: 100%;
  height: auto;
}

.hydrograph-card {
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #334155;
}

.hydro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.hydro-header h4 {
  margin: 0;
  font-size: 13px;
  color: #cbd5e1;
}

.hydro-legend {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #94a3b8;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.rain-dot { background: #60a5fa; }
.current-dot { background: #38bdf8; }
.ref-dot { background: #94a3b8; }

.hydro-svg {
  width: 100%;
  height: 100px;
}

.hydro-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 10px;
  border-top: 1px solid #334155;
  padding-top: 10px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  background: #0f172a;
  padding: 8px 10px;
  border-radius: 6px;
}

.m-label {
  font-size: 11px;
  color: #94a3b8;
}

.m-val {
  font-size: 15px;
  font-weight: bold;
  color: #f8fafc;
}

.metric-item.highlight .m-val {
  color: #38bdf8;
}

@keyframes rainAnim {
  0% { transform: translateY(-10px); }
  100% { transform: translateY(10px); }
}

.rain-flow {
  animation: rainAnim 0.4s linear infinite;
}

@media (max-width: 840px) {
  .sim-grid {
    grid-template-columns: 1fr;
  }
  .hydro-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
