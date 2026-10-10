<template>
  <div class="portal">
    <header class="header">
      <a :href="`${siteOrigin}/#/`" class="brand"><span class="mark">◎</span><span>中学地理教学系统<small>ACCOUNT CENTER · 账号中心</small></span></a>
      <a :href="`${siteOrigin}/#/`" class="back">返回地理课程 →</a>
    </header>
    <main><AccountPage /></main>
  </div>
</template>

<script setup>
import AccountPage from './AccountPage.vue'
import { siteOrigin } from './client.js'
</script>

<style>
:root { color-scheme: light; --text:#182b3e; --text-muted:#60758a; --border:#dbe5ec; --accent:#176e83; --accent-soft:#e8f4f5; --shadow-sm:0 16px 48px rgba(22,46,68,.10); font-family: Inter,-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif; }
* { box-sizing: border-box; }
body { margin:0; min-width:320px; color:var(--text); background: radial-gradient(circle at 15% 15%,#d9eced,transparent 30%),linear-gradient(140deg,#f8faf9,#e9f2f3); }
.portal { min-height:100vh; }
.header { min-height:72px; padding:12px clamp(20px,5vw,76px); display:flex; align-items:center; justify-content:space-between; gap:20px; border-bottom:1px solid var(--border); background:rgba(255,255,255,.76); }
.brand { display:flex; gap:12px; align-items:center; color:var(--text); text-decoration:none; font-size:15px; font-weight:750; }
.mark { display:grid; place-items:center; width:34px; height:34px; border-radius:50%; color:#fff; background:var(--accent); font-size:27px; font-weight:400; }
.brand small { display:block; margin-top:2px; color:var(--text-muted); font-size:10px; letter-spacing:.12em; }
.back { color:var(--accent); font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; }
@media(max-width:520px){ .header{min-height:64px}.brand{font-size:13px}.brand small{font-size:9px}.back{font-size:11px} }
</style>
