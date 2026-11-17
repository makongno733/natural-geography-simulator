<template>
  <div class="tc-layout aero-theme">
    <aside class="tc-panel">
      <div class="panel-header">
        <span class="station-tag">🌪 大气边界层风洞实验舱</span>
        <h3 class="panel-title">热力环流物理模拟与等压面</h3>
      </div>

      <!-- 典型场景模式选择 -->
      <div class="tc-modes">
        <span class="ctrl-subhead">地理典型热力环流场景</span>
        <div class="preset-grid">
          <button
            v-for="p in scenarioList"
            :key="p.key"
            :class="['preset-chip', { active: currentScenarioKey === p.key }]"
            @click="selectScenario(p.key)"
          >
            <span class="chip-icon">{{ p.icon }}</span>
            <span class="chip-name">{{ p.name }}</span>
          </button>
        </div>
      </div>

      <!-- 温差强度与昼夜切换 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>冷热源温差 ΔT</span>
          <span class="val-badge">{{ tempDiff }} °C</span>
        </div>
        <input
          type="range"
          min="2"
          max="15"
          step="1"
          v-model.number="tempDiff"
          @input="onParamInput"
          class="aero-slider"
        />
        <div class="angle-ticks">
          <span>2°C 微弱</span>
          <span>8°C 显著</span>
          <span>15°C 强烈环流</span>
        </div>
      </div>

      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>昼夜时段 (海陆/山谷反转)</span>
          <span class="val-badge">{{ isDaytime ? '☀️ 白昼模式' : '🌙 黑夜模式' }}</span>
        </div>
        <div class="diurnal-toggle">
          <button
            :class="['diurnal-btn', { active: isDaytime }]"
            @click="setDaytime(true)"
          >
            ☀️ 白昼 (陆/峰吸热快)
          </button>
          <button
            :class="['diurnal-btn', { active: !isDaytime }]"
            @click="setDaytime(false)"
          >
            🌙 夜晚 (陆/峰散热快)
          </button>
        </div>
      </div>

      <!-- 大气气压剖面与等压面形变看板 -->
      <div class="isobar-card">
        <div class="card-head">
          <span>📊 气压剖面与等压面形变</span>
          <span class="isobar-badge">{{ isobarStatusText }}</span>
        </div>
        <div class="isobar-grid">
          <div class="iso-row">
            <span class="iso-pos">近地面：</span>
            <span>{{ groundPressureDesc }}</span>
          </div>
          <div class="iso-row">
            <span class="iso-pos">高空：</span>
            <span>{{ aloftPressureDesc }}</span>
          </div>
          <div class="iso-row">
            <span class="iso-pos">近地风向：</span>
            <strong class="wind-dir">{{ surfaceWindDesc }}</strong>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停粒子流' : '▶ 粒子运动' }}
        </button>
        <button
          @click="toggleIsobars"
          class="action-btn"
        >
          {{ showIsobars ? '📈 隐藏等压面' : '📈 凸显等压面' }}
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 热力环流推导核心逻辑' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转空间 · 滚轮缩放 · 双击居中</p>
    </aside>

    <div class="tc-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <div class="overlay-tags-left">
          <span class="overlay-tag">{{ currentScenarioTitle }}</span>
          <span class="overlay-sim-tag">教学仿真示意 · ΔT = {{ tempDiff }}°C</span>
        </div>
        <div class="overlay-actions-right">
          <button
            type="button"
            class="diurnal-quick-btn"
            @click="setDaytime(!isDaytime)"
          >
            {{ isDaytime ? '☀️ 当前：白昼（点击切夜晚看风向反转）' : '🌙 当前：夜晚（点击切白昼看风向反转）' }}
          </button>
          <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由旋转' : '锁定正视观察'">
            {{ locked ? '🔒 正视观察锁定' : '🔓 自由漫游' }}
          </button>
        </div>
      </div>

      <!-- 直观风向与昼夜冷热源观测读数条（解决学生难以一眼读出风向与昼夜反转的问题） -->
      <div class="tc-wind-hud" role="region" aria-label="近地面风向与冷热源实时读数">
        <div :class="['hud-zone-pill', isDaytime ? 'is-warm' : 'is-cool']">
          <span class="zone-title">{{ leftZoneTitle }}</span>
          <span class="zone-state">{{ isDaytime ? '🔥 受热膨胀上升 · 近地低压 (L)' : '❄️ 冷却收缩下沉 · 近地高压 (H)' }}</span>
        </div>

        <div class="hud-wind-center" :class="isDaytime ? 'wind-leftward' : 'wind-rightward'">
          <span class="wind-caption">近地面水平风向（高压 H → 低压 L）</span>
          <strong class="wind-main-readout">
            <span class="wind-arrow-icon" aria-hidden="true">{{ isDaytime ? '⬅️' : '➡️' }}</span>
            {{ surfaceWindDesc }}
          </strong>
        </div>

        <div :class="['hud-zone-pill', isDaytime ? 'is-cool' : 'is-warm']">
          <span class="zone-title">{{ rightZoneTitle }}</span>
          <span class="zone-state">{{ isDaytime ? '❄️ 冷却收缩下沉 · 近地高压 (H)' : '🔥 受热膨胀上升 · 近地低压 (L)' }}</span>
        </div>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="meteorology"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: 'NASA 卫星云图海陆下垫面热力特征', path: '/geo-labs/satellite', desc: '真实云层与海陆风积云线' }"
    :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第二章', section: '第二节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

const SCENARIOS = [
  { key: 'thermal-cell', name: '经典冷热槽', icon: '⚗️', title: '基础冷热不均热力环流实验槽' },
  { key: 'land-sea-breeze', name: '海陆风环流', icon: '🌊', title: '海陆热力性质差异导致的海风与陆风' },
  { key: 'valley-breeze', name: '山谷风环流', icon: '⛰️', title: '山坡与谷地上空温差导致的山风与谷风' },
  { key: 'urban-heat-island', name: '城市热岛环流', icon: '🏙️', title: '城市人为热排放在郊野间的微环流' },
]

export default {
  name: 'ThermalCirculation',
  components: {
    ModelPedagogyPanel,
  },
  props: {
    preset: {
      type: Object,
      default: () => ({}),
    },
    lessonContext: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      currentScenarioKey: 'land-sea-breeze',
      tempDiff: 8,
      isDaytime: true,
      showIsobars: true,
      autoRunning: true,
      locked: true,
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      scenarioList: SCENARIOS,
      guideSteps: [
        '【第一步·冷热不均】太阳照射不同下垫面，产生升温快慢差异（受热区 vs 冷却区）！',
        '【第二步·垂直运动】受热区空气受热膨胀上升，冷却区空气冷却收缩下沉！',
        '【第三步·气压差异】热源近地面因气体上升形成低压、高空聚集形成高压；冷源反之！',
        '【第四步·水平气压梯度力】在同一水平面上，气流由高压吹向低压，最终闭合形成完整热力环流！',
        '【等压面法则】“高凸低凹”：高压处等压面向高空凸起，低压处等压面向近地面下凹！',
      ],
      pedagogy: {
        observe: [
          '热源上方空气垂直膨胀上升，冷源上方空气垂直收缩下沉。',
          '等压面弯曲形态：“高凸低凹”——热源高空等压面上凸（高压），近地面等压线下凹（低压）。',
          '近地面水平风向始终从冷源（高压区）吹向热源（低压区）；高空相反。',
        ],
        change: [
          '调节冷热温差 ΔT（温差越大，垂直升降速率与水平风速越快）。',
          '切换“白昼”与“夜晚”，观察海陆热力对比颠倒导致的“海风（白天）”与“陆风（夜间）”互换。',
          '切换经典实验槽、海陆风、山谷风、城市热岛等典型地理场景。',
        ],
        mechanism: [
          '冷热不均是大气运动的最根本原因。受热膨胀导致密度变小而上升，冷却收缩导致密度变大而下沉。',
          '垂直运动引起同一水平面上的气压梯度差异，水平气压梯度力驱动空气由高气压流向低气压。',
          '近地面与高空形成气压性质相反的闭合环流圈。',
        ],
        limitations: [
          '本模型略去了地转偏向力（科里奥利力）的作用（局地微尺度热力环流偏转较弱，大尺度则受地转偏向力显著偏转）。',
          '忽略了摩擦力在不同下垫面粗糙度上的差异衰减。',
          '假定空气为干燥理想气体，略去了水汽相变潜热释放对对流上升的额外加热反馈。',
        ],
      },
    }
  },
  computed: {
    currentScenarioTitle() {
      const target = SCENARIOS.find(s => s.key === this.currentScenarioKey)
      return target ? target.title : '热力环流模拟'
    },
    isobarStatusText() {
      return this.showIsobars ? '等压面已显示（高凸低凹）' : '等压面已隐藏'
    },
    groundPressureDesc() {
      if (this.currentScenarioKey === 'land-sea-breeze') {
        return this.isDaytime ? '陆地气温高=低气压；海洋气温低=高气压' : '陆地散热快=高气压；海洋散热慢=低气压'
      }
      return '受热源近地为低压；冷源近地为高压'
    },
    aloftPressureDesc() {
      if (this.currentScenarioKey === 'land-sea-breeze') {
        return this.isDaytime ? '陆地上空气压升高=高气压；海洋上空=低气压' : '陆地上空=低气压；海洋上空=高气压'
      }
      return '热源高空为高压（等压面上凸）；冷源高空为低压（等压线下凹）'
    },
    surfaceWindDesc() {
      if (this.currentScenarioKey === 'land-sea-breeze') {
        return this.isDaytime ? '从海洋吹向陆地（海风）' : '从陆地吹向海洋（陆风）'
      }
      if (this.currentScenarioKey === 'valley-breeze') {
        return this.isDaytime ? '从谷底吹向山坡（谷风）' : '从山坡吹向谷底（山风）'
      }
      if (this.currentScenarioKey === 'urban-heat-island') {
        return this.isDaytime ? '由郊区吹向城市中心（市郊风）' : '由城区吹向郊区（逆环流示意）'
      }
      return this.isDaytime
        ? '从右侧冷源(H)吹向左侧热源(L)'
        : '从左侧冷源(H)吹向右侧热源(L)'
    },
    leftZoneTitle() {
      if (this.currentScenarioKey === 'land-sea-breeze') return '🏖️ 左侧：陆地'
      if (this.currentScenarioKey === 'valley-breeze') return '⛰️ 左侧：山坡'
      if (this.currentScenarioKey === 'urban-heat-island') return '🏙️ 左侧：城区'
      return '⚗️ 左侧：实验板 A'
    },
    rightZoneTitle() {
      if (this.currentScenarioKey === 'land-sea-breeze') return '🌊 右侧：海洋'
      if (this.currentScenarioKey === 'valley-breeze') return '🏞️ 右侧：谷底'
      if (this.currentScenarioKey === 'urban-heat-island') return '🌲 右侧：郊区'
      return '⚗️ 右侧：实验板 B'
    },
  },
  mounted() {
    const queryPreset = this.$route?.query?.preset || this.$route?.query?.scenario
    if (queryPreset === 'land-sea-breeze' || this.preset?.id === 'land-sea-breeze') {
      this.currentScenarioKey = 'land-sea-breeze'
    } else if (queryPreset === 'valley-breeze' || this.preset?.id === 'valley-breeze') {
      this.currentScenarioKey = 'valley-breeze'
    } else if (queryPreset === 'urban-heat-island' || this.preset?.id === 'urban-heat-island') {
      this.currentScenarioKey = 'urban-heat-island'
    } else if (queryPreset === 'thermal-cell') {
      this.currentScenarioKey = 'thermal-cell'
    }
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
      this.camera.position.set(0, 8, 22)

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setSize(w, h)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.shadowMap.enabled = true

      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.06
      this.controls.target.set(0, 4.5, 0)
      if (this.locked) {
        this.controls.maxPolarAngle = Math.PI / 2.05
        this.controls.minDistance = 8
        this.controls.maxDistance = 45
      }

      this.buildThermalCirculationScene()
      this.animate()
    },

    buildThermalCirculationScene() {
      // 1. Ambient & directional light
      const sun = new THREE.DirectionalLight(0xfff8e7, 2.5)
      sun.position.set(5, 20, 10)
      this.scene.add(sun)
      this.scene.add(new THREE.AmbientLight(0x334155, 1.2))

      // 2. Base platform
      const baseGeo = new THREE.BoxGeometry(18, 0.6, 8)
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
      const base = new THREE.Mesh(baseGeo, baseMat)
      base.position.y = -0.3
      this.scene.add(base)

      // Heat plate (left) and Cold plate (right)
      this.plateGroup = new THREE.Group()
      this.scene.add(this.plateGroup)

      // 3. Air parcel particles
      this.particleCount = 140
      this.particles = []
      this.particleGeo = new THREE.SphereGeometry(0.14, 12, 12)

      for (let i = 0; i < this.particleCount; i++) {
        const t = (i / this.particleCount) * Math.PI * 2
        const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        const mesh = new THREE.Mesh(this.particleGeo, pMat)
        mesh.userData = { t: t, speed: 0.012 + Math.random() * 0.006, offsetZ: (Math.random() - 0.5) * 4 }
        this.particles.push(mesh)
        this.scene.add(mesh)
      }

      // 4. Isobar curves group
      this.isobarGroup = new THREE.Group()
      this.scene.add(this.isobarGroup)

      // 5. High / Low pressure billboard labels & directional wind vector arrows
      this.labelGroup = new THREE.Group()
      this.scene.add(this.labelGroup)

      this.rebuildPlatesAndLabels()
    },

    rebuildPlatesAndLabels() {
      while (this.plateGroup.children.length > 0) {
        const c = this.plateGroup.children[0]
        if (c.geometry) c.geometry.dispose()
        this.plateGroup.remove(c)
      }
      while (this.labelGroup.children.length > 0) {
        const c = this.labelGroup.children[0]
        if (c.geometry) c.geometry.dispose()
        this.labelGroup.remove(c)
      }

      // Left is Heat source by default in daytime, Cold in nighttime
      const leftIsHeat = this.isDaytime
      const leftColor = leftIsHeat ? 0xef4444 : 0x0284c7
      const rightColor = leftIsHeat ? 0x0284c7 : 0xef4444

      const plateGeo = new THREE.BoxGeometry(7.5, 0.25, 7.5)
      const p1 = new THREE.Mesh(plateGeo, new THREE.MeshStandardMaterial({ color: leftColor, roughness: 0.6 }))
      p1.position.set(-4.5, 0.1, 0)
      this.plateGroup.add(p1)

      const p2 = new THREE.Mesh(plateGeo, new THREE.MeshStandardMaterial({ color: rightColor, roughness: 0.6 }))
      p2.position.set(4.5, 0.1, 0)
      this.plateGroup.add(p2)

      // Add ground & aloft pressure badges
      if (leftIsHeat) {
        this.createPressureSprite('低压 (L)', -4.5, 0.9, 0, '#f87171')
        this.createPressureSprite('高压 (H)', -4.5, 8.5, 0, '#fbbf24')
        this.createPressureSprite('高压 (H)', 4.5, 0.9, 0, '#38bdf8')
        this.createPressureSprite('低压 (L)', 4.5, 8.5, 0, '#94a3b8')
      } else {
        this.createPressureSprite('高压 (H)', -4.5, 0.9, 0, '#38bdf8')
        this.createPressureSprite('低压 (L)', -4.5, 8.5, 0, '#94a3b8')
        this.createPressureSprite('低压 (L)', 4.5, 0.9, 0, '#f87171')
        this.createPressureSprite('高压 (H)', 4.5, 8.5, 0, '#fbbf24')
      }

      // 3D 近地面风向与高空风向矢量箭头（让学生一眼看清 H → L 风向）
      const surfaceDir = new THREE.Vector3(leftIsHeat ? -1 : 1, 0, 0)
      const surfaceOrigin = new THREE.Vector3(leftIsHeat ? 2.4 : -2.4, 1.35, 1.6)
      const surfaceArrow = new THREE.ArrowHelper(surfaceDir, surfaceOrigin, 4.8, 0x38bdf8, 0.9, 0.55)
      this.labelGroup.add(surfaceArrow)

      const aloftDir = new THREE.Vector3(leftIsHeat ? 1 : -1, 0, 0)
      const aloftOrigin = new THREE.Vector3(leftIsHeat ? -2.4 : 2.4, 7.65, 1.6)
      const aloftArrow = new THREE.ArrowHelper(aloftDir, aloftOrigin, 4.8, 0xfbbf24, 0.85, 0.5)
      this.labelGroup.add(aloftArrow)

      this.createPressureSprite(
        leftIsHeat ? '⬅ 近地面风 (H→L)' : '➡ 近地面风 (H→L)',
        0,
        2.15,
        1.6,
        '#7dd3fc',
        260,
        3.6
      )

      this.rebuildIsobars()
    },

    createPressureSprite(text, x, y, z, color, width = 160, scaleX = 2.4) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = 64
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = color
      ctx.font = 'bold 26px "Noto Serif SC", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, width / 2, 32)

      const tex = new THREE.CanvasTexture(canvas)
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true })
      const sprite = new THREE.Sprite(mat)
      sprite.position.set(x, y, z)
      sprite.scale.set(scaleX, 0.9, 1)
      this.labelGroup.add(sprite)
    },

    rebuildIsobars() {
      while (this.isobarGroup.children.length > 0) {
        const c = this.isobarGroup.children[0]
        if (c.geometry) c.geometry.dispose()
        this.isobarGroup.remove(c)
      }

      if (!this.showIsobars) return

      const leftIsHeat = this.isDaytime
      // Ground Isobar (Near Y = 2.0)
      // High P goes UP, Low P goes DOWN
      const groundPts = []
      for (let x = -7.5; x <= 7.5; x += 0.5) {
        let dy = leftIsHeat ? (x < 0 ? -0.45 : 0.45) : (x < 0 ? 0.45 : -0.45)
        // smooth bell curve
        dy = dy * Math.cos((x / 7.5) * (Math.PI / 2))
        groundPts.push(new THREE.Vector3(x, 2.0 + dy, 0))
      }
      const gIsoGeo = new THREE.BufferGeometry().setFromPoints(groundPts)
      const gIsoLine = new THREE.Line(gIsoGeo, new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.7 }))
      this.isobarGroup.add(gIsoLine)

      // Aloft Isobar (Near Y = 7.0)
      // Heat aloft is High P (UP), Cold aloft is Low P (DOWN)
      const aloftPts = []
      for (let x = -7.5; x <= 7.5; x += 0.5) {
        let dy = leftIsHeat ? (x < 0 ? 0.55 : -0.55) : (x < 0 ? -0.55 : 0.55)
        dy = dy * Math.cos((x / 7.5) * (Math.PI / 2))
        aloftPts.push(new THREE.Vector3(x, 7.0 + dy, 0))
      }
      const aIsoGeo = new THREE.BufferGeometry().setFromPoints(aloftPts)
      const aIsoLine = new THREE.Line(aIsoGeo, new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85 }))
      this.isobarGroup.add(aIsoLine)
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)

      if (this.autoRunning && this.particles.length > 0) {
        const leftIsHeat = this.isDaytime
        // When left is heat: left rises (dy > 0), moves right aloft (dx > 0), sinks right (dy < 0), moves left surface (dx < 0)
        // Clockwise in X-Y plane!
        const direction = leftIsHeat ? 1 : -1
        const speedScale = (this.tempDiff / 8) * 0.015

        this.particles.forEach((p) => {
          p.userData.t = (p.userData.t + p.userData.speed * speedScale * direction + Math.PI * 2) % (Math.PI * 2)
          const t = p.userData.t

          // Rectangular rounded circulation path:
          // X in [-4.5, 4.5], Y in [1.5, 7.5]
          const a = 5.2
          const b = 3.2
          const centerY = 4.5

          const x = Math.cos(t) * a
          const y = centerY + Math.sin(t) * b
          p.position.set(x, y, p.userData.offsetZ)

          // Color tint: warm when rising (y > 4.5 on heat side), cool when sinking
          if ((leftIsHeat && x < 0) || (!leftIsHeat && x > 0)) {
            p.material.color.setHex(0xf87171) // Rising warm
          } else {
            p.material.color.setHex(0x38bdf8) // Sinking cool
          }
        })
      }

      if (this.controls) this.controls.update()
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    selectScenario(key) {
      this.currentScenarioKey = key
      this.rebuildPlatesAndLabels()
    },

    setDaytime(day) {
      this.isDaytime = day
      this.rebuildPlatesAndLabels()
    },

    onParamInput() {
      this.rebuildIsobars()
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    toggleIsobars() {
      this.showIsobars = !this.showIsobars
      this.rebuildIsobars()
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.controls.maxPolarAngle = Math.PI / 2.05
          this.controls.minDistance = 8
          this.controls.maxDistance = 45
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
      this.currentScenarioKey = 'land-sea-breeze'
      this.tempDiff = 8
      this.isDaytime = true
      this.showIsobars = true
      this.autoRunning = true
      this.rebuildPlatesAndLabels()
      this.camera.position.set(0, 8, 22)
      this.controls.target.set(0, 4.5, 0)
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

.tc-panel {
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
.angle-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #64748b;
  margin-top: 4px;
}

.diurnal-toggle {
  display: flex;
  gap: 6px;
}
.diurnal-btn {
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
.diurnal-btn.active {
  background: rgba(2, 132, 199, 0.25);
  border-color: #0284c7;
  color: #38bdf8;
  font-weight: 700;
}

.isobar-card {
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
.isobar-badge {
  background: rgba(2, 132, 199, 0.2);
  color: #38bdf8;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
}
.isobar-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
}
.iso-row {
  display: flex;
  justify-content: space-between;
  color: #cbd5e1;
}
.iso-pos { color: #94a3b8; }
.wind-dir { color: #38bdf8; font-weight: 700; }

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

.tc-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.tc-canvas-wrap canvas {
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
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  pointer-events: none;
}
.overlay-tags-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.overlay-tag {
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.16);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #f8fafc;
}
.overlay-sim-tag {
  background: rgba(245, 158, 11, 0.22);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fde68a;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.overlay-actions-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.diurnal-quick-btn {
  pointer-events: auto;
  background: rgba(2, 132, 199, 0.85);
  border: 1px solid #7dd3fc;
  color: #ffffff;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, background 0.15s ease;
}
.diurnal-quick-btn:hover {
  background: #0284c7;
  transform: translateY(-1px);
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

.tc-wind-hud {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  display: grid;
  grid-template-columns: minmax(140px, 1fr) minmax(200px, 1.35fr) minmax(140px, 1fr);
  gap: 8px;
  align-items: stretch;
  pointer-events: none;
}

.hud-zone-pill {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 7px 11px;
  border-radius: 10px;
  backdrop-filter: blur(8px);
}

.hud-zone-pill.is-warm {
  background: rgba(127, 29, 29, 0.78);
  border: 1px solid rgba(248, 113, 113, 0.65);
  color: #fee2e2;
}

.hud-zone-pill.is-cool {
  background: rgba(12, 74, 110, 0.78);
  border: 1px solid rgba(56, 189, 248, 0.65);
  color: #e0f2fe;
}

.zone-title {
  font-size: 11.5px;
  font-weight: 800;
}

.zone-state {
  font-size: 10.5px;
  opacity: 0.92;
}

.hud-wind-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 7px 12px;
  border-radius: 10px;
  background: rgba(7, 24, 42, 0.9);
  border: 1.5px solid rgba(56, 189, 248, 0.75);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.wind-caption {
  font-size: 10px;
  color: #93c5fd;
  font-weight: 600;
}

.wind-main-readout {
  font-size: 12.5px;
  color: #ffffff;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

@media (max-width: 768px) {
  .aero-theme {
    flex-direction: column;
  }
  .tc-panel {
    width: 100%;
  }
  .tc-canvas-wrap {
    min-height: 360px;
  }
  .tc-wind-hud {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  .hud-zone-pill {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 5px 10px;
  }
}
</style>
