<template>
  <div class="exp-home">
    <h1 class="exp-heading">地学实验</h1>
    <p class="exp-lead">选择学科，开始交互式实验</p>
    <div class="exp-grid">
      <router-link
        v-for="cat in categories"
        :key="cat.id"
        :to="`/experiments/${cat.id}`"
        :class="['exp-card', `exp-card-${cat.id}`]"
      >
        <div class="exp-card-icon">{{ cat.icon }}</div>
        <div class="exp-card-title">{{ cat.label }}</div>
        <div class="exp-card-desc">{{ cat.desc }}</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
const categories = [
  { id: 'meteorology', icon: '🌤', label: '气象学实验', desc: '热力环流 · 科里奥利力 · 云与降水' },
  { id: 'hydrology', icon: '💧', label: '水文学实验', desc: '流水地貌 · 地下水 · 水循环' },
  { id: 'geology', icon: '⛏', label: '地质实验', desc: '断层褶皱 · 地层 · 矿物鉴定' },
  { id: 'astronomy', icon: '🔭', label: '天文学实验', desc: '月相 · 四季 · 行星运动' },
]
</script>

<style scoped>
.exp-home { padding: 40px 20px 34px; }
.exp-heading {
  text-align: center;
  font-size: clamp(28px, 6vw, 44px);
  color: var(--red);
  margin: 0 0 8px;
  font-family: "Ma Shan Zheng", "STXingkai", "Kaiti SC", serif;
}
.exp-lead { text-align: center; color: var(--muted); font-size: 15px; margin: 0 0 32px; }
.exp-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; max-width: 780px; margin: 0 auto; }
.exp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 180px;
  text-decoration: none;
  border-radius: 16px;
  padding: 28px 20px 22px;
  text-align: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), box-shadow var(--transition);
}
.exp-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-hover); }
.exp-card-meteorology { background: linear-gradient(180deg, #e3f2fd, #bbdefb); border: 1px solid #90caf9; }
.exp-card-hydrology { background: linear-gradient(180deg, #e0f2f1, #b2dfdb); border: 1px solid #80cbc4; }
.exp-card-geology { background: linear-gradient(180deg, #efebe9, #d7ccc8); border: 1px solid #bcaaa4; }
.exp-card-astronomy { background: linear-gradient(180deg, #ede7f6, #d1c4e9); border: 1px solid #b39ddb; }
.exp-card-icon { font-size: 40px; margin-bottom: 10px; }
.exp-card-title { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 4px; }
.exp-card-desc { font-size: 11px; color: #777; line-height: 1.5; }
.exp-card-meteorology .exp-card-title { color: #1565c0; }
.exp-card-hydrology .exp-card-title { color: #00695c; }
.exp-card-geology .exp-card-title { color: #4e342e; }
.exp-card-astronomy .exp-card-title { color: #4527a0; }

@media (max-width: 720px) {
  .exp-home { padding: 20px 14px 28px; }
  .exp-grid { gap: 14px; }
  .exp-card { width: 150px; padding: 20px 14px 16px; }
  .exp-card-icon { font-size: 32px; }
  .exp-card-title { font-size: 17px; }
}
</style>
