import { describe, expect, it } from 'vitest'
import manifest from '../data/manifest.json'
import { buildExperimentRoute } from '../../../experiments/catalog.js'
import { curriculumFigures } from './catalog.js'
import { curriculumInteractions } from '../interactions/catalog.js'
import { illustrativeEmissions, shadowLength } from '../interactions/models.js'

describe('教材图解与课堂推演', () => {
  it('35 项图解与 20 项交互构想都指向现存知识点，ID 唯一', () => {
    expect(curriculumFigures).toHaveLength(35)
    expect(curriculumInteractions).toHaveLength(20)
    expect(new Set(curriculumFigures.map((item) => item.id)).size).toBe(35)
    expect(new Set(curriculumInteractions.map((item) => item.id)).size).toBe(20)
    for (const item of [...curriculumFigures, ...curriculumInteractions]) expect(manifest.pointIndex[item.point], item.id).toBeTruthy()
    for (const item of curriculumFigures) {
      expect(item.labels.length, item.id).toBeGreaterThanOrEqual(3)
      expect(item.title, item.id).toBeTruthy()
    }
  })

  it('每项推演有可切换的不同情境，已有实验入口有效', () => {
    for (const item of curriculumInteractions) {
      expect(item.choices.length, item.id).toBeGreaterThanOrEqual(3)
      expect(new Set(item.choices.map((choice) => choice.result)).size, item.id).toBe(item.choices.length)
      expect(item.limitation, item.id).toBeTruthy()
      if (item.link) expect(buildExperimentRoute({ experimentId: item.link[0], presetId: item.link[1] }), item.id).toBeTruthy()
    }
  })

  it('日照几何与假设排放算术有边界检查', () => {
    expect(shadowLength(30, 45)).toBeCloseTo(30)
    expect(shadowLength(30, 30)).toBeCloseTo(51.9615, 3)
    expect(shadowLength(30, 0)).toBeNull()
    expect(illustrativeEmissions(100, 20, 30)).toBeCloseTo(56)
    expect(illustrativeEmissions(100, 120, 30)).toBeNull()
  })
})
