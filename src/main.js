import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

let mounted = false;

function mountApp() {
  if (mounted) return;
  const host = document.querySelector('#app');
  if (!host) return;
  createApp(App).mount(host);
  mounted = true;
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', mountApp, { once: true });
} else {
  mountApp();
}
