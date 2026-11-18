import * as THREE from 'three'
import { SceneActivity } from '../engine/core/SceneActivity.js'
import earthTextureUrl from '../assets/geo-verified/blue-marble-bathymetry-july-2048.jpg?url'

// 默认初始视角：聚焦东亚与中国季风区（约 31°N, 112°E）
// 说明：Three.js SphereGeometry 纹理 u=0 对应 -180°W，u=0.5 (phi=PI) 对应 0° 经线，
// 东经 112°E 对应 phi = PI + (112 * PI / 180) ≈ 5.096 rad；
// 要使该经线正对 +Z 相机（phi + yaw = 5*PI/2），yaw = 3*PI/2 - lonRad ≈ 2.758 rad。
export const EAST_ASIA_VIEW = {
  yaw: 2.75,
  pitch: 0.34
}

/**
 * 根据当前地球 yaw 旋转角计算正对相机中心的经度与地理分区标签，确保标签与画面洲陆始终一致
 */
export function resolveGlobeRegionLabel(currentYaw = EAST_ASIA_VIEW.yaw) {
  const rawLonRad = (3 * Math.PI) / 2 - Number(currentYaw || 0)
  let lonDeg = ((rawLonRad * 180) / Math.PI) % 360
  if (lonDeg > 180) lonDeg -= 360
  if (lonDeg <= -180) lonDeg += 360

  if (lonDeg >= 82 && lonDeg <= 142) {
    return '东亚 · 31°N, 112°E'
  }
  const lonText = `${Math.abs(Math.round(lonDeg))}°${lonDeg >= 0 ? 'E' : 'W'}`
  if (lonDeg > 142 || lonDeg < -135) {
    return `太平洋视角 · ${lonText}`
  }
  if (lonDeg >= -135 && lonDeg <= -30) {
    return `美洲与东太平洋 · ${lonText}`
  }
  if (lonDeg > -30 && lonDeg < 45) {
    return `欧洲与非洲视角 · ${lonText}`
  }
  return `南亚与印度洋 · ${lonText}`
}

/**
 * 生成具有真实大气环流特征的透明云层纹理（含赤道辐合带、东亚梅雨/季风云系、副热带气旋涡旋与中纬西风带云系）
 * 不增加外部图片请求，同时让大陆、海洋与云层层次分明。
 */
function createSynopticCloudTexture() {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 确定性伪随机函数，保证每次生成的云系自然且可复现
  let seed = 20261117
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }

  const drawCloudPuff = (x, y, rx, ry, alpha, angle = 0) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.scale(1, ry / Math.max(1, rx))
    const grad = ctx.createRadialGradient(0, 0, rx * 0.1, 0, 0, rx)
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
    grad.addColorStop(0.55, `rgba(245, 250, 255, ${alpha * 0.55})`)
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(0, 0, rx, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // 1. 东亚季风锋面云带与西太平洋气旋云系（适度留出中国东部陆地晴空窗，保证东亚海岸线清晰可辨）
  for (let i = 0; i < 36; i++) {
    const t = i / 36
    const x = 835 + t * 145 + (rand() - 0.5) * 18
    const y = 188 - t * 34 + Math.sin(t * 5) * 7
    drawCloudPuff(x % 1024, y, 22 + rand() * 18, 8 + rand() * 6, 0.24 + rand() * 0.15, -0.25)
  }

  // 西太平洋气旋螺旋云团示意（位于东经 135°E 以东洋面，不遮挡中国大陆轮廓）
  const cx = 895
  const cy = 212
  for (let arm = 0; arm < 3; arm++) {
    for (let step = 0; step < 16; step++) {
      const r = 6 + step * 2.2
      const theta = arm * ((Math.PI * 2) / 3) + step * 0.28
      const px = cx + Math.cos(theta) * r
      const py = cy + Math.sin(theta) * r * 0.8
      drawCloudPuff(px % 1024, py, 9 + step * 0.5, 5 + step * 0.35, 0.32 - step * 0.014, theta)
    }
  }

  // 2. 赤道辐合带（ITCZ）断续对流云团
  for (let i = 0; i < 95; i++) {
    const x = rand() * 1024
    const y = 250 + Math.sin((x / 1024) * Math.PI * 4) * 14 + (rand() - 0.5) * 18
    drawCloudPuff(x, y, 18 + rand() * 28, 8 + rand() * 10, 0.22 + rand() * 0.18, (rand() - 0.5) * 0.3)
  }

  // 3. 南北半球中纬度西风带气旋锋面云带
  for (const baseLatY of [115, 385]) {
    for (let i = 0; i < 85; i++) {
      const x = rand() * 1024
      const y = baseLatY + Math.sin((x / 1024) * Math.PI * 6) * 20 + (rand() - 0.5) * 24
      drawCloudPuff(x, y, 28 + rand() * 36, 9 + rand() * 11, 0.22 + rand() * 0.2, -0.35)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

/**
 * 在指定容器中挂载轻量级首页 3D 地球场景
 */
export async function mountCommunityMiniGlobe(container, options = {}) {
  const {
    initialRotating = true,
    onReady = () => {},
    onFallback = () => {},
    onDragChange = () => {},
    onRotationChange = () => {},
    onViewChange = () => {}
  } = options

  if (!container || typeof window === 'undefined') {
    onFallback('no-container')
    return null
  }

  if (window.__FORCE_GLOBE_FALLBACK__) {
    onFallback('forced-fallback')
    return null
  }

  let renderer = null
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power'
    })
  } catch (err) {
    onFallback(err?.message || 'webgl-unavailable')
    return null
  }

  const width = Math.max(120, container.clientWidth || 240)
  const height = Math.max(120, container.clientHeight || 240)
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x040b19, 0)

  const canvas = renderer.domElement
  // 关键：保证手机上手指经过地球上下滑动时页面照常顺畅滚动
  canvas.style.touchAction = 'pan-y'
  canvas.style.display = 'block'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  container.appendChild(canvas)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50)
  camera.position.set(0, 0, 4.35)

  // 光照：太阳主光 + 柔和天光 + 背光轮廓补光，凸显海陆层次与云带立体感
  const ambientLight = new THREE.AmbientLight(0x9bc4e2, 1.05)
  const sunLight = new THREE.DirectionalLight(0xfff7e8, 2.15)
  sunLight.position.set(4.5, 2.8, 5.2)
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75)
  rimLight.position.set(-4.0, -2.0, -3.5)
  scene.add(ambientLight, sunLight, rimLight)

  const rootGroup = new THREE.Group()
  scene.add(rootGroup)

  const radius = 1.38
  let surfaceTexture = null
  try {
    surfaceTexture = await new THREE.TextureLoader().loadAsync(earthTextureUrl)
    surfaceTexture.colorSpace = THREE.SRGBColorSpace
    surfaceTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 1)
  } catch (err) {
    renderer.dispose()
    canvas.remove()
    onFallback(err?.message || 'texture-failed')
    return null
  }

  // 1. 地球海陆地形球体（复用 NASA Blue Marble Next Generation 纹理）
  const earthGeo = new THREE.SphereGeometry(radius, 72, 54)
  const earthMat = new THREE.MeshStandardMaterial({
    map: surfaceTexture,
    roughness: 0.78,
    metalness: 0.06
  })
  const earthMesh = new THREE.Mesh(earthGeo, earthMat)
  rootGroup.add(earthMesh)

  // 2. 大气云层球体（半透明云系，缓慢漂移）
  const cloudTexture = createSynopticCloudTexture()
  let cloudMesh = null
  if (cloudTexture) {
    const cloudGeo = new THREE.SphereGeometry(radius * 1.015, 64, 48)
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      roughness: 1.0
    })
    cloudMesh = new THREE.Mesh(cloudGeo, cloudMat)
    rootGroup.add(cloudMesh)
  }

  // 3. 瑞利散射大气边缘辉光（复用 HomePlanetScene 着色器思路）
  const atmoGeo = new THREE.SphereGeometry(radius * 1.045, 64, 48)
  const atmoMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      glowIntensity: { value: 0.65 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      uniform float glowIntensity;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.8);
        gl_FragColor = vec4(0.22, 0.68, 0.98, rim * glowIntensity);
      }
    `
  })
  const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat)
  rootGroup.add(atmoMesh)

  // 4. 东亚观测点（约 31°N, 112°E · 长江中下游/东亚季风区）脉冲标记环
  // Three.js SphereGeometry UV 映射：u = (lon + 180) / 360 => phi = PI + lonRad
  const markerGroup = new THREE.Group()
  const latRad = (31 * Math.PI) / 180
  const lonRad = (112 * Math.PI) / 180
  const phi = Math.PI + lonRad
  const rMarker = radius * 1.022
  const mx = -rMarker * Math.cos(latRad) * Math.cos(phi)
  const my = rMarker * Math.sin(latRad)
  const mz = rMarker * Math.cos(latRad) * Math.sin(phi)
  markerGroup.position.set(mx, my, mz)
  markerGroup.lookAt(mx * 2, my * 2, mz * 2)

  const dotGeo = new THREE.CircleGeometry(0.044, 24)
  const dotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  const dotMesh = new THREE.Mesh(dotGeo, dotMat)

  const ringGeo = new THREE.RingGeometry(0.064, 0.096, 32)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide
  })
  const ringMesh = new THREE.Mesh(ringGeo, ringMat)
  markerGroup.add(dotMesh, ringMesh)
  earthMesh.add(markerGroup)

  // 姿态与交互状态：baseYaw 为巡航中心，默认围绕东亚（112°E 附近 ±14°）缓慢自转巡航，确保地球始终保持动态生命力且东亚大陆与标签不会失配
  let baseYaw = EAST_ASIA_VIEW.yaw
  let yaw = EAST_ASIA_VIEW.yaw
  let pitch = EAST_ASIA_VIEW.pitch
  let targetYaw = yaw
  let targetPitch = pitch
  let autoRotating = Boolean(initialRotating)
  let isDragging = false
  let disposed = false
  let animFrameId = null
  let isLooping = false
  let pulseClock = 0
  let cruiseClock = 0
  let lastViewLabel = ''

  function notifyViewLabel() {
    const label = resolveGlobeRegionLabel(yaw)
    if (label !== lastViewLabel) {
      lastViewLabel = label
      onViewChange(label, { yaw, pitch })
    }
  }

  function applyRotation() {
    earthMesh.rotation.y = yaw
    earthMesh.rotation.x = pitch
    if (cloudMesh) {
      cloudMesh.rotation.x = pitch * 0.92
    }
    notifyViewLabel()
  }
  applyRotation()

  // 指针拖拽（兼容鼠标与触摸，且触摸垂直滑动不拦截页面滚动）
  let activePointerId = null
  let startX = 0
  let startY = 0
  let lastX = 0
  let lastY = 0
  let dragGestureLocked = null // 'horizontal' | 'vertical' | null

  function onPointerDown(e) {
    if (disposed) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    activePointerId = e.pointerId
    startX = e.clientX
    startY = e.clientY
    lastX = e.clientX
    lastY = e.clientY
    dragGestureLocked = e.pointerType === 'mouse' ? 'horizontal' : null
    if (e.pointerType === 'mouse') {
      isDragging = true
      atmoMat.uniforms.glowIntensity.value = 0.92
      onDragChange(true, { yaw, pitch })
      try { canvas.setPointerCapture(e.pointerId) } catch {}
    }
  }

  function onPointerMove(e) {
    if (disposed || e.pointerId !== activePointerId) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    const totalDx = e.clientX - startX
    const totalDy = e.clientY - startY

    if (!dragGestureLocked) {
      if (Math.abs(totalDx) < 5 && Math.abs(totalDy) < 5) return
      // 如果手指主要是上下滑动，立即放行给浏览器原生垂直滚动
      if (Math.abs(totalDy) > Math.abs(totalDx) * 1.1) {
        dragGestureLocked = 'vertical'
        activePointerId = null
        return
      }
      dragGestureLocked = 'horizontal'
      isDragging = true
      atmoMat.uniforms.glowIntensity.value = 0.92
      onDragChange(true, { yaw, pitch })
      try { canvas.setPointerCapture(e.pointerId) } catch {}
    }

    if (dragGestureLocked !== 'horizontal') return

    lastX = e.clientX
    lastY = e.clientY
    targetYaw += dx * 0.0085
    targetPitch = Math.max(-1.05, Math.min(1.05, targetPitch + dy * 0.0065))
    baseYaw = targetYaw
    cruiseClock = 0
    yaw = targetYaw
    pitch = targetPitch
    applyRotation()
    onDragChange(true, { yaw, pitch })

    // 若当前暂停了自动动画循环，单次重绘以保证拖动即时响应
    if (!isLooping) {
      renderer.render(scene, camera)
    }
  }

  function endPointerDrag(e) {
    if (activePointerId === null || (e && e.pointerId !== activePointerId)) return
    try {
      if (e && canvas.hasPointerCapture?.(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId)
      }
    } catch {}
    activePointerId = null
    dragGestureLocked = null
    if (isDragging) {
      isDragging = false
      atmoMat.uniforms.glowIntensity.value = 0.65
      onDragChange(false, { yaw, pitch })
      if (!isLooping) {
        renderer.render(scene, camera)
      }
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', endPointerDrag)
  canvas.addEventListener('pointercancel', endPointerDrag)
  canvas.addEventListener('lostpointercapture', endPointerDrag)

  let lastTime = performance.now()
  function animate(now = performance.now()) {
    if (!isLooping || disposed) return
    animFrameId = requestAnimationFrame(animate)

    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now
    pulseClock += dt

    if (autoRotating && !isDragging) {
      cruiseClock += dt
      targetYaw = baseYaw + Math.sin(cruiseClock * 0.42) * 0.22
      yaw += (targetYaw - yaw) * 0.18
      pitch += (targetPitch - pitch) * 0.18
      applyRotation()
    } else if (!isDragging) {
      yaw += (targetYaw - yaw) * 0.22
      pitch += (targetPitch - pitch) * 0.22
      applyRotation()
    }

    if (cloudMesh) {
      cloudMesh.rotation.y = yaw + pulseClock * 0.036
    }

    // 东亚观测点呼吸脉冲
    const scale = 1 + Math.sin(pulseClock * 3.2) * 0.16
    ringMesh.scale.setScalar(scale)

    renderer.render(scene, camera)
  }

  function startLoop() {
    if (disposed || isLooping) return
    isLooping = true
    lastTime = performance.now()
    animate(lastTime)
  }

  function stopLoop() {
    isLooping = false
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
  }

  // 借助 SceneActivity：滚出视口或切到后台标签页时自动暂停渲染
  const activity = new SceneActivity({
    element: container,
    onActiveChange(active) {
      if (active) startLoop()
      else stopLoop()
    }
  })

  let resizeObserver = null
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (disposed || !container) return
      const w = Math.max(100, container.clientWidth || 240)
      const h = Math.max(100, container.clientHeight || 240)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      renderer.render(scene, camera)
    })
    resizeObserver.observe(container)
  }

  // 首帧立即渲染
  renderer.render(scene, camera)
  if (activity.isActive) {
    startLoop()
  }
  onReady()

  return {
    setAutoRotate(nextVal) {
      autoRotating = Boolean(nextVal)
      onRotationChange(autoRotating)
      if (autoRotating && activity.isActive) startLoop()
      else renderer.render(scene, camera)
    },
    toggleAutoRotate() {
      autoRotating = !autoRotating
      onRotationChange(autoRotating)
      if (autoRotating && activity.isActive) startLoop()
      return autoRotating
    },
    resetToEastAsia() {
      baseYaw = EAST_ASIA_VIEW.yaw
      cruiseClock = 0
      targetYaw = EAST_ASIA_VIEW.yaw
      targetPitch = EAST_ASIA_VIEW.pitch
      yaw = EAST_ASIA_VIEW.yaw
      pitch = EAST_ASIA_VIEW.pitch
      applyRotation()
      renderer.render(scene, camera)
      onDragChange(false, { yaw, pitch })
    },
    getState() {
      return {
        autoRotating,
        isLooping,
        isActive: activity.isActive,
        yaw: Math.round(yaw * 100) / 100,
        pitch: Math.round(pitch * 100) / 100,
        regionLabel: resolveGlobeRegionLabel(yaw)
      }
    },
    dispose() {
      if (disposed) return
      disposed = true
      stopLoop()
      activity.dispose()
      resizeObserver?.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endPointerDrag)
      canvas.removeEventListener('pointercancel', endPointerDrag)
      canvas.removeEventListener('lostpointercapture', endPointerDrag)
      earthGeo.dispose()
      earthMat.dispose()
      surfaceTexture?.dispose()
      if (cloudMesh) {
        cloudMesh.geometry.dispose()
        cloudMesh.material.dispose()
      }
      cloudTexture?.dispose()
      atmoGeo.dispose()
      atmoMat.dispose()
      dotGeo.dispose()
      dotMat.dispose()
      ringGeo.dispose()
      ringMat.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }
}
