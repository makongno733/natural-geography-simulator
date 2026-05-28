import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

export function WaterCycleModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const timeline = params.timeline || 0

  const seaGeo = GeometryFactory.plane(4, 2.5)
  seaGeo.rotateX(-Math.PI / 2)
  const seaMat = new THREE.MeshStandardMaterial({
    color: 0x1a5a8a, roughness: 0.2, metalness: 0.5, transparent: true, opacity: 0.7,
  })
  const sea = new THREE.Mesh(seaGeo, seaMat)
  sea.position.set(-1.5, -0.5, 0)
  group.add(sea)

  const landGeo = new THREE.BoxGeometry(2, 1.5, 2.5)
  const landMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.8 })
  const land = new THREE.Mesh(landGeo, landMat)
  land.position.set(1.0, 0.2, 0)
  group.add(land)

  const mountainGeo = new THREE.ConeGeometry(0.6, 1.0, 8, 4)
  const mountainMat = new THREE.MeshStandardMaterial({ color: 0x6b5b4a, roughness: 0.7 })
  const mountain = new THREE.Mesh(mountainGeo, mountainMat)
  mountain.position.set(1.0, 1.4, 0)
  group.add(mountain)

  const cloudGeo = GeometryFactory.sphere(1.2, 32)
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.9, metalness: 0, transparent: true, opacity: 0.15,
  })
  const cloud = new THREE.Mesh(cloudGeo, cloudMat)
  cloud.scale.set(1, 0.3, 1)
  cloud.position.set(0, 1.2, 0)
  group.add(cloud)

  const evapPositions = new Float32Array(500 * 3)
  for (let i = 0; i < 500; i++) {
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

  const transPositions = new Float32Array(400 * 3)
  for (let i = 0; i < 400; i++) {
    transPositions[i * 3] = -2 + Math.random() * 4
    transPositions[i * 3 + 1] = 0.8 + Math.random() * 0.6
    transPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.0
  }
  const transGeo = new THREE.BufferGeometry()
  transGeo.setAttribute('position', new THREE.BufferAttribute(transPositions, 3))
  const transMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.04, transparent: true, opacity: 0.6,
    blending: THREE.NormalBlending, depthWrite: false,
  })
  const transParticles = new THREE.Points(transGeo, transMat)
  group.add(transParticles)

  const rainPositions = new Float32Array(300 * 3)
  for (let i = 0; i < 300; i++) {
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
    new THREE.Vector3(1.0, 1.6, 0),
    new THREE.Vector3(1.4, 1.0, 0),
    new THREE.Vector3(1.6, 0.3, 0),
    new THREE.Vector3(0.5, -0.1, 0),
    new THREE.Vector3(-1.5, -0.5, 0),
  ]
  const riverCurve = new THREE.CatmullRomCurve3(riverPts)
  const riverGeo = new THREE.TubeGeometry(riverCurve, 64, 0.04, 8, false)
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x2266cc, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.7,
  })
  const river = new THREE.Mesh(riverGeo, riverMat)
  group.add(river)

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
      for (let i = 0; i < 500; i++) {
        evapArr[i * 3 + 1] += speed * 0.3 * dt
        if (evapArr[i * 3 + 1] > 1.0) evapArr[i * 3 + 1] = -0.5
      }
      evapParticles.geometry.attributes.position.needsUpdate = true

      const transArr = transParticles.geometry.attributes.position.array
      for (let i = 0; i < 400; i++) {
        transArr[i * 3] += speed * 0.4 * dt
        if (transArr[i * 3] > 2) transArr[i * 3] = -2
      }
      transParticles.geometry.attributes.position.needsUpdate = true

      const rainArr = rainParticles.geometry.attributes.position.array
      for (let i = 0; i < 300; i++) {
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
