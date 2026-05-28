import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve('src/textbook/data')

async function main() {
  const files = await walk(ROOT)
  let touchedFiles = 0
  let fixedDuplicatedTemplate = 0
  let fixedAbnormalNumbering = 0
  let fixedEmptyTopicQuote = 0

  for (const file of files) {
    if (!file.endsWith('.json')) continue

    const raw = await fs.readFile(file, 'utf8')
    let json
    try {
      json = JSON.parse(raw)
    } catch {
      continue
    }

    const result = fixNode(json)
    fixedDuplicatedTemplate += result.fixedDuplicatedTemplate
    fixedAbnormalNumbering += result.fixedAbnormalNumbering
    fixedEmptyTopicQuote += result.fixedEmptyTopicQuote

    if (result.changed) {
      touchedFiles += 1
      await fs.writeFile(file, JSON.stringify(result.value, null, 2) + '\n', 'utf8')
    }
  }

  console.log(`updated files: ${touchedFiles}`)
  console.log(`fixed duplicated_template_sentence: ${fixedDuplicatedTemplate}`)
  console.log(`fixed abnormal_multilevel_numbering: ${fixedAbnormalNumbering}`)
  console.log(`fixed empty_topic_quote: ${fixedEmptyTopicQuote}`)
}

function fixNode(node) {
  if (Array.isArray(node)) {
    let changed = false
    let fixedDuplicatedTemplate = 0
    let fixedAbnormalNumbering = 0
    let fixedEmptyTopicQuote = 0

    const value = node.map((item) => {
      const r = fixNode(item)
      changed ||= r.changed
      fixedDuplicatedTemplate += r.fixedDuplicatedTemplate
      fixedAbnormalNumbering += r.fixedAbnormalNumbering
      fixedEmptyTopicQuote += r.fixedEmptyTopicQuote
      return r.value
    })

    return { value, changed, fixedDuplicatedTemplate, fixedAbnormalNumbering, fixedEmptyTopicQuote }
  }

  if (node && typeof node === 'object') {
    let changed = false
    let fixedDuplicatedTemplate = 0
    let fixedAbnormalNumbering = 0
    let fixedEmptyTopicQuote = 0
    const out = {}

    for (const [key, value] of Object.entries(node)) {
      if (key === 'body' && typeof value === 'string') {
        const fixed = fixBody(value)
        out[key] = fixed.value
        changed ||= fixed.changed
        fixedDuplicatedTemplate += fixed.fixedDuplicatedTemplate
        fixedAbnormalNumbering += fixed.fixedAbnormalNumbering
        fixedEmptyTopicQuote += fixed.fixedEmptyTopicQuote
      } else {
        const r = fixNode(value)
        out[key] = r.value
        changed ||= r.changed
        fixedDuplicatedTemplate += r.fixedDuplicatedTemplate
        fixedAbnormalNumbering += r.fixedAbnormalNumbering
        fixedEmptyTopicQuote += r.fixedEmptyTopicQuote
      }
    }

    return { value: out, changed, fixedDuplicatedTemplate, fixedAbnormalNumbering, fixedEmptyTopicQuote }
  }

  return { value: node, changed: false, fixedDuplicatedTemplate: 0, fixedAbnormalNumbering: 0, fixedEmptyTopicQuote: 0 }
}

function fixBody(body) {
  const input = String(body || '')
  const lines = input.split('\n')
  let changed = false
  let fixedDuplicatedTemplate = 0
  let fixedAbnormalNumbering = 0
  let fixedEmptyTopicQuote = 0

  const value = lines.map((line) => {
    let nextLine = line

    const t0 = removeEmptyTopicQuoteLine(nextLine)
    if (t0.changed) {
      nextLine = t0.value
      fixedEmptyTopicQuote += 1
      changed = true
    }

    const t1 = collapseDuplicatedTemplateSentence(nextLine)
    if (t1.changed) {
      nextLine = t1.value
      fixedDuplicatedTemplate += 1
      changed = true
    }

    const t2 = normalizeAbnormalMultilevelNumbering(nextLine)
    if (t2.changed) {
      nextLine = t2.value
      fixedAbnormalNumbering += 1
      changed = true
    }

    return nextLine
  }).filter((line, index, arr) => {
    if (line.trim()) return true
    const prevBlank = index > 0 && !arr[index - 1].trim()
    return !prevBlank
  }).join('\n')

  return { value, changed, fixedDuplicatedTemplate, fixedAbnormalNumbering, fixedEmptyTopicQuote }
}

function removeEmptyTopicQuoteLine(line) {
  if (!/围绕[“"]\s*[”"]/.test(line)) return { value: line, changed: false }
  return { value: '', changed: true }
}

function collapseDuplicatedTemplateSentence(line) {
  const phrase = '可按“概念界定—成因机制—案例验证—应用迁移”四步展开讲解。'
  if (!line.includes(phrase)) return { value: line, changed: false }

  const count = (line.match(new RegExp(escapeRegExp(phrase), 'g')) || []).length
  if (count <= 1) return { value: line, changed: false }

  const head = line.split(phrase)[0]
  const cleanedHead = head
    .replace(/[，,。;；\s]+$/g, '')
    .trim()

  const value = cleanedHead ? `${cleanedHead}，${phrase}` : phrase
  return { value, changed: true }
}

function normalizeAbnormalMultilevelNumbering(line) {
  const trimmed = line.trimStart()
  const leadingSpace = line.slice(0, line.length - trimmed.length)

  const match = trimmed.match(/^((?:\d+\.\s*){2,})(.+)$/)
  if (!match) return { value: line, changed: false }

  const first = match[1].match(/\d+\./)?.[0]
  if (!first) return { value: line, changed: false }

  const rest = match[2].trim()
  const value = `${leadingSpace}${first} ${rest}`.replace(/\s+/g, ' ').replace(/^\s+/, leadingSpace)
  return { value, changed: true }
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
