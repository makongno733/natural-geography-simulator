<template>
  <div class="home-shell">
    <section class="hero">
      <h1 class="hero-title">中学地理教学系统</h1>
      <p class="hero-subtitle">人教版 · 初中 / 高中 · 配套 3D 地理实验室</p>
    </section>

    <div class="entry-grid">
      <router-link to="/初中" class="entry-card">
        <span class="entry-icon" aria-hidden="true">🌏</span>
        <span class="entry-text">
          <strong class="entry-title">初中课程</strong>
          <em class="entry-desc">七年级 · 八年级</em>
        </span>
        <span class="entry-arrow" aria-hidden="true">→</span>
      </router-link>

      <router-link to="/高中" class="entry-card">
        <span class="entry-icon" aria-hidden="true">🗺️</span>
        <span class="entry-text">
          <strong class="entry-title">高中课程</strong>
          <em class="entry-desc">必修 · 选择性必修</em>
        </span>
        <span class="entry-arrow" aria-hidden="true">→</span>
      </router-link>

      <router-link to="/experiments" class="entry-card">
        <span class="entry-icon" aria-hidden="true">🔬</span>
        <span class="entry-text">
          <strong class="entry-title">地理实验室</strong>
          <em class="entry-desc">气象 · 水文 · 地质 · 天文</em>
        </span>
        <span class="entry-arrow" aria-hidden="true">→</span>
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
  max-width: 960px;
  margin: 0 auto;
  padding: 56px 20px 48px;
}

.hero {
  text-align: center;
  margin-bottom: 36px;
}

.hero-title {
  margin: 0;
  font-size: clamp(30px, 5vw, 42px);
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--text);
}

.hero-subtitle {
  margin: 12px 0 0;
  font-size: 15px;
  color: var(--text-muted);
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.entry-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 20px;
  text-decoration: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-box);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
}

.entry-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent);
  box-shadow: var(--shadow-hover);
}

.entry-icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  font-size: 22px;
  border-radius: 12px;
  background: var(--accent-soft);
}

.entry-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.entry-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.entry-desc {
  font-size: 13px;
  font-style: normal;
  color: var(--text-muted);
}

.entry-arrow {
  margin-left: auto;
  color: var(--text-faint);
  font-size: 18px;
  transition: transform var(--transition), color var(--transition);
}

.entry-card:hover .entry-arrow {
  color: var(--accent);
  transform: translateX(3px);
}

.sub-tools {
  margin: 20px auto 0;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.tool-pill {
  text-decoration: none;
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  padding: 7px 16px;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
}

.tool-pill:hover {
  color: #fff;
  border-color: var(--accent);
  background: var(--accent);
}

@media (max-width: 720px) {
  .home-shell {
    padding: 32px 14px 32px;
  }

  .entry-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .entry-card {
    padding: 16px;
  }
}
</style>
