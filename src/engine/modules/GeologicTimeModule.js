// [M11] GeologicTimeModule — 地质年代3D — 动态海洋·飘云·冰盖·侵蚀·造山

import * as THREE from 'three'

const R=3.8, RI=R*.92
const OCEAN_Y=-.31

// ── ERA data with visual params ──
// landFrac: 0-1 land coverage. iceExtent: 0=none, 1=full ice. mtns: mountain intensity.
// oceanColor: rgb for water. landBase: biome base colors.
const ERAS = [
  { name:'冥古宙', en:'Hadean', s:4600, e:4000, color:0x660000, eon:'冥古宙', era:'—',
    d:'地球吸积。月球诞生。全球岩浆海洋。', f:'无生命。最古老锆石(4.4Ga)。',
    atm:'H₂/He/CH₄。无水无氧。地表>200°C。', ice:0, ocean:0, land:3, mtns:0,
    oceanC:[.8,.2,.05], landC:[.5,.1,.03] },
  { name:'始太古宙', en:'Eoarchean', s:4000, e:3600, color:0x882222, eon:'太古宙', era:'始太古代',
    d:'最古老岩石。地壳冷却。海洋形成。', f:'最古老生命化学痕迹(Isua,~3.8Ga)。',
    atm:'CO₂/N₂为主。无游离氧。地表~80°C。', ice:0, ocean:1, land:5, mtns:1,
    oceanC:[.15,.45,.35], landC:[.5,.25,.1] },
  { name:'古太古宙', en:'Paleoarchean', s:3600, e:3200, color:0x993333, eon:'太古宙', era:'古太古代',
    d:'最早确凿生命。叠层石建造。BIF沉积。', f:'叠层石(~3.48Ga)。最早微化石。',
    atm:'N₂/CO₂。海洋富Fe²⁺呈绿色。厌氧。', ice:0, ocean:1, land:8, mtns:1,
    oceanC:[.1,.45,.3], landC:[.5,.3,.12] },
  { name:'中太古宙', en:'Mesoarchean', s:3200, e:2800, color:0xAA4444, eon:'太古宙', era:'中太古代',
    d:'最早克拉通稳定。BIF沉积高峰。', f:'蓝藻繁盛。光合产氧开始。',
    atm:'蓝藻释放微量O₂。大气仍缺氧。', ice:0, ocean:1, land:10, mtns:2,
    oceanC:[.1,.5,.35], landC:[.55,.32,.15] },
  { name:'新太古宙', en:'Neoarchean', s:2800, e:2500, color:0xBB5555, eon:'太古宙', era:'新太古代',
    d:'大陆快速生长。超级克拉通形成。', f:'真核生物甾烷(~2.7Ga)。',
    atm:'O₂积累临界点。BIF指示海洋化学转变。', ice:0, ocean:1, land:15, mtns:3,
    oceanC:[.1,.5,.4], landC:[.6,.35,.18] },
  { name:'古元古代', en:'Paleoproterozoic', s:2500, e:1600, color:0xBB8855, eon:'元古宙', era:'古元古代',
    d:'大氧化事件(GOE~2.4Ga)。休伦冰期。', f:'Grypania spiralis(最早真核多细胞)。',
    atm:'GOE：O₂从<0.001%升至~1%。甲烷崩溃→冰期。', ice:.7, ocean:1, land:20, mtns:4,
    oceanC:[.1,.45,.55], landC:[.6,.4,.2] },
  { name:'中元古代', en:'Mesoproterozoic', s:1600, e:1000, color:0xCC9966, eon:'元古宙', era:'中元古代',
    d:'罗迪尼亚超大陆聚合。有性生殖。', f:'Bangiomorpha(最早红藻,~1.2Ga)。',
    atm:'O₂稳定~1%PAL。"无聊的十亿年"。', ice:0, ocean:1, land:25, mtns:5,
    oceanC:[.08,.45,.6], landC:[.35,.55,.2] },
  { name:'拉伸纪', en:'Tonian', s:1000, e:720, color:0xDDBB77, eon:'元古宙', era:'新元古代',
    d:'罗迪尼亚裂解。最早动物可能出现。', f:'Otavia antiqua(最早海绵?)。',
    atm:'O₂缓慢上升。超大陆裂解释放营养盐。', ice:0, ocean:1, land:30, mtns:6,
    oceanC:[.08,.4,.6], landC:[.4,.55,.22] },
  { name:'成冰纪', en:'Cryogenian', s:720, e:635, color:0xCCDDEE, eon:'元古宙', era:'新元古代',
    d:'Sturtian+Marinoan全球冰封。雪球地球!', f:'冰期后疑源类多样性爆发。',
    atm:'O₂~2-5%。全球冰封反射阳光→极端温室后冰融。', ice:1, ocean:1, land:25, mtns:4,
    oceanC:[.7,.85,.95], landC:[.85,.9,.95] },
  { name:'埃迪卡拉纪', en:'Ediacaran', s:635, e:541, color:0xCC8844, eon:'元古宙', era:'新元古代',
    d:'最早大型多细胞生物。海洋氧含量上升。', f:'狄更逊虫、查恩盘虫、Kimberella。',
    atm:'O₂升至~8-15%。海洋深层氧化。', ice:.2, ocean:1, land:35, mtns:6,
    oceanC:[.08,.4,.6], landC:[.35,.5,.2] },
  { name:'寒武纪', en:'Cambrian', s:541, e:485, color:0x669966, eon:'显生宙', era:'古生代',
    d:'寒武纪大爆发。所有动物门类出现。', f:'三叶虫、奇虾。伯吉斯页岩。',
    atm:'O₂~15-20%。CO₂~4500ppm。超级温室。', ice:0, ocean:1, land:38, mtns:7,
    oceanC:[.06,.35,.6], landC:[.35,.5,.18] },
  { name:'奥陶纪', en:'Ordovician', s:485, e:444, color:0x559955, eon:'显生宙', era:'古生代',
    d:'海平面最高。末期冰期大灭绝(85%)。', f:'笔石、鹦鹉螺、早期陆生植物。',
    atm:'CO₂~4200ppm。末期骤降触发冰期→灭绝。', ice:.6, ocean:1, land:40, mtns:7,
    oceanC:[.06,.35,.6], landC:[.3,.5,.18] },
  { name:'志留纪', en:'Silurian', s:444, e:419, color:0x77AA77, eon:'显生宙', era:'古生代',
    d:'气候回暖。维管植物登陆。有颌鱼类。', f:'Cooksonia(最早维管植物)。巨型海蝎。',
    atm:'CO₂~3000ppm。O₂~15%。温暖湿润。', ice:0, ocean:1, land:42, mtns:8,
    oceanC:[.06,.35,.6], landC:[.25,.5,.15] },
  { name:'泥盆纪', en:'Devonian', s:419, e:359, color:0x88BB88, eon:'显生宙', era:'古生代',
    d:'鱼类时代。森林出现。两栖动物登陆。', f:'邓氏鱼(8m)。鱼石螈(最早四足动物)。',
    atm:'O₂~20%。森林光合大增。末期变冷。', ice:0, ocean:1, land:45, mtns:8,
    oceanC:[.06,.3,.55], landC:[.2,.5,.1] },
  { name:'石炭纪', en:'Carboniferous', s:359, e:299, color:0x66AA88, eon:'显生宙', era:'古生代',
    d:'蕨类森林→煤层。O₂高达35%!', f:'Meganeura(翼展70cm)。Arthropleura(2.5m)。',
    atm:'O₂峰值~35%——巨型昆虫原因。CO₂降至现代水平。', ice:.4, ocean:1, land:48, mtns:9,
    oceanC:[.06,.3,.55], landC:[.15,.45,.1] },
  { name:'二叠纪', en:'Permian', s:299, e:252, color:0xDD6644, eon:'显生宙', era:'古生代',
    d:'盘古大陆。史上最大灭绝(96%物种)。', f:'异齿龙、二齿兽。银杏类。',
    atm:'西伯利亚大火成岩省→CO₂暴增→全球变暖+海洋酸化→大灭绝。', ice:0, ocean:1, land:55, mtns:10,
    oceanC:[.06,.3,.55], landC:[.6,.35,.15] },
  { name:'三叠纪', en:'Triassic', s:252, e:201, color:0x9944AA, eon:'显生宙', era:'中生代',
    d:'大灭绝后复苏。最早恐龙和哺乳动物。', f:'腔骨龙。Morganucodon。鱼龙。',
    atm:'CO₂~2000ppm。泛大陆内陆极端干旱。', ice:0, ocean:1, land:52, mtns:8,
    oceanC:[.06,.3,.55], landC:[.55,.4,.2] },
  { name:'侏罗纪', en:'Jurassic', s:201, e:145, color:0x6666CC, eon:'显生宙', era:'中生代',
    d:'恐龙鼎盛。泛大陆裂解→大西洋。', f:'梁龙、剑龙、始祖鸟。菊石繁盛。',
    atm:'CO₂~1200ppm。O₂~18%。全球温暖无冰。', ice:0, ocean:1, land:50, mtns:7,
    oceanC:[.06,.3,.55], landC:[.25,.48,.12] },
  { name:'白垩纪', en:'Cretaceous', s:145, e:66, color:0x448844, eon:'显生宙', era:'中生代',
    d:'被子植物崛起。Chicxulub撞击→恐龙灭绝。', f:'霸王龙、三角龙。最早的花朵。',
    atm:'CO₂~1700ppm。白垩纪温室峰值。撞击→核冬天。', ice:0, ocean:1, land:55, mtns:7,
    oceanC:[.06,.3,.55], landC:[.2,.45,.1] },
  { name:'古新世', en:'Paleocene', s:66, e:56, color:0xDDBB66, eon:'显生宙', era:'新生代',
    d:'哺乳动物快速演化。全球温暖。', f:'Titanoboa(13m)。早期灵长类。',
    atm:'CO₂~500ppm。PETM前温暖温室。', ice:0, ocean:1, land:55, mtns:8,
    oceanC:[.06,.32,.55], landC:[.3,.5,.15] },
  { name:'始新世', en:'Eocene', s:56, e:33.9, color:0xDDAA44, eon:'显生宙', era:'新生代',
    d:'PETM极热。现代哺乳动物目出现。', f:'始祖象、走鲸。Gastornis巨鸟。',
    atm:'PETM：CO₂~2000ppm，全球+5-8°C。后CO₂下降→南极结冰。', ice:.1, ocean:1, land:55, mtns:9,
    oceanC:[.06,.35,.55], landC:[.3,.5,.15] },
  { name:'渐新世', en:'Oligocene', s:33.9, e:23, color:0xDD8822, eon:'显生宙', era:'新生代',
    d:'全球变冷。南极冰盖形成。草原扩张。', f:'巨犀(史上最大陆生哺乳动物)。最早猿类。',
    atm:'CO₂降至~400ppm。环南极洋流形成→南极热隔离→冰盖生长。', ice:.4, ocean:1, land:58, mtns:9,
    oceanC:[.08,.38,.58], landC:[.45,.45,.2] },
  { name:'中新世', en:'Miocene', s:23, e:5.33, color:0xDD9922, eon:'显生宙', era:'新生代',
    d:'喜马拉雅造山。C4草原全球扩张。', f:'巨齿鲨。最早人亚科祖先。',
    atm:'CO₂~300-400ppm。中期气候适宜→晚期变冷。', ice:.2, ocean:1, land:60, mtns:10,
    oceanC:[.08,.4,.6], landC:[.4,.48,.18] },
  { name:'上新世', en:'Pliocene', s:5.33, e:2.58, color:0xDD7722, eon:'显生宙', era:'新生代',
    d:'巴拿马地峡形成。北极冰盖扩展。', f:'南方古猿"露西"。巨地懒。',
    atm:'CO₂~350-400ppm。全球比现在暖2-3°C。', ice:.5, ocean:1, land:60, mtns:10,
    oceanC:[.08,.42,.6], landC:[.4,.5,.2] },
  { name:'更新世', en:'Pleistocene', s:2.58, e:0.0117, color:0xFF5533, eon:'显生宙', era:'第四纪',
    d:'冰期-间冰期×~20次。智人扩散全球。', f:'猛犸象、剑齿虎、尼安德特人。',
    atm:'CO₂冰期~180/间冰期~280ppm振荡。O₂~21%。', ice:.8, ocean:1, land:58, mtns:8,
    oceanC:[.08,.4,.6], landC:[.35,.48,.22] },
  { name:'全新世', en:'Holocene', s:0.0117, e:0, color:0xFF3300, eon:'显生宙', era:'第四纪',
    d:'农业→文明→工业。CO₂ 280→420ppm!', f:'混凝土、塑料、²³⁹Pu、鸡骨。',
    atm:'工业革命后CO₂+50%。CH₄+150%。人类世。', ice:.3, ocean:1, land:60, mtns:6,
    oceanC:[.06,.38,.58], landC:[.3,.5,.15] },
]
const N=ERAS.length

/* ── Noise helpers ── */
function noise2D(x,z,s=.8){return Math.sin(x*s)*Math.cos(z*s*.8)+Math.sin(x*s*1.5+z*s)*.6+Math.cos(z*s*1.2-x*s*.4)*.5}
function ridge(x,z){return .5-Math.abs(noise2D(x,z,1.2))}

// ── Build terrain once ──
function buildTerrain(era){
  const seg=140,sz=R*2.5,geo=new THREE.PlaneGeometry(sz,sz,seg,seg)
  geo.rotateX(-Math.PI/2)
  const p=geo.attributes.position
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),dist=Math.sqrt(x*x+z*z)
    if(dist>R){p.setY(i,-1);continue}
    const n=noise2D(x,z)+ridge(x,z)*.4+noise2D(x,z,2)*.3
    const mtn=Math.exp(-(((dist-R*.3)/.8)**2))*.5+Math.exp(-(((z-x*.3)/.7)**2))*.4+Math.exp(-(((x+.5)/.5)**2))*.3
    const h=Math.max(-.2,Math.min(.5,n*.3+mtn*era.mtns*.04-.05+Math.random()*.02))
    p.setY(i,h)
  }
  const dc=new Float32Array(p.count*3)
  for(let i=0;i<p.count;i++){dc[i*3]=.2;dc[i*3+1]=.45;dc[i*3+2]=.15}
  geo.setAttribute('color',new THREE.BufferAttribute(dc,3))
  geo.computeVertexNormals()
  return geo
}

function updateColors(geo,era){
  const p=geo.attributes.position,ca=geo.attributes.color,cols=ca.array
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),dist=Math.sqrt(x*x+z*z)
    if(dist>R){cols[i*3]=.03;cols[i*3+1]=.06;cols[i*3+2]=.12;continue}
    const h=p.getY(i)
    const isLand=h>-.05&&dist<RI
    // Ice covers poles and high ground during ice ages
    const lat=Math.abs(Math.atan2(z,x))/Math.PI*2
    const iced=era.ice>0&&(lat>.6-era.ice*.3||h>.2)
    if(iced&&isLand){cols[i*3]=.85+Math.random()*.1;cols[i*3+1]=.9+Math.random()*.08;cols[i*3+2]=.95+Math.random()*.05}
    else if(isLand){
      // Biome by height + lat
      const biome=Math.min(1,h*2+lat*.3)
      if(biome>.7){cols[i*3]=era.landC[0]*.7+Math.random()*.05;cols[i*3+1]=era.landC[1]*.5+Math.random()*.06;cols[i*3+2]=era.landC[2]*.4} // highland
      else if(biome>.4){cols[i*3]=era.landC[0]+Math.random()*.06;cols[i*3+1]=era.landC[1]+Math.random()*.06;cols[i*3+2]=era.landC[2]+Math.random()*.04} // mid
      else{cols[i*3]=era.landC[0]*.8;cols[i*3+1]=era.landC[1]*1.1;cols[i*3+2]=era.landC[2]*.8} // lowland
    }else{
      const d=Math.max(0,Math.min(1,(-h)/.3))
      cols[i*3]=era.oceanC[0]+d*.04;cols[i*3+1]=era.oceanC[1]+d*.08;cols[i*3+2]=era.oceanC[2]+d*.1
    }
  }
  ca.needsUpdate=true
}

// ── Animated ocean waves ──
function buildOcean(){
  const seg=80,geo=new THREE.CircleGeometry(R,seg)
  geo.rotateX(-Math.PI/2)
  const orig=new Float32Array(geo.attributes.position.array)
  geo.userData={orig,seg}
  const mat=new THREE.MeshBasicMaterial({color:0x3377cc,transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide})
  const mesh=new THREE.Mesh(geo,mat)
  // Blue wave lines on ocean surface
  const wg=new THREE.Group()
  const lMat=new THREE.LineBasicMaterial({color:0x88bbff,transparent:true,opacity:.35,depthTest:true})
  for(let i=0;i<60;i++){
    const a=Math.random()*Math.PI*2,dist=R*.15+Math.random()*R*.8
    const cx=Math.cos(a)*dist,cz=Math.sin(a)*dist,len=.08+Math.random()*.25
    const pts=[new THREE.Vector3(cx-len*.5,OCEAN_Y+.01,cz),new THREE.Vector3(cx+len*.5,OCEAN_Y+.01,cz)]
    wg.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lMat))
  }
  mesh.add(wg)
  mesh.userData.waveLines=wg
  return mesh
}

function animateOcean(ocean,t){
  const p=ocean.geometry.attributes.position
  const orig=ocean.geometry.userData.orig
  for(let i=0;i<p.count;i++){
    const x=orig[i*3],z=orig[i*3+2]
    const dist=Math.sqrt(x*x+z*z)
    if(dist>R*.98){p.setY(i,-.35);continue}
    const wave=Math.sin(dist*3-t*2)*.015+Math.sin(x*5+t)*.01+Math.cos(z*4+t*1.5)*.012
    p.setY(i,OCEAN_Y+wave)
  }
  p.needsUpdate=true
}

// ── Cloud system ──
function buildClouds(){
  const count=500,geo=new THREE.BufferGeometry()
  const pos=new Float32Array(count*3),vel=new Float32Array(count*3)
  for(let i=0;i<count;i++){
    const phi=Math.acos(2*Math.random()-1),theta=Math.random()*Math.PI*2,rr=R*.6+Math.random()*.5
    pos[i*3]=rr*Math.sin(phi)*Math.cos(theta)
    pos[i*3+1]=rr*Math.cos(phi)+.45
    pos[i*3+2]=rr*Math.sin(phi)*Math.sin(theta)
    vel[i*3]=(Math.random()-.5)*.3;vel[i*3+1]=0;vel[i*3+2]=(Math.random()-.5)*.3
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
  geo.userData={vel}
  const mat=new THREE.PointsMaterial({color:0xffffff,size:.12,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false})
  return new THREE.Points(geo,mat)
}

function animateClouds(clouds,dt){
  const p=clouds.geometry.attributes.position
  const v=clouds.geometry.userData.vel
  for(let i=0;i<p.count;i++){
    let x=p.getX(i)+v[i*3]*dt,y=p.getY(i),z=p.getZ(i)+v[i*3+2]*dt
    const dist=Math.sqrt(x*x+z*z)
    if(dist>R*.95||dist<R*.5){v[i*3]*=-1;v[i*3+2]*=-1}
    p.setXYZ(i,x,y,z)
  }
  p.needsUpdate=true
}

// ── Erosion channels (river lines) ──
function buildErosion(){
  const g=new THREE.Group()
  const mat=new THREE.LineBasicMaterial({color:0x4488aa,transparent:true,opacity:.3,depthTest:true})
  for(let r=0;r<5;r++){
    const pts=[]
    for(let i=0;i<=30;i++){
      const t=i/30,a=t*Math.PI*2+r*1.3
      const dist=R*.2+t*R*.65
      const x=Math.cos(a)*dist,z=Math.sin(a)*dist
      pts.push(new THREE.Vector3(x,.03+Math.random()*.02,z))
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat))
  }
  return g
}

/* ── Module ── */
export function GeologicTimeModule(scene,params,services){
  const{labelSystem,cameraRig}=services
  const grp=new THREE.Group()
  let ei=N-1,fi=N-1,tt=0,counter=0
  let terrainGeo,terrainMesh,ocean,clouds

  scene.background=new THREE.Color(0x0a0a14)

  // Ocean
  ocean=buildOcean();grp.add(ocean)

  // Terrain
  terrainGeo=buildTerrain(ERAS[ei])
  terrainMesh=new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:.05,side:THREE.DoubleSide}))
  grp.add(terrainMesh)

  // Atmosphere
  const aMat=new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:.06,side:THREE.DoubleSide,depthWrite:false})
  const atmo=new THREE.Mesh(new THREE.SphereGeometry(R*1.3,48,24),aMat);atmo.position.y=.3;grp.add(atmo)

  // Clouds
  clouds=buildClouds();grp.add(clouds)

  // Erosion rivers
  grp.add(buildErosion())

  // Cross-section wedge — visible strata layers
  const strataData=[
    {name:'全新世',y:.18,c:0xFF3300},{name:'更新世',y:.13,c:0xFF5533},{name:'上新世',y:.09,c:0xDD7722},
    {name:'中新世',y:.05,c:0xDD9922},{name:'渐新世',y:.01,c:0xDD8822},{name:'始新世',y:-.03,c:0xDDAA44},
    {name:'古新世',y:-.07,c:0xDDBB66},{name:'白垩纪',y:-.11,c:0x448844},{name:'侏罗纪',y:-.15,c:0x6666CC},
    {name:'三叠纪',y:-.19,c:0x9944AA},{name:'二叠纪',y:-.23,c:0xDD6644},{name:'石炭纪',y:-.27,c:0x66AA88},
    {name:'泥盆纪',y:-.31,c:0x88BB88},{name:'志留纪',y:-.35,c:0x77AA77},{name:'奥陶纪',y:-.39,c:0x559955},
    {name:'寒武纪',y:-.43,c:0x669966},{name:'前寒武',y:-.48,c:0xCC8844},
  ]
  strataData.forEach((s,i)=>{
    const h=i===16?.05:.04
    const b=new THREE.Mesh(new THREE.BoxGeometry(.35,h,.18),new THREE.MeshStandardMaterial({color:s.c,roughness:.7,metalness:.1,transparent:true,opacity:.85}))
    b.position.set(-R-.45,s.y,0);grp.add(b)
  })

  // Time rings
  const rings=[]
  ERAS.forEach((e,i)=>{
    const r=R+.3+i*.03,pts=[]
    for(let j=0;j<=64;j++){const t=j/64*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(t)*r,.02,Math.sin(t)*r))}
    rings.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:e.color,transparent:true,opacity:.1,depthTest:true})))
    grp.add(rings[i])
  })

  // Human impacts
  const imp=new THREE.Group()
  ;[[1.2,.04,1],[-1.5,.04,-.8],[.4,.04,-1.8],[-.8,.04,1.5],[1.8,.04,-1.2]].forEach(([x,y,z])=>{
    imp.add(new THREE.Mesh(new THREE.SphereGeometry(.05,8),new THREE.MeshBasicMaterial({color:0xff4400})))
    const gl=new THREE.Mesh(new THREE.RingGeometry(.06,.14,16),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}))
    gl.rotation.x=-Math.PI/2;gl.position.set(x,y,z);imp.add(gl)
  })
  imp.visible=false;grp.add(imp)

  if(cameraRig){const a=50*Math.PI/180;cameraRig.camera.position.set(0,Math.sin(a)*10,Math.cos(a)*10);cameraRig.controls.target.set(0,.1,0);cameraRig.controls.enableRotate=false;cameraRig.controls.minDistance=5;cameraRig.controls.maxDistance=18;cameraRig.controls.update()}

  function lbls(){
    if(!labelSystem)return
    labelSystem.clearAll(scene)
    const e=ERAS[ei]
    labelSystem.addToGroup(grp,`${e.name} · ${e.en}`,new THREE.Vector3(0,3.5,0),{color:'#'+e.color.toString(16).padStart(6,'0'),fontSize:'18px',fontWeight:'700',background:'rgba(0,0,0,0.7)',padding:'8px 16px',borderRadius:'6px'})
    labelSystem.addToGroup(grp,`${e.eon}/${e.era} · ${e.s}—${e.e===0?'今':e.e} Ma`,new THREE.Vector3(0,2.85,0),{color:'#aaa',fontSize:'11px',background:'rgba(0,0,0,0.5)',padding:'3px 10px'})
    labelSystem.addToGroup(grp,e.d,new THREE.Vector3(0,-3.5,0),{color:'#ddd',fontSize:'13px',background:'rgba(0,0,0,0.65)',padding:'8px 14px',borderRadius:'6px',whiteSpace:'normal',maxWidth:'500px',lineHeight:'1.5'})
    labelSystem.addToGroup(grp,`🌫 ${e.atm}`,new THREE.Vector3(0,-2.8,0),{color:'#aaccff',fontSize:'11px',background:'rgba(0,0,0,0.6)',padding:'6px 10px',borderRadius:'4px',whiteSpace:'normal',maxWidth:'480px',lineHeight:'1.4'})
    if(e.ice>0)labelSystem.addToGroup(grp,`🧊 冰盖覆盖: ${Math.round(e.ice*100)}%`,new THREE.Vector3(-R-1,.9,0),{color:'#cceeff',fontSize:'11px',fontWeight:'700',background:'rgba(0,0,0,0.6)',padding:'4px 8px'})
    const oceanDesc=e.ocean===0?'海洋未形成':e.oceanC[1]>.7?'冰盖覆盖海洋':e.oceanC[1]>.5?'含氧蓝色深海':e.oceanC[1]>.4?'富铁绿色浅海':'初生还原性海洋'
    labelSystem.addToGroup(grp,`🌊 ${oceanDesc}`,new THREE.Vector3(-R-1,.4,0),{color:'#88ccff',fontSize:'11px',fontWeight:'700',background:'rgba(0,0,0,0.6)',padding:'4px 8px'})
    labelSystem.addToGroup(grp,'◀ 地层',new THREE.Vector3(-R-.8,.7,0),{color:'#ffaa44',fontSize:'12px',fontWeight:'700',background:'rgba(0,0,0,0.6)'})
  }
  lbls()

  const api={
    setParams(p){
      if(p.era!==undefined&&p.era!==ei){fi=ei;ei=p.era;tt=0;imp.visible=ei===N-1;rings.forEach((r,i)=>{r.material.opacity=i===ei?.8:.1});lbls()}
    },
    update(dt){
      counter++
      animateOcean(ocean,counter*.016)
      animateClouds(clouds,dt)
      if(tt<1){tt=Math.min(1,tt+dt*1.5);if(counter%2===0){const t=tt,fa=ERAS[fi],ea=ERAS[ei];const lerpEra={landC:[fa.landC[0]+(ea.landC[0]-fa.landC[0])*t,fa.landC[1]+(ea.landC[1]-fa.landC[1])*t,fa.landC[2]+(ea.landC[2]-fa.landC[2])*t],oceanC:[fa.oceanC[0]+(ea.oceanC[0]-fa.oceanC[0])*t,fa.oceanC[1]+(ea.oceanC[1]-fa.oceanC[1])*t,fa.oceanC[2]+(ea.oceanC[2]-fa.oceanC[2])*t],ice:fa.ice+(ea.ice-fa.ice)*t,mtns:fa.mtns+(ea.mtns-fa.mtns)*t};updateColors(terrainGeo,lerpEra);ocean.material.color.setRGB(lerpEra.oceanC[0]+.05,lerpEra.oceanC[1]+.1,lerpEra.oceanC[2]+.2)}}
      imp.children.forEach(c=>{if(c.material?.blending===THREE.AdditiveBlending)c.material.opacity=.3+Math.sin(Date.now()*.003)*.15})
    },
    dispose(){},
  }
  grp.userData={api}
  return grp
}

export{ERAS}
