<template>
  <div class="home-shell">
    <div class="card-grid">
      <router-link to="/初中" class="card card-junior">
        <div class="card-icon">📗</div>
        <div class="card-title">初中</div>
        <div class="card-desc">七年级 · 八年级</div>
      </router-link>
      <router-link to="/高中" class="card card-senior">
        <div class="card-icon">📘</div>
        <div class="card-title">高中</div>
        <div class="card-desc">必修 · 选择性必修</div>
      </router-link>
      <router-link to="/map" class="card card-map">
        <div class="card-icon">🗺</div>
        <div class="card-title">地图系统</div>
        <div class="card-desc">投影 · 展开 · 教学</div>
      </router-link>
      <router-link to="/geo" class="card card-geo">
        <div class="card-icon">🦕</div>
        <div class="card-title">地质年代</div>
        <div class="card-desc">46亿年 · 四大圈层</div>
      </router-link>
      <router-link to="/experiments" class="card card-experiments">
        <div class="card-icon">🔬</div>
        <div class="card-title">地学实验</div>
        <div class="card-desc">气象 · 水文 · 地质 · 天文</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-shell { padding: 40px 20px 34px; }
.card-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  max-width: 920px;
  margin: 0 auto;
}
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 180px;
  text-decoration: none;
  border-radius: 16px;
  padding: 28px 20px 22px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover { transform: translateY(-4px); box-shadow: 0 6px 24px rgba(0,0,0,0.14); }
.card-junior { background: linear-gradient(180deg, #e8f5e9, #c8e6c9); border: 1px solid #a5d6a7; }
.card-senior { background: linear-gradient(180deg, #e3f2fd, #bbdefb); border: 1px solid #90caf9; }
.card-map { background: linear-gradient(180deg, #fff3e0, #ffe0b2); border: 1px solid #ffcc80; }
.card-geo { background: linear-gradient(180deg, #ede7f6, #d1c4e9); border: 1px solid #b39ddb; }
.card-experiments { background: linear-gradient(180deg, #fce4ec, #f8bbd0); border: 1px solid #f48fb1; }
.card-icon { font-size: 36px; margin-bottom: 10px; }
.card-title { font-size: 22px; font-weight: 700; color: #333; margin-bottom: 4px; }
.card-desc { font-size: 12px; color: #777; }
.card-junior .card-title { color: #2e7d32; }
.card-senior .card-title { color: #1565c0; }
.card-map .card-title { color: #e65100; }
.card-geo .card-title { color: #4527a0; }
.card-experiments .card-title { color: #c62828; }

@media (max-width: 720px) {
  .home-shell { padding: 20px 14px 28px; }
  .card-grid { gap: 14px; }
  .card { width: 150px; padding: 20px 14px 16px; }
  .card-title { font-size: 18px; }
  .card-icon { font-size: 28px; }
}
</style>
