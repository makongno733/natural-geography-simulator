import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Labs from './CosmosLabs.vue'
describe('Cosmos lab controls', () => {
  it('updates measurable quantities and string geometry through controls', async () => {
    const wrapper=mount(Labs)
    const sliders=wrapper.findAll('input[type=range]')
    await sliders[0].setValue('0')
    expect(wrapper.text()).toContain('1.000 s')
    await sliders[1].setValue('0.25')
    expect(wrapper.text()).toContain('3.00')
    await wrapper.find('input[type=number]').setValue('3')
    expect(wrapper.text()).toContain('0.25000')
    const previous=wrapper.find('polyline').attributes('points')
    await sliders[2].setValue('4')
    expect(wrapper.find('polyline').attributes('points')).not.toBe(previous)
    await wrapper.find('select').setValue('true')
    expect(wrapper.find('polyline').attributes('points').split(' ')[0]).toBe('350,140')
    await wrapper.find('input[type=number]').setValue('-2')
    expect(wrapper.text()).toContain('请输入有效的非负数')
  })
})
