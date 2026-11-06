<script setup>
import { ref, computed } from 'vue'
import { particles, PARTICLE_CATEGORIES } from './particlesData.js'

const activeCategory = ref('all')
const selectedParticleId = ref('up')

const filteredParticles = computed(() => {
  if (activeCategory.value === 'all') return particles
  return particles.filter(p => p.category === activeCategory.value)
})

const selectedParticle = computed(() => {
  return particles.find(p => p.id === selectedParticleId.value) || particles[0]
})

function selectParticle(id) {
  selectedParticleId.value = id
}
</script>

<template>
<div class="cx-particle-atlas">
  <div class="cx-atlas-header">
    <div>
      <span class="cx-eyebrow">STANDARD MODEL & BEYOND · PDG 2024</span>
      <h3>基本粒子交互图谱与高能物理数据库</h3>
    </div>
    <p class="cx-subtext">严格基于 Particle Data Group (PDG 2024) 国际数据标准，区分费米子、规范玻色子、标量希格斯粒子与假想引力子。</p>
  </div>

  <!-- 分类筛选器 -->
  <div class="cx-category-filters" role="tablist" aria-label="粒子分类筛选">
    <button
      v-for="cat in PARTICLE_CATEGORIES"
      :key="cat.id"
      role="tab"
      :aria-selected="activeCategory === cat.id"
      class="cx-cat-tab"
      :class="{ active: activeCategory === cat.id }"
      @click="activeCategory = cat.id"
    >
      {{ cat.label }}
    </button>
  </div>

  <div class="cx-atlas-layout">
    <!-- 粒子卡片网格 -->
    <div class="cx-particles-grid">
      <button
        v-for="p in filteredParticles"
        :key="p.id"
        type="button"
        class="cx-particle-card"
        :class="[
          `cx-cat-${p.category}`,
          { active: selectedParticleId === p.id }
        ]"
        :aria-pressed="selectedParticleId === p.id"
        @click="selectParticle(p.id)"
      >
        <span class="cx-p-symbol">{{ p.symbol }}</span>
        <span class="cx-p-name">{{ p.name }}</span>
        <span class="cx-p-mass">{{ p.mass.split(' ')[0] }}</span>
        <div class="cx-p-badges">
          <span class="cx-badge-spin">自旋 {{ p.spin.split(' ')[0] }}</span>
          <span class="cx-badge-charge">{{ p.charge }}</span>
        </div>
      </button>
    </div>

    <!-- 粒子深度数据详情面板 -->
    <aside class="cx-particle-detail" aria-live="polite">
      <div class="cx-detail-top">
        <div class="cx-detail-symbol-box" :class="`cx-cat-${selectedParticle.category}`">
          <span>{{ selectedParticle.symbol }}</span>
        </div>
        <div>
          <h4>{{ selectedParticle.name }} <small>({{ selectedParticle.nameEn }})</small></h4>
          <span class="cx-detail-cat-badge">
            {{
              selectedParticle.category === 'quark' ? '夸克 · 费米子' :
              selectedParticle.category === 'lepton' ? '轻子 · 费米子' :
              selectedParticle.category === 'gauge_boson' ? '规范玻色子 (自旋 1)' :
              selectedParticle.category === 'scalar_boson' ? '标量玻色子 (自旋 0 · 希格斯)' :
              '理论预测候选 (尚未发现)'
            }}
          </span>
        </div>
      </div>

      <dl class="cx-detail-list">
        <div>
          <dt>电荷 (Charge)：</dt>
          <dd><b>{{ selectedParticle.charge }}</b></dd>
        </div>
        <div>
          <dt>内秉自旋 (Spin)：</dt>
          <dd><b>{{ selectedParticle.spin }}</b></dd>
        </div>
        <div>
          <dt>测定静质量 (Mass)：</dt>
          <dd><b class="cx-mass-value">{{ selectedParticle.mass }}</b></dd>
        </div>
        <div class="cx-full-width">
          <dt>质量方案与严格定义：</dt>
          <dd class="cx-def-text">{{ selectedParticle.massDefinition }}</dd>
        </div>
        <div class="cx-full-width">
          <dt>参与的相互作用：</dt>
          <dd>
            <span v-for="int in selectedParticle.interactions" :key="int" class="cx-int-tag">{{ int }}</span>
          </dd>
        </div>
        <div class="cx-full-width">
          <dt>实验发现史：</dt>
          <dd class="cx-hist-text">{{ selectedParticle.discovery }}</dd>
        </div>
        <div class="cx-full-width">
          <dt>PDG 权威数据源：</dt>
          <dd>
            <a href="https://pdg.lbl.gov/" target="_blank" rel="noopener noreferrer" class="cx-pdg-link">
              {{ selectedParticle.pdgSource }} ↗
            </a>
          </dd>
        </div>
      </dl>

      <div v-if="selectedParticle.category === 'scalar_boson'" class="cx-warning-box">
        <strong>科学辨析：</strong>希格斯玻色子是自发对称性破缺产生的自旋为 0 的标量玻色子，<b>绝非传递规范相互作用的规范玻色子</b>。
      </div>
      <div v-if="selectedParticle.category === 'hypothetical'" class="cx-warning-box">
        <strong>理论地位：</strong>引力子是量子引力与闭弦理论预言的自旋 2 无质量玻色子，<b>未被包含在已确证的标准模型已发现基本粒子列表中</b>。
      </div>
    </aside>
  </div>
</div>
</template>
