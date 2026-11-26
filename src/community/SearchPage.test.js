import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }))
const route = reactive({ query: { q: 'DEM' } })
vi.mock('../account/client.js', () => ({ accountEnabled: true, apiRequest }))
vi.mock('vue-router', () => ({ useRoute: () => route, useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
import SearchPage from './SearchPage.vue'
let wrapper
const event = { id: 5, title: 'M4.2 地震 · Alaska', tag: '地震', summary: '北京时间 UTC+8',
  sourceUrl: 'https://earthquake.usgs.gov/earthquakes/eventpage/abc' }
function render() { return mount(SearchPage, { global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } } }) }
beforeEach(() => {
  route.query = { q: 'DEM' }
  localStorage.setItem('local_community_posts', JSON.stringify([{ id: 888, title: 'DEM local draft', tags: [] }]))
  apiRequest.mockImplementation(async path => path.includes('hot-topics') ? { topics: [event] } : { posts: [] })
})
afterEach(() => { wrapper?.unmount(); localStorage.clear(); vi.clearAllMocks() })
it('does not merge demo discussions or private local posts when the real service returns no matches', async () => {
  wrapper = render(); await flushPromises()
  expect(wrapper.find('a[href="/community/post/101"]').exists()).toBe(false)
  expect(wrapper.find('a[href="/community/post/888"]').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('伪河网处理')
  expect(wrapper.text()).toContain('社区讨论0')
})
it('keeps real events searchable when the community endpoint fails and opens the original record', async () => {
  route.query = { q: '阿拉斯加', type: 'event' }
  apiRequest.mockImplementation(async path => {
    if (path.includes('hot-topics')) return { topics: [event] }
    throw new Error('offline')
  })
  wrapper = render(); await flushPromises()
  expect(wrapper.text()).toContain('近期地理事件1')
  expect(wrapper.find(`a[href="${event.sourceUrl}"]`).attributes('rel')).toContain('noopener')
  expect(wrapper.text()).not.toContain('未找到与')
})
it('ignores stale results when the query is cleared during pending requests', async () => {
  let resolveEvents, resolvePosts
  apiRequest.mockImplementation(path => new Promise(resolve => {
    if (path.includes('hot-topics')) resolveEvents = resolve
    else resolvePosts = resolve
  }))
  route.query = { q: '阿拉斯加' }
  wrapper = render(); await flushPromises()
  route.query = {}; await flushPromises()
  resolveEvents({ topics: [event] }); resolvePosts({ posts: [{ id: 42, title: 'Old result', tags: [] }] })
  await flushPromises()
  expect(wrapper.text()).not.toContain('Old result')
  expect(wrapper.text()).not.toContain('M4.2')
})
it('preserves real discussion matches if only the event service fails', async () => {
  route.query = { q: 'Actual post' }
  apiRequest.mockImplementation(async path => {
    if (path.includes('hot-topics')) throw Error('offline')
    return { posts: [{ id: 42, title: 'Actual post', tags: [] }] }
  })
  wrapper = render(); await flushPromises()
  expect(wrapper.find('a[href="/community/post/42"]').exists()).toBe(true)
  expect(wrapper.text()).toContain('近期事件暂时无法读取')
  expect(wrapper.text()).not.toContain('云端社区检索暂未响应')
})
