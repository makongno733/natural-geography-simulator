// 构建体积门禁：校验首页与教材静态入口的 gzip 总量，并确保静态依赖图不含 Three.js。
// 静态入口只递归遍历 manifest 的 `imports`，不把 `dynamicImports`（懒加载路由）计入初始路径。
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

export const HOME_ENTRY = 'index.html'
export const TEXTBOOK_ENTRY = 'src/textbook/SectionContent.vue'
export const HOME_BUDGET_BYTES = 153600 // 150 KB
export const TEXTBOOK_BUDGET_BYTES = 256000 // 250 KB

export function gzipSize(path) {
  return gzipSync(readFileSync(path)).length
}

export function collectStaticEntryGraph(manifest, entry) {
  const seen = new Set()
  const stack = [entry]
  while (stack.length) {
    const key = stack.pop()
    if (seen.has(key)) continue
    const chunk = manifest[key]
    if (!chunk) continue
    seen.add(key)
    for (const importKey of chunk.imports || []) {
      stack.push(importKey)
    }
  }
  return [...seen].sort()
}

function isThreeChunk(chunk) {
  if (!chunk) return false
  return chunk.name === 'vendor-three' || (chunk.file || '').includes('vendor-three')
}

function summarize(manifest, distDir, label, entry, graph, budget) {
  const chunks = []
  let totalBytes = 0
  let largest = null
  let containsThree = false

  for (const key of graph) {
    const chunk = manifest[key]
    if (!chunk || !chunk.file) continue
    const filePath = join(distDir, chunk.file)
    if (!existsSync(filePath)) {
      chunks.push({ key, file: chunk.file, bytes: 0, missing: true })
      continue
    }
    const bytes = gzipSize(filePath)
    totalBytes += bytes
    chunks.push({ key, file: chunk.file, bytes })
    if (!largest || bytes > largest.bytes) largest = { key, file: chunk.file, bytes }
    if (isThreeChunk(chunk)) containsThree = true
  }

  const errors = []
  if (containsThree) {
    errors.push(`${label}静态入口依赖图包含 Three.js（vendor-three），必须改为动态导入。`)
  }
  if (totalBytes > budget) {
    errors.push(`${label}静态入口 gzip 总量 ${totalBytes} bytes 超过预算 ${budget} bytes。最大块：${largest ? `${largest.file}（${largest.bytes} bytes）` : '无'}`)
  }

  return {
    entry,
    totalBytes,
    budget,
    chunkCount: chunks.length,
    containsThree,
    largestChunk: largest,
    chunks,
    errors,
  }
}

export function checkBundleBudgets(distDir, options = {}) {
  const manifestPath = join(distDir, '.vite', 'manifest.json')
  if (!existsSync(manifestPath)) {
    return {
      ok: false,
      errors: [`缺少构建 manifest：${manifestPath}。请先运行 pnpm build。`],
      home: null,
      textbook: null,
    }
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const homeEntry = options.homeEntry || HOME_ENTRY
  const textbookEntry = options.textbookEntry || TEXTBOOK_ENTRY
  const homeBudget = options.homeBudget ?? HOME_BUDGET_BYTES
  const textbookBudget = options.textbookBudget ?? TEXTBOOK_BUDGET_BYTES

  const home = summarize(manifest, distDir, '首页', homeEntry, collectStaticEntryGraph(manifest, homeEntry), homeBudget)
  const textbook = summarize(manifest, distDir, '教材', textbookEntry, collectStaticEntryGraph(manifest, textbookEntry), textbookBudget)

  const errors = [...home.errors, ...textbook.errors]
  return { ok: errors.length === 0, errors, home, textbook }
}

// CLI entry: `node scripts/check-bundle-budget.mjs dist`
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const distDir = process.argv[2] || 'dist'
  const result = checkBundleBudgets(distDir)
  if (result.home) {
    console.log(`首页静态入口：${result.home.totalBytes} bytes gzip（预算 ${result.home.budget}），${result.home.chunkCount} 块，含 Three.js：${result.home.containsThree}`)
  }
  if (result.textbook) {
    console.log(`教材静态入口：${result.textbook.totalBytes} bytes gzip（预算 ${result.textbook.budget}），${result.textbook.chunkCount} 块，含 Three.js：${result.textbook.containsThree}`)
  }
  if (result.errors.length) {
    for (const error of result.errors) console.error(`[bundle-budget] ${error}`)
    process.exit(1)
  }
  console.log('bundle budget check passed')
}
