import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MechanismChain from '../MechanismChain.vue'
import componentSource from '../MechanismChain.vue?raw'

describe('MechanismChain', () => {
  it('renders mechanism steps as an ordered list in source order', () => {
    const wrapper = mount(MechanismChain, {
      props: {
        chains: [{ title: '热力环流', steps: ['冷热不均', '垂直运动', '气压差', '水平运动'] }],
      },
    })

    expect(wrapper.get('ol').exists()).toBe(true)
    expect(wrapper.findAll('[data-chain-step]').map((node) => node.text())).toEqual([
      '冷热不均',
      '垂直运动',
      '气压差',
      '水平运动',
    ])
    expect(wrapper.find('[data-chain-arrow]').attributes('aria-hidden')).toBe('true')
  })

  it('uses a horizontal desktop chain and a vertical narrow-screen chain', () => {
    expect(componentSource).toMatch(/\.mechanism-chain__steps\s*\{[^}]*flex-direction:\s*row/s)
    expect(componentSource).toMatch(/@media\s*\(max-width:\s*720px\)[\s\S]*\.mechanism-chain__steps\s*\{[^}]*flex-direction:\s*column/s)
  })
})
