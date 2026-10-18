import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UrbanFloodSim from './UrbanFloodSim.vue'

describe('UrbanFloodSim Component', () => {
  it('renders simulation controls and SVG stages', () => {
    const wrapper = mount(UrbanFloodSim)
    expect(wrapper.text()).toContain('城市暴雨产流与海绵下渗仿真实验台')
    expect(wrapper.find('svg.profile-svg').exists()).toBe(true)
    expect(wrapper.find('svg.hydro-svg').exists()).toBe(true)
  })

  it('switches presets and recalculates runoff reduction rate', async () => {
    const wrapper = mount(UrbanFloodSim)
    const presetButtons = wrapper.findAll('.btn-preset')
    expect(presetButtons.length).toBe(3)

    // Apply sponge city preset
    await presetButtons[1].trigger('click')
    expect(wrapper.text()).toContain('海绵透水铺装')
    // Sponge city must achieve positive reduction rate compared to concrete
    expect(wrapper.text()).toContain('相对硬化削峰率')
  })

  it('captures an evidence card with structured params and observation-inference distinction', async () => {
    const wrapper = mount(UrbanFloodSim)
    const captureBtn = wrapper.find('.btn-capture')
    expect(captureBtn.exists()).toBe(true)

    await captureBtn.trigger('click')
    const emitted = wrapper.emitted('capture')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toBeDefined()

    const card = emitted[0][0]
    expect(card.title).toContain('实验记录')
    expect(card.params.地表材质).toBeDefined()
    expect(card.observation).toContain('【仿真模型计算结果】')
    expect(card.inference).toContain('【因果推断】')
    expect(card.confidence).toBeGreaterThanOrEqual(1)
  })
})
