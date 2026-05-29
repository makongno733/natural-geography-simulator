import{I as q,w as J,t as ee,B as oe,e as te,o as m,f as b,g as s,y as $,k as ae,l as se,m as R,F as N,x as E,v as w,u as K,C as Q,H as X,z as _,j as le,G as ne,T as ie,b as M,c as re}from"./vendor-core-DApvlrWF.js";import{B as ce}from"./BaseScene-CopKE9oM.js";import{r as ue,D as T,V as u,G as ve,k as de,c as me,M as D,b as W,q as fe,s as pe,a as V,t as xe,h as be,C as he,T as ye}from"./vendor-three-8d1KTJ3W.js";import{G as j}from"./GeometryFactory-m5zuLSfi.js";import{g as we,G as ge}from"./GlossaryText-fap6HpWJ.js";import{_ as ke}from"./index-C77ZB_aC.js";import"./vendor-vue-DsfoQSKV.js";const Me=`
varying float vElevation;
varying float vSlope;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

uniform float uMinHeight;
uniform float uMaxHeight;

void main() {
  vPosition = position;
  vUv = uv;
  vElevation = (position.y - uMinHeight) / (uMaxHeight - uMinHeight);
  vec3 norm = normalize(normalMatrix * normal);
  vNormal = norm;
  vSlope = 1.0 - abs(norm.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ce=`
varying float vElevation;
varying float vSlope;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

uniform float uWeatherFactor;
uniform vec3 uSunDirection;
uniform float uTime;
uniform vec3 uBiomeBias;

// 2D simplex noise (Ashima Arts)
vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g = vec3(a0.x*x0.x + h.x*x0.y, a0.y*x12.x + h.y*x12.y, a0.z*x12.z + h.z*x12.w);
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; i++) {
    v += a * snoise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  float elevation = clamp(vElevation, 0.0, 1.0);
  float slope = clamp(vSlope, 0.0, 1.0);

  // Detail noise at multiple scales
  float largeNoise = fbm(vPosition.xz * 2.5) * 0.06;
  float medNoise = snoise(vPosition.xz * 7.0 + uTime * 0.002) * 0.04;
  float fineNoise = snoise(vPosition.xz * 18.0 + uTime * 0.005) * 0.025;
  float detail = largeNoise + medNoise + fineNoise;

  float e = elevation + detail;

  // --- Biome colors (linear-ish RGB) ---
  vec3 lowVeg  = vec3(0.12, 0.32, 0.17);   // dense vegetation
  vec3 grass   = vec3(0.28, 0.48, 0.26);   // grassland
  vec3 earth   = vec3(0.52, 0.43, 0.27);   // soil / earth
  vec3 rock    = vec3(0.47, 0.39, 0.30);   // weathered rock
  vec3 bareRock= vec3(0.58, 0.52, 0.44);   // bare rock
  vec3 snow    = vec3(0.98, 0.97, 0.94);   // snow

  // --- Elevation blending (shifted by module biome bias) ---
  float b1 = 0.08 + uBiomeBias.x;
  float b2 = 0.28 + uBiomeBias.x;
  float b3 = 0.22 + uBiomeBias.y;
  float b4 = 0.42 + uBiomeBias.y;
  float b5 = 0.38 + uBiomeBias.z;
  float b6 = 0.58 + uBiomeBias.z;
  float b7 = 0.54 + uBiomeBias.z * 1.2;
  float b8 = 0.78 + uBiomeBias.z * 1.2;
  vec3 color = mix(lowVeg, grass, smoothstep(b1, b2, e));
  color = mix(color, earth, smoothstep(b3, b4, e));
  color = mix(color, rock, smoothstep(b5, b6, e));
  color = mix(color, bareRock, smoothstep(b7, b8, e));

  // --- Slope effect: steep = less veg, more rock ---
  float rockMix = smoothstep(0.18, 0.55, slope);
  vec3 steepColor = mix(vec3(0.45, 0.36, 0.27), vec3(0.55, 0.48, 0.40), rockMix);
  color = mix(color, steepColor, rockMix * 0.65);

  // Very steep = bare rock
  float bareRockMix = smoothstep(0.55, 0.82, slope);
  color = mix(color, vec3(0.62, 0.56, 0.49), bareRockMix * 0.55);

  // --- Snow at high elevation ---
  float snowLine = 0.82 + snoise(vPosition.xz * 4.0) * 0.06;
  float snowMix = smoothstep(snowLine, 0.96, e);
  color = mix(color, snow, snowMix);

  // --- Micro detail ---
  color += fineNoise * 0.12 * (1.0 - snowMix);

  // --- Simple diffuse lighting ---
  vec3 lightDir = normalize(uSunDirection);
  float NdotL = max(0.25, dot(vNormal, lightDir));
  float wrap = 0.15;
  float diffuse = max(0.0, (dot(vNormal, lightDir) + wrap) / (1.0 + wrap));
  diffuse = 0.35 + 0.65 * diffuse;

  // Slope AO — steeper slopes get slightly darker
  float ao = 0.88 + 0.12 * (1.0 - slope);
  color *= diffuse * ao;

  // --- Weather tint ---
  float weatherDarken = 1.0 - uWeatherFactor * 0.12;
  color *= weatherDarken;

  // Subtle rim light
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float rim = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 2.5) * 0.18;
  color += rim * vec3(0.6, 0.7, 0.9);

  gl_FragColor = vec4(color, 1.0);
}
`;function Se({minHeight:v,maxHeight:t,weatherFactor:o=0,sunDirection:a=new u(.5,.8,.3),biomeBias:l=new u(0,0,0),time:r=0,clippingPlanes:i=[]}={}){return new ue({uniforms:{uMinHeight:{value:v??0},uMaxHeight:{value:t??1},uWeatherFactor:{value:o},uSunDirection:{value:a},uBiomeBias:{value:l},uTime:{value:r}},vertexShader:Me,fragmentShader:Ce,clippingPlanes:i,side:T})}const C=4,Y={simple:128,professional:256},Pe={karst:"karst",fluvial:"fluvial",aeolian:"aeolian",coastal:"coastal",structural:"structural",glacial:"glacial",volcanic:"volcanic"},Be={karst:[.1,.05,.05],fluvial:[-.05,.05,-.05],aeolian:[.05,.1,-.1],coastal:[-.1,-.05,-.1],structural:[0,0,.05],glacial:[0,0,.1],volcanic:[.05,-.05,0]},_e={karst:[{text:"峰林",pos:[-.6,.5,-.5]},{text:"溶斗",pos:[.3,-.05,.3]},{text:"溶洞",pos:[.8,.1,-.3]}],fluvial:[{text:"V形谷",pos:[-.8,.1,0]},{text:"冲积扇",pos:[.6,.05,-.5]},{text:"河曲",pos:[0,.05,.7]}],aeolian:[{text:"沙丘",pos:[-.4,.15,-.2]},{text:"雅丹",pos:[.5,.1,.4]},{text:"风蚀柱",pos:[-.6,.2,.5]}],coastal:[{text:"海蚀崖",pos:[-.8,.15,0]},{text:"海滩",pos:[.2,-.02,.6]},{text:"三角洲",pos:[.7,.02,-.3]}],structural:[{text:"断层崖",pos:[-.4,.35,-.2]},{text:"褶皱山",pos:[.55,.3,.35]}],glacial:[{text:"冰斗",pos:[-.55,.28,-.45]},{text:"U形谷",pos:[.25,.08,.2]}],volcanic:[{text:"火山锥",pos:[0,.58,0]},{text:"熔岩流",pos:[.55,.08,-.35]}]};function De(v,t){const o=(e,y)=>e[0]*y[0]+e[1]*y[1],a=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],l=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],r=new Uint8Array(512);for(let e=0;e<512;e++)r[e]=l[e&255];const i=Math.floor(v)&255,f=Math.floor(t)&255,d=v-Math.floor(v),h=t-Math.floor(t),c=d*d*(3-2*d),p=h*h*(3-2*h),k=r[r[i]+f],S=r[r[i]+f+1],P=r[r[i+1]+f],B=r[r[i+1]+f+1],H=d-1,g=h-1;let x=(1-c)*(1-p)*o(a[k%8],[d,h]);return x+=(1-c)*p*o(a[S%8],[d,g]),x+=c*(1-p)*o(a[P%8],[H,h]),x+=c*p*o(a[B%8],[H,g]),x}function I(v,t,o=4){let a=0,l=.5,r=1;for(let i=0;i<o;i++)a+=l*De(v*r,t*r),l*=.5,r*=2;return a}function He(v,t,o,a,l,r){const i=a,f=I(t*3,o*2,4),d=I(t*6,o*5,3),h=I(t*12,o*10,2);switch(v){case"fluvial":return i+f*.2+d*.1-Math.abs(t-.5)*.15*(1-l);case"karst":return i+f*.25+Math.abs(d)*.15+h*.08;case"aeolian":return i+f*.15+Math.sin(t*8+o*3)*.08+d*.05;case"coastal":return i+f*.12+(t<.3?-.1:0)*(1-l)+d*.06;case"structural":return i+Math.abs(Math.sin((t+o)*5.2))*.18+(t>.52?.18:-.05)+d*.06;case"glacial":return i+f*.18-Math.exp(-((t-.52)**2)*20)*.22+Math.max(0,o-.55)*.28;case"volcanic":return i+Math.exp(-(((t-.5)**2+(o-.5)**2)*18))*.75-Math.exp(-(((t-.5)**2+(o-.5)**2)*80))*.28+d*.05;default:return i+f*.18+d*.08}}function Le(v,t){const o=(t+.3)/.9,a=Math.max(0,Math.min(1,o)),l=new fe;switch(v){case"fluvial":l.setHSL(.15+a*.15,.4,.25+a*.3);break;case"karst":l.setHSL(.12,.3,.3+a*.35);break;case"aeolian":l.setHSL(.11+a*.05,.5,.35+a*.25);break;case"coastal":l.setHSL(.13,.3,.28+a*.3);break;case"structural":l.setHSL(.08,.28,.26+a*.32);break;case"glacial":l.setHSL(.55,.26,.48+a*.28);break;case"volcanic":l.setHSL(.04,.45,.22+a*.22);break;default:l.setHSL(.12,.35,.3+a*.3)}return[l.r*255,l.g*255,l.b*255]}function G(v,t,o,a=.025,l=.85){const r=new he(t),i=new D(new ye(r,96,a,8,!1),new W({color:o,roughness:.18,metalness:.18,transparent:!0,opacity:l}));return v.add(i),i}function ze(v,t){if(t==="fluvial"){G(v,[new u(-1.7,.22,-1.1),new u(-1.05,.04,-.45),new u(-.4,-.02,.25),new u(.28,-.04,.75),new u(1.5,-.08,1.25)],2064088,.035,.78);for(let o=0;o<5;o++){const a=new D(new pe(.18+o*.025,32,Math.PI*.1,Math.PI*.55),new V({color:14070906,transparent:!0,opacity:.16,side:T}));a.rotation.x=-Math.PI/2,a.rotation.z=-.7,a.position.set(.65+o*.03,.01,-.75+o*.025),v.add(a)}}if(t==="karst")for(let o=0;o<9;o++){const a=new D(j.ring(.045,.12+o%3*.02,36),new V({color:2502698,transparent:!0,opacity:.45,side:T}));a.rotation.x=-Math.PI/2,a.position.set(-1+o%3*.75,.05,-.9+Math.floor(o/3)*.65),v.add(a)}if(t==="aeolian")for(let o=0;o<10;o++){const a=new D(new xe(.25+o%3*.04,.012,6,64,Math.PI),new V({color:15975533,transparent:!0,opacity:.5}));a.rotation.x=-Math.PI/2,a.rotation.z=.4+o%4*.08,a.position.set(-1.8+o%5*.8,.12,-.9+Math.floor(o/5)*1.1),v.add(a)}if(t==="coastal"&&G(v,[new u(-1.9,.03,-1.25),new u(-1,.08,-.55),new u(-.55,.02,.2),new u(-1.05,.04,1.25)],15258790,.04,.82),t==="structural"){G(v,[new u(-1.75,.2,-1.4),new u(-.65,.16,-.45),new u(.3,.15,.35),new u(1.65,.2,1.4)],16734781,.018,.78);for(let o=0;o<5;o++)G(v,[new u(-1.6,.14+o*.02,-1+o*.35),new u(-.3,.22,-.65+o*.35),new u(1.3,.16,-.35+o*.35)],9265216,.012,.45)}if(t==="glacial"&&G(v,[new u(-.85,.32,-1.55),new u(-.25,.12,-.8),new u(.15,.05,.05),new u(.35,-.02,1.35)],13627135,.09,.55),t==="volcanic"){const o=new D(new be(.45,.75,48,8,!0),new W({color:6109998,roughness:.72,transparent:!0,opacity:.72,side:T}));o.position.y=.42,v.add(o),G(v,[new u(.08,.78,0),new u(.42,.32,-.28),new u(.9,.08,-.65),new u(1.55,-.02,-1.05)],16734756,.035,.78)}}function O(v,t,o){const{labelSystem:a}=o,l=new ve,r=t.mode||"simple",i=t.activeModule||"fluvial",f=t.timeline||0;t.climateFactor;const d=Pe[i]||"fluvial",h=Y[r]||Y.simple,c=new de(C,C,h,h);c.rotateX(-Math.PI/2);const p=c.attributes.position,k=new Float32Array(p.count*3);let S=1/0,P=-1/0;for(let e=0;e<p.count;e++){const y=p.getX(e),n=p.getZ(e),L=(y+C/2)/C,A=(n+C/2)/C,Z=.15+Math.sin(L*3.7+A*2.1)*.15+Math.sin(L*5.2-A*4.3+1.8)*.08,z=He(d,L,A,Z,f);p.setY(e,z),z<S&&(S=z),z>P&&(P=z);const F=Le(d,z);k[e*3]=F[0]/255,k[e*3+1]=F[1]/255,k[e*3+2]=F[2]/255}p.needsUpdate=!0,c.computeVertexNormals(),c.setAttribute("color",new me(k,3));const B=Be[i]||[0,0,0],H=Se({minHeight:S,maxHeight:P,sunDirection:new u(.5,.8,.3),biomeBias:new u(B[0],B[1],B[2])}),g=new D(c,H);if(g.receiveShadow=!0,g.castShadow=!0,l.add(g),i!=="aeolian"){const e=j.plane(C*1.2,C*1.2);e.rotateX(-Math.PI/2);const y=new W({color:3832997,transparent:!0,opacity:.35,roughness:.1,metalness:.3,side:T}),n=new D(e,y);n.position.y=-.08,n.receiveShadow=!0,l.add(n)}ze(l,d),a&&r==="professional"&&(_e[i]||[]).forEach(y=>{a.addToGroup(l,y.text,new u(...y.pos),{color:"#e8d5c4",fontSize:"11px",background:"rgba(60,40,30,0.78)"})});const x={update(e,y){},dispose(){}};return l.userData={api:x},l}const U=[{id:"karst",icon:"🕳",label:"喀斯特地貌",subtitle:"岩溶地貌 · 桂林山水",description:"喀斯特地貌是可溶性岩石（以石灰岩为主）受地表水、地下水的溶蚀作用所形成的各种地貌。我国广西、贵州、云南等地最为典型。",keyPoints:["溶蚀作用：含 CO₂ 的水对石灰岩的化学溶解过程","地表形态：溶沟、洼地、峰丛、峰林、孤峰、残丘","地下形态：溶洞、石钟乳、石笋、石柱、地下河","分布：桂、黔、滇碳酸盐岩出露地区"],advancedPoints:["岩溶动力系统：CO₂-H₂O-CaCO₃ 三相平衡与溶蚀速率","岩溶地貌演化序列：溶沟→洼地→峰丛→峰林→孤峰→残丘（Davis 循环）","表层岩溶带（Epikarst）对地下水调蓄的关键作用","石漠化：植被破坏→水土流失→基岩裸露的退化过程","岩溶碳汇效应：全球碳酸盐岩风化对 CO₂ 循环的贡献"],references:["Ford, D.C. & Williams, P. (2007). Karst Hydrogeology and Geomorphology. Wiley.","Yuan, D. (1997). Sensitivity of karst process to environmental change. Episodes, 20(2), 88-92."],params:[{label:"CaCO₃ 溶解度",value:"15-50 mg/L"},{label:"溶蚀速率",value:"0.01-0.5 mm/yr"},{label:"峰林坡角",value:"45°-90°"}]},{id:"fluvial",icon:"🏞",label:"河流地貌",subtitle:"流水侵蚀与堆积",description:"河流通过侵蚀、搬运和堆积作用塑造地表形态。上游形成 V 形谷，中游发育河曲，下游形成冲积平原和三角洲。",keyPoints:["侵蚀类型：下蚀（V形谷）、侧蚀（河曲）、溯源侵蚀","堆积地貌：冲积扇、河漫滩、三角洲、冲积平原","河流发育阶段：青年期（下蚀）→ 壮年期（侧蚀）→ 老年期（堆积）","河流地貌与人类活动：农业、聚落、交通选址"],advancedPoints:["水力几何关系（Leopold & Maddock）：宽深比与流量幂律","侵蚀循环理论（Davis）：幼年→壮年→老年地形序列","河流纵剖面均衡理论（Strahler 面积-高程分析）","河型分类：顺直、曲流、辫状、网状——水沙条件控制","输沙率公式：Bagnold / Einstein 床沙质输移模型"],references:["Leopold, L.B., Wolman, M.G. & Miller, J.P. (1992). Fluvial Processes in Geomorphology. Dover.","Knighton, D. (1998). Fluvial Forms and Processes. Arnold.","Strahler, A.N. (1957). Quantitative analysis of watershed geomorphology. Eos, 38(6), 913-920."],params:[{label:"曼宁系数 n",value:"0.025-0.05"},{label:"推移质输沙率",value:"10⁻³-10⁻¹ kg/s·m"},{label:"河流坡度",value:"0.001-0.01"}]},{id:"aeolian",icon:"🏜",label:"风沙地貌",subtitle:"风力侵蚀与堆积",description:"风沙地貌是风力对地表物质的侵蚀、搬运和堆积所形成的各种地貌形态，主要分布在干旱和半干旱地区。",keyPoints:["风蚀地貌：雅丹（风蚀垄槽）、风蚀柱、风蚀蘑菇、风蚀洼地","风积地貌：沙丘（新月形沙丘、纵向沙垄、金字塔沙丘）","沙丘移动：迎风坡缓（5°-15°）、背风坡陡（30°-34°）","黄土：风力搬运堆积形成，主要分布在黄土高原"],advancedPoints:["沙粒起动阈值风速：Bagnold 公式 u*_t = A √(gd(ρs-ρ)/ρ)","沙丘形态动力学：迎风坡流速加速→侵蚀，背风坡分离→堆积","雅丹发育与风蚀速率：实测年均风蚀深度 0.1-5 cm","腾格里/巴丹吉林沙漠形成演化与第四纪气候","粉尘循环（Dust Cycle）：亚洲粉尘对全球气候的反馈效应"],references:["Bagnold, R.A. (1941). The Physics of Blown Sand and Desert Dunes. Methuen.","Pye, K. & Tsoar, H. (2009). Aeolian Sand and Sand Dunes. Springer.","张克存等 (2020). 中国沙漠风沙地貌学. 科学出版社."],params:[{label:"起动风速",value:"5-6 m/s (2m高)"},{label:"输沙率 Q",value:"Q ∝ u*³"},{label:"沙丘移动速率",value:"5-20 m/yr"}]},{id:"coastal",icon:"🌊",label:"海岸地貌",subtitle:"海浪与潮流塑造",description:"海岸地貌是在波浪、潮汐、海流等海洋动力作用下形成的各种地貌形态，包括侵蚀型和堆积型两大类。",keyPoints:["海蚀地貌：海蚀崖、海蚀平台、海蚀洞、海蚀拱桥、海蚀柱","海积地貌：海滩（砾滩/砂滩/泥滩）、沙嘴、沙坝、潟湖","三角洲：河流与海洋共同作用形成的堆积体","海岸类型：基岩海岸、砂质海岸、淤泥质海岸、生物海岸"],advancedPoints:["波浪折射与沿岸输沙：CERC 公式 Q = K H_b^(5/2) sin(2α_b)","海平面变化对海岸的影响：IPCC RCP 8.5 情景下2050年海面上升预测","三角洲形态分类：鸟足状（密西西比）、扇形（尼罗河）、尖头（长江）","海岸侵蚀与防护：硬工程（丁坝、防波堤）vs 软工程（海滩 nourish）","珊瑚礁/红树林海岸生态地貌反馈系统"],references:["Bird, E. (2008). Coastal Geomorphology: An Introduction. Wiley.","Komar, P.D. (1998). Beach Processes and Sedimentation. Prentice Hall.","王颖 (2013). 中国海洋地理. 科学出版社."],params:[{label:"波浪能通量 P",value:"P = ρgH²Cg/8"},{label:"沿岸输沙率",value:"10⁵-10⁶ m³/yr"},{label:"潮差类型",value:"0.5-8 m"}]}],Ge={class:"sandbox-root"},Ne={class:"sandbox-topbar"},Ee={class:"mode-tabs"},Te={class:"sandbox-body"},Ae={class:"module-panel"},Fe=["onClick"],Re={class:"module-icon"},Ve={class:"module-info"},Ie={class:"module-sub"},Oe={class:"viewport-toolbar"},Ue={class:"tool-item"},We={key:0,class:"tool-item"},$e={class:"info-panel"},Ke={class:"panel-title"},Qe={class:"panel-desc"},Xe={key:0,class:"knowledge-box"},Ye={key:1,class:"knowledge-box professional"},je={key:0,class:"ref-section"},Ze={key:1,class:"param-section"},qe={class:"param-label"},Je={class:"param-val"},eo={class:"glossary-term"},oo={class:"glossary-def"},to={__name:"SandboxApp",props:{embedded:{type:Boolean,default:!1}},emits:["close"],setup(v){q(x=>({v16e5bf3b:v.embedded?"calc(100vh - 160px)":"calc(100vh - 96px)"}));const t=M(null),o=M({x:0,y:0});function a(x,e){const y=e.target.getBoundingClientRect();o.value={x:Math.min(y.left,window.innerWidth-300),y:y.bottom+6},t.value=x}const l=M(null),r=M("simple"),i=M("karst"),f=M(0),d=M(.5),h=M(!0);let c=null;const p=re(()=>U.find(x=>x.id===i.value)||U[0]);function k(x){i.value=x,c&&(c.setParams({activeModule:x}),c.loadModule(O,{mode:r.value,activeModule:x,timeline:f.value,climateFactor:d.value}))}function S(){c&&c.setParams({timeline:f.value})}function P(){c&&c.setParams({climateFactor:d.value})}function B(){h.value=!h.value,c&&c.setAutoRotate(h.value)}function H(){c&&c.resetCamera("orbit")}J(r,x=>{c&&(c.setMode(x),c.loadModule(O,{mode:x,activeModule:i.value,timeline:f.value,climateFactor:d.value}))}),ee(()=>{l.value&&(c=new ce(l.value,{bg:16117736,mode:"simple",lightPreset:"studio"}),c.loadModule(O,{mode:"simple",activeModule:i.value,timeline:f.value,climateFactor:d.value}),window.addEventListener("resize",g))}),oe(()=>{window.removeEventListener("resize",g),c&&c.dispose()});function g(){c&&c.resize()}return(x,e)=>{const y=te("router-link");return m(),b("div",Ge,[s("div",Ne,[v.embedded?(m(),b("button",{key:0,class:"back-link",onClick:e[0]||(e[0]=n=>x.$emit("close"))},"← 返回课文")):(m(),$(y,{key:1,to:"/",class:"back-link"},{default:ae(()=>[...e[7]||(e[7]=[se("← 返回首页",-1)])]),_:1})),s("div",Ee,[s("button",{class:R(["mode-btn",{active:r.value==="simple"}]),onClick:e[1]||(e[1]=n=>r.value="simple")},"🔰 简单模式",2),s("button",{class:R(["mode-btn",{active:r.value==="professional"}]),onClick:e[2]||(e[2]=n=>r.value="professional")},"🎓 专业模式",2)]),e[8]||(e[8]=s("span",{class:"chapter-ref"},"第四章 · 地貌",-1))]),s("div",Te,[s("aside",Ae,[e[9]||(e[9]=s("h3",{class:"panel-title"},"地貌类型",-1)),(m(!0),b(N,null,E(K(U),n=>(m(),b("div",{key:n.id,class:R(["module-card",{active:n.id===i.value}]),onClick:L=>k(n.id)},[s("span",Re,w(n.icon),1),s("div",Ve,[s("strong",null,w(n.label),1),s("span",Ie,w(n.subtitle),1)])],10,Fe))),128))]),s("main",{class:"viewport-area",ref_key:"viewportRef",ref:l},[s("div",Oe,[s("label",Ue,[e[10]||(e[10]=s("span",{class:"tool-label"},"演变",-1)),Q(s("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":e[3]||(e[3]=n=>f.value=n),onInput:S,class:"timeline-slider"},null,544),[[X,f.value,void 0,{number:!0}]])]),r.value==="professional"?(m(),b("label",We,[e[11]||(e[11]=s("span",{class:"tool-label"},"气候",-1)),Q(s("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":e[4]||(e[4]=n=>d.value=n),onInput:P,class:"climate-slider"},null,544),[[X,d.value,void 0,{number:!0}]])])):_("",!0),s("button",{class:"tool-btn",onClick:B},w(h.value?"⏸ 暂停":"▶ 旋转"),1),s("button",{class:"tool-btn",onClick:H},"⟲ 复位")]),e[12]||(e[12]=s("div",{class:"viewport-hint"},"拖拽旋转 · 滚轮缩放 · 右键平移",-1))],512),s("aside",$e,[s("h3",Ke,w(p.value.label),1),s("p",Qe,w(p.value.description),1),r.value==="simple"?(m(),b("div",Xe,[e[13]||(e[13]=s("h4",null,"📖 教材要点",-1)),s("ul",null,[(m(!0),b(N,null,E(p.value.keyPoints,n=>(m(),b("li",{key:n},w(n),1))),128))])])):_("",!0),r.value==="professional"?(m(),b("div",Ye,[e[16]||(e[16]=s("h4",null,"📚 学术扩展",-1)),s("ul",null,[(m(!0),b(N,null,E(p.value.advancedPoints,(n,L)=>(m(),b("li",{key:L},[le(ge,{text:n,glossary:K(we),onShowTerm:a},null,8,["text","glossary"])]))),128))]),p.value.references?(m(),b("div",je,[e[14]||(e[14]=s("h4",null,"📎 参考文献",-1)),(m(!0),b(N,null,E(p.value.references,n=>(m(),b("p",{key:n,class:"ref-item"},w(n),1))),128))])):_("",!0),p.value.params?(m(),b("div",Ze,[e[15]||(e[15]=s("h4",null,"⚙ 关键参数",-1)),(m(!0),b(N,null,E(p.value.params,n=>(m(),b("div",{key:n.label,class:"param-row"},[s("span",qe,w(n.label),1),s("span",Je,w(n.value),1)]))),128))])):_("",!0)])):_("",!0)])]),(m(),$(ie,{to:"body"},[t.value?(m(),b("div",{key:0,class:"glossary-mask",onClick:e[5]||(e[5]=n=>t.value=null)})):_("",!0),t.value?(m(),b("div",{key:1,class:"glossary-popup",style:ne({top:o.value.y+"px",left:o.value.x+"px"})},[s("h4",eo,w(t.value.term),1),s("p",oo,w(t.value.explanation),1),s("button",{class:"glossary-close",onClick:e[6]||(e[6]=n=>t.value=null)},"✕")],4)):_("",!0)]))])}}},uo=ke(to,[["__scopeId","data-v-b82d9122"]]);export{uo as default};
