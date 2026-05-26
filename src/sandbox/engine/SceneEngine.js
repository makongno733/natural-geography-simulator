import { createTerrainScene } from '../../lib/terrainScene.js'

export function createSceneEngine(hostElement, options = {}) {
  const terrainAPI = createTerrainScene(hostElement, {
    onInteraction: options.onInteraction
  })

  return {
    update(params) {
      terrainAPI.update({
        timeline: params.timeline ?? 0,
        climate: params.climate ?? 0,
        weatherMode: params.weatherMode ?? 'clear',
        activeType: params.activeType ?? 'consequent',
        activeModule: params.activeModule ?? 'fluvial',
        viewMode: params.viewMode ?? 'terrain'
      })
    },
    resetCamera() { terrainAPI.resetCamera() },
    setPreset360() { terrainAPI.setPreset360() },
    resize() { terrainAPI.resize() },
    getScene() { return terrainAPI.getScene() },
    getTerrainAPI() { return terrainAPI },
    computeClimateMetrics() { return terrainAPI.computeClimateMetrics() },
    getCurrentFeatureName() { return terrainAPI.getCurrentFeatureName() },
    dispose() { terrainAPI.dispose() }
  }
}
