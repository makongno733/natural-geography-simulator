import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StudentLearningView from '../StudentLearningView.vue'
import componentSource from '../StudentLearningView.vue?raw'
const completeLearning = {
  estimatedMinutes: 12,
  objectives: ['说明水循环类型'],
  keyFocus: ['海陆间循环'],
  difficulties: ['人类活动的影响'],
  overview: '水不断循环运动。',
  knowledgeBlocks: [{
    title: '循环类型',
    summary: '三类循环联系各圈层。',
    items: [{ name: '海陆间循环', detail: '联系海洋与陆地。' }],
  }],
  mechanismChains: [{ title: '水循环过程', steps: ['蒸发', '水汽输送', '降水'] }],
  caseStudies: [{
    title: '城市内涝',
    context: '硬化地面增多。',
    question: '地表径流如何变化？',
    conclusion: '下渗减少，地表径流增多。',
  }],
  misconceptions: [{
    wrong: '海上内循环对陆地淡水更新贡献最大。',
    reason: '它不与陆地交换水分。',
    correct: '海陆间循环使陆地淡水得以补充。',
  }],
  practice: [{
    type: 'single-choice',
    question: '使陆地水得到更新的循环是？',
    options: ['A. 海陆间循环', 'B. 海上内循环'],
    answer: 'A',
    explanation: '海陆间循环将海洋水输送到陆地。',
    knowledgePoint: '水循环类型',
  }],
  memoryTips: ['海陆最重要。'],
  answerTemplates: [{ title: '水循环意义', template: '按“环节—影响—意义”作答。' }],
}

const mountView = (learning = completeLearning, tools = [{ id: 'water', label: '打开水循环模型', primary: true }]) => mount(StudentLearningView, {
  props: {
    sectionTitle: '水循环',
    chapterTitle: '地球上的水',
    learning,
    tools,
  },
})

describe('StudentLearningView', () => {
  it('renders every student-learning field and text-labeled tool metadata', async () => {
    const wrapper = mountView()

    expect(wrapper.text()).toContain('地球上的水 / 水循环')
    expect(wrapper.text()).toContain('约 12 分钟')
    expect(wrapper.text()).toContain('说明水循环类型')
    expect(wrapper.text()).toContain('海陆间循环')
    expect(wrapper.text()).toContain('人类活动的影响')
    expect(wrapper.text()).toContain('水不断循环运动')
    expect(wrapper.text()).toContain('三类循环联系各圈层')
    expect(wrapper.text()).toContain('联系海洋与陆地')
    expect(wrapper.text()).toContain('水循环过程')
    expect(wrapper.text()).toContain('水汽输送')
    expect(wrapper.text()).toContain('城市内涝')
    expect(wrapper.text()).toContain('硬化地面增多')
    expect(wrapper.text()).toContain('地表径流如何变化')
    expect(wrapper.text()).toContain('下渗减少')
    expect(wrapper.text()).toContain('海上内循环对陆地淡水更新贡献最大')
    expect(wrapper.text()).toContain('它不与陆地交换水分')
    expect(wrapper.text()).toContain('海陆间循环使陆地淡水得以补充')
    expect(wrapper.text()).toContain('使陆地水得到更新的循环是')
    expect(wrapper.text()).toContain('B. 海上内循环')
    expect(wrapper.text()).toContain('正确答案：A')
    expect(wrapper.text()).toContain('海陆间循环将海洋水输送到陆地')
    expect(wrapper.text()).toContain('对应知识点：水循环类型')
    expect(wrapper.text()).toContain('海陆最重要')
    expect(wrapper.text()).toContain('水循环意义')
    expect(wrapper.text()).toContain('按“环节—影响—意义”作答')

    const tool = wrapper.get('[data-tool="water"]')
    expect(tool.text()).toBe('打开水循环模型')
    await tool.trigger('click')
    expect(wrapper.emitted('open-tool')).toEqual([['water']])
  })

  it('opens core knowledge by default and collapses every other detailed module', () => {
    const wrapper = mountView()
    const expandedById = Object.fromEntries(
      wrapper.findAll('[data-learning-section]').map((section) => [
        section.attributes('data-learning-section'),
        section.get('button').attributes('aria-expanded'),
      ]),
    )

    expect(expandedById).toEqual({
      'core-knowledge': 'true',
      mechanisms: 'false',
      cases: 'false',
      misconceptions: 'false',
      practice: 'false',
      memory: 'false',
      'answer-templates': 'false',
    })
  })

  it('uses an article root and never creates a nested main landmark', () => {
    const wrapper = mountView()

    expect(wrapper.get('article.student-learning-view').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(false)
  })

  it('expands and collapses every learning section with global controls', async () => {
    const wrapper = mountView()
    const expandedStates = () => wrapper.findAll('[data-learning-section]')
      .map((section) => section.get('button').attributes('aria-expanded'))

    expect(wrapper.get('[data-expand-all]').text()).toBe('全部展开')
    expect(wrapper.get('[data-collapse-all]').text()).toBe('全部收起')
    expect(expandedStates()).toEqual(['true', 'false', 'false', 'false', 'false', 'false', 'false'])

    await wrapper.get('[data-expand-all]').trigger('click')
    expect(expandedStates()).toEqual(Array(7).fill('true'))

    await wrapper.get('[data-collapse-all]').trigger('click')
    expect(expandedStates()).toEqual(Array(7).fill('false'))
  })

  it('omits global controls when only core knowledge is available', () => {
    const wrapper = mountView({
      ...completeLearning,
      mechanismChains: [], caseStudies: [], misconceptions: [], practice: [],
      memoryTips: [], answerTemplates: [],
    }, [])

    expect(wrapper.find('[data-expand-all]').exists()).toBe(false)
    expect(wrapper.find('[data-collapse-all]').exists()).toBe(false)
  })

  it('omits every empty header and detail module', () => {
    const wrapper = mountView({
      estimatedMinutes: 10,
      objectives: [], keyFocus: [], difficulties: [], overview: '',
      knowledgeBlocks: [], mechanismChains: [], caseStudies: [], misconceptions: [], practice: [],
      memoryTips: [], answerTemplates: [],
    }, [])

    expect(wrapper.findAll('[data-learning-card]')).toHaveLength(0)
    expect(wrapper.find('[aria-label="本节速览"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="学习工具"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-learning-section]')).toHaveLength(0)
  })

  it('limits reading width and changes a three-column card grid to one column below 720px', () => {
    expect(componentSource).toMatch(/\.student-learning-view\s*\{[^}]*max-width:\s*860px/s)
    expect(componentSource).toMatch(/\.learning-meta-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s)
    expect(componentSource).toMatch(/@media\s*\(max-width:\s*720px\)[\s\S]*\.learning-meta-grid\s*\{[^}]*grid-template-columns:\s*1fr/s)
  })

  it('keeps tool buttons touch-sized with a visible keyboard focus outline', () => {
    expect(componentSource).toMatch(/\.learning-tools button\s*\{[^}]*min-height:\s*40px/s)
    expect(componentSource).toMatch(/\.learning-tools button:focus-visible\s*\{[^}]*outline:\s*2px/s)
  })
})
