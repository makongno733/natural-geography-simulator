import { getExperiment } from './catalog.js'

export function createExperimentPreloader(resolveExperiment) {
  const cache = new Map()

  function preload(id) {
    if (cache.has(id)) return cache.get(id)

    const experiment = resolveExperiment(id)
    if (!experiment?.load) return Promise.reject(new Error(`Unknown experiment: ${id}`))

    const pending = Promise.resolve().then(() => experiment.load())
    cache.set(id, pending)
    pending.catch(() => cache.delete(id))
    return pending
  }

  function reset(id) {
    cache.delete(id)
  }

  return Object.freeze({ preload, reset })
}

const defaultPreloader = createExperimentPreloader(getExperiment)

export const preloadExperiment = defaultPreloader.preload
export const resetExperimentPreload = defaultPreloader.reset
