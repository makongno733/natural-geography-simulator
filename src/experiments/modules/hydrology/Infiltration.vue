<template></template>
<script>
export const steps = [
  {
    title: '准备实验材料',
    content: '准备 3 个浅盘（或切开的塑料瓶底部），分别装入：干燥沙土、普通园土、种草皮的有植被土。每个盘下方放一个收集容器。准备一个洒水壶模拟降雨。',
    highlight: '三个盘的表面积和土层厚度应尽量一致，以控制变量。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="80" width="90" height="50" rx="4" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <rect x="25" y="85" width="80" height="20" fill="#e8d5a0" rx="2"/>
  <text x="65" y="98" text-anchor="middle" font-size="10" fill="#302820">沙土</text>
  <rect x="65" y="60" width="8" height="18" fill="#d4a76a" rx="1"/>
  <text x="65" y="142" text-anchor="middle" font-size="10" fill="#302820">沙土盘</text>
  <rect x="145" y="80" width="90" height="50" rx="4" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <rect x="150" y="85" width="80" height="20" fill="#8b6914" rx="2"/>
  <text x="190" y="98" text-anchor="middle" font-size="10" fill="#fff">园土</text>
  <rect x="190" y="60" width="8" height="18" fill="#d4a76a" rx="1"/>
  <text x="190" y="142" text-anchor="middle" font-size="10" fill="#302820">园土盘</text>
  <rect x="270" y="80" width="90" height="50" rx="4" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <rect x="275" y="85" width="80" height="20" fill="#4a7c3f" rx="2"/>
  <path d="M285 85 L285 75 M295 85 L295 78 M305 85 L305 75 M315 85 L315 78 M325 85 L325 76" stroke="#3a6b2f" stroke-width="1.5"/>
  <circle cx="290" cy="76" r="2" fill="#5a9c4f"/>
  <circle cx="310" cy="76" r="2" fill="#5a9c4f"/>
  <circle cx="330" cy="77" r="2" fill="#5a9c4f"/>
  <rect x="315" y="60" width="8" height="18" fill="#d4a76a" rx="1"/>
  <text x="315" y="142" text-anchor="middle" font-size="10" fill="#302820">草皮盘</text>
  <text x="200" y="180" text-anchor="middle" font-size="14" fill="#302820" font-weight="700">三盘土壤对比：沙土、园土、草皮（有植被）</text>
</svg>`,
  },
  {
    title: '模拟降雨',
    content: '用洒水壶从相同高度、以相同速率向三个盘均匀洒水（模拟等量降雨）。观察水在三个盘表面的行为：沙土盘水迅速下渗，园土盘部分下渗部分形成水洼，草皮盘水被植被拦截缓慢下渗。',
    highlight: '下渗速率取决于土壤孔隙度、有机质含量和植被根系通道。沙土孔隙大但持水性差，黏土孔隙小但持水性强。',
    illustration: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="15" width="180" height="25" rx="6" fill="#6ba8d9" opacity="0.5" stroke="#4a8ab5" stroke-width="1"/>
  <text x="200" y="32" text-anchor="middle" font-size="10" fill="#fff">洒水壶</text>
  <line x1="130" y1="40" x2="80" y2="70" stroke="#6ba8d9" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="160" y1="40" x2="150" y2="70" stroke="#6ba8d9" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="190" y1="40" x2="190" y2="70" stroke="#6ba8d9" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="220" y1="40" x2="230" y2="70" stroke="#6ba8d9" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="250" y1="40" x2="280" y2="70" stroke="#6ba8d9" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="270" y1="40" x2="320" y2="70" stroke="#6ba8d9" stroke-width="1" stroke-dasharray="3,3"/>
  <rect x="30" y="70" width="90" height="40" rx="4" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <rect x="35" y="72" width="80" height="14" fill="#e8d5a0" rx="2"/>
  <text x="75" y="83" text-anchor="middle" font-size="9" fill="#302820">沙土</text>
  <path d="M60 86 L55 100 M75 86 L75 100 M90 86 L95 100" stroke="#6ba8d9" stroke-width="1.5"/>
  <text x="75" y="120" text-anchor="middle" font-size="9" fill="#3a8f5a">快速下渗</text>
  <rect x="155" y="70" width="90" height="40" rx="4" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <rect x="160" y="72" width="80" height="14" fill="#8b6914" rx="2"/>
  <text x="200" y="83" text-anchor="middle" font-size="9" fill="#fff">园土</text>
  <ellipse cx="200" cy="90" rx="25" ry="5" fill="#6ba8d9" opacity="0.5"/>
  <path d="M190 90 L185 100 M200 90 L200 100 M210 90 L215 100" stroke="#6ba8d9" stroke-width="1.5"/>
  <text x="200" y="120" text-anchor="middle" font-size="9" fill="#f5a623">部分水洼</text>
  <rect x="280" y="70" width="90" height="40" rx="4" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <rect x="285" y="72" width="80" height="14" fill="#4a7c3f" rx="2"/>
  <path d="M295 72 L295 64 M305 72 L305 66 M315 72 L315 64 M325 72 L325 67" stroke="#3a6b2f" stroke-width="1.5"/>
  <ellipse cx="325" cy="88" rx="15" ry="4" fill="#6ba8d9" opacity="0.3"/>
  <text x="325" y="120" text-anchor="middle" font-size="9" fill="#6ba8d9">拦截慢渗</text>
  <text x="200" y="215" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">等量洒水 → 不同下渗行为</text>
</svg>`,
  },
  {
    title: '测量径流与下渗量',
    content: '收集每个盘下方的渗透水和表面的径流水，用量筒测量体积。计算：径流系数 = 径流量 / 总降雨量。典型结果：裸土径流系数 0.5-0.7，草地 0.1-0.3，沙土接近 0。',
    highlight: '植被覆盖是最有效的水土保持措施——根系增加土壤孔隙度，茎叶截留降雨、减缓雨滴动能。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="100" width="30" height="60" rx="3" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1"/>
  <rect x="22" y="130" width="26" height="28" fill="#6ba8d9" opacity="0.6"/>
  <text x="35" y="180" text-anchor="middle" font-size="9" fill="#302820">沙土</text>
  <text x="35" y="190" text-anchor="middle" font-size="8" fill="#3a8f5a">径流≈0</text>
  <rect x="100" y="90" width="35" height="70" rx="3" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1"/>
  <rect x="102" y="100" width="31" height="25" fill="#6ba8d9" opacity="0.6"/>
  <rect x="102" y="128" width="31" height="30" fill="#6ba8d9" opacity="0.3"/>
  <text x="117" y="180" text-anchor="middle" font-size="9" fill="#302820">园土</text>
  <text x="117" y="190" text-anchor="middle" font-size="8" fill="#f5a623">径流≈0.5</text>
  <rect x="180" y="100" width="35" height="60" rx="3" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1"/>
  <rect x="182" y="145" width="31" height="13" fill="#6ba8d9" opacity="0.6"/>
  <rect x="182" y="105" width="31" height="38" fill="#6ba8d9" opacity="0.3"/>
  <text x="197" y="180" text-anchor="middle" font-size="9" fill="#302820">草皮</text>
  <text x="197" y="190" text-anchor="middle" font-size="8" fill="#6ba8d9">径流≈0.2</text>
  <text x="35" y="90" text-anchor="middle" font-size="10" fill="#302820">下渗水</text>
  <text x="117" y="80" text-anchor="middle" font-size="10" fill="#302820">径流水</text>
  <text x="197" y="95" text-anchor="middle" font-size="10" fill="#302820">径流+下渗</text>
  <text x="120" y="30" text-anchor="middle" font-size="14" fill="#302820" font-weight="700">径流系数 = 径流量 / 总降雨量</text>
  <text x="120" y="48" text-anchor="middle" font-size="11" fill="#302820">裸土 0.5-0.7  |  草地 0.1-0.3  |  沙土 ≈ 0</text>
</svg>`,
  },
  {
    title: '坡度对比（可选扩展）',
    content: '将园土盘分别倾斜不同角度（5°、15°、30°），重复降雨。坡度越大，地表径流越多、下渗越少。这也解释了为什么陡坡山地更容易发生水土流失和山洪。',
    highlight: '坡度每增加 10°，径流系数约增加 0.1-0.15。梯田是坡地农业中减少水土流失的有效工程措施。',
    illustration: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="120" width="90" height="40" rx="3" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5" transform="rotate(-5, 65, 140)"/>
  <text x="65" y="185" text-anchor="middle" font-size="11" fill="#302820">5° 缓坡</text>
  <text x="65" y="197" text-anchor="middle" font-size="9" fill="#3a8f5a">径流少</text>
  <rect x="155" y="120" width="90" height="40" rx="3" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5" transform="rotate(-15, 200, 140)"/>
  <text x="200" y="185" text-anchor="middle" font-size="11" fill="#302820">15° 中坡</text>
  <text x="200" y="197" text-anchor="middle" font-size="9" fill="#f5a623">径流中等</text>
  <rect x="290" y="120" width="90" height="40" rx="3" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5" transform="rotate(-30, 335, 140)"/>
  <text x="335" y="185" text-anchor="middle" font-size="11" fill="#302820">30° 陡坡</text>
  <text x="335" y="197" text-anchor="middle" font-size="9" fill="#9e2426">径流多</text>
  <path d="M80 130 L120 100" stroke="#6ba8d9" stroke-width="1.5" marker-end="url(#arrowSlope)"/>
  <path d="M220 130 L260 90" stroke="#6ba8d9" stroke-width="2.5" marker-end="url(#arrowSlope)"/>
  <path d="M350 130 L390 80" stroke="#6ba8d9" stroke-width="3.5" marker-end="url(#arrowSlope)"/>
  <defs>
    <marker id="arrowSlope" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#6ba8d9"/>
    </marker>
  </defs>
  <text x="200" y="60" text-anchor="middle" font-size="13" fill="#302820" font-weight="700">坡度越大 → 径流越多 → 水土流失越严重</text>
</svg>`,
  },
]
export default { name: 'Infiltration' }
</script>
