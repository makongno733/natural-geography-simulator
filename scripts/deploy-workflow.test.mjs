import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

describe('GitHub Pages deploy workflow', () => {
  test('keeps previous hashed assets during deploys to avoid cached HTML white screens', () => {
    const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8')

    expect(workflow).toContain('peaceiris/actions-gh-pages@v4')
    expect(workflow).toMatch(/keep_files:\s*true/)
  })
})
