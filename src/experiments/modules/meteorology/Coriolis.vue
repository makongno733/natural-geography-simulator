<template>
  <div class="cor-layout aero-theme">
    <aside class="cor-panel">
      <div class="panel-header">
        <span class="station-tag">🌀 流体动力学旋转转台</span>
        <h3 class="panel-title">科里奥利力与地转偏向效应</h3>
      </div>

      <!-- 典型气象水文场景预设 -->
      <div class="cor-presets">
        <span class="ctrl-subhead">典型天气系统应用</span>
        <div class="preset-grid">
          <button
            v-for="p in scenarioList"
            :key="p.key"
            :class="['preset-chip', { active: currentScenarioKey === p.key }]"
            @click="selectScenario(p)"
          >
            <span class="chip-icon">{{ p.icon }}</span>
            <span class="chip-name">{{ p.name }}</span>
          </button>
        </div>
      </div>

      <!-- 半球与参考系切换 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>地球半球 (旋转方向)</span>
          <span class="val-badge">{{ hemisphere === 'north' ? '北半球 (逆时针)' : '南半球 (顺时针)' }}</span>
        </div>
        <div class="dual-toggle">
          <button
            :class="['toggle-btn', { active: hemisphere === 'north' }]"
            @click="setHemisphere('north')"
          >
            🌏 北半球 (右偏)
          </button>
          <button
            :class="['toggle-btn', { active: hemisphere === 'south' }]"
            @click="setHemisphere('south')"
          >
            🌍 南半球 (左偏)
          </button>
        </div>
      </div>

      <!-- 惯性系 vs 转动系核心对比 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>观察参考系对比</span>
          <span class="val-badge">{{ frameMode === 'rotating' ? '转盘随动参考系' : '外部惯性参考系' }}</span>
        </div>
        <div class="dual-toggle">
          <button
            :class="['toggle-btn', { active: frameMode === 'rotating' }]"
            @click="setFrameMode('rotating')"
          >
            🔄 转盘视角 (见弯曲)
          </button>
          <button
            :class="['toggle-btn', { active: frameMode === 'inertial' }]"
            @click="setFrameMode('inertial')"
          >
            ⏹ 实验室外 (见直线)
          </button>
        </div>
      </div>

      <!-- 旋转速度与水流密度 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>转台角速度 (模拟自转速率)</span>
          <span class="val-badge">{{ rotationSpeed }}x</span>
        </div>
        <input
          type="range"
          min="1"
          max="8"
          step="0.5"
          v-model.number="rotationSpeed"
          @input="onParamInput"
          class="aero-slider"
        />
      </div>

      <!-- 动力学遥测看板 -->
      <div class="coriolis-card">
        <div class="card-head">
          <span>⚡ 地转偏向力公式与特征</span>
          <span class="cor-badge">F = 2mvω·sinφ</span>
        </div>
        <div class="cor-metrics">
          <div class="m-row">
            <span class="m-label">偏转规律：</span>
            <strong class="highlight-dir">{{ deflectionLawText }}</strong>
          </div>
          <div class="m-row">
            <span class="m-label">赤道效应：</span>
            <span>赤道处 sin(0°)=0，地转偏向力为零</span>
          </div>
          <div class="m-row">
            <span class="m-label">气旋形态：</span>
            <span>{{ cycloneFormText }}</span>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停旋转' : '▶ 旋转实验' }}
        </button>
        <button
          @click="clearTrails"
          class="action-btn"
        >
          🧹 清空流迹
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 惯性系与地转偏向力原理' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转空间 · 滚轮缩放 · 双击居中</p>
    </aside>

    <div class="cor-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">{{ frameOverlayText }}</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由漫游' : '锁定转台正上方'">
          {{ locked ? '🔒 俯视锁定' : '🔓 自由漫游' }}
        </button>
      </div>
      <div class="swirl-badge">
        <span>{{ swirlDescText }}</span>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="meteorology"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: 'NASA 卫星热带气旋云系旋涡观测', path: '/geo-labs/satellite', desc: '真实台风逆时针旋转螺旋雨带' }"
    :textbook-link="{ grade: '高中', book: '选择性必修1', chapter: '第三章', section: '第一节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

const SCENARIOS = [
  { key: 'cyclone', name: '低压气旋', icon: '🌪️', speed: 4, hemi: 'north' },
  { key: 'anticyclone', name: '高压反气旋', icon: '☀️', speed: 3.5, hemi: 'north' },
  { key: 'trade-winds', name: '行星信风偏转', icon: '💨', speed: 2.5, hemi: 'north' },
  { key: 'ocean-gyre', name: '大洋环流偏转', icon: '🌊', speed: 3, hemi: 'south' },
]

export default {
  name: 'Coriolis',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      currentScenarioKey: 'cyclone',
      hemisphere: 'north',
      frameMode: 'rotating',
      rotationSpeed: 3.5,
      autoRunning: true,
      locked: true,
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      scenarioList: SCENARIOS,
      guideSteps: [
        '【根本本质】小球在桌面上实际上沿直线飞出，外部惯性参考系下无额外横向力！',
        '【转动参考系】转盘随地球自转旋转，在转盘上的观测者看来，质点轨迹发生弯曲！',
        '【北右南左】北半球顺运动方向右偏（逆时针旋涡），南半球顺运动方向左偏（顺时针旋涡）！',
        '【纬度制约】地转偏向力 F = 2mvω·sinφ，赤道处为0，纬度越高偏向力越显著！',
      ],
      pedagogy: {
        observe: [
          '流体质点或射出小球在不同参考系下的轨迹：惯性系下直线运动 vs 转盘参考系下弯曲偏转。',
          '北半球向运动方向右侧偏转；南半球向运动方向左侧偏转。',
          '气旋中心低气压吸引四周气流汇聚时，因右偏而形成逆时针旋转的大型旋涡。',
        ],
        change: [
          '切换“北半球”与“南半球”，观察偏转方向完全反转。',
          '切换“转盘视角”与“外部实验室视角”，领会地转偏向力的“惯性力”本质。',
          '调节转台角速度，探究转速增大对轨迹偏转曲率的影响。',
        ],
        mechanism: [
          '科里奥利力并非真实存在的接触力或场力，而是在转动非惯性参考系中出现的惯性附加力。',
          '大小公式：$F = 2mv\omega \sin\varphi$（$m$为质量，$v$为水平速度，$\omega$为自转角速度，$\varphi$为地理纬度）。',
          '由于力始终垂直于运动方向，地转偏向力只改变运动方向，不做功、不改变速度大小。',
        ],
        limitations: [
          '本转台实验模拟的是水平二维平面，未考虑地球球面的曲率效应。',
          '模型略去了流体与转盘底部的粘性摩擦阻力。',
          '洗手池漏水旋涡因尺度极小（惯性远大于科氏力），主要受水槽初始微小角动量主导，教学中不得简单混淆为地转偏向力。',
        ],
      },
    }
  },
  computed: {
    deflectionLawText() {
      return this.hemisphere === 'north' ? '北半球顺运动方向向右偏' : '南半球顺运动方向向左偏'
    },
    cycloneFormText() {
      if (this.currentScenarioKey === 'cyclone') {
        return this.hemisphere === 'north' ? '北半球气旋：逆时针辐合' : '南半球气旋：顺时针辐合'
      }
      return this.hemisphere === 'north' ? '北半球反气旋：顺时针辐散' : '南半球反气旋：逆时针辐散'
    },
    frameOverlayText() {
      return this.frameMode === 'rotating' ? '随动参考系（转盘相对静止 · 显现科氏偏转力）' : '惯性参考系（实验室绝对参考系 · 质点直线运动）'
    },
    swirlDescText() {
      return this.hemisphere === 'north' ? '北半球：逆时针辐合气旋旋涡' : '南半球：顺时针辐合气旋旋涡'
    },
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
      this.scene.background = new THREE.Color(0x0a1424)

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      this.camera.position.set(0, 18, 0.1) // top-down view by default

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setSize(w, h)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.06
      this.controls.target.set(0, 0, 0)
      if (this.locked) {
        this.controls.maxPolarAngle = Math.PI / 2.3
        this.controls.minDistance = 6
        this.controls.maxDistance = 35
      }

      this.buildTurnTable()
      this.animate()
    },

    buildTurnTable() {
      // 1. Ambient & directional light
      const light = new THREE.DirectionalLight(0xfff8e7, 2.5)
      light.position.set(10, 20, 10)
      this.scene.add(light)
      this.scene.add(new THREE.AmbientLight(0x334155, 1.2))

      // 2. Rotating turntable group
      this.turntableGroup = new THREE.Group()
      this.scene.add(this.turntableGroup)

      // Tank cylinder
      const tankGeo = new THREE.CylinderGeometry(8.0, 8.0, 0.4, 64)
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
      const tankMesh = new THREE.Mesh(tankGeo, tankMat)
      tankMesh.position.y = -0.2
      this.turntableGroup.add(tankMesh)

      // Grid rings on turntable
      for (let r = 2; r <= 7.5; r += 1.5) {
        const ringGeo = new THREE.RingGeometry(r - 0.03, r + 0.03, 64)
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, side: THREE.DoubleSide })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = Math.PI / 2
        this.turntableGroup.add(ring)
      }

      // Center drain sink
      const drainGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.45, 32)
      const drainMat = new THREE.MeshBasicMaterial({ color: 0x020617 })
      const drain = new THREE.Mesh(drainGeo, drainMat)
      drain.position.y = -0.15
      this.turntableGroup.add(drain)

      // 3. Fluid tracer particles
      this.particleCount = 180
      this.particles = []
      const pGeo = new THREE.SphereGeometry(0.12, 8, 8)

      for (let i = 0; i < this.particleCount; i++) {
        const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        const mesh = new THREE.Mesh(pGeo, pMat)
        this.resetParticle(mesh)
        mesh.userData.age = Math.random() * 200
        this.particles.push(mesh)
        this.turntableGroup.add(mesh)
      }
    },

    resetParticle(p) {
      // Inward or outward flow
      const r = 7.2 - Math.random() * 1.5
      const angle = Math.random() * Math.PI * 2
      p.userData = {
        r: r,
        theta: angle,
        vr: -0.02 - Math.random() * 0.015,
        vtheta: 0,
        age: 0,
      }
      p.position.set(Math.cos(angle) * r, 0.1, Math.sin(angle) * r)
    },

    clearTrails() {
      this.particles.forEach(p => this.resetParticle(p))
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)

      if (this.autoRunning) {
        // North hemisphere: turntable rotates counter-clockwise (omega > 0)
        // South hemisphere: turntable rotates clockwise (omega < 0)
        const omegaDir = this.hemisphere === 'north' ? 1 : -1
        const omega = 0.008 * this.rotationSpeed * omegaDir

        if (this.frameMode === 'inertial') {
          // Turntable physically rotates in scene
          this.turntableGroup.rotation.y += omega
        } else {
          // In rotating frame, turntable is stationary to camera, particles curve by Coriolis acceleration!
          this.turntableGroup.rotation.y = 0
        }

        // Particle dynamics
        this.particles.forEach((p) => {
          p.userData.age++
          if (p.userData.age > 240 || p.userData.r < 0.85) {
            this.resetParticle(p)
          }

          if (this.frameMode === 'rotating') {
            // Coriolis acceleration a_cor = -2 * omega x v
            // Radial inward velocity vr generates tangential Coriolis deflection!
            // North: defection to right (vtheta increases in counter-direction)
            const corAcc = -2 * omega * p.userData.vr * 1.8
            p.userData.vtheta += corAcc
            // Angular momentum conservation as r shrinks:
            p.userData.vtheta *= 1.015

            p.userData.r += p.userData.vr
            p.userData.theta += p.userData.vtheta
          } else {
            // Straight inward trajectory in inertial frame
            p.userData.r += p.userData.vr
          }

          const x = Math.cos(p.userData.theta) * p.userData.r
          const z = Math.sin(p.userData.theta) * p.userData.r
          p.position.set(x, 0.1, z)

          // Color based on velocity
          const speed = Math.abs(p.userData.vtheta)
          if (speed > 0.04) {
            p.material.color.setHex(0xf59e0b) // fast swirl
          } else {
            p.material.color.setHex(0x38bdf8)
          }
        })
      }

      if (this.controls) this.controls.update()
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    selectScenario(s) {
      this.currentScenarioKey = s.key
      this.rotationSpeed = s.speed
      this.hemisphere = s.hemi
      this.clearTrails()
    },

    setHemisphere(hemi) {
      this.hemisphere = hemi
      this.clearTrails()
    },

    setFrameMode(mode) {
      this.frameMode = mode
      this.clearTrails()
    },

    onParamInput() {
      // speed updated
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.camera.position.set(0, 18, 0.1)
          this.controls.target.set(0, 0, 0)
          this.controls.maxPolarAngle = Math.PI / 2.3
        } else {
          this.controls.maxPolarAngle = Math.PI
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
      this.hemisphere = 'north'
      this.frameMode = 'rotating'
      this.rotationSpeed = 3.5
      this.autoRunning = true
      this.clearTrails()
      this.camera.position.set(0, 18, 0.1)
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
.aero-theme {
  display: flex;
  gap: 18px;
  background: #08111e;
  border-radius: var(--radius-card, 16px);
  padding: 16px;
  border: 1px solid rgba(2, 132, 199, 0.25);
  color: #f1f5f9;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.cor-panel {
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
  color: #0284c7;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.preset-chip {
  padding: 8px 6px;
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
  background: rgba(2, 132, 199, 0.15);
  border-color: rgba(2, 132, 199, 0.4);
}
.preset-chip.active {
  background: rgba(2, 132, 199, 0.25);
  border-color: #0284c7;
  color: #38bdf8;
}
.chip-icon { font-size: 16px; margin-bottom: 2px; }
.chip-name { font-size: 11px; font-weight: 700; }

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
  color: #38bdf8;
  font-weight: 700;
}
.aero-slider {
  width: 100%;
  accent-color: #0284c7;
}

.dual-toggle {
  display: flex;
  gap: 6px;
}
.toggle-btn {
  flex: 1;
  padding: 6px 4px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: rgba(2, 132, 199, 0.25);
  border-color: #0284c7;
  color: #38bdf8;
  font-weight: 700;
}

.coriolis-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(2, 132, 199, 0.3);
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
.cor-badge {
  background: rgba(2, 132, 199, 0.2);
  color: #38bdf8;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
}
.cor-metrics {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
}
.m-row {
  display: flex;
  justify-content: space-between;
  color: #cbd5e1;
}
.m-label { color: #94a3b8; }
.highlight-dir { color: #38bdf8; font-weight: 700; }

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
  background: rgba(2, 132, 199, 0.2);
  border-color: #0284c7;
}
.play-btn.playing {
  background: #0284c7;
  color: #fff;
  font-weight: 700;
}

.guide-trigger {
  padding: 8px;
  border-radius: 8px;
  border: 1px dashed rgba(2, 132, 199, 0.6);
  background: rgba(2, 132, 199, 0.08);
  color: #38bdf8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.guide-trigger.active {
  background: #0284c7;
  color: #fff;
}
.guide-box {
  background: rgba(2, 132, 199, 0.12);
  border: 1px solid rgba(2, 132, 199, 0.3);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #bae6fd;
  line-height: 1.5;
}

.nav-hint {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  margin: 0;
}

.cor-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.cor-canvas-wrap canvas {
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

.swirl-badge {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(2, 132, 199, 0.5);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  color: #38bdf8;
  font-weight: 600;
  pointer-events: none;
}

@media (max-width: 768px) {
  .aero-theme {
    flex-direction: column;
  }
  .cor-panel {
    width: 100%;
  }
  .cor-canvas-wrap {
    min-height: 320px;
  }
}
</style>
