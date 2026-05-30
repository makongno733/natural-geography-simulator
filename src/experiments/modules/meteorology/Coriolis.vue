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
      <label>漩涡强度 <span>{{ rotationSpeed }}</span></label>
      <input type="range" min="1" max="10" v-model.number="rotationSpeed" @input="onParam" />
      <label>半球</label>
      <div class="cor-toggle">
        <button :class="{ active: hemisphere === 'north' }" @click="setHemi('north')">北半球</button>
        <button :class="{ active: hemisphere === 'south' }" @click="setHemi('south')">南半球</button>
      </div>
      <label>水流密度 <span>{{ particleCount }}</span></label>
      <input type="range" min="40" max="200" step="10" v-model.number="particleCount" @input="onParam" />
      <button @click="reset">↺ 重置</button>
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
      <p class="cor-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="cor-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁旋转' : '锁定旋转'">
        {{ locked ? '🔒' : '🔓' }}
      </button>
    </div>
  </div>
  <div class="exp-desc">
    <h4>实验说明</h4>
    <p>本实验以洪水淹没陆地、水井吞水为场景，展示科里奥利力效应：洪水从四周向中心水井汇聚时，受地球自转影响（地转偏向力），水流路径发生偏转——北半球向右偏（逆时针漩涡），南半球向左偏（顺时针漩涡）。漩涡越靠近井口旋转越快，模拟气旋和洋流中科里奥利力的作用。切换半球观察偏转方向反转。</p>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'Coriolis',
  data() {
    return {
      rotationSpeed: 5, hemisphere: 'north', particleCount: 120, locked: false,
      activePreset: '北半球气旋',
      guideActive: false, guideText: '',
      _guideTexts: [
        '洪水从四周向水井汇聚，受地转偏向力形成漩涡',
        '北半球：水流向右偏转，形成逆时针漩涡（俯视）',
        '南半球：水流向左偏转，形成顺时针漩涡（俯视）',
        '越靠近井口，旋转速度越快——角动量守恒',
      ],
      presets: [
        { name: '北半球气旋', label: '🌪 北半球气旋', rotationSpeed: 7, hemisphere: 'north', particleCount: 150 },
        { name: '南半球气旋', label: '🌀 南半球气旋', rotationSpeed: 7, hemisphere: 'south', particleCount: 150 },
        { name: '弱旋转', label: '💧 弱旋转', rotationSpeed: 2, hemisphere: 'north', particleCount: 80 },
      ],
    }
  },
  mounted() {
    this._e = new CoriolisEngine()
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => {
      this._e.init(this.$refs.cvs)
      if (this.locked) this._e.controls.enabled = false
    })
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    onParam() { this.activePreset = null; this._e.setParams({ rotationSpeed: this.rotationSpeed, hemisphere: this.hemisphere, particleCount: this.particleCount }) },
    applyPreset(p) {
      this.activePreset = p.name
      this.rotationSpeed = p.rotationSpeed; this.hemisphere = p.hemisphere; this.particleCount = p.particleCount
      this._e.setParams({ rotationSpeed: this.rotationSpeed, hemisphere: this.hemisphere, particleCount: this.particleCount })
    },
    setHemi(h) { this.hemisphere = h; this.onParam() },
    toggleLock() {
      this.locked = !this.locked
      if (this._e && this._e.controls) {
        this._e.controls.enabled = !this.locked
      }
    },
    toggleGuide() {
      this.guideActive = !this.guideActive
      if (this.guideActive) { this._e.startGuidedMode(this._guideTexts); this.guideText = this._e.getGuideText() }
      else { this._e.stopGuidedMode(); this.guideText = '' }
    },
    reset() { this._e.dispose(); this.$nextTick(() => { this._e = new CoriolisEngine(); this._e._onGuideChange = (text) => { this.guideText = text }; this._e.init(this.$refs.cvs); if (this.locked) this._e.controls.enabled = false }) },
  },
}

class CoriolisEngine extends ExperimentEngine {
  setupScene() {
    this.hemisphere = 'north'
    this.rotationSpeed = 7
    this.particleCount = 150

    // === GROUND (floodplain) ===
    const groundSize = 14
    const groundSegs = 64
    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize, groundSegs, groundSegs)
    groundGeo.rotateX(-Math.PI / 2)
    // Slight terrain undulation
    const pos = groundGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i)
      const dist = Math.sqrt(x * x + y * y)
      // Gentle bowl shape toward center, slight random bumps
      let h = -0.03 * (dist / 7) + Math.sin(x * 1.5) * Math.cos(y * 1.3) * 0.06
      // Lower center near well
      if (dist < 1.5) h += (1.5 - dist) * 0.1
      pos.setZ(i, h)
    }
    groundGeo.computeVertexNormals()
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x8bc34a, roughness: 0.8 })
    this.ground = new THREE.Mesh(groundGeo, groundMat)
    this.ground.receiveShadow = true
    this.scene.add(this.ground)

    // Dirt path variations - darker patches
    for (let i = 0; i < 6; i++) {
      const patchGeo = new THREE.CircleGeometry(0.5 + Math.random() * 1.2, 12)
      patchGeo.rotateX(-Math.PI / 2)
      const patchMat = new THREE.MeshStandardMaterial({ color: 0xa08060, roughness: 0.9 })
      const patch = new THREE.Mesh(patchGeo, patchMat)
      const a = Math.random() * Math.PI * 2
      const r = 2.5 + Math.random() * 4
      patch.position.set(Math.cos(a) * r, 0.02, Math.sin(a) * r)
      this.scene.add(patch)
    }

    // === WATER FLOOD SURFACE (semi-transparent plane) ===
    const waterGeo = new THREE.PlaneGeometry(groundSize, groundSize)
    waterGeo.rotateX(-Math.PI / 2)
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.3 })
    this.waterPlane = new THREE.Mesh(waterGeo, waterMat)
    this.waterPlane.position.y = 0.04
    this.scene.add(this.waterPlane)

    // === CENTRAL WELL ===
    this._wellGroup = new THREE.Group()
    // Well rim (stone ring above ground)
    const rimGeo = new THREE.TorusGeometry(0.55, 0.12, 12, 32)
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.6, metalness: 0.1 })
    const rim = new THREE.Mesh(rimGeo, stoneMat)
    rim.rotation.x = Math.PI / 2
    rim.position.y = 0.22
    this._wellGroup.add(rim)
    // Well shaft (cylinder going down)
    const shaftGeo = new THREE.CylinderGeometry(0.4, 0.42, 1.8, 24, 1, true)
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.5, side: THREE.DoubleSide })
    const shaft = new THREE.Mesh(shaftGeo, shaftMat)
    shaft.position.y = -0.7
    this._wellGroup.add(shaft)
    // Dark water inside well
    const wellWaterGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.15, 24)
    const wellWaterMat = new THREE.MeshStandardMaterial({ color: 0x1a3a5c, roughness: 0.1, emissive: 0x0a1a2a, emissiveIntensity: 0.3 })
    this._wellWater = new THREE.Mesh(wellWaterGeo, wellWaterMat)
    this._wellWater.position.y = -0.35
    this._wellGroup.add(this._wellWater)
    this.scene.add(this._wellGroup)

    // === BUILDINGS (small houses) ===
    this._buildings = []
    for (let i = 0; i < 5; i++) {
      const house = this._makeHouse()
      const a = Math.random() * Math.PI * 2
      const r = 4 + Math.random() * 2.5
      house.position.set(Math.cos(a) * r, 0.05, Math.sin(a) * r)
      house.rotation.y = Math.random() * Math.PI * 2
      this.scene.add(house)
      this._buildings.push(house)
    }

    // === TREES ===
    for (let i = 0; i < 20; i++) {
      const tree = this._makeTree()
      const a = Math.random() * Math.PI * 2
      const r = 2 + Math.random() * 5.5
      tree.position.set(Math.cos(a) * r, 0.05, Math.sin(a) * r)
      this.scene.add(tree)
      this._buildings.push(tree)
    }

    // === FLOW ARROWS (spiral indicators) ===
    this._flowArrows = []
    for (let i = 0; i < 6; i++) {
      const arrow = this._makeFlowArrow()
      this.scene.add(arrow)
      this._flowArrows.push(arrow)
    }

    // === WATER PARTICLES ===
    this._particles = []
    this._createArrows()

    // === LABELS ===
    this._sprites = []
    this._sprites.push(this._makeLabel('水井', new THREE.Vector3(0, 0.8, 0.8), '#37474f', 30))
    this._sprites.push(this._makeLabel('洪水', new THREE.Vector3(5.5, 0.4, 5.5), '#1565c0', 28))
    this._sprites.push(this._makeLabel('洪水', new THREE.Vector3(-5.5, 0.4, -5.5), '#1565c0', 28))
    this._hemiSprite = this._makeLabel('北半球：逆时针漩涡 ↺', new THREE.Vector3(0, 2.0, -5), '#c0392b', 28)

    // Camera
    this.camera.position.set(5, 10, 9)
    this.controls.target.set(0, 0, 0)
    this.controls.maxPolarAngle = Math.PI / 2.2
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

  _makeHouse() {
    const g = new THREE.Group()
    // Walls
    const bodyGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xefebe9, roughness: 0.7 })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = 0.25
    g.add(body)
    // Roof
    const roofGeo = new THREE.ConeGeometry(0.3, 0.25, 4)
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.6 })
    const roof = new THREE.Mesh(roofGeo, roofMat)
    roof.position.y = 0.48
    roof.rotation.y = Math.PI / 4
    g.add(roof)
    return g
  }

  _makeTree() {
    const g = new THREE.Group()
    const trunkGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.4, 6)
    const trunk = new THREE.Mesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.8 }))
    trunk.position.y = 0.18
    g.add(trunk)
    const crownGeo = new THREE.ConeGeometry(0.2, 0.45, 7)
    const crown = new THREE.Mesh(crownGeo, new THREE.MeshStandardMaterial({ color: 0x4caf50 + Math.floor(Math.random() * 3) * 0x010000, roughness: 0.5 }))
    crown.position.y = 0.5
    g.add(crown)
    return g
  }

  _makeFlowArrow() {
    const g = new THREE.Group()
    const shaftGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6)
    const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0x1565c0, emissive: 0x1565c0, emissiveIntensity: 0.4 }))
    shaft.position.y = 0.15
    g.add(shaft)
    const headGeo = new THREE.ConeGeometry(0.14, 0.28, 6)
    const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: 0x1565c0, emissive: 0x1565c0, emissiveIntensity: 0.5 }))
    head.position.y = 0.5
    g.add(head)
    g.userData = { angle: Math.random() * Math.PI * 2, radius: 4 + Math.random() * 2 }
    return g
  }

  _createArrows() {
    // Dispose old arrows
    this._particles.forEach(a => {
      a.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose() })
      this.scene.remove(a)
    })
    this._particles = []

    for (let i = 0; i < this.particleCount; i++) {
      const group = new THREE.Group()
      // shaft
      const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6)
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, emissive: 0x1565c0, emissiveIntensity: 0.3, roughness: 0.3 })
      group.add(new THREE.Mesh(shaftGeo, shaftMat))
      // head
      const headGeo = new THREE.ConeGeometry(0.08, 0.14, 6)
      const headMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, emissive: 0x1565c0, emissiveIntensity: 0.5, roughness: 0.2 })
      const head = new THREE.Mesh(headGeo, headMat)
      head.position.y = 0.18
      group.add(head)

      const angle = Math.random() * Math.PI * 2
      const radius = 2.0 + Math.random() * 5.0
      group.position.set(Math.cos(angle) * radius, 0.07 + Math.random() * 0.05, Math.sin(angle) * radius)
      group.userData = { angle, radius, speed: 0.3 + Math.random() * 0.7 }
      this.scene.add(group)
      this._particles.push(group)
    }
  }

  update(dt) {
    const speed = this.rotationSpeed / 5
    const coriolisSign = this.hemisphere === 'north' ? 1 : -1

    // Animate flow arrows (orbit around well)
    for (const arrow of this._flowArrows) {
      arrow.userData.angle += dt * coriolisSign * speed * 0.6 / (arrow.userData.radius + 0.2)
      const a = arrow.userData.angle
      const r = arrow.userData.radius
      arrow.position.set(Math.cos(a) * r, 0.15, Math.sin(a) * r)
      // Arrow points tangent to the circle
      const tangent = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a))
      if (coriolisSign < 0) tangent.negate()
      arrow.lookAt(arrow.position.clone().add(tangent))
      // Color gradient - darker blue closer to center
    }

    // Animate water arrows flowing toward well with Coriolis deflection
    for (const arrow of this._particles) {
      arrow.userData.radius -= dt * 0.25 * speed * arrow.userData.speed
      if (arrow.userData.radius < 0.55) {
        arrow.userData.radius = 4.5 + Math.random() * 2.5
        arrow.userData.angle = Math.random() * Math.PI * 2
      }
      // Coriolis deflection
      const deflection = coriolisSign * speed * 0.9 / (arrow.userData.radius + 0.3)
      arrow.userData.angle += dt * deflection
      arrow.position.x = Math.cos(arrow.userData.angle) * arrow.userData.radius
      arrow.position.z = Math.sin(arrow.userData.angle) * arrow.userData.radius
      arrow.position.y = 0.07 + (1 / (arrow.userData.radius + 0.5)) * 0.03

      // Point arrow in the flow direction (tangent to spiral)
      const tangent = new THREE.Vector3(-Math.sin(arrow.userData.angle), 0, Math.cos(arrow.userData.angle))
      if (coriolisSign < 0) tangent.negate()
      // Slight inward component
      tangent.add(new THREE.Vector3(-Math.cos(arrow.userData.angle) * 0.3, 0, -Math.sin(arrow.userData.angle) * 0.3))
      tangent.normalize()
      // Make arrow look in the tangent direction
      const up = new THREE.Vector3(0, 1, 0)
      const quat = new THREE.Quaternion()
      quat.setFromUnitVectors(up, tangent)
      arrow.setRotationFromQuaternion(quat)

      // Color gets darker near center
      const t = Math.max(0, (arrow.userData.radius - 0.5) / 6)
      arrow.children.forEach(c => {
        if (c.material && c.material.color) {
          c.material.color.setHSL(0.58, 0.9, 0.3 + t * 0.4)
        }
      })
    }

    // Pulse well water
    this._wellWater.material.emissiveIntensity = 0.2 + Math.sin(this.clock ? this.clock.elapsed * 3 : 0) * 0.15

    // Water plane subtle animation
    this.waterPlane.material.opacity = 0.25 + Math.sin(Date.now() * 0.001) * 0.05
  }

  setParams({ rotationSpeed, hemisphere, particleCount }) {
    if (rotationSpeed !== undefined) this.rotationSpeed = rotationSpeed
    if (hemisphere !== undefined && this.hemisphere !== hemisphere) {
      this.hemisphere = hemisphere
      this._updateHemiLabel()
    }
    if (particleCount !== undefined) { this.particleCount = particleCount; this._createArrows() }
  }

  _updateHemiLabel() {
    if (this._hemiSprite) {
      this.scene.remove(this._hemiSprite)
      this._hemiSprite.material.map.dispose()
      this._hemiSprite.material.dispose()
    }
    const text = this.hemisphere === 'north' ? '北半球：逆时针漩涡 ↺' : '南半球：顺时针漩涡 ↻'
    this._hemiSprite = this._makeLabel(text, new THREE.Vector3(0, 2.0, -5), '#c0392b', 28)
  }

  dispose() {
    if (this._sprites) {
      this._sprites.forEach(s => { if (s.material.map) s.material.map.dispose(); s.material.dispose() })
    }
    if (this._hemiSprite) {
      if (this._hemiSprite.material.map) this._hemiSprite.material.map.dispose()
      this._hemiSprite.material.dispose()
    }
    if (this._flowArrows) {
      this._flowArrows.forEach(a => a.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose() }))
    }
    if (this._buildings) {
      this._buildings.forEach(b => b.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose() }))
    }
    if (this._particles) {
      this._particles.forEach(a => a.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose() }))
    }
    if (this._wellGroup) {
      this._wellGroup.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose() })
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
.preset-btn { padding: 3px 8px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.cor-presets { display: flex; gap: 4px; flex-wrap: wrap; }
.cor-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.cor-canvas-wrap { flex: 1; min-height: 460px; background: #e8f5e9; position: relative; }
.cor-canvas-wrap canvas { width: 100%; height: 100%; display: block; }
.lock-btn {
  position: absolute; top: 12px; right: 12px; z-index: 10;
  width: 36px; height: 36px; border-radius: 8px;
  border: 1px solid var(--brown); background: rgba(255,255,255,0.85);
  font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.lock-btn:hover { background: rgba(255,255,255,1); }

.exp-desc { margin-top: 16px; padding: 14px 18px; background: var(--card-bg); border-radius: var(--radius-card); border: 1px solid var(--brown-light); }
.exp-desc h4 { font-size: 14px; color: var(--red); margin: 0 0 6px; }
.exp-desc p { font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; }

@media (max-width: 720px) {
  .cor-layout { flex-direction: column; }
  .cor-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .cor-canvas-wrap { min-height: 320px; }
}
</style>
