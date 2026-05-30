<template>
  <div class="experiment-view">
    <h1>{{ experiment }}</h1>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const experiment = route.params.experiment
</script>

<style scoped>
.experiment-view {
  padding: 40px 20px;
  text-align: center;
}
</style>
