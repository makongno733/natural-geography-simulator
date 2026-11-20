<template>
  <div class="account-shell">
    <div class="account-card">
      <div class="account-top-row">
        <p class="eyebrow">地理共同体 · 账号中心</p>
        <a :href="returnHref" class="back-origin-link">← {{ hasCustomReturn ? '返回刚才的页面' : '返回首页' }}</a>
      </div>
      <h1>{{ session?.user ? '我的学习账号' : mode === 'signup' ? '创建学习账号' : mode === 'forgot' ? '重设密码' : mode === 'reset' ? '设置新密码' : '欢迎回来' }}</h1>
      <p class="intro">登录后即可在社区提问与回复、在课程章节发表评论，并向教师提交探究报告。</p>

      <!-- 醒目的「登录 / 注册新账号」双标签切换（避免新访客找不到注册入口或误在登录框直接输入新账号） -->
      <div v-if="!session?.user && (mode === 'signin' || mode === 'signup')" class="auth-mode-tabs" role="tablist" aria-label="切换登录或注册新账号">
        <button
          type="button"
          role="tab"
          data-testid="tab-signin"
          :aria-selected="mode === 'signin'"
          :class="['mode-tab-btn', { active: mode === 'signin' }]"
          @click="switchMode('signin')"
        >
          登录已有账号
        </button>
        <button
          type="button"
          role="tab"
          data-testid="tab-signup"
          :aria-selected="mode === 'signup'"
          :class="['mode-tab-btn', { active: mode === 'signup' }]"
          @click="switchMode('signup')"
        >
          注册新账号
        </button>
      </div>

      <p v-if="message" class="notice" role="status">{{ message }}</p>
      <div v-if="error" class="error" role="alert">
        <p style="margin: 0">{{ error }}</p>
        <button
          v-if="needsVerificationResend && email"
          type="button"
          class="resend-verify-btn"
          :disabled="busy"
          @click="resendVerificationEmail"
        >
          📨 重新发送验证邮件
        </button>
      </div>

      <template v-if="session?.user">
        <div class="profile">
          <strong>{{ session.user.name }}</strong>
          <span>{{ session.user.email }}</span>
        </div>
        <div class="actions">
          <a :href="returnHref" class="primary">{{ hasCustomReturn ? '返回刚才浏览的页面 →' : '返回地理共同体首页 →' }}</a>
          <button type="button" class="secondary" @click="signOut">退出登录</button>
        </div>
      </template>
      <template v-else>
        <template v-if="accountEnabled && config.email !== false">
          <form v-if="mode === 'reset'" @submit.prevent="resetPassword">
            <label>新密码<input v-model="password" type="password" required minlength="8" autocomplete="new-password" placeholder="请输入至少 8 位新密码" /></label>
            <button class="primary" type="submit" :disabled="busy">保存新密码</button>
          </form>
          <form v-else-if="mode === 'forgot'" @submit.prevent="forgotPassword">
            <label>注册邮箱<input v-model.trim="email" type="email" required autocomplete="email" placeholder="name@example.com" /></label>
            <button class="primary" type="submit" :disabled="busy">发送重设邮件</button>
          </form>
          <form v-else @submit.prevent="submitEmail">
            <label v-if="mode === 'signup'">
              昵称
              <input v-model.trim="name" required autocomplete="name" maxlength="60" placeholder="例如：小王同学 / 李老师" />
            </label>
            <label>
              邮箱
              <input v-model.trim="email" type="email" required autocomplete="email" placeholder="name@example.com" />
            </label>
            <label>
              密码（至少 8 位）
              <input
                v-model="password"
                type="password"
                required
                minlength="8"
                :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
                :placeholder="mode === 'signup' ? '请设置至少 8 位登录密码' : '请输入登录密码'"
              />
            </label>
            <button class="primary" type="submit" :disabled="busy">
              {{ busy ? '请稍候…' : mode === 'signup' ? (config.requireEmailVerification ? '注册并发送验证邮件' : '立即注册并登录') : '登录' }}
            </button>
          </form>
          <button v-if="mode === 'signin' || mode === 'signup'" type="button" class="switch" @click="switchMode(mode === 'signup' ? 'signin' : 'signup')">
            {{ mode === 'signup' ? '已有账号？去登录' : '没有账号？创建新账号' }}
          </button>
          <button v-if="mode === 'signin' && config.smtpReady !== false" type="button" class="switch" @click="switchMode('forgot')">忘记密码？</button>
          <button v-if="mode === 'forgot' || mode === 'reset'" type="button" class="switch" @click="switchMode('signin')">返回登录</button>
        </template>
        <p v-else class="notice">登录服务正在配置中，请稍后再试。你仍可先返回继续浏览课程、操作 3D 实验和保存本地探究草稿。</p>
      </template>

      <div class="account-footer-meta">
        <p class="better-auth-badge">
          身份认证由 <a href="https://better-auth.com/" target="_blank" rel="noopener noreferrer">Better Auth (better-auth.com) ↗</a> 驱动
        </p>
        <p class="account-legal-links">
          <a :href="`${siteOrigin}/privacy`">隐私政策</a>
          <span aria-hidden="true">·</span>
          <a :href="`${siteOrigin}/terms`">服务条款</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { accountEnabled, accountOrigin, apiRequest, authClient, siteOrigin } from './client.js'

function resolveInitialMode() {
  try {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('token')) return 'reset'
    const hashQuery = window.location.hash.includes('?') ? window.location.hash.slice(window.location.hash.indexOf('?')) : ''
    const hashParams = new URLSearchParams(hashQuery)
    const requestedMode = searchParams.get('mode') || hashParams.get('mode')
    if (requestedMode === 'signup' || requestedMode === 'forgot' || requestedMode === 'reset') {
      return requestedMode
    }
  } catch {}
  return 'signin'
}

const mode = ref(resolveInitialMode())
const config = ref({ email: true, smtpReady: true, requireEmailVerification: false })
const session = ref(null)
const name = ref('')
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const message = ref('')
const needsVerificationResend = ref(false)

function switchMode(nextMode) {
  mode.value = nextMode
  error.value = ''
  message.value = ''
  needsVerificationResend.value = false
}

function formatAuthError(rawError, currentMode) {
  const code = rawError?.code || ''
  const msg = String(rawError?.message || rawError || '').trim()

  if (code === 'EMAIL_NOT_VERIFIED' || /email not verified/i.test(msg)) {
    needsVerificationResend.value = true
    return '该账号尚未完成邮箱验证。请前往注册邮箱点击验证链接，或点击下方「重新发送验证邮件」（如未收到请检查垃圾箱）。'
  }
  if (code === 'USER_ALREADY_EXISTS' || code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' || /already exists/i.test(msg)) {
    return '该邮箱已经注册过账号，请切换到「登录已有账号」直接登录。'
  }
  if (code === 'INVALID_EMAIL_OR_PASSWORD' || /invalid email or password/i.test(msg)) {
    return currentMode === 'signin'
      ? '邮箱或密码不正确。如果你还没有注册过账号，请先点击上方「注册新账号」。'
      : '邮箱或密码格式不正确，请核对后重试。'
  }
  if (code === 'PASSWORD_TOO_SHORT' || /password.*short/i.test(msg)) {
    return '密码长度不能少于 8 位。'
  }
  if (code === 'INVALID_EMAIL' || /invalid email/i.test(msg)) {
    return '请输入有效的邮箱地址。'
  }
  return msg || '操作失败，请稍后重试'
}

function resolveRedirectPath() {
  try {
    const hashQuery = window.location.hash.includes('?') ? window.location.hash.slice(window.location.hash.indexOf('?')) : ''
    const fromHash = new URLSearchParams(hashQuery).get('redirect')
    const fromSearch = new URLSearchParams(window.location.search).get('redirect')
    const fromStorage = localStorage.getItem('geo_auth_return_to')
    const candidate = (fromHash || fromSearch || fromStorage || '/').trim()
    if (candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.startsWith('/account')) {
      return candidate
    }
  } catch {}
  return '/'
}

const redirectPath = ref(resolveRedirectPath())
const hasCustomReturn = computed(() => redirectPath.value && redirectPath.value !== '/')
const returnHref = computed(() => `${siteOrigin}/#${redirectPath.value}`)

onMounted(async () => {
  redirectPath.value = resolveRedirectPath()
  if (!accountEnabled) { message.value = '账号服务尚未上线'; return }
  try {
    const remoteConfig = await apiRequest('/api/config')
    if (remoteConfig && typeof remoteConfig === 'object') {
      config.value = {
        email: remoteConfig.email !== false,
        smtpReady: Boolean(remoteConfig.smtpReady ?? remoteConfig.email),
        requireEmailVerification: Boolean(remoteConfig.requireEmailVerification)
      }
    }
    const result = await authClient.getSession()
    session.value = result.data
  } catch {
    // 保持登录/注册表单可用，由 Better Auth 接口在提交时直接处理
  }
})

async function submitEmail() {
  error.value = ''
  message.value = ''
  needsVerificationResend.value = false
  busy.value = true
  try {
    const result = mode.value === 'signup'
      ? await authClient.signUp.email({ name: name.value, email: email.value, password: password.value, callbackURL: returnHref.value })
      : await authClient.signIn.email({ email: email.value, password: password.value })
    if (result.error) {
      throw result.error
    }

    const latestSession = (await authClient.getSession()).data
    if (latestSession?.user || result.data?.token) {
      session.value = latestSession || { user: result.data.user }
      try { localStorage.removeItem('geo_auth_return_to') } catch {}
      password.value = ''
      message.value = mode.value === 'signup' ? '注册并登录成功！' : '登录成功！'
      if (hasCustomReturn.value && typeof window !== 'undefined' && (!siteOrigin || window.location.origin === new URL(siteOrigin, window.location.origin).origin)) {
        window.location.hash = `#${redirectPath.value}`
      }
    } else if (mode.value === 'signup') {
      needsVerificationResend.value = true
      message.value = '账号已创建！当前服务器开启了邮箱验证，请打开注册邮箱中的验证链接完成激活（如未收到可点击重新发送或检查垃圾邮件）。'
      password.value = ''
    }
  } catch (cause) {
    error.value = formatAuthError(cause, mode.value)
  } finally {
    busy.value = false
  }
}

async function resendVerificationEmail() {
  if (!email.value) return
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    if (typeof authClient.sendVerificationEmail === 'function') {
      const result = await authClient.sendVerificationEmail({
        email: email.value,
        callbackURL: returnHref.value
      })
      if (result?.error) throw result.error
    }
    message.value = `已向 ${email.value} 重新请求发送验证邮件，请查收收件箱与垃圾箱。`
  } catch (cause) {
    error.value = formatAuthError(cause, mode.value)
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
    const resetBase = (typeof window !== 'undefined' && window.location?.origin) || siteOrigin || accountOrigin
    const result = await authClient.requestPasswordReset({
      email: email.value,
      redirectTo: `${resetBase}/?mode=reset#/account`
    })
    if (result.error) throw result.error
    message.value = '如果此邮箱已注册，请查看密码重设邮件。'
  } catch (cause) {
    error.value = formatAuthError(cause, 'forgot')
  } finally {
    busy.value = false
  }
}

async function resetPassword() {
  const hashQuery = window.location.hash.includes('?') ? window.location.hash.slice(window.location.hash.indexOf('?')) : ''
  const token = new URLSearchParams(window.location.search).get('token') || new URLSearchParams(hashQuery).get('token')
  if (!token) { error.value = '重设链接无效'; return }
  busy.value = true
  try {
    const result = await authClient.resetPassword({ newPassword: password.value, token })
    if (result.error) throw result.error
    history.replaceState(null, '', `${window.location.pathname || '/'}#/account`)
    password.value = ''
    mode.value = 'signin'
    message.value = '密码已更新，请重新登录。'
  } catch (cause) {
    error.value = formatAuthError(cause, 'reset')
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.account-shell { min-height: calc(100vh - 60px); display: grid; place-items: center; padding: 28px 20px 80px; }
.account-card { width: min(100%, 440px); padding: 36px; border: 1px solid var(--border); border-radius: var(--radius-box); background: var(--surface); box-shadow: var(--shadow-md); }
.account-top-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 4px; }
.eyebrow { margin: 0; color: var(--geo-ocean); letter-spacing: .16em; font-size: 11px; font-weight: 800; font-family: ui-monospace, SFMono-Regular, monospace; }
.back-origin-link { color: var(--geo-ocean); font-size: 12.5px; font-weight: 600; text-decoration: none; }
.back-origin-link:hover { text-decoration: underline; }
h1 { margin: 8px 0; font-size: 28px; font-weight: 800; color: var(--geo-ocean-deep); letter-spacing: -0.02em; }
.intro { color: var(--text-muted); line-height: 1.7; font-size: 14.5px; }
.auth-mode-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 18px; padding: 4px; border-radius: var(--radius-pill); background: var(--bg-soft, #f1f5f9); border: 1px solid var(--border); }
.mode-tab-btn { min-height: 36px; border-radius: var(--radius-pill); border: 0; background: transparent; color: var(--text-muted); font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
.mode-tab-btn.active { background: var(--geo-ocean, #176e83); color: #ffffff; box-shadow: 0 2px 8px rgba(23, 110, 131, 0.25); }
form, .actions { display: grid; gap: 14px; margin-top: 20px; }
button, .primary { min-height: 42px; border-radius: var(--radius-pill); border: 1px solid var(--border); background: var(--surface); color: var(--text); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; text-decoration: none; display: grid; place-items: center; transition: var(--geo-btn-transition); }
button:hover { border-color: var(--geo-ocean); background: var(--geo-ocean-surface); }
.primary { background: var(--geo-ocean); border-color: var(--geo-ocean); color: #fff; font-weight: 700; box-shadow: var(--geo-btn-primary-shadow); }
.primary:hover { background: var(--geo-ocean-deep); box-shadow: var(--geo-btn-primary-hover-shadow); transform: var(--geo-btn-elevate); }
button:disabled { opacity: .6; cursor: wait; }
label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--geo-ocean-deep); }
input { width: 100%; min-height: 42px; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0 14px; font: inherit; box-sizing: border-box; }
input:focus { outline: none; border-color: var(--geo-ocean); box-shadow: var(--geo-focus-ring); }
.switch { border: 0; color: var(--geo-ocean); margin: 14px auto 0; font-weight: 600; }
.resend-verify-btn { margin-top: 10px; min-height: 34px; padding: 4px 12px; font-size: 12.5px; font-weight: 700; border-color: var(--geo-ocean); color: var(--geo-ocean); background: #ffffff; }
.account-footer-meta { margin-top: 24px; padding-top: 14px; border-top: 1px dashed var(--border); text-align: center; }
.better-auth-badge { margin: 0 0 8px; font-size: 12px; color: var(--text-muted); }
.better-auth-badge a { color: var(--geo-ocean); font-weight: 700; text-decoration: none; }
.better-auth-badge a:hover { text-decoration: underline; }
.account-legal-links { display: flex; justify-content: center; gap: 14px; margin: 0; font-size: 12px; color: var(--text-muted); }
.account-legal-links a { color: inherit; }
.notice, .error { margin-top: 14px; padding: 12px 14px; border-radius: var(--radius-sm); background: var(--geo-ocean-surface); line-height: 1.5; font-size: 13px; border: 1px solid var(--border); }
.error { color: var(--geo-terracotta); background: #fdf5f3; border-color: rgba(200,100,70,0.25); }
.profile { display: grid; gap: 6px; padding: 18px; border: 1px solid var(--border); border-radius: var(--radius-card); background: var(--bg-soft); overflow-wrap: anywhere; font-size: 13.5px; }
.profile span { color: var(--text-muted); }
</style>
