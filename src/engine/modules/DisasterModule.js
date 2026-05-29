// [M08] DisasterModule — 台风·暴雨·地震·滑坡泥石流灾害模拟 — 必修一Ch6
import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'

function buildTyphoon(subGroup) {
  const refs = {}

  const seg = 60
  const seaGeo = new THREE.PlaneGeometry(8, 8, seg, seg)
  seaGeo.rotateX(-Math.PI / 2)
  refs.seaVerts = seaGeo.attributes.position.array.slice()
  const seaMat = new THREE.MeshStandardMaterial({ color: 0x1a4a6a, roughness: 0.25, metalness: 0.4 })
  refs.sea = new THREE.Mesh(seaGeo, seaMat)
  refs.sea.position.y = -0.45
  subGroup.add(refs.sea)

  const layerDefs = [
    { count: 2500, rMin: 0.25, rMax: 0.7, h: 0.05, spread: 0.08, color: 0xeeeeff, size: 0.07, opacity: 0.7, speedMul: 1.2 },
    { count: 3500, rMin: 0.3, rMax: 1.6, h: 0.12, spread: 0.18, color: 0xccccdd, size: 0.1, opacity: 0.55, speedMul: 0.8 },
    { count: 2500, rMin: 0.5, rMax: 2.3, h: 0.2, spread: 0.25, color: 0x999999, size: 0.14, opacity: 0.4, speedMul: 0.5 },
    { count: 1500, rMin: 1.0, rMax: 3.0, h: 0.3, spread: 0.3, color: 0x666688, size: 0.2, opacity: 0.3, speedMul: 0.3 },
  ]

  refs.spiralLayers = []
  refs.spiralBases = []
  refs.spiralSpeeds = []

  layerDefs.forEach(ld => {
    const count = ld.count
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    const colObj = new THREE.Color(ld.color)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = ld.rMin + Math.random() * (ld.rMax - ld.rMin)
      const spiral = angle + r * 2.2
      const jitter = (Math.random() - 0.5) * ld.spread * 3
      const hVar = (Math.random() - 0.5) * ld.spread
      pos[i * 3] = Math.cos(spiral) * r + jitter * 0.2
      pos[i * 3 + 1] = ld.h + hVar
      pos[i * 3 + 2] = Math.sin(spiral) * r + jitter * 0.3
      const bright = 0.7 + Math.random() * 0.3
      col[i * 3] = colObj.r * bright
      col[i * 3 + 1] = colObj.g * bright
      col[i * 3 + 2] = colObj.b * bright
      spd[i] = ld.speedMul * (0.4 + Math.random() * 0.6)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const mat = MaterialLibrary.particle({ size: ld.size, vertexColors: true, opacity: ld.opacity })
    const pts = new THREE.Points(geo, mat)
    subGroup.add(pts)
    refs.spiralLayers.push(pts)
    refs.spiralBases.push(pos.slice())
    refs.spiralSpeeds.push(spd)
  })

  const eyeGeo = GeometryFactory.torus(0.22, 0.06, 16, 48)
  eyeGeo.rotateX(Math.PI / 2)
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x445566, roughness: 0.5, metalness: 0.3, emissive: 0x222233, emissiveIntensity: 0.3,
  })
  refs.eyeWall = new THREE.Mesh(eyeGeo, eyeMat)
  refs.eyeWall.position.y = 0.1
  subGroup.add(refs.eyeWall)

  const eyeInner = new THREE.Mesh(
    GeometryFactory.sphere(0.18, 24),
    new THREE.MeshBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.15 }),
  )
  eyeInner.position.y = 0.1
  subGroup.add(eyeInner)

  const rainCount = 3000
  const rPos = new Float32Array(rainCount * 3)
  for (let i = 0; i < rainCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = 0.3 + Math.random() * 3.5
    const spiral = angle + r * 2.5
    rPos[i * 3] = Math.cos(spiral) * r + (Math.random() - 0.5) * 0.15
    rPos[i * 3 + 1] = (Math.random() - 0.5) * 1.5 - 0.3
    rPos[i * 3 + 2] = Math.sin(spiral) * r + (Math.random() - 0.5) * 0.15
  }
  const rainGeo = new THREE.BufferGeometry()
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3))
  const rainMat = MaterialLibrary.additiveParticle({ color: 0x6699cc, size: 0.025 })
  rainMat.opacity = 0.35
  refs.rain = new THREE.Points(rainGeo, rainMat)
  subGroup.add(refs.rain)
  refs.rainBase = rPos.slice()

  const colGeo = new THREE.CylinderGeometry(0.08, 0.2, 1.2, 16)
  const colMat = new THREE.MeshBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.12 })
  refs.updraft = new THREE.Mesh(colGeo, colMat)
  refs.updraft.position.y = 0.5
  subGroup.add(refs.updraft)

  refs.feederBands = []
  for (let b = 0; b < 5; b++) {
    const points = []
    const phase = b * Math.PI * 0.42
    for (let i = 0; i <= 90; i++) {
      const t = i / 90
      const r = 0.62 + t * 2.65
      const a = phase + t * Math.PI * 1.8
      points.push(new THREE.Vector3(Math.cos(a) * r, 0.16 + t * 0.16, Math.sin(a) * r))
    }
    const curve = new THREE.CatmullRomCurve3(points)
    const band = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 120, 0.028, 8, false),
      new THREE.MeshBasicMaterial({
        color: 0xddeeff,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    subGroup.add(band)
    refs.feederBands.push(band)
  }

  refs.rainShafts = []
  const shaftMat = new THREE.LineBasicMaterial({ color: 0x8ec5ff, transparent: true, opacity: 0.25 })
  for (let i = 0; i < 90; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 0.45 + Math.random() * 2.7
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0.35 + Math.random() * 0.5, z),
      new THREE.Vector3(x + 0.06, -0.42, z + 0.02),
    ])
    const line = new THREE.Line(geo, shaftMat)
    subGroup.add(line)
    refs.rainShafts.push(line)
  }

  const lightningGeo = GeometryFactory.sphere(2.5, 8)
  const lightningMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0, depthWrite: false,
  })
  refs.lightning = new THREE.Mesh(lightningGeo, lightningMat)
  refs.lightning.position.y = 0.2
  subGroup.add(refs.lightning)

  return refs
}

function buildEarthquake(subGroup) {
  const refs = {}
  const gSize = 5
  const gSeg = 80
  const geo = new THREE.PlaneGeometry(gSize, gSize, gSeg, gSeg)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    pos.setY(i, Math.sin(x * 3 + z * 2) * 0.03 + Math.sin(x * 7 - z * 5) * 0.015)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.85, metalness: 0.05 })
  refs.ground = new THREE.Mesh(geo, groundMat)
  refs.ground.receiveShadow = true
  subGroup.add(refs.ground)
  refs.groundBase = geo.attributes.position.array.slice()

  const roadMat = new THREE.MeshStandardMaterial({ color: 0x373331, roughness: 0.8 })
  ;[
    { pos: [0, 0.025, -0.75], scale: [4.6, 0.018, 0.08], rot: 0.08 },
    { pos: [-0.45, 0.03, 0.35], scale: [0.08, 0.018, 3.7], rot: -0.18 },
  ].forEach(r => {
    const road = new THREE.Mesh(GeometryFactory.box(r.scale[0], r.scale[1], r.scale[2]), roadMat)
    road.position.set(...r.pos)
    road.rotation.y = r.rot
    subGroup.add(road)
  })

  const gridHelper = new THREE.PolarGridHelper(3, 24, 16, 256, 0x5a4a3a, 0x5a4a3a)
  gridHelper.position.y = 0.005
  subGroup.add(gridHelper)

  const fp = []
  for (let i = 0; i <= 30; i++) {
    const t = i / 30
    fp.push(new THREE.Vector3(-1.8 + t * 3.6, 0.01, Math.sin(t * Math.PI * 2) * 0.3))
  }
  const faultGeo = new THREE.BufferGeometry().setFromPoints(fp)
  subGroup.add(new THREE.Line(faultGeo, new THREE.LineBasicMaterial({ color: 0xff3333 })))

  const scarpMat = new THREE.MeshStandardMaterial({ color: 0x6f4c38, roughness: 0.82 })
  for (let i = 0; i < 12; i++) {
    const t = i / 11
    const block = new THREE.Mesh(GeometryFactory.box(0.28, 0.05 + (i % 2) * 0.035, 0.12), scarpMat)
    block.position.set(-1.7 + t * 3.4, 0.04 + (i % 2) * 0.025, Math.sin(t * Math.PI * 2) * 0.3)
    block.rotation.y = 0.35 + Math.sin(i) * 0.2
    block.castShadow = true
    subGroup.add(block)
  }

  refs.buildings = []
  const bldgDefs = [
    [-1.2, -1.0, 0.4, 0xffc4a3], [0.9, 0.8, 0.55, 0xdde8f0],
    [-0.6, 0.6, 0.3, 0xe8d8c8], [0.7, -0.7, 0.45, 0xc8dce8],
    [-0.3, -1.1, 0.25, 0xf0e0d0], [0.4, 0.3, 0.35, 0xd0d8e0],
    [-0.9, 0.8, 0.5, 0xe0d0c0], [1.0, -0.2, 0.6, 0xd8e4f0],
    [-0.5, -0.4, 0.2, 0xf5e8d8], [0.2, -1.0, 0.3, 0xdce8f4],
    [0.5, 0.9, 0.38, 0xf0e4d4], [-1.1, -0.6, 0.42, 0xe0e8f0],
    [0.8, 0.2, 0.28, 0xd4dce8], [-0.7, -0.8, 0.22, 0xf8ece0],
    [0.0, -0.6, 0.48, 0xd8e4ec], [-1.3, 0.3, 0.35, 0xe4d4c4],
    [1.1, 0.6, 0.32, 0xcce0f0], [0.3, -0.4, 0.5, 0xdce4ec],
    [-0.2, 1.0, 0.28, 0xf0e8dc], [0.6, -1.2, 0.38, 0xe0e4ec],
  ]
  bldgDefs.forEach(([bx, bz, h, clr]) => {
    const w = 0.06 + Math.random() * 0.1, d = 0.06 + Math.random() * 0.1
    const bldg = new THREE.Mesh(
      GeometryFactory.box(w, h, d),
      new THREE.MeshStandardMaterial({ color: clr, roughness: 0.6 }),
    )
    bldg.position.set(bx, h / 2, bz)
    bldg.castShadow = true; bldg.receiveShadow = true
    subGroup.add(bldg)
    refs.buildings.push({ mesh: bldg, baseY: h / 2 })
  })

  const rings = []
  for (let j = 0; j < 3; j++) {
    const ringGeo = GeometryFactory.ring(0.1, 0.15, 48)
    ringGeo.rotateX(-Math.PI / 2)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff6644, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.y = 0.01
    ring.visible = false
    ring.userData = { phase: j * 0.33, baseScale: 0.2 }
    subGroup.add(ring)
    rings.push(ring)
  }
  refs.seismicRings = rings

  return refs
}

export function DisasterModule(scene, params, services) {
  const group = new THREE.Group()
  let activeModule = params.activeModule || 'typhoon'
  let timeline = params.timeline || 0
  let refs = {}
  let subGroup = new THREE.Group()

  function clearSub() {
    group.remove(subGroup)
    subGroup.traverse(c => {
      if (c.geometry) c.geometry.dispose()
      if (c.material) c.material.dispose()
    })
    subGroup = new THREE.Group()
    refs = {}
  }

  function buildSub(type) {
    clearSub()
    switch (type) {
      case 'typhoon': refs = buildTyphoon(subGroup); break
      case 'earthquake': refs = buildEarthquake(subGroup); break
    }
    group.add(subGroup)
  }

  buildSub(activeModule)

  const api = {
    update(dt, elapsed) {
      if (activeModule === 'typhoon' && refs.spiralLayers) {
        refs.spiralLayers.forEach((layer, li) => {
          const pos = layer.geometry.attributes.position.array
          const base = refs.spiralBases[li]
          const speeds = refs.spiralSpeeds[li]
          for (let i = 0; i < pos.length / 3; i++) {
            const angle = Math.atan2(base[i * 3 + 2], base[i * 3])
            const newAngle = angle + dt * speeds[i] * 0.8
            const r = Math.sqrt(base[i * 3] ** 2 + base[i * 3 + 2] ** 2)
            pos[i * 3] = Math.cos(newAngle) * r
            pos[i * 3 + 2] = Math.sin(newAngle) * r
          }
          layer.geometry.attributes.position.needsUpdate = true
        })
        if (refs.sea) {
          const seaPos = refs.sea.geometry.attributes.position.array
          for (let i = 0; i < seaPos.length / 3; i++) {
            const base = refs.seaVerts[i * 3 + 1]
            const dist = Math.sqrt(refs.seaVerts[i * 3] ** 2 + refs.seaVerts[i * 3 + 2] ** 2)
            seaPos[i * 3 + 1] = base + Math.sin(dist * 3 - elapsed * 2) * 0.04
          }
          refs.sea.geometry.attributes.position.needsUpdate = true
          refs.sea.geometry.computeVertexNormals()
        }
        if (refs.lightning) {
          const shouldFlash = Math.random() < 0.008
          refs.lightning.material.opacity = shouldFlash ? 0.15 : Math.max(0, refs.lightning.material.opacity - 0.02)
        }
        if (refs.feederBands) {
          refs.feederBands.forEach((band, i) => {
            band.rotation.y += dt * (0.04 + i * 0.006)
            band.material.opacity = 0.22 + Math.sin(elapsed * 1.2 + i) * 0.06
          })
        }
      }
      if (activeModule === 'earthquake' && refs.seismicRings) {
        refs.seismicRings.forEach(ring => {
          ring.userData.phase += dt * 0.6
          if (ring.userData.phase > 1) ring.userData.phase -= 1
          const scale = ring.userData.baseScale + ring.userData.phase * 4
          ring.scale.set(scale, scale, scale)
          ring.material.opacity = 0.3 * (1 - ring.userData.phase)
          ring.visible = true
        })
        if (refs.buildings && timeline > 0.3) {
          const shakeIntensity = (timeline - 0.3) * 0.05
          refs.buildings.forEach(b => {
            b.mesh.position.y = b.baseY + Math.sin(elapsed * 25 + b.mesh.position.x * 10) * shakeIntensity
          })
        }
      }
    },
    setMode(mode) {},
    setParams(p) {
      if (p.activeModule && p.activeModule !== activeModule) {
        activeModule = p.activeModule
        buildSub(activeModule)
      }
      if (p.timeline !== undefined) {
        timeline = p.timeline
      }
    },
    dispose() { clearSub() },
  }
  group.userData = { api }

  return group
}
