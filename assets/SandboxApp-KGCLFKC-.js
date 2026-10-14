import{Q as Z,w as ee,z as oe,A as te,f as ae,o as f,g as x,j as n,D as Q,y as se,G as le,B as I,F as N,q as E,t as w,u as j,l as X,v as Y,m as D,x as ne,I as ie,R as re,b as S,c as ce}from"./vendor-core-DMNBQZwd.js";import{B as ue}from"./BaseScene-BVoaC2a0.js";import{ae as ve,b as F,V as u,G as de,a as me,d as fe,c as _,M as K,C as pe,v as xe,l as O,T as be,j as ye,J as he,K as we}from"./vendor-three-D8cVP0AO.js";import{G as q}from"./GeometryFactory-BkTNfNAM.js";import{g as ge,G as Me}from"./GlossaryText-BE9UZHK9.js";import{_ as ke}from"./index-Bg8ttP7M.js";import"./vendor-vue-CRkWXMvx.js";const Ce=`
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
`;function Pe({minHeight:i,maxHeight:a,weatherFactor:e=0,sunDirection:o=new u(.5,.8,.3),biomeBias:s=new u(0,0,0),time:d=0,clippingPlanes:l=[]}={}){return new ve({uniforms:{uMinHeight:{value:i??0},uMaxHeight:{value:a??1},uWeatherFactor:{value:e},uSunDirection:{value:o},uBiomeBias:{value:s},uTime:{value:d}},vertexShader:Ce,fragmentShader:Se,clippingPlanes:l,side:F})}const P=4,Be={karst:"karst",fluvial:"fluvial",aeolian:"aeolian",coastal:"coastal",structural:"structural",glacial:"glacial",volcanic:"volcanic"},De={karst:[.1,.05,.05],fluvial:[-.05,.05,-.05],aeolian:[.05,.1,-.1],coastal:[-.1,-.05,-.1],structural:[0,0,.05],glacial:[0,0,.1],volcanic:[.05,-.05,0]},_e={karst:[{text:"峰林",pos:[-.6,.5,-.5]},{text:"溶斗",pos:[.3,-.05,.3]},{text:"溶洞",pos:[.8,.1,-.3]}],fluvial:[{text:"V形谷",pos:[-.8,.1,0]},{text:"冲积扇",pos:[.6,.05,-.5]},{text:"河曲",pos:[0,.05,.7]}],aeolian:[{text:"沙丘",pos:[-.4,.15,-.2]},{text:"雅丹",pos:[.5,.1,.4]},{text:"风蚀柱",pos:[-.6,.2,.5]}],coastal:[{text:"海蚀崖",pos:[-.8,.15,0]},{text:"海滩",pos:[.2,-.02,.6]},{text:"三角洲",pos:[.7,.02,-.3]}],structural:[{text:"断层崖",pos:[-.4,.35,-.2]},{text:"褶皱山",pos:[.55,.3,.35]}],glacial:[{text:"冰斗",pos:[-.55,.28,-.45]},{text:"U形谷",pos:[.25,.08,.2]}],volcanic:[{text:"火山锥",pos:[0,.58,0]},{text:"熔岩流",pos:[.55,.08,-.35]}]},B=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],He=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],k=new Uint8Array(512);for(let i=0;i<512;i++)k[i]=He[i&255];function Le(i,a){const e=Math.floor(i)&255,o=Math.floor(a)&255,s=i-Math.floor(i),d=a-Math.floor(a),l=s*s*(3-2*s),p=d*d*(3-2*d),m=k[k[e]+o],y=k[k[e]+o+1],h=k[k[e+1]+o],c=k[k[e+1]+o+1],b=s-1,C=d-1;let g=(1-l)*(1-p)*(B[m%8][0]*s+B[m%8][1]*d);return g+=(1-l)*p*(B[y%8][0]*s+B[y%8][1]*C),g+=l*(1-p)*(B[h%8][0]*b+B[h%8][1]*d),g+=l*p*(B[c%8][0]*b+B[c%8][1]*C),g}function U(i,a,e=4){let o=0,s=.5,d=1;for(let l=0;l<e;l++)o+=s*Le(i*d,a*d),s*=.5,d*=2;return o}function ze(i,a,e,o,s,d){const l=o,p=U(a*3,e*2,4),m=U(a*6,e*5,3),y=U(a*12,e*10,2);switch(i){case"fluvial":return l+p*.2+m*.1-Math.abs(a-.5)*.15*(1-s);case"karst":return l+p*.25+Math.abs(m)*.15+y*.08;case"aeolian":return l+p*.15+Math.sin(a*8+e*3)*.08+m*.05;case"coastal":return l+p*.12+(a<.3?-.1:0)*(1-s)+m*.06;case"structural":return l+Math.abs(Math.sin((a+e)*5.2))*.18+(a>.52?.18:-.05)+m*.06;case"glacial":return l+p*.18-Math.exp(-((a-.52)**2)*20)*.22+Math.max(0,e-.55)*.28;case"volcanic":return l+Math.exp(-(((a-.5)**2+(e-.5)**2)*18))*.75-Math.exp(-(((a-.5)**2+(e-.5)**2)*80))*.28+m*.05;default:return l+p*.18+m*.08}}function Ae(i,a){const e=(a+.3)/.9,o=Math.max(0,Math.min(1,e)),s=new pe;switch(i){case"fluvial":s.setHSL(.15+o*.15,.4,.25+o*.3);break;case"karst":s.setHSL(.12,.3,.3+o*.35);break;case"aeolian":s.setHSL(.11+o*.05,.5,.35+o*.25);break;case"coastal":s.setHSL(.13,.3,.28+o*.3);break;case"structural":s.setHSL(.08,.28,.26+o*.32);break;case"glacial":s.setHSL(.55,.26,.48+o*.28);break;case"volcanic":s.setHSL(.04,.45,.22+o*.22);break;default:s.setHSL(.12,.35,.3+o*.3)}return[s.r*255,s.g*255,s.b*255]}function z(i,a,e,o=.025,s=.85){const d=new he(a),l=new _(new we(d,96,o,8,!1),new K({color:e,roughness:.18,metalness:.18,transparent:!0,opacity:s}));return i.add(l),l}function Ge(i,a){if(a==="fluvial"){z(i,[new u(-1.7,.22,-1.1),new u(-1.05,.04,-.45),new u(-.4,-.02,.25),new u(.28,-.04,.75),new u(1.5,-.08,1.25)],2064088,.035,.78);for(let e=0;e<5;e++){const o=new _(new xe(.18+e*.025,32,Math.PI*.1,Math.PI*.55),new O({color:14070906,transparent:!0,opacity:.16,side:F}));o.rotation.x=-Math.PI/2,o.rotation.z=-.7,o.position.set(.65+e*.03,.01,-.75+e*.025),i.add(o)}}if(a==="karst")for(let e=0;e<9;e++){const o=new _(q.ring(.045,.12+e%3*.02,36),new O({color:2502698,transparent:!0,opacity:.45,side:F}));o.rotation.x=-Math.PI/2,o.position.set(-1+e%3*.75,.05,-.9+Math.floor(e/3)*.65),i.add(o)}if(a==="aeolian")for(let e=0;e<10;e++){const o=new _(new be(.25+e%3*.04,.012,6,64,Math.PI),new O({color:15975533,transparent:!0,opacity:.5}));o.rotation.x=-Math.PI/2,o.rotation.z=.4+e%4*.08,o.position.set(-1.8+e%5*.8,.12,-.9+Math.floor(e/5)*1.1),i.add(o)}if(a==="coastal"&&z(i,[new u(-1.9,.03,-1.25),new u(-1,.08,-.55),new u(-.55,.02,.2),new u(-1.05,.04,1.25)],15258790,.04,.82),a==="structural"){z(i,[new u(-1.75,.2,-1.4),new u(-.65,.16,-.45),new u(.3,.15,.35),new u(1.65,.2,1.4)],16734781,.018,.78);for(let e=0;e<5;e++)z(i,[new u(-1.6,.14+e*.02,-1+e*.35),new u(-.3,.22,-.65+e*.35),new u(1.3,.16,-.35+e*.35)],9265216,.012,.45)}if(a==="glacial"&&z(i,[new u(-.85,.32,-1.55),new u(-.25,.12,-.8),new u(.15,.05,.05),new u(.35,-.02,1.35)],13627135,.09,.55),a==="volcanic"){const e=new _(new ye(.45,.75,48,8,!0),new K({color:6109998,roughness:.72,transparent:!0,opacity:.72,side:F}));e.position.y=.42,i.add(e),z(i,[new u(.08,.78,0),new u(.42,.32,-.28),new u(.9,.08,-.65),new u(1.55,-.02,-1.05)],16734756,.035,.78)}}function W(i,a,e){const{labelSystem:o}=e,s=new de,d=a.mode||"simple",l=a.activeModule||"fluvial",p=a.timeline||0;a.climateFactor;const m=Be[l]||"fluvial",y=a.quality?.terrain?.[d]||(d==="professional"?256:128),h=new me(P,P,y,y);h.rotateX(-Math.PI/2);const c=h.attributes.position,b=new Float32Array(c.count*3);let C=1/0,g=-1/0;for(let v=0;v<c.count;v++){const t=c.getX(v),M=c.getZ(v),r=(t+P/2)/P,H=(M+P/2)/P,J=.15+Math.sin(r*3.7+H*2.1)*.15+Math.sin(r*5.2-H*4.3+1.8)*.08,L=ze(m,r,H,J,p);c.setY(v,L),L<C&&(C=L),L>g&&(g=L);const V=Ae(m,L);b[v*3]=V[0]/255,b[v*3+1]=V[1]/255,b[v*3+2]=V[2]/255}c.needsUpdate=!0,h.computeVertexNormals(),h.setAttribute("color",new fe(b,3));const A=De[l]||[0,0,0],T=Pe({minHeight:C,maxHeight:g,sunDirection:new u(.5,.8,.3),biomeBias:new u(A[0],A[1],A[2])}),G=new _(h,T);if(G.receiveShadow=!0,G.castShadow=!0,s.add(G),l!=="aeolian"){const v=q.plane(P*1.2,P*1.2);v.rotateX(-Math.PI/2);const t=new K({color:3832997,transparent:!0,opacity:.35,roughness:.1,metalness:.3,side:F}),M=new _(v,t);M.position.y=-.08,M.receiveShadow=!0,s.add(M)}Ge(s,m),o&&d==="professional"&&(_e[l]||[]).forEach(t=>{o.addToGroup(s,t.text,new u(...t.pos),{color:"#e8d5c4",fontSize:"11px",background:"rgba(60,40,30,0.78)"})});const R={update(v,t){},dispose(){}};return s.userData={api:R},s}const $=[{id:"karst",icon:"🕳",label:"喀斯特地貌",subtitle:"岩溶地貌 · 桂林山水",description:"喀斯特地貌是可溶性岩石（以石灰岩为主）受地表水、地下水的溶蚀作用所形成的各种地貌。我国广西、贵州、云南等地最为典型。",keyPoints:["溶蚀作用：含 CO₂ 的水对石灰岩的化学溶解过程","地表形态：溶沟、洼地、峰丛、峰林、孤峰、残丘","地下形态：溶洞、石钟乳、石笋、石柱、地下河","分布：桂、黔、滇碳酸盐岩出露地区"],advancedPoints:["岩溶动力系统：CO₂-H₂O-CaCO₃ 三相平衡与溶蚀速率","岩溶地貌演化序列：溶沟→洼地→峰丛→峰林→孤峰→残丘（Davis 循环）","表层岩溶带（Epikarst）对地下水调蓄的关键作用","石漠化：植被破坏→水土流失→基岩裸露的退化过程","岩溶碳汇效应：全球碳酸盐岩风化对 CO₂ 循环的贡献"],references:["Ford, D.C. & Williams, P. (2007). Karst Hydrogeology and Geomorphology. Wiley.","Yuan, D. (1997). Sensitivity of karst process to environmental change. Episodes, 20(2), 88-92."],params:[{label:"CaCO₃ 溶解度",value:"15-50 mg/L"},{label:"溶蚀速率",value:"0.01-0.5 mm/yr"},{label:"峰林坡角",value:"45°-90°"}]},{id:"fluvial",icon:"🏞",label:"河流地貌",subtitle:"流水侵蚀与堆积",description:"河流通过侵蚀、搬运和堆积作用塑造地表形态。上游形成 V 形谷，中游发育河曲，下游形成冲积平原和三角洲。",keyPoints:["侵蚀类型：下蚀（V形谷）、侧蚀（河曲）、溯源侵蚀","堆积地貌：冲积扇、河漫滩、三角洲、冲积平原","河流发育阶段：青年期（下蚀）→ 壮年期（侧蚀）→ 老年期（堆积）","河流地貌与人类活动：农业、聚落、交通选址"],advancedPoints:["水力几何关系（Leopold & Maddock）：宽深比与流量幂律","侵蚀循环理论（Davis）：幼年→壮年→老年地形序列","河流纵剖面均衡理论（Strahler 面积-高程分析）","河型分类：顺直、曲流、辫状、网状——水沙条件控制","输沙率公式：Bagnold / Einstein 床沙质输移模型"],references:["Leopold, L.B., Wolman, M.G. & Miller, J.P. (1992). Fluvial Processes in Geomorphology. Dover.","Knighton, D. (1998). Fluvial Forms and Processes. Arnold.","Strahler, A.N. (1957). Quantitative analysis of watershed geomorphology. Eos, 38(6), 913-920."],params:[{label:"曼宁系数 n",value:"0.025-0.05"},{label:"推移质输沙率",value:"10⁻³-10⁻¹ kg/s·m"},{label:"河流坡度",value:"0.001-0.01"}]},{id:"aeolian",icon:"🏜",label:"风沙地貌",subtitle:"风力侵蚀与堆积",description:"风沙地貌是风力对地表物质的侵蚀、搬运和堆积所形成的各种地貌形态，主要分布在干旱和半干旱地区。",keyPoints:["风蚀地貌：雅丹（风蚀垄槽）、风蚀柱、风蚀蘑菇、风蚀洼地","风积地貌：沙丘（新月形沙丘、纵向沙垄、金字塔沙丘）","沙丘移动：迎风坡缓（5°-15°）、背风坡陡（30°-34°）","黄土：风力搬运堆积形成，主要分布在黄土高原"],advancedPoints:["沙粒起动阈值风速：Bagnold 公式 u*_t = A √(gd(ρs-ρ)/ρ)","沙丘形态动力学：迎风坡流速加速→侵蚀，背风坡分离→堆积","雅丹发育与风蚀速率：实测年均风蚀深度 0.1-5 cm","腾格里/巴丹吉林沙漠形成演化与第四纪气候","粉尘循环（Dust Cycle）：亚洲粉尘对全球气候的反馈效应"],references:["Bagnold, R.A. (1941). The Physics of Blown Sand and Desert Dunes. Methuen.","Pye, K. & Tsoar, H. (2009). Aeolian Sand and Sand Dunes. Springer.","张克存等 (2020). 中国沙漠风沙地貌学. 科学出版社."],params:[{label:"起动风速",value:"5-6 m/s (2m高)"},{label:"输沙率 Q",value:"Q ∝ u*³"},{label:"沙丘移动速率",value:"5-20 m/yr"}]},{id:"coastal",icon:"🌊",label:"海岸地貌",subtitle:"海浪与潮流塑造",description:"海岸地貌是在波浪、潮汐、海流等海洋动力作用下形成的各种地貌形态，包括侵蚀型和堆积型两大类。",keyPoints:["海蚀地貌：海蚀崖、海蚀平台、海蚀洞、海蚀拱桥、海蚀柱","海积地貌：海滩（砾滩/砂滩/泥滩）、沙嘴、沙坝、潟湖","三角洲：河流与海洋共同作用形成的堆积体","海岸类型：基岩海岸、砂质海岸、淤泥质海岸、生物海岸"],advancedPoints:["波浪折射与沿岸输沙：CERC 公式 Q = K H_b^(5/2) sin(2α_b)","海平面变化对海岸的影响：IPCC RCP 8.5 情景下2050年海面上升预测","三角洲形态分类：鸟足状（密西西比）、扇形（尼罗河）、尖头（长江）","海岸侵蚀与防护：硬工程（丁坝、防波堤）vs 软工程（海滩 nourish）","珊瑚礁/红树林海岸生态地貌反馈系统"],references:["Bird, E. (2008). Coastal Geomorphology: An Introduction. Wiley.","Komar, P.D. (1998). Beach Processes and Sedimentation. Prentice Hall.","王颖 (2013). 中国海洋地理. 科学出版社."],params:[{label:"波浪能通量 P",value:"P = ρgH²Cg/8"},{label:"沿岸输沙率",value:"10⁵-10⁶ m³/yr"},{label:"潮差类型",value:"0.5-8 m"}]}],Ne={class:"sandbox-root"},Ee={class:"sandbox-topbar"},Fe={class:"mode-tabs"},Re={class:"sandbox-body"},Te={class:"module-panel"},Ve=["onClick"],Ie={class:"module-icon"},Oe={class:"module-info"},Ue={class:"module-sub"},We={class:"viewport-toolbar"},$e={class:"tool-item"},Ke={key:0,class:"tool-item"},Qe={class:"info-panel"},je={class:"panel-title"},Xe={class:"panel-desc"},Ye={key:0,class:"knowledge-box"},qe={key:1,class:"knowledge-box professional"},Je={key:0,class:"ref-section"},Ze={key:1,class:"param-section"},eo={class:"param-label"},oo={class:"param-val"},to={class:"glossary-term"},ao={class:"glossary-def"},so={__name:"SandboxApp",props:{embedded:{type:Boolean,default:!1},caseStudy:{type:String,default:""}},emits:["close"],setup(i){Z(v=>({df1c8f7c:i.embedded?"calc(100vh - 160px)":"calc(100vh - 96px)"}));const a=i,e=S(null),o=S({x:0,y:0});function s(v,t){const M=t.target.getBoundingClientRect();o.value={x:Math.min(M.left,window.innerWidth-300),y:M.bottom+6},e.value=v}const d=S(null),l=S("simple"),p=S("karst"),m=S(0),y=S(.5),h=S(!0);let c=null;const b=ce(()=>$.find(v=>v.id===p.value)||$[0]);function C(v){p.value=v,c&&(c.setParams({activeModule:v}),c.loadModule(W,{mode:l.value,activeModule:v,timeline:m.value,climateFactor:y.value,caseStudy:a.caseStudy}))}function g(){c&&c.setParams({timeline:m.value})}function A(){c&&c.setParams({climateFactor:y.value})}function T(){h.value=!h.value,c&&c.setAutoRotate(h.value)}function G(){c&&c.resetCamera("orbit")}ee(l,v=>{c&&(c.setMode(v),c.loadModule(W,{mode:v,activeModule:p.value,timeline:m.value,climateFactor:y.value}))}),oe(()=>{d.value&&(c=new ue(d.value,{bg:16117736,mode:"simple",lightPreset:"studio"}),c.loadModule(W,{mode:"simple",activeModule:p.value,timeline:m.value,climateFactor:y.value}),window.addEventListener("resize",R))}),te(()=>{window.removeEventListener("resize",R),c&&c.dispose()});function R(){c&&c.resize()}return(v,t)=>{const M=ae("router-link");return f(),x("div",Ne,[n("div",Ee,[i.embedded?(f(),x("button",{key:0,class:"back-link",onClick:t[0]||(t[0]=r=>v.$emit("close"))},"← 返回课文")):(f(),Q(M,{key:1,to:"/",class:"back-link"},{default:se(()=>[...t[7]||(t[7]=[le("← 返回首页",-1)])]),_:1})),n("div",Fe,[n("button",{class:I(["mode-btn",{active:l.value==="simple"}]),onClick:t[1]||(t[1]=r=>l.value="simple")},"🔰 简单模式",2),n("button",{class:I(["mode-btn",{active:l.value==="professional"}]),onClick:t[2]||(t[2]=r=>l.value="professional")},"🎓 专业模式",2)]),t[8]||(t[8]=n("span",{class:"chapter-ref"},"第四章 · 地貌",-1))]),n("div",Re,[n("aside",Te,[t[9]||(t[9]=n("h3",{class:"panel-title"},"地貌类型",-1)),(f(!0),x(N,null,E(j($),r=>(f(),x("div",{key:r.id,class:I(["module-card",{active:r.id===p.value}]),onClick:H=>C(r.id)},[n("span",Ie,w(r.icon),1),n("div",Oe,[n("strong",null,w(r.label),1),n("span",Ue,w(r.subtitle),1)])],10,Ve))),128))]),n("main",{class:"viewport-area",ref_key:"viewportRef",ref:d},[n("div",We,[n("label",$e,[t[10]||(t[10]=n("span",{class:"tool-label"},"演变",-1)),X(n("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":t[3]||(t[3]=r=>m.value=r),onInput:g,class:"timeline-slider"},null,544),[[Y,m.value,void 0,{number:!0}]])]),l.value==="professional"?(f(),x("label",Ke,[t[11]||(t[11]=n("span",{class:"tool-label"},"气候",-1)),X(n("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":t[4]||(t[4]=r=>y.value=r),onInput:A,class:"climate-slider"},null,544),[[Y,y.value,void 0,{number:!0}]])])):D("",!0),n("button",{class:"tool-btn",onClick:T},w(h.value?"⏸ 暂停":"▶ 旋转"),1),n("button",{class:"tool-btn",onClick:G},"⟲ 复位")]),t[12]||(t[12]=n("div",{class:"viewport-hint"},"拖拽旋转 · 滚轮缩放 · 右键平移",-1))],512),n("aside",Qe,[n("h3",je,w(b.value.label),1),n("p",Xe,w(b.value.description),1),l.value==="simple"?(f(),x("div",Ye,[t[13]||(t[13]=n("h4",null,"📖 教材要点",-1)),n("ul",null,[(f(!0),x(N,null,E(b.value.keyPoints,r=>(f(),x("li",{key:r},w(r),1))),128))])])):D("",!0),l.value==="professional"?(f(),x("div",qe,[t[16]||(t[16]=n("h4",null,"📚 学术扩展",-1)),n("ul",null,[(f(!0),x(N,null,E(b.value.advancedPoints,(r,H)=>(f(),x("li",{key:H},[ne(Me,{text:r,glossary:j(ge),onShowTerm:s},null,8,["text","glossary"])]))),128))]),b.value.references?(f(),x("div",Je,[t[14]||(t[14]=n("h4",null,"📎 参考文献",-1)),(f(!0),x(N,null,E(b.value.references,r=>(f(),x("p",{key:r,class:"ref-item"},w(r),1))),128))])):D("",!0),b.value.params?(f(),x("div",Ze,[t[15]||(t[15]=n("h4",null,"⚙ 关键参数",-1)),(f(!0),x(N,null,E(b.value.params,r=>(f(),x("div",{key:r.label,class:"param-row"},[n("span",eo,w(r.label),1),n("span",oo,w(r.value),1)]))),128))])):D("",!0)])):D("",!0)])]),(f(),Q(re,{to:"body"},[e.value?(f(),x("div",{key:0,class:"glossary-mask",onClick:t[5]||(t[5]=r=>e.value=null)})):D("",!0),e.value?(f(),x("div",{key:1,class:"glossary-popup",style:ie({top:o.value.y+"px",left:o.value.x+"px"})},[n("h4",to,w(e.value.term),1),n("p",ao,w(e.value.explanation),1),n("button",{class:"glossary-close",onClick:t[6]||(t[6]=r=>e.value=null)},"✕")],4)):D("",!0)]))])}}},mo=ke(so,[["__scopeId","data-v-dab0cd9f"]]);export{mo as default};
