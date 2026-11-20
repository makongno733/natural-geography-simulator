import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import FanxingPage from '../FanxingPage.vue'
import {
  INITIAL_FANXING_PROJECTS,
  mapCrossrefWorkType,
  normalizeAndValidateDoi
} from '../catalog.js'

const mockGetSession = vi.fn()
const mockApiRequest = vi.fn()

vi.mock('../../account/client.js', () => ({
  accountEnabled: true,
  authClient: {
    getSession: (...args) => mockGetSession(...args)
  },
  apiRequest: (...args) => mockApiRequest(...args)
}))

async function mountAt(path) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>HOME</div>' } },
      { path: '/fanxing', name: 'fanxing', component: FanxingPage },
      { path: '/fanxing/:id', name: 'fanxing-project', component: FanxingPage },
      { path: '/community/admin', name: 'community-admin-legacy', redirect: '/community/manage' },
      { path: '/community/manage', name: 'community-admin', component: { template: '<div>MANAGE</div>' } },
      { path: '/community', name: 'community', component: { template: '<div>COMMUNITY</div>' } },
      { path: '/geo-labs/satellite', name: 'satellite', component: { template: '<div>SAT</div>' } },
      { path: '/inquiry', name: 'inquiry', component: { template: '<div>INQUIRY</div>' } }
    ]
  })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(FanxingPage, {
    global: {
      plugins: [router]
    }
  })
  await flushPromises()
  return { wrapper, router }
}

describe('FanxingPage security, draft failure handling, and metadata accuracy', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    mockGetSession.mockReset()
    mockApiRequest.mockReset()
  })

  it('purges legacy geo_fanxing_applications_v1 cache and never leaks previous account unlocked QQ group when logged out or switching accounts', async () => {
    localStorage.setItem(
      'geo_fanxing_applications_v1',
      JSON.stringify({
        'xuzhou-land-cover': {
          id: 99,
          projectId: 'xuzhou-land-cover',
          userId: 'user-A',
          status: 'approved',
          reviewNote: '欢迎进群',
          collabChannel: {
            qqGroup: '机密课题组QQ群：998877665',
            onboardingGuide: '内部指南'
          }
        }
      })
    )

    // 未登录访客访问该课题
    mockGetSession.mockResolvedValue({ data: { user: null } })
    mockApiRequest.mockImplementation(async (url) => {
      if (url === '/api/fanxing/projects') {
        return { projects: INITIAL_FANXING_PROJECTS }
      }
      if (url === '/api/fanxing/projects/xuzhou-land-cover') {
        return {
          project: { ...INITIAL_FANXING_PROJECTS[0], myApplication: null },
          collaborators: [],
          linkedPosts: []
        }
      }
      return {}
    })

    const { wrapper } = await mountAt('/fanxing/xuzhou-land-cover')

    expect(localStorage.getItem('geo_fanxing_applications_v1')).toBeNull()
    expect(wrapper.text()).not.toContain('998877665')
    expect(wrapper.text()).not.toContain('你的科研参与申请已通过审核')
  })

  it('does not enter fake pending status when POST /api/fanxing/projects/:id/apply fails, keeping form open as local unsent draft', async () => {
    mockGetSession.mockResolvedValue({
      data: { user: { id: 'user-B', name: '王同学', email: 'wang@geo.edu.cn' } }
    })
    mockApiRequest.mockImplementation(async (url, options) => {
      if (url === '/api/fanxing/projects') {
        return { projects: INITIAL_FANXING_PROJECTS }
      }
      if (url === '/api/fanxing/projects/xuzhou-land-cover' && (!options || !options.method)) {
        return {
          project: { ...INITIAL_FANXING_PROJECTS[0], myApplication: null },
          collaborators: [],
          linkedPosts: []
        }
      }
      if (url === '/api/fanxing/applications/mine') {
        return { applications: [] }
      }
      if (url === '/api/community/me') {
        return { isAdmin: false }
      }
      if (url === '/api/fanxing/projects/xuzhou-land-cover/apply' && options?.method === 'POST') {
        throw new Error('服务器暂时不可达 (502)')
      }
      return {}
    })

    const { wrapper } = await mountAt('/fanxing/xuzhou-land-cover')

    // 点击“填写并提交科研参与申请”打开表单
    const openBtn = wrapper.find('.initial-apply-cta button')
    expect(openBtn.exists()).toBe(true)
    await openBtn.trigger('click')

    const textareas = wrapper.findAll('form.apply-form textarea')
    await textareas[0].setValue('我熟悉遥感影像卷帘对比，希望参与徐州采煤塌陷区水体样点核查。')
    await textareas[1].setValue('学习过高中地理与本站卫星卷帘实验室')

    const selects = wrapper.findAll('form.apply-form select')
    await selects[1].setValue('1–2 小时')

    const form = wrapper.find('form.apply-form')
    await form.trigger('submit.prevent')
    await flushPromises()

    // 失败后不得显示“服务器已确认接收你的申请！当前状态为「待审核」”，必须保留表单并提示“本地草稿 · 尚未发送至服务器”
    expect(wrapper.text()).toContain('本地草稿 · 尚未发送至服务器')
    expect(wrapper.text()).toContain('服务器暂时不可达 (502)')
    expect(wrapper.text()).not.toContain('服务器已确认接收你的申请')
    expect(wrapper.find('form.apply-form').exists()).toBe(true)
  })

  it('maps Crossref work types accurately, validates DOI format, and removes fabricated micro-task completedCount', () => {
    expect(mapCrossrefWorkType('journal-article')).toBe('期刊论文')
    expect(mapCrossrefWorkType('book-chapter')).toBe('图书章节')
    expect(mapCrossrefWorkType('erratum')).toBe('勘误 / 更正')

    expect(normalizeAndValidateDoi('https://doi.org/10.5194/essd-13-3907-2021')).toBe('10.5194/essd-13-3907-2021')
    expect(normalizeAndValidateDoi('invalid-doi-string')).toBeNull()

    for (const project of INITIAL_FANXING_PROJECTS) {
      for (const task of project.tasks) {
        expect(task.completedCount).toBeUndefined()
      }
    }
  })

  it('redirects legacy /community/admin route to /community/manage', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/community/admin', name: 'community-admin-legacy', redirect: '/community/manage' },
        { path: '/community/manage', name: 'community-admin', component: { template: '<div>MANAGE</div>' } }
      ]
    })
    await router.push('/community/admin')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/community/manage')
  })
})
