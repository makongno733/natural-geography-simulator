<template>
  <div id="app">
    <header class="topbar">
      <router-link to="/" class="back-link">← 返回首页</router-link>
      <div class="mode-toggle">
        <button :class="['mode-btn', { active: mode === 'simple' }]" @click="switchMode('simple')">📖 简单模式（高中）</button>
        <button :class="['mode-btn', { active: mode === 'professional' }]" @click="switchMode('professional')">🔭 专业模式（宇宙坐标系）</button>
        <button :class="['mode-btn', { active: mode === 'deepspace' }]" @click="switchMode('deepspace')">🚀 深空探索</button>
      </div>
      <span class="chapter-ref">第一章 · 宇宙中的地球</span>
    </header>
    <div id="main">
      <div id="canvas-container" ref="containerRef">
        <div class="controls-hint">🖱 拖拽旋转 · 滚轮缩放</div>
      </div>
      <aside id="info-panel">
        <!-- Simple mode -->
        <div v-show="mode === 'simple'" class="info-content">
          <h2>🌍 地球的圈层结构</h2>
          <p>地球内部从外到内分为四个圈层：</p>
          <ul class="layers-list">
            <li><span class="dot" style="background:#4a90d9"></span><strong>地壳</strong><span>平均厚度约 17km</span></li>
            <li><span class="dot" style="background:#e67e22"></span><strong>地幔</strong><span>厚约 2900km</span></li>
            <li><span class="dot" style="background:#f39c12"></span><strong>外核</strong><span>液态铁镍合金，产生磁场</span></li>
            <li><span class="dot" style="background:#f1c40f"></span><strong>内核</strong><span>固态铁镍球，半径 1220km</span></li>
          </ul>
          <h3>知识点</h3>
          <p>• <span class="info-term"><span class="info-icon">ⓘ</span><span class="info-popup"><b>莫霍洛维奇不连续面</b>，1909年发现，地壳与地幔的分界面，深度约33km，地震波在此速度突变。</span>莫霍界面</span>：地壳与地幔的分界面<br/>
          • <span class="info-term"><span class="info-icon">ⓘ</span><span class="info-popup"><b>古登堡不连续面</b>，1914年发现，地下2900km处，横波消失，证明外核为液态。</span>古登堡界面</span>：地幔与地核的分界面<br/>
          • <span class="info-term"><span class="info-icon">ⓘ</span><span class="info-popup"><b>岩石圈</b> = 地壳 + 上地幔顶部固态岩石，厚约100-150km。软流层位于上地幔上部，部分熔融状态。</span>岩石圈</span> = 地壳 + 上地幔顶部</p>
        </div>
        <!-- Professional mode -->
        <div v-show="mode === 'professional'" class="info-content">
          <h2>🔭 宇宙坐标系 — 多天体示例</h2>
          <p>选择坐标系，每个天体显示对应坐标指示线。</p>
          <div class="coord-btns">
            <button v-for="c in coordSystems" :key="c.id" :class="['coord-btn', { active: activeCoord === c.id }]" @click="switchCoord(c.id)">{{ c.label }}</button>
          </div>
          <div id="coord-description" v-html="coordDesc"></div>
          <div class="objects-section">
            <h3>✨ 示例天体（点击选择）</h3>
            <div id="objects-detail">
              <div v-for="obj in celestialObjects" :key="obj.id"
                :class="['obj-item', { selected: selectedObj === obj.id }]"
                @click="selectObj(obj.id)">
                <span class="obj-dot" :style="{background: obj.labelColor}"></span>
                <div class="obj-info">
                  <strong :style="{color: selectedObj === obj.id ? '#fff' : obj.labelColor}">{{ obj.name }}</strong>
                  <span class="obj-type">{{ obj.type }}</span>
                </div>
                <span class="obj-coord" v-if="currentCoords[obj.id]">{{ currentCoords[obj.id] }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Deep space mode -->
        <div v-show="mode === 'deepspace'" class="info-content" style="height:100%">
          <h2>🚀 深空探索</h2>
          <div class="space-scroll">
            <h3>🌌 太阳系概览</h3>
            <p>行星绕太阳公转，轨道近似椭圆。公转速度随距离增大而减小。</p>
            <div class="planet-table">
              <div class="pt-header"><span>行星</span><span>轨道半径(AU)</span><span>公转周期</span><span>轨道速度</span></div>
              <div v-for="p in planetData" :key="p.name" class="pt-row">
                <span>{{ p.name }}</span><span>{{ p.au }}</span><span>{{ p.period }}yr</span><span>{{ p.orbitV }}km/s</span>
              </div>
            </div>
            <h3>🛸 地火转移轨道</h3>
            <p>霍曼转移轨道：从低轨到高轨最节能的路径。</p>
            <p><strong>关键速度：</strong><br/>
            • 第一宇宙速度 <span class="coord-tag">7.9 km/s</span> 环绕地球<br/>
            • 第二宇宙速度 <span class="coord-tag">11.2 km/s</span> 逃离地球<br/>
            • 转移速度 <span class="coord-tag">~11.6 km/s</span> 飞往火星</p>
            <p><strong>转移时间：</strong>约 <span class="coord-tag">259 天</span></p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'

const containerRef = ref(null)
const mode = ref('simple')
const activeCoord = ref('horizontal')
const selectedObj = ref('sirius_a')
const coordDesc = ref('')
const currentCoords = ref({})

const coordSystems = [
  { id: 'horizontal', label: '地平坐标系' },
  { id: 'equatorial', label: '赤道坐标系' },
  { id: 'ecliptic', label: '黄道坐标系' },
  { id: 'galactic', label: '银道坐标系' },
]

const celestialObjects = [
  { id:'sirius_a', name:'天狼星A', type:'主序星', labelColor:'#add8ff', pos:[1.6,-0.5,1.5], color:0xadd8ff, size:0.08 },
  { id:'betelgeuse', name:'参宿四', type:'红超巨星', labelColor:'#ff6666', pos:[-1.3,1.2,1.2], color:0xff4444, size:0.14 },
  { id:'sirius_b', name:'天狼星B', type:'白矮星', labelColor:'#cccccc', pos:[1.4,-0.7,1.7], color:0xeeeeee, size:0.05 },
  { id:'cygnus_x1', name:'天鹅座X-1', type:'黑洞', labelColor:'#cc66ff', pos:[-1.0,0.8,-1.8], color:0x440044, size:0.04 },
  { id:'crab_pulsar', name:'蟹状星云脉冲星', type:'中子星', labelColor:'#00ffcc', pos:[0.3,-1.5,1.6], color:0x00ffcc, size:0.06 },
]

const planetData = [
  { name:'水星', au:'0.39', period:0.24, orbitV:'47.9' },
  { name:'金星', au:'0.72', period:0.62, orbitV:'35.0' },
  { name:'地球', au:'1.00', period:1.0, orbitV:'29.8' },
  { name:'火星', au:'1.52', period:1.88, orbitV:'24.1' },
  { name:'木星', au:'5.20', period:11.86, orbitV:'13.1' },
  { name:'土星', au:'9.54', period:29.46, orbitV:'9.7' },
]

const descs = {
  horizontal: `<h3>🌐 地平坐标系</h3><p>以地平圈为基准。高度 h (0°~90°)，方位角 A (0°~360° 顺时针从北量度)。直观但随时间地点变化。</p>`,
  equatorial: `<h3>🌌 赤道坐标系</h3><p>以天赤道为基准。赤纬 δ (-90°~+90°)，赤经 α (0h~24h 从春分点向东)。恒星坐标固定不变。</p>`,
  ecliptic: `<h3>🌞 黄道坐标系</h3><p>以黄道面（地球公转轨道面，倾斜23.44°）为基准。黄纬 β，黄经 λ。用于行星运动计算。</p>`,
  galactic: `<h3>🌌 银道坐标系</h3><p>以银河系盘面为基准（倾斜约62.6°）。银纬 b，银经 l。用于银河系结构研究。</p>`,
}

const objCoords = {
  horizontal: { sirius_a:'h=35° A=135°', betelgeuse:'h=52° A=225°', sirius_b:'h=32° A=140°', cygnus_x1:'h=30° A=300°', crab_pulsar:'h=10° A=25°' },
  equatorial: { sirius_a:'δ=-17° α=6h45m', betelgeuse:'δ=+7° α=5h55m', sirius_b:'δ=-17° α=6h45m', cygnus_x1:'δ=+35° α=19h58m', crab_pulsar:'δ=+22° α=5h35m' },
  ecliptic: { sirius_a:'β=-39° λ=103°', betelgeuse:'β=-16° λ=88°', sirius_b:'β=-39° λ=103°', cygnus_x1:'β=+5° λ=61°', crab_pulsar:'β=-17° λ=85°' },
  galactic: { sirius_a:'b=-33° l=227°', betelgeuse:'b=-14° l=210°', sirius_b:'b=-33° l=227°', cygnus_x1:'b=+4° l=72°', crab_pulsar:'b=-2° l=184°' },
}

// ---- Three.js setup ----
let scene, camera, renderer, labelRenderer, controls
let earthGroup, celestialGroup, spaceGroup
let proMode = null
let spaceAnim = null
let raycaster, mouse, clickableMeshes = []

function makeLabel(text, color, fontSize = '13px', pos) {
  const d = document.createElement('div')
  d.textContent = text
  d.style.cssText = `color:${color};font-size:${fontSize};font-weight:600;text-shadow:0 0 8px rgba(0,0,0,0.8);background:rgba(0,0,0,0.5);padding:2px 8px;border-radius:4px;border:1px solid ${color};white-space:nowrap;pointer-events:none`
  const l = new CSS2DObject(d)
  l.position.copy(pos)
  return l
}

function makeLine(pts, color = 0xffffff, opacity = 0.5) {
  const g = new THREE.BufferGeometry().setFromPoints(pts)
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }))
}

function makeRing(radius, color, opacity = 0.3) {
  const pts = []
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius))
  }
  return makeLine(pts, color, opacity)
}

function buildSimple() {
  earthGroup.children.forEach(c => earthGroup.remove(c))
  const RC=1.0, RM=0.85, ROC=0.55, RIC=0.3
  const R = { crust:RC, mantle:RM, outerCore:ROC, innerCore:RIC }
  const clip = new THREE.Plane(new THREE.Vector3(-1, 0.3, 0.5), 0.1)
  const opts = { clippingPlanes: [clip], clipShadows: true }

  const addSphere = (r, color, emissive = 0, extra = {}) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(r, 48, 48),
      new THREE.MeshPhysicalMaterial({ color, emissive, metalness:0.3, roughness:0.5, transparent:true, opacity:0.8, ...opts, ...extra })
    )
    earthGroup.add(m)
  }
  addSphere(RIC, 0xf1c40f, 0xf1c40f, { emissiveIntensity:0.3, metalness:0.7, roughness:0.3 })
  addSphere(ROC, 0xf39c12, 0xf39c12, { emissiveIntensity:0.15, side:THREE.DoubleSide })
  addSphere(RM, 0xe67e22, 0xe67e22, { emissiveIntensity:0.08, side:THREE.DoubleSide })
  addSphere(RC, 0x4a90d9, 0, { side:THREE.DoubleSide })

  // Enhanced property labels
  const layers = [
    { name:'地壳', color:'#4a90d9', pos:[RC*1.4,0.5,0], props:['厚度 5-70km','温度 地表~1000°C','组成 花岗岩/玄武岩','状态 固态'] },
    { name:'地幔', color:'#e67e22', pos:[RM*1.3,-0.6,0.8], props:['厚度 ~2900km','温度 1000-3700°C','密度 3.3-5.7 g/cm³','组成 橄榄岩'] },
    { name:'外核', color:'#f39c12', pos:[ROC*1.5,0.6,-0.4], props:['厚度 ~2210km','温度 3700-4500°C','组成 Fe+Ni','状态 液态🧲'] },
    { name:'内核', color:'#f1c40f', pos:[RIC*1.5,-0.3,-0.5], props:['半径 ~1220km','温度 ~5500°C','密度 ~13 g/cm³','状态 固态🔥'] },
  ]
  layers.forEach(l => {
    const p = new THREE.Vector3(l.pos[0], l.pos[1], l.pos[2])
    earthGroup.add(makeLabel(l.name, l.color, '14px', p))
    l.props.forEach((prop, i) => {
      earthGroup.add(makeLabel(prop, '#aaa', '10px', new THREE.Vector3(p.x, p.y - 0.2 - i*0.17, p.z)))
    })
  })
  earthGroup.add(makeLabel('莫霍界面', '#6688aa', '11px', new THREE.Vector3(0, -RC*1.2, RC*1.2)))
  earthGroup.add(makeLabel('古登堡界面', '#6688aa', '11px', new THREE.Vector3(0, RM*1.2, -RM*1.2)))
}

onMounted(async () => {
  await nextTick()
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.position.set(3, 1.5, 4)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(container.clientWidth, container.clientHeight)
  labelRenderer.domElement.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none'
  container.appendChild(labelRenderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 1.5
  controls.maxDistance = 12

  scene.add(new THREE.AmbientLight(0x404060, 0.6))
  const dl = new THREE.DirectionalLight(0xffffff, 1.5)
  dl.position.set(5, 10, 7)
  scene.add(dl)

  earthGroup = new THREE.Group()
  scene.add(earthGroup)
  celestialGroup = new THREE.Group()
  celestialGroup.visible = false
  scene.add(celestialGroup)
  spaceGroup = new THREE.Group()
  spaceGroup.visible = false
  scene.add(spaceGroup)

  // Stars
  const sg = new THREE.BufferGeometry()
  const sp = new Float32Array(3000 * 3)
  for (let i = 0; i < 3000*3; i++) sp[i] = (Math.random() - 0.5) * 200
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3))
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8 }))
  scene.add(stars)

  buildSimple()

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  renderer.domElement.addEventListener('click', (e) => {
    if (mode.value !== 'professional' || !celestialGroup.visible || !proMode) return
    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const hits = raycaster.intersectObjects(clickableMeshes)
    for (const h of hits) {
      const id = h.object.userData.objectId
      if (id && celestialObjects.some(o => o.id === id)) {
        selectObj(id)
        break
      }
    }
  })

  animate()
})

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
  labelRenderer.render(scene, camera)
}

function selectObj(id) {
  selectedObj.value = id
}

function switchCoord(id) {
  activeCoord.value = id
  coordDesc.value = descs[id] || ''
  currentCoords.value = objCoords[id] || {}
}

function buildCelestialScene() {
  const csRadius = 2.5
  // Grid
  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = lat * Math.PI / 180
    const r = Math.cos(phi) * csRadius, y = Math.sin(phi) * csRadius
    const pts = []
    for (let i = 0; i <= 36; i++) {
      const theta = (i / 36) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r))
    }
    celestialGroup.add(makeLine(pts, 0x446688, 0.15))
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const theta = lon * Math.PI / 180, pts = []
    for (let i = 0; i <= 36; i++) {
      const phi = (i / 36) * Math.PI
      pts.push(new THREE.Vector3(Math.cos(theta)*Math.sin(phi)*csRadius, Math.cos(phi)*csRadius, Math.sin(theta)*Math.sin(phi)*csRadius))
    }
    celestialGroup.add(makeLine(pts, 0x446688, 0.1))
  }
  // Objects
  celestialObjects.forEach(obj => {
    const pos = new THREE.Vector3(obj.pos[0], obj.pos[1], obj.pos[2])
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(obj.size, 16, 16),
      new THREE.MeshBasicMaterial({ color: obj.color })
    )
    mesh.position.copy(pos)
    celestialGroup.add(mesh)
    celestialGroup.add(makeLabel(obj.name, obj.labelColor, '11px', pos.clone().add(new THREE.Vector3(0, 0.2, 0))))
  })
  // Labels for coordinate systems
  const sysLabels = [
    { text: '天顶', pos: [0, csRadius+0.2, 0] },
    { text: 'N', pos: [0, 0.1, -csRadius-0.3] },
    { text: '天赤道', pos: [csRadius*0.7, 0.1, 0] },
  ]
  sysLabels.forEach(l => celestialGroup.add(makeLabel(l.text, '#888', '12px', new THREE.Vector3(l.pos[0], l.pos[1], l.pos[2]))))
}
// Also add celestial grid lines as coordinate reference
function initProfessionalOnSwitch() {
  if (proMode) return
  proMode = true
  celestialGroup.children.forEach(c => celestialGroup.remove(c))
  // Coordinate origin
  const origin = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), new THREE.MeshBasicMaterial({ color: 0x888888 }))
  celestialGroup.add(origin)
  buildCelestialScene()
}

function buildSolarSystem() {
  const PLANETS = [
    { name:'水星', r:0.9, s:0.03, c:0xaaaaaa, sp:0.24 },
    { name:'金星', r:1.3, s:0.05, c:0xe8cda0, sp:0.62 },
    { name:'地球', r:1.8, s:0.06, c:0x4a90d9, sp:1.0 },
    { name:'火星', r:2.4, s:0.04, c:0xcd5c5c, sp:1.88 },
    { name:'木星', r:3.3, s:0.12, c:0xd4a574, sp:11.86 },
    { name:'土星', r:4.2, s:0.10, c:0xead6b8, sp:29.46 },
  ]
  // Sun
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), new THREE.MeshBasicMaterial({ color: 0xffaa33 }))
  spaceGroup.add(sun)
  spaceGroup.add(makeLabel('☀️ 太阳', '#ffaa33', '14px', new THREE.Vector3(0, -0.5, 0)))
  // Planets
  PLANETS.forEach((p, i) => {
    const ring = makeRing(p.r, p.c, 0.2)
    spaceGroup.add(ring)
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.s, 16, 16), new THREE.MeshPhysicalMaterial({ color: p.c, roughness: 0.6 }))
    const angle = (i / PLANETS.length) * Math.PI * 2
    mesh.position.set(Math.cos(angle) * p.r, 0, Math.sin(angle) * p.r)
    spaceGroup.add(mesh)
    spaceGroup.add(makeLabel(p.name, '#ccc', '10px', new THREE.Vector3(0, p.s + 0.15, 0).add(mesh.position)))
  })
  // Highlight Earth & Mars orbits
  const hlEarth = makeRing(rE, 0x60a5fa, 0.4)
  const hlMars = makeRing(rM, 0xef4444, 0.4)
  spaceGroup.add(hlEarth)
  spaceGroup.add(hlMars)
  // Direction arrows
  const arrowR = 0.12
  for (let r of [rE, rM]) {
    for (let ang of [0, Math.PI/2, Math.PI, 3*Math.PI/2]) {
      const p = new THREE.Vector3(Math.cos(ang)*r, 0.02, Math.sin(ang)*r)
      const dir = new THREE.Vector3(-Math.sin(ang)*r, 0, Math.cos(ang)*r).normalize()
      spaceGroup.add(new THREE.ArrowHelper(dir, p, arrowR, r===rE ? 0x60a5fa : 0xef4444, 0.1, 0.06))
    }
  }
  // Transfer orbit with process labels
  const aT = (rE + rM) / 2
  const cX = rE + (aT - rE)
  const sB = Math.sqrt(rE * rM)
  const tPts = []
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI
    tPts.push(new THREE.Vector3(cX + aT * Math.cos(t), 0.03, sB * Math.sin(t)))
  }
  spaceGroup.add(makeLine(tPts, 0x44ff88, 0.6))
  spaceGroup.add(makeLabel('① 🚀 出发 (29.8→11.6 km/s)', '#60a5fa', '10px', new THREE.Vector3(rE, -0.3, 0)))
  spaceGroup.add(makeLabel('④ 🏁 到达 (火星)', '#ef4444', '10px', new THREE.Vector3(rM*Math.cos(Math.PI*1.35), 0.3, rM*Math.sin(Math.PI*1.35))))
  spaceGroup.add(makeLabel('② 加速 ③ 椭圆飞行 259天', '#44ff88', '10px', new THREE.Vector3(2.0, 0.5, 0.8)))
}

function initDeepSpaceOnSwitch() {
  if (spaceGroup.children.length > 0) return
  buildSolarSystem()
}

function switchMode(m) {
  mode.value = m
  earthGroup.visible = m === 'simple'
  celestialGroup.visible = m === 'professional'
  spaceGroup.visible = m === 'deepspace'
  controls.autoRotate = m === 'simple'
  if (m === 'professional') {
    coordDesc.value = descs.horizontal
    currentCoords.value = objCoords.horizontal
    initProfessionalOnSwitch()
  }
  if (m === 'deepspace') {
    initDeepSpaceOnSwitch()
  }
}

onBeforeUnmount(() => {
  renderer?.dispose()
})
</script>

<style scoped>
#app {
  display: flex; flex-direction: column; height: calc(100vh - 80px);
  background: #0a0a1a; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
}
.topbar {
  display: flex; align-items: center; gap: 14px; padding: 10px 18px;
  border-bottom: 1px solid #333; background: rgba(10,10,30,0.95); flex-shrink: 0;
}
.back-link { color: #60a5fa; text-decoration: none; font-size: 13px; }
.mode-toggle { display: flex; gap: 4px; margin: 0 auto; }
.mode-btn {
  padding: 6px 14px; border: 1px solid #444; border-radius: 6px;
  background: transparent; color: #888; font-size: 0.8rem; cursor: pointer;
}
.mode-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.chapter-ref { font-size: 12px; color: #555; }
#main { display: flex; flex: 1; overflow: hidden; }
#canvas-container { flex: 1; position: relative; }
.controls-hint {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.6); padding: 4px 12px; border-radius: 6px;
  font-size: 0.75rem; color: #666; pointer-events: none;
}
#info-panel {
  width: 340px; padding: 16px; overflow-y: auto;
  background: rgba(15,15,35,0.95); border-left: 1px solid #333;
  font-size: 0.85rem; line-height: 1.7;
}
#info-panel h2 { font-size: 1rem; margin-bottom: 10px; color: #60a5fa; }
#info-panel h3 { font-size: 0.9rem; margin: 12px 0 6px; color: #93bbfd; }
.layers-list { list-style: none; }
.layers-list li { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.layers-list .dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.coord-btns { display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; }
.coord-btn {
  padding: 4px 10px; border: none; border-radius: 4px;
  background: #333; color: #aaa; font-size: 0.75rem; cursor: pointer;
}
.coord-btn.active { background: #3b82f6; color: #fff; }
.coord-tag {
  display: inline-block; background: #1e293b; padding: 1px 8px;
  border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #facc15;
}
.objects-section { margin-top: 12px; border-top: 1px solid #333; padding-top: 10px; }
.obj-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 8px;
  border-radius: 6px; cursor: pointer; border-left: 3px solid transparent;
  border-bottom: 1px solid #222; font-size: 0.8rem;
}
.obj-item:hover { background: rgba(255,255,255,0.04); }
.obj-item.selected { background: rgba(59,130,246,0.15); border-left-color: #3b82f6; }
.obj-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.obj-info { flex: 1; }
.obj-info strong { display: block; font-size: 0.82rem; }
.obj-type { color: #666; font-size: 0.7rem; }
.obj-coord { font-size: 0.65rem; background: #1e293b; padding: 1px 6px; border-radius: 4px; color: #facc15; }
.space-scroll { overflow-y: auto; height: calc(100% - 30px); padding-right: 4px; }
.planet-table { font-size: 0.7rem; margin: 6px 0; }
.pt-header, .pt-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2px; padding: 3px 0; border-bottom: 1px solid #1a1a1a; }
.pt-header { color: #666; }
.pt-row { color: #999; }
/* Info tooltip */
.info-term { position: relative; cursor: help; border-bottom: 1px dashed #555; display: inline; }
.info-term .info-popup {
  display: none; position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
  background: #1a1a2e; border: 1px solid #3b82f6; border-radius: 8px; padding: 10px 14px;
  width: 260px; font-size: 0.78rem; color: #ccc; line-height: 1.6; z-index: 200;
  box-shadow: 0 8px 24px rgba(0,0,0,0.7); white-space: normal; font-weight: 400; pointer-events: none;
}
.info-term .info-popup::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-top-color: #3b82f6; }
.info-term:hover .info-popup { display: block; }
.info-term .info-icon {
  display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px;
  border-radius: 50%; background: #333; color: #888; font-size: 10px; font-style: normal;
  margin-left: 2px; cursor: help; vertical-align: super; line-height: 1;
}
.info-term:hover .info-icon { background: #3b82f6; color: #fff; }
@media (max-width: 768px) {
  #main { flex-direction: column; }
  #info-panel { width: 100%; height: 35vh; border-left: none; border-top: 1px solid #333; }
}
</style>
