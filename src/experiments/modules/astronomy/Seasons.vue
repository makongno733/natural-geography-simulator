<template>
  <div class="se-layout">
    <aside class="se-panel">
      <label>公转位置 <span>{{ orbitAngle }}°</span></label>
      <input type="range" min="0" max="360" v-model.number="orbitAngle" @input="onParam" />
      <div class="se-season-label">当前节气：<strong>{{ seasonLabel }}</strong></div>
      <div class="se-marker-list">
        <span :class="{ active: near(0) }">春分 0°</span>
        <span :class="{ active: near(90) }">夏至 90°</span>
        <span :class="{ active: near(180) }">秋分 180°</span>
        <span :class="{ active: near(270) }">冬至 270°</span>
      </div>
      <button @click="autoPlay">{{ auto ? '⏸ 暂停' : '▶ 自动演示' }}</button>
      <p class="se-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="se-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

const seasonNames = ['春分', '夏至', '秋分', '冬至']

function makeLabel(text, color) {
  const cvs = document.createElement('canvas')
  cvs.width = 128; cvs.height = 64
  const ctx = cvs.getContext('2d')
  ctx.fillStyle = color || '#ffffff'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 64, 32)
  const tex = new THREE.CanvasTexture(cvs)
  tex.minFilter = THREE.LinearFilter
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(2, 1, 1)
  return sprite
}

export default {
  name: 'Seasons',
  data() { return { orbitAngle: 0, auto: false, seasonLabel: '春分' } },
  mounted() {
    this._e = new SeasonsEngine()
    this._e._vm = this
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    onParam() { this._e.setParams({ orbitAngle: this.orbitAngle * Math.PI / 180 }) },
    autoPlay() { this.auto = !this.auto; this._e.auto = this.auto },
    near(deg) { return Math.abs(((this.orbitAngle % 360 + 360) % 360) - deg) < 10 },
  },
}

class SeasonsEngine extends ExperimentEngine {
  setupScene() {
    this.scene.background = new THREE.Color(0x0a0a1a)
    this.scene.fog = null

    // Remove base warm ambient, replace with cool space lighting
    const existingAmbient = this.scene.children.find(c => c.isAmbientLight)
    if (existingAmbient) {
      this.scene.remove(existingAmbient)
    }
    const ambient = new THREE.AmbientLight(0x334466, 1.5)
    this.scene.add(ambient)

    const sunGeo = new THREE.SphereGeometry(1.5, 32, 32)
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd54f })
    const sun = new THREE.Mesh(sunGeo, sunMat)
    this.scene.add(sun)

    const sunLight = new THREE.PointLight(0xfff8e8, 60, 40)
    sunLight.position.copy(sun.position)
    this.scene.add(sunLight)

    const orbitGeo = new THREE.TorusGeometry(6, 0.06, 16, 128)
    const orbitRing = new THREE.Mesh(orbitGeo, new THREE.MeshBasicMaterial({ color: 0xb8a57a, transparent: true, opacity: 0.35 }))
    this.scene.add(orbitRing)

    this.orbitAngle = 0
    this.auto = false
    this.orbitRadius = 6
    this.tiltAngle = 23.5 * Math.PI / 180

    this.earthGroup = new THREE.Group()
    this.scene.add(this.earthGroup)

    const earthGeo = new THREE.SphereGeometry(0.5, 32, 32)
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, roughness: 0.5 })
    this.earth = new THREE.Mesh(earthGeo, earthMat)
    this.earthGroup.add(this.earth)

    const axisLen = 1.4
    const axisGeo = new THREE.CylinderGeometry(0.06, 0.06, axisLen, 8)
    const axisMat = new THREE.MeshStandardMaterial({ color: 0xff8a65 })
    const axis = new THREE.Mesh(axisGeo, axisMat)
    axis.position.y = 0
    this.earthGroup.add(axis)

    const nubGeo = new THREE.SphereGeometry(0.12, 8, 8)
    const nNorth = new THREE.Mesh(nubGeo, new THREE.MeshBasicMaterial({ color: 0xff5252 }))
    nNorth.position.y = axisLen / 2
    this.earthGroup.add(nNorth)
    const nSouth = new THREE.Mesh(nubGeo, new THREE.MeshBasicMaterial({ color: 0x448aff }))
    nSouth.position.y = -axisLen / 2
    this.earthGroup.add(nSouth)

    this.earthGroup.rotation.x = this.tiltAngle

    const markerPositions = [
      { a: 0, label: '春分', color: '#81c784' },
      { a: Math.PI / 2, label: '夏至', color: '#ef5350' },
      { a: Math.PI, label: '秋分', color: '#ffb74d' },
      { a: Math.PI * 1.5, label: '冬至', color: '#64b5f6' },
    ]
    for (const m of markerPositions) {
      const sprite = makeLabel(m.label, m.color)
      sprite.position.set(Math.cos(m.a) * 6, 1.2, Math.sin(m.a) * 6)
      this.scene.add(sprite)
      const dotGeo = new THREE.SphereGeometry(0.15, 8, 8)
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: m.color }))
      dot.position.copy(sprite.position)
      this.scene.add(dot)
    }

    this.camera.position.set(3, 9, 13)
    this.controls.target.set(0, 0, 0)
  }

  update(dt) {
    if (this.auto) {
      this.orbitAngle += dt * 0.5
      if (this.orbitAngle > Math.PI * 2) this.orbitAngle -= Math.PI * 2
      this._vm.orbitAngle = Math.round((this.orbitAngle * 180 / Math.PI) % 360)
      this._vm.seasonLabel = seasonNames[Math.round(this.orbitAngle / (Math.PI / 2)) % 4]
    }
    const a = this.orbitAngle
    this.earthGroup.position.set(Math.cos(a) * this.orbitRadius, 0, Math.sin(a) * this.orbitRadius)
  }

  setParams({ orbitAngle }) {
    if (orbitAngle !== undefined) {
      this.orbitAngle = orbitAngle
      this._vm.seasonLabel = seasonNames[Math.round(orbitAngle / (Math.PI / 2)) % 4]
    }
  }
}
</script>

<style scoped>
.se-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.se-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.se-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.se-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.se-season-label { font-size: 15px; color: var(--ink); text-align: center; padding: 8px; background: rgba(158,36,38,0.06); border-radius: var(--radius-sm); }
.se-marker-list { display: flex; flex-wrap: wrap; gap: 4px; font-size: 11px; }
.se-marker-list span { padding: 2px 6px; border-radius: var(--radius-sm); background: rgba(184,165,122,0.12); color: var(--muted); }
.se-marker-list span.active { background: var(--red); color: #fff; }
.se-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.se-panel button:hover { background: var(--button-green); }
.se-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.se-canvas-wrap { flex: 1; min-height: 460px; background: #0a0a1a; }
.se-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .se-layout { flex-direction: column; }
  .se-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .se-canvas-wrap { min-height: 320px; }
}
</style>
