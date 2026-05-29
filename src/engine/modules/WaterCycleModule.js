// [M05] WaterCycleModule — 水循环·海陆间循环·洋流 — 必修一Ch3 · 选必1Ch4
import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

function addTube(group, points, color, radius = 0.025, opacity = 0.85) {
  const curve = new THREE.CatmullRomCurve3(points)
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 72, radius, 10, false),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.18,
      metalness: 0.18,
      transparent: true,
      opacity,
    }),
  )
  group.add(mesh)
  return mesh
}

function terrainHeight(x, z) {
  const ridge = Math.exp(-((x - 0.75) ** 2) * 2.2) * 0.75
  const foothill = Math.exp(-((x - 0.2) ** 2 + (z + 0.2) ** 2) * 1.8) * 0.28
  const texture = Math.sin(x * 4.2 + z * 2.4) * 0.06 + Math.sin(x * 9.0 - z * 5.0) * 0.025
  return -0.18 + ridge + foothill + texture
}

export function WaterCycleModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const timeline = params.timeline || 0

  const seaGeo = GeometryFactory.plane(4.2, 3.0, 60, 36)
  seaGeo.rotateX(-Math.PI / 2)
  const seaPos = seaGeo.attributes.position
  for (let i = 0; i < seaPos.count; i++) {
    const x = seaPos.getX(i)
    const z = seaPos.getZ(i)
    seaPos.setY(i, Math.sin(x * 6 + z * 3) * 0.025)
  }
  seaGeo.computeVertexNormals()
  const seaMat = new THREE.MeshStandardMaterial({
    color: 0x1a5a8a, roughness: 0.2, metalness: 0.5, transparent: true, opacity: 0.7,
  })
  const sea = new THREE.Mesh(seaGeo, seaMat)
  sea.position.set(-1.5, -0.5, 0)
  group.add(sea)

  const landGeo = GeometryFactory.plane(2.5, 2.7, 90, 90)
  landGeo.rotateX(-Math.PI / 2)
  const landPos = landGeo.attributes.position
  const landColors = new Float32Array(landPos.count * 3)
  for (let i = 0; i < landPos.count; i++) {
    const x = landPos.getX(i)
    const z = landPos.getZ(i)
    const h = terrainHeight(x, z)
    landPos.setY(i, h)
    const color = new THREE.Color()
    color.setHSL(h > 0.42 ? 0.1 : 0.23, h > 0.42 ? 0.22 : 0.42, 0.28 + Math.max(0, h) * 0.22)
    landColors[i * 3] = color.r
    landColors[i * 3 + 1] = color.g
    landColors[i * 3 + 2] = color.b
  }
  landGeo.setAttribute('color', new THREE.BufferAttribute(landColors, 3))
  landGeo.computeVertexNormals()
  const landMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82 })
  const land = new THREE.Mesh(landGeo, landMat)
  land.position.set(0.95, -0.12, 0)
  land.receiveShadow = true
  land.castShadow = true
  group.add(land)

  const snowGeo = new THREE.CircleGeometry(0.28, 32)
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xf3f6ff, roughness: 0.62, transparent: true, opacity: 0.9 })
  const snowCap = new THREE.Mesh(snowGeo, snowMat)
  snowCap.position.set(1.72, 0.66, 0.02)
  snowCap.rotation.x = -Math.PI / 2
  snowCap.scale.set(1.35, 0.75, 1)
  group.add(snowCap)

  const cloudGeo = GeometryFactory.sphere(1.2, 32)
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.9, metalness: 0, transparent: true, opacity: 0.15,
  })
  const cloud = new THREE.Mesh(cloudGeo, cloudMat)
  cloud.scale.set(1, 0.3, 1)
  cloud.position.set(0, 1.2, 0)
  group.add(cloud)

  for (let i = 0; i < 16; i++) {
    const puff = new THREE.Mesh(
      GeometryFactory.sphere(0.16 + (i % 4) * 0.025, 20),
      cloudMat.clone(),
    )
    puff.position.set(-0.7 + (i % 8) * 0.2, 1.08 + Math.sin(i) * 0.06, -0.4 + Math.floor(i / 8) * 0.42)
    puff.scale.set(1.4, 0.42, 0.85)
    group.add(puff)
  }

  const evapCount = 750
  const evapPositions = new Float32Array(evapCount * 3)
  for (let i = 0; i < evapCount; i++) {
    evapPositions[i * 3] = -1.5 + (Math.random() - 0.5) * 2
    evapPositions[i * 3 + 1] = -0.5 + Math.random() * 1.5
    evapPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.2
  }
  const evapGeo = new THREE.BufferGeometry()
  evapGeo.setAttribute('position', new THREE.BufferAttribute(evapPositions, 3))
  const evapMat = new THREE.PointsMaterial({
    color: 0x44aaff, size: 0.05, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })
  const evapParticles = new THREE.Points(evapGeo, evapMat)
  group.add(evapParticles)

  const transCount = 520
  const transPositions = new Float32Array(transCount * 3)
  for (let i = 0; i < transCount; i++) {
    transPositions[i * 3] = 0.1 + Math.random() * 2.0
    transPositions[i * 3 + 1] = 0.25 + Math.random() * 0.9
    transPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.4
  }
  const transGeo = new THREE.BufferGeometry()
  transGeo.setAttribute('position', new THREE.BufferAttribute(transPositions, 3))
  const transMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.04, transparent: true, opacity: 0.6,
    blending: THREE.NormalBlending, depthWrite: false,
  })
  const transParticles = new THREE.Points(transGeo, transMat)
  group.add(transParticles)

  const rainCount = 520
  const rainPositions = new Float32Array(rainCount * 3)
  for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = 0.5 + (Math.random() - 0.5) * 1.5
    rainPositions[i * 3 + 1] = 0.5 + Math.random() * 1.0
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.0
  }
  const rainGeo = new THREE.BufferGeometry()
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3))
  const rainMat = new THREE.PointsMaterial({
    color: 0x88ccff, size: 0.03, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })
  const rainParticles = new THREE.Points(rainGeo, rainMat)
  group.add(rainParticles)

  const riverPts = [
    new THREE.Vector3(1.75, 0.67, 0.05),
    new THREE.Vector3(1.55, 0.38, 0.1),
    new THREE.Vector3(1.25, 0.15, -0.06),
    new THREE.Vector3(0.5, -0.1, 0.08),
    new THREE.Vector3(-1.5, -0.5, 0),
  ]
  addTube(group, riverPts, 0x2266cc, 0.035, 0.82)
  addTube(group, [
    new THREE.Vector3(1.35, 0.32, 0.62),
    new THREE.Vector3(1.22, 0.18, 0.36),
    new THREE.Vector3(1.02, 0.04, 0.12),
    new THREE.Vector3(0.76, -0.03, 0.04),
  ], 0x4aa3ff, 0.017, 0.72)
  addTube(group, [
    new THREE.Vector3(1.42, 0.35, -0.55),
    new THREE.Vector3(1.24, 0.17, -0.32),
    new THREE.Vector3(0.95, 0.0, -0.12),
    new THREE.Vector3(0.68, -0.04, 0.02),
  ], 0x4aa3ff, 0.017, 0.72)

  addTube(group, [
    new THREE.Vector3(1.35, -0.36, 0.75),
    new THREE.Vector3(0.75, -0.5, 0.38),
    new THREE.Vector3(0.0, -0.58, 0.12),
    new THREE.Vector3(-1.2, -0.54, 0),
  ], 0x66c2ff, 0.018, 0.38)

  const treeMat = new THREE.MeshStandardMaterial({ color: 0x2f6b3f, roughness: 0.7 })
  for (let i = 0; i < 32; i++) {
    const tx = 0.1 + Math.random() * 1.8
    const tz = -0.9 + Math.random() * 1.8
    const ty = terrainHeight(tx - 0.95, tz) - 0.06
    const tree = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 7), treeMat)
    tree.position.set(tx, ty + 0.08, tz)
    group.add(tree)
  }

  if (labelSystem) {
    const lbls = [
      { text: '海洋', pos: [-1.5, -0.7, 1.0], color: '#4aa' },
      { text: '云层', pos: [0, 1.5, 0], color: '#ccc' },
      { text: '山脉', pos: [1.0, 2.2, 0], color: '#8a7a5a' },
      { text: '河流', pos: [0.5, -0.3, 0.5], color: '#2266cc' },
    ]
    lbls.forEach(l => {
      labelSystem.addToGroup(group, l.text, new THREE.Vector3(...l.pos), {
        color: l.color, fontSize: '13px',
      })
    })
  }

  const api = {
    update(dt, elapsed) {
      const speed = 0.3 + timeline * 2.0
      const evapArr = evapParticles.geometry.attributes.position.array
      for (let i = 0; i < evapCount; i++) {
        evapArr[i * 3 + 1] += speed * 0.3 * dt
        if (evapArr[i * 3 + 1] > 1.0) evapArr[i * 3 + 1] = -0.5
      }
      evapParticles.geometry.attributes.position.needsUpdate = true

      const transArr = transParticles.geometry.attributes.position.array
      for (let i = 0; i < transCount; i++) {
        transArr[i * 3] += speed * 0.4 * dt
        if (transArr[i * 3] > 2) transArr[i * 3] = -2
      }
      transParticles.geometry.attributes.position.needsUpdate = true

      const rainArr = rainParticles.geometry.attributes.position.array
      for (let i = 0; i < rainCount; i++) {
        rainArr[i * 3 + 1] -= speed * 0.5 * dt
        if (rainArr[i * 3 + 1] < -0.5) rainArr[i * 3 + 1] = 1.2
      }
      rainParticles.geometry.attributes.position.needsUpdate = true
    },
    dispose() {},
  }
  group.userData = { api }

  return group
}
