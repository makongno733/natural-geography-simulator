import{w as G,G as Y,N as U,y,z as d,J as K,K as N,H as z,I as P,u as Q,O as L,Q as T,E as R,D as w,b as S,c as $,R as j,v as Z,x as M,B as J,C as ee}from"./vendor-core-BJlbzHlD.js";import{S as te,D as q,V as E,W as oe,P as ne,A as se,C as ie,a as ae,b as re,c as le,d as I,F as ce,O as ue,e as V,B as de,M as W,f as he,g as O}from"./vendor-three-_M0G6gNy.js";import{_ as me}from"./index-DNuogKqy.js";import"./vendor-vue-69s57yd4.js";function F(o,t){return fe(Math.sin(o*127.1+t*311.7)*43758.5453)}function fe(o){return o-Math.floor(o)}function B(o,t,e){return o+(t-o)*e}function C(o,t,e){return Math.max(t,Math.min(e,o))}function ve(o,t){const e=Math.floor(o),n=Math.floor(t),a=o-e,s=t-n,c=a*a*(3-2*a),i=s*s*(3-2*s),u=F(e,n),m=F(e+1,n),h=F(e,n+1),v=F(e+1,n+1);return B(B(u,m,c),B(h,v,c),i)}function D(o,t,e=3){let n=0,a=.6,s=1;for(let c=0;c<e;c++)n+=a*ve(o*s,t*s),s*=2,a*=.5;return n}function pe(o,t,e=3){const n=D(o,t,e)*2-1,a=D(o+5.2,t+1.3,e)*2-1;return D(o+n*.3,t+a*.3,e)}function r(o,t,e){return[Math.round(B(o[0],t[0],e)),Math.round(B(o[1],t[1],e)),Math.round(B(o[2],t[2],e))]}const ge={modifyHeight(o,t,e,n,a){const s=Math.sin(o*8+t*5)*.5+Math.sin(o*3-t*7)*.3,c=Math.sin(o*12+t*3+.8)*.08*(.3+n*.7),i=-Math.abs(s)*.12*(.2+n*.8),u=Math.sin(t*6+o*2+n*2)*.15,m=-Math.exp(-Math.pow((o-.5+u)/.04,2))*.1*(.3+n*.5),x=Math.pow((o-.75)/.1,2)+Math.pow((t-.2)/.08,2),p=Math.exp(-x*2)*.12*(.2+n*.6),b=Math.sin(o*15+t*10)*.02*(1-Math.exp(-n*3)),g=.6+a*.4,l=Math.sin(o*14+t*12)*.03*g;return e+c+i*g+m+p+b+l},getColor(o,t){const e=C(o,0,1);return e<.05?r([30,55,70],[40,75,85],e/.05):e<.12?r([40,75,85],[60,110,80],(e-.05)/.07):e<.3?r([60,110,80],[80,140,70],(e-.12)/.18):e<.5?r([80,140,70],[95,145,60],(e-.3)/.2):e<.7?r([95,145,60],[130,120,65],(e-.5)/.2):r([130,120,65],[180,170,150],(e-.7)/.3)},getFeatureName(o){const t=["V形谷","冲积扇","河曲","牛轭湖","三角洲","阶地"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[-.1,.02,.04]}},xe={modifyHeight(o,t,e,n,a){const s=o+t*.6,c=Math.atan(s*6)*.18,i=Math.sin(o*5+t*3+n*.4)*.12,u=Math.sin(o*8-t*5+1.2)*.06,h=Math.exp(-Math.pow((o-.3)/.15,2)-Math.pow((t-.5)/.2,2))*(.4+n*.3);return e+c+i+u+h},getColor(o,t){const e=C(o,0,1);return e<.15?r([38,28,18],[78,55,32],e/.15):e<.35?r([78,55,32],[140,95,50],(e-.15)/.2):e<.55?r([140,95,50],[185,130,60],(e-.35)/.2):e<.75?r([185,130,60],[160,120,85],(e-.55)/.2):r([160,120,85],[210,200,185],(e-.75)/.25)},getFeatureName(o){const t=["断层崖","褶皱山","断块山","裂谷","不整合"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[0,0,0]}},be={modifyHeight(o,t,e,n,a){const s=.15+n*.3,c=o*2-1,i=t*2-1,m=-Math.exp(-Math.pow((i-.1*c)/.12,2))*s*(1+Math.pow(Math.abs(i-.1*c)/.22,3)),x=Math.pow((o-.65)/.08,2)+Math.pow((t-.25)/.06,2),p=-Math.exp(-x*3)*.3*(1-Math.exp(-x*8)),b=Math.exp(-Math.pow((o-.35)/.06,2)-Math.pow((t-.7)/.05,2))*.45,g=Math.sin(o*14+t*10)*.04*(.5+n*.5);return e+m+p+b+g},getColor(o,t){const e=C(o,0,1),n=C(t,0,1);return e<.1?r([25,35,45],[35,50,55],e/.1):e<.25?r([35,50,55],[55,65,60],(e-.1)/.15):e<.45?r([55,65,60],[90,75,65],(e-.25)/.2):e<.7?r([90,75,65],[110,95,85],(e-.45)/.25):n>.5?r([110,95,85],[150,145,140],(e-.7)/.3):r([110,95,85],[200,210,220],(e-.7)/.3)},getFeatureName(o){const t=["U 形谷","冰斗","刃脊","冰碛垄","峡湾","角峰"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[0,-.06,-.08]}},Me={modifyHeight(o,t,e,n,a){const s=o*2-1,c=-.2-n*.15,i=Math.abs(s+.1),u=-Math.exp(-i*i*80)*.15,m=Math.exp(-i*i*120)*.08,h=Math.sin(o*12+t*8)*.03*Math.exp(-i*15);return c+e*.7+u+m+h},getColor(o,t){const e=C(o,0,1);return e<.08?r([20,50,85],[30,70,100],e/.08):e<.2?r([30,70,100],[60,100,110],(e-.08)/.12):e<.35?r([60,100,110],[180,155,105],(e-.2)/.15):e<.5?r([180,155,105],[100,140,90],(e-.35)/.15):r([100,140,90],[60,100,60],(e-.5)/.5)},getFeatureName(o){const t=["海蚀崖/台","海滩","沙嘴/沙坝","三角洲","河口湾"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[-.18,-.05,-.02]}},ye={modifyHeight(o,t,e,n,a){const s=e*.35,c=o*8+t*3,i=Math.sin(c)*.08,u=Math.sin(o*16-t*6+.5)*.04,m=pe(o*5,t*3,2)*.12,h=Math.sin(o*20+t*2)*.03,v=Math.exp(-Math.pow((o-.7)/.04,2)-Math.pow((t-.5)/.03,2))*.18;return s+i+u+m*(.5+n*.5)+h+v},getColor(o,t){const e=C(o,0,1);return e<.15?r([140,115,70],[170,135,80],e/.15):e<.35?r([170,135,80],[190,150,85],(e-.15)/.2):e<.55?r([190,150,85],[155,120,70],(e-.35)/.2):e<.75?r([155,120,70],[120,90,55],(e-.55)/.2):r([120,90,55],[160,145,125],(e-.75)/.25)},getFeatureName(o){const t=["沙丘","雅丹","黄土","风棱石","风蚀盆地"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[-.12,-.06,.02]}},we={modifyHeight(o,t,e,n,a){const s=e*.8;let c=0;const i=[[.15,.25],[.3,.7],[.55,.2],[.7,.6],[.45,.45],[.85,.35],[.2,.8]];for(const[h,v]of i){const x=(o-h)/.04,p=(t-v)/.035,b=Math.sqrt(x*x+p*p),g=Math.exp(-b*1.2)*.35/(1+b*b);g>.01&&(c+=g)}let u=0;const m=[[.4,.35],[.6,.45],[.3,.55],[.75,.7]];for(const[h,v]of m){const x=(o-h)/.025,p=(t-v)/.025,b=x*x+p*p;u-=Math.exp(-b*5)*.12}return s+c*(.5+n*.5)+u},getColor(o,t){const e=C(o,0,1);return e<.1?r([25,55,30],[55,90,50],e/.1):e<.3?r([55,90,50],[85,120,65],(e-.1)/.2):e<.55?r([85,120,65],[140,130,100],(e-.3)/.25):e<.75?r([140,130,100],[160,145,120],(e-.55)/.2):r([160,145,120],[185,175,165],(e-.75)/.25)},getFeatureName(o){const t=["峰林","溶斗/天坑","溶洞","坡立谷","地下河"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[-.04,-.02,0]}},Ce={modifyHeight(o,t,e,n,a){let s=0;const c=[[.45,.5],[.7,.35],[.3,.65],[.6,.7],[.8,.5]];for(let u=0;u<c.length;u++){const[m,h]=c[u],v=(o-m)/.06,x=(t-h)/.06,p=Math.sqrt(v*v+x*x),b=.4-u*.06,g=b*Math.exp(-p*1.8)/(1+p*p*2);if(s+=g*(.5+n*.5),p<.3){const l=-b*.3*Math.exp(-p*p*12);s+=l*(.5+n*.5)}}const i=Math.sin(o*8+t*5)*.03*(.5+n*.5);return e*.5+s+i},getColor(o,t){const e=C(o,0,1);return e<.1?r([15,15,20],[25,20,25],e/.1):e<.3?r([25,20,25],[45,30,28],(e-.1)/.2):e<.5?r([45,30,28],[80,45,35],(e-.3)/.2):e<.7?r([80,45,35],[120,70,40],(e-.5)/.2):r([120,70,40],[160,140,120],(e-.7)/.3)},getFeatureName(o){const t=["盾状火山","层状火山","破火山口","熔岩高原","火山颈"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[.02,.06,.04]}},ke={modifyHeight(o,t,e,n,a){const s=Math.sin(o*6+t*4)*.5+.5,c=s*Math.sin(o*12+t*8)*.06*(.3+n*.5),u=(1-s)*D(o*6,t*6,2)*.08,h=(e>.3?1:0)*Math.sin(o*15+t*12)*.04;return e+c+u+h},getColor(o,t){const e=C(o,0,1);return e<.1?r([20,60,30],[40,85,45],e/.1):e<.3?r([40,85,45],[85,135,70],(e-.1)/.2):e<.5?r([85,135,70],[145,125,60],(e-.3)/.2):e<.7?r([145,125,60],[100,75,45],(e-.5)/.2):r([100,75,45],[190,195,200],(e-.7)/.3)},getFeatureName(o){const t=["冰缘地貌","气候-河流","干旱区","湿润区","第四纪气候"];return t[Math.min(t.length-1,Math.floor(o*t.length))]},getColorBias(){return[-.02,0,0]}},H={fluvial:ge,structural:xe,glacial:be,coastal:Me,aeolian:ye,karst:we,volcanic:Ce,climate:ke};function _e(o,t,e,n,a,s){const c=H[o];return c?c.modifyHeight(t,e,n,a,s):n}function Se(o,t,e){const n=H[o];return n?n.getColor(t,e):null}function Be(o,t){const e=H[o];return e?e.getFeatureName(t):""}function ze(o){const t=H[o];return!t||!t.getColorBias?[0,0,0]:t.getColorBias()}const Pe=`
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
`,Re=`
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
`;function Fe({minHeight:o,maxHeight:t,weatherFactor:e=0,sunDirection:n=new E(.5,.8,.3),biomeBias:a=new E(0,0,0),time:s=0,clippingPlanes:c=[]}={}){return new te({uniforms:{uMinHeight:{value:o??0},uMaxHeight:{value:t??1},uWeatherFactor:{value:e},uSunDirection:{value:n},uBiomeBias:{value:a},uTime:{value:s}},vertexShader:Pe,fragmentShader:Re,clippingPlanes:c,side:q,roughness:.9,metalness:.02})}const X={simple:128,professional:200},k=4;class De{constructor(t){this.container=t,this.modules=["karst","fluvial","aeolian","coastal"],this.activeModule="karst",this.mode="simple",this.timeline=0,this.climateFactor=.5,this.annotations=[],this.autoRotate=!0,this._initRenderer(),this._initLabelRenderer(),this._initScene(),this._initLights(),this._initControls(),this._initTerrain(),this._animate()}_initRenderer(){this.renderer=new oe({antialias:!0,alpha:!0}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,2)),this.renderer.setClearColor(16117736,1),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=ne,this.renderer.toneMapping=se,this.renderer.toneMappingExposure=1.2,this.container.appendChild(this.renderer.domElement)}_initLabelRenderer(){this.labelRenderer=new ie,this.labelRenderer.setSize(this.container.clientWidth,this.container.clientHeight),this.labelRenderer.domElement.style.position="absolute",this.labelRenderer.domElement.style.top="0",this.labelRenderer.domElement.style.left="0",this.labelRenderer.domElement.style.pointerEvents="none",this.container.appendChild(this.labelRenderer.domElement)}_initScene(){this.scene=new ae,this.camera=new re(40,this.container.clientWidth/this.container.clientHeight,.1,50),this.camera.position.set(5,4,6),this.camera.lookAt(0,0,0)}_initLights(){const t=new le(8952234,.4);this.scene.add(t);const e=new I(16772829,1.8);e.position.set(8,15,5),e.castShadow=!0,e.shadow.mapSize.set(2048,2048),e.shadow.camera.near=.1,e.shadow.camera.far=30,e.shadow.camera.left=-8,e.shadow.camera.right=8,e.shadow.camera.top=8,e.shadow.camera.bottom=-8,this.scene.add(e),this.sun=e;const n=new I(8947967,.3);n.position.set(-5,3,-5),this.scene.add(n),this.scene.fog=new ce(16117736,8,14)}_initControls(){this.controls=new ue(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.08,this.controls.minDistance=1.5,this.controls.maxDistance=14,this.controls.maxPolarAngle=Math.PI/2.1,this.controls.target.set(0,0,0),this.controls.autoRotate=!0,this.controls.autoRotateSpeed=.8}_initTerrain(){this._buildTerrain()}_buildTerrain(){this.terrain&&(this.scene.remove(this.terrain),this.terrain.geometry.dispose(),this.terrain.material.dispose()),this._clearAnnotations();const t=X[this.mode]||X.simple,e=new V(k,k,t,t);e.rotateX(-Math.PI/2);const n=e.attributes.position,a=new Float32Array(n.count*3),s=this._toModuleId(this.activeModule);let c=1/0,i=-1/0;for(let h=0;h<n.count;h++){const v=n.getX(h),x=n.getZ(h),p=(v+k/2)/k,b=(x+k/2)/k,g=this._baseHeight(p,b),l=_e(s,p,b,g,this.timeline,this.climateFactor);n.setY(h,l),l<c&&(c=l),l>i&&(i=l);const _=Se(s,l,0);_&&(a[h*3]=_[0]/255,a[h*3+1]=_[1]/255,a[h*3+2]=_[2]/255)}n.needsUpdate=!0,e.computeVertexNormals(),e.setAttribute("color",new de(a,3));const u=ze(s),m=Fe({minHeight:c,maxHeight:i,sunDirection:this.sun?.position.clone().normalize()||new E(.5,.8,.3),biomeBias:new E(u[0],u[1],u[2])});this.terrain=new W(e,m),this.terrain.receiveShadow=!0,this.terrain.castShadow=!0,this.scene.add(this.terrain),this._addWaterPlane(),this._addAnnotations()}_baseHeight(t,e){const n=Math.sin(t*3.7+e*2.1)*.15,a=Math.sin(t*5.2-e*4.3+1.8)*.08,s=Math.sin((t+.3)*8+(e-.2)*6)*.04;return .15+n+a+s}_toModuleId(t){return{karst:"karst",fluvial:"fluvial",aeolian:"aeolian",coastal:"coastal",structural:"structural",glacial:"glacial",volcanic:"volcanic"}[t]||"fluvial"}_addWaterPlane(){if(this.water&&(this.scene.remove(this.water),this.water.geometry.dispose(),this.water.material.dispose()),this.activeModule==="aeolian")return;const t=new V(k*1.2,k*1.2);t.rotateX(-Math.PI/2);const e=new he({color:3832997,transparent:!0,opacity:.35,roughness:.1,metalness:.3,side:q});this.water=new W(t,e),this.water.position.y=-.08,this.water.receiveShadow=!0,this.scene.add(this.water)}_addAnnotations(){const t=this._toModuleId(this.activeModule),e=Be(t,this.timeline);if(!e)return;const n=this.terrain.geometry.attributes.position;let a=-1/0,s=0;for(let v=0;v<n.count;v+=10){const x=n.getY(v);x>a&&(a=x,s=v)}const c=n.getX(s),i=n.getZ(s),u=n.getY(s)+.3,m=document.createElement("div");m.textContent=e,m.style.color="#fff",m.style.background="rgba(139, 28, 28, 0.85)",m.style.padding="4px 10px",m.style.borderRadius="4px",m.style.fontSize="13px",m.style.fontWeight="600",m.style.pointerEvents="none",m.style.whiteSpace="nowrap";const h=new O(m);h.position.set(c,u,i),this.scene.add(h),this.annotations.push(h),this.mode==="professional"&&this._addSecondaryLabels(t)}_addSecondaryLabels(t){const e=this._getSecondaryLabels(t);for(const n of e){const a=document.createElement("div");a.textContent=n.text,a.style.color="#e8d5c4",a.style.background="rgba(60, 40, 30, 0.78)",a.style.padding="2px 8px",a.style.borderRadius="3px",a.style.fontSize="11px",a.style.border="1px solid rgba(200,160,120,0.4)";const s=new O(a);s.position.set(n.x,n.y,n.z),this.scene.add(s),this.annotations.push(s)}}_getSecondaryLabels(t){return{karst:[{text:"峰林",x:-.6,y:.5,z:-.5},{text:"溶斗",x:.3,y:-.05,z:.3},{text:"溶洞",x:.8,y:.1,z:-.3}],fluvial:[{text:"V形谷",x:-.8,y:.1,z:0},{text:"冲积扇",x:.6,y:.05,z:-.5},{text:"河曲",x:0,y:.05,z:.7}],aeolian:[{text:"沙丘",x:-.4,y:.15,z:-.2},{text:"雅丹",x:.5,y:.1,z:.4},{text:"风蚀柱",x:-.6,y:.2,z:.5}],coastal:[{text:"海蚀崖",x:-.8,y:.15,z:0},{text:"海滩",x:.2,y:-.02,z:.6},{text:"三角洲",x:.7,y:.02,z:-.3}]}[t]||[]}_clearAnnotations(){for(const t of this.annotations)this.scene.remove(t);this.annotations=[]}setModule(t){t!==this.activeModule&&(this.activeModule=t,this._buildTerrain(),this.setAutoRotate(this.autoRotate))}setMode(t){t!==this.mode&&(this.mode=t,this._buildTerrain(),this.setAutoRotate(this.autoRotate))}setTimeline(t){this.timeline=t,this._buildTerrain()}setClimateFactor(t){this.climateFactor=t,this._buildTerrain()}setAutoRotate(t){this.autoRotate=t,this.controls.autoRotate=t}resize(){const t=this.container.clientWidth,e=this.container.clientHeight;this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,e),this.labelRenderer.setSize(t,e)}dispose(){this.renderer.dispose(),this.labelRenderer.domElement.remove(),this.controls.dispose()}_animate(){this._raf=requestAnimationFrame(()=>this._animate()),this.controls.update(),this.renderer.render(this.scene,this.camera),this.labelRenderer.render(this.scene,this.camera)}}const A=[{id:"karst",icon:"🕳",label:"喀斯特地貌",subtitle:"岩溶地貌 · 桂林山水",description:"喀斯特地貌是可溶性岩石（以石灰岩为主）受地表水、地下水的溶蚀作用所形成的各种地貌。我国广西、贵州、云南等地最为典型。",keyPoints:["溶蚀作用：含 CO₂ 的水对石灰岩的化学溶解过程","地表形态：溶沟、洼地、峰丛、峰林、孤峰、残丘","地下形态：溶洞、石钟乳、石笋、石柱、地下河","分布：桂、黔、滇碳酸盐岩出露地区"],advancedPoints:["岩溶动力系统：CO₂-H₂O-CaCO₃ 三相平衡与溶蚀速率","岩溶地貌演化序列：溶沟→洼地→峰丛→峰林→孤峰→残丘（Davis 循环）","表层岩溶带（Epikarst）对地下水调蓄的关键作用","石漠化：植被破坏→水土流失→基岩裸露的退化过程","岩溶碳汇效应：全球碳酸盐岩风化对 CO₂ 循环的贡献"],references:["Ford, D.C. & Williams, P. (2007). Karst Hydrogeology and Geomorphology. Wiley.","Yuan, D. (1997). Sensitivity of karst process to environmental change. Episodes, 20(2), 88-92."],params:[{label:"CaCO₃ 溶解度",value:"15-50 mg/L"},{label:"溶蚀速率",value:"0.01-0.5 mm/yr"},{label:"峰林坡角",value:"45°-90°"}]},{id:"fluvial",icon:"🏞",label:"河流地貌",subtitle:"流水侵蚀与堆积",description:"河流通过侵蚀、搬运和堆积作用塑造地表形态。上游形成 V 形谷，中游发育河曲，下游形成冲积平原和三角洲。",keyPoints:["侵蚀类型：下蚀（V形谷）、侧蚀（河曲）、溯源侵蚀","堆积地貌：冲积扇、河漫滩、三角洲、冲积平原","河流发育阶段：青年期（下蚀）→ 壮年期（侧蚀）→ 老年期（堆积）","河流地貌与人类活动：农业、聚落、交通选址"],advancedPoints:["水力几何关系（Leopold & Maddock）：宽深比与流量幂律","侵蚀循环理论（Davis）：幼年→壮年→老年地形序列","河流纵剖面均衡理论（Strahler 面积-高程分析）","河型分类：顺直、曲流、辫状、网状——水沙条件控制","输沙率公式：Bagnold / Einstein 床沙质输移模型"],references:["Leopold, L.B., Wolman, M.G. & Miller, J.P. (1992). Fluvial Processes in Geomorphology. Dover.","Knighton, D. (1998). Fluvial Forms and Processes. Arnold.","Strahler, A.N. (1957). Quantitative analysis of watershed geomorphology. Eos, 38(6), 913-920."],params:[{label:"曼宁系数 n",value:"0.025-0.05"},{label:"推移质输沙率",value:"10⁻³-10⁻¹ kg/s·m"},{label:"河流坡度",value:"0.001-0.01"}]},{id:"aeolian",icon:"🏜",label:"风沙地貌",subtitle:"风力侵蚀与堆积",description:"风沙地貌是风力对地表物质的侵蚀、搬运和堆积所形成的各种地貌形态，主要分布在干旱和半干旱地区。",keyPoints:["风蚀地貌：雅丹（风蚀垄槽）、风蚀柱、风蚀蘑菇、风蚀洼地","风积地貌：沙丘（新月形沙丘、纵向沙垄、金字塔沙丘）","沙丘移动：迎风坡缓（5°-15°）、背风坡陡（30°-34°）","黄土：风力搬运堆积形成，主要分布在黄土高原"],advancedPoints:["沙粒起动阈值风速：Bagnold 公式 u*_t = A √(gd(ρs-ρ)/ρ)","沙丘形态动力学：迎风坡流速加速→侵蚀，背风坡分离→堆积","雅丹发育与风蚀速率：实测年均风蚀深度 0.1-5 cm","腾格里/巴丹吉林沙漠形成演化与第四纪气候","粉尘循环（Dust Cycle）：亚洲粉尘对全球气候的反馈效应"],references:["Bagnold, R.A. (1941). The Physics of Blown Sand and Desert Dunes. Methuen.","Pye, K. & Tsoar, H. (2009). Aeolian Sand and Sand Dunes. Springer.","张克存等 (2020). 中国沙漠风沙地貌学. 科学出版社."],params:[{label:"起动风速",value:"5-6 m/s (2m高)"},{label:"输沙率 Q",value:"Q ∝ u*³"},{label:"沙丘移动速率",value:"5-20 m/yr"}]},{id:"coastal",icon:"🌊",label:"海岸地貌",subtitle:"海浪与潮流塑造",description:"海岸地貌是在波浪、潮汐、海流等海洋动力作用下形成的各种地貌形态，包括侵蚀型和堆积型两大类。",keyPoints:["海蚀地貌：海蚀崖、海蚀平台、海蚀洞、海蚀拱桥、海蚀柱","海积地貌：海滩（砾滩/砂滩/泥滩）、沙嘴、沙坝、潟湖","三角洲：河流与海洋共同作用形成的堆积体","海岸类型：基岩海岸、砂质海岸、淤泥质海岸、生物海岸"],advancedPoints:["波浪折射与沿岸输沙：CERC 公式 Q = K H_b^(5/2) sin(2α_b)","海平面变化对海岸的影响：IPCC RCP 8.5 情景下2050年海面上升预测","三角洲形态分类：鸟足状（密西西比）、扇形（尼罗河）、尖头（长江）","海岸侵蚀与防护：硬工程（丁坝、防波堤）vs 软工程（海滩 nourish）","珊瑚礁/红树林海岸生态地貌反馈系统"],references:["Bird, E. (2008). Coastal Geomorphology: An Introduction. Wiley.","Komar, P.D. (1998). Beach Processes and Sedimentation. Prentice Hall.","王颖 (2013). 中国海洋地理. 科学出版社."],params:[{label:"波浪能通量 P",value:"P = ρgH²Cg/8"},{label:"沿岸输沙率",value:"10⁵-10⁶ m³/yr"},{label:"潮差类型",value:"0.5-8 m"}]}],Ee={class:"sandbox-root"},He={class:"sandbox-topbar"},Ne={class:"mode-tabs"},Ae={class:"sandbox-body"},Le={class:"module-panel"},Te=["onClick"],Ie={class:"module-icon"},Ve={class:"module-info"},We={class:"module-sub"},Oe={class:"viewport-toolbar"},Xe={class:"tool-item"},qe={key:0,class:"tool-item"},Ge={class:"info-panel"},Ye={class:"panel-title"},Ue={class:"panel-desc"},Ke={key:0,class:"knowledge-box"},Qe={key:1,class:"knowledge-box professional"},$e={key:0,class:"ref-section"},je={key:1,class:"param-section"},Ze={class:"param-label"},Je={class:"param-val"},et={__name:"SandboxApp",props:{embedded:{type:Boolean,default:!1}},emits:["close"],setup(o){j(g=>({e10f9952:o.embedded?"calc(100vh - 160px)":"calc(100vh - 96px)"}));const t=S(null),e=S("simple"),n=S("karst"),a=S(0),s=S(.5),c=S(!0);let i=null;const u=$(()=>A.find(g=>g.id===n.value)||A[0]);function m(g){n.value=g,i&&i.setModule(g)}function h(){i&&i.setTimeline(a.value)}function v(){i&&i.setClimateFactor(s.value)}function x(){c.value=!c.value,i&&i.setAutoRotate(c.value)}function p(){i&&(i.camera.position.set(5,4,6),i.controls.target.set(0,0,0),i.controls.update())}G(e,g=>{i&&i.setMode(g)}),Y(()=>{t.value&&(i=new De(t.value),i.setModule(n.value),window.addEventListener("resize",b))}),U(()=>{window.removeEventListener("resize",b),i&&i.dispose()});function b(){i&&i.resize()}return(g,l)=>{const _=Z("router-link");return M(),y("div",Ee,[d("div",He,[o.embedded?(M(),y("button",{key:0,class:"back-link",onClick:l[0]||(l[0]=f=>g.$emit("close"))},"← 返回课文")):(M(),K(_,{key:1,to:"/",class:"back-link"},{default:J(()=>[...l[5]||(l[5]=[ee("← 返回首页",-1)])]),_:1})),d("div",Ne,[d("button",{class:N(["mode-btn",{active:e.value==="simple"}]),onClick:l[1]||(l[1]=f=>e.value="simple")},"🔰 简单模式",2),d("button",{class:N(["mode-btn",{active:e.value==="professional"}]),onClick:l[2]||(l[2]=f=>e.value="professional")},"🎓 专业模式",2)]),l[6]||(l[6]=d("span",{class:"chapter-ref"},"第四章 · 地貌",-1))]),d("div",Ae,[d("aside",Le,[l[7]||(l[7]=d("h3",{class:"panel-title"},"地貌类型",-1)),(M(!0),y(z,null,P(Q(A),f=>(M(),y("div",{key:f.id,class:N(["module-card",{active:f.id===n.value}]),onClick:tt=>m(f.id)},[d("span",Ie,w(f.icon),1),d("div",Ve,[d("strong",null,w(f.label),1),d("span",We,w(f.subtitle),1)])],10,Te))),128))]),d("main",{class:"viewport-area",ref_key:"viewportRef",ref:t},[d("div",Oe,[d("label",Xe,[l[8]||(l[8]=d("span",{class:"tool-label"},"演变",-1)),L(d("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":l[3]||(l[3]=f=>a.value=f),onInput:h,class:"timeline-slider"},null,544),[[T,a.value,void 0,{number:!0}]])]),e.value==="professional"?(M(),y("label",qe,[l[9]||(l[9]=d("span",{class:"tool-label"},"气候",-1)),L(d("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":l[4]||(l[4]=f=>s.value=f),onInput:v,class:"climate-slider"},null,544),[[T,s.value,void 0,{number:!0}]])])):R("",!0),d("button",{class:"tool-btn",onClick:x},w(c.value?"⏸ 暂停":"▶ 旋转"),1),d("button",{class:"tool-btn",onClick:p},"⟲ 复位")]),l[10]||(l[10]=d("div",{class:"viewport-hint"},"拖拽旋转 · 滚轮缩放 · 右键平移",-1))],512),d("aside",Ge,[d("h3",Ye,w(u.value.label),1),d("p",Ue,w(u.value.description),1),e.value==="simple"?(M(),y("div",Ke,[l[11]||(l[11]=d("h4",null,"📖 教材要点",-1)),d("ul",null,[(M(!0),y(z,null,P(u.value.keyPoints,f=>(M(),y("li",{key:f},w(f),1))),128))])])):R("",!0),e.value==="professional"?(M(),y("div",Qe,[l[14]||(l[14]=d("h4",null,"📚 学术扩展",-1)),d("ul",null,[(M(!0),y(z,null,P(u.value.advancedPoints,f=>(M(),y("li",{key:f},w(f),1))),128))]),u.value.references?(M(),y("div",$e,[l[12]||(l[12]=d("h4",null,"📎 参考文献",-1)),(M(!0),y(z,null,P(u.value.references,f=>(M(),y("p",{key:f,class:"ref-item"},w(f),1))),128))])):R("",!0),u.value.params?(M(),y("div",je,[l[13]||(l[13]=d("h4",null,"⚙ 关键参数",-1)),(M(!0),y(z,null,P(u.value.params,f=>(M(),y("div",{key:f.label,class:"param-row"},[d("span",Ze,w(f.label),1),d("span",Je,w(f.value),1)]))),128))])):R("",!0)])):R("",!0)])])])}}},at=me(et,[["__scopeId","data-v-b05f0e6f"]]);export{at as default};
