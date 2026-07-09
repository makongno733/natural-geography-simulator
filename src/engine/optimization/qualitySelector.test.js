import { describe, expect, it } from 'vitest'
import { normalizeQuality, selectModelQuality } from './qualitySelector.js'

describe('normalizeQuality', () => {
  it('falls back to medium for unknown values', () => {
    expect(normalizeQuality('ultra')).toBe('medium')
    expect(normalizeQuality(undefined)).toBe('medium')
  })

  it('keeps supported values', () => {
    expect(normalizeQuality('low')).toBe('low')
    expect(normalizeQuality('medium')).toBe('medium')
    expect(normalizeQuality('high')).toBe('high')
  })
})

describe('selectModelQuality', () => {
  it('uses low when the device is weak', () => {
    expect(selectModelQuality({
      deviceTier: 'low',
      networkTier: 'fast',
      availableQualities: ['low', 'medium', 'high'],
    })).toBe('low')
  })

  it('uses low when the network is slow', () => {
    expect(selectModelQuality({
      deviceTier: 'high',
      networkTier: 'slow',
      availableQualities: ['low', 'medium', 'high'],
    })).toBe('low')
  })

  it('uses high only when device and network are both strong', () => {
    expect(selectModelQuality({
      deviceTier: 'high',
      networkTier: 'fast',
      availableQualities: ['low', 'medium', 'high'],
    })).toBe('high')
  })

  it('uses medium for the balanced default case', () => {
    expect(selectModelQuality({
      deviceTier: 'medium',
      networkTier: 'normal',
      availableQualities: ['low', 'medium', 'high'],
    })).toBe('medium')
  })

  it('chooses the nearest available lower quality before moving upward', () => {
    expect(selectModelQuality({
      deviceTier: 'high',
      networkTier: 'fast',
      availableQualities: ['low', 'medium'],
    })).toBe('medium')

    expect(selectModelQuality({
      deviceTier: 'medium',
      networkTier: 'normal',
      availableQualities: ['low', 'high'],
    })).toBe('low')

    expect(selectModelQuality({
      deviceTier: 'low',
      networkTier: 'slow',
      availableQualities: ['medium', 'high'],
    })).toBe('medium')
  })
})
