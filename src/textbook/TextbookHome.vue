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
import { onMounted, ref } from 'vue'
import { getGrades } from './data/catalogLoader.js'

const grades = ref([])

onMounted(async () => {
  grades.value = await getGrades()
})
</script>

<style scoped>
.home-shell { padding: 8px 20px 34px; }
.card-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 560px;
  margin: 0 auto;
}
.card {
  display: grid;
  place-items: center;
  min-width: 118px;
  text-decoration: none;
  border: 1px solid var(--brown);
  border-radius: 999px;
  padding: 11px 18px 10px;
  text-align: center;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 238, 0.95));
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.card:hover {
  transform: translateY(-2px);
  border-color: var(--red);
  box-shadow: var(--shadow-hover);
}
.card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--red);
  margin-bottom: 2px;
}
.card-desc {
  font-size: 11px;
  color: var(--muted);
}

@media (max-width: 720px) {
  .home-shell {
    padding: 10px 14px 28px;
  }
  .card-grid {
    gap: 8px;
  }
  .card {
    min-width: 96px;
    padding: 9px 13px 8px;
  }
  .card-title {
    font-size: 16px;
  }
}
</style>
