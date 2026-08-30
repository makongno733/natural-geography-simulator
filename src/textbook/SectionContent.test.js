import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SectionContent from './SectionContent.vue'
import componentSource from './SectionContent.vue?raw'

const mocks = vi.hoisted(() => ({
  loadedContent: null,
  loadSectionContent: vi.fn(),
  getChapter: vi.fn(),
  getSection: vi.fn(),
  getSectionExperimentLink: vi.fn(),
  routeProxy: null,
  route: {
    params: {
      grade: '高中',
      book: '必修第一册',
      chapter: '第一章',
      section: '第一节',
    },
  },
}))

vi.mock('vue-router', async () => {
  const { reactive } = await import('vue')
  mocks.routeProxy = reactive(mocks.route)
  return { useRoute: () => mocks.routeProxy }
})

vi.mock('./data/catalogLoader.js', () => ({
  getChapter: mocks.getChapter,
  getSection: mocks.getSection,
}))

vi.mock('./data/contentLoader.js', () => ({
  loadSectionContent: mocks.loadSectionContent,
}))

vi.mock('./data/experimentLinks.js', () => ({
  getSectionExperimentLink: mocks.getSectionExperimentLink,
}))

const StudentLearningViewStub = {
  name: 'StudentLearningView',
  props: ['learning', 'sectionTitle', 'chapterTitle', 'localTools'],
  emits: ['open-tool'],
  template: '<div data-student-learning-view />',
}

const TextbookExperimentCardStub = {
  name: 'TextbookExperimentCard',
  props: ['link', 'textbook'],
  template: '<div data-textbook-experiment-card>{{ link.primary.title }}</div>',
}

const earthLink = Object.freeze({
  confidence: 'curated',
  primary: Object.freeze({
    experimentId: 'earth-system',
    presetId: 'cosmic-earth',
    title: '宇宙中的地球',
    purpose: '从宇宙环境理解地球。',
  }),
  related: Object.freeze([]),
})

const validStudentLearning = {
  overview: '从地球所处的宇宙环境开始学习。',
  objectives: ['说明地球的普通性和特殊性'],
  knowledgeBlocks: [{
    title: '地球的宇宙环境',
    items: [{ name: '生命条件', detail: '适宜温度、液态水和适宜大气。' }],
  }],
}

const deferred = () => {
  let resolve
  const promise = new Promise((resolvePromise) => { resolve = resolvePromise })
  return { promise, resolve }
}

async function mountSection() {
  const wrapper = mount(SectionContent, {
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
        StudentLearningView: StudentLearningViewStub,
        TextbookExperimentCard: TextbookExperimentCardStub,
      },
    },
  })
  await flushPromises()
  return wrapper
}

describe('SectionContent student learning integration', () => {
  beforeEach(() => {
    Object.assign(mocks.routeProxy.params, {
      grade: '高中',
      book: '必修第一册',
      chapter: '第一章',
      section: '第一节',
    })
    mocks.loadedContent = null
    mocks.loadSectionContent.mockImplementation(async () => mocks.loadedContent)
    mocks.getSectionExperimentLink.mockImplementation(({ section }) => (
      section === '第一节' ? earthLink : Object.freeze({
        ...earthLink,
        primary: Object.freeze({ ...earthLink.primary, title: 'B 节新实验' }),
      })
    ))
    mocks.getChapter.mockImplementation(async (_grade, _book, chapter) => ({
      id: chapter,
      title: '宇宙中的地球',
      sections: [
        { id: '第一节', title: '地球的宇宙环境' },
        { id: '第二节', title: 'B 节新正文' },
      ],
    }))
    mocks.getSection.mockImplementation(async (_grade, _book, _chapter, section) => ({
      id: section,
      title: section === '第一节' ? '地球的宇宙环境' : 'B 节新正文',
    }))
  })

  it('replaces the legacy lesson brief and moves the 3D tool into the curated route card', async () => {
    mocks.loadedContent = {
      studentLearning: validStudentLearning,
    }

    const wrapper = await mountSection()
    const learningView = wrapper.findComponent({ name: 'StudentLearningView' })

    expect(learningView.exists()).toBe(true)
    expect(wrapper.find('.lesson-brief').exists()).toBe(false)
    expect(wrapper.find('.read-time').exists()).toBe(false)
    expect(learningView.props('localTools')).toEqual([])
    expect(wrapper.get('[data-textbook-experiment-card]').text()).toBe('宇宙中的地球')
    expect(wrapper.text()).not.toContain('打开地球模型')
  })

  it('falls back to the legacy lesson brief without a student learning overlay', async () => {
    const wrapper = await mountSection()

    expect(wrapper.findComponent({ name: 'StudentLearningView' }).exists()).toBe(false)
    expect(wrapper.find('.lesson-brief').exists()).toBe(true)
    expect(wrapper.find('.brief-actions').exists()).toBe(false)
    expect(wrapper.get('.read-time').text()).toContain('约 1 分钟')
  })

  it('uses the legacy lesson brief when the student learning overlay is invalid', async () => {
    mocks.loadedContent = {
      studentLearning: {
        objectives: ['说明地球的普通性'],
        overview: '缺少可用核心知识。',
        knowledgeBlocks: [{ title: '无效知识块', items: [null] }],
      },
    }

    const wrapper = await mountSection()

    expect(wrapper.findComponent({ name: 'StudentLearningView' }).exists()).toBe(false)
    expect(wrapper.find('.lesson-brief').exists()).toBe(true)
  })

  it('clears loading and preserves base section content when optional content loading rejects', async () => {
    mocks.loadSectionContent.mockRejectedValueOnce(new Error('optional overlay unavailable'))

    const wrapper = await mountSection()

    expect(wrapper.text()).not.toContain('加载中...')
    expect(wrapper.text()).toContain('第一节 地球的宇宙环境')
    expect(wrapper.find('.lesson-brief').exists()).toBe(true)
  })

  it('keeps only the latest route request visible and loading during a late A response', async () => {
    const requestA = deferred()
    const requestB = deferred()
    mocks.loadSectionContent.mockImplementation((_grade, _book, _chapter, section) => (
      section === '第一节' ? requestA.promise : requestB.promise
    ))

    const wrapper = mount(SectionContent, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          StudentLearningView: StudentLearningViewStub,
          TextbookExperimentCard: TextbookExperimentCardStub,
        },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('加载中...')
    expect(wrapper.text()).not.toContain('地球的宇宙环境')

    mocks.routeProxy.params.section = '第二节'
    await nextTick()
    await flushPromises()

    expect(mocks.loadSectionContent).toHaveBeenCalledWith('高中', '必修第一册', '第一章', '第二节')
    expect(wrapper.text()).toContain('加载中...')
    expect(wrapper.text()).not.toContain('地球的宇宙环境')

    requestA.resolve({ conceptDefinitions: { A旧概念: { 高中: '旧内容' } } })
    await flushPromises()

    expect(wrapper.text()).toContain('加载中...')
    expect(wrapper.text()).not.toContain('地球的宇宙环境')
    expect(wrapper.text()).not.toContain('A旧概念')

    requestB.resolve({ conceptDefinitions: { B新概念: { 高中: '新内容' } } })
    await flushPromises()

    expect(wrapper.text()).not.toContain('加载中...')
    expect(wrapper.get('.section-title').text()).toBe('第二节 B 节新正文')
    expect(wrapper.text()).toContain('B新概念')
    expect(wrapper.text()).not.toContain('A旧概念')
    expect(wrapper.get('[data-textbook-experiment-card]').text()).toBe('B 节新实验')
  })

  it('does not render an experiment card when the current section has no curated link', async () => {
    mocks.getSectionExperimentLink.mockReturnValue(null)

    const wrapper = await mountSection()

    expect(wrapper.find('[data-textbook-experiment-card]').exists()).toBe(false)
  })

  it('removes the old experiment card immediately during a rapid section switch', async () => {
    const requestB = deferred()
    mocks.loadSectionContent.mockImplementation((_grade, _book, _chapter, section) => (
      section === '第一节' ? Promise.resolve(null) : requestB.promise
    ))
    const wrapper = await mountSection()

    expect(wrapper.get('[data-textbook-experiment-card]').text()).toBe('宇宙中的地球')

    mocks.routeProxy.params.section = '第二节'
    await nextTick()

    expect(wrapper.find('[data-textbook-experiment-card]').exists()).toBe(false)

    requestB.resolve(null)
    await flushPromises()

    expect(wrapper.get('[data-textbook-experiment-card]').text()).toBe('B 节新实验')
  })

  it('keeps the student article within the reading measure and reduces narrow-screen padding', () => {
    expect(componentSource).toMatch(/\.content\s+:deep\(\[data-student-learning-view\]\)\s*\{[^}]*max-width:\s*860px/s)
    expect(componentSource).toMatch(/@media\s*\(max-width:\s*720px\)[\s\S]*\.content\s*\{[^}]*padding:\s*16px\s+12px/s)
  })
})
