import { describe, expect, test } from 'vitest'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkBundleBudgets, collectStaticEntryGraph, gzipSize } from './check-bundle-budget.mjs'

const FIXTURE_MANIFEST = {
  'index.html': {
    file: 'assets/index.js',
    isEntry: true,
    imports: ['assets/vendor-vue.js'],
    dynamicImports: ['assets/SectionContent.js', 'assets/ExperimentView.js'],
  },
  'assets/vendor-vue.js': { file: 'assets/vendor-vue.js', name: 'vendor-vue' },
  'assets/SectionContent.js': {
    file: 'assets/SectionContent.js',
    imports: ['assets/vendor-vue.js'],
    dynamicImports: ['assets/必修第一册.js'],
  },
  'assets/必修第一册.js': { file: 'assets/必修第一册.js' },
  'assets/ExperimentView.js': {
    file: 'assets/ExperimentView.js',
    dynamicImports: ['assets/vendor-three.js'],
  },
  'assets/vendor-three.js': { file: 'assets/vendor-three.js', name: 'vendor-three' },
}

function buildFixture(manifest = FIXTURE_MANIFEST, content = 'export const x = 1;\n') {
  const dir = mkdtempSync(join(tmpdir(), 'bundle-budget-'))
  mkdirSync(join(dir, '.vite'), { recursive: true })
  mkdirSync(join(dir, 'assets'), { recursive: true })
  for (const chunk of Object.values(manifest)) {
    if (chunk.file) writeFileSync(join(dir, chunk.file), content)
  }
  writeFileSync(join(dir, '.vite', 'manifest.json'), JSON.stringify(manifest))
  return dir
}

describe('bundle budget checker', () => {
  test('collects only the static dependency graph of an entry', () => {
    const graph = collectStaticEntryGraph(FIXTURE_MANIFEST, 'index.html')
    expect(graph).toContain('index.html')
    expect(graph).toContain('assets/vendor-vue.js')
    expect(graph).not.toContain('assets/SectionContent.js')
    expect(graph).not.toContain('assets/vendor-three.js')
  })

  test('does not follow dynamic imports into lazy routes', () => {
    const graph = collectStaticEntryGraph(FIXTURE_MANIFEST, 'assets/SectionContent.js')
    expect(graph).toContain('assets/SectionContent.js')
    expect(graph).not.toContain('assets/必修第一册.js')
    expect(graph).not.toContain('assets/vendor-three.js')
  })

  test('gzipSize returns the gzip byte length of a file', () => {
    const dir = buildFixture()
    const size = gzipSize(join(dir, 'assets/index.js'))
    expect(size).toBeGreaterThan(0)
  })

  test('checkBundleBudgets passes when entries are under budget and three-free', () => {
    const dir = buildFixture()
    const result = checkBundleBudgets(dir, {
      homeEntry: 'index.html',
      textbookEntry: 'assets/SectionContent.js',
      homeBudget: 1024 * 1024,
      textbookBudget: 1024 * 1024,
    })
    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.home.containsThree).toBe(false)
    expect(result.textbook.containsThree).toBe(false)
  })

  test('checkBundleBudgets fails clearly when a static graph exceeds its budget', () => {
    const dir = buildFixture()
    const result = checkBundleBudgets(dir, {
      homeEntry: 'index.html',
      textbookEntry: 'assets/SectionContent.js',
      homeBudget: 1,
      textbookBudget: 1024 * 1024,
    })
    expect(result.ok).toBe(false)
    expect(result.errors.some((message) => message.includes('首页'))).toBe(true)
  })

  test('checkBundleBudgets flags vendor-three inside a static entry graph', () => {
    const manifest = {
      'index.html': {
        file: 'assets/index.js',
        isEntry: true,
        imports: ['assets/vendor-three.js'],
        dynamicImports: [],
      },
      'assets/vendor-three.js': { file: 'assets/vendor-three.js', name: 'vendor-three' },
      'assets/SectionContent.js': { file: 'assets/SectionContent.js', imports: [] },
    }
    const dir = buildFixture(manifest)
    const result = checkBundleBudgets(dir, {
      homeEntry: 'index.html',
      textbookEntry: 'assets/SectionContent.js',
      homeBudget: 1024 * 1024,
      textbookBudget: 1024 * 1024,
    })
    expect(result.ok).toBe(false)
    expect(result.errors.some((message) => message.includes('vendor-three'))).toBe(true)
  })
})
