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
.home-shell { padding: 20px; }
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
  max-width: 600px;
  margin: 0 auto;
}
.card {
  display: block;
  text-decoration: none;
  border: 1px solid #e2c9b4;
  border-radius: 12px;
  padding: 24px 20px;
  text-align: center;
  background: rgba(255,255,255,0.94);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}
.card:hover {
  transform: translateY(-2px);
  border-color: #b01217;
}
.card-title {
  font-size: 22px;
  font-weight: 700;
  color: #b01217;
  margin-bottom: 6px;
}
.card-desc {
  font-size: 13px;
  color: #b85a4d;
}
</style>
