import { GeoModule } from './GeoModule.js'

const modules = new Map()

export function registerModule(config) {
  const m = new GeoModule(config)
  modules.set(config.id, m)
  return m
}

export function getModule(id) {
  return modules.get(id) || null
}

export function getAllModules() {
  return Array.from(modules.values())
}
