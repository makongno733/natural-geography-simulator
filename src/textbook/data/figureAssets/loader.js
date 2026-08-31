// 教材图例按册懒加载 — 只加载当前册的图片清单，避免首页/教材页一次引入全部 366 张图片。
const LOADERS = {
  '高中/必修第一册': () => import('./必修第一册.js'),
  '高中/必修第二册': () => import('./必修第二册.js'),
  '高中/选择性必修1': () => import('./选择性必修1.js'),
  '高中/选择性必修2': () => import('./选择性必修2.js'),
  '高中/选择性必修3': () => import('./选择性必修3.js'),
}

const EMPTY_MANIFEST = Object.freeze({})
const cache = new Map()

export function loadFigureAssets(grade, book) {
  const key = `${grade}/${book}`
  const loader = LOADERS[key]
  if (!loader) return Promise.resolve(EMPTY_MANIFEST)

  if (cache.has(key)) return cache.get(key)

  const pending = Promise.resolve()
    .then(loader)
    .then((module) => module.default || module)
  cache.set(key, pending)
  pending.catch(() => cache.delete(key))
  return pending
}

export function resetFigureAssetsCache() {
  cache.clear()
}
