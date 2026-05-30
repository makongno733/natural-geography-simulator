<template>
  <div class="cor-layout">
    <aside class="cor-panel">
      <div class="cor-presets">
        <button
          v-for="p in presets"
          :key="p.name"
          :class="['preset-btn', { active: activePreset === p.name }]"
          @click="applyPreset(p)"
        >{{ p.label }}</button>
      </div>
      <label>旋转速度 <span>{{ rotationSpeed }}</span></label>
      <input type="range" min="0" max="10" v-model.number="rotationSpeed" @input="onParam" />
      <label>半球</label>
      <div class="cor-toggle">
        <button :class="{ active: hemisphere === 'north' }" @click="setHemi('north')">北半球</button>
        <button :class="{ active: hemisphere === 'south' }" @click="setHemi('south')">南半球</button>
      </div>
      <label>粒子数量 <span>{{ particleCount }}</span></label>
      <input type="range" min="30" max="150" v-model.number="particleCount" @input="onParam" />
      <button @click="reset">↺ 重置</button>
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
      <p class="cor-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="cor-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
  <div class="exp-desc">
    <h4>实验说明</h4>
    <p>本实验模拟旋转地球上流体的科里奥利力效应：旋转圆盘代表地球自转，中心冰柱模拟两极低温，红色粒子从外围向内运动时受地转偏向力作用发生偏转。切换南北半球观察偏转方向反转——北半球右偏（逆时针螺旋），南半球左偏（顺时针螺旋）。</p>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'Coriolis',
  data() {
    return {
      rotationSpeed: 5, hemisphere: 'north', particleCount: 80,
      activePreset: null,
      guideActive: false,
      guideText: '',
      _guideTexts: [
        '地转偏向力：旋转体系中运动的物体发生偏转',
        '北半球：运动物体向右偏转，形成气旋逆时针旋转',
        '南半球：运动物体向左偏转，形成气旋顺时针旋转',
        '偏转强度与旋转速度和纬度有关',
      ],
      presets: [
        { name: '北半球气旋', label: '北半球气旋', rotationSpeed: 7, hemisphere: 'north', particleCount: 100 },
        { name: '南半球气旋', label: '南半球气旋', rotationSpeed: 7, hemisphere: 'south', particleCount: 100 },
        { name: '弱旋转', label: '弱旋转', rotationSpeed: 2, hemisphere: null, particleCount: 50 },
      ],
    }
  },
  mounted() {
    this._e = new CoriolisEngine()
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    onParam() { this.activePreset = null; this._e.setParams({ rotationSpeed: this.rotationSpeed, hemisphere: this.hemisphere, particleCount: this.particleCount }) },
    applyPreset(p) {
      this.activePreset = p.name
      if (p.rotationSpeed != null) this.rotationSpeed = p.rotationSpeed
      if (p.hemisphere != null) this.hemisphere = p.hemisphere
      if (p.particleCount != null) this.particleCount = p.particleCount
      this.onParam()
      this.activePreset = p.name
    },
    setHemi(h) { this.hemisphere = h; this.onParam() },
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
    reset() { this._e.dispose(); this.$nextTick(() => { this._e = new CoriolisEngine(); this._e._onGuideChange = (text) => { this.guideText = text }; this._e.init(this.$refs.cvs) }) },
  },
}

class CoriolisEngine extends ExperimentEngine {
  setupScene() {
    const diskGeo = new THREE.CylinderGeometry(4, 4, 0.15, 48)
    const diskMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.5, emissive: 0x222222, emissiveIntensity: 0.1 })
    this.disk = new THREE.Mesh(diskGeo, diskMat)
    this.scene.add(this.disk)

    const rimGeo = new THREE.TorusGeometry(4, 0.08, 16, 64)
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xb8a57a })
    const rim = new THREE.Mesh(rimGeo, rimMat)
    rim.rotation.x = Math.PI / 2
    rim.position.y = 0.08
    this.scene.add(rim)

    const iceGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 32)
    const iceMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, emissive: 0x42a5f5, emissiveIntensity: 0.6, transparent: true, opacity: 0.95 })
    this.ice = new THREE.Mesh(iceGeo, iceMat)
    this.ice.position.y = 0.6
    this.scene.add(this.ice)

    this.hemisphere = 'north'
    this.rotationSpeed = 5
    this._particles = []
    this._spawn(80)

    this.camera.position.set(0, 8, 8)
    this.controls.target.set(0, 0.3, 0)

    this._sprites = []
    this._sprites.push(this._makeLabel('冰柱 (冷中心)', new THREE.Vector3(0, 1.6, 0), '#1a5276'))
    this._sprites.push(this._makeLabel('↻ 旋转方向', new THREE.Vector3(4.8, 0.3, 0), '#1a5276'))
    this._hemiLabel = this._makeLabel('北半球: 右偏', new THREE.Vector3(0, 2.5, 0), '#1a5276')
  }

  _makeLabel(text, position, color = '#333333', fontSize = 32) {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.font = `bold ${fontSize}px "Noto Serif SC", "Kaiti SC", serif`
    ctx.textAlign = 'center'
    ctx.fillText(text, 256, 64)
    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(mat)
    sprite.position.copy(position)
    sprite.scale.set(3, 0.75, 1)
    this.scene.add(sprite)
    return sprite
  }

  _updateHemiLabel() {
    if (this._hemiLabel) {
      this.scene.remove(this._hemiLabel)
      this._hemiLabel.material.map.dispose()
      this._hemiLabel.material.dispose()
    }
    const text = this.hemisphere === 'north' ? '北半球: 右偏' : '南半球: 左偏'
    this._hemiLabel = this._makeLabel(text, new THREE.Vector3(0, 2.5, 0), '#1a5276')
  }

  _spawn(count) {
    this._particles.forEach(p => {
      this.scene.remove(p)
      if (p.material) p.material.dispose()
      if (p.geometry) p.geometry.dispose()
    })
    this._particles = []
    const geo = new THREE.SphereGeometry(0.08, 8, 8)
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xe53935 })
      const dot = new THREE.Mesh(geo, mat)
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 1.8
      dot.position.set(Math.cos(angle) * radius, 0.15, Math.sin(angle) * radius)
      dot.userData = { angle, radius, phase: Math.random() * Math.PI * 2 }
      this.scene.add(dot)
      this._particles.push(dot)
    }
  }

  update(dt) {
    const speed = this.rotationSpeed / 5
    this.disk.rotation.y += dt * speed * 1.2
    this.ice.rotation.y += dt * speed * 1.2
    const coriolisSign = this.hemisphere === 'north' ? 1 : -1
    for (const dot of this._particles) {
      dot.userData.radius -= dt * 0.15 * speed
      if (dot.userData.radius < 0.6) dot.userData.radius = 3.5
      dot.userData.angle += dt * coriolisSign * speed * 1.8 / (dot.userData.radius + 0.3)
      dot.position.x = Math.cos(dot.userData.angle) * dot.userData.radius
      dot.position.z = Math.sin(dot.userData.angle) * dot.userData.radius
      const t = (dot.userData.radius - 0.5) / 3
      dot.material.color.setHSL(0.0 + t * 0.15, 1, 0.3 + t * 0.4)
    }
  }

  setParams({ rotationSpeed, hemisphere, particleCount }) {
    if (rotationSpeed !== undefined) this.rotationSpeed = rotationSpeed
    if (hemisphere !== undefined) {
      if (this.hemisphere !== hemisphere) { this.hemisphere = hemisphere; this._updateHemiLabel() }
    }
    if (particleCount !== undefined) this._spawn(particleCount)
  }

  dispose() {
    if (this._sprites) {
      this._sprites.forEach(s => { s.material.map.dispose(); s.material.dispose() })
    }
    if (this._hemiLabel) {
      this._hemiLabel.material.map.dispose()
      this._hemiLabel.material.dispose()
    }
    super.dispose()
  }
}
</script>

<style scoped>
.cor-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.cor-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.cor-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.cor-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.cor-toggle { display: flex; gap: 4px; }
.cor-toggle button { flex: 1; padding: 4px 0; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 12px; }
.cor-toggle button.active { background: var(--red); color: #fff; border-color: var(--red); }
.cor-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.cor-panel button:hover { background: var(--button-green); }
.preset-btn {
  padding: 3px 8px; border: 1px solid var(--brown); border-radius: 4px;
  background: var(--cream); color: var(--ink); cursor: pointer;
  font-family: inherit; font-size: 11px;
}
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.cor-presets { display: flex; gap: 4px; flex-wrap: wrap; }
.cor-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.cor-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.cor-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

.exp-desc { margin-top: 16px; padding: 14px 18px; background: var(--card-bg); border-radius: var(--radius-card); border: 1px solid var(--brown-light); }
.exp-desc h4 { font-size: 14px; color: var(--red); margin: 0 0 6px; }
.exp-desc p { font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; }

@media (max-width: 720px) {
  .cor-layout { flex-direction: column; }
  .cor-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .cor-canvas-wrap { min-height: 320px; }
}
</style>
