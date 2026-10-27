<template>
  <div class="community-wrap user-profile-page">
    <router-link class="community-back" to="/community">← 返回社区</router-link>

    <div v-if="loading" class="skeleton-card" style="margin-bottom: 24px" aria-busy="true">
      <div class="skeleton-box skeleton-line skeleton-line-title"></div>
      <div class="skeleton-box skeleton-line"></div>
      <div class="skeleton-box skeleton-line skeleton-line-short"></div>
    </div>

    <p v-else-if="error && !profileData" class="community-state community-error" role="alert">
      {{ error }}
      <br />
      <button class="baroque-btn baroque-btn-sm" style="margin-top: 12px" @click="loadProfile">重试加载</button>
    </p>

    <template v-else-if="profileData">
      <header class="profile-header baroque-frame">
        <div class="profile-avatar-col">
          <div class="profile-compass-seal" aria-hidden="true">
            <svg viewBox="0 0 100 100" class="seal-svg">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1" />
              <polygon points="50,14 56,50 50,45 44,50" fill="#c5a059" />
              <polygon points="50,86 56,50 50,55 44,50" fill="currentColor" opacity="0.6" />
              <circle cx="50" cy="50" r="3" fill="#c5a059" />
            </svg>
          </div>
        </div>

        <div class="profile-info-col">
          <div class="profile-name-row">
            <h1>{{ profileData.user.name }}</h1>
            <span v-if="profileData.user.title" class="profile-title-badge">{{ profileData.user.title }}</span>
            <button v-if="canEdit && !isEditing" class="baroque-btn baroque-btn-sm" type="button" @click="isEditing = true">
              编辑学者资料
            </button>
          </div>

          <p class="profile-bio">{{ profileData.user.bio || '专注于地球科学探索、空间分析与地理教学实践。' }}</p>

          <div class="profile-meta-tags">
            <span v-if="profileData.user.institution" class="meta-tag">🏛 {{ profileData.user.institution }}</span>
            <span v-if="profileData.user.location" class="meta-tag">📍 {{ profileData.user.location }}</span>
          </div>

          <div class="profile-stats-bar">
            <div class="stat-box">
          <span class="stat-num">{{ profileData.stats?.postsCount ?? 0 }}</span>
              <span class="stat-label">学术讨论</span>
            </div>
            <div class="stat-box">
          <span class="stat-num highlight-stat">{{ profileData.stats?.acceptedAnswersCount ?? 0 }}</span>
              <span class="stat-label">最佳采纳</span>
            </div>
            <div class="stat-box">
          <span class="stat-num">{{ profileData.stats?.likesReceived ?? 0 }}</span>
              <span class="stat-label">获得赞同</span>
            </div>
          </div>
        </div>
      </header>

      <!-- 本人编辑表单 -->
      <section v-if="isEditing" class="profile-edit-box baroque-frame">
        <h3>修润学者档案</h3>
        <form @submit.prevent="saveProfile">
          <label>学术身份 / 头衔
            <input v-model.trim="editForm.title" maxlength="60" placeholder="例如：高校自然地理学 · 硕博研究生 / 中学地理高级教师" />
          </label>
          <label>所属科研院所 / 院校
            <input v-model.trim="editForm.institution" maxlength="80" placeholder="例如：中国科学院地理科学与资源研究所" />
          </label>
          <label>常驻观测区域 / 台站
            <input v-model.trim="editForm.location" maxlength="60" placeholder="例如：北京 / 青藏高原野外观测站" />
          </label>
          <label>个人简介 / 专注研究方向
            <textarea v-model.trim="editForm.bio" maxlength="300" rows="3" placeholder="介绍你的学科兴趣、研究方向或教学经验……" />
          </label>
          <div class="edit-actions">
            <button class="baroque-btn baroque-btn-primary" type="submit" :disabled="saving">
              {{ saving ? '保存中…' : '保存主页资料' }}
            </button>
            <button class="baroque-btn" type="button" @click="isEditing = false">取消</button>
          </div>
        </form>
      </section>

      <!-- 学者成果专栏 -->
      <section class="profile-posts-section">
        <h3 class="posts-heading">最近参与的学术探讨</h3>
        <div v-if="profilePosts.length" class="profile-posts-list">
          <router-link
            v-for="p in profilePosts"
            :key="p.id"
            :to="`/community/post/${p.id}`"
            class="profile-post-card baroque-frame"
          >
            <div class="post-header-line">
              <span class="post-kind-tag" :class="`kind-${p.kind}`">{{ p.kind === 'question' ? '提问' : '讨论' }}</span>
              <span class="post-cat-name">{{ p.categoryName || '地理学术' }}</span>
              <span class="post-time">{{ formatDate(p.created_at) }}</span>
            </div>
            <h4>{{ p.title }}</h4>
            <div class="post-footer-line">
              <span>赞同 {{ p.likesCount ?? 0 }}</span>
              <span>回复 {{ p.repliesCount ?? 0 }}</span>
            </div>
          </router-link>
        </div>
        <p v-else class="community-state">暂无发布的探讨记录。</p>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { apiRequest, authClient } from '../account/client.js'
import { toast } from '../utils/toast.js'

const route = useRoute()
const profileData = ref(null)
const loading = ref(false)
const error = ref('')
const currentUser = ref(null)
const isEditing = ref(false)
const saving = ref(false)

const editForm = reactive({
  title: '',
  bio: '',
  institution: '',
  location: ''
})

const isMe = computed(() => currentUser.value && profileData.value && currentUser.value.id === profileData.value.user.id)
const canEdit = computed(() => isMe.value)

const profilePosts = computed(() => {
  return Array.isArray(profileData.value?.posts) ? profileData.value.posts : []
})

const formatDate = value => {
  try {
    return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
  } catch {
    return String(value)
  }
}

async function loadProfile() {
  loading.value = true
  error.value = ''
  profileData.value = null
  try {
    const res = await apiRequest(`/api/community/users/${route.params.id}`)
    profileData.value = res
    editForm.title = res.user?.title || ''
    editForm.bio = res.user?.bio || ''
    editForm.institution = res.user?.institution || ''
    editForm.location = res.user?.location || ''
  } catch {
    error.value = '个人主页暂时无法载入，请稍后重试。'
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  saving.value = true
  try {
    await apiRequest('/api/community/users/me', {
      method: 'PATCH',
      body: JSON.stringify(editForm)
    })
    toast.success('学者资料已更新！')
    isEditing.value = false
    await loadProfile()
  } catch (err) {
    toast.error(err.message || '保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

watch(() => route.params.id, loadProfile)

onMounted(async () => {
  const session = await authClient.getSession().catch(() => null)
  currentUser.value = session?.data?.user || null
  await loadProfile()
})
</script>

<style scoped>
.user-profile-page {
  padding-top: 36px;
  padding-bottom: 80px;
}

.profile-header {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  padding: 36px 32px;
  margin-bottom: 36px;
  background: var(--surface);
  border: 1px solid var(--baroque-border-gold);
  border-radius: var(--radius-box);
  box-shadow: var(--shadow-sm);
}

.profile-avatar-col {
  flex-shrink: 0;
}

.profile-compass-seal {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, #fbf9f4 0%, #ece5d6 100%);
  border: 2px solid var(--baroque-bronze);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(15, 39, 66, 0.08);
}

.seal-svg {
  width: 72px;
  height: 72px;
  color: var(--geo-ocean-deep);
}

.profile-info-col {
  flex: 1;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.profile-name-row h1 {
  margin: 0;
  font-size: clamp(24px, 3.5vw, 32px);
  color: var(--geo-ocean-deep);
  font-family: Georgia, 'Playfair Display', 'Songti SC', serif;
}

.profile-title-badge {
  font-size: 13px;
  background: rgba(197, 160, 89, 0.15);
  color: #8b6826;
  border: 1px solid var(--baroque-border-gold);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-weight: 600;
}

.profile-bio {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 0 16px;
  max-width: 720px;
}

.profile-meta-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.meta-tag {
  font-size: 13px;
  color: var(--geo-ocean);
  background: var(--geo-ocean-surface);
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;
}

.profile-stats-bar {
  display: flex;
  gap: 32px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.stat-box {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--geo-ocean-deep);
  font-family: ui-monospace, monospace;
}

.highlight-stat {
  color: #c5a059;
}

.stat-label {
  font-size: 12px;
  color: var(--text-faint);
}

.profile-edit-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 28px;
  margin-bottom: 36px;
}

.profile-edit-box h3 {
  margin: 0 0 20px;
  font-size: 18px;
  color: var(--geo-ocean-deep);
}

.profile-edit-box form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-edit-box label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
}

.profile-edit-box input,
.profile-edit-box textarea {
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 14px;
  color: var(--text);
  background: var(--surface);
}

.profile-edit-box input:focus,
.profile-edit-box textarea:focus {
  outline: none;
  border-color: var(--baroque-bronze);
  box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.2);
}

.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.profile-posts-section {
  margin-top: 24px;
}

.posts-heading {
  font-size: 20px;
  color: var(--geo-ocean-deep);
  margin-bottom: 18px;
}

.profile-posts-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-post-card {
  display: block;
  padding: 20px 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  text-decoration: none;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.profile-post-card:hover {
  transform: translateY(-2px);
  border-color: var(--baroque-border-gold);
  box-shadow: 0 6px 16px rgba(15, 39, 66, 0.06);
}

.post-header-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 12.5px;
}

.post-kind-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.kind-question {
  background: rgba(197, 160, 89, 0.18);
  color: #8b6826;
}

.kind-discussion {
  background: var(--geo-ocean-surface);
  color: var(--geo-ocean);
}

.post-cat-name {
  color: var(--text-faint);
}

.post-time {
  color: var(--text-faint);
  margin-left: auto;
}

.profile-post-card h4 {
  margin: 0 0 10px;
  font-size: 16.5px;
  color: var(--geo-ocean-deep);
  line-height: 1.45;
}

.post-footer-line {
  display: flex;
  gap: 16px;
  font-size: 12.5px;
  color: var(--text-faint);
}

@media (max-width: 680px) {
  .profile-header {
    flex-direction: column;
    padding: 24px 20px;
    align-items: center;
    text-align: center;
  }
  .profile-name-row {
    justify-content: center;
  }
  .profile-meta-tags {
    justify-content: center;
  }
  .profile-stats-bar {
    justify-content: center;
  }
}
</style>
