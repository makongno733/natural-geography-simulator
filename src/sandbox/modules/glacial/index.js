import { getGlacialEntry } from './knowledge.js'
export const glacialModule = {
  id: 'glacial', name: '冰川地貌', icon: '❄️',
  onRegister(engine) {},
  onActivate(engine) { engine.update({ activeType: 'u_valley' }) },
  onDeactivate() {},
  getKnowledge(type) { return getGlacialEntry(type) },
  getRiverTypes() {
    return [
      { id: 'u_valley', name: 'U 形谷' }, { id: 'cirque', name: '冰斗' },
      { id: 'arete', name: '刃脊' }, { id: 'moraine', name: '冰碛垄' },
      { id: 'fjord', name: '峡湾' }, { id: 'horn', name: '角峰' }
    ]
  }
}
