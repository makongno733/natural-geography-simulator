import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const resolveProfile = vi.fn()
const loadGeneratedModel = vi.fn()

vi.mock('three', () => {
  class Group {
    constructor() {
      this.userData = {}
    }

    traverse(callback) {
      callback(this)
    }
  }

  class Scene {
    constructor() {
      this.children = []
      this.background = null
      this.fog = null
    }

    add(child) {
      this.children.push(child)
    }

    remove(child) {
      this.children = this.children.filter(entry => entry !== child)
    }

    traverse(callback) {
      this.children.forEach(callback)
    }
  }

  class Color {
    constructor(value) {
      this.value = value
    }
  }

  class Clock {
    constructor() {
      this.elapsedTime = 0
    }

    getDelta() {
      return 0.016
    }
  }

  return { Group, Scene, Color, Clock }
})

vi.mock('./RenderManager.js', () => ({
  RenderManager: class {
    constructor(container, options = {}) {
      this.container = container
      this.quality = options.quality || 'medium'
      this.domElement = {}
    }

    initComposer() {}
    render() {}
    resize() {}
    dispose() {}
  },
}))

vi.mock('./CameraRig.js', () => ({
  CameraRig: class {
    constructor() {
      this.camera = { name: 'camera' }
    }

    update() {}
    resize() {}
    setAutoRotate() {}
    preset() {}
    dispose() {}
  },
}))

vi.mock('./LightRig.js', () => ({
  LightRig: class {
    dispose() {}
  },
}))

vi.mock('./LabelSystem.js', () => ({
  LabelSystem: class {
    clearAll() {}
    render() {}
    resize() {}
    dispose() {}
  },
}))

vi.mock('../optimization/modelManager.js', () => ({
  modelManager: {
    resolveProfile,
    loadGeneratedModel,
  },
}))

const { BaseScene } = await import('./BaseScene.js')
const { Group } = await import('three')

describe('BaseScene', () => {
  beforeEach(() => {
    resolveProfile.mockReset()
    loadGeneratedModel.mockReset()
    globalThis.requestAnimationFrame = vi.fn(() => 1)
    globalThis.cancelAnimationFrame = vi.fn()
  })

  afterEach(() => {
    delete globalThis.requestAnimationFrame
    delete globalThis.cancelAnimationFrame
  })

  it('keeps optimized module loading aligned with the current render quality', () => {
    resolveProfile.mockReturnValue({
      modelId: 'base-scene',
      deviceTier: 'medium',
      networkTier: 'normal',
      quality: 'low',
    })
    loadGeneratedModel.mockReturnValue({
      model: new Group(),
      profile: {
        modelId: 'cloud-layer',
        deviceTier: 'medium',
        networkTier: 'normal',
        quality: 'high',
      },
    })

    const scene = new BaseScene(
      { clientWidth: 1280, clientHeight: 720 },
      {
        modelId: 'base-scene',
        quality: 'high',
        availableQualities: ['low', 'high'],
        labels: false,
      },
    )

    scene.loadOptimizedModule('cloud-layer', vi.fn(() => new Group()), { density: 0.8 })

    expect(scene.availableQualities).toEqual(['low', 'high'])
    expect(scene.renderManager.quality).toBe('high')
    expect(scene.modelProfile.quality).toBe('high')
    expect(loadGeneratedModel).toHaveBeenCalledWith(expect.objectContaining({
      modelId: 'cloud-layer',
      availableQualities: ['high'],
    }))
    expect(scene._params).toMatchObject({
      density: 0.8,
      mode: 'simple',
      quality: 'high',
      modelQuality: 'high',
    })
  })
})
