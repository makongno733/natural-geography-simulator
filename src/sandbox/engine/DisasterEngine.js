import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

function hsv(h, s, v) { return new THREE.Color().setHSL(h, s, v) }

export class DisasterEngine {
  constructor(container) {
    this.container = container
    this.activeModule = 'typhoon'
    this.mode = 'simple'
    this.timeline = 0
    this.animTime = 0
    this._refs = {}

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
    this.renderer.setClearColor(0x1a1a2e, 1)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    this.container.appendChild(this.renderer.domElement)
  }

  _initScene() {
    this.scene = new THREE.Scene()
    const w = this.container.clientWidth || 800
    const h = this.container.clientHeight || 600
    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50)
    this.camera.position.set(5, 4, 6)
    this.camera.lookAt(0, 0, 0)
    this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.008)
  }

  _initLights() {
    const ambient = new THREE.AmbientLight(0x334466, 0.6)
    this.scene.add(ambient)
    const key = new THREE.DirectionalLight(0xffeedd, 1.5)
    key.position.set(8, 12, 5)
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 0.1; key.shadow.camera.far = 30
    this.scene.add(key); this.sun = key
    const fill = new THREE.DirectionalLight(0x4466aa, 0.4)
    fill.position.set(-5, 2, -3)
    this.scene.add(fill)
    const rim = new THREE.DirectionalLight(0x8899cc, 0.25)
    rim.position.set(0, -1, 5)
    this.scene.add(rim)
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.06
    this.controls.minDistance = 1.5
    this.controls.maxDistance = 14
    this.controls.maxPolarAngle = Math.PI / 1.8
    this.controls.target.set(0, 0, 0)
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.5
  }

  _disposeAll() {
    while (this.scene.children.length > 0) {
      const c = this.scene.children[0]
      if (c.geometry) c.geometry.dispose()
      if (c.material) {
        if (Array.isArray(c.material)) c.material.forEach(m => m.dispose())
        else c.material.dispose()
      }
      this.scene.remove(c)
    }
    this._refs = {}
  }

  _buildScene() {
    this._disposeAll()
    this._initLights()
    this._addGroundPlane()
    switch (this.activeModule) {
      case 'typhoon': this._buildTyphoon(); break
      case 'earthquake': this._buildEarthquake(); break
      case 'landslide': this._buildLandslide(); break
      case 'flood': this._buildFlood(); break
    }
  }

  _addGroundPlane() {
    const g = new THREE.PlaneGeometry(12, 12)
    g.rotateX(-Math.PI / 2)
    const m = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.9 })
    const p = new THREE.Mesh(g, m)
    p.position.y = -0.6
    p.receiveShadow = true
    this.scene.add(p)
  }

  // ======================== TYPHOON ========================
  _buildTyphoon() {
    // --- Sea surface with waves ---
    const seg = 60
    const seaGeo = new THREE.PlaneGeometry(8, 8, seg, seg)
    seaGeo.rotateX(-Math.PI / 2)
    this._refs.seaVerts = seaGeo.attributes.position.array.slice()
    const seaMat = new THREE.MeshStandardMaterial({
      color: 0x1a4a6a, roughness: 0.25, metalness: 0.4
    })
    this._refs.sea = new THREE.Mesh(seaGeo, seaMat)
    this._refs.sea.position.y = -0.45
    this.scene.add(this._refs.sea)

    // --- Multi-layer spiral cloud bands ---
    const layerDefs = [
      { count: 2500, rMin: 0.25, rMax: 0.7, h: 0.05, spread: 0.08, color: 0xeeeeff, size: 0.07, opacity: 0.7, speedMul: 1.2 },
      { count: 3500, rMin: 0.3, rMax: 1.6, h: 0.12, spread: 0.18, color: 0xccccdd, size: 0.1, opacity: 0.55, speedMul: 0.8 },
      { count: 2500, rMin: 0.5, rMax: 2.3, h: 0.2, spread: 0.25, color: 0x999999, size: 0.14, opacity: 0.4, speedMul: 0.5 },
      { count: 1500, rMin: 1.0, rMax: 3.0, h: 0.3, spread: 0.3, color: 0x666688, size: 0.2, opacity: 0.3, speedMul: 0.3 },
    ]

    this._refs.spiralLayers = []
    this._refs.spiralBases = []
    this._refs.spiralSpeeds = []

    for (const ld of layerDefs) {
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
      const mat = new THREE.PointsMaterial({
        size: ld.size, vertexColors: true, transparent: true,
        opacity: ld.opacity, blending: THREE.NormalBlending,
        depthWrite: false
      })
      const pts = new THREE.Points(geo, mat)
      this.scene.add(pts)
      this._refs.spiralLayers.push(pts)
      this._refs.spiralBases.push(pos.slice())
      this._refs.spiralSpeeds.push(spd)
    }

    // --- Eye wall (thick ring) ---
    const eyeGeo = new THREE.TorusGeometry(0.22, 0.06, 16, 48)
    eyeGeo.rotateX(Math.PI / 2)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x445566, roughness: 0.5, metalness: 0.3
    })
    this._refs.eyeWall = new THREE.Mesh(eyeGeo, eyeMat)
    this._refs.eyeWall.position.y = 0.1
    this.scene.add(this._refs.eyeWall)

    // --- Eye (hollow center) ---
    const eyeInner = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.15 })
    )
    eyeInner.position.y = 0.1
    this.scene.add(eyeInner)
    this._refs.eyeSphere = eyeInner

    // --- Rain bands (vertical falling streaks) ---
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
    const rainMat = new THREE.PointsMaterial({
      color: 0x6699cc, size: 0.025, transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, depthWrite: false
    })
    this._refs.rain = new THREE.Points(rainGeo, rainMat)
    this.scene.add(this._refs.rain)
    this._refs.rainBase = rPos.slice()

    // --- Central updraft column ---
    const colGeo = new THREE.CylinderGeometry(0.08, 0.2, 1.2, 16)
    const colMat = new THREE.MeshBasicMaterial({
      color: 0x8899aa, transparent: true, opacity: 0.12
    })
    this._refs.updraft = new THREE.Mesh(colGeo, colMat)
    this._refs.updraft.position.y = 0.5
    this.scene.add(this._refs.updraft)
  }

  // ======================== EARTHQUAKE ========================
  _buildEarthquake() {
    // --- High-res ground with texture ---
    const gSize = 5
    const gSeg = 80
    const geo = new THREE.PlaneGeometry(gSize, gSize, gSeg, gSeg)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    // Add subtle terrain undulation
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      pos.setY(i, Math.sin(x * 3 + z * 2) * 0.03 + Math.sin(x * 7 - z * 5) * 0.015)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x8a7a5a, roughness: 0.85, metalness: 0.05, flatShading: false
    })
    this._refs.ground = new THREE.Mesh(geo, groundMat)
    this._refs.ground.receiveShadow = true
    this.scene.add(this._refs.ground)
    this._refs.groundBase = geo.attributes.position.array.slice()

    // --- City grid pattern ---
    const gridHelper = new THREE.PolarGridHelper(3, 24, 16, 256, 0x5a4a3a, 0x5a4a3a)
    gridHelper.position.y = 0.005
    this.scene.add(gridHelper)

    // --- Fault line with displacement ---
    const fp = []
    for (let i = 0; i <= 30; i++) {
      const t = i / 30
      fp.push(new THREE.Vector3(-1.8 + t * 3.6, 0.01, Math.sin(t * Math.PI * 2) * 0.3))
    }
    const faultGeo = new THREE.BufferGeometry().setFromPoints(fp)
    const faultLine = new THREE.Line(faultGeo, new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 1 }))
    this.scene.add(faultLine)
    this._refs.faultLine = faultLine

    // --- Ground cracks ---
    for (let j = 0; j < 5; j++) {
      const ckPts = []
      const cx = -1 + j * 0.5, cz = (Math.random() - 0.5) * 1.5
      for (let i = 0; i <= 10; i++) {
        const t = i / 10
        ckPts.push(new THREE.Vector3(cx + t * 0.8 + (Math.random() - 0.5) * 0.1, 0.012, cz + (Math.random() - 0.5) * 0.4))
      }
      const ckGeo = new THREE.BufferGeometry().setFromPoints(ckPts)
      this.scene.add(new THREE.Line(ckGeo, new THREE.LineBasicMaterial({ color: 0x3a2a1a })))
    }

    // --- Diverse buildings ---
    this._refs.buildings = []
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
      [-0.2, 1.0, 0.28, 0xf0e8dc], [0.6, -1.2, 0.38, 0xe0e4ec]
    ]
    for (const [bx, bz, h, clr] of bldgDefs) {
      const w = 0.06 + Math.random() * 0.1
      const d = 0.06 + Math.random() * 0.1
      const bGeo = new THREE.BoxGeometry(w, h, d)
      const bMat = new THREE.MeshStandardMaterial({ color: clr, roughness: 0.6 })
      const bldg = new THREE.Mesh(bGeo, bMat)
      bldg.position.set(bx, h / 2, bz)
      bldg.castShadow = true; bldg.receiveShadow = true
      // Window stripes
      const stripeGeo = new THREE.BoxGeometry(w + 0.005, h * 0.03, d + 0.005)
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0x334455 })
      for (let s = 0; s < Math.floor(h / 0.06); s++) {
        const stripe = new THREE.Mesh(stripeGeo, stripeMat)
        stripe.position.set(bx, s * 0.06 + 0.04, bz)
        this.scene.add(stripe)
      }
      this.scene.add(bldg)
      this._refs.buildings.push(bldg)
    }

    // --- Epicenter marker ---
    const epiGeo = new THREE.SphereGeometry(0.06, 16, 16)
    const epiMat = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff4400, emissiveIntensity: 2 })
    const epicenter = new THREE.Mesh(epiGeo, epiMat)
    epicenter.position.set(0, 0.03, 0)
    this.scene.add(epicenter)
    this._refs.epicenter = epicenter

    // --- Seismic wave rings (more rings, gradient colors) ---
    this._refs.waves = []
    for (let i = 0; i < 5; i++) {
      const rMat = new THREE.MeshBasicMaterial({
        color: hsv(0.08 + i * 0.03, 0.8, 0.5), transparent: true,
        opacity: 0.5, side: THREE.DoubleSide, depthWrite: false
      })
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.01, 8, 32), rMat)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.02
      this.scene.add(ring)
      this._refs.waves.push(ring)
    }
  }

  // ======================== LANDSLIDE ========================
  _buildLandslide() {
    // --- High-res terrain ---
    const seg = 80
    const geo = new THREE.PlaneGeometry(5, 5, seg, seg)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      const xn = (x + 2.5) / 5, zn = (z + 2.5) / 5
      let h = (
        Math.exp(-Math.pow((xn - 0.55) / 0.25, 2) - Math.pow((zn - 0.65) / 0.2, 2)) * 0.7 +
        Math.sin(xn * 7 + zn * 5) * 0.04 + Math.sin(xn * 3 - zn * 8) * 0.03
      ) - 0.25
      // Ridge on the right side
      if (xn > 0.6 && zn > 0.4) h *= 1.3
      pos.setY(i, h)
      // Color: green low, brown mid, gray rock high
      const normH = h + 0.3
      const c = hsv(0.12 + normH * 0.1, 0.5, 0.35 + normH * 0.5)
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b
    }
    pos.needsUpdate = true
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.9, flatShading: true
    })
    this._refs.terrain = new THREE.Mesh(geo, mat)
    this._refs.terrain.receiveShadow = true
    this.scene.add(this._refs.terrain)

    // --- Vegetation dots on stable slopes ---
    const vegCount = 600
    const vegPos = new Float32Array(vegCount * 3)
    let vi = 0
    for (let i = 0; i < vegCount * 10 && vi < vegCount; i++) {
      const tx = (Math.random() - 0.5) * 4, tz = (Math.random() - 0.5) * 4
      const xn = (tx + 2.5) / 5, zn = (tz + 2.5) / 5
      if (xn > 0.5 && zn > 0.4) continue // skip steep slope
      const h = pos.getY(Math.floor((tz + 2.5) / 5 * seg) * (seg + 1) + Math.floor((tx + 2.5) / 5 * seg))
      if (h > -0.1 && Math.random() < 0.3) {
        vegPos[vi * 3] = tx; vegPos[vi * 3 + 1] = h + 0.02; vegPos[vi * 3 + 2] = tz
        vi++
      }
    }
    const vegGeo = new THREE.BufferGeometry()
    vegGeo.setAttribute('position', new THREE.BufferAttribute(vegPos.slice(0, vi * 3), 3))
    const vegPts = new THREE.Points(vegGeo, new THREE.PointsMaterial({
      color: 0x3a6a2a, size: 0.04, depthWrite: false
    }))
    this._refs.veg = vegPts
    this.scene.add(vegPts)

    // --- Scarp wall (thick ribbon) ---
    const scarpPts = [
      new THREE.Vector3(-0.5, 0.38, 0.15), new THREE.Vector3(-0.1, 0.45, 0.4),
      new THREE.Vector3(0.3, 0.42, 0.25), new THREE.Vector3(0.8, 0.35, -0.05)
    ]
    const scarpCurve = new THREE.CatmullRomCurve3(scarpPts)
    const scarpTube = new THREE.TubeGeometry(scarpCurve, 40, 0.02, 8, false)
    const scarpMat = new THREE.MeshStandardMaterial({ color: 0xcc4422, roughness: 0.7, emissive: 0x330000, emissiveIntensity: 0.3 })
    this._refs.scarp = new THREE.Mesh(scarpTube, scarpMat)
    this.scene.add(this._refs.scarp)

    // --- Multiple debris flow channels ---
    this._refs.debrisLayers = []
    this._refs.debrisBases = []
    const channels = [
      { cx: 0.3, cz: 0.45, count: 1500, color: 0x8a6a3a, speed: 0.8 },
      { cx: 0.5, cz: 0.55, count: 1200, color: 0x7a5a2a, speed: 0.6 },
      { cx: 0.2, cz: 0.35, count: 1000, color: 0x9a7a4a, speed: 1.0 },
    ]
    for (const ch of channels) {
      const dp = new Float32Array(ch.count * 3)
      for (let i = 0; i < ch.count; i++) {
        const r = Math.random() * 0.8
        const a = Math.random() * Math.PI * 0.6 - Math.PI * 0.8
        dp[i * 3] = ch.cx + Math.cos(a) * r
        dp[i * 3 + 1] = 0.35 + Math.random() * 0.2 - r * 0.3
        dp[i * 3 + 2] = ch.cz + Math.sin(a) * r * 0.7
      }
      const dg = new THREE.BufferGeometry()
      dg.setAttribute('position', new THREE.BufferAttribute(dp, 3))
      const dm = new THREE.PointsMaterial({
        color: ch.color, size: 0.04, transparent: true, opacity: 0.8, depthWrite: true
      })
      const pts = new THREE.Points(dg, dm)
      this.scene.add(pts)
      this._refs.debrisLayers.push({ pts, speed: ch.speed })
      this._refs.debrisBases.push(dp.slice())
    }
  }

  // ======================== FLOOD ========================
  _buildFlood() {
    // --- High-res terrain with riverbed ---
    const seg = 70
    const geo = new THREE.PlaneGeometry(5, 5, seg, seg)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    const cols = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      // Riverbed depression following a meander
      const riverDist = Math.sin(x * 2.5 + 0.5) * 0.4
      const dToRiver = Math.abs(z - riverDist)
      let h = -0.08 + Math.sin(x * 3 + z * 2) * 0.04 + Math.cos(x * 5 - z * 4) * 0.025
      if (dToRiver < 0.25) h -= (0.25 - dToRiver) * 0.35
      pos.setY(i, h)
      const c = hsv(0.14, 0.4 + dToRiver * 0.5, 0.35 + h * 0.5)
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b
    }
    pos.needsUpdate = true
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3))
    geo.computeVertexNormals()
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, flatShading: true })
    this._refs.ground = new THREE.Mesh(geo, mat)
    this._refs.ground.receiveShadow = true
    this.scene.add(this._refs.ground)

    // --- River channel highlight ---
    const riverPts = []
    for (let i = 0; i <= 40; i++) {
      const x = -1.5 + i * 0.075
      riverPts.push(new THREE.Vector3(x, -0.06, Math.sin(x * 2.5 + 0.5) * 0.4))
    }
    const rGeoL = new THREE.BufferGeometry().setFromPoints(riverPts)
    this.scene.add(new THREE.Line(rGeoL, new THREE.LineBasicMaterial({ color: 0x3388bb, linewidth: 1 })))

    // --- Riverbank lines ---
    for (const side of [-1, 1]) {
      const bkPts = []
      for (let i = 0; i <= 40; i++) {
        const x = -1.5 + i * 0.075
        bkPts.push(new THREE.Vector3(x, -0.04, Math.sin(x * 2.5 + 0.5) * 0.4 + side * 0.22))
      }
      const bkGeo = new THREE.BufferGeometry().setFromPoints(bkPts)
      this.scene.add(new THREE.Line(bkGeo, new THREE.LineBasicMaterial({ color: 0x5a4a3a })))
    }

    // --- Buildings + trees ---
    this._refs.buildings = []
    const locs = [
      [-0.7, -0.7, 0.25], [0.5, 0.5, 0.3], [0.8, -0.5, 0.2], [-0.4, 0.7, 0.35],
      [-1.0, 0.3, 0.22], [0.3, -0.8, 0.28], [0.6, 0.0, 0.32], [-0.6, -0.2, 0.18],
      [-0.2, 0.3, 0.38], [0.9, 0.7, 0.24], [-0.8, -0.5, 0.3], [0.1, -0.4, 0.26],
      [-0.5, 0.9, 0.2], [0.4, -1.0, 0.22], [-1.1, -0.8, 0.28]
    ]
    for (const [bx, bz, h] of locs) {
      const w = 0.07 + Math.random() * 0.08, d = 0.07 + Math.random() * 0.08
      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: hsv(0.08, 0.2, 0.45 + Math.random() * 0.4) })
      )
      bldg.position.set(bx, h / 2 - 0.08, bz)
      bldg.castShadow = true
      // Roof
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(Math.max(w, d) * 0.7, 0.08, 4),
        new THREE.MeshStandardMaterial({ color: 0x8a4a3a })
      )
      roof.position.set(bx, h - 0.04, bz)
      roof.rotation.y = Math.PI / 4
      this.scene.add(roof)
      this.scene.add(bldg)
      this._refs.buildings.push(bldg)
    }

    // --- Dike ---
    const dikePts = []
    for (let i = 0; i <= 30; i++) {
      const x = -0.9 + i * 0.06
      dikePts.push(new THREE.Vector3(x, 0.02, Math.sin(x * 2.5 + 0.5) * 0.4 + 0.35))
    }
    const dikeCurve = new THREE.CatmullRomCurve3(dikePts)
    const dikeTube = new THREE.TubeGeometry(dikeCurve, 30, 0.03, 8, false)
    this.scene.add(new THREE.Mesh(dikeTube, new THREE.MeshStandardMaterial({ color: 0x6a5a4a })))

    // --- Flood marker poles ---
    for (let mi = 0; mi < 6; mi++) {
      const mx = -1.2 + mi * 0.5
      const mz = Math.sin(mx * 2.5 + 0.5) * 0.4 + 0.3
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.6, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      )
      pole.position.set(mx, 0.22, mz)
      this.scene.add(pole)
      // Water level marks
      for (const lvl of [0.1, 0.25, 0.4]) {
        const mark = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.01, 0.01),
          new THREE.MeshStandardMaterial({ color: lvl > 0.3 ? 0xff3333 : lvl > 0.2 ? 0xffaa00 : 0x33aa33 })
        )
        mark.position.set(mx, lvl, mz)
        this.scene.add(mark)
      }
    }

    // --- Animated water ---
    const waterGeo = new THREE.PlaneGeometry(6, 2, 40, 10)
    waterGeo.rotateX(-Math.PI / 2)
    this._refs.waterVerts = waterGeo.attributes.position.array.slice()
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x3a6a8a, roughness: 0.15, metalness: 0.1,
      transparent: true, opacity: 0.5
    })
    this._refs.water = new THREE.Mesh(waterGeo, waterMat)
    this._refs.water.position.y = -0.28
    this.scene.add(this._refs.water)
  }

  // ======================== PUBLIC API ========================
  setModule(name) {
    if (name === this.activeModule) return
    this.activeModule = name
    this.timeline = 0
    this._buildScene()
  }
  setMode(mode) { this.mode = mode }
  setTimeline(t) { this.timeline = t }
  setAutoRotate(on) { this.controls.autoRotate = on }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  dispose() {
    cancelAnimationFrame(this._raf)
    this._disposeAll()
    this.renderer.dispose()
    this.controls.dispose()
  }

  // ======================== ANIMATION LOOP ========================
  _animate() {
    this._raf = requestAnimationFrame(() => this._animate())
    this.animTime += 0.016
    const t = this.animTime

    if (this.activeModule === 'typhoon') this._animTyphoon(t)
    else if (this.activeModule === 'earthquake') this._animEarthquake(t)
    else if (this.activeModule === 'landslide') this._animLandslide(t)
    else if (this.activeModule === 'flood') this._animFlood(t)

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  _animTyphoon(t) {
    // Animate spiral layers at different speeds
    const layers = this._refs.spiralLayers
    const bases = this._refs.spiralBases
    const speeds = this._refs.spiralSpeeds
    if (!layers) return
    for (let li = 0; li < layers.length; li++) {
      const pos = layers[li].geometry.attributes.position.array
      const base = bases[li]
      const spd = speeds[li]
      for (let i = 0; i < pos.length / 3; i++) {
        const bx = base[i * 3], bz = base[i * 3 + 2]
        const r = Math.sqrt(bx * bx + bz * bz)
        const a = Math.atan2(bz, bx) + t * spd[i] * 0.5
        pos[i * 3] = Math.cos(a) * r
        pos[i * 3 + 2] = Math.sin(a) * r
        pos[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 2 + r * 3) * 0.02
      }
      layers[li].geometry.attributes.position.needsUpdate = true
    }

    // Eye wall rotation
    if (this._refs.eyeWall) this._refs.eyeWall.rotation.z += 0.005
    if (this._refs.eyeSphere) this._refs.eyeSphere.scale.setScalar(1 + Math.sin(t * 0.7) * 0.12)

    // Rain bands rotate slowly
    if (this._refs.rain) {
      const rp = this._refs.rain.geometry.attributes.position.array
      const rb = this._refs.rainBase
      for (let i = 0; i < rp.length / 3; i++) {
        const bx = rb[i * 3], bz = rb[i * 3 + 2]
        const r = Math.sqrt(bx * bx + bz * bz)
        const a = Math.atan2(bz, bx) + t * 0.3
        rp[i * 3] = Math.cos(a) * r
        rp[i * 3 + 2] = Math.sin(a) * r
      }
      this._refs.rain.geometry.attributes.position.needsUpdate = true
    }

    // Updraft pulse
    if (this._refs.updraft) this._refs.updraft.scale.y = 1 + Math.sin(t * 0.8) * 0.3

    // Sea waves
    if (this._refs.sea) {
      const sv = this._refs.sea.geometry.attributes.position.array
      const sb = this._refs.seaVerts
      for (let i = 0; i < sv.length / 3; i++) {
        const x = sb[i * 3], z = sb[i * 3 + 2]
        sv[i * 3 + 1] = sb[i * 3 + 1] + Math.sin(x * 3 + z * 2 + t) * 0.02 + Math.cos(x * 5 - z * 4 + t * 1.3) * 0.01
      }
      this._refs.sea.geometry.attributes.position.needsUpdate = true
    }
  }

  _animEarthquake(t) {
    const gnd = this._refs.ground
    if (!gnd) return
    const pos = gnd.geometry.attributes.position.array
    const base = this._refs.groundBase
    // Periodic shaking with realistic envelope
    const envelope = Math.max(0, (Math.sin(t * 0.8) * 0.7 + 0.3)) * (Math.sin(t * 15) * 0.5 + 0.5)
    const intensity = 0.015 * envelope
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] = base[i + 1] + (Math.sin(i * 0.7 + t * 20) * 0.5) * intensity
    }
    gnd.geometry.attributes.position.needsUpdate = true

    // Building shake
    for (const b of this._refs.buildings) {
      const origX = b.position.x
      b.position.x += (Math.sin(b.position.z * 10 + t * 18) * 0.5) * intensity * 3
      b.rotation.z = (Math.sin(t * 16)) * intensity * 4
      b.rotation.x = (Math.cos(t * 14)) * intensity * 3
    }

    // Epicenter pulse
    if (this._refs.epicenter) {
      this._refs.epicenter.scale.setScalar(1 + envelope * 2)
      this._refs.epicenter.material.emissiveIntensity = 1 + envelope * 4
    }

    // Wave rings
    for (let i = 0; i < this._refs.waves.length; i++) {
      const w = this._refs.waves[i]
      const offset = i * 0.35
      const phase = ((t * 1.5 + offset) % 2) / 2
      const s = 0.3 + phase * 6
      w.scale.set(s, s, s)
      w.material.opacity = 0.5 * (1 - phase)
    }
  }

  _animLandslide(t) {
    const layers = this._refs.debrisLayers
    const bases = this._refs.debrisBases
    if (!layers) return
    const flow = Math.min(this.timeline * 1.5, 1.0) * (0.5 + 0.5 * Math.max(0, Math.sin(t * 0.3)))
    for (let li = 0; li < layers.length; li++) {
      const pos = layers[li].pts.geometry.attributes.position.array
      const base = bases[li]
      const sp = layers[li].speed
      for (let i = 0; i < pos.length / 3; i++) {
        const i3 = i * 3
        const ease = Math.min(flow * sp, 0.8) * (0.2 + (Math.sin(base[i3] * 5 + base[i3 + 2] * 4) * 0.5 + 0.5) * 0.6)
        pos[i3] = base[i3] - ease * 0.4 - ease * base[i3 + 2] * 0.3
        pos[i3 + 1] = base[i3 + 1] - ease * 0.6
        pos[i3 + 2] = base[i3 + 2] + ease * 0.5
      }
      layers[li].pts.geometry.attributes.position.needsUpdate = true
    }
    // Scarp shakes slightly
    if (this._refs.scarp) this._refs.scarp.position.y = Math.sin(t * 3) * 0.005 * flow
  }

  _animFlood(t) {
    const water = this._refs.water
    if (!water) return
    const targetY = -0.28 + this.timeline * 0.6
    water.position.y += (targetY - water.position.y) * 0.03
    water.material.opacity = 0.3 + this.timeline * 0.4

    // Water surface waves
    const verts = water.geometry.attributes.position.array
    const base = this._refs.waterVerts
    for (let i = 0; i < verts.length / 3; i++) {
      const x = base[i * 3], z = base[i * 3 + 2]
      verts[i * 3 + 1] = base[i * 3 + 1] + Math.sin(x * 4 + z * 3 + t * 2) * 0.015 + Math.cos(x * 6 - z * 5 + t * 2.5) * 0.01
    }
    water.geometry.attributes.position.needsUpdate = true
  }
}
