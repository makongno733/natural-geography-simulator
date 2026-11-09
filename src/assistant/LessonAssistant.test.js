import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'

const state = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  getGrades: vi.fn(),
  route: null,
  accountEnabled: true
}))
vi.mock('../account/api.js', () => ({ apiRequest: state.apiRequest }))
vi.mock('../account/config.js', () => ({ get accountEnabled() { return state.accountEnabled } }))
vi.mock('../textbook/data/catalogLoader.js', () => ({ getGrades: state.getGrades }))
vi.mock('vue-router', () => ({ useRoute: () => state.route }))
import LessonAssistant from './LessonAssistant.vue'

const grades = [{ id: '高中', books: [{ id: '必修第一册', chapters: [{ id: '第三章', title: '地球上的水', sections: [{ id: '第一节', title: '水循环' }] }] }] }]
const candidate = { title: '高中 · 必修第一册 · 地球上的水 · 水循环', route: '#/高中/必修第一册/第三章/第一节' }
const generated = { answer: '这是待核对的 AI 生成片段。', answerKind: 'ai-generated', reviewStatus: 'not-human-reviewed', sourceKind: 'keyword-candidates', sources: [candidate] }
const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { resolve, promise }
}
let wrapper
let writeText
const button = text => wrapper.findAll('button').find(item => item.text() === text)
async function openAssistant(question = '水循环') {
  wrapper = mount(LessonAssistant, {
    global: { stubs: { RouterLink: { name: 'RouterLink', props: ['to'], template: '<a><slot /></a>' } } }
  })
  await wrapper.find('.assistant-fab').trigger('click')
  await wrapper.find('input').setValue(question)
}
async function ask() {
  await button('问 AI').trigger('click')
  await flushPromises()
}

beforeEach(() => {
  state.accountEnabled = true
  state.route = reactive({ name: 'section', params: { grade: '高中', book: '必修第一册', chapter: '第三章', section: '第一节' }, fullPath: '/高中/必修第一册/第三章/第一节' })
  state.getGrades.mockResolvedValue(grades)
  state.apiRequest.mockResolvedValue(generated)
  writeText = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { clipboard: { writeText } })
})
afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('课程助手的教师可辨识呈现', () => {
  it('就地标明AI生成、未人工核验及候选章节不是逐条引用', async () => {
    await openAssistant()
    await ask()
    const answer = wrapper.find('.assistant-answer')
    expect(answer.text()).toContain('AI 生成回答 · 未经人工核验')
    expect(answer.text()).toContain('关键词匹配的候选章节')
    expect(answer.text()).toContain('不保证每章支撑上述结论')
    expect(answer.text()).not.toContain('课程问答')
    expect(answer.find('.assistant-sources a').attributes('href')).toBe(candidate.route)
    expect(wrapper.find('.assistant-search').exists()).toBe(false)
    expect(state.apiRequest).toHaveBeenCalledTimes(1)
    const [path, options] = state.apiRequest.mock.calls[0]
    expect(path).toBe('/api/assistant/ask')
    expect(options.timeout).toBe(30_000)
    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(JSON.parse(options.body)).toEqual({ question: '水循环', contextInfo: { routeName: 'section', params: state.route.params } })
  })

  it('旧API响应缺少新元数据时仍保守地标为未核验AI生成，不默认可信', async () => {
    state.apiRequest.mockResolvedValue({ answer: '旧接口生成片段', sources: [candidate] })
    await openAssistant()
    await ask()
    expect(wrapper.find('.assistant-answer').text()).toContain('AI 生成回答 · 未经人工核验')
    expect(wrapper.find('.assistant-answer').text()).toContain('不是逐条验证的引用')
  })

  it('没有候选章节时明确显示来源缺口，不显示虚构引用', async () => {
    state.apiRequest.mockResolvedValue({ ...generated, sources: [] })
    await openAssistant()
    await ask()
    expect(wrapper.find('.assistant-answer').text()).toContain('未提供候选章节')
    expect(wrapper.find('.assistant-answer').text()).toContain('无法据此核对地理结论')
    expect(wrapper.find('.assistant-sources').exists()).toBe(false)
  })

  it('服务拒答单独标为提示，不作为AI成功结论或提供虚假来源', async () => {
    state.apiRequest.mockResolvedValue({ answer: '暂不生成地理结论。', answerKind: 'service-message', sources: [] })
    await openAssistant()
    await ask()
    expect(wrapper.find('.assistant-answer').text()).toContain('服务提示 · 非地理结论')
    expect(wrapper.find('.assistant-answer').text()).not.toContain('AI 生成回答')
    expect(wrapper.find('#assistant-feedback').exists()).toBe(false)
  })

  it.each(['AI 服务未配置', 'AI 返回格式无效', '网络请求超时'])('失败时保留明确错误并把本地匹配分开（%s）', async message => {
    state.apiRequest.mockRejectedValue(new Error(message))
    await openAssistant()
    await ask()
    const answer = wrapper.find('.assistant-answer')
    expect(answer.text()).toContain('AI 暂不可用 · 未生成回答')
    expect(answer.text()).toContain(message)
    expect(answer.text()).not.toContain('高度相关')
    expect(answer.text()).not.toContain('已为您检索到')
    expect(answer.find('.assistant-sources').exists()).toBe(false)
    expect(wrapper.find('.assistant-search').text()).toContain('本地章节搜索 · 非 AI 回答')
    expect(wrapper.find('.assistant-search').text()).toContain('水循环')
    expect(wrapper.find('.assistant-search').text()).toContain('待复核章节需以章节页标识为准')
    expect(wrapper.find('#assistant-feedback').exists()).toBe(false)
  })

  it('失败且没有本地结果时不生成回答', async () => {
    state.apiRequest.mockRejectedValue(new Error('AI 不可用'))
    await openAssistant('没有对应标题的主题')
    await ask()
    expect(wrapper.find('.assistant-answer').text()).toContain('未生成回答')
    expect(wrapper.find('.assistant-search').text()).toContain('没有找到匹配章节')
  })

  it('同时显示AI和本地目录读取错误，不让二次失败掩盖首次失败', async () => {
    state.apiRequest.mockRejectedValue(new Error('AI 不可用'))
    state.getGrades.mockRejectedValue(new Error('目录读取失败'))
    await openAssistant()
    await ask()
    expect(wrapper.find('.assistant-answer').text()).toContain('AI 不可用')
    expect(wrapper.find('.assistant-search [role="alert"]').text()).toBe('目录读取失败')
    expect(button('问 AI').attributes('disabled')).toBeUndefined()
  })

  it('主动查找章节仅使用本地目录，不调用AI或自动发送反馈', async () => {
    await openAssistant()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('.assistant-search').text()).toContain('本地章节搜索 · 非 AI 回答')
    expect(state.apiRequest).not.toHaveBeenCalled()
  })

  it.each([{ answer: '', sources: [] }, { answer: '坏来源', sources: [{ title: '外部', route: 'https://example.invalid' }] }])('无效接口响应不显示成功答案', async response => {
    state.apiRequest.mockResolvedValue(response)
    await openAssistant()
    await ask()
    expect(wrapper.find('.assistant-answer').text()).toContain('AI 返回格式无效')
    expect(wrapper.find('.assistant-answer').text()).toContain('未生成回答')
  })

  it('只在自愿填写后复制选定片段，明确未提交并复用社区入口', async () => {
    await openAssistant()
    await ask()
    await button('反馈 / 请求核对').trigger('click')
    const feedback = wrapper.find('#assistant-feedback')
    expect(feedback.text()).toContain('本回答尚未提交反馈')
    expect(feedback.find('textarea').element.value).toBe('')
    expect(feedback.text()).toContain('不会自动发送提问、回答或草稿')
    await button('复制核对片段').trigger('click')
    expect(feedback.find('[role="alert"]').text()).toContain('请自行填写')
    expect(writeText).not.toHaveBeenCalled()
    await feedback.find('textarea').setValue('请核对这一片段；可对照公开来源')
    await button('复制核对片段').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('请核对这一片段；可对照公开来源')
    expect(feedback.find('[role="status"]').text()).toContain('尚未提交')
    const link = feedback.findComponent({ name: 'RouterLink' })
    expect(link.props('to')).toEqual({ path: '/community', hash: '#compose' })
    expect(state.apiRequest).toHaveBeenCalledTimes(1)
    await feedback.find('textarea').setValue('已改的片段')
    expect(feedback.find('[role="status"]').exists()).toBe(false)
  })

  it('剪贴板失败时保留草稿并显示未提交状态', async () => {
    writeText.mockRejectedValue(new Error('拒绝剪贴板'))
    await openAssistant()
    await ask()
    await button('反馈 / 请求核对').trigger('click')
    await wrapper.find('textarea').setValue('愿意分享的片段')
    await button('复制核对片段').trigger('click')
    await flushPromises()
    expect(wrapper.find('#assistant-feedback [role="alert"]').text()).toContain('尚未提交反馈')
    expect(wrapper.find('textarea').element.value).toBe('愿意分享的片段')
  })

  it('提问变更后取消旧请求并忽略迟到回答与候选章节', async () => {
    const pending = deferred()
    state.apiRequest.mockReturnValue(pending.promise)
    await openAssistant()
    await button('问 AI').trigger('click')
    const signal = state.apiRequest.mock.calls[0][1].signal
    await wrapper.find('input').setValue('新问题')
    expect(signal.aborted).toBe(true)
    pending.resolve(generated)
    await flushPromises()
    expect(wrapper.find('.assistant-answer').exists()).toBe(false)
  })

  it('切换章节清除回答和反馈草稿，迟到的本地搜索不复现旧上下文', async () => {
    await openAssistant()
    await ask()
    await button('反馈 / 请求核对').trigger('click')
    await wrapper.find('textarea').setValue('旧页的反馈草稿')
    const pending = deferred()
    state.getGrades.mockReturnValue(pending.promise)
    await wrapper.find('form').trigger('submit')
    state.route.fullPath = '/新章节'
    await flushPromises()
    pending.resolve(grades)
    await flushPromises()
    expect(wrapper.find('.assistant-answer').exists()).toBe(false)
    expect(wrapper.find('.assistant-search').exists()).toBe(false)
    expect(wrapper.find('textarea').exists()).toBe(false)
  })

  it('账号功能未启用时不标榜可用AI，仅显示本地章节搜索', async () => {
    state.accountEnabled = false
    await openAssistant()
    expect(wrapper.find('.assistant-fab').attributes('aria-label')).toBe('打开章节搜索助手')
    expect(button('问 AI')).toBeUndefined()
    expect(wrapper.find('.assistant-fab-label').text()).toBe('章节搜索')
  })

  it('卸载后中止AI请求，迟到失败不再读取本地目录', async () => {
    const pending = deferred()
    state.apiRequest.mockReturnValue(pending.promise)
    await openAssistant()
    await button('问 AI').trigger('click')
    const signal = state.apiRequest.mock.calls[0][1].signal
    wrapper.unmount()
    wrapper = null
    expect(signal.aborted).toBe(true)
    pending.resolve(generated)
    await flushPromises()
    expect(state.getGrades).not.toHaveBeenCalled()
  })
})
