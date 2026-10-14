<template>
  <div class="kl-layout astro-theme">
    <aside class="kl-panel">
      <div class="panel-header">
        <span class="station-tag">📐 天体力学与天体测量舱</span>
        <h3 class="panel-title">开普勒行星运动定律</h3>
      </div>

      <!-- 典型天体轨道预设 -->
      <div class="orbit-presets">
        <span class="ctrl-subhead">真实天体轨道对照</span>
        <div class="preset-grid">
          <button
            v-for="p in presetPlanets"
            :key="p.name"
            :class="['preset-chip', { active: activePlanet === p.name }]"
            @click="applyPlanet(p)"
          >
            <span class="chip-name">{{ p.name }}</span>
            <span class="chip-val">e = {{ p.e.toFixed(3) }}</span>
          </button>
        </div>
      </div>

      <!-- 离心率连续调节 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>轨道偏心率 e</span>
          <span class="val-badge">{{ eccentricity.toFixed(3) }}</span>
        </div>
        <input
          type="range"
          min="0.0"
          max="0.88"
          step="0.01"
          v-model.number="eccentricity"
          @input="onParamInput"
          class="astro-slider"
        />
        <div class="angle-ticks">
          <span>0.00 正圆</span>
          <span>0.20 近圆</span>
          <span>0.60 显著椭圆</span>
          <span>0.88 扁长轨道</span>
        </div>
      </div>

      <!-- 定律遥测看板 -->
      <div class="law-card">
        <div class="card-head">
          <span>⚡ 开普勒运动学参数</span>
          <span class="law-badge">第二定律相等面积</span>
        </div>
        <div class="law-metrics">
          <div class="metric-row">
            <span class="m-label">近日距 (r_peri)：</span>
            <strong>{{ (a * (1 - eccentricity)).toFixed(2) }} AU</strong>
          </div>
          <div class="metric-row">
            <span class="m-label">远日距 (r_apo)：</span>
            <strong>{{ (a * (1 + eccentricity)).toFixed(2) }} AU</strong>
          </div>
          <div class="metric-row">
            <span class="m-label">速度比 (V_近 / V_远)：</span>
            <strong class="highlight-val">{{ ((1 + eccentricity) / Math.max(0.01, 1 - eccentricity)).toFixed(2) }}x</strong>
          </div>
          <div class="metric-row">
            <span class="m-label">公转周期 T：</span>
            <span>{{ Math.sqrt(Math.pow(a, 3)).toFixed(2) }} 地球年 (a³/T² 恒定)</span>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停公转' : '▶ 连续公转' }}
        </button>
        <button
          @click="toggleSectors"
          class="action-btn"
        >
          {{ showSectors ? '📐 隐藏扫掠扇形' : '📐 显示相等面积扇形' }}
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 核心三大定律分步引导' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转空间 · 滚轮缩放 · 双击居中</p>
    </aside>

    <div class="kl-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">开普勒三大定律力学可视化仿真</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由旋转' : '锁定视角'">
          {{ locked ? '🔒 轴线锁定' : '🔓 自由旋转' }}
        </button>
      </div>
      <div class="perihelion-label">
        <span>近日点 (速度最快) ➔ 远日点 (速度最慢)</span>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="astronomy"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: 'NASA 卫星轨道高程探勘', path: '/geo-labs/terrain', desc: '行星引力位面与真实卫星轨道' }"
    :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第一章', section: '第一节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

export default {
  name: 'KeplerLaws',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      a: 7.0, // semi-major axis in 3D units
      eccentricity: 0.45,
      autoRunning: true,
      locked: true,
      showSectors: true,
      activePlanet: '火星',
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      presetPlanets: [
        { name: '金星', e: 0.007, a: 5.0 },
        { name: '地球', e: 0.017, a: 7.0 },
        { name: '火星', e: 0.093, a: 8.5 },
        { name: '水星', e: 0.206, a: 4.2 },
        { name: '矮行星冥王星', e: 0.244, a: 10.0 },
        { name: '典型彗星', e: 0.750, a: 9.0 },
      ],
      guideSteps: [
        '【第一定律·轨道定律】所有行星绕太阳运动的轨道都是椭圆，太阳处在椭圆的一个焦点上！',
        '【第二定律·面积速度】行星和太阳的连线在相等时间内扫过相等的面积（近日点疾驰、远日点缓行）！',
        '【近日点最大速率】在近日点距太阳最近，引力最大，角速度和线速度均达到全轨道峰值！',
        '【第三定律·周期定律】所有行星半长轴的立方与公转周期的平方之比皆为恒量：a³/T² = k！',
      ],
      pedagogy: {
        observe: [
          '太阳不在椭圆中心，而处于偏向一侧的焦点 F1 处。',
          '近日点附近行星运动弧长远大于远日点附近，但两区域与太阳连线扫过的扇形面积精确相等。',
          '随着离心率 e 增大，轨道越扁平，近日点与远日点速度差异越显著。',
        ],
        change: [
          '调节离心率 e（从 0.00 正圆到 0.88 极端扁长轨道）。',
          '选择不同天体预设（金星近正圆、地球、火星、水星到扁长彗星）。',
          '开闭相等面积扇形展示，对比近日区与远日区面积。',
        ],
        mechanism: [
          '开普勒第一定律是万有引力平方反比定律下二体束缚态轨道的数学解（圆锥曲线之椭圆）。',
          '开普勒第二定律本质是角动量守恒定律：由于万有引力是有心力，对力心力矩为零，故角动量恒定。',
          '开普勒第三定律揭示了引力常数 G 与中心天体质量 M 的内在联系（k = GM / 4π²）。',
        ],
        limitations: [
          '忽略了行星之间的相互引力摄动（真实太阳系存在三体及多体摄动）。',
          '假定太阳质量极大且绝对静止（未计算地日质心运动及广义相对论水星进动微细修正）。',
          '未考虑非引力效应（如光压和彗星喷气反冲力）。',
        ],
      },
    }
  },
  mounted() {
    this.initScene()
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    this.disposeScene()
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    initScene() {
      const canvas = this.$refs.cvs
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const w = rect.width || 600
      const h = rect.height || 420

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0x060914)

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      this.camera.position.set(0, 20, 24)

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setSize(w, h)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.shadowMap.enabled = true

      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.06
      this.controls.target.set(0, 0, 0)
      if (this.locked) {
        this.controls.maxPolarAngle = Math.PI / 2.1
        this.controls.minDistance = 8
        this.controls.maxDistance = 50
      }

      this.meanAnomaly = 0
      this.buildKeplerSystem()
      this.animate()
    },

    buildKeplerSystem() {
      // 1. Stars background
      const starCount = 300
      const starGeo = new THREE.BufferGeometry()
      const starPos = new Float32Array(starCount * 3)
      for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 120
        starPos[i + 1] = (Math.random() - 0.5) * 80
        starPos[i + 2] = (Math.random() - 0.5) * 120
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
      this.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x64748b, size: 0.35 })))

      // 2. Sun at Focus F1 (origin 0,0,0)
      const sunGeo = new THREE.SphereGeometry(1.2, 32, 32)
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      this.sunMesh = new THREE.Mesh(sunGeo, sunMat)
      this.scene.add(this.sunMesh)

      const sunLight = new THREE.PointLight(0xfff7ed, 3.5, 60)
      this.scene.add(sunLight)
      this.scene.add(new THREE.AmbientLight(0x1e293b, 0.8))

      // 3. Orbit geometry group
      this.orbitGroup = new THREE.Group()
      this.scene.add(this.orbitGroup)

      // 4. Planet mesh
      const planetGeo = new THREE.SphereGeometry(0.55, 32, 32)
      const planetMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 })
      this.planetMesh = new THREE.Mesh(planetGeo, planetMat)
      this.scene.add(this.planetMesh)

      // 5. Radius vector line from Sun to Planet
      const radGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)])
      this.radiusLine = new THREE.Line(radGeo, new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.7 }))
      this.scene.add(this.radiusLine)

      // 6. Velocity arrow helper
      const dir = new THREE.Vector3(0, 0, 1)
      this.velocityArrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 2, 0x10b981, 0.4, 0.25)
      this.scene.add(this.velocityArrow)

      this.rebuildOrbit()
    },

    rebuildOrbit() {
      // Clear old orbit items
      while (this.orbitGroup.children.length > 0) {
        const c = this.orbitGroup.children[0]
        if (c.geometry) c.geometry.dispose()
        this.orbitGroup.remove(c)
      }

      const a = this.a
      const e = this.eccentricity
      const b = a * Math.sqrt(Math.max(0.001, 1 - e * e))
      const c = a * e // Focus distance from center

      // Orbit center is at (-c, 0) so Sun is at (0, 0)
      const pts = []
      for (let i = 0; i <= 128; i++) {
        const theta = (i / 128) * Math.PI * 2
        const x = a * Math.cos(theta) - c
        const z = b * Math.sin(theta)
        pts.push(new THREE.Vector3(x, 0, z))
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts)
      const orbitLine = new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 }))
      this.orbitGroup.add(orbitLine)

      // Major and minor axes
      const majorGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-c - a, 0, 0),
        new THREE.Vector3(-c + a, 0, 0),
      ])
      this.orbitGroup.add(new THREE.Line(majorGeo, new THREE.LineDashedMaterial({ color: 0x475569, dashSize: 0.3, gapSize: 0.2 })))

      // Equal area sectors (one near perihelion, one near aphelion)
      if (this.showSectors) {
        this.buildEqualAreaSectors(a, b, c)
      }
    },

    buildEqualAreaSectors(a, b, c) {
      // Sector 1: Near Perihelion (right side, x > 0)
      // dTheta is bigger near perihelion
      const periPts = [new THREE.Vector3(0, 0, 0)]
      const dE_peri = 0.55
      for (let t = -dE_peri; t <= dE_peri; t += 0.05) {
        const x = a * Math.cos(t) - c
        const z = b * Math.sin(t)
        periPts.push(new THREE.Vector3(x, 0.01, z))
      }
      periPts.push(new THREE.Vector3(0, 0, 0))

      const periShape = new THREE.Shape()
      periShape.moveTo(0, 0)
      for (let i = 1; i < periPts.length - 1; i++) {
        periShape.lineTo(periPts[i].x, periPts[i].z)
      }
      periShape.lineTo(0, 0)

      const periGeo = new THREE.ShapeGeometry(periShape)
      periGeo.rotateX(Math.PI / 2)
      const periMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
      this.orbitGroup.add(new THREE.Mesh(periGeo, periMat))

      // Sector 2: Near Aphelion (left side, around PI)
      // dE is smaller near aphelion for equal time
      const dE_apo = dE_peri * ((1 - this.eccentricity) / (1 + this.eccentricity))
      const apoShape = new THREE.Shape()
      apoShape.moveTo(0, 0)
      for (let t = Math.PI - dE_apo; t <= Math.PI + dE_apo; t += 0.03) {
        const x = a * Math.cos(t) - c
        const z = b * Math.sin(t)
        apoShape.lineTo(x, z)
      }
      apoShape.lineTo(0, 0)
      const apoGeo = new THREE.ShapeGeometry(apoShape)
      apoGeo.rotateX(Math.PI / 2)
      const apoMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
      this.orbitGroup.add(new THREE.Mesh(apoGeo, apoMat))
    },

    // Solve Kepler equation: M = E - e*sin(E)
    solveKepler(M, e) {
      let E = M
      for (let i = 0; i < 6; i++) {
        const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
        E -= dE
        if (Math.abs(dE) < 1e-5) break
      }
      return E
    },

    updatePlanetPosition() {
      if (!this.planetMesh) return
      const a = this.a
      const e = this.eccentricity
      const b = a * Math.sqrt(Math.max(0.001, 1 - e * e))
      const c = a * e

      const E = this.solveKepler(this.meanAnomaly, e)
      const x = a * Math.cos(E) - c
      const z = b * Math.sin(E)
      this.planetMesh.position.set(x, 0, z)

      // Radius vector
      if (this.radiusLine) {
        const pos = this.radiusLine.geometry.attributes.position
        pos.setXYZ(0, 0, 0, 0)
        pos.setXYZ(1, x, 0, z)
        pos.needsUpdate = true
      }

      // Velocity direction (tangent to ellipse)
      // dx/dE = -a*sin(E), dz/dE = b*cos(E)
      const vx = -a * Math.sin(E)
      const vz = b * Math.cos(E)
      const r = Math.sqrt(x * x + z * z)
      // Vis-viva equation: v^2 = GM * (2/r - 1/a)
      const vMag = Math.sqrt(Math.max(0.1, 2 / r - 1 / a)) * 2.2

      const vDir = new THREE.Vector3(vx, 0, vz).normalize()
      this.velocityArrow.position.set(x, 0, z)
      this.velocityArrow.setDirection(vDir)
      this.velocityArrow.setLength(vMag, 0.4, 0.2)
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)
      if (this.autoRunning) {
        // n = sqrt(k / a^3)
        const meanMotion = 0.02 * Math.sqrt(1 / Math.pow(this.a / 7, 3))
        this.meanAnomaly = (this.meanAnomaly + meanMotion) % (Math.PI * 2)
        this.updatePlanetPosition()
      }
      if (this.sunMesh) {
        this.sunMesh.rotation.y += 0.005
      }
      if (this.controls) {
        this.controls.update()
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    onParamInput() {
      this.activePlanet = ''
      this.rebuildOrbit()
      this.updatePlanetPosition()
    },

    applyPlanet(p) {
      this.activePlanet = p.name
      this.eccentricity = p.e
      this.a = p.a
      this.rebuildOrbit()
      this.updatePlanetPosition()
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    toggleSectors() {
      this.showSectors = !this.showSectors
      this.rebuildOrbit()
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.controls.maxPolarAngle = Math.PI / 2.1
          this.controls.minDistance = 8
          this.controls.maxDistance = 50
        } else {
          this.controls.maxPolarAngle = Math.PI
          this.controls.minDistance = 2
          this.controls.maxDistance = 100
        }
      }
    },

    toggleGuide() {
      this.guideActive = !this.guideActive
      if (this.guideActive) {
        this.guideIndex = 0
        this.guideText = this.guideSteps[0]
        clearInterval(this.guideTimer)
        this.guideTimer = setInterval(() => {
          if (!this.guideActive) return
          this.guideIndex = (this.guideIndex + 1) % this.guideSteps.length
          this.guideText = this.guideSteps[this.guideIndex]
        }, 5000)
      } else {
        clearInterval(this.guideTimer)
      }
    },

    resetObservation() {
      this.eccentricity = 0.45
      this.a = 7.0
      this.meanAnomaly = 0
      this.autoRunning = true
      this.showSectors = true
      this.activePlanet = '火星'
      this.rebuildOrbit()
      this.updatePlanetPosition()
      this.camera.position.set(0, 20, 24)
      this.controls.target.set(0, 0, 0)
      this.controls.update()
    },

    onResize() {
      const canvas = this.$refs.cvs
      if (!canvas || !this.renderer || !this.camera) return
      const rect = canvas.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        this.camera.aspect = rect.width / rect.height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(rect.width, rect.height)
      }
    },

    disposeScene() {
      if (this.animId) cancelAnimationFrame(this.animId)
      if (this.guideTimer) clearInterval(this.guideTimer)
      if (this.controls) this.controls.dispose()
      if (this.renderer) this.renderer.dispose()
      if (this.scene) {
        this.scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
            else obj.material.dispose()
          }
        })
      }
    },
  },
}
</script>

<style scoped>
.astro-theme {
  display: flex;
  gap: 18px;
  background: #080d1a;
  border-radius: var(--radius-card, 16px);
  padding: 16px;
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #f1f5f9;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.kl-panel {
  width: 330px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 10px;
}
.station-tag {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #f59e0b;
  font-weight: 700;
}
.panel-title {
  margin: 4px 0 0;
  font-size: 17px;
  font-weight: 700;
  color: #f8fafc;
}

.ctrl-subhead {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 6px;
  display: block;
}
.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.preset-chip {
  padding: 6px 4px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
}
.preset-chip:hover {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
}
.preset-chip.active {
  background: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
  color: #fbbf24;
}
.chip-name { font-size: 11px; font-weight: 700; }
.chip-val { font-size: 9px; opacity: 0.7; }

.ctrl-group {
  background: rgba(15, 23, 42, 0.6);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.ctrl-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 6px;
  color: #cbd5e1;
}
.val-badge {
  color: #f59e0b;
  font-weight: 700;
}
.astro-slider {
  width: 100%;
  accent-color: #f59e0b;
}
.angle-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #64748b;
  margin-top: 4px;
}

.law-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 12px;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
}
.law-badge {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}
.law-metrics {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
}
.metric-row {
  display: flex;
  justify-content: space-between;
  color: #cbd5e1;
}
.m-label { color: #94a3b8; }
.highlight-val { color: #f59e0b; font-weight: 700; }

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.action-btn {
  padding: 8px;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover {
  background: rgba(245, 158, 11, 0.2);
  border-color: #f59e0b;
}
.play-btn.playing {
  background: #f59e0b;
  color: #000;
  font-weight: 700;
}

.guide-trigger {
  padding: 8px;
  border-radius: 8px;
  border: 1px dashed rgba(245, 158, 11, 0.6);
  background: rgba(245, 158, 11, 0.08);
  color: #f59e0b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.guide-trigger.active {
  background: #f59e0b;
  color: #000;
}
.guide-box {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #fef08a;
  line-height: 1.5;
}

.nav-hint {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  margin: 0;
}

.kl-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.kl-canvas-wrap canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.view-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
}
.overlay-tag {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #f8fafc;
}
.lock-btn {
  pointer-events: auto;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f8fafc;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.perihelion-label {
  position: absolute;
  bottom: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  color: #34d399;
  font-weight: 600;
  pointer-events: none;
}

@media (max-width: 768px) {
  .astro-theme {
    flex-direction: column;
  }
  .kl-panel {
    width: 100%;
  }
  .kl-canvas-wrap {
    min-height: 320px;
  }
}
</style>
