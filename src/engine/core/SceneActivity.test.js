import { describe, expect, it, vi } from 'vitest'
import { SceneActivity } from './SceneActivity.js'

describe('SceneActivity', () => {
  it('runs only when the document and container are visible', () => {
    const onActiveChange = vi.fn()
    const activity = new SceneActivity({ onActiveChange })
    expect(onActiveChange).toHaveBeenLastCalledWith(true)

    activity.setDocumentVisible(false)
    expect(onActiveChange).toHaveBeenLastCalledWith(false)

    activity.setDocumentVisible(true)
    activity.setElementVisible(true)
    expect(onActiveChange).toHaveBeenLastCalledWith(true)
  })

  it('stays inactive while manually paused', () => {
    const onActiveChange = vi.fn()
    const activity = new SceneActivity({ onActiveChange })

    activity.setPaused(true)
    expect(onActiveChange).toHaveBeenLastCalledWith(false)

    activity.setPaused(false)
    expect(onActiveChange).toHaveBeenLastCalledWith(true)
  })

  it('disposes observers and listeners once', () => {
    const removeEventListener = vi.fn()
    const disconnect = vi.fn()
    const onActiveChange = vi.fn()
    const fakeDocument = { addEventListener: vi.fn(), removeEventListener, visibilityState: 'visible' }
    const FakeObserver = function () {
      this.observe = vi.fn()
      this.disconnect = disconnect
    }

    const activity = new SceneActivity({
      onActiveChange,
      document: fakeDocument,
      element: {},
      IntersectionObserver: FakeObserver,
    })

    activity.dispose()
    activity.dispose()

    expect(removeEventListener).toHaveBeenCalledTimes(1)
    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  it('ignores activity changes after disposal', () => {
    const onActiveChange = vi.fn()
    const activity = new SceneActivity({ onActiveChange, document: null })
    activity.dispose()
    const calls = onActiveChange.mock.calls.length

    activity.setDocumentVisible(false)
    activity.setPaused(true)
    expect(onActiveChange.mock.calls.length).toBe(calls)
  })
})
