<template>
  <div class="community-wrap community-admin">
    <router-link class="community-back" to="/community">← 返回社区</router-link>
    <h1>社区管理</h1>
    <p v-if="error" class="community-state community-error" role="alert">{{ error }}</p>
    <template v-else-if="ready">
      <section class="community-side-block" aria-labelledby="reports-heading">
        <h2 id="reports-heading">待处理举报</h2>
        <p v-if="!reports.length">暂无待处理举报。</p>
        <article v-for="report in reports" :key="report.id" class="community-admin-row">
          <p>举报 #{{ report.id }} · {{ report.post_id ? `帖子 #${report.post_id}` : `回复 #${report.reply_id}` }}</p>
          <p>{{ report.reason }}</p>
          <div>
            <router-link v-if="report.contentAvailable" :to="{ path: `/community/post/${report.discussionId}`, hash: report.reply_id ? `#reply-${report.reply_id}` : '' }">{{ report.reply_id ? '查看被举报回复' : '查看讨论' }}</router-link>
            <span v-else>内容已隐藏或删除，不再提供公开正文与历史记录。</span>
            <button type="button" @click="resolveReport(report.id, 'hide')">隐藏内容</button>
            <button type="button" @click="resolveReport(report.id, 'dismiss')">驳回举报</button>
          </div>
        </article>
      </section>

      <section class="community-side-block" aria-labelledby="event-feedback-heading">
        <h2 id="event-feedback-heading">事件来源纠错</h2>
        <p>处理状态仅记录平台核对结果，不会自动修改 NASA EONET 或 USGS 的原始记录。</p>
        <p v-if="!eventFeedback.length">暂无待处理的事件纠错反馈。</p>
        <article v-for="feedback in eventFeedback" :key="feedback.id" class="community-admin-row">
          <p>事件 #{{ feedback.topicId }} · {{ feedback.topicTitle }} · {{ feedback.reporter }}</p>
          <p>{{ feedback.reason }}</p>
          <a :href="feedback.sourceUrl" target="_blank" rel="noopener noreferrer">打开原始来源 ↗</a>
          <label :for="`feedback-note-${feedback.id}`">核对记录（可选）</label>
          <textarea :id="`feedback-note-${feedback.id}`" v-model.trim="feedbackNotes[feedback.id]" maxlength="1000" rows="2" />
          <div>
            <button type="button" @click="resolveEventFeedback(feedback.id, 'resolve')">记录已核对</button>
            <button type="button" @click="resolveEventFeedback(feedback.id, 'dismiss')">驳回反馈</button>
          </div>
        </article>
      </section>

      <!-- 待审核社群入驻申请 -->
      <section class="community-side-block" aria-labelledby="groups-mod-heading">
        <h2 id="groups-mod-heading">社群登记审核</h2>
        <p v-if="!pendingGroups.length">暂无待审核的社群申请。</p>
        <article v-for="group in groups" :key="group.id" class="community-admin-row">
          <div>
            <strong>{{ group.name }}</strong> (QQ: {{ group.qqNumber }})
            <span class="status-badge" :class="`status-${group.status}`">{{ group.status === 'approved' ? '已展示' : group.status === 'pending' ? '待审核' : '已驳回' }}</span>
          </div>
          <p><strong>简介：</strong>{{ group.description }}</p>
          <p><strong>授权说明：</strong>{{ group.authorizationNote }} <small v-if="group.submittedByAuthor">（申请人: {{ group.submittedByAuthor }}）</small></p>
          <div v-if="group.status === 'pending'">
            <button type="button" @click="moderateGroup(group.id, 'approve')">批准公开展示</button>
            <button type="button" @click="moderateGroup(group.id, 'reject')">驳回申请</button>
          </div>
        </article>
      </section>

      <section class="community-side-block" aria-labelledby="categories-heading">
        <h2 id="categories-heading">专业分区</h2>
        <article v-for="category in categories" :key="category.id" class="community-admin-row">
          <div><strong>{{ category.name }}</strong> <small>{{ category.slug }}</small></div>
          <p>{{ category.description }}</p>
          <button type="button" @click="toggleCategory(category)">{{ category.active ? '停用分区' : '启用分区' }}</button>
        </article>
        <form class="community-compose-form" @submit.prevent="addCategory">
          <h3>新增分区</h3>
          <label>标识（英文小写）<input v-model.trim="newCategory.slug" required pattern="[a-z0-9-]+" maxlength="40" /></label>
          <label>名称<input v-model.trim="newCategory.name" required maxlength="50" /></label>
          <label>简介<input v-model.trim="newCategory.description" maxlength="200" /></label>
          <button type="submit">添加分区</button>
        </form>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { apiRequest } from '../account/client.js'

const ready = ref(false)
const error = ref('')
const reports = ref([])
const eventFeedback = ref([])
const categories = ref([])
const groups = ref([])
const feedbackNotes = reactive({})
const newCategory = reactive({ slug: '', name: '', description: '' })

const pendingGroups = computed(() => groups.value.filter(g => g.status === 'pending'))

async function refresh() {
  const [reportData, eventFeedbackData, categoryData, groupData] = await Promise.all([
    apiRequest('/api/community/moderation/reports'),
    apiRequest('/api/community/moderation/event-feedback'),
    apiRequest('/api/community/moderation/categories'),
    apiRequest('/api/community/moderation/groups')
  ])
  reports.value = reportData.reports
  eventFeedback.value = eventFeedbackData.feedback
  categories.value = categoryData.categories
  groups.value = groupData.groups || []
  ready.value = true
}

async function moderateGroup(id, action) {
  error.value = ''
  try {
    await apiRequest(`/api/community/moderation/groups/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action })
    })
    await refresh()
  } catch (cause) { error.value = cause.message }
}

async function resolveReport(id, action) {
  error.value = ''
  try {
    await apiRequest(`/api/community/moderation/reports/${id}`, { method: 'POST', body: JSON.stringify({ action }) })
    await refresh()
  } catch (cause) { error.value = cause.message }
}
async function resolveEventFeedback(id, action) {
  error.value = ''
  try {
    await apiRequest(`/api/community/moderation/event-feedback/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action, resolutionNote: feedbackNotes[id] || '' })
    })
    delete feedbackNotes[id]
    await refresh()
  } catch (cause) { error.value = cause.message }
}
async function toggleCategory(category) {
  error.value = ''
  try {
    await apiRequest(`/api/community/moderation/categories/${category.id}`, { method: 'PATCH', body: JSON.stringify({ active: !category.active }) })
    await refresh()
  } catch (cause) { error.value = cause.message }
}
async function addCategory() {
  error.value = ''
  try {
    await apiRequest('/api/community/moderation/categories', { method: 'POST', body: JSON.stringify(newCategory) })
    newCategory.slug = ''; newCategory.name = ''; newCategory.description = ''
    await refresh()
  } catch (cause) { error.value = cause.message }
}
onMounted(() => { void refresh().catch(cause => { error.value = cause.message }) })
</script>
