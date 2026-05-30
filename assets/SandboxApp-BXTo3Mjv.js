import{K as q,w as J,t as ee,B as oe,e as te,o as f,f as x,g as l,y as $,k as ae,l as se,m as R,F as E,x as T,v as w,u as K,C as Q,H as X,z as _,j as le,G as ne,T as ie,b as S,c as re}from"./vendor-core-RwNFDsEE.js";import{B as ce}from"./BaseScene-BtIN8OTl.js";import{v as ue,D as A,V as v,G as ve,k as de,c as me,M as H,b as W,q as fe,u as pe,a as V,w as xe,h as be,C as ye,T as he}from"./vendor-three-BAkXX_-i.js";import{G as j}from"./GeometryFactory-B9tfB8dV.js";import{g as we,G as ge}from"./GlossaryText-CZZMSEFQ.js";import{_ as ke}from"./index-Bgf_1N-0.js";import"./vendor-vue-YArMdy4I.js";const Me=`
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
`,Se=`
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
`;function Ce({minHeight:u,maxHeight:a,weatherFactor:e=0,sunDirection:t=new v(.5,.8,.3),biomeBias:i=new v(0,0,0),time:d=0,clippingPlanes:s=[]}={}){return new ue({uniforms:{uMinHeight:{value:u??0},uMaxHeight:{value:a??1},uWeatherFactor:{value:e},uSunDirection:{value:t},uBiomeBias:{value:i},uTime:{value:d}},vertexShader:Me,fragmentShader:Se,clippingPlanes:s,side:A})}const C=4,Y={simple:128,professional:256},Pe={karst:"karst",fluvial:"fluvial",aeolian:"aeolian",coastal:"coastal",structural:"structural",glacial:"glacial",volcanic:"volcanic"},Be={karst:[.1,.05,.05],fluvial:[-.05,.05,-.05],aeolian:[.05,.1,-.1],coastal:[-.1,-.05,-.1],structural:[0,0,.05],glacial:[0,0,.1],volcanic:[.05,-.05,0]},De={karst:[{text:"峰林",pos:[-.6,.5,-.5]},{text:"溶斗",pos:[.3,-.05,.3]},{text:"溶洞",pos:[.8,.1,-.3]}],fluvial:[{text:"V形谷",pos:[-.8,.1,0]},{text:"冲积扇",pos:[.6,.05,-.5]},{text:"河曲",pos:[0,.05,.7]}],aeolian:[{text:"沙丘",pos:[-.4,.15,-.2]},{text:"雅丹",pos:[.5,.1,.4]},{text:"风蚀柱",pos:[-.6,.2,.5]}],coastal:[{text:"海蚀崖",pos:[-.8,.15,0]},{text:"海滩",pos:[.2,-.02,.6]},{text:"三角洲",pos:[.7,.02,-.3]}],structural:[{text:"断层崖",pos:[-.4,.35,-.2]},{text:"褶皱山",pos:[.55,.3,.35]}],glacial:[{text:"冰斗",pos:[-.55,.28,-.45]},{text:"U形谷",pos:[.25,.08,.2]}],volcanic:[{text:"火山锥",pos:[0,.58,0]},{text:"熔岩流",pos:[.55,.08,-.35]}]};function _e(u,a){const e=(n,o)=>n[0]*o[0]+n[1]*o[1],t=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],i=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],d=new Uint8Array(512);for(let n=0;n<512;n++)d[n]=i[n&255];const s=Math.floor(u)&255,p=Math.floor(a)&255,m=u-Math.floor(u),b=a-Math.floor(a),y=m*m*(3-2*m),r=b*b*(3-2*b),h=d[d[s]+p],P=d[d[s]+p+1],B=d[d[s+1]+p],D=d[d[s+1]+p+1],L=m-1,M=b-1;let k=(1-y)*(1-r)*e(t[h%8],[m,b]);return k+=(1-y)*r*e(t[P%8],[m,M]),k+=y*(1-r)*e(t[B%8],[L,b]),k+=y*r*e(t[D%8],[L,M]),k}function I(u,a,e=4){let t=0,i=.5,d=1;for(let s=0;s<e;s++)t+=i*_e(u*d,a*d),i*=.5,d*=2;return t}function He(u,a,e,t,i,d){const s=t,p=I(a*3,e*2,4),m=I(a*6,e*5,3),b=I(a*12,e*10,2);switch(u){case"fluvial":return s+p*.2+m*.1-Math.abs(a-.5)*.15*(1-i);case"karst":return s+p*.25+Math.abs(m)*.15+b*.08;case"aeolian":return s+p*.15+Math.sin(a*8+e*3)*.08+m*.05;case"coastal":return s+p*.12+(a<.3?-.1:0)*(1-i)+m*.06;case"structural":return s+Math.abs(Math.sin((a+e)*5.2))*.18+(a>.52?.18:-.05)+m*.06;case"glacial":return s+p*.18-Math.exp(-((a-.52)**2)*20)*.22+Math.max(0,e-.55)*.28;case"volcanic":return s+Math.exp(-(((a-.5)**2+(e-.5)**2)*18))*.75-Math.exp(-(((a-.5)**2+(e-.5)**2)*80))*.28+m*.05;default:return s+p*.18+m*.08}}function Le(u,a){const e=(a+.3)/.9,t=Math.max(0,Math.min(1,e)),i=new fe;switch(u){case"fluvial":i.setHSL(.15+t*.15,.4,.25+t*.3);break;case"karst":i.setHSL(.12,.3,.3+t*.35);break;case"aeolian":i.setHSL(.11+t*.05,.5,.35+t*.25);break;case"coastal":i.setHSL(.13,.3,.28+t*.3);break;case"structural":i.setHSL(.08,.28,.26+t*.32);break;case"glacial":i.setHSL(.55,.26,.48+t*.28);break;case"volcanic":i.setHSL(.04,.45,.22+t*.22);break;default:i.setHSL(.12,.35,.3+t*.3)}return[i.r*255,i.g*255,i.b*255]}function N(u,a,e,t=.025,i=.85){const d=new ye(a),s=new H(new he(d,96,t,8,!1),new W({color:e,roughness:.18,metalness:.18,transparent:!0,opacity:i}));return u.add(s),s}function ze(u,a){if(a==="fluvial"){N(u,[new v(-1.7,.22,-1.1),new v(-1.05,.04,-.45),new v(-.4,-.02,.25),new v(.28,-.04,.75),new v(1.5,-.08,1.25)],2064088,.035,.78);for(let e=0;e<5;e++){const t=new H(new pe(.18+e*.025,32,Math.PI*.1,Math.PI*.55),new V({color:14070906,transparent:!0,opacity:.16,side:A}));t.rotation.x=-Math.PI/2,t.rotation.z=-.7,t.position.set(.65+e*.03,.01,-.75+e*.025),u.add(t)}}if(a==="karst")for(let e=0;e<9;e++){const t=new H(j.ring(.045,.12+e%3*.02,36),new V({color:2502698,transparent:!0,opacity:.45,side:A}));t.rotation.x=-Math.PI/2,t.position.set(-1+e%3*.75,.05,-.9+Math.floor(e/3)*.65),u.add(t)}if(a==="aeolian")for(let e=0;e<10;e++){const t=new H(new xe(.25+e%3*.04,.012,6,64,Math.PI),new V({color:15975533,transparent:!0,opacity:.5}));t.rotation.x=-Math.PI/2,t.rotation.z=.4+e%4*.08,t.position.set(-1.8+e%5*.8,.12,-.9+Math.floor(e/5)*1.1),u.add(t)}if(a==="coastal"&&N(u,[new v(-1.9,.03,-1.25),new v(-1,.08,-.55),new v(-.55,.02,.2),new v(-1.05,.04,1.25)],15258790,.04,.82),a==="structural"){N(u,[new v(-1.75,.2,-1.4),new v(-.65,.16,-.45),new v(.3,.15,.35),new v(1.65,.2,1.4)],16734781,.018,.78);for(let e=0;e<5;e++)N(u,[new v(-1.6,.14+e*.02,-1+e*.35),new v(-.3,.22,-.65+e*.35),new v(1.3,.16,-.35+e*.35)],9265216,.012,.45)}if(a==="glacial"&&N(u,[new v(-.85,.32,-1.55),new v(-.25,.12,-.8),new v(.15,.05,.05),new v(.35,-.02,1.35)],13627135,.09,.55),a==="volcanic"){const e=new H(new be(.45,.75,48,8,!0),new W({color:6109998,roughness:.72,transparent:!0,opacity:.72,side:A}));e.position.y=.42,u.add(e),N(u,[new v(.08,.78,0),new v(.42,.32,-.28),new v(.9,.08,-.65),new v(1.55,-.02,-1.05)],16734756,.035,.78)}}function O(u,a,e){const{labelSystem:t}=e,i=new ve,d=a.mode||"simple",s=a.activeModule||"fluvial",p=a.timeline||0;a.climateFactor;const m=Pe[s]||"fluvial",b=Y[d]||Y.simple,y=new de(C,C,b,b);y.rotateX(-Math.PI/2);const r=y.attributes.position,h=new Float32Array(r.count*3);let P=1/0,B=-1/0;for(let n=0;n<r.count;n++){const o=r.getX(n),g=r.getZ(n),c=(o+C/2)/C,z=(g+C/2)/C,Z=.15+Math.sin(c*3.7+z*2.1)*.15+Math.sin(c*5.2-z*4.3+1.8)*.08,G=He(m,c,z,Z,p);r.setY(n,G),G<P&&(P=G),G>B&&(B=G);const F=Le(m,G);h[n*3]=F[0]/255,h[n*3+1]=F[1]/255,h[n*3+2]=F[2]/255}r.needsUpdate=!0,y.computeVertexNormals(),y.setAttribute("color",new me(h,3));const D=Be[s]||[0,0,0],L=Ce({minHeight:P,maxHeight:B,sunDirection:new v(.5,.8,.3),biomeBias:new v(D[0],D[1],D[2])}),M=new H(y,L);if(M.receiveShadow=!0,M.castShadow=!0,i.add(M),s!=="aeolian"){const n=j.plane(C*1.2,C*1.2);n.rotateX(-Math.PI/2);const o=new W({color:3832997,transparent:!0,opacity:.35,roughness:.1,metalness:.3,side:A}),g=new H(n,o);g.position.y=-.08,g.receiveShadow=!0,i.add(g)}ze(i,m),t&&d==="professional"&&(De[s]||[]).forEach(o=>{t.addToGroup(i,o.text,new v(...o.pos),{color:"#e8d5c4",fontSize:"11px",background:"rgba(60,40,30,0.78)"})});const k={update(n,o){},dispose(){}};return i.userData={api:k},i}const U=[{id:"karst",icon:"🕳",label:"喀斯特地貌",subtitle:"岩溶地貌 · 桂林山水",description:"喀斯特地貌是可溶性岩石（以石灰岩为主）受地表水、地下水的溶蚀作用所形成的各种地貌。我国广西、贵州、云南等地最为典型。",keyPoints:["溶蚀作用：含 CO₂ 的水对石灰岩的化学溶解过程","地表形态：溶沟、洼地、峰丛、峰林、孤峰、残丘","地下形态：溶洞、石钟乳、石笋、石柱、地下河","分布：桂、黔、滇碳酸盐岩出露地区"],advancedPoints:["岩溶动力系统：CO₂-H₂O-CaCO₃ 三相平衡与溶蚀速率","岩溶地貌演化序列：溶沟→洼地→峰丛→峰林→孤峰→残丘（Davis 循环）","表层岩溶带（Epikarst）对地下水调蓄的关键作用","石漠化：植被破坏→水土流失→基岩裸露的退化过程","岩溶碳汇效应：全球碳酸盐岩风化对 CO₂ 循环的贡献"],references:["Ford, D.C. & Williams, P. (2007). Karst Hydrogeology and Geomorphology. Wiley.","Yuan, D. (1997). Sensitivity of karst process to environmental change. Episodes, 20(2), 88-92."],params:[{label:"CaCO₃ 溶解度",value:"15-50 mg/L"},{label:"溶蚀速率",value:"0.01-0.5 mm/yr"},{label:"峰林坡角",value:"45°-90°"}]},{id:"fluvial",icon:"🏞",label:"河流地貌",subtitle:"流水侵蚀与堆积",description:"河流通过侵蚀、搬运和堆积作用塑造地表形态。上游形成 V 形谷，中游发育河曲，下游形成冲积平原和三角洲。",keyPoints:["侵蚀类型：下蚀（V形谷）、侧蚀（河曲）、溯源侵蚀","堆积地貌：冲积扇、河漫滩、三角洲、冲积平原","河流发育阶段：青年期（下蚀）→ 壮年期（侧蚀）→ 老年期（堆积）","河流地貌与人类活动：农业、聚落、交通选址"],advancedPoints:["水力几何关系（Leopold & Maddock）：宽深比与流量幂律","侵蚀循环理论（Davis）：幼年→壮年→老年地形序列","河流纵剖面均衡理论（Strahler 面积-高程分析）","河型分类：顺直、曲流、辫状、网状——水沙条件控制","输沙率公式：Bagnold / Einstein 床沙质输移模型"],references:["Leopold, L.B., Wolman, M.G. & Miller, J.P. (1992). Fluvial Processes in Geomorphology. Dover.","Knighton, D. (1998). Fluvial Forms and Processes. Arnold.","Strahler, A.N. (1957). Quantitative analysis of watershed geomorphology. Eos, 38(6), 913-920."],params:[{label:"曼宁系数 n",value:"0.025-0.05"},{label:"推移质输沙率",value:"10⁻³-10⁻¹ kg/s·m"},{label:"河流坡度",value:"0.001-0.01"}]},{id:"aeolian",icon:"🏜",label:"风沙地貌",subtitle:"风力侵蚀与堆积",description:"风沙地貌是风力对地表物质的侵蚀、搬运和堆积所形成的各种地貌形态，主要分布在干旱和半干旱地区。",keyPoints:["风蚀地貌：雅丹（风蚀垄槽）、风蚀柱、风蚀蘑菇、风蚀洼地","风积地貌：沙丘（新月形沙丘、纵向沙垄、金字塔沙丘）","沙丘移动：迎风坡缓（5°-15°）、背风坡陡（30°-34°）","黄土：风力搬运堆积形成，主要分布在黄土高原"],advancedPoints:["沙粒起动阈值风速：Bagnold 公式 u*_t = A √(gd(ρs-ρ)/ρ)","沙丘形态动力学：迎风坡流速加速→侵蚀，背风坡分离→堆积","雅丹发育与风蚀速率：实测年均风蚀深度 0.1-5 cm","腾格里/巴丹吉林沙漠形成演化与第四纪气候","粉尘循环（Dust Cycle）：亚洲粉尘对全球气候的反馈效应"],references:["Bagnold, R.A. (1941). The Physics of Blown Sand and Desert Dunes. Methuen.","Pye, K. & Tsoar, H. (2009). Aeolian Sand and Sand Dunes. Springer.","张克存等 (2020). 中国沙漠风沙地貌学. 科学出版社."],params:[{label:"起动风速",value:"5-6 m/s (2m高)"},{label:"输沙率 Q",value:"Q ∝ u*³"},{label:"沙丘移动速率",value:"5-20 m/yr"}]},{id:"coastal",icon:"🌊",label:"海岸地貌",subtitle:"海浪与潮流塑造",description:"海岸地貌是在波浪、潮汐、海流等海洋动力作用下形成的各种地貌形态，包括侵蚀型和堆积型两大类。",keyPoints:["海蚀地貌：海蚀崖、海蚀平台、海蚀洞、海蚀拱桥、海蚀柱","海积地貌：海滩（砾滩/砂滩/泥滩）、沙嘴、沙坝、潟湖","三角洲：河流与海洋共同作用形成的堆积体","海岸类型：基岩海岸、砂质海岸、淤泥质海岸、生物海岸"],advancedPoints:["波浪折射与沿岸输沙：CERC 公式 Q = K H_b^(5/2) sin(2α_b)","海平面变化对海岸的影响：IPCC RCP 8.5 情景下2050年海面上升预测","三角洲形态分类：鸟足状（密西西比）、扇形（尼罗河）、尖头（长江）","海岸侵蚀与防护：硬工程（丁坝、防波堤）vs 软工程（海滩 nourish）","珊瑚礁/红树林海岸生态地貌反馈系统"],references:["Bird, E. (2008). Coastal Geomorphology: An Introduction. Wiley.","Komar, P.D. (1998). Beach Processes and Sedimentation. Prentice Hall.","王颖 (2013). 中国海洋地理. 科学出版社."],params:[{label:"波浪能通量 P",value:"P = ρgH²Cg/8"},{label:"沿岸输沙率",value:"10⁵-10⁶ m³/yr"},{label:"潮差类型",value:"0.5-8 m"}]}],Ge={class:"sandbox-root"},Ne={class:"sandbox-topbar"},Ee={class:"mode-tabs"},Te={class:"sandbox-body"},Ae={class:"module-panel"},Fe=["onClick"],Re={class:"module-icon"},Ve={class:"module-info"},Ie={class:"module-sub"},Oe={class:"viewport-toolbar"},Ue={class:"tool-item"},We={key:0,class:"tool-item"},$e={class:"info-panel"},Ke={class:"panel-title"},Qe={class:"panel-desc"},Xe={key:0,class:"knowledge-box"},Ye={key:1,class:"knowledge-box professional"},je={key:0,class:"ref-section"},Ze={key:1,class:"param-section"},qe={class:"param-label"},Je={class:"param-val"},eo={class:"glossary-term"},oo={class:"glossary-def"},to={__name:"SandboxApp",props:{embedded:{type:Boolean,default:!1},caseStudy:{type:String,default:""}},emits:["close"],setup(u){q(n=>({v4e32e101:u.embedded?"calc(100vh - 160px)":"calc(100vh - 96px)"}));const a=u,e=S(null),t=S({x:0,y:0});function i(n,o){const g=o.target.getBoundingClientRect();t.value={x:Math.min(g.left,window.innerWidth-300),y:g.bottom+6},e.value=n}const d=S(null),s=S("simple"),p=S("karst"),m=S(0),b=S(.5),y=S(!0);let r=null;const h=re(()=>U.find(n=>n.id===p.value)||U[0]);function P(n){p.value=n,r&&(r.setParams({activeModule:n}),r.loadModule(O,{mode:s.value,activeModule:n,timeline:m.value,climateFactor:b.value,caseStudy:a.caseStudy}))}function B(){r&&r.setParams({timeline:m.value})}function D(){r&&r.setParams({climateFactor:b.value})}function L(){y.value=!y.value,r&&r.setAutoRotate(y.value)}function M(){r&&r.resetCamera("orbit")}J(s,n=>{r&&(r.setMode(n),r.loadModule(O,{mode:n,activeModule:p.value,timeline:m.value,climateFactor:b.value}))}),ee(()=>{d.value&&(r=new ce(d.value,{bg:16117736,mode:"simple",lightPreset:"studio"}),r.loadModule(O,{mode:"simple",activeModule:p.value,timeline:m.value,climateFactor:b.value}),window.addEventListener("resize",k))}),oe(()=>{window.removeEventListener("resize",k),r&&r.dispose()});function k(){r&&r.resize()}return(n,o)=>{const g=te("router-link");return f(),x("div",Ge,[l("div",Ne,[u.embedded?(f(),x("button",{key:0,class:"back-link",onClick:o[0]||(o[0]=c=>n.$emit("close"))},"← 返回课文")):(f(),$(g,{key:1,to:"/",class:"back-link"},{default:ae(()=>[...o[7]||(o[7]=[se("← 返回首页",-1)])]),_:1})),l("div",Ee,[l("button",{class:R(["mode-btn",{active:s.value==="simple"}]),onClick:o[1]||(o[1]=c=>s.value="simple")},"🔰 简单模式",2),l("button",{class:R(["mode-btn",{active:s.value==="professional"}]),onClick:o[2]||(o[2]=c=>s.value="professional")},"🎓 专业模式",2)]),o[8]||(o[8]=l("span",{class:"chapter-ref"},"第四章 · 地貌",-1))]),l("div",Te,[l("aside",Ae,[o[9]||(o[9]=l("h3",{class:"panel-title"},"地貌类型",-1)),(f(!0),x(E,null,T(K(U),c=>(f(),x("div",{key:c.id,class:R(["module-card",{active:c.id===p.value}]),onClick:z=>P(c.id)},[l("span",Re,w(c.icon),1),l("div",Ve,[l("strong",null,w(c.label),1),l("span",Ie,w(c.subtitle),1)])],10,Fe))),128))]),l("main",{class:"viewport-area",ref_key:"viewportRef",ref:d},[l("div",Oe,[l("label",Ue,[o[10]||(o[10]=l("span",{class:"tool-label"},"演变",-1)),Q(l("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":o[3]||(o[3]=c=>m.value=c),onInput:B,class:"timeline-slider"},null,544),[[X,m.value,void 0,{number:!0}]])]),s.value==="professional"?(f(),x("label",We,[o[11]||(o[11]=l("span",{class:"tool-label"},"气候",-1)),Q(l("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":o[4]||(o[4]=c=>b.value=c),onInput:D,class:"climate-slider"},null,544),[[X,b.value,void 0,{number:!0}]])])):_("",!0),l("button",{class:"tool-btn",onClick:L},w(y.value?"⏸ 暂停":"▶ 旋转"),1),l("button",{class:"tool-btn",onClick:M},"⟲ 复位")]),o[12]||(o[12]=l("div",{class:"viewport-hint"},"拖拽旋转 · 滚轮缩放 · 右键平移",-1))],512),l("aside",$e,[l("h3",Ke,w(h.value.label),1),l("p",Qe,w(h.value.description),1),s.value==="simple"?(f(),x("div",Xe,[o[13]||(o[13]=l("h4",null,"📖 教材要点",-1)),l("ul",null,[(f(!0),x(E,null,T(h.value.keyPoints,c=>(f(),x("li",{key:c},w(c),1))),128))])])):_("",!0),s.value==="professional"?(f(),x("div",Ye,[o[16]||(o[16]=l("h4",null,"📚 学术扩展",-1)),l("ul",null,[(f(!0),x(E,null,T(h.value.advancedPoints,(c,z)=>(f(),x("li",{key:z},[le(ge,{text:c,glossary:K(we),onShowTerm:i},null,8,["text","glossary"])]))),128))]),h.value.references?(f(),x("div",je,[o[14]||(o[14]=l("h4",null,"📎 参考文献",-1)),(f(!0),x(E,null,T(h.value.references,c=>(f(),x("p",{key:c,class:"ref-item"},w(c),1))),128))])):_("",!0),h.value.params?(f(),x("div",Ze,[o[15]||(o[15]=l("h4",null,"⚙ 关键参数",-1)),(f(!0),x(E,null,T(h.value.params,c=>(f(),x("div",{key:c.label,class:"param-row"},[l("span",qe,w(c.label),1),l("span",Je,w(c.value),1)]))),128))])):_("",!0)])):_("",!0)])]),(f(),$(ie,{to:"body"},[e.value?(f(),x("div",{key:0,class:"glossary-mask",onClick:o[5]||(o[5]=c=>e.value=null)})):_("",!0),e.value?(f(),x("div",{key:1,class:"glossary-popup",style:ne({top:t.value.y+"px",left:t.value.x+"px"})},[l("h4",eo,w(e.value.term),1),l("p",oo,w(e.value.explanation),1),l("button",{class:"glossary-close",onClick:o[6]||(o[6]=c=>e.value=null)},"✕")],4)):_("",!0)]))])}}},uo=ke(to,[["__scopeId","data-v-843c489c"]]);export{uo as default};
