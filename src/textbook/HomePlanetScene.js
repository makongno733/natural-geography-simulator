import * as THREE from 'three'

function setOpacity(body, value) {
  body.userData.opacityMaterials.forEach(material => { material.opacity = value })
  if (body.userData.atmosphere) body.userData.atmosphere.material.uniforms.fade.value = value
}

function disposeBody(body) {
  body.traverse(child => {
    child.geometry?.dispose()
    child.material?.dispose()
  })
  body.removeFromParent()
}

function addSaturnRings(body, texture) {
  const geometry = new THREE.RingGeometry(1.48, 2.12, 128, 1)
  const positions = geometry.attributes.position
  const uv = geometry.attributes.uv
  for (let i = 0; i < positions.count; i++) {
    const radius = Math.hypot(positions.getX(i), positions.getY(i))
    uv.setXY(i, (radius - 1.48) / (2.12 - 1.48), 0.5)
  }
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: false })
  const ring = new THREE.Mesh(geometry, material)
  ring.rotation.x = 1.05
  ring.rotation.z = -0.22
  body.add(ring)
  body.userData.opacityMaterials.push(material)
}

function makeBody(planet, texture, ringTexture) {
  const body = new THREE.Group()
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(planet.radius, 96, 64),
    new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: 0.96, metalness: 0, transparent: true })
  )
  sphere.rotation.y = planet.yaw || 0
  sphere.rotation.x = planet.pitch || 0
  body.add(sphere)
  body.userData.surface = sphere
  body.userData.opacityMaterials = [sphere.material]

  if (planet.id === 'earth') {
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(planet.radius + 0.035, 64, 48),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { fade: { value: 1 } },
        vertexShader: `varying vec3 vNormal; varying vec3 vView;
          void main() { vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal); vView = normalize(-viewPosition.xyz);
            gl_Position = projectionMatrix * viewPosition; }`,
        fragmentShader: `uniform float fade; varying vec3 vNormal; varying vec3 vView;
          void main() { float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 3.0);
            gl_FragColor = vec4(0.13, 0.48, 0.88, rim * 0.56 * fade); }`,
      })
    )
    body.add(atmosphere)
    body.userData.atmosphere = atmosphere
  }
  if (planet.id === 'saturn' && ringTexture) addSaturnRings(body, ringTexture)
  return body
}

// 只维护一个 WebGL 场景。切换时短暂同时渲染前后两颗天体，再回收旧几何体。
export function HomePlanetModule({ reduceMotion, onTransitionDone }) {
  return (scene, params, services) => {
    const group = new THREE.Group()
    let current = null
    let transition = null
    let disposed = false
    const camera = services.cameraRig.camera

    const api = {
      show(planet, texture, ringTexture, direction = 1) {
        if (disposed) return
        if (transition) {
          disposeBody(transition.from)
          transition = null
        }
        const next = makeBody(planet, texture, ringTexture)
        group.add(next)
        if (!current || reduceMotion) {
          if (current) disposeBody(current)
          current = next
          camera.position.z = planet.distance || 4.8
          onTransitionDone()
          return
        }
        next.position.x = direction * 2.2
        next.scale.setScalar(0.78)
        setOpacity(next, 0)
        transition = {
          from: current, to: next, direction, elapsed: 0,
          startDistance: camera.position.z, endDistance: planet.distance || 4.8,
        }
        current = next
      },
      focusChina() {
        current?.userData.surface.rotation.set(0.55, 2.4, 0)
      },
      update(dt) {
        if (!transition) return
        transition.elapsed += dt
        const progress = Math.min(1, transition.elapsed / 0.72)
        const eased = progress * progress * (3 - 2 * progress)
        const { from, to, direction, startDistance, endDistance } = transition
        from.position.x = -direction * 1.8 * eased
        from.scale.setScalar(1 - 0.2 * eased)
        setOpacity(from, 1 - eased)
        to.position.x = direction * 2.2 * (1 - eased)
        to.scale.setScalar(0.78 + 0.22 * eased)
        setOpacity(to, eased)
        camera.position.z = startDistance + (endDistance - startDistance) * eased
        if (progress === 1) {
          disposeBody(from)
          transition = null
          onTransitionDone()
        }
      },
      dispose() { disposed = true },
    }
    group.userData.api = api
    return group
  }
}
