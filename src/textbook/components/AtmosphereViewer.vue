<template>
  <section class="atmo-viewer aero-theme-wrapper">
    <div class="atmo-header-banner">
      <div class="banner-station">
        <span class="station-icon">🛰️</span>
        <div>
          <span class="station-eyebrow">高空物理与大气探测气象站</span>
          <h3 class="station-title">大气圈结构、辐射传输与受热过程系统</h3>
        </div>
      </div>
      <div class="atmo-mode">
        <span class="mode-label">教学模式</span>
        <button
          :class="['mode-btn', { active: currentMode === 'simple' }]"
          @click="setMode('simple')"
          type="button"
        >高中必修</button>
        <button
          :class="['mode-btn', { active: currentMode === 'professional' }]"
          @click="setMode('professional')"
          type="button"
        >大学物理</button>
      </div>
    </div>

    <div class="atmo-toolbar">
      <div class="atmo-tabs">
        <button
          v-for="(tab, i) in tabs"
          :key="i"
          :class="['atmo-tab', { active: activeTab === i }]"
          @click="activeTab = i"
          type="button"
        >
          {{ tab }}
        </button>
      </div>
      <div class="atmo-controls">
        <button class="control-btn" @click="toggleRotate" type="button">{{ rotating ? '⏸ 暂停旋转' : '▶ 旋转球体' }}</button>
        <button class="control-btn" @click="zoomBy(0.85)" type="button">🔍 放大</button>
        <button class="control-btn" @click="zoomBy(1.15)" type="button">🔍 缩小</button>
        <button class="control-btn reset-view-btn" @click="resetView" type="button">↺ 复位</button>
      </div>
    </div>

    <div class="atmo-canvas-wrap">
      <div ref="sceneContainer" class="atmo-canvas"></div>
      <div class="atmo-telemetry-overlay">
        <span class="telemetry-badge">{{ tabs[activeTab] }} · {{ currentMode === 'simple' ? '基础物理图谱' : '高精度辐射剖面' }}</span>
      </div>
    </div>

    <!-- 教学四要素机理与连贯性面板 -->
    <ModelPedagogyPanel
      theme="meteorology"
      :observe="currentPedagogy.observe"
      :change="currentPedagogy.change"
      :mechanism="currentPedagogy.mechanism"
      :limitations="currentPedagogy.limitations"
      :real-data-lab="{ title: 'NASA 卫星云图与大气水汽通道', path: '/geo-labs/satellite', desc: '真实卫星反演水汽与云系' }"
      :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第二章', section: '第一节' }"
      practice-link="/practice"
      @reset="resetView"
    />
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { BaseScene } from '../../engine/core/BaseScene.js'
import { AtmosphereModule } from '../../engine/modules/AtmosphereModule.js'
import ModelPedagogyPanel from '../../experiments/components/ModelPedagogyPanel.vue'

const props = defineProps({
  mode: { type: String, default: 'simple' },
  defaultTab: { type: Number, default: 0 },
  preset: { type: Object, default: () => ({}) },
  lessonContext: { type: Object, default: () => ({}) },
})

const tabs = ['垂直分层', '大气组成', '受热过程', '大气环流', '热力环流', '温室效应']
const activeTab = ref(props.defaultTab || 0)
const currentMode = ref(props.mode)
const sceneContainer = ref(null)
const rotating = ref(false)
let engine = null
let resizeHandler = null

const pedagogies = [
  // 0: 垂直分层
  {
    observe: [
      '对流层（平均 12km）：气温随高度增加而递减（约 -6.5°C/km），对流旺盛，天气复杂多变。',
      '平流层（12~50km）：气温随高度增加而升高（逆温层），臭氧层集中在 20~25km 处，大气平稳适合飞行。',
      '高层大气（50km以上）：气压极低，存在电离层（能够反射无线电短波）。',
    ],
    change: [
      '切换“垂直分层”与其他大气过程标签，观察各高度层的温度递减率变化。',
      '切换“高中必修”与“大学物理”，查看平流层光化学平衡与动力学分层。',
    ],
    mechanism: [
      '对流层直接热源主要来自地面长波辐射，离地面越远热量越少，故温度下高上低。',
      '平流层臭氧强烈吸收太阳紫外线（UV-B/UV-C），上部吸热多、下部吸热少，产生平流逆温。',
      '平流层上热下冷抑制空气垂直对流，以水平平流运动为主，水汽杂质极少，能见度高。',
    ],
    limitations: [
      '厚度按全球平均值标定，未细分赤道对流层（17~18km）与两极对流层（8~9km）的纬度厚度差异。',
      '简化为静力平衡均质水平均匀分层，忽略了行星波与对流层顶折叠（Tropopause fold）扰动。',
      '电离层电子密度随太阳活动周期剧烈波动的特性未予动态数值重现。',
    ],
  },
  // 1: 大气组成
  {
    observe: ['干洁空气中氮气占 78%、氧气占 21%，微量气体二氧化碳占 0.04% 但影响温室效应。', '水汽与固态杂质在低层大气中的集中分布及其成云致雨核心作用。'],
    change: ['切换组分占比显示，探究人类工业活动对二氧化碳与臭氧层的扰动。'],
    mechanism: ['二氧化碳强烈吸收红外长波；水汽相变释放潜热并维系水循环；氧与臭氧维系生物呼吸与防紫外线保护伞。'],
    limitations: ['未模拟气溶胶颗粒谱分布与吸湿性凝结核（CCN）物理活化动力学。'],
  },
  // 2: 受热过程
  {
    observe: [
      '“太阳暖大地”：太阳短波辐射穿透大气，大部分到达地面使地面升温。',
      '“大地暖大气”：地面吸收短波后向外发出地面长波辐射，被低层大气（CO2+水汽）强烈吸收。',
      '“大气还大地”：大气吸收长波增温后向下辐射“大气逆辐射”，将大部分热量返还地面（温室保温）。',
    ],
    change: ['开启旋转球体多视角观察大气对太阳辐射的反射、散射与吸收。'],
    mechanism: [
      '物体的辐射波长与温度成反比（维恩位移定律）：太阳高温发出短波，地面与大气低温发出长波。',
      '水汽和二氧化碳对短波辐射吸收极少（大气“窗”区），但对红外长波辐射具有强烈选择性吸收峰。',
      '大气逆辐射的存在显著减小了昼夜温差，使地球表面平均温度维持在适宜生命繁衍的 15°C。',
    ],
    limitations: [
      '简化为稳态单柱一维辐射传输模型，忽略了复杂云属反射率的瞬变三维效应。',
      '略去了地表显热通量与潜热通量（蒸发耗热）的动力学湍流输送耦合。',
    ],
  },
  // 3: 大气环流
  {
    observe: ['赤道低压带、副热带高压带、副极地低压带、极地高压带“三圈七带”格局。', '信风带、盛行西风带、极地东风带的气压梯度力与地转偏向力合力方向。'],
    change: ['切换全球大气环流模式，观察赤道受热上升与极地冷却下沉的三维环流圈。'],
    mechanism: ['冷热不均（高低纬辐射差）驱动经向流动，地球自转（地转偏向力）迫使经向环流在副热带下沉截断，演化为三圈环流。'],
    limitations: ['略去了海陆分布热力差异对气压带的断裂切割（未展现季风环流和冷高压/低压槽系统）。'],
  },
  // 4: 热力环流
  {
    observe: ['受热上升、受冷下沉；近地面由冷源吹向热源，高空由热源吹向冷源。'],
    change: ['改变观测角度，查看闭合气流轨迹。'],
    mechanism: ['气压差驱动空气沿气压梯度流动，形成最基本的热力环流。'],
    limitations: ['略去摩擦衰减，未模拟局地微地形阻滞。'],
  },
  // 5: 温室效应
  {
    observe: ['温室气体浓度增加时光线吸收率增加，地面散失的长波辐射被截留并在低层大气蓄积。'],
    change: ['观察长波辐射与大气逆辐射的通量变化。'],
    mechanism: ['强化的大气逆辐射弥补了地表长波辐射的散失，导致全球平均地表温度上升。'],
    limitations: ['本模型定性阐释温室辐射吸收机理，不能用于具体碳达峰/碳中和年限的数值精确预报。'],
  },
]

const currentPedagogy = computed(() => pedagogies[activeTab.value] || pedagogies[0])

function setMode(m) {
  currentMode.value = m
  if (engine) engine.setMode(m)
}

watch(activeTab, (val) => {
  if (engine) engine.setParams({ theme: val })
})

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

onMounted(() => {
  engine = new BaseScene(sceneContainer.value, {
    bg: 0x08101e,
    mode: currentMode.value,
    lightPreset: 'sunlit',
  })
  engine.loadModule(AtmosphereModule, { mode: currentMode.value, theme: activeTab.value })
  resizeHandler = () => engine?.resize()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (engine) engine.dispose()
})
</script>

<style scoped>
.aero-theme-wrapper {
  background: #08111e;
  border: 1px solid rgba(2, 132, 199, 0.25);
  border-radius: var(--radius-card, 16px);
  padding: 16px;
  color: #f1f5f9;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  margin-bottom: 20px;
}

.atmo-header-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.banner-station {
  display: flex;
  align-items: center;
  gap: 10px;
}
.station-icon { font-size: 24px; }
.station-eyebrow {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #0284c7;
  font-weight: 700;
  display: block;
}
.station-title {
  margin: 2px 0 0;
  font-size: 17px;
  font-weight: 700;
  color: #f8fafc;
}

.atmo-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 0;
}
.atmo-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.atmo-tab {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 41, 59, 0.7);
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
  cursor: pointer;
  border-radius: 8px;
  font-family: inherit;
  transition: all 0.2s;
}
.atmo-tab:hover {
  background: rgba(2, 132, 199, 0.2);
  border-color: rgba(2, 132, 199, 0.4);
}
.atmo-tab.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(2, 132, 199, 0.4);
}

.atmo-mode {
  display: flex;
  align-items: center;
  gap: 6px;
}
.mode-label {
  font-size: 11px;
  color: #94a3b8;
}
.mode-btn {
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(15, 23, 42, 0.8);
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #cbd5e1;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}
.mode-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
}

.atmo-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.control-btn {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.control-btn:hover {
  background: rgba(2, 132, 199, 0.2);
  border-color: #0284c7;
}

.atmo-canvas-wrap {
  position: relative;
  width: 100%;
  height: 480px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.atmo-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.atmo-telemetry-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  pointer-events: none;
}
.telemetry-badge {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(2, 132, 199, 0.4);
  color: #38bdf8;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .atmo-header-banner { flex-direction: column; align-items: flex-start; }
  .atmo-toolbar { flex-direction: column; align-items: flex-start; }
  .atmo-canvas-wrap { height: 320px; }
}
</style>
