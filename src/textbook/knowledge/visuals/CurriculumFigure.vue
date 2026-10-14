<template>
  <figure class="curriculum-figure">
    <figcaption><span class="figure-kicker">原创地理图解 · {{ figure.id }}</span><strong>{{ figure.title }}</strong></figcaption>
    <svg viewBox="0 0 640 226" role="img" :aria-label="`${figure.title}：${figure.labels.join('、')}。${figure.note || '概念示意。'}`">
      <defs>
        <marker :id="arrowId" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M1 1 L8 4.5 L1 8" fill="none" stroke="#235b56" stroke-width="1.6" /></marker>
        <linearGradient :id="washId" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5f2e9" /><stop offset="1" stop-color="#d5eaf0" /></linearGradient>
      </defs>
      <rect x="0" y="0" width="640" height="226" rx="14" fill="#f6f8f2" />
      <g v-if="figure.kind === 'season'">
        <ellipse cx="320" cy="112" rx="185" ry="71" fill="none" stroke="#9baea4" stroke-width="2" stroke-dasharray="6 5" />
        <circle cx="320" cy="112" r="24" fill="#e3ad4a" /><text x="320" y="117" text-anchor="middle" class="diagram-label small">太阳</text>
        <g v-for="(item, i) in seasonPositions" :key="item.label">
          <circle :cx="item.x" :cy="item.y" r="15" fill="#5998a6" />
          <path :d="`M${item.x - 11} ${item.y + 23} L${item.x + 11} ${item.y - 23}`" stroke="#234f55" stroke-width="3" />
          <text :x="item.x" :y="item.textY" text-anchor="middle" class="diagram-label small">{{ item.label }}</text>
        </g>
        <text x="32" y="200" class="diagram-label small">地轴倾斜且方向近似不变 → 直射点南北移动</text>
      </g>
      <g v-else-if="figure.kind === 'bid-rent'">
        <path d="M82 25 V178 H558" fill="none" stroke="#4b6b64" stroke-width="2" /><text x="88" y="21" class="diagram-label small">付租能力</text><text x="438" y="200" class="diagram-label small">距中心距离 →</text>
        <path d="M90 35 C170 95 255 144 535 170" fill="none" stroke="#2d7765" stroke-width="4" /><text x="150" y="54" class="diagram-label small">商业</text>
        <path d="M90 77 C225 90 365 140 535 167" fill="none" stroke="#d2954d" stroke-width="4" /><text x="273" y="103" class="diagram-label small">居住</text>
        <path d="M90 129 C250 132 397 148 535 164" fill="none" stroke="#4e8da4" stroke-width="4" /><text x="426" y="143" class="diagram-label small">工业</text>
      </g>
      <g v-else-if="figure.kind === 'karst'">
        <path d="M30 84 Q110 75 175 91 Q205 65 260 87 Q333 76 390 90 Q475 68 610 87 L610 199 H30 Z" fill="#d8e6d0" stroke="#668866" stroke-width="3" />
        <path d="M110 90 L120 129 M260 86 L277 151 M478 84 L465 143" stroke="#547978" stroke-width="3" stroke-dasharray="5 4" />
        <ellipse cx="311" cy="150" rx="100" ry="29" fill="#f6f8f2" stroke="#8d9b76" stroke-width="4" /><path d="M230 170 Q315 159 391 170" fill="none" stroke="#4e8da4" stroke-width="9" />
        <text x="42" y="39" class="diagram-label small">石灰岩地表</text><text x="93" y="123" class="diagram-label small">裂隙下渗</text><text x="280" y="145" class="diagram-label small">溶洞</text><text x="395" y="189" class="diagram-label small">地下河</text>
      </g>
      <g v-else-if="figure.kind === 'fold'">
        <path d="M25 123 Q135 35 242 122 Q330 194 425 121 Q520 47 615 122" fill="none" stroke="#8f9f7c" stroke-width="16" /><path d="M25 151 Q135 63 242 150 Q330 222 425 149 Q520 75 615 150" fill="none" stroke="#a98967" stroke-width="16" />
        <path d="M25 86 Q130 116 242 84 Q330 89 425 85 Q520 116 615 85" fill="none" stroke="#4d7c65" stroke-width="3" />
        <text x="106" y="34" class="diagram-label small">背斜</text><text x="306" y="195" class="diagram-label small">向斜</text><text x="434" y="35" class="diagram-label small">差异侵蚀后的地表</text>
      </g>
      <g v-else-if="figure.kind === 'zones'">
        <path d="M52 52 H582" stroke="#4e8da4" stroke-width="2" /><path d="M145 38 V190" stroke="#7897a1" stroke-width="2" stroke-dasharray="5 4" /><text x="90" y="38" class="diagram-label small">基线</text>
        <rect x="55" y="65" width="85" height="23" fill="#dce7d5" /><text x="68" y="82" class="diagram-label small">内水</text>
        <rect x="145" y="65" width="100" height="23" fill="#c5e0e7" /><text x="166" y="82" class="diagram-label small">领海</text>
        <rect x="245" y="65" width="100" height="23" fill="#cde7eb" /><text x="256" y="82" class="diagram-label small">毗连区</text>
        <rect x="245" y="99" width="320" height="23" fill="#d8e9d5" /><text x="290" y="116" class="diagram-label small">专属经济区与毗连区有重叠</text>
        <rect x="145" y="138" width="420" height="23" fill="#eadfcf" /><text x="228" y="155" class="diagram-label small">大陆架：海床与底土的权利另行判断</text>
        <text x="50" y="200" class="diagram-label small">带宽仅为概念示意，不代表实际海里数或边界</text>
      </g>
      <g v-else-if="figure.kind === 'water-cycle'">
        <path d="M111 107 H224 M310 107 H465" stroke="#50847d" stroke-width="3" :marker-end="`url(#${arrowId})`" />
        <path d="M518 130 Q518 168 429 170 M518 130 Q515 205 285 194" fill="none" stroke="#50847d" stroke-width="3" :marker-end="`url(#${arrowId})`" />
        <circle cx="78" cy="107" r="32" fill="#d2954d" /><circle cx="277" cy="107" r="32" fill="#4e8da4" /><circle cx="518" cy="107" r="32" fill="#2d7765" />
        <text x="78" y="159" text-anchor="middle" class="diagram-label small">蒸发</text><text x="277" y="159" text-anchor="middle" class="diagram-label small">水汽输送</text><text x="518" y="159" text-anchor="middle" class="diagram-label small">降水</text>
        <text x="353" y="176" class="diagram-label small">地表径流</text><text x="205" y="207" class="diagram-label small">下渗</text>
      </g>
      <g v-else-if="figure.kind === 'nested'">
        <circle v-for="(label, i) in figure.labels" :key="label" cx="222" cy="112" :r="22 + (figure.labels.length - 1 - i) * 27" fill="none" :stroke="colors[i % colors.length]" stroke-width="11" opacity=".83" />
        <text v-for="(label, i) in figure.labels" :key="`text-${label}`" x="390" :y="46 + i * 44" class="diagram-label"><tspan :fill="colors[i % colors.length]">●</tspan> {{ label }}</text>
      </g>
      <g v-else-if="figure.kind === 'orbit'">
        <ellipse v-for="(_, i) in figure.labels.slice(1, 5)" :key="i" cx="310" cy="111" :rx="65 + i * 47" :ry="24 + i * 20" fill="none" :stroke="colors[i % colors.length]" stroke-width="2" stroke-dasharray="5 5" />
        <circle cx="310" cy="111" r="24" fill="#e3ad4a" /><text x="310" y="116" text-anchor="middle" class="diagram-label small">{{ figure.labels[0] }}</text>
        <g v-for="(label, i) in figure.labels.slice(1, 5)" :key="label"><circle :cx="375 + i * 47" cy="111" r="6" :fill="colors[i % colors.length]" /><text :x="374 + i * 47" :y="97 - i * 9" text-anchor="middle" class="diagram-label small">{{ label }}</text></g>
      </g>
      <g v-else-if="figure.kind === 'layers'">
        <g v-for="(label, i) in figure.labels" :key="label"><rect x="75" :y="23 + i * (180 / figure.labels.length)" width="490" :height="177 / figure.labels.length" rx="3" :fill="colors[i % colors.length]" opacity=".18" /><line x1="75" :y1="23 + i * (180 / figure.labels.length)" x2="565" :y2="23 + i * (180 / figure.labels.length)" :stroke="colors[i % colors.length]" stroke-width="2" /><text x="95" :y="46 + i * (180 / figure.labels.length)" class="diagram-label">{{ label }}</text></g>
      </g>
      <g v-else-if="figure.kind === 'cycle'">
        <g v-for="(label, i) in figure.labels" :key="label"><line :x1="cycleX(i)" :y1="cycleY(i)" :x2="cycleX((i + 1) % figure.labels.length)" :y2="cycleY((i + 1) % figure.labels.length)" stroke="#50847d" stroke-width="2" :marker-end="`url(#${arrowId})`" /><circle :cx="cycleX(i)" :cy="cycleY(i)" r="27" :fill="colors[i % colors.length]" /><text :x="cycleX(i)" :y="cycleY(i) + 39" text-anchor="middle" class="diagram-label small">{{ label }}</text></g>
      </g>
      <g v-else-if="figure.kind === 'curve' || figure.kind === 's-curve'">
        <path d="M90 25 V178 H555" fill="none" stroke="#4b6b64" stroke-width="2" />
        <path :d="figure.kind === 's-curve' ? 'M104 165 C225 164 225 145 300 93 S390 40 544 39' : 'M104 42 C225 57 340 118 544 167'" fill="none" stroke="#247b72" stroke-width="5" />
        <circle v-for="(label, i) in figure.labels.slice(0, 3)" :key="label" :cx="125 + i * 190" :cy="figure.kind === 's-curve' ? [164, 92, 40][i] : [47, 104, 163][i]" r="7" fill="#e8a957" />
        <text v-for="(label, i) in figure.labels.slice(0, 3)" :key="`label-${label}`" :x="125 + i * 190" y="206" text-anchor="middle" class="diagram-label small">{{ label }}</text>
      </g>
      <g v-else-if="figure.kind === 'profile'">
        <path d="M25 102 Q80 80 130 111 Q188 146 240 105 Q292 45 355 82 Q435 123 500 95 Q563 72 615 105 L615 198 L25 198 Z" fill="#d8e6d0" stroke="#668866" stroke-width="3" />
        <path d="M25 139 Q85 121 130 151 Q200 182 240 141 Q302 77 355 120 Q435 159 500 134 Q566 102 615 142" fill="none" stroke="#a98967" stroke-width="10" opacity=".65" />
        <text v-for="(label, i) in figure.labels" :key="label" :x="40 + i * (560 / figure.labels.length)" :y="30 + (i % 2) * 25" class="diagram-label small">{{ label }}</text>
      </g>
      <g v-else-if="figure.kind === 'comparison'">
        <g v-for="(label, i) in figure.labels" :key="label" :transform="`translate(${35 + (i % 3) * 204},${23 + Math.floor(i / 3) * 98})`"><rect width="185" height="78" rx="8" :fill="`url(#${washId})`" :stroke="colors[i % colors.length]" stroke-width="2" /><circle cx="24" cy="23" r="8" :fill="colors[i % colors.length]" /><text x="18" y="54" class="diagram-label small">{{ label }}</text></g>
      </g>
      <g v-else>
        <g v-for="(label, i) in figure.labels" :key="label"><line v-if="i < figure.labels.length - 1" :x1="flowX(i) + 42" y1="108" :x2="flowX(i + 1) - 42" y2="108" stroke="#50847d" stroke-width="2" :marker-end="`url(#${arrowId})`" /><circle :cx="flowX(i)" cy="108" r="36" :fill="colors[i % colors.length]" opacity=".82" /><text :x="flowX(i)" y="171" text-anchor="middle" class="diagram-label small">{{ label }}</text></g>
      </g>
    </svg>
    <p>{{ figure.note || '概念示意，非实测数据或比例图。' }}</p>
  </figure>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ figure: { type: Object, required: true } })
const colors = ['#2d7765', '#d2954d', '#4e8da4', '#a77d6b', '#7d8e5c']
const arrowId = computed(() => `arrow-${props.figure.id}`)
const washId = computed(() => `wash-${props.figure.id}`)
const seasonPositions = [
  { label: '春分', x: 320, y: 41, textY: 20 },
  { label: '夏至', x: 135, y: 112, textY: 155 },
  { label: '秋分', x: 320, y: 183, textY: 217 },
  { label: '冬至', x: 505, y: 112, textY: 155 },
]
const flowX = (i) => 80 + i * (480 / Math.max(props.figure.labels.length - 1, 1))
const cycleX = (i) => 320 + 180 * Math.cos((i / props.figure.labels.length) * Math.PI * 2 - Math.PI / 2)
const cycleY = (i) => 112 + 67 * Math.sin((i / props.figure.labels.length) * Math.PI * 2 - Math.PI / 2)
</script>

<style scoped>
.curriculum-figure{margin:20px 0;border:1px solid #d2e0d6;background:#fff;padding:16px}
.curriculum-figure figcaption{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:10px;color:#1b4438}
.figure-kicker{font-size:11px;letter-spacing:.06em;color:#678075}.curriculum-figure strong{font-size:16px}
.curriculum-figure svg{display:block;width:100%;height:auto;border-radius:8px}
.diagram-label{font-family:system-ui,sans-serif;font-size:15px;font-weight:700;fill:#214d44}.diagram-label.small{font-size:12px}
.curriculum-figure p{font-size:12px;line-height:1.6;color:#65766a;margin:8px 0 0}
</style>
