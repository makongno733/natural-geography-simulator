import * as THREE from 'three'

export class GeometryFactory {
  static sphere(radius, segments = 48) {
    return new THREE.SphereGeometry(radius, segments, segments)
  }

  static cylinder(radiusTop, radiusBottom, height, segments = 32) {
    return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments)
  }

  static torus(radius, tube = 0.05, radialSegments = 16, tubularSegments = 48) {
    return new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments)
  }

  static ring(innerRadius, outerRadius, segments = 64) {
    return new THREE.RingGeometry(innerRadius, outerRadius, segments)
  }

  static plane(width, height, segW = 1, segH = 1) {
    return new THREE.PlaneGeometry(width, height, segW, segH)
  }

  static box(width, height, depth) {
    return new THREE.BoxGeometry(width, height, depth)
  }

  static spiralPoints(radiusFn, heightFn, count) {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const t = i / count
      const angle = t * Math.PI * 6
      const r = radiusFn(t)
      const h = heightFn(t)
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = h
      positions[i * 3 + 2] = Math.sin(angle) * r
    }
    return positions
  }

  static arcPoints(startAngle, endAngle, radius, height, segments = 64) {
    const pts = []
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const angle = startAngle + (endAngle - startAngle) * t
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius))
    }
    return pts
  }

  static ringPoints(radius, height, segments = 64) {
    return GeometryFactory.arcPoints(0, Math.PI * 2, radius, height, segments)
  }

  static lineFromPoints(points, color = 0xffffff, opacity = 0.5) {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }))
  }

  static starField(count = 2000, radius = 1000) {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * radius * 2
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8,
    })
    return new THREE.Points(geo, mat)
  }

  static spiralTube(latStart, latEnd, earthRadius, heightOffset, color, tubeRadius = 0.03, segments = 200) {
    const pts = []
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const lat = latStart + (latEnd - latStart) * t
      const lon = t * Math.PI * 4
      const latRad = (lat * Math.PI) / 180
      const r = earthRadius + heightOffset * Math.sin(t * Math.PI)
      pts.push(new THREE.Vector3(
        r * Math.cos(latRad) * Math.cos(lon),
        r * Math.sin(latRad),
        r * Math.cos(latRad) * Math.sin(lon),
      ))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    return new THREE.TubeGeometry(curve, segments * 2, tubeRadius, 8, false)
  }

  // Transparent atmospheric shells around an Earth sphere
  static atmosphereShells(earthRadius, scaleKmToWorld = 6 / 1000) {
    const layers = [
      { name: '对流层', alt: [0, 12], color: 0x4a9eff },
      { name: '平流层', alt: [12, 50], color: 0xffaa44 },
      { name: '中间层', alt: [50, 85], color: 0x9966ff },
      { name: '热层', alt: [85, 500], color: 0xff4466 },
    ]
    const group = new THREE.Group()
    layers.forEach((d, idx) => {
      const rOuter = earthRadius + (d.alt[1] * scaleKmToWorld)
      const rInner = earthRadius + (d.alt[0] * scaleKmToWorld)
      const rMid = (rOuter + rInner) / 2
      const shell = new THREE.Mesh(
        GeometryFactory.sphere(rMid, 48),
        new THREE.MeshBasicMaterial({
          color: d.color, transparent: true,
          opacity: 0.05 + idx * 0.005,
          side: THREE.DoubleSide, depthWrite: false,
        }),
      )
      group.add(shell)
    })
    return group
  }
}
