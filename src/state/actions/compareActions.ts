import type { Store, StoreSet } from '../storeTypes'
import { normalizeScene } from '../../domain/sceneMigration'

export function createCompareActions(set: StoreSet): Pick<Store, 'setCompareB' | 'freezeCompareB' | 'swapCompare'> {
  return {
    setCompareB: (compareB) =>
      set({
        compareB: compareB
          ? { name: compareB.name, scene: normalizeScene(compareB.scene), frozenAt: compareB.frozenAt ?? Date.now() }
          : null,
      }),

    freezeCompareB: () =>
      set((s) => ({ compareB: { name: '冻结快照', scene: structuredClone(s.scene), frozenAt: Date.now() } })),

    swapCompare: () =>
      set((s) => {
        if (!s.compareB) return s
        const prevA = structuredClone(s.scene)
        return {
          scene: normalizeScene(s.compareB.scene),
          compareB: {
            name: 'A（交换前）',
            scene: normalizeScene(prevA),
            frozenAt: Date.now(), // swap counts as a fresh B
          },
          selection: null,
        }
      }),
  }
}
