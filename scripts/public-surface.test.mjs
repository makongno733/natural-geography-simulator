import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (path) => readFileSync(resolve(path), 'utf8')

describe('public crawl and keyboard entry points', () => {
  it('publishes canonical metadata and sitemap links only to public pages', () => {
    const html = read('index.html')
    const sitemap = read('public/sitemap.xml')
    const robots = read('public/robots.txt')
    expect(html).toContain('<link rel="canonical" href="https://geo.kongnoma279.com/"')
    expect(html).toContain('property="og:title"')
    expect(sitemap).toContain('<loc>https://geo.kongnoma279.com/</loc>')
    expect(sitemap).toContain('<loc>https://geo.kongnoma279.com/privacy.html</loc>')
    expect(sitemap).toContain('<loc>https://geo.kongnoma279.com/terms.html</loc>')
    expect(robots).toContain('Sitemap: https://geo.kongnoma279.com/sitemap.xml')
  })

  it('provides a skip link and a programmatically focusable main landmark', () => {
    const app = read('src/App.vue')
    const styles = read('src/style.css')
    expect(app).toContain('class="skip-link" href="#main-content" @click.prevent="skipToMain"')
    expect(app).toContain('<main id="main-content" class="app-main" tabindex="-1">')
    expect(app).toContain("document.getElementById('main-content')?.focus()")
    expect(styles).toContain('.skip-link:focus')
  })
})
