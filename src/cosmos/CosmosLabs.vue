<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import {
  lorentz,
  redshift,
  scaleFactor,
  stringPoints,
  flrwCosmicDistances,
  flrwCosmicAge,
  simultaneityLinePoints
} from './physics.js'

// ── 实验 01：狭义相对论状态 ──
const beta = ref(0.6)
const gamma = computed(() => lorentz(beta.value))
const simLine = computed(() => simultaneityLinePoints(beta.value, 120))

// ── 实验 02：宇宙学与 FLRW 计算器状态 ──
const a = ref(0.5)
const z = ref(1)
const emission = computed(() => (Number.isFinite(z.value) && z.value >= 0 ? scaleFactor(z.value) : null))

// 宇宙学模型参数
const cosmoPreset = ref('planck2018')
const cosmoParams = computed(() => {
  if (cosmoPreset.value === 'eds') {
    return { H0: 70, Om0: 1.0, Ode0: 0.0, Or0: 0.0, label: 'Einstein-de Sitter 纯物质模型 (Ωm=1)' }
  }
  return { H0: 67.4, Om0: 0.315, Ode0: 0.685, Or0: 0.0001, label: 'Planck 2018 标准基准 (ΛCDM)' }
})

const safeZ = computed(() => (Number.isFinite(z.value) && z.value >= 0 ? z.value : 0))
const cosmicDistances = computed(() => flrwCosmicDistances(safeZ.value, cosmoParams.value))
const cosmicAgeNow = computed(() => flrwCosmicAge(0, cosmoParams.value))
const cosmicAgeAtZ = computed(() => flrwCosmicAge(safeZ.value, cosmoParams.value))
const lookbackTime = computed(() => Math.max(0, cosmicAgeNow.value - cosmicAgeAtZ.value))

// ── 实验 03：弦振动与世界面类比状态 ──
const mode = ref(2)
const phase = ref(0)
const closed = ref(false)
const boundaryType = ref('fixed') // 'fixed' (两端固定 Dirichlet), 'free' (两端自由 Neumann)
const showWorldsheet = ref(false)
const isPlaying = ref(false)
let rafId = null

function updateBoundaryFromClosed(val) {
  closed.value = val === true || val === 'true'
}

function stepPhase(delta = 0.1) {
  phase.value = (phase.value + delta) % (2 * Math.PI)
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    runAnimation()
  } else if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function runAnimation() {
  if (!isPlaying.value) return
  phase.value = (phase.value + 0.04) % (2 * Math.PI)
  rafId = requestAnimationFrame(runAnimation)
}

onUnmounted(() => {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
})

// 计算世界面扫掠曲线束（沿时间相位多层采样）
const worldsheetSlices = computed(() => {
  if (!showWorldsheet.value) return []
  const slices = []
  const steps = 7
  for (let s = 0; s < steps; s++) {
    const tauOffset = phase.value - (s * 0.3)
    const pts = stringPoints(mode.value, tauOffset, closed.value)
    slices.push({ pts, opacity: 0.15 + 0.12 * (steps - s) })
  }
  return slices
})
</script>

<template>
<div class="cosmos-labs">
  <!-- ══════════════ 实验 01：狭义相对论与时空光锥 ══════════════ -->
  <section class="cx-panel">
    <span class="cx-eyebrow">EXPERIMENT 01 · 狭义相对论与时空几何</span>
    <h2>运动如何改变测量与同时性？</h2>
    <p>拖动相对速度滑块，实时观察洛伦兹钟慢、尺缩以及闵氏时空中的“光锥”与“同时性倾斜面”。</p>

    <label>
      相对速度 v/c = {{ beta.toFixed(2) }}
      <input v-model.number="beta" type="range" min="0" max="0.99" step="0.01">
    </label>

    <div class="cx-stats">
      <div><strong>{{ gamma.toFixed(3) }}</strong>洛伦兹因子 γ</div>
      <div><strong>{{ gamma.toFixed(3) }} s</strong>运动钟固有时间 1 s 对应 Δt</div>
      <div><strong>{{ (1/gamma).toFixed(3) }} m</strong>固有长度 1 m 对应 L</div>
      <div><strong>{{ (beta * 100).toFixed(0) }}% c</strong>光速占比</div>
    </div>

    <!-- 尺缩对比图 -->
    <svg viewBox="0 0 500 95" role="img" aria-label="静止与运动尺的长度比较" class="cx-lab-svg">
      <text x="10" y="23" fill="currentColor">固有长度 (静止系)</text>
      <path d="M110 20H470" stroke="#899bb0" stroke-width="12" stroke-linecap="round"/>
      <text x="10" y="70" fill="currentColor">运动测量 (收缩后)</text>
      <path :d="`M110 66H${110 + 360 / gamma}`" stroke="#3b82f6" stroke-width="12" stroke-linecap="round"/>
    </svg>

    <!-- 闵可夫斯基时空光锥与同时性图示 (c = 1) -->
    <div class="cx-sublab">
      <h3>时空图与同时性面 (Minkowski Diagram, c = 1)</h3>
      <p class="cx-subtext">45° 斜线为不变光锥（光信号边界）。虚线为运动参考系空间同时性线（t' = 0 对应 t = β x）；实线为运动物体世界线（x = β t）。</p>
      <svg viewBox="-160 -100 320 200" role="img" aria-label="二维时空光锥与同时性倾斜面图" class="cx-cone-svg">
        <!-- 背景网格与光锥阴影 -->
        <polygon points="0,0 90,-90 -90,-90" fill="rgba(59, 130, 246, 0.08)"/>
        <polygon points="0,0 90,90 -90,90" fill="rgba(59, 130, 246, 0.08)"/>
        <text x="5" y="-75" class="cx-svg-tag">未来光锥 (Future)</text>
        <text x="5" y="85" class="cx-svg-tag">过去光锥 (Past)</text>

        <!-- 静止系坐标轴 x 与 ct -->
        <line x1="-140" y1="0" x2="140" y2="0" stroke="#899bb0" stroke-width="1.5"/>
        <line x1="0" y1="90" x2="0" y2="-90" stroke="#899bb0" stroke-width="1.5"/>
        <text x="130" y="-8" fill="#899bb0" font-size="11">x</text>
        <text x="6" y="-80" fill="#899bb0" font-size="11">ct</text>

        <!-- 光锥边界线斜率 ±1 (45度) -->
        <line x1="-90" y1="90" x2="90" y2="-90" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3"/>
        <line x1="-90" y1="-90" x2="90" y2="90" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3"/>

        <!-- 运动参考系时间轴 (世界线 x = beta * t 即 t = x / beta) -->
        <line :x1="-80 * beta" y1="80" :x2="80 * beta" y2="-80" stroke="#3b82f6" stroke-width="2.5"/>
        <text :x="82 * beta" y="-75" fill="#3b82f6" font-size="11" font-weight="bold">ct' (世界线)</text>

        <!-- 运动参考系同时性空间轴 (t = beta * x) -->
        <line :x1="simLine[0].x" :y1="-simLine[0].t" :x2="simLine[1].x" :y2="-simLine[1].t" stroke="#10b981" stroke-width="2" stroke-dasharray="3 3"/>
        <text :x="simLine[1].x - 10" :y="-simLine[1].t - 6" fill="#10b981" font-size="11">x' (同时性)</text>
      </svg>
    </div>

    <details>
      <summary>公式、假设与课堂提问</summary>
      <p><b>公式体系：</b>γ = 1/√(1−v²/c²)，Δt = γΔτ，L = L₀/γ，t' = γ(t − βx)，x' = γ(x − βt)。</p>
      <p><b>适用条件：</b>平直时空惯性参考系，忽略局部引力势差。必须注意：同时性是相对的，在一个参考系同时发生的空间分离事件，在另一运动系绝非同时。</p>
      <p><b>课堂提问：</b>当速度达到 0.6c 时，运动参考系的同时性轴为何向上倾斜？为什么不能用这套公式直接计算卫星的广义相对论引力频移？</p>
    </details>
  </section>

  <!-- ══════════════ 实验 02：现代宇宙学与 FLRW 积分计算 ══════════════ -->
  <section class="cx-panel">
    <span class="cx-eyebrow">EXPERIMENT 02 · 现代宇宙学与标度膨胀</span>
    <h2>波长伸长、共动距离与宇宙年龄计算器</h2>
    <p>约定今天 a₀ = 1，不仅可观察波长随标度因子 a 的延展，还可基于弗里德曼方程进行真实宇宙学积分距离计算。</p>

    <label>
      发射尺度因子 a = {{ a.toFixed(2) }}
      <input v-model.number="a" type="range" min="0.1" max="1" step="0.01">
    </label>

    <div class="cx-stats">
      <div><strong>{{ redshift(a).toFixed(2) }}</strong>宇宙学红移 z</div>
      <div><strong>{{ (a * 100).toFixed(0) }}%</strong>发射时 / 今日的固有间距</div>
    </div>

    <svg viewBox="0 0 500 100" role="img" aria-label="尺度因子变化下的共动星系示意" class="cx-lab-svg">
      <circle v-for="i in 7" :key="i" :cx="250 + (i - 4) * 65 * a" cy="50" r="7" fill="currentColor"/>
    </svg>

    <!-- 反向红移输入与 FLRW 多参数积分 -->
    <div class="cx-sublab">
      <h3>FLRW 宇宙学距离与年龄精确计算器</h3>
      <div class="cx-inline-controls">
        <label>
          输入非负红移 z
          <input v-model.number="z" type="number" min="0" max="1100" step="0.1">
        </label>
        <div class="cx-preset-picker">
          <span>模型参数：</span>
          <button
            type="button"
            class="cx-preset-btn"
            :class="{ active: cosmoPreset === 'planck2018' }"
            @click="cosmoPreset = 'planck2018'"
          >
            Planck 2018 (ΛCDM)
          </button>
          <button
            type="button"
            class="cx-preset-btn"
            :class="{ active: cosmoPreset === 'eds' }"
            @click="cosmoPreset = 'eds'"
          >
            Einstein-de Sitter (Ωm=1)
          </button>
        </div>
      </div>

      <p aria-live="polite">
        发射尺度因子：{{ emission === null ? '请输入有效的非负数' : emission.toFixed(5) }}
      </p>

      <div v-if="emission !== null" class="cx-flrw-grid">
        <div class="cx-mini-stat">
          <span>共动距离 D_C</span>
          <b>{{ cosmicDistances.comovingDistanceMpc.toFixed(1) }} Mpc</b>
          <small>约 {{ (cosmicDistances.comovingDistanceMpc * 3.2616 / 1000).toFixed(2) }} 百万光年</small>
        </div>
        <div class="cx-mini-stat">
          <span>光度距离 D_L</span>
          <b>{{ cosmicDistances.luminosityDistanceMpc.toFixed(1) }} Mpc</b>
          <small>D_L = (1 + z) D_C</small>
        </div>
        <div class="cx-mini-stat">
          <span>角直径距离 D_A</span>
          <b>{{ cosmicDistances.angularDiameterDistanceMpc.toFixed(1) }} Mpc</b>
          <small>D_A = D_C / (1 + z)</small>
        </div>
        <div class="cx-mini-stat">
          <span>该红移处宇宙年龄</span>
          <b>{{ cosmicAgeAtZ.toFixed(3) }} Gyr</b>
          <small>今日年龄: {{ cosmicAgeNow.toFixed(2) }} Gyr；回望: {{ lookbackTime.toFixed(2) }} Gyr</small>
        </div>
      </div>
    </div>

    <details>
      <summary>模型边界与科学说明</summary>
      <p><b>基本关系：</b>1 + z = a₀ / a_em。红移反映时空膨胀对光波长的几何拉伸，并非静态空间中的多普勒速度；太阳系与银河系等被局域引力强束缚的系统不会跟随宇宙膨胀。</p>
      <p><b>积分说明：</b>距离积分基于数值 Simpson 规则计算。当 z = 1100 时（宇宙微波背景退耦时期），发射尺度因子仅约为 0.0009，宇宙年龄约为 38 万年。</p>
    </details>
  </section>

  <!-- ══════════════ 实验 03：弦模态类比与世界面 ══════════════ -->
  <section class="cx-panel">
    <span class="cx-eyebrow">EXPERIMENT 03 · 弦的模态类比与世界面扫掠</span>
    <h2>从边界条件到振动模态与世界面</h2>
    <div class="cx-alert-badge">经典类比 (Classical Analogy) · 严禁视为量子引力粒子谱模拟</div>

    <div class="cx-controls-row">
      <label>
        边界类型
        <select v-model="closed">
          <option :value="false">固定两端开弦类比</option>
          <option :value="true">周期闭弦类比</option>
        </select>
      </label>

      <label>
        模态阶数 n = {{ mode }}
        <input v-model.number="mode" type="range" min="1" max="6" step="1">
      </label>

      <label>
        时间相位 ωt = {{ phase.toFixed(2) }}
        <input v-model.number="phase" type="range" min="0" max="6.283" step="0.01">
      </label>
    </div>

    <div class="cx-btn-group">
      <button type="button" @click="togglePlay" :aria-pressed="isPlaying">
        {{ isPlaying ? '⏸ 暂停动画' : '▶ 播放振动' }}
      </button>
      <button type="button" @click="stepPhase(0.1)">
        ⏩ 单步相位 (+0.1)
      </button>
      <button type="button" @click="showWorldsheet = !showWorldsheet" :aria-pressed="showWorldsheet">
        {{ showWorldsheet ? '隐藏世界面扫掠' : '🌐 显示二维世界面扫掠曲面' }}
      </button>
    </div>

    <svg viewBox="0 0 500 280" role="img" aria-label="可改变模态与相位的经典弦示意" class="cx-string-svg">
      <!-- 平衡基准线 -->
      <path d="M30 140H470" stroke="#899bb0" stroke-dasharray="3 6"/>

      <!-- 世界面历史轨迹切片扫掠 -->
      <template v-if="showWorldsheet">
        <polyline
          v-for="(slice, sIdx) in worldsheetSlices"
          :key="sIdx"
          :points="slice.pts"
          fill="none"
          stroke="#3b82f6"
          :stroke-opacity="slice.opacity"
          stroke-width="1.5"
        />
      </template>

      <!-- 当前瞬时弦波形 -->
      <polyline :points="stringPoints(mode, phase, closed)" fill="none" stroke="currentColor" stroke-width="3.5"/>

      <!-- 开弦两端端点高亮 (若为开弦) -->
      <template v-if="!closed">
        <circle cx="30" cy="140" r="5" fill="#f59e0b"/>
        <circle cx="470" cy="140" r="5" fill="#f59e0b"/>
        <text x="25" y="160" font-size="10" fill="#f59e0b">D-膜固定点</text>
        <text x="430" y="160" font-size="10" fill="#f59e0b">D-膜固定点</text>
      </template>
    </svg>

    <p class="cx-note">
      经典驻波类比，不是量子弦动力学模拟。开弦展示固定端边界（端点定域在 D 膜），闭弦展示周期径向形变；图形不能用于读取真实粒子质量或自旋。
    </p>

    <details>
      <summary>公式与探索问题</summary>
      <p><b>驻波方程：</b>开弦类比 y = A sin(nπx/L) cos(ωt)；闭弦类比 r(θ,t) = R₀ + A sin(nθ) cos(ωt)。</p>
      <p><b>世界面概念：</b>一维弦在时间演化下扫过二维曲面（Worldsheet）。开启世界面扫掠可以看到沿时间 τ 展开的多重弦截面。</p>
      <p><b>思考：</b>为什么真实量子弦论需要 26 维或 10 维临界空间，而我们这里仅用一维位移就能画出振动？（因为经典波动方程在任意维数都存在解，而量子弦的一致性需要消除世界面共形反常与保持洛伦兹代数封闭）。</p>
    </details>
  </section>
</div>
</template>
