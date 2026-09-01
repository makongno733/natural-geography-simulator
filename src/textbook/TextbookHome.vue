<template>
  <div class="home-shell">
    <section class="hero">
      <h1 class="hero-title">中学地理教学系统</h1>
      <p class="hero-subtitle">人教版 · 初中 / 高中 · 配套 3D 地理实验室</p>
    </section>

    <div class="entry-grid">
      <router-link to="/初中" class="entry-card sheen-card">
        <span class="entry-icon" aria-hidden="true">🌏</span>
        <span class="entry-text">
          <strong class="entry-title">初中课程</strong>
          <em class="entry-desc">七年级 · 八年级</em>
        </span>
        <span class="entry-arrow" aria-hidden="true">→</span>
      </router-link>

      <router-link to="/高中" class="entry-card sheen-card">
        <span class="entry-icon" aria-hidden="true">🗺️</span>
        <span class="entry-text">
          <strong class="entry-title">高中课程</strong>
          <em class="entry-desc">必修 · 选择性必修</em>
        </span>
        <span class="entry-arrow" aria-hidden="true">→</span>
      </router-link>

      <router-link to="/experiments" class="entry-card sheen-card">
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
  position: relative;
  margin: 0;
  padding-bottom: 16px;
  font-size: clamp(32px, 5vw, 46px);
  font-weight: 800;
  letter-spacing: 0.01em;
  color: transparent;
  background: linear-gradient(115deg, #0f2d5c 0%, #1f6feb 40%, #4d9bff 66%, #14396f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-title::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 96px;
  height: 3px;
  background-image: var(--rainbow-fade);
  background-size: 300% 100%;
  animation: rainbow-slide 5s ease-in-out infinite;
  border-radius: 999px;
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
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
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 20px 22px 18px;
  text-decoration: none;
  background: var(--surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-box);
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition), background var(--transition), box-shadow var(--transition);
}

/* 左侧流动彩虹条（Gemini 动态彩虹） */
.entry-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 999px 0 0 999px;
  background-image: var(--rainbow-fade-v);
  background-size: 300% 300%;
  animation: rainbow-slide 4s ease-in-out infinite;
}

.entry-card:hover {
  background: var(--accent-softer);
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
  border-radius: 14px;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.95), var(--accent-soft));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 6px 16px rgba(36, 86, 214, 0.12);
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
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid var(--glass-border);
  background: var(--surface);
  border-radius: 999px;
  padding: 7px 16px;
  box-shadow: var(--shadow-sm);
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  transition: background var(--transition), color var(--transition), border-color var(--transition), box-shadow var(--transition);
}

.tool-pill:hover {
  color: var(--accent-ink);
  border-color: var(--accent-strong);
  background: var(--gem-flecks), var(--gem);
  box-shadow: var(--gem-glow);
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
