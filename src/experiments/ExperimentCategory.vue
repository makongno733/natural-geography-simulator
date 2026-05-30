<template>
  <div class="experiment-category">
    <h1>{{ category }}</h1>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const category = route.params.category
</script>

<style scoped>
.experiment-category {
  padding: 40px 20px;
  text-align: center;
}
</style>
