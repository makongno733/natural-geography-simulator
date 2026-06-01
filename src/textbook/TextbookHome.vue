<template>
  <div class="home-shell">
    <div class="hero-grid">
      <router-link to="/初中" class="hero-card card-junior">
        <div class="card-kicker">课程入口</div>
        <div class="card-title">初中课程</div>
        <div class="card-desc">七年级 · 八年级</div>
      </router-link>
      <router-link to="/高中" class="hero-card card-senior">
        <div class="card-kicker">课程入口</div>
        <div class="card-title">高中课程</div>
        <div class="card-desc">必修 · 选择性必修</div>
      </router-link>
      <router-link to="/experiments" class="hero-card card-experiments">
        <div class="card-kicker">互动入口</div>
        <div class="card-title">地理实验室</div>
        <div class="card-desc">气象 · 水文 · 地质 · 天文</div>
      </router-link>
    </div>
    <div class="sub-tools">
      <router-link to="/map" class="tool-pill">地图系统</router-link>
      <router-link to="/geo" class="tool-pill">地质年代</router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-shell {
  padding: 30px 20px 30px;
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  max-width: 920px;
  margin: 0 auto;
}

.hero-card {
  display: block;
  text-decoration: none;
  border-radius: 12px;
  padding: 16px 16px 14px;
  text-align: left;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
  border: 1px solid rgba(80, 100, 52, 0.26);
}
.hero-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.card-junior {
  background: linear-gradient(180deg, rgba(232, 245, 233, 0.96), rgba(200, 230, 201, 0.9));
}

.card-senior {
  background: linear-gradient(180deg, rgba(227, 242, 253, 0.96), rgba(187, 222, 251, 0.9));
}

.card-experiments {
  background: linear-gradient(180deg, rgba(252, 228, 236, 0.96), rgba(248, 187, 208, 0.9));
}

.card-kicker {
  font-size: 11px;
  color: rgba(45, 32, 26, 0.62);
  letter-spacing: 0.08em;
}

.card-title {
  margin-top: 4px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.15;
}

.card-desc {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(45, 32, 26, 0.78);
}

.card-junior .card-title { color: #2f6c37; }
.card-senior .card-title { color: #1f5586; }
.card-experiments .card-title { color: #8c2d3b; }

.sub-tools {
  margin: 14px auto 0;
  max-width: 920px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.tool-pill {
  text-decoration: none;
  color: var(--button-green-ink);
  font-size: 12px;
  border: 1px solid rgba(100, 122, 63, 0.32);
  border-radius: 999px;
  background: rgba(239, 247, 214, 0.9);
  padding: 6px 12px;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
}

.tool-pill:hover {
  color: #fff;
  border-color: var(--button-green-deep);
  background: var(--button-green-deep);
}

@media (max-width: 720px) {
  .home-shell {
    padding: 14px 10px 20px;
  }

  .hero-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .hero-card {
    padding: 12px;
  }

  .card-title {
    font-size: 19px;
  }

  .card-desc {
    font-size: 11px;
  }
}
</style>
