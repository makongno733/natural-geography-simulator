const steps = [
  {
    title: '布置勘探网格',
    content: '在地表按一定间距布置勘探网格，标记采样点位。网格间距根据勘探精度要求确定——区域性普查可用较大间距（如 200-500 m），详查阶段需加密至 50-100 m。\n\n本实验中，将土豆视为"地下岩体"，在其表面用牙签或标记笔画出网格线，纵横各 4-5 条，形成 16-25 个网格交点。每个交点即为一个钻孔位置。记录每个孔位的坐标（行号、列号），建立采样定位系统。',
    highlight: '勘探网格是系统化地质勘探的基础——网格越密，对地下构造的空间分辨率越高，但成本也越大。实际矿产勘探中，网格设计需在精度与成本之间权衡。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="boardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e8d5a0"/>
      <stop offset="30%" stop-color="#d4bc80"/>
      <stop offset="70%" stop-color="#c4a460"/>
      <stop offset="100%" stop-color="#b89440"/>
    </linearGradient>
    <radialGradient id="potatoSkin" cx="0.45" cy="0.4" r="0.55">
      <stop offset="0%" stop-color="#e8d5a0"/>
      <stop offset="40%" stop-color="#d4bc70"/>
      <stop offset="80%" stop-color="#c4a450"/>
      <stop offset="100%" stop-color="#a08030"/>
    </radialGradient>
    <linearGradient id="gridLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#9e2426" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="#9e2426" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#9e2426" stop-opacity="0.3"/>
    </linearGradient>
    <filter id="potatoShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="4" dy="5" stdDeviation="5" flood-color="#302820" flood-opacity="0.3"/>
    </filter>
    <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#9e2426" flood-opacity="0.6"/>
    </filter>
    <radialGradient id="boardGrain" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#e8d5a0" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#d4bc80" stop-opacity="0.3"/>
    </radialGradient>
  </defs>
  <rect x="30" y="200" width="440" height="18" rx="3" fill="#b89440" stroke="#8b6914" stroke-width="1.5"/>
  <rect x="35" y="218" width="430" height="65" rx="4" fill="url(#boardGrad)" stroke="#8b6914" stroke-width="1.5"/>
  <line x1="45" y1="230" x2="455" y2="230" stroke="#c4a460" stroke-width="0.5"/>
  <line x1="45" y1="240" x2="455" y2="240" stroke="#c4a460" stroke-width="0.5"/>
  <line x1="45" y1="250" x2="455" y2="250" stroke="#c4a460" stroke-width="0.5"/>
  <line x1="45" y1="260" x2="455" y2="260" stroke="#c4a460" stroke-width="0.5"/>
  <line x1="45" y1="270" x2="455" y2="270" stroke="#c4a460" stroke-width="0.5"/>
  <ellipse cx="250" cy="140" rx="140" ry="60" fill="url(#potatoSkin)" stroke="#8b6914" stroke-width="2" filter="url(#potatoShadow)"/>
  <ellipse cx="250" cy="140" rx="140" ry="60" fill="none" stroke="#a08030" stroke-width="0.5" opacity="0.3" stroke-dasharray="8,4"/>
  <line x1="175" y1="100" x2="175" y2="180" stroke="#9e2426" stroke-width="1" stroke-dasharray="6,4" opacity="0.6"/>
  <line x1="212" y1="92" x2="212" y2="188" stroke="#9e2426" stroke-width="1" stroke-dasharray="6,4" opacity="0.6"/>
  <line x1="250" y1="88" x2="250" y2="192" stroke="#9e2426" stroke-width="1" stroke-dasharray="6,4" opacity="0.6"/>
  <line x1="288" y1="92" x2="288" y2="188" stroke="#9e2426" stroke-width="1" stroke-dasharray="6,4" opacity="0.6"/>
  <line x1="325" y1="100" x2="325" y2="180" stroke="#9e2426" stroke-width="1" stroke-dasharray="6,4" opacity="0.6"/>
  <line x1="120" y1="125" x2="380" y2="125" stroke="#9e2426" stroke-width="1" stroke-dasharray="6,4" opacity="0.6"/>
  <line x1="115" y1="140" x2="385" y2="140" stroke="#9e2426" stroke-width="1" stroke-dasharray="6,4" opacity="0.6"/>
  <line x1="120" y1="155" x2="380" y2="155" stroke="#9e2426" stroke-width="1" stroke-dasharray="6,4" opacity="0.6"/>
  <circle cx="175" cy="125" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="212" cy="125" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="250" cy="125" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="288" cy="125" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="325" cy="125" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="175" cy="140" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="212" cy="140" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="250" cy="140" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="288" cy="140" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="325" cy="140" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="175" cy="155" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="212" cy="155" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="250" cy="155" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="288" cy="155" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <circle cx="325" cy="155" r="4" fill="#9e2426" filter="url(#pointGlow)"/>
  <text x="130" y="125" text-anchor="middle" font-size="9" fill="#9e2426" font-weight="bold">A</text>
  <text x="130" y="140" text-anchor="middle" font-size="9" fill="#9e2426" font-weight="bold">B</text>
  <text x="130" y="155" text-anchor="middle" font-size="9" fill="#9e2426" font-weight="bold">C</text>
  <text x="175" y="93" text-anchor="middle" font-size="9" fill="#9e2426" font-weight="bold">1</text>
  <text x="212" y="93" text-anchor="middle" font-size="9" fill="#9e2426" font-weight="bold">2</text>
  <text x="250" y="93" text-anchor="middle" font-size="9" fill="#9e2426" font-weight="bold">3</text>
  <text x="288" y="93" text-anchor="middle" font-size="9" fill="#9e2426" font-weight="bold">4</text>
  <text x="325" y="93" text-anchor="middle" font-size="9" fill="#9e2426" font-weight="bold">5</text>
  <rect x="415" y="100" width="6" height="70" rx="1" fill="#b8a57a"/>
  <rect x="415" y="100" width="6" height="10" fill="#302820"/>
  <text x="418" y="100" font-size="7" fill="#302820">0</text>
  <rect x="415" y="160" width="6" height="10" fill="#302820"/>
  <text x="418" y="172" font-size="7" fill="#302820">5cm</text>
  <text x="418" y="185" text-anchor="middle" font-size="6" fill="#8b6914">比例</text>
  <text x="390" y="108" font-size="7" fill="#8b6914">比例尺</text>
  <line x1="390" y1="108" x2="412" y2="105" stroke="#8b6914" stroke-width="0.4"/>
  <text x="250" y="272" text-anchor="middle" font-size="11" fill="#302820" font-weight="bold">网格交点 = 钻孔位置  |  纵横线 = 勘探网格  |  间距 = 采样密度</text>
</svg>`,
  },
  {
    title: '钻取岩心样本',
    content: '在标记的每个网格点，用透明吸管（模拟岩心钻机）垂直插入土豆中，旋转并向下推进，获取一段完整的土豆柱作为"岩心样本"。\n\n操作要点：\n1. 保持吸管垂直于土豆表面，缓慢旋转推进\n2. 插到底后轻轻转动半圈，使底部样本断开\n3. 缓慢拔出吸管，保持管内样本完整\n4. 将岩心推出到白纸上，记录该孔位的样本编号\n5. 如果插入深度不够或样本破碎，需在同一位置重新取样',
    highlight: '实际岩心钻探中，钻头内装有岩心管，钻进时岩心进入管内，每钻进一定深度（通常 1.5-3 m）提钻取出岩心。岩心采取率（取出岩心长度/钻进深度）是衡量钻探质量的重要指标，一般要求 > 85%。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8d5a0"/>
      <stop offset="100%" stop-color="#d4bc70"/>
    </linearGradient>
    <linearGradient id="strawGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e0f0f8"/>
      <stop offset="40%" stop-color="#f8fcff"/>
      <stop offset="60%" stop-color="#f8fcff"/>
      <stop offset="100%" stop-color="#c0d8e8"/>
    </linearGradient>
    <linearGradient id="layerYellow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0e080"/>
      <stop offset="100%" stop-color="#d4c040"/>
    </linearGradient>
    <linearGradient id="layerBrown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c4a060"/>
      <stop offset="100%" stop-color="#8b6914"/>
    </linearGradient>
    <linearGradient id="layerRed" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d06040"/>
      <stop offset="100%" stop-color="#9e2426"/>
    </linearGradient>
    <linearGradient id="layerDark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#706050"/>
      <stop offset="100%" stop-color="#302820"/>
    </linearGradient>
    <filter id="coreShadow" x="-5%" y="-5%" width="120%" height="120%">
      <feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#302820" flood-opacity="0.25"/>
    </filter>
    <filter id="strawShadow" x="-5%" y="-5%" width="120%" height="120%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#302820" flood-opacity="0.15"/>
    </filter>
  </defs>
  <ellipse cx="200" cy="220" rx="130" ry="50" fill="url(#soil)" stroke="#8b6914" stroke-width="1.5" filter="url(#coreShadow)"/>
  <rect x="72" y="180" width="256" height="42" fill="url(#layerYellow)" opacity="0.4"/>
  <rect x="72" y="190" width="256" height="32" fill="url(#layerBrown)" opacity="0.4"/>
  <rect x="72" y="200" width="256" height="22" fill="url(#layerRed)" opacity="0.5"/>
  <rect x="72" y="210" width="256" height="12" fill="url(#layerDark)" opacity="0.4"/>
  <text x="80" y="186" font-size="8" fill="#8b6914">表土层</text>
  <text x="80" y="200" font-size="8" fill="#8b6914">风化层</text>
  <text x="80" y="212" font-size="8" fill="#9e2426">矿体A</text>
  <text x="80" y="224" font-size="8" fill="#302820">围岩</text>
  <rect x="193" y="40" width="14" height="185" rx="7" fill="url(#strawGrad)" stroke="#6898b0" stroke-width="1.5" filter="url(#strawShadow)"/>
  <rect x="195" y="42" width="10" height="45" fill="#e8d5a0" rx="1"/>
  <rect x="195" y="87" width="10" height="18" fill="url(#layerYellow)" rx="1"/>
  <rect x="195" y="105" width="10" height="15" fill="url(#layerBrown)" rx="1"/>
  <rect x="195" y="120" width="10" height="12" fill="url(#layerRed)" rx="1"/>
  <rect x="195" y="132" width="10" height="30" fill="url(#layerDark)" rx="1"/>
  <line x1="195" y1="87" x2="205" y2="87" stroke="#8b6914" stroke-width="0.5"/>
  <line x1="195" y1="105" x2="205" y2="105" stroke="#8b6914" stroke-width="0.5"/>
  <line x1="195" y1="120" x2="205" y2="120" stroke="#9e2426" stroke-width="0.5"/>
  <line x1="195" y1="132" x2="205" y2="132" stroke="#9e2426" stroke-width="0.5"/>
  <text x="215" y="60" font-size="9" fill="#6898b0" font-weight="bold">吸管</text>
  <text x="215" y="72" font-size="8" fill="#6898b0">（模拟钻机）</text>
  <line x1="215" y1="78" x2="215" y2="82" stroke="#6898b0" stroke-width="0.4"/>
  <path d="M207 200 Q240 210 280 200 Q300 220 320 215" fill="none" stroke="#b8a57a" stroke-width="0.5" stroke-dasharray="3,2"/>
  <rect x="350" y="80" width="30" height="140" rx="4" fill="#fff" stroke="#b8a57a" stroke-width="1.5" filter="url(#coreShadow)"/>
  <rect x="355" y="85" width="20" height="30" fill="#e8d5a0" rx="2"/>
  <rect x="355" y="115" width="20" height="18" fill="url(#layerYellow)" rx="2"/>
  <rect x="355" y="133" width="20" height="15" fill="url(#layerBrown)" rx="2"/>
  <rect x="355" y="148" width="20" height="14" fill="url(#layerRed)" rx="2"/>
  <rect x="355" y="162" width="20" height="30" fill="url(#layerDark)" rx="2"/>
  <text x="365" y="82" text-anchor="middle" font-size="7" fill="#302820">表土</text>
  <text x="365" y="110" text-anchor="middle" font-size="7" fill="#8b6914">粘土</text>
  <text x="365" y="130" text-anchor="middle" font-size="7" fill="#8b6914">风化</text>
  <text x="365" y="147" text-anchor="middle" font-size="7" fill="#9e2426" font-weight="bold">矿体A</text>
  <text x="365" y="165" text-anchor="middle" font-size="7" fill="#302820">围岩</text>
  <text x="365" y="230" text-anchor="middle" font-size="9" fill="#302820" font-weight="bold">岩心样本</text>
  <line x1="340" y1="200" x2="350" y2="200" stroke="#b8a57a" stroke-width="0.6" stroke-dasharray="2,2"/>
  <path d="M370 68 Q380 55 400 58 Q420 55 430 48 Q440 55 450 52" stroke="#f5a623" stroke-width="0.8" fill="none"/>
  <text x="465" y="50" font-size="7" fill="#f5a623">旋转推进</text>
  <line x1="465" y1="50" x2="435" y2="50" stroke="#f5a623" stroke-width="0.4"/>
  <text x="250" y="280" text-anchor="middle" font-size="11" fill="#302820" font-weight="bold">吸管垂直插入 → 旋转推进 → 提取岩心柱 → 推出编录</text>
</svg>`,
  },
  {
    title: '记录岩心数据',
    content: '对每个孔位取出的岩心样本进行详细记录。记录内容包括：\n\n1. 孔位编号（对应网格坐标）\n2. 岩心总长度（模拟地层厚度）\n3. 颜色变化：从顶部到底部颜色的连续变化\n4. 质地描述：致密/疏松、均一/不均匀\n5. 特殊标志：如有无"矿体"指示（例如预先埋入的巧克力豆、葡萄干等）\n6. 绘制岩心柱状图：用彩色铅笔按比例绘制每段岩心的颜色和特征\n\n将所有孔位数据整理成表格，形成系统的钻孔编录。',
    highlight: '岩心编录是地质勘探的核心环节。地质学家通过岩心判断岩性（岩石类型）、构造（断层、节理、褶皱）、矿化（矿石品位、蚀变类型）等关键信息。一块岩心就是一条垂直的地质时间线。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="tableShadow" x="-5%" y="-5%" width="120%" height="120%">
      <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#302820" flood-opacity="0.2"/>
    </filter>
    <linearGradient id="coreGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8d5a0"/>
      <stop offset="18%" stop-color="#f0e080"/>
      <stop offset="35%" stop-color="#c4a060"/>
      <stop offset="55%" stop-color="#d06040"/>
      <stop offset="100%" stop-color="#302820"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5a8a6a"/>
      <stop offset="100%" stop-color="#3a6a4a"/>
    </linearGradient>
  </defs>
  <rect x="20" y="25" width="210" height="245" rx="6" fill="#fafaf5" stroke="#c4a46c" stroke-width="1.5" filter="url(#tableShadow)"/>
  <rect x="20" y="25" width="210" height="28" rx="6" fill="url(#headerGrad)"/>
  <rect x="20" y="45" width="210" height="8" fill="url(#headerGrad)"/>
  <text x="125" y="43" text-anchor="middle" font-size="9" fill="#fff" font-weight="bold">钻孔编录表 ZK-A3</text>
  <line x1="20" y1="53" x2="230" y2="53" stroke="#c4a46c" stroke-width="0.5"/>
  <text x="35" y="66" font-size="7" fill="#5a8a6a" font-weight="bold">深度(m)</text>
  <text x="90" y="66" font-size="7" fill="#5a8a6a" font-weight="bold">颜色</text>
  <text x="120" y="66" font-size="7" fill="#5a8a6a" font-weight="bold">岩性描述</text>
  <text x="175" y="66" font-size="7" fill="#5a8a6a" font-weight="bold">矿化</text>
  <line x1="20" y1="71" x2="230" y2="71" stroke="#c4a46c" stroke-width="0.5"/>
  <text x="35" y="84" font-size="7" fill="#302820">0-0.3</text>
  <rect x="85" y="76" width="12" height="10" rx="1" fill="#e8d5a0" stroke="#b8a57a" stroke-width="0.3"/>
  <text x="120" y="84" font-size="7" fill="#302820">浅黄，疏松表土</text>
  <text x="175" y="84" font-size="7" fill="#b8a57a">无</text>
  <text x="35" y="98" font-size="7" fill="#302820">0.3-0.6</text>
  <rect x="85" y="90" width="12" height="10" rx="1" fill="#f0e080" stroke="#b8a57a" stroke-width="0.3"/>
  <text x="120" y="98" font-size="7" fill="#302820">黄色粘土，均匀</text>
  <text x="175" y="98" font-size="7" fill="#b8a57a">无</text>
  <text x="35" y="112" font-size="7" fill="#302820">0.6-0.9</text>
  <rect x="85" y="104" width="12" height="10" rx="1" fill="#c4a060" stroke="#b8a57a" stroke-width="0.3"/>
  <text x="120" y="112" font-size="7" fill="#302820">棕色，风化层</text>
  <text x="175" y="112" font-size="7" fill="#b8a57a">无</text>
  <text x="35" y="126" font-size="7" fill="#302820">0.9-1.2</text>
  <rect x="85" y="118" width="12" height="10" rx="1" fill="#d06040" stroke="#b8a57a" stroke-width="0.3"/>
  <text x="120" y="126" font-size="7" fill="#9e2426" font-weight="bold">红色，致密</text>
  <text x="175" y="126" font-size="7" fill="#9e2426" font-weight="bold">★矿体A</text>
  <text x="35" y="140" font-size="7" fill="#302820">1.2-1.8</text>
  <rect x="85" y="132" width="12" height="10" rx="1" fill="#706050" stroke="#b8a57a" stroke-width="0.3"/>
  <text x="120" y="140" font-size="7" fill="#302820">深灰色砂岩</text>
  <text x="175" y="140" font-size="7" fill="#b8a57a">无</text>
  <line x1="20" y1="147" x2="230" y2="147" stroke="#c4a46c" stroke-width="0.5"/>
  <text x="40" y="160" font-size="7" fill="#5a8a6a">总深度: 1.8m</text>
  <text x="120" y="160" font-size="7" fill="#5a8a6a">岩心采取率: 95%</text>
  <line x1="20" y1="165" x2="230" y2="165" stroke="#c4a46c" stroke-width="0.3"/>
  <text x="35" y="176" font-size="7" fill="#302820" font-weight="bold">备注:</text>
  <text x="35" y="188" font-size="6" fill="#606060">0.9m处见明显红色矿化</text>
  <text x="35" y="198" font-size="6" fill="#606060">矿体呈块状，厚度约0.3m</text>
  <text x="35" y="208" font-size="6" fill="#606060">围岩为灰色细砂岩</text>
  <text x="35" y="218" font-size="6" fill="#606060">未见明显构造破碎</text>
  <rect x="290" y="42" width="28" height="200" rx="4" fill="#fafaf5" stroke="#c4a46c" stroke-width="1.5" filter="url(#tableShadow)"/>
  <rect x="294" y="46" width="20" height="30" fill="#e8d5a0" rx="2"/>
  <rect x="294" y="76" width="20" height="18" fill="#f0e080" rx="2"/>
  <rect x="294" y="94" width="20" height="16" fill="#c4a060" rx="2"/>
  <rect x="294" y="110" width="20" height="18" fill="#d06040" rx="2"/>
  <rect x="294" y="128" width="20" height="35" fill="#706050" rx="2"/>
  <line x1="340" y1="46" x2="350" y2="46" stroke="#e8d5a0" stroke-width="1.5"/>
  <text x="355" y="49" font-size="7" fill="#302820">表土 0-0.3m</text>
  <line x1="340" y1="76" x2="350" y2="76" stroke="#f0e080" stroke-width="1.5"/>
  <text x="355" y="79" font-size="7" fill="#302820">粘土 0.3-0.6m</text>
  <line x1="340" y1="94" x2="350" y2="94" stroke="#c4a060" stroke-width="1.5"/>
  <text x="355" y="97" font-size="7" fill="#302820">风化层 0.6-0.9m</text>
  <line x1="340" y1="110" x2="350" y2="110" stroke="#d06040" stroke-width="1.5"/>
  <text x="355" y="113" font-size="7" fill="#9e2426" font-weight="bold">矿体A 0.9-1.2m</text>
  <line x1="340" y1="128" x2="350" y2="128" stroke="#706050" stroke-width="1.5"/>
  <text x="355" y="131" font-size="7" fill="#302820">围岩 1.2-1.8m</text>
  <text x="304" y="255" text-anchor="middle" font-size="8" fill="#302820" font-weight="bold">岩心柱状图</text>
  <text x="304" y="267" text-anchor="middle" font-size="7" fill="#b8a57a">(比例 1:5)</text>
  <rect x="400" y="235" width="50" height="12" rx="2" fill="#f5c6a0" stroke="#d4a090" stroke-width="0.8"/>
  <text x="425" y="244" text-anchor="middle" font-size="6" fill="#8b5a3a">彩色铅笔</text>
  <rect x="420" y="250" width="3" height="30" rx="1" fill="#606060"/>
  <rect x="430" y="250" width="2" height="35" rx="1" fill="#8b6914"/>
  <rect x="440" y="250" width="2" height="30" rx="1" fill="#9e2426"/>
  <text x="280" y="290" text-anchor="middle" font-size="11" fill="#302820" font-weight="bold">记录各孔位岩心长度、颜色、质地和矿化位置</text>
</svg>`,
  },
  {
    title: '重建三维模型',
    content: '利用各钻孔的岩心数据，推断地下地质体的三维空间分布。\n\n分析方法：\n1. 将各孔位的岩心柱按网格位置排列，对比相邻孔位的岩心\n2. 连接相同颜色/质地的层位，绘制剖面图（纵截面和横截面）\n3. 识别"矿体"在三维空间中的形状——是层状（沉积型）、透镜状、脉状（热液型）还是块状\n4. 如果有预先埋入的"矿体"（如巧克力豆代表高品位矿体），观察其在各孔位出现的位置，推断矿体的三维形态\n\n结论：钻孔数据本质上是三维地质体的一维"采样线"——通过多条平行采样线的空间插值，可以推断地下构造，这正是矿产勘探和地质建模的基本方法。',
    highlight: '从一维岩心数据到三维地质模型，需要空间推理和地质知识。相邻钻孔的相似层位可以对比连接，形成地质剖面。这一过程在现代勘探中借助计算机软件（如 Leapfrog、Surpac）实现三维建模和储量估算。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="blockShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="3" dy="4" stdDeviation="4" flood-color="#302820" flood-opacity="0.3"/>
    </filter>
    <linearGradient id="oreA" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e05040"/>
      <stop offset="50%" stop-color="#c03020"/>
      <stop offset="100%" stop-color="#801010"/>
    </linearGradient>
    <linearGradient id="oreB" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5a623"/>
      <stop offset="50%" stop-color="#e09010"/>
      <stop offset="100%" stop-color="#a06000"/>
    </linearGradient>
    <linearGradient id="countryRock" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b0b0b0"/>
      <stop offset="100%" stop-color="#707070"/>
    </linearGradient>
    <linearGradient id="surfaceLayer" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8d5a0"/>
      <stop offset="100%" stop-color="#c4a060"/>
    </linearGradient>
    <radialGradient id="oreAGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#ff6040" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#c03020" stop-opacity="0.4"/>
    </radialGradient>
  </defs>
  <text x="115" y="22" text-anchor="middle" font-size="9" fill="#302820" font-weight="bold">钻孔 A1</text>
  <text x="210" y="22" text-anchor="middle" font-size="9" fill="#302820" font-weight="bold">钻孔 A2</text>
  <text x="305" y="22" text-anchor="middle" font-size="9" fill="#302820" font-weight="bold">钻孔 A3</text>
  <text x="400" y="22" text-anchor="middle" font-size="9" fill="#302820" font-weight="bold">钻孔 A4</text>
  <polygon points="30,230 130,200 460,200 460,260 30,260" fill="url(#surfaceLayer)" stroke="#8b6914" stroke-width="1.5"/>
  <polygon points="30,260 130,230 460,230 460,260 30,260" fill="url(#countryRock)" stroke="#707070" stroke-width="1"/>
  <rect x="100" y="50" width="16" height="175" rx="3" fill="#fff" stroke="#9e2426" stroke-width="1.5"/>
  <rect x="100" y="55" width="16" height="20" fill="#e8d5a0"/>
  <rect x="100" y="75" width="16" height="18" fill="#f0e080"/>
  <rect x="100" y="93" width="16" height="15" fill="#c4a060"/>
  <rect x="100" y="108" width="16" height="40" fill="#aaa"/>
  <rect x="100" y="148" width="16" height="12" fill="#d06040"/>
  <rect x="100" y="160" width="16" height="40" fill="#707070"/>
  <rect x="195" y="50" width="16" height="175" rx="3" fill="#fff" stroke="#9e2426" stroke-width="1.5"/>
  <rect x="195" y="55" width="16" height="18" fill="#e8d5a0"/>
  <rect x="195" y="73" width="16" height="20" fill="#f0e080"/>
  <rect x="195" y="93" width="16" height="12" fill="#c4a060"/>
  <rect x="195" y="105" width="16" height="38" fill="#aaa"/>
  <rect x="195" y="143" width="16" height="18" fill="#d06040"/>
  <rect x="195" y="161" width="16" height="35" fill="#707070"/>
  <rect x="290" y="50" width="16" height="175" rx="3" fill="#fff" stroke="#9e2426" stroke-width="1.5"/>
  <rect x="290" y="55" width="16" height="22" fill="#e8d5a0"/>
  <rect x="290" y="77" width="16" height="16" fill="#f0e080"/>
  <rect x="290" y="93" width="16" height="14" fill="#c4a060"/>
  <rect x="290" y="107" width="16" height="35" fill="#aaa"/>
  <rect x="290" y="142" width="16" height="20" fill="#d06040"/>
  <rect x="290" y="162" width="16" height="38" fill="#707070"/>
  <rect x="385" y="50" width="16" height="175" rx="3" fill="#fff" stroke="#9e2426" stroke-width="1.5"/>
  <rect x="385" y="55" width="16" height="20" fill="#e8d5a0"/>
  <rect x="385" y="75" width="16" height="18" fill="#f0e080"/>
  <rect x="385" y="93" width="16" height="12" fill="#c4a060"/>
  <rect x="385" y="105" width="16" height="42" fill="#aaa"/>
  <rect x="385" y="147" width="16" height="10" fill="#d06040"/>
  <rect x="385" y="157" width="16" height="42" fill="#707070"/>
  <path d="M116 55 Q155 53 211 55 Q250 53 306 55 Q345 53 401 55" stroke="#e8d5a0" stroke-width="2" fill="none"/>
  <path d="M116 75 Q155 72 211 73 Q250 75 306 77 Q345 74 401 75" stroke="#f0e080" stroke-width="1.5" fill="none"/>
  <path d="M116 93 Q155 92 211 93 Q250 92 306 93 Q345 92 401 93" stroke="#c4a060" stroke-width="1.5" fill="none"/>
  <path d="M116 107 Q155 106 211 105 Q250 108 306 107 Q345 108 401 105" stroke="#aaa" stroke-width="1.5" fill="none"/>
  <path d="M116 148 Q155 146 211 143 Q250 144 306 142 Q345 145 401 147" stroke="#9e2426" stroke-width="2.5" fill="none"/>
  <path d="M116 160 Q155 158 211 161 Q250 162 306 162 Q345 160 401 157" stroke="#707070" stroke-width="1.5" fill="none"/>
  <polygon points="140,145 180,130 250,125 300,125 350,130 360,148 350,165 300,165 250,165 180,168 140,160" fill="url(#oreA)" opacity="0.6" stroke="#9e2426" stroke-width="1.5"/>
  <polygon points="200,158 230,150 300,148 350,150 360,158 350,168 300,170 250,170 230,168 200,162" fill="url(#oreA)" opacity="0.5" stroke="#9e2426" stroke-width="1"/>
  <rect x="110" y="238" width="55" height="12" rx="3" fill="#d06040" opacity="0.8"/>
  <text x="138" y="247" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">矿体A</text>
  <rect x="190" y="238" width="55" height="12" rx="3" fill="#f5a623" opacity="0.8"/>
  <text x="218" y="247" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">矿体B</text>
  <rect x="270" y="238" width="55" height="12" rx="3" fill="#aaa" opacity="0.8"/>
  <text x="298" y="247" text-anchor="middle" font-size="8" fill="#302820" font-weight="bold">围岩</text>
  <rect x="350" y="238" width="55" height="12" rx="3" fill="#e8d5a0" opacity="0.8"/>
  <text x="378" y="247" text-anchor="middle" font-size="8" fill="#302820" font-weight="bold">表土层</text>
  <text x="250" y="290" text-anchor="middle" font-size="11" fill="#302820" font-weight="bold">连孔对层 → 三维地质模型（一维采样 → 三维重建）</text>
</svg>`,
  },
]

export default { name: "PotatoCore", steps }