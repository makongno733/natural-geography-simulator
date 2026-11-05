// Classroom kinematics: normalise today's scale factor to 1. No age–scale-factor
// conversion is implied; that requires cosmological parameters and integration.
export function expansionAt(emissionScale, emittedWavelengthNm = 500) {
  const a = Math.min(1, Math.max(0.1, Number(emissionScale) || 0.1))
  return {
    scale: a,
    redshift: 1 / a - 1,
    observedWavelengthNm: emittedWavelengthNm / a,
    separationRatio: 1 / a,
  }
}
