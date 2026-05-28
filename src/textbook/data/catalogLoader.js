let catalogModulePromise

async function loadCatalogModule() {
  if (!catalogModulePromise) {
    catalogModulePromise = import('./index.js')
  }
  return catalogModulePromise
}

export async function getGrades() {
  const mod = await loadCatalogModule()
  return mod.grades || []
}

export async function getGrade(gradeId) {
  const grades = await getGrades()
  return grades.find((grade) => grade.id === gradeId) || null
}

export async function getBook(gradeId, bookId) {
  const grade = await getGrade(gradeId)
  if (!grade) return null
  return grade.books.find((book) => book.id === bookId) || null
}

export async function getChapter(gradeId, bookId, chapterId) {
  const book = await getBook(gradeId, bookId)
  if (!book) return null
  return book.chapters.find((chapter) => chapter.id === chapterId) || null
}

export async function getSection(gradeId, bookId, chapterId, sectionId) {
  const chapter = await getChapter(gradeId, bookId, chapterId)
  if (!chapter) return null
  return chapter.sections.find((section) => section.id === sectionId) || null
}

export async function getCollegeRef(gradeId, bookId, chapterId, sectionId) {
  const college = await getGrade('大学')
  if (!college) return null

  for (const book of college.books) {
    for (const chapter of book.chapters) {
      for (const section of chapter.sections) {
        const ref = section.sourceRef
        if (
          ref &&
          ref.grade === gradeId &&
          ref.book === bookId &&
          ref.chapter === chapterId &&
          ref.section === sectionId
        ) {
          return {
            grade: '大学',
            book: book.id,
            chapter: chapter.id,
            section: section.id,
            sectionTitle: section.title,
            chapterTitle: chapter.title
          }
        }
      }
    }
  }

  return null
}
