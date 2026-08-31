// HumanEnvironmentModule — 人地关系系统沙盘 — 资源 / 环境 / 可持续发展
// Consumes the pure config produced by getHumanEnvironmentConfig() and renders
// resource stocks as bars, demand/emission flows, signed feedback loops and
// threshold rings. Rendering quality is owned by BaseScene.
import * as THREE from 'three'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const STOCK_RADIUS = 0.13
const MAX_BAR_HEIGHT = 1.65
const STOCK_RING_RADIUS = 1.95
const FLOW_DOTS_PER_FLOW = 6
const ARC_SEGMENTS = 28

const BAR_PALETTE = ['#70c174', '#2a9d8f', '#f4d35e', '#8ed081', '#52796f', '#4a7c59']

const KIND_COLORS = {
  supply: '#4cc9f0',
  demand: '#ffb703',
  emission: '#ff4d6d',
}

const SIGN_COLORS = {
  positive: '#ff9f1c',
  negative: '#5aa9ff',
}

function hexColor(hex) {
  return new THREE.Color(hex)
}

function stockColor(index) {
  return hexColor(BAR_PALETTE[index % BAR_PALETTE.length])
}

function makeArc(a, b, lift = 0.5) {
  const mid = a.clone().lerp(b, 0.5)
  mid.y += lift
  const points = []
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const t = i / ARC_SEGMENTS
    const w0 = (1 - t) * (1 - t)
    const w1 = 2 * (1 - t) * t
    const w2 = t * t
    points.push(new THREE.Vector3(
      w0 * a.x + w1 * mid.x + w2 * b.x,
      w0 * a.y + w1 * mid.y + w2 * b.y,
      w0 * a.z + w1 * mid.z + w2 * b.z,
    ))
  }
  return points
}

function sampleArc(points, t) {
  const clamped = Math.min(0.9999, Math.max(0, t))
  const scaled = clamped * (points.length - 1)
  const index = Math.floor(scaled)
  const frac = scaled - index
  const a = points[index]
  const b = points[Math.min(index + 1, points.length - 1)]
  return new THREE.Vector3().lerpVectors(a, b, frac)
}

function makeLine(points, color, width, opacity = 0.6, dashed = false) {
  const geometry = new MeshLineGeometry()
  geometry.setPoints(points.flatMap((p) => [p.x, p.y, p.z]))
  const material = new MeshLineMaterial({
    color,
    lineWidth: width,
    transparent: true,
    opacity,
    depthWrite: false,
    dashArray: dashed ? 0.16 : 0,
    dashRatio: dashed ? 0.5 : 0,
    dashOffset: 0,
  })
  return new THREE.Mesh(geometry, material)
}

function makeArrow(position, direction, color, width = 0.05) {
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(width * 2.6 + 0.04, width * 6 + 0.1, 8),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, roughness: 0.3 }),
  )
  arrow.position.copy(position)
  arrow.lookAt(position.clone().add(direction))
  arrow.rotateX(Math.PI / 2)
  return arrow
}

function addLabel(labelSystem, group, text, position, color = '#eaf2ff', fontSize = '12px') {
  if (!labelSystem || !text) return
  labelSystem.addToGroup(group, text, position, {
    color,
    fontSize,
    fontWeight: '700',
    background: 'rgba(14,22,32,0.7)',
    whiteSpace: 'pre-line',
  })
}

export function createHumanEnvironmentModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const config = params.config || {}
  const stocks = config.stocks || []
  const flows = config.flows || []
  const feedbacks = config.feedbacks || []
  const thresholds = config.thresholds || []

  const stockMap = new Map()
  const stockBars = []

  // Platform.
  const platform = new THREE.Mesh(
    GeometryFactory.ring(STOCK_RING_RADIUS + 0.7, STOCK_RING_RADIUS + 0.78, 96),
    new THREE.MeshBasicMaterial({ color: 0x4a7c59, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }),
  )
  platform.rotation.x = -Math.PI / 2
  platform.position.y = -0.18
  group.add(platform)
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(STOCK_RING_RADIUS + 0.7, 64),
    new THREE.MeshStandardMaterial({ color: 0x0d1f16, roughness: 0.92, metalness: 0.08, transparent: true, opacity: 0.5 }),
  )
  disc.rotation.x = -Math.PI / 2
  disc.position.y = -0.18
  disc.receiveShadow = true
  group.add(disc)

  // Stocks as vertical bars around the ring.
  stocks.forEach((entry, index) => {
    const angle = (index / Math.max(1, stocks.length)) * Math.PI * 2 - Math.PI / 2
    const position = new THREE.Vector3(
      Math.cos(angle) * STOCK_RING_RADIUS,
      0,
      Math.sin(angle) * STOCK_RING_RADIUS,
    )
    const height = Math.max(0.18, entry.value * MAX_BAR_HEIGHT)

    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(STOCK_RADIUS, STOCK_RADIUS * 1.08, height, 32),
      new THREE.MeshStandardMaterial({
        color: stockColor(index),
        roughness: 0.45,
        metalness: 0.18,
        emissive: stockColor(index),
        emissiveIntensity: 0.08,
      }),
    )
    bar.position.set(position.x, height / 2, position.z)
    bar.castShadow = true
    bar.receiveShadow = true
    group.add(bar)
    stockBars.push({ mesh: bar, height, base: position })
    stockMap.set(entry.id, { position, height, index })

    addLabel(labelSystem, group, entry.label, position.clone().add(new THREE.Vector3(0, -0.28, 0)), '#' + stockColor(index).getHexString(), '11px')
  })

  // Flows (supply / demand / emission).
  const flowAnims = []
  flows.forEach((entry) => {
    const from = stockMap.get(entry.from)
    const to = stockMap.get(entry.to)
    if (!from || !to) return
    const color = KIND_COLORS[entry.kind] || '#4cc9f0'
    const a = from.position.clone().add(new THREE.Vector3(0, from.height * 0.7, 0))
    const b = to.position.clone().add(new THREE.Vector3(0, to.height * 0.7, 0))
    const arc = makeArc(a, b, 0.5)
    group.add(makeLine(arc, hexColor(color), 0.035, 0.6))

    const headDir = arc[arc.length - 1].clone().sub(arc[arc.length - 2]).normalize()
    group.add(makeArrow(arc[arc.length - 1], headDir, hexColor(color)))

    if (entry.label) addLabel(labelSystem, group, entry.label, arc[Math.floor(arc.length / 2)].clone().add(new THREE.Vector3(0, 0.2, 0)), color, '10px')

    const dots = []
    for (let i = 0; i < FLOW_DOTS_PER_FLOW; i++) {
      const dot = new THREE.Mesh(
        GeometryFactory.sphere(0.03, 16),
        new THREE.MeshBasicMaterial({ color: hexColor(color), transparent: true, opacity: 0.95 }),
      )
      group.add(dot)
      dots.push({ mesh: dot, t: i / FLOW_DOTS_PER_FLOW })
    }
    flowAnims.push({ arc, dots, speed: 0.14 })
  })

  // Feedbacks (signed loops above the stocks).
  const feedbackLines = []
  feedbacks.forEach((entry, feedbackIndex) => {
    const from = stockMap.get(entry.from)
    const to = stockMap.get(entry.to)
    if (!from || !to) return
    const color = SIGN_COLORS[entry.sign] || '#5aa9ff'
    const isSelf = entry.from === entry.to
    const a = from.position.clone().add(new THREE.Vector3(0, 1.05 + feedbackIndex * 0.1, 0))
    const b = isSelf
      ? a.clone().add(new THREE.Vector3(0.5, 0.28, 0.2))
      : to.position.clone().add(new THREE.Vector3(0, 1.05 + feedbackIndex * 0.1, 0))
    const arc = makeArc(a, b, isSelf ? 0.35 : 0.55)
    const line = makeLine(arc, hexColor(color), 0.026, 0.5, true)
    line.userData.feedback = { phase: feedbackIndex * 0.6 }
    group.add(line)
    feedbackLines.push(line)

    const headDir = arc[arc.length - 1].clone().sub(arc[arc.length - 2]).normalize()
    group.add(makeArrow(arc[arc.length - 1], headDir, hexColor(color), 0.03))

    const signText = `${entry.label || ''}${entry.sign === 'positive' ? ' +' : ' −'}`
    addLabel(labelSystem, group, signText, arc[Math.floor(arc.length / 2)].clone().add(new THREE.Vector3(0, 0.16, 0)), color, '10px')
  })

  // Thresholds as dashed limit rings + labels.
  thresholds.forEach((entry, index) => {
    const radius = STOCK_RING_RADIUS + 0.34 + index * 0.18
    const height = entry.limit * MAX_BAR_HEIGHT
    const ringPoints = []
    const segments = 96
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      ringPoints.push(new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius))
    }
    const ring = makeLine(ringPoints, hexColor('#ffcf5c'), 0.02, 0.55, true)
    ring.userData.threshold = { phase: index * 0.5 }
    group.add(ring)
    addLabel(labelSystem, group, entry.label, new THREE.Vector3(radius + 0.3, height, 0), '#ffe0a3', '10px')
  })

  addLabel(labelSystem, group, config.title || '人地关系系统', new THREE.Vector3(0, 2.35, 0), '#ffffff', '16px')
  if (config.subtitle) addLabel(labelSystem, group, config.subtitle, new THREE.Vector3(0, 2.02, 0), '#a9c6b8', '11px')

  const api = {
    update(dt, elapsed) {
      group.rotation.y += dt * 0.025
      stockBars.forEach(({ mesh }) => {
        const s = 1 + Math.sin(elapsed * 1.6 + mesh.position.y) * 0.02
        mesh.scale.set(s, 1, s)
      })
      group.traverse((obj) => {
        if (obj.userData.feedback && obj.material) {
          obj.material.dashOffset = (elapsed * 0.4 + obj.userData.feedback.phase) % 1
        }
        if (obj.userData.threshold && obj.material) {
          obj.material.dashOffset = (elapsed * 0.25 + obj.userData.threshold.phase) % 1
        }
      })
      for (const anim of flowAnims) {
        for (const dot of anim.dots) {
          dot.t += dt * anim.speed
          if (dot.t > 1) dot.t -= 1
          dot.mesh.position.copy(sampleArc(anim.arc, dot.t))
        }
      }
    },
    dispose() {},
  }

  group.userData = { api }
  return group
}
