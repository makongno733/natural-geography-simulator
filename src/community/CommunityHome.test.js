import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const { apiRequest, authClient, route } = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  authClient: { getSession: vi.fn(async () => ({ data: null })) },
  route: { path: '/community' }
}))
vi.mock('../account/client.js', () => ({
  accountEnabled: true, accountOrigin: 'https://account.example',
  apiRequest, authClient
}))
vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push: vi.fn() })
}))
import CommunityHome from './CommunityHome.vue'

let wrapper
let stream
function mountCommunity() {
  return mount(CommunityHome, { global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } } })
}
const post = id => ({ id, title: `讨论 ${id}`, createdAt: '2026-11-07', tags: [] })
const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { resolve, promise }
}

beforeEach(() => {
  vi.stubEnv('DEV', false)
  authClient.getSession.mockResolvedValue({ data: null })
  vi.stubGlobal('EventSource', class {
    constructor() { stream = this; this.listeners = {}; this.close = vi.fn() }
    addEventListener(name, handler) { this.listeners[name] = handler }
  })
  apiRequest.mockImplementation(async path => {
    if (path.includes('/categories')) return { categories: [{ id: 1, name: '自然地理' }] }
    if (path.includes('/hot-topics')) return { topics: [], sources: [] }
    return { posts: [post(1)] }
  })
})
afterEach(() => {
  wrapper?.unmount()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('community request lifecycle', () => {
  it('marks offline recommendations where they appear and hides fictional popularity and identities', async () => {
    vi.stubEnv('DEV', true)
    apiRequest.mockRejectedValue(new Error('测试离线'))
    wrapper = mountCommunity()
    await flushPromises()
    const recommendations = wrapper.find('.community-trending')
    expect(recommendations.text()).toContain('演示讨论样例（非真实热度）')
    expect(recommendations.text()).toContain('人物、身份、互动和教学经历均非真实记录')
    expect(recommendations.findAll('.community-trending-card')).toHaveLength(3)
    for (const card of recommendations.findAll('.community-trending-card')) {
      expect(card.text()).toContain('演示样例')
      expect(card.text()).toContain('非真实热度')
      expect(card.text()).not.toMatch(/\d+ 人赞同|\d+ 条回复/)
    }
    expect(wrapper.text()).not.toContain('大家正在讨论')
    expect(wrapper.text()).not.toMatch(/特级教师|副教授|博士后|物理海洋博士生|物理海洋博士|28 人赞同|赞同 28/)
    expect(wrapper.find('.community-post-foot').text()).toContain('演示人物（非认证身份）')
  })

  it('retains real API-backed discussion counts without labelling them as demo popularity', async () => {
    apiRequest.mockImplementation(async path => {
      if (path.includes('/categories')) return { categories: [{ id: 1, name: '自然地理' }] }
      if (path.includes('/hot-topics')) return { topics: [], sources: [] }
      return { posts: [{ ...post(1), replyCount: 2, likeCount: 3 }] }
    })
    wrapper = mountCommunity()
    await flushPromises()
    const recommendations = wrapper.find('.community-trending')
    expect(recommendations.text()).toContain('大家正在讨论')
    expect(recommendations.text()).toContain('2 条回复 · 3 人赞同')
    expect(recommendations.text()).not.toContain('演示样例')
  })

  it('labels old known and unknown evidence attachments in the list without altering posts', async () => {
    const records = [
      { ...post(1), evidenceId: 'ev-poyang-winter' },
      { ...post(2), evidenceId: 'ev-urban-sponge' },
      { ...post(3), evidenceId: 'legacy-unknown-evidence' }
    ]
    apiRequest.mockImplementation(async path => {
      if (path.includes('/categories')) return { categories: [{ id: 1, name: '自然地理' }] }
      if (path.includes('/hot-topics')) return { topics: [], sources: [] }
      return { posts: records }
    })
    wrapper = mountCommunity()
    await flushPromises()
    const cards = wrapper.findAll('.community-post-card')
    expect(cards).toHaveLength(3)
    expect(cards[0].text()).toContain('观测示例 · 来源待核实')
    expect(cards[1].text()).toContain('仿真示例 · 结果待核实')
    expect(cards[2].text()).toContain('附件资料待核实')
    expect(wrapper.text()).not.toContain('挂载实测证据')
  })

  it('shows the selected attachment limits before publishing it under the original ID', async () => {
    authClient.getSession.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const implementation = apiRequest.getMockImplementation()
    apiRequest.mockImplementation(async (path, options) => {
      if (path === '/api/community/me') return { isAdmin: false }
      if (options?.method === 'POST') return { id: 10 }
      return implementation(path, options)
    })
    wrapper = mountCommunity()
    await flushPromises()
    const form = wrapper.find('.community-compose-form')
    await form.findAll('select').at(-1).setValue('ev-urban-sponge')
    expect(form.text()).toContain('仿真示例 · 结果待核实')
    expect(form.text()).toContain('未关联模型版本、参数或运行记录')
    await form.find('input[maxlength="120"]').setValue('测试讨论标题')
    await form.find('textarea[maxlength="10000"]').setValue('保留的用户观点')
    await form.trigger('submit')
    await flushPromises()
    const creation = apiRequest.mock.calls.find(([path, options]) => path === '/api/community/posts' && options?.method === 'POST')
    expect(JSON.parse(creation[1].body)).toMatchObject({ evidenceId: 'ev-urban-sponge', body: '保留的用户观点' })
  })

  it('uses immediate scrolling when reduced motion is requested', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    wrapper = mountCommunity()
    await flushPromises()
    const compose = wrapper.find('#compose').element
    compose.scrollIntoView = vi.fn()
    await wrapper.find('.community-hero-actions a').trigger('click')
    expect(compose.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' })
  })

  it('does not wait for hot-topic refresh before rendering discussions', async () => {
    const topics = deferred()
    apiRequest.mockImplementation(async path => {
      if (path.includes('/hot-topics')) return topics.promise
      if (path.includes('/categories')) return { categories: [{ id: 1, name: '自然地理' }] }
      return { posts: [post(1)] }
    })
    wrapper = mountCommunity()
    await flushPromises()
    expect(wrapper.text()).toContain('讨论 1')
    topics.resolve({ topics: [], sources: [] })
    await flushPromises()
  })

  it('labels source-backed event summaries and lets signed-in users submit corrections', async () => {
    const topic = {
      id: 8, title: 'Source event', summary: 'Source description', tag: '野火',
      summaryMethod: 'source-description', occurredAt: '2026-11-07', fetchedAt: '2026-11-07',
      sourceUrl: 'https://eonet.gsfc.nasa.gov/api/v3/events/EONET_8'
    }
    authClient.getSession.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    apiRequest.mockImplementation(async path => {
      if (path === '/api/community/hot-topics') return { topics: [topic], sources: [] }
      if (path.endsWith('/revisions')) return { revisions: [] }
      if (path === '/api/community/categories') return { categories: [{ id: 1, name: '自然地理' }] }
      if (path === '/api/community/me') return { isAdmin: false }
      return { posts: [post(1)] }
    })
    wrapper = mountCommunity()
    await flushPromises()
    expect(wrapper.text()).toContain('来源原始描述，未经平台人工核验。')
    await wrapper.find('button[aria-controls="topic-revisions-8"]').trigger('click')
    await flushPromises()
    expect(apiRequest).toHaveBeenCalledWith('/api/community/hot-topics/8/revisions')
    expect(wrapper.text()).toContain('当前已观察记录中没有来源字段修订。')
    await wrapper.find('button[aria-controls="topic-feedback-8"]').trigger('click')
    await wrapper.find('#topic-feedback-text-8').setValue('位置需要重新核对')
    await wrapper.find('#topic-feedback-8').trigger('submit')
    await flushPromises()
    expect(apiRequest).toHaveBeenCalledWith('/api/community/hot-topics/8/feedback', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ reason: '位置需要重新核对' })
    }))
    expect(wrapper.text()).toContain('已提交，等待人工核对')
  })

  it('aborts superseded filters and ignores late responses', async () => {
    wrapper = mountCommunity()
    await flushPromises()
    const old = deferred()
    const next = deferred()
    const signals = []
    apiRequest.mockImplementation((path, options) => {
      signals.push(options.signal)
      return path.includes('kind=question') ? old.promise : next.promise
    })
    await wrapper.findAll('.baroque-filter-btn')[1].trigger('click')
    await wrapper.findAll('.baroque-filter-btn')[2].trigger('click')
    expect(signals[0].aborted).toBe(true)
    next.resolve({ posts: [post(3)] })
    await flushPromises()
    old.resolve({ posts: [post(2)] })
    await flushPromises()
    expect(wrapper.text()).toContain('讨论 3')
    expect(wrapper.text()).not.toContain('讨论 2')
  })

  it('coalesces a burst of real-time events into one refresh and closes the connection', async () => {
    wrapper = mountCommunity()
    await flushPromises()
    vi.useFakeTimers()
    apiRequest.mockClear()
    for (let i = 0; i < 20; i++) stream.listeners.community()
    expect(apiRequest).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(250)
    expect(apiRequest).toHaveBeenCalledTimes(1)
    wrapper.unmount()
    expect(stream.close).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps load-more available across full pages and does not advance after a failed request', async () => {
    apiRequest.mockImplementation(async path => {
      if (path.includes('/categories')) return { categories: [{ id: 1, name: '自然地理' }] }
      if (path.includes('/hot-topics')) return { topics: [], sources: [] }
      return { posts: Array.from({ length: 20 }, (_, i) => post(i + 1)) }
    })
    wrapper = mountCommunity()
    await flushPromises()
    apiRequest.mockRejectedValueOnce(new Error('暂时无法读取'))
    await wrapper.find('.community-more').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('.community-post-card')).toHaveLength(20)
    apiRequest.mockResolvedValueOnce({ posts: Array.from({ length: 20 }, (_, i) => post(i + 21)) })
    await wrapper.find('.community-more').trigger('click')
    await flushPromises()
    expect(apiRequest.mock.calls.at(-1)[0]).toContain('page=2')
    expect(wrapper.findAll('.community-post-card')).toHaveLength(40)
    expect(wrapper.find('.community-more').exists()).toBe(true)
  })

  it('does not mix a failed new filter with old posts and retries its first page', async () => {
    apiRequest.mockImplementation(async path => {
      if (path.includes('/categories')) return { categories: [{ id: 1, name: '自然地理' }] }
      if (path.includes('/hot-topics')) return { topics: [], sources: [] }
      return { posts: Array.from({ length: 20 }, (_, i) => post(i + 1)) }
    })
    wrapper = mountCommunity()
    await flushPromises()
    apiRequest.mockRejectedValueOnce(new Error('筛选读取失败'))
    await wrapper.findAll('.baroque-filter-btn')[1].trigger('click')
    await flushPromises()
    expect(wrapper.findAll('.community-post-card')).toHaveLength(0)
    expect(wrapper.find('.community-more').exists()).toBe(false)
    apiRequest.mockResolvedValueOnce({ posts: [post(77)] })
    await wrapper.find('.community-error button').trigger('click')
    await flushPromises()
    expect(apiRequest.mock.calls.at(-1)[0]).toContain('page=1')
    expect(apiRequest.mock.calls.at(-1)[0]).toContain('kind=question')
    expect(wrapper.findAll('.community-post-card')).toHaveLength(1)
    expect(wrapper.text()).toContain('讨论 77')
  })
})
