import { describe, it, expect } from 'vitest'
import { chapters, SCIENTIFIC_STATUSES } from './content.js'

describe('Cosmos Chapters Schema & Rigorous Content Validation', () => {
  it('guarantees strictly unique IDs across all chapters', () => {
    const ids = chapters.map(c => c.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('enforces kebab-case lowercase identifiers', () => {
    for (const c of chapters) {
      expect(c.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('mandates all required schema fields on every chapter', () => {
    const requiredFields = [
      'id',
      'group',
      'title',
      'level',
      'status',
      'goals',
      'prerequisites',
      'body',
      'formula',
      'symbols',
      'conditions',
      'misconception',
      'question',
      'answer',
      'refs',
      'pedagogy'
    ]

    for (const c of chapters) {
      for (const field of requiredFields) {
        expect(c[field], `Chapter ${c.id} missing field: ${field}`).toBeDefined()
        if (field === 'body' || field === 'refs') {
          expect(Array.isArray(c[field]), `${c.id}.${field} must be array`).toBe(true)
          expect(c[field].length, `${c.id}.${field} must not be empty`).toBeGreaterThan(0)
        } else if (field === 'pedagogy') {
          expect(typeof c.pedagogy).toBe('object')
          expect(c.pedagogy.min5).toBeTruthy()
          expect(c.pedagogy.min10).toBeTruthy()
          expect(c.pedagogy.min45).toBeTruthy()
          expect(c.pedagogy.prompt).toBeTruthy()
        } else {
          expect(typeof c[field]).toBe('string')
          expect(c[field].trim().length, `${c.id}.${field} is empty string`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('restricts status to the validated SCIENTIFIC_STATUSES enum', () => {
    const validStatuses = new Set(SCIENTIFIC_STATUSES)
    for (const c of chapters) {
      expect(validStatuses.has(c.status), `Chapter ${c.id} has invalid status: ${c.status}`).toBe(true)
    }
  })

  it('restricts level to either 基础 or 进阶', () => {
    for (const c of chapters) {
      expect(['基础', '进阶']).toContain(c.level)
    }
  })

  it('validates traceable references with https URLs', () => {
    for (const c of chapters) {
      for (const ref of c.refs) {
        expect(ref.title).toBeTruthy()
        expect(ref.url).toMatch(/^https:\/\//)
      }
    }
  })

  it('verifies complete coverage of the String Theory D1-D11 brief chapters', () => {
    const expectedDChapters = [
      'strings-origins',         // D1
      'strings-basics',          // D2
      'strings-gravity',         // D3
      'strings-bosonic',         // D4
      'strings-supersymmetry',   // D5
      'strings-five-theories',   // D6
      'strings-duality',         // D7
      'strings-dbranes',         // D8
      'strings-compactification',// D9
      'strings-holography',      // D10
      'strings-limits'           // D11
    ]

    const presentIds = new Set(chapters.map(c => c.id))
    for (const dId of expectedDChapters) {
      expect(presentIds.has(dId), `String theory chapter ${dId} missing from content`).toBe(true)
    }
  })

  it('ensures preserved baseline chapters remain accessible with backwards compatibility', () => {
    const baselineIds = [
      'astronomy',
      'stars',
      'relativity',
      'gravity',
      'cosmology',
      'particles',
      'quantum-fields',
      'dimensions',
      'black-holes',
      'multiverse',
      'history'
    ]
    const presentIds = new Set(chapters.map(c => c.id))
    for (const bId of baselineIds) {
      expect(presentIds.has(bId), `Baseline chapter ${bId} missing`).toBe(true)
    }
  })
})
