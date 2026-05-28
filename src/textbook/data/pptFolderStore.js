import { ref } from 'vue'

const localPptResources = ref([])
const localFolderLoaded = ref(false)

export function usePptFolderStore() {
  function setLocalPptResources(resources) {
    localPptResources.value = Array.isArray(resources) ? resources : []
    localFolderLoaded.value = localPptResources.value.length > 0
  }

  function clearLocalPptResources() {
    localPptResources.value = []
    localFolderLoaded.value = false
  }

  return {
    localPptResources,
    localFolderLoaded,
    setLocalPptResources,
    clearLocalPptResources
  }
}
