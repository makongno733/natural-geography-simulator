import { normalizeQuality } from './qualitySelector.js'

export function getDeviceTier(env = globalThis) {
  const navigatorRef = env.navigator || {}
  const memory = Number(navigatorRef.deviceMemory || 0)
  const cores = Number(navigatorRef.hardwareConcurrency || 0)
  const pixelRatio = Number(env.devicePixelRatio || 1)

  if ((memory && memory <= 2) || (cores && cores <= 2) || pixelRatio >= 3) {
    return 'low'
  }

  if ((memory && memory >= 8) && (cores && cores >= 8) && pixelRatio <= 2) {
    return 'high'
  }

  return normalizeQuality('medium')
}
