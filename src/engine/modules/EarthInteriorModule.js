import * as THREE from 'three'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const ANNOTATION_LAYERS = [
  { name: '地壳', color: '#4a90d9', pos: [1.4, 0.5, 0], props: ['厚度 5-70km', '温度 地表~1000°C', '组成 花岗岩/玄武岩', '状态 固态'] },
  { name: '地幔', color: '#e67e22', pos: [1.1, -0.8, 0.8], props: ['厚度 ~2900km', '温度 1000-3700°C', '密度 3.3-5.7 g/cm³', '组成 橄榄岩'] },
  { name: '外核', color: '#f39c12', pos: [0.8, 0.6, -0.4], props: ['厚度 ~2210km', '温度 3700-4500°C', '组成 Fe+Ni', '状态 液态'] },
  { name: '内核', color: '#f1c40f', pos: [0.5, -0.3, -0.5], props: ['半径 ~1220km', '温度 ~5500°C', '密度 ~13 g/cm³', '状态 固态'] },
]

const DISCONTINUITIES = [
  { name: '莫霍界面', radius: 1.0, color: '#6688aa' },
  { name: '古登堡界面', radius: 0.85, color: '#6688aa' },
]

export function EarthInteriorModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const isProfessional = params.mode === 'professional'

  const clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0.3, 0.5), 0.1)

  const innerCoreGeo = GeometryFactory.sphere(0.3, 48)
  const innerCoreMat = MaterialLibrary.emissive({ color: 0xf1c40f, intensity: 0.5 })
  innerCoreMat.roughness = 0.3
  innerCoreMat.metalness = 0.7
  const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat)
  group.add(innerCore)

  const outerCoreGeo = GeometryFactory.sphere(0.55, 48)
  const outerCoreMat = MaterialLibrary.clipPBR({
    color: 0xf39c12,
    clippingPlanes: [clipPlane],
    emissive: 0xf39c12,
    emissiveIntensity: 0.15,
  })
  const outerCore = new THREE.Mesh(outerCoreGeo, outerCoreMat)
  group.add(outerCore)

  const mantleGeo = GeometryFactory.sphere(0.85, 48)
  const mantleMat = MaterialLibrary.clipPBR({
    color: 0xe67e22,
    clippingPlanes: [clipPlane],
    emissive: 0xe67e22,
    emissiveIntensity: 0.08,
  })
  const mantle = new THREE.Mesh(mantleGeo, mantleMat)
  group.add(mantle)

  const crustGeo = GeometryFactory.sphere(1.0, 48)
  const crustMat = MaterialLibrary.clipPBR({
    color: 0x4a90d9,
    clippingPlanes: [clipPlane],
    roughness: 0.5,
    opacity: 0.8,
  })
  const crust = new THREE.Mesh(crustGeo, crustMat)
  group.add(crust)

  DISCONTINUITIES.forEach(d => {
    const torusGeo = GeometryFactory.torus(d.radius, 0.015, 16, 64)
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x6688aa,
      transparent: true,
      opacity: 0.5,
    })
    const torus = new THREE.Mesh(torusGeo, torusMat)
    torus.rotation.x = Math.PI / 2
    group.add(torus)
  })

  if (labelSystem) {
    ANNOTATION_LAYERS.forEach(l => {
      labelSystem.addToGroup(group, l.name, new THREE.Vector3(...l.pos), {
        color: l.color,
        fontSize: '14px',
        fontWeight: '600',
      })
      if (isProfessional) {
        l.props.forEach((prop, i) => {
          labelSystem.addToGroup(group, prop,
            new THREE.Vector3(l.pos[0], l.pos[1] - 0.22 - i * 0.17, l.pos[2]),
            { color: '#aaa', fontSize: '10px', fontWeight: '400' })
        })
      }
    })
    DISCONTINUITIES.forEach(d => {
      const angle = d.radius === 1.0 ? Math.PI / 4 : -Math.PI / 4
      const px = d.radius * Math.cos(angle)
      const pz = d.radius * Math.sin(angle)
      labelSystem.addToGroup(group, d.name, new THREE.Vector3(px, 0, pz * 1.3), {
        color: d.color,
        fontSize: '11px',
      })
    })
  }

  const api = {
    update(dt, elapsed) {
      group.rotation.y += 0.3 * dt
    },
    setMode(mode) {},
    setParams(params) {},
    dispose() {},
  }
  group.userData = { api }

  return group
}
