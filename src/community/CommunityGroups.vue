<template>
  <div class="community-wrap groups-page">
    <router-link class="community-back" to="/community">← 返回社区</router-link>

    <header class="groups-hero baroque-frame">
      <p class="community-eyebrow">ACADEMIC GUILDS & SOCIETIES / 专业学社</p>
      <h1>地理学术社群与研讨共同体</h1>
      <p class="groups-lead">
        整理高校地理研讨、空间数据技术与一线名师教研交流社群，促进学科思想碰撞。
      </p>
      <div class="groups-hero-notice">
        <span>温馨提示：社群由学界同行自行发起，加入时请遵守学术交流规范与网络文明准则。</span>
      </div>
    </header>

    <!-- 演示/离线模式感知横幅 -->
    <aside v-if="isDemoMode" class="demo-mode-banner" aria-label="运行模式提示">
      <div class="demo-banner-content">
        <span class="demo-banner-tag">✦ 演示索引</span>
        <span>当前云服务暂未连接，已呈现精选地理学术社群示例索引；功能可正常交互。</span>
      </div>
      <div class="demo-banner-actions">
        <button class="baroque-btn baroque-btn-sm" type="button" :disabled="loading" @click="loadGroups">
          {{ loading ? '重新连接中…' : '尝试重连云端' }}
        </button>
      </div>
    </aside>

    <div class="groups-filter-row">
      <button
        v-for="cat in groupCategories"
        :key="cat"
        type="button"
        class="baroque-tab"
        :class="{ active: selectedCategory === cat }"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- 骨架屏加载状态 -->
    <div v-if="loading" class="groups-grid" aria-busy="true">
      <div v-for="i in 4" :key="i" class="skeleton-card">
        <div class="skeleton-box skeleton-line skeleton-line-short"></div>
        <div class="skeleton-box skeleton-line skeleton-line-title"></div>
        <div class="skeleton-box skeleton-line"></div>
        <div class="skeleton-box skeleton-line skeleton-line-short"></div>
      </div>
    </div>

    <p v-else-if="error && !filteredGroups.length" class="community-state community-error" role="alert">
      {{ error }}
      <br />
      <button class="baroque-btn baroque-btn-sm" style="margin-top: 12px" @click="loadGroups">重新加载</button>
    </p>
    <p v-else-if="!filteredGroups.length" class="community-state" role="status">
      该分类下暂无已登记的社群，欢迎浏览其他学术分类。
    </p>

    <div v-else class="groups-grid">
      <article v-for="group in filteredGroups" :key="group.id" class="group-card baroque-frame">
        <div class="group-card-header">
          <span class="group-category-badge">{{ group.category }}</span>
          <span class="group-id-badge">编号 #{{ group.id }}</span>
        </div>

        <h3 class="group-title">{{ group.name }}</h3>
        <p class="group-desc">{{ group.description }}</p>

        <div class="group-tags-list">
          <span v-for="t in group.tags" :key="t" class="group-tag">#{{ t }}</span>
        </div>

        <div class="group-action-row">
          <div class="qq-box">
            <span class="qq-label">QQ 群号</span>
            <strong class="qq-num">{{ group.qqNumber || group.qq_number }}</strong>
          </div>
          <button
            class="baroque-btn baroque-btn-sm baroque-btn-brass"
            type="button"
            @click="copyQQ(group.qqNumber || group.qq_number)"
          >
            {{ copiedNumber === (group.qqNumber || group.qq_number) ? '✓ 已复制' : '复制群号' }}
          </button>
        </div>
      </article>
    </div>

    <!-- 社群入驻或登记通道 -->
    <section class="group-register-cta baroque-frame">
      <h3>🏛 申请社群登记与学术研讨组织入驻</h3>
      <p>如果你负责高校地理学学会、科研研讨组或中学地理名师教研室，欢迎提交群名称、研究方向及公开展示授权。</p>
      <a class="baroque-btn baroque-btn-primary" href="mailto:makongno733@gmail.com?subject=申请地理共同体学术群入驻">提交学术社群入驻申请 ↗</a>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '../account/client.js'
import { mockGroups } from './mockData.js'
import { toast } from '../utils/toast.js'

const groups = ref([])
const loading = ref(false)
const error = ref('')
const selectedCategory = ref('全部')
const copiedNumber = ref('')
const isDemoMode = ref(false)

const groupCategories = computed(() => {
  const set = new Set(['全部'])
  groups.value.forEach(g => {
    if (g.category) set.add(g.category)
  })
  return Array.from(set)
})

const filteredGroups = computed(() => {
  if (selectedCategory.value === '全部') return groups.value
  return groups.value.filter(g => g.category === selectedCategory.value)
})

async function loadGroups() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiRequest('/api/community/groups')
    if (res && Array.isArray(res.groups) && res.groups.length > 0) {
      groups.value = res.groups
      isDemoMode.value = false
    } else {
      // 若线上暂无数据，使用高质量学术规范演示数据，并标记
      groups.value = mockGroups
      isDemoMode.value = true
    }
  } catch {
    // 离线或服务异常时优雅降级
    groups.value = mockGroups
    isDemoMode.value = true
  } finally {
    loading.value = false
  }
}

function copyQQ(number) {
  if (!number) return
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(String(number)).then(() => {
      copiedNumber.value = String(number)
      toast.success(`已复制 QQ 群号：${number}`)
      setTimeout(() => {
        if (copiedNumber.value === String(number)) copiedNumber.value = ''
      }, 2500)
    }).catch(() => {
      fallbackCopy(number)
    })
  } else {
    fallbackCopy(number)
  }
}

function fallbackCopy(number) {
  copiedNumber.value = String(number)
  toast.info(`QQ 群号：${number}`)
}

onMounted(loadGroups)
</script>

<style scoped>
.groups-page {
  padding-top: 36px;
  padding-bottom: 90px;
}

.groups-hero {
  padding: 44px 36px;
  margin-bottom: 28px;
  background: radial-gradient(circle at 80% 20%, #15273f 0%, #0d1a2d 60%, #08111e 100%);
  color: #f5f3ec;
  border-radius: var(--radius-box);
  border: 1px solid rgba(197, 160, 89, 0.35);
  box-shadow: var(--shadow-md);
}

.groups-hero h1 {
  font-size: clamp(30px, 4vw, 46px);
  margin: 12px 0 16px;
  color: #ffffff;
  font-family: Georgia, 'Playfair Display', 'Songti SC', serif;
  letter-spacing: -0.02em;
}

.groups-lead {
  font-size: 16px;
  color: #cfd8e3;
  max-width: 720px;
  line-height: 1.7;
  margin: 0 0 20px;
}

.groups-hero-notice {
  font-size: 13px;
  color: #c5a059;
  border-top: 1px dashed rgba(197, 160, 89, 0.3);
  padding-top: 14px;
}

.groups-filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.baroque-tab {
  padding: 8px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  color: var(--text-muted);
  font-size: 14px;
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

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.group-card {
  padding: 24px 26px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  transition: transform 0.22s var(--geo-flow-ease), box-shadow 0.22s var(--geo-flow-ease), border-color 0.22s var(--geo-flow-ease);
}

.group-card:hover {
  transform: translateY(-3px);
  border-color: var(--baroque-border-gold);
  box-shadow: 0 10px 24px rgba(15, 39, 66, 0.08), 0 0 12px rgba(197, 160, 89, 0.12);
}

.group-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.group-category-badge {
  font-size: 12px;
  font-weight: 700;
  color: #1b4332;
  background: #d8f3dc;
  padding: 3px 8px;
  border-radius: 4px;
}

.group-id-badge {
  font-size: 11px;
  color: var(--text-faint);
  font-family: ui-monospace, monospace;
}

.group-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
  margin: 0 0 10px;
  line-height: 1.4;
}

.group-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 0 16px;
  flex: 1;
}

.group-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.group-tag {
  font-size: 12px;
  color: var(--geo-ocean);
  background: var(--geo-ocean-surface);
  padding: 2px 7px;
  border-radius: 4px;
}

.group-action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.qq-box {
  display: flex;
  flex-direction: column;
}

.qq-label {
  font-size: 11px;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.qq-num {
  font-size: 17px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: var(--geo-ocean-deep);
  letter-spacing: 0.04em;
}

.group-register-cta {
  padding: 32px 36px;
  background: linear-gradient(135deg, rgba(249, 247, 241, 0.95), rgba(244, 239, 228, 0.95));
  border: 1px solid var(--baroque-border-gold);
  border-radius: var(--radius-card);
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.group-register-cta h3 {
  font-size: 20px;
  color: var(--geo-ocean-deep);
  margin: 0 0 10px;
}

.group-register-cta p {
  font-size: 14.5px;
  color: var(--text-muted);
  margin: 0 auto 20px;
  max-width: 620px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .groups-hero {
    padding: 30px 20px;
  }
  .groups-grid {
    grid-template-columns: 1fr;
  }
}
</style>
