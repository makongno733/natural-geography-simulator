import { getExperiment, getExperimentPreset } from '../../experiments/catalog.js'
import { grades } from './index.js'

const KEY_PARTS = ['grade', 'book', 'chapter', 'section']

// These defaults deliberately use curriculum identifiers, never section-title matching.
const CHAPTER_DEFAULTS = {
  '初中|七年级上册|第一章': ['earth-system', 'globe-basics'],
  '初中|七年级上册|第二章': ['map-projection', 'map-reading'],
  '初中|七年级上册|第三章': ['earth-system', 'continents-oceans'],
  '初中|七年级下册|第七章': ['earth-system', 'regional-environment'],
  '初中|七年级下册|第八章': ['spatial-network', 'regional-connections'],
  '初中|七年级下册|第九章': ['spatial-network', 'regional-connections'],
  '初中|八年级上册|第一章': ['spatial-network', 'population-distribution'],
  '初中|八年级上册|第二章': ['earth-system', 'china-natural-environment'],
  '初中|八年级上册|第三章': ['human-environment', 'resource-system'],
  '初中|八年级下册|第六章': ['map-projection', 'regional-division'],
  '初中|八年级下册|第七章': ['spatial-network', 'regional-development'],
  '高中|必修第一册|第一章': ['earth-system', 'cosmic-earth'],
  '高中|必修第一册|第二章': ['atmosphere-system', 'atmosphere-process'],
  '高中|必修第一册|第三章': ['water-cycle-3d', 'water-cycle'],
  '高中|必修第一册|第四章': ['landform-sandbox', 'landform-process'],
  '高中|必修第一册|第五章': ['soil-profile-3d', 'vegetation-soil'],
  '高中|必修第一册|第六章': ['disaster-sandbox', 'natural-hazards'],
  '高中|必修第二册|第一章': ['spatial-network', 'population-system'],
  '高中|必修第二册|第二章': ['spatial-network', 'urban-system'],
  '高中|必修第二册|第三章': ['spatial-network', 'industry-location'],
  '高中|必修第二册|第四章': ['spatial-network', 'transport-network'],
  '高中|必修第二册|第五章': ['human-environment', 'sustainable-development'],
  '高中|选择性必修1|第一章': ['seasons', 'earth-motion'],
  '高中|选择性必修1|第二章': ['fault-model', 'surface-process'],
  '高中|选择性必修1|第三章': ['thermal-circulation', 'atmospheric-circulation'],
  '高中|选择性必修1|第四章': ['water-cycle-3d', 'water-movement'],
  '高中|选择性必修1|第五章': ['human-environment', 'natural-zonation'],
  '高中|选择性必修2|第一章': ['spatial-network', 'regional-system'],
  '高中|选择性必修2|第二章': ['human-environment', 'regional-resource'],
  '高中|选择性必修2|第三章': ['spatial-network', 'city-industry-region'],
  '高中|选择性必修2|第四章': ['spatial-network', 'regional-coordination'],
  '高中|选择性必修3|第一章': ['human-environment', 'ecosystem-services'],
  '高中|选择性必修3|第二章': ['human-environment', 'resource-security'],
  '高中|选择性必修3|第三章': ['human-environment', 'environmental-security'],
  '高中|选择性必修3|第四章': ['human-environment', 'environmental-governance'],
}

const SECTION_OVERRIDES = {
  '初中|七年级上册|第一章|第三节': {
    primary: ['seasons', 'earth-motion'], related: [['solar-motion', 'default']],
  },
  '初中|七年级上册|第三章|第二节': {
    primary: ['landform-sandbox', 'landform-process'], related: [['stream-table', 'default']],
  },
  '初中|八年级上册|第二章|第一节': {
    primary: ['landform-sandbox', 'landform-process'], related: [['stream-table', 'default']],
  },
  '初中|八年级上册|第二章|第二节': {
    primary: ['atmosphere-system', 'atmosphere-process'], related: [['thermal-circulation', 'atmospheric-circulation']],
  },
  '初中|八年级上册|第二章|第三节': {
    primary: ['stream-table', 'default'], related: [['water-cycle-3d', 'water-cycle']],
  },
  '高中|必修第一册|第一章|第三节': {
    primary: ['geologic-time', 'default'], related: [['stratigraphy', 'default']],
  },
  '高中|必修第一册|第二章|第二节': {
    primary: ['thermal-circulation', 'atmospheric-circulation'], related: [['coriolis', 'default']],
  },
  '高中|必修第一册|第三章|第一节': {
    primary: ['water-cycle-3d', 'water-cycle'], related: [['water-cycle', 'default']],
  },
  '高中|必修第一册|第三章|第三节': {
    primary: ['water-cycle-3d', 'water-movement'], related: [['water-cycle', 'default']],
  },
  '高中|必修第一册|第四章|第一节': {
    primary: ['landform-sandbox', 'landform-process'], related: [['stream-table', 'default']],
  },
  '高中|必修第一册|第四章|第二节': {
    primary: ['landform-sandbox', 'landform-process'], related: [['stream-table', 'default']],
  },
  '高中|必修第一册|第六章|第一节': {
    primary: ['disaster-sandbox', 'natural-hazards'], related: [['thermal-circulation', 'atmospheric-circulation']],
  },
  '高中|必修第一册|第六章|第二节': {
    primary: ['disaster-sandbox', 'natural-hazards'], related: [['fault-model', 'default']],
  },
  '高中|选择性必修1|第一章|第一节': {
    primary: ['seasons', 'earth-motion'], related: [['solar-motion', 'default']],
  },
  '高中|选择性必修1|第一章|第二节': {
    primary: ['solar-motion', 'default'], related: [['seasons', 'earth-motion']],
  },
  '高中|选择性必修1|第二章|第二节': {
    primary: ['fault-model', 'default'], related: [['stratigraphy', 'default']],
  },
  '高中|选择性必修1|第二章|第三节': {
    primary: ['stream-table', 'default'], related: [['sediment-transport', 'default']],
  },
  '高中|选择性必修1|第二章|问题研究': {
    primary: ['stream-table', 'default'], related: [['sediment-transport', 'default']],
  },
  '高中|选择性必修1|第三章|第一节': {
    primary: ['thermal-circulation', 'atmospheric-circulation'], related: [['coriolis', 'default']],
  },
  '高中|选择性必修1|第三章|第二节': {
    primary: ['thermal-circulation', 'atmospheric-circulation'], related: [['coriolis', 'default']],
  },
  '高中|选择性必修1|第四章|第一节': {
    primary: ['groundwater', 'default'], related: [['water-cycle-3d', 'water-cycle']],
  },
  '高中|选择性必修1|第四章|第二节': {
    primary: ['water-cycle-3d', 'water-movement'], related: [['water-cycle', 'default']],
  },
}

export function textbookKey(context) {
  if (!context || KEY_PARTS.some(part => !context[part])) return null
  return KEY_PARTS.map(part => context[part]).join('|')
}

function chapterKey(context) {
  if (!context || KEY_PARTS.slice(0, 3).some(part => !context[part])) return null
  return KEY_PARTS.slice(0, 3).map(part => context[part]).join('|')
}

function experimentReference([experimentId, presetId]) {
  const experiment = getExperiment(experimentId)
  const preset = getExperimentPreset(experimentId, presetId)

  return Object.freeze({
    experimentId,
    presetId,
    title: preset?.title || experiment?.name || experimentId,
    purpose: preset?.purpose || '',
  })
}

function createLink(primary, related = []) {
  return Object.freeze({
    confidence: 'curated',
    primary: experimentReference(primary),
    related: Object.freeze(related.slice(0, 2).map(experimentReference)),
  })
}

function sectionsFor(grades) {
  return grades
    .filter(grade => grade.id === '初中' || grade.id === '高中')
    .flatMap(grade => grade.books.flatMap(book => book.chapters.flatMap(chapter => chapter.sections.map(section => Object.freeze({
      grade: grade.id,
      book: book.id,
      chapter: chapter.id,
      section: section.id,
      gradeTitle: grade.title,
      bookTitle: book.title,
      chapterTitle: chapter.title,
      sectionTitle: section.title,
    })))))
}

function buildRegistry(grades) {
  const entries = []

  for (const context of sectionsFor(grades)) {
    const key = textbookKey(context)
    const override = SECTION_OVERRIDES[key]
    const chapterDefault = CHAPTER_DEFAULTS[chapterKey(context)]
    const config = override || (chapterDefault ? { primary: chapterDefault } : null)
    if (!config) continue

    entries.push(Object.freeze({ key, context, link: createLink(config.primary, config.related) }))
  }

  return Object.freeze(entries)
}

function countDuplicates(entries) {
  const counts = new Map()
  for (const { key } of entries) counts.set(key, (counts.get(key) || 0) + 1)
  return [...counts].filter(([, count]) => count > 1).map(([key]) => key).sort()
}

function validateReferences(entries) {
  const invalidExperiments = []
  const invalidPresets = []

  for (const { key, link } of entries) {
    for (const reference of [link.primary, ...link.related]) {
      if (!getExperiment(reference.experimentId)) {
        invalidExperiments.push({ key, experimentId: reference.experimentId })
      } else if (!getExperimentPreset(reference.experimentId, reference.presetId)) {
        invalidPresets.push({ key, experimentId: reference.experimentId, presetId: reference.presetId })
      }
    }
  }

  return { invalidExperiments, invalidPresets }
}

export function getSectionExperimentLink(context) {
  const key = textbookKey(context)
  return key ? registryByKey.get(key) || null : null
}

export function getTextbooksForExperiment(id) {
  return registryEntries
    .filter(({ link }) => link.primary.experimentId === id || link.related.some(reference => reference.experimentId === id))
    .map(({ context }) => context)
}

export function auditExperimentCoverage(grades) {
  const curriculumSections = sectionsFor(grades)
  const curriculumKeys = new Set(curriculumSections.map(textbookKey))
  const entries = buildRegistry(grades)
  const linksByKey = new Map(entries.map(({ key, link }) => [key, link]))
  const { invalidExperiments, invalidPresets } = validateReferences(entries)
  const uncovered = curriculumSections
    .filter(context => !linksByKey.has(textbookKey(context)))
    .map(textbookKey)
    .sort()
  const orphanKeys = entries
    .map(({ key }) => key)
    .filter(key => !curriculumKeys.has(key))
    .sort()
  const curated = curriculumSections.filter(context => linksByKey.get(textbookKey(context))?.confidence === 'curated').length

  return Object.freeze({
    total: curriculumSections.length,
    curated,
    coverage: curriculumSections.length ? curated / curriculumSections.length : 0,
    uncovered,
    invalidExperiments,
    invalidPresets,
    duplicateKeys: countDuplicates(entries),
    orphanKeys,
  })
}

const registryEntries = buildRegistry(grades)
const registryByKey = new Map(registryEntries.map(({ key, link }) => [key, Object.freeze(link)]))

export const textbookExperimentLinks = Object.freeze(Object.fromEntries(registryEntries.map(({ key, link }) => [key, link])))
