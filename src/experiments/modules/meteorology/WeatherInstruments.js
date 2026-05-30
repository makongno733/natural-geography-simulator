const steps = [
  {
    title: '气球气压计',
    content: '将气球剪开，绷紧覆盖在广口瓶口，用橡皮筋扎紧。吸管一端粘在气球膜中央，另一端作指针。气压变化使气球膜变形，带动指针偏移。气压↑→膜凹陷→指针上翘；气压↓→膜凸起→指针下垂。',
    highlight: '气压变化引起密闭瓶内外压力差，使弹性膜变形。标准大气压 = 1013.25 hPa。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="b1_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdfcf8"/>
      <stop offset="100%" stop-color="#e8e2d5"/>
    </linearGradient>
    <linearGradient id="b1_table" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4b896"/>
      <stop offset="100%" stop-color="#8b6d4a"/>
    </linearGradient>
    <linearGradient id="b1_jar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(210,225,240,0.3)"/>
      <stop offset="40%" stop-color="rgba(210,225,240,0.55)"/>
      <stop offset="100%" stop-color="rgba(210,225,240,0.2)"/>
    </linearGradient>
    <linearGradient id="b1_membrane" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#f5a623"/>
      <stop offset="100%" stop-color="#f8c978"/>
    </linearGradient>
    <linearGradient id="b1_membraneLow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8c978"/>
      <stop offset="100%" stop-color="#e67e22"/>
    </linearGradient>
    <linearGradient id="b1_scale" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#faf8f2"/>
      <stop offset="100%" stop-color="#e8e0d0"/>
    </linearGradient>
    <filter id="b1_drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="#00000028"/>
    </filter>
    <filter id="b1_glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#00000018"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="500" height="225" fill="url(#b1_wall)"/>
  <rect x="0" y="225" width="500" height="75" fill="url(#b1_table)"/>
  <line x1="0" y1="225" x2="500" y2="225" stroke="#b89870" stroke-width="2"/>

  <!-- Jar shadow -->
  <ellipse cx="180" cy="231" rx="42" ry="8" fill="#00000020"/>
  <!-- Glass jar -->
  <rect x="135" y="120" width="90" height="108" rx="8" fill="url(#b1_jar)" stroke="#9bb5cc" stroke-width="2.2" filter="url(#b1_drop)"/>
  <rect x="140" y="124" width="20" height="100" rx="5" fill="rgba(255,255,255,0.25)"/>
  <!-- Jar rim -->
  <rect x="130" y="115" width="100" height="10" rx="3" fill="url(#b1_jar)" stroke="#9bb5cc" stroke-width="1.8"/>

  <!-- Balloon membrane (high pressure state - depressed) -->
  <ellipse cx="180" cy="118" rx="48" ry="8" fill="url(#b1_membrane)" stroke="#d4952a" stroke-width="1.8" filter="url(#b1_drop)"/>
  <!-- Elastic band -->
  <rect x="128" y="110" width="104" height="7" rx="3.5" fill="#e67e22" stroke="#c0651a" stroke-width="1.5"/>

  <!-- Glue dot at center of membrane -->
  <circle cx="180" cy="116" r="4" fill="#f5f0e0" stroke="#d0c8b0" stroke-width="1"/>

  <!-- Straw pointer (extending right from membrane center) -->
  <line x1="180" y1="116" x2="370" y2="62" stroke="#c0392b" stroke-width="3" stroke-linecap="round" filter="url(#b1_drop)"/>
  <!-- Straw pointer tip / arrow head -->
  <polygon points="370,62 375,56 377,65" fill="#c0392b"/>

  <!-- Scale board -->
  <rect x="380" y="28" width="80" height="160" rx="4" fill="url(#b1_scale)" stroke="#b8a880" stroke-width="1.8" filter="url(#b1_drop)"/>
  <!-- Scale markings -->
  <line x1="420" y1="45" x2="450" y2="45" stroke="#333" stroke-width="1"/>
  <line x1="425" y1="65" x2="450" y2="65" stroke="#333" stroke-width="1"/>
  <line x1="420" y1="85" x2="450" y2="85" stroke="#333" stroke-width="1.5"/>
  <line x1="425" y1="105" x2="450" y2="105" stroke="#333" stroke-width="1"/>
  <line x1="420" y1="125" x2="450" y2="125" stroke="#333" stroke-width="1.5"/>
  <line x1="425" y1="145" x2="450" y2="145" stroke="#333" stroke-width="1"/>
  <line x1="420" y1="165" x2="450" y2="165" stroke="#333" stroke-width="1"/>
  <text x="415" y="48" text-anchor="end" font-size="9" fill="#333" font-family="sans-serif">高</text>
  <text x="415" y="88" text-anchor="end" font-size="9" fill="#333" font-family="sans-serif" font-weight="bold">— 正常 —</text>
  <text x="415" y="128" text-anchor="end" font-size="9" fill="#333" font-family="sans-serif" font-weight="bold">— 正常 —</text>
  <text x="415" y="168" text-anchor="end" font-size="9" fill="#333" font-family="sans-serif">低</text>
  <text x="420" y="200" text-anchor="middle" font-size="10" fill="#555" font-family="sans-serif">气压</text>
  <text x="420" y="212" text-anchor="middle" font-size="10" fill="#555" font-family="sans-serif">刻度</text>

  <!-- Dotted lines showing alternative pointer positions -->
  <!-- Low pressure: membrane bulges up, pointer goes down -->
  <ellipse cx="180" cy="112" rx="48" ry="10" fill="none" stroke="#3498db" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.7"/>
  <line x1="180" y1="112" x2="370" y2="168" stroke="#3498db" stroke-width="2.5" stroke-dasharray="6,4" opacity="0.6" stroke-linecap="round"/>
  <polygon points="370,168 375,162 377,171" fill="#3498db" opacity="0.6"/>

  <!-- Annotations -->
  <line x1="60" y1="60" x2="175" y2="108" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <circle cx="175" cy="108" r="2" fill="#666"/>
  <text x="56" y="56" text-anchor="end" font-size="11" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">气球膜</text>
  <text x="56" y="72" text-anchor="end" font-size="9" fill="#777" font-family="sans-serif">（弹性膜）</text>

  <line x1="40" y1="230" x2="135" y2="210" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <circle cx="135" cy="210" r="2" fill="#666"/>
  <text x="36" y="226" text-anchor="end" font-size="11" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">广口瓶</text>

  <line x1="300" y1="40" x2="285" y2="85" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <circle cx="285" cy="85" r="2" fill="#666"/>
  <text x="304" y="36" text-anchor="start" font-size="11" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">吸管指针</text>

  <line x1="460" y1="240" x2="430" y2="170" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <circle cx="430" cy="170" r="2" fill="#666"/>
  <text x="464" y="236" text-anchor="start" font-size="11" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">气压刻度板</text>

  <!-- Low pressure indicator annotation -->
  <line x1="290" y1="90" x2="270" y2="100" stroke="#3498db" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="294" y="88" text-anchor="start" font-size="9" fill="#3498db" font-family="sans-serif">低压（膜凸起→指针↓）</text>

  <!-- High pressure indicator -->
  <text x="294" y="76" text-anchor="start" font-size="9" fill="#c0392b" font-family="sans-serif">高压（膜凹陷→指针↑）</text>

  <!-- Step badge -->
  <circle cx="470" cy="28" r="20" fill="#2c3e50" filter="url(#b1_glow)"/>
  <text x="470" y="35" text-anchor="middle" font-size="18" fill="white" font-weight="bold" font-family="sans-serif">1</text>

  <text x="250" y="278" text-anchor="middle" font-size="14" fill="#5a4535" font-family="sans-serif" font-weight="bold">广口瓶 + 气球膜 + 橡皮筋 + 吸管指针 + 刻度板</text>
</svg>`,
  },
  {
    title: '乒乓球风速计',
    content: '将乒乓球用细线悬挂在量角器中心。风吹动乒乓球使细线偏离垂直方向。测量偏角 θ，风速 v 与 tanθ 成正比。偏角越大风速越大，可用已知风速校准。',
    highlight: '风对球的拖曳力与风速平方成正比。蒲福风级将风速分为 0-12 级。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="a2_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdfcf8"/>
      <stop offset="100%" stop-color="#e8e2d5"/>
    </linearGradient>
    <linearGradient id="a2_table" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4b896"/>
      <stop offset="100%" stop-color="#8b6d4a"/>
    </linearGradient>
    <linearGradient id="a2_protractor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#faf8f2"/>
      <stop offset="100%" stop-color="#e0d8c8"/>
    </linearGradient>
    <linearGradient id="a2_ball" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fefefe"/>
      <stop offset="100%" stop-color="#e8e0d0"/>
    </linearGradient>
    <filter id="a2_drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="#00000028"/>
    </filter>
    <filter id="a2_glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#00000018"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="500" height="230" fill="url(#a2_wall)"/>
  <rect x="0" y="230" width="500" height="70" fill="url(#a2_table)"/>
  <line x1="0" y1="230" x2="500" y2="230" stroke="#b89870" stroke-width="2"/>

  <!-- Stand / mounting board -->
  <rect x="140" y="50" width="12" height="180" rx="3" fill="#8b6f4e" stroke="#6b4f2e" stroke-width="1.5" filter="url(#a2_drop)"/>
  <rect x="110" y="220" width="72" height="12" rx="3" fill="#8b6f4e" stroke="#6b4f2e" stroke-width="1.5"/>

  <!-- Protractor (semicircle) -->
  <path d="M70,155 A130,130 0 0,1 330,155" fill="url(#a2_protractor)" stroke="#b8a880" stroke-width="2.5" filter="url(#a2_drop)"/>
  <path d="M70,155 A130,130 0 0,1 330,155" fill="none" stroke="#b8a880" stroke-width="2.5"/>

  <!-- Protractor degree markings -->
  <line x1="200" y1="30" x2="200" y2="42" stroke="#333" stroke-width="1.5"/>
  <text x="200" y="52" text-anchor="middle" font-size="10" fill="#333" font-family="sans-serif">90°</text>

  <line x1="108" y1="48" x2="118" y2="56" stroke="#333" stroke-width="1"/>
  <text x="100" y="60" text-anchor="middle" font-size="8" fill="#666" font-family="sans-serif">60°</text>

  <line x1="292" y1="48" x2="282" y2="56" stroke="#333" stroke-width="1"/>
  <text x="300" y="60" text-anchor="middle" font-size="8" fill="#666" font-family="sans-serif">60°</text>

  <line x1="75" y1="105" x2="90" y2="108" stroke="#333" stroke-width="1"/>
  <text x="62" y="112" text-anchor="middle" font-size="8" fill="#666" font-family="sans-serif">30°</text>

  <line x1="325" y1="105" x2="310" y2="108" stroke="#333" stroke-width="1"/>
  <text x="338" y="112" text-anchor="middle" font-size="8" fill="#666" font-family="sans-serif">30°</text>

  <text x="58" y="162" text-anchor="middle" font-size="9" fill="#666" font-family="sans-serif">0°</text>
  <text x="342" y="162" text-anchor="middle" font-size="9" fill="#666" font-family="sans-serif">0°</text>

  <!-- Center pivot point -->
  <circle cx="200" cy="30" r="5" fill="#c0392b" stroke="#922b21" stroke-width="1.5"/>

  <!-- String (vertical reference) -->
  <line x1="200" y1="30" x2="200" y2="155" stroke="#999" stroke-width="0.8" stroke-dasharray="4,4"/>

  <!-- String with deflection (wind blowing from left) -->
  <line x1="200" y1="30" x2="278" y2="128" stroke="#302820" stroke-width="1.8"/>

  <!-- Ping-pong ball -->
  <circle cx="285" cy="134" r="18" fill="url(#a2_ball)" stroke="#e0d0b0" stroke-width="2" filter="url(#a2_drop)"/>
  <text x="285" y="130" text-anchor="middle" font-size="8" fill="#999" font-family="sans-serif">乒乓</text>
  <text x="285" y="140" text-anchor="middle" font-size="8" fill="#999" font-family="sans-serif">球</text>

  <!-- Angle θ arc -->
  <path d="M200,60 A30,30 0 0,1 230,52" fill="none" stroke="#c0392b" stroke-width="2"/>
  <text x="235" y="58" text-anchor="start" font-size="12" fill="#c0392b" font-family="sans-serif" font-weight="bold">θ</text>

  <!-- Wind arrows -->
  <line x1="370" y1="115" x2="330" y2="125" stroke="#5ba0d0" stroke-width="2.5"/>
  <polygon points="330,119 325,125 330,131" fill="#5ba0d0"/>
  <line x1="380" y1="105" x2="345" y2="112" stroke="#5ba0d0" stroke-width="2"/>
  <polygon points="345,106 340,112 345,118" fill="#5ba0d0"/>
  <line x1="375" y1="130" x2="340" y2="135" stroke="#5ba0d0" stroke-width="2"/>
  <polygon points="340,129 335,135 340,141" fill="#5ba0d0"/>

  <!-- Annotations -->
  <line x1="370" y1="60" x2="293" y2="133" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <circle cx="293" cy="133" r="2" fill="#666"/>
  <text x="374" y="56" text-anchor="start" font-size="11" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">乒乓球</text>

  <line x1="30" y1="74" x2="195" y2="48" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <circle cx="195" cy="48" r="2" fill="#666"/>
  <text x="26" y="70" text-anchor="end" font-size="11" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">悬挂点</text>
  <text x="26" y="84" text-anchor="end" font-size="9" fill="#777" font-family="sans-serif">（量角器中心）</text>

  <line x1="30" y1="140" x2="135" y2="145" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <circle cx="135" cy="145" r="2" fill="#666"/>
  <text x="26" y="136" text-anchor="end" font-size="11" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">量角器</text>

  <text x="370" y="76" text-anchor="start" font-size="11" fill="#5ba0d0" font-family="sans-serif" font-weight="bold">风 →</text>
  <text x="370" y="92" text-anchor="start" font-size="9" fill="#777" font-family="sans-serif">拖曳力</text>

  <!-- Step badge -->
  <circle cx="470" cy="28" r="20" fill="#2c3e50" filter="url(#a2_glow)"/>
  <text x="470" y="35" text-anchor="middle" font-size="18" fill="white" font-weight="bold" font-family="sans-serif">2</text>

  <text x="250" y="268" text-anchor="middle" font-size="14" fill="#5a4535" font-family="sans-serif" font-weight="bold">量角器 + 细线 + 乒乓球（风速 ∝ tanθ）</text>
</svg>`,
  },
  {
    title: '简易雨量计',
    content: '取直筒透明容器（如量筒），上方放置漏斗确保边缘水平，放在开阔处。降雨后读取收集水深。雨量 = 水体体积 / 漏斗口面积。1 mm 降雨量 = 每平方米 1 升水。',
    highlight: '标准雨量计口径 20 cm。降水强度：小雨 < 10 mm/h，暴雨 > 50 mm/h。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="r3_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8eef5"/>
      <stop offset="100%" stop-color="#c8d8e8"/>
    </linearGradient>
    <linearGradient id="r3_ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8aab7a"/>
      <stop offset="100%" stop-color="#5a8a4a"/>
    </linearGradient>
    <linearGradient id="r3_cylinder" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(210,225,240,0.35)"/>
      <stop offset="40%" stop-color="rgba(210,225,240,0.6)"/>
      <stop offset="100%" stop-color="rgba(210,225,240,0.25)"/>
    </linearGradient>
    <linearGradient id="r3_water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7bc0e8"/>
      <stop offset="100%" stop-color="#3a8fd4"/>
    </linearGradient>
    <linearGradient id="r3_funnel" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(200,210,220,0.4)"/>
      <stop offset="50%" stop-color="rgba(200,210,220,0.7)"/>
      <stop offset="100%" stop-color="rgba(200,210,220,0.35)"/>
    </linearGradient>
    <filter id="r3_drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="#00000028"/>
    </filter>
    <filter id="r3_glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#00000018"/>
    </filter>
  </defs>
  <!-- Outdoor background -->
  <rect x="0" y="0" width="500" height="210" fill="url(#r3_wall)"/>
  <rect x="0" y="210" width="500" height="90" fill="url(#r3_ground)"/>
  <line x1="0" y1="210" x2="500" y2="210" stroke="#6b9b5a" stroke-width="2"/>

  <!-- Clouds at top -->
  <g opacity="0.6">
    <circle cx="120" cy="25" r="18" fill="rgba(180,190,200,0.6)"/>
    <circle cx="145" cy="20" r="14" fill="rgba(180,190,200,0.6)"/>
    <circle cx="105" cy="22" r="12" fill="rgba(180,190,200,0.6)"/>
    <circle cx="135" cy="28" r="12" fill="rgba(180,190,200,0.6)"/>
  </g>
  <g opacity="0.45">
    <circle cx="380" cy="30" r="15" fill="rgba(170,180,195,0.6)"/>
    <circle cx="400" cy="26" r="12" fill="rgba(170,180,195,0.6)"/>
    <circle cx="365" cy="28" r="10" fill="rgba(170,180,195,0.6)"/>
  </g>

  <!-- Rain drops -->
  <line x1="170" y1="50" x2="172" y2="62" stroke="#5ba0d0" stroke-width="2" stroke-linecap="round"/>
  <line x1="200" y1="42" x2="203" y2="56" stroke="#5ba0d0" stroke-width="2" stroke-linecap="round"/>
  <line x1="230" y1="48" x2="228" y2="58" stroke="#5ba0d0" stroke-width="2" stroke-linecap="round"/>
  <line x1="260" y1="38" x2="262" y2="52" stroke="#5ba0d0" stroke-width="2" stroke-linecap="round"/>
  <line x1="290" y1="44" x2="288" y2="55" stroke="#5ba0d0" stroke-width="2" stroke-linecap="round"/>
  <line x1="155" y1="60" x2="157" y2="68" stroke="#5ba0d0" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="310" y1="55" x2="308" y2="65" stroke="#5ba0d0" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="180" y1="68" x2="182" y2="78" stroke="#5ba0d0" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="250" y1="52" x2="248" y2="62" stroke="#5ba0d0" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Funnel (inverted trapezoid) -->
  <path d="M150,84 L220,82 L280,84 L270,112 L160,112 Z" fill="url(#r3_funnel)" stroke="#9bb5cc" stroke-width="2" filter="url(#r3_drop)"/>
  <!-- Funnel rim -->
  <line x1="145" y1="84" x2="285" y2="84" stroke="#8caac4" stroke-width="3" stroke-linecap="round"/>

  <!-- Graduated cylinder -->
  <rect x="165" y="112" width="100" height="100" rx="4" fill="url(#r3_cylinder)" stroke="#9bb5cc" stroke-width="2.2" filter="url(#r3_drop)"/>
  <!-- Cylinder base -->
  <rect x="155" y="210" width="120" height="8" rx="3" fill="#d0d8e0" stroke="#9bb5cc" stroke-width="1.5"/>

  <!-- Water in cylinder -->
  <rect x="169" y="170" width="92" height="38" rx="3" fill="url(#r3_water)" opacity="0.7"/>
  <path d="M169,178 Q215,172 261,178" fill="none" stroke="#5ba0d0" stroke-width="1.5"/>

  <!-- Measurement markings on cylinder -->
  <line x1="155" y1="120" x2="165" y2="120" stroke="#555" stroke-width="1"/>
  <text x="152" y="123" text-anchor="end" font-size="8" fill="#555" font-family="sans-serif">100</text>

  <line x1="155" y1="140" x2="165" y2="140" stroke="#555" stroke-width="1"/>
  <text x="152" y="143" text-anchor="end" font-size="8" fill="#555" font-family="sans-serif">80</text>

  <line x1="155" y1="160" x2="165" y2="160" stroke="#555" stroke-width="1"/>
  <text x="152" y="163" text-anchor="end" font-size="8" fill="#555" font-family="sans-serif">60</text>

  <line x1="155" y1="180" x2="170" y2="180" stroke="#555" stroke-width="1.2"/>
  <text x="152" y="183" text-anchor="end" font-size="8" fill="#555" font-family="sans-serif">40</text>

  <line x1="155" y1="200" x2="165" y2="200" stroke="#555" stroke-width="1"/>
  <text x="152" y="203" text-anchor="end" font-size="8" fill="#555" font-family="sans-serif">20</text>

  <text x="145" y="145" text-anchor="end" font-size="8" fill="#555" font-family="sans-serif">mm</text>

  <!-- Annotations -->
  <line x1="370" y1="84" x2="290" y2="84" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="290" cy="84" r="2.5" fill="#666"/>
  <text x="374" y="80" text-anchor="start" font-size="12" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">漏斗</text>
  <text x="374" y="96" text-anchor="start" font-size="9" fill="#777" font-family="sans-serif">（标准口径 20cm）</text>

  <line x1="370" y1="150" x2="272" y2="155" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="272" cy="155" r="2.5" fill="#666"/>
  <text x="374" y="146" text-anchor="start" font-size="12" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">量筒</text>
  <text x="374" y="162" text-anchor="start" font-size="9" fill="#777" font-family="sans-serif">（透明直筒）</text>

  <!-- Water level annotation -->
  <line x1="340" y1="178" x2="268" y2="178" stroke="#3a8fd4" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="268" cy="178" r="2" fill="#3a8fd4"/>
  <text x="344" y="174" text-anchor="start" font-size="11" fill="#3a8fd4" font-family="sans-serif" font-weight="bold">水深</text>
  <text x="344" y="188" text-anchor="start" font-size="9" fill="#777" font-family="sans-serif">（1mm = 1L/m²）</text>

  <!-- Rain annotation -->
  <line x1="40" y1="42" x2="170" y2="52" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="36" y="38" text-anchor="end" font-size="11" fill="#5ba0d0" font-family="sans-serif" font-weight="bold">降雨</text>

  <!-- Step badge -->
  <circle cx="470" cy="28" r="20" fill="#2c3e50" filter="url(#r3_glow)"/>
  <text x="470" y="35" text-anchor="middle" font-size="18" fill="white" font-weight="bold" font-family="sans-serif">3</text>

  <text x="250" y="278" text-anchor="middle" font-size="14" fill="#5a4535" font-family="sans-serif" font-weight="bold">漏斗 + 量筒（雨量 = 收集水体体积 / 漏斗口面积）</text>
</svg>`,
  },
  {
    title: '风向标',
    content: '在吸管一端剪出箭头形尾翼，另一端加配重（橡皮泥），中间用大头针作转轴，插在铅笔橡皮上。放在风中箭头指向风吹来的方向。风以来源方向命名（北风 = 从北向南吹）。',
    highlight: '风向用 16 方位或 0-360° 表示。气象站标准高度 10 m。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="v4_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdfcf8"/>
      <stop offset="100%" stop-color="#e8e2d5"/>
    </linearGradient>
    <linearGradient id="v4_table" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4b896"/>
      <stop offset="100%" stop-color="#8b6d4a"/>
    </linearGradient>
    <linearGradient id="v4_clay" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#8b6f4e"/>
      <stop offset="100%" stop-color="#b8946e"/>
    </linearGradient>
    <linearGradient id="v4_pencil" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e8c840"/>
      <stop offset="100%" stop-color="#c8a830"/>
    </linearGradient>
    <filter id="v4_drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="#00000028"/>
    </filter>
    <filter id="v4_glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#00000018"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="500" height="225" fill="url(#v4_wall)"/>
  <rect x="0" y="225" width="500" height="75" fill="url(#v4_table)"/>
  <line x1="0" y1="225" x2="500" y2="225" stroke="#b89870" stroke-width="2"/>

  <!-- Clay base -->
  <ellipse cx="250" cy="231" rx="30" ry="7" fill="#00000020"/>
  <ellipse cx="250" cy="226" rx="28" ry="12" fill="url(#v4_clay)" stroke="#7a5e40" stroke-width="1.5" filter="url(#v4_drop)"/>
  <rect x="222" y="218" width="56" height="12" rx="6" fill="url(#v4_clay)" stroke="#7a5e40" stroke-width="1.2"/>

  <!-- Pencil -->
  <rect x="244" y="120" width="12" height="100" rx="2" fill="url(#v4_pencil)" stroke="#b8a020" stroke-width="1.2" filter="url(#v4_drop)"/>
  <!-- Pencil tip -->
  <polygon points="244,120 250,108 256,120" fill="#e8d070" stroke="#c0a030" stroke-width="1"/>
  <!-- Pencil lead -->
  <line x1="250" y1="108" x2="250" y2="115" stroke="#333" stroke-width="1.5"/>
  <!-- Pencil eraser at top -->
  <rect x="242" y="68" width="16" height="8" rx="2" fill="#e88b7a" stroke="#d07060" stroke-width="1"/>

  <!-- Pin / pivot point -->
  <circle cx="250" cy="66" r="3.5" fill="#888" stroke="#555" stroke-width="1"/>
  <circle cx="250" cy="66" r="1.5" fill="#ccc"/>

  <!-- Straw (horizontal) -->
  <line x1="130" y1="66" x2="370" y2="66" stroke="#e74c3c" stroke-width="4" stroke-linecap="round" filter="url(#v4_drop)"/>

  <!-- Arrow head (left side - points into the wind) -->
  <polygon points="130,66 150,56 150,76" fill="#e74c3c" stroke="#c0392b" stroke-width="1.5"/>
  <text x="140" y="52" text-anchor="middle" font-size="9" fill="#c0392b" font-family="sans-serif" font-weight="bold">箭头</text>

  <!-- Tail fins (right side) -->
  <polygon points="370,66 350,54 350,78" fill="#27ae60" stroke="#1e8449" stroke-width="1.5"/>
  <text x="360" y="90" text-anchor="middle" font-size="9" fill="#27ae60" font-family="sans-serif" font-weight="bold">尾翼</text>

  <!-- Compass rose (on table surface) -->
  <g transform="translate(250, 206)">
    <!-- N -->
    <line x1="0" y1="-28" x2="0" y2="28" stroke="#c0392b" stroke-width="1.5"/>
    <!-- E-W -->
    <line x1="-28" y1="0" x2="28" y2="0" stroke="#555" stroke-width="1.5"/>
    <!-- NE-SW -->
    <line x1="-18" y1="-18" x2="18" y2="18" stroke="#999" stroke-width="0.8"/>
    <!-- NW-SE -->
    <line x1="-18" y1="18" x2="18" y2="-18" stroke="#999" stroke-width="0.8"/>
    <!-- Outer circle -->
    <circle cx="0" cy="0" r="26" fill="none" stroke="#888" stroke-width="1"/>

    <text x="0" y="-34" text-anchor="middle" font-size="11" fill="#c0392b" font-family="sans-serif" font-weight="bold">北 N</text>
    <text x="0" y="42" text-anchor="middle" font-size="10" fill="#555" font-family="sans-serif" font-weight="bold">南 S</text>
    <text x="35" y="4" text-anchor="middle" font-size="10" fill="#555" font-family="sans-serif" font-weight="bold">东 E</text>
    <text x="-35" y="4" text-anchor="middle" font-size="10" fill="#555" font-family="sans-serif" font-weight="bold">西 W</text>

    <!-- NE -->
    <polygon points="0,-26 3,-22 7,-26" fill="#c0392b" opacity="0.7"/>
  </g>

  <!-- Wind arrows (blowing from North to South) -->
  <g>
    <line x1="250" y1="30" x2="250" y2="60" stroke="#5ba0d0" stroke-width="2.5"/>
    <polygon points="250,60 245,52 255,52" fill="#5ba0d0"/>
    <line x1="240" y1="35" x2="240" y2="58" stroke="#5ba0d0" stroke-width="2"/>
    <polygon points="240,58 235,50 245,50" fill="#5ba0d0"/>
    <line x1="260" y1="38" x2="260" y2="55" stroke="#5ba0d0" stroke-width="2"/>
    <polygon points="260,55 255,48 265,48" fill="#5ba0d0"/>
  </g>

  <!-- Wind label -->
  <text x="250" y="26" text-anchor="middle" font-size="12" fill="#5ba0d0" font-family="sans-serif" font-weight="bold">北风 ↓</text>

  <!-- Rotation indicator -->
  <path d="M290,60 Q300,56 296,50" fill="none" stroke="#e67e22" stroke-width="1.5"/>
  <polygon points="296,49 292,45 298,47" fill="#e67e22"/>
  <text x="308" y="56" text-anchor="start" font-size="9" fill="#e67e22" font-family="sans-serif">随风转动</text>

  <!-- Annotations -->
  <line x1="40" y1="66" x2="126" y2="66" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <text x="36" y="62" text-anchor="end" font-size="11" fill="#e74c3c" font-family="sans-serif" font-weight="bold">箭头指向</text>
  <text x="36" y="76" text-anchor="end" font-size="9" fill="#777" font-family="sans-serif">风来方向</text>

  <line x1="420" y1="66" x2="376" y2="66" stroke="#666" stroke-width="1.2" stroke-dasharray="4,3"/>
  <text x="424" y="62" text-anchor="start" font-size="11" fill="#27ae60" font-family="sans-serif" font-weight="bold">尾翼</text>
  <text x="424" y="76" text-anchor="start" font-size="9" fill="#777" font-family="sans-serif">迎风面积大</text>

  <line x1="40" y1="180" x2="240" y2="175" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <circle cx="240" cy="175" r="2" fill="#666"/>
  <text x="36" y="176" text-anchor="end" font-size="11" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">橡皮泥底座</text>

  <line x1="420" y1="100" x2="260" y2="95" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <circle cx="260" cy="95" r="2" fill="#666"/>
  <text x="424" y="96" text-anchor="start" font-size="11" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">铅笔竖杆</text>

  <line x1="320" y1="200" x2="265" y2="198" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="324" y="196" text-anchor="start" font-size="10" fill="#3a3a3a" font-family="sans-serif" font-weight="bold">方位盘</text>

  <!-- Step badge -->
  <circle cx="470" cy="28" r="20" fill="#2c3e50" filter="url(#v4_glow)"/>
  <text x="470" y="35" text-anchor="middle" font-size="18" fill="white" font-weight="bold" font-family="sans-serif">4</text>

  <text x="250" y="278" text-anchor="middle" font-size="14" fill="#5a4535" font-family="sans-serif" font-weight="bold">铅笔底座 + 大头针转轴 + 吸管箭头 + 尾翼 + 方位盘</text>
</svg>`,
  },
]

export default { name: "WeatherInstruments", steps }
