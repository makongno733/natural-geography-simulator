import { getVolcanicEntry } from './knowledge.js'
export const volcanicModule = {
  id: 'volcanic', name: '火山地貌', icon: '🌋',
  onRegister(engine) {},
  onActivate(engine) { engine.update({ activeType: 'shield_volcano' }) },
  onDeactivate() {},
  getKnowledge(type) { return getVolcanicEntry(type) },
  getRiverTypes() {
    return [
      { id: 'shield_volcano', name: '盾状火山' }, { id: 'stratovolcano', name: '层状火山' },
      { id: 'caldera', name: '破火山口' }, { id: 'lava_plateau', name: '熔岩高原' },
      { id: 'volcanic_neck', name: '火山颈' }
    ]
  }
}
