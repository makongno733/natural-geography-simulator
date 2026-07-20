import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PracticePanel from '../PracticePanel.vue'
import componentSource from '../PracticePanel.vue?raw'

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
    hint: '可按“冷热—垂直运动—气压—水平运动”组织答案。',
    answer: '冷热不均导致大气垂直和水平运动。',
    explanation: '按四步因果链作答。',
    knowledgePoint: '热力环流',
  },
]

describe('PracticePanel', () => {
  it('associates every choice label with its radio input', () => {
    const wrapper = mount(PracticePanel, { props: { questions } })
    const inputs = wrapper.findAll('input[type="radio"]')
    const labels = wrapper.findAll('fieldset label')

    expect(inputs).toHaveLength(2)
    expect(labels.map((label) => label.attributes('for'))).toEqual(inputs.map((input) => input.attributes('id')))
    expect(inputs.every((input) => Boolean(input.attributes('id')))).toBe(true)
  })

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

    const answer = wrapper.get('#practice-answer-0')
    expect(answer.classes()).toContain('answer-feedback')
    expect(answer.classes()).toContain('is-correct')
    expect(answer.text()).toContain('回答正确')
    expect(answer.text()).toContain('正确答案：A')
    expect(answer.text()).toContain('地面长波辐射')
    expect(wrapper.get('input[value="A"]').element.checked).toBe(true)
  })

  it('reveals a short-answer reference independently', async () => {
    const wrapper = mount(PracticePanel, { props: { questions } })

    expect(wrapper.text()).toContain('可按“冷热—垂直运动—气压—水平运动”组织答案。')
    expect(wrapper.findAll('[data-reveal-answer]')[1].text()).toBe('查看答案与解析')

    await wrapper.findAll('[data-reveal-answer]')[1].trigger('click')

    const answer = wrapper.get('#practice-answer-1')
    expect(answer.classes()).toContain('is-reference')
    expect(answer.text()).toContain('参考答案')
    expect(answer.text()).toContain('冷热不均导致大气垂直和水平运动')
    expect(wrapper.findAll('[data-reveal-answer]')[1].text()).toBe('隐藏答案与解析')
    expect(wrapper.get('#practice-answer-0').attributes('style')).toContain('display: none')
  })

  it('marks an incorrect choice and explains the error', async () => {
    const wrapper = mount(PracticePanel, { props: { questions } })

    await wrapper.get('input[value="B"]').setValue(true)
    await wrapper.findAll('[data-reveal-answer]')[0].trigger('click')

    const answer = wrapper.get('#practice-answer-0')
    expect(answer.classes()).toContain('is-incorrect')
    expect(answer.text()).toContain('回答有误')
  })

  it('marks an unreplied choice as unanswered', async () => {
    const wrapper = mount(PracticePanel, { props: { questions } })

    await wrapper.findAll('[data-reveal-answer]')[0].trigger('click')

    const answer = wrapper.get('#practice-answer-0')
    expect(answer.classes()).toContain('is-unanswered')
    expect(answer.text()).toContain('尚未作答')
  })

  it('keeps answer controls touch-sized with a visible keyboard focus outline', () => {
    expect(componentSource).toMatch(/\.practice-answer-toggle\s*\{[^}]*min-height:\s*40px/s)
    expect(componentSource).toMatch(/\.practice-answer-toggle:focus-visible\s*\{[^}]*outline:\s*2px/s)
  })
})
