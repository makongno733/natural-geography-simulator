// 物理与天体物理纯函数库 · GEO COSMOS
// 严格数值计算、边界防御与解析基准验证

const SPEED_OF_LIGHT_KMS = 299792.458 // km/s
const SECONDS_PER_YEAR = 31557600 // 儒略年秒数 (365.25 d)
const MPC_TO_KM = 3.085677581491367e19 // 1 Mpc in km

export function lorentz(beta) {
  if (!Number.isFinite(beta) || Math.abs(beta) >= 1) {
    throw new RangeError('|v/c| must be strictly less than 1')
  }
  return 1 / Math.sqrt(1 - beta * beta)
}

export function redshift(a) {
  if (!Number.isFinite(a) || a <= 0) {
    throw new RangeError('Scale factor a must be positive')
  }
  return 1 / a - 1
}

export function scaleFactor(z) {
  if (!Number.isFinite(z) || z <= -1) {
    throw new RangeError('Redshift z must exceed -1')
  }
  return 1 / (1 + z)
}

/**
 * 经典一维波动画坐标生成（用于实验室的直观类比，保留向后兼容）
 */
export function stringPoints(mode, phase, closed = false) {
  return Array.from({ length: 181 }, (_, i) => {
    const u = i / 180
    const wave = Math.sin(mode * (closed ? 2 : 1) * Math.PI * u) * Math.cos(phase)
    return closed
      ? [250 + (100 + 18 * wave) * Math.cos(2 * Math.PI * u), 140 + (100 + 18 * wave) * Math.sin(2 * Math.PI * u)]
      : [30 + 440 * u, 140 + 65 * wave]
  }).map(p => p.join(',')).join(' ')
}

/**
 * 狭义相对论洛伦兹时空变换 (取 c = 1)
 * t' = gamma * (t - beta * x)
 * x' = gamma * (x - beta * t)
 */
export function lorentzTransform(t, x, beta) {
  if (!Number.isFinite(t) || !Number.isFinite(x)) {
    throw new TypeError('Spacetime coordinates t and x must be finite numbers')
  }
  const gamma = lorentz(beta)
  return [
    gamma * (t - beta * x),
    gamma * (x - beta * t)
  ]
}

/**
 * 在静止时空图中的同时性线 (运动系的 t' = 0 对应静止系的 t = beta * x)
 */
export function simultaneityLinePoints(beta, halfSpan = 150) {
  if (!Number.isFinite(beta) || Math.abs(beta) >= 1) {
    throw new RangeError('|beta| must be < 1')
  }
  const x1 = -halfSpan
  const t1 = beta * x1
  const x2 = halfSpan
  const t2 = beta * x2
  return [
    { x: x1, t: t1 },
    { x: x2, t: t2 }
  ]
}

/**
 * 弦的经典振动波形与边界条件展示（严格标注经典类比）
 * boundary: 'fixed' (两端固定 Dirichlet), 'free' (两端自由 Neumann), 'closed' (闭弦周期边界)
 */
export function stringWavePoints(mode, phase, boundary = 'fixed', samples = 160) {
  const n = Math.max(1, Math.min(10, Math.round(mode || 1)))
  const phi = Number.isFinite(phase) ? phase : 0
  const points = []

  for (let i = 0; i <= samples; i++) {
    const sigma = i / samples // [0, 1]
    let y = 0
    if (boundary === 'fixed') {
      // 两端固定：y(0) = y(1) = 0
      y = Math.sin(n * Math.PI * sigma) * Math.cos(phi)
    } else if (boundary === 'free') {
      // 两端自由：dy/dsigma = 0 处在两端
      y = Math.cos(n * Math.PI * sigma) * Math.cos(phi)
    } else {
      // 闭弦周期边界：圆环径向调制
      y = Math.sin(n * 2 * Math.PI * sigma) * Math.cos(phi)
    }
    points.push({ sigma, y })
  }
  return points
}

/**
 * FLRW 无量纲膨胀率 E(z)
 * E(z) = sqrt(Or0*(1+z)^4 + Om0*(1+z)^3 + Ok0*(1+z)^2 + Ode0)
 */
export function flrwExpansionRate(z, { Om0 = 0.315, Ode0 = 0.685, Or0 = 0.0001, Ok0 = null } = {}) {
  if (!Number.isFinite(z) || z <= -1) {
    throw new RangeError('Redshift z must be finite and > -1')
  }
  const curvature = Ok0 !== null ? Ok0 : (1 - Om0 - Ode0 - Or0)
  const onePlusZ = 1 + z
  const z2 = onePlusZ * onePlusZ
  const z3 = z2 * onePlusZ
  const z4 = z3 * onePlusZ

  const inside = Or0 * z4 + Om0 * z3 + curvature * z2 + Ode0
  if (inside < 0) {
    throw new RangeError('Unphysical cosmological parameters resulting in E(z)^2 < 0')
  }
  return Math.sqrt(inside)
}

/**
 * Simpson 复合数值积分
 */
function simpsonIntegral(func, a, b, n = 120) {
  const steps = n % 2 === 0 ? n : n + 1
  const h = (b - a) / steps
  let sum = func(a) + func(b)
  for (let i = 1; i < steps; i++) {
    const x = a + i * h
    sum += (i % 2 === 0 ? 2 : 4) * func(x)
  }
  return (sum * h) / 3
}

/**
 * 共动距离 D_C(z) (单位 Mpc)
 * D_C(z) = (c / H0) * \int_0^z dz' / E(z')
 */
export function flrwComovingDistance(z, { H0 = 67.4, Om0 = 0.315, Ode0 = 0.685, Or0 = 0.0001, Ok0 = null } = {}, nSteps = 120) {
  if (!Number.isFinite(z) || z < 0) {
    throw new RangeError('Redshift z must be non-negative')
  }
  if (z === 0) return 0
  const dHubble = SPEED_OF_LIGHT_KMS / H0 // Mpc
  const integral = simpsonIntegral(
    zp => 1 / flrwExpansionRate(zp, { Om0, Ode0, Or0, Ok0 }),
    0,
    z,
    nSteps
  )
  return dHubble * integral
}

/**
 * 光度距离 D_L 与角直径距离 D_A (单位 Mpc)
 */
export function flrwCosmicDistances(z, params = {}) {
  const Dc = flrwComovingDistance(z, params)
  const Dl = (1 + z) * Dc
  const Da = Dc / (1 + z)
  return {
    comovingDistanceMpc: Dc,
    luminosityDistanceMpc: Dl,
    angularDiameterDistanceMpc: Da
  }
}

/**
 * 宇宙在给定红移 z 处的宇宙学年龄 (单位 Gyr)
 * t(z) = \int_z^\infty \frac{dz'}{(1+z') H(z')}
 * 采用变量代换 u = 1 / (1 + z')，积分区间从 0 到 1/(1+z)
 */
export function flrwCosmicAge(z, { H0 = 67.4, Om0 = 0.315, Ode0 = 0.685, Or0 = 0.0001, Ok0 = null } = {}, nSteps = 160) {
  if (!Number.isFinite(z) || z < 0) {
    throw new RangeError('Redshift z must be non-negative')
  }
  const curvature = Ok0 !== null ? Ok0 : (1 - Om0 - Ode0 - Or0)
  const aTarget = 1 / (1 + z)
  const sMax = Math.sqrt(aTarget)

  // 消除 a -> 0 奇点的精确变量代换：令 a = s^2 (da = 2s ds)
  // 分母 a * E(1/a - 1) = (1/s^2) * sqrt(Or0 + Om0*s^2 + curvature*s^4 + Ode0*s^8)
  // 被积式 da / (a * E) = 2*s^3 ds / sqrt(Or0 + Om0*s^2 + curvature*s^4 + Ode0*s^8)
  // 当纯物质 Om0 = 1 时，积分 = \int_0^1 2s^2 ds = 2/3，严格解析对应！
  const integral = simpsonIntegral(
    s => {
      if (s <= 0) return 0
      const s2 = s * s
      const s4 = s2 * s2
      const s8 = s4 * s4
      const denom = Math.sqrt(Or0 + Om0 * s2 + curvature * s4 + Ode0 * s8)
      return denom > 0 ? (2 * s * s2) / denom : 0
    },
    0,
    sMax,
    nSteps
  )

  const h0InvSeconds = MPC_TO_KM / H0
  const h0InvGyr = h0InvSeconds / (SECONDS_PER_YEAR * 1e9)
  return integral * h0InvGyr
}
