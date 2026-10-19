import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { HomePlanetModule } from './HomePlanetScene.js'

describe('home planet camera distance', () => {
  it('keeps the compact planet smaller through initial display and next-planet transition', () => {
    const camera = new THREE.PerspectiveCamera()
    const done = vi.fn()
    const group = HomePlanetModule({ reduceMotion: false, distanceScale: 1.3, onTransitionDone: done })(
      new THREE.Scene(), {}, { cameraRig: { camera } }
    )
    const api = group.userData.api
    const texture = new THREE.Texture()

    api.show({ id: 'earth', radius: 1.5 }, texture)
    expect(camera.position.z).toBeCloseTo(4.8 * 1.3)

    api.show({ id: 'saturn', radius: 1.28, distance: 6.4 }, texture, null, 1)
    api.update(1)
    expect(camera.position.z).toBeCloseTo(6.4 * 1.3)
    expect(done).toHaveBeenCalledTimes(2)
    api.dispose()
    texture.dispose()
  })
})
