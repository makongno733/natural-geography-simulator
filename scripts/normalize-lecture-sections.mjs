import fs from 'node:fs/promises'
import path from 'node:path'
import { normalizeEscapedNewlines, normalizeLectureSection } from '../src/textbook/utils/lectureNormalization.js'

const ROOT = path.resolve('src/textbook/data')

async function main() {
  const files = await walk(ROOT)
  let touched = 0

  for (const file of files) {
    if (!file.endsWith('.json')) continue

    const raw = await fs.readFile(file, 'utf8')
    let json
    try {
      json = JSON.parse(raw)
    } catch {
      continue
    }

    const next = normalizeAny(json)
    if (next.changed) {
      await fs.writeFile(file, JSON.stringify(next.value, null, 2) + '\n', 'utf8')
      touched += 1
    }
  }

  console.log(`normalized lecture sections in ${touched} json files`)
}

function normalizeAny(node) {
  if (Array.isArray(node)) {
    let changed = false
    const out = node.map((item) => {
      const result = normalizeAny(item)
      if (result.changed) changed = true
      return result.value
    })
    return { value: out, changed }
  }

  if (node && typeof node === 'object') {
    let changed = false
    const out = {}

    for (const [key, value] of Object.entries(node)) {
      if (key === 'body' && typeof value === 'string') {
        const normalized = normalizeLectureSection(normalizeEscapedNewlines(value))
        out[key] = normalized
        if (normalized !== value) changed = true
        continue
      }

      const result = normalizeAny(value)
      out[key] = result.value
      if (result.changed) changed = true
    }

    return { value: out, changed }
  }

  return { value: node, changed: false }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const out = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...(await walk(fullPath)))
    } else {
      out.push(fullPath)
    }
  }

  return out
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
