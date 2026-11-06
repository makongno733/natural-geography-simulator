import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Labs from './CosmosLabs.vue'

describe('CosmosLabs expanded interactions & features', () => {
  it('renders Minkowski spacetime cone and updates simultaneity line on velocity change', async () => {
    const wrapper = mount(Labs)
    // Verify cone SVG presence
    expect(wrapper.find('.cx-cone-svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('未来光锥')
    expect(wrapper.text()).toContain('同时性面')

    // Change beta
    const velocitySlider = wrapper.findAll('input[type=range]')[0]
    await velocitySlider.setValue('0.8')
    expect(wrapper.text()).toContain('80% c')
    expect(wrapper.text()).toContain('1.667') // gamma at 0.8c
  })

  it('computes FLRW comoving distance, luminosity distance, and cosmic age', async () => {
    const wrapper = mount(Labs)
    const zInput = wrapper.find('input[type=number]')
    await zInput.setValue('1.5')

    expect(wrapper.text()).toContain('共动距离 D_C')
    expect(wrapper.text()).toContain('光度距离 D_L')
    expect(wrapper.text()).toContain('角直径距离 D_A')
    expect(wrapper.text()).toContain('该红移处宇宙年龄')

    // Switch model to Einstein-de Sitter
    const edsBtn = wrapper.findAll('.cx-preset-btn')[1]
    await edsBtn.trigger('click')
    expect(edsBtn.classes()).toContain('active')
    expect(wrapper.text()).toContain('Einstein-de Sitter')
  })

  it('supports worldsheet sweeping and interactive stepping controls', async () => {
    const wrapper = mount(Labs)

    // Initially worldsheet slices are not rendered
    const initialPolylines = wrapper.findAll('polyline')
    expect(initialPolylines.length).toBe(1)

    // Toggle worldsheet
    const worldsheetBtn = wrapper.findAll('button').find(b => b.text().includes('显示二维世界面扫掠'))
    expect(worldsheetBtn).toBeDefined()
    await worldsheetBtn.trigger('click')

    // Should now render multiple polylines for worldsheet slices
    const sweptPolylines = wrapper.findAll('polyline')
    expect(sweptPolylines.length).toBeGreaterThan(1)

    // Test phase step
    const stepBtn = wrapper.findAll('button').find(b => b.text().includes('单步相位'))
    await stepBtn.trigger('click')
    expect(wrapper.text()).toContain('时间相位 ωt')
  })

  it('handles animation play/pause and cleans up on unmount without resource leakage', async () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame')
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')

    const wrapper = mount(Labs)
    const playBtn = wrapper.findAll('button').find(b => b.text().includes('播放振动'))
    await playBtn.trigger('click')
    expect(playBtn.text()).toContain('暂停动画')
    expect(rafSpy).toHaveBeenCalled()

    // Unmount while playing to ensure cleanup
    wrapper.unmount()
    expect(cancelSpy).toHaveBeenCalled()

    rafSpy.mockRestore()
    cancelSpy.mockRestore()
  })
})
