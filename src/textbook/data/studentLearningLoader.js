export async function loadStudentLearning(gradeId, bookId, chapterId, sectionId) {
  if (gradeId !== '高中' || bookId !== '必修第一册') return null

  const mod = await import('./高中/必修第一册/student-learning.json')
  const learning = mod.default || mod
  return learning[chapterId]?.[sectionId] || null
}
