import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ModelManager } from './modelManager.js'
import { ModelPerformanceMonitor } from './performanceMonitor.js'

describe('ModelManager', () => {
  let monitor

  beforeEach(() => {
    monitor = new ModelPerformanceMonitor()
  })

  it('resolves profile from injected device and network profilers', () => {
    const manager = new ModelManager({
      monitor,
      getDeviceTier: () => 'high',
      getNetworkTier: () => 'fast',
    })

    expect(manager.resolveProfile({
      modelId: 'chapter-earth',
      availableQualities: ['low', 'medium', 'high'],
    })).toEqual({
      modelId: 'chapter-earth',
      deviceTier: 'high',
      networkTier: 'fast',
      quality: 'high',
    })
  })

  it('loads a generated model and records success metrics', () => {
    const group = { userData: { api: { update: vi.fn() } } }
    const factory = vi.fn(() => group)
    const manager = new ModelManager({
      monitor,
      getDeviceTier: () => 'medium',
      getNetworkTier: () => 'normal',
      now: () => 100,
    })

    const result = manager.loadGeneratedModel({
      modelId: 'water-cycle',
      factory,
      scene: { name: 'scene' },
      params: { timeline: 0.5 },
      context: { labelSystem: null },
    })

    expect(result.model).toBe(group)
    expect(result.profile.quality).toBe('medium')
    expect(factory).toHaveBeenCalledWith(
      { name: 'scene' },
      { timeline: 0.5, quality: 'medium', modelQuality: 'medium' },
      { labelSystem: null },
    )
    expect(monitor.getEntries()).toMatchObject([
      { type: 'model-load-start', modelId: 'water-cycle', quality: 'medium' },
      { type: 'model-load-success', modelId: 'water-cycle', quality: 'medium', durationMs: 0 },
    ])
  })

  it('records failures before rethrowing generated model errors', () => {
    const error = new Error('factory failed')
    const manager = new ModelManager({
      monitor,
      getDeviceTier: () => 'low',
      getNetworkTier: () => 'slow',
      now: () => 100,
    })

    expect(() => manager.loadGeneratedModel({
      modelId: 'fault-model',
      factory: () => { throw error },
      scene: {},
      params: {},
      context: {},
    })).toThrow(error)

    expect(monitor.getEntries().at(-1)).toMatchObject({
      type: 'model-load-failure',
      modelId: 'fault-model',
      quality: 'low',
      message: 'factory failed',
    })
  })
})
