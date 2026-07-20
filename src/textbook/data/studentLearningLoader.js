const importStudentLearning = () => import('./高中/必修第一册/student-learning.json')

export async function loadStudentLearning(
  gradeId,
  bookId,
  chapterId,
  sectionId,
  importer = importStudentLearning,
) {
  if (gradeId !== '高中' || bookId !== '必修第一册') return null

  try {
    const mod = await importer()
    const learning = mod.default || mod
    return learning[chapterId]?.[sectionId] || null
  } catch {
    return null
  }
}
