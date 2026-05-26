import { getStructuralEntry } from './knowledge.js'
export const structuralModule = {
  id: 'structural', name: '构造地貌', icon: '🏔',
  onRegister(engine) {},
  onActivate(engine) { engine.update({ activeType: 'fault_scarp' }) },
  onDeactivate() {},
  getKnowledge(type) { return getStructuralEntry(type) },
  getRiverTypes() {
    return [
      { id: 'fault_scarp', name: '断层崖' }, { id: 'fold_mountain', name: '褶皱山' },
      { id: 'block_mountain', name: '断块山' }, { id: 'rift_valley', name: '裂谷' },
      { id: 'unconformity', name: '不整合' }
    ]
  }
}
