const steps = [
  {
    title: '观察颜色和光泽',
    content: '在自然光下观察矿物标本的直观属性——颜色和光泽。颜色是矿物对可见光选择性吸收的结果，可分为自色（矿物固有成分决定）、他色（杂质致色）和假色（表面氧化膜或干涉）。光泽描述矿物表面对光的反射能力，常见类型包括：金属光泽（如黄铁矿）、半金属光泽、金刚光泽（如金刚石）、玻璃光泽（如石英）、油脂光泽、珍珠光泽、丝绢光泽和土状光泽。',
    highlight: '颜色是初步鉴定线索但不可靠——同一种矿物可呈现不同颜色（如石英有紫水晶、烟水晶、蔷薇石英），不同矿物也可有相同颜色。光泽则相对稳定。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tableTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c4a46c"/>
      <stop offset="100%" stop-color="#8b6914"/>
    </linearGradient>
    <linearGradient id="lightBeam" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbe6" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#fffbe6" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="specimen1" cx="0.4" cy="0.3" r="0.6">
      <stop offset="0%" stop-color="#e8d5a0"/>
      <stop offset="60%" stop-color="#c4a46c"/>
      <stop offset="100%" stop-color="#8b6914"/>
    </radialGradient>
    <radialGradient id="specimen2" cx="0.35" cy="0.3" r="0.6">
      <stop offset="0%" stop-color="#c8c8d0"/>
      <stop offset="50%" stop-color="#909098"/>
      <stop offset="100%" stop-color="#585860"/>
    </radialGradient>
    <radialGradient id="specimen3" cx="0.4" cy="0.3" r="0.6">
      <stop offset="0%" stop-color="#b8a0d8"/>
      <stop offset="60%" stop-color="#7b5ea7"/>
      <stop offset="100%" stop-color="#4a3070"/>
    </radialGradient>
    <radialGradient id="specimen4" cx="0.4" cy="0.35" r="0.6">
      <stop offset="0%" stop-color="#e0e0e0"/>
      <stop offset="40%" stop-color="#a0a0a0"/>
      <stop offset="100%" stop-color="#404040"/>
    </radialGradient>
    <radialGradient id="magnifyLens" cx="0.3" cy="0.3" r="0.7">
      <stop offset="0%" stop-color="#e8f4ff" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#b8d8f0" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#90c0e0" stop-opacity="0.9"/>
    </radialGradient>
    <filter id="dropShadow" x="-10%" y="-5%" width="130%" height="130%">
      <feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#302820" flood-opacity="0.3"/>
    </filter>
    <filter id="softShadow" x="-5%" y="-5%" width="120%" height="120%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect x="59" y="180" width="400" height="18" rx="3" fill="url(#tableTop)" stroke="#6b4e1a" stroke-width="1.5" filter="url(#dropShadow)"/>
  <rect x="55" y="195" width="10" height="50" rx="2" fill="#6b4e1a"/>
  <rect x="415" y="195" width="10" height="50" rx="2" fill="#6b4e1a"/>
  <rect x="70" y="145" width="55" height="45" rx="6" fill="url(#specimen1)" stroke="#8b6914" stroke-width="1.5" filter="url(#softShadow)"/>
  <polygon points="72,150 90,140 105,150 90,160" fill="#fff" opacity="0.25"/>
  <text x="97" y="220" text-anchor="middle" font-size="8" fill="#6b4e1a" font-weight="bold">黄铁矿</text>
  <rect x="155" y="150" width="45" height="35" rx="4" fill="url(#specimen2)" stroke="#585860" stroke-width="1.5" filter="url(#softShadow)"/>
  <polygon points="157,155 170,147 185,155 170,163" fill="#fff" opacity="0.3"/>
  <text x="177" y="220" text-anchor="middle" font-size="8" fill="#585860" font-weight="bold">方铅矿</text>
  <rect x="230" y="135" width="50" height="55" rx="7" fill="url(#specimen3)" stroke="#4a3070" stroke-width="1.5" filter="url(#softShadow)"/>
  <polygon points="232,140 255,130 270,140 255,150" fill="#fff" opacity="0.2"/>
  <text x="255" y="220" text-anchor="middle" font-size="8" fill="#4a3070" font-weight="bold">石英(紫水晶)</text>
  <rect x="310" y="140" width="55" height="50" rx="5" fill="url(#specimen4)" stroke="#404040" stroke-width="1.5" filter="url(#softShadow)"/>
  <polygon points="312,145 337,133 355,145 337,157" fill="#fff" opacity="0.35"/>
  <text x="337" y="220" text-anchor="middle" font-size="8" fill="#404040" font-weight="bold">石墨</text>
  <polygon points="410,100 380,50 420,30 430,40 440,80 425,105" fill="#f5c6a0" stroke="#8b6914" stroke-width="1.5" filter="url(#softShadow)"/>
  <rect x="395" y="105" width="40" height="8" rx="2" fill="#6b4e1a"/>
  <circle cx="408" cy="45" r="18" fill="url(#magnifyLens)" stroke="#6b4e1a" stroke-width="2.5"/>
  <circle cx="408" cy="45" r="14" fill="none" stroke="#fff" stroke-width="0.5" opacity="0.4"/>
  <text x="408" y="32" text-anchor="middle" font-size="8" fill="#6b4e1a" font-weight="bold">放大镜</text>
  <polygon points="45,25 95,25 70,10" fill="#fffbe6" opacity="0.7"/>
  <ellipse cx="70" cy="15" rx="30" ry="6" fill="#fffbe6" opacity="0.9"/>
  <polygon points="50,30 95,25 85,170 70,170" fill="url(#lightBeam)" opacity="0.15"/>
  <line x1="70" y1="220" x2="95" y2="198" stroke="#f5a623" stroke-width="0.8" stroke-dasharray="3,2"/>
  <text x="70" y="240" text-anchor="middle" font-size="8" fill="#f5a623" font-weight="bold">光源</text>
  <line x1="130" y1="218" x2="97" y2="193" stroke="#c4a46c" stroke-width="0.8" stroke-dasharray="2,2"/>
  <text x="120" y="232" text-anchor="middle" font-size="7" fill="#c4a46c">金属光泽</text>
  <line x1="200" y1="218" x2="255" y2="193" stroke="#7b5ea7" stroke-width="0.8" stroke-dasharray="2,2"/>
  <text x="210" y="232" text-anchor="middle" font-size="7" fill="#7b5ea7">玻璃光泽</text>
  <line x1="360" y1="218" x2="337" y2="193" stroke="#808080" stroke-width="0.8" stroke-dasharray="2,2"/>
  <text x="360" y="232" text-anchor="middle" font-size="7" fill="#808080">土状光泽</text>
  <text x="250" y="270" text-anchor="middle" font-size="11" fill="#302820" font-weight="bold">颜色：选择性吸收  |  光泽：表面反射能力</text>
</svg>`,
  },
  {
    title: '条痕测试',
    content: '将矿物在未上釉的白色瓷板（条痕板）上划擦，观察留下的粉末颜色。条痕色是矿物粉末的颜色，比矿物块体的颜色更可靠，因为粉末消除了表面杂质和晶体缺陷的影响。操作要点：手持矿物，以一定力度在瓷板上划一道约 2-3 cm 的线，观察粉末颜色。注意：条痕板硬度约 7，硬度大于 7 的矿物无法在瓷板上留痕——需研磨后观察粉末。',
    highlight: '条痕色是矿物的可靠鉴定特征。例如赤铁矿无论外表是钢灰还是红褐色，条痕恒为樱红色；黄铁矿外表金黄但条痕为绿黑色，可与金（条痕金黄色）区分。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="streakPlate" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fafaf5"/>
      <stop offset="50%" stop-color="#f5f0e0"/>
      <stop offset="100%" stop-color="#e8e0d0"/>
    </linearGradient>
    <linearGradient id="tableGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8b7355"/>
      <stop offset="100%" stop-color="#5c4033"/>
    </linearGradient>
    <filter id="plateShadow" x="-5%" y="-5%" width="120%" height="130%">
      <feDropShadow dx="3" dy="4" stdDeviation="4" flood-color="#302820" flood-opacity="0.25"/>
    </filter>
    <filter id="handShadow" x="-5%" y="-5%" width="120%" height="120%">
      <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#302820" flood-opacity="0.2"/>
    </filter>
    <linearGradient id="mineralBody" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#888"/>
      <stop offset="40%" stop-color="#606060"/>
      <stop offset="100%" stop-color="#383838"/>
    </linearGradient>
    <linearGradient id="streakGlow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b8403a"/>
      <stop offset="50%" stop-color="#d44a3a"/>
      <stop offset="100%" stop-color="#9e2426"/>
    </linearGradient>
  </defs>
  <rect x="45" y="220" width="420" height="15" rx="2" fill="url(#tableGrad)" filter="url(#plateShadow)"/>
  <rect x="90" y="140" width="240" height="70" rx="6" fill="url(#streakPlate)" stroke="#c4a46c" stroke-width="2" filter="url(#plateShadow)"/>
  <text x="210" y="170" text-anchor="middle" font-size="9" fill="#b8a57a" font-weight="bold" letter-spacing="2">白色瓷板（条痕板）</text>
  <line x1="130" y1="178" x2="290" y2="178" stroke="url(#streakGlow)" stroke-width="5" stroke-linecap="round"/>
  <line x1="130" y1="178" x2="290" y2="178" stroke="#9e2426" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <polygon points="180,135 230,135 240,85 190,85" fill="url(#mineralBody)" stroke="#302820" stroke-width="1.5" filter="url(#handShadow)"/>
  <polygon points="183,138 227,138 236,90 193,90" fill="#fff" opacity="0.08"/>
  <text x="215" y="113" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">矿物</text>
  <path d="M195 85 Q185 65 200 50 Q220 55 215 70" fill="#f5c6a0" stroke="#c4956a" stroke-width="1.5" filter="url(#handShadow)"/>
  <path d="M185 55 Q175 45 190 35 Q210 40 205 55" fill="#f5c6a0" stroke="#c4956a" stroke-width="1.5"/>
  <text x="185" y="30" font-size="8" fill="#8b6914" font-weight="bold">手持矿物</text>
  <path d="M185 30 Q210 25 215 55" stroke="#8b6914" stroke-width="0.6" stroke-dasharray="2,2"/>
  <rect x="340" y="155" width="55" height="45" rx="4" fill="url(#mineralBody)" stroke="#302820" stroke-width="1.5"/>
  <text x="367" y="180" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">赤铁矿</text>
  <text x="367" y="192" text-anchor="middle" font-size="7" fill="#ddd">外表钢灰色</text>
  <line x1="295" y1="178" x2="340" y2="178" stroke="#9e2426" stroke-width="0.6" stroke-dasharray="3,2"/>
  <text x="317" y="210" text-anchor="middle" font-size="8" fill="#9e2426" font-weight="bold">条痕为樱红色</text>
  <line x1="317" y1="210" x2="317" y2="195" stroke="#9e2426" stroke-width="0.5"/>
  <text x="210" y="265" text-anchor="middle" font-size="11" fill="#302820" font-weight="bold">条痕色 = 矿物粉末颜色（比外表颜色更可靠）</text>
  <line x1="105" y1="240" x2="105" y2="255" stroke="#b8a57a" stroke-width="0.5"/>
  <text x="105" y="248" font-size="7" fill="#b8a57a">未上釉面</text>
</svg>`,
  },
  {
    title: '莫氏硬度测试',
    content: '莫氏硬度是矿物抵抗刻划的能力，用 10 种标准矿物定义从 1 到 10 的相对硬度等级。测试方法：用已知硬度的物体（或标准矿物）刻划未知矿物，观察是否留下划痕。\n\n常见参照物硬度：指甲 ~2.5、铜币 ~3.0、铁钉 ~4.5、小刀/玻璃 ~5.5、钢锉 ~6.5、石英 ~7。\n\n莫氏硬度计标准矿物：1-滑石、2-石膏、3-方解石、4-萤石、5-磷灰石、6-正长石、7-石英（水晶）、8-黄玉、9-刚玉、10-金刚石。\n\n操作：由软到硬依次测试，直到找到能刻划矿物和不能被矿物刻划的相邻参照物，确定矿物硬度范围。',
    highlight: '莫氏硬度是相对硬度而非绝对硬度——金刚石（10）的绝对硬度是滑石（1）的约 1600 倍。野外常用指甲、铜币、小刀作为快速判据。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mohsRuler" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fff5e0"/>
      <stop offset="100%" stop-color="#d4a76a"/>
    </linearGradient>
    <filter id="mohsShadow" x="-5%" y="-5%" width="120%" height="120%">
      <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#302820" flood-opacity="0.2"/>
    </filter>
    <linearGradient id="mineralGrad" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#c0a0d0"/>
      <stop offset="50%" stop-color="#9070b0"/>
      <stop offset="100%" stop-color="#604080"/>
    </linearGradient>
    <linearGradient id="tableSurf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b8956e"/>
      <stop offset="100%" stop-color="#7a5c3e"/>
    </linearGradient>
  </defs>
  <rect x="50" y="220" width="420" height="12" rx="2" fill="url(#tableSurf)" filter="url(#mohsShadow)"/>
  <polygon points="210,215 270,215 280,85 200,85" fill="url(#mineralGrad)" stroke="#604080" stroke-width="1.5" filter="url(#mohsShadow)"/>
  <polygon points="213,218 267,218 276,90 204,90" fill="#fff" opacity="0.12"/>
  <text x="240" y="145" text-anchor="middle" font-size="11" fill="#fff" font-weight="bold">未知</text>
  <text x="240" y="160" text-anchor="middle" font-size="11" fill="#fff" font-weight="bold">矿物</text>
  <text x="240" y="175" text-anchor="middle" font-size="8" fill="#ddd">?</text>
  <rect x="30" y="170" width="60" height="50" rx="8" fill="#f5d5c0" stroke="#d4a090" stroke-width="1.5" filter="url(#mohsShadow)"/>
  <ellipse cx="60" cy="195" rx="25" ry="18" fill="none" stroke="#e8b8a8" stroke-width="1"/>
  <text x="60" y="185" text-anchor="middle" font-size="9" fill="#8b5a3a" font-weight="bold">指甲</text>
  <text x="60" y="200" text-anchor="middle" font-size="7" fill="#b8956e">~2.5</text>
  <line x1="60" y1="215" x2="90" y2="218" stroke="#f5a623" stroke-width="0.8" stroke-dasharray="3,2"/>
  <text x="40" y="245" text-anchor="middle" font-size="7" fill="#f5a623">可刻划? 否</text>
  <circle cx="125" cy="160" r="20" fill="#f5a623" stroke="#d4a020" stroke-width="2" filter="url(#mohsShadow)"/>
  <text x="125" y="157" text-anchor="middle" font-size="9" fill="#fff" font-weight="bold">铜</text>
  <text x="125" y="170" text-anchor="middle" font-size="8" fill="#fff">币</text>
  <text x="125" y="188" text-anchor="middle" font-size="7" fill="#b8956e">~3.0</text>
  <line x1="125" y1="215" x2="145" y2="218" stroke="#f5a623" stroke-width="0.8" stroke-dasharray="3,2"/>
  <text x="115" y="245" text-anchor="middle" font-size="7" fill="#f5a623">可刻划? 否</text>
  <rect x="315" y="160" width="15" height="60" rx="3" fill="#8899a0" stroke="#606870" stroke-width="1.5" filter="url(#mohsShadow)"/>
  <ellipse cx="322" cy="155" rx="10" ry="5" fill="#606870"/>
  <text x="322" y="230" text-anchor="middle" font-size="8" fill="#606870" font-weight="bold">铁钉</text>
  <text x="322" y="241" text-anchor="middle" font-size="7" fill="#b8956e">~4.5</text>
  <line x1="295" y1="195" x2="280" y2="218" stroke="#6ba86b" stroke-width="0.8" stroke-dasharray="3,2"/>
  <text x="277" y="245" text-anchor="middle" font-size="7" fill="#6ba86b">可刻划! ✓</text>
  <rect x="370" y="165" width="30" height="50" rx="2" fill="rgba(180,210,240,0.4)" stroke="#8899a0" stroke-width="1.5" filter="url(#mohsShadow)"/>
  <line x1="370" y1="185" x2="400" y2="185" stroke="#8899a0" stroke-width="0.5"/>
  <text x="385" y="225" text-anchor="middle" font-size="8" fill="#8899a0" font-weight="bold">玻璃</text>
  <text x="385" y="236" text-anchor="middle" font-size="7" fill="#b8956e">~5.5</text>
  <line x1="350" y1="205" x2="325" y2="218" stroke="#6ba86b" stroke-width="0.8" stroke-dasharray="3,2"/>
  <text x="337" y="245" text-anchor="middle" font-size="7" fill="#6ba86b">划不动矿物</text>
  <rect x="430" y="60" width="50" height="160" rx="6" fill="url(#mohsRuler)" stroke="#d4a76a" stroke-width="2" filter="url(#mohsShadow)"/>
  <text x="455" y="78" text-anchor="middle" font-size="7" fill="#302820" font-weight="bold">莫氏</text>
  <text x="455" y="90" text-anchor="middle" font-size="7" fill="#302820" font-weight="bold">硬度</text>
  <line x1="435" y1="95" x2="475" y2="95" stroke="#d4a76a" stroke-width="0.5"/>
  <text x="455" y="108" text-anchor="middle" font-size="6" fill="#302820">10 金刚石</text>
  <text x="455" y="120" text-anchor="middle" font-size="6" fill="#302820">9 刚玉</text>
  <text x="455" y="132" text-anchor="middle" font-size="6" fill="#302820">8 黄玉</text>
  <text x="455" y="144" text-anchor="middle" font-size="6" fill="#302820">7 石英</text>
  <text x="455" y="156" text-anchor="middle" font-size="6" fill="#302820">6 正长石</text>
  <text x="455" y="168" text-anchor="middle" font-size="6" fill="#302820">5 磷灰石</text>
  <line x1="435" y1="173" x2="475" y2="173" stroke="#f5a623" stroke-width="1"/>
  <text x="455" y="180" text-anchor="middle" font-size="6" fill="#302820">4 萤石</text>
  <text x="455" y="192" text-anchor="middle" font-size="6" fill="#302820">3 方解石</text>
  <text x="455" y="204" text-anchor="middle" font-size="6" fill="#302820">2 石膏</text>
  <text x="455" y="216" text-anchor="middle" font-size="6" fill="#302820">1 滑石</text>
  <text x="240" y="278" text-anchor="middle" font-size="11" fill="#302820" font-weight="bold">由软到硬依次刻划，确定矿物硬度范围 —— 本例约 3.5-4.5</text>
</svg>`,
  },
  {
    title: '解理观察',
    content: '解理是矿物受外力作用时沿一定结晶学方向裂开成光滑平面的性质。观察解理需要放大镜（10x），注意解理的方向数、夹角和完整程度。\n\n主要解理类型：\n- 立方体解理（三组互相垂直）：如方铅矿、石盐（NaCl），三组解理互相垂直，破裂成立方体小块\n- 菱面体解理（三组不垂直）：如方解石（菱面体解理，三组不垂直，夹角约 75°/105°）\n- 底面解理（一组）：如云母，可剥成极薄的片\n- 柱面解理（两组）：如辉石（近直角，87°/93°）、角闪石（约 56°/124°）\n- 无解理：如石英，断口呈贝壳状',
    highlight: '解理方向和夹角是鉴定相似矿物的关键——辉石和角闪石在颜色、硬度上相近，但解理夹角不同（辉石近 90°，角闪石约 56°），是最可靠的区分特征。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="cubeShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#302820" flood-opacity="0.2"/>
    </filter>
    <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e8d8f0"/>
      <stop offset="100%" stop-color="#c0a0d0"/>
    </linearGradient>
    <linearGradient id="cubeFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b890c8"/>
      <stop offset="100%" stop-color="#9070a0"/>
    </linearGradient>
    <linearGradient id="cubeSide" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a080b0"/>
      <stop offset="100%" stop-color="#806888"/>
    </linearGradient>
    <linearGradient id="micaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8d080"/>
      <stop offset="100%" stop-color="#c4a040"/>
    </linearGradient>
    <linearGradient id="rhombTop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e0f0f0"/>
      <stop offset="100%" stop-color="#b0d0d0"/>
    </linearGradient>
    <linearGradient id="rhombFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a0c8c8"/>
      <stop offset="100%" stop-color="#70a0a0"/>
    </linearGradient>
    <linearGradient id="rhombSide" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#90b8b8"/>
      <stop offset="100%" stop-color="#608888"/>
    </linearGradient>
  </defs>
  <text x="110" y="25" text-anchor="middle" font-size="10" fill="#302820" font-weight="bold">立方体解理（方铅矿/石盐）</text>
  <line x1="110" y1="25" x2="110" y2="260" stroke="#e8e0d0" stroke-width="0.5" stroke-dasharray="2,2"/>
  <polygon points="50,70 95,55 130,70 85,85" fill="url(#cubeTop)" stroke="#604080" stroke-width="1.5" filter="url(#cubeShadow)"/>
  <polygon points="50,70 50,120 85,135 85,85" fill="url(#cubeFront)" stroke="#604080" stroke-width="1.5"/>
  <polygon points="85,85 85,135 120,120 120,70" fill="url(#cubeSide)" stroke="#604080" stroke-width="1.5"/>
  <polygon points="50,70 95,55 130,70 85,85" fill="url(#cubeTop)" stroke="#604080" stroke-width="1.5"/>
  <line x1="50" y1="85" x2="120" y2="85" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="85" y1="55" x2="85" y2="135" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="65" y1="70" x2="115" y2="120" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="90" y="155" text-anchor="middle" font-size="8" fill="#9e2426">三组解理互相垂直</text>
  <rect x="55" y="163" width="115" height="40" rx="4" fill="none" stroke="#9e2426" stroke-width="0.8" stroke-dasharray="3,2"/>
  <text x="112" y="176" font-size="7" fill="#604080">破裂成立方体小块</text>
  <text x="112" y="190" font-size="7" fill="#604080">（如食盐晶体）</text>
  <text x="250" y="25" text-anchor="middle" font-size="10" fill="#302820" font-weight="bold">菱面体解理（方解石）</text>
  <line x1="250" y1="25" x2="250" y2="260" stroke="#e8e0d0" stroke-width="0.5" stroke-dasharray="2,2"/>
  <polygon points="200,65 240,50 260,58 220,73" fill="url(#rhombTop)" stroke="#508080" stroke-width="1.5" filter="url(#cubeShadow)"/>
  <polygon points="200,65 200,120 220,128 220,73" fill="url(#rhombFront)" stroke="#508080" stroke-width="1.5"/>
  <polygon points="220,73 220,128 260,113 260,58" fill="url(#rhombSide)" stroke="#508080" stroke-width="1.5"/>
  <polygon points="200,65 240,50 260,58 220,73" fill="url(#rhombTop)" stroke="#508080" stroke-width="1.5"/>
  <line x1="200" y1="80" x2="260" y2="73" stroke="#f5a623" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="210" y1="65" x2="250" y2="115" stroke="#f5a623" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="225" y1="50" x2="240" y2="128" stroke="#f5a623" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="230" y="148" text-anchor="middle" font-size="7" fill="#f5a623">三组不垂直</text>
  <text x="230" y="160" text-anchor="middle" font-size="7" fill="#f5a623">夹角~75°/105°</text>
  <text x="390" y="25" text-anchor="middle" font-size="10" fill="#302820" font-weight="bold">底面解理（云母）</text>
  <line x1="390" y1="25" x2="390" y2="260" stroke="#e8e0d0" stroke-width="0.5" stroke-dasharray="2,2"/>
  <polygon points="340,65 395,55 440,65 385,75" fill="url(#micaGrad)" stroke="#8b6914" stroke-width="1.5" filter="url(#cubeShadow)"/>
  <polygon points="340,65 340,115 385,125 385,75" fill="#d4a840" stroke="#8b6914" stroke-width="1.5"/>
  <polygon points="385,75 385,125 430,115 430,65" fill="#b89030" stroke="#8b6914" stroke-width="1"/>
  <line x1="340" y1="75" x2="430" y2="75" stroke="#9e2426" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="340" y1="85" x2="430" y2="85" stroke="#9e2426" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="340" y1="95" x2="430" y2="95" stroke="#9e2426" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="340" y1="105" x2="430" y2="105" stroke="#9e2426" stroke-width="1.5" stroke-dasharray="5,3"/>
  <polygon points="355,115 370,145 400,145 415,115" fill="url(#micaGrad)" stroke="#8b6914" stroke-width="0.8" opacity="0.7"/>
  <text x="385" y="160" text-anchor="middle" font-size="8" fill="#9e2426" font-weight="bold">一组解理</text>
  <rect x="335" y="168" width="100" height="32" rx="3" fill="none" stroke="#9e2426" stroke-width="0.7" stroke-dasharray="3,2"/>
  <text x="385" y="182" font-size="7" fill="#8b6914">可剥成极薄片</text>
  <text x="385" y="194" font-size="7" fill="#8b6914">（如云母纸）</text>
  <line x1="110" y1="245" x2="110" y2="255" stroke="#b8a57a" stroke-width="0.6"/>
  <line x1="250" y1="245" x2="250" y2="255" stroke="#b8a57a" stroke-width="0.6"/>
  <line x1="390" y1="245" x2="390" y2="255" stroke="#b8a57a" stroke-width="0.6"/>
  <text x="250" y="278" text-anchor="middle" font-size="11" fill="#302820" font-weight="bold">解理：矿物沿结晶方向裂成光滑平面的性质 —— 方向数和夹角是鉴定关键</text>
</svg>`,
  },
  {
    title: '酸反应测试',
    content: '碳酸盐矿物（方解石 CaCO₃、白云石 CaMg(CO₃)₂ 等）遇稀盐酸（通常 5%-10% HCl）会产生 CO₂ 气泡。这是鉴定碳酸盐矿物的快速方法。\n\n操作步骤：在矿物新鲜表面滴一滴稀盐酸，观察气泡反应。方解石在冷稀盐酸中剧烈起泡；白云石在冷稀盐酸中反应微弱，需加热或使用粉末；菱镁矿类似。\n\n注意：稀盐酸有腐蚀性，实验后需用清水冲洗标本；避免将酸滴在成品晶簇或珍贵标本上；野外可用稀醋酸代替。',
    highlight: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑。方解石（石灰岩的主要成分）在冷稀盐酸中剧烈起泡是最典型的鉴定反应，地质工作者常用此法在野外快速识别石灰岩和白云岩。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mineralGrad2" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#e0d0c0"/>
      <stop offset="50%" stop-color="#c0a890"/>
      <stop offset="100%" stop-color="#a08060"/>
    </linearGradient>
    <linearGradient id="tableGrad2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#9b8470"/>
      <stop offset="100%" stop-color="#6b5438"/>
    </linearGradient>
    <filter id="acidShadow" x="-5%" y="-5%" width="120%" height="120%">
      <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#302820" flood-opacity="0.2"/>
    </filter>
    <radialGradient id="droplet" cx="0.4" cy="0.3" r="0.6">
      <stop offset="0%" stop-color="#d0f0ff" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="#80c8e0" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#4090b0" stop-opacity="0.8"/>
    </radialGradient>
    <radialGradient id="bubble" cx="0.35" cy="0.35" r="0.6">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="40%" stop-color="#d8f0ff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#80c0e0" stop-opacity="0.5"/>
    </radialGradient>
    <linearGradient id="goggleLens" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d0e8ff" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#80c0e0" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#4080a0" stop-opacity="0.5"/>
    </linearGradient>
    <linearGradient id="dropperBottle" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c0d8e8"/>
      <stop offset="50%" stop-color="#e0f0f8"/>
      <stop offset="100%" stop-color="#a0c0d0"/>
    </linearGradient>
  </defs>
  <rect x="30" y="225" width="440" height="14" rx="3" fill="url(#tableGrad2)" filter="url(#acidShadow)"/>
  <polygon points="160,218 280,218 300,95 140,95" fill="url(#mineralGrad2)" stroke="#8b6b4a" stroke-width="1.5" filter="url(#acidShadow)"/>
  <polygon points="163,221 277,221 296,98 143,98" fill="#fff" opacity="0.1"/>
  <text x="220" y="155" text-anchor="middle" font-size="12" fill="#5a3a1a" font-weight="bold">CaCO₃</text>
  <text x="220" y="170" text-anchor="middle" font-size="9" fill="#5a3a1a">方解石/石灰岩</text>
  <ellipse cx="220" cy="112" rx="12" ry="6" fill="url(#droplet)" stroke="#4090b0" stroke-width="1" filter="url(#acidShadow)"/>
  <text x="245" y="108" font-size="8" fill="#2060a0" font-weight="bold">稀HCl</text>
  <path d="M220 106 Q210 90 220 75 Q230 85 230 95" fill="none" stroke="#4090b0" stroke-width="0.5" stroke-dasharray="2,2"/>
  <circle cx="195" cy="85" r="7" fill="url(#bubble)" stroke="#80c0e0" stroke-width="0.8"/>
  <circle cx="195" cy="85" r="3" fill="#fff" opacity="0.5"/>
  <circle cx="230" cy="72" r="9" fill="url(#bubble)" stroke="#80c0e0" stroke-width="0.8"/>
  <circle cx="230" cy="72" r="4" fill="#fff" opacity="0.4"/>
  <circle cx="210" cy="65" r="6" fill="url(#bubble)" stroke="#80c0e0" stroke-width="0.8"/>
  <circle cx="210" cy="65" r="2.5" fill="#fff" opacity="0.5"/>
  <circle cx="245" cy="78" r="5" fill="url(#bubble)" stroke="#80c0e0" stroke-width="0.8"/>
  <circle cx="245" cy="78" r="2" fill="#fff" opacity="0.5"/>
  <circle cx="180" cy="70" r="5" fill="url(#bubble)" stroke="#80c0e0" stroke-width="0.8"/>
  <circle cx="180" cy="70" r="2" fill="#fff" opacity="0.4"/>
  <circle cx="255" cy="68" r="4" fill="url(#bubble)" stroke="#80c0e0" stroke-width="0.8"/>
  <circle cx="255" cy="68" r="1.5" fill="#fff" opacity="0.5"/>
  <circle cx="200" cy="55" r="4" fill="url(#bubble)" stroke="#80c0e0" stroke-width="0.8"/>
  <circle cx="200" cy="55" r="1.5" fill="#fff" opacity="0.3"/>
  <text x="155" y="55" font-size="9" fill="#2060a0" font-weight="bold">CO₂↑</text>
  <line x1="155" y1="55" x2="175" y2="65" stroke="#2060a0" stroke-width="0.5"/>
  <rect x="350" y="55" width="35" height="80" rx="10" fill="url(#dropperBottle)" stroke="#6898b0" stroke-width="1.5" filter="url(#acidShadow)"/>
  <rect x="355" y="60" width="25" height="40" rx="6" fill="#4090b0" opacity="0.4"/>
  <rect x="362" y="50" width="11" height="18" rx="3" fill="#a0c0d0" stroke="#6898b0" stroke-width="1"/>
  <ellipse cx="367" cy="45" rx="6" ry="4" fill="#80c0e0" stroke="#6898b0" stroke-width="0.8"/>
  <text x="367" y="150" text-anchor="middle" font-size="8" fill="#6898b0" font-weight="bold">滴瓶</text>
  <text x="367" y="162" text-anchor="middle" font-size="7" fill="#6898b0">稀HCl</text>
  <circle cx="70" cy="75" r="30" fill="url(#goggleLens)" stroke="#5080a0" stroke-width="2.5"/>
  <circle cx="100" cy="70" r="30" fill="url(#goggleLens)" stroke="#5080a0" stroke-width="2.5"/>
  <line x1="40" y1="75" x2="130" y2="70" stroke="#5080a0" stroke-width="2.5"/>
  <line x1="40" y1="80" x2="130" y2="75" stroke="#5080a0" stroke-width="2"/>
  <path d="M25 80 Q20 65 30 55 Q40 65 35 55" fill="none" stroke="#5080a0" stroke-width="2"/>
  <path d="M120 65 Q130 50 140 55 Q138 68 135 65" fill="none" stroke="#5080a0" stroke-width="2"/>
  <text x="85" y="100" text-anchor="middle" font-size="7" fill="#5080a0" font-weight="bold">护目镜</text>
  <line x1="85" y1="100" x2="85" y2="108" stroke="#5080a0" stroke-width="0.5"/>
  <text x="145" y="190" text-anchor="middle" font-size="9" fill="#9e2426" font-weight="bold">CaCO₃ + 2HCl</text>
  <text x="145" y="202" text-anchor="middle" font-size="9" fill="#9e2426" font-weight="bold">→ CaCl₂ + H₂O + CO₂↑</text>
  <text x="280" y="268" text-anchor="middle" font-size="11" fill="#302820" font-weight="bold">碳酸盐矿物遇酸起泡——最典型的化学鉴定反应</text>
  <text x="81" y="245" text-anchor="middle" font-size="7" fill="#b8a57a">实验后需用清水冲洗标本</text>
</svg>`,
  },
]

export default { name: "MineralID", steps }