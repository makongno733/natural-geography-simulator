<template>
  <div v-if="isOpen" class="cmd-overlay" role="dialog" aria-modal="true" aria-label="全局地理知识与实验检索" @click.self="close">
    <div class="cmd-modal baroque-frame">
      <div class="cmd-search-header">
        <span class="cmd-search-icon" aria-hidden="true">🔍</span>
        <input
          ref="searchInputRef"
          v-model="query"
          type="search"
          class="cmd-input"
          placeholder="搜索地理概念、三维实验、真实遥感、教材大概念、社区探讨…… (Esc 关闭)"
          @keydown.down.prevent="moveHighlight(1)"
          @keydown.up.prevent="moveHighlight(-1)"
          @keydown.enter.prevent="selectHighlighted"
          @keydown.esc.prevent="close"
        />
        <button type="button" class="cmd-close-btn" aria-label="关闭搜索面板" @click="close">Esc</button>
      </div>

      <!-- 快速推荐热词标签 -->
      <div v-if="!query.trim()" class="cmd-suggestions">
        <span class="cmd-hint-title">常用学术检索：</span>
        <button
          v-for="tag in quickTags"
          :key="tag"
          type="button"
          class="cmd-tag-chip"
          @click="query = tag"
        >
          {{ tag }}
        </button>
      </div>

      <!-- 检索结果列表 -->
      <div class="cmd-results-list" role="listbox">
        <p v-if="query.trim() && searchingCommunity" class="cmd-search-status" role="status">正在检索社区讨论…</p>
        <p v-if="query.trim() && communitySearchFailed" class="cmd-search-status" role="status">社区检索暂时不可用，以下仅显示教学与实验结果。</p>
        <p v-if="query.trim() && !searchingCommunity && !communitySearchFailed && !displayList.length" class="cmd-empty">
          未检索到与“{{ query }}”匹配的内容，请尝试更换关键词或按学科浏览。
        </p>

        <div
          v-for="(item, idx) in displayList"
          :key="item.id"
          class="cmd-result-item"
          :class="{ 'is-active': activeIndex === idx }"
          role="option"
          :aria-selected="activeIndex === idx"
          @mouseenter="activeIndex = idx"
          @click="selectItem(item)"
        >
          <div class="cmd-item-meta">
            <span class="cmd-type-tag" :class="`type-${item.type}`">{{ item.type }}</span>
            <span class="cmd-badge">{{ item.badge }}</span>
            <span class="cmd-category">{{ item.category }}</span>
          </div>
          <div class="cmd-item-title">{{ item.title }}</div>
          <div class="cmd-item-desc">{{ item.desc }}</div>
        </div>
      </div>

      <div class="cmd-footer">
        <span class="cmd-key-tip"><kbd>↑</kbd><kbd>↓</kbd> 切换选项</span>
        <span class="cmd-key-tip"><kbd>Enter</kbd> 跳转</span>
        <span class="cmd-key-tip"><kbd>Esc</kbd> 退出</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { queryGlobalGeography, EXPERIMENT_INDEX } from '../utils/globalSearchIndex.js'
import { accountEnabled, apiRequest } from '../account/client.js'

const router = useRouter()
const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const searchInputRef = ref(null)
const communityResults = ref([])
const searchingCommunity = ref(false)
const communitySearchFailed = ref(false)
let searchTimer
let searchVersion = 0

const quickTags = ['热力环流', 'DEM高程', '海绵城市', '太阳高度角', '流水侵蚀', '青藏高原']

const results = computed(() => {
  return queryGlobalGeography(query.value)
})

const displayList = computed(() => {
  if (query.value.trim()) {
    return [...communityResults.value.slice(0, 6), ...results.value].slice(0, 12)
  }
  // 默认推荐经典实验与探究
  return EXPERIMENT_INDEX.slice(0, 5)
})

watch(displayList, () => {
  activeIndex.value = 0
})

watch(query, (value) => {
  clearTimeout(searchTimer)
  const version = ++searchVersion
  communityResults.value = []
  communitySearchFailed.value = false
  searchingCommunity.value = false
  const term = value.trim()
  if (!term || !accountEnabled || !isOpen.value) return
  searchingCommunity.value = true
  searchTimer = setTimeout(async () => {
    try {
      const response = await apiRequest(`/api/community/posts?${new URLSearchParams({ q: term })}`, { timeout: 9000 })
      if (version !== searchVersion || !isOpen.value) return
      communityResults.value = (response.posts || []).map(post => ({
        id: `community-${post.id}`,
        type: post.kind === 'question' ? '问答' : '探讨',
        badge: post.category || '社区',
        category: '社区讨论',
        title: post.title,
        desc: post.excerpt || '',
        route: `/community/post/${post.id}`
      }))
    } catch {
      if (version === searchVersion && isOpen.value) communitySearchFailed.value = true
    } finally {
      if (version === searchVersion) searchingCommunity.value = false
    }
  }, 250)
})

function open() {
  isOpen.value = true
  query.value = ''
  activeIndex.value = 0
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

function close() {
  isOpen.value = false
  clearTimeout(searchTimer)
  searchVersion += 1
  searchingCommunity.value = false
}

function moveHighlight(step) {
  if (!displayList.value.length) return
  activeIndex.value = (activeIndex.value + step + displayList.value.length) % displayList.value.length
}

function selectHighlighted() {
  if (displayList.value[activeIndex.value]) {
    selectItem(displayList.value[activeIndex.value])
  }
}

function selectItem(item) {
  close()
  if (item.route) {
    router.push(item.route)
  }
}

function onGlobalKeydown(e) {
  // Cmd+K (Mac) or Ctrl+K (Win/Linux)
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  clearTimeout(searchTimer)
  searchVersion += 1
})

defineExpose({
  open,
  close
})
</script>

<style scoped>
.cmd-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(7, 19, 34, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 80px 20px 20px;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cmd-modal {
  width: 100%;
  max-width: 680px;
  background: #ffffff;
  border: 1px solid var(--baroque-border-gold);
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(7, 19, 34, 0.3), 0 0 16px rgba(197, 160, 89, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cmd-search-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}

.cmd-search-icon {
  font-size: 18px;
  opacity: 0.7;
}

.cmd-input {
  flex: 1;
  border: none;
  font-size: 16px;
  font-family: inherit;
  color: var(--geo-ocean-deep);
  background: transparent;
  outline: none;
}

.cmd-input::placeholder {
  color: var(--text-faint);
  font-size: 14.5px;
}

.cmd-close-btn {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  padding: 3px 6px;
  background: #f1f5f9;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
}

.cmd-suggestions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #fcfbf8;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.cmd-hint-title {
  font-size: 12px;
  color: var(--text-faint);
  font-weight: 600;
}

.cmd-tag-chip {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--geo-ocean);
  cursor: pointer;
  transition: all 0.12s ease;
}

.cmd-tag-chip:hover {
  background: var(--geo-ocean-surface);
  border-color: var(--baroque-bronze);
}

.cmd-results-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.cmd-empty {
  padding: 36px 20px;
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
}

.cmd-search-status {
  margin: 4px 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.cmd-result-item {
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cmd-result-item.is-active {
  background: #f0f5fa;
}

.cmd-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cmd-type-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  background: #e2e8f0;
  color: #334155;
}

.type-实验 {
  background: #e0f2fe;
  color: #0369a1;
}

.type-探究 {
  background: #fef3c7;
  color: #92400e;
}

.type-教学 {
  background: #dcfce7;
  color: #15803d;
}

.type-问答, .type-探讨 {
  background: #ede9fe;
  color: #6d28d9;
}

.cmd-badge {
  font-size: 11.5px;
  color: var(--text-faint);
}

.cmd-category {
  font-size: 11px;
  color: var(--baroque-bronze);
  margin-left: auto;
  font-weight: 600;
}

.cmd-item-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.cmd-item-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.45;
}

.cmd-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 10px 20px;
  background: #fcfbf8;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-faint);
}

.cmd-key-tip kbd {
  font-family: ui-monospace, monospace;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 4px;
  box-shadow: 0 1px 1px rgba(0,0,0,0.06);
}

@media (max-width: 640px) {
  .cmd-overlay {
    padding: 20px 10px;
  }
}
</style>
