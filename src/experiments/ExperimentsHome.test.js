import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import ExperimentsHome from './ExperimentsHome.vue'

async function mountHome() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/experiments', name: 'experiments', component: ExperimentsHome },
      { path: '/experiments/:category/:experiment', name: 'experiment-view', component: { template: '<div />' } },
      { path: '/experiments/:category', name: 'experiment-category', component: { template: '<div />' } },
    ],
  })
  await router.push('/experiments')
  await router.isReady()
  return mount(ExperimentsHome, { global: { plugins: [router] } })
}

describe('ExperimentsHome', () => {
  it('filters experiments through the real textbook reverse registry', async () => {
    const wrapper = await mountHome()

    await wrapper.get('[data-grade-filter]').setValue('高中')
    await wrapper.get('[data-book-filter]').setValue('必修第二册')
    await wrapper.get('[data-chapter-filter]').setValue('第三章')

    const results = wrapper.findAll('[data-experiment-result]')
    expect(results).toHaveLength(1)
    expect(results[0].attributes('data-experiment-result')).toBe('spatial-network')
    expect(results[0].text()).toContain('空间网络系统')
  })

  it('uses native cascading controls and clears incompatible descendants', async () => {
    const wrapper = await mountHome()
    const grade = wrapper.get('[data-grade-filter]')
    const book = wrapper.get('[data-book-filter]')
    const chapter = wrapper.get('[data-chapter-filter]')

    expect(grade.element.tagName).toBe('SELECT')
    expect(book.attributes('disabled')).toBeDefined()
    expect(chapter.attributes('disabled')).toBeDefined()

    await grade.setValue('高中')
    await book.setValue('必修第二册')
    await chapter.setValue('第三章')
    await grade.setValue('初中')

    expect(book.element.value).toBe('')
    expect(chapter.element.value).toBe('')
  })
})
