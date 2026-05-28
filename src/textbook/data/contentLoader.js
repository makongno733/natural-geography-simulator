/**
 * Content loader for textbook sections.
 * Supports two formats:
 * - University (大学): per-section content in index.json
 * - Middle/High school: per-chapter content in content.json
 */
const contentCache = {}

export async function loadSectionContent(gradeId, bookId, chapterId, sectionId) {
  if (gradeId === '大学') {
    const key = `${gradeId}/${bookId}`
    if (!contentCache[key]) {
      try {
        const mod = await import(`./${gradeId}/${bookId}/index.json`)
        contentCache[key] = mod.default || mod
      } catch { contentCache[key] = {} }
    }
    return contentCache[key][chapterId]?.[sectionId] || null
  }

  // Middle/high school: load chapter-level content
  const key = `${gradeId}/${bookId}`
  if (!contentCache[key]) {
    try {
      const mod = await import(`./${gradeId}/${bookId}/content.json`)
      contentCache[key] = mod.default || mod
    } catch { contentCache[key] = {} }
  }
  return contentCache[key][chapterId] || null
}

export async function loadKeyPoints(gradeId, bookId, chapterId) {
  if (gradeId === '大学') return null
  const key = `${gradeId}/${bookId}`
  if (!contentCache[key]) {
    return loadSectionContent(gradeId, bookId, chapterId, null)
  }
  return contentCache[key][chapterId]?.keyPoints || null
}
