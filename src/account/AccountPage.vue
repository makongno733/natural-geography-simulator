<template>
  <div class="account-shell">
    <div class="account-card">
      <p class="eyebrow">KONGNOMA · 地理学习</p>
      <h1>{{ session?.user ? '我的学习账号' : mode === 'signup' ? '创建学习账号' : mode === 'forgot' ? '重设密码' : mode === 'reset' ? '设置新密码' : '欢迎回来' }}</h1>
      <p class="intro">登录后可以在课程章节发表评论，参与学习讨论。</p>

      <p v-if="message" class="notice" role="status">{{ message }}</p>
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <template v-if="session?.user">
        <div class="profile">
          <strong>{{ session.user.name }}</strong>
          <span>{{ session.user.email }}</span>
        </div>
        <div class="actions">
          <a :href="`${siteOrigin}/#/`" class="primary">返回地理课程</a>
          <button type="button" class="secondary" @click="signOut">退出登录</button>
        </div>
      </template>
      <template v-else>
        <div v-if="mode === 'signin' && (config.google || config.github)" class="social-actions">
          <button v-if="config.google" type="button" :disabled="busy" @click="social('google')">使用 Google 登录</button>
          <button v-if="config.github" type="button" :disabled="busy" @click="social('github')">使用 GitHub 登录</button>
        </div>

        <template v-if="config.email">
          <div v-if="mode === 'signin' && (config.google || config.github)" class="divider">或使用邮箱</div>
          <form v-if="mode === 'reset'" @submit.prevent="resetPassword">
            <label>新密码<input v-model="password" type="password" required minlength="8" autocomplete="new-password" /></label>
            <button class="primary" type="submit" :disabled="busy">保存新密码</button>
          </form>
          <form v-else-if="mode === 'forgot'" @submit.prevent="forgotPassword">
            <label>注册邮箱<input v-model.trim="email" type="email" required autocomplete="email" /></label>
            <button class="primary" type="submit" :disabled="busy">发送重设邮件</button>
          </form>
          <form v-else @submit.prevent="submitEmail">
            <label v-if="mode === 'signup'">昵称<input v-model.trim="name" required autocomplete="name" maxlength="60" /></label>
            <label>邮箱<input v-model.trim="email" type="email" required autocomplete="email" /></label>
            <label>密码<input v-model="password" type="password" required minlength="8" :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'" /></label>
            <button class="primary" type="submit" :disabled="busy">{{ busy ? '请稍候…' : mode === 'signup' ? '注册并验证邮箱' : '登录' }}</button>
          </form>
          <button v-if="mode === 'signin' || mode === 'signup'" type="button" class="switch" @click="mode = mode === 'signup' ? 'signin' : 'signup'; error = ''; message = ''">
            {{ mode === 'signup' ? '已有账号？去登录' : '没有账号？创建账号' }}
          </button>
          <button v-if="mode === 'signin'" type="button" class="switch" @click="mode = 'forgot'; error = ''; message = ''">忘记密码？</button>
          <button v-if="mode === 'forgot' || mode === 'reset'" type="button" class="switch" @click="mode = 'signin'; error = ''; message = ''">返回登录</button>
        </template>
        <p v-if="!config.email && !config.google && !config.github" class="notice">登录服务正在配置中，请稍后再试。</p>
      </template>
      <p class="account-legal-links">
        <a :href="`${siteOrigin}/privacy.html`">隐私政策</a>
        <span aria-hidden="true">·</span>
        <a :href="`${siteOrigin}/terms.html`">服务条款</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { accountEnabled, accountOrigin, apiRequest, authClient, siteOrigin } from './client.js'

const mode = ref(new URLSearchParams(window.location.search).has('token') ? 'reset' : 'signin')
const config = ref({ email: false, google: false, github: false })
const session = ref(null)
const name = ref('')
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const message = ref('')

onMounted(async () => {
  if (!accountEnabled) { message.value = '账号服务尚未上线'; return }
  try {
    config.value = await apiRequest('/api/config')
    const result = await authClient.getSession()
    session.value = result.data
  } catch {
    error.value = '暂时无法连接账号服务'
  }
})

async function social(provider) {
  error.value = ''
  busy.value = true
  try {
    const result = await authClient.signIn.social({ provider, callbackURL: `${siteOrigin}/#/` })
    if (result.error) error.value = result.error.message || '登录失败'
  } catch {
    error.value = '暂时无法连接登录服务'
  } finally {
    busy.value = false
  }
}

async function submitEmail() {
  error.value = ''
  message.value = ''
  busy.value = true
  try {
    const result = mode.value === 'signup'
      ? await authClient.signUp.email({ name: name.value, email: email.value, password: password.value, callbackURL: `${siteOrigin}/#/` })
      : await authClient.signIn.email({ email: email.value, password: password.value })
    if (result.error) throw new Error(result.error.message || '操作失败')
    if (mode.value === 'signup') {
      message.value = '注册邮件已发送，请先打开邮箱中的验证链接。'
      password.value = ''
    } else {
      session.value = (await authClient.getSession()).data
    }
  } catch (cause) {
    error.value = cause.message || '操作失败'
  } finally {
    busy.value = false
  }
}

async function signOut() {
  await authClient.signOut()
  session.value = null
  message.value = '已退出登录'
}

async function forgotPassword() {
  busy.value = true
  error.value = ''
  try {
    const result = await authClient.requestPasswordReset({
      email: email.value,
      redirectTo: `${accountOrigin}/?mode=reset#/account`
    })
    if (result.error) throw new Error(result.error.message || '发送失败')
    message.value = '如果此邮箱已注册，请查看密码重设邮件。'
  } catch (cause) {
    error.value = cause.message
  } finally {
    busy.value = false
  }
}

async function resetPassword() {
  const token = new URLSearchParams(window.location.search).get('token')
  if (!token) { error.value = '重设链接无效'; return }
  busy.value = true
  try {
    const result = await authClient.resetPassword({ newPassword: password.value, token })
    if (result.error) throw new Error(result.error.message || '重设失败')
    history.replaceState(null, '', `${accountOrigin}/#/account`)
    password.value = ''
    mode.value = 'signin'
    message.value = '密码已更新，请重新登录。'
  } catch (cause) {
    error.value = cause.message
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.account-shell { min-height: calc(100vh - 60px); display: grid; place-items: center; padding: 28px 20px 80px; }
.account-card { width: min(100%, 440px); padding: 32px; border: 1px solid var(--border); border-radius: 24px; background: #fff; box-shadow: var(--shadow-sm); }
.eyebrow { color: var(--accent); letter-spacing: .16em; font-size: 11px; font-weight: 800; }
h1 { margin: 8px 0; font-size: 30px; color: var(--text); }
.intro { color: var(--text-muted); line-height: 1.7; }
.social-actions, form, .actions { display: grid; gap: 12px; margin-top: 22px; }
button, .primary { min-height: 44px; border-radius: 10px; border: 1px solid var(--border); background: white; color: var(--text); font: inherit; cursor: pointer; text-align: center; text-decoration: none; display: grid; place-items: center; }
button:hover { border-color: var(--accent); }
.primary { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 700; }
button:disabled { opacity: .6; cursor: wait; }
label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; }
input { width: 100%; min-height: 44px; border: 1px solid var(--border); border-radius: 10px; padding: 0 12px; font: inherit; }
.divider { margin-top: 18px; text-align: center; color: var(--text-muted); font-size: 13px; }
.switch { border: 0; color: var(--accent); margin: 16px auto 0; }
.account-legal-links { display: flex; justify-content: center; gap: 10px; margin: 24px 0 0; font-size: 12px; color: var(--text-muted); }
.account-legal-links a { color: inherit; }
.notice, .error { padding: 10px 12px; border-radius: 8px; background: var(--accent-soft); line-height: 1.5; }
.error { color: #a11919; background: #fff0f0; }
.profile { display: grid; gap: 4px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; overflow-wrap: anywhere; }
.profile span { color: var(--text-muted); }
</style>
