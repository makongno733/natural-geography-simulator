import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const { apiRequest, route } = vi.hoisted(() => ({
  apiRequest: vi.fn(), route: { path: '/', name: 'home', query: {} }
}))
vi.mock('../account/client.js', () => ({
  accountEnabled: true, accountOrigin: 'https://account.example',
  apiRequest, authClient: { getSession: async () => ({ data: null }) }
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
  route.query = {}
  vi.stubEnv('DEV', false)
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
  it('opens the question filter from a direct community link', async () => {
    route.query = { kind: 'question' }
    wrapper = mountCommunity()
    await flushPromises()
    expect(wrapper.find('.baroque-filter-btn.active').text()).toContain('学术问答')
    expect(apiRequest.mock.calls.some(([path]) => path.includes('kind=question'))).toBe(true)
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
