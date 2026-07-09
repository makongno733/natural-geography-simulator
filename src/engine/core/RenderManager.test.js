import { beforeEach, describe, expect, it, vi } from 'vitest'

let rendererInstance

vi.mock('three', () => {
  class WebGLRenderer {
    constructor(options) {
      this.options = options
      this.domElement = {}
      this.shadowMap = {}
      this.setPixelRatio = vi.fn()
      this.setClearColor = vi.fn()
      this.setSize = vi.fn()
      this.dispose = vi.fn()
      rendererInstance = this
    }
  }

  class Vector2 {
    constructor(x, y) {
      this.x = x
      this.y = y
    }

    set(x, y) {
      this.x = x
      this.y = y
    }
  }

  return {
    WebGLRenderer,
    Vector2,
    ACESFilmicToneMapping: 'ACES',
    PCFSoftShadowMap: 'PCF',
  }
})

vi.mock('three/examples/jsm/postprocessing/EffectComposer.js', () => ({
  EffectComposer: class {
    addPass() {}
    setSize() {}
    render() {}
  },
}))

vi.mock('three/examples/jsm/postprocessing/RenderPass.js', () => ({
  RenderPass: class {},
}))

const { RenderManager } = await import('./RenderManager.js')

describe('RenderManager', () => {
  beforeEach(() => {
    rendererInstance = null
    globalThis.window = { devicePixelRatio: 2 }
  })

  it('preserves explicit pixelRatioCap overrides when set to zero', () => {
    const manager = new RenderManager(
      {
        clientWidth: 1024,
        clientHeight: 768,
        appendChild: vi.fn(),
      },
      {
        quality: 'high',
        pixelRatioCap: 0,
      },
    )

    expect(manager.pixelRatioCap).toBe(0)
    expect(rendererInstance.setPixelRatio).toHaveBeenCalledWith(0)
  })
})
