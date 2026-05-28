import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export class DisasterEngine {
  constructor(container) {
    this.container = container
    this.activeModule = 'typhoon'
    this.mode = 'simple'
    this.timeline = 0
    this.animTime = 0

    this._initRenderer()
    this._initScene()
    this._initLights()
    this._initControls()
    this._buildScene()
    this._animate()
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    this.renderer.setClearColor(0xf5efe8, 1)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.container.appendChild(this.renderer.domElement)
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(40, this.container.clientWidth / this.container.clientHeight, 0.1, 50)
    this.camera.position.set(5, 4, 6)
    this.camera.lookAt(0, 0, 0)
    this.scene.fog = new THREE.Fog(0xf5efe8, 10, 18)
  }

  _initLights() {
    const ambient = new THREE.AmbientLight(0x8899aa, 0.5)
    this.scene.add(ambient)
    const sun = new THREE.DirectionalLight(0xffeedd, 1.2)
    sun.position.set(8, 12, 5)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    this.scene.add(sun)
    this.sun = sun
    const fill = new THREE.DirectionalLight(0x8888ff, 0.3)
    fill.position.set(-5, 3, -5)
    this.scene.add(fill)
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.minDistance = 2
    this.controls.maxDistance = 16
    this.controls.maxPolarAngle = Math.PI / 2.1
    this.controls.target.set(0, 0, 0)
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.6
  }

  _disposeObjects() {
    while (this.scene.children.length > 0) {
      const c = this.scene.children[0]
      if (c.geometry) c.geometry.dispose()
      if (c.material) c.material.dispose()
      this.scene.remove(c)
    }
  }

  _buildScene() {
    this._disposeObjects()
    this._initLights() // re-add lights after dispose

    switch (this.activeModule) {
      case 'typhoon': this._buildTyphoon(); break
      case 'earthquake': this._buildEarthquake(); break
      case 'landslide': this._buildLandslide(); break
      case 'flood': this._buildFlood(); break
    }
  }

  // ===== Typhoon =====
  _buildTyphoon() {
    // Sea surface
    const seaGeo = new THREE.PlaneGeometry(10, 10)
    seaGeo.rotateX(-Math.PI / 2)
    const seaMat = new THREE.MeshStandardMaterial({
      color: 0x2a6b8a, transparent: true, opacity: 0.4, roughness: 0.3, metalness: 0.1
    })
    this.sea = new THREE.Mesh(seaGeo, seaMat)
    this.sea.position.y = -0.5
    this.scene.add(this.sea)

    // Spiral cloud bands as particle system
    const count = 2500
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const speed = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2
      const r = 0.3 + Math.random() * 2.5
      const spiral = t + r * 1.5
      const spread = (Math.random() - 0.5) * (0.3 + r * 0.15)

      positions[i * 3] = Math.cos(spiral) * r
      positions[i * 3 + 1] = spread * 0.5
      positions[i * 3 + 2] = Math.sin(spiral) * r
      sizes[i] = 0.08 + Math.random() * 0.2
      speed[i] = 0.3 + Math.random() * 0.7
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // Eye wall
    const eyeGeo = new THREE.RingGeometry(0.3, 0.8, 48)
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0x334466, side: THREE.DoubleSide, transparent: true, opacity: 0.6
    })
    this.eyeWall = new THREE.Mesh(eyeGeo, eyeMat)
    this.eyeWall.rotation.x = -Math.PI / 2
    this.eyeWall.position.y = 0.1
    this.scene.add(this.eyeWall)

    // Outer clouds
    const cloudMat = new THREE.PointsMaterial({
      color: 0xddddff, size: 0.12, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false
    })
    this.cloudParticles = new THREE.Points(geo, cloudMat)
    this.scene.add(this.cloudParticles)

    // Eye sphere
    const centerMat = new THREE.MeshBasicMaterial({ color: 0x5599dd, transparent: true, opacity: 0.2 })
    this.eyeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), centerMat)
    this.eyeSphere.position.y = 0.1
    this.scene.add(this.eyeSphere)

    // Rain bands (inner ring of particles)
    const rainCount = 2000
    const rPos = new Float32Array(rainCount * 3)
    for (let i = 0; i < rainCount; i++) {
      const t = Math.random() * Math.PI * 2
      const r = 0.5 + Math.random() * 3
      const spiral = t + r * 2
      rPos[i * 3] = Math.cos(spiral) * r
      rPos[i * 3 + 1] = -0.2 - Math.random() * 1.5
      rPos[i * 3 + 2] = Math.sin(spiral) * r
    }
    const rainGeo = new THREE.BufferGeometry()
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3))
    const rainMat = new THREE.PointsMaterial({
      color: 0x8888ff, size: 0.04, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending
    })
    this.rainParticles = new THREE.Points(rainGeo, rainMat)
    this.scene.add(this.rainParticles)

    this._typhoonSpeed = speed
    this._typhoonBasePos = positions.slice()
  }

  // ===== Earthquake =====
  _buildEarthquake() {
    // Ground grid
    const gridSize = 6
    const gridGeo = new THREE.PlaneGeometry(gridSize, gridSize, 20, 20)
    gridGeo.rotateX(-Math.PI / 2)
    const gridMat = new THREE.MeshStandardMaterial({
      color: 0x8a7a60, wireframe: false, roughness: 0.9, side: THREE.DoubleSide
    })
    this.ground = new THREE.Mesh(gridGeo, gridMat)
    this.ground.receiveShadow = true
    this.scene.add(this.ground)
    this._origPos = gridGeo.attributes.position.array.slice()

    // Fault line (red line)
    const faultPoints = [
      new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0.2), new THREE.Vector3(1, 0, -0.2)
    ]
    const faultGeo = new THREE.BufferGeometry().setFromPoints(faultPoints)
    const faultMat = new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 2 })
    const faultLine = new THREE.Line(faultGeo, faultMat)
    faultLine.position.y = 0.02
    this.scene.add(faultLine)

    // Buildings
    this.buildings = []
    const positions = [
      [-0.8, -0.8], [0.8, 0.8], [-0.5, 0.5], [0.6, -0.6], [-0.2, -1.0],
      [0.3, 0.3], [-0.7, 0.7], [0.5, -0.3], [-0.3, -0.5], [1.0, -0.2]
    ]
    for (const [x, z] of positions) {
      const h = 0.2 + Math.random() * 0.35
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(0.08 + Math.random() * 0.12, h, 0.08 + Math.random() * 0.12),
        new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.05, 0.3, 0.4 + Math.random() * 0.3) })
      )
      building.position.set(x * 0.8, h / 2, z * 0.8)
      building.castShadow = true
      this.buildings.push(building)
      this.scene.add(building)
    }

    // Seismic wave rings
    this.waveRings = []
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff8833, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.08, 24), ringMat)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.03
      ring.scale.set(1, 1, 1)
      this.scene.add(ring)
      this.waveRings.push(ring)
    }
  }

  // ===== Landslide =====
  _buildLandslide() {
    // Mountain terrain
    const terrainGeo = new THREE.PlaneGeometry(6, 6, 60, 60)
    terrainGeo.rotateX(-Math.PI / 2)
    const pos = terrainGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      const xn = (x + 3) / 6, zn = (z + 3) / 6
      const h = (
        Math.exp(-Math.pow((xn - 0.6) / 0.3, 2) - Math.pow((zn - 0.7) / 0.25, 2)) * 0.8 +
        Math.sin(xn * 6) * 0.05 + Math.sin(zn * 5) * 0.04
      )
      pos.setY(i, h - 0.3)
    }
    pos.needsUpdate = true
    terrainGeo.computeVertexNormals()
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x6a8a5a, roughness: 0.9, flatShading: true, side: THREE.DoubleSide
    })
    this.terrain = new THREE.Mesh(terrainGeo, terrainMat)
    this.terrain.receiveShadow = true
    this.scene.add(this.terrain)

    // Debris flow (particles)
    const debrisCount = 800
    const dPos = new Float32Array(debrisCount * 3)
    this.debris = []
    for (let i = 0; i < debrisCount; i++) {
      const t = Math.random() * Math.PI * 2
      const r = Math.random() * 1.2
      dPos[i * 3] = -0.8 + Math.cos(t) * r * 0.4
      dPos[i * 3 + 1] = 0.55 + Math.random() * 0.3 - r * 0.4
      dPos[i * 3 + 2] = 0.6 + Math.sin(t) * r * 0.3
    }
    const debrisGeo = new THREE.BufferGeometry()
    debrisGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3))
    const debrisMat = new THREE.PointsMaterial({
      color: 0x8a6a3a, size: 0.06, transparent: true, opacity: 0.7
    })
    this.debrisParticles = new THREE.Points(debrisGeo, debrisMat)
    this.scene.add(this.debrisParticles)
    this._debrisBase = dPos.slice()

    // Scarp line
    const scarpPoints = [
      new THREE.Vector3(-0.6, 0.5, 0.2), new THREE.Vector3(-0.2, 0.6, 0.5),
      new THREE.Vector3(0.2, 0.55, 0.3), new THREE.Vector3(0.6, 0.5, 0)
    ]
    const scarpGeo = new THREE.BufferGeometry().setFromPoints(scarpPoints)
    const scarpMat = new THREE.LineBasicMaterial({ color: 0xcc4422 })
    this.scarpLine = new THREE.Line(scarpGeo, scarpMat)
    this.scene.add(this.scarpLine)
  }

  // ===== Flood =====
  _buildFlood() {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(6, 6, 30, 30)
    groundGeo.rotateX(-Math.PI / 2)
    const pos = groundGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      pos.setY(i, -0.15 + (
        Math.sin(x * 2 + z * 1.5) * 0.06 +
        Math.sin(x * 4 - z * 3) * 0.03
      ))
    }
    pos.needsUpdate = true
    groundGeo.computeVertexNormals()
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x7a9a6a, roughness: 0.9 })
    this.groundFlood = new THREE.Mesh(groundGeo, groundMat)
    this.groundFlood.receiveShadow = true
    this.scene.add(this.groundFlood)

    // River
    const riverPoints = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      riverPoints.push(new THREE.Vector3(
        -1 + t * 2,
        -0.1,
        Math.sin(t * Math.PI * 3) * 0.3
      ))
    }
    const riverGeo = new THREE.BufferGeometry().setFromPoints(riverPoints)
    const riverMat = new THREE.LineBasicMaterial({ color: 0x3388bb, linewidth: 2 })
    this.river = new THREE.Line(riverGeo, riverMat)
    this.scene.add(this.river)

    // Buildings/structures
    this.floodBuildings = []
    const locs = [[-0.5, -0.5], [0.3, 0.4], [0.7, -0.3], [-0.3, 0.6], [-0.8, 0.2]]
    for (const [x, z] of locs) {
      const h = 0.2 + Math.random() * 0.3
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, h, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x8a7a6a })
      )
      b.position.set(x, h / 2 - 0.15, z)
      b.castShadow = true
      this.floodBuildings.push(b)
      this.scene.add(b)
    }

    // Rising water plane
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x3a7a9a, transparent: true, opacity: 0.35,
      roughness: 0.1, metalness: 0.2, side: THREE.DoubleSide
    })
    this.waterPlane = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 6.5), waterMat)
    this.waterPlane.rotation.x = -Math.PI / 2
    this.waterPlane.position.y = -0.3
    this.scene.add(this.waterPlane)
  }

  setModule(name) {
    if (name === this.activeModule) return
    this.activeModule = name
    this.timeline = 0
    this._buildScene()
  }

  setMode(mode) {
    this.mode = mode
  }

  setTimeline(t) {
    this.timeline = t
  }

  setAutoRotate(on) {
    this.controls.autoRotate = on
  }

  resize() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  dispose() {
    this.renderer.dispose()
    this.controls.dispose()
    cancelAnimationFrame(this._raf)
  }

  _animate() {
    this._raf = requestAnimationFrame(() => this._animate())

    this.animTime += 0.016
    const t = this.animTime

    // Module-specific animations
    if (this.activeModule === 'typhoon') this._animTyphoon(t)
    else if (this.activeModule === 'earthquake') this._animEarthquake(t)
    else if (this.activeModule === 'landslide') this._animLandslide(t)
    else if (this.activeModule === 'flood') this._animFlood(t)

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  _animTyphoon(t) {
    if (!this.cloudParticles) return
    const pos = this.cloudParticles.geometry.attributes.position.array
    const base = this._typhoonBasePos
    const speed = this._typhoonSpeed
    for (let i = 0; i < pos.length / 3; i++) {
      const i3 = i * 3
      const angle = t * speed[i] * 0.6
      const bx = base[i3], bz = base[i3 + 2]
      const r = Math.sqrt(bx * bx + bz * bz)
      const a = Math.atan2(bz, bx) + angle
      pos[i3] = Math.cos(a) * r
      pos[i3 + 2] = Math.sin(a) * r
    }
    this.cloudParticles.geometry.attributes.position.needsUpdate = true

    // Rotate eye wall
    if (this.eyeWall) {
      this.eyeWall.rotation.z = t * 0.3
    }

    // Pulsing eye
    if (this.eyeSphere) {
      this.eyeSphere.scale.setScalar(1 + Math.sin(t * 0.5) * 0.15)
    }
  }

  _animEarthquake(t) {
    if (!this.ground) return
    const pos = this.ground.geometry.attributes.position.array
    const base = this._origPos
    const intensity = 0.02 * Math.max(0, Math.sin(t * 6) * 0.8 + 0.2)

    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] = base[i + 1] + (Math.random() - 0.5) * intensity
    }
    this.ground.geometry.attributes.position.needsUpdate = true

    // Shake buildings
    for (const b of this.buildings) {
      b.position.x += (Math.random() - 0.5) * intensity * 3
      b.position.z += (Math.random() - 0.5) * intensity * 3
      b.rotation.z = (Math.random() - 0.5) * intensity * 5
      b.rotation.x = (Math.random() - 0.5) * intensity * 3
    }

    // Seismic wave rings expand
    for (let i = 0; i < this.waveRings.length; i++) {
      const ring = this.waveRings[i]
      const offset = i * 0.4
      const phase = ((t + offset) % 2) / 2
      const scale = 0.5 + phase * 5
      ring.scale.set(scale, scale, scale)
      ring.material.opacity = 0.4 * (1 - phase)
    }
  }

  _animLandslide(t) {
    if (!this.debrisParticles) return
    const pos = this.debrisParticles.geometry.attributes.position.array
    const base = this._debrisBase
    const flow = Math.min(t * 0.03, 1.2)

    for (let i = 0; i < pos.length / 3; i++) {
      const i3 = i * 3
      const progress = (Math.sin(base[i3] * 3 + base[i3 + 2] * 2) * 0.5 + 0.5) * 0.6
      const slide = Math.min(flow, 0.6) * (0.3 + progress * 0.7)
      pos[i3] = base[i3] - slide * 0.3 - slide * (1 + base[i3 + 2]) * 0.2
      pos[i3 + 1] = base[i3 + 1] - slide * 0.5
      pos[i3 + 2] = base[i3 + 2] + slide * 0.4
    }
    this.debrisParticles.geometry.attributes.position.needsUpdate = true
  }

  _animFlood(t) {
    if (!this.waterPlane) return
    // Water level rises and falls with timeline
    const targetY = -0.3 + this.timeline * 0.6
    this.waterPlane.position.y += (targetY - this.waterPlane.position.y) * 0.02
    this.waterPlane.material.opacity = 0.2 + this.timeline * 0.4
  }
}
