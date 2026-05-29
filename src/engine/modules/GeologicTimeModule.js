// [M11] GeologicTimeModule — 地质年代3D — 浮岛+海+云+冰+大气

import * as THREE from 'three'

const R=3.8, N=26
const ERAS = [
  { n:'冥古宙', en:'Hadean', s:4600, e:4000, c:0x660000, eon:'冥古宙', era:'—',
    d:'地球吸积。月球诞生。全球岩浆海洋。', f:'无生命。', atm:'H₂/He/CH₄为主，无水汽，无氧。地表温度>200°C。', ice:false, ocean:false, land:5 },
  { n:'始太古宙', en:'Eoarchean', s:4000, e:3600, c:0x882222, eon:'太古宙', era:'始太古代',
    d:'最古老岩石。地壳冷却。海洋形成。', f:'最古老生命化学痕迹(Isua)。', atm:'CO₂/N₂为主，少量H₂O。无游离氧。地表~80°C。', ice:false, ocean:true, land:8 },
  { n:'古太古宙', en:'Paleoarchean', s:3600, e:3200, c:0x993333, eon:'太古宙', era:'古太古代',
    d:'最早确凿生命证据。叠层石建造。', f:'叠层石(Stromatolite,~3.48Ga)。', atm:'N₂/CO₂为主。海洋富Fe²⁺呈绿色。厌氧大气。', ice:false, ocean:true, land:10 },
  { n:'中太古宙', en:'Mesoarchean', s:3200, e:2800, c:0xAA4444, eon:'太古宙', era:'中太古代',
    d:'最早克拉通。BIF沉积。', f:'蓝藻繁盛，光合产氧开始。', atm:'蓝藻释放微量O₂，立即被海洋Fe²⁺消耗。大气仍缺氧。', ice:false, ocean:true, land:12 },
  { n:'新太古宙', en:'Neoarchean', s:2800, e:2500, c:0xBB5555, eon:'太古宙', era:'新太古代',
    d:'大陆快速生长。BIF高峰。', f:'真核生物甾烷(~2.7Ga)。', atm:'O₂开始在大气积累的临界点。条带状铁建造指示海洋化学转变。', ice:false, ocean:true, land:15 },
  { n:'古元古代', en:'Paleoproterozoic', s:2500, e:1600, c:0xBB8855, eon:'元古宙', era:'古元古代',
    d:'大氧化事件(GOE)。休伦冰期。', f:'Grypania spiralis。', atm:'GOE(~2.4Ga)：大气O₂从<0.001%升至~1%。甲烷温室效应崩溃触发休伦冰期。', ice:true, ocean:true, land:20 },
  { n:'中元古代', en:'Mesoproterozoic', s:1600, e:1000, c:0xCC9966, eon:'元古宙', era:'中元古代',
    d:'罗迪尼亚超大陆聚合。有性生殖。', f:'Bangiomorpha(红藻)。', atm:'O₂稳定在~1%PAL。"无聊的十亿年"——大气氧几乎不变。', ice:false, ocean:true, land:25 },
  { n:'拉伸纪', en:'Tonian', s:1000, e:720, c:0xDDBB77, eon:'元古宙', era:'新元古代',
    d:'罗迪尼亚裂解。最早动物?', f:'Otavia antiqua(海绵?)。', atm:'O₂缓慢上升。超大陆裂解释放营养盐促进生物生产力。', ice:false, ocean:true, land:30 },
  { n:'成冰纪', en:'Cryogenian', s:720, e:635, c:0xCCDDEE, eon:'元古宙', era:'新元古代',
    d:'Sturtian+Marinoan全球冰期。', f:'冰期后疑源类爆发。', atm:'O₂约2-5%PAL。全球冰封反射阳光→极端温室后冰融。'+"雪球地球"+"。", ice:true, ocean:true, land:25 },
  { n:'埃迪卡拉纪', en:'Ediacaran', s:635, e:541, c:0xCC8844, eon:'元古宙', era:'新元古代',
    d:'最早大型多细胞生物。', f:'狄更逊虫、查恩盘虫。', atm:'O₂升至~8-15%PAL。海洋深层氧化。为寒武纪爆发奠定基础。', ice:false, ocean:true, land:35 },
  { n:'寒武纪', en:'Cambrian', s:541, e:485, c:0x669966, eon:'显生宙', era:'古生代',
    d:'寒武纪大爆发。所有动物门类出现。', f:'三叶虫、奇虾。伯吉斯页岩。', atm:'O₂~15-20%，CO₂~4500ppm(现代11倍)。超级温室气候。', ice:false, ocean:true, land:40 },
  { n:'奥陶纪', en:'Ordovician', s:485, e:444, c:0x559955, eon:'显生宙', era:'古生代',
    d:'海平面历史最高。末期冰期大灭绝。', f:'笔石、鹦鹉螺。', atm:'CO₂~4200ppm。末期CO₂骤降触发冰期→灭绝。', ice:true, ocean:true, land:42 },
  { n:'志留纪', en:'Silurian', s:444, e:419, c:0x77AA77, eon:'显生宙', era:'古生代',
    d:'气候回暖。维管植物登陆。', f:'Cooksonia。', atm:'CO₂回升至~3000ppm。O₂~15%。温暖湿润。', ice:false, ocean:true, land:45 },
  { n:'泥盆纪', en:'Devonian', s:419, e:359, c:0x88BB88, eon:'显生宙', era:'古生代',
    d:'鱼类时代。森林出现。两栖登陆。', f:'邓氏鱼。鱼石螈。', atm:'O₂升至~20%。森林光合作用大增。末期CO₂下降+变冷。', ice:false, ocean:true, land:48 },
  { n:'石炭纪', en:'Carboniferous', s:359, e:299, c:0x66AA88, eon:'显生宙', era:'古生代',
    d:'蕨类森林→煤层。O₂~35%!', f:'Meganeura(70cm)。Arthropleura。', atm:'O₂峰值~35%(现代1.7倍!)——巨型昆虫的直接原因。CO₂降至当代水平。', ice:true, ocean:true, land:50 },
  { n:'二叠纪', en:'Permian', s:299, e:252, c:0xDD6644, eon:'显生宙', era:'古生代',
    d:'盘古大陆。最大灭绝96%物种。', f:'异齿龙、二齿兽。', atm:'西伯利亚大火成岩省喷发→CO₂暴增→全球变暖+海洋酸化→大灭绝。', ice:false, ocean:true, land:55 },
  { n:'三叠纪', en:'Triassic', s:252, e:201, c:0x9944AA, eon:'显生宙', era:'中生代',
    d:'大灭绝后复苏。最早恐龙。', f:'腔骨龙。Morganucodon。', atm:'CO₂~2000ppm。泛大陆内陆极端干旱。末期火山喷发导致灭绝。', ice:false, ocean:true, land:52 },
  { n:'侏罗纪', en:'Jurassic', s:201, e:145, c:0x6666CC, eon:'显生宙', era:'中生代',
    d:'恐龙鼎盛。泛大陆裂解。', f:'梁龙、剑龙、始祖鸟。', atm:'CO₂~1200ppm。O₂~18%。全球温暖无冰。', ice:false, ocean:true, land:50 },
  { n:'白垩纪', en:'Cretaceous', s:145, e:66, c:0x448844, eon:'显生宙', era:'中生代',
    d:'被子植物崛起。Chicxulub撞击。', f:'霸王龙、三角龙。最早的花。', atm:'CO₂~1700ppm。O₂~20%。白垩纪温室达到峰值。撞击导致核冬天→灭绝。', ice:false, ocean:true, land:55 },
  { n:'古新世', en:'Paleocene', s:66, e:56, c:0xDDBB66, eon:'显生宙', era:'新生代',
    d:'哺乳动物快速演化。全球温暖。', f:'Titanoboa。早期灵长类。', atm:'CO₂~500ppm。PETM前温暖温室。', ice:false, ocean:true, land:55 },
  { n:'始新世', en:'Eocene', s:56, e:33.9, c:0xDDAA44, eon:'显生宙', era:'新生代',
    d:'PETM极热。现代哺乳动物目出现。', f:'始祖象、走鲸。', atm:'PETM：CO₂~2000ppm，全球温升5-8°C。此后CO₂持续下降→南极结冰。', ice:false, ocean:true, land:55 },
  { n:'渐新世', en:'Oligocene', s:33.9, e:23, c:0xDD8822, eon:'显生宙', era:'新生代',
    d:'全球变冷。南极冰盖形成。', f:'巨犀。最早猿类。', atm:'CO₂降至~400ppm。环南极洋流形成→南极被热隔离→冰盖生长。', ice:true, ocean:true, land:58 },
  { n:'中新世', en:'Miocene', s:23, e:5.33, c:0xDD9922, eon:'显生宙', era:'新生代',
    d:'喜马拉雅造山。C4草原扩张。', f:'巨齿鲨。人亚科祖先。', atm:'CO₂~300-400ppm。中新世中期气候适宜期→晚期变冷。', ice:false, ocean:true, land:58 },
  { n:'上新世', en:'Pliocene', s:5.33, e:2.58, c:0xDD7722, eon:'显生宙', era:'新生代',
    d:'巴拿马地峡形成。北极冰盖扩展。', f:'南方古猿"露西"。', atm:'CO₂~350-400ppm。全球比现在暖2-3°C。北极冰盖开始形成。', ice:true, ocean:true, land:60 },
  { n:'更新世', en:'Pleistocene', s:2.58, e:0.0117, c:0xFF5533, eon:'显生宙', era:'第四纪',
    d:'冰期-间冰期×~20次。智人扩散全球。', f:'猛犸象、剑齿虎、尼安德特人。', atm:'CO₂在冰期~180ppm/间冰期~280ppm振荡。O₂~21%。现代大气组成确立。', ice:true, ocean:true, land:58 },
  { n:'全新世', en:'Holocene', s:0.0117, e:0, c:0xFF3300, eon:'显生宙', era:'第四纪',
    d:'农业→文明→工业。CO₂ 280→420ppm!', f:'混凝土、塑料、²³⁹Pu、鸡骨化石。', atm:'工业革命后CO₂从280ppm↑420ppm(+50%)，CH₄↑150%。人类世大气扰动史无前例。', ice:true, ocean:true, land:60 },
]

/* ── Helpers ── */
function lerp(a,b,t){return a+(b-a)*t}
function param(t){
  const f=t/(N-1)
  return{landFrac:lerp(.05,.6,f),lr:lerp(.45,.35,f),lg:lerp(.12,.52,f),lb:lerp(.05,.2,f),or:lerp(.6,.08,f),og:lerp(.2,.3,f),ob:lerp(.08,.55,f),ah:lerp(.08,.55,f),al:lerp(.15,.5,f),ao:lerp(.2,.06,f),co:lerp(0,.35,f),bo:lerp(0,.06,f),ro:lerp(.85,.4,f)}
}

function buildGeo(){
  const s=130,sz=R*2.5,geo=new THREE.PlaneGeometry(sz,sz,s,s)
  geo.rotateX(-Math.PI/2)
  const p=geo.attributes.position
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),d=Math.sqrt(x*x+z*z)
    if(d>R){p.setY(i,-.8);continue}
    const n1=Math.sin(x*.6)*Math.cos(z*.5)+Math.cos(x*.8+z*.3)*.7+Math.sin(z*.9-x*.4)*.6
    const n2=Math.sin(x*1.8+z)*Math.cos(z*2.1-x)*.35+Math.sin(x*2.5-z*.7)*Math.cos(z*1.6+x)*.3
    const n3=Math.sin(x*3.5)*Math.cos(z*3.2)*.15+Math.cos(x*4+z*3.5)*.1
    const mt1=Math.exp(-((z-x*.3+.5)/.8)**2)*.6
    const mt2=Math.exp(-((x+.8)/.5)**2)*.5
    const mt3=Math.exp(-((z-1)/.4)**2)*.4
    p.setY(i,Math.min(.45,Math.max(-.15,n1*.25+n2+n3+(mt1+mt2+mt3)*.7-.1+Math.random()*.02)))
  }
  const dc=new Float32Array(p.count*3)
  for(let i=0;i<p.count;i++){dc[i*3]=.1;dc[i*3+1]=.35;dc[i*3+2]=.55}
  geo.setAttribute('color',new THREE.BufferAttribute(dc,3))
  geo.computeVertexNormals()
  return geo
}

function updColors(geo,pr){
  const pos=geo.attributes.position,ca=geo.attributes.color,cols=ca.array
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i),d=Math.sqrt(x*x+z*z)
    if(d>R){cols[i*3]=.06;cols[i*3+1]=.1;cols[i*3+2]=.18;continue}
    const n=Math.sin(x*.8)*Math.cos(z*.6)+Math.sin(x*1.3+z*.4)*.7+Math.cos(z*1.1-x*.3)*.6
    const isLand=n>(.5-pr.landFrac*.75)&&d<R*.92
    if(isLand){cols[i*3]=pr.lr+Math.random()*.03;cols[i*3+1]=pr.lg+Math.random()*.03;cols[i*3+2]=pr.lb+Math.random()*.02}
    else{cols[i*3]=pr.or+Math.random()*.03;cols[i*3+1]=pr.og+Math.random()*.04;cols[i*3+2]=pr.ob+Math.random()*.05}
  }
  ca.needsUpdate=true
}

/* ── Module ── */
export function GeologicTimeModule(scene,params,services){
  const{labelSystem,cameraRig}=services
  const g=new THREE.Group()
  let ei=N-1,fi=N-1,tt=0,geo,mesh,counter=0

  scene.background=new THREE.Color(0x0a0a14)

  // Ocean — fills the circular basin
  const oGeo=new THREE.CircleGeometry(R,128)
  const oMat=new THREE.MeshBasicMaterial({color:0x3377cc,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide})
  const ocean=new THREE.Mesh(oGeo,oMat);ocean.rotation.x=-Math.PI/2;ocean.position.y=-.31;g.add(ocean)

  // Terrain
  geo=buildGeo();mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.05,side:THREE.DoubleSide}))
  g.add(mesh)

  // Atmosphere shell
  const aMat=new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:.06,side:THREE.DoubleSide,depthWrite:false})
  const atmo=new THREE.Mesh(new THREE.SphereGeometry(R*1.3,48,24),aMat);atmo.position.y=.3;g.add(atmo)

  // Ice caps
  const iceN=new THREE.Mesh(new THREE.CircleGeometry(R*.22,32),new THREE.MeshBasicMaterial({color:0xeeffff,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide}))
  iceN.rotation.x=-Math.PI/2;iceN.position.set(0,.025,R*.85);g.add(iceN)
  const iceS=new THREE.Mesh(new THREE.CircleGeometry(R*.28,32),new THREE.MeshBasicMaterial({color:0xeeffff,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide}))
  iceS.rotation.x=-Math.PI/2;iceS.position.set(0,.025,-R*.85);g.add(iceS)

  // Clouds — prominent white particles
  const cGeo=new THREE.BufferGeometry()
  const ic=new Float32Array(400*3)
  for(let i=0;i<400;i++){const ph=Math.acos(2*Math.random()-1),th=Math.random()*Math.PI*2,rr=R*.75+Math.random()*.5;ic[i*3]=rr*Math.sin(ph)*Math.cos(th);ic[i*3+1]=rr*Math.cos(ph)+.4;ic[i*3+2]=rr*Math.sin(ph)*Math.sin(th)}
  cGeo.setAttribute('position',new THREE.BufferAttribute(ic,3))
  const cMat=new THREE.PointsMaterial({color:0xffffff,size:.1,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false})
  const clouds=new THREE.Points(cGeo,cMat);g.add(clouds)

  // Cross-section edge
  const strata=[
    {n:'全新世',y:.15,c:0xFF3300},{n:'更新世',y:.1,c:0xFF5533},{n:'上新世',y:.06,c:0xDD7722},
    {n:'中新世',y:.02,c:0xDD9922},{n:'古近纪',y:-.02,c:0xDDBB66},{n:'白垩纪',y:-.06,c:0x448844},
    {n:'侏罗纪',y:-.1,c:0x6666CC},{n:'三叠纪',y:-.14,c:0x9944AA},{n:'古生代',y:-.18,c:0x669966},{n:'前寒武',y:-.24,c:0xCC8844},
  ]
  const xs=g
  strata.forEach(s=>{
    const b=new THREE.Mesh(new THREE.BoxGeometry(.3,s.n==='前寒武'?.1:.05,.15),new THREE.MeshBasicMaterial({color:s.c,transparent:true,opacity:.7}))
    b.position.set(-R-.4,s.y,0);xs.add(b)
  })

  // Time rings
  const rings=[]
  ERAS.forEach((e,i)=>{
    const r=R+.3+i*.03,pts=[]
    for(let j=0;j<=64;j++){const t=j/64*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(t)*r,.02,Math.sin(t)*r))}
    rings.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:e.c,transparent:true,opacity:.1,depthTest:true})))
    g.add(rings[i])
  })

  // Human impact dots
  const imp=new THREE.Group()
  ;[[1.2,.04,1],[-1.5,.04,-.8],[.4,.04,-1.8],[-.8,.04,1.5],[1.8,.04,-1.2]].forEach(([x,y,z])=>{
    imp.add(new THREE.Mesh(new THREE.SphereGeometry(.05,8),new THREE.MeshBasicMaterial({color:0xff4400})))
    const gl=new THREE.Mesh(new THREE.RingGeometry(.06,.14,16),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}))
    gl.rotation.x=-Math.PI/2;gl.position.set(x,y,z);imp.add(gl)
  })
  imp.visible=false;g.add(imp)

  if(cameraRig){const a=50*Math.PI/180;cameraRig.camera.position.set(0,Math.sin(a)*10,Math.cos(a)*10);cameraRig.controls.target.set(0,.1,0);cameraRig.controls.enableRotate=false;cameraRig.controls.minDistance=5;cameraRig.controls.maxDistance=18;cameraRig.controls.update()}

  function lbls(){
    if(!labelSystem)return
    labelSystem.clearAll(scene)
    const e=ERAS[ei]
    labelSystem.addToGroup(g,`${e.n} · ${e.en}`,new THREE.Vector3(0,3.5,0),{color:'#'+e.c.toString(16).padStart(6,'0'),fontSize:'18px',fontWeight:'700',background:'rgba(0,0,0,0.7)',padding:'8px 16px',borderRadius:'6px'})
    labelSystem.addToGroup(g,`${e.eon}/${e.era} · ${e.s}—${e.e===0?'今':e.e} Ma`,new THREE.Vector3(0,2.85,0),{color:'#aaa',fontSize:'11px',background:'rgba(0,0,0,0.5)',padding:'3px 10px'})
    labelSystem.addToGroup(g,e.d,new THREE.Vector3(0,-3.5,0),{color:'#ddd',fontSize:'13px',background:'rgba(0,0,0,0.65)',padding:'8px 14px',borderRadius:'6px',whiteSpace:'normal',maxWidth:'500px',lineHeight:'1.5'})
    labelSystem.addToGroup(g,`🌫 大气: ${e.atm}`,new THREE.Vector3(0,-2.8,0),{color:'#aaccff',fontSize:'11px',background:'rgba(0,0,0,0.6)',padding:'6px 10px',borderRadius:'4px',whiteSpace:'normal',maxWidth:'480px',lineHeight:'1.4'})
    labelSystem.addToGroup(g,'◀ 地层',new THREE.Vector3(-R-.8,.6,0),{color:'#ffaa44',fontSize:'12px',fontWeight:'700',background:'rgba(0,0,0,0.6)'})
  }
  lbls()

  const api={
    setParams(p){
      if(p.era!==undefined&&p.era!==ei){fi=ei;ei=p.era;tt=0;imp.visible=ei===N-1;rings.forEach((r,i)=>{r.material.opacity=i===ei?.8:.1});lbls()}
    },
    update(dt){
      counter++
      if(tt<1){tt=Math.min(1,tt+dt*2);const pr=param(lerp(fi,ei,tt));if(counter%3===0)updColors(geo,pr);if(counter%6===0){
        aMat.color.setHSL(pr.ah,.6,pr.al);aMat.opacity=pr.ao
        // Cloud update
        const cc=Math.floor(pr.co*800)
        const cp=clouds.geometry.attributes.position
        if(cc>0&&cp.count!==cc){const np=new Float32Array(cc*3);for(let i=0;i<cc;i++){const ph=Math.acos(2*Math.random()-1),th=Math.random()*Math.PI*2,rr=R*.7+Math.random()*.6;np[i*3]=rr*Math.sin(ph)*Math.cos(th);np[i*3+1]=rr*Math.cos(ph)+.4;np[i*3+2]=rr*Math.sin(ph)*Math.sin(th)}clouds.geometry.setAttribute('position',new THREE.BufferAttribute(np,3))}
        cMat.opacity=.15+pr.co*.8
        mesh.material.roughness=pr.ro
        oMat.color.setRGB(.15+pr.landFrac*.08,.3+pr.landFrac*.2,.5+pr.landFrac*.2)
        oMat.opacity=.3+pr.landFrac*.45
      }}
      // Ice visible during ice-age eras
      const era=ERAS[ei]
      iceN.visible=era.ice;iceS.visible=era.ice
      imp.children.forEach(c=>{if(c.material?.blending===THREE.AdditiveBlending)c.material.opacity=.3+Math.sin(Date.now()*.003)*.15})
      clouds.rotation.y+=dt*.015
    },
    dispose(){},
  }
  g.userData={api}
  return g
}

export{ERAS}
