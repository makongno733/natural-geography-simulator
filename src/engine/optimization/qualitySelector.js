const QUALITY_ORDER = ['low', 'medium', 'high']

export function normalizeQuality(value) {
  return QUALITY_ORDER.includes(value) ? value : 'medium'
}

function desiredQuality(deviceTier, networkTier) {
  const device = normalizeQuality(deviceTier)
  const network = networkTier === 'slow' || networkTier === 'fast' ? networkTier : 'normal'

  if (device === 'low' || network === 'slow') return 'low'
  if (device === 'high' && network === 'fast') return 'high'
  return 'medium'
}

export function selectModelQuality({ deviceTier = 'medium', networkTier = 'normal', availableQualities = QUALITY_ORDER } = {}) {
  const available = QUALITY_ORDER.filter(quality => availableQualities.includes(quality))
  if (!available.length) return 'medium'

  const desired = desiredQuality(deviceTier, networkTier)
  const desiredIndex = QUALITY_ORDER.indexOf(desired)

  for (let index = desiredIndex; index >= 0; index -= 1) {
    const quality = QUALITY_ORDER[index]
    if (available.includes(quality)) return quality
  }

  for (let index = desiredIndex + 1; index < QUALITY_ORDER.length; index += 1) {
    const quality = QUALITY_ORDER[index]
    if (available.includes(quality)) return quality
  }

  return available[0]
}
