<template>
  <div class="community-wrap resources-page">
    <router-link class="community-back" to="/community">← 返回社区</router-link>

    <header class="resources-hero baroque-frame">
      <p class="community-eyebrow">开放地理数据与教学资源</p>
      <h1>权威地理科学数据与开放资源馆</h1>
      <p class="resources-lead">
        汇集具有明确开放科学许可的全球与区域地理公共数据集。包含<strong>数字高程模型（DEM：用网格记录地面高度，可画地形剖面）</strong>、<strong>大气再分析（ERA5：逐小时还原全球历史天气与气候）</strong>及卫星遥感影像。
      </p>
      <div class="resources-badges">
        <span>🌐 开放科学许可</span>
        <span>🛰 航天与对地观测</span>
        <span>📚 初高中与大学探究可用</span>
      </div>
    </header>

    <aside v-if="usingFallbackCatalog" class="demo-mode-banner" role="status">
      <div class="demo-banner-content">
        <span class="demo-banner-tag">📚 已核实开放数据目录</span>
        <span>当前未连接云端扩展库，已为您展示内置核实的官方开放科学数据集（NASA / 哥白尼计划 / 国家基础地理信息 / 美国地质调查局 USGS）。</span>
      </div>
      <div class="demo-banner-actions">
        <button class="baroque-btn baroque-btn-sm" type="button" :disabled="loading" @click="loadResources">
          {{ loading ? '同步中…' : '重试云端同步' }}
        </button>
      </div>
    </aside>

    <!-- 资源搜索与分类过滤 -->
    <div class="res-control-bar">
      <div class="res-search-box">
        <input
          v-model.trim="filterKeyword"
          type="search"
          placeholder="搜索地形高程 DEM、气象再分析 ERA5、卫星遥感、矢量底图……"
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

    <div v-else-if="!filteredResources.length" class="community-state" role="status">
      <p>{{ filterKeyword ? `没有找到匹配“${filterKeyword}”的资源，请尝试其他关键词。` : '暂无已收录的开放资源，欢迎推荐有明确来源与使用许可的数据。' }}</p>
      <button v-if="filterKeyword || selectedCategory !== '全部'" type="button" class="baroque-btn baroque-btn-sm" style="margin-top: 8px" @click="filterKeyword = ''; selectedCategory = '全部'">
        清除筛选条件
      </button>
    </div>

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

    <!-- 开放地理数据与研究方法共建推荐入口 -->
    <section class="resource-register-cta baroque-frame" style="margin-top: 40px; padding: 28px 32px; background: #fbf9f3; border: 1px solid #d5c39c; border-radius: 16px; text-align: center">
      <h3 style="margin: 0 0 8px; font-size: 20px; color: #142536">📤 推荐开放地学数据集、开源软件或研究方法</h3>
      <p style="margin: 0 auto 18px; max-width: 640px; color: #475569; font-size: 14.5px; line-height: 1.6">
        欢迎推荐具有明确开放科学许可（如 CC BY 4.0、MIT、NASA/USGS Open Data）的地理数据集、遥感反演代码或公开教学资源。管理员核实来源与许可协议后将收录至开放资源馆。
      </p>
      <button class="baroque-btn baroque-btn-primary" type="button" @click="showSubmitModal = true">
        + 推荐开放地学资源入库 ✍
      </button>
    </section>

    <div
      v-if="showSubmitModal"
      style="position: fixed; inset: 0; z-index: 9999; background: rgba(7, 19, 34, 0.65); display: flex; align-items: center; justify-content: center; padding: 20px"
      role="dialog"
      aria-modal="true"
      @click.self="showSubmitModal = false"
    >
      <div class="baroque-frame" style="width: 100%; max-width: 560px; background: #fff; border-radius: 16px; padding: 26px 30px">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px">
          <h3 style="margin: 0; font-size: 20px; color: #142536">推荐开放地理科学数据或方法</h3>
          <button type="button" style="background: none; border: none; font-size: 24px; cursor: pointer" @click="showSubmitModal = false">×</button>
        </div>
        <form style="display: grid; gap: 12px" @submit.prevent="submitResourceRecommendation">
          <label style="display: grid; gap: 4px; font-size: 13px; font-weight: 600">
            资源 / 数据集名称
            <input v-model.trim="resForm.title" required maxlength="100" placeholder="例如：武汉大学 CLCD 30m 中国年度土地覆盖数据集" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px" />
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
            <label style="display: grid; gap: 4px; font-size: 13px; font-weight: 600">
              学科分类
              <input v-model.trim="resForm.category" required maxlength="40" placeholder="例如：对地观测卫星遥感 / 开放代码" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px" />
            </label>
            <label style="display: grid; gap: 4px; font-size: 13px; font-weight: 600">
              数据格式
              <input v-model.trim="resForm.format" required maxlength="50" placeholder="例如：GeoTIFF / NetCDF / GitHub" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px" />
            </label>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
            <label style="display: grid; gap: 4px; font-size: 13px; font-weight: 600">
              空间尺度 / 分辨率
              <input v-model.trim="resForm.scale" required maxlength="60" placeholder="例如：全国 30m / 全球 0.25°" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px" />
            </label>
            <label style="display: grid; gap: 4px; font-size: 13px; font-weight: 600">
              开放许可协议 (必填)
              <input v-model.trim="resForm.license" required maxlength="80" placeholder="例如：CC BY 4.0 / MIT / Public Domain" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px" />
            </label>
          </div>
          <label style="display: grid; gap: 4px; font-size: 13px; font-weight: 600">
            官方源地址 / DOI 链接 (https://)
            <input v-model.trim="resForm.sourceUrl" type="url" required maxlength="280" placeholder="https://doi.org/... 或官方开放数据主页" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px" />
          </label>
          <label style="display: grid; gap: 4px; font-size: 13px; font-weight: 600">
            科学用途与简介
            <textarea v-model.trim="resForm.description" required rows="3" maxlength="280" placeholder="简要说明该数据集或研究方法包含的核心变量、时间跨度与适用研究场景……" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font: inherit" />
          </label>
          <p v-if="submitError" class="community-state community-error" style="margin: 0">{{ submitError }}</p>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px">
            <button type="button" class="baroque-btn" @click="showSubmitModal = false">取消</button>
            <button type="submit" class="baroque-btn baroque-btn-primary" :disabled="submitting">
              {{ submitting ? '提交中…' : '递交资源审核 ✦' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { apiRequest } from '../account/client.js'
import { mockResources } from './mockData.js'
import { toast } from '../utils/toast.js'

const resources = ref([])
const loading = ref(false)
const error = ref('')
const usingFallbackCatalog = ref(false)
const filterKeyword = ref('')
const selectedCategory = ref('全部')
const showSubmitModal = ref(false)
const submitting = ref(false)
const submitError = ref('')

const resForm = reactive({
  title: '',
  category: '',
  format: '',
  scale: '',
  license: '',
  sourceUrl: '',
  description: ''
})

async function submitResourceRecommendation() {
  submitting.value = true
  submitError.value = ''
  try {
    await apiRequest('/api/community/resources/submit', {
      method: 'POST',
      body: JSON.stringify(resForm)
    })
    toast.success('开放资源推荐已提交！管理员核实许可协议后将公开收录。')
    showSubmitModal.value = false
    resForm.title = ''
    resForm.category = ''
    resForm.format = ''
    resForm.scale = ''
    resForm.license = ''
    resForm.sourceUrl = ''
    resForm.description = ''
  } catch (err) {
    submitError.value = err.message || '提交失败，请先登录账号后重试。'
  } finally {
    submitting.value = false
  }
}

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
    const remoteList = res.resources
    const existingUrls = new Set(remoteList.map(r => r.sourceUrl))
    const merged = [...remoteList, ...mockResources.filter(m => !existingUrls.has(m.sourceUrl))]
    resources.value = merged
    usingFallbackCatalog.value = false
  } catch {
    resources.value = mockResources
    usingFallbackCatalog.value = true
    error.value = ''
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
  background-color: #0d1a2d;
  background-image: radial-gradient(circle at 80% 20%, #15273f 0%, #0d1a2d 60%, #08111e 100%);
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
  background: #ffffff;
  border: 1.5px solid #475569;
  border-radius: var(--radius-pill);
  color: #1e293b;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s var(--geo-flow-ease);
}

.baroque-tab:hover {
  border-color: #0f3d68;
  background: #f1f7fc;
  color: #071322;
}

.baroque-tab.active {
  background: #0f2742;
  border: 2px solid #071322;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 39, 66, 0.18);
}

.baroque-tab.active::before {
  content: "✓ ";
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
