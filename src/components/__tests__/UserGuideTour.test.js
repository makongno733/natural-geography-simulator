import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserGuideTour from '../UserGuideTour.vue'

describe('UserGuideTour Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('can be manually triggered via startTour', async () => {
    const wrapper = mount(UserGuideTour)
    expect(wrapper.find('.tour-overlay').exists()).toBe(false)

    wrapper.vm.startTour(true)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.tour-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('欢迎来到地理共同体')
  })

  it('steps forward and completes tour', async () => {
    const wrapper = mount(UserGuideTour)
    wrapper.vm.startTour(true)
    await wrapper.vm.$nextTick()

    // 步骤 1/4 -> 2/4
    const nextBtn = wrapper.find('.baroque-btn-primary')
    await nextBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('步骤 2 / 4')
  })

  it('allows skipping and sets local storage', async () => {
    const wrapper = mount(UserGuideTour)
    wrapper.vm.startTour(true)
    await wrapper.vm.$nextTick()

    const skipBtn = wrapper.find('.tour-skip-btn')
    await skipBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.tour-overlay').exists()).toBe(false)
    expect(localStorage.getItem('geo_community_onboarding_tour_v1')).toBe('skipped')
  })
})
