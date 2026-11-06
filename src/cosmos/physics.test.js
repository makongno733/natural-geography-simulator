import { describe, it, expect } from 'vitest'
import {
  lorentz,
  redshift,
  scaleFactor,
  stringPoints,
  lorentzTransform,
  simultaneityLinePoints,
  stringWavePoints,
  flrwExpansionRate,
  flrwComovingDistance,
  flrwCosmicDistances,
  flrwCosmicAge
} from './physics.js'

describe('Cosmos scientific models - baseline checks', () => {
  it('recovers rest and beta=0.6 values', () => {
    expect(lorentz(0)).toBe(1)
    expect(lorentz(0.6)).toBeCloseTo(1.25)
    expect(lorentz(-0.6)).toBeCloseTo(1.25)
  })

  it('rejects lightlike and unphysical inputs', () => {
    for (const b of [1, -1, 1.2, -1.5, NaN, Infinity, -Infinity]) {
      expect(() => lorentz(b)).toThrow()
    }
    for (const a of [0, -1, NaN, Infinity]) {
      expect(() => redshift(a)).toThrow()
    }
    expect(() => scaleFactor(-1)).toThrow()
    expect(() => scaleFactor(-2)).toThrow()
  })

  it('inverts cosmological redshift', () => {
    expect(redshift(0.5)).toBe(1)
    for (const z of [0, 0.5, 1, 3, 10, 1100]) {
      expect(redshift(scaleFactor(z))).toBeCloseTo(z, 5)
    }
  })

  it('keeps open endpoints fixed and closes the loop', () => {
    const open = stringPoints(3, 0).split(' ')
    expect(open[0]).toBe('30,140')
    expect(Number(open.at(-1).split(',')[1])).toBeCloseTo(140)
    const closed = stringPoints(2, 0.5, true).split(' ')
    const first = closed[0].split(',').map(Number)
    const last = closed.at(-1).split(',').map(Number)
    expect(last[0]).toBeCloseTo(first[0])
    expect(last[1]).toBeCloseTo(first[1])
  })
})

describe('Special Relativity - Lorentz transformations and spacetime interval', () => {
  it('acts as identity transform when beta is zero', () => {
    const [tPrime, xPrime] = lorentzTransform(4.5, -2.2, 0)
    expect(tPrime).toBeCloseTo(4.5)
    expect(xPrime).toBeCloseTo(-2.2)
  })

  it('preserves the Minkowski spacetime interval s^2 = t^2 - x^2', () => {
    const events = [
      [5, 3], // timelike
      [2, 7], // spacelike
      [4, 4]  // lightlike
    ]
    const testBetas = [0.2, 0.6, -0.75, 0.9]

    for (const [t, x] of events) {
      const sSquared = t * t - x * x
      for (const beta of testBetas) {
        const [tP, xP] = lorentzTransform(t, x, beta)
        const sPrimeSquared = tP * tP - xP * xP
        expect(sPrimeSquared).toBeCloseTo(sSquared, 6)
      }
    }
  })

  it('preserves the speed of light: lightlike worldlines stay lightlike', () => {
    // If x = t, then x' must equal t'
    const t = 10
    const x = 10
    const [tP, xP] = lorentzTransform(t, x, 0.8)
    expect(tP).toBeCloseTo(xP, 6)
  })

  it('inverts back with reverse velocity -beta', () => {
    const [t, x] = [12, -8]
    const beta = 0.55
    const [tP, xP] = lorentzTransform(t, x, beta)
    const [tOrig, xOrig] = lorentzTransform(tP, xP, -beta)
    expect(tOrig).toBeCloseTo(t, 6)
    expect(xOrig).toBeCloseTo(x, 6)
  })

  it('computes simultaneity line slope t = beta * x', () => {
    const pts = simultaneityLinePoints(0.5, 100)
    expect(pts[0].x).toBe(-100)
    expect(pts[0].t).toBe(-50)
    expect(pts[1].x).toBe(100)
    expect(pts[1].t).toBe(50)
  })
})

describe('String Boundary Conditions & Waves (Classical Analogy)', () => {
  it('satisfies Dirichlet fixed endpoints y(0) = y(1) = 0', () => {
    for (const mode of [1, 2, 3, 4]) {
      const wave = stringWavePoints(mode, 0.4, 'fixed')
      expect(wave[0].y).toBeCloseTo(0)
      expect(wave[wave.length - 1].y).toBeCloseTo(0)
    }
  })

  it('satisfies Neumann free endpoints with non-zero antinodes at ends', () => {
    const wave = stringWavePoints(2, 0, 'free')
    expect(wave[0].y).toBeCloseTo(1)
    expect(wave[wave.length - 1].y).toBeCloseTo(1)
  })

  it('satisfies periodic closed string topology y(0) == y(1)', () => {
    const wave = stringWavePoints(3, 1.2, 'closed')
    expect(wave[0].y).toBeCloseTo(wave[wave.length - 1].y, 6)
  })
})

describe('FLRW Cosmology - Numerical Integration and Benchmarks', () => {
  it('calculates expansion rate E(0) = 1 for a flat universe', () => {
    const E0 = flrwExpansionRate(0, { Om0: 0.3, Ode0: 0.7, Or0: 0 })
    expect(E0).toBeCloseTo(1.0, 5)
  })

  it('recovers Hubble law linear expansion for small z', () => {
    const zSmall = 0.005
    const H0 = 70
    const Dc = flrwComovingDistance(zSmall, { H0, Om0: 0.3, Ode0: 0.7, Or0: 0 })
    const c = 299792.458
    const dHubbleLinear = (c / H0) * zSmall
    // For z = 0.005, linear Hubble law is accurate within ~0.5%
    expect(Math.abs(Dc - dHubbleLinear) / dHubbleLinear).toBeLessThan(0.005)
  })

  it('fulfills cosmic distance duality relation DL = (1+z)^2 DA', () => {
    const z = 1.5
    const dist = flrwCosmicDistances(z, { H0: 67.4, Om0: 0.315, Ode0: 0.685 })
    expect(dist.luminosityDistanceMpc).toBeCloseTo(dist.comovingDistanceMpc * (1 + z), 4)
    expect(dist.angularDiameterDistanceMpc).toBeCloseTo(dist.comovingDistanceMpc / (1 + z), 4)
    expect(dist.luminosityDistanceMpc).toBeCloseTo(dist.angularDiameterDistanceMpc * Math.pow(1 + z, 2), 4)
  })

  it('matches analytical Einstein-de Sitter age benchmark t0 = 2 / (3 * H0)', () => {
    // Pure matter Einstein-de Sitter universe: Om0 = 1, Ode0 = 0, Or0 = 0
    const H0 = 70
    const MPC_KM = 3.085677581491367e19
    const SEC_YR = 31557600
    const t0AnalyticalGyr = (2 / (3 * (H0 / MPC_KM))) / (SEC_YR * 1e9)

    const t0Numerical = flrwCosmicAge(0, { H0, Om0: 1.0, Ode0: 0, Or0: 0 }, 300)
    expect(t0Numerical).toBeCloseTo(t0AnalyticalGyr, 2)
  })

  it('gives Planck 2018 concordance age of ~13.8 Gyr today', () => {
    const ageToday = flrwCosmicAge(0, { H0: 67.4, Om0: 0.315, Ode0: 0.685, Or0: 0.0001 })
    expect(ageToday).toBeGreaterThan(13.6)
    expect(ageToday).toBeLessThan(14.0)

    // Age at recombination z = 1100 should be ~380,000 years (0.00038 Gyr)
    const ageRecomb = flrwCosmicAge(1100, { H0: 67.4, Om0: 0.315, Ode0: 0.685, Or0: 0.0001 })
    expect(ageRecomb).toBeGreaterThan(0.0003)
    expect(ageRecomb).toBeLessThan(0.0005)
  })
})
