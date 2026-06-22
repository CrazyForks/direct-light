import type { Store, StoreSet, StoreGet } from '../storeTypes'
import type { LightConfig } from '../../types'
import { mapLights, chestTarget } from '../storeHelpers'
import { getPeopleCenterAimTarget } from '../../domain/lightTargets'
import { ADDITIONAL_LIGHT_STARTS, LIGHT_TYPE_DEFAULTS, PERSON_TARGET } from '../../data/rendering'
import { MAX_LIGHTS } from '../../data/defaults'
import { FIXTURE_PRESETS } from '../../data/fixturePresets'
import { LIGHT_MODIFIER_PRESETS } from '../../data/lightModifiers'
import { newId } from '../../lib/storage'

export function createLightActions(
  set: StoreSet,
  get: StoreGet,
): Pick<
  Store,
  | 'updateLight'
  | 'setLightPositionXZ'
  | 'toggleLight'
  | 'addLight'
  | 'duplicateLight'
  | 'removeLight'
  | 'aimLightAtPerson'
  | 'setLightTargetMode'
  | 'applyFixturePreset'
  | 'applyLightModifier'
> {
  return {
    updateLight: (id, patch) =>
      set((s) => ({ scene: { ...s.scene, lights: mapLights(s.scene.lights, id, (l) => ({ ...l, ...patch })) } })),

    setLightPositionXZ: (id, x, z) =>
      set((s) => ({
        scene: {
          ...s.scene,
          lights: mapLights(s.scene.lights, id, (l) => ({ ...l, position: { ...l.position, x, z } })),
        },
      })),

    toggleLight: (id) =>
      set((s) => ({
        scene: { ...s.scene, lights: mapLights(s.scene.lights, id, (l) => ({ ...l, enabled: !l.enabled })) },
      })),

    addLight: () => {
      const s = get()
      if (s.scene.lights.length >= MAX_LIGHTS) return
      const id = newId('light')
      const person = s.scene.people[0]
      const base = LIGHT_TYPE_DEFAULTS.soft
      // v0.8a — 4th–6th added lights use deterministic non-overlapping starts; earlier lights keep the default.
      const slot = s.scene.lights.length - 3
      const start =
        slot >= 0 && slot < ADDITIONAL_LIGHT_STARTS.length
          ? ADDITIONAL_LIGHT_STARTS[slot]
          : { x: -2.6, y: 2.4, z: 2.2 }
      const light: LightConfig = {
        id,
        name: `Light ${s.scene.lights.length + 1}`,
        type: 'soft',
        enabled: true,
        position: { ...start },
        target: person ? chestTarget(person) : { ...PERSON_TARGET },
        targetMode: 'manual',
        targetPersonId: person?.id,
        intensity: base.intensity,
        color: '#ffffff',
        colorTemperature: 5600,
        beamAngle: 50,
        softness: base.softness,
        distance: base.distance,
      }
      set({ scene: { ...s.scene, lights: [...s.scene.lights, light] }, selection: { kind: 'light', id } })
    },

    duplicateLight: (id) => {
      const s = get()
      if (s.scene.lights.length >= MAX_LIGHTS) return
      const src = s.scene.lights.find((l) => l.id === id)
      if (!src) return
      const newLightId = newId('light')
      const copy: LightConfig = {
        ...structuredClone(src),
        id: newLightId,
        name: `${src.name} Copy`,
        position: { ...src.position, x: src.position.x - 0.6 },
      }
      set({ scene: { ...s.scene, lights: [...s.scene.lights, copy] }, selection: { kind: 'light', id: newLightId } })
    },

    removeLight: (id) =>
      set((s) => {
        const lights = s.scene.lights.filter((l) => l.id !== id)
        const selection =
          s.selection?.kind === 'light' && s.selection.id === id
            ? lights[0]
              ? { kind: 'light' as const, id: lights[0].id }
              : null
            : s.selection
        return { scene: { ...s.scene, lights }, selection }
      }),

    aimLightAtPerson: (id, personId) =>
      set((s) => {
        const person = s.scene.people.find((p) => p.id === personId) ?? s.scene.people[0]
        if (!person) return s
        const target = chestTarget(person)
        return {
          scene: {
            ...s.scene,
            lights: mapLights(s.scene.lights, id, (l) => ({
              ...l,
              target,
              targetMode: 'manual',
              targetPersonId: person.id,
            })),
          },
        }
      }),

    setLightTargetMode: (id, mode, personId) =>
      set((s) => {
        const people = s.scene.people
        return {
          scene: {
            ...s.scene,
            lights: mapLights(s.scene.lights, id, (l) => {
              const targetPerson =
                people.find((p) => p.id === personId) ??
                people.find((p) => p.id === l.targetPersonId) ??
                people[0]
              const currentTarget =
                l.targetMode === 'person' && targetPerson
                  ? chestTarget(targetPerson)
                  : l.targetMode === 'peopleCenter'
                    ? getPeopleCenterAimTarget(people) ?? l.target
                    : l.target
              const target =
                mode === 'person' && targetPerson
                  ? chestTarget(targetPerson)
                  : mode === 'peopleCenter'
                    ? getPeopleCenterAimTarget(people) ?? l.target
                    : currentTarget

              return {
                ...l,
                target,
                targetMode: mode,
                targetPersonId: mode === 'person' ? targetPerson?.id : l.targetPersonId,
              }
            }),
          },
        }
      }),

    applyFixturePreset: (lightId, fixturePresetId) =>
      set((s) => {
        // undefined / empty → back to 自定义参数: only clear the marker, keep params
        if (!fixturePresetId) {
          return {
            scene: {
              ...s.scene,
              lights: mapLights(s.scene.lights, lightId, (l) => ({ ...l, fixturePresetId: undefined })),
            },
          }
        }
        const preset = FIXTURE_PRESETS.find((p) => p.id === fixturePresetId)
        if (!preset) return s // unknown id → no-op
        const d = preset.directLightDefaults
        // seed only the光质 params; keep id/name/enabled/position/target/targetMode/targetPersonId
        return {
          scene: {
            ...s.scene,
            lights: mapLights(s.scene.lights, lightId, (l) => ({
              ...l,
              fixturePresetId,
              type: d.type,
              intensity: d.intensity,
              beamAngle: d.beamAngle,
              softness: d.softness,
              distance: d.distance,
              color: d.color,
              colorTemperature: d.colorTemperature,
            })),
          },
        }
      }),

    applyLightModifier: (lightId, modifierId) =>
      set((s) => {
        // undefined / empty → 无附件: only clear the marker, keep raw params
        if (!modifierId) {
          return {
            scene: {
              ...s.scene,
              lights: mapLights(s.scene.lights, lightId, (l) => ({ ...l, modifierId: undefined })),
            },
          }
        }
        if (!LIGHT_MODIFIER_PRESETS.some((m) => m.id === modifierId)) return s // unknown id → no-op
        // only write modifierId; effective light quality is computed at render
        // (getEffectiveLightParams), the raw intensity/beamAngle/softness are kept.
        return {
          scene: {
            ...s.scene,
            lights: mapLights(s.scene.lights, lightId, (l) => ({ ...l, modifierId })),
          },
        }
      }),
  }
}
