<template>
  <section class="lab-page">
    <header class="lab-intro">
      <router-link to="/geo-labs" class="back">← 地理实证实验</router-link>
      <p class="eyebrow">COPERNICUS DEM · 真实高程</p>
      <h1>从等高线走进喜马拉雅</h1>
      <p>这块地形由 Copernicus GLO-90 高程数据生成，范围为东经 86.75°—87°、北纬 27.75°—28°。拖动画面观察山脊与山谷，再用剖面判断地势起伏。</p>
    </header>
    <div class="terrain-layout">
      <div ref="sceneEl" class="scene" role="img" aria-label="珠穆朗玛峰附近真实高程生成的可旋转三维地形"></div>
      <aside class="terrain-controls">
        <label>高度夸张 {{ exaggeration.toFixed(1) }} 倍<input v-model.number="exaggeration" type="range" min="0.5" max="3" step="0.1" /></label>
        <label>剖面纬度 {{ profileLatitude }}° N<input v-model.number="profileRow" type="range" min="0" max="95" step="1" /></label>
        <p>拖动旋转，滚轮缩放。剖面线从西向东经过所选纬度。</p>
        <p class="note">高度夸张只改变显示比例，不改变原始高程值。GLO-90 是地表高程模型，含植被和建筑等地物影响；这里按 96×96 网格采样，仅适合课堂定性观察。</p>
      </aside>
    </div>
    <div class="profile-card">
      <h2>西 → 东地形剖面</h2>
      <svg viewBox="0 0 900 250" role="img" :aria-label="`地形剖面，最低 ${profileMin} 米，最高 ${profileMax} 米`">
        <line x1="34" y1="205" x2="878" y2="205" stroke="#8fa4ad" />
        <path :d="profilePath" fill="none" stroke="#176e7a" stroke-width="3" stroke-linejoin="round" />
        <text x="34" y="238">86.75° E</text><text x="805" y="238">87° E</text>
      </svg>
      <p>本剖面约 {{ profileMin }}—{{ profileMax }} 米。找出最陡的一段，推测可能对应山脊、谷地还是山坡。</p>
    </div>
    <p class="source">数据：<a href="https://registry.opendata.aws/copernicus-dem/" target="_blank" rel="noopener">Copernicus DEM GLO-90 Public</a>，2021 版；原始瓦片 {{ dem.tile }}。本页保存的是从原始瓦片抽样出的高程数值，非手绘地形。<br />produced using Copernicus WorldDEM-90 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved</p>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import dem from './data/everest-dem.json'

const sceneEl = ref(null)
const exaggeration = ref(1)
const profileRow = ref(48)
const profileLatitude = computed(() => (28 - profileRow.value / 95 * .25).toFixed(3))
const profile = computed(() => dem.elevationMeters.slice(profileRow.value * dem.width, (profileRow.value + 1) * dem.width))
const profileMin = computed(() => Math.min(...profile.value))
const profileMax = computed(() => Math.max(...profile.value))
const profilePath = computed(() => profile.value.map((height, index) => `${index ? 'L' : 'M'} ${34 + index / 95 * 844} ${205 - (height - 3000) / 6000 * 180}`).join(' '))
let renderer, scene, camera, controls, terrain, line, resizeObserver, frame

function createTerrain() {
  const geometry = new THREE.PlaneGeometry(100, 100, 95, 95)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.attributes.position
  const colors = []
  const low = 3427
  for (let i = 0; i < position.count; i++) {
    const height = dem.elevationMeters[i]
    position.setY(i, (height - low) / 250 * exaggeration.value)
    const t = Math.min(1, Math.max(0, (height - 3500) / 5200))
    const color = new THREE.Color().setHSL(.35 - t * .32, .42 - t * .26, .28 + t * .48)
    colors.push(color.r, color.g, color.b)
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1 })
  terrain = new THREE.Mesh(geometry, material)
  scene.add(terrain)
  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(96 * 3), 3))
  line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0xff6848, depthTest: false }))
  line.renderOrder = 2
  scene.add(line)
  updateProfileLine()
}

function updateProfileLine() {
  if (!line) return
  const positions = line.geometry.attributes.position
  for (let col = 0; col < 96; col++) {
    const height = dem.elevationMeters[profileRow.value * 96 + col]
    positions.setXYZ(col, -50 + col / 95 * 100, (height - 3427) / 250 * exaggeration.value + .25, -50 + profileRow.value / 95 * 100)
  }
  positions.needsUpdate = true
  line.geometry.computeBoundingSphere()
}

function updateHeight() {
  if (!terrain) return
  const positions = terrain.geometry.attributes.position
  for (let i = 0; i < positions.count; i++) positions.setY(i, (dem.elevationMeters[i] - 3427) / 250 * exaggeration.value)
  positions.needsUpdate = true
  terrain.geometry.computeVertexNormals()
  updateProfileLine()
}

onMounted(() => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#dce8ed')
  camera = new THREE.PerspectiveCamera(45, 1, .1, 600)
  camera.position.set(90, 80, 115)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  sceneEl.value.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x486178, 2.1))
  const sun = new THREE.DirectionalLight(0xffffff, 2.2)
  sun.position.set(-70, 100, 40)
  scene.add(sun)
  createTerrain()
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 8, 0)
  controls.enableDamping = true
  controls.maxDistance = 260
  controls.minDistance = 35
  function resize() {
    const { clientWidth, clientHeight } = sceneEl.value
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(clientWidth, clientHeight)
  }
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(sceneEl.value)
  resize()
  function animate() { frame = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera) }
  animate()
})
watch(exaggeration, updateHeight)
watch(profileRow, updateProfileLine)
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  controls?.dispose()
  terrain?.geometry.dispose(); terrain?.material.dispose()
  line?.geometry.dispose(); line?.material.dispose()
  renderer?.dispose(); renderer?.domElement.remove()
})
</script>

<style scoped>
.lab-page{max-width:1180px;margin:auto;padding:46px 24px 90px;color:#15273b}.lab-intro{max-width:800px}.back{font-size:14px;color:#256d8b}.eyebrow{margin:28px 0 8px;color:#4b8498;font-size:12px;letter-spacing:.16em;font-weight:700}.lab-intro h1{font-size:clamp(32px,5vw,56px);margin:0 0 12px}.lab-intro p:last-child{line-height:1.8;color:#536679}.terrain-layout{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:18px;margin:30px 0}.scene{height:520px;border-radius:18px;overflow:hidden;background:#dce8ed}.terrain-controls{padding:20px;background:#eff4f3;border-radius:16px;line-height:1.7}.terrain-controls label{display:grid;gap:12px;margin-bottom:22px;font-weight:700}.terrain-controls input{width:100%;accent-color:#176e7a}.terrain-controls p{font-size:13px;color:#526678}.terrain-controls .note{border-top:1px solid #ccd9dc;padding-top:15px}.profile-card{background:white;padding:22px 26px;border:1px solid #d5e2e5;border-radius:16px}.profile-card h2{margin:0 0 10px}.profile-card svg{width:100%;height:auto;background:#f3f8f8}.profile-card text{font-size:14px;fill:#647888}.profile-card p{line-height:1.7}.source{font-size:12px;line-height:1.7;color:#647688}.source a{color:#266d8e}@media(max-width:760px){.terrain-layout{grid-template-columns:1fr}.scene{height:400px}}
</style>
