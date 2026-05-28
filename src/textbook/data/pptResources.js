const BOOK_RULES = [
  { includes: ['必修第一册', '必修1', '必修一'], book: '必修第一册' },
  { includes: ['必修第二册', '必修2', '必修二'], book: '必修第二册' },
  { includes: ['选择性必修第一册', '选择性必修1'], book: '选择性必修1' },
  { includes: ['选择性必修第二册', '选择性必修2'], book: '选择性必修2' },
  { includes: ['选择性必修第三册', '选择性必修3'], book: '选择性必修3' }
]

const PPT_EXT_RE = /\.(ppt|pptx)$/i

let pptIndexCache = null
let indexLoaded = false

export async function loadPptIndex() {
  if (indexLoaded) return pptIndexCache || []

  try {
    const response = await fetch('/ppt-index.json', { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (Array.isArray(data)) {
      pptIndexCache = data.map((item, idx) => ({
        ...item,
        id: item.id || `remote-${idx}`,
        source: 'remote'
      }))
    } else {
      pptIndexCache = []
    }
  } catch {
    pptIndexCache = []
  }

  indexLoaded = true
  return pptIndexCache
}

export function parseLocalPptFolder(fileList) {
  const resources = []

  for (const file of Array.from(fileList || [])) {
    if (!PPT_EXT_RE.test(file.name)) continue

    const relPath = file.webkitRelativePath || file.name
    const mergedText = `${relPath} ${file.name}`
    const book = detectBook(mergedText)
    const chapterSection = extractChapterSection(mergedText)

    resources.push({
      id: `local-${resources.length}`,
      source: 'local',
      grade: '高中',
      file,
      relPath,
      fileName: file.name,
      book,
      chapterNum: chapterSection.chapterNum,
      sectionNum: chapterSection.sectionNum,
      chapterId: chapterSection.chapterNum ? `第${numberToChinese(chapterSection.chapterNum)}章` : null,
      sectionId: chapterSection.sectionNum ? `第${numberToChinese(chapterSection.sectionNum)}节` : null,
      title: cleanupTitle(file.name),
      size: file.size,
      mtime: new Date(file.lastModified).toISOString()
    })
  }

  return resources.sort((a, b) => {
    const aChap = a.chapterNum ?? 999
    const bChap = b.chapterNum ?? 999
    if (aChap !== bChap) return aChap - bChap
    const aSec = a.sectionNum ?? 999
    const bSec = b.sectionNum ?? 999
    if (aSec !== bSec) return aSec - bSec
    return a.title.localeCompare(b.title, 'zh-CN')
  })
}

export function matchPptResources(resources, context) {
  const chapterNum = extractNumFromLabel(context.chapterId, '章')
  const sectionNum = extractNumFromLabel(context.sectionId, '节')
  const { grade, book } = context

  const scoped = resources.filter((item) =>
    item.grade === grade &&
    (!book || item.book === book)
  )

  const exactSection = scoped.filter((item) =>
    item.chapterNum === chapterNum && item.sectionNum === sectionNum
  )

  if (exactSection.length > 0) {
    return { level: 'section', items: exactSection }
  }

  const chapterOnly = scoped.filter((item) =>
    item.chapterNum === chapterNum
  )

  if (chapterOnly.length > 0) {
    return { level: 'chapter', items: chapterOnly }
  }

  return { level: 'none', items: [] }
}

function detectBook(text) {
  for (const rule of BOOK_RULES) {
    if (rule.includes.some((key) => text.includes(key))) {
      return rule.book
    }
  }
  return null
}

function extractChapterSection(fileName) {
  const normalized = String(fileName || '')
    .replace(/[＋+]/g, ' ')
    .replace(/[（(【\[][^）)】\]]*[）)】\]]/g, ' ')
    .replace(/[：:]/g, ' ')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // 1) 明确“第X章 第Y节”
  const zhChapterSection = normalized.match(/第\s*([一二三四五六七八九十百零〇\d]{1,4})\s*章[^第]{0,24}第\s*([一二三四五六七八九十百零〇\d]{1,4})\s*节/)
  if (zhChapterSection) {
    return {
      chapterNum: toNumber(zhChapterSection[1]),
      sectionNum: toNumber(zhChapterSection[2])
    }
  }

  // 2) “X章 Y节”（不带第）
  const chapterSectionNoDi = normalized.match(/([一二三四五六七八九十百零〇\d]{1,4})\s*章[^节]{0,24}([一二三四五六七八九十百零〇\d]{1,4})\s*节/)
  if (chapterSectionNoDi) {
    return {
      chapterNum: toNumber(chapterSectionNoDi[1]),
      sectionNum: toNumber(chapterSectionNoDi[2])
    }
  }

  // 3) “第X章” + “第Y课/课时”兜底
  const chapterLesson = normalized.match(/第\s*([一二三四五六七八九十百零〇\d]{1,4})\s*章[^第]{0,24}第\s*([一二三四五六七八九十百零〇\d]{1,4})\s*(?:课|课时)/)
  if (chapterLesson) {
    return {
      chapterNum: toNumber(chapterLesson[1]),
      sectionNum: toNumber(chapterLesson[2])
    }
  }

  // 4) 数字格式：2.1 / 2．1 / 2-1 / 2_1
  const sectionMatch = normalized.match(/(\d{1,2})\s*[.．]\s*(\d{1,2})/)
  if (sectionMatch) {
    return {
      chapterNum: Number(sectionMatch[1]),
      sectionNum: Number(sectionMatch[2])
    }
  }
  const sectionMatchDash = normalized.match(/(?:^|\s)(\d{1,2})\s*[-_]\s*(\d{1,2})(?:\s|$)/)
  if (sectionMatchDash) {
    return {
      chapterNum: Number(sectionMatchDash[1]),
      sectionNum: Number(sectionMatchDash[2])
    }
  }
  const sectionMatchSpace = normalized.match(/(?:^|\s)(\d{1,2})\s+(\d{1,2})(?:\s|$)/)
  if (sectionMatchSpace) {
    return {
      chapterNum: Number(sectionMatchSpace[1]),
      sectionNum: Number(sectionMatchSpace[2])
    }
  }

  // 5) 只有章：第X章 / X章 / X.
  const chapterZhOnly = normalized.match(/第\s*([一二三四五六七八九十百零〇\d]{1,4})\s*章/)
  if (chapterZhOnly) {
    return {
      chapterNum: toNumber(chapterZhOnly[1]),
      sectionNum: null
    }
  }
  const chapterZhNoDiOnly = normalized.match(/(?:^|\s)([一二三四五六七八九十百零〇\d]{1,4})\s*章(?:\s|$)/)
  if (chapterZhNoDiOnly) {
    return {
      chapterNum: toNumber(chapterZhNoDiOnly[1]),
      sectionNum: null
    }
  }
  const chapterMatch = normalized.match(/(\d{1,2})\s*[.．]/)
  if (chapterMatch) {
    return {
      chapterNum: Number(chapterMatch[1]),
      sectionNum: null
    }
  }

  return { chapterNum: null, sectionNum: null }
}

function extractNumFromLabel(label, unit) {
  if (!label || typeof label !== 'string') return null
  const rawMatch = label.match(new RegExp(`第?([一二三四五六七八九十百零〇\d]+)${unit}`))
  if (!rawMatch) return null

  return toNumber(rawMatch[1])
}

function toNumber(text) {
  if (!text) return null
  if (/^\d+$/.test(text)) return Number(text)

  const map = {
    '零': 0,
    '〇': 0,
    '一': 1,
    '二': 2,
    '三': 3,
    '四': 4,
    '五': 5,
    '六': 6,
    '七': 7,
    '八': 8,
    '九': 9
  }

  if (text === '十') return 10

  if (text.includes('百')) {
    const [left, right] = text.split('百')
    const hundreds = left ? (map[left] ?? 0) : 1
    const rest = right ? toNumber(right) ?? 0 : 0
    return hundreds * 100 + rest
  }

  if (text.includes('十')) {
    const [left, right] = text.split('十')
    const tens = left ? (map[left] ?? 0) : 1
    const ones = right ? (map[right] ?? 0) : 0
    return tens * 10 + ones
  }

  return map[text] ?? null
}

function numberToChinese(num) {
  const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (!num || num < 0) return ''
  if (num <= 10) return num === 10 ? '十' : digits[num]
  if (num < 20) return `十${digits[num - 10]}`

  const tens = Math.floor(num / 10)
  const ones = num % 10
  return `${digits[tens]}十${ones ? digits[ones] : ''}`
}

function cleanupTitle(fileName) {
  return fileName
    .replace(PPT_EXT_RE, '')
    .replace(/[【】]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
