import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import MechanismChain from '../MechanismChain.vue'

it('renders mechanism steps in source order', () => {
  const wrapper = mount(MechanismChain, {
    props: {
      chains: [{ title: '热力环流', steps: ['冷热不均', '垂直运动', '气压差', '水平运动'] }],
    },
  })

  expect(wrapper.findAll('[data-chain-step]').map((node) => node.text())).toEqual([
    '冷热不均',
    '垂直运动',
    '气压差',
    '水平运动',
  ])
  expect(wrapper.find('[data-chain-arrow]').attributes('aria-hidden')).toBe('true')
})
