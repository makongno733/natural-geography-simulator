<template>
  <div class="app-root">
    <header class="app-header">
      <div class="header-inner">
        <router-link to="/" class="brand" aria-label="返回首页">
          <span class="brand-dot" aria-hidden="true"></span>
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
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isHome = computed(() => route.path === '/')
const isExperiments = computed(() => route.path.startsWith('/experiments'))
const grade = computed(() => route.params.grade || '')
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
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

.brand-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(135deg, var(--accent), #4d9bff);
  flex: none;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.app-nav {
  display: flex;
  gap: 4px;
}

.nav-link {
  text-decoration: none;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  padding: 7px 13px;
  border-radius: 8px;
  transition: color var(--transition), background var(--transition);
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--accent);
  background: var(--accent-soft);
}

.nav-link.active {
  color: var(--accent);
  background: var(--accent-soft);
  font-weight: 600;
}

.app-main {
  flex: 1;
  width: 100%;
  min-width: 0;
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
