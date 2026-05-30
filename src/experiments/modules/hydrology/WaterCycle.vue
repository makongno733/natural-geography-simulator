<template></template>
<script>
export const steps = [
  {
    title: '搭建微型水循环系统',
    content: '在一个大碗中倒入约 1/3 的温水（可加几滴食用色素便于观察）。在碗中央放一个小杯子（空杯，用于收集"降水"）。用保鲜膜密封碗口，在保鲜膜中央（小杯正上方）放一颗石子或硬币，使膜略微下凹。',
    highlight: '这个封闭系统包含了水循环的全部要素：碗中的水 = 海洋/地表水，保鲜膜 = 大气层，小杯 = 陆地/湖泊。',
    illustration: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="200" cy="100" rx="140" ry="40" fill="none" stroke="#b8a57a" stroke-width="2"/>
  <ellipse cx="200" cy="180" rx="120" ry="35" fill="none" stroke="#b8a57a" stroke-width="2"/>
  <path d="M60 100 Q60 180 80 180" fill="none" stroke="#b8a57a" stroke-width="2"/>
  <path d="M340 100 Q340 180 320 180" fill="none" stroke="#b8a57a" stroke-width="2"/>
  <rect x="140" y="145" width="40" height="35" rx="3" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <text x="160" y="167" text-anchor="middle" font-size="9" fill="#302820">小杯</text>
  <rect x="95" y="148" width="50" height="32" fill="#6ba8d9" opacity="0.5" rx="3"/>
  <text x="120" y="168" text-anchor="middle" font-size="10" fill="#302820">温水</text>
  <text x="200" y="90" text-anchor="middle" font-size="11" fill="#302820">保鲜膜（密封碗口）</text>
  <circle cx="200" cy="92" r="8" fill="#888" opacity="0.6"/>
  <text x="200" y="82" text-anchor="middle" font-size="9" fill="#302820">石子</text>
  <line x1="200" y1="100" x2="160" y2="150" stroke="#302820" stroke-width="0.5" stroke-dasharray="2,3"/>
  <text x="200" y="225" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">大碗 + 小杯 + 保鲜膜 + 石子</text>
</svg>`,
  },
  {
    title: '阳光照射——蒸发开始',
    content: '将装置放在阳光充足的窗台或台灯下。温水在光照下蒸发，水汽上升。观察保鲜膜内侧逐渐出现雾气（小水滴）——这是蒸发和凝结过程。',
    highlight: '太阳辐射是水循环的驱动力。全球每年约 577,000 km³ 的水通过蒸发进入大气。',
    illustration: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="30" r="30" fill="#f5a623" opacity="0.8"/>
  <circle cx="200" cy="30" r="38" fill="#f5a623" opacity="0.2"/>
  <line x1="170" y1="30" x2="150" y2="30" stroke="#f5a623" stroke-width="2"/>
  <line x1="200" y1="0" x2="200" y2="-10" stroke="#f5a623" stroke-width="2"/>
  <line x1="230" y1="30" x2="250" y2="30" stroke="#f5a623" stroke-width="2"/>
  <line x1="200" y1="60" x2="200" y2="65" stroke="#f5a623" stroke-width="2"/>
  <text x="200" y="34" text-anchor="middle" font-size="12" fill="#fff" font-weight="700">太阳</text>
  <ellipse cx="200" cy="120" rx="120" ry="35" fill="none" stroke="#b8a57a" stroke-width="2"/>
  <rect x="140" y="160" width="40" height="30" rx="3" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <rect x="110" y="165" width="50" height="25" fill="#6ba8d9" opacity="0.5" rx="3"/>
  <path d="M120 165 Q130 150 140 145 M150 162 Q155 140 160 138" stroke="#6ba8d9" stroke-width="1.5" opacity="0.5" fill="none"/>
  <path d="M180 168 Q185 145 190 140 M200 166 Q200 140 200 135" stroke="#6ba8d9" stroke-width="1.5" opacity="0.5" fill="none"/>
  <text x="230" y="100" font-size="9" fill="#f5a623">☀ 光照</text>
  <circle cx="160" cy="110" r="2" fill="#b8d4e3" opacity="0.6"/>
  <circle cx="185" cy="105" r="2.5" fill="#b8d4e3" opacity="0.5"/>
  <circle cx="210" cy="108" r="2" fill="#b8d4e3" opacity="0.6"/>
  <circle cx="175" cy="100" r="1.5" fill="#b8d4e3" opacity="0.4"/>
  <text x="200" y="93" text-anchor="middle" font-size="9" fill="#6ba8d9">水汽↑</text>
  <text x="200" y="215" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">太阳加热 → 蒸发 → 水汽上升 → 保鲜膜上凝雾</text>
</svg>`,
  },
  {
    title: '凝结与"降水"',
    content: '随着蒸发继续，保鲜膜上的雾气聚集成越来越大的水滴。当水滴足够大时，它们沿保鲜膜斜坡滑向中央（石子压低处），滴入小杯中。这就是"降水"——凝结的水滴大到足以克服重力下落。',
    highlight: '云滴直径约 10-20 μm，雨滴直径约 0.5-5 mm。一滴雨滴包含约 100 万个云滴。',
    illustration: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="200" cy="120" rx="120" ry="35" fill="none" stroke="#b8a57a" stroke-width="2"/>
  <rect x="155" y="160" width="40" height="28" rx="3" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <rect x="158" y="168" width="34" height="18" fill="#6ba8d9" opacity="0.6" rx="2"/>
  <line x1="200" y1="95" x2="200" y2="80" stroke="#b8a57a" stroke-width="2"/>
  <circle cx="200" cy="78" r="6" fill="#888" opacity="0.6"/>
  <circle cx="140" cy="95" r="3" fill="#6ba8d9" opacity="0.7"/>
  <circle cx="150" cy="92" r="4" fill="#6ba8d9" opacity="0.7"/>
  <circle cx="160" cy="90" r="5" fill="#6ba8d9" opacity="0.8"/>
  <circle cx="170" cy="88" r="5" fill="#6ba8d9" opacity="0.8"/>
  <circle cx="180" cy="86" r="6" fill="#6ba8d9" opacity="0.9"/>
  <circle cx="190" cy="84" r="7" fill="#6ba8d9" opacity="0.9"/>
  <path d="M195 91 L195 120 L198 155" stroke="#6ba8d9" stroke-width="1.5" fill="none"/>
  <circle cx="198" cy="160" r="2" fill="#6ba8d9"/>
  <line x1="200" y1="100" x2="200" y2="160" stroke="#6ba8d9" stroke-width="1.5" stroke-dasharray="3,3"/>
  <text x="225" y="130" font-size="9" fill="#6ba8d9">水滴滑落</text>
  <text x="175" y="75" text-anchor="middle" font-size="8" fill="#302820">水滴聚集</text>
  <text x="200" y="215" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">雾滴聚集 → 沿膜滑落 → 滴入小杯（降水）</text>
</svg>`,
  },
  {
    title: '观察与总结',
    content: '等待 1-2 小时后，观察小杯中收集到的水量。这演示了蒸发→凝结→降水→收集的完整水循环。碗中的"海洋"水减少，小杯中的"陆地淡水"增加。真实水循环中，水还可以通过径流和地下水回流到海洋。',
    highlight: '水循环是地球系统中连接大气圈、水圈、岩石圈和生物圈的核心过程。水在大气中的平均停留时间约 9 天，在地下水中可达数百年。',
    illustration: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="200" cy="140" rx="150" ry="40" fill="none" stroke="#6ba8d9" stroke-width="2"/>
  <text x="200" y="125" text-anchor="middle" font-size="10" fill="#6ba8d9">海洋</text>
  <circle cx="200" cy="30" r="22" fill="#f5a623" opacity="0.8"/>
  <text x="200" y="34" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">太阳</text>
  <path d="M190 52 Q170 70 175 100" stroke="#6ba8d9" stroke-width="2" marker-end="url(#evapArrow)"/>
  <text x="160" y="75" font-size="9" fill="#6ba8d9">蒸发</text>
  <ellipse cx="200" cy="100" rx="60" ry="18" fill="rgba(255,255,255,0.8)" stroke="#b8d4e3" stroke-width="1"/>
  <text x="200" y="103" text-anchor="middle" font-size="9" fill="#302820">云</text>
  <path d="M220 115 Q240 130 235 155" stroke="#6ba8d9" stroke-width="2" marker-end="url(#precipArrow)"/>
  <text x="248" y="140" font-size="9" fill="#6ba8d9">降水</text>
  <rect x="240" y="155" width="50" height="30" rx="3" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <text x="265" y="175" text-anchor="middle" font-size="8" fill="#302820">陆地</text>
  <path d="M280 170 Q310 160 310 148" stroke="#6ba8d9" stroke-width="1.5" marker-end="url(#runoffArrow)" stroke-dasharray="3,3"/>
  <text x="320" y="158" font-size="8" fill="#6ba8d9">径流</text>
  <defs>
    <marker id="evapArrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#6ba8d9"/>
    </marker>
    <marker id="precipArrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#6ba8d9"/>
    </marker>
    <marker id="runoffArrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#6ba8d9"/>
    </marker>
  </defs>
  <text x="200" y="215" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">蒸发→凝结→降水→径流→回流 完整水循环</text>
</svg>`,
  },
]
export default { name: 'WaterCycle' }
</script>
