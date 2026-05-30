<template>
  <div class="cat-page">
    <nav class="cat-breadcrumb">
      <router-link to="/">首页</router-link>
      <span> &gt; </span>
      <router-link to="/experiments">地学实验</router-link>
      <span> &gt; </span>
      <strong>{{ label }}</strong>
    </nav>
    <h2 class="cat-title">{{ label }}</h2>
    <div class="cat-grid">
      <router-link
        v-for="exp in experiments"
        :key="exp.id"
        :to="`/experiments/${exp.category}/${exp.id}`"
        class="exp-item"
      >
        <span :class="['exp-badge', exp.type === '3d' ? 'badge-3d' : 'badge-tutorial']">
          {{ exp.type === '3d' ? '3D 交互' : '图文教程' }}
        </span>
        <div class="exp-item-name">{{ exp.name }}</div>
        <div class="exp-item-desc">{{ exp.description }}</div>
        <div class="exp-item-concepts">
          <span v-for="c in exp.concepts" :key="c" class="concept-tag">{{ c }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import modules, { categoryLabels } from './modules/index.js'

const route = useRoute()
const category = computed(() => route.params.category)
const label = computed(() => categoryLabels[category.value] || category.value)
const experiments = computed(() => modules.filter(m => m.category === category.value))
</script>

<style scoped>
.cat-page { padding: 24px 20px 40px; max-width: 900px; margin: 0 auto; }
.cat-breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
.cat-breadcrumb a { color: var(--muted); text-decoration: none; }
.cat-breadcrumb a:hover { color: var(--red); }
.cat-title { font-size: clamp(24px, 5vw, 34px); color: var(--ink); margin: 0 0 24px; }
.cat-grid { display: flex; flex-direction: column; gap: 14px; }
.exp-item {
  display: block;
  text-decoration: none;
  border-radius: var(--radius-card);
  padding: 18px 22px;
  background: var(--card-bg);
  border: 1px solid var(--brown-light);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), box-shadow var(--transition);
  position: relative;
}
.exp-item:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
.exp-badge {
  position: absolute;
  top: 14px;
  right: 16px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}
.badge-3d { background: #dce8b8; color: #43552d; }
.badge-tutorial { background: #e8e0d0; color: #6d5d40; }
.exp-item-name { font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 4px; padding-right: 80px; }
.exp-item-desc { font-size: 13px; color: #777; margin-bottom: 8px; line-height: 1.5; }
.exp-item-concepts { display: flex; flex-wrap: wrap; gap: 6px; }
.concept-tag {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 3px;
  background: rgba(158, 36, 38, 0.07);
  color: var(--red);
}

@media (max-width: 720px) {
  .cat-page { padding: 16px 12px 28px; }
  .cat-breadcrumb { font-size: 11px; }
  .cat-title { font-size: 22px; }
  .exp-item { padding: 12px 14px; }
  .exp-item-name { font-size: 16px; padding-right: 60px; }
  .exp-item-desc { font-size: 12px; }
  .exp-badge { top: 10px; right: 10px; font-size: 10px; }
}
</style>
