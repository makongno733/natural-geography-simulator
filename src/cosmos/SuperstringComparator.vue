<script setup>
import { ref, computed } from 'vue'
import { SUPERSTRING_THEORIES } from './stringTheoriesData.js'

const theoryLeftId = ref('type2a')
const theoryRightId = ref('type2b')

const theoryLeft = computed(() => SUPERSTRING_THEORIES.find(t => t.id === theoryLeftId.value) || SUPERSTRING_THEORIES[1])
const theoryRight = computed(() => SUPERSTRING_THEORIES.find(t => t.id === theoryRightId.value) || SUPERSTRING_THEORIES[2])

const comparisonDimensions = [
  { key: 'stringType', label: '弦的基本类型' },
  { key: 'orientability', label: '世界面定向性' },
  { key: 'spacetimeChirality', label: '10 维时空手征性' },
  { key: 'supersymmetry10D', label: '10 维超对称结构' },
  { key: 'gaugeGroup', label: '基本微扰规范群' },
  { key: 'gaugeOrigin', label: '规范玻色子物理起源 (重要区别)' },
  { key: 'dBraneTypes', label: '允许的稳定 D 膜' },
  { key: 'strongCouplingDual', label: '强耦合极限对偶终态' },
  { key: 'phenoPotential', label: '粒子物理标准模型唯象潜力' }
]
</script>

<template>
<div class="cx-comparator">
  <div class="cx-comparator-header">
    <div>
      <span class="cx-eyebrow">THEORY MATRIX</span>
      <h3>五种 10 维超弦理论并排深度对比</h3>
    </div>
    <p class="cx-subtext">选择任意两种理论进行逐项对照，辨明手征性、超对称数、规范群真实来源与对偶映射。</p>
  </div>

  <div class="cx-compare-selectors">
    <div class="cx-selector-box">
      <label for="cx-left-select">选择理论 A：</label>
      <select id="cx-left-select" v-model="theoryLeftId">
        <option v-for="t in SUPERSTRING_THEORIES" :key="t.id" :value="t.id">
          {{ t.name }} ({{ t.nameEn }})
        </option>
      </select>
    </div>

    <div class="cx-compare-vs" aria-hidden="true">VS</div>

    <div class="cx-selector-box">
      <label for="cx-right-select">选择理论 B：</label>
      <select id="cx-right-select" v-model="theoryRightId">
        <option v-for="t in SUPERSTRING_THEORIES" :key="t.id" :value="t.id">
          {{ t.name }} ({{ t.nameEn }})
        </option>
      </select>
    </div>
  </div>

  <div class="cx-compare-table-wrap">
    <table class="cx-compare-table">
      <thead>
        <tr>
          <th style="width: 22%">物理对比维度</th>
          <th style="width: 39%">{{ theoryLeft.name }}</th>
          <th style="width: 39%">{{ theoryRight.name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="dim in comparisonDimensions" :key="dim.key">
          <td class="cx-dim-label">
            <strong>{{ dim.label }}</strong>
          </td>
          <td :class="{ 'cx-highlight-diff': theoryLeft[dim.key] !== theoryRight[dim.key] }">
            {{ theoryLeft[dim.key] }}
          </td>
          <td :class="{ 'cx-highlight-diff': theoryLeft[dim.key] !== theoryRight[dim.key] }">
            {{ theoryRight[dim.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="cx-compare-notice">
    <strong>科学警示：</strong>
    Type IIA 与 Type IIB 理论在纯微扰闭弦下<b>没有任何非阿贝尔规范群</b>（微扰仅含 R-R 微分形式场），标准模型的非阿贝尔规范对称性必须通过堆叠非微扰 D 膜世界体积上的开弦激发来产生；而 Heterotic 杂化弦由于左行 16 维格点紧致化，原生自带 SO(32) 或 E8×E8 庞大规范对称性。
  </div>
</div>
</template>
