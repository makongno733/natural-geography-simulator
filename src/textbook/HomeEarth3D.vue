<template>
  <div class="home-globe" :class="{ 'is-compact': isCompact }" :style="{ '--planet-accent': activePlanet.accent }" :aria-busy="loading" aria-label="可交互的三维太阳系天体">
    <div ref="sceneHost" class="globe-canvas" :class="{ 'is-fallback': fallback }">
      <img v-if="fallback" :src="fallbackImage" alt="NASA 地球影像。当前设备未能运行三维视图。" />
    </div>
    <div v-if="!fallback" class="planet-switcher" aria-label="切换太阳系天体">
      <button class="orbit-arrow orbit-arrow-prev" type="button" :disabled="loading || activeIndex === 0"
        :aria-label="`上一个天体：${previousPlanet?.name || '无'}`" @click="selectPlanet(activeIndex - 1)">
        <span class="orbit-arrow-line" aria-hidden="true"></span><span class="orbit-arrow-head" aria-hidden="true">‹</span><span class="orbit-arrow-name" aria-hidden="true">{{ previousPlanet?.name || '起点' }}</span>
      </button>
      <button class="orbit-arrow orbit-arrow-next" type="button" :disabled="loading || activeIndex === planets.length - 1"
        :aria-label="`下一个天体：${nextPlanet?.name || '无'}`" @click="selectPlanet(activeIndex + 1)">
        <span class="orbit-arrow-name" aria-hidden="true">{{ nextPlanet?.name || '终点' }}</span><span class="orbit-arrow-head" aria-hidden="true">›</span><span class="orbit-arrow-line" aria-hidden="true"></span>
      </button>
    </div>
    <div class="globe-chrome">
      <div class="globe-status"><span class="status-dot" aria-hidden="true"></span>太阳系漫游 <span class="status-number">{{ String(activeIndex + 1).padStart(2, '0') }} / 09</span></div>
      <div v-if="activePlanet.id === 'earth' && !fallback" class="globe-actions" aria-label="地球模型视图">
        <button type="button" :disabled="loading" :class="{ active: mode === 'surface' }" :aria-pressed="mode === 'surface'" @click="switchMode('surface')">表面</button>
        <button type="button" :disabled="loading" :class="{ active: mode === 'interior' }" :aria-pressed="mode === 'interior'" @click="switchMode('interior')">内部</button>
      </div>
    </div>
    <div class="planet-caption" aria-live="polite">
      <div class="planet-caption-kicker">{{ activePlanet.english }} <span>· {{ activePlanet.kind }}</span></div>
      <div class="planet-caption-name">{{ activePlanet.name }}</div>
      <p>{{ mode === 'interior' ? '从地壳到地核，观察脚下星球的圈层。' : activePlanet.description }}</p>
    </div>
    <div class="globe-bottom">
      <span class="globe-hint">{{ loading ? (interiorLoading ? '正在打开地球内部模型…' : '正在靠近下一颗天体…') : fallback ? '当前设备显示静态地球影像' : mode === 'interior' ? '地壳 / 地幔 / 外核 / 内核' : '拖动观察 · 展示大小并非真实比例' }}</span>
      <div v-if="!fallback && mode === 'surface' && !isCompact" class="globe-shortcuts">
        <button v-if="activePlanet.id === 'earth'" type="button" @click="focusChina">中国视角</button>
        <button type="button" @click="toggleRotation">{{ rotating ? '暂停自转' : '继续自转' }}</button>
      </div>
    </div>
      <div v-if="!fallback && !isCompact" class="planet-track" aria-label="选择太阳系天体">
      <button v-for="(planet, index) in planets" :key="planet.id" type="button" :disabled="loading"
        :class="{ active: index === activeIndex }" :aria-label="`查看${planet.name}`"
        :aria-current="index === activeIndex ? 'true' : undefined" @click="selectPlanet(index)">
        <span class="track-dot" aria-hidden="true"></span><span class="track-name">{{ planet.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { BaseScene } from '../engine/core/BaseScene.js'
import { HomePlanetModule } from './HomePlanetScene.js'
import { planets, saturnRingTexture } from './planetCatalog.js'
import fallbackImage from '../assets/geo-verified/blue-marble-bathymetry-july-2048.jpg?url'

const emit = defineEmits(['planet-change'])
const sceneHost = ref(null)
const activeIndex = ref(2)
const activePlanet = computed(() => planets[activeIndex.value])
const previousPlanet = computed(() => planets[activeIndex.value - 1])
const nextPlanet = computed(() => planets[activeIndex.value + 1])
const mode = ref('surface')
const fallback = ref(false)
const loading = ref(false)
const interiorLoading = ref(false)
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const rotating = ref(!reduceMotion)
const compactQuery = window.matchMedia('(max-width: 650px)')
const isCompact = ref(compactQuery.matches)
const texturePromises = new Map()
let engine = null
let resizeObserver = null
let planetApi = null
let mounted = false

function loadTexture(url) {
  if (!texturePromises.has(url)) {
    texturePromises.set(url, new THREE.TextureLoader().loadAsync(url).then(texture => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = Math.min(8, engine?.renderManager?.renderer.capabilities.getMaxAnisotropy() || 1)
      return texture
    }).catch(error => {
      texturePromises.delete(url)
      throw error
    }))
  }
  return texturePromises.get(url)
}

function createPlanetScene() {
  return HomePlanetModule({
    reduceMotion,
    distanceScale: isCompact.value ? 1.3 : 1,
    onTransitionDone: () => { loading.value = false },
  })
}

function setCamera(distance) {
  const rig = engine?.cameraRig
  if (!rig) return
  rig.camera.position.set(0, 0, distance * (isCompact.value ? 1.3 : 1))
  rig.controls.target.set(0, 0, 0)
  rig.controls.enablePan = false
  rig.controls.enableZoom = false
  rig.controls.update()
}

async function selectPlanet(index) {
  if (!engine || loading.value || index < 0 || index >= planets.length || index === activeIndex.value) return
  loading.value = true
  const planet = planets[index]
  const direction = Math.sign(index - activeIndex.value)
  try {
    const [texture, ringTexture] = await Promise.all([
      loadTexture(planet.texture),
      planet.id === 'saturn' ? loadTexture(saturnRingTexture) : Promise.resolve(null),
    ])
    if (!mounted) return
    if (mode.value === 'interior') {
      mode.value = 'surface'
      engine.loadModule(createPlanetScene())
      planetApi = engine._moduleApi
      engine.lightRig.setPreset('sunlit')
      engine.lightRig.lights.ambient.color.set(0x9bc0d7)
      engine.lightRig.lights.ambient.intensity = 0.85
    }
    planetApi.show(planet, texture, ringTexture, direction)
    activeIndex.value = index
    emit('planet-change', planet)
  } catch (error) {
    loading.value = false
    console.error('行星纹理加载失败', planet.id, planet.texture, planet.id === 'saturn' ? saturnRingTexture : '', error)
  }
}

async function switchMode(nextMode) {
  if (activePlanet.value.id !== 'earth' || mode.value === nextMode || !engine || loading.value) return
  if (nextMode === 'interior') {
    loading.value = true
    interiorLoading.value = true
    let EarthInteriorModule
    try {
      const module = await import('../engine/modules/EarthInteriorModule.js')
      EarthInteriorModule = module.EarthInteriorModule
    } catch (error) {
      console.error('地球内部模型加载失败', error)
      return
    } finally {
      loading.value = false
      interiorLoading.value = false
    }
    if (!mounted || !engine || activePlanet.value.id !== 'earth' || mode.value !== 'surface') return
    mode.value = nextMode
    planetApi = null
    engine.loadModule((scene, params, services) => EarthInteriorModule(
      scene, { ...params, preview: true, showAtmosphere: false }, { ...services, labelSystem: null }
    ), { mode: 'simple' })
    engine.lightRig.setPreset('dramatic')
    setCamera(3.8)
  } else {
    mode.value = nextMode
    engine.loadModule(createPlanetScene())
    planetApi = engine._moduleApi
    engine.lightRig.setPreset('sunlit')
    engine.lightRig.lights.ambient.color.set(0x9bc0d7)
    engine.lightRig.lights.ambient.intensity = 0.85
    loadTexture(planets[2].texture).then(texture => {
      if (mounted && mode.value === 'surface') planetApi?.show(planets[2], texture, null)
    })
    setCamera(4.8)
  }
  engine.setAutoRotate(!isCompact.value && rotating.value)
}

function focusChina() {
  if (!engine || activePlanet.value.id !== 'earth' || mode.value !== 'surface') return
  planetApi?.focusChina()
  setCamera(4.8)
  rotating.value = false
  engine.setAutoRotate(false)
}

function toggleRotation() {
  rotating.value = !rotating.value
  engine?.setAutoRotate(rotating.value)
}

function updateCompactMode(event) {
  isCompact.value = event.matches
  if (!engine) return
  const controls = engine.cameraRig.controls
  controls.enabled = !isCompact.value
  controls.enableRotate = !isCompact.value
  engine.setAutoRotate(!isCompact.value && rotating.value)
  if (mode.value === 'surface') {
    const distance = activePlanet.value.distance || 4.8
    planetApi?.setDistanceScale(isCompact.value ? 1.3 : 1, distance)
    setCamera(distance)
  } else {
    setCamera(3.8)
  }
}

onMounted(async () => {
  if (!sceneHost.value) return
  mounted = true
  compactQuery.addEventListener('change', updateCompactMode)
  try {
    engine = new BaseScene(sceneHost.value, {
      bg: 0x040b19, fov: 38, near: 0.1, far: 100,
      autoRotate: !reduceMotion && !isCompact.value, autoRotateSpeed: 0.38, lightPreset: 'sunlit', labels: false,
      shadows: false, antialias: true,
    })
    engine.cameraRig.controls.enabled = !isCompact.value
    engine.cameraRig.controls.enableRotate = !isCompact.value
    engine.scene.background = null
    engine.renderManager.renderer.setClearColor(0x040b19, 0)
    engine.loadModule(createPlanetScene())
    planetApi = engine._moduleApi
    engine.lightRig.lights.ambient.color.set(0x9bc0d7)
    engine.lightRig.lights.ambient.intensity = 0.85
    setCamera(4.8)
    const texture = await loadTexture(planets[2].texture)
    if (!mounted) return
    planetApi.show(planets[2], texture, null)
    resizeObserver = new ResizeObserver(() => engine?.resize())
    resizeObserver.observe(sceneHost.value)
  } catch (error) {
    engine?.dispose()
    engine = null
    fallback.value = true
  }
})

onBeforeUnmount(() => {
  mounted = false
  compactQuery.removeEventListener('change', updateCompactMode)
  resizeObserver?.disconnect()
  engine?.dispose()
  engine = null
  planetApi = null
  for (const pending of texturePromises.values()) {
    pending.then(texture => texture.dispose()).catch(() => {})
  }
  texturePromises.clear()
})
</script>

<style scoped>
.home-globe{position:relative;width:100%;height:100%;min-height:420px;isolation:isolate;background:radial-gradient(circle at 50% 48%,color-mix(in srgb,var(--planet-accent) 19%,#07152a) 0,#07152a 54%,transparent 74%)}
.globe-canvas{position:absolute;inset:0}.globe-canvas :deep(canvas){display:block;width:100%;height:100%;cursor:grab;touch-action:pan-y}.globe-canvas :deep(canvas):active{cursor:grabbing}.globe-canvas.is-fallback img{width:100%;height:100%;object-fit:contain}
.globe-chrome,.globe-bottom{position:absolute;left:8%;right:8%;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:12px;pointer-events:none}.globe-chrome{top:7%}.globe-bottom{bottom:12%}.globe-chrome button,.globe-bottom button{pointer-events:auto}
.globe-status,.globe-hint{font:600 10px/1.3 ui-monospace,SFMono-Regular,monospace;letter-spacing:.09em;color:#c8dcea;text-shadow:0 1px 8px #000}.globe-status{display:flex;align-items:center;gap:8px}.status-dot{width:6px;height:6px;border-radius:50%;background:var(--planet-accent);box-shadow:0 0 10px var(--planet-accent)}.status-number{opacity:.62}
.globe-actions,.globe-shortcuts{display:flex;gap:4px;padding:4px;border:1px solid rgba(183,220,246,.22);border-radius:999px;background:rgba(6,18,34,.68);backdrop-filter:blur(10px)}.globe-actions button,.globe-shortcuts button{border:0;border-radius:999px;background:transparent;color:#b9d5e8;padding:7px 11px;font-family:inherit;font-size:11px;font-weight:600;line-height:1.1;cursor:pointer;white-space:nowrap}.globe-actions button:hover,.globe-shortcuts button:hover,.globe-actions button.active{background:#d4e9f4;color:#11314c}
.planet-switcher{position:absolute;inset:0;z-index:3;pointer-events:none}.orbit-arrow{position:absolute;top:44%;display:flex;align-items:center;gap:8px;border:0;background:transparent;color:#e7f5ff;cursor:pointer;pointer-events:auto;padding:12px 2px;font:600 12px/1 ui-monospace,SFMono-Regular,monospace;letter-spacing:.12em;text-shadow:0 2px 12px #000;transition:color .25s,transform .25s}.orbit-arrow-prev{left:-4%}.orbit-arrow-next{right:-4%}.orbit-arrow:hover:not(:disabled){color:var(--planet-accent);transform:scale(1.06)}.orbit-arrow:disabled{opacity:.3;cursor:default}.orbit-arrow-line{width:clamp(24px,4vw,64px);height:1px;background:linear-gradient(90deg,transparent,currentColor);opacity:.7}.orbit-arrow-next .orbit-arrow-line{transform:rotate(180deg)}.orbit-arrow-head{font:300 42px/.45 Georgia,serif}.orbit-arrow-name{min-width:30px}.orbit-arrow:focus-visible,.planet-track button:focus-visible,.globe-actions button:focus-visible,.globe-shortcuts button:focus-visible{outline:2px solid var(--planet-accent);outline-offset:4px}
.planet-caption{position:absolute;left:8%;bottom:20%;z-index:2;max-width:175px;pointer-events:none;text-shadow:0 2px 12px #000}.planet-caption-kicker{font:700 9px/1.3 ui-monospace,SFMono-Regular,monospace;letter-spacing:.19em;color:var(--planet-accent)}.planet-caption-kicker span{color:#a4bbcb}.planet-caption-name{font-size:clamp(27px,4vw,42px);font-weight:800;line-height:1.16;color:#f4f9fc}.planet-caption p{margin:5px 0 0;color:#b7cbd9;font-size:10px;line-height:1.55}
.planet-track{position:absolute;z-index:4;left:8%;right:8%;bottom:2%;display:flex;align-items:center;justify-content:center;gap:0}.planet-track:before{content:'';position:absolute;left:4%;right:4%;top:7px;height:1px;background:linear-gradient(90deg,transparent,rgba(174,214,240,.45) 15%,rgba(174,214,240,.45) 85%,transparent)}.planet-track button{position:relative;flex:1;min-width:0;border:0;background:none;color:#9bb0c0;cursor:pointer;padding:0 1px;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:9px;white-space:nowrap}.planet-track button:hover,.planet-track button.active{color:#f5fbff}.track-dot{display:block;width:7px;height:7px;border-radius:50%;background:#6f8ca5;box-shadow:0 0 0 3px #07172a;transition:transform .25s,background .25s}.planet-track button.active .track-dot{background:var(--planet-accent);transform:scale(1.55);box-shadow:0 0 0 3px #07172a,0 0 16px var(--planet-accent)}
@media(max-width:650px){
  .home-globe{height:310px;min-height:310px;overflow:hidden;border:1px solid rgba(183,220,246,.16);border-radius:20px}
  .globe-canvas,.globe-canvas :deep(canvas){pointer-events:none;touch-action:pan-y;cursor:default}
  .globe-chrome{top:5%;left:6%;right:6%}
  .globe-status{display:flex;font-size:9px}
  .globe-actions{margin-left:auto}
  .globe-actions button{padding:7px 9px;font-size:10px}
  .globe-bottom,.planet-track{display:none}
  .planet-caption{left:6%;bottom:26%;max-width:140px}
  .planet-caption-name{font-size:24px}
  .planet-caption p{display:none}
  .planet-caption-kicker{font-size:8px}
  .planet-switcher{inset:auto 12px 12px;display:flex;justify-content:space-between;gap:12px}
  .orbit-arrow{position:relative;top:auto;left:auto;right:auto;min-width:104px;min-height:44px;justify-content:center;gap:7px;padding:7px 12px;border:1px solid rgba(183,220,246,.4);border-radius:999px;background:rgba(6,18,34,.78);font-size:11px;letter-spacing:.04em;text-shadow:none}
  .orbit-arrow-name{display:inline;min-width:0}
  .orbit-arrow-line{display:none}
  .orbit-arrow-head{font-size:30px;line-height:.7}
}
@media(prefers-reduced-motion:reduce){.orbit-arrow,.track-dot{transition:none}}
</style>
