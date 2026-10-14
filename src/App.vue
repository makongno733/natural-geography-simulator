<template>
  <div class="app-root">
    <!-- 极轻量墨蓝加载指示 -->
    <div class="nav-progress-bar" :class="{ active: navLoading }" aria-hidden="true"></div>

    <header class="app-header" :class="{ 'is-dark-nav': isHome && !isScrolled }">
      <div class="header-inner">
        <!-- 账号中心环境与主站的品牌链接 -->
        <a v-if="isAccountHost" :href="`${siteOrigin}/#/`" class="brand" aria-label="返回地理教学系统">
          <BrandMark />
          <div class="brand-text">
            <span class="brand-name">中学地理教学系统</span>
            <span class="brand-sub">ACCOUNT CENTER · 账号服务</span>
          </div>
        </a>

        <router-link v-else to="/" class="brand" aria-label="中学地理教学系统首页" @click="onBrandClick">
          <BrandMark ref="brandMark" :dark="isHome && !isScrolled" />
          <div class="brand-text">
            <span class="brand-name">中学地理教学系统</span>
            <span class="brand-sub">三维地球 · 地理过程 · 初高中课程</span>
          </div>
        </router-link>

        <nav v-if="isAccountHost" class="app-nav" aria-label="账号导航">
          <a class="nav-link" :href="`${siteOrigin}/#/`">返回课程</a>
        </nav>

        <nav v-else class="app-nav" aria-label="主导航">
          <router-link to="/" class="nav-link" :class="{ active: isHome }">
            <span class="nav-label">首页</span>
          </router-link>
          <router-link to="/experiments" class="nav-link" :class="{ active: isExperiments }">
            <span class="nav-badge-dot" aria-hidden="true"></span>
            <span class="nav-label">3D 探索</span>
          </router-link>
          <router-link to="/inquiry" class="nav-link" :class="{ active: route.path === '/inquiry' }">
            <span class="nav-label">地理探究</span>
          </router-link>
          <router-link to="/practice" class="nav-link" :class="{ active: route.path === '/practice' }">
            <span class="nav-label">地理练习</span>
          </router-link>
          <router-link to="/初中" class="nav-link" :class="{ active: grade === '初中' }">
            <span class="nav-label">初中课程</span>
          </router-link>
          <router-link to="/高中" class="nav-link" :class="{ active: grade === '高中' }">
            <span class="nav-label">高中课程</span>
          </router-link>
          <router-link to="/knowledge" class="nav-link" :class="{ active: route.path === '/knowledge' }">
            <span class="nav-label">教材知识库</span>
          </router-link>
          <a v-if="accountEnabled" class="nav-link nav-account-btn" :href="`${accountOrigin}/#/account`">
            <span>{{ accountUser ? '我的账号' : '登录 / 注册' }}</span>
          </a>
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

    <!-- 底部教学系统与地理要素信息 -->
    <footer class="app-footer" v-if="!isAccountHost">
      <div class="footer-inner">
        <div class="footer-meta">
          <div class="footer-brand">
            <span class="footer-logo">🌏 中学地理数字化教学与实验系统</span>
            <p class="footer-desc">
              从地球尺度认识中国与世界。以初高中地理课程为主线，连接真实地理影像、空间示意与交互实验。
            </p>
          </div>
          <div class="footer-links">
            <div class="footer-col">
              <h4>课程教材体系</h4>
              <router-link to="/初中">初中地理（七~八年级）</router-link>
              <router-link to="/高中">高中地理（必修第一/二册）</router-link>
              <router-link to="/高中">选择性必修（1~3册）</router-link>
            </div>
            <div class="footer-col">
              <h4>地学科学探究</h4>
              <router-link to="/inquiry">地理探究任务</router-link>
              <router-link to="/geo-labs">真实数据探究</router-link>
              <router-link to="/practice">地理练习与互动模型</router-link>
              <router-link to="/experiments/meteorology">大气与气象实验</router-link>
              <router-link to="/experiments/hydrology">流水地貌与水循环</router-link>
              <router-link to="/experiments/geology">地质构造与岩石圈</router-link>
              <router-link to="/experiments/astronomy">地球运动与日地月</router-link>
            </div>
            <div class="footer-col">
              <h4>地理专业工具</h4>
              <router-link to="/map">地图投影系统</router-link>
              <router-link to="/geo">地质年代标尺</router-link>
              <router-link to="/earth3d">地球三维系统</router-link>
              <router-link to="/disasters">自然灾害模拟</router-link>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-coord">地理课程 · 实景影像 · 交互实验</div>
          <span class="footer-cr">首页影像来源与许可见各影像卡片及资源清单</span>
        </div>
      </div>
    </footer>

    <div v-if="accountEnabled" class="site-legal-links" aria-label="网站信息">
      <a :href="`${siteOrigin}/privacy`">隐私政策</a>
      <a :href="`${siteOrigin}/terms`">服务条款</a>
      <a href="mailto:makongno733@gmail.com">联系网站</a>
    </div>

    <LessonAssistant v-if="!isAccountHost" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LessonAssistant from './assistant/LessonAssistant.vue'
import BrandMark from './brand/BrandMark.vue'
import { accountEnabled, accountOrigin, siteOrigin, authClient } from './account/client.js'

const route = useRoute()
const router = useRouter()
const isAccountHost = accountEnabled && window.location.origin === new URL(accountOrigin).origin
const isHome = computed(() => route.path === '/')
const isExperiments = computed(() => route.path.startsWith('/experiments') || route.path === '/earth3d')
const grade = computed(() => route.params.grade || '')
const accountUser = ref(null)
const brandMark = ref(null)

function onBrandClick(event) {
  if (route.path !== '/' || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  brandMark.value?.play()
}
watch(() => route.path, path => { if (path !== '/') brandMark.value?.stop() })

// 页面切换加载微指示
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
  }, 260)
})

// 滚动检测：首页首屏暗色融合导航
const isScrolled = ref(false)
function onScroll() {
  if (typeof window === 'undefined') return
  isScrolled.value = window.scrollY > 80
}

onMounted(() => {
  if (typeof window === 'undefined') return
  if (accountEnabled) {
    authClient.getSession().then(({ data }) => {
      accountUser.value = data?.user || null
    }).catch(() => {})
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部墨蓝加载进度条 */
.nav-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2.5px;
  background: linear-gradient(90deg, #1f6feb, #4682b4, #52b788);
  z-index: 999;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left;
  transition: opacity 0.2s ease, transform 0.3s ease;
  pointer-events: none;
}
.nav-progress-bar.active {
  opacity: 1;
  transform: scaleX(0.88);
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.94);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(15, 39, 66, 0.04);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* 首页首屏暗夜模式导航 */
.app-header.is-dark-nav {
  background: rgba(4, 7, 17, 0.78);
  border-bottom-color: rgba(90, 130, 180, 0.16);
  box-shadow: none;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 28px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--geo-ocean-deep);
  min-width: 0;
  transition: color 0.3s ease;
}
.is-dark-nav .brand {
  color: #f0f4f8;
}

.brand:focus-visible { outline: 2px solid #c28a4b; outline-offset: 5px; border-radius: 4px; }

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: inherit;
  white-space: nowrap;
}

.brand-sub {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
.is-dark-nav .brand-sub {
  color: #b1c5c3;
}

.app-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  position: relative;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  transition: color var(--transition), background var(--transition);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.is-dark-nav .nav-link {
  color: #d5e0de;
}

.nav-link:hover {
  color: var(--geo-ocean-deep);
  background: var(--bg-soft);
}
.is-dark-nav .nav-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.nav-link.active {
  color: var(--geo-ocean-deep);
  font-weight: 600;
  background: var(--geo-ocean-surface);
}
.is-dark-nav .nav-link.active {
  color: #ffffff;
  background: rgba(160, 194, 171, 0.18);
}

.nav-link.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 14px;
  right: 14px;
  height: 2px;
  background: var(--geo-ocean);
  border-radius: 2px;
}
.is-dark-nav .nav-link.active::after {
  background: #a9cabc;
}

.nav-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--geo-terracotta);
}

.nav-account-btn {
  margin-left: 8px;
  background: var(--geo-ocean-mist);
  border: 1px solid var(--border);
  color: var(--geo-ocean);
  font-size: 13px;
}
.is-dark-nav .nav-account-btn {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(90, 130, 180, 0.24);
  color: #c9d1d9;
}
.nav-account-btn:hover {
  background: var(--geo-ocean-surface);
  border-color: var(--border-strong);
}
.is-dark-nav .nav-account-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.app-main {
  position: relative;
  flex: 1;
  width: 100%;
  min-width: 0;
}

/* 页面切换过渡 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 页脚 */
.app-footer {
  margin-top: 80px;
  background: #ffffff;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 28px 32px;
}

.footer-meta {
  display: flex;
  justify-content: space-between;
  gap: 48px;
  padding-bottom: 36px;
  border-bottom: 1px solid var(--border);
}

.footer-brand {
  max-width: 440px;
}

.footer-logo {
  font-size: 15px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
  display: block;
  margin-bottom: 12px;
}

.footer-desc {
  font-size: 13px;
  line-height: 1.65;
  color: var(--text-muted);
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 48px;
}

.footer-col h4 {
  font-size: 13px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
  margin: 0 0 14px;
  letter-spacing: 0.02em;
}

.footer-col a {
  display: block;
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: 8px;
  transition: color var(--transition);
}
.footer-col a:hover {
  color: var(--geo-ocean);
  text-decoration: underline;
}

.footer-bottom {
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-faint);
  flex-wrap: wrap;
  gap: 12px;
}

.footer-coord {
  font-family: ui-monospace, SFMono-Regular, monospace;
}

@media (max-width: 860px) {
  .header-inner {
    height: auto;
    padding: 10px 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .brand { justify-content: center; min-height: 44px; }
  .app-nav {
    overflow-x: auto;
    padding-bottom: 4px;
    justify-content: flex-start;
  }
  .footer-meta {
    flex-direction: column;
    gap: 28px;
  }
  .footer-links {
    flex-wrap: wrap;
    gap: 28px;
  }
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
@media (max-width: 390px) {
  .brand-sub { display: none; }
  .brand-name { font-size: 14px; }
}
.site-legal-links { display:flex; justify-content:center; flex-wrap:wrap; gap:20px; padding:12px 20px 20px; background:#f4f6f3; }
.site-legal-links a { color:#4d625e; font-size:12px; }
</style>
