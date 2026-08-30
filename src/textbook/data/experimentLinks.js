import { getExperiment, getExperimentPreset } from '../../experiments/catalog.js'
import { grades } from './index.js'

const KEY_PARTS = ['grade', 'book', 'chapter', 'section']

// These defaults deliberately use curriculum identifiers, never section-title matching.
const chapterDefault = (key, primary) => Object.freeze({ key, primary: Object.freeze(primary) })
const sectionOverride = (key, primary, related = []) => Object.freeze({
  key, primary: Object.freeze(primary), related: Object.freeze(related.map(reference => Object.freeze(reference))),
})

// Arrays preserve the raw keys so audits can find duplicate configuration entries.
const CHAPTER_DEFAULTS = Object.freeze([
  chapterDefault('初中|七年级上册|第一章', ['earth-system', 'globe-basics']),
  chapterDefault('初中|七年级上册|第二章', ['map-projection', 'map-reading']),
  chapterDefault('初中|七年级上册|第三章', ['earth-system', 'continents-oceans']),
  chapterDefault('初中|七年级下册|第七章', ['earth-system', 'regional-environment']),
  chapterDefault('初中|七年级下册|第八章', ['spatial-network', 'regional-connections']),
  chapterDefault('初中|七年级下册|第九章', ['spatial-network', 'regional-connections']),
  chapterDefault('初中|八年级上册|第一章', ['spatial-network', 'population-distribution']),
  chapterDefault('初中|八年级上册|第二章', ['earth-system', 'china-natural-environment']),
  chapterDefault('初中|八年级上册|第三章', ['human-environment', 'resource-system']),
  chapterDefault('初中|八年级下册|第六章', ['map-projection', 'regional-division']),
  chapterDefault('初中|八年级下册|第七章', ['spatial-network', 'regional-development']),
  chapterDefault('高中|必修第一册|第一章', ['earth-system', 'cosmic-earth']),
  chapterDefault('高中|必修第一册|第二章', ['atmosphere-system', 'atmosphere-process']),
  chapterDefault('高中|必修第一册|第三章', ['water-cycle-3d', 'water-cycle']),
  chapterDefault('高中|必修第一册|第四章', ['landform-sandbox', 'landform-process']),
  chapterDefault('高中|必修第一册|第五章', ['soil-profile-3d', 'vegetation-soil']),
  chapterDefault('高中|必修第一册|第六章', ['disaster-sandbox', 'natural-hazards']),
  chapterDefault('高中|必修第二册|第一章', ['spatial-network', 'population-system']),
  chapterDefault('高中|必修第二册|第二章', ['spatial-network', 'urban-system']),
  chapterDefault('高中|必修第二册|第三章', ['spatial-network', 'industry-location']),
  chapterDefault('高中|必修第二册|第四章', ['spatial-network', 'transport-network']),
  chapterDefault('高中|必修第二册|第五章', ['human-environment', 'sustainable-development']),
  chapterDefault('高中|选择性必修1|第一章', ['seasons', 'earth-motion']),
  chapterDefault('高中|选择性必修1|第二章', ['fault-model', 'surface-process']),
  chapterDefault('高中|选择性必修1|第三章', ['thermal-circulation', 'atmospheric-circulation']),
  chapterDefault('高中|选择性必修1|第四章', ['water-cycle-3d', 'water-movement']),
  chapterDefault('高中|选择性必修1|第五章', ['human-environment', 'natural-zonation']),
  chapterDefault('高中|选择性必修2|第一章', ['spatial-network', 'regional-system']),
  chapterDefault('高中|选择性必修2|第二章', ['human-environment', 'regional-resource']),
  chapterDefault('高中|选择性必修2|第三章', ['spatial-network', 'city-industry-region']),
  chapterDefault('高中|选择性必修2|第四章', ['spatial-network', 'regional-coordination']),
  chapterDefault('高中|选择性必修3|第一章', ['human-environment', 'ecosystem-services']),
  chapterDefault('高中|选择性必修3|第二章', ['human-environment', 'resource-security']),
  chapterDefault('高中|选择性必修3|第三章', ['human-environment', 'environmental-security']),
  chapterDefault('高中|选择性必修3|第四章', ['human-environment', 'environmental-governance']),
])

const SECTION_OVERRIDES = Object.freeze([
  sectionOverride('初中|七年级上册|第一章|第三节', ['seasons', 'earth-motion'], [['solar-motion', 'default']]),
  sectionOverride('初中|七年级上册|第三章|第二节', ['landform-sandbox', 'landform-process'], [['stream-table', 'default']]),
  sectionOverride('初中|八年级上册|第二章|第一节', ['landform-sandbox', 'landform-process'], [['stream-table', 'default']]),
  sectionOverride('初中|八年级上册|第二章|第二节', ['atmosphere-system', 'atmosphere-process'], [['thermal-circulation', 'atmospheric-circulation']]),
  sectionOverride('初中|八年级上册|第二章|第三节', ['stream-table', 'default'], [['water-cycle-3d', 'water-cycle']]),
  sectionOverride('高中|必修第一册|第一章|第三节', ['geologic-time', 'default'], [['stratigraphy', 'default']]),
  sectionOverride('高中|必修第一册|第二章|第二节', ['thermal-circulation', 'atmospheric-circulation'], [['coriolis', 'default']]),
  sectionOverride('高中|必修第一册|第三章|第一节', ['water-cycle-3d', 'water-cycle'], [['water-cycle', 'default']]),
  sectionOverride('高中|必修第一册|第三章|第三节', ['water-cycle-3d', 'water-movement'], [['water-cycle', 'default']]),
  sectionOverride('高中|必修第一册|第四章|第一节', ['landform-sandbox', 'landform-process'], [['stream-table', 'default']]),
  sectionOverride('高中|必修第一册|第四章|第二节', ['landform-sandbox', 'landform-process'], [['stream-table', 'default']]),
  sectionOverride('高中|必修第一册|第六章|第一节', ['disaster-sandbox', 'natural-hazards'], [['thermal-circulation', 'atmospheric-circulation']]),
  sectionOverride('高中|必修第一册|第六章|第二节', ['disaster-sandbox', 'natural-hazards'], [['fault-model', 'default']]),
  sectionOverride('高中|选择性必修1|第一章|第一节', ['seasons', 'earth-motion'], [['solar-motion', 'default']]),
  sectionOverride('高中|选择性必修1|第一章|第二节', ['solar-motion', 'default'], [['seasons', 'earth-motion']]),
  sectionOverride('高中|选择性必修1|第二章|第二节', ['fault-model', 'default'], [['stratigraphy', 'default']]),
  sectionOverride('高中|选择性必修1|第二章|第三节', ['stream-table', 'default'], [['sediment-transport', 'default']]),
  sectionOverride('高中|选择性必修1|第二章|问题研究', ['stream-table', 'default'], [['sediment-transport', 'default']]),
  sectionOverride('高中|选择性必修1|第三章|第一节', ['thermal-circulation', 'atmospheric-circulation'], [['coriolis', 'default']]),
  sectionOverride('高中|选择性必修1|第三章|第二节', ['thermal-circulation', 'atmospheric-circulation'], [['coriolis', 'default']]),
  sectionOverride('高中|选择性必修1|第四章|第一节', ['groundwater', 'default'], [['water-cycle-3d', 'water-cycle']]),
  sectionOverride('高中|选择性必修1|第四章|第二节', ['water-cycle-3d', 'water-movement'], [['water-cycle', 'default']]),
])

export const experimentLinkConfiguration = Object.freeze({
  chapterDefaults: CHAPTER_DEFAULTS,
  sectionOverrides: SECTION_OVERRIDES,
})

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

function configurationEntries(configuration) {
  return [
    ...(configuration?.chapterDefaults || []).map(entry => Object.freeze({ ...entry, kind: 'chapter-default' })),
    ...(configuration?.sectionOverrides || []).map(entry => Object.freeze({ ...entry, kind: 'section-override' })),
  ]
}

function latestConfigByKey(entries) {
  return new Map(entries.map(entry => [entry.key, entry]))
}

function buildRegistry(grades, configuration = experimentLinkConfiguration) {
  const entries = []
  const configurationByKind = configurationEntries(configuration)
  const chapterDefaultsByKey = latestConfigByKey(configurationByKind.filter(entry => entry.kind === 'chapter-default'))
  const sectionOverridesByKey = latestConfigByKey(configurationByKind.filter(entry => entry.kind === 'section-override'))

  for (const context of sectionsFor(grades)) {
    const key = textbookKey(context)
    const override = sectionOverridesByKey.get(key)
    const chapterDefault = chapterDefaultsByKey.get(chapterKey(context))
    const config = override || chapterDefault
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

  for (const { key, primary, related = [] } of entries) {
    for (const [experimentId, presetId] of [primary, ...related]) {
      if (!getExperiment(experimentId)) {
        invalidExperiments.push({ key, experimentId })
      } else if (!getExperimentPreset(experimentId, presetId)) {
        invalidPresets.push({ key, experimentId, presetId })
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

export function auditExperimentCoverage(grades, configuration = experimentLinkConfiguration) {
  const curriculumSections = sectionsFor(grades)
  const curriculumKeys = new Set(curriculumSections.map(textbookKey))
  const curriculumChapterKeys = new Set(curriculumSections.map(chapterKey))
  const rawConfigurationEntries = configurationEntries(configuration)
  const entries = buildRegistry(grades, configuration)
  const linksByKey = new Map(entries.map(({ key, link }) => [key, link]))
  const { invalidExperiments, invalidPresets } = validateReferences(rawConfigurationEntries)
  const uncovered = curriculumSections
    .filter(context => !linksByKey.has(textbookKey(context)))
    .map(textbookKey)
    .sort()
  const orphanKeys = rawConfigurationEntries
    .filter(entry => entry.kind === 'chapter-default'
      ? !curriculumChapterKeys.has(entry.key)
      : !curriculumKeys.has(entry.key))
    .map(({ key }) => key)
    .sort()
  const curated = curriculumSections.filter(context => linksByKey.get(textbookKey(context))?.confidence === 'curated').length

  return Object.freeze({
    total: curriculumSections.length,
    curated,
    coverage: curriculumSections.length ? curated / curriculumSections.length : 0,
    uncovered,
    invalidExperiments,
    invalidPresets,
    duplicateKeys: countDuplicates(rawConfigurationEntries),
    orphanKeys,
  })
}

const registryEntries = buildRegistry(grades)
const registryByKey = new Map(registryEntries.map(({ key, link }) => [key, Object.freeze(link)]))

export const textbookExperimentLinks = Object.freeze(Object.fromEntries(registryEntries.map(({ key, link }) => [key, link])))
