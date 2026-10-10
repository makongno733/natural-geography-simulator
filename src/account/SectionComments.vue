<template>
  <section id="lesson-comments" class="comments" aria-label="课程评论">
    <div class="heading"><div><span>学习讨论</span><h3>本节评论</h3></div><span>{{ comments.length }} 条</span></div>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <form v-if="user" @submit.prevent="publish">
      <label for="comment-body">以 {{ user.name }} 的身份参与讨论</label>
      <textarea id="comment-body" v-model="draft" maxlength="1000" rows="3" placeholder="分享你的疑问或发现…" required></textarea>
      <button type="submit" :disabled="busy || !draft.trim()">发表评论</button>
    </form>
    <p v-else class="signin">登录后即可发表评论。<a :href="`${accountOrigin}/#/account`">登录或注册</a></p>
    <p v-if="loading">正在加载评论…</p>
    <p v-else-if="!comments.length" class="empty">还没有评论，来提出第一个问题吧。</p>
    <ul v-else class="comment-list">
      <li v-for="comment in comments" :key="comment.id">
        <div class="comment-meta"><strong>{{ comment.author }}</strong><time :datetime="comment.createdAt">{{ new Date(comment.createdAt).toLocaleString('zh-CN') }}</time></div>
        <p>{{ comment.body }}</p>
        <button v-if="user?.id === comment.userId" type="button" class="delete" @click="remove(comment.id)">删除</button>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { accountOrigin, apiRequest, authClient } from './client.js'

const props = defineProps({ section: { type: String, required: true } })
const comments = ref([])
const user = ref(null)
const draft = ref('')
const error = ref('')
const loading = ref(false)
const busy = ref(false)

watch(() => props.section, async (section) => {
  if (!section) return
  loading.value = true
  error.value = ''
  try {
    const [items, session] = await Promise.all([
      apiRequest(`/api/comments?section=${encodeURIComponent(section)}`),
      authClient.getSession()
    ])
    comments.value = items.comments
    user.value = session.data?.user || null
  } catch {
    error.value = '暂时无法加载评论'
  } finally {
    loading.value = false
  }
}, { immediate: true })

async function publish() {
  busy.value = true
  error.value = ''
  try {
    const result = await apiRequest('/api/comments', { method: 'POST', body: JSON.stringify({ section: props.section, body: draft.value }) })
    comments.value.unshift(result.comment)
    draft.value = ''
  } catch (cause) {
    error.value = cause.message
  } finally {
    busy.value = false
  }
}

async function remove(id) {
  try {
    await apiRequest(`/api/comments/${encodeURIComponent(id)}`, { method: 'DELETE' })
    comments.value = comments.value.filter((comment) => comment.id !== id)
  } catch (cause) {
    error.value = cause.message
  }
}
</script>

<style scoped>
.comments { margin: 36px 0; padding: 24px; border: 1px solid var(--border); border-radius: var(--radius-box); background: rgba(255,255,255,.82); }
.heading, .comment-meta { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.heading span { color: var(--text-muted); font-size: 12px; }
.heading h3 { margin: 5px 0 20px; font-size: 20px; }
form { display: grid; gap: 10px; }
label { font-size: 13px; font-weight: 700; }
textarea { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 10px; resize: vertical; font: inherit; }
form button { justify-self: end; padding: 10px 18px; border: 0; border-radius: 9px; background: var(--accent); color: white; cursor: pointer; }
form button:disabled { opacity: .5; cursor: wait; }
.signin, .empty { color: var(--text-muted); }
.signin a { color: var(--accent); }
.comment-list { padding: 0; list-style: none; }
.comment-list li { border-top: 1px solid var(--border); padding: 16px 0; }
.comment-meta time { color: var(--text-faint); font-size: 12px; }
.comment-list p { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.7; }
.delete { border: 0; padding: 0; background: transparent; color: var(--text-muted); cursor: pointer; }
.error { color: #a11919; }
</style>
