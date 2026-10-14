<template>
  <div class="sm-layout astro-theme">
    <aside class="sm-panel">
      <div class="panel-header">
        <span class="station-tag">🧭 地平天球与日晷观测台</span>
        <h3 class="panel-title">太阳周日视运动与高度角</h3>
      </div>

      <!-- 典型地理纬度预设 -->
      <div class="lat-presets">
        <span class="ctrl-subhead">典型观测地纬度</span>
        <div class="preset-grid">
          <button
            v-for="p in presetPlaces"
            :key="p.name"
            :class="['preset-chip', { active: activePlace === p.name }]"
            @click="applyPlace(p)"
          >
            <span class="chip-name">{{ p.name }}</span>
            <span class="chip-val">{{ Math.abs(p.lat) }}°{{ p.lat >= 0 ? 'N' : 'S' }}</span>
          </button>
        </div>
      </div>

      <!-- 纬度与节气滑块 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>观测点地理纬度 φ</span>
          <span class="val-badge">{{ latitude }}°{{ latitude >= 0 ? 'N' : 'S' }}</span>
        </div>
        <input
          type="range"
          min="-90"
          max="90"
          step="1"
          v-model.number="latitude"
          @input="onParamInput"
          class="astro-slider"
        />
        <div class="angle-ticks">
          <span>90°S 南极</span>
          <span>0° 赤道</span>
          <span>40°N 北京</span>
          <span>90°N 北极</span>
        </div>
      </div>

      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>节气 (太阳赤纬 δ)</span>
          <span class="val-badge">{{ currentSeasonData.name }} ({{ currentSeasonData.declination }}°)</span>
        </div>
        <div class="season-chips">
          <button
            v-for="s in seasons"
            :key="s.key"
            :class="['season-chip', { active: seasonKey === s.key }]"
            @click="selectSeason(s.key)"
          >
            {{ s.name }}
          </button>
        </div>
      </div>

      <!-- 日晷与太阳几何遥测 -->
      <div class="sundial-card">
        <div class="card-head">
          <span>☀️ 太阳高度与日晷竿影</span>
          <span class="alt-badge">正午 H: {{ noonAltitude.toFixed(1) }}°</span>
        </div>
        <div class="sundial-grid">
          <div class="sun-item">
            <span class="s-label">日出方位：</span>
            <strong>{{ sunriseAzimuthText }}</strong>
          </div>
          <div class="sun-item">
            <span class="s-label">日落方位：</span>
            <strong>{{ sunsetAzimuthText }}</strong>
          </div>
          <div class="sun-item">
            <span class="s-label">正午竿影朝向：</span>
            <strong>{{ shadowDirectionText }}</strong>
          </div>
          <div class="sun-item">
            <span class="s-label">昼长估计：</span>
            <span>{{ daylengthEstimateText }}</span>
          </div>
        </div>
      </div>

      <!-- 控制操作 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停日周运动' : '▶ 太阳周日运转' }}
        </button>
        <button
          @click="resetTime"
          class="action-btn"
        >
          🕛 对齐正午时刻
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 正午高度与视运动规律讲解' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转天球 · 滚轮缩放 · 双击复位</p>
    </aside>

    <div class="sm-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">地平坐标系 · 天顶/地轴/日晷投影</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由旋转' : '锁定视角'">
          {{ locked ? '🔒 轴线锁定' : '🔓 自由旋转' }}
        </button>
      </div>
      <div class="gnomon-tag">
        <span>立竿见影 · 影子朝向与太阳方位相反</span>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="astronomy"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: '珠峰地区太阳高度角与山地阴影', path: '/geo-labs/terrain', desc: '真实高程DEM光照模拟' }"
    :textbook-link="{ grade: '高中', book: '选择性必修1', chapter: '第一章', section: '第二节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

const SEASONS = [
  { key: 'summer', name: '夏至', declination: 23.44 },
  { key: 'spring', name: '春分/秋分', declination: 0.0 },
  { key: 'winter', name: '冬至', declination: -23.44 },
]

export default {
  name: 'SolarMotion',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      latitude: 40,
      seasonKey: 'summer',
      activePlace: '北京',
      timeOfDayDeg: 180, // 0 = midnight, 90 = 6am, 180 = noon, 270 = 6pm
      autoRunning: true,
      locked: true,
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      presetPlaces: [
        { name: '赤道', lat: 0 },
        { name: '广州', lat: 23.1 },
        { name: '北京', lat: 39.9 },
        { name: '漠河', lat: 53.5 },
        { name: '北极点', lat: 90 },
        { name: '悉尼', lat: -33.9 },
      ],
      seasons: SEASONS,
      guideSteps: [
        '【正午太阳高度公式】H = 90° - |φ - δ|（φ为当地纬度，δ为当日太阳赤纬）！',
        '【视运动倾斜度】北半球纬度越高，太阳视运动周日圈越向南倾斜，天顶距越大！',
        '【升落方位规律】太阳直射北半球时全球各地东北升、西北落；直射赤道时正东升、正西落！',
        '【日晷竿影长短】正午时太阳高度角最大，立杆影子最短；夏至最短、冬至最长！',
      ],
      pedagogy: {
        observe: [
          '观测天球中太阳轨迹圈的倾角与观测者纬度的互余关系。',
          '正午太阳位于正南方或正北方时立杆影子的长度与朝向。',
          '北极点夏至日太阳高度整日恒为 23°26′ 且不落入地平线（极昼与平移视运动）。',
        ],
        change: [
          '拖动地理纬度滑条，对比赤道、温带北京与北极的周日轨迹差异。',
          '切换夏至、二分、冬至节气，观察太阳升落方位角与昼夜弧长变化。',
          '开启自动运转或快速对齐正午时刻，观测立杆影子的连续形变。',
        ],
        mechanism: [
          '太阳周日视运动是地球自西向东自转的直接视反应（天球自东向西相对运转）。',
          '正午太阳高度角取决于纬度与太阳直射点纬度（赤纬）的差值（H = 90° - 纬度差）。',
          '升落方位角由地平圈与太阳周日圈的相交截线决定。',
        ],
        limitations: [
          '忽略了大气折射对近地平线太阳视高度的抬升（地平线上约抬升 34′，使实际日出提前、日落推迟）。',
          '假定观测地为平坦无遮挡开阔地平圈（未考虑山峦与城市建筑物遮挡）。',
          '忽略了真太阳时与平太阳时之间的“时差”（Equation of Time）。',
        ],
      },
    }
  },
  computed: {
    currentSeasonData() {
      return SEASONS.find(s => s.key === this.seasonKey) || SEASONS[0]
    },
    noonAltitude() {
      const lat = this.latitude
      const dec = this.currentSeasonData.declination
      const h = 90 - Math.abs(lat - dec)
      return Math.max(0, Math.min(90, h))
    },
    sunriseAzimuthText() {
      const dec = this.currentSeasonData.declination
      if (Math.abs(this.latitude) > 66.5 && Math.sign(this.latitude) === Math.sign(dec)) {
        return '极昼无日落/日出'
      }
      if (Math.abs(this.latitude) > 66.5 && Math.sign(this.latitude) !== Math.sign(dec)) {
        return '极夜无日出'
      }
      if (dec > 0.5) return '东北升起'
      if (dec < -0.5) return '东南升起'
      return '正东升起 (90°)'
    },
    sunsetAzimuthText() {
      const dec = this.currentSeasonData.declination
      if (Math.abs(this.latitude) > 66.5 && Math.sign(this.latitude) === Math.sign(dec)) {
        return '极昼不落'
      }
      if (Math.abs(this.latitude) > 66.5 && Math.sign(this.latitude) !== Math.sign(dec)) {
        return '极夜无日落'
      }
      if (dec > 0.5) return '西北落下'
      if (dec < -0.5) return '西南落下'
      return '正西落下 (270°)'
    },
    shadowDirectionText() {
      const lat = this.latitude
      const dec = this.currentSeasonData.declination
      if (lat > dec) return '影子指向正北'
      if (lat < dec) return '影子指向正南'
      return '直射头顶（无影）'
    },
    daylengthEstimateText() {
      const lat = this.latitude
      const dec = this.currentSeasonData.declination
      const phi = THREE.MathUtils.degToRad(lat)
      const delta = THREE.MathUtils.degToRad(dec)
      const cosH = -Math.tan(phi) * Math.tan(delta)
      if (cosH <= -1) return '24 小时 (极昼)'
      if (cosH >= 1) return '0 小时 (极夜)'
      const hHour = (Math.acos(cosH) * 24) / Math.PI
      return `约 ${hHour.toFixed(1)} 小时`
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
      this.scene.background = new THREE.Color(0x060914)

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      this.camera.position.set(0, 16, 22)

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setSize(w, h)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.shadowMap.enabled = true

      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.06
      this.controls.target.set(0, 1.5, 0)
      if (this.locked) {
        this.controls.maxPolarAngle = Math.PI / 2.05
        this.controls.minDistance = 8
        this.controls.maxDistance = 50
      }

      this.buildDomeEnvironment()
      this.animate()
    },

    buildDomeEnvironment() {
      // 1. Stars background
      const starCount = 280
      const starGeo = new THREE.BufferGeometry()
      const starPos = new Float32Array(starCount * 3)
      for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 120
        starPos[i + 1] = Math.random() * 60
        starPos[i + 2] = (Math.random() - 0.5) * 120
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
      this.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x64748b, size: 0.3 })))

      // 2. Horizon ground disk & compass
      const groundGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.2, 48)
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 })
      const ground = new THREE.Mesh(groundGeo, groundMat)
      ground.position.y = -0.1
      ground.receiveShadow = true
      this.scene.add(ground)

      // Compass Ring
      const ringGeo = new THREE.RingGeometry(8.4, 8.6, 64)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      this.scene.add(ring)

      // Cardinal direction indicators (N: +Z, S: -Z, E: +X, W: -X)
      this.addTextMarker('北 (N)', 0, 0, 9.2, '#38bdf8')
      this.addTextMarker('南 (S)', 0, 0, -9.2, '#f43f5e')
      this.addTextMarker('东 (E)', 9.2, 0, 0, '#10b981')
      this.addTextMarker('西 (W)', -9.2, 0, 0, '#fbbf24')

      // 3. Central Gnomon (立竿)
      const gnomonGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 16)
      const gnomonMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 })
      const gnomon = new THREE.Mesh(gnomonGeo, gnomonMat)
      gnomon.position.y = 1.25
      gnomon.castShadow = true
      this.scene.add(gnomon)

      // 4. Gnomon Shadow line on ground
      const shadowGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.02, 0),
        new THREE.Vector3(0, 0.02, 0),
      ])
      const shadowMat = new THREE.LineBasicMaterial({ color: 0x020617, linewidth: 4 })
      this.shadowLine = new THREE.Line(shadowGeo, shadowMat)
      this.scene.add(this.shadowLine)

      // 5. Celestial Sphere Dome (transparent)
      const domeGeo = new THREE.SphereGeometry(8.5, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2)
      const domeMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      })
      this.scene.add(new THREE.Mesh(domeGeo, domeMat))

      // 6. Solar path arc group
      this.pathGroup = new THREE.Group()
      this.scene.add(this.pathGroup)

      // 7. Sun mesh
      const sunGeo = new THREE.SphereGeometry(0.55, 24, 24)
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      this.sunMesh = new THREE.Mesh(sunGeo, sunMat)
      this.scene.add(this.sunMesh)

      // Sun directional light with shadows
      this.sunLight = new THREE.DirectionalLight(0xffedd5, 3.2)
      this.sunLight.castShadow = true
      this.scene.add(this.sunLight)
      this.scene.add(new THREE.AmbientLight(0x1e293b, 0.7))

      this.rebuildSolarPath()
    },

    addTextMarker(text, x, y, z, color) {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 64
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = color
      ctx.font = 'bold 26px "Noto Serif SC", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 64, 32)

      const tex = new THREE.CanvasTexture(canvas)
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true })
      const sprite = new THREE.Sprite(mat)
      sprite.position.set(x, y + 0.3, z)
      sprite.scale.set(2.0, 1.0, 1)
      this.scene.add(sprite)
    },

    rebuildSolarPath() {
      while (this.pathGroup.children.length > 0) {
        const c = this.pathGroup.children[0]
        if (c.geometry) c.geometry.dispose()
        this.pathGroup.remove(c)
      }

      const R = 8.5
      const phi = THREE.MathUtils.degToRad(this.latitude)
      const delta = THREE.MathUtils.degToRad(this.currentSeasonData.declination)

      // Calculate 360 degree diurnal path points
      const pts = []
      for (let hourDeg = 0; hourDeg <= 360; hourDeg += 3) {
        const t = THREE.MathUtils.degToRad(hourDeg)
        // sin(h) = sin(phi)*sin(delta) + cos(phi)*cos(delta)*cos(t)
        const sinH = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(t)
        const hRad = Math.asin(Math.max(-1, Math.min(1, sinH)))

        // cos(A) = (sin(delta) - sin(phi)*sin(h)) / (cos(phi)*cos(h))
        const cosH = Math.cos(hRad)
        let cosA = 0
        if (Math.abs(cosH) > 1e-4 && Math.abs(Math.cos(phi)) > 1e-4) {
          cosA = (Math.sin(delta) - Math.sin(phi) * sinH) / (Math.cos(phi) * cosH)
        }
        cosA = Math.max(-1, Math.min(1, cosA))
        let A = Math.acos(cosA)
        if (Math.sin(t) > 0) A = 2 * Math.PI - A // Afternoon

        // Convert azimuth & altitude to 3D coords:
        // North is +Z (A=0), East is +X (A=90), South is -Z (A=180), West is -X (A=270)
        const y = R * Math.sin(hRad)
        const rHoriz = R * Math.cos(hRad)
        const x = rHoriz * Math.sin(A)
        const z = rHoriz * Math.cos(A)

        // Only show daytime above horizon or slightly below
        if (y >= -0.2) {
          pts.push(new THREE.Vector3(x, Math.max(0.01, y), z))
        }
      }

      if (pts.length > 1) {
        const pathGeo = new THREE.BufferGeometry().setFromPoints(pts)
        const pathMat = new THREE.LineBasicMaterial({
          color: this.seasonKey === 'summer' ? 0xf43f5e : (this.seasonKey === 'winter' ? 0x38bdf8 : 0xfbbf24),
          linewidth: 2,
        })
        this.pathGroup.add(new THREE.Line(pathGeo, pathMat))
      }

      this.updateSunPosition()
    },

    updateSunPosition() {
      if (!this.sunMesh) return
      const R = 8.5
      const phi = THREE.MathUtils.degToRad(this.latitude)
      const delta = THREE.MathUtils.degToRad(this.currentSeasonData.declination)
      const t = THREE.MathUtils.degToRad(this.timeOfDayDeg)

      const sinH = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(t)
      const hRad = Math.asin(Math.max(-1, Math.min(1, sinH)))
      const cosH = Math.cos(hRad)

      let cosA = 0
      if (Math.abs(cosH) > 1e-4 && Math.abs(Math.cos(phi)) > 1e-4) {
        cosA = (Math.sin(delta) - Math.sin(phi) * sinH) / (Math.cos(phi) * cosH)
      }
      cosA = Math.max(-1, Math.min(1, cosA))
      let A = Math.acos(cosA)
      if (Math.sin(t) > 0) A = 2 * Math.PI - A

      const y = R * Math.sin(hRad)
      const rHoriz = R * Math.cos(hRad)
      const x = rHoriz * Math.sin(A)
      const z = rHoriz * Math.cos(A)

      this.sunMesh.position.set(x, Math.max(-0.5, y), z)
      this.sunLight.position.set(x * 2, Math.max(0.1, y * 2), z * 2)

      // Update gnomon shadow (opposite to sun's horizontal azimuth)
      if (this.shadowLine) {
        const gnomonHeight = 2.5
        let shadowLength = 0
        if (y > 0.05) {
          shadowLength = gnomonHeight / Math.tan(Math.max(0.05, hRad))
          shadowLength = Math.min(8.0, shadowLength) // clamp to disk
        }
        const sX = -Math.sin(A) * shadowLength
        const sZ = -Math.cos(A) * shadowLength

        const pos = this.shadowLine.geometry.attributes.position
        pos.setXYZ(0, 0, 0.05, 0)
        pos.setXYZ(1, sX, 0.05, sZ)
        pos.needsUpdate = true
        this.shadowLine.visible = y > 0
      }
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)
      if (this.autoRunning) {
        this.timeOfDayDeg = (this.timeOfDayDeg + 0.4) % 360
        this.updateSunPosition()
      }
      if (this.controls) {
        this.controls.update()
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    onParamInput() {
      this.activePlace = ''
      this.rebuildSolarPath()
    },

    applyPlace(p) {
      this.activePlace = p.name
      this.latitude = p.lat
      this.rebuildSolarPath()
    },

    selectSeason(key) {
      this.seasonKey = key
      this.rebuildSolarPath()
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    resetTime() {
      this.timeOfDayDeg = 0 // solar noon (cos(0) = 1)
      this.autoRunning = false
      this.updateSunPosition()
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.controls.maxPolarAngle = Math.PI / 2.05
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
      this.latitude = 40
      this.seasonKey = 'summer'
      this.activePlace = '北京'
      this.timeOfDayDeg = 0
      this.autoRunning = true
      this.rebuildSolarPath()
      this.camera.position.set(0, 16, 22)
      this.controls.target.set(0, 1.5, 0)
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

.sm-panel {
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

.season-chips {
  display: flex;
  gap: 6px;
}
.season-chip {
  flex: 1;
  padding: 6px 2px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}
.season-chip.active {
  background: rgba(245, 158, 11, 0.2);
  border-color: #f59e0b;
  color: #fbbf24;
  font-weight: 700;
}

.sundial-card {
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
.alt-badge {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 11px;
}
.sundial-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
}
.sun-item {
  display: flex;
  justify-content: space-between;
  color: #cbd5e1;
}
.s-label { color: #94a3b8; }

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

.sm-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.sm-canvas-wrap canvas {
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

.gnomon-tag {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(245, 158, 11, 0.4);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  color: #fbbf24;
  font-weight: 600;
  pointer-events: none;
}

@media (max-width: 768px) {
  .astro-theme {
    flex-direction: column;
  }
  .sm-panel {
    width: 100%;
  }
  .sm-canvas-wrap {
    min-height: 320px;
  }
}
</style>
