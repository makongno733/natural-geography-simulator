import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { resolveModelQuality } from './ModelQuality.js'
import { EarthInteriorModule } from '../modules/EarthInteriorModule.js'
import { WaterCycleModule } from '../modules/WaterCycleModule.js'
import { LandformModule } from '../modules/LandformModule.js'

const services = { labelSystem: null }

describe('shared 3D model quality', () => {
  it('uses a smaller budget on constrained devices', () => {
    const low = resolveModelQuality({}, { navigator: { deviceMemory: 2 }, window: {} })
    const high = resolveModelQuality({ quality: 'high' })
    expect(low.tier).toBe('low')
    expect(low.dpr).toBeLessThan(high.dpr)
    expect(low.terrain.professional).toBeLessThan(high.terrain.professional)
  })

  it('applies one budget to the featured earth, water and terrain models', () => {
    const quality = resolveModelQuality({ quality: 'low' })
    const earth = EarthInteriorModule(new THREE.Scene(), { mode: 'simple', quality }, services)
    const earthShell = earth.children.find(child => child.isMesh && child.geometry.type === 'SphereGeometry')
    expect(earthShell.geometry.parameters.widthSegments).toBe(quality.sphere)

    const water = WaterCycleModule(new THREE.Scene(), { mode: 'simple', quality }, services)
    const instances = water.children.filter(child => child.isInstancedMesh)
    expect(instances.map(child => child.count).sort((a, b) => a - b)).toEqual([16, 32])
    const particles = water.children.filter(child => child.isPoints)
    expect(particles.map(child => child.geometry.attributes.position.count)).toEqual([300, 208, 208])

    const terrain = LandformModule(new THREE.Scene(), { mode: 'simple', activeModule: 'fluvial', quality }, services)
    expect(terrain.children[0].geometry.parameters.widthSegments).toBe(quality.terrain.simple)
  })
})
