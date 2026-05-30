<template>
  <div class="tc-layout">
    <aside class="tc-panel">
      <div class="tc-presets">
        <button
          v-for="p in presets"
          :key="p.name"
          :class="['preset-btn', { active: activePreset === p.name }]"
          @click="applyPreset(p)"
        >{{ p.label }}</button>
      </div>
      <label>热源温差 <span>{{ tempDiff }}</span></label>
      <input type="range" min="1" max="10" v-model.number="tempDiff" @input="onParam" />
      <label>箭头密度 <span>{{ arrowDensity }}</span></label>
      <input type="range" min="1" max="5" step="1" v-model.number="arrowDensity" @input="onParam" />
      <button @click="togglePause">{{ paused ? '▶ 播放' : '⏸ 暂停' }}</button>
      <button @click="reset">↺ 重置</button>
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
      <p class="tc-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="tc-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
  <div class="exp-desc">
    <h4>实验说明</h4>
    <p>本实验展示热力环流的形成机制。海陆风模式：白天陆地升温快（热源），海洋升温慢（冷源），陆地空气上升→高空流向海洋→海洋上空下沉→近地面从海洋吹向陆地。山谷风模式：白天山峰升温快（热源），山谷升温慢（冷源），谷风沿坡上升→高空流向山谷→山谷下沉→近地面从山谷吹向山峰。3D 箭头颜色和方向展示气流运动，暖色=上升，冷色=下沉。</p>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'ThermalCirculation',
  data() {
    return {
      tempDiff: 7, arrowDensity: 4, paused: false,
      activePreset: '海陆风',
      guideActive: false,
      guideText: '',
      _guideTexts: [
        '热力环流：冷热不均导致气压差，驱动大气运动',
        '观察热源上方空气受热上升、向冷源方向流动',
        '观察冷源上方空气冷却下沉、向热源方向流动',
        '高空与近地面气流方向相反，形成闭合环流',
      ],
      presets: [
        { name: '海陆风', label: '🌊 海陆风', tempDiff: 7, arrowDensity: 4 },
        { name: '山谷风', label: '⛰ 山谷风', tempDiff: 5, arrowDensity: 3 },
      ],
    }
  },
  mounted() {
    this._e = new ThermalCirculationEngine()
    this._e.tempDiff = this.tempDiff
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() {
    this._e?.dispose()
    window.removeEventListener('resize', this._onResize)
  },
  methods: {
    _onResize() { this._e?.resize() },
    togglePause() { this.paused = !this.paused; this._e.paused = this.paused },
    onParam() { this.activePreset = null; this._e.setParams({ tempDiff: this.tempDiff, arrowDensity: this.arrowDensity }) },
    applyPreset(p) {
      this.activePreset = p.name
      this.tempDiff = p.tempDiff
      this.arrowDensity = p.arrowDensity
      this._e.setParams({ tempDiff: this.tempDiff, arrowDensity: this.arrowDensity, sceneMode: p.name })
    },
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
    reset() {
      this._e.dispose()
      this.$nextTick(() => {
        this._e = new ThermalCirculationEngine()
        this._e.tempDiff = this.tempDiff
        this._e._onGuideChange = (text) => { this.guideText = text }
        this._e.init(this.$refs.cvs)
      })
    },
  },
}

class ThermalCirculationEngine extends ExperimentEngine {
  setupScene() {
    this.tempDiff = 7
    this.arrowDensity = 4
    this.paused = false
    this.sceneMode = '海陆风'

    // Transparent box frame
    const boxGeo = new THREE.BoxGeometry(8, 4, 4)
    const boxEdges = new THREE.EdgesGeometry(boxGeo)
    const boxLine = new THREE.LineSegments(boxEdges, new THREE.LineBasicMaterial({ color: 0x8f7652, transparent: true, opacity: 0.55 }))
    this.scene.add(boxLine)

    // === TERRAIN GROUP (switched by scene mode) ===
    this._terrainGroup = new THREE.Group()
    this.scene.add(this._terrainGroup)

    // -- Sea/Land terrain (海陆风) --
    this._seaGroup = new THREE.Group()
    // Ocean surface: flat blue plane on right (cold) side
    const oceanGeo = new THREE.PlaneGeometry(4, 4)
    const oceanMat = new THREE.MeshStandardMaterial({ color: 0x2196f3, roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.85 })
    this._oceanPlane = new THREE.Mesh(oceanGeo, oceanMat)
    this._oceanPlane.rotation.x = -Math.PI / 2
    this._oceanPlane.position.set(2, -2.28, 0)
    this._seaGroup.add(this._oceanPlane)
    // Land: brown/green on left (hot) side
    const landGeo = new THREE.PlaneGeometry(4, 4)
    const landMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.8 })
    const landPlane = new THREE.Mesh(landGeo, landMat)
    landPlane.rotation.x = -Math.PI / 2
    landPlane.position.set(-2, -2.27, 0)
    this._seaGroup.add(landPlane)
    // Small trees on land
    for (let i = 0; i < 12; i++) {
      const tree = this._makeTree()
      tree.position.set(-3.5 + Math.random() * 3, -2.1, (Math.random() - 0.5) * 3)
      this._seaGroup.add(tree)
    }
    this._terrainGroup.add(this._seaGroup)

    // -- Mountain/Valley terrain (山谷风) --
    this._valleyGroup = new THREE.Group()
    this._valleyGroup.visible = false
    // Mountain peak (left/hot side) - tall triangle
    const peakShape = new THREE.Shape()
    peakShape.moveTo(-1.5, 0); peakShape.lineTo(0, 2.2); peakShape.lineTo(1.5, 0); peakShape.closePath()
    const peakGeo = new THREE.ExtrudeGeometry(peakShape, { depth: 3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 })
    const peakMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.7 })
    const peak = new THREE.Mesh(peakGeo, peakMat)
    peak.position.set(-3.8, -2.3, -1.5)
    this._valleyGroup.add(peak)
    // Snow cap
    const snowGeo = new THREE.ConeGeometry(0.5, 0.7, 8)
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, emissive: 0xffffff, emissiveIntensity: 0.2 })
    const snow = new THREE.Mesh(snowGeo, snowMat)
    snow.position.set(-3.8, 0.2, 0)
    this._valleyGroup.add(snow)
    // Valley floor (right/cold side) - flat green
    const valleyFloorGeo = new THREE.PlaneGeometry(4, 4)
    const valleyFloorMat = new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 0.7 })
    const valleyFloor = new THREE.Mesh(valleyFloorGeo, valleyFloorMat)
    valleyFloor.rotation.x = -Math.PI / 2
    valleyFloor.position.set(2, -2.27, 0)
    this._valleyGroup.add(valleyFloor)
    // Small hills on right
    for (let i = 0; i < 3; i++) {
      const hillGeo = new THREE.SphereGeometry(0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 3)
      const hill = new THREE.Mesh(hillGeo, new THREE.MeshStandardMaterial({ color: 0x8bc34a, roughness: 0.6 }))
      hill.position.set(2.5 + i * 0.8, -2.1, (i - 1) * 1.2)
      this._valleyGroup.add(hill)
    }
    this._terrainGroup.add(this._valleyGroup)

    // Hot plate (red, glowing)
    const hotGeo = new THREE.BoxGeometry(0.8, 0.3, 3.2)
    this.hotMat = new THREE.MeshStandardMaterial({ color: 0xe53935, emissive: 0xff3d00, emissiveIntensity: 0.8, roughness: 0.3 })
    this.hotPlate = new THREE.Mesh(hotGeo, this.hotMat)
    this.hotPlate.position.set(-3.8, -2.1, 0)
    this.scene.add(this.hotPlate)

    // Hot glow ring
    const glowGeo = new THREE.TorusGeometry(0.55, 0.06, 8, 24)
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff6e40, transparent: true, opacity: 0.5 })
    this.hotGlow = new THREE.Mesh(glowGeo, glowMat)
    this.hotGlow.position.copy(this.hotPlate.position)
    this.hotGlow.position.y += 0.15
    this.scene.add(this.hotGlow)

    // Cold plate (blue)
    const coldGeo = new THREE.BoxGeometry(0.8, 0.3, 3.2)
    this.coldMat = new THREE.MeshStandardMaterial({ color: 0x1e88e5, emissive: 0x1565c0, emissiveIntensity: 0.6, roughness: 0.3 })
    this.coldPlate = new THREE.Mesh(coldGeo, this.coldMat)
    this.coldPlate.position.set(3.8, -2.1, 0)
    this.scene.add(this.coldPlate)

    // Cold glow ring
    const coldGlowGeo = new THREE.TorusGeometry(0.55, 0.06, 8, 24)
    const coldGlowMat = new THREE.MeshBasicMaterial({ color: 0x448aff, transparent: true, opacity: 0.4 })
    this.coldGlow = new THREE.Mesh(coldGlowGeo, coldGlowMat)
    this.coldGlow.position.copy(this.coldPlate.position)
    this.coldGlow.position.y += 0.15
    this.scene.add(this.coldGlow)

    // Translucent columns
    const riseGeo = new THREE.CylinderGeometry(0.5, 0.6, 3.2, 16, 1, true)
    const riseMat = new THREE.MeshBasicMaterial({ color: 0xff6e40, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
    this.riseColumn = new THREE.Mesh(riseGeo, riseMat)
    this.riseColumn.position.set(-3.8, -0.3, 0)
    this.scene.add(this.riseColumn)

    const sinkGeo = new THREE.CylinderGeometry(0.5, 0.6, 3.2, 16, 1, true)
    const sinkMat = new THREE.MeshBasicMaterial({ color: 0x448aff, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
    this.sinkColumn = new THREE.Mesh(sinkGeo, sinkMat)
    this.sinkColumn.position.set(3.8, -0.3, 0)
    this.scene.add(this.sinkColumn)

    // Sprite labels
    this._sprites = []
    this._sprites.push(this._makeLabel('陆地 🔥', new THREE.Vector3(-3.8, -0.5, 2.2), '#c0392b', 36))
    this._sprites.push(this._makeLabel('海洋 🧊', new THREE.Vector3(3.8, -0.5, 2.2), '#2471a3', 36))
    this._sprites.push(this._makeLabel('上升气流', new THREE.Vector3(-2.6, 0.8, 2.2), '#ff6e40', 28))
    this._sprites.push(this._makeLabel('下沉气流', new THREE.Vector3(2.6, 0.8, 2.2), '#448aff', 28))
    this._sprites.push(this._makeLabel('高空：陆地 → 海洋', new THREE.Vector3(0, 2.1, 2.2), '#e67e22', 24))
    this._sprites.push(this._makeLabel('地面：海洋 → 陆地（海风）', new THREE.Vector3(0, -2.3, 2.2), '#2196f3', 24))
    this._hotLabel = this._sprites[0]
    this._coldLabel = this._sprites[1]

    // Pressure display sprites (4 corners)
    this._pressureSprites = []
    // Hot side ground (低压) - left bottom, on back face z=2.2
    this._pressureSprites.push(this._makePressureLabel('1010 hPa', new THREE.Vector3(-3.8, -2.4, 2.2), '#e53935'))
    // Hot side high (高压) - left top
    this._pressureSprites.push(this._makePressureLabel('1016 hPa', new THREE.Vector3(-3.8, 2.2, 2.2), '#e53935'))
    // Cold side ground (高压) - right bottom
    this._pressureSprites.push(this._makePressureLabel('1014 hPa', new THREE.Vector3(3.8, -2.4, 2.2), '#1e88e5'))
    // Cold side high (低压) - right top
    this._pressureSprites.push(this._makePressureLabel('1011 hPa', new THREE.Vector3(3.8, 2.2, 2.2), '#1e88e5'))
    // Store references for update
    this._pHotLow = this._pressureSprites[0]
    this._pHotHigh = this._pressureSprites[1]
    this._pColdLow = this._pressureSprites[2]
    this._pColdHigh = this._pressureSprites[3]

    // 3D arrows
    this._arrows = []
    this._createArrows()

    // Camera: 35° overhead angle
    const angle = THREE.MathUtils.degToRad(35)
    const dist = 11
    this.camera.position.set(0, dist * Math.sin(angle), dist * Math.cos(angle))
    this.controls.target.set(0, 0, 0)

    // Initialize pressure display
    this._updatePressureLabels()
  }

  _makeTree() {
    const g = new THREE.Group()
    const trunkGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.35, 6)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.8 })
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.y = 0.1
    g.add(trunk)
    const crownGeo = new THREE.ConeGeometry(0.15, 0.35, 6)
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.5 })
    const crown = new THREE.Mesh(crownGeo, crownMat)
    crown.position.y = 0.35
    g.add(crown)
    return g
  }

  _updateTerrain() {
    const isSeaBreeze = this.sceneMode === '海陆风'
    this._seaGroup.visible = isSeaBreeze
    this._valleyGroup.visible = !isSeaBreeze

    // Update label textures
    const hotText = isSeaBreeze ? '陆地 🔥' : '山峰 🔥'
    const coldText = isSeaBreeze ? '海洋 🧊' : '山谷 🧊'
    this._updateSpriteText(this._hotLabel, hotText, '#c0392b')
    this._updateSpriteText(this._coldLabel, coldText, '#2471a3')
    // Update flow labels
    if (isSeaBreeze) {
      this._updateSpriteText(this._sprites[4], '高空：陆地 → 海洋', '#e67e22')
      this._updateSpriteText(this._sprites[5], '地面：海洋 → 陆地（海风）', '#2196f3')
    } else {
      this._updateSpriteText(this._sprites[4], '高空：山峰 → 山谷', '#e67e22')
      this._updateSpriteText(this._sprites[5], '地面：山谷 → 山峰（谷风）', '#2196f3')
    }
  }

  _updateSpriteText(sprite, text, color) {
    if (!sprite || !sprite.material || !sprite.material.map) return
    sprite.material.map.dispose()
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.font = 'bold 36px "Noto Serif SC", "Kaiti SC", serif'
    ctx.textAlign = 'center'
    ctx.fillText(text, 256, 64)
    sprite.material.map = new THREE.CanvasTexture(canvas)
    sprite.material.map.minFilter = THREE.LinearFilter
    sprite.material.needsUpdate = true
  }

  _makePressureLabel(text, position, color) {
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 80
    const ctx = canvas.getContext('2d')
    // Background pill
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.fillRect(10, 8, 236, 64)
    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    ctx.strokeRect(10, 8, 236, 64)
    // Text
    ctx.fillStyle = color
    ctx.font = 'bold 26px "Noto Serif SC", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(text, 128, 50)
    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(mat)
    sprite.position.copy(position)
    sprite.scale.set(2.4, 0.75, 1)
    this.scene.add(sprite)
    return sprite
  }

  _updatePressureLabels() {
    if (!this._pressureSprites) return
    const diff = this.tempDiff / 5 // 0.2 - 2
    const base = 1013
    // Hot side: surface heats → low pressure; aloft accumulates → high pressure
    const hotLow = Math.round(base - diff * 4)
    const hotHigh = Math.round(base + diff * 3)
    // Cold side: surface cools → high pressure; aloft drains → low pressure
    const coldLow = Math.round(base + diff * 2)
    const coldHigh = Math.round(base - diff * 2)
    this._updateSpriteText(this._pHotLow, `${hotLow} hPa`, '#e53935')
    this._updateSpriteText(this._pHotHigh, `${hotHigh} hPa`, '#e53935')
    this._updateSpriteText(this._pColdLow, `${coldLow} hPa`, '#1e88e5')
    this._updateSpriteText(this._pColdHigh, `${coldHigh} hPa`, '#1e88e5')
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

  _createArrow(color) {
    const group = new THREE.Group()

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8)
    const shaftMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4, roughness: 0.3, metalness: 0.3 })
    const shaft = new THREE.Mesh(shaftGeo, shaftMat)
    shaft.position.y = 0.15
    group.add(shaft)

    // Head
    const headGeo = new THREE.ConeGeometry(0.16, 0.3, 8)
    const headMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.3 })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 0.52
    group.add(head)

    return group
  }

  _createArrows() {
    // Dispose old arrows
    this._arrows.forEach(a => {
      a.traverse(c => {
        if (c.geometry) c.geometry.dispose()
        if (c.material) c.material.dispose()
      })
      this.scene.remove(a)
    })
    this._arrows = []

    const den = this.arrowDensity
    const perRow = den + 2
    const perRise = den + 3
    // Extra arrows for surface flow (sea breeze) — this is the key visible process
    const perSurface = den + 5

    for (let zIdx = 0; zIdx < perRow; zIdx++) {
      const z = (zIdx - (perRow - 1) / 2) * 1.1

      // Segment 0: Rising over hot source (陆地上空上升)
      for (let i = 0; i < perRise; i++) {
        const t = (i + 0.5) / perRise
        const arrow = this._createArrow(0xff5722)
        arrow.position.set(-3.8, -1.8 + t * 3.4, z)
        arrow.userData = { segment: 0, z, phase: t, speed: 0.1 + Math.random() * 0.05 }
        this.scene.add(arrow)
        this._arrows.push(arrow)
      }

      // Segment 1: High-altitude flow 陆地→海洋 (hot→cold, left→right)
      for (let i = 0; i < perRise; i++) {
        const t = (i + 0.5) / perRise
        const arrow = this._createArrow(0xe67e22)
        arrow.rotation.z = -Math.PI / 2
        arrow.position.set(-3.8 + t * 7.6, 1.6, z)
        arrow.userData = { segment: 1, z, phase: t, speed: 0.12 + Math.random() * 0.06 }
        this.scene.add(arrow)
        this._arrows.push(arrow)
      }

      // Segment 2: Sinking over cold source (海洋上空下沉)
      for (let i = 0; i < perRise; i++) {
        const t = (i + 0.5) / perRise
        const arrow = this._createArrow(0x1976d2)
        arrow.rotation.z = Math.PI
        arrow.position.set(3.8, 1.6 - t * 3.4, z)
        arrow.userData = { segment: 2, z, phase: t, speed: 0.1 + Math.random() * 0.05 }
        this.scene.add(arrow)
        this._arrows.push(arrow)
      }

      // Segment 3: Surface sea breeze 海洋→陆地 (cold→hot, right→left) — MAIN EVENT
      for (let i = 0; i < perSurface; i++) {
        const t = (i + 0.5) / perSurface
        // Brighter blue for the sea breeze — this is what students need to see
        const arrow = this._createArrow(0x2196f3)
        arrow.rotation.z = Math.PI / 2
        arrow.position.set(3.8 - t * 7.6, -1.82, z)
        arrow.userData = { segment: 3, z, phase: t, speed: 0.18 + Math.random() * 0.1 }
        // Make surface arrows slightly bigger
        arrow.scale.setScalar(1.25)
        this.scene.add(arrow)
        this._arrows.push(arrow)
      }
    }
  }

  update(dt) {
    if (this.paused) return
    const diff = this.tempDiff / 5 // 0.2 - 2
    const speed = diff * 3.5
    this._flowTime = (this._flowTime || 0) + dt * speed

    // Update hot/cold plate glow
    this.hotMat.emissiveIntensity = 0.3 + diff * 1.0
    this.coldMat.emissiveIntensity = 0.1 + diff * 0.7
    this.hotGlow.material.opacity = 0.2 + diff * 0.5
    this.coldGlow.material.opacity = 0.1 + diff * 0.4
    this.riseColumn.material.opacity = 0.03 + diff * 0.08
    this.sinkColumn.material.opacity = 0.03 + diff * 0.08

    // Update pressure labels (throttle to every ~0.5s)
    if (this._lastPressureUpdate === undefined) this._lastPressureUpdate = 0
    this._lastPressureUpdate += dt
    if (this._lastPressureUpdate > 0.5) {
      this._lastPressureUpdate = 0
      this._updatePressureLabels()
    }

    // Animate arrows along their segments
    // The convection loop: segment 0 (rise) → 1 (top) → 2 (sink) → 3 (bottom) → 0
    for (const arrow of this._arrows) {
      arrow.userData.phase += dt * arrow.userData.speed * speed
      if (arrow.userData.phase >= 1.0) arrow.userData.phase -= 1.0

      const t = arrow.userData.phase
      const z = arrow.userData.z
      const seg = arrow.userData.segment

      if (seg === 0) {
        // Rise: x=-3.8, y from -1.8→1.6
        arrow.position.set(-3.8, -1.8 + t * 3.4, z + Math.sin(t * Math.PI) * 0.15)
        arrow.rotation.set(0, 0, 0)
        // Color from warm to hot as it rises
        const h = 0.08 + (1 - t) * 0.05
        this._setArrowColor(arrow, h, 0.9, 0.35 + t * 0.35)
      } else if (seg === 1) {
        // Top flow: y=1.6, x from -3.8→3.8
        arrow.position.set(-3.8 + t * 7.6, 1.6 + Math.sin(t * Math.PI) * 0.1, z)
        arrow.rotation.set(0, 0, -Math.PI / 2)
        // Cooling as it moves right
        const h = 0.13 - t * 0.1
        this._setArrowColor(arrow, h, 0.85, 0.35 + (1 - t) * 0.3)
      } else if (seg === 2) {
        // Sink: x=3.8, y from 1.6→-1.8
        arrow.position.set(3.8, 1.6 - t * 3.4, z + Math.sin(t * Math.PI) * 0.15)
        arrow.rotation.set(0, 0, Math.PI)
        // Cooling further
        const h = 0.55 + t * 0.08
        this._setArrowColor(arrow, h, 0.8, 0.25 + (1 - t) * 0.35)
      } else {
        // Bottom flow: y=-1.8, x from 3.8→-3.8
        arrow.position.set(3.8 - t * 7.6, -1.8 + Math.sin(t * Math.PI) * 0.1, z)
        arrow.rotation.set(0, 0, Math.PI / 2)
        // Warming as it approaches hot side
        const h = 0.55 + (1 - t) * 0.05
        this._setArrowColor(arrow, h, 0.75, 0.3 + t * 0.35)
      }

      // Pulse scale for flowing effect
      const pulse = 1 + Math.sin(this._flowTime * 3 + arrow.userData.phase * 10) * 0.15
      arrow.scale.setScalar(pulse)
    }
  }

  _setArrowColor(arrow, hue, saturation, lightness) {
    const color = new THREE.Color()
    color.setHSL(hue % 1, saturation, lightness)
    arrow.children.forEach(c => {
      if (c.material && c.material.emissive) {
        c.material.color.copy(color)
        c.material.emissive.copy(color)
      }
    })
  }

  setParams({ tempDiff, arrowDensity, sceneMode }) {
    if (tempDiff !== undefined) this.tempDiff = tempDiff
    if (arrowDensity !== undefined) {
      this.arrowDensity = arrowDensity
      this._createArrows()
    }
    if (sceneMode !== undefined && sceneMode !== this.sceneMode) {
      this.sceneMode = sceneMode
      this._updateTerrain()
    }
  }

  dispose() {
    if (this._sprites) {
      this._sprites.forEach(s => { if (s.material.map) s.material.map.dispose(); s.material.dispose() })
    }
    if (this._pressureSprites) {
      this._pressureSprites.forEach(s => { if (s.material.map) s.material.map.dispose(); s.material.dispose() })
    }
    if (this._arrows) {
      this._arrows.forEach(a => {
        a.traverse(c => {
          if (c.geometry) c.geometry.dispose()
          if (c.material) c.material.dispose()
        })
      })
    }
    // Terrain group cleanup
    if (this._terrainGroup) {
      this._terrainGroup.traverse(c => {
        if (c.geometry) c.geometry.dispose()
        if (c.material) c.material.dispose()
      })
    }
    if (this.hotGlow) { this.hotGlow.geometry.dispose(); this.hotGlow.material.dispose() }
    if (this.coldGlow) { this.coldGlow.geometry.dispose(); this.coldGlow.material.dispose() }
    if (this.riseColumn) { this.riseColumn.geometry.dispose(); this.riseColumn.material.dispose() }
    if (this.sinkColumn) { this.sinkColumn.geometry.dispose(); this.sinkColumn.material.dispose() }
    super.dispose()
  }
}
</script>

<style scoped>
.tc-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.tc-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.tc-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.tc-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.tc-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.tc-panel button:hover { background: var(--button-green); }
.preset-btn {
  padding: 3px 8px; border: 1px solid var(--brown); border-radius: 4px;
  background: var(--cream); color: var(--ink); cursor: pointer;
  font-family: inherit; font-size: 11px;
}
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.tc-presets { display: flex; gap: 4px; flex-wrap: wrap; }
.tc-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.tc-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.tc-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

.exp-desc { margin-top: 16px; padding: 14px 18px; background: var(--card-bg); border-radius: var(--radius-card); border: 1px solid var(--brown-light); }
.exp-desc h4 { font-size: 14px; color: var(--red); margin: 0 0 6px; }
.exp-desc p { font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; }

@media (max-width: 720px) {
  .tc-layout { flex-direction: column; }
  .tc-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .tc-panel label { flex: 1; min-width: 120px; }
  .tc-canvas-wrap { min-height: 320px; }
}
</style>
