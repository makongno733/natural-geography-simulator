import { describe, expect, it } from 'vitest'
import { loadFigureAssets } from './loader.js'

const CONTENT_LOADERS = {
  '必修第一册': () => import('../高中/必修第一册/content.json'),
  '必修第二册': () => import('../高中/必修第二册/content.json'),
  '选择性必修1': () => import('../高中/选择性必修1/content.json'),
  '选择性必修2': () => import('../高中/选择性必修2/content.json'),
  '选择性必修3': () => import('../高中/选择性必修3/content.json'),
}

function collectFigureKeys(content) {
  const keys = []
  const visit = (node) => {
    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node.figures)) {
      for (const figure of node.figures) {
        for (const image of figure.images || []) keys.push(image)
      }
    }
    for (const value of Object.values(node)) visit(value)
  }
  visit(content)
  return keys
}

describe('per-book figure asset loader', () => {
  it('loads only the requested book manifest and caches it', async () => {
    const first = await loadFigureAssets('高中', '必修第一册')
    const second = await loadFigureAssets('高中', '必修第一册')
    expect(first).toBe(second)
    expect(first['water-cycle']).toMatch(/water-cycle/)
    expect(first['world-pop-density']).toBeUndefined()
  })

  it('returns an empty frozen map for books without figures', async () => {
    expect(await loadFigureAssets('初中', '七年级上册')).toEqual({})
  })

  it('resolves every figure key referenced by each book content.json', async () => {
    for (const book of Object.keys(CONTENT_LOADERS)) {
      const manifest = await loadFigureAssets('高中', book)
      const content = (await CONTENT_LOADERS[book]()).default
      const keys = collectFigureKeys(content)
      const missing = keys.filter((key) => !(key in manifest))
      expect(missing).toEqual([])
      expect(keys.length).toBeGreaterThan(0)
    }
  })
})
