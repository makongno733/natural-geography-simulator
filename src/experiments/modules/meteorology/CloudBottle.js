const steps = [
  {
    title: '准备材料',
    content: '准备一个透明塑料瓶（带盖）、少量温水、一根火柴。实验在安全环境下进行，注意防火。',
    highlight: '温水提供水汽，火柴提供凝结核（烟尘颗粒）。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="s1_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdfcf8"/>
      <stop offset="100%" stop-color="#e8e2d5"/>
    </linearGradient>
    <linearGradient id="s1_table" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4b896"/>
      <stop offset="100%" stop-color="#8b6d4a"/>
    </linearGradient>
    <linearGradient id="s1_bottle" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(200,225,245,0.3)"/>
      <stop offset="30%" stop-color="rgba(200,225,245,0.55)"/>
      <stop offset="70%" stop-color="rgba(200,225,245,0.5)"/>
      <stop offset="100%" stop-color="rgba(200,225,245,0.25)"/>
    </linearGradient>
    <linearGradient id="s1_water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a8d8ea"/>
      <stop offset="100%" stop-color="#5b9bd5"/>
    </linearGradient>
    <linearGradient id="s1_cup" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e8e8e8"/>
      <stop offset="50%" stop-color="#f8f8f8"/>
      <stop offset="100%" stop-color="#d0d0d0"/>
    </linearGradient>
    <filter id="s1_drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="#00000028"/>
    </filter>
    <filter id="s1_glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#00000018"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="500" height="225" fill="url(#s1_wall)"/>
  <rect x="0" y="225" width="500" height="75" fill="url(#s1_table)"/>
  <line x1="0" y1="225" x2="500" y2="225" stroke="#b89870" stroke-width="2"/>
  <line x1="0" y1="227" x2="500" y2="227" stroke="#d4c0a0" stroke-width="0.8"/>

  <!-- Bottle -->
  <ellipse cx="155" cy="231" rx="46" ry="9" fill="#00000020"/>
  <rect x="108" y="78" width="84" height="150" rx="12" fill="url(#s1_bottle)" stroke="#8caac4" stroke-width="2.2" filter="url(#s1_drop)"/>
  <rect x="128" y="56" width="44" height="26" rx="5" fill="url(#s1_bottle)" stroke="#8caac4" stroke-width="1.8"/>
  <rect x="124" y="44" width="52" height="16" rx="5" fill="#c0392b" stroke="#922b21" stroke-width="1.5" filter="url(#s1_drop)"/>
  <line x1="128" y1="44" x2="128" y2="60" stroke="#922b21" stroke-width="0.8"/>
  <line x1="134" y1="44" x2="134" y2="60" stroke="#922b21" stroke-width="0.8"/>
  <line x1="140" y1="44" x2="140" y2="60" stroke="#922b21" stroke-width="0.8"/>
  <line x1="146" y1="44" x2="146" y2="60" stroke="#922b21" stroke-width="0.8"/>
  <line x1="152" y1="44" x2="152" y2="60" stroke="#922b21" stroke-width="0.8"/>
  <line x1="158" y1="44" x2="158" y2="60" stroke="#922b21" stroke-width="0.8"/>
  <line x1="164" y1="44" x2="164" y2="60" stroke="#922b21" stroke-width="0.8"/>
  <line x1="170" y1="44" x2="170" y2="60" stroke="#922b21" stroke-width="0.8"/>
  <rect x="116" y="82" width="16" height="140" rx="6" fill="rgba(255,255,255,0.35)"/>
  <path d="M160,82 Q165,150 160,222" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>

  <!-- Cup with warm water -->
  <ellipse cx="288" cy="231" rx="32" ry="7" fill="#00000020"/>
  <path d="M256,158 L266,216 Q288,226 310,216 L320,158 Z" fill="url(#s1_cup)" stroke="#b0b0b0" stroke-width="2" filter="url(#s1_drop)"/>
  <path d="M320,168 Q348,168 348,188 Q348,208 320,204" fill="none" stroke="#b0b0b0" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M261,184 L271,215 Q288,223 305,215 L315,184 Z" fill="url(#s1_water)" opacity="0.75"/>
  <path d="M261,184 Q288,176 315,184" fill="none" stroke="#5b9bd5" stroke-width="1.8"/>
  <path d="M272,152 Q266,128 278,106 Q290,84 276,60" fill="none" stroke="rgba(170,170,175,0.45)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M288,148 Q294,122 284,100 Q274,78 288,55" fill="none" stroke="rgba(170,170,175,0.35)" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M304,150 Q298,130 306,110 Q314,90 302,68" fill="none" stroke="rgba(170,170,175,0.3)" stroke-width="2" stroke-linecap="round"/>

  <!-- Matchbox -->
  <ellipse cx="405" cy="233" rx="34" ry="6" fill="#00000020"/>
  <rect x="372" y="200" width="58" height="30" rx="4" fill="#f0d078" stroke="#c8a840" stroke-width="1.5" filter="url(#s1_drop)"/>
  <rect x="377" y="204" width="48" height="12" rx="2" fill="#c0392b"/>
  <text x="401" y="213" text-anchor="middle" font-size="8" fill="white" font-weight="bold" font-family="sans-serif">火柴</text>
  <rect x="435" y="186" width="42" height="3.5" rx="1.8" fill="#e0c090" stroke="#c0a070" stroke-width="0.6"/>
  <circle cx="479" cy="187.8" r="5" fill="#e74c3c" stroke="#c0392b" stroke-width="0.8"/>
  <ellipse cx="480" cy="183" rx="3.5" ry="6" fill="#f5a623" opacity="0.55"/>

  <!-- Annotations -->
  <line x1="42" y1="108" x2="103" y2="140" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="103" cy="140" r="2.5" fill="#666"/>
  <text x="38" y="104" text-anchor="end" font-size="13" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">透明塑料瓶</text>

  <line x1="350" y1="138" x2="318" y2="168" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="318" cy="168" r="2.5" fill="#666"/>
  <text x="354" y="134" text-anchor="start" font-size="12" fill="#3a3a3a" font-family="sans-serif">温水</text>
  <text x="354" y="150" text-anchor="start" font-size="10" fill="#777" font-family="sans-serif">（水汽来源）</text>

  <line x1="350" y1="65" x2="400" y2="198" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="400" cy="198" r="2.5" fill="#666"/>
  <text x="346" y="61" text-anchor="end" font-size="12" fill="#3a3a3a" font-family="sans-serif">火柴</text>
  <text x="346" y="77" text-anchor="end" font-size="10" fill="#777" font-family="sans-serif">（凝结核来源）</text>

  <circle cx="470" cy="28" r="20" fill="#2c3e50" filter="url(#s1_glow)"/>
  <text x="470" y="35" text-anchor="middle" font-size="18" fill="white" font-weight="bold" font-family="sans-serif">1</text>

  <text x="250" y="278" text-anchor="middle" font-size="14" fill="#5a4535" font-family="sans-serif" font-weight="bold">材料准备：透明塑料瓶（带盖）+ 温水 + 火柴</text>
</svg>`,
  },
  {
    title: '引入水汽和凝结核',
    content: '向瓶中倒入少量温水，轻轻摇晃使瓶壁湿润。点燃火柴，吹灭后迅速将带烟的火柴头伸入瓶中让烟尘进入，拧紧瓶盖。',
    highlight: '烟尘颗粒是云滴形成的必要条件——作为凝结核，水汽在其表面聚集。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="s2_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdfcf8"/>
      <stop offset="100%" stop-color="#e8e2d5"/>
    </linearGradient>
    <linearGradient id="s2_table" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4b896"/>
      <stop offset="100%" stop-color="#8b6d4a"/>
    </linearGradient>
    <linearGradient id="s2_bottle" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(200,225,245,0.3)"/>
      <stop offset="30%" stop-color="rgba(200,225,245,0.55)"/>
      <stop offset="100%" stop-color="rgba(200,225,245,0.25)"/>
    </linearGradient>
    <linearGradient id="s2_water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a8d8ea"/>
      <stop offset="100%" stop-color="#5b9bd5"/>
    </linearGradient>
    <linearGradient id="s2_smoke" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(120,120,120,0.6)"/>
      <stop offset="100%" stop-color="rgba(160,160,160,0.1)"/>
    </linearGradient>
    <filter id="s2_drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="#00000028"/>
    </filter>
    <filter id="s2_glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#00000018"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="500" height="225" fill="url(#s2_wall)"/>
  <rect x="0" y="225" width="500" height="75" fill="url(#s2_table)"/>
  <line x1="0" y1="225" x2="500" y2="225" stroke="#b89870" stroke-width="2"/>

  <!-- Bottle -->
  <ellipse cx="250" cy="231" rx="46" ry="9" fill="#00000020"/>
  <rect x="203" y="78" width="84" height="150" rx="12" fill="url(#s2_bottle)" stroke="#8caac4" stroke-width="2.2" filter="url(#s2_drop)"/>
  <rect x="223" y="56" width="44" height="26" rx="5" fill="url(#s2_bottle)" stroke="#8caac4" stroke-width="1.8"/>
  <rect x="220" y="44" width="50" height="16" rx="5" fill="#c0392b" stroke="#922b21" stroke-width="1.5" filter="url(#s2_drop)"/>
  <line x1="224" y1="44" x2="224" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="230" y1="44" x2="230" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="236" y1="44" x2="236" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="242" y1="44" x2="242" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="248" y1="44" x2="248" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="254" y1="44" x2="254" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="260" y1="44" x2="260" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="266" y1="44" x2="266" y2="60" stroke="#922b21" stroke-width="0.7"/>

  <!-- Water in bottle -->
  <rect x="207" y="190" width="76" height="34" rx="8" fill="url(#s2_water)" opacity="0.7"/>
  <path d="M207,198 Q245,192 283,198" fill="none" stroke="#5b9bd5" stroke-width="1.5"/>

  <!-- Smoke particles inside bottle -->
  <circle cx="225" cy="115" r="3.5" fill="rgba(130,130,130,0.6)"/>
  <circle cx="245" cy="105" r="4.5" fill="rgba(120,120,120,0.55)"/>
  <circle cx="260" cy="120" r="3" fill="rgba(135,135,135,0.5)"/>
  <circle cx="235" cy="95" r="2.5" fill="rgba(125,125,125,0.5)"/>
  <circle cx="255" cy="88" r="3.5" fill="rgba(130,130,130,0.45)"/>
  <circle cx="270" cy="100" r="2.8" fill="rgba(128,128,128,0.48)"/>
  <circle cx="240" cy="80" r="2" fill="rgba(140,140,140,0.4)"/>
  <circle cx="265" cy="75" r="2.5" fill="rgba(135,135,135,0.38)"/>
  <circle cx="250" cy="72" r="1.8" fill="rgba(145,145,145,0.35)"/>
  <circle cx="230" cy="128" r="2.2" fill="rgba(130,130,130,0.55)"/>
  <circle cx="252" cy="130" r="2.8" fill="rgba(125,125,125,0.5)"/>
  <circle cx="268" cy="118" r="2" fill="rgba(135,135,135,0.45)"/>

  <!-- Condensation on walls -->
  <circle cx="215" cy="140" r="1.5" fill="rgba(180,210,240,0.5)"/>
  <circle cx="225" cy="155" r="1.8" fill="rgba(180,210,240,0.45)"/>
  <circle cx="235" cy="148" r="1.3" fill="rgba(180,210,240,0.5)"/>
  <circle cx="270" cy="142" r="1.5" fill="rgba(180,210,240,0.48)"/>
  <circle cx="260" cy="158" r="1.6" fill="rgba(180,210,240,0.45)"/>

  <!-- Match with smoke trail entering bottle -->
  <rect x="100" y="195" width="38" height="3" rx="1.5" fill="#e0c090" stroke="#c0a070" stroke-width="0.5"/>
  <circle cx="100" cy="196.5" r="4.5" fill="#e74c3c" stroke="#c0392b" stroke-width="0.7"/>
  <ellipse cx="98" cy="192" rx="2.5" ry="4.5" fill="#f5a623" opacity="0.4"/>
  <path d="M140,196 Q170,180 200,170 Q210,145 220,130" fill="none" stroke="rgba(150,150,150,0.5)" stroke-width="6" stroke-linecap="round"/>
  <path d="M142,198 Q175,185 205,175 Q215,152 225,138" fill="none" stroke="rgba(160,160,160,0.35)" stroke-width="4" stroke-linecap="round"/>
  <path d="M138,194 Q168,176 198,165" fill="none" stroke="rgba(170,170,170,0.25)" stroke-width="8" stroke-linecap="round"/>

  <!-- Arrow showing smoke path -->
  <path d="M155,170 Q175,158 195,152" fill="none" stroke="#8b4513" stroke-width="2" stroke-dasharray="6,3"/>
  <polygon points="195,148 201,152 193,156" fill="#8b4513"/>

  <!-- Screwing cap - small rotation arrow -->
  <path d="M185,52 Q180,42 190,38 Q200,42 195,52" fill="none" stroke="#e67e22" stroke-width="1.5" stroke-dasharray="3,2"/>
  <polygon points="190,37 192,33 196,39" fill="#e67e22"/>

  <!-- Step badge -->
  <circle cx="470" cy="28" r="20" fill="#2c3e50" filter="url(#s2_glow)"/>
  <text x="470" y="35" text-anchor="middle" font-size="18" fill="white" font-weight="bold" font-family="sans-serif">2</text>

  <!-- Annotations -->
  <line x1="60" y1="90" x2="222" y2="118" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="222" cy="118" r="2.5" fill="#666"/>
  <text x="56" y="86" text-anchor="end" font-size="12" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">烟尘颗粒</text>
  <text x="56" y="102" text-anchor="end" font-size="10" fill="#777" font-family="sans-serif">（凝结核）</text>

  <line x1="355" y1="180" x2="290" y2="196" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="290" cy="196" r="2.5" fill="#666"/>
  <text x="360" y="176" text-anchor="start" font-size="12" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">温水</text>
  <text x="360" y="192" text-anchor="start" font-size="10" fill="#777" font-family="sans-serif">（水汽）</text>

  <line x1="340" y1="52" x2="275" y2="52" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="275" cy="52" r="2.5" fill="#666"/>
  <text x="344" y="48" text-anchor="start" font-size="12" fill="#e67e22" font-family="sans-serif" font-weight="bold">拧紧瓶盖</text>

  <text x="250" y="278" text-anchor="middle" font-size="14" fill="#5a4535" font-family="sans-serif" font-weight="bold">吹灭火柴 → 烟尘入瓶 → 拧紧瓶盖密封</text>
</svg>`,
  },
  {
    title: '加压——压缩升温',
    content: '用手用力挤压瓶身。瓶内气压增大，空气压缩后温度升高（绝热压缩），相对湿度降低，瓶中透明无云。',
    highlight: '绝热压缩：体积减小 → 温度升高 → 饱和水汽压升高 → 相对湿度下降。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="s3_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdfcf8"/>
      <stop offset="100%" stop-color="#e8e2d5"/>
    </linearGradient>
    <linearGradient id="s3_table" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4b896"/>
      <stop offset="100%" stop-color="#8b6d4a"/>
    </linearGradient>
    <linearGradient id="s3_bottle" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(200,225,245,0.3)"/>
      <stop offset="30%" stop-color="rgba(200,225,245,0.55)"/>
      <stop offset="100%" stop-color="rgba(200,225,245,0.25)"/>
    </linearGradient>
    <linearGradient id="s3_forceL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e74c3c"/>
      <stop offset="100%" stop-color="#e74c3c00"/>
    </linearGradient>
    <linearGradient id="s3_forceR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e74c3c00"/>
      <stop offset="100%" stop-color="#e74c3c"/>
    </linearGradient>
    <linearGradient id="s3_handL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#f5c6a0"/>
      <stop offset="100%" stop-color="#e8b890"/>
    </linearGradient>
    <linearGradient id="s3_handR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f5c6a0"/>
      <stop offset="100%" stop-color="#e8b890"/>
    </linearGradient>
    <filter id="s3_drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="#00000028"/>
    </filter>
    <filter id="s3_glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#00000018"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="500" height="225" fill="url(#s3_wall)"/>
  <rect x="0" y="225" width="500" height="75" fill="url(#s3_table)"/>
  <line x1="0" y1="225" x2="500" y2="225" stroke="#b89870" stroke-width="2"/>

  <!-- Compressed bottle (narrowed in middle) -->
  <ellipse cx="250" cy="231" rx="40" ry="8" fill="#00000020"/>
  <path d="M208,80 L208,110 Q210,155 218,185 Q225,210 232,225 L268,225 Q275,210 282,185 Q290,155 292,110 L292,80 Z" fill="url(#s3_bottle)" stroke="#c0392b" stroke-width="2.8" filter="url(#s3_drop)"/>
  <rect x="228" y="56" width="44" height="28" rx="5" fill="url(#s3_bottle)" stroke="#c0392b" stroke-width="2"/>
  <rect x="224" y="44" width="52" height="16" rx="5" fill="#c0392b" stroke="#922b21" stroke-width="1.5" filter="url(#s3_drop)"/>
  <line x1="228" y1="44" x2="228" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="234" y1="44" x2="234" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="240" y1="44" x2="240" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="246" y1="44" x2="246" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="252" y1="44" x2="252" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="258" y1="44" x2="258" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="264" y1="44" x2="264" y2="60" stroke="#922b21" stroke-width="0.7"/>
  <line x1="270" y1="44" x2="270" y2="60" stroke="#922b21" stroke-width="0.7"/>

  <!-- Left hand pressing -->
  <path d="M60,145 Q90,100 120,115 Q130,140 125,170 Q115,200 65,200 Q40,195 30,180 Q20,165 30,155 Q40,145 60,145 Z" fill="url(#s3_handL)" stroke="#d4956a" stroke-width="2" filter="url(#s3_drop)"/>
  <path d="M120,115 Q130,138 125,155" fill="none" stroke="#d4956a" stroke-width="1.5"/>
  <path d="M122,120 Q132,143 127,160" fill="none" stroke="#d4956a" stroke-width="1.2"/>
  <path d="M115,125 Q125,148 120,158" fill="none" stroke="#d4956a" stroke-width="1.2"/>

  <!-- Right hand pressing -->
  <path d="M440,145 Q410,100 380,115 Q370,140 375,170 Q385,200 435,200 Q460,195 470,180 Q480,165 470,155 Q460,145 440,145 Z" fill="url(#s3_handR)" stroke="#d4956a" stroke-width="2" filter="url(#s3_drop)"/>
  <path d="M380,115 Q370,138 375,155" fill="none" stroke="#d4956a" stroke-width="1.5"/>
  <path d="M378,120 Q368,143 373,160" fill="none" stroke="#d4956a" stroke-width="1.2"/>
  <path d="M385,125 Q375,148 380,158" fill="none" stroke="#d4956a" stroke-width="1.2"/>

  <!-- Force arrows - left -->
  <line x1="155" y1="90" x2="198" y2="90" stroke="#c0392b" stroke-width="3.5"/>
  <polygon points="198,84 208,90 198,96" fill="#c0392b"/>
  <line x1="155" y1="155" x2="212" y2="155" stroke="#c0392b" stroke-width="3.5"/>
  <polygon points="212,149 222,155 212,161" fill="#c0392b"/>

  <!-- Force arrows - right -->
  <line x1="345" y1="90" x2="302" y2="90" stroke="#c0392b" stroke-width="3.5"/>
  <polygon points="345,84 335,90 345,96" fill="#c0392b"/>
  <line x1="345" y1="155" x2="288" y2="155" stroke="#c0392b" stroke-width="3.5"/>
  <polygon points="288,149 278,155 288,161" fill="#c0392b"/>

  <!-- Clear interior indication -->
  <text x="250" y="170" text-anchor="middle" font-size="11" fill="#888" font-family="sans-serif" font-weight="bold">瓶内清澈</text>
  <text x="250" y="185" text-anchor="middle" font-size="11" fill="#888" font-family="sans-serif" font-weight="bold">无云</text>

  <!-- Step badge -->
  <circle cx="470" cy="28" r="20" fill="#2c3e50" filter="url(#s3_glow)"/>
  <text x="470" y="35" text-anchor="middle" font-size="18" fill="white" font-weight="bold" font-family="sans-serif">3</text>

  <!-- Annotations -->
  <text x="250" y="255" text-anchor="middle" font-size="13" fill="#c0392b" font-family="sans-serif" font-weight="bold">体积↓ 温度↑ 气压↑</text>

  <line x1="40" y1="40" x2="200" y2="80" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <text x="36" y="36" text-anchor="end" font-size="12" fill="#c0392b" font-family="sans-serif" font-weight="bold">加压（双手挤压）</text>

  <line x1="460" y1="40" x2="310" y2="80" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <text x="464" y="36" text-anchor="start" font-size="12" fill="#c0392b" font-family="sans-serif" font-weight="bold">绝热压缩</text>

  <text x="250" y="278" text-anchor="middle" font-size="14" fill="#5a4535" font-family="sans-serif" font-weight="bold">压缩瓶身 → 体积减小 → 绝热升温 → 相对湿度下降 → 无云</text>
</svg>`,
  },
  {
    title: '释压——膨胀降温，云形成',
    content: '快速松开手让瓶子回弹。空气绝热膨胀温度骤降，相对湿度超过 100%，水汽在烟尘颗粒上凝结成微小水滴——瓶中出现了可见的"云"！',
    highlight: '绝热膨胀是大气成云的核心机制。空气上升→气压降低→膨胀冷却→水汽凝结→云。干绝热递减率约 10°C/km。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="s4_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdfcf8"/>
      <stop offset="100%" stop-color="#e8e2d5"/>
    </linearGradient>
    <linearGradient id="s4_table" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4b896"/>
      <stop offset="100%" stop-color="#8b6d4a"/>
    </linearGradient>
    <linearGradient id="s4_bottle" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(200,225,245,0.3)"/>
      <stop offset="30%" stop-color="rgba(200,225,245,0.55)"/>
      <stop offset="100%" stop-color="rgba(200,225,245,0.25)"/>
    </linearGradient>
    <linearGradient id="s4_cloud" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.98)"/>
      <stop offset="100%" stop-color="rgba(240,245,250,0.9)"/>
    </linearGradient>
    <filter id="s4_drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="#00000028"/>
    </filter>
    <filter id="s4_cloudShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="2" dy="3" stdDeviation="4" flood-color="#00000015"/>
    </filter>
    <filter id="s4_glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#00000018"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="500" height="225" fill="url(#s4_wall)"/>
  <rect x="0" y="225" width="500" height="75" fill="url(#s4_table)"/>
  <line x1="0" y1="225" x2="500" y2="225" stroke="#b89870" stroke-width="2"/>

  <!-- Expanded bottle (normal shape) -->
  <ellipse cx="250" cy="231" rx="48" ry="9" fill="#00000020"/>
  <rect x="202" y="76" width="96" height="152" rx="12" fill="url(#s4_bottle)" stroke="#27ae60" stroke-width="2.8" filter="url(#s4_drop)"/>
  <rect x="222" y="54" width="56" height="26" rx="5" fill="url(#s4_bottle)" stroke="#27ae60" stroke-width="2"/>
  <rect x="218" y="42" width="64" height="16" rx="5" fill="#27ae60" stroke="#1e8449" stroke-width="1.5" filter="url(#s4_drop)"/>
  <line x1="222" y1="42" x2="222" y2="58" stroke="#1e8449" stroke-width="0.7"/>
  <line x1="230" y1="42" x2="230" y2="58" stroke="#1e8449" stroke-width="0.7"/>
  <line x1="238" y1="42" x2="238" y2="58" stroke="#1e8449" stroke-width="0.7"/>
  <line x1="246" y1="42" x2="246" y2="58" stroke="#1e8449" stroke-width="0.7"/>
  <line x1="254" y1="42" x2="254" y2="58" stroke="#1e8449" stroke-width="0.7"/>
  <line x1="262" y1="42" x2="262" y2="58" stroke="#1e8449" stroke-width="0.7"/>
  <line x1="270" y1="42" x2="270" y2="58" stroke="#1e8449" stroke-width="0.7"/>
  <line x1="278" y1="42" x2="278" y2="58" stroke="#1e8449" stroke-width="0.7"/>
  <rect x="210" y="82" width="18" height="140" rx="6" fill="rgba(255,255,255,0.3)"/>

  <!-- Cloud inside bottle -->
  <g filter="url(#s4_cloudShadow)">
    <circle cx="235" cy="130" r="18" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
    <circle cx="260" cy="120" r="22" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
    <circle cx="250" cy="105" r="16" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
    <circle cx="275" cy="110" r="14" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
    <circle cx="220" cy="115" r="12" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
    <circle cx="245" cy="140" r="15" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
    <circle cx="265" cy="138" r="13" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
    <circle cx="255" cy="152" r="11" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
    <circle cx="240" cy="95" r="10" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
    <circle cx="270" cy="95" r="9" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
    <circle cx="258" cy="85" r="8" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
    <circle cx="230" cy="105" r="8" fill="url(#s4_cloud)" stroke="rgba(200,200,210,0.6)" stroke-width="1.2"/>
  </g>

  <!-- Expansion arrows - left -->
  <line x1="100" y1="95" x2="195" y2="95" stroke="#27ae60" stroke-width="3"/>
  <polygon points="100,89 90,95 100,101" fill="#27ae60"/>
  <line x1="100" y1="155" x2="195" y2="155" stroke="#27ae60" stroke-width="3"/>
  <polygon points="100,149 90,155 100,161" fill="#27ae60"/>

  <!-- Expansion arrows - right -->
  <line x1="400" y1="95" x2="305" y2="95" stroke="#27ae60" stroke-width="3"/>
  <polygon points="400,89 410,95 400,101" fill="#27ae60"/>
  <line x1="400" y1="155" x2="305" y2="155" stroke="#27ae60" stroke-width="3"/>
  <polygon points="400,149 410,155 400,161" fill="#27ae60"/>

  <!-- Temperature indicator -->
  <text x="85" y="185" text-anchor="middle" font-size="12" fill="#27ae60" font-family="sans-serif" font-weight="bold">释压</text>

  <text x="415" y="185" text-anchor="middle" font-size="12" fill="#27ae60" font-family="sans-serif" font-weight="bold">释压</text>

  <!-- Step badge -->
  <circle cx="470" cy="28" r="20" fill="#2c3e50" filter="url(#s4_glow)"/>
  <text x="470" y="35" text-anchor="middle" font-size="18" fill="white" font-weight="bold" font-family="sans-serif">4</text>

  <!-- Annotations -->
  <text x="250" y="255" text-anchor="middle" font-size="15" fill="#27ae60" font-family="sans-serif" font-weight="bold">云形成！体积↑ 温度↓ 过饱和 → 水汽凝结</text>

  <line x1="30" y1="200" x2="208" y2="140" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="24" y="198" text-anchor="end" font-size="11" fill="#3a3a3a" font-family="sans-serif">绝热膨胀</text>

  <line x1="470" y1="200" x2="300" y2="130" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="476" y="198" text-anchor="start" font-size="11" fill="#3a3a3a" font-family="sans-serif">膨胀冷却</text>

  <text x="250" y="278" text-anchor="middle" font-size="14" fill="#5a4535" font-family="sans-serif" font-weight="bold">释压 → 体积膨胀 → 绝热降温 → 过饱和 → 水汽凝结成云</text>
</svg>`,
  },
  {
    title: '重复观察与总结',
    content: '反复挤压释放几次，观察云的反复出现和消失。挤压（加压升温）时云消失，释放（减压降温）时云重新形成。真实大气中湿空气上升冷却成云，干绝热递减率约 10°C/km，湿绝热递减率约 6°C/km。',
    highlight: '云滴直径约 10-20 μm，一滴雨滴含约 100 万个云滴。水在大气中平均停留时间约 9 天。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="s5_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdfcf8"/>
      <stop offset="100%" stop-color="#e8e2d5"/>
    </linearGradient>
    <linearGradient id="s5_table" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4b896"/>
      <stop offset="100%" stop-color="#8b6d4a"/>
    </linearGradient>
    <linearGradient id="s5_bottle_comp" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(220,230,245,0.35)"/>
      <stop offset="50%" stop-color="rgba(220,230,245,0.6)"/>
      <stop offset="100%" stop-color="rgba(220,230,245,0.3)"/>
    </linearGradient>
    <linearGradient id="s5_bottle_cloud" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(200,230,220,0.35)"/>
      <stop offset="50%" stop-color="rgba(200,230,220,0.6)"/>
      <stop offset="100%" stop-color="rgba(200,230,220,0.3)"/>
    </linearGradient>
    <linearGradient id="s5_cloudGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.98)"/>
      <stop offset="100%" stop-color="rgba(240,245,250,0.9)"/>
    </linearGradient>
    <filter id="s5_drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="#00000028"/>
    </filter>
    <filter id="s5_cloudShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="2" dy="3" stdDeviation="4" flood-color="#00000015"/>
    </filter>
    <filter id="s5_glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#00000018"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="500" height="225" fill="url(#s5_wall)"/>
  <rect x="0" y="225" width="500" height="75" fill="url(#s5_table)"/>
  <line x1="0" y1="225" x2="500" y2="225" stroke="#b89870" stroke-width="2"/>

  <!-- Panel 1: Compressed bottle (clear) -->
  <rect x="35" y="55" width="110" height="155" rx="8" fill="url(#s5_bottle_comp)" stroke="#c0392b" stroke-width="2.5" filter="url(#s5_drop)"/>
  <rect x="55" y="42" width="70" height="17" rx="5" fill="#c0392b" stroke="#922b21" stroke-width="1.2"/>
  <line x1="60" y1="42" x2="60" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="68" y1="42" x2="68" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="76" y1="42" x2="76" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="84" y1="42" x2="84" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="92" y1="42" x2="92" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="100" y1="42" x2="100" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="108" y1="42" x2="108" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="116" y1="42" x2="116" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <text x="90" y="145" text-anchor="middle" font-size="12" fill="#c0392b" font-family="sans-serif" font-weight="bold">压缩</text>
  <text x="90" y="163" text-anchor="middle" font-size="10" fill="#888" font-family="sans-serif">瓶内清澈</text>
  <text x="90" y="178" text-anchor="middle" font-size="10" fill="#888" font-family="sans-serif">无云</text>
  <text x="90" y="198" text-anchor="middle" font-size="9" fill="#c0392b" font-family="sans-serif">体积↓ 温度↑</text>

  <!-- Panel 2: Cloud in bottle -->
  <rect x="195" y="55" width="110" height="155" rx="8" fill="url(#s5_bottle_cloud)" stroke="#27ae60" stroke-width="2.5" filter="url(#s5_drop)"/>
  <rect x="215" y="42" width="70" height="17" rx="5" fill="#27ae60" stroke="#1e8449" stroke-width="1.2"/>
  <line x1="220" y1="42" x2="220" y2="59" stroke="#1e8449" stroke-width="0.6"/>
  <line x1="228" y1="42" x2="228" y2="59" stroke="#1e8449" stroke-width="0.6"/>
  <line x1="236" y1="42" x2="236" y2="59" stroke="#1e8449" stroke-width="0.6"/>
  <line x1="244" y1="42" x2="244" y2="59" stroke="#1e8449" stroke-width="0.6"/>
  <line x1="252" y1="42" x2="252" y2="59" stroke="#1e8449" stroke-width="0.6"/>
  <line x1="260" y1="42" x2="260" y2="59" stroke="#1e8449" stroke-width="0.6"/>
  <line x1="268" y1="42" x2="268" y2="59" stroke="#1e8449" stroke-width="0.6"/>
  <line x1="276" y1="42" x2="276" y2="59" stroke="#1e8449" stroke-width="0.6"/>

  <!-- Cloud shapes -->
  <g filter="url(#s5_cloudShadow)">
    <circle cx="235" cy="110" r="14" fill="url(#s5_cloudGrad)" stroke="rgba(200,210,220,0.5)" stroke-width="1"/>
    <circle cx="255" cy="105" r="12" fill="url(#s5_cloudGrad)" stroke="rgba(200,210,220,0.5)" stroke-width="1"/>
    <circle cx="245" cy="95" r="10" fill="url(#s5_cloudGrad)" stroke="rgba(200,210,220,0.5)" stroke-width="1"/>
    <circle cx="265" cy="112" r="9" fill="url(#s5_cloudGrad)" stroke="rgba(200,210,220,0.5)" stroke-width="1"/>
    <circle cx="225" cy="108" r="9" fill="url(#s5_cloudGrad)" stroke="rgba(200,210,220,0.5)" stroke-width="1"/>
    <circle cx="250" cy="118" r="10" fill="url(#s5_cloudGrad)" stroke="rgba(200,210,220,0.5)" stroke-width="1"/>
    <circle cx="240" cy="102" r="7" fill="url(#s5_cloudGrad)" stroke="rgba(200,210,220,0.5)" stroke-width="1"/>
  </g>

  <text x="250" y="145" text-anchor="middle" font-size="12" fill="#27ae60" font-family="sans-serif" font-weight="bold">释压</text>
  <text x="250" y="163" text-anchor="middle" font-size="10" fill="#27ae60" font-family="sans-serif">云形成！</text>
  <text x="250" y="178" text-anchor="middle" font-size="9" fill="#27ae60" font-family="sans-serif">体积↑ 温度↓</text>
  <text x="250" y="193" text-anchor="middle" font-size="9" fill="#27ae60" font-family="sans-serif">过饱和凝结</text>

  <!-- Panel 3: Compressed again (clear) -->
  <rect x="355" y="55" width="110" height="155" rx="8" fill="url(#s5_bottle_comp)" stroke="#c0392b" stroke-width="2.5" filter="url(#s5_drop)"/>
  <rect x="375" y="42" width="70" height="17" rx="5" fill="#c0392b" stroke="#922b21" stroke-width="1.2"/>
  <line x1="380" y1="42" x2="380" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="388" y1="42" x2="388" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="396" y1="42" x2="396" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="404" y1="42" x2="404" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="412" y1="42" x2="412" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="420" y1="42" x2="420" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="428" y1="42" x2="428" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <line x1="436" y1="42" x2="436" y2="59" stroke="#922b21" stroke-width="0.6"/>
  <text x="410" y="145" text-anchor="middle" font-size="12" fill="#c0392b" font-family="sans-serif" font-weight="bold">再压缩</text>
  <text x="410" y="163" text-anchor="middle" font-size="10" fill="#888" font-family="sans-serif">云消失</text>
  <text x="410" y="178" text-anchor="middle" font-size="10" fill="#888" font-family="sans-serif">瓶内清澈</text>
  <text x="410" y="198" text-anchor="middle" font-size="9" fill="#c0392b" font-family="sans-serif">体积↓ 温度↑</text>

  <!-- Cycle arrows -->
  <!-- Arrow 1: Panel 1 -> Panel 2 (top) -->
  <path d="M150,85 Q170,50 190,65" fill="none" stroke="#e67e22" stroke-width="2.5"/>
  <polygon points="190,61 196,65 190,69" fill="#e67e22"/>

  <!-- Arrow 2: Panel 2 -> Panel 3 (top) -->
  <path d="M310,65 Q330,50 350,85" fill="none" stroke="#27ae60" stroke-width="2.5"/>
  <polygon points="350,81 356,85 350,89" fill="#27ae60"/>

  <!-- Arrow 3: Panel 3 -> Panel 1 (bottom, return cycle) -->
  <path d="M410,215 Q250,240 90,215" fill="none" stroke="#3498db" stroke-width="2" stroke-dasharray="8,4"/>
  <polygon points="90,211 84,215 90,219" fill="#3498db"/>

  <!-- Cycle labels -->
  <text x="170" y="42" text-anchor="middle" font-size="10" fill="#e67e22" font-family="sans-serif" font-weight="bold">绝热压缩</text>
  <text x="170" y="54" text-anchor="middle" font-size="8" fill="#e67e22" font-family="sans-serif">升温</text>

  <text x="330" y="42" text-anchor="middle" font-size="10" fill="#27ae60" font-family="sans-serif" font-weight="bold">绝热膨胀</text>
  <text x="330" y="54" text-anchor="middle" font-size="8" fill="#27ae60" font-family="sans-serif">降温</text>

  <text x="250" y="240" text-anchor="middle" font-size="9" fill="#3498db" font-family="sans-serif">循环往复</text>

  <!-- Step badge -->
  <circle cx="470" cy="28" r="20" fill="#2c3e50" filter="url(#s5_glow)"/>
  <text x="470" y="35" text-anchor="middle" font-size="18" fill="white" font-weight="bold" font-family="sans-serif">5</text>

  <text x="250" y="278" text-anchor="middle" font-size="14" fill="#5a4535" font-family="sans-serif" font-weight="bold">压缩升温无云 ⟷ 释压降温成云（绝热过程循环）</text>
</svg>`,
  },
]

export default { name: "CloudBottle", steps }
