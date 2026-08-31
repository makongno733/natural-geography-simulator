import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ExperimentView from './ExperimentView.vue'

const mocks = vi.hoisted(() => {
  const LoadedExperiment = {
    props: ['preset', 'lessonContext'],
    template: '<div data-loaded-experiment>{{ preset?.id }}|{{ lessonContext?.section }}</div>',
  }
  const TutorialModule = {
    default: {
      steps: [{ title: '准备材料', content: '准备透明瓶。' }],
    },
  }
  const loads = {
    thermal: vi.fn(),
    tutorial: vi.fn(),
    slow: vi.fn(),
    next: vi.fn(),
  }
  const experiments = [
    {
      id: 'thermal-circulation', name: '热力环流模拟实验', category: 'meteorology', kind: '3d',
      description: '观察热力环流。', concepts: ['热力环流'],
      presets: ['thermal-cell', 'atmospheric-circulation'], load: loads.thermal,
    },
    {
      id: 'cloud-bottle', name: '瓶中云实验', category: 'meteorology', kind: 'tutorial',
      description: '观察云的形成。', concepts: ['云形成'], presets: ['default'], load: loads.tutorial,
    },
    {
      id: 'slow-experiment', name: '旧实验', category: 'meteorology', kind: '3d',
      description: '旧路由。', concepts: ['热力环流'], presets: ['default'], load: loads.slow,
    },
    {
      id: 'next-experiment', name: '新实验', category: 'meteorology', kind: '3d',
      description: '新路由。', concepts: ['热力环流'], presets: ['default'], load: loads.next,
    },
  ]

  return { LoadedExperiment, TutorialModule, loads, experiments }
})

vi.mock('./catalog.js', () => ({
  listExperiments: () => mocks.experiments,
  getExperiment: id => mocks.experiments.find(experiment => experiment.id === id) || null,
  getExperimentPreset: (experimentId, presetId) => {
    const experiment = mocks.experiments.find(item => item.id === experimentId)
    return experiment?.presets.includes(presetId)
      ? { id: presetId, title: presetId, purpose: `${presetId} purpose` }
      : null
  },
}))

function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

async function mountView(path, webglAvailable = () => true) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/experiments', name: 'experiments', component: { template: '<div />' } },
      { path: '/experiments/:category', name: 'experiment-category', component: { template: '<div />' } },
      { path: '/experiments/:category/:experiment', name: 'experiment-view', component: ExperimentView },
      { path: '/:grade/:book/:chapter/:section', name: 'section', component: { template: '<div />' } },
    ],
  })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(ExperimentView, {
    props: { webglAvailable },
    global: { plugins: [router] },
  })
  return { wrapper, router }
}

describe('ExperimentView', () => {
  beforeEach(() => {
    mocks.loads.thermal.mockReset().mockResolvedValue({ default: mocks.LoadedExperiment })
    mocks.loads.tutorial.mockReset().mockResolvedValue(mocks.TutorialModule)
    mocks.loads.slow.mockReset().mockResolvedValue({ default: { template: '<div data-slow>slow</div>' } })
    mocks.loads.next.mockReset().mockResolvedValue({ default: { template: '<div data-next>next</div>' } })
  })

  it('renders a validated textbook source and passes its lesson context to the experiment', async () => {
    const { wrapper } = await mountView('/experiments/meteorology/thermal-circulation?preset=atmospheric-circulation&grade=高中&book=必修第一册&chapter=第二章&section=第二节')
    await flushPromises()

    expect(wrapper.get('[data-textbook-source]').text()).toContain('高中 / 必修第一册 / 第二章 / 第二节')
    expect(wrapper.get('[data-return-textbook]').attributes('href')).toContain(encodeURIComponent('第二节'))
    expect(wrapper.get('[data-loaded-experiment]').text()).toBe('atmospheric-circulation|第二节')
  })

  it.each([
    '/experiments/meteorology/thermal-circulation?preset=thermal-cell&grade=高中&book=必修第一册',
    '/experiments/meteorology/thermal-circulation?preset=thermal-cell&grade=高中&book=伪造教材&chapter=第二章&section=第二节',
    '/experiments/meteorology/thermal-circulation?preset=thermal-cell&grade=大学&book=自然地理学&chapter=第一章&section=第一节',
  ])('does not trust a partial, fabricated, or unsupported source: %s', async path => {
    const { wrapper } = await mountView(path)
    await flushPromises()

    expect(wrapper.find('[data-textbook-source]').exists()).toBe(false)
    expect(wrapper.find('[data-return-textbook]').exists()).toBe(false)
  })

  it('renders a dedicated invalid experiment state', async () => {
    const { wrapper } = await mountView('/experiments/meteorology/missing')
    await flushPromises()

    expect(wrapper.get('[data-invalid-experiment]').exists()).toBe(true)
  })

  it('rejects an explicitly supplied unknown preset without loading the module', async () => {
    const { wrapper } = await mountView('/experiments/meteorology/thermal-circulation?preset=missing')
    await flushPromises()

    expect(wrapper.get('[data-invalid-preset]').exists()).toBe(true)
    expect(mocks.loads.thermal).not.toHaveBeenCalled()
  })

  it('uses the first declared preset when entering an experiment independently', async () => {
    const { wrapper } = await mountView('/experiments/meteorology/thermal-circulation')
    await flushPromises()

    expect(wrapper.get('[data-loaded-experiment]').text()).toBe('thermal-cell|')
  })

  it('retries a recoverable loader failure', async () => {
    mocks.loads.thermal
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ default: mocks.LoadedExperiment })
    const { wrapper } = await mountView('/experiments/meteorology/thermal-circulation?preset=thermal-cell')
    await flushPromises()

    expect(wrapper.get('[data-load-error]').exists()).toBe(true)
    await wrapper.get('[data-retry-experiment]').trigger('click')
    await flushPromises()

    expect(mocks.loads.thermal).toHaveBeenCalledTimes(2)
    expect(wrapper.get('[data-loaded-experiment]').exists()).toBe(true)
  })

  it('applies WebGL availability only to 3D experiments', async () => {
    const unavailable = () => false
    const threeD = await mountView('/experiments/meteorology/thermal-circulation', unavailable)
    await flushPromises()
    expect(threeD.wrapper.get('[data-webgl-unavailable]').exists()).toBe(true)
    expect(mocks.loads.thermal).not.toHaveBeenCalled()

    const tutorial = await mountView('/experiments/meteorology/cloud-bottle', unavailable)
    await flushPromises()
    expect(tutorial.wrapper.text()).toContain('准备材料')
    expect(mocks.loads.tutorial).toHaveBeenCalledTimes(1)
  })

  it('does not let an older loader promise overwrite a newer route', async () => {
    const slow = deferred()
    mocks.loads.slow.mockReturnValueOnce(slow.promise)
    const { wrapper, router } = await mountView('/experiments/meteorology/slow-experiment')

    await router.push('/experiments/meteorology/next-experiment')
    await flushPromises()
    expect(wrapper.get('[data-next]').exists()).toBe(true)

    slow.resolve({ default: { template: '<div data-slow>slow</div>' } })
    await flushPromises()
    expect(wrapper.get('[data-next]').exists()).toBe(true)
    expect(wrapper.find('[data-slow]').exists()).toBe(false)
  })

  it('keeps related experiment navigation after the module is ready', async () => {
    const { wrapper } = await mountView('/experiments/meteorology/thermal-circulation')
    await flushPromises()

    expect(wrapper.get('.related-card').attributes('href')).toContain('/experiments/meteorology/slow-experiment')
  })
})
