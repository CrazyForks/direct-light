import type { Store, StoreSet } from '../storeTypes'

export function createViewActions(set: StoreSet): Pick<Store, 'select' | 'setViewMode' | 'setDragTarget'> {
  return {
    select: (selection) => set({ selection }),
    setViewMode: (viewMode) => set({ viewMode, dragTarget: null }),
    setDragTarget: (dragTarget) => set({ dragTarget }),
  }
}
