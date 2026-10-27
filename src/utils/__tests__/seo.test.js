import { describe, it, expect, beforeEach } from 'vitest'
import { updatePageSeo } from '../seo.js'

describe('SEO and Schema.org Engine', () => {
  beforeEach(() => {
    document.title = ''
    const existingSchema = document.getElementById('geo-jsonld-schema')
    if (existingSchema) existingSchema.remove()
  })

  it('updates title, description and open graph tags for home route', () => {
    updatePageSeo('home')
    expect(document.title).toContain('地理共同体')

    const descMeta = document.querySelector('meta[name="description"]')
    expect(descMeta).not.toBeNull()
    expect(descMeta.getAttribute('content')).toContain('地理科学')

    const ogTitle = document.querySelector('meta[property="og:title"]')
    expect(ogTitle).not.toBeNull()
    expect(ogTitle.getAttribute('content')).toContain('地理共同体')
  })

  it('injects JSON-LD Schema.org structure', () => {
    updatePageSeo('experiments')
    const script = document.getElementById('geo-jsonld-schema')
    expect(script).not.toBeNull()

    const parsed = JSON.parse(script.textContent)
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed.provider.name).toBe('地理共同体')
  })

  it('supports custom title without claiming unsupported QA structured data', () => {
    updatePageSeo('community-post', {
      title: '关于青藏高原水文连通性探讨',
      desc: '深入分析高程与水系伪河网处理',
      isQA: true
    })
    expect(document.title).toContain('关于青藏高原水文连通性探讨')

    const script = document.getElementById('geo-jsonld-schema')
    const parsed = JSON.parse(script.textContent)
    expect(parsed['@type']).toBe('WebPage')
  })
})
