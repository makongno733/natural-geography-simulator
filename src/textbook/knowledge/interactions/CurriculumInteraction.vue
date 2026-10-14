<template>
  <details class="curriculum-interaction">
    <summary><span>课堂推演 · {{ interaction.id }}</span><strong>{{ interaction.title }}</strong><span aria-hidden="true">↗</span></summary>
    <div class="interaction-content">
      <label :for="pickerId">{{ interaction.control }}</label>
      <select :id="pickerId" v-model.number="selectedIndex">
        <option v-for="(choice, index) in interaction.choices" :key="choice.label" :value="index">{{ choice.label }}</option>
      </select>
      <div class="reasoning" aria-live="polite">
        <div class="reasoning-step"><small>条件</small><strong>{{ choice.label }}</strong></div>
        <span class="arrow" aria-hidden="true">→</span>
        <div class="reasoning-step"><small>作用机制</small><strong>{{ choice.cause }}</strong></div>
        <span class="arrow" aria-hidden="true">→</span>
        <div class="reasoning-step"><small>可观察的趋势</small><strong>{{ choice.result }}</strong></div>
      </div>
      <div v-if="interaction.id === 'MOD-INT-002'" class="calculation">
        <label :for="`height-${interaction.id}`">假设建筑高度 {{ buildingHeight }} 米</label>
        <input :id="`height-${interaction.id}`" v-model.number="buildingHeight" type="range" min="10" max="100" step="5" />
        <p>理想水平地面上，正午影长约 <strong>{{ computedShadow?.toFixed(1) }} 米</strong>。</p>
        <small>计算：影长 = 建筑高度 ÷ tan（所选太阳高度）。这不是合规楼间距。</small>
      </div>
      <div v-if="interaction.id === 'MOD-INT-020'" class="calculation">
        <label :for="`efficiency-${interaction.id}`">假设节能比例 {{ efficiency }}%</label>
        <input :id="`efficiency-${interaction.id}`" v-model.number="efficiency" type="range" min="0" max="50" step="5" />
        <label :for="`clean-${interaction.id}`">理想化零直接排放替代比例 {{ cleanEnergy }}%</label>
        <input :id="`clean-${interaction.id}`" v-model.number="cleanEnergy" type="range" min="0" max="100" step="5" />
        <p>以假设的 100 单位基准排放计算，剩余约 <strong>{{ computedEmissions?.toFixed(1) }} 单位</strong>。</p>
        <small>仅演示顺序乘法；不包含替代技术全生命周期排放、增汇和全国统计。</small>
      </div>
      <p class="lab-prompt">思考：换一个条件后，哪个过程先改变？为什么？</p>
      <router-link v-if="experimentRoute" :to="experimentRoute" class="lab-link">进入相关现有实验 ↗</router-link>
      <p class="lab-limit">定性课堂推演。{{ interaction.limitation }}</p>
    </div>
  </details>
</template>

<script setup>
import { computed, ref } from 'vue'
import { buildExperimentRoute } from '../../../experiments/catalog.js'
import { illustrativeEmissions, shadowLength } from './models.js'

const props = defineProps({ interaction: { type: Object, required: true } })
const selectedIndex = ref(0)
const buildingHeight = ref(30)
const efficiency = ref(20)
const cleanEnergy = ref(30)
const choice = computed(() => props.interaction.choices[selectedIndex.value] || props.interaction.choices[0])
const computedShadow = computed(() => shadowLength(buildingHeight.value, Number.parseInt(choice.value.label, 10)))
const computedEmissions = computed(() => illustrativeEmissions(100, efficiency.value, cleanEnergy.value))
const pickerId = computed(() => `interaction-${props.interaction.id}`)
const experimentRoute = computed(() => props.interaction.link ? buildExperimentRoute({ experimentId: props.interaction.link[0], presetId: props.interaction.link[1] }) : null)
</script>

<style scoped>
.curriculum-interaction{border:1px solid #c7dbd1;background:#f7faf7;margin:18px 0;padding:0}
.curriculum-interaction summary{display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:14px 16px;cursor:pointer;color:#205b4b}
.curriculum-interaction summary span:first-child{font-size:11px;letter-spacing:.04em;color:#547b6d}.curriculum-interaction summary strong{font-size:15px}.curriculum-interaction summary span:last-child{margin-left:auto}
.interaction-content{border-top:1px solid #dce8e0;padding:16px}.interaction-content label{display:block;font-size:12px;font-weight:700;color:#315a4d;margin-bottom:7px}.interaction-content select{width:100%;max-width:320px;padding:9px;border:1px solid #a9c3b5;background:white;color:#173b35;font:inherit}
.reasoning{display:grid;grid-template-columns:minmax(0,1fr) 18px minmax(0,1.4fr) 18px minmax(0,1.4fr);align-items:stretch;gap:7px;margin-top:14px}.reasoning-step{background:#e8f1eb;border-left:3px solid #39806b;padding:10px;min-width:0}.reasoning-step small{display:block;color:#668478;font-size:11px;margin-bottom:5px}.reasoning-step strong{display:block;color:#214b3d;font-size:13px;line-height:1.5}.arrow{align-self:center;color:#6b887b}
.lab-prompt{font-size:13px;color:#355d4f;margin:12px 0}.lab-link{display:inline-block;color:#195a46;font-weight:700;font-size:13px;margin:3px 0 10px}.lab-limit{font-size:12px;color:#725e48;line-height:1.6;margin:8px 0 0}
.calculation{margin:14px 0;padding:12px;background:#edf5f0;border:1px solid #d1e4d7}.calculation label{margin:8px 0 3px}.calculation input{width:min(100%,360px);accent-color:#2d7765}.calculation p{margin:8px 0;color:#214b3d}.calculation small{color:#68786c;line-height:1.5}
@media(max-width:650px){.reasoning{display:block}.reasoning-step{margin:5px 0}.arrow{display:block;text-align:center;transform:rotate(90deg)}}
</style>
