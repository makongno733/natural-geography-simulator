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
            <button
              class="community-report"
              type="button"
              :aria-expanded="showReportBox"
              @click="showReportBox = !showReportBox"
            >
              ⚠ 举报 / 纠错反馈
            </button>
          </div>
        </div>

        <!-- 内嵌式内容举报与学术纠错反馈面板（无需阻塞弹窗，支持登录举报与访客直达站主） -->
        <div v-if="showReportBox" class="report-inline-panel" role="region" aria-label="内容举报与纠错反馈">
          <div class="rip-head">
            <strong>🛡 内容监督与学术纠错反馈</strong>
            <button type="button" class="rip-close" @click="showReportBox = false">收起 ×</button>
          </div>
          <div class="rip-chips">
            <button
              v-for="r in ['数据/地名/单位有误', '未标明真实观测或教学仿真', '广告或无关灌水', '不友善或违规内容']"
              :key="r"
              type="button"
              class="formula-chip"
              @click="reportReason = r"
            >
              {{ r }}
            </button>
          </div>
          <div class="rip-input-row">
            <input
              v-model.trim="reportReason"
              type="text"
              maxlength="300"
              placeholder="请填写具体违规原因或科学纠错建议（1–300 字）…"
              aria-label="举报或纠错原因"
            />
            <button type="button" class="baroque-btn baroque-btn-sm baroque-btn-primary" :disabled="reporting" @click="submitReport">
              {{ reporting ? '提交中…' : '提交举报反馈' }}
            </button>
            <a
              :href="`mailto:makongno733@gmail.com?subject=${encodeURIComponent('【地理共同体内容反馈】' + (post.title || ''))}&body=${encodeURIComponent('反馈内容：' + (reportReason || '') + '\n页面地址：' + currentHref)}`"
              class="baroque-btn baroque-btn-sm"
            >
              ✉ 邮件联系站主 ↗
            </a>
          </div>
          <p v-if="reportFeedbackMsg" class="rip-feedback" role="status">{{ reportFeedbackMsg }}</p>
        </div>

        <div class="community-prose detail-body" v-html="renderGeoScholarlyText(post.body)"></div>

        <!-- 结构化标签列表（点击可前往全站检索对应标签） -->
        <div v-if="derivePostTags(post).length" class="detail-tags-list">
          <router-link
            v-for="tagObj in derivePostTags(post)"
            :key="tagObj.label"
            :to="{ path: '/search', query: { q: tagObj.query } }"
            class="detail-tag-item"
          >
            #{{ tagObj.label }}
          </router-link>
        </div>

        <!-- 挂载的探究证据卡（明确展示模型名称、条件、两组结果、证据类型、适用边界与「教学仿真／真实观测」说明） -->
        <div v-if="attachedEvidence" class="evidence-attach-box baroque-frame">
          <div class="evidence-header" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
            <span class="evidence-badge">📊 科学观察证据卡</span>
            <span
              class="evidence-badge"
              :style="attachedEvidence.isRealData
                ? 'background: #d1fae5; color: #065f46; border: 1px solid #34d399'
                : 'background: #fef3c7; color: #92400e; border: 1px solid #f59e0b'"
            >
              {{ attachedEvidence.disclaimer || '教学仿真，非现场实测' }}
            </span>
            <small class="evidence-task-title">{{ attachedEvidence.taskTitle }}</small>
          </div>
          <h4 class="evidence-title">{{ attachedEvidence.title }}</h4>
          <p v-if="attachedEvidence.modelName" class="evidence-facts" style="margin-bottom: 4px">
            <strong>模型/图层名称：</strong>{{ attachedEvidence.modelName }} · <strong>证据类型：</strong>{{ attachedEvidence.evidenceType }}
          </p>
          <p v-if="attachedEvidence.conditions" class="evidence-facts" style="margin-bottom: 6px">
            <strong>实验/观测条件：</strong>{{ attachedEvidence.conditions }}
          </p>
          <div
            v-if="attachedEvidence.groupA && attachedEvidence.groupB"
            style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: center; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; margin: 8px 0"
          >
            <div>
              <div style="font-size: 11px; color: #64748b; font-weight: 700">{{ attachedEvidence.groupA.label }}</div>
              <strong style="font-size: 13px; color: #0f172a">{{ attachedEvidence.groupA.metric }}</strong>
            </div>
            <span style="font-size: 11px; font-weight: 800; color: #0284c7">vs</span>
            <div>
              <div style="font-size: 11px; color: #64748b; font-weight: 700">{{ attachedEvidence.groupB.label }}</div>
              <strong style="font-size: 13px; color: #0f172a">{{ attachedEvidence.groupB.metric }}</strong>
            </div>
          </div>
          <p class="evidence-facts">{{ attachedEvidence.facts }}</p>
          <p v-if="attachedEvidence.limitations" class="evidence-facts" style="font-size: 12px; color: #64748b">
            {{ attachedEvidence.limitations }}
          </p>
          <router-link :to="attachedEvidence.route" class="evidence-action-link">
            🔬 打开同一次观察（还原对照参数与视角）↗
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

        <!-- 关联的繁星计划科研课题或学术论文 DOI -->
        <div v-if="post.linkedProject || post.paperDoi" class="linked-experiment-box baroque-frame" style="margin-top: 14px; background: #fcfbf7">
          <div class="exp-box-left">
            <span class="exp-box-badge">🌟 关联繁星课题与学术文献</span>
            <h4 v-if="post.linkedProject">本讨论隶属繁星计划课题：{{ post.linkedProject }}</h4>
            <h4 v-else-if="post.paperTitle">关联学术论文：{{ post.paperTitle }}</h4>
            <p v-if="post.paperDoi">
              参考论文 DOI：<a :href="`https://doi.org/${post.paperDoi}`" target="_blank" rel="noopener noreferrer">https://doi.org/{{ post.paperDoi }} ↗</a>
            </p>
          </div>
          <router-link
            v-if="post.linkedProject"
            :to="`/fanxing/${post.linkedProject}`"
            class="baroque-btn baroque-btn-primary exp-box-btn"
          >
            查看课题详情与申请加入 →
          </router-link>
        </div>

        <!-- 帖子操作工具栏：点赞、收藏、转化为繁星科研课题 -->
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
          <router-link
            :to="{
              path: '/fanxing',
              query: {
                propose: '1',
                fromPost: String(post.id),
                title: post.title.replace(/^【[^】]+】/, '').trim().slice(0, 60),
                question: post.title,
                method: (post.body || '').slice(0, 320),
                paperDoi: post.paperDoi || ''
              }
            }"
            class="baroque-btn baroque-btn-sm"
            style="margin-left: auto"
          >
            🌟 将本讨论转化为繁星课题 / 招募协作者 →
          </router-link>
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
        <h2 id="reply-title">参与讨论与回答</h2>
        <p v-if="!user && !isDemoMode" class="community-state">
          登录后就能提问和回复。<a :href="loginReturnHref" @click="rememberPostReturn">登录 / 注册 ↗</a>
        </p>
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
            placeholder="写下你的观察依据、解释过程或补充资料（支持 $公式$ 与 $$块级公式$$）……"
          />
          <div v-if="replyError" class="community-error" role="alert" style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap">
            <span>{{ replyError }}</span>
            <button type="button" class="baroque-btn baroque-btn-sm" :disabled="submitting" @click="sendReply">
              🔄 重新尝试发表
            </button>
          </div>
          <div class="reply-submit-row">
            <button class="baroque-btn baroque-btn-primary" type="submit" :disabled="submitting">
              {{ submitting ? '正在发表…' : '发表回答与评论 ✦' }}
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
import { getEvidenceById, resolveCommunityEvidence } from '../inquiry/evidenceCatalog.js'
import { derivePostTags } from '../utils/topicTags.js'

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
const allowDemoMode = import.meta.env.DEV
const showReportBox = ref(false)
const reportReason = ref('')
const reporting = ref(false)
const reportFeedbackMsg = ref('')
const currentHref = computed(() => (typeof window !== 'undefined' ? window.location.href : 'https://geo.kongnoma279.com'))
let stream

const loginReturnHref = computed(() => {
  const path = route.fullPath || `/community/post/${route.params.id}`
  return `${accountOrigin || ''}/#/account?redirect=${encodeURIComponent(path)}`
})

function rememberPostReturn() {
  try {
    const path = route.fullPath || `/community/post/${route.params.id}`
    localStorage.setItem('geo_auth_return_to', path)
  } catch {}
}

const attachedEvidence = computed(() => {
  if (!post.value) return null
  return resolveCommunityEvidence(post.value.evidenceId, {
    compareUrl: post.value.compareUrl,
    evidenceTitle: post.value.evidenceTitle,
    conditions: post.value.conditions,
    facts: post.value.facts
  })
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
    'solar-motion': '/experiments/astronomy/solar-motion',
    seasons: '/experiments/astronomy/seasons',
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

let postLoadVersion = 0

async function loadPost() {
  const requestedId = String(route.params.id ?? '')
  const currentVersion = ++postLoadVersion
  loading.value = true
  error.value = ''
  try {
    const result = await apiRequest(`/api/community/posts/${requestedId}`)
    if (currentVersion !== postLoadVersion || String(route.params.id ?? '') !== requestedId) {
      return
    }
    post.value = result.post
    replies.value = result.replies
    isDemoMode.value = false
    return
  } catch {
    if (currentVersion !== postLoadVersion || String(route.params.id ?? '') !== requestedId) {
      return
    }
    const targetId = Number(requestedId)
    const localPosts = getLocalDemoPosts()
    const all = [...localPosts, ...mockPosts]
    const matched = all.find(p => p.id === targetId)
    let demoPreviewOptIn = false
    try { demoPreviewOptIn = sessionStorage.getItem('geo_community_demo_preview') === '1' } catch {}

    if (!allowDemoMode && !demoPreviewOptIn && !matched) {
      post.value = null
      replies.value = []
      error.value = '讨论暂时无法载入，或该讨论已被移除。请稍后重试。'
      return
    }
    // 离线演示数据回退（顶部显著标注“✦ 离线演示探讨”）
    isDemoMode.value = true

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
        evidenceId: matched.evidenceId || null,
        compareUrl: matched.compareUrl || null,
        evidenceTitle: matched.evidenceTitle || null,
        conditions: matched.conditions || null,
        facts: matched.facts || null,
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
    if (currentVersion === postLoadVersion && String(route.params.id ?? '') === requestedId) {
      loading.value = false
    }
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
        rememberPostReturn()
        window.location.href = loginReturnHref.value
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
        rememberPostReturn()
        window.location.href = loginReturnHref.value
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

async function submitReport() {
  const reason = reportReason.value.trim()
  if (!reason) {
    reportFeedbackMsg.value = '请先点选或填写举报/纠错原因。'
    return
  }
  reporting.value = true
  reportFeedbackMsg.value = ''
  try {
    if (!isDemoMode.value && user.value) {
      await apiRequest('/api/community/reports', {
        method: 'POST',
        body: JSON.stringify({ postId: post.value.id, reason })
      })
      reportFeedbackMsg.value = '✓ 学术监督举报已递交至后台工单，管理员将尽快核对处理。'
      toast.success('学术监督举报已递交，管理员将核对处理。')
    } else {
      try {
        const list = JSON.parse(localStorage.getItem('geo_local_reports_v1') || '[]')
        list.unshift({ postId: post.value?.id, reason, createdAt: new Date().toISOString() })
        localStorage.setItem('geo_local_reports_v1', JSON.stringify(list.slice(0, 50)))
      } catch {}
      reportFeedbackMsg.value = '✓ 已在本机记录你的反馈！如需加急处理，也可登录后提交云端工单或点击右侧「邮件联系站主」。'
      toast.success('反馈已记录')
    }
    reportReason.value = ''
  } catch (cause) {
    reportFeedbackMsg.value = cause.message || '提交举报失败，请重试或点击右侧邮件联系站主。'
    toast.error(cause.message || '提交举报失败')
  } finally {
    reporting.value = false
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
.report-inline-panel {
  margin: 0 0 20px;
  padding: 14px 16px;
  background: #fffbeb;
  border: 1px solid #f59e0b;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rip-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13.5px;
  color: #92400e;
}
.rip-close {
  background: transparent;
  border: 0;
  color: #92400e;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
.rip-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.rip-input-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.rip-input-row input {
  flex: 1 1 220px;
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
}
.rip-feedback {
  margin: 0;
  font-size: 12.5px;
  font-weight: 700;
  color: #065f46;
}
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
  font-size: 12.5px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: #f1f7fc;
  color: #0c3960;
  border: 1px solid #94a3b8;
  text-decoration: none;
}

.detail-tag-item:hover {
  background: #0f3d68;
  color: #ffffff;
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
  flex-wrap: wrap;
  gap: 10px;
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
  border: 1.5px solid #475569;
  border-radius: 6px;
  background: #f8fafc;
  color: #0c3960;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 10px;
}

.baroque-reply-trigger:hover {
  background: #e2effb;
  border-color: #0f3d68;
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
