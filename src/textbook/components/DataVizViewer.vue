<template>
  <div class="dv-shell">
    <div class="dv-top">
      <h2>{{ title }}</h2>
      <button class="dv-close" @click="$emit('close')">✕ 关闭</button>
    </div>
    <div class="dv-body">
      <!-- Population Pyramid -->
      <svg v-if="type==='pyramid'" viewBox="0 0 600 400" class="dv-svg">
        <line x1="300" y1="30" x2="300" y2="370" stroke="#aaa" stroke-width="1"/>
        <text v-for="(l,i) in ['90+','80-84','70-74','60-64','50-54','40-44','30-34','20-24','10-14','0-4']" :key="i"
          :x="300" :y="60+i*32" text-anchor="middle" fill="#888" font-size="10">{{ l }}</text>
        <rect v-for="(d,i) in pyramidData" :key="'m'+i"
          :x="300-d.male*2" :y="45+i*32" :width="d.male*2" :height="28" fill="#4488cc" opacity=".7" rx="2"/>
        <rect v-for="(d,i) in pyramidData" :key="'f'+i"
          :x="300" :y="45+i*32" :width="d.female*2" :height="28" fill="#cc4488" opacity=".7" rx="2"/>
        <text x="120" y="390" text-anchor="middle" fill="#4488cc" font-size="12" font-weight="700">男</text>
        <text x="480" y="390" text-anchor="middle" fill="#cc4488" font-size="12" font-weight="700">女</text>
        <text :x="300-d.male*2-8" :y="59" fill="#4488cc" font-size="9" text-anchor="end" v-for="(d,i) in pyramidData" :key="'ml'+i">{{ d.male }}</text>
        <text :x="300+d.female*2+8" :y="59" fill="#cc4488" font-size="9" v-for="(d,i) in pyramidData" :key="'fl'+i">{{ d.female }}</text>
      </svg>

      <!-- Urbanization S-Curve -->
      <svg v-else-if="type==='urban'" viewBox="0 0 600 380" class="dv-svg">
        <line x1="50" y1="330" x2="550" y2="330" stroke="#aaa" stroke-width="1"/>
        <line x1="50" y1="330" x2="50" y2="30" stroke="#aaa" stroke-width="1"/>
        <text x="300" y="360" text-anchor="middle" fill="#888" font-size="11">时间 →</text>
        <text x="20" y="180" text-anchor="middle" fill="#888" font-size="11" transform="rotate(-90,20,180)">城镇化率 %</text>
        <!-- Y axis labels -->
        <text v-for="v in [0,20,40,60,80,100]" :key="v" :x="45" :y="330-v*3" text-anchor="end" fill="#888" font-size="9">{{ v }}</text>
        <line v-for="v in [0,20,40,60,80,100]" :key="'h'+v" :x1="50" :y1="330-v*3" :x2="550" :y2="330-v*3" stroke="#444" stroke-width=".5" stroke-dasharray="4,4"/>
        <!-- S-curve path -->
        <path :d="urbanCurve" fill="none" stroke="#3b82f6" stroke-width="2.5"/>
        <!-- Phase labels -->
        <text x="140" y="280" fill="#f59e0b" font-size="10" font-weight="600">初期</text>
        <text x="300" y="140" fill="#ef4444" font-size="10" font-weight="600">加速期</text>
        <text x="460" y="80" fill="#10b981" font-size="10" font-weight="600">成熟期</text>
        <!-- Data points -->
        <circle v-for="(d,i) in urbanData" :key="i" :cx="d.x" :cy="d.y" r="3" fill="#3b82f6"/>
        <text v-for="(d,i) in urbanData" :key="'l'+i" :x="d.x+6" :y="d.y-6" fill="#aaa" font-size="9">{{ d.label }}</text>
      </svg>

      <!-- Weber Location Triangle -->
      <svg v-else-if="type==='triangle'" viewBox="0 0 500 420" class="dv-svg">
        <polygon points="250,30 30,380 470,380" fill="none" stroke="#aaa" stroke-width="1"/>
        <!-- Vertices -->
        <circle cx="250" cy="30" r="6" fill="#ef4444"/>
        <text x="250" y="18" text-anchor="middle" fill="#ef4444" font-size="12" font-weight="700">原料地 M</text>
        <circle cx="30" cy="380" r="6" fill="#3b82f6"/>
        <text x="10" y="398" fill="#3b82f6" font-size="12" font-weight="700">市场 C</text>
        <circle cx="470" cy="380" r="6" fill="#10b981"/>
        <text x="460" y="398" fill="#10b981" font-size="12" font-weight="700">劳动力 L</text>
        <!-- Optimal point -->
        <circle cx="220" cy="280" r="5" fill="#f59e0b"/>
        <text x="220" y="270" text-anchor="middle" fill="#f59e0b" font-size="11" font-weight="700">最优区位</text>
        <!-- Isodapanes -->
        <path d="M220,280 Q230,240 260,250 Q280,260 270,290 Q250,310 220,280" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3" opacity=".5"/>
        <path d="M220,280 Q210,230 250,230 Q290,240 300,280 Q280,320 220,280" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3" opacity=".3"/>
        <text x="250" y="420" text-anchor="middle" fill="#888" font-size="11">韦伯工业区位三角形</text>
      </svg>

      <!-- Hub-Spoke Transport -->
      <svg v-else-if="type==='transport'" viewBox="0 0 500 400" class="dv-svg">
        <!-- Hub city -->
        <circle cx="250" cy="200" r="12" fill="#3b82f6"/>
        <text x="250" y="230" text-anchor="middle" fill="#3b82f6" font-size="12" font-weight="700">枢纽城市</text>
        <!-- Spoke cities -->
        <g v-for="(city,i) in spokeCities" :key="i">
          <line :x1="250" :y1="200" :x2="city.x" :y2="city.y" stroke="#888" stroke-width="1" stroke-dasharray="4,2" opacity=".5"/>
          <line :x1="250" :y1="200" :x2="city.x" :y2="city.y" stroke="#3b82f6" stroke-width="2" opacity=".3"/>
          <circle :cx="city.x" :cy="city.y" r="6" fill="#f59e0b"/>
          <text :x="city.x" :y="city.y-10" text-anchor="middle" fill="#ddd" font-size="10">{{ city.name }}</text>
          <text :x="(250+city.x)/2" :y="(200+city.y)/2-5" fill="#888" font-size="8">{{ city.dist }}</text>
        </g>
        <!-- Flow direction arrows -->
        <text x="100" y="390" fill="#888" font-size="10">← 辐合(原料/劳动力) · 辐散(产品/服务) →</text>
      </svg>

      <!-- Sustainability 3-Pillar -->
      <svg v-else-if="type==='sustain'" viewBox="0 0 500 420" class="dv-svg">
        <circle cx="250" cy="210" r="140" fill="none" stroke="#aaa" stroke-width="1" stroke-dasharray="5,5"/>
        <!-- Three overlapping circles -->
        <circle cx="180" cy="170" r="80" fill="#3b82f6" opacity=".15" stroke="#3b82f6" stroke-width="1"/>
        <text x="140" y="130" fill="#3b82f6" font-size="12" font-weight="700">经济</text>
        <circle cx="320" cy="170" r="80" fill="#10b981" opacity=".15" stroke="#10b981" stroke-width="1"/>
        <text x="370" y="130" fill="#10b981" font-size="12" font-weight="700">社会</text>
        <circle cx="250" cy="270" r="80" fill="#8b5cf6" opacity=".15" stroke="#8b5cf6" stroke-width="1"/>
        <text x="250" y="370" text-anchor="middle" fill="#8b5cf6" font-size="12" font-weight="700">生态</text>
        <!-- Center label -->
        <circle cx="250" cy="210" r="30" fill="#f59e0b" opacity=".3"/>
        <text x="250" y="200" text-anchor="middle" fill="#f59e0b" font-size="10" font-weight="700">可持续</text>
        <text x="250" y="215" text-anchor="middle" fill="#f59e0b" font-size="10" font-weight="700">发展</text>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, required: true },
  title: { type: String, default: '数据可视化' },
})
defineEmits(['close'])

const pyramidData = [
  { male:95, female:93 },{ male:98, female:96 },{ male:100, female:98 },
  { male:102, female:100 },{ male:95, female:93 },{ male:85, female:82 },
  { male:72, female:70 },{ male:55, female:58 },{ male:35, female:45 },
  { male:15, female:25 },
]

const urbanData = [
  { x:80, y:310, label:'清朝 5%' },{ x:180, y:295, label:'1949 10%' },
  { x:280, y:260, label:'1980 19%' },{ x:350, y:210, label:'2000 36%' },
  { x:420, y:150, label:'2011 50%' },{ x:480, y:100, label:'2023 66%' },
  { x:530, y:70, label:'2050 75%' },
]

const urbanCurve = computed(() => {
  const pts = urbanData.map(d => `${d.x},${d.y}`).join(' ')
  return `M${pts}`
})

const spokeCities = [
  { name:'北京', x:250, y:60, dist:'1200km' },{ name:'上海', x:400, y:160, dist:'800km' },
  { name:'广州', x:350, y:320, dist:'1600km' },{ name:'成都', x:100, y:280, dist:'1500km' },
  { name:'西安', x:140, y:150, dist:'900km' },{ name:'武汉', x:280, y:240, dist:'600km' },
]
</script>

<style scoped>
.dv-shell { max-width: 680px; margin: 16px auto; border: 1px solid #e2c9b4; border-radius: 10px; background: #fff; overflow: hidden; }
.dv-top { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid #eee; }
.dv-top h2 { margin: 0; font-size: 16px; color: #333; }
.dv-close { border: 1px solid #ddd; border-radius: 4px; padding: 4px 12px; background: #f5f5f5; font-size: 12px; cursor: pointer; }
.dv-body { padding: 16px; background: #fafafa; }
.dv-svg { width: 100%; display: block; }
</style>
