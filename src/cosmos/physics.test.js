import { describe, it, expect } from 'vitest'
import { lorentz, redshift, scaleFactor, stringPoints } from './physics.js'
describe('Cosmos scientific models', () => {
  it('recovers rest and beta=0.6 values', () => { expect(lorentz(0)).toBe(1); expect(lorentz(.6)).toBeCloseTo(1.25); expect(lorentz(-.6)).toBeCloseTo(1.25) })
  it('rejects lightlike and unphysical inputs', () => { for(const b of [1,-1,NaN,Infinity]) expect(()=>lorentz(b)).toThrow(); for(const a of [0,-1,NaN]) expect(()=>redshift(a)).toThrow(); expect(()=>scaleFactor(-1)).toThrow() })
  it('inverts cosmological redshift', () => { expect(redshift(.5)).toBe(1); for(const z of [0,1,10,1100]) expect(redshift(scaleFactor(z))).toBeCloseTo(z) })
  it('keeps open endpoints fixed and closes the loop', () => { const open = stringPoints(3,0).split(' '); expect(open[0]).toBe('30,140'); expect(Number(open.at(-1).split(',')[1])).toBeCloseTo(140); const closed=stringPoints(2,.5,true).split(' '); const first=closed[0].split(',').map(Number), last=closed.at(-1).split(',').map(Number); expect(last[0]).toBeCloseTo(first[0]); expect(last[1]).toBeCloseTo(first[1]) })
})
