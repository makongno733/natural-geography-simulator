<template></template>
<script>
export const steps = [
  {
    title: '准备材料',
    content: '准备一个透明塑料瓶（带盖）、少量温水、一根火柴（或一支香）。实验在安全环境下进行，注意防火。',
    highlight: '温水提供水汽，火柴提供凝结核（烟尘颗粒）。',
    illustration: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="120" y="30" width="80" height="140" rx="12" fill="rgba(200,220,240,0.5)" stroke="#b8a57a" stroke-width="2"/>
  <rect x="130" y="130" width="60" height="6" rx="3" fill="#9e2426"/>
  <rect x="125" y="25" width="70" height="10" rx="5" fill="#9e2426"/>
  <path d="M140 170 Q160 150 180 170" fill="none" stroke="#6ba8d9" stroke-width="3"/>
  <text x="160" y="160" text-anchor="middle" font-size="12" fill="#6ba8d9">温水</text>
  <rect x="240" y="120" width="50" height="8" rx="3" fill="#d4a76a"/>
  <circle cx="265" cy="116" r="6" fill="#f5a623"/>
  <path d="M265 116 Q270 108 275 115" stroke="#ff6b35" stroke-width="2" fill="none"/>
  <text x="265" y="100" text-anchor="middle" font-size="11" fill="#ff6b35">火柴</text>
  <text x="160" y="200" text-anchor="middle" font-size="14" fill="#302820" font-weight="700">透明塑料瓶 + 温水 + 火柴</text>
</svg>`,
  },
  {
    title: '引入水汽和凝结核',
    content: '向瓶中倒入少量温水（约 2-3 cm 深），轻轻摇晃使瓶壁湿润。点燃火柴，吹灭后迅速将带烟的火柴头伸入瓶中，让烟尘进入瓶内，然后拧紧瓶盖。',
    highlight: '烟尘颗粒是云滴形成的必要条件——它们作为凝结核，水汽分子可以在其表面聚集。',
    illustration: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="100" y="30" width="90" height="150" rx="12" fill="rgba(200,220,240,0.5)" stroke="#b8a57a" stroke-width="2"/>
  <rect x="110" y="140" width="70" height="6" rx="3" fill="#9e2426"/>
  <path d="M130 170 Q160 140 190 170" fill="none" stroke="#6ba8d9" stroke-width="3"/>
  <text x="145" y="20" text-anchor="middle" font-size="11" fill="#302820">瓶盖已拧紧</text>
  <rect x="270" y="100" width="40" height="6" rx="2" fill="#d4a76a"/>
  <circle cx="290" cy="96" r="6" fill="#f5a623"/>
  <circle cx="282" cy="88" r="4" fill="#888" opacity="0.6"/>
  <circle cx="295" cy="84" r="5" fill="#999" opacity="0.5"/>
  <circle cx="288" cy="78" r="4" fill="#888" opacity="0.4"/>
  <circle cx="205" cy="80" r="3" fill="#999" opacity="0.5"/>
  <circle cx="215" cy="70" r="4" fill="#888" opacity="0.4"/>
  <circle cx="195" cy="65" r="3" fill="#999" opacity="0.5"/>
  <circle cx="210" cy="55" r="3" fill="#888" opacity="0.3"/>
  <path d="M250 96 Q230 85 210 80" stroke="#999" stroke-width="1.5" stroke-dasharray="4,3" fill="none"/>
  <text x="290" y="68" text-anchor="middle" font-size="11" fill="#8b4513">烟尘颗粒</text>
  <text x="90" y="60" text-anchor="end" font-size="11" fill="#302820">瓶壁已湿润</text>
  <line x1="85" y1="65" x2="100" y2="50" stroke="#6ba8d9" stroke-width="1"/>
</svg>`,
  },
  {
    title: '加压——压缩升温',
    content: '用手用力挤压瓶身（或扭转瓶身使其变形）。这一步增加了瓶内气压，空气被压缩后温度升高（绝热压缩），瓶内相对湿度降低，云消失。',
    highlight: '绝热压缩：PV = nRT，体积减小 → 温度升高 → 饱和水汽压升高 → 相对湿度下降。',
    illustration: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="30" width="70" height="150" rx="12" fill="rgba(200,220,240,0.5)" stroke="#9e2426" stroke-width="2.5"/>
  <line x1="150" y1="40" x2="150" y2="170" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <path d="M70 105 L105 105" stroke="#9e2426" stroke-width="3" marker-end="url(#arrowRight)"/>
  <path d="M220 105 L255 105" stroke="#9e2426" stroke-width="3" marker-end="url(#arrowLeft)"/>
  <defs>
    <marker id="arrowRight" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#9e2426"/>
    </marker>
    <marker id="arrowLeft" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto">
      <path d="M8,0 L0,4 L8,8 Z" fill="#9e2426"/>
    </marker>
  </defs>
  <text x="145" y="120" text-anchor="middle" font-size="16" fill="#9e2426" font-weight="700">压缩</text>
  <text x="145" y="140" text-anchor="middle" font-size="11" fill="#9e2426">V↓ T↑</text>
  <text x="88" y="130" text-anchor="middle" font-size="12" fill="#9e2426">挤压</text>
  <text x="238" y="130" text-anchor="middle" font-size="12" fill="#9e2426">挤压</text>
  <text x="200" y="200" text-anchor="middle" font-size="13" fill="#302820">加压→体积减小→温度升高→云消失</text>
</svg>`,
  },
  {
    title: '释压——膨胀降温，云形成',
    content: '快速松开手，让瓶子回弹。瓶内空气绝热膨胀，温度骤降，相对湿度迅速达到 100% 以上（过饱和），水汽在烟尘颗粒上凝结成微小水滴——可见的"云"出现了！',
    highlight: '绝热膨胀是大气中云形成的主要机制。空气上升 → 气压降低 → 膨胀冷却 → 水汽凝结 → 云。',
    illustration: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="90" y="30" width="110" height="150" rx="12" fill="rgba(200,220,240,0.5)" stroke="#3a8f5a" stroke-width="2.5"/>
  <path d="M60 105 L85 105" stroke="#3a8f5a" stroke-width="3" marker-end="url(#arrowOutLeft)"/>
  <path d="M230 105 L255 105" stroke="#3a8f5a" stroke-width="3" marker-end="url(#arrowOutRight)"/>
  <defs>
    <marker id="arrowOutLeft" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto">
      <path d="M8,0 L0,4 L8,8 Z" fill="#3a8f5a"/>
    </marker>
    <marker id="arrowOutRight" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#3a8f5a"/>
    </marker>
  </defs>
  <circle cx="120" cy="80" r="5" fill="rgba(255,255,255,0.9)" stroke="#b8d4e3" stroke-width="1"/>
  <circle cx="145" cy="65" r="6" fill="rgba(255,255,255,0.85)" stroke="#b8d4e3" stroke-width="1"/>
  <circle cx="155" cy="90" r="5" fill="rgba(255,255,255,0.9)" stroke="#b8d4e3" stroke-width="1"/>
  <circle cx="135" cy="95" r="7" fill="rgba(255,255,255,0.8)" stroke="#b8d4e3" stroke-width="1"/>
  <circle cx="165" cy="75" r="4" fill="rgba(255,255,255,0.85)" stroke="#b8d4e3" stroke-width="1"/>
  <circle cx="125" cy="55" r="5" fill="rgba(255,255,255,0.9)" stroke="#b8d4e3" stroke-width="1"/>
  <circle cx="150" cy="50" r="6" fill="rgba(255,255,255,0.8)" stroke="#b8d4e3" stroke-width="1"/>
  <circle cx="170" cy="60" r="4" fill="rgba(255,255,255,0.85)" stroke="#b8d4e3" stroke-width="1"/>
  <text x="145" y="120" text-anchor="middle" font-size="16" fill="#3a8f5a" font-weight="700">膨胀</text>
  <text x="145" y="140" text-anchor="middle" font-size="11" fill="#3a8f5a">V↑ T↓ RH↑</text>
  <text x="145" y="16" text-anchor="middle" font-size="12" fill="#3a8f5a" font-weight="700">☁ 云形成！</text>
  <text x="200" y="200" text-anchor="middle" font-size="13" fill="#302820">释压→膨胀冷却→过饱和→水汽凝结成云</text>
</svg>`,
  },
  {
    title: '重复观察',
    content: '反复挤压和释放几次，观察云的反复出现和消失。每次挤压（加压升温）时云消失，释放（减压降温）时云重新形成。这模拟了大气中空气上升降温成云的过程。',
    highlight: '在真实大气中，湿空气团上升时经历绝热膨胀冷却，当温度降到露点以下时，水汽在气溶胶颗粒上凝结，形成云。干绝热递减率约 10°C/km，湿绝热递减率约 6°C/km。',
    illustration: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="40" width="60" height="100" rx="10" fill="rgba(200,220,240,0.5)" stroke="#9e2426" stroke-width="2"/>
  <text x="60" y="95" text-anchor="middle" font-size="12" fill="#9e2426">压缩</text>
  <text x="60" y="112" text-anchor="middle" font-size="11" fill="#9e2426">无云</text>
  <path d="M95 90 L135 50" stroke="#9e2426" stroke-width="2" marker-end="url(#cycleArrow1)"/>
  <text x="115" y="65" font-size="10" fill="#9e2426">升温</text>
  <circle cx="160" cy="45" r="22" fill="rgba(200,220,240,0.6)" stroke="#3a8f5a" stroke-width="2"/>
  <circle cx="152" cy="42" r="5" fill="#fff" stroke="#b8d4e3" stroke-width="1"/>
  <circle cx="165" cy="38" r="6" fill="#fff" stroke="#b8d4e3" stroke-width="1"/>
  <circle cx="160" cy="50" r="4" fill="#fff" stroke="#b8d4e3" stroke-width="1"/>
  <text x="160" y="82" text-anchor="middle" font-size="11" fill="#3a8f5a">释压成云</text>
  <path d="M185 60 L230 100" stroke="#3a8f5a" stroke-width="2" marker-end="url(#cycleArrow2)"/>
  <text x="210" y="75" font-size="10" fill="#3a8f5a">降温</text>
  <rect x="240" y="80" width="60" height="100" rx="10" fill="rgba(200,220,240,0.5)" stroke="#3a8f5a" stroke-width="2"/>
  <circle cx="265" cy="110" r="5" fill="#fff" stroke="#b8d4e3" stroke-width="1"/>
  <circle cx="278" cy="105" r="6" fill="#fff" stroke="#b8d4e3" stroke-width="1"/>
  <circle cx="270" cy="120" r="4" fill="#fff" stroke="#b8d4e3" stroke-width="1"/>
  <text x="270" y="155" text-anchor="middle" font-size="11" fill="#3a8f5a">有云</text>
  <path d="M305 130 L340 90" stroke="#302820" stroke-width="2" marker-end="url(#cycleArrow3)"/>
  <text x="325" y="105" font-size="10" fill="#302820">循环</text>
  <defs>
    <marker id="cycleArrow1" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#9e2426"/>
    </marker>
    <marker id="cycleArrow2" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#3a8f5a"/>
    </marker>
    <marker id="cycleArrow3" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#302820"/>
    </marker>
  </defs>
  <text x="200" y="200" text-anchor="middle" font-size="13" fill="#302820">压缩升温 → 释压降温 → 循环成云</text>
</svg>`,
  },
]

export default { name: 'CloudBottle' }
</script>
