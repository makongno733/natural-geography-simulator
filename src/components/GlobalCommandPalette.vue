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
          placeholder="搜索地理概念、三维实验、真实遥感、教材章节、繁星课题、社区讨论…… (Esc 关闭)"
          @keydown.down.prevent="moveHighlight(1)"
          @keydown.up.prevent="moveHighlight(-1)"
          @keydown.enter.prevent="selectHighlighted"
          @keydown.esc.prevent="close"
        />
        <button type="button" class="cmd-close-btn" aria-label="关闭搜索面板" @click="close">Esc</button>
      </div>

      <!-- 快速推荐热词标签 -->
      <div v-if="!query.trim()" class="cmd-suggestions">
        <span class="cmd-hint-title">热门检索：</span>
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
        <p v-if="query.trim() && communitySearchFailed && displayList.length" class="cmd-search-status" role="status">社区检索暂时不可用，以下仅显示教学、实验、繁星课题与资源结果。</p>
        <div v-if="query.trim() && !searchingCommunity && !displayList.length" class="cmd-empty">
          <p>未检索到与“{{ query }}”匹配的现成实验或教材，你可以查看独立检索页或直接去社区提问：</p>
          <div class="cmd-empty-actions">
            <button type="button" class="cmd-action-btn" @click="goFullSearchPage">
              🔎 打开全站检索页查看“{{ query.trim() }}”
            </button>
            <button type="button" class="cmd-action-btn" @click="goSearchInCommunity">
              🔍 在社区讨论中搜索“{{ query.trim() }}”
            </button>
            <button type="button" class="cmd-action-btn cmd-action-primary" @click="goAskInCommunity">
              ✍ 把“{{ query.trim() }}”作为新问题提问
            </button>
          </div>
        </div>

        <div
          v-for="(item, idx) in displayList"
          :key="item.id"
          class="cmd-result-item"
          :class="{ 'is-active': activeIndex === idx, 'is-exact': item.exactMatch }"
          role="option"
          :aria-selected="activeIndex === idx"
          @mouseenter="activeIndex = idx"
          @click="selectItem(item)"
        >
          <div class="cmd-item-meta">
            <span class="cmd-type-tag" :class="`type-${item.type}`">{{ item.type }}</span>
            <span v-if="item.exactMatch" class="cmd-exact-badge">★ 精确词条直达</span>
            <span class="cmd-badge">{{ item.badge }}</span>
            <span class="cmd-category">{{ item.category }}</span>
          </div>
          <div class="cmd-item-title">{{ item.title }}</div>
          <div class="cmd-item-desc">{{ item.desc }}</div>
        </div>
      </div>

      <div class="cmd-footer">
        <button
          v-if="query.trim()"
          type="button"
          class="cmd-view-all-btn"
          @click="goFullSearchPage"
        >
          查看“{{ query.trim().slice(0, 16) }}”的全部结果与分类筛选 →
        </button>
        <div class="cmd-key-tips">
          <span class="cmd-key-tip"><kbd>↑</kbd><kbd>↓</kbd> 切换选项</span>
          <span class="cmd-key-tip"><kbd>Enter</kbd> 跳转</span>
          <span class="cmd-key-tip"><kbd>Esc</kbd> 退出</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { queryGlobalGeography, normalizeSearchQuery, EXPERIMENT_INDEX, LAB_INDEX } from '../utils/globalSearchIndex.js'
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

const quickTags = [
  '海风为什么吹向陆地',
  '同一场雨哪种路面积水更严重',
  '热力环流',
  '喀斯特',
  '正午太阳高度',
  '背斜为什么变成山谷',
  '多时相遥感',
  '海绵城市',
  '必修一'
]

const results = computed(() => {
  return queryGlobalGeography(query.value)
})

const displayList = computed(() => {
  if (query.value.trim()) {
    // 社区讨论结果与实验/探究/教材/课题合并呈现（确保测试与快捷检索中社区命中的讨论也能在显著位置展示）
    return [...communityResults.value.slice(0, 4), ...results.value].slice(0, 12)
  }
  // 默认推荐核心对照实验与三维实验
  return [LAB_INDEX[0], ...EXPERIMENT_INDEX.slice(0, 5)].filter(Boolean)
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
  const term = normalizeSearchQuery(value)
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

function open(initialQuery = '') {
  isOpen.value = true
  query.value = typeof initialQuery === 'string' ? initialQuery : ''
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
  } else if (query.value.trim()) {
    goFullSearchPage()
  }
}

function selectItem(item) {
  close()
  if (item.route) {
    router.push(item.route)
  }
}

function goFullSearchPage() {
  const q = normalizeSearchQuery(query.value)
  close()
  router.push({ path: '/search', query: q ? { q } : {} })
}

function goSearchInCommunity() {
  const q = normalizeSearchQuery(query.value)
  close()
  if (q) {
    router.push({ path: '/', query: { q }, hash: '#community-feed' })
  }
}

function goAskInCommunity() {
  const q = normalizeSearchQuery(query.value)
  close()
  if (q) {
    router.push({ path: '/', query: { compose: '1', kind: 'question', title: q }, hash: '#compose' })
  }
}

function onGlobalKeydown(e) {
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
  padding: 72px 20px 20px;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cmd-modal {
  width: 100%;
  max-width: 700px;
  background: #ffffff;
  border: 1.5px solid #64748b;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(7, 19, 34, 0.32);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cmd-search-header {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #cbd5e1;
  gap: 12px;
}

.cmd-search-icon {
  font-size: 18px;
}

.cmd-input {
  flex: 1;
  border: none;
  font-size: 16px;
  font-family: inherit;
  color: #0f172a;
  background: transparent;
  outline: none;
}

.cmd-input::placeholder {
  color: #475569;
  font-size: 14px;
}

.cmd-close-btn {
  font-size: 11.5px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  padding: 4px 8px;
  background: #f1f5f9;
  border: 1px solid #64748b;
  border-radius: 4px;
  color: #1e293b;
  cursor: pointer;
}

.cmd-suggestions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #cbd5e1;
  flex-wrap: wrap;
}

.cmd-hint-title {
  font-size: 12px;
  color: #334155;
  font-weight: 700;
}

.cmd-tag-chip {
  font-size: 12px;
  padding: 3px 9px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #64748b;
  color: #0c3960;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s ease;
}

.cmd-tag-chip:hover {
  background: #e0f2fe;
  border-color: #0369a1;
}

.cmd-results-list {
  max-height: 410px;
  overflow-y: auto;
  padding: 8px;
}

.cmd-empty {
  padding: 26px 20px;
  text-align: center;
  font-size: 14px;
  color: #334155;
}

.cmd-empty p {
  margin: 0 0 14px;
}

.cmd-empty-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cmd-action-btn {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1.5px solid #475569;
  background: #ffffff;
  color: #0c3960;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.cmd-action-primary {
  background: #0f3d68;
  border-color: #072138;
  color: #ffffff;
}

.cmd-search-status {
  margin: 4px 12px;
  font-size: 12.5px;
  color: #334155;
  font-weight: 600;
}

.cmd-result-item {
  padding: 11px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cmd-result-item.is-active {
  background: #e0f2fe;
}

.cmd-item-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.cmd-type-tag {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  background: #e2e8f0;
  color: #1e293b;
}

.type-实验 { background: #e0f2fe; color: #075985; }
.type-探究 { background: #fef3c7; color: #78350f; }
.type-教学 { background: #dcfce7; color: #14532d; }
.type-课题 { background: #fce7f3; color: #831843; }
.type-资源 { background: #f1f5f9; color: #0f172a; }
.type-问答, .type-探讨 { background: #ede9fe; color: #5b21b6; }

.cmd-exact-badge {
  font-size: 11px;
  font-weight: 800;
  color: #0369a1;
  background: #f0f9ff;
  border: 1px solid #38bdf8;
  padding: 1px 6px;
  border-radius: 999px;
}

.cmd-badge {
  font-size: 11.5px;
  color: #334155;
  font-weight: 600;
}

.cmd-category {
  font-size: 11.5px;
  color: #0c3960;
  margin-left: auto;
  font-weight: 700;
}

.cmd-item-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.cmd-item-desc {
  font-size: 13px;
  color: #334155;
  line-height: 1.45;
}

.cmd-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 18px;
  background: #f8fafc;
  border-top: 1px solid #cbd5e1;
  font-size: 12px;
  color: #334155;
}

.cmd-view-all-btn {
  border: 1px solid #0f3d68;
  background: #eef5fb;
  color: #0c3960;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cmd-view-all-btn:hover {
  background: #d9eaf8;
}

.cmd-key-tips {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
}

.cmd-key-tip kbd {
  font-family: ui-monospace, monospace;
  background: #ffffff;
  border: 1px solid #64748b;
  border-radius: 3px;
  padding: 1px 4px;
  color: #0f172a;
  font-weight: 700;
}

@media (max-width: 640px) {
  .cmd-overlay {
    padding: 16px 10px;
  }
  .cmd-key-tips {
    display: none;
  }
  .cmd-view-all-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
