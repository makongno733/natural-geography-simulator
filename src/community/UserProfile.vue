<template>
  <div class="community-wrap user-profile-page">
    <router-link class="community-back" to="/community">← 返回社区</router-link>

    <p v-if="loading" class="community-state" role="status">正在读取学者主页……</p>
    <p v-else-if="error" class="community-state community-error" role="alert">{{ error }}</p>

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
            <button v-if="isMe && !isEditing" class="baroque-btn baroque-btn-sm" type="button" @click="isEditing = true">编辑资料</button>
          </div>

          <p class="profile-bio">{{ profileData.user.bio || '这位学者很低调，暂未留下个人介绍。' }}</p>

          <div class="profile-meta-tags">
            <span v-if="profileData.user.institution" class="meta-tag">🏛 {{ profileData.user.institution }}</span>
            <span v-if="profileData.user.location" class="meta-tag">📍 {{ profileData.user.location }}</span>
          </div>

          <div class="profile-stats-bar">
            <div class="stat-box">
              <span class="stat-num">{{ profileData.stats.postsCount }}</span>
              <span class="stat-label">学术讨论</span>
            </div>
            <div class="stat-box">
              <span class="stat-num highlight-stat">{{ profileData.stats.acceptedAnswersCount }}</span>
              <span class="stat-label">最佳采纳</span>
            </div>
            <div class="stat-box">
              <span class="stat-num">{{ profileData.stats.likesReceived }}</span>
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
            <input v-model.trim="editForm.title" maxlength="60" placeholder="如：北京大学自然地理学 · 博士生 / 中学地理高级教师" />
          </label>
          <label>所属院校 / 科研机构
            <input v-model.trim="editForm.institution" maxlength="80" placeholder="如：中国科学院地理科学与资源研究所" />
          </label>
          <label>所在区域 / 台站
            <input v-model.trim="editForm.location" maxlength="60" placeholder="如：北京 / 青藏高原纳木错站" />
          </label>
          <label>个人简介 / 研究方向
            <textarea v-model.trim="editForm.bio" maxlength="300" rows="3" placeholder="介绍你的学科兴趣、研究方向或教学经验……" />
          </label>
          <div class="edit-actions">
            <button class="baroque-btn baroque-btn-primary" type="submit" :disabled="saving">{{ saving ? '保存中…' : '保存主页资料' }}</button>
            <button class="baroque-btn" type="button" @click="isEditing = false">取消</button>
          </div>
        </form>
      </section>

      <!-- TA 的发布与讨论 -->
      <section class="profile-posts-section">
        <div class="community-section-heading">
          <div>
            <p class="community-eyebrow">SCHOLARLY TRACES / 学术轨迹</p>
            <h2>发布的讨论与问答 ({{ profileData.recentPosts.length }})</h2>
          </div>
        </div>

        <p v-if="!profileData.recentPosts.length" class="community-state">暂未发起讨论。</p>
        <div v-else class="community-post-list">
          <article v-for="post in profileData.recentPosts" :key="post.id" class="community-post-card">
            <div class="community-post-meta">
              <span>{{ post.category }}</span>
              <span>{{ post.kind === 'question' ? '提问' : '交流' }}</span>
            </div>
            <h3><router-link :to="`/community/post/${post.id}`">{{ post.title }}</router-link></h3>
            <div class="community-post-foot">
              <span>发布于 {{ formatDate(post.createdAt) }}</span>
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { apiRequest, authClient } from '../account/client.js'

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
const formatDate = value => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))

async function loadProfile() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiRequest(`/api/community/users/${route.params.id}`)
    profileData.value = res
    editForm.title = res.user.title || ''
    editForm.bio = res.user.bio || ''
    editForm.institution = res.user.institution || ''
    editForm.location = res.user.location || ''
  } catch (err) {
    error.value = err.message || '读取用户资料失败'
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
    isEditing.value = false
    await loadProfile()
  } catch (err) {
    alert(err.message || '保存失败')
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
  border: 1px solid var(--border);
  border-radius: var(--radius-box);
  box-shadow: var(--shadow-sm);
}

.profile-avatar-col {
  flex: none;
}

.profile-compass-seal {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--geo-ocean-surface) 0%, var(--surface) 75%);
  border: 1px solid var(--border);
  color: var(--geo-ocean);
  display: grid;
  place-items: center;
  box-shadow: inset 0 0 12px rgba(26,68,108,0.08);
}

.seal-svg {
  width: 78px;
  height: 78px;
}

.profile-info-col {
  flex: 1;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.profile-name-row h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--geo-ocean-deep);
}

.profile-title-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: var(--geo-ocean-surface);
  color: var(--geo-ocean);
  border: 1px solid rgba(26,68,108,0.15);
}

.profile-bio {
  font-size: 14.5px;
  line-height: 1.75;
  color: var(--text-muted);
  margin: 0 0 16px;
}

.profile-meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 24px;
}

.meta-tag {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-soft);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.profile-stats-bar {
  display: flex;
  gap: 32px;
  padding-top: 18px;
  border-top: 1px dashed var(--border);
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-num {
  font-size: 24px;
  font-weight: 800;
  color: var(--geo-ocean-deep);
  font-family: ui-monospace, SFMono-Regular, monospace;
}

.stat-num.highlight-stat {
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
  padding: 24px;
  margin-bottom: 36px;
  box-shadow: var(--shadow-sm);
}

.profile-edit-box h3 {
  margin: 0 0 16px;
  color: var(--geo-ocean-deep);
  font-size: 18px;
}

.profile-edit-box form {
  display: grid;
  gap: 14px;
}

.profile-edit-box label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--geo-ocean);
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

@media (max-width: 640px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px 16px;
  }
  .profile-name-row {
    justify-content: center;
  }
  .profile-meta-tags {
    justify-content: center;
  }
  .profile-stats-bar {
    justify-content: center;
    gap: 20px;
  }
}
</style>
