// [M11] GeologicTimeModule — 地质年代3D — 全要素地球系统

import * as THREE from 'three'

const R=3.8, RI=R*.92, OY=-.31

const ERAS = [
  { name:'冥古宙', en:'Hadean', s:4600, e:4000, c:0x660000, eon:'冥古宙', era:'—',
    d:'地球吸积。月球诞生。全球岩浆海洋。', f:'无生命。最古老锆石(4.4Ga)。',
    atm:'H₂/He/CH₄。无水无氧。地表>200°C。', ice:0, ocean:0, land:3, mtns:0, seaLevel:.1,
    oceanC:[.8,.2,.05], landC:[.5,.1,.03], drift:[0,0], o2:.001, co2:100, temp:200, ext:0 },
  { name:'始太古宙', en:'Eoarchean', s:4000, e:3600, c:0x882222, eon:'太古宙', era:'始太古代',
    d:'最古老岩石。地壳冷却。海洋形成。', f:'最古老生命化学痕迹(Isua,3.8Ga)。',
    atm:'CO₂/N₂为主。无游离氧。地表~80°C。', ice:0, ocean:1, land:5, mtns:1, seaLevel:.3,
    oceanC:[.15,.45,.35], landC:[.5,.25,.1], drift:[.05,0], o2:0, co2:50, temp:80, ext:0 },
  { name:'古太古宙', en:'Paleoarchean', s:3600, e:3200, c:0x993333, eon:'太古宙', era:'古太古代',
    d:'最早确凿生命。叠层石建造。', f:'叠层石(3.48Ga)。最早微化石。',
    atm:'N₂/CO₂。海洋富Fe²⁺绿色。厌氧。', ice:0, ocean:1, land:8, mtns:1, seaLevel:.4,
    oceanC:[.1,.45,.3], landC:[.5,.3,.12], drift:[.08,.02], o2:.001, co2:30, temp:60, ext:0 },
  { name:'中太古宙', en:'Mesoarchean', s:3200, e:2800, c:0xAA4444, eon:'太古宙', era:'中太古代',
    d:'最早克拉通。BIF沉积高峰。', f:'蓝藻繁盛。光合产氧开始。',
    atm:'蓝藻释放微量O₂。大气仍缺氧。', ice:0, ocean:1, land:10, mtns:2, seaLevel:.5,
    oceanC:[.1,.5,.35], landC:[.55,.32,.15], drift:[.1,.05], o2:.01, co2:20, temp:50, ext:0 },
  { name:'新太古宙', en:'Neoarchean', s:2800, e:2500, c:0xBB5555, eon:'太古宙', era:'新太古代',
    d:'大陆快速生长。超级克拉通形成。', f:'真核生物甾烷(2.7Ga)。',
    atm:'O₂积累临界点。BIF指示海洋化学转变。', ice:0, ocean:1, land:15, mtns:3, seaLevel:.5,
    oceanC:[.1,.5,.4], landC:[.6,.35,.18], drift:[.12,.08], o2:.02, co2:15, temp:45, ext:0 },
  { name:'古元古代', en:'Paleoproterozoic', s:2500, e:1600, c:0xBB8855, eon:'元古宙', era:'古元古代',
    d:'大氧化事件(GOE~2.4Ga)。休伦冰期。', f:'Grypania spiralis(最早真核多细胞)。',
    atm:'GOE：O₂从<0.001%升至~1%。', ice:.7, ocean:1, land:20, mtns:4, seaLevel:.3,
    oceanC:[.1,.45,.55], landC:[.6,.4,.2], drift:[.2,.1], o2:1, co2:8, temp:30, ext:1 },
  { name:'中元古代', en:'Mesoproterozoic', s:1600, e:1000, c:0xCC9966, eon:'元古宙', era:'中元古代',
    d:'罗迪尼亚超大陆聚合。有性生殖。', f:'Bangiomorpha(最早红藻,1.2Ga)。',
    atm:'O₂~1%PAL。无聊十亿年。', ice:0, ocean:1, land:25, mtns:5, seaLevel:.6,
    oceanC:[.08,.45,.6], landC:[.35,.55,.2], drift:[.3,.15], o2:1, co2:5, temp:25, ext:0 },
  { name:'拉伸纪', en:'Tonian', s:1000, e:720, c:0xDDBB77, eon:'元古宙', era:'新元古代',
    d:'罗迪尼亚裂解。最早动物?', f:'Otavia antiqua(最早海绵?)。',
    atm:'O₂缓慢上升。超大陆裂解释放营养盐。', ice:0, ocean:1, land:30, mtns:6, seaLevel:.7,
    oceanC:[.08,.4,.6], landC:[.4,.55,.22], drift:[.4,.2], o2:3, co2:4, temp:22, ext:0 },
  { name:'成冰纪', en:'Cryogenian', s:720, e:635, c:0xCCDDEE, eon:'元古宙', era:'新元古代',
    d:'Sturtian+Marinoan全球冰封!', f:'冰期后疑源类多样性爆发。',
    atm:'O₂~2-5%。全球冰封→极端温室融冰。', ice:1, ocean:1, land:25, mtns:4, seaLevel:.2,
    oceanC:[.7,.85,.95], landC:[.85,.9,.95], drift:[.35,.18], o2:4, co2:3, temp:-20, ext:1 },
  { name:'埃迪卡拉纪', en:'Ediacaran', s:635, e:541, c:0xCC8844, eon:'元古宙', era:'新元古代',
    d:'最早大型多细胞生物。氧上升。', f:'狄更逊虫、查恩盘虫、Kimberella。',
    atm:'O₂~8-15%。海洋深层氧化。', ice:.2, ocean:1, land:35, mtns:6, seaLevel:.65,
    oceanC:[.08,.4,.6], landC:[.35,.5,.2], drift:[.45,.25], o2:10, co2:6, temp:18, ext:0 },
  { name:'寒武纪', en:'Cambrian', s:541, e:485, c:0x669966, eon:'显生宙', era:'古生代',
    d:'寒武纪大爆发。所有动物门类出现。', f:'三叶虫、奇虾。伯吉斯页岩。',
    atm:'O₂~15-20%。CO₂~4500ppm。超级温室。', ice:0, ocean:1, land:38, mtns:7, seaLevel:.85,
    oceanC:[.06,.35,.6], landC:[.35,.5,.18], drift:[.5,.3], o2:18, co2:4500, temp:25, ext:0 },
  { name:'奥陶纪', en:'Ordovician', s:485, e:444, c:0x559955, eon:'显生宙', era:'古生代',
    d:'海平面最高。末期冰期灭绝85%。', f:'笔石、鹦鹉螺。',
    atm:'CO₂~4200ppm。末期骤降→冰期→灭绝。', ice:.6, ocean:1, land:40, mtns:7, seaLevel:.9,
    oceanC:[.06,.35,.6], landC:[.3,.5,.18], drift:[.55,.32], o2:16, co2:4200, temp:20, ext:2 },
  { name:'志留纪', en:'Silurian', s:444, e:419, c:0x77AA77, eon:'显生宙', era:'古生代',
    d:'气候回暖。维管植物登陆。', f:'Cooksonia。巨型海蝎。',
    atm:'CO₂~3000ppm。O₂~15%。', ice:0, ocean:1, land:42, mtns:8, seaLevel:.8,
    oceanC:[.06,.35,.6], landC:[.25,.5,.15], drift:[.55,.35], o2:15, co2:3000, temp:24, ext:0 },
  { name:'泥盆纪', en:'Devonian', s:419, e:359, c:0x88BB88, eon:'显生宙', era:'古生代',
    d:'鱼类时代。森林出现。两栖登陆。', f:'邓氏鱼(8m)。鱼石螈。',
    atm:'O₂~20%。森林光合大增。', ice:0, ocean:1, land:45, mtns:8, seaLevel:.75,
    oceanC:[.06,.3,.55], landC:[.2,.5,.1], drift:[.6,.38], o2:20, co2:2000, temp:23, ext:2 },
  { name:'石炭纪', en:'Carboniferous', s:359, e:299, c:0x66AA88, eon:'显生宙', era:'古生代',
    d:'蕨类森林→煤层。O₂~35%!', f:'Meganeura(70cm)。Arthropleura(2.5m)。',
    atm:'O₂峰值~35%。CO₂降至现代水平。', ice:.4, ocean:1, land:48, mtns:9, seaLevel:.6,
    oceanC:[.06,.3,.55], landC:[.15,.45,.1], drift:[.65,.42], o2:35, co2:400, temp:16, ext:0 },
  { name:'二叠纪', en:'Permian', s:299, e:252, c:0xDD6644, eon:'显生宙', era:'古生代',
    d:'盘古大陆。史上最大灭绝96%!', f:'异齿龙、二齿兽。',
    atm:'西伯利亚大火成岩省→大灭绝。', ice:0, ocean:1, land:55, mtns:10, seaLevel:.3,
    oceanC:[.06,.3,.55], landC:[.6,.35,.15], drift:[.7,.45], o2:18, co2:2000, temp:28, ext:3, volcano:true },
  { name:'三叠纪', en:'Triassic', s:252, e:201, c:0x9944AA, eon:'显生宙', era:'中生代',
    d:'大灭绝后复苏。最早恐龙和哺乳动物。', f:'腔骨龙。Morganucodon。',
    atm:'CO₂~2000ppm。内陆极端干旱。', ice:0, ocean:1, land:52, mtns:8, seaLevel:.4,
    oceanC:[.06,.3,.55], landC:[.55,.4,.2], drift:[.7,.48], o2:16, co2:2000, temp:22, ext:3 },
  { name:'侏罗纪', en:'Jurassic', s:201, e:145, c:0x6666CC, eon:'显生宙', era:'中生代',
    d:'恐龙鼎盛。泛大陆裂解→大西洋。', f:'梁龙、剑龙、始祖鸟。',
    atm:'CO₂~1200ppm。O₂~18%。全球温暖无冰。', ice:0, ocean:1, land:50, mtns:7, seaLevel:.7,
    oceanC:[.06,.3,.55], landC:[.25,.48,.12], drift:[.65,.5], o2:18, co2:1200, temp:20, ext:0 },
  { name:'白垩纪', en:'Cretaceous', s:145, e:66, c:0x448844, eon:'显生宙', era:'中生代',
    d:'被子植物崛起。Chicxulub撞击!', f:'霸王龙、三角龙。最早的花。',
    atm:'CO₂~1700ppm。撞击→核冬天。', ice:0, ocean:1, land:55, mtns:7, seaLevel:.85,
    oceanC:[.06,.3,.55], landC:[.2,.45,.1], drift:[.6,.52], o2:20, co2:1700, temp:22, ext:2, impact:true },
  { name:'古新世', en:'Paleocene', s:66, e:56, c:0xDDBB66, eon:'显生宙', era:'新生代',
    d:'哺乳动物快速演化。全球温暖。', f:'Titanoboa(13m)。早期灵长类。',
    atm:'CO₂~500ppm。PETM前温暖。', ice:0, ocean:1, land:55, mtns:8, seaLevel:.7,
    oceanC:[.06,.32,.55], landC:[.3,.5,.15], drift:[.55,.52], o2:21, co2:500, temp:24, ext:0 },
  { name:'始新世', en:'Eocene', s:56, e:33.9, c:0xDDAA44, eon:'显生宙', era:'新生代',
    d:'PETM极热。现代哺乳动物目出现。', f:'始祖象、走鲸。',
    atm:'PETM:CO₂~2000ppm,+5-8°C。后CO₂下降。', ice:.1, ocean:1, land:55, mtns:9, seaLevel:.75,
    oceanC:[.06,.35,.55], landC:[.3,.5,.15], drift:[.5,.5], o2:21, co2:1500, temp:28, ext:0 },
  { name:'渐新世', en:'Oligocene', s:33.9, e:23, c:0xDD8822, eon:'显生宙', era:'新生代',
    d:'全球变冷。南极冰盖形成。', f:'巨犀。最早猿类。',
    atm:'CO₂~400ppm。环南极洋流→冰盖生长。', ice:.4, ocean:1, land:58, mtns:9, seaLevel:.55,
    oceanC:[.08,.38,.58], landC:[.45,.45,.2], drift:[.45,.45], o2:21, co2:400, temp:18, ext:0 },
  { name:'中新世', en:'Miocene', s:23, e:5.33, c:0xDD9922, eon:'显生宙', era:'新生代',
    d:'喜马拉雅造山。C4草原扩张。', f:'巨齿鲨。人亚科祖先。',
    atm:'CO₂~300-400。中期适宜→晚期变冷。', ice:.2, ocean:1, land:60, mtns:10, seaLevel:.6,
    oceanC:[.08,.4,.6], landC:[.4,.48,.18], drift:[.4,.4], o2:21, co2:350, temp:16, ext:0 },
  { name:'上新世', en:'Pliocene', s:5.33, e:2.58, c:0xDD7722, eon:'显生宙', era:'新生代',
    d:'巴拿马地峡形成。北极冰盖扩展。', f:'南方古猿"露西"。',
    atm:'CO₂~350-400。比现在暖2-3°C。', ice:.5, ocean:1, land:60, mtns:10, seaLevel:.45,
    oceanC:[.08,.42,.6], landC:[.4,.5,.2], drift:[.35,.35], o2:21, co2:380, temp:14, ext:0 },
  { name:'更新世', en:'Pleistocene', s:2.58, e:0.0117, c:0xFF5533, eon:'显生宙', era:'第四纪',
    d:'冰期-间冰期×20次。智人扩散全球。', f:'猛犸象、剑齿虎、尼安德特人。',
    atm:'CO₂ 180→280ppm振荡。O₂~21%。', ice:.8, ocean:1, land:58, mtns:8, seaLevel:.2,
    oceanC:[.08,.4,.6], landC:[.35,.48,.22], drift:[.3,.3], o2:21, co2:250, temp:10, ext:0, iceAge:true },
  { name:'全新世', en:'Holocene', s:0.0117, e:0, c:0xFF3300, eon:'显生宙', era:'第四纪',
    d:'农业→文明→工业。CO₂280→420!', f:'混凝土、塑料、²³⁹Pu、鸡骨。',
    atm:'工业革命后CO₂+50%。人类世。', ice:.3, ocean:1, land:60, mtns:6, seaLevel:.55,
    oceanC:[.06,.38,.58], landC:[.3,.5,.15], drift:[.28,.28], o2:21, co2:420, temp:15, ext:1, humans:true },
]
const N=ERAS.length

/* ── Helpers ── */
function noise(x,z,s=.8){return Math.sin(x*s)*Math.cos(z*s*.8)+Math.sin(x*s*1.5+z*s)*.6+Math.cos(z*s*1.2-x*s*.4)*.5}
function ridge(x,z){return .5-Math.abs(noise(x,z,1.2))}
function lerp(a,b,t){return a+(b-a)*t}
function lerpArr(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}

let terrainGeo,terrainMesh,ocean,clouds,atmoMat,volcanoMarker,impactMarker,gauges

function buildTerrain(era){
  const seg=130,sz=R*2.5,geo=new THREE.PlaneGeometry(sz,sz,seg,seg)
  geo.rotateX(-Math.PI/2)
  const p=geo.attributes.position
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),dist=Math.sqrt(x*x+z*z)
    if(dist>R){p.setY(i,-1);continue}
    const n=noise(x,z)+ridge(x,z)*.4+noise(x,z,2)*.3
    const mtn=Math.exp(-(((dist-R*.3)/.8)**2))*.5+Math.exp(-(((z-x*.3)/.7)**2))*.4+Math.exp(-(((x+.5)/.5)**2))*.3
    const h=Math.max(-.2,Math.min(.5,n*.3+mtn*era.mtns*.04-.05+Math.random()*.02))
    // Sea level adjustment
    const sl=era.seaLevel*.15
    p.setY(i,Math.max(-.2,h-sl))
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
    const h=p.getY(i),isLand=h>-.05&&dist<RI
    const lat=Math.abs(Math.atan2(z,x))/Math.PI*2
    const iced=era.ice>0&&(lat>.6-era.ice*.3||h>.2)
    if(iced&&isLand){cols[i*3]=.85+Math.random()*.1;cols[i*3+1]=.9+Math.random()*.08;cols[i*3+2]=.95+Math.random()*.05}
    else if(isLand){
      const biome=Math.min(1,h*2+lat*.3)
      if(biome>.7){cols[i*3]=era.landC[0]*.7;cols[i*3+1]=era.landC[1]*.5;cols[i*3+2]=era.landC[2]*.4}
      else if(biome>.4){cols[i*3]=era.landC[0]+Math.random()*.04;cols[i*3+1]=era.landC[1]+Math.random()*.04;cols[i*3+2]=era.landC[2]+Math.random()*.03}
      else{cols[i*3]=era.landC[0]*.8;cols[i*3+1]=era.landC[1]*1.1;cols[i*3+2]=era.landC[2]*.8}
    }else{
      const d=Math.max(0,Math.min(1,(-h)/.3))
      cols[i*3]=era.oceanC[0]+d*.04;cols[i*3+1]=era.oceanC[1]+d*.08;cols[i*3+2]=era.oceanC[2]+d*.1
    }
  }
  ca.needsUpdate=true
}

function buildOcean(){
  const geo=new THREE.CircleGeometry(R,80);geo.rotateX(-Math.PI/2)
  const orig=new Float32Array(geo.attributes.position.array);geo.userData={orig}
  const mat=new THREE.MeshBasicMaterial({color:0x3377cc,transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide})
  const mesh=new THREE.Mesh(geo,mat)
  const wg=new THREE.Group();const lMat=new THREE.LineBasicMaterial({color:0x88bbff,transparent:true,opacity:.35})
  for(let i=0;i<60;i++){const a=Math.random()*Math.PI*2,d=R*.15+Math.random()*R*.8,cx=Math.cos(a)*d,cz=Math.sin(a)*d,len=.08+Math.random()*.25;wg.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(cx-len*.5,OY+.01,cz),new THREE.Vector3(cx+len*.5,OY+.01,cz)]),lMat))}
  mesh.add(wg);mesh.userData.waveLines=wg
  return mesh
}

function animateOcean(ocean,t){
  const p=ocean.geometry.attributes.position,orig=ocean.geometry.userData.orig
  for(let i=0;i<p.count;i++){const x=orig[i*3],z=orig[i*3+2],dist=Math.sqrt(x*x+z*z);if(dist>R*.98){p.setY(i,-.35);continue};p.setY(i,OY+Math.sin(dist*4-t*3)*.02+Math.sin(x*6+t*1.5)*.015+Math.cos(z*5+t*2)*.015+Math.sin((x+z)*3.5+t)*.018+Math.sin(dist*7+t*4)*.008)}
  p.needsUpdate=true
  if(ocean.userData.waveLines)ocean.userData.waveLines.children.forEach((l,i)=>{l.position.y=OY+.01+Math.sin(i*.5+t*2)*.008;l.rotation.z+=.003})
}

function buildClouds(){
  const n=500,geo=new THREE.BufferGeometry(),pos=new Float32Array(n*3),vel=new Float32Array(n*3)
  for(let i=0;i<n;i++){const ph=Math.acos(2*Math.random()-1),th=Math.random()*Math.PI*2,rr=R*.6+Math.random()*.5;pos[i*3]=rr*Math.sin(ph)*Math.cos(th);pos[i*3+1]=rr*Math.cos(ph)+.45;pos[i*3+2]=rr*Math.sin(ph)*Math.sin(th);vel[i*3]=(Math.random()-.5)*.3;vel[i*3+1]=0;vel[i*3+2]=(Math.random()-.5)*.3}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.userData={vel}
  return new THREE.Points(geo,new THREE.PointsMaterial({color:0xffffff,size:.12,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}))
}

function animateClouds(c,dt){const p=c.geometry.attributes.position,v=c.geometry.userData.vel;for(let i=0;i<p.count;i++){let x=p.getX(i)+v[i*3]*dt,y=p.getY(i),z=p.getZ(i)+v[i*3+2]*dt;if(Math.sqrt(x*x+z*z)>R*.95||Math.sqrt(x*x+z*z)<R*.5){v[i*3]*=-1;v[i*3+2]*=-1};p.setXYZ(i,x,y,z)};p.needsUpdate=true}

// ── Gauges (O₂, CO₂, Temp) ──
function buildGauges(){
  const g=new THREE.Group()
  const bg=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.8),new THREE.MeshBasicMaterial({color:0x111122,transparent:true,opacity:.7,side:THREE.DoubleSide,depthTest:false}))
  bg.position.set(0,-R-.8,0);g.add(bg)
  return g
}

/* ── Module ── */
export function GeologicTimeModule(scene,params,services){
  const{labelSystem,cameraRig}=services
  const grp=new THREE.Group()
  let ei=N-1,fi=N-1,tt=0,counter=0

  scene.background=new THREE.Color(0x0a0a14)
  scene.fog=new THREE.Fog(0x0a0a14,8,20)

  ocean=buildOcean();grp.add(ocean)
  terrainGeo=buildTerrain(ERAS[ei]);terrainMesh=new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:.05,side:THREE.DoubleSide}));grp.add(terrainMesh)
  atmoMat=new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:.06,side:THREE.DoubleSide,depthWrite:false})
  grp.add(new THREE.Mesh(new THREE.SphereGeometry(R*1.3,48,24),atmoMat))
  clouds=buildClouds();grp.add(clouds)
  // Erosion rivers
  const rMat=new THREE.LineBasicMaterial({color:0x4488aa,transparent:true,opacity:.25})
  for(let r=0;r<5;r++){const pts=[];for(let i=0;i<=30;i++){const t=i/30,a=t*Math.PI*2+r*1.3;pts.push(new THREE.Vector3(Math.cos(a)*(R*.2+t*R*.65),.03+Math.random()*.02,Math.sin(a)*(R*.2+t*R*.65)))};grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),rMat))}

  // Volcano marker
  volcanoMarker=new THREE.Group()
  const vGeo=new THREE.ConeGeometry(.12,.3,8);const vMat=new THREE.MeshBasicMaterial({color:0xff4400})
  volcanoMarker.add(new THREE.Mesh(vGeo,vMat))
  const vGlow=new THREE.Mesh(new THREE.SphereGeometry(.18,16),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}))
  volcanoMarker.add(vGlow);volcanoMarker.position.set(1,0,1.5);volcanoMarker.visible=false;grp.add(volcanoMarker)

  // Impact marker
  impactMarker=new THREE.Group()
  const impGlow=new THREE.Mesh(new THREE.RingGeometry(.1,.25,32),new THREE.MeshBasicMaterial({color:0xffcc00,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}))
  impGlow.rotation.x=-Math.PI/2;impactMarker.add(impGlow)
  impactMarker.position.set(-1.5,0,.5);impactMarker.visible=false;grp.add(impactMarker)

  // Gauges
  gauges=buildGauges();grp.add(gauges)

  // Strata
  const strataCols=[0xFF3300,0xFF5533,0xDD7722,0xDD9922,0xDD8822,0xDDAA44,0xDDBB66,0x448844,0x6666CC,0x9944AA,0xDD6644,0x66AA88,0x88BB88,0x77AA77,0x559955,0x669966,0xCC8844]
  strataCols.forEach((c,i)=>{
    const y=.18-i*.04
    const h=i===16?0.05:0.04
    const b=new THREE.Mesh(new THREE.BoxGeometry(.35,h,.18),new THREE.MeshStandardMaterial({color:c,roughness:.7,metalness:.1,transparent:true,opacity:.85}))
    b.position.set(-R-.45,y,0)
    grp.add(b)
  })

  // Time rings
  const rings=[];ERAS.forEach((e,i)=>{const r=R+.3+i*.03,pts=[];for(let j=0;j<=64;j++){const t=j/64*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(t)*r,.02,Math.sin(t)*r))};rings.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:e.c,transparent:true,opacity:.1,depthTest:true})));grp.add(rings[i])})

  // Human impact
  const imp=new THREE.Group();[[1.2,.04,1],[-1.5,.04,-.8],[.4,.04,-1.8],[-.8,.04,1.5],[1.8,.04,-1.2]].forEach(([x,y,z])=>{imp.add(new THREE.Mesh(new THREE.SphereGeometry(.05,8),new THREE.MeshBasicMaterial({color:0xff4400})));const gl=new THREE.Mesh(new THREE.RingGeometry(.06,.14,16),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));gl.rotation.x=-Math.PI/2;gl.position.set(x,y,z);imp.add(gl)});imp.visible=false;grp.add(imp)

  if(cameraRig){const a=25*Math.PI/180;cameraRig.camera.position.set(0,Math.sin(a)*12,Math.cos(a)*12);cameraRig.controls.target.set(0,-.2,0);cameraRig.controls.enableRotate=false;cameraRig.controls.minDistance=5;cameraRig.controls.maxDistance=18;cameraRig.controls.update()}

  function lbls(){
    if(!labelSystem)return
    labelSystem.clearAll(scene)
    const e=ERAS[ei]
    labelSystem.addToGroup(grp,`${e.name} · ${e.en}`,new THREE.Vector3(0,3.5,0),{color:'#'+e.c.toString(16).padStart(6,'0'),fontSize:'18px',fontWeight:'700',background:'rgba(0,0,0,0.7)',padding:'8px 16px',borderRadius:'6px'})
    labelSystem.addToGroup(grp,`${e.eon}/${e.era} · ${e.s}—${e.e===0?'今':e.e} Ma`,new THREE.Vector3(0,2.9,0),{color:'#aaa',fontSize:'11px',background:'rgba(0,0,0,0.5)',padding:'3px 10px'})
    labelSystem.addToGroup(grp,e.d,new THREE.Vector3(0,-3.5,0),{color:'#ddd',fontSize:'13px',background:'rgba(0,0,0,0.65)',padding:'8px 14px',borderRadius:'6px',whiteSpace:'normal',maxWidth:'500px',lineHeight:'1.5'})
    labelSystem.addToGroup(grp,`🌫 ${e.atm}`,new THREE.Vector3(0,-2.8,0),{color:'#aaccff',fontSize:'10px',background:'rgba(0,0,0,0.6)',padding:'6px 10px',borderRadius:'4px',whiteSpace:'normal',maxWidth:'480px',lineHeight:'1.4'})
    // Gauge labels
    labelSystem.addToGroup(grp,`O₂ ${e.o2<1?e.o2.toFixed(1):Math.round(e.o2)}%  CO₂ ${Math.round(e.co2)}ppm  ${e.temp}°C`,new THREE.Vector3(0,-R-.65,0),{color:'#ffcc44',fontSize:'12px',fontWeight:'700',background:'rgba(0,0,0,0.7)',padding:'4px 10px'})
    if(e.ext>0)labelSystem.addToGroup(grp,`💀 大灭绝 Lv${e.ext}`,new THREE.Vector3(R+1,1,0),{color:'#ff4444',fontSize:'14px',fontWeight:'700',background:'rgba(0,0,0,0.7)',padding:'6px 10px',borderRadius:'4px'})
    if(e.volcano)labelSystem.addToGroup(grp,`🌋 西伯利亚大火成岩省`,new THREE.Vector3(R+1,.5,0),{color:'#ff6600',fontSize:'11px',fontWeight:'700',background:'rgba(0,0,0,0.6)',padding:'4px 8px'})
    if(e.impact)labelSystem.addToGroup(grp,`☄️ Chicxulub撞击`,new THREE.Vector3(R+1,.5,0),{color:'#ffcc00',fontSize:'11px',fontWeight:'700',background:'rgba(0,0,0,0.6)',padding:'4px 8px'})
    if(e.ice>0)labelSystem.addToGroup(grp,`🧊 冰盖${Math.round(e.ice*100)}%`,new THREE.Vector3(-R-1,.9,0),{color:'#cceeff',fontSize:'11px',fontWeight:'700',background:'rgba(0,0,0,0.6)',padding:'4px 8px'})
    if(e.iceAge)labelSystem.addToGroup(grp,`🔄 冰期-间冰期×20`,new THREE.Vector3(-R-1,.5,0),{color:'#cceeff',fontSize:'10px',background:'rgba(0,0,0,0.6)',padding:'4px 8px'})
    if(e.humans)labelSystem.addToGroup(grp,`👤 人类世`,new THREE.Vector3(R+1,-.5,0),{color:'#ff4444',fontSize:'14px',fontWeight:'700',background:'rgba(0,0,0,0.7)',padding:'6px 10px'})
    const od=e.ocean===0?'海洋未形成':e.oceanC[1]>.7?'冰盖覆盖':e.oceanC[1]>.5?'含氧深海':e.oceanC[1]>.4?'富铁绿海':'初生海洋'
    labelSystem.addToGroup(grp,`🌊 ${od}`,new THREE.Vector3(-R-1,.4,0),{color:'#88ccff',fontSize:'11px',fontWeight:'700',background:'rgba(0,0,0,0.6)',padding:'4px 8px'})
    // Drift indicator
    labelSystem.addToGroup(grp,`🗺 板块漂移 ${Math.round(e.drift[0]*100)}%`,new THREE.Vector3(-R-1,-.1,0),{color:'#ffaa88',fontSize:'10px',background:'rgba(0,0,0,0.6)',padding:'4px 8px'})
    // Scale reference
    labelSystem.addToGroup(grp,`📏 圆盘≈12700km · 1cm≈${Math.round(12700/R/2)}km`,new THREE.Vector3(R+1,-1.5,0),{color:'#888',fontSize:'9px',background:'rgba(0,0,0,0.5)',padding:'2px 6px'})
    labelSystem.addToGroup(grp,'◀ 地层',new THREE.Vector3(-R-.8,.8,0),{color:'#ffaa44',fontSize:'12px',fontWeight:'700',background:'rgba(0,0,0,0.6)'})
  }
  lbls()

  const api={
    setParams(p){if(p.era!==undefined&&p.era!==ei){fi=ei;ei=p.era;tt=0;imp.visible=ei===N-1;rings.forEach((r,i)=>{r.material.opacity=i===ei?0.8:0.1});volcanoMarker.visible=ERAS[ei].volcano||false;impactMarker.visible=ERAS[ei].impact||false;lbls()}},
    update(dt){
      counter++;const era=ERAS[ei]
      animateOcean(ocean,counter*.016);animateClouds(clouds,dt)
      if(tt<1){tt=Math.min(1,tt+dt*1.5);if(counter%2===0){const fa=ERAS[fi],ea=ERAS[ei];const le={landC:lerpArr(fa.landC,ea.landC,tt),oceanC:lerpArr(fa.oceanC,ea.oceanC,tt),ice:lerp(fa.ice,ea.ice,tt),mtns:lerp(fa.mtns,ea.mtns,tt),seaLevel:lerp(fa.seaLevel,ea.seaLevel,tt)};updateColors(terrainGeo,le);ocean.material.color.setRGB(le.oceanC[0]+.05,le.oceanC[1]+.1,le.oceanC[2]+.2)}}
      // Animate volcano
      if(volcanoMarker.visible){volcanoMarker.children[1].scale.setScalar(.8+Math.sin(Date.now()*.005)*.4)}
      // Animate impact glow
      if(impactMarker.visible){impactMarker.children[0].material.opacity=.3+Math.sin(Date.now()*.004)*.2}
      // Animate human impacts
      imp.children.forEach(c=>{if(c.material?.blending===THREE.AdditiveBlending)c.material.opacity=.3+Math.sin(Date.now()*.003)*.15})
    },
    dispose(){},
  }
  grp.userData={api}
  return grp
}

export{ERAS}
