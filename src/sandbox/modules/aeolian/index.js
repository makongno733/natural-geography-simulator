import { getAeolianEntry } from './knowledge.js'
export const aeolianModule = {
  id: 'aeolian', name: '风成地貌', icon: '🌪',
  onRegister(engine) {},
  onActivate(engine) { engine.update({ activeType: 'dune' }) },
  onDeactivate() {},
  getKnowledge(type) { return getAeolianEntry(type) },
  getRiverTypes() {
    return [
      { id: 'dune', name: '沙丘' }, { id: 'yardang', name: '雅丹' },
      { id: 'loess', name: '黄土' }, { id: 'ventifact', name: '风棱石' },
      { id: 'deflation', name: '风蚀盆地' }
    ]
  }
}
