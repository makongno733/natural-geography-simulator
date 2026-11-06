import { describe, it, expect } from 'vitest'
import { particles, PARTICLE_CATEGORIES } from './particlesData.js'

describe('Particle Data Group (PDG 2024) Standard Model & Candidate Dataset', () => {
  it('has unique IDs across all entries', () => {
    const ids = particles.map(p => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('contains exactly six quarks with correct fractions and MS-bar definitions', () => {
    const quarks = particles.filter(p => p.category === 'quark')
    expect(quarks).toHaveLength(6)

    const upType = quarks.filter(q => q.charge === '+2/3 e')
    const downType = quarks.filter(q => q.charge === '−1/3 e')
    expect(upType.map(q => q.id)).toEqual(['up', 'charm', 'top'])
    expect(downType.map(q => q.id)).toEqual(['down', 'strange', 'bottom'])

    for (const q of quarks) {
      expect(q.spin).toBe('1/2')
      expect(q.interactions).toContain('强相互作用')
      expect(q.massDefinition.length).toBeGreaterThan(10)
    }
  })

  it('contains exactly six leptons; neutrinos have no fabricated exact masses', () => {
    const leptons = particles.filter(p => p.category === 'lepton')
    expect(leptons).toHaveLength(6)

    const neutrinos = leptons.filter(l => l.id.includes('neutrino'))
    expect(neutrinos).toHaveLength(3)

    for (const nu of neutrinos) {
      expect(nu.charge).toBe('0')
      expect(nu.mass).toMatch(/<|\bCL\b|上限/i)
      expect(nu.massDefinition).toMatch(/振荡|上限|混合/i)
      // Must not claim zero mass or a fake exact point value
      expect(nu.mass).not.toBe('0 eV')
      expect(nu.mass).not.toBe('0.1 eV')
    }
  })

  it('strictly segregates Higgs as scalar boson, NOT a gauge boson', () => {
    const higgs = particles.find(p => p.id === 'higgs')
    expect(higgs).toBeDefined()
    expect(higgs.category).toBe('scalar_boson')
    expect(higgs.category).not.toBe('gauge_boson')
    expect(higgs.spin).toContain('0')

    const gaugeBosons = particles.filter(p => p.category === 'gauge_boson')
    expect(gaugeBosons.map(g => g.id)).toEqual(['photon', 'gluon', 'w_boson', 'z_boson'])
    for (const gb of gaugeBosons) {
      expect(gb.spin).toBe('1')
    }
  })

  it('marks graviton as hypothetical candidate with spin 2, never as discovered standard model particle', () => {
    const graviton = particles.find(p => p.id === 'graviton')
    expect(graviton).toBeDefined()
    expect(graviton.category).toBe('hypothetical')
    expect(graviton.spin).toContain('2')
    expect(graviton.discovery).toMatch(/尚未被直接实验探测/i)
  })

  it('references verified PDG source documentation for every particle', () => {
    for (const p of particles) {
      expect(p.pdgSource).toMatch(/^PDG 2024/)
      expect(p.name).toBeTruthy()
      expect(p.nameEn).toBeTruthy()
      expect(p.symbol).toBeTruthy()
    }
  })

  it('matches all categories declared in PARTICLE_CATEGORIES', () => {
    const validCatIds = new Set(PARTICLE_CATEGORIES.map(c => c.id))
    for (const p of particles) {
      expect(validCatIds.has(p.category)).toBe(true)
    }
  })
})
