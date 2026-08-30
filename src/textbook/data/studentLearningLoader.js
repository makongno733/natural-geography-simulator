const studentLearningImporters = {
  必修第一册: () => import('./高中/必修第一册/student-learning.json'),
  必修第二册: () => import('./高中/必修第二册/student-learning.json'),
}

export async function loadStudentLearning(
  gradeId,
  bookId,
  chapterId,
  sectionId,
  importer,
) {
  if (gradeId !== '高中') return null

  const resolveImporter = importer || studentLearningImporters[bookId]
  if (!resolveImporter) return null

  try {
    const mod = await resolveImporter()
    const learning = mod.default || mod
    return learning[chapterId]?.[sectionId] || null
  } catch {
    return null
  }
}
