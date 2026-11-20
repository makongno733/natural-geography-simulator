<template>
  <div class="community-wrap community-admin">
    <div class="admin-top-bar">
      <router-link class="community-back" to="/community">← 返回社区</router-link>
      <router-link class="community-back" to="/fanxing">🌟 前往繁星课题大厅 →</router-link>
    </div>
    <h1>社区与繁星科研管理后台</h1>
    <p v-if="error" class="community-state community-error" role="alert">{{ error }}</p>
    <p v-if="notice" class="community-state" role="status">{{ notice }}</p>

    <template v-else-if="ready">
      <!-- 1. 繁星计划科研课题申请审核（核心新增） -->
      <section class="community-side-block" aria-labelledby="fanxing-apps-heading">
        <div class="section-head-flex">
          <h2 id="fanxing-apps-heading">🌟 繁星计划科研课题申请审核</h2>
          <span class="count-badge">待审核 {{ pendingApplications.length }} / 共 {{ fanxingApplications.length }} 条</span>
        </div>
        <p class="admin-sub-note">
          审核通过后，申请人将在课题详情页与个人主页自动看到你填写的<strong>审核留言、课题协作 QQ 群号与起步指南</strong>。
        </p>

        <p v-if="!fanxingApplications.length" class="empty-hint">暂无繁星课题申请记录。</p>

        <article v-for="app in fanxingApplications" :key="app.id" class="community-admin-row fanxing-app-row">
          <div class="row-top-line">
            <div>
              <strong>申请人：{{ app.applicantName }}</strong>
              <small v-if="app.applicantEmail">（注册邮箱：{{ app.applicantEmail }}）</small>
              <small v-if="app.applicantContact"> · 预留联系：{{ app.applicantContact }}</small>
            </div>
            <div style="display: flex; gap: 6px; align-items: center">
              <span v-if="app.notificationStatus === 'email_sent'" class="status-badge status-approved" title="已通过 Resend 发送邮件通知">
                ✉ 已发邮件通知
              </span>
              <span class="status-badge" :class="`status-${app.status}`">
                {{ app.status === 'approved' ? '✅ 已通过' : app.status === 'rejected' ? '❌ 已拒绝' : '⏳ 待审核' }}
              </span>
            </div>
          </div>

          <p class="app-project-line">
            <strong>申请课题：</strong>
            <router-link :to="`/fanxing/${app.projectId}`">{{ app.projectTitle || app.projectId }}</router-link>
            <span> · <strong>希望承担任务：</strong>{{ app.preferredTask }}</span>
            <span> · <strong>每周可投入：</strong>{{ app.weeklyTime }}</span>
          </p>
          <p><strong>参与动机：</strong>{{ app.motivation }}</p>
          <p><strong>相关经验：</strong>{{ app.experience || '零基础 / 按指南学习' }}</p>

          <div class="review-controls">
            <label class="inline-field">
              <span>通过后向申请人解锁的课题 QQ 群 / 联系渠道：</span>
              <input
                v-model="reviewInputs[app.id].collabQqGroup"
                type="text"
                maxlength="80"
                placeholder="例如：繁星遥感课题组 QQ群 812345678（暗号：繁星）"
              />
            </label>
            <label class="inline-field">
              <span>给申请人的审核意见 / 入群与起步说明：</span>
              <input
                v-model="reviewInputs[app.id].reviewNote"
                type="text"
                maxlength="300"
                placeholder="例如：欢迎加入！请先加课题QQ群并完成第1批10个样点核查"
              />
            </label>
            <div class="action-btns">
              <button
                type="button"
                class="btn-approve"
                @click="moderateFanxingApplication(app.id, 'approve')"
              >
                ✓ 批准加入并解锁群号/协作通道
              </button>
              <button
                type="button"
                class="btn-reject"
                @click="moderateFanxingApplication(app.id, 'reject')"
              >
                ✕ 拒绝申请
              </button>
            </div>
          </div>
        </article>
      </section>

      <!-- 2. 待处理举报 -->
      <section class="community-side-block" aria-labelledby="reports-heading">
        <h2 id="reports-heading">🛡 待处理社区举报</h2>
        <p v-if="!reports.length">暂无待处理举报。</p>
        <article v-for="report in reports" :key="report.id" class="community-admin-row">
          <p>举报 #{{ report.id }} · {{ report.post_id ? `帖子 #${report.post_id}` : `回复 #${report.reply_id}` }}</p>
          <p>{{ report.reason }}</p>
          <div class="action-btns">
            <router-link v-if="report.post_id" :to="`/community/post/${report.post_id}`">查看讨论</router-link>
            <button type="button" @click="resolveReport(report.id, 'hide')">隐藏内容</button>
            <button type="button" @click="resolveReport(report.id, 'dismiss')">驳回举报</button>
          </div>
        </article>
      </section>

      <!-- 3. 待审核社群入驻申请 -->
      <section class="community-side-block" aria-labelledby="groups-mod-heading">
        <h2 id="groups-mod-heading">🏛 学术交流 QQ 群公开收录审核</h2>
        <p v-if="!pendingGroups.length && !groups.length">暂无待审核的社群申请。</p>
        <article v-for="group in groups" :key="group.id" class="community-admin-row">
          <div class="row-top-line">
            <div>
              <strong>{{ group.name }}</strong> (QQ: {{ group.qqNumber }})
            </div>
            <span class="status-badge" :class="`status-${group.status}`">
              {{ group.status === 'approved' ? '已公开展示' : group.status === 'pending' ? '待审核' : '已驳回' }}
            </span>
          </div>
          <p><strong>简介：</strong>{{ group.description }}</p>
          <p><strong>授权说明：</strong>{{ group.authorizationNote }} <small v-if="group.submittedByAuthor">（提交人: {{ group.submittedByAuthor }}）</small></p>
          <div v-if="group.status === 'pending'" class="action-btns">
            <button type="button" class="btn-approve" @click="moderateGroup(group.id, 'approve')">批准公开展示</button>
            <button type="button" class="btn-reject" @click="moderateGroup(group.id, 'reject')">驳回申请</button>
          </div>
        </article>
      </section>

      <!-- 4. 开放地理科学资源推荐审核 -->
      <section class="community-side-block" aria-labelledby="resources-mod-heading">
        <h2 id="resources-mod-heading">📚 开放地理数据与方法资源审核</h2>
        <p v-if="!resources.length">暂无用户提交的开放资源申请。</p>
        <article v-for="res in resources" :key="res.id" class="community-admin-row">
          <div class="row-top-line">
            <div>
              <strong>{{ res.title }}</strong> · <small>{{ res.category }} ({{ res.format }})</small>
            </div>
            <span class="status-badge" :class="`status-${res.status}`">
              {{ res.status === 'approved' ? '已收录' : res.status === 'pending' ? '待审核' : '已驳回' }}
            </span>
          </div>
          <p>{{ res.description }}</p>
          <p>
            <strong>许可协议：</strong>{{ res.license }} ·
            <a :href="res.sourceUrl" target="_blank" rel="noopener noreferrer">{{ res.sourceUrl }} ↗</a>
            <small v-if="res.submittedByAuthor">（推荐人：{{ res.submittedByAuthor }}）</small>
          </p>
          <div v-if="res.status === 'pending'" class="action-btns">
            <button type="button" class="btn-approve" @click="moderateResource(res.id, 'approve')">批准收录展示</button>
            <button type="button" class="btn-reject" @click="moderateResource(res.id, 'reject')">驳回</button>
          </div>
        </article>
      </section>

      <!-- 5. 专业分区管理 -->
      <section class="community-side-block" aria-labelledby="categories-heading">
        <h2 id="categories-heading">🗂 专业学科分区</h2>
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
const notice = ref('')
const reports = ref([])
const categories = ref([])
const groups = ref([])
const resources = ref([])
const fanxingApplications = ref([])
const reviewInputs = reactive({})
const newCategory = reactive({ slug: '', name: '', description: '' })

const pendingGroups = computed(() => groups.value.filter(g => g.status === 'pending'))
const pendingApplications = computed(() => fanxingApplications.value.filter(a => a.status === 'pending'))

function ensureReviewInputs(apps) {
  for (const app of apps) {
    if (!reviewInputs[app.id]) {
      reviewInputs[app.id] = {
        reviewNote: app.reviewNote || '审核已通过！请加入课题组 QQ 群并按起步指南完成首项微任务。',
        collabQqGroup: app.collabQqGroup || ''
      }
    }
  }
}

async function refresh() {
  error.value = ''
  const [reportData, categoryData, groupData, fanxingData, resourceData] = await Promise.all([
    apiRequest('/api/community/moderation/reports'),
    apiRequest('/api/community/moderation/categories'),
    apiRequest('/api/community/moderation/groups'),
    apiRequest('/api/fanxing/moderation/applications').catch(() => ({ applications: [] })),
    apiRequest('/api/community/moderation/resources').catch(() => ({ resources: [] }))
  ])
  reports.value = reportData.reports || []
  categories.value = categoryData.categories || []
  groups.value = groupData.groups || []
  fanxingApplications.value = fanxingData.applications || []
  resources.value = resourceData.resources || []
  ensureReviewInputs(fanxingApplications.value)
  ready.value = true
}

async function moderateFanxingApplication(id, action) {
  error.value = ''
  notice.value = ''
  try {
    const input = reviewInputs[id] || {}
    const res = await apiRequest(`/api/fanxing/moderation/applications/${id}`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        reviewNote: input.reviewNote,
        collabQqGroup: input.collabQqGroup
      })
    })
    const mailHint = res?.emailNotified ? '（已同步发送邮件通知至申请人注册邮箱）' : '（站内通知与群号解锁已生效）'
    notice.value = action === 'approve'
      ? `申请 #${id} 已通过，已向申请人开放协作渠道与群号${mailHint}。`
      : `申请 #${id} 已更新为未通过${mailHint}。`
    await refresh()
  } catch (cause) {
    error.value = cause.message
  }
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

async function moderateResource(id, action) {
  error.value = ''
  try {
    await apiRequest(`/api/community/moderation/resources/${id}`, {
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

<style scoped>
.admin-top-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
.section-head-flex { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.count-badge { font-size: 12.5px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: #e7f1f8; color: #164e78; }
.admin-sub-note { font-size: 13.5px; color: #546578; margin: 4px 0 14px; }
.row-top-line { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 6px; }
.app-project-line { font-size: 14px; color: #1e293b; margin: 6px 0; }
.review-controls {
  margin-top: 10px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: grid;
  gap: 8px;
}
.inline-field { display: grid; gap: 4px; font-size: 12.5px; font-weight: 600; color: #334155; }
.inline-field input { padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font: inherit; font-size: 13px; }
.action-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
.btn-approve { background: #145a32; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-reject { background: #922b21; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.status-badge { font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.status-approved { background: #d4efdf; color: #145a32; }
.status-pending { background: #fcf3cf; color: #7e5109; }
.status-rejected { background: #fadbd8; color: #922b21; }
</style>
