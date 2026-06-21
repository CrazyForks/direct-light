import type { Store, StoreSet } from '../storeTypes'
import type { LightingPreset } from '../../types'
import { buildDefaultScene } from '../../data/defaults'
import { normalizePreset, normalizeScene } from '../../domain/sceneMigration'
import { newId, savePresets } from '../../lib/storage'

export function createPresetActions(
  set: StoreSet,
): Pick<
  Store,
  'resetScene' | 'applyDebugPreset' | 'savePreset' | 'loadPreset' | 'duplicatePreset' | 'renamePreset' | 'deletePreset'
> {
  return {
    resetScene: () => set({ scene: buildDefaultScene(), selection: { kind: 'light', id: 'light-key' } }),

    applyDebugPreset: (id) =>
      set((s) => {
        const scene = structuredClone(s.scene)
        const byId = (lid: string) => scene.lights.find((l) => l.id === lid) ?? scene.lights[0]
        const key = byId('light-key')
        const fill = scene.lights.find((l) => l.id === 'light-fill')
        const rim = scene.lights.find((l) => l.id === 'light-rim')

        if (id === 'low-key-hard') {
          if (key) {
            key.type = 'hard'
            key.position = { x: 2.8, y: 1.8, z: 2.4 }
            key.intensity = 2.0
            key.softness = 0.1
            key.beamAngle = 30
            key.color = '#ffffff'
            key.colorTemperature = 5600
            key.enabled = true
          }
          if (fill) fill.enabled = false
          if (rim) rim.enabled = false
          scene.studio.wallReflectance = 0.25
        } else if (id === 'high-soft') {
          if (key) {
            key.type = 'soft'
            key.position = { x: 2.8, y: 3.2, z: 2.4 }
            key.intensity = 1.8
            key.softness = 0.75
            key.beamAngle = 55
            key.color = '#ffffff'
            key.colorTemperature = 5600
            key.enabled = true
          }
          if (fill) {
            fill.enabled = true
            fill.intensity = 0.7
          }
          if (rim) rim.enabled = false
          scene.studio.wallReflectance = 0.7
        } else if (id === 'rgb-rim') {
          if (key) {
            key.type = 'soft'
            key.position = { x: 0.6, y: 1.9, z: 3.2 }
            key.intensity = 0.9
            key.softness = 0.7
            key.color = '#ffffff'
            key.colorTemperature = 5600
            key.enabled = true
          }
          if (fill) fill.enabled = false
          if (rim) {
            rim.enabled = true
            rim.color = '#2f6bff'
            rim.colorTemperature = undefined
            rim.intensity = 1.15
          }
          scene.studio.wallReflectance = 0.55
        }
        return { scene }
      }),

    savePreset: (name, previewImage) =>
      set((s) => {
        const preset: LightingPreset = {
          id: newId('preset'),
          name: name.trim() || `方案 ${s.presets.length + 1}`,
          sceneSnapshot: structuredClone(s.scene),
          previewImage,
          createdAt: Date.now(),
        }
        const presets = [...s.presets, preset]
        savePresets(presets)
        return { presets }
      }),

    loadPreset: (id) =>
      set((s) => {
        const preset = s.presets.find((p) => p.id === id)
        if (!preset) return s
        return { scene: normalizeScene(preset.sceneSnapshot), selection: null }
      }),

    duplicatePreset: (id) =>
      set((s) => {
        const preset = s.presets.find((p) => p.id === id)
        if (!preset) return s
        const copy: LightingPreset = {
          ...normalizePreset(structuredClone(preset)),
          id: newId('preset'),
          name: `${preset.name} Copy`,
          createdAt: Date.now(),
        }
        const presets = [...s.presets, copy]
        savePresets(presets)
        return { presets }
      }),

    renamePreset: (id, name) =>
      set((s) => {
        const presets = s.presets.map((p) => (p.id === id ? { ...p, name } : p))
        savePresets(presets)
        return { presets }
      }),

    deletePreset: (id) =>
      set((s) => {
        const presets = s.presets.filter((p) => p.id !== id)
        savePresets(presets)
        return { presets }
      }),
  }
}
