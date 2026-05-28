import{w as j,G as Z,N as J,y as b,z as u,J as W,K as L,H as F,I as D,u as G,O,Q as X,E as P,D as C,R as ee,T as te,b as S,c as oe,S as se,v as ne,x as g,B as ie,C as ae,A as re}from"./vendor-core-C8rTXlMg.js";import{S as le,D as Q,V as A,W as ce,P as ue,A as de,C as he,a as me,b as fe,c as ve,d as q,F as pe,O as ge,e as Y,B as xe,M as U,f as be,g as $}from"./vendor-three-CIRoTdaP.js";import{g as Me,G as ye}from"./GlossaryText-C_UxgfYi.js";import{_ as we}from"./index-Q2uvnL_j.js";import"./vendor-vue-uUkUdUkc.js";function H(o,t){return Ce(Math.sin(o*127.1+t*311.7)*43758.5453)}function Ce(o){return o-Math.floor(o)}function R(o,t,e){return o+(t-o)*e}function _(o,t,e){return Math.max(t,Math.min(e,o))}function ke(o,t){const e=Math.floor(o),s=Math.floor(t),a=o-e,n=t-s,l=a*a*(3-2*a),h=n*n*(3-2*n),m=H(e,s),d=H(e+1,s),i=H(e,s+1),f=H(e+1,s+1);return R(R(m,d,l),R(i,f,l),h)}function N(o,t,e=3){let s=0,a=.6,n=1;for(let l=0;l<e;l++)s+=a*ke(o*n,t*n),n*=2,a*=.5;return s}function _e(o,t,e=3){const s=N(o,t,e)*2-1,a=N(o+5.2,t+1.3,e)*2-1;return N(o+s*.3,t+a*.3,e)}function r(o,t,e){return[Math.round(R(o[0],t[0],e)),Math.round(R(o[1],t[1],e)),Math.round(R(o[2],t[2],e))]}const Se={modifyHeight(o,t,e,s,a){const n=Math.sin(o*8+t*5)*.5+Math.sin(o*3-t*7)*.3,l=Math.sin(o*12+t*3+.8)*.08*(.3+s*.7),h=-Math.abs(n)*.12*(.2+s*.8),m=Math.sin(t*6+o*2+s*2)*.15,d=-Math.exp(-Math.pow((o-.5+m)/.04,2))*.1*(.3+s*.5),x=Math.pow((o-.75)/.1,2)+Math.pow((t-.2)/.08,2),p=Math.exp(-x*2)*.12*(.2+s*.6),M=Math.sin(o*15+t*10)*.02*(1-Math.exp(-s*3)),y=.6+a*.4,w=Math.sin(o*14+t*12)*.03*y;return e+l+h*y+d+p+M+w},getColor(o,t){const e=_(o,0,1);return e<.05?r([30,55,70],[40,75,85],e/.05):e<.12?r([40,75,85],[60,110,80],(e-.05)/.07):e<.3?r([60,110,80],[80,140,70],(e-.12)/.18):e<.5?r([80,140,70],[95,145,60],(e-.3)/.2):e<.7?r([95,145,60],[130,120,65],(e-.5)/.2):r([130,120,65],[180,170,150],(e-.7)/.3)},getFeatureName(o){const t=["V形谷","冲积扇","河曲","牛轭湖","三角洲","阶地"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[-.1,.02,.04]}},Be={modifyHeight(o,t,e,s,a){const n=o+t*.6,l=Math.atan(n*6)*.18,h=Math.sin(o*5+t*3+s*.4)*.12,m=Math.sin(o*8-t*5+1.2)*.06,i=Math.exp(-Math.pow((o-.3)/.15,2)-Math.pow((t-.5)/.2,2))*(.4+s*.3);return e+l+h+m+i},getColor(o,t){const e=_(o,0,1);return e<.15?r([38,28,18],[78,55,32],e/.15):e<.35?r([78,55,32],[140,95,50],(e-.15)/.2):e<.55?r([140,95,50],[185,130,60],(e-.35)/.2):e<.75?r([185,130,60],[160,120,85],(e-.55)/.2):r([160,120,85],[210,200,185],(e-.75)/.25)},getFeatureName(o){const t=["断层崖","褶皱山","断块山","裂谷","不整合"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[0,0,0]}},ze={modifyHeight(o,t,e,s,a){const n=.15+s*.3,l=o*2-1,h=t*2-1,d=-Math.exp(-Math.pow((h-.1*l)/.12,2))*n*(1+Math.pow(Math.abs(h-.1*l)/.22,3)),x=Math.pow((o-.65)/.08,2)+Math.pow((t-.25)/.06,2),p=-Math.exp(-x*3)*.3*(1-Math.exp(-x*8)),M=Math.exp(-Math.pow((o-.35)/.06,2)-Math.pow((t-.7)/.05,2))*.45,y=Math.sin(o*14+t*10)*.04*(.5+s*.5);return e+d+p+M+y},getColor(o,t){const e=_(o,0,1),s=_(t,0,1);return e<.1?r([25,35,45],[35,50,55],e/.1):e<.25?r([35,50,55],[55,65,60],(e-.1)/.15):e<.45?r([55,65,60],[90,75,65],(e-.25)/.2):e<.7?r([90,75,65],[110,95,85],(e-.45)/.25):s>.5?r([110,95,85],[150,145,140],(e-.7)/.3):r([110,95,85],[200,210,220],(e-.7)/.3)},getFeatureName(o){const t=["U 形谷","冰斗","刃脊","冰碛垄","峡湾","角峰"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[0,-.06,-.08]}},Pe={modifyHeight(o,t,e,s,a){const n=o*2-1,l=-.2-s*.15,h=Math.abs(n+.1),m=-Math.exp(-h*h*80)*.15,d=Math.exp(-h*h*120)*.08,i=Math.sin(o*12+t*8)*.03*Math.exp(-h*15);return l+e*.7+m+d+i},getColor(o,t){const e=_(o,0,1);return e<.08?r([20,50,85],[30,70,100],e/.08):e<.2?r([30,70,100],[60,100,110],(e-.08)/.12):e<.35?r([60,100,110],[180,155,105],(e-.2)/.15):e<.5?r([180,155,105],[100,140,90],(e-.35)/.15):r([100,140,90],[60,100,60],(e-.5)/.5)},getFeatureName(o){const t=["海蚀崖/台","海滩","沙嘴/沙坝","三角洲","河口湾"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[-.18,-.05,-.02]}},Re={modifyHeight(o,t,e,s,a){const n=e*.35,l=o*8+t*3,h=Math.sin(l)*.08,m=Math.sin(o*16-t*6+.5)*.04,d=_e(o*5,t*3,2)*.12,i=Math.sin(o*20+t*2)*.03,f=Math.exp(-Math.pow((o-.7)/.04,2)-Math.pow((t-.5)/.03,2))*.18;return n+h+m+d*(.5+s*.5)+i+f},getColor(o,t){const e=_(o,0,1);return e<.15?r([140,115,70],[170,135,80],e/.15):e<.35?r([170,135,80],[190,150,85],(e-.15)/.2):e<.55?r([190,150,85],[155,120,70],(e-.35)/.2):e<.75?r([155,120,70],[120,90,55],(e-.55)/.2):r([120,90,55],[160,145,125],(e-.75)/.25)},getFeatureName(o){const t=["沙丘","雅丹","黄土","风棱石","风蚀盆地"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[-.12,-.06,.02]}},Fe={modifyHeight(o,t,e,s,a){const n=e*.8;let l=0;const h=[[.15,.25],[.3,.7],[.55,.2],[.7,.6],[.45,.45],[.85,.35],[.2,.8]];for(const[i,f]of h){const x=(o-i)/.04,p=(t-f)/.035,M=Math.sqrt(x*x+p*p),y=Math.exp(-M*1.2)*.35/(1+M*M);y>.01&&(l+=y)}let m=0;const d=[[.4,.35],[.6,.45],[.3,.55],[.75,.7]];for(const[i,f]of d){const x=(o-i)/.025,p=(t-f)/.025,M=x*x+p*p;m-=Math.exp(-M*5)*.12}return n+l*(.5+s*.5)+m},getColor(o,t){const e=_(o,0,1);return e<.1?r([25,55,30],[55,90,50],e/.1):e<.3?r([55,90,50],[85,120,65],(e-.1)/.2):e<.55?r([85,120,65],[140,130,100],(e-.3)/.25):e<.75?r([140,130,100],[160,145,120],(e-.55)/.2):r([160,145,120],[185,175,165],(e-.75)/.25)},getFeatureName(o){const t=["峰林","溶斗/天坑","溶洞","坡立谷","地下河"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[-.04,-.02,0]}},De={modifyHeight(o,t,e,s,a){let n=0;const l=[[.45,.5],[.7,.35],[.3,.65],[.6,.7],[.8,.5]];for(let m=0;m<l.length;m++){const[d,i]=l[m],f=(o-d)/.06,x=(t-i)/.06,p=Math.sqrt(f*f+x*x),M=.4-m*.06,y=M*Math.exp(-p*1.8)/(1+p*p*2);if(n+=y*(.5+s*.5),p<.3){const w=-M*.3*Math.exp(-p*p*12);n+=w*(.5+s*.5)}}const h=Math.sin(o*8+t*5)*.03*(.5+s*.5);return e*.5+n+h},getColor(o,t){const e=_(o,0,1);return e<.1?r([15,15,20],[25,20,25],e/.1):e<.3?r([25,20,25],[45,30,28],(e-.1)/.2):e<.5?r([45,30,28],[80,45,35],(e-.3)/.2):e<.7?r([80,45,35],[120,70,40],(e-.5)/.2):r([120,70,40],[160,140,120],(e-.7)/.3)},getFeatureName(o){const t=["盾状火山","层状火山","破火山口","熔岩高原","火山颈"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[.02,.06,.04]}},Ee={modifyHeight(o,t,e,s,a){const n=Math.sin(o*6+t*4)*.5+.5,l=n*Math.sin(o*12+t*8)*.06*(.3+s*.5),m=(1-n)*N(o*6,t*6,2)*.08,i=(e>.3?1:0)*Math.sin(o*15+t*12)*.04;return e+l+m+i},getColor(o,t){const e=_(o,0,1);return e<.1?r([20,60,30],[40,85,45],e/.1):e<.3?r([40,85,45],[85,135,70],(e-.1)/.2):e<.5?r([85,135,70],[145,125,60],(e-.3)/.2):e<.7?r([145,125,60],[100,75,45],(e-.5)/.2):r([100,75,45],[190,195,200],(e-.7)/.3)},getFeatureName(o){const t=["冰缘地貌","气候-河流","干旱区","湿润区","第四纪气候"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[-.02,0,0]}},T={fluvial:Se,structural:Be,glacial:ze,coastal:Pe,aeolian:Re,karst:Fe,volcanic:De,climate:Ee};function He(o,t,e,s,a,n){const l=T[o];return l?l.modifyHeight(t,e,s,a,n):s}function Ne(o,t,e){const s=T[o];return s?s.getColor(t,e):null}function Ae(o,t){const e=T[o];return e?e.getFeatureName(t):""}function Te(o){const t=T[o];return!t||!t.getColorBias?[0,0,0]:t.getColorBias()}const Le=`
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
`,Ie=`
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
`;function Ve({minHeight:o,maxHeight:t,weatherFactor:e=0,sunDirection:s=new A(.5,.8,.3),biomeBias:a=new A(0,0,0),time:n=0,clippingPlanes:l=[]}={}){return new le({uniforms:{uMinHeight:{value:o??0},uMaxHeight:{value:t??1},uWeatherFactor:{value:e},uSunDirection:{value:s},uBiomeBias:{value:a},uTime:{value:n}},vertexShader:Le,fragmentShader:Ie,clippingPlanes:l,side:Q,roughness:.9,metalness:.02})}const K={simple:128,professional:200},B=4;class We{constructor(t){this.container=t,this.modules=["karst","fluvial","aeolian","coastal"],this.activeModule="karst",this.mode="simple",this.timeline=0,this.climateFactor=.5,this.annotations=[],this.autoRotate=!0,this._initRenderer(),this._initLabelRenderer(),this._initScene(),this._initLights(),this._initControls(),this._initTerrain(),this._animate()}_initRenderer(){this.renderer=new ce({antialias:!0,alpha:!0}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,2)),this.renderer.setClearColor(16117736,1),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=ue,this.renderer.toneMapping=de,this.renderer.toneMappingExposure=1.2,this.container.appendChild(this.renderer.domElement)}_initLabelRenderer(){this.labelRenderer=new he,this.labelRenderer.setSize(this.container.clientWidth,this.container.clientHeight),this.labelRenderer.domElement.style.position="absolute",this.labelRenderer.domElement.style.top="0",this.labelRenderer.domElement.style.left="0",this.labelRenderer.domElement.style.pointerEvents="none",this.container.appendChild(this.labelRenderer.domElement)}_initScene(){this.scene=new me,this.camera=new fe(40,this.container.clientWidth/this.container.clientHeight,.1,50),this.camera.position.set(5,4,6),this.camera.lookAt(0,0,0)}_initLights(){const t=new ve(8952234,.4);this.scene.add(t);const e=new q(16772829,1.8);e.position.set(8,15,5),e.castShadow=!0,e.shadow.mapSize.set(2048,2048),e.shadow.camera.near=.1,e.shadow.camera.far=30,e.shadow.camera.left=-8,e.shadow.camera.right=8,e.shadow.camera.top=8,e.shadow.camera.bottom=-8,this.scene.add(e),this.sun=e;const s=new q(8947967,.3);s.position.set(-5,3,-5),this.scene.add(s),this.scene.fog=new pe(16117736,8,14)}_initControls(){this.controls=new ge(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.08,this.controls.minDistance=1.5,this.controls.maxDistance=14,this.controls.maxPolarAngle=Math.PI/2.1,this.controls.target.set(0,0,0),this.controls.autoRotate=!0,this.controls.autoRotateSpeed=.8}_initTerrain(){this._buildTerrain()}_buildTerrain(){this.terrain&&(this.scene.remove(this.terrain),this.terrain.geometry.dispose(),this.terrain.material.dispose()),this._clearAnnotations();const t=K[this.mode]||K.simple,e=new Y(B,B,t,t);e.rotateX(-Math.PI/2);const s=e.attributes.position,a=new Float32Array(s.count*3),n=this._toModuleId(this.activeModule);let l=1/0,h=-1/0;for(let i=0;i<s.count;i++){const f=s.getX(i),x=s.getZ(i),p=(f+B/2)/B,M=(x+B/2)/B,y=this._baseHeight(p,M),w=He(n,p,M,y,this.timeline,this.climateFactor);s.setY(i,w),w<l&&(l=w),w>h&&(h=w);const z=Ne(n,w,0);z&&(a[i*3]=z[0]/255,a[i*3+1]=z[1]/255,a[i*3+2]=z[2]/255)}s.needsUpdate=!0,e.computeVertexNormals(),e.setAttribute("color",new xe(a,3));const m=Te(n),d=Ve({minHeight:l,maxHeight:h,sunDirection:this.sun?.position.clone().normalize()||new A(.5,.8,.3),biomeBias:new A(m[0],m[1],m[2])});this.terrain=new U(e,d),this.terrain.receiveShadow=!0,this.terrain.castShadow=!0,this.scene.add(this.terrain),this._addWaterPlane(),this._addAnnotations()}_baseHeight(t,e){const s=Math.sin(t*3.7+e*2.1)*.15,a=Math.sin(t*5.2-e*4.3+1.8)*.08,n=Math.sin((t+.3)*8+(e-.2)*6)*.04;return .15+s+a+n}_toModuleId(t){return{karst:"karst",fluvial:"fluvial",aeolian:"aeolian",coastal:"coastal",structural:"structural",glacial:"glacial",volcanic:"volcanic"}[t]||"fluvial"}_addWaterPlane(){if(this.water&&(this.scene.remove(this.water),this.water.geometry.dispose(),this.water.material.dispose()),this.activeModule==="aeolian")return;const t=new Y(B*1.2,B*1.2);t.rotateX(-Math.PI/2);const e=new be({color:3832997,transparent:!0,opacity:.35,roughness:.1,metalness:.3,side:Q});this.water=new U(t,e),this.water.position.y=-.08,this.water.receiveShadow=!0,this.scene.add(this.water)}_addAnnotations(){const t=this._toModuleId(this.activeModule),e=Ae(t,this.timeline);if(!e)return;const s=this.terrain.geometry.attributes.position;let a=-1/0,n=0;for(let f=0;f<s.count;f+=10){const x=s.getY(f);x>a&&(a=x,n=f)}const l=s.getX(n),h=s.getZ(n),m=s.getY(n)+.3,d=document.createElement("div");d.textContent=e,d.style.color="#fff",d.style.background="rgba(139, 28, 28, 0.85)",d.style.padding="4px 10px",d.style.borderRadius="4px",d.style.fontSize="13px",d.style.fontWeight="600",d.style.pointerEvents="none",d.style.whiteSpace="nowrap";const i=new $(d);i.position.set(l,m,h),this.scene.add(i),this.annotations.push(i),this.mode==="professional"&&this._addSecondaryLabels(t)}_addSecondaryLabels(t){const e=this._getSecondaryLabels(t);for(const s of e){const a=document.createElement("div");a.textContent=s.text,a.style.color="#e8d5c4",a.style.background="rgba(60, 40, 30, 0.78)",a.style.padding="2px 8px",a.style.borderRadius="3px",a.style.fontSize="11px",a.style.border="1px solid rgba(200,160,120,0.4)";const n=new $(a);n.position.set(s.x,s.y,s.z),this.scene.add(n),this.annotations.push(n)}}_getSecondaryLabels(t){return{karst:[{text:"峰林",x:-.6,y:.5,z:-.5},{text:"溶斗",x:.3,y:-.05,z:.3},{text:"溶洞",x:.8,y:.1,z:-.3}],fluvial:[{text:"V形谷",x:-.8,y:.1,z:0},{text:"冲积扇",x:.6,y:.05,z:-.5},{text:"河曲",x:0,y:.05,z:.7}],aeolian:[{text:"沙丘",x:-.4,y:.15,z:-.2},{text:"雅丹",x:.5,y:.1,z:.4},{text:"风蚀柱",x:-.6,y:.2,z:.5}],coastal:[{text:"海蚀崖",x:-.8,y:.15,z:0},{text:"海滩",x:.2,y:-.02,z:.6},{text:"三角洲",x:.7,y:.02,z:-.3}]}[t]||[]}_clearAnnotations(){for(const t of this.annotations)this.scene.remove(t);this.annotations=[]}setModule(t){t!==this.activeModule&&(this.activeModule=t,this._buildTerrain(),this.setAutoRotate(this.autoRotate))}setMode(t){t!==this.mode&&(this.mode=t,this._buildTerrain(),this.setAutoRotate(this.autoRotate))}setTimeline(t){this.timeline=t,this._buildTerrain()}setClimateFactor(t){this.climateFactor=t,this._buildTerrain()}setAutoRotate(t){this.autoRotate=t,this.controls.autoRotate=t}resize(){const t=this.container.clientWidth,e=this.container.clientHeight;this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,e),this.labelRenderer.setSize(t,e)}dispose(){this.renderer.dispose(),this.labelRenderer.domElement.remove(),this.controls.dispose()}_animate(){this._raf=requestAnimationFrame(()=>this._animate()),this.controls.update(),this.renderer.render(this.scene,this.camera),this.labelRenderer.render(this.scene,this.camera)}}const I=[{id:"karst",icon:"🕳",label:"喀斯特地貌",subtitle:"岩溶地貌 · 桂林山水",description:"喀斯特地貌是可溶性岩石（以石灰岩为主）受地表水、地下水的溶蚀作用所形成的各种地貌。我国广西、贵州、云南等地最为典型。",keyPoints:["溶蚀作用：含 CO₂ 的水对石灰岩的化学溶解过程","地表形态：溶沟、洼地、峰丛、峰林、孤峰、残丘","地下形态：溶洞、石钟乳、石笋、石柱、地下河","分布：桂、黔、滇碳酸盐岩出露地区"],advancedPoints:["岩溶动力系统：CO₂-H₂O-CaCO₃ 三相平衡与溶蚀速率","岩溶地貌演化序列：溶沟→洼地→峰丛→峰林→孤峰→残丘（Davis 循环）","表层岩溶带（Epikarst）对地下水调蓄的关键作用","石漠化：植被破坏→水土流失→基岩裸露的退化过程","岩溶碳汇效应：全球碳酸盐岩风化对 CO₂ 循环的贡献"],references:["Ford, D.C. & Williams, P. (2007). Karst Hydrogeology and Geomorphology. Wiley.","Yuan, D. (1997). Sensitivity of karst process to environmental change. Episodes, 20(2), 88-92."],params:[{label:"CaCO₃ 溶解度",value:"15-50 mg/L"},{label:"溶蚀速率",value:"0.01-0.5 mm/yr"},{label:"峰林坡角",value:"45°-90°"}]},{id:"fluvial",icon:"🏞",label:"河流地貌",subtitle:"流水侵蚀与堆积",description:"河流通过侵蚀、搬运和堆积作用塑造地表形态。上游形成 V 形谷，中游发育河曲，下游形成冲积平原和三角洲。",keyPoints:["侵蚀类型：下蚀（V形谷）、侧蚀（河曲）、溯源侵蚀","堆积地貌：冲积扇、河漫滩、三角洲、冲积平原","河流发育阶段：青年期（下蚀）→ 壮年期（侧蚀）→ 老年期（堆积）","河流地貌与人类活动：农业、聚落、交通选址"],advancedPoints:["水力几何关系（Leopold & Maddock）：宽深比与流量幂律","侵蚀循环理论（Davis）：幼年→壮年→老年地形序列","河流纵剖面均衡理论（Strahler 面积-高程分析）","河型分类：顺直、曲流、辫状、网状——水沙条件控制","输沙率公式：Bagnold / Einstein 床沙质输移模型"],references:["Leopold, L.B., Wolman, M.G. & Miller, J.P. (1992). Fluvial Processes in Geomorphology. Dover.","Knighton, D. (1998). Fluvial Forms and Processes. Arnold.","Strahler, A.N. (1957). Quantitative analysis of watershed geomorphology. Eos, 38(6), 913-920."],params:[{label:"曼宁系数 n",value:"0.025-0.05"},{label:"推移质输沙率",value:"10⁻³-10⁻¹ kg/s·m"},{label:"河流坡度",value:"0.001-0.01"}]},{id:"aeolian",icon:"🏜",label:"风沙地貌",subtitle:"风力侵蚀与堆积",description:"风沙地貌是风力对地表物质的侵蚀、搬运和堆积所形成的各种地貌形态，主要分布在干旱和半干旱地区。",keyPoints:["风蚀地貌：雅丹（风蚀垄槽）、风蚀柱、风蚀蘑菇、风蚀洼地","风积地貌：沙丘（新月形沙丘、纵向沙垄、金字塔沙丘）","沙丘移动：迎风坡缓（5°-15°）、背风坡陡（30°-34°）","黄土：风力搬运堆积形成，主要分布在黄土高原"],advancedPoints:["沙粒起动阈值风速：Bagnold 公式 u*_t = A √(gd(ρs-ρ)/ρ)","沙丘形态动力学：迎风坡流速加速→侵蚀，背风坡分离→堆积","雅丹发育与风蚀速率：实测年均风蚀深度 0.1-5 cm","腾格里/巴丹吉林沙漠形成演化与第四纪气候","粉尘循环（Dust Cycle）：亚洲粉尘对全球气候的反馈效应"],references:["Bagnold, R.A. (1941). The Physics of Blown Sand and Desert Dunes. Methuen.","Pye, K. & Tsoar, H. (2009). Aeolian Sand and Sand Dunes. Springer.","张克存等 (2020). 中国沙漠风沙地貌学. 科学出版社."],params:[{label:"起动风速",value:"5-6 m/s (2m高)"},{label:"输沙率 Q",value:"Q ∝ u*³"},{label:"沙丘移动速率",value:"5-20 m/yr"}]},{id:"coastal",icon:"🌊",label:"海岸地貌",subtitle:"海浪与潮流塑造",description:"海岸地貌是在波浪、潮汐、海流等海洋动力作用下形成的各种地貌形态，包括侵蚀型和堆积型两大类。",keyPoints:["海蚀地貌：海蚀崖、海蚀平台、海蚀洞、海蚀拱桥、海蚀柱","海积地貌：海滩（砾滩/砂滩/泥滩）、沙嘴、沙坝、潟湖","三角洲：河流与海洋共同作用形成的堆积体","海岸类型：基岩海岸、砂质海岸、淤泥质海岸、生物海岸"],advancedPoints:["波浪折射与沿岸输沙：CERC 公式 Q = K H_b^(5/2) sin(2α_b)","海平面变化对海岸的影响：IPCC RCP 8.5 情景下2050年海面上升预测","三角洲形态分类：鸟足状（密西西比）、扇形（尼罗河）、尖头（长江）","海岸侵蚀与防护：硬工程（丁坝、防波堤）vs 软工程（海滩 nourish）","珊瑚礁/红树林海岸生态地貌反馈系统"],references:["Bird, E. (2008). Coastal Geomorphology: An Introduction. Wiley.","Komar, P.D. (1998). Beach Processes and Sedimentation. Prentice Hall.","王颖 (2013). 中国海洋地理. 科学出版社."],params:[{label:"波浪能通量 P",value:"P = ρgH²Cg/8"},{label:"沿岸输沙率",value:"10⁵-10⁶ m³/yr"},{label:"潮差类型",value:"0.5-8 m"}]}],Ge={class:"sandbox-root"},Oe={class:"sandbox-topbar"},Xe={class:"mode-tabs"},qe={class:"sandbox-body"},Ye={class:"module-panel"},Ue=["onClick"],$e={class:"module-icon"},Ke={class:"module-info"},Qe={class:"module-sub"},je={class:"viewport-toolbar"},Ze={class:"tool-item"},Je={key:0,class:"tool-item"},et={class:"info-panel"},tt={class:"panel-title"},ot={class:"panel-desc"},st={key:0,class:"knowledge-box"},nt={key:1,class:"knowledge-box professional"},it={key:0,class:"ref-section"},at={key:1,class:"param-section"},rt={class:"param-label"},lt={class:"param-val"},ct={class:"glossary-term"},ut={class:"glossary-def"},dt={__name:"SandboxApp",props:{embedded:{type:Boolean,default:!1}},emits:["close"],setup(o){se(k=>({v7e301553:o.embedded?"calc(100vh - 160px)":"calc(100vh - 96px)"}));const t=S(null),e=S({x:0,y:0});function s(k,c){const E=c.target.getBoundingClientRect();e.value={x:Math.min(E.left,window.innerWidth-300),y:E.bottom+6},t.value=k}const a=S(null),n=S("simple"),l=S("karst"),h=S(0),m=S(.5),d=S(!0);let i=null;const f=oe(()=>I.find(k=>k.id===l.value)||I[0]);function x(k){l.value=k,i&&i.setModule(k)}function p(){i&&i.setTimeline(h.value)}function M(){i&&i.setClimateFactor(m.value)}function y(){d.value=!d.value,i&&i.setAutoRotate(d.value)}function w(){i&&(i.camera.position.set(5,4,6),i.controls.target.set(0,0,0),i.controls.update())}j(n,k=>{i&&i.setMode(k)}),Z(()=>{a.value&&(i=new We(a.value),i.setModule(l.value),window.addEventListener("resize",z))}),J(()=>{window.removeEventListener("resize",z),i&&i.dispose()});function z(){i&&i.resize()}return(k,c)=>{const E=ne("router-link");return g(),b("div",Ge,[u("div",Oe,[o.embedded?(g(),b("button",{key:0,class:"back-link",onClick:c[0]||(c[0]=v=>k.$emit("close"))},"← 返回课文")):(g(),W(E,{key:1,to:"/",class:"back-link"},{default:ie(()=>[...c[7]||(c[7]=[ae("← 返回首页",-1)])]),_:1})),u("div",Xe,[u("button",{class:L(["mode-btn",{active:n.value==="simple"}]),onClick:c[1]||(c[1]=v=>n.value="simple")},"🔰 简单模式",2),u("button",{class:L(["mode-btn",{active:n.value==="professional"}]),onClick:c[2]||(c[2]=v=>n.value="professional")},"🎓 专业模式",2)]),c[8]||(c[8]=u("span",{class:"chapter-ref"},"第四章 · 地貌",-1))]),u("div",qe,[u("aside",Ye,[c[9]||(c[9]=u("h3",{class:"panel-title"},"地貌类型",-1)),(g(!0),b(F,null,D(G(I),v=>(g(),b("div",{key:v.id,class:L(["module-card",{active:v.id===l.value}]),onClick:V=>x(v.id)},[u("span",$e,C(v.icon),1),u("div",Ke,[u("strong",null,C(v.label),1),u("span",Qe,C(v.subtitle),1)])],10,Ue))),128))]),u("main",{class:"viewport-area",ref_key:"viewportRef",ref:a},[u("div",je,[u("label",Ze,[c[10]||(c[10]=u("span",{class:"tool-label"},"演变",-1)),O(u("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":c[3]||(c[3]=v=>h.value=v),onInput:p,class:"timeline-slider"},null,544),[[X,h.value,void 0,{number:!0}]])]),n.value==="professional"?(g(),b("label",Je,[c[11]||(c[11]=u("span",{class:"tool-label"},"气候",-1)),O(u("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":c[4]||(c[4]=v=>m.value=v),onInput:M,class:"climate-slider"},null,544),[[X,m.value,void 0,{number:!0}]])])):P("",!0),u("button",{class:"tool-btn",onClick:y},C(d.value?"⏸ 暂停":"▶ 旋转"),1),u("button",{class:"tool-btn",onClick:w},"⟲ 复位")]),c[12]||(c[12]=u("div",{class:"viewport-hint"},"拖拽旋转 · 滚轮缩放 · 右键平移",-1))],512),u("aside",et,[u("h3",tt,C(f.value.label),1),u("p",ot,C(f.value.description),1),n.value==="simple"?(g(),b("div",st,[c[13]||(c[13]=u("h4",null,"📖 教材要点",-1)),u("ul",null,[(g(!0),b(F,null,D(f.value.keyPoints,v=>(g(),b("li",{key:v},C(v),1))),128))])])):P("",!0),n.value==="professional"?(g(),b("div",nt,[c[16]||(c[16]=u("h4",null,"📚 学术扩展",-1)),u("ul",null,[(g(!0),b(F,null,D(f.value.advancedPoints,(v,V)=>(g(),b("li",{key:V},[re(ye,{text:v,glossary:G(Me),onShowTerm:s},null,8,["text","glossary"])]))),128))]),f.value.references?(g(),b("div",it,[c[14]||(c[14]=u("h4",null,"📎 参考文献",-1)),(g(!0),b(F,null,D(f.value.references,v=>(g(),b("p",{key:v,class:"ref-item"},C(v),1))),128))])):P("",!0),f.value.params?(g(),b("div",at,[c[15]||(c[15]=u("h4",null,"⚙ 关键参数",-1)),(g(!0),b(F,null,D(f.value.params,v=>(g(),b("div",{key:v.label,class:"param-row"},[u("span",rt,C(v.label),1),u("span",lt,C(v.value),1)]))),128))])):P("",!0)])):P("",!0)])]),(g(),W(te,{to:"body"},[t.value?(g(),b("div",{key:0,class:"glossary-mask",onClick:c[5]||(c[5]=v=>t.value=null)})):P("",!0),t.value?(g(),b("div",{key:1,class:"glossary-popup",style:ee({top:e.value.y+"px",left:e.value.x+"px"})},[u("h4",ct,C(t.value.term),1),u("p",ut,C(t.value.explanation),1),u("button",{class:"glossary-close",onClick:c[6]||(c[6]=v=>t.value=null)},"✕")],4)):P("",!0)]))])}}},gt=we(dt,[["__scopeId","data-v-29d6115d"]]);export{gt as default};
