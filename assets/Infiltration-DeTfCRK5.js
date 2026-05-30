const t=[{title:"准备实验材料",content:"准备 3 个浅盘（或切开的塑料瓶底部），分别装入：干燥沙土、普通园土、种草皮的有植被土。每个盘下方放一个收集容器。准备一个洒水壶模拟降雨。",highlight:"三个盘的表面积和土层厚度应尽量一致，以控制变量。",illustration:`<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="trayGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f5f0e8"/>
      <stop offset="100%" stop-color="#d4c8b0"/>
    </linearGradient>
    <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0d890"/>
      <stop offset="40%" stop-color="#e8c870"/>
      <stop offset="100%" stop-color="#d4a840"/>
    </linearGradient>
    <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8b6914"/>
      <stop offset="100%" stop-color="#6b4f10"/>
    </linearGradient>
    <linearGradient id="grassSoilGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5a8c3f"/>
      <stop offset="100%" stop-color="#3d6828"/>
    </linearGradient>
    <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(180,210,235,0.35)"/>
      <stop offset="50%" stop-color="rgba(220,240,255,0.15)"/>
      <stop offset="100%" stop-color="rgba(180,210,235,0.35)"/>
    </linearGradient>
    <linearGradient id="canBody" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7eb8da"/>
      <stop offset="40%" stop-color="#5a9cc0"/>
      <stop offset="100%" stop-color="#3d7a9e"/>
    </linearGradient>
    <linearGradient id="canSpout" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#5a9cc0"/>
      <stop offset="100%" stop-color="#3d7a9e"/>
    </linearGradient>
    <filter id="dropShadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1.5" dy="2" stdDeviation="2.5" flood-color="#00000033"/>
    </filter>
    <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#00000022"/>
    </filter>
    <pattern id="sandDots" patternUnits="userSpaceOnUse" width="8" height="6">
      <circle cx="1" cy="1" r="0.6" fill="#c89830" opacity="0.5"/>
      <circle cx="5" cy="3" r="0.7" fill="#b88820" opacity="0.4"/>
      <circle cx="3" cy="4" r="0.5" fill="#d8a830" opacity="0.5"/>
      <circle cx="7" cy="1" r="0.6" fill="#c09028" opacity="0.45"/>
    </pattern>
    <pattern id="soilParticles" patternUnits="userSpaceOnUse" width="10" height="8">
      <rect x="2" y="1" width="2" height="1.5" rx="0.5" fill="#9b7020" opacity="0.4"/>
      <rect x="6" y="3" width="3" height="1.5" rx="0.5" fill="#7a5810" opacity="0.35"/>
      <rect x="4" y="5" width="2" height="1" rx="0.5" fill="#a07828" opacity="0.3"/>
      <rect x="8" y="6" width="1.5" height="1" rx="0.5" fill="#8a6018" opacity="0.35"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="500" height="300" fill="#fdfdfb" rx="8"/>

  <!-- === WATERING CAN (top center) === -->
  <g filter="url(#dropShadow)">
    <!-- Handle -->
    <path d="M235 25 Q235 5 260 5 Q285 5 285 25" fill="none" stroke="#3d7a9e" stroke-width="4.5" stroke-linecap="round"/>
    <!-- Body -->
    <rect x="215" y="22" width="90" height="45" rx="6" fill="url(#canBody)"/>
    <!-- Body highlight -->
    <rect x="220" y="27" width="15" height="35" rx="4" fill="rgba(255,255,255,0.15)"/>
    <!-- Spout -->
    <path d="M215 45 L185 30 L180 38 L215 52 Z" fill="url(#canSpout)"/>
    <!-- Rose (sprinkler head) -->
    <ellipse cx="180" cy="34" rx="6" ry="10" fill="#4a8ab0" stroke="#3d7a9e" stroke-width="1"/>
    <!-- Rose holes -->
    <circle cx="178" cy="30" r="0.8" fill="#b8d8ee"/>
    <circle cx="182" cy="32" r="0.8" fill="#b8d8ee"/>
    <circle cx="178" cy="34" r="0.8" fill="#b8d8ee"/>
    <circle cx="182" cy="36" r="0.8" fill="#b8d8ee"/>
    <circle cx="179" cy="38" r="0.8" fill="#b8d8ee"/>
    <!-- Water level line on body -->
    <rect x="220" y="40" width="80" height="25" rx="4" fill="rgba(100,170,220,0.3)"/>
  </g>
  <text x="260" y="82" text-anchor="middle" font-size="11" fill="#4a7a9a" font-weight="600">洒水壶（模拟降雨）</text>

  <!-- === TRAY 1: SAND === -->
  <g filter="url(#dropShadow)">
    <!-- Tray body -->
    <rect x="30" y="110" width="130" height="50" rx="5" fill="url(#trayGrad)" stroke="#b8a57a" stroke-width="1.5"/>
    <!-- Tray rim highlight -->
    <rect x="30" y="110" width="130" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
    <!-- Sand fill -->
    <rect x="36" y="118" width="118" height="22" rx="3" fill="url(#sandGrad)"/>
    <rect x="36" y="118" width="118" height="22" rx="3" fill="url(#sandDots)"/>
    <!-- Sand surface texture (irregular) -->
    <path d="M36 120 Q50 116 65 119 Q80 122 95 117 Q110 114 125 118 Q140 121 154 119" fill="none" stroke="#c89830" stroke-width="1" opacity="0.6"/>
  </g>

  <!-- Collection cylinder 1 -->
  <g filter="url(#softShadow)">
    <rect x="75" y="180" width="40" height="55" rx="4" fill="url(#glassGrad)" stroke="#a0c4d8" stroke-width="1.2"/>
    <!-- Measurement lines -->
    <line x1="85" y1="225" x2="100" y2="225" stroke="#a0c4d8" stroke-width="0.6"/>
    <line x1="85" y1="215" x2="95" y2="215" stroke="#a0c4d8" stroke-width="0.5"/>
    <line x1="85" y1="205" x2="95" y2="205" stroke="#a0c4d8" stroke-width="0.5"/>
    <line x1="85" y1="195" x2="95" y2="195" stroke="#a0c4d8" stroke-width="0.5"/>
    <!-- Pour spout -->
    <path d="M85 180 L82 172 L88 172 Z" fill="rgba(180,210,235,0.4)" stroke="#a0c4d8" stroke-width="0.8"/>
  </g>

  <!-- Leader line: watering can to tray -->
  <line x1="180" y1="55" x2="95" y2="118" stroke="#7a9ab0" stroke-width="0.8" stroke-dasharray="4,3" opacity="0.5"/>

  <!-- Label for sand -->
  <circle cx="95" cy="252" r="2.5" fill="#4a7a9a"/>
  <line x1="97" y1="252" x2="120" y2="268" stroke="#4a7a9a" stroke-width="0.8"/>
  <text x="170" y="273" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">沙土</text>
  <text x="170" y="288" text-anchor="middle" font-size="10" fill="#7a6a4a">孔隙大·渗透快</text>

  <!-- === TRAY 2: GARDEN SOIL === -->
  <g filter="url(#dropShadow)">
    <rect x="185" y="110" width="130" height="50" rx="5" fill="url(#trayGrad)" stroke="#b8a57a" stroke-width="1.5"/>
    <rect x="185" y="110" width="130" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
    <rect x="191" y="118" width="118" height="22" rx="3" fill="url(#soilGrad)"/>
    <rect x="191" y="118" width="118" height="22" rx="3" fill="url(#soilParticles)"/>
    <path d="M191 120 Q205 117 220 119 Q235 122 250 118 Q265 115 280 120 Q295 123 309 119" fill="none" stroke="#5a4010" stroke-width="1" opacity="0.5"/>
  </g>

  <g filter="url(#softShadow)">
    <rect x="230" y="180" width="40" height="55" rx="4" fill="url(#glassGrad)" stroke="#a0c4d8" stroke-width="1.2"/>
    <line x1="240" y1="225" x2="255" y2="225" stroke="#a0c4d8" stroke-width="0.6"/>
    <line x1="240" y1="215" x2="250" y2="215" stroke="#a0c4d8" stroke-width="0.5"/>
    <line x1="240" y1="205" x2="250" y2="205" stroke="#a0c4d8" stroke-width="0.5"/>
    <line x1="240" y1="195" x2="250" y2="195" stroke="#a0c4d8" stroke-width="0.5"/>
    <path d="M240 180 L237 172 L243 172 Z" fill="rgba(180,210,235,0.4)" stroke="#a0c4d8" stroke-width="0.8"/>
  </g>

  <circle cx="250" cy="252" r="2.5" fill="#4a7a9a"/>
  <line x1="252" y1="252" x2="265" y2="268" stroke="#4a7a9a" stroke-width="0.8"/>
  <text x="315" y="273" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">园土</text>
  <text x="315" y="288" text-anchor="middle" font-size="10" fill="#7a6a4a">孔隙适中·含有机质</text>

  <!-- === TRAY 3: GRASS SOIL === -->
  <g filter="url(#dropShadow)">
    <rect x="340" y="110" width="130" height="50" rx="5" fill="url(#trayGrad)" stroke="#b8a57a" stroke-width="1.5"/>
    <rect x="340" y="110" width="130" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
    <rect x="346" y="118" width="118" height="22" rx="3" fill="url(#grassSoilGrad)"/>
    <!-- Grass blades -->
    <path d="M350 118 Q352 105 348 96" stroke="#4a8c2f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M358 118 Q360 102 354 92" stroke="#5a9c3f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M366 118 Q365 104 362 95" stroke="#3d7a28" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M378 118 Q380 106 376 94" stroke="#4a8c2f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M388 118 Q387 103 384 93" stroke="#5a9c3f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M398 118 Q400 107 396 97" stroke="#3d7a28" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M410 118 Q412 104 407 92" stroke="#4a8c2f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M420 118 Q418 106 415 98" stroke="#5a9c3f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M430 118 Q432 103 427 95" stroke="#3d7a28" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M442 118 Q440 107 438 100" stroke="#4a8c2f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M452 118 Q454 105 449 96" stroke="#5a9c3f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M460 118 Q458 106 455 99" stroke="#3d7a28" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <!-- Small leaves -->
    <ellipse cx="352" cy="100" rx="4" ry="2" fill="#6aac4f" transform="rotate(-20 352 100)" opacity="0.8"/>
    <ellipse cx="400" cy="101" rx="4" ry="2" fill="#6aac4f" transform="rotate(15 400 101)" opacity="0.8"/>
    <ellipse cx="435" cy="100" rx="4" ry="2" fill="#6aac4f" transform="rotate(-10 435 100)" opacity="0.8"/>
  </g>

  <g filter="url(#softShadow)">
    <rect x="385" y="180" width="40" height="55" rx="4" fill="url(#glassGrad)" stroke="#a0c4d8" stroke-width="1.2"/>
    <line x1="395" y1="225" x2="410" y2="225" stroke="#a0c4d8" stroke-width="0.6"/>
    <line x1="395" y1="215" x2="405" y2="215" stroke="#a0c4d8" stroke-width="0.5"/>
    <line x1="395" y1="205" x2="405" y2="205" stroke="#a0c4d8" stroke-width="0.5"/>
    <line x1="395" y1="195" x2="405" y2="195" stroke="#a0c4d8" stroke-width="0.5"/>
    <path d="M395 180 L392 172 L398 172 Z" fill="rgba(180,210,235,0.4)" stroke="#a0c4d8" stroke-width="0.8"/>
  </g>

  <circle cx="405" cy="252" r="2.5" fill="#4a7a9a"/>
  <line x1="407" y1="252" x2="420" y2="268" stroke="#4a7a9a" stroke-width="0.8"/>
  <text x="470" y="273" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">草皮土</text>
  <text x="470" y="288" text-anchor="middle" font-size="10" fill="#7a6a4a">根系发达·植被拦截</text>

  <!-- Title -->
  <text x="250" y="302" text-anchor="middle" font-size="12" fill="#5a4a3a" font-weight="600" opacity="0.7">三盘土壤对比实验装置</text>
</svg>`},{title:"模拟降雨",content:"用洒水壶从相同高度、以相同速率向三个盘均匀洒水（模拟等量降雨）。观察水在三个盘表面的行为：沙土盘水迅速下渗，园土盘部分下渗部分形成水洼，草皮盘水被植被拦截缓慢下渗。",highlight:"下渗速率取决于土壤孔隙度、有机质含量和植被根系通道。沙土孔隙大但持水性差，黏土孔隙小但持水性强。",illustration:`<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rTrayGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f5f0e8"/>
      <stop offset="100%" stop-color="#d4c8b0"/>
    </linearGradient>
    <linearGradient id="rSandGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0d890"/>
      <stop offset="100%" stop-color="#d4a840"/>
    </linearGradient>
    <linearGradient id="rSoilGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8b6914"/>
      <stop offset="100%" stop-color="#6b4f10"/>
    </linearGradient>
    <linearGradient id="rGrassGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5a8c3f"/>
      <stop offset="100%" stop-color="#3d6828"/>
    </linearGradient>
    <linearGradient id="rWaterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(80,160,220,0.5)"/>
      <stop offset="100%" stop-color="rgba(40,120,200,0.7)"/>
    </linearGradient>
    <linearGradient id="rCanGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7eb8da"/>
      <stop offset="100%" stop-color="#3d7a9e"/>
    </linearGradient>
    <linearGradient id="rCollectedWater" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(70,150,210,0.55)"/>
      <stop offset="100%" stop-color="rgba(30,100,180,0.75)"/>
    </linearGradient>
    <filter id="rDropShadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1.5" dy="2" stdDeviation="2.5" flood-color="#00000033"/>
    </filter>
    <filter id="rGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#4a90c8"/>
    </marker>
    <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#3a8f5a"/>
    </marker>
    <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#e89820"/>
    </marker>
  </defs>

  <rect width="500" height="300" fill="#fdfdfb" rx="8"/>

  <!-- === WATERING CAN === -->
  <g filter="url(#rDropShadow)">
    <path d="M220 18 Q220 0 248 0 Q276 0 276 18" fill="none" stroke="#3d7a9e" stroke-width="4" stroke-linecap="round"/>
    <rect x="200" y="18" width="96" height="42" rx="6" fill="url(#rCanGrad)"/>
    <rect x="205" y="22" width="14" height="34" rx="3" fill="rgba(255,255,255,0.12)"/>
    <path d="M200 40 L168 28 L164 36 L200 48 Z" fill="#4a8ab0"/>
    <ellipse cx="164" cy="32" rx="5" ry="9" fill="#4a8ab0" stroke="#3d7a9e" stroke-width="1"/>
    <circle cx="162" cy="27" r="0.7" fill="#b8d8ee"/>
    <circle cx="166" cy="30" r="0.7" fill="#b8d8ee"/>
    <circle cx="162" cy="32" r="0.7" fill="#b8d8ee"/>
    <circle cx="166" cy="35" r="0.7" fill="#b8d8ee"/>
    <circle cx="163" cy="37" r="0.7" fill="#b8d8ee"/>
    <rect x="205" y="36" width="86" height="22" rx="3" fill="rgba(80,160,220,0.3)"/>
  </g>

  <!-- === RAINFALL LINES (equal across all 3) === -->
  <g opacity="0.7">
    <!-- Rain to sand tray -->
    <line x1="165" y1="55" x2="55" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="170" y1="55" x2="75" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="175" y1="55" x2="95" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="180" y1="55" x2="115" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="185" y1="55" x2="135" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <!-- Rain to garden tray -->
    <line x1="200" y1="55" x2="200" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="210" y1="55" x2="230" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="220" y1="55" x2="250" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="230" y1="55" x2="270" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="240" y1="55" x2="290" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <!-- Rain to grass tray -->
    <line x1="260" y1="55" x2="340" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="265" y1="55" x2="365" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="270" y1="55" x2="390" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="275" y1="55" x2="415" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
    <line x1="280" y1="55" x2="440" y2="100" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="5,4"/>
  </g>

  <!-- === TRAY 1: SAND - Fast infiltration === -->
  <g filter="url(#rDropShadow)">
    <rect x="25" y="105" width="140" height="48" rx="5" fill="url(#rTrayGrad)" stroke="#b8a57a" stroke-width="1.5"/>
    <rect x="31" y="113" width="128" height="20" rx="3" fill="url(#rSandGrad)"/>
    <!-- Infiltration arrows (thick, fast) -->
    <path d="M55 113 L55 140 M75 113 L75 140 M95 113 L95 140 M115 113 L115 140 M135 113 L135 140" stroke="#3a8f5a" stroke-width="3" marker-end="url(#arrowGreen)" opacity="0.8"/>
    <!-- Water dripping into collector -->
    <path d="M70 153 L70 168 M90 153 L90 168 M110 153 L110 168 M130 153 L130 168" stroke="#4a90c8" stroke-width="1.5" opacity="0.7"/>
  </g>

  <!-- Collector 1 filled high -->
  <g filter="url(#rDropShadow)">
    <rect x="65" y="175" width="40" height="50" rx="4" fill="rgba(200,225,240,0.3)" stroke="#a0c4d8" stroke-width="1.2"/>
    <rect x="68" y="185" width="34" height="38" rx="3" fill="url(#rCollectedWater)"/>
    <!-- Water surface -->
    <ellipse cx="85" cy="185" rx="16" ry="2.5" fill="rgba(120,190,235,0.5)"/>
    <line x1="73" y1="218" x2="87" y2="218" stroke="#a0c4d8" stroke-width="0.5"/>
    <line x1="73" y1="210" x2="83" y2="210" stroke="#a0c4d8" stroke-width="0.4"/>
    <line x1="73" y1="202" x2="83" y2="202" stroke="#a0c4d8" stroke-width="0.4"/>
    <text x="85" y="240" text-anchor="middle" font-size="9" fill="#3a8f5a" font-weight="600">多</text>
  </g>

  <!-- Leader line: "快速下渗" -->
  <circle cx="95" cy="108" r="2" fill="#3a8f5a"/>
  <line x1="97" y1="108" x2="115" y2="95" stroke="#3a8f5a" stroke-width="0.8"/>
  <text x="150" y="93" text-anchor="start" font-size="11" fill="#3a8f5a" font-weight="700">快速下渗</text>

  <!-- === TRAY 2: GARDEN SOIL - Partial infiltration === -->
  <g filter="url(#rDropShadow)">
    <rect x="175" y="105" width="140" height="48" rx="5" fill="url(#rTrayGrad)" stroke="#b8a57a" stroke-width="1.5"/>
    <rect x="181" y="113" width="128" height="20" rx="3" fill="url(#rSoilGrad)"/>
    <!-- Surface puddle -->
    <ellipse cx="245" cy="111" rx="42" ry="6" fill="url(#rWaterGrad)" filter="url(#rGlow)"/>
    <!-- Infiltration arrows (medium) -->
    <path d="M215 113 L215 135 M235 113 L235 135 M255 113 L255 135 M275 113 L275 135" stroke="#e89820" stroke-width="2" marker-end="url(#arrowOrange)" opacity="0.7"/>
    <path d="M225 153 L225 168 M255 153 L255 168 M285 153 L285 168" stroke="#4a90c8" stroke-width="1.2" opacity="0.6"/>
  </g>

  <!-- Collector 2 filled medium -->
  <g filter="url(#rDropShadow)">
    <rect x="215" y="175" width="40" height="50" rx="4" fill="rgba(200,225,240,0.3)" stroke="#a0c4d8" stroke-width="1.2"/>
    <rect x="218" y="200" width="34" height="23" rx="3" fill="url(#rCollectedWater)"/>
    <ellipse cx="235" cy="200" rx="16" ry="2.5" fill="rgba(120,190,235,0.5)"/>
    <line x1="223" y1="218" x2="237" y2="218" stroke="#a0c4d8" stroke-width="0.5"/>
    <line x1="223" y1="210" x2="233" y2="210" stroke="#a0c4d8" stroke-width="0.4"/>
    <line x1="223" y1="202" x2="233" y2="202" stroke="#a0c4d8" stroke-width="0.4"/>
    <text x="235" y="240" text-anchor="middle" font-size="9" fill="#e89820" font-weight="600">中</text>
  </g>

  <!-- Leader line: "地表水洼" -->
  <circle cx="260" cy="110" r="2" fill="#e89820"/>
  <line x1="262" y1="110" x2="280" y2="95" stroke="#e89820" stroke-width="0.8"/>
  <text x="315" y="93" text-anchor="start" font-size="11" fill="#e89820" font-weight="700">地表水洼+下渗</text>

  <!-- === TRAY 3: GRASS SOIL - Slow infiltration === -->
  <g filter="url(#rDropShadow)">
    <rect x="335" y="105" width="140" height="48" rx="5" fill="url(#rTrayGrad)" stroke="#b8a57a" stroke-width="1.5"/>
    <rect x="341" y="113" width="128" height="20" rx="3" fill="url(#rGrassGrad)"/>
    <!-- Grass blades -->
    <path d="M345 113 Q347 100 343 92" stroke="#4a8c2f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M355 113 Q357 98 351 88" stroke="#5a9c3f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M365 113 Q364 99 361 91" stroke="#3d7a28" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M378 113 Q380 100 376 92" stroke="#4a8c2f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M390 113 Q388 99 385 90" stroke="#5a9c3f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M402 113 Q404 101 400 93" stroke="#3d7a28" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M415 113 Q417 99 413 91" stroke="#4a8c2f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M428 113 Q426 100 423 92" stroke="#5a9c3f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M442 113 Q444 101 440 93" stroke="#3d7a28" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M455 113 Q453 100 450 92" stroke="#4a8c2f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <!-- Small surface puddle (less than garden soil) -->
    <ellipse cx="405" cy="111" rx="20" ry="4" fill="url(#rWaterGrad)" opacity="0.6"/>
    <!-- Infiltration arrows (thin, slow) -->
    <path d="M380 113 L380 128 M400 113 L400 128 M420 113 L420 128 M440 113 L440 128" stroke="#4a90c8" stroke-width="1.5" marker-end="url(#arrowBlue)" opacity="0.5"/>
    <!-- Water intercepted by leaves -->
    <circle cx="355" cy="99" r="2" fill="rgba(100,180,230,0.6)"/>
    <circle cx="405" cy="101" r="2.5" fill="rgba(100,180,230,0.6)"/>
    <circle cx="435" cy="99" r="2" fill="rgba(100,180,230,0.6)"/>
    <path d="M385 153 L385 168 M410 153 L410 168 M435 153 L435 168" stroke="#4a90c8" stroke-width="1" opacity="0.4"/>
  </g>

  <!-- Collector 3 filled low -->
  <g filter="url(#rDropShadow)">
    <rect x="365" y="175" width="40" height="50" rx="4" fill="rgba(200,225,240,0.3)" stroke="#a0c4d8" stroke-width="1.2"/>
    <rect x="368" y="208" width="34" height="15" rx="3" fill="url(#rCollectedWater)"/>
    <ellipse cx="385" cy="208" rx="16" ry="2.5" fill="rgba(120,190,235,0.5)"/>
    <line x1="373" y1="218" x2="387" y2="218" stroke="#a0c4d8" stroke-width="0.5"/>
    <line x1="373" y1="210" x2="383" y2="210" stroke="#a0c4d8" stroke-width="0.4"/>
    <line x1="373" y1="202" x2="383" y2="202" stroke="#a0c4d8" stroke-width="0.4"/>
    <text x="385" y="240" text-anchor="middle" font-size="9" fill="#4a90c8" font-weight="600">少</text>
  </g>

  <!-- Leader line: "植被拦截" -->
  <circle cx="420" cy="108" r="2" fill="#4a90c8"/>
  <line x1="422" y1="108" x2="440" y2="95" stroke="#4a90c8" stroke-width="0.8"/>
  <text x="460" y="93" text-anchor="start" font-size="11" fill="#4a90c8" font-weight="700">植被拦截·缓慢下渗</text>

  <!-- Annotation: equal rainfall -->
  <text x="250" y="72" text-anchor="middle" font-size="10" fill="#7a8a9a" font-style="italic">等量降雨（相同高度·相同速率）</text>

  <!-- Title -->
  <text x="250" y="285" text-anchor="middle" font-size="12" fill="#5a4a3a" font-weight="600">等量洒水 → 不同下渗行为 → 不同径流产生量</text>
</svg>`},{title:"测量径流与下渗量",content:"收集每个盘下方的渗透水和表面的径流水，用量筒测量体积。计算：径流系数 = 径流量 / 总降雨量。典型结果：裸土径流系数 0.5-0.7，草地 0.1-0.3，沙土接近 0。",highlight:"植被覆盖是最有效的水土保持措施——根系增加土壤孔隙度，茎叶截留降雨、减缓雨滴动能。",illustration:`<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mWaterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(80,170,220,0.55)"/>
      <stop offset="100%" stop-color="rgba(30,110,190,0.78)"/>
    </linearGradient>
    <linearGradient id="mRunoffGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(240,140,30,0.55)"/>
      <stop offset="100%" stop-color="rgba(200,100,20,0.75)"/>
    </linearGradient>
    <linearGradient id="mBarSand" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5ac85a"/>
      <stop offset="100%" stop-color="#2a8a2a"/>
    </linearGradient>
    <linearGradient id="mBarSoil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0a030"/>
      <stop offset="100%" stop-color="#c87018"/>
    </linearGradient>
    <linearGradient id="mBarGrass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4aac4a"/>
      <stop offset="100%" stop-color="#2a7a2a"/>
    </linearGradient>
    <linearGradient id="mGlassGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(180,210,235,0.35)"/>
      <stop offset="50%" stop-color="rgba(220,240,255,0.12)"/>
      <stop offset="100%" stop-color="rgba(180,210,235,0.35)"/>
    </linearGradient>
    <filter id="mShadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1.5" dy="2" stdDeviation="2.5" flood-color="#00000033"/>
    </filter>
    <filter id="mSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#00000022"/>
    </filter>
    <marker id="mArrow" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto">
      <path d="M0,0 L7,3.5 L0,7 Z" fill="#5a7a9a"/>
    </marker>
  </defs>

  <rect width="500" height="300" fill="#fdfdfb" rx="8"/>

  <!-- Title area -->
  <text x="250" y="25" text-anchor="middle" font-size="15" fill="#302820" font-weight="700">径流系数测量与对比</text>
  <text x="250" y="42" text-anchor="middle" font-size="11" fill="#6a5a4a">径流系数 = 径流量 / 总降雨量</text>

  <!-- === CYLINDER 1: SAND === -->
  <g filter="url(#mShadow)">
    <!-- Graduated cylinder -->
    <rect x="30" y="60" width="44" height="90" rx="5" fill="url(#mGlassGrad)" stroke="#a0c4d8" stroke-width="1.3"/>
    <!-- Pour spout -->
    <path d="M40 60 L37 50 L47 50 Z" fill="rgba(180,210,235,0.4)" stroke="#a0c4d8" stroke-width="0.8"/>
    <!-- Measurement lines -->
    <g stroke="#a0c4d8" stroke-width="0.5">
      <line x1="40" y1="140" x2="60" y2="140"/>
      <line x1="43" y1="130" x2="57" y2="130"/>
      <line x1="43" y1="120" x2="57" y2="120"/>
      <line x1="43" y1="110" x2="57" y2="110"/>
      <line x1="43" y1="100" x2="57" y2="100"/>
      <line x1="40" y1="90" x2="60" y2="90"/>
      <line x1="43" y1="80" x2="57" y2="80"/>
      <line x1="40" y1="70" x2="60" y2="70"/>
    </g>
    <!-- Infiltration water (tall, almost clear) -->
    <rect x="34" y="95" width="36" height="53" rx="3" fill="url(#mWaterGrad)"/>
    <!-- Water surface -->
    <ellipse cx="52" cy="95" rx="17" ry="2.5" fill="rgba(120,190,235,0.45)"/>
    <!-- Runoff water (tiny on top) -->
    <rect x="34" y="88" width="36" height="7" rx="2" fill="url(#mRunoffGrad)" opacity="0.8"/>
  </g>

  <!-- Label: sand -->
  <text x="52" y="170" text-anchor="middle" font-size="12" fill="#302820" font-weight="700">沙土</text>
  <text x="52" y="185" text-anchor="middle" font-size="10" fill="#3a8f5a" font-weight="600">径流系数 ≈ 0</text>
  <!-- Leader line: infiltration -->
  <circle cx="52" cy="105" r="2" fill="#5a7a9a"/>
  <line x1="54" y1="105" x2="78" y2="100" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="82" y="100" font-size="9" fill="#4a6a8a">下渗水（多）</text>

  <!-- === CYLINDER 2: GARDEN SOIL === -->
  <g filter="url(#mShadow)">
    <rect x="130" y="60" width="44" height="90" rx="5" fill="url(#mGlassGrad)" stroke="#a0c4d8" stroke-width="1.3"/>
    <path d="M140 60 L137 50 L147 50 Z" fill="rgba(180,210,235,0.4)" stroke="#a0c4d8" stroke-width="0.8"/>
    <g stroke="#a0c4d8" stroke-width="0.5">
      <line x1="140" y1="140" x2="160" y2="140"/>
      <line x1="143" y1="130" x2="157" y2="130"/>
      <line x1="143" y1="120" x2="157" y2="120"/>
      <line x1="143" y1="110" x2="157" y2="110"/>
      <line x1="143" y1="100" x2="157" y2="100"/>
      <line x1="140" y1="90" x2="160" y2="90"/>
      <line x1="143" y1="80" x2="157" y2="80"/>
      <line x1="140" y1="70" x2="160" y2="70"/>
    </g>
    <!-- Runoff water (significant) -->
    <rect x="134" y="72" width="36" height="25" rx="3" fill="url(#mRunoffGrad)" opacity="0.85"/>
    <!-- Infiltration water -->
    <rect x="134" y="97" width="36" height="51" rx="3" fill="url(#mWaterGrad)"/>
    <ellipse cx="152" cy="97" rx="17" ry="2.5" fill="rgba(120,190,235,0.45)"/>
  </g>

  <text x="152" y="170" text-anchor="middle" font-size="12" fill="#302820" font-weight="700">园土</text>
  <text x="152" y="185" text-anchor="middle" font-size="10" fill="#e89820" font-weight="600">径流系数 0.5~0.7</text>
  <circle cx="164" cy="75" r="2" fill="#5a7a9a"/>
  <line x1="166" y1="75" x2="190" y2="70" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="194" y="70" font-size="9" fill="#4a6a8a">径流水（多）</text>
  <circle cx="152" cy="110" r="2" fill="#5a7a9a"/>
  <line x1="154" y1="110" x2="178" y2="115" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="182" y="118" font-size="9" fill="#4a6a8a">下渗水</text>

  <!-- === CYLINDER 3: GRASS SOIL === -->
  <g filter="url(#mShadow)">
    <rect x="230" y="60" width="44" height="90" rx="5" fill="url(#mGlassGrad)" stroke="#a0c4d8" stroke-width="1.3"/>
    <path d="M240 60 L237 50 L247 50 Z" fill="rgba(180,210,235,0.4)" stroke="#a0c4d8" stroke-width="0.8"/>
    <g stroke="#a0c4d8" stroke-width="0.5">
      <line x1="240" y1="140" x2="260" y2="140"/>
      <line x1="243" y1="130" x2="257" y2="130"/>
      <line x1="243" y1="120" x2="257" y2="120"/>
      <line x1="243" y1="110" x2="257" y2="110"/>
      <line x1="243" y1="100" x2="257" y2="100"/>
      <line x1="240" y1="90" x2="260" y2="90"/>
      <line x1="243" y1="80" x2="257" y2="80"/>
      <line x1="240" y1="70" x2="260" y2="70"/>
    </g>
    <!-- Small runoff -->
    <rect x="234" y="82" width="36" height="10" rx="3" fill="url(#mRunoffGrad)" opacity="0.85"/>
    <!-- Infiltration water -->
    <rect x="234" y="92" width="36" height="56" rx="3" fill="url(#mWaterGrad)"/>
    <ellipse cx="252" cy="92" rx="17" ry="2.5" fill="rgba(120,190,235,0.45)"/>
  </g>

  <text x="252" y="170" text-anchor="middle" font-size="12" fill="#302820" font-weight="700">草皮土</text>
  <text x="252" y="185" text-anchor="middle" font-size="10" fill="#4a9a4a" font-weight="600">径流系数 0.1~0.3</text>
  <circle cx="264" cy="85" r="2" fill="#5a7a9a"/>
  <line x1="266" y1="85" x2="290" y2="80" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="294" y="80" font-size="9" fill="#4a6a8a">径流水（少）</text>
  <circle cx="252" cy="105" r="2" fill="#5a7a9a"/>
  <line x1="254" y1="105" x2="278" y2="110" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="282" y="113" font-size="9" fill="#4a6a8a">下渗水（多）</text>

  <!-- === BAR CHART === -->
  <g transform="translate(310, 55)">
    <!-- Chart background -->
    <rect x="0" y="0" width="175" height="100" rx="5" fill="rgba(250,250,248,0.8)" stroke="#d4c8b0" stroke-width="0.8"/>

    <!-- Y-axis -->
    <line x1="40" y1="10" x2="40" y2="90" stroke="#8a7a5a" stroke-width="1"/>
    <!-- X-axis -->
    <line x1="40" y1="90" x2="165" y2="90" stroke="#8a7a5a" stroke-width="1"/>

    <!-- Y-axis labels -->
    <text x="35" y="14" text-anchor="end" font-size="8" fill="#6a5a4a">0.8</text>
    <text x="35" y="34" text-anchor="end" font-size="8" fill="#6a5a4a">0.6</text>
    <text x="35" y="54" text-anchor="end" font-size="8" fill="#6a5a4a">0.4</text>
    <text x="35" y="74" text-anchor="end" font-size="8" fill="#6a5a4a">0.2</text>
    <text x="35" y="94" text-anchor="end" font-size="8" fill="#6a5a4a">0</text>

    <!-- Grid lines -->
    <line x1="40" y1="10" x2="165" y2="10" stroke="#e0d8c8" stroke-width="0.4" stroke-dasharray="3,3"/>
    <line x1="40" y1="30" x2="165" y2="30" stroke="#e0d8c8" stroke-width="0.4" stroke-dasharray="3,3"/>
    <line x1="40" y1="50" x2="165" y2="50" stroke="#e0d8c8" stroke-width="0.4" stroke-dasharray="3,3"/>
    <line x1="40" y1="70" x2="165" y2="70" stroke="#e0d8c8" stroke-width="0.4" stroke-dasharray="3,3"/>

    <!-- Bar: Sand (nearly 0) -->
    <rect x="55" y="85" width="25" height="5" rx="2" fill="url(#mBarSand)" filter="url(#mSoftShadow)"/>
    <text x="67" y="96" text-anchor="middle" font-size="9" fill="#302820">沙土</text>
    <text x="67" y="107" text-anchor="middle" font-size="8" fill="#2a8a2a">≈0</text>

    <!-- Bar: Garden (0.6) -->
    <rect x="95" y="30" width="25" height="60" rx="2" fill="url(#mBarSoil)" filter="url(#mSoftShadow)"/>
    <text x="107" y="96" text-anchor="middle" font-size="9" fill="#302820">园土</text>
    <text x="107" y="107" text-anchor="middle" font-size="8" fill="#c87018">0.5~0.7</text>

    <!-- Bar: Grass (0.2) -->
    <rect x="135" y="70" width="25" height="20" rx="2" fill="url(#mBarGrass)" filter="url(#mSoftShadow)"/>
    <text x="147" y="96" text-anchor="middle" font-size="9" fill="#302820">草皮</text>
    <text x="147" y="107" text-anchor="middle" font-size="8" fill="#2a7a2a">0.1~0.3</text>

    <!-- Y-axis title -->
    <text x="15" y="52" text-anchor="middle" font-size="8" fill="#6a5a4a" transform="rotate(-90, 15, 52)">径流系数</text>
  </g>

  <!-- Chart annotation -->
  <text x="397" y="175" text-anchor="middle" font-size="9" fill="#6a5a4a">柱状图：径流系数对比</text>

  <!-- Summary at bottom -->
  <rect x="18" y="205" width="464" height="40" rx="6" fill="rgba(220,235,248,0.4)" stroke="#b8d0e0" stroke-width="0.8"/>
  <text x="32" y="222" font-size="11" fill="#4a6a5a" font-weight="600">结论：</text>
  <text x="70" y="222" font-size="10.5" fill="#5a6a5a">植被覆盖是最有效的水土保持措施。根系增加土壤孔隙度，茎叶截留降雨、减缓雨滴动能。</text>
  <text x="32" y="238" font-size="10" fill="#5a7a9a">裸土径流系数 0.5~0.7 | 草地 0.1~0.3 | 沙土 ≈ 0</text>
</svg>`},{title:"坡度对比（可选扩展）",content:"将园土盘分别倾斜不同角度（5°、15°、30°），重复降雨。坡度越大，地表径流越多、下渗越少。这也解释了为什么陡坡山地更容易发生水土流失和山洪。",highlight:"坡度每增加 10°，径流系数约增加 0.1-0.15。梯田是坡地农业中减少水土流失的有效工程措施。",illustration:`<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sTrayGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f5f0e8"/>
      <stop offset="100%" stop-color="#d4c8b0"/>
    </linearGradient>
    <linearGradient id="sSoilGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8b6914"/>
      <stop offset="100%" stop-color="#6b4f10"/>
    </linearGradient>
    <linearGradient id="sRunoffGrad1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(80,160,220,0.4)"/>
      <stop offset="100%" stop-color="rgba(80,160,220,0.7)"/>
    </linearGradient>
    <linearGradient id="sRunoffGrad2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(80,160,220,0.5)"/>
      <stop offset="100%" stop-color="rgba(80,160,220,0.8)"/>
    </linearGradient>
    <linearGradient id="sRunoffGrad3" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(80,160,220,0.6)"/>
      <stop offset="100%" stop-color="rgba(80,160,220,0.9)"/>
    </linearGradient>
    <linearGradient id="sRainGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5aacd8"/>
      <stop offset="100%" stop-color="#3a8cc0"/>
    </linearGradient>
    <filter id="sShadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1.5" dy="2" stdDeviation="2.5" flood-color="#00000033"/>
    </filter>
    <marker id="sArrowSmall" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#5aacd8"/>
    </marker>
    <marker id="sArrowRed" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#c84030"/>
    </marker>
  </defs>

  <rect width="500" height="300" fill="#fdfdfb" rx="8"/>

  <!-- === SLOPE 1: 5° (gentle) === -->
  <g transform="translate(25, 125) rotate(-5)">
    <g filter="url(#sShadow)">
      <!-- Tray -->
      <rect x="0" y="0" width="120" height="42" rx="4" fill="url(#sTrayGrad)" stroke="#b8a57a" stroke-width="1.3"/>
      <!-- Soil -->
      <rect x="5" y="4" width="110" height="16" rx="2" fill="url(#sSoilGrad)"/>
      <!-- Soil surface texture -->
      <path d="M5 8 Q15 6 25 8 Q35 10 45 7 Q55 5 65 8 Q75 10 85 7 Q95 5 105 8 Q115 10 115 8" fill="none" stroke="#5a4010" stroke-width="0.8" opacity="0.5"/>
    </g>
    <!-- Rain lines -->
    <line x1="60" y1="-20" x2="60" y2="4" stroke="url(#sRainGrad)" stroke-width="1.2" stroke-dasharray="4,3" opacity="0.6"/>
    <!-- Small runoff arrow -->
    <path d="M110 10 L130 15" stroke="#5aacd8" stroke-width="1.5" marker-end="url(#sArrowSmall)" opacity="0.6"/>
  </g>
  <!-- Labels for 5° -->
  <text x="80" y="118" text-anchor="middle" font-size="12" fill="#302820" font-weight="700">5° 缓坡</text>
  <text x="80" y="133" text-anchor="middle" font-size="10" fill="#3a8f5a" font-weight="600">径流少·下渗多</text>
  <!-- Angle arc -->
  <path d="M25 125 L35 105" stroke="#8a7a5a" stroke-width="0.8" fill="none"/>
  <text x="30" y="102" font-size="9" fill="#8a7a5a">5°</text>

  <!-- === SLOPE 2: 15° (moderate) === -->
  <g transform="translate(175, 110) rotate(-15)">
    <g filter="url(#sShadow)">
      <rect x="0" y="0" width="120" height="42" rx="4" fill="url(#sTrayGrad)" stroke="#b8a57a" stroke-width="1.3"/>
      <rect x="5" y="4" width="110" height="16" rx="2" fill="url(#sSoilGrad)"/>
      <path d="M5 8 Q15 6 25 8 Q35 10 45 7 Q55 5 65 8 Q75 10 85 7 Q95 5 105 8 Q115 10 115 8" fill="none" stroke="#5a4010" stroke-width="0.8" opacity="0.5"/>
    </g>
    <line x1="60" y1="-20" x2="60" y2="4" stroke="url(#sRainGrad)" stroke-width="1.2" stroke-dasharray="4,3" opacity="0.6"/>
    <!-- Medium runoff -->
    <path d="M115 10 L138 25" stroke="#5aacd8" stroke-width="2.2" marker-end="url(#sArrowSmall)" opacity="0.75"/>
    <!-- Surface water flow -->
    <path d="M70 4 Q90 8 110 10" stroke="#5aacd8" stroke-width="1.5" fill="none" opacity="0.5"/>
  </g>
  <text x="230" y="108" text-anchor="middle" font-size="12" fill="#302820" font-weight="700">15° 中坡</text>
  <text x="230" y="123" text-anchor="middle" font-size="10" fill="#e89820" font-weight="600">径流中等·部分下渗</text>
  <path d="M175 125 L190 105" stroke="#8a7a5a" stroke-width="0.8" fill="none"/>
  <text x="185" y="102" font-size="9" fill="#8a7a5a">15°</text>

  <!-- === SLOPE 3: 30° (steep) === -->
  <g transform="translate(335, 95) rotate(-30)">
    <g filter="url(#sShadow)">
      <rect x="0" y="0" width="120" height="42" rx="4" fill="url(#sTrayGrad)" stroke="#b8a57a" stroke-width="1.3"/>
      <rect x="5" y="4" width="110" height="16" rx="2" fill="url(#sSoilGrad)"/>
      <!-- Erosion marks on soil -->
      <path d="M30 8 Q35 12 32 16" stroke="#3a2010" stroke-width="1.2" fill="none" opacity="0.6"/>
      <path d="M70 6 Q76 11 72 15" stroke="#3a2010" stroke-width="1.2" fill="none" opacity="0.6"/>
      <path d="M100 7 Q104 10 102 14" stroke="#3a2010" stroke-width="1.2" fill="none" opacity="0.5"/>
      <!-- Soil particles eroding -->
      <circle cx="115" cy="14" r="1.2" fill="#8b6914" opacity="0.5"/>
      <circle cx="118" cy="18" r="1" fill="#7a5810" opacity="0.4"/>
      <circle cx="112" cy="17" r="0.8" fill="#6b4f10" opacity="0.45"/>
    </g>
    <line x1="60" y1="-20" x2="60" y2="4" stroke="url(#sRainGrad)" stroke-width="1.2" stroke-dasharray="4,3" opacity="0.6"/>
    <!-- Heavy runoff -->
    <path d="M115 12 L145 35" stroke="#c84030" stroke-width="3" marker-end="url(#sArrowRed)" opacity="0.85"/>
    <!-- Surface water flow (large) -->
    <path d="M40 4 Q80 10 115 12" stroke="#5aacd8" stroke-width="2.5" fill="none" opacity="0.6"/>
    <!-- More surface flow -->
    <path d="M25 6 Q50 12 70 10" stroke="#5aacd8" stroke-width="1.5" fill="none" opacity="0.45"/>
  </g>
  <text x="390" y="95" text-anchor="middle" font-size="12" fill="#302820" font-weight="700">30° 陡坡</text>
  <text x="390" y="110" text-anchor="middle" font-size="10" fill="#c84030" font-weight="600">径流多·水土流失</text>
  <path d="M335 125 L350 100" stroke="#8a7a5a" stroke-width="0.8" fill="none"/>
  <text x="346" y="97" font-size="9" fill="#8a7a5a">30°</text>

  <!-- === EROSION DETAIL CALLOUT === -->
  <rect x="15" y="210" width="170" height="45" rx="5" fill="rgba(255,245,235,0.7)" stroke="#d4a070" stroke-width="0.8"/>
  <text x="25" y="226" font-size="9" fill="#a05020" font-weight="600">土壤侵蚀细节：</text>
  <text x="28" y="240" font-size="8.5" fill="#8a4a1a">雨水冲刷带走表层土壤颗粒，</text>
  <text x="28" y="252" font-size="8.5" fill="#8a4a1a">形成细沟侵蚀。坡度越大，</text>
  <text x="28" y="264" font-size="8" fill="#8a4a1a">径流速度越快，侵蚀力越强。</text>

  <!-- === SUMMARY BOX === -->
  <rect x="210" y="210" width="275" height="45" rx="5" fill="rgba(220,235,248,0.4)" stroke="#b8d0e0" stroke-width="0.8"/>
  <text x="225" y="226" font-size="10" fill="#4a6a5a" font-weight="600">坡度效应：</text>
  <text x="305" y="226" font-size="9.5" fill="#5a6a5a">坡度每增加 10°，径流系数约增加 0.1~0.15</text>
  <text x="225" y="242" font-size="9.5" fill="#4a6a8a">梯田、等高耕作是坡地减少水土流失的有效工程措施</text>
  <text x="225" y="256" font-size="9" fill="#5a80a0" font-style="italic">5° 径流少量 → 15° 径流明显 → 30° 严重水土流失</text>

  <!-- Title -->
  <text x="250" y="285" text-anchor="middle" font-size="12" fill="#5a4a3a" font-weight="600">同一土壤，不同坡度 → 径流与侵蚀差异显著</text>
</svg>`}],e={name:"Infiltration",steps:t};export{e as default};
