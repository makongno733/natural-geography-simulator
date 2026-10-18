<template>
  <div class="landscape-variation-sim" role="region" aria-label="多时相遥感与空间景观变迁判读台">
    <div class="sim-header">
      <div class="sim-title-group">
        <span class="sim-badge">湖盆微地形与水文节律 · 矢量教学推演台（非传感器原始像元）</span>
        <h3>鄱阳湖水陆变迁：微地形与多时相水热节律推演台</h3>
        <p class="sim-meta-note">
          数据说明：本视窗为基于鄱阳湖浅碟形湖盆高程与季风水热周期构建的教学矢量推演模型。月度水位与面积为情境设定参数；真实 Landsat/MODIS 卫星多时相高精度比对请访问
          <router-link to="/geo-labs/satellite" class="real-data-link">地理实证实验·卫星影像对比 ↗</router-link>。
        </p>
      </div>
      <div class="sim-actions-top">
        <button type="button" class="btn-preset" @click="applyMonthPreset(7)">7月夏汛丰水期</button>
        <button type="button" class="btn-preset" @click="applyMonthPreset(1)">1月冬春枯水期</button>
        <button type="button" class="btn-preset" @click="applyMonthPreset(9)">9月特枯干旱期</button>
      </div>
    </div>

    <div class="sim-grid">
      <!-- 控制与数据维度 -->
      <div class="sim-controls">
        <div class="control-row">
          <label class="control-label" for="month-slider">
            <span class="lbl-txt">观测月份时间轴</span>
            <span class="lbl-val"><strong>{{ month }} 月</strong> ({{ seasonName }})</span>
          </label>
          <input
            id="month-slider"
            v-model.number="month"
            type="range"
            min="1"
            max="12"
            step="1"
            aria-label="观测月份"
          />
          <div class="range-marks">
            <span>1月 枯水</span>
            <span>4月 涨水</span>
            <span>7月 盛夏主汛</span>
            <span>10月 退水</span>
            <span>12月 枯季</span>
          </div>
        </div>

        <div class="control-row">
          <label class="control-label">
            <span class="lbl-txt">遥感波段增强模式</span>
          </label>
          <div class="mode-radios" role="radiogroup" aria-label="遥感显示模式">
            <label
              v-for="b in bands"
              :key="b.id"
              :class="['mode-card', { active: bandMode === b.id }]"
            >
              <input type="radio" v-model="bandMode" :value="b.id" />
              <strong>{{ b.name }}</strong>
              <small>{{ b.desc }}</small>
            </label>
          </div>
        </div>

        <!-- 水文台站指标面板 -->
        <div class="station-data-box">
          <h5>📍 星子水文台站实测参考指标：</h5>
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="m-title">基准水位</span>
              <span class="m-data">{{ currentWaterLevel }} m</span>
            </div>
            <div class="metric-item">
              <span class="m-title">湖泊水面面积</span>
              <span class="m-data">{{ currentWaterArea }} km²</span>
            </div>
            <div class="metric-item">
              <span class="m-title">归一化植被指数 (NDVI)</span>
              <span class="m-data">{{ currentNDVI }}</span>
            </div>
            <div class="metric-item">
              <span class="m-title">水体指数 (NDWI)</span>
              <span class="m-data">{{ currentNDWI }}</span>
            </div>
          </div>
        </div>

        <div class="sim-capture-panel">
          <p class="capture-hint">
            先从画面中找出直接观察到的差异，区分【看见的颜色边界】与【推测的成因】，点击下方生成证据卡：
          </p>
          <button type="button" class="btn-capture" @click="captureEvidence">
            📸 捕获本组遥感与台站数据为【科学证据卡】
          </button>
        </div>
      </div>

      <!-- 视觉判读视窗 -->
      <div class="sim-stage">
        <!-- 模拟卫星遥感真彩色/假彩色视窗 -->
        <div class="remote-sensing-window">
          <div class="window-topbar">
            <span class="coords">E 115°47′–116°45′ | N 28°22′–29°45′</span>
            <span class="sensor-info">{{ currentSensorTag }}</span>
          </div>
          <svg viewBox="0 0 500 240" class="rs-svg" aria-label="多时相遥感湖面变化图">
            <!-- 底色陆地/滩涂 -->
            <rect x="0" y="0" width="500" height="240" :fill="landBgColor" />

            <!-- 碟形湖盆深水主航道 (常年淹没区) -->
            <path
              d="M 230 10 Q 240 60 220 110 T 260 180 T 250 230"
              fill="none"
              :stroke="deepWaterStroke"
              :stroke-width="mainChannelWidth"
              stroke-linecap="round"
            />

            <!-- 季节性淹没浅滩/大湖体 -->
            <path
              :d="lakeAreaPath"
              :fill="waterFillColor"
              :opacity="waterOpacity"
              transition="all 0.4s"
            />

            <!-- 苔草湿地草洲 (枯水期出露的茂密植被) -->
            <path
              v-if="month <= 3 || month >= 10"
              d="M 120 70 Q 180 40 210 90 T 170 160 Z M 270 120 Q 340 90 380 150 T 310 200 Z"
              :fill="wetlandGrassColor"
              opacity="0.8"
            />

            <!-- 星子水文站标示点 -->
            <circle cx="230" cy="40" r="5" fill="#f43f5e" stroke="#ffffff" stroke-width="1.5" />
            <text x="242" y="44" fill="#ffffff" font-size="11" font-weight="bold">星子站 ({{ currentWaterLevel }}m)</text>

            <text x="16" y="224" fill="#f8fafc" font-size="12" font-weight="bold">
              景观特征：{{ landscapeSummary }}
            </text>
          </svg>
        </div>

        <!-- 湖盆横剖面高程示意 (DEM Cross-Section) -->
        <div class="profile-card">
          <div class="profile-head">
            <h5>碟形浅水湖盆横向高程剖面 (西 ➔ 东)</h5>
            <span class="profile-note">垂直高差夸大展示 · 浅碟形湖底形态</span>
          </div>
          <svg viewBox="0 0 500 110" class="profile-svg" aria-label="湖盆高程横剖面图">
            <!-- 坐标线 -->
            <line x1="40" y1="95" x2="480" y2="95" stroke="#475569" stroke-width="1" />
            <line x1="40" y1="15" x2="40" y2="95" stroke="#475569" stroke-width="1" />
            <text x="10" y="24" fill="#94a3b8" font-size="10">22m</text>
            <text x="10" y="60" fill="#94a3b8" font-size="10">14m</text>
            <text x="15" y="95" fill="#94a3b8" font-size="10">6m</text>

            <!-- 湖盆地形底线 -->
            <path
              d="M 40 40 Q 140 75 220 85 T 320 82 T 480 35 L 480 95 L 40 95 Z"
              fill="#334155"
            />

            <!-- 当前水位淹没线 -->
            <line
              x1="40"
              :y1="waterLineY"
              x2="480"
              :y2="waterLineY"
              stroke="#38bdf8"
              stroke-width="2"
              stroke-dasharray="3,3"
            />
            <text x="410" :y="waterLineY - 4" fill="#38bdf8" font-size="11" font-weight="bold">
              水位面 {{ currentWaterLevel }}m
            </text>

            <!-- 浅滩出露标注 -->
            <text v-if="currentWaterLevel < 14" x="120" y="70" fill="#a7f3d0" font-size="10">
              浅滩出露长草
            </text>
            <text v-if="currentWaterLevel < 14" x="350" y="70" fill="#a7f3d0" font-size="10">
              浅滩出露长草
            </text>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const emit = defineEmits(['capture'])

const month = ref(7) // 1 ~ 12
const bandMode = ref('true-color') // true-color | ndwi | ndvi

const bands = [
  { id: 'true-color', name: '真彩色合成 (RGB 4-3-2)', desc: '接近人眼自然视感，分辨水陆与植被色相' },
  { id: 'ndwi', name: '水体指数 (NDWI 假彩色)', desc: '高亮增强水体边缘，蓝白色明显区分浅滩' },
  { id: 'ndvi', name: '植被指数 (NDVI 假彩色)', desc: '红绿对比突出湿地苔草萌发生长覆盖' },
]

const seasonName = computed(() => {
  if (month.value >= 6 && month.value <= 8) return '盛夏季风主汛期'
  if (month.value >= 9 && month.value <= 10) return '秋季伏旱退水期'
  if (month.value >= 11 || month.value <= 2) return '冬春少雨枯水期'
  return '春季降雨回升期'
})

// 水文台站拟合模型（根据鄱阳湖星子站真实长年水文曲线拟合）
const currentWaterLevel = computed(() => {
  const m = month.value
  // 6-7月主汛期 19-21米；12-1月枯水期 8-10米；9月干旱 11-13米
  const curve = [9.2, 9.8, 12.5, 14.8, 17.2, 20.1, 20.8, 18.5, 12.2, 10.4, 9.5, 8.9]
  return curve[m - 1]
})

const currentWaterArea = computed(() => {
  const lvl = currentWaterLevel.value
  // 水位-面积非线性响应（浅碟形湖盆特征：水位超过14m后面积剧烈暴增）
  if (lvl >= 18) return Math.round(3200 + (lvl - 18) * 230)
  if (lvl >= 14) return Math.round(1800 + (lvl - 14) * 350)
  return Math.round(600 + (lvl - 8) * 200)
})

const currentNDVI = computed(() => {
  // 枯水期草洲出露 NDVI 高达 0.65；丰水期全被水淹 NDVI 极低 0.10
  const lvl = currentWaterLevel.value
  if (lvl > 18) return 0.12
  if (lvl > 14) return 0.35
  return 0.68
})

const currentNDWI = computed(() => {
  const lvl = currentWaterLevel.value
  return Math.round(((lvl - 8) / 14 * 0.7 + 0.1) * 100) / 100
})

const currentSensorTag = computed(() => {
  return `Landsat OLI / MODIS Terra (${month.value}月典型中分辨率合成)`
})

const landscapeSummary = computed(() => {
  if (currentWaterLevel.value >= 18) return '“汪洋一片，水天相连”的大湖洪泛景观'
  if (currentWaterLevel.value >= 14) return '主泓道连贯，部分洲滩露头的过水性湖泊'
  return '“落星成洲，芳草连天”的水落滩出湿地草原景观'
})

// 视觉样式计算
const landBgColor = computed(() => {
  if (bandMode.value === 'ndwi') return '#1e293b'
  if (bandMode.value === 'ndvi') return '#451a03'
  return '#334155'
})

const deepWaterStroke = computed(() => {
  if (bandMode.value === 'ndwi') return '#38bdf8'
  if (bandMode.value === 'ndvi') return '#0f172a'
  return '#0369a1'
})

const mainChannelWidth = computed(() => {
  return currentWaterLevel.value > 14 ? '40' : '20'
})

const waterFillColor = computed(() => {
  if (bandMode.value === 'ndwi') return '#0284c7'
  if (bandMode.value === 'ndvi') return '#064e3b'
  return '#0284c7'
})

const waterOpacity = computed(() => {
  return currentWaterLevel.value >= 18 ? 0.85 : currentWaterLevel.value >= 14 ? 0.65 : 0.35
})

const wetlandGrassColor = computed(() => {
  if (bandMode.value === 'ndvi') return '#22c55e'
  return '#16a34a'
})

const lakeAreaPath = computed(() => {
  const scale = currentWaterLevel.value >= 18 ? 1.0 : currentWaterLevel.value >= 14 ? 0.75 : 0.45
  if (scale > 0.8) {
    return 'M 60 40 Q 220 10 440 50 T 420 190 T 250 220 T 70 170 Z'
  }
  if (scale > 0.6) {
    return 'M 140 50 Q 240 30 380 60 T 360 170 T 250 200 T 150 150 Z'
  }
  return 'M 190 70 Q 240 50 310 80 T 290 150 T 250 180 T 200 140 Z'
})

const waterLineY = computed(() => {
  // 6m -> 95, 22m -> 20
  const lvl = currentWaterLevel.value
  return Math.round(95 - ((lvl - 6) / 16) * 75)
})

function applyMonthPreset(m) {
  month.value = m
}

function captureEvidence() {
  const evidence = {
    title: `情境推演证据：${month.value}月份 (${seasonName.value}) 鄱阳湖时空特征`,
    evidenceType: '教学情境推演与矢量示意',
    params: {
      设定月份: `${month.value} 月`,
      季风节律: seasonName.value,
      情境基准水位: `${currentWaterLevel.value} m`,
      湖泊水面估算面积: `${currentWaterArea.value} km²`,
      显示模式: bands.find(b => b.id === bandMode.value)?.name || '真彩色'
    },
    observation: `【情境推演与矢量示意观察】设定基准水位为 ${currentWaterLevel.value}米；模型水面面积设定为 ${currentWaterArea.value}平方公里；在${bandMode.value === 'ndvi' ? '植被指数假彩色示意下显示大片草洲' : '真彩色示意下显示湖滩显露青绿色'}；横剖面显示当水位低于14米时，浅碟形湖底双翼浅滩出露。`,
    inference: `【因果推断】${currentWaterLevel.value >= 18 ? '夏季受副热带高压进退与江淮梅雨锋面强降雨补给，长江与五河入湖径流大增，湖泊充盈膨胀。' : '冬春季受冬季风控制，流域降水稀少，加之长江干流水位下落拉空湖水，浅碟形湖盆滩地裸露，迅速萌发湿地苔草，属于自然的季节性水热动力循环，而非永久性干涸。'}`,
    confidence: 4,
    source: '鄱阳湖水热节律与湖盆微地形推演台（教学设定）',
    tag: `时相 ${month.value}月`
  }
  emit('capture', evidence)
}
</script>

<style scoped>
.landscape-variation-sim {
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

.control-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.lbl-txt {
  color: #cbd5e1;
  font-weight: 600;
}

.lbl-val strong {
  color: #38bdf8;
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

.mode-radios {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.mode-card {
  display: flex;
  flex-direction: column;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-card input {
  display: none;
}

.mode-card.active {
  border-color: #38bdf8;
  background: #082f49;
}

.mode-card strong {
  font-size: 12px;
  color: #f8fafc;
}

.mode-card small {
  font-size: 10px;
  color: #94a3b8;
}

.station-data-box {
  background: #082f49;
  border: 1px solid #0284c7;
  border-radius: 8px;
  padding: 12px;
}

.station-data-box h5 {
  margin: 0 0 10px;
  font-size: 12px;
  color: #e0f2fe;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  background: #0f172a;
  padding: 6px 8px;
  border-radius: 4px;
}

.m-title {
  font-size: 10px;
  color: #94a3b8;
}

.m-data {
  font-size: 14px;
  font-weight: bold;
  color: #38bdf8;
}

.sim-capture-panel {
  margin-top: 10px;
  border-top: 1px solid #334155;
  padding-top: 14px;
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
}

.btn-capture:hover {
  background: #0369a1;
}

.sim-stage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.remote-sensing-window {
  background: #020617;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #334155;
}

.window-topbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #0f172a;
  font-size: 11px;
  color: #64748b;
  font-family: ui-monospace, monospace;
}

.rs-svg {
  display: block;
  width: 100%;
  height: auto;
}

.profile-card {
  background: #1e293b;
  border-radius: 8px;
  padding: 14px;
  border: 1px solid #334155;
}

.profile-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.profile-head h5 {
  margin: 0;
  font-size: 13px;
  color: #cbd5e1;
}

.profile-note {
  font-size: 10px;
  color: #94a3b8;
}

.profile-svg {
  width: 100%;
  height: 90px;
}

@media (max-width: 840px) {
  .sim-grid {
    grid-template-columns: 1fr;
  }
}
</style>
