import { getCoastalEntry } from './knowledge.js'
export const coastalModule = {
  id: 'coastal', name: '海岸地貌', icon: '🌊',
  onRegister(engine) {},
  onActivate(engine) { engine.update({ activeType: 'wave_cut' }) },
  onDeactivate() {},
  getKnowledge(type) { return getCoastalEntry(type) },
  getRiverTypes() {
    return [
      { id: 'wave_cut', name: '海蚀崖/台' }, { id: 'beach', name: '海滩' },
      { id: 'spit_bar', name: '沙嘴/沙坝' }, { id: 'delta', name: '三角洲' },
      { id: 'estuary', name: '河口湾' }
    ]
  }
}
