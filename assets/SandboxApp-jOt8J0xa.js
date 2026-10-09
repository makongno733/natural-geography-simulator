import{Q as re,w as ce,G as ue,P as ve,e as me,o as p,f as w,g as i,C as Z,x as de,y as fe,A as $,F as U,m as A,t as M,u as j,k as J,v as ee,l as T,q as pe,L as xe,R as we,b as B,c as he}from"./vendor-core-f5efnVF7.js";import{B as be}from"./BaseScene-DreEH0Uk.js";import{ab as te,D as R,V as u,k as F,G as ye,P as ge,x as ke,b as z,m as Me,e as K,T as Ce,C as Se,M as ae,H as Pe,I as Be}from"./vendor-three-B_AOvBIi.js";import{G as se}from"./GeometryFactory-DZElnqTa.js";import{g as He,G as De}from"./GlossaryText-C6rzBBD7.js";import{_ as Te}from"./index-DzfqHUh7.js";import"./QualityProfile-_nA0umaT.js";import"./vendor-vue-C_sPxk6f.js";const ze=`
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
`,_e=`
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
`;function We({minHeight:n,maxHeight:s,weatherFactor:e=0,sunDirection:o=new u(.5,.8,.3),biomeBias:r=new u(0,0,0),time:c=0,clippingPlanes:l=[]}={}){return new te({uniforms:{uMinHeight:{value:n??0},uMaxHeight:{value:s??1},uWeatherFactor:{value:e},uSunDirection:{value:o},uBiomeBias:{value:r},uTime:{value:c}},vertexShader:ze,fragmentShader:_e,clippingPlanes:l,side:R})}const Ne=`
uniform float uTime;
uniform float uWaveHeight;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying float vWave;

void main() {
  vec3 pos = position;

  // Multi-octave wave displacement
  float w1 = sin(pos.x * 2.8 + pos.z * 1.9 + uTime * 0.6) * uWaveHeight;
  float w2 = sin(pos.x * 4.2 - pos.z * 3.6 + uTime * 0.9) * uWaveHeight * 0.6;
  float w3 = sin(pos.x * 6.1 + pos.z * 5.3 + uTime * 1.3) * uWaveHeight * 0.35;
  float wave = w1 + w2 + w3;
  vWave = wave / (uWaveHeight * 1.95);

  pos.y += wave;

  // Approximate normal from wave gradients
  float eps = 0.01;
  float wx = (sin((pos.x+eps)*2.8 + pos.z*1.9 + uTime*0.6) - w1) / eps * uWaveHeight;
  float wz = (sin(pos.x*2.8 + (pos.z+eps)*1.9 + uTime*0.6) - w1) / eps * uWaveHeight;
  vec3 waveNormal = normalize(vec3(-wx, 1.0, -wz));

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;
  vWorldNormal = normalize((modelMatrix * vec4(waveNormal, 0.0)).xyz);
  vUv = uv;

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`,Le=`
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uSkyReflection;
uniform float uTime;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying float vWave;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  vec3 normal = normalize(vWorldNormal);

  // Fresnel
  float fresnel = 0.04 + 0.96 * pow(1.0 - max(0.0, dot(viewDir, normal)), 4.0);

  // Animated sparkle
  float sparkle = sin(vUv.x * 80.0 + vUv.y * 60.0 + uTime * 1.2) * 0.5 + 0.5;
  sparkle *= sin(vUv.x * 120.0 - vUv.y * 90.0 + uTime * 0.9) * 0.5 + 0.5;
  sparkle = pow(sparkle, 8.0) * 0.15;

  // Pseudo reflection — shift UV with view angle
  vec2 reflUv = vUv * 0.6 + vec2(uTime * 0.008, uTime * 0.003);
  float reflPattern = sin(reflUv.x * 20.0) * cos(reflUv.y * 16.0) * 0.5 + 0.5;
  reflPattern += sin(reflUv.x * 40.0 + reflUv.y * 30.0) * 0.25;

  vec3 reflection = uSkyReflection * (0.6 + 0.4 * reflPattern);

  // Depth-based color (simulated via fresnel)
  vec3 waterColor = mix(uDeepColor, uShallowColor, fresnel * 0.7);

  // Combine
  vec3 color = waterColor + reflection * fresnel * 0.5 + sparkle * vec3(0.8, 0.9, 1.0);

  // Wave crest foam
  float foam = smoothstep(0.55, 0.9, vWave) * 0.2 * (1.0 - fresnel);
  color += foam * vec3(0.9, 0.95, 1.0);

  float alpha = 0.55 + 0.45 * fresnel;

  gl_FragColor = vec4(color, alpha);
}
`;function Ue(n={}){return new te({uniforms:{uTime:{value:0},uWaveHeight:{value:n.waveHeight??.035},uDeepColor:{value:new F(n.deepColor??"#0a2a3a")},uShallowColor:{value:new F(n.shallowColor??"#1a5a6a")},uSkyReflection:{value:new F(n.skyReflection??"#6a9abf")}},vertexShader:Ne,fragmentShader:Le,transparent:!0,side:R,depthWrite:!1})}const H=4,oe={simple:128,professional:192},Ae={karst:"karst",fluvial:"fluvial",aeolian:"aeolian",coastal:"coastal",structural:"structural",glacial:"glacial",volcanic:"volcanic"},Re={karst:[.1,.05,.05],fluvial:[-.05,.05,-.05],aeolian:[.05,.1,-.1],coastal:[-.1,-.05,-.1],structural:[0,0,.05],glacial:[0,0,.1],volcanic:[.05,-.05,0]},Fe={karst:[{text:"峰林",pos:[-.6,.5,-.5]},{text:"溶斗",pos:[.3,-.05,.3]},{text:"溶洞",pos:[.8,.1,-.3]}],fluvial:[{text:"V形谷",pos:[-.8,.1,0]},{text:"冲积扇",pos:[.6,.05,-.5]},{text:"河曲",pos:[0,.05,.7]}],aeolian:[{text:"沙丘",pos:[-.4,.15,-.2]},{text:"雅丹",pos:[.5,.1,.4]},{text:"风蚀柱",pos:[-.6,.2,.5]}],coastal:[{text:"海蚀崖",pos:[-.8,.15,0]},{text:"海滩",pos:[.2,-.02,.6]},{text:"三角洲",pos:[.7,.02,-.3]}],structural:[{text:"断层崖",pos:[-.4,.35,-.2]},{text:"褶皱山",pos:[.55,.3,.35]}],glacial:[{text:"冰斗",pos:[-.55,.28,-.45]},{text:"U形谷",pos:[.25,.08,.2]}],volcanic:[{text:"火山锥",pos:[0,.58,0]},{text:"熔岩流",pos:[.55,.08,-.35]}]};function Ge(n,s){const e=(d,t)=>d[0]*t[0]+d[1]*t[1],o=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],r=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],c=new Uint8Array(512);for(let d=0;d<512;d++)c[d]=r[d&255];const l=Math.floor(n)&255,f=Math.floor(s)&255,m=n-Math.floor(n),x=s-Math.floor(s),y=m*m*(3-2*m),v=x*x*(3-2*x),g=c[c[l]+f],C=c[c[l]+f+1],L=c[c[l+1]+f],D=c[c[l+1]+f+1],S=m-1,P=x-1;let k=(1-y)*(1-v)*e(o[g%8],[m,x]);return k+=(1-y)*v*e(o[C%8],[m,P]),k+=y*(1-v)*e(o[L%8],[S,x]),k+=y*v*e(o[D%8],[S,P]),k}function Q(n,s,e=4){let o=0,r=.5,c=1;for(let l=0;l<e;l++)o+=r*Ge(n*c,s*c),r*=.5,c*=2;return o}function Ee(n,s,e,o,r,c){const l=o,f=Q(s*3,e*2,4),m=Q(s*6,e*5,3),x=Q(s*12,e*10,2);switch(n){case"fluvial":return l+f*.2+m*.1-Math.abs(s-.5)*(.1+c*.12)*(.35+r*.65);case"karst":return l+f*.25+Math.abs(m)*.15+x*.08-c*.04;case"aeolian":return l+f*.15+Math.sin(s*8+e*3)*(.06+(1-c)*.05)+m*.05;case"coastal":return l+f*.12+(s<.3?-.08-c*.06:0)*(.4+r*.6)+m*.06;case"structural":return l+Math.abs(Math.sin((s+e)*5.2))*.18+(s>.52?.18:-.05)+m*.06;case"glacial":return l+f*.18-Math.exp(-((s-.52)**2)*20)*.22+Math.max(0,e-.55)*.28;case"volcanic":return l+Math.exp(-(((s-.5)**2+(e-.5)**2)*18))*.75-Math.exp(-(((s-.5)**2+(e-.5)**2)*80))*.28+m*.05;default:return l+f*.18+m*.08}}function Ve(n,s){const e=(s+.3)/.9,o=Math.max(0,Math.min(1,e)),r=new F;switch(n){case"fluvial":r.setHSL(.15+o*.15,.4,.25+o*.3);break;case"karst":r.setHSL(.12,.3,.3+o*.35);break;case"aeolian":r.setHSL(.11+o*.05,.5,.35+o*.25);break;case"coastal":r.setHSL(.13,.3,.28+o*.3);break;case"structural":r.setHSL(.08,.28,.26+o*.32);break;case"glacial":r.setHSL(.55,.26,.48+o*.28);break;case"volcanic":r.setHSL(.04,.45,.22+o*.22);break;default:r.setHSL(.12,.35,.3+o*.3)}return[r.r*255,r.g*255,r.b*255]}function N(n,s,e,o=.025,r=.85){const c=new Pe(s),l=new z(new Be(c,96,o,8,!1),new ae({color:e,roughness:.18,metalness:.18,transparent:!0,opacity:r}));return n.add(l),l}function Ie(n,s){if(s==="fluvial"){N(n,[new u(-1.7,.22,-1.1),new u(-1.05,.04,-.45),new u(-.4,-.02,.25),new u(.28,-.04,.75),new u(1.5,-.08,1.25)],2064088,.035,.78);for(let e=0;e<5;e++){const o=new z(new Me(.18+e*.025,32,Math.PI*.1,Math.PI*.55),new K({color:14070906,transparent:!0,opacity:.16,side:R}));o.rotation.x=-Math.PI/2,o.rotation.z=-.7,o.position.set(.65+e*.03,.01,-.75+e*.025),n.add(o)}}if(s==="karst")for(let e=0;e<9;e++){const o=new z(se.ring(.045,.12+e%3*.02,36),new K({color:2502698,transparent:!0,opacity:.45,side:R}));o.rotation.x=-Math.PI/2,o.position.set(-1+e%3*.75,.05,-.9+Math.floor(e/3)*.65),n.add(o)}if(s==="aeolian")for(let e=0;e<10;e++){const o=new z(new Ce(.25+e%3*.04,.012,6,64,Math.PI),new K({color:15975533,transparent:!0,opacity:.5}));o.rotation.x=-Math.PI/2,o.rotation.z=.4+e%4*.08,o.position.set(-1.8+e%5*.8,.12,-.9+Math.floor(e/5)*1.1),n.add(o)}if(s==="coastal"&&N(n,[new u(-1.9,.03,-1.25),new u(-1,.08,-.55),new u(-.55,.02,.2),new u(-1.05,.04,1.25)],15258790,.04,.82),s==="structural"){N(n,[new u(-1.75,.2,-1.4),new u(-.65,.16,-.45),new u(.3,.15,.35),new u(1.65,.2,1.4)],16734781,.018,.78);for(let e=0;e<5;e++)N(n,[new u(-1.6,.14+e*.02,-1+e*.35),new u(-.3,.22,-.65+e*.35),new u(1.3,.16,-.35+e*.35)],9265216,.012,.45)}if(s==="glacial"&&N(n,[new u(-.85,.32,-1.55),new u(-.25,.12,-.8),new u(.15,.05,.05),new u(.35,-.02,1.35)],13627135,.09,.55),s==="volcanic"){const e=new z(new Se(.45,.75,48,8,!0),new ae({color:6109998,roughness:.72,transparent:!0,opacity:.72,side:R}));e.position.y=.42,n.add(e),N(n,[new u(.08,.78,0),new u(.42,.32,-.28),new u(.9,.08,-.65),new u(1.55,-.02,-1.05)],16734756,.035,.78)}}function X(n,s,e){const{labelSystem:o}=e,r=new ye,c=s.mode||"simple",l=s.activeModule||"fluvial";let f=s.timeline||0,m=s.climateFactor??.5;const x=s.quality,y=Ae[l]||"fluvial",v=x?.terrain||oe,g=v[c]||v.simple||oe.simple,C=new ge(H,H,g,g);C.rotateX(-Math.PI/2);const L=new Float32Array(C.attributes.position.count*3);C.setAttribute("color",new ke(L,3));const D=Re[l]||[0,0,0],S=We({minHeight:-.3,maxHeight:.6,sunDirection:new u(.5,.8,.3),biomeBias:new u(D[0],D[1],D[2])}),P=new z(C,S);P.receiveShadow=!0,P.castShadow=!0,r.add(P);let k=null;if(l!=="aeolian"){const b=x?.tier==="low"?12:24,a=se.plane(H*1.2,H*1.2,b,b);a.rotateX(-Math.PI/2),k=Ue({waveHeight:x?.tier==="low"?.018:.028,deepColor:"#123a52",shallowColor:"#2a7a96",skyReflection:"#8eb8d8"});const h=new z(a,k);h.position.y=-.08,h.receiveShadow=!0,r.add(h)}function d(b,a){const h=C.attributes.position,q=C.attributes.color;let G=1/0,E=-1/0;for(let _=0;_<h.count;_++){const le=h.getX(_),ie=h.getZ(_),V=(le+H/2)/H,I=(ie+H/2)/H,ne=.15+Math.sin(V*3.7+I*2.1)*.15+Math.sin(V*5.2-I*4.3+1.8)*.08,W=Ee(y,V,I,ne,b,a);h.setY(_,W),W<G&&(G=W),W>E&&(E=W);const O=Ve(y,W);q.setXYZ(_,O[0]/255,O[1]/255,O[2]/255)}h.needsUpdate=!0,q.needsUpdate=!0,C.computeVertexNormals(),S.uniforms?.uMinHeight&&(S.uniforms.uMinHeight.value=G,S.uniforms.uMaxHeight.value=E)}d(f,m),Ie(r,y),o&&c==="professional"&&(Fe[l]||[]).forEach(a=>{o.addToGroup(r,a.text,new u(...a.pos),{color:"#e8d5c4",fontSize:"11px",background:"rgba(60,40,30,0.78)"})});const t={update(b,a){k?.uniforms?.uTime&&(k.uniforms.uTime.value=a)},setParams(b){const a=b.timeline??f,h=b.climateFactor??m;a===f&&h===m||(f=a,m=h,d(f,m))},dispose(){}};return r.userData={api:t},r}const Y=[{id:"karst",icon:"🕳",label:"喀斯特地貌",subtitle:"岩溶地貌 · 桂林山水",description:"喀斯特地貌是可溶性岩石（以石灰岩为主）受地表水、地下水的溶蚀作用所形成的各种地貌。我国广西、贵州、云南等地最为典型。",keyPoints:["溶蚀作用：含 CO₂ 的水对石灰岩的化学溶解过程","地表形态：溶沟、洼地、峰丛、峰林、孤峰、残丘","地下形态：溶洞、石钟乳、石笋、石柱、地下河","分布：桂、黔、滇碳酸盐岩出露地区"],advancedPoints:["岩溶动力系统：CO₂-H₂O-CaCO₃ 三相平衡与溶蚀速率","岩溶地貌演化序列：溶沟→洼地→峰丛→峰林→孤峰→残丘（Davis 循环）","表层岩溶带（Epikarst）对地下水调蓄的关键作用","石漠化：植被破坏→水土流失→基岩裸露的退化过程","岩溶碳汇效应：全球碳酸盐岩风化对 CO₂ 循环的贡献"],references:["Ford, D.C. & Williams, P. (2007). Karst Hydrogeology and Geomorphology. Wiley.","Yuan, D. (1997). Sensitivity of karst process to environmental change. Episodes, 20(2), 88-92."],params:[{label:"CaCO₃ 溶解度",value:"15-50 mg/L"},{label:"溶蚀速率",value:"0.01-0.5 mm/yr"},{label:"峰林坡角",value:"45°-90°"}]},{id:"fluvial",icon:"🏞",label:"河流地貌",subtitle:"流水侵蚀与堆积",description:"河流通过侵蚀、搬运和堆积作用塑造地表形态。上游形成 V 形谷，中游发育河曲，下游形成冲积平原和三角洲。",keyPoints:["侵蚀类型：下蚀（V形谷）、侧蚀（河曲）、溯源侵蚀","堆积地貌：冲积扇、河漫滩、三角洲、冲积平原","河流发育阶段：青年期（下蚀）→ 壮年期（侧蚀）→ 老年期（堆积）","河流地貌与人类活动：农业、聚落、交通选址"],advancedPoints:["水力几何关系（Leopold & Maddock）：宽深比与流量幂律","侵蚀循环理论（Davis）：幼年→壮年→老年地形序列","河流纵剖面均衡理论（Strahler 面积-高程分析）","河型分类：顺直、曲流、辫状、网状——水沙条件控制","输沙率公式：Bagnold / Einstein 床沙质输移模型"],references:["Leopold, L.B., Wolman, M.G. & Miller, J.P. (1992). Fluvial Processes in Geomorphology. Dover.","Knighton, D. (1998). Fluvial Forms and Processes. Arnold.","Strahler, A.N. (1957). Quantitative analysis of watershed geomorphology. Eos, 38(6), 913-920."],params:[{label:"曼宁系数 n",value:"0.025-0.05"},{label:"推移质输沙率",value:"10⁻³-10⁻¹ kg/s·m"},{label:"河流坡度",value:"0.001-0.01"}]},{id:"aeolian",icon:"🏜",label:"风沙地貌",subtitle:"风力侵蚀与堆积",description:"风沙地貌是风力对地表物质的侵蚀、搬运和堆积所形成的各种地貌形态，主要分布在干旱和半干旱地区。",keyPoints:["风蚀地貌：雅丹（风蚀垄槽）、风蚀柱、风蚀蘑菇、风蚀洼地","风积地貌：沙丘（新月形沙丘、纵向沙垄、金字塔沙丘）","沙丘移动：迎风坡缓（5°-15°）、背风坡陡（30°-34°）","黄土：风力搬运堆积形成，主要分布在黄土高原"],advancedPoints:["沙粒起动阈值风速：Bagnold 公式 u*_t = A √(gd(ρs-ρ)/ρ)","沙丘形态动力学：迎风坡流速加速→侵蚀，背风坡分离→堆积","雅丹发育与风蚀速率：实测年均风蚀深度 0.1-5 cm","腾格里/巴丹吉林沙漠形成演化与第四纪气候","粉尘循环（Dust Cycle）：亚洲粉尘对全球气候的反馈效应"],references:["Bagnold, R.A. (1941). The Physics of Blown Sand and Desert Dunes. Methuen.","Pye, K. & Tsoar, H. (2009). Aeolian Sand and Sand Dunes. Springer.","张克存等 (2020). 中国沙漠风沙地貌学. 科学出版社."],params:[{label:"起动风速",value:"5-6 m/s (2m高)"},{label:"输沙率 Q",value:"Q ∝ u*³"},{label:"沙丘移动速率",value:"5-20 m/yr"}]},{id:"coastal",icon:"🌊",label:"海岸地貌",subtitle:"海浪与潮流塑造",description:"海岸地貌是在波浪、潮汐、海流等海洋动力作用下形成的各种地貌形态，包括侵蚀型和堆积型两大类。",keyPoints:["海蚀地貌：海蚀崖、海蚀平台、海蚀洞、海蚀拱桥、海蚀柱","海积地貌：海滩（砾滩/砂滩/泥滩）、沙嘴、沙坝、潟湖","三角洲：河流与海洋共同作用形成的堆积体","海岸类型：基岩海岸、砂质海岸、淤泥质海岸、生物海岸"],advancedPoints:["波浪折射与沿岸输沙：CERC 公式 Q = K H_b^(5/2) sin(2α_b)","海平面变化对海岸的影响：IPCC RCP 8.5 情景下2050年海面上升预测","三角洲形态分类：鸟足状（密西西比）、扇形（尼罗河）、尖头（长江）","海岸侵蚀与防护：硬工程（丁坝、防波堤）vs 软工程（海滩 nourish）","珊瑚礁/红树林海岸生态地貌反馈系统"],references:["Bird, E. (2008). Coastal Geomorphology: An Introduction. Wiley.","Komar, P.D. (1998). Beach Processes and Sedimentation. Prentice Hall.","王颖 (2013). 中国海洋地理. 科学出版社."],params:[{label:"波浪能通量 P",value:"P = ρgH²Cg/8"},{label:"沿岸输沙率",value:"10⁵-10⁶ m³/yr"},{label:"潮差类型",value:"0.5-8 m"}]}],Oe={class:"sandbox-root"},$e={class:"sandbox-topbar"},Ke={class:"mode-tabs"},Qe={class:"sandbox-body"},Xe={class:"module-panel"},Ye=["onClick"],qe={class:"module-icon"},Ze={class:"module-info"},je={class:"module-sub"},Je={class:"viewport-toolbar"},eo={class:"tool-item"},oo={key:0,class:"tool-item"},to={class:"info-panel"},ao={class:"panel-title"},so={class:"panel-desc"},lo={key:0,class:"knowledge-box"},io={key:1,class:"knowledge-box professional"},no={key:0,class:"ref-section"},ro={key:1,class:"param-section"},co={class:"param-label"},uo={class:"param-val"},vo={class:"glossary-term"},mo={class:"glossary-def"},fo={__name:"SandboxApp",props:{embedded:{type:Boolean,default:!1},caseStudy:{type:String,default:""}},emits:["close"],setup(n){re(d=>({df1c8f7c:n.embedded?"calc(100vh - 160px)":"calc(100vh - 96px)"}));const s=n,e=B(null),o=B({x:0,y:0});function r(d,t){const b=t.target.getBoundingClientRect();o.value={x:Math.min(b.left,window.innerWidth-300),y:b.bottom+6},e.value=d}const c=B(null),l=B("simple"),f=B("karst"),m=B(0),x=B(.5),y=B(!0);let v=null;const g=he(()=>Y.find(d=>d.id===f.value)||Y[0]);function C(d){f.value=d,v&&(v.setParams({activeModule:d}),v.loadModule(X,{mode:l.value,activeModule:d,timeline:m.value,climateFactor:x.value,caseStudy:s.caseStudy}))}function L(){v&&v.setParams({timeline:m.value})}function D(){v&&v.setParams({climateFactor:x.value})}function S(){y.value=!y.value,v&&v.setAutoRotate(y.value)}function P(){v&&v.resetCamera("orbit")}ce(l,d=>{v&&(v.setMode(d),v.loadModule(X,{mode:d,activeModule:f.value,timeline:m.value,climateFactor:x.value}))}),ue(()=>{c.value&&(v=new be(c.value,{bg:16117736,mode:"simple",lightPreset:"studio"}),v.loadModule(X,{mode:"simple",activeModule:f.value,timeline:m.value,climateFactor:x.value}),window.addEventListener("resize",k))}),ve(()=>{window.removeEventListener("resize",k),v&&v.dispose()});function k(){v&&v.resize()}return(d,t)=>{const b=me("router-link");return p(),w("div",Oe,[i("div",$e,[n.embedded?(p(),w("button",{key:0,class:"back-link",onClick:t[0]||(t[0]=a=>d.$emit("close"))},"← 返回课文")):(p(),Z(b,{key:1,to:"/",class:"back-link"},{default:de(()=>[...t[7]||(t[7]=[fe("← 返回首页",-1)])]),_:1})),i("div",Ke,[i("button",{class:$(["mode-btn",{active:l.value==="simple"}]),onClick:t[1]||(t[1]=a=>l.value="simple")},"🔰 简单模式",2),i("button",{class:$(["mode-btn",{active:l.value==="professional"}]),onClick:t[2]||(t[2]=a=>l.value="professional")},"🎓 专业模式",2)]),t[8]||(t[8]=i("span",{class:"chapter-ref"},"第四章 · 地貌",-1))]),i("div",Qe,[i("aside",Xe,[t[9]||(t[9]=i("h3",{class:"panel-title"},"地貌类型",-1)),(p(!0),w(U,null,A(j(Y),a=>(p(),w("div",{key:a.id,class:$(["module-card",{active:a.id===f.value}]),onClick:h=>C(a.id)},[i("span",qe,M(a.icon),1),i("div",Ze,[i("strong",null,M(a.label),1),i("span",je,M(a.subtitle),1)])],10,Ye))),128))]),i("main",{class:"viewport-area",ref_key:"viewportRef",ref:c},[i("div",Je,[i("label",eo,[t[10]||(t[10]=i("span",{class:"tool-label"},"演变",-1)),J(i("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":t[3]||(t[3]=a=>m.value=a),onInput:L,class:"timeline-slider"},null,544),[[ee,m.value,void 0,{number:!0}]])]),l.value==="professional"?(p(),w("label",oo,[t[11]||(t[11]=i("span",{class:"tool-label"},"气候",-1)),J(i("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":t[4]||(t[4]=a=>x.value=a),onInput:D,class:"climate-slider"},null,544),[[ee,x.value,void 0,{number:!0}]])])):T("",!0),i("button",{class:"tool-btn",onClick:S},M(y.value?"⏸ 暂停":"▶ 旋转"),1),i("button",{class:"tool-btn",onClick:P},"⟲ 复位")]),t[12]||(t[12]=i("div",{class:"viewport-hint"},"拖拽旋转 · 滚轮缩放 · 右键平移",-1))],512),i("aside",to,[i("h3",ao,M(g.value.label),1),i("p",so,M(g.value.description),1),l.value==="simple"?(p(),w("div",lo,[t[13]||(t[13]=i("h4",null,"📖 教材要点",-1)),i("ul",null,[(p(!0),w(U,null,A(g.value.keyPoints,a=>(p(),w("li",{key:a},M(a),1))),128))])])):T("",!0),l.value==="professional"?(p(),w("div",io,[t[16]||(t[16]=i("h4",null,"📚 学术扩展",-1)),i("ul",null,[(p(!0),w(U,null,A(g.value.advancedPoints,(a,h)=>(p(),w("li",{key:h},[pe(De,{text:a,glossary:j(He),onShowTerm:r},null,8,["text","glossary"])]))),128))]),g.value.references?(p(),w("div",no,[t[14]||(t[14]=i("h4",null,"📎 参考文献",-1)),(p(!0),w(U,null,A(g.value.references,a=>(p(),w("p",{key:a,class:"ref-item"},M(a),1))),128))])):T("",!0),g.value.params?(p(),w("div",ro,[t[15]||(t[15]=i("h4",null,"⚙ 关键参数",-1)),(p(!0),w(U,null,A(g.value.params,a=>(p(),w("div",{key:a.label,class:"param-row"},[i("span",co,M(a.label),1),i("span",uo,M(a.value),1)]))),128))])):T("",!0)])):T("",!0)])]),(p(),Z(we,{to:"body"},[e.value?(p(),w("div",{key:0,class:"glossary-mask",onClick:t[5]||(t[5]=a=>e.value=null)})):T("",!0),e.value?(p(),w("div",{key:1,class:"glossary-popup",style:xe({top:o.value.y+"px",left:o.value.x+"px"})},[i("h4",vo,M(e.value.term),1),i("p",mo,M(e.value.explanation),1),i("button",{class:"glossary-close",onClick:t[6]||(t[6]=a=>e.value=null)},"✕")],4)):T("",!0)]))])}}},Mo=Te(fo,[["__scopeId","data-v-dab0cd9f"]]);export{Mo as default};
