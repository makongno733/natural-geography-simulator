import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 4173
  },
  preview: {
    host: '127.0.0.1',
    port: 4173
  },
  plugins: [
    vue(),
    compression({ algorithms: ['gzip', 'brotliCompress'] })
  ],
  css: {
    transformer: 'lightningcss'
  },
  build: {
    target: 'es2020',
    manifest: true,
    cssMinify: 'lightningcss',
    modulePreload: {
      polyfill: false
    },
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/textbook/data/index.js')) return 'catalog-data';

          if (!id.includes('node_modules')) return null;
          if (id.includes('three')) return 'vendor-three';
          if (id.includes('vue-router')) return 'vendor-vue';
          return 'vendor-core';
        }
      }
    }
  }
});
