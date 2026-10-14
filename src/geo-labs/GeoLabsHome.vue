<template>
  <section class="labs">
    <header>
      <p class="eyebrow">GEOGRAPHY EVIDENCE LABS</p>
      <h1>用真实地球数据做探究</h1>
      <p>从卫星影像、高程数据到遥感 AI，先观察证据，再解释现象。每个实验都标明数据来源和它能回答的问题。</p>
    </header>
    <div class="cards">
      <router-link to="/geo-labs/satellite" class="card"><span>01 · NASA GIBS</span><h2>卫星影像对比</h2><p>同一地点、两个日期，滑动比较云、地表与积雪的可见变化。</p><strong>开始观察 →</strong></router-link>
      <router-link to="/geo-labs/terrain" class="card"><span>02 · COPERNICUS DEM</span><h2>真实三维地形</h2><p>旋转珠峰附近的真实高程，沿纬线读一条地形剖面。</p><strong>查看地形 →</strong></router-link>
      <router-link to="/geo-labs/ai" class="card"><span>03 · PRITHVI EO 2.0</span><h2>遥感 AI 实验</h2><p>试用 IBM 与 NASA 的开源遥感基础模型，并思考模型输出的边界。</p><strong>进入实验 →</strong></router-link>
    </div>
  </section>
</template>
<style scoped>
.labs{max-width:1180px;margin:0 auto;padding:76px 24px 120px;color:#15273b}.labs header{max-width:750px}.eyebrow{font-size:12px;letter-spacing:.18em;font-weight:800;color:#3f8195}.labs h1{font-size:clamp(36px,5vw,62px);line-height:1.1;margin:16px 0}.labs header p:last-child{line-height:1.8;color:#536679}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:50px}.card{display:flex;flex-direction:column;min-height:310px;padding:30px;border:1px solid #d6e1e5;border-radius:18px;background:linear-gradient(145deg,#f9fcfb,#e8f2f2);text-decoration:none;color:inherit;transition:transform .2s,box-shadow .2s}.card:hover{transform:translateY(-5px);box-shadow:0 14px 30px #14354b1b}.card span{font-size:12px;font-weight:800;letter-spacing:.12em;color:#4b8498}.card h2{font-size:27px;margin:28px 0 12px}.card p{line-height:1.8;color:#536679}.card strong{margin-top:auto;color:#1b6b78}@media(max-width:820px){.cards{grid-template-columns:1fr}.card{min-height:240px}}
</style>
