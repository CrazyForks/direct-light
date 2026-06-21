import type { Store, StoreSet } from '../storeTypes'

export function createStudioActions(set: StoreSet): Pick<Store, 'updateStudio'> {
  return {
    updateStudio: (patch) =>
      set((s) => ({ scene: { ...s.scene, studio: { ...s.scene.studio, ...patch } } })),
  }
}
