// [M11] GeologicTimeModule — 地质年代3D — 平滑过渡+圆盘地形+剖面

import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const ERAS = [
  { name:'冥古宙', en:'Hadean', start:4600, end:4000, color:0x660000, eon:'冥古宙', era:'—',
    desc:'地球吸积形成。月球~4.5Ga诞生。全球岩浆海洋。大气H₂,He,CH₄。', fossils:'无生命。最古老锆石(4.4Ga)。' },
  { name:'始太古宙', en:'Eoarchean', start:4000, end:3600, color:0x882222, eon:'太古宙', era:'始太古代',
    desc:'最古老岩石(阿卡斯塔片麻岩)。地壳冷却，海洋形成。', fossils:'最古老生命化学痕迹(Isua,~3.8Ga)。' },
  { name:'古太古宙', en:'Paleoarchean', start:3600, end:3200, color:0x993333, eon:'太古宙', era:'古太古代',
    desc:'最早确凿生命证据。叠层石开始建造。', fossils:'叠层石(Stromatolite,~3.48Ga)。' },
  { name:'中太古宙', en:'Mesoarchean', start:3200, end:2800, color:0xAA4444, eon:'太古宙', era:'中太古代',
    desc:'最早克拉通稳定。条带状铁建造(BIF)沉积。', fossils:'蓝藻(Cyanobacteria)繁盛。' },
  { name:'新太古宙', en:'Neoarchean', start:2800, end:2500, color:0xBB5555, eon:'太古宙', era:'新太古代',
    desc:'大陆快速生长。BIF沉积高峰。', fossils:'真核生物甾烷分子化石(~2.7Ga)。' },
  { name:'古元古代', en:'Paleoproterozoic', start:2500, end:1600, color:0xBB8855, eon:'元古宙', era:'古元古代',
    desc:'大氧化事件(GOE)。休伦冰期：雪球地球。', fossils:'Grypania spiralis(最早真核多细胞)。' },
  { name:'中元古代', en:'Mesoproterozoic', start:1600, end:1000, color:0xCC9966, eon:'元古宙', era:'中元古代',
    desc:'罗迪尼亚超大陆聚合。有性生殖出现。', fossils:'Bangiomorpha(最早红藻,~1.2Ga)。' },
  { name:'拉伸纪', en:'Tonian', start:1000, end:720, color:0xDDBB77, eon:'元古宙', era:'新元古代',
    desc:'罗迪尼亚裂解。最早动物可能出现。', fossils:'Otavia antiqua(最早海绵,~760Ma)。' },
  { name:'成冰纪', en:'Cryogenian', start:720, end:635, color:0xCCDDEE, eon:'元古宙', era:'新元古代',
    desc:'Sturtian+Marinoan全球冰期——雪球地球。', fossils:'冰期后疑源类多样性爆发。' },
  { name:'埃迪卡拉纪', en:'Ediacaran', start:635, end:541, color:0xCC8844, eon:'元古宙', era:'新元古代',
    desc:'最早大型多细胞生物。海洋氧含量上升。', fossils:'狄更逊虫、查恩盘虫、Kimberella。' },
  { name:'寒武纪', en:'Cambrian', start:541, end:485, color:0x669966, eon:'显生宙', era:'古生代',
    desc:'寒武纪大爆发：几乎所有动物门类出现。', fossils:'三叶虫、奇虾。伯吉斯页岩。' },
  { name:'奥陶纪', en:'Ordovician', start:485, end:444, color:0x559955, eon:'显生宙', era:'古生代',
    desc:'海平面历史最高。末期冰期大灭绝(85%)。', fossils:'笔石、鹦鹉螺、早期陆生植物。' },
  { name:'志留纪', en:'Silurian', start:444, end:419, color:0x77AA77, eon:'显生宙', era:'古生代',
    desc:'气候回暖。维管植物登陆。有颌鱼类演化。', fossils:'Cooksonia(最早维管植物)。' },
  { name:'泥盆纪', en:'Devonian', start:419, end:359, color:0x88BB88, eon:'显生宙', era:'古生代',
    desc:'"鱼类时代"。森林出现。两栖动物登陆。', fossils:'邓氏鱼(8m)。鱼石螈(最早四足动物)。' },
  { name:'石炭纪', en:'Carboniferous', start:359, end:299, color:0x66AA88, eon:'显生宙', era:'古生代',
    desc:'巨型蕨类森林→煤层。大气氧~35%。', fossils:'Meganeura(翼展70cm)。Arthropleura(2.5m)。' },
  { name:'二叠纪', en:'Permian', start:299, end:252, color:0xDD6644, eon:'显生宙', era:'古生代',
    desc:'盘古大陆形成。史上最大灭绝(96%物种)。', fossils:'异齿龙、二齿兽。' },
  { name:'三叠纪', en:'Triassic', start:252, end:201, color:0x9944AA, eon:'显生宙', era:'中生代',
    desc:'大灭绝后复苏。最早恐龙和哺乳动物。', fossils:'腔骨龙、Morganucodon。' },
  { name:'侏罗纪', en:'Jurassic', start:201, end:145, color:0x6666CC, eon:'显生宙', era:'中生代',
    desc:'恐龙鼎盛。泛大陆裂解→大西洋。温暖无冰。', fossils:'梁龙、剑龙、始祖鸟。' },
  { name:'白垩纪', en:'Cretaceous', start:145, end:66, color:0x448844, eon:'显生宙', era:'中生代',
    desc:'被子植物崛起。Chicxulub撞击→恐龙灭绝。', fossils:'霸王龙、三角龙、最早的花朵。' },
  { name:'古新世', en:'Paleocene', start:66, end:56, color:0xDDBB66, eon:'显生宙', era:'新生代',
    desc:'哺乳动物快速演化。全球温暖。', fossils:'Titanoboa(13m)。早期灵长类。' },
  { name:'始新世', en:'Eocene', start:56, end:33.9, color:0xDDAA44, eon:'显生宙', era:'新生代',
    desc:'PETM极热事件。现代哺乳动物目出现。', fossils:'始祖象、走鲸。' },
  { name:'渐新世', en:'Oligocene', start:33.9, end:23, color:0xDD8822, eon:'显生宙', era:'新生代',
    desc:'全球变冷。草原扩张。环南极洋流形成。', fossils:'巨犀(史上最大陆生哺乳动物)。' },
  { name:'中新世', en:'Miocene', start:23, end:5.33, color:0xDD9922, eon:'显生宙', era:'新生代',
    desc:'喜马拉雅造山。C4草原扩张。人科祖先分离。', fossils:'巨齿鲨。最早人亚科祖先。' },
  { name:'上新世', en:'Pliocene', start:5.33, end:2.58, color:0xDD7722, eon:'显生宙', era:'新生代',
    desc:'巴拿马地峡形成。北极冰盖扩展。', fossils:'南方古猿"露西"。' },
  { name:'更新世', en:'Pleistocene', start:2.58, end:0.0117, color:0xFF5533, eon:'显生宙', era:'第四纪',
    desc:'冰期-间冰期×~20次。智人扩散全球。', fossils:'猛犸象、剑齿虎、尼安德特人。' },
  { name:'全新世', en:'Holocene', start:0.0117, end:0, color:0xFF3300, eon:'显生宙', era:'第四纪',
    desc:'农业→文明→工业。CO₂ 280→420ppm。', fossils:'混凝土、塑料、²³⁹Pu、鸡骨化石。' },
]
const N = ERAS.length, R = 3.8 // terrain radius

/* ── Params & Terrain (built once, colors updated) ── */
function lerp(a,b,t){return a+(b-a)*t}
function eraParams(from,to,t){
  const tf=from/(N-1),tt=to/(N-1),f=lerp(tf,tt,t)
  return{landFrac:lerp(.05,.6,f),landR:lerp(.45,.35,f),landG:lerp(.12,.52,f),landB:lerp(.05,.2,f),oceanR:lerp(.6,.1,f),oceanG:lerp(.2,.3,f),oceanB:lerp(.08,.55,f),atmoHue:lerp(.08,.55,f),atmoLight:lerp(.15,.5,f),atmoOp:lerp(.2,.06,f),cloudOp:f<.5?lerp(0,.35,f*2):.35,bioOp:f<.2?lerp(0,.06,f/.2):.06,roughness:lerp(.85,.4,f)}
}

function buildTerrainGeo(){
  const seg=160,size=R*2.5,geo=new THREE.PlaneGeometry(size,size,seg,seg)
  geo.rotateX(-Math.PI/2)
  const pos=geo.attributes.position
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i),dist=Math.sqrt(x*x+z*z)
    if(dist>R){pos.setY(i,-.35);continue}
    // Multi-octave noise for realistic terrain
    const n1=Math.sin(x*.6)*Math.cos(z*.5)+Math.cos(x*.8+z*.3)*.7+Math.sin(z*.9-x*.4)*.6
    const n2=Math.sin(x*1.8+z)*Math.cos(z*2.1-x)*.35+Math.sin(x*2.5-z*.7)*Math.cos(z*1.6+x)*.3
    const n3=Math.sin(x*3.5)*Math.cos(z*3.2)*.15+Math.cos(x*4+z*3.5)*.1
    const n=n1+n2+n3
    // Mountain belts (linear features)
    const mtn1=Math.exp(-Math.pow((z-x*.3+.5)/.8,2))*.6 // diagonal range
    const mtn2=Math.exp(-Math.pow((x+.8)/.5,2))*.5 // N-S range
    const mtn3=Math.exp(-Math.pow((z-1)/.4,2))*.4 // E-W range
    const mtns=(mtn1+mtn2+mtn3)*.7
    const h=Math.max(-.1,n*.25+mtns-.1+Math.random()*.03)
    pos.setY(i,Math.min(.45,h))
  }
  // Add default color attribute
  const defCols = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) { defCols[i * 3] = 0.15; defCols[i * 3 + 1] = 0.35; defCols[i * 3 + 2] = 0.55 }
  geo.setAttribute('color', new THREE.BufferAttribute(defCols, 3))
  geo.computeVertexNormals()
  return geo
}

function updateTerrainColors(geo,params){
  const pos=geo.attributes.position
  const colorAttr=geo.attributes.color
  const cols=colorAttr?colorAttr.array:new Float32Array(pos.count*3)
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i),dist=Math.sqrt(x*x+z*z)
    if(dist>R){cols[i*3]=params.oceanR;cols[i*3+1]=params.oceanG;cols[i*3+2]=params.oceanB;continue}
    const n=Math.sin(x*.8)*Math.cos(z*.6)+Math.sin(x*1.3+z*.4)*.7+Math.cos(z*1.1-x*.3)*.6
    const isLand=n>(.5-params.landFrac*.75)&&dist<R*.92
    if(isLand){cols[i*3]=params.landR+Math.random()*.04;cols[i*3+1]=params.landG+Math.random()*.04;cols[i*3+2]=params.landB+Math.random()*.03}
    else{cols[i*3]=params.oceanR+Math.random()*.04;cols[i*3+1]=params.oceanG+Math.random()*.06;cols[i*3+2]=params.oceanB+Math.random()*.08}
  }
  if(colorAttr){colorAttr.needsUpdate=true}
  else{geo.setAttribute('color',new THREE.BufferAttribute(cols,3))}
}

/* ── Cross-section wedge ── */
function buildCrossSection(){
  const g=new THREE.Group()
  // Wedge cutout showing strata at terrain edge
  const strata=[
    {name:'全新世',y:0.15,color:0xFF3300,h:0.04},{name:'更新世',y:0.10,color:0xFF5533,h:0.05},
    {name:'上新世',y:0.06,color:0xDD7722,h:0.04},{name:'中新世',y:0.02,color:0xDD9922,h:0.04},
    {name:'古近纪',y:-0.02,color:0xDDBB66,h:0.04},{name:'白垩纪',y:-0.06,color:0x448844,h:0.04},
    {name:'侏罗纪',y:-0.10,color:0x6666CC,h:0.04},{name:'三叠纪',y:-0.14,color:0x9944AA,h:0.04},
    {name:'古生代',y:-0.18,color:0x669966,h:0.06},{name:'前寒武',y:-0.24,color:0xCC8844,h:0.08},
  ]
  strata.forEach(s=>{
    const geo=new THREE.BoxGeometry(.3,s.h,.15)
    const mat=new THREE.MeshBasicMaterial({color:s.color,transparent:true,opacity:.7})
    const box=new THREE.Mesh(geo,mat)
    box.position.set(-R-.3,s.y,0);g.add(box)
  })
  return g
}

/* ── Module ── */
export function GeologicTimeModule(scene,params,services){
  const{labelSystem,cameraRig}=services
  const group=new THREE.Group()
  let eraIdx=N-1,fromIdx=N-1,transT=0,terrainGeo,terrainMesh

  scene.background=new THREE.Color(0x0a0a14)

  // Transparent ocean — large blue disc with subtle animation
  const oceanGeo=new THREE.CircleGeometry(R*1.3,128)
  const oceanMat=new THREE.MeshBasicMaterial({color:0x3377cc,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide})
  const ocean=new THREE.Mesh(oceanGeo,oceanMat)
  ocean.rotation.x=-Math.PI/2;ocean.position.y=-.35;group.add(ocean)

  // Terrain (built once)
  terrainGeo=buildTerrainGeo()
  terrainMesh=new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.05,side:THREE.DoubleSide}))
  group.add(terrainMesh)

  // Atmosphere shell
  const atmoGeo=new THREE.SphereGeometry(R*1.3,48,24)
  const atmoMat=new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:.06,side:THREE.DoubleSide,depthWrite:false})
  const atmo=new THREE.Mesh(atmoGeo,atmoMat);atmo.position.y=.3;group.add(atmo)

  // Cloud particles — pre-allocate with initial data
  const cloudGeo=new THREE.BufferGeometry()
  const initClouds=new Float32Array(300*3)
  for(let i=0;i<300;i++){const phi=Math.acos(2*Math.random()-1),theta=Math.random()*Math.PI*2,rr=R*.8+Math.random()*.4;initClouds[i*3]=rr*Math.sin(phi)*Math.cos(theta);initClouds[i*3+1]=rr*Math.cos(phi)+.3;initClouds[i*3+2]=rr*Math.sin(phi)*Math.sin(theta)}
  cloudGeo.setAttribute('position',new THREE.BufferAttribute(initClouds,3))
  const cloudMat=new THREE.PointsMaterial({color:0xffffff,size:.08,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false})
  const cloudPts=new THREE.Points(cloudGeo,cloudMat)
  group.add(cloudPts)

  // Cross-section wedge
  const crossSection=buildCrossSection();group.add(crossSection)

  // Time rings
  const rings=[]
  ERAS.forEach((e,i)=>{const r=R+.3+i*.03,pts=[];for(let j=0;j<=64;j++){const t=j/64*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(t)*r,.02,Math.sin(t)*r))};const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:e.color,transparent:true,opacity:.12,depthTest:true}));group.add(ring);rings.push(ring)})

  // Human impacts
  const impacts=new THREE.Group()
  ;[[1.2,.04,1],[-1.5,.04,-.8],[.4,.04,-1.8],[-.8,.04,1.5],[1.8,.04,-1.2]].forEach(([x,y,z])=>{impacts.add(new THREE.Mesh(GeometryFactory.sphere(.05,8),new THREE.MeshBasicMaterial({color:0xff4400})));const gl=new THREE.Mesh(GeometryFactory.ring(.06,.14,16),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));gl.rotation.x=-Math.PI/2;gl.position.set(x,y,z);impacts.add(gl)})
  impacts.visible=false;group.add(impacts)

  if(cameraRig){const a=50*Math.PI/180;cameraRig.camera.position.set(0,Math.sin(a)*10,Math.cos(a)*10);cameraRig.controls.target.set(0,.1,0);cameraRig.controls.enableRotate=false;cameraRig.controls.minDistance=5;cameraRig.controls.maxDistance=18;cameraRig.controls.update()}

  function updateLabels(){
    if(!labelSystem)return
    labelSystem.clearAll(scene)
    const e=ERAS[eraIdx]
    labelSystem.addToGroup(group,`${e.name} · ${e.en}`,new THREE.Vector3(0,3.5,0),{color:'#'+e.color.toString(16).padStart(6,'0'),fontSize:'18px',fontWeight:'700',background:'rgba(0,0,0,0.7)',padding:'8px 16px',borderRadius:'6px'})
    labelSystem.addToGroup(group,`${e.eon}/${e.era} · ${e.start}—${e.end===0?'今':e.end} Ma`,new THREE.Vector3(0,2.85,0),{color:'#aaa',fontSize:'11px',background:'rgba(0,0,0,0.5)',padding:'3px 10px',borderRadius:'4px'})
    labelSystem.addToGroup(group,e.desc,new THREE.Vector3(0,-3.5,0),{color:'#ddd',fontSize:'13px',background:'rgba(0,0,0,0.65)',padding:'8px 14px',borderRadius:'6px',whiteSpace:'normal',maxWidth:'500px',lineHeight:'1.5'})
    labelSystem.addToGroup(group,'◀ 地层剖面',new THREE.Vector3(-R-.8,.5,0),{color:'#ffaa44',fontSize:'12px',fontWeight:'700',background:'rgba(0,0,0,0.6)'})
    // Ocean + cloud evolution summary
    const oceanDesc=eraIdx<2?'海洋尚未形成':eraIdx<5?'海洋富铁呈绿色，逐渐氧化':eraIdx<15?'全球海洋，温暖浅海广布':'现代洋流体系形成'
    const cloudDesc=eraIdx<2?'无水无云，大气为H₂/He/CH₄':eraIdx<5?'水汽云出现，大气仍缺氧':eraIdx<10?'云量增加，氧气上升':'现代云层与水循环'
    labelSystem.addToGroup(group,`🌊 海: ${oceanDesc}\n☁️ 云: ${cloudDesc}`,new THREE.Vector3(-R-.8,-1.4,0),{color:'#88ccff',fontSize:'11px',background:'rgba(0,0,0,0.55)',padding:'6px 10px',borderRadius:'4px',whiteSpace:'pre-line',lineHeight:'1.4'})
  }
  updateLabels()

  let updateCounter=0
  const api={
    setParams(p){
      if(p.era!==undefined&&p.era!==eraIdx){fromIdx=eraIdx;eraIdx=p.era;transT=0;impacts.visible=eraIdx===N-1;rings.forEach((r,i)=>{r.material.opacity=i===eraIdx?0.8:0.12});updateLabels()}
    },
    update(dt){
      updateCounter++
      if(transT<1){
        transT=Math.min(1,transT+dt*2)
        const pr=eraParams(fromIdx,eraIdx,transT)
        // Update terrain colors every 3 frames
        if(updateCounter%3===0)updateTerrainColors(terrainGeo,pr)
        // Update atmo + clouds every 8 frames
        if(updateCounter%8===0){
          atmo.material.color.setHSL(pr.atmoHue,.6,pr.atmoLight)
          atmo.material.opacity=pr.atmoOp
          // Cloud density changes with era
          const count=Math.floor(pr.cloudOp*800)
          const cp=cloudPts.geometry.attributes.position
          if(cp.count!==count&&count>0){
            const np=new Float32Array(count*3)
            for(let i=0;i<count;i++){
              const phi=Math.acos(2*Math.random()-1),theta=Math.random()*Math.PI*2,rr=R*.8+Math.random()*.5
              np[i*3]=rr*Math.sin(phi)*Math.cos(theta)
              np[i*3+1]=rr*Math.cos(phi)+.3
              np[i*3+2]=rr*Math.sin(phi)*Math.sin(theta)
            }
            cloudPts.geometry.setAttribute('position',new THREE.BufferAttribute(np,3))
          }
          cloudMat.opacity=.15+pr.cloudOp*.7
          terrainMesh.material.roughness=pr.roughness
          // Ocean color shifts with era
          oceanMat.color.setRGB(.15+pr.landFrac*.1,.35+pr.landFrac*.15,.55+pr.landFrac*.2)
          oceanMat.opacity=.3+pr.landFrac*.4
        }
      }
      // Animate human impact dots
      impacts.children.forEach(c=>{if(c.material?.blending===THREE.AdditiveBlending)c.material.opacity=.3+Math.sin(Date.now()*.003)*.15})
      // Rotate clouds slowly
      cloudPts.rotation.y+=dt*.015
    },
    dispose(){},
  }
  group.userData={api}
  return group
}

export{ERAS}
