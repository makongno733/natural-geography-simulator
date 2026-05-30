<template></template>
<script>
export const steps = [
  {
    title: '观察颜色和光泽',
    content: '在自然光下观察矿物标本的直观属性——颜色和光泽。颜色是矿物对可见光选择性吸收的结果，可分为自色（矿物固有成分决定）、他色（杂质致色）和假色（表面氧化膜或干涉）。光泽描述矿物表面对光的反射能力，常见类型包括：金属光泽（如黄铁矿）、半金属光泽、金刚光泽（如金刚石）、玻璃光泽（如石英）、油脂光泽、珍珠光泽、丝绢光泽和土状光泽。',
    highlight: '颜色是初步鉴定线索但不可靠——同一种矿物可呈现不同颜色（如石英有紫水晶、烟水晶、蔷薇石英），不同矿物也可有相同颜色。光泽则相对稳定。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <polygon points="120,160 240,160 280,60 160,60" fill="#a080b0" stroke="#302820" stroke-width="1.5"/>
  <polygon points="120,160 240,160 280,60 160,60" fill="url(#shine)" opacity="0.4"/>
  <defs>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <line x1="40" y1="60" x2="160" y2="60" stroke="#f5a623" stroke-width="2"/>
  <path d="M50 65 L70 45 M60 70 L80 50" stroke="#f5a623" stroke-width="1.5"/>
  <text x="170" y="55" font-size="10" fill="#f5a623">入射光</text>
  <line x1="200" y1="100" x2="320" y2="80" stroke="#f5a623" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="325" y="78" font-size="10" fill="#f5a623">反射光</text>
  <text x="200" y="185" text-anchor="middle" font-size="12" fill="#302820">颜色：选择性吸收  |  光泽：表面反射能力</text>
</svg>`,
  },
  {
    title: '条痕测试',
    content: '将矿物在未上釉的白色瓷板（条痕板）上划擦，观察留下的粉末颜色。条痕色是矿物粉末的颜色，比矿物块体的颜色更可靠，因为粉末消除了表面杂质和晶体缺陷的影响。操作要点：手持矿物，以一定力度在瓷板上划一道约 2-3 cm 的线，观察粉末颜色。注意：条痕板硬度约 7，硬度大于 7 的矿物无法在瓷板上留痕——需研磨后观察粉末。',
    highlight: '条痕色是矿物的可靠鉴定特征。例如赤铁矿无论外表是钢灰还是红褐色，条痕恒为樱红色；黄铁矿外表金黄但条痕为绿黑色，可与金（条痕金黄色）区分。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="60" y="100" width="220" height="40" rx="4" fill="#f5f0e0" stroke="#b8a57a" stroke-width="2"/>
  <text x="170" y="125" text-anchor="middle" font-size="11" fill="#b8a57a">白色瓷板（条痕板）</text>
  <line x1="120" y1="120" x2="220" y2="120" stroke="#9e2426" stroke-width="4" opacity="0.8"/>
  <text x="250" y="123" font-size="10" fill="#9e2426">条痕色</text>
  <polygon points="120,100 160,100 170,50 130,50" fill="#555" stroke="#302820" stroke-width="1.5"/>
  <text x="145" y="78" text-anchor="middle" font-size="9" fill="#fff">矿物</text>
  <path d="M145 55 Q170 40 180 55" stroke="#302820" stroke-width="1.5" fill="none"/>
  <text x="195" y="52" font-size="9" fill="#302820">手持</text>
  <text x="200" y="170" text-anchor="middle" font-size="12" fill="#302820">条痕色 = 矿物粉末颜色（比外表颜色更可靠）</text>
</svg>`,
  },
  {
    title: '莫氏硬度测试',
    content: '莫氏硬度是矿物抵抗刻划的能力，用 10 种标准矿物定义从 1 到 10 的相对硬度等级。测试方法：用已知硬度的物体（或标准矿物）刻划未知矿物，观察是否留下划痕。\n\n常见参照物硬度：指甲 ~2.5、铜币 ~3.0、铁钉 ~4.5、小刀/玻璃 ~5.5、钢锉 ~6.5、石英 ~7。\n\n莫氏硬度计标准矿物：1-滑石、2-石膏、3-方解石、4-萤石、5-磷灰石、6-正长石、7-石英（水晶）、8-黄玉、9-刚玉、10-金刚石。\n\n操作：由软到硬依次测试，直到找到能刻划矿物和不能被矿物刻划的相邻参照物，确定矿物硬度范围。',
    highlight: '莫氏硬度是相对硬度而非绝对硬度——金刚石（10）的绝对硬度是滑石（1）的约 1600 倍。野外常用指甲、铜币、小刀作为快速判据。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <polygon points="180,160 220,160 230,60 170,60" fill="#a080b0" stroke="#302820" stroke-width="1.5"/>
  <text x="200" y="115" text-anchor="middle" font-size="10" fill="#fff">矿物</text>
  <rect x="50" y="80" width="30" height="60" rx="3" fill="#f5c6a0" stroke="#b8a57a" stroke-width="1.5"/>
  <text x="65" y="150" text-anchor="middle" font-size="8" fill="#302820">指甲</text>
  <text x="65" y="162" text-anchor="middle" font-size="7" fill="#b8a57a">~2.5</text>
  <circle cx="115" cy="110" r="15" fill="#f5a623" stroke="#d4a76a" stroke-width="1.5"/>
  <text x="115" y="113" text-anchor="middle" font-size="8" fill="#fff">铜币</text>
  <text x="115" y="140" text-anchor="middle" font-size="7" fill="#b8a57a">~3.0</text>
  <rect x="135" y="160" width="6" height="35" fill="#888" rx="1"/>
  <text x="138" y="150" text-anchor="middle" font-size="7" fill="#b8a57a">铁钉~4.5</text>
  <rect x="260" y="80" width="20" height="35" fill="rgba(200,220,240,0.4)" stroke="#b8a57a" stroke-width="1"/>
  <text x="270" y="130" text-anchor="middle" font-size="7" fill="#b8a57a">玻璃</text>
  <text x="270" y="142" text-anchor="middle" font-size="7" fill="#b8a57a">~5.5</text>
  <rect x="310" y="80" width="60" height="36" rx="6" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="340" y="100" text-anchor="middle" font-size="8" fill="#9e2426">莫氏硬度计</text>
  <text x="340" y="112" text-anchor="middle" font-size="7" fill="#b8a57a">1-10 级标准矿物</text>
  <text x="160" y="195" text-anchor="middle" font-size="11" fill="#302820">由软到硬依次刻划，确定矿物硬度范围</text>
</svg>`,
  },
  {
    title: '解理观察',
    content: '解理是矿物受外力作用时沿一定结晶学方向裂开成光滑平面的性质。观察解理需要放大镜（10×），注意解理的方向数、夹角和完整程度。\n\n主要解理类型：\n- 立方体解理（三组互相垂直）：如方解石（菱面体解理，三组不垂直，夹角约 75°/105°）、萤石（八面体解理）\n- 底面解理（一组）：如云母，可剥成极薄的片\n- 柱面解理（两组）：如辉石（近直角，87°/93°）、角闪石（约 56°/124°）\n- 无解理：如石英，断口呈贝壳状',
    highlight: '解理方向和夹角是鉴定相似矿物的关键——辉石和角闪石在颜色、硬度上相近，但解理夹角不同（辉石近 90°，角闪石约 56°），是最可靠的区分特征。',
    illustration: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="80" width="55" height="55" fill="#a080b0" stroke="#302820" stroke-width="1.5"/>
  <line x1="20" y1="80" x2="75" y2="135" stroke="#9e2426" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="20" y1="135" x2="75" y2="80" stroke="#9e2426" stroke-width="1.5" stroke-dasharray="3,3"/>
  <text x="47" y="155" text-anchor="middle" font-size="9" fill="#302820">立方体解理</text>
  <text x="47" y="167" text-anchor="middle" font-size="7" fill="#b8a57a">三组⊥</text>
  <polygon points="140,80 180,85 170,130 130,125" fill="#a080b0" stroke="#302820" stroke-width="1.5"/>
  <line x1="130" y1="125" x2="170" y2="130" stroke="#9e2426" stroke-width="1.5" stroke-dasharray="3,3"/>
  <text x="155" y="155" text-anchor="middle" font-size="9" fill="#302820">底面解理</text>
  <text x="155" y="167" text-anchor="middle" font-size="7" fill="#b8a57a">一组（云母）</text>
  <polygon points="270,85 310,80 320,135 280,140" fill="#a080b0" stroke="#302820" stroke-width="1.5"/>
  <line x1="275" y1="90" x2="310" y2="130" stroke="#9e2426" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="285" y1="80" x2="315" y2="135" stroke="#9e2426" stroke-width="1.5" stroke-dasharray="3,3"/>
  <text x="295" y="155" text-anchor="middle" font-size="9" fill="#302820">柱面解理</text>
  <text x="295" y="167" text-anchor="middle" font-size="7" fill="#b8a57a">两组（辉石/角闪石）</text>
  <text x="200" y="200" text-anchor="middle" font-size="12" fill="#302820">解理：矿物沿结晶方向裂成光滑平面的性质</text>
</svg>`,
  },
  {
    title: '酸反应测试',
    content: '碳酸盐矿物（方解石 CaCO₃、白云石 CaMg(CO₃)₂ 等）遇稀盐酸（通常 5%-10% HCl）会产生 CO₂ 气泡。这是鉴定碳酸盐矿物的快速方法。\n\n操作步骤：在矿物新鲜表面滴一滴稀盐酸，观察气泡反应。方解石在冷稀盐酸中剧烈起泡；白云石在冷稀盐酸中反应微弱，需加热或使用粉末；菱镁矿类似。\n\n注意：稀盐酸有腐蚀性，实验后需用清水冲洗标本；避免将酸滴在成品晶簇或珍贵标本上；野外可用稀醋酸代替。',
    highlight: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑。方解石（石灰岩的主要成分）在冷稀盐酸中剧烈起泡是最典型的鉴定反应，地质工作者常用此法在野外快速识别石灰岩和白云岩。',
    illustration: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <polygon points="180,170 240,170 260,80 160,80" fill="#a080b0" stroke="#302820" stroke-width="1.5"/>
  <text x="210" y="130" text-anchor="middle" font-size="10" fill="#fff">CaCO₃</text>
  <rect x="250" y="60" width="25" height="40" rx="3" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <text x="262" y="85" text-anchor="middle" font-size="8" fill="#9e2426">HCl</text>
  <circle cx="260" cy="50" r="3" fill="#9e2426"/>
  <path d="M260 53 L260 58" stroke="#9e2426" stroke-width="1.5"/>
  <circle cx="210" cy="75" r="4" fill="none" stroke="#6ba8d9" stroke-width="1.5"/>
  <circle cx="195" cy="68" r="3" fill="none" stroke="#6ba8d9" stroke-width="1.5"/>
  <circle cx="225" cy="65" r="5" fill="none" stroke="#6ba8d9" stroke-width="1.5"/>
  <circle cx="205" cy="58" r="3.5" fill="none" stroke="#6ba8d9" stroke-width="1.5"/>
  <circle cx="215" cy="52" r="2.5" fill="none" stroke="#6ba8d9" stroke-width="1.5"/>
  <text x="150" y="55" font-size="9" fill="#6ba8d9">CO₂↑</text>
  <text x="170" y="50" font-size="9" fill="#6ba8d9">气泡</text>
  <text x="210" y="195" text-anchor="middle" font-size="11" fill="#302820">CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑（气泡）</text>
</svg>`,
  },
]

export default { name: 'MineralID' }
</script>
