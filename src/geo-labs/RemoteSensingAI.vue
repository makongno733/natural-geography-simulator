<template>
  <section class="lab-page">
    <header class="lab-intro">
      <router-link to="/geo-labs" class="back">← 地理实证实验</router-link>
      <p class="eyebrow">IBM × NASA · PRITHVI EO 2.0</p>
      <h1>遥感 AI 看到了什么？</h1>
      <p>IBM 与 NASA 发布的 Prithvi-EO-2.0 官方演示会遮住一部分多光谱卫星影像，再由模型重建。重建结果是模型推断，不是实际观测，也不能直接当作灾害或地物分类结论。</p>
    </header>
    <div class="instructions">
      <h2>三步实验</h2>
      <ol>
        <li>打开官方演示，选择其提供的示例影像，先辨认能直接观察到的地表特征。</li>
        <li>运行模型，比较输入、遮挡和重建区域；记下模型补出的形状与色彩。</li>
        <li>指出一处你不确定的地方，并说出需要哪种原始数据来验证。</li>
      </ol>
    </div>
    <div class="demo-card">
      <div><span>真实模型推断 · 官方服务</span><h2>运行 Prithvi-EO-2.0</h2><p>官方演示提供示例卫星影像。点击后在新页面运行模型，再回到这里完成观察与解释。</p></div>
      <a href="https://ibm-nasa-geospatial-prithvi-eo-2-0-demo.hf.space/" target="_blank" rel="noopener noreferrer">打开模型实验 ↗</a>
    </div>
    <p class="source">模型与演示由 IBM 和 NASA 团队托管；运行依赖 Hugging Face 服务和网络。本站不接收上传影像，也不保存模型推断。模型权重与用法见 <a href="https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL" target="_blank" rel="noopener">官方模型卡</a>。</p>
  </section>
</template>
<style scoped>
.lab-page{max-width:1180px;margin:auto;padding:46px 24px 90px;color:#15273b}.lab-intro{max-width:830px}.back{font-size:14px;color:#256d8b}.eyebrow{margin:28px 0 8px;color:#4b8498;font-size:12px;letter-spacing:.16em;font-weight:700}.lab-intro h1{font-size:clamp(32px,5vw,56px);margin:0 0 12px}.lab-intro p:last-child{line-height:1.8;color:#536679}.instructions{margin:30px 0;padding:24px 30px;background:#e9f2f2;border-radius:15px}.instructions h2{margin:0 0 10px}.instructions li{line-height:1.9}.demo-card{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:35px;margin-top:22px;border-radius:16px;background:#183a50;color:white}.demo-card span{font-size:12px;letter-spacing:.12em;color:#90c8d1}.demo-card h2{font-size:28px;margin:10px 0}.demo-card p{max-width:610px;line-height:1.7;color:#d6e7ea}.demo-card a{flex:none;padding:14px 20px;border-radius:9px;background:#bde9e1;color:#153b44;text-decoration:none;font-weight:800}.source{font-size:12px;line-height:1.7;color:#647688}.source a{color:#226f89}@media(max-width:760px){.demo-card{display:block}.demo-card a{display:inline-block;margin-top:12px}}
</style>
