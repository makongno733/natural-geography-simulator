import * as THREE from 'three'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const PLANETS = [
  { name: '水星', radius: 0.9, size: 0.03, color: 0xaaaaaa, period: 0.24 },
  { name: '金星', radius: 1.3, size: 0.05, color: 0xe8cda0, period: 0.62 },
  { name: '地球', radius: 1.8, size: 0.07, color: 0x4a90d9, period: 1.0, isEarth: true },
  { name: '火星', radius: 2.4, size: 0.05, color: 0xcd5c5c, period: 1.88, isMars: true },
  { name: '木星', radius: 3.3, size: 0.12, color: 0xd4a574, period: 11.86 },
  { name: '土星', radius: 4.2, size: 0.10, color: 0xead6b8, period: 29.46 },
]

export function SolarSystemModule(scene, params, services) {
  const { labelSystem, cameraRig } = services
  const group = new THREE.Group()
  let mode = params.mode || 'simple'
  const isDetailed = mode !== 'simple'
  const sunSegs = isDetailed ? 64 : 32
  const planetSegs = isDetailed ? 48 : 24
  const ringSegs = isDetailed ? 128 : 64

  // Background star field
  const starCount = 3000
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount * 3; i++) {
    starPos[i] = (Math.random() - 0.5) * 20
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.03,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  group.add(new THREE.Points(starGeo, starMat))

  const sunGeo = GeometryFactory.sphere(0.35, sunSegs)
  const sunMat = new THREE.MeshStandardMaterial({
    color: 0xffaa33,
    emissive: 0xffaa33,
    emissiveIntensity: 0.5,
    roughness: 0.3,
  })
  const sun = new THREE.Mesh(sunGeo, sunMat)
  group.add(sun)

  // Sun corona glow - layered rings
  for (let i = 0; i < 3; i++) {
    const coronaGeo = GeometryFactory.ring(0.45 + i * 0.08, 0.6 + i * 0.1, 48)
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffcc66,
      transparent: true,
      opacity: 0.12 - i * 0.03,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const corona = new THREE.Mesh(coronaGeo, coronaMat)
    corona.rotation.x = -Math.PI / 2 + i * 0.1
    corona.userData._managed = true
    group.add(corona)
  }

  if (labelSystem) {
    labelSystem.addToGroup(group, '太阳', new THREE.Vector3(0, -0.5, 0), {
      color: '#ffaa33',
      fontSize: '14px',
    })
  }

  function makePlanetTexture(baseColor, variation, texSize, name) {
    const canvas = document.createElement('canvas')
    canvas.width = texSize || 128
    canvas.height = (texSize || 128) / 2
    const ctx = canvas.getContext('2d')
    const r = (baseColor >> 16) & 0xff
    const g = (baseColor >> 8) & 0xff
    const b = baseColor & 0xff
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const n = (Math.random() - 0.5) * variation
        ctx.fillStyle = `rgba(${Math.max(0, Math.min(255, r + n))|0},${Math.max(0, Math.min(255, g + n))|0},${Math.max(0, Math.min(255, b + n))|0},0.3)`
        ctx.fillRect(x, y, 1, 1)
      }
    }
    if (name && ['木星', '土星'].includes(name)) {
      for (let i = 0; i < 8; i++) {
        const y = (i / 8) * canvas.height
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`
        ctx.fillRect(0, y, canvas.width, canvas.height / 12)
      }
    }
    return new THREE.CanvasTexture(canvas)
  }

  // Store references to Earth and Mars meshes for orbit computation
  let earthMesh = null
  let marsMesh = null

  const planetMeshes = []
  PLANETS.forEach((p, i) => {
    const ring = GeometryFactory.ring(p.radius, p.radius + 0.01, ringSegs)
    ring.rotateX(-Math.PI / 2)
    const ringLine = new THREE.Mesh(ring,
      new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide }))
    group.add(ringLine)

    const mesh = new THREE.Mesh(
      GeometryFactory.sphere(p.size, planetSegs),
      MaterialLibrary.pbr({ color: p.color, roughness: 0.6 })
    )

    // Procedural texture for detailed mode
    if (isDetailed) {
      const tex = makePlanetTexture(p.color, 40, 128, p.name)
      mesh.material.map = tex
      mesh.material.needsUpdate = true
    }

    const initialAngle = (i / PLANETS.length) * Math.PI * 2
    mesh.position.set(Math.cos(initialAngle) * p.radius, 0, Math.sin(initialAngle) * p.radius)
    group.add(mesh)
    planetMeshes.push({ mesh, radius: p.radius, period: p.period, initialAngle })

    if (p.isEarth) earthMesh = mesh
    if (p.isMars) marsMesh = mesh

    // Saturn rings
    if (p.name === '土星') {
      const sRingGeo = GeometryFactory.ring(0.09, 0.2, ringSegs)
      const sRingMat = new THREE.MeshBasicMaterial({
        color: 0xc8a97e,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const sRing = new THREE.Mesh(sRingGeo, sRingMat)
      sRing.rotation.x = -Math.PI / 3
      sRing.position.copy(mesh.position)
      group.add(sRing)
      planetMeshes.push({ mesh: sRing, radius: p.radius, period: p.period, initialAngle, isRing: true })
    }

    // Earth atmosphere glow
    if (p.isEarth) {
      const atmoGeo = GeometryFactory.ring(p.size * 1.2, p.size * 1.8, 32)
      const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      const atmo = new THREE.Mesh(atmoGeo, atmoMat)
      atmo.position.copy(mesh.position)
      group.add(atmo)
      planetMeshes.push({ mesh: atmo, radius: p.radius, period: p.period, initialAngle, isRing: true })

      // Moon
      const moonGeo = GeometryFactory.sphere(0.015, 16)
      const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 })
      const moon = new THREE.Mesh(moonGeo, moonMat)
      moon.position.copy(mesh.position)
      moon.position.x += 0.1
      group.add(moon)
      planetMeshes.push({ mesh: moon, radius: p.radius, period: p.period, initialAngle, isMoon: true, parentMesh: mesh })
    }

    // Mars highlight
    if (p.isMars) {
      const marsGlowGeo = GeometryFactory.ring(p.size * 1.2, p.size * 1.6, 24)
      const marsGlowMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      const marsGlow = new THREE.Mesh(marsGlowGeo, marsGlowMat)
      marsGlow.position.copy(mesh.position)
      group.add(marsGlow)
      planetMeshes.push({ mesh: marsGlow, radius: p.radius, period: p.period, initialAngle, isRing: true })
    }

    if (labelSystem) {
      const isKey = p.isEarth || p.isMars
      labelSystem.addToGroup(group, p.name,
        new THREE.Vector3(0, p.size + 0.18, 0).add(mesh.position),
        { color: isKey ? '#' + p.color.toString(16).padStart(6, '0') : '#aaa', fontSize: isKey ? '12px' : '10px', fontWeight: isKey ? '700' : '400' })
    }
  })

  const earthR = 1.8, marsR = 2.4
  // Earth orbit ring - highlighted
  const earthOrbit = GeometryFactory.ring(earthR - 0.02, earthR + 0.02, ringSegs)
  earthOrbit.rotateX(-Math.PI / 2)
  group.add(new THREE.Mesh(earthOrbit,
    new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.5, side: THREE.DoubleSide })))
  // Mars orbit ring - highlighted
  const marsOrbit = GeometryFactory.ring(marsR - 0.02, marsR + 0.02, ringSegs)
  marsOrbit.rotateX(-Math.PI / 2)
  group.add(new THREE.Mesh(marsOrbit,
    new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5, side: THREE.DoubleSide })))

  for (const r of [earthR, marsR]) {
    for (const ang of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]) {
      const arrowP = new THREE.Vector3(Math.cos(ang) * r, 0.02, Math.sin(ang) * r)
      const dir = new THREE.Vector3(-Math.sin(ang), 0, Math.cos(ang)).normalize()
      group.add(new THREE.ArrowHelper(dir, arrowP, 0.15, r === earthR ? 0x60a5fa : 0xef4444, 0.12, 0.08))
    }
  }

  // Hohmann transfer trajectory - visible ellipse
  const aT = (earthR + marsR) / 2
  const cX = earthR + (aT - earthR)
  const sB = Math.sqrt(earthR * marsR)
  const tPts = []
  for (let i = 0; i <= 80; i++) {
    const t = (i / 80) * Math.PI
    tPts.push(new THREE.Vector3(cX + aT * Math.cos(t), 0.03, sB * Math.sin(t)))
  }
  // Thicker transfer line
  const transferCurve = new THREE.CatmullRomCurve3(tPts)
  const transferGeo = new THREE.TubeGeometry(transferCurve, 80, 0.01, 8, false)
  const transferMat = new THREE.MeshBasicMaterial({
    color: 0x44ff88,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  group.add(new THREE.Mesh(transferGeo, transferMat))

  // Transfer direction arrows at 1/4 and 3/4 of the path
  for (const frac of [0.25, 0.75]) {
    const t = frac * Math.PI
    const aP = new THREE.Vector3(cX + aT * Math.cos(t), 0.06, sB * Math.sin(t))
    const aD = new THREE.Vector3(-aT * Math.sin(t), 0, sB * Math.cos(t)).normalize()
    const arrow = new THREE.ArrowHelper(aD, aP, 0.18, 0x44ff88, 0.12, 0.08)
    arrow.userData._managed = true
    group.add(arrow)
  }

  // Rocket marker on transfer orbit
  let transferProgress = 0
  let currentPhase = 0
  let prevPhase = 0
  const rocketGeo = GeometryFactory.sphere(0.04, 12)
  const rocketMat = new THREE.MeshStandardMaterial({
    color: 0x44ff88,
    emissive: 0x44ff88,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  })
  const rocket = new THREE.Mesh(rocketGeo, rocketMat)
  rocket.position.set(earthR, 0.05, 0)
  group.add(rocket)

  // Rocket trail glow
  const trailGeo = GeometryFactory.ring(0.03, 0.08, 24)
  const trailMat = new THREE.MeshBasicMaterial({
    color: 0x44ff88,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const trail = new THREE.Mesh(trailGeo, trailMat)
  trail.rotation.x = -Math.PI / 2
  trail.userData._managed = true
  group.add(trail)

  // Phase label markers
  const phaseLabels = [
    { prog: 0, text: '① 发射', color: '#60a5fa' },
    { prog: 0.12, text: '② 地球逃逸', color: '#facc15' },
    { prog: 0.2, text: '③ 霍曼转移', color: '#44ff88' },
    { prog: 0.82, text: '④ 火星捕获', color: '#ef4444' },
  ]

  if (labelSystem) {
    labelSystem.addToGroup(group, '地球 (出发)', new THREE.Vector3(earthR, -0.25, 0),
      { color: '#60a5fa', fontSize: '11px', fontWeight: '700' })
    labelSystem.addToGroup(group, '火星 (到达)', new THREE.Vector3(marsR * Math.cos(Math.PI * 1.35), 0.25, marsR * Math.sin(Math.PI * 1.35)),
      { color: '#ef4444', fontSize: '11px', fontWeight: '700' })
    labelSystem.addToGroup(group, '霍曼转移轨道\n加速 椭圆飞行 ~259天', new THREE.Vector3(2.0, 0.5, 0.8),
      { color: '#44ff88', fontSize: '11px', fontWeight: '600' })
  }

  const api = {
    update(dt, elapsed) {
      // Sun surface animation
      const sunPulse = 1 + Math.sin(elapsed * 0.5) * 0.02
      sun.scale.setScalar(sunPulse)
      sunMat.emissiveIntensity = 0.4 + Math.sin(elapsed * 0.7) * 0.15

      // Planet orbital motion
      const secPerYear = 365.25 * 86400 / 10
      planetMeshes.forEach(p => {
        if (p.isMoon && p.parentMesh) {
          // Moon orbits parent planet (Earth)
          const moonAngle = p.initialAngle + elapsed * 2.0
          p.mesh.position.set(
            p.parentMesh.position.x + Math.cos(moonAngle) * 0.1,
            p.parentMesh.position.y,
            p.parentMesh.position.z + Math.sin(moonAngle) * 0.1,
          )
          return
        }
        const angle = p.initialAngle + (elapsed / secPerYear) * (2 * Math.PI) / p.period
        p.mesh.position.set(
          Math.cos(angle) * p.radius,
          0,
          Math.sin(angle) * p.radius,
        )
      })
      // Multi-phase rocket trajectory
      let rp = transferProgress
      if (earthMesh && marsMesh) {
        const earthPos = earthMesh.position
        const marsPos = marsMesh.position

        if (rp < 0.12) {
          // Phase 1: Earth orbit
          currentPhase = 1
          const phase1 = rp / 0.12
          const ang = phase1 * Math.PI * 6
          rocket.position.set(
            earthPos.x + Math.cos(ang) * 0.15,
            earthPos.y + 0.03,
            earthPos.z + Math.sin(ang) * 0.15,
          )
          rocketMat.color.set(0x60a5fa)
        } else if (rp < 0.2) {
          // Phase 2: Escape Earth → transfer insertion
          currentPhase = 2
          const phase2 = (rp - 0.12) / 0.08
          const ang = phase2 * Math.PI * 2
          const spiralR = 0.15 + phase2 * 0.4
          const insetX = earthPos.x + Math.cos(ang) * spiralR
          const insetZ = earthPos.z + Math.sin(ang) * spiralR
          // Blend from Earth orbit to transfer start
          const earthStartX = cX + aT * Math.cos(0)
          const earthStartZ = sB * Math.sin(0)
          rocket.position.set(
            insetX + (earthStartX - insetX) * phase2,
            0.05,
            insetZ + (earthStartZ - insetZ) * phase2,
          )
          rocketMat.color.set(0xfacc15)
        } else if (rp < 0.82) {
          // Phase 3: Hohmann transfer
          currentPhase = 3
          const phase3 = (rp - 0.2) / 0.62
          const t = phase3 * Math.PI
          rocket.position.set(
            cX + aT * Math.cos(t),
            0.05,
            sB * Math.sin(t),
          )
          rocketMat.color.set(0x44ff88)
        } else {
          // Phase 4: Mars approach and orbit insertion
          currentPhase = 4
          const phase4 = (rp - 0.82) / 0.18
          const ang = phase4 * Math.PI * 4
          const marsApproachR = 0.2 * (1 - phase4 * 0.7)
          rocket.position.set(
            marsPos.x + Math.cos(ang) * marsApproachR,
            marsPos.y + 0.03,
            marsPos.z + Math.sin(ang) * marsApproachR,
          )
          rocketMat.color.set(0xef4444)
        }
        rocketMat.emissive.copy(rocketMat.color)
      }
      trail.position.copy(rocket.position)

      // Camera transitions between phases
      if (cameraRig && currentPhase !== prevPhase && earthMesh && marsMesh) {
        prevPhase = currentPhase
        const ct = cameraRig.controls.target
        const cp = cameraRig.camera.position
        switch (currentPhase) {
          case 1: // Focus on Earth
            ct.copy(earthMesh.position)
            cp.set(earthMesh.position.x + 2, earthMesh.position.y + 1.5, earthMesh.position.z + 2)
            break
          case 2: // Transitioning: pull back
            ct.set(1.5, 0, 0.5)
            cp.set(3, 2.5, 3)
            break
          case 3: // Wide view of transfer
            ct.set(2.0, 0, 0.5)
            cp.set(0, 6, 8)
            break
          case 4: // Focus on Mars
            ct.copy(marsMesh.position)
            cp.set(marsMesh.position.x + 2, marsMesh.position.y + 1.5, marsMesh.position.z + 2)
            break
        }
        cameraRig.controls.update()
      }
    },
    setMode(m) { mode = m },
    setParams(p) {
      if (p.transferProgress !== undefined) {
        transferProgress = Math.max(0, Math.min(1, p.transferProgress))
      }
    },
    dispose() {},
  }
  group.userData = { api }

  return group
}
