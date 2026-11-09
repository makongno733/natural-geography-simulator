import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }))
vi.mock('../account/client.js', () => ({ apiRequest }))
import CommunityAdmin from './CommunityAdmin.vue'

let wrapper
let reports

beforeEach(() => {
  reports = [{ id: 5, reply_id: 11, post_id: null, discussionId: 1, contentAvailable: true, reason: '请核对来源' }]
  apiRequest.mockImplementation(async (path, options = {}) => {
    if (options.method === 'POST') { reports = []; return { status: 'resolved' } }
    if (path.endsWith('/reports')) return { reports }
    if (path.endsWith('/event-feedback')) return { feedback: [] }
    if (path.endsWith('/categories')) return { categories: [] }
    if (path.endsWith('/groups')) return { groups: [] }
    throw new Error(`Unexpected request: ${path}`)
  })
})
afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
})

const mountAdmin = () => mount(CommunityAdmin, {
  global: { stubs: { RouterLink: { name: 'RouterLink', props: ['to'], template: '<a><slot /></a>' } } }
})

describe('moderation reply correction workflow', () => {
  it('links the selected reply in its parent discussion and reuses the existing hide action', async () => {
    wrapper = mountAdmin()
    await flushPromises()
    const link = wrapper.findAllComponents({ name: 'RouterLink' }).find(item => item.text() === '查看被举报回复')
    expect(link.props('to')).toEqual({ path: '/community/post/1', hash: '#reply-11' })
    await wrapper.findAll('button').find(item => item.text() === '隐藏内容').trigger('click')
    await flushPromises()
    expect(apiRequest).toHaveBeenCalledWith('/api/community/moderation/reports/5', {
      method: 'POST', body: JSON.stringify({ action: 'hide' })
    })
    expect(wrapper.text()).toContain('暂无待处理举报')
  })

  it('does not link to public bodies or histories once a reply or its parent is hidden', async () => {
    reports[0].contentAvailable = false
    wrapper = mountAdmin()
    await flushPromises()
    expect(wrapper.text()).toContain('不再提供公开正文与历史记录')
    expect(wrapper.text()).not.toContain('查看被举报回复')
  })

  it('shows permission rejection instead of exposing the review queue', async () => {
    apiRequest.mockRejectedValue(new Error('没有管理权限'))
    wrapper = mountAdmin()
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toBe('没有管理权限')
    expect(wrapper.text()).not.toContain('请核对来源')
  })
})
