<template>
  <div class="se-layout">
    <aside class="se-panel">
      <label>降雨强度 <span>{{ rainIntensity }}</span></label>
      <input type="range" min="0" max="10" step="1" v-model.number="rainIntensity" @input="onParam" />
      <label>坡度 <span>{{ slopeAngle }}°</span></label>
      <input type="range" min="5" max="45" step="1" v-model.number="slopeAngle" @input="onParam" />
      <div class="se-legend">
        <div class="se-legend-item"><span class="se-dot bare"></span> 裸露土壤</div>
        <div class="se-legend-item"><span class="se-dot veg"></span> 植被覆盖</div>
      </div>
      <button @click="reset">↺ 重置</button>
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

export default {
  name: 'SoilErosion',
  data() { return { rainIntensity: 5, slopeAngle: 20 } },
  mounted() {
    this._e = new SoilErosionEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    onParam() { this._e.setParams({ rainIntensity: this.rainIntensity, slopeAngle: this.slopeAngle }) },
    reset() {
      this.rainIntensity = 5; this.slopeAngle = 20
      this._e.dispose()
      this.$nextTick(() => { this._e = new SoilErosionEngine(); this._e.init(this.$refs.cvs); this._e.setParams({ rainIntensity: 5, slopeAngle: 20 }) })
    },
  },
}

class SoilErosionEngine extends ExperimentEngine {
  setupScene() {
    this.rainIntensity = 5
    this.slopeAngle = 20

    const patchWidth = 3.5
    const patchLength = 5
    const segments = 32

    // Bare soil patch (left)
    const bareGeo = new THREE.PlaneGeometry(patchWidth, patchLength, segments, segments)
    const bareMat = new THREE.MeshStandardMaterial({ color: 0xb8956e, roughness: 0.9 })
    this.barePatch = new THREE.Mesh(bareGeo, bareMat)
    this.barePatch.position.set(-2.5, 0, 0)
    this.barePatch.receiveShadow = true
    this.scene.add(this.barePatch)

    // Vegetated patch (right) - slightly darker soil under vegetation
    const vegGeo = new THREE.PlaneGeometry(patchWidth, patchLength, segments, segments)
    const vegMat = new THREE.MeshStandardMaterial({ color: 0x7a6b4e, roughness: 0.85 })
    this.vegPatch = new THREE.Mesh(vegGeo, vegMat)
    this.vegPatch.position.set(2.5, 0, 0)
    this.vegPatch.receiveShadow = true
    this.scene.add(this.vegPatch)

    this._applySlope()

    // Vegetation cylinders on right patch
    this.plants = []
    const stemGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.4, 6)
    const leafGeo = new THREE.SphereGeometry(0.15, 6, 4)
    for (let i = 0; i < 80; i++) {
      const plantGroup = new THREE.Group()
      const stem = new THREE.Mesh(stemGeo, new THREE.MeshStandardMaterial({ color: 0x4a7c3f, roughness: 0.7 }))
      stem.position.y = 0.2
      plantGroup.add(stem)
      const leaf = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ color: 0x5a9e4b, roughness: 0.6 }))
      leaf.position.y = 0.45
      plantGroup.add(leaf)

      const lx = (Math.random() - 0.5) * (patchWidth - 0.3)
      const lz = (Math.random() - 0.5) * (patchLength - 0.3)
      plantGroup.position.set(2.5 + lx, 0.15, lz)
      plantGroup.castShadow = true
      this.scene.add(plantGroup)
      this.plants.push({ group: plantGroup, baseX: plantGroup.position.x, baseZ: plantGroup.position.z })
    }

    // Puddle basins at bottom
    const puddleGeo = new THREE.BoxGeometry(patchWidth * 0.8, 0.05, 0.6)
    const puddleMatBare = new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.3, transparent: true, opacity: 0.7 })
    const puddleMatVeg = new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.2, transparent: true, opacity: 0.7 })
    this.puddleBare = new THREE.Mesh(puddleGeo, puddleMatBare)
    this.puddleBare.position.set(-2.5, 0.03, patchLength / 2 + 0.3)
    this.scene.add(this.puddleBare)
    this.puddleVeg = new THREE.Mesh(puddleGeo, puddleMatVeg)
    this.puddleVeg.position.set(2.5, 0.03, patchLength / 2 + 0.3)
    this.scene.add(this.puddleVeg)

    // Rain drops pool
    this._drops = []
    this._spawnDrops()

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(16, 16)
    groundGeo.rotateX(-Math.PI / 2)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xd5c39c, roughness: 0.9 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.position.y = -0.05
    ground.receiveShadow = true
    this.scene.add(ground)

    // Divider line
    const dividerGeo = new THREE.BoxGeometry(0.08, 0.02, patchLength + 1)
    const divider = new THREE.Mesh(dividerGeo, new THREE.MeshStandardMaterial({ color: 0x888888 }))
    divider.position.set(0, 0.01, 0)
    this.scene.add(divider)

    // Labels
    const labelGeo = new THREE.PlaneGeometry(1.2, 0.3)
    this._makeLabel('裸露土壤', -2.5, 0.5, -2.5)
    this._makeLabel('植被覆盖', 2.5, 0.5, -2.5)

    this.camera.position.set(2, 5, 7)
    this.controls.target.set(0, -0.1, 0.5)
  }

  _makeLabel(text, x, y, z) {
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 128, 32)
    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthTest: false })
    const label = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), mat)
    label.position.set(x, y, z)
    label.renderOrder = 999
    this.scene.add(label)
  }

  _applySlope() {
    const angleRad = THREE.MathUtils.degToRad(this.slopeAngle)
    this.barePatch.rotation.x = -angleRad
    this.vegPatch.rotation.x = -angleRad
    // Position patches so top edge stays at y=0
    const halfLen = 2.5
    const drop = Math.sin(angleRad) * halfLen
    this.barePatch.position.z = Math.cos(angleRad) * halfLen
    this.vegPatch.position.z = Math.cos(angleRad) * halfLen
    this.barePatch.position.y = -drop
    this.vegPatch.position.y = -drop
    // Update plants
    this.plants.forEach(p => {
      const lz = p.baseZ
      const dropPlant = Math.sin(angleRad) * (lz + halfLen)
      p.group.position.z = Math.cos(angleRad) * (lz + halfLen)
      p.group.position.y = -dropPlant + 0.15
    })
    // Update puddles
    this.puddleBare.position.z = Math.cos(angleRad) * 3 + 0.3
    this.puddleBare.position.y = -Math.sin(angleRad) * 3 + 0.03
    this.puddleVeg.position.z = Math.cos(angleRad) * 3 + 0.3
    this.puddleVeg.position.y = -Math.sin(angleRad) * 3 + 0.03
  }

  _spawnDrops() {
    this._drops.forEach(d => {
      this.scene.remove(d.mesh)
      if (d.mesh.material) d.mesh.material.dispose()
      if (d.mesh.geometry) d.mesh.geometry.dispose()
    })
    this._drops = []
    const count = this.rainIntensity * 8
    const geo = new THREE.SphereGeometry(0.05, 4, 4)
    for (let i = 0; i < count; i++) {
      const side = Math.random() < 0.5 ? -2.5 : 2.5
      const mat = new THREE.MeshBasicMaterial({ color: 0x42a5f5 })
      const drop = new THREE.Mesh(geo, mat)
      const angleRad = THREE.MathUtils.degToRad(this.slopeAngle)
      const halfLen = 2.5
      const topZ = Math.cos(angleRad) * (-halfLen)
      const topY = -Math.sin(angleRad) * (-halfLen)
      drop.position.set(side + (Math.random() - 0.5) * 3, topY + 3 + Math.random() * 2, topZ + (Math.random() - 0.5) * 0.5)
      this.scene.add(drop)
      this._drops.push({ mesh: drop, side, landed: false, turbid: false })
    }
  }

  update(dt) {
    // Always lerp puddle colors back toward clean when rain is light
    if (this.rainIntensity < 0.5) {
      const bareCol = this.puddleBare.material.color
      bareCol.lerp(new THREE.Color(0xc8a96e), dt * 0.5)
      const vegCol = this.puddleVeg.material.color
      vegCol.lerp(new THREE.Color(0x5c8a8a), dt * 0.5)
    }

    if (this.rainIntensity === 0 || !this._drops) return
    const angleRad = THREE.MathUtils.degToRad(this.slopeAngle)
    const speed = 2 + this.rainIntensity * 0.4

    for (const d of this._drops) {
      const halfLen = 2.5
      const topZ = Math.cos(angleRad) * (-halfLen)
      const topY = -Math.sin(angleRad) * (-halfLen)
      const bottomZ = Math.cos(angleRad) * halfLen
      const bottomY = -Math.sin(angleRad) * halfLen

      if (!d.landed) {
        // Falling phase
        d.mesh.position.y -= dt * speed * 1.5
        const patchX = d.side
        const patchZ = d.mesh.position.z
        const relZ = patchZ - topZ
        const slopeY = topY + (relZ / (bottomZ - topZ)) * (bottomY - topY)
        const halfW = 1.75
        if (d.mesh.position.y <= slopeY + 0.08 &&
            Math.abs(d.mesh.position.x - patchX) < halfW &&
            d.mesh.position.z > topZ && d.mesh.position.z < bottomZ) {
          d.landed = true
          d.mesh.position.y = slopeY + 0.03
        }
      } else {
        // Runoff phase - slide down slope
        d.mesh.position.z += dt * speed * Math.cos(angleRad) * 0.8
        d.mesh.position.y += dt * speed * Math.sin(angleRad) * 0.8
        // Check if reached bottom
        if (d.mesh.position.z > bottomZ) {
          // Reset to top
          d.landed = false
          d.turbid = false
          d.mesh.position.set(d.side + (Math.random() - 0.5) * 3, topY + 3 + Math.random() * 0.5, topZ + (Math.random() - 0.5) * 0.5)
          d.mesh.material.color.set(0x42a5f5)
          // Puddle effect: bare side gets turbid
          if (d.side < 0) {
            this.puddleBare.material.color.setHex(
              THREE.MathUtils.lerp(0xc8a96e, 0x8b6914, Math.min(1, this.rainIntensity / 10))
            )
          }
        }
        // On bare side, rain turns brown
        if (d.side < 0 && d.mesh.position.z > topZ + 1.5) {
          d.mesh.material.color.set(0x8b6914)
          d.turbid = true
        }
      }
    }
  }

  setParams({ rainIntensity, slopeAngle }) {
    if (rainIntensity !== undefined && rainIntensity !== this.rainIntensity) {
      this.rainIntensity = rainIntensity
      this._spawnDrops()
    }
    if (slopeAngle !== undefined && slopeAngle !== this.slopeAngle) {
      this.slopeAngle = slopeAngle
      this._applySlope()
    }
  }
}
</script>

<style scoped>
.se-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.se-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.se-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.se-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.se-legend { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--muted); }
.se-legend-item { display: flex; align-items: center; gap: 6px; }
.se-dot { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
.se-dot.bare { background: #b8956e; }
.se-dot.veg { background: #5a9e4b; }
.se-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.se-panel button:hover { background: var(--button-green); }
.se-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.se-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.se-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .se-layout { flex-direction: column; }
  .se-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .se-canvas-wrap { min-height: 320px; }
}
</style>
