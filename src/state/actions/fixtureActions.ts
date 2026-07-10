// v0.9c — custom fixture library actions. Wires the v0.9a/b pure helpers to the
// store + localStorage. "存当前灯为器械", import/export packs, and remove.
import type { Store, StoreGet, StoreSet } from '../storeTypes'
import { mapLights } from '../storeHelpers'
import { buildCustomFixtureFromLight, findFixtureById } from '../../domain/customFixtures'
import { parseCustomFixturePack, serializeCustomFixturePack } from '../../domain/customFixturePack'
import { newId, saveCustomFixtures } from '../../lib/storage'

export function createFixtureActions(
  set: StoreSet,
  get: StoreGet,
): Pick<Store, 'saveCurrentLightAsFixture' | 'removeCustomFixture' | 'importCustomFixtures' | 'exportCustomFixtures'> {
  return {
    saveCurrentLightAsFixture: (lightId, name) => {
      const s = get()
      const light = s.scene.lights.find((l) => l.id === lightId)
      if (!light) return false
      // Carry over real-world metadata when this light already came from a fixture.
      const baseFixture = findFixtureById(light.fixturePresetId, s.customFixtures)
      const fixture = buildCustomFixtureFromLight(light, {
        name,
        id: newId('fixture'),
        now: Date.now(),
        baseFixture,
      })
      const customFixtures = [...s.customFixtures, fixture]
      if (!saveCustomFixtures(customFixtures)) return false
      // Point the saved light at the new fixture (params already match, so this
      // only sets the marker).
      set({
        customFixtures,
        scene: {
          ...s.scene,
          lights: mapLights(s.scene.lights, lightId, (l) => ({ ...l, fixturePresetId: fixture.id })),
        },
      })
      return true
    },

    removeCustomFixture: (fixtureId) => {
      const s = get()
      const customFixtures = s.customFixtures.filter((fixture) => fixture.id !== fixtureId)
      if (customFixtures.length === s.customFixtures.length || !saveCustomFixtures(customFixtures)) {
        return false
      }
      set({
        customFixtures,
        scene: {
          ...s.scene,
          // Clear the soft marker on referencing lights; keep their raw params.
          lights: s.scene.lights.map((light) =>
            light.fixturePresetId === fixtureId ? { ...light, fixturePresetId: undefined } : light,
          ),
        },
      })
      return true
    },

    importCustomFixtures: (text) => {
      const s = get()
      const takenIds = new Set(s.customFixtures.map((f) => f.id))
      const res = parseCustomFixturePack(text, { now: Date.now(), takenIds })
      if (res.fixtures.length > 0) {
        const customFixtures = [...s.customFixtures, ...res.fixtures]
        if (!saveCustomFixtures(customFixtures)) {
          return { added: 0, errors: res.errors, warnings: res.warnings, persisted: false }
        }
        set({ customFixtures })
      }
      return {
        added: res.fixtures.length,
        errors: res.errors,
        warnings: res.warnings,
        persisted: true,
      }
    },

    exportCustomFixtures: () => serializeCustomFixturePack(get().customFixtures, { now: Date.now() }),
  }
}
