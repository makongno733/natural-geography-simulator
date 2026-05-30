<template>
  <div class="ec-layout">
    <aside class="ec-panel">
      <div class="preset-row">
        <button class="preset-btn" :class="{ active: activePreset === 'lunar' }" @click="setPreset('lunar')">月全食</button>
        <button class="preset-btn" :class="{ active: activePreset === 'solar' }" @click="setPreset('solar')">日全食</button>
        <button class="preset-btn" :class="{ active: activePreset === 'annular' }" @click="setPreset('annular')">日环食</button>
        <button class="preset-btn" :class="{ active: activePreset === 'auto' }" @click="setPreset('auto')">自动演示</button>
      </div>
      <label>食类型</label>
      <select v-model="eclipseType" @change="onParam">
        <option value="lunar-total">月全食</option>
        <option value="solar-total">日全食</option>
        <option value="solar-annular">日环食</option>
      </select>
      <label>对齐度 <span>{{ alignment.toFixed(0) }}%</span></label>
      <input type="range" min="0" max="100" v-model.number="alignment" @input="onParam" />
      <button @click="autoPlay">{{ auto ? '⏸ 暂停' : '▶ 自动演示' }}</button>
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
      <p class="ec-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="ec-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁旋转' : '锁定旋转'">
        {{ locked ? '🔒' : '🔓' }}
      </button>
    </div>
  </div>
  <div class="exp-desc">
    <h4>实验说明</h4>
    <p>本实验展示日月食的形成几何条件：太阳-地球-月球三者接近直线排列（朔望）时才可能发生食。月全食时地球本影投射到月球；日全食时月球本影投射到地球表面；日环食时月球距地球较远，本影锥未能到达地表，形成光环。观察本影与半影锥的几何关系。</p>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'Eclipse',
  data() { return {
    eclipseType: 'lunar-total', alignment: 100, auto: false, activePreset: 'lunar', locked: true,
    guideActive: false,
    guideText: '',
    _guideTexts: [
      '日食发生在朔日，月球位于太阳和地球之间',
      '月食发生在望日，地球位于太阳和月球之间',
      '本影区完全遮挡阳光，半影区部分遮挡阳光',
      '日环食：月球距地球较远，不能完全遮住太阳',
    ],
  } },
  mounted() {
    this._e = new EclipseEngine()
    this._e._vm = this
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => { this._e.init(this.$refs.cvs); if (this.locked) this._e.controls.enabled = false })
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    toggleLock() { this.locked = !this.locked; if (this._e?.controls) this._e.controls.enabled = !this.locked },
    onParam() { this._e.setParams({ eclipseType: this.eclipseType, alignment: this.alignment / 100 }) },
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
      if (key === 'auto') { this.autoPlay(); return }
      if (this.auto) { this.auto = false; this._e.auto = false }
      const types = { lunar: 'lunar-total', solar: 'solar-total', annular: 'solar-annular' }
      this.eclipseType = types[key]
      this.alignment = 100
      this._e.setParams({ eclipseType: this.eclipseType, alignment: 1.0 })
    },
  },
}

class EclipseEngine extends ExperimentEngine {
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

    // Sun - HUGE radius 5.0, positioned far left at x=-25
    const sunGeo = new THREE.SphereGeometry(5.0, 64, 64)
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 })
    this.sun = new THREE.Mesh(sunGeo, sunMat)
    this.sun.position.set(-25, 0, 0)
    this.scene.add(this.sun)

    // Sun corona - large transparent gold sphere
    const coronaGeo = new THREE.SphereGeometry(6.5, 32, 32)
    const coronaMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.04 })
    this._sunCorona = new THREE.Mesh(coronaGeo, coronaMat)
    this._sunCorona.position.copy(this.sun.position)
    this.scene.add(this._sunCorona)

    // Powerful point light at sun
    const sunLight = new THREE.PointLight(0xfff8e8, 250, 120)
    sunLight.position.copy(this.sun.position)
    this.scene.add(sunLight)

    // Earth - radius 2.5, at origin, blue with atmosphere glow
    const earthGeo = new THREE.SphereGeometry(2.5, 32, 32)
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x42a5f5, roughness: 0.3,
      emissive: 0x001133, emissiveIntensity: 0.3,
    })
    this.earth = new THREE.Mesh(earthGeo, earthMat)
    this.earth.position.set(0, 0, 0)
    this.scene.add(this.earth)

    // Earth atmosphere glow - transparent blue shell
    const atmoGeo = new THREE.SphereGeometry(3.0, 32, 32)
    const atmoMat = new THREE.MeshBasicMaterial({ color: 0x42a5f5, transparent: true, opacity: 0.08 })
    this._earthAtmo = new THREE.Mesh(atmoGeo, atmoMat)
    this._earthAtmo.position.copy(this.earth.position)
    this.scene.add(this._earthAtmo)

    // Moon - radius 1.0, base position at x=8 (further from Earth)
    const moonGeo = new THREE.SphereGeometry(1.0, 32, 32)
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc, roughness: 0.5,
      emissive: 0x111111, emissiveIntensity: 0.2,
    })
    this.moon = new THREE.Mesh(moonGeo, moonMat)
    this.moon.position.set(8, 0, 0)
    this.scene.add(this.moon)

    // Umbra cone - DRAMATICALLY visible, dark purple/black, high opacity
    const umbraGeo = new THREE.CylinderGeometry(0.3, 3.0, 1, 32)
    const umbraMat = new THREE.MeshBasicMaterial({
      color: 0x0a0020, transparent: true, opacity: 0.8,
    })
    this.umbraCone = new THREE.Mesh(umbraGeo, umbraMat)
    this.scene.add(this.umbraCone)

    // Penumbra cone - even bigger, dark purple, medium opacity
    const penumbraGeo = new THREE.CylinderGeometry(0.3, 4.5, 1, 32)
    const penumbraMat = new THREE.MeshBasicMaterial({
      color: 0x0a0020, transparent: true, opacity: 0.4,
    })
    this.penumbraCone = new THREE.Mesh(penumbraGeo, penumbraMat)
    this.scene.add(this.penumbraCone)

    this.eclipseType = 'lunar-total'
    this.alignment = 1.0
    this.auto = false
    this._animT = 0
    this._flashTimer = 0

    this._updateCones()

    // Sprite labels - HUGE font 52, scale 4.5
    this.scene.add(this._makeLabel('太阳', new THREE.Vector3(-25, 7.5, 0), '#ffcc00', 52, 4.5))
    this.scene.add(this._makeLabel('地球', new THREE.Vector3(0, 5, 0), '#42a5f5', 52, 4.5))
    this.scene.add(this._makeLabel('太阳光 →', new THREE.Vector3(-13, 2.5, 0), '#ffd54f', 48, 4.0))
    this._moonLabel = this._makeLabel('月球', new THREE.Vector3(8, 2.5, 0), '#ffffff', 52, 4.5)
    this.scene.add(this._moonLabel)
    this._umbraLabel = this._makeLabel('本影', new THREE.Vector3(4, 2.5, 0), '#ff4444', 48, 3.5)
    this.scene.add(this._umbraLabel)
    this._penumbraLabel = this._makeLabel('半影', new THREE.Vector3(4, 4.5, 0), '#ff8888', 48, 3.5)
    this.scene.add(this._penumbraLabel)

    // "TO SCALE" disclaimer
    this.scene.add(this._makeLabel('示意图（非真实比例）', new THREE.Vector3(0, -7, 0), '#666666', 32, 3.0))

    this.camera.position.set(0, 8, 16)
    this.controls.target.set(0, 0, 2)
  }

  _updateCones() {
    const align = this.alignment

    if (this.eclipseType === 'lunar-total') {
      // Earth casts shadow on Moon (Moon moves +X with alignment)
      this.moon.position.set(8 * align, 0, 0)

      const dist = this.moon.position.x - this.earth.position.x
      // Cone starts at Earth's surface facing the Moon
      this.umbraCone.position.copy(this.earth.position)
      this.umbraCone.position.x += 2.5
      this.umbraCone.rotation.z = 0
      this.umbraCone.scale.set(1, dist, 1)
      this.umbraCone.visible = align > 0.15

      this.penumbraCone.position.copy(this.umbraCone.position)
      this.penumbraCone.rotation.z = 0
      this.penumbraCone.scale.set(1, dist * 1.2, 1)
      this.penumbraCone.visible = align > 0.1
    } else if (this.eclipseType === 'solar-total') {
      // Moon casts shadow on Earth (Moon moves -X with alignment)
      this.moon.position.set(-8 * align, 0, 0)

      const dist = this.earth.position.x - this.moon.position.x
      // Cone starts at Moon's surface facing Earth
      this.umbraCone.position.copy(this.moon.position)
      this.umbraCone.position.x += 1.0
      this.umbraCone.rotation.z = Math.PI
      this.umbraCone.scale.set(1, dist * 0.4, 1)
      this.umbraCone.visible = align > 0.1

      this.penumbraCone.position.copy(this.umbraCone.position)
      this.penumbraCone.rotation.z = Math.PI
      this.penumbraCone.scale.set(1, dist * 0.6, 1)
      this.penumbraCone.visible = align > 0.05
    } else if (this.eclipseType === 'solar-annular') {
      this.moon.position.set(-8 * align, 0, 0)

      const dist = this.earth.position.x - this.moon.position.x
      // Umbra cone does NOT reach Earth (shorter scale)
      this.umbraCone.position.copy(this.moon.position)
      this.umbraCone.position.x += 1.0
      this.umbraCone.rotation.z = Math.PI
      this.umbraCone.scale.set(1, dist * 0.2, 1)
      this.umbraCone.visible = align > 0.3

      this.penumbraCone.position.copy(this.umbraCone.position)
      this.penumbraCone.rotation.z = Math.PI
      this.penumbraCone.scale.set(1, dist * 0.8, 1)
      this.penumbraCone.visible = align > 0.05
    }
  }

  update(dt) {
    if (this.auto) {
      this._animT += dt * 0.5
      this.alignment = 0.5 + 0.5 * Math.sin(this._animT)
      const alignPct = Math.round(this.alignment * 100)
      if (this._vm) this._vm.alignment = alignPct
      this._updateCones()
    }

    // Flash/glow effect when alignment is near perfect
    if (this.alignment > 0.99 && this.sun && this.sun.material) {
      this._flashTimer += dt
      const flash = 1.0 + 0.3 * Math.sin(this._flashTimer * 8) * Math.sin(this._flashTimer * 8)
      this.sun.material.color.setRGB(1.0 * flash, 0.85 * flash, 0.1 * flash)
      if (this._sunCorona && this._sunCorona.material) {
        this._sunCorona.material.opacity = 0.04 + 0.02 * Math.abs(Math.sin(this._flashTimer * 8))
      }
    } else if (this.sun && this.sun.material) {
      this._flashTimer = 0
      this.sun.material.color.set(0xffcc00)
      if (this._sunCorona && this._sunCorona.material) {
        this._sunCorona.material.opacity = 0.04
      }
    }

    if (this._moonLabel) {
      this._moonLabel.position.copy(this.moon.position).add(new THREE.Vector3(0, 1.8, 0))
    }
    if (this._umbraLabel) {
      this._umbraLabel.position.copy(this.umbraCone.position).add(new THREE.Vector3(0.5, 0.8, 0))
    }
    if (this._penumbraLabel) {
      this._penumbraLabel.position.copy(this.penumbraCone.position).add(new THREE.Vector3(0.5, 1.5, 0))
    }
  }

  setParams({ eclipseType, alignment }) {
    let changed = false
    if (eclipseType !== undefined && eclipseType !== this.eclipseType) {
      this.eclipseType = eclipseType
      changed = true
    }
    if (alignment !== undefined && Math.abs(alignment - this.alignment) > 0.001) {
      this.alignment = alignment
      changed = true
    }
    if (changed) this._updateCones()
  }
}
</script>

<style scoped>
.ec-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.ec-panel { width: 210px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.preset-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.preset-btn { flex: 1; min-width: 55px; padding: 4px 6px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.preset-btn:hover { background: var(--button-green); }
.preset-btn.active:hover { background: var(--red); }
.ec-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.ec-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.ec-panel select { padding: 4px 8px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); font-family: inherit; font-size: 13px; }
.ec-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.ec-panel button:hover { background: var(--button-green); }
.ec-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.ec-canvas-wrap { flex: 1; min-height: 460px; background: #000011; position: relative; }
.lock-btn { position: absolute; top: 12px; right: 12px; z-index: 10; width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--brown); background: rgba(255,255,255,0.85); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lock-btn:hover { background: rgba(255,255,255,1); }
.ec-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

.exp-desc { margin-top: 16px; padding: 14px 18px; background: var(--card-bg); border-radius: var(--radius-card); border: 1px solid var(--brown-light); }
.exp-desc h4 { font-size: 14px; color: var(--red); margin: 0 0 6px; }
.exp-desc p { font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; }

@media (max-width: 720px) {
  .ec-layout { flex-direction: column; }
  .ec-panel {
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
  .ec-panel label { font-size: 12px; flex: 1 1 auto; min-width: 80px; }
  .ec-panel input[type="range"] { flex: 2 1 auto; min-width: 100px; }
  .ec-panel button { font-size: 12px; padding: 5px 8px; }
  .ec-canvas-wrap { min-height: 280px; }
  .guide-text-box { width: 100%; font-size: 11px; }
  .ec-hint { font-size: 10px; }
  .preset-row { width: 100%; }
  .preset-btn { font-size: 10px; padding: 4px 6px; }
  .exp-desc { padding: 10px 14px; margin-top: 12px; }
  .exp-desc h4 { font-size: 13px; }
  .exp-desc p { font-size: 13px; line-height: 1.6; }
  .lock-btn { width: 30px; height: 30px; top: 8px; right: 8px; font-size: 16px; }
}
</style>
