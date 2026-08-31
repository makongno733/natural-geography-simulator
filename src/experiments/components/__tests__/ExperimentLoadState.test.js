import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ExperimentLoadState from '../ExperimentLoadState.vue'

describe('ExperimentLoadState', () => {
  it('offers a retry action after a recoverable load failure', async () => {
    const wrapper = mount(ExperimentLoadState, { props: { status: 'error' } })

    expect(wrapper.text()).toContain('实验加载失败')
    await wrapper.get('[data-retry-experiment]').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it.each([
    ['loading', '[data-loading-experiment]'],
    ['invalid-experiment', '[data-invalid-experiment]'],
    ['invalid-preset', '[data-invalid-preset]'],
    ['webgl-unavailable', '[data-webgl-unavailable]'],
  ])('renders the %s state accessibly', (status, selector) => {
    const wrapper = mount(ExperimentLoadState, { props: { status } })

    expect(wrapper.get(selector).attributes('role')).toBe('status')
    expect(wrapper.get('[data-back-experiments]').attributes('href')).toBe('/experiments')
  })
})
