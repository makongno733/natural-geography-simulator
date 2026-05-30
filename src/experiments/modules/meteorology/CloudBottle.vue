<template></template>
<script>
const steps = [
  {
    title: '准备材料',
    content: '准备一个透明塑料瓶（带盖）、少量温水、一根火柴。实验在安全环境下进行，注意防火。',
    highlight: '温水提供水汽，火柴提供凝结核（烟尘颗粒）。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="140" y="20" width="70" height="130" rx="10" fill="rgba(180,210,240,0.3)" stroke="#8f7652" stroke-width="2"/>
  <rect x="145" y="15" width="60" height="12" rx="6" fill="#9e2426"/>
  <path d="M155 120 Q175 80 195 120" fill="none" stroke="#5ba0d0" stroke-width="2.5"/>
  <text x="175" y="135" text-anchor="middle" font-size="11" fill="#5ba0d0">温水</text>
  <rect x="270" y="100" width="60" height="6" rx="3" fill="#c8a06e"/>
  <circle cx="300" cy="95" r="8" fill="#f5a623"/>
  <path d="M300 87 Q305 78 308 87" stroke="#ff5722" stroke-width="2" fill="none"/>
  <path d="M295 84 Q290 76 286 83" stroke="#ff5722" stroke-width="1.5" fill="none"/>
  <text x="300" y="70" text-anchor="middle" font-size="11" fill="#ff5722">火柴</text>
  <text x="175" y="175" text-anchor="middle" font-size="13" fill="#302820">透明塑料瓶 + 温水 + 火柴</text>
</svg>`,
  },
  {
    title: '引入水汽和凝结核',
    content: '向瓶中倒入少量温水，轻轻摇晃使瓶壁湿润。点燃火柴，吹灭后迅速将带烟的火柴头伸入瓶中让烟尘进入，拧紧瓶盖。',
    highlight: '烟尘颗粒是云滴形成的必要条件——作为凝结核，水汽在其表面聚集。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="20" width="80" height="140" rx="10" fill="rgba(180,210,240,0.3)" stroke="#8f7652" stroke-width="2"/>
  <rect x="115" y="15" width="70" height="12" rx="6" fill="#9e2426"/>
  <path d="M125 130 Q150 80 175 130" fill="none" stroke="#5ba0d0" stroke-width="2"/>
  <circle cx="135" cy="70" r="2" fill="#888"/>
  <circle cx="155" cy="65" r="3" fill="#777"/>
  <circle cx="145" cy="55" r="2" fill="#888"/>
  <circle cx="160" cy="50" r="3" fill="#777"/>
  <circle cx="140" cy="42" r="2" fill="#888"/>
  <circle cx="155" cy="35" r="2" fill="#777"/>
  <circle cx="130" cy="75" r="2" fill="#888"/>
  <rect x="260" y="90" width="40" height="5" rx="2" fill="#c8a06e"/>
  <circle cx="280" cy="85" r="7" fill="#f5a623"/>
  <circle cx="274" cy="78" r="4" fill="#888" opacity="0.6"/>
  <circle cx="286" cy="74" r="5" fill="#999" opacity="0.5"/>
  <path d="M240 85 Q220 75 200 60" stroke="#999" stroke-width="1.5" stroke-dasharray="4,3" fill="none"/>
  <text x="275" y="65" text-anchor="middle" font-size="10" fill="#8b4513">烟尘</text>
  <text x="150" y="165" text-anchor="middle" font-size="11" fill="#888">瓶壁湿润</text>
  <text x="150" y="185" text-anchor="middle" font-size="13" fill="#302820">吹灭火柴→烟尘入瓶→拧紧瓶盖</text>
</svg>`,
  },
  {
    title: '加压——压缩升温',
    content: '用手用力挤压瓶身。瓶内气压增大，空气压缩后温度升高（绝热压缩），相对湿度降低，瓶中透明无云。',
    highlight: '绝热压缩：体积减小 → 温度升高 → 饱和水汽压升高 → 相对湿度下降。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="130" y="20" width="55" height="140" rx="8" fill="rgba(230,240,250,0.4)" stroke="#9e2426" stroke-width="2.5"/>
  <rect x="132" y="15" width="50" height="10" rx="5" fill="#9e2426"/>
  <path d="M60 90 L125 90" stroke="#9e2426" stroke-width="3"/>
  <polygon points="125,83 135,90 125,97" fill="#9e2426"/>
  <path d="M190 90 L255 90" stroke="#9e2426" stroke-width="3"/>
  <polygon points="255,83 265,90 255,97" fill="#9e2426"/>
  <text x="157" y="105" text-anchor="middle" font-size="14" fill="#9e2426" font-weight="700">压缩</text>
  <text x="157" y="125" text-anchor="middle" font-size="11" fill="#9e2426">体积↓ 温度↑</text>
  <text x="157" y="150" text-anchor="middle" font-size="11" fill="#888">瓶内清澈无云</text>
  <text x="200" y="185" text-anchor="middle" font-size="13" fill="#302820">挤压瓶身→体积减小→绝热升温→无云</text>
</svg>`,
  },
  {
    title: '释压——膨胀降温，云形成',
    content: '快速松开手让瓶子回弹。空气绝热膨胀温度骤降，相对湿度超过 100%，水汽在烟尘颗粒上凝结成微小水滴——瓶中出现了可见的"云"！',
    highlight: '绝热膨胀是大气成云的核心机制。空气上升→气压降低→膨胀冷却→水汽凝结→云。干绝热递减率约 10°C/km。',
    illustration: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="120" y="15" width="80" height="140" rx="10" fill="rgba(180,210,240,0.3)" stroke="#3a8f5a" stroke-width="2.5"/>
  <rect x="122" y="10" width="75" height="12" rx="6" fill="#3a8f5a"/>
  <path d="M65 85 L115 85" stroke="#3a8f5a" stroke-width="3"/>
  <polygon points="65,78 55,85 65,92" fill="#3a8f5a"/>
  <path d="M205 85 L255 85" stroke="#3a8f5a" stroke-width="3"/>
  <polygon points="205,78 195,85 205,92" fill="#3a8f5a"/>
  <circle cx="145" cy="85" r="12" fill="rgba(255,255,255,0.9)" stroke="#ccc" stroke-width="1"/>
  <circle cx="165" cy="80" r="15" fill="rgba(255,255,255,0.9)" stroke="#ccc" stroke-width="1"/>
  <circle cx="155" cy="72" r="10" fill="rgba(255,255,255,0.9)" stroke="#ccc" stroke-width="1"/>
  <circle cx="140" cy="70" r="8" fill="rgba(255,255,255,0.9)" stroke="#ccc" stroke-width="1"/>
  <circle cx="170" cy="70" r="7" fill="rgba(255,255,255,0.85)" stroke="#ccc" stroke-width="1"/>
  <circle cx="150" cy="60" r="6" fill="rgba(255,255,255,0.8)" stroke="#ccc" stroke-width="1"/>
  <text x="160" y="120" text-anchor="middle" font-size="14" fill="#3a8f5a" font-weight="700">云形成！</text>
  <text x="160" y="140" text-anchor="middle" font-size="11" fill="#3a8f5a">膨胀冷却→水汽凝结</text>
  <text x="200" y="190" text-anchor="middle" font-size="13" fill="#302820">释压→体积膨胀→绝热降温→过饱和→成云</text>
</svg>`,
  },
  {
    title: '重复观察与总结',
    content: '反复挤压释放几次，观察云的反复出现和消失。挤压（加压升温）时云消失，释放（减压降温）时云重新形成。真实大气中湿空气上升冷却成云，干绝热递减率约 10°C/km，湿绝热递减率约 6°C/km。',
    highlight: '云滴直径约 10-20 μm，一滴雨滴含约 100 万个云滴。水在大气中平均停留时间约 9 天。',
    illustration: `<svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="15" y="30" width="55" height="90" rx="8" fill="rgba(230,240,250,0.4)" stroke="#9e2426" stroke-width="2"/>
  <text x="42" y="80" text-anchor="middle" font-size="11" fill="#9e2426">压缩</text>
  <text x="42" y="98" text-anchor="middle" font-size="10" fill="#888">无云</text>
  <path d="M75 75 Q105 30 135 70" stroke="#9e2426" stroke-width="2" fill="none"/>
  <polygon points="135,63 142,70 135,77" fill="#9e2426"/>
  <text x="105" y="45" font-size="10" fill="#9e2426">升温</text>
  <circle cx="200" cy="70" r="30" fill="rgba(180,210,240,0.3)" stroke="#3a8f5a" stroke-width="2"/>
  <circle cx="185" cy="62" r="8" fill="rgba(255,255,255,0.9)" stroke="#ccc" stroke-width="1"/>
  <circle cx="205" cy="58" r="10" fill="rgba(255,255,255,0.9)" stroke="#ccc" stroke-width="1"/>
  <circle cx="195" cy="72" r="7" fill="rgba(255,255,255,0.85)" stroke="#ccc" stroke-width="1"/>
  <circle cx="215" cy="68" r="9" fill="rgba(255,255,255,0.9)" stroke="#ccc" stroke-width="1"/>
  <text x="200" y="115" text-anchor="middle" font-size="11" fill="#3a8f5a" font-weight="700">释压成云</text>
  <path d="M235 80 Q270 110 300 80" stroke="#3a8f5a" stroke-width="2" fill="none"/>
  <polygon points="300,73 307,80 300,87" fill="#3a8f5a"/>
  <text x="270" y="105" font-size="10" fill="#3a8f5a">降温</text>
  <rect x="315" y="40" width="55" height="90" rx="8" fill="rgba(180,210,240,0.3)" stroke="#3a8f5a" stroke-width="2"/>
  <circle cx="340" cy="70" r="6" fill="rgba(255,255,255,0.9)" stroke="#ccc" stroke-width="1"/>
  <circle cx="355" cy="65" r="7" fill="rgba(255,255,255,0.9)" stroke="#ccc" stroke-width="1"/>
  <text x="342" y="108" text-anchor="middle" font-size="10" fill="#3a8f5a">有云</text>
  <path d="M370 110 L390 140 L330 140 Z" fill="none" stroke="#302820" stroke-width="1.5" stroke-dasharray="4,2"/>
  <text x="360" y="155" text-anchor="middle" font-size="10" fill="#302820">循环</text>
  <text x="200" y="170" text-anchor="middle" font-size="13" fill="#302820">压缩升温无云 ↔ 释压降温成云</text>
</svg>`,
  },
]

export default { name: "CloudBottle", steps }
</script>
