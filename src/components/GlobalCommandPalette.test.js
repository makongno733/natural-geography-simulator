// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import GlobalCommandPalette from './GlobalCommandPalette.vue'

const { apiRequest, push } = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  push: vi.fn()
}))

vi.mock('../account/client.js', () => ({ accountEnabled: true, apiRequest }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

describe('GlobalCommandPalette community search', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('finds an existing community question and opens its permanent link', async () => {
    vi.useFakeTimers()
    apiRequest.mockResolvedValue({ posts: [{ id: 42, kind: 'question', title: 'Hurricane', excerpt: '热带气旋', category: '自然地理学' }] })
    const wrapper = mount(GlobalCommandPalette)
    wrapper.vm.open()
    await wrapper.vm.$nextTick()
    await wrapper.find('input').setValue('Hurricane')
    expect(wrapper.text()).toContain('正在检索社区讨论')
    await vi.advanceTimersByTimeAsync(250)
    await flushPromises()
    expect(apiRequest).toHaveBeenCalledWith('/api/community/posts?q=Hurricane', { timeout: 9000 })
    expect(wrapper.text()).toContain('Hurricane')
    expect(wrapper.text()).toContain('自然地理学')
    await wrapper.find('.cmd-result-item').trigger('click')
    expect(push).toHaveBeenCalledWith('/community/post/42')
    wrapper.unmount()
  })

  it('ignores a response from a search that was replaced', async () => {
    vi.useFakeTimers()
    let resolveFirst
    apiRequest.mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve }))
      .mockResolvedValueOnce({ posts: [{ id: 2, kind: 'question', title: 'Monsoon', category: '自然地理学' }] })
    const wrapper = mount(GlobalCommandPalette)
    wrapper.vm.open()
    await wrapper.vm.$nextTick()
    await wrapper.find('input').setValue('Hurricane')
    await vi.advanceTimersByTimeAsync(250)
    await wrapper.find('input').setValue('Monsoon')
    await vi.advanceTimersByTimeAsync(250)
    await flushPromises()
    resolveFirst({ posts: [{ id: 1, kind: 'question', title: 'Hurricane' }] })
    await flushPromises()
    expect(wrapper.text()).toContain('Monsoon')
    expect(wrapper.text()).not.toContain('Hurricane')
    wrapper.unmount()
  })
})
