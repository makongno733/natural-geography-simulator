import { getDeviceTier as defaultGetDeviceTier } from './deviceProfiler.js'
import { getNetworkTier as defaultGetNetworkTier } from './networkProfiler.js'
import { selectModelQuality } from './qualitySelector.js'
import { modelPerformanceMonitor } from './performanceMonitor.js'

export class ModelManager {
  constructor({
    monitor = modelPerformanceMonitor,
    getDeviceTier = defaultGetDeviceTier,
    getNetworkTier = defaultGetNetworkTier,
    now = () => performance.now(),
  } = {}) {
    this.monitor = monitor
    this.getDeviceTier = getDeviceTier
    this.getNetworkTier = getNetworkTier
    this.now = now
  }

  resolveProfile({ modelId = 'unknown-model', availableQualities = ['low', 'medium', 'high'], env = globalThis } = {}) {
    const deviceTier = this.getDeviceTier(env)
    const networkTier = this.getNetworkTier(env)
    const quality = selectModelQuality({ deviceTier, networkTier, availableQualities })

    return {
      modelId,
      deviceTier,
      networkTier,
      quality,
    }
  }

  loadGeneratedModel({
    modelId,
    factory,
    scene,
    params = {},
    context = {},
    availableQualities = ['low', 'medium', 'high'],
    env = globalThis,
  }) {
    const profile = this.resolveProfile({ modelId, availableQualities, env })
    const startedAt = this.now()

    this.monitor.record({
      type: 'model-load-start',
      modelId: profile.modelId,
      quality: profile.quality,
      deviceTier: profile.deviceTier,
      networkTier: profile.networkTier,
    })

    try {
      const model = factory(scene, {
        ...params,
        quality: profile.quality,
        modelQuality: profile.quality,
      }, context)

      this.monitor.record({
        type: 'model-load-success',
        modelId: profile.modelId,
        quality: profile.quality,
        durationMs: Math.round(this.now() - startedAt),
      })

      return { model, profile }
    } catch (error) {
      this.monitor.record({
        type: 'model-load-failure',
        modelId: profile.modelId,
        quality: profile.quality,
        durationMs: Math.round(this.now() - startedAt),
        message: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}

export const modelManager = new ModelManager()
