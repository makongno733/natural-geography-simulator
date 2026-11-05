<script setup>
import { computed, ref } from 'vue'
import { lorentz, redshift, scaleFactor, stringPoints } from './physics.js'
const beta=ref(.6), a=ref(.5), z=ref(1), mode=ref(2), phase=ref(0), closed=ref(false)
const gamma=computed(()=>lorentz(beta.value))
const emission=computed(()=>Number.isFinite(z.value)&&z.value>=0?scaleFactor(z.value):null)
</script>
<template>
<div class="cosmos-labs">
<section class="cx-panel"><span class="cx-eyebrow">EXPERIMENT 01 · 狭义相对论</span><h2>运动如何改变测量？</h2><p>选择相对速度，比较实验室参考系测得的时间间隔与沿运动方向的长度。</p>
<label>相对速度 v/c = {{ beta.toFixed(2) }}<input v-model.number="beta" type="range" min="0" max="0.99" step="0.01"></label>
<div class="cx-stats"><div><strong>{{ gamma.toFixed(3) }}</strong>洛伦兹因子 γ</div><div><strong>{{ gamma.toFixed(3) }} s</strong>运动钟固有时间 1 s 对应 Δt</div><div><strong>{{ (1/gamma).toFixed(3) }} m</strong>固有长度 1 m 对应 L</div></div>
<svg viewBox="0 0 500 95" role="img" aria-label="静止与运动尺的长度比较"><text x="10" y="23">固有长度</text><path d="M110 20H470" stroke="#899bb0" stroke-width="12"/><text x="10" y="70">运动测量</text><path :d="`M110 66H${110+360/gamma}`" stroke="currentColor" stroke-width="12"/></svg>
<details><summary>公式、假设与课堂提问</summary><p>γ = 1/√(1−v²/c²)，Δt = γΔτ，L = L₀/γ。适用于惯性参考系；长度必须在测量参考系同时读取两端位置。不能将此直接用于引力时间膨胀。</p><p>提问：v = 0.6c 时，谁测得固有长度？为什么必须说明参考系？</p></details></section>
<section class="cx-panel"><span class="cx-eyebrow">EXPERIMENT 02 · 宇宙学</span><h2>光的波长随尺度因子伸长</h2><p>约定今天 a₀ = 1，固定共动位置，比较光发射时的相对间距。</p><label>发射尺度因子 a = {{ a.toFixed(2) }}<input v-model.number="a" type="range" min="0.1" max="1" step="0.01"></label>
<div class="cx-stats"><div><strong>{{ redshift(a).toFixed(2) }}</strong>宇宙学红移 z</div><div><strong>{{ (a*100).toFixed(0) }}%</strong>发射时 / 今日的固有间距</div></div>
<svg viewBox="0 0 500 100" role="img" aria-label="尺度因子变化下的共动星系示意"><circle v-for="i in 7" :key="i" :cx="250+(i-4)*65*a" cy="50" r="7" fill="currentColor"/></svg>
<label>反向计算：输入非负红移 z <input v-model.number="z" type="number" min="0" max="1100" step="0.1"></label><p aria-live="polite">发射尺度因子：{{ emission === null ? '请输入有效的非负数' : emission.toFixed(5) }}</p><details><summary>模型边界</summary><p>1 + z = a₀/a。此图忽略本动速度，不是星系在静态空间中的多普勒运动；引力束缚系统不会简单随宇宙膨胀。此实验不计算宇宙年龄或光度距离。</p></details></section>
<section class="cx-panel"><span class="cx-eyebrow">EXPERIMENT 03 · 弦的模态类比</span><h2>从边界条件到振动模态</h2><label>边界类型<select v-model="closed"><option :value="false">固定两端开弦类比</option><option :value="true">周期闭弦类比</option></select></label><label>模态阶数 n = {{ mode }}<input v-model.number="mode" type="range" min="1" max="6" step="1"></label><label>时间相位 ωt = {{ phase.toFixed(2) }}<input v-model.number="phase" type="range" min="0" max="6.283" step="0.01"></label>
<svg viewBox="0 0 500 280" role="img" aria-label="可改变模态与相位的经典弦示意"><path d="M30 140H470" stroke="#899bb0" stroke-dasharray="3 6"/><polyline :points="stringPoints(mode,phase,closed)" fill="none" stroke="currentColor" stroke-width="3"/></svg><p class="cx-note">经典驻波类比，不是量子弦动力学模拟。开弦展示固定端边界，闭弦展示周期径向形变；图形不能用于读取真实粒子质量或自旋。</p><details><summary>公式与探索问题</summary><p>开弦类比 y = A sin(nπx/L) cos(ωt)。调节 n，数出内部节点；固定端与自由端边界有什么不同？真实弦论还需要约束、量子化与态空间。</p></details></section>
</div>
</template>
