<template>
  <div class="community-wrap resources-page">
    <router-link class="community-back" to="/community">← 返回社区</router-link>

    <header class="resources-hero baroque-frame">
      <p class="community-eyebrow">OPEN GEOGRAPHY DATA & ASSETS / 开放数据</p>
      <h1>权威地理科学数据与开放资源馆</h1>
      <p class="resources-lead">
        精选全球及全国尺度权威开放高程 DEM、ERA5 气象再分析、1:100万 地理信息底图、Sentinel 卫星覆被产品与站内开源 3D 动力学课件资产。
      </p>
      <div class="resources-badges">
        <span>🌐 开放科学计划</span>
        <span>🛰 航天与对地观测</span>
        <span>📚 中学课标大概念配套</span>
      </div>
    </header>

    <p v-if="loading" class="community-state" role="status">正在读取开放资源库……</p>
    <p v-else-if="error" class="community-state community-error" role="alert">{{ error }}</p>

    <div v-else class="resources-grid">
      <article v-for="res in resources" :key="res.id" class="resource-card baroque-frame">
        <div class="res-meta-row">
          <span class="res-cat-badge">{{ res.category }}</span>
          <span class="res-format-tag">{{ res.format }}</span>
        </div>

        <h3 class="res-title">{{ res.title }}</h3>
        <p class="res-desc">{{ res.description }}</p>

        <div class="res-spec-table">
          <div class="spec-row">
            <span class="spec-k">数据尺度 / 分辨率</span>
            <span class="spec-v">{{ res.scale }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-k">许可协议</span>
            <span class="spec-v">{{ res.license }}</span>
          </div>
        </div>

        <div class="res-action-row">
          <a class="baroque-btn baroque-btn-brass" :href="res.sourceUrl" target="_blank" rel="noopener noreferrer">
            访问源数据开放发布页 ↗
          </a>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { apiRequest } from '../account/client.js'

const resources = ref([])
const loading = ref(false)
const error = ref('')

async function loadResources() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiRequest('/api/community/resources')
    resources.value = res.resources || []
  } catch (err) {
    error.value = err.message || '读取资源列表失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadResources)
</script>

<style scoped>
.resources-page {
  padding-top: 36px;
  padding-bottom: 90px;
}

.resources-hero {
  padding: 44px 36px;
  margin-bottom: 36px;
  background: radial-gradient(circle at 80% 20%, #173229 0%, #0d211a 60%, #06140f 100%);
  color: #f5f4ef;
  border-radius: var(--radius-box);
  border: 1px solid rgba(197, 160, 89, 0.35);
  box-shadow: var(--shadow-md);
}

.resources-hero h1 {
  font-size: clamp(30px, 4vw, 46px);
  margin: 12px 0 16px;
  color: #ffffff;
  font-family: Georgia, 'Playfair Display', 'Songti SC', serif;
  letter-spacing: -0.02em;
}

.resources-lead {
  font-size: 16px;
  line-height: 1.8;
  color: #d1ded7;
  max-width: 760px;
  margin: 0 0 20px;
}

.resources-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.resources-badges span {
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(197, 160, 89, 0.4);
  font-size: 12.5px;
  color: #e5d8b8;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 22px;
}

.resource-card {
  display: flex;
  flex-direction: column;
  padding: 26px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s var(--geo-flow-ease), box-shadow 0.2s, border-color 0.2s;
}

.resource-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--geo-ocean);
}

.res-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.res-cat-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: var(--geo-green-soft);
  color: var(--geo-green-deep);
  border: 1px solid rgba(45, 106, 79, 0.2);
}

.res-format-tag {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: var(--text-faint);
  background: var(--bg-soft);
  padding: 2px 7px;
  border-radius: var(--radius-sm);
}

.res-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
  line-height: 1.4;
}

.res-desc {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text-muted);
  margin: 0 0 18px;
  flex: 1;
}

.res-spec-table {
  background: var(--bg-soft);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
  font-size: 12px;
  display: grid;
  gap: 6px;
}

.spec-row {
  display: flex;
  justify-content: space-between;
}

.spec-k {
  color: var(--text-faint);
}

.spec-v {
  color: var(--geo-ocean-deep);
  font-weight: 600;
}

.res-action-row {
  padding-top: 14px;
  border-top: 1px dashed var(--border);
}

.res-action-row a {
  display: inline-flex;
  width: 100%;
  justify-content: center;
  text-decoration: none;
  font-size: 13px;
}
</style>
