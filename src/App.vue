<template>
  <div class="app-root">
    <div class="top-rainbow" :class="{ active: navLoading }" aria-hidden="true"></div>
    <div class="aurora" aria-hidden="true"></div>
    <div class="cursor-glow" aria-hidden="true"></div>
    <header class="app-header">
      <div class="header-inner">
        <router-link to="/" class="brand" aria-label="返回首页">
          <span class="brand-mark" aria-hidden="true">
            <span class="brand-orb"></span>
          </span>
          <span class="brand-name">中学地理教学系统</span>
        </router-link>
        <nav class="app-nav" aria-label="主导航">
          <router-link to="/" class="nav-link" :class="{ active: isHome }">首页</router-link>
          <router-link to="/初中" class="nav-link" :class="{ active: grade === '初中' }">初中</router-link>
          <router-link to="/高中" class="nav-link" :class="{ active: grade === '高中' }">高中</router-link>
          <router-link to="/experiments" class="nav-link" :class="{ active: isExperiments }">地理实验室</router-link>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    <div class="sparkle-layer" aria-hidden="true">
      <span
        v-for="sparkle in sparkles"
        :key="sparkle.id"
        class="sparkle"
        :style="{ left: `${sparkle.x}px`, top: `${sparkle.y}px` }"
      >✦</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const isHome = computed(() => route.path === '/')
const isExperiments = computed(() => route.path.startsWith('/experiments'))
const grade = computed(() => route.params.grade || '')

// —— 顶部彩虹加载条：路由切换时亮起 ——
const navLoading = ref(false)
let navTimer = null
router.beforeEach(() => {
  navLoading.value = true
})
router.afterEach(() => {
  if (typeof window === 'undefined') return
  clearTimeout(navTimer)
  navTimer = window.setTimeout(() => {
    navLoading.value = false
  }, 420)
})

// —— 鼠标跟踪光斑：平滑插值把光标位置写入 CSS 变量 ——
// 静止 2 秒休眠、切后台暂停、系统减弱动态时完全不跑，省电。
let targetX = 0.5
let targetY = 0.4
let currentX = targetX
let currentY = targetY
let rafId = null
let lastMoveTime = 0
const reducedMotion = typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function onMouseMove(event) {
  if (reducedMotion) return
  targetX = event.clientX / window.innerWidth
  targetY = event.clientY / window.innerHeight
  lastMoveTime = performance.now()
  if (document.hidden) return
  if (rafId === null) rafId = requestAnimationFrame(tick)
}

function tick() {
  if (document.hidden || performance.now() - lastMoveTime > 2000) {
    rafId = null
    return
  }
  currentX += (targetX - currentX) * 0.08
  currentY += (targetY - currentY) * 0.08
  const root = document.documentElement
  root.style.setProperty('--mx', `${(currentX * 100).toFixed(2)}%`)
  root.style.setProperty('--my', `${(currentY * 100).toFixed(2)}%`)
  rafId = requestAnimationFrame(tick)
}

function onVisibilityChange() {
  document.documentElement.classList.toggle('motion-paused', document.hidden)
  if (!document.hidden && !reducedMotion && rafId === null && performance.now() - lastMoveTime < 2000) {
    rafId = requestAnimationFrame(tick)
  }
}

// —— 点击星光：光标处迸出一点光，随后淡出 ——
const sparkles = ref([])
let sparkleId = 0
function onClick(event) {
  const id = ++sparkleId
  sparkles.value.push({ id, x: event.clientX, y: event.clientY })
  window.setTimeout(() => {
    sparkles.value = sparkles.value.filter((sparkle) => sparkle.id !== id)
  }, 720)
}

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('click', onClick)
  document.addEventListener('visibilitychange', onVisibilityChange)
  if (!reducedMotion) {
    lastMoveTime = performance.now()
    rafId = requestAnimationFrame(tick)
  }
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  clearTimeout(navTimer)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('click', onClick)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  document.documentElement.classList.remove('motion-paused')
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.5);
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
}

.header-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  color: var(--text);
  min-width: 0;
}

.brand-mark {
  position: relative;
  width: 20px;
  height: 20px;
  flex: none;
}

.brand-orb {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background-image: var(--rainbow);
  background-size: 300% 100%;
  animation: rainbow-slide 4.5s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

/* Apple 跑马灯：外圈彩虹光环旋转追逐 */
.brand-mark::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(#a8c4ff, #b9a8ff, #e0b8ee, #b9d4ff, #a8c4ff);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
  animation: rainbow-spin 2.6s linear infinite;
}

/* Apple 跑马灯第二层：更外一圈反向飞掠的光弧（Siri 双环） */
.brand-mark::after {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(185, 168, 255, 0.75) 42deg, rgba(224, 184, 238, 0.75) 66deg, rgba(168, 196, 255, 0.75) 92deg, transparent 150deg);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px));
  animation: rainbow-spin 2.6s linear infinite reverse;
  opacity: 0.85;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.app-nav {
  display: flex;
  align-items: center;
  gap: 22px;
}

.nav-link {
  position: relative;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  padding: 6px 1px;
  transition: color var(--transition);
  white-space: nowrap;
}

.nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background-image: var(--rainbow-fade);
  background-size: 300% 100%;
  animation: rainbow-slide 5s ease-in-out infinite;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform var(--transition);
}

.nav-link:hover {
  color: var(--accent);
}

.nav-link.active {
  color: var(--accent);
  font-weight: 600;
}

.nav-link.active::after {
  transform: scaleX(1);
}

.app-main {
  position: relative;
  z-index: 1;
  flex: 1;
  width: 100%;
  min-width: 0;
}

/* 顶部彩虹加载条（Google 风格，路由切换时亮起流动） */
.top-rainbow {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2.5px;
  z-index: 300;
  background-image: var(--rainbow);
  background-size: 300% 100%;
  animation: rainbow-slide 1.1s linear infinite;
  opacity: 0;
  transition: opacity 0.22s ease;
  pointer-events: none;
}

.top-rainbow.active {
  opacity: 1;
}

/* 极光：大块淡彩光斑缓慢漂移、缓缓变色，融化在背景里 */
.aurora {
  position: fixed;
  inset: -15%;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(38% 52% at 28% 34%, rgba(150, 180, 255, 0.18), transparent 70%),
    radial-gradient(34% 48% at 72% 62%, rgba(185, 160, 255, 0.15), transparent 70%),
    radial-gradient(28% 40% at 56% 22%, rgba(224, 170, 230, 0.1), transparent 70%),
    radial-gradient(30% 44% at 46% 84%, rgba(130, 190, 255, 0.12), transparent 70%);
  animation: aurora-drift 22s ease-in-out infinite, glow-hue 48s linear infinite;
}

/* 鼠标跟踪光斑（独立元素，缓缓循环彩虹色） */
.cursor-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(640px circle at var(--mx, 50%) var(--my, 42%), rgba(120, 170, 255, 0.26), transparent 70%);
  animation: glow-hue 14s linear infinite;
}

/* 页面切换动画：淡入上移 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.sparkle-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
}

.sparkle {
  position: absolute;
  transform: translate(-50%, -50%);
  color: #e8f2ff;
  font-size: 16px;
  line-height: 1;
  text-shadow: 0 0 8px rgba(170, 205, 255, 0.95), 0 0 18px rgba(120, 170, 255, 0.6);
  animation: sparkle-pop 0.7s ease-out forwards;
}

@keyframes sparkle-pop {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.25) rotate(28deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5) translateY(-16px) rotate(60deg);
  }
}

@media (max-width: 720px) {
  .header-inner {
    height: auto;
    padding: 8px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .brand-name { font-size: 15px; }

  .app-nav {
    width: 100%;
    justify-content: space-between;
    gap: 2px;
  }

  .nav-link {
    font-size: 13px;
    padding: 6px 8px;
    flex: 1;
    text-align: center;
  }
}
</style>
