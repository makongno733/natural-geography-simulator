import { getClimateEntry } from './knowledge.js'
export const climateModule = {
  id: 'climate', name: '气候地貌', icon: '🌍',
  onRegister(engine) {},
  onActivate(engine) { engine.update({ activeType: 'periglacial' }) },
  onDeactivate() {},
  getKnowledge(type) { return getClimateEntry(type) },
  getRiverTypes() {
    return [
      { id: 'periglacial', name: '冰缘地貌' }, { id: 'fluvial_climate', name: '气候-河流' },
      { id: 'arid', name: '干旱区' }, { id: 'humidity', name: '湿润区' },
      { id: 'quaternary', name: '第四纪气候' }
    ]
  }
}
