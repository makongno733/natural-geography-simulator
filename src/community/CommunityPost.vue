<template>
  <div class="community-wrap community-detail">
    <router-link class="community-back" to="/community">← 返回学术社区</router-link>

    <!-- 演示/离线模式横幅 -->
    <aside v-if="isDemoMode" class="demo-mode-banner" aria-label="运行模式提示">
      <div class="demo-banner-content">
        <span class="demo-banner-tag">✦ 离线演示探讨</span>
        <span>当前云服务未连接，正在以离线学术演示样例浏览此篇探讨；回复、赞同与采纳将在本地即时呈现。</span>
      </div>
      <div class="demo-banner-actions">
        <button class="baroque-btn baroque-btn-sm" type="button" :disabled="loading" @click="loadPost">
          {{ loading ? '连接中…' : '刷新云端数据' }}
        </button>
      </div>
    </aside>

    <div v-if="loading && !post" class="skeleton-card" style="margin-bottom: 24px" aria-busy="true">
      <div class="skeleton-box skeleton-line skeleton-line-short"></div>
      <div class="skeleton-box skeleton-line skeleton-line-title"></div>
      <div class="skeleton-box skeleton-line"></div>
      <div class="skeleton-box skeleton-line"></div>
      <div class="skeleton-box skeleton-line skeleton-line-short"></div>
    </div>
    <p v-else-if="error && !post" class="community-state community-error" role="alert">
      {{ error }}
      <br />
      <button class="baroque-btn baroque-btn-sm" style="margin-top: 12px" @click="loadPost">重试加载</button>
    </p>

    <template v-else-if="post">
      <!-- 帖子主卷 -->
      <article class="community-detail-post baroque-frame">
        <div class="community-post-meta">
          <span class="category-pill">{{ post.category }}</span>
          <span :class="['kind-pill', post.kind === 'question' ? 'kind-question' : 'kind-discussion']">
            {{ post.kind === 'question' ? '学术问答' : '学术探讨' }}
          </span>
          <span v-if="post.acceptedReplyId" class="accepted-pill">✓ 提问者已采纳最佳答案</span>
        </div>

        <h1 class="detail-title">{{ post.title }}</h1>

        <div class="detail-author-row">
          <span class="author-info">
            <router-link v-if="post.authorId" :to="`/community/user/${post.authorId}`" class="author-name-link">
              👤 {{ post.author }}
            </router-link>
            <span v-else>👤 {{ post.author }}</span>
            <span class="post-time">· 发布于 {{ formatDate(post.createdAt) }}</span>
          </span>

          <div class="author-actions-right">
            <button v-if="canManage" class="baroque-btn baroque-btn-sm" type="button" @click="deletePost">
              🗑 删除讨论
            </button>
            <button class="community-report" type="button" @click="reportPost">⚠ 举报违规</button>
          </div>
        </div>

        <div class="community-prose detail-body" v-html="renderGeoScholarlyText(post.body)"></div>

        <!-- 标签列表 -->
        <div v-if="post.tags && post.tags.length" class="detail-tags-list">
          <span v-for="t in post.tags" :key="t" class="detail-tag-item">#{{ t }}</span>
        </div>

        <!-- 挂载的探究实测证据卡 -->
        <div v-if="attachedEvidence" class="evidence-attach-box baroque-frame">
          <div class="evidence-header">
            <span class="evidence-badge">📊 地学探究实测证据卡</span>
            <small class="evidence-task-title">{{ attachedEvidence.taskTitle }}</small>
          </div>
          <h4 class="evidence-title">{{ attachedEvidence.title }}</h4>
          <p class="evidence-facts">{{ attachedEvidence.facts }}</p>
          <router-link :to="attachedEvidence.route" class="evidence-action-link">
            前往探究仿真模型进行多变量验证 ↗
          </router-link>
        </div>

        <!-- 挂载的 3D 实验验证联动卡片 -->
        <div v-if="post.linkedExperiment" class="linked-experiment-box baroque-frame">
          <div class="exp-box-left">
            <span class="exp-box-badge">🔬 3D 动力学实验联动</span>
            <h4>在本站三维实验室中验证此议题</h4>
            <p>点击即可直达对应的地学仿真模型，亲自操作参数、观察物理过程并印证讨论假说。</p>
          </div>
          <router-link :to="getExperimentRoute(post.linkedExperiment)" class="baroque-btn baroque-btn-brass exp-box-btn">
            打开 3D 实验验证 ↗
          </router-link>
        </div>

        <!-- 帖子操作工具栏：点赞、收藏 -->
        <div class="detail-interaction-bar">
          <button
            type="button"
            :class="['baroque-btn', 'baroque-btn-sm', { 'baroque-btn-brass': post.liked }]"
            @click="toggleLike"
          >
            {{ post.liked ? '★ 已赞同' : '☆ 赞同' }} ({{ post.likeCount || 0 }})
          </button>
          <button
            type="button"
            :class="['baroque-btn', 'baroque-btn-sm', { 'baroque-btn-brass': post.bookmarked }]"
            @click="toggleBookmark"
          >
            {{ post.bookmarked ? '🔖 已收藏' : '📑 收藏' }} ({{ post.bookmarkCount || 0 }})
          </button>
        </div>
      </article>

      <!-- 回复列表 -->
      <section class="community-replies" aria-labelledby="replies-title">
        <div class="replies-header">
          <span class="baroque-corner-ornament">⚜</span>
          <h2 id="replies-title">{{ replies.length }} 条同行学术研讨与回答</h2>
        </div>

        <p v-if="!replies.length" class="community-state">暂无回复，欢迎提出你的科学洞见与实证依据。</p>

        <article
          v-for="reply in replies"
          :key="reply.id"
          class="community-reply baroque-frame"
          :class="{ 'is-nested': reply.parentId, 'is-accepted-card': reply.isAccepted }"
        >
          <!-- 最佳答案徽章 -->
          <div v-if="reply.isAccepted" class="accepted-banner">
            <span class="accepted-icon">★</span>
            <strong>提问者采纳的最佳解答</strong>
          </div>

          <div class="reply-head">
            <div class="reply-author">
              <router-link v-if="reply.authorId" :to="`/community/user/${reply.authorId}`" class="reply-author-link">
                <strong>👤 {{ reply.author }}</strong>
              </router-link>
              <strong v-else>👤 {{ reply.author }}</strong>
              <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
            </div>

            <!-- 提问作者采纳操作按钮 -->
            <button
              v-if="isQuestionAuthor && post.kind === 'question'"
              class="baroque-btn baroque-btn-sm"
              :class="{ 'baroque-btn-brass': reply.isAccepted }"
              type="button"
              @click="toggleAccept(reply.id)"
            >
              {{ reply.isAccepted ? '★ 取消最佳采纳' : '☆ 采纳为最佳答案' }}
            </button>
          </div>

          <p v-if="reply.parentId" class="community-reply-context">引用回复 #{{ reply.parentId }}</p>

          <div class="community-prose reply-prose" v-html="renderGeoScholarlyText(reply.body)"></div>

          <div class="reply-actions-row">
            <button class="baroque-reply-trigger" type="button" @click="parentId = reply.id; replyInput?.focus()">
              💬 回复此条
            </button>
          </div>
        </article>
      </section>

      <!-- 撰写回复表单 -->
      <section class="community-compose community-reply-form baroque-frame" aria-labelledby="reply-title">
        <h2 id="reply-title">参与学术研讨</h2>
        <p v-if="!user" class="community-state">登录后参与同行探讨。<a :href="`${accountOrigin}/#/account`">登录 / 注册 ↗</a></p>
        <form v-else @submit.prevent="sendReply">
          <p v-if="parentId" class="replying-notice">
            正在引用回复 #{{ parentId }}
            <button class="cancel-quote-btn" type="button" @click="parentId = null">取消引用</button>
          </p>

          <!-- 公式快捷助手工具栏 -->
          <div class="editor-assist-bar">
            <span class="assist-label">地学公式：</span>
            <button
              v-for="item in GEO_FORMULA_PRESETS"
              :key="item.name"
              type="button"
              class="formula-chip"
              :title="item.desc"
              @click="insertFormulaToReply(item.latex)"
            >
              {{ item.name }}
            </button>
          </div>

          <label class="sr-only" for="reply-body">回复内容</label>
          <textarea
            id="reply-body"
            ref="replyInput"
            v-model.trim="body"
            required
            maxlength="3000"
            rows="5"
            placeholder="提出你的学术论证、野外观察、公式推导或文献支持（支持 $公式$ 与 $$块级公式$$）……"
          />
          <p v-if="replyError" class="community-error" role="alert">{{ replyError }}</p>
          <div class="reply-submit-row">
            <button class="baroque-btn baroque-btn-primary" type="submit" :disabled="submitting">
              {{ submitting ? '正在发表…' : '呈交解答与评论 ✦' }}
            </button>
          </div>
        </form>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { accountOrigin, apiRequest, authClient } from '../account/client.js'
import { mockPosts } from './mockData.js'
import { toast } from '../utils/toast.js'
import { renderGeoScholarlyText, GEO_FORMULA_PRESETS } from '../utils/mathFormula.js'
import { getEvidenceById } from '../inquiry/evidenceCatalog.js'

const route = useRoute()
const router = useRouter()
const post = ref(null)
const replies = ref([])
const user = ref(null)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const replyError = ref('')
const body = ref('')
const parentId = ref(null)
const replyInput = ref(null)
const isDemoMode = ref(false)
let stream

const attachedEvidence = computed(() => {
  if (!post.value) return null
  return getEvidenceById(post.value.evidenceId)
})

function insertFormulaToReply(latex) {
  const snippet = ` $${latex}$ `
  body.value += snippet
  replyInput.value?.focus()
}

const formatDate = value => {
  try {
    return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
  } catch {
    return String(value)
  }
}

const isQuestionAuthor = computed(() => {
  if (isDemoMode.value) return true
  return Boolean(user.value && post.value && user.value.id === post.value.authorId)
})

const canManage = computed(() => {
  if (isDemoMode.value) return true
  return Boolean(user.value && post.value && (user.value.id === post.value.authorId || user.value.role === 'admin'))
})

function getExperimentRoute(modelKey) {
  const map = {
    'fault-model': '/experiments/geology/fault-model',
    'thermal-circulation': '/experiments/meteorology/thermal-circulation',
    'water-cycle-3d': '/experiments/systems/water-cycle-3d',
    'moon-phases': '/experiments/astronomy/moon-phases',
    'earth-system': '/earth3d',
    'stream-table': '/experiments/hydrology/stream-table'
  }
  return map[modelKey] || '/experiments'
}

function getLocalDemoPosts() {
  try {
    const raw = localStorage.getItem('local_community_posts')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

async function loadPost() {
  loading.value = true
  error.value = ''
  try {
    const result = await apiRequest(`/api/community/posts/${route.params.id}`)
    post.value = result.post
    replies.value = result.replies
    isDemoMode.value = false
    return
  } catch {
    // 降级到 Mock 或本地数据
    isDemoMode.value = true
    const targetId = Number(route.params.id)
    const localPosts = getLocalDemoPosts()
    const all = [...localPosts, ...mockPosts]
    const matched = all.find(p => p.id === targetId)

    if (matched) {
      post.value = {
        id: matched.id,
        title: matched.title,
        body: matched.body,
        kind: matched.kind,
        category: matched.category || matched.categoryName || '地理学术交流',
        author: matched.author?.name || '匿名学者',
        authorId: matched.author?.id || 'demo',
        authorTitle: matched.author?.title || '',
        createdAt: matched.created_at,
        updatedAt: matched.updated_at,
        tags: matched.tags || [],
        linkedExperiment: matched.linked_experiment || null,
        acceptedReplyId: matched.accepted_reply_id || null,
        likeCount: matched.likesCount || 0,
        bookmarkCount: matched.bookmarksCount || 0,
        liked: false,
        bookmarked: false
      }
      replies.value = (matched.replies || []).map(r => ({
        id: r.id,
        author: r.author?.name || '地学同行',
        authorId: r.author?.id || 'demo',
        authorTitle: r.author?.title || '',
        body: r.body,
        createdAt: r.created_at,
        parentId: r.parent_id,
        isAccepted: r.id === matched.accepted_reply_id
      }))
    } else {
      error.value = '未找到该篇学术探讨，可能已被移除或地址不正确。'
    }
  } finally {
    loading.value = false
  }
}

async function sendReply() {
  if (!body.value.trim()) return
  submitting.value = true
  replyError.value = ''
  try {
    if (!isDemoMode.value) {
      await apiRequest(`/api/community/posts/${route.params.id}/replies`, {
        method: 'POST',
        body: JSON.stringify({ body: body.value, parentId: parentId.value })
      })
      toast.success('学术解答已成功发表！')
      body.value = ''
      parentId.value = null
      await loadPost()
    } else {
      // 演示模式直接追加
      const newReplyId = Date.now()
      replies.value.push({
        id: newReplyId,
        author: user.value?.name || '我 (研读者)',
        authorId: 'me',
        authorTitle: '地学研究者',
        body: body.value,
        createdAt: new Date().toISOString(),
        parentId: parentId.value,
        isAccepted: false
      })
      body.value = ''
      parentId.value = null
      toast.success('【演示模式】学术回复已呈现在讨论下方')
    }
  } catch (cause) {
    replyError.value = cause.message
    toast.error(cause.message || '回复失败')
  } finally {
    submitting.value = false
  }
}

async function toggleAccept(replyId) {
  try {
    if (!isDemoMode.value) {
      const res = await apiRequest(`/api/community/posts/${post.value.id}/accept-reply`, {
        method: 'POST',
        body: JSON.stringify({ replyId })
      })
      post.value.acceptedReplyId = res.acceptedReplyId
      replies.value = replies.value.map(r => ({
        ...r,
        isAccepted: r.id === res.acceptedReplyId
      }))
      toast.success(res.acceptedReplyId ? '已采纳该回答为最佳解答 ★' : '已取消最佳解答采纳')
    } else {
      // 演示模式
      const isCurrentlyAccepted = post.value.acceptedReplyId === replyId
      post.value.acceptedReplyId = isCurrentlyAccepted ? null : replyId
      replies.value = replies.value.map(r => ({
        ...r,
        isAccepted: r.id === post.value.acceptedReplyId
      }))
      toast.success(isCurrentlyAccepted ? '已取消最佳采纳 (演示模式)' : '已采纳为最佳解答 ★ (演示模式)')
    }
  } catch (cause) {
    toast.error(cause.message || '采纳操作失败')
  }
}

async function toggleLike() {
  try {
    if (!isDemoMode.value) {
      if (!user.value) {
        window.location.href = `${accountOrigin}/#/account`
        return
      }
      const res = await apiRequest(`/api/community/posts/${post.value.id}/like`, { method: 'POST' })
      post.value.liked = res.liked
      post.value.likeCount = res.likeCount
      toast.success(res.liked ? '已赞同探讨 ✦' : '已取消赞同')
    } else {
      post.value.liked = !post.value.liked
      post.value.likeCount = (post.value.likeCount || 0) + (post.value.liked ? 1 : -1)
      toast.success(post.value.liked ? '已赞同探讨 ✦ (演示模式)' : '已取消赞同 (演示模式)')
    }
  } catch (cause) {
    toast.error(cause.message || '点赞失败')
  }
}

async function toggleBookmark() {
  try {
    if (!isDemoMode.value) {
      if (!user.value) {
        window.location.href = `${accountOrigin}/#/account`
        return
      }
      const res = await apiRequest(`/api/community/posts/${post.value.id}/bookmark`, { method: 'POST' })
      post.value.bookmarked = res.bookmarked
      post.value.bookmarkCount = res.bookmarkCount
      toast.success(res.bookmarked ? '已收藏此篇探讨 🔖' : '已取消收藏')
    } else {
      post.value.bookmarked = !post.value.bookmarked
      post.value.bookmarkCount = (post.value.bookmarkCount || 0) + (post.value.bookmarked ? 1 : -1)
      toast.success(post.value.bookmarked ? '已收藏此篇探讨 🔖 (演示模式)' : '已取消收藏 (演示模式)')
    }
  } catch (cause) {
    toast.error(cause.message || '收藏失败')
  }
}

async function deletePost() {
  if (!confirm('确定要撤回或删除此条探讨记录吗？')) return
  try {
    if (!isDemoMode.value) {
      await apiRequest(`/api/community/posts/${post.value.id}`, { method: 'DELETE' })
    }
    toast.info('探讨已移除')
    router.push('/community')
  } catch (err) {
    toast.error(err.message || '删除失败')
  }
}

async function reportPost() {
  const reason = window.prompt('请简要说明学术规范违规或虚假信息举报原因：')
  if (!reason?.trim()) return
  try {
    if (!isDemoMode.value) {
      await apiRequest('/api/community/reports', {
        method: 'POST',
        body: JSON.stringify({ postId: post.value.id, reason })
      })
    }
    toast.success('学术监督举报已递交，管委会将核对处理。')
  } catch (cause) {
    toast.error(cause.message || '提交举报失败')
  }
}

watch(() => route.params.id, loadPost)

onMounted(async () => {
  const session = await authClient.getSession().catch(() => null)
  user.value = session?.data?.user || null
  await loadPost()

  if (!isDemoMode.value && typeof EventSource !== 'undefined') {
    try {
      stream = new EventSource(`${accountOrigin}/api/community/stream`)
      stream.addEventListener('community', event => {
        if (JSON.parse(event.data).postId === Number(route.params.id)) void loadPost()
      })
    } catch {
      // ignore
    }
  }
})

onBeforeUnmount(() => stream?.close())
</script>

<style scoped>
.community-detail {
  padding-top: 36px;
  padding-bottom: 90px;
}

.community-detail-post {
  padding: 36px 32px;
  margin-bottom: 36px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-box);
  box-shadow: var(--shadow-sm);
}

.detail-title {
  margin: 14px 0 16px;
  font-size: clamp(24px, 3.5vw, 36px);
  font-weight: 800;
  line-height: 1.3;
  color: var(--geo-ocean-deep);
  font-family: Georgia, 'Playfair Display', 'Songti SC', serif;
}

.detail-author-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 18px;
  margin-bottom: 22px;
  border-bottom: 1px dashed var(--border);
}

.author-name-link {
  font-size: 14px;
  font-weight: 700;
  color: var(--geo-ocean);
  text-decoration: none;
}

.author-name-link:hover {
  text-decoration: underline;
}

.post-time {
  font-size: 12.5px;
  color: var(--text-faint);
  margin-left: 6px;
}

.author-actions-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-body {
  font-size: 16px;
  line-height: 1.85;
  color: var(--text);
  margin-bottom: 24px;
  white-space: pre-wrap;
}

.detail-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.detail-tag-item {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: var(--bg-soft);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

/* 3D 实验挂载联动卡片 */
.linked-experiment-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 22px 24px;
  margin-bottom: 24px;
  border-radius: var(--radius-card);
  background: linear-gradient(135deg, #0f2742 0%, #1a446c 100%);
  color: #ffffff;
  border: 1px solid rgba(197, 160, 89, 0.4);
  box-shadow: var(--shadow-sm);
}

.exp-box-left {
  flex: 1;
}

.exp-box-badge {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  letter-spacing: 0.1em;
  color: #c5a059;
  font-weight: 700;
  display: block;
  margin-bottom: 6px;
}

.linked-experiment-box h4 {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
}

.linked-experiment-box p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #d0e0ed;
}

.exp-box-btn {
  flex: none;
  white-space: nowrap;
  text-decoration: none;
}

.detail-interaction-bar {
  display: flex;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

/* 回复列表 */
.replies-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
}

.replies-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.community-reply {
  padding: 24px 28px;
  margin-bottom: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-xs);
}

.is-nested {
  margin-left: 28px;
  background: var(--bg-soft);
  border-left: 3px solid var(--geo-ocean);
}

.is-accepted-card {
  border: 2px solid #2e7d5b;
  background: #fbfefc;
  box-shadow: 0 4px 16px rgba(46, 125, 91, 0.12);
}

.accepted-banner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: #eef8f0;
  color: #2e7d5b;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(46, 125, 91, 0.3);
}

.reply-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reply-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reply-author-link {
  color: var(--geo-ocean-deep);
  text-decoration: none;
}

.reply-author-link:hover {
  text-decoration: underline;
}

.reply-time {
  font-size: 12px;
  color: var(--text-faint);
}

.reply-prose {
  font-size: 14.5px;
  line-height: 1.8;
  color: var(--text);
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.reply-actions-row {
  display: flex;
  justify-content: flex-end;
}

.baroque-reply-trigger {
  border: 0;
  background: transparent;
  color: var(--geo-ocean);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
}

.baroque-reply-trigger:hover {
  text-decoration: underline;
}

/* 回复表单 */
.community-reply-form {
  margin-top: 40px;
  padding: 30px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-box);
  box-shadow: var(--shadow-sm);
}

.community-reply-form h2 {
  margin: 0 0 16px;
  font-size: 18px;
  color: var(--geo-ocean-deep);
}

.replying-notice {
  font-size: 13px;
  color: var(--geo-ocean);
  margin-bottom: 10px;
}

.cancel-quote-btn {
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  text-decoration: underline;
}

.reply-submit-row {
  margin-top: 12px;
}

@media (max-width: 720px) {
  .linked-experiment-box {
    flex-direction: column;
    align-items: flex-start;
  }
  .exp-box-btn {
    width: 100%;
    text-align: center;
  }
  .is-nested {
    margin-left: 12px;
  }
}
</style>
