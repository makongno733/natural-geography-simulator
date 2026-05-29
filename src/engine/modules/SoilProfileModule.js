// [M07] SoilProfileModule — 土壤剖面·O/A/B/C层·淋溶 — 必修一Ch5
import * as THREE from 'three'
import { SOIL_LAYERS } from '../../soil-profile/soilData.js'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

function addSpeckles(group, radius, yMin, yMax, color, count, size) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * radius * 0.96
    positions[i * 3] = Math.cos(angle) * r
    positions[i * 3 + 1] = yMin + Math.random() * (yMax - yMin)
    positions[i * 3 + 2] = Math.sin(angle) * r
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  })
  group.add(new THREE.Points(geo, mat))
}

function addRootSystem(group, radius, topY) {
  const rootMat = new THREE.LineBasicMaterial({ color: 0x6b4a2f, transparent: true, opacity: 0.55 })
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2
    const startR = Math.random() * radius * 0.35
    const depth = 0.35 + Math.random() * 0.7
    const wiggle = 0.08 + Math.random() * 0.05
    const points = []
    for (let j = 0; j < 6; j++) {
      const t = j / 5
      points.push(new THREE.Vector3(
        Math.cos(angle + t * 0.8) * (startR + t * radius * 0.45) + Math.sin(t * 8 + i) * wiggle,
        topY - t * depth,
        Math.sin(angle + t * 0.8) * (startR + t * radius * 0.45),
      ))
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    group.add(new THREE.Line(geo, rootMat))
  }
}

export function SoilProfileModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const mode = params.mode || 'simple'
  const layers = SOIL_LAYERS[mode] || SOIL_LAYERS.simple

  let yOffset = -1
  const totalHeight = 2
  const radius = 0.8
  const layerMeshes = []

  layers.forEach(layer => {
    const height = layer.thickness * totalHeight
    const yPos = yOffset + height / 2

    const bodyGeo = GeometryFactory.cylinder(radius, radius, height, 32)
    const bodyMat = MaterialLibrary.pbr({
      color: layer.color,
      roughness: 0.7,
      metalness: 0.05,
      transparent: true,
      opacity: 0.92,
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = yPos
    body.castShadow = true
    body.receiveShadow = true
    body.userData = { layerId: layer.id }
    group.add(body)
    layerMeshes.push(body)

    addSpeckles(group, radius, yPos - height / 2 + 0.02, yPos + height / 2 - 0.02, layer.color, Math.max(28, Math.round(height * 95)), 0.018)
    if (layer.id === 'C' || layer.id === 'R') {
      for (let i = 0; i < 10; i++) {
        const stone = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.035 + Math.random() * 0.035, 0),
          MaterialLibrary.pbr({ color: 0x7a7268, roughness: 0.9 }),
        )
        const angle = Math.random() * Math.PI * 2
        const r = Math.random() * radius * 0.72
        stone.position.set(Math.cos(angle) * r, yPos - height * 0.35 + Math.random() * height * 0.7, Math.sin(angle) * r)
        stone.rotation.set(Math.random(), Math.random(), Math.random())
        group.add(stone)
      }
    }

    if (yOffset > -1) {
      const edgeGeo = GeometryFactory.ring(radius - 0.005, radius, 48)
      const edgeMat = new THREE.MeshBasicMaterial({
        color: 0x333333, transparent: true, opacity: 0.3, side: THREE.DoubleSide,
      })
      const edge = new THREE.Mesh(edgeGeo, edgeMat)
      edge.rotation.x = -Math.PI / 2
      edge.position.y = yPos - height / 2
      group.add(edge)
    }

    if (labelSystem) {
      labelSystem.addToGroup(group, layer.label,
        new THREE.Vector3(radius + 0.6, yPos, 0), {
          fontSize: '14px',
          clickable: true,
        })
    }

    yOffset += height
  })

  addRootSystem(group, radius, yOffset - 0.02)

  const groundGeo = GeometryFactory.plane(6, 6)
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.25 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.02
  ground.receiveShadow = true
  group.add(ground)

  const leafCount = 110
  const leafPositions = new Float32Array(leafCount * 3)
  for (let i = 0; i < leafCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * radius * 0.9
    leafPositions[i * 3] = Math.cos(angle) * r
    leafPositions[i * 3 + 1] = yOffset - 0.01
    leafPositions[i * 3 + 2] = Math.sin(angle) * r
  }
  const leafGeo = new THREE.BufferGeometry()
  leafGeo.setAttribute('position', new THREE.BufferAttribute(leafPositions, 3))
  const leafMat = new THREE.PointsMaterial({
    color: 0x4a3728, size: 0.04, transparent: true, opacity: 0.6, depthWrite: false,
  })
  const leafParticles = new THREE.Points(leafGeo, leafMat)
  group.add(leafParticles)

  const api = {
    getLayerMeshes() { return layerMeshes },
    dispose() {},
  }
  group.userData = { api }

  return group
}
