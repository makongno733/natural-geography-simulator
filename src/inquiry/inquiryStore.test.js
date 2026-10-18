import { describe, it, expect, beforeEach } from 'vitest'
import {
  inquiryState,
  initInquiryStore,
  getCurrentDraft,
  addEvidenceCard,
  removeEvidenceCard,
  createVersionSnapshot,
  submitCurrentInquiry,
  saveTeacherReview,
  loadExemplaryDraft,
  exportReportAsMarkdown,
  exportReportAsHtml
} from './inquiryStore.js'
import { INQUIRY_TASKS, RUBRIC_DIMENSIONS } from './inquiryData.js'

describe('Inquiry Store and Data Hub', () => {
  beforeEach(() => {
    inquiryState.activeTaskId = 'urban-flood'
    initInquiryStore()
  })

  it('contains three well-defined flagship inquiry tasks', () => {
    expect(INQUIRY_TASKS.length).toBe(3)
    const taskIds = INQUIRY_TASKS.map(t => t.id)
    expect(taskIds).toContain('urban-flood')
    expect(taskIds).toContain('landscape-variation')
    expect(taskIds).toContain('human-environment-decision')
  })

  it('contains seven rubric dimensions with complete 4-level scales', () => {
    expect(RUBRIC_DIMENSIONS.length).toBe(7)
    for (const dim of RUBRIC_DIMENSIONS) {
      expect(dim.levels.length).toBe(4)
      expect(dim.weight).toBeGreaterThan(0)
    }
  })

  it('initializes a default draft with essential scientific inquiry steps', () => {
    const draft = getCurrentDraft()
    expect(draft.taskId).toBe('urban-flood')
    expect(draft.status).toBe('draft')
    expect(Array.isArray(draft.evidenceCards)).toBe(true)
    expect(draft.versionCount).toBe(1)
  })

  it('allows adding and removing evidence cards with observation and inference distinction', () => {
    const card = addEvidenceCard({
      title: '透水路面试验',
      params: { rain: 50, surface: 'sponge' },
      observation: '积水深度5mm',
      inference: '大部分雨水通过孔隙下渗至碎石垫层',
      confidence: 4,
      source: '降雨径流模拟'
    })

    expect(card.id).toBeDefined()
    expect(card.observation).toBe('积水深度5mm')
    expect(card.inference).toContain('下渗')

    const draft = getCurrentDraft()
    expect(draft.evidenceCards.length).toBeGreaterThan(0)

    removeEvidenceCard(card.id)
    expect(draft.evidenceCards.find(c => c.id === card.id)).toBeUndefined()
  })

  it('tracks version snapshots when hypothesis and conclusions are revised', () => {
    const draft = getCurrentDraft()
    draft.initialHypothesis = '原猜想：只要管子够粗，就不会内涝'
    draft.revisedConclusion = '修订结论：必须结合源头透水铺装与下渗'

    const snapshot = createVersionSnapshot('测试版本更新')
    expect(snapshot.versionNum).toBeGreaterThan(0)
    expect(snapshot.initialHypothesis).toBe('原猜想：只要管子够粗，就不会内涝')
    expect(snapshot.revisedConclusion).toContain('源头透水铺装')
  })

  it('submits inquiry and records teacher evaluation with weighted rubric scores', async () => {
    const res = await submitCurrentInquiry()
    expect(res.ok).toBe(true)
    const draft = getCurrentDraft()
    expect(draft.isSubmitted).toBe(true)

    const review = await saveTeacherReview('urban-flood', {
      teacherName: '张老师',
      scores: {
        questionQuality: 4,
        variableControl: 4,
        evidenceReliability: 3,
        causalExplanation: 4,
        counterExampleAwareness: 3,
        tradeOffBalance: 3,
        reflectionRevision: 4
      },
      feedbackComment: '变量控制十分严密，成功指出了极端特大暴雨下垫层饱和的模型局限。',
      isShowcased: true
    })

    expect(review.totalWeightedScore).toBeGreaterThan(80)
    expect(inquiryState.showcaseList.length).toBe(0)
  })

  it('loads exemplary data and generates printable reports', () => {
    loadExemplaryDraft('urban-flood')
    const draft = getCurrentDraft()
    expect(draft.evidenceCards.length).toBe(2)
    expect(draft.revisedConclusion).toContain('海绵城市')

    const md = exportReportAsMarkdown('urban-flood')
    expect(md).toContain('城市为什么会“看海”')
    expect(md).toContain('客观观察')
    expect(md).toContain('合理解释')

    const html = exportReportAsHtml('urban-flood')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('地理创新探究成果报告')
  })
})
