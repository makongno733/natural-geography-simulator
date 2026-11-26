import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const route = reactive({ params: { id: '1' }, fullPath: '/community/post/1' })
const apiRequestMock = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('../../account/client.js', () => ({
  accountEnabled: true,
  accountOrigin: 'https://account.example.test',
  apiRequest: (...args) => apiRequestMock(...args),
  authClient: {
    getSession: vi.fn().mockResolvedValue({ data: { user: { id: 'u-1', name: 'Tester' } } }),
  },
}))

vi.mock('../../utils/toast.js', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

import CommunityAdmin from '../CommunityAdmin.vue'
import CommunityPost from '../CommunityPost.vue'
import UserProfile from '../UserProfile.vue'

describe('Community Admin & Route Race Regression Tests (Q01, Q02, Q04)', () => {
  beforeEach(() => {
    route.params.id = '1'
    apiRequestMock.mockReset()
  })

  it('Q01: review success leaves the moderation panels visible alongside notice banner', async () => {
    apiRequestMock.mockImplementation(async (path, options = {}) => {
      if (path.endsWith('/reports')) return { reports: [] }
      if (path.endsWith('/categories')) return { categories: [] }
      if (path.endsWith('/groups')) return { groups: [] }
      if (path.endsWith('/resources')) return { resources: [] }
      if (path.endsWith('/applications') && !options.method) {
        return {
          applications: [{
            id: 1,
            projectId: 'xuzhou-land-cover',
            projectTitle: '徐州课题',
            applicantName: '申请人',
            applicantEmail: 'applicant@example.test',
            preferredTask: '样点核查',
            weeklyTime: '1-2h',
            motivation: '核查数据',
            status: 'pending',
          }],
        }
      }
      if (path.includes('/applications/1') && options.method === 'POST') {
        return { status: 'approved', emailNotified: false }
      }
      return {}
    })

    const wrapper = mount(CommunityAdmin, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    await flushPromises()

    expect(wrapper.findAll('section').length).toBeGreaterThan(0)
    await wrapper.get('.btn-approve').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('申请 #1 已通过')
    expect(wrapper.findAll('section').length).toBeGreaterThan(0)
  })

  it('Q02: unavailable application or resource moderation service displays error state instead of empty state', async () => {
    apiRequestMock.mockImplementation(async path => {
      if (path.endsWith('/reports')) return { reports: [] }
      if (path.endsWith('/categories')) return { categories: [] }
      if (path.endsWith('/groups')) return { groups: [] }
      if (path.endsWith('/resources')) throw new Error('QA resource outage')
      if (path.endsWith('/applications')) throw new Error('QA application outage')
      return {}
    })

    const wrapper = mount(CommunityAdmin, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    await flushPromises()

    expect(wrapper.text()).not.toContain('暂无繁星课题申请记录')
    expect(wrapper.text()).not.toContain('暂无用户提交的开放资源申请')
    expect(wrapper.text()).toContain('QA application outage')
    expect(wrapper.text()).toContain('QA resource outage')
  })

  it('Q04a: late post response does not overwrite a newer route', async () => {
    let resolveOld
    apiRequestMock.mockImplementation(path => {
      if (path.endsWith('/1')) {
        return new Promise(resolve => { resolveOld = resolve })
      }
      if (path.endsWith('/2')) {
        return Promise.resolve({
          post: { id: 2, title: 'Latest route post', body: 'Latest body', kind: 'discussion', category: '地理', author: 'A', authorId: 'u-2', createdAt: '2026-01-02' },
          replies: [],
        })
      }
      return Promise.resolve({})
    })

    const wrapper = mount(CommunityPost, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    await flushPromises()

    route.params.id = '2'
    await flushPromises()
    expect(wrapper.text()).toContain('Latest route post')

    resolveOld({
      post: { id: 1, title: 'Stale old route post', body: 'Old body', kind: 'discussion', category: '地理', author: 'B', authorId: 'u-1', createdAt: '2026-01-01' },
      replies: [],
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Latest route post')
    expect(wrapper.text()).not.toContain('Stale old route post')
  })

  it('Q04b: late user profile response does not replace the current profile route', async () => {
    route.params.id = 'first-user'
    let resolveOld
    apiRequestMock.mockImplementation(path => {
      if (path.endsWith('/first-user')) {
        return new Promise(resolve => { resolveOld = resolve })
      }
      if (path.endsWith('/second-user')) {
        return Promise.resolve({
          user: { id: 'second-user', name: 'Current profile', createdAt: '2026-01-02' },
          stats: { postCount: 1, replyCount: 0, acceptedCount: 0, fanxingCount: 0 },
          recentPosts: [],
          fanxingParticipations: [],
        })
      }
      return Promise.resolve({ applications: [] })
    })

    const wrapper = mount(UserProfile, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    await flushPromises()

    route.params.id = 'second-user'
    await flushPromises()
    expect(wrapper.text()).toContain('Current profile')

    resolveOld({
      user: { id: 'first-user', name: 'Stale profile', createdAt: '2026-01-01' },
      stats: { postCount: 0, replyCount: 0, acceptedCount: 0, fanxingCount: 0 },
      recentPosts: [],
      fanxingParticipations: [],
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Current profile')
    expect(wrapper.text()).not.toContain('Stale profile')
  })
})
