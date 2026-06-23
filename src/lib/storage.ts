// LocalStorage persistence for saved lighting presets and custom fixtures.

import type { CustomFixturePreset, LightingPreset } from '../types'

const PRESETS_KEY = 'direct-light.presets.v1'
const CUSTOM_FIXTURES_KEY = 'direct-light.customFixtures.v1'

export function loadPresets(): LightingPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as LightingPreset[]) : []
  } catch {
    return []
  }
}

export function savePresets(presets: LightingPreset[]): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
  } catch {
    // Quota or serialization issues are non-fatal for the prototype.
  }
}

// v0.9c: the user's custom fixture library (already-normalized entries; we only
// ever write CustomFixturePreset objects here).
export function loadCustomFixtures(): CustomFixturePreset[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FIXTURES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CustomFixturePreset[]) : []
  } catch {
    return []
  }
}

export function saveCustomFixtures(fixtures: CustomFixturePreset[]): void {
  try {
    localStorage.setItem(CUSTOM_FIXTURES_KEY, JSON.stringify(fixtures))
  } catch {
    // Quota or serialization issues are non-fatal for the prototype.
  }
}

export function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${rand}`
}
