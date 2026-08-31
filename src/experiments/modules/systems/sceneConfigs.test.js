import { describe, expect, it } from 'vitest'
import { getHumanEnvironmentConfig, getSpatialNetworkConfig } from './sceneConfigs.js'

describe('system sandbox scene configs', () => {
  it('turns the transport preset into weighted network flows', () => {
    const config = getSpatialNetworkConfig({ id: 'transport-network', params: { intensity: 0.8 } })
    expect(config.nodes.length).toBeGreaterThanOrEqual(4)
    expect(config.flows.every((flow) => flow.width > 0)).toBe(true)
    expect(config.camera).toEqual(expect.objectContaining({ preset: 'orbit' }))
  })

  it('turns resource security into stocks, flows and feedbacks', () => {
    const config = getHumanEnvironmentConfig({ id: 'resource-security', params: { pressure: 0.7 } })
    expect(config.stocks.map((item) => item.id)).toContain('resource-base')
    expect(config.feedbacks.length).toBeGreaterThan(0)
    expect(config.thresholds.length).toBeGreaterThan(0)
  })

  it('resolves every spatial-network preset with at least four positioned nodes', () => {
    const ids = [
      'regional-connections', 'population-distribution', 'population-system',
      'urban-system', 'industry-location', 'transport-network', 'regional-system',
      'city-industry-region', 'regional-coordination', 'regional-development',
    ]
    ids.forEach((id) => {
      const config = getSpatialNetworkConfig({ id, params: {} })
      expect(config.nodes.length).toBeGreaterThanOrEqual(4)
      expect(config.nodes.every((node) => node.id && node.position?.length === 3)).toBe(true)
      expect(config.flows.every((flow) => flow.width > 0)).toBe(true)
    })
  })

  it('resolves every human-environment preset with stocks, feedbacks and thresholds', () => {
    const ids = [
      'resource-system', 'sustainable-development', 'natural-zonation',
      'regional-resource', 'ecosystem-services', 'resource-security',
      'environmental-security', 'environmental-governance',
    ]
    ids.forEach((id) => {
      const config = getHumanEnvironmentConfig({ id, params: {} })
      expect(config.stocks.length).toBeGreaterThan(0)
      expect(config.feedbacks.length).toBeGreaterThan(0)
      expect(config.thresholds.length).toBeGreaterThan(0)
      expect(config.stocks.map((item) => item.id)).toContain('resource-base')
    })
  })
})
