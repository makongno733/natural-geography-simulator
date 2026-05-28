import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { SOIL_LAYERS } from './soilData.js'

export class SoilProfileScene {
  constructor(container) {
    this.container = container
    this.mode = 'simple'
    this.currentLayers = SOIL_LAYERS.simple
    this.onLayerClick = null
    this.animFrameId = null

    this._initRenderers()
    this._initScene()
    this._initLights()
    this._initControls()
    this._buildProfile(this.currentLayers)
    this._animate()
  }

  _initRenderers() {
    const rect = this.container.getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.domElement.style.display = 'block'
    this.container.appendChild(this.renderer.domElement)

    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(this.width, this.height)
    this.labelRenderer.domElement.style.position = 'absolute'
    this.labelRenderer.domElement.style.top = '0'
    this.labelRenderer.domElement.style.left = '0'
    this.labelRenderer.domElement.style.pointerEvents = 'none'
    this.container.appendChild(this.labelRenderer.domElement)
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 100)
    this.camera.position.set(3.5, 2.5, 4.5)
    this.camera.lookAt(0, 0, 0)
  }

  _initLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambient)

    const dir = new THREE.DirectionalLight(0xffffff, 1.2)
    dir.position.set(5, 10, 7)
    dir.castShadow = true
    this.scene.add(dir)

    const rim = new THREE.DirectionalLight(0xffffcc, 0.4)
    rim.position.set(-3, 5, -5)
    this.scene.add(rim)
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.1
    this.controls.minDistance = 2.5
    this.controls.maxDistance = 10
    this.controls.target.set(0, 0, 0)
    this.controls.maxPolarAngle = Math.PI / 2
    this.controls.update()
  }

  _buildProfile(layers) {
    if (this.profileGroup) {
      this.scene.remove(this.profileGroup)
      this.profileGroup.traverse(c => {
        if (c.geometry) c.geometry.dispose()
        if (c.material) c.material.dispose()
      })
    }
    if (this.labelGroup) {
      this.scene.remove(this.labelGroup)
      this.labelGroup.traverse(c => {
        if (c.element && c.element.parentNode) {
          c.element.parentNode.removeChild(c.element)
        }
      })
    }

    this.profileGroup = new THREE.Group()
    this.labelGroup = new THREE.Group()
    this.layerMeshes = []

    let yOffset = -1
    const totalHeight = 2
    const radius = 0.8

    layers.forEach((layer) => {
      const height = layer.thickness * totalHeight
      const yPos = yOffset + height / 2

      const geometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1)
      const material = new THREE.MeshStandardMaterial({
        color: layer.color,
        roughness: 0.7,
        metalness: 0.05,
        transparent: true,
        opacity: 0.92
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.y = yPos
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData = { layerId: layer.id }
      this.profileGroup.add(mesh)
      this.layerMeshes.push(mesh)

      // horizon line
      const edgeGeo = new THREE.RingGeometry(radius - 0.005, radius, 48)
      const edgeMat = new THREE.MeshBasicMaterial({
        color: 0x333333, transparent: true, opacity: 0.25, side: THREE.DoubleSide
      })
      const edge = new THREE.Mesh(edgeGeo, edgeMat)
      edge.rotation.x = -Math.PI / 2
      edge.position.y = yPos - height / 2
      if (yOffset > -1) this.profileGroup.add(edge)

      // label
      const labelDiv = document.createElement('div')
      labelDiv.textContent = layer.label
      labelDiv.style.color = '#fff'
      labelDiv.style.fontSize = '14px'
      labelDiv.style.fontWeight = '600'
      labelDiv.style.textShadow = '0 1px 4px rgba(0,0,0,0.8)'
      labelDiv.style.background = 'rgba(0,0,0,0.55)'
      labelDiv.style.padding = '4px 10px'
      labelDiv.style.borderRadius = '4px'
      labelDiv.style.whiteSpace = 'nowrap'
      labelDiv.style.pointerEvents = 'auto'
      labelDiv.style.cursor = 'pointer'

      const infoIcon = document.createElement('span')
      infoIcon.textContent = ' ⓘ'
      infoIcon.style.color = '#ffd700'
      infoIcon.style.cursor = 'pointer'
      infoIcon.style.marginLeft = '4px'
      labelDiv.appendChild(infoIcon)

      labelDiv.addEventListener('click', (e) => {
        e.stopPropagation()
        if (this.onLayerClick) this.onLayerClick(layer, this.mode)
      })

      const label = new CSS2DObject(labelDiv)
      label.position.set(radius + 0.6, yPos, 0)
      this.labelGroup.add(label)

      yOffset += height
    })

    // shadow catcher
    const groundGeo = new THREE.PlaneGeometry(6, 6)
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.25 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1.02
    ground.receiveShadow = true
    this.profileGroup.add(ground)

    this.scene.add(this.profileGroup)
    this.scene.add(this.labelGroup)
  }

  setMode(mode) {
    this.mode = mode
    this.currentLayers = SOIL_LAYERS[mode]
    this._buildProfile(this.currentLayers)
    this.controls.update()
  }

  setOnLayerClick(callback) {
    this.onLayerClick = callback
  }

  resize() {
    const rect = this.container.getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)
    this.labelRenderer.setSize(this.width, this.height)
  }

  _animate() {
    this.animFrameId = requestAnimationFrame(() => this._animate())
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.labelRenderer.render(this.scene, this.camera)
  }

  dispose() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId)
    this.controls.dispose()
    this.scene.traverse(c => {
      if (c.geometry) c.geometry.dispose()
      if (c.material) c.material.dispose()
    })
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
    if (this.labelRenderer.domElement.parentNode) {
      this.labelRenderer.domElement.parentNode.removeChild(this.labelRenderer.domElement)
    }
    this.renderer.dispose()
    this.labelRenderer.dispose()
  }
}
