import{a2 as ee,w as oe,E as te,G as ae,k as se,l as m,m as p,q as l,K as X,C as le,J as ne,I,F as N,A as F,t as M,u as Y,x as Z,y as q,z as L,B as J,H as ie,a3 as re,b as D,c as ce}from"./vendor-core-B8jN9Jww.js";import{B as ue}from"./BaseScene-B-XbTdQ3.js";import{b as ve,D as R,r,G as de,g as me,h as fe,M as z,a as Q,C as pe,a8 as xe,c as U,y as be,Z as he,s as ye,t as ge}from"./vendor-three-CzQ09LF_.js";import{G as j}from"./GeometryFactory-BLJA8r7N.js";import{g as we,G as ke}from"./GlossaryText-DNf1HVzm.js";import{M as Me}from"./ModelPedagogyPanel-sH0qpF-w.js";import{_ as Ce}from"./index-BWBjHD0p.js";import"./vendor-vue-BUb728wW.js";const Se=`
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
`,Pe=`
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
`;function Be({minHeight:n,maxHeight:a,weatherFactor:e=0,sunDirection:o=new r(.5,.8,.3),biomeBias:t=new r(0,0,0),time:d=0,clippingPlanes:c=[]}={}){return new ve({uniforms:{uMinHeight:{value:n??0},uMaxHeight:{value:a??1},uWeatherFactor:{value:e},uSunDirection:{value:o},uBiomeBias:{value:t},uTime:{value:d}},vertexShader:Se,fragmentShader:Pe,clippingPlanes:c,side:R})}const _=4,De={karst:"karst",fluvial:"fluvial",aeolian:"aeolian",coastal:"coastal",structural:"structural",glacial:"glacial",volcanic:"volcanic"},_e={karst:[.1,.05,.05],fluvial:[-.05,.05,-.05],aeolian:[.05,.1,-.1],coastal:[-.1,-.05,-.1],structural:[0,0,.05],glacial:[0,0,.1],volcanic:[.05,-.05,0]},He={karst:[{text:"峰林",pos:[-.6,.5,-.5]},{text:"溶斗",pos:[.3,-.05,.3]},{text:"溶洞",pos:[.8,.1,-.3]}],fluvial:[{text:"V形谷",pos:[-.8,.1,0]},{text:"冲积扇",pos:[.6,.05,-.5]},{text:"河曲",pos:[0,.05,.7]}],aeolian:[{text:"沙丘",pos:[-.4,.15,-.2]},{text:"雅丹",pos:[.5,.1,.4]},{text:"风蚀柱",pos:[-.6,.2,.5]}],coastal:[{text:"海蚀崖",pos:[-.8,.15,0]},{text:"海滩",pos:[.2,-.02,.6]},{text:"三角洲",pos:[.7,.02,-.3]}],structural:[{text:"断层崖",pos:[-.4,.35,-.2]},{text:"褶皱山",pos:[.55,.3,.35]}],glacial:[{text:"冰斗",pos:[-.55,.28,-.45]},{text:"U形谷",pos:[.25,.08,.2]}],volcanic:[{text:"火山锥",pos:[0,.58,0]},{text:"熔岩流",pos:[.55,.08,-.35]}]},H=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],Le=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],P=new Uint8Array(512);for(let n=0;n<512;n++)P[n]=Le[n&255];function ze(n,a){const e=Math.floor(n)&255,o=Math.floor(a)&255,t=n-Math.floor(n),d=a-Math.floor(a),c=t*t*(3-2*t),x=d*d*(3-2*d),v=P[P[e]+o],w=P[P[e]+o+1],y=P[P[e+1]+o],b=P[P[e+1]+o+1],k=t-1,u=d-1;let h=(1-c)*(1-x)*(H[v%8][0]*t+H[v%8][1]*d);return h+=(1-c)*x*(H[w%8][0]*t+H[w%8][1]*u),h+=c*(1-x)*(H[y%8][0]*k+H[y%8][1]*d),h+=c*x*(H[b%8][0]*k+H[b%8][1]*u),h}function W(n,a,e=4){let o=0,t=.5,d=1;for(let c=0;c<e;c++)o+=t*ze(n*d,a*d),t*=.5,d*=2;return o}function Ae(n,a,e,o,t,d){const c=o,x=W(a*3,e*2,4),v=W(a*6,e*5,3),w=W(a*12,e*10,2);switch(n){case"fluvial":return c+x*.2+v*.1-Math.abs(a-.5)*.15*(1-t);case"karst":return c+x*.25+Math.abs(v)*.15+w*.08;case"aeolian":return c+x*.15+Math.sin(a*8+e*3)*.08+v*.05;case"coastal":return c+x*.12+(a<.3?-.1:0)*(1-t)+v*.06;case"structural":return c+Math.abs(Math.sin((a+e)*5.2))*.18+(a>.52?.18:-.05)+v*.06;case"glacial":return c+x*.18-Math.exp(-((a-.52)**2)*20)*.22+Math.max(0,e-.55)*.28;case"volcanic":return c+Math.exp(-(((a-.5)**2+(e-.5)**2)*18))*.75-Math.exp(-(((a-.5)**2+(e-.5)**2)*80))*.28+v*.05;default:return c+x*.18+v*.08}}function Ee(n,a){const e=(a+.3)/.9,o=Math.max(0,Math.min(1,e)),t=new pe;switch(n){case"fluvial":t.setHSL(.15+o*.15,.4,.25+o*.3);break;case"karst":t.setHSL(.12,.3,.3+o*.35);break;case"aeolian":t.setHSL(.11+o*.05,.5,.35+o*.25);break;case"coastal":t.setHSL(.13,.3,.28+o*.3);break;case"structural":t.setHSL(.08,.28,.26+o*.32);break;case"glacial":t.setHSL(.55,.26,.48+o*.28);break;case"volcanic":t.setHSL(.04,.45,.22+o*.22);break;default:t.setHSL(.12,.35,.3+o*.3)}return[t.r*255,t.g*255,t.b*255]}function A(n,a,e,o=.025,t=.85){const d=new ye(a),c=new z(new ge(d,96,o,8,!1),new Q({color:e,roughness:.18,metalness:.18,transparent:!0,opacity:t}));return n.add(c),c}function Ge(n,a){if(a==="fluvial"){A(n,[new r(-1.7,.22,-1.1),new r(-1.05,.04,-.45),new r(-.4,-.02,.25),new r(.28,-.04,.75),new r(1.5,-.08,1.25)],2064088,.035,.78);for(let e=0;e<5;e++){const o=new z(new xe(.18+e*.025,32,Math.PI*.1,Math.PI*.55),new U({color:14070906,transparent:!0,opacity:.16,side:R}));o.rotation.x=-Math.PI/2,o.rotation.z=-.7,o.position.set(.65+e*.03,.01,-.75+e*.025),n.add(o)}}if(a==="karst")for(let e=0;e<9;e++){const o=new z(j.ring(.045,.12+e%3*.02,36),new U({color:2502698,transparent:!0,opacity:.45,side:R}));o.rotation.x=-Math.PI/2,o.position.set(-1+e%3*.75,.05,-.9+Math.floor(e/3)*.65),n.add(o)}if(a==="aeolian")for(let e=0;e<10;e++){const o=new z(new be(.25+e%3*.04,.012,6,64,Math.PI),new U({color:15975533,transparent:!0,opacity:.5}));o.rotation.x=-Math.PI/2,o.rotation.z=.4+e%4*.08,o.position.set(-1.8+e%5*.8,.12,-.9+Math.floor(e/5)*1.1),n.add(o)}if(a==="coastal"&&A(n,[new r(-1.9,.03,-1.25),new r(-1,.08,-.55),new r(-.55,.02,.2),new r(-1.05,.04,1.25)],15258790,.04,.82),a==="structural"){A(n,[new r(-1.75,.2,-1.4),new r(-.65,.16,-.45),new r(.3,.15,.35),new r(1.65,.2,1.4)],16734781,.018,.78);for(let e=0;e<5;e++)A(n,[new r(-1.6,.14+e*.02,-1+e*.35),new r(-.3,.22,-.65+e*.35),new r(1.3,.16,-.35+e*.35)],9265216,.012,.45)}if(a==="glacial"&&A(n,[new r(-.85,.32,-1.55),new r(-.25,.12,-.8),new r(.15,.05,.05),new r(.35,-.02,1.35)],13627135,.09,.55),a==="volcanic"){const e=new z(new he(.45,.75,48,8,!0),new Q({color:6109998,roughness:.72,transparent:!0,opacity:.72,side:R}));e.position.y=.42,n.add(e),A(n,[new r(.08,.78,0),new r(.42,.32,-.28),new r(.9,.08,-.65),new r(1.55,-.02,-1.05)],16734756,.035,.78)}}function $(n,a,e){const{labelSystem:o}=e,t=new de,d=a.mode||"simple",c=a.activeModule||"fluvial",x=a.timeline||0;a.climateFactor;const v=De[c]||"fluvial",w=a.quality?.terrain?.[d]||(d==="professional"?256:128),y=new me(_,_,w,w);y.rotateX(-Math.PI/2);const b=y.attributes.position,k=new Float32Array(b.count*3);let u=1/0,h=-1/0;for(let g=0;g<b.count;g++){const C=b.getX(g),f=b.getZ(g),s=(C+_/2)/_,B=(f+_/2)/_,i=.15+Math.sin(s*3.7+B*2.1)*.15+Math.sin(s*5.2-B*4.3+1.8)*.08,S=Ae(v,s,B,i,x);b.setY(g,S),S<u&&(u=S),S>h&&(h=S);const V=Ee(v,S);k[g*3]=V[0]/255,k[g*3+1]=V[1]/255,k[g*3+2]=V[2]/255}b.needsUpdate=!0,y.computeVertexNormals(),y.setAttribute("color",new fe(k,3));const E=_e[c]||[0,0,0],T=Be({minHeight:u,maxHeight:h,sunDirection:new r(.5,.8,.3),biomeBias:new r(E[0],E[1],E[2])}),G=new z(y,T);if(G.receiveShadow=!0,G.castShadow=!0,t.add(G),c!=="aeolian"){const g=j.plane(_*1.2,_*1.2);g.rotateX(-Math.PI/2);const C=new Q({color:3832997,transparent:!0,opacity:.35,roughness:.1,metalness:.3,side:R}),f=new z(g,C);f.position.y=-.08,f.receiveShadow=!0,t.add(f)}Ge(t,v),o&&d==="professional"&&(He[c]||[]).forEach(C=>{o.addToGroup(t,C.text,new r(...C.pos),{color:"#e8d5c4",fontSize:"11px",background:"rgba(60,40,30,0.78)"})});const O={update(g,C){},dispose(){}};return t.userData={api:O},t}const K=[{id:"karst",icon:"🕳",label:"喀斯特地貌",subtitle:"岩溶地貌 · 桂林山水",description:"喀斯特地貌是可溶性岩石（以石灰岩为主）受地表水、地下水的溶蚀作用所形成的各种地貌。我国广西、贵州、云南等地最为典型。",keyPoints:["溶蚀作用：含 CO₂ 的水对石灰岩的化学溶解过程","地表形态：溶沟、洼地、峰丛、峰林、孤峰、残丘","地下形态：溶洞、石钟乳、石笋、石柱、地下河","分布：桂、黔、滇碳酸盐岩出露地区"],advancedPoints:["岩溶动力系统：CO₂-H₂O-CaCO₃ 三相平衡与溶蚀速率","岩溶地貌演化序列：溶沟→洼地→峰丛→峰林→孤峰→残丘（Davis 循环）","表层岩溶带（Epikarst）对地下水调蓄的关键作用","石漠化：植被破坏→水土流失→基岩裸露的退化过程","岩溶碳汇效应：全球碳酸盐岩风化对 CO₂ 循环的贡献"],references:["Ford, D.C. & Williams, P. (2007). Karst Hydrogeology and Geomorphology. Wiley.","Yuan, D. (1997). Sensitivity of karst process to environmental change. Episodes, 20(2), 88-92."],params:[{label:"CaCO₃ 溶解度",value:"15-50 mg/L"},{label:"溶蚀速率",value:"0.01-0.5 mm/yr"},{label:"峰林坡角",value:"45°-90°"}]},{id:"fluvial",icon:"🏞",label:"河流地貌",subtitle:"流水侵蚀与堆积",description:"河流通过侵蚀、搬运和堆积作用塑造地表形态。上游形成 V 形谷，中游发育河曲，下游形成冲积平原和三角洲。",keyPoints:["侵蚀类型：下蚀（V形谷）、侧蚀（河曲）、溯源侵蚀","堆积地貌：冲积扇、河漫滩、三角洲、冲积平原","河流发育阶段：青年期（下蚀）→ 壮年期（侧蚀）→ 老年期（堆积）","河流地貌与人类活动：农业、聚落、交通选址"],advancedPoints:["水力几何关系（Leopold & Maddock）：宽深比与流量幂律","侵蚀循环理论（Davis）：幼年→壮年→老年地形序列","河流纵剖面均衡理论（Strahler 面积-高程分析）","河型分类：顺直、曲流、辫状、网状——水沙条件控制","输沙率公式：Bagnold / Einstein 床沙质输移模型"],references:["Leopold, L.B., Wolman, M.G. & Miller, J.P. (1992). Fluvial Processes in Geomorphology. Dover.","Knighton, D. (1998). Fluvial Forms and Processes. Arnold.","Strahler, A.N. (1957). Quantitative analysis of watershed geomorphology. Eos, 38(6), 913-920."],params:[{label:"曼宁系数 n",value:"0.025-0.05"},{label:"推移质输沙率",value:"10⁻³-10⁻¹ kg/s·m"},{label:"河流坡度",value:"0.001-0.01"}]},{id:"aeolian",icon:"🏜",label:"风沙地貌",subtitle:"风力侵蚀与堆积",description:"风沙地貌是风力对地表物质的侵蚀、搬运和堆积所形成的各种地貌形态，主要分布在干旱和半干旱地区。",keyPoints:["风蚀地貌：雅丹（风蚀垄槽）、风蚀柱、风蚀蘑菇、风蚀洼地","风积地貌：沙丘（新月形沙丘、纵向沙垄、金字塔沙丘）","沙丘移动：迎风坡缓（5°-15°）、背风坡陡（30°-34°）","黄土：风力搬运堆积形成，主要分布在黄土高原"],advancedPoints:["沙粒起动阈值风速：Bagnold 公式 u*_t = A √(gd(ρs-ρ)/ρ)","沙丘形态动力学：迎风坡流速加速→侵蚀，背风坡分离→堆积","雅丹发育与风蚀速率：实测年均风蚀深度 0.1-5 cm","腾格里/巴丹吉林沙漠形成演化与第四纪气候","粉尘循环（Dust Cycle）：亚洲粉尘对全球气候的反馈效应"],references:["Bagnold, R.A. (1941). The Physics of Blown Sand and Desert Dunes. Methuen.","Pye, K. & Tsoar, H. (2009). Aeolian Sand and Sand Dunes. Springer.","张克存等 (2020). 中国沙漠风沙地貌学. 科学出版社."],params:[{label:"起动风速",value:"5-6 m/s (2m高)"},{label:"输沙率 Q",value:"Q ∝ u*³"},{label:"沙丘移动速率",value:"5-20 m/yr"}]},{id:"coastal",icon:"🌊",label:"海岸地貌",subtitle:"海浪与潮流塑造",description:"海岸地貌是在波浪、潮汐、海流等海洋动力作用下形成的各种地貌形态，包括侵蚀型和堆积型两大类。",keyPoints:["海蚀地貌：海蚀崖、海蚀平台、海蚀洞、海蚀拱桥、海蚀柱","海积地貌：海滩（砾滩/砂滩/泥滩）、沙嘴、沙坝、潟湖","三角洲：河流与海洋共同作用形成的堆积体","海岸类型：基岩海岸、砂质海岸、淤泥质海岸、生物海岸"],advancedPoints:["波浪折射与沿岸输沙：CERC 公式 Q = K H_b^(5/2) sin(2α_b)","海平面变化对海岸的影响：IPCC RCP 8.5 情景下2050年海面上升预测","三角洲形态分类：鸟足状（密西西比）、扇形（尼罗河）、尖头（长江）","海岸侵蚀与防护：硬工程（丁坝、防波堤）vs 软工程（海滩 nourish）","珊瑚礁/红树林海岸生态地貌反馈系统"],references:["Bird, E. (2008). Coastal Geomorphology: An Introduction. Wiley.","Komar, P.D. (1998). Beach Processes and Sedimentation. Prentice Hall.","王颖 (2013). 中国海洋地理. 科学出版社."],params:[{label:"波浪能通量 P",value:"P = ρgH²Cg/8"},{label:"沿岸输沙率",value:"10⁵-10⁶ m³/yr"},{label:"潮差类型",value:"0.5-8 m"}]}],Ne={class:"sandbox-root"},Fe={class:"sandbox-topbar"},Re={class:"mode-tabs"},Te={class:"sandbox-body"},Oe={class:"module-panel"},Ve=["onClick"],Ie={class:"module-icon"},Ue={class:"module-info"},We={class:"module-sub"},$e={class:"viewport-toolbar"},Ke={class:"tool-item"},Qe={key:0,class:"tool-item"},Xe={class:"info-panel"},Ye={class:"panel-title"},Ze={class:"panel-desc"},qe={key:0,class:"knowledge-box"},Je={key:1,class:"knowledge-box professional"},je={key:0,class:"ref-section"},eo={key:1,class:"param-section"},oo={class:"param-label"},to={class:"param-val"},ao={class:"glossary-term"},so={class:"glossary-def"},lo={__name:"SandboxApp",props:{embedded:{type:Boolean,default:!1},caseStudy:{type:String,default:""}},emits:["close"],setup(n){ee(f=>({v60334ad7:n.embedded?"calc(100vh - 160px)":"calc(100vh - 96px)"}));const a={observe:["不同营力塑造的独特形态：河流上游 V 形峡谷与下游冲积平原、喀斯特溶蚀洼地与地下钟乳溶洞、风沙新月形沙丘迎风坡缓背风坡陡。","侵蚀阶段与堆积阶段的空间分异：高山源头以剥蚀下切为主，平原与河口以泥沙堆积为主。","地表流水与地下暗河水力联系（喀斯特盲谷与伏流出露地表）。"],change:["切换地貌类型（喀斯特、河流、风沙、海岸、冰川等）。","拖动“演变”时间轴，观察地表起伏从幼年期、壮年期到老年准平原化的漫长侵蚀过程。","专业模式下调节“气候”因子，改变降水水动力与风沙干旱度。"],mechanism:["内外力共同作用：内力作用（板块构造、岩浆活动）使地表变得高低不平奠定宏观地势骨架；外力作用（流水、风力、波浪、冰川）进行风化剥蚀与堆积削高填低。","化学溶蚀与沉淀平衡：可溶性碳酸盐岩与含 CO2 水反应（CaCO3 + H2O + CO2 ⇌ Ca(HCO3)2），正向反应形成溶洞，逆向析出形成石笋钟乳石。","风沙动力学：风速减缓或遇阻挡物，挟沙气流发生减速沉降，形成新月形背风涡流。"],limitations:["时间轴为定性教学加速演示，未对应绝对地质年限。","地貌三维网格采用了典型代表性景观拓扑，自然界真实地貌受断裂与复杂岩性多重叠加。"]};function e(){y.value=0,b.value=.5,T()}const o=n,t=D(null),d=D({x:0,y:0});function c(f,s){const B=s.target.getBoundingClientRect();d.value={x:Math.min(B.left,window.innerWidth-300),y:B.bottom+6},t.value=f}const x=D(null),v=D("simple"),w=D("karst"),y=D(0),b=D(.5),k=D(!0);let u=null;const h=ce(()=>K.find(f=>f.id===w.value)||K[0]);function E(f){w.value=f,u&&(u.setParams({activeModule:f}),u.loadModule($,{mode:v.value,activeModule:f,timeline:y.value,climateFactor:b.value,caseStudy:o.caseStudy}))}function T(){u&&u.setParams({timeline:y.value})}function G(){u&&u.setParams({climateFactor:b.value})}function O(){k.value=!k.value,u&&u.setAutoRotate(k.value)}function g(){u&&u.resetCamera("orbit")}oe(v,f=>{u&&(u.setMode(f),u.loadModule($,{mode:f,activeModule:w.value,timeline:y.value,climateFactor:b.value}))}),te(()=>{x.value&&(u=new ue(x.value,{bg:16117736,mode:"simple",lightPreset:"studio"}),u.loadModule($,{mode:"simple",activeModule:w.value,timeline:y.value,climateFactor:b.value}),window.addEventListener("resize",C))}),ae(()=>{window.removeEventListener("resize",C),u&&u.dispose()});function C(){u&&u.resize()}return(f,s)=>{const B=se("router-link");return m(),p("div",Ne,[l("div",Fe,[n.embedded?(m(),p("button",{key:0,class:"back-link",onClick:s[0]||(s[0]=i=>f.$emit("close"))},"← 返回课文")):(m(),X(B,{key:1,to:"/",class:"back-link"},{default:le(()=>[...s[7]||(s[7]=[ne("← 返回首页",-1)])]),_:1})),l("div",Re,[l("button",{class:I(["mode-btn",{active:v.value==="simple"}]),onClick:s[1]||(s[1]=i=>v.value="simple")},"🔰 简单模式",2),l("button",{class:I(["mode-btn",{active:v.value==="professional"}]),onClick:s[2]||(s[2]=i=>v.value="professional")},"🎓 专业模式",2)]),s[8]||(s[8]=l("span",{class:"chapter-ref"},"第四章 · 地貌",-1))]),l("div",Te,[l("aside",Oe,[s[9]||(s[9]=l("h3",{class:"panel-title"},"地貌类型",-1)),(m(!0),p(N,null,F(Y(K),i=>(m(),p("div",{key:i.id,class:I(["module-card",{active:i.id===w.value}]),onClick:S=>E(i.id)},[l("span",Ie,M(i.icon),1),l("div",Ue,[l("strong",null,M(i.label),1),l("span",We,M(i.subtitle),1)])],10,Ve))),128))]),l("main",{class:"viewport-area",ref_key:"viewportRef",ref:x},[l("div",$e,[l("label",Ke,[s[10]||(s[10]=l("span",{class:"tool-label"},"演变",-1)),Z(l("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":s[3]||(s[3]=i=>y.value=i),onInput:T,class:"timeline-slider"},null,544),[[q,y.value,void 0,{number:!0}]])]),v.value==="professional"?(m(),p("label",Qe,[s[11]||(s[11]=l("span",{class:"tool-label"},"气候",-1)),Z(l("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":s[4]||(s[4]=i=>b.value=i),onInput:G,class:"climate-slider"},null,544),[[q,b.value,void 0,{number:!0}]])])):L("",!0),l("button",{class:"tool-btn",onClick:O},M(k.value?"⏸ 暂停":"▶ 旋转"),1),l("button",{class:"tool-btn",onClick:g},"⟲ 复位")]),s[12]||(s[12]=l("div",{class:"viewport-hint"},"拖拽旋转 · 滚轮缩放 · 右键平移",-1))],512),l("aside",Xe,[l("h3",Ye,M(h.value.label),1),l("p",Ze,M(h.value.description),1),v.value==="simple"?(m(),p("div",qe,[s[13]||(s[13]=l("h4",null,"📖 教材要点",-1)),l("ul",null,[(m(!0),p(N,null,F(h.value.keyPoints,i=>(m(),p("li",{key:i},M(i),1))),128))])])):L("",!0),v.value==="professional"?(m(),p("div",Je,[s[16]||(s[16]=l("h4",null,"📚 学术扩展",-1)),l("ul",null,[(m(!0),p(N,null,F(h.value.advancedPoints,(i,S)=>(m(),p("li",{key:S},[J(ke,{text:i,glossary:Y(we),onShowTerm:c},null,8,["text","glossary"])]))),128))]),h.value.references?(m(),p("div",je,[s[14]||(s[14]=l("h4",null,"📎 参考文献",-1)),(m(!0),p(N,null,F(h.value.references,i=>(m(),p("p",{key:i,class:"ref-item"},M(i),1))),128))])):L("",!0),h.value.params?(m(),p("div",eo,[s[15]||(s[15]=l("h4",null,"⚙ 关键参数",-1)),(m(!0),p(N,null,F(h.value.params,i=>(m(),p("div",{key:i.label,class:"param-row"},[l("span",oo,M(i.label),1),l("span",to,M(i.value),1)]))),128))])):L("",!0)])):L("",!0)])]),J(Me,{theme:"geology",observe:a.observe,change:a.change,mechanism:a.mechanism,limitations:a.limitations,"real-data-lab":{title:"Copernicus 喜马拉雅冰川与河流峡谷真实高程",path:"/geo-labs/terrain",desc:"真实高程DEM分析极高山与流水侵蚀"},"textbook-link":{grade:"高中",book:"必修第一册",chapter:"第四章",section:"第一节"},"practice-link":"/practice",onReset:e},null,8,["observe","change","mechanism","limitations"]),(m(),X(re,{to:"body"},[t.value?(m(),p("div",{key:0,class:"glossary-mask",onClick:s[5]||(s[5]=i=>t.value=null)})):L("",!0),t.value?(m(),p("div",{key:1,class:"glossary-popup",style:ie({top:d.value.y+"px",left:d.value.x+"px"})},[l("h4",ao,M(t.value.term),1),l("p",so,M(t.value.explanation),1),l("button",{class:"glossary-close",onClick:s[6]||(s[6]=i=>t.value=null)},"✕")],4)):L("",!0)]))])}}},po=Ce(lo,[["__scopeId","data-v-05225ce6"]]);export{po as default};
