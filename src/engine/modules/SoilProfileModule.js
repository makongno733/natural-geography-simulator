import * as THREE from 'three'
import { SOIL_LAYERS } from '../../soil-profile/soilData.js'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

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

  const groundGeo = GeometryFactory.plane(6, 6)
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.25 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.02
  ground.receiveShadow = true
  group.add(ground)

  const leafCount = 60
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
