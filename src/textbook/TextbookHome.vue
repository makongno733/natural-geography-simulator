<template>
  <div class="home-shell">
    <div class="card-grid">
      <router-link v-for="g in grades" :key="g.id" :to="'/' + g.id" class="card">
        <div class="card-title">{{ g.id }}</div>
        <div class="card-desc">{{ g.books.length }} 册教材</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { grades } from './data/index.js'
</script>

<style scoped>
.home-shell { padding: 28px 20px 40px; }
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  max-width: 760px;
  margin: 0 auto;
}
.card {
  display: block;
  text-decoration: none;
  border: 1px solid var(--brown);
  border-radius: var(--radius-card);
  padding: 28px 22px;
  text-align: center;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 238, 0.95));
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.card:hover {
  transform: translateY(-3px);
  border-color: var(--red);
  box-shadow: var(--shadow-hover);
}
.card-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--red);
  margin-bottom: 8px;
}
.card-desc {
  font-size: 13px;
  color: var(--muted);
}
</style>
