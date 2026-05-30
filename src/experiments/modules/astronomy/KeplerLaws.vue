<template>
  <div class="kl-layout">
    <aside class="kl-panel">
      <div class="preset-row">
        <button class="preset-btn" :class="{ active: activePreset === 'nearcircle' }" @click="setPreset('nearcircle')">近圆轨道</button>
        <button class="preset-btn" :class="{ active: activePreset === 'ellipse' }" @click="setPreset('ellipse')">椭圆轨道</button>
        <button class="preset-btn" :class="{ active: activePreset === 'comet' }" @click="setPreset('comet')">彗星轨道</button>
      </div>
      <label>离心率 <span>{{ eccentricity.toFixed(2) }}</span></label>
      <input type="range" min="0" max="0.9" step="0.01" v-model.number="eccentricity" @input="onParam" />
      <button @click="autoPlay">{{ auto ? '⏸ 暂停' : '▶ 自动演示' }}</button>
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
      <p class="kl-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="kl-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁旋转' : '锁定旋转'">
        {{ locked ? '🔒' : '🔓' }}
      </button>
    </div>
  </div>
  <div class="exp-desc">
    <h4>实验说明</h4>
    <p>本实验可视化开普勒行星运动三大定律：第一定律——行星沿椭圆轨道运动，太阳位于焦点；第二定律——行星与太阳连线在相等时间内扫过相等面积（近日点速度快，远日点速度慢）；第三定律——轨道周期的平方与半长轴的立方成正比。调节离心率对比近圆轨道与彗星轨道。</p>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'KeplerLaws',
  data() { return {
    eccentricity: 0.5, auto: false, activePreset: 'ellipse', locked: true,
    guideActive: false,
    guideText: '',
    _guideTexts: [
      '第一定律：行星轨道为椭圆，太阳位于一个焦点上',
      '第二定律：行星与太阳连线在相等时间内扫过相等面积',
      '第三定律：轨道周期的平方与半长轴的立方成正比',
      '观察近日点速度快、远日点速度慢的变化',
    ],
  } },
  mounted() {
    this._e = new KeplerLawsEngine()
    this._e._vm = this
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => { this._e.init(this.$refs.cvs); if (this.locked) this._e.controls.enabled = false })
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    toggleLock() { this.locked = !this.locked; if (this._e?.controls) this._e.controls.enabled = !this.locked },
    onParam() { this._e.setParams({ eccentricity: this.eccentricity }) },
    autoPlay() { this.auto = !this.auto; this._e.auto = this.auto },
    toggleGuide() {
      this.guideActive = !this.guideActive
      if (this.guideActive) {
        this._e.startGuidedMode(this._guideTexts)
        this.guideText = this._e.getGuideText()
      } else {
        this._e.stopGuidedMode()
        this.guideText = ''
      }
    },
    setPreset(key) {
      this.activePreset = key
      if (this.auto) { this.auto = false; this._e.auto = false }
      const ecc = { nearcircle: 0.1, ellipse: 0.5, comet: 0.85 }
      this.eccentricity = ecc[key]
      this.onParam()
    },
  },
}

class KeplerLawsEngine extends ExperimentEngine {
  _createStars() {
    const starsGeo = new THREE.BufferGeometry()
    const count = 100
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 25 + Math.random() * 5
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.9 })
    this._stars = new THREE.Points(starsGeo, starsMat)
    this.scene.add(this._stars)
  }

  setupScene() {
    this.scene.background = new THREE.Color(0x000011)
    this.scene.fog = null

    // Remove base warm ambient, replace with cool space lighting
    const existingAmbient = this.scene.children.find(c => c.isAmbientLight)
    if (existingAmbient) {
      this.scene.remove(existingAmbient)
    }
    const ambient = new THREE.AmbientLight(0x334466, 1.5)
    this.scene.add(ambient)

    // Deep space starfield
    this._createStars()

    // Sun at focus - HUGE, radius 3.5, intense golden glow
    this.sunGeo = new THREE.SphereGeometry(3.5, 64, 64)
    this.sun = new THREE.Mesh(this.sunGeo, new THREE.MeshBasicMaterial({ color: 0xffcc00 }))
    this.scene.add(this.sun)

    // Sun corona - large transparent gold sphere
    const coronaGeo = new THREE.SphereGeometry(4.5, 32, 32)
    const coronaMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.05 })
    this._sunCorona = new THREE.Mesh(coronaGeo, coronaMat)
    this.scene.add(this._sunCorona)

    // Bright point light at sun
    const sunLight = new THREE.PointLight(0xfff8e8, 120, 80)
    sunLight.position.set(0, 0, 0)
    this.scene.add(sunLight)

    // Planet - radius 1.0, bright blue/teal with emissive glow
    this.planetGeo = new THREE.SphereGeometry(1.0, 32, 32)
    this.planet = new THREE.Mesh(this.planetGeo, new THREE.MeshStandardMaterial({
      color: 0x00bcd4, roughness: 0.2, emissive: 0x004466, emissiveIntensity: 0.6,
    }))
    this.scene.add(this.planet)

    // Small moon orbiting planet
    const moonGeo = new THREE.SphereGeometry(0.15, 16, 16)
    const moonMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5 })
    this._moon = new THREE.Mesh(moonGeo, moonMat)
    this.scene.add(this._moon)

    this.ellipseLine = null

    // Pre-allocate sector meshes (geometry updated per frame, not recreated)
    this.areaSectors = []
    this._maxSectors = 10
    for (let i = 0; i < this._maxSectors; i++) {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3))
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffd700, side: THREE.DoubleSide,
        transparent: true, opacity: 0.4,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.visible = false
      this.scene.add(mesh)
      this.areaSectors.push(mesh)
    }

    this.semiMajor = 12
    this.ecc = 0.5
    this.meanAnomaly = 0
    this.trail = []
    this.auto = false

    this._rebuildEllipse()
    this._makeMarkers()

    // Sprite labels - HUGE font 48-52, scale 3.5-5.0
    this.scene.add(this._makeLabel('太阳 (焦点)', new THREE.Vector3(0, 5.5, 0), '#ffcc00', 52, 5.0))
    this.scene.add(this._makeLabel('椭圆轨道', new THREE.Vector3(7, 4, 8), '#ffffff', 48, 4.5))
    this._sectorLabel = this._makeLabel('等面积扇形', new THREE.Vector3(this.focusOffset + 5, 3, 4), '#ffd700', 48, 4.0)
    this.scene.add(this._sectorLabel)
    this._planetLabel = this._makeLabel('行星',
      new THREE.Vector3(Math.cos(0) * this.semiMajor + this.focusOffset, 1.5, Math.sin(0) * this.semiMajor * Math.sqrt(1 - this.ecc * this.ecc)),
      '#00bcd4', 48, 4.0)
    this.scene.add(this._planetLabel)

    // Dynamic eccentricity label - shows current e value and orbit type
    this._eccLabel = this._makeLabel('', new THREE.Vector3(-9, 8, 0), '#ffffff', 48, 4.0)
    this.scene.add(this._eccLabel)
    this._updateEccLabel()

    // Camera - pulled back to see the huge orbit
    this.camera.position.set(0, 14, 18)
    this.controls.target.set(0, 0, 0)
  }

  _rebuildEllipse() {
    if (this.ellipseLine) {
      this.scene.remove(this.ellipseLine)
      this.ellipseLine.geometry.dispose()
      this.ellipseLine.material.dispose()
    }
    const a = this.semiMajor
    const e = this.ecc
    const b = a * Math.sqrt(1 - e * e)
    const c = a * e
    const pts = []
    const n = 200
    for (let i = 0; i <= n; i++) {
      const theta = (i / n) * Math.PI * 2
      pts.push(new THREE.Vector3(a * Math.cos(theta) + c, 0, b * Math.sin(theta)))
    }
    // TubeGeometry for thick, visible orbit line
    const curve = new THREE.CatmullRomCurve3(pts, true)
    const geo = new THREE.TubeGeometry(curve, 200, 0.04, 8, true)
    const mat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.65 })
    this.ellipseLine = new THREE.Mesh(geo, mat)
    this.scene.add(this.ellipseLine)

    this.focusOffset = c
    this.sun.position.set(this.focusOffset, 0, 0)
    if (this._sunCorona) this._sunCorona.position.copy(this.sun.position)
  }

  _makeMarkers() {
    const a = this.semiMajor
    const e = this.ecc
    const c = a * e

    // Remove old labels
    if (this._periLabel) { this.scene.remove(this._periLabel); this._sprites = this._sprites.filter(s => s !== this._periLabel); this._periLabel = null }
    if (this._aphLabel) { this.scene.remove(this._aphLabel); this._sprites = this._sprites.filter(s => s !== this._aphLabel); this._aphLabel = null }

    // Perihelion marker - red glowing sphere, radius 0.5
    const periGeo = new THREE.SphereGeometry(0.5, 16, 16)
    const periMat = new THREE.MeshBasicMaterial({ color: 0xef5350 })
    this.periMarker = new THREE.Mesh(periGeo, periMat)
    this.periMarker.position.set(a + c, 0, 0)
    this.scene.add(this.periMarker)

    // Aphelion marker - blue glowing sphere, radius 0.5
    const aphGeo = new THREE.SphereGeometry(0.5, 16, 16)
    const aphMat = new THREE.MeshBasicMaterial({ color: 0x64b5f6 })
    this.aphMarker = new THREE.Mesh(aphGeo, aphMat)
    this.aphMarker.position.set(-a + c, 0, 0)
    this.scene.add(this.aphMarker)

    this._periLabel = this._makeLabel('近日点', this.periMarker.position.clone().add(new THREE.Vector3(0.5, 1.8, 0)), '#ff6b6b', 52, 4.0)
    this.scene.add(this._periLabel)
    this._aphLabel = this._makeLabel('远日点', this.aphMarker.position.clone().add(new THREE.Vector3(-0.5, 1.8, 0)), '#64b5f6', 52, 4.0)
    this.scene.add(this._aphLabel)
  }

  _removeMarkers() {
    if (this.periMarker) { this.scene.remove(this.periMarker); this.periMarker.geometry.dispose(); this.periMarker.material.dispose(); this.periMarker = null }
    if (this.aphMarker) { this.scene.remove(this.aphMarker); this.aphMarker.geometry.dispose(); this.aphMarker.material.dispose(); this.aphMarker = null }
  }

  _updateEccLabel() {
    if (!this._eccLabel) return
    let desc = '椭圆轨道'
    if (this.ecc < 0.15) desc = '圆轨道'
    else if (this.ecc > 0.75) desc = '彗星轨道'
    const pos = this._eccLabel.position.clone()
    this.scene.remove(this._eccLabel)
    this._sprites = this._sprites.filter(s => s !== this._eccLabel)
    if (this._eccLabel.material) {
      if (this._eccLabel.material.map) this._eccLabel.material.map.dispose()
      this._eccLabel.material.dispose()
    }
    this._eccLabel = this._makeLabel('e = ' + this.ecc.toFixed(2) + '  ' + desc, pos, '#ffffff', 48, 4.0)
    this.scene.add(this._eccLabel)
  }

  _updateSectors() {
    // Hide all pool sectors first
    for (const s of this.areaSectors) {
      s.visible = false
    }

    if (this.trail.length < 3) return

    const sunPos = new THREE.Vector3(this.focusOffset, 0, 0)
    const trail = this.trail
    const n = Math.min(trail.length - 2, this._maxSectors - 1)

    for (let i = 0; i < n; i++) {
      const p1 = trail[trail.length - 3 - i]
      const p2 = trail[trail.length - 2 - i]
      const sector = this.areaSectors[i]

      const positions = sector.geometry.attributes.position
      positions.setXYZ(0, sunPos.x, sunPos.y, sunPos.z)
      positions.setXYZ(1, p1.x, p1.y, p1.z)
      positions.setXYZ(2, p2.x, p2.y, p2.z)
      positions.needsUpdate = true

      sector.geometry.computeVertexNormals()
      // Gold gradient from focus outward - clearly shows "equal area in equal time"
      sector.material.color.setHSL(0.13, 0.9, 0.5 + i * 0.05)
      sector.material.opacity = 0.25 + i * 0.06
      sector.visible = true
    }
  }

  _solveKepler(M, e) {
    let E = M
    for (let i = 0; i < 10; i++) {
      const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
      E -= dE
      if (Math.abs(dE) < 1e-8) break
    }
    return E
  }

  _planetPos(M, e) {
    const E = this._solveKepler(M, e)
    const a = this.semiMajor
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2))
    const r = a * (1 - e * Math.cos(E))
    return {
      x: r * Math.cos(nu) + this.focusOffset,
      z: r * Math.sin(nu),
      r,
      nu,
    }
  }

  update(dt) {
    if (this.auto) {
      const meanMotion = 1.5
      this.meanAnomaly += dt * meanMotion
      if (this.meanAnomaly > Math.PI * 2) this.meanAnomaly -= Math.PI * 2
    }

    const pos = this._planetPos(this.meanAnomaly, this.ecc)
    this.planet.position.set(pos.x, 0, pos.z)

    // Moon orbits the planet 5x faster for visual drama
    if (this._moon) {
      const moonAngle = this.meanAnomaly * 5
      this._moon.position.set(
        pos.x + Math.cos(moonAngle) * 1.8,
        0,
        pos.z + Math.sin(moonAngle) * 1.8,
      )
    }

    if (this._planetLabel) {
      this._planetLabel.position.copy(this.planet.position).add(new THREE.Vector3(0, 1.5, 0))
    }

    this.trail.push(this.planet.position.clone())
    if (this.trail.length > 100) this.trail.shift()

    this._updateSectors()
  }

  setParams({ eccentricity }) {
    if (eccentricity !== undefined && Math.abs(eccentricity - this.ecc) > 0.001) {
      this.ecc = Math.max(0, Math.min(0.9, eccentricity))
      this._removeMarkers()
      this._updateSectors()
      this._rebuildEllipse()
      this._makeMarkers()
      this._updateEccLabel()
      this.meanAnomaly = 0
      this.trail = []
      this._vm.eccentricity = parseFloat(this.ecc.toFixed(2))
    }
  }
}
</script>

<style scoped>
.kl-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.kl-panel { width: 210px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.preset-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.preset-btn { flex: 1; min-width: 55px; padding: 4px 6px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.preset-btn:hover { background: var(--button-green); }
.preset-btn.active:hover { background: var(--red); }
.kl-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.kl-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.kl-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.kl-panel button:hover { background: var(--button-green); }
.kl-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.kl-canvas-wrap { flex: 1; min-height: 460px; background: #000011; position: relative; }
.lock-btn { position: absolute; top: 12px; right: 12px; z-index: 10; width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--brown); background: rgba(255,255,255,0.85); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lock-btn:hover { background: rgba(255,255,255,1); }
.kl-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

.exp-desc { margin-top: 16px; padding: 14px 18px; background: var(--card-bg); border-radius: var(--radius-card); border: 1px solid var(--brown-light); }
.exp-desc h4 { font-size: 14px; color: var(--red); margin: 0 0 6px; }
.exp-desc p { font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; }

@media (max-width: 720px) {
  .kl-layout { flex-direction: column; }
  .kl-panel {
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid var(--brown-light);
    padding: 10px 12px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
  .kl-panel label { font-size: 12px; flex: 1 1 auto; min-width: 80px; }
  .kl-panel input[type="range"] { flex: 2 1 auto; min-width: 100px; }
  .kl-panel button { font-size: 12px; padding: 5px 8px; }
  .kl-canvas-wrap { min-height: 280px; }
  .guide-text-box { width: 100%; font-size: 11px; }
  .kl-hint { font-size: 10px; }
  .preset-row { width: 100%; }
  .preset-btn { font-size: 10px; padding: 4px 6px; }
  .exp-desc { padding: 10px 14px; margin-top: 12px; }
  .exp-desc h4 { font-size: 13px; }
  .exp-desc p { font-size: 13px; line-height: 1.6; }
  .lock-btn { width: 30px; height: 30px; top: 8px; right: 8px; font-size: 16px; }
}
</style>
