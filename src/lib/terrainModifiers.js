/**
 * Terrain modifiers for each geomorphology module.
 * Each modifier can: modify height, provide coloring, add scene objects.
 */

// --- Noise helpers ---
function hash2D(x, y) {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453)
}
function fract(v) { return v - Math.floor(v) }
function lerp(a, b, t) { return a + (b - a) * t }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
function smoothstep(edge0, edge1, v) {
  const t = clamp((v - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function noise2D(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
  const n00 = hash2D(ix, iy), n10 = hash2D(ix + 1, iy)
  const n01 = hash2D(ix, iy + 1), n11 = hash2D(ix + 1, iy + 1)
  return lerp(lerp(n00, n10, sx), lerp(n01, n11, sx), sy)
}

function fbm(x, y, octaves = 3) {
  let v = 0, a = 0.6, f = 1
  for (let i = 0; i < octaves; i++) {
    v += a * noise2D(x * f, y * f)
    f *= 2
    a *= 0.5
  }
  return v
}

function fbmWarp(x, y, octaves = 3) {
  const qx = fbm(x, y, octaves) * 2 - 1
  const qy = fbm(x + 5.2, y + 1.3, octaves) * 2 - 1
  return fbm(x + qx * 0.3, y + qy * 0.3, octaves)
}

// --- Color helpers ---
function mixColors(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t))
  ]
}

// ===== Fluvial Module =====
const fluvialModifier = {
  modifyHeight(x, y, baseH, t, climateF) {
    // River incision: V-shaped valleys with meanders
    // Drainage network using multiple sine wave combinations
    const drainage = Math.sin(x * 8 + y * 5) * 0.5 + Math.sin(x * 3 - y * 7) * 0.3
    const valley = Math.sin(x * 12 + y * 3 + 0.8) * 0.08 * (0.3 + t * 0.7)
    const vCut = -Math.abs(drainage) * 0.12 * (0.2 + t * 0.8)

    // Meander belt
    const meanderX = Math.sin(y * 6 + x * 2 + t * 2) * 0.15
    const meander = -Math.exp(-Math.pow((x - 0.5 + meanderX) / 0.04, 2)) * 0.1 * (0.3 + t * 0.5)

    // Alluvial fan at mountain exit
    const fanX = 0.75, fanY = 0.2
    const dFan = Math.pow((x - fanX) / 0.1, 2) + Math.pow((y - fanY) / 0.08, 2)
    const fan = Math.exp(-dFan * 2) * 0.12 * (0.2 + t * 0.6)

    // Terrace remnants
    const terrace = Math.sin(x * 15 + y * 10) * 0.02 * (1 - Math.exp(-t * 3))

    // Base terrain shaped by climate
    const climateMod = 0.6 + climateF * 0.4  // wetter = more dissection
    const dissection = Math.sin(x * 14 + y * 12) * 0.03 * climateMod

    return baseH + valley + vCut * climateMod + meander + fan + terrace + dissection
  },
  getColor(elevation, slope) {
    const e = clamp(elevation, 0, 1)
    if (e < 0.05) return mixColors([30, 55, 70], [40, 75, 85], e / 0.05)      // deep water
    if (e < 0.12) return mixColors([40, 75, 85], [60, 110, 80], (e - 0.05) / 0.07) // river
    if (e < 0.3) return mixColors([60, 110, 80], [80, 140, 70], (e - 0.12) / 0.18) // floodplain
    if (e < 0.5) return mixColors([80, 140, 70], [95, 145, 60], (e - 0.3) / 0.2) // valley sides
    if (e < 0.7) return mixColors([95, 145, 60], [130, 120, 65], (e - 0.5) / 0.2) // upland
    return mixColors([130, 120, 65], [180, 170, 150], (e - 0.7) / 0.3)         // hilltop
  },
  getFeatureName(t) {
    const features = ['V形谷', '冲积扇', '河曲', '牛轭湖', '三角洲', '阶地']
    return features[Math.min(features.length - 1, Math.floor(t * features.length))]
  },
  getColorBias() { return [-0.1, 0.02, 0.04] } // greener, wetter
}

// ===== Structural Module =====
const structuralModifier = {
  modifyHeight(x, y, baseH, t, climateF) {
    // Fault block: add step along a diagonal line
    const faultLine = x + y * 0.6
    const scarp = Math.atan(faultLine * 6) * 0.18
    // Fold ridges
    const fold = Math.sin(x * 5 + y * 3 + t * 0.4) * 0.12
    const fold2 = Math.sin(x * 8 - y * 5 + 1.2) * 0.06
    // Block uplift
    const blockCenter = Math.exp(-Math.pow((x - 0.3) / 0.15, 2) - Math.pow((y - 0.5) / 0.2, 2))
    const block = blockCenter * (0.4 + t * 0.3)
    return baseH + scarp + fold + fold2 + block
  },
  getColor(elevation, slope) {
    const e = clamp(elevation, 0, 1)
    if (e < 0.15) return mixColors([38, 28, 18], [78, 55, 32], e / 0.15)  // dark earth
    if (e < 0.35) return mixColors([78, 55, 32], [140, 95, 50], (e - 0.15) / 0.2) // brown
    if (e < 0.55) return mixColors([140, 95, 50], [185, 130, 60], (e - 0.35) / 0.2) // tan
    if (e < 0.75) return mixColors([185, 130, 60], [160, 120, 85], (e - 0.55) / 0.2) // gray-brown
    return mixColors([160, 120, 85], [210, 200, 185], (e - 0.75) / 0.25)
  },
  getFeatureName(t) {
    const features = ['断层崖', '褶皱山', '断块山', '裂谷', '不整合']
    return features[Math.min(features.length - 1, Math.floor(t * features.length))]
  },
  getColorBias() { return [0.0, 0.0, 0.0] } // neutral
}

// ===== Glacial Module =====
const glacialModifier = {
  modifyHeight(x, y, baseH, t, climateF) {
    // U-shaped valleys: override V-shaped valley carving
    const depth = 0.15 + t * 0.3
    // Deep central trough
    const troughX = x * 2 - 1, troughY = y * 2 - 1
    const valley = Math.exp(-Math.pow((troughY - 0.1 * troughX) / 0.12, 2))
    const uShape = -valley * depth * (1 + Math.pow(Math.abs(troughY - 0.1 * troughX) / 0.22, 3))
    // Cirque at high elevation
    const cirqueX = 0.65, cirqueY = 0.25
    const d2 = Math.pow((x - cirqueX) / 0.08, 2) + Math.pow((y - cirqueY) / 0.06, 2)
    const cirque = -Math.exp(-d2 * 3) * 0.3 * (1 - Math.exp(-d2 * 8))
    // Horn peak
    const horn = Math.exp(-Math.pow((x - 0.35) / 0.06, 2) - Math.pow((y - 0.7) / 0.05, 2)) * 0.45
    // Moraine ridges
    const moraine = Math.sin(x * 14 + y * 10) * 0.04 * (0.5 + t * 0.5)
    return baseH + uShape + cirque + horn + moraine
  },
  getColor(elevation, slope) {
    const e = clamp(elevation, 0, 1)
    const s = clamp(slope, 0, 1)
    if (e < 0.1) return mixColors([25, 35, 45], [35, 50, 55], e / 0.1)       // deep water
    if (e < 0.25) return mixColors([35, 50, 55], [55, 65, 60], (e - 0.1) / 0.15) // ice
    if (e < 0.45) return mixColors([55, 65, 60], [90, 75, 65], (e - 0.25) / 0.2) // moraine
    if (e < 0.7) return mixColors([90, 75, 65], [110, 95, 85], (e - 0.45) / 0.25) // rock
    if (s > 0.5) return mixColors([110, 95, 85], [150, 145, 140], (e - 0.7) / 0.3) // steep rock
    return mixColors([110, 95, 85], [200, 210, 220], (e - 0.7) / 0.3)       // snow
  },
  getFeatureName(t) {
    const features = ['U 形谷', '冰斗', '刃脊', '冰碛垄', '峡湾', '角峰']
    return features[Math.min(features.length - 1, Math.floor(t * features.length))]
  },
  getColorBias() { return [0.0, -0.06, -0.08] } // more snow, shifted cold
}

// ===== Coastal Module =====
const coastalModifier = {
  modifyHeight(x, y, baseH, t, climateF) {
    // Lower overall, add ocean basin on one side
    const shoreX = x * 2 - 1
    // Sea level rise
    const seaLevel = -0.2 - t * 0.15
    // Wave-cut platform near shore
    const shoreDist = Math.abs(shoreX + 0.1)
    const platform = -Math.exp(-shoreDist * shoreDist * 80) * 0.15
    // Beach ridge
    const beach = Math.exp(-shoreDist * shoreDist * 120) * 0.08
    // Dune behind beach
    const dune = Math.sin(x * 12 + y * 8) * 0.03 * Math.exp(-shoreDist * 15)
    return seaLevel + baseH * 0.7 + platform + beach + dune
  },
  getColor(elevation, slope) {
    const e = clamp(elevation, 0, 1)
    if (e < 0.08) return mixColors([20, 50, 85], [30, 70, 100], e / 0.08)    // deep water
    if (e < 0.2) return mixColors([30, 70, 100], [60, 100, 110], (e - 0.08) / 0.12) // shallow water
    if (e < 0.35) return mixColors([60, 100, 110], [180, 155, 105], (e - 0.2) / 0.15) // sand
    if (e < 0.5) return mixColors([180, 155, 105], [100, 140, 90], (e - 0.35) / 0.15) // dune veg
    return mixColors([100, 140, 90], [60, 100, 60], (e - 0.5) / 0.5)          // inland veg
  },
  getFeatureName(t) {
    const features = ['海蚀崖/台', '海滩', '沙嘴/沙坝', '三角洲', '河口湾']
    return features[Math.min(features.length - 1, Math.floor(t * features.length))]
  },
  getColorBias() { return [-0.18, -0.05, -0.02] } // shifted low/wet
}

// ===== Aeolian Module =====
const aeolianModifier = {
  modifyHeight(x, y, baseH, t, climateF) {
    // Desert terrain: suppress base height, add dune bedforms
    const base = baseH * 0.35
    // Dune field
    const duneDir = x * 8 + y * 3
    const dune1 = Math.sin(duneDir) * 0.08
    const dune2 = Math.sin(x * 16 - y * 6 + 0.5) * 0.04
    const dune3 = fbmWarp(x * 5, y * 3, 2) * 0.12
    // Yardang ridges
    const yardang = Math.sin(x * 20 + y * 2) * 0.03
    // Slightly elevated bedrock outcrops
    const outcrop = Math.exp(-Math.pow((x - 0.7) / 0.04, 2) - Math.pow((y - 0.5) / 0.03, 2)) * 0.18
    return base + dune1 + dune2 + dune3 * (0.5 + t * 0.5) + yardang + outcrop
  },
  getColor(elevation, slope) {
    const e = clamp(elevation, 0, 1)
    if (e < 0.15) return mixColors([140, 115, 70], [170, 135, 80], e / 0.15)    // sand
    if (e < 0.35) return mixColors([170, 135, 80], [190, 150, 85], (e - 0.15) / 0.2) // dune
    if (e < 0.55) return mixColors([190, 150, 85], [155, 120, 70], (e - 0.35) / 0.2) // dark sand
    if (e < 0.75) return mixColors([155, 120, 70], [120, 90, 55], (e - 0.55) / 0.2) // rock
    return mixColors([120, 90, 55], [160, 145, 125], (e - 0.75) / 0.25)         // exposed rock
  },
  getFeatureName(t) {
    const features = ['沙丘', '雅丹', '黄土', '风棱石', '风蚀盆地']
    return features[Math.min(features.length - 1, Math.floor(t * features.length))]
  },
  getColorBias() { return [-0.12, -0.06, 0.02] } // desert tones
}

// ===== Karst Module =====
const karstModifier = {
  modifyHeight(x, y, baseH, t, climateF) {
    // Tower karst = tall steep residual hills
    const base = baseH * 0.8
    // Tower karst peaks
    let towers = 0
    const seeds = [[0.15, 0.25], [0.3, 0.7], [0.55, 0.2], [0.7, 0.6], [0.45, 0.45], [0.85, 0.35], [0.2, 0.8]]
    for (const [sx, sy] of seeds) {
      const dx = (x - sx) / 0.04, dy = (y - sy) / 0.035
      const d = Math.sqrt(dx * dx + dy * dy)
      const tower = Math.exp(-d * 1.2) * 0.35 / (1 + d * d)
      if (tower > 0.01) towers += tower
    }
    // Sinkhole depressions
    let sinkholes = 0
    const holes = [[0.4, 0.35], [0.6, 0.45], [0.3, 0.55], [0.75, 0.7]]
    for (const [hx, hy] of holes) {
      const dx = (x - hx) / 0.025, dy = (y - hy) / 0.025
      const d = dx * dx + dy * dy
      sinkholes -= Math.exp(-d * 5) * 0.12
    }
    return base + towers * (0.5 + t * 0.5) + sinkholes
  },
  getColor(elevation, slope) {
    const e = clamp(elevation, 0, 1)
    if (e < 0.1) return mixColors([25, 55, 30], [55, 90, 50], e / 0.1)          // dark green
    if (e < 0.3) return mixColors([55, 90, 50], [85, 120, 65], (e - 0.1) / 0.2)  // green
    if (e < 0.55) return mixColors([85, 120, 65], [140, 130, 100], (e - 0.3) / 0.25) // limestone
    if (e < 0.75) return mixColors([140, 130, 100], [160, 145, 120], (e - 0.55) / 0.2) // gray rock
    return mixColors([160, 145, 120], [185, 175, 165], (e - 0.75) / 0.25)       // bare rock
  },
  getFeatureName(t) {
    const features = ['峰林', '溶斗/天坑', '溶洞', '坡立谷', '地下河']
    return features[Math.min(features.length - 1, Math.floor(t * features.length))]
  },
  getColorBias() { return [-0.04, -0.02, 0.0] } // limestone greens
}

// ===== Volcanic Module =====
const volcanicModifier = {
  modifyHeight(x, y, baseH, t, climateF) {
    // Volcanic cones
    let cones = 0
    const vents = [[0.45, 0.5], [0.7, 0.35], [0.3, 0.65], [0.6, 0.7], [0.8, 0.5]]
    for (let i = 0; i < vents.length; i++) {
      const [cx, cy] = vents[i]
      const dx = (x - cx) / 0.06, dy = (y - cy) / 0.06
      const d = Math.sqrt(dx * dx + dy * dy)
      const height = (0.4 - i * 0.06)
      // Cone shape: steep sides, flattened top for larger ones
      const cone = height * Math.exp(-d * 1.8) / (1 + d * d * 2)
      cones += cone * (0.5 + t * 0.5)
      // Crater at top
      if (d < 0.3) {
        const crater = -height * 0.3 * Math.exp(-d * d * 12)
        cones += crater * (0.5 + t * 0.5)
      }
    }
    // Lava flow channels
    const lava = Math.sin(x * 8 + y * 5) * 0.03 * (0.5 + t * 0.5)
    return baseH * 0.5 + cones + lava
  },
  getColor(elevation, slope) {
    const e = clamp(elevation, 0, 1)
    if (e < 0.1) return mixColors([15, 15, 20], [25, 20, 25], e / 0.1)          // basalt
    if (e < 0.3) return mixColors([25, 20, 25], [45, 30, 28], (e - 0.1) / 0.2)  // dark lava
    if (e < 0.5) return mixColors([45, 30, 28], [80, 45, 35], (e - 0.3) / 0.2)  // oxidized
    if (e < 0.7) return mixColors([80, 45, 35], [120, 70, 40], (e - 0.5) / 0.2) // red-brown
    return mixColors([120, 70, 40], [160, 140, 120], (e - 0.7) / 0.3)           // ash
  },
  getFeatureName(t) {
    const features = ['盾状火山', '层状火山', '破火山口', '熔岩高原', '火山颈']
    return features[Math.min(features.length - 1, Math.floor(t * features.length))]
  },
  getColorBias() { return [0.02, 0.06, 0.04] } // dark rock tones
}

// ===== Climate Module =====
const climateModifier = {
  modifyHeight(x, y, baseH, t, climateF) {
    // Climate-dependent modifications
    const moisture = Math.sin(x * 6 + y * 4) * 0.5 + 0.5  // simulated precipitation
    // Humid areas: more dissection
    const dissection = moisture * Math.sin(x * 12 + y * 8) * 0.06 * (0.3 + t * 0.5)
    // Arid areas: less dissection, more wind features
    const aridity = 1 - moisture
    const windForm = aridity * fbm(x * 6, y * 6, 2) * 0.08
    // Periglacial features in cold areas (simulated by elevation)
    const highElev = baseH > 0.3 ? 1 : 0
    const periglacial = highElev * Math.sin(x * 15 + y * 12) * 0.04
    return baseH + dissection + windForm + periglacial
  },
  getColor(elevation, slope) {
    const e = clamp(elevation, 0, 1)
    if (e < 0.1) return mixColors([20, 60, 30], [40, 85, 45], e / 0.1)          // humid low
    if (e < 0.3) return mixColors([40, 85, 45], [85, 135, 70], (e - 0.1) / 0.2) // forest
    if (e < 0.5) return mixColors([85, 135, 70], [145, 125, 60], (e - 0.3) / 0.2) // transition
    if (e < 0.7) return mixColors([145, 125, 60], [100, 75, 45], (e - 0.5) / 0.2) // arid
    return mixColors([100, 75, 45], [190, 195, 200], (e - 0.7) / 0.3)           // alpine
  },
  getFeatureName(t) {
    const features = ['冰缘地貌', '气候-河流', '干旱区', '湿润区', '第四纪气候']
    return features[Math.min(features.length - 1, Math.floor(t * features.length))]
  },
  getColorBias() { return [-0.02, 0.0, 0.0] }
}

// ===== Registry =====
const terrainModules = {
  fluvial: fluvialModifier,
  structural: structuralModifier,
  glacial: glacialModifier,
  coastal: coastalModifier,
  aeolian: aeolianModifier,
  karst: karstModifier,
  volcanic: volcanicModifier,
  climate: climateModifier
}

// ===== Exports =====
export function modifyHeight(moduleId, xn, yn, baseH, t, climateF) {
  const mod = terrainModules[moduleId]
  if (!mod) return baseH
  return mod.modifyHeight(xn, yn, baseH, t, climateF)
}

export function getModuleColor(moduleId, elevation, slope) {
  const mod = terrainModules[moduleId]
  if (!mod) return null
  return mod.getColor(elevation, slope)
}

export function getModuleFeatureName(moduleId, timeline) {
  const mod = terrainModules[moduleId]
  if (!mod) return ''
  return mod.getFeatureName(timeline)
}

export function hasModuleModifier(moduleId) {
  return !!terrainModules[moduleId]
}

export function getModuleColorBias(moduleId) {
  const mod = terrainModules[moduleId]
  if (!mod || !mod.getColorBias) return [0, 0, 0]
  return mod.getColorBias()
}
