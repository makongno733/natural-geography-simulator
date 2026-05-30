<template></template>
<script>
const steps = [
  {
    title: '气球气压计',
    content: '将气球剪开，绷紧覆盖在广口瓶口，用橡皮筋扎紧。吸管一端粘在气球膜中央，另一端作指针。气压变化使气球膜变形，带动指针偏移。气压↑→膜凹陷→指针上翘；气压↓→膜凸起→指针下垂。',
    highlight: '气压变化引起密闭瓶内外压力差，使弹性膜变形。标准大气压 = 1013.25 hPa。',
    illustration: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="140" y="50" width="80" height="100" rx="6" fill="rgba(220,200,180,0.4)" stroke="#8f7652" stroke-width="2"/>
  <path d="M135 60 Q180 35 225 60" fill="rgba(255,200,150,0.3)" stroke="#e67e22" stroke-width="2"/>
  <ellipse cx="180" cy="58" rx="45" ry="10" fill="rgba(255,200,150,0.25)" stroke="#e67e22" stroke-width="2"/>
  <rect x="125" y="55" width="110" height="4" rx="2" fill="#d4a76a"/>
  <line x1="180" y1="55" x2="130" y2="35" stroke="#9e2426" stroke-width="2.5"/>
  <polygon points="130,35 125,30 135,30" fill="#9e2426"/>
  <rect x="250" y="30" width="100" height="140" rx="4" fill="rgba(255,255,240,0.6)" stroke="#b8a57a" stroke-width="1"/>
  <text x="300" y="55" text-anchor="middle" font-size="11" fill="#9e2426">高压: 指针↗</text>
  <line x1="280" y1="65" x2="320" y2="65" stroke="#999" stroke-width="1"/>
  <text x="300" y="95" text-anchor="middle" font-size="11" fill="#5ba0d0">低压: 指针↘</text>
  <line x1="280" y1="105" x2="320" y2="105" stroke="#999" stroke-width="1"/>
  <text x="180" y="175" text-anchor="middle" font-size="11" fill="#302820">气球膜随气压变化变形</text>
  <text x="180" y="195" text-anchor="middle" font-size="13" fill="#302820">广口瓶 + 气球膜 + 吸管指针</text>
</svg>`,
  },
  {
    title: '乒乓球风速计',
    content: '将乒乓球用细线悬挂在量角器中心。风吹动乒乓球使细线偏离垂直方向。测量偏角 θ，风速 v 与 tanθ 成正比。偏角越大风速越大，可用已知风速校准。',
    highlight: '风对球的拖曳力与风速平方成正比。蒲福风级将风速分为 0-12 级。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M100 170 Q200 10 300 170" fill="none" stroke="#b8a57a" stroke-width="2"/>
  <line x1="200" y1="10" x2="200" y2="170" stroke="#999" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="100" y1="170" x2="200" y2="170" stroke="#302820" stroke-width="1.5"/>
  <text x="110" y="165" text-anchor="middle" font-size="11" fill="#302820">0°</text>
  <text x="290" y="165" text-anchor="middle" font-size="11" fill="#302820">90°</text>
  <text x="200" y="180" text-anchor="middle" font-size="11" fill="#302820">量角器</text>
  <circle cx="200" cy="10" r="3" fill="#9e2426"/>
  <line x1="200" y1="10" x2="245" y2="100" stroke="#302820" stroke-width="1.5"/>
  <circle cx="250" cy="108" r="16" fill="#f5f0e0" stroke="#e67e22" stroke-width="2"/>
  <text x="250" y="112" text-anchor="middle" font-size="9" fill="#302820">乒乓</text>
  <text x="250" y="122" text-anchor="middle" font-size="9" fill="#302820">球</text>
  <path d="M310 80 Q340 75 350 90" stroke="#5ba0d0" stroke-width="2"/>
  <polygon points="350,90 345,84 355,84" fill="#5ba0d0"/>
  <text x="340" y="65" text-anchor="middle" font-size="11" fill="#5ba0d0">风</text>
  <text x="250" y="155" text-anchor="middle" font-size="11" fill="#9e2426">偏角 θ</text>
  <text x="250" y="175" text-anchor="middle" font-size="13" fill="#302820">量角器 + 乒乓球 + 细线</text>
</svg>`,
  },
  {
    title: '简易雨量计',
    content: '取直筒透明容器（如量筒），上方放置漏斗确保边缘水平，放在开阔处。降雨后读取收集水深。雨量 = 水体体积 / 漏斗口面积。1 mm 降雨量 = 每平方米 1 升水。',
    highlight: '标准雨量计口径 20 cm。降水强度：小雨 < 10 mm/h，暴雨 > 50 mm/h。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M130 40 L200 15 L270 40" fill="rgba(200,220,240,0.3)" stroke="#8f7652" stroke-width="2"/>
  <line x1="130" y1="40" x2="120" y2="150" stroke="#8f7652" stroke-width="2"/>
  <line x1="270" y1="40" x2="280" y2="150" stroke="#8f7652" stroke-width="2"/>
  <line x1="120" y1="150" x2="280" y2="150" stroke="#8f7652" stroke-width="2"/>
  <rect x="125" y="100" width="150" height="50" fill="rgba(100,160,220,0.3)" stroke="#5ba0d0" stroke-width="1.5"/>
  <line x1="125" y1="120" x2="275" y2="120" stroke="#5ba0d0" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="115" y="124" text-anchor="end" font-size="10" fill="#5ba0d0">水深</text>
  <line x1="380" y1="30" x2="380" y2="50" stroke="#5ba0d0" stroke-width="1.5"/>
  <line x1="375" y1="35" x2="385" y2="35" stroke="#5ba0d0" stroke-width="1"/>
  <circle cx="380" cy="32" r="2" fill="#5ba0d0"/>
  <circle cx="370" cy="38" r="2" fill="#5ba0d0"/>
  <circle cx="385" cy="42" r="2" fill="#5ba0d0"/>
  <circle cx="378" cy="48" r="2" fill="#5ba0d0"/>
  <text x="375" y="65" text-anchor="end" font-size="11" fill="#5ba0d0">降雨</text>
  <text x="200" y="175" text-anchor="middle" font-size="13" fill="#302820">漏斗 + 直筒量筒</text>
</svg>`,
  },
  {
    title: '风向标',
    content: '在吸管一端剪出箭头形尾翼，另一端加配重（橡皮泥），中间用大头针作转轴，插在铅笔橡皮上。放在风中箭头指向风吹来的方向。风以来源方向命名（北风 = 从北向南吹）。',
    highlight: '风向用 16 方位或 0-360° 表示。气象站标准高度 10 m。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="180" y="150" width="40" height="30" rx="4" fill="rgba(160,120,80,0.4)" stroke="#8f7652" stroke-width="1"/>
  <rect x="195" y="120" width="10" height="30" fill="#d4a76a"/>
  <circle cx="200" cy="118" r="4" fill="#9e2426"/>
  <line x1="100" y1="118" x2="300" y2="118" stroke="#302820" stroke-width="3"/>
  <polygon points="100,118 120,108 120,128" fill="#9e2426"/>
  <polygon points="300,118 275,108 275,128" fill="#4a7c3f"/>
  <text x="200" y="108" text-anchor="middle" font-size="9" fill="#9e2426">箭头指来向</text>
  <text x="200" y="90" text-anchor="middle" font-size="11" fill="#302820">大头针转轴</text>
  <text x="200" y="195" text-anchor="middle" font-size="11" fill="#302820">铅笔 + 橡皮底座</text>
  <text x="70" y="125" text-anchor="end" font-size="11" fill="#9e2426">风从北来</text>
  <text x="325" y="125" text-anchor="start" font-size="11" fill="#4a7c3f">尾翼</text>
</svg>`,
  },
]

export default { name: "WeatherInstruments", steps }
</script>
