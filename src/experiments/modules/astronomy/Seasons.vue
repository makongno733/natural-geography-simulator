<template>
  <div class="se-layout">
    <aside class="se-panel">
      <div class="preset-row">
        <button class="preset-btn" :class="{ active: activePreset === 'spring' }" @click="setPreset('spring')">春分</button>
        <button class="preset-btn" :class="{ active: activePreset === 'summer' }" @click="setPreset('summer')">夏至</button>
        <button class="preset-btn" :class="{ active: activePreset === 'autumn' }" @click="setPreset('autumn')">秋分</button>
        <button class="preset-btn" :class="{ active: activePreset === 'winter' }" @click="setPreset('winter')">冬至</button>
      </div>
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
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
      <p class="se-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="se-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁旋转' : '锁定旋转'">
        {{ locked ? '🔒' : '🔓' }}
      </button>
    </div>
  </div>
  <div class="exp-desc">
    <h4>实验说明</h4>
    <p>本实验展示四季成因：地球绕日公转过程中，23.5°的地轴倾角保持不变，导致太阳直射点在南北回归线之间移动。夏至时北半球倾向太阳（昼长夜短），冬至时南半球倾向太阳。春分和秋分时太阳直射赤道，全球昼夜等长。</p>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

const seasonNames = ['春分', '夏至', '秋分', '冬至']

export default {
  name: 'Seasons',
  data() { return {
    orbitAngle: 0, auto: false, seasonLabel: '春分', activePreset: 'spring', locked: true,
    guideActive: false,
    guideText: '',
    _guideTexts: [
      '地轴倾角 23.5° 是四季形成的根本原因',
      '夏至时太阳直射北回归线，北半球昼长夜短',
      '冬至时太阳直射南回归线，北半球昼短夜长',
      '春分和秋分时太阳直射赤道，全球昼夜等长',
    ],
  } },
  mounted() {
    this._e = new SeasonsEngine()
    this._e._vm = this
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => { this._e.init(this.$refs.cvs); if (this.locked) this._e.controls.enabled = false })
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    toggleLock() { this.locked = !this.locked; if (this._e?.controls) this._e.controls.enabled = !this.locked },
    onParam() { this._e.setParams({ orbitAngle: this.orbitAngle * Math.PI / 180 }) },
    autoPlay() { this.auto = !this.auto; this._e.auto = this.auto },
    near(deg) { return Math.abs(((this.orbitAngle % 360 + 360) % 360) - deg) < 10 },
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
      const angles = { spring: 0, summer: 90, autumn: 180, winter: 270 }
      this.orbitAngle = angles[key]
      this.onParam()
    },
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

    const sunGeo = new THREE.SphereGeometry(3.0, 32, 32)
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd54f })
    const sun = new THREE.Mesh(sunGeo, sunMat)
    this.scene.add(sun)

    const sunLight = new THREE.PointLight(0xfff8e8, 90, 60)
    sunLight.position.copy(sun.position)
    this.scene.add(sunLight)

    const orbitGeo = new THREE.TorusGeometry(10, 0.06, 16, 128)
    const orbitRing = new THREE.Mesh(orbitGeo, new THREE.MeshBasicMaterial({ color: 0xb8a57a, transparent: true, opacity: 0.35 }))
    this.scene.add(orbitRing)

    this.orbitAngle = 0
    this.auto = false
    this.orbitRadius = 10
    this.tiltAngle = 23.5 * Math.PI / 180

    this.earthGroup = new THREE.Group()
    this.scene.add(this.earthGroup)

    const earthGeo = new THREE.SphereGeometry(1.2, 32, 32)
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, roughness: 0.5 })
    this.earth = new THREE.Mesh(earthGeo, earthMat)
    this.earthGroup.add(this.earth)

    const axisLen = 2.5
    const axisGeo = new THREE.CylinderGeometry(0.12, 0.12, axisLen, 8)
    const axisMat = new THREE.MeshStandardMaterial({ color: 0xff8a65 })
    const axis = new THREE.Mesh(axisGeo, axisMat)
    axis.position.y = 0
    this.earthGroup.add(axis)

    const nubGeo = new THREE.SphereGeometry(0.18, 8, 8)
    const nNorth = new THREE.Mesh(nubGeo, new THREE.MeshBasicMaterial({ color: 0xff5252 }))
    nNorth.position.y = axisLen / 2
    this.earthGroup.add(nNorth)
    const nSouth = new THREE.Mesh(nubGeo, new THREE.MeshBasicMaterial({ color: 0x448aff }))
    nSouth.position.y = -axisLen / 2
    this.earthGroup.add(nSouth)

    this.earthGroup.rotation.x = this.tiltAngle

    const markerPositions = [
      { a: 0, label: '春分 3.21', color: '#81c784' },
      { a: Math.PI / 2, label: '夏至 6.21', color: '#ef5350' },
      { a: Math.PI, label: '秋分 9.23', color: '#ffb74d' },
      { a: Math.PI * 1.5, label: '冬至 12.22', color: '#64b5f6' },
    ]
    for (const m of markerPositions) {
      const pos = new THREE.Vector3(Math.cos(m.a) * 10, 1.5, Math.sin(m.a) * 10)
      this.scene.add(this._makeLabel(m.label, pos, m.color, 24, 3))
      const dotGeo = new THREE.SphereGeometry(0.15, 8, 8)
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: m.color }))
      dot.position.copy(pos)
      this.scene.add(dot)
    }

    // Additional sprite labels
    this.scene.add(this._makeLabel('太阳', new THREE.Vector3(0, 3.5, 0), '#ffd54f', 30, 2.5))
    this._earthLabel = this._makeLabel('地球', new THREE.Vector3(10, 1.5, 0), '#42a5f5', 28, 2.5)
    this.scene.add(this._earthLabel)
    this.scene.add(this._makeLabel('地轴 23.5°', new THREE.Vector3(2, 3.0, 0), '#ff6b6b', 24, 2))
    this._northLabel = this._makeLabel('北半球', new THREE.Vector3(0.8, 2.0, 0), '#ff5252', 22, 1.8)
    this.scene.add(this._northLabel)
    this._southLabel = this._makeLabel('南半球', new THREE.Vector3(0.8, -1.6, 0), '#448aff', 22, 1.8)
    this.scene.add(this._southLabel)

    this.camera.position.set(0, 12, 18)
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
    const ep = this.earthGroup.position
    if (this._earthLabel) this._earthLabel.position.copy(ep).add(new THREE.Vector3(0, 1.5, 0))
    if (this._northLabel) this._northLabel.position.copy(ep).add(new THREE.Vector3(0, 2.2, 0))
    if (this._southLabel) this._southLabel.position.copy(ep).add(new THREE.Vector3(0, -1.8, 0))
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
.se-panel { width: 210px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.preset-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.preset-btn { flex: 1; min-width: 55px; padding: 4px 6px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.preset-btn:hover { background: var(--button-green); }
.preset-btn.active:hover { background: var(--red); }
.se-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.se-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.se-season-label { font-size: 15px; color: var(--ink); text-align: center; padding: 8px; background: rgba(158,36,38,0.06); border-radius: var(--radius-sm); }
.se-marker-list { display: flex; flex-wrap: wrap; gap: 4px; font-size: 11px; }
.se-marker-list span { padding: 2px 6px; border-radius: var(--radius-sm); background: rgba(184,165,122,0.12); color: var(--muted); }
.se-marker-list span.active { background: var(--red); color: #fff; }
.se-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.se-panel button:hover { background: var(--button-green); }
.se-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.se-canvas-wrap { flex: 1; min-height: 460px; background: #0a0a1a; position: relative; }
.lock-btn { position: absolute; top: 12px; right: 12px; z-index: 10; width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--brown); background: rgba(255,255,255,0.85); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lock-btn:hover { background: rgba(255,255,255,1); }
.se-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

.exp-desc { margin-top: 16px; padding: 14px 18px; background: var(--card-bg); border-radius: var(--radius-card); border: 1px solid var(--brown-light); }
.exp-desc h4 { font-size: 14px; color: var(--red); margin: 0 0 6px; }
.exp-desc p { font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; }

@media (max-width: 720px) {
  .se-layout { flex-direction: column; }
  .se-panel {
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
  .se-panel label { font-size: 12px; flex: 1 1 auto; min-width: 80px; }
  .se-panel input[type="range"] { flex: 2 1 auto; min-width: 100px; }
  .se-panel button { font-size: 12px; padding: 5px 8px; }
  .se-canvas-wrap { min-height: 280px; }
  .guide-text-box { width: 100%; font-size: 11px; }
  .se-hint { font-size: 10px; }
  .preset-row { width: 100%; }
  .preset-btn { font-size: 10px; padding: 4px 6px; }
  .exp-desc { padding: 10px 14px; margin-top: 12px; }
  .exp-desc h4 { font-size: 13px; }
  .exp-desc p { font-size: 13px; line-height: 1.6; }
  .lock-btn { width: 30px; height: 30px; top: 8px; right: 8px; font-size: 16px; }
}
</style>
