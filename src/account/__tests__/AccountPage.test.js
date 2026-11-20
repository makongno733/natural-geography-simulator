import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockSignUpEmail = vi.fn()
const mockSignInEmail = vi.fn()
const mockGetSession = vi.fn()
const mockSendVerificationEmail = vi.fn()
const mockApiRequest = vi.fn()

vi.mock('../client.js', () => ({
  accountEnabled: true,
  accountOrigin: 'https://account.kongnoma279.com',
  siteOrigin: 'https://geo.kongnoma279.com',
  apiRequest: (...args) => mockApiRequest(...args),
  authClient: {
    getSession: (...args) => mockGetSession(...args),
    signUp: { email: (...args) => mockSignUpEmail(...args) },
    signIn: { email: (...args) => mockSignInEmail(...args) },
    sendVerificationEmail: (...args) => mockSendVerificationEmail(...args),
    signOut: vi.fn()
  }
}))

import AccountPage from '../AccountPage.vue'

describe('AccountPage Better Auth Registration & Sign-In Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiRequest.mockResolvedValue({
      email: true,
      smtpReady: true,
      requireEmailVerification: false,
      authProvider: 'Better Auth',
      authProviderUrl: 'https://better-auth.com/'
    })
    mockGetSession.mockResolvedValue({ data: null })
  })

  it('renders Better Auth attribution link and sign-in/sign-up tabs immediately without blocking on config', async () => {
    const wrapper = mount(AccountPage)
    expect(wrapper.find('[data-testid="tab-signin"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-signup"]').exists()).toBe(true)
    expect(wrapper.html()).toContain('https://better-auth.com/')
    expect(wrapper.text()).not.toContain('登录服务正在配置中')
  })

  it('registers a new account and auto-signs in via Better Auth', async () => {
    mockSignUpEmail.mockResolvedValueOnce({
      data: {
        token: 'session-token-123',
        user: { id: 'u1', name: '李同学', email: 'student@example.com' }
      },
      error: null
    })
    mockGetSession
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({
        data: { user: { id: 'u1', name: '李同学', email: 'student@example.com' } }
      })

    const wrapper = mount(AccountPage)
    await flushPromises()

    await wrapper.find('[data-testid="tab-signup"]').trigger('click')
    expect(wrapper.text()).toContain('创建学习账号')

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('李同学')
    await inputs[1].setValue('student@example.com')
    await inputs[2].setValue('Password123!')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockSignUpEmail).toHaveBeenCalledWith({
      name: '李同学',
      email: 'student@example.com',
      password: 'Password123!',
      callbackURL: 'https://geo.kongnoma279.com/#/'
    })
    expect(wrapper.text()).toContain('注册并登录成功！')
    expect(wrapper.text()).toContain('李同学')
  })

  it('translates EMAIL_NOT_VERIFIED error and offers one-click verification email resend', async () => {
    mockSignInEmail.mockResolvedValueOnce({
      data: null,
      error: { code: 'EMAIL_NOT_VERIFIED', message: 'Email not verified' }
    })

    const wrapper = mount(AccountPage)
    await flushPromises()

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('unverified@example.com')
    await inputs[1].setValue('Password123!')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('该账号尚未完成邮箱验证')
    expect(wrapper.find('.resend-verify-btn').exists()).toBe(true)
  })
})
