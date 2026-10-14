import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { writeFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

// Render the exact production component, so vector exports cannot drift from the website.
const cacheDir = await mkdtemp(join(tmpdir(), 'geo-brand-export-'))
const server = await createServer({ configFile: false, cacheDir, plugins: [vue()], server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, include: [] } })
try {
  const { default: Mark } = await server.ssrLoadModule('/src/brand/BrandMark.vue')
  for (const [name, props] of Object.entries({
    'brand-mark': { compact: false },
    'brand-mark-dark': { compact: false, dark: true },
    'brand-mark-compact': { compact: true },
    'brand-mark-mono': { compact: false, mono: true },
  })) {
    let svg = await renderToString(createSSRApp({ render: () => h(Mark, props) }))
    svg = svg.replace(/<!--.*?-->/gs, '').replace(/ data-v-[a-z0-9]+(?:="")?/g, '')
      .replace(/viewbox=/g, 'viewBox=').replace(/pathlength=/g, 'pathLength=')
      .replace('aria-hidden="true"', 'role="img" aria-label="中学地理教学系统地球地形标志"')
      .replace(/<g class="orbit-traveler traveler-rear">.*?<\/g>/s, '')
      .replace(/<g class="orbit-traveler traveler-front">.*?<\/g>/s, '<circle cx="145.93" cy="46.4" r="2.2" fill="#E6C68A"/>')
    await writeFile(`public/brand/${name}.svg`, `${svg.replace(/></g, '>\n<')}\n`)
  }
} finally { await server.close(); await rm(cacheDir, { recursive: true, force: true }) }
