import type { Store, StoreSet, StoreGet } from '../storeTypes'
import type { SceneObjectConfig } from '../../types'
import { carryBoundPeople, detachPeopleFrom } from '../storeHelpers'
import { SCENE_OBJECT_PRESETS } from '../../data/sceneObjects'
import { MAX_OBJECTS } from '../../data/defaults'
import { newId } from '../../lib/storage'

export function createObjectActions(
  set: StoreSet,
  get: StoreGet,
): Pick<
  Store,
  | 'addObject'
  | 'duplicateObject'
  | 'removeObject'
  | 'updateObject'
  | 'setObjectPositionXZ'
  | 'rotateObject'
  | 'toggleObjectVisibility'
> {
  return {
    addObject: (presetId) => {
      const s = get()
      if (s.scene.objects.length >= MAX_OBJECTS) return
      const preset = SCENE_OBJECT_PRESETS.find((p) => p.id === presetId)
      if (!preset) return
      const id = newId('object')
      const obj: SceneObjectConfig = {
        id,
        name: preset.label,
        kind: preset.kind,
        geometry: preset.geometry,
        position: { ...preset.defaultPosition },
        rotationY: preset.defaultRotationY,
        size: { ...preset.size },
        color: preset.color,
        material: preset.material,
        castShadow: preset.castShadow,
        receiveShadow: preset.receiveShadow,
        visible: true,
        showLabel: preset.showLabel,
      }
      set({ scene: { ...s.scene, objects: [...s.scene.objects, obj] }, selection: { kind: 'object', id } })
    },

    duplicateObject: (id) => {
      const s = get()
      if (s.scene.objects.length >= MAX_OBJECTS) return
      const src = s.scene.objects.find((o) => o.id === id)
      if (!src) return
      const newObjectId = newId('object')
      const copy: SceneObjectConfig = {
        ...structuredClone(src),
        id: newObjectId,
        name: `${src.name} Copy`,
        position: { ...src.position, x: Math.max(-3.8, Math.min(3.8, src.position.x + 0.5)) },
      }
      set({ scene: { ...s.scene, objects: [...s.scene.objects, copy] }, selection: { kind: 'object', id: newObjectId } })
    },

    removeObject: (id) =>
      set((s) => {
        const objects = s.scene.objects.filter((o) => o.id !== id)
        const selection =
          s.selection?.kind === 'object' && s.selection.id === id
            ? objects[0]
              ? { kind: 'object' as const, id: objects[0].id }
              : null
            : s.selection
        // Deleting the support leaves bound people with a dangling reference —
        // strip the binding so they fall back to standing at their current XZ/Y.
        const people = detachPeopleFrom(s.scene.people, id)
        return { scene: { ...s.scene, objects, people }, selection }
      }),

    updateObject: (id, patch) =>
      set((s) => {
        const objects = s.scene.objects.map((o) => (o.id === id ? { ...o, ...patch } : o))
        // Any patch that touches position / size / visibility can change a bound
        // person's Y or XZ. Recompute them all — recomputePersonFromSupport is a
        // cheap handful of arithmetic ops per bound person.
        const people = carryBoundPeople(objects, s.scene.people)
        return { scene: { ...s.scene, objects, people } }
      }),

    setObjectPositionXZ: (id, x, z) =>
      set((s) => {
        const objects = s.scene.objects.map((o) => (o.id === id ? { ...o, position: { ...o.position, x, z } } : o))
        const people = carryBoundPeople(objects, s.scene.people)
        return { scene: { ...s.scene, objects, people } }
      }),

    rotateObject: (id, rotationY) =>
      set((s) => {
        const objects = s.scene.objects.map((o) => (o.id === id ? { ...o, rotationY } : o))
        const people = carryBoundPeople(objects, s.scene.people)
        return { scene: { ...s.scene, objects, people } }
      }),

    toggleObjectVisibility: (id) =>
      set((s) => ({
        scene: { ...s.scene, objects: s.scene.objects.map((o) => (o.id === id ? { ...o, visible: !o.visible } : o)) },
      })),
  }
}
