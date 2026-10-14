import { describe, expect, it } from 'vitest'
import { grades } from '../data/index.js'
import { findKnowledgePoint, loadKnowledgeBook, manifest } from './loader.js'

describe('教材知识库导入', () => {
  it('按册加载全部知识点，章节和网站课程映射有效', async () => {
    const books = await Promise.all(manifest.books.map((item) => loadKnowledgeBook(item.code)))
    const allPoints = books.flatMap((book) => book.points)
    const allChapters = books.flatMap((book) => book.chapters)
    expect(allPoints).toHaveLength(81)
    expect(allChapters).toHaveLength(89)
    expect(allChapters.filter((chapter) => chapter.site)).toHaveLength(88)
    expect(new Set(allPoints.map((point) => point.id)).size).toBe(81)
    const ids = new Set(allPoints.map((point) => point.id))
    const siteBooks = grades.find((grade) => grade.id === '高中').books
    for (const book of books) {
      for (const chapter of book.chapters) {
        for (const id of chapter.pointIds) expect(ids.has(id)).toBe(true)
        if (!chapter.site) continue
        const siteBook = siteBooks.find((item) => item.id === chapter.site.book)
        const siteChapter = siteBook?.chapters.find((item) => item.id === chapter.site.chapter)
        expect(siteChapter?.sections.some((item) => item.id === chapter.site.section)).toBe(true)
      }
      for (const edge of book.prerequisites) {
        expect(ids.has(edge.target_knowledge_point_id)).toBe(true)
        for (const id of edge.prerequisite_knowledge_point_ids) expect(ids.has(id)).toBe(true)
      }
    }
    expect(allPoints.every((point) => point.reviewStatus === '待教研复核')).toBe(true)
    expect((await findKnowledgePoint('KP-BX1-001'))?.name).toBe('天体与天体系统')
    expect((await findKnowledgePoint('KP-XB1-005'))?.cases).not.toContain('地转偏向力右偏影响，南岸')
    expect((await findKnowledgePoint('KP-BX1-006'))?.explanation).not.toContain('塑性熔融状态')
  })
})
