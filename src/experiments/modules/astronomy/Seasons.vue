<template>
  <div class="se-layout astro-theme">
    <aside class="se-panel">
      <div class="panel-header">
        <span class="station-tag">☀️ 日心天象与公转观测舱</span>
        <h3 class="panel-title">四季成因与太阳直射点移动</h3>
      </div>

      <!-- 二分二至关键节点 -->
      <div class="season-selector">
        <span class="ctrl-subhead">二分二至预设节点</span>
        <div class="preset-grid">
          <button
            v-for="s in seasonList"
            :key="s.name"
            :class="['preset-chip', { active: currentSeasonKey === s.key }]"
            @click="selectSeason(s)"
          >
            <span class="chip-icon">{{ s.icon }}</span>
            <span class="chip-name">{{ s.name }}</span>
            <span class="chip-date">{{ s.date }}</span>
          </button>
        </div>
      </div>

      <!-- 公转位置连续滑动 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>地球公转位置</span>
          <span class="val-badge">{{ orbitAngle }}° ({{ currentMonthText }})</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          v-model.number="orbitAngle"
          @input="onAngleInput"
          class="astro-slider"
        />
        <div class="angle-ticks">
          <span>春分 0°</span>
          <span>夏至 90°</span>
          <span>秋分 180°</span>
          <span>冬至 270°</span>
        </div>
      </div>

      <!-- 直射点与昼夜遥测看板 -->
      <div class="telemetry-card">
        <div class="card-head">
          <span>📡 太阳直射点实时遥测</span>
          <span class="declination-badge">{{ declinationText }}</span>
        </div>
        <div class="telemetry-grid">
          <div class="tele-item">
            <span class="tele-label">直射纬度</span>
            <strong>{{ subsolarLat.toFixed(1) }}° {{ subsolarLat >= 0 ? 'N' : 'S' }}</strong>
          </div>
          <div class="tele-item">
            <span class="tele-label">极昼/极夜界限</span>
            <strong>{{ polarBoundary.toFixed(1) }}° 纬线以内</strong>
          </div>
          <div class="tele-item">
            <span class="tele-label">北半球昼夜</span>
            <strong>{{ dayNightStateText }}</strong>
          </div>
          <div class="tele-item">
            <span class="tele-label">公转线速度</span>
            <span>{{ orbitalSpeedText }}</span>
          </div>
        </div>
      </div>

      <!-- 操作与引导 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停公转' : '▶ 连续公转' }}
        </button>
        <button
          @click="toggleOrbitPlane"
          class="action-btn"
        >
          {{ showOrbitPlane ? '🌐 隐藏黄道面' : '🌐 显示黄道面' }}
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 核心考点动画引导' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转 · 滚轮缩放 · 双击居中</p>
    </aside>

    <div class="se-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">黄赤交角 23°26′ · 地轴空间指向恒定</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由旋转' : '锁定视角'">
          {{ locked ? '🔒 轴线锁定' : '🔓 自由旋转' }}
        </button>
      </div>
      <div class="orbit-badge">
        <span>近日点 (1月初) ↔ 远日点 (7月初)</span>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="astronomy"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: 'Copernicus 太阳高度与地貌日照', path: '/geo-labs/terrain', desc: '真实高程光照与阴影分析' }"
    :textbook-link="{ grade: '高中', book: '选择性必修1', chapter: '第一章', section: '第一节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

const SEASONS = [
  { key: 'spring', name: '春分日', icon: '🌱', date: '3月21日前后', deg: 0, lat: 0 },
  { key: 'summer', name: '夏至日', icon: '☀️', date: '6月22日前后', deg: 90, lat: 23.44 },
  { key: 'autumn', name: '秋分日', icon: '🍂', date: '9月23日前后', deg: 180, lat: 0 },
  { key: 'winter', name: '冬至日', icon: '❄️', date: '12月22日前后', deg: 270, lat: -23.44 },
]

export default {
  name: 'Seasons',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      orbitAngle: 0,
      autoRunning: false,
      locked: true,
      showOrbitPlane: true,
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      seasonList: SEASONS,
      guideSteps: [
        '【定轴公转】地轴倾斜23°26′，且北极始终指向北极星附近，空间朝向不变！',
        '【夏至日】公转到90°，太阳直射北回归线（23°26′N），北半球昼最长夜最短，北极圈内极昼！',
        '【秋分日】公转到180°，太阳直射赤道，全球各地昼夜平分，无极昼极夜！',
        '【冬至日】公转到270°，太阳直射南回归线（23°26′S），北半球昼最短夜最长，北极圈内极夜！',
        '【春分日】公转回到0°，太阳再次直射赤道，完成一个回归年的四季循环。',
      ],
      pedagogy: {
        observe: [
          '地球绕日公转时地轴空间指向保持平行（地轴倾角 23°26′ 恒定）。',
          '直射光线在北回归线（夏至）、赤道（二分）、南回归线（冬至）之间往返移动。',
          '晨昏圈与地轴夹角在 0°（二分）到 23°26′（二至）之间规律变化，产生昼夜长短差异与极昼极夜。',
        ],
        change: [
          '拖动公转位置滑杆，连续观察一年 365 天太阳直射点纬度与地表光照迁移。',
          '点击“二分二至”预设芯片，瞬间定位关键节气。',
          '开启“连续公转”，动态演示四季回归运动。',
        ],
        mechanism: [
          '根本原因：黄赤交角的存在以及地球公转过程中地轴的北端空间指向基本不变。',
          '正午太阳高度角与昼夜长短的纬度分布随直射点回归移动而发生周期性季节变化。',
          '地表不同纬度获得太阳辐射能的多少随季节变化，形成春暖、夏热、秋凉、冬寒的四季更替。',
        ],
        limitations: [
          '为便教学观察，地球大小与公转轨道半径比例进行了非等比缩放（真实地球半径仅为日地距离的 1/23500）。',
          '忽略了地球公转轨道的微小离心率（真实轨道为近日点 1.47 亿 km，远日点 1.52 亿 km 的轻微椭圆）。',
          '忽略了地轴在数万年尺度上的岁差运动。',
        ],
      },
    }
  },
  computed: {
    currentSeasonKey() {
      const deg = ((this.orbitAngle % 360) + 360) % 360
      if (Math.abs(deg - 0) < 15 || Math.abs(deg - 360) < 15) return 'spring'
      if (Math.abs(deg - 90) < 15) return 'summer'
      if (Math.abs(deg - 180) < 15) return 'autumn'
      if (Math.abs(deg - 270) < 15) return 'winter'
      return ''
    },
    subsolarLat() {
      const rad = (this.orbitAngle * Math.PI) / 180
      return Math.sin(rad) * 23.44
    },
    declinationText() {
      const lat = this.subsolarLat
      if (Math.abs(lat) < 0.2) return '直射赤道 (0°)'
      return lat > 0 ? `直射北半球 (+${lat.toFixed(1)}°)` : `直射南半球 (${lat.toFixed(1)}°)`
    },
    polarBoundary() {
      return 90 - Math.abs(this.subsolarLat)
    },
    dayNightStateText() {
      const lat = this.subsolarLat
      if (Math.abs(lat) < 0.2) return '全球昼夜等长'
      if (lat > 0) return '昼长夜短 (越北昼越长)'
      return '昼短夜长 (越北昼越短)'
    },
    currentMonthText() {
      const month = Math.floor((this.orbitAngle / 360) * 12) + 3
      const normalizedMonth = ((month - 1) % 12) + 1
      return `约 ${normalizedMonth} 月`
    },
    orbitalSpeedText() {
      const deg = ((this.orbitAngle % 360) + 360) % 360
      // winter is around Jan (perihelion), summer is around July (aphelion)
      if (deg > 240 && deg < 300) return '近日点附近 (较快 ~30.3 km/s)'
      if (deg > 60 && deg < 120) return '远日点附近 (较慢 ~29.3 km/s)'
      return '平均速度 (~29.8 km/s)'
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
      this.scene.background = new THREE.Color(0x050914)

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      this.camera.position.set(0, 24, 28)

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
        this.controls.minDistance = 10
        this.controls.maxDistance = 60
      }

      this.buildScene()
      this.animate()
    },

    buildScene() {
      // 1. Stars background
      const starCount = 300
      const starGeo = new THREE.BufferGeometry()
      const starPos = new Float32Array(starCount * 3)
      for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 140
        starPos[i + 1] = (Math.random() - 0.5) * 90
        starPos[i + 2] = (Math.random() - 0.5) * 140
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
      const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.35, transparent: true, opacity: 0.7 })
      this.scene.add(new THREE.Points(starGeo, starMat))

      // 2. Central Sun
      const sunGeo = new THREE.SphereGeometry(2.5, 32, 32)
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      this.sunMesh = new THREE.Mesh(sunGeo, sunMat)
      this.scene.add(this.sunMesh)

      // Sun glow ring
      const glowGeo = new THREE.RingGeometry(2.6, 3.8, 32)
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.25 })
      const sunGlow = new THREE.Mesh(glowGeo, glowMat)
      sunGlow.rotation.x = Math.PI / 2
      this.scene.add(sunGlow)

      const sunLight = new THREE.PointLight(0xffedd5, 4.0, 100)
      this.scene.add(sunLight)
      this.scene.add(new THREE.AmbientLight(0x1e293b, 0.6))

      // 3. Orbit Plane & Ellipse Line
      const orbitR = 12.0
      this.orbitRadius = orbitR
      const orbitCurve = new THREE.EllipseCurve(0, 0, orbitR, orbitR, 0, 2 * Math.PI, false, 0)
      const orbitPoints = orbitCurve.getPoints(120)
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
      )
      const orbitMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
      this.orbitLine = new THREE.Line(orbitGeo, orbitMat)
      this.scene.add(this.orbitLine)

      // Orbit plane disk
      const planeGeo = new THREE.RingGeometry(2.8, orbitR + 1.5, 64)
      const planeMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.05, side: THREE.DoubleSide })
      this.planeMesh = new THREE.Mesh(planeGeo, planeMat)
      this.planeMesh.rotation.x = Math.PI / 2
      this.scene.add(this.planeMesh)

      // 4. Earth Assembly (with axial tilt)
      this.earthGroup = new THREE.Group()

      const earthSphereGeo = new THREE.SphereGeometry(1.4, 32, 32)
      const earthMat = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        roughness: 0.7,
        metalness: 0.1,
      })
      this.earthSphere = new THREE.Mesh(earthSphereGeo, earthMat)

      // Obliquity of 23.44 degrees (tilted towards Z+)
      this.earthTiltGroup = new THREE.Group()
      this.earthTiltGroup.rotation.x = THREE.MathUtils.degToRad(-23.44)
      this.earthTiltGroup.add(this.earthSphere)

      // Earth rotation axis pin
      const axisGeo = new THREE.CylinderGeometry(0.03, 0.03, 4.2, 16)
      const axisMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      const axisPin = new THREE.Mesh(axisGeo, axisMat)
      this.earthTiltGroup.add(axisPin)

      // Equator Ring
      const eqGeo = new THREE.RingGeometry(1.42, 1.48, 48)
      const eqMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide })
      const eqMesh = new THREE.Mesh(eqGeo, eqMat)
      eqMesh.rotation.x = Math.PI / 2
      this.earthTiltGroup.add(eqMesh)

      // Tropic of Cancer (23.5° N) & Capricorn (23.5° S)
      const rTropic = 1.4 * Math.cos(THREE.MathUtils.degToRad(23.44))
      const yTropic = 1.4 * Math.sin(THREE.MathUtils.degToRad(23.44))
      const tropicGeo = new THREE.RingGeometry(rTropic * 1.01, rTropic * 1.05, 36)
      const tropicMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
      const cancerMesh = new THREE.Mesh(tropicGeo, tropicMat)
      cancerMesh.position.y = yTropic
      cancerMesh.rotation.x = Math.PI / 2
      this.earthTiltGroup.add(cancerMesh)

      const capricornMesh = new THREE.Mesh(tropicGeo, tropicMat)
      capricornMesh.position.y = -yTropic
      capricornMesh.rotation.x = Math.PI / 2
      this.earthTiltGroup.add(capricornMesh)

      this.earthGroup.add(this.earthTiltGroup)
      this.scene.add(this.earthGroup)

      // 5. Laser Ray from Sun to Earth center
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ])
      const rayMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 2 })
      this.rayLine = new THREE.Line(rayGeo, rayMat)
      this.scene.add(this.rayLine)

      this.updatePositions()
    },

    updatePositions() {
      if (!this.earthGroup) return
      // Spring equinox at 0° (X=orbitR, Z=0)
      // Summer solstice at 90° (X=0, Z=orbitR -> Earth tilted towards Sun)
      const rad = (this.orbitAngle * Math.PI) / 180
      const x = Math.cos(rad) * this.orbitRadius
      const z = Math.sin(rad) * this.orbitRadius
      this.earthGroup.position.set(x, 0, z)

      // Update laser ray
      if (this.rayLine) {
        const pos = this.rayLine.geometry.attributes.position
        pos.setXYZ(0, 0, 0, 0)
        pos.setXYZ(1, x, 0, z)
        pos.needsUpdate = true
      }
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)
      if (this.autoRunning) {
        this.orbitAngle = (this.orbitAngle + 0.3) % 360
        this.updatePositions()
      }
      if (this.earthSphere) {
        this.earthSphere.rotation.y += 0.02
      }
      if (this.controls) {
        this.controls.update()
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    onAngleInput() {
      this.autoRunning = false
      this.updatePositions()
    },

    selectSeason(s) {
      this.autoRunning = false
      this.orbitAngle = s.deg
      this.updatePositions()
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    toggleOrbitPlane() {
      this.showOrbitPlane = !this.showOrbitPlane
      if (this.planeMesh) this.planeMesh.visible = this.showOrbitPlane
      if (this.orbitLine) this.orbitLine.visible = this.showOrbitPlane
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.controls.maxPolarAngle = Math.PI / 2.1
          this.controls.minDistance = 10
          this.controls.maxDistance = 60
        } else {
          this.controls.maxPolarAngle = Math.PI
          this.controls.minDistance = 3
          this.controls.maxDistance = 120
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
      this.orbitAngle = 0
      this.autoRunning = false
      this.updatePositions()
      this.camera.position.set(0, 24, 28)
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

.se-panel {
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
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
}
.preset-chip.active {
  background: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
  color: #fbbf24;
}
.chip-icon { font-size: 16px; margin-bottom: 2px; }
.chip-name { font-size: 11px; font-weight: 700; }
.chip-date { font-size: 9px; opacity: 0.7; }

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

.telemetry-card {
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
.declination-badge {
  background: rgba(245, 158, 11, 0.18);
  color: #fbbf24;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 11px;
}
.telemetry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.tele-item {
  background: rgba(2, 6, 23, 0.6);
  padding: 6px 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}
.tele-label {
  font-size: 10px;
  color: #94a3b8;
}
.tele-item strong {
  font-size: 11px;
  color: #f8fafc;
  margin-top: 2px;
}
.tele-item span {
  font-size: 10px;
  color: #cbd5e1;
  margin-top: 2px;
}

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

.se-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.se-canvas-wrap canvas {
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

.orbit-badge {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.4);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  color: #38bdf8;
  font-weight: 600;
  pointer-events: none;
}

@media (max-width: 768px) {
  .astro-theme {
    flex-direction: column;
  }
  .se-panel {
    width: 100%;
  }
  .se-canvas-wrap {
    min-height: 320px;
  }
}
</style>
