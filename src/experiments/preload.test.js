import { describe, expect, it } from 'vitest'
import { createExperimentPreloader } from './preload.js'

describe('experiment preloader', () => {
  it('deduplicates pending loads and retries after rejection', async () => {
    let attempts = 0
    const load = () => {
      attempts += 1
      return attempts === 1 ? Promise.reject(new Error('network')) : Promise.resolve({ default: {} })
    }
    const preloader = createExperimentPreloader(() => ({ load }))
    await expect(preloader.preload('demo')).rejects.toThrow('network')
    await expect(preloader.preload('demo')).resolves.toBeTruthy()
    expect(attempts).toBe(2)
  })
})
