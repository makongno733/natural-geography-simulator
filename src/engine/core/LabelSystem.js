import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export class LabelSystem {
  constructor(container) {
    this.renderer = new CSS2DRenderer()
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0'
    this.renderer.domElement.style.left = '0'
    this.renderer.domElement.style.pointerEvents = 'none'
    container.appendChild(this.renderer.domElement)
    this._labels = []
  }

  createLabel(text, position, style = {}) {
    const div = document.createElement('div')
    div.textContent = text
    Object.assign(div.style, {
      color: '#fff',
      fontSize: '13px',
      fontWeight: '600',
      textShadow: '0 0 8px rgba(0,0,0,0.8)',
      background: 'rgba(0,0,0,0.5)',
      padding: '2px 8px',
      borderRadius: '4px',
      whiteSpace: 'nowrap',
      pointerEvents: style.clickable ? 'auto' : 'none',
      cursor: style.clickable ? 'pointer' : 'default',
    })
    // Apply custom style overrides
    for (const [key, val] of Object.entries(style)) {
      if (key === 'clickable' || key === 'onClick') continue
      div.style[key] = val
    }

    const label = new CSS2DObject(div)
    label.position.copy(position)
    label.userData = { clickable: style.clickable }
    if (style.onClick) {
      label.userData.onClick = style.onClick
      div.addEventListener('click', style.onClick)
    }
    return label
  }

  addToGroup(group, text, position, style = {}) {
    const label = this.createLabel(text, position, style)
    group.add(label)
    this._labels.push(label)
    return label
  }

  clearAll(scene) {
    this._labels.forEach(l => {
      if (l.parent) l.parent.remove(l)
      if (l.element && l.element.parentNode) {
        l.element.parentNode.removeChild(l.element)
      }
    })
    this._labels = []
  }

  render(scene, camera) {
    this.renderer.render(scene, camera)
  }

  resize(container) {
    this.renderer.setSize(container.clientWidth, container.clientHeight)
  }

  dispose() {
    this.renderer.domElement.remove()
  }
}
