import type { Store, StoreSet, StoreGet } from '../storeTypes'
import { CLEAR_SUPPORT_BINDING } from '../../domain/supportSurfaces'
import { buildPersonFromPreset, MAX_PEOPLE } from '../../data/defaults'
import { newId } from '../../lib/storage'

export function createPersonActions(
  set: StoreSet,
  get: StoreGet,
): Pick<Store, 'updatePerson' | 'setPersonPositionXZ' | 'addPerson' | 'duplicatePerson' | 'removePerson' | 'rotatePerson'> {
  return {
    updatePerson: (id, patch) =>
      set((s) => ({
        scene: {
          ...s.scene,
          people: s.scene.people.map((p) => {
            if (p.id !== id) return p
            // Detach from support only when the position actually changes (e.g.
            // X/Y/Z sliders). Some pose updates carry the current position through
            // unchanged, and those should keep the live binding.
            const positionChanged =
              patch.position !== undefined &&
              (patch.position.x !== p.position.x || patch.position.y !== p.position.y || patch.position.z !== p.position.z)
            const shouldDetach = positionChanged && !('supportObjectId' in patch)
            const merged = { ...p, ...patch }
            if (shouldDetach) return { ...merged, ...CLEAR_SUPPORT_BINDING }

            // If the user rotates a bound person, keep the new facing direction as
            // the relative offset so later support rotation does not snap it back.
            if (patch.rotationY !== undefined && merged.supportObjectId && !('supportRotationOffset' in patch)) {
              const support = s.scene.objects.find((o) => o.id === merged.supportObjectId)
              if (support) return { ...merged, supportRotationOffset: patch.rotationY - support.rotationY }
            }

            return merged
          }),
        },
      })),

    setPersonPositionXZ: (id, x, z) =>
      set((s) => {
        // Keep a dragged person on the studio floor. The floor is finite (even
        // though the front +Z is open for the camera), so clamp XZ into the
        // footprint with a small margin — otherwise the pointer-ray can drag a
        // person right out of the white box. Margin matches duplicatePerson's
        // ±(halfW-0.2) convention.
        const margin = 0.3
        const halfW = s.scene.studio.width / 2
        const halfZ = s.scene.studio.depth / 2
        const cx = Math.min(Math.max(x, -(halfW - margin)), halfW - margin)
        const cz = Math.min(Math.max(z, -(halfZ - margin)), halfZ - margin)
        return {
          scene: {
            ...s.scene,
            people: s.scene.people.map((p) =>
              // Dragging a person manually in XZ means the user is intentionally
              // repositioning them — detach from any live support binding.
              p.id === id ? { ...p, position: { ...p.position, x: cx, z: cz }, ...CLEAR_SUPPORT_BINDING } : p,
            ),
          },
        }
      }),

    addPerson: () => {
      const s = get()
      if (s.scene.people.length >= MAX_PEOPLE) return
      const id = newId('person')
      const person = buildPersonFromPreset(s.scene.people.length, id)
      set({ scene: { ...s.scene, people: [...s.scene.people, person] }, selection: { kind: 'person', id } })
    },

    duplicatePerson: (id) => {
      const s = get()
      if (s.scene.people.length >= MAX_PEOPLE) return
      const src = s.scene.people.find((p) => p.id === id)
      if (!src) return
      const newPersonId = newId('person')
      const copy = {
        ...structuredClone(src),
        id: newPersonId,
        name: `${src.name} Copy`,
        position: { ...src.position, x: Math.max(-3.8, Math.min(3.8, src.position.x + 0.7)) },
        // The copy is shifted by +0.7 in X, so the source's supportLocalOffset
        // would no longer encode the copy's relative position — strip the
        // binding so future support moves don't snap the copy back.
        ...CLEAR_SUPPORT_BINDING,
      }
      set({ scene: { ...s.scene, people: [...s.scene.people, copy] }, selection: { kind: 'person', id: newPersonId } })
    },

    removePerson: (id) =>
      set((s) => {
        if (s.scene.people.length <= 1) return s
        const people = s.scene.people.filter((p) => p.id !== id)
        const selection =
          s.selection?.kind === 'person' && s.selection.id === id
            ? { kind: 'person' as const, id: people[0].id }
            : s.selection
        return { scene: { ...s.scene, people }, selection }
      }),

    rotatePerson: (id, rotationY) =>
      set((s) => ({
        scene: {
          ...s.scene,
          people: s.scene.people.map((p) => {
            if (p.id !== id) return p
            const support = p.supportObjectId ? s.scene.objects.find((o) => o.id === p.supportObjectId) : undefined
            return {
              ...p,
              rotationY,
              ...(support ? { supportRotationOffset: rotationY - support.rotationY } : {}),
            }
          }),
        },
      })),
  }
}
