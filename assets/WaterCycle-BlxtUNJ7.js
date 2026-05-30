const t=[{title:"搭建微型水循环系统",content:'在一个大碗中倒入约 1/3 的温水（可加几滴食用色素便于观察）。在碗中央放一个小杯子（空杯，用于收集"降水"）。用保鲜膜密封碗口，在保鲜膜中央（小杯正上方）放一颗石子或硬币，使膜略微下凹。',highlight:"这个封闭系统包含了水循环的全部要素：碗中的水 = 海洋/地表水，保鲜膜 = 大气层，小杯 = 陆地/湖泊。",illustration:`<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wBowlGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(200,215,230,0.15)"/>
      <stop offset="30%" stop-color="rgba(180,200,220,0.08)"/>
      <stop offset="100%" stop-color="rgba(160,180,200,0.18)"/>
    </linearGradient>
    <linearGradient id="wWaterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(60,160,220,0.55)"/>
      <stop offset="100%" stop-color="rgba(30,110,200,0.7)"/>
    </linearGradient>
    <linearGradient id="wCupGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(200,215,235,0.3)"/>
      <stop offset="50%" stop-color="rgba(230,240,250,0.15)"/>
      <stop offset="100%" stop-color="rgba(200,215,235,0.3)"/>
    </linearGradient>
    <linearGradient id="wWrapGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(220,230,240,0.3)"/>
      <stop offset="100%" stop-color="rgba(200,215,230,0.15)"/>
    </linearGradient>
    <linearGradient id="wTableGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c8b898"/>
      <stop offset="100%" stop-color="#a89878"/>
    </linearGradient>
    <linearGradient id="wStoneGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#b0a090"/>
      <stop offset="50%" stop-color="#908070"/>
      <stop offset="100%" stop-color="#706050"/>
    </linearGradient>
    <filter id="wShadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#00000033"/>
    </filter>
    <filter id="wSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#00000022"/>
    </filter>
    <filter id="wGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <marker id="wArrow" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto">
      <path d="M0,0 L7,3.5 L0,7 Z" fill="#5a7a9a"/>
    </marker>
  </defs>

  <rect width="500" height="300" fill="#fdfdfb" rx="8"/>

  <!-- Table surface -->
  <rect x="0" y="225" width="500" height="75" fill="url(#wTableGrad)"/>
  <line x1="0" y1="225" x2="500" y2="225" stroke="#b8a080" stroke-width="1.5"/>
  <!-- Wood grain -->
  <line x1="0" y1="240" x2="500" y2="238" stroke="#b8a080" stroke-width="0.4" opacity="0.4"/>
  <line x1="0" y1="258" x2="500" y2="260" stroke="#b8a080" stroke-width="0.4" opacity="0.4"/>
  <line x1="0" y1="278" x2="500" y2="276" stroke="#b8a080" stroke-width="0.4" opacity="0.3"/>

  <!-- === GLASS BOWL (cross section) === -->
  <g filter="url(#wShadow)">
    <!-- Bowl outer -->
    <ellipse cx="250" cy="120" rx="155" ry="45" fill="none" stroke="#b0c0d0" stroke-width="2.2"/>
    <!-- Bowl left side -->
    <path d="M95 120 Q95 210 250 210" fill="none" stroke="#b0c0d0" stroke-width="2.2"/>
    <!-- Bowl right side -->
    <path d="M405 120 Q405 210 250 210" fill="none" stroke="#b0c0d0" stroke-width="2.2"/>
    <!-- Bowl bottom curve -->
    <path d="M95 120 Q95 210 250 210 Q405 210 405 120" fill="url(#wBowlGrad)" stroke="none"/>

    <!-- Bowl rim -->
    <ellipse cx="250" cy="120" rx="155" ry="45" fill="none" stroke="#a0b8c8" stroke-width="2.5"/>
    <!-- Bowl rim highlight -->
    <ellipse cx="250" cy="118" rx="153" ry="43" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>

    <!-- Water in bowl -->
    <ellipse cx="250" cy="155" rx="132" ry="38" fill="url(#wWaterGrad)"/>
    <!-- Water surface highlight -->
    <ellipse cx="250" cy="150" rx="120" ry="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
    <!-- Water surface line -->
    <ellipse cx="250" cy="155" rx="132" ry="38" fill="none" stroke="rgba(80,170,220,0.6)" stroke-width="1"/>

    <!-- Small cup in center (above water, sitting on bowl bottom) -->
    <rect x="220" y="175" width="60" height="38" rx="4" fill="url(#wCupGrad)" stroke="#a0b8c8" stroke-width="1.2"/>
    <rect x="220" y="175" width="60" height="4" rx="2" fill="rgba(255,255,255,0.15)"/>
    <!-- Cup interior -->
    <rect x="223" y="178" width="54" height="33" rx="2" fill="rgba(180,200,220,0.12)"/>
    <ellipse cx="250" cy="178" rx="26" ry="6" fill="none" stroke="rgba(160,190,210,0.3)" stroke-width="0.8"/>
  </g>

  <!-- === PLASTIC WRAP (sealed over bowl top) === -->
  <g filter="url(#wSoftShadow)">
    <!-- Wrap surface -->
    <path d="M92 118 Q170 100 250 80 Q330 100 408 118" fill="url(#wWrapGrad)" stroke="#c0d0dd" stroke-width="1.2"/>
    <!-- Wrap dip at center (under stone weight) -->
    <line x1="92" y1="118" x2="250" y2="80" stroke="rgba(180,195,210,0.3)" stroke-width="0.8"/>
    <line x1="408" y1="118" x2="250" y2="80" stroke="rgba(180,195,210,0.3)" stroke-width="0.8"/>

    <!-- Rubber band around rim -->
    <ellipse cx="250" cy="120" rx="156" ry="46" fill="none" stroke="#d48860" stroke-width="4" opacity="0.7"/>
    <ellipse cx="250" cy="120" rx="156" ry="46" fill="none" stroke="#e09870" stroke-width="1.5" opacity="0.5"/>
  </g>

  <!-- === STONE on top of wrap === -->
  <g filter="url(#wShadow)">
    <ellipse cx="250" cy="78" rx="14" ry="9" fill="url(#wStoneGrad)"/>
    <ellipse cx="248" cy="75" rx="8" ry="5" fill="rgba(255,255,255,0.1)"/>
    <ellipse cx="253" cy="80" rx="5" ry="3" fill="rgba(0,0,0,0.1)"/>
  </g>

  <!-- === ANNOTATIONS WITH LEADER LINES === -->

  <!-- Label 1: Bowl -->
  <circle cx="100" cy="140" r="2" fill="#5a7a9a"/>
  <line x1="98" y1="140" x2="60" y2="130" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="25" y="128" font-size="10" fill="#4a6a8a" font-weight="600">大碗</text>
  <line x1="100" y1="142" x2="60" y2="155" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="25" y="158" font-size="9" fill="#5a7a9a">（玻璃或陶瓷）</text>

  <!-- Label 2: Water -->
  <circle cx="185" cy="160" r="2" fill="#5a7a9a"/>
  <line x1="183" y1="160" x2="155" y2="175" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="120" y="180" font-size="10" fill="#4a6a8a" font-weight="600">温水（约 1/3）</text>
  <text x="120" y="193" font-size="9" fill="#5a7a9a">代表：海洋/地表水</text>

  <!-- Label 3: Cup -->
  <circle cx="250" cy="195" r="2" fill="#5a7a9a"/>
  <line x1="252" y1="195" x2="280" y2="210" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="284" y="214" font-size="10" fill="#4a6a8a" font-weight="600">小杯（空）</text>
  <text x="284" y="227" font-size="9" fill="#5a7a9a">代表：陆地/湖泊</text>

  <!-- Label 4: Plastic wrap -->
  <circle cx="360" cy="100" r="2" fill="#5a7a9a"/>
  <line x1="358" y1="100" x2="400" y2="80" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="404" y="78" font-size="10" fill="#4a6a8a" font-weight="600">保鲜膜</text>
  <text x="404" y="91" font-size="9" fill="#5a7a9a">代表：大气层</text>

  <!-- Label 5: Rubber band -->
  <circle cx="380" cy="120" r="2" fill="#5a7a9a"/>
  <line x1="382" y1="120" x2="415" y2="108" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="419" y="108" font-size="9" fill="#5a7a9a" font-weight="600">橡皮筋密封</text>

  <!-- Label 6: Stone -->
  <circle cx="260" cy="72" r="2" fill="#5a7a9a"/>
  <line x1="262" y1="72" x2="290" y2="52" stroke="#5a7a9a" stroke-width="0.8"/>
  <text x="294" y="52" font-size="9" fill="#5a7a9a" font-weight="600">石子/硬币</text>
  <text x="294" y="64" font-size="8" fill="#8a8a9a">使膜下凹</text>

  <!-- Component mapping box -->
  <rect x="15" y="8" width="220" height="55" rx="6" fill="rgba(240,248,255,0.7)" stroke="#c0d8e8" stroke-width="0.8"/>
  <text x="25" y="22" font-size="9" fill="#4a6a8a" font-weight="700">系统要素对应关系：</text>
  <text x="28" y="36" font-size="8.5" fill="#5a7a9a">碗+温水 = 海洋 | 保鲜膜 = 大气层</text>
  <text x="28" y="48" font-size="8.5" fill="#5a7a9a">小杯 = 陆地 | 石子 = 重力作用</text>
  <text x="28" y="60" font-size="8.5" fill="#5a7a9a">密封系统 = 地球水循环封闭系统</text>

  <!-- Title -->
  <text x="250" y="290" text-anchor="middle" font-size="12" fill="#5a4a3a" font-weight="600">微型水循环系统装置搭建</text>
</svg>`},{title:"阳光照射——蒸发开始",content:"将装置放在阳光充足的窗台或台灯下。温水在光照下蒸发，水汽上升。观察保鲜膜内侧逐渐出现雾气（小水滴）——这是蒸发和凝结过程。",highlight:"太阳辐射是水循环的驱动力。全球每年约 577,000 km³ 的水通过蒸发进入大气。",illustration:`<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="eSunGrad" cx="0.4" cy="0.35" r="0.6">
      <stop offset="0%" stop-color="#ffe880"/>
      <stop offset="30%" stop-color="#ffcc40"/>
      <stop offset="60%" stop-color="#ffa010"/>
      <stop offset="100%" stop-color="#ff8800" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="eSunGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="rgba(255,200,60,0.4)"/>
      <stop offset="50%" stop-color="rgba(255,180,40,0.15)"/>
      <stop offset="100%" stop-color="rgba(255,160,20,0)"/>
    </radialGradient>
    <linearGradient id="eBowlGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(200,215,230,0.15)"/>
      <stop offset="100%" stop-color="rgba(160,180,200,0.18)"/>
    </linearGradient>
    <linearGradient id="eWaterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(60,160,220,0.5)"/>
      <stop offset="100%" stop-color="rgba(30,110,200,0.68)"/>
    </linearGradient>
    <linearGradient id="eTableGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c8b898"/>
      <stop offset="100%" stop-color="#a89878"/>
    </linearGradient>
    <linearGradient id="eFogGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(220,230,240,0.25)"/>
      <stop offset="100%" stop-color="rgba(200,215,230,0.1)"/>
    </linearGradient>
    <filter id="eShadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#00000033"/>
    </filter>
    <filter id="eBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5"/>
    </filter>
    <marker id="eVaporArrow" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto">
      <path d="M0,0 L7,3.5 L0,7 Z" fill="#6ba8d9"/>
    </marker>
  </defs>

  <rect width="500" height="300" fill="#fdfdfb" rx="8"/>

  <!-- Table -->
  <rect x="0" y="235" width="500" height="65" fill="url(#eTableGrad)"/>
  <line x1="0" y1="235" x2="500" y2="235" stroke="#b8a080" stroke-width="1.5"/>

  <!-- === SUN === -->
  <g transform="translate(390, 52)">
    <!-- Outer glow -->
    <circle cx="0" cy="0" r="55" fill="url(#eSunGlow)"/>
    <!-- Sun body -->
    <circle cx="0" cy="0" r="32" fill="url(#eSunGrad)" filter="url(#eShadow)"/>
    <!-- Sun rays (8 rays) -->
    <g stroke="#ffcc40" stroke-width="2.5" stroke-linecap="round" opacity="0.7">
      <line x1="0" y1="-38" x2="0" y2="-50"/>
      <line x1="0" y1="38" x2="0" y2="50"/>
      <line x1="-38" y1="0" x2="-50" y2="0"/>
      <line x1="38" y1="0" x2="50" y2="0"/>
      <line x1="-27" y1="-27" x2="-35" y2="-35"/>
      <line x1="27" y1="27" x2="35" y2="35"/>
      <line x1="-27" y1="27" x2="-35" y2="35"/>
      <line x1="27" y1="-27" x2="35" y2="-35"/>
    </g>
    <!-- Sun face/center -->
    <text x="0" y="5" text-anchor="middle" font-size="16" fill="#fff" font-weight="900">☀</text>
  </g>

  <!-- Sun label -->
  <text x="390" y="25" text-anchor="middle" font-size="11" fill="#e89820" font-weight="700">太阳（光源）</text>

  <!-- Sun rays shining down -->
  <g opacity="0.15" stroke="#ffcc40" stroke-width="2">
    <line x1="370" y1="80" x2="250" y2="150"/>
    <line x1="385" y1="85" x2="280" y2="160"/>
    <line x1="400" y1="85" x2="310" y2="150"/>
    <line x1="410" y1="90" x2="340" y2="145"/>
  </g>

  <!-- === BOWL === -->
  <g filter="url(#eShadow)">
    <ellipse cx="220" cy="130" rx="145" ry="42" fill="none" stroke="#b0c0d0" stroke-width="2"/>
    <path d="M75 130 Q75 215 220 215" fill="none" stroke="#b0c0d0" stroke-width="2"/>
    <path d="M365 130 Q365 215 220 215" fill="none" stroke="#b0c0d0" stroke-width="2"/>
    <path d="M75 130 Q75 215 220 215 Q365 215 365 130" fill="url(#eBowlGrad)" stroke="none"/>

    <!-- Water -->
    <ellipse cx="220" cy="162" rx="125" ry="36" fill="url(#eWaterGrad)"/>
    <ellipse cx="220" cy="158" rx="115" ry="30" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.2"/>

    <!-- Cup -->
    <rect x="192" y="182" width="56" height="34" rx="4" fill="rgba(200,215,235,0.25)" stroke="#a0b8c8" stroke-width="1"/>
  </g>

  <!-- Rubber band -->
  <ellipse cx="220" cy="130" rx="146" ry="43" fill="none" stroke="#d48860" stroke-width="3.5" opacity="0.65"/>

  <!-- Plastic wrap -->
  <path d="M73 128 Q150 108 220 88 Q290 108 367 128" fill="url(#eFogGrad)" stroke="#c0d0dd" stroke-width="1.2"/>

  <!-- FOG on plastic wrap -->
  <g opacity="0.5" filter="url(#eBlur)">
    <circle cx="140" cy="112" r="4" fill="#c8d8e8"/>
    <circle cx="160" cy="108" r="5" fill="#c8d8e8"/>
    <circle cx="180" cy="104" r="4.5" fill="#c8d8e8"/>
    <circle cx="200" cy="100" r="6" fill="#c8d8e8"/>
    <circle cx="220" cy="96" r="7" fill="#c8d8e8"/>
    <circle cx="240" cy="98" r="5" fill="#c8d8e8"/>
    <circle cx="260" cy="102" r="6" fill="#c8d8e8"/>
    <circle cx="280" cy="106" r="5" fill="#c8d8e8"/>
    <circle cx="300" cy="110" r="4.5" fill="#c8d8e8"/>
  </g>
  <!-- Fog droplets (visible) -->
  <g fill="#d0dde8" opacity="0.6">
    <circle cx="145" cy="112" r="1.8"/>
    <circle cx="165" cy="107" r="2"/>
    <circle cx="185" cy="103" r="2.2"/>
    <circle cx="205" cy="99" r="2.5"/>
    <circle cx="225" cy="95" r="2.8"/>
    <circle cx="245" cy="97" r="2.2"/>
    <circle cx="265" cy="101" r="2.5"/>
    <circle cx="285" cy="105" r="2"/>
    <circle cx="305" cy="109" r="1.8"/>
  </g>

  <!-- Stone -->
  <g filter="url(#eShadow)">
    <ellipse cx="220" cy="86" rx="13" ry="8" fill="#908070"/>
    <ellipse cx="218" cy="83" rx="7" ry="4" fill="rgba(255,255,255,0.1)"/>
  </g>

  <!-- === WATER VAPOR ARROWS (wavy, rising from water surface) === -->
  <g opacity="0.65">
    <!-- Vapor path 1 -->
    <path d="M140 160 Q138 148 142 136 Q146 124 140 112" stroke="#6ba8d9" stroke-width="1.5" fill="none" stroke-dasharray="2,4" marker-end="url(#eVaporArrow)"/>
    <!-- Vapor path 2 -->
    <path d="M170 162 Q172 150 168 138 Q164 126 170 114" stroke="#6ba8d9" stroke-width="1.5" fill="none" stroke-dasharray="2,4" marker-end="url(#eVaporArrow)"/>
    <!-- Vapor path 3 -->
    <path d="M200 163 Q198 150 202 138 Q206 125 200 112" stroke="#6ba8d9" stroke-width="1.8" fill="none" stroke-dasharray="2,4" marker-end="url(#eVaporArrow)"/>
    <!-- Vapor path 4 -->
    <path d="M230 162 Q232 148 228 136 Q224 124 230 110" stroke="#6ba8d9" stroke-width="1.5" fill="none" stroke-dasharray="2,4" marker-end="url(#eVaporArrow)"/>
    <!-- Vapor path 5 -->
    <path d="M260 160 Q258 148 262 136 Q266 125 260 112" stroke="#6ba8d9" stroke-width="1.5" fill="none" stroke-dasharray="2,4" marker-end="url(#eVaporArrow)"/>
  </g>

  <!-- Small water vapor wisps -->
  <g opacity="0.3" stroke="#8cc8ee" stroke-width="1" fill="none">
    <path d="M155 158 Q152 150 156 142"/>
    <path d="M215 160 Q218 150 214 140"/>
    <path d="M245 158 Q242 148 246 140"/>
  </g>

  <!-- === TEMPERATURE INDICATOR === -->
  <g transform="translate(30, 22)">
    <rect x="0" y="0" width="80" height="48" rx="6" fill="rgba(255,248,240,0.75)" stroke="#e0c8a0" stroke-width="0.8"/>
    <text x="40" y="14" text-anchor="middle" font-size="8" fill="#a08050" font-weight="600">温度指示</text>
    <!-- Thermometer icon -->
    <rect x="20" y="18" width="6" height="22" rx="3" fill="#e8e0d8" stroke="#c0b098" stroke-width="0.6"/>
    <circle cx="23" cy="42" r="5" fill="#e84030" stroke="#c03020" stroke-width="0.6"/>
    <rect x="21" y="22" width="4" height="18" rx="2" fill="#e84030" opacity="0.7"/>
    <text x="32" y="36" font-size="8" fill="#c84030" font-weight="700">温水</text>
    <text x="32" y="46" font-size="7" fill="#a08050">30~40°C</text>
  </g>

  <!-- === ANNOTATIONS === -->

  <!-- Evaporation label -->
  <circle cx="140" cy="148" r="2.5" fill="#4a90c8"/>
  <line x1="142" y1="148" x2="100" y2="135" stroke="#4a90c8" stroke-width="0.8"/>
  <text x="55" y="132" font-size="10" fill="#4a90c8" font-weight="700">蒸发 ↑</text>

  <!-- Water vapor label -->
  <circle cx="170" cy="118" r="2.5" fill="#6ba8d9"/>
  <line x1="172" y1="118" x2="140" y2="100" stroke="#6ba8d9" stroke-width="0.8"/>
  <text x="55" y="98" font-size="10" fill="#6ba8d9" font-weight="600">水汽上升</text>

  <!-- Fog label -->
  <circle cx="185" cy="100" r="2.5" fill="#8aa8c0"/>
  <line x1="187" y1="100" x2="170" y2="82" stroke="#8aa8c0" stroke-width="0.8"/>
  <text x="80" y="80" font-size="10" fill="#8aa8c0" font-weight="600">保鲜膜起雾</text>
  <text x="80" y="92" font-size="8" fill="#8aa8c0">（水汽凝结）</text>

  <!-- Solar radiation label -->
  <line x1="365" y1="75" x2="320" y2="95" stroke="#e89820" stroke-width="0.8"/>
  <text x="305" y="98" font-size="10" fill="#e89820" font-weight="600">太阳辐射</text>
  <text x="305" y="110" font-size="8" fill="#c87818">（驱动力）</text>

  <!-- Summary box -->
  <rect x="305" y="248" width="185" height="45" rx="5" fill="rgba(255,245,230,0.7)" stroke="#e0c8a0" stroke-width="0.8"/>
  <text x="315" y="263" font-size="9" fill="#a06020" font-weight="600">关键观察：</text>
  <text x="318" y="276" font-size="8.5" fill="#8a5a20">保鲜膜内侧出现雾气</text>
  <text x="318" y="288" font-size="8.5" fill="#8a5a20">小水滴 → 蒸发+凝结</text>

  <text x="220" y="295" text-anchor="middle" font-size="10" fill="#5a4a3a" font-weight="600">太阳加热 → 蒸发 → 水汽上升 → 保鲜膜上凝雾</text>
</svg>`},{title:'凝结与"降水"',content:'随着蒸发继续，保鲜膜上的雾气聚集成越来越大的水滴。当水滴足够大时，它们沿保鲜膜斜坡滑向中央（石子压低处），滴入小杯中。这就是"降水"——凝结的水滴大到足以克服重力下落。',highlight:"云滴直径约 10-20 μm，雨滴直径约 0.5-5 mm。一滴雨滴包含约 100 万个云滴。",illustration:`<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cBowlGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(200,215,230,0.15)"/>
      <stop offset="100%" stop-color="rgba(160,180,200,0.18)"/>
    </linearGradient>
    <linearGradient id="cWaterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(60,160,220,0.5)"/>
      <stop offset="100%" stop-color="rgba(30,110,200,0.68)"/>
    </linearGradient>
    <linearGradient id="cCollectedGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(50,150,215,0.55)"/>
      <stop offset="100%" stop-color="rgba(20,100,190,0.72)"/>
    </linearGradient>
    <linearGradient id="cTableGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c8b898"/>
      <stop offset="100%" stop-color="#a89878"/>
    </linearGradient>
    <linearGradient id="cDropletGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(120,200,240,0.9)"/>
      <stop offset="100%" stop-color="rgba(40,130,210,0.85)"/>
    </linearGradient>
    <filter id="cShadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#00000033"/>
    </filter>
    <filter id="cDripGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="500" height="300" fill="#fdfdfb" rx="8"/>

  <!-- Table -->
  <rect x="0" y="240" width="500" height="60" fill="url(#cTableGrad)"/>
  <line x1="0" y1="240" x2="500" y2="240" stroke="#b8a080" stroke-width="1.5"/>

  <!-- === BOWL === -->
  <g filter="url(#cShadow)">
    <ellipse cx="240" cy="135" rx="150" ry="43" fill="none" stroke="#b0c0d0" stroke-width="2"/>
    <path d="M90 135 Q90 220 240 220" fill="none" stroke="#b0c0d0" stroke-width="2"/>
    <path d="M390 135 Q390 220 240 220" fill="none" stroke="#b0c0d0" stroke-width="2"/>
    <path d="M90 135 Q90 220 240 220 Q390 220 390 135" fill="url(#cBowlGrad)" stroke="none"/>

    <!-- Water (reduced, some has evaporated) -->
    <ellipse cx="240" cy="165" rx="128" ry="37" fill="url(#cWaterGrad)"/>
    <ellipse cx="240" cy="161" rx="118" ry="31" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    <!-- Cup with collected water -->
    <rect x="212" y="185" width="56" height="36" rx="4" fill="rgba(200,215,235,0.25)" stroke="#a0b8c8" stroke-width="1"/>
    <!-- Collected water in cup -->
    <rect x="215" y="205" width="50" height="14" rx="3" fill="url(#cCollectedGrad)"/>
  </g>

  <!-- Rubber band -->
  <ellipse cx="240" cy="135" rx="151" ry="44" fill="none" stroke="#d48860" stroke-width="3.5" opacity="0.65"/>

  <!-- Plastic wrap (dipped in center) -->
  <path d="M88 133 Q155 110 240 92 Q325 110 392 133" fill="rgba(220,230,240,0.18)" stroke="#c0d0dd" stroke-width="1.2"/>

  <!-- Stone -->
  <g filter="url(#cShadow)">
    <ellipse cx="240" cy="90" rx="14" ry="9" fill="#908070"/>
    <ellipse cx="238" cy="87" rx="7" ry="4" fill="rgba(255,255,255,0.1)"/>
  </g>

  <!-- === WATER DROPLETS ON PLASTIC WRAP === -->
  <!-- Small droplets (fog) on the sides -->
  <g fill="url(#cDropletGrad)" opacity="0.5">
    <circle cx="115" cy="125" r="2"/>
    <circle cx="125" cy="122" r="2.5"/>
    <circle cx="135" cy="120" r="1.8"/>
    <circle cx="145" cy="117" r="2.2"/>
    <circle cx="155" cy="114" r="2.8"/>
    <circle cx="350" cy="118" r="2"/>
    <circle cx="360" cy="120" r="2.5"/>
    <circle cx="370" cy="123" r="1.8"/>
    <circle cx="380" cy="126" r="2.2"/>
  </g>

  <!-- Medium droplets sliding down toward center -->
  <g fill="url(#cDropletGrad)" opacity="0.7">
    <circle cx="165" cy="112" r="3.2"/>
    <circle cx="175" cy="108" r="3.8"/>
    <circle cx="185" cy="105" r="4.2"/>
    <circle cx="195" cy="102" r="4.8"/>
    <circle cx="205" cy="99" r="5.2"/>
    <circle cx="295" cy="100" r="3.8"/>
    <circle cx="305" cy="103" r="4.2"/>
    <circle cx="315" cy="106" r="3.5"/>
    <circle cx="325" cy="109" r="3"/>
  </g>

  <!-- Large droplets pooling at center (under stone) -->
  <g fill="url(#cDropletGrad)" opacity="0.9" filter="url(#cDripGlow)">
    <circle cx="225" cy="95" r="5.5"/>
    <circle cx="235" cy="93" r="6"/>
    <circle cx="245" cy="94" r="5.8"/>
    <circle cx="255" cy="95" r="5.2"/>
    <circle cx="240" cy="93" r="5"/>
  </g>

  <!-- === DRIP FALLING INTO CUP === -->
  <g>
    <!-- Drip path -->
    <line x1="240" y1="98" x2="240" y2="200" stroke="#5aacd8" stroke-width="1.2" stroke-dasharray="3,4" opacity="0.5"/>
    <!-- Falling drops -->
    <ellipse cx="240" cy="140" rx="2.5" ry="3.5" fill="url(#cDropletGrad)" filter="url(#cDripGlow)"/>
    <ellipse cx="240" cy="165" rx="2" ry="3" fill="url(#cDropletGrad)" filter="url(#cDripGlow)"/>
    <ellipse cx="240" cy="190" rx="1.8" ry="2.5" fill="url(#cDropletGrad)" filter="url(#cDripGlow)"/>
  </g>

  <!-- === ANNOTATIONS === -->

  <!-- Label 1: 凝结 (Condensation) -->
  <rect x="12" y="20" width="90" height="22" rx="4" fill="rgba(200,225,245,0.7)" stroke="#a0c4e0" stroke-width="0.8"/>
  <circle cx="165" cy="112" r="2" fill="#4a90c8"/>
  <line x1="163" y1="112" x2="100" y2="105" stroke="#4a90c8" stroke-width="0.8"/>
  <text x="57" y="35" text-anchor="middle" font-size="11" fill="#4a90c8" font-weight="700">凝结</text>

  <!-- Label 2: 水滴聚集 -->
  <circle cx="210" cy="98" r="2" fill="#5aacd8"/>
  <line x1="208" y1="98" x2="170" y2="80" stroke="#5aacd8" stroke-width="0.8"/>
  <text x="100" y="76" font-size="10" fill="#5aacd8" font-weight="600">水滴聚集变大</text>

  <!-- Label 3: 降水 (Precipitation) -->
  <rect x="12" y="52" width="90" height="22" rx="4" fill="rgba(200,225,245,0.7)" stroke="#a0c4e0" stroke-width="0.8"/>
  <circle cx="240" cy="150" r="2" fill="#3090c0"/>
  <line x1="242" y1="150" x2="102" y2="150" stroke="#3090c0" stroke-width="0.8"/>
  <text x="57" y="67" text-anchor="middle" font-size="11" fill="#3090c0" font-weight="700">降水</text>

  <!-- Label 4: 收集 (Collection) -->
  <rect x="12" y="84" width="90" height="22" rx="4" fill="rgba(200,225,245,0.7)" stroke="#a0c4e0" stroke-width="0.8"/>
  <circle cx="240" cy="210" r="2" fill="#2070a0"/>
  <line x1="242" y1="210" x2="102" y2="210" stroke="#2070a0" stroke-width="0.8"/>
  <text x="57" y="99" text-anchor="middle" font-size="11" fill="#2070a0" font-weight="700">收集</text>

  <!-- Process description box (right side) -->
  <rect x="395" y="20" width="98" height="88" rx="6" fill="rgba(240,248,255,0.75)" stroke="#c0d8e8" stroke-width="0.8"/>
  <text x="444" y="36" text-anchor="middle" font-size="9" fill="#4a6a8a" font-weight="700">形成过程</text>
  <line x1="405" y1="42" x2="483" y2="42" stroke="#d0dde8" stroke-width="0.5"/>
  <text x="408" y="54" font-size="8" fill="#5a7a9a">1. 水汽上升</text>
  <text x="408" y="66" font-size="8" fill="#5a7a9a">2. 膜上凝雾</text>
  <text x="408" y="78" font-size="8" fill="#5a7a9a">3. 雾滴聚大</text>
  <text x="408" y="90" font-size="8" fill="#5a7a9a">4. 重力滴落</text>
  <text x="408" y="102" font-size="8" fill="#5a7a9a">5. 杯中收集</text>

  <!-- Droplet size comparison -->
  <rect x="395" y="118" width="98" height="52" rx="6" fill="rgba(255,248,240,0.75)" stroke="#e0c8a0" stroke-width="0.8"/>
  <text x="444" y="133" text-anchor="middle" font-size="8" fill="#a06020" font-weight="600">水滴尺度</text>
  <line x1="405" y1="138" x2="483" y2="138" stroke="#e0c8a0" stroke-width="0.5"/>
  <text x="408" y="150" font-size="7.5" fill="#8a5a20">云滴: 10~20 μm</text>
  <text x="408" y="162" font-size="7.5" fill="#8a5a20">雨滴: 0.5~5 mm</text>
  <text x="408" y="174" font-size="7" fill="#a07030">1雨滴≈100万云滴</text>

  <!-- Title -->
  <text x="240" y="290" text-anchor="middle" font-size="11" fill="#5a4a3a" font-weight="600">雾滴聚集 → 沿膜滑落 → 滴入小杯（降水）</text>
</svg>`},{title:"观察与总结",content:'等待 1-2 小时后，观察小杯中收集到的水量。这演示了蒸发→凝结→降水→收集的完整水循环。碗中的"海洋"水减少，小杯中的"陆地淡水"增加。真实水循环中，水还可以通过径流和地下水回流到海洋。',highlight:"水循环是地球系统中连接大气圈、水圈、岩石圈和生物圈的核心过程。水在大气中的平均停留时间约 9 天，在地下水中可达数百年。",illustration:`<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="fSunGrad" cx="0.4" cy="0.35" r="0.6">
      <stop offset="0%" stop-color="#ffe880"/>
      <stop offset="40%" stop-color="#ffcc40"/>
      <stop offset="100%" stop-color="#ffa010" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fOceanGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5aacd8"/>
      <stop offset="100%" stop-color="#2a6a9a"/>
    </linearGradient>
    <linearGradient id="fLandGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7aaa3a"/>
      <stop offset="30%" stop-color="#5a8a2a"/>
      <stop offset="100%" stop-color="#8b6914"/>
    </linearGradient>
    <linearGradient id="fCloudGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="100%" stop-color="#d8e4f0"/>
    </linearGradient>
    <linearGradient id="fMiniBowlGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(200,215,230,0.15)"/>
      <stop offset="100%" stop-color="rgba(160,180,200,0.2)"/>
    </linearGradient>
    <linearGradient id="fSkyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d8eaf8"/>
      <stop offset="100%" stop-color="#e8f0f5"/>
    </linearGradient>
    <filter id="fShadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1" dy="1.5" stdDeviation="2" flood-color="#00000033"/>
    </filter>
    <filter id="fGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <marker id="fArrowEvap" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#6ba8d9"/>
    </marker>
    <marker id="fArrowPrecip" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#4a8ab8"/>
    </marker>
    <marker id="fArrowRunoff" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#4a8ab8"/>
    </marker>
    <marker id="fArrowGround" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#8a7a5a"/>
    </marker>
  </defs>

  <!-- Sky background -->
  <rect width="500" height="300" fill="url(#fSkyGrad)" rx="8"/>

  <!-- === SUN === -->
  <g transform="translate(80, 45)">
    <circle cx="0" cy="0" r="28" fill="url(#fSunGrad)" filter="url(#fShadow)"/>
    <g stroke="#ffcc40" stroke-width="2" stroke-linecap="round" opacity="0.6">
      <line x1="0" y1="-33" x2="0" y2="-42"/>
      <line x1="0" y1="33" x2="0" y2="42"/>
      <line x1="-33" y1="0" x2="-42" y2="0"/>
      <line x1="33" y1="0" x2="42" y2="0"/>
      <line x1="-23" y1="-23" x2="-30" y2="-30"/>
      <line x1="23" y1="23" x2="30" y2="30"/>
      <line x1="-23" y1="23" x2="-30" y2="30"/>
      <line x1="23" y1="-23" x2="30" y2="-30"/>
    </g>
    <text x="0" y="4" text-anchor="middle" font-size="14" fill="#fff" font-weight="900">☀</text>
  </g>

  <!-- === OCEAN === -->
  <g filter="url(#fShadow)">
    <!-- Ocean body -->
    <path d="M0 190 Q50 185 100 188 Q150 192 200 190 Q250 187 300 190 Q350 193 400 189 Q450 186 500 190 L500 300 L0 300 Z" fill="url(#fOceanGrad)"/>
    <!-- Ocean surface waves -->
    <path d="M0 190 Q30 185 60 189 Q90 193 120 188 Q150 184 180 190 Q210 194 240 188 Q270 183 300 190 Q330 195 360 188 Q390 183 420 190 Q450 195 480 189 Q500 185 500 190" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.2"/>
    <path d="M0 195 Q40 192 80 196 Q120 200 160 195 Q200 191 240 196 Q280 200 320 195 Q360 191 400 196 Q440 199 480 195" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
  </g>

  <!-- === LAND (right side) === -->
  <g filter="url(#fShadow)">
    <!-- Land mass -->
    <path d="M370 190 Q380 170 400 155 Q420 145 440 148 Q460 152 475 160 Q490 170 500 175 L500 300 L370 300 Z" fill="url(#fLandGrad)"/>
    <!-- Trees -->
    <g>
      <line x1="420" y1="165" x2="420" y2="152" stroke="#5a4a20" stroke-width="1.5"/>
      <circle cx="420" cy="148" r="6" fill="#4a8a2a"/>
      <line x1="440" y1="160" x2="440" y2="148" stroke="#5a4a20" stroke-width="1.5"/>
      <circle cx="440" cy="144" r="5" fill="#5a9a3a"/>
      <line x1="455" y1="158" x2="455" y2="145" stroke="#5a4a20" stroke-width="1.3"/>
      <circle cx="455" cy="142" r="4.5" fill="#3a7a2a"/>
      <line x1="470" y1="162" x2="470" y2="152" stroke="#5a4a20" stroke-width="1.2"/>
      <circle cx="470" cy="149" r="4" fill="#4a8a2a"/>
    </g>
    <!-- Land surface -->
    <path d="M370 190 Q390 185 410 188 Q430 192 450 186 Q470 182 500 185" fill="none" stroke="#5a8a2a" stroke-width="1.5"/>
  </g>

  <!-- === CLOUD === -->
  <g filter="url(#fGlow)">
    <ellipse cx="230" cy="82" rx="55" ry="22" fill="url(#fCloudGrad)" filter="url(#fShadow)"/>
    <ellipse cx="210" cy="80" rx="30" ry="18" fill="#fff"/>
    <ellipse cx="250" cy="80" rx="32" ry="19" fill="#f8f8ff"/>
    <ellipse cx="230" cy="75" rx="28" ry="16" fill="#fff"/>
    <ellipse cx="215" cy="85" rx="22" ry="12" fill="#f0f4f8" opacity="0.6"/>
    <ellipse cx="248" cy="84" rx="20" ry="11" fill="#f0f4f8" opacity="0.6"/>
  </g>

  <!-- === EVAPORATION ARROWS (ocean to cloud) === -->
  <g>
    <!-- Wavy arrows from ocean surface -->
    <path d="M130 185 Q125 168 132 150 Q138 132 130 115 Q125 100 130 90" stroke="#6ba8d9" stroke-width="1.8" fill="none" stroke-dasharray="2,4" marker-end="url(#fArrowEvap)"/>
    <path d="M155 187 Q150 170 156 152 Q162 134 155 116 Q150 100 155 88" stroke="#6ba8d9" stroke-width="1.8" fill="none" stroke-dasharray="2,4" marker-end="url(#fArrowEvap)"/>
    <path d="M175 188 Q172 172 178 155 Q184 138 175 120 Q170 105 175 90" stroke="#6ba8d9" stroke-width="1.6" fill="none" stroke-dasharray="2,4" marker-end="url(#fArrowEvap)"/>
    <!-- Small wisps -->
    <path d="M110 186 Q107 172 112 158" stroke="#8cc8ee" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M195 188 Q192 175 196 162" stroke="#8cc8ee" stroke-width="1" fill="none" opacity="0.5"/>
  </g>

  <!-- === PRECIPITATION (cloud to land and ocean) === -->
  <g>
    <!-- Rain lines from cloud -->
    <line x1="210" y1="100" x2="205" y2="130" stroke="#4a8ab8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6"/>
    <line x1="220" y1="100" x2="215" y2="135" stroke="#4a8ab8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.7"/>
    <line x1="230" y1="100" x2="225" y2="138" stroke="#4a8ab8" stroke-width="1.8" stroke-dasharray="3,3" opacity="0.7" marker-end="url(#fArrowPrecip)"/>
    <line x1="240" y1="100" x2="240" y2="142" stroke="#4a8ab8" stroke-width="1.8" stroke-dasharray="3,3" opacity="0.7" marker-end="url(#fArrowPrecip)"/>
    <line x1="250" y1="100" x2="252" y2="138" stroke="#4a8ab8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6"/>
    <line x1="260" y1="100" x2="265" y2="132" stroke="#4a8ab8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.5"/>

    <!-- Rain onto land -->
    <line x1="410" y1="100" x2="405" y2="165" stroke="#4a8ab8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6" marker-end="url(#fArrowPrecip)"/>
    <line x1="425" y1="100" x2="422" y2="155" stroke="#4a8ab8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6" marker-end="url(#fArrowPrecip)"/>
    <line x1="440" y1="100" x2="438" y2="150" stroke="#4a8ab8" stroke-width="1.3" stroke-dasharray="3,3" opacity="0.5"/>
  </g>

  <!-- === RUNOFF (land back to ocean) === -->
  <g>
    <path d="M400 188 Q370 190 340 188 Q310 186 280 188" stroke="#4a8ab8" stroke-width="1.8" stroke-dasharray="5,4" fill="none" marker-end="url(#fArrowRunoff)" opacity="0.6"/>
    <!-- Groundwater seepage -->
    <path d="M390 200 Q360 210 320 205 Q290 200 260 208" stroke="#8a7a5a" stroke-width="1.2" stroke-dasharray="4,5" fill="none" marker-end="url(#fArrowGround)" opacity="0.4"/>
  </g>

  <!-- === PROCESS LABELS === -->
  <!-- Evaporation -->
  <rect x="130" y="120" width="50" height="18" rx="3" fill="rgba(200,230,245,0.8)" stroke="#a0c8e0" stroke-width="0.6"/>
  <text x="155" y="132" text-anchor="middle" font-size="9" fill="#4a90c8" font-weight="700">蒸发</text>

  <!-- Condensation in cloud -->
  <text x="230" y="80" text-anchor="middle" font-size="9" fill="#5a7a9a" font-weight="700">凝结</text>

  <!-- Precipitation -->
  <rect x="240" y="112" width="50" height="18" rx="3" fill="rgba(200,230,245,0.8)" stroke="#a0c8e0" stroke-width="0.6"/>
  <text x="265" y="124" text-anchor="middle" font-size="9" fill="#4a8ab8" font-weight="700">降水</text>

  <!-- Runoff -->
  <rect x="315" y="165" width="50" height="18" rx="3" fill="rgba(200,230,245,0.8)" stroke="#a0c8e0" stroke-width="0.6"/>
  <text x="340" y="177" text-anchor="middle" font-size="9" fill="#4a8ab8" font-weight="700">径流</text>

  <!-- Ocean label -->
  <text x="140" y="208" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">海洋</text>

  <!-- Land label -->
  <text x="440" y="178" text-anchor="middle" font-size="9" fill="#3a5a1a" font-weight="700">陆地</text>

  <!-- === MINIATURE BOWL SETUP (inset) === -->
  <g transform="translate(335, 10)">
    <rect x="0" y="0" width="158" height="80" rx="6" fill="rgba(255,255,255,0.7)" stroke="#c0c8d0" stroke-width="0.8"/>
    <text x="79" y="12" text-anchor="middle" font-size="7" fill="#6a7a8a" font-weight="600">微型实验装置</text>

    <!-- Mini bowl -->
    <ellipse cx="55" cy="48" rx="42" ry="12" fill="none" stroke="#b0c0d0" stroke-width="1"/>
    <path d="M13 48 Q13 70 55 70 Q97 70 97 48" fill="none" stroke="#b0c0d0" stroke-width="1"/>
    <path d="M13 48 Q13 70 55 70 Q97 70 97 48" fill="rgba(200,215,230,0.15)" stroke="none"/>

    <!-- Mini water -->
    <ellipse cx="55" cy="58" rx="35" ry="10" fill="rgba(60,160,220,0.4)"/>

    <!-- Mini cup -->
    <rect x="46" y="62" width="18" height="10" rx="1.5" fill="rgba(200,215,235,0.3)" stroke="#a0b8c8" stroke-width="0.5"/>

    <!-- Mini wrap -->
    <path d="M11 47 Q33 38 55 34 Q77 38 99 47" fill="rgba(220,230,240,0.2)" stroke="#c0d0dd" stroke-width="0.5"/>

    <!-- Mini stone -->
    <ellipse cx="55" cy="33" rx="4" ry="2.5" fill="#908070"/>

    <!-- Arrows -->
    <text x="110" y="30" font-size="6" fill="#6a8a9a">↔ 对应</text>
    <text x="110" y="42" font-size="6" fill="#6a8a9a">真实</text>
    <text x="110" y="54" font-size="6" fill="#6a8a9a">水循环</text>
  </g>

  <!-- === CYCLE ARROWS (circular) === -->
  <!-- Large circular arrow showing the cycle -->
  <path d="M80 100 Q40 60 80 40 Q160 0 280 30 Q380 55 430 100 Q460 140 420 175 Q370 210 280 195 Q160 175 100 160" fill="none" stroke="#4a8ab8" stroke-width="1" stroke-dasharray="6,4" opacity="0.25"/>

  <!-- Staying time box -->
  <rect x="8" y="240" width="215" height="52" rx="6" fill="rgba(255,255,255,0.75)" stroke="#c0d0d8" stroke-width="0.8"/>
  <text x="115" y="256" text-anchor="middle" font-size="9" fill="#4a6a8a" font-weight="700">水在各圈层的平均停留时间</text>
  <line x1="18" y1="261" x2="212" y2="261" stroke="#d8e0e8" stroke-width="0.5"/>
  <text x="20" y="274" font-size="8" fill="#5a7a9a">大气：约 9 天</text>
  <text x="95" y="274" font-size="8" fill="#5a7a9a">河流：约 2~3 周</text>
  <text x="170" y="274" font-size="8" fill="#5a7a9a">湖泊：数十年</text>
  <text x="20" y="286" font-size="8" fill="#5a7a9a">土壤水：数月</text>
  <text x="95" y="286" font-size="8" fill="#5a7a9a">地下水：数百年</text>
  <text x="170" y="286" font-size="8" fill="#5a7a9a">海洋：数千年</text>

  <!-- Title -->
  <text x="250" y="300" text-anchor="middle" font-size="11" fill="#4a5a6a" font-weight="600">蒸发 → 凝结 → 降水 → 径流 → 回流：完整水循环</text>
</svg>`}],e={name:"WaterCycle",steps:t};export{e as default};
