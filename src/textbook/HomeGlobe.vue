<template>
  <div ref="stage" class="home-globe" aria-label="可拖动旋转的三维地球，使用 NASA Blue Marble 卫星合成影像">
    <picture v-if="!ready" class="globe-fallback">
      <img :src="geoOptimizedAsset('earth-apollo17.jpg', 960)" width="1881" height="1881" fetchpriority="high" alt="阿波罗 17 号拍摄的地球">
    </picture>
    <span v-if="ready" class="globe-hint">拖动地球，观察海陆分布</span>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { geoOptimizedAsset } from './geoAssets.js'
import earthMap from '../assets/geo-verified/blue-marble-bathymetry-july-2048.jpg?url'

const stage = ref(null)
const ready = ref(false)
let renderer
let controls
let globe
let scene
let camera
let texture
let observer
let resizeObserver
let mediaQuery
let frame = 0
let lastRenderAt = 0
let visible = true
let disposed = false

function render() {
  if (renderer && !disposed) renderer.render(scene, camera)
}

function resize() {
  if (!stage.value || !renderer) return
  const width = stage.value.clientWidth
  const height = stage.value.clientHeight
  if (!width || !height) return
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  render()
}

function animate(now) {
  frame = 0
  if (disposed || !visible || document.hidden || mediaQuery?.matches) return
  if (now - lastRenderAt >= 32) {
    controls.update()
    render()
    lastRenderAt = now
  }
  frame = requestAnimationFrame(animate)
}

function syncAnimation() {
  controls && (controls.autoRotate = !mediaQuery?.matches)
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  if (visible && !document.hidden && !mediaQuery?.matches && ready.value) frame = requestAnimationFrame(animate)
  else render()
}

async function init() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2', { alpha: true }) || canvas.getContext('webgl', { alpha: true })
    if (!gl) return
    const [THREE, { OrbitControls }] = await Promise.all([
      import('three'), import('three/addons/controls/OrbitControls.js'),
    ])
    if (disposed || !stage.value) return
    renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(39, 1, 0.1, 100)
    camera.position.set(0, 0, 4.15)
    const loader = new THREE.TextureLoader()
    texture = await loader.loadAsync(earthMap)
    if (disposed) {
      texture.dispose()
      return
    }
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
    globe = new THREE.Mesh(
      new THREE.SphereGeometry(1.44, 48, 32),
      new THREE.MeshBasicMaterial({ map: texture }),
    )
    globe.rotation.y = -1.65
    scene.add(globe)
    controls = new OrbitControls(camera, canvas)
    controls.enablePan = false
    controls.enableZoom = false
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.rotateSpeed = 0.55
    controls.autoRotateSpeed = 0.42
    controls.addEventListener('change', render)
    stage.value.appendChild(canvas)
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(stage.value)
    observer = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false
      syncAnimation()
    }, { threshold: 0.05 })
    observer.observe(stage.value)
    ready.value = true
    resize()
    syncAnimation()
  } catch (error) {
    console.warn('三维地球加载失败，已保留静态地球影像。', error)
  }
}

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  mediaQuery.addEventListener?.('change', syncAnimation)
  document.addEventListener('visibilitychange', syncAnimation)
  init()
})

onBeforeUnmount(() => {
  disposed = true
  if (frame) cancelAnimationFrame(frame)
  observer?.disconnect()
  resizeObserver?.disconnect()
  mediaQuery?.removeEventListener?.('change', syncAnimation)
  document.removeEventListener('visibilitychange', syncAnimation)
  controls?.dispose()
  globe?.geometry.dispose()
  globe?.material.dispose()
  texture?.dispose()
  renderer?.dispose()
  renderer?.domElement.remove()
})
</script>

<style scoped>
.home-globe { position:relative; width:100%; aspect-ratio:1; min-height:320px; display:grid; place-items:center; overflow:hidden; }
.home-globe canvas { width:100%; height:100%; display:block; cursor:grab; touch-action:none; filter:brightness(1.7) saturate(1.2) drop-shadow(0 0 32px rgba(36,94,135,.3)); }
.home-globe canvas:active { cursor:grabbing; }
.globe-fallback { display:block; width:100%; }
.globe-fallback img { display:block; width:100%; height:auto; aspect-ratio:1; object-fit:contain; }
.globe-hint { position:absolute; left:50%; bottom:3%; transform:translateX(-50%); padding:7px 11px; white-space:nowrap; color:#e6eee9; background:rgba(4,24,35,.72); font-size:12px; pointer-events:none; }
</style>
