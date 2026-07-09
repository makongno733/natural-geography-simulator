export function getNetworkTier(env = globalThis) {
  const connection = env.navigator?.connection || env.navigator?.mozConnection || env.navigator?.webkitConnection
  if (!connection) return 'normal'

  if (connection.saveData) return 'slow'

  const effectiveType = String(connection.effectiveType || '').toLowerCase()
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow'
  if (effectiveType === '4g') return 'fast'

  const downlink = Number(connection.downlink || 0)
  if (downlink > 0 && downlink < 1.5) return 'slow'
  if (downlink >= 8) return 'fast'

  return 'normal'
}
