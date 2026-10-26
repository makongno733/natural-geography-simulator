<template>
  <div class="community-wrap community-detail">
    <router-link class="community-back" to="/community">← 返回社区</router-link>
    <p v-if="loading" class="community-state" role="status">正在加载讨论……</p>
    <p v-else-if="error" class="community-state community-error" role="alert">{{ error }}</p>
    <template v-else-if="post">
      <article class="community-detail-post">
        <div class="community-post-meta"><span>{{ post.category }}</span><span>{{ post.kind === 'question' ? '问题' : '讨论' }}</span></div>
        <h1>{{ post.title }}</h1>
        <p class="community-detail-author">{{ post.author }} · {{ formatDate(post.createdAt) }}</p>
        <div class="community-prose">{{ post.body }}</div>
        <button class="community-report" type="button" @click="reportPost">举报内容</button>
      </article>
      <section class="community-replies" aria-labelledby="replies-title">
        <h2 id="replies-title">{{ replies.length }} 条回复</h2>
        <p v-if="!replies.length" class="community-state">还没有回复，欢迎提出你的看法。</p>
        <article v-for="reply in replies" :key="reply.id" class="community-reply" :class="{ 'is-nested': reply.parentId }">
          <div class="community-post-foot"><strong>{{ reply.author }}</strong><span>{{ formatDate(reply.createdAt) }}</span></div>
          <p v-if="reply.parentId" class="community-reply-context">回复 #{{ reply.parentId }}</p>
          <div class="community-prose">{{ reply.body }}</div>
          <button type="button" @click="parentId = reply.id; replyInput?.focus()">回复这条</button>
        </article>
      </section>
      <section class="community-compose community-reply-form" aria-labelledby="reply-title">
        <h2 id="reply-title">加入讨论</h2>
        <p v-if="!user" class="community-state">登录后参与讨论。<a :href="`${accountOrigin}/#/account`">登录 / 注册 ↗</a></p>
        <form v-else @submit.prevent="sendReply">
          <p v-if="parentId">正在回复 #{{ parentId }} <button type="button" @click="parentId = null">取消引用</button></p>
          <label class="sr-only" for="reply-body">回复内容</label>
          <textarea id="reply-body" ref="replyInput" v-model.trim="body" required maxlength="3000" rows="5" placeholder="说说你的依据、观察或经验……" />
          <p v-if="replyError" class="community-error" role="alert">{{ replyError }}</p>
          <button type="submit" :disabled="submitting">{{ submitting ? '正在发送……' : '发布回复' }}</button>
        </form>
      </section>
    </template>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { accountOrigin, apiRequest, authClient } from '../account/client.js'

const route = useRoute()
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
let stream
const formatDate = value => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))

async function loadPost() {
  loading.value = true; error.value = ''
  try {
    const result = await apiRequest(`/api/community/posts/${route.params.id}`)
    post.value = result.post; replies.value = result.replies
  } catch (cause) { error.value = cause.message }
  finally { loading.value = false }
}
async function sendReply() {
  submitting.value = true; replyError.value = ''
  try {
    await apiRequest(`/api/community/posts/${route.params.id}/replies`, { method: 'POST', body: JSON.stringify({ body: body.value, parentId: parentId.value }) })
    body.value = ''; parentId.value = null; await loadPost()
  } catch (cause) { replyError.value = cause.message }
  finally { submitting.value = false }
}
async function reportPost() {
  if (!user.value) { window.location.href = `${accountOrigin}/#/account`; return }
  const reason = window.prompt('请简要说明举报原因（最多 500 字）')
  if (!reason?.trim()) return
  try { await apiRequest('/api/community/reports', { method: 'POST', body: JSON.stringify({ postId: post.value.id, reason }) }); window.alert('举报已提交，管理员会进行处理。') }
  catch (cause) { window.alert(cause.message) }
}
watch(() => route.params.id, loadPost)
onMounted(async () => {
  const session = await authClient.getSession().catch(() => null)
  user.value = session?.data?.user || null
  await loadPost()
  stream = new EventSource(`${accountOrigin}/api/community/stream`)
  stream.addEventListener('community', event => {
    if (JSON.parse(event.data).postId === Number(route.params.id)) void loadPost()
  })
})
onBeforeUnmount(() => stream?.close())
</script>
