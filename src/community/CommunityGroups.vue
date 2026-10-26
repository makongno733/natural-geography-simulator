<template>
  <div class="community-wrap groups-page">
    <router-link class="community-back" to="/community">← 返回社区</router-link>

    <header class="groups-hero baroque-frame">
      <p class="community-eyebrow">ACADEMIC GUILDS & SOCIETIES / 专业学社</p>
      <h1>地理学术社群与研讨共同体</h1>
      <p class="groups-lead">
        收录经管理员核实公开展示授权的地理学交流社群。也欢迎先在站内公开提问与交流。
      </p>
      <div class="groups-hero-notice">
        <span>社群由成员自行提供，学校、职业与研究身份不代表平台认证；加入前请自行核实。</span>
      </div>
    </header>

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

    <p v-if="loading" class="community-state" role="status">正在读取社群索引……</p>
    <p v-else-if="error" class="community-state community-error" role="alert">{{ error }}</p>
    <p v-else-if="!filteredGroups.length" class="community-state" role="status">暂无经核实可公开展示的社群。你可以在站内发帖交流，或通过下方入口提交社群资料供审核。</p>

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
            <strong class="qq-num">{{ group.qqNumber }}</strong>
          </div>
          <button class="baroque-btn baroque-btn-sm baroque-btn-brass" type="button" @click="copyQQ(group.qqNumber)">
            {{ copiedNumber === group.qqNumber ? '✓ 已复制' : '复制群号' }}
          </button>
        </div>
      </article>
    </div>

    <!-- 社群入驻或登记通道 -->
    <section class="group-register-cta baroque-frame">
      <h3>🏛 申请社群登记或学术组织入驻</h3>
      <p>如果你负责地理学交流社群，可提交群名称、简介、加入方式及公开展示授权说明。管理员核实后再展示；请勿提交他人私密群号。</p>
      <a class="baroque-btn baroque-btn-primary" href="mailto:makongno733@gmail.com?subject=申请地理共同体学术群入驻">提交社群申请 ↗</a>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '../account/client.js'

const groups = ref([])
const loading = ref(false)
const error = ref('')
const selectedCategory = ref('全部')
const copiedNumber = ref('')

const groupCategories = computed(() => {
  const set = new Set(['全部'])
  groups.value.forEach(g => set.add(g.category))
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
    groups.value = res.groups || []
  } catch (err) {
    error.value = err.message || '读取社群列表失败'
  } finally {
    loading.value = false
  }
}

function copyQQ(number) {
  navigator.clipboard.writeText(number).then(() => {
    copiedNumber.value = number
    setTimeout(() => {
      if (copiedNumber.value === number) copiedNumber.value = ''
    }, 2500)
  })
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
  margin-bottom: 36px;
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
  line-height: 1.8;
  color: #c9d6df;
  max-width: 760px;
  margin: 0 0 20px;
}

.groups-hero-notice {
  display: inline-flex;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(197, 160, 89, 0.4);
  font-size: 12.5px;
  color: #e5d8b8;
}

.groups-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

.baroque-tab {
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--geo-btn-transition);
}

.baroque-tab:hover {
  border-color: var(--geo-ocean);
  color: var(--geo-ocean);
  background: var(--geo-ocean-surface);
}

.baroque-tab.active {
  background: var(--geo-ocean);
  color: #ffffff;
  border-color: var(--geo-ocean);
  box-shadow: var(--geo-btn-primary-shadow);
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 22px;
}

.group-card {
  display: flex;
  flex-direction: column;
  padding: 26px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s var(--geo-flow-ease), box-shadow 0.2s, border-color 0.2s;
}

.group-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--geo-ocean);
}

.group-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.group-category-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: var(--geo-ocean-surface);
  color: var(--geo-ocean);
  border: 1px solid rgba(26,68,108,0.15);
}

.group-id-badge {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: var(--text-faint);
}

.group-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.group-desc {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text-muted);
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
  font-size: 11.5px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-soft);
  color: var(--text-muted);
}

.group-action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px dashed var(--border);
}

.qq-box {
  display: flex;
  flex-direction: column;
}

.qq-label {
  font-size: 11px;
  color: var(--text-faint);
}

.qq-num {
  font-size: 16px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: var(--geo-ocean);
  letter-spacing: 0.04em;
}

.group-register-cta {
  margin-top: 56px;
  padding: 36px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-box);
  text-align: center;
}

.group-register-cta h3 {
  margin: 0 0 10px;
  color: var(--geo-ocean-deep);
  font-size: 20px;
}

.group-register-cta p {
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto 20px;
  font-size: 14.5px;
  line-height: 1.7;
}
</style>
