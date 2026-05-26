import { getKarstEntry } from './knowledge.js'
export const karstModule = {
  id: 'karst', name: '岩溶地貌', icon: '🕳',
  onRegister(engine) {},
  onActivate(engine) { engine.update({ activeType: 'fenglin' }) },
  onDeactivate() {},
  getKnowledge(type) { return getKarstEntry(type) },
  getRiverTypes() {
    return [
      { id: 'fenglin', name: '峰林' }, { id: 'sinkhole', name: '溶斗/天坑' },
      { id: 'cave', name: '溶洞' }, { id: 'polje', name: '坡立谷' },
      { id: 'underground_river', name: '地下河' }
    ]
  }
}
