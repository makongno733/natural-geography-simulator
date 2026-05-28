export function normalizeEscapedNewlines(text) {
  return String(text || '')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
}

export function normalizeLectureSection(markdownText) {
  const text = String(markdownText || '')
  if (!text.includes('## 课堂讲解展开')) return text

  const lines = text.split('\n')
  const output = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() !== '## 课堂讲解展开') {
      output.push(line)
      i += 1
      continue
    }

    output.push('## 课堂讲解展开')
    i += 1
    const sectionLines = []
    while (i < lines.length && !/^##\s+/.test(lines[i].trim())) {
      sectionLines.push(lines[i])
      i += 1
    }

    const topics = extractLectureTopics(sectionLines)
    if (topics.length) {
      for (const [index, topic] of topics.entries()) {
        output.push(`${index + 1}. 围绕“${topic}”，按“概念界定—成因机制—案例验证—应用迁移”四步展开。`)
      }
    } else {
      output.push('1. 围绕“本节核心概念与基本特征”，按“概念界定—成因机制—案例验证—应用迁移”四步展开。')
      output.push('2. 围绕“图表判读与地理过程解释”，按“概念界定—成因机制—案例验证—应用迁移”四步展开。')
      output.push('3. 围绕“区域案例迁移与综合判断”，按“概念界定—成因机制—案例验证—应用迁移”四步展开。')
    }
  }

  return output.join('\n')
}

export function extractLectureTopics(lines) {
  const dedup = new Set()
  const topics = []

  for (const raw of lines) {
    const line = String(raw || '').trim()
    if (!line) continue

    const quoted = [...line.matchAll(/“([^”]{1,120})”/g)].map((m) => cleanTopic(m[1]))
    if (quoted.length) {
      for (const item of quoted) {
        if (isValidTopic(item) && !dedup.has(item)) {
          dedup.add(item)
          topics.push(item)
        }
      }
      continue
    }

    const cleaned = cleanTopic(line.replace(/^[-*\d.\s]+/, '').replace(/^围绕/, ''))
    if (isValidTopic(cleaned) && !dedup.has(cleaned)) {
      dedup.add(cleaned)
      topics.push(cleaned)
    }
  }

  return topics.slice(0, 8)
}

export function cleanTopic(text) {
  return String(text || '')
    .replace(/^[“"'`-]+/, '')
    .replace(/[”"'`]+$/, '')
    .replace(/^围绕/, '')
    .replace(/^[-*.\d\s]+/, '')
    .replace(/可按“概念界定—成因机制—案例验证—应用迁移”四步展开讲解。?/g, '')
    .replace(/建议按“概念界定—成因机制—空间分异—现实应用”四步展开。?/g, '')
    .replace(/先指出该知识在本章中的位置.*$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isValidTopic(text) {
  if (!text) return false
  if (text.length < 6 || text.length > 90) return false
  if (/^##/.test(text)) return false
  if (/^[-*]/.test(text)) return false
  if (/课堂讲解展开|学习目标（精读）/.test(text)) return false
  if (/^围绕/.test(text)) return false
  return true
}
