// [M10] MapProjectionModule — 地图投影教学 — 粗网格展开+高清球体

import * as THREE from 'three'

/* ── High-res Earth texture ── */
function earthTexture(size) {
  const c = document.createElement('canvas')
  c.width = size; c.height = size / 2
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#3a7cc3'; ctx.fillRect(0, 0, c.width, c.height)

  const draw = (color) => (polys) => { ctx.fillStyle = color; polys.forEach(p => { ctx.beginPath(); p.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * c.width; const y = (90 - la) / 180 * c.height; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }); ctx.closePath(); ctx.fill() }) }
  const L = draw('#5a9e3e'), G = draw('#7ab86a')
  L([[[-17,15],[10,16],[18,18],[22,16],[26,16],[30,20],[34,25],[34,30],[32,32],[28,33],[22,34],[14,34],[6,33],[0,30],[-5,27],[-12,24],[-18,22],[-25,20],[-33,18],[-35,20],[-32,17],[-25,16],[-17,15]]])
  L([[[-10,36],[5,39],[15,44],[30,50],[45,54],[60,56],[75,57],[90,58],[105,58],[120,57],[135,54],[145,50],[150,50],[160,55],[170,60],[180,65],[180,72],[165,72],[145,70],[120,68],[95,66],[72,65],[58,62],[45,58],[32,55],[20,52],[8,48],[-3,44],[-10,36]]])
  G([[[68,10],[72,18],[76,30],[79,35],[81,32],[80,24],[80,16],[78,12],[75,8],[70,8],[68,10]]])
  L([[[-135,55],[-140,62],[-148,70],[-155,72],[-162,68],[-166,62],[-162,52],[-155,42],[-145,36],[-135,32],[-125,26],[-115,22],[-105,18],[-95,15],[-86,12],[-80,8],[-76,12],[-72,18],[-68,25],[-62,32],[-55,38],[-48,44],[-42,50],[-36,55],[-30,62],[-24,68],[-18,76],[-10,82],[0,86],[15,84],[30,80],[42,74],[55,67],[66,60],[76,55],[86,55],[100,50],[98,48],[86,48],[76,52],[-135,55]]])
  L([[[-78,-2],[-72,8],[-68,2],[-60,-6],[-50,-10],[-40,-12],[-28,-18],[-18,-24],[-8,-30],[2,-36],[12,-42],[22,-48],[32,-54],[42,-58],[50,-62],[55,-68],[58,-74],[54,-76],[48,-72],[40,-68],[32,-64],[22,-60],[14,-55],[6,-50],[-2,-44],[-8,-38],[-14,-30],[-20,-22],[-28,-16],[-38,-12],[-48,-8],[-58,-4],[-68,4],[-76,4],[-78,-2]]])
  L([[[115,-14],[118,-20],[124,-26],[132,-32],[138,-36],[142,-34],[145,-26],[148,-18],[150,-10],[152,-14],[152,-22],[148,-32],[142,-38],[135,-38],[128,-32],[120,-24],[115,-18],[115,-14]]])
  L([[[-52,60],[-42,64],[-30,70],[-22,78],[-18,82],[-28,84],[-42,82],[-52,76],[-60,68],[-64,60],[-52,60]]])
  L([[[130,32],[135,38],[140,42],[144,41],[144,36],[140,31],[135,30],[130,32]]])
  L([[[44,-14],[47,-20],[48,-26],[46,-26],[43,-20],[42,-14],[44,-14]]])
  L([[[166,-36],[170,-42],[174,-46],[176,-48],[174,-46],[170,-42],[166,-38],[166,-36]]])
  L([[[-180,-65],[-120,-70],[-60,-76],[0,-82],[60,-76],[120,-70],[180,-65],[120,-72],[60,-78],[0,-80],[-60,-74],[-120,-68],[-180,-65]]])
  L([[[95,0],[105,6],[115,4],[120,-4],[114,-6],[105,-4],[98,-3],[95,0]]])
  L([[[32,29],[38,32],[45,38],[54,40],[58,36],[54,32],[46,28],[38,24],[32,26],[32,29]]])
  L([[[-86,12],[-84,18],[-80,22],[-78,20],[-82,12],[-86,8],[-86,12]]])

  // Ice caps
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillRect(0, 0, c.width, c.height * 0.03)
  ctx.fillRect(0, c.height * 0.97, c.width, c.height * 0.03)

  return new THREE.CanvasTexture(c)
}

/* ── Projection equations ── */
const PF = {
  equirectangular: (la, lo) => [lo / Math.PI, la / (Math.PI / 2)],
  mercator: (la, lo) => [lo / Math.PI, Math.log(Math.tan(Math.PI / 4 + la / 2)) / Math.PI * 0.7],
  mollweide(la, lo) { let t = la; for (let i = 0; i < 5; i++) t -= (2 * t + Math.sin(2 * t) - Math.PI * Math.sin(la)) / (2 + 2 * Math.cos(2 * t)); return [lo * Math.cos(t) / Math.PI, Math.sin(t)] },
  sinusoidal: (la, lo) => [lo * Math.cos(la) / Math.PI, la / (Math.PI / 2)],
  robinson(la, lo) { const a = Math.abs(la) * 180 / Math.PI; const yt = [0,0.032,0.063,0.093,0.122,0.148,0.171,0.192,0.21,0.225,0.237,0.247,0.254,0.259,0.261,0.262,0.26,0.256,0.249,0.24]; const xt = [1,0.999,0.996,0.99,0.98,0.968,0.952,0.933,0.91,0.884,0.854,0.82,0.783,0.743,0.7,0.655,0.608,0.56,0.512,0.464]; const i = Math.min(18, Math.floor(a / 5)), f = (a / 5) - i, s = Math.sign(la); return [lo * (xt[i] + f * (xt[i + 1] - xt[i])) / Math.PI, s * (yt[i] + f * (yt[i + 1] - yt[i])) * 2 / 0.5072] },
  winkel_tripel(la, lo) { let t = la; for (let i = 0; i < 4; i++) t -= (2 * t + Math.sin(2 * t) - Math.PI * Math.sin(la)) / (2 + 2 * Math.cos(2 * t)); return [(lo / Math.PI + lo * Math.cos(t) / Math.PI) / 2, (la / (Math.PI / 2) + Math.sin(t)) / 2] },
  aitoff(la, lo) { const c = Math.acos(Math.cos(la) * Math.cos(lo / 2)) || 0.001; return [2 * Math.cos(la) * Math.sin(lo / 2) / (c / Math.sin(c)), Math.sin(la) / (c / Math.sin(c))] },
  hammer(la, lo) { const z = Math.sqrt(1 + Math.cos(la) * Math.cos(lo / 2)); return [Math.cos(la) * Math.sin(lo / 2) / z, Math.sin(la) / z] },
  bonne(la) { const s0 = 45 * Math.PI / 180; const cot = 1 / Math.tan(s0); return { p: cot + s0 - la, cot } },
  van_der_grinten(la, lo) { const a = Math.abs(la), pl = lo / Math.PI; if (a < 0.0001) return [pl, 0]; const th = Math.asin(2 * a / Math.PI); return [pl * (Math.cos(th) + 1) / 2, Math.sign(la) * Math.sin(th) / 2 * 1.2] },
  eckert4(la, lo) { let t = la * 0.8; for (let i = 0; i < 4; i++) t -= (t + Math.sin(t) * Math.cos(t) + 2 * Math.sin(t) - (2 + Math.PI / 2) * Math.sin(la)) / (2 * Math.cos(t) * (1 + Math.cos(t))); const A = Math.sqrt(3) / (2 * Math.sqrt(Math.PI)); return [lo * Math.cos(t) * 2 * A / Math.PI, Math.sin(t) / A] },
}

const PROJECTIONS = [
  { id: 'mercator', name: '墨卡托', en: 'Mercator (1569)', cat: '圆柱', prop: '等角', fn: PF.mercator,
    desc: '圆柱面切赤道，经纬线正交成矩形网格。角度无任何变形，任意两点连线的方位角保真——这是航海者最需要的性质。但代价惨重：格陵兰看起来和非洲一样大，实际上后者是前者的14倍。1569年佛兰德人墨卡托为航海图发明，至今 Google Maps、OpenStreetMap 等几乎所有网络地图仍沿用 Web Mercator 变体。' },
  { id: 'transverse_mercator', name: '横轴墨卡托', en: 'Transverse Mercator', cat: '圆柱', prop: '等角', fn: PF.mercator,
    desc: '将圆柱横过来，使切线与某条经线重合而非赤道。中央经线两侧各约3°范围内变形极小，因此全球被划分为60个6°宽的 UTM 带，每带独立投影。中国采用的高斯-克吕格投影本质相同，只是分带方式略有差异。各国大比例尺地形图、工程测量、军事制图的首选。' },
  { id: 'equirectangular', name: '等距圆柱', en: 'Equirectangular', cat: '圆柱', prop: '等距', fn: PF.equirectangular,
    desc: '最古老也最简单的投影——经纬线直接拉成等间距方格。经线方向距离保真，纬线方向随纬度升高逐渐被拉伸。优点是计算快、图像像素与经纬度一一对应，因此成为计算机纹理映射的标准方式。任何球面图像要贴在3D模型上，第一步就是变成等距圆柱图。缺点是两极地区严重扁平化。' },
  { id: 'gall_peters', name: '高尔-彼得斯', en: 'Gall–Peters', cat: '圆柱', prop: '等积', fn: PF.mercator,
    desc: '圆柱面割线置于南北纬45°，使得中低纬面积比例保真。在墨卡托投影中非洲和南美洲被严重缩小，而高尔-彼得斯纠正了这一点，让热带发展中国家"看起来更大"——这引发了1970-80年代一场著名的"地图战争"。联合国教科文组织和许多NGO推广此投影以促进全球公平认知，但两极地区仍然被剧烈压扁。' },
  { id: 'mollweide', name: '摩尔维德', en: 'Mollweide', cat: '伪圆柱', prop: '等积', fn: PF.mollweide,
    desc: '外形是一个优雅的2:1椭圆，面积处处保真。中央经线为直线，其余经线呈椭圆弧弯曲。全球气候带分布图、生物群落图、海洋洋流图的经典底图选择，因为面积保真意味着每个区域的"视觉权重"与实际面积成正比。1805年德国数学家摩尔维德提出，至今仍是科学出版中最常用的等积世界投影之一。' },
  { id: 'sinusoidal', name: '正弦曲线', en: 'Sinusoidal', cat: '伪圆柱', prop: '等积', fn: PF.sinusoidal,
    desc: '所有纬线都是平行的等距直线，长度保真；经线呈正弦曲线弯曲。赤道和中央经线完全没有变形，因此特别适合展示赤道附近的热带地理数据。NASA 的 MODIS 卫星数据即采用正弦曲线投影存储全球影像。缺点是边缘地区经线交叉角度锐利，高纬地区形状扭曲明显。' },
  { id: 'robinson', name: '罗宾森', en: 'Robinson', cat: '伪圆柱', prop: '折衷', fn: PF.robinson,
    desc: '不做等角也不做等积，而是用查表法手工调整每一纬度的比例，追求"看起来最舒服"。两极轻微压扁，边缘柔和弯曲，既不像墨卡托那样极端变形，也不像摩尔维德那样椭得厉害。国家地理学会1963年委托罗宾森设计，1988年前一直是该学会世界全图标准。中国中小学教科书中的世界地图亦多用此投影。' },
  { id: 'winkel_tripel', name: '温克尔三重', en: 'Winkel Tripel', cat: '伪圆柱', prop: '折衷', fn: PF.winkel_tripel,
    desc: '将等距圆柱投影和艾托夫投影各取50%加权平均——"三重"指的就是三者折衷。结果是一个外形接近罗宾森但数学上更优雅的投影。国家地理学会在1998年用温克尔三重替换了罗宾森，成为其世界地图的新标准。整体变形分布极为均匀，被许多制图学家认为是目前最好的折衷世界投影。' },
  { id: 'goode', name: '古德分瓣', en: 'Goode Homolosine', cat: '伪圆柱', prop: '等积', fn: PF.mollweide,
    desc: '将摩尔维德投影（高纬用）和正弦曲线投影（低纬用）在南北纬40°处拼接，然后把海洋区域的投影面"切开"，让每个大陆单独展开。结果是面积保真的大陆完整呈现，代价是海洋被分割成几块。1923年古德发明，至今仍广泛用于全球土地利用、植被覆盖等专题制图。' },
  { id: 'eckert4', name: '埃克特 IV', en: 'Eckert IV', cat: '伪圆柱', prop: '等积', fn: PF.eckert4,
    desc: '面积保真的伪圆柱投影，外形为椭圆，极点映射为一条长度恰好为赤道一半的直线段。所有纬线平行等距，经线在极点附近急剧弯曲。外形比摩尔维德略圆润，与哈默投影外观相近。常用于需要面积对比的全球专题地图，如人口密度、碳排放分布等。' },
  { id: 'van_der_grinten', name: '范德格林顿', en: 'Van der Grinten', cat: '伪圆柱', prop: '折衷', fn: PF.van_der_grinten,
    desc: '将整个世界地图塞进一个正圆内，极点和边缘用圆弧过渡。范德格林顿在1904年设计，美国国家地理学会从1922年到1988年一直使用它作为标准世界地图——整整66年。虽然变形模式不如后来的罗宾森或温克尔三重优秀，但那标志性的圆形轮廓给几代人留下了深刻印象。' },
  { id: 'aitoff', name: '艾托夫', en: 'Aitoff', cat: '伪方位', prop: '折衷', fn: PF.aitoff,
    desc: '将横轴等距方位投影的经线间距加倍处理，得到一个优雅的椭圆。赤道和中央经线保真，边缘弯曲柔和。1889年俄国人艾托夫提出，常被用于天球图（将天球展开为椭圆平面）。它是温克尔三重投影的两个"原料"之一，虽然单独使用已不多见，但作为基石投影影响深远。' },
  { id: 'hammer', name: '哈默', en: 'Hammer', cat: '伪方位', prop: '等积', fn: PF.hammer,
    desc: '将兰伯特等积方位投影横置并拉伸，得到一个面积保真的2:1椭圆。1892年哈默提出，是艾托夫投影的等积对应版本。外形与摩尔维德相似但边缘处理不同。全球人口密度分布图、生物多样性热点图的常用底图，因为每个区域的面积准确地代表了数据量。' },
  { id: 'orthographic', name: '正射投影', en: 'Orthographic', cat: '方位', prop: '透视', flat: false,
    desc: '模拟从无限远处用平行光透视地球——就是从太空中直视地球的样子。每次只能看到半个球面，越靠近边缘越压缩。不适用于量测（距离、面积、角度全部变形），但视觉效果无与伦比。地球仪图标、科普插图、航天宣传的标志性视角。NASA 的地球照片本质上都是正射投影。' },
  { id: 'stereographic', name: '球极平面', en: 'Stereographic', cat: '方位', prop: '等角', flat: false,
    desc: '投射点放在球面的对跖点上，投影面为通过球心的平面。所有圆在投影后仍是圆（包括大圆和小圆），角度完全保真。极地地区的天文导航、地震学中的震源机制解（赤平极射投影）、晶体学中的极图分析均依赖此投影。只适合展示半球范围，远离中心时变形急剧增大。' },
  { id: 'gnomonic', name: '日晷投影', en: 'Gnomonic', cat: '方位', prop: '大圆直线', flat: false,
    desc: '从球心向外投影到切平面。唯一一个让球面上所有大圆航线都变成直线的投影。这对航海和航空具有革命性意义：在日晷投影图上画一条直线，就是地球上的最短路径（大圆航线）。缺点是无法展示超过半个球面，边缘变形剧烈。主要用于规划跨洋航线。' },
  { id: 'azimuthal_equidistant', name: '等距方位', en: 'Azimuthal Equidistant', cat: '方位', prop: '等距', flat: false,
    desc: '从中心点出发，到任何其他点的距离和方位角都准确无误。如果你站在北极点，用这个投影画地图，任何方向的距离都是真实的。联合国会徽就是以北极为中心的等距方位投影，象征着从UN出发平等对待所有成员国。也用于无线电导航台站覆盖范围图、洲际弹道导弹射程示意图。' },
  { id: 'lambert_conic', name: '兰伯特等角圆锥', en: 'Lambert Conformal Conic', cat: '圆锥', prop: '等角', fn: PF.bonne,
    desc: '将圆锥面罩在球体上，割两条标准纬线（通常选择中纬度），角度完全保真。中国、美国、俄罗斯、加拿大等横跨中纬度的大国，其官方地形图系列几乎全部使用此投影。航空图的标配——因为等角性质意味着航线角度在地图上直接可量。1772年兰伯特发明，至今仍是应用最广泛的圆锥投影。' },
  { id: 'albers', name: '阿尔伯斯等积圆锥', en: 'Albers Equal-Area Conic', cat: '圆锥', prop: '等积', fn: PF.bonne,
    desc: '同样是圆锥面割两条标准纬线，但选择不同的缩放方式使得面积保真而非角度保真。美国地质调查局（USGS）将阿尔伯斯投影作为美国本土48州的标准投影。每当你看到一张美国的州界地图、选举结果图或人口普查图，大概率就是阿尔伯斯。1805年由德国人阿尔伯斯提出。' },
  { id: 'bonne', name: '彭纳投影', en: 'Bonne', cat: '圆锥', prop: '等积', fn: PF.bonne,
    desc: '伪圆锥投影：中央经线是直线，所有纬线是同心圆弧且等距分布，面积保真。外形呈优雅的心形，是16世纪文艺复兴时期最流行的世界地图样式。虽然现代已较少用于正式制图，但它的美学价值极高，常出现在古籍复刻和历史地图展览中。适合中纬度大陆如欧洲、北美的专题制图。' },
]
const CATS = [...new Set(PROJECTIONS.map(p => p.cat))]

/* ── Module ── */
export function MapProjectionModule(scene, params, services) {
  const { labelSystem, cameraRig } = services
  const group = new THREE.Group()
  const R = 1.5
  let current = null, unfold = 0, target = 0, flatMode = false, savedCam = null
  let sphereTarget = null, flatGridGroup = null
  let pendingProj = null // Queue next projection after sphere restore

  scene.background = new THREE.Color(0xf5f0e8)

  // High-res textured sphere
  const tex = earthTexture(2048) // Canvas fallback with continent polygons
  // Try loading real Blue Marble texture
  new THREE.TextureLoader().load(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1280px-Blue_Marble_2002.png',
    (loaded) => { loaded.colorSpace = THREE.SRGBColorSpace; sphereMat.map = loaded; sphereMat.needsUpdate = true },
    undefined, () => {} // silent fail, keep canvas texture
  )
  const sphereGeo = new THREE.SphereGeometry(R, 128, 64)
  const sphereMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide })
  const flatMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }) // No lighting, full brightness
  const sphere = new THREE.Mesh(sphereGeo, sphereMat)
  const sphereOrig = new Float32Array(sphereGeo.attributes.position.array)
  group.add(sphere)

  // ── Flat grid that appears after unfold ──
  flatGridGroup = new THREE.Group()
  flatGridGroup.visible = false
  group.add(flatGridGroup)

  function buildFlatGrid(proj) {
    flatGridGroup.clear()
    const fn = proj.fn || PF.equirectangular, S = R * 2.2, mL = 85 * Math.PI / 180
    const lM = (c) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.4, depthTest: false, depthWrite: false })
    const lb = (c) => ({ color: '#' + c.toString(16).padStart(6, '0'), fontSize: '10px', fontWeight: '700', background: 'rgba(255,255,255,0.95)', padding: '2px 5px', borderRadius: '3px' })
    const add = (pts, color, label, off) => {
      if (pts.length < 2) return
      flatGridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lM(color)))
      if (label && labelSystem) { const m = pts[Math.floor(pts.length * 0.55)]; labelSystem.addToGroup(flatGridGroup, label, m.clone().add(off || new THREE.Vector3(0, 0.05, 0)), lb(color)) }
    }
    const latCols = { 0: 0xcc3333, 23.5: 0xcc8833, '-23.5': 0xcc8833, 66.5: 0xcc6633, '-66.5': 0xcc6633 }
    ;[0, 23.5, -23.5, 66.5, -66.5].forEach(d => { const la = Math.max(-mL, Math.min(mL, d * Math.PI / 180)), p = []; for (let i = 0; i <= 160; i++) { try { const [x, y] = fn(la, (i / 160 - 0.5) * 2 * Math.PI); p.push(new THREE.Vector3((x || 0) * S, (y || 0) * S * 0.55, 0)) } catch (_) {} }; add(p, latCols[String(d)], d === 0 ? '0°' : `${Math.abs(d)}°${d > 0 ? 'N' : 'S'}`) })
    ;[0, 90, -90, 180].forEach(d => { const lo = d * Math.PI / 180, p = []; for (let i = 0; i <= 100; i++) { try { const [x, y] = fn((i / 100 - 0.5) * 2 * mL, lo); p.push(new THREE.Vector3((x || 0) * S, (y || 0) * S * 0.55, 0)) } catch (_) {} }; add(p, 0x3366cc, d === 0 ? '0°' : `${Math.abs(d)}°${d > 0 ? 'E' : 'W'}`, new THREE.Vector3(0.08, 0, 0)) })
  }

  // ── Lat/lon reference lines on sphere ──
  const crispLabel = (color) => ({ color, fontSize: '11px', fontWeight: '700', background: 'rgba(255,255,255,0.95)', padding: '2px 6px', borderRadius: '3px' })

  function addLatLine(latDeg, color, label) {
    const phi = (90 - latDeg) * Math.PI / 180; const r = Math.sin(phi) * R * 1.01; const y = Math.cos(phi) * R * 1.01
    const pts = []; for (let i = 0; i <= 100; i++) { const t = i / 100 * Math.PI * 2; pts.push(new THREE.Vector3(-Math.cos(t) * r, y, Math.sin(t) * r)) }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6, depthTest: true, linewidth: 1 }))
    group.add(line)
    if (label && labelSystem) labelSystem.addToGroup(group, label, new THREE.Vector3(0, y, r + 0.05), crispLabel('#' + color.toString(16).padStart(6, '0')))
    return line
  }
  function addLonLine(lonDeg, color, label) {
    const theta = lonDeg * Math.PI / 180; const pts = []
    for (let i = 0; i <= 100; i++) { const phi = i / 100 * Math.PI; pts.push(new THREE.Vector3(-Math.sin(phi) * Math.cos(theta) * R * 1.01, Math.cos(phi) * R * 1.01, Math.sin(phi) * Math.sin(theta) * R * 1.01)) }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6, depthTest: true }))
    group.add(line)
    if (label && labelSystem) {
      const mid = 45 * Math.PI / 180; labelSystem.addToGroup(group, label, new THREE.Vector3(-Math.sin(mid) * Math.cos(theta) * R * 1.08, Math.cos(mid) * R * 1.08, Math.sin(mid) * Math.sin(theta) * R * 1.08), crispLabel('#' + color.toString(16).padStart(6, '0')))
    }
    return line
  }
  addLatLine(0, 0xcc3333, '0°')
  addLatLine(23.5, 0xcc8833, '23.5°N')
  addLatLine(-23.5, 0xcc8833, '23.5°S')
  addLatLine(66.5, 0xcc6633, '66.5°N')
  addLatLine(-66.5, 0xcc6633, '66.5°S')
  addLonLine(0, 0x3366cc, '0°')
  addLonLine(90, 0x3366cc, '90°E')
  addLonLine(-90, 0x3366cc, '90°W')
  addLonLine(180, 0x3366cc, '180°')
  // Small arrow markers at key intersections
  const arrowGeo = new THREE.ConeGeometry(0.03, 0.1, 4)
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xcc3333 })
  const eqArrows = [[0, 0, R * 1.02, 0.05], [R * 1.02, 0, 0, -0.05]]
  eqArrows.forEach(([px, py, pz, ry]) => {
    const a = new THREE.Mesh(arrowGeo, arrowMat); a.position.set(px, py, pz); a.rotation.z = Math.PI / 2; a.rotation.y = ry; group.add(a)
  })


  /* ── Compute target positions ── */
  function computeTarget(origData, count, proj) {
    const fn = proj.fn || PF.equirectangular
    const tp = new Float32Array(count * 3)
    const S = R * 2.2
    const maxLat = 85 * Math.PI / 180 // Clamp to avoid infinity at poles
    for (let i = 0; i < count; i++) {
      const x = origData[i * 3], y = origData[i * 3 + 1], z = origData[i * 3 + 2]
      let lat = Math.asin(Math.max(-1, Math.min(1, y / R)))
      const lon = Math.atan2(z, x)
      lat = Math.max(-maxLat, Math.min(maxLat, lat))
      let px, py
      try {
        const r = fn(lat, lon)
        if (Array.isArray(r)) [px, py] = r
        else if (r && typeof r === 'object') { const b = r; const E = lon * Math.cos(lat) / (b.p || 0.001); px = b.p * Math.sin(E) * 0.6; py = (b.cot - b.p * Math.cos(E)) * 0.5 }
        else { px = lon / Math.PI; py = lat / (Math.PI / 2) }
      } catch (_) { px = lon / Math.PI; py = lat / (Math.PI / 2) }
      tp[i * 3] = (px || 0) * S
      tp[i * 3 + 1] = (py || 0) * S * 0.55
      tp[i * 3 + 2] = 0
    }
    return tp
  }

  function interpolateMesh(geo, orig, target, t, setNormals) {
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(i,
        orig[i * 3] + (target[i * 3] - orig[i * 3]) * t,
        orig[i * 3 + 1] + (target[i * 3 + 1] - orig[i * 3 + 1]) * t,
        orig[i * 3 + 2] + (target[i * 3 + 2] - orig[i * 3 + 2]) * t,
      )
    }
    pos.needsUpdate = true
    if (setNormals && t > 0.95) {
      // Force flat: all Z=0, all normals=(0,0,1)
      for (let i = 0; i < pos.count; i++) pos.setZ(i, 0)
      const n = geo.attributes.normal
      for (let i = 0; i < pos.count; i++) n.setXYZ(i, 0, 0, 1)
      n.needsUpdate = true
      pos.needsUpdate = true
    } else {
      geo.computeVertexNormals()
    }
  }

  /* ── Labels ── */
  function showLabel(id) {
    if (!labelSystem) return
    labelSystem.clearAll(scene)
    if (id === 'reset' || !id) {
      labelSystem.addToGroup(group, '原始状态 · 3D 球体', new THREE.Vector3(0, R + 1.5, 0), { color: '#222', fontSize: '20px', fontWeight: '700', background: 'rgba(255,255,255,0.98)', padding: '8px 16px', borderRadius: '6px' })
      labelSystem.addToGroup(group, '地球是近似的椭球体 · 经纬网已标注 · 拖拽旋转观察 · 点击右侧投影按钮展开', new THREE.Vector3(0, R + 1.0, 0), { color: '#555', fontSize: '13px', background: 'rgba(255,255,255,0.9)', padding: '4px 12px', borderRadius: '4px' })
      return
    }
    const p = PROJECTIONS.find(x => x.id === id)
    if (!p) return
    labelSystem.addToGroup(group, `${p.name} · ${p.en}`, new THREE.Vector3(0, R + 1.5, 0), { color: '#222', fontSize: '20px', fontWeight: '700', background: 'rgba(255,255,255,0.98)', padding: '8px 16px', borderRadius: '6px' })
    labelSystem.addToGroup(group, `${p.cat}投影 · ${p.prop}${p.flat === false ? ' · 3D视图' : ''}`, new THREE.Vector3(0, R + 1.05, 0), { color: '#888', fontSize: '13px', background: 'rgba(255,255,255,0.9)', padding: '3px 10px', borderRadius: '4px' })
    labelSystem.addToGroup(group, p.desc, new THREE.Vector3(0, R + 0.65, 0), { color: '#333', fontSize: '13px', fontWeight: '500', background: 'rgba(255,255,255,0.95)', padding: '8px 14px', borderRadius: '6px' })
  }

  /* ── API ── */
  showLabel('reset')

  const api = {
    setParams(p) {
      if (p.projection === undefined) return
      if (p.projection === 'reset') {
        current = 'reset'; target = 0; pendingProj = null
        showLabel('reset')
        return
      }
      const proj = PROJECTIONS.find(x => x.id === p.projection)
      if (!proj) return

      if (proj.flat === false) {
        // Azimuthal: stay sphere
        current = p.projection; target = 0; pendingProj = null
        sphereTarget = null
        showLabel(p.projection)
        return
      }

      // Already flat? Restore to sphere first, then unfold to new
      if (unfold > 0.5) {
        pendingProj = p.projection
        target = 0
        showLabel(p.projection)
      } else {
        current = p.projection; target = 1; pendingProj = null
        sphereTarget = computeTarget(sphereOrig, sphereGeo.attributes.position.count, proj)
        buildFlatGrid(proj)
        showLabel(p.projection)
      }
    },
    update(dt) {
      // Animate grid unfold/restore
      if (Math.abs(unfold - target) > 0.002) {
        unfold += (target - unfold) * 0.04
        if (target === 1 && sphereTarget) {
          interpolateMesh(sphereGeo, sphereOrig, sphereTarget, unfold, true)
        } else {
          const pos = sphereGeo.attributes.position
          for (let i = 0; i < pos.count; i++) {
            pos.setXYZ(i,
              pos.getX(i) + (sphereOrig[i * 3] - pos.getX(i)) * 0.04,
              pos.getY(i) + (sphereOrig[i * 3 + 1] - pos.getY(i)) * 0.04,
              pos.getZ(i) + (sphereOrig[i * 3 + 2] - pos.getZ(i)) * 0.04,
            )
          }
          pos.needsUpdate = true; sphereGeo.computeVertexNormals()
        }
      }

      // Camera: lock to flat map view when unfolded
      if (unfold > 0.95 && target === 1 && !flatMode && cameraRig) {
        flatMode = true
        savedCam = { pos: cameraRig.camera.position.clone(), look: cameraRig.controls.target.clone() }
      }
      if (flatMode && cameraRig) {
        const camTarget = new THREE.Vector3(0, 0, 7)
        const lookTarget = new THREE.Vector3(0, 0, 0)
        cameraRig.camera.position.lerp(camTarget, 0.08)
        cameraRig.controls.target.lerp(lookTarget, 0.08)
        // Snap when very close
        if (cameraRig.camera.position.distanceTo(camTarget) < 0.05) cameraRig.camera.position.copy(camTarget)
        if (cameraRig.controls.target.distanceTo(lookTarget) < 0.05) cameraRig.controls.target.copy(lookTarget)
        cameraRig.controls.enableRotate = false
        cameraRig.controls.update()
      }
      if (unfold < 0.1 && flatMode) {
        flatMode = false
        if (cameraRig) {
          cameraRig.controls.enableRotate = true
          if (savedCam) { cameraRig.camera.position.copy(savedCam.pos); cameraRig.controls.target.copy(savedCam.look); savedCam = null }
        }
      }

      // When fully restored to sphere, trigger pending projection
      if (unfold < 0.05 && pendingProj) {
        const proj = PROJECTIONS.find(x => x.id === pendingProj)
        if (proj) {
          current = pendingProj; target = 1; pendingProj = null
          sphereTarget = computeTarget(sphereOrig, sphereGeo.attributes.position.count, proj)
          buildFlatGrid(proj)
        }
      }

      // Fade sphere reference lines during unfold
      group.children.forEach(c => {
        if (c instanceof THREE.Line && c.material.color && (c.material.color.getHex() === 0xcc3333 || c.material.color.getHex() === 0xcc8833 || c.material.color.getHex() === 0xcc6633 || c.material.color.getHex() === 0x3366cc)) {
          c.material.opacity = 0.6 * (1 - unfold)
        }
      })

      // Switch to unlit material when flat — map stays bright
      if (unfold > 0.9 && sphere.material !== flatMat) {
        flatMat.map = sphereMat.map
        sphere.material = flatMat
      } else if (unfold < 0.1 && sphere.material !== sphereMat) {
        sphereMat.map = flatMat.map
        sphere.material = sphereMat
      }

      // Flat grid fade-in
      if (flatGridGroup) {
        flatGridGroup.visible = unfold > 0.5
        if (unfold > 0.5) {
          const alpha = Math.min(1, (unfold - 0.5) / 0.5)
          flatGridGroup.children.forEach(c => {
            if (c.material && c.material.opacity !== undefined) c.material.opacity = 0.4 * alpha
          })
        }
      }

      // Rotate when sphere
      if (unfold < 0.05) { sphere.rotation.y += dt * 0.06 }
    },
    dispose() {},
  }
  group.userData = { api }
  return group
}

export { PROJECTIONS, CATS }
