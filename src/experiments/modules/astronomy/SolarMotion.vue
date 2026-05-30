<template>
  <div class="sm-layout">
    <aside class="sm-panel">
      <label>纬度 <span>{{ latitude }}°{{ latitude >= 0 ? 'N' : 'S' }}</span></label>
      <input type="range" min="-90" max="90" v-model.number="latitude" @input="onParam" />
      <label>季节</label>
      <select v-model="season" @change="onParam">
        <option value="spring">春分</option>
        <option value="summer">夏至</option>
        <option value="autumn">秋分</option>
        <option value="winter">冬至</option>
      </select>
      <div class="sm-info">
        <div>太阳高度角（正午）</div>
        <strong>{{ maxAlt.toFixed(1) }}°</strong>
      </div>
      <button @click="autoPlay">{{ auto ? '⏸ 暂停' : '▶ 自动演示' }}</button>
      <p class="sm-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="sm-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

const seasonDeclination = { spring: 0, summer: 23.5, autumn: 0, winter: -23.5 }

export default {
  name: 'SolarMotion',
  data() { return { latitude: 30, season: 'spring', auto: false, maxAlt: 60 } },
  mounted() {
    this._e = new SolarMotionEngine()
    this._e._vm = this
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', () => this._e?.resize())
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', () => this._e?.resize()) },
  methods: {
    onParam() {
      this.maxAlt = Math.max(0, 90 - this.latitude + seasonDeclination[this.season])
      this._e.setParams({ latitude: this.latitude, season: this.season })
    },
    autoPlay() { this.auto = !this.auto; this._e.auto = this.auto },
  },
}

class SolarMotionEngine extends ExperimentEngine {
  setupScene() {
    this.scene.background = new THREE.Color(0x0a0a1a)

    this.domeRadius = 6
    const domeGeo = new THREE.SphereGeometry(this.domeRadius, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2)
    const domeMat = new THREE.MeshBasicMaterial({ color: 0x334466, wireframe: true, transparent: true, opacity: 0.25 })
    this.dome = new THREE.Mesh(domeGeo, domeMat)
    this.scene.add(this.dome)

    const groundGeo = new THREE.PlaneGeometry(12, 12)
    groundGeo.rotateX(-Math.PI / 2)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3e5c3e, roughness: 0.9 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.position.y = -0.05
    ground.receiveShadow = true
    this.scene.add(ground)

    const grid = new THREE.GridHelper(12, 12, 0x556655, 0x3a4a3a)
    grid.position.y = -0.04
    this.scene.add(grid)

    const stickGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8)
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
    this.stick = new THREE.Mesh(stickGeo, stickMat)
    this.stick.position.set(0, 0.6, 0)
    this.stick.castShadow = true
    this.scene.add(this.stick)

    this.shadowLine = null
    this._makeShadowLine()

    this.sunGeo = new THREE.SphereGeometry(0.3, 16, 16)
    this.sunMesh = new THREE.Mesh(this.sunGeo, new THREE.MeshBasicMaterial({ color: 0xffd54f }))
    this.scene.add(this.sunMesh)

    const sunGlowGeo = new THREE.SphereGeometry(0.45, 16, 16)
    const sunGlow = new THREE.Mesh(sunGlowGeo, new THREE.MeshBasicMaterial({ color: 0xffd54f, transparent: true, opacity: 0.15 }))
    this.sunMesh.add(sunGlow)

    const sunLight = new THREE.PointLight(0xfff8e8, 15, 20)
    this.sunMesh.add(sunLight)

    const ambient = new THREE.AmbientLight(0x333355, 0.8)
    this.scene.add(ambient)

    this.latitude = 30
    this.declination = 0
    this.maxAltitude = 60
    this.sunAngle = Math.PI / 2
    this.auto = false

    this._drawArcPath()

    this.camera.position.set(0, 5, 10)
    this.controls.target.set(0, 2, 0)
  }

  _makeShadowLine() {
    if (this.shadowLine) {
      this.scene.remove(this.shadowLine)
      this.shadowLine.geometry.dispose()
      this.shadowLine.material.dispose()
    }
    const pts = [new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(0, 0.05, 0)]
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    this.shadowLine = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x222222, linewidth: 2 }))
    this.scene.add(this.shadowLine)
  }

  _drawArcPath() {
    if (this.arcLine) {
      this.scene.remove(this.arcLine)
      this.arcLine.geometry.dispose()
      this.arcLine.material.dispose()
    }
    const R = this.domeRadius
    const maxAltRad = this.maxAltitude * Math.PI / 180
    const pts = []
    const n = 100
    for (let i = 0; i <= n; i++) {
      const az = (i / n) * Math.PI
      const alt = maxAltRad * Math.sin(az)
      pts.push(new THREE.Vector3(
        R * Math.cos(alt) * Math.cos(az),
        R * Math.sin(alt),
        -R * Math.cos(alt) * Math.sin(az)
      ))
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    this.arcLine = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xff8a65, transparent: true, opacity: 0.5 }))
    this.scene.add(this.arcLine)

    const noonPts = []
    const altNoon = maxAltRad
    const azNoon = Math.PI / 2
    noonPts.push(new THREE.Vector3(0, 0.05, 0))
    noonPts.push(new THREE.Vector3(
      R * Math.cos(altNoon) * Math.cos(azNoon),
      R * Math.sin(altNoon),
      -R * Math.cos(altNoon) * Math.sin(azNoon)
    ))
    if (this.noonLine) {
      this.scene.remove(this.noonLine)
      this.noonLine.geometry.dispose()
      this.noonLine.material.dispose()
    }
    const noonGeo = new THREE.BufferGeometry().setFromPoints(noonPts)
    this.noonLine = new THREE.Line(noonGeo, new THREE.LineBasicMaterial({ color: 0xffcc80, transparent: true, opacity: 0.3 }))
    this.scene.add(this.noonLine)

    if (this.noonDot) {
      this.scene.remove(this.noonDot)
      this.noonDot.geometry.dispose()
      this.noonDot.material.dispose()
    }
    const dotGeo = new THREE.SphereGeometry(0.12, 8, 8)
    this.noonDot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xffcc80 }))
    this.noonDot.position.copy(noonPts[1])
    this.scene.add(this.noonDot)
  }

  update(dt) {
    if (this.auto) {
      this.sunAngle += dt * 0.6
      if (this.sunAngle > Math.PI) this.sunAngle = 0
    }

    const maxAltRad = this.maxAltitude * Math.PI / 180
    const az = this.sunAngle
    const alt = maxAltRad * Math.sin(az)
    const R = this.domeRadius

    this.sunMesh.position.set(
      R * Math.cos(alt) * Math.cos(az),
      R * Math.sin(alt),
      -R * Math.cos(alt) * Math.sin(az)
    )

    const sunXZ = new THREE.Vector2(this.sunMesh.position.x, this.sunMesh.position.z)
    const len = sunXZ.length()
    if (len > 0.01 && this.sunMesh.position.y > 0.01) {
      const shadowLen = Math.min(6, 1.2 / Math.tan(Math.max(0.02, Math.asin(this.sunMesh.position.y / R))))
      const dir = sunXZ.clone().normalize()
      const pts = this.shadowLine.geometry.attributes.position
      pts.setXYZ(1, dir.x * shadowLen, 0.05, dir.y * shadowLen)
    } else {
      const pts = this.shadowLine.geometry.attributes.position
      pts.setXYZ(1, 0, 0.05, 0)
    }
    this.shadowLine.geometry.attributes.position.needsUpdate = true
  }

  setParams({ latitude, season }) {
    let changed = false
    if (latitude !== undefined && latitude !== this.latitude) {
      this.latitude = latitude
      changed = true
    }
    if (season !== undefined) {
      const dec = seasonDeclination[season] || 0
      if (dec !== this.declination) {
        this.declination = dec
        this.maxAltitude = Math.max(0, 90 - this.latitude + this.declination)
        this._vm.maxAlt = this.maxAltitude
        changed = true
      }
    }
    if (changed) {
      this.maxAltitude = Math.max(0, 90 - this.latitude + this.declination)
      this._drawArcPath()
    }
  }
}
</script>

<style scoped>
.sm-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.sm-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.sm-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.sm-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.sm-panel select { padding: 4px 8px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); font-family: inherit; font-size: 13px; }
.sm-info { text-align: center; padding: 8px; background: rgba(158,36,38,0.06); border-radius: var(--radius-sm); font-size: 13px; color: var(--ink); }
.sm-info strong { font-size: 18px; color: var(--red); }
.sm-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.sm-panel button:hover { background: var(--button-green); }
.sm-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.sm-canvas-wrap { flex: 1; min-height: 460px; background: #0a0a1a; }
.sm-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .sm-layout { flex-direction: column; }
  .sm-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .sm-canvas-wrap { min-height: 320px; }
}
</style>
