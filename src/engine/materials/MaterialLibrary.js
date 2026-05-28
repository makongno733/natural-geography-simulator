import * as THREE from 'three'

export const MaterialPreset = {
  STUDIO: 'studio',
  SUNLIT: 'sunlit',
  DRAMATIC: 'dramatic',
}

export class MaterialLibrary {
  static pbr({ color, roughness = 0.5, metalness = 0.1, map = null, normalMap = null, emissive = 0x000000, emissiveIntensity = 0, transparent = false, opacity = 1.0, side = THREE.FrontSide }) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      map,
      normalMap,
      emissive,
      emissiveIntensity,
      transparent,
      opacity,
      side,
    })
  }

  static emissive({ color, intensity = 1.0 }) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: intensity,
      roughness: 0.3,
      metalness: 0.1,
    })
  }

  static transparent({ color, opacity = 0.5, blending = THREE.NormalBlending, depthWrite = true }) {
    return new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity,
      blending,
      depthWrite,
      roughness: 0.3,
      metalness: 0.05,
    })
  }

  static particle({ color = 0xffffff, size = 0.05, blending = THREE.NormalBlending, depthWrite = false, vertexColors = false }) {
    return new THREE.PointsMaterial({
      color,
      size,
      blending,
      depthWrite,
      vertexColors,
      transparent: true,
      opacity: vertexColors ? 1.0 : 0.8,
    })
  }

  static additiveParticle({ color, size = 0.05 }) {
    return MaterialLibrary.particle({ color, size, blending: THREE.AdditiveBlending })
  }

  static clipPBR({ color, clippingPlanes, roughness = 0.5, metalness = 0.3, opacity = 0.8, emissive = 0x000000, emissiveIntensity = 0 }) {
    return new THREE.MeshPhysicalMaterial({
      color,
      roughness,
      metalness,
      clippingPlanes,
      clipShadows: true,
      transparent: true,
      opacity,
      emissive,
      emissiveIntensity,
      side: THREE.DoubleSide,
    })
  }
}
