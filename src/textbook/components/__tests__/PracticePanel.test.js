import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PracticePanel from '../PracticePanel.vue'

const questions = [
  {
    type: 'single-choice',
    question: '地面直接加热谁？',
    options: ['A. 大气', 'B. 太阳'],
    answer: 'A',
    explanation: '地面长波辐射是近地面大气主要直接热源。',
    knowledgePoint: '大气受热过程',
  },
  {
    type: 'short-answer',
    question: '说明热力环流过程。',
    answer: '冷热不均导致大气垂直和水平运动。',
    explanation: '按四步因果链作答。',
    knowledgePoint: '热力环流',
  },
]

describe('PracticePanel', () => {
  it('connects each reveal button to its own answer region', async () => {
    const wrapper = mount(PracticePanel, { props: { questions } })
    const buttons = wrapper.findAll('[data-reveal-answer]')

    expect(buttons.map((button) => button.attributes('aria-controls'))).toEqual([
      'practice-answer-0',
      'practice-answer-1',
    ])
    expect(buttons.map((button) => button.attributes('aria-expanded'))).toEqual(['false', 'false'])
    expect(wrapper.get('#practice-answer-0').attributes('style')).toContain('display: none')
    expect(wrapper.get('#practice-answer-1').attributes('style')).toContain('display: none')

    await buttons[1].trigger('click')

    expect(buttons[0].attributes('aria-expanded')).toBe('false')
    expect(buttons[1].attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('#practice-answer-1').attributes('style')).not.toContain('display: none')
  })

  it('keeps answers hidden until requested and preserves the learner choice', async () => {
    const wrapper = mount(PracticePanel, { props: { questions } })

    expect(wrapper.get('#practice-answer-0').attributes('style')).toContain('display: none')
    await wrapper.get('input[value="A"]').setValue(true)
    await wrapper.findAll('[data-reveal-answer]')[0].trigger('click')

    expect(wrapper.get('#practice-answer-0').text()).toContain('正确答案：A')
    expect(wrapper.get('#practice-answer-0').text()).toContain('地面长波辐射')
    expect(wrapper.get('input[value="A"]').element.checked).toBe(true)
  })

  it('reveals a short-answer reference independently', async () => {
    const wrapper = mount(PracticePanel, { props: { questions } })

    await wrapper.findAll('[data-reveal-answer]')[1].trigger('click')

    expect(wrapper.get('#practice-answer-1').text()).toContain('冷热不均导致大气垂直和水平运动')
    expect(wrapper.get('#practice-answer-0').attributes('style')).toContain('display: none')
  })
})
