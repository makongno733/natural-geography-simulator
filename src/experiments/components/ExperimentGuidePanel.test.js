// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExperimentGuidePanel from './ExperimentGuidePanel.vue'

const fullPedagogy = {
  objectives: ['解释流水侵蚀和沉积的关系'],
  inquiryQuestions: ['为什么弯道外侧更容易被侵蚀？'],
  observationTasks: [
    {
      title: '观察弯道侵蚀',
      prompt: '提高流速，记录河道外侧的变化。',
      hint: '重点看水流速度更快的位置。'
    }
  ],
  explanations: ['流速越大，河流侵蚀和搬运能力越强。'],
  quiz: [
    {
      question: '流速降低时通常最先沉积什么？',
      options: ['较粗颗粒', '溶解物质', '水汽'],
      answer: 0,
      feedback: '较粗颗粒需要更高流速维持搬运，因此会更早沉积。'
    }
  ]
}

describe('ExperimentGuidePanel', () => {
  it('renders the teaching guide sections', () => {
    const wrapper = mount(ExperimentGuidePanel, {
      props: { pedagogy: fullPedagogy }
    })

    expect(wrapper.text()).toContain('学习目标')
    expect(wrapper.text()).toContain('解释流水侵蚀和沉积的关系')
    expect(wrapper.text()).toContain('探究问题')
    expect(wrapper.text()).toContain('为什么弯道外侧更容易被侵蚀？')
    expect(wrapper.text()).toContain('观察任务')
    expect(wrapper.text()).toContain('观察弯道侵蚀')
    expect(wrapper.text()).toContain('机制解释')
    expect(wrapper.text()).toContain('流速越大，河流侵蚀和搬运能力越强。')
    expect(wrapper.text()).toContain('随堂小测')
    expect(wrapper.text()).toContain('流速降低时通常最先沉积什么？')
  })

  it('shows correct feedback after selecting the right quiz option', async () => {
    const wrapper = mount(ExperimentGuidePanel, {
      props: { pedagogy: fullPedagogy }
    })

    await wrapper.find('button[data-testid="quiz-option-0-0"]').trigger('click')

    expect(wrapper.text()).toContain('回答正确')
    expect(wrapper.text()).toContain('较粗颗粒需要更高流速维持搬运')
  })

  it('shows explanatory feedback after selecting a wrong quiz option', async () => {
    const wrapper = mount(ExperimentGuidePanel, {
      props: { pedagogy: fullPedagogy }
    })

    await wrapper.find('button[data-testid="quiz-option-0-1"]').trigger('click')

    expect(wrapper.text()).toContain('再想一想')
    expect(wrapper.text()).toContain('较粗颗粒需要更高流速维持搬运')
  })

  it('does not render malformed quiz items', () => {
    const wrapper = mount(ExperimentGuidePanel, {
      props: {
        pedagogy: {
          quiz: [
            { question: '缺少选项', options: [], answer: 0, feedback: '不会显示' },
            { question: '答案越界', options: ['A'], answer: 3, feedback: '不会显示' }
          ]
        }
      }
    })

    expect(wrapper.text()).not.toContain('缺少选项')
    expect(wrapper.text()).not.toContain('答案越界')
    expect(wrapper.find('.experiment-guide').exists()).toBe(false)
  })
})
