// SpatialNetworkModule — 空间网络系统沙盘 — 人口 / 城镇 / 产业 / 区域联系
// Consumes the pure config produced by getSpatialNetworkConfig() and renders a
// weighted, directed node/flow network with animated particles. Rendering
// quality (antialias, shadows, tone mapping, pixel ratio) is owned by BaseScene.
import * as THREE from 'three'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const NODE_RADIUS = 0.16
const FLOW_DOTS_PER_FLOW = 6
const FLOW_SEGMENTS = 28

function colorOf(hex) {
  return new THREE.Color(hex)
}

function paletteColor(palette, index) {
  return colorOf(palette[index % palette.length])
}

function makeArc(a, b, lift = 0.55) {
  const mid = a.clone().lerp(b, 0.5)
  mid.y += lift
  const points = []
  for (let i = 0; i <= FLOW_SEGMENTS; i++) {
    const t = i / FLOW_SEGMENTS
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

function makeLine(points, color, width, opacity = 0.7) {
  const geometry = new MeshLineGeometry()
  geometry.setPoints(points.flatMap((p) => [p.x, p.y, p.z]))
  const material = new MeshLineMaterial({
    color,
    lineWidth: width,
    transparent: true,
    opacity,
    depthWrite: false,
    sizeAttenuation: true,
  })
  return new THREE.Mesh(geometry, material)
}

function addLabel(labelSystem, group, text, position, color = '#dfe7ff', fontSize = '12px') {
  if (!labelSystem || !text) return
  labelSystem.addToGroup(group, text, position, {
    color,
    fontSize,
    fontWeight: '700',
    background: 'rgba(14,20,32,0.7)',
    whiteSpace: 'pre-line',
  })
}

export function createSpatialNetworkModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const config = params.config || {}
  const palette = config.palette && config.palette.length ? config.palette : ['#5aa9ff', '#ff8c42', '#8ed081', '#f9c74f', '#b39ddb', '#4dd0e1']
  const nodes = config.nodes || []
  const flows = config.flows || []

  const nodeMap = new Map()
  const nodeMeshes = []
  const flowAnims = []

  // Faint platform under the network.
  const platform = new THREE.Mesh(
    GeometryFactory.ring(2.55, 2.62, 96),
    new THREE.MeshBasicMaterial({ color: 0x33507a, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }),
  )
  platform.rotation.x = -Math.PI / 2
  platform.position.y = -0.28
  group.add(platform)
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(2.55, 64),
    new THREE.MeshStandardMaterial({ color: 0x0e1b30, roughness: 0.9, metalness: 0.1, transparent: true, opacity: 0.55 }),
  )
  disc.rotation.x = -Math.PI / 2
  disc.position.y = -0.28
  disc.receiveShadow = true
  group.add(disc)

  // Nodes.
  nodes.forEach((entry, index) => {
    const position = new THREE.Vector3(...entry.position)
    nodeMap.set(entry.id, { position, index })

    const sphere = new THREE.Mesh(
      GeometryFactory.sphere(NODE_RADIUS, 48),
      new THREE.MeshStandardMaterial({
        color: paletteColor(palette, index),
        roughness: 0.32,
        metalness: 0.12,
        emissive: paletteColor(palette, index),
        emissiveIntensity: 0.16,
      }),
    )
    sphere.position.copy(position)
    sphere.castShadow = true
    sphere.userData.pulse = index * 0.5
    group.add(sphere)
    nodeMeshes.push(sphere)

    addLabel(labelSystem, group, entry.label, position.clone().add(new THREE.Vector3(0, 0.34, 0)), '#' + paletteColor(palette, index).getHexString())
  })

  // Flows (weighted, directed).
  flows.forEach((entry) => {
    const from = nodeMap.get(entry.from)
    const to = nodeMap.get(entry.to)
    if (!from || !to) return

    const arc = makeArc(from.position, to.position, 0.5 + entry.weight * 0.3)
    const line = makeLine(arc, colorOf('#8fd0ff'), entry.width, 0.55)
    line.userData.flow = { phase: (from.index + to.index) * 0.33 }
    group.add(line)

    // Directional arrowhead cone at the destination.
    const headDir = arc[arc.length - 1].clone().sub(arc[arc.length - 2]).normalize()
    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(entry.width * 2.6 + 0.05, entry.width * 6 + 0.12, 8),
      new THREE.MeshStandardMaterial({ color: 0x8fd0ff, emissive: 0x2f7fd0, emissiveIntensity: 0.4, roughness: 0.3 }),
    )
    arrow.position.copy(arc[arc.length - 1])
    arrow.lookAt(arc[arc.length - 1].clone().add(headDir))
    arrow.rotateX(Math.PI / 2)
    group.add(arrow)

    const mid = arc[Math.floor(arc.length / 2)]
    if (entry.label) addLabel(labelSystem, group, entry.label, mid.clone().add(new THREE.Vector3(0, 0.18, 0)), '#bfe3ff', '10px')

    const dots = []
    for (let i = 0; i < FLOW_DOTS_PER_FLOW; i++) {
      const dot = new THREE.Mesh(
        GeometryFactory.sphere(0.035, 16),
        new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0.95 }),
      )
      group.add(dot)
      dots.push({ mesh: dot, t: i / FLOW_DOTS_PER_FLOW })
    }
    flowAnims.push({ arc, dots, speed: 0.12 + entry.weight * 0.14 })
  })

  addLabel(labelSystem, group, config.title || '空间网络系统', new THREE.Vector3(0, 2.2, 0), '#ffffff', '16px')
  if (config.subtitle) addLabel(labelSystem, group, config.subtitle, new THREE.Vector3(0, 1.9, 0), '#9fb8dd', '11px')

  const api = {
    update(dt, elapsed) {
      group.rotation.y += dt * 0.03
      nodeMeshes.forEach((mesh) => {
        const s = 1 + Math.sin(elapsed * 1.9 + mesh.userData.pulse) * 0.06
        mesh.scale.setScalar(s)
      })
      group.traverse((obj) => {
        if (obj.userData.flow && obj.material && obj.material.opacity !== undefined) {
          obj.material.opacity = 0.42 + Math.sin(elapsed * 1.4 + obj.userData.flow.phase * Math.PI * 2) * 0.14
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
