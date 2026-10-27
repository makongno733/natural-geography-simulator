<template>
  <div class="community-wrap resources-page">
    <router-link class="community-back" to="/community">← 返回社区</router-link>

    <header class="resources-hero baroque-frame">
      <p class="community-eyebrow">OPEN GEOGRAPHY DATA & ASSETS / 开放数据</p>
      <h1>权威地理科学数据与开放资源馆</h1>
      <p class="resources-lead">
        汇集具有明确开放科学许可、高分辨率与时空连续性的全球与区域地理科学公共数据集。
      </p>
      <div class="resources-badges">
        <span>🌐 开放科学计划</span>
        <span>🛰 航天与对地观测</span>
        <span>📚 中学课标大概念配套</span>
      </div>
    </header>

    <!-- 资源搜索与分类过滤 -->
    <div class="res-control-bar">
      <div class="res-search-box">
        <input
          v-model.trim="filterKeyword"
          type="search"
          placeholder="搜索高程 DEM、气象再分析、卫星遥感、土地利用……"
          aria-label="搜索开放资源"
        />
      </div>
      <div class="res-category-tabs">
        <button
          v-for="cat in resourceCategories"
          :key="cat"
          type="button"
          class="baroque-tab"
          :class="{ active: selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- 骨架屏加载状态 -->
    <div v-if="loading" class="resources-grid" aria-busy="true">
      <div v-for="i in 4" :key="i" class="skeleton-card">
        <div class="skeleton-box skeleton-line skeleton-line-short"></div>
        <div class="skeleton-box skeleton-line skeleton-line-title"></div>
        <div class="skeleton-box skeleton-line"></div>
        <div class="skeleton-box skeleton-line"></div>
        <div class="skeleton-box skeleton-line skeleton-line-short"></div>
      </div>
    </div>

    <p v-else-if="error && !filteredResources.length" class="community-state community-error" role="alert">
      {{ error }}
      <br />
      <button class="baroque-btn baroque-btn-sm" style="margin-top: 12px" @click="loadResources">重新加载</button>
    </p>

    <p v-else-if="!filteredResources.length" class="community-state" role="status">
      {{ filterKeyword ? `没有找到匹配“${filterKeyword}”的资源，请尝试其他关键词。` : '暂无已收录的开放资源，欢迎推荐有明确来源与使用许可的数据。' }}
    </p>

    <div v-else class="resources-grid">
      <article v-for="res in filteredResources" :key="res.id" class="resource-card baroque-frame">
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
            <span class="spec-k">使用许可协议</span>
            <span class="spec-v">{{ res.license }}</span>
          </div>
        </div>

        <div class="res-action-row">
          <a
            class="baroque-btn baroque-btn-brass"
            :href="res.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            :title="`前往 ${res.title} 官方开放页面`"
          >
            访问源发布平台 ↗
          </a>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '../account/client.js'

const resources = ref([])
const loading = ref(false)
const error = ref('')
const filterKeyword = ref('')
const selectedCategory = ref('全部')

const resourceCategories = computed(() => {
  const set = new Set(['全部'])
  resources.value.forEach(r => {
    if (r.category) set.add(r.category)
  })
  return Array.from(set)
})

const filteredResources = computed(() => {
  return resources.value.filter(res => {
    const matchCat = selectedCategory.value === '全部' || res.category === selectedCategory.value
    if (!matchCat) return false
    if (!filterKeyword.value) return true
    const kw = filterKeyword.value.toLowerCase()
    return (
      res.title.toLowerCase().includes(kw) ||
      res.description.toLowerCase().includes(kw) ||
      res.format.toLowerCase().includes(kw) ||
      res.category.toLowerCase().includes(kw)
    )
  })
})

async function loadResources() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiRequest('/api/community/resources')
    if (!Array.isArray(res?.resources)) throw new Error('资源数据格式错误')
    resources.value = res.resources
  } catch {
    resources.value = []
    error.value = '资源目录暂时无法载入，请稍后重试。'
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
  margin-bottom: 28px;
  background: radial-gradient(circle at 80% 20%, #15273f 0%, #0d1a2d 60%, #08111e 100%);
  color: #f5f3ec;
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
  color: #cfd8e3;
  max-width: 720px;
  line-height: 1.7;
  margin: 0 0 20px;
}

.resources-badges {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.resources-badges span {
  font-size: 12.5px;
  color: #d8c28e;
  background: rgba(197, 160, 89, 0.12);
  border: 1px solid rgba(197, 160, 89, 0.25);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
}

.res-control-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.res-search-box input {
  width: 100%;
  max-width: 600px;
  padding: 12px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  font: inherit;
  font-size: 14.5px;
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 2px 8px rgba(15, 39, 66, 0.04);
  transition: border-color var(--transition), box-shadow var(--transition);
}

.res-search-box input:focus {
  outline: none;
  border-color: var(--baroque-bronze);
  box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.22);
}

.res-category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.baroque-tab {
  padding: 7px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  color: var(--text-muted);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s var(--geo-flow-ease);
}

.baroque-tab:hover {
  border-color: var(--baroque-bronze);
  color: var(--text);
}

.baroque-tab.active {
  background: var(--geo-ocean-deep);
  border-color: var(--baroque-bronze);
  color: #f5f3ec;
  box-shadow: 0 2px 8px rgba(15, 39, 66, 0.18);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.resource-card {
  padding: 26px 28px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  transition: transform 0.22s var(--geo-flow-ease), box-shadow 0.22s var(--geo-flow-ease), border-color 0.22s var(--geo-flow-ease);
}

.resource-card:hover {
  transform: translateY(-3px);
  border-color: var(--baroque-border-gold);
  box-shadow: 0 10px 24px rgba(15, 39, 66, 0.08), 0 0 12px rgba(197, 160, 89, 0.12);
}

.res-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.res-cat-badge {
  font-size: 12px;
  font-weight: 700;
  color: var(--geo-ocean);
  background: var(--geo-ocean-surface);
  padding: 3px 8px;
  border-radius: 4px;
}

.res-format-tag {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: var(--text-faint);
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}

.res-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
  margin: 0 0 10px;
  line-height: 1.45;
}

.res-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 0 18px;
  flex: 1;
}

.res-spec-table {
  background: var(--bg-soft);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.spec-row {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
}

.spec-k {
  color: var(--text-faint);
}

.spec-v {
  color: var(--text);
  font-weight: 600;
}

.res-action-row {
  padding-top: 14px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .resources-hero {
    padding: 30px 20px;
  }
  .resources-grid {
    grid-template-columns: 1fr;
  }
}
</style>
