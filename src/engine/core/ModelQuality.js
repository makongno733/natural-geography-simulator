// One quality budget for the reusable Earth, water and terrain scenes.
// Keep the educational geometry; only reduce tessellation and decoration.
const PROFILES = Object.freeze({
  low: Object.freeze({ tier: 'low', dpr: 1, shadows: false, sphere: 24, terrain: { simple: 64, professional: 96 }, particles: 0.4 }),
  medium: Object.freeze({ tier: 'medium', dpr: 1.5, shadows: true, sphere: 32, terrain: { simple: 96, professional: 160 }, particles: 0.7 }),
  high: Object.freeze({ tier: 'high', dpr: 2, shadows: true, sphere: 48, terrain: { simple: 128, professional: 256 }, particles: 1 }),
})

export function resolveModelQuality(options = {}, env = {}) {
  const nav = env.navigator ?? (typeof navigator === 'undefined' ? null : navigator)
  const win = env.window ?? (typeof window === 'undefined' ? null : window)
  let tier = options.quality
  if (!PROFILES[tier]) {
    const mobile = /Mobi|Android|iPhone|iPad/i.test(nav?.userAgent || '')
    const reduced = win?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    tier = nav?.connection?.saveData || reduced || (nav?.deviceMemory && nav.deviceMemory <= 2)
      ? 'low'
      : mobile || (nav?.deviceMemory && nav.deviceMemory <= 4) || (nav?.hardwareConcurrency && nav.hardwareConcurrency <= 4)
        ? 'medium'
        : 'high'
  }
  return PROFILES[tier]
}

export function modelCount(base, quality, minimum = 1) {
  return Math.max(minimum, Math.round(base * quality.particles))
}
