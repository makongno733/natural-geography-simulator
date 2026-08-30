import { listExperiments } from '../catalog.js'

// Legacy shape retained while existing experiment pages continue using
// `type` and `component`. The catalog remains the single metadata source.
const modules = listExperiments().map(({ kind, load, ...experiment }) => Object.freeze({
  ...experiment,
  type: kind,
  component: load,
}))

export const categoryLabels = {
  meteorology: '气象学实验',
  hydrology: '水文学实验',
  geology: '地质实验',
  astronomy: '天文学实验',
  systems: '地理系统实验',
}

export const categoryIcons = {
  meteorology: '🌤',
  hydrology: '💧',
  geology: '⛏',
  astronomy: '🔭',
  systems: '🧭',
}

export function getRelatedExperiments(currentId, limit = 4) {
  const current = modules.find(module => module.id === currentId)
  if (!current) return []

  return modules
    .filter(module => module.id !== currentId)
    .map(module => {
      const sharedConcepts = module.concepts.filter(concept => current.concepts.includes(concept))
      return { ...module, sharedCount: sharedConcepts.length, sharedConcepts }
    })
    .filter(module => module.sharedCount > 0)
    .sort((a, b) => b.sharedCount - a.sharedCount)
    .slice(0, limit)
}

export default modules
