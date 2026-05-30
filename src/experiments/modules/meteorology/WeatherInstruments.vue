<template></template>
<script>
export const steps = [
  {
    title: '气球气压计',
    content: '将一个气球剪开，绷紧覆盖在广口瓶的瓶口上，用橡皮筋扎紧。将一根吸管的一端粘在气球膜中央，另一端作为指针。当大气压变化时，气球膜会凹陷或凸起，带动吸管指针上下偏移。气压升高 → 膜凹陷 → 指针上翘；气压降低 → 膜凸起 → 指针下垂。',
    highlight: '气压变化引起密闭瓶内外的压力差，使弹性膜变形。标准大气压 = 1013.25 hPa。',
    illustration: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="100" y="80" width="120" height="120" rx="8" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="2"/>
  <ellipse cx="160" cy="80" rx="60" ry="12" fill="#f5a623" opacity="0.7" stroke="#d4a76a" stroke-width="1.5"/>
  <text x="160" y="84" text-anchor="middle" font-size="10" fill="#302820">气球膜</text>
  <rect x="155" y="40" width="4" height="40" fill="#9e2426" rx="1"/>
  <polygon points="230,40 250,35 250,45" fill="#9e2426"/>
  <line x1="157" y1="40" x2="240" y2="40" stroke="#9e2426" stroke-width="3"/>
  <text x="260" y="95" font-size="11" fill="#302820">指针</text>
  <text x="160" y="225" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">广口瓶 + 气球膜 + 吸管指针</text>
</svg>`,
  },
  {
    title: '乒乓球风速计',
    content: '将一个乒乓球用细线悬挂在量角器的中心点。风吹动乒乓球，使细线偏离垂直方向。测量偏角 θ，风速 v ≈ √(mg·tanθ / (0.5·ρ·Cd·A))。偏角越大，风速越大。可以用已知风速校准。',
    highlight: '风对球的拖曳力与风速的平方成正比。蒲福风级将风速分为 0-12 级。',
    illustration: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <path d="M60 170 Q200 50 340 170" fill="none" stroke="#b8a57a" stroke-width="2"/>
  <text x="200" y="60" text-anchor="middle" font-size="11" fill="#302820">量角器</text>
  <text x="140" y="130" font-size="9" fill="#b8a57a">0°</text>
  <text x="100" y="165" font-size="9" fill="#b8a57a">30°</text>
  <text x="220" y="165" font-size="9" fill="#b8a57a">60°</text>
  <text x="285" y="130" font-size="9" fill="#b8a57a">90°</text>
  <line x1="200" y1="170" x2="200" y2="80" stroke="#9e2426" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="200" y1="170" x2="240" y2="110" stroke="#302820" stroke-width="1.5"/>
  <circle cx="240" cy="110" r="15" fill="#fff" stroke="#b8a57a" stroke-width="1.5"/>
  <text x="240" y="114" text-anchor="middle" font-size="8" fill="#302820">球</text>
  <path d="M300 90 L320 80 L320 100 Z" fill="#6ba8d9" opacity="0.5"/>
  <text x="330" y="80" font-size="11" fill="#6ba8d9">风</text>
  <text x="260" y="140" font-size="10" fill="#9e2426">θ</text>
  <text x="200" y="210" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">量角器 + 乒乓球 + 细线</text>
</svg>`,
  },
  {
    title: '简易雨量计',
    content: '取一个直筒透明容器（如量筒），在上方放置一个漏斗（确保漏斗边缘水平）。将装置放在开阔处。降雨后读取收集的水深。雨量 = 收集水体体积 / 漏斗口面积。1 mm 降雨量 = 每平方米 1 升水。',
    highlight: '标准雨量计口径 20 cm，安装高度 0.7 m（中国标准）。降水强度：小雨 < 10 mm/h，暴雨 > 50 mm/h。',
    illustration: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <polygon points="120,40 280,40 240,100 160,100" fill="rgba(200,220,240,0.4)" stroke="#b8a57a" stroke-width="2"/>
  <text x="200" y="70" text-anchor="middle" font-size="11" fill="#302820">漏斗</text>
  <rect x="160" y="100" width="80" height="100" rx="4" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="2"/>
  <rect x="165" y="140" width="70" height="55" fill="#6ba8d9" opacity="0.6" rx="2"/>
  <text x="200" y="170" text-anchor="middle" font-size="10" fill="#302820">雨水</text>
  <line x1="175" y1="140" x2="220" y2="140" stroke="#302820" stroke-width="0.5"/>
  <text x="230" y="143" font-size="9" fill="#302820">mm</text>
  <line x1="110" y1="70" x2="130" y2="70" stroke="#6ba8d9" stroke-width="2"/>
  <circle cx="110" cy="70" r="3" fill="#6ba8d9"/>
  <line x1="140" y1="75" x2="160" y2="75" stroke="#6ba8d9" stroke-width="1.5"/>
  <line x1="100" y1="90" x2="120" y2="90" stroke="#6ba8d9" stroke-width="1.5"/>
  <text x="200" y="225" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">漏斗 + 量筒 = 雨量计</text>
</svg>`,
  },
  {
    title: '风向标',
    content: '在吸管一端剪出一个箭头形尾翼，另一端加配重（橡皮泥），中间用大头针垂直穿过作为转轴。将大头针插在铅笔顶端的橡皮上。放在风中，箭头指向风吹来的方向。风的命名以来向为准（如北风 = 从北向南吹）。',
    highlight: '风向用 16 方位或 0-360° 表示。气象站标准高度 10 m。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="190" y="150" width="20" height="40" rx="2" fill="#f5a623"/>
  <text x="200" y="185" text-anchor="middle" font-size="8" fill="#302820">铅笔</text>
  <line x1="200" y1="150" x2="200" y2="60" stroke="#b8a57a" stroke-width="1.5"/>
  <circle cx="200" cy="60" r="4" fill="#9e2426"/>
  <text x="210" y="63" font-size="10" fill="#302820">大头针</text>
  <rect x="200" y="55" width="100" height="6" rx="3" fill="#d4a76a"/>
  <polygon points="300,50 320,58 300,66" fill="#9e2426"/>
  <circle cx="195" cy="58" r="6" fill="#9e2426" opacity="0.6"/>
  <text x="185" y="55" font-size="9" fill="#302820">配重</text>
  <text x="250" y="50" text-anchor="middle" font-size="10" fill="#302820">吸管</text>
  <path d="M320 58 Q360 40 380 58" stroke="#6ba8d9" stroke-width="2" marker-end="url(#windArrow)" fill="none"/>
  <defs>
    <marker id="windArrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#6ba8d9"/>
    </marker>
  </defs>
  <text x="380" y="52" font-size="11" fill="#6ba8d9">风</text>
  <text x="200" y="195" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">吸管箭头 + 大头针 + 铅笔</text>
</svg>`,
  },
]

export default { name: 'WeatherInstruments' }
</script>
