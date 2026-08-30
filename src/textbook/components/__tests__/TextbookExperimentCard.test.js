import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TextbookExperimentCard from '../TextbookExperimentCard.vue'

const mocks = vi.hoisted(() => ({
  preload: vi.fn(),
}))

vi.mock('../../../experiments/preload.js', () => ({
  preloadExperiment: mocks.preload,
}))

const textbook = Object.freeze({
  grade: '高中',
  book: '必修第一册',
  chapter: '第三章',
  section: '第一节',
})

const link = Object.freeze({
  confidence: 'curated',
  primary: Object.freeze({
    experimentId: 'water-cycle-3d',
    presetId: 'water-cycle',
    title: '水循环过程',
    purpose: '追踪水在海洋、大气和陆地间的迁移。',
  }),
  related: Object.freeze([
    Object.freeze({ experimentId: 'water-cycle', presetId: 'default', title: '水循环袋实验', purpose: '识别水循环环节。' }),
    Object.freeze({ experimentId: 'groundwater', presetId: 'default', title: '地下水与含水层', purpose: '认识地下水运动。' }),
    Object.freeze({ experimentId: 'infiltration', presetId: 'default', title: '下渗与径流', purpose: '比较下渗差异。' }),
  ]),
})

async function mountCard(props = { link, textbook }) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/experiments/:category/:experiment', name: 'experiment-view', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()

  return mount(TextbookExperimentCard, {
    props,
    global: { plugins: [router] },
  })
}

describe('TextbookExperimentCard', () => {
  beforeEach(() => {
    mocks.preload.mockReset()
    mocks.preload.mockResolvedValue({})
  })

  it('links the primary experiment with its preset and complete textbook source', async () => {
    const wrapper = await mountCard()
    const primary = wrapper.get('[data-primary-experiment]')

    expect(primary.text()).toContain('水循环')
    expect(wrapper.text()).toContain('追踪水在海洋、大气和陆地间的迁移')
    expect(primary.attributes('href')).toContain('/experiments/systems/water-cycle-3d')

    const url = new URL(primary.attributes('href'), 'https://example.test')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      preset: 'water-cycle',
      grade: '高中',
      book: '必修第一册',
      chapter: '第三章',
      section: '第一节',
    })
  })

  it('shows no more than two related experiment links', async () => {
    const wrapper = await mountCard()
    const related = wrapper.findAll('[data-related-experiment]')

    expect(related).toHaveLength(2)
    expect(related.map(item => item.text())).toEqual(['水循环袋实验', '地下水与含水层'])
    expect(related[0].attributes('href')).toContain('/experiments/hydrology/water-cycle')
  })

  it.each(['pointerenter', 'focusin', 'touchstart'])('warms the primary experiment on %s intent', async (eventName) => {
    const wrapper = await mountCard()

    await wrapper.get('[data-primary-experiment]').trigger(eventName)

    expect(mocks.preload).toHaveBeenCalledWith('water-cycle-3d')
  })

  it('silently ignores an intent preload rejection and keeps the navigation link', async () => {
    mocks.preload.mockRejectedValueOnce(new Error('offline'))
    const wrapper = await mountCard()
    const primary = wrapper.get('[data-primary-experiment]')

    await primary.trigger('pointerenter')
    await flushPromises()

    expect(primary.attributes('href')).toContain('/experiments/systems/water-cycle-3d')
  })
})
