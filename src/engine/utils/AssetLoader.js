import * as THREE from 'three'

export class AssetLoader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader()
    this.cache = new Map()
    this.fallbackColors = new Map()
  }

  registerFallback(key, color) {
    this.fallbackColors.set(key, color)
  }

  async loadTexture(url, key = null, retries = 3) {
    const cacheKey = key || url
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const texture = await this.textureLoader.loadAsync(url)
        this.cache.set(cacheKey, texture)
        return texture
      } catch (e) {
        if (attempt === retries - 1) {
          console.warn(`AssetLoader: failed to load "${url}", using fallback`)
          const fallbackColor = this.fallbackColors.get(cacheKey)
          if (fallbackColor) {
            const canvas = document.createElement('canvas')
            canvas.width = 64
            canvas.height = 64
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#' + fallbackColor.toString(16).padStart(6, '0')
            ctx.fillRect(0, 0, 64, 64)
            const fallbackTexture = new THREE.CanvasTexture(canvas)
            this.cache.set(cacheKey, fallbackTexture)
            return fallbackTexture
          }
          return null
        }
      }
    }
  }

  async preload(manifest) {
    const promises = manifest.map(({ url, key }) => this.loadTexture(url, key))
    const results = await Promise.allSettled(promises)
    const loaded = {}
    results.forEach((r, i) => {
      loaded[manifest[i].key] = r.status === 'fulfilled' ? r.value : null
    })
    return loaded
  }

  get(key) {
    return this.cache.get(key) || null
  }
}

export const assetLoader = new AssetLoader()
