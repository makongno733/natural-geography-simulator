/**
 * Content loader for textbook sections.
 * Falls back to embedded data for placeholder content,
 * loads from external JSON for universities-level content.
 */

const contentCache = {}

export async function loadSectionContent(gradeId, bookId, chapterId, sectionId) {
  // Only use external content for 大学 level
  if (gradeId !== '大学') return null

  const key = `${gradeId}/${bookId}`
  if (!contentCache[key]) {
    try {
      const mod = await import(`./${gradeId}/${bookId}/index.json`)
      contentCache[key] = mod.default || mod
    } catch {
      contentCache[key] = {}
    }
  }

  const bookContent = contentCache[key]
  return bookContent[chapterId]?.[sectionId] || null
}
