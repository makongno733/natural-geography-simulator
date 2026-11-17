<template>
  <aside
    class="community-mini-globe"
    :class="{ 'is-dragging': isDragging, 'is-ready': ready3d, 'is-fallback': isFallback }"
    aria-label="三维地球观察站与地理实证入口"
  >
    <div class="globe-main-row">
      <!-- 左侧/上方：3D 地球舞台 + 静态地球无缝垫底 + 拨动响应方位环 -->
      <div class="globe-stage-wrap">
        <div class="globe-stage-outer">
          <div
            ref="stageRef"
            class="globe-stage"
            :aria-busy="!ready3d && !isFallback"
          >
            <!-- 静态地球底图预览：首屏 0ms 立即可见（聚焦东亚 31°N, 112°E），3D 就绪后自然平滑接管；无 WebGL 或减少动态效果时作为稳定展示 -->
            <div class="globe-static-preview" :class="{ 'fade-out': ready3d && !isFallback }">
              <img
                :src="earthStaticPreviewJpg"
                alt="NASA 地球卫星合成影像预览（聚焦东亚与西太平洋区域）"
                width="220"
                height="220"
              />
              <span class="static-east-asia-dot" aria-hidden="true"></span>
            </div>

            <!-- 经纬网格与拨动方向响应环（仅在用户拨动地球时高亮强调观察方向） -->
            <svg class="globe-compass-ring" viewBox="0 0 220 220" aria-hidden="true">
              <circle cx="110" cy="110" r="102" class="ring-outer" />
              <circle cx="110" cy="110" r="94" class="ring-ticks" />
              <path d="M 110 4 L 110 16 M 110 204 L 110 216 M 4 110 L 16 110 M 204 110 L 216 110" class="ring-cross" />
              <text x="110" y="24" text-anchor="middle" class="ring-dir-txt">N</text>
              <text x="198" y="114" text-anchor="middle" class="ring-dir-txt">E</text>
              <text x="110" y="202" text-anchor="middle" class="ring-dir-txt">S</text>
              <text x="22" y="114" text-anchor="middle" class="ring-dir-txt">W</text>
            </svg>
          </div>

          <!-- 东亚初始锚点微标签（置于圆形裁剪容器外层，避免窄屏圆弧裁切文字） -->
          <span class="globe-pin-tag" aria-hidden="true">
            📍 {{ isDragging ? '正在拨动观察方向' : '东亚 · 31°N, 112°E' }}
          </span>
        </div>

        <!-- 地球自转与视角重置控制条 -->
        <div class="globe-ctrl-bar" role="group" aria-label="三维地球旋转与视角控制">
          <button
            v-if="!isFallback"
            type="button"
            class="globe-ctrl-btn"
            :aria-pressed="!rotating"
            @click="handleToggleRotate"
          >
            {{ rotating ? '⏸ 暂停' : '▶ 继续' }}
          </button>
          <button
            v-if="!isFallback"
            type="button"
            class="globe-ctrl-btn"
            @click="handleResetView"
          >
            🎯 回到东亚
          </button>
          <span v-else class="globe-fallback-pill" role="status">
            🌐 静态地球模式
          </span>
        </div>
      </div>

      <!-- 右侧/下方：具体地理观察问题与一键进入观察入口 -->
      <div class="globe-task-panel">
        <div class="globe-mode-tabs" role="tablist" aria-label="切换地球观察主题">
          <button
            type="button"
            role="tab"
            :aria-selected="activeTaskKey === 'satellite'"
            :class="['globe-tab-btn', { active: activeTaskKey === 'satellite' }]"
            @click="selectTask('satellite')"
          >
            🛰 实测卫星对比
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="activeTaskKey === 'thermal'"
            :class="['globe-tab-btn', { active: activeTaskKey === 'thermal' }]"
            @click="selectTask('thermal')"
          >
            🌬 海岸昼夜风向
          </button>
        </div>

        <div class="globe-task-content">
          <div class="globe-nature-row">
            <span class="globe-nature-badge" :class="currentTask.badgeClass">
              {{ currentTask.natureLabel }}
            </span>
            <span class="globe-coord-label">{{ currentTask.coordLabel }}</span>
          </div>

          <h3 class="globe-question-title">{{ currentTask.question }}</h3>
          <p class="globe-question-desc">{{ currentTask.description }}</p>

          <div class="globe-cta-row">
            <router-link :to="currentTask.route" class="globe-cta-btn">
              {{ currentTask.ctaText }} →
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部简短来源与教学性质说明 -->
    <p class="globe-credit-line">
      <span>
        球面底图：<a href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/" target="_blank" rel="noopener noreferrer">NASA Blue Marble</a>（实测合成）；云系与光晕为教学示意。
      </span>
      <span class="globe-status-text">
        {{ isDragging ? '🧭 已激活观察方位环' : isFallback ? '当前为静态地球预览' : '可左右拨动地球观察海陆与云系' }}
      </span>
    </p>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import earthStaticPreviewJpg from '../assets/geo-verified/blue-marble-bathymetry-july-2048.jpg?url'

const GLOBE_TASKS = {
  satellite: {
    key: 'satellite',
    natureLabel: '真实卫星影像 · NASA MODIS Terra',
    badgeClass: 'is-real-data',
    coordLabel: '中国东部 · 31°N, 112°E（2024-06-01 vs 06-15）',
    question: '同一地点，卫星隔两周拍到了什么？',
    description:
      '对准东亚季风区（长江中下游湖区），移动卷帘对比相隔两周的真实卫星真彩色影像（分辨率 250m–1km），观察雨带云系移动与湖泊水体变化。',
    ctaText: '看真实卫星影像',
    route: '/geo-labs/satellite?place=china&dateA=2024-06-01&dateB=2024-06-15&from=home-globe'
  },
  thermal: {
    key: 'thermal',
    natureLabel: '教学仿真示意 · ΔT = 8°C 环流模型',
    badgeClass: 'is-simulation',
    coordLabel: '东亚海岸线 · 白昼海风 vs 夜晚陆风',
    question: '同在海边，白天和夜晚风为什么反着吹？',
    description:
      '观察海陆受热快慢差异：白天陆地升温快形成近地低压，海风从海洋吹向陆地；夜晚陆地冷却快形成近地高压，陆风吹向海洋。',
    ctaText: '进热力环流实验',
    route: '/experiments/meteorology/thermal-circulation?preset=land-sea-breeze'
  }
}

const stageRef = ref(null)
const activeTaskKey = ref('satellite')
const ready3d = ref(false)
const isFallback = ref(false)
const isDragging = ref(false)

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const rotating = ref(!prefersReducedMotion)

let globeInstance = null
let unmounted = false

const currentTask = computed(() => GLOBE_TASKS[activeTaskKey.value] || GLOBE_TASKS.satellite)

function selectTask(key) {
  activeTaskKey.value = key
  if (globeInstance) {
    globeInstance.resetToEastAsia()
  }
}

function handleToggleRotate() {
  if (!globeInstance) return
  rotating.value = globeInstance.toggleAutoRotate()
}

function handleResetView() {
  if (!globeInstance) return
  globeInstance.resetToEastAsia()
}

onMounted(async () => {
  if (typeof window === 'undefined' || !stageRef.value) return
  if (window.__FORCE_GLOBE_FALLBACK__) {
    isFallback.value = true
    return
  }

  try {
    const { mountCommunityMiniGlobe } = await import('./communityGlobeRuntime.js')
    if (unmounted || !stageRef.value) return
    globeInstance = await mountCommunityMiniGlobe(stageRef.value, {
      initialRotating: !prefersReducedMotion,
      onReady() {
        if (!unmounted) ready3d.value = true
      },
      onFallback() {
        if (!unmounted) {
          isFallback.value = true
          ready3d.value = false
        }
      },
      onDragChange(dragging) {
        if (!unmounted) isDragging.value = dragging
      },
      onRotationChange(autoRot) {
        if (!unmounted) rotating.value = autoRot
      }
    })
    if (!globeInstance && !unmounted) {
      isFallback.value = true
    }
  } catch {
    if (!unmounted) {
      isFallback.value = true
      ready3d.value = false
    }
  }
})

onBeforeUnmount(() => {
  unmounted = true
  globeInstance?.dispose()
  globeInstance = null
})
</script>

<style scoped>
.community-mini-globe {
  background: radial-gradient(circle at 28% 32%, rgba(14, 116, 144, 0.34) 0%, rgba(7, 32, 43, 0.82) 68%, rgba(5, 22, 32, 0.92) 100%);
  border: 1px solid rgba(163, 233, 221, 0.32);
  border-radius: 20px;
  padding: 14px 16px 12px;
  color: #f0f9ff;
  box-shadow: 0 12px 30px rgba(3, 15, 24, 0.32);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  touch-action: pan-y;
}

.community-mini-globe.is-dragging {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.35), 0 14px 34px rgba(3, 15, 24, 0.45);
}

.globe-main-row {
  display: grid;
  grid-template-columns: 184px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.globe-stage-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.globe-stage-outer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.globe-stage {
  position: relative;
  width: 176px;
  height: 176px;
  border-radius: 50%;
  overflow: hidden;
  background: radial-gradient(circle at 38% 35%, #0c3b5e 0%, #051626 70%, #020b14 100%);
  box-shadow: inset 0 0 22px rgba(56, 189, 248, 0.28), 0 4px 16px rgba(0, 0, 0, 0.4);
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

.globe-stage:active {
  cursor: grabbing;
}

.globe-static-preview {
  position: absolute;
  inset: 5%;
  z-index: 1;
  border-radius: 50%;
  overflow: hidden;
  pointer-events: none;
  transition: opacity 0.45s ease;
  box-shadow:
    inset -18px -14px 26px rgba(2, 8, 20, 0.82),
    inset 10px 10px 20px rgba(125, 211, 252, 0.35),
    0 0 14px rgba(56, 189, 248, 0.32);
}

.globe-static-preview.fade-out {
  opacity: 0;
}

.globe-static-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 聚焦东亚与西太平洋区域（约 31°N, 112°E），与 3D 初始视角严格一致 */
  object-position: 81% 34%;
  border-radius: 50%;
  filter: saturate(1.22) contrast(1.08) brightness(1.06);
}

.static-east-asia-dot {
  position: absolute;
  left: 52%;
  top: 42%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #38bdf8;
  border: 2px solid #fde047;
  box-shadow: 0 0 0 4px rgba(253, 224, 71, 0.35);
  transform: translate(-50%, -50%);
}

.globe-stage :deep(canvas) {
  position: relative;
  z-index: 2;
  border-radius: 50%;
}

/* 方位观察环：默认低调，拨动地球时高亮响应 */
.globe-compass-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  opacity: 0.24;
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.community-mini-globe.is-dragging .globe-compass-ring {
  opacity: 0.95;
  transform: scale(1.015);
}

.ring-outer {
  fill: none;
  stroke: rgba(125, 211, 252, 0.55);
  stroke-width: 1.2;
}

.ring-ticks {
  fill: none;
  stroke: rgba(253, 224, 71, 0.5);
  stroke-width: 1;
  stroke-dasharray: 3 6;
}

.ring-cross {
  stroke: rgba(56, 189, 248, 0.75);
  stroke-width: 1.5;
}

.ring-dir-txt {
  fill: #bae6fd;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
}

.globe-pin-tag {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  background: rgba(4, 19, 32, 0.88);
  border: 1px solid rgba(125, 211, 252, 0.45);
  color: #e0f2fe;
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
}

.community-mini-globe.is-dragging .globe-pin-tag {
  background: rgba(2, 132, 199, 0.95);
  border-color: #fde047;
  color: #ffffff;
}

.globe-ctrl-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
}

.globe-ctrl-btn {
  background: rgba(15, 39, 66, 0.75);
  color: #e0f2fe;
  border: 1px solid rgba(125, 211, 252, 0.35);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  min-height: 28px;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.globe-ctrl-btn:hover {
  background: rgba(2, 132, 199, 0.45);
  border-color: #7dd3fc;
}

.globe-fallback-pill {
  font-size: 11.5px;
  color: #bae6fd;
  background: rgba(15, 39, 66, 0.72);
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.35);
  white-space: nowrap;
}

/* 右侧观察问题面板 */
.globe-task-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.globe-mode-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.globe-tab-btn {
  background: rgba(7, 29, 39, 0.6);
  color: #bae6fd;
  border: 1px solid rgba(125, 211, 252, 0.25);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  min-height: 30px;
}

.globe-tab-btn.active {
  background: rgba(2, 132, 199, 0.38);
  color: #ffffff;
  border-color: #38bdf8;
}

.globe-task-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.globe-nature-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.globe-nature-badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
}

.globe-nature-badge.is-real-data {
  background: rgba(16, 185, 129, 0.22);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.45);
}

.globe-nature-badge.is-simulation {
  background: rgba(245, 158, 11, 0.22);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.45);
}

.globe-coord-label {
  font-size: 11.5px;
  color: #93c5fd;
  font-family: ui-monospace, monospace;
}

.globe-question-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.35;
}

.globe-question-desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: #cbd5e1;
}

.globe-cta-row {
  margin-top: 4px;
}

.globe-cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0284c7, #0d9488);
  color: #ffffff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 800;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.55);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.globe-cta-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(2, 132, 199, 0.45);
}

.globe-credit-line {
  margin: 10px 0 0;
  padding-top: 8px;
  border-top: 1px solid rgba(163, 233, 221, 0.16);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11.5px;
  color: #94a3b8;
}

.globe-credit-line a {
  color: #7dd3fc;
  text-decoration: none;
}

.globe-credit-line a:hover {
  text-decoration: underline;
}

.globe-status-text {
  color: #a8dcd2;
  font-weight: 600;
}

/* 桌面右侧窄列与手机端紧凑模式自适应 */
@media (max-width: 1180px) and (min-width: 721px) {
  .globe-main-row {
    grid-template-columns: 156px minmax(0, 1fr);
  }
  .globe-stage {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 560px) {
  .community-mini-globe {
    padding: 11px 12px;
    border-radius: 16px;
  }
  .globe-main-row {
    grid-template-columns: 108px minmax(0, 1fr);
    gap: 10px;
  }
  .globe-stage-wrap {
    gap: 5px;
  }
  .globe-stage {
    width: 100px;
    height: 100px;
  }
  .globe-pin-tag {
    font-size: 11px;
    padding: 2px 6px;
    bottom: 2px;
  }
  .globe-ctrl-btn {
    padding: 3px 7px;
    font-size: 11.5px;
    min-height: 26px;
  }
  .globe-task-panel {
    gap: 5px;
  }
  .globe-tab-btn {
    padding: 3px 8px;
    font-size: 11.5px;
    min-height: 26px;
  }
  .globe-question-title {
    font-size: 14.5px;
    line-height: 1.3;
  }
  .globe-question-desc {
    font-size: 12px;
    line-height: 1.45;
  }
  .globe-cta-row {
    margin-top: 3px;
  }
  .globe-cta-btn {
    width: 100%;
    padding: 7px 12px;
    font-size: 13px;
  }
  .globe-credit-line {
    margin-top: 6px;
    padding-top: 5px;
    font-size: 11.5px;
  }
}
</style>
