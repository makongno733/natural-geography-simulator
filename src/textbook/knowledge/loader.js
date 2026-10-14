import manifest from './data/manifest.json'

const loaders = {
  BX1: () => import('./data/BX1.json'),
  BX2: () => import('./data/BX2.json'),
  XB1: () => import('./data/XB1.json'),
  XB2: () => import('./data/XB2.json'),
  XB3: () => import('./data/XB3.json'),
}
const cache = new Map()
export { manifest }
export async function loadKnowledgeBook(code) {
  if (!loaders[code]) return null
  if (!cache.has(code)) cache.set(code, loaders[code]().then((mod) => mod.default))
  return cache.get(code)
}
export async function findKnowledgePoint(id) {
  const code = id?.match(/^KP-([A-Z]+\d)-/)?.[1]
  const book = await loadKnowledgeBook(code)
  return book?.points.find((point) => point.id === id) || null
}
export function knowledgeRoute({ book, chapter, point } = {}) {
  return { name: 'knowledge', query: Object.fromEntries(Object.entries({ book, chapter, point }).filter(([, value]) => value)) }
}
