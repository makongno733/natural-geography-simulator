import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'

const { apiRequest, authClient, toast, router, state } = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  authClient: { getSession: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  router: { push: vi.fn() },
  state: { route: null }
}))
vi.mock('../account/client.js', () => ({
  accountOrigin: 'https://account.example', apiRequest, authClient
}))
vi.mock('../utils/toast.js', () => ({ toast }))
vi.mock('vue-router', () => ({
  useRoute: () => state.route,
  useRouter: () => router
}))
import CommunityPost from './CommunityPost.vue'

const timestamp = '2026-11-01T00:00:00.000Z'
let wrapper
let stream
let post
let replies
let adminPermission

const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}
const failure = (message, status) => Object.assign(new Error(message), { status })
const button = (root, label) => root.findAll('button').find(item => item.text() === label)

function mountPost() {
  wrapper = mount(CommunityPost, {
    attachTo: document.body,
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } }
  })
  return wrapper
}

beforeEach(() => {
  vi.stubEnv('DEV', false)
  state.route = reactive({ params: { id: '1' } })
  post = {
    id: 1, authorId: 'post-author', author: '讨论作者', title: '讨论原标题', body: '讨论原观点',
    category: '自然地理', kind: 'question', tags: ['来源'], createdAt: timestamp, updatedAt: timestamp,
    linkedExperiment: 'fault-model', evidenceId: 'rainfall-observation'
  }
  replies = [
    { id: 11, authorId: 'reply-author', author: '回复作者', body: '回复原观点', createdAt: timestamp, updatedAt: timestamp, isAccepted: true },
    { id: 12, authorId: 'post-author', author: '讨论作者', body: '讨论作者的回复', createdAt: timestamp, updatedAt: timestamp },
    { id: 13, authorId: 'other', author: '其他用户', body: '其他用户的回复', createdAt: timestamp, updatedAt: timestamp }
  ]
  adminPermission = false
  authClient.getSession.mockResolvedValue({ data: { user: { id: 'post-author' } } })
  vi.stubGlobal('EventSource', class {
    constructor() { stream = this; this.listeners = {}; this.close = vi.fn() }
    addEventListener(name, handler) { this.listeners[name] = handler }
  })
  apiRequest.mockImplementation(async (path, options = {}) => {
    if (path === '/api/community/me') return { isAdmin: adminPermission }
    if (path.endsWith('/revisions')) return { revisions: [] }
    if (path === '/api/community/reports') return { id: 100 }
    if (options.method === 'PATCH') {
      const content = JSON.parse(options.body)
      if (path.includes('/posts/')) post = { ...post, title: content.title, body: content.body, updatedAt: '2026-11-02T00:00:00.000Z' }
      else replies = replies.map(reply => path.endsWith(`/${reply.id}`) ? { ...reply, body: content.body, isAccepted: false } : reply)
      return { status: 'updated', revisionRecorded: true }
    }
    if (options.method === 'DELETE') {
      replies = replies.filter(reply => !path.endsWith(`/${reply.id}`))
      return { status: 'deleted' }
    }
    return { post: { ...post }, replies: replies.map(reply => ({ ...reply })) }
  })
})

afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('community opinion correction controls', () => {
  it.each(['ev-poyang-winter', 'ev-urban-sponge', 'ev-thermal-circulation', 'unknown-old-card'])('preserves an old post and labels attachment provenance for %s', async evidenceId => {
    post.evidenceId = evidenceId
    post.body = '原帖用户观点应保留，不得静默删除。'
    mountPost()
    await flushPromises()
    expect(wrapper.text()).toContain('原帖用户观点应保留')
    const attachment = wrapper.find('[aria-label="探究资料附件及来源说明"]')
    expect(attachment.exists()).toBe(true)
    expect(attachment.text()).toContain('待核实')
    expect(attachment.text()).not.toMatch(/1140|68\.2|0\.28|2\.4|严格线性关联/)
    if (evidenceId === 'unknown-old-card') expect(attachment.text()).toContain(evidenceId)
    else expect(attachment.text()).toContain('不是原始观测来源')
  })

  it('labels demo authors, counts and old attachments without presenting fictional expertise', async () => {
    vi.stubEnv('DEV', true)
    state.route.params.id = '102'
    authClient.getSession.mockResolvedValue({ data: null })
    apiRequest.mockRejectedValue(Object.assign(new Error('测试网络断开'), { isNetworkError: true }))
    mountPost()
    await flushPromises()
    expect(wrapper.text()).toContain('演示人物（非认证身份）')
    expect(wrapper.text()).toContain('非真实热度')
    expect(wrapper.text()).toContain('不是实际观测、真实教师经历')
    expect(wrapper.text()).toContain('仿真示例 · 结果待核实')
    expect(wrapper.text()).not.toMatch(/南京信息工程大学气象学副教授|物理海洋博士生|\(28\)/)
  })

  it.each([
    [null, false, false, []],
    ['post-author', false, true, [12]],
    ['reply-author', false, false, [11]],
    ['other', false, false, [13]],
    ['admin', true, true, [11, 12, 13]]
  ])('shows only permitted author/administrator editing controls for %s', async (userId, isAdmin, canEditPost, editableReplies) => {
    adminPermission = isAdmin
    authClient.getSession.mockResolvedValue({ data: userId ? { user: { id: userId } } : null })
    mountPost()
    await flushPromises()
    expect(Boolean(button(wrapper.find('.detail-author-row'), '修改讨论'))).toBe(canEditPost)
    for (const reply of replies) {
      expect(Boolean(button(wrapper.find(`#reply-${reply.id}`), '修改回复'))).toBe(editableReplies.includes(reply.id))
      expect(Boolean(button(wrapper.find(`#reply-${reply.id}`), '撤回回复'))).toBe(editableReplies.includes(reply.id))
    }
    expect(wrapper.text()).toContain('未经平台事实审核')
    expect(wrapper.text()).toContain('回复属于各用户的个人观点')
  })

  it('does not infer administrator rights from an unverified session role and exposes permission failures', async () => {
    authClient.getSession.mockResolvedValue({ data: { user: { id: 'other', role: 'admin' } } })
    const implementation = apiRequest.getMockImplementation()
    apiRequest.mockImplementation((path, options) => path === '/api/community/me'
      ? Promise.reject(failure('权限服务暂不可用', 503))
      : implementation(path, options))
    mountPost()
    await flushPromises()
    expect(wrapper.text()).toContain('权限服务暂不可用')
    expect(button(wrapper.find('.detail-author-row'), '修改讨论')).toBeUndefined()
    adminPermission = true
    apiRequest.mockImplementation(implementation)
    await button(wrapper, '重试权限检查').trigger('click')
    await flushPromises()
    expect(button(wrapper.find('.detail-author-row'), '修改讨论')).toBeDefined()
  })

  it('edits a post without dropping tags, category, evidence or experiment bindings', async () => {
    mountPost()
    await flushPromises()
    await button(wrapper, '修改讨论').trigger('click')
    await wrapper.find('#post-edit-title').setValue('修订讨论标题')
    await wrapper.find('#post-edit-body').setValue('修订讨论观点')
    await wrapper.find('#post-edit-form').trigger('submit')
    await flushPromises()
    expect(apiRequest).toHaveBeenCalledWith('/api/community/posts/1', {
      method: 'PATCH',
      body: JSON.stringify({ title: '修订讨论标题', body: '修订讨论观点', expectedUpdatedAt: timestamp })
    })
    expect(wrapper.find('#post-edit-form').exists()).toBe(false)
    expect(wrapper.text()).toContain('修订讨论标题')
    expect(wrapper.text()).toContain('#来源')
    expect(wrapper.text()).toContain('3D 动力学实验联动')
  })

  it('edits a reply with its own target and warns about acceptance requiring renewed confirmation', async () => {
    authClient.getSession.mockResolvedValue({ data: { user: { id: 'reply-author' } } })
    mountPost()
    await flushPromises()
    await button(wrapper.find('#reply-11'), '修改回复').trigger('click')
    expect(wrapper.find('#reply-edit-form-11').text()).toContain('提问者需重新确认采纳')
    await wrapper.find('#reply-edit-body-11').setValue('修订回复观点')
    await wrapper.find('#reply-edit-form-11').trigger('submit')
    await flushPromises()
    expect(apiRequest).toHaveBeenCalledWith('/api/community/replies/11', {
      method: 'PATCH', body: JSON.stringify({ body: '修订回复观点', expectedUpdatedAt: timestamp })
    })
    expect(wrapper.find('#reply-11').text()).toContain('修订回复观点')
    expect(wrapper.find('#reply-11 .accepted-banner').exists()).toBe(false)
  })

  it('preserves an unsaved draft on conflict and does not report a no-op as a new revision', async () => {
    mountPost()
    await flushPromises()
    await button(wrapper, '修改讨论').trigger('click')
    await wrapper.find('#post-edit-body').setValue('尚未保存的观点')
    apiRequest.mockRejectedValueOnce(failure('讨论已被修改，请重新载入后核对再保存', 409))
    await wrapper.find('#post-edit-form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('#post-edit-body').element.value).toBe('尚未保存的观点')
    expect(wrapper.text()).toContain('请重新载入后核对再保存')
    expect(toast.success).not.toHaveBeenCalled()
    apiRequest.mockResolvedValueOnce({ status: 'updated', revisionRecorded: false })
    await wrapper.find('#post-edit-form').trigger('submit')
    await flushPromises()
    expect(toast.success).toHaveBeenCalledWith('内容未变化，未新增修订记录。')
  })

  it('withdraws only the selected reply after confirmation and reloads the published list', async () => {
    authClient.getSession.mockResolvedValue({ data: { user: { id: 'reply-author' } } })
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    mountPost()
    await flushPromises()
    await button(wrapper.find('#reply-11'), '撤回回复').trigger('click')
    expect(apiRequest.mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(false)
    window.confirm.mockReturnValue(true)
    await button(wrapper.find('#reply-11'), '撤回回复').trigger('click')
    await flushPromises()
    expect(apiRequest).toHaveBeenCalledWith('/api/community/replies/11', { method: 'DELETE' })
    expect(wrapper.find('#reply-11').exists()).toBe(false)
    expect(wrapper.find('#reply-12').exists()).toBe(true)
  })

  it('asks anonymous readers to sign in before accepting a report and makes no mutation', async () => {
    authClient.getSession.mockResolvedValue({ data: null })
    mountPost()
    await flushPromises()
    await button(wrapper.find('#reply-11'), '纠错 / 举报此回复').trigger('click')
    expect(toast.info).toHaveBeenCalledWith('请先登录后提交纠错 / 举报。')
    expect(wrapper.find('#content-report-form').exists()).toBe(false)
    expect(apiRequest.mock.calls.some(([path]) => path === '/api/community/reports')).toBe(false)
  })

  it.each([['post', 1, 'postId'], ['reply', 11, 'replyId']])('submits a bounded %s correction to the existing moderation API', async (type, id, field) => {
    mountPost()
    await flushPromises()
    const root = type === 'post' ? wrapper.find('.detail-author-row') : wrapper.find('#reply-11')
    await button(root, type === 'post' ? '纠错 / 举报' : '纠错 / 举报此回复').trigger('click')
    expect(wrapper.find('#content-report-form').text()).toContain(`#${id}`)
    expect(wrapper.find('#content-report-reason').attributes('maxlength')).toBe('500')
    expect(document.activeElement.id).toBe('content-report-reason')
    await wrapper.find('#content-report-reason').setValue('请对照公开来源核对这项观点')
    await wrapper.find('#content-report-form form').trigger('submit')
    await flushPromises()
    expect(apiRequest).toHaveBeenCalledWith('/api/community/reports', {
      method: 'POST', body: JSON.stringify({ [field]: id, reason: '请对照公开来源核对这项观点' })
    })
    expect(wrapper.text()).toContain('等待管理员核对')
    expect(wrapper.find('#content-report-form').exists()).toBe(false)
  })

  it.each([409, 429])('keeps failed reports editable and exposes the server response (%s)', async status => {
    mountPost()
    await flushPromises()
    await button(wrapper.find('#reply-11'), '纠错 / 举报此回复').trigger('click')
    await wrapper.find('#content-report-reason').setValue('待核对的来源')
    apiRequest.mockRejectedValueOnce(failure('反馈暂未受理', status))
    await wrapper.find('#content-report-form form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('#content-report-reason').element.value).toBe('待核对的来源')
    expect(wrapper.find('#content-report-form [role="alert"]').text()).toBe('反馈暂未受理')
    expect(wrapper.text()).not.toContain('等待管理员核对')
  })

  it('labels both post and reply histories as previous, unverified user opinions', async () => {
    const implementation = apiRequest.getMockImplementation()
    apiRequest.mockImplementation((path, options) => path.endsWith('/revisions')
      ? Promise.resolve({ revisions: [{ revisionNo: 1, title: '修改前标题', body: '修改前观点', editor: '编辑者', editedAt: timestamp }] })
      : implementation(path, options))
    mountPost()
    await flushPromises()
    await button(wrapper, '查看修订记录').trigger('click')
    await button(wrapper.find('#reply-11'), '查看回复修订记录').trigger('click')
    await flushPromises()
    expect(wrapper.find('#post-revision-history').text()).toContain('不是已核验结论')
    expect(wrapper.find('#reply-revisions-11').text()).toContain('未经平台事实核验')
    expect(wrapper.find('#reply-revisions-11').text()).toContain('编辑者')
    expect(apiRequest).toHaveBeenCalledWith('/api/community/replies/11/revisions')
  })

  it('clears loaded histories after moderation removes a reply and ignores its late history response', async () => {
    const history = deferred()
    const implementation = apiRequest.getMockImplementation()
    apiRequest.mockImplementation((path, options) => path === '/api/community/replies/11/revisions'
      ? history.promise
      : implementation(path, options))
    mountPost()
    await flushPromises()
    await button(wrapper.find('#reply-11'), '查看回复修订记录').trigger('click')
    replies = replies.filter(reply => reply.id !== 11)
    stream.listeners.community({ data: JSON.stringify({ postId: 1, type: 'content_hidden' }) })
    await flushPromises()
    history.resolve({ revisions: [{ revisionNo: 1, body: '不能泄露的已隐藏历史', editor: '编辑者', editedAt: timestamp }] })
    await flushPromises()
    expect(wrapper.find('#reply-11').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('不能泄露的已隐藏历史')
  })

  it('never resurrects a removed discussion as mock content, even in development mode', async () => {
    vi.stubEnv('DEV', true)
    post.id = 101
    state.route.params.id = '101'
    mountPost()
    await flushPromises()
    await button(wrapper, '查看修订记录').trigger('click')
    await flushPromises()
    apiRequest.mockRejectedValueOnce(failure('讨论不存在', 404))
    stream.listeners.community({ data: JSON.stringify({ postId: 101, type: 'content_hidden' }) })
    await flushPromises()
    expect(wrapper.find('.community-detail-post').exists()).toBe(false)
    expect(wrapper.find('#post-revision-history').exists()).toBe(false)
    expect(wrapper.text()).toContain('讨论不存在')
    expect(wrapper.text()).not.toContain('青藏高原')
  })

  it('discards post and reply history responses across route changes', async () => {
    const oldHistory = deferred()
    const implementation = apiRequest.getMockImplementation()
    apiRequest.mockImplementation((path, options) => path.endsWith('/revisions') ? oldHistory.promise : implementation(path, options))
    mountPost()
    await flushPromises()
    await button(wrapper, '查看修订记录').trigger('click')
    await button(wrapper.find('#reply-11'), '查看回复修订记录').trigger('click')
    post = { ...post, id: 2, title: '下一篇讨论', body: '下一篇观点' }
    state.route.params.id = '2'
    await flushPromises()
    oldHistory.resolve({ revisions: [{ revisionNo: 1, title: '旧标题', body: '旧讨论的历史', editedAt: timestamp }] })
    await flushPromises()
    expect(wrapper.text()).toContain('下一篇讨论')
    expect(wrapper.text()).not.toContain('旧讨论的历史')
    expect(wrapper.find('#post-revision-history').exists()).toBe(false)
    expect(wrapper.find('#reply-revisions-11').exists()).toBe(false)
  })

  it('ignores superseded detail responses and closes its live connection on unmount', async () => {
    const oldPost = deferred()
    const originalPost = { ...post }
    const implementation = apiRequest.getMockImplementation()
    apiRequest.mockImplementation((path, options) => path === '/api/community/posts/1' ? oldPost.promise : implementation(path, options))
    mountPost()
    await flushPromises()
    post = { ...post, id: 2, title: '当前讨论', body: '当前观点' }
    state.route.params.id = '2'
    await flushPromises()
    oldPost.resolve({ post: originalPost, replies: [] })
    await flushPromises()
    expect(wrapper.text()).toContain('当前讨论')
    expect(wrapper.text()).not.toContain('讨论原标题')
    wrapper.unmount()
    expect(stream.close).toHaveBeenCalledOnce()
  })
})
