import { getFluvialEntry } from './knowledge.js'

export const fluvialModule = {
  id: 'fluvial',
  name: '河流地貌',
  icon: '🌊',
  onRegister(engine) {},
  onActivate(engine) { engine.update({ activeType: 'consequent' }) },
  onDeactivate() {},
  getKnowledge(type) { return getFluvialEntry(type) },
  getRiverTypes() {
    return [
      { id: 'consequent', name: '顺应河' },
      { id: 'subsequent', name: '后成河' },
      { id: 'obsequent', name: '偶成河' },
      { id: 'resequent', name: '再顺河' },
      { id: 'insequent', name: '随意河' },
      { id: 'antecedent', name: '先成河' },
      { id: 'superimposed', name: '叠置河' }
    ]
  }
}
