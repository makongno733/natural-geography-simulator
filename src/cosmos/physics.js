export function lorentz(beta) {
  if (!Number.isFinite(beta) || Math.abs(beta) >= 1) throw new RangeError('|v/c| must be < 1')
  return 1 / Math.sqrt(1 - beta * beta)
}
export function redshift(a) {
  if (!Number.isFinite(a) || a <= 0) throw new RangeError('a must be positive')
  return 1 / a - 1
}
export function scaleFactor(z) {
  if (!Number.isFinite(z) || z <= -1) throw new RangeError('z must exceed -1')
  return 1 / (1 + z)
}
export function stringPoints(mode, phase, closed = false) {
  return Array.from({length: 181}, (_, i) => {
    const u = i / 180
    const wave = Math.sin(mode * (closed ? 2 : 1) * Math.PI * u) * Math.cos(phase)
    return closed ? [250 + (100 + 18 * wave) * Math.cos(2*Math.PI*u), 140 + (100 + 18 * wave) * Math.sin(2*Math.PI*u)] : [30 + 440*u, 140 + 65*wave]
  }).map(p => p.join(',')).join(' ')
}
