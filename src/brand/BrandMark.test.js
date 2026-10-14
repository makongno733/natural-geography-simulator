// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import BrandMark from './BrandMark.vue'

describe('BrandMark animation lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
  })
  afterEach(() => vi.useRealTimers())

  it('ignores repeated plays and returns to the static state', async () => {
    const wrapper = mount(BrandMark)
    wrapper.vm.play()
    wrapper.vm.play()
    await wrapper.vm.$nextTick()
    expect(wrapper.classes()).toContain('is-playing')
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(1850)
    await wrapper.vm.$nextTick()
    expect(wrapper.classes()).not.toContain('is-playing')
    wrapper.unmount()
  })

  it('respects reduced motion and clears the timer on unmount', () => {
    window.matchMedia.mockReturnValue({ matches: true })
    const reduced = mount(BrandMark)
    reduced.vm.play()
    expect(reduced.classes()).not.toContain('is-playing')
    reduced.unmount()

    window.matchMedia.mockReturnValue({ matches: false })
    const active = mount(BrandMark)
    active.vm.play()
    expect(vi.getTimerCount()).toBe(1)
    active.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('cancels animation when navigation leaves the home page', async () => {
    const wrapper = mount(BrandMark)
    wrapper.vm.play()
    wrapper.vm.stop()
    await wrapper.vm.$nextTick()
    expect(wrapper.classes()).not.toContain('is-playing')
    expect(vi.getTimerCount()).toBe(0)
    wrapper.unmount()
  })

  it('stops immediately when reduced motion is enabled and removes its listener', async () => {
    const preference = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    window.matchMedia.mockReturnValue(preference)
    const wrapper = mount(BrandMark)
    wrapper.vm.play()
    const listener = preference.addEventListener.mock.calls[0][1]
    listener({ matches: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.classes()).not.toContain('is-playing')
    expect(vi.getTimerCount()).toBe(0)
    wrapper.unmount()
    expect(preference.removeEventListener).toHaveBeenCalledWith('change', listener)
  })

  it('keeps SVG definition IDs unique between instances', () => {
    const host = mount(defineComponent({ render: () => h('div', [h(BrandMark), h(BrandMark)]) }))
    const ids = host.findAll('linearGradient').map(node => node.attributes('id'))
    expect(new Set(ids).size).toBe(ids.length)
    host.unmount()
  })
})
